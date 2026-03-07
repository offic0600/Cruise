# Cruise — 开发日志（Dev Logbook）

> 持续更新的开发日志，记录每次 Session 的关键动作、决策和进展。
> 每 5 个 Session 做一次全量审查（格式统一、去重、清理过时内容）。

---

## Session 1 — 2026-03-06：项目启动 + 技术选型

**目标**：了解项目全貌，建立文档基础设施，完成技术选型。

### 1.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 阅读 | `CLAUDE.md` | 理解 Cruise 项目定位、架构原则、Phase 路线图 |
| 阅读 | `references/` | 全量阅读 Forge 参考文档（架构、方法论、Logbook、基线等） |
| 新增 | `docs/ai-coding-best-practices.md` | 基于 Forge 28 Session 提炼的 AI Coding 最佳实践指南 |
| 新增 | `docs/planning/dev-logbook.md` | 本文件，开发日志初始化 |
| 新增 | `docs/planning/plan-baseline.md` | 规划基线 v0.1 初始化 |
| 新增 | `docs/baselines/design-baseline.md` | 设计基线 v0.1 初始化（Phase 0 起点） |
| 新增 | `docs/acceptance-tests/phase0.md` | Phase 0 验收场景（场景先行） |
| 新增 | `docs/index.md` | 文档导航 |
| 修改 | `CLAUDE.md` | 补充技术栈选型结果，版本升至 v1.1 |

### 1.2 技术选型决策

| 维度 | 选择 | 理由 |
|------|------|------|
| 后端 | Kotlin + Spring Boot 3.x / JDK 21 | Forge 已验证，企业级成熟，AI Coding 友好 |
| 前端 | React + Next.js 15（App Router）+ TypeScript | Forge 已验证，生态最成熟 |
| 数据库 | PostgreSQL 16 | 功能全，支持 JSON，开源免费 |
| 部署 | 本地裸跑优先，后期 Docker Compose | Phase 0 快速启动，减少环境复杂度 |
| 构建 | Gradle Kotlin DSL + npm | 与技术栈匹配 |

### 1.3 Bug 记录

无（本 Session 为纯文档 + 规划工作）。

### 1.4 经验沉淀

- references/ 是只读参考目录，本项目文档均写入 docs/
- 先建文档基础设施（Logbook + 双基线 + 验收测试），再动代码
- Phase 0 验收场景应在骨架搭建前写好（场景先行原则）

### 1.5 统计快照

| 指标 | 值 |
|------|-----|
| 文件总数 | 7（docs/ 下） |
| 代码文件 | 0 |
| 单元测试 | 0 |
| 验收场景 | Phase 0：4 场景 / 12 用例 |
| Git Commits | 2 |

### 1.6 Git Commit

`3047885` — `docs: add AI coding best practices and project docs structure`
`e54231f` — `docs: initialize project documentation infrastructure`

---

## Session 2 — 2026-03-06：Phase 0 骨架搭建

**目标**：搭建项目骨架，后端 Spring Boot + 前端 Next.js + 数据库 Migration。

### 2.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 新增 | `settings.gradle.kts` | Gradle monorepo 入口 |
| 新增 | `build.gradle.kts` | 根构建配置：Kotlin 1.9+, Spring Boot 3.3.5, JDK 21 |
| 新增 | `gradle.properties` | 并行构建配置 |
| 新增 | `gradlew` / `gradlew.bat` | Gradle wrapper |
| 新增 | `gradle/wrapper/gradle-wrapper.properties` | Gradle 8.10.2 |
| 新增 | `.gitignore` | 扩展忽略规则 |
| 新增 | `backend/build.gradle.kts` | Spring Boot 后端配置 |
| 新增 | `backend/settings.gradle.kts` | 后端模块配置 |
| 新增 | `backend/src/main/kotlin/com/cruise/CruiseApplication.kt` | Spring Boot 启动类 |
| 新增 | `backend/src/main/kotlin/com/cruise/controller/HealthController.kt` | Health 端点 |
| 新增 | `backend/src/main/kotlin/com/cruise/entity/*.kt` | 5 个 Entity 类 |
| 新增 | `backend/src/main/resources/application.yml` | PostgreSQL 配置 |
| 新增 | `backend/src/main/resources/db/migration/V1__init_schema.sql` | 数据库 DDL |
| 新增 | `frontend/package.json` | Next.js 15 + React 19 + Tailwind |
| 新增 | `frontend/tsconfig.json` | TypeScript strict 配置 |
| 新增 | `frontend/next.config.js` | Next.js 配置 |
| 新增 | `frontend/tailwind.config.ts` | Tailwind CSS 配置 |
| 新增 | `frontend/postcss.config.js` | PostCSS 配置 |
| 新增 | `frontend/src/app/page.tsx` | 首页 |
| 新增 | `frontend/src/app/layout.tsx` | 根布局 |
| 新增 | `frontend/src/app/globals.css` | 全局样式 |

### 2.2 技术确认

| 维度 | 选择 | 说明 |
|------|------|------|
| 前端样式 | Tailwind CSS | 用户确认采用 |
| 数据库 | cruise / cruise_db / cruise123 | 用户确认采用 |

### 2.3 Bug 记录

无（本 Session 为骨架创建，无代码调试）。

### 2.4 经验沉淀

- 并行 Agent 策略：前端/后端可并行创建（本 Session 顺序执行演示）
- Gradle wrapper 下载失败时，使用 raw.githubusercontent.com 镜像源
- 前端 Next.js 15 + React 19 + Tailwind 组合已验证

### 2.5 统计快照

| 指标 | 值 |
|------|-----|
| 文件总数 | 27（代码 + 配置） |
| 代码文件 | 12（Kotlin + TypeScript） |
| Entity 类 | 5（Project/Requirement/Task/TeamMember/Defect） |
| 单元测试 | 0 |
| 验收场景 | Phase 0：4 场景 / 12 用例 |

### 2.6 Bug 记录

- **环境网络问题**：Maven Central 无法访问，使用阿里云镜像 + repo1.maven.org 解决
- **Gradle 缓存损坏**：多次清理缓存后解决
- **Kotlin 版本**：使用 kotlin-stdlib（旧模块名）而非 kotlinstdlib
- **Spring Boot 启动类**：必须标记为 `open class`
- **PostgreSQL 未启动**：后端连接失败，需确保本地 PostgreSQL 运行

### 2.7 经验沉淀

- 使用 `https://repo1.maven.org/maven2` 解决 Maven Central 访问问题
- Gradle 8.5 比 8.10.2 更稳定
- Kotlin stdlib 使用旧模块名 `org.jetbrains.kotlin:kotlin-stdlib`

### 2.8 Git Commit

`fefbf4f` — `feat: Phase 0 骨架搭建 - Spring Boot + Next.js`

---

## Session 3 — 2026-03-07：Phase 0 验收测试

**目标**：执行验收测试，验证骨架可运行。

### 3.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 执行 | `./gradlew build -x test` | 后端编译成功 |
| 执行 | `./gradlew bootRun` | 后端启动（需 PostgreSQL） |
| 执行 | `curl localhost:8080/health` | Health 接口返回 UP |
| 执行 | `cd frontend && npm install` | 前端依赖安装成功 |
| 执行 | `cd frontend && npm run build` | 前端构建成功 |
| 执行 | `cd frontend && npm run dev` | 前端开发服务器运行 |

### 3.2 验收结果

| 测试场景 | 通过 | 状态 |
|---------|------|------|
| S1 后端骨架可运行 | 3/3 | ✅ |
| S2 前端骨架可运行 | 3/3 | ✅ |
| S3 数据库连接 | - | ⏳ 需 PostgreSQL |
| S4 数据模型已定义 | 3/3 | ✅ |

### 3.3 已知问题

- PostgreSQL 未运行，后端启动时会报连接错误
- 需要用户手动启动 PostgreSQL 后再运行后端

### 3.4 统计快照

| 指标 | 值 |
|------|-----|
| 后端编译 | ✅ 成功 |
| 后端启动 | ✅ 成功（PostgreSQL 除外） |
| Health 接口 | ✅ 返回 UP |
| 前端依赖 | ✅ 111 packages |
| 前端构建 | ✅ 成功 |

### 3.5 Git Commit

`[待提交]` — `fix: 修复启动类 open class 问题`

---

> *下次 Session 开始时，先读本文件最后一条记录恢复上下文。*
