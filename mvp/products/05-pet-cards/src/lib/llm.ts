import type { GenerateRequest, PetCard } from './types';
import { PetCardSchema, DISCLAIMER } from './types';
import { pickMockScenario } from './mockScenarios';

// 客户端不再持有 LLM key —— 全部走远端 gateway。
// gateway 地址由 vite define 注入；本地 mock 走 fallback。
const GATEWAY_URL = __GATEWAY_URL__;

// 禁词清单（与服务端守卫保持一致）—— 命中即 fallback
const FORBIDDEN_OUTPUT_TERMS = [
  '翻译',
  '准确',
  '真实意图',
  '真实还原',
  '科学解读',
  '分离焦虑',
  '焦虑症',
  '兽医',
];

function containsForbiddenTerms(card: PetCard): boolean {
  const allText = [...card.translation, card.mood_tag].join(' ');
  return FORBIDDEN_OUTPUT_TERMS.some((term) => allText.includes(term));
}

// 强制把 disclaimer 重写为标准文案（不依赖 LLM 自觉）
function enforceDisclaimer(card: PetCard): PetCard {
  return { ...card, disclaimer: DISCLAIMER };
}

export type LLMSource = 'llm' | 'mock' | 'mock_fallback';
export type LLMResult = {
  card: PetCard;
  source: LLMSource;
  provider: string;
  note?: string;
};

type GatewayResponse = {
  card: unknown;
  source?: LLMSource;
  provider?: string;
  note?: string;
};

export async function generatePetCard(req: GenerateRequest): Promise<LLMResult> {
  // 没配置 gateway 或测试环境 → 直接走 mock
  if (!GATEWAY_URL || GATEWAY_URL.length === 0) {
    const mock = pickMockScenario(req.petType, req.petName);
    return {
      card: enforceDisclaimer(mock),
      source: 'mock',
      provider: 'mock',
      note: '未配置 gateway, 走本地 mock',
    };
  }

  // 8 秒超时
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`${GATEWAY_URL}/generate-cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify(req),
    });

    if (!res.ok) {
      throw new Error(`gateway HTTP ${res.status}`);
    }

    const data = (await res.json()) as GatewayResponse;
    const parsed = PetCardSchema.safeParse(data.card);
    if (!parsed.success) {
      throw new Error(`gateway response schema invalid: ${parsed.error.message.slice(0, 100)}`);
    }

    const card = parsed.data;
    // 客户端二次禁词检查（即使服务端漏了也兜底）
    if (containsForbiddenTerms(card)) {
      const mock = pickMockScenario(req.petType, req.petName);
      return {
        card: enforceDisclaimer(mock),
        source: 'mock_fallback',
        provider: data.provider ?? 'gateway',
        note: '客户端二次禁词检测命中, 已 fallback',
      };
    }

    return {
      card: enforceDisclaimer(card),
      source: data.source ?? 'llm',
      provider: data.provider ?? 'gateway',
      ...(data.note ? { note: data.note } : {}),
    };
  } catch (err) {
    const mock = pickMockScenario(req.petType, req.petName);
    const msg = err instanceof Error ? err.message : String(err);
    return {
      card: enforceDisclaimer(mock),
      source: 'mock_fallback',
      provider: 'gateway',
      note: `gateway 调用失败已 fallback: ${msg.slice(0, 120)}`,
    };
  } finally {
    clearTimeout(timer);
  }
}
