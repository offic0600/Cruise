     1|# Linear 接口目录（草稿）
     2|
## Issue detail：当前只读排查结果（CAP-07）

2026-04-19 11:24–11:29 CST 已确认可通过低层无 `Origin` 连接方式直接附着 issue detail page target `81A3713C33BCA35B2A0B8C7D177F43AD`，并读取 authenticated 页面正文、主分区与属性栏层次；但**真实业务 Network 事件流**与 screenshot/控件级入口枚举仍未开始持续采集，因此当前同样只分为“已确认”和“待确认”两类。

### 已确认

| 页面 | 请求类型 | 接口/操作名 | 用途 | 备注 |
|---|---|---|---|---|
| Issue detail (`CLE-28`) | DevTools target metadata | `GET /json/list` | 确认当前调试页目标、title、url、page websocket 地址 | 11:24 与 11:29 CST 两次 page websocket 读取均指向 issue detail 页：title=`CLE-28 Views 页面补齐创建/编辑/删除与状态反馈`，url=`https://linear.app/cleantrack/issue/CLE-28/...`，page websocket target id=`81A3713C33BCA35B2A0B8C7D177F43AD` |
| Issue detail (`CLE-28`) | DevTools protocol | `Page.enable` / `Runtime.enable` / `Network.enable` | 附着 authenticated detail target 并启用页面、运行时与网络事件域 | 本轮脚本已真实执行，说明 detail target 可被只读附着；但 Network 域仅 enable，尚未持续监听 |
| Issue detail (`CLE-28`) | Runtime evaluate | `Runtime.evaluate({href,title,ready,body})` | 读取页面 title / url / readyState / body 文本摘要 | 11:29 CST 复测仍返回 `ready=complete`，body 文本继续包含 breadcrumb、issue hero、parent relation、description、`Add sub-issues` / `Activity` / `Properties` 等分区 |
| Issue detail (`CLE-28`) | Runtime event | `Runtime.executionContextCreated` | 确认执行上下文 origin | 11:29 CST 继续为 `https://linear.app`，说明已位于真实 Linear authenticated 页面上下文 |
| Issue detail (`CLE-28`) | Runtime console | `Runtime.consoleAPICalled` | 捕获页面启动信号 | 11:29 CST 收到 1 条 Linear startup banner `console.log`；未见 interstitial / login 文本 |

### 待确认（真实业务请求与控件级证据）

| 页面 | 请求类型 | 接口/操作名 | 用途 | 备注 |
|---|---|---|---|---|
| Issue detail (`CLE-28`) | 待抓包 | `Network.requestWillBeSent` / `responseReceived` / `loadingFinished` | 沉淀 issue detail 文档请求、GraphQL/internal API、静态资源与可能的 subscription 请求 | page websocket 已可 attach 且 `Network.enable` 成功，但本轮仍未开始持续监听事件流 |
| Issue detail (`CLE-28`) | 待截图 | `Page.captureScreenshot` | 沉淀默认态双栏布局、hero、description、activity、properties rail 的视觉证据 | 本轮未做，仍是 CAP-07 主要缺口 |
| Issue detail (`CLE-28`) | 待枚举 | 主要操作入口/控件清单 | 回写 hero CTA、右栏字段入口、activity 区入口等可见控件级证据 | 目前只完成页面级 body 文本读取，尚未形成控件级 inventory |

## Active issues：当前只读排查结果

当前已确认可通过低层无 `Origin` 连接方式接入 page/browser websocket，并完成 Runtime / Page 级只读验证；但**真实业务 Network 事件流**仍未开始持续采集，因此以下内容分为“已确认”和“待确认”两类。

     7|### 已确认
     8|
     9|| 页面 | 请求类型 | 接口/操作名 | 用途 | 备注 |
    10||---|---|---|---|---|
    11|| Active issues | DevTools target metadata | `GET /json/list` | 确认当前调试页目标、title、url、page websocket 地址 | 本轮再次验证返回 200，当前 target=`Cleantrack › Active issues`，url=`https://linear.app/cleantrack/team/CLE/active`，page websocket=`ws://127.0.0.1:9222/devtools/page/81A3713C33BCA35B2A0B8C7D177F43AD` |
    12|| Active issues | DevTools browser metadata | `GET /json/version` | 确认 Chrome/Protocol 版本与 browser websocket 地址 | 本轮再次验证返回 200；Browser=`Chrome/147.0.7727.56`，Protocol-Version=`1.3`，browser websocket=`ws://127.0.0.1:9222/devtools/browser/1cb02d1f-3fe5-4829-836a-275b4e10b506` |
    13|| Active issues | DevTools protocol | `GET /json/protocol` | 获取 CDP domain 定义，用于后续 Network/Page/Runtime 抓取 | 既有文档已验证返回 200，本轮未重复拉取，当前可继续沿用 |
    14|
    15|### 待确认（真实业务请求）
    16|
    17|| 页面 | 请求类型 | 接口/操作名 | 用途 | 备注 |
    18||---|---|---|---|---|
    19|| Active issues | 待抓包 | Linear GraphQL / internal API（未知） | 获取 issue 列表、团队上下文、过滤/排序/分组数据 | page websocket 已可连接并执行 `Network.enable`，但尚未开始持续监听 `Network.requestWillBeSent` |
    20|| Active issues | 待抓包 | 静态资源请求（JS/CSS/字体/图片） | 页面渲染资源加载 | page websocket 已恢复可用，但未抓到事件流 |
    21|| Active issues | 待抓包 | 可能的 realtime / subscription 请求 | issue 列表实时更新、通知或协同状态 | page websocket 已恢复可用，但未抓到事件流 |
    22|
    23|## 当前结论
    24|
    25|- 历史上曾验证过 9222 的 **HTTP 元信息层可用**：`json/version` / `json/list` / `json/protocol` 均有过 200 成功样本
- 2026-04-19 10:01 CST 的最新最小复测表明：**9222 metadata 当前仍处于 browser-readable / terminal-502 discrepancy**；browser 侧本轮再次可直接读取 `http://127.0.0.1:9222/json/list`，并继续枚举到 6 个 live page targets + 1 个 worker target，而 terminal 直连 `http://127.0.0.1:9222/json/version` 与 `/json/list` 继续都返回 `502 Bad Gateway`
- 本轮进一步补强的页面级验证表明：Hermes browser 真正导航到 `https://linear.app/cleantrack/team/CLE/active` 时，仍先落到 `Link opened in the Linear app` 中转页，标题继续为 `Linear`，可见 CTA 仍只有 `Open here instead` 与 `Learn more`（href=`https://linear.app/docs/get-the-app?noRedirect=1#collapsible-59bc5eaf9fe7`），且未见 CAPTCHA 或额外登录控件；本轮再次显式点击 `Open here instead` 后，URL 仍停留在目标 deep link，但可见页面稳定变为 `Log in to Linear` 登录方式选择页，仍有 4 个登录入口（Google / email / SAML SSO / passkey）及 `Sign up` / `learn more` 辅助链接，DOM iframe 探测仍为空，说明**当前阻塞仍应继续精确归类为 authenticated page/session reuse failure**。本轮已把最新状态落盘到 `docs/linear-parity/flows/active-issues-auth-session-blocker-2026-04-19-1001.md` 与 `docs/linear-parity/har/2026-04-19-1001-browser-terminal-metadata-discrepancy-and-auth-blocked.json`
    29|- 已验证的历史 page/browser 调用仍包括：`Browser.getVersion`、`Runtime.evaluate("document.title")`、`Runtime.evaluate("location.href")`、`Page.enable`、`Network.enable`、`Page.captureScreenshot`
    30|- 已确认的历史页面事实仍保持：Active issues 页 title=`Cleantrack › Active issues`，url=`https://linear.app/cleantrack/team/CLE/active`，并已有截图证据 `docs/linear-parity/evidence/active-issues-cdp.png`
    31|- 当前未完成项应重新表述为：**CAP-06 当前被“认证会话不可复用”阻塞；待能稳定复用本地已登录 Linear Web 会话后，再继续补真实请求清单与控件级证据**
    32|
## 下一步建议

1. Capture lane：继续只读推进 page target 的持续监听脚本，直接订阅并沉淀：
   - `Network.requestWillBeSent`
   - `Network.responseReceived`
   - `Network.loadingFinished`
2. 首轮只沉淀 Active issues 的：
   - 文档请求
   - GraphQL / API 请求
   - realtime / websocket / SSE 请求
   - 关键静态资源域名
3. Implementation lane：在 CAP-07 authenticated detail evidence 恢复前，下一批最小 UI parity 明确收敛为 issue detail route shell / 双栏骨架 / 版式占位层级；优先细化 `IssueDetailPage` 的 hero、主内容/评论区、右侧属性栏、activity/doc/relations 占位，并统一 route shell 空态/返回 CTA 与加载骨架的 spacing / card chrome / badge 文案；relations、activity 等真实控件级行为对标继续挂起。
