/**
 * Tests for POST /mobile-updates/check.
 *
 * Scenarios per task spec:
 *   1. same currentBundleVersion → updateAvailable: false
 *   2. newer manifest version    → updateAvailable: true + non-empty signed url
 *   3. unknown appId             → 400
 *   4. no manifest               → enabled: false
 *   + kill-switch, minNativeVersion gate, malformed JSON, missing platform.
 *
 * Runs the Hono app in-process via createApp(config) with a temp DATA_DIR.
 * `ali-oss` is mocked so the signed URL is deterministic and offline.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import type { Hono } from 'hono';
import type { AppEnv, Env, Manifest } from '../src/types';
import { writeManifest } from '../src/lib/manifest';

// Mock ali-oss so signOssGetUrl returns a signed-looking URL with no network.
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

const APP_ID = 'io.countdownpro.app';

let dataDir: string;
let config: Env;
let app: Hono<AppEnv>;

async function putManifest(manifest: Manifest): Promise<void> {
  await writeManifest(dataDir, manifest);
}

function makeManifest(overrides: Partial<Manifest> = {}): Manifest {
  return {
    appId: APP_ID,
    enabled: true,
    current: {
      version: '0.0.2-20260528120000',
      uploadedAt: '2026-05-28T12:00:00.000Z',
      objectKey: `mvp-ota/${APP_ID}/0.0.2-20260528120000.zip`,
      checksum: 'a'.repeat(64),
      message: '修复倒数日详情页崩溃',
    },
    history: [],
    version: 1,
    updatedAt: '2026-05-28T12:00:00.000Z',
    ...overrides,
  } as Manifest;
}

async function postCheck(body: unknown): Promise<Response> {
  return app.request('/mobile-updates/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(async () => {
  dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'mvp-ota-check-'));
  config = {
    ALIYUN_OSS_ENDPOINT: 'oss-cn-hangzhou.aliyuncs.com',
    ALIYUN_OSS_BUCKET: 'mvp-ota-bundles',
    ALIYUN_OSS_ACCESS_KEY_ID: 'test-ak',
    ALIYUN_OSS_ACCESS_KEY_SECRET: 'test-sk',
    DATA_DIR: dataDir,
  } as Env;
  const { createApp } = await import('../src/index');
  app = createApp(config);
});

afterEach(async () => {
  await fs.rm(dataDir, { recursive: true, force: true });
});

describe('POST /mobile-updates/check', () => {
  it('returns updateAvailable:false when currentBundleVersion equals manifest.current.version', async () => {
    await putManifest(makeManifest());
    const res = await postCheck({
      appId: APP_ID,
      platform: 'ios',
      nativeVersion: '0.0.1',
      currentBundleVersion: '0.0.2-20260528120000',
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as Record<string, unknown>;
    expect(json.enabled).toBe(true);
    expect(json.updateAvailable).toBe(false);
    expect(json.version).toBe('0.0.2-20260528120000');
    expect(json.url).toBeUndefined();
  });

  it('returns updateAvailable:true + non-empty url when versions differ', async () => {
    await putManifest(makeManifest());
    const res = await postCheck({
      appId: APP_ID,
      platform: 'ios',
      nativeVersion: '0.0.1',
      currentBundleVersion: '0.0.1-20260527120000',
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as Record<string, unknown>;
    expect(json.enabled).toBe(true);
    expect(json.updateAvailable).toBe(true);
    expect(json.version).toBe('0.0.2-20260528120000');
    expect(typeof json.url).toBe('string');
    expect((json.url as string).length).toBeGreaterThan(0);
    expect(json.url).toMatch(/^https:\/\//);
    expect(json.url).toMatch(/Signature/);
    expect(json.checksum).toBe('a'.repeat(64));
  });

  it('returns updateAvailable:true when client has no currentBundleVersion (first install of OTA-enabled native)', async () => {
    await putManifest(makeManifest());
    const res = await postCheck({
      appId: APP_ID,
      platform: 'ios',
      nativeVersion: '0.0.1',
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as Record<string, unknown>;
    expect(json.enabled).toBe(true);
    expect(json.updateAvailable).toBe(true);
    expect(typeof json.url).toBe('string');
  });

  it('rejects unknown appId with 400', async () => {
    const res = await postCheck({
      appId: 'io.unknown.app',
      platform: 'ios',
      nativeVersion: '0.0.1',
    });
    expect(res.status).toBe(400);
    const json = (await res.json()) as { error?: { code?: string } };
    expect(json.error?.code).toBe('invalid_input');
  });

  it('returns enabled:false when manifest is absent', async () => {
    // No manifest written for APP_ID — readManifest returns null.
    const res = await postCheck({
      appId: APP_ID,
      platform: 'ios',
      nativeVersion: '0.0.1',
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as Record<string, unknown>;
    expect(json.enabled).toBe(false);
    expect(json.updateAvailable).toBe(false);
  });

  it('returns enabled:false when manifest.enabled === false (kill switch)', async () => {
    await putManifest(makeManifest({ enabled: false }));
    const res = await postCheck({
      appId: APP_ID,
      platform: 'ios',
      nativeVersion: '0.0.1',
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as Record<string, unknown>;
    expect(json.enabled).toBe(false);
  });

  it('gates download when nativeVersion < minNativeVersion', async () => {
    await putManifest(
      makeManifest({
        current: {
          version: '0.0.2-20260528120000',
          uploadedAt: '2026-05-28T12:00:00.000Z',
          objectKey: `mvp-ota/${APP_ID}/0.0.2-20260528120000.zip`,
          checksum: 'b'.repeat(64),
          minNativeVersion: '0.0.5',
        },
      }),
    );
    const res = await postCheck({
      appId: APP_ID,
      platform: 'ios',
      nativeVersion: '0.0.1',
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as Record<string, unknown>;
    expect(json.enabled).toBe(true);
    expect(json.updateAvailable).toBe(false);
    expect(json.minNativeVersion).toBe('0.0.5');
    expect(json.url).toBeUndefined();
  });

  it('returns 400 on malformed JSON', async () => {
    const res = await app.request('/mobile-updates/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{not-json',
    });
    expect(res.status).toBe(400);
    const json = (await res.json()) as { error?: { code?: string } };
    expect(json.error?.code).toBe('invalid_json');
  });

  it('rejects missing platform with 400', async () => {
    const res = await postCheck({
      appId: APP_ID,
      nativeVersion: '0.0.1',
    });
    expect(res.status).toBe(400);
  });
});
