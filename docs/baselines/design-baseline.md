# Cruise — 设计基线

> **定位**：实现驱动，记录"我们造了什么"。每个 Phase 结束后对照实际代码更新。
> **交叉校验**：Phase 结束时先更新本文件，再与规划基线（plan-baseline.md）交叉校验。
> **当前版本**：v2.1（Phase 4 实现完成）

---

## 一、项目结构（当前）

```
Cruise/
├── CLAUDE.md                          # 项目级 AI 配置
├── README.md
├── LICENSE
├── backend/                           # Spring Boot 后端
│   ├── build.gradle.kts               # Gradle 构建配置
│   └── src/main/
│       ├── kotlin/com/cruise/
│       │   ├── CruiseApplication.kt   # 启动类
│       │   ├── controller/            # 控制器 (12个)
│       │   │   ├── AuthController.kt
│       │   │   ├── RequirementController.kt
│       │   │   ├── TaskController.kt
│       │   │   ├── TeamMemberController.kt
│       │   │   ├── DashboardController.kt
│       │   │   ├── DefectController.kt
│       │   │   ├── HealthController.kt
│       │   │   ├── SimpleAuthController.kt
│       │   │   ├── AlmRequirementController.kt
│       │   │   └── RequirementTagController.kt
│       │   ├── service/               # 业务服务 (8个)
│       │   │   ├── RequirementService.kt
│       │   │   ├── TaskService.kt
│       │   │   ├── TeamMemberService.kt
│       │   │   ├── DashboardService.kt
│       │   │   └── DefectService.kt
│       │   ├── entity/                # 实体类 (7个)
│       │   │   ├── User.kt
│       │   │   ├── Project.kt
│       │   │   ├── Requirement.kt
│       │   │   ├── Task.kt
│       │   │   ├── TeamMember.kt
│       │   │   ├── Defect.kt
│       │   │   └── RequirementTag.kt
│       │   ├── repository/            # 数据仓库 (7个)
│       │   ├── security/              # 安全认证 (3个)
│       │   ├── skill/                # Skill实现 (9个)
│       │   │   ├── JwtTokenProvider.kt
│       │   │   ├── JwtAuthenticationFilter.kt
│       │   │   └── CustomUserDetailsService.kt
│       │   └── config/                 # 配置 (2个)
│       │       ├── SecurityConfig.kt
│       │       └── DataInitializer.kt
│       └── resources/
│           ├── application.yml         # 应用配置
│           └── db/migration/
│               └── V1__init_schema.sql # 数据库初始化
├── frontend/                          # Next.js 前端
│   ├── package.json
│   ├── next.config.js
│   └── src/app/
├── docs/
│   ├── index.md
│   ├── planning/
│   │   ├── dev-logbook.md
│   │   └── plan-baseline.md
│   ├── baselines/
│   │   └── design-baseline.md
│   └── acceptance-tests/
│       ├── phase0.md
│       └── phase1.md
└── references/
```

**代码文件**：约 36 个 Kotlin 文件 + 前端文件

---

## 二、技术栈（已确定）

| 层 | 技术 | 版本 |
|----|------|------|
| 后端语言 | Kotlin | 1.9+ |
| 后端框架 | Spring Boot | 3.2.5 |
| 运行时 | JDK | 23 (兼容 21) |
| 前端框架 | React + Next.js | 15，App Router |
| 前端语言 | TypeScript | strict |
| 数据库 | H2 | 2.2 (embedded) |
| 后端构建 | Gradle Kotlin DSL | 8.x |
| 前端包管理 | npm | — |

---

## 三、API 端点（当前）

| 端点 | 方法 | 描述 | 状态 |
|------|------|------|------|
| **认证模块** | | | |
| /api/auth/register | POST | 用户注册 | ✅ 已实现 |
| /api/auth/login | POST | 用户登录 | ✅ 已实现 |
| **需求管理** | | | |
| /api/requirements | GET | 查询需求列表 | ✅ 已实现 |
| /api/requirements/{id} | GET | 获取需求详情 | ✅ 已实现 |
| /api/requirements | POST | 创建需求 | ✅ 已实现 |
| /api/requirements/{id} | PUT | 更新需求 | ✅ 已实现 |
| /api/requirements/{id}/status | PATCH | 状态流转 | ✅ 已实现 |
| /api/requirements/{id} | DELETE | 删除需求 | ✅ 已实现 |
| **任务管理** | | | |
| /api/tasks | GET | 查询任务列表 | ✅ 已实现 |
| /api/tasks/{id} | GET | 获取任务详情 | ✅ 已实现 |
| /api/tasks | POST | 创建任务 | ✅ 已实现 |
| /api/tasks/{id} | PUT | 更新任务 | ✅ 已实现 |
| /api/tasks/{id}/log-hours | PATCH | 记录工时 | ✅ 已实现 |
| /api/tasks/{id} | DELETE | 删除任务 | ✅ 已实现 |
| **人员管理** | | | |
| /api/team-members | GET | 查询成员列表 | ✅ 已实现 |
| /api/team-members/{id} | GET | 获取成员详情 | ✅ 已实现 |
| /api/team-members | POST | 创建成员 | ✅ 已实现 |
| /api/team-members/{id} | PUT | 更新成员 | ✅ 已实现 |
| /api/team-members/{id} | DELETE | 删除成员 | ✅ 已实现 |
| **看板** | | | |
| /api/dashboard/project/{id} | GET | 项目概览 | ✅ 已实现 |
| /api/dashboard/team/{id}/load | GET | 团队负载 | ✅ 已实现 |
| **缺陷追踪** | | | |
| /api/defects | GET | 查询缺陷列表 | ✅ 已实现 |
| /api/defects/{id} | GET | 获取缺陷详情 | ✅ 已实现 |
| /api/defects | POST | 创建缺陷 | ✅ 已实现 |
| /api/defects/{id} | PUT | 更新缺陷 | ✅ 已实现 |
| /api/defects/{id}/status | PATCH | 状态流转 | ✅ 已实现 |
| /api/defects/{id} | DELETE | 删除缺陷 | ✅ 已实现 |
| **数据分析** | | | |
| /api/analytics/project/{id}/efficiency | GET | 项目效率仪表盘 | ✅ 已实现 |
| /api/analytics/team/{id}/ranking | GET | 团队效率排名 | ✅ 已实现 |
| /api/analytics/member/{id}/workload | GET | 个人工作负载 | ✅ 已实现 |
| /api/analytics/project/{id}/throughput | GET | 需求吞吐量 | ✅ 已实现 |
| /api/analytics/project/{id}/forecast/requirements | GET | 需求趋势预测 | ✅ 已实现 |
| /api/analytics/project/{id}/trend/hours | GET | 工时趋势分析 | ✅ 已实现 |
| /api/analytics/team/{id}/velocity | GET | 团队速率 | ✅ 已实现 |
| /api/analytics/project/{id}/risk | GET | 项目风险评估 | ✅ 已实现 |
| /api/analytics/project/{id}/risk/delay | GET | 延期风险预警 | ✅ 已实现 |
| /api/analytics/team/{id}/bottleneck | GET | 资源瓶颈检测 | ✅ 已实现 |
| **系统集成** | | | |
| /api/alm/sync/requirements | POST | ALM同步需求 | ✅ 已实现 |
| /api/alm/push/requirement/{id} | POST | ALM推送需求 | ✅ 已实现 |
| /api/alm/sync/status | GET | ALM同步状态 | ✅ 已实现 |
| /api/gitlab/projects/{id}/commits | GET | GitLab提交记录 | ✅ 已实现 |
| /api/gitlab/requirement/{id}/link | POST | 关联代码提交 | ✅ 已实现 |
| /api/gitlab/projects/{id}/stats | GET | GitLab代码统计 | ✅ 已实现 |
| /api/workhours/sync | POST | 工时同步 | ✅ 已实现 |
| /api/workhours/summary | GET | 工时汇总 | ✅ 已实现 |
| /api/integration/project/{id}/overview | GET | 项目全景视图 | ✅ 已实现 |
| /api/integration/team/{id}/dashboard | GET | 团队综合视图 | ✅ 已实现 |
| **SuperAgent + Skill** | | | |
| /api/agent/session | POST | 创建会话 | ✅ 已实现 |
| /api/agent/query | POST | Agent查询入口 | ✅ 已实现 |
| /api/agent/session/{id}/end | POST | 结束会话 | ✅ 已实现 |
| /api/agent/session/{id} | GET | 获取会话 | ✅ 已实现 |
| /api/agent/session/{id}/history | GET | 获取会话历史 | ✅ 已实现 |
| /api/agent/feedback | POST | 提交反馈 | ✅ 已实现 |
| /api/agent/optimization | GET | 获取优化建议 | ✅ 已实现 |
| /api/skills | GET | 获取Skill列表 | ✅ 已实现 |
| /api/skills/{name} | GET | 获取Skill详情 | ✅ 已实现 |
| /api/skills/category/{category} | GET | 按分类获取Skill | ✅ 已实现 |
| /api/skills/names | GET | 获取Skill名称列表 | ✅ 已实现 |
| /api/skills/analytics/{name} | GET | 获取Skill分析数据 | ✅ 已实现 |
| **系统** | | | |
| /actuator/health | GET | 健康检查 | ✅ 已实现 |
| /h2-console | GET | H2 控制台 | ✅ 已实现（开发用） |

---

## 四、数据模型（当前）

> Phase 1 完成，7 张表已定义。

### 核心实体

| 表名 | 用途 | 字段数 | 状态 |
|------|------|--------|------|
| project | 项目 | 7 | ✅ |
| user | 用户 | 6 | ✅ |
| requirement | 需求 | 25 | ✅ |
| task | 任务 | 20 | ✅ |
| team_member | 团队成员 | 8 | ✅ |
| defect | 缺陷 | 10 | ✅ |
| requirement_tag | 需求标签 | 5 | ✅ |
| agent_session | Agent会话 | 13 | ✅ |
| skill_definition | Skill定义 | 17 | ✅ |
| skill_execution_log | Skill执行日志 | 14 | ✅ |
| user_feedback | 用户反馈 | 10 | ✅ |

### DDL（H2 兼容）

```sql
-- 见 backend/src/main/resources/db/migration/V1__init_schema.sql
-- 使用 AUTO_INCREMENT 替代 BIGSERIAL
-- 使用 MODE=PostgreSQL 兼容语法
```

---

## 五、模块结构（当前）

```
backend/           # Spring Boot 后端
  └── src/main/kotlin/com/cruise/
      ├── CruiseApplication.kt      # 启动类
      ├── controller/               # 10 个控制器
      │   ├── AuthController.kt     # 认证
      │   ├── RequirementController.kt  # 需求
      │   ├── TaskController.kt     # 任务
      │   ├── TeamMemberController.kt # 人员
      │   ├── DashboardController.kt # 看板
      │   ├── DefectController.kt   # 缺陷
      │   └── ...
      ├── service/                  # 8 个服务
      ├── entity/                   # 7 个实体
      ├── repository/               # 7 个仓库
      ├── security/                # 3 个安全组件
      └── config/                   # 2 个配置

frontend/          # Next.js 前端
  └── src/app/
      ├── layout.tsx
      └── page.tsx
```

---

## 六、测试覆盖

| 类型 | 数量 | 通过率 |
|------|------|--------|
| 单元测试 | 0 | — |
| E2E 验收测试 | 16 | 16/16 (100%) |

---

## 七、已知 Bug

> 暂无。

---

## 八、关键数字快照

| 指标 | 值 | 更新时间 |
|------|-----|---------|
| 文件总数 | ~65 | 2026-03-10 |
| 代码行数 | ~3000 | 2026-03-10 |
| API 端点数 | 50+ | 2026-03-10 |
| 数据库表数 | 11 | 2026-03-10 |
| Skill 数量 | 9 | 2026-03-10 |
| 单元测试数 | 0 | 2026-03-10 |
| E2E 验收测试 | 16 | 2026-03-09 |

---

## 九、Phase 1 交付物

### 已实现功能
- 用户认证（注册/登录/JWT）
- 需求管理（CRUD + 状态流转）
- 任务管理（CRUD + 工时记录 + 分配）
- 团队成员管理（CRUD）
- 看板（项目概览 + 团队负载）
- 缺陷追踪（CRUD + 状态流转）

### 初始化数据
- 1 个项目（智能开发管理平台）
- 1 个管理员用户（admin/admin123）
- 6 个团队成员（张三、李四、王五、赵六、钱七、孙八）
- 5 个需求
- 7 个任务
- 6 个缺陷

---

## Phase 4 设计：SuperAgent + Skill 体系 + 持续进化环

### 4.1 架构概述

Phase 4 将引入智能 Agent 能力，核心设计遵循以下原则：

1. **SuperAgent 优于多 Agent**：单一智能体，通过 Skill 动态切换角色
2. **Skill 优于 Prompt**：专业知识编码为可复用、可组合的 Skill
3. **持续进化**：收集反馈、分析性能、自动优化

### 4.2 SuperAgent 架构

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (前端)                        │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    SuperAgent (统一入口)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ IntentParser │─▶│ SkillRouter │─▶│ SkillExecutor      │ │
│  │ (意图解析)   │  │ (Skill选择)  │  │ (Skill执行)        │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│         │                │                    │             │
│         ▼                ▼                    ▼             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              ContextManager (会话管理)                  ││
│  │         支持多轮对话、上下文继承、session 隔离            ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Skill Registry (Skill 注册表)            │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐ │
│  │Requirement │ │ Task       │ │ Risk       │ │ Progress │ │
│  │Analysis    │ │Assignment  │ │Alert       │ │Assessment│ │
│  └────────────┘ └────────────┘ └────────────┘ └──────────┘ │
│  ┌────────────┐ ┌────────────┐ ┌────────────────────────┐ │
│  │ Team       │ │ Data       │ │ Evolution              │ │
│  │Optimization│ │ Aggregation│ │ (持续进化)             │ │
│  └────────────┘ └────────────┘ └────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 角色体系

| 角色 | 视角 | 核心能力 | 关注指标 |
|------|------|---------|---------|
| **IT_LEAD** | 全局决策 | 战略分析、资源调配、风险预警 | 项目数量、总体进度、预算使用、风险概览 |
| **PM** | 项目管理 | 进度跟踪、任务分配、干系人沟通 | 任务完成率、工时统计、延期风险 |
| **DEVELOPER** | 任务执行 | 个人任务、代码协作、技术难题 | 待办任务、阻塞问题、工时记录 |
| **TESTER** | 质量保障 | 测试进度、缺陷管理、质量评估 | 测试覆盖率、缺陷趋势、通过率 |
| **STAKEHOLDER** | 业务价值 | 需求价值、业务目标、ROI | 需求完成度、交付价值、满意度 |

### 4.4 Skill 定义

| Skill 名称 | 功能 | 输入 | 输出 |
|-----------|------|------|------|
| **RequirementAnalysis** | 需求分析 | 需求描述 | 复杂度评估、人天估算、优先级建议 |
| **TaskAssignment** | 任务分配 | 任务列表、团队成员 | 最优分配方案、理由说明 |
| **RiskAlert** | 风险预警 | 项目/团队ID | 风险列表、影响程度、建议措施 |
| **ProgressAssessment** | 进度评估 | 项目/需求ID | 当前进度、预测完成时间、偏差分析 |
| **TeamOptimization** | 团队优化 | 团队ID | 负载分析、瓶颈识别、优化建议 |
| **DataAggregation** | 数据聚合 | 查询条件 | 多数据源聚合结果 |
| **Evolution** | 持续进化 | 反馈数据 | 优化建议、性能报告 |

### 4.5 API 设计

| 模块 | 端点 | 方法 | 说明 |
|------|------|------|------|
| **Agent** | `/api/agent/query` | POST | SuperAgent 统一入口 |
| | `/api/agent/feedback` | POST | 用户反馈 |
| | `/api/agent/optimization` | GET | 优化建议 |
| **Skill** | `/api/skills` | GET | Skill 列表 |
| | `/api/skills/{name}` | GET | Skill 详情 |
| | `/api/skills/execute` | POST | 直接执行 Skill |
| | `/api/skills/analytics/{name}` | GET | Skill 性能分析 |

### 4.6 数据模型

```kotlin
// Agent Session - 会话管理
@Entity
class AgentSession {
    @Id val id: String           // sessionId
    val userId: Long              // 用户ID
    val role: String              // 当前角色
    val createdAt: LocalDateTime
    val lastActiveAt: LocalDateTime
    val context: String          // JSON 存储上下文
}

// Skill Definition - Skill 注册
@Entity
class SkillDefinition {
    @Id val name: String
    val description: String
    val parametersSchema: String  // JSON Schema
    val outputSchema: String
    val category: String
    val version: String
    val enabled: Boolean
}

// Skill Execution Log - 执行日志
@Entity
class SkillExecutionLog {
    @Id @GeneratedValue val id: Long
    val sessionId: String
    val skillName: String
    val inputParams: String       // JSON
    val outputResult: String      // JSON
    val executionTime: Long        // ms
    val rating: Int?              // 用户评分 1-5
    val feedback: String?
    val createdAt: LocalDateTime
}

// User Feedback - 用户反馈
@Entity
class UserFeedback {
    @Id @GeneratedValue val id: Long
    val queryId: String
    val userId: Long
    val rating: Int               // 1-5
    val comment: String?
    val suggestion: String?
    val createdAt: LocalDateTime
}
```

### 4.7 持续进化环

```
┌──────────────────────────────────────────────────────────────┐
│                       持续进化环                               │
│                                                              │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌───────┐ │
│   │ 用户反馈  │───▶│ 数据分析 │───▶│ 优化生成 │───▶│人工审核│ │
│   │ 收集     │    │ 性能分析 │    │ 建议     │    │       │ │
│   └──────────┘    └──────────┘    └──────────┘    └───┬───┘ │
│        │                                           │       │
│        │          ┌──────────┐                      │       │
│        └────────▶│ Skill    │◀─────────────────────┘       │
│                 │ 迭代优化  │                                │
│                 └──────────┘                                │
└──────────────────────────────────────────────────────────────┘
```

**进化机制**：
1. 每次 Skill 执行后收集用户评分和反馈
2. 定期分析 Skill 性能（响应时间、准确率、评分）
3. 生成优化建议（参数调整、提示词优化、新 Skill 建议）
4. 经人工审核后应用到系统

### 4.8 安全设计

- 所有 Agent API 需认证
- Skill 执行可设置超时（默认 5 秒）
- 敏感操作（删除、修改）需二次确认
- Skill 权限控制（部分 Skill 仅限特定角色）

---

## 变更历史

| 版本 | 日期 | Phase | 变更摘要 |
|------|------|-------|---------|
| v0.1 | 2026-03-06 | Phase 0 起点 | 初始化，尚无代码实现 |
| v1.0 | 2026-03-07 | Phase 0 完成 | 骨架搭建 + 5张核心表 + H2数据库 |
| v1.1 | 2026-03-07 | Phase 0 验收 | 10/12 测试通过 + 基线交叉校验 |
| v1.2 | 2026-03-09 | Phase 1 验收 | 16/16 测试通过 + 认证/需求/任务/人员/看板/缺陷 |
| v1.3 | 2026-03-09 | Phase 2 验收 | 10/10 测试通过 + 数据分析/效率度量/趋势预测/风险预警 |
| v1.4 | 2026-03-09 | Phase 3 验收 | 10/10 测试通过 + ALM/GitLab/工时系统集成 + 数据聚合视图 |
| v2.0 | 2026-03-10 | Phase 4 设计 | SuperAgent + Skill 体系 + 持续进化环 |
| **v2.1** | **2026-03-10** | **Phase 4 实现** | **9个Skill实现 + Agent API + 持续进化环** |

---

*版本：v2.1*
*创建：2026-03-06*
*更新：2026-03-10*
*下次更新时机：Phase 4 验收完成后*
