import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCurrentWorkspace } from '@/components/providers/WorkspaceProvider';
import * as api from '@/lib/api/resources';
import { queryKeys } from './keys';

export function useResourceCatalog() {
  const { organizationId, currentTeamId } = useCurrentWorkspace();
  return {
    cyclesQuery: useQuery({ queryKey: [...queryKeys.cycles, organizationId ?? 1, currentTeamId ?? 'all'], queryFn: () => api.getCycles({ organizationId: organizationId ?? 1, teamId: currentTeamId ?? undefined }) }),
    projectStatusesQuery: useQuery({ queryKey: [...queryKeys.projectStatuses, organizationId ?? 1], queryFn: () => api.getProjectStatuses({ organizationId: organizationId ?? 1 }) }),
    customerStatusesQuery: useQuery({ queryKey: [...queryKeys.customerStatuses, organizationId ?? 1], queryFn: () => api.getCustomerStatuses({ organizationId: organizationId ?? 1 }) }),
    customerTiersQuery: useQuery({ queryKey: [...queryKeys.customerTiers, organizationId ?? 1], queryFn: () => api.getCustomerTiers({ organizationId: organizationId ?? 1 }) }),
  };
}

export function useInitiativeRelations(initiativeId: number | null) {
  return useQuery({
    queryKey: initiativeId ? queryKeys.initiativeRelations(initiativeId) : ['initiatives', 'unknown', 'relations'],
    queryFn: () => api.getInitiativeRelations(initiativeId!),
    enabled: initiativeId != null,
  });
}

export function useExternalResources(filters?: { service?: string; entityType?: string; entityId?: number; agentSessionId?: number; issueId?: number; commentId?: number; projectUpdateId?: number; initiativeUpdateId?: number }) {
  return {
    externalEntityInfoQuery: useQuery({ queryKey: queryKeys.externalEntityInfo(filters), queryFn: () => api.getExternalEntityInfo(filters) }),
    externalUsersQuery: useQuery({ queryKey: queryKeys.externalUsers(filters), queryFn: () => api.getExternalUsers({ service: filters?.service }) }),
    entityExternalLinksQuery: useQuery({ queryKey: queryKeys.entityExternalLinks(filters), queryFn: () => api.getEntityExternalLinks(filters) }),
    agentActivitiesQuery: useQuery({ queryKey: queryKeys.agentActivities(filters), queryFn: () => api.getAgentActivities({ agentSessionId: filters?.agentSessionId }) }),
    reactionsQuery: useQuery({ queryKey: queryKeys.reactions(filters), queryFn: () => api.getReactions(filters) }),
  };
}

export function useResourceCatalogMutations() {
  const queryClient = useQueryClient();
  const invalidate = async (...keys: ReadonlyArray<readonly unknown[]>) => Promise.all(keys.map((key) => queryClient.invalidateQueries({ queryKey: key })));
  return {
    createCycleMutation: useMutation({ mutationFn: api.createCycle, onSuccess: () => invalidate(queryKeys.cycles) }),
    updateCycleMutation: useMutation({ mutationFn: ({ id, data }: { id: number; data: Parameters<typeof api.updateCycle>[1] }) => api.updateCycle(id, data), onSuccess: () => invalidate(queryKeys.cycles) }),
    createProjectStatusMutation: useMutation({ mutationFn: api.createProjectStatus, onSuccess: () => invalidate(queryKeys.projectStatuses) }),
    updateProjectStatusMutation: useMutation({ mutationFn: ({ id, data }: { id: number; data: Parameters<typeof api.updateProjectStatus>[1] }) => api.updateProjectStatus(id, data), onSuccess: () => invalidate(queryKeys.projectStatuses) }),
    createInitiativeRelationMutation: useMutation({ mutationFn: ({ initiativeId, data }: { initiativeId: number; data: Parameters<typeof api.createInitiativeRelation>[1] }) => api.createInitiativeRelation(initiativeId, data), onSuccess: (_, v) => invalidate(queryKeys.initiativeRelations(v.initiativeId)) }),
    updateInitiativeRelationMutation: useMutation({ mutationFn: ({ initiativeId, id, data }: { initiativeId: number; id: number; data: Parameters<typeof api.updateInitiativeRelation>[2] }) => api.updateInitiativeRelation(initiativeId, id, data), onSuccess: (_, v) => invalidate(queryKeys.initiativeRelations(v.initiativeId)) }),
    createCustomerStatusMutation: useMutation({ mutationFn: api.createCustomerStatus, onSuccess: () => invalidate(queryKeys.customerStatuses) }),
    createCustomerTierMutation: useMutation({ mutationFn: api.createCustomerTier, onSuccess: () => invalidate(queryKeys.customerTiers) }),
    createExternalEntityInfoMutation: useMutation({ mutationFn: api.createExternalEntityInfo }),
    createExternalUserMutation: useMutation({ mutationFn: api.createExternalUser }),
    createEntityExternalLinkMutation: useMutation({ mutationFn: api.createEntityExternalLink }),
    createAgentActivityMutation: useMutation({ mutationFn: api.createAgentActivity }),
    createReactionMutation: useMutation({ mutationFn: api.createReaction }),
  };
}
