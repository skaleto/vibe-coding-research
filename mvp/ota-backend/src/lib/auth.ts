/**
 * Admin authentication helper.
 *
 * Bearer-token comparison for the /admin/* routes, with per-app token
 * resolution (C6 supply-chain blast-radius reduction) and a token-strength
 * assertion (F-08 / A5-10: a weak admin token is the single strongest trust
 * root in this system — a guessed/leaked one means arbitrary bundle poisoning).
 */

import type { Env } from '../types.js';
import { appTokenEnvVar } from '../types.js';

/** Minimum acceptable admin-token length (bytes). 32 hex chars ≈ 128 bits. */
export const MIN_TOKEN_LENGTH = 32;

/**
 * Constant-time string equality.
 *
 * Length is deliberately compared up front: the inputs here are an
 * attacker-supplied Bearer token vs. a high-entropy secret, so leaking the
 * secret length via timing is not a meaningful weakness on a noisy edge
 * network. The byte loop below is constant-time across equal-length inputs.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const aBytes = new TextEncoder().encode(a);
  const bBytes = new TextEncoder().encode(b);
  // Encoded byte length can differ even when .length matched (multi-byte chars).
  if (aBytes.length !== bBytes.length) return false;
  let diff = 0;
  for (let i = 0; i < aBytes.length; i++) {
    diff |= (aBytes[i] as number) ^ (bBytes[i] as number);
  }
  return diff === 0;
}

/**
 * Extract Bearer token from Authorization header.
 * Returns the token string, or `null` if header is missing / malformed.
 */
export function extractBearer(authHeader: string | null | undefined): string | null {
  if (!authHeader) return null;
  const trimmed = authHeader.trim();
  const prefix = 'Bearer ';
  if (!trimmed.toLowerCase().startsWith(prefix.toLowerCase())) return null;
  const token = trimmed.slice(prefix.length).trim();
  return token.length > 0 ? token : null;
}

/**
 * Assert an admin token meets the minimum strength bar.
 *
 * Best-effort: logs a warning rather than throwing, because Workers has no
 * single "startup" hook and we never want a misconfiguration to hard-fail the
 * read-only `/check` path. Call it on every admin auth attempt; the per-token
 * `seenWeakTokens` guard keeps the log from being chatty.
 *
 * @returns true if the token is non-empty and >= MIN_TOKEN_LENGTH.
 */
const seenWeakTokens = new Set<string>();
export function assertTokenStrength(token: string | undefined | null, label: string): boolean {
  if (!token) return false;
  if (token.length < MIN_TOKEN_LENGTH) {
    // Key the dedupe on label+length so we never put the secret itself in a Set.
    const dedupeKey = `${label}:${token.length}`;
    if (!seenWeakTokens.has(dedupeKey)) {
      seenWeakTokens.add(dedupeKey);
      console.warn(
        `[ota-auth] WEAK ADMIN TOKEN: ${label} is ${token.length} chars (< ${MIN_TOKEN_LENGTH}). ` +
          `Generate one with \`openssl rand -hex 32\`. Do NOT ship example/placeholder tokens to production.`,
      );
    }
    return false;
  }
  return true;
}

/**
 * Resolve the expected admin token for a given appId.
 *
 * Priority:
 *   1. Per-app secret `OTA_TOKEN_<APP>` (e.g. OTA_TOKEN_COUNTDOWNPRO) — preferred.
 *   2. Fallback to the legacy shared `OTA_ADMIN_TOKEN` (with console.warn).
 *
 * Returns null if neither is configured (caller must treat as auth failure).
 * `appId` may be unvalidated/unknown — an unknown id yields no per-app var and
 * falls through to the shared token (the route still rejects unknown appIds
 * separately on its own validation path).
 */
export function resolveAdminToken(env: Env, appId: string | undefined | null): string | null {
  if (appId) {
    const varName = appTokenEnvVar(appId);
    if (varName) {
      const perApp = env[varName];
      if (typeof perApp === 'string' && perApp.length > 0) {
        assertTokenStrength(perApp, varName);
        return perApp;
      }
    }
  }
  const shared = env.OTA_ADMIN_TOKEN;
  if (typeof shared === 'string' && shared.length > 0) {
    const appLabel = appId ? ` for ${appId}` : '';
    console.warn(
      `[ota-auth] per-app token not configured${appLabel}; falling back to shared OTA_ADMIN_TOKEN. ` +
        `Configure OTA_TOKEN_<APP> to shrink the supply-chain blast radius.`,
    );
    assertTokenStrength(shared, 'OTA_ADMIN_TOKEN');
    return shared;
  }
  return null;
}

/**
 * Verify an Authorization header against a single expected token.
 * Both extraction failure and mismatch return false.
 */
export function verifyAdminAuth(
  authHeader: string | null | undefined,
  expectedToken: string | null | undefined,
): boolean {
  const provided = extractBearer(authHeader);
  if (!provided || !expectedToken) return false;
  return timingSafeEqual(provided, expectedToken);
}

/**
 * Verify an Authorization header for a specific appId, resolving the correct
 * per-app token (with shared-token fallback) first.
 */
export function verifyAdminAuthForApp(
  env: Env,
  appId: string | undefined | null,
  authHeader: string | null | undefined,
): boolean {
  const expected = resolveAdminToken(env, appId);
  return verifyAdminAuth(authHeader, expected);
}
