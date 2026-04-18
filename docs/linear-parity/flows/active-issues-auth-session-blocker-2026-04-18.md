# Active issues 已登录会话复用阻塞记录（2026-04-18 19:58 CST）

## 目标

继续推进 CAP-06：基于本地已登录的 Linear Chrome 9222 会话，采集 `Active issues` 顶部 tabs / search / filter / display / sort / new issue 的真实只读交互证据。

## 本轮最小探测

### 1. metadata 稳定性复测
- 终端直接探测：`http://127.0.0.1:9222/json/version`、`http://127.0.0.1:9222/json/list`
- 浏览器探测：直接导航同一组 9222 元信息 endpoint，并读取页面正文

### 2. 真实页面可复用性复测
- 浏览器导航：`https://linear.app/cleantrack/team/CLE/active`
- 交互：点击 `Open here instead`
- 观察是否进入已登录的 Linear Web `Active issues` 列表页

## 结果

### metadata 探测结果
| 探测方式 | `/json/version` | `/json/list` | 结论 |
|---|---|---|---|
| 终端 HTTP probe | `502 Bad Gateway` | `502 Bad Gateway` | 终端链路仍不稳定 |
| 浏览器 probe | 200，可读 | 200，可读 | 浏览器链路可读，且能读到 Linear target metadata |

### 浏览器 probe 读到的稳定 metadata
- Browser：`Chrome/147.0.7727.56`
- Protocol-Version：`1.3`
- browser websocket：`ws://127.0.0.1:9222/devtools/browser/1cb02d1f-3fe5-4829-836a-275b4e10b506`
- Linear target id：`81A3713C33BCA35B2A0B8C7D177F43AD`
- Linear target title：`Cleantrack › Active issues`
- Linear target url：`https://linear.app/cleantrack/team/CLE/active`
- Linear page websocket：`ws://127.0.0.1:9222/devtools/page/81A3713C33BCA35B2A0B8C7D177F43AD`

### 真实页面复用结果
| 步骤 | 观察 |
|---|---|
| 直接打开 `https://linear.app/cleantrack/team/CLE/active` | 先进入 `Link opened in the Linear app` 中转页 |
| 点击 `Open here instead` | 进入 `Log in to Linear` 登录页 |
| 是否进入已登录 Active issues 列表 | 否 |

## 当前判断

- 本轮不再是“完全拿不到 9222 metadata”，而是出现了**终端 probe 失败、浏览器 probe 成功**的链路分歧。
- 即使拿到了准确 target metadata，Hermes browser 自动化当前也**没有复用到本地已登录的 Linear Web 会话**。
- 因此 CAP-06 当前真正的 blocker 已从“纯 metadata 不可读”升级/转化为：**认证会话不可复用，导致无法在真实已登录 Active issues 页面上做控件级只读采集**。

## 当前被阻塞的内容

- Active issues 顶部 tabs 的点击前后 URL / DOM / visible feedback 取证
- Search / Filter / Display / Sort / New issue 的 open state / DOM 变化 / 截图采集
- 真实已登录页面上的网络请求摘要补全

## 当前已新增的真实证据

- 记录了终端与浏览器对 9222 元信息 endpoint 的读数分歧
- 记录了当前准确的 browser/page websocket 与 Linear target metadata
- 记录了 Hermes browser 打开目标页时实际落到“桌面端中转页 → 登录页”的会话复用失败路径

## 证据文件

- `docs/linear-parity/har/2026-04-18-195804-browser-terminal-metadata-discrepancy.json`
- `MEDIA:/Users/liuzheng/.hermes/cache/screenshots/browser_screenshot_5fd7bb5742ef4affa7b403cdaf4c5c0e.png`
- `MEDIA:/Users/liuzheng/.hermes/cache/screenshots/browser_screenshot_588fd5a9f4094807b734976e0ea022fa.png`

## 下一步最小动作

优先先解决“如何让 Hermes browser 复用本地已登录 Linear Chrome 会话”这一前置问题；只要能稳定进入已登录的 `Active issues` 真页，就立即恢复 CAP-06，并先采一组最小控件（tabs + search）。
