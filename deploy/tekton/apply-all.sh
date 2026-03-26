#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "=== 1. 创建 namespace ==="
kubectl apply -f "$PROJECT_ROOT/deploy/k3s/namespace.yaml"

echo "=== 2. 检查 Cruise TLS secret ==="
if kubectl get secret cruise-tls -n cruise >/dev/null 2>&1; then
  echo "cruise-tls 已存在于 cruise namespace"
else
  echo "未找到 cruise-tls secret，请先执行 scripts/tenants/issue-cruise-tls.sh 申请证书"
  exit 1
fi

echo "=== 3. 部署 Cruise 测试环境资源 ==="
kubectl apply -f "$PROJECT_ROOT/deploy/k3s/postgres.yaml"
kubectl apply -f "$PROJECT_ROOT/deploy/k3s/backend.yaml"
kubectl apply -f "$PROJECT_ROOT/deploy/k3s/frontend.yaml"

echo "=== 4. 安装 Tekton Tasks ==="
kubectl apply -f "$PROJECT_ROOT/deploy/tekton/tasks/gradle-build.yaml"
kubectl apply -f /root/gitlab/clean-track/deploy/tekton/tasks/node-build.yaml
kubectl apply -f /root/gitlab/clean-track/deploy/tekton/tasks/image-build.yaml
kubectl apply -f /root/gitlab/clean-track/deploy/tekton/tasks/kubectl-set-image.yaml

echo "=== 5. 安装 Cruise Pipelines ==="
kubectl apply -f "$PROJECT_ROOT/backend/pipeline.yaml"
kubectl apply -f "$PROJECT_ROOT/frontend/pipeline.yaml"

echo "=== 6. 安装 Triggers ==="
kubectl apply -f "$PROJECT_ROOT/deploy/tekton/triggers/triggerbinding.yaml"
kubectl apply -f "$PROJECT_ROOT/deploy/tekton/triggers/triggertemplate.yaml"
kubectl apply -f "$PROJECT_ROOT/deploy/tekton/triggers/eventlistener.yaml"
kubectl apply -f "$PROJECT_ROOT/deploy/tekton/webhook-ingress.yaml"

echo
echo "Cruise 测试环境资源已应用"
echo "Webhook URL: https://pipeline.cleantrackhotel.com/cruise-webhook"
echo "测试域名: https://cruise.cleantrackhotel.com"
