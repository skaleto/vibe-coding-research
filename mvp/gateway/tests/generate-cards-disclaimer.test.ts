/**
 * /generate-cards tests.
 *
 * Key invariants:
 *  - Server **always** injects DISCLAIMER='⚠️ 仅供娱乐，AI 生成宠物心情卡片' on the card,
 *    even if LLM omits or overrides it.
 *  - Invalid input does NOT 4xx — returns 200 + mock + note (UX baseline).
 *  - Forbidden term in LLM output → falls back to mock with source='mock_fallback'.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import app from '../src/index';
import { makeEnv, jsonReq } from './helpers';
import { DISCLAIMER } from '../src/mocks/pet';

const FAKE_LLM_KEY = 'fake-key-stubbed';

function stubLlmReply(content: string): ReturnType<typeof vi.fn> {
  const spy = vi.fn(async () => {
    return new Response(
      JSON.stringify({ choices: [{ message: { content } }] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  });
  globalThis.fetch = spy as unknown as typeof fetch;
  return spy;
}

describe('POST /generate-cards', () => {
  const originalFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('returns mock + 200 + note when input invalid (no 4xx for 05)', async () => {
    const res = await app.fetch(
      jsonReq('/generate-cards', {
        // missing audioFeatures intentionally
        petType: 'cat',
        petName: 'Mochi',
        audioDurationSec: 3,
      }),
      makeEnv(),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      card: { disclaimer: string };
      source: string;
      provider: string;
      note?: string;
    };
    expect(body.source).toBe('mock_fallback');
    expect(body.provider).toBe('mock');
    expect(body.note).toBeDefined();
    expect(body.card.disclaimer).toBe(DISCLAIMER);
  });

  it('forces disclaimer when LLM omits the field', async () => {
    // LLM returns a card WITHOUT the disclaimer field.
    stubLlmReply(
      JSON.stringify({
        translation: ['喵主人来撒娇啦', '今天好开心', '抱抱我嘛~'],
        mood_tag: '撒娇',
        emoji_set: ['🐱', '💕', '🐾'],
        // disclaimer intentionally omitted
      }),
    );

    const res = await app.fetch(
      jsonReq('/generate-cards', {
        petType: 'cat',
        petName: '奶油',
        audioDurationSec: 3,
        audioFeatures: { pitch: 'high', burst: 'short_burst' },
      }),
      makeEnv({ DEEPSEEK_API_KEY: FAKE_LLM_KEY }),
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      card: { disclaimer: string; translation: string[] };
      source: string;
      provider: string;
    };
    expect(body.source).toBe('llm');
    expect(body.provider).toBe('deepseek');
    // Disclaimer must be force-injected.
    expect(body.card.disclaimer).toBe(DISCLAIMER);
    expect(body.card.translation[0]).toContain('喵主人');
  });

  it('forces disclaimer even when LLM provides a wrong/empty disclaimer', async () => {
    stubLlmReply(
      JSON.stringify({
        translation: ['一二三', '四五六', '七八九'],
        mood_tag: '开心',
        emoji_set: ['🐱', '💕', '🐾'],
        disclaimer: '某条不合规的免责声明',
      }),
    );

    const res = await app.fetch(
      jsonReq('/generate-cards', {
        petType: 'cat',
        petName: '布丁',
        audioDurationSec: 4,
        audioFeatures: { pitch: 'high', burst: 'short_burst' },
      }),
      makeEnv({ DEEPSEEK_API_KEY: FAKE_LLM_KEY }),
    );

    const body = (await res.json()) as { card: { disclaimer: string } };
    expect(body.card.disclaimer).toBe(DISCLAIMER);
  });

  it('falls back to mock when LLM output contains forbidden term', async () => {
    stubLlmReply(
      JSON.stringify({
        translation: ['这是兽医告诉我的', '你的猫有分离焦虑', '需要看兽医'],
        mood_tag: '抱怨',
        emoji_set: ['🐱', '💕', '🐾'],
        disclaimer: DISCLAIMER,
      }),
    );

    const res = await app.fetch(
      jsonReq('/generate-cards', {
        petType: 'cat',
        petName: 'Pancake',
        audioDurationSec: 5,
        audioFeatures: { pitch: 'low', burst: 'long_continuous' },
      }),
      makeEnv({ DEEPSEEK_API_KEY: FAKE_LLM_KEY }),
    );

    const body = (await res.json()) as {
      card: { disclaimer: string; translation: string[] };
      source: string;
      note?: string;
    };
    expect(body.source).toBe('mock_fallback');
    expect(body.card.disclaimer).toBe(DISCLAIMER);
    // mock translation should NOT contain forbidden terms.
    const concat = body.card.translation.join(' ');
    expect(concat).not.toContain('兽医');
    expect(concat).not.toContain('分离焦虑');
    expect(body.note).toBeDefined();
  });

  it('falls back to mock when a forbidden term is evaded by separators/variants (A5-02)', async () => {
    // Spaced "兽 医", zero-width "分离​焦虑", traditional "獸醫" must all be caught.
    stubLlmReply(
      JSON.stringify({
        translation: ['这是兽 医说的', '你的猫有分离​焦虑', '快带去看獸醫'],
        mood_tag: '抱怨',
        emoji_set: ['🐱', '💕', '🐾'],
        disclaimer: DISCLAIMER,
      }),
    );

    const res = await app.fetch(
      jsonReq('/generate-cards', {
        petType: 'cat',
        petName: 'Waffle',
        audioDurationSec: 5,
        audioFeatures: { pitch: 'low', burst: 'long_continuous' },
      }),
      makeEnv({ DEEPSEEK_API_KEY: FAKE_LLM_KEY }),
    );

    const body = (await res.json()) as {
      card: { translation: string[] };
      source: string;
    };
    expect(body.source).toBe('mock_fallback');
    const concat = body.card.translation.join(' ');
    expect(concat).not.toContain('兽');
    expect(concat).not.toContain('焦虑');
  });
});
