# Active issues 已登录会话阻塞复测（2026-04-18 22:30 CST）

## 目标

- 任务：`CAP-06` Active issues 顶部工具栏与 tabs 交互证据
- 深链：`https://linear.app/cleantrack/team/CLE/active`
- 本轮目标：在不做 Cruise 实现的前提下，再做一次最小只读复测，确认 9222 metadata 是否可读，以及真实页面是否仍被认证门页拦住。

## 本轮稳定事实

1. terminal 侧 `http://127.0.0.1:9222/json/version` 与 `/json/list` 都返回 `200`。
2. browser 侧也能读取 `/json/version` 与 `/json/list`，且继续枚举到 Linear target：
   - `id=81A3713C33BCA35B2A0B8C7D177F43AD`
   - `title=Cleantrack › Active issues`
   - `url=https://linear.app/cleantrack/team/CLE/active`
3. 直接打开 Active issues 深链时，首屏仍是 **`Link opened in the Linear app`** 中转页，而不是真实 issues 列表。
4. 点击 **`Open here instead`** 后，仍进入 **`Log in to Linear`** 登录页，不会复用已登录的 Active issues 页面。
5. 登录页本轮可见入口仅有：
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
- 截图：`/Users/liuzheng/.hermes/cache/screenshots/browser_screenshot_d886ffc02e524605ade5e8c8bded794b.png`

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
- 截图：`/Users/liuzheng/.hermes/cache/screenshots/browser_screenshot_eebcee2d1797457f84d25bd04d0951ad.png`

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

点击 `Open here instead` 后，浏览器资源条目里可见登录相关与通用前端资源，例如：

- `authenticationSessionsQuery.oMhDstY7.js`
- `ActionMenu.BgvEYPYx.js`
- `ElevatedPanel.DUuZ2ZIv.js`
- `Scrollable.DLduDSzh.js`
- `Root-CrYfb3fb.css`
- `TabsHelper.sysHtqM9.js`

本轮仅做 resource-level 只读摘要，未主张已捕获 Active issues 业务网络事件。

## 这轮补到的真实增量

- 将 CAP-06 的 blocker 从“可能是 metadata 不稳”进一步收敛为：**metadata path 已恢复双侧可读，但 authenticated page reuse 仍失败**。
- 补齐了一份新的中转页 → 登录页流程证据，附带两张新截图路径与本轮资源摘要。
- 再次确认当前仍不能继续采集 Active issues 顶部工具栏 / tabs 的真实交互证据。

## 仍缺失项

- Active issues 真页 DOM
- 顶部 tabs / search / filter / display / sort / new issue 的点击前后证据
- 行点击与 issue 详情入口证据
- 真实业务网络请求摘要

## 下一步最小动作

优先改做 **page websocket / CDP 的只读页面级证据补抓**，直接针对 target id `81A3713C33BCA35B2A0B8C7D177F43AD` 尝试读 DOM / 页面状态；不要再把时间花在重复证明 `/json/version` 是否可读上。
