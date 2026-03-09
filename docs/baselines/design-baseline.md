# Cruise — 设计基线

> **定位**：实现驱动，记录"我们造了什么"。每个 Phase 结束后对照实际代码更新。
> **交叉校验**：Phase 结束时先更新本文件，再与规划基线（plan-baseline.md）交叉校验。
> **当前版本**：v1.1（Phase 0 验收完成）

---

## 一、项目结构（当前）

```
Cruise/
├── CLAUDE.md                          # 项目级 AI 配置
├── README.md
├── LICENSE
├── backend/                           # Spring Boot 后端
│   ├── build.gradle.kts               # Gradle 构建配置
│   └── src/main/
│       ├── kotlin/com/cruise/
│       │   ├── CruiseApplication.kt   # 启动类
│       │   └── controller/
│       │       └── HealthController.kt
│       └── resources/
│           ├── application.yml         # 应用配置
│           └── db/migration/
│               └── V1__init_schema.sql # 数据库初始化
├── frontend/                          # Next.js 前端
│   ├── package.json
│   ├── next.config.js
│   └── src/app/
│       ├── layout.tsx
│       └── page.tsx
├── docs/
│   ├── index.md
│   ├── ai-coding-best-practices.md
│   ├── planning/
│   │   ├── dev-logbook.md
│   │   └── plan-baseline.md
│   ├── baselines/
│   │   └── design-baseline.md
│   └── acceptance-tests/
│       └── phase0.md
└── references/
```

**代码文件**：约 15 个

---

## 二、技术栈（已确定）

| 层 | 技术 | 版本 |
|----|------|------|
| 后端语言 | Kotlin | 1.9+ |
| 后端框架 | Spring Boot | 3.2.5 |
| 运行时 | JDK | 23 (兼容 21) |
| 前端框架 | React + Next.js | 15，App Router |
| 前端语言 | TypeScript | strict |
| 数据库 | H2 | 2.2 (embedded) |
| 后端构建 | Gradle Kotlin DSL | 8.x |
| 前端包管理 | npm | — |

---

## 三、API 端点（当前）

| 端点 | 方法 | 描述 | 状态 |
|------|------|------|------|
| /actuator/health | GET | 健康检查 | ✅ 已实现 |
| /actuator/info | GET | 应用信息 | ✅ 已实现 |
| /h2-console | GET | H2 控制台 | ✅ 已实现（开发用） |

---

## 四、数据模型（当前）

> Phase 0 完成，5 张核心表已定义。

### 核心实体

| 表名 | 用途 | 字段数 |
|------|------|--------|
| project | 项目 | 7 |
| requirement | 需求 | 8 |
| task | 任务 | 9 |
| team_member | 团队成员 | 6 |
| defect | 缺陷 | 9 |

### DDL（H2 兼容）

```sql
-- 见 backend/src/main/resources/db/migration/V1__init_schema.sql
-- 使用 AUTO_INCREMENT 替代 BIGSERIAL
-- 使用 MODE=PostgreSQL 兼容语法
```

---

## 五、模块结构（当前）

```
backend/           # Spring Boot 后端
  └── src/main/kotlin/com/cruise/
      ├── CruiseApplication.kt      # 启动类
      └── controller/
          └── HealthController.kt   # 健康检查控制器

frontend/          # Next.js 前端
  └── src/app/
      ├── layout.tsx                # 根布局
      └── page.tsx                  # 首页
```

---

## 六、测试覆盖

| 类型 | 数量 | 通过率 |
|------|------|--------|
| 单元测试 | 0 | — |
| E2E 验收测试 | 3 | S1/S2/S3 已验证 |

---

## 七、已知 Bug

> 暂无。

---

## 八、关键数字快照

| 指标 | 值 | 更新时间 |
|------|-----|---------|
| 文件总数 | ~15 | 2026-03-07 |
| 代码行数 | ~500 | 2026-03-07 |
| API 端点数 | 3 | 2026-03-07 |
| 数据库表数 | 5 | 2026-03-07 |
| 单元测试数 | 0 | 2026-03-07 |

---

## 变更历史

| 版本 | 日期 | Phase | 变更摘要 |
|------|------|-------|---------|
| v0.1 | 2026-03-06 | Phase 0 起点 | 初始化，尚无代码实现 |
| v1.0 | 2026-03-07 | Phase 0 完成 | 骨架搭建 + 5张核心表 + H2数据库 |
| v1.1 | 2026-03-07 | Phase 0 验收 | 10/12 测试通过 + 基线交叉校验 |

---

*版本：v1.1*
*创建：2026-03-06*
*更新：2026-03-07*
*下次更新时机：Phase 1 完成后*