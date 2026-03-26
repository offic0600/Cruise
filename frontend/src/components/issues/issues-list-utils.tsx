import { Ban, CheckCircle2, ChevronDown, Circle, CircleDashed, CircleEllipsis, Equal, Flame, LoaderCircle, Minus } from 'lucide-react';
import type { Issue } from '@/lib/api/types';

export const ISSUE_GROUP_ORDER = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELED'] as const;
export const ISSUE_PRIORITY_ORDER = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
export const NO_PRIORITY_VALUE = 'NO_PRIORITY' as const;

export type IssueStatusMenuValue =
  | 'BACKLOG'
  | 'TODO'
  | 'IN_PROGRESS'
  | 'IN_REVIEW'
  | 'DONE'
  | 'CANCELED'
  | 'DUPLICATE';

export const ISSUE_STATUS_MENU_OPTIONS: Array<{
  value: IssueStatusMenuValue;
  state: Issue['state'];
  resolution: Issue['resolution'];
}> = [
  { value: 'BACKLOG', state: 'BACKLOG', resolution: null },
  { value: 'TODO', state: 'TODO', resolution: null },
  { value: 'IN_PROGRESS', state: 'IN_PROGRESS', resolution: null },
  { value: 'IN_REVIEW', state: 'IN_REVIEW', resolution: null },
  { value: 'DONE', state: 'DONE', resolution: 'COMPLETED' },
  { value: 'CANCELED', state: 'CANCELED', resolution: 'CANCELED' },
  { value: 'DUPLICATE', state: 'CANCELED', resolution: 'DUPLICATE' },
];

export function issueStateOrder(value: string) {
  const index = ISSUE_GROUP_ORDER.indexOf(value as (typeof ISSUE_GROUP_ORDER)[number]);
  return index === -1 ? ISSUE_GROUP_ORDER.length : index;
}

export function issueStateIcon(state: Issue['state']) {
  if (state === 'BACKLOG') return <CircleDashed className="h-4 w-4 text-slate-400" />;
  if (state === 'TODO') return <Circle className="h-4 w-4 text-slate-500" />;
  if (state === 'IN_PROGRESS') return <LoaderCircle className="h-4 w-4 text-amber-500" />;
  if (state === 'IN_REVIEW') return <CircleEllipsis className="h-4 w-4 text-sky-500" />;
  if (state === 'DONE') return <CheckCircle2 className="h-4 w-4 text-indigo-500" />;
  return <Ban className="h-4 w-4 text-slate-400" />;
}

export function issueStatusMenuIcon(value: IssueStatusMenuValue) {
  if (value === 'BACKLOG') return <CircleDashed className="h-4 w-4 text-slate-400" />;
  if (value === 'TODO') return <Circle className="h-4 w-4 text-slate-400" />;
  if (value === 'IN_PROGRESS') return <LoaderCircle className="h-4 w-4 text-amber-500" />;
  if (value === 'IN_REVIEW') return <CircleEllipsis className="h-4 w-4 text-sky-500" />;
  if (value === 'DONE') return <CheckCircle2 className="h-4 w-4 text-indigo-500" />;
  return <Ban className="h-4 w-4 text-slate-400" />;
}

export function issuePriorityIcon(priority: Issue['priority']) {
  if (priority == null) return <span className="text-[12px] text-ink-300">---</span>;
  if (priority === 'LOW') return <Minus className="h-4 w-4 text-slate-400" />;
  if (priority === 'MEDIUM') return <Equal className="h-4 w-4 text-sky-500" />;
  if (priority === 'HIGH') return <ChevronDown className="h-4 w-4 rotate-180 text-orange-500" />;
  return <Flame className="h-4 w-4 text-rose-500" />;
}

export function issueStatusMenuValue(issue: Issue): IssueStatusMenuValue {
  if (issue.state === 'CANCELED' && issue.resolution === 'DUPLICATE') return 'DUPLICATE';
  return issue.state;
}

export function issueStateLabelKey(state: Issue['state']) {
  return `common.status.${state}` as const;
}

export function issueStatusMenuLabelKey(value: IssueStatusMenuValue) {
  if (value === 'DUPLICATE') return 'common.resolution.DUPLICATE' as const;
  if (value === 'CANCELED') return 'common.status.CANCELED' as const;
  return `common.status.${value}` as const;
}

export function issuePriorityLabelKey(priority: Issue['priority']) {
  return priority == null ? null : (`common.priority.${priority}` as const);
}

export function issueResolutionLabelKey(resolution: NonNullable<Issue['resolution']>) {
  return `common.resolution.${resolution}` as const;
}

export function issueTypeLabelKey(type: Issue['type']) {
  return `issues.types.${type}` as const;
}

export function formatIssueDate(value: string, locale: string) {
  try {
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'zh-CN', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function getIssueInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (!parts.length) return 'NA';
  return parts.map((part) => part[0]).join('').toUpperCase();
}

export function groupIssuesByState(issues: Issue[]) {
  const grouped = new Map<string, Issue[]>();
  for (const state of ISSUE_GROUP_ORDER) grouped.set(state, []);
  for (const issue of issues) {
    const bucket = grouped.get(issue.state) ?? [];
    bucket.push(issue);
    grouped.set(issue.state, bucket);
  }
  return ISSUE_GROUP_ORDER.map((state) => ({
    key: state,
    items: (grouped.get(state) ?? []).slice(),
  }));
}
