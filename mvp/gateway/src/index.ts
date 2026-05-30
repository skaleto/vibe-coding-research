/**
 * MVP Gateway: Hono app (runtime-agnostic).
 *
 * Primary deploy = Node.js on 阿里云 ECS (see src/server.ts + docs/aliyun-deploy.md).
 * Cloudflare Workers is kept as a fallback target (wrangler.toml retained); because
 * the only Workers-specific entry was the `export default` fetch handler, this module
 * still exports `app` as default so a Workers build can pick it up unchanged.
 *
 * Mounts:
 *  - GET  /health
 *  - POST /generate-names  (01)
 *  - POST /diagnose        (03, vision)
 *  - POST /analyze-dream   (04, server-side crisis short-circuit)
 *  - POST /generate-cards  (05)
 *
 * Architectural invariants (see design.md § Gateway):
 *  - All endpoints **always return 200** on success; 4xx only for client input errors;
 *    5xx never returned to client (onError middleware → mock fallback).
 *  - Compliance enforcers run server-side; X-Compliance-Sanitized: true on responses.
 *  - LLM keys absent → mock fallback automatically.
 */
import { Hono } from 'hono';
import type { Env, Variables } from './env';
import {
  bodySizeGuard,
  corsMiddleware,
  requestIdMiddleware,
} from './middleware/common';
import { generateNamesHandler } from './endpoints/generateNames';
import { diagnoseHandler } from './endpoints/diagnose';
import { analyzeDreamHandler } from './endpoints/analyzeDream';
import { generateCardsHandler } from './endpoints/generateCards';

const BODY_LIMIT_DEFAULT = 64 * 1024; // 64 KB
const BODY_LIMIT_DIAGNOSE = 5 * 1024 * 1024; // 5 MB
const BODY_LIMIT_CARDS = 16 * 1024; // 16 KB

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.use('*', corsMiddleware);
app.use('*', requestIdMiddleware);

// Health: providers reported as bool (do not leak key value).
app.get('/health', (c) => {
  return c.json({
    ok: true,
    version: 'mvp-gateway-0.1.0',
    providers: {
      deepseek: Boolean(c.env.DEEPSEEK_API_KEY),
      zhipu: Boolean(c.env.ZHIPU_API_KEY),
      openai: Boolean(c.env.OPENAI_API_KEY),
    },
  });
});

// 01 起名
app.post('/generate-names', bodySizeGuard(BODY_LIMIT_DEFAULT), generateNamesHandler);

// 03 植物医生 — 5MB body 容许
app.post('/diagnose', bodySizeGuard(BODY_LIMIT_DIAGNOSE), diagnoseHandler);

// 04 梦境
app.post('/analyze-dream', bodySizeGuard(BODY_LIMIT_DEFAULT), analyzeDreamHandler);

// 05 宠物卡片 — 16KB body
app.post('/generate-cards', bodySizeGuard(BODY_LIMIT_CARDS), generateCardsHandler);

// 405 for wrong method (except /health which is GET-only above)
app.all('/generate-names', (c) =>
  c.json({ error: { code: 'method_not_allowed', message: 'POST only' } }, 405),
);
app.all('/diagnose', (c) =>
  c.json({ error: { code: 'method_not_allowed', message: 'POST only' } }, 405),
);
app.all('/analyze-dream', (c) =>
  c.json({ error: { code: 'method_not_allowed', message: 'POST only' } }, 405),
);
app.all('/generate-cards', (c) =>
  c.json({ error: { code: 'method_not_allowed', message: 'POST only' } }, 405),
);

// 404
app.notFound((c) =>
  c.json({ error: { code: 'invalid_input', message: 'not_found' } }, 404),
);

// onError: 永远不返回 5xx (设计约束)
// 任何未捕获错误 → 200 + mock fallback,带 warning 字段。
app.onError((err, c) => {
  console.error('[gateway-onError]', err);
  return c.json(
    {
      ok: false,
      error: {
        code: 'invalid_input',
        message: 'unexpected_error',
      },
      warning: `unexpected_error: ${String(err).slice(0, 200)}`,
    },
    200,
  );
});

// Named export consumed by src/server.ts (@hono/node-server). The default export is
// retained for the optional Cloudflare Workers build (wrangler main = src/index.ts).
export { app };
export default app;
