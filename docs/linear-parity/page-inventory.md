# Linear 页面盘点

| 页面 | 路由示例 | 状态 | 备注 |
|---|---|---|---|
| Active issues | `/cleantrack/team/CLE/active` | 采集中（当前被“已登录会话不可复用”阻塞） | 已存在历史页面级截图/DOM/网络样本；10:01 CST 最小复测确认：browser 侧 `http://127.0.0.1:9222/json/list` 仍可读，并继续枚举到 6 个 live page targets + 1 个 worker target，其中 Linear target 仍为 `Cleantrack › Active issues`（id=`81A3713C33BCA35B2A0B8C7D177F43AD`，page websocket=`ws://127.0.0.1:9222/devtools/page/81A3713C33BCA35B2A0B8C7D177F43AD`）；与此同时 terminal 直连 `http://127.0.0.1:9222/json/version` 与 `/json/list` 本轮继续都返回 `502 Bad Gateway`，因此 metadata 状态继续维持 browser-readable / terminal-502 discrepancy。真实打开目标页时，页面仍先落到 `Link opened in the Linear app` 中转页，标题仍为 `Linear`，可见 CTA 仍只有 `Open here instead` 与 `Learn more`（href=`https://linear.app/docs/get-the-app?noRedirect=1#collapsible-59bc5eaf9fe7`），且未见 CAPTCHA 或 iframe；本轮再次通过显式元素点击确认：`Open here instead` 会稳定进入 `Log in to Linear` 登录页。因此当前 blocker 继续精确归类为 authenticated page/session reuse failure。对 implementation lane 的直接反哺是：在 CAP-07 详情页证据到位前，issue detail 只适合继续推进 route shell / 双栏骨架 / 版式占位层级的最小 UI parity，而不应提前展开真实控件行为对标。最新证据：`docs/linear-parity/flows/active-issues-auth-session-blocker-2026-04-19-1001.md`、`docs/linear-parity/har/2026-04-19-1001-browser-terminal-metadata-discrepancy-and-auth-blocked.json` |
| Issue 详情 | `/cleantrack/issue/CLE-28/...` | 采集中 | 2026-04-19 11:24 CST 已通过 page websocket / CDP 直接读取到 `CLE-28 Views 页面补齐创建/编辑/删除与状态反馈` 页面级正文；已确认可见全局导航、breadcrumb、issue hero、parent relation、描述正文、`Add sub-issues` / `Activity` / `Properties` 等主要分区，以及右侧属性栏中的 `Todo` / `High` / assignee / labels / project 信息。当前仍缺默认态截图、控件级入口枚举与网络摘要。证据：`docs/linear-parity/flows/issue-detail-page-cdp-snapshot-2026-04-19-1124.md` |
| Projects | - | 待采集 | |
| Roadmap | - | 待采集 | |
| Cycles | - | 待采集 | |
| Inbox | - | 待采集 | |
| Settings（必要子集） | - | 待采集 | |
