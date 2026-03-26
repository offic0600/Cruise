'use client';

import { type ReactNode, useMemo, useState } from 'react';
import {
  ChevronDown,
  FolderKanban,
  Plus,
  Tag,
  UserCircle2,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { CustomFieldDefinition, Issue, Label, Project } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { IssueAssigneeSelectMenu } from '../IssueAssigneeSelectMenu';
import { IssueLabelsSelectMenu } from '../IssueLabelsSelectMenu';
import { IssuePrioritySelectMenu } from '../IssuePrioritySelectMenu';
import { IssueStatusSelectMenu } from '../IssueStatusSelectMenu';
import {
  ISSUE_STATUS_MENU_OPTIONS,
  getIssueInitials,
  issuePriorityIcon,
  issuePriorityLabelKey,
  issueStatusMenuIcon,
  issueStatusMenuLabelKey,
  issueStatusMenuValue,
} from '../issues-list-utils';

const EMPTY = '__empty__';

type SidebarDraft = {
  state: Issue['state'];
  resolution: Issue['resolution'];
  priority: Issue['priority'];
  assigneeId: number | null;
  projectId: number | null;
  labelIds: number[];
  customFields: Record<string, unknown>;
};

type SidebarOption = {
  value: string;
  label: string;
  icon?: ReactNode;
  iconClassName?: string;
  avatarText?: string;
  avatarClassName?: string;
};

export function IssueDetailSidebar({
  draftIssue,
  issue,
  members,
  projects,
  labels,
  visibleCustomFields,
  activeProperty,
  locale: _locale,
  t,
  onSetDraftIssue,
  onSetActiveProperty,
  onCreateLabel,
  renderCustomFieldInput,
  formatCustomFieldValue,
}: {
  draftIssue: SidebarDraft;
  issue: Issue;
  members: Array<{ id: number; name: string }>;
  projects: Project[];
  labels: Label[];
  visibleCustomFields: CustomFieldDefinition[];
  activeProperty: string | null;
  locale: string;
  t: (key: string, vars?: Record<string, string | number>) => string;
  onSetDraftIssue: (updater: (current: SidebarDraft) => SidebarDraft) => void;
  onSetActiveProperty: (value: string | null) => void;
  onCreateLabel: (scopeType: 'TEAM' | 'WORKSPACE', name: string) => Promise<void>;
  renderCustomFieldInput: (
    field: CustomFieldDefinition,
    value: unknown,
    onChange: (value: unknown) => void,
    onDone?: () => void
  ) => ReactNode;
  formatCustomFieldValue: (field: CustomFieldDefinition, value: unknown) => string;
}) {
  const storedUser = getStoredUser();
  const notSetLabel = t('common.notSet');
  const selectedProject = projects.find((project) => project.id === draftIssue.projectId) ?? null;
  const selectedAssignee = members.find((member) => member.id === draftIssue.assigneeId) ?? null;
  const currentStatusValue = useMemo(() => {
    const currentOption = ISSUE_STATUS_MENU_OPTIONS.find(
      (option) => option.state === draftIssue.state && option.resolution === draftIssue.resolution
    );
    if (currentOption) return currentOption.value;
    return issueStatusMenuValue({
      state: draftIssue.state,
      resolution: draftIssue.resolution,
    } as Issue);
  }, [draftIssue.resolution, draftIssue.state]);

  return (
    <aside className="space-y-3 xl:sticky xl:top-24 xl:self-start">
      <SidebarCard title={t('issues.detailPage.properties')} bodyClassName="flex flex-col items-start gap-2.5">
        <IssueStatusPill
          testId="issue-detail-sidebar-state-pill"
          label={t(issueStatusMenuLabelKey(currentStatusValue))}
          value={currentStatusValue}
          t={t}
          onChange={(nextValue) => {
            const option = ISSUE_STATUS_MENU_OPTIONS.find((candidate) => candidate.value === nextValue);
            if (!option) return;
            onSetDraftIssue((current) => ({
              ...current,
              state: option.state,
              resolution: option.resolution,
            }));
          }}
        />
        <IssuePriorityPill
          testId="issue-detail-sidebar-priority-pill"
          label={draftIssue.priority == null ? t('views.new.preview.noPriority') : t(issuePriorityLabelKey(draftIssue.priority) ?? 'views.new.preview.noPriority')}
          value={draftIssue.priority}
          t={t}
          onChange={(value) =>
            onSetDraftIssue((current) => ({
              ...current,
              priority: value,
            }))
          }
        />
        <IssueAssigneePill
          testId="issue-detail-sidebar-assignee-pill"
          label={selectedAssignee?.name ?? notSetLabel}
          value={draftIssue.assigneeId}
          members={members}
          currentUser={storedUser?.id && storedUser?.username ? { id: storedUser.id, name: storedUser.username } : null}
          t={t}
          onChange={(value) =>
            onSetDraftIssue((current) => ({
              ...current,
              assigneeId: value,
            }))
          }
        />
      </SidebarCard>

      <SidebarCard title={t('settings.composer.labels')}>
        <LabelsPill
          labels={labels}
          selectedLabelIds={draftIssue.labelIds}
          teamId={issue.teamId}
          t={t}
          onToggle={(labelId) =>
            onSetDraftIssue((current) => ({
              ...current,
              labelIds: current.labelIds.includes(labelId)
                ? current.labelIds.filter((value) => value !== labelId)
                : [...current.labelIds, labelId],
            }))
          }
          onCreateLabel={onCreateLabel}
        />
      </SidebarCard>

      <SidebarCard title={t('issues.detailSidebar.project')} bodyClassName="flex flex-col items-start gap-2.5">
        <SingleValuePill
          testId="issue-detail-sidebar-project-pill"
          label={selectedProject?.name ?? t('issues.detailSidebar.addToProject')}
          value={draftIssue.projectId == null ? EMPTY : String(draftIssue.projectId)}
          emptyLabel={notSetLabel}
          options={projects.map((project) => ({
            value: String(project.id),
            label: project.name,
            icon: <FolderKanban className="h-4 w-4" />,
            iconClassName: 'text-ink-400',
          }))}
          fallbackOption={{
            value: EMPTY,
            label: selectedProject?.name ?? t('issues.detailSidebar.addToProject'),
            icon: <FolderKanban className="h-4 w-4" />,
            iconClassName: 'text-ink-400',
          }}
          onChange={(value) =>
            onSetDraftIssue((current) => ({
              ...current,
              projectId: value === EMPTY ? null : Number(value),
            }))
          }
        />
      </SidebarCard>

      {visibleCustomFields.length ? (
        <SidebarCard title={t('issues.detailSidebar.additionalFields')} bodyClassName="space-y-2">
          {visibleCustomFields.map((field) => {
            const fieldKey = `custom-${field.id}`;
            const isEditing = activeProperty === fieldKey;
            return (
              <InlineEditableRow
                key={field.id}
                label={field.name}
                valueLabel={formatCustomFieldValue(field, draftIssue.customFields[field.key])}
                isEditing={isEditing}
                onActivate={() => onSetActiveProperty(fieldKey)}
                editor={
                  <div className="rounded-xl border border-border-soft/80 bg-white px-3 py-2.5">
                    {renderCustomFieldInput(
                      field,
                      draftIssue.customFields[field.key],
                      (value) =>
                        onSetDraftIssue((current) => ({
                          ...current,
                          customFields: {
                            ...current.customFields,
                            [field.key]: value,
                          },
                        })),
                      () => onSetActiveProperty(null)
                    )}
                  </div>
                }
              />
            );
          })}
        </SidebarCard>
      ) : null}
    </aside>
  );
}

function IssuePriorityPill({
  testId,
  label,
  value,
  t,
  onChange,
}: {
  testId?: string;
  label: string;
  value: Issue['priority'];
  t: (key: string, vars?: Record<string, string | number>) => string;
  onChange: (value: Issue['priority']) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setQuery('');
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          data-testid={testId}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-border-soft bg-white px-4 text-[15px] font-medium text-ink-700 shadow-sm transition hover:bg-slate-50"
        >
          <span className="inline-flex items-center gap-2">
            <span className="inline-flex items-center justify-center text-ink-500">{issuePriorityIcon(value)}</span>
            <span className="truncate">{label}</span>
          </span>
          <ChevronDown className="h-4 w-4 text-ink-300" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[260px] overflow-hidden rounded-[18px] border border-border-subtle bg-white p-0 shadow-elevated">
        <IssuePrioritySelectMenu
          value={value}
          query={query}
          onQueryChange={setQuery}
          placeholder={t('views.new.preview.changePriorityTo')}
          shortcut="P"
          t={t}
          onSelect={(nextValue) => {
            onChange(nextValue);
            setOpen(false);
            setQuery('');
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

function IssueAssigneePill({
  testId,
  label,
  value,
  members,
  currentUser,
  t,
  onChange,
}: {
  testId?: string;
  label: string;
  value: number | null;
  members: Array<{ id: number; name: string }>;
  currentUser?: { id: number; name: string } | null;
  t: (key: string, vars?: Record<string, string | number>) => string;
  onChange: (value: number | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const currentMember = members.find((member) => member.id === value) ?? null;

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setQuery('');
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          data-testid={testId}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-border-soft bg-white px-4 text-[15px] font-medium text-ink-700 shadow-sm transition hover:bg-slate-50"
        >
          <span className="inline-flex items-center gap-2">
            {currentMember ? (
              <AvatarChip text={getIssueInitials(currentMember.name)} className="bg-rose-100 text-rose-600" />
            ) : (
              <span className="inline-flex h-6 w-6 items-center justify-center text-ink-400">
                <UserCircle2 className="h-4 w-4" />
              </span>
            )}
            <span className="truncate">{label}</span>
          </span>
          <ChevronDown className="h-4 w-4 text-ink-300" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[320px] overflow-hidden p-0">
        <IssueAssigneeSelectMenu
          value={value}
          members={members}
          currentUser={currentUser}
          query={query}
          onQueryChange={setQuery}
          placeholder={t('issues.detailSidebar.searchAssignee')}
          shortcut="A"
          t={t}
          onSelect={(nextValue) => {
            onChange(nextValue);
            setOpen(false);
            setQuery('');
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

function SidebarCard({
  title,
  children,
  bodyClassName,
}: {
  title: string;
  children: ReactNode;
  bodyClassName?: string;
}) {
  return (
    <section className="rounded-[18px] border border-border-soft bg-white px-4 py-3.5 shadow-[0_1px_6px_rgba(15,23,42,0.04)]">
      <div className="mb-2.5 flex items-center gap-1.5 text-[15px] font-medium text-ink-700">
        <span>{title}</span>
        <ChevronDown className="h-3.5 w-3.5 text-ink-400" />
      </div>
      <div className={cn('space-y-0.5', bodyClassName)}>{children}</div>
    </section>
  );
}

function IssueStatusPill({
  testId,
  label,
  value,
  t,
  onChange,
}: {
  testId?: string;
  label: string;
  value: ReturnType<typeof issueStatusMenuValue>;
  t: (key: string, vars?: Record<string, string | number>) => string;
  onChange: (value: ReturnType<typeof issueStatusMenuValue>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setQuery('');
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          data-testid={testId}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-border-soft bg-white px-4 text-[15px] font-medium text-ink-700 shadow-sm transition hover:bg-slate-50"
        >
          <span className="inline-flex items-center gap-2">
            <span className="inline-flex items-center justify-center text-ink-500">{issueStatusMenuIcon(value)}</span>
            <span className="truncate">{label}</span>
          </span>
          <ChevronDown className="h-4 w-4 text-ink-300" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[260px] overflow-hidden rounded-[18px] border border-border-subtle bg-white p-0 shadow-elevated">
        <IssueStatusSelectMenu
          value={value}
          query={query}
          onQueryChange={setQuery}
          placeholder={t('views.new.preview.changeStatusTo')}
          shortcut="S"
          t={t}
          onSelect={(nextValue) => {
            onChange(nextValue);
            setOpen(false);
            setQuery('');
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

function SingleValuePill({
  testId,
  label,
  value,
  options,
  onChange,
  emptyLabel,
  fallbackOption,
  searchable = false,
  searchPlaceholder,
  noSearchResultsLabel,
}: {
  testId?: string;
  label: string;
  value: string;
  options: SidebarOption[];
  onChange: (value: string) => void;
  emptyLabel?: string;
  fallbackOption?: SidebarOption;
  searchable?: boolean;
  searchPlaceholder?: string;
  noSearchResultsLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selectedOption = options.find((option) => option.value === value) ?? fallbackOption;
  const normalizedQuery = query.trim().toLowerCase();
  const filteredOptions = searchable && normalizedQuery
    ? options.filter((option) => option.label.toLowerCase().includes(normalizedQuery))
    : options;

  const trigger = (
    <button
      type="button"
      data-testid={testId}
      className="inline-flex h-11 items-center gap-2 rounded-full border border-border-soft bg-white px-4 text-[15px] font-medium text-ink-700 shadow-sm transition hover:bg-slate-50"
    >
      <SingleValueDisplay option={selectedOption} fallbackLabel={label || emptyLabel || ''} />
      <ChevronDown className="h-4 w-4 text-ink-300" />
    </button>
  );

  if (searchable) {
    const handleChange = (nextValue: string) => {
      onChange(nextValue);
      setOpen(false);
      setQuery('');
    };

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent align="start" className="w-[320px] overflow-hidden p-0">
          <div className="border-b border-border-soft px-4 py-3">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-auto border-0 bg-transparent px-0 py-0 text-[16px] shadow-none focus:ring-0"
            />
          </div>
          <div className="max-h-80 overflow-y-auto p-2">
            <div className="space-y-1">
              {emptyLabel ? (
                <SingleValueOption
                  label={emptyLabel}
                  selected={value === EMPTY}
                  onSelect={() => handleChange(EMPTY)}
                />
              ) : null}
              {filteredOptions.map((option) => (
                <SingleValueOption
                  key={option.value}
                  option={option}
                  selected={value === option.value}
                  onSelect={() => handleChange(option.value)}
                />
              ))}
            </div>
            {!filteredOptions.length ? <div className="px-3 py-4 text-sm text-ink-400">{noSearchResultsLabel}</div> : null}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-56 rounded-[18px] p-1.5">
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {emptyLabel ? <DropdownMenuRadioItem value={EMPTY}>{emptyLabel}</DropdownMenuRadioItem> : null}
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              <SingleValueDisplay option={option} fallbackLabel={option.label} />
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LabelsPill({
  labels,
  selectedLabelIds,
  teamId,
  t,
  onToggle,
  onCreateLabel,
}: {
  labels: Label[];
  selectedLabelIds: number[];
  teamId: number | null;
  t: (key: string, vars?: Record<string, string | number>) => string;
  onToggle: (labelId: number) => void;
  onCreateLabel: (scopeType: 'TEAM' | 'WORKSPACE', name: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const selectedLabels = labels.filter((label) => selectedLabelIds.includes(label.id));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-testid="issue-detail-sidebar-labels-pill"
          className="inline-flex min-h-11 flex-wrap items-center gap-2 rounded-full border border-border-soft bg-white px-4 py-2 text-[15px] font-medium text-ink-700 shadow-sm transition hover:bg-slate-50"
        >
          {selectedLabels.length ? (
            <>
              {selectedLabels.map((label) => (
                <span
                  key={label.id}
                  className="inline-flex items-center gap-2 rounded-full border border-border-soft bg-white px-3 py-1 text-[14px] font-medium text-ink-700"
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: label.color || '#ef4444' }} />
                  <span>{label.name}</span>
                </span>
              ))}
              <Plus className="h-4 w-4 text-ink-400" />
            </>
          ) : (
            <>
              <Tag className="h-4 w-4 text-ink-400" />
              <span>{t('settings.composer.labels')}</span>
            </>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[320px] overflow-hidden p-0">
        <IssueLabelsSelectMenu
          labels={labels}
          selectedLabelIds={selectedLabelIds}
          teamId={teamId}
          onToggle={onToggle}
          onCreateLabel={onCreateLabel}
          t={t}
        />
      </PopoverContent>
    </Popover>
  );
}

function SingleValueOption({
  label,
  option,
  selected,
  onSelect,
}: {
  label?: string;
  option?: SidebarOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-ink-700 transition hover:bg-slate-50"
    >
      <span className="flex h-4 w-4 items-center justify-center text-brand-600">
        {selected ? (
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
            <path d="M6.4 11.2 3.6 8.4l-.8.8 3.6 3.6 6.8-6.8-.8-.8z" />
          </svg>
        ) : null}
      </span>
      <SingleValueDisplay option={option} fallbackLabel={label ?? ''} />
    </button>
  );
}

function SingleValueDisplay({ option, fallbackLabel }: { option?: SidebarOption; fallbackLabel: string }) {
  const label = option?.label ?? fallbackLabel;
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      {option?.avatarText ? <AvatarChip text={option.avatarText} className={option.avatarClassName} /> : null}
      {option?.icon ? <span className={cn('inline-flex items-center justify-center', option.iconClassName)}>{option.icon}</span> : null}
      <span className="truncate">{label}</span>
    </span>
  );
}

function AvatarChip({ text, className }: { text: string; className?: string }) {
  return (
    <span className={cn('inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold uppercase', className)}>
      {text}
    </span>
  );
}

function InlineEditableRow({
  label,
  valueLabel,
  isEditing,
  onActivate,
  editor,
}: {
  label: string;
  valueLabel: string;
  isEditing: boolean;
  onActivate: () => void;
  editor: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border-soft/70 bg-surface-soft/30 px-3 py-3">
      <div className="mb-1 text-[11px] uppercase tracking-[0.16em] text-ink-400">{label}</div>
      {isEditing ? (
        editor
      ) : (
        <button
          type="button"
          onClick={onActivate}
          className="flex w-full items-center justify-between gap-3 text-left text-sm text-ink-800 transition hover:text-brand-600"
        >
          <span className="truncate">{valueLabel}</span>
          <ChevronDown className="h-4 w-4 -rotate-90 text-ink-300" />
        </button>
      )}
    </div>
  );
}
