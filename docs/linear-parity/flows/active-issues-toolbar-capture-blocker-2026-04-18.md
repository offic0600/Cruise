# Active issues 顶部工具栏取证阻塞记录（2026-04-18）

## 目标

继续推进 CAP-06：补齐 Linear `Active issues` 页顶部 tabs / 搜索 / filter / display / sort / new 等控件的只读交互证据。

## 本轮最小探测

- 探测对象：本机已登录 Linear Chrome 9222 会话
- 探测方式：终端直接读取 `http://127.0.0.1:9222/json/version` 与 `http://127.0.0.1:9222/json/list`
- 探测约束：只做一次最小只读 probe，不重复消耗在不稳定链路上

## 结果

| 探测项 | 结果 | 备注 |
|---|---|---|
| `/json/version` | `502 Bad Gateway` | 无法读取 browser metadata |
| `/json/list` | `502 Bad Gateway` | 无法读取 page target 列表 |

## 当前判断

- 本轮 9222 元信息入口不可用，属于**当前 run 的 metadata-only 阻塞**，不适合继续尝试深层页面采集。
- 因为无法稳定获得 target/page websocket 元信息，本轮未继续执行 Active issues 顶部控件点击、截图、DOM diff 或网络监听。
- 这阻塞了 CAP-06 的“真实交互证据”新增，但**不阻塞**文档侧事实落盘与任务状态同步。

## 对采集范围的影响

当前被阻塞：
- Active issues 顶部 tabs 的点击前后 URL / DOM / visible feedback 复核
- Search / Filter / Display / Sort / New issue 的 open state 或前后状态补证
- 当前 run 的 target/page websocket 地址刷新与 network 摘要补全

当前仍可继续：
- 把本轮失败事实写入 `har/` 与流程文档
- 更新 `page-inventory.md` / `task-board.md` 的阻塞说明
- 更新项目日志与工时

## 补充最小复测（19:30:31 CST）

- 复测方式：再次仅探测 `http://127.0.0.1:9222/json/version` 与 `http://127.0.0.1:9222/json/list`
- 复测结果：两个端点仍均为 `502 Bad Gateway`
- 新增证据：`docs/linear-parity/har/2026-04-18-9222-metadata-probe-failure-193031.json`
- 更新判断：CAP-06 仍处于 metadata-only 阻塞，当前 run 不适合继续尝试真实控件交互采集

## 下一步最小动作

待 `9222` 的 `/json/version` 与 `/json/list` 恢复后，继续 CAP-06，优先只采一组 Active issues 顶部控件证据：

1. 先锁定页面 target 元信息
2. 选择一个控件组（优先 tabs + search）
3. 记录点击前后 URL、可见反馈、DOM 变化、截图与网络请求摘要
4. 再推进下一组控件（filter / display / sort / new）
