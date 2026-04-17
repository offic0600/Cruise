import type { ViewQueryState, ViewResourceType } from '@/lib/api/types';

const ISSUE_VISIBLE_COLUMNS = ['identifier', 'title', 'priority', 'state', 'assignee', 'project', 'labels', 'updatedAt', 'createdAt'] as const;
const PROJECT_VISIBLE_COLUMNS = ['key', 'name', 'status', 'ownerId', 'teamId', 'updatedAt', 'createdAt'] as const;
const INITIATIVE_VISIBLE_COLUMNS = ['slugId', 'name', 'status', 'health', 'ownerId', 'targetDate', 'updatedAt', 'createdAt'] as const;

export function defaultVisibleColumns(resourceType: ViewResourceType): string[] {
  if (resourceType === 'ISSUE') return [...ISSUE_VISIBLE_COLUMNS];
  if (resourceType === 'PROJECT') return [...PROJECT_VISIBLE_COLUMNS];
  return [...INITIATIVE_VISIBLE_COLUMNS];
}

export function createDefaultViewQueryState(resourceType: ViewResourceType): ViewQueryState {
  return {
    filters: { operator: 'AND', children: [] },
    display: {
      layout: 'LIST',
      visibleColumns: defaultVisibleColumns(resourceType),
      density: 'comfortable',
      showSubIssues: true,
      showEmptyGroups: true,
    },
    grouping: { field: null },
    subGrouping: { field: null },
    sorting: [{ field: 'updatedAt', direction: 'desc', nulls: 'last' }],
  };
}