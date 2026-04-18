# Active issues 已登录会话复用阻塞记录（2026-04-18 20:51 CST）

## 目标

对 Linear Active issues (`https://linear.app/cleantrack/team/CLE/active`) 做一次最小只读复测，确认 9222 metadata 与真实页面复用状态是否出现新变化，并把本轮稳定事实落盘。

## 本轮探测

### 1. 9222 metadata 最小探测
- 终端直连：`http://127.0.0.1:9222/json/version` → `502 Bad Gateway`
- 终端直连：`http://127.0.0.1:9222/json/list` → `502 Bad Gateway`
- Hermes browser 读取 `http://127.0.0.1:9222/json/version`：仍返回 browser metadata
- Hermes browser 读取 `http://127.0.0.1:9222/json/list`：仍能枚举到 Linear target
  - target id：`81A3713C33BCA35B2A0B8C7D177F43AD`
  - title：`Cleantrack › Active issues`
  - url：`https://linear.app/cleantrack/team/CLE/active`
  - page websocket：`ws://127.0.0.1:9222/devtools/page/81A3713C33BCA35B2A0B8C7D177F43AD`

### 2. 真实页面可复用性再验证
- 浏览器导航：`https://linear.app/cleantrack/team/CLE/active`
- 页面 1：`Link opened in the Linear app` 中转页
- 点击动作：`Open here instead`
- 页面 2：`Log in to Linear` 登录方式选择页

## 结果

本轮与 20:42 结论一致：

1. **metadata 链路继续分裂**
   - Hermes browser 仍可读取 `/json/version` 与 `/json/list`
   - 终端直连 9222 再次返回 `502 Bad Gateway`
2. **真实页面仍不可复用已登录态**
   - 打开 Active issues 深链后仍先进入中转页
   - 点击 `Open here instead` 后仍进入登录页
   - 未进入已登录 Active issues 真页
3. **CAP-06 仍不可恢复**
   - tabs / search / filter / display / sort / new issue 等顶部控件仍无法在已登录真页上做只读交互取证

## 页面级事实

| 步骤 | URL | 观察 |
|---|---|---|
| 直接打开 `https://linear.app/cleantrack/team/CLE/active` | `https://linear.app/cleantrack/team/CLE/active` | 进入 `Link opened in the Linear app` 中转页 |
| 点击 `Open here instead` | `https://linear.app/cleantrack/team/CLE/active` | 进入 `Log in to Linear` 登录页 |
| 是否进入已登录 Active issues 列表 | - | 否 |

### 登录页可见反馈
- 标题：`Log in to Linear`
- 可见登录入口：`Continue with Google`、`Continue with email`、`Continue with SAML SSO`、`Log in with passkey`
- 未出现 issue 列表、顶部 tabs、filter、display、sort、new issue 等已登录页面控件

## 当前已新增的真实证据

- 新增一组 20:51 的 browser/version 与 browser/list metadata 读数
- 再次确认当前页面级 fallback 路径仍为：`中转页 → 点击 Open here instead → 登录页`
- 再次确认本轮 metadata 分裂态未恢复：`browser metadata 可读` vs `terminal probe 502`

## 证据文件

- `docs/linear-parity/har/2026-04-18-205112-browser-terminal-metadata-discrepancy.json`
- `MEDIA:/Users/liuzheng/.hermes/cache/screenshots/browser_screenshot_b8b4760bb067427e99e8b85848e3fd69.png`
- `MEDIA:/Users/liuzheng/.hermes/cache/screenshots/browser_screenshot_86f22c5b140a493e8c437ff43235f0ef.png`

## 仍缺失 / 阻塞项

- 已登录 Active issues 真页 DOM
- 顶部 tabs / search / filter / display / sort / new issue 的点击前后状态
- issue 详情、issue 创建/编辑入口的页面级证据

## 建议下一步

优先恢复 Hermes/browser 对本地已登录 Linear Chrome 会话的可复用性；一旦能直接进入已登录 Active issues 真页，立即继续 CAP-06，从顶部 tabs + search 控件组开始补交互证据。
