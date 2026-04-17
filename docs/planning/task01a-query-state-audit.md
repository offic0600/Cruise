# task01a：queryState DTO 契约审计与最小收口

## 审计结论

本轮只锁定 issue / project / initiative 共享的 `queryState` DTO 外形，不扩展产品能力。

已确认的漂移点：

1. 后端 `ViewService.defaultQueryState()` 之前固定输出 issue 风格 `display.visibleColumns`，导致 PROJECT / INITIATIVE 默认列回退为 issue 列。
2. 前端 `ViewsDirectory`、`NewViewWorkbench`、`ViewsWorkbench` 内部各自维护默认 `queryState`，默认列与 grouping 不一致。
3. 路线图要求 `queryState` 稳定承载 `filters / sorting / grouping / subGrouping / display / layout`，但此前 TS 类型与后端 normalize 都没有显式锁定 `subGrouping`；`layout` 仍作为 `display.layout` 的兼容承载位。

## 本次锁定的统一 DTO 结构

```ts
queryState = {
  filters: { operator, children },
  display: {
    layout,
    visibleColumns,
    density?,
    showSubIssues?,
    showEmptyGroups?,
    columnWidths?
  },
  grouping: { field, direction? },
  subGrouping: { field, direction? },
  sorting: [{ field, direction, nulls? }]
}
```

### 当前默认值策略

- 所有资源默认都产出完整 schema key：`filters / display / grouping / subGrouping / sorting`
- `display.layout` 继续保留，当前默认 `LIST`
- `grouping.field` / `subGrouping.field` 默认 `null`
- `sorting` 默认 `[updatedAt desc nulls=last]`
- `display.visibleColumns` 按资源类型分流：
  - ISSUE: `identifier,title,priority,state,assignee,project,labels,updatedAt,createdAt`
  - PROJECT: `key,name,status,ownerId,teamId,updatedAt,createdAt`
  - INITIATIVE: `slugId,name,status,health,ownerId,targetDate,updatedAt,createdAt`

## 兼容策略

- 后端 normalize 会补齐缺失 key，并对缺失/非法 `display.visibleColumns` 回填资源类型默认列。
- `display.layout` 仍是 layout 的唯一承载位；顶层 `View.layout` 继续作为接口兼容字段回传。
- `filterJson / groupBy / sortJson` 仍保留为 legacy 兼容字段，方便老数据和旧接口读取；它们不是新的双真源。
- 老 view 若只有 legacy 字段，后端会在读取时组装为统一 `queryState` 再返回。

## 明确留待后续任务

- task01b：进一步梳理前端各处 grouping / subGrouping 交互与编辑能力，决定是否真正开放二级分组 UI。
- task01c：评估是否把 backend / frontend 的 queryState 常量进一步抽成共享生成源，减少跨端重复。
