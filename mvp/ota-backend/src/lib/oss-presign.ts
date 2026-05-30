/**
 * Generate a presigned Aliyun OSS GET URL using the `ali-oss` SDK.
 *
 * Replaces the former R2 + aws4fetch path. OSS exposes a `signatureUrl(key,
 * { expires, method })` helper that returns a short-lived signed GET URL — the
 * direct analogue of the old S3 presign. The OSS client is constructed from
 * `process.env`-derived config (endpoint / bucket / AK / SK), following the
 * ai-baby convention where AK/SK are injected on ECS from
 * `/etc/<app>/aliyun_oss_access_key_*`.
 *
 * TTL: 300 seconds (5 minutes). See design.md § OTA Backend "TTL 决策".
 */

import OSS from 'ali-oss';
import type { Env } from '../types.js';
import { isStructurallySafeKey } from './r2-key.js';

export const DEFAULT_TTL_SECONDS = 300;

/**
 * Construct an `ali-oss` client from config. Throws if any required OSS setting
 * is missing — callers (the /check route) catch this and degrade to
 * `enabled:false` rather than serving an update with no download URL.
 */
export function createOssClient(env: Env): OSS {
  if (!env.ALIYUN_OSS_ACCESS_KEY_ID || !env.ALIYUN_OSS_ACCESS_KEY_SECRET) {
    throw new Error(
      'OSS credentials not configured (ALIYUN_OSS_ACCESS_KEY_ID / ALIYUN_OSS_ACCESS_KEY_SECRET)',
    );
  }
  if (!env.ALIYUN_OSS_ENDPOINT) {
    throw new Error('ALIYUN_OSS_ENDPOINT not configured');
  }
  if (!env.ALIYUN_OSS_BUCKET) {
    throw new Error('ALIYUN_OSS_BUCKET not configured');
  }

  return new OSS({
    endpoint: env.ALIYUN_OSS_ENDPOINT,
    accessKeyId: env.ALIYUN_OSS_ACCESS_KEY_ID,
    accessKeySecret: env.ALIYUN_OSS_ACCESS_KEY_SECRET,
    bucket: env.ALIYUN_OSS_BUCKET,
    // `secure` is inferred from the endpoint scheme; OSS endpoints are https.
  });
}

/**
 * Sign a GET URL for the given OSS object key. Returns the fully-signed URL.
 *
 * @param env  in-process config containing OSS credentials + endpoint + bucket.
 * @param key  OSS object key, e.g. `mvp-ota/io.countdownpro.app/0.0.2-...zip`.
 * @param ttlSeconds  URL validity window, defaults to 300s.
 */
export async function signOssGetUrl(
  env: Env,
  key: string,
  ttlSeconds: number = DEFAULT_TTL_SECONDS,
): Promise<string> {
  // Defence-in-depth (C6-2 / F-01): even if the admin write path's validation
  // is bypassed or a malformed key reaches the manifest store, refuse to sign
  // anything that could escape the intended prefix. `signatureUrl` would
  // otherwise happily sign a `../` key. This explicit structural check is the
  // actual guard (the SDK does not sanitise traversal for us).
  const safety = isStructurallySafeKey(key);
  if (!safety.ok) {
    throw new Error(`Refusing to sign unsafe OSS key: ${safety.reason}`);
  }

  const client = createOssClient(env);

  // `signatureUrl` is synchronous in ali-oss but we keep the function async to
  // preserve the previous signR2GetUrl call-site contract (awaited).
  return client.signatureUrl(key, { expires: ttlSeconds, method: 'GET' });
}
