# Cruise — 开发日志（Dev Logbook）

> 持续更新的开发日志，记录每次 Session 的关键动作、决策和进展。
> 每 5 个 Session 做一次全量审查（格式统一、去重、清理过时内容）。

---

## Session 1 — 2026-03-06：项目启动 + 技术选型

**目标**：了解项目全貌，建立文档基础设施，完成技术选型。

### 1.1 实施内容

| 操作 | 文件 | 说明 |
|------|------|------|
| 阅读 | `CLAUDE.md` | 理解 Cruise 项目定位、架构原则、Phase 路线图 |
| 阅读 | `references/` | 全量阅读 Forge 参考文档（架构、方法论、Logbook、基线等） |
| 新增 | `docs/ai-coding-best-practices.md` | 基于 Forge 28 Session 提炼的 AI Coding 最佳实践指南 |
| 新增 | `docs/planning/dev-logbook.md` | 本文件，开发日志初始化 |
| 新增 | `docs/planning/plan-baseline.md` | 规划基线 v0.1 初始化 |
| 新增 | `docs/baselines/design-baseline.md` | 设计基线 v0.1 初始化（Phase 0 起点） |
| 新增 | `docs/acceptance-tests/phase0.md` | Phase 0 验收场景（场景先行） |
| 新增 | `docs/index.md` | 文档导航 |
| 修改 | `CLAUDE.md` | 补充技术栈选型结果，版本升至 v1.1 |

### 1.2 技术选型决策

| 维度 | 选择 | 理由 |
|------|------|------|
| 后端 | Kotlin + Spring Boot 3.x / JDK 21 | Forge 已验证，企业级成熟，AI Coding 友好 |
| 前端 | React + Next.js 15（App Router）+ TypeScript | Forge 已验证，生态最成熟 |
| 数据库 | PostgreSQL 16 | 功能全，支持 JSON，开源免费 |
| 部署 | 本地裸跑优先，后期 Docker Compose | Phase 0 快速启动，减少环境复杂度 |
| 构建 | Gradle Kotlin DSL + npm | 与技术栈匹配 |

### 1.3 Bug 记录

无（本 Session 为纯文档 + 规划工作）。

### 1.4 经验沉淀

- references/ 是只读参考目录，本项目文档均写入 docs/
- 先建文档基础设施（Logbook + 双基线 + 验收测试），再动代码
- Phase 0 验收场景应在骨架搭建前写好（场景先行原则）

### 1.5 统计快照

| 指标 | 值 |
|------|-----|
| 文件总数 | 7（docs/ 下） |
| 代码文件 | 0 |
| 单元测试 | 0 |
| 验收场景 | Phase 0：4 场景 / 12 用例 |
| Git Commits | 2 |

### 1.6 Git Commit

`3047885` — `docs: add AI coding best practices and project docs structure`
`[下次提交 hash]` — `docs: initialize project documentation infrastructure`

---

> *下次 Session 开始时，先读本文件最后一条记录恢复上下文。*
