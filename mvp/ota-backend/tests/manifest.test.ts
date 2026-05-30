/**
 * Unit tests for the manifest layer's best-effort optimistic lock (C7 / F-13).
 *
 *   - version counter increments on each successful publish
 *   - idempotent replay (same version+objectKey+checksum) does NOT duplicate history
 *   - a simulated concurrent write triggers a retry, then succeeds
 *   - an unrelenting conflict exhausts retries and throws ManifestConflictError
 *
 * Storage is a temp DATA_DIR (node:fs.mkdtemp). Concurrency is simulated by
 * spying on `fs.promises.readFile` and tampering the JSON it returns on a chosen
 * call — the file-store analogue of the old KV `get` wrapper.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  publishBundle,
  readManifest,
  ManifestConflictError,
  MAX_PUBLISH_RETRIES,
} from '../src/lib/manifest';
import type { BundleRecord } from '../src/types';

const APP_ID = 'io.plantdoctor.app';

let dataDir: string;

function bundle(version: string, suffix = ''): BundleRecord {
  return {
    version,
    uploadedAt: new Date().toISOString(),
    objectKey: `mvp-ota/${APP_ID}/${version}${suffix}.zip`,
    checksum: 'a'.repeat(64),
  };
}

beforeEach(async () => {
  dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'mvp-ota-manifest-'));
});

afterEach(async () => {
  vi.restoreAllMocks();
  await fs.rm(dataDir, { recursive: true, force: true });
});

/**
 * Wrap `fs.promises.readFile` so that each read of a UTF-8 string runs
 * `mutateRaw(raw, getCall)` before returning. `mutateRaw` may return a tampered
 * JSON string to simulate a concurrent writer landing between our write and
 * verify. Non-manifest reads pass through untouched.
 */
function installReadConflictInjection(
  mutateRaw: (raw: string, getCall: number) => string,
): { getCalls: () => number } {
  let getCalls = 0;
  const real = fs.readFile.bind(fs) as (...a: unknown[]) => Promise<string | Buffer>;
  const impl = async (...args: unknown[]): Promise<string | Buffer> => {
    const result = await real(...args);
    // Only tamper the manifest JSON reads (utf8 string results).
    if (typeof result === 'string') {
      getCalls++;
      return mutateRaw(result, getCalls);
    }
    return result;
  };
  vi.spyOn(fs, 'readFile').mockImplementation(impl as unknown as typeof fs.readFile);
  return { getCalls: () => getCalls };
}

describe('publishBundle optimistic lock', () => {
  it('increments version on each successful publish', async () => {
    const m1 = await publishBundle(dataDir, APP_ID, bundle('0.0.1'));
    expect(m1.version).toBe(1);
    expect(m1.current?.version).toBe('0.0.1');
    expect(typeof m1.updatedAt).toBe('string');

    const m2 = await publishBundle(dataDir, APP_ID, bundle('0.0.2'));
    expect(m2.version).toBe(2);
    expect(m2.current?.version).toBe('0.0.2');
    expect(m2.history).toHaveLength(1);
    expect(m2.history[0]?.version).toBe('0.0.1');
  });

  it('is idempotent: re-publishing the identical bundle does not duplicate history or bump version', async () => {
    const rec = bundle('0.0.1');
    const first = await publishBundle(dataDir, APP_ID, rec);
    expect(first.version).toBe(1);
    expect(first.history).toHaveLength(0);

    // Exact same record again → no-op replay.
    const replay = await publishBundle(dataDir, APP_ID, { ...rec });
    expect(replay.version).toBe(1); // unchanged
    expect(replay.history).toHaveLength(0); // not appended to history
    expect(replay.current?.version).toBe('0.0.1');

    // A genuinely new version still appends.
    const next = await publishBundle(dataDir, APP_ID, bundle('0.0.2'));
    expect(next.version).toBe(2);
    expect(next.history).toHaveLength(1);
  });

  it('retries once on a simulated concurrent write, then succeeds', async () => {
    // Seed an existing manifest at version 1.
    await publishBundle(dataDir, APP_ID, bundle('0.0.1'));

    // Sequence per attempt: read #1 = pre-write read, read #2 = post-write verify.
    // Inject the conflict exactly once, on the first post-write verify (read #2),
    // so the writer detects it, retries, and the second attempt succeeds.
    let injected = false;
    installReadConflictInjection((raw, call) => {
      if (!injected && call === 2) {
        injected = true;
        const parsed = JSON.parse(raw);
        parsed.version = parsed.version + 1; // pretend someone else bumped it
        return JSON.stringify(parsed);
      }
      return raw;
    });

    const result = await publishBundle(dataDir, APP_ID, bundle('0.0.2'));
    expect(injected).toBe(true); // the conflict path was exercised
    expect(result.current?.version).toBe('0.0.2');
    // Final persisted version should reflect a real successful write.
    vi.restoreAllMocks();
    const persisted = await readManifest(dataDir, APP_ID);
    expect(persisted?.current?.version).toBe('0.0.2');
  });

  it('throws ManifestConflictError when the conflict never clears', async () => {
    await publishBundle(dataDir, APP_ID, bundle('0.0.1'));

    // On EVERY read, inject a "competing writer" state: a higher version AND a
    // DIFFERENT current bundle. The different current means our retry never
    // sees an idempotent replay (which would legitimately succeed), so the
    // optimistic check keeps failing and we exhaust retries.
    let competitor = 100;
    const { getCalls } = installReadConflictInjection((raw) => {
      const parsed = JSON.parse(raw);
      competitor += 1;
      parsed.version = parsed.version + competitor;
      parsed.current = {
        version: `9.9.${competitor}-competitor`,
        uploadedAt: new Date().toISOString(),
        objectKey: `mvp-ota/${APP_ID}/9.9.${competitor}-competitor.zip`,
        checksum: 'f'.repeat(64),
      };
      return JSON.stringify(parsed);
    });

    await expect(publishBundle(dataDir, APP_ID, bundle('0.0.9'))).rejects.toBeInstanceOf(
      ManifestConflictError,
    );
    // Sanity: it actually retried MAX_PUBLISH_RETRIES + 1 attempts (2 reads each).
    expect(getCalls()).toBeGreaterThanOrEqual((MAX_PUBLISH_RETRIES + 1) * 2);
  });
});
