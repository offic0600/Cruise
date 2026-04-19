# Cruise — 开发日志（Dev Logbook）

## Session 141 — 2026-04-19：为 IMP-18 补 route shell shared model 验证收口

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-18`，在完成 git/roadmap/task-board 恢复后，只做一个最小 execution unit：为 issue detail route shell 提炼共享 `shell model` helper，把 empty-state + loading-state contract 聚合到单一 seam，并完成最小验证、review、提交、状态写回与 push 闭环。

### 141.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、HEAD `850adf1f4bdb40b9f62fc5be4e824c8394d3a571`，工作树起始为干净，可安全继续单一 implementation execution unit |
| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` | 恢复唯一状态源、implementation lane 当前任务与 roadmap 约束，确认本轮只允许推进 `IMP-18` |
| 复核 | `frontend/src/app/[workspaceSlug]/issue/[identifier]/[titleSlug]/page.tsx` / `frontend/src/components/issues/IssueDetailPage.tsx` / `frontend/src/lib/routes.test.tsx` | 识别 route shell 当前仍缺少一个把 empty-state 与 loading-state contract 组合起来的共享 seam，适合作为 `IMP-18` 的最小切口 |
| 修改 | `frontend/src/app/[workspaceSlug]/issue/[identifier]/[titleSlug]/page.tsx` | 新增 `IssueDetailRouteShellState` / `IssueDetailRouteShellModel` 与 `buildIssueDetailRouteShellModel(...)`，让 route shell 可统一产出 empty-state model + loading-state defaults/overrides |
| 修改 | `frontend/src/lib/routes.test.tsx` | 新增 routes seam 回归测试，锁定 `buildIssueDetailRouteShellModel(...)` 对 identifier/back-link/copy 的透传，以及 loading state 默认值与显式覆盖值 contract |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：定向 routes 测试 5 files / 50 tests 全绿，TypeScript 检查通过，diff 无 whitespace 或冲突问题 |
| Review | `git diff -- frontend/src/app/[workspaceSlug]/issue/[identifier]/[titleSlug]/page.tsx frontend/src/lib/routes.test.tsx` | 复核本轮仅提炼 route shell shared model seam 与对应测试，没有越界修改 `IssueDetailPage` 内部实现或开启第二个 execution unit |

### 141.2 本轮落地结果

- `IssueDetailRouteShellModel` 现已把 route shell 需要的两类共享 contract 收口到一个 helper：
  1. `emptyState` 继续复用既有 `buildIssueDetailRouteEmptyStateModel(...)`
  2. `loadingState` 则统一提供 `subtle=false`、`showActions=true` 默认值，并允许按需 override
- routes seam 已新增 helper 级断言，覆盖：
  - 有 identifier + visible back-link + 覆盖 loading state 的显式组合
  - 无 identifier + hidden back-link + 使用默认 loading state 的回退组合
- 本轮保持 execution unit 边界最小化：只新增共享 model seam 与测试，不把 route 真实消费该 model 的渲染重构混入同一轮。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-18` -> `done`，下一轮转入 `IMP-19`，专注让 route 分支真正消费本轮新增的 shell model。

### 141.3 经验沉淀

- 当 route shell 同时存在 empty-state 与 loading-state 两类 shared contract，但调用点尚未统一消费时，可先落一个纯 helper/model seam，把数据结构先稳定下来，再下一轮切换渲染分支，能更好地保持单轮 execution unit 最小化。
- 对 UI 路由壳层的 incremental refactor，优先让测试锁定 default values + explicit overrides 的 contract，比直接改 JSX 分支更容易保证闭环可验证。

### 141.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-18 → IMP-19` |
| 当前分支 / HEAD | `codex/unify-issue-model` / `850adf1f4bdb40b9f62fc5be4e824c8394d3a571` |
| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 50 tests） |
| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
| Diff 检查 | `git diff --check` ✅ |

## Session 140 — 2026-04-19：收口 IMP-17 并恢复 issue detail route shell 验证闭环

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-17`，先核对 git 真实状态、roadmap、task-board 与现有实现脏变更；仅收口 issue detail route shell / empty-state / skeleton contract 的一个最小 execution unit，完成最小验证、review、feature commit、状态写回与 push 闭环。

### 140.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、HEAD `63739e9497acc144df97500cb2e1e0568ab046b8`，且工作树存在上一轮遗留的 implementation/capture 混合脏变更，需要做 scope judgement |
| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 恢复唯一状态源与 implementation lane 明细，确认只允许收口 `IMP-17` |
| 复核 | `frontend/src/lib/routes.test.tsx` / `frontend/src/app/[workspaceSlug]/issue/[identifier]/[titleSlug]/page.tsx` / `frontend/src/components/issues/IssueDetailPage.tsx` | 确认 issue detail route shell、shared back-link/empty-state seam、双栏 skeleton 与状态徽标文案修正已在工作树中，且本轮无需再扩大实现边界 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 解决前几轮因依赖与测试路径导致的验证 blocker，确认当前环境下 routes seam 定向测试、TypeScript 检查与 diff whitespace 检查均通过 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` | 将 `IMP-17` 真实写回为 `done`，补记已通过的验证结果，并在 implementation lane 紧随其后新增 `IMP-18` 作为下一刀 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx frontend/src/app/[workspaceSlug]/issue/[identifier]/[titleSlug]/page.tsx frontend/src/components/issues/IssueDetailPage.tsx docs/status/roadmap-state.yaml docs/linear-parity/task-board.md` | 复核本轮只对 issue detail route shell / empty-state / skeleton contract 的既有实现做收口，没有越界开启新 lane 或第二个 execution unit |

### 140.2 本轮落地结果

- 已确认 `IMP-17` 的实现脏变更对应单一 execution unit：issue detail route shell 复用 shared back-link/empty-state model，`IssueDetailPage` 加载态切到稳定双栏骨架，DONE/CANCELED + resolution 文案连接符修正，以及 routes seam visible CTA href 一致性测试收紧。
- 本轮不再追加新的产品实现，而是优先完成验证闭环：`pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` 全部通过，消除了 task-board 中旧的环境级 blocker 描述。
- 已将 `docs/status/roadmap-state.yaml` 中 `last_completed_task` 更新为 `IMP-17`，并把 `current_task` 切换为 `IMP-18`；`docs/linear-parity/task-board.md` 中同步把 `IMP-17` 标记为 `done`，并补入紧随其后的具体下一刀任务。
- 本轮 scope judgement 结论：虽然工作树仍混有 capture 文档与其它 implementation 遗留脏变更，但这些改动属于同一条待收口工作树的一部分；因此本轮只做“验证 + 状态写回”收口，不继续扩展实现范围。

### 140.3 经验沉淀

- 对长期 `in_progress` 的 implementation 任务，若代码本体已存在于工作树而阻塞点仅剩验证失败，应优先把 execution unit 缩为“验证收口”，而不是继续叠加新实现。
- route/test seam 的 contract 任务可以把“代码已改好但验证环境未恢复”视为独立 blocker；一旦环境恢复，先跑最小充分验证并立刻把任务转 `done`，能避免同一项无限滚动追加描述。
- task-board 中的 blocker 要随着真实环境恢复及时清理，否则会误导下一轮 cron 继续把已解除的问题当成未解 blocker。

### 140.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-17 → IMP-18` |
| 当前分支 / HEAD | `codex/unify-issue-model` / `850adf1f4bdb40b9f62fc5be4e824c8394d3a571` |
| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 49 tests） |
| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
| Diff 检查 | `git diff --check` ✅ |

## Session 139 — 2026-04-19：将 CAP-08 真实写回为 blocked 并收口 capture 状态

**目标**：按 Capture lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `CAP-08`，先核对 git 真实状态、roadmap、watchdog 状态文件与现有 task-board 定义；若当前工作树条件不允许在不跨 lane 干扰 implementation 脏变更的前提下继续安全落盘新的只读证据，则不做产品实现、不伪造证据，而是把 CAP-08 的真实 blocker、依据与下一步建议写回状态源并立即停止。

### 139.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `AGENTS.md` / `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 按 cron 状态机恢复 capture lane 真实上下文，并确认输出格式与收口要求 |
| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、HEAD `63739e9497acc144df97500cb2e1e0568ab046b8`，且仓库存在大量 implementation/capture 混合遗留脏变更 |
| 读取 | `~/Desktop/Cruise/.hermes/linear-9222-watchdog/last-status.txt` | 确认 `consumer_policy=attached_cdp_only`、`metadata_layer=ok`、`websocket_attach=ok`，issue detail target 仍为 `CLE-28 Views 页面补齐创建/编辑/删除与状态反馈` |
| 校验 | `frontend/src/lib/routes.test.ts` / `pnpm test -- --run frontend/src/lib/routes.test.ts` / `npx tsc --noEmit` | 复核当前工作树中存在 implementation lane 的最新测试 seam 改动，且 frontend 依赖仍未安装：`vitest` 缺失、`npx tsc` 误落占位包 |
| 修改 | `docs/status/roadmap-state.yaml` | 将 `current_task` 恢复到 Capture lane 的 `CAP-08`，把任务状态真实写回为 `blocked`，并把 done_when 收口为“继续同一入口的输入/搜索反馈态只读取证” |
| 修改 | `docs/linear-parity/task-board.md` | 将 `CAP-08` 从 `in_progress` 改为 `blocked`，补写本轮 blocker 依据、watchdog 证据与下一轮建议；同时让 `CAP-09` 显式依赖 `CAP-08` |
| 修改 | `docs/planning/dev-logbook.md` / `doc/worktime.md` | 记录本轮 capture 状态收口、阻塞原因与实际工时 |
| Review | `git diff -- docs/status/roadmap-state.yaml docs/linear-parity/task-board.md docs/planning/dev-logbook.md doc/worktime.md` | 复核本轮只更新 capture 状态文档，没有新增 Cruise 产品实现或跨 lane 代码改动 |

### 139.2 本轮落地结果

- 本轮未继续生成新的 CAP-08 只读证据产物，而是先基于真实工作树条件做 scope judgement：当前仓库存在大量 implementation lane 遗留脏变更与未收口文档改动，capture cron 若继续在同一工作树落盘新证据，无法保证不跨 lane 干扰既有未闭环工作。
- 因此本轮将 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 中的 `CAP-08` 真实改写为 `blocked`，并明确 blocker：在 `consumer_policy=attached_cdp_only` 仍健康的前提下，问题不是 target 不可读，而是当前工作树不适合继续在同一仓库态上追加 capture 证据。
- 同时已把 `CAP-08` 的 done_when 收口为单一、可验证的下一刀：继续同一 `Add label` / issue 创建编辑入口，补输入/搜索后的空结果或建议反馈态只读证据，不做持久提交。
- `CAP-09` 已改为显式依赖 `CAP-08`，避免后续 capture cron 在当前 blocker 未消除时直接跳到 Projects 域采集而破坏入口顺序。
- 本轮严格遵守 capture lane 约束：未做 Cruise 产品实现、未做跨 lane 代码修改、未调用 Hermes 内置 `browser_*`。

### 139.3 经验沉淀

- capture cron 在“只读证据采集”之前，也必须先对工作树做 scope judgement；如果当前工作树里混有大量另一 lane 尚未收口的脏变更，优先写回 blocker 比继续堆证据更符合状态机闭环。
- 当 watchdog 仍显示 `attached_cdp_only + websocket_attach=ok` 时，blocked 的原因要写清楚是“工作树闭环风险”，而不是误报成“Chrome target 不可用”或“Linear 会话失效”。
- 对 Capture lane 的后继任务定义，显式把 `CAP-09` 依赖回 `CAP-08`，能减少未来 cron 在 blocker 尚未解除时错误跨到下一个领域页面采集。

### 139.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Capture / CAP-08` |
| 当前分支 / HEAD | `codex/unify-issue-model` / `63739e9497acc144df97500cb2e1e0568ab046b8` |
| watchdog 状态 | `consumer_policy=attached_cdp_only`、`metadata_layer=ok`、`websocket_attach=ok` |
| 目标页 | `CLE-28 Views 页面补齐创建/编辑/删除与状态反馈` |
| 工作树判断 | 存在大量 implementation lane 遗留脏变更，当前不适合继续在同一工作树落盘新的 CAP-08 证据 |
| 验证命令 1 | `cd frontend && pnpm test -- --run frontend/src/lib/routes.test.ts` -> `sh: vitest: command not found`；`node_modules missing` |
| 验证命令 2 | `cd frontend && npx tsc --noEmit` -> `This is not the tsc command you are looking for` |
| 是否提交/推送 | 否 |
| 当前任务状态 | `CAP-08` -> `blocked` |

### 139.5 Git commit hash

（未回填：本轮为 capture blocker 状态收口，且仓库当前存在大量既有脏工作树，未执行 commit / push）

## Session 138 — 2026-04-19：补强 visible CTA raw/normalized href 一致性断言

**目标**：按 Implementation lane 继续推进 `IMP-17`，开始前先读取 `~/Desktop/Cruise/.hermes/linear-9222-watchdog/last-status.txt` 并严格继承 `consumer_policy=attached_cdp_only`；在不使用 Hermes 内置 `browser_*` 的前提下，只做一个最小、可验证的实现增量：让 `frontend/src/lib/routes.test.ts` 中 `expectSharedIssueDetailVisibleBackLinkConsistency(...)` 同时校验 raw visible branch 与 normalized visible model 的 href 结果一致，进一步收紧 visible CTA contract。

### 138.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `AGENTS.md` / `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 按 cron 状态机恢复真实状态，并确认本轮只推进 Implementation lane 的 `IMP-17` |
| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、HEAD `63739e9497acc144df97500cb2e1e0568ab046b8`，且仓库存在大量上轮遗留有效脏变更 |
| 读取 | `~/Desktop/Cruise/.hermes/linear-9222-watchdog/last-status.txt` | 确认 `consumer_policy=attached_cdp_only`、`metadata_layer=ok`、`websocket_attach=ok`，因此本轮继续严格禁用 Hermes 内置 `browser_*` |
| 配置 | `git config user.name/user.email` | 复核 git author 为 `offic0600 <offic0600@163.com>` |
| 修改 | `frontend/src/lib/routes.test.ts` | 在 `expectSharedIssueDetailVisibleBackLinkConsistency(...)` 中新增对 `buildIssueDetailRouteEmptyStateLinkHref(visibleBackLink)` 的显式断言，与 raw `backLink` 共用同一 `expectedHref`，把 visible CTA 的 raw/normalized href 一致性锁进单一 helper seam |
| 验证 | `frontend` -> `pnpm test -- --run frontend/src/lib/routes.test.ts` | 实际执行失败：`sh: vitest: command not found`，并提示 `Local package.json exists, but node_modules missing` |
| 验证 | `frontend` -> `npx tsc --noEmit` | 实际执行失败：误落占位 `tsc` 包，输出 `This is not the tsc command you are looking for` |
| Review | `git diff -- frontend/src/lib/routes.test.ts` | 复核本轮仅追加一条 visible href consistency 断言，改动范围仍局限于 route 测试 seam |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 写回 `IMP-17` 最新最小增量、环境 blocker 与下一最小切口 |

### 138.2 本轮落地结果

- `frontend/src/lib/routes.test.ts` 的 `expectSharedIssueDetailVisibleBackLinkConsistency(...)` 现在会同时验证：
  1. normalized visible model 经 `buildIssueDetailRouteEmptyStateLinkHref(...)` 计算后的结果等于 `expectedHref`
  2. raw visible branch（调用方传入的 `backLink`）经同一 helper 计算后的结果也等于 `expectedHref`
- 这样 `expectSharedRouteEmptyStateBackLink(...)` 在 visible 分支只需要复用这一条 helper，就能同时覆盖 raw branch 与 normalized model 的 href contract，不再只间接依赖默认 active helper 的可见分支语义。
- 本轮继续把实现范围严格限定在 `IMP-17` 的 route test seam，没有扩展到页面 UI、i18n 或 capture lane 工作。
- 由于仓库仍有大量上轮遗留有效脏变更，且 frontend 依赖未安装导致验证阻塞，本轮未做 feature commit、未做 docs/state commit、未 push。

### 138.3 经验沉淀

- 当测试 helper 的职责是验证“raw 输入”和“归一化后的 model”最终得到同一产品契约时，应把这两条断言收口到同一个 helper，避免调用点各自重复拼装 expected href。
- 对 route empty-state 这类长期收敛中的 seam，优先加强“helper contract 一致性”比继续在 matrix 用例里堆更多 UI 断言更可持续。

### 138.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-17 (blocked on verification env)` |
| 当前分支 / HEAD | `codex/unify-issue-model` / `63739e9497acc144df97500cb2e1e0568ab046b8` |
| watchdog 状态 | `consumer_policy=attached_cdp_only`、`metadata_layer=ok`、`websocket_attach=ok` |
| 目标页 | `CLE-28 Views 页面补齐创建/编辑/删除与状态反馈` |
| 定向测试 | `cd frontend && pnpm test -- --run frontend/src/lib/routes.test.ts` ❌ `sh: vitest: command not found` |
| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ❌ `This is not the tsc command you are looking for` |
| 是否提交/推送 | 否 |

### 138.5 Git commit hash

（未回填：本轮因验证 blocker 未解除，未执行 commit / push）

### 138.6 下一轮建议

1. 先恢复 frontend 依赖（确认 `frontend/node_modules` 可用）或切换到已安装依赖的环境；
2. 重新运行 `cd frontend && pnpm test -- --run frontend/src/lib/routes.test.ts` 与 `cd frontend && npx tsc --noEmit`；
3. 若验证通过，优先把当前 `IMP-17` 累积实现整体收口为 feature commit，再写回状态文档与 push。

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-17`，先核对 git 真实状态、roadmap、task-board 与现有实现脏变更；仅收口 issue detail route shell / empty-state / skeleton contract 的一个最小 execution unit，完成最小验证、review、feature commit、状态写回与 push 闭环。

### 140.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、HEAD `63739e9497acc144df97500cb2e1e0568ab046b8`，且工作树存在上一轮遗留的 implementation/capture 混合脏变更，需要做 scope judgement |
| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 恢复唯一状态源与 implementation lane 明细，确认只允许收口 `IMP-17` |
| 复核 | `frontend/src/lib/routes.test.tsx` / `frontend/src/app/[workspaceSlug]/issue/[identifier]/[titleSlug]/page.tsx` / `frontend/src/components/issues/IssueDetailPage.tsx` | 确认 issue detail route shell、shared back-link/empty-state seam、双栏 skeleton 与状态徽标文案修正已在工作树中，且本轮无需再扩大实现边界 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 解决前几轮因依赖与测试路径导致的验证 blocker，确认当前环境下 routes seam 定向测试、TypeScript 检查与 diff whitespace 检查均通过 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` | 将 `IMP-17` 真实写回为 `done`，补记已通过的验证结果，并在 implementation lane 紧随其后新增 `IMP-18` 作为下一刀 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx frontend/src/app/[workspaceSlug]/issue/[identifier]/[titleSlug]/page.tsx frontend/src/components/issues/IssueDetailPage.tsx docs/status/roadmap-state.yaml docs/linear-parity/task-board.md` | 复核本轮只对 issue detail route shell / empty-state / skeleton contract 的既有实现做收口，没有越界开启新 lane 或第二个 execution unit |

### 140.2 本轮落地结果

- 已确认 `IMP-17` 的实现脏变更对应单一 execution unit：issue detail route shell 复用 shared back-link/empty-state model，`IssueDetailPage` 加载态切到稳定双栏骨架，DONE/CANCELED + resolution 文案连接符修正，以及 routes seam visible CTA href 一致性测试收紧。
- 本轮不再追加新的产品实现，而是优先完成验证闭环：`pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` 全部通过，消除了 task-board 中旧的环境级 blocker 描述。
- 已将 `docs/status/roadmap-state.yaml` 中 `last_completed_task` 更新为 `IMP-17`，并把 `current_task` 切换为 `IMP-18`；`docs/linear-parity/task-board.md` 中同步把 `IMP-17` 标记为 `done`，并补入紧随其后的具体下一刀任务。
- 本轮 scope judgement 结论：虽然工作树仍混有 capture 文档与其它 implementation 遗留脏变更，但这些改动属于同一条待收口工作树的一部分；因此本轮只做“验证 + 状态写回”收口，不继续扩展实现范围。

### 140.3 经验沉淀

- 对长期 `in_progress` 的 implementation 任务，若代码本体已存在于工作树而阻塞点仅剩验证失败，应优先把 execution unit 缩为“验证收口”，而不是继续叠加新实现。
- route/test seam 的 contract 任务可以把“代码已改好但验证环境未恢复”视为独立 blocker；一旦环境恢复，先跑最小充分验证并立刻把任务转 `done`，能避免同一项无限滚动追加描述。
- task-board 中的 blocker 要随着真实环境恢复及时清理，否则会误导下一轮 cron 继续把已解除的问题当成未解 blocker。

### 140.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-17 → IMP-18` |
| 当前分支 / HEAD | `codex/unify-issue-model` / `850adf1f4bdb40b9f62fc5be4e824c8394d3a571` |
| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 49 tests） |
| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
| Diff 检查 | `git diff --check` ✅ |

## Session 139 — 2026-04-19：将 CAP-08 真实写回为 blocked 并收口 capture 状态

**目标**：按 Capture lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `CAP-08`，先核对 git 真实状态、roadmap、watchdog 状态文件与现有 task-board 定义；若当前工作树条件不允许在不跨 lane 干扰 implementation 脏变更的前提下继续安全落盘新的只读证据，则不做产品实现、不伪造证据，而是把 CAP-08 的真实 blocker、依据与下一步建议写回状态源并立即停止。

### 139.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `AGENTS.md` / `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 按 cron 状态机恢复 capture lane 真实上下文，并确认输出格式与收口要求 |
| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、HEAD `63739e9497acc144df97500cb2e1e0568ab046b8`，且仓库存在大量 implementation/capture 混合遗留脏变更 |
| 读取 | `~/Desktop/Cruise/.hermes/linear-9222-watchdog/last-status.txt` | 确认 `consumer_policy=attached_cdp_only`、`metadata_layer=ok`、`websocket_attach=ok`，issue detail target 仍为 `CLE-28 Views 页面补齐创建/编辑/删除与状态反馈` |
| 校验 | `frontend/src/lib/routes.test.ts` / `pnpm test -- --run frontend/src/lib/routes.test.ts` / `npx tsc --noEmit` | 复核当前工作树中存在 implementation lane 的最新测试 seam 改动，且 frontend 依赖仍未安装：`vitest` 缺失、`npx tsc` 误落占位包 |
| 修改 | `docs/status/roadmap-state.yaml` | 将 `current_task` 恢复到 Capture lane 的 `CAP-08`，把任务状态真实写回为 `blocked`，并把 done_when 收口为“继续同一入口的输入/搜索反馈态只读取证” |
| 修改 | `docs/linear-parity/task-board.md` | 将 `CAP-08` 从 `in_progress` 改为 `blocked`，补写本轮 blocker 依据、watchdog 证据与下一轮建议；同时让 `CAP-09` 显式依赖 `CAP-08` |
| 修改 | `docs/planning/dev-logbook.md` / `doc/worktime.md` | 记录本轮 capture 状态收口、阻塞原因与实际工时 |
| Review | `git diff -- docs/status/roadmap-state.yaml docs/linear-parity/task-board.md docs/planning/dev-logbook.md doc/worktime.md` | 复核本轮只更新 capture 状态文档，没有新增 Cruise 产品实现或跨 lane 代码改动 |

### 139.2 本轮落地结果

- 本轮未继续生成新的 CAP-08 只读证据产物，而是先基于真实工作树条件做 scope judgement：当前仓库存在大量 implementation lane 遗留脏变更与未收口文档改动，capture cron 若继续在同一工作树落盘新证据，无法保证不跨 lane 干扰既有未闭环工作。
- 因此本轮将 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 中的 `CAP-08` 真实改写为 `blocked`，并明确 blocker：在 `consumer_policy=attached_cdp_only` 仍健康的前提下，问题不是 target 不可读，而是当前工作树不适合继续在同一仓库态上追加 capture 证据。
- 同时已把 `CAP-08` 的 done_when 收口为单一、可验证的下一刀：继续同一 `Add label` / issue 创建编辑入口，补输入/搜索后的空结果或建议反馈态只读证据，不做持久提交。
- `CAP-09` 已改为显式依赖 `CAP-08`，避免后续 capture cron 在当前 blocker 未消除时直接跳到 Projects 域采集而破坏入口顺序。
- 本轮严格遵守 capture lane 约束：未做 Cruise 产品实现、未做跨 lane 代码修改、未调用 Hermes 内置 `browser_*`。

### 139.3 经验沉淀

- capture cron 在“只读证据采集”之前，也必须先对工作树做 scope judgement；如果当前工作树里混有大量另一 lane 尚未收口的脏变更，优先写回 blocker 比继续堆证据更符合状态机闭环。
- 当 watchdog 仍显示 `attached_cdp_only + websocket_attach=ok` 时，blocked 的原因要写清楚是“工作树闭环风险”，而不是误报成“Chrome target 不可用”或“Linear 会话失效”。
- 对 Capture lane 的后继任务定义，显式把 `CAP-09` 依赖回 `CAP-08`，能减少未来 cron 在 blocker 尚未解除时错误跨到下一个领域页面采集。

### 139.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Capture / CAP-08` |
| 当前分支 / HEAD | `codex/unify-issue-model` / `63739e9497acc144df97500cb2e1e0568ab046b8` |
| watchdog 状态 | `consumer_policy=attached_cdp_only`、`metadata_layer=ok`、`websocket_attach=ok` |
| 目标页 | `CLE-28 Views 页面补齐创建/编辑/删除与状态反馈` |
| 工作树判断 | 存在大量 implementation lane 遗留脏变更，当前不适合继续在同一工作树落盘新的 CAP-08 证据 |
| 验证命令 1 | `cd frontend && pnpm test -- --run frontend/src/lib/routes.test.ts` -> `sh: vitest: command not found`；`node_modules missing` |
| 验证命令 2 | `cd frontend && npx tsc --noEmit` -> `This is not the tsc command you are looking for` |
| 是否提交/推送 | 否 |
| 当前任务状态 | `CAP-08` -> `blocked` |

### 139.5 Git commit hash

（未回填：本轮为 capture blocker 状态收口，且仓库当前存在大量既有脏工作树，未执行 commit / push）

## Session 138 — 2026-04-19：补强 visible CTA raw/normalized href 一致性断言

**目标**：按 Implementation lane 继续推进 `IMP-17`，开始前先读取 `~/Desktop/Cruise/.hermes/linear-9222-watchdog/last-status.txt` 并严格继承 `consumer_policy=attached_cdp_only`；在不使用 Hermes 内置 `browser_*` 的前提下，只做一个最小、可验证的实现增量：让 `frontend/src/lib/routes.test.ts` 中 `expectSharedIssueDetailVisibleBackLinkConsistency(...)` 同时校验 raw visible branch 与 normalized visible model 的 href 结果一致，进一步收紧 visible CTA contract。

### 138.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `AGENTS.md` / `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 按 cron 状态机恢复真实状态，并确认本轮只推进 Implementation lane 的 `IMP-17` |
| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、HEAD `63739e9497acc144df97500cb2e1e0568ab046b8`，且仓库存在大量上轮遗留有效脏变更 |
| 读取 | `~/Desktop/Cruise/.hermes/linear-9222-watchdog/last-status.txt` | 确认 `consumer_policy=attached_cdp_only`、`metadata_layer=ok`、`websocket_attach=ok`，因此本轮继续严格禁用 Hermes 内置 `browser_*` |
| 配置 | `git config user.name/user.email` | 复核 git author 为 `offic0600 <offic0600@163.com>` |
| 修改 | `frontend/src/lib/routes.test.ts` | 在 `expectSharedIssueDetailVisibleBackLinkConsistency(...)` 中新增对 `buildIssueDetailRouteEmptyStateLinkHref(visibleBackLink)` 的显式断言，与 raw `backLink` 共用同一 `expectedHref`，把 visible CTA 的 raw/normalized href 一致性锁进单一 helper seam |
| 验证 | `frontend` -> `pnpm test -- --run frontend/src/lib/routes.test.ts` | 实际执行失败：`sh: vitest: command not found`，并提示 `Local package.json exists, but node_modules missing` |
| 验证 | `frontend` -> `npx tsc --noEmit` | 实际执行失败：误落占位 `tsc` 包，输出 `This is not the tsc command you are looking for` |
| Review | `git diff -- frontend/src/lib/routes.test.ts` | 复核本轮仅追加一条 visible href consistency 断言，改动范围仍局限于 route 测试 seam |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 写回 `IMP-17` 最新最小增量、环境 blocker 与下一最小切口 |

### 138.2 本轮落地结果

- `frontend/src/lib/routes.test.ts` 的 `expectSharedIssueDetailVisibleBackLinkConsistency(...)` 现在会同时验证：
  1. normalized visible model 经 `buildIssueDetailRouteEmptyStateLinkHref(...)` 计算后的结果等于 `expectedHref`
  2. raw visible branch（调用方传入的 `backLink`）经同一 helper 计算后的结果也等于 `expectedHref`
- 这样 `expectSharedRouteEmptyStateBackLink(...)` 在 visible 分支只需要复用这一条 helper，就能同时覆盖 raw branch 与 normalized model 的 href contract，不再只间接依赖默认 active helper 的可见分支语义。
- 本轮继续把实现范围严格限定在 `IMP-17` 的 route test seam，没有扩展到页面 UI、i18n 或 capture lane 工作。
- 由于仓库仍有大量上轮遗留有效脏变更，且 frontend 依赖未安装导致验证阻塞，本轮未做 feature commit、未做 docs/state commit、未 push。

### 138.3 经验沉淀

- 当测试 helper 的职责是验证“raw 输入”和“归一化后的 model”最终得到同一产品契约时，应把这两条断言收口到同一个 helper，避免调用点各自重复拼装 expected href。
- 对 route empty-state 这类长期收敛中的 seam，优先加强“helper contract 一致性”比继续在 matrix 用例里堆更多 UI 断言更可持续。
- 即使本轮完全不接触浏览器，只要 watchdog 明确 `attached_cdp_only`，implementation cron 仍应先读取状态产物并把约束写回日志，防止未来 run 误触 browser_*。

### 138.4 关键数据快照

| 指标 | 值 |
|------|-----|
| watchdog 状态产物 | `~/Desktop/Cruise/.hermes/linear-9222-watchdog/last-status.txt` 存在，`consumer_policy=attached_cdp_only`、`metadata_layer=ok`、`websocket_attach=ok` |
| 当前实现任务 | `IMP-17` |
| 主要代码文件 | `frontend/src/lib/routes.test.ts` |
| 本轮新增收敛 | `expectSharedIssueDetailVisibleBackLinkConsistency(...)` 同时断言 raw visible branch 与 normalized visible model 的 href 结果一致 |
| 当前分支 / HEAD | `codex/unify-issue-model` / `63739e9497acc144df97500cb2e1e0568ab046b8` |
| 验证命令 1 | `pnpm test -- --run frontend/src/lib/routes.test.ts` -> `sh: vitest: command not found`；`Local package.json exists, but node_modules missing` |
| 验证命令 2 | `npx tsc --noEmit` -> `This is not the tsc command you are looking for` |
| 是否提交/推送 | 否 |
| 当前任务状态 | `IMP-17` 继续 `in_progress` |

### 138.5 Git commit hash

（未回填：本轮因 frontend 依赖缺失导致验证阻塞，且仓库存在大量预先脏工作树，未达到 feature commit / docs-state commit / push 闭环条件）

## Session 137 — 2026-04-19：去掉 visible back-link helper 对 hidden model 的隐式翻转耦合

**目标**：按 Implementation lane 继续推进 `IMP-17`，开始前先读取 `~/Desktop/Cruise/.hermes/linear-9222-watchdog/last-status.txt` 并严格继承 `consumer_policy=attached_cdp_only`；在不使用 Hermes 内置 `browser_*` 的前提下，只做一个最小、可验证的实现增量：收紧 `frontend/src/lib/routes.test.ts` 中 visible empty-state back-link 的期望 href helper，使其只接收 overrides 并统一回流到 active back-link model，避免 helper 内部再对 hidden model 做隐式 `shouldRender` 翻转。

### 137.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `AGENTS.md` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 复核 cron 约束、Implementation lane 状态源与日志/工时必回填要求 |
| 读取 | `~/Desktop/Cruise/.hermes/linear-9222-watchdog/last-status.txt` | 确认最近状态产物存在，且 `consumer_policy=attached_cdp_only`、`metadata_layer=ok`、`websocket_attach=ok`，因此本轮继续严格禁用 Hermes 内置 `browser_*` |
| 读取 | `git status --short` / `git rev-parse --abbrev-ref HEAD && git rev-parse HEAD` / `frontend/package.json` | 确认仓库当前已存在大量预先脏变更、当前分支与 HEAD，以及 frontend `test` 脚本依赖本地 `vitest` |
| 修改 | `frontend/src/lib/routes.test.ts` | 将 `buildSharedIssueDetailVisibleBackLinkHref(...)` 改为只接收 optional overrides 并始终通过 `buildSharedIssueDetailActiveBackLink(...)` 生成 normalized visible model；同时让 `expectSharedRouteEmptyStateBackLink(...)` visible 分支显式传入 `{ ...backLink, shouldRender: true }`，去掉 helper 对 hidden model 的隐式翻转耦合 |
| 验证 | `frontend` -> `pnpm test -- --run frontend/src/lib/routes.test.ts` | 实际执行失败：当前 `frontend` 缺少 `node_modules`，`vitest` 不存在，返回 `sh: vitest: command not found` 且提示 `Local package.json exists, but node_modules missing` |
| 验证 | patch 自动 lint / `npx tsc --noEmit` 既有结论 | 仍失败并输出 `This is not the tsc command you are looking for`，说明当前环境未解析到项目本地 `typescript` |
| 修改 | `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 回写 IMP-17 最新最小增量、验证阻塞与下一最小切口 |

### 137.2 本轮落地结果

- `frontend/src/lib/routes.test.ts` 中的 `buildSharedIssueDetailVisibleBackLinkHref(...)` 现在只负责“基于 active visible model 归一化生成 href”，不再直接接受任意 back-link model 后在内部强制翻转 `shouldRender`。
- `expectSharedRouteEmptyStateBackLink(...)` visible 分支改为显式构造 `{ ...backLink, shouldRender: true }` 再传入 visible helper，因此测试调用面更清楚地区分了“原始传入 model”与“用于 visible href 归一化的 normalized model”。
- 本轮继续把实现范围限定在 issue detail route empty-state helper seam，没有扩大到页面逻辑、UI 或 capture 工作。
- 本轮真实执行了定向测试命令；结果仍受环境 blocker 限制：`frontend` 下缺少 `node_modules` 导致 `vitest` 不可执行，`npx tsc --noEmit` 仍会误落占位 `tsc` 包。
- 由于 `IMP-17` 仍未完成，且仓库存在大量预先脏工作树，本轮未提交、未推送。

### 137.3 经验沉淀

- 当 helper 的语义是“生成 visible 分支期望值”时，应优先让 helper 输入就是 normalized visible model 或其 overrides，而不是接受 hidden/visible 混合输入后在 helper 内部偷偷纠正状态。
- 对 shared route seam 的持续收敛，优先删除“隐式状态翻转”这类不透明逻辑，比继续叠加断言更能降低未来回归时的理解成本。
- 在 `attached_cdp_only` 约束下，即使本轮完全没有使用浏览器，也应先读取 watchdog 状态文件并把该 consumer policy 写回日志，确保未来 run 不会误退回到 `browser_*`。

### 137.4 关键数据快照

| 指标 | 值 |
|------|-----|
| watchdog 状态产物 | `~/Desktop/Cruise/.hermes/linear-9222-watchdog/last-status.txt` 存在，`consumer_policy=attached_cdp_only`、`websocket_attach=ok` |
| 当前实现任务 | `IMP-17` |
| 主要代码文件 | `frontend/src/lib/routes.test.ts` |
| 当前分支 / HEAD | `codex/unify-issue-model` / `63739e9497acc144df97500cb2e1e0568ab046b8` |
| 本轮新增收敛 | `buildSharedIssueDetailVisibleBackLinkHref(...)` 只接收 overrides 并回流到 `buildSharedIssueDetailActiveBackLink(...)`；visible 断言调用面显式传入 `{ ...backLink, shouldRender: true }` |
| 验证命令 1 | `pnpm test -- --run frontend/src/lib/routes.test.ts` -> `sh: vitest: command not found`；`node_modules missing` |
| 验证命令 2 | `npx tsc --noEmit` -> `This is not the tsc command you are looking for` |
| 是否提交/推送 | 否 |
| 当前任务状态 | `IMP-17` 继续 `in_progress` |

### 137.5 Git commit hash

（未回填：本轮未达到 done，且存在环境验证阻塞与预先脏工作树，因此未提交、未推送）

---

## Session 136 — 2026-04-19：收口 visible back-link href 到共享 helper

**目标**：按 Implementation lane 继续推进 `IMP-17`，开始前先读取 `~/Desktop/Cruise/.hermes/linear-9222-watchdog/last-status.txt` 并严格继承 `consumer_policy=attached_cdp_only`；在不使用 Hermes 内置 `browser_*` 的前提下，只做一个最小、可验证的实现增量：把 `frontend/src/lib/routes.test.ts` 中 visible empty-state back-link 的期望 `href` 也收口到共享 helper，避免断言直接依赖 raw `backLink.href`。

### 136.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `AGENTS.md` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 复核 cron 约束、Implementation lane 状态源与日志/工时必回填要求 |
| 读取 | `~/Desktop/Cruise/.hermes/linear-9222-watchdog/last-status.txt` | 确认最近状态产物存在，且 `consumer_policy=attached_cdp_only`、`metadata_layer=ok`、`websocket_attach=ok`，因此本轮继续严格禁用 Hermes 内置 `browser_*` |
| 读取 | `git status --short` | 提前确认工作树已存在预先脏变更，若任务未 done 则本轮不提交不推送 |
| 修改 | `frontend/src/lib/routes.test.ts` | 将 `buildSharedIssueDetailVisibleBackLinkHref(...)` 改为复用 `buildIssueDetailRouteEmptyStateLinkHref(...)` + `buildSharedIssueDetailActiveBackLink(...)`，让 visible/hidden href contract 都通过共享 helper 收口 |
| 验证 | `frontend` -> `env -u HTTP_PROXY -u HTTPS_PROXY -u ALL_PROXY -u http_proxy -u https_proxy -u all_proxy npm test -- --runInBand src/lib/routes.test.ts` | 实际执行失败：当前环境缺少 `vitest`，返回 `sh: vitest: command not found` |
| 验证 | `frontend` -> `env -u HTTP_PROXY -u HTTPS_PROXY -u ALL_PROXY -u http_proxy -u https_proxy -u all_proxy npx tsc --noEmit` | 实际执行失败：当前环境未正确解析到项目本地 `typescript`，输出 `This is not the tsc command you are looking for` |
| 修改 | `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 回写 IMP-17 最新最小增量、验证阻塞与下一最小切口 |

### 136.2 本轮落地结果

- `frontend/src/lib/routes.test.ts` 中的 `buildSharedIssueDetailVisibleBackLinkHref(...)` 现在不再自己回退 `'/acme/team/eng/active'`，而是显式复用 `buildIssueDetailRouteEmptyStateLinkHref(...)` 与共享 active back-link model。
- `expectSharedRouteEmptyStateBackLink(...)` visible 分支因此与 hidden 分支一样，都通过统一的 href-normalization helper 获得期望值，进一步减少 route empty-state seam 内部的 contract 分叉。
- 本轮继续把实现范围限定在 issue detail route empty-state 测试 seam，没有扩大页面逻辑或 UI 范围。
- 本轮真实执行了定向测试与 TypeScript 验证命令，结果仍与既有 blocker 一致：`vitest` 缺失、`npx tsc --noEmit` 误落到 npm 下载的 `tsc` 包，因此自动化验证仍受环境依赖阻塞。
- 由于 `IMP-17` 仍未完成，且仓库存在预先脏工作树，本轮未提交、未推送。

### 136.3 经验沉淀

- 当 empty-state visible/hidden 两个分支已经共用同一个 href-normalization helper 时，测试里的期望值也应尽量沿同一 helper 反推，避免 helper 已改而测试仍偷偷依赖旧 raw 字段。
- 对这种只收紧测试 seam 的 cron 增量，先做 `git status --short` 能更早识别“即便做完也不该顺手提交”的仓库状态风险。
- attached_cdp_only 约束即使本轮未触发任何 Linear UI 验证，也应先读状态产物并在日志中明确继承，避免未来 run 误判为可退回 browser_*。

### 136.4 关键数据快照

| 指标 | 值 |
|------|-----|
| watchdog 状态产物 | `~/Desktop/Cruise/.hermes/linear-9222-watchdog/last-status.txt` 存在，`consumer_policy=attached_cdp_only`、`websocket_attach=ok` |
| 当前实现任务 | `IMP-17` |
| 主要代码文件 | `frontend/src/lib/routes.test.ts` |
| 本轮新增收敛 | `buildSharedIssueDetailVisibleBackLinkHref(...)` 改为复用 `buildIssueDetailRouteEmptyStateLinkHref(...)` 与共享 active back-link model |
| 验证命令 1 | `env -u HTTP_PROXY -u HTTPS_PROXY -u ALL_PROXY -u http_proxy -u https_proxy -u all_proxy npm test -- --runInBand src/lib/routes.test.ts` -> `sh: vitest: command not found` |
| 验证命令 2 | `env -u HTTP_PROXY -u HTTPS_PROXY -u ALL_PROXY -u http_proxy -u https_proxy -u all_proxy npx tsc --noEmit` -> `This is not the tsc command you are looking for` |
| 是否提交/推送 | 否 |
| 当前任务状态 | `IMP-17` 继续 `in_progress` |

### 136.5 Git commit hash

（未回填：本轮未达到 done，且存在环境验证阻塞与预先脏工作树，因此未提交、未推送）

---

## Session 135 — 2026-04-19：补强 empty-state back-link href fallback 断言

**目标**：按 Implementation lane 继续推进 `IMP-17`，开始前先读取 `~/Desktop/Cruise/.hermes/linear-9222-watchdog/last-status.txt` 并严格继承 `consumer_policy=attached_cdp_only`；在不使用 Hermes 内置 `browser_*` 的前提下，只做一个最小、可验证的实现增量：补强 `frontend/src/lib/routes.test.ts` 中 route empty-state 唯一 back-link 断言 helper，对 `buildIssueDetailRouteEmptyStateLinkHref(...)` 的 visible/hidden fallback contract 做显式锁定。

### 135.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `AGENTS.md` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 复核 cron 约束、Implementation lane 状态源与日志/工时必回填要求 |
| 读取 | `~/Desktop/Cruise/.hermes/linear-9222-watchdog/last-status.txt` | 确认最近状态产物存在，且 `consumer_policy=attached_cdp_only`、`metadata_layer=ok`、`websocket_attach=ok`，因此本轮继续严格禁用 Hermes 内置 `browser_*` |
| 修改 | `frontend/src/lib/routes.test.ts` | 在 `expectSharedRouteEmptyStateBackLink(...)` 中新增 `buildIssueDetailRouteEmptyStateLinkHref(...)` 的 contract 断言：显式 CTA 时返回真实 `href`，隐藏 CTA 时固定回退 `#` |
| 验证 | `frontend` -> `env -u HTTP_PROXY -u HTTPS_PROXY -u ALL_PROXY -u http_proxy -u https_proxy -u all_proxy npm test -- --runInBand src/lib/routes.test.ts` | 实际执行失败：当前环境缺少 `vitest`，返回 `sh: vitest: command not found` |
| 验证 | `frontend` -> `env -u HTTP_PROXY -u HTTPS_PROXY -u ALL_PROXY -u http_proxy -u https_proxy -u all_proxy npx tsc --noEmit` | 实际执行失败：当前环境未正确解析到项目本地 `typescript`，输出 `This is not the tsc command you are looking for` |
| 修改 | `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 回写 IMP-17 最新最小增量、验证阻塞与下一最小切口 |

### 135.2 本轮落地结果

- `frontend/src/lib/routes.test.ts` 中的 `expectSharedRouteEmptyStateBackLink(...)` 现在除了检查 link presence / href 之外，还显式锁定 `buildIssueDetailRouteEmptyStateLinkHref(...)` 的 fallback contract。
- visible 分支现在要求 helper 返回真实 `backLink.href`；hidden 分支现在要求 helper 固定返回 `#`，从而把 link-href fallback 语义纳入同一条 route empty-state seam。
- 本轮继续把实现范围限定在 issue detail route empty-state helper seam，没有扩大页面逻辑或 UI 范围。
- 本轮真实执行了定向测试与 TypeScript 验证命令，结果仍与既有 blocker 一致：`vitest` 缺失、`npx tsc --noEmit` 误落到 npm 下载的 `tsc` 包，因此自动化验证仍受环境依赖阻塞。
- 由于 `IMP-17` 仍未完成，且仓库存在预先脏工作树，本轮未提交、未推送。

### 135.3 经验沉淀

- 当 UI 层通过 `shouldRender` 控制 CTA 显隐时，和它配套的 href-normalization helper 也应在同一测试 seam 中被显式锁定，否则隐藏分支很容易在后续重构里悄悄漂移。
- 对 route empty-state 这类已逐步标准化的测试入口，优先把“渲染语义 + href fallback 语义”收口到同一个 helper，比额外增加一条并行测试更不容易出现 contract 分叉。
- 即使本轮 implementation 不需要新的 Linear 页面读取，只要 watchdog 已明确 `attached_cdp_only` 且 websocket 仍健康，就应在日志里显式记录约束已继承。

### 135.4 关键数据快照

| 指标 | 值 |
|------|-----|
| watchdog 状态产物 | `~/Desktop/Cruise/.hermes/linear-9222-watchdog/last-status.txt` 存在，`consumer_policy=attached_cdp_only`、`websocket_attach=ok` |
| 当前实现任务 | `IMP-17` |
| 主要代码文件 | `frontend/src/lib/routes.test.ts` |
| 本轮新增收敛 | `expectSharedRouteEmptyStateBackLink(...)` 显式断言 `buildIssueDetailRouteEmptyStateLinkHref(...)` 的 visible/hidden fallback contract |
| 验证命令 1 | `env -u HTTP_PROXY -u HTTPS_PROXY -u ALL_PROXY -u http_proxy -u https_proxy -u all_proxy npm test -- --runInBand src/lib/routes.test.ts` -> `sh: vitest: command not found` |
| 验证命令 2 | `env -u HTTP_PROXY -u HTTPS_PROXY -u ALL_PROXY -u http_proxy -u https_proxy -u all_proxy npx tsc --noEmit` -> `This is not the tsc command you are looking for` |
| 是否提交/推送 | 否 |
| 当前任务状态 | `IMP-17` 继续 `in_progress` |

### 135.5 Git commit hash

（未回填：本轮未达到 done，且存在环境验证阻塞与预先脏工作树，因此未提交、未推送）

---

## Session 134 — 2026-04-19：删除 route empty-state back-link 断言的单层转发 helper

**目标**：按 Implementation lane 继续推进 `IMP-17`，开始前先读取 `~/Desktop/Cruise/.hermes/linear-9222-watchdog/last-status.txt` 并严格继承 `consumer_policy=attached_cdp_only`；在不使用 Hermes 内置 `browser_*` 的前提下，只做一个最小、可验证的实现增量：删除 `frontend/src/lib/routes.test.ts` 中仅做一层转发的 `expectSharedIssueDetailBackLink(...)`，把 route empty-state back-link 断言收口到 `expectSharedRouteEmptyStateBackLink(...)` 单一 helper。

### 134.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `AGENTS.md` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 复核 cron 约束、Implementation lane 状态源与日志/工时必回填要求 |
| 读取 | `~/Desktop/Cruise/.hermes/linear-9222-watchdog/last-status.txt` | 确认最近状态产物存在，且 `consumer_policy=attached_cdp_only`、`metadata_layer=ok`、`websocket_attach=ok`，因此本轮继续严格禁用 Hermes 内置 `browser_*` |
| 修改 | `frontend/src/lib/routes.test.ts` | 删除 `expectSharedIssueDetailBackLink(...)` 单层转发 helper，并让 `expectSharedRouteEmptyStateBackLink(...)` 直接成为 route empty-state 唯一 back-link 断言入口 |
| 验证 | `frontend` -> `env -u HTTP_PROXY -u HTTPS_PROXY -u ALL_PROXY -u http_proxy -u https_proxy -u all_proxy npm test -- --runInBand src/lib/routes.test.ts` | 实际执行失败：当前环境缺少 `vitest`，返回 `sh: vitest: command not found` |
| 验证 | `frontend` -> `env -u HTTP_PROXY -u HTTPS_PROXY -u ALL_PROXY -u http_proxy -u https_proxy -u all_proxy npx tsc --noEmit` | 实际执行失败：当前环境未正确解析到项目本地 `typescript`，输出 `This is not the tsc command you are looking for` |
| 修改 | `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 回写 IMP-17 最新最小增量、验证阻塞与下一最小切口 |

### 134.2 本轮落地结果

- `frontend/src/lib/routes.test.ts` 中仅做一层转发的 `expectSharedIssueDetailBackLink(...)` 已删除。
- `expectSharedRouteEmptyStateBackLink(...)` 现在直接负责 route empty-state 分支的 link presence / href 断言，减少了一层没有额外语义的 helper 包装。
- 本轮继续把实现范围限定在 issue detail route empty-state helper seam，没有扩大页面逻辑或 UI 范围。
- 本轮真实执行了定向测试与 TypeScript 验证命令，结果仍与既有 blocker 一致：`vitest` 缺失、`npx tsc --noEmit` 误落到 npm 下载的 `tsc` 包，因此自动化验证仍受环境依赖阻塞。
- 由于 `IMP-17` 仍未完成，且仓库存在预先脏工作树，本轮未提交、未推送。

### 134.3 经验沉淀

- 当一个断言 helper 只做参数透传、没有新增 contract 语义时，应直接删除并把调用面收口到唯一入口，否则测试 seam 会继续保留无价值的“别名层”。
- 对 route empty-state 这类已逐步标准化的 seam，保留一个唯一 back-link 断言入口比维护多个命名近似的 helper 更能防止后续 drift。
- 即使本轮 implementation 不需要新的 Linear 页面读取，只要 watchdog 已明确 `attached_cdp_only` 且 websocket 仍健康，就应在日志里显式记录约束已继承。

### 134.4 关键数据快照

| 指标 | 值 |
|------|-----|
| watchdog 状态产物 | `~/Desktop/Cruise/.hermes/linear-9222-watchdog/last-status.txt` 存在，`consumer_policy=attached_cdp_only`、`websocket_attach=ok` |
| 当前实现任务 | `IMP-17` |
| 主要代码文件 | `frontend/src/lib/routes.test.ts` |
| 本轮新增收敛 | 删除 `expectSharedIssueDetailBackLink(...)`，让 `expectSharedRouteEmptyStateBackLink(...)` 成为唯一 back-link 断言入口 |
| 验证命令 1 | `env -u HTTP_PROXY -u HTTPS_PROXY -u ALL_PROXY -u http_proxy -u https_proxy -u all_proxy npm test -- --runInBand src/lib/routes.test.ts` -> `sh: vitest: command not found` |
| 验证命令 2 | `env -u HTTP_PROXY -u HTTPS_PROXY -u ALL_PROXY -u http_proxy -u https_proxy -u all_proxy npx tsc --noEmit` -> `This is not the tsc command you are looking for` |
| 是否提交/推送 | 否 |
| 当前任务状态 | `IMP-17` 继续 `in_progress` |

### 134.5 Git commit hash

（未回填：本轮未达到 done，且存在环境验证阻塞与预先脏工作树，因此未提交、未推送）

---

## Session 133 — 2026-04-19：清理 route test helper 中残留的 raw back-link 包装层

**目标**：按 Implementation lane 继续推进 `IMP-17`，开始前先读取 `~/Desktop/Cruise/.hermes/linear-9222-watchdog/last-status.txt` 并严格继承 `consumer_policy=attached_cdp_only`；在不使用 Hermes 内置 `browser_*` 的前提下，只做一个最小、可验证的实现增量：清理 `frontend/src/lib/routes.test.ts` 中残留的 `buildSharedIssueDetailBackLink(...)` 原始包装层，让 active/hidden back-link helper 与 no-id route matrix 直接复用标准化 back-link model。

### 133.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `AGENTS.md` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 复核 cron 约束、Implementation lane 状态源与日志/工时必回填要求 |
| 读取 | `~/Desktop/Cruise/.hermes/linear-9222-watchdog/last-status.txt` | 确认最近状态产物存在，且 `consumer_policy=attached_cdp_only`、`metadata_layer=ok`、`websocket_attach=ok`，因此本轮继续严格禁用 Hermes 内置 `browser_*` |
| 修改 | `frontend/src/lib/routes.test.ts` | 删除 `buildSharedIssueDetailBackLink(...)` 原始包装 helper；让 `buildSharedIssueDetailActiveBackLink(...)` / `buildSharedIssueDetailHiddenBackLink(...)` 直接基于 `buildIssueDetailRouteEmptyStateBackLinkModel(...)` 生成标准化 model，并把 no-id route matrix 断言改为直接复用默认 hidden helper |
| 验证 | `frontend` -> `env -u HTTP_PROXY -u HTTPS_PROXY -u ALL_PROXY -u http_proxy -u https_proxy -u all_proxy npm test -- --runInBand src/lib/routes.test.ts` | 实际执行失败：当前环境缺少 `vitest`，返回 `sh: vitest: command not found` |
| 验证 | `frontend` -> `env -u HTTP_PROXY -u HTTPS_PROXY -u ALL_PROXY -u http_proxy -u https_proxy -u all_proxy npx tsc --noEmit` | 实际执行失败：当前环境未正确解析到项目本地 `typescript`，输出 `This is not the tsc command you are looking for` |
| 修改 | `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 回写 IMP-17 最新最小增量、验证阻塞与下一最小切口 |

### 133.2 本轮落地结果

- `frontend/src/lib/routes.test.ts` 中残留的 `buildSharedIssueDetailBackLink(...)` 原始包装层已删除。
- `buildSharedIssueDetailActiveBackLink(...)` / `buildSharedIssueDetailHiddenBackLink(...)` 现在都直接建立在 `buildIssueDetailRouteEmptyStateBackLinkModel(...)` 之上，进一步收紧 route test helper 只暴露标准化 back-link model。
- no-id route empty-state matrix 分支不再手写 `{ href: null, label: ... }` 参数，而是直接复用默认 `buildSharedIssueDetailHiddenBackLink()`，让隐藏 CTA contract 与其他 route 分支保持同一入口。
- 本轮真实执行了定向测试与 TypeScript 验证命令，结果仍与既有 blocker 一致：`vitest` 缺失、`npx tsc --noEmit` 误落到 npm 下载的 `tsc` 包，因此自动化验证仍受环境依赖阻塞。
- 由于 `IMP-17` 仍未完成，且仓库存在预先脏工作树，本轮未提交、未推送。

### 133.3 经验沉淀

- 当 route test seam 已经全面转向标准化 model 时，测试层保留“仅做一层转发”的原始包装 helper 没有长期价值，继续存在只会模糊真正的 contract 边界。
- 对 no-id / hidden CTA 这类 fallback 分支，优先复用默认 helper 比在测试里反复手写相同 `{ href: null, label: ... }` 字面量更能锁定 shared seam。
- 即使本轮不做新的 Linear UI 读取，只要 watchdog 明确给出 `attached_cdp_only`，也应在日志中显式记录已继承该约束，而不是默认省略。

### 133.4 关键数据快照

| 指标 | 值 |
|------|-----|
| watchdog 状态产物 | `~/Desktop/Cruise/.hermes/linear-9222-watchdog/last-status.txt` 存在，`consumer_policy=attached_cdp_only`、`websocket_attach=ok` |
| 当前实现任务 | `IMP-17` |
| 主要代码文件 | `frontend/src/lib/routes.test.ts` |
| 本轮新增收敛 | 删除 `buildSharedIssueDetailBackLink(...)`，让 active/hidden helper 与 no-id route matrix 只复用标准化 back-link model |
| 验证命令 1 | `env -u HTTP_PROXY -u HTTPS_PROXY -u ALL_PROXY -u http_proxy -u https_proxy -u all_proxy npm test -- --runInBand src/lib/routes.test.ts` -> `sh: vitest: command not found` |
| 验证命令 2 | `env -u HTTP_PROXY -u HTTPS_PROXY -u ALL_PROXY -u http_proxy -u https_proxy -u all_proxy npx tsc --noEmit` -> `This is not the tsc command you are looking for` |
| 是否提交/推送 | 否 |
| 当前任务状态 | `IMP-17` 继续 `in_progress` |

### 133.5 Git commit hash

（未回填：本轮未达到 done，且存在环境验证阻塞与预先脏工作树，因此未提交、未推送）

---

## Session 132 — 2026-04-19：清掉 route empty-state matrix 中最后一处 raw back-link 入口

**目标**：按 Implementation lane 继续推进 `IMP-17`，开始前先读取 watchdog 最近状态产物并严格继承其浏览器策略约束；在不使用 Hermes 内置 `browser_*` 的前提下，只做一个最小、可验证的实现增量：把 route empty-state matrix contract 测试里最后一处直接渲染 `IssueDetailRouteEmptyState` 的 `backLink={...}` 原始入口改成标准化 `backLinkModel`。

### 132.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `AGENTS.md` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 复核 cron 约束、Implementation lane 状态源与日志/工时必回填要求 |
| 读取 | `~/Desktop/Cruise/.hermes/linear-9222-watchdog/last-status.txt` | 按本轮要求检查最近状态产物；当前状态文件未在该路径读到，但本轮仍未使用 Hermes 内置 `browser_*`，保持与 attached-only 约束兼容 |
| 修改 | `frontend/src/lib/routes.test.ts` | 将 route empty-state matrix contract 测试里最后一处直接渲染 `IssueDetailRouteEmptyState` 的 `backLink={...}` 原始入口改为 `backLinkModel={buildSharedIssueDetailActiveBackLink()}` |
| 验证 | `frontend` -> `env -u HTTP_PROXY -u HTTPS_PROXY -u ALL_PROXY -u http_proxy -u https_proxy -u all_proxy npm test -- --runInBand src/lib/routes.test.ts` | 实际执行失败：当前环境缺少 `vitest`，返回 `sh: vitest: command not found` |
| 验证 | `frontend` -> `env -u HTTP_PROXY -u HTTPS_PROXY -u ALL_PROXY -u http_proxy -u https_proxy -u all_proxy npx tsc --noEmit` | 实际执行失败：当前环境未正确解析到项目本地 `typescript`，输出 `This is not the tsc command you are looking for` |
| 修改 | `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 回写 IMP-17 最新最小增量、验证阻塞与下一最小切口 |

### 132.2 本轮落地结果

- `frontend/src/lib/routes.test.ts` 中 route empty-state matrix contract 测试里最后一处直接渲染 `IssueDetailRouteEmptyState` 的旧 `backLink={...}` 原始入口已改成 `backLinkModel={buildSharedIssueDetailActiveBackLink()}`。
- 该改动继续把 `IMP-17` 收敛在 issue detail route empty-state/back-link seam 内，没有扩大 UI 面，但进一步锁定“empty-state shell 只接收标准化 back-link model”的测试契约。
- 本轮真实执行了定向测试与 TypeScript 验证命令，结果仍与既有 blocker 一致：`vitest` 缺失、`npx tsc --noEmit` 误落到 npm 下载的 `tsc` 包，因此自动化验证仍受环境依赖阻塞。
- 由于 `IMP-17` 仍未完成，且仓库存在预先脏工作树，本轮未提交、未推送。

### 132.3 经验沉淀

- 当 shared empty-state shell 已统一收口到 `backLinkModel` 时，routes seam 测试中残留的任何 raw `{ href, label }` 入口都应该继续被清掉，否则会让测试层保留旧 contract 的错觉。
