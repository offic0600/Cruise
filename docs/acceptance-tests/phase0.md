# Phase 0 验收测试

> **Phase 目标**：技术选型 + 项目骨架 + 核心数据模型设计
> **验收标准**：所有场景通过 = Phase 0 完成，可进入 Phase 1

---

## 场景汇总

| 编号 | 场景 | 用例数 | 状态 |
|------|------|--------|------|
| S1 | 后端骨架可运行 | 3 | ⏳ 待执行 |
| S2 | 前端骨架可运行 | 3 | ⏳ 待执行 |
| S3 | 数据库连接可用 | 3 | ⏳ 待执行 |
| S4 | 核心数据模型已定义 | 3 | ⏳ 待执行 |
| **合计** | — | **12** | — |

---

## S1：后端骨架可运行

> 验证 Spring Boot 项目可以正常启动并响应请求。

**前置条件**：JDK 21 已安装，PostgreSQL 本地已启动

### TC-1.1：后端能正常编译

**操作**：
```bash
./gradlew build -x test
```

**预期**：
- [ ] 构建成功，输出 `BUILD SUCCESSFUL`
- [ ] 无编译错误

**实际**：_待执行_

---

### TC-1.2：后端能正常启动

**操作**：
```bash
./gradlew bootRun
```

**预期**：
- [ ] 进程启动，日志显示 `Started CruiseApplication`
- [ ] 默认端口 8080 监听成功

**实际**：_待执行_

---

### TC-1.3：健康检查接口可用

**操作**：
```bash
curl http://localhost:8080/actuator/health
```

**预期**：
- [ ] HTTP 200
- [ ] 返回 `{"status":"UP"}`

**实际**：_待执行_

---

## S2：前端骨架可运行

> 验证 Next.js 项目可以正常启动并在浏览器中访问。

**前置条件**：Node.js 18+ 已安装

### TC-2.1：前端依赖安装成功

**操作**：
```bash
cd frontend && npm install
```

**预期**：
- [ ] 安装成功，无 error 级别错误
- [ ] `node_modules/` 目录生成

**实际**：_待执行_

---

### TC-2.2：前端类型检查通过

**操作**：
```bash
cd frontend && npm run build
```

**预期**：
- [ ] 构建成功
- [ ] 无 TypeScript 类型错误

**实际**：_待执行_

---

### TC-2.3：前端开发服务器可访问

**操作**：
```bash
cd frontend && npm run dev
# 浏览器访问 http://localhost:3000
```

**预期**：
- [ ] 开发服务器启动，端口 3000 监听
- [ ] 浏览器可访问首页（显示项目名称或占位内容）

**实际**：_待执行_

---

## S3：数据库连接可用

> 验证后端能正常连接 PostgreSQL 并完成数据库初始化。

**前置条件**：PostgreSQL 16 本地已安装并启动

### TC-3.1：数据库连接配置正确

**操作**：查看后端 `application.yml`，确认数据库连接配置

**预期**：
- [ ] `spring.datasource.url` 指向本地 PostgreSQL
- [ ] `spring.datasource.username` / `password` 已配置

**实际**：_待执行_

---

### TC-3.2：后端启动时自动建表

**操作**：
```bash
./gradlew bootRun
# 查看日志或连接数据库
psql -U cruise -d cruise_db -c "\dt"
```

**预期**：
- [ ] 启动日志无数据库连接错误
- [ ] 数据库中存在核心表（project, requirement, task, team_member, defect）

**实际**：_待执行_

---

### TC-3.3：核心表结构符合数据模型设计

**操作**：
```bash
psql -U cruise -d cruise_db -c "\d requirement"
```

**预期**：
- [ ] requirement 表包含必要字段（id, title, status, priority, project_id 等）
- [ ] 字段类型符合设计文档

**实际**：_待执行_

---

## S4：核心数据模型已定义

> 验证核心数据模型已完成设计并有文档记录。

### TC-4.1：数据模型 ERD 文档存在

**操作**：检查 `docs/baselines/design-baseline.md` 中数据模型章节

**预期**：
- [ ] 包含 5 个核心实体（Project/Requirement/Task/TeamMember/Defect）
- [ ] 每个实体有关键字段定义
- [ ] 实体间关系有描述

**实际**：_待执行_

---

### TC-4.2：Migration 脚本存在且可执行

**操作**：检查 `backend/src/main/resources/db/migration/` 目录

**预期**：
- [ ] 存在初始化 migration 文件（如 `V1__init_schema.sql`）
- [ ] 脚本语法正确（psql 可执行）

**实际**：_待执行_

---

### TC-4.3：Kotlin 实体类与数据库表对应

**操作**：对照数据库表，检查 Kotlin `@Entity` 类

**预期**：
- [ ] 每张核心表对应一个 Kotlin Entity 类
- [ ] 字段映射正确（无遗漏的必要字段）

**实际**：_待执行_

---

## 执行记录

| 执行日期 | 执行人 | 通过 | 失败 | 跳过 | 备注 |
|---------|--------|------|------|------|------|
| _待执行_ | — | — | — | — | — |

---

## 启动命令速查

```bash
# 后端
./gradlew bootRun

# 前端
cd frontend && npm run dev

# 数据库
psql -U cruise -d cruise_db

# 健康检查
curl http://localhost:8080/actuator/health
```

---

*创建：2026-03-06（场景先行，骨架建立前写好）*
*状态：等待 Phase 0 骨架完成后执行*
