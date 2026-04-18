import { describe, expect, it } from 'vitest';
import {
  activeFilterSummary,
  buildActiveWorkbenchRows,
  filterButtonLabel,
  filterSummaryLabel,
  formatIssueDate,
  groupBelongsToView,
  normalizeIssueView,
  sortActiveWorkbenchRows,
  stateCategoryFor,
  type FilterDraft,
} from './issue-workbench';
import type { Issue } from '@/lib/api';
import { teamIssuesPath } from '@/lib/routes';

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

describe('issue-workbench helpers', () => {
  it('按 active/backlog/done 视图归类 state', () => {
    expect(stateCategoryFor('BACKLOG')).toBe('BACKLOG');
    expect(stateCategoryFor('IN_PROGRESS')).toBe('ACTIVE');
    expect(stateCategoryFor('IN_REVIEW')).toBe('REVIEW');
    expect(stateCategoryFor('DONE')).toBe('COMPLETED');
    expect(groupBelongsToView('BACKLOG', 'backlog')).toBe(true);
    expect(groupBelongsToView('TODO', 'backlog')).toBe(false);
    expect(groupBelongsToView('DONE', 'done')).toBe(true);
    expect(groupBelongsToView('CANCELED', 'done')).toBe(false);
    expect(groupBelongsToView('IN_PROGRESS', 'active')).toBe(true);
    expect(groupBelongsToView('IN_REVIEW', 'active')).toBe(true);
    expect(groupBelongsToView('CANCELED', 'active')).toBe(false);
  });

  it('all 视图保留所有状态组', () => {
    expect(groupBelongsToView('BACKLOG', 'all')).toBe(true);
    expect(groupBelongsToView('TODO', 'all')).toBe(true);
    expect(groupBelongsToView('IN_PROGRESS', 'all')).toBe(true);
    expect(groupBelongsToView('IN_REVIEW', 'all')).toBe(true);
    expect(groupBelongsToView('DONE', 'all')).toBe(true);
    expect(groupBelongsToView('CANCELED', 'all')).toBe(true);
  });

  it('把 issue / member / project 映射成 active workbench row，并默认按最近更新排序', () => {
    const issues = [
      {
        id: 2,
        organizationId: 1,
        identifier: 'CRS-2',
        type: 'BUG',
        title: 'Second',
        description: null,
        contentJson: null,
        contentRevision: null,
        contentFormat: null,
        state: 'IN_PROGRESS',
        stateCategory: 'ACTIVE',
        resolution: null,
        priority: 'HIGH',
        projectId: 10,
        teamId: 5,
        parentIssueId: null,
        assigneeId: 8,
        reporterId: null,
        estimatePoints: null,
        progress: 0,
        plannedStartDate: null,
        plannedEndDate: null,
        estimatedHours: 0,
        actualHours: 0,
        severity: null,
        sourceType: 'MANUAL',
        sourceId: null,
        labels: [],
        customFields: {},
        createdAt: '2026-04-18T08:00:00.000Z',
        updatedAt: '2026-04-18T11:00:00.000Z',
        archivedAt: null,
      },
      {
        id: 1,
        organizationId: 1,
        identifier: 'CRS-1',
        type: 'TASK',
        title: 'First',
        description: null,
        contentJson: null,
        contentRevision: null,
        contentFormat: null,
        state: 'BACKLOG',
        stateCategory: 'BACKLOG',
        resolution: null,
        priority: 'LOW',
        projectId: null,
        teamId: 5,
        parentIssueId: null,
        assigneeId: null,
        reporterId: null,
        estimatePoints: null,
        progress: 0,
        plannedStartDate: null,
        plannedEndDate: null,
        estimatedHours: 0,
        actualHours: 0,
        severity: null,
        sourceType: 'MANUAL',
        sourceId: null,
        labels: [],
        customFields: {},
        createdAt: '2026-04-18T08:00:00.000Z',
        updatedAt: '2026-04-18T09:00:00.000Z',
        archivedAt: null,
      },
    ] satisfies Issue[];

    const rows = buildActiveWorkbenchRows(issues, [{ id: 8, name: 'Luna' }], [{ id: 10, name: 'Workbench' } as never], 'zh');

    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      id: 2,
      identifier: 'CRS-2',
      assigneeLabel: 'Luna',
      projectName: 'Workbench',
      priorityLabel: '高',
      typeLabel: '缺陷',
    });
    expect(rows[0].updatedTimestamp).toBe(Date.parse('2026-04-18T11:00:00.000Z'));
    expect(rows[1]).toMatchObject({
      id: 1,
      identifier: 'CRS-1',
      assigneeLabel: '未设置',
      projectName: null,
      priorityLabel: '低',
      typeLabel: '任务',
    });
  });

  it('sort=manual 时保留原始 issue 顺序，sort=updatedAt 时输出稳定时间排序', () => {
    const baseRows = buildActiveWorkbenchRows(
      [
        {
          id: 10,
          organizationId: 1,
          identifier: 'CRS-10',
          type: 'TASK',
          title: 'Third in input',
          description: null,
          contentJson: null,
          contentRevision: null,
          contentFormat: null,
          state: 'TODO',
          stateCategory: 'ACTIVE',
          resolution: null,
          priority: 'MEDIUM',
          projectId: null,
          teamId: 5,
          parentIssueId: null,
          assigneeId: null,
          reporterId: null,
          estimatePoints: null,
          progress: 0,
          plannedStartDate: null,
          plannedEndDate: null,
          estimatedHours: 0,
          actualHours: 0,
          severity: null,
          sourceType: 'MANUAL',
          sourceId: null,
          labels: [],
          customFields: {},
          createdAt: '2026-04-18T08:00:00.000Z',
          updatedAt: '2026-04-18T10:00:00.000Z',
          archivedAt: null,
        },
        {
          id: 11,
          organizationId: 1,
          identifier: 'CRS-11',
          type: 'TASK',
          title: 'First in input',
          description: null,
          contentJson: null,
          contentRevision: null,
          contentFormat: null,
          state: 'TODO',
          stateCategory: 'ACTIVE',
          resolution: null,
          priority: 'MEDIUM',
          projectId: null,
          teamId: 5,
          parentIssueId: null,
          assigneeId: null,
          reporterId: null,
          estimatePoints: null,
          progress: 0,
          plannedStartDate: null,
          plannedEndDate: null,
          estimatedHours: 0,
          actualHours: 0,
          severity: null,
          sourceType: 'MANUAL',
          sourceId: null,
          labels: [],
          customFields: {},
          createdAt: '2026-04-18T08:00:00.000Z',
          updatedAt: '2026-04-18T12:00:00.000Z',
          archivedAt: null,
        },
        {
          id: 12,
          organizationId: 1,
          identifier: 'CRS-12',
          type: 'TASK',
          title: 'Second in input with same timestamp tie-break',
          description: null,
          contentJson: null,
          contentRevision: null,
          contentFormat: null,
          state: 'TODO',
          stateCategory: 'ACTIVE',
          resolution: null,
          priority: 'MEDIUM',
          projectId: null,
          teamId: 5,
          parentIssueId: null,
          assigneeId: null,
          reporterId: null,
          estimatePoints: null,
          progress: 0,
          plannedStartDate: null,
          plannedEndDate: null,
          estimatedHours: 0,
          actualHours: 0,
          severity: null,
          sourceType: 'MANUAL',
          sourceId: null,
          labels: [],
          customFields: {},
          createdAt: '2026-04-18T08:00:00.000Z',
          updatedAt: '2026-04-18T12:00:00.000Z',
          archivedAt: null,
        },
      ],
      [],
      [],
      'en',
      'manual'
    );

    expect(baseRows.map((row) => row.identifier)).toEqual(['CRS-10', 'CRS-11', 'CRS-12']);

    const sortedRows = sortActiveWorkbenchRows(baseRows, 'updatedAt');
    expect(sortedRows.map((row) => row.identifier)).toEqual(['CRS-12', 'CRS-11', 'CRS-10']);
  });

  it('格式化 issue 日期，异常值时原样返回', () => {
    expect(formatIssueDate('2026-04-18T11:00:00.000Z', 'en')).toMatch(/Apr/);
    expect(formatIssueDate('bad-date', 'zh')).toBe('bad-date');
  });

  it('搜索 / 筛选空态文案随查询上下文变化', async () => {
    const { noResultsText, collapsedSummaryLabel, sortSummaryLabel } = await import('./ActiveIssuesWorkbenchPage');
    const baseFilters: FilterDraft = {
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

    expect(noResultsText('', baseFilters, true)).toBe('当前视图下还没有 issues。');
    expect(noResultsText('auth', baseFilters, true)).toBe('没有找到匹配“auth”的 issues。');
    expect(noResultsText('', { ...baseFilters, state: 'DONE' }, true)).toBe('当前筛选条件下暂无 issues。');
    expect(noResultsText('auth', { ...baseFilters, priority: 'HIGH' }, false)).toBe('No issues match “auth” with the active filters.');
    expect(filterSummaryLabel(baseFilters, true)).toBe('当前未应用过滤条件。');
    expect(filterSummaryLabel({ ...baseFilters, priority: 'HIGH' }, false)).toBe('Priority: HIGH');
    expect(filterSummaryLabel({ ...baseFilters, q: 'auth', priority: 'HIGH', teamId: '7' }, true)).toBe('搜索: auth · 优先级: HIGH · 团队: #7');
    expect(filterButtonLabel({ ...baseFilters, q: 'auth', priority: 'HIGH', teamId: '7' }, false)).toBe('Filter · 3');
    expect(activeFilterSummary({ ...baseFilters, labelIds: ['12', '18'] }, false, {
      labels: [
        { id: '12', name: 'Bug' },
        { id: '18', name: 'Customer' },
      ],
    })).toEqual(['Labels: Bug, Customer']);
    expect(collapsedSummaryLabel(new Set(), true)).toBe('所有状态分组当前均已展开。');
    expect(collapsedSummaryLabel(new Set(['BACKLOG', 'DONE']), false)).toBe('Collapsed groups: Backlog, Done');
    expect(sortSummaryLabel('updatedAt', true)).toBe('当前排序：最近更新');
    expect(sortSummaryLabel('manual', false)).toBe('Current sort: Manual');
  });

  it('team 视图 tabs 优先指向语义化 team 路径', () => {
    expect(teamIssuesPath('cleantrack', 'CLE', 'active')).toBe('/cleantrack/team/CLE/active');
    expect(teamIssuesPath('cleantrack', 'CLE', 'backlog')).toBe('/cleantrack/team/CLE/backlog');
    expect(teamIssuesPath('cleantrack', 'CLE', 'done')).toBe('/cleantrack/team/CLE/done');
  });
});
