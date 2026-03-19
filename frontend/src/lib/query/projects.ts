import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCurrentWorkspace } from '@/components/providers/WorkspaceProvider';
import { createProject, getActivityEvents, getDocs, getIssues, getProjects, updateProject } from '@/lib/api';
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
