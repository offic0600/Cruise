# Cruise on K3S

这套清单按下面的方式部署：

- `frontend` 和 `backend` 分开部署
- 同域名 Ingress 转发
- `/` 到 Next.js
- `/api` 到 Spring Boot
- PostgreSQL 跑在 K3S 内
- TLS 使用 `cruise-tls` Secret，需先单独申请

## 1. 先改占位符

必须改这些文件里的占位值：

- `deploy/k3s/configmap.yaml`
- `deploy/k3s/secret.example.yaml`
- `deploy/k3s/backend.yaml`
- `deploy/k3s/frontend.yaml`
- `deploy/k3s/ingress.yaml`

主要需要替换：

- `cruise.example.com`
- `registry.example.com/cruise/backend:latest`
- `registry.example.com/cruise/frontend:latest`
- `POSTGRES_PASSWORD`
- `JWT_SECRET`
- `MINIMAX_API_KEY`
- SMTP 配置

把 `secret.example.yaml` 复制成你自己的 `secret.yaml`。`apply-all.sh` 会直接使用 `secret.yaml` 部署，不会应用示例密钥。

## 2. 构建并推镜像

从仓库根目录执行：

```bash
docker build -f backend/Dockerfile -t registry.example.com/cruise/backend:latest .
docker push registry.example.com/cruise/backend:latest

docker build -f frontend/Dockerfile -t registry.example.com/cruise/frontend:latest .
docker push registry.example.com/cruise/frontend:latest
```

## 3. 部署到 K3S

先申请 `cruise` 域名证书：

```bash
bash scripts/tenants/issue-cruise-tls.sh
```

再部署资源：

```bash
cp deploy/k3s/secret.example.yaml deploy/k3s/secret.yaml
# 填写真实密钥后执行
bash deploy/tekton/apply-all.sh
```

## 4. 验证

```bash
kubectl -n cruise get pods
kubectl -n cruise get svc
kubectl -n cruise get ingress
kubectl -n cruise logs deploy/cruise-backend
kubectl -n cruise logs deploy/cruise-frontend
```

## 5. 说明

- 前端默认走同域 `/api`，因此 Ingress 配好后不用把后端地址写死到前端镜像里。
- 后端已经支持通过环境变量切换 PostgreSQL、JWT、MiniMax 和前端回跳地址。
- `spring.mail` 如果不配，健康检查可能受影响；生产环境建议配真实 SMTP。
