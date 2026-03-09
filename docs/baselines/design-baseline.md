# Cruise — 设计基线

> **定位**：实现驱动，记录"我们造了什么"。每个 Phase 结束后对照实际代码更新。
> **交叉校验**：Phase 结束时先更新本文件，再与规划基线（plan-baseline.md）交叉校验。
> **当前版本**：v1.4（Phase 3 验收完成）

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
│       │   ├── controller/            # 控制器 (10个)
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
│       │   ├── service/               # 业务服务 (5个)
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
      ├── service/                  # 5 个服务
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
| 文件总数 | ~50 | 2026-03-09 |
| 代码行数 | ~2000 | 2026-03-09 |
| API 端点数 | 30+ | 2026-03-09 |
| 数据库表数 | 7 | 2026-03-09 |
| 单元测试数 | 0 | 2026-03-09 |
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

## 变更历史

| 版本 | 日期 | Phase | 变更摘要 |
|------|------|-------|---------|
| v0.1 | 2026-03-06 | Phase 0 起点 | 初始化，尚无代码实现 |
| v1.0 | 2026-03-07 | Phase 0 完成 | 骨架搭建 + 5张核心表 + H2数据库 |
| v1.1 | 2026-03-07 | Phase 0 验收 | 10/12 测试通过 + 基线交叉校验 |
| v1.2 | 2026-03-09 | Phase 1 验收 | 16/16 测试通过 + 认证/需求/任务/人员/看板/缺陷 |
| v1.3 | 2026-03-09 | Phase 2 验收 | 10/10 测试通过 + 数据分析/效率度量/趋势预测/风险预警 |
| v1.4 | 2026-03-09 | Phase 3 验收 | 10/10 测试通过 + ALM/GitLab/工时系统集成 + 数据聚合视图 |

---

*版本：v1.4*
*创建：2026-03-06*
*更新：2026-03-09*
*下次更新时机：Phase 4 完成后*
