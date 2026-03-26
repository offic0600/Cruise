# Cruise Views 系统设计

版本：v1.2  
日期：2026-03-25

## 概述

本文定义 Cruise 的 Views 系统设计。

`View` 不是一个独立页面，而是一份**可保存的查询工作台状态**。  
它由以下几个维度共同定义：

- `resourceType`
- `scope`
- `ownership / visibility`
- 结构化的 `queryState`

本文目标是明确当前系统的：

- 领域模型
- 路由规则
- 保存与可见性规则
- 在 Cruise 前后端中的直接映射方式

## 核心模型

`View` 的规范模型如下：

```ts
type View = {
  id: string
  resourceType: 'ISSUE' | 'PROJECT'
  scopeType: 'WORKSPACE' | 'TEAM'
  scopeId: string
  ownerUserId?: string
  visibility: 'PERSONAL' | 'WORKSPACE' | 'TEAM'
  isSystem: boolean
  systemKey?: string
  name: string
  description?: string
  queryState: ViewQueryState
}
```

### 资源类型

`resourceType` 用来回答：这个 view 作用在哪一类资源上。

- `ISSUE`
- `PROJECT`

资源类型是 view 身份的一部分，不能只是页面上的一个切换状态。

### 作用域

`scopeType + scopeId` 用来回答：这个 view 在哪个上下文里成立。

支持的作用域：

- `WORKSPACE`
- `TEAM`

因此系统中会存在：

- workspace 级 issue views
- workspace 级 project views
- team 级 issue views

作用域是 view 身份的一部分。  
一个 team issue view，不等价于“workspace issue view + team 过滤条件”。

### 所有权与可见性

`visibility` 用来回答：这个已保存的 view 对谁可见。

- `PERSONAL`
- `WORKSPACE`
- `TEAM`

它和 `scope` 不是一回事：

- `scope` 决定 view 在哪里成立
- `visibility` 决定谁可以看到它

这里最重要的规则是：

> Personal 是可见性，不是作用域。

### 查询状态

`queryState` 是 view 的实际内容。

它不是简单的 `filterJson`，而是整套工作台配置的真源，至少包括：

- filters
- sorting
- grouping
- display options
- visible columns
- layout
- density

所以 `View` 本质上是“已保存的查询 + 展示配置”，而不是单纯的筛选条件预设。

## 路由规则

路由模型如下：

```txt
/{workspaceSlug}/views/issues
/{workspaceSlug}/views/projects
/{workspaceSlug}/team/{teamKey}/views/issues
/{workspaceSlug}/view/{viewId}
```

### Workspace 级 Views

workspace 级 views 直接挂在 workspace slug 下：

- `/{workspaceSlug}/views/issues`
- `/{workspaceSlug}/views/projects`

这两个路由是不同资源类型的 collection 入口。

### Team 级 Views

team 级 issue views 挂在 team 段下：

- `/{workspaceSlug}/team/{teamKey}/views/issues`

这意味着 team 作用域必须由 URL 明确表达，而不是只靠 `queryState` 间接推导。

### Active View

具体某一个已保存 view 应该有自己的直达路由：

- `/{workspaceSlug}/view/{viewId}`

因此系统需要明确区分：

- collection 入口路由
- 具体 active view 路由

## 保存与可见性模型

保存目标模型如下。

### 在 workspace 级 views 中

允许的保存目标：

- `Personal`
- `Workspace`

如果在 workspace 作用域下保存 personal view，则表示：

- `scopeType = WORKSPACE`
- `scopeId = 当前 workspace`
- `visibility = PERSONAL`
- `ownerUserId = 当前用户`

如果保存为 workspace view，则表示：

- `scopeType = WORKSPACE`
- `scopeId = 当前 workspace`
- `visibility = WORKSPACE`

### 在 team 级 issue views 中

允许的保存目标：

- `Personal`
- `Team`

如果在 team 作用域下保存 personal view，则表示：

- `scopeType = TEAM`
- `scopeId = 当前 team`
- `visibility = PERSONAL`
- `ownerUserId = 当前用户`

如果保存为 team view，则表示：

- `scopeType = TEAM`
- `scopeId = 当前 team`
- `visibility = TEAM`

### 系统视图与自定义视图

系统中需要明确区分：

- 系统视图
- 用户创建的自定义视图

系统视图具备：

- 稳定的预定义身份
- 受保护的生命周期规则
- 不允许删除
- 可以收藏
- 可以复制或另存为新的自定义视图

自定义视图具备：

- owner 维度的编辑权限
- 可配置的 visibility
- rename / duplicate / delete 生命周期

### 收藏

收藏应该建模为“用户与 view 的关系”，而不是 `View` 上的共享布尔值。

```ts
type ViewFavorite = {
  viewId: string
  userId: string
}
```

这样可以避免收藏状态污染成公共状态，并保持收藏是用户私有关系。

## Cruise 映射方式

Cruise 应直接按这套模型映射。

### View 实体

Cruise 的 `View` 应包含：

- `resourceType`
  - `ISSUE | PROJECT`
- `scopeType`
  - `WORKSPACE | TEAM`
- `scopeId`
- `ownerUserId`
- `visibility`
  - `PERSONAL | WORKSPACE | TEAM`
- `isSystem`
- `systemKey`
- `queryState`

### URL 映射

Cruise 应使用：

- `/{workspaceSlug}/views/issues`
- `/{workspaceSlug}/views/projects`
- `/{workspaceSlug}/team/{teamKey}/views/issues`
- `/{workspaceSlug}/view/{viewId}`

这样可以保证：

- scope 由 URL 驱动
- resource type 是显式的一层语义
- active view 可以被直接引用和恢复

### 保存目标映射

Cruise 的保存目标应为：

#### 在 workspace 级 views 中

- `Personal`
- `Workspace`

#### 在 team 级 issue views 中

- `Personal`
- `Team`

实现中不能把 `Personal` 当成独立作用域处理。

### 系统视图

Cruise 应明确建模：

- 系统视图
  - 有稳定 `systemKey`
  - 不允许删除
  - 可以收藏
  - 可以复制 / 另存为新的自定义视图
- 自定义视图
  - 有 owner
  - 有 visibility
  - 可编辑
  - 可删除

### 收藏关系

Cruise 应把 favorites 从 `View` 实体中拆出去：

```ts
type ViewFavorite = {
  viewId: string
  userId: string
}
```

## 固定设计默认值

以下是实现时不再需要重新决策的默认规则：

- `scope` 和 `visibility` 是两个独立概念
- `queryState` 是唯一真源
- personal views 是“带私有可见性”的 scoped views
- system views 由后端维护，不由前端硬编码成用户记录
- 具体 active view 必须有独立 URL
- favorites 是用户关系，不是 `View` 本体字段

## 假设

- 当前支持的资源类型为 `ISSUE` 和 `PROJECT`
- 当前支持的作用域类型为 `WORKSPACE` 和 `TEAM`
- `queryState` 是 view 状态的唯一规范表达
- 如果系统中仍保留 `filterJson/groupBy/sortJson` 等旧字段，它们只能作为兼容字段，不能长期和 `queryState` 并存为双真源
