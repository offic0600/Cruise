import apiClient from './client';
import { Comment, CreateOrganizationRequest, CreateOrganizationResponse, Customer, CustomerNeed, Initiative, InitiativeProject, InitiativeUpdate, IssueRelation, Membership, Organization, Project, ProjectMilestone, ProjectUpdate, RestPageResponse, Roadmap, RoadmapProject, SlugAvailability, Team, Workflow } from './types';

export const getOrganizations = () =>
  apiClient.get<Organization[]>('/organizations').then((r) => r.data);

export const checkOrganizationSlugAvailability = (slug: string) =>
  apiClient.get<SlugAvailability>('/organizations/slug-availability', { params: { slug } }).then((r) => r.data);

export const createOrganization = (data: CreateOrganizationRequest) =>
  apiClient.post<CreateOrganizationResponse>('/organizations', data).then((r) => r.data);

export const getProjects = (params?: {
  organizationId?: number;
  teamId?: number;
  status?: string;
  q?: string;
  includeArchived?: boolean;
  page?: number;
  size?: number;
}) => apiClient.get<RestPageResponse<Project>>('/projects', { params }).then((r) => r.data);

export const getInitiatives = (params?: {
  organizationId?: number;
  parentInitiativeId?: number;
  status?: string;
  q?: string;
  includeArchived?: boolean;
  page?: number;
  size?: number;
}) => apiClient.get<RestPageResponse<Initiative>>('/initiatives', { params }).then((r) => r.data);

export const getInitiative = (id: number) => apiClient.get<Initiative>(`/initiatives/${id}`).then((r) => r.data);

export const createInitiative = (data: {
  organizationId?: number;
  parentInitiativeId?: number | null;
  name: string;
  description?: string | null;
  slugId?: string | null;
  status?: string;
  health?: string | null;
  ownerId?: number | null;
  creatorId?: number | null;
  targetDate?: string | null;
}) => apiClient.post<Initiative>('/initiatives', data).then((r) => r.data);

export const updateInitiative = (id: number, data: {
  parentInitiativeId?: number | null;
  name?: string;
  description?: string | null;
  slugId?: string | null;
  status?: string;
  health?: string | null;
  ownerId?: number | null;
  targetDate?: string | null;
  archivedAt?: string | null;
}) => apiClient.put<Initiative>(`/initiatives/${id}`, data).then((r) => r.data);

export const deleteInitiative = (id: number) => apiClient.delete(`/initiatives/${id}`);

export const getInitiativeProjects = (initiativeId: number, params?: { includeArchived?: boolean }) =>
  apiClient.get<InitiativeProject[]>(`/initiatives/${initiativeId}/projects`, { params }).then((r) => r.data);

export const attachInitiativeProject = (initiativeId: number, data: { projectId: number; sortOrder?: number | null }) =>
  apiClient.post<InitiativeProject>(`/initiatives/${initiativeId}/projects`, data).then((r) => r.data);

export const updateInitiativeProject = (initiativeId: number, relationId: number, data: {
  sortOrder?: number | null;
  archivedAt?: string | null;
}) => apiClient.put<InitiativeProject>(`/initiatives/${initiativeId}/projects/${relationId}`, data).then((r) => r.data);

export const deleteInitiativeProject = (initiativeId: number, relationId: number) =>
  apiClient.delete(`/initiatives/${initiativeId}/projects/${relationId}`);

export const getInitiativeUpdates = (initiativeId: number, params?: { includeArchived?: boolean }) =>
  apiClient.get<InitiativeUpdate[]>(`/initiatives/${initiativeId}/updates`, { params }).then((r) => r.data);

export const getInitiativeUpdate = (initiativeId: number, updateId: number) =>
  apiClient.get<InitiativeUpdate>(`/initiatives/${initiativeId}/updates/${updateId}`).then((r) => r.data);

export const createInitiativeUpdate = (initiativeId: number, data: {
  title: string;
  body?: string | null;
  health?: string | null;
  userId?: number | null;
}) => apiClient.post<InitiativeUpdate>(`/initiatives/${initiativeId}/updates`, data).then((r) => r.data);

export const updateInitiativeUpdate = (initiativeId: number, updateId: number, data: {
  title?: string;
  body?: string | null;
  health?: string | null;
  userId?: number | null;
  archivedAt?: string | null;
}) => apiClient.put<InitiativeUpdate>(`/initiatives/${initiativeId}/updates/${updateId}`, data).then((r) => r.data);

export const deleteInitiativeUpdate = (initiativeId: number, updateId: number) =>
  apiClient.delete(`/initiatives/${initiativeId}/updates/${updateId}`);

export const getInitiativeUpdateComments = (initiativeId: number, updateId: number, params?: { includeArchived?: boolean }) =>
  apiClient.get<Comment[]>(`/initiatives/${initiativeId}/updates/${updateId}/comments`, { params }).then((r) => r.data);

export const createInitiativeUpdateComment = (initiativeId: number, updateId: number, data: {
  documentContentId?: number | null;
  parentCommentId?: number | null;
  authorId: number;
  body: string;
}) => apiClient.post<Comment>(`/initiatives/${initiativeId}/updates/${updateId}/comments`, data).then((r) => r.data);

export const updateInitiativeUpdateComment = (initiativeId: number, updateId: number, commentId: number, data: {
  body: string;
  archivedAt?: string | null;
}) => apiClient.put<Comment>(`/initiatives/${initiativeId}/updates/${updateId}/comments/${commentId}`, data).then((r) => r.data);

export const deleteInitiativeUpdateComment = (initiativeId: number, updateId: number, commentId: number) =>
  apiClient.delete(`/initiatives/${initiativeId}/updates/${updateId}/comments/${commentId}`);

export const getCustomers = (params?: {
  organizationId?: number;
  statusId?: number;
  q?: string;
  includeArchived?: boolean;
  page?: number;
  size?: number;
}) => apiClient.get<RestPageResponse<Customer>>('/customers', { params }).then((r) => r.data);

export const getCustomer = (id: number) => apiClient.get<Customer>(`/customers/${id}`).then((r) => r.data);

export const createCustomer = (data: {
  organizationId?: number;
  name: string;
  slugId?: string | null;
  ownerId?: number | null;
  statusId?: number | null;
  tierId?: number | null;
  integrationId?: number | null;
  domains?: string | null;
  externalIds?: string | null;
  logoUrl?: string | null;
}) => apiClient.post<Customer>('/customers', data).then((r) => r.data);

export const updateCustomer = (id: number, data: {
  name?: string;
  slugId?: string | null;
  ownerId?: number | null;
  statusId?: number | null;
  tierId?: number | null;
  integrationId?: number | null;
  domains?: string | null;
  externalIds?: string | null;
  logoUrl?: string | null;
  archivedAt?: string | null;
}) => apiClient.put<Customer>(`/customers/${id}`, data).then((r) => r.data);

export const deleteCustomer = (id: number) => apiClient.delete(`/customers/${id}`);

export const getCustomerNeeds = (customerId: number, params?: { includeArchived?: boolean }) =>
  apiClient.get<CustomerNeed[]>(`/customers/${customerId}/needs`, { params }).then((r) => r.data);

export const createCustomerNeed = (customerId: number, data: {
  projectId?: number | null;
  title: string;
  description?: string | null;
  priority?: string;
  status?: string;
}) => apiClient.post<CustomerNeed>(`/customers/${customerId}/needs`, data).then((r) => r.data);

export const updateCustomerNeed = (customerId: number, needId: number, data: {
  projectId?: number | null;
  title?: string;
  description?: string | null;
  priority?: string;
  status?: string;
  archivedAt?: string | null;
}) => apiClient.put<CustomerNeed>(`/customers/${customerId}/needs/${needId}`, data).then((r) => r.data);

export const deleteCustomerNeed = (customerId: number, needId: number) =>
  apiClient.delete(`/customers/${customerId}/needs/${needId}`);

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

export const getProjectMilestones = (projectId: number, params?: { includeArchived?: boolean }) =>
  apiClient.get<ProjectMilestone[]>(`/projects/${projectId}/milestones`, { params }).then((r) => r.data);

export const getProjectMilestone = (projectId: number, milestoneId: number) =>
  apiClient.get<ProjectMilestone>(`/projects/${projectId}/milestones/${milestoneId}`).then((r) => r.data);

export const createProjectMilestone = (projectId: number, data: {
  name: string;
  description?: string | null;
  targetDate?: string | null;
  status?: string;
  sortOrder?: number | null;
}) => apiClient.post<ProjectMilestone>(`/projects/${projectId}/milestones`, data).then((r) => r.data);

export const updateProjectMilestone = (projectId: number, milestoneId: number, data: {
  name?: string;
  description?: string | null;
  targetDate?: string | null;
  status?: string;
  sortOrder?: number | null;
  archivedAt?: string | null;
}) => apiClient.put<ProjectMilestone>(`/projects/${projectId}/milestones/${milestoneId}`, data).then((r) => r.data);

export const deleteProjectMilestone = (projectId: number, milestoneId: number) =>
  apiClient.delete(`/projects/${projectId}/milestones/${milestoneId}`);

export const getProjectUpdates = (projectId: number, params?: { includeArchived?: boolean }) =>
  apiClient.get<ProjectUpdate[]>(`/projects/${projectId}/updates`, { params }).then((r) => r.data);

export const getProjectUpdate = (projectId: number, updateId: number) =>
  apiClient.get<ProjectUpdate>(`/projects/${projectId}/updates/${updateId}`).then((r) => r.data);

export const createProjectUpdate = (projectId: number, data: {
  title: string;
  body?: string | null;
  health?: string | null;
  userId?: number | null;
}) => apiClient.post<ProjectUpdate>(`/projects/${projectId}/updates`, data).then((r) => r.data);

export const updateProjectUpdate = (projectId: number, updateId: number, data: {
  title?: string;
  body?: string | null;
  health?: string | null;
  userId?: number | null;
  archivedAt?: string | null;
}) => apiClient.put<ProjectUpdate>(`/projects/${projectId}/updates/${updateId}`, data).then((r) => r.data);

export const deleteProjectUpdate = (projectId: number, updateId: number) =>
  apiClient.delete(`/projects/${projectId}/updates/${updateId}`);

export const getProjectUpdateComments = (projectId: number, updateId: number, params?: { includeArchived?: boolean }) =>
  apiClient.get<Comment[]>(`/projects/${projectId}/updates/${updateId}/comments`, { params }).then((r) => r.data);

export const createProjectUpdateComment = (projectId: number, updateId: number, data: {
  documentContentId?: number | null;
  parentCommentId?: number | null;
  authorId: number;
  body: string;
}) => apiClient.post<Comment>(`/projects/${projectId}/updates/${updateId}/comments`, data).then((r) => r.data);

export const updateProjectUpdateComment = (projectId: number, updateId: number, commentId: number, data: {
  body: string;
  archivedAt?: string | null;
}) => apiClient.put<Comment>(`/projects/${projectId}/updates/${updateId}/comments/${commentId}`, data).then((r) => r.data);

export const deleteProjectUpdateComment = (projectId: number, updateId: number, commentId: number) =>
  apiClient.delete(`/projects/${projectId}/updates/${updateId}/comments/${commentId}`);

export const getRoadmaps = (params?: {
  organizationId?: number;
  q?: string;
  includeArchived?: boolean;
  page?: number;
  size?: number;
}) => apiClient.get<RestPageResponse<Roadmap>>('/roadmaps', { params }).then((r) => r.data);

export const getRoadmap = (id: number) => apiClient.get<Roadmap>(`/roadmaps/${id}`).then((r) => r.data);

export const createRoadmap = (data: {
  organizationId?: number;
  name: string;
  description?: string | null;
  color?: string | null;
  slugId?: string | null;
  sortOrder?: number | null;
  ownerId?: number | null;
  creatorId?: number | null;
}) => apiClient.post<Roadmap>('/roadmaps', data).then((r) => r.data);

export const updateRoadmap = (id: number, data: {
  name?: string;
  description?: string | null;
  color?: string | null;
  slugId?: string | null;
  sortOrder?: number | null;
  ownerId?: number | null;
  creatorId?: number | null;
  archivedAt?: string | null;
}) => apiClient.put<Roadmap>(`/roadmaps/${id}`, data).then((r) => r.data);

export const deleteRoadmap = (id: number) => apiClient.delete(`/roadmaps/${id}`);

export const getRoadmapProjects = (roadmapId: number, params?: { includeArchived?: boolean }) =>
  apiClient.get<RoadmapProject[]>(`/roadmaps/${roadmapId}/projects`, { params }).then((r) => r.data);

export const attachRoadmapProject = (roadmapId: number, data: { projectId: number; sortOrder?: number | null }) =>
  apiClient.post<RoadmapProject>(`/roadmaps/${roadmapId}/projects`, data).then((r) => r.data);

export const updateRoadmapProject = (roadmapId: number, relationId: number, data: {
  sortOrder?: number | null;
  archivedAt?: string | null;
}) => apiClient.put<RoadmapProject>(`/roadmaps/${roadmapId}/projects/${relationId}`, data).then((r) => r.data);

export const deleteRoadmapProject = (roadmapId: number, relationId: number) =>
  apiClient.delete(`/roadmaps/${roadmapId}/projects/${relationId}`);

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
