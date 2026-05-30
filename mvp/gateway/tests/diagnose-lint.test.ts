/**
 * lintAction direct tests + integration via /diagnose mock fallback.
 *
 * Critical: a forged LLM output containing "多菌灵 1:1000" must be sanitized to
 * "请咨询本地园艺师或农资人员" before reaching the client.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import app from '../src/index';
import { makeEnv, jsonReq } from './helpers';
import {
  lintDiagnosisResult,
  lintText,
  SAFE_REPLACEMENT,
  type DiagnosisResult,
} from '../src/lib/lintAction';

describe('lintAction', () => {
  it('replaces pesticide name 多菌灵 with safe replacement', () => {
    const r = lintText('使用多菌灵稀释 1:1000 喷洒');
    expect(r.hit).toBe(true);
    expect(r.cleaned).toBe(SAFE_REPLACEMENT);
    expect(r.matches).toEqual(expect.arrayContaining(['多菌灵', '1:1000']));
  });

  it('replaces dosage pattern 5ml/L on its own', () => {
    const r = lintText('用 5ml/L 喷洒叶面');
    expect(r.hit).toBe(true);
    expect(r.cleaned).toBe(SAFE_REPLACEMENT);
  });

  it('does not touch benign action text', () => {
    const r = lintText('保持土壤通风,见干浇透');
    expect(r.hit).toBe(false);
    expect(r.cleaned).toBe('保持土壤通风,见干浇透');
  });

  // Character-variant bypasses (A5-02): a pesticide name broken up by separators
  // or written in traditional form must still be redacted.
  it('redacts a pesticide name split by half-width spaces (多 菌 灵)', () => {
    const r = lintText('建议使用多 菌 灵喷洒');
    expect(r.hit).toBe(true);
    expect(r.cleaned).toBe(SAFE_REPLACEMENT);
    expect(r.matches).toContain('多菌灵');
  });

  it('redacts a pesticide name with a zero-width char (多菌\\u200B灵)', () => {
    const r = lintText('建议使用多菌​灵喷洒');
    expect(r.hit).toBe(true);
    expect(r.cleaned).toBe(SAFE_REPLACEMENT);
  });

  it('redacts a pesticide name written in traditional form (多菌靈)', () => {
    const r = lintText('建议使用多菌靈喷洒');
    expect(r.hit).toBe(true);
    expect(r.cleaned).toBe(SAFE_REPLACEMENT);
    expect(r.matches).toContain('多菌灵');
  });

  it('redacts a pesticide name with inserted punctuation (多·菌·灵)', () => {
    const r = lintText('建议使用多·菌·灵喷洒');
    expect(r.hit).toBe(true);
    expect(r.cleaned).toBe(SAFE_REPLACEMENT);
  });

  it('catches a full-width dosage ratio via NFKC (１：１０００)', () => {
    const r = lintText('稀释１：１０００后喷洒');
    expect(r.hit).toBe(true);
    expect(r.cleaned).toBe(SAFE_REPLACEMENT);
  });

  it('redacts forged LLM diagnosis result fields', () => {
    const fake: DiagnosisResult = {
      plant_name: '玉露',
      scientific_name: 'Haworthia cooperi',
      confidence: 0.9,
      image_quality_ok: true,
      image_quality_feedback: '',
      diagnosis: [
        {
          cause: '黑腐病',
          likelihood: '高',
          evidence: '叶基黑褐',
          severity: '重',
        },
      ],
      action_steps: [
        '第 1 步: 立即断水',
        '第 2 步: 喷洒多菌灵 1:1000 治疗',
      ],
      prognosis: {
        recovery_outlook: '中',
        time_to_observe: '2 周',
        fallback_if_fail: '继续按波尔多液处理',
      },
      calendar_30d: [
        { day: 1, action: '换土', type: 'repotting' },
        { day: 7, action: '可用阿维菌素喷洒', type: 'observation' },
      ],
      disclaimer: '本诊断仅供参考',
    };

    const { result, report } = lintDiagnosisResult(fake);
    expect(report.hits).toBeGreaterThanOrEqual(3);
    expect(result.action_steps[1]).toBe(SAFE_REPLACEMENT);
    expect(result.prognosis.fallback_if_fail).toBe(SAFE_REPLACEMENT);
    expect(result.calendar_30d[1]?.action).toBe(SAFE_REPLACEMENT);
    expect(report.matchedTokens).toEqual(
      expect.arrayContaining(['多菌灵', '阿维菌素', '波尔多液']),
    );
    expect(report.fields).toEqual(
      expect.arrayContaining([
        'action_steps[1]',
        'prognosis.fallback_if_fail',
        'calendar_30d[1].action',
      ]),
    );
  });
});

describe('POST /diagnose (mock fallback path)', () => {
  it('returns ok=true + lint report when no vision key configured', async () => {
    const tiny =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    const res = await app.fetch(
      jsonReq('/diagnose', {
        images: [tiny],
        description: 'leaf turning yellow',
      }),
      makeEnv(),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      ok: boolean;
      provider: string;
      result: { plant_name: string; disclaimer: string };
      lint: { hits: number; fields: string[] };
    };
    expect(body.ok).toBe(true);
    expect(body.provider).toBe('mock');
    expect(body.result.plant_name.length).toBeGreaterThan(0);
    expect(body.lint).toBeDefined();
    expect(typeof body.lint.hits).toBe('number');
    expect(res.headers.get('X-Compliance-Sanitized')).toBe('true');
  });

  it('rejects missing images with 400 invalid_input', async () => {
    const res = await app.fetch(
      jsonReq('/diagnose', { description: 'no images here' }),
      makeEnv(),
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { ok: boolean; error: { code: string } };
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe('invalid_input');
  });
});

/**
 * A5-14 / H1 SSRF: images MUST be inline base64 data:image/ URLs. A remote URL
 * (http/https/ftp) must be rejected at the schema layer and NEVER forwarded to the
 * vision provider — otherwise the provider server-side fetches the attacker URL.
 * We stub global fetch to throw if any upstream call is attempted.
 */
describe('POST /diagnose — images SSRF guard (A5-14)', () => {
  const originalFetch = globalThis.fetch;
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn(() => {
      throw new Error('UPSTREAM_VISION_FETCH_BANNED_IN_TEST');
    });
    globalThis.fetch = fetchSpy as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  const VISION_ENV = { ZHIPU_API_KEY: 'fake-vision-key-do-not-call' };
  const tinyPng =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

  it.each([
    ['http internal-metadata URL', 'http://169.254.169.254/latest/meta-data/'],
    ['https attacker URL', 'https://attacker.example.com/track?x=1'],
    ['ftp URL', 'ftp://attacker.example.com/x'],
    ['protocol-relative URL', '//attacker.example.com/x.png'],
    ['bare host', 'attacker.example.com/x.png'],
  ])('rejects a %s with 400 and never calls the vision provider', async (_label, url) => {
    const res = await app.fetch(
      jsonReq('/diagnose', { images: [url], description: 'leaf' }),
      makeEnv(VISION_ENV),
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { ok: boolean; error: { code: string } };
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe('invalid_input');
    // The SSRF-critical assertion: no upstream fetch was attempted.
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('rejects when one of several images is a remote URL (mixed array)', async () => {
    const res = await app.fetch(
      jsonReq('/diagnose', {
        images: [tinyPng, 'http://169.254.169.254/'],
      }),
      makeEnv(VISION_ENV),
    );
    expect(res.status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('rejects a non-image data URL (data:text/html)', async () => {
    const res = await app.fetch(
      jsonReq('/diagnose', { images: ['data:text/html;base64,PHNjcmlwdD4='] }),
      makeEnv(VISION_ENV),
    );
    expect(res.status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('accepts a valid data:image/png base64 URL (passes schema; no key still mock)', async () => {
    // With a key present + valid data URL, the handler WILL attempt the upstream
    // vision call (our stub throws → caught → mock fallback, 200). The point is the
    // request is NOT rejected at the schema layer like the remote URLs above.
    const res = await app.fetch(
      jsonReq('/diagnose', { images: [tinyPng], description: 'leaf turning yellow' }),
      makeEnv(VISION_ENV),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; provider: string };
    expect(body.ok).toBe(true);
    // A valid data URL reaches the provider call (then falls back to mock on the
    // stubbed throw) — proving the schema accepted it.
    expect(fetchSpy).toHaveBeenCalled();
    expect(body.provider).toBe('mock');
  });
});
