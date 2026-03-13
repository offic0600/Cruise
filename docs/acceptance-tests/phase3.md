# Phase 3 验收测试

> **Phase 目标**：系统集成 — ALM + GitLab + 工时系统对接
> **验收标准**：所有场景通过 = Phase 3 完成，可进入 Phase 4

---

## 场景汇总

| 编号 | 场景 | 用例数 | 状态 |
|------|------|--------|------|
| S1 | ALM 系统集成 | 3 | ✅ 通过 |
| S2 | GitLab 集成 | 3 | ✅ 通过 |
| S3 | 工时系统对接 | 2 | ✅ 通过 |
| S4 | 数据聚合视图 | 2 | ✅ 通过 |
| **合计** | — | **10** | **10/10** |

---

## S1：ALM 系统集成

> 验证与 ALM（应用生命周期管理）系统的对接。

**前置条件**：ALM 模拟服务已启动（端口 8081）

### TC-1.1：从 ALM 同步需求

**操作**：
```bash
curl -X POST http://localhost:8080/api/alm/sync/requirements \
  -H "Authorization: Bearer <TOKEN>"
```

**预期**：
- [x] HTTP 200 OK
- [x] 返回同步结果（成功条数）

**实际**：HTTP 200 OK，同步3条需求

---

### TC-1.2：推送需求到 ALM

**操作**：
```bash
curl -X POST http://localhost:8080/api/alm/push/requirement/1 \
  -H "Authorization: Bearer <TOKEN>"
```

**预期**：
- [x] HTTP 200 OK
- [x] 返回推送结果

**实际**：HTTP 200 OK，推送成功，返回 JIRA-1001

---

### TC-1.3：查询 ALM 同步状态

**操作**：
```bash
curl http://localhost:8080/api/alm/sync/status \
  -H "Authorization: Bearer <TOKEN>"
```

**预期**：
- [x] HTTP 200 OK
- [x] 返回同步状态列表

**实际**：HTTP 200 OK，返回同步状态

---

## S2：GitLab 集成

> 验证与 GitLab 的代码管理集成。

**前置条件**：GitLab 模拟服务已启动（端口 8082）

### TC-2.1：查询项目提交记录

**操作**：
```bash
curl http://localhost:8080/api/gitlab/projects/1/commits \
  -H "Authorization: Bearer <TOKEN>"
```

**预期**：
- [x] HTTP 200 OK
- [x] 返回提交记录列表

**实际**：HTTP 200 OK，返回5条提交记录

---

### TC-2.2：关联需求与代码提交

**操作**：
```bash
curl -X POST http://localhost:8080/api/gitlab/requirement/1/link \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"commitHash":"abc123"}'
```

**预期**：
- [x] HTTP 200 OK
- [x] 返回关联结果

**实际**：HTTP 200 OK，关联成功

---

### TC-2.3：查询代码统计

**操作**：
```bash
curl http://localhost:8080/api/gitlab/projects/1/stats \
  -H "Authorization: Bearer <TOKEN>"
```

**预期**：
- [x] HTTP 200 OK
- [x] 返回代码统计（提交数、影响行数等）

**实际**：HTTP 200 OK，返回代码统计

---

## S3：工时系统对接

> 验证与外部工时系统的对接。

**前置条件**：工时系统模拟服务已启动（端口 8083）

### TC-3.1：同步工时数据

**操作**：
```bash
curl -X POST http://localhost:8080/api/workhours/sync \
  -H "Authorization: Bearer <TOKEN>"
```

**预期**：
- [x] HTTP 200 OK
- [x] 返回同步结果

**实际**：HTTP 200 OK，同步3条记录

---

### TC-3.2：获取工时汇总

**操作**：
```bash
curl http://localhost:8080/api/workhours/summary?projectId=1 \
  -H "Authorization: Bearer <TOKEN>"
```

**预期**：
- [x] HTTP 200 OK
- [x] 返回工时汇总

**实际**：HTTP 200 OK，返回工时汇总

---

## S4：数据聚合视图

> 验证跨系统数据聚合。

### TC-4.1：项目全景视图

**操作**：
```bash
curl http://localhost:8080/api/integration/project/1/overview \
  -H "Authorization: Bearer <TOKEN>"
```

**预期**：
- [x] HTTP 200 OK
- [x] 返回项目全景数据（需求+任务+代码+工时）

**实际**：HTTP 200 OK，返回项目全景数据

---

### TC-4.2：团队综合视图

**操作**：
```bash
curl http://localhost:8080/api/integration/team/1/dashboard \
  -H "Authorization: Bearer <TOKEN>"
```

**预期**：
- [x] HTTP 200 OK
- [x] 返回团队综合数据

**实际**：HTTP 200 OK，返回团队综合数据

---

## 执行记录

| 执行日期 | 执行人 | 通过 | 失败 | 跳过 | 备注 |
|---------|--------|------|------|------|------|
| 2026-03-09 | offic0600 | 10 | 0 | 0 | 全部通过 |

---

## 启动命令速查

```bash
# 后端
cd backend && ./gradlew bootRun

# ALM 模拟服务（后台运行）
# 端口 8081

# GitLab 模拟服务（后台运行）
# 端口 8082

# 工时系统模拟服务（后台运行）
# 端口 8083
```

---

*创建：2026-03-09（Phase 2 完成后）*
*更新：2026-03-09（Phase 3 验收完成）*
*状态：Phase 3 完成*
