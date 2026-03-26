#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

REGISTRY="${REGISTRY:-223.254.144.74:5000}"
NAMESPACE="${NAMESPACE:-cruise}"
IMAGE_TAG="${IMAGE_TAG:-$(git -C "$PROJECT_ROOT" rev-parse --short HEAD)}"
BACKEND_IMAGE="${BACKEND_IMAGE:-$REGISTRY/cruise-backend:$IMAGE_TAG}"
FRONTEND_IMAGE="${FRONTEND_IMAGE:-$REGISTRY/cruise-frontend:$IMAGE_TAG}"
APPLY_INFRA="${APPLY_INFRA:-true}"

echo "=== Cruise 本地打包发布 ==="
echo "registry:      $REGISTRY"
echo "namespace:     $NAMESPACE"
echo "image tag:     $IMAGE_TAG"
echo "backend image: $BACKEND_IMAGE"
echo "frontend image:$FRONTEND_IMAGE"

if [[ ! -f "$PROJECT_ROOT/deploy/k3s/secret.yaml" ]]; then
  echo "未找到 deploy/k3s/secret.yaml"
  echo "请先执行: cp deploy/k3s/secret.example.yaml deploy/k3s/secret.yaml"
  exit 1
fi

if [[ "$APPLY_INFRA" == "true" ]]; then
  echo "=== 应用测试环境基础资源 ==="
  bash "$PROJECT_ROOT/deploy/tekton/apply-all.sh"
fi

echo "=== 构建并推送 backend 镜像 ==="
docker build -f "$PROJECT_ROOT/backend/Dockerfile" -t "$BACKEND_IMAGE" "$PROJECT_ROOT"
docker push "$BACKEND_IMAGE"

echo "=== 构建并推送 frontend 镜像 ==="
docker build -f "$PROJECT_ROOT/frontend/Dockerfile" -t "$FRONTEND_IMAGE" "$PROJECT_ROOT"
docker push "$FRONTEND_IMAGE"

echo "=== 更新测试环境镜像 ==="
kubectl -n "$NAMESPACE" set image deployment/cruise-backend cruise-backend="$BACKEND_IMAGE"
kubectl -n "$NAMESPACE" set image deployment/cruise-frontend cruise-frontend="$FRONTEND_IMAGE"

echo "=== 等待滚动发布完成 ==="
kubectl -n "$NAMESPACE" rollout status deployment/cruise-backend --timeout=180s
kubectl -n "$NAMESPACE" rollout status deployment/cruise-frontend --timeout=180s

echo "=== 当前镜像 ==="
kubectl -n "$NAMESPACE" get deploy cruise-backend cruise-frontend \
  -o custom-columns=NAME:.metadata.name,IMAGE:.spec.template.spec.containers[*].image

echo "=== 健康检查 ==="
curl -fsS https://cruise.cleantrackhotel.com/actuator/health
