import { useQuery } from '@tanstack/react-query';
import { getIssues, getProjects, getSprints } from '@/lib/api';
import { queryKeys } from './keys';

export function useViewsWorkspace() {
  return {
    issuesQuery: useQuery({
      queryKey: [...queryKeys.views, 'issues'],
      queryFn: () => getIssues(),
    }),
    projectsQuery: useQuery({
      queryKey: [...queryKeys.views, 'projects'],
      queryFn: () => getProjects(),
    }),
    sprintsQuery: useQuery({
      queryKey: [...queryKeys.views, 'sprints'],
      queryFn: () => getSprints(),
    }),
  };
}
