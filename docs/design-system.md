# Cruise Design System

## 目标

Cruise 的 Design System 以 **foundation tokens -> semantic tokens -> component tokens -> patterns** 四层组织，运行时真值以 CSS variables 为准，Tailwind 只负责消费。

当前正式入口：

- `frontend/src/design-system/tokens/*`
- `frontend/src/design-system/theme/ThemeProvider.tsx`
- `frontend/src/design-system/patterns/*`
- `frontend/src/components/ui/*`

## Token 规则

### Foundations

- `color.*`
- `spacing.*`
- `radius.*`
- `shadow.*`
- `font.*`
- `motion.*`
- `layout.*`

### Semantic

- `bg.*`
- `fg.*`
- `border.*`
- `fill.*`
- `interactive.*`
- `focus.*`

### Component

- `button.*`
- `input.*`
- `card.*`
- `nav.*`
- `propertyPill.*`

## 主题

- 主题通过 `<html data-theme="light|dark">` 控制
- `ThemeProvider` 默认 light，并将用户选择持久化到 `localStorage`
- 所有组件不得自行判断 light/dark 分支，只消费语义 token

## 组件纪律

- 新视觉需求优先扩展 `primitives` 或 `patterns`
- 禁止在业务页面长期新增一次性 token 类
- 禁止直接写 `slate-*`、`bg-white`、裸十六进制或 `rgba(...)` 作为主路径

## 页面模式

当前优先模式：

- `PageHeader`
- `EmptyState`
- `SectionHeader`
- `PropertyPill`

后续新增页面模式时，必须先判断是否属于：

1. 基础 primitive
2. 复合 pattern
3. 仅业务逻辑组件

不要把视觉规则重新散回页面。

## 审计

运行：

```bash
cd frontend
npm run lint:design-system
```

该脚本会拦截：

- `slate-*` 颜色 utility
- `white/black` 裸色 utility
- 十六进制色值
- `rgba/rgb` 颜色写法

如需临时例外，应先重构到 token，再决定是否放行规则。
