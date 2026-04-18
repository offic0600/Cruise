import { describe, expect, it } from 'vitest';
import { filterSummaryLabel, summarizeFilterTokens, type FilterDraft } from './issue-workbench';
import { noteText, searchStatusText, sortSummaryLabel } from './ActiveIssuesWorkbenchPage';
import { normalizeIssueView } from './issue-view';

describe('normalizeIssueView', () => {
  it('保留支持的 issue 视图值', () => {
    expect(normalizeIssueView('active')).toBe('active');
    expect(normalizeIssueView('backlog')).toBe('backlog');
    expect(normalizeIssueView('done')).toBe('done');
    expect(normalizeIssueView('all')).toBe('all');
  });

  it('对未知或空值回退到 all', () => {
    expect(normalizeIssueView('completed')).toBe('all');
    expect(normalizeIssueView('random')).toBe('all');
    expect(normalizeIssueView(null)).toBe('all');
  });
});

describe('summarizeFilterTokens', () => {
  const emptyFilters: FilterDraft = {
    q: '',
    type: '',
    state: '',
    priority: '',
    assigneeId: '',
    projectId: '',
    teamId: '',
    labelIds: [],
    customFieldFilters: {},
  };

  it('searchStatusText 在无搜索词时强调 q 参数，并在有搜索词时回显当前查询', () => {
    expect(searchStatusText('', emptyFilters, false)).toBe(
      'Backed by the URL q param for future advanced filters. No active filters applied.'
    );
    expect(searchStatusText('login', emptyFilters, false)).toBe(
      'Current query: login. No active filters applied.'
    );
    expect(searchStatusText('登录', emptyFilters, true)).toBe(
      '当前查询：登录；当前未应用过滤条件。'
    );
  });

  it('noteText 在有无筛选条件时输出对应 workbench 说明', () => {
    expect(noteText(emptyFilters, false)).toBe(
      'The team-active toolbar now writes into the real q query param, keeping the workbench aligned with the legacy issues URL state.'
    );
    expect(
      noteText(
        {
          ...emptyFilters,
          q: 'login',
          state: 'IN_PROGRESS',
        },
        false
      )
    ).toBe(
      'Active filters: Search: login · State: IN_PROGRESS. Next, move display/grouping and more Linear toolbar details.'
    );
  });

  it('sortSummaryLabel 输出当前排序摘要', () => {
    expect(sortSummaryLabel('updatedAt', false)).toBe('Current sort: Last updated');
    expect(sortSummaryLabel('manual', true)).toBe('当前排序：手动排序');
  });

  it('对多个筛选条件返回首项 + 余量摘要', () => {
    expect(summarizeFilterTokens(['Search: login', 'State: In progress', 'Labels: Bug'], false)).toEqual({
      count: 3,
      buttonLabel: 'Filter · 3',
      summaryLabel: 'Search: login + 2 more',
      shortLabel: 'Search: login + 2 more',
    });
  });

  it('对中文多条件摘要返回首项 + 余量文案', () => {
    expect(summarizeFilterTokens(['搜索: 登录', '状态: 进行中'], true)).toEqual({
      count: 2,
      buttonLabel: '过滤器 · 2',
      summaryLabel: '搜索: 登录 等 1 项',
      shortLabel: '搜索: 登录 等 1 项',
    });
  });

  it('为无条件状态补短摘要文案', () => {
    expect(summarizeFilterTokens([], false)).toEqual({
      count: 0,
      buttonLabel: 'Filter',
      summaryLabel: 'No active filters applied.',
      shortLabel: 'No filters applied',
    });
  });

  it('filterSummaryLabel 在无条件时返回默认文案', () => {
    expect(filterSummaryLabel(emptyFilters, false)).toBe('No active filters applied.');
  });
});
