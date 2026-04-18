# Active issues 已登录会话阻塞复测（2026-04-18 22:50 CST）

## 目标

- 任务：`CAP-06` Active issues 顶部工具栏与 tabs 交互证据
- 深链：`https://linear.app/cleantrack/team/CLE/active`
- 本轮目标：做一次最小只读复测，确认 9222 metadata 是否仍保持 browser/terminal split state，以及真实页面是否仍被认证门页拦住。

## 本轮稳定事实

1. terminal 侧 `http://127.0.0.1:9222/json/version` 与 `/json/list` 本轮仍为 `502 Bad Gateway`。
2. Hermes browser 侧仍可读取 `/json/version` 与 `/json/list`，并继续枚举到 Linear target：
   - `id=81A3713C33BCA35B2A0B8C7D177F43AD`
   - `title=Cleantrack › Active issues`
   - `url=https://linear.app/cleantrack/team/CLE/active`
3. `/json/list` 同时还能看到非 Linear 目标页，如 `Codex Proxy Developer Dashboard`、`Branches · offic0600/Cruise`，说明 browser 侧 metadata 目录本身仍可读，并非只剩旧缓存文本。
4. 直接打开 Active issues 深链时，首屏仍是 **`Link opened in the Linear app`** 中转页，而不是真实 issues 列表。
5. 点击 **`Open here instead`** 后，仍进入 **`Log in to Linear`** 登录页，不会复用已登录的 Active issues 页面。
6. 登录页本轮可见入口仍只有：
   - `Continue with Google`
   - `Continue with email`
   - `Continue with SAML SSO`
   - `Log in with passkey`
7. 本轮未见 CAPTCHA、人机校验或任何 Active issues 顶部 tabs / search / filter / display / new issue 控件。

## 页面级流程记录

### A. 深链直开

- URL（前）：`https://linear.app/cleantrack/team/CLE/active`
- pathname：`/cleantrack/team/CLE/active`
- 页面标题：`Linear`
- 可见文案：
  - `Link opened in the Linear app`
  - `Your browser will ask for permission to open future links in the desktop app faster.`
  - `Open here instead`
- 页面判定：桌面端 app handoff 中转页
- 截图：`/Users/liuzheng/.hermes/cache/screenshots/browser_screenshot_3e0fe73b40f644a49729d08269b42588.png`

### B. 点击 Open here instead

- 动作：点击中转页主按钮 `Open here instead`
- URL（后）：仍显示 `https://linear.app/cleantrack/team/CLE/active`
- pathname：仍为 `/cleantrack/team/CLE/active`
- 页面标题：`Linear`
- 可见文案：
  - `Log in to Linear`
  - `Continue with Google`
  - `Continue with email`
  - `Continue with SAML SSO`
  - `Log in with passkey`
  - `Don’t have an account? Sign up or learn more`
- 页面判定：认证门页 / 登录页，不是已登录 Active issues 真页
- 截图：`/Users/liuzheng/.hermes/cache/screenshots/browser_screenshot_8183ce827e724d578768bbd4f32af5b3.png`

## DOM / 结构变化摘要

### 中转页

- 标题文本：`Link opened in the Linear app`
- 次级说明中含 `Learn more` 链接
- 单一主按钮：`Open here instead`

### 登录页

- 标题：`Log in to Linear`
- 4 个登录按钮：Google / email / SAML SSO / passkey
- 2 个辅助链接：
  - `Sign up` → `/signup`
  - `learn more` → `/homepage`

## 网络 / 资源侧只读摘要

- `performance.getEntriesByType('navigation')` 仅显示一次 `navigate` 到 `https://linear.app/cleantrack/team/CLE/active`，`redirectCount=0`，说明浏览器层未暴露 HTTP 30x 链。
- 点击后资源条目仍主要是登录/路由保护相关静态资源与基础 runtime，例如：
  - `https://static.linear.app/fonts/InterVariable.woff2?v=4.1`
  - `https://static.linear.app/client/assets/html.Bb6KYVpF.js`
  - `https://static.linear.app/client/assets/PerformanceTimingHelper.67I_dhKb.js`
  - `https://static.linear.app/client/assets/rolldown-runtime.zcDlVW45.js`
  - `https://static.linear.app/client/assets/vendor-radix-ui.b02ybt5b.js`
  - `https://static.linear.app/client/assets/vendor-sentry.DUIRvFmS.js`
- 本轮仍仅做 resource-level 只读摘要，未主张已捕获 Active issues 业务网络事件。

## 这轮补到的真实增量

- 新增一轮 22:50 的 split-state 证据：terminal 继续 502，但 browser 继续可读 `/json/version` 与 `/json/list`。
- 补记 `/json/list` 除 Linear 外还包含其它实时 target，强化“browser 侧 metadata 目录仍真实可访问”的判断。
- 再次确认在 metadata 仍可见 target 的前提下，真实深链依旧只会进入中转页 → 登录页，authenticated page reuse 仍失败。

## 仍缺失项

- Active issues 真页 DOM
- 顶部 tabs / search / filter / display / sort / new issue 的点击前后证据
- 行点击与 issue 详情入口证据
- 真实业务网络请求摘要

## 下一步最小动作

优先改做 **page websocket / CDP 的只读页面级证据补抓**，直接针对 target id `81A3713C33BCA35B2A0B8C7D177F43AD` 尝试读 DOM / 页面状态；仅当 browser 侧 metadata 也不可读时，才再次回退到纯可达性探测。
