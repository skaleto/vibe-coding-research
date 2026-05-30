/**
 * Vision LLM provider chain.
 *
 * Priority: ZHIPU (GLM-4V) > OPENAI (gpt-4o-mini) > mock
 * deepseek 没有视觉能力 → 跳过。
 *
 * Used by: 03 diagnose.
 */
import type { Env } from '../env';
import type { ProviderName } from './types';
import { parseJsonSafely } from './textChain';

export interface VisionCallOptions {
  system: string;
  userText: string;
  /** base64 data URLs, e.g. "data:image/jpeg;base64,..." (max 3) */
  images: string[];
  temperature?: number;
  timeoutMs?: number; // default 30_000
  maxTokens?: number; // default 4000
}

export interface VisionCallResult {
  provider: ProviderName;
  parsed?: unknown;
  warning?: string;
}

type VisionProvider = Exclude<ProviderName, 'mock' | 'deepseek'>;

function pickVisionProvider(env: Env): ProviderName {
  if (env.ZHIPU_API_KEY) return 'zhipu';
  if (env.OPENAI_API_KEY) return 'openai';
  return 'mock';
}

function getConfig(provider: VisionProvider, env: Env) {
  if (provider === 'zhipu') {
    if (!env.ZHIPU_API_KEY) return null;
    return {
      url: env.ZHIPU_BASE_URL ?? 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      apiKey: env.ZHIPU_API_KEY,
      model: env.ZHIPU_VISION_MODEL ?? 'glm-4v-flash',
    };
  }
  if (!env.OPENAI_API_KEY) return null;
  return {
    url: env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1/chat/completions',
    apiKey: env.OPENAI_API_KEY,
    model: env.OPENAI_VISION_MODEL ?? 'gpt-4o-mini',
  };
}

async function callOnce(
  provider: VisionProvider,
  options: VisionCallOptions,
  env: Env,
): Promise<unknown> {
  const config = getConfig(provider, env);
  if (!config) throw new Error(`${provider} vision key missing`);

  const userContent: Array<Record<string, unknown>> = [
    { type: 'text', text: options.userText },
  ];
  for (const img of options.images.slice(0, 3)) {
    userContent.push({ type: 'image_url', image_url: { url: img } });
  }

  const body = {
    model: config.model,
    messages: [
      { role: 'system', content: options.system },
      { role: 'user', content: userContent },
    ],
    temperature: options.temperature ?? 0.4,
    max_tokens: options.maxTokens ?? 4000,
    response_format: { type: 'json_object' },
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 30_000);

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
      throw new Error(`${provider}-vision ${resp.status}: ${txt.slice(0, 200)}`);
    }
    const data = (await resp.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content ?? '';
    if (!content) throw new Error(`${provider}-vision empty content`);
    const parsed = parseJsonSafely(content);
    if (!parsed) throw new Error(`${provider}-vision non-JSON: ${content.slice(0, 200)}`);
    return parsed;
  } finally {
    clearTimeout(timer);
  }
}

export async function callVisionLLM(
  options: VisionCallOptions,
  env: Env,
): Promise<VisionCallResult> {
  const primary = pickVisionProvider(env);
  if (primary === 'mock') {
    return { provider: 'mock', warning: 'no_api_key' };
  }

  // 视觉不重试单 provider；按 design § Behavior 视觉 LLM 单次 < 30s。
  try {
    const parsed = await callOnce(primary as VisionProvider, options, env);
    return { provider: primary, parsed };
  } catch (err) {
    const reason = String(err).slice(0, 120);
    // Fallback: zhipu → openai
    if (primary === 'zhipu' && env.OPENAI_API_KEY) {
      try {
        const parsed = await callOnce('openai', options, env);
        return {
          provider: 'openai',
          parsed,
          warning: `zhipu_vision_failed_fallback_openai: ${reason}`,
        };
      } catch (err2) {
        return {
          provider: 'mock',
          warning: `vision_all_failed: zhipu=${reason}; openai=${String(err2).slice(0, 80)}`,
        };
      }
    }
    return {
      provider: 'mock',
      warning: `${primary}_vision_failed: ${reason}`,
    };
  }
}
