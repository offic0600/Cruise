# Cruise vs Linear 差距分析

## 本轮结论（2026-04-18）
本轮再次验证本机 Chrome DevTools 9222 后，确认 **HTTP 元信息层已恢复可用**：`/json/version` 可稳定返回 Chrome/Protocol 与 browser websocket 信息，且既有文档已记录 `/json/list` 可定位到 `Cleantrack › Active issues` 页面。因此当前不再把问题定义为“9222 完全不可用”，而是“真实业务 Network 事件流尚未完成持续监听整理”。

## 取证状态
- 本轮实测：`http://127.0.0.1:9222/json/version` 返回 200，并确认：
  - Browser=`Chrome/147.0.7727.56`
  - Protocol-Version=`1.3`
  - browser websocket=`ws://127.0.0.1:9222/devtools/browser/1cb02d1f-3fe5-4829-836a-275b4e10b506`
- 既有 `api-catalog.md` 与 `chrome-devtools-access.md` 已记录：`/json/list` 可解析到 Active issues 目标页 `https://linear.app/cleantrack/team/CLE/active`
- 当前仍未完成：page target 上对 `Network.requestWillBeSent` / `Network.responseReceived` 的持续监听与摘要落盘
- 影响：`api-catalog.md` 仍缺真实 Linear GraphQL/REST 请求清单，但 9222 已不构成完全阻塞

## Cruise 当前 issues 能力盘点

### 前端页面现状
基于 `frontend/src/app/issues/page.tsx`：
- 已有独立 Issues 页：`/issues`
- 已支持视图切换：`all / active / backlog / done`
- 已支持搜索参数：`q`
- 已支持筛选参数：`type / state / priority / assigneeId / projectId / teamId / customFieldFilters`
- 已支持按状态分组展示：`BACKLOG / TODO / IN_PROGRESS / IN_REVIEW / DONE / CANCELED`
- 已支持快速创建 issue（sheet）
- 已支持项目、团队、成员、自定义字段联动
- 已存在 issue 详情页路由：
  - `frontend/src/app/issues/[id]/page.tsx`
  - `frontend/src/app/[workspaceSlug]/issue/[identifier]/[titleSlug]/page.tsx`
- 已有较完整 issue 详情实现：`frontend/src/components/issues/IssueDetailPage.tsx`

### 后端接口现状
基于 `backend/src/main/kotlin/com/cruise/controller/IssueController.kt`：
- `GET /api/issues`：支持分页与多维筛选
- `GET /api/issues/{id}`：获取 issue 详情
- `GET /api/issues/by-identifier`：按标识符查询 issue
- `POST /api/issues`：创建 issue
- `PUT /api/issues/{id}`：更新 issue
- `PATCH /api/issues/{id}/state`：单独更新状态
- `DELETE /api/issues/{id}`：删除 issue

另外还存在 issues 相关扩展接口：
- `IssueRelationController`：关系管理
- `IssueAttachmentController`：附件管理
- `IssueDraftController`：草稿管理
- `IssueTemplateController`：模板管理
- `RecurringIssueController`：重复 issue 管理

## 与 Linear Active Issues 的初步差距

### 1. 取证链路差距
Cruise 已有较多实现，但对 Linear 的实时页面/API 证据仍不足：
- 缺 HAR / 网络摘要
- 缺当前页面 DOM 结构快照
- 缺字段级证据表
- 缺当前实际交互序列记录

### 2. 路由与信息架构差距
Linear 已知目标页采用团队上下文路由：
- `https://linear.app/cleantrack/team/CLE/active`

Cruise 当前主 issues 页仍以通用路由为主：
- `/issues`

差距：
- Cruise 虽已有 workspace-aware detail route，但列表页尚未以 Linear 风格的 team/workspace 上下文路由为主入口
- 需要后续评估是否引入 `/[workspaceSlug]/team/[teamKey]/active` 等对标路由层

### 3. 视图模型差距
Cruise 当前 issues 页已具备基础视图能力，但与 Linear 仍可能存在以下差距：
- 缺少已取证确认的顶部工具栏结构对照
- 缺少 Linear 的 view preset / saved view / display options 证据映射
- 当前主要是“状态分组 + query 参数过滤”，是否达到 Linear 的 list density、toolbar composition、快捷操作层级仍待取证

### 4. 接口风格差距
- Cruise 采用明确 REST 风格 API
- Linear 很可能以 GraphQL 为核心（待 DevTools 恢复后验证）

结论：
- 这不构成必须改造点，但会影响前端状态聚合、字段加载与视图配置能力的复刻方式

## 当前判断
Cruise 在 issue 域并非“从零开始”，而是已经具备：
- 列表页
- 详情页
- 关系/附件/草稿/模板等能力

因此对标 Linear 的更优路径不是“新建 issues 模块”，而是：
1. 继续补足 Linear 证据
2. 把 Cruise 现有 issues 页做 **路由、布局、信息密度、工具栏、交互细节** 方向的贴近式改造
3. 优先在现有页面上做小步 UI/交互修正

## 建议下一步最小任务
优先级建议：
1. 若 9222 恢复，立刻采集 Active issues 网络请求清单
2. 若 9222 仍不可用，下一步改为补 `implementation-roadmap.md`，把 issues 对标改造拆成更细的可执行任务
3. 再下一步可落到一个最小代码任务：梳理 `/issues` 列表页与 Linear Active Issues 在顶部工具栏/视图切换上的首个 UI gap
