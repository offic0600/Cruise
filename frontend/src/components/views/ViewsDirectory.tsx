'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, FolderKanban, Layers3, Plus, Search, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { useCurrentWorkspace } from '@/components/providers/WorkspaceProvider';
import { getTeamMembers } from '@/lib/api/legacy';
import type { View, ViewResourceType, ViewScopeType } from '@/lib/api/types';
import { useCreateView, useViewsIndex } from '@/lib/query/views';
import {
  resourceTypeToViewSegment,
  workspaceNewViewPath,
  workspaceProjectViewPath,
  workspaceViewPath,
  workspaceViewsPath,
} from '@/lib/routes';
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
        : resourceType === 'PROJECT'
          ? ['key', 'name', 'status', 'ownerId', 'teamId', 'updatedAt', 'createdAt']
          : ['slugId', 'name', 'status', 'health', 'ownerId', 'targetDate', 'updatedAt', 'createdAt'],
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
  const [showLoadingState, setShowLoadingState] = useState(true);
  const effectiveScopeId = scopeType === 'TEAM' ? (scopeId ?? currentTeamId ?? null) : scopeId;

  const viewsQuery = useViewsIndex({
    organizationId,
    resourceType,
    scopeType,
    scopeId: effectiveScopeId,
    includeSystem: false,
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

  const orderedViews = useMemo(() => views.filter((view) => !view.isSystem), [views]);

  useEffect(() => {
    if (!viewsQuery.isPending) {
      setShowLoadingState(false);
      return;
    }
    setShowLoadingState(true);
    const timer = window.setTimeout(() => {
      setShowLoadingState(false);
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [viewsQuery.isPending]);

  const workspaceLabel = currentOrganization?.name ?? currentOrganizationSlug ?? t('common.workspace');
  const scopeLabel = scopeType === 'TEAM'
    ? `${teamKey ?? currentTeamKey ?? ''} · ${t('views.directory.scope.team')}`
    : `${workspaceLabel} · ${t('views.directory.scope.workspace')}`;

  async function handleCreate() {
    if (!currentOrganizationSlug) return;
    if (resourceType === 'INITIATIVE') return;
    router.push(workspaceNewViewPath(currentOrganizationSlug, resourceTypeToViewSegment(resourceType)));
  }

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-[1180px] pb-10">
        <div className="border-b border-border-soft pb-6">
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-2">
              <div className="text-[34px] font-semibold tracking-[-0.03em] text-ink-900">{t('views.title')}</div>
              <div className="max-w-[560px] text-sm leading-6 text-ink-500">
                {t('views.directory.description')}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t('common.search')}
                    className="rounded-full border border-border-soft bg-white text-ink-600 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:bg-slate-50"
                  >
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
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCreate}
                aria-label={t('common.create')}
                className="rounded-full border border-border-soft bg-white text-ink-600 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:bg-slate-50"
              >
                <Plus className="h-4.5 w-4.5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 py-5">
          {scopeType === 'WORKSPACE' ? (
            <Tabs value={resourceType} onValueChange={(value) => currentOrganizationSlug && router.push(workspaceViewsPath(currentOrganizationSlug, resourceTypeToViewSegment(value as ViewResourceType)))}>
              <TabsList className="rounded-full border border-border-soft bg-white p-1 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <TabsTrigger
                  value="ISSUE"
                  className="min-w-[92px] rounded-full border border-transparent px-5 text-[15px] text-ink-600 transition data-[state=active]:border-border-soft data-[state=active]:bg-slate-50 data-[state=active]:font-medium data-[state=active]:text-ink-900 data-[state=active]:shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
                >
                  {t('views.resources.issues')}
                </TabsTrigger>
                <TabsTrigger
                  value="PROJECT"
                  className="min-w-[92px] rounded-full border border-transparent px-5 text-[15px] text-ink-600 transition data-[state=active]:border-border-soft data-[state=active]:bg-slate-50 data-[state=active]:font-medium data-[state=active]:text-ink-900 data-[state=active]:shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
                >
                  {t('views.resources.projects')}
                </TabsTrigger>
                <TabsTrigger
                  value="INITIATIVE"
                  className="min-w-[104px] rounded-full border border-transparent px-5 text-[15px] text-ink-600 transition data-[state=active]:border-border-soft data-[state=active]:bg-slate-50 data-[state=active]:font-medium data-[state=active]:text-ink-900 data-[state=active]:shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
                >
                  {t('views.resources.initiatives')}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          ) : (
            <Tabs value="ISSUE">
              <TabsList className="rounded-full border border-border-soft bg-white p-1 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <TabsTrigger
                  value="ISSUE"
                  className="min-w-[92px] rounded-full border border-transparent px-5 text-[15px] text-ink-600 transition data-[state=active]:border-border-soft data-[state=active]:bg-slate-50 data-[state=active]:font-medium data-[state=active]:text-ink-900 data-[state=active]:shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
                >
                  {t('views.resources.issues')}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>

        <div className="border-t border-border-soft pt-5">
          <div className="grid grid-cols-[minmax(0,1fr)_220px_40px] items-center px-1 pb-3 text-sm text-ink-500">
            <div className="font-medium text-ink-700">{t('views.directory.columns.name')}</div>
            <div className="font-medium text-ink-700">{t('views.directory.columns.owner')}</div>
            <div />
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-[minmax(0,1fr)_220px_40px] items-center gap-3 rounded-[18px] bg-slate-50/90 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-700 text-[11px] font-semibold text-white">
                  {initials(workspaceLabel)}
                </div>
                <div className="text-[15px] font-medium text-ink-800">{scopeLabel}</div>
              </div>
              <div className="text-sm text-ink-400">
                {orderedViews.length ? t('views.directory.count', { count: orderedViews.length }) : null}
              </div>
              <button
                type="button"
                onClick={handleCreate}
                disabled={resourceType === 'INITIATIVE'}
                className="text-lg leading-none text-ink-500 transition hover:text-ink-900 disabled:cursor-not-allowed disabled:text-ink-300"
              >
                +
              </button>
            </div>

            {viewsQuery.isPending && showLoadingState ? (
              <div className="px-1 py-10 text-sm text-ink-500">{t('common.loading')}</div>
            ) : orderedViews.length ? (
              <div className="divide-y divide-border-soft rounded-[20px] bg-white">
                {orderedViews.map((view) => {
                  const owner = ownerLabel(view, members);
                  return (
                    <Link
                      key={view.id}
                        href={
                          currentOrganizationSlug
                            ? view.resourceType === 'PROJECT'
                              ? workspaceProjectViewPath(currentOrganizationSlug, view)
                              : workspaceViewPath(currentOrganizationSlug, view)
                            : '#'
                        }
                      className="grid grid-cols-[minmax(0,1fr)_220px_40px] items-center gap-3 rounded-[18px] px-4 py-4 transition hover:bg-slate-50"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-ink-500">
                            {view.resourceType === 'PROJECT' ? <FolderKanban className="h-3.5 w-3.5" /> : <Layers3 className="h-3.5 w-3.5" />}
                          </div>
                          <div className="truncate text-[15px] font-medium text-ink-900">{view.name}</div>
                        </div>
                        <div className="mt-1 pl-10 text-sm text-ink-500">
                          {view.description || t('views.defaultDescription')}
                        </div>
                      </div>

                      <div className="flex min-w-0 items-center gap-2 text-sm text-ink-700">
                        {owner ? (
                          <>
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-coral-300 text-[10px] font-semibold text-white">
                              {initials(owner)}
                            </div>
                            <span className="truncate">{owner}</span>
                          </>
                        ) : (
                          <span className="text-ink-400">-</span>
                        )}
                      </div>

                      <div className="flex justify-end text-ink-400">
                        <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="px-1 py-10">
                <div className="text-sm text-ink-500">{t('views.directoryEmpty')}</div>
                {viewsQuery.isError ? (
                  <button
                    type="button"
                    onClick={() => void viewsQuery.refetch()}
                    className="mt-3 text-sm font-medium text-ink-700 transition hover:text-ink-900"
                  >
                    {t('views.directory.retry')}
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
