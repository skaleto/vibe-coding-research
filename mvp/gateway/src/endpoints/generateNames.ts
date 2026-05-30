/**
 * POST /generate-names  —— 01 起名
 *
 * 行为对齐 mvp/products/01-ai-naming/app/api/generate-names/route.ts
 * 服务端跑 LLM + extractCandidates 宽松解析 + filterByBlacklist 黑名单过滤 + mock 补齐。
 *
 * **verifyQuote / classics-db.json 留在客户端**（避免 Workers bundle > 1MB）。
 */
import type { Context } from 'hono';
import { z } from 'zod';
import type { Env, Variables } from '../env';
import { enforceRateLimit } from '../middleware/rateLimit';
import { callTextLLM } from '../llm/textChain';
import { filterByBlacklist } from '../lib/blacklist';
import {
  BABY_NAMING_SYSTEM_PROMPT,
  buildBabyNamingUserPrompt,
} from '../prompts/babyNaming';
import {
  buildOtherNamingUserPrompt,
  getSystemPromptByType,
  type NamingType,
} from '../prompts/otherNaming';
import { buildMockNames, type NameCandidate } from '../mocks/names';

const ReqSchema = z.object({
  type: z.enum(['baby', 'company', 'pet', 'nickname', 'penname']).default('baby'),
  surname: z.string().min(1).max(4),
  gender: z.enum(['男孩', '女孩']),
  name_length: z.enum(['双字名', '单字名', '不限']).optional(),
  vibe_tags: z.array(z.string()).min(1).max(3),
  taboo: z.string().max(200).optional(),
  source_preference: z
    .enum(['诗经', '楚辞', '唐诗', '宋词', '论语', '周易', '不限'])
    .optional(),
});

const NameCandidateSchema = z.object({
  full_name: z.string(),
  given_name: z.string(),
  pinyin_full: z.string(),
  pinyin_tones: z.string(),
  source_book: z.string(),
  source_chapter: z.string(),
  original_quote: z.string(),
  char_meanings: z.record(z.string()),
  explanation: z.string(),
  style_tag: z.string(),
  gender_fit: z.string(),
  stroke_count: z.number().int().nonnegative(),
  use_warning: z.string(),
});

function extractCandidates(parsed: unknown): NameCandidate[] {
  if (!parsed) return [];

  let array: unknown[] = [];
  if (Array.isArray(parsed)) {
    array = parsed;
  } else if (typeof parsed === 'object') {
    const obj = parsed as Record<string, unknown>;
    if (Array.isArray(obj.names)) array = obj.names;
    else if (Array.isArray(obj.data)) array = obj.data;
    else if (Array.isArray(obj.result)) array = obj.result;
    else if (Array.isArray(obj.candidates)) array = obj.candidates;
  }

  const result: NameCandidate[] = [];
  for (const item of array) {
    const strict = NameCandidateSchema.safeParse(item);
    if (strict.success) {
      result.push(strict.data);
      continue;
    }
    if (item && typeof item === 'object') {
      const obj = item as Record<string, unknown>;
      const lenient: Record<string, unknown> = {
        full_name: obj.full_name ?? obj.name ?? '',
        given_name: obj.given_name ?? obj.name ?? '',
        pinyin_full: obj.pinyin_full ?? obj.pinyin ?? '',
        pinyin_tones: obj.pinyin_tones ?? '',
        source_book: obj.source_book ?? obj.source ?? '',
        source_chapter: obj.source_chapter ?? '',
        original_quote: obj.original_quote ?? obj.quote ?? '',
        char_meanings: obj.char_meanings ?? {},
        explanation: obj.explanation ?? obj.meaning ?? '',
        style_tag: obj.style_tag ?? '现代清新',
        gender_fit: obj.gender_fit ?? '中性',
        stroke_count:
          typeof obj.stroke_count === 'number' && obj.stroke_count >= 0 ? obj.stroke_count : 0,
        use_warning: obj.use_warning ?? '无',
      };
      const lenientParse = NameCandidateSchema.safeParse(lenient);
      if (lenientParse.success) result.push(lenientParse.data);
    }
  }
  return result;
}

export async function generateNamesHandler(
  c: Context<{ Bindings: Env; Variables: Variables }>,
) {
  // 1. rate limit
  const rl = await enforceRateLimit(c, 'generate-names', 'standard');
  if (rl) return rl;

  // 2. parse body
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    return c.json(
      { error: { code: 'invalid_json', message: '请求体不是有效的 JSON' } },
      400,
    );
  }

  const parsed = ReqSchema.safeParse(raw);
  if (!parsed.success) {
    return c.json(
      {
        error: {
          code: 'invalid_input',
          message: '请求参数不合法',
          issues: parsed.error.issues.slice(0, 5).map((i) => ({
            path: i.path.join('.'),
            message: i.message,
          })),
        },
      },
      400,
    );
  }

  const input = parsed.data;
  const { type, surname, gender } = input;

  // 3. build prompt
  const system =
    type === 'baby'
      ? BABY_NAMING_SYSTEM_PROMPT
      : getSystemPromptByType(type as Exclude<NamingType, 'baby'>);
  const userPrompt =
    type === 'baby'
      ? buildBabyNamingUserPrompt({
          surname,
          gender,
          vibe_tags: input.vibe_tags,
          name_length: input.name_length,
          taboo: input.taboo,
          source_preference: input.source_preference,
        })
      : buildOtherNamingUserPrompt(type as Exclude<NamingType, 'baby'>, {
          surname,
          gender,
          vibe_tags: input.vibe_tags,
          name_length: input.name_length,
          taboo: input.taboo,
          source_preference: input.source_preference,
        });

  // 4. call LLM
  const llmResult = await callTextLLM(
    {
      system,
      prompt: userPrompt,
      json: true,
      temperature: 0.85,
      timeoutMs: 25_000,
      retries: 1,
    },
    c.env,
  );

  let candidates: NameCandidate[] = [];
  let providerUsed = llmResult.provider;
  let warning = llmResult.warning;

  if (llmResult.provider !== 'mock' && llmResult.parsed) {
    candidates = extractCandidates(llmResult.parsed);
  }

  if (candidates.length === 0) {
    candidates = buildMockNames(surname, gender);
    providerUsed = 'mock';
    if (!warning) warning = 'fallback_to_mock';
  }

  // 5. blacklist filter
  const { kept } = filterByBlacklist(candidates);
  let result = kept;

  // 6. supplement with mock if short
  const target = 10;
  if (result.length < 5) {
    const supplement = buildMockNames(surname, gender);
    for (const m of supplement) {
      if (result.length >= target) break;
      if (result.some((v) => v.given_name === m.given_name)) continue;
      result.push(m);
    }
    if (!warning) warning = 'supplemented_with_mock';
  }

  c.header('X-Compliance-Sanitized', 'true');
  c.header('X-Provider', providerUsed);
  return c.json({
    names: result.slice(0, target),
    provider: providerUsed,
    warning,
  });
}
