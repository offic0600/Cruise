# Linear Parity 任务板

> 目的：作为 Linear 对标工作的统一状态源，但按 **采集（capture）** 与 **实现（implementation）** 两条 cron 分轨推进。
> 当前约束：
> - `cruise-linear-parity-capture` 只处理采集类任务
> - `cruise-linear-parity-push` 只处理实现类任务
> - 两条任务线都必须更新本文件，但只能推进各自所属 lane 的任务

## 状态说明

- `pending`：未开始
- `in_progress`：进行中，可继续推进
- `blocked`：当前有明确阻塞，需记录 blocker
- `done`：已完成

## 调度规则

1. 每次 cron run 先读本文件，再读 `AGENTS.md`、相关任务文档与日志。
2. `cruise-linear-parity-capture`：只看 **Capture lane**，优先选择最靠前的 `in_progress`，否则选择最靠前的 `pending`。
3. `cruise-linear-parity-push`：只看 **Implementation lane**，优先选择最靠前的 `in_progress`，否则选择最靠前的 `pending`。
4. 不允许跨 lane 抢任务：
   - 实现 cron 不做截图、DOM、HAR、浏览器取证、只读探测
   - 采集 cron 不做 Cruise 产品代码实现
5. 如果某任务 `blocked`，必须写明 blocker；若后续任务不依赖该 blocker，可继续推进同 lane 下一个最小任务。
6. 每轮必须完成一个 5~15 分钟的最小真实增量，不能只产出泛泛计划。
7. 每轮结束后必须同步更新：
   - 本任务板
   - `docs/planning/dev-logbook.md`
   - `doc/worktime.md`
   - 本轮对应的代码/证据/分析文档
8. 若 implementation lane 的任务被真正完成并标记为 `done`，必须立即按仓库规范提交并 push；capture lane 不做代码提交要求，除非该轮同时伴随仓库文档变更且你明确决定提交。

---

## Capture lane（只给 `cruise-linear-parity-capture`）

| ID | 标题 | 状态 | 依赖 | 说明 / 完成标准 | blocker |
|---|---|---|---|---|---|
| CAP-01 | 稳定记录 9222 元信息与可访问性现状 | done | - | 已将 `/json/version`、`/json/list`、目标页标题/URL 的可用性与波动情况落盘到 `har/` / `flows/` 文档 | - |
| CAP-02 | 建立 Linear 页面/路由/领域文档骨架 | done | CAP-01 | `README.md`、`page-inventory.md`、`route-map.md`、`domain-model.md`、`api-catalog.md`、`ui-style-guide.md` 已存在 | - |
| CAP-03 | 补齐 Active issues 网络监听摘要 | done | CAP-01 | 已获得 `Network.requestWillBeSent/responseReceived` 事件样本，并落盘到 `docs/linear-parity/har/2026-04-18-active-issues-network-events.json`；后续可继续补字段级摘要 | - |
| CAP-04 | 补 Active issues DOM/结构证据摘要 | done | CAP-01 | 已新增 `docs/linear-parity/dom/active-issues-structure-summary.md`，沉淀 team Active issues 的结构级证据摘要 | - |
| CAP-05 | 建立全功能 1:1 采集计划 | done | CAP-02 | 已新增 `docs/linear-parity/full-parity-capture-plan.md`，明确页面 × 控件 × 状态 × 流程的采集口径 | - |
| CAP-06 | 枚举 Active issues 顶部工具栏与 tabs 的交互证据 | blocked | CAP-03, CAP-04, CAP-05 | 为当前 Active issues 页的顶部 tabs / 搜索 / filter / display / sort / new 等控件逐项补前后状态、截图/DOM/网络摘要，并新增对应 flow 文档 | 2026-04-18 23:05 CST 最小复测：terminal 与 Hermes browser 现都可读取 `http://127.0.0.1:9222/json/version` 与 `/json/list`（双侧 `200 OK`），并继续读到 Linear target=`Cleantrack › Active issues`（id=`81A3713C33BCA35B2A0B8C7D177F43AD`）；同时 `/json/list` 还能枚举到 `Codex Proxy Developer Dashboard`、GitHub commit 页面等其它实时目标，说明 metadata 目录已恢复为双侧实时可读。但真正打开 `https://linear.app/cleantrack/team/CLE/active` 时仍先落到 `Link opened in the Linear app` 中转页，点击 `Open here instead` 后进入 `Log in to Linear` 登录页，仅见 Google/email/SAML SSO/passkey 登录入口，仍未进入已登录 Active issues 真页；CAP-06 当前 blocker 应明确归类为 authenticated page/session reuse failure，而非 9222 metadata 不可达。最新 blocker 证据见 `docs/linear-parity/har/2026-04-18-2305-active-issues-auth-gate-reprobe.json`、`docs/linear-parity/flows/active-issues-auth-session-blocker-2026-04-18-2305.md` |
| CAP-07 | 采集一个 issue 详情页的页面级与控件级证据 | pending | CAP-06 | 至少拿到 issue 详情页默认态截图、DOM、可见模块、主要操作入口与网络摘要 | - |
| CAP-08 | 采集 issue 创建/编辑入口的打开态与校验态证据 | pending | CAP-06 | 只读优先，允许打开弹窗/抽屉并记录字段、默认值、校验反馈，不做持久提交 | - |
| CAP-09 | 采集 Projects 域页面与关键控件证据 | pending | CAP-05 | 至少完成 Projects 列表页的页面级截图、DOM、主要按钮/筛选/详情入口摘要 | - |
| CAP-10 | 采集 Views 域页面与关键控件证据 | pending | CAP-05 | 至少完成 Views 列表/入口级证据，明确创建/编辑/删除入口形态 | - |
| CAP-11 | 采集 Cycles / Roadmap 域页面证据 | pending | CAP-05 | 至少完成一个 Cycles 或 Roadmap 页面级证据包 | - |
| CAP-12 | 采集 Inbox / Settings 必要子集证据 | pending | CAP-05 | 至少完成 Inbox 与一个 Settings 子页的页面级证据包 | - |

---

## Implementation lane（只给 `cruise-linear-parity-push`）

| ID | 标题 | 状态 | 依赖 | 说明 / 完成标准 | blocker |
|---|---|---|---|---|---|
| IMP-01 | 完成 Cruise vs Linear issues 域差距分析 | done | CAP-02 | `gap-analysis.md` 与 `implementation-roadmap.md` 已形成基线 | - |
| IMP-02 | 建立长期任务状态驱动机制 | done | IMP-01 | 新增 `task-board.md`，cron 改为按任务状态推进 | - |
| IMP-03 | 细化 `/issues` 页顶部工具栏首个 UI gap | done | IMP-01 | 已形成 `active-issues-toolbar-gap.md` 执行说明 | - |
| IMP-04 | 落地 `/issues` 顶部工具栏一个最小对标改动 | done | IMP-03 | 已完成顶部 tabs / 主次操作层级的最小 UI 对标 | - |
| IMP-05 | 评估 team/workspace 语义列表路由壳层 | done | IMP-01 | 已补 `teamIssuesPath(...)` 与 team 语义路由壳层 | - |
| IMP-06 | 让 team-active Display 分组折叠切换真实作用于列表渲染 | done | IMP-05 | `collapsed=` URL 状态已真正驱动 group section 展开/折叠 | - |
| IMP-07 | 为 issue-workbench 视图归类规则补齐回归测试 | done | IMP-06 | 已补 helper 级回归测试 | - |
| IMP-08 | 优化 team-active 搜索/筛选空态反馈 | done | IMP-06, IMP-07 | 已补差异化空态文案与测试 | - |
| IMP-09 | 为 team 路由 helpers 补语义化 backlog/done 回归测试 | done | IMP-05 | 已补 `teamIssuesPath(...)` 回归测试 | - |
| IMP-10 | 为 team-active Display 折叠状态补可见反馈文案 | done | IMP-06, IMP-08 | 已补 collapsed group summary 与测试 | - |
| IMP-11 | 为 team-active 工具栏补最小可见排序状态 | done | IMP-06, IMP-08, IMP-10 | 已把 `sort=` URL 状态与可见摘要接通 | - |
| IMP-12 | 让 team-active 列表真实消费 sort URL 状态并输出稳定排序 | done | IMP-11 | `sort=` 现已真实驱动 Active issues workbench rows 的 `updatedAt / manual` 顺序；补充了 `issue-workbench` helper 与 row builder 回归测试，定向 `vitest` 9/9 通过 | 若后续排序规则依赖更多 Linear 证据，由 capture lane 补充，但本任务已基于现有证据完成安全最小实现 |
| IMP-13 | 为 team-active 工具栏补最小可见 filter summary 聚合反馈 | done | IMP-08, IMP-12 | 已将 team-active filter 按钮与侧栏摘要升级为首项 + 余量的聚合反馈文案，避免多条件筛选时仅暴露第一项状态；补充了 `filterSummaryLabel(...)` 回归测试，定向 `vitest` 9/9 通过 | 受仓库既有 `MarkdownEditor.tsx` tiptap 缺依赖与 `issue-view.test.ts` 旧字面量类型不收窄影响，`npx tsc --noEmit` 仍未全绿，但本轮新增变更已通过定向验证 |
| IMP-14 | 为 team-active 高级筛选补最小 labels URL/摘要闭环 | done | IMP-13 | 已让 `labelIds=` URL 状态进入 team-active filter draft / query / summary 闭环：侧板可选择标签，Filter 按钮与摘要区会显示标签名称，并补充 helper 回归测试；定向 `vitest` 9/9 通过 | `npx tsc --noEmit` 仍受仓库既有 Vitest/路径别名/JSX 配置与 `MarkdownEditor.tsx` 依赖问题影响，未能作为本轮全局绿灯，但本轮增量已通过定向验证 |
| IMP-15 | 收紧 team-active 多条件筛选摘要为首项 + 余量聚合文案 | done | IMP-14 | 已将 `filterSummaryLabel(...)` 从全量拼接改为首项 + 余量聚合（如 `Search: foo + 2 more` / `搜索: foo 等 2 项`），并让页内 search summary 复用同一套短摘要逻辑，降低多条件时摘要噪声；补充 `summarizeFilterTokens(...)` helper 与回归测试，定向 `vitest` 6/6 通过 | `npx tsc --noEmit` 仍受仓库既有 `MarkdownEditor.tsx` tiptap 依赖缺失影响，但本轮变更对应测试已通过 |
| IMP-16 | 评估 issue 详情页 route shell 与页面骨架落地切口 | pending | CAP-07 | 基于已采 issue 详情页证据，先落一个不破坏现有结构的 route shell / page shell 最小实现方案 | 依赖 capture lane 先拿到 issue 详情页页面级证据 |

## 最近一次人工调整

- 2026-04-18：新增任务板，改为“任务状态驱动”而不是“Task 1/Task 2”静态提示词驱动。
- 2026-04-18：进一步收紧为 capture / implementation 双 lane；采集 cron 与实现 cron 禁止跨 lane 抢任务。

## Cron 执行提示（给未来运行）

- 不要重新发明任务顺序；以本文件中所属 lane 为准。
- capture cron 只补证据，不做实现；implementation cron 只做实现，不扩展成采集。
- 若无真实 blocker，必须落一个真实增量。
- 报告格式固定为：完成了什么 / 改了哪些文件 / 下一步做什么。
