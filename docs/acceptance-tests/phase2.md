# Phase 2 验收测试

> **Phase 目标**：数据分析 — 效率度量 + 趋势预测 + 风险预警
> **验收标准**：所有场景通过 = Phase 2 完成，可进入 Phase 3

---

## 场景汇总

| 编号 | 场景 | 用例数 | 状态 |
|------|------|--------|------|
| S1 | 效率度量 | 4 | ✅ 通过 |
| S2 | 趋势分析 | 3 | ✅ 通过 |
| S3 | 风险预警 | 3 | ✅ 通过 |
| **合计** | — | **10** | **10/10** |

---

## S1：效率度量

> 验证项目/团队/个人效率指标计算。

**前置条件**：项目有需求、任务、工时数据

### TC-1.1：项目效率仪表盘

**操作**：
```bash
curl http://localhost:8080/api/analytics/project/1/efficiency \
  -H "Authorization: Bearer <TOKEN>"
```

**预期**：
- [x] HTTP 200 OK
- [x] 返回项目效率指标（需求完成率、任务完成率、工时利用率、平均交付周期）

**实际**：HTTP 200 OK，返回效率指标

---

### TC-1.2：团队效率排名

**操作**：
```bash
curl http://localhost:8080/api/analytics/team/1/ranking \
  -H "Authorization: Bearer <TOKEN>"
```

**预期**：
- [x] HTTP 200 OK
- [x] 返回团队成员效率排名

**实际**：HTTP 200 OK，返回成员排名

---

### TC-1.3：个人工作负载分析

**操作**：
```bash
curl http://localhost:8080/api/analytics/member/1/workload \
  -H "Authorization: Bearer <TOKEN>"
```

**预期**：
- [x] HTTP 200 OK
- [x] 返回个人工作负载统计

**实际**：HTTP 200 OK，返回工作负载统计

---

### TC-1.4：需求吞吐量统计

**操作**：
```bash
curl http://localhost:8080/api/analytics/project/1/throughput \
  -H "Authorization: Bearer <TOKEN>"
```

**预期**：
- [x] HTTP 200 OK
- [x] 返回需求吞吐量趋势

**实际**：HTTP 200 OK，返回吞吐量统计

---

## S2：趋势分析

> 验证数据趋势分析和预测功能。

**前置条件**：有历史数据

### TC-2.1：需求趋势预测

**操作**：
```bash
curl http://localhost:8080/api/analytics/project/1/forecast/requirements \
  -H "Authorization: Bearer <TOKEN>"
```

**预期**：
- [x] HTTP 200 OK
- [x] 返回未来需求趋势预测

**实际**：HTTP 200 OK，返回趋势预测

---

### TC-2.2：工时趋势分析

**操作**：
```bash
curl http://localhost:8080/api/analytics/project/1/trend/hours \
  -H "Authorization: Bearer <TOKEN>"
```

**预期**：
- [x] HTTP 200 OK
- [x] 返回工时趋势图表数据

**实际**：HTTP 200 OK，返回工时趋势

---

### TC-2.3：团队_velocity计算

**操作**：
```bash
curl http://localhost:8080/api/analytics/team/1/velocity \
  -H "Authorization: Bearer <TOKEN>"
```

**预期**：
- [x] HTTP 200 OK
- [x] 返回团队速率统计

**实际**：HTTP 200 OK，返回团队速率

---

## S3：风险预警

> 验证风险识别和预警功能。

### TC-3.1：项目风险评估

**操作**：
```bash
curl http://localhost:8080/api/analytics/project/1/risk \
  -H "Authorization: Bearer <TOKEN>"
```

**预期**：
- [x] HTTP 200 OK
- [x] 返回项目风险评分和风险项列表

**实际**：HTTP 200 OK，返回风险评分

---

### TC-3.2：延期风险预警

**操作**：
```bash
curl http://localhost:8080/api/analytics/project/1/risk/delay \
  -H "Authorization: Bearer <TOKEN>"
```

**预期**：
- [x] HTTP 200 OK
- [x] 返回可能延期的任务/需求列表

**实际**：HTTP 200 OK，返回延期风险列表

---

### TC-3.3：资源瓶颈检测

**操作**：
```bash
curl http://localhost:8080/api/analytics/team/1/bottleneck \
  -H "Authorization: Bearer <TOKEN>"
```

**预期**：
- [x] HTTP 200 OK
- [x] 返回资源瓶颈分析

**实际**：HTTP 200 OK，返回瓶颈分析

---

## 执行记录

| 执行日期 | 执行人 | 通过 | 失败 | 跳过 | 备注 |
|---------|--------|------|------|------|------|
| 2026-03-09 | offic0600 | 10 | 0 | 0 | 全部通过 |

---

## 启动命令速查

```bash
# 后端
cd backend && ./gradlew bootRun

# 前端
cd frontend && npm run dev

# 健康检查
curl http://localhost:8080/actuator/health
```

---

*创建：2026-03-09（Phase 1 完成后）*
*更新：2026-03-09（Phase 2 验收完成）*
*状态：Phase 2 完成*
