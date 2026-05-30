/**
 * Admin routes.
 *
 *   POST /admin/manifest          — publish a new bundle version (Bearer auth)
 *   GET  /admin/manifest/:appId   — fetch the full manifest      (Bearer auth)
 *
 * Auth (C6): each appId has its own admin token `OTA_TOKEN_<APP>`, falling back
 * to the legacy shared `OTA_ADMIN_TOKEN`. The middleware resolves the target
 * appId from the request (POST body / GET path param), picks the matching
 * token, and does a constant-time compare. This shrinks the supply-chain blast
 * radius: leaking one app's token no longer lets an attacker poison the others.
 *
 * Design: design.md § OTA Backend "POST /admin/manifest"
 */

import { Hono } from 'hono';
import type { AppEnv, BundleRecord, PublishReq } from '../types.js';
import { isKnownAppId } from '../types.js';
import { publishBundle, readManifest } from '../lib/manifest.js';
import { verifyAdminAuthForApp } from '../lib/auth.js';
import { validatePublishObjectKey } from '../lib/r2-key.js';

export const adminRouter = new Hono<AppEnv>();

/**
 * Bearer-auth middleware shared by both admin routes.
 *
 * The expected token is per-app, so we must know which appId is being targeted
 * before we can pick it. For POST the appId lives in the JSON body, which we
 * peek (and stash on `c.set('parsedBody')`) so the handler need not re-parse.
 * For GET it's the `:appId` path param.
 */
adminRouter.use('/admin/*', async (c, next) => {
  const config = c.get('config');
  const auth = c.req.header('Authorization');

  let appId: string | undefined;
  if (c.req.method === 'POST') {
    // Peek the body to learn the target appId. Tolerate parse failure here —
    // the POST handler will return a clean 400 for invalid JSON after auth.
    try {
      const body = (await c.req.json()) as Partial<PublishReq>;
      c.set('parsedBody', body);
      if (typeof body?.appId === 'string') appId = body.appId;
    } catch {
      c.set('parsedBody', undefined);
    }
  } else {
    // This middleware is mounted on the `/admin/*` wildcard, so the `:appId`
    // route param is not yet bound here — derive it from the path instead.
    // Path shape: /admin/manifest/<appId>
    const m = /^\/admin\/manifest\/([^/]+)\/?$/.exec(c.req.path);
    if (m) appId = decodeURIComponent(m[1]!);
  }

  if (!verifyAdminAuthForApp(config, appId, auth)) {
    return c.json(
      { error: { code: 'unauthorized', message: 'Bearer token missing or invalid' } },
      401,
    );
  }
  await next();
});

/**
 * POST /admin/manifest
 * Body: PublishReq
 * Side effect: read existing manifest, push current → history, set new current.
 */
adminRouter.post('/admin/manifest', async (c) => {
  const config = c.get('config');
  // Body was already parsed (and stashed) by the auth middleware.
  const body = c.get('parsedBody') as Partial<PublishReq> | undefined;
  if (!body || typeof body !== 'object') {
    return c.json(
      { error: { code: 'invalid_json', message: 'Request body is not valid JSON' } },
      400,
    );
  }

  const { appId, version, objectKey, checksum, minNativeVersion, message, uploadedBy } = body;

  if (!appId || typeof appId !== 'string' || !isKnownAppId(appId)) {
    return c.json(
      { error: { code: 'invalid_input', message: `Unknown or missing appId` } },
      400,
    );
  }
  if (!version || typeof version !== 'string') {
    return c.json(
      { error: { code: 'invalid_input', message: 'version is required' } },
      400,
    );
  }
  // C6-1 / F-01: objectKey must be structurally safe AND prefixed with
  // `mvp-ota/<appId>/`.
  const keyCheck = validatePublishObjectKey(objectKey, appId);
  if (!keyCheck.ok) {
    return c.json(
      { error: { code: 'invalid_input', message: keyCheck.reason ?? 'invalid objectKey' } },
      400,
    );
  }
  if (!checksum || typeof checksum !== 'string') {
    return c.json(
      { error: { code: 'invalid_input', message: 'checksum is required' } },
      400,
    );
  }

  const record: BundleRecord = {
    version,
    uploadedAt: new Date().toISOString(),
    objectKey: objectKey as string,
    checksum,
  };
  if (uploadedBy) record.uploadedBy = uploadedBy;
  if (minNativeVersion) record.minNativeVersion = minNativeVersion;
  if (message) record.message = message;

  // C7 / F-13: optimistic-locked read-modify-write with bounded retry.
  try {
    const updated = await publishBundle(config.DATA_DIR, appId, record);
    return c.json({ ok: true, manifest: updated });
  } catch (err) {
    if (err instanceof Error && err.name === 'ManifestConflictError') {
      return c.json(
        {
          error: {
            code: 'conflict',
            message: 'Concurrent manifest write detected; retry the publish. Do not publish in parallel.',
          },
        },
        409,
      );
    }
    throw err;
  }
});

/** GET /admin/manifest/:appId — read-only manifest fetch for publish scripts. */
adminRouter.get('/admin/manifest/:appId', async (c) => {
  const config = c.get('config');
  const appId = c.req.param('appId');
  if (!isKnownAppId(appId)) {
    return c.json(
      { error: { code: 'invalid_input', message: `Unknown appId: ${appId}` } },
      400,
    );
  }
  const manifest = await readManifest(config.DATA_DIR, appId);
  if (!manifest) {
    return c.json({ ok: true, manifest: null });
  }
  return c.json({ ok: true, manifest });
});
