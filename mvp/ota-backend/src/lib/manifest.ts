/**
 * Local-JSON-file helpers for per-appId manifest read/write.
 *
 * Storage: one JSON document per app at `${DATA_DIR}/manifests/<appId>.json`
 * (was Cloudflare KV at key `manifest:<appId>`). See types.ts::Manifest.
 *
 * Writes are ATOMIC: we write to a temp file in the same directory and then
 * `rename()` over the target (rename is atomic on the same filesystem), so a
 * concurrent reader never observes a half-written file.
 *
 * CONCURRENCY (C7 / F-13): `publishBundle` keeps the same BEST-EFFORT optimistic
 * lock as the KV version (re-read + version compare + bounded retry). On a
 * single Node process backed by a local filesystem the lost-update window is
 * far smaller than KV's eventual-consistency window, but two truly-concurrent
 * publishes can still interleave their read-modify-write. Operationally:
 * PUBLISH SERIALLY — do NOT run parallel CI jobs that publish to the same
 * backend.
 */

import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { randomBytes } from 'node:crypto';
import type { BundleRecord, KnownAppId, Manifest } from '../types.js';

/** Max length of manifest.history; oldest entries roll off. */
export const MAX_HISTORY = 20;

/** Number of retry attempts after the first try when an optimistic-lock conflict is seen. */
export const MAX_PUBLISH_RETRIES = 2;

/** Base backoff (ms) for the exponential retry delay. */
const RETRY_BASE_DELAY_MS = 25;

/** Sub-directory under DATA_DIR holding the per-app manifest files. */
export const MANIFEST_SUBDIR = 'manifests';

/** Absolute path to an app's manifest file. */
export function manifestPath(dataDir: string, appId: string): string {
  // appId is an already-validated known id (a-z0-9 + dots), so it is a safe
  // filename. We still take only the basename as belt-and-braces against any
  // path separator sneaking in.
  return path.join(dataDir, MANIFEST_SUBDIR, `${path.basename(appId)}.json`);
}

/** Legacy KV key name — retained so older imports/tests keep resolving. */
export function manifestKey(appId: string): string {
  return `manifest:${appId}`;
}

/** Thrown by `publishBundle` when the optimistic lock keeps losing after retries. */
export class ManifestConflictError extends Error {
  constructor(message = 'manifest write conflict (concurrent publish)') {
    super(message);
    this.name = 'ManifestConflictError';
  }
}

/** Coerce an unknown manifest.version into a non-negative integer (defaults to 0). */
function normaliseVersion(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
}

/** Read manifest from disk. Returns `null` if absent or unparseable. */
export async function readManifest(dataDir: string, appId: string): Promise<Manifest | null> {
  let raw: string;
  try {
    raw = await fs.readFile(manifestPath(dataDir, appId), 'utf8');
  } catch (err) {
    // Missing file is the normal "no manifest yet" case.
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw err;
  }
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Manifest;
    if (!parsed || typeof parsed !== 'object') return null;
    // Tolerate missing fields by normalising.
    return {
      appId: parsed.appId,
      enabled: parsed.enabled !== false,
      current: parsed.current ?? null,
      history: Array.isArray(parsed.history) ? parsed.history : [],
      version: normaliseVersion(parsed.version),
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date(0).toISOString(),
    };
  } catch {
    return null;
  }
}

/**
 * Write manifest JSON to disk atomically (temp file + rename).
 *
 * The temp file is created in the SAME directory as the target so the final
 * `rename` stays on one filesystem (cross-device rename is not atomic and would
 * throw EXDEV). The parent directory is created on demand.
 */
export async function writeManifest(dataDir: string, manifest: Manifest): Promise<void> {
  const target = manifestPath(dataDir, manifest.appId);
  const dir = path.dirname(target);
  await fs.mkdir(dir, { recursive: true });

  const tmp = path.join(dir, `.${path.basename(target)}.${process.pid}.${randomBytes(6).toString('hex')}.tmp`);
  const data = JSON.stringify(manifest);
  try {
    await fs.writeFile(tmp, data, { encoding: 'utf8', mode: 0o600 });
    await fs.rename(tmp, target);
  } catch (err) {
    // Best-effort cleanup of the temp file on failure.
    await fs.rm(tmp, { force: true }).catch(() => {});
    throw err;
  }
}

/**
 * Append a new BundleRecord to manifest.current and shift the old current into history.
 * Caps history at MAX_HISTORY (drops oldest entries). Pure function — no I/O.
 *
 * Idempotency: if `base.current` already has the same version AND objectKey AND
 * checksum as `next`, the publish is treated as a no-op replay and the manifest
 * is returned unchanged (so a retried write doesn't append a duplicate history
 * entry). The `version` counter is still advanced by the caller only when an
 * actual change is written.
 */
export function appendBundle(
  existing: Manifest | null,
  appId: KnownAppId,
  next: BundleRecord,
): Manifest {
  const base: Manifest = existing ?? {
    appId,
    enabled: true,
    current: null,
    history: [],
    version: 0,
    updatedAt: new Date(0).toISOString(),
  };

  // Idempotent replay: identical current bundle → return as-is (no dup append).
  if (
    base.current &&
    base.current.version === next.version &&
    base.current.objectKey === next.objectKey &&
    base.current.checksum === next.checksum
  ) {
    return base;
  }

  const history = base.current ? [base.current, ...base.history] : [...base.history];
  return {
    appId,
    enabled: base.enabled !== false,
    current: next,
    history: history.slice(0, MAX_HISTORY),
    version: base.version,
    updatedAt: base.updatedAt,
  };
}

/** Sleep helper for retry backoff. */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Publish a bundle with a best-effort optimistic lock (C7 / F-13).
 *
 * Flow per attempt:
 *   1. read current manifest (version = Vn)
 *   2. compute the next manifest via appendBundle
 *   3. if the append was a no-op idempotent replay → return immediately
 *   4. write {…, version: Vn + 1}
 *   5. re-read; if the persisted version !== Vn + 1, someone else wrote
 *      concurrently → back off and retry from step 1
 *
 * After MAX_PUBLISH_RETRIES exhausted, throws ManifestConflictError (→ 409).
 *
 * On a single Node process + local FS, step 5 catches an interleaved writer
 * within the same process. It is a detection heuristic, not a hard guarantee,
 * so serial publishing remains the operational contract.
 */
export async function publishBundle(
  dataDir: string,
  appId: KnownAppId,
  next: BundleRecord,
): Promise<Manifest> {
  let lastConflict: Manifest | null = null;

  for (let attempt = 0; attempt <= MAX_PUBLISH_RETRIES; attempt++) {
    const existing = await readManifest(dataDir, appId);
    const baseVersion = existing?.version ?? 0;

    const merged = appendBundle(existing, appId, next);

    // Idempotent replay (same bundle already current): nothing to write.
    if (existing && merged === existing) {
      return existing;
    }

    const toWrite: Manifest = {
      ...merged,
      version: baseVersion + 1,
      updatedAt: new Date().toISOString(),
    };

    await writeManifest(dataDir, toWrite);

    // Verify our write is the one that landed (best-effort CAS via re-read).
    const after = await readManifest(dataDir, appId);
    if (after && after.version === toWrite.version) {
      return after;
    }

    // Conflict: another writer advanced the version. Back off and retry.
    lastConflict = after;
    if (attempt < MAX_PUBLISH_RETRIES) {
      await delay(RETRY_BASE_DELAY_MS * 2 ** attempt);
    }
  }

  throw new ManifestConflictError(
    `manifest for ${appId} kept changing under concurrent writes` +
      (lastConflict ? ` (last seen version ${lastConflict.version})` : ''),
  );
}

/** Create a fresh temp data dir (test helper). Returned path is caller-owned. */
export async function makeTempDataDir(prefix = 'mvp-ota-test-'): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), prefix));
}
