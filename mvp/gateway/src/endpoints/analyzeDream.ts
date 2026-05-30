/**
 * POST /analyze-dream  —— 04 梦境
 *
 * 关键流程对齐 mvp/products/04-dream-journal/app/api/analyze-dream/route.ts:
 *  1. 服务端先跑 detectCrisis(); level=1 命中 → 直接 redirectToCrisis: true, **不调 LLM**
 *  2. level 2/3 → 走 LLM, 返回时在 analysis.crisis_alert 注入 note
 *  3. 服务端强制注入 disclaimer_top / next_step
 */
import type { Context } from 'hono';
import { z } from 'zod';
import type { Env, Variables } from '../env';
import { enforceRateLimit } from '../middleware/rateLimit';
import { callTextLLM } from '../llm/textChain';
import {
  detectCrisis,
  DISCLAIMER_TOP,
  NEXT_STEP_DEFAULT,
} from '../lib/detectCrisis';
import { buildDreamSystemPrompt, buildDreamUserPrompt } from '../prompts/dream';
import {
  buildMockAnalysis,
  buildSupportiveMockAnalysis,
  type DreamAnalysis,
  type School,
} from '../mocks/dream';

const ReqSchema = z.object({
  dreamText: z.string().min(1).max(8000),
  // A1 F-02/F-18: mood is concatenated into the prompt, so it must be length-
  // bounded (prompt-injection / token blowup) AND must pass crisis detection.
  mood: z.string().max(200).optional(),
  school: z.enum(['jungian', 'freudian', 'gestalt']).default('jungian'),
  locale: z.enum(['zh-CN', 'en-US']).optional(),
});

const AnalysisSchema = z.object({
  disclaimer_top: z.string().optional(),
  key_symbols: z.array(z.string()).min(1).max(8),
  views: z
    .array(
      z.object({
        school: z.enum(['freudian', 'jungian', 'gestalt']),
        schoolLabel: z.string(),
        body: z.string(),
      }),
    )
    .optional()
    .default([]),
  psychology_view: z.string(),
  reflection_questions: z.array(z.string()).min(1).max(6),
  emotion_tags: z.array(z.string()).min(1).max(8),
  next_step: z.string().optional(),
});

/** Sanitize LLM output: force-inject disclaimer/next_step, fall back to mock on schema fail. */
function sanitizeAnalysis(raw: unknown, school: School): DreamAnalysis | null {
  const parsed = AnalysisSchema.safeParse(raw);
  if (!parsed.success) return null;
  const data = parsed.data;
  return {
    disclaimer_top: DISCLAIMER_TOP,
    key_symbols: data.key_symbols.slice(0, 6),
    views: data.views && data.views.length > 0 ? data.views : buildMockAnalysis(school).views,
    psychology_view: data.psychology_view,
    reflection_questions: data.reflection_questions.slice(0, 5),
    emotion_tags: data.emotion_tags.slice(0, 6),
    next_step: data.next_step?.trim() || NEXT_STEP_DEFAULT,
    crisis_alert: null,
  };
}

export async function analyzeDreamHandler(
  c: Context<{ Bindings: Env; Variables: Variables }>,
) {
  // 1. rate limit
  const rl = await enforceRateLimit(c, 'analyze-dream', 'standard');
  if (rl) return rl;

  // 2. parse
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    return c.json(
      { error: { code: 'invalid_json', message: 'invalid JSON body' } },
      400,
    );
  }
  const parsed = ReqSchema.safeParse(raw);
  if (!parsed.success) {
    return c.json(
      {
        error: {
          code: 'invalid_input',
          message: 'invalid input',
          issues: parsed.error.issues.slice(0, 5).map((i) => ({
            path: i.path.join('.'),
            message: i.message,
          })),
        },
      },
      400,
    );
  }

  const { dreamText, mood, school, locale } = parsed.data;

  // 3. **服务端 detectCrisis 优先** — level 1 直接短路, 不调 LLM
  // A1 F-02: crisis detection MUST cover every user text that enters the prompt.
  // `mood` is concatenated into buildDreamUserPrompt, so it must be scanned too;
  // otherwise "我想死" placed in `mood` bypasses the level-1 short-circuit.
  const crisis = detectCrisis(`${dreamText}\n${mood ?? ''}`, locale ?? 'zh-CN');

  c.header('X-Compliance-Sanitized', 'true');

  if (crisis.level === 1) {
    c.header('X-Provider', 'mock');
    return c.json({
      redirectToCrisis: true,
      crisisLevel: 1,
      provider: 'mock',
      analysis: null,
    });
  }

  // 4. 走 LLM
  const system = buildDreamSystemPrompt(school);
  const user = buildDreamUserPrompt(dreamText, mood, school);
  const llm = await callTextLLM(
    {
      system,
      prompt: user,
      json: true,
      temperature: 0.7,
      timeoutMs: 25_000,
      retries: 1,
    },
    c.env,
  );

  let analysis: DreamAnalysis;
  let providerUsed = llm.provider;

  if (llm.provider !== 'mock') {
    const sanitized = sanitizeAnalysis(llm.parsed, school);
    if (sanitized) {
      analysis = sanitized;
    } else {
      // LLM 出 schema 校验失败 → mock fallback
      providerUsed = 'mock';
      analysis = buildMockAnalysis(school);
      analysis.emotion_tags = ['LLM 输出解析失败 - 使用 mock fallback'];
    }
  } else if (crisis.level === 2 || crisis.level === 3) {
    // mock + 二三级 → supportive mock
    analysis = buildSupportiveMockAnalysis(school, crisis.level);
    c.header('X-Provider', providerUsed);
    return c.json({
      redirectToCrisis: false,
      crisisLevel: crisis.level,
      provider: providerUsed,
      analysis,
    });
  } else {
    analysis = buildMockAnalysis(school);
  }

  // 5. 二/三级时附加 crisis_alert
  if (crisis.level === 2 || crisis.level === 3) {
    analysis.crisis_alert = {
      level: crisis.level,
      note:
        crisis.level === 2
          ? '检测到强烈负面情绪关键词，已附加关怀支持卡片。'
          : '检测到持续低落迹象，已附加温和的咨询建议。',
    };
  }

  c.header('X-Provider', providerUsed);
  return c.json({
    redirectToCrisis: false,
    crisisLevel: crisis.level,
    provider: providerUsed,
    analysis,
  });
}
