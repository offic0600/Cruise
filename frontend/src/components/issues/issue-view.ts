export type IssueView = 'all' | 'active' | 'backlog' | 'done';

const VIEW_VALUES: IssueView[] = ['all', 'active', 'backlog', 'done'];
export const DEFAULT_TEAM_ISSUES_VIEW: IssueView = 'active';

export function normalizeIssueView(value: string | null, fallback: IssueView = 'all'): IssueView {
  return VIEW_VALUES.includes(value as IssueView) ? (value as IssueView) : fallback;
}
