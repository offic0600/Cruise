# Cruise — 规划基线

> **定位**：设计驱动，记录"我们要造什么"。由开发者与 AI 共同讨论后更新。
> **交叉校验**：每个 Phase 结束时与设计基线（design-baseline.md）交叉校验。
> **当前版本**：v0.3（Phase 1 验收完成）

---

## 一、项目定位

**Cruise** 是面向软件开发过程的智能管理平台。

- **愿景**：重构开发过程管理流程——不是给每个人配一个 AI 助手，而是用 SuperAgent + Skill 体系，实现开发过程全角色全节点 AI 化。
- **目标用户**：IT 高管、项目经理、开发人员、测试人员、业务方

### 核心模块

| 模块 | 核心职责 |
|------|---------|
| 需求管理 | 需求录入、状态流转、优先级、与 ALM 系统对接 |
| 开发任务管理 | 任务拆解、分配、进度跟踪、工时记录 |
| 开发人员管理 | 人员档案、负载可视化、技能画像、团队结构 |
| 质量管理 | 缺陷追踪、测试进度、质量度量指标 |
| 跨数据源整合 | ALM 系统、GitLab、工时系统等外部数据聚合 |
| 开发看板 | 多角色视图：IT 高管 / PM / 开发 / 业务方 |
| 持续进化 | 流程优化建议、方法沉淀、AI Skill 体系演进 |

---

## 二、架构原则

1. **SuperAgent 优于多 Agent**：一个智能体通过 Skill 动态切换角色
2. **Skill 优于 Prompt**：专业知识编码为可复用、可组合的 Skill
3. **适配器隔离外部依赖**：ALM/GitLab 等通过 Adapter 层接入
4. **每阶段可验证**：每个 Phase 结束有可运行系统和可度量指标
5. **双环驱动**：交付环 + 进化环
6. **场景先行**：每个 Phase 编码前先写验收场景

---

## 三、技术栈

| 层 | 技术 | 版本 | 决策日期 |
|----|------|------|---------|
| 后端语言 | Kotlin | 1.9+ | 2026-03-06 |
| 后端框架 | Spring Boot | 3.x | 2026-03-06 |
| 运行时 | JDK | 21 | 2026-03-06 |
| 前端框架 | React + Next.js | 15，App Router | 2026-03-06 |
| 前端语言 | TypeScript | strict | 2026-03-06 |
| 数据库 | H2 | 2.2 (embedded) | 2026-03-07 |
| 后端构建 | Gradle Kotlin DSL | 8.x | 2026-03-06 |
| 前端包管理 | npm | — | 2026-03-06 |
| 部署（初期） | 本地裸跑 | — | 2026-03-06 |
| 部署（后期） | Docker Compose | — | 待确定 |

---

## 四、Phase 路线图

| Phase | 目标 | 状态 | 验收通过率 |
|-------|------|------|-----------|
| **Phase 0** | 技术选型 + 项目骨架 + 核心数据模型 | ✅ 完成 | 10/12 |
| **Phase 1** | 基础能力：认证 + 需求/任务/人员管理 + 看板 | ✅ 完成 | 16/16 |
| **Phase 2** | 数据分析：效率度量 + 趋势预测 + 风险预警 | ⏳ 规划中 | — |
| **Phase 3** | 系统集成：ALM + GitLab + 工时系统对接 | ⏳ 规划中 | — |
| **Phase 4** | 智能化：SuperAgent + Skill 体系 + 持续进化环 | ⏳ 规划中 | — |

---

## 五、Phase 0 详细规划

### 目标
1. ✅ 技术选型确定
2. ✅ 项目骨架搭建（Gradle + Next.js 前端）
3. ✅ 核心数据模型设计（ERD + 实体定义）
4. ✅ 数据库连接验证（H2 嵌入式数据库）
5. ✅ 基础 API 框架（Spring Boot 启动，/health 可访问）
6. ✅ 前端框架（Next.js 构建成功）

### 验收标准
见 `docs/acceptance-tests/phase0.md`

### 预期产出
- 可运行的后端（`./gradlew bootRun`）
- 可运行的前端（`npm run dev`）
- 核心数据模型 ERD 文档
- 数据库 migration 脚本（初始建表）

---

## 六、Phase 1 详细规划（已完成）

### 目标
✅ 已完成：可用的基础管理功能。

### 核心模块（已实现）
- **认证**：用户注册/登录（JWT Token）
- **需求管理**：CRUD + 状态流转（NEW → IN_PROGRESS → COMPLETED）
- **任务管理**：CRUD + 与需求关联 + 分配给人员 + 工时记录
- **人员管理**：CRUD + 团队结构
- **开发看板**：项目概览 + 团队负载视图
- **缺陷追踪**：CRUD + 状态流转

### 验收结果
- 测试用例：16 个
- 通过率：100% (16/16)
- 文档：`docs/acceptance-tests/phase1.md`

---

## 八、核心数据模型（初步，Phase 0 细化）

```
Project（项目）
  ├── Requirement（需求）
  │     └── Task（任务）
  ├── TeamMember（团队成员）
  ├── Defect（缺陷）
  └── Sprint（迭代）
```

| 实体 | 关键字段 | 状态 |
|------|---------|------|
| Project | id, name, status, startDate, endDate | ⏳ 待 Phase 0 细化 |
| Requirement | id, projectId, title, status, priority | ⏳ 待 Phase 0 细化 |
| Task | id, requirementId, assigneeId, status, estimatedHours | ⏳ 待 Phase 0 细化 |
| TeamMember | id, name, role, skills, teamId | ⏳ 待 Phase 0 细化 |
| Defect | id, projectId, taskId, severity, status | ⏳ 待 Phase 0 细化 |

---

## 九、KPI 目标

| 指标 | 目标值 | 来源 |
|------|--------|------|
| E2E 验收通过率 | ≥ 90% | Forge 实证 |
| Bug 修复率 | ≥ 95% | Forge 实证 |
| 安全漏洞逃逸 | 0 | 硬性要求 |

---

*版本：v0.3*
*创建：2026-03-06*
*更新：2026-03-09*
*下次更新时机：Phase 2 结束后，与设计基线交叉校验*
