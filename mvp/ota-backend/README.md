# mvp-ota-backend

OTA (over-the-air) update backend for 5 MVP Capacitor apps. Built on **Cloudflare Workers + Hono**, with **Cloudflare KV** for manifests and **R2** for bundle binaries (presigned via `aws4fetch`).

Companion docs:
- Architecture: [`../openspec/changes/migrate-to-vite-capacitor-ota/design.md`](../openspec/changes/migrate-to-vite-capacitor-ota/design.md) § OTA Backend
- Client / server contract: [`../openspec/changes/migrate-to-vite-capacitor-ota/contract.md`](../openspec/changes/migrate-to-vite-capacitor-ota/contract.md)

---

## App ID allow-list

The backend serves these 5 `appId`s only. Unknown ids are rejected with `400 invalid_input`.

| Slug | Product | `appId` |
|---|---|---|
| 01-ai-naming | 诗经起名 | `io.shijing-naming.app` |
| 02-countdown | 倒数日 Pro | `io.countdown-pro.app` |
| 03-plant-doctor | AI 植物医生 | `io.plant-doctor.app` |
| 04-dream-journal | 梦境日记 | `io.dream-journal.app` |
| 05-pet-cards | 宠物心情卡片 | `io.pet-cards.app` |

---

## API

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | none | Liveness probe |
| `POST` | `/mobile-updates/check` | none | Client version-check |
| `POST` | `/admin/manifest` | Bearer | Publish a new bundle |
| `GET` | `/admin/manifest/:appId` | Bearer | Read current manifest |

Schemas live in [`src/types.ts`](src/types.ts).

### `POST /mobile-updates/check`

Request:
```json
{
  "appId": "io.countdown-pro.app",
  "platform": "ios",
  "nativeVersion": "0.0.1",
  "currentBundleId": "<optional capgo bundle id>",
  "currentBundleVersion": "0.0.1-20260527000000"
}
```

Response (update available):
```json
{
  "enabled": true,
  "updateAvailable": true,
  "version": "0.0.2-20260528120000",
  "url": "https://<account>.r2.cloudflarestorage.com/mvp-ota-bundles/...?X-Amz-Signature=...",
  "checksum": "<sha256 hex>",
  "message": "修复倒数日详情页崩溃"
}
```

Response (up to date / disabled / unknown):
```json
{ "enabled": true, "updateAvailable": false, "version": "...", "message": "当前已是最新版本" }
```

```json
{ "enabled": false, "updateAvailable": false }
```

Notes:
- Signed URL TTL: **300 seconds** (5 min)
- Bundle version comparison is **string equality** (contract §6), no semver
- `minNativeVersion` uses non-strict numeric compare (contract §2 `compareVersions`)

### `POST /admin/manifest`

Auth: `Authorization: Bearer <token>` (constant-time compare).

**Per-app tokens (C6).** Each app has its own admin token secret
`OTA_TOKEN_<APP>` (the appId with `io.`/`.app` stripped, upper-cased — e.g.
`io.countdownpro.app` → `OTA_TOKEN_COUNTDOWNPRO`). The backend resolves the
expected token from the request's `appId` (POST body) / `:appId` (GET path).
This shrinks the supply-chain blast radius: a single leaked token can poison
only **one** app, not all five. If an app's per-app token is not configured the
backend falls back to the legacy shared `OTA_ADMIN_TOKEN` (and logs a warning).
Tokens must be **≥ 32 chars** (`openssl rand -hex 32`); shorter ones log a
warning at use time.

**`r2Key` validation (C6-1).** The `r2Key` is locked down before it can be
written or signed:
- must start with `<appId>/` (matching the request `appId`) — prevents
  cross-app poisoning;
- character allow-list `[a-zA-Z0-9._/-]` only;
- rejects `..` traversal in any form (literal or `%2e%2e`), any percent-encoding,
  a leading `/` (absolute path), and consecutive `//`.

Violations return `400 invalid_input`. A defence-in-depth copy of the
structural checks also runs inside `signR2GetUrl`, so a malformed key that
somehow reaches KV still cannot be signed.

Request:
```json
{
  "appId": "io.countdown-pro.app",
  "version": "0.0.2-20260528120000",
  "r2Key": "io.countdown-pro.app/0.0.2-20260528120000.zip",
  "checksum": "<sha256 hex of zip>",
  "minNativeVersion": "0.0.1",
  "message": "修复倒数日详情页崩溃",
  "uploadedBy": "yaoyibin.vi"
}
```

Response:
```json
{ "ok": true, "manifest": { /* full Manifest */ } }
```

Side effect: previous `manifest.current` is pushed onto `manifest.history` (capped at 20 entries, oldest dropped).

**Concurrency (C7).** The write is a best-effort optimistic lock: the manifest
carries a monotonic `version` counter; on publish the backend re-reads after
writing and confirms the persisted version is the one it wrote, retrying with
exponential backoff (up to 2 retries) on conflict and returning `409 conflict`
if it keeps losing. Re-publishing the *identical* bundle (same `version` +
`r2Key` + `checksum`) is idempotent (no duplicate history entry). ⚠️ Cloudflare
KV has **no CAS/transactions** and is eventually consistent (≤ 60 s), so this
**narrows but cannot fully close** the lost-update window. **Publish serially —
do NOT run parallel CI jobs against the same backend.** Strong consistency
requires migrating to Durable Objects (P2, see Open ops items).

---

## Local development

```bash
cd mvp/ota-backend
npm install

# Optional: copy dev secrets file (gitignored)
cp .dev.vars.example .dev.vars
# edit .dev.vars to set OTA_ADMIN_TOKEN, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY

# Type-check
npm run type-check

# Test (uses miniflare KV + R2 via @cloudflare/vitest-pool-workers)
npm test

# Start local Worker (http://127.0.0.1:8787)
npm run dev
```

Smoke test the running dev worker:

```bash
curl -s http://127.0.0.1:8787/health | jq

# version check (will return enabled:false until a manifest is published)
curl -s -X POST http://127.0.0.1:8787/mobile-updates/check \
  -H "Content-Type: application/json" \
  -d '{"appId":"io.countdown-pro.app","platform":"ios","nativeVersion":"0.0.1"}' | jq

# admin publish
curl -s -X POST http://127.0.0.1:8787/admin/manifest \
  -H "Authorization: Bearer dev-admin-token-change-me" \
  -H "Content-Type: application/json" \
  -d '{
    "appId": "io.countdown-pro.app",
    "version": "0.0.1-dev",
    "r2Key": "io.countdown-pro.app/0.0.1-dev.zip",
    "checksum": "0000000000000000000000000000000000000000000000000000000000000000"
  }' | jq
```

---

## One-time Cloudflare setup

```bash
# 1. Login (once per machine)
npx wrangler login

# 2. Create KV namespaces (production + preview)
npx wrangler kv:namespace create OTA_MANIFEST
npx wrangler kv:namespace create OTA_MANIFEST --preview
# Copy returned `id` and `preview_id` into wrangler.toml [[kv_namespaces]]
# And the per-env block under [env.staging].

# 3. Create R2 buckets
npx wrangler r2 bucket create mvp-ota-bundles
npx wrangler r2 bucket create mvp-ota-bundles-dev

# 4. Generate R2 API token
#    Dashboard → R2 → Manage R2 API Tokens → Create token
#    Permissions: Object READ ONLY (the Worker only signs GET URLs; uploads go
#    via the wrangler CLI, which uses your login creds — the runtime never
#    writes). Scope to mvp-ota-bundles + mvp-ota-bundles-dev. Least privilege
#    keeps the blast radius small if the AK/SK ever leak.
#    Save the Access Key ID + Secret somewhere safe.

# 5. Inject secrets
#    Per-app admin tokens (preferred — one leak compromises only one app).
#    Generate each with: openssl rand -hex 32   (>= 32 chars, enforced at runtime)
npx wrangler secret put OTA_TOKEN_SHIJINGNAMING
npx wrangler secret put OTA_TOKEN_COUNTDOWNPRO
npx wrangler secret put OTA_TOKEN_PLANTDOCTOR
npx wrangler secret put OTA_TOKEN_DREAMJOURNAL
npx wrangler secret put OTA_TOKEN_PETCARDS
#    Legacy shared token (optional fallback for any app without a per-app token):
npx wrangler secret put OTA_ADMIN_TOKEN
#    R2 credentials:
npx wrangler secret put R2_ACCESS_KEY_ID
npx wrangler secret put R2_SECRET_ACCESS_KEY

# (Repeat for staging env if separate, e.g.)
npx wrangler secret put OTA_TOKEN_COUNTDOWNPRO --env staging
npx wrangler secret put R2_ACCESS_KEY_ID --env staging
npx wrangler secret put R2_SECRET_ACCESS_KEY --env staging

# 6. Set R2_ACCOUNT_ID
#    Dashboard → R2 → Overview → copy "Account ID"
#    Replace REPLACE_ME_ACCOUNT_ID in wrangler.toml ([vars] + [env.staging.vars]).
```

---

## Deployment

```bash
# Default (production)
npx wrangler deploy

# Staging
npx wrangler deploy --env staging

# Tail real-time logs
npx wrangler tail
```

---

## Publishing a bundle

The shared publish script is at [`../scripts/publish-bundle.sh`](../scripts/publish-bundle.sh).

### Example: publish v0.0.1 for product 02-countdown

```bash
cd mvp/products/02-countdown
npm run build   # produces ./dist/index.html + assets

# Per-app token (preferred). The script picks OTA_TOKEN_<APP> by appId and
# falls back to OTA_ADMIN_TOKEN if unset. Avoid `export` on shared machines
# (it lands in shell history); prefer `read -rs` or a secret manager.
read -rs OTA_TOKEN_COUNTDOWNPRO    # paste the token set via wrangler secret put
export OTA_TOKEN_COUNTDOWNPRO
export OTA_BACKEND_URL="https://mvp-ota.workers.dev"

# Positional form: <slug> <version> <dist-dir>
../../scripts/publish-bundle.sh 02-countdown 0.0.1 ./dist

# Or env form:
APP_ID=io.countdown-pro.app \
MOBILE_UPDATE_VERSION=0.0.1 \
MOBILE_UPDATE_MESSAGE="首次发布" \
../../scripts/publish-bundle.sh
```

What the script does:
1. Validates `./dist/index.html` exists
2. `cd ./dist && zip -qr /tmp/02-countdown-0.0.1.zip .` (no top-level dir)
3. `shasum -a 256` on the zip
4. `wrangler r2 object put mvp-ota-bundles/io.countdown-pro.app/0.0.1.zip`
5. `curl POST $OTA_BACKEND_URL/admin/manifest` with the resulting `r2Key` + checksum

Dependencies on the publish machine: `zip`, `curl`, `jq`, `wrangler`, `shasum`/`sha256sum`, `node` (optional, for `package.json` version fallback).

---

## Architecture notes

- **Why R2 + presigned URL (not Worker `r2.get()` proxy)**: keeps Workers CPU budget free of bundle bytes, lets clients use HTTP range requests for resume.
- **Why KV (not D1)**: each manifest is a single < 100KB document; KV's eventual-consistency window (≤ 60s globally) is acceptable for OTA — clients re-check at most once per minute anyway.
- **Why 5-minute signed URL**: clients begin downloading immediately on receipt, and `responseTimeout: 120` (capacitor.config.ts) caps a single download attempt. 5 min covers retry + slow LTE.
- **Why one bucket for all 5 apps**: simpler IAM and quota; `appId` prefix gives logical isolation (enforced — `r2Key` must be `<appId>/…`, see `POST /admin/manifest`). Split when one app exceeds 1GB or needs distinct retention.
- **`history` cap = 20**: enough for rollback investigation; R2 objects themselves are not GC'd by this code (cheap to keep).
- **Per-app admin tokens (C6)**: each appId authenticates with its own `OTA_TOKEN_<APP>` (shared `OTA_ADMIN_TOKEN` is a fallback). One leaked token poisons only one app, not all five.

---

## Open ops items

- **Manifest writes must be SERIAL (P2 to fully fix).** KV has no CAS/transactions; `publishBundle` uses a best-effort optimistic lock (version counter + re-read + retry → `409`) that narrows but cannot eliminate lost updates under the ≤ 60 s eventual-consistency window. Do **not** run parallel CI publishes against the same backend. **P2:** migrate manifests to Durable Objects (one DO per appId) for true serialised, strongly-consistent writes; this also unblocks a clean kill-switch/rollback API.
- Bundle GC: no automatic R2 deletion. To prune, write a one-off `wrangler r2 object delete` script after rollouts settle.
- Rate limiting: not implemented on `/admin/*` (behind per-app Bearer; check endpoint is low-cost and idempotent). Consider per-IP failure limiting before public launch.
- Telemetry: relies on `wrangler tail` + Workers Analytics Engine (free tier).
