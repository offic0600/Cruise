## Session 167 — 2026-04-20：将 route 级 getIssue API 失败场景测试标题收口为 renders 语义

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-46`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前 `falls back to the shared empty props contract ...` 标题是否仍需按 route render 层稳定动词；若可行，则只改第一处安全的测试文案并完成验证、review、提交、状态回写与 push 闭环。

### 167.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、执行前 HEAD `a94e40daf62199adae19d8ea0b194026e4b6b685`，工作树仅含上轮同 lane docs/state 闭环残留，可在同一 execution unit 中继续收口 |
| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` / `frontend/src/lib/routes.test.tsx` | 恢复唯一状态源、lane 明细、roadmap 与日志/工时回写要求，确认本轮只允许推进 `IMP-46`，且最小切口是先稳定第一条 route 级 API 失败标题的 render 语义 |
| 配置 | `git config user.name/user.email` | 确认 git author 使用 `offic0600 <offic0600@163.com>` |
| 修改 | `frontend/src/lib/routes.test.tsx` | 将 `getIssue(...)` 失败场景测试标题从 `falls back to the shared empty props contract when getIssue rejects in the legacy /issues/[id] route` 收口为 `renders the shared empty props contract when getIssue rejects in the legacy /issues/[id] route`，用 `renders` 明确 route 渲染层语义，同时保持 `getOrganizations()` 失败标题、共享断言、fixture 设置与 helper/route 运行时逻辑不变 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：routes seam 定向测试 5 files / 57 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: stabilize route empty props verb"` | 完成本轮 feature/work commit，得到真实提交 `c7433ece307598eb16eead907bb38fd66ae86080` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-46` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-47`：评估 `getOrganizations()` 失败场景标题是否也应按 route render 语义从 `falls back` 收口为 `renders` |

### 167.2 本轮落地结果

- 已复核 `getIssue(...)` / `getOrganizations()` 两条 API 失败场景都属于 route 级渲染 legacy `/issues/[id]` route 后，再断言 `IssueDetailPage` 收到共享空 props contract 的语义层，而不是 helper 返回值 contract。
- `getIssue(...)` 失败场景测试标题现已由 `falls back to the shared empty props contract when getIssue rejects in the legacy /issues/[id] route` 收口为 `renders the shared empty props contract when getIssue rejects in the legacy /issues/[id] route`，以 `renders` 明确 route 渲染层语义。
- `getOrganizations()` 失败场景标题、`expectLegacyIssueRouteEmptyPropsContract()` 共享断言、fixture 设置以及 helper/route 运行时逻辑均保持不变；`docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-46` -> `done`，下一轮转入 `IMP-47`，继续评估第二条 API 失败标题是否也应同步收口。

### 167.3 经验沉淀

- 当 route 级测试实际是在渲染 legacy route 后断言 page props contract 时，优先使用 `renders ...` 比 `falls back ...` 更能稳定表达当前 seam 的语义层；`falls back` 更适合描述 helper/lookup 返回值或内部降级动作，而非最终 route render 观察面。
- 对并列的 API 失败场景文案收口，仍应一次只动一处标题；先稳定第一条 route 级标题，再决定是否需要让第二条失败标题同步追平。

### 167.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-46 → IMP-47` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `a94e40daf62199adae19d8ea0b194026e4b6b685` |
| feature commit | `c7433ece307598eb16eead907bb38fd66ae86080` |
| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 57 tests） |
| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
| Diff 检查 | `git diff --check` ✅ |

## Session 166 — 2026-04-20：将 helper 级 workspace slug miss 场景测试标题收口为 returns 语义

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-45`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 helper/route 两个 workspace slug miss empty props contract 场景当前 `falls back` / `renders` 动词是否仍需进一步统一；若可行，则只改第一处安全的测试文案并完成验证、review、提交、状态回写与 push 闭环。

### 166.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、执行前 HEAD `2631c691bc4574ea1121e64f889d34ec3a8940fa`，工作树起始干净，可安全继续单一 implementation execution unit |
| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` / `frontend/src/lib/routes.test.tsx` | 恢复唯一状态源、lane 明细、roadmap 与日志/工时回写要求，确认本轮只允许推进 `IMP-45`，且最小切口是先稳定 helper/route 动词边界 |
| 配置 | `git config user.name/user.email` | 确认 git author 使用 `offic0600 <offic0600@163.com>` |
| 修改 | `frontend/src/lib/routes.test.tsx` | 将 helper 级 workspace slug miss 场景测试标题从 `falls back to the empty props contract when the helper workspace slug lookup misses` 收口为 `returns the empty props contract when the helper workspace slug lookup misses`，用 `returns` 明确 helper 返回值语义，同时保持 route 级 `renders ...` 标题、共享断言、fixture 设置与 helper/route 运行时逻辑不变 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：routes seam 定向测试 5 files / 57 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改 helper 级测试标题文案，不改 helper/route 运行时逻辑、共享断言结构或第二个 execution unit；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: stabilize helper empty props verb"` | 完成本轮 feature/work commit，得到真实提交 `a94e40daf62199adae19d8ea0b194026e4b6b685` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-45` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-46`：评估 legacy `/issues/[id]` route 两条 API 失败场景测试标题中的 shared empty props contract wording 是否需按 helper/route 层级进一步统一动词 |

### 166.2 本轮落地结果

- 已复核 helper/route 两个 workspace slug miss 场景的层级差异：helper 级是在直接断言 `buildIssueDetailRouteBackLinkProps(...)` 返回空对象 contract，route 级是在渲染 legacy `/issues/[id]` route 后断言 `IssueDetailPage` 收到空 props contract。
- helper 级 workspace slug miss 场景测试标题现已由 `falls back to the empty props contract when the helper workspace slug lookup misses` 收口为 `returns the empty props contract when the helper workspace slug lookup misses`，以 `returns` 明确 helper 返回值语义。
- route 级 `renders the empty props contract when the workspace slug lookup misses` 标题、`expectLegacyIssueDetailRouteEmptyProps()` / `expectLegacyIssueRouteEmptyPropsContract()` 共享断言、fixture 设置以及 helper/route 运行时逻辑均保持不变；`docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-45` -> `done`，下一轮转入 `IMP-46`，继续评估 route 级 API 失败场景动词是否还需进一步稳定。

### 166.3 经验沉淀

- 当 helper 级与 route 级场景已经通过 `returns` / `renders` 分别稳定在“返回值断言”与“渲染结果断言”两层语义后，不必强行统一成同一个动词；优先保持层级边界清晰。
- 对成对 helper/route 场景的测试文案收口，仍应一次只动一处标题；先稳定 helper 的返回值动词，再决定下一轮是否需要扩展到 route 级 API 失败文案。

### 166.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-45 → IMP-46` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `2631c691bc4574ea1121e64f889d34ec3a8940fa` |
| feature commit | `a94e40daf62199adae19d8ea0b194026e4b6b685` |
| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 57 tests） |
| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
| Diff 检查 | `git diff --check` ✅ |

## Session 165 — 2026-04-20：为 helper 级 workspace slug miss 场景测试标题补上 helper lookup 语义

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-44`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 helper 级 workspace slug miss 场景测试标题是否需要补上 helper lookup seam 语义，以避免与 route 级 `renders ...` wording 混淆；若可行，则只改 helper 级这一处标题并完成验证、review、提交、状态回写与 push 闭环。

### 165.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、执行前 HEAD `ac3c4b66e26c26f6c8bd1052c79734fb276eb098`，工作树起始仅含上轮 docs/state 闭环残留，可按同 lane docs 收口继续本轮 implementation execution unit |
| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `frontend/src/lib/routes.test.tsx` | 恢复唯一状态源、lane 明细与 roadmap，确认本轮只允许推进 `IMP-44`，且最小切口是先补 helper 级标题中的 helper lookup seam 语义 |
| 修改 | `frontend/src/lib/routes.test.tsx` | 将 helper 级 workspace slug miss 场景测试标题从 `falls back to the empty props contract when the workspace slug lookup misses` 收口为 `falls back to the empty props contract when the helper workspace slug lookup misses`，用 `helper workspace slug lookup` 明确 helper seam 语义，同时保持 route 级 `renders ...` 标题、共享断言、fixture 设置与 helper/route 运行时逻辑不变 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：routes seam 定向测试 5 files / 57 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改 helper 级测试标题文案，不改 helper/route 运行时逻辑、共享断言结构或第二个 execution unit；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: clarify helper lookup wording"` | 完成本轮 feature/work commit，得到真实提交 `16d553aeba2912567b39999bbc523135c8b215c4` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-44` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-45`：评估 helper/route 两个 workspace slug miss 场景当前 `falls back` / `renders` 动词风格是否仍需进一步统一或稳定 |

### 165.2 本轮落地结果

- 已确认 helper 级 workspace slug miss 场景是在直接断言 `buildIssueDetailRouteBackLinkProps(...)` helper lookup 返回空对象，而非 route render 层。
- helper 级 workspace slug miss 场景测试标题现已由 `falls back to the empty props contract when the workspace slug lookup misses` 收口为 `falls back to the empty props contract when the helper workspace slug lookup misses`，以 `helper workspace slug lookup` 明确 helper seam 语义。
- route 级 `renders the empty props contract when the workspace slug lookup misses` 标题、`expectLegacyIssueDetailRouteEmptyProps()` / `expectLegacyIssueRouteEmptyPropsContract()` 共享断言、fixture 设置以及 helper/route 运行时逻辑均保持不变；`docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-44` -> `done`，下一轮转入 `IMP-45`，继续评估 helper/route 场景动词风格是否还需进一步统一。

### 165.3 经验沉淀

- 当 helper 级与 route 级测试标题已通过 `renders` 拉开 route render 层语义后，可继续让 helper 级标题显式写出 `helper ... lookup` seam，避免未来阅读时把 helper lookup fallback 与 route render contract 混读。
- 对成对 helper/route 场景的测试文案收口，仍应一次只动一处标题；先稳定层级边界，再决定下一轮是否还需统一动词风格。

### 165.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-44 → IMP-45` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `ac3c4b66e26c26f6c8bd1052c79734fb276eb098` |
| feature commit | `16d553aeba2912567b39999bbc523135c8b215c4` |
| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 57 tests） |
| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
| Diff 检查 | `git diff --check` ✅ |

## Session 164 — 2026-04-20：为 route 级 workspace slug miss 场景测试标题补上 render 层语义区分

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-43`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 helper/route 两个已统一为 `empty props contract when the workspace slug lookup misses` 的场景测试标题是否仍需保留层级区分；若可行，则只改第一处可安全收口的 route 级测试文案并完成验证、review、提交、状态回写与 push 闭环。

### 164.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、执行前 HEAD `892b778305445e4c021282091bd68e9f90558e04`，工作树起始干净，可安全继续单一 implementation execution unit |
| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` / `frontend/src/lib/routes.test.tsx` | 恢复唯一状态源、lane 明细、roadmap 与日志/工时回写要求，确认本轮只允许推进 `IMP-43`，且最小切口是先验证 helper/route 标题是否需要保留层级区分 |
| 配置 | `git config user.name/user.email` | 确认 git author 使用 `offic0600 <offic0600@163.com>` |
| 修改 | `frontend/src/lib/routes.test.tsx` | 将 route 级 workspace slug miss 场景测试标题从 `falls back to the empty props contract when the workspace slug lookup misses` 收口为 `renders the empty props contract when the workspace slug lookup misses`，以 `renders` 明确 route 渲染层语义，同时保持 helper 级标题、共享断言、fixture 设置与 helper/route 运行时逻辑不变 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：routes seam 定向测试 5 files / 57 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改 route 级测试标题文案，不改 helper/route 运行时逻辑、共享断言结构或第二个 execution unit；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: split empty props wording"` | 完成本轮 feature/work commit，得到真实提交 `ac3c4b66e26c26f6c8bd1052c79734fb276eb098` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-43` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-44`：评估 helper 级 workspace slug miss 场景标题是否需要补上 helper lookup 语义以继续拉开与 route 级 render wording 的区分 |

### 164.2 本轮落地结果

- 已确认 helper/route 两个 workspace slug miss 场景虽然都围绕 empty props contract，但 helper 级是在直接断言 lookup helper 返回空对象，route 级是在渲染 legacy `/issues/[id]` route 后断言 `IssueDetailPage` 收到空 props contract。
- route 级 workspace slug miss 场景测试标题现已由 `falls back to the empty props contract when the workspace slug lookup misses` 收口为 `renders the empty props contract when the workspace slug lookup misses`，以 `renders` 明确 route 渲染层语义。
- helper 级标题、`expectLegacyIssueDetailRouteEmptyProps()` / `expectLegacyIssueRouteEmptyPropsContract()` 共享断言、fixture 设置以及 helper/route 运行时逻辑均保持不变；`docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-43` -> `done`，下一轮转入 `IMP-44`，继续评估 helper 级标题是否应补上 lookup seam 语义。

### 164.3 经验沉淀

- 当 helper 级与 route 级测试标题已收口到相同 empty props wording 时，可优先让 route 级标题显式表达 render 层语义，避免未来继续阅读时把 helper lookup seam 与 route render seam 混为同一层。
- 对成对 helper/route 场景的测试文案收口，仍应一次只动一处标题；先拉开层级区分，再决定下一轮是否需要回补 helper lookup 语义。

### 164.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-43 → IMP-44` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `892b778305445e4c021282091bd68e9f90558e04` |
| feature commit | `ac3c4b66e26c26f6c8bd1052c79734fb276eb098` |
| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 57 tests） |
| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
| Diff 检查 | `git diff --check` ✅ |

## Session 163 — 2026-04-20：去掉 route 级 workspace slug miss 场景测试标题里的重复 shared wording

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-42`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 route 级已使用 `shared empty props contract` 的 workspace slug miss 场景测试标题是否仍存在可安全压缩的重复 wording；若可行，则只改这一处 route 级测试文案并完成验证、review、提交、状态回写与 push 闭环。

### 163.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、执行前 HEAD `6877c4ea9c5a9faf577daf2ce13f4273564e1779`，工作树起始干净，可安全继续单一 implementation execution unit |
| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` / `frontend/src/lib/routes.test.tsx` | 恢复唯一状态源、lane 明细、roadmap 与日志/工时回写要求，确认本轮只允许推进 `IMP-42`，且最小切口是先去掉 route 级测试标题与 route 级共享空 props contract 断言重复表达的 `shared` wording |
| 配置 | `git config user.name/user.email` | 确认 git author 使用 `offic0600 <offic0600@163.com>` |
| 修改 | `frontend/src/lib/routes.test.tsx` | 将 route 级 workspace slug miss 场景测试标题从 `falls back to the shared empty props contract when the workspace slug lookup misses` 收口为 `falls back to the empty props contract when the workspace slug lookup misses`，去掉与 route 级共享空 props contract 断言重复表达的 `shared` wording，同时保持 helper 级标题、共享断言、fixture 设置与 helper/route 运行时逻辑不变 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：routes seam 定向测试 5 files / 57 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改 route 级测试标题文案，不改 helper/route 运行时逻辑、共享断言结构或第二个 execution unit；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: trim repeated route wording"` | 完成本轮 feature/work commit，提交后需把真实 SHA 写回状态文件 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-42` 写回 done，记录真实 feature SHA，并新增下一轮最小 pending implementation 任务 |

### 163.2 本轮落地结果

- route 级 workspace slug miss 场景测试标题现已由 `falls back to the shared empty props contract when the workspace slug lookup misses` 收口为 `falls back to the empty props contract when the workspace slug lookup misses`。
- route 级标题不再重复表达 `shared` wording；helper 级标题、`expectLegacyIssueDetailRouteEmptyProps()` / `expectLegacyIssueRouteEmptyPropsContract()` 共享断言、fixture 设置以及 helper/route 运行时逻辑均保持不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 需写回：`IMP-42` -> `done`，下一轮继续只推进一个新的 implementation 最小增量。

### 163.3 经验沉淀

- 当 route 级共享断言 helper 已在命名/contract 中明确表达 empty props 语义时，可优先去掉测试标题中重复的 `shared` 修饰，减少 route 场景文案噪音并保留真正有区分度的失败模式描述。
- 对 helper/route 成对场景的测试文案收口，应继续一次只动一处标题，避免同轮同时压缩多处 wording 而扩大 execution unit 边界。

### 163.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-42` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `6877c4ea9c5a9faf577daf2ce13f4273564e1779` |
| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 57 tests） |
| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
| Diff 检查 | `git diff --check` ✅ |

## Session 162 — 2026-04-20：去掉 helper 级 workspace slug miss 场景测试标题里的重复 shared wording

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-41`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 helper/route 两个已统一为 `workspace slug lookup misses` 的 shared empty props contract 场景测试标题是否仍存在可安全压缩的重复 wording；若可行，则只改第一处可安全收口的 helper 级测试文案并完成验证、review、提交、状态回写与 push 闭环。

### 162.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、执行前 HEAD `4f6d643b902bdf348144b60413ea3710dd8f0549`，工作树起始干净，可安全继续单一 implementation execution unit |
| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` / `frontend/src/lib/routes.test.tsx` | 恢复唯一状态源、lane 明细、roadmap 与日志/工时回写要求，确认本轮只允许推进 `IMP-41`，且最小切口是先去掉 helper 级测试标题与 helper 名称重复表达的 `shared` wording |
| 配置 | `git config user.name/user.email` | 确认 git author 使用 `offic0600 <offic0600@163.com>` |
| 修改 | `frontend/src/lib/routes.test.tsx` | 将 helper 级 workspace slug miss 场景测试标题从 `falls back to the shared empty props contract when the workspace slug lookup misses` 收口为 `falls back to the empty props contract when the workspace slug lookup misses`，去掉与 `expectLegacyIssueDetailRouteEmptyProps()` 重复表达的 `shared` wording，同时保持 route 级标题、共享断言、fixture 设置与 helper/route 运行时逻辑不变 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：routes seam 定向测试 5 files / 57 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改 helper 级测试标题文案，不改 route/helper 运行时逻辑、共享断言结构或第二个 execution unit；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: trim repeated shared wording"` | 完成本轮 feature/work commit，得到真实提交 `eb48a219a88391c28c95da2500f95b0ed69a42ca` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-41` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-42`：评估 route 级 shared empty props contract workspace slug miss 场景测试标题是否还可继续去掉重复 wording |

### 162.2 本轮落地结果

- helper 级 workspace slug miss 场景测试标题现已由 `falls back to the shared empty props contract when the workspace slug lookup misses` 收口为 `falls back to the empty props contract when the workspace slug lookup misses`。
- helper 级标题不再重复表达 `shared` wording；route 级标题、`expectLegacyIssueDetailRouteEmptyProps()` / `expectLegacyIssueRouteEmptyPropsContract()` 共享断言、fixture 设置以及 helper/route 运行时逻辑均保持不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-41` -> `done`，下一轮转入 `IMP-42`，继续评估 route 级 shared empty props contract 场景标题是否可进一步收口重复 wording。

### 162.3 经验沉淀

- 当 helper 级断言 helper 已在命名中显式表达 shared/empty props 语义时，可优先去掉测试标题中重复的 `shared` 修饰，减少文案噪音并保留真正有区分度的失败模式描述。
- 对 helper/route 成对场景的测试文案收口，仍应一次只动一处标题，避免同轮同时压缩两处 wording 而扩大 execution unit 边界。

### 162.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-41 → IMP-42` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `4f6d643b902bdf348144b60413ea3710dd8f0549` |
| feature commit | `eb48a219a88391c28c95da2500f95b0ed69a42ca` |
| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 57 tests） |
| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
| Diff 检查 | `git diff --check` ✅ |

## Session 161 — 2026-04-20：统一 helper 级 workspace slug miss 场景测试标题的 lookup miss wording

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-40`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 helper 级 `cannot resolve a workspace slug` 与 route 级 `workspace slug lookup misses` 两个 workspace slug miss 场景测试标题是否仍可安全统一为更一致的 lookup miss wording；若可行，则只改第一处可安全收口的 helper 级测试文案并完成验证、review、提交、状态回写与 push 闭环。

### 161.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、执行前 HEAD `9624f1b65860b18e13bf2e88e687b8df172e1660`，工作树起始干净，可安全继续单一 implementation execution unit |
| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` / `frontend/src/lib/routes.test.tsx` | 恢复唯一状态源、lane 明细、roadmap 与日志/工时回写要求，确认本轮只允许推进 `IMP-40`，且最小切口是先把 helper 级 workspace slug miss 场景测试标题统一到 route 级已使用的 lookup miss wording |
| 配置 | `git config user.name/user.email` | 确认 git author 使用 `offic0600 <offic0600@163.com>` |
| 修改 | `frontend/src/lib/routes.test.tsx` | 将 helper 级 workspace slug miss 场景测试标题从 `falls back to the shared empty props contract when the legacy lookup seam cannot resolve a workspace slug` 收口为 `falls back to the shared empty props contract when the workspace slug lookup misses`，使 helper/route 两处场景统一为相同 lookup miss wording，同时保持共享断言、fixture 设置与 helper/route 运行时逻辑不变 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：routes seam 定向测试 5 files / 57 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改 helper 级测试标题文案，不改 route/helper 运行时逻辑、共享断言结构或第二个 execution unit；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: unify lookup miss wording"` | 完成本轮 feature/work commit，得到真实提交 `a8cced7a015982c6b370efe3be181305a6663161` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-40` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-41`：评估 helper/route 两个 shared empty props contract workspace slug miss 场景测试标题是否还可继续去掉重复 wording |

### 161.2 本轮落地结果

- helper 级 workspace slug miss 场景测试标题现已由 `falls back to the shared empty props contract when the legacy lookup seam cannot resolve a workspace slug` 收口为 `falls back to the shared empty props contract when the workspace slug lookup misses`。
- helper 级与 route 级两个 workspace slug miss 场景现在统一使用相同 lookup miss wording；`expectLegacyIssueDetailRouteEmptyProps()`、`expectLegacyIssueRouteEmptyPropsContract()`、fixture 设置以及 helper/route 运行时逻辑均保持不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-40` -> `done`，下一轮转入 `IMP-41`，继续评估两个已统一标题里是否仍存在可安全压缩的重复 wording。

### 161.3 经验沉淀

- 对连续多轮只处理测试文案噪音的 execution unit，应优先让同类失败模式先统一 wording，再继续评估是否能压缩 shared contract 前缀或其他重复修饰，避免同轮跨多个语义层次同时收口。
- 当 helper 级与 route 级场景已经表达同一 workspace slug miss 失败模式时，可优先把二者统一为相同 lookup miss wording，以减少后续继续审查标题差异时的噪音。

### 161.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-40 → IMP-41` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `9624f1b65860b18e13bf2e88e687b8df172e1660` |
| feature commit | `a8cced7a015982c6b370efe3be181305a6663161` |
| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 57 tests） |
| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
| Diff 检查 | `git diff --check` ✅ |

## Session 160 — 2026-04-20：去掉 legacy `/issues/[id]` route route 级 workspace slug miss 场景测试标题中的重复路径 wording

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-39`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route route 级 workspace slug miss 场景测试标题中的重复 `legacy /issues/[id] route` 路径 wording 是否仍可安全去掉；若可行，则只做一刀测试文案收口并完成验证、review、提交、状态回写与 push 闭环。

### 160.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、执行前 HEAD `c3b68e3513d7ce33a5729d2c35cd503aafeb56d3`，工作树存在 docs 状态写回遗留脏变更，但均属于上一轮 `IMP-38` docs/state 收口范围，可在本轮沿用并闭环，不涉及其他 lane 残留实现风险 |
| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` / `frontend/src/lib/routes.test.tsx` | 恢复唯一状态源、lane 明细、roadmap 与日志/工时回写要求，结合 implementation lane 明细确认本轮只允许推进 `IMP-39`，且最小切口是 route 级 workspace slug miss 场景标题去掉重复路径 wording |
| 配置 | `git config user.name/user.email` | 确认 git author 使用 `offic0600 <offic0600@163.com>` |
| 修改 | `frontend/src/lib/routes.test.tsx` | 将 route 级 workspace slug miss 场景测试标题从 `falls back to the shared empty props contract when the legacy /issues/[id] route workspace slug lookup misses` 收口为 `falls back to the shared empty props contract when the workspace slug lookup misses`，去掉重复路径 wording，同时保持共享断言、helper/route 运行时逻辑与断言结构不变 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：routes seam 定向测试 5 files / 57 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改 route 级测试标题文案，不改 helper/route 运行时逻辑、共享断言结构或第二个 execution unit；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: trim legacy route path wording"` | 完成本轮 feature/work commit，得到真实提交 `468b79ac1fd0e4f93bb3d484e446a401fbad9cfd` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-39` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-40`：评估 helper/route 两个 workspace slug miss 场景标题是否还可继续统一 lookup miss wording |

### 160.2 本轮落地结果

- route 级 workspace slug miss 场景测试标题现已由包含重复路径说明的长句，收口为 `falls back to the shared empty props contract when the workspace slug lookup misses`。
- `expectLegacyIssueRouteEmptyPropsContract()` 共享断言、`expectLegacyIssueDetailRouteEmptyProps()` helper、fixture 设置以及 helper/route 运行时逻辑均保持不变；本轮作用面仅限 route 级测试文案收口。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-39` -> `done`，下一轮转入 `IMP-40`，继续评估 helper/route 两个 workspace slug miss 场景标题是否可进一步统一 lookup miss wording。

### 160.3 经验沉淀

- 当 shared empty props contract 已明确承载 route 语义时，可继续去掉测试标题里重复的具体 legacy 路径，以降低文案噪音并保留真正有区分度的失败模式描述。
- 对连续多轮只处理测试命名噪音的 execution unit，应继续把 helper wording、route wording、lookup miss wording 分拆处理，避免同轮跨多处标题一起收口而扩大边界。

### 160.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-39 → IMP-40` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `c3b68e3513d7ce33a5729d2c35cd503aafeb56d3` |
| feature commit | `468b79ac1fd0e4f93bb3d484e446a401fbad9cfd` |
| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 57 tests） |
| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
| Diff 检查 | `git diff --check` ✅ |

## Session 159 — 2026-04-20：收口 legacy lookup seam wording 于 helper 级 shared empty props contract 场景测试标题

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-38`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 helper/route 两个 shared empty props contract 场景测试标题中保留的 `shared legacy lookup seam` wording 是否仍可安全继续收口；若可行，则只改第一处可安全收口的 helper 级测试标题并完成验证、review、提交、状态回写与 push 闭环。

### 159.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、执行前 HEAD `3dfc1b624248ad98cf0fef6a2c3e1cc6ffe50c3b`，工作树起始干净，可安全继续单一 implementation execution unit |
| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` / `frontend/src/lib/routes.test.tsx` | 恢复唯一状态源、lane 明细、roadmap 与日志/工时回写要求，确认本轮只允许推进 `IMP-38`，且最小切口是先收口 helper 级 shared empty props contract 标题里的 `shared legacy lookup seam` wording |
| 配置 | `git config user.name/user.email` | 确认 git author 使用 `offic0600 <offic0600@163.com>` |
| 修改 | `frontend/src/lib/routes.test.tsx` | 将 helper 级 workspace slug miss 场景测试标题改为 `falls back to the shared empty props contract when the legacy lookup seam cannot resolve a workspace slug`，去掉重复的 `shared legacy lookup seam` wording，同时保持共享 helper、断言与运行时逻辑不变 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：routes seam 定向测试 5 files / 57 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改 helper 级测试标题文案，不改 route/helper 运行时逻辑、共享断言结构或第二个 execution unit；review 结论为通过 |
| 提交 | `git commit -m "[verified] test: trim legacy lookup seam wording"` | 完成本轮 feature/work commit，得到真实提交 `c3b68e3513d7ce33a5729d2c35cd503aafeb56d3` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-38` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-39`：评估 route 级 workspace slug miss 场景测试标题是否还可继续去掉重复 `legacy /issues/[id] route` 路径 wording |

### 159.2 本轮落地结果

- helper 级 workspace slug miss 场景测试标题现已由 `shared legacy lookup seam` 收口为 `legacy lookup seam`，不再重复携带 `shared`。
- `expectLegacyIssueDetailRouteEmptyProps()` helper、route 级 `expectLegacyIssueRouteEmptyPropsContract()` 共享断言、fixture 设置以及 route/helper 运行时逻辑均保持不变；本轮作用面仅限测试文案收口。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-38` -> `done`，下一轮转入 `IMP-39`，继续评估 route 级 shared empty props contract 场景标题中的重复路径 wording 是否可进一步收口。

### 159.3 经验沉淀

- 对连续多轮只处理测试文案噪音的 execution unit，应继续把 helper 标题与 route 标题拆分处理，避免同轮跨两处 wording 收口导致边界扩大。
- 当测试标题已显式表达 shared empty props contract 时，可优先移除后半句中重复修饰 seam 的冗余前缀，再保留真正承载定位含义的 route/path wording 给下一轮继续评估。

### 159.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-38 → IMP-39` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `3dfc1b624248ad98cf0fef6a2c3e1cc6ffe50c3b` |
| feature commit | `c3b68e3513d7ce33a5729d2c35cd503aafeb56d3` |
| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 57 tests） |
| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
| Diff 检查 | `git diff --check` ✅ |
