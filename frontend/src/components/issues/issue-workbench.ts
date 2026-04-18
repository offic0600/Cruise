import type { Issue, Project } from '@/lib/api';
import type { IssueView } from './issue-view';
export { normalizeIssueView } from './issue-view';

export type IssueWorkbenchMember = {
  id: number;
  name: string;
};

export type ActiveWorkbenchRow = {
  id: number;
  identifier: string;
  title: string;
  typeLabel: string;
  projectName: string | null;
  assigneeLabel: string;
  priorityLabel: string;
  updatedLabel: string;
  updatedTimestamp: number;
  state: Issue['state'];
};

export type ActiveWorkbenchSort = 'updatedAt' | 'manual';

export type FilterDraft = {
  q: string;
  type: string;
  state: string;
  priority: string;
  assigneeId: string;
  projectId: string;
  teamId: string;
  labelIds: string[];
  customFieldFilters: Record<string, string>;
};

export type FilterSummaryLabelOption = {
  id: string;
  name: string;
};

export type FilterSummaryContext = {
  assignees?: FilterSummaryLabelOption[];
  projects?: FilterSummaryLabelOption[];
  teams?: FilterSummaryLabelOption[];
  labels?: FilterSummaryLabelOption[];
};

const STATE_CATEGORY_MAP = {
  BACKLOG: 'BACKLOG',
  TODO: 'ACTIVE',
  IN_PROGRESS: 'ACTIVE',
  IN_REVIEW: 'REVIEW',
  DONE: 'COMPLETED',
  CANCELED: 'CANCELED',
} as const;

const STATE_LABEL_MAP = {
  BACKLOG: ['Backlog', '待规划'],
  TODO: ['Todo', '待开始'],
  IN_PROGRESS: ['In progress', '进行中'],
  IN_REVIEW: ['In review', '待评审'],
  DONE: ['Done', '已完成'],
  CANCELED: ['Canceled', '已取消'],
} as const;

const PRIORITY_LABEL_MAP = {
  LOW: ['Low', '低'],
  MEDIUM: ['Medium', '中'],
  HIGH: ['High', '高'],
  URGENT: ['Urgent', '紧急'],
} as const;

const TYPE_LABEL_MAP = {
  FEATURE: ['Feature', '需求'],
  TASK: ['Task', '任务'],
  BUG: ['Bug', '缺陷'],
  TECH_DEBT: ['Tech debt', '技术债'],
} as const;

const RESOLUTION_LABEL_MAP = {
  COMPLETED: ['Completed', '已完成'],
  CANCELED: ['Canceled', '已取消'],
  DUPLICATE: ['Duplicate', '重复'],
  OBSOLETE: ['Obsolete', '已过时'],
  WONT_DO: ["Won't do", '不处理'],
} as const;

export function groupBelongsToView(state: string, view: IssueView) {
  if (view === 'all') return true;
  const category = stateCategoryFor(state);
  if (view === 'backlog') return category === 'BACKLOG';
  if (view === 'done') return category === 'COMPLETED';
  return category === 'ACTIVE' || category === 'REVIEW';
}

export function stateCategoryFor(state: string) {
  return STATE_CATEGORY_MAP[state as keyof typeof STATE_CATEGORY_MAP] ?? 'ACTIVE';
}

export function labelForState(state: string, isZh: boolean) {
  const pair = STATE_LABEL_MAP[state as keyof typeof STATE_LABEL_MAP] ?? [state, state];
  return isZh ? pair[1] : pair[0];
}

export function labelForPriority(priority: string, isZh: boolean) {
  const pair = PRIORITY_LABEL_MAP[priority as keyof typeof PRIORITY_LABEL_MAP] ?? [priority, priority];
  return isZh ? pair[1] : pair[0];
}

export function labelForResolution(resolution: string, isZh: boolean) {
  const pair = RESOLUTION_LABEL_MAP[resolution as keyof typeof RESOLUTION_LABEL_MAP] ?? [resolution, resolution];
  return isZh ? pair[1] : pair[0];
}

export function labelForType(type: string, isZh: boolean) {
  const pair = TYPE_LABEL_MAP[type as keyof typeof TYPE_LABEL_MAP] ?? [type, type];
  return isZh ? pair[1] : pair[0];
}

export function formatIssueDate(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'zh-CN', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function sortActiveWorkbenchRows(rows: ActiveWorkbenchRow[], sort: ActiveWorkbenchSort): ActiveWorkbenchRow[] {
  if (sort === 'manual') {
    return rows;
  }

  return [...rows].sort((a, b) => b.updatedTimestamp - a.updatedTimestamp || b.id - a.id);
}

function findLabelById(options: FilterSummaryLabelOption[] | undefined, id: string) {
  if (!id) return null;
  return options?.find((option) => option.id === id)?.name ?? null;
}

function summarizeLabels(ids: string[], options: FilterSummaryLabelOption[] | undefined, fallbackPrefix: string) {
  if (!ids.length) return null;
  const resolved = ids.map((id) => findLabelById(options, id) ?? `${fallbackPrefix}${id}`);
  return resolved.join(', ');
}

export function activeFilterSummary(filters: FilterDraft, isZh: boolean, context: FilterSummaryContext = {}) {
  const tokens: string[] = [];

  if (filters.q) tokens.push(`${isZh ? '搜索' : 'Search'}: ${filters.q}`);
  if (filters.type) tokens.push(`${isZh ? '类型' : 'Type'}: ${filters.type}`);
  if (filters.state) tokens.push(`${isZh ? '状态' : 'State'}: ${filters.state}`);
  if (filters.priority) tokens.push(`${isZh ? '优先级' : 'Priority'}: ${filters.priority}`);
  if (filters.assigneeId) {
    tokens.push(`${isZh ? '负责人' : 'Assignee'}: ${findLabelById(context.assignees, filters.assigneeId) ?? `#${filters.assigneeId}`}`);
  }
  if (filters.projectId) {
    tokens.push(`${isZh ? '项目' : 'Project'}: ${findLabelById(context.projects, filters.projectId) ?? `#${filters.projectId}`}`);
  }
  if (filters.teamId) {
    tokens.push(`${isZh ? '团队' : 'Team'}: ${findLabelById(context.teams, filters.teamId) ?? `#${filters.teamId}`}`);
  }
  if (filters.labelIds.length) {
    const labelSummary = summarizeLabels(filters.labelIds, context.labels, '#');
    if (labelSummary) tokens.push(`${isZh ? '标签' : 'Labels'}: ${labelSummary}`);
  }
  Object.entries(filters.customFieldFilters).forEach(([key, value]) => {
    if (value) tokens.push(`${isZh ? '字段' : 'Field'} ${key}: ${value}`);
  });

  return tokens;
}

export function summarizeFilterTokens(tokens: string[], isZh: boolean) {
  if (tokens.length === 0) {
    return {
      count: 0,
      buttonLabel: isZh ? '过滤器' : 'Filter',
      summaryLabel: isZh ? '当前未应用过滤条件。' : 'No active filters applied.',
    };
  }

  if (tokens.length === 1) {
    return {
      count: 1,
      buttonLabel: isZh ? '过滤器 · 1' : 'Filter · 1',
      summaryLabel: tokens[0],
    };
  }

  const [first, ...rest] = tokens;
  const restCount = rest.length;
  return {
    count: tokens.length,
    buttonLabel: isZh ? `过滤器 · ${tokens.length}` : `Filter · ${tokens.length}`,
    summaryLabel: isZh ? `${first} 等 ${restCount} 项` : `${first} + ${restCount} more`,
  };
}

export function filterButtonLabel(filters: FilterDraft, isZh: boolean, context: FilterSummaryContext = {}) {
  return summarizeFilterTokens(activeFilterSummary(filters, isZh, context), isZh).buttonLabel;
}

export function filterSummaryLabel(filters: FilterDraft, isZh: boolean, context: FilterSummaryContext = {}) {
  return summarizeFilterTokens(activeFilterSummary(filters, isZh, context), isZh).summaryLabel;
}

export function buildActiveWorkbenchRows(
  issues: Issue[],
  members: IssueWorkbenchMember[],
  projects: Project[],
  locale: string,
  sort: ActiveWorkbenchSort = 'updatedAt'
): ActiveWorkbenchRow[] {
  const isZh = locale.startsWith('zh');

  const rows = issues.map((issue) => {
    const assignee = members.find((member) => member.id === issue.assigneeId);
    const project = projects.find((item) => item.id === issue.projectId);
    const resolutionLabel =
      issue.state === 'CANCELED' && issue.resolution && issue.resolution !== 'CANCELED'
        ? `${labelForState(issue.state, isZh)} · ${labelForResolution(issue.resolution, isZh)}`
        : null;
    const updatedTimestamp = Date.parse(issue.updatedAt);

    return {
      id: issue.id,
      identifier: issue.identifier,
      title: issue.title,
      typeLabel: resolutionLabel ?? labelForType(issue.type, isZh),
      projectName: project?.name ?? null,
      assigneeLabel: assignee?.name ?? (isZh ? '未设置' : 'Not set'),
      priorityLabel: issue.priority ? labelForPriority(issue.priority, isZh) : (isZh ? '未设置' : 'Not set'),
      updatedLabel: formatIssueDate(issue.updatedAt, locale),
      updatedTimestamp: Number.isFinite(updatedTimestamp) ? updatedTimestamp : Number.MIN_SAFE_INTEGER,
      state: issue.state,
    } satisfies ActiveWorkbenchRow;
  });

  return sortActiveWorkbenchRows(rows, sort);
}
