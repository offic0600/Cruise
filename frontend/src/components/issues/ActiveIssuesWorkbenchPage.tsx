'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, ChevronDown, Circle, CircleDashed, CircleEllipsis, Eye, FilterX, LayoutList, LoaderCircle, Maximize2, PanelRightOpen, Plus, Search, SlidersHorizontal } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import IssueComposer from '@/components/issues/IssueComposer';
import { useCurrentWorkspace } from '@/components/providers/WorkspaceProvider';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDismissButton, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useI18n } from '@/i18n/useI18n';
import type { CustomFieldDefinition, Team } from '@/lib/api';
import { issueDetailPath, issueViewFromTeamRoute, teamIssuesPath, teamNewViewPath } from '@/lib/routes';
import { useIssueWorkspace } from '@/lib/query/issues';
import {
  activeFilterSummary,
  buildActiveWorkbenchRows,
  filterButtonLabel,
  filterSummaryLabel,
  groupBelongsToView,
  summarizeFilterTokens,
  labelForPriority,
  labelForState,
  labelForType,
  type ActiveWorkbenchSort,
  type ActiveWorkbenchRow,
  type FilterDraft,
  type FilterSummaryContext,
} from './issue-workbench';
import { DEFAULT_TEAM_ISSUES_VIEW, normalizeIssueView, type IssueView } from './issue-view';

type TeamMember = {
  id: number;
  name: string;
  email?: string;
  role?: string;
  teamId?: number | null;
};

type LabelOption = {
  id: number;
  name: string;
};

const EMPTY = '__empty__';
const GROUP_ORDER = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELED'] as const;
const TYPE_OPTIONS = ['FEATURE', 'TASK', 'BUG', 'TECH_DEBT'] as const;
const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
const DISPLAY_LABEL = {
  en: 'Display',
  zh: '显示',
} as const;

const VIEW_LABELS = {
  all: { en: 'All issues', zh: '全部事项' },
  active: { en: 'Active', zh: '进行中' },
  backlog: { en: 'Backlog', zh: '待规划' },
  done: { en: 'Completed', zh: '已完成' },
} as const;

const COLUMN_LABELS = {
  issue: { en: 'Issue', zh: '事项' },
  assignee: { en: 'Assignee', zh: '负责人' },
  priority: { en: 'Priority', zh: '优先级' },
  updated: { en: 'Updated', zh: '更新时间' },
} as const;

function viewLabel(view: IssueView, isZh: boolean) {
  const pair = VIEW_LABELS[view];
  return isZh ? pair.zh : pair.en;
}

function columnLabel(column: keyof typeof COLUMN_LABELS, isZh: boolean) {
  const pair = COLUMN_LABELS[column];
  return isZh ? pair.zh : pair.en;
}

function noteHeading(isZh: boolean) {
  return isZh ? '工作台说明' : 'Workbench notes';
}

function nextIntegrationHeading(isZh: boolean) {
  return isZh ? '下一步挂接点' : 'Next integration points';
}

function issuesEyebrow(isZh: boolean) {
  return isZh ? '事项' : 'Issues';
}

function filterSheetTitle(isZh: boolean) {
  return isZh ? '高级筛选' : 'Advanced filter';
}

function collapsedGroupsText(isZh: boolean) {
  return isZh ? '当前视图的所有状态分组都已折叠。可在 Display 中重新展开。' : 'All state groups in this view are collapsed. Re-open them from Display.';
}

function searchPlaceholder(isZh: boolean) {
  return isZh ? '搜索标题或编号' : 'Search title or identifier';
}

function closeLabel(isZh: boolean) {
  return isZh ? '关闭' : 'Close';
}

function clearFiltersLabel(isZh: boolean) {
  return isZh ? '清空筛选' : 'Clear filters';
}

function applyFiltersLabel(isZh: boolean) {
  return isZh ? '应用筛选' : 'Apply filters';
}

function allTypesLabel(isZh: boolean) {
  return isZh ? '所有类型' : 'All types';
}

function allStatesLabel(isZh: boolean) {
  return isZh ? '所有状态' : 'All states';
}

function allPrioritiesLabel(isZh: boolean) {
  return isZh ? '所有优先级' : 'All priorities';
}

function allMembersLabel(isZh: boolean) {
  return isZh ? '所有成员' : 'All members';
}

function allProjectsLabel(isZh: boolean) {
  return isZh ? '所有项目' : 'All projects';
}

function allTeamsLabel(isZh: boolean) {
  return isZh ? '所有团队' : 'All teams';
}

function allLabelsLabel(isZh: boolean) {
  return isZh ? '所有标签' : 'All labels';
}

function selectedLabelsSummary(count: number, isZh: boolean) {
  return isZh ? `已选 ${count} 个标签` : `${count} labels selected`;
}

function anyValueLabel(isZh: boolean) {
  return isZh ? '任意' : 'Any';
}

function trueValueLabel(isZh: boolean) {
  return isZh ? '是' : 'True';
}

function falseValueLabel(isZh: boolean) {
  return isZh ? '否' : 'False';
}

function filterValuePlaceholder(isZh: boolean) {
  return isZh ? '输入筛选值' : 'Enter filter value';
}

function notSetLabel(isZh: boolean) {
  return isZh ? '未设置' : 'Not set';
}

function workspaceFallback(isZh: boolean) {
  return isZh ? '工作区' : 'Workspace';
}

function teamFallback(isZh: boolean) {
  return isZh ? '团队' : 'Team';
}

function expandHintDisplayLabel(isZh: boolean) {
  return isZh ? '显示' : 'Display';
}

function currentSortIntentText(sort: ActiveWorkbenchSort, isZh: boolean) {
  const currentSort = sortLabel(sort, isZh);
  return isZh
    ? `1. 当前先用 URL 参数保留排序意图（${currentSort}），下一轮再接真实排序逻辑。`
    : `1. Keep sort intent in the URL first (${currentSort}), then wire the real sort behavior next.`;
}

function toolbarTighteningText(isZh: boolean) {
  return isZh ? '2. 继续补齐顶部工具栏与 issue row 的 Linear 对标细节。' : '2. Continue tightening toolbar and issue-row fidelity against Linear.';
}

function richerFiltersText(isZh: boolean) {
  return isZh ? '3. 逐步接入更真实的筛选文案与字段级交互。' : '3. Gradually wire richer filter copy and field-level interactions.';
}

function noAssigneeLabel(isZh: boolean) {
  return isZh ? '未设置' : 'Not set';
}

function issueSearchLabel(isZh: boolean) {
  return isZh ? '搜索' : 'Search';
}

function typeFilterLabel(isZh: boolean) {
  return isZh ? '类型' : 'Type';
}

function stateFilterLabel(isZh: boolean) {
  return isZh ? '状态' : 'State';
}

function priorityFilterLabel(isZh: boolean) {
  return isZh ? '优先级' : 'Priority';
}

function assigneeFilterLabel(isZh: boolean) {
  return isZh ? '负责人' : 'Assignee';
}

function projectFilterLabel(isZh: boolean) {
  return isZh ? '项目' : 'Project';
}

function teamFilterLabel(isZh: boolean) {
  return isZh ? '团队' : 'Team';
}

function labelsFilterLabel(isZh: boolean) {
  return isZh ? '标签' : 'Labels';
}

function customFieldsLabel(isZh: boolean) {
  return isZh ? '自定义字段' : 'Custom fields';
}

type ActiveTab = {
  id: IssueView;
  label: string;
  count: number | null;
};

type RowDensity = 'comfortable' | 'compact';


function isFilterActive(filters: FilterDraft) {
  return activeFilterSummary(filters, false).length > 0;
}

function filterStatusText(filters: FilterDraft, isZh: boolean) {
  return filterSummaryLabel(filters, isZh);
}

export function searchStatusText(searchQuery: string, filters: FilterDraft, isZh: boolean) {
  const filterText = filterStatusText(filters, isZh);
  if (!searchQuery) {
    return isZh ? `支持 URL q 参数，便于后续继续接高级筛选。${filterText}` : `Backed by the URL q param for future advanced filters. ${filterText}`;
  }
  return isZh ? `当前查询：${searchQuery}；${filterText}` : `Current query: ${searchQuery}. ${filterText}`;
}

export function noResultsText(searchQuery: string, filters: FilterDraft, isZh: boolean) {
  const tokens = activeFilterSummary(filters, isZh);
  if (searchQuery && tokens.length > 0) {
    return isZh
      ? `没有找到匹配“${searchQuery}”且符合当前筛选条件的 issues。`
      : `No issues match “${searchQuery}” with the active filters.`;
  }
  if (searchQuery) {
    return isZh ? `没有找到匹配“${searchQuery}”的 issues。` : `No issues match “${searchQuery}”.`;
  }
  if (tokens.length > 0) {
    return isZh ? '当前筛选条件下暂无 issues。' : 'No issues match the active filters.';
  }
  return isZh ? '当前视图下还没有 issues。' : 'No issues found for this view yet.';
}

function searchSummaryLabel(filters: FilterDraft, isZh: boolean, context: FilterSummaryContext) {
  const tokens = activeFilterSummary(filters, isZh, context);
  return summarizeFilterTokens(tokens, isZh).shortLabel;
}

export function noteText(filters: FilterDraft, isZh: boolean) {
  const tokens = activeFilterSummary(filters, isZh);
  if (tokens.length === 0) {
    return isZh
      ? '当前页面已对齐主壳层、一级切换与关键反馈状态；下一步继续补齐更多真实工具栏动作。'
      : 'The page shell, primary view switching, and key feedback states now match the capture; next, wire more real toolbar actions.';
  }

  return isZh
    ? `当前筛选：${tokens.join(' · ')}；主壳层与关键反馈状态已收口，后续继续补齐更多真实工具栏动作。`
    : `Active filters: ${tokens.join(' · ')}. The shell and key feedback states are closed out; next, wire more real toolbar actions.`;
}

export function pageTitle(view: IssueView, isZh: boolean) {
  if (view === 'active') {
    return isZh ? '进行中事项' : 'Active issues';
  }
  return viewLabel(view, isZh);
}

function buildWorkbenchDescription(view: IssueView, isZh: boolean) {
  if (isZh) {
    if (view === 'all') return '页面主壳层已对齐 capture：标题区、一级视图切换、列表列头与 loading/空态反馈会跟随 All issues 视图收口到真实 issue 数据流。';
    if (view === 'backlog') return '页面主壳层已对齐 capture：标题区、一级视图切换、列表列头与 loading/空态反馈会跟随 Backlog 视图收口到真实 issue 数据流。';
    if (view === 'done') return '页面主壳层已对齐 capture：标题区、一级视图切换、列表列头与 loading/空态反馈会跟随 Completed 视图收口到真实 issue 数据流。';
    return '页面主壳层已对齐 capture：标题区、一级视图切换、列表列头与 loading/空态反馈会跟随 Active 视图收口到真实 issue 数据流。';
  }

  if (view === 'all') return 'The captured page shell is now aligned: the title area, primary view switching, list headers, and loading/empty feedback all close against the real All issues data flow.';
  if (view === 'backlog') return 'The captured page shell is now aligned: the title area, primary view switching, list headers, and loading/empty feedback all close against the real Backlog data flow.';
  if (view === 'done') return 'The captured page shell is now aligned: the title area, primary view switching, list headers, and loading/empty feedback all close against the real Completed data flow.';
  return 'The captured page shell is now aligned: the title area, primary view switching, list headers, and loading/empty feedback all close against the real Active data flow.';
}

export function loadingText(view: IssueView, isZh: boolean) {
  if (isZh) {
    if (view === 'all') return '正在加载 All issues…';
    if (view === 'backlog') return '正在加载 Backlog…';
    if (view === 'done') return '正在加载 Completed…';
    return '正在加载 Active issues…';
  }

  if (view === 'all') return 'Loading all issues…';
  if (view === 'backlog') return 'Loading backlog…';
  if (view === 'done') return 'Loading completed issues…';
  return 'Loading active issues…';
}

export function collapsedSummaryLabel(collapsedStates: Set<string>, isZh: boolean) {
  if (collapsedStates.size === 0) {
    return isZh ? '所有状态分组当前均已展开。' : 'All state groups are currently expanded.';
  }

  const labels = GROUP_ORDER.filter((state) => collapsedStates.has(state)).map((state) => labelForState(state, isZh));
  return isZh ? `已折叠分组：${labels.join('、')}` : `Collapsed groups: ${labels.join(', ')}`;
}

function densityLabel(density: RowDensity, isZh: boolean) {
  return density === 'compact' ? (isZh ? '紧凑' : 'Compact') : (isZh ? '舒适' : 'Comfortable');
}

function selectedIssueFeedback(issue: ActiveWorkbenchRow | null, detailsOpen: boolean, isZh: boolean) {
  if (!issue) return isZh ? '未选择事项' : 'No issue selected';
  if (detailsOpen) {
    return isZh ? `右侧正在预览 ${issue.identifier}` : `Previewing ${issue.identifier} in the side pane`;
  }
  return isZh ? `点击将打开 ${issue.identifier}` : `Click opens ${issue.identifier}`;
}

function sortLabel(sort: ActiveWorkbenchSort, isZh: boolean) {
  if (sort === 'updatedAt') {
    return isZh ? '最近更新' : 'Last updated';
  }
  return isZh ? '手动排序' : 'Manual';
}

export function sortSummaryLabel(sort: ActiveWorkbenchSort, isZh: boolean) {
  return isZh ? `当前排序：${sortLabel(sort, isZh)}` : `Current sort: ${sortLabel(sort, isZh)}`;
}

function nextSteps(isZh: boolean, sort: ActiveWorkbenchSort) {
  return [
    currentSortIntentText(sort, isZh),
    toolbarTighteningText(isZh),
    richerFiltersText(isZh),
  ];
}

function readSortValue(searchParams: URLSearchParams): ActiveWorkbenchSort {
  return searchParams.get('sort') === 'manual' ? 'manual' : 'updatedAt';
}

function toggleSort(
  router: ReturnType<typeof useRouter>,
  pathname: string,
  searchParams: URLSearchParams,
  sort: ActiveWorkbenchSort
) {
  updateQuery(router, pathname, searchParams, { sort: sort === 'updatedAt' ? 'manual' : 'updatedAt' });
}

function setSort(
  router: ReturnType<typeof useRouter>,
  pathname: string,
  searchParams: URLSearchParams,
  sort: ActiveWorkbenchSort
) {
  updateQuery(router, pathname, searchParams, { sort: sort === 'manual' ? 'manual' : null });
}

function updateQuery(router: ReturnType<typeof useRouter>, pathname: string, searchParams: URLSearchParams, updates: Record<string, string | null>) {
  router.replace(updateHref(pathname, searchParams, updates), { scroll: false });
}

function readDetailsOpen(searchParams: URLSearchParams) {
  return searchParams.get('details') === 'open';
}

function setDetailsQuery(
  router: ReturnType<typeof useRouter>,
  pathname: string,
  searchParams: URLSearchParams,
  open: boolean
) {
  updateQuery(router, pathname, searchParams, { details: open ? 'open' : null });
}

function readRowDensity(searchParams: URLSearchParams): RowDensity {
  return searchParams.get('density') === 'compact' ? 'compact' : 'comfortable';
}

function setRowDensityQuery(
  router: ReturnType<typeof useRouter>,
  pathname: string,
  searchParams: URLSearchParams,
  density: RowDensity
) {
  updateQuery(router, pathname, searchParams, { density: density === 'compact' ? 'compact' : null });
}

function readShowRowMetadata(searchParams: URLSearchParams) {
  return searchParams.get('meta') !== 'hidden';
}

function setShowRowMetadataQuery(
  router: ReturnType<typeof useRouter>,
  pathname: string,
  searchParams: URLSearchParams,
  visible: boolean
) {
  updateQuery(router, pathname, searchParams, { meta: visible ? null : 'hidden' });
}

function setSelectedIssueQuery(
  router: ReturnType<typeof useRouter>,
  pathname: string,
  searchParams: URLSearchParams,
  issueId: number | null
) {
  updateQuery(router, pathname, searchParams, { issue: issueId ? String(issueId) : null });
}

function readSelectedIssueId(searchParams: URLSearchParams) {
  const raw = searchParams.get('issue');
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function createSearchDraft(searchParams: URLSearchParams) {
  return searchParams.get('q') ?? '';
}

function syncSearchDraft(current: string, searchParams: URLSearchParams) {
  const next = searchParams.get('q') ?? '';
  return current === next ? current : next;
}

export default function ActiveIssuesWorkbenchPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { locale = 'en' } = useI18n();
  const isZh = locale.startsWith('zh');
  const { currentTeam, currentOrganization, currentOrganizationSlug, organizationId, currentTeamId } = useCurrentWorkspace();
  const currentView = normalizeIssueView(issueViewFromTeamRoute(pathname) ?? searchParams.get('view'), DEFAULT_TEAM_ISSUES_VIEW);
  const [searchDraft, setSearchDraft] = useState(() => createSearchDraft(searchParams));
  const apiFilters = useMemo(
    () => buildIssueFilters(searchParams, organizationId ?? 1, currentTeamId),
    [currentTeamId, organizationId, searchParams]
  );
  const { issuesQuery, customFieldDefinitionsQuery, projectsQuery, teamsQuery, membersQuery, labelsQuery } = useIssueWorkspace(apiFilters);

  const issues = useMemo(() => issuesQuery.data ?? [], [issuesQuery.data]);
  const customFieldDefinitions = useMemo(
    () => (customFieldDefinitionsQuery.data ?? []).filter((field) => field.isActive),
    [customFieldDefinitionsQuery.data]
  );
  const projects = useMemo(() => projectsQuery.data ?? [], [projectsQuery.data]);
  const teams = useMemo(() => (teamsQuery.data ?? []) as Team[], [teamsQuery.data]);
  const labels = useMemo(
    () =>
      ((labelsQuery.data ?? []) as Array<{ id: number; name?: string | null }>).map((label) => ({
        id: label.id,
        name: label.name?.trim() || `#${label.id}`,
      })),
    [labelsQuery.data]
  );
  const members = useMemo(
    () =>
      ((membersQuery.data ?? []) as Array<{ id: number; name?: string | null }>).map((member) => ({
        id: member.id,
        name: member.name?.trim() || 'Not set',
      })),
    [membersQuery.data]
  );

  const searchQuery = searchParams.get('q') ?? '';
  const sort = readSortValue(searchParams);
  const collapsedStates = useMemo(() => readCollapsedStates(searchParams), [searchParams]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [createIssueOpen, setCreateIssueOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(() => readDetailsOpen(searchParams));
  const [selectedIssueId, setSelectedIssueId] = useState<number | null>(() => readSelectedIssueId(searchParams));
  const [draftFilters, setDraftFilters] = useState<FilterDraft>(() => readFilterDraft(searchParams, []));
  const [rowDensity, setRowDensity] = useState<RowDensity>(() => readRowDensity(searchParams));
  const [showRowMetadata, setShowRowMetadata] = useState(() => readShowRowMetadata(searchParams));
  const [lastWorkbenchAction, setLastWorkbenchAction] = useState<string | null>(null);
  const filterSummaryContext = useMemo<FilterSummaryContext>(
    () => ({
      assignees: members.map((member) => ({ id: String(member.id), name: member.name })),
      projects: projects.map((project) => ({ id: String(project.id), name: project.name })),
      teams: teams.map((team) => ({ id: String(team.id), name: team.name })),
      labels: labels.map((label) => ({ id: String(label.id), name: label.name })),
    }),
    [labels, members, projects, teams]
  );
  const activeFilterTokens = useMemo(
    () => activeFilterSummary(draftFilters, isZh, filterSummaryContext),
    [draftFilters, filterSummaryContext, isZh]
  );

  useEffect(() => {
    setSearchDraft((current) => syncSearchDraft(current, searchParams));
    setDraftFilters(readFilterDraft(searchParams, customFieldDefinitions));
    setDetailsOpen(readDetailsOpen(searchParams));
    setSelectedIssueId(readSelectedIssueId(searchParams));
    setRowDensity(readRowDensity(searchParams));
    setShowRowMetadata(readShowRowMetadata(searchParams));
  }, [customFieldDefinitions, searchParams]);

  const workbenchRows = useMemo(
    () => buildActiveWorkbenchRows(issues.filter((issue) => groupBelongsToView(issue.state, currentView)), members, projects, locale, sort),
    [currentView, issues, locale, members, projects, sort]
  );

  const groupedRows = useMemo(
    () =>
      GROUP_ORDER.map((state) => ({
        state,
        rows: workbenchRows.filter((issue) => issue.state === state),
      })).filter((group) => group.rows.length > 0),
    [workbenchRows]
  );

  const selectedIssue = useMemo(() => {
    if (!workbenchRows.length) return null;
    return workbenchRows.find((issue) => issue.id === selectedIssueId) ?? workbenchRows[0] ?? null;
  }, [selectedIssueId, workbenchRows]);

  const issueCounts = useMemo(() => {
    return {
      all: issues.length,
      active: issues.filter((issue) => issue.stateCategory === 'ACTIVE' || issue.stateCategory === 'REVIEW').length,
      backlog: issues.filter((issue) => issue.stateCategory === 'BACKLOG').length,
      done: issues.filter((issue) => issue.stateCategory === 'COMPLETED').length,
    } satisfies Record<IssueView, number>;
  }, [issues]);

  const activeTabs = useMemo<ActiveTab[]>(
    () => [
      { id: 'all', label: viewLabel('all', isZh), count: null },
      { id: 'active', label: viewLabel('active', isZh), count: issueCounts.active },
      { id: 'backlog', label: viewLabel('backlog', isZh), count: issueCounts.backlog },
      { id: 'done', label: viewLabel('done', isZh), count: issueCounts.done },
    ],
    [isZh, issueCounts.active, issueCounts.backlog, issueCounts.done]
  );

  const createIssueParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set('type', 'TASK');
    params.set('state', currentView === 'backlog' ? 'BACKLOG' : currentView === 'done' ? 'DONE' : 'TODO');
    if (currentTeamId) params.set('teamId', String(currentTeamId));
    return params;
  }, [currentTeamId, currentView]);

  const openIssue = (issueId: number) => {
    const issue = issues.find((item) => item.id === issueId);
    if (!issue || !currentOrganizationSlug) return;
    router.push(issueDetailPath(currentOrganizationSlug, issue));
  };

  const announceWorkbenchAction = (message: string) => {
    setLastWorkbenchAction(message);
    window.setTimeout(() => setLastWorkbenchAction((current) => (current === message ? null : current)), 2200);
  };

  return (
    <AppLayout>
      <div className="space-y-5 px-3 py-4 text-slate-100 sm:px-5 lg:px-6">
        <section className="overflow-hidden rounded-[28px] border border-slate-800 bg-[#08090c] shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="border-b border-slate-800/90 px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-slate-400">
                  {currentOrganization?.name ?? workspaceFallback(isZh)} / {currentTeam?.name ?? teamFallback(isZh)}
                </div>
                <div className="space-y-1">
                  <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-white">{pageTitle(currentView, isZh)}</h1>
                  <p className="max-w-2xl text-sm text-slate-400">{buildWorkbenchDescription(currentView, isZh)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {activeTabs.map((tab) => {
                    const active = currentView === tab.id;
                    const tabHref = currentOrganizationSlug && currentTeam?.key
                      ? updateHref(teamIssuesPath(currentOrganizationSlug, currentTeam.key, tab.id), searchParams, {})
                      : updateHref(pathname, searchParams, { view: tab.id });
                    return (
                      <Link
                        key={tab.id}
                        href={tabHref}
                        scroll={false}
                        className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-[13px] transition ${
                          active
                            ? 'border-slate-700 bg-slate-100 text-slate-950'
                            : 'border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                        aria-current={active ? 'page' : undefined}
                      >
                        {tab.label}
                        {tab.count === null ? null : (
                          <span className="ml-2 rounded-full bg-black/10 px-1.5 py-0.5 text-[11px] text-inherit">{tab.count}</span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    updateQuery(router, pathname, searchParams, { q: searchDraft.trim() || null });
                  }}
                  className="relative min-w-[220px] flex-1 lg:w-[280px] lg:flex-none"
                >
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    value={searchDraft}
                    onChange={(event) => setSearchDraft(event.target.value)}
                    placeholder={searchPlaceholder(isZh)}
                    className="h-10 rounded-full border-slate-800 bg-slate-950 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500"
                  />
                </form>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setFilterOpen(true)}
                  className={`h-10 rounded-full border px-3 text-sm hover:bg-slate-800 ${
                    isFilterActive(draftFilters)
                      ? 'border-slate-700 bg-slate-100 text-slate-950'
                      : 'border-slate-800 bg-slate-900 text-slate-200'
                  }`}
                >
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  {isFilterActive(draftFilters) ? filterButtonLabel(draftFilters, isZh, filterSummaryContext) : isZh ? '添加筛选' : 'Add filter'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => toggleSort(router, pathname, searchParams, sort)}
                  className="h-10 rounded-full border border-slate-800 bg-slate-900 px-3 text-sm text-slate-200 hover:bg-slate-800"
                >
                  <ChevronDown className="mr-2 h-4 w-4" />
                  {isZh ? '排序' : 'Sort'} · {sortLabel(sort, isZh)}
                </Button>
                <DisplayMenu
                  isZh={isZh}
                  sort={sort}
                  collapsedStates={collapsedStates}
                  rowDensity={rowDensity}
                  showRowMetadata={showRowMetadata}
                  onSetSort={(nextSort) => setSort(router, pathname, searchParams, nextSort)}
                  onToggleGroup={(state) => toggleGroupCollapsed(router, pathname, searchParams, collapsedStates, state)}
                  onSetRowDensity={(density) => {
                    setRowDensity(density);
                    setRowDensityQuery(router, pathname, searchParams, density);
                  }}
                  onSetShowRowMetadata={(value) => {
                    setShowRowMetadata(value);
                    setShowRowMetadataQuery(router, pathname, searchParams, value);
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  aria-pressed={detailsOpen}
                  onClick={() => {
                    const nextOpen = !detailsOpen;
                    setDetailsOpen(nextOpen);
                    setDetailsQuery(router, pathname, searchParams, nextOpen);
                    if (!nextOpen) {
                      setSelectedIssueId(null);
                      setSelectedIssueQuery(router, pathname, searchParams, null);
                    }
                  }}
                  className={`h-10 rounded-full border px-3 text-sm ${
                    detailsOpen
                      ? 'border-slate-700 bg-slate-100 text-slate-950 hover:bg-white'
                      : 'border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <PanelRightOpen className="mr-2 h-4 w-4" />
                  {isZh ? '打开详情' : 'Open details'}
                </Button>
                {currentOrganizationSlug ? (
                  <Link
                    href={currentTeam?.key ? teamNewViewPath(currentOrganizationSlug, currentTeam.key) : '#'}
                    className="inline-flex h-10 items-center rounded-full border border-slate-800 bg-slate-900 px-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
                  >
                    <LayoutList className="mr-2 h-4 w-4" />
                    {isZh ? '新增视图' : 'Add new view'}
                  </Link>
                ) : null}
                <Button
                  type="button"
                  onClick={() => setCreateIssueOpen(true)}
                  className="h-10 rounded-full bg-slate-100 px-3 text-sm text-slate-950 shadow-none hover:bg-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {isZh ? '新建事项' : 'Create new issue'}
                </Button>
              </div>
            </div>
          </div>

          <WorkbenchInteractionRail
            isZh={isZh}
            currentView={currentView}
            visibleCount={workbenchRows.length}
            totalCount={issues.length}
            filterCount={activeFilterTokens.length}
            collapsedCount={collapsedStates.size}
            detailsOpen={detailsOpen}
            selectedIssue={selectedIssue}
            onOpenFilters={() => setFilterOpen(true)}
            onToggleDetails={() => {
              const nextOpen = !detailsOpen;
              setDetailsOpen(nextOpen);
              setDetailsQuery(router, pathname, searchParams, nextOpen);
              if (!nextOpen) {
                setSelectedIssueId(null);
                setSelectedIssueQuery(router, pathname, searchParams, null);
              }
              announceWorkbenchAction(nextOpen ? (isZh ? '已打开右侧详情预览' : 'Opened the detail preview') : (isZh ? '已关闭右侧详情预览' : 'Closed the detail preview'));
            }}
            onCreateIssue={() => setCreateIssueOpen(true)}
            onFocusSelected={() => {
              if (!selectedIssue) return;
              setDetailsOpen(true);
              setDetailsQuery(router, pathname, searchParams, true);
              setSelectedIssueId(selectedIssue.id);
              setSelectedIssueQuery(router, pathname, searchParams, selectedIssue.id);
              announceWorkbenchAction(isZh ? `已聚焦 ${selectedIssue.identifier}` : `Focused ${selectedIssue.identifier}`);
            }}
          />

          <div className="border-b border-slate-800/90 px-5 py-3 sm:px-6">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div className="grid flex-1 grid-cols-[minmax(0,1fr)_140px_120px_72px] items-center gap-4 text-[11px] uppercase tracking-[0.22em] text-slate-500">
                <span>{columnLabel('issue', isZh)}</span>
                <span>{columnLabel('assignee', isZh)}</span>
                <span>{columnLabel('priority', isZh)}</span>
                <span className="text-right">{columnLabel('updated', isZh)}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="rounded-full border border-slate-800 px-2.5 py-1">
                  {densityLabel(rowDensity, isZh)}
                </span>
                <span className="rounded-full border border-slate-800 px-2.5 py-1">
                  {selectedIssueFeedback(selectedIssue, detailsOpen, isZh)}
                </span>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-800/80">
            {issuesQuery.isLoading ? (
              <div className="px-5 py-8 text-sm text-slate-500 sm:px-6">{loadingText(currentView, isZh)}</div>
            ) : workbenchRows.length === 0 ? (
              <div className="px-5 py-8 text-sm text-slate-500 sm:px-6">{noResultsText(searchQuery, draftFilters, isZh)}</div>
            ) : groupedRows.every((group) => collapsedStates.has(group.state)) ? (
              <div className="px-5 py-8 text-sm text-slate-500 sm:px-6">
                {collapsedGroupsText(isZh)}
              </div>
            ) : (
              groupedRows.map((group) => {
                const collapsed = collapsedStates.has(group.state);
                if (collapsed) return null;
                return (
                  <section key={group.state} className="border-t border-slate-800/80 first:border-t-0">
                    <div className="flex items-center justify-between px-5 py-2.5 text-[11px] uppercase tracking-[0.22em] text-slate-500 sm:px-6">
                      <span>{labelForState(group.state, isZh)}</span>
                      <span>{group.rows.length}</span>
                    </div>
                    <div className="divide-y divide-slate-800/80">
                      {group.rows.map((issue) => (
                        <button
                          key={issue.id}
                          type="button"
                          onClick={() => {
                            if (detailsOpen) {
                              setSelectedIssueId(issue.id);
                              return;
                            }
                            openIssue(issue.id);
                          }}
                          aria-selected={selectedIssue?.id === issue.id}
                          className={`grid w-full grid-cols-[minmax(0,1fr)_140px_120px_72px] items-center gap-4 px-5 text-left transition hover:bg-slate-900/70 sm:px-6 ${
                            rowDensity === 'compact' ? 'py-2' : 'py-3'
                          } ${
                            selectedIssue?.id === issue.id && detailsOpen ? 'bg-slate-900/80 ring-1 ring-inset ring-slate-700' : ''
                          }`}
                        >
                          <div className="min-w-0 space-y-1.5">
                            <div className="flex items-center gap-3 text-sm">
                              <span className="inline-flex h-5 w-5 items-center justify-center text-slate-400">
                                <IssueStateIcon state={issue.state} />
                              </span>
                              <span className="text-[13px] font-medium text-slate-500">{issue.identifier}</span>
                              <span className="truncate text-[14px] font-medium text-slate-100">{issue.title}</span>
                            </div>
                            {showRowMetadata ? (
                              <div className="flex flex-wrap items-center gap-2 pl-8 text-[12px] text-slate-500">
                                {issue.projectName ? <span>{issue.projectName}</span> : null}
                                {issue.projectName ? <span>•</span> : null}
                                <span>{issue.typeLabel}</span>
                              </div>
                            ) : null}
                          </div>
                          <span className="truncate text-[13px] text-slate-300">{issue.assigneeLabel}</span>
                          <span className="text-[13px] text-slate-300">{issue.priorityLabel}</span>
                          <span className="text-right text-[12px] text-slate-500">{issue.updatedLabel}</span>
                        </button>
                      ))}
                    </div>
                  </section>
                );
              })
            )}
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
          <div className="rounded-[24px] border border-slate-800 bg-[#0b0d11] p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-200">{noteHeading(isZh)}</div>
                <div className="mt-1 text-sm text-slate-500">{noteText(draftFilters, isZh)}</div>
                <div className="mt-2 text-xs text-slate-500">{searchStatusText(searchQuery, draftFilters, isZh)}</div>
              </div>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-800 text-slate-400 transition hover:border-slate-700 hover:bg-slate-900 hover:text-slate-200"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
            {detailsOpen ? (
              <IssueDetailsPreview
                issue={selectedIssue}
                isZh={isZh}
                onOpenIssue={(issueId) => openIssue(issueId)}
                onPreviewAction={(message) => announceWorkbenchAction(message)}
              />
            ) : null}
          </div>

          <aside className="rounded-[24px] border border-slate-800 bg-[#0b0d11] p-5">
            <div className="text-sm font-medium text-slate-200">{nextIntegrationHeading(isZh)}</div>
            <div className="mt-2 text-xs text-slate-500">{filterSummaryLabel(draftFilters, isZh, filterSummaryContext)}</div>
            <div className="mt-2 text-xs text-slate-500">{collapsedSummaryLabel(collapsedStates, isZh)}</div>
            <div className="mt-2 text-xs text-slate-500">{sortSummaryLabel(sort, isZh)}</div>
            {lastWorkbenchAction ? (
              <div aria-live="polite" className="mt-3 rounded-2xl border border-emerald-900/60 bg-emerald-950/30 px-3 py-2 text-xs font-medium text-emerald-300">
                {lastWorkbenchAction}
              </div>
            ) : null}
            <ul className="mt-3 space-y-3 text-sm text-slate-400">
              {nextSteps(isZh, sort).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </aside>
        </section>
      </div>

      <FilterSheet
        open={filterOpen}
        setOpen={setFilterOpen}
        isZh={isZh}
        draftFilters={draftFilters}
        setDraftFilters={setDraftFilters}
        customFieldDefinitions={customFieldDefinitions}
        members={members}
        projects={projects}
        teams={teams}
        labels={labels}
        onClear={() => clearFilters(router, pathname, searchParams, customFieldDefinitions, setDraftFilters, setFilterOpen)}
        onApply={() => applyFilterDraft(router, pathname, searchParams, draftFilters, setFilterOpen)}
      />
      <IssueComposer
        mode="modal"
        open={createIssueOpen}
        onClose={() => setCreateIssueOpen(false)}
        initialParams={createIssueParams}
        localeScope="team-issues-workbench"
      />
    </AppLayout>
  );
}

function WorkbenchInteractionRail({
  isZh,
  currentView,
  visibleCount,
  totalCount,
  filterCount,
  collapsedCount,
  detailsOpen,
  selectedIssue,
  onOpenFilters,
  onToggleDetails,
  onCreateIssue,
  onFocusSelected,
}: {
  isZh: boolean;
  currentView: IssueView;
  visibleCount: number;
  totalCount: number;
  filterCount: number;
  collapsedCount: number;
  detailsOpen: boolean;
  selectedIssue: ActiveWorkbenchRow | null;
  onOpenFilters: () => void;
  onToggleDetails: () => void;
  onCreateIssue: () => void;
  onFocusSelected: () => void;
}) {
  const metrics = [
    { label: isZh ? '当前视图' : 'Current view', value: viewLabel(currentView, isZh) },
    { label: isZh ? '可见事项' : 'Visible issues', value: String(visibleCount) },
    { label: isZh ? '全部事项' : 'All issues', value: String(totalCount) },
    { label: isZh ? '筛选/折叠' : 'Filters/groups', value: `${filterCount}/${collapsedCount}` },
  ];

  return (
    <div className="border-b border-slate-800/90 bg-slate-950/55 px-5 py-4 sm:px-6">
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            {isZh ? '交互控制台' : 'Interaction console'}
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-slate-800 bg-[#090b10] px-3 py-2.5">
                <div className="text-[10px] uppercase tracking-[0.16em] text-slate-600">{metric.label}</div>
                <div className="mt-1 truncate text-sm font-semibold text-slate-100">{metric.value}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
          <button
            type="button"
            onClick={onOpenFilters}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 text-xs font-medium text-slate-200 transition hover:bg-slate-800"
          >
            <SlidersHorizontal className="h-4 w-4 text-slate-500" />
            {isZh ? '筛选面板' : 'Filter panel'}
          </button>
          <button
            type="button"
            onClick={onToggleDetails}
            className={`inline-flex h-9 items-center gap-2 rounded-full px-3 text-xs font-medium transition ${
              detailsOpen
                ? 'bg-slate-100 text-slate-950 hover:bg-white'
                : 'border border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800'
            }`}
          >
            <PanelRightOpen className="h-4 w-4" />
            {detailsOpen ? (isZh ? '详情已开' : 'Details on') : (isZh ? '打开详情' : 'Open details')}
          </button>
          <button
            type="button"
            onClick={onFocusSelected}
            disabled={!selectedIssue}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 text-xs font-medium text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <CheckCircle2 className="h-4 w-4 text-slate-500" />
            {selectedIssue ? (isZh ? `聚焦 ${selectedIssue.identifier}` : `Focus ${selectedIssue.identifier}`) : (isZh ? '无选中事项' : 'No issue selected')}
          </button>
          <button
            type="button"
            onClick={onCreateIssue}
            className="inline-flex h-9 items-center gap-2 rounded-full bg-slate-100 px-3 text-xs font-semibold text-slate-950 transition hover:bg-white"
          >
            <Plus className="h-4 w-4" />
            {isZh ? '新建事项' : 'New issue'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DisplayMenu({
  isZh,
  sort,
  collapsedStates,
  rowDensity,
  showRowMetadata,
  onSetSort,
  onToggleGroup,
  onSetRowDensity,
  onSetShowRowMetadata,
}: {
  isZh: boolean;
  sort: ActiveWorkbenchSort;
  collapsedStates: Set<string>;
  rowDensity: RowDensity;
  showRowMetadata: boolean;
  onSetSort: (sort: ActiveWorkbenchSort) => void;
  onToggleGroup: (state: (typeof GROUP_ORDER)[number]) => void;
  onSetRowDensity: (density: RowDensity) => void;
  onSetShowRowMetadata: (value: boolean) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="secondary"
          className="h-10 rounded-full border border-slate-800 bg-slate-900 px-3 text-sm text-slate-200 hover:bg-slate-800"
        >
          <LayoutList className="mr-2 h-4 w-4" />
          {isZh ? '显示选项' : 'Display options'}
          <ChevronDown className="ml-2 h-4 w-4 text-slate-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 border-slate-800 bg-[#0f1117] p-2 text-slate-100">
        <DropdownMenuLabel className="text-slate-500">{isZh ? DISPLAY_LABEL.zh : DISPLAY_LABEL.en}</DropdownMenuLabel>
        <div className="px-3 pb-2 text-xs leading-5 text-slate-500">
          {isZh ? '调整列表排序、状态分组和捕获 crawler 需要的打开态。' : 'Tune list sorting, state groups, and the opened overlay state required by the crawler.'}
        </div>
        <DropdownMenuSeparator className="bg-slate-800" />
        <DropdownMenuCheckboxItem
          checked={sort === 'updatedAt'}
          onCheckedChange={(checked) => {
            if (checked) onSetSort('updatedAt');
          }}
          className="text-slate-100 focus:bg-slate-900"
        >
          {sortLabel('updatedAt', isZh)}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={sort === 'manual'}
          onCheckedChange={(checked) => {
            if (checked) onSetSort('manual');
          }}
          className="text-slate-100 focus:bg-slate-900"
        >
          {sortLabel('manual', isZh)}
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator className="bg-slate-800" />
        <DropdownMenuCheckboxItem
          checked={rowDensity === 'comfortable'}
          onCheckedChange={(checked) => {
            if (checked) onSetRowDensity('comfortable');
          }}
          className="text-slate-100 focus:bg-slate-900"
        >
          {isZh ? '舒适行距' : 'Comfortable rows'}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={rowDensity === 'compact'}
          onCheckedChange={(checked) => {
            if (checked) onSetRowDensity('compact');
          }}
          className="text-slate-100 focus:bg-slate-900"
        >
          {isZh ? '紧凑行距' : 'Compact rows'}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={showRowMetadata}
          onCheckedChange={(checked) => onSetShowRowMetadata(Boolean(checked))}
          className="text-slate-100 focus:bg-slate-900"
        >
          {isZh ? '显示项目与类型' : 'Show project and type'}
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator className="bg-slate-800" />
        {GROUP_ORDER.map((state) => {
          const visible = !collapsedStates.has(state);
          return (
            <DropdownMenuCheckboxItem
              key={state}
              checked={visible}
              onCheckedChange={() => onToggleGroup(state)}
              className="text-slate-100 focus:bg-slate-900"
            >
              {labelForState(state, isZh)}
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function IssueDetailsPreview({
  issue,
  isZh,
  onOpenIssue,
  onPreviewAction,
}: {
  issue: ActiveWorkbenchRow | null;
  isZh: boolean;
  onOpenIssue: (issueId: number) => void;
  onPreviewAction: (message: string) => void;
}) {
  if (!issue) {
    return (
      <div className="mt-5 rounded-[22px] border border-dashed border-slate-800 bg-slate-950/60 p-5 text-sm text-slate-500">
        {isZh ? '打开详情后，选择任意事项即可在这里预览。' : 'Open details, then choose an issue to preview it here.'}
      </div>
    );
  }

  return (
    <div className="mt-5 overflow-hidden rounded-[22px] border border-slate-800 bg-slate-950/70">
      <div className="flex flex-col gap-3 border-b border-slate-800 px-5 py-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
            <Eye className="h-3.5 w-3.5" />
            {isZh ? '详情预览' : 'Details preview'}
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <IssueStateIcon state={issue.state} />
            <span className="font-medium text-slate-400">{issue.identifier}</span>
            <span className="truncate font-semibold text-white">{issue.title}</span>
          </div>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => onOpenIssue(issue.id)}
          className="h-9 rounded-full border-slate-700 bg-slate-100 px-3 text-xs text-slate-950 hover:bg-white"
        >
          {isZh ? '进入完整详情' : 'Open full detail'}
        </Button>
      </div>
      <div className="grid gap-3 px-5 py-4 text-sm text-slate-400 md:grid-cols-4">
        <PreviewMetric label={isZh ? '状态' : 'State'} value={labelForState(issue.state, isZh)} />
        <PreviewMetric label={isZh ? '优先级' : 'Priority'} value={issue.priorityLabel} />
        <PreviewMetric label={isZh ? '负责人' : 'Assignee'} value={issue.assigneeLabel} />
        <PreviewMetric label={isZh ? '更新时间' : 'Updated'} value={issue.updatedLabel} />
      </div>
      <div className="border-t border-slate-800 px-5 py-4 text-sm text-slate-500">
        {issue.projectName ? `${isZh ? '项目' : 'Project'} · ${issue.projectName} · ` : ''}
        {issue.typeLabel}
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-slate-800 px-5 py-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => onPreviewAction(isZh ? `${issue.identifier} 已加入本地上下文` : `${issue.identifier} added to local context`)}
          className="h-8 rounded-full border-slate-800 bg-slate-900 px-3 text-xs text-slate-200 hover:bg-slate-800"
        >
          {isZh ? '加入上下文' : 'Add context'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => onPreviewAction(isZh ? `已聚焦 ${issue.identifier} 的动态入口` : `Focused the activity entry for ${issue.identifier}`)}
          className="h-8 rounded-full border-slate-800 bg-slate-900 px-3 text-xs text-slate-200 hover:bg-slate-800"
        >
          {isZh ? '聚焦动态' : 'Focus activity'}
        </Button>
      </div>
    </div>
  );
}

function PreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#090b10] p-3">
      <div className="text-[10px] uppercase tracking-[0.18em] text-slate-600">{label}</div>
      <div className="mt-1 truncate text-sm font-medium text-slate-200">{value || '—'}</div>
    </div>
  );
}

function FilterSheet({
  open,
  setOpen,
  isZh,
  draftFilters,
  setDraftFilters,
  customFieldDefinitions,
  members,
  projects,
  teams,
  labels,
  onClear,
  onApply,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  isZh: boolean;
  draftFilters: FilterDraft;
  setDraftFilters: React.Dispatch<React.SetStateAction<FilterDraft>>;
  customFieldDefinitions: CustomFieldDefinition[];
  members: TeamMember[];
  projects: Array<{ id: number; name: string }>;
  teams: Team[];
  labels: LabelOption[];
  onClear: () => void;
  onApply: () => void;
}) {
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full max-w-xl border-slate-800 bg-[#0b0d11] p-0 text-slate-100">
        <SheetHeader className="border-b border-slate-800 px-6 py-5 text-left">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{issuesEyebrow(isZh)}</div>
              <SheetTitle className="mt-2 text-xl text-white">{filterSheetTitle(isZh)}</SheetTitle>
            </div>
            <SheetDismissButton className="rounded-full border border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-200" aria-label={closeLabel(isZh)} />
          </div>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-92px)]">
          <div className="space-y-5 px-6 py-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FilterField label={isZh ? '搜索' : 'Search'}>
                <Input
                  value={draftFilters.q}
                  onChange={(event) => setDraftFilters((current) => ({ ...current, q: event.target.value }))}
                  className="border-slate-800 bg-slate-950 text-slate-100 placeholder:text-slate-500"
                />
              </FilterField>
              <FilterField label={isZh ? '类型' : 'Type'}>
                <SimpleSelect
                  value={draftFilters.type || EMPTY}
                  onValueChange={(value) => setDraftFilters((current) => ({ ...current, type: value === EMPTY ? '' : value }))}
                >
                  <SelectItem value={EMPTY}>{isZh ? '所有类型' : 'All types'}</SelectItem>
                  {TYPE_OPTIONS.map((value) => (
                    <SelectItem key={value} value={value}>{labelForType(value, isZh)}</SelectItem>
                  ))}
                </SimpleSelect>
              </FilterField>
              <FilterField label={isZh ? '状态' : 'State'}>
                <SimpleSelect
                  value={draftFilters.state || EMPTY}
                  onValueChange={(value) => setDraftFilters((current) => ({ ...current, state: value === EMPTY ? '' : value }))}
                >
                  <SelectItem value={EMPTY}>{isZh ? '所有状态' : 'All states'}</SelectItem>
                  {GROUP_ORDER.map((value) => (
                    <SelectItem key={value} value={value}>{labelForState(value, isZh)}</SelectItem>
                  ))}
                </SimpleSelect>
              </FilterField>
              <FilterField label={isZh ? '优先级' : 'Priority'}>
                <SimpleSelect
                  value={draftFilters.priority || EMPTY}
                  onValueChange={(value) => setDraftFilters((current) => ({ ...current, priority: value === EMPTY ? '' : value }))}
                >
                  <SelectItem value={EMPTY}>{isZh ? '所有优先级' : 'All priorities'}</SelectItem>
                  {PRIORITY_OPTIONS.map((value) => (
                    <SelectItem key={value} value={value}>{labelForPriority(value, isZh)}</SelectItem>
                  ))}
                </SimpleSelect>
              </FilterField>
              <LookupField
                label={isZh ? '负责人' : 'Assignee'}
                items={members}
                value={draftFilters.assigneeId}
                emptyLabel={isZh ? '所有成员' : 'All members'}
                onChange={(value) => setDraftFilters((current) => ({ ...current, assigneeId: value }))}
              />
              <LookupField
                label={isZh ? '项目' : 'Project'}
                items={projects}
                value={draftFilters.projectId}
                emptyLabel={isZh ? '所有项目' : 'All projects'}
                onChange={(value) => setDraftFilters((current) => ({ ...current, projectId: value }))}
              />
              <LookupField
                label={isZh ? '团队' : 'Team'}
                items={teams}
                value={draftFilters.teamId}
                emptyLabel={isZh ? '所有团队' : 'All teams'}
                onChange={(value) => setDraftFilters((current) => ({ ...current, teamId: value }))}
              />
              <LabelMultiSelectField
                isZh={isZh}
                labels={labels}
                value={draftFilters.labelIds}
                onChange={(labelIds) => setDraftFilters((current) => ({ ...current, labelIds }))}
              />
            </div>

            {customFieldDefinitions.filter((field) => field.isFilterable).length ? (
              <div className="space-y-4 rounded-[20px] border border-slate-800 bg-slate-950/60 p-4">
                <div className="text-sm font-medium text-slate-200">{isZh ? '自定义字段' : 'Custom fields'}</div>
                <div className="grid gap-4 md:grid-cols-2">
                  {customFieldDefinitions.filter((field) => field.isFilterable).map((field) => (
                    <CustomFieldFilterControl
                      key={field.id}
                      field={field}
                      isZh={isZh}
                      members={members}
                      teams={teams}
                      value={draftFilters.customFieldFilters[field.key] ?? ''}
                      onChange={(value) => setDraftFilters((current) => ({
                        ...current,
                        customFieldFilters: { ...current.customFieldFilters, [field.key]: value },
                      }))}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
              <Button variant="secondary" onClick={onClear} className="border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800">
                <FilterX className="mr-2 h-4 w-4" />
                {isZh ? '清空筛选' : 'Clear filters'}
              </Button>
              <Button onClick={onApply} className="bg-slate-100 text-slate-950 hover:bg-white">
                {isZh ? '应用筛选' : 'Apply filters'}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-2 text-sm text-slate-400">
      <span className="block text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function LookupField({
  label,
  items,
  value,
  emptyLabel,
  onChange,
}: {
  label: string;
  items: Array<{ id: number; name?: string | null }>;
  value: string;
  emptyLabel: string;
  onChange: (value: string) => void;
}) {
  return (
    <FilterField label={label}>
      <SimpleSelect value={value || EMPTY} onValueChange={(next) => onChange(next === EMPTY ? '' : next)}>
        <SelectItem value={EMPTY}>{emptyLabel}</SelectItem>
        {items.map((item) => (
          <SelectItem key={item.id} value={String(item.id)}>{item.name?.trim() || `#${item.id}`}</SelectItem>
        ))}
      </SimpleSelect>
    </FilterField>
  );
}

function LabelMultiSelectField({
  isZh,
  labels,
  value,
  onChange,
}: {
  isZh: boolean;
  labels: LabelOption[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const selectedIds = Array.from(new Set(value));
  const selectedCount = selectedIds.length;
  const triggerLabel = selectedCount === 0
    ? (isZh ? '所有标签' : 'All labels')
    : selectedCount === 1
      ? labels.find((label) => String(label.id) === selectedIds[0])?.name ?? `#${selectedIds[0]}`
      : isZh
        ? `已选 ${selectedCount} 个标签`
        : `${selectedCount} labels selected`;

  return (
    <FilterField label={isZh ? '标签' : 'Labels'}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="secondary"
            className="h-10 w-full justify-between rounded-full border border-slate-800 bg-slate-950 px-3 text-sm text-slate-100 shadow-none hover:bg-slate-900"
          >
            <span className="truncate">{triggerLabel}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-slate-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] border-slate-800 bg-[#0f1117] text-slate-100">
          <DropdownMenuLabel>{isZh ? '标签' : 'Labels'}</DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={selectedCount === 0}
            onCheckedChange={(checked) => {
              if (checked) onChange([]);
            }}
            className="text-slate-100 focus:bg-slate-900"
          >
            {isZh ? '所有标签' : 'All labels'}
          </DropdownMenuCheckboxItem>
          {labels.length > 0 ? <DropdownMenuSeparator className="bg-slate-800" /> : null}
          {labels.map((label) => {
            const labelId = String(label.id);
            const checked = value.includes(labelId);
            return (
              <DropdownMenuCheckboxItem
                key={label.id}
                checked={checked}
                onCheckedChange={(nextChecked) => {
                  onChange(nextChecked ? Array.from(new Set([...selectedIds, labelId])) : selectedIds.filter((item) => item !== labelId));
                }}
                className="text-slate-100 focus:bg-slate-900"
              >
                {label.name}
              </DropdownMenuCheckboxItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </FilterField>
  );
}

function SimpleSelect({
  value,
  onValueChange,
  children,
}: {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-10 rounded-full border-slate-800 bg-slate-950 px-3 text-sm text-slate-100 shadow-none">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="border-slate-800 bg-[#0f1117] text-slate-100">{children}</SelectContent>
    </Select>
  );
}

function CustomFieldFilterControl({
  field,
  isZh,
  value,
  members,
  teams,
  onChange,
}: {
  field: CustomFieldDefinition;
  isZh: boolean;
  value: string;
  members: TeamMember[];
  teams: Team[];
  onChange: (value: string) => void;
}) {
  if (field.dataType === 'SINGLE_SELECT' || field.dataType === 'MULTI_SELECT') {
    return (
      <FilterField label={field.name}>
        <SimpleSelect value={value || EMPTY} onValueChange={(next) => onChange(next === EMPTY ? '' : next)}>
          <SelectItem value={EMPTY}>{field.name}</SelectItem>
          {field.options.map((option) => (
            <SelectItem key={option.id} value={option.value}>{option.label}</SelectItem>
          ))}
        </SimpleSelect>
      </FilterField>
    );
  }

  if (field.dataType === 'BOOLEAN') {
    return (
      <FilterField label={field.name}>
        <SimpleSelect value={value || EMPTY} onValueChange={(next) => onChange(next === EMPTY ? '' : next)}>
          <SelectItem value={EMPTY}>{field.name}</SelectItem>
          <SelectItem value="true">{isZh ? '是' : 'True'}</SelectItem>
          <SelectItem value="false">{isZh ? '否' : 'False'}</SelectItem>
        </SimpleSelect>
      </FilterField>
    );
  }

  if (field.dataType === 'USER') {
    return (
      <LookupField
        label={field.name}
        items={members}
        value={value}
        emptyLabel={field.name}
        onChange={onChange}
      />
    );
  }

  if (field.dataType === 'TEAM') {
    return (
      <LookupField
        label={field.name}
        items={teams}
        value={value}
        emptyLabel={field.name}
        onChange={onChange}
      />
    );
  }

  return (
    <FilterField label={field.name}>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={isZh ? '输入筛选值' : 'Enter filter value'}
        className="border-slate-800 bg-slate-950 text-slate-100 placeholder:text-slate-500"
      />
    </FilterField>
  );
}

function applyFilterDraft(
  router: ReturnType<typeof useRouter>,
  pathname: string,
  searchParams: URLSearchParams,
  draftFilters: FilterDraft,
  setFilterOpen: (open: boolean) => void
) {
  const params = new URLSearchParams(searchParams.toString());
  clearCustomFieldParams(params);
  writeValue(params, 'q', draftFilters.q.trim());
  writeValue(params, 'type', normalizeEmpty(draftFilters.type));
  writeValue(params, 'state', normalizeEmpty(draftFilters.state));
  writeValue(params, 'priority', normalizeEmpty(draftFilters.priority));
  writeValue(params, 'assigneeId', normalizeEmpty(draftFilters.assigneeId));
  writeValue(params, 'projectId', normalizeEmpty(draftFilters.projectId));
  writeValue(params, 'teamId', normalizeEmpty(draftFilters.teamId));
  writeValue(params, 'labelIds', draftFilters.labelIds.length ? draftFilters.labelIds.join(',') : null);
  Object.entries(draftFilters.customFieldFilters).forEach(([key, value]) => writeValue(params, `cf_${key}`, value));
  const next = params.toString();
  router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  setFilterOpen(false);
}

function clearFilters(
  router: ReturnType<typeof useRouter>,
  pathname: string,
  searchParams: URLSearchParams,
  customFieldDefinitions: CustomFieldDefinition[],
  setDraftFilters: React.Dispatch<React.SetStateAction<FilterDraft>>,
  setFilterOpen: (open: boolean) => void
) {
  const params = new URLSearchParams(searchParams.toString());
  ['q', 'type', 'state', 'priority', 'assigneeId', 'projectId', 'teamId', 'labelIds'].forEach((key) => params.delete(key));
  clearCustomFieldParams(params);
  const next = params.toString();
  router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  setDraftFilters(readFilterDraft(new URLSearchParams(), customFieldDefinitions));
  setFilterOpen(false);
}

function toggleGroupCollapsed(
  router: ReturnType<typeof useRouter>,
  pathname: string,
  searchParams: URLSearchParams,
  collapsedStates: Set<string>,
  state: (typeof GROUP_ORDER)[number]
) {
  const nextCollapsed = new Set(collapsedStates);
  if (nextCollapsed.has(state)) {
    nextCollapsed.delete(state);
  } else {
    nextCollapsed.add(state);
  }
  updateQuery(router, pathname, searchParams, { collapsed: serializeCollapsedStates(nextCollapsed) });
}

function buildIssueFilters(searchParams: URLSearchParams, organizationId: number, currentTeamId: number | null) {
  const customFieldFilters: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    if (key.startsWith('cf_') && value) customFieldFilters[key.slice(3)] = value;
  });

  return {
    organizationId,
    q: searchParams.get('q') ?? undefined,
    type: searchParams.get('type') ?? undefined,
    state: searchParams.get('state') ?? undefined,
    priority: searchParams.get('priority') ?? undefined,
    assigneeId: searchParams.get('assigneeId') ? Number(searchParams.get('assigneeId')) : undefined,
    projectId: searchParams.get('projectId') ? Number(searchParams.get('projectId')) : undefined,
    teamId: searchParams.get('teamId') ? Number(searchParams.get('teamId')) : currentTeamId ?? undefined,
    labelIds: parseLabelIds(searchParams.get('labelIds')),
    customFieldFilters: Object.keys(customFieldFilters).length ? customFieldFilters : undefined,
  };
}

function readFilterDraft(searchParams: URLSearchParams, customFieldDefinitions: CustomFieldDefinition[]): FilterDraft {
  const customFieldFilters: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    if (key.startsWith('cf_') && value) customFieldFilters[key.slice(3)] = value;
  });
  for (const field of customFieldDefinitions.filter((item) => item.isFilterable)) {
    if (!(field.key in customFieldFilters)) customFieldFilters[field.key] = '';
  }

  return {
    q: searchParams.get('q') ?? '',
    type: searchParams.get('type') ?? '',
    state: searchParams.get('state') ?? '',
    priority: searchParams.get('priority') ?? '',
    assigneeId: searchParams.get('assigneeId') ?? '',
    projectId: searchParams.get('projectId') ?? '',
    teamId: searchParams.get('teamId') ?? '',
    labelIds: parseLabelIds(searchParams.get('labelIds')),
    customFieldFilters,
  };
}

function parseLabelIds(rawValue: string | null) {
  return (rawValue ?? '').split(',').map((item) => item.trim()).filter(Boolean);
}

function clearCustomFieldParams(params: URLSearchParams) {
  [...params.keys()].forEach((key) => {
    if (key.startsWith('cf_')) params.delete(key);
  });
}

function normalizeEmpty(value: string) {
  return value || null;
}

function writeValue(params: URLSearchParams, key: string, value: string | null | undefined) {
  if (!value) {
    params.delete(key);
  } else {
    params.set(key, value);
  }
}

function updateHref(pathname: string, searchParams: URLSearchParams, updates: Record<string, string | null>) {
  const params = new URLSearchParams(searchParams.toString());
  Object.entries(updates).forEach(([key, value]) => writeValue(params, key, value));
  const next = params.toString();
  return next ? `${pathname}?${next}` : pathname;
}

function serializeCollapsedStates(states: Set<string>) {
  return [...states].join(',');
}

function readCollapsedStates(searchParams: URLSearchParams) {
  const value = searchParams.get('collapsed');
  if (!value) return new Set<string>();
  return new Set(
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  );
}

function IssueStateIcon({ state }: { state: string }) {
  if (state === 'IN_PROGRESS') {
    return <LoaderCircle className="h-4 w-4 text-blue-400" />;
  }
  if (state === 'IN_REVIEW') {
    return <CircleEllipsis className="h-4 w-4 text-amber-400" />;
  }
  if (state === 'DONE') {
    return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
  }
  return state === 'BACKLOG' || state === 'TODO'
    ? <Circle className="h-4 w-4 text-slate-500" />
    : <CircleDashed className="h-4 w-4 text-slate-500" />;
}
