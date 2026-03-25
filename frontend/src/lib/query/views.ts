import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createView,
  deleteView,
  duplicateView,
  favoriteView,
  getView,
  getViewResults,
  getViews,
  unfavoriteView,
  updateView,
} from '@/lib/api/views';
import type { Issue, Project, ViewQueryState, ViewResourceType, ViewScopeType } from '@/lib/api/types';
import { queryKeys } from './keys';

export function useViewsIndex(params: {
  organizationId?: number | null;
  resourceType?: ViewResourceType;
  scopeType?: ViewScopeType;
  scopeId?: number | null;
  includeSystem?: boolean;
  includeFavorites?: boolean;
  q?: string;
}) {
  return useQuery({
    queryKey: queryKeys.viewsIndex({
      organizationId: params.organizationId ?? null,
      resourceType: params.resourceType ?? null,
      scopeType: params.scopeType ?? null,
      scopeId: params.scopeId ?? null,
      includeSystem: params.includeSystem ?? true,
      includeFavorites: params.includeFavorites ?? true,
      q: params.q ?? '',
    }),
    queryFn: () =>
      getViews({
        organizationId: params.organizationId ?? undefined,
        resourceType: params.resourceType,
        scopeType: params.scopeType,
        scopeId: params.scopeId ?? undefined,
        includeSystem: params.includeSystem,
        includeFavorites: params.includeFavorites,
        q: params.q,
      }),
    enabled: params.organizationId != null,
  });
}

export function useViewDetail(viewId?: number | null) {
  return useQuery({
    queryKey: queryKeys.viewDetail(viewId ?? 0),
    queryFn: () => getView(viewId ?? 0),
    enabled: viewId != null,
  });
}

export function useViewResults<T = Issue | Project>(
  viewId?: number | null,
  params?: { page?: number; size?: number; queryState?: ViewQueryState | null }
) {
  return useQuery({
    queryKey: queryKeys.viewResults(viewId ?? 0, {
      page: params?.page ?? 0,
      size: params?.size ?? 50,
      queryState: params?.queryState ?? null,
    }),
    queryFn: () => getViewResults<T>(viewId ?? 0, params),
    enabled: viewId != null,
  });
}

function invalidateViews(queryClient: ReturnType<typeof useQueryClient>) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.views }),
    queryClient.invalidateQueries({ queryKey: ['views'] }),
  ]);
}

export function useCreateView() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createView,
    onSuccess: async (view) => {
      queryClient.setQueryData(queryKeys.viewDetail(view.id), view);
      await invalidateViews(queryClient);
    },
  });
}

export function useUpdateView() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: {
      name?: string;
      description?: string | null;
      icon?: string | null;
      color?: string | null;
      visibility?: 'PERSONAL' | 'WORKSPACE' | 'TEAM';
      layout?: 'LIST' | 'BOARD';
      position?: number;
      queryState?: ViewQueryState | null;
    } }) => updateView(id, data),
    onSuccess: async (view) => {
      queryClient.setQueryData(queryKeys.viewDetail(view.id), view);
      await invalidateViews(queryClient);
      await queryClient.invalidateQueries({ queryKey: queryKeys.viewResults(view.id) });
    },
  });
}

export function useDuplicateView() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: duplicateView,
    onSuccess: invalidateViews.bind(null, queryClient),
  });
}

export function useFavoriteView() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, favorite }: { id: number; favorite: boolean }) =>
      favorite ? favoriteView(id) : unfavoriteView(id),
    onSuccess: async (view) => {
      queryClient.setQueryData(queryKeys.viewDetail(view.id), view);
      await invalidateViews(queryClient);
    },
  });
}

export function useDeleteView() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteView,
    onSuccess: invalidateViews.bind(null, queryClient),
  });
}
