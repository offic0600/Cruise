# 基于 HAR 的 Cruise 模块设计清单

版本：v1  
日期：2026-03-31  
输入来源：
- `C:\Users\25062215\Downloads\linear.app1.har`
- 辅助参考：`C:\Users\25062215\Downloads\linear.app.har`

## 说明

本文只基于 HAR 可观察到的前端行为和接口载荷，整理 Linear 的产品层对象模型，并映射为 Cruise 可落地的模块设计清单。

本文明确区分三种证据等级：

- `直接证据`
  直接来自 HAR 中的 GraphQL 请求/响应，或能明确识别语义的页面路由。
- `高置信推断`
  来自 HAR 中的静态资源 chunk 名、GraphQL 操作名、页面路径、模块命名和已有交互上下文，足以指导 Cruise 的产品与前端建模，但不能声称掌握 Linear 的后端表结构。
- `待验证`
  这份 HAR 不能单独证明，需要后续更细粒度抓包或产品验证后才能收敛到字段级设计。

本文目标不是还原 Linear 的数据库 schema，而是给 Cruise 提供：

- 核心对象
- 推荐字段
- 关系
- 当前 Cruise 已有
- 缺失项
- 实现优先级

---

## 一、总览结论

这份 HAR 给出的最强信号不是某个具体对象的字段，而是 Linear 的整体架构风格：

- `Issues`、`Projects`、`Initiatives` 不是完全独立的系统，而是共享一套 `View / Preferences / Filter Blocks / List Provider` 内核。
- `Projects` 主页不是“项目详情列表的简单表格”，而是标准化的 `Project collection + Project view + Project list` 子系统。
- `ProjectUpdate`、`ProjectMilestone`、`ViewPreferences`、`Subscription` 都是独立对象，不应被压扁成某个页面的局部状态。
- `Workspace / Team / Member / OrganizationUser` 的边界是明显存在的，不能只靠一个 `organizationId` 抹平。

HAR 中最有价值的直接/间接证据包括：

- GraphQL:
  - `ViewPreferencesUpdate`
  - `ProjectUpdate`
  - `ProjectUpdateCreate`
  - `FavoriteCreate_UserSettingsUpdate`
  - `FavoriteDelete`
- 关键页面与模块 chunk：
  - `AllProjectsPage`
  - `ProjectListProvider`
  - `ProjectViewOptions`
  - `ProjectSubscriptionsMenu`
  - `ProjectUpdatesPage`
  - `WriteUpdateForm`
  - `ProjectMilestone`
  - `IssueList`
  - `IssueFilterBlocks`
  - `GroupedIssueFilterBlocks`
  - `CustomViewsPage`
  - `ViewOptionsMenu`
  - `ViewSubscriptions`
  - `Inbox`
  - `NotificationFilterBlocks`
  - `InitiativesPage`
  - `WorkspaceMembersPage`
  - `CyclePage`

---

## 二、模块设计清单

## 1. Views 内核

### 证据等级
- 直接证据：
  - `ViewPreferencesUpdate(viewPreferencesUpdateInput: ViewPreferencesUpdateInput!)`
  - 返回 `lastSyncId`
- 高置信推断：
  - `useActiveView`
  - `CustomViewsPage`
  - `CustomViewForm`
  - `ViewOptions`
  - `ViewOptionsMenu`
  - `SaveCustomViewButtons`
  - `ViewSubscriptions`
  - `RegisterModelsFromViewState`

### 核心对象
- `View`
- `ViewPreferences`
- `ViewSubscription`
- `Favorite`

### 推荐字段

#### `View`
- `id`
- `name`
- `resourceType`
- `scopeType`
- `scopeId`
- `ownerUserId`
- `visibility`
- `isSystem`
- `slug`
- `queryState`

#### `ViewPreferences`
- `layout`
- `grouping`
- `subGrouping`
- `sorting`
- `filters`
- `display`
- `lastSyncId`

#### `ViewSubscription`
- `id`
- `viewId`
- `userId`
- `eventKey`
- `channel`
- `enabled`

### 关系
- `View` 1:1 `ViewPreferences`
- `View` 1:N `ViewSubscription`
- `View` N:1 `User(owner)`
- `View` 绑定 `resourceType`

### 当前 Cruise 已有
- 已有统一 `View(resourceType=ISSUE|PROJECT)` 方向
- 已有 `queryState`
- 已有 issue/project view 新建与保存
- 已有部分 `display/grouping/sorting` 能力

### 缺失项
- initiative view 资源类型
- 更完整的 `ViewPreferences` 结构收口
- view favorites
- view subscriptions 的统一对象模型
- view 级 server-backed message / sync 元数据

### 实现优先级
- `v1`
  - 收口 `View + ViewPreferences + ViewSubscription`
  - 统一 issue/project view schema
- `v2`
  - initiative view
  - favorites
  - 更完整的 board/subGrouping/display persistence

---

## 2. Projects 子系统

### 证据等级
- 直接证据：
  - 路由：`/cleantrack/projects/all`
  - 路由：`/cleantrack/projects/view/...`
  - GraphQL: `ProjectUpdate`, `ProjectUpdateCreate`
- 高置信推断：
  - `AllProjectsPage`
  - `ProjectsPageContent`
  - `ProjectListProvider`
  - `ProjectList`
  - `ProjectListItems`
  - `ProjectColumnHeaders`
  - `ProjectViewOptions`
  - `GroupedProjectFilterBlocks`
  - `ProjectOverviewPage`
  - `ProjectDetails`
  - `ProjectSubscriptionsMenu`

### 核心对象
- `Project`
- `WorkspaceProjectRow`
- `ProjectView`
- `ProjectSubscription`

### 推荐字段

#### `Project`
- `id`
- `name`
- `description`
- `status`
- `priority`
- `ownerId`
- `teamId`
- `organizationId`
- `startDate`
- `targetDate`
- `createdAt`
- `updatedAt`
- `archivedAt`

#### `WorkspaceProjectRow`
- `id`
- `name`
- `description`
- `priority`
- `leadUserId`
- `leadUserName`
- `targetDate`
- `health`
- `latestUpdateId`
- `latestUpdateAt`
- `issueCount`
- `completedIssueCount`
- `progressPercent`
- `nextMilestoneId`
- `nextMilestoneName`

#### `ProjectSubscription`
- `id`
- `projectId`
- `userId`
- `eventKey`
- `channel`

### 关系
- `Project` N:1 `Team`
- `Project` N:1 `User(owner/lead)`
- `Project` 1:N `Issue`
- `Project` 1:N `ProjectUpdate`
- `Project` 1:N `ProjectMilestone`
- `Project` 1:N `ProjectSubscription`

### 当前 Cruise 已有
- 已有 `Project`
- 已有 workspace projects 主页雏形
- 已有 project views 路由
- 已有部分项目聚合行字段：
  - `health`
  - `progressPercent`
  - `nextMilestone`

### 缺失项
- 项目主页 filter schema 的系统化定义
- 项目主页 display options 的完整 persistence
- project subscriptions
- 项目主页更稳定的聚合 DTO 与排序规则
- project favorites / saved collections

### 实现优先级
- `v1`
  - 完整 `WorkspaceProjectRow`
  - `All projects`
  - custom project views
  - project filters + display options
- `v2`
  - project subscriptions
  - favorites
  - board layout

---

## 3. Project Updates / Health

### 证据等级
- 直接证据：
  - GraphQL `ProjectUpdate`
  - GraphQL `ProjectUpdateCreate`
- 高置信推断：
  - `ProjectUpdatesPage`
  - `WriteUpdateForm`
  - `UpdateHealthDropdown`
  - `ProjectUpdateDiffSnapshot`
  - `FastUpdateEditor`

### 核心对象
- `ProjectUpdate`
- `ProjectHealth`
- `ProjectUpdateDiffSnapshot`

### 推荐字段

#### `ProjectUpdate`
- `id`
- `projectId`
- `authorUserId`
- `body`
- `health`
- `createdAt`
- `updatedAt`
- `diffSnapshot`

#### `ProjectUpdateDiffSnapshot`
- `descriptionChanged`
- `milestonesChanged`
- `progressChanged`
- `statusChanged`

### 关系
- `ProjectUpdate` N:1 `Project`
- `ProjectUpdate` N:1 `User(author)`

### 当前 Cruise 已有
- 已有 `ProjectUpdate` 模型
- 已有 `health` 被用于项目主页聚合

### 缺失项
- update 编辑器
- update feed / timeline
- update diff snapshot
- latest update 与主页的统一聚合规则

### 实现优先级
- `v1`
  - latest update + health
  - create/update 基本链路
- `v2`
  - diff snapshot
  - update timeline
  - comments/reactions on update

---

## 4. Project Milestones

### 证据等级
- 高置信推断：
  - chunk 中直接出现 `ProjectMilestone`
  - 相关 timeline / positioning 代码片段

### 核心对象
- `ProjectMilestone`

### 推荐字段
- `id`
- `projectId`
- `name`
- `description`
- `targetDate`
- `startDate`
- `sortOrder`
- `completedAt`
- `archivedAt`

### 关系
- `ProjectMilestone` N:1 `Project`

### 当前 Cruise 已有
- 已有 `ProjectMilestone` 相关后端与前端能力基础
- 新项目 modal 已支持 milestone 草稿和串行创建

### 缺失项
- milestone timeline 视图
- milestone 在项目主页中的更稳定展示策略
- milestone 与 progress / updates / planning 的联动

### 实现优先级
- `v1`
  - create/list/update/delete
  - 项目主页显示最近 milestone
- `v2`
  - timeline
  - roadmap / initiative 联动

---

## 5. Issues 模块

### 证据等级
- 高置信推断：
  - `AllIssuesPage`
  - `ActiveIssuesPage`
  - `BacklogIssuesPage`
  - `MyIssuesPage`
  - `IssuePage`
  - `IssueList`
  - `IssueListItems`
  - `IssueDetailsPaneSidebar`
  - `IssueCommentsAndHistory`
  - `IssueFilterBlocks`
  - `GroupedIssueFilterBlocks`
  - `IssuesMultiSelectActions`
  - `SubIssuesEditor`
  - `FastIssueCreateState`
  - `LocalDraftIssueCreate`

### 核心对象
- `Issue`
- `IssueComment`
- `IssueHistory`
- `IssueDraft`
- `IssueView`

### 推荐字段

#### `Issue`
- `id`
- `identifier`
- `title`
- `description`
- `state`
- `priority`
- `assigneeId`
- `projectId`
- `parentIssueId`
- `createdAt`
- `updatedAt`
- `completedAt`

#### `IssueDraft`
- `id`
- `title`
- `description`
- `teamId`
- `projectId`
- `assigneeId`
- `priority`
- `state`
- `localOnly`

#### `IssueHistory`
- `id`
- `issueId`
- `actorUserId`
- `eventType`
- `before`
- `after`
- `createdAt`

### 关系
- `Issue` N:1 `Project`
- `Issue` N:1 `User(assignee)`
- `Issue` 1:N `IssueComment`
- `Issue` 1:N `IssueHistory`
- `Issue` 1:N `subIssues`

### 当前 Cruise 已有
- issue shared list 内核
- issue shared selection panels
- views/new preview 共用 issue list
- 部分 issue filters/display/grouping

### 缺失项
- issue draft/local draft 的明确模型
- comments/history 的统一数据层
- multi-select action 模块
- 更完整的 issue sidebar 属性系统

### 实现优先级
- `v1`
  - 巩固 issue list / sidebar / comments/history
- `v2`
  - local draft
  - multi-select actions
  - advanced suggestions / repository suggestions

---

## 6. Notifications / Inbox / Subscriptions

### 证据等级
- 直接证据：
  - `FavoriteCreate_UserSettingsUpdate`
  - `FavoriteDelete`
- 高置信推断：
  - `Inbox`
  - `InboxModalComponents`
  - `NotificationSettingsPage`
  - `NotificationFilterBlocks`
  - `MarkNotificationAsRead`
  - `NotificationChannelPage`
  - `ViewSubscriptions`
  - `ProjectSubscriptionsMenu`

### 核心对象
- `Notification`
- `InboxItem`
- `Subscription`
- `Favorite`

### 推荐字段

#### `Notification`
- `id`
- `actorUserId`
- `resourceType`
- `resourceId`
- `eventKey`
- `readAt`
- `createdAt`

#### `Subscription`
- `id`
- `resourceType`
- `resourceId`
- `userId`
- `eventKey`
- `channel`
- `enabled`

#### `Favorite`
- `id`
- `resourceType`
- `resourceId`
- `userId`
- `createdAt`

### 关系
- `Notification` N:1 `User(actor)`
- `Subscription` N:1 `User`
- `Subscription` 绑定 `View` 或 `Project`
- `Favorite` 绑定 `View` 或其他内容对象

### 当前 Cruise 已有
- 已有部分 view subscribe 功能
- 已有 favorite 基础行为

### 缺失项
- inbox 模块
- notification filter blocks
- 统一 subscription 模型
- project subscription 菜单

### 实现优先级
- `v1`
  - `ViewSubscription`
  - `ProjectSubscription`
  - eventKey 统一
- `v2`
  - inbox
  - notification channels
  - notification filters

---

## 7. Teams / Members / Hierarchy

### 证据等级
- 直接证据：
  - GraphQL 中 `availableUsers.users.organization`
- 高置信推断：
  - `WorkspaceMembersPage`
  - `WorkspaceMembersSettingsPage`
  - `TeamMembersSettingsPage`
  - `SetActiveTeam`
  - `ParentTeamSelect`
  - `ChangeParentTeamForm`
  - `SetParentTeamForm`
  - `RemoveParentTeamForm`

### 核心对象
- `WorkspaceMember`
- `Team`
- `TeamMembership`
- `OrganizationUser`

### 推荐字段

#### `OrganizationUser`
- `id`
- `name`
- `displayName`
- `email`
- `avatarUrl`
- `role`
- `organizationId`

#### `Team`
- `id`
- `name`
- `organizationId`
- `parentTeamId`
- `archivedAt`

#### `TeamMembership`
- `id`
- `teamId`
- `userId`
- `role`

### 关系
- `Organization` 1:N `Team`
- `Team` N:1 `parentTeam`
- `OrganizationUser` M:N `Team` 通过 `TeamMembership`

### 当前 Cruise 已有
- workspace/team 基础分层
- team 作用域项目和事项
- assignee/lead panel 基于成员数据工作

### 缺失项
- parent team 层级
- workspace members 独立主页
- team membership 专门模型能力的完整暴露

### 实现优先级
- `v1`
  - 收口 `OrganizationUser` / `TeamMembership`
  - workspace members
- `v2`
  - parent team
  - team hierarchy 管理能力

---

## 8. Planning：Initiatives / Roadmap

### 证据等级
- 高置信推断：
  - `InitiativesPage`
  - `InitiativesList`
  - `InitiativeProjectsContent`
  - `InitiativeProjectsPage`
  - `InitiativeOverviewPage`
  - `InitiativeUpdatePage`
  - `InitiativeUpdatesPage`
  - `InitiativeUpdatePopover`
  - `CustomInitiativeViewPage`
  - `GroupedInitiativeFilterBlocks`
  - `InitiativeFilterBlocks`
- 文本侧证：
  - roadmap / initiative / project milestones / updates 被同时提及

### 核心对象
- `Initiative`
- `InitiativeUpdate`
- `InitiativeToProject`
- `Roadmap`
- `RoadmapToProject`

### 推荐字段

#### `Initiative`
- `id`
- `name`
- `description`
- `ownerId`
- `status`
- `targetDate`
- `health`

#### `InitiativeUpdate`
- `id`
- `initiativeId`
- `authorUserId`
- `body`
- `health`
- `createdAt`

#### `InitiativeToProject`
- `initiativeId`
- `projectId`
- `sortOrder`

### 关系
- `Initiative` M:N `Project`
- `Roadmap` M:N `Project`
- `Initiative` 1:N `InitiativeUpdate`

### 当前 Cruise 已有
- 基本没有正式 initiative 模块

### 缺失项
- initiative 对象
- roadmap 对象
- initiative/project 关联
- initiative views

### 实现优先级
- `v1`
  - 暂不实现
- `v2`
  - 先做 `Initiative`
  - 再做 `Initiative -> Project`
  - roadmap 最后补

---

## 9. Cycles

### 证据等级
- 高置信推断：
  - `CyclePage`
  - `CyclesPage`
  - `CyclesList`
  - `CycleDetailComponents`
  - `TeamCycleSettingsPage`

### 核心对象
- `Cycle`
- `CycleSettings`

### 推荐字段
- `id`
- `teamId`
- `name`
- `startsAt`
- `endsAt`
- `status`
- `isCurrent`

### 关系
- `Cycle` N:1 `Team`
- `Issue` N:1 `Cycle`

### 当前 Cruise 已有
- 暂无正式 cycle 子系统

### 缺失项
- cycle 模型
- cycle 设置与列表页

### 实现优先级
- `v2`

---

## 10. Labels / Customers / Documents

### 证据等级
- 高置信推断：
  - `LabelSettingsPage`
  - `ProjectLabelsPage`
  - `IssueLabelsPage`
  - `labelBlockFilterUtils`
  - `CustomerFilterBlocks`
  - `ProjectCustomerNeedsPage`
  - `DocumentView`
  - `DocumentTitleUpdater`

### 核心对象
- `Label`
- `Customer`
- `CustomerNeed`
- `Document`

### 推荐字段

#### `Label`
- `id`
- `name`
- `color`
- `scopeType`
- `scopeId`

#### `CustomerNeed`
- `id`
- `customerId`
- `title`
- `description`
- `linkedProjectId`

#### `Document`
- `id`
- `title`
- `content`
- `authorUserId`
- `updatedAt`

### 当前 Cruise 已有
- labels 基础能力已有

### 缺失项
- 客户需求域
- 文档域
- label 的 workspace/team 分层能力继续完善

### 实现优先级
- `v1`
  - labels 强化
- `v2`
  - customer needs
  - documents

---

## 三、Cruise 路线图建议

## V1：应优先完成

### 1. Views 统一内核
- 收口 `View + ViewPreferences + ViewSubscription`
- issue/project 共用 display/filter/grouping/sorting schema

### 2. Projects 子系统补齐
- `WorkspaceProjectRow`
- `ProjectUpdate`
- `ProjectMilestone`
- project views
- project filters + display options

### 3. Notifications 最小闭环
- `ViewSubscription`
- `ProjectSubscription`
- `Favorite`

### 4. Team / Member 结构收口
- `OrganizationUser`
- `TeamMembership`
- workspace members 主页

## V2：在 V1 稳定后推进

### 1. Initiatives / Planning
- `Initiative`
- `InitiativeUpdate`
- `InitiativeToProject`

### 2. Inbox / Notification center
- `Notification`
- `InboxItem`
- notification filters

### 3. Team hierarchy / parent team
- `parentTeamId`
- 层级管理界面

### 4. Cycles
- cycle 模型
- cycle 设置与视图

### 5. Documents / Customer Needs
- 作为横向模块补入项目体系

---

## 四、待验证清单

以下内容不能仅凭当前 HAR 定成字段级设计，后续需要更细抓包或产品确认：

- `Project.status` 和项目主页 `Status` 列是否同义
- `All projects` 是否完全不落库
- `ProjectMembers` 是否是独立持久化模型
- `Notification.eventKey` 的完整枚举
- `ViewPreferences` 的完整 wire shape
- `Initiative` 与 `Roadmap` 的精确关系
- `health` 是否只存在于 update，而非 project/initiative 本体

在 Cruise 中，这些都应先按产品层抽象建模，不要直接假定 Linear 的后端表设计。

---

## 五、结论

这份 HAR 支持我们做出的最重要设计判断是：

- Cruise 应继续沿着“统一 view 内核 + 资源类型差异化”的方向走
- `Projects` 不该是 issue 的附属页，而应是完整工作流子系统
- `ProjectUpdate`、`ProjectMilestone`、`Subscription`、`Favorite` 都应独立建模
- `Initiative` 应作为 V2 规划层对象引入，而不是硬塞进 `Project`

这份文档可直接作为 Cruise 下一阶段模块设计与排期输入，但不应用作数据库 schema 的唯一来源。
