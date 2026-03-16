import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createComment, createDoc, createIssue, createIssueRelation, deleteIssueRelation, getActivityEvents, getComments, getDocs, getEpics, getIssueRelations, getIssues, getProjects, getSprints, getTeams, updateIssue, updateIssueState } from '@/lib/api';
import type { Issue } from '@/lib/api';
import { queryKeys } from './keys';

export function useIssueWorkspace(filters?: Parameters<typeof getIssues>[0]) {
  const issuesQuery = useQuery({
    queryKey: queryKeys.issues(filters),
    queryFn: () => getIssues(filters),
  });
  const projectsQuery = useQuery({
    queryKey: queryKeys.projects,
    queryFn: () => getProjects(),
  });
  const epicsQuery = useQuery({
    queryKey: queryKeys.epics,
    queryFn: () => getEpics(),
  });
  const sprintsQuery = useQuery({
    queryKey: queryKeys.sprints,
    queryFn: () => getSprints(),
  });
  const teamsQuery = useQuery({
    queryKey: queryKeys.teams,
    queryFn: () => getTeams(),
  });

  return {
    issuesQuery,
    projectsQuery,
    epicsQuery,
    sprintsQuery,
    teamsQuery,
  };
}

export function useIssueDetails(issueId: number | null) {
  const enabled = issueId != null;

  return {
    commentsQuery: useQuery({
      queryKey: queryKeys.comments({ issueId }),
      queryFn: () => getComments({ issueId: issueId! }),
      enabled,
    }),
    docsQuery: useQuery({
      queryKey: queryKeys.docs({ issueId }),
      queryFn: () => getDocs({ issueId: issueId! }),
      enabled,
    }),
    activityQuery: useQuery({
      queryKey: queryKeys.activity({ entityType: 'ISSUE', entityId: issueId }),
      queryFn: () => getActivityEvents({ entityType: 'ISSUE', entityId: issueId! }),
      enabled,
    }),
    relationsQuery: useQuery({
      queryKey: issueId ? queryKeys.relations(issueId) : ['issues', 'unknown', 'relations'],
      queryFn: () => getIssueRelations(issueId!),
      enabled,
    }),
  };
}

function updateIssueInCache(issueList: Issue[] | undefined, updated: Issue) {
  if (!issueList) return issueList;
  return issueList.map((issue) => (issue.id === updated.id ? updated : issue));
}

export function useIssueMutations(activeFilters?: Parameters<typeof getIssues>[0]) {
  const queryClient = useQueryClient();

  const invalidateIssueCollections = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['issues'] }),
      queryClient.invalidateQueries({ queryKey: queryKeys.projects }),
      queryClient.invalidateQueries({ queryKey: queryKeys.epics }),
      queryClient.invalidateQueries({ queryKey: queryKeys.sprints }),
      queryClient.invalidateQueries({ queryKey: ['activity'] }),
      queryClient.invalidateQueries({ queryKey: ['docs'] }),
      queryClient.invalidateQueries({ queryKey: ['comments'] }),
    ]);
  };

  const createIssueMutation = useMutation({
    mutationFn: createIssue,
    onSuccess: async () => {
      await invalidateIssueCollections();
      if (activeFilters) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.issues(activeFilters) });
      }
    },
  });

  const updateIssueMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof updateIssue>[1] }) => updateIssue(id, data),
    onSuccess: async (updated) => {
      queryClient.setQueriesData<Issue[]>({ queryKey: ['issues'] }, (current) => updateIssueInCache(current, updated));
      await invalidateIssueCollections();
    },
  });

  const updateIssueStateMutation = useMutation({
    mutationFn: ({ id, state }: { id: number; state: string }) => updateIssueState(id, state),
    onSuccess: async (updated) => {
      queryClient.setQueriesData<Issue[]>({ queryKey: ['issues'] }, (current) => updateIssueInCache(current, updated));
      await invalidateIssueCollections();
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: createComment,
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.comments({ issueId: variables.issueId }) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.activity({ entityType: 'ISSUE', entityId: variables.issueId }) });
    },
  });

  const createDocMutation = useMutation({
    mutationFn: createDoc,
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.docs({ issueId: variables.issueId }) });
    },
  });

  const createRelationMutation = useMutation({
    mutationFn: ({ issueId, toIssueId, relationType }: { issueId: number; toIssueId: number; relationType: string }) =>
      createIssueRelation(issueId, { toIssueId, relationType }),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.relations(variables.issueId) });
    },
  });

  const deleteRelationMutation = useMutation({
    mutationFn: ({ issueId, relationId }: { issueId: number; relationId: number }) =>
      deleteIssueRelation(issueId, relationId),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.relations(variables.issueId) });
    },
  });

  return {
    createIssueMutation,
    updateIssueMutation,
    updateIssueStateMutation,
    createCommentMutation,
    createDocMutation,
    createRelationMutation,
    deleteRelationMutation,
  };
}
