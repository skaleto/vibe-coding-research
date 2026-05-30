/**
 * Rate-limit tests (A5-16 / H2) for the Node + nginx topology.
 *
 * Identity is derived from the reverse-proxy-injected header `X-Real-IP` (preferred),
 * else the first hop of `X-Forwarded-For` — both written by *our* nginx, never trusted
 * from a raw client. The security intent is unchanged from the old cf-connecting-ip
 * design: a client cannot rotate a header to escape its quota.
 *
 * - getClientIp: X-Real-IP wins; falls back to XFF first hop; else the fixed 'local-dev'
 *   bucket. A client-forged X-Forwarded-For is powerless whenever nginx set X-Real-IP.
 * - Integration: 11 /diagnose requests sharing one X-Real-IP (what nginx injects) all
 *   fall in the same bucket even while a forged client XFF rotates → the 11th is 429
 *   (vision quota = 10/min).
 *
 * The limiter is an in-process Map, so __resetRateLimitStore() runs before each case to
 * keep counters from bleeding across tests.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import type { Context } from 'hono';
import app from '../src/index';
import { makeEnv, jsonReq } from './helpers';
import { getClientIp, __resetRateLimitStore } from '../src/middleware/rateLimit';
import type { Env, Variables } from '../src/env';

type Ctx = Context<{ Bindings: Env; Variables: Variables }>;

/** Minimal Context stub exposing only req.header(), which getClientIp uses. */
function ctxWithHeaders(headers: Record<string, string>): Ctx {
  const lower: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) lower[k.toLowerCase()] = v;
  return {
    req: { header: (name: string) => lower[name.toLowerCase()] },
  } as unknown as Ctx;
}

beforeEach(() => {
  __resetRateLimitStore();
});

describe('getClientIp (A5-16 / nginx topology)', () => {
  it('uses X-Real-IP when present, and it WINS over a forged X-Forwarded-For', () => {
    // nginx sets X-Real-IP from $remote_addr; a client-forged XFF must not override it.
    const ip = getClientIp(
      ctxWithHeaders({
        'x-real-ip': '203.0.113.7',
        'x-forwarded-for': '1.2.3.4, 5.6.7.8',
      }),
    );
    expect(ip).toBe('203.0.113.7');
    expect(ip).not.toBe('1.2.3.4');
  });

  it('falls back to the first hop of X-Forwarded-For when X-Real-IP absent', () => {
    const ip = getClientIp(ctxWithHeaders({ 'x-forwarded-for': '198.51.100.9, 5.6.7.8' }));
    expect(ip).toBe('198.51.100.9');
  });

  it('returns the fixed local-dev bucket when no proxy header is present', () => {
    expect(getClientIp(ctxWithHeaders({}))).toBe('local-dev');
  });

  it('does not honor cf-connecting-ip (removed) — collapses to local-dev', () => {
    // The old Cloudflare header is no longer trusted on the Node/nginx front.
    const ip = getClientIp(ctxWithHeaders({ 'cf-connecting-ip': '203.0.113.7' }));
    expect(ip).toBe('local-dev');
  });
});

describe('POST /diagnose rate limit keys off the nginx-injected X-Real-IP', () => {
  const tinyPng =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

  it('counts requests sharing one X-Real-IP into one bucket even as client XFF rotates → 11th is 429', async () => {
    const env = makeEnv();
    const realIp = '198.51.100.42'; // what nginx injects from $remote_addr

    const statuses: number[] = [];
    for (let i = 0; i < 11; i++) {
      const res = await app.fetch(
        jsonReq(
          '/diagnose',
          { images: [tinyPng] },
          {
            headers: {
              'x-real-ip': realIp,
              // A forged client XFF that changes each iteration — must NOT create new
              // buckets, because X-Real-IP (nginx) takes precedence.
              'x-forwarded-for': `${i}.${i}.${i}.${i}`,
            },
          },
        ),
        env,
      );
      statuses.push(res.status);
    }

    // Vision quota = 10/min. First 10 allowed (200, mock path), 11th rate-limited.
    expect(statuses.slice(0, 10)).toEqual(Array(10).fill(200));
    expect(statuses[10]).toBe(429);
  });

  it('requests with NO proxy header share the single local-dev bucket → 11th is 429', async () => {
    const env = makeEnv();
    const statuses: number[] = [];
    for (let i = 0; i < 11; i++) {
      const res = await app.fetch(
        jsonReq('/diagnose', { images: [tinyPng] }, { headers: {} }),
        env,
      );
      statuses.push(res.status);
    }
    // No X-Real-IP / XFF → all collapse to 'local-dev'; limiting still bites.
    expect(statuses.slice(0, 10)).toEqual(Array(10).fill(200));
    expect(statuses[10]).toBe(429);
  });

  it('429 response carries Retry-After', async () => {
    const env = makeEnv();
    const realIp = '203.0.113.200';
    let last: Response | undefined;
    for (let i = 0; i < 11; i++) {
      last = await app.fetch(
        jsonReq('/diagnose', { images: [tinyPng] }, { headers: { 'x-real-ip': realIp } }),
        env,
      );
    }
    expect(last?.status).toBe(429);
    expect(last?.headers.get('Retry-After')).toBe('60');
  });
});
