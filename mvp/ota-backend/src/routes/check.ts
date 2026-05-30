/**
 * POST /mobile-updates/check
 *
 * Client version-check endpoint. Returns whether a new bundle is available
 * for the given (appId, currentBundleVersion) pair, plus a presigned OSS GET
 * URL when so.
 *
 * Contract: contract.md §2
 * Design:   design.md § OTA Backend "POST /mobile-updates/check"
 */

import { Hono } from 'hono';
import type { AppEnv, CheckReq, CheckResp } from '../types.js';
import { isKnownAppId } from '../types.js';
import { readManifest } from '../lib/manifest.js';
import { signOssGetUrl } from '../lib/oss-presign.js';
import { compareVersions } from '../lib/version.js';

export const checkRouter = new Hono<AppEnv>();

checkRouter.post('/mobile-updates/check', async (c) => {
  const config = c.get('config');

  // ---------- 1. parse body ---------------------------------------------------
  let body: Partial<CheckReq>;
  try {
    body = (await c.req.json()) as Partial<CheckReq>;
  } catch {
    return c.json(
      { error: { code: 'invalid_json', message: 'Request body is not valid JSON' } },
      400,
    );
  }

  if (!body || typeof body !== 'object') {
    return c.json(
      { error: { code: 'invalid_input', message: 'Request body must be a JSON object' } },
      400,
    );
  }

  // ---------- 2. validate fields ---------------------------------------------
  const { appId, platform, nativeVersion, currentBundleVersion } = body;

  if (!appId || typeof appId !== 'string') {
    return c.json(
      { error: { code: 'invalid_input', message: 'appId is required' } },
      400,
    );
  }

  // Unknown appId → 400 (per test spec). Differs from a softer "silent disable"
  // because callers in production code are the 5 known apps; an unknown id is
  // almost certainly a misconfigured client and should fail loud.
  if (!isKnownAppId(appId)) {
    return c.json(
      { error: { code: 'invalid_input', message: `Unknown appId: ${appId}` } },
      400,
    );
  }

  if (!platform || !['ios', 'android', 'web'].includes(platform)) {
    return c.json(
      { error: { code: 'invalid_input', message: 'platform must be ios|android|web' } },
      400,
    );
  }

  if (!nativeVersion || typeof nativeVersion !== 'string') {
    return c.json(
      { error: { code: 'invalid_input', message: 'nativeVersion is required' } },
      400,
    );
  }

  // ---------- 3. fetch manifest ---------------------------------------------
  const manifest = await readManifest(config.DATA_DIR, appId);

  // Manifest missing OR disabled OR no current bundle → enabled:false
  if (!manifest || manifest.enabled === false || !manifest.current) {
    const resp: CheckResp = { enabled: false, updateAvailable: false };
    return c.json(resp);
  }

  const current = manifest.current;

  // ---------- 4. minNativeVersion gate --------------------------------------
  if (current.minNativeVersion && compareVersions(nativeVersion, current.minNativeVersion) < 0) {
    const resp: CheckResp = {
      enabled: true,
      updateAvailable: false,
      version: current.version,
      minNativeVersion: current.minNativeVersion,
      message: '需要先升级到最新原生包',
    };
    return c.json(resp);
  }

  // ---------- 5. same-version short-circuit ---------------------------------
  // Contract §6: string equality, no semantic compare.
  if (currentBundleVersion && currentBundleVersion === current.version) {
    const resp: CheckResp = {
      enabled: true,
      updateAvailable: false,
      version: current.version,
      message: '当前已是最新版本',
    };
    return c.json(resp);
  }

  // ---------- 6. update available — sign URL --------------------------------
  let signedUrl: string;
  try {
    signedUrl = await signOssGetUrl(config, current.objectKey);
  } catch (err) {
    console.error('OSS sign failed', { appId, objectKey: current.objectKey, err: String(err) });
    // Cannot serve update without a download URL → behave as if manifest disabled.
    const resp: CheckResp = { enabled: false, updateAvailable: false };
    return c.json(resp);
  }

  const resp: CheckResp = {
    enabled: true,
    updateAvailable: true,
    version: current.version,
    url: signedUrl,
    checksum: current.checksum,
  };
  if (current.minNativeVersion) resp.minNativeVersion = current.minNativeVersion;
  if (current.message) resp.message = current.message;
  return c.json(resp);
});
