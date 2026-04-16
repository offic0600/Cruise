# Cruise × Linear 一比一复刻执行计划

> **For Hermes:** 按 `docs/status/roadmap-state.yaml` 作为唯一状态源执行；每次只完成一个最小可交付 task，完成后必须测试、单次 review、提交、写回状态并停止。

**目标：** 基于 `/opt/data/projects/Cruise` 的 `codex/unify-issue-model` 分支，把 Cruise 从“已有多个 Linear 风格模块雏形”推进为“以共享内核驱动的 Linear 产品层高保真复刻”。

**架构：** 不倒推 Linear 的数据库 schema，而是按 HAR 已证明的产品层对象边界收敛 Cruise。优先统一 issue / project / view / membership / notification 的共享内核，再逐步补齐 Projects、Inbox、Workspace Members、Initiatives 等产品面。

**技术栈：** Kotlin + Spring Boot 3.2.5 + JDK 21；Next.js 15 + React 19 + TypeScript strict；H2；Vitest / Playwright。

---

## 0. 当前基线

- 仓库：`/opt/data/projects/Cruise`
- 分支：`codex/unify-issue-model`
- 基线提交：`21b6774` (`Build workspace projects and inbox workbench`)
- 设计依据：
  - `docs/linear-har-module-design-checklist.md`
  - `docs/planning/cruise-refactor-roadmap.md`
  - `docs/planning/plan-baseline.md`
  - `docs/baselines/design-baseline.md`

## 1. 总体执行原则

1. **产品层一比一复刻优先于后端表级模仿**
   - 以路由、页面组织、交互流、对象边界、展示配置、过滤/排序/分组能力的一致性为目标。
2. **共享内核优先于页面堆砌**
   - 所有新页面尽量挂到统一的 `view / queryState / member source / subscription / favorite` 内核上。
3. **单任务执行单元**
   - 每次运行只做一个最小 task / subtask。
4. **完成定义**
   - 实现完成
   - 必要测试通过
   - 必要文档更新
   - 仅一次 post-completion review 完成
   - git commit 已创建
   - 状态文件已写回
5. **阻塞处理**
   - 如果某 task 被外部依赖阻塞，写回 `blocked` 原因和建议，随后切换到下一个不依赖该阻塞的 task。

---

## 2. 路线图

### Phase A — 共享内核收口

#### task01 — 统一 issue/project 共享 queryState 契约
**目标：** 收口 issue / project views 的 `filters / sorting / grouping / subGrouping / display / layout` 结构，清理前后端分裂字段。  
**验收：** issue 与 project view 持久化结构一致，前端保存/读取路径统一，至少有回归测试覆盖 schema。  
**建议拆分：**
- `task01a`：梳理现有前后端 schema 差异并锁定统一 DTO
- `task01b`：后端 view DTO / service 收口
- `task01c`：前端 types / api / query hooks 收口
- `task01d`：回归测试 + 文档更新

#### task02 — 统一 issue / project 的展示配置入口
**目标：** 让 display options / view options 对 issue / project 走同一抽象。  
**验收：** issue/project 的列显示、布局切换、保存动作共用核心逻辑。

#### task03 — 统一成员源：Membership 成为唯一成员关系模型
**目标：** 让 assignee / project lead / workspace members / member filters 全部读同一成员源。  
**验收：** 前后端都不再把 `TeamMember` 与 `Membership` 混合作为一线产品模型。

### Phase B — Projects 产品面闭环

#### task04 — 稳定 WorkspaceProjectRow 聚合 DTO
**目标：** 固定 projects 列表聚合行字段：priority / lead / targetDate / health / progressPercent / nextMilestone / issueCount / completedIssueCount。  
**验收：** `/projects/all` 与 custom project views 使用同一聚合 DTO。

#### task05 — 收口 All Projects 与 custom project views
**目标：** 完成 all/custom project views 路由、列表、过滤、展示、保存闭环。  
**验收：** `projects/all`、`projects/view/*`、新建 view 流程互通。

#### task06 — 项目主页与 Project Updates 联动
**目标：** 打通项目主页最新更新、状态健康、更新流。  
**验收：** 项目列表和详情可展示/写入 update，health 来源一致。

#### task07 — 项目主页与 Milestones 联动
**目标：** 打通里程碑列表、下一个里程碑聚合字段、时间状态显示。  
**验收：** `nextMilestone` 可稳定回填到 project row / detail。

#### task08 — Project composer 共享内核化
**目标：** 把 project composer 及 status/priority/lead/labels/date 选择器收口为稳定共享内核。  
**验收：** create/edit project 不再散落多套字段映射。

### Phase C — Notifications / Favorites / Inbox

#### task09 — 统一 subscription 域模型
**目标：** 让 view subscribe / project subscribe 都映射到统一 `NotificationSubscription(resourceType, resourceId, eventKey)`。  
**验收：** 后端与前端都不再为 view/project 分开造订阅模型。

#### task10 — Favorites 统一抽象
**目标：** 统一 favorite create/delete 与 header/list/view 的收藏态。  
**验收：** issue/project/view 至少一类资源跑通统一收藏模型。

#### task11 — Inbox 数据流闭环
**目标：** 收口 inbox 列表、已读/归档、资源跳转、筛选基础能力。  
**验收：** inbox workbench 可用，不再只是静态页面壳。

### Phase D — Workspace / Team / Members

#### task12 — Workspace members 页面最小闭环
**目标：** 提供 Linear 风格的 workspace members 列表、基础筛选与成员卡片信息。  
**验收：** 该页面与 assignee / lead 选择器共用同一成员源。

#### task13 — Team / organization 语义清理
**目标：** 继续清理 UI 和 API 中 organization/workspace/team 的混用文案与语义。  
**验收：** 产品文案层稳定为 workspace / team / member。

### Phase E — Planning / Initiative / Roadmap

#### task14 — Initiative 后端对象与 Project 关系收口
**目标：** 让 initiative、project 关系在后端与前端类型层面稳定可用。  
**验收：** initiative 不再是漂在仓库里的孤立 CRUD。

#### task15 — Initiative 页面最小闭环
**目标：** 提供 initiative 列表 / 基本详情 / 与项目关联信息。  
**验收：** 至少形成一条可用的 planning 主路径。

### Phase F — 质量、对齐与收口

#### task16 — 关键 Linear 路由壳对齐
**目标：** 对齐关键路由信息架构：issues / projects / inbox / members / views / initiatives。  
**验收：** 主导航与页面壳层次基本稳定。

#### task17 — 交互与文案对齐回合
**目标：** 针对明显偏离 Linear 的状态文案、按钮命名、空态和信息密度做一轮系统收口。  
**验收：** 形成一批产品层回归截图或检查项。

#### task18 — 端到端验收补齐
**目标：** 新增并执行围绕 projects / views / inbox / members / initiatives 的验收测试。  
**验收：** 关键手动/自动验收路径可执行并记录结果。

#### task19 — 文档 / 基线 / logbook / worktime 对齐
**目标：** 在阶段性完成后，更新 `design-baseline`、`plan-baseline`、`dev-logbook`、`worktime`。  
**验收：** 文档与代码不再明显漂移。

#### task20 — 发布前收口
**目标：** 整理剩余高价值 bug、回归验证、最终演示说明。  
**验收：** 形成可持续继续推进的稳定主线。

---

## 3. 当前执行策略

- 当前进入 **Phase A / task01**
- 首个执行单元从 **`task01a`：梳理并锁定 issue/project 共享 queryState DTO 与前后端差异** 开始
- 该 task 应优先产出：
  - 差异清单
  - 统一 DTO / TS type / Kotlin response contract
  - 对应最小回归测试
  - 状态文件写回下一任务

---

## 4. 推荐验证命令

### 文档 / 配置类
- `git diff --check`

### 前端
- `cd /opt/data/projects/Cruise/frontend && npm test`
- `cd /opt/data/projects/Cruise/frontend && npm run build`

### 后端
- `cd /opt/data/projects/Cruise && ./gradlew :backend:test`
- `cd /opt/data/projects/Cruise && ./gradlew :backend:compileKotlin`

### 综合
- `git status --short`
- `git log --oneline --decorate -8`

---

## 5. 提交规范

- Git author 使用：`offic0600 <offic0600@163.com>`
- commit 尽量使用 verified 风格，例如：
  - `[verified] feat: unify project and issue view query state`
  - `[verified] docs: add linear parity roadmap state`

---

## 6. 结束条件

达到以下条件时，可认为 Cruise 已进入“Linear 高保真复刻可持续演进态”：

1. issue / project / members / inbox / initiatives 均有稳定路由与共享内核支撑
2. view / favorite / subscription / membership 对象边界清晰
3. 关键页面不再依赖临时拼接状态
4. 文档、状态源、测试、提交节奏稳定
5. 后续新增页面可在现有内核上低摩擦扩展
