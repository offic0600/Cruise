import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCurrentWorkspace } from '@/components/providers/WorkspaceProvider';
import { getProjects, getTeams } from '@/lib/api';
import type { CustomFieldDefinition } from '@/lib/api';
import {
  createCustomFieldDefinition,
  deleteCustomFieldDefinition,
  getCustomFieldDefinitions,
  updateCustomFieldDefinition,
} from '@/lib/api/custom-fields';
import { queryKeys } from './keys';

export function useCustomFieldsWorkspace(params: { organizationId: number; entityType?: string; includeInactive?: boolean }) {
  const { currentTeamId } = useCurrentWorkspace();
  return {
    customFieldsQuery: useQuery({
      queryKey: queryKeys.customFields(params),
      queryFn: () =>
        getCustomFieldDefinitions({
          organizationId: params.organizationId,
          entityType: params.entityType ?? 'ISSUE',
          includeInactive: params.includeInactive,
        }),
    }),
    teamsQuery: useQuery({
      queryKey: [...queryKeys.teams, params.organizationId],
      queryFn: () => getTeams({ organizationId: params.organizationId }),
    }),
    projectsQuery: useQuery({
      queryKey: [...queryKeys.projects, params.organizationId, currentTeamId ?? 'all'],
      queryFn: () => getProjects({ organizationId: params.organizationId, teamId: currentTeamId ?? undefined }),
      select: (response) => response.items,
    }),
  };
}

export function useCustomFieldMutations(params: { organizationId: number; entityType?: string; includeInactive?: boolean }) {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.customFields(params) });
    await queryClient.invalidateQueries({ queryKey: queryKeys.customFields({ organizationId: params.organizationId, entityType: 'ISSUE' }) });
    await queryClient.invalidateQueries({ queryKey: ['issues'] });
  };

  return {
    createCustomFieldMutation: useMutation({
      mutationFn: createCustomFieldDefinition,
      onSuccess: invalidate,
    }),
    updateCustomFieldMutation: useMutation({
      mutationFn: ({ id, data }: { id: number; data: Parameters<typeof updateCustomFieldDefinition>[1] }) => updateCustomFieldDefinition(id, data),
      onSuccess: invalidate,
    }),
    deleteCustomFieldMutation: useMutation({
      mutationFn: deleteCustomFieldDefinition,
      onSuccess: invalidate,
    }),
  };
}
