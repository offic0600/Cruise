# Linear 复刻实施路线图

## 本轮更新（2026-04-18）
结合当前 Cruise 代码现状，复刻路线从“新建能力”调整为“基于现有 issues 模块做贴近式改造”。

---

## P0：Linear Active Issues 对标
目标：先把 Cruise 的 issues 主链路做得尽量接近 Linear Active Issues。

### P0-1 取证补全
- 恢复 9222 DevTools 可用性
- 采集 Active issues 页 tab 元信息
- 采集网络请求清单 / GraphQL 操作名 / 响应字段摘要
- 采集 DOM 结构摘要与关键区域截图

### P0-2 文档建模
- 完善 `api-catalog.md`
- 完善 Active issues 页面结构分析
- 补字段映射表（Linear 字段 → Cruise 现状）
- 补 UI 结构映射表（导航 / 顶栏 / list header / row / group）

### P0-3 Cruise 列表页小步改造
按 5 分钟粒度拆分，优先做：
1. 盘点 `frontend/src/app/issues/page.tsx` 的当前工具栏区块
2. 对齐顶部视图切换与筛选入口层级
3. 调整列表头部信息密度与间距
4. 调整状态分组标题样式
5. 调整 issue row 的字段顺序与视觉层级
6. 增加更接近 Linear 的空态 / loading / error 表达

### P0-4 路由贴近
- 评估将 `/issues?view=active` 映射到 workspace/team 语义路由
- 若成本低，补一层兼容入口，不立即破坏现有数据流

---

## P1：Issue Detail 对标
目标：让 Cruise issue 详情页在布局和交互上接近 Linear。

### 拆分方向
- 顶部 action bar 对标
- 侧边栏字段区对标
- 描述编辑区对标
- 评论 / 活动流结构对标
- 关联项（子任务、项目、关系）对标

---

## P2：Projects / Views / Inbox
- Projects 列表与详情
- Saved views / filters / sort / group
- Inbox / Activity 基础流
- 命令面板基础形态

---

## P3：Roadmap / Cycles / 微交互
- Roadmap 时间线
- Cycles 结构
- 批量操作
- 动效、键盘操作、微交互补齐

---

## 最近两轮最小任务建议

### 下一轮（优先）
- 基于当前已恢复可用的 9222 元信息层，补一个只读的 Active issues 网络监听脚本/文档步骤，开始沉淀 `Network.requestWillBeSent` 摘要
- 如果监听仍不稳定，再退回 `docs/linear-parity/active-issues-toolbar-gap.md` 指向的 `/issues` 顶部工具栏最小 UI 改动

### 下下轮
- 做一个最小代码改动：调整 `/issues` 页顶部工具栏中的一个区块，使其更接近 Linear Active Issues
