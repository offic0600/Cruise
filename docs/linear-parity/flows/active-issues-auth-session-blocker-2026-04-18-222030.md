# Active issues 认证会话阻塞复测（2026-04-18 22:20:30 CST）

## 目标

- 任务：CAP-06
- 页面：`https://linear.app/cleantrack/team/CLE/active`
- 目的：在不做任何持久修改的前提下，复测 Active issues 顶部控件采集前置条件是否恢复，并补一轮真实页面入口/中转/登录门页证据。

## 本轮探测结论

### 1. 9222 metadata 已恢复到 terminal + browser 双侧可读

- terminal `curl http://127.0.0.1:9222/json/version` => `HTTP/1.1 200 OK`
- terminal `curl http://127.0.0.1:9222/json/list` => `HTTP/1.1 200 OK`
- Hermes browser 打开 `http://127.0.0.1:9222/json/version` 与 `/json/list` 也都可读
- `/json/list` 中仍可见目标 page：
  - `id`: `81A3713C33BCA35B2A0B8C7D177F43AD`
  - `title`: `Cleantrack › Active issues`
  - `url`: `https://linear.app/cleantrack/team/CLE/active`

### 2. 真实页面仍无法复用已登录会话

直接打开 `https://linear.app/cleantrack/team/CLE/active` 后，并未进入真实 Active issues 页面，而是先到达深链中转页：

- 主文案：`Link opened in the Linear app`
- 可见入口：`Open here instead`
- 证据截图：`/Users/liuzheng/.hermes/cache/screenshots/browser_screenshot_78c2034cf4124756a870bec8ecb59a3a.png`

点击 `Open here instead` 后：

- 页面标题仍为 `Linear`
- 主标题：`Log in to Linear`
- 可见登录入口：
  - `Continue with Google`
  - `Continue with email`
  - `Continue with SAML SSO`
  - `Log in with passkey`
- 证据截图：`/Users/liuzheng/.hermes/cache/screenshots/browser_screenshot_bbd675c3ff1148698d874e2b5c10a9fa.png`

## 页面 × 控件 × 状态 × 流程证据

| 阶段 | 页面/状态 | 控件 | 操作 | URL | 可见反馈 | DOM / 文本证据 |
|---|---|---|---|---|---|---|
| 入口 | 深链中转页 | `Open here instead` | 点击 | `https://linear.app/cleantrack/team/CLE/active` | 未进入真实 issues 列表，转入登录页 | `Link opened in the Linear app` |
| 后置 | 登录门页 | `Continue with Google` / `Continue with email` / `Continue with SAML SSO` / `Log in with passkey` | 只读观察，不点击 | `https://linear.app/cleantrack/team/CLE/active` | 说明当前浏览器上下文未复用本地已登录 Linear 会话 | `Log in to Linear` |

## 网络 / 元数据摘要

- 本轮可稳定确认 `json/version` 与 `json/list` 都是 `200 OK`
- metadata 已不再是 browser/terminal 分裂态；两侧都能读到同一个 Active issues target
- 但这只说明 CDP metadata 路径恢复，不代表 Hermes browser 已拿到该 target 的 authenticated DOM 控制权
- 当前真正阻塞 CAP-06 的状态已从“metadata endpoint 不可用”收敛为：**authenticated page reuse 仍失败**

## 本轮仍缺失项

以下真实 Active issues 证据本轮仍无法补齐：

- 顶部 tabs（Active / Backlog / All / Done 等）的真实 DOM 与切换反馈
- 搜索、Filter、Display、Sort、New issue 等顶部工具栏的打开态/关闭态/URL 影响
- 列表行 hover、行点击、issue 详情入口
- 真实 Active issues 页面上的网络请求摘要与 DOM 差异

## 对任务板的影响

- `CAP-06` 仍不能标记为完成
- 但 blocker 语义应更新为：
  - `9222 metadata path`: 已恢复
  - `authenticated page reuse`: 仍 blocked
- 下轮若继续采集，应优先尝试基于已知 page websocket / CDP 的只读 DOM 取证，而不是重复验证 `/json/version` / `/json/list` 是否 200
