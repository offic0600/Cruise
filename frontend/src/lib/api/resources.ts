import apiClient from './client';
import { AgentActivity, CustomerStatus, CustomerTier, Cycle, EntityExternalLink, ExternalEntityInfo, ExternalUser, InitiativeRelation, ProjectStatus, Reaction } from './types';

export const getCycles = (params?: { organizationId?: number; teamId?: number; includeArchived?: boolean }) =>
  apiClient.get<Cycle[]>('/cycles', { params }).then((r) => r.data);
export const createCycle = (data: { organizationId: number; teamId: number; name: string; description?: string | null; number?: number | null; startsAt?: string | null; endsAt?: string | null; completedAt?: string | null }) =>
  apiClient.post<Cycle>('/cycles', data).then((r) => r.data);
export const updateCycle = (id: number, data: { organizationId?: number; teamId?: number; name?: string; description?: string | null; number?: number | null; startsAt?: string | null; endsAt?: string | null; completedAt?: string | null; archivedAt?: string | null }) =>
  apiClient.put<Cycle>(`/cycles/${id}`, data).then((r) => r.data);
export const deleteCycle = (id: number) => apiClient.delete(`/cycles/${id}`);

export const getProjectStatuses = (params?: { organizationId?: number; includeArchived?: boolean }) =>
  apiClient.get<ProjectStatus[]>('/project-statuses', { params }).then((r) => r.data);
export const createProjectStatus = (data: { organizationId: number; name: string; color?: string | null; type?: string; sortOrder?: number | null }) =>
  apiClient.post<ProjectStatus>('/project-statuses', data).then((r) => r.data);
export const updateProjectStatus = (id: number, data: { organizationId?: number; name?: string; color?: string | null; type?: string; sortOrder?: number | null; archivedAt?: string | null }) =>
  apiClient.put<ProjectStatus>(`/project-statuses/${id}`, data).then((r) => r.data);
export const deleteProjectStatus = (id: number) => apiClient.delete(`/project-statuses/${id}`);

export const getInitiativeRelations = (initiativeId: number, params?: { includeArchived?: boolean }) =>
  apiClient.get<InitiativeRelation[]>(`/initiatives/${initiativeId}/relations`, { params }).then((r) => r.data);
export const createInitiativeRelation = (initiativeId: number, data: { relatedInitiativeId: number; sortOrder?: number | null }) =>
  apiClient.post<InitiativeRelation>(`/initiatives/${initiativeId}/relations`, data).then((r) => r.data);
export const updateInitiativeRelation = (initiativeId: number, id: number, data: { relatedInitiativeId?: number; sortOrder?: number | null; archivedAt?: string | null }) =>
  apiClient.put<InitiativeRelation>(`/initiatives/${initiativeId}/relations/${id}`, data).then((r) => r.data);
export const deleteInitiativeRelation = (initiativeId: number, id: number) => apiClient.delete(`/initiatives/${initiativeId}/relations/${id}`);

export const getCustomerStatuses = (params?: { organizationId?: number; includeArchived?: boolean }) =>
  apiClient.get<CustomerStatus[]>('/customer-statuses', { params }).then((r) => r.data);
export const createCustomerStatus = (data: { organizationId: number; name: string; color?: string | null; sortOrder?: number | null }) =>
  apiClient.post<CustomerStatus>('/customer-statuses', data).then((r) => r.data);
export const updateCustomerStatus = (id: number, data: { organizationId?: number; name?: string; color?: string | null; sortOrder?: number | null; archivedAt?: string | null }) =>
  apiClient.put<CustomerStatus>(`/customer-statuses/${id}`, data).then((r) => r.data);
export const deleteCustomerStatus = (id: number) => apiClient.delete(`/customer-statuses/${id}`);

export const getCustomerTiers = (params?: { organizationId?: number; includeArchived?: boolean }) =>
  apiClient.get<CustomerTier[]>('/customer-tiers', { params }).then((r) => r.data);
export const createCustomerTier = (data: { organizationId: number; name: string; color?: string | null; sortOrder?: number | null }) =>
  apiClient.post<CustomerTier>('/customer-tiers', data).then((r) => r.data);
export const updateCustomerTier = (id: number, data: { organizationId?: number; name?: string; color?: string | null; sortOrder?: number | null; archivedAt?: string | null }) =>
  apiClient.put<CustomerTier>(`/customer-tiers/${id}`, data).then((r) => r.data);
export const deleteCustomerTier = (id: number) => apiClient.delete(`/customer-tiers/${id}`);

export const getExternalEntityInfo = (params?: { service?: string; entityType?: string; entityId?: number }) =>
  apiClient.get<ExternalEntityInfo[]>('/external-entity-info', { params }).then((r) => r.data);
export const createExternalEntityInfo = (data: { service: string; entityType: string; entityId: number; externalId: string; externalUrl?: string | null; metadataJson?: string | null }) =>
  apiClient.post<ExternalEntityInfo>('/external-entity-info', data).then((r) => r.data);
export const updateExternalEntityInfo = (id: number, data: { service?: string; entityType?: string; entityId?: number; externalId?: string; externalUrl?: string | null; metadataJson?: string | null }) =>
  apiClient.put<ExternalEntityInfo>(`/external-entity-info/${id}`, data).then((r) => r.data);
export const deleteExternalEntityInfo = (id: number) => apiClient.delete(`/external-entity-info/${id}`);

export const getExternalUsers = (params?: { service?: string }) =>
  apiClient.get<ExternalUser[]>('/external-users', { params }).then((r) => r.data);
export const createExternalUser = (data: { service: string; externalId: string; name?: string | null; avatarUrl?: string | null }) =>
  apiClient.post<ExternalUser>('/external-users', data).then((r) => r.data);
export const updateExternalUser = (id: number, data: { service?: string; externalId?: string; name?: string | null; avatarUrl?: string | null }) =>
  apiClient.put<ExternalUser>(`/external-users/${id}`, data).then((r) => r.data);
export const deleteExternalUser = (id: number) => apiClient.delete(`/external-users/${id}`);

export const getEntityExternalLinks = (params?: { entityType?: string; entityId?: number }) =>
  apiClient.get<EntityExternalLink[]>('/entity-external-links', { params }).then((r) => r.data);
export const createEntityExternalLink = (data: { entityType: string; entityId: number; title: string; url: string }) =>
  apiClient.post<EntityExternalLink>('/entity-external-links', data).then((r) => r.data);
export const updateEntityExternalLink = (id: number, data: { entityType?: string; entityId?: number; title?: string; url?: string }) =>
  apiClient.put<EntityExternalLink>(`/entity-external-links/${id}`, data).then((r) => r.data);
export const deleteEntityExternalLink = (id: number) => apiClient.delete(`/entity-external-links/${id}`);

export const getAgentActivities = (params?: { agentSessionId?: number }) =>
  apiClient.get<AgentActivity[]>('/agent-activities', { params }).then((r) => r.data);
export const createAgentActivity = (data: { agentSessionId: number; type?: string; content?: string | null; issueId?: number | null; commentId?: number | null }) =>
  apiClient.post<AgentActivity>('/agent-activities', data).then((r) => r.data);
export const updateAgentActivity = (id: number, data: { agentSessionId?: number; type?: string; content?: string | null; issueId?: number | null; commentId?: number | null }) =>
  apiClient.put<AgentActivity>(`/agent-activities/${id}`, data).then((r) => r.data);
export const deleteAgentActivity = (id: number) => apiClient.delete(`/agent-activities/${id}`);

export const getReactions = (params?: { issueId?: number; commentId?: number; projectUpdateId?: number; initiativeUpdateId?: number }) =>
  apiClient.get<Reaction[]>('/reactions', { params }).then((r) => r.data);
export const createReaction = (data: { userId: number; issueId?: number | null; commentId?: number | null; projectUpdateId?: number | null; initiativeUpdateId?: number | null; emoji: string }) =>
  apiClient.post<Reaction>('/reactions', data).then((r) => r.data);
export const deleteReaction = (id: number) => apiClient.delete(`/reactions/${id}`);
