# Cruise 发布手册

当前 `Cruise` 测试环境部署目标为 `223.254.144.74` 上的 K3s/Tekton 集群。

## 测试环境入口

先在 `223` 或任意已配置该集群 kubeconfig 的机器上执行：

```bash
cd /root/gitlab/Cruise
bash deploy/tekton/apply-all.sh
```

这会完成：

- 创建 `cruise` namespace
- 安装 `PostgreSQL` StatefulSet / Service / Secret
- 安装 `Cruise` 的 backend/frontend Deployment、Service、Ingress
- 安装 `Cruise` 的 Tekton Task/Pipeline/Trigger/Webhook Ingress

在执行前，先准备 `cruise` 独立证书：

```bash
bash scripts/tenants/issue-cruise-tls.sh
```

## 手动触发测试环境构建

```bash
kubectl create -f deploy/tekton/pipelineruns/backend-run.yaml
kubectl create -f deploy/tekton/pipelineruns/frontend-run.yaml
```

查看状态：

```bash
kubectl get pipelinerun -n pipeline | grep cruise
kubectl get pods -n cruise
```

## 自动触发

- 分支：`develop`
- Webhook 地址：`https://pipeline.cleantrackhotel.com/cruise-webhook`
- 触发规则：
  - 改 `backend/` 触发 backend pipeline
  - 改 `frontend/` 触发 frontend pipeline

如果仓库 Webhook 平台与 `power` 不同，需确认推送事件 payload 至少包含：

- `repository.clone_url`
- `ref`
- `after`
- `commits[].added/modified/removed`

## 测试环境域名

- 前端：`https://cruise.cleantrackhotel.com`
- 后端健康检查：`https://cruise.cleantrackhotel.com/actuator/health`
- TLS Secret：`cruise-tls`

## 运行时约定

- 前端默认走同域名相对路径 `/api`
- 后端测试环境默认连接 `postgres:5432/cruise`
- PostgreSQL 数据盘申请 `160Gi`，`storageClassName: local-path`
- 后端通过环境变量设置：
  - `CRUISE_AUTH_FRONTEND_BASE_URL=https://cruise.cleantrackhotel.com`
  - `CRUISE_AUTH_BACKEND_BASE_URL=https://cruise.cleantrackhotel.com`

## 常用排查

```bash
kubectl get deploy,svc,ingress -n cruise
kubectl describe pod -n cruise
kubectl logs -n cruise deploy/cruise-backend
kubectl logs -n cruise deploy/cruise-frontend
kubectl logs -n pipeline deploy/el-cruise-event-listener
curl -I https://cruise.cleantrackhotel.com/login
curl https://cruise.cleantrackhotel.com/actuator/health
```
