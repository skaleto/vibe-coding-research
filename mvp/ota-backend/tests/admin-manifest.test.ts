/**
 * Tests for the admin manifest routes.
 *
 *   POST /admin/manifest          publish a new bundle (Bearer auth)
 *   GET  /admin/manifest/:appId   fetch manifest        (Bearer auth)
 *
 * Runs the Hono app in-process via createApp(config) with a temp DATA_DIR and
 * an injected token config. countdownpro + petcards have per-app tokens; the
 * other apps fall back to the shared OTA_ADMIN_TOKEN (exercised below).
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import type { Hono } from 'hono';
import type { AppEnv, Env } from '../src/types';

const APP_ID = 'io.countdownpro.app';
// countdownpro has a per-app token; admin auth for this appId resolves to
// OTA_TOKEN_COUNTDOWNPRO (not the shared OTA_ADMIN_TOKEN).
const TOKEN = 'test-token-countdownpro-0123456789abcdef';
// Shared fallback token (OTA_ADMIN_TOKEN). Used for appIds without a per-app
// secret — including unknown appIds, which fall back before the 400 check.
const SHARED_TOKEN = 'test-shared-admin-token-0123456789abcdef';

let dataDir: string;
let app: Hono<AppEnv>;

function makeConfig(dir: string): Env {
  return {
    ALIYUN_OSS_ENDPOINT: 'oss-cn-hangzhou.aliyuncs.com',
    ALIYUN_OSS_BUCKET: 'mvp-ota-bundles',
    ALIYUN_OSS_ACCESS_KEY_ID: 'test-ak',
    ALIYUN_OSS_ACCESS_KEY_SECRET: 'test-sk',
    DATA_DIR: dir,
    OTA_ADMIN_TOKEN: SHARED_TOKEN,
    // Per-app token configured for countdownpro + petcards only.
    OTA_TOKEN_COUNTDOWNPRO: TOKEN,
    OTA_TOKEN_PETCARDS: 'test-token-petcards-0123456789abcdefghij',
  } as Env;
}

async function publish(body: unknown, opts: { auth?: string | null } = {}): Promise<Response> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (opts.auth !== null && opts.auth !== undefined) {
    headers.Authorization = opts.auth;
  }
  return app.request('/admin/manifest', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

async function getManifest(appId: string, opts: { auth?: string | null } = {}): Promise<Response> {
  const headers: Record<string, string> = {};
  if (opts.auth !== null && opts.auth !== undefined) {
    headers.Authorization = opts.auth;
  }
  return app.request(`/admin/manifest/${appId}`, { headers });
}

beforeEach(async () => {
  dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'mvp-ota-admin-'));
  const { createApp } = await import('../src/index');
  app = createApp(makeConfig(dataDir));
});

afterEach(async () => {
  await fs.rm(dataDir, { recursive: true, force: true });
});

describe('POST /admin/manifest (auth)', () => {
  it('returns 401 when no Authorization header', async () => {
    const res = await publish({}, { auth: null });
    expect(res.status).toBe(401);
    const json = (await res.json()) as { error?: { code?: string } };
    expect(json.error?.code).toBe('unauthorized');
  });

  it('returns 401 for incorrect token', async () => {
    const res = await publish(
      {
        appId: APP_ID,
        version: '0.0.1',
        objectKey: `mvp-ota/${APP_ID}/0.0.1.zip`,
        checksum: 'a'.repeat(64),
      },
      { auth: 'Bearer wrong-token' },
    );
    expect(res.status).toBe(401);
  });

  it('returns 401 for malformed Authorization (no Bearer prefix)', async () => {
    const res = await publish(
      { appId: APP_ID, version: '0.0.1', objectKey: 'k', checksum: 'c' },
      { auth: TOKEN },
    );
    expect(res.status).toBe(401);
  });

  it('accepts valid token and creates first manifest', async () => {
    const res = await publish(
      {
        appId: APP_ID,
        version: '0.0.1-20260527000000',
        objectKey: `mvp-ota/${APP_ID}/0.0.1-20260527000000.zip`,
        checksum: 'a'.repeat(64),
        message: 'first release',
      },
      { auth: `Bearer ${TOKEN}` },
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok?: boolean; manifest?: { current?: { version?: string }; history?: unknown[] } };
    expect(json.ok).toBe(true);
    expect(json.manifest?.current?.version).toBe('0.0.1-20260527000000');
    expect(json.manifest?.history).toEqual([]);
  });
});

describe('POST /admin/manifest (data flow)', () => {
  it('pushes previous current into history on subsequent publishes', async () => {
    // First publish
    await publish(
      {
        appId: APP_ID,
        version: '0.0.1-20260527000000',
        objectKey: `mvp-ota/${APP_ID}/0.0.1-20260527000000.zip`,
        checksum: 'a'.repeat(64),
      },
      { auth: `Bearer ${TOKEN}` },
    );

    // Second publish
    const res = await publish(
      {
        appId: APP_ID,
        version: '0.0.2-20260528000000',
        objectKey: `mvp-ota/${APP_ID}/0.0.2-20260528000000.zip`,
        checksum: 'b'.repeat(64),
      },
      { auth: `Bearer ${TOKEN}` },
    );

    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      manifest: {
        current: { version: string };
        history: Array<{ version: string }>;
      };
    };
    expect(json.manifest.current.version).toBe('0.0.2-20260528000000');
    expect(json.manifest.history).toHaveLength(1);
    expect(json.manifest.history[0]?.version).toBe('0.0.1-20260527000000');
  });

  it('caps history at 20 entries', async () => {
    // Publish 22 versions in sequence
    for (let i = 1; i <= 22; i++) {
      const v = `0.0.${i}-test`;
      await publish(
        {
          appId: APP_ID,
          version: v,
          objectKey: `mvp-ota/${APP_ID}/${v}.zip`,
          checksum: String(i).padStart(64, '0'),
        },
        { auth: `Bearer ${TOKEN}` },
      );
    }
    const res = await getManifest(APP_ID, { auth: `Bearer ${TOKEN}` });
    const json = (await res.json()) as { manifest: { current: { version: string }; history: Array<{ version: string }> } };
    expect(json.manifest.current.version).toBe('0.0.22-test');
    expect(json.manifest.history).toHaveLength(20);
    // Most recent in history is v21, oldest is v2 (v1 rolled off)
    expect(json.manifest.history[0]?.version).toBe('0.0.21-test');
    expect(json.manifest.history.at(-1)?.version).toBe('0.0.2-test');
  });

  it('rejects unknown appId with 400', async () => {
    // Unknown appId has no per-app token → falls back to the shared token,
    // which is what we send here so we reach the appId validation (not 401).
    const res = await publish(
      {
        appId: 'io.not-real.app',
        version: '0.0.1',
        objectKey: 'mvp-ota/io.not-real.app/k.zip',
        checksum: 'c',
      },
      { auth: `Bearer ${SHARED_TOKEN}` },
    );
    expect(res.status).toBe(400);
  });

  it('rejects missing version with 400', async () => {
    const res = await publish(
      { appId: APP_ID, objectKey: `mvp-ota/${APP_ID}/k.zip`, checksum: 'c' },
      { auth: `Bearer ${TOKEN}` },
    );
    expect(res.status).toBe(400);
  });
});

describe('GET /admin/manifest/:appId', () => {
  it('returns 401 without auth', async () => {
    const res = await getManifest(APP_ID, { auth: null });
    expect(res.status).toBe(401);
  });

  it('returns 401 with wrong token', async () => {
    const res = await getManifest(APP_ID, { auth: 'Bearer wrong' });
    expect(res.status).toBe(401);
  });

  it('returns manifest:null when no manifest exists', async () => {
    const res = await getManifest(APP_ID, { auth: `Bearer ${TOKEN}` });
    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok?: boolean; manifest?: unknown };
    expect(json.ok).toBe(true);
    expect(json.manifest).toBeNull();
  });

  it('rejects unknown appId with 400', async () => {
    // Unknown appId falls back to the shared token; send it to reach the 400.
    const res = await getManifest('io.unknown.app', { auth: `Bearer ${SHARED_TOKEN}` });
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// C6 — per-app token auth (blast-radius reduction)
// ---------------------------------------------------------------------------
describe('POST /admin/manifest (per-app token auth)', () => {
  const PETCARDS = 'io.petcards.app';
  const DREAMJOURNAL = 'io.dreamjournal.app'; // no per-app token → falls back to shared
  const PETCARDS_TOKEN = 'test-token-petcards-0123456789abcdefghij';

  function publishFor(appId: string, token: string): Promise<Response> {
    const v = '0.0.1-perapp';
    return publish(
      { appId, version: v, objectKey: `mvp-ota/${appId}/${v}.zip`, checksum: 'a'.repeat(64) },
      { auth: `Bearer ${token}` },
    );
  }

  it("accepts an app's own per-app token (countdownpro)", async () => {
    const res = await publishFor(APP_ID, TOKEN);
    expect(res.status).toBe(200);
  });

  it("accepts a different app's own per-app token (petcards)", async () => {
    const res = await publishFor(PETCARDS, PETCARDS_TOKEN);
    expect(res.status).toBe(200);
  });

  it("rejects another app's per-app token (petcards token cannot publish countdownpro)", async () => {
    const res = await publishFor(APP_ID, PETCARDS_TOKEN);
    expect(res.status).toBe(401);
  });

  it('rejects the shared token for an app that HAS a per-app token (no fallback when configured)', async () => {
    // countdownpro has OTA_TOKEN_COUNTDOWNPRO, so the shared token must NOT work.
    const res = await publishFor(APP_ID, SHARED_TOKEN);
    expect(res.status).toBe(401);
  });

  it('falls back to the shared token for an app WITHOUT a per-app token (dreamjournal)', async () => {
    const res = await publishFor(DREAMJOURNAL, SHARED_TOKEN);
    expect(res.status).toBe(200);
  });

  it('rejects a per-app token used for an app that should use the shared fallback', async () => {
    // dreamjournal has no per-app secret; the countdownpro token must not work.
    const res = await publishFor(DREAMJOURNAL, TOKEN);
    expect(res.status).toBe(401);
  });
});
