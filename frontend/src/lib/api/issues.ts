import apiClient from './client';
import {
  Issue,
  RestPageResponse,
  mapBugIssue,
  mapFeatureIssue,
  mapTaskIssue,
} from './types';

export const getIssues = (params?: {
  type?: string;
  organizationId?: number;
  teamId?: number;
  projectId?: number;
  assigneeId?: number;
  parentIssueId?: number;
  state?: string;
  q?: string;
  priority?: string;
  customFieldFilters?: Record<string, unknown>;
  includeArchived?: boolean;
  page?: number;
  size?: number;
}) => apiClient.get<RestPageResponse<Issue>>('/issues', {
  params: {
    ...params,
    customFieldFilters: params?.customFieldFilters ? JSON.stringify(params.customFieldFilters) : undefined,
  },
}).then((r) => r.data);

export const getIssue = (id: number) => apiClient.get<Issue>(`/issues/${id}`).then((r) => r.data);

export const createIssue = (data: {
  organizationId?: number;
  type: string;
  title: string;
  description?: string;
  state?: string;
  resolution?: string | null;
  priority?: string;
  projectId?: number | null;
  teamId?: number | null;
  parentIssueId?: number | null;
  assigneeId?: number | null;
  reporterId?: number | null;
  estimatePoints?: number | null;
  progress?: number;
  plannedStartDate?: string | null;
  plannedEndDate?: string | null;
  labelIds?: number[];
  estimatedHours?: number;
  actualHours?: number;
  severity?: string | null;
  customFields?: Record<string, unknown>;
}) => apiClient.post<Issue>('/issues', data).then((r) => r.data);

export const updateIssue = (
  id: number,
  data: {
    organizationId?: number;
    title?: string;
    description?: string;
    state?: string;
    resolution?: string | null;
    priority?: string;
    projectId?: number | null;
    teamId?: number | null;
    parentIssueId?: number | null;
    assigneeId?: number | null;
    reporterId?: number | null;
    estimatePoints?: number | null;
    progress?: number;
    plannedStartDate?: string | null;
    plannedEndDate?: string | null;
    labelIds?: number[];
    estimatedHours?: number;
    actualHours?: number;
    severity?: string | null;
    customFields?: Record<string, unknown>;
  }
) => apiClient.put<Issue>(`/issues/${id}`, data).then((r) => r.data);

export const updateIssueState = (id: number, state: string, resolution?: string | null) =>
  apiClient.patch<Issue>(`/issues/${id}/state`, { state, resolution }).then((r) => r.data);

export const deleteIssue = (id: number) => apiClient.delete(`/issues/${id}`);

export const getFeatureIssues = () =>
  getIssues({ type: 'FEATURE' }).then((response) => response.items.map(mapFeatureIssue));

export const createFeatureIssue = (data: {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  projectId?: number | null;
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
    customFields: {
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
    },
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
      customFields: {
        ...issue.customFields,
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
      },
    }).then(mapFeatureIssue)
  );

export const getTaskIssues = () =>
  getIssues({ type: 'TASK' }).then((response) => response.items.map(mapTaskIssue));

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
      customFields: {
        estimatedDays: data.estimatedDays ?? null,
        plannedDays: data.plannedDays ?? null,
        remainingDays: data.remainingDays ?? null,
      },
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
      customFields: {
        ...issue.customFields,
        estimatedDays: data.estimatedDays,
        plannedDays: data.plannedDays,
        remainingDays: data.remainingDays,
      },
    }).then(mapTaskIssue)
  );

export const logTaskIssueHours = (id: number, hours: number) =>
  getIssue(id).then((issue) =>
    updateIssue(id, {
      actualHours: (issue.actualHours ?? 0) + hours,
    }).then(mapTaskIssue)
  );

export const getBugIssues = () =>
  getIssues({ type: 'BUG' }).then((response) => response.items.map(mapBugIssue));

export const createBugIssue = (data: {
  title: string;
  description?: string;
  severity?: string;
  projectId?: number | null;
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
