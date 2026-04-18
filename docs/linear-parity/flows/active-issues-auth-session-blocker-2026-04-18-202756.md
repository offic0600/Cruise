# Active issues 已登录会话复用阻塞记录（2026-04-18 20:27 CST）

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
| 终端 HTTP probe | `200 OK` | `200 OK` | 终端链路本轮已恢复可读 |
| 浏览器 probe | 未单独再次读 `/json/version` | 200，可读 | 浏览器链路可读，且能读到 Linear target metadata |

### 本轮确认的稳定 metadata
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

- 本轮新增的重要事实不是“9222 又挂了”，而是：**9222 metadata 已恢复可由终端与浏览器同时读取，但 Hermes browser 仍不能复用真实已登录 Linear Web 会话**。
- 当前 CAP-06 的 blocker 继续是：**打开目标 URL 时会先进入桌面端中转页，再落到登录页，无法进入已登录 Active issues 真页**。
- 因此本轮仍不能继续做顶部 tabs / search / filter / display / sort / new 的真实控件级只读采集。

## 当前已新增的真实证据

- 终端与浏览器两侧都重新确认了 9222 metadata 可读
- 新增了 browser/version 与 page websocket 的恢复态记录
- 再次确认当前页面级 fallback 路径仍为：`中转页 → 点击 Open here instead → 登录页`

## 证据文件

- `docs/linear-parity/har/2026-04-18-202756-browser-terminal-metadata-recovery.json`
- `MEDIA:/Users/liuzheng/.hermes/cache/screenshots/browser_screenshot_ff338b69160b479a9a22084cb9f136cd.png`
- `MEDIA:/Users/liuzheng/.hermes/cache/screenshots/browser_screenshot_93988b865f6743b2a98026eeb2570f01.png`

## 仍缺失项

- 已登录 `Active issues` 真页的 DOM、顶部 tabs、toolbar controls 与列表行交互证据
- 基于真实已登录页面的网络请求摘要
- issue 详情页、创建/编辑流的页面级只读证据

## 下一步最小动作

优先利用本轮已恢复的 `/json/version` 与 `/json/list` 可读性，继续验证是否存在可直接附着到目标 page websocket 的只读 DOM/截图路径；若仍无法继承认证态，再把 CAP-06 明确拆成“websocket 级只读捕获”和“browser 级会话复用”两条独立前置条件。