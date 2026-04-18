# Linear 全功能 1:1 复刻采集计划

## 目标澄清

用户要求不是“看一个页面像不像”，而是：

- 覆盖 Linear Web 的核心功能面
- 覆盖每个主要页面上的按钮、下拉菜单、弹窗、抽屉、切换器、筛选器、批量操作、快捷入口
- 对每个交互记录 **入口 / 状态变化 / 可见反馈 / URL 变化 / 网络请求 / DOM 变化 / 截图证据**
- 最终把 Cruise 做到功能、信息架构、交互路径、视觉层级上的 **1:1 复刻**

这意味着：**不能只靠单页截图**，必须做“页面 × 控件 × 状态 × 流程”的系统化采集。

---

## 当前已拿到的真实证据

### 已验证
- 9222 元数据接口可用：`/json/version`、`/json/list`、`/json/protocol`
- 已复用本地登录中的 Linear 页面：
  - `https://linear.app/cleantrack/team/CLE/active`
- 已获取：
  - 截图：`docs/linear-parity/screenshots/active-issues.png`
  - DOM/可见文本：`docs/linear-parity/dom/active-issues-visible.json`
  - 网络事件样本：`docs/linear-parity/har/2026-04-18-active-issues-network-events.json`
- watchdog 已补强：
  - 启动 Chrome 时自动带 `--remote-allow-origins=http://127.0.0.1:9222`
  - 额外记录 `websocket_probe=ok/fail`
  - 额外做 suppress_origin WebSocket 探活

### 当前缺口
- 目前**只有 Active issues 一页**拿到了深证据
- 还没有对：
  - issue 详情页
  - 创建/编辑 issue 弹窗
  - projects
  - cycles
  - inbox
  - views
  - command menu
  - 用户菜单 / 设置页
  - 任意下拉菜单的逐项行为
  进行系统化采集

---

## 采集原则

### 1. 采集对象粒度
每个页面都按下面粒度采：
- 页面级：布局、路由、模块分区、信息层级
- 控件级：按钮、icon button、tab、dropdown、select、popover、tooltip、context menu
- 流程级：创建、编辑、删除、筛选、排序、分组、跳转、状态流转、批量操作
- 状态级：默认态、hover、open、disabled、loading、empty、error、success

### 2. 每个交互都要落这些证据
每个按钮/菜单项/操作至少记录：
- 所在页面
- 控件名称
- 控件位置
- 初始可见文案 / icon / 热键提示
- 点击前 URL
- 点击后 URL
- 点击前后 DOM 差异
- 点击前后截图
- 是否触发请求
- 请求摘要（接口、动作、关键字段）
- 最终可见反馈（toast、badge、drawer、modal、列表变化）

### 3. 只读优先
为了避免污染用户数据：
- 优先采只读页面和只读交互
- 对有副作用的操作（创建、删除、修改）先采 UI 打开态、校验态、确认弹窗态
- 真正提交型动作只有在用户明确允许后才做

---

## 全功能采集矩阵（第一版）

## A. 全局框架
### A1 左侧导航
- Workspace 区域
- Inbox
- My issues
- Projects
- Views
- More
- Team section
- Issues / Projects / Views 子入口
- Try / Import issues / Invite people / Cycles / Connect GitHub / What’s new

### A2 顶层全局能力
- 搜索入口
- Command Menu
- 用户头像菜单
- 通知入口
- 快捷创建入口

### A3 全局通用控件
- 通用 dropdown
- 日期选择
- assignee 选择器
- label 选择器
- status 选择器
- priority 选择器
- tooltip / keyboard shortcut hint

## B. Issues 域
### B1 列表页
- Active
- Backlog
- All issues
- My issues
- Done / Completed（如可见）
- 自定义 Views

### B2 列表页内全部交互
- tab 切换
- 搜索
- filter
- display/group/sort
- 新建 issue
- 列表行点击
- 行内 hover 动作
- 多选 / 批量操作（如存在）
- 状态切换
- 优先级/负责人/标签快捷编辑（如存在）

### B3 Issue 详情
- 标题编辑
- 描述区
- 状态、负责人、标签、优先级、项目、cycle
- 评论区
- activity/feed
- 子任务/关联项
- 更多菜单
- 关闭/归档/删除类入口

### B4 Issue 创建 / 编辑流
- 创建弹窗/抽屉默认态
- 必填校验
- 快捷字段填充
- markdown / 富文本能力
- 提交后反馈

## C. Projects 域
- 项目列表
- 项目详情页
- 项目进度
- 项目关联 issue
- 项目状态切换
- 项目排序/筛选
- 项目创建/编辑入口

## D. Views 域
- View 列表
- 新建 View
- 编辑 View
- 删除 View
- View 条件构造器
- View 保存反馈
- 默认/系统 View 与自定义 View 的差异

## E. Cycles / Roadmap
- cycle 列表
- 当前 cycle
- cycle 详情
- roadmap 时间轴
- 过滤/缩放/切换能力

## F. Inbox / Notifications
- 未读/已读
- 过滤
- 快速处理动作
- 跳转 issue / project
- 清空/批量处理能力

## G. Settings（必要子集）
- Team 设置
- Workflow / status 配置页
- Labels
- Members
- Integrations（只做结构观察）

---

## 页面采集模板

每个页面都必须沉淀这些文件：

- `docs/linear-parity/screenshots/<page>-default.png`
- `docs/linear-parity/dom/<page>-default.json`
- `docs/linear-parity/har/<page>-network.json`
- `docs/linear-parity/flows/<page>-interactions.md`
- `docs/linear-parity/<page>-analysis.md`

每个 `<page>-interactions.md` 至少包含：

| 控件 | 类型 | 操作 | 预期反馈 | 实际反馈 | 证据 |
|---|---|---|---|---|---|
| New issue | button | click | 打开创建弹窗 | 待采 | screenshot + dom + network |

---

## 分阶段执行顺序

### Phase 1：把 issues 域采完整
1. Active issues 列表
2. 列表页顶部全部按钮 / dropdown / tabs
3. 任意 issue 详情页
4. issue 创建弹窗
5. issue 编辑/状态流转/评论
6. backlog / my issues / all issues

### Phase 2：把 projects / views / cycles 采完整
1. Projects 列表与详情
2. Views 列表与 view builder
3. Cycles / roadmap

### Phase 3：补齐全局和设置
1. 搜索 / command menu
2. 用户菜单
3. inbox
4. settings 必要子集

---

## watchdog 在这件事里的定位

watchdog **不是复刻本身**，但它能解决“无法稳定取证”的前置问题。

它现在能做：
- 保证 9222 入口持续可用
- 检查是否还能看到目标 Linear 页面
- 检查 WebSocket 是否还能通过 suppress_origin 成功接入
- 在失败时尽快暴露问题，而不是等到真正采集时才发现抓不下来

它不能单独完成的部分：
- 自动遍历所有页面
- 自动枚举每个 dropdown 的每个菜单项
- 自动生成全产品功能树

所以正确做法是：
- **watchdog 保证取证链路稳定**
- **采集脚本/浏览器流程负责逐页逐控件取证**
- **文档与任务板负责追踪“哪些按钮/菜单已经采，哪些没采”**

---

## 下一步最小可执行动作

下一步不再停留在“看一个页面”。

直接进入 **Issues 域全控件采集**：
1. 读取 Active issues 当前页面上的可交互元素
2. 枚举顶部按钮、tabs、dropdown
3. 对每个控件逐个点击前后做截图/DOM/网络摘要
4. 产出 `active-issues-interactions.md`
5. 再进入 issue 详情页做同样的控件级采集

---

## 验收标准（针对“1:1复刻”）

只有满足下面条件，才算真的在推进 1:1：
- 不是只有页面截图，而是有 **功能树 + 控件树 + 流程树**
- 不是只知道“这个按钮存在”，而是知道 **它点了之后发生什么**
- 不是只对一个 page 取证，而是至少覆盖 Issues / Projects / Views / Cycles / Inbox / Settings 这些核心域
- 每个域都有对应的：
  - 页面证据
  - 控件证据
  - 流程证据
  - 差距分析
  - Cruise 落地任务
