/**
 * IP-based rate limit — in-process memory (single-instance Node on ECS).
 *
 * Was Cloudflare Workers KV; migrated to a module-level `Map<string,{count,resetAt}>`
 * with lazy TTL eviction. Single ECS host runs ONE Node process, so a per-process
 * counter is authoritative and sufficient.
 *
 *   MULTI-INSTANCE NOTE: if this ever scales horizontally (PM2 cluster / multiple ECS
 *   behind a load balancer), each process keeps its own Map → effective quota multiplies
 *   by instance count. At that point swap this store for Redis (ioredis) with INCR + EXPIRE
 *   keyed exactly like `rl:<endpoint>:<ip>:<minute_bucket>`. The enforceRateLimit /
 *   getClientIp signatures are deliberately unchanged so only the store swaps.
 *
 * Key: `rl:<endpoint>:<ip>:<minute_bucket>`, entry TTL 70s.
 * Quotas per design § Rate Limit:
 * - /diagnose:        10 req/min/IP (vision, expensive)
 * - all others:       60 req/min/IP
 *
 * Returns null on success (request proceeds), or a Response 429 with Retry-After.
 */
import type { Context } from 'hono';
import type { Env, Variables } from '../env';

export type RateLimitTier = 'standard' | 'vision';

const QUOTAS: Record<RateLimitTier, number> = {
  standard: 60,
  vision: 10,
};

const ENTRY_TTL_MS = 70_000;

interface Counter {
  count: number;
  /** Epoch ms after which this entry is stale and may be evicted. */
  resetAt: number;
}

/**
 * Process-local counter store. Replaces Workers KV. Keyed identically to the old KV
 * key (`rl:<endpoint>:<ip>:<minute_bucket>`) so the swap to Redis is mechanical.
 */
const store = new Map<string, Counter>();

/** Last time we swept stale entries; sweep is throttled to once per bucket window. */
let lastSweep = 0;

/**
 * Lazy eviction: bounded, amortized cleanup invoked on the request path (no timers,
 * so it can't keep the event loop alive / leak in tests). Sweeps expired entries at
 * most once per minute-bucket window.
 */
function sweepExpired(now: number): void {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }
}

/** Test-only: drop all counters so cases don't bleed quota into each other. */
export function __resetRateLimitStore(): void {
  store.clear();
  lastSweep = 0;
}

function currentMinuteBucket(now: number): string {
  return String(Math.floor(now / 60_000));
}

/**
 * A5-16 / H2: derive the rate-limit identity from ONLY the reverse-proxy-injected
 * client IP header. Behind our own nginx the real client IP arrives in `X-Real-IP`
 * (preferred) or the first hop of `X-Forwarded-For`.
 *
 * SECURITY — this mirrors the original `cf-connecting-ip`-only intent: we trust ONLY
 * a header that *our* infrastructure injects, never a raw client-supplied one. nginx
 * MUST be configured to overwrite these headers from the real peer address:
 *
 *     proxy_set_header X-Real-IP        $remote_addr;
 *     proxy_set_header X-Forwarded-For  $remote_addr;   # overwrite, do NOT append client XFF
 *
 * With that config a client cannot forge `X-Real-IP`: nginx replaces it from the TCP
 * peer on every request. If nginx instead *appended* the client's original XFF, an
 * attacker could rotate `X-Forwarded-For: <random>` per request to mint a fresh bucket
 * each time and never exhaust quota (unlimited LLM abuse / billing attack) — hence the
 * "overwrite, not append" requirement above.
 *
 * When no proxy header is present (direct local dev hit, no nginx), we collapse to a
 * single fixed `'local-dev'` bucket: limiting still applies coarsely and can never be
 * bypassed via headers. PRODUCTION MUST sit behind the nginx config above so `X-Real-IP`
 * is always present and trustworthy.
 */
export function getClientIp(c: Context<{ Bindings: Env; Variables: Variables }>): string {
  // Preferred: single, unambiguous client IP set by our nginx.
  const realIp = c.req.header('x-real-ip');
  if (realIp) return realIp.trim();

  // Fallback: first hop of X-Forwarded-For (also injected/overwritten by our nginx).
  // Trusted ONLY because nginx rewrites XFF from $remote_addr; see the doc comment.
  const xff = c.req.header('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }

  // No trusted proxy header (no nginx in front). Use a fixed bucket so limiting still
  // applies coarsely and can never be bypassed by spoofed headers.
  return 'local-dev';
}

/**
 * Increment the per-IP/endpoint counter and check quota. In-process; no I/O, no throw.
 */
export async function enforceRateLimit(
  c: Context<{ Bindings: Env; Variables: Variables }>,
  endpoint: string,
  tier: RateLimitTier,
): Promise<Response | null> {
  const now = Date.now();
  sweepExpired(now);

  const ip = c.get('ip');
  const bucket = currentMinuteBucket(now);
  const key = `rl:${endpoint}:${ip}:${bucket}`;
  const quota = QUOTAS[tier];

  const existing = store.get(key);
  // Treat an entry whose TTL has lapsed as absent (defensive; bucket rotation already
  // gives a fresh key each minute).
  const count = existing && existing.resetAt > now ? existing.count : 0;

  if (count >= quota) {
    return new Response(
      JSON.stringify({
        error: {
          code: 'rate_limited',
          message: `Too many requests on ${endpoint}. Limit ${quota}/min.`,
        },
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60',
          'X-RateLimit-Remaining': '0',
        },
      },
    );
  }

  store.set(key, { count: count + 1, resetAt: now + ENTRY_TTL_MS });
  c.header('X-RateLimit-Remaining', String(Math.max(quota - count - 1, 0)));
  return null;
}
