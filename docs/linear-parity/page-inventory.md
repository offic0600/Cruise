# Linear 页面盘点

| 页面 | 路由示例 | 状态 | 备注 |
|---|---|---|---|
| Active issues | `/cleantrack/team/CLE/active` | 采集中（当前被“已登录会话不可复用”阻塞） | 已有历史页面级截图/DOM/网络样本；23:52 CST 最小复测确认：terminal 直连 `9222` 的 `/json/version` 与 `/json/list` 再次都回到 `502 Bad Gateway`，但 Hermes browser 仍可读取同一组 metadata，并继续读到 target=`Cleantrack › Active issues`（id=`81A3713C33BCA35B2A0B8C7D177F43AD`）；`/json/list` 同时还能看到 `Codex Proxy Developer Dashboard`、GitHub commit 页面、Kimi 聊天页等其它实时 target，说明 metadata 目录仍是活的。真正打开目标页时仍先落到 `Link opened in the Linear app` 中转页，点击 `Open here instead` 后进入 `Log in to Linear` 登录页，且仅见 Google/email/SAML SSO/passkey 登录入口，仍无法进入真实已登录列表页。见 `flows/active-issues-auth-session-blocker-2026-04-18-235241.md` 与 `har/2026-04-18-235241-browser-terminal-metadata-discrepancy.json` |
| Issue 详情 | - | 待采集 | |
| Projects | - | 待采集 | |
| Roadmap | - | 待采集 | |
| Cycles | - | 待采集 | |
| Inbox | - | 待采集 | |
| Settings（必要子集） | - | 待采集 | |
