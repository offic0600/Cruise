'use client';

import { type ReactNode, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  Circle,
  CircleDashed,
  CircleEllipsis,
  Equal,
  Flame,
  FolderKanban,
  LoaderCircle,
  Minus,
  Plus,
  Tag,
  XCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { CustomFieldDefinition, Issue, Label, Project } from '@/lib/api';
import { cn } from '@/lib/utils';

const EMPTY = '__empty__';
const ISSUE_STATES: Issue['state'][] = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELED'];
const ISSUE_PRIORITIES: Issue['priority'][] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

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
  locale,
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
  const isZh = locale.startsWith('zh');
  const notSetLabel = translateIssueValue(t, 'common.notSet', isZh ? '未设置' : 'Not set');
  const stateOptions = ISSUE_STATES.map((value) => buildStateOption(value, t));
  const priorityOptions = ISSUE_PRIORITIES.map((value) => buildPriorityOption(value, t));
  const assigneeOptions = members.map((member) => ({
    value: String(member.id),
    label: member.name,
    avatarText: getInitials(member.name),
    avatarClassName: 'bg-rose-100 text-rose-600',
  }));

  const selectedProject = projects.find((project) => project.id === draftIssue.projectId) ?? null;
  const selectedAssignee = members.find((member) => member.id === draftIssue.assigneeId) ?? null;

  return (
    <aside className="space-y-3 xl:sticky xl:top-24 xl:self-start">
      <SidebarCard title="Properties" bodyClassName="flex flex-col items-start gap-2.5">
        <SingleValuePill
          testId="issue-detail-sidebar-state-pill"
          label={stateOptions.find((option) => option.value === draftIssue.state)?.label ?? ''}
          value={draftIssue.state}
          options={stateOptions}
          onChange={(value) =>
            onSetDraftIssue((current) => ({
              ...current,
              state: value as Issue['state'],
              resolution: nextResolutionForState(value as Issue['state'], current.resolution),
            }))
          }
        />
        <SingleValuePill
          testId="issue-detail-sidebar-priority-pill"
          label={priorityOptions.find((option) => option.value === draftIssue.priority)?.label ?? ''}
          value={draftIssue.priority}
          options={priorityOptions}
          onChange={(value) =>
            onSetDraftIssue((current) => ({
              ...current,
              priority: value as Issue['priority'],
            }))
          }
        />
        <SingleValuePill
          testId="issue-detail-sidebar-assignee-pill"
          label={selectedAssignee?.name ?? notSetLabel}
          value={draftIssue.assigneeId == null ? EMPTY : String(draftIssue.assigneeId)}
          options={assigneeOptions}
          emptyLabel={notSetLabel}
          searchable
          searchPlaceholder={isZh ? '搜索负责人' : 'Search assignee'}
          noSearchResultsLabel={isZh ? '没有匹配负责人' : 'No assignee results'}
          onChange={(value) =>
            onSetDraftIssue((current) => ({
              ...current,
              assigneeId: value === EMPTY ? null : Number(value),
            }))
          }
        />
      </SidebarCard>

      <SidebarCard title="Labels">
        <LabelsPill
          labels={labels}
          selectedLabelIds={draftIssue.labelIds}
          teamId={issue.teamId}
          isZh={isZh}
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

      <SidebarCard title="Project" bodyClassName="flex flex-col items-start gap-2.5">
        <SingleValuePill
          testId="issue-detail-sidebar-project-pill"
          label={selectedProject?.name ?? (isZh ? 'Add to project' : 'Add to project')}
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
            label: selectedProject?.name ?? 'Add to project',
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
        <SidebarCard title={isZh ? '更多字段' : 'Additional fields'} bodyClassName="space-y-2">
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
  isZh,
  t,
  onToggle,
  onCreateLabel,
}: {
  labels: Label[];
  selectedLabelIds: number[];
  teamId: number | null;
  isZh: boolean;
  t: (key: string, vars?: Record<string, string | number>) => string;
  onToggle: (labelId: number) => void;
  onCreateLabel: (scopeType: 'TEAM' | 'WORKSPACE', name: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState<'TEAM' | 'WORKSPACE' | null>(null);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredLabels = normalizedQuery
    ? labels.filter((label) => label.name.toLowerCase().includes(normalizedQuery))
    : labels;
  const selectedLabels = labels.filter((label) => selectedLabelIds.includes(label.id));
  const canCreate = Boolean(normalizedQuery) && !labels.some((label) => label.name.toLowerCase() === normalizedQuery);

  const handleCreate = async (scopeType: 'TEAM' | 'WORKSPACE') => {
    const name = query.trim();
    if (!name) return;
    setCreating(scopeType);
    try {
      await onCreateLabel(scopeType, name);
      setQuery('');
    } finally {
      setCreating(null);
    }
  };

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
              <span>{isZh ? '标签' : 'Labels'}</span>
            </>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[320px] overflow-hidden p-0">
        <div className="border-b border-border-soft px-4 py-3">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('settings.composer.searchLabels')}
            className="h-auto border-0 bg-transparent px-0 py-0 text-[16px] shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="max-h-80 overflow-y-auto py-2">
          {canCreate ? (
            <div className="space-y-1 px-2 pb-3">
              {teamId ? (
                <button
                  type="button"
                  onClick={() => void handleCreate('TEAM')}
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[15px] text-ink-800 transition hover:bg-slate-50"
                  disabled={creating != null}
                >
                  <span className="text-xl leading-none text-ink-500">+</span>
                  <span>{t('settings.composer.createTeamLabel', { value: query.trim() })}</span>
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => void handleCreate('WORKSPACE')}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[15px] text-ink-800 transition hover:bg-slate-50"
                disabled={creating != null}
              >
                <span className="text-xl leading-none text-ink-500">+</span>
                <span>{t('settings.composer.createWorkspaceLabel', { value: query.trim() })}</span>
              </button>
            </div>
          ) : null}

          <div className="space-y-1 px-2">
            {filteredLabels.map((label) => {
              const selected = selectedLabelIds.includes(label.id);
              return (
                <button
                  key={label.id}
                  type="button"
                  onClick={() => onToggle(label.id)}
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[15px] text-ink-800 transition hover:bg-slate-50"
                >
                  <span className="inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: label.color || '#ef4444' }} />
                  <span className="flex-1 truncate">{label.name}</span>
                  {selected ? (
                    <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current text-ink-500" aria-hidden="true">
                      <path d="M6.4 11.2 3.6 8.4l-.8.8 3.6 3.6 6.8-6.8-.8-.8z" />
                    </svg>
                  ) : null}
                </button>
              );
            })}
          </div>

          {!filteredLabels.length && !canCreate ? (
            <div className="px-3 py-4 text-sm text-ink-400">{t('common.empty')}</div>
          ) : null}
        </div>
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

function buildStateOption(value: Issue['state'], t: (key: string) => string): SidebarOption {
  const label = translateIssueValue(t, `common.status.${value}`, value);
  if (value === 'BACKLOG') return { value, label, icon: <CircleDashed className="h-4 w-4" />, iconClassName: 'text-slate-400' };
  if (value === 'TODO') return { value, label, icon: <Circle className="h-4 w-4" />, iconClassName: 'text-slate-400' };
  if (value === 'IN_PROGRESS') return { value, label, icon: <LoaderCircle className="h-4 w-4" />, iconClassName: 'text-sky-500' };
  if (value === 'IN_REVIEW') return { value, label, icon: <CircleEllipsis className="h-4 w-4" />, iconClassName: 'text-amber-500' };
  if (value === 'DONE') return { value, label, icon: <CheckCircle2 className="h-4 w-4" />, iconClassName: 'text-emerald-500' };
  return { value, label, icon: <XCircle className="h-4 w-4" />, iconClassName: 'text-rose-500' };
}

function buildPriorityOption(value: Issue['priority'], t: (key: string) => string): SidebarOption {
  const label = translateIssueValue(t, `common.priority.${value}`, value);
  if (value === 'LOW') return { value, label, icon: <Minus className="h-4 w-4" />, iconClassName: 'text-slate-400' };
  if (value === 'MEDIUM') return { value, label, icon: <Equal className="h-4 w-4" />, iconClassName: 'text-sky-500' };
  if (value === 'HIGH') return { value, label, icon: <ChevronDown className="h-4 w-4 rotate-180" />, iconClassName: 'text-orange-500' };
  return { value, label, icon: <Flame className="h-4 w-4" />, iconClassName: 'text-rose-500' };
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (!parts.length) return 'NA';
  return parts.map((part) => part[0]).join('').toUpperCase();
}

function nextResolutionForState(state: Issue['state'], resolution: Issue['resolution']) {
  if (state === 'DONE') return 'COMPLETED';
  if (state === 'CANCELED') return resolution && resolution !== 'COMPLETED' ? resolution : 'CANCELED';
  return null;
}

function translateIssueValue(t: (key: string) => string, key: string, fallback: string) {
  const value = t(key);
  return value === key ? fallback : value;
}
