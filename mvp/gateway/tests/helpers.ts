/**
 * Test helpers for the Node runtime.
 *
 * Tests exercise the runtime-agnostic Hono `app` directly via `app.fetch(req, env)` —
 * the same call shape src/server.ts uses, just with the env passed per-test instead of
 * built once from process.env. No Cloudflare `cloudflare:test` / SELF / KV stubs: rate
 * limiting is now an in-process Map (reset between cases via __resetRateLimitStore()).
 */
import type { Env } from '../src/env';

/** Build a runtime config object for app.fetch(req, env). Defaults to no provider keys. */
export function makeEnv(overrides: Partial<Env> = {}): Env {
  return { ...overrides };
}

/** Build a Request with JSON body suitable for app.fetch. */
export function jsonReq(path: string, body: unknown, init: RequestInit = {}): Request {
  return new Request(`https://gateway.test${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
    body: JSON.stringify(body),
    ...init,
  });
}
