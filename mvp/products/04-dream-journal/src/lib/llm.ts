/**
 * LLM 抽象层 —— 远端 gateway + mock fallback。
 *
 * 关键约束：
 * - **客户端**必须先跑 detectCrisis()，一级命中根本不进入此函数
 * - 所有响应都会被 sanitizeAnalysis() 强制覆盖 disclaimer / next_step
 *   不依赖 LLM 自觉
 * - 远端 gateway 失败 → 兜底走 mock，绝不把异常抛给用户
 */

import { z } from 'zod';
import type { AnalyzeDreamResponse, DreamAnalysis, School } from './types';
import { buildMockAnalysis, buildSupportiveMockAnalysis } from './mockAnalysis';
import { DISCLAIMER_TOP, NEXT_STEP_DEFAULT } from './disclaimer';
import { detectCrisis } from './detectCrisis';

export type Provider = 'mock' | 'deepseek' | 'openai' | 'zhipu' | 'gateway';

const analysisSchema = z.object({
  disclaimer_top: z.string().optional(),
  key_symbols: z.array(z.string()).min(1).max(8),
  views: z
    .array(
      z.object({
        school: z.enum(['freudian', 'jungian', 'gestalt']),
        schoolLabel: z.string(),
        body: z.string(),
      })
    )
    .optional()
    .default([]),
  psychology_view: z.string(),
  reflection_questions: z.array(z.string()).min(1).max(6),
  emotion_tags: z.array(z.string()).min(1).max(8),
  next_step: z.string().optional(),
});

/**
 * 客户端强制注入 disclaimer / next_step。
 * LLM 哪怕没写，我们也补上。
 */
export function sanitizeAnalysis(raw: unknown, school: School): DreamAnalysis {
  const parsed = analysisSchema.safeParse(raw);
  if (!parsed.success) {
    // LLM 输出无法解析 → fallback 到 mock，保留 emotion_tags 为 fallback 标记
    const mock = buildMockAnalysis(school);
    mock.emotion_tags = ['LLM 输出解析失败 - 使用 mock fallback'];
    return mock;
  }
  const data = parsed.data;
  return {
    disclaimer_top: DISCLAIMER_TOP, // 客户端强制注入，覆盖 LLM
    key_symbols: data.key_symbols.slice(0, 6),
    views:
      data.views && data.views.length > 0
        ? data.views
        : buildMockAnalysis(school).views,
    psychology_view: data.psychology_view,
    reflection_questions: data.reflection_questions.slice(0, 5),
    emotion_tags: data.emotion_tags.slice(0, 6),
    next_step: data.next_step?.trim() || NEXT_STEP_DEFAULT,
    crisis_alert: null,
  };
}

export interface CallLlmInput {
  dreamText: string;
  mood?: string;
  school: School;
}

/**
 * 分析梦境 —— 浏览器端调用。
 *
 * 流程：
 * 1. 二级 / 三级危机命中（一级在 DreamInput 已拦截）→ 走 mock supportive
 * 2. 调远端 gateway POST /analyze-dream
 * 3. 远端失败 → fallback mock
 */
export async function analyzeDream(
  input: CallLlmInput
): Promise<AnalyzeDreamResponse> {
  // 客户端兜底再跑一次危机检测
  const crisis = detectCrisis(input.dreamText);
  if (crisis.level === 1) {
    return {
      redirectToCrisis: true,
      crisisLevel: 1,
      provider: 'mock',
      analysis: null,
    };
  }

  // 二级 / 三级：直接走 supportive mock，含 crisis_alert 元信息
  if (crisis.level === 2 || crisis.level === 3) {
    const supportive = buildSupportiveMockAnalysis(input.school, crisis.level);
    return {
      redirectToCrisis: false,
      crisisLevel: crisis.level,
      provider: 'mock',
      analysis: supportive,
    };
  }

  // 零级：调远端 gateway，失败则 fallback mock
  try {
    const gatewayUrl = (import.meta.env.VITE_GATEWAY_URL as string | undefined) ?? __GATEWAY_URL__;
    const res = await fetch(`${gatewayUrl}/analyze-dream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dreamText: input.dreamText,
        mood: input.mood,
        school: input.school,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = (await res.json()) as unknown;
    const analysis = sanitizeAnalysis(raw, input.school);
    return {
      redirectToCrisis: false,
      crisisLevel: 0,
      provider: 'gateway',
      analysis,
    };
  } catch (err) {
    console.warn('[llm] remote gateway failed, falling back to mock:', err);
    const mock = buildMockAnalysis(input.school);
    return {
      redirectToCrisis: false,
      crisisLevel: 0,
      provider: 'mock',
      analysis: mock,
    };
  }
}
