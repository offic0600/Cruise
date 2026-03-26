'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronDown, ChevronRight, Plus, UserCircle2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useI18n } from '@/i18n/useI18n';
import type { Issue, Project } from '@/lib/api/types';
import { getStoredUser } from '@/lib/auth';
import { IssueAssigneeSelectMenu } from './IssueAssigneeSelectMenu';
import { IssuePrioritySelectMenu } from './IssuePrioritySelectMenu';
import { IssueStatusSelectMenu } from './IssueStatusSelectMenu';
import {
  formatIssueDate,
  getIssueInitials,
  groupIssuesByState,
  ISSUE_GROUP_ORDER,
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

export type SharedIssuesListProps = {
  issues: Issue[];
  variant: 'preview' | 'workspace';
  locale: string;
  emptyLabel: string;
  groupBy?: 'state';
  groupKeys?: string[];
  collapsedGroups?: Set<string>;
  onToggleGroup?: (groupKey: string) => void;
  onOpenIssue: (issue: Issue) => void;
  rowActions?: SharedRowActions;
  members?: SharedMember[];
  projects?: Project[];
  isLoading?: boolean;
};

type IssueInlineMenuKind = 'priority' | 'status' | 'assignee';

export default function SharedIssuesList({
  issues,
  variant,
  locale,
  emptyLabel,
  groupBy = 'state',
  groupKeys,
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

  const grouped = useMemo(() => {
    if (groupBy !== 'state') return [];
    const rawGroups = groupIssuesByState(issues);
    const scopedGroups = groupKeys?.length ? rawGroups.filter((group) => groupKeys.includes(group.key)) : rawGroups;
    return variant === 'preview' ? scopedGroups.filter((group) => group.items.length > 0) : scopedGroups;
  }, [groupBy, groupKeys, issues, variant]);

  function openIssueMenu(issueId: number, kind: IssueInlineMenuKind) {
    setIssueMenuSearch('');
    setActiveIssueMenu({ issueId, kind });
  }

  if (isLoading) {
    return <div className="py-10 text-sm text-ink-500">{t('common.loading')}</div>;
  }

  if (!issues.length) {
    return <div className="py-10 text-sm text-ink-500">{emptyLabel}</div>;
  }

  return (
    <div className={variant === 'preview' ? 'space-y-4' : 'space-y-1'}>
      {grouped.map((group) => {
        const isCollapsed = collapsedGroups?.has(group.key) ?? false;
        return (
          <section key={group.key} className={variant === 'preview' ? 'space-y-2' : 'border-b border-border-soft last:border-b-0'}>
            {variant === 'preview' ? (
              <div className="flex items-center justify-between rounded-[16px] bg-slate-50 px-5 py-3">
                <div className="flex items-center gap-3">
                  {issueStateIcon(group.key as Issue['state'])}
                  <div className="text-[15px] font-medium text-ink-800">
                    {t(issueStateLabelKey(group.key as Issue['state']))}
                    <span className="ml-2 text-ink-400">{group.items.length}</span>
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
                  {issueStateIcon(group.key as Issue['state'])}
                  <span>{t(issueStateLabelKey(group.key as Issue['state']))}</span>
                  <span className="text-ink-400">{group.items.length}</span>
                </div>
              </button>
            )}

            {!isCollapsed ? (
              group.items.length ? (
                <div className={variant === 'preview' ? 'space-y-1' : ''}>
                  {group.items.map((issue, index) =>
                    variant === 'preview' ? (
                      <PreviewIssueRow
                        key={issue.id}
                        issue={issue}
                        locale={locale}
                        members={members}
                        currentUser={currentUser}
                        activeIssueMenu={activeIssueMenu}
                        issueMenuSearch={issueMenuSearch}
                        memberNameById={memberNameById}
                        onIssueMenuSearchChange={setIssueMenuSearch}
                        onOpenIssue={onOpenIssue}
                        onOpenIssueMenu={openIssueMenu}
                        onSetActiveIssueMenu={setActiveIssueMenu}
                        rowActions={rowActions}
                      />
                    ) : (
                      <WorkspaceIssueRow
                        key={issue.id}
                        issue={issue}
                        isLast={index === group.items.length - 1}
                        locale={locale}
                        members={members}
                        projects={projects}
                        onOpenIssue={onOpenIssue}
                      />
                    )
                  )}
                </div>
              ) : variant === 'workspace' ? (
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
  members,
  currentUser,
  activeIssueMenu,
  issueMenuSearch,
  memberNameById,
  onIssueMenuSearchChange,
  onOpenIssue,
  onOpenIssueMenu,
  onSetActiveIssueMenu,
  rowActions,
}: {
  issue: Issue;
  locale: string;
  members: SharedMember[];
  currentUser?: { id: number; name: string } | null;
  activeIssueMenu: { issueId: number; kind: IssueInlineMenuKind } | null;
  issueMenuSearch: string;
  memberNameById: Map<string, string>;
  onIssueMenuSearchChange: (value: string) => void;
  onOpenIssue: (issue: Issue) => void;
  onOpenIssueMenu: (issueId: number, kind: IssueInlineMenuKind) => void;
  onSetActiveIssueMenu: (value: { issueId: number; kind: IssueInlineMenuKind } | null) => void;
  rowActions?: SharedRowActions;
}) {
  const { t } = useI18n();

  return (
    <div className="group grid grid-cols-[16px_16px_74px_16px_minmax(0,1fr)_24px_68px] items-center gap-2.5 rounded-[12px] px-4 py-2.5 transition hover:bg-slate-50">
      <div className="flex justify-center">
        <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border border-border-soft bg-white opacity-0 transition group-hover:opacity-100">
          <Check className="h-3 w-3 text-ink-300" />
        </span>
      </div>

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

      <button type="button" onClick={() => onOpenIssue(issue)} className="truncate text-left text-[14px] text-ink-500">
        {issue.identifier}
      </button>

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

      <button type="button" onClick={() => onOpenIssue(issue)} className="truncate text-left text-[14px] text-ink-900">
        {issue.title}
      </button>

      <Popover
        open={activeIssueMenu?.issueId === issue.id && activeIssueMenu.kind === 'assignee'}
        onOpenChange={(open) => (open ? onOpenIssueMenu(issue.id, 'assignee') : onSetActiveIssueMenu(null))}
      >
        <PopoverTrigger asChild>
          <button type="button" className="justify-self-end">
            {issue.assigneeId ? (
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-coral-300 text-[9px] font-semibold text-white">
                {getIssueInitials(memberNameById.get(String(issue.assigneeId)) ?? 'NA')}
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

      <div className="justify-self-end text-[13px] text-ink-400">{formatIssueDate(issue.createdAt, locale)}</div>
    </div>
  );
}

function WorkspaceIssueRow({
  issue,
  isLast,
  locale,
  members,
  projects,
  onOpenIssue,
}: {
  issue: Issue;
  isLast: boolean;
  locale: string;
  members: SharedMember[];
  projects: Project[];
  onOpenIssue: (issue: Issue) => void;
}) {
  const { t } = useI18n();
  const assignee = members.find((member) => String(member.id) === String(issue.assigneeId));
  const project = projects.find((item) => item.id === issue.projectId);
  const assigneeLabel = assignee?.name ?? t('issues.unset.assignee');
  const priorityLabel = issue.priority == null ? t('views.new.preview.noPriority') : t(issuePriorityLabelKey(issue.priority) ?? 'views.new.preview.noPriority');
  const resolutionLabel =
    issue.state === 'CANCELED' && issue.resolution && issue.resolution !== 'CANCELED'
      ? `${t(issueStateLabelKey(issue.state))} · ${t(issueResolutionLabelKey(issue.resolution))}`
      : null;

  return (
    <div
      onClick={() => onOpenIssue(issue)}
      className={`grid cursor-pointer grid-cols-[minmax(0,1fr)_170px_110px_72px] items-center gap-4 px-3 py-2.5 transition hover:bg-slate-50/40 ${isLast ? '' : 'border-b border-border-soft'}`}
    >
      <div className="min-w-0 space-y-1">
        <div className="flex items-center gap-3 text-sm">
          <span className="inline-flex h-5 w-5 items-center justify-center text-ink-500">{issueStateIcon(issue.state)}</span>
          <span className="font-medium text-ink-400">{issue.identifier}</span>
          <span className="truncate text-[15px] text-ink-900">{issue.title}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 pl-8 text-[12px] text-ink-400">
          <span>{t(issueTypeLabelKey(issue.type))}</span>
          {project ? <span>{project.name}</span> : null}
          {resolutionLabel ? <span>{resolutionLabel}</span> : null}
        </div>
      </div>

      <div className="truncate text-[13px] text-ink-500">
        <span>{assigneeLabel}</span>
      </div>

      <div className="text-[13px] text-ink-500">
        <span>{priorityLabel}</span>
      </div>

      <div className="text-right text-[12px] text-ink-400">
        <span>{formatIssueDate(issue.updatedAt, locale)}</span>
      </div>
    </div>
  );
}
