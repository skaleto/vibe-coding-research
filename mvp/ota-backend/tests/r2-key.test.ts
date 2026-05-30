/**
 * Unit tests for objectKey validation (C6-1 / F-01 / A5-08 path-traversal
 * defence) and the defence-in-depth guard inside signOssGetUrl (C6-2).
 *
 * (Filename kept as r2-key.test.ts for git history; the storage backend is now
 * Aliyun OSS. `ali-oss` is mocked so signing never hits the network.)
 */

import { describe, it, expect, vi } from 'vitest';
import { isStructurallySafeKey, validatePublishObjectKey } from '../src/lib/r2-key';
import { signOssGetUrl } from '../src/lib/oss-presign';
import type { Env } from '../src/types';

const APP_ID = 'io.petcards.app';

// Mock ali-oss: signatureUrl returns a deterministic, signed-looking URL so we
// can assert the call path without any network access. The mock echoes the key
// so prefix assertions still work.
vi.mock('ali-oss', () => {
  class FakeOSS {
    private bucket: string;
    private endpoint: string;
    constructor(opts: { bucket: string; endpoint: string }) {
      this.bucket = opts.bucket;
      this.endpoint = opts.endpoint;
    }
    signatureUrl(key: string, opts: { expires: number; method: string }): string {
      const u = new URL(`https://${this.bucket}.${this.endpoint}/${key}`);
      u.searchParams.set('Expires', String(opts.expires));
      u.searchParams.set('OSSAccessKeyId', 'mock-ak');
      u.searchParams.set('Signature', 'mock-signature');
      return u.toString();
    }
  }
  return { default: FakeOSS };
});

describe('isStructurallySafeKey', () => {
  it('accepts a normal appId-prefixed key', () => {
    expect(isStructurallySafeKey(`mvp-ota/${APP_ID}/0.0.2-20260528.zip`).ok).toBe(true);
  });

  it('rejects empty / non-string', () => {
    expect(isStructurallySafeKey('').ok).toBe(false);
    expect(isStructurallySafeKey(undefined).ok).toBe(false);
    expect(isStructurallySafeKey(null).ok).toBe(false);
    expect(isStructurallySafeKey(123 as unknown).ok).toBe(false);
  });

  it('rejects literal ".." traversal in any position', () => {
    expect(isStructurallySafeKey('../io.dreamjournal.app/evil.zip').ok).toBe(false);
    expect(isStructurallySafeKey('mvp-ota/io.petcards.app/../io.dreamjournal.app/evil.zip').ok).toBe(false);
    expect(isStructurallySafeKey('mvp-ota/io.petcards.app/sub/..').ok).toBe(false);
    expect(isStructurallySafeKey('..').ok).toBe(false);
  });

  it('rejects percent-encoded dot traversal (%2e%2e / %2E)', () => {
    expect(isStructurallySafeKey('%2e%2e/io.dreamjournal.app/evil.zip').ok).toBe(false);
    expect(isStructurallySafeKey('mvp-ota/io.petcards.app/%2E%2E/evil.zip').ok).toBe(false);
    // a lone %2f (encoded slash) is still rejected by the no-percent rule
    expect(isStructurallySafeKey('mvp-ota/io.petcards.app%2f..%2fevil.zip').ok).toBe(false);
  });

  it('rejects any percent-encoding', () => {
    expect(isStructurallySafeKey('mvp-ota/io.petcards.app/a%20b.zip').ok).toBe(false);
  });

  it('rejects leading slash (absolute path)', () => {
    expect(isStructurallySafeKey('/io.petcards.app/evil.zip').ok).toBe(false);
    expect(isStructurallySafeKey('/etc/passwd').ok).toBe(false);
  });

  it('rejects consecutive slashes', () => {
    expect(isStructurallySafeKey('mvp-ota/io.petcards.app//evil.zip').ok).toBe(false);
  });

  it('rejects disallowed characters', () => {
    expect(isStructurallySafeKey('mvp-ota/io.petcards.app/a b.zip').ok).toBe(false); // space
    expect(isStructurallySafeKey('mvp-ota/io.petcards.app/a+b.zip').ok).toBe(false); // plus
    expect(isStructurallySafeKey('mvp-ota/io.petcards.app/évil.zip').ok).toBe(false); // non-ascii
    expect(isStructurallySafeKey('mvp-ota/io.petcards.app/a?b.zip').ok).toBe(false); // query char
  });
});

describe('validatePublishObjectKey (admin-side prefix enforcement)', () => {
  it('accepts a key prefixed with `mvp-ota/${appId}/`', () => {
    expect(validatePublishObjectKey(`mvp-ota/${APP_ID}/0.0.1.zip`, APP_ID).ok).toBe(true);
  });

  it('rejects a key without the appId prefix (cross-app poisoning)', () => {
    const res = validatePublishObjectKey('mvp-ota/io.dreamjournal.app/evil.zip', APP_ID);
    expect(res.ok).toBe(false);
    expect(res.reason).toMatch(/must start with/);
  });

  it('rejects a key that is exactly the prefix with no object name', () => {
    expect(validatePublishObjectKey(`mvp-ota/${APP_ID}/`, APP_ID).ok).toBe(false);
  });

  it('rejects traversal even when it appears to start with the prefix', () => {
    // structural ".." check fires first
    expect(validatePublishObjectKey(`mvp-ota/${APP_ID}/../io.dreamjournal.app/evil.zip`, APP_ID).ok).toBe(false);
  });
});

describe('signOssGetUrl defence-in-depth (C6-2)', () => {
  const env = {
    ALIYUN_OSS_ENDPOINT: 'oss-cn-hangzhou.aliyuncs.com',
    ALIYUN_OSS_BUCKET: 'mvp-ota-bundles',
    ALIYUN_OSS_ACCESS_KEY_ID: 'ak',
    ALIYUN_OSS_ACCESS_KEY_SECRET: 'sk',
  } as unknown as Env;

  it('refuses to sign a `..` traversal key even if admin validation were bypassed', async () => {
    await expect(signOssGetUrl(env, '../io.dreamjournal.app/secret.zip')).rejects.toThrow(/unsafe OSS key/);
  });

  it('refuses to sign an absolute-path key', async () => {
    await expect(signOssGetUrl(env, '/io.dreamjournal.app/secret.zip')).rejects.toThrow(/unsafe OSS key/);
  });

  it('signs a structurally-safe key', async () => {
    const url = await signOssGetUrl(env, `mvp-ota/${APP_ID}/0.0.1.zip`);
    expect(url).toMatch(/^https:\/\//);
    expect(url).toMatch(/Signature/);
    expect(url).toContain(`mvp-ota/${APP_ID}/0.0.1.zip`);
  });
});
