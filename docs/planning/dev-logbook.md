
## Session 158 — 2026-04-20：统一 legacy `/issues/[id]` route helper 级 workspace slug miss 场景测试标题到 shared empty props contract 语义

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-37`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route helper 级 workspace slug miss 场景测试标题是否仍保留 `an empty props contract` wording；若可行，则只做一刀测试文案收口并完成验证、review、提交、状态回写与 push 闭环。

### 158.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、执行前 HEAD `69255a9a1bbe6b1e9b39b3f795bfc55e1f593eaa`，工作树起始干净，可安全继续单一 implementation execution unit |
| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` / `frontend/src/lib/routes.test.tsx` | 恢复唯一状态源、lane 明细、roadmap 与日志/工时回写要求，确认本轮只允许推进 `IMP-37`，且最小切口是继续统一 helper 级 workspace slug miss 场景测试标题中的 shared empty props contract 语义 |
| 配置 | `git config user.name/user.email` | 确认 git author 使用 `offic0600 <offic0600@163.com>` |
| 修改 | `frontend/src/lib/routes.test.tsx` | 将 helper 级 workspace slug miss 场景测试标题改为 `falls back to the shared empty props contract when the shared legacy lookup seam cannot resolve a workspace slug`，补上残留的 `shared` 语义，同时保持共享 helper、断言与运行时逻辑不变 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：routes seam 定向测试 5 files / 57 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` + 独立 reviewer JSON 审查 | 复核本轮只改 helper 级测试标题文案，不改 route/helper 运行时逻辑、共享断言结构或第二个 execution unit；独立审查结论为通过 |
| 提交 | `git commit -m "[verified] test: align legacy helper empty props wording"` | 完成本轮 feature/work commit，得到真实提交 `f58ba5332a83bb7590651fe44b6250c80fa62c2a` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-37` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-38`：评估 helper/route 两个 shared empty props contract 场景标题中的 shared legacy lookup seam wording 是否还可继续收口 |

### 158.2 本轮落地结果

- legacy `/issues/[id]` route helper 级 workspace slug miss 场景测试标题现已统一改为 shared empty props contract 语义，不再残留缺失 `shared` 的 wording。
- `expectLegacyIssueDetailRouteEmptyProps()` helper、route 级 `expectLegacyIssueRouteEmptyPropsContract()` 共享断言、fixture 设置以及 route/helper 运行时逻辑均保持不变；本轮作用面仅限测试文案收口。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-37` -> `done`，下一轮转入 `IMP-38`，继续评估 helper/route 两个 shared empty props contract 场景标题中的 `shared legacy lookup seam` wording 是否可进一步收口。

### 158.3 经验沉淀

- 当 helper 级测试已经直接复用共享空 props helper 时，测试标题也应显式带上 `shared`，避免与 route 级已收口的 shared contract 语义再度分叉。
- 对连续多轮只处理测试文案噪音的 execution unit，可继续按 helper 标题、route 标题、seam wording 三类边界逐轮拆分，既保持单刀提交，也避免一次性改动过宽。

### 158.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-37 → IMP-38` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `69255a9a1bbe6b1e9b39b3f795bfc55e1f593eaa` |
| feature commit | `f58ba5332a83bb7590651fe44b6250c80fa62c2a` |
| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 57 tests） |
| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
| Diff 检查 | `git diff --check` ✅ |


File unchanged since last read. The content from the earlier read_file result in this conversation is still current — refer to that instead of re-reading.