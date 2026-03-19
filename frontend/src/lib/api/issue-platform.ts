import apiClient from './client';
import type { EmailIntakeConfig, IssueDraft, IssueTemplate, RecurringIssueDefinition } from './types';

export const getIssueTemplates = (params?: { organizationId?: number; teamId?: number; q?: string }) =>
  apiClient.get<IssueTemplate[]>('/issue-templates', { params }).then((r) => r.data);

export const getIssueTemplate = (id: number) =>
  apiClient.get<IssueTemplate>(`/issue-templates/${id}`).then((r) => r.data);

export const createIssueTemplate = (data: {
  organizationId?: number;
  teamId?: number | null;
  projectId?: number | null;
  name: string;
  title?: string | null;
  description?: string | null;
  type?: string;
  state?: string | null;
  priority?: string | null;
  assigneeId?: number | null;
  estimatePoints?: number | null;
  plannedStartDate?: string | null;
  plannedEndDate?: string | null;
  labelIds?: number[];
  customFields?: Record<string, unknown>;
  subIssues?: string[];
}) => apiClient.post<IssueTemplate>('/issue-templates', data).then((r) => r.data);

export const updateIssueTemplate = (id: number, data: Parameters<typeof createIssueTemplate>[0]) =>
  apiClient.put<IssueTemplate>(`/issue-templates/${id}`, data).then((r) => r.data);

export const deleteIssueTemplate = (id: number) => apiClient.delete(`/issue-templates/${id}`);

export const getIssueDrafts = (params?: { organizationId?: number; teamId?: number; status?: string }) =>
  apiClient.get<IssueDraft[]>('/issue-drafts', { params }).then((r) => r.data);

export const getIssueDraft = (id: number) => apiClient.get<IssueDraft>(`/issue-drafts/${id}`).then((r) => r.data);

export const createIssueDraft = (data: {
  organizationId?: number;
  teamId?: number | null;
  projectId?: number | null;
  templateId?: number | null;
  title?: string | null;
  description?: string | null;
  type?: string;
  state?: string | null;
  priority?: string | null;
  assigneeId?: number | null;
  parentIssueId?: number | null;
  estimatePoints?: number | null;
  plannedStartDate?: string | null;
  plannedEndDate?: string | null;
  labelIds?: number[];
  status?: string;
  customFields?: Record<string, unknown>;
  attachmentsPending?: Array<Record<string, unknown>>;
}) => apiClient.post<IssueDraft>('/issue-drafts', data).then((r) => r.data);

export const updateIssueDraft = (id: number, data: Parameters<typeof createIssueDraft>[0]) =>
  apiClient.put<IssueDraft>(`/issue-drafts/${id}`, data).then((r) => r.data);

export const deleteIssueDraft = (id: number) => apiClient.delete(`/issue-drafts/${id}`);

export const getRecurringIssues = () =>
  apiClient.get<RecurringIssueDefinition[]>('/recurring-issues').then((r) => r.data);

export const createRecurringIssue = (data: {
  organizationId?: number;
  teamId?: number | null;
  projectId: number;
  templateId?: number | null;
  name: string;
  title?: string | null;
  description?: string | null;
  type?: string;
  state?: string | null;
  priority?: string | null;
  assigneeId?: number | null;
  estimatePoints?: number | null;
  cadenceType?: string;
  cadenceInterval?: number;
  weekdays?: string[];
  nextRunAt: string;
  labelIds?: number[];
  active?: boolean;
  customFields?: Record<string, unknown>;
}) => apiClient.post<RecurringIssueDefinition>('/recurring-issues', data).then((r) => r.data);

export const updateRecurringIssue = (id: number, data: Parameters<typeof createRecurringIssue>[0]) =>
  apiClient.put<RecurringIssueDefinition>(`/recurring-issues/${id}`, data).then((r) => r.data);

export const triggerRecurringIssue = (id: number) =>
  apiClient.post(`/recurring-issues/${id}/trigger`).then((r) => r.data);

export const deleteRecurringIssue = (id: number) => apiClient.delete(`/recurring-issues/${id}`);

export const getEmailIntakeConfigs = () =>
  apiClient.get<EmailIntakeConfig[]>('/email-intake/configs').then((r) => r.data);

export const createEmailIntakeConfig = (data: {
  organizationId?: number;
  teamId?: number | null;
  projectId?: number | null;
  templateId?: number | null;
  name: string;
  emailAddress: string;
  active?: boolean;
}) => apiClient.post<EmailIntakeConfig>('/email-intake/configs', data).then((r) => r.data);

export const updateEmailIntakeConfig = (id: number, data: Parameters<typeof createEmailIntakeConfig>[0]) =>
  apiClient.put<EmailIntakeConfig>(`/email-intake/configs/${id}`, data).then((r) => r.data);

export const deleteEmailIntakeConfig = (id: number) => apiClient.delete(`/email-intake/configs/${id}`);
