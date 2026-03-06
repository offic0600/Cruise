# IT需求开发过程管理平台 — 设计基线 v1

> 基线日期: 2026-03-05 | 版本: v1.0
> 本文档定义 IT 需求开发过程管理平台的完整设计方案。
> 任何对本文档覆盖范围的修改，必须先意识到偏离、再决定是否接受。

---

## 一、目标与定位

### 1.1 平台目标

构建一套**IT需求开发过程管理平台**，实现：

1. **需求统一接收**：从 ALM 系统自动/手动获取业务需求，统一入口管理
2. **过程可视化**：实时展示需求开发状态、任务进度、团队负载
3. **交付可分析**：多维度数据分析，支持交付效率、风险预警、趋势预测
4. **多团队支持**：支持集团级多团队、多项目的统一管理

### 1.2 平台定位

```
                    不是什么                              是什么
            ─────────────────────────         ─────────────────────────────
            单一项目管理工具                    集团级IT需求开发过程管理平台
            仅支持单一团队                      多团队/多项目统一管理
            离线手工维护                        自动采集 + 手动维护结合
            单一数据源                          ALM + GitLab + 手工多源融合
            事后统计分析                        实时可视化 + 预警 + 趋势分析
```

### 1.3 核心判断

- **过程数据是核心资产**：开发过程中的状态、耗时、风险等数据是持续优化的基础
- **多源融合是趋势**：ALM 需求 + GitLab 提交 + 手工维护，形成完整数据视图
- **可视化驱动管理**：让管理者实时掌握全局，辅助决策
- **数据驱动改进**：基于历史数据建立效率基线，识别改进点

---

## 二、设计原则

| # | 原则 | 说明 | 反模式 |
|---|------|------|--------|
| 1 | 多团队统一视图 | 集团级平台，支持多团队、多项目的聚合和下钻 | 各团队独立系统，数据孤岛 |
| 2 | 多源数据融合 | ALM 需求 + GitLab 代码 + 手工维护，形成完整视图 | 单一数据源，信息不完整 |
| 3 | 实时可视化 | 状态、进度、负载实时更新，支持管理决策 | 事后统计，延迟滞后 |
| 4 | 风险预警 | 基于阈值和规则，主动预警逾期/风险 | 被动发现问题，救火式管理 |
| 5 | 效率可度量 | 建立基线，支持提效对比和趋势分析 | 效率不可量化，无法持续改进 |
| 6 | 可扩展对接 | ALM/GitLab 等系统预留对接设计，插件化接入 | 硬编码特定系统，扩展困难 |
| 7 | 角色化视图 | 不同角色（高管/PM/开发/业务）看到不同粒度的视图 | 所有用户同一视图，信息过载或不足 |

---

## 三、整体方案

### 3.1 核心业务流

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│    接收需求 ──────────→ 维护过程信息 ──────────→ 看板可视化                  │
│         │                      │                        │                   │
│         ▼                      ▼                        ▼                   │
│   ┌───────────┐          ┌───────────┐           ┌───────────┐            │
│   │ALM系统    │          │需求任务   │           │综合看板   │            │
│   │导入/手动  │          │状态维护   │           │需求看板   │            │
│   └─────┬─────┘          └─────┬─────┘           │开发任务   │            │
│         │                      │                 │团队负载   │            │
│         │                      │                 │交付趋势   │            │
│         │                      │                 └─────┬─────┘            │
│         │                      │                       │                   │
│         │              ┌───────┴───────┐              │                   │
│         │              │               │              │                   │
│         ▼              ▼               ▼              ▼                   │
│   ┌─────────────────────────────────────────────────────────────┐          │
│   │                    数据聚合层                               │          │
│   │  项目信息 │ 需求信息 │ 任务信息 │ 工时信息 │ GitLab │ ...  │          │
│   └─────────────────────────────────────────────────────────────┘          │
│                                 │                                          │
│                                 ▼                                          │
│   ┌─────────────────────────────────────────────────────────────┐          │
│   │                    分析引擎                                  │          │
│   │  效率分析 │ 趋势预测 │ 风险预警 │ 负载分析 │ ...          │          │
│   └─────────────────────────────────────────────────────────────┘          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 数据流设计

```
                    ┌─────────────┐
                    │   ALM系统   │  (预留对接)
                    └──────┬──────┘
                           │ API 拉取
                           ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                              数据模型                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  项目    │  │  需求    │  │  任务    │  │  人员    │  │  GitLab │        │
│  │ Project  │  │  Demand  │  │  Task    │  │  Member  │  │ Commit  │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│       │             │             │             │                            │
│       └─────────────┴─────────────┴─────────────┘                            │
│                              │                                               │
│                              ▼                                               │
│                    ┌─────────────────┐                                       │
│                    │   交付过程信息   │  (核心实体)                          │
│                    │ DeliveryProcess │                                       │
│                    │ - 需求ID         │                                       │
│                    │ - 任务状态        │                                       │
│                    │ - 负责人         │                                       │
│                    │ - 计划/实际工时   │                                       │
│                    │ - 风险           │                                       │
│                    │ - 进度           │                                       │
│                    │ - GitLab MR      │                                       │
│                    └─────────────────┘                                       │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 系统架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         用户交互层                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  IT高管视图  │  │ 项目经理视图 │  │  开发人员视图 │  │  业务方视图  │        │
│  │  综合看板    │  │ 项目/需求    │  │ 我的任务     │  │ 需求进度    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────────────────┐
│                         API 网关层                                           │
│         /api/projects  /api/demands  /api/tasks  /api/dashboard            │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────────────────┐
│                         业务服务层                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ 项目管理    │  │ 需求管理    │  │ 任务管理    │  │ 看板服务    │        │
│  │ ProjectSvc  │  │ DemandSvc   │  │ TaskSvc     │  │ DashboardSvc│        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ 集成服务    │  │ 分析服务    │  │ 预警服务    │  │ 导出服务    │        │
│  │ Integration │  │ Analytics   │  │ AlertSvc    │  │ ExportSvc   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────────────────┐
│                         数据访问层                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Repository Layer                                 │   │
│  │  ProjectRepo  DemandRepo  TaskRepo  MemberRepo  AlertRepo           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    External Adapter                                │   │
│  │  AlmAdapter (预留)  GitLabAdapter (预留)  FileAdapter              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────────────────┐
│                         数据存储层                                           │
│                    PostgreSQL (主存储)                                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 四、数据模型设计

### 4.1 核心实体

#### 4.1.1 项目 (Project)

| 字段 | 类型 | 说明 | 必填 |
|------|------|------|------|
| id | UUID | 主键 | 是 |
| project_code | String | 项目编码（五级项目） | 是 |
| project_name | String | 项目名称 | 是 |
| level1_project | String | 一级项目 | 否 |
| level2_project | String | 二级项目 | 否 |
| level3_project | String | 三级项目 | 否 |
| level4_project | String | 四级项目 | 否 |
| level5_project | String | 五级项目 | 是 |
| belong_unit | String | 归属小微 | 是 |
| year | Integer | 年度 | 是 |
| plan_start_date | Date | 计划开始时间 | 是 |
| expected_delivery_date | Date | 期望交付时间 | 是 |
| priority | String | 优先级（P0/P1/P2/...） | 否 |
| project_leader | String | 项目负责人（团队长/链群主） | 是 |
| product_designer | String | 产品设计人员 | 否 |
| planned_developer | String | 计划开发人员 | 否 |
| actual_developer | String | 实际开发人员 | 否 |
| status | Enum | 状态（待开发/开发中/验证/发布/已完成/已下线） | 是 |
| progress | Integer | 整体进度（0-100%） | 是 |
| delivery_mode | String | 交付模式 | 否 |
| ai_delivery_type | String | AI交付类型 | 否 |
| estimated_man_days | Decimal | 评估人天（条目法） | 否 |
| planned_man_days | Decimal | 计划人天 | 否 |
| actual_man_days | Decimal | 实际人天 | 否 |
| efficiency_baseline | Decimal | 效率基线 | 否 |
| efficiency_target | Decimal | 效率目标 | 否 |
| efficiency_actual | Decimal | 交付效率（倍） | 否 |
| delivery_code_lines | Integer | 交付代码行数 | 否 |
| app_s_code | String | 应用S码 | 否 |
| involved_apps | String | 涉及应用 | 否 |
| supplier | String | 供应商 | 否 |
| project_type | String | 项目类型 | 否 |
| resource_plan | String | 资源方案 | 否 |
| project_risk | String | 项目风险 | 否 |
| project_progress | String | 项目进展 | 否 |
| alm_id | String | ALM系统ID（预留对接） | 否 |
| gitlab_project_id | String | GitLab项目ID（预留对接） | 否 |
| created_by | String | 创建人 | 是 |
| created_at | DateTime | 创建时间 | 是 |
| updated_at | DateTime | 更新时间 | 是 |

#### 4.1.2 需求 (Demand)

| 字段 | 类型 | 说明 | 必填 |
|------|------|------|------|
| id | UUID | 主键 | 是 |
| project_id | UUID | 关联项目ID | 是 |
| demand_code | String | 需求编码 | 是 |
| demand_name | String | 需求名称 | 是 |
| demand_desc | Text | 需求描述 | 否 |
| task_desc | Text | 任务描述 | 否 |
| belong_unit | String | 需求所属小微 | 是 |
| belong_battle_plan | String | 需求所属作战计划 | 否 |
| battle_plan_code | String | 作战计划编码 | 否 |
| priority | String | 优先级 | 否 |
| status | Enum | 状态（待处理/开发中/开发&提测/验证/发布&上线/已完成） | 是 |
| progress | Integer | 进度（0-100%） | 是 |
| plan_start_date | Date | 计划开始时间 | 是 |
| plan_end_date | Date | 计划完成时间 | 是 |
| ai_plan_end_date | Date | AI提效后完成时间 | 否 |
| actual_start_date | Date | 实际开始时间 | 否 |
| actual_end_date | Date | 实际完成时间 | 否 |
| planned_man_days | Decimal | 计划人天（条目法） | 否 |
| ai_planned_man_days | Decimal | 计划人天（AI赋能后） | 否 |
| remaining_man_days | Decimal | 剩余人天 | 否 |
| supplier_man_days | Decimal | 供应商参与人天 | 否 |
| efficiency | Decimal | 提效比例（%） | 否 |
| is_overdue | Boolean | 是否逾期 | 是 |
| remaining_days | Integer | 剩余天数 | 否 |
| risk | String | 风险 | 否 |
| dev_leader | String | 开发负责人 | 是 |
| dev_team | String | 所属团队 | 是 |
| app_s_code | String | 应用S码 | 否 |
| project_tags | String | 项目标签 | 否 |
| ai_delivery_type | String | AI交付类型 | 否 |
| delivery_mode | String | 交付模式 | 否 |
| delivery_30_days | Boolean | 30天内交付 | 否 |
| delivery_10_days | Boolean | 10天内交付 | 否 |
| delivery_5_days | Boolean | 5天内交付 | 否 |
| expected_delivery_date | Date | 期望交付日期 | 否 |
| alm_id | String | ALM需求ID（预留对接） | 否 |
| gitlab_mr_ids | String | GitLab MR IDs（预留对接） | 否 |
| created_by | String | 创建人 | 是 |
| created_at | DateTime | 创建时间 | 是 |
| updated_at | DateTime | 更新时间 | 是 |

#### 4.1.3 任务 (Task)

| 字段 | 类型 | 说明 | 必填 |
|------|------|------|------|
| id | UUID | 主键 | 是 |
| demand_id | UUID | 关联需求ID | 是 |
| task_name | String | 任务名称 | 是 |
| task_desc | Text | 任务描述 | 否 |
| status | Enum | 状态（待处理/进行中/已完成/已取消） | 是 |
| priority | Integer | 优先级（数字越小越高） | 否 |
| assignee | String | 负责人 | 是 |
| estimated_hours | Decimal | 预估工时（小时） | 否 |
| actual_hours | Decimal | 实际工时（小时） | 否 |
| start_date | Date | 计划开始日期 | 否 |
| end_date | Date | 计划结束日期 | 否 |
| actual_start_date | Date | 实际开始日期 | 否 |
| actual_end_date | Date | 实际完成日期 | 否 |
| dependencies | String | 依赖任务（JSON数组） | 否 |
| gitlab_mr_id | String | GitLab MR ID（预留对接） | 否 |
| created_by | String | 创建人 | 是 |
| created_at | DateTime | 创建时间 | 是 |
| updated_at | DateTime | 更新时间 | 是 |

#### 4.1.4 人员 (Member)

| 字段 | 类型 | 说明 | 必填 |
|------|------|------|------|
| id | UUID | 主键 | 是 |
| user_id | String | 用户ID | 是 |
| user_name | String | 用户姓名 | 是 |
| email | String | 邮箱 | 否 |
| phone | String | 手机号 | 否 |
| unit | String | 所属小微/部门 | 是 |
| team | String | 所属团队 | 是 |
| role | Enum | 角色（PM/开发/测试/产品/业务方/高管） | 是 |
| skills | String | 技能（JSON数组） | 否 |
| gitlab_user_id | String | GitLab用户ID（预留对接） | 否 |
| is_active | Boolean | 是否在职 | 是 |
| created_at | DateTime | 创建时间 | 是 |
| updated_at | DateTime | 更新时间 | 是 |

#### 4.1.5 交付过程 (DeliveryProcess)

| 字段 | 类型 | 说明 | 必填 |
|------|------|------|------|
| id | UUID | 主键 | 是 |
| demand_id | UUID | 关联需求ID | 是 |
| current_stage | Enum | 当前阶段（需求分析/设计/开发/测试/验证/发布） | 是 |
| status | Enum | 状态（待处理/进行中/已完成/已阻塞/已延期） | 是 |
| progress | Integer | 进度（0-100%） | 是 |
| dev_leader | String | 开发负责人 | 是 |
| planned_hours | Decimal | 计划工时 | 否 |
| actual_hours | Decimal | 实际工时 | 否 |
| remaining_hours | Decimal | 剩余工时 | 否 |
| risk_level | Enum | 风险等级（无/低/中/高） | 是 |
| risk_desc | String | 风险描述 | 否 |
| blocker | String | 阻塞项 | 否 |
| milestone_date | Date | 里程碑日期 | 否 |
| milestone_status | Enum | 里程碑状态（按期/预警/延期/完成） | 否 |
| stage_history | JSON | 阶段变更历史 | 是 |
| created_at | DateTime | 创建时间 | 是 |
| updated_at | DateTime | 更新时间 | 是 |

### 4.2 枚举定义

#### 4.2.1 项目状态 (ProjectStatus)

| 值 | 说明 |
|---|------|
| PENDING | 待开发 |
| DEVELOPMENT | 开发中 |
| TESTING | 验证中 |
| RELEASED | 已发布 |
| COMPLETED | 已完成 |
| OFFLINE | 已下线 |

#### 4.2.2 需求状态 (DemandStatus)

| 值 | 说明 |
|---|------|
| PENDING | 待处理 |
| IN_PROGRESS | 开发中 |
| TESTING | 开发&提测 |
| VALIDATING | 验证 |
| RELEASING | 发布&上线 |
| COMPLETED | 已完成 |

#### 4.2.3 任务状态 (TaskStatus)

| 值 | 说明 |
|---|------|
| TODO | 待处理 |
| IN_PROGRESS | 进行中 |
| DONE | 已完成 |
| CANCELLED | 已取消 |

#### 4.2.4 风险等级 (RiskLevel)

| 值 | 说明 |
|---|------|
| NONE | 无 |
| LOW | 低 |
| MEDIUM | 中 |
| HIGH | 高 |

#### 4.2.5 用户角色 (UserRole)

| 值 | 说明 |
|---|------|
| EXECUTIVE | IT高管 |
| PM | 项目经理 |
| DEVELOPER | 开发人员 |
| TESTER | 测试人员 |
| PRODUCT | 产品经理 |
| BUSINESS | 业务方 |
| OPERATIONS | 运维人员 |

---

## 五、API 设计

### 5.1 项目管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/projects | 获取项目列表（分页、筛选、排序） |
| GET | /api/projects/{id} | 获取项目详情 |
| POST | /api/projects | 创建项目 |
| PUT | /api/projects/{id} | 更新项目 |
| DELETE | /api/projects/{id} | 删除项目 |
| GET | /api/projects/{id}/demands | 获取项目下的需求列表 |
| GET | /api/projects/{id}/stats | 获取项目统计信息 |

### 5.2 需求管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/demands | 获取需求列表（分页、筛选、排序） |
| GET | /api/demands/{id} | 获取需求详情 |
| POST | /api/demands | 创建需求 |
| PUT | /api/demands/{id} | 更新需求 |
| DELETE | /api/demands/{id} | 删除需求 |
| POST | /api/demands/import | 从ALM导入需求（预留） |
| GET | /api/demands/{id}/tasks | 获取需求下的任务列表 |
| PUT | /api/demands/{id}/status | 更新需求状态 |

### 5.3 任务管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/tasks | 获取任务列表 |
| GET | /api/tasks/{id} | 获取任务详情 |
| POST | /api/tasks | 创建任务 |
| PUT | /api/tasks/{id} | 更新任务 |
| DELETE | /api/tasks/{id} | 删除任务 |
| PUT | /api/tasks/{id}/status | 更新任务状态 |

### 5.4 看板

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/dashboard/summary | 综合看板汇总数据 |
| GET | /api/dashboard/demands | 需求看板数据 |
| GET | /api/dashboard/tasks | 开发任务看板数据 |
| GET | /api/dashboard/team-load | 团队负载数据 |
| GET | /api/dashboard/member-load | 人员负载数据 |
| GET | /api/dashboard/trends | 交付趋势数据 |
| GET | /api/dashboard/alerts | 预警列表 |

### 5.5 集成（预留）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/integration/alm/sync | 从ALM同步需求 |
| POST | /api/integration/alm/import | 导入ALM需求 |
| GET | /api/integration/alm/status | ALM对接状态 |
| GET | /api/integration/gitlab/projects | GitLab项目列表（预留） |
| GET | /api/integration/gitlab/commits | GitLab提交记录（预留） |
| GET | /api/integration/gitlab/mrs | GitLab MR列表（预留） |

---

## 六、看板设计

### 6.1 综合看板

#### 6.1.1 IT高管视图

| 模块 | 内容 |
|------|------|
| 交付概览 | 本月交付需求数、在途需求数、逾期需求数、交付效率趋势 |
| 团队健康 | 各团队负载率、风险预警数量、人员利用率 |
| 趋势分析 | 需求交付趋势（周/月）、工时消耗趋势、效率提升趋势 |
| 风险全景 | 高风险需求列表、预警需求列表、阻塞项汇总 |

#### 6.1.2 项目经理视图

| 模块 | 内容 |
|------|------|
| 项目总览 | 项目进度、需求状态分布、里程碑状态 |
| 需求看板 | 需求Kanban（按状态分组）、拖拽更新状态 |
| 团队负载 | 团队成员负载分布、任务分配情况 |
| 风险跟踪 | 当前风险列表、逾期风险预警 |

#### 6.1.3 开发人员视图

| 模块 | 内容 |
|------|------|
| 我的任务 | 待处理任务、进行中任务、已完成任务 |
| 任务详情 | 任务描述、计划/实际工时、截止日期、关联需求 |
| 代码提交 | GitLab MR 链接（预留）、提交记录（预留） |

### 6.2 看板数据接口

#### 6.2.1 综合看板汇总接口

响应示例：

```json
{
  "summary": {
    "total_projects": 45,
    "total_demands": 328,
    "in_progress_demands": 87,
    "completed_demands_this_month": 23,
    "overdue_demands": 12,
    "efficiency_trend": [
      {"month": "2025-11", "efficiency": 1.8},
      {"month": "2025-12", "efficiency": 2.1},
      {"month": "2026-01", "efficiency": 2.3},
      {"month": "2026-02", "efficiency": 2.5}
    ]
  },
  "team_load": [
    {
      "team": "开发团队A",
      "member_count": 8,
      "total_capacity_hours": 1600,
      "assigned_hours": 1450,
      "load_rate": 90.6,
      "members": [
        {"name": "张三", "load_rate": 95},
        {"name": "李四", "load_rate": 88}
      ]
    }
  ],
  "alerts": [
    {
      "type": "OVERDUE",
      "demand_name": "权限系统增加根据orgcodelist批量查询租户",
      "dev_leader": "谭嘉男",
      "expected_date": "2026-03-04",
      "overdue_days": 2
    }
  ],
  "demand_status_dist": [
    {"status": "待处理", "count": 45},
    {"status": "开发中", "count": 56},
    {"status": "开发&提测", "count": 23},
    {"status": "验证", "count": 12},
    {"status": "发布&上线", "count": 8},
    {"status": "已完成", "count": 184}
  ]
}
```

---

## 七、外部系统对接设计（预留）

### 7.1 ALM 系统对接

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ALM Adapter (预留)                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  接口定义:                                                                   │
│    - AlmClient: ALM 客户端抽象                                               │
│    - AlmProjectMapper: 项目映射                                              │
│    - AlmDemandMapper: 需求映射                                               │
│                                                                             │
│  对接方式:                                                                   │
│    - REST API 轮询拉取                                                       │
│    - WebHook 推送（若ALM支持）                                              │
│    - 定时同步（可配置间隔）                                                  │
│                                                                             │
│  配置项:                                                                    │
│    ALM_API_URL: ALM系统API地址                                               │
│    ALM_API_KEY: API密钥                                                     │
│    ALM_SYNC_INTERVAL: 同步间隔（默认30分钟）                                  │
│                                                                             │
│  数据映射:                                                                  │
│    ALM Project → Project 实体                                               │
│    ALM Requirement → Demand 实体                                            │
│    ALM Task → Task 实体                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 GitLab 对接

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          GitLab Adapter (预留)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  接口定义:                                                                   │
│    - GitLabClient: GitLab客户端抽象                                          │
│    - GitLabProjectMapper: 项目映射                                           │
│    - GitLabCommitMapper: 提交映射                                            │
│    - GitLabMRMapper: MR映射                                                  │
│                                                                             │
│  对接方式:                                                                   │
│    - GitLab REST API                                                        │
│    - GitLab WebHook（预留）                                                 │
│                                                                             │
│  配置项:                                                                    │
│    GITLAB_URL: GitLab服务地址                                                │
│    GITLAB_TOKEN: 访问Token                                                  │
│                                                                             │
│  数据映射:                                                                  │
│    GitLab Project → 关联项目                                                 │
│    GitLab MR → 需求/任务关联                                                 │
│    GitLab Commit → 代码行数统计                                              │
│                                                                             │
│  预留功能:                                                                  │
│    - 项目与GitLab仓库关联                                                    │
│    - MR与需求/任务自动关联                                                   │
│    - 提交记录统计                                                            │
│    - 代码行数统计                                                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 八、技术设计

### 8.1 技术栈

| 层 | 技术 | 说明 |
|---|---|---|
| 后端 | Python 3.10+ | 主要开发语言 |
| Web框架 | FastAPI | 高性能API框架 |
| ORM | SQLAlchemy + Pydantic | 数据模型与验证 |
| 数据库 | PostgreSQL 14+ | 主存储 |
| 迁移工具 | Alembic | 数据库版本管理 |
| 任务调度 | APScheduler | 定时任务 |
| 认证 | JWT | 用户认证 |
| API文档 | FastAPI + Swagger | 自动生成 |

### 8.2 项目结构

```
it-delivery-platform/
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── projects.py
│   │   │   ├── demands.py
│   │   │   ├── tasks.py
│   │   │   ├── dashboard.py
│   │   │   └── integration.py
│   │   └── deps.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── constants.py
│   ├── models/
│   │   ├── project.py
│   │   ├── demand.py
│   │   ├── task.py
│   │   ├── member.py
│   │   └── delivery_process.py
│   ├── schemas/
│   │   ├── project.py
│   │   ├── demand.py
│   │   ├── task.py
│   │   ├── dashboard.py
│   │   └── common.py
│   ├── services/
│   │   ├── project_service.py
│   │   ├── demand_service.py
│   │   ├── task_service.py
│   │   ├── dashboard_service.py
│   │   ├── alert_service.py
│   │   └── integration_service.py
│   ├── repositories/
│   │   ├── project_repo.py
│   │   ├── demand_repo.py
│   │   ├── task_repo.py
│   │   └── member_repo.py
│   ├── adapters/
│   │   ├── alm_adapter.py  # 预留
│   │   └── gitlab_adapter.py  # 预留
│   └── utils/
│       ├── date_utils.py
│       └── export_utils.py
├── alembic/
│   └── versions/
├── tests/
│   ├── api/
│   ├── services/
│   └── fixtures/
├── pyproject.toml
├── alembic.ini
└── README.md
```

### 8.3 数据库表

核心表结构对应上述数据模型，使用 SQLAlchemy ORM 定义。

---

## 九、用户角色与权限

### 9.1 角色定义

| 角色 | 权限 |
|------|------|
| IT高管 | 查看所有团队/项目的综合看板、预警、趋势分析 |
| 项目经理 | 管理项目/需求/任务，查看团队看板，维护过程信息 |
| 开发人员 | 查看/更新个人任务，查看需求详情 |
| 测试人员 | 查看/更新测试相关任务状态 |
| 产品经理 | 维护需求信息，查看需求看板 |
| 业务方 | 查看需求进度，提交新需求 |
| 运维人员 | 查看部署相关看板 |

### 9.2 权限矩阵

| 功能 | IT高管 | 项目经理 | 开发 | 测试 | 产品 | 业务 | 运维 |
|------|--------|----------|------|------|------|------|------|
| 综合看板 | ✅ | ✅ | 👀 | 👀 | 👀 | 👀 | 👀 |
| 项目管理 | 查看 | 增删改 | 查看 | - | - | - | - |
| 需求管理 | 查看 | 增删改 | 查看 | 查看 | 增删改 | 查看 | - |
| 任务管理 | 查看 | 增删改 | 增删改 | 增删改 | - | - | - |
| 预警管理 | 查看 | 查看/处理 | 查看 | - | - | - | - |
| 数据导出 | ✅ | ✅ | - | - | - | - | - |

---

## 十、演进路线

### Phase 1：基础能力建设

| # | 交付物 | 说明 |
|---|--------|------|
| 1 | 项目/需求/任务 CRUD | 基础数据管理 |
| 2 | 综合看板 | 需求、开发任务、团队负载、交付趋势 |
| 3 | 预警机制 | 逾期预警、风险标记 |
| 4 | 数据导入 | CSV/Excel 导入 |
| 5 | 用户认证 | JWT 认证 + 角色权限 |

**验收标准**：
- [ ] 项目/需求/任务增删改查正常
- [ ] 综合看板数据准确展示
- [ ] 逾期预警正确触发
- [ ] CSV数据可导入

### Phase 2：集成增强

| # | 交付物 | 说明 |
|---|--------|------|
| 1 | ALM对接 | 从ALM系统拉取需求（预留接口实现） |
| 2 | GitLab集成 | 代码提交关联（预留接口实现） |
| 3 | 高级分析 | 效率分析、趋势预测 |
| 4 | 甘特图 | 项目/需求排期可视化 |

**验收标准**：
- [ ] ALM对接模块可配置
- [ ] GitLab对接模块可配置
- [ ] 效率分析图表正常

### Phase 3：智能化提升

| # | 交付物 | 说明 |
|---|--------|------|
| 1 | 智能预警 | 基于历史数据的延期预测 |
| 2 | 资源优化 | 智能推荐任务分配 |
| 3 | 移动端 | 移动端适配 |

---

## 十一、变更记录

| 版本 | 日期 | 变更说明 |
|------|------|---------|
| v1.0 | 2026-03-05 | 初始基线 |

> 基线版本: v1.0 | 基线日期: 2026-03-05