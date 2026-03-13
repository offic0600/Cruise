# Phase 4 验收测试

> **Phase 目标**：智能化 — SuperAgent + Skill 体系 + 持续进化环
> **验收标准**：所有场景通过 = Phase 4 完成

---

## 场景汇总

| 编号 | 场景 | 用例数 | 状态 |
|------|------|--------|------|
| S1 | SuperAgent 核心能力 | 4 | ✅ 部分通过 |
| S2 | Skill 体系 | 5 | ✅ 通过 |
| S3 | 角色切换 | 3 | ✅ 部分通过 |
| S4 | 持续进化环 | 3 | ✅ 通过 |
| **合计** | — | **15** | **✅ 8/15** |

---

## S1：SuperAgent 核心能力

> 验证 SuperAgent 的核心交互能力。

### TC-4.1：自然语言理解

**操作**：
```bash
curl -X POST http://localhost:8080/api/agent/query \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"query":"查看项目A的当前进度","role":"PM"}'
```

**预期**：
- [ ] HTTP 200 OK
- [ ] 返回结构化结果（项目进度、关键指标）
- [ ] 正确识别用户角色为 PM

---

### TC-4.2：多轮对话上下文

**操作**：
```bash
# 第一轮
curl -X POST http://localhost:8080/api/agent/query \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"query":"查看团队负载","role":"PM","sessionId":"session-001"}'

# 第二轮（延续上下文）
curl -X POST http://localhost:8080/api/agent/query \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"query":"他们的任务完成情况如何","role":"PM","sessionId":"session-001"}'
```

**预期**：
- [ ] 第一轮返回团队负载数据
- [ ] 第二轮理解"他们"指代上一轮的团队
- [ ] 返回该团队的任务完成情况

---

### TC-4.3：异常输入处理

**操作**：
```bash
curl -X POST http://localhost:8080/api/agent/query \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"query":"","role":"PM"}'
```

**预期**：
- [ ] HTTP 400 Bad Request
- [ ] 返回友好错误提示

---

### TC-4.4：认证保护

**操作**：
```bash
curl -X POST http://localhost:8080/api/agent/query \
  -H "Content-Type: application/json" \
  -d '{"query":"查看项目","role":"PM"}'
```

**预期**：
- [ ] HTTP 401 Unauthorized
- [ ] 返回认证错误提示

---

## S2：Skill 体系

> 验证 Skill 的注册、选择、执行能力。

### TC-4.5：Skill 注册与发现

**操作**：
```bash
curl -X GET http://localhost:8080/api/skills \
  -H "Authorization: Bearer <token>"
```

**预期**：
- [ ] HTTP 200 OK
- [ ] 返回 Skill 列表（至少包含：RequirementAnalysis, TaskAssignment, RiskAlert, ProgressAssessment, TeamOptimization）
- [ ] 每个 Skill 包含 name, description, parameters, outputSchema

---

### TC-4.6：Skill 自动选择

**操作**：
```bash
curl -X POST http://localhost:8080/api/agent/query \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"query":"这个需求要多久能完成","role":"PM"}'
```

**预期**：
- [ ] 自动选择 ProgressAssessment Skill
- [ ] 返回预估工期

---

### TC-4.7：Skill 组合执行

**操作**：
```bash
curl -X POST http://localhost:8080/api/agent/query \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"query":"分析项目风险并给出优化建议","role":"PM"}'
```

**预期**：
- [ ] 依次执行 RiskAlert + TeamOptimization Skill
- [ ] 返回风险分析 + 优化建议

---

### TC-4.8：Skill 参数验证

**操作**：
```bash
curl -X POST http://localhost:8080/api/skills/execute \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"skillName":"TaskAssignment","parameters":{}}'
```

**预期**：
- [ ] HTTP 400 Bad Request
- [ ] 返回参数缺失提示

---

### TC-4.9：Skill 执行超时处理

**操作**：
```bash
curl -X POST http://localhost:8080/api/agent/query \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"query":"分析全部历史数据","role":"PM"}'
```

**预期**：
- [ ] 5秒内返回
- [ ] 返回部分结果或友好提示（不阻塞）

---

## S3：角色切换

> 验证 SuperAgent 根据不同角色提供差异化服务。

### TC-4.10：IT 高管视角

**操作**：
```bash
curl -X POST http://localhost:8080/api/agent/query \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"query":"项目整体健康度如何","role":"IT_LEAD"}'
```

**预期**：
- [ ] 返回全局视角指标（项目数量、总体进度、预算使用、风险概览）
- [ ] 重点突出决策层关注的高层指标

---

### TC-4.11：项目经理视角

**操作**：
```bash
curl -X POST http://localhost:8080/api/agent/query \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"query":"本周任务进度","role":"PM"}'
```

**预期**：
- [ ] 返回团队级指标（任务完成率、工时统计、延期风险）
- [ ] 包含可操作的任务分配建议

---

### TC-4.12：开发人员视角

**操作**：
```bash
curl -X POST http://localhost:8080/api/agent/query \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"query":"我今天的任务","role":"DEVELOPER"}'
```

**预期**：
- [ ] 返回个人任务列表（待办、进行中、阻塞）
- [ ] 包含任务优先级和截止时间

---

## S4：持续进化环

> 验证平台的自我改进能力。

### TC-4.13：用户反馈收集

**操作**：
```bash
curl -X POST http://localhost:8080/api/agent/feedback \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"queryId":"q-123","rating":4,"comment":"分析结果很准确","suggestion":"希望增加趋势预测"}'
```

**预期**：
- [ ] HTTP 201 Created
- [ ] 反馈被记录到数据库

---

### TC-4.14：Skill 性能分析

**操作**：
```bash
curl -X GET http://localhost:8080/api/skills/analytics/RiskAlert \
  -H "Authorization: Bearer <token>"
```

**预期**：
- [ ] HTTP 200 OK
- [ ] 返回 Skill 使用统计（调用次数、平均响应时间、准确率评分）

---

### TC-4.15：优化建议生成

**操作**：
```bash
curl -X GET http://localhost:8080/api/agent/optimization \
  -H "Authorization: Bearer <token>"
```

**预期**：
- [ ] HTTP 200 OK
- [ ] 返回基于历史反馈的优化建议（如：Skill 参数调整、提示词优化）
- [ ] 建议包含优先级和预期收益

---

> *下次 Session 开始时，先读本文件最后一条记录恢复上下文。*
