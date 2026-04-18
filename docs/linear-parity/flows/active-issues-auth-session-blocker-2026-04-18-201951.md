# Active issues 已登录会话复用阻塞记录（2026-04-18 20:19 CST）

## 目标

继续推进 CAP-06：基于本地已登录的 Linear Chrome 9222 会话，采集 `Active issues` 顶部 tabs / search / filter / display / sort / new issue 的真实只读交互证据。

## 本轮最小探测

### 1. metadata 再次复测
- 终端直接探测：`http://127.0.0.1:9222/json/version`、`http://127.0.0.1:9222/json/list`
- Hermes browser 探测：导航 `http://127.0.0.1:9222/json/list`，确认目标 target 仍存在

### 2. 真实页面可复用性再验证
- 浏览器导航：`https://linear.app/cleantrack/team/CLE/active`
- 页面 1：`Link opened in the Linear app` 中转页
- 点击动作：`Open here instead`
- 页面 2：`Log in to Linear` 登录方式选择页

## 结果

### metadata 探测结果
| 探测方式 | `/json/version` | `/json/list` | 结论 |
|---|---|---|---|
| 终端 HTTP probe | `502 Bad Gateway` | `502 Bad Gateway` | 终端链路仍不稳定 |
| 浏览器 probe | 未单独再次读 `/json/version` | 200，可读 | 浏览器链路可读，且能读到 Linear target metadata |

### 浏览器 probe 读到的稳定 metadata
- Linear target id：`81A3713C33BCA35B2A0B8C7D177F43AD`
- Linear target title：`Cleantrack › Active issues`
- Linear target url：`https://linear.app/cleantrack/team/CLE/active`
- Linear page websocket：`ws://127.0.0.1:9222/devtools/page/81A3713C33BCA35B2A0B8C7D177F43AD`

### 真实页面复用结果
| 步骤 | URL | 观察 |
|---|---|---|
| 直接打开 `https://linear.app/cleantrack/team/CLE/active` | `https://linear.app/cleantrack/team/CLE/active` | 进入 `Link opened in the Linear app` 中转页 |
| 点击 `Open here instead` | URL 仍为 `https://linear.app/cleantrack/team/CLE/active` | 进入 `Log in to Linear` 登录方式选择页 |
| 是否进入已登录 Active issues 列表 | - | 否 |

### 登录页可见反馈
- 标题：`Log in to Linear`
- 可见登录入口：`Continue with Google`、`Continue with email`、`Continue with SAML SSO`、`Log in with passkey`
- 未出现 issue 列表、顶部 tabs、filter、display、sort、new issue 等已登录页面控件

## 当前判断

- 本轮再次确认：**浏览器可读 metadata，不代表 Hermes browser 可复用真实已登录 Linear Web 会话**。
- 当前 CAP-06 的 blocker 不是 target metadata 缺失，而是：**Hermes browser 打开目标 URL 时会先进入桌面端中转页，再落到登录页，无法进入已登录 Active issues 真页**。
- 因此本轮仍不能继续做顶部 tabs / search / filter / display / sort / new 的真实控件级只读采集。

## 当前被阻塞的内容

- Active issues 顶部 tabs 的点击前后 URL / DOM / visible feedback 取证
- Search / Filter / Display / Sort / New issue 的 open state / DOM 变化 / 截图采集
- 真实已登录页面上的网络请求摘要补全

## 当前已新增的真实证据

- 再次确认终端与浏览器对 9222 元信息 endpoint 的链路分歧仍存在
- 再次确认当前准确的 Linear target metadata 仍稳定存在于 `/json/list`
- 新增了本轮页面级 fallback 路径证据：`中转页 → 点击 Open here instead → 登录页`

## 证据文件

- `docs/linear-parity/har/2026-04-18-201951-browser-terminal-metadata-discrepancy.json`
- `MEDIA:/Users/liuzheng/.hermes/cache/screenshots/browser_screenshot_797dd011f50d479dba7da214e52bfc1e.png`
- `MEDIA:/Users/liuzheng/.hermes/cache/screenshots/browser_screenshot_a49141b2c4a240949bf5939d66f9ef3a.png`

## 下一步最小动作

优先解决“如何让 Hermes browser 直接复用本地已登录的 Linear Chrome 会话”这一前置问题；一旦能稳定进入真实 `Active issues` 列表页，就恢复 CAP-06，并先采一组最小控件（tabs + search）。
