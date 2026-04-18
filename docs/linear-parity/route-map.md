# Linear 路由与导航图

## 已确认

### 1. Team Active issues 主入口
- 路由：`https://linear.app/cleantrack/team/CLE/active`
- 语义拆解：
  - workspace slug：`cleantrack`
  - team key：`CLE`
  - view segment：`active`
- 当前已确认标题：`Cleantrack › Active issues`
- 当前已确认这是 Linear issues 主链路中的团队上下文列表页，而不是通用全局 `/issues` 扁平入口

## 当前推断的路由模式
基于已采到的唯一稳定目标页，可先形成以下对标假设：

```text
/:workspaceSlug/team/:teamKey/:view
```

其中 `:view` 当前已确认值：
- `active`

待后续取证确认的可能同层视图：
- backlog
- all
- my issues（可能不是同一层级命名）
- 自定义 saved view

## 与 Cruise 当前路由的差距

### Cruise 已有入口
- 列表页：`/issues`
- 详情页：`/issues/[id]`
- workspace-aware 详情页：`/[workspaceSlug]/issue/[identifier]/[titleSlug]`

### 差距摘要
- Cruise 列表主入口仍是全局通用 `/issues`
- Linear 已确认列表入口带有 workspace + team 语义
- 这意味着后续若做深度对标，Cruise 列表页可能需要补：
  - workspace/team 上下文路由壳层
  - 从 team 视角切换 active/backlog/all 的导航结构

## 待补充路由清单
以下仍需后续 9222 恢复或页面取证时补齐：
- Issue 详情路由模式
- Projects 列表/详情路由
- Roadmap 路由
- Cycles 路由
- Inbox / Notifications 路由
- Settings 子路由
- Command Menu / Search 对应的 URL 变化（若有）

## 本轮备注
- 22:50 CST 复测时，terminal 再次探测 `http://127.0.0.1:9222` 时，`/json/version` 与 `/json/list` 仍返回 `502 Bad Gateway`
- 同一时刻 Hermes browser 侧仍能读取 `/json/version` 与 `/json/list`，且继续枚举到 Active issues target `81A3713C33BCA35B2A0B8C7D177F43AD`，同时还能看到 `Codex Proxy Developer Dashboard`、`Branches · offic0600/Cruise` 等其它 page target
- 真实深链导航仍只到 `Link opened in the Linear app` 中转页，点击 `Open here instead` 后进入 `Log in to Linear` 登录页，因此本轮未新增更多真实业务路由证据

## 下一步建议
1. 9222 恢复后，优先从 `/json/list` 再次确认当前 page target 与可能出现的新 target
2. 一旦拿到 issue 详情页或 Projects 页 target，立即补充到本文件
3. 在 Cruise 侧同步评估是否需要增加 `/[workspaceSlug]/team/[teamKey]/active` 风格兼容路由
