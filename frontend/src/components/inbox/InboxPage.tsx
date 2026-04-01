'use client';

import { type ReactNode, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Archive, CheckCheck, CircleDot, ExternalLink, Filter, MoreHorizontal, PanelRightOpen } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import IssueDetailPage from '@/components/issues/IssueDetailPage';
import { useCurrentWorkspace } from '@/components/providers/WorkspaceProvider';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/i18n/useI18n';
import { getStoredSession } from '@/lib/auth';
import { archiveNotification, getNotifications, markNotificationRead, updateNotification } from '@/lib/api/collaboration';
import { getInitiative, getWorkspaceProjects } from '@/lib/api/planning';
import type { InboxListItemViewModel, Initiative, Notification, WorkspaceProjectRow } from '@/lib/api/types';
import { issueDetailPath, workspaceProjectViewPath, workspaceViewPath } from '@/lib/routes';
import { cn } from '@/lib/utils';

type InboxTab = 'all' | 'unread' | 'archived';

const KNOWN_EVENT_KEYS = ['ISSUE_ADDED', 'ISSUE_COMPLETED_OR_CANCELED', 'PROJECT_UPDATED', 'PROJECT_MILESTONE_ADDED'] as const;

function getInitials(value: string | null | undefined) {
  if (!value) return 'SY';
  return (
    value
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'SY'
  );
}

function eventLabel(t: (key: string) => string, eventKey: string | null) {
  if (!eventKey) return t('inbox.events.unknown');
  return t(`inbox.events.${eventKey}`);
}

function resourceLabel(t: (key: string) => string, resourceType: string | null) {
  if (!resourceType) return t('common.notSet');
  return t(`inbox.resources.${resourceType}`);
}

function matchesSearch(notification: Notification, search: string) {
  if (!search.trim()) return true;
  const needle = search.trim().toLowerCase();
  return [
    notification.title,
    notification.body,
    notification.actorName,
    notification.resourceTitle,
    notification.eventKey,
    typeof notification.payload?.issueIdentifier === 'string' ? notification.payload.issueIdentifier : null,
    typeof notification.payload?.projectName === 'string' ? notification.payload.projectName : null,
    typeof notification.payload?.milestoneName === 'string' ? notification.payload.milestoneName : null,
  ].some((value) => value?.toLowerCase().includes(needle));
}

function formatRelativeTime(value: string, locale: string) {
  const diffMs = new Date(value).getTime() - Date.now();
  const absSeconds = Math.round(Math.abs(diffMs) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale === 'zh-CN' ? 'zh-CN' : 'en-US', { numeric: 'auto' });
  if (absSeconds < 60) return rtf.format(Math.round(diffMs / 1000), 'second');
  if (absSeconds < 3600) return rtf.format(Math.round(diffMs / (60 * 1000)), 'minute');
  if (absSeconds < 86400) return rtf.format(Math.round(diffMs / (60 * 60 * 1000)), 'hour');
  if (absSeconds < 86400 * 7) return rtf.format(Math.round(diffMs / (24 * 60 * 60 * 1000)), 'day');
  return rtf.format(Math.round(diffMs / (7 * 24 * 60 * 60 * 1000)), 'week');
}

function detailKindFor(notification: Notification): InboxListItemViewModel['detailKind'] {
  if (notification.resourceType === 'ISSUE') return 'ISSUE';
  if (notification.resourceType === 'PROJECT') return 'PROJECT';
  if (notification.resourceType === 'INITIATIVE') return 'INITIATIVE';
  if (notification.resourceType === 'VIEW') return typeof notification.payload?.issueId === 'number' ? 'ISSUE' : 'VIEW';
  return 'UNKNOWN';
}

function buildSecondaryText(t: (key: string) => string, notification: Notification) {
  const actor = notification.actorName ?? t('inbox.noActor');
  switch (notification.eventKey) {
    case 'ISSUE_ADDED':
      return `${actor} ${t('inbox.rowActions.issueAdded')}`;
    case 'ISSUE_COMPLETED_OR_CANCELED':
      return `${actor} ${t('inbox.rowActions.issueCompleted')}`;
    case 'PROJECT_UPDATED':
      return `${actor} ${t('inbox.rowActions.projectUpdated')}`;
    case 'PROJECT_MILESTONE_ADDED':
      return `${actor} ${t('inbox.rowActions.milestoneAdded')}`;
    default:
      return `${actor} ${t('inbox.rowActions.updated')}`;
  }
}

function buildPrimaryText(notification: Notification) {
  const issueIdentifier = typeof notification.payload?.issueIdentifier === 'string' ? notification.payload.issueIdentifier : null;
  const issueTitle = typeof notification.payload?.issueTitle === 'string' ? notification.payload.issueTitle : null;
  const projectName = typeof notification.payload?.projectName === 'string' ? notification.payload.projectName : null;
  const milestoneName = typeof notification.payload?.milestoneName === 'string' ? notification.payload.milestoneName : null;
  if (issueIdentifier && issueTitle) return `${issueIdentifier} ${issueTitle}`;
  if (projectName && milestoneName) return `${projectName} · ${milestoneName}`;
  if (projectName) return projectName;
  return notification.resourceTitle ?? notification.title;
}

function mapInboxItem(notification: Notification, t: (key: string) => string, locale: string): InboxListItemViewModel {
  return {
    id: notification.id,
    resourceType: notification.resourceType,
    resourceId: notification.resourceId,
    primaryText: buildPrimaryText(notification),
    secondaryText: buildSecondaryText(t, notification),
    actorName: notification.actorName,
    actorAvatarUrl: notification.actorAvatarUrl,
    relativeTime: formatRelativeTime(notification.createdAt, locale),
    isUnread: notification.readAt == null,
    detailKind: detailKindFor(notification),
  };
}

function NotificationRow({
  notification,
  item,
  selected,
  onSelect,
  onArchive,
  onMarkUnread,
  t,
}: {
  notification: Notification;
  item: InboxListItemViewModel;
  selected: boolean;
  onSelect: () => void;
  onArchive: () => void;
  onMarkUnread: () => void;
  t: (key: string) => string;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        'group grid cursor-pointer grid-cols-[40px_minmax(0,1fr)_auto] gap-3 rounded-[14px] px-4 py-3 transition',
        selected ? 'bg-slate-100' : 'hover:bg-slate-50'
      )}
    >
      <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-ink-700">
        {item.actorAvatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.actorAvatarUrl} alt={item.actorName ?? ''} className="h-10 w-10 rounded-full object-cover" />
        ) : (
          getInitials(item.actorName ?? t('inbox.noActor'))
        )}
      </div>
      <div className="min-w-0">
        <div className="truncate text-[14px] font-medium text-ink-900">{item.primaryText}</div>
        <div className="truncate text-[13px] text-ink-500">{item.secondaryText}</div>
      </div>
      <div className="flex min-w-[72px] items-start justify-end gap-2">
        <div className="pt-[2px] text-[12px] text-ink-400">{item.relativeTime}</div>
        <div className="mt-[3px] h-2.5 w-2.5 shrink-0 rounded-full border border-slate-300 bg-white">
          {item.isUnread ? <div className="h-full w-full rounded-full bg-brand-600" /> : null}
        </div>
        <div className="ml-1 flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
          {!item.isUnread ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onMarkUnread();
              }}
              className="rounded-full p-1.5 text-ink-400 transition hover:bg-white hover:text-ink-700"
              aria-label={t('inbox.markUnread')}
            >
              <CircleDot className="h-3.5 w-3.5" />
            </button>
          ) : null}
          {notification.archivedAt == null ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onArchive();
              }}
              className="rounded-full p-1.5 text-ink-400 transition hover:bg-white hover:text-ink-700"
              aria-label={t('inbox.archive')}
            >
              <Archive className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function DetailPlaceholder({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex h-full items-center justify-center px-8">
      <div className="max-w-[460px] text-center">
        <div className="text-[22px] font-semibold tracking-tight text-ink-900">{title}</div>
        <div className="mt-3 text-sm leading-6 text-ink-500">{body}</div>
      </div>
    </div>
  );
}

function DetailPanelChrome({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-4 border-b border-border-soft/80 px-6 py-4">
        <div className="min-w-0">
          <div className="truncate text-[18px] font-semibold tracking-tight text-ink-900">{title}</div>
          {subtitle ? <div className="mt-1 text-sm text-ink-500">{subtitle}</div> : null}
        </div>
        <div className="flex items-center gap-2">{actions}</div>
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <div className="text-[11px] uppercase tracking-[0.18em] text-ink-400">{label}</div>
      <div className="mt-1 text-sm font-medium text-ink-800">{value}</div>
    </div>
  );
}

function ProjectSummaryCard({
  project,
  notification,
  locale,
  t,
  href,
}: {
  project: WorkspaceProjectRow | null;
  notification: Notification;
  locale: string;
  t: (key: string) => string;
  href: string | null;
}) {
  const milestoneName = typeof notification.payload?.milestoneName === 'string' ? notification.payload.milestoneName : null;
  return (
    <div className="rounded-[20px] border border-border-soft/80 bg-white px-5 py-5">
      <div className="text-xs uppercase tracking-[0.18em] text-ink-400">{t('inbox.projectSummary.overview')}</div>
      <div className="mt-3 text-[26px] font-semibold tracking-tight text-ink-900">{project?.name ?? notification.resourceTitle ?? t('inbox.resources.PROJECT')}</div>
      <div className="mt-2 text-sm leading-6 text-ink-500">{project?.description ?? notification.body}</div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <SummaryMetric label={t('projects.workspace.fields.health')} value={project?.health ?? t('projects.workspace.noUpdates')} />
        <SummaryMetric label={t('projects.workspace.fields.priority')} value={project?.priority ?? '---'} />
        <SummaryMetric label={t('projects.workspace.fields.lead')} value={project?.leadUserName ?? t('common.notSet')} />
        <SummaryMetric label={t('projects.workspace.columns.status')} value={`${project?.progressPercent ?? 0}%`} />
        <SummaryMetric label={t('projects.workspace.fields.targetDate')} value={project?.targetDate ? new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'zh-CN', { month: 'short', day: 'numeric' }).format(new Date(project.targetDate)) : '—'} />
        <SummaryMetric label={t('projects.workspace.fields.milestone')} value={milestoneName ?? project?.nextMilestoneName ?? '—'} />
      </div>
      {href ? (
        <div className="mt-5">
          <Link href={href} className="inline-flex items-center gap-2 rounded-full border border-border-soft px-4 py-2 text-sm text-ink-700 transition hover:bg-slate-50">
            {t('inbox.openResource')}
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function InitiativeSummaryCard({
  initiative,
  notification,
  locale,
  t,
}: {
  initiative: Initiative | null;
  notification: Notification;
  locale: string;
  t: (key: string) => string;
}) {
  return (
    <div className="rounded-[20px] border border-border-soft/80 bg-white px-5 py-5">
      <div className="text-xs uppercase tracking-[0.18em] text-ink-400">{t('inbox.initiativeSummary.overview')}</div>
      <div className="mt-3 text-[26px] font-semibold tracking-tight text-ink-900">{initiative?.name ?? notification.resourceTitle ?? t('inbox.resources.INITIATIVE')}</div>
      <div className="mt-2 text-sm leading-6 text-ink-500">{initiative?.description ?? notification.body}</div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <SummaryMetric label={t('initiatives.metrics.status')} value={initiative?.status ?? t('common.notSet')} />
        <SummaryMetric label={t('initiatives.metrics.health')} value={initiative?.health ?? t('projects.workspace.noUpdates')} />
        <SummaryMetric label={t('initiatives.metrics.targetDate')} value={initiative?.targetDate ? new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'zh-CN', { month: 'short', day: 'numeric' }).format(new Date(initiative.targetDate)) : '—'} />
        <SummaryMetric label={t('projects.workspace.fields.lead')} value={initiative?.ownerId ? `#${initiative.ownerId}` : t('common.notSet')} />
      </div>
    </div>
  );
}

export default function InboxPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { currentOrganizationSlug, organizationId } = useCurrentWorkspace();
  const { locale, t } = useI18n();
  const session = getStoredSession();
  const currentUserId = session?.user.id ?? null;
  const [tab, setTab] = useState<InboxTab>('all');
  const [search, setSearch] = useState('');
  const [actorFilter, setActorFilter] = useState<string>('__all__');
  const [resourceFilter, setResourceFilter] = useState<string>('__all__');
  const [eventFilter, setEventFilter] = useState<string>('__all__');
  const selectedId = Number(searchParams.get('notificationId') ?? '') || null;

  const notificationsQuery = useQuery({
    queryKey: ['inbox', currentUserId ?? 0],
    queryFn: () => getNotifications({ userId: currentUserId ?? undefined, includeArchived: true }),
    enabled: currentUserId != null,
  });

  const markReadMutation = useMutation({
    mutationFn: (notificationId: number) => markNotificationRead(notificationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['inbox', currentUserId ?? 0] });
    },
  });

  const markUnreadMutation = useMutation({
    mutationFn: (notificationId: number) => updateNotification(notificationId, { readAt: null }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['inbox', currentUserId ?? 0] });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (notificationId: number) => archiveNotification(notificationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['inbox', currentUserId ?? 0] });
    },
  });

  const allNotifications = notificationsQuery.data ?? [];
  const actorOptions = useMemo(
    () =>
      Array.from(
        new Map(
          allNotifications
            .filter((notification) => notification.actorId != null)
            .map((notification) => [notification.actorId as number, notification.actorName ?? `User #${notification.actorId}`])
        ).entries()
      ),
    [allNotifications]
  );
  const eventOptions = useMemo(() => {
    const values = new Set<string>();
    for (const notification of allNotifications) {
      if (notification.eventKey) values.add(notification.eventKey);
    }
    return Array.from(values);
  }, [allNotifications]);

  const filteredNotifications = useMemo(() => {
    return allNotifications.filter((notification) => {
      if (tab === 'unread' && notification.readAt != null) return false;
      if (tab === 'archived' && notification.archivedAt == null) return false;
      if (tab !== 'archived' && notification.archivedAt != null) return false;
      if (actorFilter !== '__all__' && String(notification.actorId ?? '') !== actorFilter) return false;
      if (resourceFilter !== '__all__' && notification.resourceType !== resourceFilter) return false;
      if (eventFilter !== '__all__' && notification.eventKey !== eventFilter) return false;
      return matchesSearch(notification, search);
    });
  }, [actorFilter, allNotifications, eventFilter, resourceFilter, search, tab]);

  const counts = useMemo(
    () => ({
      all: allNotifications.filter((notification) => notification.archivedAt == null).length,
      unread: allNotifications.filter((notification) => notification.archivedAt == null && notification.readAt == null).length,
      archived: allNotifications.filter((notification) => notification.archivedAt != null).length,
    }),
    [allNotifications]
  );

  const listItems = useMemo(
    () => filteredNotifications.map((notification) => mapInboxItem(notification, t, locale === 'en' ? 'en-US' : 'zh-CN')),
    [filteredNotifications, locale, t]
  );

  const selectedNotification = useMemo(
    () => filteredNotifications.find((notification) => notification.id === selectedId) ?? filteredNotifications[0] ?? null,
    [filteredNotifications, selectedId]
  );

  useEffect(() => {
    const nextSelectedId = selectedNotification?.id ?? null;
    const currentQueryId = searchParams.get('notificationId');
    if ((nextSelectedId == null && currentQueryId == null) || String(nextSelectedId ?? '') === currentQueryId) return;
    const params = new URLSearchParams(searchParams.toString());
    if (nextSelectedId == null) {
      params.delete('notificationId');
    } else {
      params.set('notificationId', String(nextSelectedId));
    }
    router.replace(`${pathname}${params.toString() ? `?${params}` : ''}`, { scroll: false });
  }, [pathname, router, searchParams, selectedNotification?.id]);

  useEffect(() => {
    if (!selectedNotification || selectedNotification.readAt != null || markReadMutation.isPending) return;
    markReadMutation.mutate(selectedNotification.id);
  }, [markReadMutation, selectedNotification]);

  const selectedDetailKind = detailKindFor(selectedNotification ?? ({} as Notification));
  const selectedIssueId =
    typeof selectedNotification?.payload?.issueId === 'number'
      ? selectedNotification.payload.issueId
      : selectedNotification?.resourceType === 'ISSUE' && typeof selectedNotification.resourceId === 'number'
        ? selectedNotification.resourceId
        : null;
  const selectedProjectId =
    typeof selectedNotification?.payload?.projectId === 'number'
      ? selectedNotification.payload.projectId
      : selectedNotification?.resourceType === 'PROJECT' && typeof selectedNotification.resourceId === 'number'
        ? selectedNotification.resourceId
        : null;
  const selectedInitiativeId =
    selectedNotification?.resourceType === 'INITIATIVE' && typeof selectedNotification.resourceId === 'number'
      ? selectedNotification.resourceId
      : null;

  const projectSummaryQuery = useQuery({
    queryKey: ['inbox', 'project-summary', organizationId ?? 0, selectedProjectId ?? 0],
    queryFn: async () => {
      const response = await getWorkspaceProjects({ organizationId: organizationId!, includeArchived: true, page: 0, size: 200 });
      return response.items.find((item) => item.id === selectedProjectId) ?? null;
    },
    enabled: organizationId != null && selectedProjectId != null,
  });

  const initiativeQuery = useQuery({
    queryKey: ['inbox', 'initiative-summary', selectedInitiativeId ?? 0],
    queryFn: () => getInitiative(selectedInitiativeId!),
    enabled: selectedInitiativeId != null,
  });

  const openSelectedResourceHref = useMemo(() => {
    if (!currentOrganizationSlug || !selectedNotification) return null;
    if (selectedIssueId && typeof selectedNotification.payload?.issueIdentifier === 'string' && typeof selectedNotification.payload?.issueTitle === 'string') {
      return issueDetailPath(currentOrganizationSlug, {
        identifier: selectedNotification.payload.issueIdentifier,
        title: selectedNotification.payload.issueTitle,
      });
    }
    if (selectedNotification.resourceType === 'PROJECT' && selectedNotification.resourceId != null) {
      return workspaceProjectViewPath(currentOrganizationSlug, {
        id: selectedNotification.resourceId,
        name: selectedNotification.resourceTitle ?? null,
      });
    }
    if (selectedNotification.resourceType === 'VIEW' && selectedNotification.resourceId != null) {
      const viewResourceType = typeof selectedNotification.payload?.viewResourceType === 'string' ? selectedNotification.payload.viewResourceType : 'ISSUE';
      return viewResourceType === 'PROJECT'
        ? workspaceProjectViewPath(currentOrganizationSlug, { id: selectedNotification.resourceId, name: selectedNotification.resourceTitle ?? null })
        : workspaceViewPath(currentOrganizationSlug, { id: selectedNotification.resourceId, name: selectedNotification.resourceTitle ?? null });
    }
    return null;
  }, [currentOrganizationSlug, selectedIssueId, selectedNotification]);

  const filterSummaryCount = [search.trim(), actorFilter !== '__all__', resourceFilter !== '__all__', eventFilter !== '__all__'].filter(Boolean).length;

  return (
    <AppLayout>
      <div className="h-[calc(100vh-48px)] overflow-hidden px-3 pb-3">
        <div className="flex h-full min-h-0 flex-col rounded-[24px] border border-border-soft/90 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between border-b border-border-soft/80 px-5 py-3">
            <div className="flex items-center gap-3">
              <div className="text-[24px] font-semibold tracking-tight text-ink-900">{t('inbox.title')}</div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className="rounded-full p-1.5 text-ink-400 transition hover:bg-slate-100 hover:text-ink-700" aria-label={t('inbox.more')}>
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-44">
                  <DropdownMenuItem onSelect={() => setTab('all')}>{t('inbox.all')}</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setTab('unread')}>{t('inbox.unread')}</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setTab('archived')}>{t('inbox.archived')}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-2">
              {(['all', 'unread', 'archived'] as InboxTab[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTab(value)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-sm transition',
                    tab === value ? 'border-border-soft bg-slate-100 font-medium text-ink-900' : 'border-transparent text-ink-500 hover:bg-slate-50'
                  )}
                >
                  {t(`inbox.${value}`)} <span className="ml-1 text-ink-400">{counts[value]}</span>
                </button>
              ))}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition',
                      filterSummaryCount > 0 ? 'border-border-soft bg-slate-100 text-ink-900' : 'border-border-soft text-ink-600 hover:bg-slate-50'
                    )}
                  >
                    <Filter className="h-4 w-4" />
                    {t('inbox.filters.title')}
                    {filterSummaryCount > 0 ? <span className="rounded-full bg-brand-600 px-1.5 text-[11px] text-white">{filterSummaryCount}</span> : null}
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-[340px] space-y-3 p-3">
                  <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('inbox.filters.search')} />
                  <Select value={actorFilter} onValueChange={setActorFilter}>
                    <SelectTrigger><SelectValue placeholder={t('inbox.actor')} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">{t('inbox.allActors')}</SelectItem>
                      {actorOptions.map(([id, name]) => (
                        <SelectItem key={id} value={String(id)}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={resourceFilter} onValueChange={setResourceFilter}>
                    <SelectTrigger><SelectValue placeholder={t('inbox.resource')} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">{t('inbox.allResources')}</SelectItem>
                      {['VIEW', 'PROJECT', 'ISSUE', 'INITIATIVE'].map((value) => (
                        <SelectItem key={value} value={value}>{resourceLabel(t, value)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={eventFilter} onValueChange={setEventFilter}>
                    <SelectTrigger><SelectValue placeholder={t('inbox.event')} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">{t('inbox.allEvents')}</SelectItem>
                      {[...KNOWN_EVENT_KEYS, ...eventOptions.filter((value) => !KNOWN_EVENT_KEYS.includes(value as never))].map((value) => (
                        <SelectItem key={value} value={value}>{eventLabel(t, value)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex justify-end">
                    <Button type="button" variant="secondary" size="sm" onClick={() => {
                      setSearch('');
                      setActorFilter('__all__');
                      setResourceFilter('__all__');
                      setEventFilter('__all__');
                    }}>
                      {t('inbox.filters.clear')}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              <button type="button" className="rounded-full border border-border-soft p-2 text-ink-400 transition hover:bg-slate-50 hover:text-ink-700" aria-label={t('inbox.display')}>
                <PanelRightOpen className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-[420px_minmax(0,1fr)]">
            <div className="min-h-0 border-r border-border-soft/80">
              <div className="h-full overflow-y-auto px-3 py-3">
                {notificationsQuery.isPending ? (
                  <div className="px-4 py-8 text-sm text-ink-500">{t('common.loading')}</div>
                ) : listItems.length === 0 ? (
                  <div className="px-4 py-10 text-sm text-ink-500">{t('inbox.empty')}</div>
                ) : (
                  <div className="space-y-1.5">
                    {filteredNotifications.map((notification, index) => (
                      <NotificationRow
                        key={notification.id}
                        notification={notification}
                        item={listItems[index]}
                        selected={selectedNotification?.id === notification.id}
                        onSelect={() => {
                          const params = new URLSearchParams(searchParams.toString());
                          params.set('notificationId', String(notification.id));
                          router.replace(`${pathname}?${params}`, { scroll: false });
                        }}
                        onArchive={() => archiveMutation.mutate(notification.id)}
                        onMarkUnread={() => markUnreadMutation.mutate(notification.id)}
                        t={t}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="min-h-0 overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfd_100%)]">
              {!selectedNotification ? (
                <DetailPlaceholder title={t('inbox.emptyTitle')} body={t('inbox.emptyBody')} />
              ) : selectedDetailKind === 'ISSUE' && selectedIssueId ? (
                <IssueDetailPage issueId={selectedIssueId} embedded />
              ) : selectedDetailKind === 'PROJECT' ? (
                <DetailPanelChrome
                  title={selectedNotification.resourceTitle ?? t('inbox.resources.PROJECT')}
                  subtitle={eventLabel(t, selectedNotification.eventKey)}
                  actions={
                    <>
                      {openSelectedResourceHref ? (
                        <Link href={openSelectedResourceHref} className="rounded-full border border-border-soft p-2 text-ink-400 transition hover:bg-slate-50 hover:text-ink-700">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      ) : null}
                      <button type="button" onClick={() => archiveMutation.mutate(selectedNotification.id)} className="rounded-full border border-border-soft p-2 text-ink-400 transition hover:bg-slate-50 hover:text-ink-700">
                        <Archive className="h-4 w-4" />
                      </button>
                    </>
                  }
                >
                  <div className="h-full overflow-y-auto px-6 py-5">
                    {projectSummaryQuery.isLoading ? <div className="text-sm text-ink-500">{t('common.loading')}</div> : <ProjectSummaryCard project={projectSummaryQuery.data ?? null} notification={selectedNotification} locale={locale} t={t} href={openSelectedResourceHref} />}
                  </div>
                </DetailPanelChrome>
              ) : selectedDetailKind === 'INITIATIVE' ? (
                <DetailPanelChrome title={selectedNotification.resourceTitle ?? t('inbox.resources.INITIATIVE')} subtitle={eventLabel(t, selectedNotification.eventKey)}>
                  <div className="h-full overflow-y-auto px-6 py-5">
                    <InitiativeSummaryCard initiative={initiativeQuery.data ?? null} notification={selectedNotification} locale={locale} t={t} />
                  </div>
                </DetailPanelChrome>
              ) : (
                <DetailPanelChrome
                  title={selectedNotification.resourceTitle ?? selectedNotification.title}
                  subtitle={eventLabel(t, selectedNotification.eventKey)}
                  actions={
                    <>
                      {openSelectedResourceHref ? (
                        <Link href={openSelectedResourceHref} className="rounded-full border border-border-soft p-2 text-ink-400 transition hover:bg-slate-50 hover:text-ink-700">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      ) : null}
                      {selectedNotification.readAt == null ? (
                        <button type="button" onClick={() => markReadMutation.mutate(selectedNotification.id)} className="rounded-full border border-border-soft p-2 text-ink-400 transition hover:bg-slate-50 hover:text-ink-700">
                          <CheckCheck className="h-4 w-4" />
                        </button>
                      ) : null}
                    </>
                  }
                >
                  <div className="h-full overflow-y-auto px-6 py-5">
                    <div className="rounded-[20px] border border-border-soft/80 bg-white px-5 py-5">
                      <div className="text-sm font-medium text-ink-900">{selectedNotification.title}</div>
                      <div className="mt-3 text-sm leading-7 text-ink-600">{selectedNotification.body}</div>
                    </div>
                  </div>
                </DetailPanelChrome>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
