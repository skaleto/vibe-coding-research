/**
 * Common middleware: request-id (ULID-like via crypto.randomUUID), CORS, body-size guard.
 */
import type { Context, MiddlewareHandler, Next } from 'hono';
import type { Env, Variables } from '../env';
import { getClientIp } from './rateLimit';

/** Generate a short request ID (using crypto.randomUUID, no ULID dep). */
function genId(): string {
  // globalThis.crypto.randomUUID is available in Node >=19 and the Workers runtime.
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `rid-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export const requestIdMiddleware: MiddlewareHandler<{ Bindings: Env; Variables: Variables }> =
  async (c, next) => {
    const incoming = c.req.header('x-request-id');
    const id = incoming && incoming.length <= 80 ? incoming : genId();
    c.set('requestId', id);
    c.set('ip', getClientIp(c));
    c.header('X-Request-Id', id);
    await next();
  };

/** CORS preflight + headers. */
export const corsMiddleware: MiddlewareHandler<{ Bindings: Env; Variables: Variables }> = async (
  c,
  next,
) => {
  if (c.req.method === 'OPTIONS') {
    return c.body(null, 204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Request-Id',
      'Access-Control-Max-Age': '86400',
    });
  }
  await next();
  // Append CORS on all responses (best-effort).
  c.res.headers.set('Access-Control-Allow-Origin', '*');
  c.res.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  c.res.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-Request-Id');
};

/** Reject bodies above `maxBytes` with 413 payload_too_large. */
export function bodySizeGuard(maxBytes: number) {
  return async (c: Context<{ Bindings: Env; Variables: Variables }>, next: Next) => {
    const len = c.req.header('content-length');
    if (len) {
      const n = parseInt(len, 10);
      if (Number.isFinite(n) && n > maxBytes) {
        return c.json(
          {
            error: {
              code: 'payload_too_large',
              message: `Body exceeds ${maxBytes} bytes.`,
            },
          },
          413,
        );
      }
    }
    await next();
  };
}
