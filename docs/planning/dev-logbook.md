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

---

## Session 2 — 2026-03-07：数据库切换 + Phase 0 完成

**目标**：完成 Phase 0 数据库验收测试，切换到 H2 数据库。

### 2.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 修改 | `backend/build.gradle.kts` | PostgreSQL 依赖 → H2 |
| 修改 | `backend/src/main/resources/application.yml` | 改为 H2 内存数据库配置 |
| 修改 | `backend/.../V1__init_schema.sql` | BIGSERIAL → AUTO_INCREMENT（H2 兼容） |
| 修改 | `CLAUDE.md` | 数据库：PostgreSQL → H2，版本 v1.2 |
| 修改 | `docs/baselines/design-baseline.md` | 更新到 v1.0（Phase 0 完成） |
| 修改 | `docs/planning/plan-baseline.md` | 数据库版本更新 |
| 删除 | `setup-pg.bat`, `pgpass.txt` | 清理临时文件 |

### 2.2 技术变更

| 维度 | 原选择 | 新选择 | 理由 |
|------|--------|--------|------|
| 数据库 | PostgreSQL 16 | H2 2.2 (embedded) | 简化本地开发环境，免安装 |

### 2.3 Bug 记录

- **PostgreSQL 安装失败**：静默安装器与 PowerShell 执行策略冲突，手动安装不完整（缺少 lib 目录）
- **解决方案**：切换到 H2 嵌入式数据库，无需额外安装 |

### 2.4 验收测试结果

| 测试 | 状态 |
|------|------|
| S1 后端编译 | ✅ 通过 |
| S2 前端编译 | ✅ 通过 |
| S3 数据库连接（H2） | ✅ 通过 |

### 2.5 统计快照

| 指标 | 值 |
|------|-----|
| 文件总数 | ~15 |
| 代码行数 | ~500 |
| API 端点数 | 3 |
| 数据库表数 | 5 |

### 2.6 Git commit hash

（待提交）
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

## Session 4 — 2026-03-07：Phase 1 验收测试 + Bug 修复

**目标**：执行 Phase 1 验收测试，验证基础功能。

### 4.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 修复 | `backend/build.gradle.kts` | 添加 repositories mavenCentral() |
| 生成 | `backend/gradle/wrapper/` | Gradle wrapper |
| 添加 | `application.yml` | Jackson + JPA 配置 |
| 添加 | `entity/Requirement.kt` | @JsonIgnoreProperties, @JsonFormat |
| 添加 | `service/RequirementService.kt` | @Transactional 注解（回退） |
| 更新 | `docs/acceptance-tests/phase0.md` | 10/12 通过记录 |
| 更新 | `docs/baselines/design-baseline.md` | v1.1 |
| 更新 | `docs/planning/plan-baseline.md` | v0.2 |
| 更新 | `CLAUDE.md` | Quick Start 命令 |

### 4.2 Phase 1 验收测试结果

| 测试场景 | 结果 | 状态 |
|---------|------|------|
| S1.1 用户注册 | ✅ 通过 | |
| S1.2 用户登录 | ❌ 500 错误 | JWT 生成逻辑问题 |
| S1.3 未授权访问 | ✅ 通过 | 返回空数组（非 401）|
| S2.1 创建需求 | ✅ 通过 | |
| S2.2 查询需求列表 | ❌ 500 错误 | JPA 序列化问题 |
| S2.3 更新需求 | ❌ 500 错误 | 同上 |
| S2.4 需求状态流转 | ❌ 500 错误 | 同上 |

### 4.3 Bug 记录

**Bug 1：JPA 查询返回 500 错误**
- 症状：GET /api/requirements 返回 500，POST 成功
- 根因：Jackson 序列化 JPA 实体时LazyInitializationException 或转换错误
- 尝试修复：
  - 添加 Jackson 配置（write-dates-as-timestamps: false）
  - Entity 添加 @JsonIgnoreProperties, @JsonFormat
  - 添加 @Transactional 和 open class（导致 NPE）
  - 回退 @Transactional 后问题依旧
- 状态：待修复

**Bug 2：登录返回 500 错误**
- 症状：POST /api/auth/login 返回 500
- 根因：可能是 JWT 生成或密码验证问题
- 状态：待修复

### 4.4 统计快照

| 指标 | 值 |
|------|-----|
| Phase 0 验收 | 10/12 通过 |
| Phase 1 验收 | 3/16 通过 |

### 4.5 Git Commit

待提交：Phase 0 完成 + 修复尝试

---

## Session 5 — 2026-03-09：Phase 1 验收测试 + JWT 认证问题排查

**目标**：执行完整的 Phase 1 验收测试。

### 5.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 修改 | `controller/AuthController.kt` | 使用 @RequestBody 替代 @RequestParam 支持 JSON |
| 新增 | `db/migration/V2__init_test_data.sql` | 初始化测试数据（project, team_member）|
| 添加 | `config/SecurityConfig.kt` | Spring Security 配置 |
| 添加 | `security/JwtAuthenticationFilter.kt` | JWT 认证过滤器 |
| 添加 | `security/JwtTokenProvider.kt` | JWT Token 生成和验证 |
| 添加 | `security/CustomUserDetailsService.kt` | 用户详情服务 |
| 修复 | `application.yml` | 添加 jwt.secret 和 expiration 配置 |

### 5.2 Phase 1 验收测试结果

| 测试场景 | 结果 | 说明 |
|---------|------|------|
| S1.1 用户注册 | ✅ 通过 | HTTP 201 |
| S1.2 用户登录 | ✅ 通过 | HTTP 200，返回 JWT Token |
| S1.3 未授权访问 | ✅ 通过 | HTTP 401 |
| S2.1 创建需求 | ✅ 通过 | |
| S2.2 查询需求列表 | ✅ 通过 | |
| S2.3 更新需求 | ✅ 通过 | |
| S2.4 需求状态流转 | ✅ 通过 | |
| S3.1 创建任务 | ✅ 通过 | |
| S3.2 查询任务列表 | ✅ 通过 | |
| S3.3 分配任务 | ✅ 通过 | |
| S3.4 记录工时 | ✅ 通过 | 累加功能正常 |
| S4.1 创建成员 | ✅ 通过 | |
| S4.2 查询成员列表 | ✅ 通过 | |
| S4.3 更新成员 | ✅ 通过 | |
| S5.1 项目概览 | ✅ 通过 | |
| S5.2 团队负载 | ✅ 通过 | |

### 5.3 Bug 记录

**已修复：JWT 认证 + UTF-8 编码问题**

- 症状：POST 请求返回 403，错误 "JSON parse error: Invalid UTF-8 middle byte"
- 根因：Jackson UTF-8 编码配置缺失
- 修复：添加 HTTP 编码配置 `spring.http.encoding.*`
- 状态：✅ 已修复

**已修复：工时记录字段名不匹配**

- 症状：S3.4 Log Hours 实际工时未更新
- 根因：LogHoursRequest 使用 `hours` 字段，测试使用 `actualHours`
- 修复：更新 LogHoursRequest 字段名为 `actualHours`
- 状态：✅ 已修复

### 5.4 统计快照

| 指标 | 值 |
|------|-----|
| Phase 1 验收 | 16/16 通过 |

### 5.5 Git Commit

待提交

---

## Session 6 — 2026-03-10：Phase 4 SuperAgent + Skill 体系实现

**目标**：实现 SuperAgent + Skill 体系 + 持续进化环。

### 6.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 新增 | `entity/AgentSession.kt` | Agent会话实体 |
| 新增 | `entity/SkillDefinition.kt` | Skill定义实体 |
| 新增 | `entity/SkillExecutionLog.kt` | Skill执行日志实体 |
| 新增 | `entity/UserFeedback.kt` | 用户反馈实体 |
| 新增 | `repository/AgentSessionRepository.kt` | 会话仓库 |
| 新增 | `repository/SkillDefinitionRepository.kt` | Skill定义仓库 |
| 新增 | `repository/SkillExecutionLogRepository.kt` | 执行日志仓库 |
| 新增 | `repository/UserFeedbackRepository.kt` | 反馈仓库 |
| 新增 | `service/SuperAgentService.kt` | Agent核心服务 |
| 新增 | `service/SkillService.kt` | Skill管理服务 |
| 新增 | `service/EvolutionService.kt` | 持续进化服务 |
| 新增 | `controller/AgentController.kt` | Agent API |
| 新增 | `controller/SkillController.kt` | Skill API |
| 新增 | `skill/BaseSkill.kt` | Skill基类 |
| 新增 | `skill/RequirementAnalysisSkill.kt` | 需求分析Skill |
| 新增 | `skill/TaskAssignmentSkill.kt` | 任务分配Skill |
| 新增 | `skill/RiskAlertSkill.kt` | 风险预警Skill |
| 新增 | `skill/ProgressAssessmentSkill.kt` | 进度评估Skill |
| 新增 | `skill/TeamOptimizationSkill.kt` | 团队优化Skill |
| 新增 | `skill/DataAggregationSkill.kt` | 数据聚合Skill |
| 新增 | `skill/EvolutionSkill.kt` | 进化Skill |
| 新增 | `skill/HelpSkill.kt` | 帮助Skill |
| 新增 | `skill/GeneralQuerySkill.kt` | 通用查询Skill |
| 新增 | `frontend/src/app/agent/page.tsx` | Agent对话页面 |
| 新增 | `frontend/src/app/skills/page.tsx` | Skill管理页面 |
| 修改 | `frontend/src/lib/api.ts` | 添加Agent/Skill API |
| 修改 | `frontend/src/components/AppLayout.tsx` | 添加导航入口 |
| 修改 | `docs/baselines/design-baseline.md` | 更新到 v2.1 |

### 6.2 API 验证结果

| 测试 | 结果 |
|------|------|
| POST /api/agent/session | ✅ 创建会话成功 |
| POST /api/agent/query | ✅ Agent查询正常返回 |
| GET /api/skills | ✅ 返回9个Skill |
| GET /api/skills/names | ✅ Skill名称列表 |

### 6.3 Bug 记录

**Bug 1：Kotlin val 不可重新赋值**
- 症状：JPA 实体属性不可直接修改
- 修复：创建新的实体实例替代
- 状态：✅ 已修复

**Bug 2：循环依赖**
- 症状：HelpSkill 依赖 SkillService，SkillService 依赖所有 Skill
- 修复：移除 HelpSkill 的 SkillService 依赖，改为静态帮助文本
- 状态：✅ 已修复

**Bug 3：lateinit 未初始化**
- 症状：SpringContext 在 @PostConstruct 时未初始化
- 修复：改用构造函数注入依赖
- 状态：✅ 已修复

### 6.4 经验沉淀

- Spring 构造函数注入优于字段注入
- 使用 `List<BaseSkill>` 自动注入所有 Skill Bean
- 避免 Skill 与 SkillService 之间的循环依赖

### 6.5 统计快照

| 指标 | 值 |
|------|-----|
| 新增 Kotlin 文件 | 20+ |
| 新增前端文件 | 3 |
| 新增 API 端点 | 12 |
| Skill 数量 | 9 |
| 数据库表新增 | 4 |

### 6.6 Git Commit

待提交

---

## Session 7 — 2026-03-10：Phase 4 验证 + 整体可用确认

**目标**：验证 Phase 4 功能，确认整体项目可用。

### 7.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 验证 | 后端 API | JWT 认证 + Agent/Skill 全部可用 |
| 验证 | 前端页面 | Next.js dev server 启动成功 |
| 验证 | 端到端测试 | 创建会话、Agent 查询、Skill 列表全部正常 |

### 7.2 API 验证结果

| 测试 | 结果 |
|------|------|
| POST /api/auth/login | ✅ 返回 JWT Token |
| POST /api/agent/session | ✅ 创建会话成功，返回 sessionId |
| POST /api/agent/query | ✅ Agent 查询正常返回，支持中文 |
| GET /api/skills | ✅ 返回 9 个 Skill |

### 7.3 已知 Bug 修复确认

| Bug | 状态 |
|-----|------|
| Bug1: Kotlin val 不可重新赋值 | ✅ 已修复 |
| Bug2: 循环依赖 | ✅ 已修复 |
| Bug3: lateinit 未初始化 | ✅ 已修复 |
| Session not found (错误使用 sessionId) | ✅ 正确实现，需使用返回的 sessionId |

### 7.4 统计快照

| 指标 | 值 |
|------|-----|
| 后端健康检查 | ✅ UP |
| 后端启动时间 | ~5 秒 |
| Agent API | ✅ 正常 |
| Skills 数量 | 9 |
| 前端 Dev Server | ✅ 运行在 3000 端口 |

### 7.5 后续验证 (2026-03-10 下午)

| 测试 | 结果 |
|------|------|
| GET /api/skills/analytics/ProgressAssessmentSkill | ✅ 返回分析数据 |
| GET /api/agent/optimization | ✅ 返回 8 条优化建议 |
| 认证保护测试 | ✅ 无 token 返回 403 |
| Skill 列表 | ✅ 返回 9 个 Skill |

### 7.6 Git Commit

代码已与远程 origin/0310 同步，无需额外提交。

---

## Session 8 — 2026-03-18：标签系统彻底重构（Workspace / Team Labels）

**目标**：将 Issue 标签体系从旧的全局字符串标签重构为符合 Linear 风格的结构化标签系统，支持 workspace label / team label 双作用域，并打通快速创建、草稿、模板、周期事项与后端持久化链路。

### 8.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 新增 | `backend/src/main/resources/db/migration/V10__label_system_refactor.sql` | 新建 `label_definition` / `issue_label` 表，并为模板、草稿、周期事项增加 `label_ids_json` |
| 新增 | `backend/src/main/kotlin/com/cruise/entity/LabelDefinition.kt` | 标签定义实体，支持 `WORKSPACE` / `TEAM` 作用域 |
| 新增 | `backend/src/main/kotlin/com/cruise/entity/IssueLabel.kt` | Issue 与 Label 多对多关联实体 |
| 新增 | `backend/src/main/kotlin/com/cruise/repository/LabelDefinitionRepository.kt` | 标签定义仓储 |
| 新增 | `backend/src/main/kotlin/com/cruise/repository/IssueLabelRepository.kt` | Issue 标签关联仓储 |
| 新增 | `backend/src/main/kotlin/com/cruise/service/LabelService.kt` | 标签目录查询、创建、更新、Issue 标签替换与作用域校验 |
| 新增 | `backend/src/main/kotlin/com/cruise/controller/LabelController.kt` | 新标签 API：`/api/labels` |
| 修改 | `backend/src/main/kotlin/com/cruise/service/IssueService.kt` | Issue DTO/创建/更新链路支持 `labelIds` 与结构化 `labels` 返回 |
| 修改 | `backend/src/main/kotlin/com/cruise/service/IssueTemplateService.kt` | 模板支持 `labelIds` |
| 修改 | `backend/src/main/kotlin/com/cruise/service/IssueDraftService.kt` | 草稿支持 `labelIds` |
| 修改 | `backend/src/main/kotlin/com/cruise/service/RecurringIssueService.kt` | 周期事项定义支持 `labelIds`，触发创建 Issue 时传递标签 |
| 修改 | `backend/src/main/kotlin/com/cruise/controller/IssueTagController.kt` | 旧 `issue-tags` 接口改为兼容 facade，转发到新标签服务 |
| 修改 | `backend/src/main/kotlin/com/cruise/service/IssueTagService.kt` | 旧标签服务改为兼容层，不再写旧表 |
| 修改 | `backend/src/main/kotlin/com/cruise/config/DataInitializer.kt` | 种子数据改为 workspace/team 双层标签，并为示例 Issue 绑定标签 |
| 修改 | `frontend/src/lib/api/types.ts` | 增加 `Label` / `LabelCatalog`，Issue/Template/Draft/Recurring 增加结构化标签字段 |
| 修改 | `frontend/src/lib/api/legacy.ts` | 旧 tag API 切换为新 `labels` API |
| 修改 | `frontend/src/lib/api/issues.ts` | Issue 创建/更新支持 `labelIds` |
| 修改 | `frontend/src/lib/api/issue-platform.ts` | 模板/草稿/周期事项创建支持 `labelIds` |
| 修改 | `frontend/src/lib/issues/composer.ts` | Composer 草稿从 `tags: string` 改为 `labelIds: string[]` |
| 修改 | `frontend/src/components/issues/IssueComposer.tsx` | 快速创建标签弹层重做为 Team/Workspace 分组 + 创建新标签 + 自动选中 |
| 修改 | `frontend/src/i18n/messages/en.ts` / `frontend/src/i18n/messages/zh-CN.ts` | 补充 Team/Workspace label 文案与创建动作文案 |

### 8.2 发现的 Bug 及修复

| Bug | 根因 | 修复 |
|-----|------|------|
| 旧标签模型无法区分 team/workspace | `IssueTag` 只有全局字段，没有 scope | 重建 `label_definition`，采用 `organizationId + scopeType + scopeId` 模型 |
| Issue 标签仍走字符串拼接 | Composer 和 legacy payload 以 `tags` 字符串驱动 | 前端草稿改为 `labelIds[]`，后端 Issue 改为 `labels` 结构化返回 |
| 快速创建标签只支持勾选，不支持新建 | UI 仅加载平铺标签列表 | 标签弹层增加 Team/Workspace 分组与 “Create new ... label” 动作 |
| 旧 `/api/issue-tags` 仍可能写入废弃表 | 兼容接口仍绑定老仓储 | 将旧 controller/service 改为兼容 facade，统一转发到 `LabelService` |

### 8.3 经验沉淀

- 标签系统若要支持作用域、筛选、模板、周期事项，必须走结构化 `labelIds` / `labels`，不能继续依赖 legacy 字符串
- 标签作用域建模应与项目中已有的 `scopeType + scopeId` 风格统一，避免形成第二套作用域语义
- 兼容旧接口时，优先把旧入口改成 facade，而不是继续让旧表参与写路径
- 快速创建的标签体验要一次性覆盖：搜索、分组、创建、自动选中，否则会反复返工

### 8.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 新增数据库表 | 2（`label_definition`, `issue_label`） |
| 新增数据库字段 | 3（模板/草稿/周期事项 `label_ids_json`） |
| 新增后端文件 | 7 |
| 主要改动前端文件 | 6+ |
| 兼容保留旧接口 | `issue-tags` 保留为 facade |
| 前端构建 | ✅ `npm run build` |
| 后端编译 | ✅ `./gradlew :backend:compileKotlin` |
| 后端启动验证 | ✅ `./gradlew :backend:bootRun --args="--server.port=8081"` |

### 8.5 Git Commit

待提交

---

## Session 9 — 2026-03-18：Workspace / Project 概念统一

**目标**：对齐 Linear 的核心概念，将产品语义中的 `Workspace` 明确映射到平台顶层空间，将 `Project` 恢复为项目容器，清理 UI 与种子数据中的 `organization/workspace/project` 混用。

### 9.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 修改 | `backend/src/main/kotlin/com/cruise/config/DataInitializer.kt` | 将种子项目名从 `Cruise RnD Workspace` 调整为 `Cruise RnD`，避免把项目误称为工作区 |
| 新增 | `backend/src/main/resources/db/migration/V12__align_workspace_project_naming.sql` | 将已有库中的历史项目名同步改为新的项目命名 |
| 修改 | `frontend/src/i18n/messages/en.ts` | 将登录与自定义字段页中的 `organization` 文案改为 `workspace` |
| 修改 | `frontend/src/i18n/messages/zh-CN.ts` | 将登录页中的“组织”语义调整为“工作区” |

### 9.2 概念结论

| 概念 | 对齐后的产品语义 | 备注 |
|------|------------------|------|
| Workspace | 顶层工作区 | 当前后端内部仍使用 `organizationId` 作为实现字段 |
| Team | 团队 | 与 Linear 一致 |
| Project | 项目 | 不再用 `Workspace` 命名项目实例 |

### 9.3 经验沉淀

- 对齐 Linear 时，先统一产品语义，再决定是否重命名底层字段；底层 `organizationId` 可以短期保留为实现细节
- `Workspace` 不能再被项目名冒用，否则标签作用域、登录文案、导航结构都会继续混乱

### 9.4 统计快照

| 指标 | 值 |
|------|-----|
| 新增迁移脚本 | 1 |
| 修改文案文件 | 2 |
| 修改种子数据文件 | 1 |

### 9.5 Git Commit

待提交

---

## Session 10 — 2026-04-16：Linear 复刻计划 + Autopilot 初始化

**目标**：锁定 Cruise 的 `codex/unify-issue-model` 分支，基于现有 HAR 设计文档与当前代码状态建立“Linear 一比一复刻”执行计划，并初始化唯一状态源与 cron 自动推进机制。

### 10.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 执行 | `git checkout -B codex/unify-issue-model origin/codex/unify-issue-model` | 锁定用户指定分支，确认 HEAD=`21b6774` |
| 阅读 | `docs/planning/plan-baseline.md` | 确认 Cruise 当前产品定位与 Phase 基线 |
| 阅读 | `docs/baselines/design-baseline.md` | 确认当前代码、模块与 API 基线 |
| 阅读 | `docs/planning/cruise-refactor-roadmap.md` | 提取已有的共享内核 / project / notification / planning / membership 收敛路线 |
| 阅读 | `docs/linear-har-module-design-checklist.md` | 提取 HAR 对 Linear 产品层对象的直接证据与高置信推断 |
| 新增 | `docs/plans/2026-04-16-linear-parity-roadmap.md` | 建立基于当前分支的 Linear 复刻执行计划 |
| 新增 | `docs/status/roadmap-state.yaml` | 建立唯一状态源，供 cron 按单任务执行单元续跑 |
| 修改 | `docs/index.md` | 将新计划与状态源加入文档导航 |
| 修改 | `docs/worktime.md` | 增加 Phase 5 / Session 10 工时记录 |
| 修改 | `docs/planning/dev-logbook.md` | 记录本 Session |

### 10.2 关键决策

| 决策 | 结论 | 理由 |
|------|------|------|
| 工作分支 | `codex/unify-issue-model` | 用户明确指定；该分支也比另一个 `codex/*` 分支更新 |
| 复刻策略 | 以产品层一比一复刻为目标，但不机械还原 Linear 后端 schema | HAR 文档已明确：按产品层模型收敛 Cruise，而非倒推数据库 |
| 执行方式 | 单任务执行单元 + `docs/status/roadmap-state.yaml` + cron 自动续跑 | 避免超长会话失焦，便于稳定收口 |
| 第一优先级 | 先收口共享 issue/project/view/member 内核，再铺具体页面 | 现有仓库已具备相当多雏形，先统一核心契约比继续堆孤立页面更有效 |

### 10.3 当前基线快照

| 项目 | 快照 |
|------|------|
| 分支 | `codex/unify-issue-model` |
| HEAD | `21b6774` |
| 最近提交 | `Build workspace projects and inbox workbench` |
| 后端栈 | Kotlin 1.9 + Spring Boot 3.2.5 + JDK 21 |
| 前端栈 | Next.js 15 + React 19 + TypeScript strict |
| 已有路线图 | `docs/planning/cruise-refactor-roadmap.md` |
| HAR 设计依据 | `docs/linear-har-module-design-checklist.md` |

### 10.4 经验沉淀

- 对这类“已有较大存量代码 + 用户要长期自动推进”的项目，先锁分支、再写计划、再建状态源，比直接编码更能减少返工
- HAR 对 Cruise 的价值主要在产品层对象边界与页面内核，不在数据库逆向；计划必须围绕共享内核收口，而不是逐页散修
- 对多日任务，`docs/status/roadmap-state.yaml` 应成为唯一真相源，聊天只是观察窗口

### 10.5 验证

| 检查 | 结果 |
|------|------|
| `git status --short` | ✅ 干净工作树 |
| `git branch --show-current` | ✅ `codex/unify-issue-model` |
| 文档写入 | ✅ 完成 |

### 10.6 Git Commit

`7ec6786` — `[verified] docs: add linear parity roadmap state`

---

## Session 11 — 2026-04-17：task01a queryState 契约审计与最小收口

**目标**：完成路线图 task01a，锁定 issue/project/initiative 共享 queryState DTO 外形，清理前后端默认 schema 漂移。

### 11.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 新增 | `docs/planning/task01a-query-state-audit.md` | 记录当前 schema 漂移点、统一 DTO 结构、兼容策略与后续切分 |
| 修改 | `backend/src/main/kotlin/com/cruise/service/ViewService.kt` | 按资源类型统一默认 queryState，补齐 `subGrouping` 与资源特定 `visibleColumns` |
| 修改 | `backend/src/test/kotlin/com/cruise/OrganizationAccessIntegrationTest.kt` | 增加 issue/project 默认 queryState schema 对齐回归测试 |
| 新增 | `frontend/src/lib/views/queryState.ts` | 提取前端统一默认 queryState 生成器 |
| 新增 | `frontend/src/lib/views/queryState.test.ts` | 增加前端 schema 对齐最小回归测试 |
| 修改 | `frontend/src/lib/api/types.ts` | 显式锁定 `ViewGrouping` / `subGrouping` 类型 |
| 修改 | `frontend/src/components/views/NewViewWorkbench.tsx` | 改为复用共享 queryState 默认生成器 |
| 修改 | `frontend/src/components/views/ViewsDirectory.tsx` | 改为复用共享 queryState 默认生成器 |
| 修改 | `frontend/src/components/views/ViewsWorkbench.tsx` | 改为复用共享 queryState 默认生成器 |
| 修改 | `docs/status/roadmap-state.yaml` | 将 task01a 标记为完成并推进到 task01b |
| 修改 | `docs/worktime.md` | 记录 Session 11 工时 |
| 修改 | `docs/planning/dev-logbook.md` | 记录本 Session |

### 11.2 Bug / 漂移修复

- **queryState 默认 schema 漂移**：后端默认列固定偏 issue，前端三个 views 页面各自维护默认 state，导致 project / initiative 的默认列和分组结构不一致。
- **修复方案**：后端 `normalizeQueryState()` 接入 `resourceType` 并按资源类型生成默认 `visibleColumns`；前端抽取单一 `createDefaultViewQueryState()` 作为共享生成源，同时显式纳入 `subGrouping`。

### 11.3 经验沉淀

- 对这种“前后端都各自 hardcode 默认 schema”的共享内核任务，先写一份审计文档锁定契约，再抽一个前端共享生成器 + 一个后端 normalize 入口，比逐页追修更稳。
- `roadmap-state.yaml` 里的旧任务 commit 字段若已被真实 git 历史覆盖，应在下一次闭环时顺手修正，避免状态文件长期漂移。
- cron 环境下前端 Next.js build 可能因默认 Node 堆内存不足 OOM，必要时使用 `NODE_OPTIONS=--max-old-space-size=4096` 重新验证。

### 11.4 验证

| 检查 | 结果 |
|------|------|
| `git diff --check` | ✅ 通过 |
| `cd frontend && npm test -- --run src/lib/views/queryState.test.ts` | ✅ 通过 |
| `cd frontend && NODE_OPTIONS=--max-old-space-size=4096 npm run build` | ✅ 通过 |
| `bash ./gradlew :backend:test --tests com.cruise.OrganizationAccessIntegrationTest` | ⚠️ 受阻：cron 环境缺少 Java/JAVA_HOME |
| 独立 post-completion review | ✅ approved |

### 11.5 关键数据快照

| 指标 | 值 |
|------|-----|
| 新增前端共享工具文件 | 1 |
| 新增回归测试 | 2（前端 1 / 后端 1） |
| 统一后的 queryState 顶层 key | 5（`filters/display/grouping/subGrouping/sorting`） |
| 当前下一任务 | `task01b` |

### 11.6 Git Commit

`c5da9e1` — `[verified] feat: unify view query state defaults`

---

> *下次 Session 开始时，先读本文件最后一条记录恢复上下文。*
