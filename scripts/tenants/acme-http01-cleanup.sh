#!/usr/bin/env bash

set -euo pipefail

TARGET_NAMESPACES=("cruise")
SOLVER_LABEL="app=acme-http01-solver"
SOLVER_PATH="/usr/share/nginx/html/.well-known/acme-challenge"

if [[ -z "${CERTBOT_TOKEN:-}" ]]; then
  echo "CERTBOT_TOKEN is required" >&2
  exit 1
fi

remove_token() {
  local namespace="$1"
  local pod_name
  pod_name="$(kubectl get pod -n "$namespace" -l "$SOLVER_LABEL" -o jsonpath='{.items[0].metadata.name}')"
  if [[ -z "$pod_name" ]]; then
    return 0
  fi
  kubectl exec -n "$namespace" "$pod_name" -- sh -lc "rm -f '$SOLVER_PATH/$CERTBOT_TOKEN'" >/dev/null
}

for namespace in "${TARGET_NAMESPACES[@]}"; do
  remove_token "$namespace"
done
