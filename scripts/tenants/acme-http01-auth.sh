#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TARGET_NAMESPACES=("cruise")
SOLVER_LABEL="app=acme-http01-solver"
SOLVER_PATH="/usr/share/nginx/html/.well-known/acme-challenge"
DEBUG_LOG="${DEBUG_LOG:-/tmp/cruise-acme-hook.log}"

if [[ -z "${CERTBOT_TOKEN:-}" || -z "${CERTBOT_VALIDATION:-}" || -z "${CERTBOT_DOMAIN:-}" ]]; then
  echo "certbot env is incomplete" >&2
  exit 1
fi

cd "$ROOT_DIR"
kubectl apply -f deploy/tenants/cruise-acme-solver.yaml >/dev/null

for namespace in "${TARGET_NAMESPACES[@]}"; do
  kubectl rollout status deployment/acme-http01-solver -n "$namespace" --timeout=120s >/dev/null
done

write_token() {
  local namespace="$1"
  local pod_name
  pod_name="$(kubectl get pod -n "$namespace" -l "$SOLVER_LABEL" -o jsonpath='{.items[0].metadata.name}')"
  if [[ -z "$pod_name" ]]; then
    echo "solver pod not found in $namespace" >&2
    exit 1
  fi

  kubectl exec -i -n "$namespace" "$pod_name" -- sh -lc "mkdir -p '$SOLVER_PATH' && cat > '$SOLVER_PATH/$CERTBOT_TOKEN'" <<EOF
$CERTBOT_VALIDATION
EOF
}

for namespace in "${TARGET_NAMESPACES[@]}"; do
  write_token "$namespace"
done

for _ in $(seq 1 20); do
  body="$(curl -s "http://${CERTBOT_DOMAIN}/.well-known/acme-challenge/${CERTBOT_TOKEN}" || true)"
  printf '[%s] domain=%s token=%s body=%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$CERTBOT_DOMAIN" "$CERTBOT_TOKEN" "$body" >> "$DEBUG_LOG"
  if [[ "$body" == "$CERTBOT_VALIDATION" ]]; then
    exit 0
  fi
  sleep 2
done

echo "challenge token was not reachable for ${CERTBOT_DOMAIN}" >&2
exit 1
