/**
 * POST /generate-cards  —— 05 宠物心情卡片
 *
 * 行为对齐 mvp/products/05-pet-cards/app/api/generate-cards/route.ts:
 *  - 入参不合法时 **不返回 4xx**, 走 mock + 200 + note (用户体验底线)
 *  - 服务端强制注入 disclaimer (常量 DISCLAIMER), 即使 LLM 没输出
 *  - 8 个禁词命中 → fallback mock + source='mock_fallback'
 *  - 8s 超时 → mock fallback
 */
import type { Context } from 'hono';
import { z } from 'zod';
import type { Env, Variables } from '../env';
import { enforceRateLimit } from '../middleware/rateLimit';
import { callTextLLM } from '../llm/textChain';
import { PET_SYSTEM_PROMPT, buildPetUserPrompt } from '../prompts/pet';
import { pickMockScenario, DISCLAIMER, type PetCard, type PetSpecies } from '../mocks/pet';

const ReqSchema = z.object({
  petType: z.enum(['cat', 'dog', 'unknown']),
  petName: z.string().min(1).max(20),
  audioDurationSec: z.number().min(0).max(15),
  audioFeatures: z.object({
    pitch: z.enum(['high', 'low']),
    burst: z.enum(['short_burst', 'long_continuous', 'silent']),
  }),
});

const PetCardSchema = z.object({
  translation: z.array(z.string()).min(3).max(5),
  mood_tag: z.string(),
  emoji_set: z.array(z.string()).length(3),
  disclaimer: z.string().optional(),
});

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

/**
 * 归一化以抵御字符变体规避（对齐 A5-02：禁词被空格/零宽字符穿插绕过）。
 * NFKC（全角→半角）+ 去除所有空白与零宽字符。与 detectCrisis/lintAction 同口径。
 * 注意：join 后整体去空白会让"翻"+"译"跨词拼接也被命中 —— 这是更严格的拦截，符合合规意图。
 */
function normalizeForMatch(s: string): string {
  return s.normalize('NFKC').replace(/[\s​-‍⁠﻿]/g, '');
}

function containsForbiddenTerms(card: PetCard): boolean {
  const allText = normalizeForMatch([...card.translation, card.mood_tag].join(' '));
  return FORBIDDEN_OUTPUT_TERMS.some((term) => allText.includes(normalizeForMatch(term)));
}

function enforceDisclaimer(card: Omit<PetCard, 'disclaimer'> & { disclaimer?: string }): PetCard {
  return {
    translation: card.translation,
    mood_tag: card.mood_tag,
    emoji_set: card.emoji_set,
    disclaimer: DISCLAIMER,
  };
}

export async function generateCardsHandler(
  c: Context<{ Bindings: Env; Variables: Variables }>,
) {
  // 1. rate limit
  const rl = await enforceRateLimit(c, 'generate-cards', 'standard');
  if (rl) return rl;

  // 2. parse — 05 特殊: 入参不合法也返回 200 + mock
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    raw = null;
  }
  const parsed = ReqSchema.safeParse(raw);
  if (!parsed.success) {
    const mock = pickMockScenario('cat');
    c.header('X-Compliance-Sanitized', 'true');
    c.header('X-Provider', 'mock');
    return c.json({
      card: { ...mock, disclaimer: DISCLAIMER },
      source: 'mock_fallback',
      provider: 'mock',
      note: `入参不合法: ${parsed.error.message.slice(0, 100)}`,
    });
  }

  const req = parsed.data;
  const userPrompt = buildPetUserPrompt(req);

  // 3. LLM 调用 8s 超时
  const llm = await callTextLLM(
    {
      system: PET_SYSTEM_PROMPT,
      prompt: userPrompt,
      json: true,
      temperature: 0.9,
      timeoutMs: 8_000,
      retries: 0,
      maxTokens: 500,
    },
    c.env,
  );

  c.header('X-Compliance-Sanitized', 'true');

  if (llm.provider === 'mock') {
    const mock = pickMockScenario(req.petType as PetSpecies, req.petName);
    c.header('X-Provider', 'mock');
    return c.json({
      card: enforceDisclaimer(mock),
      source: llm.warning?.includes('failed') ? 'mock_fallback' : 'mock',
      provider: 'mock',
      note: llm.warning ?? '未配置 LLM key, 走 mock fallback',
    });
  }

  // 4. LLM 返回 → schema 校验
  const cardCheck = PetCardSchema.safeParse(llm.parsed);
  if (!cardCheck.success) {
    const mock = pickMockScenario(req.petType as PetSpecies, req.petName);
    c.header('X-Provider', 'mock');
    return c.json({
      card: enforceDisclaimer(mock),
      source: 'mock_fallback',
      provider: 'mock',
      note: `LLM schema 校验失败, fallback mock: ${cardCheck.error.message.slice(0, 100)}`,
    });
  }

  // 5. 禁词检测
  const card: PetCard = {
    translation: cardCheck.data.translation,
    mood_tag: cardCheck.data.mood_tag,
    emoji_set: cardCheck.data.emoji_set,
    disclaimer: cardCheck.data.disclaimer ?? DISCLAIMER,
  };
  if (containsForbiddenTerms(card)) {
    const mock = pickMockScenario(req.petType as PetSpecies, req.petName);
    c.header('X-Provider', llm.provider);
    return c.json({
      card: enforceDisclaimer(mock),
      source: 'mock_fallback',
      provider: llm.provider,
      note: 'LLM 输出含禁词, 已 fallback 到 mock',
    });
  }

  // 6. 强制 disclaimer 注入 (即使 LLM 自带也要硬覆盖)
  c.header('X-Provider', llm.provider);
  return c.json({
    card: enforceDisclaimer(card),
    source: 'llm' as const,
    provider: llm.provider,
  });
}
