# 2026-04-18 DevTools 9222 网络采集状态

## 本次目标
尝试通过本机 Chrome DevTools `http://127.0.0.1:9222` 读取当前已登录 Linear 页面对应的调试元信息，并进一步验证 page websocket 的只读接入前提，为后续 HAR / 网络请求摘要采集提供稳定入口。

## 实际结果
本次对以下只读入口进行了验证：

- `http://127.0.0.1:9222/json/version`
- `http://127.0.0.1:9222/json/list`
- `http://127.0.0.1:9222/json/protocol`

验证结果：

1. `GET /json/version` 本轮返回 `200`
2. `GET /json/list` 本轮返回 `200`
3. `GET /json/protocol` 本轮返回 `200`
4. 说明当前 9222 的 HTTP 元信息层处于可读状态，可继续支撑后续 page websocket 只读监听脚本落地

## 结论
- 当前 9222 **并非稳定不可用**，而是存在波动；至少在本轮，`json/version`、`json/list`、`json/protocol` 均恢复可读
- 因此当前真实状态应表述为：
  1. **历史已确认能力**：在清空代理变量并使用 `suppress_origin=True` 时，page websocket 可以只读建连并执行基础 CDP 调用
  2. **本轮实时状态**：HTTP 元信息层可读，具备继续推进 Network 事件流采集前提
  3. **待解决卡点**：尚未把 Active issues 的真实 `Network.requestWillBeSent` / `responseReceived` 事件流稳定落盘整理

## 对后续取证的影响
- 不应再把 9222 简化成“完全不可用”或“已稳定可用”任一单值结论，而应明确记录为“可间歇访问、存在波动”
- 在 9222 可读的轮次，优先推进：
  - `Network.requestWillBeSent`
  - `Network.responseReceived`
  - `Network.loadingFinished`
- 如果后续轮次再次波动失败，仍可继续推进非阻塞任务：
  - 整理 `docs/linear-parity/` 既有证据
  - 补 gap-analysis / implementation-roadmap
  - 盘点 Cruise 当前实现与 Linear 的结构差异
- `api-catalog.md` 中“真实业务请求待抓包”的结论继续成立

## 建议下一步最小任务
1. 在 `docs/linear-parity/flows/chrome-devtools-access.md` 中同步“9222 可读但存在波动”的最新口径
2. 基于当前已恢复可读的 9222，补一个只读 Network 监听脚本/文档步骤，开始沉淀 Active issues 请求摘要

## 证据
本轮关键结果：

```text
GET /json/version => 200
GET /json/list => 200
GET /json/protocol => 200
Browser => Chrome/147.0.7727.56
```
