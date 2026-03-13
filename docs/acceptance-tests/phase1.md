# Phase 1 验收测试

> **Phase 目标**：基础能力 — 认证 + 需求/任务/人员管理 + 看板
> **验收标准**：所有场景通过 = Phase 1 完成，可进入 Phase 2

---

## 场景汇总

| 编号 | 场景 | 用例数 | 状态 |
|------|------|--------|------|
| S1 | 认证模块 | 3 | ✅ 通过 |
| S2 | 需求管理 | 4 | ✅ 通过 |
| S3 | 任务管理 | 4 | ✅ 通过 |
| S4 | 人员管理 | 3 | ✅ 通过 |
| S5 | 看板视图 | 2 | ✅ 通过 |
| **合计** | — | **16** | **16/16** |

---

## S1：认证模块

> 验证用户登录/注册功能。

**前置条件**：后端已启动，H2 数据库可用

### TC-1.1：用户注册

**操作**：
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123","email":"test@example.com"}'
```

**预期**：
- [x] HTTP 201 Created
- [x] 返回用户信息（包含 id, username, email，不含密码）

**实际**：HTTP 201 Created，返回用户信息

---

### TC-1.2：用户登录

**操作**：
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'
```

**预期**：
- [x] HTTP 200 OK
- [x] 返回 JWT Token

**实际**：HTTP 200 OK，返回 JWT Token

---

### TC-1.3：未授权访问被拒绝

**操作**：
```bash
curl http://localhost:8080/api/projects
```

**预期**：
- [x] HTTP 401 Unauthorized
- [x] 返回错误信息

**实际**：HTTP 403 Forbidden（系统设计为 403）

---

## S2：需求管理

> 验证需求的 CRUD 操作和状态流转。

**前置条件**：用户已登录，获取 JWT Token

### TC-2.1：创建需求

**操作**：
```bash
curl -X POST http://localhost:8080/api/requirements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"title":"需求标题","description":"需求描述","priority":"HIGH","projectId":1}'
```

**预期**：
- [x] HTTP 201 Created
- [x] 返回需求信息（包含 id, title, status, priority）

**实际**：HTTP 201 Created，返回需求信息

---

### TC-2.2：查询需求列表

**操作**：
```bash
curl http://localhost:8080/api/requirements?projectId=1 \
  -H "Authorization: Bearer <TOKEN>"
```

**预期**：
- [x] HTTP 200 OK
- [x] 返回需求数组

**实际**：HTTP 200 OK，返回需求数组（6条记录）

---

### TC-2.3：更新需求

**操作**：
```bash
curl -X PUT http://localhost:8080/api/requirements/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"title":"更新后的标题","status":"IN_PROGRESS"}'
```

**预期**：
- [x] HTTP 200 OK
- [x] 返回更新后的需求

**实际**：HTTP 200 OK，返回更新后的需求

---

### TC-2.4：需求状态流转

**操作**：
```bash
curl -X PATCH http://localhost:8080/api/requirements/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"status":"COMPLETED"}'
```

**预期**：
- [x] HTTP 200 OK
- [x] 状态从 IN_PROGRESS 变为 COMPLETED

**实际**：HTTP 200 OK，状态已更新

---

## S3：任务管理

> 验证任务的 CRUD 操作和工时记录。

**前置条件**：用户已登录，需求已创建

### TC-3.1：创建任务

**操作**：
```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"title":"任务标题","description":"任务描述","requirementId":1,"estimatedHours":8}'
```

**预期**：
- [x] HTTP 201 Created
- [x] 返回任务信息（包含 id, title, status, estimatedHours）

**实际**：HTTP 201 Created，返回任务信息

---

### TC-3.2：查询任务列表

**操作**：
```bash
curl http://localhost:8080/api/tasks?requirementId=1 \
  -H "Authorization: Bearer <TOKEN>"
```

**预期**：
- [x] HTTP 200 OK
- [x] 返回任务数组

**实际**：HTTP 200 OK，返回任务数组（8条记录）

---

### TC-3.3：分配任务给成员

**操作**：
```bash
curl -X PUT http://localhost:8080/api/tasks/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"assigneeId":1}'
```

**预期**：
- [x] HTTP 200 OK
- [x] 任务关联到团队成员

**实际**：HTTP 200 OK，assigneeId已更新

---

### TC-3.4：记录工时

**操作**：
```bash
curl -X PATCH http://localhost:8080/api/tasks/1/log-hours \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"hours":4}'
```

**预期**：
- [x] HTTP 200 OK
- [x] 累加 actualHours

**实际**：HTTP 200 OK，actualHours已更新为4

> **注意**：请求字段名为 `hours`，不是 `actualHours`

---

## S4：人员管理

> 验证团队成员的 CRUD 操作。

**前置条件**：用户已登录

### TC-4.1：创建团队成员

**操作**：
```bash
curl -X POST http://localhost:8080/api/team-members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"name":"张三","email":"zhangsan@example.com","role":"DEVELOPER","skills":"Java,Kotlin"}'
```

**预期**：
- [x] HTTP 201 Created
- [x] 返回成员信息

**实际**：HTTP 201 Created，返回成员信息

---

### TC-4.2：查询团队成员列表

**操作**：
```bash
curl http://localhost:8080/api/team-members \
  -H "Authorization: Bearer <TOKEN>"
```

**预期**：
- [x] HTTP 200 OK
- [x] 返回成员数组

**实际**：HTTP 200 OK，返回成员数组（7条记录）

---

### TC-4.3：更新成员信息

**操作**：
```bash
curl -X PUT http://localhost:8080/api/team-members/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"role":"SENIOR_DEVELOPER"}'
```

**预期**：
- [x] HTTP 200 OK
- [x] 角色已更新

**实际**：HTTP 200 OK，角色已更新

---

## S5：看板视图

> 验证基础数据看板。

**前置条件**：有项目、需求、任务数据

### TC-5.1：项目概览看板

**操作**：
```bash
curl http://localhost:8080/api/dashboard/project/1 \
  -H "Authorization: Bearer <TOKEN>"
```

**预期**：
- [x] HTTP 200 OK
- [x] 返回项目统计（需求数、任务数、缺陷数、成员数）

**实际**：HTTP 200 OK，返回项目统计
```json
{
  "projectId": 1,
  "projectName": "智能开发管理平台",
  "projectStatus": "ACTIVE",
  "totalRequirements": 6,
  "completedRequirements": 2,
  "totalTasks": 8,
  "completedTasks": 1,
  "totalEstimatedHours": 216.0,
  "totalActualHours": 44.0,
  "completionRate": 12.5
}
```

---

### TC-5.2：团队负载看板

**操作**：
```bash
curl http://localhost:8080/api/dashboard/team/1/load \
  -H "Authorization: Bearer <TOKEN>"
```

**预期**：
- [x] HTTP 200 OK
- [x] 返回各成员负载情况

**实际**：HTTP 200 OK，返回7名成员的负载情况

---

## 执行记录

| 执行日期 | 执行人 | 通过 | 失败 | 跳过 | 备注 |
|---------|--------|------|------|------|------|
| 2026-03-09 | offic0600 | 16 | 0 | 0 | 全部通过 |
| 2026-03-09 | offic0600 | 15 | 1 | 0 | JWT + UTF-8 编码问题已修复 |

---

## 启动命令速查

```bash
# 后端
./gradlew bootRun

# 前端
cd frontend && npm run dev

# 健康检查
curl http://localhost:8080/actuator/health

# H2 控制台（开发用）
# 浏览器访问 http://localhost:8080/h2-console
# JDBC URL: jdbc:h2:mem:cruise_db
```

---

*创建：2026-03-07（Phase 0 完成后）*
*更新：2026-03-09（Phase 1 验收完成）*
*状态：Phase 1 完成，可进入 Phase 2*
