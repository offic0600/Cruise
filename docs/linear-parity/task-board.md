# Linear Parity 任务板

> 目的：作为 Linear 对标工作的统一状态源，但按 **采集（capture）** 与 **实现（implementation）** 两条 cron 分轨推进。
> 当前约束：
> - `cruise-linear-parity-capture` 只处理采集类任务
> - `cruise-linear-parity-push` 只处理实现类任务
> - 两条任务线都必须更新本文件，但只能推进各自所属 lane 的任务
> - `docs/status/roadmap-state.yaml` 是 cron 恢复状态源；本文件负责 lane 明细、最小增量定义与后继任务衔接

## 状态说明

- `pending`：未开始
- `in_progress`：进行中，可继续推进
- `blocked`：当前有明确阻塞，需记录 blocker
- `done`：已完成

## Schema（very short）

```yaml
status: one of [pending, in_progress, blocked, done]
depends_on: comma-separated IDs or -
blocker: '-' when none
```

## 调度规则（machine-friendly）

```yaml
state_source:
  primary: docs/status/roadmap-state.yaml
  lane_detail_source: docs/linear-parity/task-board.md
  required_reads:
    - AGENTS.md
    - docs/planning/dev-logbook.md
    - doc/worktime.md
    - docs/status/roadmap-state.yaml
    - docs/plans/2026-04-16-linear-parity-roadmap.md
recovery_checks:
  - git status --short
  - git branch --show-current
  - git rev-parse HEAD
  - git log --oneline -5
selection:
  capture:
    lane: Capture
    pick: first(in_progress) || first(pending)
    skip_blocked_if_independent_next_exists: true
  push:
    lane: Implementation
    pick: first(in_progress) || first(pending)
    skip_blocked_if_independent_next_exists: true
planning_rules:
  next_task_required_when_done: true
  next_task_format:
    - add exactly one new pending item immediately after the done item when a natural next implementation/capture step exists
    - title must describe the next concrete increment, not a vague phase label
    - done_when must be a verifiable completion standard
    - blocker must be '-' unless currently blocked
  in_progress_must_include_next_increment_hint: true
  if_selected_item_has_no_concrete_next_increment:
    - split_it_into_smaller_follow_up_items_before_next_run
    - do_not_leave_lane_in_plan_only_loop
execution_model:
  one_execution_unit_per_run: true
  closure_after_single_task: true
  special_run_types:
    - closure-only
    - repair
    - push-only
constraints:
  capture_forbidden:
    - Cruise 产品代码实现
  push_forbidden:
    - 截图
    - DOM 取证
    - HAR 取证
    - 浏览器只读探测
run_rules:
  min_real_increment_minutes: 5
  max_real_increment_minutes: 15
  plan_only_forbidden: true
  blocked_requires_blocker_note: true
  dirty_tree_requires_scope_judgement: true
closure_order:
  - feature/work commit
  - record real commit hash
  - update state/task docs
  - docs/state commit
  - confirm clean working tree
  - git push origin HEAD
update_after_each_run:
  - docs/linear-parity/task-board.md
  - docs/planning/dev-logbook.md
  - doc/worktime.md
  - docs/status/roadmap-state.yaml
  - task_related_artifacts
delivery:
  push_done_requires_commit_and_push: true
  push_git_author: offic0600 <offic0600@163.com>
report_format:
  - 本轮完成的唯一 task
  - 关键改动文件
  - 测试/验证结果
  - review 结论
  - commit SHA
  - push 结果
  - 更新后的 task-board 摘要
  - 下一轮应执行的 task
```

---

## Capture lane（只给 `cruise-linear-parity-capture`）

| id | title | status | depends_on | done_when | blocker |
|---|---|---|---|---|---|
| CAP-01 | 稳定记录 9222 元信息与可访问性现状 | done | - | `/json/version`、`/json/list`、目标页标题/URL 的可用性与波动情况已落盘到 `har/` / `flows/` 文档 | - |
| CAP-02 | 建立 Linear 页面/路由/领域文档骨架 | done | CAP-01 | `README.md`、`page-inventory.md`、`route-map.md`、`domain-model.md`、`api-catalog.md`、`ui-style-guide.md` 已存在 | - |
| CAP-03 | 补齐 Active issues 网络监听摘要 | done | CAP-01 | 已获得 `Network.requestWillBeSent/responseReceived` 事件样本，并落盘到 `docs/linear-parity/har/2026-04-18-active-issues-network-events.json` | - |
| CAP-04 | 补 Active issues DOM/结构证据摘要 | done | CAP-01 | 已新增 `docs/linear-parity/dom/active-issues-structure-summary.md`，沉淀 team Active issues 的结构级证据摘要 | - |
| CAP-05 | 建立全功能 1:1 采集计划 | done | CAP-02 | 已新增 `docs/linear-parity/full-parity-capture-plan.md`，明确页面 × 控件 × 状态 × 流程的采集口径 | - |
| CAP-06 | 枚举 Active issues 顶部工具栏与 tabs 的交互证据 | blocked | CAP-03, CAP-04, CAP-05 | 为 Active issues 页的顶部 tabs / 搜索 / filter / display / sort / new 等控件逐项补前后状态、截图/DOM/网络摘要，并新增对应 flow 文档 | authenticated page/session reuse failure：10:01 CST 最新复测中，browser 侧 `json/list` 仍可读且继续枚举到 6 个 live page targets + 1 个 worker target，其中 Linear target=`Cleantrack › Active issues`（id=`81A3713C33BCA35B2A0B8C7D177F43AD`）；但 terminal 直连 `/json/version` 与 `/json/list` 继续返回 `502`。browser 打开目标 URL 仍先落到 `Link opened in the Linear app` 中转页；本轮再次通过显式点击 `Open here instead` 稳定复现登录页分支，且仍未见 CAPTCHA/iframe，因此文档页继续只应归类为 `Learn more` / 激活歧义分支，而不是新 blocker 类型。下一最小任务仍应优先改做 page websocket/CDP 对该 target 的只读取证。证据见 `docs/linear-parity/har/2026-04-19-1001-browser-terminal-metadata-discrepancy-and-auth-blocked.json`、`docs/linear-parity/flows/active-issues-auth-session-blocker-2026-04-19-1001.md` |
| CAP-07 | 采集一个 issue 详情页的页面级与控件级证据 | done | CAP-06 | 至少拿到 issue 详情页默认态截图、DOM、可见模块、主要操作入口与网络摘要 | 2026-04-19 14:19 CST 本轮开始前已先读取 `~/Desktop/Cruise/.hermes/linear-9222-watchdog/last-status.txt`，其中 `consumer_policy=attached_cdp_only`、`metadata_layer=ok`、`websocket_attach=ok`，因此严格只复用已附着成功的本地 Chrome 9222 target `81A3713C33BCA35B2A0B8C7D177F43AD`。通过清代理后复查 `/json/list` 与 page websocket/CDP，再次确认 issue detail 页面 `CLE-28 Views 页面补齐创建/编辑/删除与状态反馈` 仍为 `readyState=complete`；在 14:08 已补默认态整页截图、可见模块与主要操作入口枚举的基础上，本轮继续对同一 target 执行 8 秒只读 `Network.requestWillBeSent/responseReceived` 监听，结果 `request_count=0`、`response_count=0`，由此把“默认态 network-idle”沉淀为明确网络摘要结论，满足 CAP-07 done_when。证据见 `docs/linear-parity/flows/issue-detail-page-cdp-screenshot-and-controls-2026-04-19-1408.md`、`docs/linear-parity/flows/issue-detail-page-cdp-network-idle-2026-04-19-1416.md`、`docs/linear-parity/har/2026-04-19-1408-issue-detail-screenshot-and-controls-summary.json`、`docs/linear-parity/har/2026-04-19-1416-issue-detail-network-idle-summary.json`、`docs/linear-parity/screenshots/issue-detail-page-2026-04-19-1408.png` |
| CAP-08 | 采集 issue 创建/编辑入口的打开态与校验态证据 | blocked | CAP-06 | 只读优先，允许打开弹窗/抽屉并记录字段、默认值、校验反馈，不做持久提交 | 2026-04-19 21:31 CST 本轮开始前先读取 `~/Desktop/Cruise/.hermes/linear-9222-watchdog/last-status.txt`，确认 `consumer_policy=attached_cdp_only`、`metadata_layer=ok`、`websocket_attach=ok`，且 issue detail target 仍为 `CLE-28 Views 页面补齐创建/编辑/删除与状态反馈`。但当前仓库存在大量 implementation lane 遗留脏变更（issue detail 页面、i18n、task/state/logbook/worktime 等），capture cron 若继续在同一工作树落盘 CAP-08 新证据，无法保证不跨 lane 干扰既有未收口工作；因此本轮将 CAP-08 真实写回为 blocked。下一轮建议先在独立干净工作树执行 capture，或待 implementation 侧完成脏变更收口后，再继续同一 `Add label` search input 的空结果/建议反馈态只读采集。 |
| CAP-09 | 采集 Projects 域页面与关键控件证据 | pending | CAP-08 | 至少完成 Projects 列表页的页面级截图、DOM、主要按钮/筛选/详情入口摘要 | - |
| CAP-10 | 采集 Views 域页面与关键控件证据 | pending | CAP-05 | 至少完成 Views 列表/入口级证据，明确创建/编辑/删除入口形态 | - |
| CAP-11 | 采集 Cycles / Roadmap 域页面证据 | pending | CAP-05 | 至少完成一个 Cycles 或 Roadmap 页面级证据包 | - |
| CAP-12 | 采集 Inbox / Settings 必要子集证据 | pending | CAP-05 | 至少完成 Inbox 与一个 Settings 子页的页面级证据包 | - |

---

## Implementation lane（只给 `cruise-linear-parity-push`）

| id | title | status | depends_on | done_when | blocker |
|---|---|---|---|---|---|
| IMP-01 | 完成 Cruise vs Linear issues 域差距分析 | done | CAP-02 | `gap-analysis.md` 与 `implementation-roadmap.md` 已形成基线 | - |
| IMP-02 | 建立长期任务状态驱动机制 | done | IMP-01 | 已新增 `task-board.md`，cron 改为按任务状态推进 | - |
| IMP-03 | 细化 `/issues` 页顶部工具栏首个 UI gap | done | IMP-01 | 已形成 `active-issues-toolbar-gap.md` 执行说明 | - |
| IMP-04 | 落地 `/issues` 顶部工具栏一个最小对标改动 | done | IMP-03 | 已完成顶部 tabs / 主次操作层级的最小 UI 对标 | - |
| IMP-05 | 评估 team/workspace 语义列表路由壳层 | done | IMP-01 | 已补 `teamIssuesPath(...)` 与 team 语义路由壳层 | - |
| IMP-06 | 让 team-active Display 分组折叠切换真实作用于列表渲染 | done | IMP-05 | `collapsed=` URL 状态已真正驱动 group section 展开/折叠 | - |
| IMP-07 | 为 issue-workbench 视图归类规则补齐回归测试 | done | IMP-06 | 已补 helper 级回归测试 | - |
| IMP-08 | 优化 team-active 搜索/筛选空态反馈 | done | IMP-06, IMP-07 | 已补差异化空态文案与测试 | - |
| IMP-09 | 为 team 路由 helpers 补语义化 backlog/done 回归测试 | done | IMP-05 | 已补 `teamIssuesPath(...)` 回归测试 | - |
| IMP-10 | 为 team-active Display 折叠状态补可见反馈文案 | done | IMP-06, IMP-08 | 已补 collapsed group summary 与测试 | - |
| IMP-11 | 为 team-active 工具栏补最小可见排序状态 | done | IMP-06, IMP-08, IMP-10 | 已把 `sort=` URL 状态与可见摘要接通 | - |
| IMP-12 | 让 team-active 列表真实消费 sort URL 状态并输出稳定排序 | done | IMP-11 | `sort=` 已真实驱动 Active issues workbench rows 的 `updatedAt / manual` 顺序，且已补 `issue-workbench` helper 与 row builder 回归测试并通过定向 `vitest` | 若后续排序规则依赖更多 Linear 证据，由 capture lane 补充；本任务基于现有证据已完成安全最小实现 |
| IMP-13 | 为 team-active 工具栏补最小可见 filter summary 聚合反馈 | done | IMP-08, IMP-12 | 已将 team-active filter 按钮与侧栏摘要升级为首项 + 余量聚合反馈文案，并补充 `filterSummaryLabel(...)` 回归测试且定向 `vitest` 通过 | `npx tsc --noEmit` 仍受仓库既有 `MarkdownEditor.tsx` tiptap 缺依赖与 `issue-view.test.ts` 旧字面量类型不收窄影响，未全绿 |
| IMP-14 | 为 team-active 高级筛选补最小 labels URL/摘要闭环 | done | IMP-13 | 已让 `labelIds=` URL 状态进入 team-active filter draft / query / summary 闭环，并补充 helper 回归测试且定向 `vitest` 通过 | `npx tsc --noEmit` 仍受仓库既有 Vitest/路径别名/JSX 配置与 `MarkdownEditor.tsx` 依赖问题影响，未能作为全局绿灯 |
| IMP-15 | 收紧 team-active 多条件筛选摘要为首项 + 余量聚合文案 | done | IMP-14 | 已将 `filterSummaryLabel(...)` 改为首项 + 余量聚合，并让页内 search summary 复用同一套短摘要逻辑；补充 `summarizeFilterTokens(...)` helper 与回归测试且定向 `vitest` 通过 | `npx tsc --noEmit` 仍受仓库既有 `MarkdownEditor.tsx` tiptap 依赖缺失影响 |
| IMP-16 | 为 team-active 工具栏状态说明补 helper 级回归测试 | done | IMP-15 | 已导出 `searchStatusText(...)` / `noteText(...)` / `sortSummaryLabel(...)` 为可测试 seam，并补齐中英文回归测试且定向 `vitest` 通过 | `npx tsc --noEmit` 仍受仓库既有 `MarkdownEditor.tsx` tiptap 依赖缺失影响，且当前组件仍保留既有 `IN_PROGRESS` / “过滤条件” 字面量 |
| IMP-17 | 评估 issue 详情页 route shell 与页面骨架落地切口 | done | CAP-07 | 已完成 issue detail route shell 与详情页骨架/空态 contract 的一轮最小收口：route 复用 `buildIssueDetailRouteBackLink(...)`、`buildIssueDetailRouteEmptyStateModel(...)` 与 `buildIssueDetailRouteEmptyStateLinkHref(...)` 统一 not-found/error/back-CTA 语义，`IssueDetailPage` 加载态切到稳定双栏骨架，并修正 DONE/CANCELED + resolution 徽标文案连接符；routes seam 同时锁定 visible CTA raw branch 与 normalized model 的 href 一致性，且本轮已在当前环境完成 `pnpm test -- --run src/lib/routes.test.tsx`、`npx tsc --noEmit` 与 `git diff --check` 验证通过。 | - |
| IMP-18 | 为 issue detail route shell 补共享 skeleton/empty-state contract 的下一刀验证收口 | done | IMP-17 | 已新增 `buildIssueDetailRouteShellModel(...)`，把 route shell 的 empty-state model 与 loading-state defaults/overrides 收口到同一 helper，并补 routes seam 回归测试锁定默认/显式 loading contract；定向 `pnpm test -- --run src/lib/routes.test.tsx`（5 files, 50 tests）、`npx tsc --noEmit`、`git diff --check` 均通过 | - |
| IMP-19 | 让 issue detail route 真正消费共享 shell model 渲染 loading/empty-state 分支 | done | IMP-18 | issue detail route 的 loading/background-refetch/error/no-id 分支现已消费 `buildIssueDetailRouteShellModel(...)` 产出的共享 shell model，删除 route 内部重复 empty-state 组装，并保持 scope 仅限 route 分支 seam；定向 `pnpm test -- --run src/lib/routes.test.tsx`（5 files, 50 tests）、`npx tsc --noEmit`、`git diff --check` 均通过 | - |
| IMP-20 | 继续收口 issue detail route 与 IssueDetailPage 之间剩余 skeleton/empty-state seam | done | IMP-19 | route shell 现已补齐 `pageBackLink` 共享 contract，并让 steady / cached-refetch 两个 `IssueDetailPage` 分支统一消费 `buildIssueDetailRouteShellModel(...)` 产出的返回链接语义；定向 `cd frontend && pnpm test -- --run src/lib/routes.test.tsx`（5 files, 51 tests）、`cd frontend && npx tsc --noEmit`、`git diff --check` 均通过 | - |
| IMP-21 | 收口 issue detail route 对 IssueDetailPage 默认 back-link props 的重复组装 | done | IMP-20 | issue detail route 的默认 page 分支现已与 cached-refetch 分支一样直接展开 `buildIssueDetailRouteShellModel(...)` 产出的共享 `pageBackLink` props，删除 route 内对 `backHref/backLabel` 的重复组装；定向 `cd frontend && pnpm test -- --run src/lib/routes.test.tsx`（5 files, 51 tests）、`cd frontend && npx tsc --noEmit`、`git diff --check` 均通过 | - |
| IMP-22 | 让 IssueDetailPage 直接消费共享 back-link contract props | done | IMP-21 | `IssueDetailPage` 现已把返回链接 props 收口为与 route shell `pageBackLink` 一致的 `href/label` contract，删除组件层对 `backHref/backLabel` 旧命名的专用接口，并同步更新 routes seam mock/断言；定向 `cd frontend && pnpm test -- --run src/lib/routes.test.tsx`（5 files, 51 tests）、`cd frontend && npx tsc --noEmit`、`git diff --check` 均通过 | - |
| IMP-23 | 评估并收紧 IssueDetailPage 内部 workspace/team 默认 back-link fallback 的保留边界 | done | IMP-22 | 已确认 `IssueDetailPage` 的直接调用面只剩 workspace issue detail route、`/issues/[id]` 直达页与 Inbox embedded 详情；其中 Inbox 因 `embedded` 不渲染返回链接，`/issues/[id]` 直达页仍依赖内部 fallback。基于该调用面，本轮已把顶部返回链接收紧为仅消费显式传入的 `href`，并把“为什么还不能完全删掉 `teamActivePath(...)` fallback”写回状态：当前它仍只对删除后跳转与 `/issues/[id]` 直达页未显式传参场景必要。 | - |
| IMP-24 | 为 `/issues/[id]` 直达 issue 详情页补最小显式 back-link contract | done | IMP-23 | `/issues/[id]` 直达页现已在服务端先获取 issue 与 organizations，按 `organizationId` 解析 workspace slug 后显式构造并透传 `IssueDetailPage` 的 `href/label` back-link contract；顶部返回链接因此不再依赖组件内部默认 fallback，而内部 `teamActivePath(...)` 兜底仅保留给删除后跳转。定向 `cd frontend && pnpm test -- --run src/lib/routes.test.tsx`、`cd frontend && npx tsc --noEmit`、`git diff --check` 均通过。 | - |
| IMP-25 | 为 `/issues/[id]` 直达页补最小 route seam 回归测试以锁定显式 back-link contract | done | IMP-24 | 已为 legacy `/issues/[id]` 直达 route 补最小 seam 回归测试：直接调用 route 并渲染返回元素，锁定可解析 workspace slug 时向 `IssueDetailPage` 透传 `/[workspace]/issue/[identifier]/[slug]` 的 `href` 与 `label: null` contract，同时覆盖 organizations 无匹配 slug 时安全降级为空 back-link props。定向 `cd frontend && pnpm test -- --run src/lib/routes.test.tsx`（5 files, 53 tests）、`cd frontend && npx tsc --noEmit`、`git diff --check` 均通过。 | - |
| IMP-26 | 为 legacy `/issues/[id]` route 补 API 失败场景 seam 测试以锁定 try/catch 降级 contract | pending | IMP-25 | 为 legacy `/issues/[id]` 直达 route 新增最小 seam 回归测试，覆盖 `getIssue(...)` 或 `getOrganizations()` 抛错时 route 仍以空 back-link props 渲染 `IssueDetailPage` 的 try/catch 降级 contract | - |


## 最近一次人工调整

- 2026-04-18：新增任务板，改为“任务状态驱动”而不是“Task 1/Task 2”静态提示词驱动。
- 2026-04-18：进一步收紧为 capture / implementation 双 lane；采集 cron 与实现 cron 禁止跨 lane 抢任务。
- 2026-04-19：引入 `docs/status/roadmap-state.yaml` 作为 cron 恢复状态源，任务板退化为 lane 明细与后继任务定义源。

## Cron 执行提示（给未来运行）

- 不要重新发明任务顺序；先恢复 git 真实状态与 `docs/status/roadmap-state.yaml`，再回到本文件对应 lane。
- capture cron 只补证据，不做实现；implementation cron 只做实现，不扩展成采集。
- 若无真实 blocker，必须落一个真实增量。
- 某项任务一旦标记为 `done`，必须立刻在其后补一个新的、同 lane 的 `pending` 详细任务，写清具体切口、可验证完成标准与依赖。
- 若某个 `in_progress` 任务的 done_when 已过宽、导致连续两轮无法判断下一刀做什么，必须先拆小或补“下一最小增量”说明，不能继续空转复核。
- 每轮只做一个 execution unit；完成或阻塞后都必须写回状态并停止。
- 报告格式固定为：本轮完成的唯一 task / 关键改动文件 / 测试或验证结果 / review 结论 / commit SHA / push 结果 / 更新后的 task-board 摘要 / 下一轮应执行的 task。
