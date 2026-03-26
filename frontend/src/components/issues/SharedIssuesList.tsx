'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronDown, ChevronRight, FolderKanban, Plus, Tag, UserCircle2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useI18n } from '@/i18n/useI18n';
import type { Issue, Project, ViewQueryState } from '@/lib/api/types';
import { getStoredUser } from '@/lib/auth';
import { IssueAssigneeSelectMenu } from './IssueAssigneeSelectMenu';
import { IssuePrioritySelectMenu } from './IssuePrioritySelectMenu';
import { IssueStatusSelectMenu } from './IssueStatusSelectMenu';
import {
  formatIssueDate,
  getIssueInitials,
  ISSUE_GROUP_ORDER,
  ISSUE_PRIORITY_ORDER,
  ISSUE_STATUS_MENU_OPTIONS,
  issuePriorityIcon,
  issuePriorityLabelKey,
  issueResolutionLabelKey,
  issueStateIcon,
  issueStateLabelKey,
  issueStatusMenuIcon,
  issueStatusMenuLabelKey,
  issueStatusMenuValue,
  issueTypeLabelKey,
  NO_PRIORITY_VALUE,
} from './issues-list-utils';

type SharedMember = {
  id: number | string;
  name: string;
};

type SharedRowActions = {
  onChangePriority?: (issue: Issue, priority: Issue['priority'] | null) => Promise<void> | void;
  onChangeStatus?: (issue: Issue, next: { state: Issue['state']; resolution: Issue['resolution'] }) => Promise<void> | void;
  onChangeAssignee?: (issue: Issue, assigneeId: number | null) => Promise<void> | void;
};

type GroupingField = 'state' | 'priority' | 'assigneeId' | 'projectId' | null;

export type SharedIssuesListProps = {
  issues: Issue[];
  variant: 'preview' | 'workspace';
  locale: string;
  emptyLabel: string;
  groupBy?: 'state';
  groupingField?: GroupingField;
  groupKeys?: string[];
  groupDefinitions?: Array<{ key: string; label: string; count: number }>;
  displayConfig?: ViewQueryState['display'];
  collapsedGroups?: Set<string>;
  onToggleGroup?: (groupKey: string) => void;
  onOpenIssue: (issue: Issue) => void;
  rowActions?: SharedRowActions;
  members?: SharedMember[];
  projects?: Project[];
  isLoading?: boolean;
};

type IssueInlineMenuKind = 'priority' | 'status' | 'assignee';

type IssueGroup = {
  key: string;
  label: string;
  count: number;
  icon?: React.ReactNode;
  items: Issue[];
};

const DEFAULT_PREVIEW_COLUMNS = ['identifier', 'priority', 'state', 'assignee', 'project', 'labels', 'updatedAt'] as const;
const PRIORITY_GROUP_ORDER = [NO_PRIORITY_VALUE, 'URGENT', 'HIGH', 'MEDIUM', 'LOW'] as const;

export default function SharedIssuesList({
  issues,
  variant,
  locale,
  emptyLabel,
  groupingField = 'state',
  groupKeys,
  groupDefinitions,
  displayConfig,
  collapsedGroups,
  onToggleGroup,
  onOpenIssue,
  rowActions,
  members = [],
  projects = [],
  isLoading = false,
}: SharedIssuesListProps) {
  const { t } = useI18n();
  const storedUser = getStoredUser();
  const currentUser =
    storedUser?.id && storedUser?.username ? { id: storedUser.id, name: storedUser.username } : null;
  const [activeIssueMenu, setActiveIssueMenu] = useState<{
    issueId: number;
    kind: IssueInlineMenuKind;
  } | null>(null);
  const [issueMenuSearch, setIssueMenuSearch] = useState('');

  const memberNameById = useMemo(
    () => new Map(members.map((member) => [String(member.id), member.name])),
    [members]
  );
  const projectNameById = useMemo(
    () => new Map(projects.map((project) => [String(project.id), project.name])),
    [projects]
  );
  const visibleColumns = useMemo(
    () =>
      displayConfig?.visibleColumns?.length
        ? displayConfig.visibleColumns
        : [...DEFAULT_PREVIEW_COLUMNS],
    [displayConfig?.visibleColumns]
  );

  const filteredIssues = useMemo(
    () => ((displayConfig?.showSubIssues ?? true) ? issues : issues.filter((issue) => issue.parentIssueId == null)),
    [displayConfig?.showSubIssues, issues]
  );

  const grouped = useMemo(
    () => buildIssueGroups({
      issues: filteredIssues,
      groupingField,
      groupDefinitions,
      groupKeys,
      members,
      projects,
      t,
      includeEmptyGroups: displayConfig?.showEmptyGroups ?? true,
    }),
    [displayConfig?.showEmptyGroups, filteredIssues, groupDefinitions, groupKeys, groupingField, members, projects, t]
  );

  function openIssueMenu(issueId: number, kind: IssueInlineMenuKind) {
    setIssueMenuSearch('');
    setActiveIssueMenu({ issueId, kind });
  }

  if (isLoading) {
    return <div className="py-10 text-sm text-ink-500">{t('common.loading')}</div>;
  }

  if (!filteredIssues.length) {
    return <div className="py-10 text-sm text-ink-500">{emptyLabel}</div>;
  }

  const renderAsPreview = variant === 'preview' || variant === 'workspace';

  return (
    <div className={renderAsPreview ? 'space-y-4' : 'space-y-1'}>
      {grouped.map((group) => {
        const isCollapsed = collapsedGroups?.has(group.key) ?? false;
        const showGroupHeader = groupingField != null;
        return (
          <section key={group.key} className={renderAsPreview ? 'space-y-2' : 'border-b border-border-soft last:border-b-0'}>
            {showGroupHeader ? (
              renderAsPreview ? (
                <div className="flex items-center justify-between rounded-[16px] bg-slate-50 px-5 py-3">
                  <div className="flex items-center gap-3">
                    {group.icon}
                    <div className="text-[15px] font-medium text-ink-800">
                      {group.label}
                      <span className="ml-2 text-ink-400">{group.count}</span>
                    </div>
                  </div>
                  <Plus className="h-4 w-4 text-ink-400" />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onToggleGroup?.(group.key)}
                  aria-expanded={!isCollapsed}
                  className="flex w-full items-center px-3 py-2.5 text-left transition hover:bg-slate-50/40"
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-ink-900">
                    {isCollapsed ? (
                      <ChevronRight className="h-4 w-4 text-ink-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-ink-400" />
                    )}
                    {group.icon}
                    <span>{group.label}</span>
                    <span className="text-ink-400">{group.count}</span>
                  </div>
                </button>
              )
            ) : null}

            {!showGroupHeader || !isCollapsed ? (
              group.items.length ? (
                <div className={renderAsPreview ? 'space-y-1' : ''}>
                  {group.items.map((issue, index) => (
                    <PreviewIssueRow
                      key={issue.id}
                      issue={issue}
                      locale={locale}
                      visibleColumns={visibleColumns}
                      members={members}
                      projects={projects}
                      currentUser={currentUser}
                      activeIssueMenu={activeIssueMenu}
                      issueMenuSearch={issueMenuSearch}
                      memberNameById={memberNameById}
                      projectNameById={projectNameById}
                      onIssueMenuSearchChange={setIssueMenuSearch}
                      onOpenIssue={onOpenIssue}
                      onOpenIssueMenu={openIssueMenu}
                      onSetActiveIssueMenu={setActiveIssueMenu}
                      rowActions={rowActions}
                      isLast={index === group.items.length - 1}
                      showDivider={!renderAsPreview}
                    />
                  ))}
                </div>
              ) : !renderAsPreview ? (
                <div className="px-9 py-2 text-[11px] text-ink-300">{t('issues.page.groupEmpty')}</div>
              ) : null
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

function PreviewIssueRow({
  issue,
  locale,
  visibleColumns,
  members,
  projects,
  currentUser,
  activeIssueMenu,
  issueMenuSearch,
  memberNameById,
  projectNameById,
  onIssueMenuSearchChange,
  onOpenIssue,
  onOpenIssueMenu,
  onSetActiveIssueMenu,
  rowActions,
  isLast,
  showDivider,
}: {
  issue: Issue;
  locale: string;
  visibleColumns: string[];
  members: SharedMember[];
  projects: Project[];
  currentUser?: { id: number; name: string } | null;
  activeIssueMenu: { issueId: number; kind: IssueInlineMenuKind } | null;
  issueMenuSearch: string;
  memberNameById: Map<string, string>;
  projectNameById: Map<string, string>;
  onIssueMenuSearchChange: (value: string) => void;
  onOpenIssue: (issue: Issue) => void;
  onOpenIssueMenu: (issueId: number, kind: IssueInlineMenuKind) => void;
  onSetActiveIssueMenu: (value: { issueId: number; kind: IssueInlineMenuKind } | null) => void;
  rowActions?: SharedRowActions;
  isLast: boolean;
  showDivider?: boolean;
}) {
  const { t } = useI18n();
  const showPriority = visibleColumns.includes('priority');
  const showIdentifier = visibleColumns.includes('identifier');
  const showStatus = visibleColumns.includes('state');
  const showAssignee = visibleColumns.includes('assignee');
  const showProject = visibleColumns.includes('project');
  const showLabels = visibleColumns.includes('labels');
  const showDueDate = visibleColumns.includes('plannedEndDate') || visibleColumns.includes('dueDate');
  const showCreated = visibleColumns.includes('createdAt');
  const showUpdated = visibleColumns.includes('updatedAt');
  const assigneeName = issue.assigneeId ? memberNameById.get(String(issue.assigneeId)) : null;
  const visibleLabels = issue.labels.slice(0, 2);
  const remainingLabelCount = Math.max(0, issue.labels.length - visibleLabels.length);

  return (
    <div
      className={[
        'group grid items-center gap-2.5 rounded-[12px] px-4 py-2.5 transition hover:bg-slate-50',
        showDivider && !isLast ? 'border-b border-border-soft' : '',
        'grid-cols-[16px_auto_auto_auto_minmax(0,1fr)_auto]'
      ].join(' ')}
    >
      <div className="flex justify-center">
        <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border border-border-soft bg-white opacity-0 transition group-hover:opacity-100">
          <Check className="h-3 w-3 text-ink-300" />
        </span>
      </div>

      {showPriority ? (
        <Popover
          open={activeIssueMenu?.issueId === issue.id && activeIssueMenu.kind === 'priority'}
          onOpenChange={(open) => (open ? onOpenIssueMenu(issue.id, 'priority') : onSetActiveIssueMenu(null))}
        >
          <PopoverTrigger asChild>
            <button type="button" className="flex h-6 w-6 items-center justify-center rounded-md text-ink-500 transition hover:bg-slate-100">
              {issuePriorityIcon(issue.priority)}
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" sideOffset={10} className="w-[260px] overflow-hidden rounded-[18px] border border-border-subtle bg-white p-0 shadow-elevated">
            <IssuePrioritySelectMenu
              value={issue.priority}
              query={issueMenuSearch}
              onQueryChange={onIssueMenuSearchChange}
              placeholder={t('views.new.preview.changePriorityTo')}
              shortcut="P"
              t={t}
              onSelect={async (nextValue) => {
                await rowActions?.onChangePriority?.(issue, nextValue);
                onSetActiveIssueMenu(null);
              }}
            />
          </PopoverContent>
        </Popover>
      ) : null}

      {showIdentifier ? (
        <button type="button" onClick={() => onOpenIssue(issue)} className="truncate text-left text-[14px] text-ink-500">
          {issue.identifier}
        </button>
      ) : null}

      {showStatus ? (
        <Popover
          open={activeIssueMenu?.issueId === issue.id && activeIssueMenu.kind === 'status'}
          onOpenChange={(open) => (open ? onOpenIssueMenu(issue.id, 'status') : onSetActiveIssueMenu(null))}
        >
          <PopoverTrigger asChild>
            <button type="button" className="flex h-6 w-6 items-center justify-center rounded-md text-ink-500 transition hover:bg-slate-100">
              {issueStatusMenuIcon(issueStatusMenuValue(issue))}
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" sideOffset={10} className="w-[260px] overflow-hidden rounded-[18px] border border-border-subtle bg-white p-0 shadow-elevated">
            <IssueStatusSelectMenu
              value={issueStatusMenuValue(issue)}
              query={issueMenuSearch}
              onQueryChange={onIssueMenuSearchChange}
              placeholder={t('views.new.preview.changeStatusTo')}
              shortcut="S"
              t={t}
              onSelect={async (nextValue) => {
                const option = ISSUE_STATUS_MENU_OPTIONS.find((candidate) => candidate.value === nextValue);
                if (!option) return;
                await rowActions?.onChangeStatus?.(issue, { state: option.state, resolution: option.resolution });
                onSetActiveIssueMenu(null);
              }}
            />
          </PopoverContent>
        </Popover>
      ) : null}

      <button type="button" onClick={() => onOpenIssue(issue)} className="truncate text-left text-[14px] text-ink-900">
        {issue.title}
      </button>

      <div className="flex items-center justify-end gap-2.5">
        {showLabels
          ? visibleLabels.map((label) => (
              <span
                key={label.id}
                className="inline-flex items-center gap-1 rounded-full border border-border-soft bg-white px-2 py-0.5 text-[12px] text-ink-500"
              >
                <span className="inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: label.color || '#94a3b8' }} />
                <span className="truncate max-w-[72px]">{label.name}</span>
              </span>
            ))
          : null}
        {showLabels && remainingLabelCount > 0 ? (
          <span className="text-[12px] text-ink-400">+{remainingLabelCount}</span>
        ) : null}
        {showProject && issue.projectId != null ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-border-soft bg-white px-2 py-0.5 text-[12px] text-ink-500">
            <FolderKanban className="h-3.5 w-3.5 text-ink-400" />
            <span className="truncate max-w-[88px]">{projectNameById.get(String(issue.projectId)) ?? t('views.display.noProject')}</span>
          </span>
        ) : null}
        {showDueDate ? (
          <span className="min-w-[56px] text-right text-[13px] text-ink-400">
            {issue.plannedEndDate ? formatIssueDate(issue.plannedEndDate, locale) : '—'}
          </span>
        ) : null}
        {showCreated ? <span className="min-w-[56px] text-right text-[13px] text-ink-400">{formatIssueDate(issue.createdAt, locale)}</span> : null}
        {showUpdated ? <span className="min-w-[56px] text-right text-[13px] text-ink-400">{formatIssueDate(issue.updatedAt, locale)}</span> : null}
        {showAssignee ? (
          <Popover
            open={activeIssueMenu?.issueId === issue.id && activeIssueMenu.kind === 'assignee'}
            onOpenChange={(open) => (open ? onOpenIssueMenu(issue.id, 'assignee') : onSetActiveIssueMenu(null))}
          >
            <PopoverTrigger asChild>
              <button type="button">
                {issue.assigneeId ? (
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-coral-300 text-[9px] font-semibold text-white">
                    {getIssueInitials(assigneeName ?? 'NA')}
                  </span>
                ) : (
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-border-soft text-ink-300">
                    <UserCircle2 className="h-3.5 w-3.5" />
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" sideOffset={10} className="w-[260px] overflow-hidden rounded-[18px] border border-border-subtle bg-white p-0 shadow-elevated">
              <IssueAssigneeSelectMenu
                value={issue.assigneeId}
                members={members}
                currentUser={currentUser}
                query={issueMenuSearch}
                onQueryChange={onIssueMenuSearchChange}
                placeholder={t('views.new.preview.assignTo')}
                shortcut="A"
                t={t}
                onSelect={async (nextAssigneeId) => {
                  await rowActions?.onChangeAssignee?.(issue, nextAssigneeId);
                  onSetActiveIssueMenu(null);
                }}
              />
            </PopoverContent>
          </Popover>
        ) : null}
      </div>
    </div>
  );
}

function buildIssueGroups({
  issues,
  groupingField,
  groupDefinitions,
  groupKeys,
  members,
  projects,
  t,
  includeEmptyGroups,
}: {
  issues: Issue[];
  groupingField: GroupingField;
  groupDefinitions?: Array<{ key: string; label: string; count: number }>;
  groupKeys?: string[];
  members: SharedMember[];
  projects: Project[];
  t: (key: string, vars?: Record<string, string | number>) => string;
  includeEmptyGroups: boolean;
}): IssueGroup[] {
  if (!groupingField) {
    return [{ key: '__all__', label: '', count: issues.length, items: issues }];
  }

  const memberNameById = new Map(members.map((member) => [String(member.id), member.name]));
  const projectNameById = new Map(projects.map((project) => [String(project.id), project.name]));
  const grouped = new Map<string, Issue[]>();

  for (const issue of issues) {
    const key = resolveGroupKey(issue, groupingField);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(issue);
  }

  const normalizedGroupDefinitions =
    groupDefinitions?.map((group) => ({
      ...group,
      key: normalizeExternalGroupKey(group.key, groupingField),
    })) ?? [];
  const labelByKey = new Map(normalizedGroupDefinitions.map((group) => [group.key, group.label]));

  const baseKeys =
    groupingField === 'state'
      ? [...ISSUE_GROUP_ORDER]
      : groupingField === 'priority'
        ? [...PRIORITY_GROUP_ORDER]
        : normalizedGroupDefinitions.length
          ? normalizedGroupDefinitions.map((group) => group.key)
          : Array.from(grouped.keys());

  const scopedKeys = groupKeys?.length ? baseKeys.filter((key) => groupKeys.includes(key)) : baseKeys;
  const effectiveKeys = includeEmptyGroups ? scopedKeys : scopedKeys.filter((key) => (grouped.get(key) ?? []).length > 0);

  return effectiveKeys
    .map((key) => {
      const items = grouped.get(key) ?? [];
      return {
        key,
        label: labelByKey.get(key) || resolveGroupLabel(key, groupingField, memberNameById, projectNameById, t),
        count: items.length,
        icon: resolveGroupIcon(key, groupingField),
        items,
      };
    })
    .filter((group) => includeEmptyGroups || group.items.length > 0);
}

function normalizeExternalGroupKey(key: string, groupingField: NonNullable<GroupingField>) {
  const trimmed = key.trim();
  if (groupingField === 'assigneeId') {
    if (!trimmed || trimmed === 'null' || trimmed === 'undefined' || trimmed.toLowerCase() === 'unassigned') {
      return '__no_assignee__';
    }
    return trimmed;
  }
  if (groupingField === 'projectId') {
    if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
      return '__no_project__';
    }
    return trimmed;
  }
  if (groupingField === 'priority') {
    if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
      return NO_PRIORITY_VALUE;
    }
    return trimmed;
  }
  return trimmed;
}

function resolveGroupKey(issue: Issue, groupingField: NonNullable<GroupingField>) {
  if (groupingField === 'state') return issue.state;
  if (groupingField === 'priority') return issue.priority ?? NO_PRIORITY_VALUE;
  if (groupingField === 'assigneeId') return issue.assigneeId == null ? '__no_assignee__' : String(issue.assigneeId);
  return issue.projectId == null ? '__no_project__' : String(issue.projectId);
}

function resolveGroupLabel(
  key: string,
  groupingField: NonNullable<GroupingField>,
  memberNameById: Map<string, string>,
  projectNameById: Map<string, string>,
  t: (key: string, vars?: Record<string, string | number>) => string
) {
  if (groupingField === 'state') return t(issueStateLabelKey(key as Issue['state']));
  if (groupingField === 'priority') {
    return key === NO_PRIORITY_VALUE ? t('views.new.preview.noPriority') : t(issuePriorityLabelKey(key as Issue['priority']) ?? 'views.new.preview.noPriority');
  }
  if (groupingField === 'assigneeId') return key === '__no_assignee__' ? t('views.new.preview.noAssignee') : (memberNameById.get(key) ?? key);
  return key === '__no_project__' ? t('views.display.noProject') : (projectNameById.get(key) ?? key);
}

function resolveGroupIcon(key: string, groupingField: NonNullable<GroupingField>) {
  if (groupingField === 'state') return issueStateIcon(key as Issue['state']);
  if (groupingField === 'priority') return issuePriorityIcon(key === NO_PRIORITY_VALUE ? null : (key as Issue['priority']));
  if (groupingField === 'assigneeId') return <UserCircle2 className="h-4 w-4 text-ink-400" />;
  return <FolderKanban className="h-4 w-4 text-ink-400" />;
}
