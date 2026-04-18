# Active issues 认证会话阻塞复测（2026-04-18 22:09:34 CST）

## 目标

对 `https://linear.app/cleantrack/team/CLE/active` 再做一次最小只读复测，确认当前 9222 metadata 可读性与真实已登录页面复用状态是否恢复，并为 CAP-06 继续补充阻塞证据。

## 本轮探测方法

1. 终端直连探测：`http://127.0.0.1:9222/json/version`、`/json/list`
2. Hermes browser 读取：`http://127.0.0.1:9222/json/version`、`/json/list`
3. Hermes browser 深链打开：`https://linear.app/cleantrack/team/CLE/active`
4. 在中转页点击一次 `Open here instead`，观察是否能进入真实 Active issues 已登录页

## 结果摘要

### A. metadata 探测仍是 browser/terminal 分裂态

- 终端直连 `/json/version`：`502 Bad Gateway`
- 终端直连 `/json/list`：`502 Bad Gateway`
- Hermes browser 读取 `/json/version`：成功，返回 `Chrome/147.0.7727.56`、Protocol `1.3`
- Hermes browser 读取 `/json/list`：成功，且仍能枚举到 Linear target：
  - `id`: `81A3713C33BCA35B2A0B8C7D177F43AD`
  - `title`: `Cleantrack › Active issues`
  - `url`: `https://linear.app/cleantrack/team/CLE/active`

### B. 真实页面仍不可复用已登录会话

#### B1. 深链打开首屏

- URL：`https://linear.app/cleantrack/team/CLE/active`
- 页面标题：`Linear`
- 主文案：`Link opened in the Linear app`
- 可见交互：
  - `Open here instead`
  - `Learn more`
- 结论：仍先进入 app-handoff 中转页，而不是真实 Active issues 列表页

截图：
- `MEDIA:/Users/liuzheng/.hermes/cache/screenshots/browser_screenshot_7ac26e07b2fe4ceea89dd79d593f35ce.png`

#### B2. 点击 `Open here instead` 后

- 页面仍保持同一 deep link URL，但内容切换为登录门页
- 主标题：`Log in to Linear`
- 可见登录入口：
  - `Continue with Google`
  - `Continue with email`
  - `Continue with SAML SSO`
  - `Log in with passkey`
  - `Sign up`
  - `learn more`
- 未见内容：
  - Active issues 顶部 tabs
  - search
  - filter
  - display
  - sort
  - new issue
  - issue rows

截图：
- `MEDIA:/Users/liuzheng/.hermes/cache/screenshots/browser_screenshot_38edb7eb2d924df493ca64036adabbed.png`

## 对 CAP-06 的影响

本轮仍无法采到 Active issues 顶部 tabs / search / filter / display / sort / new 的真实已登录控件行为。

当前应维持精确阻塞表述：

- metadata path：**仅 Hermes browser 可读**
- terminal direct probe：**仍为 502**
- authenticated page reuse：**仍 blocked**

因此 CAP-06 继续 blocked，不应误报为“9222 已恢复即可继续深取证”。

## 本轮新增稳定事实

1. `json/version` 与 `json/list` 在 Hermes browser 侧仍稳定可读。
2. 同一时间点下，终端直连 9222 两个 metadata 端点仍返回 `502 Bad Gateway`。
3. 真实 deep link 页面仍是 `app-handoff -> login gate` 路径，说明阻塞不在 target metadata 缺失，而在认证会话不可复用。

## 仍缺失的证据

- Active issues 顶部工具栏真实控件打开态
- tabs 切换前后 DOM / URL / network 摘要
- search/filter/display/sort/new 的真实已登录交互反馈
- issue row click 进入详情页的真实流程证据

## 下一步最小任务建议

若下轮 9222 / 会话状态无改善，继续优先做一次最小只读 metadata + deep link 复测，并把最新时间点落盘；不要把 browser 可读 metadata 误写成“真实已登录页面已恢复可采”。
