'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { getOrganizations, getTeams, type Organization, type Team } from '@/lib/api';
import { getStoredSession, updateStoredSession } from '@/lib/auth';

const ORG_STORAGE_KEY = 'currentWorkspaceOrganizationId';
const teamStorageKey = (organizationId: number | null) =>
  organizationId != null ? `currentWorkspaceTeamId:${organizationId}` : 'currentWorkspaceTeamId';

type WorkspaceContextValue = {
  organizations: Organization[];
  currentOrganization: Organization | null;
  organizationId: number | null;
  currentOrganizationId: number | null;
  setCurrentOrganizationId: (organizationId: number) => void;
  teams: Team[];
  currentTeam: Team | null;
  currentTeamId: number | null;
  setCurrentTeamId: (teamId: number) => void;
  isLoading: boolean;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [sessionOrganizationId, setSessionOrganizationId] = useState<number | null>(null);
  const [storedOrganizationId, setStoredOrganizationId] = useState<number | null>(null);
  const [storedTeamId, setStoredTeamId] = useState<number | null>(null);

  useEffect(() => {
    const session = getStoredSession();
    setSessionOrganizationId(session?.user.organizationId ?? null);

    if (typeof window === 'undefined') return;
    const rawOrganizationId = window.localStorage.getItem(ORG_STORAGE_KEY);
    const nextOrganizationId = rawOrganizationId ? Number(rawOrganizationId) || null : session?.user.organizationId ?? null;
    setStoredOrganizationId(nextOrganizationId);
    const rawTeamId = window.localStorage.getItem(teamStorageKey(nextOrganizationId));
    setStoredTeamId(rawTeamId ? Number(rawTeamId) || null : null);
  }, [pathname]);

  const organizationsQuery = useQuery({
    queryKey: ['organizations', 'workspace'],
    queryFn: () => getOrganizations(),
    enabled: sessionOrganizationId != null || getStoredSession() != null,
  });

  const organizations = organizationsQuery.data ?? [];
  const currentOrganization = useMemo(() => {
    if (!organizations.length) return null;
    if (storedOrganizationId != null) {
      const matched = organizations.find((organization) => organization.id === storedOrganizationId);
      if (matched) return matched;
    }
    if (sessionOrganizationId != null) {
      const matched = organizations.find((organization) => organization.id === sessionOrganizationId);
      if (matched) return matched;
    }
    return organizations[0] ?? null;
  }, [organizations, sessionOrganizationId, storedOrganizationId]);

  const organizationId = currentOrganization?.id ?? null;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (organizationId != null) {
      window.localStorage.setItem(ORG_STORAGE_KEY, String(organizationId));
      if (storedOrganizationId !== organizationId) {
        setStoredOrganizationId(organizationId);
      }
      updateStoredSession({ user: { organizationId } });
    } else {
      window.localStorage.removeItem(ORG_STORAGE_KEY);
    }
  }, [organizationId, storedOrganizationId]);

  const teamsQuery = useQuery({
    queryKey: ['teams', 'workspace', organizationId],
    queryFn: () => getTeams({ organizationId: organizationId ?? undefined }),
    enabled: organizationId != null,
  });

  const teams = teamsQuery.data ?? [];
  const currentTeam = useMemo(() => {
    if (!teams.length) return null;
    if (storedTeamId != null) {
      const matched = teams.find((team) => team.id === storedTeamId);
      if (matched) return matched;
    }
    return teams[0] ?? null;
  }, [storedTeamId, teams]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const key = teamStorageKey(organizationId);
    if (currentTeam?.id != null) {
      window.localStorage.setItem(key, String(currentTeam.id));
      if (storedTeamId !== currentTeam.id) {
        setStoredTeamId(currentTeam.id);
      }
    } else {
      window.localStorage.removeItem(key);
    }
  }, [currentTeam?.id, organizationId, storedTeamId]);

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      organizations,
      currentOrganization,
      organizationId,
      currentOrganizationId: organizationId,
      setCurrentOrganizationId: (nextOrganizationId: number) => {
        setStoredOrganizationId(nextOrganizationId);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(ORG_STORAGE_KEY, String(nextOrganizationId));
          const rawTeamId = window.localStorage.getItem(teamStorageKey(nextOrganizationId));
          setStoredTeamId(rawTeamId ? Number(rawTeamId) || null : null);
        }
        updateStoredSession({ user: { organizationId: nextOrganizationId } });
        void queryClient.invalidateQueries();
      },
      teams,
      currentTeam,
      currentTeamId: currentTeam?.id ?? null,
      setCurrentTeamId: (teamId: number) => {
        setStoredTeamId(teamId);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(teamStorageKey(organizationId), String(teamId));
        }
        void queryClient.invalidateQueries();
      },
      isLoading: organizationsQuery.isLoading || teamsQuery.isLoading,
    }),
    [organizations, currentOrganization, organizationId, teams, currentTeam, organizationsQuery.isLoading, teamsQuery.isLoading, queryClient]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useCurrentWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useCurrentWorkspace must be used within WorkspaceProvider');
  }
  return context;
}
