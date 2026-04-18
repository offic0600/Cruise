export type IssueView = 'all' | 'active' | 'backlog' | 'done';

const VIEW_VALUES: IssueView[] = ['all', 'active', 'backlog', 'done'];

export function normalizeIssueView(value: string | null): IssueView {
  return VIEW_VALUES.includes(value as IssueView) ? (value as IssueView) : 'all';
}
