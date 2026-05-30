/**
 * LLM 视觉 API 客户端（浏览器端 → 远端 gateway）
 *
 * 这个文件原来直接在服务端调用智谱 / OpenAI；重构后所有 LLM 调用
 * 走 Cloudflare Worker gateway（POST {GATEWAY}/diagnose），把 API key
 * 留在远端，浏览器只发图片 + 用户填写信息。
 *
 * 客户端永远不应该看到 500 错误：
 *  - 网络/网关失败 → 自动降级到 mockSucculentBlackRot()，附 fallbackReason
 *  - schema 校验失败 → 同上
 */

import { DiagnosisResult } from './schema';
import { mockSucculentBlackRot } from './mockDiagnosis';

type Provider = 'gateway' | 'mock';

export interface LLMInput {
  images: string[]; // base64 data URLs e.g. "data:image/jpeg;base64,..."
  waterFreq?: string;
  light?: string;
  soil?: string;
  description?: string;
  plantSelfReport?: string;
  city?: string;
}

export interface LLMOutput {
  provider: Provider;
  result: DiagnosisResult;
  /** 当 provider !== mock 但实际调用失败时，附失败原因（仍返回 mock） */
  fallbackReason?: string;
}

function gatewayUrl(): string {
  // Vite-define-injected. vite.config.ts 兜底为
  // https://mvp-gateway.workers.dev；本地开发可通过 VITE_GATEWAY_URL 覆盖。
  // 同时支持 import.meta.env.VITE_GATEWAY_URL 让 Capacitor live-reload 场景能改。
  const fromEnv =
    typeof import.meta !== 'undefined' && import.meta.env
      ? (import.meta.env.VITE_GATEWAY_URL as string | undefined)
      : undefined;
  return fromEnv || __GATEWAY_URL__;
}

function validateOrThrow(raw: unknown): DiagnosisResult {
  const parsed = DiagnosisResult.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      `Schema 校验失败：${parsed.error.issues
        .slice(0, 3)
        .map((i) => `${i.path.join('.')}=${i.message}`)
        .join('; ')}`,
    );
  }
  return parsed.data;
}

/** 调远端 gateway，超时 60s 内必须返回。 */
async function callGateway(input: LLMInput): Promise<DiagnosisResult> {
  const url = `${gatewayUrl().replace(/\/$/, '')}/diagnose`;
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 60_000);

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        images: input.images.slice(0, 3),
        waterFreq: input.waterFreq,
        light: input.light,
        soil: input.soil,
        description: input.description,
        plantSelfReport: input.plantSelfReport,
        city: input.city,
      }),
      signal: ac.signal,
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => '');
      throw new Error(`gateway ${resp.status}：${errText.slice(0, 200)}`);
    }

    const data = (await resp.json()) as unknown;
    // gateway 默认返回 { result: DiagnosisResult, lint?: {...} }；
    // 也兼容直接返回 DiagnosisResult 的旧版本。
    const candidate =
      data && typeof data === 'object' && 'result' in (data as Record<string, unknown>)
        ? (data as { result: unknown }).result
        : data;
    return validateOrThrow(candidate);
  } finally {
    clearTimeout(timer);
  }
}

// ---------- 公共入口 ----------

export async function diagnose(input: LLMInput): Promise<LLMOutput> {
  try {
    const result = await callGateway(input);
    return { provider: 'gateway', result };
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e);
    return {
      provider: 'mock',
      result: mockSucculentBlackRot(),
      fallbackReason: reason,
    };
  }
}
