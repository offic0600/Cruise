import apiClient from './client';
import { ActivityEvent, Comment, Doc, IssueAttachment, Notification } from './types';

export const getDocs = (params?: {
  organizationId?: number;
  teamId?: number;
  projectId?: number;
  issueId?: number;
  initiativeId?: number;
  status?: string;
  q?: string;
  includeArchived?: boolean;
}) => apiClient.get<Doc[]>('/docs', { params }).then((r) => r.data);

export const getDoc = (id: number) => apiClient.get<Doc>(`/docs/${id}`).then((r) => r.data);

export const createDoc = (data: {
  organizationId?: number;
  teamId?: number | null;
  projectId?: number | null;
  issueId?: number | null;
  initiativeId?: number | null;
  title: string;
  slug?: string | null;
  status?: string;
  authorId: number;
  content: string;
}) => apiClient.post<Doc>('/docs', data).then((r) => r.data);

export const updateDoc = (id: number, data: {
  teamId?: number | null;
  projectId?: number | null;
  issueId?: number | null;
  initiativeId?: number | null;
  title?: string;
  slug?: string | null;
  status?: string;
  authorId?: number | null;
  content?: string;
  archivedAt?: string | null;
}) => apiClient.put<Doc>(`/docs/${id}`, data).then((r) => r.data);

export const deleteDoc = (id: number) => apiClient.delete(`/docs/${id}`);

export const getComments = (params?: {
  targetType?: string;
  targetId?: number;
  documentContentId?: number;
  authorId?: number;
  includeArchived?: boolean;
}) =>
  apiClient.get<Comment[]>('/comments', { params }).then((r) => r.data);

export const getComment = (id: number) => apiClient.get<Comment>(`/comments/${id}`).then((r) => r.data);

export const createComment = (data: {
  targetType: string;
  targetId: number;
  documentContentId?: number | null;
  parentCommentId?: number | null;
  authorId: number;
  body: string;
}) => apiClient.post<Comment>('/comments', data).then((r) => r.data);

export const updateComment = (id: number, data: { body: string; archivedAt?: string | null }) =>
  apiClient.put<Comment>(`/comments/${id}`, data).then((r) => r.data);

export const deleteComment = (id: number) => apiClient.delete(`/comments/${id}`);

export const getActivityEvents = (params?: {
  actorId?: number;
  entityType?: string;
  entityId?: number;
  actionType?: string;
}) => apiClient.get<ActivityEvent[]>('/activity', { params }).then((r) => r.data);

export const getActivityEvent = (id: number) =>
  apiClient.get<ActivityEvent>(`/activity/${id}`).then((r) => r.data);

export const createActivityEvent = (data: {
  actorId?: number | null;
  entityType: string;
  entityId: number;
  actionType: string;
  summary: string;
  payloadJson?: string | null;
}) => apiClient.post<ActivityEvent>('/activity', data).then((r) => r.data);

export const updateActivityEvent = (id: number, data: { summary?: string; payloadJson?: string | null }) =>
  apiClient.put<ActivityEvent>(`/activity/${id}`, data).then((r) => r.data);

export const deleteActivityEvent = (id: number) => apiClient.delete(`/activity/${id}`);

export const getNotifications = (params?: { userId?: number; unreadOnly?: boolean; type?: string }) =>
  apiClient.get<Notification[]>('/notifications', { params }).then((r) => r.data);

export const getNotification = (id: number) =>
  apiClient.get<Notification>(`/notifications/${id}`).then((r) => r.data);

export const createNotification = (data: {
  userId: number;
  eventId: number;
  type?: string;
  title: string;
  body: string;
  readAt?: string | null;
}) => apiClient.post<Notification>('/notifications', data).then((r) => r.data);

export const updateNotification = (id: number, data: { title?: string; body?: string; readAt?: string | null }) =>
  apiClient.put<Notification>(`/notifications/${id}`, data).then((r) => r.data);

export const markNotificationRead = (id: number) =>
  apiClient.patch<Notification>(`/notifications/${id}/read`).then((r) => r.data);

export const deleteNotification = (id: number) => apiClient.delete(`/notifications/${id}`);

export const getIssueAttachments = (issueId: number) =>
  apiClient.get<IssueAttachment[]>(`/issues/${issueId}/attachments`).then((r) => r.data);

export const uploadIssueAttachment = (issueId: number, data: { file: File; uploadedBy?: number | null }) => {
  const formData = new FormData();
  formData.append('file', data.file);
  if (data.uploadedBy != null) {
    formData.append('uploadedBy', String(data.uploadedBy));
  }
  return apiClient.post<IssueAttachment>(`/issues/${issueId}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);
};

export const createIssueLinkAttachments = (
  issueId: number,
  data: Array<{ url: string; title?: string | null; metadataJson?: string | null; uploadedBy?: number | null }>
) => apiClient.post<IssueAttachment[]>(`/issues/${issueId}/attachments/links`, data).then((r) => r.data);

export const deleteIssueAttachment = (issueId: number, attachmentId: number) =>
  apiClient.delete(`/issues/${issueId}/attachments/${attachmentId}`);

export const downloadIssueAttachment = async (issueId: number, attachmentId: number, filename: string) => {
  const response = await apiClient.get<Blob>(`/issues/${issueId}/attachments/${attachmentId}/download`, {
    responseType: 'blob',
  });
  const blobUrl = window.URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
};
