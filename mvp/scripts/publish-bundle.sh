#!/usr/bin/env bash
#
# publish-bundle.sh — publish a built Vite/Capacitor bundle to the OTA backend.
#
# Usage (positional, recommended for CI):
#   publish-bundle.sh <product-slug> <version> <dist-dir>
#
# Usage (env, recommended for local dev):
#   cd mvp/products/02-countdown
#   APP_ID=io.countdownpro.app \
#   MOBILE_UPDATE_VERSION=0.0.2 \
#   MOBILE_UPDATE_MESSAGE="修复倒数日详情页崩溃" \
#   ../../scripts/publish-bundle.sh
#
# Example:
#   publish-bundle.sh 02-countdown 0.0.2 ./dist
#
# What it does:
#   1. Validates that <dist-dir> contains index.html
#   2. Zips the dist contents (no top-level directory) to /tmp/<slug>-<version>.zip
#   3. Computes sha256 checksum (uses shasum on macOS, sha256sum on Linux)
#   4. Maps product slug → appId via the table below
#   5. wrangler r2 object put → uploads zip to R2 at <appId>/<version>.zip
#   6. curl POST $OTA_BACKEND_URL/admin/manifest → writes manifest in KV
#   7. Prints summary (R2 key, checksum, size)
#
# Required env (or args):
#   - Admin token (one of, resolved by appId — see C6 per-app token below):
#       * OTA_TOKEN_<APP>  per-app bearer token, preferred
#                          (e.g. OTA_TOKEN_COUNTDOWNPRO for io.countdownpro.app)
#       * OTA_ADMIN_TOKEN  legacy shared bearer token, used as fallback
#   - OTA_BACKEND_URL   base URL, default https://mvp-ota.workers.dev
#   - APP_ID OR product slug as $1
#
# Dependencies: bash 3.2+, zip, shasum/sha256sum, curl, jq, wrangler, node (optional).

set -euo pipefail

# ---------- Product slug → appId mapping ------------------------------------
# Keep in sync with design.md § Mobile Template "5 个产品命名表".
slug_to_app_id() {
  # Capacitor CLI requires Java package format (no hyphens). Per T6 finding 2026-05-28.
  case "$1" in
    01-ai-naming|01-naming)        echo "io.shijingnaming.app" ;;
    02-countdown)                  echo "io.countdownpro.app" ;;
    03-plant-doctor|03-plant)      echo "io.plantdoctor.app" ;;
    04-dream-journal|04-dream)     echo "io.dreamjournal.app" ;;
    05-pet-cards|05-pet)           echo "io.petcards.app" ;;
    *)                             return 1 ;;
  esac
}

# ---------- arg / env resolution --------------------------------------------
PRODUCT_SLUG="${1:-}"
ARG_VERSION="${2:-}"
ARG_DIST_DIR="${3:-}"

# Load .env if present in cwd (Vite-style)
[[ -f .env ]] && set -a && source .env && set +a

# APP_ID: explicit env wins, else map from slug, else from VITE_APP_ID
if [[ -n "${APP_ID:-}" ]]; then
  RESOLVED_APP_ID="$APP_ID"
elif [[ -n "$PRODUCT_SLUG" ]]; then
  if ! RESOLVED_APP_ID="$(slug_to_app_id "$PRODUCT_SLUG")"; then
    echo "Error: unknown product slug '$PRODUCT_SLUG'" >&2
    echo "Known slugs: 01-ai-naming 02-countdown 03-plant-doctor 04-dream-journal 05-pet-cards" >&2
    exit 1
  fi
elif [[ -n "${VITE_APP_ID:-}" ]]; then
  RESOLVED_APP_ID="$VITE_APP_ID"
else
  echo "Error: APP_ID required (set APP_ID env, pass slug as arg, or set VITE_APP_ID in .env)" >&2
  exit 1
fi

# VERSION: positional arg > env > package.json + timestamp
if [[ -n "$ARG_VERSION" ]]; then
  VERSION="$ARG_VERSION"
elif [[ -n "${MOBILE_UPDATE_VERSION:-}" ]]; then
  VERSION="$MOBILE_UPDATE_VERSION"
else
  if command -v node >/dev/null 2>&1 && [[ -f package.json ]]; then
    PKG_VERSION="$(node -p "require('./package.json').version" 2>/dev/null || echo "0.0.0")"
  else
    PKG_VERSION="0.0.0"
  fi
  VERSION="${PKG_VERSION}-$(date +%Y%m%d%H%M%S)"
fi

DIST_DIR="${ARG_DIST_DIR:-${DIST_DIR:-dist}}"
MIN_NATIVE_VERSION="${MOBILE_UPDATE_MIN_NATIVE_VERSION:-}"
MESSAGE="${MOBILE_UPDATE_MESSAGE:-}"
OTA_BACKEND_URL="${OTA_BACKEND_URL:-${VITE_OTA_BACKEND_URL:-https://mvp-ota.workers.dev}}"
R2_BUCKET="${R2_BUCKET:-mvp-ota-bundles}"

# ---------- admin token resolution (C6 per-app token) -----------------------
# Each app has its own token `OTA_TOKEN_<APP>` (appId minus `io.`/`.app`,
# upper-cased), falling back to the legacy shared OTA_ADMIN_TOKEN. This shrinks
# the supply-chain blast radius: one leaked token poisons only one app.
app_token_var_name() {
  # io.countdownpro.app -> OTA_TOKEN_COUNTDOWNPRO
  local app_id="$1" mid
  mid="$(printf '%s' "$app_id" | sed -E 's/^io\.([a-z0-9]+)\.app$/\1/')"
  if [[ "$mid" == "$app_id" || -z "$mid" ]]; then
    return 1 # did not match io.<mid>.app
  fi
  printf 'OTA_TOKEN_%s' "$(printf '%s' "$mid" | tr '[:lower:]' '[:upper:]')"
}

RESOLVED_TOKEN=""
if TOKEN_VAR="$(app_token_var_name "$RESOLVED_APP_ID")"; then
  # Indirect expansion: read the value of the env var named in $TOKEN_VAR.
  RESOLVED_TOKEN="${!TOKEN_VAR:-}"
fi

if [[ -n "$RESOLVED_TOKEN" ]]; then
  : # using per-app token
elif [[ -n "${OTA_ADMIN_TOKEN:-}" ]]; then
  echo "Warning: ${TOKEN_VAR:-per-app token} not set; falling back to shared OTA_ADMIN_TOKEN." >&2
  echo "         Set ${TOKEN_VAR:-OTA_TOKEN_<APP>} to shrink the supply-chain blast radius." >&2
  RESOLVED_TOKEN="$OTA_ADMIN_TOKEN"
else
  echo "Error: no admin token for ${RESOLVED_APP_ID}." >&2
  echo "       Set ${TOKEN_VAR:-OTA_TOKEN_<APP>} (preferred) or OTA_ADMIN_TOKEN (fallback)." >&2
  echo "       Generate one with: openssl rand -hex 32" >&2
  exit 1
fi

# ---------- dependency checks -----------------------------------------------
for cmd in zip curl jq wrangler; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Error: missing required command '$cmd'" >&2
    exit 1
  fi
done

# checksum tool: prefer shasum on macOS, sha256sum elsewhere
if command -v shasum >/dev/null 2>&1; then
  CHECKSUM_CMD=(shasum -a 256)
elif command -v sha256sum >/dev/null 2>&1; then
  CHECKSUM_CMD=(sha256sum)
else
  echo "Error: neither shasum nor sha256sum available" >&2
  exit 1
fi

# ---------- validate dist ----------------------------------------------------
if [[ ! -d "$DIST_DIR" ]]; then
  echo "Error: dist directory '$DIST_DIR' not found. Run 'npm run build' first." >&2
  exit 1
fi
if [[ ! -f "$DIST_DIR/index.html" ]]; then
  echo "Error: '$DIST_DIR/index.html' missing — bundle must have index.html at root after unzip." >&2
  exit 1
fi

# ---------- zip --------------------------------------------------------------
# Use product slug if provided as filename hint; fall back to last path segment of cwd.
SLUG_FOR_ZIP="${PRODUCT_SLUG:-$(basename "$(pwd)")}"
ZIP_NAME="${SLUG_FOR_ZIP}-${VERSION}.zip"
ZIP_PATH="/tmp/${ZIP_NAME}"
rm -f "$ZIP_PATH"
( cd "$DIST_DIR" && zip -qr "$ZIP_PATH" . )

# ---------- checksum --------------------------------------------------------
CHECKSUM="$("${CHECKSUM_CMD[@]}" "$ZIP_PATH" | awk '{print $1}')"

# ---------- r2 upload -------------------------------------------------------
R2_KEY="${RESOLVED_APP_ID}/${VERSION}.zip"

echo "Uploading to R2: ${R2_BUCKET}/${R2_KEY}"
wrangler r2 object put "${R2_BUCKET}/${R2_KEY}" \
  --file="$ZIP_PATH" \
  --content-type="application/zip" \
  --cache-control="public, max-age=31536000, immutable"

# ---------- write manifest --------------------------------------------------
PAYLOAD="$(jq -n \
  --arg appId "$RESOLVED_APP_ID" \
  --arg version "$VERSION" \
  --arg r2Key "$R2_KEY" \
  --arg checksum "$CHECKSUM" \
  --arg minNative "$MIN_NATIVE_VERSION" \
  --arg message "$MESSAGE" \
  --arg uploadedBy "${USER:-unknown}" \
  '{
    appId: $appId,
    version: $version,
    r2Key: $r2Key,
    checksum: $checksum,
    uploadedBy: $uploadedBy
  }
  + (if $minNative != "" then {minNativeVersion: $minNative} else {} end)
  + (if $message != "" then {message: $message} else {} end)')"

echo "Posting manifest to ${OTA_BACKEND_URL}/admin/manifest"
HTTP_RESPONSE="$(curl --fail --silent --show-error \
  --location \
  "${OTA_BACKEND_URL}/admin/manifest" \
  --header "Authorization: Bearer ${RESOLVED_TOKEN}" \
  --header "Content-Type: application/json" \
  --data "$PAYLOAD")"

# ---------- summary ---------------------------------------------------------
ZIP_SIZE="$(du -h "$ZIP_PATH" | awk '{print $1}')"

echo ""
echo "===================================================================="
echo "  Published OTA bundle"
echo "===================================================================="
echo "  App ID    : ${RESOLVED_APP_ID}"
echo "  Version   : ${VERSION}"
echo "  R2 key    : ${R2_KEY}"
echo "  Checksum  : ${CHECKSUM}"
echo "  Size      : ${ZIP_SIZE}"
[[ -n "$MESSAGE" ]] && echo "  Message   : ${MESSAGE}"
[[ -n "$MIN_NATIVE_VERSION" ]] && echo "  MinNative : ${MIN_NATIVE_VERSION}"
echo "  Backend   : ${OTA_BACKEND_URL}"
echo "===================================================================="
echo ""
echo "Manifest response:"
echo "$HTTP_RESPONSE" | jq '.' 2>/dev/null || echo "$HTTP_RESPONSE"
