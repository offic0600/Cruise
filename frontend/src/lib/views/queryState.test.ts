import { describe, expect, it } from 'vitest';
import { createDefaultViewQueryState } from '@/lib/views/queryState';

describe('createDefaultViewQueryState', () => {
  it('keeps ISSUE and PROJECT schema keys aligned while preserving resource-specific default columns', () => {
    const issueState = createDefaultViewQueryState('ISSUE');
    const projectState = createDefaultViewQueryState('PROJECT');

    expect(Object.keys(issueState)).toEqual(Object.keys(projectState));
    expect(Object.keys(issueState.display)).toEqual(Object.keys(projectState.display));
    expect(issueState.grouping).toEqual({ field: null });
    expect(projectState.subGrouping).toEqual({ field: null });
    expect(issueState.display.visibleColumns).toEqual([
      'identifier',
      'title',
      'priority',
      'state',
      'assignee',
      'project',
      'labels',
      'updatedAt',
      'createdAt',
    ]);
    expect(projectState.display.visibleColumns).toEqual([
      'key',
      'name',
      'status',
      'ownerId',
      'teamId',
      'updatedAt',
      'createdAt',
    ]);
  });
});