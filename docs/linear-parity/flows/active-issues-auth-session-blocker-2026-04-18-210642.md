# Active issues 认证会话阻塞复测（2026-04-18 21:06:42 CST）

## 目标

对 `https://linear.app/cleantrack/team/CLE/active` 再执行一次最小只读复测，确认当前是否已能复用本地已登录 Linear 会话，或仍停留在 metadata 可读但真实页面认证态不可复用的分裂状态。

## 复测结果

- Hermes browser 仍可直接读取：
  - `http://127.0.0.1:9222/json/version`
  - `http://127.0.0.1:9222/json/list`
- 终端直连同一 9222 metadata 端点仍返回：
  - `/json/version` → `502 Bad Gateway`
  - `/json/list` → `502 Bad Gateway`
- `/json/list` 中仍可枚举到 Linear target：
  - title: `Cleantrack › Active issues`
  - url: `https://linear.app/cleantrack/team/CLE/active`
  - target id: `81A3713C33BCA35B2A0B8C7D177F43AD`

## 页面流程

### 1. 直接打开目标深链
- URL：`https://linear.app/cleantrack/team/CLE/active`
- 首屏标题：`Linear`
- 首屏可见文案：
  - `Link opened in the Linear app`
  - `Your browser will ask for permission to open future links in the desktop app faster. Learn more.`
  - `Open here instead`
- 判定：仍先落到 Linear 桌面端 deeplink 中转页，而非已登录的 Active issues 真页。

### 2. 点击 `Open here instead`
- 点击前 URL：`https://linear.app/cleantrack/team/CLE/active`
- 点击后 URL：`https://linear.app/cleantrack/team/CLE/active`
- 点击后标题：`Linear`
- 点击后可见文案：
  - `Log in to Linear`
  - `Continue with Google`
  - `Continue with email`
  - `Continue with SAML SSO`
  - `Log in with passkey`
  - `Don’t have an account? Sign up or learn more`
- 判定：仍未进入已登录 Active issues 真页，而是落到标准登录选择页。

## 当前确认的 blocker

- **metadata path**：部分可用（browser 可读，terminal 仍 502）
- **authenticated page reuse**：仍不可用
- **直接阻塞项**：CAP-06 所需的顶部 tabs / 搜索 / Filter / Display / Sort / New / 行点击等真实控件均不可见，无法补齐“页面 × 控件 × 状态 × 流程”的只读证据。

## 本轮新增证据

- HAR/摘要：`docs/linear-parity/har/2026-04-18-210642-browser-terminal-metadata-discrepancy.json`
- 中转页截图：`/Users/liuzheng/.hermes/cache/screenshots/browser_screenshot_09ca0db32f064482b665ed6e337f8b19.png`
- 登录页截图：`/Users/liuzheng/.hermes/cache/screenshots/browser_screenshot_418eec2011954ec29e5711dc98a245ce.png`

## 仍缺失的真实证据

- Active issues 顶部 tabs 每个项的点击前后状态
- 搜索框输入态 / 提交态
- Filter / Display / Sort 打开态与菜单项
- `New issue` 打开态
- 列表行 hover / 点击进入 issue 详情页
- 上述交互对应的 DOM 差异与网络请求摘要

## 下一步建议

下轮若 9222 真实已登录页面可复用，应直接从 CAP-06 的最小控件组恢复采集，优先顺序保持为：顶部 tabs → 搜索 → Filter → Display / Sort → `New issue` → 列表行点击。
