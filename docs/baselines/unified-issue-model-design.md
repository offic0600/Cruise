# Cruise 统一工作项模型设计

> 版本：v1.0  
> 日期：2026-03-11  
> 目标：将当前 `Requirement`、`Task`、`Defect` 三套执行对象收敛为统一工作项 `Issue`，形成后续实现与演进的设计基线。

---

## 1. 设计目标

当前系统把研发执行对象拆成了三类：

- `Requirement`：承载需求和交付项
- `Task`：承载开发任务
- `Defect`：承载质量缺陷

这套模型在原型阶段易于理解，但随着系统能力增加，会出现以下问题：

1. 评论、附件、状态流转、指派、搜索、审计等能力需要重复建设。
2. 同一件事情会在需求、任务、缺陷之间拆分和跳转，追踪链路变长。
3. 仪表盘、搜索、AI 分析、集成同步需要跨多表聚合，复杂度持续上升。
4. 后续扩展 `Cycle`、`Docs`、`GitLab` 关联、Agent 执行时，集成边界不稳定。

因此需要引入统一工作项模型，将执行层主对象统一为 `Issue`。

本次设计目标：

1. 建立统一真源 `Issue`。
2. 保持现有页面和旧接口在迁移期继续可用。
3. 把原有需求、任务、缺陷数据迁移到统一模型。
4. 为后续层级管理、周期规划、文档关联、Agent 审计留出稳定边界。

本次设计不包含：

1. `Cycle`、`Initiative`、`Docs` 的完整实现。
2. 实时协作、事件总线、搜索引擎、分析数仓重构。
3. 团队与权限模型的大规模重构。

---

## 2. 统一模型概述

### 2.1 核心原则

1. 所有执行对象都抽象为 `Issue`。
2. 对象差异通过 `type`、`state`、`priority`、可选字段和视图投影表达。
3. 页面和接口可以按类型展示，但底层只保留一个事实源。
4. 层级关系优先通过 `parentIssueId` 建模，首版不引入复杂关系图。

### 2.2 `Issue` 类型

首版统一定义以下类型：

- `FEATURE`：原需求项、功能交付项
- `TASK`：原开发任务、执行项
- `BUG`：原缺陷、问题修复项
- `TECH_DEBT`：预留技术债类型，首版可不在 UI 暴露

### 2.3 统一状态

统一状态定义为：

- `BACKLOG`
- `TODO`
- `IN_PROGRESS`
- `IN_REVIEW`
- `DONE`
- `CANCELED`

说明：

1. `FEATURE` 默认从 `BACKLOG` 开始。
2. `TASK`、`BUG` 默认从 `TODO` 开始。
3. 旧对象状态在迁移期通过映射规则转换，不保留多套底层状态字段。

### 2.4 统一优先级

统一优先级定义为：

- `LOW`
- `MEDIUM`
- `HIGH`
- `URGENT`

说明：

1. 原 `CRITICAL` 统一映射到 `URGENT`。
2. `BUG` 的严重级别 `severity` 与 `priority` 不等价，严重级别继续单独保留。

---

## 3. 领域模型设计

### 3.1 `Issue` 字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `Long` | 是 | 主键 |
| `identifier` | `String` | 是 | 显示编号，形如 `ISSUE-123` |
| `type` | `String` | 是 | 工作项类型 |
| `title` | `String` | 是 | 标题 |
| `description` | `String?` | 否 | 描述 |
| `state` | `String` | 是 | 统一状态 |
| `priority` | `String` | 是 | 统一优先级 |
| `projectId` | `Long` | 是 | 所属项目 |
| `teamId` | `Long?` | 否 | 所属团队 |
| `parentIssueId` | `Long?` | 否 | 父工作项 |
| `assigneeId` | `Long?` | 否 | 当前负责人 |
| `reporterId` | `Long?` | 否 | 提出人/上报人 |
| `estimatePoints` | `Int?` | 否 | 估点，首版预留 |
| `progress` | `Int` | 是 | 百分比进度，迁移期保留 |
| `plannedStartDate` | `LocalDate?` | 否 | 计划开始时间 |
| `plannedEndDate` | `LocalDate?` | 否 | 计划结束时间 |
| `estimatedHours` | `Float` | 是 | 预估工时 |
| `actualHours` | `Float` | 是 | 实际工时 |
| `severity` | `String?` | 否 | 仅 `BUG` 使用 |
| `sourceType` | `String` | 是 | 数据来源类型 |
| `sourceId` | `Long?` | 否 | 旧对象 ID |
| `legacyPayload` | `String?` | 否 | 暂存原对象未归一化字段 |
| `createdAt` | `LocalDateTime` | 是 | 创建时间 |
| `updatedAt` | `LocalDateTime` | 是 | 更新时间 |

### 3.2 辅助映射表

为保证迁移过程可追溯并支持旧接口兼容，需要新增 `legacy_issue_mapping`：

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `Long` | 主键 |
| `sourceType` | `String` | `REQUIREMENT` / `TASK` / `DEFECT` |
| `sourceId` | `Long` | 原对象 ID |
| `issueId` | `Long` | 新 `Issue` ID |

用途：

1. 启动迁移时记录旧 ID 到新 ID 的稳定映射。
2. 兼容旧接口时，避免通过模糊条件反查。
3. 后续清理旧表前，提供审计和追踪依据。

### 3.3 层级关系

首版层级规则：

1. `FEATURE` 可作为父项。
2. `TASK` 可挂在 `FEATURE` 下。
3. `BUG` 可挂在 `TASK` 或 `FEATURE` 下。
4. 首版只支持两层主要层级，不支持无限嵌套。

---

## 4. 旧模型迁移规则

### 4.1 对象映射

| 原对象 | 新对象 |
|------|------|
| `Requirement` | `Issue(type=FEATURE)` |
| `Task` | `Issue(type=TASK)` |
| `Defect` | `Issue(type=BUG)` |

### 4.2 状态映射

#### `Requirement.status` -> `Issue.state`

| 旧状态 | 新状态 |
|------|------|
| `NEW` | `BACKLOG` |
| `IN_PROGRESS` | `IN_PROGRESS` |
| `TESTING` | `IN_REVIEW` |
| `COMPLETED` | `DONE` |
| `CANCELLED` | `CANCELED` |

#### `Task.status` -> `Issue.state`

| 旧状态 | 新状态 |
|------|------|
| `PENDING` | `TODO` |
| `IN_PROGRESS` | `IN_PROGRESS` |
| `COMPLETED` | `DONE` |
| `CANCELLED` | `CANCELED` |

#### `Defect.status` -> `Issue.state`

| 旧状态 | 新状态 |
|------|------|
| `OPEN` | `TODO` |
| `REOPENED` | `TODO` |
| `IN_PROGRESS` | `IN_PROGRESS` |
| `RESOLVED` | `IN_REVIEW` |
| `CLOSED` | `DONE` |

### 4.3 优先级和严重级别映射

| 原字段 | 目标字段 | 规则 |
|------|------|------|
| `Requirement.priority` | `Issue.priority` | 原样保留，`CRITICAL -> URGENT` |
| `Defect.severity` | `Issue.severity` | 原样保留 |
| `Defect.severity` | `Issue.priority` | `CRITICAL->URGENT`，`HIGH->HIGH`，`MEDIUM->MEDIUM`，`LOW->LOW` |

### 4.4 父子关系映射

1. `Task.requirementId` 映射为 `TaskIssue.parentIssueId = RequirementIssue.id`
2. `Defect.taskId` 若存在，则映射为 `DefectIssue.parentIssueId = TaskIssue.id`
3. 若某条缺陷没有关联任务，则 `parentIssueId` 为空

### 4.5 未归一化字段处理

以下旧字段暂不在首版 `Issue` 中拆成结构化字段，统一放入 `legacyPayload`：

- `Requirement.productOwnerId`
- `Requirement.devOwnerId`
- `Requirement.devParticipants`
- `Requirement.testOwnerId`
- `Requirement.tags`
- `Requirement.estimatedDays`
- `Requirement.plannedDays`
- `Requirement.gapDays`
- `Requirement.gapBudget`
- `Requirement.actualDays`
- `Requirement.applicationCodes`
- `Requirement.vendors`
- `Requirement.vendorStaff`
- `Requirement.createdBy`
- `Task.estimatedDays`
- `Task.plannedDays`
- `Task.remainingDays`
- `Defect.taskId`

原则：

1. 迁移阶段不丢数据。
2. 先统一真源，再逐步把 `legacyPayload` 中高价值字段结构化。

---

## 5. 后端接口设计

### 5.1 新增统一接口

统一工作项接口为：

- `GET /api/issues`
- `GET /api/issues/{id}`
- `POST /api/issues`
- `PUT /api/issues/{id}`
- `PATCH /api/issues/{id}/state`
- `DELETE /api/issues/{id}`

### 5.2 列表过滤参数

首版支持以下查询参数：

- `type`
- `projectId`
- `assigneeId`
- `parentIssueId`
- `state`
- `q`

说明：

1. 首版搜索只做数据库层 `title/description` 模糊匹配。
2. 不引入复杂分页和全文搜索改造。

### 5.3 旧接口兼容策略

旧接口在迁移期继续保留：

- `/api/requirements`
- `/api/tasks`
- `/api/defects`

兼容策略：

1. URL 不变，避免前端一次性重构。
2. 底层全部改为读取和写入 `Issue`。
3. 旧接口只做“按类型投影”。
4. 迁移完成后，`Issue` 是唯一事实源，旧表不再承担写入职责。

---

## 6. 前端迁移策略

### 6.1 短期策略

短期不改页面路由结构，保持：

- `/requirements`
- `/tasks`
- `/defects`

但数据来源逐步切换为：

- `/api/issues?type=FEATURE`
- `/api/issues?type=TASK`
- `/api/issues?type=BUG`

### 6.2 页面投影规则

不同页面只是在统一对象上的不同视图：

1. 需求页显示 `FEATURE` 视图
2. 任务页显示 `TASK` 视图
3. 缺陷页显示 `BUG` 视图

显示差异通过字段裁剪完成：

- `BUG` 显示 `severity`
- `TASK` 显示工时和父项
- `FEATURE` 显示计划和交付字段

### 6.3 中期策略

新增统一工作项页 `/issues`，作为后续主入口：

1. 支持混合列表
2. 支持按类型、状态、项目、负责人筛选
3. 支持层级展示

待 `/issues` 稳定后，再逐步弱化旧导航入口。

---

## 7. 迁移实施顺序

建议按以下顺序落地：

### 阶段 1：建立统一真源

1. 新增 `Issue` 表和实体
2. 新增 `legacy_issue_mapping`
3. 新增 `IssueService` 和 `/api/issues`

### 阶段 2：迁移旧数据

1. 启动时检测 `issue` 表是否为空
2. 迁移 `Requirement`
3. 迁移 `Task`
4. 迁移 `Defect`
5. 写入映射表

### 阶段 3：兼容旧接口

1. `RequirementService` 改为 `Issue` 视图服务
2. `TaskService` 改为 `Issue` 视图服务
3. `DefectService` 改为 `Issue` 视图服务
4. Dashboard 聚合逻辑切换到 `Issue`

### 阶段 4：切前端数据源

1. 新增 `getIssues/createIssue/updateIssue` API 封装
2. 页面逐步切换到统一数据源
3. 新增 `/issues` 总览页

### 阶段 5：清理旧模型

1. 停止使用旧表
2. 删除旧实体和旧 repository
3. 更新设计基线和验收用例

---

## 8. 设计约束与默认选择

以下约束为当前版本固定选择：

1. `Issue` 是唯一真源。
2. `identifier` 采用全局序列格式 `ISSUE-{id}`，暂不引入项目或团队前缀。
3. `severity` 仅 `BUG` 可写，其它类型忽略该字段。
4. `estimatePoints` 仅作为预留字段，不要求当前前端页面使用。
5. 首版不做复杂关系表，层级仅使用 `parentIssueId`。
6. 首版不引入事件溯源、搜索索引和分析仓改造。
7. 旧接口保留到前端完全切换后再考虑删除。

---

## 9. 验收标准

完成统一工作项迁移后，应满足以下标准：

1. 空库启动后，旧演示数据能自动迁移为 `Issue`。
2. `/api/issues` 可完整执行增删改查。
3. `/api/requirements`、`/api/tasks`、`/api/defects` 在不改 URL 的情况下继续可用。
4. Dashboard 统计基于 `Issue` 仍能返回合理结果。
5. 前端现有三个页面在迁移期不报错。
6. 任一工作项都能通过 `sourceType/sourceId` 追溯到旧对象来源。

---

## 10. 后续演进方向

统一工作项模型稳定后，后续可以在其上继续扩展：

1. `Cycle`：承载团队短周期节奏
2. `IssueLabel`：从字符串标签演进为结构化标签
3. `IssueActivity`：统一活动流和审计
4. `DocumentLink`：文档与工作项关联
5. `GitLabLink`：代码交付与工作项关联
6. `AgentRun`：让 AI 能围绕单一工作项上下文执行

这也是统一模型最重要的价值：后续能力只需要围绕一个主对象扩展，而不需要在三套对象上重复建设。
