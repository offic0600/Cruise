# Active issues 认证会话阻塞复测（2026-04-18 23:52 CST）

## 目标
- 页面：`Active issues`
- 深链：`https://linear.app/cleantrack/team/CLE/active`
- 任务板项：`CAP-06`（补 Active issues 顶部工具栏与 tabs 的交互证据）

## 本轮已确认的稳定事实
1. terminal 直连 `http://127.0.0.1:9222/json/version` 与 `/json/list` 再次都返回 `HTTPError 502 Bad Gateway`。
2. Hermes browser 侧同一轮仍可读取 `/json/version` 与 `/json/list`，说明 9222 当前重新回到 browser/terminal split state，而不是彻底不可达。
3. `/json/list` 仍可枚举到 Linear target：
   - title=`Cleantrack › Active issues`
   - id=`81A3713C33BCA35B2A0B8C7D177F43AD`
   - url=`https://linear.app/cleantrack/team/CLE/active`
4. `/json/list` 同时还能看到其它实时 target（如 `Codex Proxy Developer Dashboard`、GitHub commit 页面、Kimi 聊天页），说明 metadata 目录仍是活的。
5. 直接用 browser 打开目标深链时，首屏仍是 `Link opened in the Linear app` 中转页。
6. 点击 `Open here instead` 后，页面仍不是 Active issues 真页，而是 `Log in to Linear` 登录页。

## 页面级流程记录
### Step 1：直开 Active issues 深链
- 点击前 URL：无（新导航）
- 点击后 URL：`https://linear.app/cleantrack/team/CLE/active`
- 主标题：`Link opened in the Linear app`
- 可见控件：
  - `Open here instead`
  - `Learn more`
- 可见反馈：浏览器试图将链接交给 Linear 桌面应用处理
- DOM 摘要：`Link opened in the Linear app / Your browser will ask for permission to open future links in the desktop app faster. Learn more. / Open here instead`
- 证据：`/Users/liuzheng/.hermes/cache/screenshots/browser_screenshot_3ea2ee9f55964bed9cdcf4b240f7e764.png`

### Step 2：点击 `Open here instead`
- 点击前 URL：`https://linear.app/cleantrack/team/CLE/active`
- 点击后 URL：仍显示为 `https://linear.app/cleantrack/team/CLE/active`
- 页面主标题：`Log in to Linear`
- 可见控件：
  - `Continue with Google`
  - `Continue with email`
  - `Continue with SAML SSO`
  - `Log in with passkey`
  - `Sign up`
  - `learn more`
- 可见反馈：进入浏览器侧认证门页，没有任何 Active issues 顶部 tabs / search / filter / display / sort / New issue 控件
- DOM 摘要：`Log in to Linear / Continue with Google / Continue with email / Continue with SAML SSO / Log in with passkey / Don’t have an account? Sign up or learn more`
- Navigation timing：`DOMContentLoaded≈1361ms`，`load≈1744ms`
- 证据：`/Users/liuzheng/.hermes/cache/screenshots/browser_screenshot_1e6ee0a69b8b4237be1543b137ec823f.png`

## 阻塞结论
当前 blocker 仍应精确表述为：
- **metadata split state + authenticated page/session reuse failure**
- 即使 `/json/list` 继续暴露已登录 Linear page target，Hermes browser 也不能直接复用到该 target 的已登录 DOM；浏览器落地路径仍是中转页 → 登录页。

## 本轮仍缺失的证据
- Active issues 真页顶部 tabs / search / filter / display / sort / new 按钮
- 列表行 hover / click / issue detail 入口
- issue detail 页面模块结构
- issue create / edit 打开态与校验态

## 下一步最小任务
优先继续围绕 `CAP-06` 做一次 **page websocket / CDP read-only capture** 尝试，直接针对 `81A3713C33BCA35B2A0B8C7D177F43AD` 验证是否还能读取已登录 DOM / Network 事件；若仍失败，再把 blocker 文案统一收敛为“browser metadata 仍活，但 authenticated page reuse blocked”。
