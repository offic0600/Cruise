## Session 229 — 2026-04-20：评估并收口第二条 legacy route API 失败标题中的 route 级语义词（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-110`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `route getIssue rejects` / `route getOrganizations rejects` 后，第二条是否仍需保留最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 229.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，Implementation lane 当前项为 `IMP-110`，且工作树干净，可直接按本轮唯一 execution unit 推进 |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('route getOrganizations rejects', async () => {` 收口为 `it('getOrganizations rejects', async () => {`；保持第一条 `route getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过 |
| 提交 | `git commit -m "[verified] test: narrow second legacy route reject title again"` | 完成本轮 feature/work commit，得到真实提交 `e244633a49773ffbcd1f7be8f9032dc5984919bc` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-110` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-111`：评估在再次变为 `route getIssue rejects` / `getOrganizations rejects` 的非对称 route wording 后，第一条是否仍需保留 route 级语义词 |

### 229.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第一条已维持 `route getIssue rejects` 后，第二条 `route getOrganizations rejects` 已无须继续保留 route 级语义词来维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题收口为 `getOrganizations rejects`，同时保持第一条 `route getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-110` -> `done`，下一轮转入 `IMP-111`，继续评估第一条 route 级 API 失败场景标题在再次变为非对称 route wording 后是否仍需保留 route 级语义词。

### 229.3 经验沉淀

- 当第一条 route 级 API 失败标题已维持 `route getIssue rejects` 时，应单独复核第二条是否仍需 route 级语义词，而不要因对称性默认保留前缀。
- 纯测试标题收口仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 229.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-110 → IMP-111` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `d968a7a1caad269a80b8c9498a11548d4ab2a14a` |
| feature commit | `e244633a49773ffbcd1f7be8f9032dc5984919bc` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 228 — 2026-04-20：评估并补回第一条 legacy route API 失败标题中的 route 级语义词（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-109`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `getIssue rejects` / `route getOrganizations rejects` 的非对称 route wording 后，第一条是否需要恢复最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 228.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，Implementation lane 当前项为 `IMP-109`，且工作树干净，可直接按本轮唯一 execution unit 推进 |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('getIssue rejects', async () => {` 补回为 `it('route getIssue rejects', async () => {`；保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过 |
| 提交 | `git commit -m "[verified] test: restore first legacy route reject title again"` | 完成本轮 feature/work commit，得到真实提交 `f23c455b70b1c9dcbb624086fb250bed7dfb309e` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-109` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-110`：评估在再次均带 `route getIssue rejects` / `route getOrganizations rejects` 后，第二条是否仍需保留 route 级语义词 |

### 228.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第二条已维持 `route getOrganizations rejects` 后，第一条 `getIssue rejects` 仍需要恢复最小 route 级语义词来维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题补回为 `route getIssue rejects`，同时保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-109` -> `done`，下一轮转入 `IMP-110`，继续评估第二条 route 级 API 失败场景标题在再次均带 route wording 后是否仍需保留 route 级语义词。

### 228.3 经验沉淀

- 当第二条 route 级 API 失败标题已维持 `route getOrganizations rejects` 时，应单独复核第一条是否仍需最小 route 级语义词来维持与 helper seam wording 的层级区分，而不要默认第一条可以持续省略前缀。
- 纯测试标题补回仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 228.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-109 → IMP-110` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `4e2a5f450b4e73f2d65eeb422c73ab82f95a20e7` |
| feature commit | `f23c455b70b1c9dcbb624086fb250bed7dfb309e` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 227 — 2026-04-20：评估并补回第二条 legacy route API 失败标题中的 route 级语义词（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-108`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前再次同时收口为 `getIssue rejects` / `getOrganizations rejects` 后，第二条是否仍需恢复最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 227.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，Implementation lane 当前项为 `IMP-108`，且工作树干净，可直接按本轮唯一 execution unit 推进 |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('getOrganizations rejects', async () => {` 补回为 `it('route getOrganizations rejects', async () => {`；保持第一条 `getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过 |
| 提交 | `git commit -m "[verified] test: restore second legacy route reject title again"` | 完成本轮 feature/work commit，得到真实提交 `f6e08c2bfce40ba0b2fa71019e66c5b67871838a` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-108` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-109`：评估在再次变为 `getIssue rejects` / `route getOrganizations rejects` 的非对称 route wording 后，第一条是否需要恢复 route 级语义词 |

### 227.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第一条已维持 `getIssue rejects` 后，第二条 `getOrganizations rejects` 若继续不带 route 级语义词，会与 helper 级 lookup 标题层级过于接近。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题补回为 `route getOrganizations rejects`，同时保持第一条 `getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-108` -> `done`，下一轮转入 `IMP-109`，继续评估第一条 route 级 API 失败场景标题在再次变为非对称 route wording 后是否需要恢复最小 route 级语义词。

### 227.3 经验沉淀

- 当第一条 route 级 API 失败标题已维持 `getIssue rejects` 时，应单独复核第二条是否仍需恢复最小 route 级语义词来维持与 helper seam wording 的层级区分，而不要默认两条 route 标题可以持续同时省略前缀。
- 纯测试标题补回仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 227.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-108 → IMP-109` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `cb615fd83960cf58cb6cd72a6c715a71d528d72c` |
| feature commit | `f6e08c2bfce40ba0b2fa71019e66c5b67871838a` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 226 — 2026-04-20：评估并收口第一条 legacy route API 失败标题中的 route 级语义词（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-107`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `route getIssue rejects` / `getOrganizations rejects` 后，第一条是否仍需保留最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 226.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，Implementation lane 当前项为 `IMP-107`，且工作树干净，可直接按本轮唯一 execution unit 推进 |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('route getIssue rejects', async () => {` 收口为 `it('getIssue rejects', async () => {`；保持第二条 `getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过 |
| 提交 | `git commit -m "[verified] test: drop first legacy route reject title again"` | 完成本轮 feature/work commit，得到真实提交 `4464214b152c01ddef20398b01b6cdb7b05c90fc` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-107` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-108`：评估在再次同时收口为 `getIssue rejects` / `getOrganizations rejects` 后，第二条是否仍需恢复 route 级语义词 |

### 226.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第二条已维持 `getOrganizations rejects` 后，第一条 `route getIssue rejects` 同样无须继续保留最小 route 级语义词来维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题收口为 `getIssue rejects`，同时保持第二条 `getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-107` -> `done`，下一轮转入 `IMP-108`，继续评估第二条 route 级 API 失败场景标题在再次同时收口为无 route wording 后是否仍需恢复最小 route 级语义词。

### 226.3 经验沉淀

- 当第二条 route 级 API 失败标题已维持 `getOrganizations rejects` 时，应单独复核第一条是否仍需 route 级语义词，而不要因此前存在过 route 前缀就默认继续保留。
- 纯测试标题收口仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 226.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-107 → IMP-108` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `72bf3df36db60d3e29e485cbe0eac85967961426` |
| feature commit | `4464214b152c01ddef20398b01b6cdb7b05c90fc` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 225 — 2026-04-20：评估并收口第二条 legacy route API 失败标题中的 route 级语义词（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-106`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `route getIssue rejects` / `route getOrganizations rejects` 后，第二条是否仍需保留最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 225.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，Implementation lane 当前项为 `IMP-106`，且工作树干净，可直接按本轮唯一 execution unit 推进 |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('route getOrganizations rejects', async () => {` 收口为 `it('getOrganizations rejects', async () => {`；保持第一条 `route getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过 |
| 提交 | `git commit -m "[verified] test: narrow second legacy route reject title"` | 完成本轮 feature/work commit，得到真实提交 `72bf3df36db60d3e29e485cbe0eac85967961426` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-106` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-107`：评估在再次变为 `route getIssue rejects` / `getOrganizations rejects` 的非对称 route wording 后，第一条是否仍需保留 route 级语义词 |

### 225.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第一条已维持 `route getIssue rejects` 后，第二条 `route getOrganizations rejects` 已无须继续保留最小 route 级语义词来维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题收口为 `getOrganizations rejects`，同时保持第一条 `route getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-106` -> `done`，下一轮转入 `IMP-107`，继续评估第一条 route 级 API 失败场景标题在再次变为非对称 route wording 后是否仍需保留 route 级语义词。

### 225.3 经验沉淀

- 当第一条 route 级 API 失败标题已维持 `route getIssue rejects` 时，应单独复核第二条是否仍需 route 级语义词，而不要因对称性默认保留前缀。
- 纯测试标题收口仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 225.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-106 → IMP-107` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `9b27dfa4199e80e9c6965e1a7989373942fbfc00` |
| feature commit | `72bf3df36db60d3e29e485cbe0eac85967961426` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 224 — 2026-04-20：评估并补回第一条 legacy route API 失败标题中的 route 级语义词（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-105`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `getIssue rejects` / `route getOrganizations rejects` 的非对称 route wording 后，第一条是否需要恢复最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 224.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，Implementation lane 当前项为 `IMP-105`，且工作树仅包含本轮最小 execution unit 可安全收口的改动 |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('getIssue rejects', async () => {` 补回为 `it('route getIssue rejects', async () => {`；保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过 |
| 提交 | `git commit -m "[verified] test: restore first legacy route reject title"` | 完成本轮 feature/work commit，得到真实提交 `1bfd1f28f2405929020eaddc57761decae9925ed` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-105` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-106`：评估在再次均带 `route getIssue rejects` / `route getOrganizations rejects` 后，第二条是否仍需保留 route 级语义词 |

### 224.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第二条已维持 `route getOrganizations rejects` 后，第一条 `getIssue rejects` 仍需要恢复最小 route 级语义词来维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题补回为 `route getIssue rejects`，同时保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-105` -> `done`，下一轮转入 `IMP-106`，继续评估第二条 route 级 API 失败场景标题在再次均带 route wording 后是否仍需保留 route 级语义词。

### 224.3 经验沉淀

- 当第二条 route 级 API 失败标题已维持 `route getOrganizations rejects` 时，应单独复核第一条是否仍需最小 route 级语义词来维持与 helper seam wording 的层级区分，而不要默认第一条可以持续省略前缀。
- 纯测试标题补回仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 224.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-105 → IMP-106` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `d40a51676013578e4b4bd1ed35c59b8d4cf475cf` |
| feature commit | `1bfd1f28f2405929020eaddc57761decae9925ed` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 223 — 2026-04-20：评估并补回第二条 legacy route API 失败标题中的 route 级语义词（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-104`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前再次同时收口为 `getIssue rejects` / `getOrganizations rejects` 后，第二条是否仍需恢复最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 223.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，Implementation lane 当前项为 `IMP-104`，且工作树仅包含本轮最小 execution unit 可安全收口的改动 |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('getOrganizations rejects', async () => {` 补回为 `it('route getOrganizations rejects', async () => {`；保持第一条 `getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过 |
| 提交 | `git commit -m "[verified] test: restore second legacy route reject title"` | 完成本轮 feature/work commit，得到真实提交 `4046b1cda2fc7a8fdaa2f9319e510023b7ac4209` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-104` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-105`：评估在再次变为 `getIssue rejects` / `route getOrganizations rejects` 的非对称 route wording 后，第一条是否需要恢复最小 route 级语义词 |

### 223.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第一条已维持 `getIssue rejects` 后，第二条 `getOrganizations rejects` 若继续不带 route 级语义词，会与 helper 级 lookup 标题层级过于接近。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题补回为 `route getOrganizations rejects`，同时保持第一条 `getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-104` -> `done`，下一轮转入 `IMP-105`，继续评估第一条 route 级 API 失败场景标题在再次变为非对称 route wording 后是否需要恢复最小 route 级语义词。

### 223.3 经验沉淀

- 当第一条 route 级 API 失败标题已收口为 `getIssue rejects` 时，应单独复核第二条是否仍需最小 route 级语义词来维持与 helper seam wording 的层级区分，而不要默认两条 route 标题可以持续同时省略前缀。
- 纯测试标题补回仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 223.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-104 → IMP-105` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `8caf4d73c42edd34867699b0bf7d45d5a8a9a437` |
| feature commit | `4046b1cda2fc7a8fdaa2f9319e510023b7ac4209` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 222 — 2026-04-20：评估并去掉第一条 legacy route API 失败标题中的 route 级语义词（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-103`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `route getIssue rejects` / `getOrganizations rejects` 的非对称 route wording 后，第一条是否仍需保留最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 222.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，Implementation lane 当前项为 `IMP-103`，且工作树仅包含本轮最小 execution unit 可安全收口的改动 |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('route getIssue rejects', async () => {` 收口为 `it('getIssue rejects', async () => {`；保持第二条 `getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过 |
| 提交 | `git commit -m "[verified] test: drop route wording for first legacy issue reject title"` | 完成本轮 feature/work commit，得到真实提交 `17a4ef557f322aa6d760851c00f019e05b4b3331` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-103` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-104`：评估在再次同时收口为 `getIssue rejects` / `getOrganizations rejects` 后，第二条是否仍需恢复最小 route 级语义词 |

### 222.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第二条已维持 `getOrganizations rejects` 后，第一条 `route getIssue rejects` 同样无须继续保留 route 级语义词来维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题收口为 `getIssue rejects`，同时保持第二条 `getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-103` -> `done`，下一轮转入 `IMP-104`，继续评估第二条 route 级 API 失败场景标题在再次同时收口为无 route wording 后是否仍需恢复最小 route 级语义词。

### 222.3 经验沉淀

- 当第二条 route 级 API 失败标题已收口为 `getOrganizations rejects` 时，应单独复核第一条是否仍需最小 route 级语义词来维持与 helper seam wording 的层级区分，而不要默认第一条必须继续保留此前补回的前缀。
- 纯测试标题收口仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 222.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-103 → IMP-104` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `3ab341667a3c9ed6c51fe6d528b93ced13ba0127` |
| feature commit | `17a4ef557f322aa6d760851c00f019e05b4b3331` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 220 — 2026-04-20：评估并补回第一条 legacy route API 失败标题中的 route 级语义词（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-101`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前再次变为 `getIssue rejects` / `route getOrganizations rejects` 后，第一条是否仍需恢复最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 220.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，Implementation lane 当前项为 `IMP-101`，且工作树干净，可支持新的单文件最小 execution unit |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('getIssue rejects', async () => {` 补回为 `it('route getIssue rejects', async () => {`；不改第二条 `route getOrganizations rejects` 标题，也不改共享断言、fixture 设置或 helper/route 运行时逻辑 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过 |
| 提交 | `git commit -m "[verified] test: restore route wording for first legacy issue reject title"` | 完成本轮 feature/work commit，得到真实提交 `1cc3dc678bb593acfd9b79195bf5ce49efb664cc` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-101` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-102`：评估两条 route 级 API 失败场景在再次均带 route wording 后，第二条是否仍需保留 route 级语义词 |

### 220.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第二条已维持 `route getOrganizations rejects` 后，第一条 `getIssue rejects` 若继续不带 route 级语义词，会与 helper 级 lookup 标题层级过于接近。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题补回为 `route getIssue rejects`，同时保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-101` -> `done`，下一轮转入 `IMP-102`，继续评估第二条 route 级 API 失败场景标题在再次均带 route wording 后是否仍需保留 route 级语义词。

### 220.3 经验沉淀

- 当第二条 route 级 API 失败标题已维持 `route getOrganizations rejects` 时，应单独复核第一条是否仍需最小 route 级语义词来维持与 helper seam wording 的层级区分，而不要默认第一条可以持续省略前缀。
- 纯测试标题补回仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 220.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-101 → IMP-102` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `071a09bfa769123750534beec31d45c867ad7d1b` |
| feature commit | `1cc3dc678bb593acfd9b79195bf5ce49efb664cc` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 219 — 2026-04-20：评估并补回第二条 legacy route API 失败标题中的 route 级语义词（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-100`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前再次同时收口为 `getIssue rejects` / `getOrganizations rejects` 后，第二条是否仍需恢复最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 219.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，Implementation lane 当前项为 `IMP-100`，且工作树干净，可支持新的单文件最小 execution unit |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('getOrganizations rejects', async () => {` 补回为 `it('route getOrganizations rejects', async () => {`；不改第一条 `getIssue rejects` 标题，也不改共享断言、fixture 设置或 helper/route 运行时逻辑 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过 |
| 提交 | `git commit -m "[verified] test: restore route wording for second legacy issue reject title"` | 完成本轮 feature/work commit，得到真实提交 `071a09bfa769123750534beec31d45c867ad7d1b` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-100` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-101`：评估在再次变为 `getIssue rejects` / `route getOrganizations rejects` 的非对称 route wording 后，第一条是否需要恢复最小 route 级语义词 |

### 219.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第一条已维持 `getIssue rejects` 后，第二条 `getOrganizations rejects` 若继续不带 route 级语义词，会与 helper 级 lookup 标题层级过于接近。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题补回为 `route getOrganizations rejects`，同时保持第一条 `getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-100` -> `done`，下一轮转入 `IMP-101`，继续评估第一条 route 级 API 失败场景标题在再次变为非对称 route wording 后是否需要恢复最小 route 级语义词。

### 219.3 经验沉淀

- 当第一条 route 级 API 失败标题已收口为 `getIssue rejects` 时，应单独复核第二条是否仍需最小 route 级语义词来维持与 helper seam wording 的层级区分，而不要默认两条 route 标题可以持续同时省略前缀。
- 纯测试标题补回仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 219.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-100 → IMP-101` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `17618a0002a8cae696a8fb50c0b0481bbc69eb54` |
| feature commit | `071a09bfa769123750534beec31d45c867ad7d1b` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 218 — 2026-04-20：评估并去掉第一条 legacy route API 失败标题中的 route 前缀（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-99`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前再次变为 `route getIssue rejects` / `getOrganizations rejects` 后，第一条是否仍需保留 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态回写与 push 闭环。

### 218.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，Implementation lane 当前项为 `IMP-99`，且工作树干净，可支持新的单文件最小 execution unit |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('route getIssue rejects', async () => {` 收口为 `it('getIssue rejects', async () => {`；不改第二条 `getOrganizations rejects` 标题，也不改共享断言、fixture 设置或 helper/route 运行时逻辑 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: drop route wording from first legacy issue reject title"` | 完成本轮 feature/work commit，得到真实提交 17618a0002a8cae696a8fb50c0b0481bbc69eb54 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-99` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-100`：评估两条 route 级 API 失败场景在再次同时收口为无 route wording 后，第二条是否应恢复最小 route 级语义词 |

### 218.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第二条已收口为 `getOrganizations rejects` 后，第一条 route 级 API 失败场景 `route getIssue rejects` 同样无须继续保留 route 级语义词来维持层级区分。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题从 `route getIssue rejects` 收口为 `getIssue rejects`，同时保持第二条 `getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-99` -> `done`，下一轮转入 `IMP-100`，继续评估第二条 route 级 API 失败场景标题在再次同时收口为无 route wording 后是否需要恢复最小 route 级语义词。

### 218.3 经验沉淀

- 在 describe 已限定 route 作用域且 helper seam wording 仍清晰时，应继续把 route 级 API 失败标题中的冗余 `route` 前缀视作可移除候选，而不是因为上一轮只保留了一条前缀就默认第一条仍有额外辨识价值。
- 纯测试标题收口仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 218.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-99 → IMP-100` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `8bcc2481e30dc9c2c6b33cbf865aa0a2897461f1` |
| feature commit | 17618a0002a8cae696a8fb50c0b0481bbc69eb54 |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |


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

## Session 217 — 2026-04-20：评估并去掉第二条 legacy route API 失败标题中的 route 前缀（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-98`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前再次均已带 route 级语义词后，第二条 `route getOrganizations rejects` 是否仍需保留 route 对称前缀；若可行，则只改这一处安全标题并完成验证、review、提交、状态回写与 push 闭环。

### 217.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，Implementation lane 当前项为 `IMP-98`，且工作树仅包含 `frontend/src/lib/routes.test.tsx` 的本轮单文件变更，可支持新的最小 execution unit |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('route getOrganizations rejects', async () => {` 收口为 `it('getOrganizations rejects', async () => {`；不改第一条 `route getIssue rejects` 标题，也不改共享断言、fixture 设置或 helper/route 运行时逻辑 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
| 提交 | `git commit -am "[verified] test: drop route wording from second legacy issue reject title"` | 完成本轮 feature/work commit，得到真实提交 `8bcc2481e30dc9c2c6b33cbf865aa0a2897461f1` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-98` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-99`：评估在再次变为非对称 route wording 后，第一条 `route getIssue rejects` 是否仍需保留 route 级语义词 |

### 217.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文下，第二条 route 级 API 失败场景 `route getOrganizations rejects` 已无须继续保留 route 对称前缀来维持层级区分。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题从 `route getOrganizations rejects` 收口为 `getOrganizations rejects`，同时保持第一条 `route getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-98` -> `done`，下一轮转入 `IMP-99`，继续评估第一条 route 级 API 失败场景标题在 route wording 再次变为非对称后是否仍需保留 route 级语义词。

### 217.3 经验沉淀

- 即使两条 route 级 API 失败标题刚刚再次恢复为对称 `route` wording，也应重新结合 describe 作用域与 helper seam wording 判断第二条前缀是否仍有额外辨识价值，避免把“对称”误当成必须长期保留的语义负担。
- 纯测试标题收口同样应坚持一次只改一条、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 217.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-98 → IMP-99` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `1043c370989fbcb9a02f170a4d43ada867f441c4` |
| feature commit | `8bcc2481e30dc9c2c6b33cbf865aa0a2897461f1` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 216 — 2026-04-20：评估并补回第二条 legacy route API 失败标题中的 route 级语义词

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-97`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 第二条 API 失败场景当前 `getOrganizations rejects` 标题在第一条已补回为 `route getIssue rejects` 后，是否也应补回最小 route 级语义词以维持 route 层级对称；若可行，则只改这一处安全标题并完成验证、review、提交、状态回写与 push 闭环。

### 216.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，Implementation lane 当前项为 `IMP-97`，且工作树干净，可支持新的单文件最小 execution unit |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('getOrganizations rejects', async () => {` 调整为 `it('route getOrganizations rejects', async () => {`，恢复第二条 route 级 API 失败场景的最小 route 语义词；不改第一条 API 失败标题，也不改共享断言、fixture 设置或 helper/route 运行时逻辑 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` + 独立 reviewer | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过 |
| 提交 | `git commit -m "[verified] test: restore route wording to second legacy issue reject title"` | 完成本轮 feature/work commit，得到真实提交 `374f735011d73eefe374e1ca6ece86e93c2f26da` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-97` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-98`：评估两条 route 级 API 失败场景在再次均带 route 级语义词后，第二条是否仍需保留对称前缀 |

### 216.2 本轮落地结果

- 已复核在第一条 route 级 API 失败场景已恢复为 `route getIssue rejects` 后，第二条若继续保留 `getOrganizations rejects` 会破坏两条 route 级 API 失败标题的最小对称层级区分。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题从 `getOrganizations rejects` 补回为 `route getOrganizations rejects`，同时保持第一条 `route getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-97` -> `done`，下一轮转入 `IMP-98`，继续评估第二条 route 级 API 失败场景标题在再次恢复 route 对称前缀后是否仍需保留该前缀。

### 216.3 经验沉淀

- 当第一条 route 级 API 失败标题已恢复为 `route getIssue rejects` 时，应复核第二条是否也需要补回 route 级语义，以避免 route 级标题层级重新失衡。
- 纯测试标题回摆同样应坚持一次只改一条、安全验证、独立 review、状态写回的最小 execution unit 节奏。

### 216.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-97 → IMP-98` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `cddbf11246d13e2bc2ac5403c2281c7c0b7fa5fb` |
| feature commit | `374f735011d73eefe374e1ca6ece86e93c2f26da` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 215 — 2026-04-20：评估并补回第一条 legacy route API 失败标题中的 route 级语义词

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-96`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前均已收口为 `getIssue rejects` / `getOrganizations rejects` 后，是否需要重新补回某个 route 级语义词来维持与 helper 级 lookup 标题的层级区分；若可行，则只改第一处安全标题并完成验证、review、提交、状态回写与 push 闭环。

### 215.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，Implementation lane 当前项为 `IMP-96`，且工作树干净，可支持新的单文件最小 execution unit |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('getIssue rejects', async () => {` 调整为 `it('route getIssue rejects', async () => {`，恢复第一条 route 级 API 失败场景的最小 route 语义词；不改第二条 API 失败标题，也不改共享断言、fixture 设置或 helper/route 运行时逻辑 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` + 独立 reviewer | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过 |
| 提交 | `git commit -m "[verified] test: restore route wording to first legacy issue reject title"` | 完成本轮 feature/work commit，得到真实提交 `efde12dc53915e47c4a81bb5e81c57f7ea7ca738` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-96` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-97`：评估 `getOrganizations()` API 失败场景标题是否也应与 `route getIssue rejects` 保持对称，补回最小 route 级语义词 |

### 215.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 legacy `/issues/[id]` route 两条 API 失败场景再次同时收口为 `getIssue rejects` / `getOrganizations rejects` 后，route 层级会与 helper 级 lookup 标题重新过于接近。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题从 `getIssue rejects` 补回为 `route getIssue rejects`，同时保持第二条 `getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-96` -> `done`，下一轮转入 `IMP-97`，继续评估第二条 route 级 API 失败场景标题是否也应补回 route 级语义词。

### 215.3 经验沉淀

- 当 helper 级 lookup 标题仍显式保留 helper seam wording，而两条 route 级 API 失败标题都被收口到仅剩方法名 + rejects 时，需要再次检查 route/helper 层级是否被过度压平。
- 纯测试标题回摆同样应坚持一次只改一条、安全验证、独立 review、状态写回的最小 execution unit 节奏。

### 215.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-96 → IMP-97` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `adf4d676c062fbf62fd9c015463c6c4800018a15` |
| feature commit | `efde12dc53915e47c4a81bb5e81c57f7ea7ca738` |
| docs/state closeout | `project.head` / `last_completed_task.commit` / task-board IMP-96 commit 已统一改正为真实 40 位 SHA，并已随 docs commit `cdc8064c9f63fdb270315ae9a5335ad57596a55d` 推送到 `origin/codex/unify-issue-model` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 214 — 2026-04-20：评估并去掉第二条 legacy route API 失败标题中的 route 前缀（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-95`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 第二条 API 失败场景当前 `route getOrganizations rejects` 标题在首条已收口为 `getIssue rejects` 后，是否也应对称去掉 `route` 前缀；若可行，则只改这一处安全标题并完成验证、review、提交、状态回写与 push 闭环。

### 214.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，Implementation lane 当前项为 `IMP-95`，且工作树干净，可支持新的单文件最小 execution unit |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('route getOrganizations rejects', async () => {` 收口为 `it('getOrganizations rejects', async () => {`；不改第一条 API 失败标题，也不改共享断言、fixture 设置或 helper/route 运行时逻辑 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: drop route wording from second legacy issue reject title"` | 完成本轮 feature/work commit，得到真实提交 `4b96165af35e3f4f6decaef3e13b9d9e00ac535c` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-95` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-96`：评估两条 API 失败场景在均去掉 `route` 前缀后是否仍需补回 route 级语义词 |

### 214.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文下，第二条 route 级 API 失败场景 `route getOrganizations rejects` 应与已收口为 `getIssue rejects` 的第一条 route 级失败标题保持对称，也去掉 `route` 前缀。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题从 `route getOrganizations rejects` 收口为 `getOrganizations rejects`，同时保持第一条 `getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-95` -> `done`，下一轮转入 `IMP-96`，继续评估两条 API 失败场景标题在均去掉 `route` 前缀后是否仍需补回 route 级语义词。

### 214.3 经验沉淀

- 当首条 route 级失败标题已收口为 `getIssue rejects` 时，可用 describe 作用域与 helper seam wording 复核第二条 route 级标题是否也应同步收口，避免保留无额外辨识价值的孤立 `route` 前缀。
- 纯测试标题收口也应坚持一次只改一条、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 214.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-95 → IMP-96` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `277d31c62713efd966fddc17bacdca212358a6d8` |
| feature commit | `4b96165af35e3f4f6decaef3e13b9d9e00ac535c` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

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

