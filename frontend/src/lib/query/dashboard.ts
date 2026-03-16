import { useMutation, useQuery } from '@tanstack/react-query';
import { createSession, getIssues, getTeamMembers, sendQuery } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import { queryKeys } from './keys';

export function useDashboardData() {
  const issuesQuery = useQuery({
    queryKey: [...queryKeys.dashboard, 'issues'],
    queryFn: () => getIssues(),
  });

  const membersQuery = useQuery({
    queryKey: [...queryKeys.dashboard, 'team-members'],
    queryFn: () => getTeamMembers(),
  });

  return {
    issuesQuery,
    membersQuery,
  };
}

export function useDashboardAgent() {
  const sessionMutation = useMutation({
    mutationFn: () => {
      const user = getStoredUser();
      return createSession(user?.id, user?.username);
    },
  });

  const queryMutation = useMutation({
    mutationFn: ({ sessionId, query }: { sessionId: string; query: string }) => sendQuery(sessionId, query),
  });

  return {
    sessionMutation,
    queryMutation,
  };
}
