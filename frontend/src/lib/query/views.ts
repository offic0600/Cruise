import { useQuery } from '@tanstack/react-query';
import { useCurrentWorkspace } from '@/components/providers/WorkspaceProvider';
import { getIssues, getProjects } from '@/lib/api';
import { getViews } from '@/lib/api/views';
import { queryKeys } from './keys';

export function useViewsWorkspace() {
  const { organizationId, currentTeamId } = useCurrentWorkspace();
  return {
    issuesQuery: useQuery({
      queryKey: [...queryKeys.views, 'issues', organizationId ?? 1, currentTeamId ?? 'all'],
      queryFn: () => getIssues({ organizationId: organizationId ?? 1, teamId: currentTeamId ?? undefined }),
      select: (response) => response.items,
    }),
    projectsQuery: useQuery({
      queryKey: [...queryKeys.views, 'projects', organizationId ?? 1, currentTeamId ?? 'all'],
      queryFn: () => getProjects({ organizationId: organizationId ?? 1, teamId: currentTeamId ?? undefined }),
      select: (response) => response.items,
    }),
    viewsQuery: useQuery({
      queryKey: [...queryKeys.views, organizationId ?? 1, currentTeamId ?? 'all'],
      queryFn: () => getViews({ organizationId: organizationId ?? 1, teamId: currentTeamId ?? undefined }),
    }),
  };
}
