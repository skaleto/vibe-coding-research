/**
 * mvp-ota — Hono application (runtime-agnostic).
 *
 * The HTTP entry point lives in `server.ts` (@hono/node-server). This module
 * builds the Hono app and is import-safe for tests, which call `createApp()`
 * with an injected config pointing at a temp DATA_DIR.
 *
 * Routes:
 *   GET  /health                  health check
 *   POST /mobile-updates/check    client version check
 *   POST /admin/manifest          publish a new bundle (Bearer)
 *   GET  /admin/manifest/:appId   read manifest        (Bearer)
 *
 * See design.md § OTA Backend for the full contract.
 */

import { Hono } from 'hono';
import type { AppEnv, Env } from './types.js';
import { loadConfig } from './types.js';
import { checkRouter } from './routes/check.js';
import { adminRouter } from './routes/admin.js';

/**
 * Build the Hono app. `config` is captured in a middleware and exposed to every
 * handler via `c.get('config')`, replacing the Workers `c.env` bindings.
 */
export function createApp(config: Env = loadConfig()): Hono<AppEnv> {
  const app = new Hono<AppEnv>();

  // Make the in-process config available to every route.
  app.use('*', async (c, next) => {
    c.set('config', config);
    await next();
  });

  // ---------- CORS (permissive for MVP — tighten before public launch) -------
  app.use('*', async (c, next) => {
    c.header('Access-Control-Allow-Origin', '*');
    c.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-Id');
    if (c.req.method === 'OPTIONS') {
      return c.body(null, 204);
    }
    await next();
  });

  // ---------- /health -------------------------------------------------------
  app.get('/health', (c) =>
    c.json({
      ok: true,
      service: 'mvp-ota',
      timestamp: new Date().toISOString(),
    }),
  );

  // ---------- mount routers -------------------------------------------------
  app.route('/', checkRouter);
  app.route('/', adminRouter);

  // ---------- error / 404 fallbacks -----------------------------------------
  app.notFound((c) =>
    c.json({ error: { code: 'not_found', message: `No route for ${c.req.method} ${c.req.path}` } }, 404),
  );

  app.onError((err, c) => {
    console.error('Unhandled error', err);
    return c.json(
      { error: { code: 'internal_error', message: 'Internal server error' } },
      500,
    );
  });

  return app;
}

// Default app instance (used by server.ts and any direct import).
const app = createApp();
export default app;
