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
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: trim second route prefix from legacy issue lookup"` | 完成本轮 feature/work commit，得到真实提交 `45386be7b00e7f3361f3645e0ef5dc4f15c1f117` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-71` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-72`：评估两条 API 失败场景标题在均去掉 `route` 前缀后是否仍需保留 route 级语义词区分 helper 层级 |

### 190.2 本轮落地结果

- 已确认第二条 route 级 API 失败场景与上一轮 `getIssue rejects` 一样处于 describe 已限定的 legacy `/issues/[id]` route 上下文内，因此无需继续保留 `route` 前缀维持辨识度。
- 因此本轮仅将 `getOrganizations()` API 失败场景测试标题从 `route getOrganizations rejects` 收口为 `getOrganizations rejects`，同时保持共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-71` -> `done`，下一轮转入 `IMP-72`，继续评估两条 API 失败场景标题在都去掉 `route` 前缀后是否仍需保留更稳妥的 route 级语义词。

### 190.3 经验沉淀

- 当 describe 块已限定 legacy route 上下文、且 helper 级 lookup 标题仍保留显式 helper/lookup wording 时，可按 execution unit 一次只去掉一条 route 级标题中的最小 `route` 前缀，而不必扩大到共享 helper 或断言层改动。
- 即使只是删掉单个前缀词，也要保持一次只改一条标题并完整跑定向 Vitest + TypeScript + diff cleanliness + review，确保共享断言与 seam 没被误触。

### 190.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-71 → IMP-72` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `fffb7270300045e828502d82feb3c563d3ef80f6` |
| feature commit | `45386be7b00e7f3361f3645e0ef5dc4f15c1f117` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 189 — 2026-04-20：评估并去掉第一条 legacy route API 失败标题中的 route 前缀

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-70`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前均为 `route getIssue rejects` / `route getOrganizations rejects` 后，第一条标题中的 `route` 前缀是否仍需保留；若可行，则只改第一处安全标题并完成验证、review、提交、状态回写与 push 闭环。

### 189.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，Implementation lane 当前项为 `IMP-70`，且工作树可支持新的单文件最小 execution unit |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('route getIssue rejects', async () => {` 收口为 `it('getIssue rejects', async () => {`；不改第二条 route 级标题，也不改共享断言、fixture 设置或 helper/route 运行时逻辑 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: trim route prefix from legacy issue lookup"` | 完成本轮 feature/work commit，得到真实提交 `f01e104137f30340c80c5648184a0f8ac0a4d223` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-70` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-71`：评估 `getOrganizations()` API 失败场景测试标题是否也应去掉 `route` 前缀 |

### 189.2 本轮落地结果

- 已复核同组 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 等 wording 保留层级区分；在 describe 已限定 legacy `/issues/[id]` route 上下文下，第一条 route 级失败场景标题无需继续保留 `route` 前缀维持辨识度。
- 因此本轮仅将 `getIssue(...)` API 失败场景测试标题从 `route getIssue rejects` 收口为 `getIssue rejects`，同时保留第二条 `route getOrganizations rejects` 作为对照，并保持共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-70` -> `done`，下一轮转入 `IMP-71`，继续评估 `getOrganizations()` API 失败场景测试标题是否也应去掉 `route` 前缀。

### 189.3 经验沉淀

- 当 describe 块已限定 legacy route 上下文、且 helper 级 lookup 标题仍保留显式 helper/lookup wording 时，可按 execution unit 一次只去掉一条 route 级标题中的最小 `route` 前缀，而不必回滚其他更长 route 文案。
- 即使只是删掉单个前缀词，也要保持一次只改一条标题并完整跑定向 Vitest + TypeScript + diff cleanliness + review，确保共享断言与 seam 没被误触。

### 189.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-70 → IMP-71` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `355f5abe3989150cf42ab140900082c7c322f75b` |
| feature commit | `f01e104137f30340c80c5648184a0f8ac0a4d223` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 188 — 2026-04-20：为第二条 legacy route API 失败标题补回最小 route 级语义词

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-69`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route `getOrganizations()` API 失败场景当前 `getOrganizations rejects` 标题是否应与上一轮 `route getIssue rejects` 保持对称并补回最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态回写与 push 闭环。

### 188.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，Implementation lane 当前项为 `IMP-69`，且工作树在 feature commit 后只剩 docs/state 闭环残留，适合本轮继续收口 |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('getOrganizations rejects', async () => {` 收口为 `it('route getOrganizations rejects', async () => {`，以补回最小 route 级语义词；不改共享断言、fixture 设置或 helper/route 运行时逻辑 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: restore second route wording for legacy issue lookup"` | 完成本轮 feature/work commit，得到真实提交 `355f5abe3989150cf42ab140900082c7c322f75b` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-69` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-70`：评估两条 route 级 API 失败场景标题在均补回 `route` 后是否仍需保留该前缀 |

### 188.2 本轮落地结果

- 已确认 `getOrganizations()` API 失败场景与上一轮 `route getIssue rejects` 一样，属于 legacy `/issues/[id]` route 渲染层测试标题。
- 因此本轮仅将第二条 route 级失败场景测试标题补为 `route getOrganizations rejects`，以保持两条 route 级 API 失败场景的最小对称辨识度，同时保持共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-69` -> `done`，下一轮转入 `IMP-70`，继续评估两条 API 失败场景标题在都带有 `route` 前缀后是否仍需保留该前缀。

### 188.3 经验沉淀

- 当同一组 route 级失败场景标题已经通过前一轮验证保留最小 route 语义词是必要的，下一轮可仅为对称场景补齐相同最小词，不必扩大到共享 helper 或断言层改动。
- 即使只是单词级标题修订，也要保持一次只改一条标题并完整跑定向 Vitest + TypeScript + diff cleanliness + review，确保共享断言与 seam 没被误触。

### 188.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-69 → IMP-70` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `80f468f5759eaa028c46054063342eb6e4f7776a` |
| feature commit | `355f5abe3989150cf42ab140900082c7c322f75b` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 187 — 2026-04-20：为第一条 legacy route API 失败标题补回最小 route 级语义词

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-68`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前均为 `getIssue rejects` / `getOrganizations rejects` 后，是否仍需保留某个最小 route 级语义词来维持测试标题辨识度；若可行，则只改第一处安全标题并完成验证、review、提交、状态回写与 push 闭环。

### 187.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap | 确认仓库位于 `codex/unify-issue-model`，实现 lane 当前项为 `IMP-68`，roadmap 仍要求单任务闭环推进 |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('getIssue rejects', async () => {` 收口为 `it('route getIssue rejects', async () => {`，以补回最小 route 级语义词；不改共享断言、fixture 设置或 helper/route 运行时逻辑 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: restore route wording for legacy issue lookup"` | 完成本轮 feature/work commit，得到真实提交 `80f468f5759eaa028c46054063342eb6e4f7776a` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-68` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-69`：评估 `getOrganizations()` API 失败场景测试标题是否也应补回 route 级语义词 |

### 187.2 本轮落地结果

- 已复核 legacy `/issues/[id]` route 两条 API 失败场景当前均为 `getIssue rejects` / `getOrganizations rejects`；若完全去掉 route 级语义词，会与 helper 级 `returns the empty props contract when the helper workspace slug lookup misses` 这类标题层次更接近。
- 因此本轮仅将第一条 route 级失败场景测试标题补为 `route getIssue rejects`，以最小 route 级语义词恢复辨识度，同时保留第二条 `getOrganizations rejects` 作为对照，并保持共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-68` -> `done`，下一轮转入 `IMP-69`，继续评估 `getOrganizations()` API 失败场景测试标题是否也应补回 route 级语义词。

### 187.3 经验沉淀

- 当一组 route 级测试标题被逐轮删词到仅剩动作 + API 名称时，应回看同文件 helper 级标题是否开始在层级上靠拢；若是，可用最小 route 级语义词（如 `route`）恢复辨识度，而不必回滚到更长旧文案。
- 即使只是单词级标题修订，也要保持一次只改一条标题并完整跑定向 Vitest + TypeScript + diff cleanliness + review，确保共享断言与 seam 没被误触。

### 187.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-68 → IMP-69` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `478f862747fc9ca696d7f6106182b74e89f6a838` |
| feature commit | `80f468f5759eaa028c46054063342eb6e4f7776a` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 186 — 2026-04-20：评估并去掉第二条 legacy route API 失败标题中的 renders 动词

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-67`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route `getOrganizations()` API 失败场景当前 `renders getOrganizations rejects` 标题中的 `renders` 动词是否也可像上一轮 `getIssue(...)` 场景一样安全去掉；若可行，则只改这一处安全标题并完成验证、review、提交、状态回写与 push 闭环。

### 186.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap | 确认仓库位于 `codex/unify-issue-model`，实现 lane 当前项为 `IMP-67`，roadmap 仍要求单任务闭环推进 |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('renders getOrganizations rejects', async () => {` 收口为 `it('getOrganizations rejects', async () => {`，不改共享断言、fixture 设置或 helper/route 运行时逻辑 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: trim second renders wording"` | 完成本轮 feature/work commit，得到真实提交 `0df354657b693a04a77f09872354bb680f1a1a2e` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-67` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-68`：评估两条 API 失败场景测试标题在均去掉 `renders` 动词后是否仍需保留 route 级语义词 |

### 186.2 本轮落地结果

- 已确认 `getOrganizations()` API 失败场景与上一轮 `getIssue(...)` 对称场景一样，当前都属于 route 级渲染后断言 `IssueDetailPage` 收到空 props 的观察面；在同一 describe 已限定 legacy `/issues/[id]` route 上下文、且上一轮第一条标题 `getIssue rejects` 已证明去掉 `renders` 动词后标题仍保持可辨识的前提下，可继续安全去掉第二条标题中的 `renders` 动词。
- 因此本轮仅将 `getOrganizations()` 失败场景测试标题收口为 `getOrganizations rejects`，同时保持共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-67` -> `done`，下一轮转入 `IMP-68`，继续评估两条 API 失败场景测试标题在均去掉 `renders` 动词后是否仍需保留 route 级语义词。

### 186.3 经验沉淀

- 当上一轮已证明第一条对称 route 级失败测试标题去掉 `renders` 仍可辨识时，下一轮可以对第二条对称标题执行同样的最小删词闭环，但仍要保持一次只改一条标题的节奏。
- 即使只是测试标题微调，也要完整执行定向 Vitest + TypeScript + diff cleanliness + review，确保共享断言、fixture 与 route/helper seam 没被误改。

### 186.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-67 → IMP-68` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `e6aaec38e7fd3b4b7f0161ec226d583f38a97b2b` |
| feature commit | `0df354657b693a04a77f09872354bb680f1a1a2e` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 185 — 2026-04-20：评估并去掉第一条 legacy route API 失败标题中的 renders 动词

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-66`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前均为 `renders getIssue rejects` / `renders getOrganizations rejects` 后，标题中的 `renders` 动词是否仍存在可安全收口的一处；若可行，则只改第一处安全标题并完成验证、review、提交、状态回写与 push 闭环。

### 185.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap | 确认仓库位于 `codex/unify-issue-model`，实现 lane 当前项为 `IMP-66`，roadmap 仍要求单任务闭环推进 |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('renders getIssue rejects', async () => {` 收口为 `it('getIssue rejects', async () => {`，不改共享断言、fixture 设置或 helper/route 运行时逻辑 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: trim renders wording"` | 完成本轮 feature/work commit，得到真实提交 `f5a8328bfb838d2dbdf9c6b3d932858e694ba0e0` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-66` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-67`：评估 `getOrganizations()` API 失败场景测试标题是否也应去掉 `renders` 动词 |

### 185.2 本轮落地结果

- 已复核 legacy `/issues/[id]` route 两条 API 失败场景当前都属于 route 级渲染后断言 `IssueDetailPage` 收到空 props 的观察面；在同一 describe 已限定 legacy `/issues/[id]` route 上下文、且第二条对称标题 `renders getOrganizations rejects` 仍保留 `renders` 动词作为对照的前提下，可先安全验证去掉第一条标题中的 `renders` 动词。
- 因此本轮仅将 `getIssue(...)` 失败场景测试标题收口为 `getIssue rejects`，同时保持共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-66` -> `done`，下一轮转入 `IMP-67`，继续评估 `getOrganizations()` API 失败场景测试标题是否也应去掉 `renders` 动词。

### 185.3 经验沉淀

- 即便是 route 级渲染测试标题收口，也要保留同组对称测试中的至少一个对照标题，避免一次同时收口两条后失去可比较语义。
- 对纯标题微调仍执行定向 Vitest + TypeScript + diff cleanliness，可防止误触周边断言或引入格式噪音。

### 185.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-66 → IMP-67` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `8be0f790557d810a11111175d037f193050f4365` |
| feature commit | `f5a8328bfb838d2dbdf9c6b3d932858e694ba0e0` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |
| docs/state commit | `694b5147915f09ff8d86158f4faea14ce055ada9` |

## Session 184 — 2026-04-20：去掉第二条 legacy route API 失败标题中的 when wording

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-65`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route `getOrganizations()` API 失败场景当前 `renders when getOrganizations rejects` 标题中的 `when` wording 是否也可像上一轮 `getIssue(...)` 场景一样安全去掉；若可行，则只改这一处安全标题并完成验证、review、提交、状态回写与 push 闭环。

### 184.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、执行前 HEAD 为 `85ff76e69b456e15e0fa0c9fa182d171307adcca`，工作树为空，可直接按 `IMP-65` 进入新的最小 execution unit |
| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` / `frontend/src/lib/routes.test.tsx` | 恢复唯一状态源、lane 明细、roadmap 与日志/工时回写要求，并确认 `IMP-65` 仅允许评估 `getOrganizations()` 失败场景这一处标题是否可去掉 `when` wording |
| 配置 | `git config user.name/user.email` | 复核 git author 使用 `offic0600 <offic0600@163.com>` |
| 修改 | `frontend/src/lib/routes.test.tsx` | 将 `getOrganizations()` 失败场景测试标题从 `renders when getOrganizations rejects` 收口为 `renders getOrganizations rejects`，只移除第二条对称安全标题中的 `when` wording，同时保持共享断言、fixture 设置与 helper/route 运行时逻辑不变 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：routes seam 定向测试 5 files / 57 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: trim second when wording"` | 完成本轮 feature/work commit，得到真实提交 `8be0f790557d810a11111175d037f193050f4365` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-65` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-66`：评估两条 API 失败场景测试标题在均去掉 `when` wording 后是否仍需保留 `renders` 动词 |

### 184.2 本轮落地结果

- 已复核 legacy `/issues/[id]` route `getOrganizations()` API 失败场景当前属于 route 级渲染后断言 `IssueDetailPage` 收到空 props 的观察面；在同一 describe 已限定 legacy `/issues/[id]` route 上下文、且上一轮第一条对称标题 `renders getIssue rejects` 已证明去掉 `when` 连接词后标题仍保持可辨识的前提下，可继续安全去掉第二条标题中的 `when` 连接词。
- 因此本轮仅将 `getOrganizations()` 失败场景测试标题收口为 `renders getOrganizations rejects`，同时保持共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-65` -> `done`，下一轮转入 `IMP-66`，继续评估两条 API 失败场景测试标题在均去掉 `when` wording 后是否仍需保留 `renders` 动词。

### 184.3 经验沉淀

- 当同一 describe 已限定 legacy route 上下文，且上一轮对称标题已验证去掉 `when` 连接词后仍保持可辨识时，可以按 execution unit 一次只移除另一条对称标题中的同一连接词，继续最小幅度压缩测试文案而不改变断言边界。
- 对连续的对称文案收口任务，仍应保持“只改一个标题、只删一个词”的节奏；先让第二条对称标题完成闭环，再把是否继续去掉 `renders` 之类剩余动词留给下一轮单独验证。

### 184.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-65 → IMP-66` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `85ff76e69b456e15e0fa0c9fa182d171307adcca` |
| feature commit | `8be0f790557d810a11111175d037f193050f4365` |
| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 57 tests） |
| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
| Diff 检查 | `git diff --check` ✅ |

## Session 183 — 2026-04-20：去掉第一条 legacy route API 失败标题中的 when wording

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-64`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前 `renders when getIssue rejects` / `renders when getOrganizations rejects` 标题在均去掉 route 全称后是否仍需保留 `when` wording；若可行，则只改第一条安全标题并完成验证、review、提交、状态回写与 push 闭环。

### 183.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、执行前 HEAD 为 `0fb4c109bd7f4146ccc1fb9cfa7597a82a3e4ba3`，工作树为空，可直接按 `IMP-64` 进入新的最小 execution unit |
| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` / `frontend/src/lib/routes.test.tsx` | 恢复唯一状态源、lane 明细、roadmap 与日志/工时回写要求，并确认 `IMP-64` 仅允许评估 `when` wording 是否还需保留 |
| 配置 | `git config user.name/user.email` | 复核 git author 使用 `offic0600 <offic0600@163.com>` |
| 修改 | `frontend/src/lib/routes.test.tsx` | 将 `getIssue(...)` 失败场景测试标题从 `renders when getIssue rejects` 收口为 `renders getIssue rejects`，只移除第一处安全的 `when` wording，同时保持共享断言、fixture 设置与 helper/route 运行时逻辑不变 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：routes seam 定向测试 5 files / 57 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: trim first when wording"` | 完成本轮 feature/work commit，得到真实提交 `8b594cb09f1bec44666b5a1370831c2db3adb3b9` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-64` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-65`：评估 `getOrganizations()` API 失败场景测试标题是否也应去掉 `when` wording |

### 183.2 本轮落地结果

- 已复核 legacy `/issues/[id]` route 两条 API 失败场景当前都属于 route 级渲染后断言 `IssueDetailPage` 收到空 props 的观察面；在同一 describe 已限定 legacy `/issues/[id]` route 上下文、且对称第二条标题 `renders when getOrganizations rejects` 仍保留 `when` wording 作为对照的前提下，可先安全去掉第一条标题中的 `when` 连接词。
- 因此本轮仅将 `getIssue(...)` 失败场景测试标题收口为 `renders getIssue rejects`，同时保持共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-64` -> `done`，下一轮转入 `IMP-65`，继续评估 `getOrganizations()` API 失败场景标题中的 `when` wording 是否也可安全去掉。

### 183.3 经验沉淀

- 当同一 describe 已限定 legacy route 上下文，且一组对称 route 级失败场景只剩连接词差异时，可以按 execution unit 一次只移除第一处 `when` wording，先验证标题仍具可辨识性，再交给下一轮处理对称第二条标题。
- 对连续的文案收口任务，仍应保持“只改一个标题、只删一个词组”的节奏；即使变化极小，也要保留对称标题作为对照，以便确认本轮删词不会削弱场景语义。

### 183.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-64 → IMP-65` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `0fb4c109bd7f4146ccc1fb9cfa7597a82a3e4ba3` |
| feature commit | `8b594cb09f1bec44666b5a1370831c2db3adb3b9` |
| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 57 tests） |
| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
| Diff 检查 | `git diff --check` ✅ |

## Session 182 — 2026-04-20：去掉第二条 legacy route API 失败标题中的 route 全称

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-63`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route `getOrganizations()` API 失败场景当前 `renders when getOrganizations rejects in the legacy /issues/[id] route` 标题中的 `legacy /issues/[id] route` 全称是否也可像 `getIssue(...)` 场景一样安全去掉；若可行，则只改这一处安全标题并完成验证、review、提交、状态回写与 push 闭环。

### 182.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、执行前 HEAD 为 `f37fc4c6c4a6503eede92bdf74684e3db277445f`，工作树为空，可直接按 `IMP-63` 进入新的最小 execution unit |
| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` / `frontend/src/lib/routes.test.tsx` | 恢复唯一状态源、lane 明细、roadmap 与日志/工时回写要求，并确认 `IMP-63` 仅允许评估 `getOrganizations()` 失败场景这一处标题是否可去掉 route 全称 |
| 配置 | `git config user.name/user.email` | 复核 git author 使用 `offic0600 <offic0600@163.com>` |
| 修改 | `frontend/src/lib/routes.test.tsx` | 将 `getOrganizations()` 失败场景测试标题从 `renders when getOrganizations rejects in the legacy /issues/[id] route` 收口为 `renders when getOrganizations rejects`，以与上一轮 `getIssue(...)` 场景保持一致，同时保持共享断言、fixture 设置与 helper/route 运行时逻辑不变 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：routes seam 定向测试 5 files / 57 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: trim second route title suffix"` | 完成本轮 feature/work commit，得到真实提交 `103197daccf03c93a3d7d2f4f9499d3efabc2b70` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-63` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-64`：评估两条 API 失败场景标题在均去掉 route 全称后是否仍需保留 `when` wording |

### 182.2 本轮落地结果

- 已复核 legacy `/issues/[id]` route 中 `getOrganizations()` API 失败场景与上一轮 `getIssue(...)` 对称场景一样，当前都属于 route 级渲染后断言 `IssueDetailPage` 收到空 props 的观察面；在文件作用域 describe 已限定 legacy `/issues/[id]` route 上下文、且上一轮第一条标题 `renders when getIssue rejects` 已证明去掉 route 全称不会损失辨识度的前提下，该标题可继续安全收口。
- 因此本轮仅将 `getOrganizations()` 失败场景测试标题收口为 `renders when getOrganizations rejects`，同时保持共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-63` -> `done`，下一轮转入 `IMP-64`，继续评估两条 API 失败场景标题在均去掉 route 全称后是否仍需保留 `when` wording。

### 182.3 经验沉淀

- 当同一 describe 块已明确限定 legacy route 上下文，且上一轮对称标题已验证去掉完整路径后缀不会损失辨识度时，可以按 execution unit 一次只移除另一条对称标题中的完整路径后缀，继续最小幅度压缩测试文案而不改变断言边界。
- 即使两条 route 级 API 失败场景在语义上完全对称，也仍应保持“一次只动一处标题”的节奏；先让第二条 route 全称后缀完成收口，再单独判断 `when` 等剩余连接词是否还需继续收紧。

### 182.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-63 → IMP-64` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `f37fc4c6c4a6503eede92bdf74684e3db277445f` |
| feature commit | `103197daccf03c93a3d7d2f4f9499d3efabc2b70` |
| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 57 tests） |
| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
| Diff 检查 | `git diff --check` ✅ |


## 2026-04-20

- 08:31 CST Implementation: completed IMP-73 by renaming the second legacy `/issues/[id]` route API-failure test title from `getOrganizations rejects` to `route getOrganizations rejects`, preserving route-vs-helper seam wording symmetry with `route getIssue rejects`; verified with `cd frontend && pnpm test -- --run src/lib/routes.test.tsx`, `cd frontend && npx tsc --noEmit`, and `git diff --check`.
