
## Session 208 — 2026-04-20：Capture lane 复核 CAP-08 docs 闭环与工作树风险阻塞

**目标**：按 capture lane 规则恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md`，在强制读取 `AGENTS.md`、watchdog、roadmap、logbook、worktime 后，只做一个最小 execution unit：核对 `tmp/linear-capture/summary.json` 是否比 docs 更新；若无新 capture 产物且 docs 已同步，则补一次 capture lane 状态复核，明确 CAP-08 仍因工作树闭环风险 blocked，而不是附着失败。

### 208.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | 读取 `AGENTS.md`、`docs/status/roadmap-state.yaml`、`docs/linear-parity/task-board.md`、`docs/plans/2026-04-16-linear-parity-roadmap.md`、`docs/planning/dev-logbook.md`、`doc/worktime.md`，并执行 `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / `git status --short` | 确认仓库位于 `codex/unify-issue-model`，状态文件当前仍停在 Implementation lane `IMP-89`；按任务板 Capture lane 需回退到 `CAP-08`，且工作树无新增脏文件但当前 lane 边界仍要求避免在 implementation 收口过程中继续向同树写入新 capture 产物 |
| 约束复核 | 读取 `~/Desktop/Cruise/.hermes/linear-9222-watchdog/last-status.txt` | 明确 `consumer_policy=attached_cdp_only`、`metadata_layer=ok`、`websocket_attach=ok`，且附着 target 继续指向 `CLE-28 Views 页面补齐创建/编辑/删除与状态反馈`；因此本轮禁止使用 Hermes 内置 `browser_*`，也不能把 blocker 误写成“附着失败” |
| 证据新鲜度核对 | 比较 `tmp/linear-capture/summary.json` 与 `docs/linear-parity/task-board.md` / `docs/status/roadmap-state.yaml` / `docs/planning/dev-logbook.md` / `doc/worktime.md` 的最近修改时间 | 确认 `summary.json` 最近时间仍为 2026-04-19 23:20:06 CST，早于四个 docs 文件本轮前的最近写回，说明 CAP-08 现有 capture 证据已完成 docs 闭环，本轮不应重复采集 |
| 状态写回 | 更新 `docs/linear-parity/task-board.md` 与 `docs/status/roadmap-state.yaml` | 将 CAP-08 blocker 文案补成 12:18 CST 的新复核结论，明确 blocker 仍是“工作树闭环风险，非附着失败”，并同步更新状态文件 handoff 摘要，提醒 capture cron 遇到 docs 已同步且无新产物时直接停止 |
| 验证 | `git diff -- docs/linear-parity/task-board.md docs/status/roadmap-state.yaml` + 重读变更片段 | 复核仅有 capture lane docs 文案更新，无实现代码改动，也无误把 blocker 写成附着失败 |

### 208.2 本轮落地结果

- 已再次确认 watchdog 仍处于 `attached_cdp_only + websocket_attach=ok` 健康状态，CAP-08 当前并非浏览器附着失败。
- 已再次确认 `tmp/linear-capture/summary.json` 没有比 task-board / roadmap-state / dev-logbook / worktime 更新，因此现有 capture 产物已完成 docs 闭环，本轮不做重复采集。
- 已将 CAP-08 与状态文件 handoff 更新为新的 capture lane 复核结论：当前 blocker 继续是工作树闭环风险，下一轮应在独立干净工作树执行只读采集，或待 implementation 收口后再继续 `Add label` search input 的空结果/建议反馈态证据。

### 208.3 经验沉淀

- Capture cron 在状态文件仍停在 Implementation lane 时，不能直接放弃；应回退到 task-board 的 Capture lane 当前项继续做 docs 闭环或 blocker 复核。
- 当 watchdog 明确给出 `attached_cdp_only` 与 `websocket_attach=ok` 时，即使本轮最终没有新采集动作，也要把“无新产物 + docs 已同步”与“非附着失败”这两个事实写回，避免后续 run 误重复采集或误报 blocker 类型。

### 208.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Capture / CAP-08（blocked）` |
| 当前分支 / HEAD | `codex/unify-issue-model` / `1afed62f2616cb6b455c5193134253ac12192193` |
| watchdog | `consumer_policy=attached_cdp_only`、`websocket_attach=ok` |
| capture 证据新鲜度 | `tmp/linear-capture/summary.json`（2026-04-19 23:20:06 CST）早于 docs 最新写回 |
| Git commit hash | `未提交（docs-only capture closure review）` |

## Session 211 — 2026-04-20：评估并补回第一条 legacy route API 失败标题中的 route 级语义词（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-92`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前再次均已收口为 `getIssue rejects` / `getOrganizations rejects` 后，是否仍需要重新补回某个 route 级语义词来维持与 helper 级 lookup 标题的层级区分；若可行，则只改第一处安全标题并完成验证、review、提交、状态回写与 push 闭环。

### 211.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，Implementation lane 当前项为 `IMP-92`，且工作树干净，可支持新的单文件最小 execution unit |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('getIssue rejects', async () => {` 补回为 `it('route getIssue rejects', async () => {`；不改第二条 API 失败标题，也不改共享断言、fixture 设置或 helper/route 运行时逻辑 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: restore route wording for legacy issue reject title"` | 完成本轮 feature/work commit，得到真实提交 `7e8146e21b7a41ddddce4956c5b13882b945b16e` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-92` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-93`：评估第二条 `getOrganizations rejects` 是否也应与已补回 route 级语义词的第一条标题保持对称 |

### 211.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 legacy `/issues/[id]` route 两条 API 失败场景再次同时收口为 `getIssue rejects` / `getOrganizations rejects` 后，route 层级会与 helper 级 lookup 标题重新过于接近。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题从 `getIssue rejects` 补回为 `route getIssue rejects`，同时保持第二条 `getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-92` -> `done`，下一轮转入 `IMP-93`，继续评估第二条 route 级 API 失败场景标题是否也应补回 route 级语义词。

## Session 213 — 2026-04-20：评估并去掉第一条 legacy route API 失败标题中的 route 前缀（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-94`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前均补回 `route` 级语义词后，是否仍需要继续保留第一条 `route getIssue rejects` 的对称前缀来维持与 helper 级标题的层级区分；若可行，则只改这一处安全标题并完成验证、review、提交、状态回写与 push 闭环。

### 213.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，Implementation lane 当前项为 `IMP-94`，且工作树干净，可支持新的单文件最小 execution unit |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('route getIssue rejects', async () => {` 收口为 `it('getIssue rejects', async () => {`；不改第二条 API 失败标题，也不改共享断言、fixture 设置或 helper/route 运行时逻辑 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: drop redundant route wording from legacy issue reject title"` | 完成本轮 feature/work commit，得到真实提交 `277d31c62713efd966fddc17bacdca212358a6d8` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-94` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-95`：评估第二条 `route getOrganizations rejects` 是否也应在首条已收口后对称去掉 `route` 前缀 |

### 213.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文下，两条 route 级 API 失败场景即使都补回了 route 级语义，也不必继续保持完全对称的 `route` 前缀来维持层级区分。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题从 `route getIssue rejects` 收口为 `getIssue rejects`，同时保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-94` -> `done`，下一轮转入 `IMP-95`，继续评估第二条 route 级 API 失败场景标题是否也应对称收口。

### 213.3 经验沉淀

- 即使两条 route 级失败标题刚刚恢复为对称 wording，也应再次结合 describe 作用域与 helper 级 seam wording 判断前缀是否仍有必要，避免把“对称”误当成必须长期保留的语义负担。
- 纯测试标题收口也应坚持一次只改一条、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 213.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-94 → IMP-95` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `524be4f7626c7082a45d1501ffa462dcb551d2fb` |
| feature commit | `277d31c62713efd966fddc17bacdca212358a6d8` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 212 — 2026-04-20：评估并补回第二条 legacy route API 失败标题中的 route 级语义词（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-93`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route `getOrganizations()` API 失败场景标题是否应与已补回 route 级语义词的 `route getIssue rejects` 保持对称；若可行，则只改这一处安全标题并完成验证、review、提交、状态回写与 push 闭环。

### 212.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，Implementation lane 当前项为 `IMP-93`，且工作树干净，可支持新的单文件最小 execution unit |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('getOrganizations rejects', async () => {` 补回为 `it('route getOrganizations rejects', async () => {`；不改第一条 API 失败标题，也不改共享断言、fixture 设置或 helper/route 运行时逻辑 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | 独立 review + `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: restore second route wording for legacy issue lookup again"` | 完成本轮 feature/work commit，得到真实提交 `dbdd761b01a010d3ee8cece151b5e7195325085d` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-93` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-94`：评估两条 API 失败标题在均补回 route 级语义词后是否仍需保留对称前缀 |

### 212.2 本轮落地结果

- 已确认 `getOrganizations()` API 失败场景与本轮前已补回 route 级语义词的 `route getIssue rejects` 一样，仍属于 legacy `/issues/[id]` route 渲染层测试标题。
- 若继续保持 `getOrganizations rejects`，会破坏两条 route 级 API 失败场景对 helper 级标题的最小对称层级区分。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题从 `getOrganizations rejects` 补回为 `route getOrganizations rejects`，同时保持第一条 `route getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-93` -> `done`，下一轮转入 `IMP-94`，继续评估两条 route 级 API 失败场景标题在均补回 route 级语义词后是否仍需保留对称前缀。

### 212.3 经验沉淀

- 当 route 级两条 API 失败标题再次同时去掉 `route` 前缀后，应重新比对 helper 级 seam wording，避免把“之前收口过”误当成长期稳定结论。
- 即使只是补回单个 route 级语义词，也应保持一次只改一条标题并完整跑定向 Vitest + TypeScript + diff cleanliness + review，确保共享断言与 helper/route 运行时逻辑未被误触。

### 211.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-92 → IMP-93` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `f3c6310f14197cf9f62e31ec823b1e7f57088215` |
| feature commit | `7e8146e21b7a41ddddce4956c5b13882b945b16e` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 210 — 2026-04-20：评估并去掉第一条 legacy route API 失败标题中的 route 前缀（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-90`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前均补回 `route` 级语义词后，是否仍需要继续保留第一条 `route getIssue rejects` 的对称前缀来维持与 helper 级标题的层级区分；若可行，则只改这一处安全标题并完成验证、review、提交、状态回写与 push 闭环。

### 210.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，Implementation lane 当前项为 `IMP-90`，且工作树干净，可支持新的单文件最小 execution unit |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('route getIssue rejects', async () => {` 收口为 `it('getIssue rejects', async () => {`；不改第二条 API 失败标题，也不改共享断言、fixture 设置或 helper/route 运行时逻辑 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: drop redundant route prefix from first legacy issue reject title"` | 完成本轮 feature/work commit，得到真实提交 `5600390e10d847b43bf7872239aaf7d21a5c4488` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-90` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-91`：评估第二条 `route getOrganizations rejects` 是否也应在首条已收口后对称去掉 `route` 前缀 |

### 210.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文下，两条 route 级 API 失败场景即使都补回了 route 级语义，也不必继续保持完全对称的 `route` 前缀来维持层级区分。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题从 `route getIssue rejects` 收口为 `getIssue rejects`，同时保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-90` -> `done`，下一轮转入 `IMP-91`，继续评估第二条 route 级 API 失败场景标题是否也应对称收口。

### 210.3 经验沉淀

- 即使两条 route 级失败标题刚刚恢复为对称 wording，也应再次结合 describe 作用域与 helper 级 seam wording 判断前缀是否仍有必要，避免把“对称”误当成必须长期保留的语义负担。
- 纯测试标题收口也应坚持一次只改一条、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 210.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-90 → IMP-91` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `e13b998e1f0f5fb55da92b92d27a7acd0735bf36` |
| feature commit | `5600390e10d847b43bf7872239aaf7d21a5c4488` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 209 — 2026-04-20：评估并补回第二条 legacy route API 失败标题中的 route 级语义词（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-89`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route `getOrganizations()` API 失败场景当前 `getOrganizations rejects` 标题是否应与上一轮已补回 route 级语义词的 `route getIssue rejects` 保持对称、也补成一条最小 route 级语义词标题；若可行，则只改这一处安全标题并完成验证、review、提交、状态回写与 push 闭环。

### 209.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，Implementation lane 当前项为 `IMP-89`；工作树虽带有 capture lane 上轮 docs 闭环残留，但仅落在 `roadmap-state` / `task-board` / `dev-logbook` / `worktime`，属于同仓 docs/state closure 残留，可继续本轮 implementation execution unit 并在 docs/state commit 中一并收口 |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('getOrganizations rejects', async () => {` 补回为 `it('route getOrganizations rejects', async () => {`；不改第一条 route 级标题，也不改共享断言、fixture 设置或 helper/route 运行时逻辑 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: restore second route wording for legacy issue lookup again"` | 完成本轮 feature/work commit，得到真实提交 `b017e526e464c766ef4a7e29ff7dd5ca34578028` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-89` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-90`：评估两条 API 失败场景测试标题在均补回 route 级语义词后是否仍需保留对称前缀 |

### 209.2 本轮落地结果

- 已确认 `getOrganizations()` API 失败场景与上一轮已补回 route 级语义词的 `route getIssue rejects` 一样，仍属于 legacy `/issues/[id]` route 渲染层测试标题。
- 若继续保持 `getOrganizations rejects`，会破坏两条 route 级 API 失败场景对 helper 级标题的最小对称层级区分。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题从 `getOrganizations rejects` 补回为 `route getOrganizations rejects`，同时保持第一条 `route getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-89` -> `done`，下一轮转入 `IMP-90`，继续评估两条 API 失败场景在均补回 route 级语义词后是否仍需保留对称前缀。

### 209.3 经验沉淀

- 当 helper 级标题仍通过显式 helper seam wording 保留层级区分时，对 route 级对称标题的回调应一次只恢复一条，再验证是否需要推进另一条，避免在同轮里同时改动两处后失去最小比较基线。
- route 级标题是否保留前缀，仍要结合 describe 作用域与 helper 级标题词汇共同判断；即使是纯测试文案收口，也应走完整验证、review、状态写回闭环。

### 209.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-89 → IMP-90` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `1afed62f2616cb6b455c5193134253ac12192193` |
| feature commit | `b017e526e464c766ef4a7e29ff7dd5ca34578028` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 207 — 2026-04-20：评估并补回第一条 legacy route API 失败标题中的 route 级语义词（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-88`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前均已收口为 `getIssue rejects` / `getOrganizations rejects` 后，是否仍需要重新补回某个 route 级语义词来维持与 helper 级 lookup 标题的层级区分；若可行，则只改第一处安全标题并完成验证、review、提交、状态回写与 push 闭环。

### 207.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，Implementation lane 当前项为 `IMP-88`，且工作树干净，可支持新的单文件最小 execution unit |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('getIssue rejects', async () => {` 补回为 `it('route getIssue rejects', async () => {`；不改第二条 API 失败标题，也不改共享断言、fixture 设置或 helper/route 运行时逻辑 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: restore route wording for legacy issue lookup again"` | 完成本轮 feature/work commit，得到真实提交 `a15fa6f0ab494e50369b6d5ed54a5d75144fdc74` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-88` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-89`：评估 `getOrganizations()` API 失败场景测试标题是否也应与 `route getIssue rejects` 保持对称、补回 route 级语义词 |

### 207.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义，而 route 级 API 失败场景若继续同时保持 `getIssue rejects` / `getOrganizations rejects` 会与 helper 层级过于接近。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题从 `getIssue rejects` 补回为 `route getIssue rejects`，以最小 route 级语义词恢复层级辨识度，同时保持第二条 `getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-88` -> `done`，下一轮转入 `IMP-89`，继续评估 `getOrganizations rejects` 标题是否也应补回 route 级语义词。

### 207.3 经验沉淀

- 当 helper 级标题仍通过显式 helper seam wording 保留层级区分时，可以按 execution unit 先只补回第一条 route 级 API 失败标题中的最小 `route` 语义词，再观察是否仍需对第二条对称标题做同量级收口。
- 即使只是补回单个 route 级语义词，也要保持一次只改一条标题并完整跑定向 Vitest + TypeScript + diff cleanliness + review，确保共享断言与 helper/route 运行时 seam 没被误触。

### 207.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-88 → IMP-89` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `628de1ba03c80005efd8414a1b18fd3cd7599bd9` |
| feature commit | `a15fa6f0ab494e50369b6d5ed54a5d75144fdc74` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 206 — 2026-04-20：评估并去掉第二条 legacy route API 失败标题中的 route 前缀（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-87`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 第二条 API 失败场景当前 `route getOrganizations rejects` 标题在首条已收口为 `getIssue rejects` 后，是否也应对称去掉 `route` 前缀；若可行，则只改这一处安全标题并完成验证、review、提交、状态回写与 push 闭环。

### 206.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，Implementation lane 当前项为 `IMP-87`，且工作树干净，可支持新的单文件最小 execution unit |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('route getOrganizations rejects', async () => {` 收口为 `it('getOrganizations rejects', async () => {`；不改第一条 route 级标题，也不改共享断言、fixture 设置或 helper/route 运行时逻辑 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: trim second route wording for legacy issue lookup again"` | 完成本轮 feature/work commit，得到真实提交 `628de1ba03c80005efd8414a1b18fd3cd7599bd9` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-87` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-88`：评估两条 API 失败场景测试标题在均去掉 `route` 前缀后是否仍需补回 route 级语义词 |

### 206.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义；在 describe 已限定 legacy `/issues/[id]` route 上下文下，第二条 route 级 API 失败场景 `route getOrganizations rejects` 应与已收口为 `getIssue rejects` 的第一条 route 级失败标题保持对称，也去掉 `route` 前缀。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题从 `route getOrganizations rejects` 收口为 `getOrganizations rejects`，同时保持第一条 `getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-87` -> `done`，下一轮转入 `IMP-88`，继续评估两条 API 失败场景测试标题在都去掉 `route` 前缀后是否仍需补回 route 级语义词。

### 206.3 经验沉淀

- 当 helper 级标题仍通过显式 helper seam wording 保留层级区分，而 route 级第一条 API 失败标题已确认可安全去掉 `route` 前缀时，下一轮可以仅对第二条对称标题做同量级收口，保持 execution unit 仍然是单标题文案改动。
- 即使只是再次删掉单个前缀词，也要重跑定向 Vitest + TypeScript + diff cleanliness，并在 review 中明确共享断言与 helper/route 运行时逻辑未被误触。

### 206.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-87 → IMP-88` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `53d8e0869aaf41d63cdef5edd4be55f3c253e815` |
| feature commit | `628de1ba03c80005efd8414a1b18fd3cd7599bd9` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 205 — 2026-04-20：评估并去掉第一条 legacy route API 失败标题中的 route 前缀（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-86`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前均为 `route getIssue rejects` / `route getOrganizations rejects` 后，是否仍需继续保留对称的 `route` 前缀维持与 helper 级标题的层级区分；若可行，则只改第一处安全标题并完成验证、review、提交、状态回写与 push 闭环。

### 205.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，Implementation lane 当前项为 `IMP-86`，且工作树干净，可支持新的单文件最小 execution unit |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('route getIssue rejects', async () => {` 收口为 `it('getIssue rejects', async () => {`；不改第二条 route 级标题，也不改共享断言、fixture 设置或 helper/route 运行时逻辑 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: trim route wording for legacy issue lookup again"` | 完成本轮 feature/work commit，得到真实提交 `53d8e0869aaf41d63cdef5edd4be55f3c253e815` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-86` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-87`：评估第二条 `route getOrganizations rejects` 标题在首条已去掉 `route` 前缀后是否也应对称收口 |

### 205.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义；在 describe 已限定 legacy `/issues/[id]` route 上下文下，两条 route 级 API 失败场景若继续保持 `route getIssue rejects` / `route getOrganizations rejects` 会造成多余的对称前缀。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题从 `route getIssue rejects` 收口为 `getIssue rejects`，同时保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-86` -> `done`，下一轮转入 `IMP-87`，继续评估第二条 `route getOrganizations rejects` 标题是否也应去掉 `route` 前缀。

### 205.3 经验沉淀

- 当 helper 级标题仍通过显式 helper seam wording 保留层级区分时，可以按 execution unit 先只去掉第一条 route 级 API 失败标题中的对称 `route` 前缀，再观察是否仍需对第二条对称标题做相同收口。
- 即使只是去掉单个 route 级前缀，也要保持一次只改一条标题并完整跑定向 Vitest + TypeScript + diff cleanliness + review，确保共享断言与 seam 没被误触。

### 205.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-86 → IMP-87` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `c20b123c1e270cb81179889157c9829daac6b508` |
| feature commit | `53d8e0869aaf41d63cdef5edd4be55f3c253e815` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 204 — 2026-04-20：评估并补回第二条 legacy route API 失败标题中的 route 级语义词（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-85`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 第二条 API 失败场景当前 `getOrganizations rejects` 标题是否应与上一轮已补回 route 级语义词的 `route getIssue rejects` 保持对称、也补成一条最小 route 级语义词标题；若可行，则只改这一处安全标题并完成验证、review、提交、状态回写与 push 闭环。

### 204.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，Implementation lane 当前项为 `IMP-85`，且工作树干净，可支持新的单文件最小 execution unit |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('getOrganizations rejects', async () => {` 补回为 `it('route getOrganizations rejects', async () => {`；不改第一条 API 失败标题，也不改共享断言、fixture 设置或 helper/route 运行时逻辑 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` + 独立审查 | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: restore second route wording for legacy issue lookup again"` | 完成本轮 feature/work commit，得到真实提交 `c20b123c1e270cb81179889157c9829daac6b508` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-85` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-86`：评估两条 API 失败场景在均补回 route 级语义词后是否仍需保留对称前缀 |

### 204.2 本轮落地结果

- 已确认 `getOrganizations()` API 失败场景与上一轮已补回 route 级语义词的 `route getIssue rejects` 一样，仍属于 legacy `/issues/[id]` route 渲染层测试标题。
- 若继续保持 `getOrganizations rejects`，会破坏两条 route 级 API 失败场景对 helper 级标题的最小对称层级区分。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题从 `getOrganizations rejects` 补回为 `route getOrganizations rejects`，同时保持第一条 `route getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-85` -> `done`，下一轮转入 `IMP-86`，继续评估两条 API 失败场景在均补回 route 级语义词后是否仍需保留对称前缀。

### 204.3 经验沉淀

- 当 helper 级标题仍通过显式 helper seam wording 保留层级区分时，对 route 级对称标题的回调应一次只恢复一条，再验证是否需要推进另一条，避免在同轮里同时改动两处后失去最小比较基线。
- route 级标题是否保留前缀，仍要结合 describe 作用域与 helper 级标题词汇共同判断；即使是纯测试文案收口，也应走完整验证、review、状态写回闭环。

### 204.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-85 → IMP-86` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `b2b062033cb269544539be28525bb99766eca2b1` |
| feature commit | `c20b123c1e270cb81179889157c9829daac6b508` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 203 — 2026-04-20：评估并补回第一条 legacy route API 失败标题中的 route 级语义词（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-84`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前均已收口为 `getIssue rejects` / `getOrganizations rejects` 后，是否仍需要重新补回某个 route 级语义词来维持与 helper 级 lookup 标题的层级区分；若可行，则只改第一处安全标题并完成验证、review、提交、状态回写与 push 闭环。

### 203.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，Implementation lane 当前项为 `IMP-84`，且工作树干净，可支持新的单文件最小 execution unit |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('getIssue rejects', async () => {` 补回为 `it('route getIssue rejects', async () => {`；不改第二条 API 失败标题，也不改共享断言、fixture 设置或 helper/route 运行时逻辑 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: restore route wording for legacy issue lookup"` | 完成本轮 feature/work commit，得到真实提交 `21ac02997d0468b4a6dcd5a2b81386fe0cf8fca4` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-84` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-85`：评估 `getOrganizations rejects` 标题是否也应与 `route getIssue rejects` 保持对称、补回 route 级语义词 |

### 203.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义，而 route 级 API 失败场景若继续同时保持 `getIssue rejects` / `getOrganizations rejects` 会与 helper 层级过于接近。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题从 `getIssue rejects` 补回为 `route getIssue rejects`，以最小 route 级语义词恢复层级辨识度，同时保持第二条 `getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-84` -> `done`，下一轮转入 `IMP-85`，继续评估 `getOrganizations rejects` 标题是否也应补回 route 级语义词。

### 203.3 经验沉淀

- 当 helper 级标题仍通过显式 helper seam wording 保留层级区分时，可以按 execution unit 先只补回第一条 route 级 API 失败标题中的最小 `route` 语义词，再观察是否仍需对第二条对称标题做同量级收口。
- 即使只是补回单个 route 级语义词，也要保持一次只改一条标题并完整跑定向 Vitest + TypeScript + diff cleanliness + review，确保共享断言与 helper/route 运行时 seam 没被误触。

### 203.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-84 → IMP-85` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `c5b11c948cc8c718c0f7d4cba8ae56624fb32125` |
| feature commit | `21ac02997d0468b4a6dcd5a2b81386fe0cf8fca4` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 202 — 2026-04-20：评估并去掉第二条 legacy route API 失败标题中的 route 前缀（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-83`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 第二条 API 失败场景当前 `route getOrganizations rejects` 标题在首条已收口为 `getIssue rejects` 后，是否也应对称去掉 `route` 前缀；若可行，则只改这一处安全标题并完成验证、review、提交、状态回写与 push 闭环。

### 202.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，Implementation lane 当前项为 `IMP-83`，且工作树干净，可支持新的单文件最小 execution unit |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('route getOrganizations rejects', async () => {` 收口为 `it('getOrganizations rejects', async () => {`；不改第一条 route 级标题，也不改共享断言、fixture 设置或 helper/route 运行时逻辑 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: trim second route wording for legacy issue lookup again"` | 完成本轮 feature/work commit，得到真实提交 `47feed88cbee06b06051dd9f3e91be8af98b6d4a` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-83` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-84`：评估两条 API 失败场景测试标题在均去掉 `route` 前缀后是否仍需补回 route 级语义词 |

### 202.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义；在 describe 已限定 legacy `/issues/[id]` route 上下文下，第二条 route 级 API 失败场景 `route getOrganizations rejects` 应与已收口为 `getIssue rejects` 的第一条 route 级失败标题保持对称，也去掉 `route` 前缀。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题从 `route getOrganizations rejects` 收口为 `getOrganizations rejects`，同时保持第一条 `getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-83` -> `done`，下一轮转入 `IMP-84`，继续评估两条 API 失败场景测试标题在都去掉 `route` 前缀后是否仍需补回 route 级语义词。

### 202.3 经验沉淀

- 当 helper 级标题仍通过显式 helper seam wording 保留层级区分，而 route 级第一条 API 失败标题已确认可安全去掉 `route` 前缀时，下一轮可以仅对第二条对称标题做同量级收口，保持 execution unit 仍然是单标题文案改动。
- 即使只是再次删掉单个前缀词，也要重跑定向 Vitest + TypeScript + diff cleanliness，并在 review 中明确共享断言与 helper/route 运行时逻辑未被误触。

### 202.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-83 → IMP-84` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `76090df7031e5daa5f05ff1bf87b194c50f82ec6` |
| feature commit | `47feed88cbee06b06051dd9f3e91be8af98b6d4a` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 201 — 2026-04-20：评估并去掉第一条 legacy route API 失败标题中的 route 前缀（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-82`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前均为 `route getIssue rejects` / `route getOrganizations rejects` 后，是否仍需继续保留对称的 `route` 前缀维持与 helper 级标题的层级区分；若可行，则只改第一处安全标题并完成验证、review、提交、状态回写与 push 闭环。

### 201.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，Implementation lane 当前项为 `IMP-82`，且工作树干净，可支持新的单文件最小 execution unit |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('route getIssue rejects', async () => {` 收口为 `it('getIssue rejects', async () => {`；不改第二条 route 级标题，也不改共享断言、fixture 设置或 helper/route 运行时逻辑 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: trim route wording for legacy issue lookup again"` | 完成本轮 feature/work commit，得到真实提交 `76090df7031e5daa5f05ff1bf87b194c50f82ec6` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-82` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-83`：评估第二条 `route getOrganizations rejects` 标题是否也应去掉 `route` 前缀 |

### 201.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义；在 describe 已限定 legacy `/issues/[id]` route 上下文下，两条 route 级 API 失败场景若继续保持 `route getIssue rejects` / `route getOrganizations rejects` 会造成多余的对称前缀。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题从 `route getIssue rejects` 收口为 `getIssue rejects`，以最小改动验证去掉第一处对称前缀后层级辨识度仍可保持，同时保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-82` -> `done`，下一轮转入 `IMP-83`，继续评估第二条 `route getOrganizations rejects` 标题是否也应去掉 `route` 前缀。

### 201.3 经验沉淀

- 当 helper 级标题仍通过显式 helper seam wording 保留层级区分时，可以按 execution unit 先只去掉第一条 route 级 API 失败标题中的对称 `route` 前缀，再观察是否仍需对第二条对称标题做相同收口。
- 即使只是去掉单个 route 级前缀，也要保持一次只改一条标题并完整跑定向 Vitest + TypeScript + diff cleanliness + review，确保共享断言与 seam 没被误触。

### 201.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-82 → IMP-83` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `d8394548a514d9a64e49377cacca18edb291161c` |
| feature commit | `76090df7031e5daa5f05ff1bf87b194c50f82ec6` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 200 — 2026-04-20：评估并补回第二条 legacy route API 失败标题中的 route 级语义词（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-81`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route `getOrganizations()` API 失败场景当前 `getOrganizations rejects` 标题是否应与上一轮已补回 route 级语义词的 `route getIssue rejects` 保持对称，也补成一条最小 route 级语义词标题；若可行，则只改这一处安全标题并完成验证、review、提交、状态回写与 push 闭环。

### 200.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，Implementation lane 当前项为 `IMP-81`，且工作树干净，可支持新的单文件最小 execution unit |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('getOrganizations rejects', async () => {` 补回为 `it('route getOrganizations rejects', async () => {`；不改第一条 route 级标题，也不改共享断言、fixture 设置或 helper/route 运行时逻辑 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: restore second route wording for legacy issue lookup again"` | 完成本轮 feature/work commit，得到真实提交 `ce2291139333e292d808606e1b03029612f265a6` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-81` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-82`：评估两条 API 失败场景测试标题在均补回 route 级语义词后是否仍需保留对称前缀 |

### 200.2 本轮落地结果

- 已确认 `getOrganizations()` API 失败场景与上一轮已补回 route 级语义词的 `route getIssue rejects` 一样，仍属于 legacy `/issues/[id]` route 渲染层测试标题。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题从 `getOrganizations rejects` 补回为 `route getOrganizations rejects`，以恢复两条 route 级 API 失败场景的最小对称层级区分，同时保持第一条 `route getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-81` -> `done`，下一轮转入 `IMP-82`，继续评估两条 API 失败场景测试标题在都补回 route 级语义词后是否仍需保留对称前缀。

### 200.3 经验沉淀

- 当第一条 route 级 API 失败标题已恢复最小 `route` 前缀后，若第二条对称标题仍保持无前缀状态，会破坏 route 层与 helper 层之间的最小成对辨识度；此时可按 execution unit 只恢复第二条标题的同量级 `route` 前缀。
- 即使只是补回单个 route 级词，也要重跑定向 Vitest + TypeScript + diff cleanliness，并在 review 中明确共享断言与 helper/route 运行时逻辑未被误触。

### 200.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-81 → IMP-82` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `150a5d0fac65f31f06cde645a7cd85693d8e154c` |
| feature commit | `ce2291139333e292d808606e1b03029612f265a6` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 199 — 2026-04-20：评估并补回第一条 legacy route API 失败标题中的 route 级语义词（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-80`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前均已收口为 `getIssue rejects` / `getOrganizations rejects` 后，是否仍需补回某个 route 级语义词来维持与 helper 级 lookup 标题的层级区分；若可行，则只改第一处安全标题并完成验证、review、提交、状态回写与 push 闭环。

### 199.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，Implementation lane 当前项为 `IMP-80`，且工作树干净，可支持新的单文件最小 execution unit |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('getIssue rejects', async () => {` 补回为 `it('route getIssue rejects', async () => {`；不改第二条 route 级标题，也不改共享断言、fixture 设置或 helper/route 运行时逻辑 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: restore route wording for legacy issue lookup again"` | 完成本轮 feature/work commit，得到真实提交 `d76147b0a84ea88ce02bf85e2a570d9510e5e20f` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-80` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-81`：评估第二条 `getOrganizations()` API 失败场景测试标题是否也应补回 route 级语义词 |

### 199.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义，而 route 级 API 失败场景若继续同时保持 `getIssue rejects` / `getOrganizations rejects` 会与 helper 层级过于接近。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题从 `getIssue rejects` 补回为 `route getIssue rejects`，以最小 route 级语义词恢复层级辨识度，同时保持第二条 `getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-80` -> `done`，下一轮转入 `IMP-81`，继续评估第二条 `getOrganizations()` API 失败场景测试标题是否也应补回 route 级语义词。

### 199.3 经验沉淀

- 当 helper 级标题仍保留显式 helper seam wording，而 route 级两条 API 失败场景同时失去 route 级语义词时，可以按 execution unit 只恢复第一条标题的最小 `route` 前缀，重新验证层级辨识度是否足够。
- 即使只是补回单个 route 级词，也要保持一次只改一条标题并完整跑定向 Vitest + TypeScript + diff cleanliness + review，确保共享断言与 seam 没被误触。

### 199.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-80 → IMP-81` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `7e2246d9d24d6304554dcaa2562a5f736d2da674` |
| feature commit | `d76147b0a84ea88ce02bf85e2a570d9510e5e20f` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 198 — 2026-04-20：评估并去掉第二条 legacy route API 失败标题中的 route 前缀（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-79`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 第二条 API 失败场景当前 `route getOrganizations rejects` 标题在首条已收口为 `getIssue rejects` 后，是否也应对称去掉 `route` 前缀；若可行，则只改这一处安全标题并完成验证、review、提交、状态回写与 push 闭环。

### 198.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，Implementation lane 当前项为 `IMP-79`，且工作树干净，可支持新的单文件最小 execution unit |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('route getOrganizations rejects', async () => {` 收口为 `it('getOrganizations rejects', async () => {`；不改第一条 route 级标题，也不改共享断言、fixture 设置或 helper/route 运行时逻辑 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: trim second route wording for legacy issue lookup again"` | 完成本轮 feature/work commit，得到真实提交 `7e2246d9d24d6304554dcaa2562a5f736d2da674` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-79` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-80`：评估两条 API 失败场景测试标题在均去掉 `route` 前缀后是否仍需补回 route 级语义词 |

### 198.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义；在 describe 已限定 legacy `/issues/[id]` route 上下文下，第二条 route 级 API 失败场景 `route getOrganizations rejects` 应与已收口为 `getIssue rejects` 的第一条 route 级失败标题保持对称，也去掉 `route` 前缀。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题从 `route getOrganizations rejects` 收口为 `getOrganizations rejects`，同时保持第一条 `getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-79` -> `done`，下一轮转入 `IMP-80`，继续评估两条 API 失败场景测试标题在都去掉 `route` 前缀后是否仍需补回 route 级语义词。

### 198.3 经验沉淀

- 当 helper 级 lookup 标题仍保留显式 helper seam wording，而 route 级第一条 API 失败标题已确认可安全去掉 `route` 前缀时，下一轮可以仅对第二条对称标题做同量级收口，保持 execution unit 仍然是单标题文案改动。
- 即使只是再次删掉单个前缀词，也要重跑定向 Vitest + TypeScript + diff cleanliness，并在 review 中明确共享断言与 helper/route 运行时逻辑未被误触。

### 198.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-79 → IMP-80` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `380879acd61dac35e059dfcc15b11105293cc07c` |
| feature commit | `7e2246d9d24d6304554dcaa2562a5f736d2da674` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 197 — 2026-04-20：评估并去掉第一条 legacy route API 失败标题中的 route 前缀（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-78`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前均为 `route getIssue rejects` / `route getOrganizations rejects` 后，是否仍需继续保留对称的 `route` 前缀；若可行，则只改第一处安全标题并完成验证、review、提交、状态回写与 push 闭环。

### 197.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，Implementation lane 当前项为 `IMP-78`，且工作树干净，可支持新的单文件最小 execution unit |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('route getIssue rejects', async () => {` 收口为 `it('getIssue rejects', async () => {`；不改第二条 route 级标题，也不改共享断言、fixture 设置或 helper/route 运行时逻辑 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: trim route wording for legacy issue lookup again"` | 完成本轮 feature/work commit，得到真实提交 `ec8607291559228da427104c78c59c2599946d63` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-78` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-79`：评估第二条 `getOrganizations()` API 失败场景测试标题在首条已去掉 `route` 前缀后是否也应对称收口 |

### 197.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义；在 describe 已限定 legacy `/issues/[id]` route 上下文下，两条 route 级 API 失败场景若继续保持 `route getIssue rejects` / `route getOrganizations rejects` 会造成多余的对称前缀。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题从 `route getIssue rejects` 收口为 `getIssue rejects`，同时保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-78` -> `done`，下一轮转入 `IMP-79`，继续评估第二条 `getOrganizations()` API 失败场景测试标题是否也应对称去掉 `route` 前缀。

### 197.3 经验沉淀

- 当 helper 级 lookup 标题仍保留显式 helper seam wording，而 route 级 API 失败场景再次形成对称 `route` 前缀时，可按 execution unit 一次只去掉一条 route 级标题中的最小 `route` 前缀，重新验证是否仍保持足够层级辨识度。
- 即使只是再次收口单个前缀词，也要保持一次只改一条标题并完整跑定向 Vitest + TypeScript + diff cleanliness + review，确保共享断言与 seam 没被误触。

### 197.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-78 → IMP-79` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `e5a709aa48c3cc3193f5e02c10430ea861aa086d` |
| feature commit | `ec8607291559228da427104c78c59c2599946d63` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |


## Session 196 — 2026-04-20：评估并补回第二条 legacy route API 失败标题中的 route 级语义词（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-77`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 第二条 API 失败场景当前 `getOrganizations rejects` 标题是否应与上一轮已补回 route 级语义词的 `route getIssue rejects` 保持对称，也补成一条最小 route 级语义词标题；若可行，则只改这一处安全标题并完成验证、review、提交、状态回写与 push 闭环。

### 196.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，Implementation lane 当前项为 `IMP-77`，且工作树干净，可支持新的单文件最小 execution unit |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('getOrganizations rejects', async () => {` 补回为 `it('route getOrganizations rejects', async () => {`；不改第一条 route 级标题，也不改共享断言、fixture 设置或 helper/route 运行时逻辑 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: restore second route wording for legacy issue lookup again"` | 完成本轮 feature/work commit，得到真实提交 `05bdffc0db76e1299d628f2063109f83f543fe58` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-77` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-78`：评估两条 API 失败场景测试标题在均补回 route 级语义词后是否仍需保留对称前缀 |

### 196.2 本轮落地结果

- 已确认 `getOrganizations()` API 失败场景与上一轮已补回 route 级语义词的 `route getIssue rejects` 一样，仍属于 legacy `/issues/[id]` route 渲染层测试标题；若继续保持 `getOrganizations rejects`，会破坏两条 route 级 API 失败场景对 helper 级标题的最小对称层级区分。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题从 `getOrganizations rejects` 补回为 `route getOrganizations rejects`，同时保持第一条 `route getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-77` -> `done`，下一轮转入 `IMP-78`，继续评估两条 API 失败场景测试标题在均补回 route 级语义词后是否仍需继续保留对称前缀。

### 196.3 经验沉淀

- 当 route 级同组标题已通过前一轮确认需要补回最小 route 语义词时，下一轮可以只对第二条对称标题做同量级收口，保持 execution unit 仍然是单标题文案改动。
- 即使只是恢复对称 wording，也要重跑定向 Vitest + TypeScript + diff cleanliness，并在 review 中明确共享断言与 helper/route 运行时逻辑未被误触。

### 196.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-77 → IMP-78` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `f814b2e10c6fe1a4d2c94af939d6dff15717332a` |
| feature commit | `05bdffc0db76e1299d628f2063109f83f543fe58` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |


## Session 195 — 2026-04-20：评估并补回第一条 legacy route API 失败标题中的 route 级语义词（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-76`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前均已收口为 `getIssue rejects` / `getOrganizations rejects` 后，是否仍需补回最小 route 级语义词以维持与 helper 级 lookup 标题的层级区分；若可行，则只改第一处安全标题并完成验证、review、提交、状态回写与 push 闭环。

### 195.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，Implementation lane 当前项为 `IMP-76`，且工作树干净，可支持新的单文件最小 execution unit |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('getIssue rejects', async () => {` 补回为 `it('route getIssue rejects', async () => {`；不改第二条 route 级标题，也不改共享断言、fixture 设置或 helper/route 运行时逻辑 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: restore route wording for legacy issue lookup"` | 完成本轮 feature/work commit，得到真实提交 `f814b2e10c6fe1a4d2c94af939d6dff15717332a` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-76` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-77`：评估第二条 `getOrganizations()` API 失败场景测试标题是否也应补回 route 级语义词 |

### 195.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义，而 route 级两条 API 失败场景若继续同时保持 `getIssue rejects` / `getOrganizations rejects`，会与 helper 层级过于接近。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题从 `getIssue rejects` 补回为 `route getIssue rejects`，以最小 route 级语义词恢复层级辨识度，同时保持第二条 `getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-76` -> `done`，下一轮转入 `IMP-77`，继续评估第二条 `getOrganizations()` API 失败场景测试标题是否也应补回 route 级语义词。

### 195.3 经验沉淀

- 当 helper 级标题仍保留显式 helper seam wording，而 route 级两条 API 失败场景同时失去 route 级语义词时，可以按 execution unit 只恢复第一条标题的最小 `route` 前缀，重新验证层级辨识度是否足够。
- 即使只是补回单个 route 级词，也要保持一次只改一条标题并完整跑定向 Vitest + TypeScript + diff cleanliness + review，确保共享断言与 seam 没被误触。

### 195.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-76 → IMP-77` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `8fa806405cfe865e0635dacb5b4cbcb45c30a394` |
| feature commit | `f814b2e10c6fe1a4d2c94af939d6dff15717332a` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |


## Session 194 — 2026-04-20：评估并去掉第二条 legacy route API 失败标题中的 route 前缀（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-75`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 第二条 API 失败场景当前 `route getOrganizations rejects` 标题在首条已收口为 `getIssue rejects` 后，是否也应对称去掉 `route` 前缀；若可行，则只改这一处安全标题并完成验证、review、提交、状态回写与 push 闭环。

### 194.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，Implementation lane 当前项为 `IMP-75`，且工作树可支持新的单文件最小 execution unit |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('route getOrganizations rejects', async () => {` 收口为 `it('getOrganizations rejects', async () => {`；不改第一条 route 级标题，也不改共享断言、fixture 设置或 helper/route 运行时逻辑 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: trim second route prefix from legacy issue lookup again"` | 完成本轮 feature/work commit，得到真实提交 `ec805642b9b119670ce86e5664223890e94131bf` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-75` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-76`：评估两条 API 失败场景标题在均去掉 `route` 前缀后是否仍需补回 route 级语义词 |

### 194.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义；在 describe 已限定 legacy `/issues/[id]` route 上下文下，第二条 route 级 API 失败场景 `route getOrganizations rejects` 应与已收口为 `getIssue rejects` 的第一条 route 级失败标题保持对称，也去掉 `route` 前缀。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题从 `route getOrganizations rejects` 收口为 `getOrganizations rejects`，同时保持第一条 `getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-75` -> `done`，下一轮转入 `IMP-76`，继续评估两条 API 失败场景标题在都去掉 `route` 前缀后是否仍需重新补回 route 级语义词。

### 194.3 经验沉淀

- 当 helper 级 lookup 标题仍保留显式 helper seam wording，而 route 级第一条 API 失败标题已确认可安全去掉 `route` 前缀时，下一轮可以仅对第二条对称标题做同量级收口，保持 execution unit 仍然是单标题文案改动。
- 即使只是再次删掉单个前缀词，也要重跑定向 Vitest + TypeScript + diff cleanliness，并在 review 中明确共享断言与 helper/route 运行时逻辑未被误触。

### 194.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-75 → IMP-76` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `c4f6c02d8c5b14970ed254f702ff6d0e19c050b3` |
| feature commit | `ec805642b9b119670ce86e5664223890e94131bf` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |


## Session 193 — 2026-04-20：评估并去掉第一条 legacy route API 失败标题中的 route 前缀（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-74`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前均为 `route getIssue rejects` / `route getOrganizations rejects` 后，是否仍需继续保留对称的 `route` 前缀；若可行，则只改第一处安全标题并完成验证、review、提交、状态回写与 push 闭环。

### 193.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，Implementation lane 当前项为 `IMP-74`，且工作树可支持新的单文件最小 execution unit |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('route getIssue rejects', async () => {` 收口为 `it('getIssue rejects', async () => {`；不改第二条 route 级标题，也不改共享断言、fixture 设置或 helper/route 运行时逻辑 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: trim route prefix from legacy issue lookup again"` | 完成本轮 feature/work commit，得到真实提交 `c71043caef1bc4f8136dbf2cc4c2645ca36e7a24` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-74` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-75`：评估第二条 `getOrganizations()` API 失败场景测试标题是否也应对称去掉 `route` 前缀 |

### 193.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义；在 describe 已限定 legacy `/issues/[id]` route 上下文下，两条 route 级 API 失败场景若继续保持 `route getIssue rejects` / `route getOrganizations rejects` 会造成多余的对称前缀。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题从 `route getIssue rejects` 收口为 `getIssue rejects`，同时保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-74` -> `done`，下一轮转入 `IMP-75`，继续评估第二条 `getOrganizations()` API 失败场景测试标题是否也应对称去掉 `route` 前缀。

### 193.3 经验沉淀

- 当 helper 级 lookup 标题仍保留显式 helper seam wording，而 route 级 API 失败场景再次形成对称 `route` 前缀时，可按 execution unit 一次只去掉一条 route 级标题中的最小 `route` 前缀，重新验证是否仍保持足够层级辨识度。
- 即使只是再次收口单个前缀词，也要保持一次只改一条标题并完整跑定向 Vitest + TypeScript + diff cleanliness + review，确保共享断言与 seam 没被误触。

### 193.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-74 → IMP-75` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `c60e5278f687edb3301ebc3a81c2486c37392c02` |
| feature commit | `c71043caef1bc4f8136dbf2cc4c2645ca36e7a24` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |


## Session 192 — 2026-04-20：评估并补回第二条 legacy route API 失败标题中的 route 级语义词

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-73`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 第二条 API 失败场景 `getOrganizations rejects` 是否也应与上一轮的 `route getIssue rejects` 保持最小 route 级语义词对称；若可行，则只改这一处安全标题并完成验证、review、提交、状态回写与 push 闭环。

### 192.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，Implementation lane 当前项为 `IMP-73`，且工作树可支持新的单文件最小 execution unit |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('getOrganizations rejects', async () => {` 补回为 `it('route getOrganizations rejects', async () => {`；不改第一条 route 级标题，也不改共享断言、fixture 设置或 helper/route 运行时逻辑 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: restore second route wording for legacy issue lookup"` | 完成本轮 feature/work commit，得到真实提交 `2a5e85a0e2bda8bb0094a35a24514db92a33fb66` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-73` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-74`：评估两条 route 级 API 失败场景在均补回 `route` 语义词后是否仍需继续保留对称前缀 |

### 192.2 本轮落地结果

- 已复核 `getOrganizations()` API 失败场景与上一轮已补回 route 级语义词的 `route getIssue rejects` 一样，仍属于 legacy `/issues/[id]` route 渲染层测试标题。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题从 `getOrganizations rejects` 补回为 `route getOrganizations rejects`，以维持两条 route 级 API 失败场景相对于 helper 标题的最小对称层级区分，同时保持第一条 `route getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-73` -> `done`，下一轮转入 `IMP-74`，继续评估两条 route 级 API 失败场景在均补回 route 级语义词后是否仍需保留对称前缀。

### 192.3 经验沉淀

- 当 route 级同组标题已通过前一轮确认需要补回最小 route 语义词时，下一轮可以只对第二条对称标题做同量级收口，保持 execution unit 仍然是单标题文案改动。
- 即使只是恢复对称 wording，也要重跑定向 Vitest + TypeScript + diff cleanliness，并在 review 中明确共享断言与 helper/route 运行时逻辑未被误触。

### 192.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-73 → IMP-74` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `7ec8c7b9b1c5fc713680d9a6f5e92a79e2da02fb` |
| feature commit | `2a5e85a0e2bda8bb0094a35a24514db92a33fb66` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |


## Session 191 — 2026-04-20：评估并补回第一条 legacy route API 失败标题中的 route 级语义词

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-72`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景在均收口为 `getIssue rejects` / `getOrganizations rejects` 后，是否仍需补回某个 route 级语义词以维持与 helper 级 lookup 标题的层级区分；若可行，则只改第一处安全标题并完成验证、review、提交、状态回写与 push 闭环。

### 191.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，Implementation lane 当前项为 `IMP-72`，且工作树可支持新的单文件最小 execution unit |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('getIssue rejects', async () => {` 补回为 `it('route getIssue rejects', async () => {`；不改第二条 route 级标题，也不改共享断言、fixture 设置或 helper/route 运行时逻辑 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: restore route wording for legacy issue lookup"` | 完成本轮 feature/work commit，得到真实提交 `428647c0cf562ef0773cd3dd895e100fca3228f6` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-72` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-73`：评估 `getOrganizations()` API 失败场景测试标题是否也应补回 route 级语义词 |

### 191.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义，而 route 级 API 失败场景若继续保持 `getIssue rejects` / `getOrganizations rejects` 会与 helper 层级过于接近。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题从 `getIssue rejects` 补回为 `route getIssue rejects`，以最小 route 级语义词恢复层级辨识度，同时保持第二条 `getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-72` -> `done`，下一轮转入 `IMP-73`，继续评估第二条 `getOrganizations()` API 失败场景标题是否也应补回对称的 route 级语义词。

### 191.3 经验沉淀

- 当 helper 级 lookup 标题仍保留显式 helper seam wording，而 route 级 API 失败场景标题被收口得过于接近 helper 表达时，可按 execution unit 一次只补回一条 route 级最小语义词（如 `route`），恢复层级辨识度而不扩大到共享 helper 或断言层改动。
- 即使只是补回单个 route 级词，也要保持一次只改一条标题并完整跑定向 Vitest + TypeScript + diff cleanliness + review，确保共享断言与 seam 没被误触。

### 191.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-72 → IMP-73` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `45386be7b00e7f3361f3645e0ef5dc4f15c1f117` |
| feature commit | `428647c0cf562ef0773cd3dd895e100fca3228f6` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 190 — 2026-04-20：评估并去掉第二条 legacy route API 失败标题中的 route 前缀

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-71`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 第二条 API 失败场景当前 `route getOrganizations rejects` 标题中的 `route` 前缀是否也可像上一轮 `getIssue rejects` 一样安全去掉；若可行，则只改这一处安全标题并完成验证、review、提交、状态回写与 push 闭环。

### 190.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，Implementation lane 当前项为 `IMP-71`，且工作树可支持新的单文件最小 execution unit |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('route getOrganizations rejects', async () => {` 收口为 `it('getOrganizations rejects', async () => {`；不改第一条 route 级标题，也不改共享断言、fixture 设置或 helper/route 运行时逻辑 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
## Session 211 — 2026-04-20：评估并去掉第二条 legacy route API 失败标题中的 route 前缀

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-91`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 第二条 API 失败场景当前 `route getOrganizations rejects` 标题在首条已收口为 `getIssue rejects` 后，是否也应对称去掉 `route` 前缀；若可行，则只改这一处安全标题并完成验证、review、提交、状态回写与 push 闭环。

### 211.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，Implementation lane 当前项为 `IMP-91`，且工作树干净，可支持新的单文件最小 execution unit |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('route getOrganizations rejects', async () => {` 收口为 `it('getOrganizations rejects', async () => {`；不改第一条 route 级标题，也不改共享断言、fixture 设置或 helper/route 运行时逻辑 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: trim second route wording for legacy issue reject title"` | 完成本轮 feature/work commit，得到真实提交 `f3c6310f14197cf9f62e31ec823b1e7f57088215` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-91` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-92`：评估两条 API 失败场景测试标题在均去掉 `route` 前缀后是否仍需补回 route 级语义词 |

### 211.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义；在 describe 已限定 legacy `/issues/[id]` route 上下文下，第二条 route 级 API 失败场景 `route getOrganizations rejects` 应与已收口为 `getIssue rejects` 的第一条 route 级失败标题保持对称，也去掉 `route` 前缀。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题从 `route getOrganizations rejects` 收口为 `getOrganizations rejects`，同时保持第一条 `getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-91` -> `done`，下一轮转入 `IMP-92`，继续评估两条 API 失败场景测试标题在均去掉 `route` 前缀后是否仍需补回 route 级语义词。

### 211.3 经验沉淀

- 当 helper 级标题仍通过显式 helper seam wording 保留层级区分，而 route 级第一条 API 失败标题已确认可安全去掉 `route` 前缀时，下一轮可以仅对第二条对称标题做同量级收口，保持 execution unit 仍然是单标题文案改动。
- 即使只是再次删掉单个前缀词，也要重跑定向 Vitest + TypeScript + diff cleanliness，并在 review 中明确共享断言与 helper/route 运行时逻辑未被误触。

### 211.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-91 → IMP-92` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `edbc941f0ca9c4011bd56f4f3cd5fda09bcc179c` |
| feature commit | `f3c6310f14197cf9f62e31ec823b1e7f57088215` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

