/**
 * Object-key validation (C6-1 / F-01 / A5-08: path-traversal & cross-app
 * poisoning defence).
 *
 * The `objectKey` written via POST /admin/manifest is later fed verbatim to
 * `signOssGetUrl`. A `..` segment can let a token holder sign objects outside
 * the intended `mvp-ota/<appId>/` prefix or cross-poison another app, so we
 * lock the key to a strict shape. (Filename kept as r2-key.ts for git history;
 * the storage backend is now Aliyun OSS, but the structural rules are identical.)
 */

/** Allowed characters anywhere in a key: alphanumerics, dot, underscore, slash, hyphen. */
const KEY_CHARSET = /^[a-zA-Z0-9._/-]+$/;

/** Matches a `..` path segment in any form (handles leading/trailing/embedded). */
const DOTDOT_SEGMENT = /(^|\/)\.\.(\/|$)/;

/** Percent-encoded dot, used to catch `%2e%2e` / `%2E` traversal attempts. */
const PERCENT_ENCODED_DOT = /%2e/i;

export interface KeyValidationResult {
  ok: boolean;
  /** Human-readable reason when `ok` is false. */
  reason?: string;
}

/**
 * Structural checks that must hold for ANY object key, independent of appId.
 * Used both by the admin route (with an extra prefix check) and as a
 * defence-in-depth gate inside `signOssGetUrl`.
 *
 * Rejects:
 *   - empty / non-string
 *   - any `%` (no percent-encoding allowed; `encodeURIComponent('..')` === '..'
 *     so an unencoded `..` would still slip through — we forbid the encoded
 *     form outright and forbid `%` generally to avoid double-encode surprises)
 *   - `..` path segments (literal or `%2e%2e`)
 *   - a leading `/` (absolute path)
 *   - consecutive `//`
 *   - characters outside the allow-list
 */
export function isStructurallySafeKey(key: unknown): KeyValidationResult {
  if (typeof key !== 'string' || key.length === 0) {
    return { ok: false, reason: 'objectKey must be a non-empty string' };
  }
  if (PERCENT_ENCODED_DOT.test(key)) {
    return { ok: false, reason: 'objectKey must not contain percent-encoded dots (%2e)' };
  }
  if (key.includes('%')) {
    return { ok: false, reason: 'objectKey must not contain percent-encoding (%)' };
  }
  if (key.startsWith('/')) {
    return { ok: false, reason: 'objectKey must not start with "/" (absolute path)' };
  }
  if (key.includes('//')) {
    return { ok: false, reason: 'objectKey must not contain consecutive slashes ("//")' };
  }
  if (DOTDOT_SEGMENT.test(key)) {
    return { ok: false, reason: 'objectKey must not contain ".." path segments' };
  }
  if (!KEY_CHARSET.test(key)) {
    return {
      ok: false,
      reason: 'objectKey contains disallowed characters (allowed: a-z A-Z 0-9 . _ / -)',
    };
  }
  return { ok: true };
}

/** OSS key prefix shared by every app's bundles (distinct from ai-baby's
 *  `baby-companion/` prefix so the two products never collide in one bucket). */
export const OSS_KEY_PREFIX = 'mvp-ota';

/**
 * Full admin-side validation: structural safety PLUS the mandatory
 * `mvp-ota/<appId>/` prefix so a key can only ever address the caller's own app
 * within the shared OTA namespace.
 *
 * `appId` is expected to be an already-validated known appId.
 */
export function validatePublishObjectKey(key: unknown, appId: string): KeyValidationResult {
  const structural = isStructurallySafeKey(key);
  if (!structural.ok) return structural;

  const prefix = `${OSS_KEY_PREFIX}/${appId}/`;
  // `key` is a string here (structural check passed).
  if (!(key as string).startsWith(prefix)) {
    return { ok: false, reason: `objectKey must start with "${prefix}" (matching the request appId)` };
  }
  // Reject a key that is exactly the prefix with nothing after it.
  if ((key as string).length <= prefix.length) {
    return { ok: false, reason: `objectKey must include an object name after the "${prefix}" prefix` };
  }
  return { ok: true };
}
