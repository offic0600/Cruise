# Cruise 改造总路线图

版本：v1  
日期：2026-03-31  
输入依据：
- `docs/linear-har-module-design-checklist.md`
- `docs/views-system-design.md`
- 当前 Cruise 前后端实现现状

## 概述

Cruise 下一阶段不应继续按单页功能点零散演化，而应收敛为 5 个共享子系统：

- `Views 内核`
- `Projects`
- `Notifications`
- `Planning`
- `Workspace / Team / Members`

当前仓库已经具备不少基础：
- 前端已有共享 issue 列表、project composer、workspace projects 雏形
- 后端已有 `View`、`ProjectUpdate`、`ProjectMilestone`、`Initiative`、`Roadmap`、`NotificationSubscription`、`Membership`

但主要问题仍然存在：
- 前后端对象边界不统一
- 同一语义存在重复模型
- 很多模块只停留在 CRUD，没有形成产品闭环
- 页面层状态还没有完全收敛到统一 `queryState`

本路线图的目标是：让 Cruise 从“功能集合”演进为“统一内容视图驱动的工作管理平台”。

---

## 设计原则

### 1. 保留共享内核，不推翻重来
- 继续强化现有 `issue + view` 共享内核
- 新功能优先挂到共享 shell、共享 panel、共享 queryState
- 不再为项目、规划、成员页各自发明一套状态结构

### 2. Projects 是 V1 主线
- 下一个完整产品闭环围绕 `workspace projects` 建设
- 先把项目主页、项目视图、项目更新、项目里程碑串起来
- 不并行铺开太多规划页和通知页

### 3. 统一对象边界
- `View` 只负责“已保存查询与展示配置”
- `Notification` 只负责“已投递的消息”
- `Subscription` 只负责“订阅条件”
- `Favorite` 只负责“用户收藏关系”
- `Membership` 作为成员关系主模型

### 4. HAR 只指导产品层，不指导数据库还原
- 不追求还原 Linear 后端 schema
- 只按 HAR 反推出的产品层模型收敛 Cruise
- 缺少直接证据的字段，不在 V1 做过度设计

---

## 子系统路线

## 1. Views 内核

### 目标
让 `View` 成为全系统唯一的“已保存查询与展示配置”对象。

### 统一模型
`View.resourceType` 扩展并固定为：
- `ISSUE`
- `PROJECT`
- `INITIATIVE`

`View.queryState` 固定承载：
- `filters`
- `sorting`
- `grouping`
- `subGrouping`
- `display`
- `layout`

### V1 要完成
- issue/project 共用同一套 `queryState` 结构
- `projects/view/*`、`views/projects/new`、`view/*` 路由兼容一致
- display/filter/grouping/sorting 持久化不再分裂
- 统一 `ViewSubscription` 挂接方式

### V2 再做
- `INITIATIVE` 接入 view 内核
- board/subGrouping 更完整能力
- favorites 的全局一致展示

### 当前仓库映射
- 已有：`ViewService`、`views-system-design.md`、issue/project views
- 缺失：initiative views、view preferences 结构收口、统一 favorites/subscriptions 策略

---

## 2. Projects

### 目标
把当前已有的 `Project`、`ProjectUpdate`、`ProjectMilestone`、workspace projects 主页正式串成完整子系统。

### 核心对象
- `Project`
- `WorkspaceProjectRow`
- `ProjectUpdate`
- `ProjectMilestone`
- `ProjectView`

### 项目主页固定聚合字段
- `priority`
- `lead`
- `targetDate`
- `health`
- `progressPercent`
- `nextMilestone`
- `issueCount`
- `completedIssueCount`

### 关键决策
- `Project.status` 继续表示项目生命周期
- 项目主页 `Status` 列固定显示 `progressPercent`
- `health` 来自最新 `ProjectUpdate.health`
- 不新增 `Project.health` 持久字段
- `ProjectMilestone` 独立建模，不退化为详情页附属列表

### V1 要完成
- `projects/all` 与 custom project views 完整闭环
- `WorkspaceProjectRow` 聚合 DTO 稳定下来
- `ProjectComposer`、`ProjectStatusSelectMenu`、`ProjectPrioritySelectMenu`、`ProjectLeadSelectMenu`、`ProjectLabelsSelectMenu` 成为正式共享内核
- 项目更新与项目主页联动
- 项目里程碑与项目主页联动

### V2 再做
- project subscriptions
- project favorites
- board 布局
- 项目详情页更系统化重构

### 当前仓库映射
- 已有：workspace projects 主页、project composer、`ProjectService` 聚合能力、`ProjectUpdateService`、`ProjectMilestoneService`
- 缺失：项目主页 filter/display options 系统化 schema、project subscriptions、项目详情页统一化

---

## 3. Notifications / Favorites / Subscriptions

### 目标
把通知、收藏、订阅从页面局部按钮逻辑收成独立域模型。

### 统一对象边界
- `Favorite`
  - 只表达“用户与资源的收藏关系”
- `Subscription`
  - 只表达“用户订阅某资源的某类事件”
- `Notification`
  - 只表达“已经生成并投递给用户的收件项”

### 固定实现方式
- `ViewSubscription` 和 `ProjectSubscription` 不再单独建表
- 统一映射到：
  - `NotificationSubscription(resourceType, resourceId, eventKey)`

### V1 要完成
- view subscribe
- project subscribe
- favorite create/delete
- mark read/archive

### V2 再做
- inbox 页面
- 通知筛选
- 通知渠道设置

### 当前仓库映射
- 已有：`Notification`、`NotificationSubscription`、`NotificationPreference`、`ViewFavorite`
- 缺失：前端 inbox、view/project subscribe 的统一前端抽象、favorite 与 header/view 行为的系统化

---

## 4. Planning

### 目标
把仓库里已经存在的 `Initiative` / `Roadmap` 能力从孤立 CRUD 收成真正规划层。

### 规划层对象顺序
1. `Initiative`
2. `InitiativeUpdate`
3. `Initiative -> Project`
4. `Roadmap`

### 长期结构
- `Issue`：执行层
- `Project`：交付层
- `Initiative`：规划层
- `Roadmap`：展示层

### V1 要完成
- 不实现 roadmap 页面
- 但要求后端对象与项目侧关系保持可用
- 不再继续漂在仓库里无前端承接

### V2 再做
- initiative 页面
- initiative updates
- initiative views
- roadmap 页面与 project 关联展示

### 当前仓库映射
- 已有：`InitiativeService`、`InitiativeUpdateService`、`RoadmapService`、相关实体与关联实体
- 缺失：前端页面、initiative 视图体系、与 projects 的产品闭环

---

## 5. Workspace / Team / Members

### 目标
统一成员模型，解决 `Membership` 和 `TeamMember` 重复语义。

### 固定主模型
- `Membership` 作为唯一的组织/团队成员关系模型
- `TeamMember` 视为历史冗余模型

### 使用约束
- assignee
- project lead
- workspace members 页面
- 成员筛选 panel

以上都统一从 membership 读模型，不再从不同接口拼接不同成员语义。

### 团队层级
V2 再补：
- `Organization`
- `Team`
- `Membership`
- `parentTeamId`

### V1 要完成
- workspace members 页面
- 统一成员数据 hook
- issue/project/lead/assignee 使用同一成员源

### V2 再做
- parent team
- team hierarchy 管理页面

### 当前仓库映射
- 已有：`MembershipService`、`TeamService`、`OrganizationService`、`TeamMember` 历史模型
- 缺失：统一的前端成员源、workspace members 产品页面、`TeamMember` 退役策略

---

## 分阶段实施

## V1：必须完成

### Phase A：收口共享内核
- 统一 `View.queryState`
- 统一 issue/project view schema
- 收口 project routes 与 project view routes

### Phase B：做完整 Projects 闭环
- workspace projects 主页
- custom project views
- `ProjectUpdate`
- `ProjectMilestone`
- `ProjectComposer`

### Phase C：补 Notifications 最小闭环
- favorite
- view subscribe
- project subscribe
- mark read/archive

### Phase D：收口成员模型
- `Membership` 作为 canonical model
- workspace members 页面
- issue/project 人员选择器统一成员源

## V2：在 V1 稳定后推进
- `Initiative`
- `InitiativeUpdate`
- `InitiativeToProject`
- `Roadmap`
- inbox
- notification channels
- parent team hierarchy
- cycles

---

## 关键接口与类型收口

### 统一类型
- `View.resourceType = ISSUE | PROJECT | INITIATIVE`
- `View.queryState = filters + sorting + grouping + subGrouping + display + layout`
- `WorkspaceProjectRow`
- `NotificationSubscription(resourceType, resourceId, eventKey)`
- `Membership` 作为 canonical member relation

### 前端共享组件
- `SharedIssuesList`
- `WorkspaceProjectsTable`
- `ProjectComposer`
- issue/project 共享选择 panel

### 后端聚合 DTO
- `WorkspaceProjectRow`
- `ViewResultDto` 继续覆盖 issue/project，后续可扩 initiative

---

## 验收标准

### Views
- issue/project view 的 filter/grouping/display 保存后可恢复
- `projects/view/*`、`views/projects/new`、`view/*` 兼容跳转一致
- 后续新增 `INITIATIVE` 时不需要再造第三套 view schema

### Projects
- `projects/all` 与 custom project views 共用同一 queryState 结构
- `health` 来自最新 `ProjectUpdate`
- `progressPercent` 来自 issue 聚合
- `nextMilestone` 来自 milestone 聚合
- 新项目创建、更新、里程碑创建、项目视图切换形成完整闭环

### Notifications
- view/project 订阅都映射到统一 subscription 模型
- 收藏不污染资源本体状态
- 生成通知、标记已读、按资源查询链路闭环

### Planning
- `Initiative` CRUD 可用
- initiative 更新可用
- initiative 绑定项目可用
- 与现有 projects 不冲突

### Members
- assignee/lead/member 页面使用同一成员源
- 退役 `TeamMember` 后不影响 issue/project 选择器

### 工程回归
- 前端构建通过
- 关键 workspace 路由不回退
- issue/project/view 现有流程不出现 schema 分叉

---

## 默认假设

- 优先级按 `Projects -> Notifications -> Planning -> Members hierarchy` 推进
- `Projects` 是下一阶段唯一的 V1 核心产品线
- `Initiative / Roadmap` 进入 V2
- `Membership` 作为成员关系主模型
- `TeamMember` 视为应收口的历史对象
- `health` 继续从 `ProjectUpdate` 派生
- 项目主页 `Status` 列继续显示进度百分比
- 不追求还原 Linear 后端 schema，只按 HAR 反推出的产品层模型收敛 Cruise
