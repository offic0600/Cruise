# Cruise — 设计基线

> **定位**：实现驱动，记录"我们造了什么"。每个 Phase 结束后对照实际代码更新。
> **交叉校验**：Phase 结束时先更新本文件，再与规划基线（plan-baseline.md）交叉校验。
> **当前版本**：v0.1（Phase 0 起点 — 尚无代码）

---

## 一、项目结构（当前）

```
Cruise/
├── CLAUDE.md                          # 项目级 AI 配置
├── README.md
├── LICENSE
├── docs/
│   ├── index.md                       # 文档导航
│   ├── ai-coding-best-practices.md    # AI Coding 最佳实践
│   ├── planning/
│   │   ├── dev-logbook.md             # 开发日志
│   │   └── plan-baseline.md           # 规划基线
│   ├── baselines/
│   │   └── design-baseline.md         # 本文件
│   └── acceptance-tests/
│       └── phase0.md                  # Phase 0 验收场景
└── references/                        # Forge 参考文档（只读）
```

**代码文件**：0 个（Phase 0 骨架尚未建立）

---

## 二、技术栈（已确定）

| 层 | 技术 | 版本 |
|----|------|------|
| 后端语言 | Kotlin | 1.9+ |
| 后端框架 | Spring Boot | 3.x |
| 运行时 | JDK | 21 |
| 前端框架 | React + Next.js | 15，App Router |
| 前端语言 | TypeScript | strict |
| 数据库 | PostgreSQL | 16 |
| 后端构建 | Gradle Kotlin DSL | 8.x |
| 前端包管理 | npm | — |

---

## 三、API 端点（当前）

> Phase 0 尚无实现，待骨架建立后补充。

| 端点 | 方法 | 描述 | 状态 |
|------|------|------|------|
| /actuator/health | GET | 健康检查 | ⏳ 待实现 |

---

## 四、数据模型（当前）

> Phase 0 尚未完成数据模型设计，以下为初步规划，Phase 0 结束后精化。

### 核心实体（草稿）

```sql
-- 待 Phase 0 完成后补充正式 DDL
```

---

## 五、模块结构（当前）

> Phase 0 骨架建立后补充。预期结构：

```
（规划中）
backend/           # Spring Boot 后端（Gradle 子模块）
  └── src/main/kotlin/...
frontend/          # Next.js 前端
  └── src/app/...
```

---

## 六、测试覆盖

| 类型 | 数量 | 通过率 |
|------|------|--------|
| 单元测试 | 0 | — |
| E2E 验收测试 | 0（场景已写，待执行） | — |

---

## 七、已知 Bug

> 暂无。

---

## 八、关键数字快照

| 指标 | 值 | 更新时间 |
|------|-----|---------|
| 文件总数 | 7 | 2026-03-06 |
| 代码行数 | 0 | 2026-03-06 |
| API 端点数 | 0 | 2026-03-06 |
| 数据库表数 | 0 | 2026-03-06 |
| 单元测试数 | 0 | 2026-03-06 |

---

## 变更历史

| 版本 | 日期 | Phase | 变更摘要 |
|------|------|-------|---------|
| v0.1 | 2026-03-06 | Phase 0 起点 | 初始化，尚无代码实现 |

---

*版本：v0.1*
*创建：2026-03-06*
*下次更新时机：Phase 0 骨架完成后*
