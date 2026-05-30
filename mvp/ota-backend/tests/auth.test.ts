import { describe, it, expect, vi } from 'vitest';
import {
  extractBearer,
  timingSafeEqual,
  verifyAdminAuth,
  assertTokenStrength,
  resolveAdminToken,
  MIN_TOKEN_LENGTH,
} from '../src/lib/auth';
import { appTokenEnvVar } from '../src/types';
import type { Env } from '../src/types';

describe('extractBearer', () => {
  it('returns token from "Bearer <token>"', () => {
    expect(extractBearer('Bearer abc123')).toBe('abc123');
  });

  it('is case-insensitive on the "Bearer" prefix', () => {
    expect(extractBearer('bearer xyz')).toBe('xyz');
    expect(extractBearer('BEARER xyz')).toBe('xyz');
  });

  it('returns null for null/undefined/empty', () => {
    expect(extractBearer(null)).toBeNull();
    expect(extractBearer(undefined)).toBeNull();
    expect(extractBearer('')).toBeNull();
  });

  it('returns null when prefix missing', () => {
    expect(extractBearer('abc')).toBeNull();
    expect(extractBearer('Token abc')).toBeNull();
  });

  it('returns null when token portion is empty', () => {
    expect(extractBearer('Bearer ')).toBeNull();
    expect(extractBearer('Bearer    ')).toBeNull();
  });
});

describe('timingSafeEqual', () => {
  it('returns true for identical strings', () => {
    expect(timingSafeEqual('abc', 'abc')).toBe(true);
  });

  it('returns false for different strings', () => {
    expect(timingSafeEqual('abc', 'abd')).toBe(false);
  });

  it('returns false for different lengths', () => {
    expect(timingSafeEqual('abc', 'abcd')).toBe(false);
    expect(timingSafeEqual('', 'a')).toBe(false);
  });
});

describe('verifyAdminAuth', () => {
  it('accepts matching token', () => {
    expect(verifyAdminAuth('Bearer secret', 'secret')).toBe(true);
  });

  it('rejects missing header', () => {
    expect(verifyAdminAuth(null, 'secret')).toBe(false);
    expect(verifyAdminAuth(undefined, 'secret')).toBe(false);
  });

  it('rejects empty expected token', () => {
    expect(verifyAdminAuth('Bearer anything', '')).toBe(false);
  });

  it('rejects mismatched token', () => {
    expect(verifyAdminAuth('Bearer wrong', 'secret')).toBe(false);
  });

  it('rejects null/undefined expected token', () => {
    expect(verifyAdminAuth('Bearer anything', null)).toBe(false);
    expect(verifyAdminAuth('Bearer anything', undefined)).toBe(false);
  });
});

describe('appTokenEnvVar', () => {
  it('maps known appIds to OTA_TOKEN_<APP>', () => {
    expect(appTokenEnvVar('io.shijingnaming.app')).toBe('OTA_TOKEN_SHIJINGNAMING');
    expect(appTokenEnvVar('io.countdownpro.app')).toBe('OTA_TOKEN_COUNTDOWNPRO');
    expect(appTokenEnvVar('io.plantdoctor.app')).toBe('OTA_TOKEN_PLANTDOCTOR');
    expect(appTokenEnvVar('io.dreamjournal.app')).toBe('OTA_TOKEN_DREAMJOURNAL');
    expect(appTokenEnvVar('io.petcards.app')).toBe('OTA_TOKEN_PETCARDS');
  });

  it('returns null for ids that do not match io.<mid>.app', () => {
    expect(appTokenEnvVar('io.not-real.app')).toBeNull(); // hyphen not in [a-z0-9]
    expect(appTokenEnvVar('com.foo.app')).toBeNull();
    expect(appTokenEnvVar('garbage')).toBeNull();
  });
});

describe('assertTokenStrength', () => {
  it('accepts tokens >= MIN_TOKEN_LENGTH', () => {
    expect(assertTokenStrength('x'.repeat(MIN_TOKEN_LENGTH), 'TEST')).toBe(true);
    expect(assertTokenStrength('x'.repeat(MIN_TOKEN_LENGTH + 10), 'TEST')).toBe(true);
  });

  it('rejects short / empty tokens and warns', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(assertTokenStrength('short', 'TEST_LABEL_A')).toBe(false);
    expect(assertTokenStrength('', 'TEST_LABEL_B')).toBe(false);
    expect(assertTokenStrength(undefined, 'TEST_LABEL_C')).toBe(false);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe('resolveAdminToken', () => {
  const baseEnv = {
    OTA_ADMIN_TOKEN: 'shared-'.padEnd(40, 'x'),
    OTA_TOKEN_COUNTDOWNPRO: 'countdownpro-'.padEnd(40, 'y'),
  } as unknown as Env;

  it('returns the per-app token when configured', () => {
    expect(resolveAdminToken(baseEnv, 'io.countdownpro.app')).toBe(baseEnv.OTA_TOKEN_COUNTDOWNPRO);
  });

  it('falls back to the shared token when no per-app token exists', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(resolveAdminToken(baseEnv, 'io.dreamjournal.app')).toBe(baseEnv.OTA_ADMIN_TOKEN);
    expect(warn).toHaveBeenCalled(); // fallback warns
    warn.mockRestore();
  });

  it('falls back to shared for unknown appId shape', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(resolveAdminToken(baseEnv, 'io.not-real.app')).toBe(baseEnv.OTA_ADMIN_TOKEN);
    warn.mockRestore();
  });

  it('returns null when neither per-app nor shared token is configured', () => {
    const empty = {} as unknown as Env;
    expect(resolveAdminToken(empty, 'io.dreamjournal.app')).toBeNull();
  });
});
