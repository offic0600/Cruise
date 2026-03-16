import apiClient from './client';

export const getTeamMembers = () => apiClient.get('/team-members').then((r) => r.data);
export const getTeamMember = (id: number) => apiClient.get(`/team-members/${id}`).then((r) => r.data);
export const createTeamMember = (data: { name: string; email?: string; role?: string; skills?: string; teamId?: number }) =>
  apiClient.post('/team-members', data).then((r) => r.data);
export const updateTeamMember = (id: number, data: { name?: string; email?: string; role?: string; skills?: string; teamId?: number }) =>
  apiClient.put(`/team-members/${id}`, data).then((r) => r.data);
export const deleteTeamMember = (id: number) => apiClient.delete(`/team-members/${id}`);

export const getProjectOverview = (projectId: number) => apiClient.get(`/dashboard/project/${projectId}`).then((r) => r.data);
export const getTeamLoad = (teamId: number) => apiClient.get(`/dashboard/team/${teamId}/load`).then((r) => r.data);

export const getIssueTags = () => apiClient.get('/issue-tags').then((r) => r.data);
export const createIssueTag = (data: { name: string; color?: string; sortOrder?: number }) =>
  apiClient.post('/issue-tags', data).then((r) => r.data);
export const updateIssueTag = (id: number, data: { name?: string; color?: string; sortOrder?: number }) =>
  apiClient.put(`/issue-tags/${id}`, data).then((r) => r.data);
export const deleteIssueTag = (id: number) => apiClient.delete(`/issue-tags/${id}`);
