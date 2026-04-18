# Active issues 已登录会话阻塞复测（2026-04-18 22:40 CST）

## 目标

- 任务：`CAP-06` Active issues 顶部工具栏与 tabs 交互证据
- 深链：`https://linear.app/cleantrack/team/CLE/active`
- 本轮目标：做一次最小只读复测，确认 9222 metadata 是否仍可读，以及真实页面是否仍被认证门页拦住。

## 本轮稳定事实

1. terminal 侧 `http://127.0.0.1:9222/json/version` 与 `/json/list` 本轮再次退回 `502 Bad Gateway`。
2. Hermes browser 侧仍可读取 `/json/version` 与 `/json/list`，并继续枚举到 Linear target：
   - `id=81A3713C33BCA35B2A0B8C7D177F43AD`
   - `title=Cleantrack › Active issues`
   - `url=https://linear.app/cleantrack/team/CLE/active`
3. 直接打开 Active issues 深链时，首屏仍是 **`Link opened in the Linear app`** 中转页，而不是真实 issues 列表。
4. 点击 **`Open here instead`** 后，仍进入 **`Log in to Linear`** 登录页，不会复用已登录的 Active issues 页面。
5. 登录页本轮可见入口仍只有：
   - `Continue with Google`
   - `Continue with email`
   - `Continue with SAML SSO`
   - `Log in with passkey`
6. 本轮未见 CAPTCHA、人机校验或任何 Active issues 顶部 tabs / search / filter / display / new issue 控件。

## 页面级流程记录

### A. 深链直开

- URL（前）：`https://linear.app/cleantrack/team/CLE/active`
- 页面标题：`Linear`
- 可见文案：
  - `Link opened in the Linear app`
  - `Your browser will ask for permission to open future links in the desktop app faster.`
  - `Open here instead`
- 页面判定：桌面端 app handoff 中转页
- 截图：`/Users/liuzheng/.hermes/cache/screenshots/browser_screenshot_da12751975c64b678a2902f00f932126.png`

### B. 点击 Open here instead

- 动作：点击中转页主按钮 `Open here instead`
- URL（后）：仍显示 `https://linear.app/cleantrack/team/CLE/active`
- 页面标题：`Linear`
- 可见文案：
  - `Log in to Linear`
  - `Continue with Google`
  - `Continue with email`
  - `Continue with SAML SSO`
  - `Log in with passkey`
  - `Don’t have an account? Sign up or learn more`
- 页面判定：认证门页 / 登录页，不是已登录 Active issues 真页
- 截图：`/Users/liuzheng/.hermes/cache/screenshots/browser_screenshot_a09c8abff2664d38b80115d4c3578b6f.png`

## DOM / 结构变化摘要

### 中转页

- 标题文本：`Link opened in the Linear app`
- 次级说明中含 `Learn more` 链接
- 单一主按钮：`Open here instead`

### 登录页

- 标题：`Log in to Linear`
- 4 个登录按钮：Google / email / SAML SSO / passkey
- 底部 2 个辅助链接：`Sign up` / `learn more`

## 网络 / 资源侧只读摘要

点击 `Open here instead` 后，浏览器 resource entries 末尾仍主要是登录门页与路由保护相关静态资源，例如：

- `resolveIssueViewAndRelatedModels.BnkLdTpi.js`
- `routeProtection.6e2rI3Yx.js`
- `AuthDesktopRedirect.ty7Vm-V5.js`
- `LazyLoginView.D6Tlbzql.js`
- `authenticationSessionsQuery.oMhDstY7.js`
- `Root-CrYfb3fb.css`

本轮仅做 resource-level 只读摘要，未主张已捕获 Active issues 业务网络事件。

## 这轮补到的真实增量

- 明确记录了 22:40 的 metadata 分裂态：**terminal 侧再度 502，但 browser 侧 `/json/version` 与 `/json/list` 仍可读。**
- 在 metadata 仍可见 target 的前提下，再次确认真实深链依旧只会进入中转页 → 登录页，authenticated page reuse 仍失败。
- 增补了一份新的流程/截图/资源摘要，避免后续把此刻错误归因为“Linear target 消失”。

## 仍缺失项

- Active issues 真页 DOM
- 顶部 tabs / search / filter / display / sort / new issue 的点击前后证据
- 行点击与 issue 详情入口证据
- 真实业务网络请求摘要

## 下一步最小动作

优先改做 **page websocket / CDP 的只读页面级证据补抓**，直接针对 target id `81A3713C33BCA35B2A0B8C7D177F43AD` 尝试读 DOM / 页面状态；仅当 browser 侧 metadata 也不可读时，才再次回退到纯可达性探测。
