## Session 177 — 2026-04-20：去掉第二条 legacy route API 失败标题中的 empty wording

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-59`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route `getOrganizations()` API 失败场景当前 `renders empty props when getOrganizations rejects in the legacy /issues/[id] route` 标题中的 `empty` wording 是否也可像 `getIssue(...)` 场景一样安全去掉；若可行，则只改这一处安全标题并完成验证、review、提交、状态回写与 push 闭环。

### 177.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 恢复当前分支与最近提交，确认本轮在 `codex/unify-issue-model` 上继续 implementation lane 单一 execution unit |
| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` / `frontend/src/lib/routes.test.tsx` | 恢复唯一状态源、lane 明细、roadmap 与日志/工时回写要求，并确认 `IMP-59` 仅允许评估 `getOrganizations()` 失败场景这一处标题是否可去掉 `empty` wording |
| 配置 | `git config user.name/user.email` | 复核 git author 使用 `offic0600 <offic0600@163.com>` |
| 修改 | `frontend/src/lib/routes.test.tsx` | 将 `getOrganizations()` 失败场景测试标题从 `renders empty props when getOrganizations rejects in the legacy /issues/[id] route` 收口为 `renders props when getOrganizations rejects in the legacy /issues/[id] route`，以与上一轮 `getIssue(...)` 场景保持一致，同时保持共享断言、fixture 设置与 helper/route 运行时逻辑不变 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：routes seam 定向测试 5 files / 57 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: trim second route empty props wording"` | 完成本轮 feature/work commit，得到真实提交 `37d3e7b18a3f143945168a5143b5aa12a12e55a9` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-59` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-60`：评估两条 API 失败场景标题在均去掉 `empty` wording 后是否仍需保留 `props` 全称 |

### 177.2 本轮落地结果

- 已复核 legacy `/issues/[id]` route 中 `getOrganizations()` API 失败场景与上一轮 `getIssue(...)` 失败场景一样，都是 route 级渲染后断言 `IssueDetailPage` 收到 props 的观察面；在共享断言 helper `expectLegacyIssueRouteEmptyPropsContract()` 继续承载 contract 语义的前提下，该标题可继续安全收口。
- 因此本轮仅将 `getOrganizations()` 失败场景测试标题收口为 `renders props when getOrganizations rejects in the legacy /issues/[id] route`，同时保持共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-59` -> `done`，下一轮转入 `IMP-60`，继续评估两条 API 失败标题在均去掉 `empty` wording 后是否仍需保留 `props` 全称。

### 177.3 经验沉淀

- 当 route 级失败场景与上一轮对称，且共享断言 helper 继续保留 `...Contract()` 语义时，可以按 execution unit 一次只收口另一条对称测试标题中的 `empty` wording，而无需同步调整 helper 名称或运行时逻辑。
- 即使两条 route 级 API 失败场景在语义上完全对称，也仍应保持“一次只动一处标题”的节奏；先让第二条标题完成对齐，再单独判断 `props` 等剩余词是否还需继续收紧。

### 177.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-59 → IMP-60` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `08ced1e6c9829da0fc6c5109d51bcf10d586783b` |
| feature commit | `37d3e7b18a3f143945168a5143b5aa12a12e55a9` |
| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 57 tests） |
| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
| Diff 检查 | `git diff --check` ✅ |

## Session 176 — 2026-04-20：去掉第一条 legacy route API 失败标题中的 the wording

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-56`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景在均改为 `renders the empty props ...` 后，第一条安全标题中的 `the` wording 是否仍可继续安全收口；若可行，则只改 `getIssue(...)` 失败场景这一处文案并完成验证、review、提交、状态回写与 push 闭环。

### 176.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 恢复当前分支与最近提交，确认本轮在 `codex/unify-issue-model` 上继续 implementation lane 单一 execution unit |
| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` / `frontend/src/lib/routes.test.tsx` | 恢复唯一状态源、lane 明细、roadmap 与日志/工时回写要求，并确认 `IMP-56` 仅允许先评估并收口 `getIssue(...)` 失败场景标题中的 `the` wording |
| 配置 | `git config user.name/user.email` | 复核 git author 使用 `offic0600 <offic0600@163.com>` |
| 修改 | `frontend/src/lib/routes.test.tsx` | 将 `getIssue(...)` 失败场景测试标题从 `renders the empty props when getIssue rejects in the legacy /issues/[id] route` 收口为 `renders empty props when getIssue rejects in the legacy /issues/[id] route`，同时保持 `getOrganizations()` 失败标题、共享断言、fixture 设置与 helper/route 运行时逻辑不变 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：routes seam 定向测试 5 files / 57 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx docs/linear-parity/task-board.md` | 复核本轮只改一处 route 级 API 失败测试标题，并同步把 task-board `IMP-56` 写回 done、新增 `IMP-57`；未改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: trim route empty props article"` | 完成本轮 feature/work commit，得到真实提交 `7253e81c737456a75d6a72f7f0e8e7991966d4e7` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-56` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-57`：评估 `getOrganizations()` 失败场景标题是否也应去掉 `the` wording |

### 176.2 本轮落地结果

- 已复核 legacy `/issues/[id]` route 两条 API 失败场景测试标题当前都属于 route 级渲染后断言 `IssueDetailPage` 收到空 props 的观察面；在第二条 `getOrganizations()` 标题仍保留 `the` wording 作为对照、且共享断言 helper `expectLegacyIssueRouteEmptyPropsContract()` 已承载 contract 语义的前提下，第一条安全标题可继续收口。
- 因此本轮仅将 `getIssue(...)` 失败场景测试标题收口为 `renders empty props when getIssue rejects in the legacy /issues/[id] route`，同时保持第二条失败标题、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-56` -> `done`，下一轮转入 `IMP-57`，继续评估第二条 API 失败标题是否也应同步去掉 `the` wording。

### 176.3 经验沉淀

- 当两条 route 级 API 失败场景标题都已稳定表达 `empty props` 观察面，而共享断言 helper 仍保留 `...Contract()` 语义时，可以按 execution unit 一次只移除一处冠词 `the`，继续最小幅度压缩测试文案而不改变断言边界。
- 即使两条 route 级 API 失败场景在语义上完全对称，也仍应保持“一次只动一处标题”的节奏；先完成第一条安全标题收口，再单独判断第二条是否跟进。

### 176.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-56 → IMP-57` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `fbdf0f8d4af8f3ee5682602cfc3746f86fce08f3` |
| feature commit | `7253e81c737456a75d6a72f7f0e8e7991966d4e7` |
| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 57 tests） |
| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
| Diff 检查 | `git diff --check` ✅ |

## Session 175 — 2026-04-20：去掉第二条 legacy route API 失败标题中的 state wording

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-55`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route `getOrganizations()` API 失败场景当前 `renders the empty state props when getOrganizations rejects in the legacy /issues/[id] route` 标题中的 `state` wording 是否也可像 `getIssue(...)` 场景一样安全去掉；若可行，则只改这一处安全标题并完成验证、review、提交、状态回写与 push 闭环。

### 175.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、执行前 HEAD 为 `3887afbd935322eb50ffc277d3174eefc3da2a1e`，工作树为空，可直接按 `IMP-55` 进入新的最小 execution unit |
| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` / `frontend/src/lib/routes.test.tsx` | 恢复唯一状态源、lane 明细、roadmap 与日志/工时回写要求，并确认 `IMP-55` 仅允许评估 `getOrganizations()` 失败场景这一处标题是否可把 `empty state props` 收口为 `empty props` |
| 配置 | `git config user.name/user.email` | 复核 git author 使用 `offic0600 <offic0600@163.com>` |
| 修改 | `frontend/src/lib/routes.test.tsx` | 将 `getOrganizations()` 失败场景测试标题从 `renders the empty state props when getOrganizations rejects in the legacy /issues/[id] route` 收口为 `renders the empty props when getOrganizations rejects in the legacy /issues/[id] route`，以与上一轮 `getIssue(...)` 场景保持一致，同时保持共享断言、fixture 设置与 helper/route 运行时逻辑不变 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：routes seam 定向测试 5 files / 57 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: trim second route empty state wording"` | 完成本轮 feature/work commit，得到真实提交 `fbdf0f8d4af8f3ee5682602cfc3746f86fce08f3` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-55` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-56`：评估两条 API 失败场景标题在均改为 `empty props` 后是否仍需保留 `the` 全称 |

### 175.2 本轮落地结果

- 已复核 legacy `/issues/[id]` route 中 `getOrganizations()` API 失败场景与上一轮 `getIssue(...)` 失败场景一样，都是 route 级渲染后断言 `IssueDetailPage` 收到空 props 的观察面；在共享断言 helper `expectLegacyIssueRouteEmptyPropsContract()` 继续承载 contract 语义的前提下，该标题可继续安全收口。
- 因此本轮仅将 `getOrganizations()` 失败场景测试标题收口为 `renders the empty props when getOrganizations rejects in the legacy /issues/[id] route`，同时保持共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-55` -> `done`，下一轮转入 `IMP-56`，继续评估两条 API 失败标题在均改为 `empty props` 后是否仍需保留 `the` 全称。

### 175.3 经验沉淀

- 当 route 级失败场景与上一轮对称，且共享断言 helper 继续保留 `...Contract()` 语义时，可以按 execution unit 一次只收口另一条对称测试标题中的 `state` wording，而无需同步调整 helper 名称或运行时逻辑。
- 即使两条 route 级 API 失败场景在语义上完全对称，也仍应保持“一次只动一处标题”的节奏；先让第二条标题完成对齐，再单独判断 `the` 等剩余词是否还需继续收紧。

### 175.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-55 → IMP-56` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `3887afbd935322eb50ffc277d3174eefc3da2a1e` |
| feature commit | `fbdf0f8d4af8f3ee5682602cfc3746f86fce08f3` |
| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 57 tests） |
| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
| Diff 检查 | `git diff --check` ✅ |

## Session 174 — 2026-04-20：收口第二条 legacy route API 失败标题中的 empty state props wording

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-53`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route `getOrganizations()` API 失败场景当前 `renders the empty props when getOrganizations rejects in the legacy /issues/[id] route` 标题是否应与已收口的 `getIssue(...)` 场景一致改为 `renders the empty state props ...`；若可行，则只改这一处安全标题并完成验证、review、提交、状态回写与 push 闭环。

### 174.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、执行前 HEAD 为 `3cb107885f876c5bb3dfa3f7d63cfaa6e8af9a12`，工作树为空，可直接按 `IMP-53` 进入新的最小 execution unit |
| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` / `frontend/src/lib/routes.test.tsx` | 恢复唯一状态源、lane 明细、roadmap 与日志/工时回写要求，并确认 `IMP-53` 仅允许评估 `getOrganizations()` 失败场景这一处标题是否应从 `empty props` 收口为 `empty state props` |
| 配置 | `git config user.name/user.email` | 复核 git author 使用 `offic0600 <offic0600@163.com>` |
| 修改 | `frontend/src/lib/routes.test.tsx` | 将 `getOrganizations()` 失败场景测试标题从 `renders the empty props when getOrganizations rejects in the legacy /issues/[id] route` 收口为 `renders the empty state props when getOrganizations rejects in the legacy /issues/[id] route`，以与 `getIssue(...)` 场景保持一致，同时保持共享断言、fixture 设置与 helper/route 运行时逻辑不变 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：routes seam 定向测试 5 files / 57 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: trim second route empty state wording"` | 完成本轮 feature/work commit，得到真实提交 `87a911a14298563cba960b8b16de0ac7cc24b3ee` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-53` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-54`：评估两条 API 失败场景标题在均改为 `empty state props` 后是否仍需保留 `state` 全称 |

### 174.2 本轮落地结果

- 已复核 legacy `/issues/[id]` route 中 `getOrganizations()` API 失败场景与上一轮 `getIssue(...)` 失败场景一样，都是 route 级渲染后断言 `IssueDetailPage` 收到空态 props 的观察面；在共享断言 helper `expectLegacyIssueRouteEmptyPropsContract()` 继续承载 contract 语义的前提下，该标题可继续安全收口。
- 因此本轮仅将 `getOrganizations()` 失败场景测试标题收口为 `renders the empty state props when getOrganizations rejects in the legacy /issues/[id] route`，同时保持共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-53` -> `done`，下一轮转入 `IMP-54`，继续评估两条 API 失败标题在均改为 `empty state props` 后是否仍需保留 `state` 全称。

### 174.3 经验沉淀

- 当 route 级失败场景与上一轮对称，且共享断言 helper 继续保留 `...Contract()` 语义时，可以按 execution unit 一次只收口另一条对称测试标题中的 `empty state props` wording，而无需同步调整 helper 名称或运行时逻辑。
- 即使两条 route 级 API 失败场景在语义上完全对称，也仍应保持“一次只动一处标题”的节奏；先让第二条标题完成对齐，再单独判断 `state` 词是否还需继续收紧。

### 174.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-53 → IMP-54` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `3cb107885f876c5bb3dfa3f7d63cfaa6e8af9a12` |
| feature commit | `87a911a14298563cba960b8b16de0ac7cc24b3ee` |
| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 57 tests） |
| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
| Diff 检查 | `git diff --check` ✅ |

## Session 173 — 2026-04-20：收口第一条 legacy route API 失败标题中的 empty props wording

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-52`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景在均去掉 `contract` wording 后，第一条安全标题中的 `empty props` 全称是否仍可继续安全收口；若可行，则只改 `getIssue(...)` 失败场景这一处文案并完成验证、review、提交、状态回写与 push 闭环。

### 173.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、执行前 HEAD 为 `45be5c8d8f4b306f3d7024c57ff2358f628f66f6`，工作树为空，可直接按 `IMP-52` 进入新的最小 execution unit |
| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` / `frontend/src/lib/routes.test.tsx` | 恢复唯一状态源、lane 明细、roadmap 与日志/工时回写要求，并确认 `IMP-52` 仅允许评估两条 API 失败场景中第一条安全标题是否可把 `empty props` 收口为更精炼 wording |
| 配置 | `git config user.name/user.email` | 复核 git author 使用 `offic0600 <offic0600@163.com>` |
| 修改 | `frontend/src/lib/routes.test.tsx` | 将 `getIssue(...)` 失败场景测试标题从 `renders the empty props when getIssue rejects in the legacy /issues/[id] route` 收口为 `renders the empty state props when getIssue rejects in the legacy /issues/[id] route`，以更直接表达 route 级空态 props 语义，同时保持 `getOrganizations()` 失败标题、共享断言、fixture 设置与 helper/route 运行时逻辑不变 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：routes seam 定向测试 5 files / 57 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: trim route empty props wording"` | 完成本轮 feature/work commit，得到真实提交 `8c3c5c514e9b766cf2337199c13f44e2704a9f1f` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-52` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-53`：评估 `getOrganizations()` 失败场景标题是否也应从 `empty props` 收口为 `empty state props` |

### 173.2 本轮落地结果

- 已复核 legacy `/issues/[id]` route 中两条 API 失败场景标题都属于 route 级渲染后断言 `IssueDetailPage` 收到空 props 的观察面；在共享断言 helper `expectLegacyIssueRouteEmptyPropsContract()` 仍承载 contract 语义的前提下，第一条安全标题可继续从 `empty props` 收口。
- 因此本轮仅将 `getIssue(...)` 失败场景测试标题收口为 `renders the empty state props when getIssue rejects in the legacy /issues/[id] route`，同时保持 `getOrganizations()` 失败标题、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-52` -> `done`，下一轮转入 `IMP-53`，继续评估第二条 API 失败标题是否也应同步改为 `empty state props`。

### 173.3 经验沉淀

- 当 route 级失败场景的共享断言 helper 继续保留 `...EmptyPropsContract()` 语义时，可以按 execution unit 一次只收口一条测试标题中的 `empty props` wording，而无需同步修改 helper 名称或运行时逻辑。
- 即使两条 route 级 API 失败场景在语义上完全对称，也仍应保持“一次只动一处标题”的节奏；先让第一条标题稳定收口，再单独判断第二条是否跟进，以维持 cron 状态机的最小边界。

### 173.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-52 → IMP-53` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `45be5c8d8f4b306f3d7024c57ff2358f628f66f6` |
| feature commit | `8c3c5c514e9b766cf2337199c13f44e2704a9f1f` |
| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 57 tests） |
| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
| Diff 检查 | `git diff --check` ✅ |

## Session 172 — 2026-04-20：去掉第二条 legacy route API 失败标题中的 contract wording

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-51`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route `getOrganizations()` 失败场景当前 `renders the empty props contract ...` 标题中的 `contract` wording 是否也可像 `getIssue(...)` 场景一样安全去掉；若可行，则只改这一处安全的测试文案并完成验证、review、提交、状态回写与 push 闭环。

### 172.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、执行前 HEAD 已是本轮 feature commit `3700122bb8321f70083fd9f729a6a0a2e4df8260`，工作树仅剩 docs/state 闭环改动，属于同一 execution unit 的 closure-only 残留，可继续收口 |
| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 恢复唯一状态源、lane 明细、roadmap 与日志/工时回写要求，确认本轮只允许收口已完成的 `IMP-51`，并需把 task-board / logbook / worktime 与状态文件中已写入的 feature SHA、next task 保持一致 |
| 配置 | `git config user.name/user.email` | 确认 git author 使用 `offic0600 <offic0600@163.com>` |
| 修改 | `docs/linear-parity/task-board.md` | 将 `IMP-51` 写回 `done` 并补入完成摘要，同时新增与状态文件一致的后继任务 `IMP-52`，避免 task-board 与唯一状态源对下一轮 implementation lane 的定义漂移 |
| 修改 | `docs/status/roadmap-state.yaml` | 保持 `project.head` / `last_completed_task.commit` 指向真实 feature SHA `3700122bb8321f70083fd9f729a6a0a2e4df8260`，并修正 `next_run_prompt_summary` 中仍误指向 `IMP-51` 的旧摘要，使其与当前 `current_task: IMP-52` 一致 |
| 修改 | `docs/planning/dev-logbook.md` / `doc/worktime.md` | 新增 Session 172 闭环记录，说明本轮属于 implementation lane 的 docs/state closure-only 收口，补齐 task-board / 状态摘要 / 工时追踪 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 继承并核对本轮 feature execution 的最小充分验证结果均通过：routes seam 定向测试 5 files / 57 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
| Review | 重新读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` | 二次核对 `project.head`、`last_completed_task.commit`、`current_task`/`next_task` 与 task-board 行状态一致，确认未把 future task 写成 done，也未把 feature SHA 误写为 docs commit SHA；review 结论为通过 |
| 提交 | `git commit -m "[verified] docs: close IMP-51 state loop"` | 完成本轮 docs/state commit，单独收口 implementation lane 的状态、task-board、logbook 与 worktime |

### 172.2 本轮落地结果

- 本轮判断为 implementation lane 的 **closure-only** 收口：代码层唯一 execution unit `IMP-51` 已在 feature commit `3700122bb8321f70083fd9f729a6a0a2e4df8260` 中完成，当前工作树残留仅为同 lane 的 docs/state 闭环改动，因此继续完成状态同步而不新增实现。
- `docs/linear-parity/task-board.md` 已将 `IMP-51` 写回 `done`，并补入与唯一状态源一致的后继任务 `IMP-52`：评估两条 API 失败场景测试标题在均去掉 `contract` wording 后，是否仍需保留 `empty props` 全称。
- `docs/status/roadmap-state.yaml` 已保持 `project.head` / `last_completed_task.commit` 指向真实 feature SHA `3700122bb8321f70083fd9f729a6a0a2e4df8260`，并修正 `next_run_prompt_summary` 中对旧 task id 的引用，使其与当前 `IMP-52` 一致。
- `docs/planning/dev-logbook.md` 与 `doc/worktime.md` 已补齐本轮 closure-only 收口记录，确保 execution、状态、工时三处文档一致。

### 172.3 经验沉淀

- 对 cron state machine 而言，若 feature/work commit 已落地且剩余改动只包含状态文件、task-board、logbook、worktime 等同 lane 闭环文档，应优先将该轮识别为 closure-only，而不是误判为跨 lane 污染 blocked。
- 在推进 `current_task` 后若先写了状态文件，也必须二次核对 `next_run_prompt_summary`、task-board 后继行与 `current_task.id` 是否同步；自由文本摘要若滞留旧 task id，会在下一轮 fresh session 中造成恢复歧义。

### 172.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-51 → IMP-52` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `3700122bb8321f70083fd9f729a6a0a2e4df8260` |
| feature commit | `3700122bb8321f70083fd9f729a6a0a2e4df8260` |
| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 57 tests） |
| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
| Diff 检查 | `git diff --check` ✅ |

## Session 171 — 2026-04-20：收口第一条 legacy route API 失败标题中的 contract wording

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-50`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景标题在均去掉 `shared` wording 后，第一条安全标题中的 `empty props contract` 全称是否仍可继续安全收口；若可行，则只改 `getIssue(...)` 失败场景这一处文案并完成验证、review、提交、状态回写与 push 闭环。

### 171.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、执行前 HEAD 为上一轮 implementation feature/docs 闭环提交，工作树起始干净，可安全继续单一 execution unit |
| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` / `frontend/src/lib/routes.test.tsx` | 恢复唯一状态源、lane 明细、roadmap 与日志/工时回写要求，确认本轮只允许推进 `IMP-50`，且最小切口是先评估并收口 `getIssue(...)` 失败场景标题中的 `contract` wording |
| 配置 | `git config user.name/user.email` | 确认 git author 使用 `offic0600 <offic0600@163.com>` |
| 修改 | `frontend/src/lib/routes.test.tsx` | 将 `getIssue(...)` 失败场景测试标题从 `renders the empty props contract when getIssue rejects in the legacy /issues/[id] route` 收口为 `renders the empty props when getIssue rejects in the legacy /issues/[id] route`，去掉在当前 route 级观察面中已可由共享断言 helper 与上下文补足的 `contract` wording，同时保持 `getOrganizations()` 失败标题、共享断言、fixture 设置与 helper/route 运行时逻辑不变 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：routes seam 定向测试 5 files / 57 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: trim route empty props contract wording"` | 完成本轮 feature/work commit，得到真实提交 `7d68c649f00463d86786f66aa5211ea84bb4ea75` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-50` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-51`：评估 `getOrganizations()` 失败场景标题是否也应去掉 `contract` wording |

### 171.2 本轮落地结果

- 已复核 legacy `/issues/[id]` route 中 `getIssue(...)` API 失败场景当前同样属于 route 级渲染后断言 `IssueDetailPage` 收到空 props 的观察面；在共享断言 helper `expectLegacyIssueRouteEmptyPropsContract()` 与上下文已表达 contract 语义的前提下，标题中的 `contract` wording 可继续安全收口。
- 因此本轮仅将 `getIssue(...)` 失败场景测试标题收口为 `renders the empty props when getIssue rejects in the legacy /issues/[id] route`，同时保持 `getOrganizations()` 失败标题、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-50` -> `done`，下一轮转入 `IMP-51`，继续评估第二条 API 失败标题是否也应同步去掉 `contract` wording。

### 171.3 经验沉淀

- 当 route 级失败场景标题已经稳定表达 `empty props` 观察面，且共享断言 helper 名称仍保留 `...Contract()` 语义时，可按 execution unit 一次只移除一处 `contract` wording，继续最小幅度压缩测试文案而不改变断言边界。
- 即使两条 route 级 API 失败场景在语义上完全对称，也仍应保持“一次只动一处标题”的节奏；先完成第一条安全标题收口，再单独判断第二条是否跟进。

### 171.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-50 → IMP-51` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `99fee1d430f437b7f2293d848c4bc657973e5d70` |
| feature commit | `7d68c649f00463d86786f66aa5211ea84bb4ea75` |
| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 57 tests） |
| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
| Diff 检查 | `git diff --check` ✅ |

     1|## Session 170 — 2026-04-20：去掉第二条 legacy route API 失败标题中的 shared wording
     2|
     3|**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-49`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route `getOrganizations()` 失败场景当前 `renders the shared empty props contract ...` 标题中的 `shared` wording 是否也可像 `getIssue(...)` 场景一样安全去掉；若可行，则只改这一处安全的测试文案并完成验证、review、提交、状态回写与 push 闭环。
     4|
     5|### 170.1 实施内容
     6|
     7|| 操作 | 文件 | 说明 |
     8||------|------|------|
     9|| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、执行前 HEAD 为上一轮 implementation feature commit，工作树起始干净，可安全继续单一 execution unit |
    10|| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` / `frontend/src/lib/routes.test.tsx` | 恢复唯一状态源、lane 明细、roadmap 与日志/工时回写要求，确认本轮只允许推进 `IMP-49`，且最小切口是评估并收口 `getOrganizations()` 失败场景标题中的 `shared` wording |
    11|| 配置 | `git config user.name/user.email` | 确认 git author 使用 `offic0600 <offic0600@163.com>` |
    12|| 修改 | `frontend/src/lib/routes.test.tsx` | 将 `getOrganizations()` 失败场景测试标题从 `renders the shared empty props contract when getOrganizations rejects in the legacy /issues/[id] route` 收口为 `renders the empty props contract when getOrganizations rejects in the legacy /issues/[id] route`，去掉与共享断言 helper 命名重复的 `shared` wording，同时保持共享断言、fixture 设置与 helper/route 运行时逻辑不变 |
    13|| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：routes seam 定向测试 5 files / 57 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
    14|| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
    15|| 提交 | `git commit -m "[verified] test: trim second route empty props wording"` | 完成本轮 feature/work commit，得到真实提交 `09890ccbddb0543a5912732735fbd8107e4b11bb` |
    16|| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-49` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-50`：评估两条 API 失败场景标题在均去掉 `shared` wording 后是否仍需保留 `empty props contract` 全称 |
    17|
    18|### 170.2 本轮落地结果
    19|
    20|- 已复核 legacy `/issues/[id]` route 中 `getOrganizations()` API 失败场景当前同样属于 route 级渲染后断言 `IssueDetailPage` 收到空 props contract 的观察面；共享断言 helper `expectLegacyIssueRouteEmptyPropsContract()` 已在命名中表达该 contract 为共享入口。
    21|- 因此本轮仅将 `getOrganizations()` 失败场景测试标题收口为 `renders the empty props contract when getOrganizations rejects in the legacy /issues/[id] route`，去掉重复的 `shared` wording；共享断言、fixture 设置以及 helper/route 运行时逻辑均保持不变。
    22|- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-49` -> `done`，下一轮转入 `IMP-50`，继续评估两条 API 失败标题在均去掉 `shared` wording 后是否还需保留 `empty props contract` 全称。
    23|
    24|### 170.3 经验沉淀
    25|
    26|- 当 route 级 API 失败场景与上一轮对称且共享断言 helper 已表达“共享入口”语义时，可按 execution unit 一次只移除一处多余修饰词，先验证最小安全标题收口。
    27|- 即使两条 route 级 API 失败场景在语义上完全对称，也仍应保持“一次只动一处标题”的节奏；先完成第二条安全标题收口，再单独判断 `empty props contract` 等剩余词组是否还需继续收紧。
    28|
    29|### 170.4 关键数据快照
    30|
    31|| 指标 | 值 |
    32||------|-----|
    33|| 当前 lane / task | `Implementation / IMP-49 → IMP-50` |
    34|| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `1e6dc823a35ab1d4a4e8f4268575c84e3298ae08` |
    35|| feature commit | `09890ccbddb0543a5912732735fbd8107e4b11bb` |
    36|| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 57 tests） |
    37|| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
    38|| Diff 检查 | `git diff --check` ✅ |
    39|
    40|## Session 169 — 2026-04-20：去掉第一条 legacy route API 失败标题中的 shared wording
    41|
    42|**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-48`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前均为 `renders the shared empty props contract ...` 后，第一条安全标题中的 `shared` wording 是否仍有必要；若可行，则只改 `getIssue(...)` 失败场景这一处文案并完成验证、review、提交、状态回写与 push 闭环。
    43|
    44|### 169.1 实施内容
    45|
    46|| 操作 | 文件 | 说明 |
    47||------|------|------|
    48|| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、执行前 HEAD 为上一轮 implementation feature commit，工作树起始干净，可安全继续单一 execution unit |
    49|| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` / `frontend/src/lib/routes.test.tsx` | 恢复唯一状态源、lane 明细、roadmap 与日志/工时回写要求，确认本轮只允许推进 `IMP-48`，且最小切口是先评估并收口 `getIssue(...)` 失败场景标题中的 `shared` wording |
    50|| 配置 | `git config user.name/user.email` | 确认 git author 使用 `offic0600 <offic0600@163.com>` |
    51|| 修改 | `frontend/src/lib/routes.test.tsx` | 将 `getIssue(...)` 失败场景测试标题从 `renders the shared empty props contract when getIssue rejects in the legacy /issues/[id] route` 收口为 `renders the empty props contract when getIssue rejects in the legacy /issues/[id] route`，去掉与共享断言 helper 命名重复的 `shared` wording，同时保持 `getOrganizations()` 失败标题、共享断言、fixture 设置与 helper/route 运行时逻辑不变 |
    52|| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：routes seam 定向测试 5 files / 57 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
    53|| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
    54|| 提交 | `git commit -m "[verified] test: trim route empty props wording"` | 完成本轮 feature/work commit，得到真实提交 `59ea694fea94980ed9419dce5d8687133cfc3700` |
    55|| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-48` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-49`：评估 `getOrganizations()` 失败场景标题是否也应去掉 `shared` wording |
    56|
    57|### 169.2 本轮落地结果
    58|
    59|- 已复核 legacy `/issues/[id]` route 中 `getIssue(...)` / `getOrganizations()` 两条 API 失败场景当前都属于 route 级渲染后断言 `IssueDetailPage` 收到空 props contract 的观察面；共享断言 helper `expectLegacyIssueRouteEmptyPropsContract()` 已在命名中表达该 contract 为共享入口。
    60|- 因此本轮仅将 `getIssue(...)` 失败场景测试标题收口为 `renders the empty props contract when getIssue rejects in the legacy /issues/[id] route`，去掉重复的 `shared` wording；`getOrganizations()` 失败标题、共享断言、fixture 设置以及 helper/route 运行时逻辑均保持不变。
    61|- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-48` -> `done`，下一轮转入 `IMP-49`，继续评估第二条 API 失败标题是否也应同步去掉 `shared` wording。
    62|
    63|### 169.3 经验沉淀
    64|
    65|- 当共享断言 helper 名称已明确表达 contract 的共享入口时，测试标题中的 `shared` wording 容易变成重复修饰；可按 execution unit 一次只移除一处，先验证最安全的标题收口。
    66|- 即使两条 route 级 API 失败场景在语义上高度对称，也应继续维持“一次只动一处标题”的节奏，先完成第一条安全标题收口，再单独判断第二条是否跟进。
    67|
    68|### 169.4 关键数据快照
    69|
    70|| 指标 | 值 |
    71||------|-----|
    72|| 当前 lane / task | `Implementation / IMP-48 → IMP-49` |
    73|| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `cf30c0acaaececb0d87d768aa23ef5cffe86701f` |
    74|| feature commit | `59ea694fea94980ed9419dce5d8687133cfc3700` |
    75|| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 57 tests） |
    76|| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
    77|| Diff 检查 | `git diff --check` ✅ |
    78|
    79|## Session 168 — 2026-04-20：将 route 级 getOrganizations API 失败场景测试标题收口为 renders 语义
    80|
    81|**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-47`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route `getOrganizations()` 失败场景当前 `falls back to the shared empty props contract ...` 标题是否也应按 route render 层收口为 `renders ...`；若可行，则只改这一处安全的测试文案并完成验证、review、提交、状态回写与 push 闭环。
    82|
    83|### 168.1 实施内容
    84|
    85|| 操作 | 文件 | 说明 |
    86||------|------|------|
    87|| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、执行前 HEAD `fd9139334c1470c9016352b0cbdf07bbc699f2fe`，工作树起始干净，可安全继续单一 implementation execution unit |
    88|| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` / `frontend/src/lib/routes.test.tsx` | 恢复唯一状态源、lane 明细、roadmap 与日志/工时回写要求，确认本轮只允许推进 `IMP-47`，且最小切口是继续稳定第二条 route 级 API 失败标题的 render 语义 |
    89|| 配置 | `git config user.name/user.email` | 确认 git author 使用 `offic0600 <offic0600@163.com>` |
    90|| 修改 | `frontend/src/lib/routes.test.tsx` | 将 `getOrganizations()` 失败场景测试标题从 `falls back to the shared empty props contract when getOrganizations rejects in the legacy /issues/[id] route` 收口为 `renders the shared empty props contract when getOrganizations rejects in the legacy /issues/[id] route`，用 `renders` 与上一轮 `getIssue(...)` 失败场景统一 route render 语义，同时保持共享断言、fixture 设置与 helper/route 运行时逻辑不变 |
    91|| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：routes seam 定向测试 5 files / 57 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
    92|| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
    93|| 提交 | `git commit -m "[verified] test: align route failure render wording"` | 完成本轮 feature/work commit，得到真实提交 `cf30c0acaaececb0d87d768aa23ef5cffe86701f` |
    94|| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-47` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-48`：评估两条 route 级 API 失败场景标题在均改为 `renders ...` 后是否仍需保留 `shared` wording |
    95|
    96|### 168.2 本轮落地结果
    97|
    98|- 已复核 legacy `/issues/[id]` route 中 `getOrganizations()` 失败场景与上一轮 `getIssue(...)` 失败场景一样，都是 route 级渲染 legacy `/issues/[id]` route 后，再断言 `IssueDetailPage` 收到共享空 props contract，而不是 helper 返回值 contract。
    99|- `getOrganizations()` 失败场景测试标题现已由 `falls back to the shared empty props contract when getOrganizations rejects in the legacy /issues/[id] route` 收口为 `renders the shared empty props contract when getOrganizations rejects in the legacy /issues/[id] route`，以 `renders` 与同组 route 级 API 失败场景统一 render 层语义。
   100|- `getIssue(...)` 失败场景标题、`expectLegacyIssueRouteEmptyPropsContract()` 共享断言、fixture 设置以及 helper/route 运行时逻辑均保持不变；`docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-47` -> `done`，下一轮转入 `IMP-48`，继续评估两条 API 失败标题在均改为 `renders ...` 后是否还需保留 `shared` wording。
   101|
   102|### 168.3 经验沉淀
   103|
   104|- 对并列的 route 级 API 失败场景，只要测试观察面都是“渲染 legacy route 后断言 page props contract”，就应优先统一使用 `renders ...`，避免同组场景混用 `falls back` 与 `renders` 造成层级语义漂移。
   105|- 即使两条失败场景高度对称，也仍应一次只动一处标题；先让第二条 route 级标题追平第一条，再单独判断 `shared` 之类修饰词是否需要继续收口。
   106|
   107|### 168.4 关键数据快照
   108|
   109|| 指标 | 值 |
   110||------|-----|
   111|| 当前 lane / task | `Implementation / IMP-47 → IMP-48` |
   112|| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `fd9139334c1470c9016352b0cbdf07bbc699f2fe` |
   113|| feature commit | `cf30c0acaaececb0d87d768aa23ef5cffe86701f` |
   114|| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 57 tests） |
   115|| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
   116|| Diff 检查 | `git diff --check` ✅ |
   117|
   118|## Session 167 — 2026-04-20：将 route 级 getIssue API 失败场景测试标题收口为 renders 语义
   119|
   120|**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-46`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前 `falls back to the shared empty props contract ...` 标题是否仍需按 route render 层稳定动词；若可行，则只改第一处安全的测试文案并完成验证、review、提交、状态回写与 push 闭环。
   121|
   122|### 167.1 实施内容
   123|
   124|| 操作 | 文件 | 说明 |
   125||------|------|------|
   126|| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、执行前 HEAD `a94e40daf62199adae19d8ea0b194026e4b6b685`，工作树仅含上轮同 lane docs/state 闭环残留，可在同一 execution unit 中继续收口 |
   127|| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` / `frontend/src/lib/routes.test.tsx` | 恢复唯一状态源、lane 明细、roadmap 与日志/工时回写要求，确认本轮只允许推进 `IMP-46`，且最小切口是先稳定第一条 route 级 API 失败标题的 render 语义 |
   128|| 配置 | `git config user.name/user.email` | 确认 git author 使用 `offic0600 <offic0600@163.com>` |
   129|| 修改 | `frontend/src/lib/routes.test.tsx` | 将 `getIssue(...)` 失败场景测试标题从 `falls back to the shared empty props contract when getIssue rejects in the legacy /issues/[id] route` 收口为 `renders the shared empty props contract when getIssue rejects in the legacy /issues/[id] route`，用 `renders` 明确 route 渲染层语义，同时保持 `getOrganizations()` 失败标题、共享断言、fixture 设置与 helper/route 运行时逻辑不变 |
   130|| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：routes seam 定向测试 5 files / 57 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
   131|| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
   132|| 提交 | `git commit -m "[verified] test: stabilize route empty props verb"` | 完成本轮 feature/work commit，得到真实提交 `c7433ece307598eb16eead907bb38fd66ae86080` |
   133|| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-46` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-47`：评估 `getOrganizations()` 失败场景标题是否也应按 route render 语义从 `falls back` 收口为 `renders` |
   134|
   135|### 167.2 本轮落地结果
   136|
   137|- 已复核 `getIssue(...)` / `getOrganizations()` 两条 API 失败场景都属于 route 级渲染 legacy `/issues/[id]` route 后，再断言 `IssueDetailPage` 收到共享空 props contract 的语义层，而不是 helper 返回值 contract。
   138|- `getIssue(...)` 失败场景测试标题现已由 `falls back to the shared empty props contract when getIssue rejects in the legacy /issues/[id] route` 收口为 `renders the shared empty props contract when getIssue rejects in the legacy /issues/[id] route`，以 `renders` 明确 route 渲染层语义。
   139|- `getOrganizations()` 失败场景标题、`expectLegacyIssueRouteEmptyPropsContract()` 共享断言、fixture 设置以及 helper/route 运行时逻辑均保持不变；`docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-46` -> `done`，下一轮转入 `IMP-47`，继续评估第二条 API 失败标题是否也应同步收口。
   140|
   141|### 167.3 经验沉淀
   142|
   143|- 当 route 级测试实际是在渲染 legacy route 后断言 page props contract 时，优先使用 `renders ...` 比 `falls back ...` 更能稳定表达当前 seam 的语义层；`falls back` 更适合描述 helper/lookup 返回值或内部降级动作，而非最终 route render 观察面。
   144|- 对并列的 API 失败场景文案收口，仍应一次只动一处标题；先稳定第一条 route 级标题，再决定是否需要让第二条失败标题同步追平。
   145|
   146|### 167.4 关键数据快照
   147|
   148|| 指标 | 值 |
   149||------|-----|
   150|| 当前 lane / task | `Implementation / IMP-46 → IMP-47` |
   151|| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `a94e40daf62199adae19d8ea0b194026e4b6b685` |
   152|| feature commit | `c7433ece307598eb16eead907bb38fd66ae86080` |
   153|| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 57 tests） |
   154|| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
   155|| Diff 检查 | `git diff --check` ✅ |
   156|
   157|## Session 166 — 2026-04-20：将 helper 级 workspace slug miss 场景测试标题收口为 returns 语义
   158|
   159|**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-45`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 helper/route 两个 workspace slug miss empty props contract 场景当前 `falls back` / `renders` 动词是否仍需进一步统一；若可行，则只改第一处安全的测试文案并完成验证、review、提交、状态回写与 push 闭环。
   160|
   161|### 166.1 实施内容
   162|
   163|| 操作 | 文件 | 说明 |
   164||------|------|------|
   165|| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、执行前 HEAD `2631c691bc4574ea1121e64f889d34ec3a8940fa`，工作树起始干净，可安全继续单一 implementation execution unit |
   166|| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` / `frontend/src/lib/routes.test.tsx` | 恢复唯一状态源、lane 明细、roadmap 与日志/工时回写要求，确认本轮只允许推进 `IMP-45`，且最小切口是先稳定 helper/route 动词边界 |
   167|| 配置 | `git config user.name/user.email` | 确认 git author 使用 `offic0600 <offic0600@163.com>` |
   168|| 修改 | `frontend/src/lib/routes.test.tsx` | 将 helper 级 workspace slug miss 场景测试标题从 `falls back to the empty props contract when the helper workspace slug lookup misses` 收口为 `returns the empty props contract when the helper workspace slug lookup misses`，用 `returns` 明确 helper 返回值语义，同时保持 route 级 `renders ...` 标题、共享断言、fixture 设置与 helper/route 运行时逻辑不变 |
   169|| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：routes seam 定向测试 5 files / 57 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
   170|| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改 helper 级测试标题文案，不改 helper/route 运行时逻辑、共享断言结构或第二个 execution unit；review 结论为通过 |
   171|| 提交 | `git commit -m "[verified] test: stabilize helper empty props verb"` | 完成本轮 feature/work commit，得到真实提交 `a94e40daf62199adae19d8ea0b194026e4b6b685` |
   172|| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-45` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-46`：评估 legacy `/issues/[id]` route 两条 API 失败场景测试标题中的 shared empty props contract wording 是否需按 helper/route 层级进一步统一动词 |
   173|
   174|### 166.2 本轮落地结果
   175|
   176|- 已复核 helper/route 两个 workspace slug miss 场景的层级差异：helper 级是在直接断言 `buildIssueDetailRouteBackLinkProps(...)` 返回空对象 contract，route 级是在渲染 legacy `/issues/[id]` route 后断言 `IssueDetailPage` 收到空 props contract。
   177|- helper 级 workspace slug miss 场景测试标题现已由 `falls back to the empty props contract when the helper workspace slug lookup misses` 收口为 `returns the empty props contract when the helper workspace slug lookup misses`，以 `returns` 明确 helper 返回值语义。
   178|- route 级 `renders the empty props contract when the workspace slug lookup misses` 标题、`expectLegacyIssueDetailRouteEmptyProps()` / `expectLegacyIssueRouteEmptyPropsContract()` 共享断言、fixture 设置以及 helper/route 运行时逻辑均保持不变；`docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-45` -> `done`，下一轮转入 `IMP-46`，继续评估 route 级 API 失败场景动词是否还需进一步稳定。
   179|
   180|### 166.3 经验沉淀
   181|
   182|- 当 helper 级与 route 级场景已经通过 `returns` / `renders` 分别稳定在“返回值断言”与“渲染结果断言”两层语义后，不必强行统一成同一个动词；优先保持层级边界清晰。
   183|- 对成对 helper/route 场景的测试文案收口，仍应一次只动一处标题；先稳定 helper 的返回值动词，再决定下一轮是否需要扩展到 route 级 API 失败文案。
   184|
   185|### 166.4 关键数据快照
   186|
   187|| 指标 | 值 |
   188||------|-----|
   189|| 当前 lane / task | `Implementation / IMP-45 → IMP-46` |
   190|| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `2631c691bc4574ea1121e64f889d34ec3a8940fa` |
   191|| feature commit | `a94e40daf62199adae19d8ea0b194026e4b6b685` |
   192|| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 57 tests） |
   193|| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
   194|| Diff 检查 | `git diff --check` ✅ |
   195|
   196|## Session 165 — 2026-04-20：为 helper 级 workspace slug miss 场景测试标题补上 helper lookup 语义
   197|
   198|**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-44`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 helper 级 workspace slug miss 场景测试标题是否需要补上 helper lookup seam 语义，以避免与 route 级 `renders ...` wording 混淆；若可行，则只改 helper 级这一处标题并完成验证、review、提交、状态回写与 push 闭环。
   199|
   200|### 165.1 实施内容
   201|
   202|| 操作 | 文件 | 说明 |
   203||------|------|------|
   204|| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、执行前 HEAD `ac3c4b66e26c26f6c8bd1052c79734fb276eb098`，工作树起始仅含上轮 docs/state 闭环残留，可按同 lane docs 收口继续本轮 implementation execution unit |
   205|| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `frontend/src/lib/routes.test.tsx` | 恢复唯一状态源、lane 明细与 roadmap，确认本轮只允许推进 `IMP-44`，且最小切口是先补 helper 级标题中的 helper lookup seam 语义 |
   206|| 修改 | `frontend/src/lib/routes.test.tsx` | 将 helper 级 workspace slug miss 场景测试标题从 `falls back to the empty props contract when the workspace slug lookup misses` 收口为 `falls back to the empty props contract when the helper workspace slug lookup misses`，用 `helper workspace slug lookup` 明确 helper seam 语义，同时保持 route 级 `renders ...` 标题、共享断言、fixture 设置与 helper/route 运行时逻辑不变 |
   207|| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：routes seam 定向测试 5 files / 57 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
   208|| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改 helper 级测试标题文案，不改 helper/route 运行时逻辑、共享断言结构或第二个 execution unit；review 结论为通过 |
   209|| 提交 | `git commit -m "[verified] test: clarify helper lookup wording"` | 完成本轮 feature/work commit，得到真实提交 `16d553aeba2912567b39999bbc523135c8b215c4` |
   210|| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-44` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-45`：评估 helper/route 两个 workspace slug miss 场景当前 `falls back` / `renders` 动词风格是否仍需进一步统一或稳定 |
   211|
   212|### 165.2 本轮落地结果
   213|
   214|- 已确认 helper 级 workspace slug miss 场景是在直接断言 `buildIssueDetailRouteBackLinkProps(...)` helper lookup 返回空对象，而非 route render 层。
   215|- helper 级 workspace slug miss 场景测试标题现已由 `falls back to the empty props contract when the workspace slug lookup misses` 收口为 `falls back to the empty props contract when the helper workspace slug lookup misses`，以 `helper workspace slug lookup` 明确 helper seam 语义。
   216|- route 级 `renders the empty props contract when the workspace slug lookup misses` 标题、`expectLegacyIssueDetailRouteEmptyProps()` / `expectLegacyIssueRouteEmptyPropsContract()` 共享断言、fixture 设置以及 helper/route 运行时逻辑均保持不变；`docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-44` -> `done`，下一轮转入 `IMP-45`，继续评估 helper/route 场景动词风格是否还需进一步统一。
   217|
   218|### 165.3 经验沉淀
   219|
   220|- 当 helper 级与 route 级测试标题已通过 `renders` 拉开 route render 层语义后，可继续让 helper 级标题显式写出 `helper ... lookup` seam，避免未来阅读时把 helper lookup fallback 与 route render contract 混读。
   221|- 对成对 helper/route 场景的测试文案收口，仍应一次只动一处标题；先稳定层级边界，再决定下一轮是否还需统一动词风格。
   222|
   223|### 165.4 关键数据快照
   224|
   225|| 指标 | 值 |
   226||------|-----|
   227|| 当前 lane / task | `Implementation / IMP-44 → IMP-45` |
   228|| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `ac3c4b66e26c26f6c8bd1052c79734fb276eb098` |
   229|| feature commit | `16d553aeba2912567b39999bbc523135c8b215c4` |
   230|| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 57 tests） |
   231|| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
   232|| Diff 检查 | `git diff --check` ✅ |
   233|
   234|## Session 164 — 2026-04-20：为 route 级 workspace slug miss 场景测试标题补上 render 层语义区分
   235|
   236|**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-43`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 helper/route 两个已统一为 `empty props contract when the workspace slug lookup misses` 的场景测试标题是否仍需保留层级区分；若可行，则只改第一处可安全收口的 route 级测试文案并完成验证、review、提交、状态回写与 push 闭环。
   237|
   238|### 164.1 实施内容
   239|
   240|| 操作 | 文件 | 说明 |
   241||------|------|------|
   242|| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、执行前 HEAD `892b778305445e4c021282091bd68e9f90558e04`，工作树起始干净，可安全继续单一 implementation execution unit |
   243|| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` / `frontend/src/lib/routes.test.tsx` | 恢复唯一状态源、lane 明细、roadmap 与日志/工时回写要求，确认本轮只允许推进 `IMP-43`，且最小切口是先验证 helper/route 标题是否需要保留层级区分 |
   244|| 配置 | `git config user.name/user.email` | 确认 git author 使用 `offic0600 <offic0600@163.com>` |
   245|| 修改 | `frontend/src/lib/routes.test.tsx` | 将 route 级 workspace slug miss 场景测试标题从 `falls back to the empty props contract when the workspace slug lookup misses` 收口为 `renders the empty props contract when the workspace slug lookup misses`，以 `renders` 明确 route 渲染层语义，同时保持 helper 级标题、共享断言、fixture 设置与 helper/route 运行时逻辑不变 |
   246|| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：routes seam 定向测试 5 files / 57 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
   247|| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改 route 级测试标题文案，不改 helper/route 运行时逻辑、共享断言结构或第二个 execution unit；review 结论为通过 |
   248|| 提交 | `git commit -m "[verified] test: split empty props wording"` | 完成本轮 feature/work commit，得到真实提交 `ac3c4b66e26c26f6c8bd1052c79734fb276eb098` |
   249|| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-43` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-44`：评估 helper 级 workspace slug miss 场景标题是否需要补上 helper lookup 语义以继续拉开与 route 级 render wording 的区分 |
   250|
   251|### 164.2 本轮落地结果
   252|
   253|- 已确认 helper/route 两个 workspace slug miss 场景虽然都围绕 empty props contract，但 helper 级是在直接断言 lookup helper 返回空对象，route 级是在渲染 legacy `/issues/[id]` route 后断言 `IssueDetailPage` 收到空 props contract。
   254|- route 级 workspace slug miss 场景测试标题现已由 `falls back to the empty props contract when the workspace slug lookup misses` 收口为 `renders the empty props contract when the workspace slug lookup misses`，以 `renders` 明确 route 渲染层语义。
   255|- helper 级标题、`expectLegacyIssueDetailRouteEmptyProps()` / `expectLegacyIssueRouteEmptyPropsContract()` 共享断言、fixture 设置以及 helper/route 运行时逻辑均保持不变；`docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-43` -> `done`，下一轮转入 `IMP-44`，继续评估 helper 级标题是否应补上 lookup seam 语义。
   256|
   257|### 164.3 经验沉淀
   258|
   259|- 当 helper 级与 route 级测试标题已收口到相同 empty props wording 时，可优先让 route 级标题显式表达 render 层语义，避免未来继续阅读时把 helper lookup seam 与 route render seam 混为同一层。
   260|- 对成对 helper/route 场景的测试文案收口，仍应一次只动一处标题；先拉开层级区分，再决定下一轮是否需要回补 helper lookup 语义。
   261|
   262|### 164.4 关键数据快照
   263|
   264|| 指标 | 值 |
   265||------|-----|
   266|| 当前 lane / task | `Implementation / IMP-43 → IMP-44` |
   267|| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `892b778305445e4c021282091bd68e9f90558e04` |
   268|| feature commit | `ac3c4b66e26c26f6c8bd1052c79734fb276eb098` |
   269|| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 57 tests） |
   270|| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
   271|| Diff 检查 | `git diff --check` ✅ |
   272|
   273|## Session 163 — 2026-04-20：去掉 route 级 workspace slug miss 场景测试标题里的重复 shared wording
   274|
   275|**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-42`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 route 级已使用 `shared empty props contract` 的 workspace slug miss 场景测试标题是否仍存在可安全压缩的重复 wording；若可行，则只改这一处 route 级测试文案并完成验证、review、提交、状态回写与 push 闭环。
   276|
   277|### 163.1 实施内容
   278|
   279|| 操作 | 文件 | 说明 |
   280||------|------|------|
   281|| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、执行前 HEAD `6877c4ea9c5a9faf577daf2ce13f4273564e1779`，工作树起始干净，可安全继续单一 implementation execution unit |
   282|| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` / `frontend/src/lib/routes.test.tsx` | 恢复唯一状态源、lane 明细、roadmap 与日志/工时回写要求，确认本轮只允许推进 `IMP-42`，且最小切口是先去掉 route 级测试标题与 route 级共享空 props contract 断言重复表达的 `shared` wording |
   283|| 配置 | `git config user.name/user.email` | 确认 git author 使用 `offic0600 <offic0600@163.com>` |
   284|| 修改 | `frontend/src/lib/routes.test.tsx` | 将 route 级 workspace slug miss 场景测试标题从 `falls back to the shared empty props contract when the workspace slug lookup misses` 收口为 `falls back to the empty props contract when the workspace slug lookup misses`，去掉与 route 级共享空 props contract 断言重复表达的 `shared` wording，同时保持 helper 级标题、共享断言、fixture 设置与 helper/route 运行时逻辑不变 |
   285|| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：routes seam 定向测试 5 files / 57 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
   286|| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改 route 级测试标题文案，不改 helper/route 运行时逻辑、共享断言结构或第二个 execution unit；review 结论为通过 |
   287|| 提交 | `git commit -m "[verified] test: trim repeated route wording"` | 完成本轮 feature/work commit，提交后需把真实 SHA 写回状态文件 |
   288|| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-42` 写回 done，记录真实 feature SHA，并新增下一轮最小 pending implementation 任务 |
   289|
   290|### 163.2 本轮落地结果
   291|
   292|- route 级 workspace slug miss 场景测试标题现已由 `falls back to the shared empty props contract when the workspace slug lookup misses` 收口为 `falls back to the empty props contract when the workspace slug lookup misses`。
   293|- route 级标题不再重复表达 `shared` wording；helper 级标题、`expectLegacyIssueDetailRouteEmptyProps()` / `expectLegacyIssueRouteEmptyPropsContract()` 共享断言、fixture 设置以及 helper/route 运行时逻辑均保持不变。
   294|- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 需写回：`IMP-42` -> `done`，下一轮继续只推进一个新的 implementation 最小增量。
   295|
   296|### 163.3 经验沉淀
   297|
   298|- 当 route 级共享断言 helper 已在命名/contract 中明确表达 empty props 语义时，可优先去掉测试标题中重复的 `shared` 修饰，减少 route 场景文案噪音并保留真正有区分度的失败模式描述。
   299|- 对 helper/route 成对场景的测试文案收口，应继续一次只动一处标题，避免同轮同时压缩多处 wording 而扩大 execution unit 边界。
   300|
   301|### 163.4 关键数据快照
   302|
   303|| 指标 | 值 |
   304||------|-----|
   305|| 当前 lane / task | `Implementation / IMP-42` |
   306|| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `6877c4ea9c5a9faf577daf2ce13f4273564e1779` |
   307|| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 57 tests） |
   308|| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
   309|| Diff 检查 | `git diff --check` ✅ |
   310|
   311|## Session 162 — 2026-04-20：去掉 helper 级 workspace slug miss 场景测试标题里的重复 shared wording
   312|
   313|**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-41`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 helper/route 两个已统一为 `workspace slug lookup misses` 的 shared empty props contract 场景测试标题是否仍存在可安全压缩的重复 wording；若可行，则只改第一处可安全收口的 helper 级测试文案并完成验证、review、提交、状态回写与 push 闭环。
   314|
   315|### 162.1 实施内容
   316|
   317|| 操作 | 文件 | 说明 |
   318||------|------|------|
   319|| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、执行前 HEAD `4f6d643b902bdf348144b60413ea3710dd8f0549`，工作树起始干净，可安全继续单一 implementation execution unit |
   320|| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` / `frontend/src/lib/routes.test.tsx` | 恢复唯一状态源、lane 明细、roadmap 与日志/工时回写要求，确认本轮只允许推进 `IMP-41`，且最小切口是先去掉 helper 级测试标题与 helper 名称重复表达的 `shared` wording |
   321|| 配置 | `git config user.name/user.email` | 确认 git author 使用 `offic0600 <offic0600@163.com>` |
   322|| 修改 | `frontend/src/lib/routes.test.tsx` | 将 helper 级 workspace slug miss 场景测试标题从 `falls back to the shared empty props contract when the workspace slug lookup misses` 收口为 `falls back to the empty props contract when the workspace slug lookup misses`，去掉与 `expectLegacyIssueDetailRouteEmptyProps()` 重复表达的 `shared` wording，同时保持 route 级标题、共享断言、fixture 设置与 helper/route 运行时逻辑不变 |
   323|| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：routes seam 定向测试 5 files / 57 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
   324|| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改 helper 级测试标题文案，不改 route/helper 运行时逻辑、共享断言结构或第二个 execution unit；review 结论为通过 |
   325|| 提交 | `git commit -m "[verified] test: trim repeated shared wording"` | 完成本轮 feature/work commit，得到真实提交 `eb48a219a88391c28c95da2500f95b0ed69a42ca` |
   326|| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-41` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-42`：评估 route 级 shared empty props contract workspace slug miss 场景测试标题是否还可继续去掉重复 wording |
   327|
   328|### 162.2 本轮落地结果
   329|
   330|- helper 级 workspace slug miss 场景测试标题现已由 `falls back to the shared empty props contract when the workspace slug lookup misses` 收口为 `falls back to the empty props contract when the workspace slug lookup misses`。
   331|- helper 级标题不再重复表达 `shared` wording；route 级标题、`expectLegacyIssueDetailRouteEmptyProps()` / `expectLegacyIssueRouteEmptyPropsContract()` 共享断言、fixture 设置以及 helper/route 运行时逻辑均保持不变。
   332|- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-41` -> `done`，下一轮转入 `IMP-42`，继续评估 route 级 shared empty props contract 场景标题是否可进一步收口重复 wording。
   333|
   334|### 162.3 经验沉淀
   335|
   336|- 当 helper 级断言 helper 已在命名中显式表达 shared/empty props 语义时，可优先去掉测试标题中重复的 `shared` 修饰，减少文案噪音并保留真正有区分度的失败模式描述。
   337|- 对 helper/route 成对场景的测试文案收口，仍应一次只动一处标题，避免同轮同时压缩两处 wording 而扩大 execution unit 边界。
   338|
   339|### 162.4 关键数据快照
   340|
   341|| 指标 | 值 |
   342||------|-----|
   343|| 当前 lane / task | `Implementation / IMP-41 → IMP-42` |
   344|| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `4f6d643b902bdf348144b60413ea3710dd8f0549` |
   345|| feature commit | `eb48a219a88391c28c95da2500f95b0ed69a42ca` |
   346|| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 57 tests） |
   347|| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
   348|| Diff 检查 | `git diff --check` ✅ |
   349|
   350|## Session 161 — 2026-04-20：统一 helper 级 workspace slug miss 场景测试标题的 lookup miss wording
   351|
   352|**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-40`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 helper 级 `cannot resolve a workspace slug` 与 route 级 `workspace slug lookup misses` 两个 workspace slug miss 场景测试标题是否仍可安全统一为更一致的 lookup miss wording；若可行，则只改第一处可安全收口的 helper 级测试文案并完成验证、review、提交、状态回写与 push 闭环。
   353|
   354|### 161.1 实施内容
   355|
   356|| 操作 | 文件 | 说明 |
   357||------|------|------|
   358|| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、执行前 HEAD `9624f1b65860b18e13bf2e88e687b8df172e1660`，工作树起始干净，可安全继续单一 implementation execution unit |
   359|| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` / `frontend/src/lib/routes.test.tsx` | 恢复唯一状态源、lane 明细、roadmap 与日志/工时回写要求，确认本轮只允许推进 `IMP-40`，且最小切口是先把 helper 级 workspace slug miss 场景测试标题统一到 route 级已使用的 lookup miss wording |
   360|| 配置 | `git config user.name/user.email` | 确认 git author 使用 `offic0600 <offic0600@163.com>` |
   361|| 修改 | `frontend/src/lib/routes.test.tsx` | 将 helper 级 workspace slug miss 场景测试标题从 `falls back to the shared empty props contract when the legacy lookup seam cannot resolve a workspace slug` 收口为 `falls back to the shared empty props contract when the workspace slug lookup misses`，使 helper/route 两处场景统一为相同 lookup miss wording，同时保持共享断言、fixture 设置与 helper/route 运行时逻辑不变 |
   362|| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：routes seam 定向测试 5 files / 57 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
   363|| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改 helper 级测试标题文案，不改 route/helper 运行时逻辑、共享断言结构或第二个 execution unit；review 结论为通过 |
   364|| 提交 | `git commit -m "[verified] test: unify lookup miss wording"` | 完成本轮 feature/work commit，得到真实提交 `a8cced7a015982c6b370efe3be181305a6663161` |
   365|| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-40` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-41`：评估 helper/route 两个 shared empty props contract workspace slug miss 场景测试标题是否还可继续去掉重复 wording |
   366|
   367|### 161.2 本轮落地结果
   368|
   369|- helper 级 workspace slug miss 场景测试标题现已由 `falls back to the shared empty props contract when the legacy lookup seam cannot resolve a workspace slug` 收口为 `falls back to the shared empty props contract when the workspace slug lookup misses`。
   370|- helper 级与 route 级两个 workspace slug miss 场景现在统一使用相同 lookup miss wording；`expectLegacyIssueDetailRouteEmptyProps()`、`expectLegacyIssueRouteEmptyPropsContract()`、fixture 设置以及 helper/route 运行时逻辑均保持不变。
   371|- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-40` -> `done`，下一轮转入 `IMP-41`，继续评估两个已统一标题里是否仍存在可安全压缩的重复 wording。
   372|
   373|### 161.3 经验沉淀
   374|
   375|- 对连续多轮只处理测试文案噪音的 execution unit，应优先让同类失败模式先统一 wording，再继续评估是否能压缩 shared contract 前缀或其他重复修饰，避免同轮跨多个语义层次同时收口。
   376|- 当 helper 级与 route 级场景已经表达同一 workspace slug miss 失败模式时，可优先把二者统一为相同 lookup miss wording，以减少后续继续审查标题差异时的噪音。
   377|
   378|### 161.4 关键数据快照
   379|
   380|| 指标 | 值 |
   381||------|-----|
   382|| 当前 lane / task | `Implementation / IMP-40 → IMP-41` |
   383|| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `9624f1b65860b18e13bf2e88e687b8df172e1660` |
   384|| feature commit | `a8cced7a015982c6b370efe3be181305a6663161` |
   385|| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 57 tests） |
   386|| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
   387|| Diff 检查 | `git diff --check` ✅ |
   388|
   389|## Session 160 — 2026-04-20：去掉 legacy `/issues/[id]` route route 级 workspace slug miss 场景测试标题中的重复路径 wording
   390|
   391|**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-39`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route route 级 workspace slug miss 场景测试标题中的重复 `legacy /issues/[id] route` 路径 wording 是否仍可安全去掉；若可行，则只做一刀测试文案收口并完成验证、review、提交、状态回写与 push 闭环。
   392|
   393|### 160.1 实施内容
   394|
   395|| 操作 | 文件 | 说明 |
   396||------|------|------|
   397|| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、执行前 HEAD `c3b68e3513d7ce33a5729d2c35cd503aafeb56d3`，工作树存在 docs 状态写回遗留脏变更，但均属于上一轮 `IMP-38` docs/state 收口范围，可在本轮沿用并闭环，不涉及其他 lane 残留实现风险 |
   398|| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` / `frontend/src/lib/routes.test.tsx` | 恢复唯一状态源、lane 明细、roadmap 与日志/工时回写要求，结合 implementation lane 明细确认本轮只允许推进 `IMP-39`，且最小切口是 route 级 workspace slug miss 场景标题去掉重复路径 wording |
   399|| 配置 | `git config user.name/user.email` | 确认 git author 使用 `offic0600 <offic0600@163.com>` |
   400|| 修改 | `frontend/src/lib/routes.test.tsx` | 将 route 级 workspace slug miss 场景测试标题从 `falls back to the shared empty props contract when the legacy /issues/[id] route workspace slug lookup misses` 收口为 `falls back to the shared empty props contract when the workspace slug lookup misses`，去掉重复路径 wording，同时保持共享断言、helper/route 运行时逻辑与断言结构不变 |
   401|| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：routes seam 定向测试 5 files / 57 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
   402|| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改 route 级测试标题文案，不改 helper/route 运行时逻辑、共享断言结构或第二个 execution unit；review 结论为通过 |
   403|| 提交 | `git commit -m "[verified] test: trim legacy route path wording"` | 完成本轮 feature/work commit，得到真实提交 `468b79ac1fd0e4f93bb3d484e446a401fbad9cfd` |
   404|| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-39` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-40`：评估 helper/route 两个 workspace slug miss 场景标题是否还可继续统一 lookup miss wording |
   405|
   406|### 160.2 本轮落地结果
   407|
   408|- route 级 workspace slug miss 场景测试标题现已由包含重复路径说明的长句，收口为 `falls back to the shared empty props contract when the workspace slug lookup misses`。
   409|- `expectLegacyIssueRouteEmptyPropsContract()` 共享断言、`expectLegacyIssueDetailRouteEmptyProps()` helper、fixture 设置以及 helper/route 运行时逻辑均保持不变；本轮作用面仅限 route 级测试文案收口。
   410|- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-39` -> `done`，下一轮转入 `IMP-40`，继续评估 helper/route 两个 workspace slug miss 场景标题是否可进一步统一 lookup miss wording。
   411|
   412|### 160.3 经验沉淀
   413|
   414|- 当 shared empty props contract 已明确承载 route 语义时，可继续去掉测试标题里重复的具体 legacy 路径，以降低文案噪音并保留真正有区分度的失败模式描述。
   415|- 对连续多轮只处理测试命名噪音的 execution unit，应继续把 helper wording、route wording、lookup miss wording 分拆处理，避免同轮跨多处标题一起收口而扩大边界。
   416|
   417|### 160.4 关键数据快照
   418|
   419|| 指标 | 值 |
   420||------|-----|
   421|| 当前 lane / task | `Implementation / IMP-39 → IMP-40` |
   422|| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `c3b68e3513d7ce33a5729d2c35cd503aafeb56d3` |
   423|| feature commit | `468b79ac1fd0e4f93bb3d484e446a401fbad9cfd` |
   424|| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 57 tests） |
   425|| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
   426|| Diff 检查 | `git diff --check` ✅ |
   427|
   428|## Session 159 — 2026-04-20：收口 legacy lookup seam wording 于 helper 级 shared empty props contract 场景测试标题
   429|
   430|**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-38`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 helper/route 两个 shared empty props contract 场景测试标题中保留的 `shared legacy lookup seam` wording 是否仍可安全继续收口；若可行，则只改第一处可安全收口的 helper 级测试标题并完成验证、review、提交、状态回写与 push 闭环。
   431|
   432|### 159.1 实施内容
   433|
   434|| 操作 | 文件 | 说明 |
   435||------|------|------|
   436|| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、执行前 HEAD `3dfc1b624248ad98cf0fef6a2c3e1cc6ffe50c3b`，工作树起始干净，可安全继续单一 implementation execution unit |
   437|| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` / `frontend/src/lib/routes.test.tsx` | 恢复唯一状态源、lane 明细、roadmap 与日志/工时回写要求，确认本轮只允许推进 `IMP-38`，且最小切口是先收口 helper 级 shared empty props contract 标题里的 `shared legacy lookup seam` wording |
   438|| 配置 | `git config user.name/user.email` | 确认 git author 使用 `offic0600 <offic0600@163.com>` |
   439|| 修改 | `frontend/src/lib/routes.test.tsx` | 将 helper 级 workspace slug miss 场景测试标题改为 `falls back to the shared empty props contract when the legacy lookup seam cannot resolve a workspace slug`，去掉重复的 `shared legacy lookup seam` wording，同时保持共享 helper、断言与运行时逻辑不变 |
   440|| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：routes seam 定向测试 5 files / 57 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
   441|| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改 helper 级测试标题文案，不改 route/helper 运行时逻辑、共享断言结构或第二个 execution unit；review 结论为通过 |
   442|| 提交 | `git commit -m "[verified] test: trim legacy lookup seam wording"` | 完成本轮 feature/work commit，得到真实提交 `c3b68e3513d7ce33a5729d2c35cd503aafeb56d3` |
   443|| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-38` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-39`：评估 route 级 workspace slug miss 场景测试标题是否还可继续去掉重复 `legacy /issues/[id] route` 路径 wording |
   444|
   445|### 159.2 本轮落地结果
   446|
   447|- helper 级 workspace slug miss 场景测试标题现已由 `shared legacy lookup seam` 收口为 `legacy lookup seam`，不再重复携带 `shared`。
   448|- `expectLegacyIssueDetailRouteEmptyProps()` helper、route 级 `expectLegacyIssueRouteEmptyPropsContract()` 共享断言、fixture 设置以及 route/helper 运行时逻辑均保持不变；本轮作用面仅限测试文案收口。
   449|- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-38` -> `done`，下一轮转入 `IMP-39`，继续评估 route 级 shared empty props contract 场景标题中的重复路径 wording 是否可进一步收口。
   450|
   451|### 159.3 经验沉淀
   452|
   453|- 对连续多轮只处理测试文案噪音的 execution unit，应继续把 helper 标题与 route 标题拆分处理，避免同轮跨两处 wording 收口导致边界扩大。
   454|- 当测试标题已显式表达 shared empty props contract 时，可优先移除后半句中重复修饰 seam 的冗余前缀，再保留真正承载定位含义的 route/path wording 给下一轮继续评估。
   455|
   456|### 159.4 关键数据快照
   457|
   458|| 指标 | 值 |
   459||------|-----|
   460|| 当前 lane / task | `Implementation / IMP-38 → IMP-39` |
   461|| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `3dfc1b624248ad98cf0fef6a2c3e1cc6ffe50c3b` |
   462|| feature commit | `c3b68e3513d7ce33a5729d2c35cd503aafeb56d3` |
   463|| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 57 tests） |
   464|| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
   465|| Diff 检查 | `git diff --check` ✅ |
   466|