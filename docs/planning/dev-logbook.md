# Cruise — 开发日志（Dev Logbook）

## Session 154 — 2026-04-20：统一 legacy `/issues/[id]` route 空 back-link 测试文案到 shared lookup seam 语义

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-33`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 当前空 back-link 相关测试标题/描述是否仍混用 route、shared legacy lookup seam 与 workspace slug miss 语义；若可行，则只做一刀测试文案收口并完成验证、review、提交、状态回写与 push 闭环。

### 154.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、执行前 HEAD `12444f140a0a0df898e7da367b3da3497921da9d`，工作树起始干净，可安全继续单一 implementation execution unit |
| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` / `frontend/src/lib/routes.test.tsx` | 恢复唯一状态源、lane 明细、roadmap 与日志/工时回写要求，确认本轮只允许推进 `IMP-33`，且最小切口是统一 workspace slug miss 场景 route 测试标题里的 shared lookup seam 语义 |
| 配置 | `git config user.name/user.email` | 确认 git author 使用 `offic0600 <offic0600@163.com>` |
| 修改 | `frontend/src/lib/routes.test.tsx` | 将 workspace slug miss 场景的 route 级测试标题改为 `passes the shared legacy lookup seam empty back-link contract through the legacy /issues/[id] route when workspace slug lookup misses`，把 legacy route、shared lookup seam 与 miss path 语义统一到同一句文案中 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：routes seam 定向测试 5 files / 57 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改测试标题文案，不改 route/helper 运行时逻辑、断言结构或第二个 execution unit |
| 提交 | `git commit -m "[verified] test: align legacy lookup seam wording"` | 完成本轮 feature/work commit，得到真实提交 `2f1eeb8f47fb02c4a8db0f211ab42b5524daaf52` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-33` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-34`：评估 helper/contract 命名与测试标题中是否还存在可继续压缩的重复 empty back-link 短语 |

### 154.2 本轮落地结果

- legacy `/issues/[id]` route 的 workspace slug miss 场景测试标题现已明确表达“route 透传 shared legacy lookup seam 的空 back-link contract”，不再把 route / lookup seam / miss path 语义分散在不同表述里。
- helper 级与 route 级断言结构保持不变：本轮仅收口测试文案，不触碰实现代码或已有共享 helper。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-33` -> `done`，下一轮转入 `IMP-34`，继续评估 helper/contract 命名和调用测试标题里的重复 `empty back-link` 短语是否还可安全压缩。

### 154.3 经验沉淀

- 当同一测试同时承载 route 层与 shared seam 层语义时，优先把“谁透传谁的 contract”写进标题主干，比仅强调 fallback 结果更容易保持命名一致性。
- 对连续多轮只收口测试层语义噪音的 execution unit，应把“文案收口”和“helper 命名收口”继续拆开，避免一轮同时修改测试标题与 helper API 名称。

### 154.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-33 → IMP-34` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `12444f140a0a0df898e7da367b3da3497921da9d` |
| feature commit | `2f1eeb8f47fb02c4a8db0f211ab42b5524daaf52` |
| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 57 tests） |
| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
| Diff 检查 | `git diff --check` ✅ |

## Session 153 — 2026-04-20：对齐 legacy `/issues/[id]` route 空 back-link helper 命名语义

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-32`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 当前 helper 级与 route 级空 back-link helper 命名是否仍存在 legacy/route 词序不一致的轻微噪音；若可行，则只做一刀测试命名收口并完成验证、review、提交、状态回写与 push 闭环。

### 153.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`，且上一轮 docs/state commit `a20a57677921cc42e5fa51a7fe0987c2da1e66a1` 已落盘；工作树随后只包含本轮 implementation lane 变更，可安全继续单一 execution unit |
| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` / `frontend/src/lib/routes.test.tsx` | 恢复唯一状态源、lane 明细、roadmap 与日志/工时回写要求，确认本轮只允许推进 `IMP-32`，且最小切口是对齐 helper 名称中的 legacy/route 词序 |
| 配置 | `git config user.name/user.email` | 确认 git author 使用 `offic0600 <offic0600@163.com>` |
| 修改 | `frontend/src/lib/routes.test.tsx` | 将 helper 级空 back-link 断言从 `expectEmptyLegacyIssueDetailRouteBackLinkProps()` 重命名为 `expectLegacyIssueDetailRouteEmptyBackLinkProps()`，并同步更新 route 级 helper 调用与无 slug helper 测试调用，使 helper 与 route contract helper 共享同一 legacy/route 词序，仅保留 helper vs contract 的层级差异 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：routes seam 定向测试 5 files / 57 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改测试 helper 命名，不改 route 运行时逻辑，也未扩大到测试文案、实现层或第二个 execution unit |
| 提交 | `git commit -m "[verified] test: align legacy empty back-link helper naming"` | 完成本轮 feature/work commit，得到真实提交 `c9449a8f9c7753bb5efcd7e0ecb727fb2a9bc572` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-32` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-33`：评估空 back-link 测试标题/描述是否还可进一步统一为 shared legacy lookup seam 语义 |

### 153.2 本轮落地结果

- helper 级空 back-link 断言现已命名为 `expectLegacyIssueDetailRouteEmptyBackLinkProps()`，与 route 级 `expectLegacyIssueRouteEmptyBackLinkContract()` 在 `legacy` / `route` 词序上保持一致。
- helper 与 route 两层断言仍维持清晰分层：helper 级继续锁定 `buildIssueDetailRouteBackLinkProps(...) === {}`，route 级继续锁定渲染后的 `{ issueId, href: undefined, label: undefined }` contract。
- 本轮仅收口测试命名语义，未触碰 legacy `/issues/[id]` route 实现代码。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-32` -> `done`，下一轮转入 `IMP-33`，评估是否值得继续统一相关测试文案描述。

### 153.3 经验沉淀

- 当 helper 级与 route 级测试明确属于同一路由语义时，优先统一名称中的 shared domain 词序，再用后缀表达层级差异，可降低“是否仍是同一 contract 家族”的阅读噪音。
- 对连续微调测试结构的 cron execution unit，命名收口与文案收口应拆成相邻两轮，能避免一次改动同时影响 helper 引用和断言意图描述。

### 153.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-32 → IMP-33` |
| 当前分支 / HEAD（docs commit 前） | `codex/unify-issue-model` / `a20a57677921cc42e5fa51a7fe0987c2da1e66a1` |
| feature commit | `c9449a8f9c7753bb5efcd7e0ecb727fb2a9bc572` |
| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 57 tests） |
| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
| Diff 检查 | `git diff --check` ✅ |

## Session 151 — 2026-04-20：继续收口 legacy `/issues/[id]` route 无 slug 空 back-link 断言

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-30`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 当前“无 workspace slug”空 back-link route/helper 断言是否仍存在可安全合并的重复；若可行，则继续提炼共享测试期望并完成验证、review、提交、状态回写与 push 闭环。

### 151.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、执行前 HEAD `acd97db577a79b3f4d0c51e479bbad666f52c755`，工作树起始干净，可安全继续单一 implementation execution unit |
| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` / `frontend/src/app/issues/[id]/page.tsx` / `frontend/src/lib/routes.test.tsx` | 恢复唯一状态源、lane 明细、roadmap 与日志/工时回写要求，确认本轮只允许推进 `IMP-30`，且最小切口是把 route 级“无 workspace slug”空 back-link 断言并入上一轮失败分支共享 helper |
| 配置 | `git config user.name/user.email` | 再次确认 git author 使用 `offic0600 <offic0600@163.com>` |
| 修改 | `frontend/src/lib/routes.test.tsx` | 让 legacy `/issues/[id]` route 的“无 workspace slug”场景改为复用 `expectLegacyIssueRouteEmptyBackLinkContract()`，去掉 route 级重复手写空 `href/label` 断言，同时保留 helper 级 `buildIssueDetailRouteBackLinkProps(...)` 无 slug 空对象 contract 断言不变 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：routes seam 定向测试 5 files / 57 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只继续收口 legacy route 空 back-link 测试重复期望，不改动 route 运行时逻辑，也未扩大到 helper 行为重构或第二个 execution unit |
| 提交 | `git commit -m "[verified] test: share legacy issue route no-slug empty assertion"` | 完成本轮 feature/work commit，得到真实提交 `a17114b58ff361355848fba72165989333699328` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-30` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-31`：评估 legacy route 空 back-link helper 是否可继续收口 route/helper 命名与调用边界 |

### 151.2 本轮落地结果

- legacy `/issues/[id]` route 的“无 workspace slug”场景测试现已与 `getIssue(...)` / `getOrganizations()` 两条失败场景共用 `expectLegacyIssueRouteEmptyBackLinkContract()`，统一锁定 route 级空 `href/label` 降级 contract。
- helper 级 `buildIssueDetailRouteBackLinkProps(...)` 的无 slug 返回空对象断言保持独立，因其验证的是 lookup helper contract，而不是 route 渲染 contract。
- route 运行时代码与 lookup seam 未变，作用面保持在测试层最小收口。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-30` -> `done`，下一轮转入 `IMP-31`，评估 route/helper 空 back-link helper 的命名与调用边界是否还可进一步收紧。

### 151.3 经验沉淀

- 当 route 级多个场景最终都渲染到同一空 props contract 时，应优先统一 route 级共享断言 helper；helper 层若验证的是不同层级 contract（例如返回空对象而不是渲染 props），则应保留独立断言边界。
- 连续小步收口测试重复时，每轮只消除一种重复表达形式，能避免误把 route contract 与 helper contract 混成同一语义层。

### 151.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-30 → IMP-31` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `acd97db577a79b3f4d0c51e479bbad666f52c755` |
| feature commit | `a17114b58ff361355848fba72165989333699328` |
| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 57 tests） |
| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
| Diff 检查 | `git diff --check` ✅ |

## Session 150 — 2026-04-20：收口 legacy `/issues/[id]` route 失败分支空 back-link 断言

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-29`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 当前两条 API 失败断言是否仍重复表达同一空 back-link 降级 contract；若可安全收口，则提炼仅供测试复用的共享断言 helper，并完成验证、review、提交、状态回写与 push 闭环。

### 150.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、执行前 HEAD `6b547c30668883f6a7c894f251de6470042ad8a3`，工作树起始干净，可安全继续单一 implementation execution unit |
| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` / `frontend/src/app/issues/[id]/page.tsx` / `frontend/src/lib/routes.test.tsx` | 恢复唯一状态源、lane 明细、roadmap 与日志/工时回写要求，确认本轮只允许推进 `IMP-29`，且最小切口是把两条 API 失败分支的重复空 back-link 断言收口为共享 helper |
| 配置 | `git config user.name/user.email` | 再次确认 git author 使用 `offic0600 <offic0600@163.com>` |
| 修改 | `frontend/src/lib/routes.test.tsx` | 新增测试专用 `expectLegacyIssueRouteEmptyBackLinkContract()`，让 `getIssue(...)` reject 与 `getOrganizations()` reject 两条 route 失败断言共用同一空 back-link contract 期望，同时保留各自调用断言与失败源设置不变 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：routes seam 定向测试 5 files / 57 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只收口 legacy route 失败分支测试重复期望，不改动 route 运行时逻辑，也未扩大到无 slug 分支或第二个 execution unit |
| 提交 | `git commit -m "[verified] test: share legacy issue route empty back-link assertion"` | 完成本轮 feature/work commit，得到真实提交 `b10822f0fe737176521f8a376aabbc86cab23267` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-29` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-30`：评估无 slug 空 back-link route/helper 断言是否可继续收口 |

### 150.2 本轮落地结果

- legacy `/issues/[id]` route 的两条 API 失败场景测试现已改为共用 `expectLegacyIssueRouteEmptyBackLinkContract()`，统一锁定空 `href/label` 降级 contract。
- 各失败分支仍分别保留 `getIssueMock` / `getOrganizationsMock` 的调用断言，因此本轮只去掉重复期望，不削弱失败来源覆盖。
- route 运行时代码与 lookup seam 未变，作用面保持在测试层最小收口。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-29` -> `done`，下一轮转入 `IMP-30`，评估无 slug 空 back-link 断言是否也可并入共享 helper。

### 150.3 经验沉淀

- 对同一 route contract 下的多个失败源测试，优先抽“共享结果断言 helper”而不是合并整条测试，可同时保留失败源级调用护栏与单一事实源。
- 当上一轮已把成功 seam 收口后，下一轮继续只消除失败分支的重复期望，能保持 execution unit 足够小且易验证。

### 150.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-29 → IMP-30` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `6b547c30668883f6a7c894f251de6470042ad8a3` |
| feature commit | `b10822f0fe737176521f8a376aabbc86cab23267` |
| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 57 tests） |
| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
| Diff 检查 | `git diff --check` ✅ |

## Session 149 — 2026-04-20：收紧 legacy `/issues/[id]` lookup seam 成功断言边界

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-28`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 与 `loadIssueDetailRouteLookup(...)` / `buildIssueDetailRouteBackLinkProps(...)` 的现有测试边界，若存在 route/helper 重复成功断言，则收紧为一组更稳定的最小 contract 断言并完成验证、review、提交、状态回写与 push 闭环。

### 149.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、执行前 HEAD `65c3fc16c144c422e5b9734fe58828e65349eddb`，工作树起始干净，可安全继续单一 implementation execution unit |
| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` / `frontend/src/app/issues/[id]/page.tsx` / `frontend/src/lib/routes.test.tsx` | 恢复唯一状态源、lane 明细、roadmap 与日志/工时回写要求，确认本轮只允许推进 `IMP-28`，且最小切口是去掉 lookup seam 成功断言里重复手写的 helper fixture |
| 配置 | `git config user.name/user.email` | 再次确认 git author 使用 `offic0600 <offic0600@163.com>` |
| 修改 | `frontend/src/lib/routes.test.tsx` | 将 lookup seam 成功场景测试改为先获取 `loadIssueDetailRouteLookup(42)` 返回值，再复用同一 `lookup` 对象断言 `buildIssueDetailRouteBackLinkProps(lookup)`；删除 helper 级重复手写的 organizations fixture，保留 route 级成功/无 slug/API 失败 contract 断言不变 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：routes seam 定向测试 5 files / 57 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx frontend/src/app/issues/[id]/page.tsx` | 复核本轮只收紧 lookup seam 成功断言边界，不改动 route 运行时逻辑，也未扩大到失败断言或第二个 execution unit |
| 提交 | `git commit -m "[verified] test: tighten legacy issue lookup seam contract coverage"` | 完成本轮 feature/work commit，得到真实提交 `5acc3d094d2320fa3c518288528e4787915d0be1` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-28` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-29`：评估是否可将 legacy route API 失败断言进一步收口为共享空 back-link contract helper |

### 149.2 本轮落地结果

- lookup seam 成功场景测试现已只保留一份共享 `lookup` 结果：先断言 `loadIssueDetailRouteLookup(...)` 返回 issue + organizations，再直接把同一结果传给 `buildIssueDetailRouteBackLinkProps(...)`。
- helper 级成功断言不再重复手写 organizations fixture，因此 route/helper 的成功 contract 边界比上一轮更紧，后续若继续收口失败断言也更容易保持单一事实源。
- legacy `/issues/[id]` route 的成功、无 slug、`getIssue(...)` 失败、`getOrganizations()` 失败 contract 断言均保持不变，作用面未扩大。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-28` -> `done`，下一轮转入 `IMP-29`，评估是否可把空 back-link 失败断言继续抽成共享测试 helper。

### 149.3 经验沉淀

- 对“lookup helper + route”双层 seam 的成功 contract，若 helper 级测试与 route 级测试共用同一 fixture 含义，优先把 helper 级断言改为直接消费 lookup 返回值，可避免未来 schema 变更时出现两处 fixture 漂移。
- 当本轮目标是去重测试而非改运行时代码时，最稳妥的 execution unit 是只消除一类重复 fixture/断言，保留其他失败场景 contract 作为下一轮独立切口。

### 149.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-28 → IMP-29` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `65c3fc16c144c422e5b9734fe58828e65349eddb` |
| feature commit | `5acc3d094d2320fa3c518288528e4787915d0be1` |
| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 57 tests） |
| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
| Diff 检查 | `git diff --check` ✅ |

## Session 148 — 2026-04-19：为 legacy `/issues/[id]` route 抽出共享 lookup seam

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-27`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：评估并收口 legacy `/issues/[id]` route 内重复的 `getIssue + getOrganizations` / workspace slug back-link 组装，若可安全抽离则落一个共享 lookup seam，并完成验证、review、提交、状态回写与 push 闭环。

### 148.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、当前 HEAD `ceda81c65943e90b868846173ec6e4ff89818691`，工作树起始干净，可安全继续单一 implementation execution unit |
| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` / `frontend/src/app/issues/[id]/page.tsx` / `frontend/src/lib/routes.test.tsx` | 恢复唯一状态源、lane 明细、roadmap 与日志/工时回写要求，确认本轮只允许推进 `IMP-27`，且 legacy route 的最小下一刀就是提炼共享 lookup seam |
| 配置 | `git config user.name/user.email` | 再次确认 git author 使用 `offic0600 <offic0600@163.com>` |
| 修改 | `frontend/src/app/issues/[id]/page.tsx` | 提炼 `loadIssueDetailRouteLookup(...)` 与 `buildIssueDetailRouteBackLinkProps(...)`，把 legacy route 内部重复的 issue/org lookup 与 workspace slug→back-link 组装收口为共享 seam，route 自身仅负责调用与 try/catch 降级 |
| 修改 | `frontend/src/lib/routes.test.tsx` | 新增 helper 级与 route 级最小 seam 回归测试，锁定共享 lookup seam 的成功解析、无 slug 空 contract，以及 route 继续透传显式 back-link contract |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：routes seam 定向测试 5 files / 57 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
| Review | `git diff -- frontend/src/app/issues/[id]/page.tsx frontend/src/lib/routes.test.tsx` | 复核本轮只提炼 legacy route lookup seam 与对应测试，不扩大到 workspace route 或页面层重构，也未跨到第二个 execution unit |
| 提交 | `git commit -m "[verified] refactor: extract legacy issue detail lookup seam"` | 完成本轮 feature/work commit，得到真实提交 `55fb9752f5ee5c27e0fb433543b0c7933e3df11a` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-27` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-28`：收紧 lookup seam 的 route/helper 最小 contract 断言边界 |

### 148.2 本轮落地结果

- legacy `/issues/[id]` route 现已把 issue/org lookup 与 workspace slug back-link 组装提炼为两个共享 seam：`loadIssueDetailRouteLookup(...)` 与 `buildIssueDetailRouteBackLinkProps(...)`。
- route 自身仅保留 `params → issueId`、调用共享 seam、try/catch 降级为空 back-link contract 三个职责，删除了内联 `Promise.all(...)` 与 slug 判定重复逻辑。
- 新增 helper 级回归测试，明确锁定共享 lookup seam 的成功解析结果与“无匹配 workspace slug 时返回空 contract”语义；原 route 级成功/无 slug/API 失败 contract 断言继续保留。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-27` -> `done`，下一轮转入 `IMP-28`，评估是否可进一步去除 route 与 helper 级断言重复。

### 148.3 经验沉淀

- 对 legacy route 中已被 seam 测试锁定的 `Promise.all(...)` 数据加载逻辑，最小安全重构往往是先提炼“lookup 结果”和“由 lookup 结果生成页面 contract”两段函数，再保留 route 层 try/catch 作为薄壳。
- 当 route 级成功/失败 contract 已经稳定后，可在 helper 提炼同一轮补少量 helper 级断言，保证后续进一步收紧 route 断言时仍有 seam 级护栏。

### 148.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-27 → IMP-28` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `ceda81c65943e90b868846173ec6e4ff89818691` |
| feature commit | `55fb9752f5ee5c27e0fb433543b0c7933e3df11a` |
| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 57 tests） |
| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
| Diff 检查 | `git diff --check` ✅ |

## Session 147 — 2026-04-19：为 legacy `/issues/[id]` route 补 API 失败 seam 回归测试

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-26`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：为 legacy `/issues/[id]` 直达 route 补最小 API 失败场景 seam 回归测试，锁定 `getIssue(...)` 或 `getOrganizations()` 抛错时 route 仍以空 back-link props 渲染 `IssueDetailPage` 的 try/catch 降级 contract，并完成验证、review、提交、状态回写与 push 闭环。

### 147.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、当前 HEAD `28acbdcd9645ca1b20a459feac130299f1cfe57c`，工作树起始干净，可安全继续单一 implementation execution unit |
| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` / `frontend/src/app/issues/[id]/page.tsx` / `frontend/src/lib/routes.test.tsx` | 恢复唯一状态源、lane 明细、roadmap 与日志/工时回写要求，确认本轮只允许推进 `IMP-26`，且现有 legacy route 已具备 try/catch 降级实现，当前缺口仅剩 seam 测试 |
| 配置 | `git config user.name/user.email` | 再次确认 git author 使用 `offic0600 <offic0600@163.com>` |
| 修改 | `frontend/src/lib/routes.test.tsx` | 为 legacy `/issues/[id]` route 新增两条最小 seam 回归测试，分别覆盖 `getIssue(...)` reject 与 `getOrganizations()` reject 时 route 仍向 `IssueDetailPage` 透传空 back-link props 的 try/catch 降级 contract |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：routes seam 定向测试 5 files / 55 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮仅新增 legacy route API 失败场景断言，不修改 route 运行时逻辑、不跨到其他 lane 或第二个 execution unit |
| 提交 | `git commit -m "[verified] test: cover legacy issue route API fallback seam"` | 完成本轮 feature/work commit，得到真实提交 `159949a8ad41624b247133735597194c37762a28` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-26` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-27`：评估 legacy route 是否可抽出共享 issue/org lookup seam |

### 147.2 本轮落地结果

- legacy `/issues/[id]` route 的 seam 回归测试现已覆盖两类 API 失败路径：`getIssue(...)` reject 与 `getOrganizations()` reject。
- 两条测试都锁定同一降级 contract：route 吞掉异常后仍正常渲染 `IssueDetailPage`，并透传空 `href/label` back-link props，而不是把异常泄漏到页面层。
- 本轮未扩大到 route/helper 重构，只补齐 `IMP-26` 所要求的最小 try/catch seam 验证。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-26` -> `done`，下一轮转入 `IMP-27`，评估是否值得提炼共享 issue/org lookup seam。

### 147.3 经验沉淀

- 对已有 try/catch 降级实现，最稳妥的单轮 execution unit 通常是先补 seam 测试锁定失败 contract，而不是立刻抽 helper；这样能先确保后续重构有稳定护栏。
- 对 `Promise.all(...)` 形式的 route 依赖，最好分别覆盖每个上游 API reject 分支，避免只测“任一失败”却遗漏具体失败源的调用/降级语义。

### 147.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-26 → IMP-27` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `28acbdcd9645ca1b20a459feac130299f1cfe57c` |
| feature commit | `159949a8ad41624b247133735597194c37762a28` |
| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 55 tests） |
| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
| Diff 检查 | `git diff --check` ✅ |

## Session 146 — 2026-04-19：为 `/issues/[id]` 直达页补显式 back-link contract

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-24`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：为 legacy `/issues/[id]` 直达 issue 详情页补最小显式 `href/label` back-link contract，消除 `IssueDetailPage` 顶部返回链接对组件内部默认 fallback 的依赖，并完成验证与状态回写。

### 146.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、当前 HEAD `62dfe2fa43d821adc8231758b26bb0aa4433c0ab`，工作树脏变更仍属于同一 implementation lane 收口范围，可继续当前 execution unit |
| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `frontend/src/app/issues/[id]/page.tsx` / `frontend/src/components/issues/IssueDetailPage.tsx` / `frontend/src/lib/api/issues.ts` / `frontend/src/lib/api/planning.ts` / `frontend/src/lib/api/types.ts` / `frontend/src/lib/routes.ts` | 恢复唯一状态源与 lane 明细，确认本轮只允许推进 `IMP-24`，并核对 legacy 直达页可通过 `getIssue + getOrganizations` 解析 workspace slug 后构造显式 back-link |
| 配置 | `git config user.name/user.email` | 再次确认 git author 使用 `offic0600 <offic0600@163.com>` |
| 修改 | `frontend/src/app/issues/[id]/page.tsx` | 让 legacy `/issues/[id]` route 在服务端先读取 issue 与 organizations，按 `organizationId` 找到 workspace slug 后显式传入 `IssueDetailPage` 的 `href/label` back-link contract |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` | 将 `IMP-24` 写回 done，并新增下一轮 `IMP-25`：为 legacy 直达页补 route seam 回归测试 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：routes seam 定向测试 5 files / 51 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
| Review | `git diff -- frontend/src/app/issues/[id]/page.tsx frontend/src/components/issues/IssueDetailPage.tsx` | 复核本轮只给 legacy 直达页补显式 back-link contract；`IssueDetailPage` 顶部 CTA 仍只消费显式 props，内部 `teamActivePath(...)` fallback 仅保留给删除后跳转 |

### 146.2 本轮落地结果

- legacy `/issues/[id]` 直达页现已在服务端获取 issue 与 organizations，并依据 `issue.organizationId` 解析 workspace slug。
- route 现已显式向 `IssueDetailPage` 透传 `href/label` back-link contract，顶部返回链接不再依赖组件内部默认 fallback。
- `IssueDetailPage` 内部 `teamActivePath(...)` fallback 的职责进一步收紧：当前仅保留给删除后跳转，不再承担页面顶部返回 CTA 的缺省生成。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-24` -> `done`，下一轮转入 `IMP-25`，补 legacy `/issues/[id]` route seam 回归测试。

### 146.3 经验沉淀

- 对 legacy 直达页补显式 route/page contract 时，可先在 route 层用已有 API 拼出最小上下文（本轮是 `issue + organizations → workspace slug`），避免把导航语义重新塞回 page component 内部 fallback。
- 当组件 fallback 已被收紧为“仅内部动作兜底”后，后续最稳妥的下一刀通常是补 seam 测试锁定 route 显式传参，而不是继续扩大到更多导航重构。

### 146.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-24 → IMP-25` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `62dfe2fa43d821adc8231758b26bb0aa4433c0ab` |
| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 51 tests） |
| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
| Diff 检查 | `git diff --check` ✅ |

## Session 145 — 2026-04-19：收紧 IssueDetailPage 顶部返回链接仅消费显式 contract

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-23`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：确认 `IssueDetailPage` 内部 `teamActivePath(...)` fallback 的真实保留边界，并在不扩展到整页导航重构的前提下，把顶部返回链接渲染收紧为仅消费显式传入的 `href/label` contract，完成验证与状态回写。

### 145.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、当前 HEAD `62dfe2fa43d821adc8231758b26bb0aa4433c0ab`，工作树可继续推进单一 implementation execution unit |
| 读取 | `AGENTS.md` / `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `frontend/src/components/issues/IssueDetailPage.tsx` / `frontend/src/app/issues/[id]/page.tsx` / `frontend/src/components/inbox/InboxPage.tsx` / `frontend/src/lib/routes.test.tsx` | 恢复 lane 状态源并核对 `IssueDetailPage` 真实直接调用面，确认只有 workspace issue detail route、`/issues/[id]` 直达页与 Inbox embedded 详情三处使用 |
| 修改 | `frontend/src/components/issues/IssueDetailPage.tsx` | 将顶部返回链接 `detailBackHref` 收紧为仅消费显式传入的 `href`；不再在 workspace/team 上下文存在时自动兜底渲染 Active issues 返回链接 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：routes seam 定向测试 5 files / 51 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
| Review | `git diff -- frontend/src/components/issues/IssueDetailPage.tsx` | 复核本轮只收紧顶部返回链接渲染边界，没有删除删除后跳转仍需的 `teamActivePath(...)` fallback，也未扩大到 `/issues/[id]` 调用点重构 |

### 145.2 本轮落地结果

- 已确认 `IssueDetailPage` 的直接调用面只剩三类：workspace issue detail route、`/issues/[id]` 直达页、Inbox embedded 详情。
- Inbox 因 `embedded` 模式本就不显示顶部返回链接，因此不构成 back-link fallback 依赖来源。
- `IssueDetailPage` 顶部返回链接现已只在显式传入 `href` 时渲染，不再因为当前 workspace/team 上下文存在就自动回退到 `teamActivePath(...)`。
- 组件内部 `teamActivePath(...)` 仍需暂时保留给删除后跳转与 `/issues/[id]` 直达页未显式传参场景，因此本轮将“为何仍不能完全移除 fallback”的原因写回 state/task-board，并新增下一轮 `IMP-24`。

### 145.3 经验沉淀

- 当共享 route/page contract 已统一时，继续收紧 fallback 边界的第一步应先核对真实调用面，而不是直接删除组件内部兜底；这样能避免误伤直达页或 embedded 场景。
- 对详情页返回链接这类 UI seam，可先把“是否渲染 CTA”收紧为仅受显式 contract 驱动，再下一轮逐个调用点补齐显式传参，比一次性删光内部 fallback 更稳妥。

### 145.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-23 → IMP-24` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `62dfe2fa43d821adc8231758b26bb0aa4433c0ab` |
| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 51 tests） |
| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
| Diff 检查 | `git diff --check` ✅ |


## Session 144 — 2026-04-19：让 IssueDetailPage 直接消费共享 back-link contract props

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-22`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：把 `IssueDetailPage` 的返回链接 props 命名收口为与 route shell `pageBackLink` 完全一致的 `href/label` contract，并完成验证、review、feature commit、状态写回与 push 闭环。

### 144.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、起始 HEAD `062928ccafb40b4679a35a5e6dcd8d4c4c38e1c3`，工作树内仅有本 lane 已准备收口的 state/docs 遗留改动，可继续同一 execution unit 闭环 |
| 读取 | `AGENTS.md` / `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 恢复唯一状态源、lane 明细、roadmap 约束、日志/工时回写要求与 git author 规则，确认本轮只允许推进 `IMP-22` |
| 配置 | `git config user.name/user.email` | 再次确认 git author 使用 `offic0600 <offic0600@163.com>` |
| 复核 | `frontend/src/components/issues/IssueDetailPage.tsx` / `frontend/src/app/[workspaceSlug]/issue/[identifier]/[titleSlug]/page.tsx` / `frontend/src/lib/routes.test.tsx` | 识别 route 已统一透传 shared `pageBackLink`，但 `IssueDetailPage` 仍保留 `backHref/backLabel` 旧命名 props，适合作为 `IMP-22` 的最小切口 |
| 修改 | `frontend/src/components/issues/IssueDetailPage.tsx` | 将组件 props 收口为共享 `href/label` contract，并让内部 fallback 继续只在未显式传值时回退到 workspace/team active issues 链接 |
| 修改 | `frontend/src/lib/routes.test.tsx` | 删除 mock 层对旧 `backHref/backLabel` 的兼容标准化，改为直接断言 route steady/cached-refetch 分支传给 `IssueDetailPage` 的 shared `href/label` props |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：routes seam 定向测试 5 files / 51 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
| Review | `git diff -- frontend/src/components/issues/IssueDetailPage.tsx frontend/src/lib/routes.test.tsx` | 复核本轮只收口 page component 对 shared back-link contract 的 props 命名，没有扩大到 route shell 之外的导航行为或 capture lane |
| 提交 | `git commit -m "[verified] feat: align issue detail page with shared back-link contract"` | 完成本轮 feature/work commit，得到真实提交 `035fafae7748d3f16e601619ed57fca616f0bf16` |

### 144.2 本轮落地结果

- `IssueDetailPage` 现在直接消费与 route shell `pageBackLink` 一致的 `href/label` props，删除了组件 API 中仅为历史命名保留的 `backHref/backLabel` 专用入口。
- route seam 测试已改为直接断言 shared `href/label` contract，确保 steady 与 cached-refetch 两个渲染分支都不再依赖 mock 层兼容旧 props 命名。
- 组件内部对 `teamActivePath(...)` 的 fallback 暂时保留，继续作为未显式传入 back-link 时的唯一兜底，不在本轮扩大为页面级导航策略重构。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-22` -> `done`，下一轮转入 `IMP-23`，评估组件内部 fallback 是否还可进一步收紧。

### 144.3 经验沉淀

- 当 route helper 与 page component 之间的共享 contract 已稳定时，可把组件 props 命名收口单独作为一轮 execution unit，避免 route 与 component 长期依赖测试 mock 的“双语兼容层”。
- 渐进式 seam 重构中，先让测试 mock 去掉兼容层、直接断言目标 contract，能更快暴露是否仍有调用点停留在旧接口上。

### 144.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-22 → IMP-23` |
| 当前分支 / HEAD（改动前） | `codex/unify-issue-model` / `062928ccafb40b4679a35a5e6dcd8d4c4c38e1c3` |
| feature commit | `035fafae7748d3f16e601619ed57fca616f0bf16` |
| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 51 tests） |
| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
| Diff 检查 | `git diff --check` ✅ |

## Session 143 — 2026-04-19：收口 IMP-21 默认 page back-link props 重复组装

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-21`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：让 issue detail route 的默认 `IssueDetailPage` 渲染分支也直接消费共享 `pageBackLink` contract，完成最小充分验证、独立 review、feature commit、状态写回与 push 闭环。

### 143.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、HEAD `7cede7b20790301deef88fa8bf84faa5b5ddb779`，工作树起始为干净，可安全继续单一 implementation execution unit |
| 读取 | `AGENTS.md` / `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 恢复唯一状态源、lane 明细、roadmap 约束、日志/工时回写要求与 git author 规则，确认本轮只允许推进 `IMP-21` |
| 配置 | `git config user.name/user.email` | 再次确认 git author 使用 `offic0600 <offic0600@163.com>` |
| 复核 | `frontend/src/app/[workspaceSlug]/issue/[identifier]/[titleSlug]/page.tsx` / `frontend/src/components/issues/IssueDetailPage.tsx` / `frontend/src/lib/routes.test.tsx` | 识别 route 的 cached-refetch 分支已消费 shared `pageBackLink`，但默认 page 分支仍手写 `backHref/backLabel`，适合作为 `IMP-21` 的唯一最小切口 |
| 修改 | `frontend/src/app/[workspaceSlug]/issue/[identifier]/[titleSlug]/page.tsx` | 将 cached-refetch 与默认 page 两个 `IssueDetailPage` 渲染分支统一改为直接展开 `backgroundRefetchRouteShellModel.pageBackLink` / `routeShellModel.pageBackLink`，删除 route 内对 `backHref/backLabel` 的重复组装 |
| 修改 | `frontend/src/lib/routes.test.tsx` | 调整 `IssueDetailPage` mock，使其在测试中同时兼容旧 `backHref/backLabel` 与本轮 shared `href/label` 透传写法，并继续把断言标准化为 `backHref/backLabel` contract |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：routes seam 定向测试 5 files / 51 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
| Review | `git diff -- frontend/src/app/[workspaceSlug]/issue/[identifier]/[titleSlug]/page.tsx frontend/src/lib/routes.test.tsx` | 复核本轮只收口 route 默认 page 分支 back-link props seam 与对应测试适配，没有扩大到 `IssueDetailPage` 内部 fallback 逻辑或 capture lane |
| 提交 | `git commit -m "[verified] feat: reuse shared issue detail page back-link props"` | 完成本轮 feature/work commit，得到真实提交 `062928ccafb40b4679a35a5e6dcd8d4c4c38e1c3` |

### 143.2 本轮落地结果

- issue detail route 的默认 page 分支现已与 cached-refetch 分支一致，直接展开 `buildIssueDetailRouteShellModel(...)` 产出的共享 `pageBackLink` props，不再在 route JSX 内重复拆出 `backHref/backLabel`。
- `routes.test.tsx` 中的 `IssueDetailPage` mock 已兼容 shared props 透传写法，并继续把断言归一到 `backHref/backLabel` 语义，确保 route/page contract 变更不会掩盖调用语义回归。
- 本轮 execution unit 保持最小：只处理 route 默认 page 分支残留的 back-link props 重复组装，不触碰 `IssueDetailPage` 内部 `detailBackHref/detailBackLabel` fallback 行为。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-21` -> `done`，下一轮转入 `IMP-22`，评估 `IssueDetailPage` 内部默认 back-link fallback 是否仍需保留。

### 143.3 经验沉淀

- 当 route shell helper 已经稳定输出结构化 props 时，route JSX 剩余的 `propA={model.a} propB={model.b}` 重复组装也值得作为单独一轮 execution unit 收口；这样可以在不碰下游组件内部实现的前提下继续收紧 route/page seam。
- 对 mock 组件回归测试，可先把新旧 props 入口在 mock 层做兼容标准化，再保持既有断言 contract 不变，能更平滑地验证渐进式 props 重构。

### 143.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-21 → IMP-22` |
| 当前分支 / HEAD（改动前） | `codex/unify-issue-model` / `7cede7b20790301deef88fa8bf84faa5b5ddb779` |
| feature commit | `062928ccafb40b4679a35a5e6dcd8d4c4c38e1c3` |
| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 51 tests） |
| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
| Diff 检查 | `git diff --check` ✅ |

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

## Session 141 — 2026-04-19：让 issue detail route 消费共享 shell model 收口 IMP-19

**目标**：按 Implementation lane 推进 `IMP-19`，在不扩大到 `IssueDetailPage` 内部重构的前提下，让 issue detail route 的 loading/not-found/error/no-id 分支真正消费上一轮新增的共享 shell model；完成最小充分验证、review，并为后续 feature/docs commit 闭环准备状态文档。

### 141.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `AGENTS.md` / `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 恢复当前 lane、唯一状态源、日志/工时回写要求与 implementation 单 execution unit 约束 |
| 复核 | `frontend/src/app/[workspaceSlug]/issue/[identifier]/[titleSlug]/page.tsx` / `frontend/src/lib/routes.test.tsx` / `frontend/src/components/issues/IssueDetailPage.tsx` | 确认当前 `IMP-19` 只应把 route loading/empty-state 分支切换到共享 shell seam，不扩大到 page 内部骨架重构 |
| 修改 | `frontend/src/app/[workspaceSlug]/issue/[identifier]/[titleSlug]/page.tsx` | 新增 `backgroundRefetchRouteShellModel`，让默认 loading 与 background refetch loading 通过共享 `loadingState` 渲染；同时让 error/no-id 分支直接消费 `routeShellModel.emptyState`，删除重复 empty-state 组装 |
| 修改 | `frontend/src/lib/routes.test.tsx` | 继续补强 `buildIssueDetailRouteShellModel(...)` helper 回归测试，显式锁定默认 loading state 与 override loading state contract |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 当前环境下 routes seam 定向测试、TypeScript 检查与 diff whitespace 检查均通过 |
| Review | `git diff -- frontend/src/app/[workspaceSlug]/issue/[identifier]/[titleSlug]/page.tsx frontend/src/lib/routes.test.tsx docs/status/roadmap-state.yaml docs/linear-parity/task-board.md` | 复核本轮改动只落在 issue detail route shell seam 与状态文档，不跨到 capture lane 或 `IssueDetailPage` 内部 |

### 141.2 本轮落地结果

- issue detail route 现在已用 `buildIssueDetailRouteShellModel(...)` 统一承载 route 级 empty-state 与 loading-state contract：默认 loading 分支消费 `routeShellModel.loadingState`，background refetch loading 分支消费 `backgroundRefetchRouteShellModel.loadingState`。
- `issueLookupQuery.isError` 与 `!issueId` 分支已改为直接复用 `routeShellModel.emptyState`，删除了 route 内部重复拼装 `issueNotFoundState` 的局部逻辑，完成 `IMP-19` 所要求的最小 route 分支 seam 收口。
- `routes.test.tsx` 已补 helper 回归：显式锁定 `buildIssueDetailRouteShellModel(...)` 的默认 loading contract 与 override loading contract，验证通过后与页面改动形成闭环。
- 当前尚未执行 feature commit / docs-state commit；但代码与状态文档已准备好进入同一轮 commit/push 闭环。

### 141.3 经验沉淀

- 当上一轮已经把 route shell 提炼为共享 model helper，下一轮最小切口应优先把真正的消费点切过去，而不是继续只在 helper 层增加抽象，否则 `pending` 任务会长期停留在“helper 已存在但调用点仍手写”的假完成状态。
- 对 route 级 loading/empty-state 收口，可先限制在 page route 本身的 query 分支，避免同时触碰 `IssueDetailPage` 内部骨架，这样更符合单 execution unit 原则。
- 状态文档中的 blocker 一旦与真实工作树不符，必须在 feature commit 前同步修正，否则 cron 恢复会反复把已解除问题误当 blocker。

### 141.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-19` |
| 当前分支 / HEAD（改动前） | `codex/unify-issue-model` / `5f9bbf40737ed971c5a7c4d446c68345454a161f` |
| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 50 tests） |
| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
| Diff 检查 | `git diff --check` ✅ |
| 当前闭环状态 | 代码与 docs/state 已更新，待 feature commit + docs/state commit + push |

## Session 142 — 2026-04-19：为 IMP-20 收口 pageBackLink 共享 contract

**目标**：按 Implementation lane 推进 `IMP-20`，在不扩大到 `IssueDetailPage` 内部重构的前提下，只做一个最小 execution unit：为 route shell 补齐 `pageBackLink` 共享 contract，并让 steady / cached-refetch 两个 `IssueDetailPage` 渲染分支统一消费该共享 seam；完成最小验证、review，并准备 feature/docs commit 闭环。

### 142.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、HEAD `5f9bbf40737ed971c5a7c4d446c68345454a161f`，工作树起始为干净，可安全推进单一 implementation execution unit |
| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 恢复唯一状态源、lane 明细、roadmap 约束与文档回写要求，确认本轮只允许推进 `IMP-20` |
| 复核 | `frontend/src/app/[workspaceSlug]/issue/[identifier]/[titleSlug]/page.tsx` / `frontend/src/components/issues/IssueDetailPage.tsx` / `frontend/src/lib/routes.test.tsx` | 识别 route shell 与 `IssueDetailPage` 之间仍残留 page back-link props 重复组装，适合作为 `IMP-20` 的单点 seam 收口 |
| 修改 | `frontend/src/app/[workspaceSlug]/issue/[identifier]/[titleSlug]/page.tsx` | 为 `IssueDetailRouteShellModel` 新增 `pageBackLink` 字段，并让 steady / cached-refetch 两个 `IssueDetailPage` 分支统一消费 `routeShellModel` / `backgroundRefetchRouteShellModel` 的共享 page back-link contract |
| 修改 | `frontend/src/lib/routes.test.tsx` | 扩展 `buildIssueDetailRouteShellModel(...)` helper 断言，新增 route 在 steady / cached-refetch 分支复用 shared `pageBackLink` 的回归测试 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：routes seam 定向测试 5 files / 51 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
| Review | `git diff -- frontend/src/app/[workspaceSlug]/issue/[identifier]/[titleSlug]/page.tsx frontend/src/lib/routes.test.tsx docs/status/roadmap-state.yaml docs/linear-parity/task-board.md` | 复核本轮只收口 pageBackLink seam 与状态文档，不跨到 capture lane 或 `IssueDetailPage` 内部 skeleton 实现 |

### 142.2 本轮落地结果

- `buildIssueDetailRouteShellModel(...)` 现在同时产出 route 级 `emptyState`、`loadingState` 与 `pageBackLink` 三类共享 contract；page back-link 不再只在 route 组件底部以局部 props 直传。
- issue detail route 的 cached-refetch 与 steady page 渲染分支现已统一消费 shared `pageBackLink`，与前一轮已完成的 loading/empty-state 分支一起，进一步收紧 route shell 与 `IssueDetailPage` 之间的 seam。
- routes seam 新增回归测试：既锁定 `buildIssueDetailRouteShellModel(...)` 的 `pageBackLink` 结构，也验证 route 在 cached-refetch/steady 两个 page 分支都会向 `IssueDetailPage` 传递共享 contract。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-20` -> `done`，下一轮转入 `IMP-21`，继续处理默认 page 分支残留的 back-link 重复组装。

### 142.3 经验沉淀

- 当 route shell helper 已开始承载 loading/empty-state contract 时，page-level 导航 props 也应尽快并入同一 shared model，否则 route JSX 仍会长期保留一小块“看似无害但重复”的直传 seam。
- 对于 UI route/page 边界的渐进式重构，可优先选择“先让更多 page 分支消费同一 shared model，再下一轮继续清理最后的默认分支”，这样更容易保持每轮 execution unit 足够小且可验证。

### 142.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-20 → IMP-21` |
| 当前分支 / HEAD（改动前） | `codex/unify-issue-model` / `5f9bbf40737ed971c5a7c4d446c68345454a161f` |
| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 51 tests） |
| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
| Diff 检查 | `git diff --check` ✅ |
| 当前闭环状态 | 代码与 docs/state 已更新，待 feature commit + docs/state commit + push |

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
## Session 152 — 2026-04-20：继续收口 legacy `/issues/[id]` route 空 back-link helper 命名/调用边界

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-31`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 当前 helper 级无 slug 空对象断言与 route 级空 props 断言的命名/调用边界是否仍存在可安全收紧的重复；若可行，则继续只做一刀测试收口并完成验证、review、提交、状态回写与 push 闭环。

### 152.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 读取 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认当前分支 `codex/unify-issue-model`、执行前 HEAD `fc79a77bc45bb9406f8fc40d9601a6a8376c39d2`，工作树起始干净，可安全继续单一 implementation execution unit |
| 读取 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/plans/2026-04-16-linear-parity-roadmap.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` / `frontend/src/app/issues/[id]/page.tsx` / `frontend/src/lib/routes.test.tsx` | 恢复唯一状态源、lane 明细、roadmap 与日志/工时回写要求，确认本轮只允许推进 `IMP-31`，且最小切口是把 helper 级无 slug 空对象断言提炼为 route/helper 共享的唯一 helper 入口 |
| 配置 | `git config user.name/user.email` | 再次确认 git author 使用 `offic0600 <offic0600@163.com>` |
| 修改 | `frontend/src/lib/routes.test.tsx` | 新增 `expectEmptyLegacyIssueDetailRouteBackLinkProps()` 作为 helper 级空对象 contract 唯一断言入口，并让 `expectLegacyIssueRouteEmptyBackLinkContract()` 在 route 级断言前先复用该 helper，减少 helper/route 对同一空 back-link 语义的重复表达 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` / `cd frontend && npx tsc --noEmit` / `git diff --check` | 三项验证均通过：routes seam 定向测试 5 files / 57 tests 全绿，TypeScript 检查通过，diff 无 whitespace 问题 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只继续收口 legacy route 空 back-link 测试 helper 的命名/调用边界，不改动 route 运行时逻辑，也未扩大到 helper 行为重构或第二个 execution unit |
| 提交 | `git commit -m "[verified] test: tighten legacy issue empty back-link helper seam"` | 完成本轮 feature/work commit，得到真实提交 `7863d4dff513306e6b12e0553c64e969d5dbb2bb` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-31` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-32`：评估空 back-link helper 命名是否还可进一步对齐 legacy/route 语义 |

### 152.2 本轮落地结果

- helper 级 `buildIssueDetailRouteBackLinkProps(...)` 无 slug 空对象断言现已收口为 `expectEmptyLegacyIssueDetailRouteBackLinkProps()` 单一 helper 入口。
- route 级 `expectLegacyIssueRouteEmptyBackLinkContract()` 现先复用上述 helper，再补 `IssueDetailPage` 空 props 渲染断言，从而明确“helper contract + route contract”是一层套一层的关系，而不是两份并列重复断言。
- route 运行时代码与 lookup seam 未变，作用面保持在测试层最小收口。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-31` -> `done`，下一轮转入 `IMP-32`，评估命名是否还可继续轻量对齐。

### 152.3 经验沉淀

- 当 helper 级 contract 与 route 级 contract 共享同一前置语义时，可让 route 级断言显式复用 helper 级断言，再叠加 route 专属期望；这样既保留层级边界，也能减少并列重复。
- 对纯测试层收口任务，若运行时代码不需变化，应优先把“共享前置 contract”抽成最小 helper，而不是提前重命名整批测试；这样更符合单 execution unit 的闭环要求。

### 152.4 关键数据快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-31 → IMP-32` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `fc79a77bc45bb9406f8fc40d9601a6a8376c39d2` |
| feature commit | `7863d4dff513306e6b12e0553c64e969d5dbb2bb` |
| 定向测试 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅（5 files, 57 tests） |
| TypeScript 检查 | `cd frontend && npx tsc --noEmit` ✅ |
| Diff 检查 | `git diff --check` ✅ |

