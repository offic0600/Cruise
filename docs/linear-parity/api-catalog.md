# Linear 接口目录（草稿）

## Active issues：当前只读排查结果

当前已确认可通过低层无 `Origin` 连接方式接入 page/browser websocket，并完成 Runtime / Page 级只读验证；但**真实业务 Network 事件流**仍未开始持续采集，因此以下内容分为“已确认”和“待确认”两类。

### 已确认

| 页面 | 请求类型 | 接口/操作名 | 用途 | 备注 |
|---|---|---|---|---|
| Active issues | DevTools target metadata | `GET /json/list` | 确认当前调试页目标、title、url、page websocket 地址 | 本轮再次验证返回 200，当前 target=`Cleantrack › Active issues`，url=`https://linear.app/cleantrack/team/CLE/active`，page websocket=`ws://127.0.0.1:9222/devtools/page/81A3713C33BCA35B2A0B8C7D177F43AD` |
| Active issues | DevTools browser metadata | `GET /json/version` | 确认 Chrome/Protocol 版本与 browser websocket 地址 | 本轮再次验证返回 200；Browser=`Chrome/147.0.7727.56`，Protocol-Version=`1.3`，browser websocket=`ws://127.0.0.1:9222/devtools/browser/1cb02d1f-3fe5-4829-836a-275b4e10b506` |
| Active issues | DevTools protocol | `GET /json/protocol` | 获取 CDP domain 定义，用于后续 Network/Page/Runtime 抓取 | 既有文档已验证返回 200，本轮未重复拉取，当前可继续沿用 |

### 待确认（真实业务请求）

| 页面 | 请求类型 | 接口/操作名 | 用途 | 备注 |
|---|---|---|---|---|
| Active issues | 待抓包 | Linear GraphQL / internal API（未知） | 获取 issue 列表、团队上下文、过滤/排序/分组数据 | page websocket 已可连接并执行 `Network.enable`，但尚未开始持续监听 `Network.requestWillBeSent` |
| Active issues | 待抓包 | 静态资源请求（JS/CSS/字体/图片） | 页面渲染资源加载 | page websocket 已恢复可用，但未抓到事件流 |
| Active issues | 待抓包 | 可能的 realtime / subscription 请求 | issue 列表实时更新、通知或协同状态 | page websocket 已恢复可用，但未抓到事件流 |

## 当前结论

- 历史上曾验证过 9222 的 **HTTP 元信息层可用**：`json/version` / `json/list` / `json/protocol` 均有过 200 成功样本
- 2026-04-18 23:05 CST 的最新最小复测表明：**terminal 与 Hermes browser 对 9222 已恢复为双侧可读** —— terminal 直连 `/json/version` 与 `/json/list` 当前都返回 `HTTP/1.1 200 OK`，Hermes browser 侧也仍可读取二者并继续枚举到 Linear target
- 本轮 browser/terminal probe 已再次确认：Linear target id=`81A3713C33BCA35B2A0B8C7D177F43AD`、title=`Cleantrack › Active issues`、url=`https://linear.app/cleantrack/team/CLE/active`、page websocket=`ws://127.0.0.1:9222/devtools/page/81A3713C33BCA35B2A0B8C7D177F43AD`；同时 `/json/list` 还可见 `Codex Proxy Developer Dashboard`、GitHub commit 页面等其它目标，说明 metadata 目录当前为实时可读状态
- 进一步的页面级验证表明：Hermes browser 真正导航到 `https://linear.app/cleantrack/team/CLE/active` 时，仍先落到 `Link opened in the Linear app` 中转页；点击 `Open here instead` 后仍进入 `Log in to Linear` 登录方式选择页，说明**当前阻塞已可明确归类为已登录 Linear Web 会话不可复用**，不再是 metadata 端点不可达；本轮已把最新 recovery state 与中转页→登录页路径落盘到 `docs/linear-parity/flows/active-issues-auth-session-blocker-2026-04-18-2305.md` 与 `docs/linear-parity/har/2026-04-18-2305-active-issues-auth-gate-reprobe.json`
- 已验证的历史 page/browser 调用仍包括：`Browser.getVersion`、`Runtime.evaluate("document.title")`、`Runtime.evaluate("location.href")`、`Page.enable`、`Network.enable`、`Page.captureScreenshot`
- 已确认的历史页面事实仍保持：Active issues 页 title=`Cleantrack › Active issues`，url=`https://linear.app/cleantrack/team/CLE/active`，并已有截图证据 `docs/linear-parity/evidence/active-issues-cdp.png`
- 当前未完成项应重新表述为：**CAP-06 当前被“认证会话不可复用”阻塞；待能稳定复用本地已登录 Linear Web 会话后，再继续补真实请求清单与控件级证据**

## 下一步建议

1. 继续只读推进 page target 的持续监听脚本，直接订阅并沉淀：
   - `Network.requestWillBeSent`
   - `Network.responseReceived`
   - `Network.loadingFinished`
2. 首轮只沉淀 Active issues 的：
   - 文档请求
   - GraphQL / API 请求
   - realtime / websocket / SSE 请求
   - 关键静态资源域名
