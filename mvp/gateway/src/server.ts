/**
 * Node.js runtime entry — PRIMARY deploy target (阿里云 ECS).
 *
 * Wraps the runtime-agnostic Hono `app` (src/index.ts) with @hono/node-server's
 * `serve()` and listens on `PORT` (default 8400). Topology on ECS:
 *
 *     client → nginx (HTTPS 443, sets X-Real-IP) → 127.0.0.1:8400 (this process, systemd)
 *
 * LLM keys & config come from `process.env` (injected via systemd `Environment=` or an
 * EnvironmentFile under /etc). On Workers these were KV/secret bindings passed per-request
 * as `c.env`; here we build the same `Env` shape once from process.env and inject it into
 * every `app.fetch(request, env)` call so endpoint/LLM code is byte-for-byte unchanged.
 *
 * See docs/aliyun-deploy.md for the systemd unit + nginx reverse-proxy config.
 */
import { serve } from '@hono/node-server';
import app from './index';
import type { Env } from './env';

/** Build the runtime config object from process.env (replaces Workers bindings). */
export function loadEnv(): Env {
  const e = process.env;
  return {
    DEEPSEEK_API_KEY: e.DEEPSEEK_API_KEY,
    ZHIPU_API_KEY: e.ZHIPU_API_KEY,
    OPENAI_API_KEY: e.OPENAI_API_KEY,
    DEEPSEEK_BASE_URL: e.DEEPSEEK_BASE_URL,
    ZHIPU_BASE_URL: e.ZHIPU_BASE_URL,
    OPENAI_BASE_URL: e.OPENAI_BASE_URL,
    DEEPSEEK_MODEL: e.DEEPSEEK_MODEL,
    ZHIPU_MODEL: e.ZHIPU_MODEL,
    OPENAI_MODEL: e.OPENAI_MODEL,
    ZHIPU_VISION_MODEL: e.ZHIPU_VISION_MODEL,
    OPENAI_VISION_MODEL: e.OPENAI_VISION_MODEL,
  };
}

const env = loadEnv();
const port = Number(process.env.PORT) || 8400;

// Inject our process.env-derived config as `c.env` on every request. @hono/node-server
// would otherwise pass the bare Node env; we override so the Env shape matches Workers.
const fetch = (request: Request) => app.fetch(request, env);

const server = serve({ fetch, port }, (info) => {
  const providers = {
    deepseek: Boolean(env.DEEPSEEK_API_KEY),
    zhipu: Boolean(env.ZHIPU_API_KEY),
    openai: Boolean(env.OPENAI_API_KEY),
  };
  // Do not log key values — only presence (mirrors /health).
  console.log(
    `[gateway] listening on http://0.0.0.0:${info.port} ` +
      `(providers: ${JSON.stringify(providers)})`,
  );
});

// Graceful shutdown for systemd (SIGTERM on `systemctl stop/restart`).
function shutdown(signal: string): void {
  console.log(`[gateway] ${signal} received — shutting down`);
  server.close(() => process.exit(0));
  // Hard exit if connections don't drain in time.
  setTimeout(() => process.exit(0), 5_000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
