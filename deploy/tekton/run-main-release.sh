#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

REVISION="${REVISION:-main}"
IMAGE_TAG="${IMAGE_TAG:-$(date +%Y%m%d-%H%M%S)-$(git -C "$PROJECT_ROOT" rev-parse --short HEAD)}"
WAIT_TIMEOUT="${WAIT_TIMEOUT:-900s}"

echo "=== Cruise Tekton 发布 ==="
echo "revision:   $REVISION"
echo "image tag:  $IMAGE_TAG"

echo "=== 1. 安装/更新 Tekton 与测试环境资源 ==="
bash "$PROJECT_ROOT/deploy/tekton/apply-all.sh"

echo "=== 2. 触发 backend pipeline ==="
kubectl create -f - <<EOF
apiVersion: tekton.dev/v1
kind: PipelineRun
metadata:
  generateName: cruise-backend-run-
  namespace: pipeline
spec:
  pipelineRef:
    name: cruise-backend-pipeline
  taskRunTemplate:
    serviceAccountName: tekton-sa
  params:
    - name: repo-url
      value: https://github.com/offic0600/Cruise.git
    - name: revision
      value: ${REVISION}
    - name: image-tag
      value: ${IMAGE_TAG}
  workspaces:
    - name: shared-workspace
      volumeClaimTemplate:
        spec:
          accessModes:
            - ReadWriteOnce
          resources:
            requests:
              storage: 5Gi
EOF

echo "=== 3. 触发 frontend pipeline ==="
kubectl create -f - <<EOF
apiVersion: tekton.dev/v1
kind: PipelineRun
metadata:
  generateName: cruise-frontend-run-
  namespace: pipeline
spec:
  pipelineRef:
    name: cruise-frontend-pipeline
  taskRunTemplate:
    serviceAccountName: tekton-sa
  params:
    - name: repo-url
      value: https://github.com/offic0600/Cruise.git
    - name: revision
      value: ${REVISION}
    - name: image-tag
      value: ${IMAGE_TAG}
  workspaces:
    - name: shared-workspace
      volumeClaimTemplate:
        spec:
          accessModes:
            - ReadWriteOnce
          resources:
            requests:
              storage: 5Gi
EOF

echo "=== 4. 等待流水线完成 ==="
kubectl -n pipeline wait --for=condition=Succeeded pipelinerun -l tekton.dev/pipeline=cruise-backend-pipeline --timeout="$WAIT_TIMEOUT" || true
kubectl -n pipeline wait --for=condition=Succeeded pipelinerun -l tekton.dev/pipeline=cruise-frontend-pipeline --timeout="$WAIT_TIMEOUT" || true

echo "=== 5. 当前状态 ==="
kubectl get pipelinerun -n pipeline | grep cruise || true
kubectl -n cruise get deploy cruise-backend cruise-frontend -o custom-columns=NAME:.metadata.name,IMAGE:.spec.template.spec.containers[*].image,READY:.status.readyReplicas,UPDATED:.status.updatedReplicas,AVAILABLE:.status.availableReplicas
