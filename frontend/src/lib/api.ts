import axios from 'axios';
import { defaultLocale, getLocaleFromPathname, localizePath } from '@/i18n/config';

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
      const locale = getLocaleFromPathname(window.location.pathname) ?? defaultLocale;
      window.location.href = localizePath(locale, '/login');
    }
    return Promise.reject(error);
  }
);

export interface Issue {
  id: number;
  organizationId: number;
  epicId: number | null;
  sprintId: number | null;
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
  organizationId?: number;
  epicId?: number;
  sprintId?: number;
  projectId?: number;
  assigneeId?: number;
  parentIssueId?: number;
  state?: string;
  q?: string;
}) => api.get<Issue[]>('/issues', { params }).then((r) => r.data);

export const getIssue = (id: number) => api.get<Issue>(`/issues/${id}`).then((r) => r.data);

export const createIssue = (data: {
  organizationId?: number;
  epicId?: number | null;
  sprintId?: number | null;
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
  organizationId?: number;
  epicId?: number | null;
  sprintId?: number | null;
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

export interface Project {
  id: number;
  organizationId: number;
  teamId: number | null;
  key: string | null;
  name: string;
  description: string | null;
  status: 'PLANNED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED' | string;
  ownerId: number | null;
  startDate: string | null;
  targetDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: number;
  organizationId: number;
  key: string;
  name: string;
  description: string | null;
  defaultWorkflowId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Membership {
  id: number;
  organizationId: number;
  teamId: number;
  userId: number;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER' | string;
  title: string | null;
  joinedAt: string;
  active: boolean;
}

export interface WorkflowState {
  id: number;
  key: string;
  label: string;
  category: 'BACKLOG' | 'ACTIVE' | 'REVIEW' | 'COMPLETED' | 'CANCELED' | string;
  sortOrder: number;
}

export interface WorkflowTransition {
  id: number;
  fromStateKey: string;
  toStateKey: string;
}

export interface Workflow {
  id: number;
  teamId: number;
  name: string;
  appliesToType: 'FEATURE' | 'TASK' | 'BUG' | 'ALL' | string;
  isDefault: boolean;
  createdAt: string;
  states: WorkflowState[];
  transitions: WorkflowTransition[];
}

export interface Epic {
  id: number;
  organizationId: number;
  teamId: number;
  projectId: number | null;
  identifier: string;
  title: string;
  description: string | null;
  state: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELED' | string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | string;
  ownerId: number | null;
  reporterId: number | null;
  startDate: string | null;
  targetDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Sprint {
  id: number;
  teamId: number;
  projectId: number | null;
  name: string;
  goal: string | null;
  sequenceNumber: number;
  status: 'PLANNED' | 'ACTIVE' | 'CLOSED' | 'CANCELED' | string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface IssueRelation {
  id: number;
  fromIssueId: number;
  toIssueId: number;
  relationType: 'BLOCKS' | 'BLOCKED_BY' | 'RELATES_TO' | 'DUPLICATES' | 'CAUSED_BY' | 'SPLIT_FROM' | string;
  createdAt: string;
}

export interface DocRevision {
  id: number;
  docId: number;
  versionNumber: number;
  content: string;
  authorId: number;
  createdAt: string;
}

export interface Doc {
  id: number;
  organizationId: number;
  teamId: number | null;
  projectId: number | null;
  epicId: number | null;
  issueId: number | null;
  title: string;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | string;
  authorId: number;
  currentRevisionId: number | null;
  createdAt: string;
  updatedAt: string;
  currentRevision: DocRevision | null;
  revisions: DocRevision[];
}

export interface Comment {
  id: number;
  issueId: number | null;
  epicId: number | null;
  docId: number | null;
  parentCommentId: number | null;
  authorId: number;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityEvent {
  id: number;
  actorId: number | null;
  entityType: 'ISSUE' | 'EPIC' | 'SPRINT' | 'DOC' | 'COMMENT' | string;
  entityId: number;
  actionType: string;
  summary: string;
  payloadJson: string | null;
  createdAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  eventId: number;
  type: 'ASSIGNMENT' | 'MENTION' | 'COMMENT' | 'STATE_CHANGE' | 'SYSTEM' | string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

export const getProjects = (params?: {
  organizationId?: number;
  teamId?: number;
  status?: string;
  q?: string;
}) => api.get<Project[]>('/projects', { params }).then((r) => r.data);

export const getProject = (id: number) => api.get<Project>(`/projects/${id}`).then((r) => r.data);

export const createProject = (data: {
  organizationId?: number;
  teamId?: number | null;
  key?: string | null;
  name: string;
  description?: string | null;
  status?: string;
  ownerId?: number | null;
  startDate?: string | null;
  targetDate?: string | null;
}) => api.post<Project>('/projects', data).then((r) => r.data);

export const updateProject = (id: number, data: {
  teamId?: number | null;
  key?: string | null;
  name?: string;
  description?: string | null;
  status?: string;
  ownerId?: number | null;
  startDate?: string | null;
  targetDate?: string | null;
}) => api.put<Project>(`/projects/${id}`, data).then((r) => r.data);

export const deleteProject = (id: number) => api.delete(`/projects/${id}`);

export const getTeams = (params?: {
  organizationId?: number;
  q?: string;
}) => api.get<Team[]>('/teams', { params }).then((r) => r.data);

export const getTeam = (id: number) => api.get<Team>(`/teams/${id}`).then((r) => r.data);

export const createTeam = (data: {
  organizationId?: number;
  key: string;
  name: string;
  description?: string | null;
  defaultWorkflowId?: number | null;
}) => api.post<Team>('/teams', data).then((r) => r.data);

export const updateTeam = (id: number, data: {
  name?: string;
  description?: string | null;
  defaultWorkflowId?: number | null;
}) => api.put<Team>(`/teams/${id}`, data).then((r) => r.data);

export const deleteTeam = (id: number) => api.delete(`/teams/${id}`);

export const getMemberships = (params?: {
  organizationId?: number;
  teamId?: number;
  userId?: number;
  active?: boolean;
}) => api.get<Membership[]>('/memberships', { params }).then((r) => r.data);

export const getMembership = (id: number) =>
  api.get<Membership>(`/memberships/${id}`).then((r) => r.data);

export const createMembership = (data: {
  organizationId?: number;
  teamId: number;
  userId: number;
  role?: string;
  title?: string | null;
  active?: boolean;
}) => api.post<Membership>('/memberships', data).then((r) => r.data);

export const updateMembership = (id: number, data: {
  role?: string;
  title?: string | null;
  active?: boolean;
}) => api.put<Membership>(`/memberships/${id}`, data).then((r) => r.data);

export const deleteMembership = (id: number) => api.delete(`/memberships/${id}`);

export const getWorkflows = (params?: {
  teamId?: number;
  appliesToType?: string;
}) => api.get<Workflow[]>('/workflows', { params }).then((r) => r.data);

export const getWorkflow = (id: number) =>
  api.get<Workflow>(`/workflows/${id}`).then((r) => r.data);

export const createWorkflow = (data: {
  teamId: number;
  name: string;
  appliesToType?: string;
  isDefault?: boolean;
  states?: Array<{ key: string; label: string; category: string; sortOrder: number }>;
  transitions?: Array<{ fromStateKey: string; toStateKey: string }>;
}) => api.post<Workflow>('/workflows', data).then((r) => r.data);

export const updateWorkflow = (id: number, data: {
  name?: string;
  appliesToType?: string;
  isDefault?: boolean;
  states?: Array<{ key: string; label: string; category: string; sortOrder: number }>;
  transitions?: Array<{ fromStateKey: string; toStateKey: string }>;
}) => api.put<Workflow>(`/workflows/${id}`, data).then((r) => r.data);

export const deleteWorkflow = (id: number) => api.delete(`/workflows/${id}`);

export const getEpics = (params?: {
  organizationId?: number;
  teamId?: number;
  projectId?: number;
  state?: string;
  q?: string;
}) => api.get<Epic[]>('/epics', { params }).then((r) => r.data);

export const getEpic = (id: number) => api.get<Epic>(`/epics/${id}`).then((r) => r.data);

export const createEpic = (data: {
  organizationId?: number;
  teamId: number;
  projectId?: number | null;
  title: string;
  description?: string | null;
  state?: string;
  priority?: string;
  ownerId?: number | null;
  reporterId?: number | null;
  startDate?: string | null;
  targetDate?: string | null;
}) => api.post<Epic>('/epics', data).then((r) => r.data);

export const updateEpic = (id: number, data: {
  projectId?: number | null;
  title?: string;
  description?: string | null;
  state?: string;
  priority?: string;
  ownerId?: number | null;
  reporterId?: number | null;
  startDate?: string | null;
  targetDate?: string | null;
}) => api.put<Epic>(`/epics/${id}`, data).then((r) => r.data);

export const deleteEpic = (id: number) => api.delete(`/epics/${id}`);

export const getSprints = (params?: {
  teamId?: number;
  projectId?: number;
  status?: string;
  q?: string;
}) => api.get<Sprint[]>('/sprints', { params }).then((r) => r.data);

export const getSprint = (id: number) => api.get<Sprint>(`/sprints/${id}`).then((r) => r.data);

export const createSprint = (data: {
  teamId: number;
  projectId?: number | null;
  name: string;
  goal?: string | null;
  sequenceNumber?: number;
  status?: string;
  startDate: string;
  endDate: string;
}) => api.post<Sprint>('/sprints', data).then((r) => r.data);

export const updateSprint = (id: number, data: {
  projectId?: number | null;
  name?: string;
  goal?: string | null;
  sequenceNumber?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}) => api.put<Sprint>(`/sprints/${id}`, data).then((r) => r.data);

export const deleteSprint = (id: number) => api.delete(`/sprints/${id}`);

export const getIssueRelations = (issueId: number) =>
  api.get<IssueRelation[]>(`/issues/${issueId}/relations`).then((r) => r.data);

export const createIssueRelation = (
  issueId: number,
  data: {
    fromIssueId?: number;
    toIssueId: number;
    relationType: string;
  }
) =>
  api
    .post<IssueRelation>(`/issues/${issueId}/relations`, {
      fromIssueId: data.fromIssueId ?? issueId,
      toIssueId: data.toIssueId,
      relationType: data.relationType,
    })
    .then((r) => r.data);

export const updateIssueRelation = (
  issueId: number,
  relationId: number,
  data: {
    toIssueId?: number;
    relationType?: string;
  }
) => api.put<IssueRelation>(`/issues/${issueId}/relations/${relationId}`, data).then((r) => r.data);

export const deleteIssueRelation = (issueId: number, relationId: number) =>
  api.delete(`/issues/${issueId}/relations/${relationId}`);

export const getDocs = (params?: {
  organizationId?: number;
  teamId?: number;
  projectId?: number;
  epicId?: number;
  issueId?: number;
  status?: string;
  q?: string;
}) => api.get<Doc[]>('/docs', { params }).then((r) => r.data);

export const getDoc = (id: number) => api.get<Doc>(`/docs/${id}`).then((r) => r.data);

export const createDoc = (data: {
  organizationId?: number;
  teamId?: number | null;
  projectId?: number | null;
  epicId?: number | null;
  issueId?: number | null;
  title: string;
  slug?: string | null;
  status?: string;
  authorId: number;
  content: string;
}) => api.post<Doc>('/docs', data).then((r) => r.data);

export const updateDoc = (id: number, data: {
  teamId?: number | null;
  projectId?: number | null;
  epicId?: number | null;
  issueId?: number | null;
  title?: string;
  slug?: string | null;
  status?: string;
  authorId?: number | null;
  content?: string;
}) => api.put<Doc>(`/docs/${id}`, data).then((r) => r.data);

export const deleteDoc = (id: number) => api.delete(`/docs/${id}`);

export const getComments = (params?: {
  issueId?: number;
  epicId?: number;
  docId?: number;
  authorId?: number;
}) => api.get<Comment[]>('/comments', { params }).then((r) => r.data);

export const getComment = (id: number) =>
  api.get<Comment>(`/comments/${id}`).then((r) => r.data);

export const createComment = (data: {
  issueId?: number | null;
  epicId?: number | null;
  docId?: number | null;
  parentCommentId?: number | null;
  authorId: number;
  body: string;
}) => api.post<Comment>('/comments', data).then((r) => r.data);

export const updateComment = (id: number, data: { body: string }) =>
  api.put<Comment>(`/comments/${id}`, data).then((r) => r.data);

export const deleteComment = (id: number) => api.delete(`/comments/${id}`);

export const getActivityEvents = (params?: {
  actorId?: number;
  entityType?: string;
  entityId?: number;
  actionType?: string;
}) => api.get<ActivityEvent[]>('/activity', { params }).then((r) => r.data);

export const getActivityEvent = (id: number) =>
  api.get<ActivityEvent>(`/activity/${id}`).then((r) => r.data);

export const createActivityEvent = (data: {
  actorId?: number | null;
  entityType: string;
  entityId: number;
  actionType: string;
  summary: string;
  payloadJson?: string | null;
}) => api.post<ActivityEvent>('/activity', data).then((r) => r.data);

export const updateActivityEvent = (id: number, data: {
  summary?: string;
  payloadJson?: string | null;
}) => api.put<ActivityEvent>(`/activity/${id}`, data).then((r) => r.data);

export const deleteActivityEvent = (id: number) => api.delete(`/activity/${id}`);

export const getNotifications = (params?: {
  userId?: number;
  unreadOnly?: boolean;
  type?: string;
}) => api.get<Notification[]>('/notifications', { params }).then((r) => r.data);

export const getNotification = (id: number) =>
  api.get<Notification>(`/notifications/${id}`).then((r) => r.data);

export const createNotification = (data: {
  userId: number;
  eventId: number;
  type?: string;
  title: string;
  body: string;
  readAt?: string | null;
}) => api.post<Notification>('/notifications', data).then((r) => r.data);

export const updateNotification = (id: number, data: {
  title?: string;
  body?: string;
  readAt?: string | null;
}) => api.put<Notification>(`/notifications/${id}`, data).then((r) => r.data);

export const markNotificationRead = (id: number) =>
  api.patch<Notification>(`/notifications/${id}/read`).then((r) => r.data);

export const deleteNotification = (id: number) => api.delete(`/notifications/${id}`);

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
