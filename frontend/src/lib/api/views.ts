import apiClient from './client';
import type { View } from './types';

export const getViews = (params?: {
  organizationId?: number;
  teamId?: number;
  projectId?: number;
  visibility?: string;
  q?: string;
}) => apiClient.get<View[]>('/views', { params }).then((r) => r.data);

export const getView = (id: number) => apiClient.get<View>(`/views/${id}`).then((r) => r.data);

export const createView = (data: {
  organizationId: number;
  teamId?: number | null;
  projectId?: number | null;
  name: string;
  description?: string | null;
  filterJson?: string | null;
  groupBy?: string | null;
  sortJson?: string | null;
  visibility?: string;
  isSystem?: boolean;
}) => apiClient.post<View>('/views', data).then((r) => r.data);

export const updateView = (id: number, data: {
  teamId?: number | null;
  projectId?: number | null;
  name?: string;
  description?: string | null;
  filterJson?: string | null;
  groupBy?: string | null;
  sortJson?: string | null;
  visibility?: string;
}) => apiClient.put<View>(`/views/${id}`, data).then((r) => r.data);

export const deleteView = (id: number) => apiClient.delete(`/views/${id}`);
