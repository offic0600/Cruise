# CLAUDE.md — Cruise：IT需求开发过程管理平台

> 每个新 Session 启动时，请先读取此文件，恢复项目状态。
> 当前阶段：**Phase 1 开发中**（Sprint 1.1 起步）

---

## 交互偏好

- **语言**：使用中文回复（代码注释可英文）
- **风格**：行动优先，不做冗余解释；直接给出方案 + 关键理由
- **Plan Mode**：涉及 5+ 文件修改、新建模块、架构调整时，必须先 Plan 再 Execute
- **Git**：每个逻辑变更一个 Commit，使用语义化前缀：`feat:` / `fix:` / `docs:` / `refactor:` / `test:`

---

## 项目概述

**Cruise** 是一套集团级 IT 需求开发过程管理平台，核心价值：

- **需求统一管理**：从 ALM 系统自动/手动获取业务需求，统一入口管理
- **过程可视化**：实时展示需求开发状态、任务进度、团队负载
- **交付可分析**：多维度分析，支持效率基线、风险预警、趋势预测
- **多团队支持**：集团级多团队、多项目统一管理

**核心实体关系**：
```
Project（项目，五级体系）
  └── Demand（需求）
        └── Task（任务）
Member（人员，跨项目）
```

---

## 技术栈

| 层次 | 技术 | 说明 |
|------|------|------|
| 后端 | Python 3.11 + FastAPI | REST API + Alembic 数据库迁移 |
| 前端 | React 18 + TypeScript | 管理端 + 看板 |
| 数据库 | PostgreSQL | 主存储，UUID 主键 |
| 认证 | JWT | 角色：PM / 开发 / 测试 / 产品 / 业务方 / 高管 |
| 集成（预留） | ALM 系统 / GitLab | 通过适配器层预留，不硬编码 |
| 容器 | Docker Compose | 本地开发环境 |

---

## 构建命令速查

```bash
# 启动本地依赖（PostgreSQL）
docker compose up -d

# 安装后端依赖
pip install -r requirements.txt

# 数据库迁移
alembic upgrade head

# 启动后端（开发模式）
uvicorn app.main:app --reload --port 8000

# 运行后端测试
pytest

# 启动前端（开发模式）
cd frontend && npm run dev

# 前端构建检查
cd frontend && npm run build

# 完整 Docker 构建（Phase 验收前使用）
docker compose up --build
```

API 文档：http://localhost:8000/docs（Swagger）

---

## 项目结构（规划中）

```
Cruise/
├── CLAUDE.md                        # 本文件
├── docs/
│   ├── design-baseline-it-delivery.md  # 设计基线（造了什么）
│   └── phase-breakdown-it-delivery.md  # Phase 分解（实施计划）
├── references/
│   └── planning/dev-logbook.md         # 开发日志
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI 入口
│   │   ├── models/                  # SQLAlchemy 模型
│   │   ├── schemas/                 # Pydantic 模式（请求/响应）
│   │   ├── routers/                 # API 路由
│   │   ├── services/                # 业务逻辑
│   │   ├── repositories/            # 数据访问层
│   │   └── adapters/                # 外部系统对接（ALM/GitLab，预留）
│   ├── alembic/                     # 数据库迁移脚本
│   └── tests/
└── frontend/
    ├── src/
    │   ├── pages/                   # 页面组件
    │   ├── components/              # 可复用组件
    │   ├── api/                     # API 调用层
    │   └── store/                   # 状态管理
    └── package.json
```

---

## Phase 路线图

| Phase | 目标 | 关键功能 | 状态 |
|-------|------|---------|------|
| Phase 1 | 基础能力建设 | 认证 + 项目/需求/任务管理 + 综合看板 + 预警 | **进行中** |
| Phase 2 | 数据分析增强 | 效率分析 + 趋势预测 + 负载分析 | 规划中 |
| Phase 3 | 系统集成 | ALM 对接 + GitLab 对接 + 导出功能 | 规划中 |

**Phase 1 Sprint 分解**：
- Sprint 1.1：项目骨架 + 用户认证（JWT，角色权限）
- Sprint 1.2：项目管理（CRUD + 五级项目体系）
- Sprint 1.3：需求管理（状态流转 + 进度追踪）
- Sprint 1.4：任务管理（分配 + 工时记录）
- Sprint 1.5：综合看板（数据聚合 + 多角色视图）
- Sprint 1.6：预警机制（逾期/风险/负载告警）

---

## 开发纪律

1. **先验收场景，后写代码**：每个 Sprint 开始前，先写验收测试场景标题 + 预期结果，再编码
2. **本地测试优先**：代码修改后先跑 `pytest` + `npm run build`，确认无误后再 Docker 重建
3. **数据库迁移必须可逆**：每次 Alembic 迁移必须实现 `upgrade` 和 `downgrade`
4. **Session 结束前**：更新 `references/planning/dev-logbook.md`（文件变更 + Bug + 经验沉淀）
5. **Phase 结束后**：更新 `docs/design-baseline-it-delivery.md`（记录已验证实现），提炼 CLAUDE.md 陷阱

---

## 质量门禁

| 指标 | 要求 |
|------|------|
| 单元测试通过率 | 100% |
| Phase 验收通过率 | ≥ 90% |
| P0 Bug 数 | 0（阻断发版） |
| API 接口有 Swagger 文档 | 100% |

---

## 已知陷阱

> 随项目推进持续补充，每次发现新坑必须在此记录。

- （项目启动阶段，陷阱清单待积累）

---

## 重要文档索引

| 文档 | 路径 | 用途 |
|------|------|------|
| 设计基线 | `docs/design-baseline-it-delivery.md` | 当前已验证的架构/数据模型/API 设计 |
| Phase 分解 | `docs/phase-breakdown-it-delivery.md` | 每个 Sprint 的交付物和验收标准 |
| 开发日志 | `references/planning/dev-logbook.md` | 历史 Session 记录，了解"为什么这样做" |
| AI 方法论 | `docs/ai-coding-methodology.md` | 本项目遵循的 AI Coding 开发方法论 |

---

*CLAUDE.md 版本：v1.0（项目启动）*
*项目：Cruise — IT需求开发过程管理平台*
*创建：2026-03-06*
