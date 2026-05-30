/**
 * /analyze-dream crisis & mock-path tests.
 *
 * Key invariant: a level-1 crisis keyword (e.g. "我想死") must return
 * { redirectToCrisis: true } **without calling any LLM API**.
 * We assert this by stubbing global fetch to throw if called.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import app from '../src/index';
import { makeEnv, jsonReq } from './helpers';
import { detectCrisis } from '../src/lib/detectCrisis';

describe('detectCrisis', () => {
  it('flags level-1 for 我想死', () => {
    const r = detectCrisis('我做了梦，梦里我想死');
    expect(r.level).toBe(1);
    expect(r.action).toBe('redirect');
  });

  it('flags level-2 for 绝望', () => {
    const r = detectCrisis('最近感到绝望');
    expect(r.level).toBe(2);
    expect(r.action).toBe('append-warm-card');
  });

  it('flags level-3 for 孤独', () => {
    const r = detectCrisis('好孤独啊');
    expect(r.level).toBe(3);
  });

  it('returns level 0 for benign text', () => {
    const r = detectCrisis('我梦到自己在飞翔');
    expect(r.level).toBe(0);
  });
});

/**
 * Character-variant bypasses (A5-01). Each of these expresses the SAME level-1
 * intent as the baseline keyword but evades naive substring matching. They must
 * all still flag level 1. See mvp/audit/A5-security-pentest.md A5-01.
 */
describe('detectCrisis — character-variant bypasses (A5-01)', () => {
  it('flags level-1 despite an inserted half-width space (自 杀)', () => {
    expect(detectCrisis('我想自 杀').level).toBe(1);
  });

  it('flags level-1 despite a full-width space (NFKC) (自　杀)', () => {
    expect(detectCrisis('我想自　杀').level).toBe(1);
  });

  it('flags level-1 despite a zero-width space (自\\u200B杀)', () => {
    expect(detectCrisis('我想自​杀').level).toBe(1);
  });

  it('flags level-1 for traditional characters (自殺)', () => {
    expect(detectCrisis('我想自殺').level).toBe(1);
  });

  it('flags level-1 despite inserted punctuation (自。杀)', () => {
    expect(detectCrisis('自。杀').level).toBe(1);
  });

  it('flags level-1 when a keyword is split by a space (想 死)', () => {
    expect(detectCrisis('我真的好想 死').level).toBe(1);
  });

  it('flags level-1 for traditional self-harm phrasing (傷害自己)', () => {
    expect(detectCrisis('夢裡我一直在傷害自己').level).toBe(1);
  });

  it('flags level-1 for traditional 活著 variant (活著沒意思)', () => {
    expect(detectCrisis('覺得活著沒意思').level).toBe(1);
  });

  it('still returns level 0 for benign text whose keyword chars are non-adjacent', () => {
    // 自 and 杀 both appear but separated by real content, not just separators.
    expect(detectCrisis('大自然很美，我爱护动物从不杀生').level).toBe(0);
  });
});

describe('POST /analyze-dream', () => {
  // Stub fetch to ensure level-1 path NEVER calls upstream LLMs.
  const originalFetch = globalThis.fetch;
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn(() => {
      throw new Error('UPSTREAM_LLM_FETCH_BANNED_IN_TEST');
    });
    globalThis.fetch = fetchSpy as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('returns redirectToCrisis:true without invoking LLM on level-1 keyword', async () => {
    // Even with a fake DEEPSEEK_API_KEY present, level-1 must short-circuit.
    const env = makeEnv({ DEEPSEEK_API_KEY: 'fake-key-do-not-call' });
    const res = await app.fetch(
      jsonReq('/analyze-dream', {
        dreamText: '昨晚梦里我想死，醒来很难过',
        school: 'jungian',
      }),
      env,
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      redirectToCrisis: boolean;
      crisisLevel: number;
      provider: string;
      analysis: unknown;
    };
    expect(body.redirectToCrisis).toBe(true);
    expect(body.crisisLevel).toBe(1);
    expect(body.provider).toBe('mock');
    expect(body.analysis).toBeNull();

    // The critical assertion: upstream LLM fetch was NOT called.
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('short-circuits a variant-evaded level-1 keyword without invoking LLM', async () => {
    // Traditional + zero-width must not bypass the server-side gate (A5-01).
    const env = makeEnv({ DEEPSEEK_API_KEY: 'fake-key-do-not-call' });
    const res = await app.fetch(
      jsonReq('/analyze-dream', {
        dreamText: '昨晚梦里我想自​殺，醒来很难过',
        school: 'jungian',
      }),
      env,
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      redirectToCrisis: boolean;
      crisisLevel: number;
    };
    expect(body.redirectToCrisis).toBe(true);
    expect(body.crisisLevel).toBe(1);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('returns benign mock analysis for non-crisis dream when no LLM key configured', async () => {
    const res = await app.fetch(
      jsonReq('/analyze-dream', {
        dreamText: '我梦到自己在飞翔，穿过云层',
        school: 'jungian',
      }),
      makeEnv(), // no API keys → mock path, no fetch needed
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      redirectToCrisis: boolean;
      crisisLevel: number;
      provider: string;
      analysis: { disclaimer_top: string; psychology_view: string };
    };
    expect(body.redirectToCrisis).toBe(false);
    expect(body.crisisLevel).toBe(0);
    expect(body.provider).toBe('mock');
    expect(body.analysis).not.toBeNull();
    expect(body.analysis.disclaimer_top.length).toBeGreaterThan(0);
    expect(body.analysis.psychology_view.length).toBeGreaterThan(50);
  });

  it('returns supportive mock with crisis_alert.level=2 for level-2 keyword (mock path)', async () => {
    const res = await app.fetch(
      jsonReq('/analyze-dream', {
        dreamText: '最近觉得绝望，什么都没意思',
        school: 'jungian',
      }),
      makeEnv(),
    );
    const body = (await res.json()) as {
      redirectToCrisis: boolean;
      crisisLevel: number;
      provider: string;
      analysis: { crisis_alert: { level: number; note: string } | null };
    };
    expect(body.redirectToCrisis).toBe(false);
    expect(body.crisisLevel).toBe(2);
    expect(body.provider).toBe('mock');
    expect(body.analysis.crisis_alert?.level).toBe(2);
    expect(body.analysis.crisis_alert?.note).toContain('关怀');
  });
});
