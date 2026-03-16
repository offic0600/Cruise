# Cruise 统一工作项模型设计

> 版本：v1.1
> 日期：2026-03-13
> 目标：将 `Requirement`、`Task`、`Defect` 收敛为统一工作项 `Issue`，并让主路径彻底切换到 `Issue` 真源。

---

## 1. 目标

当前项目已经完成第一阶段迁移，`Issue` 已经成为执行层主对象。本阶段的目标不是继续保留兼容层，而是推进到下面这个状态：

1. 后端启动数据直接写入 `issue` 表，不再先写旧表再迁移。
2. 前端主页面直接使用 `/api/issues`，不再把 `/api/requirements`、`/api/tasks`、`/api/defects` 作为主数据源。
3. 仪表盘和分析能力围绕统一工作项聚合，不再跨旧表拼装。
4. 旧接口和旧 DTO 仅作为过渡兼容层，逐步退出主流程。

---

## 2. 统一模型

### 2.1 核心原则

1. 所有执行对象统一抽象为 `Issue`。
2. `FEATURE`、`TASK`、`BUG` 是 `Issue.type` 的不同取值，不再是不同事实表。
3. 页面是视图，不是模型。需求页、任务页、缺陷页都是 `Issue` 的不同投影。
4. 层级关系优先通过 `parentIssueId` 建模。

### 2.2 类型定义

- `FEATURE`：功能事项、需求事项、交付事项
- `TASK`：执行任务
- `BUG`：缺陷与修复事项
- `TECH_DEBT`：预留的技术债类型

### 2.3 统一状态

- `BACKLOG`
- `TODO`
- `IN_PROGRESS`
- `IN_REVIEW`
- `DONE`
- `CANCELED`

约定：

1. `FEATURE` 默认从 `BACKLOG` 开始。
2. `TASK`、`BUG` 默认从 `TODO` 开始。
3. 前端可以保留“需求视图 / 任务视图 / 缺陷视图”的语义，但状态底层统一到 `Issue.state`。

### 2.4 统一优先级

- `LOW`
- `MEDIUM`
- `HIGH`
- `URGENT`

补充：

1. 缺陷的 `severity` 保留为独立字段，不与 `priority` 混用。
2. 旧的 `CRITICAL` 统一映射为 `URGENT`。

---

## 3. 字段与映射

### 3.1 `Issue` 关键字段

| 字段 | 说明 |
| --- | --- |
| `identifier` | 显示编号，形如 `ISSUE-12` |
| `type` | 工作项类型 |
| `title` | 标题 |
| `description` | 描述 |
| `state` | 统一状态 |
| `priority` | 统一优先级 |
| `projectId` | 所属项目 |
| `teamId` | 所属团队 |
| `parentIssueId` | 父工作项 |
| `assigneeId` | 当前负责人 |
| `reporterId` | 提出人 |
| `progress` | 进度百分比 |
| `plannedStartDate` | 计划开始 |
| `plannedEndDate` | 计划结束 |
| `estimatedHours` | 预估工时 |
| `actualHours` | 实际工时 |
| `severity` | 缺陷严重级别 |
| `legacyPayload` | 临时承接未结构化字段 |

### 3.2 旧对象映射

- `Requirement -> Issue(type=FEATURE)`
- `Task -> Issue(type=TASK)`
- `Defect -> Issue(type=BUG)`

### 3.3 `legacyPayload` 使用范围

首版仍放在 `legacyPayload` 的字段：

- `FEATURE`：产品负责人、开发负责人、协作者、测试负责人、标签、预计天数、计划天数、偏差天数、偏差预算、实际天数、应用编码、供应商、供应商人员、创建人
- `TASK`：预计天数、计划天数、剩余天数

原则：

1. 不丢字段，但不再为这些旧字段维持独立事实表。
2. 先统一真源，再逐步把高价值字段结构化。

---

## 4. 已落地的迁移策略

### 4.1 后端

当前主路径已经调整为：

1. 新增与维护统一接口 `/api/issues`
2. `DataInitializer` 直接写入 `IssueRepository`
3. `DashboardService`、`AnalyticsService` 统一基于 `Issue` 聚合
4. 旧服务层仅作为兼容投影层存在

### 4.2 前端

当前主页面迁移规则：

1. `/requirements` 读取 `FEATURE`
2. `/tasks` 读取 `TASK`
3. `/defects` 读取 `BUG`
4. `/dashboard` 直接按 `Issue.type` 做统计

前端通过统一 `Issue` API + 按类型 helper 完成：

- `getFeatureIssues`
- `getTaskIssues`
- `getBugIssues`
- `createIssue / updateIssue / updateIssueState / deleteIssue`

---

## 5. 下一步清理方向

虽然主路径已经切到 `Issue`，但仓库里仍有兼容层和旧命名残留。后续建议按下面顺序继续收敛：

1. 删除前端对旧 `/requirements`、`/tasks`、`/defects` API 的剩余调用。
2. 将 `RequirementService`、`TaskService`、`DefectService` 缩减为只读兼容层或直接下线。
3. 清理旧实体与旧 repository 的非必要依赖。
4. 把 `legacyPayload` 中高价值字段逐步结构化。
5. 在统一模型基础上继续引入 `Iteration`、`Strategic Workstream`、`Doc`、`Activity/Event`。

---

## 6. 验收标准

迁移完成后，至少满足以下条件：

1. 应用启动后不再依赖旧表初始化主数据。
2. 需求、任务、缺陷三个页面都直接基于 `Issue` 读取和写入。
3. Dashboard 与 Analytics 不再直接查询旧实体表。
4. 新增、编辑、删除、状态切换都只写 `issue` 真源。
5. 旧接口即使保留，也不再是主路径依赖。
