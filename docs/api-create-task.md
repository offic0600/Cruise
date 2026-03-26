# Cruise API 创建任务说明

本文档用于指导团队成员通过 Cruise 测试环境 API 创建任务。

## 适用环境

- 测试环境地址：`https://cruise.cleantrackhotel.com`
- 创建任务接口：`POST /api/issues`
- 登录接口：`POST /api/auth/login`

## 调用流程

1. 使用用户名密码登录，获取 JWT token
2. 在请求头中携带 `Authorization: Bearer <token>`
3. 调用 `/api/issues` 创建任务

## 1. 登录获取 Token

请求：

```bash
curl -X POST 'https://cruise.cleantrackhotel.com/api/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "你的用户名",
    "password": "你的密码"
  }'
```

成功响应示例：

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.xxx",
  "userId": 1,
  "username": "demo",
  "email": "demo@example.com",
  "role": "USER",
  "organizationId": 1
}
```

说明：

- 后续调用 API 时，使用返回结果中的 `token`
- 创建任务时通常还需要 `organizationId`
- `userId` 可用于 `reporterId` 或 `assigneeId`

## 2. 创建任务

请求：

```bash
curl -X POST 'https://cruise.cleantrackhotel.com/api/issues' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer 你的token' \
  -d '{
    "organizationId": 1,
    "type": "TASK",
    "title": "RPA 测试任务",
    "description": "验证 develop 测试环境的登录和核心页面",
    "teamId": 1,
    "projectId": 1,
    "assigneeId": 1,
    "reporterId": 1,
    "priority": "MEDIUM",
    "state": "TODO",
    "estimatedHours": 2
  }'
```

成功响应示例：

```json
{
  "id": 123,
  "organizationId": 1,
  "identifier": "ISSUE-123",
  "type": "TASK",
  "title": "RPA 测试任务",
  "state": "TODO",
  "priority": "MEDIUM"
}
```

## 必填字段

- `organizationId`
- `type`
- `title`

创建任务时：

- `type` 固定填 `TASK`

## 常用字段说明

- `organizationId`: 组织 ID，必填
- `type`: 事项类型，任务填 `TASK`
- `title`: 标题
- `description`: 描述
- `teamId`: 所属团队 ID
- `projectId`: 所属项目 ID
- `assigneeId`: 指派给谁
- `reporterId`: 提交人
- `priority`: 优先级，常用值 `LOW` `MEDIUM` `HIGH`
- `state`: 状态，常用值 `TODO` `IN_PROGRESS` `DONE`
- `estimatedHours`: 预估工时
- `plannedStartDate`: 计划开始日期，格式 `YYYY-MM-DD`
- `plannedEndDate`: 计划结束日期，格式 `YYYY-MM-DD`
- `parentIssueId`: 父任务/父事项 ID
- `labelIds`: 标签 ID 数组
- `customFields`: 自定义字段对象

## 默认值规则

- `type=TASK` 且未传 `state` 时，默认是 `TODO`
- 未传 `priority` 时，默认是 `MEDIUM`

## 最小可用示例

```bash
curl -X POST 'https://cruise.cleantrackhotel.com/api/issues' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer 你的token' \
  -d '{
    "organizationId": 1,
    "type": "TASK",
    "title": "新建测试任务"
  }'
```

## 常见错误

### 1. 未登录或 token 无效

表现：

- 返回 `401 Unauthorized`

处理：

- 重新调用 `/api/auth/login` 获取最新 token

### 2. 缺少 organizationId

表现：

- 返回 `400 Bad Request`
- 提示 `organizationId is required`

处理：

- 从登录返回值中取 `organizationId`

### 3. 没有权限

表现：

- 返回 `403 Forbidden`

处理：

- 确认当前账号是否有对应组织/项目访问权限

## 推荐给团队成员的使用方式

建议每位成员按下面步骤操作：

1. 先登录拿 token
2. 记录自己的 `userId` 和 `organizationId`
3. 按固定模板调用创建任务接口
4. 如果需要自动化，可将 `curl` 包装成脚本

## 团队模板

```bash
TOKEN="替换成登录返回的token"
ORG_ID="替换成organizationId"
USER_ID="替换成userId"

curl -X POST 'https://cruise.cleantrackhotel.com/api/issues' \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -d "{
    \"organizationId\": ${ORG_ID},
    \"type\": \"TASK\",
    \"title\": \"团队测试任务\",
    \"description\": \"由 API 创建\",
    \"reporterId\": ${USER_ID},
    \"priority\": \"MEDIUM\",
    \"state\": \"TODO\"
  }"
```
