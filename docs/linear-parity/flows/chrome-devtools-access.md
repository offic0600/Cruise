# 本机 Chrome 调试接入记录

## 目标
复用本机已登录 Linear 的网页会话，用于只读采集页面结构与后续 Cruise 对标分析。

## 已验证可用方式
1. 完整克隆本机 Chrome 用户目录到非默认目录：`~/.cache/hermes-full-chrome-clone`
2. 以非默认 `--user-data-dir` 启动 Chrome，并开启调试端口 `9222`
3. 历史轮次已多次验证以下 DevTools HTTP 端点可返回 `200`：
   - `http://127.0.0.1:9222/json/version`
   - `http://127.0.0.1:9222/json/list`
   - `http://127.0.0.1:9222/json/protocol`
4. 目标页历史上已验证为：
   - 标题：`Cleantrack › Active issues`
   - URL：`https://linear.app/cleantrack/team/CLE/active`
   - page websocket：`ws://127.0.0.1:9222/devtools/page/81A3713C33BCA35B2A0B8C7D177F43AD`
5. 当前 Chrome / Protocol 版本（基于最近一次成功读取时的快照）：
   - Browser: `Chrome/147.0.7727.56`
   - Protocol-Version: `1.3`

## 当前限制
- Hermes 自带 browser 工具无法复用这份本机已登录会话，访问同一路径时只会落到 deep-link 提示页或登录页
- Chrome 启动参数仍**未包含** `--remote-allow-origins`，因此常规高层 websocket 客户端依旧可能因为自动携带 `Origin` 被 Chrome 拒绝
- 已验证：在**清空代理变量**并使用 `websocket-client` 的 `suppress_origin=True` 后，可连上 browser/page target，说明当前具备只读 CDP 能力
- 9222 入口**存在波动**：历史上曾出现 `502 Bad Gateway`，但本轮（2026-04-18）再次实测 `GET /json/version`、`GET /json/list`、`GET /json/protocol` 均返回 `200`
- 现阶段限制应描述为：“低层只读接入方法已知，但 DevTools HTTP 元信息入口并不稳定，需按轮次重试并保留非阻塞 fallback”

## 已确认的历史只读验证
- `GET /json/version` / `GET /json/list` / `GET /json/protocol` 曾返回 `200`
- browser websocket 可执行 `Browser.getVersion`
- page websocket 可执行 `Runtime.evaluate("document.title")` 与 `Runtime.evaluate("location.href")`
- page websocket 可执行 `Page.enable` / `Network.enable` / `Page.captureScreenshot`
- 已落盘截图：`docs/linear-parity/evidence/active-issues-cdp.png`

## 建议后续动作
- 将 `suppress_origin=True` + 清理代理变量 固化为本地 DevTools 抓取脚本默认连接策略
- 每轮开始先探测 `json/version` / `json/list` / `json/protocol`，若成功再继续 Network 监听；若失败则直接切换到文档分析或 Cruise gap 补强任务
- 在 9222 恢复可读的轮次，优先沉淀：
  - `Network.requestWillBeSent`
  - `Network.responseReceived`
  - `Network.loadingFinished`
- 基于已拿到的截图与 Runtime 结果，继续补齐 Active issues 的 DOM、字段和接口级取证
