import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCurrentWorkspace } from '@/components/providers/WorkspaceProvider';
import { createProject, getActivityEvents, getDocs, getIssues, getProjects, getWorkspaceProjects, updateProject } from '@/lib/api';
import type { WorkspaceProjectRow } from '@/lib/api/types';
import { queryKeys } from './keys';

export function useProjectsWorkspace() {
  const { organizationId, currentTeamId } = useCurrentWorkspace();
  return {
    projectsQuery: useQuery({
      queryKey: [...queryKeys.projects, organizationId ?? 1, currentTeamId ?? 'all'],
      queryFn: () => getProjects({ organizationId: organizationId ?? 1, teamId: currentTeamId ?? undefined }),
      select: (response) => response.items,
    }),
    issuesQuery: useQuery({
      queryKey: [...queryKeys.projects, 'issues', organizationId ?? 1, currentTeamId ?? 'all'],
      queryFn: () => getIssues({ organizationId: organizationId ?? 1, teamId: currentTeamId ?? undefined }),
      select: (response) => response.items,
    }),
    docsQuery: useQuery({
      queryKey: [...queryKeys.projects, 'docs', organizationId ?? 1, currentTeamId ?? 'all'],
      queryFn: () => getDocs({ organizationId: organizationId ?? 1, teamId: currentTeamId ?? undefined }),
    }),
    activityQuery: useQuery({
      queryKey: [...queryKeys.projects, 'activity', organizationId ?? 1],
      queryFn: () => getActivityEvents(),
    }),
  };
}

export function useProjectMutations() {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.projects }),
      queryClient.invalidateQueries({ queryKey: [...queryKeys.projects, 'issues'] }),
      queryClient.invalidateQueries({ queryKey: [...queryKeys.projects, 'docs'] }),
      queryClient.invalidateQueries({ queryKey: [...queryKeys.projects, 'activity'] }),
    ]);
  };

  return {
    createProjectMutation: useMutation({
      mutationFn: createProject,
      onSuccess: invalidate,
    }),
    updateProjectMutation: useMutation({
      mutationFn: ({ id, data }: { id: number; data: Parameters<typeof updateProject>[1] }) => updateProject(id, data),
      onSuccess: invalidate,
    }),
  };
}

export function useWorkspaceProjects(params: {
  organizationId?: number | null;
  teamId?: number | null;
  q?: string;
  status?: string;
  priority?: string;
  ownerId?: number | null;
  health?: string;
  hasMilestone?: boolean;
  viewId?: number | null;
  includeArchived?: boolean;
  page?: number;
  size?: number;
}) {
  return useQuery({
    queryKey: [
      ...queryKeys.projects,
      'workspace',
      {
        organizationId: params.organizationId ?? null,
        teamId: params.teamId ?? null,
        q: params.q ?? '',
        status: params.status ?? null,
        priority: params.priority ?? null,
        ownerId: params.ownerId ?? null,
        health: params.health ?? null,
        hasMilestone: params.hasMilestone ?? null,
        viewId: params.viewId ?? null,
        includeArchived: params.includeArchived ?? false,
        page: params.page ?? 0,
        size: params.size ?? 100,
      },
    ],
    queryFn: () =>
      getWorkspaceProjects({
        organizationId: params.organizationId ?? 0,
        teamId: params.teamId ?? null,
        q: params.q,
        status: params.status,
        priority: params.priority,
        ownerId: params.ownerId ?? null,
        health: params.health,
        hasMilestone: params.hasMilestone,
        viewId: params.viewId ?? null,
        includeArchived: params.includeArchived,
        page: params.page,
        size: params.size,
      }),
    enabled: params.organizationId != null,
    select: (response) => response as { items: WorkspaceProjectRow[]; totalCount: number; pageInfo: { hasNextPage: boolean; hasPreviousPage: boolean; nextCursor: string | null; prevCursor: string | null } },
  });
}
