/**
 * /generate-names smoke tests:
 *  - mock path: no LLM keys → mock fallback returns 10 names + provider=mock + warning
 *  - bad input: 400 invalid_input + structured issues
 */
import { describe, it, expect } from 'vitest';
import app from '../src/index';
import { makeEnv, jsonReq } from './helpers';

describe('POST /generate-names', () => {
  it('returns mock names with provider=mock when no LLM key configured', async () => {
    const res = await app.fetch(
      jsonReq('/generate-names', {
        type: 'baby',
        surname: '李',
        gender: '男孩',
        vibe_tags: ['沉稳大气'],
      }),
      makeEnv(),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      names: Array<{ full_name: string }>;
      provider: string;
      warning?: string;
    };
    expect(body.provider).toBe('mock');
    expect(body.names.length).toBeGreaterThanOrEqual(5);
    // Mock names should reflect the requested surname.
    expect(body.names[0]?.full_name.startsWith('李')).toBe(true);
    expect(body.warning).toBeDefined();
    expect(res.headers.get('X-Compliance-Sanitized')).toBe('true');
    expect(res.headers.get('X-Provider')).toBe('mock');
  });

  it('rejects invalid input with 400 invalid_input', async () => {
    // gender 必填但缺失
    const res = await app.fetch(
      jsonReq('/generate-names', {
        type: 'baby',
        surname: '李',
        vibe_tags: ['沉稳大气'],
      }),
      makeEnv(),
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as {
      error: { code: string; issues?: Array<{ path: string; message: string }> };
    };
    expect(body.error.code).toBe('invalid_input');
    expect(body.error.issues?.length).toBeGreaterThan(0);
  });

  it('rejects invalid JSON body with 400 invalid_json', async () => {
    const res = await app.fetch(
      new Request('https://gateway.test/generate-names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{not json',
      }),
      makeEnv(),
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe('invalid_json');
  });
});
