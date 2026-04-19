# Cruise vs Linear 差距分析

## 本轮结论（2026-04-19 10:01 CST）
本轮最新最小复测表明：**9222 metadata 继续处于 browser-readable / terminal-502 discrepancy，而非稳定双侧恢复**。Hermes browser 侧再次可直接读取 `http://127.0.0.1:9222/json/list`，并继续枚举到 6 个 live page targets + 1 个 worker target，其中目标页仍为 `Cleantrack › Active issues`；但 terminal 直连 `http://127.0.0.1:9222/json/version` 与 `/json/list` 本轮继续都返回 `502 Bad Gateway`。与此同时，真实打开 `https://linear.app/cleantrack/team/CLE/active` 后仍先落到 `Link opened in the Linear app` 中转页，显式点击 `Open here instead` 仍稳定进入 `Log in to Linear` 登录页，且未见 CAPTCHA 或 iframe。因此当前主 blocker 继续精确归类为 **authenticated page/session reuse failure**，而不是“9222 已恢复可随时深采”或“9222 完全不可用”。

## 取证状态
- 2026-04-19 10:01 CST 最新最小复测：browser 侧 `http://127.0.0.1:9222/json/list` 仍可读，并枚举到 6 个 live page targets + 1 个 worker target；其中 Linear target 仍为 `Cleantrack › Active issues`（id=`81A3713C33BCA35B2A0B8C7D177F43AD`，page websocket=`ws://127.0.0.1:9222/devtools/page/81A3713C33BCA35B2A0B8C7D177F43AD`）
- terminal 直连 `http://127.0.0.1:9222/json/version` 与 `/json/list` 本轮继续都返回 `502 Bad Gateway`
- 真实 deep link 页面仍先落到 `Link opened in the Linear app` 中转页；显式点击 `Open here instead` 后仍稳定进入 `Log in to Linear` 登录页，继续没有 CAPTCHA / iframe
- 当前仍未完成：authenticated Active issues DOM / tabs / toolbar / filter / display / sort / new 等真实控件级证据，以及 page target 上持续 `Network.requestWillBeSent` / `Network.responseReceived` 摘要落盘
- 影响：`api-catalog.md` 仍缺真实 Linear GraphQL/REST 请求清单；同时 implementation lane 在 CAP-07 authenticated detail evidence 恢复前，不应提前展开 detail 实际控件行为对标
- 最新证据落盘：`docs/linear-parity/flows/active-issues-auth-session-blocker-2026-04-19-1001.md`、`docs/linear-parity/har/2026-04-19-1001-browser-terminal-metadata-discrepancy-and-auth-blocked.json`

## 对 implementation lane 的最新边界约束
- 在 CAP-07 issue detail authenticated evidence 恢复前，安全最小 UI parity 只应继续推进 **issue detail route shell / 双栏骨架 / 版式占位层级**
- 可继续细化的范围：顶部 hero、主内容/评论区、右侧属性栏、activity/doc/relations 占位、未命中空态与返回 Active issues CTA 的 spacing / card chrome / badge 文案统一
- 继续挂起的范围：relations / sub-issues / activity feed / property rail 的真实控件行为、字段顺序和交互细节对标
- 结论：当前对标工作不该停摆，但必须从“真实控件 parity”收紧为“布局壳层 parity”

## 建议下一步最小任务
1. Capture lane：优先尝试直接针对 target `81A3713C33BCA35B2A0B8C7D177F43AD` 做 **page websocket / CDP read-only capture**，避免继续重复 metadata-only 或 interstitial-only repro
2. 若 capture 仍未解锁 authenticated detail evidence，implementation lane 继续只做 issue detail route shell / 双栏骨架 / 版式占位的最小 UI parity
3. 待 CAP-07 恢复后，再回到 detail hero / property rail / activity stream 的真实结构与交互对标

## 原有建议下一步最小任务（归档）
优先级建议：
1. 若 9222 恢复，立刻采集 Active issues 网络请求清单
2. 若 9222 仍不可用，下一步改为补 `implementation-roadmap.md`，把 issues 对标改造拆成更细的可执行任务
3. 再下一步可落到一个最小代码任务：梳理 `/issues` 列表页与 Linear Active Issues 在顶部工具栏/视图切换上的首个 UI gap

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
