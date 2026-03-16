import apiClient from './client';
import { Epic, IssueRelation, Membership, Project, Sprint, Team, Workflow } from './types';

export const getProjects = (params?: {
  organizationId?: number;
  teamId?: number;
  status?: string;
  q?: string;
}) => apiClient.get<Project[]>('/projects', { params }).then((r) => r.data);

export const getProject = (id: number) => apiClient.get<Project>(`/projects/${id}`).then((r) => r.data);

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
}) => apiClient.post<Project>('/projects', data).then((r) => r.data);

export const updateProject = (id: number, data: {
  teamId?: number | null;
  key?: string | null;
  name?: string;
  description?: string | null;
  status?: string;
  ownerId?: number | null;
  startDate?: string | null;
  targetDate?: string | null;
}) => apiClient.put<Project>(`/projects/${id}`, data).then((r) => r.data);

export const deleteProject = (id: number) => apiClient.delete(`/projects/${id}`);

export const getTeams = (params?: { organizationId?: number; q?: string }) =>
  apiClient.get<Team[]>('/teams', { params }).then((r) => r.data);

export const getTeam = (id: number) => apiClient.get<Team>(`/teams/${id}`).then((r) => r.data);

export const createTeam = (data: {
  organizationId?: number;
  key: string;
  name: string;
  description?: string | null;
  defaultWorkflowId?: number | null;
}) => apiClient.post<Team>('/teams', data).then((r) => r.data);

export const updateTeam = (id: number, data: {
  name?: string;
  description?: string | null;
  defaultWorkflowId?: number | null;
}) => apiClient.put<Team>(`/teams/${id}`, data).then((r) => r.data);

export const deleteTeam = (id: number) => apiClient.delete(`/teams/${id}`);

export const getMemberships = (params?: {
  organizationId?: number;
  teamId?: number;
  userId?: number;
  active?: boolean;
}) => apiClient.get<Membership[]>('/memberships', { params }).then((r) => r.data);

export const getMembership = (id: number) => apiClient.get<Membership>(`/memberships/${id}`).then((r) => r.data);

export const createMembership = (data: {
  organizationId?: number;
  teamId: number;
  userId: number;
  role?: string;
  title?: string | null;
  active?: boolean;
}) => apiClient.post<Membership>('/memberships', data).then((r) => r.data);

export const updateMembership = (id: number, data: {
  role?: string;
  title?: string | null;
  active?: boolean;
}) => apiClient.put<Membership>(`/memberships/${id}`, data).then((r) => r.data);

export const deleteMembership = (id: number) => apiClient.delete(`/memberships/${id}`);

export const getWorkflows = (params?: { teamId?: number; appliesToType?: string }) =>
  apiClient.get<Workflow[]>('/workflows', { params }).then((r) => r.data);

export const getWorkflow = (id: number) => apiClient.get<Workflow>(`/workflows/${id}`).then((r) => r.data);

export const createWorkflow = (data: {
  teamId: number;
  name: string;
  appliesToType?: string;
  isDefault?: boolean;
  states?: Array<{ key: string; label: string; category: string; sortOrder: number }>;
  transitions?: Array<{ fromStateKey: string; toStateKey: string }>;
}) => apiClient.post<Workflow>('/workflows', data).then((r) => r.data);

export const updateWorkflow = (id: number, data: {
  name?: string;
  appliesToType?: string;
  isDefault?: boolean;
  states?: Array<{ key: string; label: string; category: string; sortOrder: number }>;
  transitions?: Array<{ fromStateKey: string; toStateKey: string }>;
}) => apiClient.put<Workflow>(`/workflows/${id}`, data).then((r) => r.data);

export const deleteWorkflow = (id: number) => apiClient.delete(`/workflows/${id}`);

export const getEpics = (params?: {
  organizationId?: number;
  teamId?: number;
  projectId?: number;
  state?: string;
  q?: string;
}) => apiClient.get<Epic[]>('/epics', { params }).then((r) => r.data);

export const getEpic = (id: number) => apiClient.get<Epic>(`/epics/${id}`).then((r) => r.data);

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
}) => apiClient.post<Epic>('/epics', data).then((r) => r.data);

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
}) => apiClient.put<Epic>(`/epics/${id}`, data).then((r) => r.data);

export const deleteEpic = (id: number) => apiClient.delete(`/epics/${id}`);

export const getSprints = (params?: { teamId?: number; projectId?: number; status?: string; q?: string }) =>
  apiClient.get<Sprint[]>('/sprints', { params }).then((r) => r.data);

export const getSprint = (id: number) => apiClient.get<Sprint>(`/sprints/${id}`).then((r) => r.data);

export const createSprint = (data: {
  teamId: number;
  projectId?: number | null;
  name: string;
  goal?: string | null;
  sequenceNumber?: number;
  status?: string;
  startDate: string;
  endDate: string;
}) => apiClient.post<Sprint>('/sprints', data).then((r) => r.data);

export const updateSprint = (id: number, data: {
  projectId?: number | null;
  name?: string;
  goal?: string | null;
  sequenceNumber?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}) => apiClient.put<Sprint>(`/sprints/${id}`, data).then((r) => r.data);

export const deleteSprint = (id: number) => apiClient.delete(`/sprints/${id}`);

export const getIssueRelations = (issueId: number) =>
  apiClient.get<IssueRelation[]>(`/issues/${issueId}/relations`).then((r) => r.data);

export const createIssueRelation = (
  issueId: number,
  data: { fromIssueId?: number; toIssueId: number; relationType: string }
) =>
  apiClient
    .post<IssueRelation>(`/issues/${issueId}/relations`, {
      fromIssueId: data.fromIssueId ?? issueId,
      toIssueId: data.toIssueId,
      relationType: data.relationType,
    })
    .then((r) => r.data);

export const updateIssueRelation = (
  issueId: number,
  relationId: number,
  data: { toIssueId?: number; relationType?: string }
) => apiClient.put<IssueRelation>(`/issues/${issueId}/relations/${relationId}`, data).then((r) => r.data);

export const deleteIssueRelation = (issueId: number, relationId: number) =>
  apiClient.delete(`/issues/${issueId}/relations/${relationId}`);
