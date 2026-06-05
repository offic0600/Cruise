import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createComment, createDoc, createIssue, createIssueRelation, deleteIssueAttachment, deleteIssueRelation, getActivityEvents, getComments, getDocs, getIssue, getIssueAttachments, getIssueByIdentifier, getIssueRelations, getIssues, getLabels, getProjects, getTeamMembers, getTeams, updateIssue, updateIssueState, uploadIssueAttachment } from '@/lib/api';
import { getCustomFieldDefinitions } from '@/lib/api/custom-fields';
import type { CustomFieldDefinition, Issue, Project, RestPageResponse } from '@/lib/api';
import { useCurrentWorkspace } from '@/components/providers/WorkspaceProvider';
import { queryKeys } from './keys';

export function useIssueWorkspace(filters?: Parameters<typeof getIssues>[0]) {
  const { organizationId, currentTeamId } = useCurrentWorkspace();
  const scopedFilters = {
    organizationId: organizationId ?? filters?.organizationId ?? 1,
    teamId: filters?.teamId ?? currentTeamId ?? undefined,
    ...filters,
  };
  const issuesQuery = useQuery({
    queryKey: queryKeys.issues(scopedFilters),
    queryFn: () => getIssues(scopedFilters),
    select: (response) => response.items,
  });
  const customFieldDefinitionsQuery = useQuery({
    queryKey: queryKeys.customFields({ organizationId: organizationId ?? 1, entityType: 'ISSUE' }),
    queryFn: () => getCustomFieldDefinitions({ organizationId: organizationId ?? 1, entityType: 'ISSUE' }),
  });
  const projectsQuery = useQuery({
    queryKey: [...queryKeys.projects, organizationId ?? 1, currentTeamId ?? 'all'],
    queryFn: () => getProjects({ organizationId: organizationId ?? 1, teamId: currentTeamId ?? undefined }),
    select: (response) => response.items,
  });
  const teamsQuery = useQuery({
    queryKey: [...queryKeys.teams, organizationId ?? 1],
    queryFn: () => getTeams({ organizationId: organizationId ?? 1 }),
  });
  const membersQuery = useQuery({
    queryKey: [...queryKeys.teamMembers, organizationId ?? 1, currentTeamId ?? 'all'],
    queryFn: () => getTeamMembers({ organizationId: organizationId ?? 1, teamId: currentTeamId ?? undefined }),
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
      queryFn: () => getComments({ targetType: 'ISSUE', targetId: issueId! }),
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
  const { currentTeamId } = useCurrentWorkspace();
  const issueQuery = useQuery({
    queryKey: queryKeys.issueDetail(issueId),
    queryFn: () => getIssue(issueId),
  });

  const issue = issueQuery.data;

  return {
    issueQuery,
    commentsQuery: useQuery({
      queryKey: queryKeys.comments({ issueId }),
      queryFn: () => getComments({ targetType: 'ISSUE', targetId: issueId }),
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
      queryKey: queryKeys.issues({ parentIssueId: issueId, teamId: currentTeamId ?? undefined }),
      queryFn: () => getIssues({ parentIssueId: issueId, teamId: currentTeamId ?? undefined }),
      select: (response) => response.items,
    }),
    customFieldDefinitionsQuery: useQuery({
      queryKey: queryKeys.customFields({ organizationId, entityType: 'ISSUE' }),
      queryFn: () => getCustomFieldDefinitions({ organizationId, entityType: 'ISSUE' }),
      staleTime: 5 * 60 * 1000,
    }),
    projectsQuery: useQuery({
      queryKey: [...queryKeys.projects, organizationId, currentTeamId ?? 'all'],
      queryFn: () => getProjects({ organizationId, teamId: currentTeamId ?? undefined }),
      select: (response) => response.items,
      staleTime: 60 * 1000,
    }),
    teamsQuery: useQuery({
      queryKey: [...queryKeys.teams, organizationId],
      queryFn: () => getTeams({ organizationId }),
      staleTime: 5 * 60 * 1000,
    }),
    membersQuery: useQuery({
      queryKey: [...queryKeys.teamMembers, organizationId, currentTeamId ?? 'all'],
      queryFn: () => getTeamMembers({ organizationId, teamId: currentTeamId ?? undefined }),
      staleTime: 60 * 1000,
    }),
    labelsQuery: useQuery({
      queryKey: queryKeys.labels({ organizationId, teamId: issue?.teamId ?? currentTeamId ?? undefined }),
      queryFn: () => getLabels({ organizationId, teamId: issue?.teamId ?? currentTeamId ?? undefined }),
      select: (catalog) => [...catalog.workspaceLabels, ...catalog.teamLabels],
      staleTime: 60 * 1000,
    }),
    workspaceCustomFieldDefinitions: (issue?.customFieldDefinitions as CustomFieldDefinition[] | undefined) ?? [],
  };
}

export function useIssueByIdentifier(organizationId: number | null, identifier: string | null, initialIssue?: Issue | null) {
  return useQuery({
    queryKey: organizationId != null && identifier ? queryKeys.issueByIdentifier(organizationId, identifier) : ['issues', 'identifier', 'unknown'],
    queryFn: () => getIssueByIdentifier({ organizationId: organizationId!, identifier: identifier! }),
    enabled: organizationId != null && Boolean(identifier),
    initialData: initialIssue ?? undefined,
    staleTime: 30 * 1000,
  });
}

function updateIssueInCache(issueList: Issue[] | undefined, updated: Issue) {
  if (!Array.isArray(issueList)) return issueList;
  return issueList.map((issue) => (issue.id === updated.id ? updated : issue));
}

function updateIssuePageInCache(page: RestPageResponse<Issue> | undefined, updated: Issue) {
  if (!page) return page;
  return {
    ...page,
    items: updateIssueInCache(page.items, updated) ?? page.items,
  };
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
      queryClient.setQueriesData<RestPageResponse<Issue>>({ queryKey: ['issues'] }, (current) => updateIssuePageInCache(current, updated));
      queryClient.setQueryData(queryKeys.issueDetail(updated.id), updated);
      await invalidateIssueCollections();
    },
  });

  const updateIssueStateMutation = useMutation({
    mutationFn: ({ id, state, resolution }: { id: number; state: string; resolution?: string | null }) =>
      updateIssueState(id, state, resolution),
    onSuccess: async (updated) => {
      queryClient.setQueriesData<RestPageResponse<Issue>>({ queryKey: ['issues'] }, (current) => updateIssuePageInCache(current, updated));
      queryClient.setQueryData(queryKeys.issueDetail(updated.id), updated);
      await invalidateIssueCollections();
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: createComment,
    onSuccess: async (_, variables) => {
      const issueId = variables.targetType === 'ISSUE' ? variables.targetId : undefined;
      await queryClient.invalidateQueries({ queryKey: queryKeys.comments({ issueId }) });
      if (issueId != null) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.activity({ entityType: 'ISSUE', entityId: issueId }) });
      }
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
