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
