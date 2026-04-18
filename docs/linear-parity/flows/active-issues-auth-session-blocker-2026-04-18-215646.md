# Active issues 会话阻塞复测（2026-04-18 21:56:46 CST）

## 目标
- 继续验证 CAP-06：当前 Hermes browser 是否能复用本地已登录 Linear Active issues 页面。
- 在只读前提下记录 browser/terminal 对 9222 的分裂态，以及真实页面是否仍然落到中转页 / 登录页。

## 探测结果

### 1. 9222 metadata 探测
| 探测方式 | 端点 | 结果 |
|---|---|---|
| terminal | `http://127.0.0.1:9222/json/version` | `502 Bad Gateway` |
| terminal | `http://127.0.0.1:9222/json/list` | `502 Bad Gateway` |
| Hermes browser | `/json/list` | 仍可枚举到 `Cleantrack › Active issues` target，page id=`81A3713C33BCA35B2A0B8C7D177F43AD`，page websocket=`ws://127.0.0.1:9222/devtools/page/81A3713C33BCA35B2A0B8C7D177F43AD` |

### 2. 深链页面复用
入口 URL：`https://linear.app/cleantrack/team/CLE/active`

#### 首屏
- 页面标题：`Linear`
- 可见主文案：`Link opened in the Linear app`
- 可见说明：`Your browser will ask for permission to open future links in the desktop app faster. Learn more.`
- 可见控件：
  - `Open here instead`
  - `Learn more`
- 结论：仍是桌面端 app handoff 中转页，不是已登录 Active issues 真页。

#### 点击 `Open here instead` 后
- URL 仍显示：`https://linear.app/cleantrack/team/CLE/active`
- 页面标题：`Linear`
- 页面变为：`Log in to Linear`
- 可见登录入口：
  - `Continue with Google`
  - `Continue with email`
  - `Continue with SAML SSO`
  - `Log in with passkey`
- 额外链接：`Sign up`、`learn more`
- 验证挑战：当前页面未见 CAPTCHA 或其他可见人机验证
- 结论：浏览器 fallback 已进入认证门页，仍未复用到已登录 Active issues 页面。

## 截图证据
- 中转页：`/Users/liuzheng/.hermes/cache/screenshots/browser_screenshot_24b9594c68494174a10ff5ef18e25280.png`
- 登录页：`/Users/liuzheng/.hermes/cache/screenshots/browser_screenshot_c453558f7c6c439c8afd3e07d3951062.png`

## 当前能确认的事实
1. `9222` metadata 路径在 Hermes browser 里仍可用，但终端直连仍是 `502`。
2. `json/list` 里仍保留 Active issues 目标页 metadata，说明目标 tab 仍存在于本地 Chrome 会话中。
3. 直接浏览器打开目标 URL 仍不会进入该已登录 tab，而是先到 app handoff 中转页，再到 Linear 登录页。
4. 因此 CAP-06 当前 blocker 仍然是：**authenticated page reuse 失败，而不是 target metadata 完全丢失**。

## 本轮仍缺失
- 已登录 Active issues 真页顶部 tabs / search / filter / display / sort / new 的点击前后证据
- 列表行点击进入 issue 详情页的只读取证
- 任何 issue 创建/编辑入口的打开态证据

## 下一步建议
- 如果后续 run 仍无法复用已登录页，继续把 metadata 与认证态分裂状态按时间点落盘，不再把 `/json/list` 200 误判为“采集恢复”。
- 一旦能进入真实已登录 Active issues 列表页，优先补顶部工具栏逐控件证据，继续推进 CAP-06。
