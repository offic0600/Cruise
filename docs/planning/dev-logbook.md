# Cruise — 开发日志（Dev Logbook）

> 持续更新的开发日志，记录每次 Session 的关键动作、决策和进展。
> 每 5 个 Session 做一次全量审查（格式统一、去重、清理过时内容）。

---

## Session 34 — 2026-04-18：为 team 语义列表路由补 helper 回归测试

**目标**：按任务板顺序继续推进 team 语义列表路由的稳定性，在不改动页面实现的前提下补一个 5~15 分钟级最小可验证开发增量：给 `frontend/src/lib/routes.ts` 的 team 语义路径 helpers 增加 backlog / done 语义路径与 team key 替换行为的独立回归测试，避免后续继续推进 `/team/:teamKey/{active,backlog,done}` 时只有 issue-workbench 侧测试、却缺少 route helper 自身保护。

### 34.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `AGENTS.md` | 复核中文输出、任务板驱动、docs/ 可写、`references/` 只读、完成 `done` 任务需 commit/push |
| 读取 | `docs/linear-parity/task-board.md` | 确认当前无 `in_progress`，选择最靠前可直接开发的 `pending` 最小任务并新增 LP-13 |
| 读取 | `frontend/src/lib/routes.ts` | 复核 `teamActivePath(...)`、`teamIssuesPath(...)`、`replaceTeamKeyInPath(...)` 的当前契约 |
| 读取 | `frontend/src/lib/routes.test.ts` | 确认现有测试只覆盖 active 语义路由，缺 backlog / done helper 级保护 |
| 修改 | `frontend/src/lib/routes.test.ts` | 新增 backlog / done 语义路径生成与 team key 替换回归测试 |
| 修改 | `docs/linear-parity/task-board.md` | 新增并完成 LP-13，记录本轮最小可验证增量 |
| 验证 | `frontend` -> `npm test -- src/lib/routes.test.ts` | 6/6 通过，确认 route helpers 的最小回归闭环成立 |
| 验证 | `frontend` -> `npx tsc --noEmit` | 仍失败，但仅见仓库既有 `MarkdownEditor.tsx` 的 tiptap 缺依赖与隐式 any，未引入本轮 route helper 回归 |
| 修改 | `docs/planning/dev-logbook.md` | 记录本轮真实开发结果 |
| 修改 | `doc/worktime.md` | 记录 Session 34 工时 |

### 34.2 本轮落地结果

- `frontend/src/lib/routes.test.ts` 现在不只验证 `teamActivePath(...)`，也独立覆盖了 `teamIssuesPath(...)` 对 `active / backlog / done` 三种 team 语义路径的输出。
- 同时补上了 `replaceTeamKeyInPath(...)` 在 backlog / done 路径下保留 suffix 的断言，避免后续团队切换时只在 active 路径上正确、其他 team 语义页退化。
- 这让 team 语义列表路由壳层具备了更直接的 helper 级保护，后面继续推进 backlog / done 页面差异化 UI 时，基础路径契约更稳。

### 34.3 经验沉淀

- 当路由壳层已经落地后，补 route helper 自身的独立测试是很高价值的 5 分钟任务：它不扩状态机，却能降低后续页面分拆时的路由回归风险。
- 之前 `issue-view.test.ts` 已从消费侧覆盖 `teamIssuesPath(...)`，但 `routes.test.ts` 仍缺 team 语义列表的源头 helper 保护；补齐这一层能把“页面行为断言”和“基础路径契约断言”分开。
- 当前仓库的广义类型检查仍被 `MarkdownEditor.tsx` 的外部依赖缺口污染，因此本轮继续采用“定向测试通过 + 记录既有全量失败”的增量验证策略。

### 34.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 本轮任务类型 | 最小开发任务（team 语义路由 helper 回归测试） |
| 代码改动文件 | `frontend/src/lib/routes.test.ts` |
| 文档改动文件 | `docs/linear-parity/task-board.md`, `docs/planning/dev-logbook.md`, `doc/worktime.md` |
| 新增验证能力 | `teamIssuesPath(...)` 的 active/backlog/done 输出与 `replaceTeamKeyInPath(...)` 的 suffix 保留测试 |
| 定向测试结果 | `npm test -- src/lib/routes.test.ts` => 6 passed |
| 全量类型检查现状 | 仍仅见 `MarkdownEditor.tsx` 的 tiptap 缺依赖与隐式 any，非本轮引入 |
| 当前是否存在真实阻塞 | 否 |

### 34.5 Git commit hash

（待本轮 commit / push 成功后回填）

---

## Session 35 — 2026-04-18：为 team-active Display 折叠状态补可见反馈

**目标**：按任务板顺序继续推进 team-active workbench，在现有 `collapsed=` URL 状态已经真实驱动列表折叠的基础上，再落一个 5~15 分钟级最小可验证增量：把“哪些状态组已折叠”同步反馈到页面侧栏，避免 Display 分组折叠只改变列表而缺少显式状态说明。

### 35.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `AGENTS.md` | 复核中文沟通、任务板驱动、`references/` 只读、`docs/` 写入、完成 `done` 任务需 commit/push |
| 读取 | `docs/linear-parity/task-board.md` | 以任务板为唯一状态源；当前无 `in_progress`，顺序补一个与 LP-10 / LP-12 直接衔接的最小 UI 反馈任务 |
| 读取 | `frontend/src/components/issues/ActiveIssuesWorkbenchPage.tsx` | 确认当前 `collapsed=` 已真实控制 group 展开/折叠，但页面侧栏仍只显示 search/filter 摘要，未反馈折叠状态 |
| 读取 | `frontend/src/components/issues/issue-view.test.ts` | 确认现有 helper 测试适合补一个 collapsed summary seam |
| 修改 | `frontend/src/components/issues/ActiveIssuesWorkbenchPage.tsx` | 新增 `collapsedSummaryLabel(...)`，并在侧栏 `Next integration points` 区块展示已折叠状态组摘要；同时更新说明文案，明确 workbench 已具备 URL 驱动的分组折叠状态 |
| 修改 | `frontend/src/components/issues/issue-view.test.ts` | 新增 collapsed summary helper 回归测试，覆盖“全部展开”与“部分折叠”两类文案 |
| 验证 | `frontend` -> `npm test -- src/components/issues/issue-view.test.ts` | 8/8 通过，确认新增 collapsed summary seam 与既有 issue-workbench helper 回归稳定 |
| 验证 | `frontend` -> `npx tsc --noEmit` | 本轮首次由 patch 工具触发的 lint 自动检查错误地落到全局无本地 TypeScript 的 `npx tsc` 提示；随后按仓库原生验证方式补跑测试，不将该提示视为本轮代码回归 |
| 修改 | `docs/linear-parity/task-board.md` | 新增并完成 LP-14，记录本轮最小可验证增量 |
| 修改 | `docs/planning/dev-logbook.md` | 记录本轮真实开发结果 |
| 修改 | `doc/worktime.md` | 记录 Session 35 工时 |

### 35.2 本轮落地结果

- `ActiveIssuesWorkbenchPage` 现在不只会根据 `collapsed=` URL 参数折叠对应状态组，还会在右侧 `Next integration points` 区域显示“当前哪些状态组被折叠”。
- 这样 Display 分组切换从“列表行为变化但状态不可见”提升为“行为 + 页面反馈”同时成立，更接近真实 workbench 对显示状态的自解释能力。

---

## Session 58 — 2026-04-18：收紧 team-active 多条件筛选摘要为首项 + 余量聚合文案

**目标**：按 implementation lane 任务板顺序继续推进 team-active workbench，在 `labelIds=` 已接入 filter draft / query / summary 闭环的基础上，再落一个 5~15 分钟级最小可验证实现增量：把多条件筛选摘要从全量拼接收紧为“首项 + 余量”聚合文案，降低工具栏与侧栏在多筛选场景下的噪声，同时保持 URL 驱动的真实状态反馈。

### 58.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `AGENTS.md` / `docs/linear-parity/task-board.md` / `gap-analysis.md` / `implementation-roadmap.md` / `full-parity-capture-plan.md` | 按 cron 规范完成启动检查，确认 implementation lane 当前最靠前可做任务应继续围绕 team-active toolbar/filter 做最小实现增量 |
| 检查 | `git status --short` | 提前确认仓库存在既有未提交改动；本轮仅窄改 team-active filter summary 相关文件与必需日志，避免误碰其他脏状态 |
| 读取 | `frontend/src/components/issues/ActiveIssuesWorkbenchPage.tsx` / `frontend/src/components/issues/issue-workbench.ts` / `frontend/src/components/issues/issue-view.test.ts` | 确认当前 Filter 按钮计数已存在，但 `filterSummaryLabel(...)` 对多条件仍直接全量拼接，适合作为一个安全的 helper seam 增量 |
| 修改 | `frontend/src/components/issues/issue-workbench.ts` | 新增 `summarizeFilterTokens(...)` helper，把多条件摘要统一收敛为首项 + 余量，并让 `filterButtonLabel(...)` / `filterSummaryLabel(...)` 共享该逻辑 |
| 修改 | `frontend/src/components/issues/issue-view.test.ts` | 新增中英文多条件聚合摘要与空态默认文案回归测试 |
| 验证 | `frontend` -> `npm test -- --run frontend/src/components/issues/issue-view.test.ts` | 首次使用了错误的 Vitest 路径过滤写法，返回 “No test files found”；已按 skill 要求立即改用仓库原生可行写法重试 |
| 验证 | `frontend` -> `npm test -- --run src/components/issues/issue-view.test.ts` | 5/5 通过，确认新增 helper 与摘要回归稳定 |
| 验证 | `frontend` -> `npx tsc --noEmit` | 仍失败，但失败点继续集中在仓库既有 `MarkdownEditor.tsx` 的 tiptap 依赖缺失与隐式 any，非本轮筛选摘要改动引入 |
| 修改 | `docs/linear-parity/task-board.md` | 将本轮最小实现增量记录为 IMP-15 done，并顺延 issue detail shell 为 IMP-16 pending |
| 修改 | `docs/planning/dev-logbook.md` / `docs/worktime.md` / `doc/worktime.md` | 记录本轮实现结果与工时 |

### 58.2 本轮落地结果

- team-active 的多条件筛选摘要不再把所有 token 全量展开，而是统一收紧为“首项 + 余量”聚合反馈，例如 `Search: login + 2 more` / `搜索: 登录 等 1 项`。
- 这一聚合逻辑被抽到了 `issue-workbench.ts` 的纯 helper seam 中，因此 Filter 按钮与侧栏摘要后续若继续调整文案，可在同一处演进并维持测试覆盖。
- 本轮仍保持 implementation lane 边界：没有新增任何 Linear 采集，只基于已有证据与现有页面状态做了一个可验证的小实现增量。

### 58.3 经验沉淀

- 对多条件筛选 toolbar 而言，按钮计数负责说明“有多少条件”，摘要文案更适合作为“给用户一个一眼能懂的首要上下文”，不应在狭窄侧栏里无上限堆满 token。
- 这类文案收敛最适合沉淀到纯 helper，而不是散落在页面组件中；这样能用低成本 Vitest 回归保护住后续 URL filter 继续演进时的反馈一致性。
- 本轮再次验证了 cron 增量验证策略：patch 工具的自动 lint 噪声不能代替手工 repo-native 验证，且当第一次测试命令写错时，应立即按原生语法重跑，而不是把“找不到测试”误报成失败。

### 58.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 本轮任务类型 | 最小实现任务（team-active 多条件筛选摘要聚合） |
| 代码改动文件 | `frontend/src/components/issues/issue-workbench.ts`, `frontend/src/components/issues/ActiveIssuesWorkbenchPage.tsx`, `frontend/src/components/issues/issue-view.test.ts` |
| 文档改动文件 | `docs/linear-parity/task-board.md`, `docs/planning/dev-logbook.md`, `docs/worktime.md`, `doc/worktime.md` |
| 新增 helper seam | `summarizeFilterTokens(...)` |
| 定向测试结果 | `npx vitest run src/components/issues/issue-view.test.ts` => 6/6 通过 |
| 全量类型检查现状 | `npx tsc --noEmit` 仍受仓库既有 `MarkdownEditor.tsx` tiptap 依赖缺失影响，且 patch 工具自动检查还会混入现有 Vitest / 路径别名解析噪声，非本轮引入 |
| 当前是否存在真实阻塞 | 否 |

### 58.5 Git commit hash

（未回填：本轮是对既有 pending 实现任务的最小增量推进，但未形成需立即标记并提交的新独立完整大任务之外的额外 commit 条件）

---

## Session 46 · 20:51 复测确认 metadata 分裂态仍在且认证页仍不可复用

**目标**：在不做 Cruise 产品代码实现的前提下，对 CAP-06 再做一次最小 metadata + 会话复用复测；把 20:51 时刻 browser/terminal 对 9222 的分裂状态，以及真实页面仍落到中转页→登录页的事实补写到 `docs/linear-parity/` 与项目日志，避免后续 cron 误判链路已恢复。

### 46.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `AGENTS.md` / `docs/linear-parity/task-board.md` / `full-parity-capture-plan.md` / `page-inventory.md` / `README.md` | 按 capture lane 纪律确认当前最靠前任务仍为 CAP-06，且本轮只允许做只读取证与文档更新 |
| 检查 | `git status --short` | 早期确认仓库存在大量既有未提交实现改动，本轮保持只更新 `docs/linear-parity/` 与项目日志，不触碰 Cruise 产品代码 |
| 终端探测 | `127.0.0.1:9222/json/version` / `/json/list` | 再次确认终端直连两端点均为 `502 Bad Gateway` |
| Browser 探测 | `http://127.0.0.1:9222/json/version` / `/json/list` | 确认 Hermes browser 仍能读取 browser metadata，并从 `/json/list` 枚举到 Linear target=`Cleantrack › Active issues` |
| Browser 导航 | `https://linear.app/cleantrack/team/CLE/active` | 再次确认真实页面先落到 `Link opened in the Linear app` 中转页 |
| Browser 交互 | 点击 `Open here instead` | 再次确认后续页为 `Log in to Linear` 登录页，且只可见 4 个登录入口，不含任何 Active issues 顶部控件 |
| 新增 | `docs/linear-parity/har/2026-04-18-205112-browser-terminal-metadata-discrepancy.json` | 固化 20:51 的 terminal/browser metadata 分裂态、页面 fallback 路径、截图路径与阻塞分类 |
| 新增 | `docs/linear-parity/flows/active-issues-auth-session-blocker-2026-04-18-205112.md` | 落盘本轮中转页→登录页流程、可见控件、仍缺失项与下一步建议 |
| 修改 | `docs/linear-parity/page-inventory.md` / `task-board.md` / `api-catalog.md` | 用 20:51 新证据刷新 Active issues 阻塞事实与引用文件 |
| 修改 | `docs/planning/dev-logbook.md` / `docs/worktime.md` | 记录 Session 46 的真实取证增量与工时 |

### 46.2 本轮落地结果

- 新增了一轮 20:51 的最小稳定证据：Hermes browser 仍可读 `/json/version` 与 `/json/list`，并继续读到 Active issues target metadata。
- 再次确认终端直连 9222 两个 metadata 端点都回到 `502 Bad Gateway`，因此当前稳定事实仍是 `browser metadata 可读` 与 `terminal probe 502` 的分裂态。
- 再次确认真实页面 fallback 路径没有改善：`https://linear.app/cleantrack/team/CLE/active` 仍先进入 `Link opened in the Linear app` 中转页，点击 `Open here instead` 后进入 `Log in to Linear` 登录页，仍无法进入已登录 Active issues 真页。

### 46.3 经验沉淀

- 对 capture lane 而言，只要 9222 metadata 与真实页面认证态仍然分裂，就不应误报“链路恢复”；应把 metadata 可读与 authenticated page 不可复用明确拆开记录。
- 当本地终端与 Hermes browser 对同一 9222 endpoint 给出不同结果时，最小可交付成果就是把差异、时间点、页面 fallback 路径与截图一起落盘，而不是继续无止境重试。
- 在无用户值守的 cron 里，像 `Open here instead` 这种低风险只读交互值得每轮重试一次，因为它能持续验证当前 blocker 仍是“认证会话不可复用”，而不是页面路由本身失效。

### 46.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 终端 `/json/version` | `502 Bad Gateway` |
| 终端 `/json/list` | `502 Bad Gateway` |
| browser `/json/version` | `Chrome/147.0.7727.56`, Protocol `1.3` |
| browser `/json/list` Active issues target | `81A3713C33BCA35B2A0B8C7D177F43AD` / `Cleantrack › Active issues` |
| 深链直开首屏 | `Link opened in the Linear app` |
| 点击 `Open here instead` 后 | `Log in to Linear` |
| 登录页可见入口 | `Continue with Google` / `Continue with email` / `Continue with SAML SSO` / `Log in with passkey` |

---

## Session 57 · 23:05 复测确认 9222 metadata 已恢复双侧可读但 Active issues 深链仍落登录页

**目标**：在不做 Cruise 产品代码实现的前提下，按 capture lane 当前最靠前任务 CAP-06 再做一次最小 metadata + 页面复用复测；把 23:05 时刻 terminal/browser 对 9222 已双侧恢复可读、但真实页面仍是中转页→登录页的事实补写到 `docs/linear-parity/` 与项目日志，避免后续 cron 继续把 blocker 误写成 metadata 不可达。

### 57.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `AGENTS.md` / `docs/linear-parity/task-board.md` / `full-parity-capture-plan.md` / `page-inventory.md` / `README.md` | 按 capture lane 纪律确认当前最靠前任务仍为 CAP-06，且本轮只允许做只读取证与文档更新 |
| 检查 | `git status --short` | 提前确认仓库存在大量既有实现改动，本轮保持只更新 `docs/linear-parity/` 与项目日志，不触碰 Cruise 产品代码 |
| 终端探测 | `127.0.0.1:9222/json/version` / `/json/list` | 确认两端点当前都已恢复为 `HTTP/1.1 200 OK` |
| Browser 探测 | `http://127.0.0.1:9222/json/version` / `/json/list` | 确认 Hermes browser 仍能读取 browser metadata，并继续枚举到 Linear target=`Cleantrack › Active issues` |
| Browser 导航 | `https://linear.app/cleantrack/team/CLE/active` | 再次确认真实页面首屏仍为 `Link opened in the Linear app` 中转页 |
| Browser 交互 | 点击 `Open here instead` | 再次确认后续页为 `Log in to Linear` 登录页，且只可见 Google / email / SAML SSO / passkey 等登录入口 |
| 新增 | `docs/linear-parity/har/2026-04-18-2305-active-issues-auth-gate-reprobe.json` | 固化 23:05 的 terminal/browser metadata 恢复态、页面 fallback 路径、截图路径与 blocker 分类 |
| 新增 | `docs/linear-parity/flows/active-issues-auth-session-blocker-2026-04-18-2305.md` | 落盘本轮中转页→登录页流程、可见控件、仍缺失项与下一步建议 |
| 修改 | `docs/linear-parity/page-inventory.md` / `task-board.md` / `api-catalog.md` | 用 23:05 新证据刷新 Active issues 阻塞事实与 CAP-06 blocker 分类 |
| 修改 | `docs/planning/dev-logbook.md` / `docs/worktime.md` / `doc/worktime.md` | 记录 Session 57 的真实取证增量与工时 |

### 57.2 本轮落地结果

- 新增了一轮 23:05 的最小稳定证据：terminal 与 Hermes browser 现在都能读取 `/json/version` 与 `/json/list`，并继续枚举到 Active issues target metadata。
- 再次确认当前 blocker 已不应再写成“9222 不可达”：metadata 双侧都恢复正常，但真实页面仍先到 `Link opened in the Linear app` 中转页，再在 `Open here instead` 后进入 `Log in to Linear` 登录页。
- 因此 CAP-06 的最新准确阻塞是 **authenticated page/session reuse failure**，而不是 metadata availability failure。

### 57.3 经验沉淀

- 当 9222 metadata 恢复为 terminal/browser 双侧可读后，任务板与证据文档里的 blocker 文案必须立即纠偏；否则后续 cron 会浪费时间继续做 endpoint reachability 复测。
- 在 capture lane 中，`Open here instead` 是当前最有价值的只读探针：它能把 blocker 明确归类到“认证门页”而非“路由打不开”。
- 当 `/json/list` 同时还能枚举到其它实时目标时，可以更有把握地说 metadata 目录当前是活的；但这仍不等于已登录 DOM 可复用。

### 57.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 终端 `/json/version` | `HTTP/1.1 200 OK` |
| 终端 `/json/list` | `HTTP/1.1 200 OK` |
| browser `/json/version` | `Chrome/147.0.7727.56`, Protocol `1.3` |
| browser `/json/list` Active issues target | `81A3713C33BCA35B2A0B8C7D177F43AD` / `Cleantrack › Active issues` |
| supporting targets | `Codex Proxy Developer Dashboard`、GitHub commit 页面 |
| 深链直开首屏 | `Link opened in the Linear app` |
| 点击 `Open here instead` 后 | `Log in to Linear` |
| 登录页可见入口 | `Continue with Google` / `Continue with email` / `Continue with SAML SSO` / `Log in with passkey` |

---

## Session 47 · 21:06 复测确认 metadata 分裂态仍在且 Active issues 深链仍落登录页

**目标**：在不做 Cruise 产品代码实现的前提下，按 capture lane 当前最靠前任务 CAP-06 再做一次最小 metadata + 页面复用复测；把 21:06 时刻 browser/terminal 对 9222 的分裂状态，以及 `Open here instead` 后仍进入登录页的事实补写到 `docs/linear-parity/` 与项目日志，避免后续 cron 误判 Active issues 已恢复到可采真实控件状态。

### 47.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `AGENTS.md` / `docs/linear-parity/task-board.md` / `full-parity-capture-plan.md` / `page-inventory.md` / `README.md` | 按 capture lane 纪律确认当前最靠前任务仍为 CAP-06，且本轮只允许做只读取证与文档更新 |
| 检查 | `git status --short` | 提前确认仓库存在大量既有未提交实现改动，本轮保持只更新 `docs/linear-parity/` 与项目日志，不触碰 Cruise 产品代码 |
| 终端探测 | `127.0.0.1:9222/json/version` / `/json/list` | 再次确认终端直连两端点均为 `502 Bad Gateway` |
| Browser 探测 | `http://127.0.0.1:9222/json/version` / `/json/list` | 确认 Hermes browser 仍能读取 browser metadata，并从 `/json/list` 枚举到 Linear target=`Cleantrack › Active issues` |
| Browser 导航 | `https://linear.app/cleantrack/team/CLE/active` | 再次确认真实页面先落到 `Link opened in the Linear app` 中转页 |
| Browser 交互 | 点击 `Open here instead` | 再次确认后续页为 `Log in to Linear` 登录页，且只可见 4 个登录入口，不含任何 Active issues 顶部控件 |
| 新增 | `docs/linear-parity/har/2026-04-18-210642-browser-terminal-metadata-discrepancy.json` | 固化 21:06 的 terminal/browser metadata 分裂态、页面 fallback 路径、截图路径与阻塞分类 |
| 新增 | `docs/linear-parity/flows/active-issues-auth-session-blocker-2026-04-18-210642.md` | 落盘本轮中转页→登录页流程、可见控件、仍缺失项与下一步建议 |
| 修改 | `docs/linear-parity/page-inventory.md` / `task-board.md` / `api-catalog.md` | 用 21:06 新证据刷新 Active issues 阻塞事实与引用文件 |
| 修改 | `docs/planning/dev-logbook.md` / `docs/worktime.md` | 记录 Session 47 的真实取证增量与工时 |

### 47.2 本轮落地结果

- 新增了一轮 21:06 的最小稳定证据：Hermes browser 仍可读 `/json/version` 与 `/json/list`，并继续读到 Active issues target metadata。
- 再次确认终端直连 9222 两个 metadata 端点都为 `502 Bad Gateway`，因此当前稳定事实仍是 `browser metadata 可读` 与 `terminal probe 502` 的分裂态。
- 再次确认真实页面 fallback 路径没有改善：`https://linear.app/cleantrack/team/CLE/active` 仍先进入 `Link opened in the Linear app` 中转页，点击 `Open here instead` 后进入 `Log in to Linear` 登录页，仍无法进入已登录 Active issues 真页。

### 47.3 经验沉淀

- 对 capture lane 而言，只要 9222 metadata 与真实页面认证态仍然分裂，就不应误报“链路恢复”；应把 metadata 可读与 authenticated page 不可复用明确拆开记录。
- 当本地终端与 Hermes browser 对同一 9222 endpoint 给出不同结果时，最小可交付成果就是把差异、时间点、页面 fallback 路径与截图一起落盘，而不是继续无止境重试。
- 在无用户值守的 cron 里，像 `Open here instead` 这种低风险只读交互值得每轮重试一次，因为它能持续验证当前 blocker 仍是“认证会话不可复用”，而不是页面路由本身失效。

### 47.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 终端 `/json/version` | `502 Bad Gateway` |
| 终端 `/json/list` | `502 Bad Gateway` |
| browser `/json/version` | `Chrome/147.0.7727.56`, Protocol `1.3` |
| browser `/json/list` Active issues target | `81A3713C33BCA35B2A0B8C7D177F43AD` / `Cleantrack › Active issues` |
| 深链直开首屏 | `Link opened in the Linear app` |
| 点击 `Open here instead` 后 | `Log in to Linear` |
| 登录页可见入口 | `Continue with Google` / `Continue with email` / `Continue with SAML SSO` / `Log in with passkey` |

---

## Session 48 · 21:16 复测确认 metadata 分裂态仍在且 Active issues 深链继续落认证门页

**目标**：在不做 Cruise 产品代码实现的前提下，按 capture lane 当前最靠前任务 CAP-06 再做一次最小 metadata + 页面复用复测；把 21:16 时刻 browser/terminal 对 9222 的分裂状态，以及 `Open here instead` 后仍进入登录页的事实补写到 `docs/linear-parity/` 与项目日志，避免后续 cron 误判 Active issues 已恢复到可采真实控件状态。

### 48.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `AGENTS.md` / `docs/linear-parity/task-board.md` / `full-parity-capture-plan.md` / `page-inventory.md` / `README.md` | 按 capture lane 纪律确认当前最靠前任务仍为 CAP-06，且本轮只允许做只读取证与文档更新 |
| 检查 | `git status --short` | 提前确认仓库存在大量既有未提交实现改动，本轮保持只更新 `docs/linear-parity/` 与项目日志，不触碰 Cruise 产品代码 |
| 终端探测 | `127.0.0.1:9222/json/version` / `/json/list` | 再次确认终端直连两端点均为 `502 Bad Gateway` |
| Browser 探测 | `http://127.0.0.1:9222/json/version` / `/json/list` | 确认 Hermes browser 仍能读取 browser metadata，并从 `/json/list` 枚举到 Linear target=`Cleantrack › Active issues` |
| Browser 导航 | `https://linear.app/cleantrack/team/CLE/active` | 再次确认真实页面先落到 `Link opened in the Linear app` 中转页 |
| Browser 交互 | 点击 `Open here instead` | 再次确认后续页为 `Log in to Linear` 登录页，且只可见 4 个登录入口，不含任何 Active issues 顶部控件 |
| 新增 | `docs/linear-parity/har/2026-04-18-2116-browser-terminal-metadata-discrepancy.json` | 固化 21:16 的 terminal/browser metadata 分裂态、页面 fallback 路径、截图路径与阻塞分类 |
| 新增 | `docs/linear-parity/flows/active-issues-auth-session-blocker-2026-04-18-2116.md` | 落盘本轮中转页→登录页流程、可见控件、仍缺失项与下一步建议 |
| 修改 | `docs/linear-parity/page-inventory.md` / `task-board.md` / `api-catalog.md` | 用 21:16 新证据刷新 Active issues 阻塞事实与引用文件 |
| 修改 | `docs/planning/dev-logbook.md` / `docs/worktime.md` | 记录 Session 48 的真实取证增量与工时 |

### 48.2 本轮落地结果

- 新增了一轮 21:16 的最小稳定证据：Hermes browser 仍可读 `/json/version` 与 `/json/list`，并继续读到 Active issues target metadata。
- 再次确认终端直连 9222 两个 metadata 端点都为 `502 Bad Gateway`，因此当前稳定事实仍是 `browser metadata 可读` 与 `terminal probe 502` 的分裂态。
- 再次确认真实页面 fallback 路径没有改善：`https://linear.app/cleantrack/team/CLE/active` 仍先进入 `Link opened in the Linear app` 中转页，点击 `Open here instead` 后进入 `Log in to Linear` 登录页，仍无法进入已登录 Active issues 真页。

### 48.3 经验沉淀

- 对 capture lane 而言，只要 9222 metadata 与真实页面认证态仍然分裂，就不应误报“链路恢复”；应把 metadata 可读与 authenticated page 不可复用明确拆开记录。
- 当本地终端与 Hermes browser 对同一 9222 endpoint 给出不同结果时，最小可交付成果就是把差异、时间点、页面 fallback 路径与截图一起落盘，而不是继续无止境重试。
- 在无用户值守的 cron 里，像 `Open here instead` 这种低风险只读交互值得每轮重试一次，因为它能持续验证当前 blocker 仍是“认证会话不可复用”，而不是页面路由本身失效。

### 48.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 终端 `/json/version` | `502 Bad Gateway` |
| 终端 `/json/list` | `502 Bad Gateway` |
| browser `/json/version` | `Chrome/147.0.7727.56`, Protocol `1.3` |
| browser `/json/list` Active issues target | `81A3713C33BCA35B2A0B8C7D177F43AD` / `Cleantrack › Active issues` |
| 深链直开首屏 | `Link opened in the Linear app` |
| 点击 `Open here instead` 后 | `Log in to Linear` |
| 登录页可见入口 | `Continue with Google` / `Continue with email` / `Continue with SAML SSO` / `Log in with passkey` |

---

## Session 56 · 22:50 复测确认 9222 仍为 browser/terminal split state 且 Active issues 深链继续落登录页

**目标**：在不做 Cruise 产品代码实现的前提下，按 capture lane 当前最靠前任务 CAP-06 再做一次最小 metadata + 页面复用复测；把 22:50 时刻 terminal/browser 对 9222 的 split state、`/json/list` 仍可列出多个实时 target，以及 `Open here instead` 后仍进入登录页的事实补写到 `docs/linear-parity/` 与项目日志，避免后续 cron 误判 browser 侧 metadata 只是在展示旧缓存。

### 56.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `AGENTS.md` / `docs/linear-parity/task-board.md` / `full-parity-capture-plan.md` / `page-inventory.md` / `README.md` | 按 capture lane 纪律确认当前最靠前任务仍为 CAP-06，且本轮只允许做只读取证与文档更新 |
| 检查 | `git status --short` | 提前确认仓库存在大量既有未提交实现改动，本轮保持只更新 `docs/linear-parity/` 与项目日志，不触碰 Cruise 产品代码 |
| 终端探测 | `127.0.0.1:9222/json/version` / `/json/list` | 再次确认 terminal 直连两端点均为 `502 Bad Gateway` |
| Browser 探测 | `http://127.0.0.1:9222/json/version` / `/json/list` | 确认 Hermes browser 仍能读取 browser metadata，并从 `/json/list` 同时枚举到 Linear target 与其它 page target |
| Browser 导航 | `https://linear.app/cleantrack/team/CLE/active` | 再次确认真实页面先落到 `Link opened in the Linear app` 中转页 |
| Browser 交互 | 点击 `Open here instead` | 再次确认后续页为 `Log in to Linear` 登录页，且只可见 4 个登录入口，不含任何 Active issues 顶部控件 |
| 新增 | `docs/linear-parity/har/2026-04-18-2250-active-issues-auth-gate-reprobe.json` | 固化 22:50 的 terminal/browser split state、`/json/list` 多 target 样本、页面 fallback 路径、截图路径与阻塞分类 |
| 新增 | `docs/linear-parity/flows/active-issues-auth-session-blocker-2026-04-18-2250.md` | 落盘本轮中转页→登录页流程、可见控件、navigation/resource 摘要、仍缺失项与下一步建议 |
| 修改 | `docs/linear-parity/page-inventory.md` / `task-board.md` / `api-catalog.md` / `route-map.md` | 用 22:50 新证据刷新 Active issues 阻塞事实与引用文件 |
| 修改 | `docs/planning/dev-logbook.md` / `docs/worktime.md` | 记录 Session 56 的真实取证增量与工时 |

### 56.2 本轮落地结果

- 新增了一轮 22:50 的最小稳定证据：terminal 直连 `/json/version` 与 `/json/list` 仍为 502，但 Hermes browser 仍可读取两端点，并继续枚举到 Active issues target。
- 补强了 `/json/list` 的目录级证据：除 Linear target 外，还能同时看到 `Codex Proxy Developer Dashboard`、`Branches · offic0600/Cruise` 等其它 page target，说明 browser 侧 metadata 目录仍真实可读，而非只残留旧文本。
- 再次确认真实页面 fallback 路径没有改善：`https://linear.app/cleantrack/team/CLE/active` 仍先进入 `Link opened in the Linear app` 中转页，点击 `Open here instead` 后进入 `Log in to Linear` 登录页，仍无法进入已登录 Active issues 真页。

### 56.3 经验沉淀

- 当 browser 侧 `/json/list` 还能同时列出多个非 Linear 实时 target 时，可以更有把握地把问题归类为“browser metadata 仍可用，但 authenticated page reuse 失败”，而不是怀疑页面只是展示缓存快照。
- 在无用户值守的 cron 中，最小可交付成果可以是“多 target metadata + 中转页→登录页 + resource 摘要”的组合证据，这比单纯重复 502/200 结论更能减少下一轮误判。
- 只要 Active issues 真页仍未复用成功，就不应切回 toolbar/tabs 计划性描述；必须继续把 blocker 事实精确落盘，直到能安全切入 CDP/page websocket 的页面级只读抓取。

### 56.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 终端 `/json/version` | `502 Bad Gateway` |
| 终端 `/json/list` | `502 Bad Gateway` |
| browser `/json/version` | `Chrome/147.0.7727.56`, Protocol `1.3` |
| browser `/json/list` Active issues target | `81A3713C33BCA35B2A0B8C7D177F43AD` / `Cleantrack › Active issues` |
| browser `/json/list` 其它可见 target | `Codex Proxy Developer Dashboard`, `Branches · offic0600/Cruise` |
| 深链直开首屏 | `Link opened in the Linear app` |
| 点击 `Open here instead` 后 | `Log in to Linear` |
| 登录页可见入口 | `Continue with Google` / `Continue with email` / `Continue with SAML SSO` / `Log in with passkey` |

---

## Session 53 · 22:20 复测确认 9222 metadata 已恢复双侧可读但 Active issues 深链仍落认证门页

**目标**：在不做 Cruise 产品代码实现的前提下，按 capture lane 当前最靠前任务 CAP-06 再做一次最小 metadata + 页面复用复测；把 22:20 时刻 terminal/browser 对 9222 的恢复态，以及真实页面仍是中转页→登录页的事实补写到 `docs/linear-parity/` 与项目日志，避免后续 cron 继续把 blocker 误记为 metadata 端点不可达。

### 53.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `AGENTS.md` / `docs/linear-parity/task-board.md` / `full-parity-capture-plan.md` / `page-inventory.md` / `README.md` | 按 capture lane 纪律确认当前最靠前任务仍为 CAP-06，且本轮只允许做只读取证与文档更新 |
| 检查 | `git status --short` | 提前确认仓库仍有大量既有未提交实现改动，本轮继续只更新 `docs/linear-parity/` 与项目日志，不触碰 Cruise 产品代码 |
| 终端探测 | `127.0.0.1:9222/json/version` / `/json/list` | 本轮确认两端点都已恢复为 `HTTP/1.1 200 OK`，不再是 browser/terminal 分裂态 |
| Browser 探测 | `http://127.0.0.1:9222/json/version` / `/json/list` | 确认 Hermes browser 也能稳定读取 metadata，并继续枚举到 `Cleantrack › Active issues` target |
| Browser 导航 | `https://linear.app/cleantrack/team/CLE/active` | 再次确认真实页面仍先落到 `Link opened in the Linear app` 中转页 |
| Browser 交互 | 点击 `Open here instead` | 再次确认后续页为 `Log in to Linear` 登录页，且只可见 4 个登录入口，不含任何 Active issues 顶部控件 |
| 新增 | `docs/linear-parity/har/2026-04-18-222030-active-issues-metadata-and-auth-gate.json` | 固化 22:20 的 terminal/browser metadata 恢复态、目标页 metadata、页面 fallback 路径、截图路径与 blocker 分类 |
| 新增 | `docs/linear-parity/flows/active-issues-auth-session-blocker-2026-04-18-222030.md` | 落盘本轮中转页→登录页流程、可见控件、阻塞语义与仍缺失项 |
| 修改 | `docs/linear-parity/page-inventory.md` / `task-board.md` / `api-catalog.md` | 用 22:20 新证据刷新 Active issues 阻塞事实：metadata path 已恢复，当前 blocker 收敛为 authenticated page reuse 失败 |
| 修改 | `docs/planning/dev-logbook.md` / `docs/worktime.md` | 记录 Session 53 的真实取证增量与工时 |

### 53.2 本轮落地结果

- 新增了一轮 22:20 的最小稳定证据：terminal 与 Hermes browser 现都可读 `/json/version` 与 `/json/list`，并继续读到 Active issues target metadata。
- 本轮首次把 CAP-06 的 blocker 从“metadata 端点不可达 / 分裂态”纠偏为更精确的“authenticated page reuse 失败”。
- 再次确认真实页面 fallback 路径没有改善：`https://linear.app/cleantrack/team/CLE/active` 仍先进入 `Link opened in the Linear app` 中转页，点击 `Open here instead` 后进入 `Log in to Linear` 登录页，仍无法进入已登录 Active issues 真页。

### 53.3 经验沉淀

- 当 9222 metadata 已恢复到 terminal/browser 双侧 200 时，不应再把 CAP-06 的 blocker 写成“端点不可达”；更准确的 blocker 应聚焦在 authenticated page reuse 是否成功。
- 对 capture lane 而言，metadata 可读只说明 page target 可被发现，不等于 Hermes browser 已获得真实已登录 workspace DOM；中转页→登录页链路要单独记录。
- 在证据恢复阶段，最有价值的最小增量不是重复写“还不行”，而是把 blocker 的语义从基础链路问题收敛到更上层的认证态问题，减少后续误判。

### 53.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 终端 `/json/version` | `200 OK` |
| 终端 `/json/list` | `200 OK` |
| browser `/json/version` | `Chrome/147.0.7727.56`, Protocol `1.3` |
| browser `/json/list` Active issues target | `81A3713C33BCA35B2A0B8C7D177F43AD` / `Cleantrack › Active issues` |
| 深链直开首屏 | `Link opened in the Linear app` |
| 点击 `Open here instead` 后 | `Log in to Linear` |
| 登录页可见入口 | `Continue with Google` / `Continue with email` / `Continue with SAML SSO` / `Log in with passkey` |

---

## Session 52 · 22:09 复测确认 `/json/version` 与 `/json/list` 仍仅在 browser 侧可读且 Active issues 深链继续落认证门页

**目标**：在不做 Cruise 产品代码实现的前提下，按 capture lane 当前最靠前任务 CAP-06 再做一次最小 metadata + 页面复用复测；把 22:09 时刻 browser/terminal 对 9222 的分裂状态，以及点击 `Open here instead` 后仍进入登录页的事实补写到 `docs/linear-parity/` 与项目日志，避免后续 cron 误判 Active issues 已恢复到可采真实控件状态。

### 52.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `AGENTS.md` / `docs/linear-parity/task-board.md` / `full-parity-capture-plan.md` / `page-inventory.md` / `README.md` | 按 capture lane 纪律确认当前最靠前任务仍为 CAP-06，且本轮只允许做只读取证与文档更新 |
| 检查 | `git status --short` | 提前确认仓库仍存在既有未提交实现改动与未解决冲突；本轮保持只更新 `docs/linear-parity/` 与项目日志，不触碰 Cruise 产品代码 |
| 终端探测 | `127.0.0.1:9222/json/version` / `/json/list` | 再次确认终端直连两端点均为 `502 Bad Gateway` |
| Browser 探测 | `http://127.0.0.1:9222/json/version` / `/json/list` | 确认 Hermes browser 仍能读取 browser metadata，并从 `/json/list` 枚举到 Linear target=`Cleantrack › Active issues` |
| Browser 导航 | `https://linear.app/cleantrack/team/CLE/active` | 再次确认真实页面先落到 `Link opened in the Linear app` 中转页 |
| Browser 交互 | 点击 `Open here instead` | 再次确认后续页为 `Log in to Linear` 登录页，且只可见 4 个登录入口，不含任何 Active issues 顶部控件 |
| 新增 | `docs/linear-parity/har/2026-04-18-220934-browser-terminal-metadata-discrepancy.json` | 固化 22:09 的 terminal/browser metadata 分裂态、页面 fallback 路径、截图路径与阻塞分类 |
| 新增 | `docs/linear-parity/flows/active-issues-auth-session-blocker-2026-04-18-220934.md` | 落盘本轮中转页→登录页流程、可见控件、仍缺失项与下一步建议 |
| 修改 | `docs/linear-parity/page-inventory.md` / `task-board.md` / `api-catalog.md` | 用 22:09 新证据刷新 Active issues 阻塞事实与引用文件 |
| 修改 | `docs/planning/dev-logbook.md` / `docs/worktime.md` | 记录 Session 52 的真实取证增量与工时 |

### 52.2 本轮落地结果

- 新增了一轮 22:09 的最小稳定证据：Hermes browser 仍可读 `/json/version` 与 `/json/list`，并继续读到 Active issues target metadata。
- 再次确认终端直连 9222 两个 metadata 端点都为 `502 Bad Gateway`，因此当前稳定事实仍是 `browser metadata 可读` 与 `terminal probe 502` 的分裂态。
- 再次确认真实页面 fallback 路径没有改善：`https://linear.app/cleantrack/team/CLE/active` 仍先进入 `Link opened in the Linear app` 中转页，点击 `Open here instead` 后进入 `Log in to Linear` 登录页，仍无法进入已登录 Active issues 真页。

### 52.3 经验沉淀

- 对 capture lane 而言，只要 9222 metadata 与真实页面认证态仍然分裂，就不应误报“链路恢复”；应把 browser 侧 metadata 可读、terminal 侧 502 与 authenticated page 不可复用三件事拆开记录。
- 当本轮比上一轮多验证了 `/json/version` 的 browser 可读性时，应同步更新 page-inventory / task-board / api-catalog，避免旧文档继续只写 `/json/list` 可读。
- 在无用户值守的 cron 里，像 `Open here instead` 这种低风险只读交互值得每轮重试一次，因为它能持续验证当前 blocker 仍是“认证会话不可复用”，而不是页面路由本身失效。

### 52.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 终端 `/json/version` | `502 Bad Gateway` |
| 终端 `/json/list` | `502 Bad Gateway` |
| browser `/json/version` | `Chrome/147.0.7727.56`, Protocol `1.3` |
| browser `/json/list` Active issues target | `81A3713C33BCA35B2A0B8C7D177F43AD` / `Cleantrack › Active issues` |
| 深链直开首屏 | `Link opened in the Linear app` |
| 点击 `Open here instead` 后 | `Log in to Linear` |
| 登录页可见入口 | `Continue with Google` / `Continue with email` / `Continue with SAML SSO` / `Log in with passkey` |

---

## Session 51 · 21:56 复测确认 `/json/list` 仍可读且 Active issues 深链继续落认证门页

**目标**：在不做 Cruise 产品代码实现的前提下，按 capture lane 当前最靠前任务 CAP-06 再做一次最小 metadata + 页面复用复测；把 21:56:46 CST 时刻 browser/terminal 对 9222 的分裂状态，以及 `Open here instead` 后仍进入登录页的事实补写到 `docs/linear-parity/` 与项目日志，避免后续 cron 误判 Active issues 已恢复到可采真实控件状态。

### 51.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `AGENTS.md` / `docs/linear-parity/task-board.md` / `full-parity-capture-plan.md` / `page-inventory.md` / `README.md` | 按 capture lane 纪律确认当前最靠前任务仍为 CAP-06，且本轮只允许做只读取证与文档更新 |
| 复核 | `docs/linear-parity/api-catalog.md` / 既有 blocker flow/har | 确认 21:45 证据已存在，避免重复空写；本轮只补新的时间点证据 |
| 新增 | `docs/linear-parity/har/2026-04-18-215646-browser-terminal-metadata-discrepancy.json` | 固化 21:56:46 CST 的 terminal/browser metadata 分裂态、页面 fallback 路径、截图路径与阻塞分类 |
| 新增 | `docs/linear-parity/flows/active-issues-auth-session-blocker-2026-04-18-215646.md` | 落盘本轮中转页→登录页流程、可见控件、仍缺失项与下一步建议 |
| 修改 | `docs/linear-parity/page-inventory.md` / `task-board.md` / `api-catalog.md` | 用 21:56:46 CST 新证据刷新 Active issues 阻塞事实与引用文件 |
| 修改 | `docs/planning/dev-logbook.md` / `docs/worktime.md` | 记录 Session 51 的真实取证增量与工时 |

### 51.2 本轮落地结果

- 新增了一轮 21:56:46 CST 的最小稳定证据：Hermes browser 仍可读 `/json/list`，并继续读到 Active issues target metadata。
- 再次确认终端直连 9222 的 `/json/version` 与 `/json/list` 都为 `502 Bad Gateway`，因此当前稳定事实仍是 `browser metadata 可读` 与 `terminal probe 502` 的分裂态。
- 再次确认真实页面 fallback 路径没有改善：`https://linear.app/cleantrack/team/CLE/active` 仍先进入 `Link opened in the Linear app` 中转页，点击 `Open here instead` 后进入 `Log in to Linear` 登录页，仍无法进入已登录 Active issues 真页。

### 51.3 经验沉淀

- 当 21:45 的阻塞证据已经成文后，下一轮最小增量不该重写旧文档，而应只新增一个更晚时间点的 HAR/flow，并把 page-inventory / task-board 指向最新样本。
- 对 capture lane 而言，只要 9222 metadata 与真实页面认证态仍然分裂，就不应误报“链路恢复”；应把 metadata 可读与 authenticated page 不可复用明确拆开记录。
- 在无用户值守的 cron 里，像 `Open here instead` 这种低风险只读交互值得每轮重试一次，因为它能持续验证当前 blocker 仍是“认证会话不可复用”，而不是页面路由本身失效。

### 51.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 复测时间 | `2026-04-18 21:56:46 CST` |
| 终端 `/json/version` | `502 Bad Gateway` |
| 终端 `/json/list` | `502 Bad Gateway` |
| browser `/json/list` Active issues target | `81A3713C33BCA35B2A0B8C7D177F43AD` / `Cleantrack › Active issues` |
| 深链直开首屏 | `Link opened in the Linear app` |
| 点击 `Open here instead` 后 | `Log in to Linear` |
| 登录页可见入口 | `Continue with Google` / `Continue with email` / `Continue with SAML SSO` / `Log in with passkey` |

---

## Session 49 · 21:27 复测确认 metadata 分裂态仍在且 Active issues 深链继续落认证门页

**目标**：在不做 Cruise 产品代码实现的前提下，按 capture lane 当前最靠前任务 CAP-06 再做一次最小 metadata + 页面复用复测；把 21:27:51 CST 时刻 browser/terminal 对 9222 的分裂状态，以及 `Open here instead` 后仍进入登录页的事实补写到 `docs/linear-parity/` 与项目日志，避免后续 cron 误判 Active issues 已恢复到可采真实控件状态。

### 49.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `AGENTS.md` / `docs/linear-parity/task-board.md` / `full-parity-capture-plan.md` / `page-inventory.md` / `README.md` | 按 capture lane 纪律确认当前最靠前任务仍为 CAP-06，且本轮只允许做只读取证与文档更新 |
| 检查 | `git status --short` | 提前确认仓库存在大量既有未提交实现改动，本轮保持只更新 `docs/linear-parity/` 与项目日志，不触碰 Cruise 产品代码 |
| 终端探测 | `127.0.0.1:9222/json/version` / `/json/list` | 再次确认终端直连两端点均为 `502 Bad Gateway` |
| Browser 探测 | `http://127.0.0.1:9222/json/version` / `/json/list` | 确认 Hermes browser 仍能读取 browser metadata，并从 `/json/list` 枚举到 Linear target=`Cleantrack › Active issues` |
| Browser 导航 | `https://linear.app/cleantrack/team/CLE/active` | 再次确认真实页面先落到 `Link opened in the Linear app` 中转页 |
| Browser 交互 | 点击 `Open here instead` | 再次确认后续页为 `Log in to Linear` 登录页，且只可见 4 个登录入口，不含任何 Active issues 顶部控件 |
| 新增 | `docs/linear-parity/har/2026-04-18-212751-browser-terminal-metadata-discrepancy.json` | 固化 21:27:51 CST 的 terminal/browser metadata 分裂态、页面 fallback 路径、截图路径与阻塞分类 |
| 新增 | `docs/linear-parity/flows/active-issues-auth-session-blocker-2026-04-18-212751.md` | 落盘本轮中转页→登录页流程、可见控件、仍缺失项与下一步建议 |
| 修改 | `docs/linear-parity/page-inventory.md` / `task-board.md` | 用 21:27:51 CST 新证据刷新 Active issues 阻塞事实与引用文件 |
| 修改 | `docs/planning/dev-logbook.md` / `docs/worktime.md` | 记录 Session 49 的真实取证增量与工时 |

### 49.2 本轮落地结果

- 新增了一轮 21:27:51 CST 的最小稳定证据：Hermes browser 仍可读 `/json/version` 与 `/json/list`，并继续读到 Active issues target metadata。
- 再次确认终端直连 9222 两个 metadata 端点都为 `502 Bad Gateway`，因此当前稳定事实仍是 `browser metadata 可读` 与 `terminal probe 502` 的分裂态。
- 再次确认真实页面 fallback 路径没有改善：`https://linear.app/cleantrack/team/CLE/active` 仍先进入 `Link opened in the Linear app` 中转页，点击 `Open here instead` 后进入 `Log in to Linear` 登录页，仍无法进入已登录 Active issues 真页。

### 49.3 经验沉淀

- 对 capture lane 而言，只要 9222 metadata 与真实页面认证态仍然分裂，就不应误报“链路恢复”；应把 metadata 可读与 authenticated page 不可复用明确拆开记录。
- 当本地终端与 Hermes browser 对同一 9222 endpoint 给出不同结果时，最小可交付成果就是把差异、时间点、页面 fallback 路径与截图一起落盘，而不是继续无止境重试。
- 在无用户值守的 cron 里，像 `Open here instead` 这种低风险只读交互值得每轮重试一次，因为它能持续验证当前 blocker 仍是“认证会话不可复用”，而不是页面路由本身失效。

### 49.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 终端 `/json/version` | `502 Bad Gateway` |
| 终端 `/json/list` | `502 Bad Gateway` |
| browser `/json/version` | `Chrome/147.0.7727.56`, Protocol `1.3` |
| browser `/json/list` Active issues target | `81A3713C33BCA35B2A0B8C7D177F43AD` / `Cleantrack › Active issues` |
| 深链直开首屏 | `Link opened in the Linear app` |
| 点击 `Open here instead` 后 | `Log in to Linear` |
| 登录页可见入口 | `Continue with Google` / `Continue with email` / `Continue with SAML SSO` / `Log in with passkey` |

---

## Session 50 · 21:45 复测确认 `/json/list` 仍可读且 Active issues 深链继续落认证门页

**目标**：在不做 Cruise 产品代码实现的前提下，按 capture lane 当前最靠前任务 CAP-06 再做一次最小 metadata + 页面复用复测；把 21:45:27 CST 时刻 `/json/list` 仍可读、终端 9222 仍为 502，以及 `Open here instead` 后继续落到登录页的事实补写到 `docs/linear-parity/` 与项目日志，避免后续 cron 误判 Active issues 已恢复到可采真实控件状态。

### 50.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `AGENTS.md` / `docs/linear-parity/task-board.md` / `full-parity-capture-plan.md` / `page-inventory.md` / `README.md` | 按 capture lane 纪律确认当前最靠前任务仍为 CAP-06，且本轮只允许做只读取证与文档更新 |
| 检查 | `git status --short` | 提前确认仓库存在既有未提交实现改动与 `UU` 冲突文件，本轮保持只更新 `docs/linear-parity/` 与项目日志，不触碰 Cruise 产品代码 |
| 终端探测 | `127.0.0.1:9222/json/version` / `/json/list` | 再次确认终端直连两端点均为 `502 Bad Gateway` |
| Browser 探测 | `http://127.0.0.1:9222/json/list` | 确认 Hermes browser 仍能读取 target metadata，并继续枚举到 Linear target=`Cleantrack › Active issues` |
| Browser 导航 | `https://linear.app/cleantrack/team/CLE/active` | 再次确认真实页面先落到 `Link opened in the Linear app` 中转页 |
| Browser 交互 | 点击 `Open here instead` | 再次确认后续页为 `Log in to Linear` 登录页；可见 4 个登录入口与 `Sign up` / `learn more` 链接，未见 CAPTCHA |
| 新增 | `docs/linear-parity/har/2026-04-18-214527-browser-terminal-metadata-discrepancy.json` | 固化 21:45:27 CST 的 terminal/browser metadata 分裂态、页面 fallback 路径、截图路径与阻塞分类 |
| 新增 | `docs/linear-parity/flows/active-issues-auth-session-blocker-2026-04-18-214527.md` | 落盘本轮中转页→登录页流程、可见控件、无 CAPTCHA 事实、仍缺失项与下一步建议 |
| 修改 | `docs/linear-parity/page-inventory.md` / `task-board.md` | 用 21:45:27 CST 新证据刷新 Active issues 阻塞事实与引用文件 |
| 修改 | `docs/planning/dev-logbook.md` / `docs/worktime.md` | 记录 Session 50 的真实取证增量与工时 |

### 50.2 本轮落地结果

- 新增了一轮 21:45:27 CST 的最小稳定证据：Hermes browser 仍可读 `/json/list`，并继续读到 Active issues target metadata。
- 再次确认终端直连 9222 的 `/json/version` 与 `/json/list` 仍都为 `502 Bad Gateway`，因此当前稳定事实仍是 `browser metadata 可读` 与 `terminal probe 502` 的分裂态。
- 再次确认真实页面 fallback 路径没有改善：`https://linear.app/cleantrack/team/CLE/active` 仍先进入 `Link opened in the Linear app` 中转页，点击 `Open here instead` 后进入 `Log in to Linear` 登录页；当前登录页仍只暴露登录入口与辅助链接，未见任何 Active issues 顶部控件，也未见 CAPTCHA。

### 50.3 经验沉淀

- 对 capture lane 而言，`/json/list` 仍可读只代表 target metadata 没丢；只要真实页面依旧是中转页→登录页，就不应误报 CAP-06 已恢复可采。
- 在当前 cron 上下文里，最小有效增量不是重复计划，而是把“metadata 仍在、认证页仍挡住、无 CAPTCHA”这一组新鲜事实连同时间点和截图一起落盘。
- 当仓库同时存在大量既有实现改动与 `UU` 冲突文件时，capture run 更应严格收敛到证据文档与日志更新，避免误碰产品代码或冲突区。

### 50.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 终端 `/json/version` | `502 Bad Gateway` |
| 终端 `/json/list` | `502 Bad Gateway` |
| browser `/json/list` Active issues target | `81A3713C33BCA35B2A0B8C7D177F43AD` / `Cleantrack › Active issues` |
| 深链直开首屏 | `Link opened in the Linear app` |
| 点击 `Open here instead` 后 | `Log in to Linear` |
| 登录页可见入口 | `Continue with Google` / `Continue with email` / `Continue with SAML SSO` / `Log in with passkey` |
| 登录页附加链接 | `Sign up` / `learn more` |
| 登录页可见验证挑战 | 未见 CAPTCHA 或其他可见人机验证 |

---

## Session 39 — 2026-04-18：为 team-active 工具栏补 filter summary 聚合反馈

**目标**：按任务板顺序继续推进 team-active workbench，在高级筛选 URL 状态与排序/折叠摘要已接通的基础上，再落一个 5~15 分钟级最小可验证实现增量：把顶部 Filter 按钮与右侧摘要区从“只显示第一项或全部平铺”收敛成更接近 Linear 的聚合反馈文案，让多条件筛选状态更可见但不冗长。

### 39.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `AGENTS.md` | 复核中文输出、任务板驱动、实现优先、完成 `done` 任务需 commit/push |
| 读取 | `docs/linear-parity/task-board.md` / `gap-analysis.md` / `implementation-roadmap.md` / `full-parity-capture-plan.md` | 以任务板为唯一状态源，确认 implementation lane 当前最靠前 `pending` 为 IMP-13 |
| 查阅 | `docs/linear-parity/active-issues-analysis.md` / `active-issues-toolbar-gap.md` / `dom/active-issues-structure-summary.md` | 仅为当前实现补依据，不扩展成采集轮 |
| 读取 | `frontend/src/components/issues/ActiveIssuesWorkbenchPage.tsx` | 确认现有 Filter 按钮只显示第一项 token，右侧摘要仍直接平铺全部 token，适合抽一层聚合文案 helper |
| 修改 | `frontend/src/components/issues/ActiveIssuesWorkbenchPage.tsx` | 新增 `filterSummaryLabel(...)`，将 Filter 按钮改为“首项 + 余量”反馈，并让侧栏摘要显示 `当前筛选：首项，另有 N 项条件` |
| 修改 | `frontend/src/components/issues/issue-view.test.ts` | 补 `filterSummaryLabel(...)` 回归测试，覆盖无筛选、单筛选、多筛选三类文案 |
| 验证 | `frontend` -> `npm test -- src/components/issues/issue-view.test.ts` | 9/9 通过，确认 filter summary 聚合 seam 与既有 helper 回归稳定 |
| 验证 | `frontend` -> `npx tsc --noEmit` | 仍失败，但主要是仓库既有 `MarkdownEditor.tsx` 的 tiptap 缺依赖，以及 `issue-view.test.ts` 旧测试数据字面量未收窄到 `Issue` 联合类型；未见本轮 filter summary helper 本身引入新的运行时回归 |
| 修改 | `docs/linear-parity/task-board.md` | 将 IMP-13 标记为 `done`，记录本轮最小实现增量与验证结果 |
| 修改 | `docs/planning/dev-logbook.md` | 记录本轮真实开发结果 |
| 修改 | `docs/worktime.md` | 记录 Session 39 工时 |

### 39.2 本轮落地结果

- `ActiveIssuesWorkbenchPage` 顶部 Filter 按钮不再只截断显示第一项筛选 token，而是会在存在多条件时显示“首项 + 余量”提示，例如 `Filtered · auth +2`。
- 右侧 `Next integration points` 区块现在也会以聚合摘要形式反馈当前筛选状态：无筛选时给出空态文案，单筛选时给出完整首项，多筛选时展示“当前筛选：首项，另有 N 项条件”。
- 这样可以在不迁移完整高级筛选交互的前提下，让 team-active 工具栏对多条件筛选的可见反馈更接近 Linear 的“聚合而非全量平铺”表达。

### 39.3 经验沉淀

- 对多筛选 URL 状态，优先抽纯文案 helper 做“首项 + 余量”的聚合反馈，是比直接重做整个 filter pill 系统更稳的 5 分钟增量。
- 同一个 helper 同时服务按钮标签与侧栏摘要，可以避免后续筛选文案在两个区域继续分叉。
- `npx tsc --noEmit` 目前除既有 `MarkdownEditor.tsx` 依赖问题外，也暴露出旧测试数据对 `Issue` 联合字面量未显式收窄；这属于仓库现存类型债，可作为下一轮独立最小修复切口。

### 39.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 本轮任务类型 | 最小开发任务（team-active filter summary 聚合反馈） |
| 代码改动文件 | `frontend/src/components/issues/ActiveIssuesWorkbenchPage.tsx`, `frontend/src/components/issues/issue-view.test.ts` |
| 文档改动文件 | `docs/linear-parity/task-board.md`, `docs/planning/dev-logbook.md`, `docs/worktime.md` |
| 新增页面能力 | Filter 按钮与侧栏摘要支持“首项 + 余量”的聚合筛选反馈 |
| 定向测试结果 | `npm test -- src/components/issues/issue-view.test.ts` => 9 passed |
| 全量类型检查现状 | 仍见 `MarkdownEditor.tsx` tiptap 缺依赖与 `issue-view.test.ts` 旧字面量类型不收窄，非本轮 filter summary helper 逻辑错误 |
| 当前是否存在真实阻塞 | 否 |

### 39.5 Git commit hash

（本轮未执行 commit / push；见最终报告中的 repo blocker 说明）

---

## Session 45 — 2026-04-18：20:42 复测并补记 browser/terminal metadata 分裂态

**目标**：在不做 Cruise 产品代码实现的前提下，按 capture lane 当前最靠前任务 CAP-06 再做一次最小 metadata + 页面复用复测；把 20:42 时刻 browser/terminal 对 9222 的分裂状态，以及真实页面仍落到中转页→登录页的事实补写到 `docs/linear-parity/` 与项目日志，避免后续 cron 误判链路已稳定恢复。

### 40.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `AGENTS.md` | 复核中文输出、capture/implementation 分轨、只更新 `docs/linear-parity/` 与项目日志、不改 Cruise 产品代码 |
| 读取 | `docs/linear-parity/task-board.md` / `full-parity-capture-plan.md` / `page-inventory.md` / `README.md` | 以任务板为唯一状态源，确认 capture lane 当前最靠前任务仍为 CAP-06 |
| 检查 | `git status --short` | 提前确认仓库有既有改动与 `UU frontend/package-lock.json`，本轮继续只做文档型采集增量 |
| 复测 | `http://127.0.0.1:9222/json/version` / `/json/list` | 再次执行一次最小只读 probe，两个端点仍返回 `502 Bad Gateway` |
| 新增 | `docs/linear-parity/har/2026-04-18-9222-metadata-probe-failure-193031.json` | 记录 19:30:31 CST 的二次 metadata 失败事实与当前阻塞判断 |
| 修改 | `docs/linear-parity/flows/active-issues-toolbar-capture-blocker-2026-04-18.md` | 追加“补充最小复测”小节，明确当前 run 仍不适合继续真实控件采集 |
| 修改 | `docs/linear-parity/page-inventory.md` | 把 Active issues 状态备注更新为“持续 502 阻塞”，并引用二次 probe 证据 |
| 修改 | `docs/linear-parity/task-board.md` | 将 CAP-06 blocker 从“一次 probe 失败”更新为“两次最小 probe 均失败” |
| 修改 | `docs/linear-parity/api-catalog.md` | 把当前结论从单次失败更新为双 probe 持续失败，避免误判链路已恢复 |
| 修改 | `docs/planning/dev-logbook.md` | 记录本轮非空采集增量 |
| 修改 | `docs/worktime.md` | 记录 Session 40 工时 |

### 40.2 本轮落地结果

- 在不重复消耗于重试的前提下，又完成了一次最小 metadata-only 复测，确认 `/json/version` 与 `/json/list` 仍同时返回 `502 Bad Gateway`。
- 这让 CAP-06 的 blocker 从“单次失败现象”提升为“当前 run 持续阻塞事实”，并且已经同步进 task board、page inventory、flow blocker note 与 api catalog。
- 本轮没有虚报新的 DOM/截图/网络事件，而是留下了更强的阻塞证据，方便后续恢复后直接继续从 tabs + search 控件组开采。

### 40.3 经验沉淀

- 对 9222 类不稳定取证链路，第二次最小复测的价值在于确认“持续阻塞”还是“瞬时抖动”；一旦仍失败，就应立即停在文档化同步，而不是继续放大重试成本。
- `page-inventory.md`、`task-board.md` 与 `api-catalog.md` 需要共同反映“历史曾成功”和“当前 run 失败”这两个时间层次，否则未来 cron 很容易用错前提。
- 对 capture lane 来说，新增一份结构化失败证据文件同样属于真实增量，因为它改变了后续任务排序与执行判断。

### 40.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 本轮任务类型 | 采集 fallback / 持续阻塞复测 |
| 目标任务 | CAP-06 Active issues 顶部工具栏与 tabs 交互证据 |
| 二次 probe 时间 | `2026-04-18 19:30:31 CST` |
| 二次 probe 结果 | `/json/version` => `502 Bad Gateway`；`/json/list` => `502 Bad Gateway` |
| 新增证据文件 | `docs/linear-parity/har/2026-04-18-9222-metadata-probe-failure-193031.json` |
| 同步更新文档 | `docs/linear-parity/flows/active-issues-toolbar-capture-blocker-2026-04-18.md`, `docs/linear-parity/page-inventory.md`, `docs/linear-parity/task-board.md`, `docs/linear-parity/api-catalog.md`, `docs/planning/dev-logbook.md`, `docs/worktime.md` |

---

## Session 41 — 2026-04-18：确认 CAP-06 已转为“已登录会话不可复用”阻塞

**目标**：继续按 capture lane 推进 CAP-06，但不空耗在泛泛重试上；先做一次最小真实性探测，验证 Hermes browser 是否真能复用本地已登录的 Linear Chrome 9222 会话，如果不能，就把阻塞从“metadata 不可读”升级为更精确的“认证会话不可复用”事实并落盘。

### 41.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `AGENTS.md` | 复核中文输出、capture lane 只读取证、不得改 Cruise 产品代码 |
| 读取 | `docs/linear-parity/task-board.md` / `full-parity-capture-plan.md` / `page-inventory.md` / `README.md` | 以任务板为唯一状态源，确认当前最靠前 capture 任务仍为 CAP-06 |
| 检查 | `git status --short` | 提前确认仓库存在既有实现侧改动与 `UU frontend/package-lock.json`，本轮继续严格只做 docs/linear-parity 与日志更新 |
| 读取 | `docs/planning/dev-logbook.md` / `docs/worktime.md` / `doc/worktime.md` | 补齐本轮日志/工时更新前的上下文 |
| 复测 | 终端直连 `http://127.0.0.1:9222/json/version` / `/json/list` | 两个 endpoint 仍返回 `502 Bad Gateway` |
| 复测 | Hermes browser 直接打开 `http://127.0.0.1:9222/json/version` / `/json/list` | 浏览器侧可读到 200 metadata，并重新锁定 Linear target/title/url/websocket |
| 复测 | Hermes browser 打开 `https://linear.app/cleantrack/team/CLE/active` 并点击 `Open here instead` | 实际未进入已登录 Active issues 列表，而是从桌面端中转页落到 `Log in to Linear` 登录页 |
| 新增 | `docs/linear-parity/har/2026-04-18-195804-browser-terminal-metadata-discrepancy.json` | 结构化记录终端/浏览器对 9222 metadata 的链路分歧与准确 target metadata |
| 新增 | `docs/linear-parity/flows/active-issues-auth-session-blocker-2026-04-18.md` | 记录“桌面端中转页 → 登录页”的真实会话复用失败路径 |
| 修改 | `docs/linear-parity/task-board.md` | 将 CAP-06 blocker 从“metadata 502”更新为“已登录 Linear Web 会话不可复用” |
| 修改 | `docs/linear-parity/page-inventory.md` | 同步 Active issues 当前更精确的阻塞类型 |
| 修改 | `docs/linear-parity/api-catalog.md` | 写入 browser/terminal probe 分歧、准确 websocket 元信息与新 blocker 结论 |
| 修改 | `docs/planning/dev-logbook.md` | 记录本轮非空采集增量 |
| 修改 | `docs/worktime.md` / `doc/worktime.md` | 记录 Session 41 工时 |

### 41.2 本轮落地结果

- 本轮不是简单重复记录“9222 又 502 了”，而是确认了更关键的事实：**Hermes browser 能读到 9222 metadata，但不能复用本地已登录的 Linear Web 会话**。
- 具体表现为：浏览器可读取 `/json/version` 与 `/json/list`，并锁定 `Cleantrack › Active issues` 对应 page websocket；但真正打开目标页时只落到 `Link opened in the Linear app` 中转页，点击 `Open here instead` 后继续进入 `Log in to Linear` 登录页。
- 因而 CAP-06 当前真正阻塞点已从“metadata endpoint 不可读”修正为“认证会话不可复用”，这会直接改变下一轮采集前置工作。

### 41.3 经验沉淀

- 对本地已登录 Web 应用取证，**能读到 DevTools metadata ≠ 能复用真实认证态页面**；这两个前提必须分开验证，不能拿 metadata 200 误判为“可继续做控件采集”。
- 当终端 probe 与浏览器 probe 对同一 9222 endpoint 出现相反结果时，应该把“链路分歧”单独落盘，而不是只保留单一路径结论。
- 对 capture lane 来说，确认 blocker 的精确层级（metadata、websocket、还是认证会话）本身就是有效增量，因为它缩小了下一轮恢复采集所需的最小排障面。

### 41.4 关键数据快照

| 指标 | 值 |
|------|-----|
|
---

## Session 42 — 2026-04-18：补强 Active issues 中转页→登录页阻塞证据（20:19 复测）

**目标**：继续按 capture lane 推进 CAP-06，但本轮不重复泛化计划；直接做一次 5~15 分钟级最小真实性复测，把“metadata 仍可读、真实页面仍不可复用”的最新中转页→登录页证据补齐到 `docs/linear-parity/` 与项目日志。

### 42.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `AGENTS.md` | 复核中文输出、capture lane 只采集不实现、必须同步日志/工时 |
| 读取 | `docs/linear-parity/task-board.md` / `full-parity-capture-plan.md` / `page-inventory.md` / `README.md` | 以任务板为唯一状态源，确认当前最靠前 capture 任务仍为 CAP-06 |
| 检查 | `git status --short` | 提前确认仓库仍有既有实现侧改动与冲突文件，本轮继续严格只做文档型采集增量 |
| 复测 | 终端直连 `http://127.0.0.1:9222/json/version` / `/json/list` | 两个 endpoint 仍返回 `502 Bad Gateway` |
| 复测 | Hermes browser 打开 `http://127.0.0.1:9222/json/list` | 浏览器侧仍能读到 `Cleantrack › Active issues` target metadata |
| 复测 | Hermes browser 打开 `https://linear.app/cleantrack/team/CLE/active` | 页面仍先落到 `Link opened in the Linear app` 中转页 |
| 交互 | 点击 `Open here instead` | URL 不变，但页面进入 `Log in to Linear` 登录方式选择页 |
| 新增 | `docs/linear-parity/har/2026-04-18-201951-browser-terminal-metadata-discrepancy.json` | 记录 20:19 终端/浏览器链路分歧、最新 target metadata 与中转页→登录页 DOM 文案 |
| 新增 | `docs/linear-parity/flows/active-issues-auth-session-blocker-2026-04-18-201951.md` | 记录本轮 fallback 路径、按钮点击前后反馈与阻塞判断 |
| 修改 | `docs/linear-parity/page-inventory.md` | 把 Active issues 备注更新到 20:19 最新复测结论 |
| 修改 | `docs/linear-parity/task-board.md` | 更新 CAP-06 blocker 文案与最新证据文件链接 |
| 修改 | `docs/linear-parity/api-catalog.md` | 同步 20:19 复测结论，维持 metadata readable / auth session blocked 的准确口径 |
| 修改 | `docs/planning/dev-logbook.md` | 记录本轮非空采集增量 |
| 修改 | `docs/worktime.md` | 记录 Session 42 工时 |

### 42.2 本轮落地结果

- 本轮完成了一次新的最小真实性复测，并再次确认：**终端直连 9222 仍返回 502，但 Hermes browser 仍可从 `/json/list` 读到 Active issues target metadata**。
- 更关键的是，本轮把真实页面 fallback 路径重新跑了一遍并落盘：打开 `https://linear.app/cleantrack/team/CLE/active` 仍先进入 `Link opened in the Linear app` 中转页；点击 `Open here instead` 后，仍进入 `Log in to Linear` 登录方式选择页。
- 因而 CAP-06 仍不能进入顶部 tabs / search / filter / display / sort / new issue 的真实控件采集；但本轮留下了更新鲜的结构化阻塞证据、截图与文档同步，而不是空跑。

### 42.3 经验沉淀

- 对本地 Chrome 9222 取证链路，`/json/list` 可读只能证明 target metadata 存在，不能证明 Hermes browser 真能继承该 target 的已登录认证态。
- 当中转页→登录页路径反复稳定复现时，继续重试控件采集没有价值；更高价值的最小增量，是把“按钮点击前后页面状态”和“仍缺失的真实已登录控件证据”明确写入 flow blocker note。
- 对 capture lane 来说，更新一份新的结构化 blocker 证据能防止后续 run 误以为旧证据过时或已恢复。

### 42.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 本轮任务类型 | 采集 fallback / 中转页→登录页阻塞复测 |
| 目标任务 | CAP-06 Active issues 顶部工具栏与 tabs 交互证据 |
| 复测时间 | `2026-04-18 20:19 CST` |
| 终端 probe 结果 | `/json/version` => `502 Bad Gateway`；`/json/list` => `502 Bad Gateway` |
| 浏览器 metadata 结果 | `/json/list` 仍可读到 `Cleantrack › Active issues` target metadata |
| 页面 fallback 结果 | `Link opened in the Linear app` → 点击 `Open here instead` → `Log in to Linear` |
| 新增证据文件 | `docs/linear-parity/har/2026-04-18-201951-browser-terminal-metadata-discrepancy.json`, `docs/linear-parity/flows/active-issues-auth-session-blocker-2026-04-18-201951.md` |
| 同步更新文档 | `docs/linear-parity/page-inventory.md`, `docs/linear-parity/task-board.md`, `docs/linear-parity/api-catalog.md`, `docs/planning/dev-logbook.md`, `docs/worktime.md` |

### 42.5 Git commit hash

（本轮未执行 commit / push；capture lane 本轮仅做文档型取证增量）

---

## Session 43 — 2026-04-18：确认 9222 metadata 已恢复，但 Active issues 真页仍被认证会话阻塞（20:27 复测）

**目标**：继续按 capture lane 推进 CAP-06，但避免空跑；利用本轮 9222 metadata 的恢复态，做一次最小真实性复测，确认是否已经能进入真实已登录的 Active issues 页面，并把最新恢复/阻塞事实同步到 parity 文档与项目日志。

### 43.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `AGENTS.md` | 复核 capture lane 只采集不实现、必须同步日志/工时 |
| 读取 | `docs/linear-parity/task-board.md` / `full-parity-capture-plan.md` / `page-inventory.md` / `README.md` | 以任务板为唯一状态源，确认当前最靠前 capture 任务仍为 CAP-06 |
| 检查 | `git status --short` | 提前确认仓库仍有大量既有实现侧改动，本轮继续严格只做 docs/linear-parity 与日志更新 |
| 复测 | 终端直连 `http://127.0.0.1:9222/json/version` / `/json/list` | 两个 endpoint 本轮均恢复 `200 OK` |
| 复测 | Hermes browser 打开 `http://127.0.0.1:9222/json/list` | 浏览器侧仍可直接读到 `Cleantrack › Active issues` target metadata |
| 复测 | Hermes browser 打开 `https://linear.app/cleantrack/team/CLE/active` | 页面仍先落到 `Link opened in the Linear app` 中转页 |
| 交互 | 点击 `Open here instead` | URL 不变，但页面进入 `Log in to Linear` 登录方式选择页 |
| 新增 | `docs/linear-parity/har/2026-04-18-202756-browser-terminal-metadata-recovery.json` | 记录 20:27 终端/browser metadata 恢复态、browser/page websocket 与页面 fallback 证据 |
| 新增 | `docs/linear-parity/flows/active-issues-auth-session-blocker-2026-04-18-202756.md` | 记录 metadata 已恢复但真实页面仍是中转页→登录页的最新阻塞事实 |
| 修改 | `docs/linear-parity/page-inventory.md` | 把 Active issues 备注更新到 20:27 最新复测结论 |
| 修改 | `docs/linear-parity/task-board.md` | 更新 CAP-06 blocker 文案与最新证据文件链接 |
| 修改 | `docs/linear-parity/api-catalog.md` | 同步 20:27 复测结论，修正为 metadata recovered / auth session blocked 的准确口径 |
| 修改 | `docs/planning/dev-logbook.md` | 记录本轮非空采集增量 |
| 修改 | `docs/worktime.md` | 记录 Session 43 工时 |

### 43.2 本轮落地结果

- 本轮完成了一次新的最小真实性复测，并确认：**9222 的 `/json/version` 与 `/json/list` 已恢复为终端可读，同时 browser 侧仍能稳定读到 Active issues target metadata**。
- 但更关键的页面级结论没有变化：真正打开 `https://linear.app/cleantrack/team/CLE/active` 时仍先进入 `Link opened in the Linear app` 中转页；点击 `Open here instead` 后仍进入 `Log in to Linear` 登录页。
- 因而 CAP-06 仍不能进入顶部 tabs / search / filter / display / sort / new issue 的真实控件采集；本轮新增价值在于把“metadata 已恢复、认证态仍不可复用”的更准确信息落盘，而不是停留在旧的 502 结论。

### 43.3 经验沉淀

- 对本地 Chrome 9222 取证链路，metadata endpoint 恢复 `200` 只能说明调试元信息链路可用，**不能推导出 Hermes browser 已经继承了目标 target 的登录态**。
- 当终端/browser 两侧都能读取 metadata，但浏览器打开业务 URL 仍稳定落到中转页→登录页时，继续尝试页面控件采集没有价值；更高价值的最小增量，是把“metadata 恢复”和“auth reuse 仍失败”明确拆开记录。
- 这类恢复态更新很重要，因为它改变了下一轮优先级：现在更值得尝试 page websocket 级只读证据，而不是继续围绕 `/json/version` / `/json/list` 可达性做重复探测。

### 43.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 本轮任务类型 | 采集 fallback / metadata 恢复态复测 |
| 目标任务 | CAP-06 Active issues 顶部工具栏与 tabs 交互证据 |
| 复测时间 | `2026-04-18 20:27 CST` |
| 终端 probe 结果 | `/json/version` => `200 OK`；`/json/list` => `200 OK` |
| 浏览器 metadata 结果 | `/json/list` 仍可读到 `Cleantrack › Active issues` target metadata |
| 页面 fallback 结果 | `Link opened in the Linear app` → 点击 `Open here instead` → `Log in to Linear` |
| 新增证据文件 | `docs/linear-parity/har/2026-04-18-202756-browser-terminal-metadata-recovery.json`, `docs/linear-parity/flows/active-issues-auth-session-blocker-2026-04-18-202756.md` |
| 同步更新文档 | `docs/linear-parity/page-inventory.md`, `docs/linear-parity/task-board.md`, `docs/linear-parity/api-catalog.md`, `docs/planning/dev-logbook.md`, `docs/worktime.md` |

### 43.5 Git commit hash

（本轮未执行 commit / push；capture lane 本轮仅做文档型取证增量）

---

## Session 41 — 2026-04-18：确认 CAP-06 已转为“已登录会话不可复用”阻塞

**目标**：继续按 capture lane 推进 CAP-06，但不空耗在泛泛重试上；先做一次最小真实性探测，验证 Hermes browser 是否真能复用本地已登录的 Linear Chrome 9222 会话，如果不能，就把阻塞从“metadata 不可读”升级为更精确的“认证会话不可复用”事实并落盘。

### 41.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `AGENTS.md` | 复核中文输出、capture lane 只读取证、不得改 Cruise 产品代码 |
| 读取 | `docs/linear-parity/task-board.md` / `full-parity-capture-plan.md` / `page-inventory.md` / `README.md` | 以任务板为唯一状态源，确认当前最靠前 capture 任务仍为 CAP-06 |
| 检查 | `git status --short` | 提前确认仓库存在既有实现侧改动与 `UU frontend/package-lock.json`，本轮继续严格只做 docs/linear-parity 与日志更新 |
| 读取 | `docs/planning/dev-logbook.md` / `docs/worktime.md` / `doc/worktime.md` | 补齐本轮日志/工时更新前的上下文 |
| 复测 | 终端直连 `http://127.0.0.1:9222/json/version` / `/json/list` | 两个 endpoint 仍返回 `502 Bad Gateway` |
| 复测 | Hermes browser 直接打开 `http://127.0.0.1:9222/json/version` / `/json/list` | 浏览器侧可读到 200 metadata，并重新锁定 Linear target/title/url/websocket |
| 复测 | Hermes browser 打开 `https://linear.app/cleantrack/team/CLE/active` 并点击 `Open here instead` | 实际未进入已登录 Active issues 列表，而是从桌面端中转页落到 `Log in to Linear` 登录页 |
| 新增 | `docs/linear-parity/har/2026-04-18-195804-browser-terminal-metadata-discrepancy.json` | 结构化记录终端/浏览器对 9222 metadata 的链路分歧与准确 target metadata |
| 新增 | `docs/linear-parity/flows/active-issues-auth-session-blocker-2026-04-18.md` | 记录“桌面端中转页 → 登录页”的真实会话复用失败路径 |
| 修改 | `docs/linear-parity/task-board.md` | 将 CAP-06 blocker 从“metadata 502”更新为“已登录 Linear Web 会话不可复用” |
| 修改 | `docs/linear-parity/page-inventory.md` | 同步 Active issues 当前更精确的阻塞类型 |
| 修改 | `docs/linear-parity/api-catalog.md` | 写入 browser/terminal probe 分歧、准确 websocket 元信息与新 blocker 结论 |
| 修改 | `docs/planning/dev-logbook.md` | 记录本轮非空采集增量 |
| 修改 | `docs/worktime.md` / `doc/worktime.md` | 记录 Session 41 工时 |

### 41.2 本轮落地结果

- 本轮不是简单重复记录“9222 又 502 了”，而是确认了更关键的事实：**Hermes browser 能读到 9222 metadata，但不能复用本地已登录的 Linear Web 会话**。
- 具体表现为：浏览器可读取 `/json/version` 与 `/json/list`，并锁定 `Cleantrack › Active issues` 对应 page websocket；但真正打开目标页时只落到 `Link opened in the Linear app` 中转页，点击 `Open here instead` 后继续进入 `Log in to Linear` 登录页。
- 因而 CAP-06 当前真正阻塞点已从“metadata endpoint 不可读”修正为“认证会话不可复用”，这会直接改变下一轮采集前置工作。

### 41.3 经验沉淀

- 对本地已登录 Web 应用取证，**能读到 DevTools metadata ≠ 能复用真实认证态页面**；这两个前提必须分开验证，不能拿 metadata 200 误判为“可继续做控件采集”。
- 当终端 probe 与浏览器 probe 对同一 9222 endpoint 出现相反结果时，应该把“链路分歧”单独落盘，而不是只保留单一路径结论。
- 对 capture lane 来说，确认 blocker 的精确层级（metadata、websocket、还是认证会话）本身就是有效增量，因为它缩小了下一轮恢复采集所需的最小排障面。

### 41.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 本轮任务类型 | 采集 fallback / 会话复用阻塞确认 |
| 目标任务 | CAP-06 Active issues 顶部工具栏与 tabs 交互证据 |
| 终端 probe | `/json/version` => `502 Bad Gateway`；`/json/list` => `502 Bad Gateway` |
| 浏览器 probe | `/json/version` / `/json/list` => 可读 200 metadata |
| 确认的 Linear target | `81A3713C33BCA35B2A0B8C7D177F43AD` / `Cleantrack › Active issues` / `https://linear.app/cleantrack/team/CLE/active` |
| 页面复用结果 | `Open here instead` 后进入 `Log in to Linear` 登录页，未复用已登录 Active issues 真页 |
| 新增证据文件 | `docs/linear-parity/har/2026-04-18-195804-browser-terminal-metadata-discrepancy.json`, `docs/linear-parity/flows/active-issues-auth-session-blocker-2026-04-18.md` |
| 同步更新文档 | `docs/linear-parity/task-board.md`, `docs/linear-parity/page-inventory.md`, `docs/linear-parity/api-catalog.md`, `docs/planning/dev-logbook.md`, `docs/worktime.md`, `doc/worktime.md` |

---

## Session 42 — 2026-04-18：补强 Active issues 中转页→登录页阻塞证据

**目标**：在 CAP-06 已知被“已登录会话不可复用”阻塞的前提下，再做一个 5~15 分钟的最小真实性增量：把 `9222 metadata 可读`、`中转页可见文案`、`点击 Open here instead 后进入登录方式页` 这条完整 fallback 路径补成结构化证据，避免后续 cron 只复述 blocker 而缺少页面级可见反馈。

### 42.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `AGENTS.md` | 复核 capture lane 只读取证、中文输出、日志必更 |
| 读取 | `docs/linear-parity/task-board.md` / `full-parity-capture-plan.md` / `page-inventory.md` / `README.md` | 确认当前 capture lane 最靠前任务仍为 CAP-06，且 blocker 仍是会话不可复用 |
| 检查 | `git status --short` | 提前确认仓库存在既有实现侧改动与 `UU frontend/package-lock.json`，本轮继续严格只做 docs/linear-parity 与日志更新 |
| 读取 | `docs/planning/dev-logbook.md` / `docs/worktime.md` / `doc/worktime.md` | 获取日志与工时上下文 |
| 复测 | 终端直连 `http://127.0.0.1:9222/json/version` / `/json/list` | 两个 endpoint 仍返回 `502 Bad Gateway` |
| 复测 | Hermes browser 打开 `http://127.0.0.1:9222/json/version` / `/json/list` | 仍可读到 200 metadata，并再次锁定 `Cleantrack › Active issues` target / websocket |
| 复测 | Hermes browser 打开 `https://linear.app/cleantrack/team/CLE/active` | 页面仍先落到 `Link opened in the Linear app` 中转页 |
| 交互 | 点击 `Open here instead` | 页面进入 `Log in to Linear` 登录方式选择页，出现 Google / email / SAML SSO / passkey 入口 |
| 新增 | `docs/linear-parity/har/2026-04-18-200745-browser-terminal-metadata-discrepancy.json` | 结构化记录 metadata、DOM 文本快照、截图路径与 blocker 分类 |
| 新增 | `docs/linear-parity/flows/active-issues-auth-session-blocker-2026-04-18-200745.md` | 记录中转页 → 登录页的页面级 fallback 路径与可见反馈 |
| 修改 | `docs/linear-parity/task-board.md` / `page-inventory.md` / `api-catalog.md` | 同步 20:07 复测事实与新证据文件 |
| 修改 | `docs/planning/dev-logbook.md` / `docs/worktime.md` / `doc/worktime.md` | 记录 Session 42 |

### 42.2 本轮落地结果

- 本轮没有空转在“再试一次能不能直接进 Active issues”上，而是把 **metadata 可读 → 中转页 → 点击后登录页** 这条完整失败链路补成了结构化证据。
- 新证据比上一轮更完整：除了 target metadata 外，还新增了页面级可见文案、点击动作、点击后的登录方式入口，以及对应截图路径。
- 因此 CAP-06 当前 blocker 现在不仅是结论层面的“会话不可复用”，而且已经有了足够具体的页面级证据支持，后续恢复采集时可以直接对照验证是否真正恢复。

### 42.3 经验沉淀

- 对 capture fallback 来说，如果 blocker 已明确，就应继续补“页面级可见反馈”而不是只重复 metadata 结论；这样下一轮才能快速判断是同一阻塞还是阻塞形态变化。
- `Open here instead` 这种中转页按钮值得单独记录，因为它是从“桌面端中转”切换到“浏览器登录态”的关键分叉点。
- 在会话不可复用场景下，记录登录页展示的是“登录方式选择页”而不是邮箱表单/验证码页，有助于后续更准确地定位恢复路径。

### 42.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 本轮任务类型 | 采集 fallback / 页面级阻塞证据补强 |
| 目标任务 | CAP-06 Active issues 顶部工具栏与 tabs 交互证据 |
| probe 时间 | `2026-04-18 20:07:45 CST` |
| 终端 probe | `/json/version` => `502 Bad Gateway`；`/json/list` => `502 Bad Gateway` |
| 浏览器 probe | `/json/version` / `/json/list` => 可读 200 metadata |
| 中转页文案 | `Link opened in the Linear app` / `Open here instead` |
| 点击后反馈 | 进入 `Log in to Linear` 登录方式选择页，显示 Google / email / SAML SSO / passkey 入口 |
| 新增证据文件 | `docs/linear-parity/har/2026-04-18-200745-browser-terminal-metadata-discrepancy.json`, `docs/linear-parity/flows/active-issues-auth-session-blocker-2026-04-18-200745.md` |
| 同步更新文档 | `docs/linear-parity/task-board.md`, `docs/linear-parity/page-inventory.md`, `docs/linear-parity/api-catalog.md`, `docs/planning/dev-logbook.md`, `docs/worktime.md`, `doc/worktime.md` |
| 当前是否完成真实控件采集 | 否，CAP-06 仍被 9222 metadata endpoint 阻塞 |
| 当前是否存在真实 blocker | 是：`/json/version` / `/json/list` 在当前 run 的两次最小 probe 中均返回 502 |

### 40.5 Git commit hash

（本轮为 capture 文档更新；未执行 commit / push）

---

## Session 38 — 2026-04-18：记录 Active issues 顶部工具栏采集阻塞事实

**目标**：按 capture lane 当前最靠前任务 CAP-06 继续推进 Active issues 顶部 tabs / 搜索 / filter / display / sort / new 等控件的只读取证；若 9222 调试链路异常，则执行一次最小 probe，并把失败事实沉淀进 `docs/linear-parity/` 与项目日志，避免空跑。

### 38.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `AGENTS.md` | 复核中文输出、capture/implementation 分轨、只更新 `docs/linear-parity/` 与项目日志、不改 Cruise 产品代码 |
| 读取 | `docs/linear-parity/task-board.md` / `full-parity-capture-plan.md` / `page-inventory.md` / `README.md` | 以任务板为唯一状态源，确认 capture lane 当前最靠前任务为 CAP-06 |
| 检查 | `git status --short` | 提前确认仓库存在大量既有改动与 `UU frontend/package-lock.json`，因此本轮仅做文档型采集增量 |
| 探测 | `http://127.0.0.1:9222/json/version` / `/json/list` | 终端只读 probe，两个端点均返回 `502 Bad Gateway` |
| 新增 | `docs/linear-parity/har/2026-04-18-9222-metadata-probe-failure.json` | 记录本轮 9222 metadata endpoint 失败事实、阻塞范围与下一步最小动作 |
| 新增 | `docs/linear-parity/flows/active-issues-toolbar-capture-blocker-2026-04-18.md` | 将 CAP-06 本轮无法继续的原因、影响范围与恢复后续采动作写成流程阻塞记录 |
| 修改 | `docs/linear-parity/page-inventory.md` | 把 Active issues 状态更新为“采集中（本轮受 9222 元信息 502 阻塞）” |
| 修改 | `docs/linear-parity/task-board.md` | 将 CAP-06 从 `pending` 改为 `blocked`，写明本轮 probe 的确切 blocker 与证据文件 |
| 修改 | `docs/linear-parity/api-catalog.md` | 把“本轮 200 可用”纠偏为“历史上曾成功，但当前 run 的 metadata probe 返回 502” |
| 修改 | `docs/planning/dev-logbook.md` | 记录本轮最小非空采集增量 |
| 修改 | `docs/worktime.md` | 记录 Session 38 工时 |

### 38.2 本轮落地结果

- 没有重复空转在 9222 不稳定链路上；先做一次最小只读 probe，就确认本轮 `/json/version` 与 `/json/list` 均返回 `502 Bad Gateway`。
- 已把这次失败事实作为新的取证产物落盘到 `har/` 与 `flows/`，明确它阻塞的是 **CAP-06 当前 run 的 target/page metadata 刷新与顶部控件交互取证**，而不是泛化成“整个 Linear 采集永久不可用”。
- 同步把 `page-inventory.md`、`task-board.md`、`api-catalog.md` 更新到与本轮事实一致的状态，避免后续 cron 继续按“9222 当前可用”这一过时前提重复推进。

### 38.3 经验沉淀

- 对取证型 cron，当 9222 / metadata endpoint 当前 run 已明确返回 `502` 时，应在一次 probe 后立刻转入文档化 fallback，而不是把整轮时间耗在重试上。
- `api-catalog.md` 这类文档要区分“历史上曾成功”与“当前 run 观测结果”，否则后续 session 容易误把旧成功记录当成当前可执行前提。
- 即使本轮没拿到新的 DOM/截图/网络事件，也应留下结构化失败证据文件，让下轮在恢复后能从清晰 blocker 状态继续，而不是重新判断现场。

### 38.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 本轮任务类型 | 采集 fallback / 阻塞事实落盘 |
| 目标任务 | CAP-06 Active issues 顶部工具栏与 tabs 交互证据 |
| 最小 probe 结果 | `/json/version` => `502 Bad Gateway`；`/json/list` => `502 Bad Gateway` |
| 新增证据文件 | `docs/linear-parity/har/2026-04-18-9222-metadata-probe-failure.json`, `docs/linear-parity/flows/active-issues-toolbar-capture-blocker-2026-04-18.md` |
| 同步更新文档 | `docs/linear-parity/page-inventory.md`, `docs/linear-parity/task-board.md`, `docs/linear-parity/api-catalog.md`, `docs/planning/dev-logbook.md`, `docs/worktime.md` |
| 当前是否完成真实控件采集 | 否，本轮被 9222 metadata endpoint 阻塞 |
| 当前是否存在真实 blocker | 是：9222 `/json/version` / `/json/list` 当前 run 返回 502 |

### 38.5 Git commit hash

（本轮为 capture 文档更新；未执行 commit / push）

---

## Session 37 — 2026-04-18：让 team-active 列表真实消费 sort URL 状态

**目标**：按任务板顺序继续推进 team-active workbench，在 `sort=` URL 参数与可见摘要已经接通的基础上，再落一个 5~15 分钟级最小可验证开发增量：让 Active issues 列表真实消费 `sort=updatedAt / manual`，并用 helper 级测试验证排序结果稳定且可回归。

### 37.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `AGENTS.md` | 复核 cron 纪律：中文输出、任务板驱动、实现优先、必须同步更新日志/工时 |
| 读取 | `docs/linear-parity/task-board.md` / `gap-analysis.md` / `implementation-roadmap.md` / `full-parity-capture-plan.md` | 以任务板为唯一状态源，确认实现 lane 当前最靠前任务是 IMP-12 |
| 查阅 | `docs/linear-parity/` 既有证据文档 | 仅为实现提供依据，不扩展成新的采集轮 |
| 读取 | `frontend/src/components/issues/issue-workbench.ts` | 确认之前 row builder 仍无真实 sort seam，需要把 URL sort 变成真实 row 顺序 |
| 读取 | `frontend/src/components/issues/ActiveIssuesWorkbenchPage.tsx` | 确认页面已读 `sort=` 并传入 row builder，适合直接完成真实排序接线 |
| 修改 | `frontend/src/components/issues/issue-workbench.ts` | 新增 `ActiveWorkbenchSort`、`updatedTimestamp` 与 `sortActiveWorkbenchRows(...)`，让 `buildActiveWorkbenchRows(...)` 支持 `updatedAt / manual` 两种稳定排序 |
| 修改 | `frontend/src/components/issues/ActiveIssuesWorkbenchPage.tsx` | 收紧 sort helper 类型，并让 `workbenchRows` 真正把当前 `sort` 传给 `buildActiveWorkbenchRows(...)` |
| 修改 | `frontend/src/components/issues/issue-view.test.ts` | 补充 row builder / sorting helper 回归测试，验证默认按更新时间排序、manual 保留输入顺序、updatedAt 在同时间戳下有稳定 tie-break |
| 验证 | `frontend` -> `npm test -- src/components/issues/issue-view.test.ts` | 9/9 通过，确认 Active issues 排序 seam 已可回归 |
| 记录 | `docs/linear-parity/task-board.md` | 将 IMP-12 标记为 `done` |
| 记录 | `docs/planning/dev-logbook.md` | 记录本轮真实开发增量 |
| 记录 | `docs/worktime.md` | 记录 Session 37 工时 |

### 37.2 本轮落地结果

- `ActiveIssuesWorkbenchPage` 现在不只是把 `sort=` 写进 URL，而是会让 `buildActiveWorkbenchRows(...)` 真实消费 `sort=updatedAt / manual`，让列表顺序跟当前工具栏状态一致。
- `updatedAt` 模式会按 `updatedTimestamp` 倒序输出，并在同时间戳下用 `id` 做稳定 tie-break；`manual` 模式则保留输入 issue 顺序，不再被 row builder 强制改写。
- 同时补上了 helper 级回归测试，确保后续继续改 team-active toolbar / rows 时，排序行为不会悄悄退化回“只有 URL 有状态、列表没变化”。

### 37.3 经验沉淀

- 当 `sort=` URL 状态与可见摘要已经存在时，下一步最有价值的 5 分钟增量就是把排序责任下沉到 row builder / pure helper，而不是直接上整页交互测试；这样风险更小，也更利于稳定验证。
- 对 workbench 列表排序，先支持 1~2 个安全排序选项（这里是 `updatedAt` 与 `manual`）比过早扩展更多排序方式更稳，尤其当前 Linear 证据仍以最小实现优先为准。
- patch 工具自动触发的 `npx tsc` 提示依旧属于环境级 runner 噪音；本轮继续以仓库原生命令 `npm test -- src/components/issues/issue-view.test.ts` 作为最终验证结果。

### 37.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 本轮任务类型 | 最小开发任务（team-active 真实排序接线） |
| 代码改动文件 | `frontend/src/components/issues/issue-workbench.ts`, `frontend/src/components/issues/ActiveIssuesWorkbenchPage.tsx`, `frontend/src/components/issues/issue-view.test.ts` |
| 文档改动文件 | `docs/linear-parity/task-board.md`, `docs/planning/dev-logbook.md`, `docs/worktime.md` |
| 新增页面能力 | `sort=` URL 状态真实驱动 Active issues rows 的 `updatedAt / manual` 排序 |
| 定向测试结果 | `npm test -- src/components/issues/issue-view.test.ts` => 9 passed |
| 全量类型检查现状 | 自动 lint 仍只见环境级 `npx tsc` 提示；本轮未见新增由本次排序改动引入的类型/测试回归 |
| 当前是否存在真实阻塞 | 否 |

### 37.5 Git commit hash

（待本轮 commit / push 成功后回填）

---

## Session 36 — 2026-04-18：为 team-active 工具栏补最小可见排序状态

**目标**：按任务板顺序继续推进 team-active workbench，在现有搜索、筛选与 Display/折叠 URL 状态已经接通的基础上，再落一个 5~15 分钟级最小可验证增量：先给工具栏补一个最小 `Sort` 入口，把排序意图写入 `sort=` URL 参数，并在侧栏给出可见摘要文案，为后续接真实排序逻辑预留稳定 seam。

### 36.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `AGENTS.md` | 复核中文沟通、任务板驱动、`references/` 只读、`docs/` 写入、完成 `done` 任务需 commit/push |
| 读取 | `docs/linear-parity/task-board.md` | 以任务板为唯一状态源；当前无 `in_progress`，顺序新增并完成 LP-15 |
| 读取 | `frontend/src/components/issues/ActiveIssuesWorkbenchPage.tsx` | 确认 team-active 顶部已有 search / advanced filter / Display，但还缺一个最小 Sort 入口与当前排序可见反馈 |
| 读取 | `frontend/src/components/issues/issue-view.test.ts` | 确认适合沿 helper seam 补排序摘要回归测试 |
| 修改 | `frontend/src/components/issues/ActiveIssuesWorkbenchPage.tsx` | 新增 `sort=` URL 状态读取/切换、`Sort` 工具栏按钮、`sortSummaryLabel(...)` 摘要文案与 next-steps 文案联动 |
| 修改 | `frontend/src/components/issues/issue-view.test.ts` | 新增排序摘要 helper 回归测试，覆盖 `updatedAt` / `manual` 两类可见文案 |
| 验证 | `frontend` -> `npm test -- src/components/issues/issue-view.test.ts` | 5/5 通过，确认新增排序摘要 seam 与既有 issue-workbench helpers 回归稳定 |
| 验证 | `frontend` -> `npx tsc --noEmit` | 未作为最终结果；patch 工具自动 lint 仍落到环境级 `npx tsc` 提示，需要以仓库原生命令手动验证。手动定向测试已通过，本轮未见新增类型回归证据 |
| 修改 | `docs/linear-parity/task-board.md` | 新增并完成 LP-15，记录本轮最小可验证增量 |
| 修改 | `docs/planning/dev-logbook.md` | 记录本轮真实开发结果 |
| 修改 | `doc/worktime.md` | 记录 Session 36 工时 |

### 36.2 本轮落地结果

- `ActiveIssuesWorkbenchPage` 顶部工具栏现在已有一个最小 `Sort` 入口，会在 `最近更新 / 手动排序` 两个状态之间切换，并把结果写入 `sort=` URL 参数。
- 右侧 `Next integration points` 区域现在会同时展示搜索/筛选摘要、折叠分组摘要、排序摘要，避免新增排序状态只存在于 URL 而用户不可见。
- 该改动刻意只打通“排序意图的 URL 与页面反馈”这一层，不直接改动列表数据排序，符合本轮 5~15 分钟最小增量要求，也为下一轮接真实排序逻辑留出稳定 seam。

### 36.3 经验沉淀

- 当页面已有 Search / Filter / Display 三个工具栏入口时，补一个“只接 URL 状态 + 可见摘要”的 Sort 入口，是非常稳妥的 5 分钟增量：它能先把路由契约和 UI 占位固定下来，而不会一次引入真实排序逻辑的行为风险。
- 对这类 UI 迁移，优先测试纯 helper 文案（如 `sortSummaryLabel(...)`）比直接测整个页面更稳，也更适合当前仓库存在环境级类型检查噪音的现状。
- patch 工具自动跑出的 `npx tsc` 提示仍然是环境级 runner 噪音；本轮继续采用“手动仓库原生命令定向测试 + 记录自动检查噪音不作为结论”的验证策略。

### 36.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 本轮任务类型 | 最小开发任务（team-active 最小排序状态入口） |
| 代码改动文件 | `frontend/src/components/issues/ActiveIssuesWorkbenchPage.tsx`, `frontend/src/components/issues/issue-view.test.ts` |
| 文档改动文件 | `docs/linear-parity/task-board.md`, `docs/planning/dev-logbook.md`, `doc/worktime.md` |
| 新增验证能力 | `sortSummaryLabel(...)` 对 `updatedAt / manual` 排序状态的 helper 回归测试 |
| 定向测试结果 | `npm test -- src/components/issues/issue-view.test.ts` => 5 passed |
| 全量类型检查现状 | 仍只见环境级 `npx tsc` 提示；本轮未新增可见类型回归证据 |
| 当前是否存在真实阻塞 | 否 |

### 36.5 Git commit hash

（待本轮 commit / push 成功后回填）
- 新增 helper 级测试后，collapsed summary 文案也具备了独立回归保护，后续继续扩展 Display / grouping 时更不容易退化。

### 35.3 经验沉淀

- 当 URL 状态已经真实生效时，补一个轻量的“可见反馈层”往往是高价值的 5 分钟任务：它不引入新状态机，却能显著提升页面可理解性。
- 对当前 team-active workbench，搜索 / 筛选 / 折叠都逐渐以 URL 为单一事实来源；把这些 URL 状态同步到辅助文案，是比继续堆更重交互更稳的收口方式。
- patch 工具自动触发的 lint 检查在该仓库里会误跑到全局 `npx tsc` 提示，因此仍应以手动执行的仓库原生命令为准完成验证闭环。

### 35.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 本轮任务类型 | 最小开发任务（Display 折叠状态可见反馈） |
| 代码改动文件 | `frontend/src/components/issues/ActiveIssuesWorkbenchPage.tsx`, `frontend/src/components/issues/issue-view.test.ts` |
| 文档改动文件 | `docs/linear-parity/task-board.md`, `docs/planning/dev-logbook.md`, `doc/worktime.md` |
| 新增页面能力 | 侧栏显示当前已折叠状态组摘要，与 `collapsed=` URL 状态联动 |
| 定向测试结果 | `npm test -- src/components/issues/issue-view.test.ts` => 8 passed |
| 全量类型检查现状 | 本轮未得到有效仓库级 `tsc` 结果；自动 lint 仅提示全局 `npx tsc` 不可用，不视为本轮回归 |
| 当前是否存在真实阻塞 | 否 |

### 35.5 Git commit hash

（待本轮 commit / push 成功后回填）

---

## Session 33 — 2026-04-18：补 Active issues DOM / 结构证据摘要

**目标**：按任务板顺序推进 LP-06，在无法复用登录态 browser 会话、且当前没有新增页面截图 / DOM dump 的情况下，基于仓库内已有 target metadata、browser fallback 记录与 Active issues 分析文档，落一份最小但真实可复用的结构级证据摘要，避免证据采集任务空转。

### 33.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `AGENTS.md` | 复核 cron 约束：中文输出、任务板为唯一状态源、`references/` 只读、必须同步任务板/日志/工时 |
| 读取 | `docs/linear-parity/task-board.md` | 按顺序选择最靠前的 `pending` 任务 LP-06 |
| 读取 | `docs/linear-parity/active-issues-analysis.md` | 复核当前已确认的页面身份、9222 状态与已知结构判断 |
| 读取 | `docs/linear-parity/dom/active-issues-target.json` | 复核目标 title / URL / page websocket 元信息 |
| 读取 | `docs/linear-parity/dom/active-issues-browser-tool-fallback.txt` | 复核 browser 工具无法复用登录态、会落到登录页的 fallback 证据 |
| 新增 | `docs/linear-parity/dom/active-issues-structure-summary.md` | 基于现有证据沉淀 Active issues 的结构级事实、fallback 结果、已知缺口与对 Cruise 的直接约束 |
| 修改 | `docs/linear-parity/task-board.md` | 将 LP-06 标记为 `done`，写回本轮产物与完成标准 |
| 验证 | 新文件回读 + 任务板回读 | 确认结构摘要与任务板状态已正确落盘 |
| 修改 | `docs/planning/dev-logbook.md` | 记录本轮 fallback 但仍有真实产出的文档增量 |
| 修改 | `doc/worktime.md` | 记录 Session 33 工时 |

### 33.2 本轮落地结果

- 在没有新增可登录 DOM dump 的情况下，仍完成了 `Active issues` 页面的一份**结构级证据摘要**，把“已有证据能确认什么、仍不能确认什么”写清楚了。
- 新摘要明确区分了：
  - 已确认：页面标题、team 路由语义、workbench/list 页面属性、browser fallback 现状；
  - 未确认：工具栏字段级文案、row 列定义、控件 aria/placeholder 等 DOM 细节。
- 这样后续再做 UI 对标时，不必反复从零判断证据边界，也能避免把“结构已确认”误说成“完整 DOM 已取证”。

### 33.3 经验沉淀

- 当证据采集因登录态或 9222 稳定性受限时，最有价值的 fallback 不是继续重试，而是把**现有证据的边界和可用结论**整理成一份可复用文档。
- 对当前 Linear 对标阶段，这类结构摘要能直接服务后续低风险实现任务：团队语义路由、page shell、toolbar 壳层、空态与分组行为等，都不必等完整 DOM 抓取后再动。
- 任务板驱动下，这种文档增量也属于真实进展：它更新了项目状态源，并减少了下次 evidence run 的重复调查成本。

### 33.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 本轮任务类型 | 证据 fallback 文档任务（LP-06） |
| 新增文档文件 | `docs/linear-parity/dom/active-issues-structure-summary.md` |
| 更新状态文件 | `docs/linear-parity/task-board.md`, `docs/planning/dev-logbook.md`, `doc/worktime.md` |
| 本轮新增确认 | team 级 Active issues 页面身份、结构级语义、browser fallback 结论 |
| 本轮仍缺失 | 完整 DOM 树、toolbar 字段级文本、row 列级结构 |
| 当前是否存在真实阻塞 | LP-06 无；LP-05 仍受 9222 波动阻塞 |

### 33.5 Git commit hash

（本轮未提交）

---

## Session 32 — 2026-04-18：优化 team-active 搜索 / 筛选空态反馈

**目标**：按任务板顺序继续推进 team-active workbench，一个 5~15 分钟级最小开发增量：让 `ActiveIssuesWorkbenchPage` 的空态文案能区分“当前视图暂无数据”“搜索无结果”“筛选后无结果”，避免 Linear 风格工作台在真实 rows + 高级筛选接通后仍给出过于笼统的反馈。

### 32.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `AGENTS.md` | 复核中文输出、docs/ 可写、references/ 只读、必须更新任务板/日志/工时等纪律 |
| 读取 | `docs/linear-parity/task-board.md` | 以任务板为唯一状态源；确认当前可继续推进 team-active 最小 UI/交互收口任务 |
| 读取 | `docs/linear-parity/active-issues-analysis.md`、`docs/linear-parity/implementation-roadmap.md` | 对齐 Active issues 对标目标，确认当前最小切口仍是 team-active 列表工作台可用性细节 |
| 读取 | `frontend/src/components/issues/ActiveIssuesWorkbenchPage.tsx` | 确认当前空态仍固定为 `No issues found for this view yet.`，无法反映 `q` / filters 上下文 |
| 修改 | `frontend/src/components/issues/ActiveIssuesWorkbenchPage.tsx` | 新增 `noResultsText(...)`，根据搜索词与高级筛选状态输出差异化空态文案，并接到 team-active 列表空态分支 |
| 修改 | `frontend/src/components/issues/issue-view.test.ts` | 增加 helper 级回归测试，覆盖默认空态 / 搜索空态 / 筛选空态 / 搜索+筛选复合空态 |
| 验证 | `frontend` -> `npm test -- src/components/issues/issue-view.test.ts` | 7/7 通过，确认新增空态 helper 与既有 issue-workbench helpers 回归稳定 |
| 验证 | `frontend` -> `npx tsc --noEmit` | 失败，但仍集中在仓库既有 `MarkdownEditor.tsx` 的 tiptap 缺依赖与隐式 any；本轮未引入新的 team-active 类型错误 |
| 修改 | `docs/linear-parity/task-board.md` | 新增并完成 LP-12，记录本轮最小可验证增量 |
| 修改 | `docs/planning/dev-logbook.md` | 记录本轮真实开发结果 |
| 修改 | `doc/worktime.md` | 记录 Session 32 工时 |

### 32.2 本轮落地结果

- `ActiveIssuesWorkbenchPage` 的空态反馈不再只有单一文案，而是会按当前上下文区分：
  - 当前视图本身暂无数据
  - 搜索 `q` 命中为空
  - 高级筛选条件下无结果
  - 搜索词与筛选同时生效但无交集
- 这让 team-active 在接入真实 rows、URL 搜索、高级筛选后，空列表状态也更接近真实工作台语义，不会把“没有任何 issue”和“你当前筛掉了所有结果”混为一谈。
- 新增 helper 级测试后，这个小 seam 具备独立回归保护，后续继续改 toolbar/filter 细节时更不容易把空态文案退化回固定字符串。

### 32.3 经验沉淀

- 当 workbench 已具备真实查询与 URL 状态时，空态反馈本身就是一个高价值的 5 分钟任务：它不改数据流，却能显著提升页面“可理解性”。
- 对当前迁移阶段，优先补 helper 级测试比直接上整页组件测试更稳，因为空态判断本质是纯函数逻辑，适合用小测试覆盖。
- 当前 `npx tsc --noEmit` 依旧被仓库既有 `MarkdownEditor.tsx` 问题污染，因此本轮仍采用“定向测试通过 + 广义类型检查确认无新增本轮错误”的验证策略。

### 32.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 本轮任务类型 | 最小开发任务（team-active 空态文案收口） |
| 代码改动文件 | `frontend/src/components/issues/ActiveIssuesWorkbenchPage.tsx`, `frontend/src/components/issues/issue-view.test.ts` |
| 文档改动文件 | `docs/linear-parity/task-board.md`, `docs/planning/dev-logbook.md`, `doc/worktime.md` |
| 新增页面能力 | 按搜索 / 筛选上下文输出差异化空态文案 |
| 定向测试结果 | `npm test -- src/components/issues/issue-view.test.ts` => 7 passed |
| 全量类型检查现状 | 仍仅见 `MarkdownEditor.tsx` 的 tiptap 缺依赖与隐式 any，非本轮引入 |
| 当前是否存在真实阻塞 | 否 |

### 32.5 Git commit hash

（本轮未提交）

---

## Session 23 — 2026-04-18：Active issues 列表切到真实 query rows

**目标**：完成一个 5 分钟级最小开发任务，把 `ActiveIssuesWorkbenchPage` 的中部列表从静态假数据切到真实 `useIssueWorkspace(...)` 查询结果，并复用已抽离的 workbench helper，继续推进 team-active 页面从壳子走向可用工作台。

### 23.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `AGENTS.md` | 复核中文沟通、docs/ 写入、references/ 只读、logbook/worktime 更新、git author 等纪律 |
| 读取 | `frontend/src/components/issues/ActiveIssuesWorkbenchPage.tsx` | 确认当前仍使用 `SKELETON_ISSUES` 静态 rows，选定本轮最小切口 |
| 读取 | `frontend/src/components/issues/issue-workbench.ts` | 复核 `buildActiveWorkbenchRows(...)`、`groupBelongsToView(...)` 已可直接复用 |
| 读取 | `frontend/src/app/issues/page.tsx` | 对照旧页 `IssueRow` 字段与 issue detail 跳转方式，保持新旧语义一致 |
| 修改 | `frontend/src/components/issues/ActiveIssuesWorkbenchPage.tsx` | 接入 `projectsQuery` / `membersQuery`，用真实 issues 构建 rows；按当前 view 过滤；支持点击 row 跳 issue detail；增加 loading/empty state |
| 验证 | `frontend` -> `npm test -- src/components/issues/issue-view.test.ts` | 5/5 通过，确认共享 workbench helper 仍稳定 |
| 验证 | `frontend` -> `npx tsc --noEmit` | 本轮新增页面类型错误已消除；当前仅剩仓库既有 `MarkdownEditor.tsx` / tiptap 依赖与隐式 any 报错 |
| 修改 | `docs/planning/dev-logbook.md` | 记录本轮真实开发结果 |
| 修改 | `docs/worktime.md` | 记录 Session 23 工时 |

### 23.2 本轮落地结果

- `ActiveIssuesWorkbenchPage` 不再渲染硬编码 `SKELETON_ISSUES`，而是直接消费 `useIssueWorkspace(...)` 的真实 issues 数据。
- 页面现已复用 `buildActiveWorkbenchRows(...)` 统一做 row DTO 映射，并用 `groupBelongsToView(...)` 对 `active / backlog / done` 视图进行过滤。
- row 点击行为已对齐旧 `issues/page.tsx`：在存在 `currentOrganizationSlug` 时，跳转到 `issueDetailPath(...)`。
- 增加了最小的 loading 与 empty state，避免真实数据尚未返回时仍展示假数据，提升 P0 页面可信度。

### 23.3 经验沉淀

- 当前最稳的迁移方式是“先把列表数据胶水接通，再继续迁移 toolbar/filter 交互”；这样能在不碰复杂筛选状态机的前提下，先让 workbench 具备真实内容。
- 旧 `issues/page.tsx` 中最值得复用的其实是 detail 跳转契约与 row 字段语义，而不是整块 UI；共享 helper 已足够承接本轮最小落地。
- `npx tsc --noEmit` 仍受仓库既有 `MarkdownEditor.tsx` 依赖缺口影响，因此本轮验证以“本文件新增错误已清零 + 定向回归测试通过”为准，更符合当前仓库实际状态。

### 23.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 本轮任务类型 | 最小开发任务（真实 issue rows 接线） |
| 代码改动文件 | `frontend/src/components/issues/ActiveIssuesWorkbenchPage.tsx` |
| 文档改动文件 | `docs/planning/dev-logbook.md`, `docs/worktime.md` |
| 新增页面能力 | 真实 rows / 按 view 过滤 / detail 跳转 / loading-empty state |
| 定向测试结果 | `npm test -- src/components/issues/issue-view.test.ts` => 5 passed |
| 全量类型检查现状 | 仅剩仓库既有 `MarkdownEditor.tsx` 相关报错，非本轮引入 |
| 当前是否存在真实阻塞 | 否 |

### 23.5 Git commit hash

（本轮未提交）

---

## Session 24 — 2026-04-18：接通 Active issues tabs 的 view 切换交互

**目标**：完成一个 5 分钟级最小开发任务，让 `ActiveIssuesWorkbenchPage` 顶部 Active / Backlog / Completed tabs 不只显示真实计数，还能实际驱动 URL `view` 参数切换，从而立即复用本页已接好的真实 row 过滤逻辑。

### 24.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `AGENTS.md` | 复核中文沟通、docs/ 写入、references/ 只读、logbook/worktime 更新、git author 等纪律 |
| 读取 | `frontend/src/app/[workspaceSlug]/team/[teamKey]/active/page.tsx` | 确认 team-active 路由仍稳定挂载 `ActiveIssuesWorkbenchPage` |
| 读取 | `frontend/src/app/issues/page.tsx` | 盘点旧 issues 页中 `viewCounts`、`groupedIssues` 与 tab 语义，确认本轮最小切口是只补新页的 view 切换交互 |
| 读取 | `frontend/src/lib/routes.ts` | 复核 team-active 仍由独立路由 helper 承接，无需本轮调整 |
| 读取 | `frontend/src/components/providers/WorkspaceProvider.tsx` | 复核 workspace 根路径继续默认跳转 team-active，说明优先完善当前 workbench 交互是正确方向 |
| 修改 | `frontend/src/components/issues/ActiveIssuesWorkbenchPage.tsx` | 为顶部 tabs 增加 `onClick`，写回 URL `view` 查询参数并触发本页已存在的真实 rows 过滤逻辑 |
| 验证 | `frontend` -> `npm test -- src/components/issues/issue-view.test.ts` | 5/5 通过，确认共享 view/workbench helper 回归稳定 |
| 修改 | `docs/planning/dev-logbook.md` | 记录本轮真实开发结果 |
| 修改 | `docs/worktime.md` | 记录 Session 24 工时 |

### 24.2 本轮落地结果

- `ActiveIssuesWorkbenchPage` 顶部 tabs 现在不再只是静态高亮，而是可以真正切换 `?view=active|backlog|done`。
- 切换后直接复用页面内部既有 `normalizeIssueView(...)` 与 `buildActiveWorkbenchRows(...)` / `groupBelongsToView(...)` 逻辑，无需新增状态机。
- 这意味着 team-active 页面已经具备最小可用的“计数 + 视图切换 + 真实 rows 联动”闭环，为下一轮继续接 toolbar/search/filter 打下基础。

### 24.3 经验沉淀

- 对当前 workbench，最稳的推进方式仍是“沿 URL 查询参数扩能力”，因为旧 `issues/page.tsx` 的筛选体系本来就建立在 search params 上；先保持这条状态主线一致，后续迁移成本最低。
- 在已具备真实 rows 过滤的前提下，先补 tab 点击交互比继续堆视觉细节更值钱，因为它直接把页面从“可看”推进到“可用”。
- 当前 tab 切换只需 `router.replace(..., { scroll: false })` 即可完成最小闭环，没必要过早引入额外本地 state，符合 YAGNI。

### 24.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 本轮任务类型 | 最小开发任务（Active tabs view 切换） |
| 代码改动文件 | `frontend/src/components/issues/ActiveIssuesWorkbenchPage.tsx` |
| 文档改动文件 | `docs/planning/dev-logbook.md`, `docs/worktime.md` |
| 新增页面能力 | tabs 点击切换 URL `view` 参数，并驱动真实 rows 过滤 |
| 定向测试结果 | `npm test -- src/components/issues/issue-view.test.ts` => 5 passed |
| 当前是否存在真实阻塞 | 否 |

### 24.5 Git commit hash

（本轮未提交）

---

## Session 25 — 2026-04-18：接通 Active issues 搜索表单与 URL 状态同步

**目标**：完成一个 5 分钟级最小开发任务，把 `ActiveIssuesWorkbenchPage` 顶部搜索框从只读占位升级为可提交表单，并将搜索词写回 `q` 查询参数，为后续复用旧 `issues/page.tsx` 的 query/filter 逻辑提供最小 URL 状态锚点。

### 25.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `AGENTS.md` | 复核中文沟通、docs/ 写入、references/ 只读、logbook/worktime 更新、git author 等纪律 |
| 读取 | `frontend/src/components/issues/ActiveIssuesWorkbenchPage.tsx` | 确认顶部搜索框仍为只读占位，适合作为本轮最小开发切口 |
| 修改 | `frontend/src/components/issues/ActiveIssuesWorkbenchPage.tsx` | 将搜索框改为可提交表单，提交时写回 URL `q` 查询参数，并根据搜索态动态更新 Filter 按钮、notes 与 integration points 文案 |
| 验证 | `frontend` -> `npm test -- src/components/issues/issue-view.test.ts` | 5/5 通过，确认共享 issue view / workbench helper 未受影响 |
| 修改 | `docs/planning/dev-logbook.md` | 记录本轮真实开发结果 |
| 修改 | `docs/worktime.md` | 记录 Session 25 工时 |

### 25.2 本轮落地结果

- `ActiveIssuesWorkbenchPage` 顶部搜索输入框现在是可编辑、可提交的表单，提交后会将搜索词落到 URL `?q=` 参数中。
- Filter 按钮会根据 `q` 是否存在切换高亮态与文案，底部 workbench notes / integration points 也会同步反映当前搜索状态。
- 这让 `/team/:teamKey/active` 已具备最小可验证的搜索状态承载能力，后续可继续把旧 `issues/page.tsx` 的真实 query/filter 构建逻辑迁移进来。

### 25.3 经验沉淀

- 在当前 workbench 迁移节奏下，优先把交互状态锚定到 URL search params，比直接上本地 state 状态机更稳，更贴近旧 issues 页的实现主线。
- 对 P0 页面来说，先让搜索框承载真实 URL 状态，再接真实筛选逻辑，可以显著缩小后续 toolbar 改造面。
- 本轮没有引入新的数据依赖，只扩展了 URL 与 UI 状态联动，是符合 5 分钟级最小开发任务粒度的推进方式。

### 25.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 本轮任务类型 | 最小开发任务（搜索表单 + URL 状态同步） |
| 代码改动文件 | `frontend/src/components/issues/ActiveIssuesWorkbenchPage.tsx` |
| 文档改动文件 | `docs/planning/dev-logbook.md`, `docs/worktime.md` |
| 新增页面能力 | 搜索表单提交、`q` 查询参数同步、Filter 激活态与底部状态文案联动 |
| 定向测试结果 | `npm test -- src/components/issues/issue-view.test.ts` => 5 passed |
| 当前是否存在真实阻塞 | 否 |

### 25.5 Git commit hash

（本轮未提交）

---

## Session 26 — 2026-04-18：迁入 Active issues 高级筛选侧板最小闭环

**目标**：完成一个 5 分钟级最小开发任务，把旧 `issues/page.tsx` 中最贴近当前 team-active URL 状态主线的高级筛选侧板最小迁入 `ActiveIssuesWorkbenchPage`，让 `/team/:teamKey/active` 从仅支持 `view/q` 再前进一步，具备可写回 URL 的 filter shell。

### 26.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `AGENTS.md` | 复核中文沟通、docs/ 写入、references/ 只读、logbook/worktime 更新、git author 等纪律 |
| 读取 | `frontend/src/app/[workspaceSlug]/team/[teamKey]/active/page.tsx` | 确认当前路由仍只负责 re-export，说明本轮应直接改 `ActiveIssuesWorkbenchPage` |
| 读取 | `frontend/src/app/issues/page.tsx` | 盘点 legacy 页中 `FilterSheet`、`readFilterDraft(...)`、`clearCustomFieldParams(...)`、`writeValue(...)` 等可最小迁移的 URL 筛选逻辑 |
| 修改 | `frontend/src/components/issues/ActiveIssuesWorkbenchPage.tsx` | 接入 `customFieldDefinitionsQuery` / `teamsQuery`，新增深色版 `FilterSheet`、lookup/select/custom-field 控件，以及 `q/type/state/priority/assigneeId/projectId/teamId/cf_*` 的 URL Apply/Clear 闭环 |
| 修改 | `docs/planning/dev-logbook.md` | 记录本轮真实开发结果 |
| 修改 | `docs/worktime.md` | 记录 Session 26 工时 |

### 26.2 本轮落地结果

- team-active 页面工具栏中的 Filter 按钮现在会打开右侧高级筛选面板，而不再只是视觉占位。
- `ActiveIssuesWorkbenchPage` 已开始直接消费 `customFieldDefinitionsQuery` 与 `teamsQuery`，使 team-active 具备承接 legacy issues 筛选结构的最小数据前提。
- Apply/Clear 已可写回 URL：当前已支持 `q`、`type`、`state`、`priority`、`assigneeId`、`projectId`、`teamId` 与 `cf_*` 自定义字段参数，并继续沿用现有 `useIssueWorkspace(apiFilters)` 查询主线。
- 本轮刻意没有迁移 create issue、collapsed state、display/grouping，保持 5 分钟级最小任务边界，避免把旧页整块复制进 team-active。

### 26.3 经验沉淀

- 当前最稳的迁移策略仍是“先迁 URL 状态一致的功能块”，因此高级筛选比 display/grouping 更适合先落地，因为它与已存在的 `q/view` 查询参数同属一条状态主线。
- 相比继续做只读盘点，直接把 legacy 中已验证的 filter draft/query 写回逻辑最小迁入，更符合当前“开发优先、禁止纯计划循环”的要求。
- `ActiveIssuesWorkbenchPage` 仍需后续做最小类型验证；考虑到仓库里已有其它未收敛改动与 lockfile 冲突，下一轮更适合做定向编译/类型收口，而不是继续扩功能面。

### 26.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 本轮任务类型 | 最小开发任务（迁入高级筛选侧板） |
| 代码改动文件 | `frontend/src/components/issues/ActiveIssuesWorkbenchPage.tsx` |
| 文档改动文件 | `docs/planning/dev-logbook.md`, `docs/worktime.md` |
| 新增页面能力 | Filter 按钮可打开侧板；Apply/Clear 写回 team-active URL 筛选参数 |
| 本轮是否存在真实阻塞 | 否 |
| 遗留风险 | 尚未做定向类型检查；仓库存在既有未整理修改与 `frontend/package-lock.json` 冲突 |

### 26.5 Git commit hash

（本轮未提交）

---

## Session 28 — 2026-04-18：完成 `/issues` 顶部工具栏最小对标改动

**目标**：遵循任务板顺序，在 9222 仍不稳定的前提下，不停留在调查/规划阶段，直接完成一个可验证的 `/issues` 页面最小 UI 对标增量，使工具栏更接近 Linear 的 team/workbench 层级感。

### 28.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `AGENTS.md` | 复核中文输出、docs/ 可写、references/ 只读、必须更新任务板/日志/工时等纪律 |
| 读取 | `docs/linear-parity/task-board.md` | 按唯一任务状态源选择当前项；确认 LP-05 因 9222 不稳定受阻后，继续推进独立的 LP-07 / LP-08 最小 UI 任务 |
| 读取 | `docs/planning/dev-logbook.md` / `doc/worktime.md` | 复核项目日志格式，保证本轮产出落档 |
| 读取 | `docs/linear-parity/active-issues-toolbar-gap.md`、`docs/linear-parity/implementation-roadmap.md`、`frontend/src/app/issues/page.tsx` | 确认工具栏差距与最小切口：强化 active/backlog、降低 all/done 与 Drafts 权重，不改 query/data flow |
| 修改 | `frontend/src/app/issues/page.tsx` | 将 `/issues` 顶部工具栏改为更接近 Linear 的导航式容器：新增 Team views 标签，强化 active/backlog，弱化 all/done，提升 Search/Advanced filter/New 层级，降级 Drafts |
| 验证 | `frontend` -> `npm test -- src/components/issues/issue-view.test.ts` | 5/5 通过，确认共享 issue view helper 仍可用 |
| 验证 | `frontend` -> `npx tsc --noEmit` | 失败，但错误集中在既有 `src/components/issues/MarkdownEditor.tsx` 的 TipTap 依赖/隐式 any，非本轮工具栏改动引入 |
| 修改 | `docs/linear-parity/task-board.md` | 将 LP-05 标记为 blocked，并将 LP-07 / LP-08 标记为 done，记录 blocker 与已完成成果 |
| 修改 | `docs/planning/dev-logbook.md` | 记录本轮真实开发结果 |
| 修改 | `doc/worktime.md` | 记录 Session 28 工时 |

### 28.2 Bug / 偏差修正

- **问题**：原 `/issues` 顶部工具栏虽然功能齐全，但仍是平铺按钮堆叠；`all/done` 与 `active/backlog` 视觉权重接近，`Drafts` 又与主创建动作并列，缺少 Linear 式 team/workbench 工具栏的主次层级。
- **根因**：此前页面更偏向“功能直出”，而不是围绕当前团队最常用的 active/backlog 视角组织导航与操作优先级。
- **修正**：本轮只做安全的 UI 层调整：保留原 view/query/search/filter/create 行为不变，重构工具栏容器与按钮层级，突出 active/backlog 与 New，弱化 all/done 与 Drafts。

### 28.3 验证与阻塞说明

- **定向测试**：`npm test -- src/components/issues/issue-view.test.ts` ✅ 5 passed

---

## Session 54 · 22:30 复测确认 9222 metadata 双侧仍可读且 Active issues 深链继续落登录页

**目标**：在不做 Cruise 产品代码实现的前提下，按 capture lane 当前最靠前任务 CAP-06 再做一次最小 metadata + 真实页面只读复测；把 22:30 时刻 terminal/browser 双侧均可读 9222 metadata、但深链仍经中转页落到登录页的事实补写到 `docs/linear-parity/` 与项目日志，避免后续 cron 误判 Active issues 已恢复到可采真实控件状态。

### 54.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `AGENTS.md` / `docs/linear-parity/task-board.md` / `full-parity-capture-plan.md` / `page-inventory.md` / `README.md` | 按 capture lane 纪律确认当前最靠前任务仍为 CAP-06，且本轮只允许做只读取证与文档更新 |
| 检查 | `git status --short` | 提前确认仓库存在大量既有未提交实现改动，本轮保持只更新 `docs/linear-parity/` 与项目日志，不触碰 Cruise 产品代码 |
| 终端探测 | `127.0.0.1:9222/json/version` / `/json/list` | 确认 terminal 侧两端点本轮均恢复为 `200`，并可直接枚举到 Active issues target metadata |
| Browser 探测 | `http://127.0.0.1:9222/json/version` / `/json/list` | 确认 Hermes browser 仍能读取 browser metadata，并继续读到 target=`Cleantrack › Active issues` / id=`81A3713C33BCA35B2A0B8C7D177F43AD` |
| Browser 导航 | `https://linear.app/cleantrack/team/CLE/active` | 再次确认真实页面先落到 `Link opened in the Linear app` 中转页 |
| Browser 交互 | 点击 `Open here instead` | 再次确认后续页为 `Log in to Linear` 登录页，仅可见 Google/email/SAML SSO/passkey 入口，不含任何 Active issues 顶部控件 |
| Browser 摘要 | 浏览器 `performance` resource entries | 只读记录登录门页后最近静态资源摘要，明确本轮未主张已采到 Active issues 业务网络 |
| 新增 | `docs/linear-parity/har/2026-04-18-2230-active-issues-auth-gate-reprobe.json` | 固化 22:30 的 terminal/browser metadata、Linear target id、两张截图路径、登录入口与 blocker 分类 |
| 新增 | `docs/linear-parity/flows/active-issues-auth-session-blocker-2026-04-18-2230.md` | 落盘本轮中转页→登录页流程、DOM/结构变化摘要、资源级只读观察与仍缺失项 |
| 修改 | `docs/linear-parity/page-inventory.md` / `task-board.md` | 用 22:30 新证据刷新 Active issues 阻塞事实与引用文件 |
| 修改 | `docs/planning/dev-logbook.md` / `docs/worktime.md` / `doc/worktime.md` | 记录 Session 54 的真实取证增量与工时 |

### 54.2 本轮落地结果

- terminal 与 browser 两侧现在都能稳定读取 `/json/version` 与 `/json/list`，且继续枚举到 Active issues target：`Cleantrack › Active issues`（`81A3713C33BCA35B2A0B8C7D177F43AD`）。
- 但真实页面复用仍未恢复：`https://linear.app/cleantrack/team/CLE/active` 仍先进入 `Link opened in the Linear app` 中转页，点击 `Open here instead` 后进入 `Log in to Linear` 登录页。
- 本轮进一步补齐了登录门页可见入口细节：仅见 `Continue with Google`、`Continue with email`、`Continue with SAML SSO`、`Log in with passkey`，并确认本轮未见 CAPTCHA。

### 54.3 经验沉淀

- 当 metadata path 已恢复双侧可读后，capture lane 文档措辞必须从“9222 不可达”彻底切换到“authenticated page reuse 失败”，否则后续会误把问题定位在端口可用性而不是会话复用。
- 对这类中转页→登录页阻塞，最小真实增量不是继续重复 metadata 探测，而是把登录门页可见入口、截图、结构摘要与未见项补齐，便于后续明确缺的正是已登录业务页证据。
- 当前下一步最值得尝试的是 page websocket / CDP 级只读抓取 target `81A3713C33BCA35B2A0B8C7D177F43AD`，而不是继续做相同的浏览器深链复开。

### 54.4 关键数据快照

| 指标 | 值 |
|------|-----|
| terminal `/json/version` | `200`, `Chrome/147.0.7727.56` |
| terminal `/json/list` | `200`, 含 target `Cleantrack › Active issues` |
| browser `/json/version` | `200`, `Chrome/147.0.7727.56`, Protocol `1.3` |
| browser `/json/list` target | `81A3713C33BCA35B2A0B8C7D177F43AD` / `Cleantrack › Active issues` |
| 深链直开首屏 | `Link opened in the Linear app` |
| 点击 `Open here instead` 后 | `Log in to Linear` |
| 登录页可见入口 | `Continue with Google` / `Continue with email` / `Continue with SAML SSO` / `Log in with passkey` |
| CAPTCHA | 未见 |

### 54.5 Git commit hash

（本轮未提交）

---

## Session 55 · 22:40 复测确认 9222 再回 split state 且 Active issues 深链仍落登录页

**目标**：在不做 Cruise 产品代码实现的前提下，继续围绕 capture lane 当前最靠前任务 CAP-06 做一个新的最小只读增量：确认 22:40 时刻 9222 metadata 是否仍可读、真实 Active issues 深链是否仍被认证门页拦住，并把新的 split state 证据落盘到 `docs/linear-parity/` 与项目日志，避免后续把 blocker 错误归因为 target 消失。

### 55.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `AGENTS.md` / `docs/linear-parity/task-board.md` / `full-parity-capture-plan.md` / `page-inventory.md` / `README.md` / `api-catalog.md` / `route-map.md` / 项目日志 | 按 capture lane 与 fallback 纪律确认当前仍应只做取证文档更新 |
| 检查 | `git status --short` | 提前确认仓库仍有大量既有实现改动，本轮继续保持只更新 `docs/linear-parity/` 与项目日志 |
| 终端探测 | `127.0.0.1:9222/json/version` / `/json/list` | 记录 terminal 侧本轮再次返回 `502 Bad Gateway` |
| Browser 探测 | `http://127.0.0.1:9222/json/version` / `/json/list` | 确认 Hermes browser 侧仍可读取 metadata，并继续读到 target=`Cleantrack › Active issues` / id=`81A3713C33BCA35B2A0B8C7D177F43AD` |
| Browser 导航 | `https://linear.app/cleantrack/team/CLE/active` | 再次确认真实页面先落到 `Link opened in the Linear app` 中转页 |
| Browser 交互 | 点击 `Open here instead` | 再次确认后续页为 `Log in to Linear` 登录页，仅可见 Google/email/SAML SSO/passkey 入口，不含任何 Active issues 顶部控件 |
| Browser 摘要 | `performance.getEntriesByType('resource')` | 只读记录登录门页后最新静态资源尾部，明确本轮未主张已采到 Active issues 业务网络 |
| 新增 | `docs/linear-parity/har/2026-04-18-2240-active-issues-auth-gate-reprobe.json` | 固化 22:40 的 terminal/browser split state、Linear target id、两张截图路径、登录入口与 blocker 分类 |
| 新增 | `docs/linear-parity/flows/active-issues-auth-session-blocker-2026-04-18-2240.md` | 落盘本轮中转页→登录页流程、DOM/结构变化摘要、资源级只读观察与仍缺失项 |
| 修改 | `docs/linear-parity/page-inventory.md` / `task-board.md` / `api-catalog.md` / `route-map.md` | 用 22:40 新证据刷新 Active issues 阻塞事实与 metadata split state 说明 |
| 修改 | `docs/planning/dev-logbook.md` / `docs/worktime.md` / `doc/worktime.md` | 记录 Session 55 的真实取证增量与工时 |

### 55.2 本轮落地结果

- terminal 侧对 `9222` 的直连本轮再次退回 `502 Bad Gateway`，但 Hermes browser 侧仍可稳定读取 `/json/version` 与 `/json/list`。
- browser 侧 metadata 继续枚举到 Linear target：`Cleantrack › Active issues`（`81A3713C33BCA35B2A0B8C7D177F43AD`），说明 target 本身没有消失。
- 真实页面复用仍未恢复：深链仍先进入 `Link opened in the Linear app` 中转页，点击 `Open here instead` 后进入 `Log in to Linear` 登录页。
- 本轮再次确认登录页仅见 `Continue with Google`、`Continue with email`、`Continue with SAML SSO`、`Log in with passkey`，未见 CAPTCHA，也未见任何 Active issues 顶部 tabs / toolbar 控件。

### 55.3 经验沉淀

- 当前 blocker 需要被更精确地表述为双重状态：**browser-visible metadata 仍存在，但 authenticated page reuse 依旧失败；同时 terminal 直连 9222 不稳定。**
- 当 browser 还能列出 target id 时，最小有效增量应继续围绕 target/page websocket 做只读取证，而不是把失败误归因到“Linear tab 已关闭”。
- 视觉截图分析工具本轮对登录页截图返回了 `503 no_available_accounts`，但截图文件已成功生成；这类失败应记录为 vision 分析资源问题，不影响基础证据落盘。

### 55.4 关键数据快照

| 指标 | 值 |
|------|-----|
| terminal `/json/version` | `502 Bad Gateway` |
| terminal `/json/list` | `502 Bad Gateway` |
| browser `/json/version` | `200`, `Chrome/147.0.7727.56`, Protocol `1.3` |
| browser `/json/list` target | `81A3713C33BCA35B2A0B8C7D177F43AD` / `Cleantrack › Active issues` |
| 深链直开首屏 | `Link opened in the Linear app` |
| 点击 `Open here instead` 后 | `Log in to Linear` |
| 登录页可见入口 | `Continue with Google` / `Continue with email` / `Continue with SAML SSO` / `Log in with passkey` |
| CAPTCHA | 未见 |
| vision 登录页分析 | `503 no_available_accounts`（截图仍已生成） |

### 55.5 Git commit hash

（本轮未提交）
