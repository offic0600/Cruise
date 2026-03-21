import apiClient from './client';
import type { Label, LabelCatalog } from './types';

export const getTeamMembers = (params?: { organizationId?: number; teamId?: number }) =>
  apiClient.get('/team-members', { params }).then((r) => r.data);
export const getTeamMember = (id: number) => apiClient.get(`/team-members/${id}`).then((r) => r.data);
export const createTeamMember = (data: { name: string; email?: string; role?: string; skills?: string; teamId?: number }) =>
  apiClient.post('/team-members', data).then((r) => r.data);
export const updateTeamMember = (id: number, data: { name?: string; email?: string; role?: string; skills?: string; teamId?: number }) =>
  apiClient.put(`/team-members/${id}`, data).then((r) => r.data);
export const deleteTeamMember = (id: number) => apiClient.delete(`/team-members/${id}`);

export const getProjectOverview = (projectId: number) => apiClient.get(`/dashboard/project/${projectId}`).then((r) => r.data);
export const getTeamLoad = (teamId: number) => apiClient.get(`/dashboard/team/${teamId}/load`).then((r) => r.data);

export const getLabels = (params?: { organizationId?: number; teamId?: number; q?: string }) =>
  apiClient.get<LabelCatalog>('/labels', { params }).then((r) => r.data);
export const createLabel = (data: {
  organizationId?: number;
  scopeType: 'WORKSPACE' | 'TEAM';
  scopeId?: number | null;
  name: string;
  color?: string;
  description?: string | null;
  sortOrder?: number | null;
  createdBy?: number | null;
}) => apiClient.post<Label>('/labels', data).then((r) => r.data);
export const updateLabel = (id: number, data: { name?: string; color?: string; description?: string | null; sortOrder?: number; archived?: boolean }) =>
  apiClient.put<Label>(`/labels/${id}`, data).then((r) => r.data);
export const deleteLabel = (id: number) => apiClient.delete(`/labels/${id}`);
