
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

