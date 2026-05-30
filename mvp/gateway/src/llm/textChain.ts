/**
 * Text LLM provider chain.
 *
 * Priority: DEEPSEEK > ZHIPU > OPENAI > mock
 * Used by: 01 generate-names, 04 analyze-dream, 05 generate-cards.
 *
 * All errors swallowed: returns { provider: 'mock', warning } when nothing works.
 */
import type { Env } from '../env';
import type { ProviderName } from './types';

export interface TextCallOptions {
  system: string;
  prompt: string;
  json?: boolean;
  temperature?: number;
  /** Single attempt timeout (ms). Default 25_000. */
  timeoutMs?: number;
  /** Retries on a single (non-mock) provider. Default 1 (so 2 total attempts). */
  retries?: number;
  /** max_tokens hint. Default 4000. */
  maxTokens?: number;
}

export interface TextCallResult {
  provider: ProviderName;
  raw: string;
  parsed?: unknown;
  warning?: string;
}

interface ProviderConfig {
  url: string;
  apiKey: string;
  model: string;
}

function pickProvider(env: Env): ProviderName {
  if (env.DEEPSEEK_API_KEY) return 'deepseek';
  if (env.ZHIPU_API_KEY) return 'zhipu';
  if (env.OPENAI_API_KEY) return 'openai';
  return 'mock';
}

function getConfig(provider: Exclude<ProviderName, 'mock'>, env: Env): ProviderConfig | null {
  if (provider === 'deepseek') {
    if (!env.DEEPSEEK_API_KEY) return null;
    return {
      url: env.DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com/v1/chat/completions',
      apiKey: env.DEEPSEEK_API_KEY,
      model: env.DEEPSEEK_MODEL ?? 'deepseek-chat',
    };
  }
  if (provider === 'zhipu') {
    if (!env.ZHIPU_API_KEY) return null;
    return {
      url: env.ZHIPU_BASE_URL ?? 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      apiKey: env.ZHIPU_API_KEY,
      model: env.ZHIPU_MODEL ?? 'glm-4-flash',
    };
  }
  if (!env.OPENAI_API_KEY) return null;
  return {
    url: env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1/chat/completions',
    apiKey: env.OPENAI_API_KEY,
    model: env.OPENAI_MODEL ?? 'gpt-4o-mini',
  };
}

async function callOnce(
  provider: Exclude<ProviderName, 'mock'>,
  options: TextCallOptions,
  env: Env,
): Promise<{ raw: string; parsed?: unknown }> {
  const config = getConfig(provider, env);
  if (!config) throw new Error(`${provider} key missing`);

  const body: Record<string, unknown> = {
    model: config.model,
    messages: [
      { role: 'system', content: options.system },
      { role: 'user', content: options.prompt },
    ],
    temperature: options.temperature ?? 0.8,
    max_tokens: options.maxTokens ?? 4000,
  };
  if (options.json) body.response_format = { type: 'json_object' };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 25_000);

  try {
    const resp = await fetch(config.url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!resp.ok) {
      const txt = await resp.text().catch(() => '');
      throw new Error(`${provider} ${resp.status}: ${txt.slice(0, 200)}`);
    }
    const data = (await resp.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content ?? '';
    if (!content) throw new Error(`${provider} empty content`);

    let parsed: unknown;
    if (options.json) {
      parsed = parseJsonSafely(content);
      if (!parsed) throw new Error(`${provider} non-JSON: ${content.slice(0, 200)}`);
    }
    return { raw: content, parsed };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Forgiving JSON parser:
 * - bare JSON
 * - markdown ```json ... ``` wrapper
 * - first `{ ... }` substring
 * - first `[ ... ]` substring (wrapped as { names: [...] })
 */
export function parseJsonSafely(text: string): unknown {
  if (!text) return undefined;
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    /* fall through */
  }
  const cleaned = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  try {
    return JSON.parse(cleaned);
  } catch {
    /* fall through */
  }
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    try {
      return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
    } catch {
      /* fall through */
    }
  }
  const firstBracket = trimmed.indexOf('[');
  const lastBracket = trimmed.lastIndexOf(']');
  if (firstBracket >= 0 && lastBracket > firstBracket) {
    try {
      const arr = JSON.parse(trimmed.slice(firstBracket, lastBracket + 1));
      return { names: arr };
    } catch {
      /* fall through */
    }
  }
  return undefined;
}

/**
 * Call the text provider chain. On any failure (incl. all retries) returns mock marker.
 * Caller is responsible for producing the actual mock payload.
 */
export async function callTextLLM(options: TextCallOptions, env: Env): Promise<TextCallResult> {
  const provider = pickProvider(env);
  if (provider === 'mock') {
    return { provider: 'mock', raw: '', warning: 'no_api_key' };
  }

  const retries = options.retries ?? 1;
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const { raw, parsed } = await callOnce(provider, options, env);
      return { provider, raw, parsed };
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 800));
      }
    }
  }

  return {
    provider: 'mock',
    raw: '',
    warning: `${provider}_failed: ${String(lastError).slice(0, 120)}`,
  };
}

export { pickProvider };
