import apiClient from './client';
import type {
  View,
  ViewLayout,
  ViewQueryState,
  ViewResourceType,
  ViewResultsResponse,
  ViewScopeType,
  ViewVisibility,
} from './types';

export const getViews = (params?: {
  organizationId?: number;
  resourceType?: ViewResourceType;
  scopeType?: ViewScopeType;
  scopeId?: number;
  includeSystem?: boolean;
  includeFavorites?: boolean;
  q?: string;
}) => apiClient.get<View[]>('/views', { params }).then((r) => r.data);

export const getView = (id: number) => apiClient.get<View>(`/views/${id}`).then((r) => r.data);

export const createView = (data: {
  organizationId: number;
  resourceType: ViewResourceType;
  scopeType: ViewScopeType;
  scopeId?: number | null;
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  visibility?: ViewVisibility;
  layout?: ViewLayout;
  queryState?: ViewQueryState | null;
  isSystem?: boolean;
  systemKey?: string | null;
}) => apiClient.post<View>('/views', data).then((r) => r.data);

export const updateView = (id: number, data: {
  name?: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  visibility?: ViewVisibility;
  layout?: ViewLayout;
  position?: number;
  queryState?: ViewQueryState | null;
}) => apiClient.put<View>(`/views/${id}`, data).then((r) => r.data);

export const duplicateView = (id: number) =>
  apiClient.post<View>(`/views/${id}/duplicate`).then((r) => r.data);

export const favoriteView = (id: number) =>
  apiClient.post<View>(`/views/${id}/favorite`).then((r) => r.data);

export const unfavoriteView = (id: number) =>
  apiClient.delete<View>(`/views/${id}/favorite`).then((r) => r.data);

export const deleteView = (id: number) => apiClient.delete(`/views/${id}`);

export const getViewResults = <T = unknown>(id: number, data?: { page?: number; size?: number; queryState?: ViewQueryState | null }) =>
  apiClient.post<ViewResultsResponse<T>>(`/views/${id}/results`, data ?? {}).then((r) => r.data);

export const getViewPreviewResults = <T = unknown>(data: {
  organizationId: number;
  resourceType: ViewResourceType;
  scopeType: ViewScopeType;
  scopeId?: number | null;
  queryState?: ViewQueryState | null;
  page?: number;
  size?: number;
}) => apiClient.post<ViewResultsResponse<T>>('/views/preview-results', data).then((r) => r.data);
