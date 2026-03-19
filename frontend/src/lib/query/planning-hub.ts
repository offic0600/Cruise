import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  attachInitiativeProject,
  attachRoadmapProject,
  createCustomer,
  createCustomerNeed,
  createInitiative,
  createRoadmap,
  deleteCustomerNeed,
  deleteInitiativeProject,
  deleteRoadmapProject,
  getCustomerNeeds,
  getCustomers,
  getInitiativeProjects,
  getInitiatives,
  getProjects,
  getRoadmapProjects,
  getRoadmaps,
  updateCustomer,
  updateCustomerNeed,
  updateInitiative,
  updateInitiativeProject,
  updateRoadmap,
  updateRoadmapProject,
} from '@/lib/api';
import { queryKeys } from './keys';

export function useInitiativesWorkspace() {
  return {
    initiativesQuery: useQuery({
      queryKey: queryKeys.initiatives,
      queryFn: () => getInitiatives(),
      select: (response) => response.items,
    }),
    projectsQuery: useQuery({
      queryKey: queryKeys.projects,
      queryFn: () => getProjects(),
      select: (response) => response.items,
    }),
  };
}

export function useInitiativeProjects(initiativeId: number | null) {
  return useQuery({
    queryKey: initiativeId ? queryKeys.initiativeProjects(initiativeId) : ['initiatives', 'unknown', 'projects'],
    queryFn: () => getInitiativeProjects(initiativeId!),
    enabled: initiativeId != null,
  });
}

export function useRoadmapsWorkspace() {
  return {
    roadmapsQuery: useQuery({
      queryKey: queryKeys.roadmaps,
      queryFn: () => getRoadmaps(),
      select: (response) => response.items,
    }),
    projectsQuery: useQuery({
      queryKey: queryKeys.projects,
      queryFn: () => getProjects(),
      select: (response) => response.items,
    }),
  };
}

export function useRoadmapProjects(roadmapId: number | null) {
  return useQuery({
    queryKey: roadmapId ? queryKeys.roadmapProjects(roadmapId) : ['roadmaps', 'unknown', 'projects'],
    queryFn: () => getRoadmapProjects(roadmapId!),
    enabled: roadmapId != null,
  });
}

export function useCustomersWorkspace() {
  return {
    customersQuery: useQuery({
      queryKey: queryKeys.customers,
      queryFn: () => getCustomers(),
      select: (response) => response.items,
    }),
    projectsQuery: useQuery({
      queryKey: queryKeys.projects,
      queryFn: () => getProjects(),
      select: (response) => response.items,
    }),
  };
}

export function useCustomerNeeds(customerId: number | null) {
  return useQuery({
    queryKey: customerId ? queryKeys.customerNeeds(customerId) : ['customers', 'unknown', 'needs'],
    queryFn: () => getCustomerNeeds(customerId!),
    enabled: customerId != null,
  });
}

export function usePlanningHubMutations() {
  const queryClient = useQueryClient();
  const invalidateInitiatives = async (initiativeId?: number) => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.initiatives });
    if (initiativeId != null) {
      await queryClient.invalidateQueries({ queryKey: queryKeys.initiativeProjects(initiativeId) });
    }
  };
  const invalidateRoadmaps = async (roadmapId?: number) => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.roadmaps });
    if (roadmapId != null) {
      await queryClient.invalidateQueries({ queryKey: queryKeys.roadmapProjects(roadmapId) });
    }
  };
  const invalidateCustomers = async (customerId?: number) => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.customers });
    if (customerId != null) {
      await queryClient.invalidateQueries({ queryKey: queryKeys.customerNeeds(customerId) });
    }
  };

  return {
    createInitiativeMutation: useMutation({
      mutationFn: createInitiative,
      onSuccess: () => invalidateInitiatives(),
    }),
    updateInitiativeMutation: useMutation({
      mutationFn: ({ id, data }: { id: number; data: Parameters<typeof updateInitiative>[1] }) => updateInitiative(id, data),
      onSuccess: (_, variables) => invalidateInitiatives(variables.id),
    }),
    attachInitiativeProjectMutation: useMutation({
      mutationFn: ({ initiativeId, data }: { initiativeId: number; data: Parameters<typeof attachInitiativeProject>[1] }) =>
        attachInitiativeProject(initiativeId, data),
      onSuccess: (_, variables) => invalidateInitiatives(variables.initiativeId),
    }),
    updateInitiativeProjectMutation: useMutation({
      mutationFn: ({ initiativeId, relationId, data }: { initiativeId: number; relationId: number; data: Parameters<typeof updateInitiativeProject>[2] }) =>
        updateInitiativeProject(initiativeId, relationId, data),
      onSuccess: (_, variables) => invalidateInitiatives(variables.initiativeId),
    }),
    deleteInitiativeProjectMutation: useMutation({
      mutationFn: ({ initiativeId, relationId }: { initiativeId: number; relationId: number }) =>
        deleteInitiativeProject(initiativeId, relationId),
      onSuccess: (_, variables) => invalidateInitiatives(variables.initiativeId),
    }),
    createRoadmapMutation: useMutation({
      mutationFn: createRoadmap,
      onSuccess: () => invalidateRoadmaps(),
    }),
    updateRoadmapMutation: useMutation({
      mutationFn: ({ id, data }: { id: number; data: Parameters<typeof updateRoadmap>[1] }) => updateRoadmap(id, data),
      onSuccess: (_, variables) => invalidateRoadmaps(variables.id),
    }),
    attachRoadmapProjectMutation: useMutation({
      mutationFn: ({ roadmapId, data }: { roadmapId: number; data: Parameters<typeof attachRoadmapProject>[1] }) =>
        attachRoadmapProject(roadmapId, data),
      onSuccess: (_, variables) => invalidateRoadmaps(variables.roadmapId),
    }),
    updateRoadmapProjectMutation: useMutation({
      mutationFn: ({ roadmapId, relationId, data }: { roadmapId: number; relationId: number; data: Parameters<typeof updateRoadmapProject>[2] }) =>
        updateRoadmapProject(roadmapId, relationId, data),
      onSuccess: (_, variables) => invalidateRoadmaps(variables.roadmapId),
    }),
    deleteRoadmapProjectMutation: useMutation({
      mutationFn: ({ roadmapId, relationId }: { roadmapId: number; relationId: number }) =>
        deleteRoadmapProject(roadmapId, relationId),
      onSuccess: (_, variables) => invalidateRoadmaps(variables.roadmapId),
    }),
    createCustomerMutation: useMutation({
      mutationFn: createCustomer,
      onSuccess: () => invalidateCustomers(),
    }),
    updateCustomerMutation: useMutation({
      mutationFn: ({ id, data }: { id: number; data: Parameters<typeof updateCustomer>[1] }) => updateCustomer(id, data),
      onSuccess: (_, variables) => invalidateCustomers(variables.id),
    }),
    createCustomerNeedMutation: useMutation({
      mutationFn: ({ customerId, data }: { customerId: number; data: Parameters<typeof createCustomerNeed>[1] }) =>
        createCustomerNeed(customerId, data),
      onSuccess: (_, variables) => invalidateCustomers(variables.customerId),
    }),
    updateCustomerNeedMutation: useMutation({
      mutationFn: ({ customerId, needId, data }: { customerId: number; needId: number; data: Parameters<typeof updateCustomerNeed>[2] }) =>
        updateCustomerNeed(customerId, needId, data),
      onSuccess: (_, variables) => invalidateCustomers(variables.customerId),
    }),
    deleteCustomerNeedMutation: useMutation({
      mutationFn: ({ customerId, needId }: { customerId: number; needId: number }) => deleteCustomerNeed(customerId, needId),
      onSuccess: (_, variables) => invalidateCustomers(variables.customerId),
    }),
  };
}
