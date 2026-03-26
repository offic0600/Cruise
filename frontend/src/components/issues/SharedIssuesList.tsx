'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronDown, ChevronRight, Plus, UserCircle2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useI18n } from '@/i18n/useI18n';
import type { Issue, Project } from '@/lib/api/types';
import {
  formatIssueDate,
  getIssueInitials,
  groupIssuesByState,
  NO_PRIORITY_VALUE,
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
  const filteredPriorityOptions = [NO_PRIORITY_VALUE, ...ISSUE_PRIORITY_ORDER].filter((priority) => {
    const label =
      priority === NO_PRIORITY_VALUE
        ? t('views.new.preview.noPriority')
        : t(issuePriorityLabelKey(priority) ?? 'views.new.preview.noPriority');
    return label.toLowerCase().includes(issueMenuSearch.trim().toLowerCase());
  });
  const filteredStatusOptions = ISSUE_STATUS_MENU_OPTIONS.filter((option) =>
    t(issueStatusMenuLabelKey(option.value)).toLowerCase().includes(issueMenuSearch.trim().toLowerCase())
  );
  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(issueMenuSearch.trim().toLowerCase())
  );

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
          <IssueMenuInput
            value={issueMenuSearch}
            onChange={onIssueMenuSearchChange}
            placeholder={t('views.new.preview.changePriorityTo')}
            shortcut="P"
          />
          <div className="px-1 py-1.5">
            {filteredPriorityOptions.map((priority, index) => (
              <button
                key={priority}
                type="button"
                onClick={async () => {
                  await rowActions?.onChangePriority?.(issue, priority === NO_PRIORITY_VALUE ? null : priority);
                  onSetActiveIssueMenu(null);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[15px] text-ink-700 transition hover:bg-slate-100"
              >
                <span className="flex w-4 justify-center">{priority === NO_PRIORITY_VALUE ? issuePriorityIcon(null) : issuePriorityIcon(priority)}</span>
                <span className="truncate">{priority === NO_PRIORITY_VALUE ? t('views.new.preview.noPriority') : t(issuePriorityLabelKey(priority) ?? 'views.new.preview.noPriority')}</span>
                <span className="ml-auto flex items-center gap-2 text-sm text-ink-500">
                  <span className="inline-flex w-4 justify-center">{(priority === NO_PRIORITY_VALUE ? issue.priority == null : issue.priority === priority) ? <Check className="h-4 w-4 text-ink-700" /> : null}</span>
                  <span>{index + 1}</span>
                </span>
              </button>
            ))}
          </div>
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
          <IssueMenuInput
            value={issueMenuSearch}
            onChange={onIssueMenuSearchChange}
            placeholder={t('views.new.preview.changeStatusTo')}
            shortcut="S"
          />
          <div className="px-1 py-1.5">
            {filteredStatusOptions.map((option, index) => {
              const currentValue = issueStatusMenuValue(issue);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={async () => {
                    await rowActions?.onChangeStatus?.(issue, { state: option.state, resolution: option.resolution });
                    onSetActiveIssueMenu(null);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[15px] text-ink-700 transition hover:bg-slate-100"
                >
                  <span className="flex w-4 justify-center">{issueStatusMenuIcon(option.value)}</span>
                  <span className="truncate">{t(issueStatusMenuLabelKey(option.value))}</span>
                  <span className="ml-auto flex items-center gap-2 text-sm text-ink-500">
                    <span className="inline-flex w-4 justify-center">{currentValue === option.value ? <Check className="h-4 w-4 text-ink-700" /> : null}</span>
                    <span>{index + 1}</span>
                  </span>
                </button>
              );
            })}
          </div>
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
          <IssueMenuInput
            value={issueMenuSearch}
            onChange={onIssueMenuSearchChange}
            placeholder={t('views.new.preview.assignTo')}
            shortcut="A"
          />
          <div className="px-1 py-1.5">
            <button
              type="button"
              onClick={async () => {
                await rowActions?.onChangeAssignee?.(issue, null);
                onSetActiveIssueMenu(null);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[15px] text-ink-700 transition hover:bg-slate-100"
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-md border border-border-soft bg-white text-ink-300" />
              <span className="truncate">{t('views.new.preview.noAssignee')}</span>
              <span className="ml-auto flex items-center gap-2 text-sm text-ink-500">
                <span className="inline-flex w-4 justify-center">{issue.assigneeId == null ? <Check className="h-4 w-4 text-ink-700" /> : null}</span>
                <span>0</span>
              </span>
            </button>
            {filteredMembers.length ? <div className="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-[0.08em] text-ink-400">{t('views.new.preview.teamMembers')}</div> : null}
            {filteredMembers.map((member, index) => (
              <button
                key={member.id}
                type="button"
                onClick={async () => {
                  await rowActions?.onChangeAssignee?.(issue, Number(member.id));
                  onSetActiveIssueMenu(null);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[15px] text-ink-700 transition hover:bg-slate-100"
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-coral-300 text-[9px] font-semibold text-white">
                  {getIssueInitials(member.name)}
                </span>
                <span className="truncate">{member.name}</span>
                <span className="ml-auto flex items-center gap-2 text-sm text-ink-500">
                  <span className="inline-flex w-4 justify-center">{String(issue.assigneeId ?? '') === String(member.id) ? <Check className="h-4 w-4 text-ink-700" /> : null}</span>
                  <span>{index + 1}</span>
                </span>
              </button>
            ))}
          </div>
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

function IssueMenuInput({
  value,
  onChange,
  placeholder,
  shortcut,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  shortcut: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-border-soft px-4 py-3">
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        className="min-w-0 flex-1 bg-transparent text-[14px] text-ink-700 outline-none placeholder:text-ink-400"
      />
      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-border-soft px-1.5 text-[11px] font-medium text-ink-500">
        {shortcut}
      </span>
    </div>
  );
}
