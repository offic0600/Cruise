'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, FolderKanban, Layers3, Plus, Search, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { useCurrentWorkspace } from '@/components/providers/WorkspaceProvider';
import { getTeamMembers } from '@/lib/api/legacy';
import type { View, ViewResourceType, ViewScopeType } from '@/lib/api/types';
import { useCreateView, useViewsIndex } from '@/lib/query/views';
import { teamViewsPath, workspaceViewPath, workspaceViewsPath } from '@/lib/routes';
import { useI18n } from '@/i18n/useI18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type TeamMember = {
  id: number;
  name: string;
  email?: string | null;
};

function defaultQueryState(resourceType: ViewResourceType) {
  return {
    filters: { operator: 'AND' as const, children: [] },
    display: {
      layout: 'LIST' as const,
      visibleColumns: resourceType === 'ISSUE'
        ? ['identifier', 'title', 'priority', 'state', 'assignee', 'project', 'labels', 'updatedAt', 'createdAt']
        : ['key', 'name', 'status', 'ownerId', 'teamId', 'updatedAt', 'createdAt'],
      density: 'comfortable' as const,
      showSubIssues: true,
      showEmptyGroups: true,
    },
    grouping: { field: null as string | null },
    sorting: [{ field: 'updatedAt', direction: 'desc' as const, nulls: 'last' as const }],
  };
}

function initials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'V';
}

function ownerLabel(view: View, members: TeamMember[]) {
  if (!view.ownerUserId) return null;
  return members.find((member) => member.id === view.ownerUserId)?.name ?? `#${view.ownerUserId}`;
}

export default function ViewsDirectory({
  resourceType,
  scopeType,
  scopeId,
  teamKey,
}: {
  resourceType: ViewResourceType;
  scopeType: ViewScopeType;
  scopeId: number | null;
  teamKey?: string | null;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const {
    organizationId,
    currentOrganization,
    currentOrganizationSlug,
    currentTeamId,
    currentTeamKey,
  } = useCurrentWorkspace();
  const [search, setSearch] = useState('');
  const effectiveScopeId = scopeType === 'TEAM' ? (scopeId ?? currentTeamId ?? null) : scopeId;

  const viewsQuery = useViewsIndex({
    organizationId,
    resourceType,
    scopeType,
    scopeId: effectiveScopeId,
    includeSystem: true,
    includeFavorites: true,
    q: search || undefined,
  });

  const membersQuery = useQuery({
    queryKey: ['view-owners', organizationId ?? 'none', scopeType, scopeId ?? 'root'],
    queryFn: () =>
      getTeamMembers({
        organizationId: organizationId ?? undefined,
        teamId: scopeType === 'TEAM' ? effectiveScopeId ?? undefined : undefined,
      }) as Promise<TeamMember[]>,
    enabled: organizationId != null,
  });

  const createViewMutation = useCreateView();
  const members = Array.isArray(membersQuery.data) ? membersQuery.data : [];
  const views = viewsQuery.data ?? [];

  const orderedViews = useMemo(
    () => [
      ...views.filter((view) => view.isSystem),
      ...views.filter((view) => !view.isSystem),
    ],
    [views]
  );

  const scopeLabel = scopeType === 'TEAM'
    ? `${teamKey ?? currentTeamKey ?? ''} · Team`
    : `${currentOrganization?.name ?? currentOrganizationSlug ?? t('common.workspace')} · Workspace`;

  async function handleCreate() {
    if (!organizationId || !currentOrganizationSlug) return;
    const created = await createViewMutation.mutateAsync({
      organizationId,
      resourceType,
      scopeType,
      scopeId: effectiveScopeId,
      name: t('views.newView'),
      description: null,
      visibility: scopeType === 'TEAM' ? 'TEAM' : 'PERSONAL',
      queryState: defaultQueryState(resourceType),
      layout: 'LIST',
    });
    router.push(workspaceViewPath(currentOrganizationSlug, created.id));
  }

  return (
    <AppLayout>
      <div className="rounded-[28px] border border-border-subtle bg-white/95 shadow-[0_24px_60px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-between border-b border-border-soft px-6 py-4">
          <h1 className="text-[30px] font-semibold tracking-[-0.02em] text-ink-900">{t('views.title')}</h1>
          <Button variant="ghost" size="icon" onClick={handleCreate} aria-label={t('common.create')}>
            <Plus className="h-4.5 w-4.5" />
          </Button>
        </div>

        <div className="flex items-center justify-between gap-4 border-b border-border-soft px-4 py-3">
          {scopeType === 'WORKSPACE' ? (
            <Tabs value={resourceType} onValueChange={(value) => currentOrganizationSlug && router.push(workspaceViewsPath(currentOrganizationSlug, value === 'PROJECT' ? 'projects' : 'issues'))}>
              <TabsList className="rounded-full border border-border-soft bg-transparent p-0.5">
                <TabsTrigger
                  value="ISSUE"
                  className="rounded-full border border-transparent px-4 text-ink-500 transition data-[state=active]:border-border-soft data-[state=active]:bg-slate-50 data-[state=active]:font-medium data-[state=active]:text-ink-900 data-[state=active]:shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
                >
                  {t('views.resources.issues')}
                </TabsTrigger>
                <TabsTrigger
                  value="PROJECT"
                  className="rounded-full border border-transparent px-4 text-ink-500 transition data-[state=active]:border-border-soft data-[state=active]:bg-slate-50 data-[state=active]:font-medium data-[state=active]:text-ink-900 data-[state=active]:shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
                >
                  {t('views.resources.projects')}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          ) : (
            <Tabs value="ISSUE">
              <TabsList className="rounded-full border border-border-soft bg-transparent p-0.5">
                <TabsTrigger
                  value="ISSUE"
                  className="rounded-full border border-transparent px-4 text-ink-500 transition data-[state=active]:border-border-soft data-[state=active]:bg-slate-50 data-[state=active]:font-medium data-[state=active]:text-ink-900 data-[state=active]:shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
                >
                  {t('views.resources.issues')}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="secondary" size="icon" aria-label={t('common.search')}>
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] rounded-[18px] border-border-subtle p-4">
              <div className="space-y-3">
                <div className="text-sm font-medium text-ink-900">{t('common.search')}</div>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={t('views.searchPlaceholder')}
                    className="pl-9"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="px-6 py-4">
          <div className="grid grid-cols-[minmax(0,1fr)_220px_40px] items-center px-2 pb-3 text-sm text-ink-500">
            <div className="font-medium text-ink-700">Name</div>
            <div className="font-medium text-ink-700">Owner</div>
            <div />
          </div>

          <div className="overflow-hidden rounded-[22px] border border-border-soft bg-white">
            <div className="grid grid-cols-[minmax(0,1fr)_220px_40px] items-center gap-3 border-b border-border-soft bg-slate-25 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-700 text-[11px] font-semibold text-white">
                  {initials(currentOrganization?.name ?? currentOrganizationSlug ?? 'WS')}
                </div>
                <span className="text-[15px] font-medium text-ink-800">{scopeLabel}</span>
              </div>
              <div />
              <button type="button" onClick={handleCreate} className="text-lg leading-none text-ink-500 transition hover:text-ink-900">+</button>
            </div>

            {viewsQuery.isLoading ? (
              <div className="px-4 py-10 text-sm text-ink-500">{t('common.loading')}</div>
            ) : orderedViews.length ? (
              <div className="divide-y divide-border-soft">
                {orderedViews.map((view) => {
                  const owner = ownerLabel(view, members);
                  return (
                    <Link
                      key={view.id}
                      href={currentOrganizationSlug ? workspaceViewPath(currentOrganizationSlug, view.id) : '#'}
                      className="grid grid-cols-[minmax(0,1fr)_220px_40px] items-center gap-3 px-4 py-4 transition hover:bg-slate-50"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-ink-500">
                            {view.resourceType === 'PROJECT' ? <FolderKanban className="h-3.5 w-3.5" /> : <Layers3 className="h-3.5 w-3.5" />}
                          </div>
                          <div className="truncate text-[15px] font-medium text-ink-900">{view.name}</div>
                        </div>
                        {view.description ? <div className="mt-1 pl-9 text-sm text-ink-500">{view.description}</div> : null}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-ink-700">
                        {owner ? (
                          <>
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-coral-300 text-[10px] font-semibold text-white">
                              {initials(owner)}
                            </div>
                            <span className="truncate">{owner}</span>
                          </>
                        ) : null}
                      </div>

                      <div className="flex justify-end text-ink-400">
                        <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="px-4 py-10 text-sm text-ink-500">{t('views.empty')}</div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
