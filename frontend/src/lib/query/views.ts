import { useQuery } from '@tanstack/react-query';
import { getIssues, getProjects } from '@/lib/api';
import { getViews } from '@/lib/api/views';
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
    viewsQuery: useQuery({
      queryKey: queryKeys.views,
      queryFn: () => getViews(),
    }),
  };
}
