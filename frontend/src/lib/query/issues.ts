import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createComment, createDoc, createIssue, createIssueRelation, deleteIssueAttachment, deleteIssueRelation, getActivityEvents, getComments, getDocs, getIssue, getIssueAttachments, getIssueRelations, getIssues, getProjects, getTeamMembers, getTeams, updateIssue, updateIssueState, uploadIssueAttachment } from '@/lib/api';
import { getCustomFieldDefinitions } from '@/lib/api/custom-fields';
import type { CustomFieldDefinition, Issue } from '@/lib/api';
import { queryKeys } from './keys';

export function useIssueWorkspace(filters?: Parameters<typeof getIssues>[0]) {
  const issuesQuery = useQuery({
    queryKey: queryKeys.issues(filters),
    queryFn: () => getIssues(filters),
  });
  const customFieldDefinitionsQuery = useQuery({
    queryKey: queryKeys.customFields({ organizationId: 1, entityType: 'ISSUE' }),
    queryFn: () => getCustomFieldDefinitions({ organizationId: 1, entityType: 'ISSUE' }),
  });
  const projectsQuery = useQuery({
    queryKey: queryKeys.projects,
    queryFn: () => getProjects(),
  });
  const teamsQuery = useQuery({
    queryKey: queryKeys.teams,
    queryFn: () => getTeams(),
  });
  const membersQuery = useQuery({
    queryKey: queryKeys.teamMembers,
    queryFn: () => getTeamMembers(),
  });

  return {
    issuesQuery,
    customFieldDefinitionsQuery,
    projectsQuery,
    teamsQuery,
    membersQuery,
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
    issueQuery: useQuery({
      queryKey: issueId ? queryKeys.issueDetail(issueId) : ['issues', 'unknown', 'detail'],
      queryFn: () => getIssue(issueId!),
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

export function useIssueDetailWorkspace(issueId: number, organizationId: number) {
  const issueQuery = useQuery({
    queryKey: queryKeys.issueDetail(issueId),
    queryFn: () => getIssue(issueId),
  });

  const issue = issueQuery.data;

  return {
    issueQuery,
    commentsQuery: useQuery({
      queryKey: queryKeys.comments({ issueId }),
      queryFn: () => getComments({ issueId }),
    }),
    docsQuery: useQuery({
      queryKey: queryKeys.docs({ issueId }),
      queryFn: () => getDocs({ issueId }),
    }),
    activityQuery: useQuery({
      queryKey: queryKeys.activity({ entityType: 'ISSUE', entityId: issueId }),
      queryFn: () => getActivityEvents({ entityType: 'ISSUE', entityId: issueId }),
    }),
    relationsQuery: useQuery({
      queryKey: queryKeys.relations(issueId),
      queryFn: () => getIssueRelations(issueId),
    }),
    attachmentsQuery: useQuery({
      queryKey: queryKeys.attachments(issueId),
      queryFn: () => getIssueAttachments(issueId),
    }),
    childIssuesQuery: useQuery({
      queryKey: queryKeys.issues({ parentIssueId: issueId }),
      queryFn: () => getIssues({ parentIssueId: issueId }),
    }),
    customFieldDefinitionsQuery: useQuery({
      queryKey: queryKeys.customFields({ organizationId, entityType: 'ISSUE' }),
      queryFn: () => getCustomFieldDefinitions({ organizationId, entityType: 'ISSUE' }),
    }),
    projectsQuery: useQuery({
      queryKey: queryKeys.projects,
      queryFn: () => getProjects({ organizationId }),
    }),
    teamsQuery: useQuery({
      queryKey: queryKeys.teams,
      queryFn: () => getTeams({ organizationId }),
    }),
    membersQuery: useQuery({
      queryKey: queryKeys.teamMembers,
      queryFn: () => getTeamMembers(),
    }),
    workspaceCustomFieldDefinitions: (issue?.customFieldDefinitions as CustomFieldDefinition[] | undefined) ?? [],
  };
}

function updateIssueInCache(issueList: Issue[] | undefined, updated: Issue) {
  if (!Array.isArray(issueList)) return issueList;
  return issueList.map((issue) => (issue.id === updated.id ? updated : issue));
}

export function useIssueMutations(activeFilters?: Parameters<typeof getIssues>[0]) {
  const queryClient = useQueryClient();

  const invalidateIssueCollections = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['issues'] }),
      queryClient.invalidateQueries({ queryKey: queryKeys.projects }),
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
      queryClient.setQueryData(queryKeys.issueDetail(updated.id), updated);
      await invalidateIssueCollections();
    },
  });

  const updateIssueStateMutation = useMutation({
    mutationFn: ({ id, state, resolution }: { id: number; state: string; resolution?: string | null }) =>
      updateIssueState(id, state, resolution),
    onSuccess: async (updated) => {
      queryClient.setQueriesData<Issue[]>({ queryKey: ['issues'] }, (current) => updateIssueInCache(current, updated));
      queryClient.setQueryData(queryKeys.issueDetail(updated.id), updated);
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

  const uploadAttachmentMutation = useMutation({
    mutationFn: ({ issueId, file, uploadedBy }: { issueId: number; file: File; uploadedBy?: number | null }) =>
      uploadIssueAttachment(issueId, { file, uploadedBy }),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.attachments(variables.issueId) });
    },
  });

  const deleteAttachmentMutation = useMutation({
    mutationFn: ({ issueId, attachmentId }: { issueId: number; attachmentId: number }) =>
      deleteIssueAttachment(issueId, attachmentId),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.attachments(variables.issueId) });
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
    uploadAttachmentMutation,
    deleteAttachmentMutation,
    createRelationMutation,
    deleteRelationMutation,
  };
}
