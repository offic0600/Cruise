# Active issues DOM / 结构证据摘要

> 更新时间：2026-04-18 18:25 CST
> 任务对应：LP-06
> 证据来源：既有 `active-issues-target.json`、browser fallback 记录、`active-issues-analysis.md`

## 证据状态

当前没有新增可复用的登录态 browser 会话，也没有本轮新抓取的页面截图 / DOM dump；因此本文件基于仓库内已有证据，先完成一份**结构级摘要**，为后续更细的 DOM/交互补证提供稳定落点。

这意味着：
- 本轮能确认页面身份、目标路由和一部分结构语义；
- 但还**不能**声称已获取完整 DOM 树、工具栏字段级属性或 issue row 的逐列结构证据。

## 已确认页面身份

- 页面标题：`Cleantrack › Active issues`
- 目标 URL：`https://linear.app/cleantrack/team/CLE/active`
- 页面类型：team 语境下的 issues workbench / list view
- 目标 page websocket：`ws://127.0.0.1:9222/devtools/page/81A3713C33BCA35B2A0B8C7D177F43AD`

来源：`docs/linear-parity/dom/active-issues-target.json`

## 已确认结构级事实

基于现有分析文档与目标页元信息，可稳定确认以下结构事实：

1. **这是 team 级视图，不是全局 workspace issues 总览。**
   - URL 使用 `/cleantrack/team/CLE/active`
   - 说明页面语义是“某团队的 Active issues 视图”

2. **页面主标题为 `Active issues`。**
   - 这说明主内容区至少存在一个清晰的 page heading。
   - 对 Cruise 对标实现来说，标题与 team 语境下的 view tabs 是页面壳层的稳定基座。

3. **该页属于列表/工作台型布局，而非 issue detail。**
   - `active-issues-analysis.md` 已将其定位为“左侧导航 + 主内容区的 issues 主工作台结构”。
   - 当前对标重点仍是高信息密度、深色主题、列表驱动的 issue workbench。

4. **视图切换语义至少包含 team 路由下的 active/backlog/done 一类分段。**
   - 现有路线图与 route-map 均把 `/team/{teamKey}/{view}` 视为对标重点。
   - 这为 Cruise 中 `teamIssuesPath(...)` 与 team-active tabs 的语义化路径提供了外部依据。

## 浏览器 fallback 证据

Hermes 隔离 browser 工具直接访问目标 deep-link 时，**无法复用本机登录态**，实际落到了登录链路，而不是 Active issues 页面本身。

可确认的 fallback 事实：

- 初始目标 URL：`https://linear.app/cleantrack/team/CLE/active`
- browser 工具未进入目标 workbench 页面
- 点击 `Open here instead` 后进入 `Log in to Linear` 登录页
- 登录页可见交互包括：
  - `Continue with Google`
  - `Continue with email`
  - `Continue with SAML SSO`
  - `Log in with passkey`

来源：`docs/linear-parity/dom/active-issues-browser-tool-fallback.txt`

## 当前仍缺失的 DOM 证据

以下内容目前仍没有足够直接证据，不能过度推断：

- 顶部工具栏的完整可见文本与按钮顺序
- 搜索框 placeholder / label
- Filter / Display / Sort / Grouping 等控件的真实文案与 aria 属性
- issue row 的列顺序、列标题、hover/selection 状态
- 列表 section header 是否带计数、折叠控件、快捷操作
- 空态/加载态在 Linear 原页中的真实文案

## 对 Cruise 当前实现的直接约束

在缺少更细 DOM dump 的前提下，可以继续安全推进的对标工作主要包括：

1. **保持 team 语义路由优先**
   - 即 `/[workspaceSlug]/team/[teamKey]/{active|backlog|done}`
2. **继续完善 page shell / tabs / toolbar 的结构一致性**
   - 先保证布局与交互语义真实，再逐步细化文案与视觉细节
3. **优先做低风险列表行为对标**
   - 例如空态、分组折叠、搜索 URL 状态、筛选抽屉壳层等
4. **不要声称已完成字段级 DOM parity**
   - 当前最多只能说：页面身份、team 路由语义、workbench 类型与标题已具备证据支撑

## 建议的下一步最小任务

- 待 9222 恢复稳定后，优先补一次 metadata-only + 可见文本层检查：
  - 验证 `/json/version`
  - 验证 `/json/list`
  - 重新确认目标页 title / url / page id
- 若仍无法拿到可登录 DOM，会话可继续转为**Cruise 本地侧**的低风险对标任务：
  - 收口 team-active 工具栏结构
  - 补 filter drawer 壳层
  - 或继续补 route / row / empty state 的 helper 级验证
