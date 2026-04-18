# Active issues 页面分析（更新于 2026-04-18 14:02 CST）

## 页面身份
- 标题：`Cleantrack › Active issues`
- URL：`https://linear.app/cleantrack/team/CLE/active`
- 数据来源：本机 Chrome DevTools 9222 只读元信息与既有取证文档

## 当前已确认事实
- 当前页面属于 `cleantrack` workspace 下 `CLE` 团队的 Active issues 视图。
- 该页面仍是 Cruise 对标 Linear 的首个高优先级复刻目标。
- 本机 Chrome DevTools `http://127.0.0.1:9222/json/version` 当前返回 `200`，说明浏览器级元信息入口可用。
- 本轮尝试通过脚本再次读取 `http://127.0.0.1:9222/json/list` 时返回 `502 Bad Gateway`，说明 9222 对不同端点/时刻仍存在波动。
- 已有取证文档确认：在“清代理变量 + suppress_origin=True”的前提下，page websocket 曾成功执行 `Runtime.evaluate("document.title")`，返回 `Cleantrack › Active issues`。

## 当前采集到的证据
1. `docs/linear-parity/dom/active-issues-target.json`
   - 保存目标页 title / url / page websocket 元信息。
2. `docs/linear-parity/dom/active-issues-browser-tool-fallback.txt`
   - 保存 Hermes 隔离 browser 工具访问 deep-link 后跳回登录链路的 fallback 证据。
3. `docs/linear-parity/flows/chrome-devtools-access.md`
   - 保存 clone profile + 9222 接入方式与限制。
4. `docs/linear-parity/har/2026-04-18-devtools-9222-network-capture-status.md`
   - 保存 9222 HTTP 元信息层可用、page websocket 可低层接入、但真实 Network 事件流未落盘的最新判断。
5. `docs/linear-parity/api-catalog.md`
   - 保存当前已确认的 DevTools 元信息接口与待抓取的真实业务请求类别。

## 当前抓取状态（以最新文档为准）
- 已确认 `json/version` 可读，浏览器版本为 `Chrome/147.0.7727.56`，Protocol-Version=`1.3`。
- 已有文档确认目标页真实打开，标题为 `Cleantrack › Active issues`，URL 为 `https://linear.app/cleantrack/team/CLE/active`。
- 9222 当前并非“完全不可用”，而是处于“HTTP 元信息层可部分访问、page websocket 需特殊参数、真实 Network 事件流仍未稳定落盘”的状态。
- 因为本轮没有新增页面 DOM / 截图 / HAR，所以页面字段级分析仍缺少更多直接证据。

## 对 Cruise 的直接启发
### P0 优先复刻点
- 左侧导航 + 主内容区的 issues 主工作台结构。
- 团队语境下的 issues 列表页路由模型（例如 `/team/CLE/active`）。
- Active / Backlog / My issues / All issues 等 issue 视图切换能力。
- 高信息密度、深色主题、列表驱动的 issue 工作台布局。

### 当前缺口
- 缺真实页面 DOM / 可见文本快照。
- 缺顶部工具栏、筛选/排序/分组控件的字段级证据。
- 缺 issue row 结构、列定义、hover/selection 等交互证据。
- 缺 Active issues 页面真实业务请求清单与请求名称摘要。

## 本轮更新要点
- 将旧文档中“`json/version`/`json/protocol` 长期 502、9222 整体阻塞”的过时表述，收敛为“9222 可部分访问但存在波动”。
- 明确把当前最小阻塞从“无法连接 DevTools”修正为“尚未稳定抓到 Active issues 的真实 Network 事件流”。

## 下一步最小任务
1. 优先补一份 Active issues 路由/证据状态同步，把 `page-inventory.md` 和 `route-map.md` 的状态描述与最新 9222 结论对齐。
2. 再下一轮继续只读尝试：用已验证的低层连接参数最小化监听一次 `Network.requestWillBeSent`，把首批请求摘要写入 `api-catalog.md`。
3. 如果 9222 再次波动，则退化为继续补齐 Cruise vs Linear 的差距文档，避免空转。
