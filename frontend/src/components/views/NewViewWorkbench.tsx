'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowDownWideNarrow,
  Bot,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  CircleDashed,
  CircleEllipsis,
  Equal,
  FileText,
  Flame,
  FolderKanban,
  LayoutGrid,
  Layers3,
  Link2,
  List,
  LoaderCircle,
  Minus,
  Plus,
  SlidersHorizontal,
  Sparkles,
  Tag,
  UserCircle2,
  UserPen,
  Users,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import SharedIssuesList from '@/components/issues/SharedIssuesList';
import { NO_PRIORITY_VALUE } from '@/components/issues/issues-list-utils';
import { useToast } from '@/components/providers/ToastProvider';
import { useCurrentWorkspace } from '@/components/providers/WorkspaceProvider';
import { getLabels, getProjects, getTeamMembers, updateIssue } from '@/lib/api';
import type {
  FilterCondition,
  FilterGroup,
  Issue,
  Label,
  Project,
  ViewQueryState,
  ViewResourceType,
  ViewScopeType,
  ViewVisibility,
} from '@/lib/api/types';
import { workspaceNewViewPath, workspaceProjectViewPath, workspaceViewPath, workspaceViewsPath } from '@/lib/routes';
import { queryKeys } from '@/lib/query/keys';
import { useCreateView, useViewPreviewResults } from '@/lib/query/views';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useI18n } from '@/i18n/useI18n';

type SaveTarget = 'PERSONAL' | 'WORKSPACE' | 'TEAM';
type ConditionDraft = {
  field: string;
  operator: string;
  value: string;
};
type TeamMemberOption = {
  id: number | string;
  name: string;
};
type FilterOptionItem = {
  key: string;
  label: string;
  onSelect: () => void;
  icon?: React.ReactNode;
  count?: number;
};
type FilterSubmenuKey =
  | 'status'
  | 'assignee'
  | 'agent'
  | 'creator'
  | 'priority'
  | 'labels'
  | 'relations'
  | 'suggested-label'
  | 'dates'
  | 'project'
  | 'project-properties'
  | 'subscribers'
  | 'content'
  | 'links'
  | 'template';
type FilterMenuEntry =
  | {
      type: 'action';
      id: string;
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      keywords: string[];
    }
  | {
      type: 'separator';
      id: string;
    }
  | {
      type: 'submenu';
      id: FilterSubmenuKey;
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      keywords: string[];
    };

const ISSUE_STATUS_OPTIONS: Array<Issue['state']> = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELED'];
const PRIORITY_OPTIONS: Array<Exclude<Issue['priority'], null>> = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const ISSUE_GROUPING_FIELDS = ['state', 'priority', 'assigneeId', 'projectId'] as const;
const ISSUE_ORDER_FIELDS = ['updatedAt', 'createdAt', 'priority', 'state', 'title'] as const;
const ISSUE_DISPLAY_PROPERTY_OPTIONS = [
  'identifier',
  'state',
  'assignee',
  'priority',
  'project',
  'plannedEndDate',
  'labels',
  'createdAt',
  'updatedAt',
] as const;
const ISSUE_DISABLED_DISPLAY_PROPERTY_OPTIONS = ['milestone', 'links', 'timeInStatus'] as const;
const FILTER_MENU_ENTRIES: FilterMenuEntry[] = [
  { type: 'action', id: 'ai-filter', label: 'views.new.filters.entries.aiFilter', icon: Sparkles, keywords: ['ai', 'filter'] },
  { type: 'separator', id: 'sep-ai' },
  { type: 'action', id: 'advanced-filter', label: 'views.new.filters.entries.advancedFilter', icon: SlidersHorizontal, keywords: ['advanced', 'filter'] },
  { type: 'separator', id: 'sep-core' },
  { type: 'submenu', id: 'status', label: 'views.new.filters.entries.status', icon: Circle, keywords: ['status', 'state', 'todo', 'done'] },
  { type: 'submenu', id: 'assignee', label: 'views.new.filters.entries.assignee', icon: UserCircle2, keywords: ['assignee', 'owner'] },
  { type: 'submenu', id: 'agent', label: 'views.new.filters.entries.agent', icon: Bot, keywords: ['agent'] },
  { type: 'submenu', id: 'creator', label: 'views.new.filters.entries.creator', icon: UserPen, keywords: ['creator', 'reporter'] },
  { type: 'submenu', id: 'priority', label: 'views.new.filters.entries.priority', icon: SlidersHorizontal, keywords: ['priority', 'urgent', 'high', 'low'] },
  { type: 'submenu', id: 'labels', label: 'views.new.filters.entries.labels', icon: Tag, keywords: ['labels', 'tag'] },
  { type: 'submenu', id: 'relations', label: 'views.new.filters.entries.relations', icon: ChevronRight, keywords: ['relations', 'related'] },
  { type: 'submenu', id: 'suggested-label', label: 'views.new.filters.entries.suggestedLabel', icon: Tag, keywords: ['suggested', 'label'] },
  { type: 'submenu', id: 'dates', label: 'views.new.filters.entries.dates', icon: CalendarDays, keywords: ['dates', 'created', 'updated'] },
  { type: 'separator', id: 'sep-project' },
  { type: 'submenu', id: 'project', label: 'views.new.filters.entries.project', icon: FolderKanban, keywords: ['project'] },
  { type: 'submenu', id: 'project-properties', label: 'views.new.filters.entries.projectProperties', icon: FolderKanban, keywords: ['project', 'properties'] },
  { type: 'separator', id: 'sep-rest' },
  { type: 'submenu', id: 'subscribers', label: 'views.new.filters.entries.subscribers', icon: Users, keywords: ['subscribers', 'followers'] },
  { type: 'action', id: 'auto-closed', label: 'views.new.filters.entries.autoClosed', icon: Circle, keywords: ['auto', 'closed'] },
  { type: 'submenu', id: 'content', label: 'views.new.filters.entries.content', icon: FileText, keywords: ['content', 'description'] },
  { type: 'submenu', id: 'links', label: 'views.new.filters.entries.links', icon: Link2, keywords: ['links'] },
  { type: 'submenu', id: 'template', label: 'views.new.filters.entries.template', icon: FileText, keywords: ['template'] },
];

function defaultQueryState(resourceType: ViewResourceType): ViewQueryState {
  return {
    filters: { operator: 'AND', children: [] },
    display: {
      layout: 'LIST',
      visibleColumns: resourceType === 'ISSUE'
        ? [...ISSUE_DISPLAY_PROPERTY_OPTIONS]
        : ['key', 'name', 'status', 'ownerId', 'teamId', 'updatedAt'],
      density: 'comfortable',
      showSubIssues: true,
      showEmptyGroups: true,
    },
    grouping: { field: resourceType === 'ISSUE' ? 'state' : 'status' },
    sorting: [{ field: 'updatedAt', direction: 'desc', nulls: 'last' }],
  };
}

function displayPropertyLabelKey(value: string) {
  const map: Record<string, string> = {
    identifier: 'views.display.properties.identifier',
    state: 'views.display.properties.state',
    assignee: 'views.display.properties.assignee',
    priority: 'views.display.properties.priority',
    project: 'views.display.properties.project',
    plannedEndDate: 'views.display.properties.plannedEndDate',
    labels: 'views.display.properties.labels',
    createdAt: 'views.display.properties.createdAt',
    updatedAt: 'views.display.properties.updatedAt',
    milestone: 'views.display.properties.milestone',
    links: 'views.display.properties.links',
    timeInStatus: 'views.display.properties.timeInStatus',
  };
  return map[value] ?? value;
}

function groupingLabelKey(value: string | null) {
  if (value == null) return 'views.display.noGrouping';
  const map: Record<string, string> = {
    state: 'views.display.groupingOptions.state',
    priority: 'views.display.groupingOptions.priority',
    assigneeId: 'views.display.groupingOptions.assignee',
    projectId: 'views.display.groupingOptions.project',
  };
  return map[value] ?? value;
}

function orderingLabelKey(value: string) {
  const map: Record<string, string> = {
    updatedAt: 'views.display.orderingOptions.updatedAt',
    createdAt: 'views.display.orderingOptions.createdAt',
    priority: 'views.display.orderingOptions.priority',
    state: 'views.display.orderingOptions.state',
    title: 'views.display.orderingOptions.title',
  };
  return map[value] ?? value;
}

function inflateConditions(operator: 'AND' | 'OR', conditions: ConditionDraft[]): FilterGroup {
  const normalized = conditions
    .filter((condition) => condition.field.trim())
    .map((condition): FilterCondition => ({
      field: condition.field,
      operator: condition.operator as FilterCondition['operator'],
      value: condition.value.trim() === '' ? undefined : condition.value.trim(),
    }));
  const byField = new Map<string, FilterCondition[]>();
  for (const condition of normalized) {
    if (!byField.has(condition.field)) byField.set(condition.field, []);
    byField.get(condition.field)!.push(condition);
  }
  return {
    operator,
    children: Array.from(byField.values()).map((fieldConditions) =>
      fieldConditions.length === 1
        ? fieldConditions[0]
        : {
            operator: 'OR',
            children: fieldConditions,
          }
    ),
  };
}

function formatFieldLabel(field: string) {
  const map: Record<string, string> = {
    state: 'views.new.filters.fields.status',
    status: 'views.new.filters.fields.status',
    priority: 'views.new.filters.fields.priority',
    assigneeId: 'views.new.filters.fields.assignee',
    creatorId: 'views.new.filters.fields.creator',
    labelIds: 'views.new.filters.fields.labels',
    projectId: 'views.new.filters.fields.project',
  };
  return map[field] ?? field;
}

function issueStateIcon(state: Issue['state']) {
  if (state === 'BACKLOG') return <CircleDashed className="h-4 w-4 text-slate-400" />;
  if (state === 'TODO') return <Circle className="h-4 w-4 text-slate-400" />;
  if (state === 'IN_PROGRESS') return <LoaderCircle className="h-4 w-4 text-sky-500" />;
  if (state === 'IN_REVIEW') return <CircleEllipsis className="h-4 w-4 text-amber-500" />;
  if (state === 'DONE') return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  return <XCircle className="h-4 w-4 text-rose-500" />;
}

function issuePriorityIcon(priority: Issue['priority']) {
  if (priority == null) return <span className="text-[12px] text-ink-300">---</span>;
  if (priority === 'LOW') return <Minus className="h-4 w-4 text-slate-400" />;
  if (priority === 'MEDIUM') return <Equal className="h-4 w-4 text-sky-500" />;
  if (priority === 'HIGH') return <ChevronDown className="h-4 w-4 rotate-180 text-orange-500" />;
  return <Flame className="h-4 w-4 text-rose-500" />;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (!parts.length) return 'NA';
  return parts.map((part) => part[0]).join('').toUpperCase();
}

function submenuConditionField(key: FilterSubmenuKey) {
  switch (key) {
    case 'status':
      return 'state';
    case 'assignee':
      return 'assigneeId';
    case 'creator':
      return 'creatorId';
    case 'priority':
      return 'priority';
    case 'labels':
      return 'labelIds';
    case 'project':
      return 'projectId';
    default:
      return null;
  }
}

function DisplaySelectRow({
  label,
  valueLabel,
  disabled,
  children,
}: {
  label: string;
  valueLabel: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className={disabled ? 'text-[15px] text-ink-400' : 'text-[15px] text-ink-700'}>
        {label}
      </div>
      <div className="shrink-0" aria-label={valueLabel}>
        {children}
      </div>
    </div>
  );
}

function DisplayToggleRow({
  label,
  checked,
  disabled,
  onToggle,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={disabled ? 'text-[15px] text-ink-400' : 'text-[15px] text-ink-700'}>{label}</span>
      <button
        type="button"
        disabled={disabled}
        onClick={onToggle}
        className={[
          'relative inline-flex h-6 w-10 shrink-0 rounded-full transition',
          disabled
            ? 'cursor-not-allowed bg-slate-100'
            : checked
              ? 'bg-indigo-500'
              : 'bg-slate-200',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition',
            checked ? 'left-[18px]' : 'left-0.5',
          ].join(' ')}
        />
      </button>
    </div>
  );
}

export default function NewViewWorkbench({
  resourceType,
}: {
  resourceType: ViewResourceType;
}) {
  const router = useRouter();
  const { locale, t } = useI18n();
  const { pushToast } = useToast();
  const queryClient = useQueryClient();
  const {
    organizationId,
    currentOrganizationSlug,
    currentTeamId,
    currentTeamKey,
    isLoading: workspaceLoading,
  } = useCurrentWorkspace();
  const createViewMutation = useCreateView();
  const [saveTarget, setSaveTarget] = useState<SaveTarget>('PERSONAL');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [queryState, setQueryState] = useState<ViewQueryState>(() => defaultQueryState(resourceType));
  const [conditions, setConditions] = useState<ConditionDraft[]>([]);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [filterSearch, setFilterSearch] = useState('');
  const [submenuSearch, setSubmenuSearch] = useState('');
  const [activeSubmenu, setActiveSubmenu] = useState<FilterSubmenuKey | null>(null);

  const updateIssueMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof updateIssue>[1] }) =>
      updateIssue(id, {
        organizationId: organizationId ?? undefined,
        ...data,
      }),
    onSuccess: async (updated) => {
      queryClient.setQueryData(queryKeys.issueDetail(updated.id), updated);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['issues'] }),
        queryClient.invalidateQueries({ queryKey: ['views', 'preview-results'] }),
      ]);
    },
  });

  const effectiveScopeType: ViewScopeType = saveTarget === 'TEAM' ? 'TEAM' : 'WORKSPACE';
  const effectiveScopeId = saveTarget === 'TEAM' ? (currentTeamId ?? null) : null;
  const effectiveVisibility: ViewVisibility =
    saveTarget === 'PERSONAL' ? 'PERSONAL' : saveTarget === 'WORKSPACE' ? 'WORKSPACE' : 'TEAM';

  const membersQuery = useQuery({
    queryKey: ['view-filter-members', organizationId ?? 'unknown', currentTeamId ?? 'all'],
    queryFn: () => getTeamMembers({ organizationId: organizationId ?? undefined, teamId: currentTeamId ?? undefined }),
    enabled: Boolean(organizationId),
  });
  const labelsQuery = useQuery({
    queryKey: ['view-filter-labels', organizationId ?? 'unknown', currentTeamId ?? 'all'],
    queryFn: () => getLabels({ organizationId: organizationId ?? undefined, teamId: currentTeamId ?? undefined }),
    enabled: Boolean(organizationId) && resourceType === 'ISSUE',
  });
  const projectsQuery = useQuery({
    queryKey: ['view-filter-projects', organizationId ?? 'unknown', currentTeamId ?? 'all'],
    queryFn: () => getProjects({ organizationId: organizationId ?? undefined, teamId: currentTeamId ?? undefined }),
    enabled: Boolean(organizationId),
  });

  const memberOptions = useMemo<TeamMemberOption[]>(
    () => (Array.isArray(membersQuery.data) ? membersQuery.data : [])
      .map((member: Record<string, unknown>) => ({
        id: Number(member.id ?? member.userId ?? member.memberId ?? 0),
        name: String(member.name ?? member.displayName ?? member.email ?? 'Unknown'),
      }))
      .filter((member) => member.id || member.name !== 'Unknown'),
    [membersQuery.data]
  );
  const labelOptions = useMemo<Label[]>(
    () => labelsQuery.data ? [...labelsQuery.data.workspaceLabels, ...labelsQuery.data.teamLabels] : [],
    [labelsQuery.data]
  );
  const projectOptions = useMemo<Project[]>(
    () => (projectsQuery.data?.items ?? []) as Project[],
    [projectsQuery.data]
  );

  const previewQueryState = useMemo<ViewQueryState>(() => ({
    ...queryState,
    filters: inflateConditions('AND', conditions),
    grouping: {
      ...queryState.grouping,
      field: queryState.grouping.field ?? null,
    },
  }), [conditions, queryState, resourceType]);

  const previewQuery = useViewPreviewResults<Issue | Project>({
    organizationId,
    resourceType,
    scopeType: effectiveScopeType,
    scopeId: effectiveScopeId,
    queryState: previewQueryState,
    page: 0,
    size: 100,
  });

  const groupedPreview = useMemo(() => {
    if (resourceType === 'ISSUE') return [];
    const items = previewQuery.data?.items ?? [];
    const field = previewQueryState.grouping.field || 'status';
    const groups = new Map<string, Array<Issue | Project>>();
    for (const item of items) {
      const key = String((item as Project)[field as keyof Project] ?? 'Unknown');
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(item);
    }
    return Array.from(groups.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, values]) => ({ key, items: values }));
  }, [previewQuery.data?.items, previewQueryState.grouping.field, resourceType]);
  const previewStateCounts = useMemo(() => {
    const counts = new Map<Issue['state'], number>();
    for (const state of ISSUE_STATUS_OPTIONS) counts.set(state, 0);
    for (const item of previewQuery.data?.items ?? []) {
      if (resourceType !== 'ISSUE') continue;
      const state = (item as Issue).state;
      counts.set(state, (counts.get(state) ?? 0) + 1);
    }
    return counts;
  }, [previewQuery.data?.items, resourceType]);
  const previewPriorityCounts = useMemo(() => {
    const counts = new Map<string, number>();
    counts.set(NO_PRIORITY_VALUE, 0);
    for (const priority of PRIORITY_OPTIONS) counts.set(priority, 0);
    for (const item of previewQuery.data?.items ?? []) {
      if (resourceType !== 'ISSUE') continue;
      const priority = (item as Issue).priority;
      const key = priority ?? NO_PRIORITY_VALUE;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }, [previewQuery.data?.items, resourceType]);
  const previewAssigneeCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of previewQuery.data?.items ?? []) {
      if (resourceType !== 'ISSUE') continue;
      const assigneeId = (item as Issue).assigneeId;
      if (assigneeId == null) continue;
      const key = String(assigneeId);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }, [previewQuery.data?.items, resourceType]);
  const previewLabelCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of previewQuery.data?.items ?? []) {
      if (resourceType !== 'ISSUE') continue;
      for (const label of (item as Issue).labels ?? []) {
        const key = String(label.id);
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
    return counts;
  }, [previewQuery.data?.items, resourceType]);
  const previewProjectCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of previewQuery.data?.items ?? []) {
      const projectId = resourceType === 'ISSUE' ? (item as Issue).projectId : (item as Project).id;
      if (projectId == null) continue;
      const key = String(projectId);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }, [previewQuery.data?.items, resourceType]);
  const memberNameById = useMemo(
    () => new Map(memberOptions.map((member) => [String(member.id), member.name])),
    [memberOptions]
  );
  const previewIssues = useMemo(
    () => (resourceType === 'ISSUE' ? ((previewQuery.data?.items ?? []) as Issue[]) : []),
    [previewQuery.data?.items, resourceType]
  );
  const previewGroupDefinitions = useMemo(
    () => (resourceType === 'ISSUE' ? (previewQuery.data?.groups ?? []).map((group) => ({ key: group.key, label: group.label, count: group.count })) : []),
    [previewQuery.data?.groups, resourceType]
  );

  const saveTargetOptions = [
    { value: 'PERSONAL' as const, label: t('views.visibility.personal') },
    { value: 'WORKSPACE' as const, label: t('views.visibility.workspace') },
    ...(currentTeamId ? [{ value: 'TEAM' as const, label: `${t('views.visibility.team')} (${currentTeamKey ?? 'Team'})` }] : []),
  ];
  const defaultName = t(resourceType === 'ISSUE' ? 'views.new.placeholder.issueName' : 'views.new.placeholder.projectName');
  const filteredMenuEntries = useMemo(() => {
    if (!filterSearch.trim()) return FILTER_MENU_ENTRIES;
    const keyword = filterSearch.trim().toLowerCase();
    return FILTER_MENU_ENTRIES.filter((entry) => {
      if (entry.type === 'separator') return false;
      return [t(entry.label), ...entry.keywords].some((token) => token.toLowerCase().includes(keyword));
    });
  }, [filterSearch, t]);
  const conditionSummary = useMemo(
    () =>
      conditions.map((condition) => {
        const valueLabel = (() => {
          if (condition.field === 'state' || condition.field === 'status') return t(`common.status.${condition.value}`);
          if (condition.field === 'priority') {
            return condition.value === NO_PRIORITY_VALUE
              ? t('views.new.preview.noPriority')
              : t(`common.priority.${condition.value}`);
          }
          if (condition.field === 'assigneeId' || condition.field === 'creatorId') {
            return memberOptions.find((member) => String(member.id) === condition.value)?.name ?? condition.value;
          }
          if (condition.field === 'labelIds') {
            return labelOptions.find((label) => String(label.id) === condition.value)?.name ?? condition.value;
          }
          if (condition.field === 'projectId') {
            return projectOptions.find((project) => String(project.id) === condition.value)?.name ?? condition.value;
          }
          return condition.value;
        })();
        return {
          key: `${condition.field}:${condition.value}`,
          label: `${t(formatFieldLabel(condition.field))} · ${valueLabel}`,
          field: condition.field,
          value: condition.value,
        };
      }),
    [conditions, labelOptions, memberOptions, projectOptions, t]
  );

  function closeFilterMenu() {
    setFilterMenuOpen(false);
    setFilterSearch('');
    setSubmenuSearch('');
    setActiveSubmenu(null);
  }

  function updateQueryState(updater: (draft: ViewQueryState) => void) {
    setQueryState((current) => {
      const next = JSON.parse(JSON.stringify(current)) as ViewQueryState;
      updater(next);
      return next;
    });
  }

  function setGroupingField(value: string) {
    updateQueryState((draft) => {
      draft.grouping.field = value === '__none__' ? null : value;
    });
  }

  function setOrderingField(value: string) {
    updateQueryState((draft) => {
      draft.sorting = [{
        field: value,
        direction: 'desc',
        nulls: 'last',
      }];
    });
  }

  function toggleDisplayProperty(value: string) {
    updateQueryState((draft) => {
      const next = new Set(draft.display.visibleColumns);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      draft.display.visibleColumns = Array.from(next);
    });
  }

  function upsertCondition(field: string, operator: string, value: string) {
    setConditions((current) => {
      const next = current.filter((condition) => condition.field !== field);
      next.push({ field, operator, value });
      return next;
    });
    closeFilterMenu();
  }

  function removeConditionValue(field: string, value: string) {
    setConditions((current) => current.filter((condition) => !(condition.field === field && condition.value === value)));
  }

  function showPlaceholderToast(label: string) {
    pushToast({
      title: label,
      description: t('views.new.filters.comingSoon'),
      dismissLabel: t('issueCreatedToast.dismiss'),
    });
    closeFilterMenu();
  }

  function submenuOptions(key: FilterSubmenuKey): FilterOptionItem[] {
    switch (key) {
      case 'status':
        return ISSUE_STATUS_OPTIONS.map((value) => ({
          key: value,
          label: t(`common.status.${value}`),
          onSelect: () => toggleCondition(resourceType === 'ISSUE' ? 'state' : 'status', 'is', value),
          icon: issueStateIcon(value),
          count: previewStateCounts.get(value) ?? 0,
        }));
      case 'assignee':
        return memberOptions.map((member) => ({
          key: String(member.id),
          label: member.name,
          onSelect: () => toggleCondition('assigneeId', 'is', String(member.id)),
          icon: (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-ink-700">
              {getInitials(member.name)}
            </span>
          ),
          count: previewAssigneeCounts.get(String(member.id)) ?? 0,
        }));
      case 'creator':
        return memberOptions.map((member) => ({
          key: String(member.id),
          label: member.name,
          onSelect: () => toggleCondition('creatorId', 'is', String(member.id)),
        }));
      case 'priority':
        return [
          {
            key: NO_PRIORITY_VALUE,
            label: t('views.new.preview.noPriority'),
            onSelect: () => toggleCondition('priority', 'is', NO_PRIORITY_VALUE),
            icon: issuePriorityIcon(null),
            count: previewPriorityCounts.get(NO_PRIORITY_VALUE) ?? 0,
          },
          ...PRIORITY_OPTIONS.map((value) => ({
            key: value,
            label: t(`common.priority.${value}`),
            onSelect: () => toggleCondition('priority', 'is', value),
            icon: issuePriorityIcon(value),
            count: previewPriorityCounts.get(value) ?? 0,
          })),
        ];
      case 'labels':
        return labelOptions.map((label) => ({
          key: String(label.id),
          label: label.name,
          onSelect: () => toggleCondition('labelIds', 'contains', String(label.id)),
          icon: <span className="inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: label.color || '#94a3b8' }} />,
          count: previewLabelCounts.get(String(label.id)) ?? 0,
        }));
      case 'project':
        return projectOptions.map((project) => ({
          key: String(project.id),
          label: project.name,
          onSelect: () => toggleCondition('projectId', 'is', String(project.id)),
          icon: <FolderKanban className="h-4 w-4 text-ink-500" />,
          count: previewProjectCounts.get(String(project.id)) ?? 0,
        }));
      default:
        return [{
          key: `${key}-soon`,
          label: t('views.new.filters.entries.comingSoon'),
          onSelect: () => {
            const entry = FILTER_MENU_ENTRIES.find(
              (item): item is Exclude<FilterMenuEntry, { type: 'separator' }> => item.type !== 'separator' && item.id === key
            );
            showPlaceholderToast(entry ? t(entry.label) : t('views.filters.title'));
          },
        }];
    }
  }

  async function handleSave() {
    if (!organizationId || !currentOrganizationSlug) return;
    const created = await createViewMutation.mutateAsync({
      organizationId,
      resourceType,
      scopeType: effectiveScopeType,
      scopeId: effectiveScopeId,
      name: name.trim() || defaultName,
      description: description || null,
      visibility: effectiveVisibility,
      queryState: previewQueryState,
      layout: previewQueryState.display.layout,
    });
        router.push(
          created.resourceType === 'PROJECT'
            ? workspaceProjectViewPath(currentOrganizationSlug, created)
            : workspaceViewPath(currentOrganizationSlug, created)
        );
  }

  const activeSubmenuOptions = activeSubmenu ? submenuOptions(activeSubmenu) : [];
  const visibleSubmenuOptions = !submenuSearch.trim()
    ? activeSubmenuOptions
    : activeSubmenuOptions.filter((option) => option.label.toLowerCase().includes(submenuSearch.trim().toLowerCase()));
  const activeSubmenuField = activeSubmenu ? submenuConditionField(activeSubmenu) : null;
  const previewPending = workspaceLoading || organizationId == null || previewQuery.isPending;

  function hasCondition(field: string, value: string) {
    return conditions.some((condition) => condition.field === field && condition.value === value);
  }

  function toggleCondition(field: string, operator: string, value: string) {
    setConditions((current) => {
      const exists = current.some((condition) => condition.field === field && condition.value === value);
      if (exists) {
        return current.filter((condition) => !(condition.field === field && condition.value === value));
      }
      return [...current, { field, operator, value }];
    });
  }

  async function updatePreviewIssue(id: number, data: Parameters<typeof updateIssue>[1]) {
    try {
      await updateIssueMutation.mutateAsync({ id, data });
    } catch {
      pushToast({
        title: t('views.new.preview.updateFailed'),
        description: t('views.new.preview.updateFailed'),
      });
    }
  }

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-[1180px] space-y-6 pb-10">
        <div className="flex items-center gap-2 text-sm text-ink-500">
          <button
            type="button"
            onClick={() => currentOrganizationSlug && router.push(workspaceViewsPath(currentOrganizationSlug, resourceType === 'ISSUE' ? 'issues' : 'projects'))}
            className="transition hover:text-ink-900"
          >
            {t('views.title')}
          </button>
          <ChevronRight className="h-4 w-4" />
          <span className="text-ink-700">{name.trim() || defaultName}</span>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-border-subtle bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <div className="flex items-start justify-between gap-6 px-5 py-5">
            <div className="flex min-w-0 flex-1 items-start gap-4">
              <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-ink-400">
                <Layers3 className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={defaultName}
                  className="h-[52px] min-h-[52px] border-0 bg-transparent px-0 py-1 text-[38px] font-semibold leading-[1.15] tracking-[-0.04em] text-ink-900 shadow-none placeholder:font-medium placeholder:text-ink-300 focus-visible:ring-0"
                />
                <Textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder={t('views.new.placeholder.description')}
                  className="min-h-[28px] resize-none border-0 px-0 py-0 text-[15px] leading-6 text-ink-600 shadow-none placeholder:text-ink-400 focus-visible:ring-0"
                />
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3 whitespace-nowrap pt-2">
              <div className="flex shrink-0 items-center gap-2 whitespace-nowrap text-sm text-ink-700">
                <span className="shrink-0">{t('views.actions.saveTo')}</span>
                <Select value={saveTarget} onValueChange={(value) => setSaveTarget(value as SaveTarget)}>
                  <SelectTrigger className="h-10 min-w-[112px] rounded-full border-border-soft px-3 shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {saveTargetOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="ghost"
                onClick={() => currentOrganizationSlug && router.push(workspaceViewsPath(currentOrganizationSlug, resourceType === 'ISSUE' ? 'issues' : 'projects'))}
              >
                {t('common.cancel')}
              </Button>
              <Button onClick={handleSave} disabled={!organizationId || createViewMutation.isPending}>
                {t('common.save')}
              </Button>
            </div>
          </div>

          <div className="border-t border-border-soft px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Tabs
                  value={resourceType}
                  onValueChange={(value) => currentOrganizationSlug && router.push(workspaceNewViewPath(currentOrganizationSlug, value === 'PROJECT' ? 'projects' : 'issues'))}
                >
                  <TabsList className="rounded-full border border-border-soft bg-white p-0.5 shadow-none">
                    <TabsTrigger value="ISSUE" className="rounded-full px-4 data-[state=active]:bg-slate-50">
                      {t('views.resources.issues')}
                    </TabsTrigger>
                    <TabsTrigger value="PROJECT" className="rounded-full px-4 data-[state=active]:bg-slate-50">
                      {t('views.resources.projects')}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <Popover
                  open={filterMenuOpen}
                  onOpenChange={(open) => {
                    setFilterMenuOpen(open);
                    if (!open) {
                      setFilterSearch('');
                      setSubmenuSearch('');
                      setActiveSubmenu(null);
                    }
                  }}
                >
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full border border-border-soft bg-white">
                      <SlidersHorizontal className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" sideOffset={10} className="relative w-[238px] overflow-visible rounded-[18px] border border-border-subtle bg-white p-0 shadow-elevated">
                    <div className="border-b border-border-soft px-3 py-2.5">
                      <div className="flex items-center gap-3 rounded-xl bg-white px-2.5 py-2 ring-1 ring-border-soft">
                        <input
                          value={filterSearch}
                          onChange={(event) => setFilterSearch(event.target.value)}
                          placeholder={t('views.new.filters.searchPlaceholder')}
                          spellCheck={false}
                          className="min-w-0 flex-1 bg-transparent text-sm text-ink-800 outline-none placeholder:text-ink-400"
                        />
                        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-border-soft px-1.5 text-[11px] font-medium text-ink-500">
                          F
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="max-h-[420px] overflow-y-auto px-1 py-1.5">
                        {filteredMenuEntries.map((entry) => {
                          if (entry.type === 'separator') {
                            return <div key={entry.id} className="my-1 h-px bg-border-soft" />;
                          }
                          const Icon = entry.icon;
                          const isActive = entry.type === 'submenu' && activeSubmenu === entry.id;
                          return (
                            <button
                              key={entry.id}
                              type="button"
                              onMouseEnter={() => entry.type === 'submenu' && setActiveSubmenu(entry.id)}
                              onClick={() => {
                                if (entry.type === 'submenu') {
                                  setSubmenuSearch('');
                                  setActiveSubmenu(entry.id);
                                  return;
                                }
                                showPlaceholderToast(t(entry.label));
                              }}
                              className={[
                                'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-ink-700 transition hover:bg-slate-100',
                                isActive ? 'bg-slate-100' : '',
                              ].join(' ')}
                            >
                              <Icon className="h-4 w-4 shrink-0 text-ink-500" />
                              <span className="truncate">{t(entry.label)}</span>
                              {entry.type === 'submenu' ? <ChevronRight className="ml-auto h-4 w-4 text-ink-400" /> : null}
                            </button>
                          );
                        })}
                      </div>

                      {activeSubmenu ? (
                        <div className="absolute left-[calc(100%+10px)] top-0 z-10 w-[238px] overflow-hidden rounded-[18px] border border-border-subtle bg-white shadow-elevated">
                          <div className="border-b border-border-soft px-3 py-2.5">
                            <div className="flex items-center gap-2 rounded-xl bg-white px-2.5 py-2 ring-1 ring-border-soft">
                              <button
                                type="button"
                                onClick={() => {
                                  setSubmenuSearch('');
                                  setActiveSubmenu(null);
                                }}
                                className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-ink-400 transition hover:bg-slate-100 hover:text-ink-700"
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </button>
                              <input
                                value={submenuSearch}
                                onChange={(event) => setSubmenuSearch(event.target.value)}
                                placeholder={t('views.new.filters.filterPlaceholder')}
                                spellCheck={false}
                                className="min-w-0 flex-1 bg-transparent text-sm text-ink-800 outline-none placeholder:text-ink-400"
                              />
                            </div>
                          </div>
                          <div className="max-h-[420px] overflow-y-auto px-1 py-1.5">
                            {visibleSubmenuOptions.map((option) => (
                              <button
                                key={option.key}
                                type="button"
                                onClick={option.onSelect}
                                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-ink-700 transition hover:bg-slate-100"
                              >
                                {activeSubmenuField ? (
                                  <span
                                    className={[
                                      'inline-flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-[5px] border transition',
                                      hasCondition(activeSubmenuField, option.key)
                                        ? 'border-ink-700 bg-ink-700 text-white'
                                        : 'border-border-soft bg-white text-transparent group-hover:text-ink-300',
                                    ].join(' ')}
                                  >
                                    <Check className="h-3 w-3" />
                                  </span>
                                ) : null}
                                {option.icon ? <span className="shrink-0">{option.icon}</span> : null}
                                <span className="truncate">{option.label}</span>
                                {typeof option.count === 'number' ? (
                                  <span className="ml-auto shrink-0 text-sm text-ink-400">
                                    {t('views.new.filters.issueCount', { count: option.count })}
                                  </span>
                                ) : null}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full border border-border-soft bg-white">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" sideOffset={10} className="w-[354px] overflow-hidden rounded-[22px] border border-border-subtle bg-white p-0 shadow-elevated">
                  <div className="max-h-[72vh] overflow-y-auto px-5 py-5">
                    <div className="flex items-center gap-2 rounded-full border border-border-soft bg-slate-50 p-1">
                      <button
                        type="button"
                        className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-white text-[15px] font-medium text-ink-900 shadow-sm"
                      >
                        <List className="h-4 w-4" />
                        <span>{t('views.display.list')}</span>
                      </button>
                      <button
                        type="button"
                        disabled
                        className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full text-[15px] font-medium text-ink-400"
                      >
                        <LayoutGrid className="h-4 w-4" />
                        <span>{t('views.display.board')}</span>
                      </button>
                    </div>

                    <div className="mt-6 space-y-4">
                      <DisplaySelectRow
                        label={t('views.display.grouping')}
                        valueLabel={t(groupingLabelKey(queryState.grouping.field))}
                      >
                        <Select value={queryState.grouping.field ?? '__none__'} onValueChange={setGroupingField}>
                          <SelectTrigger className="h-10 min-w-[150px] rounded-full border-border-soft bg-white shadow-none">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">{t('views.display.noGrouping')}</SelectItem>
                            {ISSUE_GROUPING_FIELDS.map((field) => (
                              <SelectItem key={field} value={field}>{t(groupingLabelKey(field))}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </DisplaySelectRow>

                      <DisplaySelectRow
                        label={t('views.display.subGrouping')}
                        valueLabel={t('views.display.noGrouping')}
                        disabled
                      >
                        <button
                          type="button"
                          disabled
                          className="inline-flex h-10 min-w-[150px] items-center justify-between rounded-full border border-border-soft px-4 text-[15px] text-ink-400"
                        >
                          <span>{t('views.display.noGrouping')}</span>
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </DisplaySelectRow>

                      <DisplaySelectRow
                        label={t('views.display.ordering')}
                        valueLabel={t(orderingLabelKey(queryState.sorting[0]?.field ?? 'updatedAt'))}
                      >
                        <Select value={queryState.sorting[0]?.field ?? 'updatedAt'} onValueChange={setOrderingField}>
                          <SelectTrigger className="h-10 min-w-[150px] rounded-full border-border-soft bg-white shadow-none">
                            <div className="flex items-center gap-2">
                              <ArrowDownWideNarrow className="h-4 w-4 text-ink-500" />
                              <SelectValue />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {ISSUE_ORDER_FIELDS.map((field) => (
                              <SelectItem key={field} value={field}>{t(orderingLabelKey(field))}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </DisplaySelectRow>

                      <DisplayToggleRow
                        label={t('views.display.orderCompletedByRecency')}
                        checked={false}
                        disabled
                        onToggle={() => undefined}
                      />
                    </div>

                    <div className="mt-6 space-y-4 border-t border-border-soft pt-5">
                      <DisplaySelectRow
                        label={t('views.display.completedIssues')}
                        valueLabel={t('views.display.completedIssuesAll')}
                        disabled
                      >
                        <button
                          type="button"
                          disabled
                          className="inline-flex h-10 min-w-[104px] items-center justify-between rounded-full border border-border-soft px-4 text-[15px] text-ink-400"
                        >
                          <span>{t('views.display.completedIssuesAll')}</span>
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </DisplaySelectRow>

                      <DisplayToggleRow
                        label={t('views.display.showSubIssues')}
                        checked={queryState.display.showSubIssues ?? true}
                        onToggle={() => updateQueryState((draft) => { draft.display.showSubIssues = !(draft.display.showSubIssues ?? true); })}
                      />
                    </div>

                    <div className="mt-6 space-y-4 border-t border-border-soft pt-5">
                      <div className="text-[15px] font-medium text-ink-900">{t('views.display.listOptions')}</div>
                      <DisplayToggleRow
                        label={t('views.display.nestedSubIssues')}
                        checked={false}
                        disabled
                        onToggle={() => undefined}
                      />
                      <DisplayToggleRow
                        label={t('views.display.showEmptyGroups')}
                        checked={queryState.display.showEmptyGroups ?? true}
                        onToggle={() => updateQueryState((draft) => { draft.display.showEmptyGroups = !(draft.display.showEmptyGroups ?? true); })}
                      />
                      <div className="space-y-3">
                        <div className="text-[15px] text-ink-700">{t('views.display.displayProperties')}</div>
                        <div className="flex flex-wrap gap-2">
                          {ISSUE_DISPLAY_PROPERTY_OPTIONS.map((column) => {
                            const checked = queryState.display.visibleColumns.includes(column);
                            return (
                              <button
                                key={column}
                                type="button"
                                onClick={() => toggleDisplayProperty(column)}
                                className={[
                                  'inline-flex h-9 items-center rounded-full border px-3 text-[14px] transition',
                                  checked
                                    ? 'border-ink-900 bg-ink-900 text-white'
                                    : 'border-border-soft bg-white text-ink-700 hover:bg-slate-50',
                                ].join(' ')}
                              >
                                {t(displayPropertyLabelKey(column))}
                              </button>
                            );
                          })}
                          {ISSUE_DISABLED_DISPLAY_PROPERTY_OPTIONS.map((column) => (
                            <button
                              key={column}
                              type="button"
                              disabled
                              className="inline-flex h-9 items-center rounded-full border border-border-soft bg-slate-50 px-3 text-[14px] text-ink-400"
                            >
                              {t(displayPropertyLabelKey(column))}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {conditionSummary.length ? (
          <div className="flex flex-wrap items-center gap-2">
            {conditionSummary.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => removeConditionValue(item.field, item.value)}
                className="inline-flex items-center gap-2 rounded-full border border-border-soft bg-white px-3 py-1.5 text-sm text-ink-700 transition hover:bg-slate-50"
              >
                <span>{item.label}</span>
                <span className="text-ink-400">×</span>
              </button>
            ))}
          </div>
        ) : null}

        <div className="space-y-4">
          {previewPending ? (
            <div className="py-10 text-sm text-ink-500">{t('common.loading')}</div>
          ) : resourceType === 'ISSUE' ? (
            <SharedIssuesList
              issues={previewIssues}
              variant="preview"
              locale={locale}
              emptyLabel={t('views.new.filters.noResults.issue')}
              groupingField={(previewQueryState.grouping.field as 'state' | 'priority' | 'assigneeId' | 'projectId' | null) ?? null}
              groupDefinitions={previewGroupDefinitions}
              displayConfig={previewQueryState.display}
              onOpenIssue={() => {}}
              members={memberOptions}
              projects={projectOptions}
              rowActions={{
                onChangePriority: (issue, priority) => updatePreviewIssue(issue.id, { priority }),
                onChangeStatus: (issue, next) => updatePreviewIssue(issue.id, next),
                onChangeAssignee: (issue, assigneeId) => updatePreviewIssue(issue.id, { assigneeId }),
              }}
            />
          ) : groupedPreview.length ? (
            groupedPreview.map((group) => (
              <section key={group.key} className="space-y-2">
                <div className="flex items-center justify-between rounded-[16px] bg-slate-50 px-5 py-3">
                  <div className="flex items-center gap-3">
                    <FolderKanban className="h-4 w-4 text-ink-400" />
                    <div className="text-[15px] font-medium text-ink-800">
                      {group.key}
                      <span className="ml-2 text-ink-400">{group.items.length}</span>
                    </div>
                  </div>
                  <Plus className="h-4 w-4 text-ink-400" />
                </div>

                <div className="space-y-1">
                  {group.items.map((item) => (
                    (
                      <div key={(item as Project).id} className="grid grid-cols-[120px_minmax(0,1fr)_160px] items-center gap-4 px-5 py-3">
                        <div className="flex items-center gap-2 text-[15px] text-ink-500">
                          <FolderKanban className="h-4 w-4" />
                          <span>{(item as Project).key ?? '#'}</span>
                        </div>
                        <div className="truncate text-[15px] text-ink-900">{(item as Project).name}</div>
                        <div className="justify-self-end text-sm text-ink-400">
                          {new Date((item as Project).updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className="py-10 text-sm text-ink-500">
              {t('views.new.filters.noResults.project')}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
