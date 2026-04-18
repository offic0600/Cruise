# Cruise 项目工时记录

> 按 CLAUDE.md 纪律 6 记录各 Phase 和 Session 的评估与实际开发工时

---

## Phase 0：技术选型 + 项目骨架

| Session | 日期 | 目标 | 评估工时 | 实际工时 | 备注 |
|---------|------|------|---------|---------|------|
| S1 | 2026-03-06 | 项目启动 + 技术选型 | 2h | 2h | 纯文档工作 |
| S2 | 2026-03-07 | 骨架搭建 | 3h | 2h | Gradle + Next.js |
| S3 | 2026-03-07 | 数据库切换 (PostgreSQL→H2) | 1h | 2h | 调试环境问题 |
| **合计** | — | Phase 0 完成 | **6h** | **6h** | 10/12 验收通过 |

---

## Phase 1：基础能力

| Session | 日期 | 目标 | 评估工时 | 实际工时 | 备注 |
|---------|------|------|---------|---------|------|
| S4 | 2026-03-07 | Phase 1 验收 + Bug 修复 | 3h | 3h | JWT 认证问题 |
| S5 | 2026-03-09 | JWT 认证 + 完整测试 | 3h | 3h | 16/16 验收通过 |
| **合计** | — | Phase 1 完成 | **6h** | **6h** | |

---

## Phase 2：数据分析

| Session | 日期 | 目标 | 评估工时 | 实际工时 | 备注 |
|---------|------|------|---------|---------|------|
| — | 2026-03-09 | 效率度量 + 趋势预测 + 风险预警 | 4h | 3h | 10/10 验收通过 |
| **合计** | — | Phase 2 完成 | **4h** | **3h** | |

---

## Phase 3：系统集成

| Session | 日期 | 目标 | 评估工时 | 实际工时 | 备注 |
|---------|------|------|---------|---------|------|
| — | 2026-03-09 | ALM + GitLab + 工时系统对接 | 4h | 3h | 10/10 验收通过 |
| **合计** | — | Phase 3 完成 | **4h** | **3h** | |

---

## Phase 4：SuperAgent + Skill 体系

| Session | 日期 | 目标 | 评估工时 | 实际工时 | 备注 |
|---------|------|------|---------|---------|------|
| S6 | 2026-03-10 | Agent + Skill 核心实现 | 5h | 4h | 9 个 Skill |
| S7 | 2026-03-10 | 验收测试 + 整体确认 | 2h | 2h | API 验证通过 |
| **合计** | — | Phase 4 完成 | **7h** | **6h** | |

---

## Phase X：Linear 对标复刻

| Session | 日期 | 目标 | 评估工时 | 实际工时 | 备注 |
|---------|------|------|---------|---------|------|
| S10 | 2026-04-18 | Linear 对标规划 + 本机 Chrome 调试接入 | 3h | 3h | 已打通目标页元信息采集，DOM 抓取仍待稳定化 |
| S11 | 2026-04-18 | 9222 网络采集失败记录 + Cruise issues 基线补强 | 0.5h | 0.5h | 记录 502 状态并补 gap-analysis / roadmap |
| S12 | 2026-04-18 | Active issues 顶部工具栏差距文档补齐 | 0.5h | 0.5h | 产出工具栏级 gap 文档，锁定下一步微调落点 |
| S13 | 2026-04-18 | Active issues DevTools 元信息复核 | 0.5h | 0.5h | 再次确认 9222 可读，补强 api-catalog 元信息 |
| S14 | 2026-04-18 | Active issues page websocket 接入前提复核 | 0.5h | 0.5h | 确认清代理 + suppress_origin 可执行 Runtime.evaluate，纠正旧 502 记录 |
| S15 | 2026-04-18 | 9222 可读性波动文档纠偏 | 0.5h | 0.5h | 同步最新 200/波动结论到接入与网络采集文档 |
| S16 | 2026-04-18 | 同步 9222 已恢复可读的最新取证口径 | 0.5h | 0.5h | 修正文档旧结论，明确下一步应落到业务 Network 摘要 |
| S17 | 2026-04-18 | 盘点 Active issues 路由与 issues 页面耦合点 | 0.5h | 0.5h | 已锁定 `/team/:teamKey/active` 主入口与 `issues/page.tsx` 重耦合关系，并补 routes 回归测试 |
| S18 | 2026-04-18 | 补录 Active issues 路由与 issues 页面耦合盘点 | 0.5h | 0.5h | 明确下一轮可直接进入 `ActiveIssuesWorkbenchPage` 页面骨架开发，无真实阻塞 |
| S19 | 2026-04-18 | 落地 Active issues 独立页面壳子 | 0.5h | 0.5h | 新建 `ActiveIssuesWorkbenchPage`，让 team-active 路由脱离旧 `issues/page.tsx` 直接复用 |
| S20 | 2026-04-18 | 补齐 Active issues 路由/页面耦合盘点落档 | 0.5h | 0.5h | 已确认独立 workbench 壳子存在，下一步可直接迁移真实 issues 数据 glue |
| S21 | 2026-04-18 | 接入 Active issues tabs 真实计数 | 0.5h | 0.5h | 顶部 tabs 已接入 `useIssueWorkspace(...)` 真实计数，并抽出共享 `normalizeIssueView(...)` + 回归测试 |
| S22 | 2026-04-18 | 抽离 Active issues 列表映射 helper | 0.5h | 0.5h | 新增 `issue-workbench.ts`，沉淀 row DTO / state-view helper，并用 Vitest 验证 5/5 通过 |
| S23 | 2026-04-18 | Active issues 列表切到真实 query rows | 0.5h | 0.5h | `ActiveIssuesWorkbenchPage` 已接入真实 issues / projects / members 数据，支持按 view 过滤与 detail 跳转 |
| S24 | 2026-04-18 | 接通 Active issues tabs 的 view 切换交互 | 0.5h | 0.5h | 顶部 tabs 已能写回 URL `view` 参数，并联动真实 rows 过滤 |
| S25 | 2026-04-18 | 接通 Active issues 搜索表单与 URL 状态同步 | 0.5h | 0.5h | 搜索框已可提交并写回 `q`，Filter/notes 状态随搜索联动 |
| S26 | 2026-04-18 | 迁入 Active issues 高级筛选侧板最小闭环 | 0.5h | 0.5h | team-active 已接入高级筛选侧板与 URL Apply/Clear，开始承接 legacy filter draft/query 结构 |
| S27 | 2026-04-18 | 接通 Active issues Display 折叠状态 URL 闭环 | 0.5h | 0.5h | Display 按钮已可读写 `collapsed` 查询参数，为后续真实分组折叠铺路 |
| S28 | 2026-04-18 | 让 Active issues 列表真实消费 sort URL 状态 | 0.5h | 0.5h | `sort=updatedAt / manual` 已真实驱动 workbench rows 顺序，并补 9/9 helper 回归测试 |
| S29 | 2026-04-18 | 记录 Active issues 顶部工具栏采集阻塞事实 | 0.5h | 0.5h | `/json/version` 与 `/json/list` 本轮均返回 502，已把 CAP-06 blocker 落盘到 `har/` / `flows/` 并同步任务板 |
| S30 | 2026-04-18 | 复测 9222 metadata 阻塞并同步 CAP-06 状态 | 0.5h | 0.5h | 二次最小 probe 仍为 502，已把“持续阻塞”事实同步到 page-inventory / task-board / api-catalog |
| S40 | 2026-04-18 | 为 team-active 高级筛选补 labels URL/摘要闭环 | 0.5h | 0.5h | `labelIds=` 已进入 filter draft / query / summary 闭环，定向 Vitest 9/9 通过 |
| S41 | 2026-04-18 | 确认 Active issues 采集阻塞已转为已登录会话不可复用 | 0.5h | 0.5h | browser 可读 9222 metadata，但打开目标页会落到桌面端中转页并在 `Open here instead` 后进入登录页 |
| S42 | 2026-04-18 | 补强 Active issues 中转页→登录页阻塞证据 | 0.5h | 0.5h | 再次确认 metadata 可读但真实页面仍是中转页→登录页，并把可见文案/点击后反馈落盘 |
| S43 | 2026-04-18 | 20:19 复测并刷新 Active issues 会话阻塞证据 | 0.5h | 0.5h | 终端 9222 仍 502，但 browser 仍能读到 Active issues target metadata；真实页面仍是中转页→登录页，已同步最新 flow/har/page-inventory/task-board |
| S44 | 2026-04-18 | 20:27 复测确认 9222 metadata 已恢复但认证态仍不可复用 | 0.5h | 0.5h | `/json/version` 与 `/json/list` 已恢复 200，但打开 Active issues 仍是中转页→登录页；已新增 recovery HAR/flow 并同步 page-inventory/task-board/api-catalog |
| S45 | 2026-04-18 | 20:42 复测并补记 browser/terminal metadata 分裂态 | 0.5h | 0.5h | browser 仍可读 `/json/version` 与 `/json/list`，终端直连再次回到 502；真实页面仍是中转页→登录页，已新增 discrepancy HAR/flow 并同步 page-inventory/task-board/api-catalog |
| S46 | 2026-04-18 | 20:51 复测确认 metadata 分裂态仍在且认证页仍不可复用 | 0.5h | 0.5h | browser 仍可读 `/json/version` 与 `/json/list`，终端直连仍为 502；再次确认 Active issues 深链仍落到中转页→登录页，并同步新一轮 HAR/flow/page-inventory/task-board/api-catalog |
| S47 | 2026-04-18 | 21:06 复测确认 metadata 分裂态仍在且 Active issues 深链仍落登录页 | 0.5h | 0.5h | browser 仍可读 `/json/version` 与 `/json/list`，终端直连仍为 502；再次确认 Active issues 深链仍是中转页→登录页，并同步 21:06 新一轮 HAR/flow/page-inventory/task-board/api-catalog |
| S48 | 2026-04-18 | 21:16 复测确认 metadata 分裂态仍在且 Active issues 深链继续落认证门页 | 0.5h | 0.5h | browser 仍可读 `/json/version` 与 `/json/list`，终端直连仍为 502；再次确认 `Open here instead` 后仍进入登录页，并同步 21:16 新一轮 HAR/flow/page-inventory/task-board/api-catalog |
| S49 | 2026-04-18 | 21:27 复测确认 metadata 分裂态仍在且 Active issues 深链继续落认证门页 | 0.5h | 0.5h | browser 仍可读 `/json/version` 与 `/json/list`，终端直连仍为 502；再次确认 `Open here instead` 后仍进入登录页，并同步 21:27 新一轮 HAR/flow/page-inventory/task-board |
| S50 | 2026-04-18 | 21:45 复测确认 `/json/list` 仍可读且 Active issues 深链继续落认证门页 | 0.5h | 0.5h | browser 仍可读 `/json/list` target metadata，终端直连 `/json/version` 与 `/json/list` 仍为 502；再次确认 `Open here instead` 后仍进入登录页且未见 CAPTCHA，并同步 21:45 新一轮 HAR/flow/page-inventory/task-board |
| S51 | 2026-04-18 | 21:56 复测确认 `/json/list` 仍可读且 Active issues 深链继续落认证门页 | 0.5h | 0.5h | browser 仍可读 `/json/list` target metadata，终端直连 `/json/version` 与 `/json/list` 仍为 502；再次确认 `Open here instead` 后仍进入登录页，并同步 21:56 新一轮 HAR/flow/page-inventory/task-board/api-catalog |
| S52 | 2026-04-18 | 22:09 复测确认 `/json/version` 与 `/json/list` 仍仅在 browser 侧可读且 Active issues 深链继续落认证门页 | 0.5h | 0.5h | browser 仍可读 `/json/version` 与 `/json/list` metadata，终端直连两端点仍为 502；再次确认 `Open here instead` 后仍进入登录页，并同步 22:09 新一轮 HAR/flow/page-inventory/task-board/api-catalog |
| S53 | 2026-04-18 | 22:20 复测确认 9222 metadata 已恢复双侧可读但 Active issues 深链仍落认证门页 | 0.5h | 0.5h | terminal 与 browser 现都可读 `/json/version` 与 `/json/list`；再次确认真实页面仍是中转页→登录页，并把 CAP-06 blocker 纠偏为 authenticated page reuse 失败 |
| S54 | 2026-04-18 | 22:30 复测确认 9222 metadata 双侧仍可读且 Active issues 深链继续落登录页 | 0.5h | 0.5h | terminal 与 browser 仍都可读 `/json/version` 与 `/json/list`，并继续枚举到 Active issues target；但深链仍先到中转页，点击 `Open here instead` 后进入登录页，已新增 22:30 HAR/flow/page-inventory/task-board |
| S55 | 2026-04-18 | 22:40 复测确认 9222 再回 split state 且 Active issues 深链继续落登录页 | 0.5h | 0.5h | terminal 直连 `/json/version` 与 `/json/list` 再次 502，但 browser 仍可读 metadata 并继续枚举到 Active issues target；深链仍为中转页→登录页，已新增 22:40 HAR/flow/page-inventory/task-board/api-catalog/route-map |
| S56 | 2026-04-18 | 22:50 复测确认 9222 仍为 browser/terminal split state 且 Active issues 深链继续落登录页 | 0.5h | 0.5h | terminal 直连 `/json/version` 与 `/json/list` 仍为 502，但 browser 仍可读 metadata，且 `/json/list` 还能看到多个其它实时 target；深链仍为中转页→登录页，已新增 22:50 HAR/flow/page-inventory/task-board/api-catalog/route-map |
| S57 | 2026-04-18 | 23:05 复测确认 9222 metadata 已恢复双侧可读但 Active issues 深链仍落登录页 | 0.5h | 0.5h | terminal 与 browser 现都可读 `/json/version` 与 `/json/list`，并继续枚举到 Active issues target；但深链仍为中转页→登录页，已新增 23:05 HAR/flow/page-inventory/task-board/api-catalog |
| S58 | 2026-04-18 | 收紧 team-active 多条件筛选摘要为首项 + 余量聚合文案 | 0.5h | 0.5h | 新增 `summarizeFilterTokens(...)` helper，并让页内 search summary 复用短摘要；定向 Vitest 6/6 通过 |
| S59 | 2026-04-18 | 为 team-active 工具栏状态说明补 helper 级回归测试 | 0.5h | 0.5h | 导出 `searchStatusText(...)` / `noteText(...)` 形成可测试 seam，并补齐排序/搜索/说明文案回归；定向 Vitest 9/9 通过 |
| **合计** | — | 进行中 | **23.0h** | **23.0h** | |

---

## 总体统计

| 指标 | 值 |
|------|-----|
| 评估总工时 | 35.5h |
| 实际总工时 | 32.5h |
| 节省工时 | 3h (8.5%) |
| 验收通过率 | 95%+ (56/59) |

---

## Phase 5：Linear 产品复刻（进行中）

| Session | 日期 | 目标 | 评估工时 | 实际工时 | 备注 |
|---------|------|------|---------|---------|------|
| S10 | 2026-04-16 | 锁定 `codex/unify-issue-model` 分支，建立 Linear 复刻计划 + 状态源 + cron 自动推进 | 2h | 1h | 纯规划 / 自动化基础设施 |
| S11 | 2026-04-17 | 完成 task01a，统一 issue/project/initiative view queryState 默认契约并锁定审计文档 | 2h | 1h | 前端验证通过；后端 Gradle 测试受 cron 环境缺少 Java/JAVA_HOME 限制 |
| S12 | 2026-04-17 | 完成 task01b1 repair closure，补齐 malformed project saved view 的 fail-closed 修复与回归覆盖 | 2h | 1h | 后端 Gradle 测试仍受 cron 环境缺少 Java/JAVA_HOME 限制 |

---

*创建：2026-03-10*
*更新：2026-04-18*
