/**
 * POST /diagnose  —— 03 植物医生
 *
 * 行为对齐 mvp/products/03-plant-doctor/app/api/diagnose/route.ts
 *
 * 服务端 vision LLM (zhipu > openai > mock) → schema 校验 → **必跑 lintAction 出口清洗**。
 * 任何异常都降级到 mock + 200 (永不 5xx)。
 */
import type { Context } from 'hono';
import { z } from 'zod';
import type { Env, Variables } from '../env';
import { enforceRateLimit } from '../middleware/rateLimit';
import { callVisionLLM } from '../llm/visionChain';
import {
  DIAGNOSE_SYSTEM_PROMPT,
  buildDiagnoseUserPrompt,
} from '../prompts/diagnose';
import {
  lintDiagnosisResult,
  type DiagnosisResult,
} from '../lib/lintAction';
import { mockSucculentBlackRot, mockUnableToIdentify } from '../mocks/diagnose';

// A5-14 / H1 SSRF guard: each image MUST be an inline base64 data URL. We reject
// any http(s)/ftp/etc. URL outright. Without this, a value like
// `images:["http://169.254.169.254/..."]` would be forwarded verbatim to the
// vision provider (visionChain.ts → image_url.url), which then server-side fetches
// the attacker-chosen URL — SSRF via the LLM provider's egress.
const DATA_IMAGE_RE = /^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/]+=*$/;

const ReqSchema = z.object({
  images: z
    .array(
      z
        .string()
        .min(1)
        .regex(
          DATA_IMAGE_RE,
          'must be an inline base64 data:image/ URL (http(s)/remote URLs are rejected)',
        ),
    )
    .min(1)
    .max(3),
  waterFreq: z.string().optional(),
  light: z.string().optional(),
  soil: z.string().optional(),
  description: z.string().optional(),
  plantSelfReport: z.string().optional(),
  city: z.string().optional(),
});

const DiagnosisItemSchema = z.object({
  cause: z.string(),
  likelihood: z.enum(['高', '中', '低']),
  evidence: z.string(),
  severity: z.enum(['轻', '中', '重']),
});

const DiagnosisResultSchema = z.object({
  plant_name: z.string(),
  scientific_name: z.string(),
  confidence: z.number().min(0).max(1),
  image_quality_ok: z.boolean(),
  image_quality_feedback: z.string(),
  diagnosis: z.array(DiagnosisItemSchema),
  action_steps: z.array(z.string()),
  prognosis: z.object({
    recovery_outlook: z.enum(['高', '中', '低']),
    time_to_observe: z.string(),
    fallback_if_fail: z.string(),
  }),
  calendar_30d: z.array(
    z.object({
      day: z.number().int().min(1).max(30),
      action: z.string(),
      type: z.enum([
        'watering',
        'fertilizing',
        'lighting',
        'ventilation',
        'observation',
        'repotting',
        'consult',
      ]),
    }),
  ),
  disclaimer: z.string(),
});

export async function diagnoseHandler(
  c: Context<{ Bindings: Env; Variables: Variables }>,
) {
  // 1. rate limit (vision tier: 10 req/min/IP)
  const rl = await enforceRateLimit(c, 'diagnose', 'vision');
  if (rl) return rl;

  // 2. parse
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    return c.json(
      { ok: false, error: { code: 'invalid_json', message: 'invalid JSON body' } },
      400,
    );
  }
  const parsed = ReqSchema.safeParse(raw);
  if (!parsed.success) {
    return c.json(
      {
        ok: false,
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

  const input = parsed.data;
  const userPrompt = buildDiagnoseUserPrompt(input);

  // 3. call vision LLM
  const llm = await callVisionLLM(
    {
      system: DIAGNOSE_SYSTEM_PROMPT,
      userText: userPrompt,
      images: input.images,
      timeoutMs: 30_000,
    },
    c.env,
  );

  let result: DiagnosisResult;
  let providerUsed = llm.provider;
  let fallbackReason = llm.warning;

  // A1 H4 / F-21: do NOT pass off a failure or an unidentifiable image as a
  // confident "黑腐病" diagnosis. Route those to mockUnableToIdentify ("请补图 /
  // 请咨询园艺师"). The no-API-key path is a *demo* state (not a failure), so it
  // still returns the sample black-rot diagnosis.
  if (llm.provider !== 'mock' && llm.parsed) {
    const schemaCheck = DiagnosisResultSchema.safeParse(llm.parsed);
    if (schemaCheck.success && schemaCheck.data.image_quality_ok) {
      // Real, usable diagnosis.
      result = schemaCheck.data;
    } else if (schemaCheck.success) {
      // LLM explicitly says the image isn't diagnosable → ask for better photos
      // instead of forwarding a low-signal "diagnosis".
      providerUsed = 'mock';
      fallbackReason = 'image_quality_not_ok';
      result = mockUnableToIdentify();
    } else {
      // LLM output failed schema validation → we have no real diagnosis.
      providerUsed = 'mock';
      fallbackReason = `parse_failed: ${schemaCheck.error.issues
        .slice(0, 3)
        .map((i) => `${i.path.join('.')}=${i.message}`)
        .join('; ')}`;
      result = mockUnableToIdentify();
    }
  } else if (llm.warning && llm.warning.includes('failed')) {
    // Vision provider chain errored/timed out (genuine failure).
    providerUsed = 'mock';
    result = mockUnableToIdentify();
  } else {
    // No API key configured → demo/sample diagnosis (not a failure).
    providerUsed = 'mock';
    result = mockSucculentBlackRot();
    if (!fallbackReason) fallbackReason = 'no_api_key';
  }

  // 4. **必跑** lintAction 出口清洗
  const linted = lintDiagnosisResult(result);

  c.header('X-Compliance-Sanitized', 'true');
  c.header('X-Provider', providerUsed);
  return c.json({
    ok: true,
    provider: providerUsed,
    result: linted.result,
    lint: linted.report,
    fallbackReason,
  });
}
