/**
 * Shared types for the OTA backend.
 *
 * Contract reference: openspec/changes/migrate-to-vite-capacitor-ota/contract.md §2
 * Design reference:   openspec/changes/migrate-to-vite-capacitor-ota/design.md § OTA Backend
 *
 * Runtime: Node.js (@hono/node-server) on Aliyun ECS. Storage:
 *   - manifests: local JSON files under DATA_DIR (was Cloudflare KV)
 *   - bundles:   Aliyun OSS, GET URLs signed via the `ali-oss` SDK (was R2)
 * Config that used to be Workers `Env` bindings now comes from `process.env`
 * (see `loadConfig`). The legacy `Env` interface is kept as the in-process
 * config shape so the business logic / auth helpers stay unchanged.
 */

/**
 * Process configuration, assembled from `process.env`.
 *
 * Replaces the former Cloudflare Workers `Env` bindings. The OSS credentials
 * follow the ai-baby convention: on ECS the AK/SK live in
 * `/etc/<app>/aliyun_oss_access_key_id` and `_secret`, read by systemd and
 * injected into the process environment.
 */
export interface Env {
  // ---- Aliyun OSS (replaces R2) --------------------------------------------
  /** OSS endpoint, e.g. `oss-cn-hangzhou.aliyuncs.com`. */
  ALIYUN_OSS_ENDPOINT: string;
  /** OSS bucket name, e.g. `mvp-ota-bundles`. */
  ALIYUN_OSS_BUCKET: string;
  /** OSS Access Key ID (injected from /etc/<app>/aliyun_oss_access_key_id). */
  ALIYUN_OSS_ACCESS_KEY_ID: string;
  /** OSS Access Key Secret (injected from /etc/<app>/aliyun_oss_access_key_secret). */
  ALIYUN_OSS_ACCESS_KEY_SECRET: string;

  // ---- Local manifest storage (replaces KV) --------------------------------
  /** Directory for manifest JSON files. Defaults to /var/lib/mvp-ota (dev: ./data). */
  DATA_DIR: string;

  // ---- Admin tokens --------------------------------------------------------
  // Legacy shared admin token. Still honoured as a fallback when a per-app
  // token is not configured (see lib/auth.ts::resolveAdminToken). Prefer the
  // per-app secrets below so a single leak can only poison ONE app.
  OTA_ADMIN_TOKEN?: string;

  // Per-app admin tokens (C6 supply-chain blast-radius reduction).
  // Name = `OTA_TOKEN_<APP>` where <APP> is the appId with `io.` / `.app`
  // stripped and the middle segment upper-cased. Each is optional; missing
  // ones fall back to OTA_ADMIN_TOKEN with a console.warn.
  OTA_TOKEN_SHIJINGNAMING?: string;
  OTA_TOKEN_COUNTDOWNPRO?: string;
  OTA_TOKEN_PLANTDOCTOR?: string;
  OTA_TOKEN_DREAMJOURNAL?: string;
  OTA_TOKEN_PETCARDS?: string;

  // Allow string-indexed lookup of the per-app token secrets above.
  [key: string]: unknown;
}

/** Default manifest data dir on the ECS host. */
export const DEFAULT_DATA_DIR = '/var/lib/mvp-ota';

/**
 * Assemble the in-process config from `process.env`.
 *
 * Pure read of environment variables — does no I/O and never throws. Missing
 * OSS credentials surface later (at sign time) as a clear error, mirroring the
 * old behaviour where the read-only `/check` path never hard-failed on
 * misconfiguration. `DATA_DIR` falls back to {@link DEFAULT_DATA_DIR}.
 */
export function loadConfig(source: NodeJS.ProcessEnv = process.env): Env {
  const env: Env = {
    ALIYUN_OSS_ENDPOINT: source.ALIYUN_OSS_ENDPOINT ?? '',
    ALIYUN_OSS_BUCKET: source.ALIYUN_OSS_BUCKET ?? '',
    ALIYUN_OSS_ACCESS_KEY_ID: source.ALIYUN_OSS_ACCESS_KEY_ID ?? '',
    ALIYUN_OSS_ACCESS_KEY_SECRET: source.ALIYUN_OSS_ACCESS_KEY_SECRET ?? '',
    DATA_DIR: source.DATA_DIR && source.DATA_DIR.length > 0 ? source.DATA_DIR : DEFAULT_DATA_DIR,
  };
  // Copy through the admin-token vars (shared + per-app) verbatim so the
  // string-indexed lookup in resolveAdminToken keeps working.
  if (source.OTA_ADMIN_TOKEN) env.OTA_ADMIN_TOKEN = source.OTA_ADMIN_TOKEN;
  for (const key of Object.keys(source)) {
    if (key.startsWith('OTA_TOKEN_')) {
      env[key] = source[key];
    }
  }
  return env;
}

/** 5 allow-listed appIds — see design.md § Mobile Template "5 个产品命名表".
 *  Note: Capacitor CLI requires Java package format (a-z0-9 + `.`, NO hyphens).
 *  Hyphens were removed per T6 implementer's blocking finding (2026-05-28). */
export const KNOWN_APP_IDS = [
  'io.shijingnaming.app',
  'io.countdownpro.app',
  'io.plantdoctor.app',
  'io.dreamjournal.app',
  'io.petcards.app',
] as const;

export type KnownAppId = (typeof KNOWN_APP_IDS)[number];

export function isKnownAppId(value: unknown): value is KnownAppId {
  return typeof value === 'string' && (KNOWN_APP_IDS as readonly string[]).includes(value);
}

/**
 * Derive the per-app token env-var name for a known appId.
 *
 *   io.shijingnaming.app -> OTA_TOKEN_SHIJINGNAMING
 *   io.countdownpro.app  -> OTA_TOKEN_COUNTDOWNPRO
 *
 * Strips the leading `io.` and trailing `.app`, upper-cases the middle segment.
 * Returns null for ids that do not match the expected `io.<mid>.app` shape.
 */
export function appTokenEnvVar(appId: string): string | null {
  const match = /^io\.([a-z0-9]+)\.app$/.exec(appId);
  if (!match) return null;
  return `OTA_TOKEN_${match[1]!.toUpperCase()}`;
}

/** POST /mobile-updates/check request body. */
export interface CheckReq {
  appId: string;
  platform: 'ios' | 'android' | 'web';
  nativeVersion: string;
  currentBundleId?: string;
  currentBundleVersion?: string;
}

/** POST /mobile-updates/check response body. */
export interface CheckResp {
  enabled: boolean;
  updateAvailable: boolean;
  version?: string;
  url?: string;
  checksum?: string;
  minNativeVersion?: string;
  message?: string;
}

/** Single bundle record (stored in manifest.current and manifest.history[]). */
export interface BundleRecord {
  version: string;
  uploadedAt: string; // ISO-8601
  uploadedBy?: string;
  minNativeVersion?: string;
  /** OSS object key, e.g. `mvp-ota/<appId>/<version>.zip` (was R2 key). */
  objectKey: string;
  checksum: string; // sha256 hex
  message?: string;
}

/** Manifest document, persisted at `${DATA_DIR}/manifests/<appId>.json`. */
export interface Manifest {
  appId: KnownAppId;
  enabled: boolean;
  current: BundleRecord | null;
  history: BundleRecord[];
  /**
   * Monotonic write counter for optimistic locking (C7). Incremented on every
   * successful write. A writer re-reads before writing and bails if the stored
   * version moved under it. Starts at 0 for a fresh manifest.
   */
  version: number;
  /** ISO-8601 timestamp of the last successful write. */
  updatedAt: string;
}

/** POST /admin/manifest request body. */
export interface PublishReq {
  appId: string;
  version: string;
  /** OSS object key, e.g. `mvp-ota/<appId>/<version>.zip`. */
  objectKey: string;
  checksum: string;
  minNativeVersion?: string;
  message?: string;
  uploadedBy?: string;
}

/** Hono Bindings + Variables generic helper. */
export type AppEnv = {
  Bindings: Env;
  Variables: {
    /** In-process config, attached by middleware in server.ts. */
    config: Env;
    /** Request body peeked by the admin auth middleware so the POST handler need not re-parse. */
    parsedBody?: Partial<PublishReq>;
  };
};
