/**
 * Gateway runtime configuration.
 *
 * Migrated off Cloudflare Workers `Env` bindings → plain config object sourced from
 * `process.env` on Node (see src/server.ts `loadEnv()`). It is still threaded through
 * Hono as `c.env` (the Bindings generic) so endpoint/LLM code is unchanged.
 *
 * NOTE: the old `RATE_LIMIT_KV?: KVNamespace` binding is gone — rate limiting is now
 * an in-process Map (see middleware/rateLimit.ts). No KV / Workers binding types remain.
 */
export interface Env {
  // Provider keys (secrets, can be absent → falls back to next provider or mock)
  DEEPSEEK_API_KEY?: string;
  ZHIPU_API_KEY?: string;
  OPENAI_API_KEY?: string;

  // Optional base URL overrides
  DEEPSEEK_BASE_URL?: string;
  ZHIPU_BASE_URL?: string;
  OPENAI_BASE_URL?: string;

  // Model names
  DEEPSEEK_MODEL?: string;
  ZHIPU_MODEL?: string;
  OPENAI_MODEL?: string;
  ZHIPU_VISION_MODEL?: string;
  OPENAI_VISION_MODEL?: string;
}

/** Hono variables map (typed context). */
export interface Variables {
  requestId: string;
  ip: string;
}
