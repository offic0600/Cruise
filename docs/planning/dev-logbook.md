## Session 329 — 2026-04-21：清理 wording 振荡链并人工收口 Implementation lane

### 1. 本次目标
- 清理 IMP-205 至 IMP-214 在 legacy `/issues/[id]` route API 失败标题上的重复提交噪音。
- 保留最终真实代码状态 `getIssue rejects` / `getOrganizations rejects`，并把 task-board / roadmap-state / worktime 收口为“该链已人工结案、不再继续派生”。

### 2. 实施内容
| 操作 | 文件 | 说明 |
| --- | --- | --- |
| 保留 | `frontend/src/lib/routes.test.tsx` | 将 legacy route 两条 API 失败标题定格为 `getIssue rejects` / `getOrganizations rejects`，不再继续 restore/drop 摆动。 |
| 更新 | `docs/linear-parity/task-board.md` | 追加 `IMP-215` 人工结案行，并新增 stop conditions，禁止只围绕 wording/命名/对称性继续派生微任务。 |
| 更新 | `docs/status/roadmap-state.yaml` | 将 latest implementation 收口改写为人工结案结果，并把下一任务明确写成“暂无新的 Implementation 任务”。 |
| 更新 | `docs/worktime.md` | 删除 IMP-205~214 的重复工时噪音，改为一条人工清理与收口记录。 |
| 更新 | `docs/planning/dev-logbook.md` | 删除 Session 320~327 的重复 implementation 记录，仅保留 capture 闭环与本次人工结案说明。 |

### 3. 验证结果
| 命令 / 检查 | 结果 |
| --- | --- |
| `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过（5 files, 57 tests） |
| `cd frontend && ./node_modules/.bin/tsc --noEmit` | 通过 |
| `git diff --check` | 通过 |

### 4. Review 结论
- 这次清理不再引入新的产品行为变化，目标仅是删除重复提交噪音并保留最终稳定结果。
- Implementation lane 已经存在硬 stop condition；后续若没有新的运行时证据或 contract 变化，就不应再为同一组标题继续生成任务。

### 5. 状态快照
- 当前分支：`codex/unify-issue-model`
- 最终代码提交：`dc633bcc15836c5185a38597578d08590fa7be28`
- 当前 implementation 结论：`IMP-215 done`
- 当前 capture 状态：`CAP-08 blocked`，等待在独立干净工作树继续只读采集

### 6. 经验沉淀
- 当候选下一步只剩 wording/命名/对称性复评时，应直接停止，而不是继续生成微任务。
- 对 dead loop 的正确修复是“定义 stop condition + 人工收口 + 压缩历史”，而不是再跑一轮同类 cron。

---

## Session 328 — 2026-04-21：Capture lane 补齐 CAP-08 最新证据的 docs 闭环

### 1. 本次目标
- 严格按 capture lane 恢复 `AGENTS.md`、`docs/status/roadmap-state.yaml`、`docs/linear-parity/task-board.md`、`~/Desktop/Cruise/.hermes/linear-9222-watchdog/last-status.txt` 与 `tmp/linear-capture/summary.json`，判断是否存在“证据已更新但 docs 尚未闭环”的缺口。
- 若存在闭环缺失，则只做一个最小 execution unit：不重复采集、不进入 Implementation lane，仅将 CAP-08 最新 capture 事实写回 task-board / roadmap-state / dev-logbook / worktime。

### 2. 实施内容
| 操作 | 文件 | 说明 |
| --- | --- | --- |
| 读取 | `AGENTS.md` | 复核仓库工作纪律、日志要求与工时记录约束。 |
| 读取 | `docs/status/roadmap-state.yaml` | 确认唯一恢复状态源当前已对齐 `Capture / CAP-08`，但 blocker 文案仍停留在 19:24 CST。 |
| 读取 | `docs/linear-parity/task-board.md` | 确认 Capture lane 当前任务仍是最早可恢复的 `CAP-08`，且行内 blocker 尚未反映 `summary.json` 19:45 CST 的更新。 |
| 读取 | `~/Desktop/Cruise/.hermes/linear-9222-watchdog/last-status.txt` | 再次确认 `consumer_policy=attached_cdp_only`、`metadata_layer=ok`、`websocket_attach=ok`，因此本轮继续禁止 Hermes 内置 `browser_*`。 |
| 读取 | `tmp/linear-capture/summary.json` 与文件时间戳 | 核对 `summary.json` 已在 19:45 CST 晚于 task-board / roadmap-state / dev-logbook / worktime 的最近写回，说明当前缺口是 docs 闭环而非 capture 未生效。 |
| 更新 | `docs/linear-parity/task-board.md` | 将 CAP-08 blocker 改写为 20:18 CST closeout：明确本轮未重复采集，而是补齐 capture lane docs 闭环，并继续把 blocker 记为工作树闭环风险而非附着失败。 |
| 更新 | `docs/status/roadmap-state.yaml` | 将 `current_task` 继续维持为 `Capture / CAP-08`，并把 blocker 文案改写为“最新证据已刷新、当前优先修复 docs 闭环缺失”的真实状态。 |
| 更新 | `docs/planning/dev-logbook.md` | 记录本次 Session 328 的恢复、证据核对与 docs closeout。 |
| 更新 | `doc/worktime.md` | 追加 Session 328 的 capture lane docs 闭环工时记录，明确未提交。 |

### 3. 验证结果
| 命令 / 检查 | 结果 |
| --- | --- |
| `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 已执行；确认仓库位于 `codex/unify-issue-model`，HEAD=`84a2073818b080bf5b3362d3a6575a176288b244`，近期最新提交为 `84a2073 [verified] docs: capture CAP-08 state refresh`。 |
| `stat` 比较 `tmp/linear-capture/summary.json` 与 docs 文件时间 | 已确认 `summary.json` 19:45:09 晚于 `docs/linear-parity/task-board.md` 19:33:38、`docs/planning/dev-logbook.md` 19:34:25、`doc/worktime.md` 19:34:25、`docs/status/roadmap-state.yaml` 19:33:38。 |
| 重读 `docs/linear-parity/task-board.md` / `docs/status/roadmap-state.yaml` / `docs/planning/dev-logbook.md` / `doc/worktime.md` 相关片段 | 已确认 CAP-08 仍为 Capture lane 当前任务，且 blocker / handoff 文案已对齐到“证据已刷新、当前补齐 docs 闭环”的事实。 |
| `git diff -- docs/linear-parity/task-board.md docs/status/roadmap-state.yaml docs/planning/dev-logbook.md doc/worktime.md` | 已执行；确认本轮仅落下 capture lane 文档闭环改动，无 Implementation 代码改动。 |

### 4. Review 结论
- watchdog 仍然健康：`attached_cdp_only + websocket_attach=ok` 成立，因此这轮不能把 blocker 误写成附着失败。
- 当前最真实的 execution unit 是“修复 CAP-08 证据已刷新但 docs 未同步”的闭环缺口，而不是重复做一次 capture。
- 本轮边界仅限 Capture lane 文档闭环；未进入 Implementation lane，也未新增产品实现或持久提交到 Linear。

### 5. 状态快照
- 当前分支：`codex/unify-issue-model`
- 当前 HEAD：`84a2073818b080bf5b3362d3a6575a176288b244`
- 当前 lane / task：`Capture / CAP-08（blocked）`
- watchdog：`consumer_policy=attached_cdp_only`、`websocket_attach=ok`
- 最新证据：`tmp/linear-capture/summary.json` 及同批 `.png/.json` 已刷新到 2026-04-21 19:45 CST，包含 `baselineAfterTabs`、`issueDetail`、`issueDirect` 与 `interactions` 结构
- Git commit hash：`未提交（本轮仅补齐 docs 闭环）`

### 6. 经验沉淀
- 对 capture cron 来说，只要 watchdog 仍声明 `attached_cdp_only` 且 `websocket_attach=ok`，就应优先判断“最新证据产物是否晚于 docs”，若是，则先修 docs 闭环，避免无意义重复采集。
- 当 `summary.json` 与同批 `.png/.json` 已经更新，而 task-board / roadmap-state / logbook / worktime 仍停在旧时间点时，应把问题分类为“状态闭环缺失”，而不是误报为 capture 失败或附着失败。

## Session 319 — 2026-04-21：重新评估并恢复第二条 legacy route API 失败标题中的 route wording

**目标**：按 Implementation lane 推进 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-204` 最小增量，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：基于当前 `route getIssue rejects` / `getOrganizations rejects` 组合，复核第二条 API 失败场景标题是否需要恢复为 `route getOrganizations rejects` 以继续维持与 helper 级 lookup 标题的层级区分；若需要，则仅改这一处标题并完成验证、review、提交、状态写回与 push 闭环。

### 319.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与任务板在本轮开始前已指向 `IMP-204`，工作树干净，可按唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第二条 API 失败场景标题从 `getOrganizations rejects` 恢复为 `route getOrganizations rejects`；保持第一条 `route getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && ./node_modules/.bin/tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 reviewer 判定无安全或逻辑问题，review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore second legacy route reject wording again"` | 完成本轮 feature/work commit，提交后以 `git rev-parse HEAD` 记录真实 SHA。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-204` 作为最新完成的 Implementation lane 最小增量写回，并补一条新的后继 `pending` Implementation 任务 `IMP-205` 供下一轮恢复。 |

### 319.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在当前 `route getIssue rejects` / `getOrganizations rejects` 非对称组合下，第二条 API 失败标题也需要恢复为 `route getOrganizations rejects`，以继续维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题恢复为 `route getOrganizations rejects`，同时保持第一条 `route getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml`、`docs/linear-parity/task-board.md`、`docs/planning/dev-logbook.md` 与 `doc/worktime.md` 已写回：`IMP-204` 作为最新完成项，下一轮转入重新评估当前再次双 route wording 组合下第一条 API 失败场景标题是否仍可收口为无 route wording。

### 319.3 经验沉淀

- 即使第一条 route 级标题已恢复，在非对称 wording 组合下仍需单独复核第二条 API 失败标题；不能因为 helper seam wording 已清晰，就默认第二条 route 标题无需恢复。
- 纯测试标题微调同样要走完整闭环：验证、独立 review、feature commit、状态文件/任务板/logbook/worktime 回写缺一不可。

### 319.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-204 → IMP-205` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / 733b63ea4d5bb4124e9a0b63594c9b03e9e55afe |
| feature commit | `e5e69a1253fe5b3cc9fedb3440360bf30b1a184a` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`./node_modules/.bin/tsc --noEmit`、`git diff --check` |

---

## Session 318 — 2026-04-21：重新评估并恢复第一条 legacy route API 失败标题中的 route wording

**目标**：按 Implementation lane 推进 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-203` 最小增量，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：基于当前 `getIssue rejects` / `getOrganizations rejects` 组合，复核第一条 API 失败场景标题是否需要恢复为 `route getIssue rejects` 以继续维持与 helper 级 lookup 标题的层级区分；若需要，则仅改这一处标题并完成验证、review、提交、状态写回与 push 闭环。

### 318.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与任务板在本轮开始前已指向 `IMP-203`，工作树干净，可按唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第一条 API 失败场景标题从 `getIssue rejects` 恢复为 `route getIssue rejects`；保持第二条 `getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && ./node_modules/.bin/tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 reviewer 判定无安全或逻辑问题，review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore first legacy route reject wording again"` | 完成本轮 feature/work commit，提交后以 `git rev-parse HEAD` 记录真实 SHA。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 将 `IMP-203` 作为最新完成的 Implementation lane 最小增量写回，并补一条新的后继 `pending` Implementation 任务 `IMP-204` 供下一轮恢复。 |

### 318.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在当前 `getIssue rejects` / `getOrganizations rejects` 双无 route wording 组合下，第一条 API 失败标题需要恢复为 `route getIssue rejects`，以继续维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题恢复为 `route getIssue rejects`，同时保持第二条 `getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml`、`docs/linear-parity/task-board.md`、`docs/planning/dev-logbook.md` 与 `docs/worktime.md` 已写回：`IMP-203` 作为最新完成项，下一轮转入重新评估当前再次非对称 wording 组合下第二条 API 失败场景标题是否需要恢复 route 级语义词。

### 318.3 经验沉淀

- 即使 helper 级 lookup 标题已明确保留 seam 语义，在双无 route wording 组合下仍需单独复核第一条 API 失败标题；不能因为上一轮也曾收口同类 wording，就默认当前组合仍然稳定。
- 纯测试标题微调同样要走完整闭环：验证、独立 review、feature commit、状态文件/任务板/logbook/worktime 回写缺一不可。

### 318.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-203 → IMP-204` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / 0c069d97fa05a4881140c553fa03f88b9b9a1397 |
| feature commit | `a6a028d34bd6acf81519add9dd67dcd1b0371101` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`./node_modules/.bin/tsc --noEmit`、`git diff --check` |

---

## Session 317 — 2026-04-21：重新评估并再次收口第二条 legacy route API 失败标题中的 route wording

**目标**：按 Implementation lane 推进 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-202` 最小增量，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：基于当前 `getIssue rejects` / `route getOrganizations rejects` 组合，复核第二条 API 失败场景标题是否仍可再次收口为 `getOrganizations rejects` 以继续维持与 helper 级 lookup 标题的层级区分；若可行，则仅改这一处标题并完成验证、review、提交、状态写回与 push 闭环。

### 317.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与任务板在本轮开始前已指向 `IMP-202`，工作树干净，可按唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第二条 API 失败场景标题从 `route getOrganizations rejects` 再次收口为 `getOrganizations rejects`；保持第一条 `getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && ./node_modules/.bin/tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 reviewer 判定无安全或逻辑问题，review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: drop second legacy route reject title again"` | 完成本轮 feature/work commit，提交后以 `git rev-parse HEAD` 记录真实 SHA。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 将 `IMP-202` 作为最新完成的 Implementation lane 最小增量写回，并补一条新的后继 `pending` Implementation 任务 `IMP-203` 供下一轮恢复。 |

### 317.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在当前 `getIssue rejects` / `route getOrganizations rejects` 非对称组合下，第二条 API 失败标题仍可再次收口为 `getOrganizations rejects`，同时继续维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题再次收口为 `getOrganizations rejects`，同时保持第一条 `getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml`、`docs/linear-parity/task-board.md`、`docs/planning/dev-logbook.md` 与 `docs/worktime.md` 已写回：`IMP-202` 作为最新完成项，下一轮转入重新评估当前再次双无 route wording 组合下第一条 API 失败场景标题是否需要恢复 route 级语义词。

### 317.3 经验沉淀

- 当第一条标题已收口为无 route wording 而第二条仍带 route 前缀时，仍需单独复核第二条标题是否可再次收口；不能因为当前呈现非对称 wording，就默认第二条必须持续保留 route 前缀。
- 纯测试标题微调同样要走完整闭环：验证、独立 review、feature commit、状态文件/任务板/logbook/worktime 回写缺一不可。

### 317.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-202 → IMP-203` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / 2e489a219a56e2795759b44e05c19a995edf747a |
| feature commit | `0c1aa07d26dcfcc2b467a838d062990530241773` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`./node_modules/.bin/tsc --noEmit`、`git diff --check` |

---

## Session 316 — 2026-04-21：重新评估并再次收口第一条 legacy route API 失败标题中的 route wording

**目标**：按 Implementation lane 推进 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-201` 最小增量，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：基于当前 `route getIssue rejects` / `route getOrganizations rejects` 组合，复核第一条 API 失败场景标题是否仍可再次收口为 `getIssue rejects` 以继续维持与 helper 级 lookup 标题的层级区分；若可行，则仅改这一处标题并完成验证、review、提交、状态写回与 push 闭环。

### 316.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与任务板在本轮开始前已指向 `IMP-201`，工作树干净，可按唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第一条 API 失败场景标题从 `route getIssue rejects` 再次收口为 `getIssue rejects`；保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && ./node_modules/.bin/tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 reviewer 判定无安全或逻辑问题，review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore first legacy route reject wording"` | 完成本轮 feature/work commit，提交后以 `git rev-parse HEAD` 记录真实 SHA。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 将 `IMP-201` 作为最新完成的 Implementation lane 最小增量写回，并补一条新的后继 `pending` Implementation 任务 `IMP-202` 供下一轮恢复。 |

### 316.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在当前 `route getIssue rejects` / `route getOrganizations rejects` 双 route wording 组合下，第一条 API 失败标题仍可再次收口为 `getIssue rejects`，同时继续维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题再次收口为 `getIssue rejects`，同时保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml`、`docs/linear-parity/task-board.md`、`docs/planning/dev-logbook.md` 与 `docs/worktime.md` 已写回：`IMP-201` 作为最新完成项，下一轮转入重新评估当前再次非对称 wording 组合下第二条 API 失败场景标题是否仍可收口为无 route wording。

### 316.3 经验沉淀

- 当双 route wording 组合已形成后，仍需单独复核第一条标题是否可以再次收口；不能因为上一轮刚恢复第二条 route wording，就默认第一条必须继续保留 route 前缀。
- 纯测试标题微调同样要走完整闭环：验证、独立 review、feature commit、状态文件/任务板/logbook/worktime 回写缺一不可。

### 316.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-201 → IMP-202` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / 15a249b5fa40525c4044b0e672c2550f472ab3d9 |
| feature commit | `d85dabdbadb520c2882b5836e24f9c99fd23e8dd` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`./node_modules/.bin/tsc --noEmit`、`git diff --check` |

## Session 315 — 2026-04-21：重新评估并恢复第二条 legacy route API 失败标题中的 route wording

**目标**：按 Implementation lane 推进 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-200` 最小增量，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：基于当前 `route getIssue rejects` / `getOrganizations rejects` 组合，复核第二条 API 失败场景标题是否需要恢复为 `route getOrganizations rejects` 以继续维持与 helper 级 lookup 标题的层级区分；若需要，则仅改这一处标题并完成验证、review、提交、状态写回与 push 闭环。

### 315.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与任务板在本轮开始前已指向 `IMP-200`，工作树干净，可按唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第二条 API 失败场景标题从 `getOrganizations rejects` 恢复为 `route getOrganizations rejects`；保持第一条 `route getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && ./node_modules/.bin/tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore second legacy route reject wording"` | 完成本轮 feature/work commit，提交后以 `git rev-parse HEAD` 记录真实 SHA。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 将 `IMP-200` 作为最新完成的 Implementation lane 最小增量写回，并补一条新的后继 `pending` Implementation 任务 `IMP-201` 供下一轮恢复。 |

### 315.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在当前 `route getIssue rejects` / `getOrganizations rejects` 组合下，第二条 API 失败标题也需要恢复为 `route getOrganizations rejects`，以继续维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题恢复为 `route getOrganizations rejects`，同时保持第一条 `route getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml`、`docs/linear-parity/task-board.md`、`docs/planning/dev-logbook.md` 与 `docs/worktime.md` 已写回：`IMP-200` 作为最新完成项，下一轮转入重新评估当前再次双 route wording 组合下第一条 API 失败场景标题是否仍可收口为无 route wording。

### 315.3 经验沉淀

- 当第一条标题已恢复为 `route getIssue rejects` 后，需要继续单独复核第二条标题是否也应恢复 route 前缀，不能把“已有一条 route wording”误判为整体层级区分已经充分。
- 纯测试标题微调仍需同步把状态文件、任务板、logbook 与 worktime 一次写回到下一条 pending Implementation 任务，避免 fresh session 继续停在已完成项。

### 315.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-200 → IMP-201` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `42ab578cdbc612d75ab382c5aa0f5507254d798f` |
| feature commit | `15a249b5fa40525c4044b0e672c2550f472ab3d9` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`./node_modules/.bin/tsc --noEmit`、`git diff --check` |

## Session 314 — 2026-04-21：重新评估并恢复第一条 legacy route API 失败标题中的 route wording

**目标**：按 Implementation lane 推进 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-199` 最小增量，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：基于当前 `getIssue rejects` / `getOrganizations rejects` 组合，复核第一条 API 失败场景标题是否需要恢复为 `route getIssue rejects` 以继续维持与 helper 级 lookup 标题的层级区分；若需要，则仅改这一处标题并完成验证、review、提交、状态写回与 push 闭环。

### 314.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与任务板在本轮开始前已指向 `IMP-199`，工作树干净，可按唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第一条 API 失败场景标题从 `getIssue rejects` 恢复为 `route getIssue rejects`；保持第二条 `getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && ./node_modules/.bin/tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore first legacy route reject wording"` | 完成本轮 feature/work commit，提交后以 `git rev-parse HEAD` 记录真实 SHA。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 将 `IMP-199` 作为最新完成的 Implementation lane 最小增量写回，并补一条新的后继 `pending` Implementation 任务 `IMP-200` 供下一轮恢复。 |

### 314.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在当前 `getIssue rejects` / `getOrganizations rejects` 双无 route wording 组合下，第一条 API 失败标题需要恢复为 `route getIssue rejects`，以继续维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题恢复为 `route getIssue rejects`，同时保持第二条 `getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml`、`docs/linear-parity/task-board.md`、`docs/planning/dev-logbook.md` 与 `docs/worktime.md` 已写回：`IMP-199` 作为最新完成项，下一轮转入重新评估当前恢复第一条 route wording 后第二条 API 失败场景标题是否也需恢复 route 级语义词。

### 314.3 经验沉淀

- 当当前组合已经变成 `getIssue rejects` / `getOrganizations rejects` 双无 route wording 状态时，需要单独复核第一条标题是否应恢复 route 前缀，不能仅因 helper 级标题仍明确就默认 route 层级区分已足够。
- 纯测试标题微调仍需同步把状态文件、任务板、logbook 与 worktime 一次写回到下一条 pending Implementation 任务，避免 fresh session 继续停在已完成项。

### 314.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-199 → IMP-200` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `275a6f843f2a5a075fc5dd2a25eb110ce73c0b0d` |
| feature commit | `8e319603ce4bd4af2aa858f75a3d2a26e769d7b1` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`./node_modules/.bin/tsc --noEmit`、`git diff --check` |

## Session 313 — 2026-04-21：重新评估并再次收口第二条 legacy route API 失败标题中的 route wording

**目标**：按 Implementation lane 推进 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-198` 最小增量，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：基于当前 `getIssue rejects` / `route getOrganizations rejects` 组合，复核第二条 API 失败场景标题是否仍可再次收口为 `getOrganizations rejects` 以继续维持与 helper 级 lookup 标题的层级区分；若可行，则仅改这一处标题并完成验证、review、提交、状态写回与 push 闭环。

### 313.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与任务板在本轮开始前已指向 `IMP-198`，工作树干净，可按唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第二条 API 失败场景标题从 `route getOrganizations rejects` 再次收口为 `getOrganizations rejects`；保持第一条 `getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && ./node_modules/.bin/tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: drop second legacy route reject wording again"` | 完成本轮 feature/work commit，提交后以 `git rev-parse HEAD` 记录真实 SHA。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 将 `IMP-198` 作为最新完成的 Implementation lane 最小增量写回，并补一条新的后继 `pending` Implementation 任务 `IMP-199` 供下一轮恢复。 |

### 313.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且当前保持 `getIssue rejects` / `route getOrganizations rejects` 非对称组合时，第二条 API 失败标题仍可再次收口为 `getOrganizations rejects`，同时继续维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题再次收口为 `getOrganizations rejects`，同时保持第一条 `getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml`、`docs/linear-parity/task-board.md`、`docs/planning/dev-logbook.md` 与 `docs/worktime.md` 已写回：`IMP-198` 作为最新完成项，下一轮转入重新评估当前再次双无 route wording 组合下第一条 API 失败场景标题是否需要恢复 route 级语义词。

### 313.3 经验沉淀

- 当当前组合已经变成 `getIssue rejects` / `route getOrganizations rejects` 这种非对称状态时，仍需单独复核第二条标题是否可再次安全收口，不能仅因上一轮刚收口第一条标题就默认第二条必须继续保留 route 前缀。
- 纯测试标题微调仍需同步把状态文件、任务板、logbook 与 worktime 一次写回到下一条 pending Implementation 任务，避免 fresh session 继续停在已完成项。

### 313.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-198 → IMP-199` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `cf880465a39d0df881963ae7e729b6bf310d6cc0` |
| feature commit | `d4c75ab7f353ef6a2523de5b5986f52b3c71f774` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`./node_modules/.bin/tsc --noEmit`、`git diff --check` |

## Session 312 — 2026-04-21：重新评估并再次收口第一条 legacy route API 失败标题中的 route wording

**目标**：按 Implementation lane 推进 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-197` 最小增量，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：基于当前 `route getIssue rejects` / `route getOrganizations rejects` 组合，复核第一条 API 失败场景标题是否仍可再次收口为 `getIssue rejects` 以继续维持与 helper 级 lookup 标题的层级区分；若可行，则仅改这一处标题并完成验证、review、提交、状态写回与 push 闭环。

### 312.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与任务板在本轮开始前已指向 `IMP-197`，工作树干净，可按唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第一条 API 失败场景标题从 `route getIssue rejects` 再次收口为 `getIssue rejects`；保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && ./node_modules/.bin/tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: re-tighten first legacy route reject wording"` | 完成本轮 feature/work commit，提交后以 `git rev-parse HEAD` 记录真实 SHA。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-197` 作为最新完成的 Implementation lane 最小增量写回，并补一条新的后继 `pending` Implementation 任务 `IMP-198` 供下一轮恢复。 |

### 312.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且当前保持 `route getIssue rejects` / `route getOrganizations rejects` 双 route wording 组合时，第一条 API 失败标题仍可再次收口为 `getIssue rejects`，同时继续维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题再次收口为 `getIssue rejects`，同时保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml`、`docs/linear-parity/task-board.md`、`docs/planning/dev-logbook.md` 与 `doc/worktime.md` 已写回：`IMP-197` 作为最新完成项，下一轮转入重新评估当前再次非对称 wording 组合下第二条 API 失败场景标题是否仍可收口为无 route wording。

### 312.3 经验沉淀

- 即使当前两条 route 级 API 失败标题再次形成双 route wording 组合，也要单独复核第一条标题是否仍可安全收口，不能因为上一轮刚恢复第二条标题就默认第一条必须继续保留 route 前缀。
- 纯测试标题微调仍需同步把状态文件、任务板、logbook 与 worktime 一次写回到下一条 pending Implementation 任务，避免 fresh session 继续停在已完成项。

### 312.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-197 → IMP-198` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `33e342e2989c4e4094ee134881f6377952533c8d` |
| feature commit | `e94cca3ae4a73cc87b54dcf8bab8ece36b1d65f2` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`./node_modules/.bin/tsc --noEmit`、`git diff --check` |

## Session 311 — 2026-04-21：重新评估并恢复第二条 legacy route API 失败标题中的 route wording

**目标**：按 Implementation lane 推进 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-196` 最小增量，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：基于当前 `route getIssue rejects` / `getOrganizations rejects` 组合，复核第二条 API 失败场景标题是否需要恢复为 `route getOrganizations rejects` 以继续维持与 helper 级 lookup 标题的层级区分；若需要，则仅改这一处标题并完成验证、review、提交、状态写回与 push 闭环。

### 311.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与任务板在本轮开始前已指向 `IMP-196`，工作树干净，可按唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第二条 API 失败场景标题从 `getOrganizations rejects` 恢复为 `route getOrganizations rejects`；保持第一条 `route getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && ./node_modules/.bin/tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore second legacy route reject wording"` | 完成本轮 feature/work commit，提交后以 `git rev-parse HEAD` 记录真实 SHA。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 将 `IMP-196` 作为最新完成的 Implementation lane 最小增量写回，并补一条新的后继 `pending` Implementation 任务 `IMP-197` 供下一轮恢复。 |

### 311.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且当前保持 `route getIssue rejects` / `getOrganizations rejects` 非对称组合时，第二条 API 失败标题也需要恢复为 `route getOrganizations rejects`，以继续维持两条 route 级 API 失败标题与 helper 级 lookup 标题之间的层级区分。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题恢复为 `route getOrganizations rejects`，同时保持第一条 `route getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml`、`docs/linear-parity/task-board.md`、`docs/planning/dev-logbook.md` 与 `docs/worktime.md` 已写回：`IMP-196` 作为最新完成项，下一轮转入重新评估当前再次双 route wording 组合下第一条 API 失败场景标题是否仍可收口为无 route wording。

### 311.3 经验沉淀

- 即使第一条 route 级 API 失败标题已恢复为 `route getIssue rejects`，也要单独复核第二条标题是否同样需要恢复 route 级语义词，不能因为当前组合已部分恢复 route wording 就默认第二条继续无 route wording 仍然安全。
- 纯测试标题微调仍需同步把状态文件、任务板、logbook 与 worktime 一次写回到下一条 pending Implementation 任务，避免 fresh session 继续停在已完成项。

### 311.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-196 → IMP-197` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `d9a5e6a5d0a7505c60552548fff394533ad1c2d6` |
| feature commit | `9879117f0a50c1006842a0d51c610950f13ca9f5` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`./node_modules/.bin/tsc --noEmit`、`git diff --check` |

## Session 310 — 2026-04-21：重新评估并恢复第一条 legacy route API 失败标题中的 route wording

**目标**：按 Implementation lane 推进 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-195` 最小增量，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：基于当前 `getIssue rejects` / `getOrganizations rejects` 组合，复核第一条 API 失败场景标题是否需要恢复为 `route getIssue rejects` 以继续维持与 helper 级 lookup 标题的层级区分；若需要，则仅改这一处标题并完成验证、review、提交、状态写回与 push 闭环。

### 310.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与任务板在本轮开始前已指向 `IMP-195`，工作树干净，可按唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第一条 API 失败场景标题从 `getIssue rejects` 恢复为 `route getIssue rejects`；保持第二条 `getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && ./node_modules/.bin/tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore first legacy route reject wording"` | 完成本轮 feature/work commit，提交后以 `git rev-parse HEAD` 记录真实 SHA。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 将 `IMP-195` 作为最新完成的 Implementation lane 最小增量写回，并补一条新的后继 `pending` Implementation 任务 `IMP-196` 供下一轮恢复。 |

### 310.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且当前保持 `getIssue rejects` / `getOrganizations rejects` 双无 route wording 组合时，第一条 API 失败标题需要恢复为 `route getIssue rejects`，以继续维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题恢复为 `route getIssue rejects`，同时保持第二条 `getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml`、`docs/linear-parity/task-board.md`、`docs/planning/dev-logbook.md` 与 `docs/worktime.md` 已写回：`IMP-195` 作为最新完成项，下一轮转入重新评估当前再次非对称 wording 组合下第二条 API 失败场景标题是否需要恢复 route 级语义词。

### 310.3 经验沉淀

- 即使当前两条 route 级 API 失败标题已再次形成双无 route wording 组合，也要单独复核第一条标题是否需要恢复 route 级语义词，不能因为上一轮刚收口第二条标题就默认第一条继续无 route wording 仍然安全。
- 纯测试标题微调仍需同步把状态文件、任务板、logbook 与 worktime 一次写回到下一条 pending Implementation 任务，避免 fresh session 继续停在已完成项。

### 310.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-195 → IMP-196` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `47785cfefba97973d5ea397ff002defa083c53fe` |
| feature commit | `332e1904c2a4161290ce59cd16d518d3e465ba21` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`./node_modules/.bin/tsc --noEmit`、`git diff --check` |

## Session 309 — 2026-04-21：重新评估并再次收口第二条 legacy route API 失败标题中的 route wording

**目标**：按 Implementation lane 推进 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-194` 最小增量，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：基于当前 `getIssue rejects` / `route getOrganizations rejects` 组合，复核第二条 API 失败场景标题是否仍可再次收口为 `getOrganizations rejects` 以继续维持与 helper 级 lookup 标题的层级区分；若可行，则仅改这一处标题并完成验证、review、提交、状态写回与 push 闭环。

### 309.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与任务板在本轮开始前已指向 `IMP-194`，工作树干净，可按唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第二条 API 失败场景标题从 `route getOrganizations rejects` 再次收口为 `getOrganizations rejects`；保持第一条 `getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && ./node_modules/.bin/tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: drop second legacy route reject title again"` | 完成本轮 feature/work commit，提交后以 `git rev-parse HEAD` 记录真实 SHA。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 将 `IMP-194` 作为最新完成的 Implementation lane 最小增量写回，并补一条新的后继 `pending` Implementation 任务 `IMP-195` 供下一轮恢复。 |

### 309.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且当前保持 `getIssue rejects` / `route getOrganizations rejects` 组合时，第二条 API 失败标题仍可再次收口为 `getOrganizations rejects`，同时继续维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题再次收口为 `getOrganizations rejects`，同时保持第一条 `getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml`、`docs/linear-parity/task-board.md`、`docs/planning/dev-logbook.md` 与 `docs/worktime.md` 已写回：`IMP-194` 作为最新完成项，下一轮转入重新评估当前再次双无 route wording 组合下第一条 API 失败场景标题是否需要恢复 route 级语义词。

### 309.3 经验沉淀

- 即使两条 route 级 API 失败标题已再次形成非对称组合，也要单独复核第二条标题是否仍可安全收口，不能因为上一轮刚调整第一条标题就默认第二条必须保留 route 级语义词。
- 纯测试标题微调仍需同步把状态文件、任务板、logbook 与 worktime 一次写回到下一条 pending Implementation 任务，避免 fresh session 继续停在已完成项。

### 309.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-194 → IMP-195` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `1d115c275c68101a941b1f97d16beda6bf2df43e` |
| feature commit | `7018c92ac6c0c7c62230c2d0e36eaf9e9ea6464a` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`./node_modules/.bin/tsc --noEmit`、`git diff --check` |


## Session 308 — 2026-04-21：重新评估并再次收口第一条 legacy route API 失败标题中的 route wording

**目标**：按 Implementation lane 推进 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-193` 最小增量，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：基于当前 `route getIssue rejects` / `route getOrganizations rejects` 组合，复核第一条 API 失败场景标题是否仍可再次收口为 `getIssue rejects` 以继续维持与 helper 级 lookup 标题的层级区分；若可行，则仅改这一处标题并完成验证、review、提交、状态写回与 push 闭环。

### 308.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与任务板在本轮开始前已指向 `IMP-193`，工作树干净，可按唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第一条 API 失败场景标题从 `route getIssue rejects` 再次收口为 `getIssue rejects`；保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && ./node_modules/.bin/tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: drop first legacy route reject title again"` | 完成本轮 feature/work commit，提交后以 `git rev-parse HEAD` 记录真实 SHA。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 将 `IMP-193` 作为最新完成的 Implementation lane 最小增量写回，并补一条新的后继 `pending` Implementation 任务 `IMP-194` 供下一轮恢复。 |

### 308.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且当前保持 `route getIssue rejects` / `route getOrganizations rejects` 组合时，第一条 API 失败标题仍可再次收口为 `getIssue rejects`，同时继续维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题再次收口为 `getIssue rejects`，同时保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml`、`docs/linear-parity/task-board.md`、`docs/planning/dev-logbook.md` 与 `docs/worktime.md` 已写回：`IMP-193` 作为最新完成项，下一轮转入重新评估当前再次非对称 wording 组合下第二条 API 失败场景标题是否仍可再次收口为无 route wording。

### 308.3 经验沉淀

- 在 helper 级 lookup 标题保持显式的前提下，即使刚恢复到双 route wording 组合，也要单独复核第一条 API 失败标题是否已具备再次收口为无 route wording 的条件，不能机械沿用上一轮结论。
- 纯测试标题微调仍需同步把状态文件、任务板、logbook 与 worktime 一次写回到下一条 pending Implementation 任务，避免 fresh session 继续停在已完成项。

### 308.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-193 → IMP-194` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `f6fba00343133761a55cb271d9edbe8bab54157a` |
| feature commit | `b34be8d7fd71e5dc72cc7379a5541a2899f875cb` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`./node_modules/.bin/tsc --noEmit`、`git diff --check` |


## Session 307 — 2026-04-21：重新评估并恢复第二条 legacy route API 失败标题中的 route wording

**目标**：按 Implementation lane 推进 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-192` 最小增量，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：基于当前 `route getIssue rejects` / `getOrganizations rejects` 组合，复核第二条 API 失败场景标题是否需要恢复为 `route getOrganizations rejects` 以继续维持与 helper 级 lookup 标题的层级区分；若需要，则仅改这一处标题并完成验证、review、提交、状态写回与 push 闭环。

### 307.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与任务板在本轮开始前已指向 `IMP-192`，工作树干净，可按唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第二条 API 失败场景标题从 `getOrganizations rejects` 恢复为 `route getOrganizations rejects`；保持第一条 `route getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && ./node_modules/.bin/tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore second legacy route wording again"` | 完成本轮 feature/work commit，提交后以 `git rev-parse HEAD` 记录真实 SHA。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 将 `IMP-192` 作为最新完成的 Implementation lane 最小增量写回，并补一条新的后继 `pending` Implementation 任务 `IMP-193` 供下一轮恢复。 |

### 307.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且当前保持 `route getIssue rejects` / `getOrganizations rejects` 组合时，第二条 API 失败标题需要恢复为 `route getOrganizations rejects`，以继续维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题恢复为 `route getOrganizations rejects`，同时保持第一条 `route getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml`、`docs/linear-parity/task-board.md`、`docs/planning/dev-logbook.md` 与 `docs/worktime.md` 已写回：`IMP-192` 作为最新完成项，下一轮转入重新评估再次双 route wording 组合下第一条 API 失败场景标题是否仍可再次收口为无 route wording。

### 307.3 经验沉淀

- 当第一条 legacy route API 失败标题已恢复 route wording 后，第二条标题仍需单独复核是否也要恢复 route 级语义词，不能因为上一轮已恢复第一条就默认第二条结论不变。
- 纯测试标题微调依然要在状态文件与任务板中立即补出后继 pending Implementation 任务，避免下一轮实现 cron 停在已完成项。

### 307.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-192 → IMP-193` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `d46f81525674743a147457550f81afcdc6a9495b` |
| feature commit | `49f3fbcb0cbd863738e36ca52a1ba8b7fbe3abf4` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`./node_modules/.bin/tsc --noEmit`、`git diff --check` |


## Session 306 — 2026-04-21：重新评估并恢复第一条 legacy route API 失败标题中的 route wording

**目标**：按 Implementation lane 推进 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-191` 最小增量，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：基于当前 `getIssue rejects` / `getOrganizations rejects` 组合，复核第一条 API 失败场景标题是否需要恢复为 `route getIssue rejects` 以继续维持与 helper 级 lookup 标题的层级区分；若需要，则仅改这一处标题并完成验证、review、提交、状态写回与 push 闭环。

### 306.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与任务板在本轮开始前已指向 `IMP-191`，工作树干净，可按唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第一条 API 失败场景标题从 `getIssue rejects` 恢复为 `route getIssue rejects`；保持第二条 `getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && ./node_modules/.bin/tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore first legacy route wording again"` | 完成本轮 feature/work commit，提交后以 `git rev-parse HEAD` 记录真实 SHA。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 将 `IMP-191` 作为最新完成的 Implementation lane 最小增量写回，并补一条新的后继 `pending` Implementation 任务 `IMP-192` 供下一轮恢复。 |

### 306.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且当前保持 `getIssue rejects` / `getOrganizations rejects` 双无 route wording 组合时，第一条 API 失败标题需要恢复为 `route getIssue rejects`，以继续维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题恢复为 `route getIssue rejects`，同时保持第二条 `getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml`、`docs/linear-parity/task-board.md`、`docs/planning/dev-logbook.md` 与 `docs/worktime.md` 已写回：`IMP-191` 作为最新完成项，下一轮转入重新评估第一条恢复 route wording 后第二条 API 失败场景标题是否也需要恢复 route wording。

### 306.3 经验沉淀

- 当 legacy route 两条 API 失败标题同时处于双无 route wording 组合时，第一条标题需要单独复核是否应恢复 route 级语义词，不能默认沿用前一轮的收口结论。
- 纯测试标题微调依然要在状态文件与任务板中立即补出后继 pending Implementation 任务，避免下一轮实现 cron 停在已完成项。

### 306.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-191 → IMP-192` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `46137632b557688be96f9535d7fa9c63978219a4` |
| feature commit | `d46f81525674743a147457550f81afcdc6a9495b` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`./node_modules/.bin/tsc --noEmit`、`git diff --check` |


## Session 305 — 2026-04-21：重新评估并再次收口第二条 legacy route API 失败标题中的 route wording

**目标**：按 Implementation lane 推进 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-190` 最小增量，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：基于当前 `getIssue rejects` / `route getOrganizations rejects` 组合，复核第二条 API 失败场景标题是否仍可再次收口为 `getOrganizations rejects` 以继续维持与 helper 级 lookup 标题的层级区分；若可行，则仅改这一处标题并完成验证、review、提交、状态写回与 push 闭环。

### 305.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与任务板在本轮开始前已指向 `IMP-190`，工作树干净，可按唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第二条 API 失败场景标题从 `route getOrganizations rejects` 再次收口为 `getOrganizations rejects`；保持第一条 `getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && ./node_modules/.bin/tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore second legacy route wording removal again"` | 完成本轮 feature/work commit，提交后以 `git rev-parse HEAD` 记录真实 SHA。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 将 `IMP-190` 作为最新完成的 Implementation lane 最小增量写回，并补一条新的后继 `pending` Implementation 任务 `IMP-191` 供下一轮恢复。 |

### 305.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且当前保持 `getIssue rejects` / `route getOrganizations rejects` 组合时，第二条 API 失败标题仍可再次收口为 `getOrganizations rejects`，同时继续维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题再次收口为 `getOrganizations rejects`，同时保持第一条 `getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml`、`docs/linear-parity/task-board.md`、`docs/planning/dev-logbook.md` 与 `docs/worktime.md` 已写回：`IMP-190` 作为最新完成项，下一轮转入重新评估双无 route wording 组合下第一条 API 失败场景标题是否需要恢复 route wording。

### 305.3 经验沉淀

- 当 legacy route 两条 API 失败标题处于非对称 wording 组合时，第二条标题仍需单独复核是否可以再次收口，不能因为第一条已收口就跳过第二条验证。
- 纯测试标题微调依然要在状态文件与任务板中立即补出后继 pending Implementation 任务，避免下一轮实现 cron 停在已完成项。

### 305.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-190 → IMP-191` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `7a4d04479d6d748b58ce82a45f3bac269e21d46a` |
| feature commit | `2f6961899739cd26eea0a33c343b32b9b2ab5b7c` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`./node_modules/.bin/tsc --noEmit`、`git diff --check` |


## Session 304 — 2026-04-21：重新评估并再次收口第一条 legacy route API 失败标题中的 route wording

**目标**：按 Implementation lane 推进 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-189` 最小增量，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：基于当前 `route getIssue rejects` / `route getOrganizations rejects` 组合，复核第一条 API 失败场景标题是否仍可再次收口为 `getIssue rejects` 以继续维持与 helper 级 lookup 标题的层级区分；若可行，则仅改这一处标题并完成验证、review、提交、状态写回与 push 闭环。

### 304.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与任务板在本轮开始前已指向 `IMP-189`，工作树干净，可按唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第一条 API 失败场景标题从 `route getIssue rejects` 再次收口为 `getIssue rejects`；保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && ./node_modules/.bin/tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore first legacy route wording removal again"` | 完成本轮 feature/work commit，提交后以 `git rev-parse HEAD` 记录真实 SHA。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 将 `IMP-189` 作为最新完成的 Implementation lane 最小增量写回，并补一条新的后继 `pending` Implementation 任务 `IMP-190` 供下一轮恢复。 |

### 304.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且当前保持 `route getIssue rejects` / `route getOrganizations rejects` 组合时，第一条 API 失败标题仍可再次收口为 `getIssue rejects`，同时继续维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题再次收口为 `getIssue rejects`，同时保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml`、`docs/linear-parity/task-board.md`、`docs/planning/dev-logbook.md` 与 `docs/worktime.md` 已写回：`IMP-189` 作为最新完成项，下一轮转入继续评估当前再次非对称 wording 组合下第二条 API 失败场景标题是否仍可收口为无 route wording。

### 304.3 经验沉淀

- 当两条 legacy route API 失败标题都带 route wording 时，要分别复核第一条与第二条是否仍可独立收口为更短 wording，而不是默认成对保留。
- 纯测试标题微调依然要在状态文件与任务板中立即补出后继 pending Implementation 任务，避免下一轮实现 cron 停在已完成项。

### 304.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-189 → IMP-190` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `aa4005b795cf1f02eea27330dd79be0dc9310022` |
| feature commit | `428eb2c63f19fbfcbbdffb4fde068e5dc150823c` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`./node_modules/.bin/tsc --noEmit`、`git diff --check` |


## Session 303 — 2026-04-21：重新评估并恢复第二条 legacy route API 失败标题中的 route wording

**目标**：按 Implementation lane 推进 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-188` 最小增量，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：基于当前 `route getIssue rejects` / `getOrganizations rejects` 组合，复核第二条 API 失败场景标题是否需要恢复为 `route getOrganizations rejects` 以继续维持与 helper 级 lookup 标题的层级区分；若需要，则仅改这一处标题并完成验证、review、提交、状态写回与 push 闭环。

### 303.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与任务板在本轮开始前已指向 `IMP-188`，工作树干净，可按唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第二条 API 失败场景标题从 `getOrganizations rejects` 恢复为 `route getOrganizations rejects`；保持第一条 `route getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && ./node_modules/.bin/tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore second legacy route wording again"` | 完成本轮 feature/work commit，提交后以 `git rev-parse HEAD` 记录真实 SHA。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 将 `IMP-188` 作为最新完成的 Implementation lane 最小增量写回，并补一条新的后继 `pending` Implementation 任务 `IMP-189` 供下一轮恢复。 |

### 303.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且当前保持 `route getIssue rejects` / `getOrganizations rejects` 组合时，第二条 API 失败标题需要恢复为 `route getOrganizations rejects`，以继续维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题恢复为 `route getOrganizations rejects`，同时保持第一条 `route getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml`、`docs/linear-parity/task-board.md`、`docs/planning/dev-logbook.md` 与 `docs/worktime.md` 已写回：`IMP-188` 作为最新完成项，下一轮转入继续评估当前再次双 route wording 组合下第一条 API 失败场景标题是否仍可收口为无 route wording。

### 303.3 经验沉淀

- 当第一条 legacy route API 失败标题已明确恢复为 `route getIssue rejects` 时，要独立复核第二条标题是否也需要恢复 `route` wording，而不是因为 helper seam 标题已存在就默认保留最短 wording。
- 纯测试标题微调依然要在状态文件与任务板中立即补出后继 pending Implementation 任务，避免下一轮实现 cron 停在已完成项。

### 303.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-188 → IMP-189` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `755d76050b765a0ae623eee3259bcb39d86296c5` |
| feature commit | `a95c64715be9ac58c4503ae06587db0208e780c5` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`./node_modules/.bin/tsc --noEmit`、`git diff --check` |


## Session 302 — 2026-04-21：重新评估并恢复第一条 legacy route API 失败标题中的 route wording

**目标**：按 Implementation lane 推进 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-187` 最小增量，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：基于当前 `getIssue rejects` / `getOrganizations rejects` 组合，复核第一条 API 失败场景标题是否需要恢复为 `route getIssue rejects` 以继续维持与 helper 级 lookup 标题的层级区分；若需要，则仅改这一处标题并完成验证、review、提交、状态写回与 push 闭环。

### 302.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与任务板在本轮开始前已指向 `IMP-187`，工作树干净，可按唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第一条 API 失败场景标题从 `getIssue rejects` 恢复为 `route getIssue rejects`；保持第二条 `getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && ./node_modules/.bin/tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore first legacy route wording again"` | 完成本轮 feature/work commit，提交后以 `git rev-parse HEAD` 记录真实 SHA。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 将 `IMP-187` 作为最新完成的 Implementation lane 最小增量写回，并补一条新的后继 `pending` Implementation 任务 `IMP-188` 供下一轮恢复。 |

### 302.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且当前保持 `getIssue rejects` / `getOrganizations rejects` 双无 route wording 组合时，第一条 API 失败标题需要恢复为 `route getIssue rejects`，以继续维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题恢复为 `route getIssue rejects`，同时保持第二条 `getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml`、`docs/linear-parity/task-board.md`、`docs/planning/dev-logbook.md` 与 `docs/worktime.md` 已写回：`IMP-187` 作为最新完成项，下一轮转入继续评估当前恢复第一条 route wording 后第二条 API 失败场景标题是否需要同步恢复 route 级语义词。

### 302.3 经验沉淀

- 当两条 legacy route API 失败标题都被收口为无 `route` wording 时，要独立复核第一条标题是否已失去与 helper seam 标题的层级区分，而不是因为 describe 块存在就默认保持最短 wording。
- 纯测试标题微调依然要在状态文件与任务板中立即补出后继 pending Implementation 任务，避免下一轮实现 cron 停在已完成项。

### 302.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-187 → IMP-188` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `ab1d49f64199e426c59e8994e86ac93fd61c2edc` |
| feature commit | `cf5cd1be9a091f18374c48f688dd2a9ca4b0b135` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`./node_modules/.bin/tsc --noEmit`、`git diff --check` |


## Session 301 — 2026-04-21：重新评估并再次收口第二条 legacy route API 失败标题中的 route wording

**目标**：按 Implementation lane 推进 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-186` 最小增量，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：基于当前 `getIssue rejects` / `route getOrganizations rejects` 组合，复核第二条 API 失败场景标题是否仍可再次收口为 `getOrganizations rejects` 以继续维持与 helper 级 lookup 标题的层级区分；若可行，则仅改这一处标题并完成验证、review、提交、状态写回与 push 闭环。

### 301.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与任务板在本轮开始前已指向 `IMP-186`，工作树干净，可按唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第二条 API 失败场景标题从 `route getOrganizations rejects` 再次收口为 `getOrganizations rejects`；保持第一条 `getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && ./node_modules/.bin/tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: drop second legacy route wording again"` | 完成本轮 feature/work commit，提交后以 `git rev-parse HEAD` 记录真实 SHA。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 将 `IMP-186` 作为最新完成的 Implementation lane 最小增量写回，并补一条新的后继 `pending` Implementation 任务 `IMP-187` 供下一轮恢复。 |

### 301.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且当前保持 `getIssue rejects` / `route getOrganizations rejects` 组合时，第二条 `route getOrganizations rejects` 仍可再次收口为 `getOrganizations rejects`，同时继续维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题再次收口为 `getOrganizations rejects`，同时保持第一条 `getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml`、`docs/linear-parity/task-board.md`、`docs/planning/dev-logbook.md` 与 `docs/worktime.md` 已写回：`IMP-186` 作为最新完成项，下一轮转入继续评估再次双无 route wording 组合下第一条 API 失败场景标题是否需要恢复 route 级语义词。

### 301.3 经验沉淀

- 在当前再次非对称 wording 组合下，不要默认第二条标题必须长期保留前缀；只要 helper seam 标题仍明确保留 lookup 语义，就应单独复核第二条是否可再次收口为最小 wording。
- 纯测试标题微调依然要在状态文件与任务板中立即补出后继 pending Implementation 任务，避免下一轮实现 cron 停在已完成项。

### 301.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-186 → IMP-187` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `540ba025d630e94df8c53c8e7f81eec058ce5a82` |
| feature commit | `9c455baa67b5c517df7f4b9c03fd3259678181c7` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`./node_modules/.bin/tsc --noEmit`、`git diff --check` |


## Session 300 — 2026-04-21：重新评估并再次收口第一条 legacy route API 失败标题中的 route wording

**目标**：按 Implementation lane 推进 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-185` 最小增量，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：基于当前 `route getIssue rejects` / `route getOrganizations rejects` 组合，复核第一条 API 失败场景标题是否仍可再次收口为 `getIssue rejects` 以继续维持与 helper 级 lookup 标题的层级区分；若可行，则仅改这一处标题并完成验证、review、提交、状态写回与 push 闭环。

### 300.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与任务板在本轮开始前已指向 `IMP-185`，工作树干净，可按唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第一条 API 失败场景标题从 `route getIssue rejects` 再次收口为 `getIssue rejects`；保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && ./node_modules/.bin/tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: drop first legacy route wording again"` | 完成本轮 feature/work commit，提交后以 `git rev-parse HEAD` 记录真实 SHA。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 将 `IMP-185` 作为最新完成的 Implementation lane 最小增量写回，并补一条新的后继 `pending` Implementation 任务 `IMP-186` 供下一轮恢复。 |

### 300.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且当前保持 `route getIssue rejects` / `route getOrganizations rejects` 组合时，第一条 `route getIssue rejects` 仍可再次收口为 `getIssue rejects`，同时继续维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题再次收口为 `getIssue rejects`，同时保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml`、`docs/linear-parity/task-board.md`、`docs/planning/dev-logbook.md` 与 `docs/worktime.md` 已写回：`IMP-185` 作为最新完成项，下一轮转入继续评估第二条 API 失败场景标题在当前再次非对称 wording 组合下是否仍可收口为无 route wording。

### 300.3 经验沉淀

- 在当前再次双 route wording 组合下，不要默认第一条标题必须长期保留前缀；只要 helper seam 标题仍明确保留 lookup 语义，就应单独复核第一条是否可再次收口为最小 wording。
- 纯测试标题微调依然要在状态文件与任务板中立即补出后继 pending Implementation 任务，避免下一轮实现 cron 停在已完成项。

### 300.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-185 → IMP-186` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `6aaaaaf6ef80d97d05d7851e4513fc6c54249267` |
| feature commit | `17919807587d46922f0f45cdf4705540b33153cb` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`./node_modules/.bin/tsc --noEmit`、`git diff --check` |


## Session 299 — 2026-04-21：重新评估并恢复第二条 legacy route API 失败标题中的 route wording

**目标**：按 Implementation lane 推进 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-184` 最小增量，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：基于当前 `route getIssue rejects` / `getOrganizations rejects` 组合，复核第二条 API 失败场景标题是否需要恢复为 `route getOrganizations rejects` 以继续维持与 helper 级 lookup 标题的层级区分；若需要，则仅改这一处标题并完成验证、review、提交、状态写回与 push 闭环。

### 299.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与任务板在本轮开始前已指向 `IMP-184`，工作树干净，可按唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第二条 API 失败场景标题从 `getOrganizations rejects` 恢复为 `route getOrganizations rejects`；保持第一条 `route getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && ./node_modules/.bin/tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore getOrganizations route wording symmetry"` | 完成本轮 feature/work commit，提交后以 `git rev-parse HEAD` 记录真实 SHA。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 将 `IMP-184` 作为最新完成的 Implementation lane 最小增量写回，并补一条新的后继 `pending` Implementation 任务 `IMP-185` 供下一轮恢复。 |

### 299.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且当前保持 `route getIssue rejects` / `getOrganizations rejects` 组合时，第二条 `getOrganizations rejects` 需要恢复为 `route getOrganizations rejects`，以继续维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题恢复为 `route getOrganizations rejects`，同时保持第一条 `route getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml`、`docs/linear-parity/task-board.md`、`docs/planning/dev-logbook.md` 与 `docs/worktime.md` 已写回：`IMP-184` 作为最新完成项，下一轮转入继续评估第一条 API 失败场景标题在当前再次双 route wording 组合下是否仍可收口为无 route wording。

### 299.3 经验沉淀

- 在当前非对称 wording 组合下，不要默认第二条标题仍可继续维持无前缀；若 helper seam 标题已固定保留 lookup 语义，就应单独复核第二条是否需要恢复最小 route 级语义词。
- 纯测试标题微调依然要在状态文件与任务板中立即补出后继 pending Implementation 任务，避免下一轮实现 cron 停在已完成项。

### 299.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-184 → IMP-185` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `e632913b761aeea52748666044c381a86689e022` |
| feature commit | `e8099e098ffaec72889da0c523ce586ce4193cb3` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`./node_modules/.bin/tsc --noEmit`、`git diff --check` |


## Session 298 — 2026-04-21：重新评估并恢复第一条 legacy route API 失败标题中的 route wording

**目标**：按 Implementation lane 推进 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-183` 最小增量，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：基于当前 `getIssue rejects` / `getOrganizations rejects` 组合，复核第一条 API 失败场景标题是否需要恢复为 `route getIssue rejects` 以继续维持与 helper 级 lookup 标题的层级区分；若需要，则仅改这一处标题并完成验证、review、提交、状态写回与 push 闭环。

### 298.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与任务板在本轮开始前已指向 `IMP-183`，工作树干净，可按唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第一条 API 失败场景标题从 `getIssue rejects` 恢复为 `route getIssue rejects`；保持第二条 `getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && ./node_modules/.bin/tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore getIssue route wording symmetry"` | 完成本轮 feature/work commit，提交后以 `git rev-parse HEAD` 记录真实 SHA。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-183` 作为最新完成的 Implementation lane 最小增量写回，并补一条新的后继 `pending` Implementation 任务 `IMP-184` 供下一轮恢复。 |

### 298.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且当前保持 `getIssue rejects` / `getOrganizations rejects` 组合时，第一条 `getIssue rejects` 需要恢复为 `route getIssue rejects`，以继续维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题恢复为 `route getIssue rejects`，同时保持第二条 `getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml`、`docs/linear-parity/task-board.md`、`docs/planning/dev-logbook.md` 与 `doc/worktime.md` 已写回：`IMP-183` 作为最新完成项，下一轮转入继续评估第二条 API 失败场景标题在当前再次非对称 wording 组合下是否需要恢复 route 级语义词。

### 298.3 经验沉淀

- 在当前再次双无 route wording 组合下，不要默认第一条标题仍可继续维持无前缀；若 helper seam 标题已固定保留 lookup 语义，就应单独复核第一条是否需要恢复最小 route 级语义词。
- 纯测试标题微调依然要在状态文件与任务板中立即补出后继 pending Implementation 任务，避免下一轮实现 cron 停在已完成项。

### 298.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-183 → IMP-184` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `92c3673af0b075b87547057fa9891570e90d0473` |
| feature commit | `0c257eac1c980bba454bb0de67b764433dfcab12` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`./node_modules/.bin/tsc --noEmit`、`git diff --check` |


## Session 297 — 2026-04-21：重新评估并再次收口第二条 legacy route API 失败标题中的 route wording

**目标**：按 Implementation lane 推进 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-182` 最小增量，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：基于当前 `getIssue rejects` / `route getOrganizations rejects` 组合，复核第二条 API 失败场景标题是否仍可再次收口为 `getOrganizations rejects` 且继续维持与 helper 级 lookup 标题的层级区分；若可行，则仅改这一处标题并完成验证、review、提交、状态写回与 push 闭环。

### 297.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与任务板在本轮开始前已指向 `IMP-182`，工作树干净，可按唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第二条 API 失败场景标题从 `route getOrganizations rejects` 再次收口为 `getOrganizations rejects`；保持第一条 `getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && ./node_modules/.bin/tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore getOrganizations route wording symmetry"` | 完成本轮 feature/work commit，提交后以 `git rev-parse HEAD` 记录真实 SHA。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 将 `IMP-182` 作为最新完成的 Implementation lane 最小增量写回，并补一条新的后继 `pending` Implementation 任务 `IMP-183` 供下一轮恢复。 |

### 297.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且当前保持 `getIssue rejects` / `route getOrganizations rejects` 组合时，第二条 `route getOrganizations rejects` 仍可再次收口为 `getOrganizations rejects`，同时继续维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题再次收口为 `getOrganizations rejects`，同时保持第一条 `getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml`、`docs/linear-parity/task-board.md`、`docs/planning/dev-logbook.md` 与 `docs/worktime.md` 已写回：`IMP-182` 作为最新完成项，下一轮转入继续评估第一条 API 失败场景标题在当前再次双无 route wording 组合下是否需要恢复 route 级语义词。

### 297.3 经验沉淀

- 在当前非对称 wording 组合下，即使上一轮刚再次收口了第一条标题，也应继续单独复核第二条标题是否还能再次收口，不要默认保留 route wording 才能长期维持 helper/route 层级区分。
- 纯测试标题微调依然要在状态文件与任务板中立即补出后继 pending Implementation 任务，避免下一轮实现 cron 停在已完成项。

### 297.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-182 → IMP-183` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `bfb32e0b8cc6494e7ae477c7ea189ae1104b24c7` |
| feature commit | `92c3673af0b075b87547057fa9891570e90d0473` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`./node_modules/.bin/tsc --noEmit`、`git diff --check` |


## Session 296 — 2026-04-21：重新评估并再次收口第一条 legacy route API 失败标题中的 route wording

**目标**：按 Implementation lane 推进 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-181` 最小增量，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：基于当前 `route getIssue rejects` / `route getOrganizations rejects` 组合，复核第一条 API 失败场景标题是否仍可再次收口为 `getIssue rejects` 且继续维持与 helper 级 lookup 标题的层级区分；若可行，则仅改这一处标题并完成验证、review、提交、状态写回与 push 闭环。

### 296.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与任务板在本轮开始前已指向 `IMP-181`，工作树干净，可按唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第一条 API 失败场景标题从 `route getIssue rejects` 再次收口为 `getIssue rejects`；保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && ./node_modules/.bin/tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore getIssue route wording symmetry"` | 完成本轮 feature/work commit，提交后以 `git rev-parse HEAD` 记录真实 SHA。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 将 `IMP-181` 作为最新完成的 Implementation lane 最小增量写回，并补一条新的后继 `pending` Implementation 任务 `IMP-182` 供下一轮恢复。 |

### 296.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且当前保持 `route getIssue rejects` / `route getOrganizations rejects` 组合时，第一条 `route getIssue rejects` 仍可再次收口为 `getIssue rejects`，同时继续维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题再次收口为 `getIssue rejects`，同时保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml`、`docs/linear-parity/task-board.md`、`docs/planning/dev-logbook.md` 与 `docs/worktime.md` 已写回：`IMP-181` 作为最新完成项，下一轮转入继续评估第二条 API 失败场景标题在当前再次非对称 wording 组合下是否仍可再次收口为无 route wording。

### 296.3 经验沉淀

- 在当前双 route wording 组合下，即使上一轮刚恢复了第二条标题，也应继续单独复核第一条标题是否还能再次收口，不要把两条失败标题永久绑定为必须同向保留 route wording。
- 纯测试标题微调依然要在状态文件与任务板中立即补出后继 pending Implementation 任务，避免下一轮实现 cron 停在已完成项。

### 296.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-181 → IMP-182` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `cb19897de2cad5257a7084c7aa61b74de75416dc` |
| feature commit | `bfb32e0b8cc6494e7ae477c7ea189ae1104b24c7` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`./node_modules/.bin/tsc --noEmit`、`git diff --check` |


## Session 295 — 2026-04-21：重新评估并恢复第二条 legacy route API 失败标题中的 route wording

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-180` 最小增量，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：基于当前 `route getIssue rejects` / `getOrganizations rejects` 组合，复核第二条 API 失败场景标题是否需要恢复为 `route getOrganizations rejects` 以继续维持与 helper 级 lookup 标题的层级区分；若需要，则仅改这一处标题并完成验证、review、提交、状态写回与 push 闭环。

### 295.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与任务板在本轮开始前已指向 `IMP-180`，工作树干净，可按唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第二条 API 失败场景标题从 `getOrganizations rejects` 恢复为 `route getOrganizations rejects`；保持第一条 `route getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && ./node_modules/.bin/tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore getOrganizations route wording again"` | 完成本轮 feature/work commit，提交后以 `git rev-parse HEAD` 记录真实 SHA。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-180` 作为最新完成的 Implementation lane 最小增量写回，并补一条新的后继 `pending` Implementation 任务 `IMP-181` 供下一轮恢复。 |

### 295.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且当前保持 `route getIssue rejects` / `getOrganizations rejects` 组合时，第二条 `getOrganizations rejects` 若继续不带 route wording，会削弱 route/helper 层级区分。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题恢复为 `route getOrganizations rejects`，同时保持第一条 `route getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml`、`docs/linear-parity/task-board.md`、`docs/planning/dev-logbook.md` 与 `doc/worktime.md` 已写回：`IMP-180` 作为最新完成项，下一轮转入继续评估第一条 API 失败场景标题在当前再次双 route wording 组合下是否仍可再次收口为无 route wording。

### 295.3 经验沉淀

- 即使上一轮刚把第一条 route 级失败标题恢复为带 route wording，也应继续在当前非对称 wording 组合下单独复核第二条标题是否需要同步恢复 route 级语义词，而不要默认另一条已恢复后此处仍可长期保留无前缀文案。
- 纯测试标题微调仍要在状态文件与任务板中立即补出后继 pending Implementation 任务，避免下一轮实现 cron 退化为“只有 done 没有 successor”的文档修补。

### 295.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-180 → IMP-181` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `7d48846075b1005e78f973fdafd4b945c05bf0d4` |
| feature commit | `3eaec542099138ed7f15077983b7fe3717441842` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`./node_modules/.bin/tsc --noEmit`、`git diff --check` |


## Session 294 — 2026-04-21：重新评估并恢复第一条 legacy route API 失败标题中的 route wording

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-179` 最小增量，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：基于当前 `getIssue rejects` / `getOrganizations rejects` 组合，复核第一条 API 失败场景标题是否需要恢复为 `route getIssue rejects` 以继续维持与 helper 级 lookup 标题的层级区分；若需要，则仅改这一处标题并完成验证、review、提交、状态写回与 push 闭环。

### 294.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与任务板在本轮开始前已指向 `IMP-179`，工作树干净，可按唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第一条 API 失败场景标题从 `getIssue rejects` 恢复为 `route getIssue rejects`；保持第二条 `getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && ./node_modules/.bin/tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore issue detail route wording again"` | 完成本轮 feature/work commit，提交后以 `git rev-parse HEAD` 记录真实 SHA。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 将 `IMP-179` 作为最新完成的 Implementation lane 最小增量写回，并补一条新的后继 `pending` Implementation 任务 `IMP-180` 供下一轮恢复。 |

### 294.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且当前保持 `getIssue rejects` / `getOrganizations rejects` 组合时，第一条 `getIssue rejects` 若继续不带 route wording，会与 helper 级 lookup 失败标题进一步收敛，不利于维持 route/helper 层级区分。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题恢复为 `route getIssue rejects`，同时保持第二条 `getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml`、`docs/linear-parity/task-board.md`、`docs/planning/dev-logbook.md` 与 `docs/worktime.md` 已写回：`IMP-179` 作为最新完成项，下一轮转入继续评估第二条 API 失败场景标题在当前再次非对称 wording 组合下是否需要恢复 route 级语义词。

### 294.3 经验沉淀

- 即使上一轮刚把第二条 route 级失败标题再次收口为无 route wording，也应继续在当前双无 wording 组合下单独复核第一条标题是否需要恢复 route 级语义词，而不要默认两条都去前缀后仍能长期保持 route/helper 层级区分。
- 纯测试标题微调仍要在状态文件与任务板中立即补出后继 pending Implementation 任务，避免下一轮实现 cron 退化为“只有 done 没有 successor”的文档修补。

### 294.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-179 → IMP-180` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `051cbf373634baafd9de68334c44ea70a88873d9` |
| feature commit | `2c333bed69e3c2947010e236def07aeb250c891c` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`./node_modules/.bin/tsc --noEmit`、`git diff --check` |


## Session 293 — 2026-04-21：重新评估并再次收口第二条 legacy route API 失败标题中的 route wording

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-178` 最小增量，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：基于当前 `getIssue rejects` / `route getOrganizations rejects` 组合，复核第二条 API 失败场景标题是否仍可再次收口为 `getOrganizations rejects` 且继续维持与 helper 级 lookup 标题的层级区分；若可行，则仅改这一处标题并完成验证、review、提交、状态写回与 push 闭环。

### 293.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与任务板在本轮开始前已指向 `IMP-178`，工作树干净，可按唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第二条 API 失败场景标题从 `route getOrganizations rejects` 再次收口为 `getOrganizations rejects`；保持第一条 `getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && ./node_modules/.bin/tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: relax issue detail route wording again"` | 完成本轮 feature/work commit，提交后以 `git rev-parse HEAD` 记录真实 SHA。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 将 `IMP-178` 作为最新完成的 Implementation lane 最小增量写回，并补一条新的后继 `pending` Implementation 任务 `IMP-179` 供下一轮恢复。 |

### 293.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且当前保持 `getIssue rejects` / `route getOrganizations rejects` 组合时，第二条 `route getOrganizations rejects` 仍可再次收口为 `getOrganizations rejects`，同时继续维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题再次收口为 `getOrganizations rejects`，同时保持第一条 `getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml`、`docs/linear-parity/task-board.md`、`docs/planning/dev-logbook.md` 与 `docs/worktime.md` 已写回：`IMP-178` 作为最新完成项，下一轮转入继续评估第一条 API 失败场景标题在当前再次双无 route wording 组合下是否需要恢复 route 级语义词。

### 293.3 经验沉淀

- 在 legacy route 测试标题交替收口/恢复的微调链路里，即使第一条标题已再次收口，也应继续单独复核第二条标题是否还能同步收口，不要把双条失败标题默认绑定成必须同向变化的原子操作。
- 纯测试标题微调依然要把最新 feature SHA 与后继 pending Implementation 任务同步写回状态源和任务板，否则 fresh session 会停留在上一轮完成项，失去单状态源恢复能力。

### 293.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-178 → IMP-179` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `d91e263f7edf37c0c09582e543b94cfbb5d1926d` |
| feature commit | `680f1ea594bafb4c59045590bfd3f7083ab8bdb5` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`./node_modules/.bin/tsc --noEmit`、`git diff --check` |


## Session 292 — 2026-04-21：重新评估并再次收口第一条 legacy route API 失败标题中的 route wording

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-177` 最小增量，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：基于当前 `route getIssue rejects` / `route getOrganizations rejects` 组合，复核第一条 API 失败场景标题是否仍可再次收口为 `getIssue rejects` 且继续维持与 helper 级 lookup 标题的层级区分；若可行，则仅改这一处标题并完成验证、review、提交、状态写回与 push 闭环。

### 292.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与任务板在本轮开始前已指向 `IMP-177`，工作树干净，可按唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第一条 API 失败场景标题从 `route getIssue rejects` 再次收口为 `getIssue rejects`；保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && ./node_modules/.bin/tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: relax issue detail route wording again"` | 完成本轮 feature/work commit，提交后以 `git rev-parse HEAD` 记录真实 SHA。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-177` 作为最新完成的 Implementation lane 最小增量写回，并补一条新的后继 `pending` Implementation 任务 `IMP-178` 供下一轮恢复。 |

### 292.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且当前保持 `route getIssue rejects` / `route getOrganizations rejects` 组合时，第一条 `route getIssue rejects` 仍可再次收口为 `getIssue rejects`，同时继续维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题再次收口为 `getIssue rejects`，同时保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml`、`docs/linear-parity/task-board.md`、`docs/planning/dev-logbook.md` 与 `doc/worktime.md` 已写回：`IMP-177` 作为最新完成项，下一轮转入继续评估第二条 route 级 API 失败场景标题在当前再次非对称 wording 组合下是否仍可再次收口为无 route wording。

### 292.3 经验沉淀

- 即使上一轮刚把第二条 route 级失败标题恢复为带 route wording，也应继续在当前双 route wording 组合下单独复核第一条标题是否仍可再次收口，而不要默认只要两条都带前缀就必须长期保持该组合。
- 纯测试标题微调仍要在状态文件与任务板中立即补出后继 pending Implementation 任务，避免下一轮实现 cron 退化为“只有 done 没有 successor”的文档修补。

### 292.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-177 → IMP-178` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `927be7d16a4c4d1d2901abe37d91e86aa89b1b55` |
| feature commit | `cd486d99a6a523850dcaba3e743ca0431cb5c280` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`./node_modules/.bin/tsc --noEmit`、`git diff --check` |


## Session 291 — 2026-04-21：重新评估并恢复第二条 legacy route API 失败标题中的 route wording

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-176` 最小增量，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：基于当前 `route getIssue rejects` / `getOrganizations rejects` 组合，复核第二条 API 失败场景标题是否需要恢复为 `route getOrganizations rejects` 以继续维持与 helper 级 lookup 标题的层级区分；若需要，则仅改这一处标题并完成验证、review、提交、状态写回与 push 闭环。

### 291.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与任务板在本轮开始前已指向 `IMP-176`，工作树干净，可按唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第二条 API 失败场景标题从 `getOrganizations rejects` 恢复为 `route getOrganizations rejects`；保持第一条 `route getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && ./node_modules/.bin/tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore getOrganizations route wording again"` | 完成本轮 feature/work commit，提交后以 `git rev-parse HEAD` 记录真实 SHA。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-176` 作为最新完成的 Implementation lane 最小增量写回，并补一条新的后继 `pending` Implementation 任务 `IMP-177` 供下一轮恢复。 |

### 291.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且当前保持 `route getIssue rejects` / `getOrganizations rejects` 组合时，第二条 `getOrganizations rejects` 需要恢复为 `route getOrganizations rejects`，以继续维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题恢复为 `route getOrganizations rejects`，同时保持第一条 `route getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml`、`docs/linear-parity/task-board.md`、`docs/planning/dev-logbook.md` 与 `doc/worktime.md` 已写回：`IMP-176` 作为最新完成项，下一轮转入继续评估第一条 route 级 API 失败场景标题在当前再次双 route wording 组合下是否仍可再次收口为无 route wording。

### 291.3 经验沉淀

- 即使上一轮刚把第一条 route 级失败标题恢复为带 route wording，也应继续在当前非对称 wording 组合下单独复核第二条标题是否需要同步恢复 route 级语义词，而不要默认另一条已恢复后此处仍可长期保留无前缀文案。
- 纯测试标题微调仍要在状态文件与任务板中立即补出后继 pending Implementation 任务，避免下一轮实现 cron 退化为“只有 done 没有 successor”的文档修补。

### 291.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-176 → IMP-177` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `428b45a57934fcdee2ae108c0ba18ef8bd80ed98` |
| feature commit | `9932a7b0985efb551851b18d734965e318ca647a` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`./node_modules/.bin/tsc --noEmit`、`git diff --check` |


## Session 290 — 2026-04-21：重新评估并恢复第一条 legacy route API 失败标题中的 route wording

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-175` 最小增量，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：基于当前 `getIssue rejects` / `getOrganizations rejects` 组合，复核第一条 API 失败场景标题是否需要恢复为 `route getIssue rejects` 以继续维持与 helper 级 lookup 标题的层级区分；若需要，则仅改这一处标题并完成验证、review、提交、状态写回与 push 闭环。

### 290.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与任务板在本轮开始前已指向 `IMP-175`，工作树干净，可按唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第一条 API 失败场景标题从 `getIssue rejects` 恢复为 `route getIssue rejects`；保持第二条 `getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && ./node_modules/.bin/tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore issue detail route wording again"` | 完成本轮 feature/work commit，提交后以 `git rev-parse HEAD` 记录真实 SHA。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-175` 作为最新完成的 Implementation lane 最小增量写回，并补一条新的后继 `pending` Implementation 任务 `IMP-176` 供下一轮恢复。 |

### 290.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且当前保持 `getIssue rejects` / `getOrganizations rejects` 组合时，第一条 `getIssue rejects` 需要恢复为 `route getIssue rejects`，以继续维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题恢复为 `route getIssue rejects`，同时保持第二条 `getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml`、`docs/linear-parity/task-board.md`、`docs/planning/dev-logbook.md` 与 `doc/worktime.md` 已写回：`IMP-175` 作为最新完成项，下一轮转入继续评估第二条 route 级 API 失败场景标题在当前再次非对称 wording 组合下是否需要恢复 route 级语义词。

### 290.3 经验沉淀

- 即使上一轮刚把第二条 route 级失败标题再次收口为无 route wording，也应继续在当前双无 route wording 组合下单独复核第一条标题是否需要恢复 route 级语义词，而不要默认两条 route 标题都可长期保持最小无前缀文案。
- 纯测试标题微调仍要在状态文件与任务板中立即补出后继 pending Implementation 任务，避免下一轮实现 cron 退化为“只有 done 没有 successor”的文档修补。

### 290.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-175 → IMP-176` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `ba8f2a35f280c609657eab87177129eecd024afd` |
| feature commit | `428b45a57934fcdee2ae108c0ba18ef8bd80ed98` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`./node_modules/.bin/tsc --noEmit`、`git diff --check` |


## Session 289 — 2026-04-21：评估并再次收口第二条 legacy route API 失败标题中的 route 级语义词

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-174` 最小增量，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：基于当前 `getIssue rejects` / `route getOrganizations rejects` 组合，复核第二条 API 失败场景标题是否仍可安全收口为 `getOrganizations rejects`；若可行，则仅改这一处标题并完成验证、review、提交、状态写回与 push 闭环。

### 289.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与任务板在本轮开始前已指向 `IMP-174`，工作树仅含本轮实现与 docs/state 闭环所需改动，可按唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第二条 API 失败场景标题从 `route getOrganizations rejects` 再次收口为 `getOrganizations rejects`；保持第一条 `getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && ./node_modules/.bin/tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: relax issue detail getOrganizations wording again"` | 完成本轮 feature/work commit，提交后以 `git rev-parse HEAD` 记录真实 SHA。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-174` 作为最新完成的 Implementation lane 最小增量写回，并补一条新的后继 `pending` Implementation 任务 `IMP-175` 供下一轮恢复。 |

### 289.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且当前保持 `getIssue rejects` / `route getOrganizations rejects` 组合时，第二条 `route getOrganizations rejects` 仍可再次收口为 `getOrganizations rejects`，同时继续维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题再次收口为 `getOrganizations rejects`，同时保持第一条 `getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml`、`docs/linear-parity/task-board.md`、`docs/planning/dev-logbook.md` 与 `doc/worktime.md` 已写回：`IMP-174` 作为最新完成项，下一轮转入继续评估第一条 route 级 API 失败场景标题在当前再次双无 route wording 组合下是否需要恢复 route 级语义词。

### 289.3 经验沉淀

- 即使上一轮刚把第一条 route 级失败标题再次收口为无 route wording，也应继续在当前非对称 wording 组合下单独复核第二条标题是否同样可安全再次收口，而不要默认只要另一条已收口就必须长期保留此处前缀。
- 纯测试标题微调仍要在状态文件与任务板中立即补出后继 pending Implementation 任务，避免下一轮实现 cron 退化为“只有 done 没有 successor”的文档修补。

### 289.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-174 → IMP-175` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `d19a6fc2baf7cf6b151a5fcc49b2d43106ebe8a3` |
| feature commit | `0683e525a825a634edd26b981da86cb09da0e8eb` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`./node_modules/.bin/tsc --noEmit`、`git diff --check` |


## Session 287 — 2026-04-21：评估并再次收口第一条 legacy route API 失败标题中的 route 级语义词

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-173` 最小增量，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：基于当前 `route getIssue rejects` / `route getOrganizations rejects` 组合，复核第一条 API 失败场景标题是否仍可安全收口为 `getIssue rejects`；若可行，则仅改这一处标题并完成验证、review、提交、状态写回与 push 闭环。

### 287.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与任务板在本轮开始前已指向 `IMP-173`，工作树干净，可按唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第一条 API 失败场景标题从 `route getIssue rejects` 收口为 `getIssue rejects`；保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && ./node_modules/.bin/tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: drop first legacy route reject title again"` | 完成本轮 feature/work commit，提交后以 `git rev-parse HEAD` 记录真实 SHA。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-173` 作为最新完成的 Implementation lane 最小增量写回，并补一条新的后继 `pending` Implementation 任务 `IMP-174` 供下一轮恢复。 |

### 287.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且两条已恢复为 `route getIssue rejects` / `route getOrganizations rejects` 后，第一条 `route getIssue rejects` 仍可安全收口为 `getIssue rejects`，同时继续维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题再次收口为 `getIssue rejects`，同时保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml`、`docs/linear-parity/task-board.md`、`docs/planning/dev-logbook.md` 与 `doc/worktime.md` 已写回：`IMP-173` 作为最新完成项，下一轮转入继续评估第二条 route 级 API 失败场景标题在当前非对称 wording 组合下是否仍可再次收口为无 route wording。

### 287.3 经验沉淀

- 即使上一轮刚把第二条 route 级失败标题恢复为带 route wording，也应继续在双 route wording 组合下单独复核第一条标题是否仍可再次安全收口，而不要默认一旦恢复就必须长期保留前缀。
- 纯测试标题微调仍要在状态文件与任务板中立即补出后继 pending Implementation 任务，避免下一轮实现 cron 退化为“只有 done 没有 successor”的文档修补。

### 287.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-173 → IMP-174` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `7c8eb4fd2f9e9b2b0eeaa286d51e991381551033` |
| feature commit | `d19a6fc2baf7cf6b151a5fcc49b2d43106ebe8a3` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`./node_modules/.bin/tsc --noEmit`、`git diff --check` |


## Session 286 — 2026-04-21：评估并再次收口第一条 legacy route API 失败标题中的 route 级语义词

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-169` 最小增量，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：基于当前 `route getIssue rejects` / `route getOrganizations rejects` 组合，复核第一条 API 失败场景标题是否仍可安全收口为 `getIssue rejects`；若可行，则仅改这一处标题并完成验证、review、提交、状态写回与 push 闭环。

### 286.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与任务板在本轮开始前已指向 `IMP-169`，工作树干净，可按唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第一条 API 失败场景标题从 `route getIssue rejects` 收口为 `getIssue rejects`；保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && ./node_modules/.bin/tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: tighten issue detail route rejection wording"` | 完成本轮 feature/work commit，提交后以 `git rev-parse HEAD` 记录真实 SHA。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 将 `IMP-169` 作为最新完成的 Implementation lane 最小增量写回，并补一条新的后继 `pending` Implementation 任务 `IMP-170` 供下一轮恢复。 |

### 286.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且两条已恢复为 `route getIssue rejects` / `route getOrganizations rejects` 后，第一条 `route getIssue rejects` 仍可安全收口为 `getIssue rejects`，同时继续维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题再次收口为 `getIssue rejects`，同时保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml`、`docs/linear-parity/task-board.md`、`docs/planning/dev-logbook.md` 与 `docs/worktime.md` 已写回：`IMP-169` 作为最新完成项，下一轮转入继续评估第二条 route 级 API 失败场景标题在当前非对称 wording 组合下是否仍可再次收口为无 route wording。

### 286.3 经验沉淀

- 即使上一轮刚把第一条 route 级失败标题恢复为带 route wording，也应继续在双 route wording 组合下单独复核该标题是否仍可再次安全收口，而不要默认一旦恢复就必须长期保留前缀。
- 纯测试标题微调仍要在状态文件与任务板中立即补出后继 pending Implementation 任务，避免下一轮实现 cron 退化为“只有 done 没有 successor”的文档修补。

### 286.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-169 → IMP-170` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `c22f51aad0bb398990edaacf7a1a08943744cad9` |
| feature commit | `78b66c81a62e866e1045e3a66ee2d755b5b35765` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`./node_modules/.bin/tsc --noEmit`、`git diff --check` |


## Session 285 — 2026-04-21：重新评估并恢复第一条 legacy route API 失败标题中的 route wording

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-168` 最小增量，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：基于当前 `getIssue rejects` / `route getOrganizations rejects` 组合，复核第一条 API 失败场景标题是否仍需恢复为 `route getIssue rejects` 以维持与 helper 级 lookup 标题的层级区分；若需要，则仅改这一处标题并完成验证、review、提交、状态写回与 push 闭环。

### 285.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与任务板在本轮开始前已指向 `IMP-168`，工作树干净，可按唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第一条 API 失败场景标题从 `getIssue rejects` 恢复为 `route getIssue rejects`；保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && ./node_modules/.bin/tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore route wording for issue detail getIssue rejection"` | 完成本轮 feature/work commit，提交后以 `git rev-parse HEAD` 记录真实 SHA。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-168` 作为最新完成的 Implementation lane 最小增量写回，并补一条新的后继 `pending` Implementation 任务供下一轮恢复。 |

### 285.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第二条已维持 `route getOrganizations rejects` 后，第一条 `getIssue rejects` 若继续不带 route 级语义词，会与 helper 级 lookup 标题层级过于接近。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题恢复为 `route getIssue rejects`，同时保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml`、`docs/linear-parity/task-board.md`、`docs/planning/dev-logbook.md` 与 `doc/worktime.md` 已写回：`IMP-168` 作为最新完成项，下一轮转入继续评估第一条 route 级 API 失败标题在双 route wording 恢复后是否仍可再次收口为无 route wording。

### 285.3 经验沉淀

- 当第二条 route 级失败标题已恢复为 `route getOrganizations rejects` 时，仍需单独复核第一条是否必须恢复最小 route 级语义词来维持与 helper seam wording 的层级区分，而不要默认第一条可以长期无前缀。
- 纯测试标题微调仍要在状态文件与任务板中立即补出后继 pending Implementation 任务，避免下一轮实现 cron 退化为“只有 done 没有 successor”的文档修补。

### 285.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-168 → IMP-169` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `52252553baef2cec416f9b464b1a87af1a7dc5ae` |
| feature commit | `b38af940c407f9a4b3febf8ce6fb7192e67ccdc9` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`./node_modules/.bin/tsc --noEmit`、`git diff --check` |


## Session 284 — 2026-04-21：重新评估并恢复第二条 legacy route API 失败标题中的 route wording

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-167` 最小增量，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：基于当前 `getIssue rejects` / `getOrganizations rejects` 组合，复核第二条 API 失败场景标题是否仍需恢复为 `route getOrganizations rejects` 以维持与 helper 级 lookup 标题的层级区分；若需要，则仅改这一处标题并完成验证、review、提交、状态写回与 push 闭环。

### 284.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与任务板在本轮开始前已指向 `IMP-167`，工作树干净，可按唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第二条 API 失败场景标题从 `getOrganizations rejects` 恢复为 `route getOrganizations rejects`；保持第一条 `getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && ./node_modules/.bin/tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过。 |
| 提交 | `git commit -m "test: restore route wording for issue detail getOrganizations rejection"` | 完成本轮 feature/work commit，提交后以 `git rev-parse HEAD` 记录真实 SHA。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-167` 作为最新完成的 Implementation lane 最小增量写回，并补一条新的后继 `pending` Implementation 任务供下一轮恢复。 |

### 284.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第一条已维持 `getIssue rejects` 后，第二条 `getOrganizations rejects` 若继续不带 route 级语义词，会与 helper 级 lookup 标题层级过于接近。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题恢复为 `route getOrganizations rejects`，同时保持第一条 `getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml`、`docs/linear-parity/task-board.md`、`docs/planning/dev-logbook.md` 与 `doc/worktime.md` 已写回：`IMP-167` 作为最新完成项，下一轮转入继续评估第一条 API 失败场景标题是否需要恢复 route wording。

### 284.3 经验沉淀

- 当第一条 route 级失败标题已收口为无 route wording 时，仍需单独复核第二条是否必须恢复最小 route 级语义词来维持与 helper seam wording 的层级区分，而不要默认两条都可长期无前缀。
- 纯测试标题微调仍要在状态文件与任务板中立即补出后继 pending Implementation 任务，避免下一轮实现 cron 退化为“只有 done 没有 successor”的文档修补。

### 284.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-167 → IMP-168` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `9972108cf5896917ae978cf60fd97a2f6c410604` |
| feature commit | `fc39ffb39f2c7311e7cd04db35845c2758c41171` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`./node_modules/.bin/tsc --noEmit`、`git diff --check` |


## Session 283 — 2026-04-21：评估并再次收口第一条 legacy route API 失败标题中的 route 级语义词

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-166` 最小增量，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `route getIssue rejects` / `getOrganizations rejects` 后，第一条是否仍可安全收口为无 route wording；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 283.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与任务板在本轮开始前已指向 `IMP-166`，工作树干净，可按唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第一条 API 失败场景标题从 `route getIssue rejects` 收口为 `getIssue rejects`；保持第二条 `getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && ./node_modules/.bin/tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过。 |
| 提交 | `git commit -m "test: relax route wording for issue detail getIssue rejection"` | 完成本轮 feature/work commit，提交后以 `git rev-parse HEAD` 记录真实 SHA。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 将 `IMP-166` 作为最新完成的 Implementation lane 最小增量写回，并补一条新的后继 `pending` Implementation 任务供下一轮恢复。 |

### 283.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第二条已维持 `getOrganizations rejects` 后，第一条 `route getIssue rejects` 仍可安全收口为 `getIssue rejects`，同时继续维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题收口为 `getIssue rejects`，同时保持第二条 `getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-166` 作为最新完成项，下一轮转入继续评估第二条 route 级 API 失败场景标题是否仍需恢复 route wording。

### 283.3 经验沉淀

- 即使前一轮刚把另一条 route 级失败标题收口为无 route wording，也应继续逐条复核当前组合下剩余那一条是否同样可以安全收口，而不要默认必须保留不对称 wording。
- 纯测试标题微调仍要在状态文件与任务板中立即补出后继 pending Implementation 任务，避免下一轮实现 cron 退化为“只有 done 没有 successor”的文档修补。

### 283.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-166 → IMP-167` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `3081a5ee6e77928a6c1141b8e809ef72f6d4d722` |
| feature commit | `d47761ab04dcdc8f21fae1529c0dae18a687553a` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`./node_modules/.bin/tsc --noEmit`、`git diff --check` |


## Session 282 — 2026-04-21：评估并收口第二条 legacy route API 失败标题中的 route 级语义词

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-165` 最小增量，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `route getIssue rejects` / `route getOrganizations rejects` 后，第二条是否仍可安全收口为无 route wording；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 282.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件最近一次 feature/work commit 已落在 `IMP-165` 前序实现，任务板显示 `IMP-165` 为当前 Implementation lane 待执行项，工作树可按唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第二条 API 失败场景标题从 `route getOrganizations rejects` 收口为 `getOrganizations rejects`；保持第一条 `route getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && ./node_modules/.bin/tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` + 独立 reviewer | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 reviewer 返回 `passed=true`，review 结论为通过。 |
| 提交 | `git commit -m "test: relax route wording for issue detail getOrganizations rejection"` | 完成本轮 feature/work commit，得到真实提交 `d49f8f2e1008950fd1465cafb6c4294439530d94`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-165` 作为最新完成的 Implementation lane 最小增量写回，并补一条新的后继 `pending` Implementation 任务行供下一轮恢复。 |

### 282.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第一条已维持 `route getIssue rejects` 后，第二条 `route getOrganizations rejects` 仍可安全收口为 `getOrganizations rejects`，同时继续维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题收口为 `getOrganizations rejects`，同时保持第一条 `route getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-165` 作为最新完成项；由于任务板原先缺失后继 pending 行，本轮新增 `IMP-166` 占位性后继任务，要求下一轮先补足明确可验证的 Implementation 切口。

### 282.3 经验沉淀

- 当两条 route 级 API 失败标题都暂时带有 `route` 前缀时，仍应逐条复核是否每一条都需要继续保留该最小 route wording，而不要默认必须长期保持对称。
- 若任务板在完成当前项后缺失后继 pending 行，closeout 时必须先补一条可恢复的后继任务，否则下一轮 implementation cron 会因缺乏 lane 内 successor definition 而退化为纯文档修补。

### 282.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-165 → IMP-166` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `c46ad87359cc6aeeb1bd5b62bf31b48df3b5b306` |
| feature commit | `d49f8f2e1008950fd1465cafb6c4294439530d94` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`./node_modules/.bin/tsc --noEmit`、`git diff --check` |


## Session 281 — 2026-04-21：评估并补回第一条 legacy route API 失败标题中的 route 级语义词

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-164` 后续最小增量，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `getIssue rejects` / `route getOrganizations rejects` 后，第一条是否仍需恢复最小 route 级语义词；若需要，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 281.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件最近一次完成项仍为 `IMP-164`，Implementation lane 最新已落地组合为 `getIssue rejects` / `route getOrganizations rejects`，工作树可按唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第一条 API 失败场景标题从 `getIssue rejects` 补回为 `route getIssue rejects`；保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过。 |
| 提交 | `git commit -m "test: restore route wording for issue detail getIssue rejection"` | 完成本轮 feature/work commit，得到真实提交 `ee1a70ed6634cfc7890db142f25a813f743c3aff`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 将 `IMP-165` 作为最新完成的 Implementation lane 最小增量写回，并在任务板中新增下一轮待执行项。 |

### 281.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第二条已维持 `route getOrganizations rejects` 后，第一条 `getIssue rejects` 若继续不带 route 级语义词，会与 helper 级 lookup 标题层级过于接近。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题补回为 `route getIssue rejects`，同时保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-165` 作为最新完成项，下一轮转入继续评估第二条 route 级 API 失败场景标题是否仍可收口。

### 281.3 经验沉淀

- 当第二条 route 级 API 失败标题已恢复为 `route getOrganizations rejects` 后，应单独复核第一条是否也需要补回最小 route 级语义词来维持与 helper seam wording 的层级区分，而不要默认前一轮的无 route wording 仍然成立。
- 纯测试标题补回仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 281.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-165 → IMP-166` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `e9067b1ec55617bc6deab8e00a221873f05ee0a5` |
| feature commit | `ee1a70ed6634cfc7890db142f25a813f743c3aff` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |


## Session 280 — 2026-04-21：Capture lane 复核 CAP-08 闭环状态并对齐恢复源

**目标**：严格按 capture lane 规则恢复 `AGENTS.md`、`docs/status/roadmap-state.yaml`、`docs/linear-parity/task-board.md`、`~/Desktop/Cruise/.hermes/linear-9222-watchdog/last-status.txt` 与 capture 证据目录，只做一个最小 execution unit：若 `tmp/linear-capture/summary.json` 没有比 docs 更新，则把 CAP-08 的最新复核结论写回 task-board / roadmap-state / dev-logbook / worktime，并把状态文件当前任务重新对齐到 Capture lane，而不是重复采集。

### 280.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | 读取 `AGENTS.md`、`docs/status/roadmap-state.yaml`、`docs/linear-parity/task-board.md`、`~/Desktop/Cruise/.hermes/linear-9222-watchdog/last-status.txt`，并执行 `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认仓库位于 `codex/unify-issue-model`；工作树初始无脏文件，但状态文件当前仍停在 Implementation lane，而 capture lane 按 task-board 应回退到 `CAP-08`。 |
| 约束复核 | 读取 watchdog 最新状态 | 明确 `consumer_policy=attached_cdp_only`、`metadata_layer=ok`、`websocket_attach=ok`，且附着 target 继续指向 issue detail 页面 `CLE-28 Views 页面补齐创建/编辑/删除与状态反馈`；因此本轮禁止使用 Hermes 内置 `browser_*`，也不能把 blocker 误写成“附着失败”。 |
| 证据新鲜度核对 | 比较 `tmp/linear-capture/summary.json` 与 `docs/linear-parity/task-board.md` / `docs/status/roadmap-state.yaml` / `docs/planning/dev-logbook.md` / `doc/worktime.md` 最近修改时间 | 确认 `summary.json` 最近时间仍为 2026-04-19 23:20:06 CST，早于上述 docs 当前最近写回，说明 CAP-08 现有 capture 产物仍已完成 docs 闭环，本轮不应重复采集。 |
| 状态写回 | 更新 `docs/linear-parity/task-board.md` 与 `docs/status/roadmap-state.yaml` | 将 CAP-08 blocker 文案补成 2026-04-21 08:22 CST 的新复核结论，明确 blocker 继续是工作树闭环风险而非附着失败；并把状态文件 `current_task` 从 implementation 占位项对齐回 `Capture / CAP-08`。 |
| 日志写回 | 追加 `docs/planning/dev-logbook.md` 与 `doc/worktime.md` | 记录本轮 capture lane closure-only 复核：已有证据无新产物，仅完成状态源与日志对齐，不做重复采集，也不提交。 |
| 验证 | `git diff -- docs/linear-parity/task-board.md docs/status/roadmap-state.yaml docs/planning/dev-logbook.md doc/worktime.md` + 重读变更片段 | 复核仅有 capture lane docs/state/logbook/worktime 更新，无实现代码改动，也无误把 blocker 写成附着失败。 |

### 280.2 本轮落地结果

- 已再次确认 watchdog 仍处于 `attached_cdp_only + websocket_attach=ok` 健康状态，CAP-08 当前并非浏览器附着失败。
- 已再次确认 `tmp/linear-capture/summary.json` 没有比 task-board / roadmap-state / dev-logbook / worktime 更新，因此现有 capture 产物已完成 docs 闭环，本轮不做重复采集。
- 已将 `docs/status/roadmap-state.yaml` 的 `current_task` 从 implementation 占位项对齐回 `Capture / CAP-08`，避免后续 fresh cron session 因状态文件跨 lane 漂移而空转。
- 已把 CAP-08 blocker 更新为最新 capture lane 复核结论：当前阻塞点仍是工作树闭环风险，下一轮应在独立干净工作树执行只读采集，或待 implementation 收口完成后再继续 `Add label` search input 的空结果/建议反馈态证据。

### 280.3 经验沉淀

- 当状态文件 `current_task.lane` 漂到 Implementation，但 capture lane 证据产物与 task-board 已能明确恢复点时，必须先把状态文件重新对齐到 capture 当前任务，否则后续 cron 会持续从错误 lane 起跑。
- 对 capture cron 而言，只要 watchdog 明确给出 `attached_cdp_only` 与 `websocket_attach=ok`，且 `summary.json` 不晚于 docs 最近写回，就应优先做 docs/state/logbook/worktime 闭环复核，而不是为了“有动作”去重复采集。

### 280.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Capture / CAP-08（blocked）` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `ace0a4ce4f2f0c839bfb1badbb0ab41a004b3575` |
| docs/state commit | `0bd0f6fdcbf649ecc65f17bf7945c250fbf9795f` |
| watchdog | `consumer_policy=attached_cdp_only`、`websocket_attach=ok` |
| capture 证据新鲜度 | `tmp/linear-capture/summary.json`（2026-04-19 23:20:06 CST）早于 docs 最新写回 |
| Git commit hash | `未提交（capture closure-only 复核）`；docs/state commit：`0bd0f6fdcbf649ecc65f17bf7945c250fbf9795f` |


## Session 320 — 2026-04-21：Capture lane 复用 9222 target 刷新 CAP-08 只读证据基线并回写 docs

**目标**：严格按 capture lane 规则恢复 `AGENTS.md`、`docs/status/roadmap-state.yaml`、`docs/linear-parity/task-board.md`、`~/Desktop/Cruise/.hermes/linear-9222-watchdog/last-status.txt` 与 `tmp/linear-capture/summary.json`，在 `consumer_policy=attached_cdp_only` 且 `websocket_attach=ok` 的前提下，只做一个最小 execution unit：若 docs 已落后于本轮只读 capture 产物，则复用现有本地 Chrome 9222 target 执行一次最小只读采集，并把 CAP-08 最新状态写回 task-board / roadmap-state / dev-logbook / worktime；不得进入 Implementation lane，也不得做持久提交。

### 320.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | 读取 `AGENTS.md`、`docs/status/roadmap-state.yaml`、`docs/linear-parity/task-board.md`、`~/Desktop/Cruise/.hermes/linear-9222-watchdog/last-status.txt`，并执行 `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` | 确认仓库仍在 `codex/unify-issue-model`，状态文件 `current_task` 漂在 Implementation lane，而 capture lane 依据 task-board 仍应回到 `CAP-08`。 |
| 约束复核 | 读取 watchdog 最新状态 | 再次确认 `consumer_policy=attached_cdp_only`、`metadata_layer=ok`、`websocket_attach=ok`，且附着 target 继续指向 issue detail 页面 `CLE-28 Views 页面补齐创建/编辑/删除与状态反馈`；因此本轮继续禁止使用 Hermes 内置 `browser_*`，也不能把 blocker 误写成“附着失败”。 |
| 证据刷新 | 运行 `python3 scripts/linear_capture_toolbar_issue_detail.py 81A3713C33BCA35B2A0B8C7D177F43AD ~/Desktop/Cruise/tmp/linear-capture` | 成功复用现有 9222 target 执行只读 capture，并把 `tmp/linear-capture/summary.json` 与同批 `toolbar-*.png/.json`、`tab-*.png/.json`、`issue-detail-open.*`、`navigate-last-state.*` 刷新到 2026-04-21 19:24 CST。新的 `summary.json` 含 `baselineAfterTabs`、`issueDetail`、`issueDirect` 与 `interactions` 结构，确认 issue 详情页顶部仍可见 `Create new issue`、`Issue options`、`Add label`、`Add sub-issues`、`Unsubscribe` 等入口，team issues 顶部仍可见 `Add filter`、`Display options`、`Create new issue` 及 `All issues` / `Active` / `Backlog` tabs。 |
| 状态写回 | 更新 `docs/linear-parity/task-board.md` 与 `docs/status/roadmap-state.yaml` | 把 CAP-08 blocker 文案刷新到 2026-04-21 19:24 CST，明确本轮已完成一刀最小只读 capture 并落下新的证据基线；同时把状态文件 `current_task` 明确对齐回 `Capture / CAP-08`，并继续把 blocker 记为工作树闭环风险而非附着失败。 |
| 日志写回 | 追加 `docs/planning/dev-logbook.md` 与 `doc/worktime.md` | 记录本轮 capture lane 最小只读采集 + docs 闭环：已刷新 CAP-08 证据基线，但为避免跨 lane 污染，不继续扩展为更多打开态/校验态采集，也不提交。 |
| 验证 | 重读 task-board / roadmap-state / dev-logbook / worktime 变更片段并执行 `git diff -- docs/linear-parity/task-board.md docs/status/roadmap-state.yaml docs/planning/dev-logbook.md doc/worktime.md` | 复核本轮仅有 capture lane docs/state/logbook/worktime 更新，无 Implementation 代码改动，也未把 blocker 错写成附着失败。 |

### 320.2 本轮落地结果

- 已再次确认 watchdog 继续处于 `attached_cdp_only + websocket_attach=ok` 健康状态，本轮所有动作都基于现有本地 Chrome 9222 target 完成。
- 已新增一轮 CAP-08 只读 capture 基线：`tmp/linear-capture/summary.json` 与同批 `.png/.json` 产物刷新到 2026-04-21 19:24 CST，可直接支撑后续对 `Create new issue` / `Issue options` / `Add label` 打开态与校验反馈的继续采集。
- 已把 `docs/status/roadmap-state.yaml` 的 `current_task` 对齐回 `Capture / CAP-08`，避免后续 fresh cron session 再从 implementation 占位项起跑。
- 已把 CAP-08 blocker 更新为最新 capture lane 结论：当前阻塞点仍是工作树闭环风险，下一轮应在独立干净工作树继续只读采集，而不是把问题误记为附着失败。

### 320.3 经验沉淀

- 当 watchdog 已明确给出 `attached_cdp_only` 与 `websocket_attach=ok` 时，capture cron 应优先复用同一 9222 target 做最小只读采集或 docs 闭环，而不是回退到 Hermes 内置浏览器。
- 当状态文件被 implementation lane 占位项覆盖时，即使本轮新增了 capture 证据，也必须把 `current_task` 重新对齐到 capture lane 当前任务，否则 fresh cron 仍会继续跨 lane 空转。

### 320.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Capture / CAP-08（blocked）` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `8e37c7f359848c7f9e63844d4af67b4a778e866a` |
| watchdog | `consumer_policy=attached_cdp_only`、`websocket_attach=ok` |
| 最新 capture 证据 | `tmp/linear-capture/summary.json` 与同批 `.png/.json` 已刷新到 2026-04-21 19:24 CST |
| Git commit hash | `未提交（capture 只读采集 + docs 闭环）` |


## Session 279 — 2026-04-21：评估并补回第二条 legacy route API 失败标题中的 route 级语义词

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-164`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `getIssue rejects` / `getOrganizations rejects` 后，第二条是否仍需恢复最小 route 级语义词；若需要，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 279.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与 task-board 均指向 Implementation lane 的 `IMP-164`，工作树初始干净，可按唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第二条 API 失败场景标题从 `getOrganizations rejects` 补回为 `route getOrganizations rejects`；保持第一条 `getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && ./node_modules/.bin/tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` + 独立 reviewer subagent | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore second legacy route reject title again"` | 完成本轮 feature/work commit，得到真实提交 `e9067b1ec55617bc6deab8e00a221873f05ee0a5`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 将 `IMP-164` 写回 done，并补入下一轮建议执行项。 |

### 279.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第一条已维持 `getIssue rejects` 后，第二条 `getOrganizations rejects` 若继续不带 route 级语义词，会与 helper 级 lookup 标题层级过于接近。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题补回为 `route getOrganizations rejects`，同时保持第一条 `getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-164` -> `done`，等待下一轮从 task-board 选择新的 Implementation lane task。

### 279.3 经验沉淀

- 当第一条 route 级 API 失败标题已收口为 `getIssue rejects` 时，应单独复核第二条是否需要恢复最小 route 级语义词来维持与 helper seam wording 的层级区分，而不要因为上一轮已同时收口就默认继续成立。
- 纯测试标题补回仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 279.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-164 → 待从 task-board 续选` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `367775926cf97e7fd0d0dfd48d889334efc02736` |
| feature commit | `e9067b1ec55617bc6deab8e00a221873f05ee0a5` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`./node_modules/.bin/tsc --noEmit`、`git diff --check` |

## Session 278 — 2026-04-21：评估并收口第一条 legacy route API 失败标题中的 route 级语义词

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-163`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `route getIssue rejects` / `getOrganizations rejects` 后，第一条是否仍可安全收口为无 route wording；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 278.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与 task-board 均指向 Implementation lane 的 `IMP-163`，工作树初始干净，可按唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第一条 API 失败场景标题从 `route getIssue rejects` 收口为 `getIssue rejects`；保持第二条 `getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` + 独立 reviewer subagent | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: drop first legacy route reject title again"` | 完成本轮 feature/work commit，得到真实提交 `7a87390764e338572809eba65653da1ed669f710`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-163` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-164`：评估在再次同时收口为 `getIssue rejects` / `getOrganizations rejects` 后，第二条是否仍需恢复 route 级语义词。 |

### 278.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第二条已维持 `getOrganizations rejects` 后，第一条 `route getIssue rejects` 同样可安全收口为 `getIssue rejects`，同时继续维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题收口为 `getIssue rejects`，同时保持第二条 `getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-163` -> `done`，下一轮转入 `IMP-164`，继续评估第二条 route 级 API 失败场景标题在再次同时收口为无 route wording 后是否仍需恢复 route 级语义词。

### 278.3 经验沉淀

- 当第二条 route 级 API 失败标题已维持 `getOrganizations rejects` 时，应单独复核第一条是否仍可安全收口为无 route wording，而不要默认已恢复的 route 前缀必须继续保留在第一条断言上。
- 纯测试标题收口仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 278.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-163 → IMP-164` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `c0c3b894f2f29567fe7831766c49a2f5de38d862` |
| feature commit | `7a87390764e338572809eba65653da1ed669f710` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 277 — 2026-04-21：评估并收口第二条 legacy route API 失败标题中的 route 级语义词

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-162`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `route getIssue rejects` / `route getOrganizations rejects` 后，第二条是否仍可安全收口为无 route wording；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 277.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与 task-board 均指向 Implementation lane 的 `IMP-162`，工作树初始干净，可按唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第二条 API 失败场景标题从 `route getOrganizations rejects` 收口为 `getOrganizations rejects`；保持第一条 `route getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` + 独立 reviewer subagent | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: drop second legacy route reject title again"` | 完成本轮 feature/work commit，得到真实提交 `778140831bc4d2c307e169a379a9c5eec77d3b0b`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-162` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-163`：评估在再次变为 `route getIssue rejects` / `getOrganizations rejects` 的非对称 route wording 后，第一条是否仍可收口为无 route wording。 |

### 277.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第一条已维持 `route getIssue rejects` 后，第二条 `route getOrganizations rejects` 仍可安全收口为 `getOrganizations rejects`，同时继续维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题收口为 `getOrganizations rejects`，同时保持第一条 `route getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-162` -> `done`，下一轮转入 `IMP-163`，继续评估第一条 route 级 API 失败场景标题在再次变为非对称 route wording 后是否仍可收口为无 route wording。

### 277.3 经验沉淀

- 当第一条 route 级 API 失败标题已维持 `route getIssue rejects` 时，应单独复核第二条是否仍可安全收口为无 route wording，而不要默认已恢复的 route 前缀必须继续对称保留。
- 纯测试标题收口仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 277.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-162 → IMP-163` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `daa8d2a1cff2c6bdf43fa561b77eea2d80ae3251` |
| feature commit | `778140831bc4d2c307e169a379a9c5eec77d3b0b` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 276 — 2026-04-21：评估并补回第一条 legacy route API 失败标题中的 route 级语义词

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-161`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `getIssue rejects` / `route getOrganizations rejects` 后，第一条是否需要恢复最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 276.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与 task-board 均指向 Implementation lane 的 `IMP-161`，工作树干净，可按本轮唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第一条 API 失败场景标题从 `getIssue rejects` 补回为 `route getIssue rejects`；保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` + 独立 reviewer subagent | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore first legacy route reject title again"` | 完成本轮 feature/work commit，得到真实提交 `59bd0b99c17ef4c92f8a2ce2ee243d6b7eb0c4c8`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-161` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-162`：评估在再次均带 `route getIssue rejects` / `route getOrganizations rejects` 后，第二条是否仍可再次收口为无 route wording。 |

### 276.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第二条已维持 `route getOrganizations rejects` 后，第一条 `getIssue rejects` 若继续不带 route 级语义词，会与 helper 级 lookup 标题层级过于接近。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题补回为 `route getIssue rejects`，同时保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-161` -> `done`，下一轮转入 `IMP-162`，继续评估第二条 route 级 API 失败场景标题在再次均带 route wording 后是否仍可再次收口为无 route wording。

### 276.3 经验沉淀

- 当第二条 route 级 API 失败标题已维持 `route getOrganizations rejects` 时，应单独复核第一条是否需要恢复最小 route 级语义词来维持与 helper seam wording 的层级区分，而不要因上一轮收口过该前缀就默认继续成立。
- 纯测试标题补回仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 276.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-161 → IMP-162` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `74b6850bd9782f3717803afb1769a9bde8e9497e` |
| feature commit | `59bd0b99c17ef4c92f8a2ce2ee243d6b7eb0c4c8` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 275 — 2026-04-21：评估并收口第一条 legacy route API 失败标题中的 route 级语义词

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-159`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `route getIssue rejects` / `getOrganizations rejects` 后，第一条是否仍可安全收口为无 route wording；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 275.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与 task-board 均指向 Implementation lane 的 `IMP-159`，工作树干净，可按本轮唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第一条 API 失败场景标题从 `route getIssue rejects` 收口为 `getIssue rejects`；保持第二条 `getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` + 独立 reviewer subagent | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: drop first legacy route reject title again"` | 完成本轮 feature/work commit，得到真实提交 `8ca4a772bca48480604638d26ca252e7eebc3a35`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-159` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-160`：评估在再次同时收口为 `getIssue rejects` / `getOrganizations rejects` 后，第二条是否仍需恢复 route 级语义词。 |

### 275.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第二条已维持 `getOrganizations rejects` 后，第一条 `route getIssue rejects` 同样可安全再次收口为 `getIssue rejects`，同时继续与 helper 级 lookup 标题保持可辨识的层级区分。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题收口为 `getIssue rejects`，同时保持第二条 `getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-159` -> `done`，下一轮转入 `IMP-160`，继续评估第二条 route 级 API 失败场景标题在再次同时收口为无 route wording 后是否仍需恢复最小 route 级语义词。

### 275.3 经验沉淀

- 当第二条 route 级 API 失败标题已维持 `getOrganizations rejects` 时，应单独复核第一条是否仍可安全收口为无 route wording，而不要因上一轮补回过该前缀就默认继续沿用。
- 纯测试标题收口仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 275.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-159 → IMP-160` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `d26084c94c05f9452fd7b32f4c1c9857f8d19ceb` |
| feature commit | `8ca4a772bca48480604638d26ca252e7eebc3a35` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 274 — 2026-04-21：评估并收口第二条 legacy route API 失败标题中的 route 级语义词

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-158`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `route getIssue rejects` / `route getOrganizations rejects` 后，第二条是否仍可再次收口为无 route wording；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 274.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与 task-board 均指向 Implementation lane 的 `IMP-158`，工作树干净，可按本轮唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第二条 API 失败场景标题从 `route getOrganizations rejects` 收口为 `getOrganizations rejects`；保持第一条 `route getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` + 独立 reviewer subagent | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: drop second legacy route reject title"` | 完成本轮 feature/work commit，得到真实提交 `d26084c94c05f9452fd7b32f4c1c9857f8d19ceb`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-158` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-159`：评估在再次变为 `route getIssue rejects` / `getOrganizations rejects` 的非对称 route wording 后，第一条是否仍需保留 route 级语义词。 |

### 274.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第一条已维持 `route getIssue rejects` 后，第二条 `route getOrganizations rejects` 可安全再次收口为 `getOrganizations rejects`，同时继续与 helper 级 lookup 标题保持可辨识的层级区分。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题收口为 `getOrganizations rejects`，同时保持第一条 `route getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-158` -> `done`，下一轮转入 `IMP-159`，继续评估第一条 route 级 API 失败场景标题在再次变为非对称 route wording 后是否仍需保留最小 route 级语义词。

### 274.3 经验沉淀

- 当第一条 route 级 API 失败标题已维持 `route getIssue rejects` 时，应单独复核第二条是否仍可安全收口为无 route wording，而不要默认此前的 route 前缀结论会持续成立。
- 纯测试标题收口仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 274.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-158 → IMP-159` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `3dd5d0c0eca0afb6835c362663d6ca9888596920` |
| feature commit | `d26084c94c05f9452fd7b32f4c1c9857f8d19ceb` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 273 — 2026-04-21：评估并补回第一条 legacy route API 失败标题中的 route 级语义词

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-157`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `getIssue rejects` / `route getOrganizations rejects` 后，第一条是否需要恢复最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 273.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与 task-board 均指向 Implementation lane 的 `IMP-157`，工作树干净，可按本轮唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第一条 API 失败场景标题从 `getIssue rejects` 补回为 `route getIssue rejects`；保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` + 独立 reviewer subagent | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore first legacy route reject title"` | 完成本轮 feature/work commit，得到真实提交 `928097c29d390214ed67533b08851c9ee3ccad22`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-157` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-158`：评估在再次同时恢复为 `route getIssue rejects` / `route getOrganizations rejects` 后，第二条是否仍可再次收口为无 route wording。 |

### 273.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第二条已维持 `route getOrganizations rejects` 后，第一条 `getIssue rejects` 若继续不带 route 级语义词，会与 helper 级 lookup 标题层级过于接近。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题补回为 `route getIssue rejects`，同时保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-157` -> `done`，下一轮转入 `IMP-158`，继续评估第二条 route 级 API 失败场景标题在再次同时恢复 route wording 后是否仍可再次收口为无 route wording。

### 273.3 经验沉淀

- 当第二条 route 级 API 失败标题已维持 `route getOrganizations rejects` 时，应单独复核第一条是否需要恢复最小 route 级语义词来维持与 helper seam wording 的层级区分，而不要因上一轮收口过该前缀就默认继续成立。
- 纯测试标题补回仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 273.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-157 → IMP-158` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `8015a80d58c897521fa7f00f6506b72999091f38` |
| feature commit | `928097c29d390214ed67533b08851c9ee3ccad22` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 272 — 2026-04-21：评估并补回第二条 legacy route API 失败标题中的 route 级语义词

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-156`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `getIssue rejects` / `getOrganizations rejects` 后，第二条是否仍需恢复最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 272.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与 task-board 均指向 Implementation lane 的 `IMP-156`，工作树干净，可按本轮唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第二条 API 失败场景标题从 `getOrganizations rejects` 补回为 `route getOrganizations rejects`；保持第一条 `getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` + 独立 reviewer subagent | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore second legacy route reject title"` | 完成本轮 feature/work commit，得到真实提交 `e662450a59d99422a6bfe632c75e677957fb2cd2`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-156` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-157`：评估在再次变为 `getIssue rejects` / `route getOrganizations rejects` 的非对称 route wording 后，第一条是否需要恢复 route 级语义词。 |

### 272.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第一条已维持 `getIssue rejects` 后，第二条 `getOrganizations rejects` 若继续不带 route 级语义词，会与 helper 级 lookup 标题层级过于接近。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题补回为 `route getOrganizations rejects`，同时保持第一条 `getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-156` -> `done`，下一轮转入 `IMP-157`，继续评估第一条 route 级 API 失败场景标题在再次变为非对称 route wording 后是否需要恢复最小 route 级语义词。

### 272.3 经验沉淀

- 当第一条 route 级 API 失败标题已维持 `getIssue rejects` 时，应单独复核第二条是否仍需恢复最小 route 级语义词来维持与 helper seam wording 的层级区分，而不要默认两条 route 标题可以长期同时省略该前缀。
- 纯测试标题补回仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 272.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-156 → IMP-157` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `aa9b72da92804970e4b14ab869fb5cc6d54ded38` |
| feature commit | `e662450a59d99422a6bfe632c75e677957fb2cd2` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 271 — 2026-04-21：评估并收口第一条 legacy route API 失败标题中的 route 级语义词

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-155`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `route getIssue rejects` / `getOrganizations rejects` 后，第一条是否仍可安全收口为无 route wording；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 271.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与 task-board 均指向 Implementation lane 的 `IMP-155`，工作树仅包含同一 execution unit 的 docs/state closeout 脏变更，可继续闭环。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第一条 API 失败场景标题从 `route getIssue rejects` 收口为 `getIssue rejects`；保持第二条 `getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` + 独立 reviewer subagent | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: drop first legacy route reject title"` | 完成本轮 feature/work commit，得到真实提交 `aa9b72da92804970e4b14ab869fb5cc6d54ded38`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-155` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-156`：评估在再次同时收口为 `getIssue rejects` / `getOrganizations rejects` 后，第二条是否仍需恢复 route 级语义词。 |

### 271.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第二条已维持 `getOrganizations rejects` 后，第一条 `route getIssue rejects` 同样无须继续保留最小 route 级语义词来维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题收口为 `getIssue rejects`，同时保持第二条 `getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-155` -> `done`，下一轮转入 `IMP-156`，继续评估第二条 route 级 API 失败场景标题在再次同时收口为无 route wording 后是否仍需恢复最小 route 级语义词。

### 271.3 经验沉淀

- 当第二条 route 级 API 失败标题已维持 `getOrganizations rejects` 时，应单独复核第一条是否仍需保留最小 route 级语义词，而不要因上一轮保留过该前缀就默认继续沿用。
- 纯测试标题收口仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 271.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-155 → IMP-156` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `4e8c5ef7046ec97dc7c33c321aa0a664722e75b5` |
| feature commit | `aa9b72da92804970e4b14ab869fb5cc6d54ded38` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 270 — 2026-04-21：评估并收口第二条 legacy route API 失败标题中的 route 级语义词

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-154`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `route getIssue rejects` / `route getOrganizations rejects` 后，第二条是否仍可安全收口为无 route wording；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 270.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与 task-board 均指向 Implementation lane 的 `IMP-154`，工作树干净，可按本轮唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第二条 API 失败场景标题从 `route getOrganizations rejects` 收口为 `getOrganizations rejects`；保持第一条 `route getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` + 独立 reviewer subagent | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: drop second legacy route reject title"` | 完成本轮 feature/work commit，得到真实提交 `f6bcfd9b7f83fef537a49bc44506023b7f3ba754`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-154` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-155`：评估在再次变为 `route getIssue rejects` / `getOrganizations rejects` 的非对称 route wording 后，第一条是否仍需保留 route 级语义词。 |

### 270.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第一条已维持 `route getIssue rejects` 后，第二条 `route getOrganizations rejects` 已无须继续保留最小 route 级语义词来维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题收口为 `getOrganizations rejects`，同时保持第一条 `route getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-154` -> `done`，下一轮转入 `IMP-155`，继续评估第一条 route 级 API 失败场景标题在再次变为非对称 route wording 后是否仍需保留最小 route 级语义词。

### 270.3 经验沉淀

- 当第一条 route 级 API 失败标题仍维持 `route getIssue rejects` 时，应单独复核第二条是否仍需保留最小 route 级语义词来维持与 helper seam wording 的层级区分，而不要默认两条 route 标题必须长期对称保留该前缀。
- 纯测试标题收口仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 270.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-154 → IMP-155` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `b946bfe924be791eb5391df01ec7aa8c3a92a29e` |
| feature commit | `f6bcfd9b7f83fef537a49bc44506023b7f3ba754` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 269 — 2026-04-21：评估并补回第二条 legacy route API 失败标题中的 route 级语义词

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-152`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `getIssue rejects` / `getOrganizations rejects` 后，第二条是否仍需恢复最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 269.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与 task-board 均指向 Implementation lane 的 `IMP-152`，工作树干净，可按本轮唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第二条 API 失败场景标题从 `getOrganizations rejects` 补回为 `route getOrganizations rejects`；保持第一条 `getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` + 独立 reviewer subagent | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore second legacy route reject title"` | 完成本轮 feature/work commit，得到真实提交 `b6cfd61c0f1dfdae088b685fe548bbd5cf77fbc0`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-152` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-153`：评估在再次变为 `getIssue rejects` / `route getOrganizations rejects` 的非对称 route wording 后，第一条是否需要恢复 route 级语义词。 |

### 269.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第一条已维持 `getIssue rejects` 后，第二条 `getOrganizations rejects` 若继续不带 route 级语义词，会与 helper 级 lookup 标题层级过于接近。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题补回为 `route getOrganizations rejects`，同时保持第一条 `getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-152` -> `done`，下一轮转入 `IMP-153`，继续评估第一条 route 级 API 失败场景标题在再次变为非对称 route wording 后是否需要恢复最小 route 级语义词。

### 269.3 经验沉淀

- 当第一条 route 级 API 失败标题已维持 `getIssue rejects` 时，应单独复核第二条是否仍需恢复最小 route 级语义词来维持与 helper seam wording 的层级区分，而不要默认两条 route 标题可以长期同时省略该前缀。
- 纯测试标题补回仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 269.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-152 → IMP-153` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `fc151fff4b75408b7df09c3257a502f2ff410105` |
| feature commit | `b6cfd61c0f1dfdae088b685fe548bbd5cf77fbc0` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 268 — 2026-04-21：评估并收口第一条 legacy route API 失败标题中的 route 级语义词

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-151`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `route getIssue rejects` / `getOrganizations rejects` 后，第一条是否仍需保留最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 268.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与 task-board 均指向 Implementation lane 的 `IMP-151`，工作树干净，可按本轮唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第一条 API 失败场景标题从 `route getIssue rejects` 收口为 `getIssue rejects`；保持第二条 `getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` + 独立 reviewer subagent | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: drop first legacy route reject title"` | 完成本轮 feature/work commit，得到真实提交 `570598205392a783d47cbd7dd42447b72ed561f1`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-151` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-152`：评估在再次同时收口为 `getIssue rejects` / `getOrganizations rejects` 后，第二条是否仍需恢复 route 级语义词。 |

### 268.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第二条已维持 `getOrganizations rejects` 后，第一条 `route getIssue rejects` 同样无须继续保留最小 route 级语义词来维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题收口为 `getIssue rejects`，同时保持第二条 `getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-151` -> `done`，下一轮转入 `IMP-152`，继续评估第二条 route 级 API 失败场景标题在再次同时收口为无 route wording 后是否仍需恢复最小 route 级语义词。

### 268.3 经验沉淀

- 当第二条 route 级 API 失败标题已维持 `getOrganizations rejects` 时，应单独复核第一条是否仍需保留最小 route 级语义词，而不要因上一轮保留过该前缀就默认继续沿用。
- 纯测试标题收口仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 268.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-151 → IMP-152` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `05a72e27db021ff2a3d8d06cdf6acf230af077b8` |
| feature commit | `570598205392a783d47cbd7dd42447b72ed561f1` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 267 — 2026-04-21：评估并补回第一条 legacy route API 失败标题中的 route 级语义词

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-149`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `getIssue rejects` / `route getOrganizations rejects` 后，第一条是否仍需恢复最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 267.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与 task-board 均指向 Implementation lane 的 `IMP-149`，工作树干净，可按本轮唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第一条 API 失败场景标题从 `getIssue rejects` 补回为 `route getIssue rejects`；保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` + 独立 reviewer subagent | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore first legacy route reject title"` | 完成本轮 feature/work commit，得到真实提交 `2663739ae96d00471cb8918d764187fdd9399fa5`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-149` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-150`：评估在再次同时恢复为 `route getIssue rejects` / `route getOrganizations rejects` 后，第二条是否仍需保留 route 级语义词。 |

### 267.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第二条已维持 `route getOrganizations rejects` 后，第一条 `getIssue rejects` 若继续不带最小 route 级语义词，会与 helper 级 lookup 标题层级过于接近。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题补回为 `route getIssue rejects`，同时保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-149` -> `done`，下一轮转入 `IMP-150`，继续评估第二条 route 级 API 失败场景标题在再次同时恢复 route wording 后是否仍需保留最小 route 级语义词。

### 267.3 经验沉淀

- 当第二条 route 级 API 失败标题已维持 `route getOrganizations rejects` 时，应单独复核第一条是否仍需恢复最小 route 级语义词来维持与 helper seam wording 的层级区分，而不要默认之前收口过该前缀就会继续成立。
- 纯测试标题补回仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 267.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-149 → IMP-150` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `19162da372aec2098a07b858cf6a32ba1b0d4a66` |
| feature commit | `2663739ae96d00471cb8918d764187fdd9399fa5` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 266 — 2026-04-21：评估并补回第二条 legacy route API 失败标题中的 route 级语义词

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-148`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `getIssue rejects` / `getOrganizations rejects` 后，第二条是否仍需恢复最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 266.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与 task-board 均指向 Implementation lane 的 `IMP-148`，工作树干净，可按本轮唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第二条 API 失败场景标题从 `getOrganizations rejects` 补回为 `route getOrganizations rejects`；保持第一条 `getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` + 独立 reviewer subagent | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore second legacy route reject title"` | 完成本轮 feature/work commit，得到真实提交 `19162da372aec2098a07b858cf6a32ba1b0d4a66`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-148` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-149`：评估在再次变为 `getIssue rejects` / `route getOrganizations rejects` 的非对称 route wording 后，第一条是否需要恢复 route 级语义词。 |

### 266.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第一条已维持 `getIssue rejects` 后，第二条 `getOrganizations rejects` 若继续不带 route 级语义词，会与 helper 级 lookup 标题层级过于接近。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题补回为 `route getOrganizations rejects`，同时保持第一条 `getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-148` -> `done`，下一轮转入 `IMP-149`，继续评估第一条 route 级 API 失败场景标题在再次变为非对称 route wording 后是否需要恢复最小 route 级语义词。

### 266.3 经验沉淀

- 当第一条 route 级 API 失败标题已收口为 `getIssue rejects` 时，应单独复核第二条是否需要恢复最小 route 级语义词来维持与 helper seam wording 的层级区分，而不要默认两条 route 标题必须长期同时移除该前缀。
- 纯测试标题补回应继续坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 266.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-148 → IMP-149` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `90a57c844ba6c632fd629efcc427777d16146c1d` |
| feature commit | `19162da372aec2098a07b858cf6a32ba1b0d4a66` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 265 — 2026-04-21：评估并收口第二条 legacy route API 失败标题中的 route 级语义词

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-146`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `route getIssue rejects` / `route getOrganizations rejects` 后，第二条是否仍需保留最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 265.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与 task-board 均指向 Implementation lane 的 `IMP-146`，工作树干净，可按本轮唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第二条 API 失败场景标题从 `route getOrganizations rejects` 收口为 `getOrganizations rejects`；保持第一条 `route getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` + 独立 reviewer subagent | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: drop second legacy route reject title"` | 完成本轮 feature/work commit，得到真实提交 `ea42a706c2b5b705af6627d044c0a2e3ef36809e`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-146` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-147`：评估在再次变为 `route getIssue rejects` / `getOrganizations rejects` 的非对称 route wording 后，第一条是否仍需保留 route 级语义词。 |

### 265.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第一条仍为 `route getIssue rejects` 后，第二条 `route getOrganizations rejects` 已无须继续保留最小 route 级语义词来维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题收口为 `getOrganizations rejects`，同时保持第一条 `route getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-146` -> `done`，下一轮转入 `IMP-147`，继续评估第一条 route 级 API 失败场景标题在再次变为非对称 route wording 后是否仍需保留最小 route 级语义词。

### 265.3 经验沉淀

- 当第一条 route 级 API 失败标题仍维持 `route getIssue rejects` 时，应单独复核第二条是否仍需保留最小 route 级语义词来维持与 helper seam wording 的层级区分，而不要默认两条 route 标题必须长期对称保留该前缀。
- 纯测试标题收口仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 265.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-146 → IMP-147` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `bc423a083f8aca48f161e6e9e41d7d39d6b8af08` |
| feature commit | `ea42a706c2b5b705af6627d044c0a2e3ef36809e` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 264 — 2026-04-21：评估并补回第一条 legacy route API 失败标题中的 route 级语义词

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-145`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `getIssue rejects` / `route getOrganizations rejects` 后，第一条是否仍需恢复最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 264.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与 task-board 均指向 Implementation lane 的 `IMP-145`，工作树干净，可按本轮唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第一条 API 失败场景标题从 `getIssue rejects` 补回为 `route getIssue rejects`；保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` + 独立 reviewer subagent | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore first legacy route reject title"` | 完成本轮 feature/work commit，得到真实提交 `cff1f926d0cf017324bb196bb2942af7133866c7`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-145` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-146`：评估在再次同时恢复为 `route getIssue rejects` / `route getOrganizations rejects` 后，第二条是否仍需保留 route 级语义词。 |

### 264.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第二条已维持 `route getOrganizations rejects` 后，第一条 `getIssue rejects` 若继续不带 route 级语义词，会与 helper 级 lookup 标题层级过于接近。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题补回为 `route getIssue rejects`，同时保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-145` -> `done`，下一轮转入 `IMP-146`，继续评估第二条 route 级 API 失败场景标题在再次同时恢复 route wording 后是否仍需保留最小 route 级语义词。

### 264.3 经验沉淀

- 当第二条 route 级 API 失败标题已维持 `route getOrganizations rejects` 时，应单独复核第一条是否仍需恢复最小 route 级语义词来维持与 helper seam wording 的层级区分，而不要默认之前收口过该前缀就会继续成立。
- 纯测试标题补回仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 264.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-145 → IMP-146` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `e25a1b501bcda6f9c1c423e5e329cf9d13b78cbc` |
| feature commit | `cff1f926d0cf017324bb196bb2942af7133866c7` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 263 — 2026-04-21：评估并补回第二条 legacy route API 失败标题中的 route 级语义词

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-144`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `getIssue rejects` / `getOrganizations rejects` 后，第二条是否仍需恢复最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 263.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与 task-board 均指向 Implementation lane 的 `IMP-144`，工作树干净，可按本轮唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第二条 API 失败场景标题从 `getOrganizations rejects` 补回为 `route getOrganizations rejects`；保持第一条 `getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` + 独立 reviewer subagent | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore second legacy route reject title"` | 完成本轮 feature/work commit，得到真实提交 `d5f437ff61c1f67b232915ecc104c5757ebe2ca8`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-144` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-145`：评估在再次变为 `getIssue rejects` / `route getOrganizations rejects` 的非对称 route wording 后，第一条是否仍需恢复 route 级语义词。 |

### 263.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第一条已维持 `getIssue rejects` 后，第二条 `getOrganizations rejects` 若继续不带 route 级语义词，会与 helper 级 lookup 标题层级过于接近。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题补回为 `route getOrganizations rejects`，同时保持第一条 `getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-144` -> `done`，下一轮转入 `IMP-145`，继续评估第一条 route 级 API 失败场景标题在再次变为非对称 route wording 后是否仍需恢复最小 route 级语义词。

### 263.3 经验沉淀

- 当第一条 route 级 API 失败标题已维持 `getIssue rejects` 时，应单独复核第二条是否仍需恢复最小 route 级语义词来维持与 helper seam wording 的层级区分，而不要默认两条 route 标题可以长期同时省略该前缀。
- 纯测试标题补回仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 263.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-144 → IMP-145` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `10035a47a353bb1394c820a10370030a46e693f7` |
| feature commit | `d5f437ff61c1f67b232915ecc104c5757ebe2ca8` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 262 — 2026-04-21：评估并收口第一条 legacy route API 失败标题中的 route 级语义词

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-143`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `route getIssue rejects` / `getOrganizations rejects` 后，第一条是否仍需保留最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 262.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与 task-board 均指向 Implementation lane 的 `IMP-143`，工作树干净，可按本轮唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第一条 API 失败场景标题从 `route getIssue rejects` 收口为 `getIssue rejects`；保持第二条 `getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` + 独立 reviewer subagent | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: drop first legacy route reject title"` | 完成本轮 feature/work commit，得到真实提交 `b096b63acea6d026b343a5fd43918f4bb00c1709`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-143` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-144`：评估在再次同时收口为 `getIssue rejects` / `getOrganizations rejects` 后，第二条是否仍需恢复 route 级语义词。 |

### 262.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第二条已维持 `getOrganizations rejects` 后，第一条 `route getIssue rejects` 同样无须继续保留最小 route 级语义词来维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题收口为 `getIssue rejects`，同时保持第二条 `getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-143` -> `done`，下一轮转入 `IMP-144`，继续评估第二条 route 级 API 失败场景标题在再次同时收口为无 route wording 后是否仍需恢复最小 route 级语义词。

### 262.3 经验沉淀

- 当第二条 route 级 API 失败标题已维持 `getOrganizations rejects` 时，应单独复核第一条是否仍需保留最小 route 级语义词，而不要因上一轮补回过该前缀就默认继续沿用。
- 纯测试标题收口仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 262.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-143 → IMP-144` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / 953dccb8a64747aa3beb9d759cce20bf06e84452 |
| feature commit | `b096b63acea6d026b343a5fd43918f4bb00c1709` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 261 — 2026-04-21：评估并收口第二条 legacy route API 失败标题中的 route 级语义词

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-142`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `route getIssue rejects` / `route getOrganizations rejects` 后，第二条是否仍需保留最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 261.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与 task-board 均指向 Implementation lane 的 `IMP-142`，本轮 feature/work commit 已落地为 `a2ffc5c0235e28ffe53b7e60e5d4597c3c405def`，当前仅剩 docs/state closeout。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第二条 API 失败场景标题从 `route getOrganizations rejects` 收口为 `getOrganizations rejects`；保持第一条 `route getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: drop second legacy route reject title"` | 完成本轮 feature/work commit，得到真实提交 `a2ffc5c0235e28ffe53b7e60e5d4597c3c405def`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-142` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-143`：评估在再次变为 `route getIssue rejects` / `getOrganizations rejects` 的非对称 route wording 后，第一条是否仍需保留 route 级语义词。 |

### 261.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第一条已维持 `route getIssue rejects` 后，第二条 `route getOrganizations rejects` 已无须继续保留最小 route 级语义词来维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题收口为 `getOrganizations rejects`，同时保持第一条 `route getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-142` -> `done`，下一轮转入 `IMP-143`，继续评估第一条 route 级 API 失败场景标题在再次变为非对称 route wording 后是否仍需保留最小 route 级语义词。

### 261.3 经验沉淀

- 当第一条 route 级 API 失败标题已维持 `route getIssue rejects` 时，应单独复核第二条是否仍需保留最小 route 级语义词来维持与 helper seam wording 的层级区分，而不要默认两条 route 标题必须长期对称保留该前缀。
- 纯测试标题收口仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 261.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-142 → IMP-143` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `a7e369bc7cc06b468c191277798dbc48af04193e` |
| feature commit | `a2ffc5c0235e28ffe53b7e60e5d4597c3c405def` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 260 — 2026-04-21：评估并补回第一条 legacy route API 失败标题中的 route 级语义词

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-141`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `getIssue rejects` / `route getOrganizations rejects` 后，第一条是否仍需恢复最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 260.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与 task-board 均指向 Implementation lane 的 `IMP-141`，工作树干净，可按本轮唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第一条 API 失败场景标题从 `getIssue rejects` 补回为 `route getIssue rejects`；保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore first legacy route reject title"` | 完成本轮 feature/work commit，得到真实提交 `a7e369bc7cc06b468c191277798dbc48af04193e`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-141` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-142`：评估在再次同时恢复为 `route getIssue rejects` / `route getOrganizations rejects` 后，第二条是否仍需保留 route 级语义词。 |

### 260.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第二条已维持 `route getOrganizations rejects` 后，第一条 `getIssue rejects` 若继续不带 route 级语义词，会与 helper 级 lookup 标题层级过于接近。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题补回为 `route getIssue rejects`，同时保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-141` -> `done`，下一轮转入 `IMP-142`，继续评估第二条 route 级 API 失败场景标题在再次同时恢复 route wording 后是否仍需保留最小 route 级语义词。

### 260.3 经验沉淀

- 当第二条 route 级 API 失败标题已维持 `route getOrganizations rejects` 时，应单独复核第一条是否需要恢复最小 route 级语义词来维持与 helper seam wording 的层级区分，而不要因上一轮曾收口过该前缀就默认继续省略。
- 纯测试标题补回仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 260.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-141 → IMP-142` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `adf3efeb09c24ba565d42fccf10ee51b89deb161` |
| feature commit | `a7e369bc7cc06b468c191277798dbc48af04193e` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 276 — 2026-04-21：评估并补回第二条 legacy route API 失败标题中的 route 级语义词

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-160`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `getIssue rejects` / `getOrganizations rejects` 后，第二条是否仍需恢复最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 276.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与 task-board 均指向 Implementation lane 的 `IMP-160`，工作树初始干净，可按唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第二条 API 失败场景标题从 `getOrganizations rejects` 补回为 `route getOrganizations rejects`；保持第一条 `getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore second legacy route reject title"` | 完成本轮 feature/work commit，得到真实提交 `74b6850bd9782f3717803afb1769a9bde8e9497e`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-160` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-161`：评估在再次变为 `getIssue rejects` / `route getOrganizations rejects` 的非对称 route wording 后，第一条是否需要恢复 route 级语义词。 |

### 276.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第一条已维持 `getIssue rejects` 后，第二条 `getOrganizations rejects` 若继续不带 route 级语义词，会与 helper 级 lookup 标题层级过于接近。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题补回为 `route getOrganizations rejects`，同时保持第一条 `getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-160` -> `done`，下一轮转入 `IMP-161`，继续评估第一条 route 级 API 失败场景标题在再次变为非对称 route wording 后是否需要恢复最小 route 级语义词。

### 276.3 经验沉淀

- 当第一条 route 级 API 失败标题已维持 `getIssue rejects` 时，应单独复核第二条是否仍需恢复最小 route 级语义词来维持与 helper seam wording 的层级区分，而不要默认两条 route 标题可以长期同时省略该前缀。
- 纯测试标题补回仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 276.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-160 → IMP-161` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `7185f63f64870451d6325dc12157acc3df311878` |
| feature commit | `74b6850bd9782f3717803afb1769a9bde8e9497e` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 259 — 2026-04-21：评估并补回第二条 legacy route API 失败标题中的 route 级语义词

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-140`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `getIssue rejects` / `getOrganizations rejects` 后，第二条是否仍需恢复最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 259.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`；状态文件与 task-board 均指向 Implementation lane 的 `IMP-140`，工作树仅包含本轮 `frontend/src/lib/routes.test.tsx` 最小改动，可按唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第二条 API 失败场景标题从 `getOrganizations rejects` 补回为 `route getOrganizations rejects`；保持第一条 `getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore second legacy route reject title"` | 完成本轮 feature/work commit，得到真实提交 `e6436cb73be8f8aebd9340427128da4fc750c7ea`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-140` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-141`：评估在再次变为 `getIssue rejects` / `route getOrganizations rejects` 的非对称 route wording 后，第一条是否仍需恢复 route 级语义词。 |

### 259.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第一条已维持 `getIssue rejects` 后，第二条 `getOrganizations rejects` 若继续不带 route 级语义词，会与 helper 级 lookup 标题层级过于接近。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题补回为 `route getOrganizations rejects`，同时保持第一条 `getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-140` -> `done`，下一轮转入 `IMP-141`，继续评估第一条 route 级 API 失败场景标题在再次变为非对称 route wording 后是否仍需恢复最小 route 级语义词。

### 259.3 经验沉淀

- 当第一条 route 级 API 失败标题已维持 `getIssue rejects` 时，应单独复核第二条是否仍需恢复最小 route 级语义词来维持与 helper seam wording 的层级区分，而不要默认两条 route 标题可以长期同时省略该前缀。
- 纯测试标题补回仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 259.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-140 → IMP-141` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `0186436b98d475718e179d3640ddac1aace32a6b` |
| feature commit | `e6436cb73be8f8aebd9340427128da4fc750c7ea` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 256 — 2026-04-21：评估并补回第一条 legacy route API 失败标题中的 route 级语义词（再次补回）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-137`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `getIssue rejects` / `route getOrganizations rejects` 后，第一条是否需要恢复最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 256.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，工作树干净；Implementation lane 当前项为 `IMP-137`，可直接按本轮唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第一条 API 失败场景标题从 `getIssue rejects` 补回为 `route getIssue rejects`；保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore first legacy route reject title again"` | 完成本轮 feature/work commit，得到真实提交 `38d0a1ca592ee09074c8627607262efcfdbe66bb`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-137` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-138`：评估在再次同时恢复为 `route getIssue rejects` / `route getOrganizations rejects` 后，第二条是否仍需保留 route 级语义词。 |

### 256.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第二条已维持 `route getOrganizations rejects` 后，第一条 `getIssue rejects` 若继续不带 route 级语义词，会与 helper 级 lookup 标题层级过于接近。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题补回为 `route getIssue rejects`，同时保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-137` -> `done`，下一轮转入 `IMP-138`，继续评估第二条 route 级 API 失败场景标题在再次同时恢复 route wording 后是否仍需保留最小 route 级语义词。

### 256.3 经验沉淀

- 当第二条 route 级 API 失败标题已维持 `route getOrganizations rejects` 时，应单独复核第一条是否需要恢复最小 route 级语义词来维持与 helper seam wording 的层级区分，而不要因上一轮曾收口过该前缀就默认继续省略。
- 纯测试标题补回仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 256.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-137 → IMP-138` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `a426174564efc1fe557f628bd36ac1793bcddd4f` |
| feature commit | `38d0a1ca592ee09074c8627607262efcfdbe66bb` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 255 — 2026-04-21：评估并补回第二条 legacy route API 失败标题中的 route 级语义词（再次补回）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-136`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `getIssue rejects` / `getOrganizations rejects` 后，第二条是否仍需恢复最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 255.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，工作树干净；Implementation lane 当前项为 `IMP-136`，可直接按本轮唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第二条 API 失败场景标题从 `getOrganizations rejects` 补回为 `route getOrganizations rejects`；保持第一条 `getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` + 独立 reviewer subagent | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore second legacy route reject title again"` | 完成本轮 feature/work commit，得到真实提交 `a426174564efc1fe557f628bd36ac1793bcddd4f`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-136` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-137`：评估在再次变为 `getIssue rejects` / `route getOrganizations rejects` 的非对称 route wording 后，第一条是否需要恢复 route 级语义词。 |

### 255.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第一条已维持 `getIssue rejects` 后，第二条 `getOrganizations rejects` 若继续不带 route 级语义词，会与 helper 级 lookup 标题层级过于接近。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题补回为 `route getOrganizations rejects`，同时保持第一条 `getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-136` -> `done`，下一轮转入 `IMP-137`，继续评估第一条 route 级 API 失败场景标题在再次变为非对称 route wording 后是否需要恢复最小 route 级语义词。

### 255.3 经验沉淀

- 当第一条 route 级 API 失败标题已维持 `getIssue rejects` 时，应单独复核第二条是否仍需恢复最小 route 级语义词来维持与 helper seam wording 的层级区分，而不要默认两条 route 标题可以长期同时省略该前缀。
- 纯测试标题补回仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 255.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-136 → IMP-137` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `fcdbfcbda8a3c7ddee778df2b823a9ca8e161cc3` |
| feature commit | `a426174564efc1fe557f628bd36ac1793bcddd4f` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 254 — 2026-04-21：评估并收口第一条 legacy route API 失败标题中的 route 级语义词（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-135`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `route getIssue rejects` / `getOrganizations rejects` 后，第一条是否仍需保留最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 254.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，工作树干净；Implementation lane 当前项为 `IMP-135`，可直接按本轮唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第一条 API 失败场景标题从 `route getIssue rejects` 收口为 `getIssue rejects`；保持第二条 `getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` + 独立 reviewer subagent | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: drop first legacy route reject title again"` | 完成本轮 feature/work commit，得到真实提交 `fcdbfcbda8a3c7ddee778df2b823a9ca8e161cc3`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-135` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-136`：评估在再次同时收口为 `getIssue rejects` / `getOrganizations rejects` 后，第二条是否仍需恢复 route 级语义词。 |

### 254.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第二条已维持 `getOrganizations rejects` 后，第一条 `route getIssue rejects` 同样无须继续保留最小 route 级语义词来维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题收口为 `getIssue rejects`，同时保持第二条 `getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-135` -> `done`，下一轮转入 `IMP-136`，继续评估第二条 route 级 API 失败场景标题在再次同时收口为无 route wording 后是否仍需恢复最小 route 级语义词。

### 254.3 经验沉淀

- 当第二条 route 级 API 失败标题已维持 `getOrganizations rejects` 时，应单独复核第一条是否仍需保留最小 route 级语义词，而不要因上一轮保留过该前缀就默认继续沿用。
- 纯测试标题收口仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 254.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-135 → IMP-136` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `d31dd505cb4f44918a269651145c2689d0b514ff` |
| feature commit | `fcdbfcbda8a3c7ddee778df2b823a9ca8e161cc3` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 253 — 2026-04-21：评估并收口第二条 legacy route API 失败标题中的 route 级语义词（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-134`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `route getIssue rejects` / `route getOrganizations rejects` 后，第二条是否仍需保留最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 253.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，工作树干净；Implementation lane 当前项为 `IMP-134`，可直接按本轮唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第二条 API 失败场景标题从 `route getOrganizations rejects` 收口为 `getOrganizations rejects`；保持第一条 `route getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` + 独立 reviewer subagent | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: drop second legacy route reject title again"` | 完成本轮 feature/work commit，得到真实提交 `d31dd505cb4f44918a269651145c2689d0b514ff`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-134` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-135`：评估在再次变为 `route getIssue rejects` / `getOrganizations rejects` 的非对称 route wording 后，第一条是否仍需保留 route 级语义词。 |

### 253.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第一条已维持 `route getIssue rejects` 后，第二条 `route getOrganizations rejects` 已无须继续保留最小 route 级语义词来维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题收口为 `getOrganizations rejects`，同时保持第一条 `route getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-134` -> `done`，下一轮转入 `IMP-135`，继续评估第一条 route 级 API 失败场景标题在再次变为非对称 route wording 后是否仍需保留最小 route 级语义词。

### 253.3 经验沉淀

- 当第一条 route 级 API 失败标题已维持 `route getIssue rejects` 时，应单独复核第二条是否仍需保留最小 route 级语义词来维持与 helper seam wording 的层级区分，而不要默认两条 route 标题需要长期保持对称前缀。
- 纯测试标题收口仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 253.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-134 → IMP-135` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `1507d1cc7271dcab0dd7dda1884732723352627e` |
| feature commit | `d31dd505cb4f44918a269651145c2689d0b514ff` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 252 — 2026-04-20：评估并补回第一条 legacy route API 失败标题中的 route 级语义词（再次补回）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-133`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `getIssue rejects` / `route getOrganizations rejects` 后，第一条是否需要恢复最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 252.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，当前工作树仅有 `frontend/src/lib/routes.test.tsx` 的本轮实现改动；Implementation lane 当前项为 `IMP-133`，可直接按本轮唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第一条 API 失败场景标题从 `getIssue rejects` 补回为 `route getIssue rejects`；保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` + 独立 reviewer subagent | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore first legacy route reject title again"` | 完成本轮 feature/work commit，得到真实提交 `5ba6d0f0d57e68af35bef8138e2f0b07e29456a8`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-133` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-134`：评估在再次同时恢复为 `route getIssue rejects` / `route getOrganizations rejects` 后，第二条是否仍需保留 route 级语义词。 |

### 252.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第二条已维持 `route getOrganizations rejects` 后，第一条 `getIssue rejects` 若继续不带 route 级语义词，会与 helper 级 lookup 标题层级过于接近。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题补回为 `route getIssue rejects`，同时保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-133` -> `done`，下一轮转入 `IMP-134`，继续评估第二条 route 级 API 失败场景标题在再次同时恢复 route wording 后是否仍需保留最小 route 级语义词。

### 252.3 经验沉淀

- 当第二条 route 级 API 失败标题已维持 `route getOrganizations rejects` 时，应单独复核第一条是否需要恢复最小 route 级语义词来维持与 helper seam wording 的层级区分，而不要因上一轮曾收口过该前缀就默认继续省略。
- 纯测试标题补回仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 252.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-133 → IMP-134` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `c67bc7f7d3324ba7a7a7de0fb57bec7f3adc85d8` |
| feature commit | `5ba6d0f0d57e68af35bef8138e2f0b07e29456a8` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 251 — 2026-04-20：评估并补回第二条 legacy route API 失败标题中的 route 级语义词（再次补回）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-132`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `getIssue rejects` / `getOrganizations rejects` 后，第二条是否仍需恢复最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 251.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，工作树干净；Implementation lane 当前项为 `IMP-132`，可直接按本轮唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第二条 API 失败场景标题从 `getOrganizations rejects` 补回为 `route getOrganizations rejects`；保持第一条 `getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` + 独立 reviewer subagent | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore second legacy route reject title again"` | 完成本轮 feature/work commit，得到真实提交 `85328ce69f946ef9ea11d2510617fc679ecb9f34`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-132` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-133`：评估在再次变为 `getIssue rejects` / `route getOrganizations rejects` 的非对称 route wording 后，第一条是否需要恢复 route 级语义词。 |

### 251.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第一条已维持 `getIssue rejects` 后，第二条 `getOrganizations rejects` 若继续不带 route 级语义词，会与 helper 级 lookup 标题层级过于接近。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题补回为 `route getOrganizations rejects`，同时保持第一条 `getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-132` -> `done`，下一轮转入 `IMP-133`，继续评估第一条 route 级 API 失败场景标题在再次变为非对称 route wording 后是否需要恢复最小 route 级语义词。

### 251.3 经验沉淀

- 当第一条 route 级 API 失败标题已维持 `getIssue rejects` 时，应单独复核第二条是否仍需恢复最小 route 级语义词来维持与 helper seam wording 的层级区分，而不要默认两条 route 标题可以同时继续省略前缀。
- 纯测试标题补回仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 251.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-132 → IMP-133` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `529049ada42fc23fff4aa920ef209f7cdfdef0a5` |
| feature commit | `85328ce69f946ef9ea11d2510617fc679ecb9f34` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 248 — 2026-04-20：评估并补回第一条 legacy route API 失败标题中的 route 级语义词（再次补回）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-129`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `getIssue rejects` / `route getOrganizations rejects` 后，第一条是否需要恢复最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 248.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，工作树干净；Implementation lane 当前项为 `IMP-129`，可直接按本轮唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第一条 API 失败场景标题从 `getIssue rejects` 补回为 `route getIssue rejects`；保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` + 独立 reviewer subagent | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore first legacy route reject title again"` | 完成本轮 feature/work commit，得到真实提交 `841542f1c4bc754e233187ab2bd3883d85f16254`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-129` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-130`：评估在再次同时恢复为 `route getIssue rejects` / `route getOrganizations rejects` 后，第二条是否仍需保留 route 级语义词。 |

### 248.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第二条已维持 `route getOrganizations rejects` 后，第一条 `getIssue rejects` 若继续不带 route 级语义词，会与 helper 级 lookup 标题层级过于接近。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题补回为 `route getIssue rejects`，同时保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-129` -> `done`，下一轮转入 `IMP-130`，继续评估第二条 route 级 API 失败场景标题在再次同时恢复 route wording 后是否仍需保留最小 route 级语义词。

### 248.3 经验沉淀

- 当第二条 route 级 API 失败标题已维持 `route getOrganizations rejects` 时，应单独复核第一条是否需要恢复最小 route 级语义词来维持与 helper seam wording 的层级区分，而不要因上一轮曾收口过该前缀就默认继续省略。
- 纯测试标题补回仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 248.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-129 → IMP-130` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `244707d46ad421853a9eed590a617db0464923e6` |
| feature commit | `841542f1c4bc754e233187ab2bd3883d85f16254` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 247 — 2026-04-20：评估并补回第二条 legacy route API 失败标题中的 route 级语义词（再次补回）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-128`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `getIssue rejects` / `getOrganizations rejects` 后，第二条是否仍需恢复最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 247.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，工作树干净；Implementation lane 当前项为 `IMP-128`，可直接按本轮唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第二条 API 失败场景标题从 `getOrganizations rejects` 补回为 `route getOrganizations rejects`；保持第一条 `getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` + 独立 reviewer subagent | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore second legacy route reject title again"` | 完成本轮 feature/work commit，得到真实提交 `272899da43d7341b9adca2a45f15663f0bcbaf4c`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-128` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-129`：评估在再次变为 `getIssue rejects` / `route getOrganizations rejects` 的非对称 route wording 后，第一条是否需要恢复 route 级语义词。 |

### 247.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第一条已维持 `getIssue rejects` 后，第二条 `getOrganizations rejects` 若继续不带 route 级语义词，会与 helper 级 lookup 标题层级过于接近。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题补回为 `route getOrganizations rejects`，同时保持第一条 `getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-128` -> `done`，下一轮转入 `IMP-129`，继续评估第一条 route 级 API 失败场景标题在再次变为非对称 route wording 后是否需要恢复最小 route 级语义词。

### 247.3 经验沉淀

- 当第一条 route 级 API 失败标题已维持 `getIssue rejects` 时，应单独复核第二条是否仍需恢复最小 route 级语义词来维持与 helper seam wording 的层级区分，而不要默认两条 route 标题可以同时继续省略前缀。
- 纯测试标题补回仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 247.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-128 → IMP-129` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `58505c41dafe941ff22b67e31bc067a685824fd4` |
| feature commit | `272899da43d7341b9adca2a45f15663f0bcbaf4c` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 246 — 2026-04-20：评估并收口第一条 legacy route API 失败标题中的 route 级语义词（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-127`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `route getIssue rejects` / `getOrganizations rejects` 后，第一条是否仍需保留最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 246.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，工作树干净；Implementation lane 当前项为 `IMP-127`，可直接按本轮唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第一条 API 失败场景标题从 `route getIssue rejects` 收口为 `getIssue rejects`；保持第二条 `getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` + 独立 reviewer subagent | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: drop first legacy route reject title again"` | 完成本轮 feature/work commit，得到真实提交 `c1a81823d90fb96fa48df1ae4c7ebc84264394a1`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-127` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-128`：评估在再次同时收口为 `getIssue rejects` / `getOrganizations rejects` 后，第二条是否仍需恢复 route 级语义词。 |

### 246.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第二条已维持 `getOrganizations rejects` 后，第一条 `route getIssue rejects` 同样无须继续保留最小 route 级语义词来维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题收口为 `getIssue rejects`，同时保持第二条 `getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-127` -> `done`，下一轮转入 `IMP-128`，继续评估第二条 route 级 API 失败场景标题在再次同时收口为无 route wording 后是否仍需恢复最小 route 级语义词。

### 246.3 经验沉淀

- 当第二条 route 级 API 失败标题已维持 `getOrganizations rejects` 时，应单独复核第一条是否仍需保留最小 route 级语义词，而不要因上一轮保留过该前缀就默认继续沿用。
- 纯测试标题收口仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 246.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-127 → IMP-128` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `792c9ef5e31d6a531fb720dd8041d2d0f1758d28` |
| feature commit | `c1a81823d90fb96fa48df1ae4c7ebc84264394a1` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 245 — 2026-04-20：评估并收口第二条 legacy route API 失败标题中的 route 级语义词（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-126`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `route getIssue rejects` / `route getOrganizations rejects` 后，第二条是否仍需保留最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 245.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，工作树干净；Implementation lane 当前项为 `IMP-126`，可直接按本轮唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第二条 API 失败场景标题从 `route getOrganizations rejects` 收口为 `getOrganizations rejects`；保持第一条 `route getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` + 独立 reviewer subagent | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: drop second legacy route reject title again"` | 完成本轮 feature/work commit，得到真实提交 `792c9ef5e31d6a531fb720dd8041d2d0f1758d28`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-126` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-127`：评估在再次变为 `route getIssue rejects` / `getOrganizations rejects` 的非对称 route wording 后，第一条是否仍需保留 route 级语义词。 |

### 245.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第一条已维持 `route getIssue rejects` 后，第二条 `route getOrganizations rejects` 已无须继续保留最小 route 级语义词来维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题收口为 `getOrganizations rejects`，同时保持第一条 `route getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-126` -> `done`，下一轮转入 `IMP-127`，继续评估第一条 route 级 API 失败场景标题在再次变为非对称 route wording 后是否仍需保留最小 route 级语义词。

### 245.3 经验沉淀

- 当第一条 route 级 API 失败标题已维持 `route getIssue rejects` 时，应单独复核第二条是否仍需保留最小 route 级语义词来维持与 helper seam wording 的层级区分，而不要默认两条 route 标题需要长期保持对称前缀。
- 纯测试标题收口仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 245.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-126 → IMP-127` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `7bbb113aa1dc67ff17318a67281f5681f053db9f` |
| feature commit | `792c9ef5e31d6a531fb720dd8041d2d0f1758d28` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 244 — 2026-04-20：评估并补回第一条 legacy route API 失败标题中的 route 级语义词（再次补回）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-125`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `getIssue rejects` / `route getOrganizations rejects` 后，第一条是否需要恢复最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 244.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，工作树干净；Implementation lane 当前项为 `IMP-125`，可直接按本轮唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第一条 API 失败场景标题从 `getIssue rejects` 补回为 `route getIssue rejects`；保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` + 独立 reviewer subagent | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore first legacy route reject title again"` | 完成本轮 feature/work commit，得到真实提交 `7bbb113aa1dc67ff17318a67281f5681f053db9f`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-125` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-126`：评估在再次均带 `route getIssue rejects` / `route getOrganizations rejects` 的 route wording 后，第二条是否仍需保留 route 级语义词。 |

### 244.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第二条已维持 `route getOrganizations rejects` 后，第一条 `getIssue rejects` 若继续不带 route 级语义词，会与 helper 级 lookup 标题层级过于接近。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题补回为 `route getIssue rejects`，同时保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-125` -> `done`，下一轮转入 `IMP-126`，继续评估第二条 route 级 API 失败场景标题在再次均带 route wording 后是否仍需保留最小 route 级语义词。

### 244.3 经验沉淀

- 当第二条 route 级 API 失败标题已维持 `route getOrganizations rejects` 时，应单独复核第一条是否需要恢复最小 route 级语义词来维持与 helper seam wording 的层级区分，而不要默认首条标题可以继续省略前缀。
- 纯测试标题补回仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 244.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-125 → IMP-126` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `9d78d5415405d2f7193ab10c93555331ff6cd40a` |
| feature commit | `7bbb113aa1dc67ff17318a67281f5681f053db9f` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 243 — 2026-04-20：评估并补回第二条 legacy route API 失败标题中的 route 级语义词（再次补回）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-124`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `getIssue rejects` / `getOrganizations rejects` 后，第二条是否仍需恢复最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 243.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，工作树干净；Implementation lane 当前项为 `IMP-124`，可直接按本轮唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第二条 API 失败场景标题从 `getOrganizations rejects` 补回为 `route getOrganizations rejects`；保持第一条 `getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` + 独立 reviewer subagent | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore second legacy route reject title again"` | 完成本轮 feature/work commit，得到真实提交 `9d78d5415405d2f7193ab10c93555331ff6cd40a`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-124` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-125`：评估在再次变为 `getIssue rejects` / `route getOrganizations rejects` 的非对称 route wording 后，第一条是否需要恢复 route 级语义词。 |

### 243.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第一条已维持 `getIssue rejects` 后，第二条 `getOrganizations rejects` 若继续不带 route 级语义词，会与 helper 级 lookup 标题层级过于接近。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题补回为 `route getOrganizations rejects`，同时保持第一条 `getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-124` -> `done`，下一轮转入 `IMP-125`，继续评估第一条 route 级 API 失败场景标题在再次变为非对称 route wording 后是否需要恢复最小 route 级语义词。

### 243.3 经验沉淀

- 当第一条 route 级 API 失败标题已维持 `getIssue rejects` 时，应单独复核第二条是否仍需恢复最小 route 级语义词来维持与 helper seam wording 的层级区分，而不要默认两条 route 标题可以同时继续省略前缀。
- 纯测试标题补回仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 243.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-124 → IMP-125` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `010af594ff8913cb08dff06d4510d9fbc34e5497` |
| feature commit | `9d78d5415405d2f7193ab10c93555331ff6cd40a` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 242 — 2026-04-20：评估并收口第一条 legacy route API 失败标题中的 route 级语义词（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-123`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `route getIssue rejects` / `getOrganizations rejects` 后，第一条是否仍需保留最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 242.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，工作树干净；Implementation lane 当前项为 `IMP-123`，可直接按本轮唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第一条 API 失败场景标题从 `route getIssue rejects` 收口为 `getIssue rejects`；保持第二条 `getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` + 独立 reviewer subagent | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: drop first legacy route reject title again"` | 完成本轮 feature/work commit，得到真实提交 `010af594ff8913cb08dff06d4510d9fbc34e5497`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-123` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-124`：评估在再次同时收口为 `getIssue rejects` / `getOrganizations rejects` 后，第二条是否仍需恢复 route 级语义词。 |

### 242.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第二条已维持 `getOrganizations rejects` 后，第一条 `route getIssue rejects` 同样无须继续保留最小 route 级语义词来维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题收口为 `getIssue rejects`，同时保持第二条 `getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-123` -> `done`，下一轮转入 `IMP-124`，继续评估第二条 route 级 API 失败场景标题在再次同时收口为无 route wording 后是否仍需恢复最小 route 级语义词。

### 242.3 经验沉淀

- 当第二条 route 级 API 失败标题已维持 `getOrganizations rejects` 时，应单独复核第一条是否仍需保留最小 route 级语义词，而不要因上一轮保留过该前缀就默认继续沿用。
- 纯测试标题收口仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 242.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-123 → IMP-124` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `5f7a0d5107bd4f4b5c1f94f4ece7ba08a2698ee1` |
| feature commit | `010af594ff8913cb08dff06d4510d9fbc34e5497` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 241 — 2026-04-20：评估并收口第二条 legacy route API 失败标题中的 route 级语义词（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-122`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前再次均带 `route getIssue rejects` / `route getOrganizations rejects` 后，第二条是否仍需保留最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 241.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，工作树仅包含 `frontend/src/lib/routes.test.tsx` 的本轮最小 execution unit 改动；Implementation lane 当前项为 `IMP-122`，可直接按本轮唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第二条 API 失败场景标题从 `route getOrganizations rejects` 收口为 `getOrganizations rejects`；保持第一条 `route getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` + 独立 reviewer subagent | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: drop second legacy route reject title again"` | 完成本轮 feature/work commit，得到真实提交 `86426360c9a21bf6acf365cd153940da6d76127a`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-122` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-123`：评估在再次变为 `route getIssue rejects` / `getOrganizations rejects` 的非对称 route wording 后，第一条是否仍需保留 route 级语义词。 |

### 241.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第一条已维持 `route getIssue rejects` 后，第二条 `route getOrganizations rejects` 已无须继续保留最小 route 级语义词来维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题收口为 `getOrganizations rejects`，同时保持第一条 `route getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-122` -> `done`，下一轮转入 `IMP-123`，继续评估第一条 route 级 API 失败场景标题在再次变为非对称 route wording 后是否仍需保留最小 route 级语义词。

### 241.3 经验沉淀

- 当第一条 route 级 API 失败标题已维持 `route getIssue rejects` 时，应单独复核第二条是否仍需保留最小 route 级语义词来维持与 helper seam wording 的层级区分，而不要默认两条 route 标题需要持续对称保留前缀。
- 纯测试标题收口仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 241.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-122 → IMP-123` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `0396bdcd769586ba13dd2231708ceb344c4dc902` |
| feature commit | `86426360c9a21bf6acf365cd153940da6d76127a` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 240 — 2026-04-20：评估并补回第一条 legacy route API 失败标题中的 route 级语义词（再次补回）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-121`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `getIssue rejects` / `route getOrganizations rejects` 后，第一条是否仍需恢复最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 240.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，工作树干净，可直接按本轮唯一 execution unit 推进；Implementation lane 当前项为 `IMP-121`。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第一条 API 失败场景标题从 `getIssue rejects` 补回为 `route getIssue rejects`；保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` + 独立 reviewer subagent | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore first legacy route reject title again"` | 完成本轮 feature/work commit，得到真实提交 `47f9d96a7eacd9b6cf68469f78d85031f9467a8d`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-121` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-122`：评估在再次均带 `route getIssue rejects` / `route getOrganizations rejects` 后，第二条是否仍需保留 route 级语义词。 |

### 240.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第二条已维持 `route getOrganizations rejects` 后，第一条 `getIssue rejects` 若继续不带 route 级语义词，会与 helper 级 lookup 标题层级过于接近。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题补回为 `route getIssue rejects`，同时保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-121` -> `done`，下一轮转入 `IMP-122`，继续评估第二条 route 级 API 失败场景标题在再次均带 route wording 后是否仍需保留最小 route 级语义词。

### 240.3 经验沉淀

- 当第二条 route 级 API 失败标题已维持 `route getOrganizations rejects` 时，应单独复核第一条是否仍需恢复最小 route 级语义词，而不要因上一轮收口过该前缀就默认继续省略。
- 纯测试标题补回同样应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 240.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-121 → IMP-122` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `c020d7a4a8e872d147b6480f1c562ca2f80d27e5` |
| feature commit | `47f9d96a7eacd9b6cf68469f78d85031f9467a8d` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 239 — 2026-04-20：评估并收口第二条 legacy route API 失败标题中的 route 级语义词（再次补回）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-120`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `getIssue rejects` / `getOrganizations rejects` 后，第二条是否仍需恢复最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 239.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，工作树干净，可直接按本轮唯一 execution unit 推进；Implementation lane 当前项为 `IMP-120`。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第二条 API 失败场景标题从 `getOrganizations rejects` 补回为 `route getOrganizations rejects`；保持第一条 `getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` + 独立 reviewer subagent | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore second legacy route reject title again"` | 完成本轮 feature/work commit，得到真实提交 `f5bf9b3eaf599a1ecc12e3722999feee02a2b3d3`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-120` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-121`：评估在再次变为 `getIssue rejects` / `route getOrganizations rejects` 的非对称 route wording 后，第一条是否需要恢复 route 级语义词。 |

### 239.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第一条已维持 `getIssue rejects` 后，第二条 `getOrganizations rejects` 若继续不带 route 级语义词，会与 helper 级 lookup 标题层级过于接近。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题补回为 `route getOrganizations rejects`，同时保持第一条 `getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-120` -> `done`，下一轮转入 `IMP-121`，继续评估第一条 route 级 API 失败场景标题在再次变为非对称 route wording 后是否需要恢复最小 route 级语义词。

### 239.3 经验沉淀

- 当第一条 route 级 API 失败标题已维持 `getIssue rejects` 时，应单独复核第二条是否需要恢复最小 route 级语义词，而不要因上一轮收口过该前缀就默认继续省略。
- 纯测试标题补回同样应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 239.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-120 → IMP-121` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `c831701e2326359015b7849a14e2ce8889bd7b57` |
| feature commit | `f5bf9b3eaf599a1ecc12e3722999feee02a2b3d3` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 238 — 2026-04-20：评估并收口第一条 legacy route API 失败标题中的 route 级语义词（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-119`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `route getIssue rejects` / `getOrganizations rejects` 后，第一条是否仍需保留最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 238.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，工作树仅包含 `frontend/src/lib/routes.test.tsx` 的本轮最小 execution unit 改动；Implementation lane 当前项为 `IMP-119`，可直接按本轮唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第一条 API 失败场景标题从 `route getIssue rejects` 收口为 `getIssue rejects`；保持第二条 `getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` + 独立 reviewer subagent | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: drop first legacy route reject title again"` | 完成本轮 feature/work commit，得到真实提交 `d430e5aa3f39a03627922bbe8d9a7b63ded03c64`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-119` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-120`：评估在再次同时收口为 `getIssue rejects` / `getOrganizations rejects` 后，第二条是否仍需恢复 route 级语义词。 |

### 238.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第二条已维持 `getOrganizations rejects` 后，第一条 `route getIssue rejects` 同样无须继续保留最小 route 级语义词来维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题收口为 `getIssue rejects`，同时保持第二条 `getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-119` -> `done`，下一轮转入 `IMP-120`，继续评估第二条 route 级 API 失败场景标题在再次同时收口为无 route wording 后是否仍需恢复最小 route 级语义词。

### 238.3 经验沉淀

- 当第二条 route 级 API 失败标题已维持 `getOrganizations rejects` 时，应单独复核第一条是否仍需保留最小 route 级语义词，而不要因上一轮保留过该前缀就默认继续沿用。
- 纯测试标题收口仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 238.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-119 → IMP-120` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `88e5e992ccf59c10a424ad7a6a9661c301a565fa` |
| feature commit | `d430e5aa3f39a03627922bbe8d9a7b63ded03c64` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 237 — 2026-04-20：评估并收口第二条 legacy route API 失败标题中的 route 级语义词（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-118`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前再次均带 `route getIssue rejects` / `route getOrganizations rejects` 后，第二条是否仍需保留最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 237.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，工作树干净；Implementation lane 当前项为 `IMP-118`，可直接按本轮唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第二条 API 失败场景标题从 `route getOrganizations rejects` 收口为 `getOrganizations rejects`；保持第一条 `route getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` + 独立 reviewer subagent | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: drop second legacy route reject title again"` | 完成本轮 feature/work commit，得到真实提交 `c8ed42bd6384d6b18d45a31744a7f3ae0e2b490a`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-118` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-119`：评估在再次变为 `route getIssue rejects` / `getOrganizations rejects` 的非对称 route wording 后，第一条是否仍需保留 route 级语义词。 |

### 237.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第一条已维持 `route getIssue rejects` 后，第二条 `route getOrganizations rejects` 已无须继续保留最小 route 级语义词来维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题收口为 `getOrganizations rejects`，同时保持第一条 `route getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-118` -> `done`，下一轮转入 `IMP-119`，继续评估第一条 route 级 API 失败场景标题在再次变为非对称 route wording 后是否仍需保留最小 route 级语义词。

### 237.3 经验沉淀

- 当第一条 route 级 API 失败标题已维持 `route getIssue rejects` 时，应单独复核第二条是否仍需保留最小 route 级语义词来维持与 helper seam wording 的层级区分，而不要默认两条 route 标题需要持续对称保留前缀。
- 纯测试标题收口仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 237.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-118 → IMP-119` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `03fa8a697eaabcec50c7022aa5fd3e232d911239` |
| feature commit | `c8ed42bd6384d6b18d45a31744a7f3ae0e2b490a` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 236 — 2026-04-20：评估并补回第一条 legacy route API 失败标题中的 route 级语义词（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-117`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前变为 `getIssue rejects` / `route getOrganizations rejects` 后，第一条是否仍需恢复最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 236.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，工作树干净；Implementation lane 当前项为 `IMP-117`，可直接按本轮唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第一条 API 失败场景标题从 `getIssue rejects` 补回为 `route getIssue rejects`；保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` + 独立 reviewer subagent | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore first legacy route reject title again"` | 完成本轮 feature/work commit，得到真实提交 `77a88c4e92be9731cb1143e26264c71caa8fef81`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-117` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-118`：评估在再次均带 `route getIssue rejects` / `route getOrganizations rejects` 后，第二条是否仍需保留 route 级语义词。 |

### 236.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第二条已维持 `route getOrganizations rejects` 后，第一条 `getIssue rejects` 若继续不带 route 级语义词，会与 helper 级 lookup 标题层级过于接近。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题补回为 `route getIssue rejects`，同时保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-117` -> `done`，下一轮转入 `IMP-118`，继续评估第二条 route 级 API 失败场景标题在再次均带 route wording 后是否仍需保留 route 级语义词。

### 236.3 经验沉淀

- 当第二条 route 级 API 失败标题已维持 `route getOrganizations rejects` 时，应单独复核第一条是否仍需恢复最小 route 级语义词来维持与 helper seam wording 的层级区分，而不要默认两条 route 标题可以持续非对称收口。
- 纯测试标题补回仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 236.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-117 → IMP-118` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `9a8cf97b039b7cf5ffc4275dae2b29a235865da7` |
| feature commit | `77a88c4e92be9731cb1143e26264c71caa8fef81` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 235 — 2026-04-20：评估并补回第二条 legacy route API 失败标题中的 route 级语义词（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-116`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前再次同时收口为 `getIssue rejects` / `getOrganizations rejects` 后，第二条是否仍需恢复最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 235.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，工作树干净；Implementation lane 当前项为 `IMP-116`，可直接按本轮唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第二条 API 失败场景标题从 `getOrganizations rejects` 补回为 `route getOrganizations rejects`；保持第一条 `getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore second legacy route reject title again"` | 完成本轮 feature/work commit，得到真实提交 `9a8cf97b039b7cf5ffc4275dae2b29a235865da7`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-116` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-117`：评估在再次变为 `getIssue rejects` / `route getOrganizations rejects` 的非对称 route wording 后，第一条是否需要恢复 route 级语义词。 |

### 235.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第一条已维持 `getIssue rejects` 后，第二条 `getOrganizations rejects` 若继续不带 route 级语义词，会与 helper 级 lookup 标题层级过于接近。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题补回为 `route getOrganizations rejects`，同时保持第一条 `getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-116` -> `done`，下一轮转入 `IMP-117`，继续评估第一条 route 级 API 失败场景标题在再次变为非对称 route wording 后是否需要恢复最小 route 级语义词。

### 235.3 经验沉淀

- 当第一条 route 级 API 失败标题已维持 `getIssue rejects` 时，应单独复核第二条是否仍需恢复最小 route 级语义词来维持与 helper seam wording 的层级区分，而不要默认两条 route 标题可以持续同时省略前缀。
- 纯测试标题补回仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 235.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-116 → IMP-117` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `dbea78695eba7d786695f3dda0b11ad755f06d1a` |
| feature commit | `9a8cf97b039b7cf5ffc4275dae2b29a235865da7` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 234 — 2026-04-20：评估并收口第一条 legacy route API 失败标题中的 route 级语义词（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-115`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `route getIssue rejects` / `getOrganizations rejects` 后，第一条是否仍需保留最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 234.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，工作树干净；Implementation lane 当前项为 `IMP-115`，可直接按本轮唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第一条 API 失败场景标题从 `route getIssue rejects` 收口为 `getIssue rejects`；保持第二条 `getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: drop first legacy route reject title again"` | 完成本轮 feature/work commit，得到真实提交 `dbea78695eba7d786695f3dda0b11ad755f06d1a`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-115` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-116`：评估在再次同时收口为 `getIssue rejects` / `getOrganizations rejects` 后，第二条是否仍需恢复 route 级语义词。 |

### 234.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第二条已维持 `getOrganizations rejects` 后，第一条 `route getIssue rejects` 同样无须继续保留最小 route 级语义词来维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题收口为 `getIssue rejects`，同时保持第二条 `getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-115` -> `done`，下一轮转入 `IMP-116`，继续评估第二条 route 级 API 失败场景标题在再次同时收口为无 route wording 后是否仍需恢复最小 route 级语义词。

### 234.3 经验沉淀

- 当第二条 route 级 API 失败标题已维持 `getOrganizations rejects` 时，应单独复核第一条是否仍需保留最小 route 级语义词，而不要因上一轮保留过该前缀就默认继续沿用。
- 纯测试标题收口仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 234.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-115 → IMP-116` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `06eb17d4dc2f14e860014bc27182e8f45e930801` |
| feature commit | `dbea78695eba7d786695f3dda0b11ad755f06d1a` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 233 — 2026-04-20：评估并收口第二条 legacy route API 失败标题中的 route 级语义词（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-114`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `route getIssue rejects` / `route getOrganizations rejects` 后，第二条是否仍需保留最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 233.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，工作树仅包含 `frontend/src/lib/routes.test.tsx` 的本轮最小 execution unit 改动；Implementation lane 当前项为 `IMP-114`，可直接按本轮唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第二条 API 失败场景标题从 `route getOrganizations rejects` 收口为 `getOrganizations rejects`；保持第一条 `route getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: narrow second legacy route reject title again"` | 完成本轮 feature/work commit，得到真实提交 `06eb17d4dc2f14e860014bc27182e8f45e930801`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-114` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-115`：评估在再次变为 `route getIssue rejects` / `getOrganizations rejects` 的非对称 route wording 后，第一条是否仍需保留 route 级语义词。 |

### 233.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第一条已维持 `route getIssue rejects` 后，第二条 `route getOrganizations rejects` 已无须继续保留最小 route 级语义词来维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题收口为 `getOrganizations rejects`，同时保持第一条 `route getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-114` -> `done`，下一轮转入 `IMP-115`，继续评估第一条 route 级 API 失败场景标题在再次变为非对称 route wording 后是否仍需保留最小 route 级语义词。

### 233.3 经验沉淀

- 当第一条 route 级 API 失败标题已维持 `route getIssue rejects` 时，应单独复核第二条是否仍需保留 route 级语义词，而不要默认两条 route 标题必须持续对称保留前缀。
- 纯测试标题收口仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 233.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-114 → IMP-115` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `3251bba6cf4c67050e94fe4991ea3f48f42e25d6` |
| feature commit | `06eb17d4dc2f14e860014bc27182e8f45e930801` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 232 — 2026-04-20：评估并补回第一条 legacy route API 失败标题中的 route 级语义词（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-113`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前变为 `getIssue rejects` / `route getOrganizations rejects` 后，第一条是否仍需恢复最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 232.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，工作树仅包含 `frontend/src/lib/routes.test.tsx` 与同 lane docs/state closeout 变更；Implementation lane 当前项为 `IMP-113`，可按本轮唯一 execution unit 继续闭环。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第一条 API 失败场景标题从 `getIssue rejects` 补回为 `route getIssue rejects`；保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore first legacy route reject title again"` | 完成本轮 feature/work commit，得到真实提交 `780492ecf2012c01f8240a8209806a2c56c7fa73`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-113` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-114`：评估在再次均带 `route getIssue rejects` / `route getOrganizations rejects` 后，第二条是否仍需保留 route 级语义词。 |

### 232.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第二条已维持 `route getOrganizations rejects` 后，第一条 `getIssue rejects` 仍需要恢复最小 route 级语义词来维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题补回为 `route getIssue rejects`，同时保持第二条 `route getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-113` -> `done`，下一轮转入 `IMP-114`，继续评估第二条 route 级 API 失败场景标题在再次均带 route wording 后是否仍需保留 route 级语义词。

### 232.3 经验沉淀

- 当第二条 route 级 API 失败标题已维持 `route getOrganizations rejects` 时，应单独复核第一条是否仍需恢复最小 route 级语义词来维持与 helper seam wording 的层级区分，而不要默认两条 route 标题可以持续非对称收口。
- 纯测试标题补回仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 232.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-113 → IMP-114` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `ca4e567db7bdf97f72ac11413b9de68f1a7c5dbf` |
| feature commit | `780492ecf2012c01f8240a8209806a2c56c7fa73` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 231 — 2026-04-20：评估并补回第二条 legacy route API 失败标题中的 route 级语义词（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-112`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前再次同时收口为 `getIssue rejects` / `getOrganizations rejects` 后，第二条是否仍需恢复最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 231.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，工作树仅包含 `frontend/src/lib/routes.test.tsx` 的本轮最小 execution unit 改动；Implementation lane 当前项为 `IMP-112`，可按上轮同 lane 已落盘修改继续闭环。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第二条 API 失败场景标题从 `getOrganizations rejects` 补回为 `route getOrganizations rejects`；保持第一条 `getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: restore second legacy route reject title again"` | 完成本轮 feature/work commit，得到真实提交 `ca4e567db7bdf97f72ac11413b9de68f1a7c5dbf`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-112` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-113`：评估在再次变为 `getIssue rejects` / `route getOrganizations rejects` 的非对称 route wording 后，第一条是否需要恢复 route 级语义词。 |

### 231.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第一条已维持 `getIssue rejects` 后，第二条 `getOrganizations rejects` 若继续不带 route 级语义词，会与 helper 级 lookup 标题层级过于接近。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题补回为 `route getOrganizations rejects`，同时保持第一条 `getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-112` -> `done`，下一轮转入 `IMP-113`，继续评估第一条 route 级 API 失败场景标题在再次变为非对称 route wording 后是否需要恢复最小 route 级语义词。

### 231.3 经验沉淀

- 当第一条 route 级 API 失败标题已维持 `getIssue rejects` 时，应单独复核第二条是否仍需恢复最小 route 级语义词来维持与 helper seam wording 的层级区分，而不要默认两条 route 标题可以持续同时省略前缀。
- 纯测试标题补回仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 231.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-112 → IMP-113` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `123b80c53c42b6dfa59b48d047e4b6e2ebe85399` |
| feature commit | `ca4e567db7bdf97f72ac11413b9de68f1a7c5dbf` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 230 — 2026-04-20：评估并收口第一条 legacy route API 失败标题中的 route 级语义词（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-111`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `route getIssue rejects` / `getOrganizations rejects` 后，第一条是否仍需保留最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

**完成情况**
- 将 `frontend/src/lib/routes.test.tsx` 中第一条 legacy `/issues/[id]` route API 失败场景测试标题从 `route getIssue rejects` 收口为 `getIssue rejects`，保持第二条 `getOrganizations rejects`、共享断言 helper、fixture 与 helper/route 运行时逻辑不变。
- 完成定向验证：`cd frontend && pnpm test -- --run src/lib/routes.test.tsx`、`cd frontend && npx tsc --noEmit`、`git diff --check` 均通过。
- 完成独立 review，确认改动仅收口测试标题 wording，不扩大实现面，也未引入新的 helper/route 语义漂移。
- 已提交 feature commit `d6bcef1d5f0464e8a0d33aa920638b49407eec17`（`[verified] test: drop first legacy route reject title again`）；docs/state 已推进为 `last_completed_task=IMP-111`、`current_task=IMP-112`，待本轮 docs/state commit 与 push 收口。

**证据 / 验证**
- `frontend/src/lib/routes.test.tsx`
- `docs/status/roadmap-state.yaml`
- `docs/linear-parity/task-board.md`
- `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` ✅
- `cd frontend && npx tsc --noEmit` ✅
- `git diff --check` ✅

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

## Session 288 — 2026-04-21：评估并恢复第一条 legacy route API 失败标题中的 route 级语义词

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-171`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `getIssue rejects` / `getOrganizations rejects` 的再次双无 route wording 组合时，第一条是否需要恢复 route 级语义词；若需要，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 288.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，Implementation lane 当前项为 `IMP-171`，且工作树干净，可支持新的单文件最小 execution unit |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('getIssue rejects', async () => {` 恢复为 `it('route getIssue rejects', async () => {`；不改第二条 `getOrganizations rejects` 标题，也不改共享断言、fixture 设置或 helper/route 运行时逻辑 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && ./node_modules/.bin/tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过 |
| 提交 | `git commit -m "[verified] test: restore route wording for issue detail rejection"` | 完成本轮 feature/work commit，得到真实提交 `edbfc4b425ec21f6af4852a0719ebee604395596` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `docs/worktime.md` | 将 `IMP-171` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-172`：评估第二条 API 失败场景标题在当前恢复第一条 route wording 后是否需要恢复 route 级语义词 |

### 288.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且当前保持 `getIssue rejects` / `getOrganizations rejects` 组合时，第一条 `getIssue rejects` 若继续无 route wording，会与 helper 级 lookup 失败标题进一步收敛，不利于维持 route/helper 层级区分。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题恢复为 `route getIssue rejects`，同时保持第二条 `getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-171` -> `done`，下一轮转入 `IMP-172`，继续评估第二条 API 失败场景标题在当前 `route getIssue rejects` / `getOrganizations rejects` 组合下是否需要恢复最小 route 级语义词。

### 288.3 经验沉淀

- 当双无 route wording 组合开始让 route 级 API 失败标题与 helper seam 标题过度收敛时，应允许单独把第一条标题恢复到最小 route wording，而不是默认双无 wording 必然可持续。
- 纯测试标题微调仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 288.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-171 → IMP-172` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `373e54cb63e32a2ee8b7720e68b4027bc349c5b5` |
| feature commit | `edbfc4b425ec21f6af4852a0719ebee604395596` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`./node_modules/.bin/tsc --noEmit`、`git diff --check` |

## Session 288 — 2026-04-21：评估并再次恢复第二条 legacy route API 失败标题中的 route 级语义词

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-172`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `route getIssue rejects` / `getOrganizations rejects` 的非对称组合时，第二条是否需要恢复为 `route getOrganizations rejects` 以继续维持与 helper 级 lookup 标题的层级区分；若需要，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 288.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，Implementation lane 当前项为 `IMP-172`，且工作树干净，可支持新的单文件最小 execution unit |
| 实现 | 编辑 `frontend/src/lib/routes.test.tsx` | 仅将 `it('getOrganizations rejects', async () => {` 恢复为 `it('route getOrganizations rejects', async () => {`；不改第一条 `route getIssue rejects` 标题，也不改共享断言、fixture 设置或 helper/route 运行时逻辑 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && ./node_modules/.bin/tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过 |
| 提交 | `git commit -m "[verified] test: restore route wording for second legacy issue reject title"` | 完成本轮 feature/work commit，得到真实提交 `6d39bf8efd1ef9ed23981dbdda908ccbe7b64d65` |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-172` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-173`：评估在当前再次双 route wording 组合后，第一条是否仍可再次收口为无 route wording |

### 288.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且当前保持第一条 `route getIssue rejects` 后，第二条 `getOrganizations rejects` 若继续不带 route wording，会与 helper 级 lookup 标题层级过于接近，不利于继续维持 route/helper 层级区分。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题恢复为 `route getOrganizations rejects`，同时保持第一条 `route getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-172` -> `done`，下一轮转入 `IMP-173`，继续评估第一条 API 失败场景标题在再次双 route wording 组合下是否仍可再次收口为无 route wording。

### 288.3 经验沉淀

- 当第一条 route 级 API 失败标题已维持 `route getIssue rejects` 时，仍应单独复核第二条是否需要恢复 route wording，而不要默认 describe 作用域已经足以长期替代 route 级语义词。
- 纯测试标题微调仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 288.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-172 → IMP-173` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `edbfc4b425ec21f6af4852a0719ebee604395596` |
| feature commit | `6d39bf8efd1ef9ed23981dbdda908ccbe7b64d65` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`./node_modules/.bin/tsc --noEmit`、`git diff --check` |

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
## Session 250 — 2026-04-20：评估并收口第一条 legacy route API 失败标题中的 route 级语义词（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-131`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `route getIssue rejects` / `getOrganizations rejects` 后，第一条是否仍需保留最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 250.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，工作树干净；Implementation lane 当前项为 `IMP-131`，可直接按本轮唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第一条 API 失败场景标题从 `route getIssue rejects` 收口为 `getIssue rejects`；保持第二条 `getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` + 独立 reviewer subagent | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: drop first legacy route reject title again"` | 完成本轮 feature/work commit，得到真实提交 `d41c42ac9e858ad02b7db09a1eef553523e0bfd1`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-131` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-132`：评估在再次同时收口为 `getIssue rejects` / `getOrganizations rejects` 后，第二条是否仍需恢复 route 级语义词。 |

### 250.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第二条已维持 `getOrganizations rejects` 后，第一条 `route getIssue rejects` 同样无须继续保留最小 route 级语义词来维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题收口为 `getIssue rejects`，同时保持第二条 `getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-131` -> `done`，下一轮转入 `IMP-132`，继续评估第二条 route 级 API 失败场景标题在再次同时收口为无 route wording 后是否仍需恢复最小 route 级语义词。

### 250.3 经验沉淀

- 当第二条 route 级 API 失败标题已维持 `getOrganizations rejects` 时，应单独复核第一条是否仍需保留最小 route 级语义词，而不要因上一轮补回过该前缀就默认继续沿用。
- 纯测试标题收口仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 250.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-131 → IMP-132` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `79f05be1f38ee764967db2bc5949298361432845` |
| feature commit | `d41c42ac9e858ad02b7db09a1eef553523e0bfd1` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 249 — 2026-04-20：评估并收口第二条 legacy route API 失败标题中的 route 级语义词（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-130`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `route getIssue rejects` / `route getOrganizations rejects` 后，第二条是否仍需保留最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 249.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，工作树干净；Implementation lane 当前项为 `IMP-130`，可直接按本轮唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第二条 API 失败场景标题从 `route getOrganizations rejects` 收口为 `getOrganizations rejects`；保持第一条 `route getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` + 独立 reviewer subagent | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；独立 review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: drop second legacy route reject title again"` | 完成本轮 feature/work commit，得到真实提交 `79f05be1f38ee764967db2bc5949298361432845`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-130` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-131`：评估在再次变为 `route getIssue rejects` / `getOrganizations rejects` 的非对称 route wording 后，第一条是否仍需保留 route 级语义词。 |

### 249.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第一条已维持 `route getIssue rejects` 后，第二条 `route getOrganizations rejects` 已无须继续保留最小 route 级语义词来维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题收口为 `getOrganizations rejects`，同时保持第一条 `route getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-130` -> `done`，下一轮转入 `IMP-131`，继续评估第一条 route 级 API 失败场景标题在再次变为非对称 route wording 后是否仍需保留最小 route 级语义词。

### 249.3 经验沉淀

- 当第一条 route 级 API 失败标题已维持 `route getIssue rejects` 时，应单独复核第二条是否仍需保留最小 route 级语义词来维持与 helper seam wording 的层级区分，而不要默认两条 route 标题需要长期保持对称前缀。
- 纯测试标题收口仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 249.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-130 → IMP-131` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `ed438d7663270fdbd692f32a4dc58f2359ca7ac0` |
| feature commit | `79f05be1f38ee764967db2bc5949298361432845` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 257 — 2026-04-21：评估并收口第二条 legacy route API 失败标题中的 route 级语义词（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-138`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `route getIssue rejects` / `route getOrganizations rejects` 后，第二条是否仍需保留最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 257.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，工作树干净；Implementation lane 当前项为 `IMP-138`，可直接按本轮唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第二条 API 失败场景标题从 `route getOrganizations rejects` 收口为 `getOrganizations rejects`；保持第一条 `route getIssue rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: drop second legacy route reject title again"` | 完成本轮 feature/work commit，得到真实提交 `464c97b5168874b2f65f3eeba84bf284900416d2`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-138` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-139`：评估在再次变为 `route getIssue rejects` / `getOrganizations rejects` 的非对称 route wording 后，第一条是否仍需保留 route 级语义词。 |

### 257.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第一条已维持 `route getIssue rejects` 后，第二条 `route getOrganizations rejects` 已无须继续保留最小 route 级语义词来维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第二条 route 级 API 失败场景测试标题收口为 `getOrganizations rejects`，同时保持第一条 `route getIssue rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-138` -> `done`，下一轮转入 `IMP-139`，继续评估第一条 route 级 API 失败场景标题在再次变为非对称 route wording 后是否仍需保留最小 route 级语义词。

### 257.3 经验沉淀

- 当第一条 route 级 API 失败标题已维持 `route getIssue rejects` 时，应单独复核第二条是否仍需保留最小 route 级语义词来维持与 helper seam wording 的层级区分，而不要默认两条 route 标题需要长期保持对称前缀。
- 纯测试标题收口仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 257.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-138 → IMP-139` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `156cb5586c2921723379fa7f6b3bf854d3efd6b2` |
| feature commit | `464c97b5168874b2f65f3eeba84bf284900416d2` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |

## Session 258 — 2026-04-21：评估并收口第一条 legacy route API 失败标题中的 route 级语义词（再次收口）

**目标**：按 Implementation lane 恢复 `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 指向的 `IMP-139`，在检查 git/roadmap/task-board/logbook/worktime 后，只做一个最小 execution unit：复核 legacy `/issues/[id]` route 两条 API 失败场景当前为 `route getIssue rejects` / `getOrganizations rejects` 后，第一条是否仍需保留最小 route 级语义词；若可行，则只改这一处安全标题并完成验证、review、提交、状态写回与 push 闭环。

### 258.1 执行步骤

| 步骤 | 操作 | 结果 |
|------|------|------|
| 恢复状态 | `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git log --oneline -5` / 读取 `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / roadmap / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 确认仓库位于 `codex/unify-issue-model`，工作树干净；Implementation lane 当前项为 `IMP-139`，可直接按本轮唯一 execution unit 推进。 |
| 实现 | `frontend/src/lib/routes.test.tsx` | 仅将 legacy `/issues/[id]` route 第一条 API 失败场景标题从 `route getIssue rejects` 收口为 `getIssue rejects`；保持第二条 `getOrganizations rejects`、共享断言、fixture 设置与 helper/route 运行时逻辑不变。 |
| 验证 | `cd frontend && pnpm test -- --run src/lib/routes.test.tsx` | 通过：5 files / 57 tests |
| 验证 | `cd frontend && npx tsc --noEmit` | 通过 |
| 验证 | `git diff --check` | 通过 |
| Review | `git diff -- frontend/src/lib/routes.test.tsx` | 复核本轮只改一处 route 级 API 失败测试标题文案，不改共享断言结构、fixture 设置或 helper/route 运行时逻辑；review 结论为通过。 |
| 提交 | `git commit -m "[verified] test: drop first legacy route reject title again"` | 完成本轮 feature/work commit，得到真实提交 `0186436b98d475718e179d3640ddac1aace32a6b`。 |
| 修改 | `docs/status/roadmap-state.yaml` / `docs/linear-parity/task-board.md` / `docs/planning/dev-logbook.md` / `doc/worktime.md` | 将 `IMP-139` 写回 done，记录真实 feature SHA，并新增下一轮 `IMP-140`：评估在再次同时收口为 `getIssue rejects` / `getOrganizations rejects` 后，第二条是否仍需恢复最小 route 级语义词。 |

### 258.2 本轮落地结果

- 已复核 helper 级标题仍通过 `returns the empty props contract when the helper workspace slug lookup misses` 明确保留 helper seam 语义。
- 在 describe 已限定 legacy `/issues/[id]` route 上下文且第二条已维持 `getOrganizations rejects` 后，第一条 `route getIssue rejects` 同样无须继续保留最小 route 级语义词来维持与 helper 级 lookup 标题的层级区分。
- 因此本轮仅将第一条 route 级 API 失败场景测试标题收口为 `getIssue rejects`，同时保持第二条 `getOrganizations rejects`、共享断言、fixture 设置以及 helper/route 运行时逻辑不变。
- `docs/status/roadmap-state.yaml` 与 `docs/linear-parity/task-board.md` 已写回：`IMP-139` -> `done`，下一轮转入 `IMP-140`，继续评估第二条 route 级 API 失败场景标题在再次同时收口为无 route wording 后是否仍需恢复最小 route 级语义词。

### 258.3 经验沉淀

- 当第二条 route 级 API 失败标题已维持 `getOrganizations rejects` 时，应单独复核第一条是否仍需保留最小 route 级语义词来维持与 helper seam wording 的层级区分，而不要默认第一条 route 标题需要长期保留前缀。
- 纯测试标题收口仍应坚持一次只改一处、安全验证、单次 review、状态写回的最小 execution unit 节奏。

### 258.4 当前状态快照

| 指标 | 值 |
|------|-----|
| 当前 lane / task | `Implementation / IMP-139 → IMP-140` |
| 当前分支 / HEAD（执行前） | `codex/unify-issue-model` / `0186436b98d475718e179d3640ddac1aace32a6b` |
| feature commit | `0186436b98d475718e179d3640ddac1aace32a6b` |
| 验证 | `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit`、`git diff --check` |
