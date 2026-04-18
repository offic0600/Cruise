# Active issues 已登录会话复用阻塞记录（2026-04-18 20:42 CST）

## 目标

继续推进 CAP-06：基于本地已登录的 Linear Chrome 9222 会话，采集 `Active issues` 顶部 tabs / search / filter / display / sort / new issue 的真实只读交互证据。

## 本轮最小探测

### 1. metadata 最小复测
- 终端直接探测：`http://127.0.0.1:9222/json/version`、`http://127.0.0.1:9222/json/list`
- Hermes browser 探测：导航 `http://127.0.0.1:9222/json/version` 与 `http://127.0.0.1:9222/json/list`

### 2. 真实页面可复用性再验证
- 浏览器导航：`https://linear.app/cleantrack/team/CLE/active`
- 页面 1：`Link opened in the Linear app` 中转页
- 点击动作：`Open here instead`
- 页面 2：`Log in to Linear` 登录方式选择页

## 结果

### metadata 探测结果
| 探测方式 | `/json/version` | `/json/list` | 结论 |
|---|---|---|---|
| 终端 HTTP probe | `502 Bad Gateway` | `502 Bad Gateway` | 终端链路本轮仍不稳定 |
| 浏览器 probe | 200，可读 | 200，可读 | 浏览器链路可读，且能读到 Linear target metadata |

### 本轮确认的 browser-side metadata
- Browser：`Chrome/147.0.7727.56`
- Protocol-Version：`1.3`
- Browser websocket：`ws://127.0.0.1:9222/devtools/browser/1cb02d1f-3fe5-4829-836a-275b4e10b506`
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

- 本轮新增的重要事实是：**browser 仍可读 9222 metadata，但终端直连再次回到 502；与此同时 Hermes browser 仍不能复用真实已登录 Linear Web 会话**。
- 当前 CAP-06 的 blocker 继续是：**打开目标 URL 时会先进入桌面端中转页，再落到登录页，无法进入已登录 Active issues 真页**。
- 因此本轮仍不能继续做顶部 tabs / search / filter / display / sort / new 的真实控件级只读采集。

## 当前已新增的真实证据

- 新增一组 20:42 的 browser/version 与 browser/list metadata 读数
- 再次确认当前页面级 fallback 路径仍为：`中转页 → 点击 Open here instead → 登录页`
- 明确记录本轮链路分裂状态：`browser metadata 可读` vs `terminal probe 502`

## 证据文件

- `docs/linear-parity/har/2026-04-18-204203-browser-terminal-metadata-discrepancy.json`
- `MEDIA:/Users/liuzheng/.hermes/cache/screenshots/browser_screenshot_d2fe94bae4b44ef3bf73e4141faca2e5.png`
- `MEDIA:/Users/liuzheng/.hermes/cache/screenshots/browser_screenshot_9844cc1afab04a3bb6959ddbd2cfc72b.png`

## 仍缺失项

- 已登录 `Active issues` 真页的 DOM、顶部 tabs、toolbar controls 与列表行交互证据
- 基于真实已登录页面的网络请求摘要
- issue 详情页、创建/编辑流的页面级只读证据

## 下一步最小动作

优先继续验证是否存在可绕过 browser 会话复用、直接附着到 `ws://127.0.0.1:9222/devtools/page/81A3713C33BCA35B2A0B8C7D177F43AD` 的只读 DOM/截图路径；若仍无法继承认证态，则把 CAP-06 明确拆成“page websocket 只读采集”与“browser 会话复用”两条独立前置条件。
