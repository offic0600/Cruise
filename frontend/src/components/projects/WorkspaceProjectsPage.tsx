'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CalendarDays, Filter, FolderKanban, LayoutGrid, List, Plus, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { issuePriorityIcon } from '@/components/issues/issues-list-utils';
import { useCurrentWorkspace } from '@/components/providers/WorkspaceProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/i18n/useI18n';
import { getStoredSession } from '@/lib/auth';
import { createNotificationSubscription, getNotificationSubscriptions, updateNotificationSubscription } from '@/lib/api/collaboration';
import { getTeamMembers } from '@/lib/api/legacy';
import type { NotificationSubscription, View, WorkspaceProjectRow } from '@/lib/api/types';
import { queryKeys } from '@/lib/query/keys';
import { useWorkspaceProjects } from '@/lib/query/projects';
import { useViewDetail, useViewsIndex } from '@/lib/query/views';
import { workspaceNewViewPath, workspaceProjectViewPath, workspaceProjectsAllPath } from '@/lib/routes';
import { ProjectComposer } from './ProjectComposer';

type WorkspaceProjectsPageProps = {
  activeViewId?: number | null;
};

type ProjectTableColumn = 'health' | 'priority' | 'lead' | 'targetDate' | 'status' | 'description' | 'milestone';
type ProjectSortField = 'updatedAt' | 'createdAt' | 'targetDate' | 'priority' | 'health' | 'progress';
type TargetDateFilter = 'all' | 'with-date' | 'without-date';
type TeamMemberOption = { id: number; name: string };

const DEFAULT_PROJECT_COLUMNS: ProjectTableColumn[] = ['health', 'priority', 'lead', 'targetDate', 'status'];
const PROJECT_SORT_FIELDS: ProjectSortField[] = ['updatedAt', 'createdAt', 'targetDate', 'priority', 'health', 'progress'];
const PROJECT_STATUSES = ['PLANNED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED'] as const;
const PROJECT_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
const PROJECT_HEALTHS = ['ON_TRACK', 'AT_RISK', 'OFF_TRACK'] as const;
const PROJECT_SUBSCRIPTION_EVENT_KEYS = ['PROJECT_UPDATED', 'PROJECT_MILESTONE_ADDED'] as const;

function getInitials(value: string | null | undefined) {
  if (!value) return 'NA';
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'NA';
}

function normalizeProjectColumns(columns: string[] | undefined): ProjectTableColumn[] {
  const mapped = (columns ?? [])
    .map((column): ProjectTableColumn | null => {
      switch (column) {
        case 'health':
        case 'priority':
        case 'targetDate':
        case 'status':
        case 'description':
        case 'milestone':
          return column;
        case 'ownerId':
        case 'lead':
          return 'lead';
        default:
          return null;
      }
    })
    .filter((column): column is ProjectTableColumn => column != null);
  return mapped.length ? Array.from(new Set(mapped)) : [...DEFAULT_PROJECT_COLUMNS];
}

function normalizeProjectSort(field: string | undefined): ProjectSortField {
  if (!field) return 'updatedAt';
  if (PROJECT_SORT_FIELDS.includes(field as ProjectSortField)) return field as ProjectSortField;
  if (field === 'progressPercent') return 'progress';
  return 'updatedAt';
}

function formatDate(value: string | null, locale: string) {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'zh-CN', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function compareNullableDates(left: string | null | undefined, right: string | null | undefined) {
  if (!left && !right) return 0;
  if (!left) return 1;
  if (!right) return -1;
  return new Date(right).getTime() - new Date(left).getTime();
}

function healthTone(health: string | null) {
  switch (health) {
    case 'ON_TRACK':
      return 'bg-emerald-500';
    case 'AT_RISK':
      return 'bg-amber-500';
    case 'OFF_TRACK':
      return 'bg-rose-500';
    default:
      return 'bg-slate-300';
  }
}

function progressTone(progressPercent: number) {
  if (progressPercent >= 100) return 'border-emerald-500 text-emerald-600';
  if (progressPercent > 0) return 'border-amber-500 text-amber-600';
  return 'border-slate-300 text-slate-400';
}

function sortWorkspaceProjects(rows: WorkspaceProjectRow[], field: ProjectSortField) {
  const next = [...rows];
  next.sort((left, right) => {
    switch (field) {
      case 'createdAt':
        return compareNullableDates(left.createdAt, right.createdAt);
      case 'targetDate':
        return compareNullableDates(left.targetDate, right.targetDate);
      case 'priority': {
        const order = new Map<string, number>([['URGENT', 0], ['HIGH', 1], ['MEDIUM', 2], ['LOW', 3]]);
        return (order.get(left.priority ?? 'zzz') ?? 99) - (order.get(right.priority ?? 'zzz') ?? 99);
      }
      case 'health': {
        const order = new Map<string, number>([['OFF_TRACK', 0], ['AT_RISK', 1], ['ON_TRACK', 2]]);
        return (order.get(left.health ?? 'zzz') ?? 99) - (order.get(right.health ?? 'zzz') ?? 99);
      }
      case 'progress':
        return right.progressPercent - left.progressPercent;
      case 'updatedAt':
      default:
        return compareNullableDates(left.updatedAt, right.updatedAt);
    }
  });
  return next;
}

function projectViewHref(workspaceSlug: string, view: View) {
  return workspaceProjectViewPath(workspaceSlug, view);
}

function ProjectStatusRing({ progressPercent }: { progressPercent: number }) {
  return (
    <div className={`inline-flex h-6 min-w-[52px] items-center justify-center rounded-full border px-2.5 text-xs font-medium ${progressTone(progressPercent)}`}>
      {progressPercent}%
    </div>
  );
}

export default function WorkspaceProjectsPage({ activeViewId }: WorkspaceProjectsPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { locale, t } = useI18n();
  const {
    organizationId,
    currentTeamId,
    currentTeam,
    currentOrganizationSlug,
  } = useCurrentWorkspace();
  const session = getStoredSession();
  const currentUserId = session?.user.id ?? null;
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('__all__');
  const [priority, setPriority] = useState<string>('__all__');
  const [ownerId, setOwnerId] = useState<string>('__all__');
  const [health, setHealth] = useState<string>('__all__');
  const [hasMilestone, setHasMilestone] = useState<string>('__all__');
  const [targetDate, setTargetDate] = useState<TargetDateFilter>('all');
  const [includeArchived, setIncludeArchived] = useState(false);
  const [sortField, setSortField] = useState<ProjectSortField>('updatedAt');
  const [visibleColumns, setVisibleColumns] = useState<ProjectTableColumn[]>([...DEFAULT_PROJECT_COLUMNS]);

  const activeViewQuery = useViewDetail(activeViewId ?? null);
  const activeView = activeViewQuery.data ?? null;
  const projectViewsQuery = useViewsIndex({
    organizationId,
    resourceType: 'PROJECT',
    scopeType: 'WORKSPACE',
    scopeId: null,
    includeSystem: false,
    includeFavorites: true,
  });
  const membersQuery = useQuery({
    queryKey: ['workspace-project-owners', organizationId ?? 0],
    queryFn: () => getTeamMembers({ organizationId: organizationId ?? undefined }) as Promise<TeamMemberOption[]>,
    enabled: organizationId != null,
  });
  const subscriptionsQuery = useQuery({
    queryKey: ['project-subscriptions', currentUserId ?? 0],
    queryFn: () =>
      getNotificationSubscriptions({
        userId: currentUserId ?? undefined,
        resourceType: 'PROJECT',
        includeArchived: true,
      }),
    enabled: currentUserId != null,
  });

  const activeSubscriptions = useMemo(() => {
    const map = new Map<string, NotificationSubscription>();
    for (const subscription of subscriptionsQuery.data ?? []) {
      if (subscription.archivedAt == null && subscription.active) {
        map.set(`${subscription.resourceId}:${subscription.eventKey ?? '__default__'}`, subscription);
      }
    }
    return map;
  }, [subscriptionsQuery.data]);

  const subscriptionMutation = useMutation({
    mutationFn: async ({ projectId, eventKey, active }: { projectId: number; eventKey: string; active: boolean }) => {
      const existing = activeSubscriptions.get(`${projectId}:${eventKey}`);
      if (existing) {
        return updateNotificationSubscription(existing.id, { active, eventKey });
      }
      if (!currentUserId) throw new Error('Missing user');
      return createNotificationSubscription({
        userId: currentUserId,
        resourceType: 'PROJECT',
        resourceId: projectId,
        eventKey,
        active,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['project-subscriptions', currentUserId ?? 0] });
    },
  });

  useEffect(() => {
    if (!activeView) {
      setSortField('updatedAt');
      setVisibleColumns([...DEFAULT_PROJECT_COLUMNS]);
      return;
    }
    setSortField(normalizeProjectSort(activeView.queryState?.sorting?.[0]?.field));
    setVisibleColumns(normalizeProjectColumns(activeView.queryState?.display?.visibleColumns));
  }, [activeView]);

  const projectsQuery = useWorkspaceProjects({
    organizationId,
    teamId: currentTeamId ?? null,
    q: activeView ? undefined : search || undefined,
    status: activeView ? undefined : (status === '__all__' ? undefined : status),
    priority: activeView ? undefined : (priority === '__all__' ? undefined : priority),
    ownerId: activeView ? undefined : (ownerId === '__all__' || ownerId === '__none__' ? undefined : Number(ownerId)),
    health: activeView ? undefined : (health === '__all__' ? undefined : health),
    hasMilestone: activeView ? undefined : hasMilestone === '__all__' ? undefined : hasMilestone === 'with',
    includeArchived,
    viewId: activeView?.id ?? null,
    page: 0,
    size: 100,
  });

  const projectViews = useMemo(
    () => (projectViewsQuery.data ?? []).filter((view) => !view.archivedAt && view.resourceType === 'PROJECT'),
    [projectViewsQuery.data]
  );
  const ownerOptions = useMemo(() => Array.isArray(membersQuery.data) ? membersQuery.data : [], [membersQuery.data]);

  const filteredRows = useMemo(() => {
    let rows = [...(projectsQuery.data?.items ?? [])];
    if (!activeView && ownerId === '__none__') rows = rows.filter((row) => row.leadUserId == null);
    if (targetDate === 'with-date') rows = rows.filter((row) => row.targetDate != null);
    if (targetDate === 'without-date') rows = rows.filter((row) => row.targetDate == null);
    return sortWorkspaceProjects(rows, sortField);
  }, [activeView, ownerId, projectsQuery.data?.items, sortField, targetDate]);

  const showColumn = (column: ProjectTableColumn) => visibleColumns.includes(column);

  return (
    <AppLayout>
      <ProjectComposer
        open={createOpen}
        onOpenChange={setCreateOpen}
        organizationId={organizationId}
        initialTeamId={currentTeamId ?? null}
      />

      <div className="mx-auto w-full max-w-[1240px] pb-10">
        <div className="flex items-start justify-between gap-6 border-b border-border-soft pb-6">
          <div className="space-y-2">
            <div className="text-[34px] font-semibold tracking-[-0.03em] text-ink-900">{t('projects.title')}</div>
            <div className="max-w-[640px] text-sm leading-6 text-ink-500">{t('projects.workspace.description')}</div>
          </div>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={t('projects.workspace.filter')} className="rounded-full border border-border-soft bg-white text-ink-600 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:bg-slate-50">
                  <Filter className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[320px] rounded-[20px] border-border-subtle p-4">
                <div className="space-y-4">
                  <div className="text-sm font-medium text-ink-900">{t('projects.workspace.filter')}</div>
                  <label className="block space-y-1.5">
                    <span className="text-sm text-ink-600">{t('common.search')}</span>
                    <Input value={search} onChange={(event) => setSearch(event.target.value)} disabled={activeView != null} />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-sm text-ink-600">{t('projects.fields.status')}</span>
                    <Select value={status} onValueChange={setStatus} disabled={activeView != null}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">{t('projects.workspace.allStatuses')}</SelectItem>
                        {PROJECT_STATUSES.map((item) => (
                          <SelectItem key={item} value={item}>{t(`projects.status.${item}`)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </label>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="block space-y-1.5">
                      <span className="text-sm text-ink-600">{t('projects.workspace.fields.priority')}</span>
                      <Select value={priority} onValueChange={setPriority} disabled={activeView != null}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">{t('projects.workspace.allPriorities')}</SelectItem>
                          <SelectItem value="NO_PRIORITY">{t('projects.workspace.nonePriority')}</SelectItem>
                          {PROJECT_PRIORITIES.map((item) => (
                            <SelectItem key={item} value={item}>{t(`common.priority.${item}`)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-sm text-ink-600">{t('projects.workspace.fields.health')}</span>
                      <Select value={health} onValueChange={setHealth} disabled={activeView != null}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">{t('projects.workspace.allHealth')}</SelectItem>
                          <SelectItem value="NO_UPDATES">{t('projects.workspace.noUpdates')}</SelectItem>
                          {PROJECT_HEALTHS.map((item) => (
                            <SelectItem key={item} value={item}>{t(`projects.workspace.health.${item}`)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </label>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="block space-y-1.5">
                      <span className="text-sm text-ink-600">{t('projects.workspace.fields.lead')}</span>
                      <Select value={ownerId} onValueChange={setOwnerId} disabled={activeView != null}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">{t('projects.workspace.allLeads')}</SelectItem>
                          <SelectItem value="__none__">{t('projects.workspace.noneLead')}</SelectItem>
                          {ownerOptions.map((member) => (
                            <SelectItem key={member.id} value={String(member.id)}>{member.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-sm text-ink-600">{t('projects.workspace.fields.milestone')}</span>
                      <Select value={hasMilestone} onValueChange={setHasMilestone} disabled={activeView != null}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">{t('projects.workspace.allMilestones')}</SelectItem>
                          <SelectItem value="with">{t('projects.workspace.hasMilestone')}</SelectItem>
                          <SelectItem value="without">{t('projects.workspace.noMilestone')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </label>
                  </div>
                  <label className="block space-y-1.5">
                    <span className="text-sm text-ink-600">{t('projects.workspace.fields.targetDate')}</span>
                    <Select value={targetDate} onValueChange={(value) => setTargetDate(value as TargetDateFilter)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('projects.workspace.allTargetDates')}</SelectItem>
                        <SelectItem value="with-date">{t('projects.workspace.withTargetDate')}</SelectItem>
                        <SelectItem value="without-date">{t('projects.workspace.withoutTargetDate')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-ink-700">
                    <input
                      type="checkbox"
                      checked={includeArchived}
                      onChange={(event) => setIncludeArchived(event.target.checked)}
                      className="h-4 w-4 rounded border-border-soft"
                    />
                    {t('projects.workspace.includeArchived')}
                  </label>
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={t('views.display.title')} className="rounded-full border border-border-soft bg-white text-ink-600 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:bg-slate-50">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[360px] rounded-[20px] border-border-subtle p-4">
                <div className="space-y-4">
                  <div className="flex rounded-full border border-border-soft bg-slate-50 p-1">
                    <button type="button" className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-medium text-ink-900 shadow-sm">
                      <List className="h-4 w-4" />
                      {t('views.display.list')}
                    </button>
                    <button type="button" disabled className="flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-sm text-ink-400">
                      <LayoutGrid className="h-4 w-4" />
                      {t('views.display.board')}
                    </button>
                  </div>
                  <label className="block space-y-1.5">
                    <span className="text-sm text-ink-600">{t('views.display.ordering')}</span>
                    <Select value={sortField} onValueChange={(value) => setSortField(value as ProjectSortField)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PROJECT_SORT_FIELDS.map((field) => (
                          <SelectItem key={field} value={field}>{t(`projects.workspace.sort.${field}`)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </label>
                  <div className="space-y-2">
                    <div className="text-sm text-ink-600">{t('views.display.displayProperties')}</div>
                    <div className="flex flex-wrap gap-2">
                      {(['health', 'priority', 'lead', 'targetDate', 'status', 'description', 'milestone'] as ProjectTableColumn[]).map((column) => {
                        const active = visibleColumns.includes(column);
                        return (
                          <button
                            key={column}
                            type="button"
                            onClick={() =>
                              setVisibleColumns((current) =>
                                active ? current.filter((value) => value !== column) : [...current, column]
                              )
                            }
                            className={`rounded-full border px-3 py-1.5 text-sm transition ${
                              active
                                ? 'border-sky-200 bg-sky-50 text-sky-700'
                                : 'border-border-soft bg-white text-ink-700 hover:bg-slate-50'
                            }`}
                          >
                            {t(`projects.workspace.columns.${column}`)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button
              variant="ghost"
              size="icon"
              aria-label={t('common.create')}
              onClick={() => setCreateOpen(true)}
              className="rounded-full border border-border-soft bg-white text-ink-600 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:bg-slate-50"
            >
              <Plus className="h-4.5 w-4.5" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 py-5">
          <Link
            href={currentOrganizationSlug ? workspaceProjectsAllPath(currentOrganizationSlug) : '#'}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              activeView == null
                ? 'border-border-soft bg-slate-100 font-medium text-ink-900'
                : 'border-border-soft bg-white text-ink-700 hover:bg-slate-50'
            }`}
          >
            {t('projects.workspace.allProjects')}
          </Link>
          {projectViews.map((view) => (
            <Link
              key={view.id}
              href={currentOrganizationSlug ? projectViewHref(currentOrganizationSlug, view) : '#'}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                activeView?.id === view.id
                  ? 'border-border-soft bg-slate-100 font-medium text-ink-900'
                  : 'border-border-soft bg-white text-ink-700 hover:bg-slate-50'
              }`}
            >
              <FolderKanban className="h-4 w-4 text-ink-400" />
              {view.name}
            </Link>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => currentOrganizationSlug && router.push(workspaceNewViewPath(currentOrganizationSlug, 'projects'))}
            className="rounded-full border border-dashed border-border-soft text-ink-600"
          >
            <Plus className="mr-1 h-4 w-4" />
            {t('views.newView')}
          </Button>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-border-soft bg-white">
          <div className="grid grid-cols-[minmax(340px,1fr)_160px_100px_110px_130px_110px] gap-4 border-b border-border-soft px-12 py-4 text-sm font-medium text-ink-600">
            <div>{t('projects.workspace.columns.name')}</div>
            {showColumn('health') ? <div>{t('projects.workspace.columns.health')}</div> : <div />}
            {showColumn('priority') ? <div>{t('projects.workspace.columns.priority')}</div> : <div />}
            {showColumn('lead') ? <div>{t('projects.workspace.columns.lead')}</div> : <div />}
            {showColumn('targetDate') ? <div>{t('projects.workspace.columns.targetDate')}</div> : <div />}
            {showColumn('status') ? <div>{t('projects.workspace.columns.status')}</div> : <div />}
          </div>

          {projectsQuery.isPending ? (
            <div className="px-12 py-10 text-sm text-ink-500">{t('common.loading')}</div>
          ) : filteredRows.length === 0 ? (
            <div className="px-12 py-16 text-sm text-ink-500">{t('projects.workspace.empty')}</div>
          ) : (
            <div className="divide-y divide-border-soft">
              {filteredRows.map((project) => (
                <div key={project.id} className="grid grid-cols-[minmax(340px,1fr)_160px_100px_110px_130px_110px] gap-4 px-12 py-5 text-sm text-ink-800">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="text-ink-400">
                        <FolderKanban className="h-4.5 w-4.5" />
                      </div>
                      <div className="truncate text-[16px] font-medium text-ink-900">{project.name}</div>
                      {project.nextMilestoneName ? (
                        <Badge variant="warning" className="rounded-full bg-amber-50 text-amber-700">
                          {project.nextMilestoneName}
                        </Badge>
                      ) : null}
                      {currentUserId != null ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border-soft text-ink-500 transition hover:bg-slate-50"
                              aria-label={t('projects.workspace.subscribe')}
                            >
                              <Bell className="h-4 w-4" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent align="start" className="w-[260px] rounded-[18px] border-border-subtle p-3">
                            <div className="space-y-1">
                              {PROJECT_SUBSCRIPTION_EVENT_KEYS.map((eventKey) => {
                                const checked = activeSubscriptions.has(`${project.id}:${eventKey}`);
                                return (
                                  <button
                                    key={eventKey}
                                    type="button"
                                    onClick={() => subscriptionMutation.mutate({ projectId: project.id, eventKey, active: !checked })}
                                    className="flex w-full items-center justify-between rounded-[12px] px-3 py-2 text-left text-sm text-ink-800 transition hover:bg-slate-50"
                                  >
                                    <span>{t(`inbox.events.${eventKey}`)}</span>
                                    <input type="checkbox" readOnly checked={checked} className="h-4 w-4 rounded border-border-soft" />
                                  </button>
                                );
                              })}
                            </div>
                          </PopoverContent>
                        </Popover>
                      ) : null}
                    </div>
                    {showColumn('description') && project.description ? (
                      <div className="mt-1 truncate pl-7 text-sm text-ink-500">{project.description}</div>
                    ) : null}
                    {showColumn('milestone') && !project.nextMilestoneName ? (
                      <div className="mt-1 pl-7 text-sm text-ink-400">{t('projects.workspace.noMilestone')}</div>
                    ) : null}
                  </div>

                  {showColumn('health') ? (
                    <div className="flex items-center gap-2">
                      <span className={`inline-block h-3 w-3 rounded-full ${healthTone(project.health)}`} />
                      <span className="truncate text-ink-600">{project.health ? t(`projects.workspace.health.${project.health}`) : t('projects.workspace.noUpdates')}</span>
                    </div>
                  ) : <div />}

                  {showColumn('priority') ? (
                    <div className="flex items-center gap-2 text-ink-600">
                      {issuePriorityIcon(project.priority)}
                      <span>{project.priority ? t(`common.priority.${project.priority}`) : t('projects.workspace.nonePriority')}</span>
                    </div>
                  ) : <div />}

                  {showColumn('lead') ? (
                    <div className="flex items-center">
                      {project.leadUserName ? (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-coral-300 text-[10px] font-semibold text-white">
                          {getInitials(project.leadUserName)}
                        </div>
                      ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-border-soft text-[10px] text-ink-400">—</div>
                      )}
                    </div>
                  ) : <div />}

                  {showColumn('targetDate') ? (
                    <div className="flex items-center gap-2 text-ink-600">
                      <CalendarDays className="h-4 w-4 text-ink-400" />
                      <span>{formatDate(project.targetDate, locale)}</span>
                    </div>
                  ) : <div />}

                  {showColumn('status') ? (
                    <div className="flex items-center">
                      <ProjectStatusRing progressPercent={project.progressPercent} />
                    </div>
                  ) : <div />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
