#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VENV_DIR="${VENV_DIR:-/tmp/cruise-certbot-venv}"
CERTBOT_WORK_DIR="${CERTBOT_WORK_DIR:-/tmp/cruise-certbot}"
CERT_SECRET_NAME="${CERT_SECRET_NAME:-cruise-tls}"
DOMAIN="${DOMAIN:-cruise.cleantrackhotel.com}"
TARGET_NAMESPACE="${TARGET_NAMESPACE:-cruise}"
TRAEFIK_ARGS_FILE="${CERTBOT_WORK_DIR}/traefik-args.json"

log() {
  printf '[issue-cruise-tls] %s\n' "$*"
}

ensure_certbot() {
  if [[ ! -x "$VENV_DIR/bin/certbot" ]]; then
    log "Creating certbot virtualenv at $VENV_DIR"
    python3 -m venv "$VENV_DIR"
    "$VENV_DIR/bin/pip" install --upgrade pip >/dev/null
    "$VENV_DIR/bin/pip" install 'certbot<4' >/dev/null
  fi
}

create_tls_secret() {
  local cert_path="$1"
  local key_path="$2"

  kubectl create secret tls "$CERT_SECRET_NAME" \
    --cert="$cert_path" \
    --key="$key_path" \
    -n "$TARGET_NAMESPACE" \
    --dry-run=client -o yaml | kubectl apply -f - >/dev/null
}

patch_traefik_args() {
  local mode="$1"
  local patch_json
  local deploy_json

  deploy_json="$(kubectl get deployment traefik -n kube-system -o json)"

  patch_json="$(
    DEPLOY_JSON="$deploy_json" python3 - "$mode" "$TRAEFIK_ARGS_FILE" <<'PY'
import json
import os
import sys

mode = sys.argv[1]
args_file = sys.argv[2]
data = json.loads(os.environ["DEPLOY_JSON"])
container = data["spec"]["template"]["spec"]["containers"][0]
args = container.get("args", [])
redirect_args = {
    "--entryPoints.web.http.redirections.entryPoint.to=:443",
    "--entryPoints.web.http.redirections.entryPoint.scheme=https",
    "--entryPoints.web.http.redirections.entryPoint.permanent=true",
}

if mode == "disable":
    os.makedirs(os.path.dirname(args_file), exist_ok=True)
    with open(args_file, "w") as fh:
        json.dump(args, fh)
    new_args = [arg for arg in args if arg not in redirect_args]
elif mode == "restore":
    with open(args_file) as fh:
        new_args = json.load(fh)
else:
    raise SystemExit("unsupported mode")

print(json.dumps([
    {
        "op": "replace",
        "path": "/spec/template/spec/containers/0/args",
        "value": new_args,
    }
]))
PY
  )"

  kubectl patch deployment traefik -n kube-system --type=json -p "$patch_json" >/dev/null
  kubectl rollout status deployment/traefik -n kube-system --timeout=180s >/dev/null
}

restore_traefik_redirect() {
  if [[ -f "$TRAEFIK_ARGS_FILE" ]]; then
    log "Restoring Traefik HTTP redirect"
    patch_traefik_args restore
  fi
}

main() {
  cd "$ROOT_DIR"

  chmod +x scripts/tenants/acme-http01-auth.sh scripts/tenants/acme-http01-cleanup.sh
  kubectl apply -f deploy/tenants/cruise-acme-solver.yaml >/dev/null

  ensure_certbot

  mkdir -p "$CERTBOT_WORK_DIR/config" "$CERTBOT_WORK_DIR/work" "$CERTBOT_WORK_DIR/logs"

  trap restore_traefik_redirect EXIT
  log "Temporarily disabling Traefik HTTP redirect for ACME challenge (${DOMAIN})"
  patch_traefik_args disable

  log "Requesting certificate for ${DOMAIN}"
  "$VENV_DIR/bin/certbot" certonly \
    --manual \
    --preferred-challenges http \
    --manual-auth-hook "$ROOT_DIR/scripts/tenants/acme-http01-auth.sh" \
    --manual-cleanup-hook "$ROOT_DIR/scripts/tenants/acme-http01-cleanup.sh" \
    --agree-tos \
    --register-unsafely-without-email \
    --non-interactive \
    --config-dir "$CERTBOT_WORK_DIR/config" \
    --work-dir "$CERTBOT_WORK_DIR/work" \
    --logs-dir "$CERTBOT_WORK_DIR/logs" \
    -d "$DOMAIN"

  local cert_path="$CERTBOT_WORK_DIR/config/live/${DOMAIN}/fullchain.pem"
  local key_path="$CERTBOT_WORK_DIR/config/live/${DOMAIN}/privkey.pem"

  if [[ ! -f "$cert_path" || ! -f "$key_path" ]]; then
    echo "certificate files not found after issuance for ${DOMAIN}" >&2
    exit 1
  fi

  log "Updating TLS secret ${CERT_SECRET_NAME} in ${TARGET_NAMESPACE}"
  create_tls_secret "$cert_path" "$key_path"

  restore_traefik_redirect
  trap - EXIT

  log "Done"
}

main "$@"
