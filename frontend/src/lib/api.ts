import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface Issue {
  id: number;
  identifier: string;
  type: 'FEATURE' | 'TASK' | 'BUG' | 'TECH_DEBT';
  title: string;
  description: string | null;
  state: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  projectId: number;
  teamId: number | null;
  parentIssueId: number | null;
  assigneeId: number | null;
  reporterId: number | null;
  estimatePoints: number | null;
  progress: number;
  plannedStartDate: string | null;
  plannedEndDate: string | null;
  estimatedHours: number;
  actualHours: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null;
  sourceType: string;
  sourceId: number | null;
  legacyPayload: string | null;
  createdAt: string;
  updatedAt: string;
}

type JsonRecord = Record<string, unknown>;

export interface FeatureIssue extends Issue {
  type: 'FEATURE';
  expectedDeliveryDate: string | null;
  requirementOwnerId: number | null;
  productOwnerId: number | null;
  devOwnerId: number | null;
  devParticipants: string | null;
  testOwnerId: number | null;
  tags: string | null;
  estimatedDays: number | null;
  plannedDays: number | null;
  gapDays: number | null;
  gapBudget: number | null;
  actualDays: number | null;
  applicationCodes: string | null;
  vendors: string | null;
  vendorStaff: string | null;
  createdBy: string | null;
}

export interface TaskIssue extends Issue {
  type: 'TASK';
  requirementId: number | null;
  estimatedDays: number | null;
  plannedDays: number | null;
  remainingDays: number | null;
}

export interface BugIssue extends Issue {
  type: 'BUG';
  taskId: number | null;
}

export const login = (username: string, password: string) =>
  api.post('/auth/login', { username, password }).then((r) => r.data);

export const register = (username: string, password: string, email: string, role: string = 'USER') =>
  api.post('/auth/register', { username, password, email, role }).then((r) => r.data);

export const getIssues = (params?: {
  type?: string;
  projectId?: number;
  assigneeId?: number;
  parentIssueId?: number;
  state?: string;
  q?: string;
}) => api.get<Issue[]>('/issues', { params }).then((r) => r.data);

export const getIssue = (id: number) => api.get<Issue>(`/issues/${id}`).then((r) => r.data);

export const createIssue = (data: {
  type: string;
  title: string;
  description?: string;
  state?: string;
  priority?: string;
  projectId: number;
  teamId?: number | null;
  parentIssueId?: number | null;
  assigneeId?: number | null;
  reporterId?: number | null;
  estimatePoints?: number | null;
  progress?: number;
  plannedStartDate?: string | null;
  plannedEndDate?: string | null;
  estimatedHours?: number;
  actualHours?: number;
  severity?: string | null;
  legacyPayload?: string | null;
}) => api.post<Issue>('/issues', data).then((r) => r.data);

export const updateIssue = (id: number, data: {
  title?: string;
  description?: string;
  state?: string;
  priority?: string;
  teamId?: number | null;
  parentIssueId?: number | null;
  assigneeId?: number | null;
  reporterId?: number | null;
  estimatePoints?: number | null;
  progress?: number;
  plannedStartDate?: string | null;
  plannedEndDate?: string | null;
  estimatedHours?: number;
  actualHours?: number;
  severity?: string | null;
  legacyPayload?: string | null;
}) => api.put<Issue>(`/issues/${id}`, data).then((r) => r.data);

export const updateIssueState = (id: number, state: string) =>
  api.patch<Issue>(`/issues/${id}/state`, { state }).then((r) => r.data);

export const deleteIssue = (id: number) => api.delete(`/issues/${id}`);

const parseLegacyPayload = (legacyPayload: string | null | undefined): JsonRecord => {
  if (!legacyPayload) return {};
  try {
    return JSON.parse(legacyPayload) as JsonRecord;
  } catch {
    return {};
  }
};

const stringifyLegacyPayload = (payload: JsonRecord): string =>
  JSON.stringify(
    Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined)
    )
  );

const asNumber = (value: unknown): number | null =>
  typeof value === 'number' ? value : null;

const asString = (value: unknown): string | null =>
  typeof value === 'string' ? value : null;

const mapFeatureIssue = (issue: Issue): FeatureIssue => {
  const payload = parseLegacyPayload(issue.legacyPayload);
  return {
    ...issue,
    type: 'FEATURE',
    expectedDeliveryDate: issue.plannedEndDate,
    requirementOwnerId: issue.assigneeId,
    productOwnerId: asNumber(payload.productOwnerId),
    devOwnerId: asNumber(payload.devOwnerId),
    devParticipants: asString(payload.devParticipants),
    testOwnerId: asNumber(payload.testOwnerId),
    tags: asString(payload.tags),
    estimatedDays: asNumber(payload.estimatedDays),
    plannedDays: asNumber(payload.plannedDays),
    gapDays: asNumber(payload.gapDays),
    gapBudget: asNumber(payload.gapBudget),
    actualDays: asNumber(payload.actualDays),
    applicationCodes: asString(payload.applicationCodes),
    vendors: asString(payload.vendors),
    vendorStaff: asString(payload.vendorStaff),
    createdBy: asString(payload.createdBy),
  };
};

const mapTaskIssue = (issue: Issue): TaskIssue => {
  const payload = parseLegacyPayload(issue.legacyPayload);
  return {
    ...issue,
    type: 'TASK',
    requirementId: issue.parentIssueId,
    estimatedDays: asNumber(payload.estimatedDays),
    plannedDays: asNumber(payload.plannedDays),
    remainingDays: asNumber(payload.remainingDays),
  };
};

const mapBugIssue = (issue: Issue): BugIssue => ({
  ...issue,
  type: 'BUG',
  taskId: issue.parentIssueId,
});

export const getFeatureIssues = () =>
  getIssues({ type: 'FEATURE' }).then((issues) => issues.map(mapFeatureIssue));

export const createFeatureIssue = (data: {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  projectId: number;
  teamId?: number | null;
  plannedStartDate?: string | null;
  expectedDeliveryDate?: string | null;
  requirementOwnerId?: number | null;
  productOwnerId?: number | null;
  devOwnerId?: number | null;
  devParticipants?: string | null;
  testOwnerId?: number | null;
  progress?: number;
  tags?: string | null;
  estimatedDays?: number | null;
  plannedDays?: number | null;
  gapDays?: number | null;
  gapBudget?: number | null;
  actualDays?: number | null;
  applicationCodes?: string | null;
  vendors?: string | null;
  vendorStaff?: string | null;
  createdBy?: string | null;
}) =>
  createIssue({
    type: 'FEATURE',
    title: data.title,
    description: data.description,
    state: data.status,
    priority: data.priority === 'CRITICAL' ? 'URGENT' : data.priority,
    projectId: data.projectId,
    teamId: data.teamId,
    assigneeId: data.requirementOwnerId,
    progress: data.progress ?? 0,
    plannedStartDate: data.plannedStartDate,
    plannedEndDate: data.expectedDeliveryDate,
    legacyPayload: stringifyLegacyPayload({
      productOwnerId: data.productOwnerId ?? null,
      devOwnerId: data.devOwnerId ?? null,
      devParticipants: data.devParticipants ?? null,
      testOwnerId: data.testOwnerId ?? null,
      tags: data.tags ?? null,
      estimatedDays: data.estimatedDays ?? null,
      plannedDays: data.plannedDays ?? null,
      gapDays: data.gapDays ?? null,
      gapBudget: data.gapBudget ?? null,
      actualDays: data.actualDays ?? null,
      applicationCodes: data.applicationCodes ?? null,
      vendors: data.vendors ?? null,
      vendorStaff: data.vendorStaff ?? null,
      createdBy: data.createdBy ?? null,
    }),
  }).then(mapFeatureIssue);

export const updateFeatureIssue = (
  id: number,
  data: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    teamId?: number | null;
    plannedStartDate?: string | null;
    expectedDeliveryDate?: string | null;
    requirementOwnerId?: number | null;
    productOwnerId?: number | null;
    devOwnerId?: number | null;
    devParticipants?: string | null;
    testOwnerId?: number | null;
    progress?: number;
    tags?: string | null;
    estimatedDays?: number | null;
    plannedDays?: number | null;
    gapDays?: number | null;
    gapBudget?: number | null;
    actualDays?: number | null;
    applicationCodes?: string | null;
    vendors?: string | null;
    vendorStaff?: string | null;
    createdBy?: string | null;
  }
) =>
  getIssue(id).then((issue) =>
    updateIssue(id, {
      title: data.title,
      description: data.description,
      state: data.status,
      priority: data.priority === 'CRITICAL' ? 'URGENT' : data.priority,
      teamId: data.teamId,
      assigneeId: data.requirementOwnerId,
      progress: data.progress,
      plannedStartDate: data.plannedStartDate,
      plannedEndDate: data.expectedDeliveryDate,
      legacyPayload: stringifyLegacyPayload({
        ...parseLegacyPayload(issue.legacyPayload),
        productOwnerId: data.productOwnerId,
        devOwnerId: data.devOwnerId,
        devParticipants: data.devParticipants,
        testOwnerId: data.testOwnerId,
        tags: data.tags,
        estimatedDays: data.estimatedDays,
        plannedDays: data.plannedDays,
        gapDays: data.gapDays,
        gapBudget: data.gapBudget,
        actualDays: data.actualDays,
        applicationCodes: data.applicationCodes,
        vendors: data.vendors,
        vendorStaff: data.vendorStaff,
        createdBy: data.createdBy,
      }),
    }).then(mapFeatureIssue)
  );

export const getTaskIssues = () =>
  getIssues({ type: 'TASK' }).then((issues) => issues.map(mapTaskIssue));

export const createTaskIssue = (data: {
  title: string;
  description?: string;
  status?: string;
  requirementId: number;
  assigneeId?: number | null;
  progress?: number;
  teamId?: number | null;
  plannedStartDate?: string | null;
  plannedEndDate?: string | null;
  estimatedDays?: number | null;
  plannedDays?: number | null;
  remainingDays?: number | null;
  estimatedHours?: number;
}) =>
  getIssue(data.requirementId).then((parentIssue) =>
    createIssue({
      type: 'TASK',
      title: data.title,
      description: data.description,
      state: data.status,
      projectId: parentIssue.projectId,
      teamId: data.teamId,
      parentIssueId: data.requirementId,
      assigneeId: data.assigneeId,
      progress: data.progress ?? 0,
      plannedStartDate: data.plannedStartDate,
      plannedEndDate: data.plannedEndDate,
      estimatedHours: data.estimatedHours ?? 0,
      legacyPayload: stringifyLegacyPayload({
        estimatedDays: data.estimatedDays ?? null,
        plannedDays: data.plannedDays ?? null,
        remainingDays: data.remainingDays ?? null,
      }),
    }).then(mapTaskIssue)
  );

export const updateTaskIssue = (
  id: number,
  data: {
    title?: string;
    description?: string;
    status?: string;
    assigneeId?: number | null;
    progress?: number;
    teamId?: number | null;
    plannedStartDate?: string | null;
    plannedEndDate?: string | null;
    estimatedDays?: number | null;
    plannedDays?: number | null;
    remainingDays?: number | null;
    estimatedHours?: number;
  }
) =>
  getIssue(id).then((issue) =>
    updateIssue(id, {
      title: data.title,
      description: data.description,
      state: data.status,
      assigneeId: data.assigneeId,
      progress: data.progress,
      teamId: data.teamId,
      plannedStartDate: data.plannedStartDate,
      plannedEndDate: data.plannedEndDate,
      estimatedHours: data.estimatedHours,
      legacyPayload: stringifyLegacyPayload({
        ...parseLegacyPayload(issue.legacyPayload),
        estimatedDays: data.estimatedDays,
        plannedDays: data.plannedDays,
        remainingDays: data.remainingDays,
      }),
    }).then(mapTaskIssue)
  );

export const logTaskIssueHours = (id: number, hours: number) =>
  getIssue(id).then((issue) =>
    updateIssue(id, {
      actualHours: (issue.actualHours ?? 0) + hours,
    }).then(mapTaskIssue)
  );

export const getBugIssues = () =>
  getIssues({ type: 'BUG' }).then((issues) => issues.map(mapBugIssue));

export const createBugIssue = (data: {
  title: string;
  description?: string;
  severity?: string;
  projectId: number;
  taskId?: number | null;
  reporterId?: number | null;
}) =>
  createIssue({
    type: 'BUG',
    title: data.title,
    description: data.description,
    state: 'TODO',
    priority: data.severity === 'CRITICAL' ? 'URGENT' : data.severity ?? 'MEDIUM',
    projectId: data.projectId,
    parentIssueId: data.taskId,
    reporterId: data.reporterId,
    severity: data.severity ?? 'MEDIUM',
  }).then(mapBugIssue);

export const updateBugIssue = (
  id: number,
  data: {
    title?: string;
    description?: string;
    severity?: string;
    status?: string;
    taskId?: number | null;
  }
) =>
  updateIssue(id, {
      title: data.title,
      description: data.description,
      state: data.status,
      priority: data.severity === 'CRITICAL' ? 'URGENT' : data.severity,
      severity: data.severity,
      parentIssueId: data.taskId,
  }).then(mapBugIssue);

export const updateBugIssueStatus = (id: number, status: string) =>
  updateIssueState(id, status).then(mapBugIssue);

export const getTeamMembers = () => api.get('/team-members').then((r) => r.data);
export const getTeamMember = (id: number) => api.get(`/team-members/${id}`).then((r) => r.data);
export const createTeamMember = (data: { name: string; email?: string; role?: string; skills?: string; teamId?: number }) =>
  api.post('/team-members', data).then((r) => r.data);
export const updateTeamMember = (id: number, data: { name?: string; email?: string; role?: string; skills?: string; teamId?: number }) =>
  api.put(`/team-members/${id}`, data).then((r) => r.data);
export const deleteTeamMember = (id: number) => api.delete(`/team-members/${id}`);

export const getProjectOverview = (projectId: number) =>
  api.get(`/dashboard/project/${projectId}`).then((r) => r.data);
export const getTeamLoad = (teamId: number) =>
  api.get(`/dashboard/team/${teamId}/load`).then((r) => r.data);

export const getIssueTags = () => api.get('/issue-tags').then((r) => r.data);
export const createIssueTag = (data: { name: string; color?: string; sortOrder?: number }) =>
  api.post('/issue-tags', data).then((r) => r.data);
export const updateIssueTag = (id: number, data: { name?: string; color?: string; sortOrder?: number }) =>
  api.put(`/issue-tags/${id}`, data).then((r) => r.data);
export const deleteIssueTag = (id: number) => api.delete(`/issue-tags/${id}`);

export const createSession = (userId?: number, userName?: string) =>
  api.post('/agent/session', { userId, userName }).then((r) => r.data);

export const sendQuery = (sessionId: string, query: string) =>
  api.post('/agent/query', { sessionId, query }).then((r) => r.data);

export const endSession = (sessionId: string) =>
  api.post(`/agent/session/${sessionId}/end`).then((r) => r.data);

export const getSession = (sessionId: string) =>
  api.get(`/agent/session/${sessionId}`).then((r) => r.data);

export const getSessionHistory = (sessionId: string) =>
  api.get(`/agent/session/${sessionId}/history`).then((r) => r.data);

export const submitFeedback = (data: {
  sessionId?: string;
  executionLogId?: number;
  skillName?: string;
  userId?: number;
  rating: number;
  comment?: string;
  isPositive: boolean;
}) => api.post('/agent/feedback', data).then((r) => r.data);

export const getOptimization = () =>
  api.get('/agent/optimization').then((r) => r.data);

export const getSkills = () => api.get('/skills').then((r) => r.data);
export const getSkill = (name: string) => api.get(`/skills/${name}`).then((r) => r.data);
export const getSkillsByCategory = (category: string) =>
  api.get(`/skills/category/${category}`).then((r) => r.data);
export const getSkillNames = () => api.get('/skills/names').then((r) => r.data);
export const getSkillAnalytics = (name: string) =>
  api.get(`/skills/analytics/${name}`).then((r) => r.data);

export const createSkill = (data: {
  name: string;
  description: string;
  category: string;
  intentPatterns: string;
  parameters?: string;
  outputSchema?: string;
}) => api.post('/skills', data).then((r) => r.data);

export const updateSkill = (name: string, data: {
  description?: string;
  category?: string;
  intentPatterns?: string;
  parameters?: string;
  outputSchema?: string;
  status?: string;
}) => api.put(`/skills/${name}`, data).then((r) => r.data);

export const deleteSkill = (name: string) => api.delete(`/skills/${name}`);

export const addExternalSkill = (data: {
  name: string;
  description: string;
  category: string;
  externalUrl: string;
  apiKey?: string;
}) => api.post('/skills/external', data).then((r) => r.data);

export default api;
