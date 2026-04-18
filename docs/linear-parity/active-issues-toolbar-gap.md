# Active Issues 顶部工具栏差距分析

## 本轮目标
在 9222 DevTools 入口不稳定的前提下，先基于已有 Linear 目标页证据与 Cruise 当前实现，补一份 **顶部工具栏级** 的差距文档，为下一个 5 分钟级 UI 改动提供明确落点。

## Linear 侧已知证据
当前能确认的 Linear 证据仍然有限，但已知目标页为：
- 标题：`Cleantrack › Active issues`
- 路由：`https://linear.app/cleantrack/team/CLE/active`
- 页面语义：团队上下文下的 Active issues 工作视图

结合现有计划与已沉淀文档，可先确定该页属于典型的：
- 团队/视图上下文入口
- 高密度 issue 列表工作台
- 顶部含视图切换、搜索、筛选/显示控制、创建入口的操作条

> 注：真实 DOM 与网络证据仍待 9222 恢复后补齐，本文件先做 Cruise 侧可执行的结构对照。

## Cruise 当前实现盘点
基于 `frontend/src/app/issues/page.tsx:255-300`，当前顶部工具栏由两部分组成：

### 左侧：视图切换 pills
- `All issues`
- `Active`
- `Backlog`
- `Done`
- 每个 pill 带数量
- 当前激活项以深底白字圆角 pill 表示

### 右侧：操作区
- 搜索框：`Search title or identifier`
- 高级筛选按钮：`Advanced filter`
- Drafts 入口
- 新建 issue 按钮：`New`

## 当前结构判断
Cruise 现状已经具备“可工作的顶部操作条”，但更接近的是一个通用 issues 页，而不是 Linear 风格的团队视图工具栏。核心差距集中在以下几点。

## 差距拆解

### 1. 路由上下文差距
Linear 已知使用团队上下文路由：
- `/cleantrack/team/CLE/active`

Cruise 当前顶部工具栏挂载在通用列表页：
- `/issues`

影响：
- 工具栏缺少显式 team/workspace 语义
- 当前 view pills 更像本地筛选，不像 Linear 的“团队视图导航”

### 2. 视图切换语义差距
Cruise 现在的四个 pills：
- all / active / backlog / done

问题：
- `all` 与 `done` 并不一定是 Linear 当前主工作区最核心的一排入口
- 现有文案偏“结果筛选”，而不是“团队视图导航”
- 没有体现 saved view / display / 分组显示等扩展位

### 3. 操作条信息密度差距
Cruise 右侧操作区目前是：
- 搜索
- 高级筛选
- Drafts
- New

问题：
- 结构偏稀疏，缺少更明确的层级分组
- `Drafts` 入口占据主工具栏一级位置，和 Linear Active issues 的主工作目标不完全一致
- 过滤与显示控制尚未拆分为更细粒度入口

### 4. 视觉样式差距
当前工具栏主要使用：
- 圆角 pill
- 白底按钮
- 默认输入框

与 Linear 目标方向相比，仍可能存在：
- 控件密度不够高
- 横向压缩不足
- 主次按钮层级不够明显
- 与左侧导航/列表区域的整体暗色工作台感尚未完全统一

## 建议的最小落地方向
下一步最适合做一个 **只改顶部工具栏一个点** 的小任务，优先级建议如下：

1. **先做结构梳理，不改数据流**
   - 保留现有搜索、筛选、创建逻辑
   - 仅调整顶部工具栏的信息架构与样式层级

2. **首个最小代码改动建议**
   - 把左侧 view pills 从“圆角胶囊按钮组”调整为更接近导航标签的紧凑样式
   - 保留 `active/backlog` 为核心入口，降低 `all/done` 的视觉优先级

3. **第二个小任务建议**
   - 重新组织右侧操作区的顺序与视觉层级：搜索 → filter/display 控制 → 新建
   - 将 `Drafts` 降级出主工具栏或改为次级入口

## 建议修改文件
- `frontend/src/app/issues/page.tsx`
- 如需抽样式：`frontend/src/app/globals.css`

## 验收标准（针对下一步最小代码任务）
- 不改动现有查询参数与 API 行为
- 顶部工具栏视觉层级更接近“团队 issue 工作台”而不是普通列表页
- `active/backlog` 的识别优先级更高
- 不影响现有搜索、筛选、创建功能

## 与路线图的关系
本文件对应 `docs/linear-parity/implementation-roadmap.md` 中的：
- `P0-3 Cruise 列表页小步改造`
- 第 1~2 步：盘点工具栏区块 + 对齐顶部视图切换与筛选入口层级

## 下一步最小任务建议
直接进入一个 5 分钟级代码任务：
- 调整 `frontend/src/app/issues/page.tsx` 顶部 view pills 的样式与层级，使其更接近 Linear 的团队视图导航感。
