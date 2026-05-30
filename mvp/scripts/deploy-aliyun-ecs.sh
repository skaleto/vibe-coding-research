#!/usr/bin/env bash
#
# deploy-aliyun-ecs.sh — deploy the two MVP Node backends (gateway + ota-backend)
# to an Aliyun ECS host. Node analogue of ai-baby's deploy-aliyun-ecs.sh
# (which ships a Spring Boot JAR + systemd unit); here we ship built `dist/` +
# manifests and run them under systemd as Node 20 LTS services.
#
# Topology produced (coexists with ai-baby Java :8300 on the same host):
#   client → nginx (HTTPS 443) → 127.0.0.1:8400 mvp-gateway
#                              → 127.0.0.1:8401 mvp-ota
#
# Usage:
#   ECS_HOST=1.2.3.4 SSH_KEY=~/.ssh/id_rsa scripts/deploy-aliyun-ecs.sh
#
# Env:
#   ECS_HOST    (required)  ECS public IP or hostname
#   ECS_USER    (root)      SSH user
#   ECS_PORT    (22)        SSH port
#   SSH_KEY     (optional)  path to private key; omitted → ssh-agent / default key
#   SYNC_DATA   (0)         1 = also sync local ./data manifests into /var/lib/mvp-ota.
#                           Default 0: code-only deploy NEVER touches remote
#                           manifest data (mirrors ai-baby SYNC_DATA=0).
#   SKIP_BUILD  (0)         1 = skip local `npm ci && npm run build` (reuse dist/)
#   NODE_MAJOR  (20)        Node LTS major to ensure on the host
#
# What it does:
#   1. Local: `npm ci && npm run build` for gateway + ota-backend → dist/
#   2. rsync dist/ + package.json + package-lock.json to /opt/mvp-gateway, /opt/mvp-ota
#   3. Remote: ensure Node <NODE_MAJOR> LTS + a `mvpapp` service user
#   4. Remote: ensure /var/lib/mvp-ota (manifests) + /etc/mvp (secret EnvironmentFiles)
#   5. Remote: `npm ci --omit=dev` in each app dir (production deps only)
#   6. Install/refresh both systemd units, daemon-reload, enable, restart
#   7. Health-check curl localhost:8400/health + localhost:8401/health
#
# This script does NOT touch gateway/ota-backend src, nginx, or TLS certs.
# nginx + certificate setup is a one-time manual step — see mvp/docs/aliyun-deploy.md.

set -euo pipefail

# ---------- paths -----------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MVP_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
GATEWAY_DIR="$MVP_ROOT/gateway"
OTA_DIR="$MVP_ROOT/ota-backend"
DEPLOY_DIR="$MVP_ROOT/deploy"

REMOTE_GATEWAY_DIR="/opt/mvp-gateway"
REMOTE_OTA_DIR="/opt/mvp-ota"
REMOTE_DATA_DIR="/var/lib/mvp-ota"
REMOTE_SECRET_DIR="/etc/mvp"
SERVICE_USER="mvpapp"

# ---------- env resolution --------------------------------------------------
ECS_HOST="${ECS_HOST:-}"
ECS_USER="${ECS_USER:-root}"
ECS_PORT="${ECS_PORT:-22}"
SSH_KEY="${SSH_KEY:-}"
SYNC_DATA="${SYNC_DATA:-0}"
SKIP_BUILD="${SKIP_BUILD:-0}"
NODE_MAJOR="${NODE_MAJOR:-20}"

if [[ -z "$ECS_HOST" ]]; then
  echo "Error: ECS_HOST is required (e.g. ECS_HOST=1.2.3.4 $0)" >&2
  exit 1
fi

# ssh/rsync key flag (optional)
SSH_OPTS=(-p "$ECS_PORT" -o StrictHostKeyChecking=accept-new)
if [[ -n "$SSH_KEY" ]]; then
  SSH_OPTS+=(-i "$SSH_KEY")
fi
SSH_TARGET="${ECS_USER}@${ECS_HOST}"

# rsync uses its own -e ssh string
RSYNC_SSH="ssh -p ${ECS_PORT} -o StrictHostKeyChecking=accept-new"
if [[ -n "$SSH_KEY" ]]; then
  RSYNC_SSH="$RSYNC_SSH -i $SSH_KEY"
fi

# ---------- dependency checks (local) ---------------------------------------
for cmd in ssh rsync npm; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Error: missing required local command '$cmd'" >&2
    exit 1
  fi
done

run_remote() {
  # Run a command on the ECS over ssh. Quote the whole command as one arg.
  ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "$@"
}

echo "===================================================================="
echo "  Deploying MVP Node backends → ${SSH_TARGET}:${ECS_PORT}"
echo "  gateway → ${REMOTE_GATEWAY_DIR} (:8400)"
echo "  ota     → ${REMOTE_OTA_DIR} (:8401)"
echo "  SYNC_DATA=${SYNC_DATA}  SKIP_BUILD=${SKIP_BUILD}  Node ${NODE_MAJOR} LTS"
echo "===================================================================="

# ---------- 1. local build --------------------------------------------------
build_one() {
  local dir="$1" name="$2"
  echo "--- [$name] npm ci && npm run build ---"
  ( cd "$dir" && npm ci && npm run build )
  if [[ ! -f "$dir/dist/server.js" ]]; then
    echo "Error: [$name] dist/server.js missing after build." >&2
    echo "       The Node entry (src/server.js → dist/server.js) is produced by" >&2
    echo "       the M1/M2 build. Ensure 'npm run build' emits dist/server.js." >&2
    exit 1
  fi
}

if [[ "$SKIP_BUILD" == "1" ]]; then
  echo "--- SKIP_BUILD=1: reusing existing dist/ ---"
  for pair in "$GATEWAY_DIR:gateway" "$OTA_DIR:ota-backend"; do
    d="${pair%%:*}"; n="${pair##*:}"
    [[ -f "$d/dist/server.js" ]] || { echo "Error: [$n] dist/server.js missing; cannot SKIP_BUILD." >&2; exit 1; }
  done
else
  build_one "$GATEWAY_DIR" "gateway"
  build_one "$OTA_DIR" "ota-backend"
fi

# ---------- 2. provision host (user, dirs, Node) ----------------------------
# Bootstrap as the SSH user (root or a sudoer). All idempotent.
echo "--- Provisioning host (Node ${NODE_MAJOR}, ${SERVICE_USER} user, dirs) ---"
run_remote "NODE_MAJOR='${NODE_MAJOR}' SERVICE_USER='${SERVICE_USER}' \
  REMOTE_GATEWAY_DIR='${REMOTE_GATEWAY_DIR}' REMOTE_OTA_DIR='${REMOTE_OTA_DIR}' \
  REMOTE_DATA_DIR='${REMOTE_DATA_DIR}' REMOTE_SECRET_DIR='${REMOTE_SECRET_DIR}' bash -s" <<'REMOTE_PROVISION'
set -euo pipefail
SUDO=""; [ "$(id -u)" -eq 0 ] || SUDO="sudo"

# Node 20 LTS via NodeSource if node is missing or too old.
need_node=1
if command -v node >/dev/null 2>&1; then
  cur="$(node -v | sed 's/^v//; s/\..*//')"
  [ "${cur:-0}" -ge "${NODE_MAJOR}" ] && need_node=0
fi
if [ "$need_node" -eq 1 ]; then
  echo "Installing Node ${NODE_MAJOR} LTS via NodeSource..."
  curl -fsSL "https://rpm.nodesource.com/setup_${NODE_MAJOR}.x" | $SUDO bash - 2>/dev/null \
    || curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | $SUDO bash -
  if command -v dnf >/dev/null 2>&1;  then $SUDO dnf install -y nodejs;
  elif command -v yum >/dev/null 2>&1; then $SUDO yum install -y nodejs;
  else $SUDO apt-get install -y nodejs; fi
fi
echo "Node: $(node -v)  npm: $(npm -v)"

# Service user (system account, no login shell, no home login).
if ! id "${SERVICE_USER}" >/dev/null 2>&1; then
  echo "Creating service user ${SERVICE_USER}..."
  $SUDO useradd --system --shell /usr/sbin/nologin --no-create-home "${SERVICE_USER}" \
    || $SUDO useradd --system --shell /sbin/nologin "${SERVICE_USER}"
fi

# App dirs (owned by service user), data dir (manifests), secret dir (/etc/mvp).
$SUDO mkdir -p "${REMOTE_GATEWAY_DIR}" "${REMOTE_OTA_DIR}" "${REMOTE_DATA_DIR}/manifests"
$SUDO chown -R "${SERVICE_USER}:${SERVICE_USER}" "${REMOTE_GATEWAY_DIR}" "${REMOTE_OTA_DIR}" "${REMOTE_DATA_DIR}"

# /etc/mvp: root-owned dir, but readable by the service so EnvironmentFile loads.
$SUDO mkdir -p "${REMOTE_SECRET_DIR}"
$SUDO chown root:"${SERVICE_USER}" "${REMOTE_SECRET_DIR}"
$SUDO chmod 750 "${REMOTE_SECRET_DIR}"
# Seed empty, locked-down EnvironmentFiles if absent (operator fills in secrets).
for f in gateway.env ota.env; do
  if [ ! -f "${REMOTE_SECRET_DIR}/$f" ]; then
    echo "# Fill in secrets — see mvp/docs/aliyun-deploy.md. chmod 640, group ${SERVICE_USER}." | $SUDO tee "${REMOTE_SECRET_DIR}/$f" >/dev/null
    $SUDO chown root:"${SERVICE_USER}" "${REMOTE_SECRET_DIR}/$f"
    $SUDO chmod 640 "${REMOTE_SECRET_DIR}/$f"
    echo "Seeded empty ${REMOTE_SECRET_DIR}/$f (add secrets before publishing)."
  fi
done
REMOTE_PROVISION

# ---------- 3. rsync code (dist + manifests of deps) ------------------------
# Ship dist/ + package.json + package-lock.json; run `npm ci --omit=dev` remotely
# so native deps build for the host arch (cleaner than rsyncing node_modules).
sync_app() {
  local local_dir="$1" remote_dir="$2" name="$3"
  echo "--- [$name] rsync → ${SSH_TARGET}:${remote_dir} ---"
  # --delete on dist/ only (keep remote node_modules between deploys for speed);
  # node_modules is refreshed by `npm ci` below when the lockfile changed.
  rsync -az --delete -e "$RSYNC_SSH" \
    "$local_dir/dist/" "${SSH_TARGET}:${remote_dir}/dist/"
  rsync -az -e "$RSYNC_SSH" \
    "$local_dir/package.json" "$local_dir/package-lock.json" \
    "${SSH_TARGET}:${remote_dir}/"
}
sync_app "$GATEWAY_DIR" "$REMOTE_GATEWAY_DIR" "gateway"
sync_app "$OTA_DIR" "$REMOTE_OTA_DIR" "ota-backend"

# Optional: sync local manifest data (OFF by default — never clobber prod data).
if [[ "$SYNC_DATA" == "1" ]]; then
  if [[ -d "$OTA_DIR/data" ]]; then
    echo "--- SYNC_DATA=1: rsync local ota-backend/data → ${REMOTE_DATA_DIR} ---"
    rsync -az -e "$RSYNC_SSH" "$OTA_DIR/data/" "${SSH_TARGET}:${REMOTE_DATA_DIR}/"
    run_remote "chown -R ${SERVICE_USER}:${SERVICE_USER} ${REMOTE_DATA_DIR} 2>/dev/null || sudo chown -R ${SERVICE_USER}:${SERVICE_USER} ${REMOTE_DATA_DIR}"
  else
    echo "--- SYNC_DATA=1 but $OTA_DIR/data missing — skipping data sync ---"
  fi
else
  echo "--- SYNC_DATA=0: leaving remote ${REMOTE_DATA_DIR} untouched (code-only deploy) ---"
fi

# ---------- 4. remote production install + ownership ------------------------
echo "--- Remote: npm ci --omit=dev + ownership ---"
run_remote "SERVICE_USER='${SERVICE_USER}' \
  REMOTE_GATEWAY_DIR='${REMOTE_GATEWAY_DIR}' REMOTE_OTA_DIR='${REMOTE_OTA_DIR}' bash -s" <<'REMOTE_INSTALL'
set -euo pipefail
SUDO=""; [ "$(id -u)" -eq 0 ] || SUDO="sudo"
for d in "${REMOTE_GATEWAY_DIR}" "${REMOTE_OTA_DIR}"; do
  echo "npm ci --omit=dev in $d"
  ( cd "$d" && $SUDO npm ci --omit=dev --no-audit --no-fund )
  $SUDO chown -R "${SERVICE_USER}:${SERVICE_USER}" "$d"
done
REMOTE_INSTALL

# ---------- 5. install systemd units + restart ------------------------------
echo "--- Installing systemd units ---"
# Copy unit files to a temp path the SSH user can write, then sudo-move into place.
rsync -az -e "$RSYNC_SSH" \
  "$DEPLOY_DIR/systemd/mvp-gateway.service" \
  "$DEPLOY_DIR/systemd/mvp-ota.service" \
  "${SSH_TARGET}:/tmp/"
run_remote "bash -s" <<'REMOTE_SYSTEMD'
set -euo pipefail
SUDO=""; [ "$(id -u)" -eq 0 ] || SUDO="sudo"
$SUDO mv /tmp/mvp-gateway.service /tmp/mvp-ota.service /etc/systemd/system/
$SUDO chmod 644 /etc/systemd/system/mvp-gateway.service /etc/systemd/system/mvp-ota.service
$SUDO systemctl daemon-reload
$SUDO systemctl enable mvp-gateway mvp-ota
$SUDO systemctl restart mvp-gateway
$SUDO systemctl restart mvp-ota
REMOTE_SYSTEMD

# ---------- 6. health check -------------------------------------------------
echo "--- Health check (give services a moment to boot) ---"
HEALTH_OK=1
run_remote "bash -s" <<'REMOTE_HEALTH' || HEALTH_OK=0
set -uo pipefail
ok=0
for attempt in 1 2 3 4 5; do
  g="$(curl -fsS -m 3 http://127.0.0.1:8400/health 2>/dev/null || true)"
  o="$(curl -fsS -m 3 http://127.0.0.1:8401/health 2>/dev/null || true)"
  if [ -n "$g" ] && [ -n "$o" ]; then
    echo "gateway /health: $g"
    echo "ota     /health: $o"
    ok=1; break
  fi
  echo "attempt $attempt: waiting for services..."; sleep 2
done
[ "$ok" -eq 1 ] || {
  echo "HEALTH CHECK FAILED — recent logs:" >&2
  (systemctl --no-pager -l status mvp-gateway mvp-ota 2>&1 | tail -n 30) || true
  (journalctl -u mvp-gateway -u mvp-ota -n 30 --no-pager 2>&1) || true
  exit 1
}
REMOTE_HEALTH

echo ""
echo "===================================================================="
if [[ "$HEALTH_OK" == "1" ]]; then
  echo "  ✅ Deploy OK — both services healthy on 8400 / 8401"
else
  echo "  ❌ Deploy finished but health check FAILED (see logs above)"
fi
echo "===================================================================="
echo "  Next (one-time, manual): configure nginx + TLS for the public domain."
echo "  See mvp/docs/aliyun-deploy.md (deploy/nginx/mvp-api.conf)."
echo "===================================================================="

[[ "$HEALTH_OK" == "1" ]] || exit 1
