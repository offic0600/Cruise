# 分支策略

## 目标

为 `Cruise` 仓库建立清晰、低摩擦的分支协作规则，确保方案文档、架构整理与后续实现演进可控推进。

## 分支职责

### `main`

- 作为稳定主分支使用。
- 只接收已经完成评审和阶段性验证的内容。
- 用于保存当前对外可参考、可归档的版本。

### `develop`

- 作为日常集成分支使用。
- 承接功能分支合并后的最新开发成果。
- 用于汇总阶段性架构整理、产品方案更新和文档演进。

### `feature/*`

- 作为单项任务或专题工作的开发分支。
- 从 `develop` 拉出，完成后合并回 `develop`。
- 适用于架构专题、产品方案细化、实验性设计和实现探索。

### `hotfix/*`

- 用于紧急修正文档错误、关键策略错误或发布阻塞问题。
- 默认从 `main` 拉出，修复完成后同时回合到 `main` 与 `develop`。

## 命名规范

- 功能分支：`feature/<topic>`
- 修复分支：`hotfix/<topic>`
- 研究分支：`spike/<topic>`

命名建议使用小写英文和中划线，避免空格、中文和过长描述。

## 合并流向

1. `feature/*` -> `develop`
2. `spike/*` -> `develop`（仅在结论明确、内容可保留时）
3. `hotfix/*` -> `main`
4. `hotfix/*` -> `develop`
5. `develop` -> `main`

## 提交流程

1. 从 `develop` 创建功能分支。
2. 在功能分支内完成单一主题修改。
3. 提交信息保持语义清晰，例如 `docs:`、`feat:`、`refactor:`。
4. 合并回 `develop` 前进行自查，确认文档结构、术语和目标一致。
5. 阶段性完成后，再从 `develop` 合并到 `main`。

## 当前建议

- 当前架构整理任务使用分支：`feature/architecture-refactor`
- 后续如进入 MVP 拆解，可使用：
  - `feature/mvp-boundary`
  - `feature/platform-roadmap`
  - `feature/mcp-scope`
