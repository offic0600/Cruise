import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createProject, getActivityEvents, getDocs, getIssues, getProjects, updateProject } from '@/lib/api';
import { queryKeys } from './keys';

export function useProjectsWorkspace() {
  return {
    projectsQuery: useQuery({
      queryKey: queryKeys.projects,
      queryFn: () => getProjects(),
      select: (response) => response.items,
    }),
    issuesQuery: useQuery({
      queryKey: [...queryKeys.projects, 'issues'],
      queryFn: () => getIssues(),
      select: (response) => response.items,
    }),
    docsQuery: useQuery({
      queryKey: [...queryKeys.projects, 'docs'],
      queryFn: () => getDocs(),
    }),
    activityQuery: useQuery({
      queryKey: [...queryKeys.projects, 'activity'],
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
