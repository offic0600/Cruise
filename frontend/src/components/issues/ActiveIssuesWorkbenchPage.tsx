'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, ChevronDown, Circle, CircleDashed, CircleEllipsis, FilterX, LoaderCircle, Maximize2, Search, SlidersHorizontal, X } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { useCurrentWorkspace } from '@/components/providers/WorkspaceProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDismissButton, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useI18n } from '@/i18n/useI18n';
import type { CustomFieldDefinition, Team } from '@/lib/api';
import { issueDetailPath, issueViewFromTeamRoute, teamIssuesPath } from '@/lib/routes';
import { useIssueWorkspace } from '@/lib/query/issues';
import {
  activeFilterSummary,
  buildActiveWorkbenchRows,
  filterButtonLabel,
  filterSummaryLabel,
  groupBelongsToView,
  labelForPriority,
  labelForState,
  labelForType,
  type ActiveWorkbenchSort,
  type FilterDraft,
  type FilterSummaryContext,
} from './issue-workbench';
import { normalizeIssueView, type IssueView } from './issue-view';

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

type ActiveTab = {
  id: Exclude<IssueView, 'all'>;
  label: string;
  count: number;
};


function isFilterActive(filters: FilterDraft) {
  return activeFilterSummary(filters, false).length > 0;
}

function filterStatusText(filters: FilterDraft, isZh: boolean) {
  return filterSummaryLabel(filters, isZh);
}

function searchStatusText(searchQuery: string, filters: FilterDraft, isZh: boolean) {
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
  return tokens.length > 0 ? tokens.join(' · ') : isZh ? '未设置筛选条件' : 'No filters applied';
}

function noteText(filters: FilterDraft, isZh: boolean) {
  const tokens = activeFilterSummary(filters, isZh);
  if (tokens.length === 0) {
    return isZh
      ? '本轮把 team-active 顶部搜索框接到真实 q 查询参数，继续沿旧 issues 页的 URL 状态主线推进。'
      : 'The team-active toolbar now writes into the real q query param, keeping the workbench aligned with the legacy issues URL state.';
  }

  return isZh
    ? `当前筛选：${tokens.join(' · ')}；下一轮可继续迁移 Display/分组与更多 Linear 工具栏细节。`
    : `Active filters: ${tokens.join(' · ')}. Next, move display/grouping and more Linear toolbar details.`;
}

function buildWorkbenchDescription(isZh: boolean) {
  return isZh
    ? 'P0 页面壳子已接通真实 issue rows、view tabs、search 查询、高级筛选与 URL 驱动的分组折叠状态，后续继续迁移排序和更细的交互。'
    : 'The P0 workbench now uses real issue rows, view tabs, live search, advanced filters, and URL-backed grouping collapse state; sorting and finer interactions come next.';
}

export function collapsedSummaryLabel(collapsedStates: Set<string>, isZh: boolean) {
  if (collapsedStates.size === 0) {
    return isZh ? '所有状态分组当前均已展开。' : 'All state groups are currently expanded.';
  }

  const labels = GROUP_ORDER.filter((state) => collapsedStates.has(state)).map((state) => labelForState(state, isZh));
  return isZh ? `已折叠分组：${labels.join('、')}` : `Collapsed groups: ${labels.join(', ')}`;
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
  const currentSort = sortLabel(sort, isZh);
  return [
    isZh ? `1. 当前先用 URL 参数保留排序意图（${currentSort}），下一轮再接真实排序逻辑。` : `1. Keep sort intent in the URL first (${currentSort}), then wire the real sort behavior next.`,
    isZh ? '2. 继续补齐顶部工具栏与 issue row 的 Linear 对标细节。' : '2. Continue tightening toolbar and issue-row fidelity against Linear.',
    isZh ? '3. 逐步接入更真实的筛选文案与字段级交互。' : '3. Gradually wire richer filter copy and field-level interactions.',
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

function updateQuery(router: ReturnType<typeof useRouter>, pathname: string, searchParams: URLSearchParams, updates: Record<string, string | null>) {
  const params = new URLSearchParams(searchParams.toString());
  Object.entries(updates).forEach(([key, value]) => {
    if (value && value.trim()) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
  });
  const next = params.toString();
  router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
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
  const currentView = issueViewFromTeamRoute(pathname) ?? normalizeIssueView(searchParams.get('view'));
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
  const [draftFilters, setDraftFilters] = useState<FilterDraft>(() => readFilterDraft(searchParams, []));
  const filterSummaryContext = useMemo<FilterSummaryContext>(
    () => ({
      assignees: members.map((member) => ({ id: String(member.id), name: member.name })),
      projects: projects.map((project) => ({ id: String(project.id), name: project.name })),
      teams: teams.map((team) => ({ id: String(team.id), name: team.name })),
      labels: labels.map((label) => ({ id: String(label.id), name: label.name })),
    }),
    [labels, members, projects, teams]
  );

  useEffect(() => {
    setSearchDraft((current) => syncSearchDraft(current, searchParams));
    setDraftFilters(readFilterDraft(searchParams, customFieldDefinitions));
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

  const issueCounts = useMemo(() => {
    return {
      active: issues.filter((issue) => issue.stateCategory === 'ACTIVE' || issue.stateCategory === 'REVIEW').length,
      backlog: issues.filter((issue) => issue.stateCategory === 'BACKLOG').length,
      done: issues.filter((issue) => issue.stateCategory === 'COMPLETED').length,
    } satisfies Record<Exclude<IssueView, 'all'>, number>;
  }, [issues]);

  const activeTabs = useMemo<ActiveTab[]>(
    () => [
      { id: 'active', label: 'Active', count: issueCounts.active },
      { id: 'backlog', label: 'Backlog', count: issueCounts.backlog },
      { id: 'done', label: 'Completed', count: issueCounts.done },
    ],
    [issueCounts]
  );

  const openIssue = (issueId: number) => {
    const issue = issues.find((item) => item.id === issueId);
    if (!issue || !currentOrganizationSlug) return;
    router.push(issueDetailPath(currentOrganizationSlug, issue));
  };

  return (
    <AppLayout>
      <div className="space-y-5 px-3 py-4 text-slate-100 sm:px-5 lg:px-6">
        <section className="overflow-hidden rounded-[28px] border border-slate-800 bg-[#08090c] shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="border-b border-slate-800/90 px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-slate-400">
                  {currentOrganization?.name ?? 'Workspace'} / {currentTeam?.name ?? 'Team'}
                </div>
                <div className="space-y-1">
                  <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-white">Active issues</h1>
                  <p className="max-w-2xl text-sm text-slate-400">{buildWorkbenchDescription(isZh)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {activeTabs.map((tab) => {
                    const active = currentView === tab.id || (currentView === 'all' && tab.id === 'active');
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
                        <span className="ml-2 rounded-full bg-black/10 px-1.5 py-0.5 text-[11px] text-inherit">{tab.count}</span>
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
                    placeholder={isZh ? '搜索标题或编号' : 'Search title or identifier'}
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
                  {filterButtonLabel(draftFilters, isZh, filterSummaryContext)}
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
                  collapsedStates={collapsedStates}
                  onToggleGroup={(state) => toggleGroupCollapsed(router, pathname, searchParams, collapsedStates, state)}
                />
              </div>
            </div>
          </div>

          <div className="border-b border-slate-800/90 px-5 py-3 sm:px-6">
            <div className="grid grid-cols-[minmax(0,1fr)_140px_120px_72px] items-center gap-4 text-[11px] uppercase tracking-[0.22em] text-slate-500">
              <span>Issue</span>
              <span>Assignee</span>
              <span>Priority</span>
              <span className="text-right">Updated</span>
            </div>
          </div>

          <div className="divide-y divide-slate-800/80">
            {issuesQuery.isLoading ? (
              <div className="px-5 py-8 text-sm text-slate-500 sm:px-6">Loading active issues…</div>
            ) : workbenchRows.length === 0 ? (
              <div className="px-5 py-8 text-sm text-slate-500 sm:px-6">{noResultsText(searchQuery, draftFilters, isZh)}</div>
            ) : groupedRows.every((group) => collapsedStates.has(group.state)) ? (
              <div className="px-5 py-8 text-sm text-slate-500 sm:px-6">
                {isZh ? '当前视图的所有状态分组都已折叠。可在 Display 中重新展开。' : 'All state groups in this view are collapsed. Re-open them from Display.'}
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
                          onClick={() => openIssue(issue.id)}
                          className="grid w-full grid-cols-[minmax(0,1fr)_140px_120px_72px] items-center gap-4 px-5 py-3 text-left transition hover:bg-slate-900/70 sm:px-6"
                        >
                          <div className="min-w-0 space-y-1.5">
                            <div className="flex items-center gap-3 text-sm">
                              <span className="inline-flex h-5 w-5 items-center justify-center text-slate-400">
                                <IssueStateIcon state={issue.state} />
                              </span>
                              <span className="text-[13px] font-medium text-slate-500">{issue.identifier}</span>
                              <span className="truncate text-[14px] font-medium text-slate-100">{issue.title}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 pl-8 text-[12px] text-slate-500">
                              {issue.projectName ? <span>{issue.projectName}</span> : null}
                              {issue.projectName ? <span>•</span> : null}
                              <span>{issue.typeLabel}</span>
                            </div>
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
                <div className="text-sm font-medium text-slate-200">Workbench notes</div>
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
          </div>

          <aside className="rounded-[24px] border border-slate-800 bg-[#0b0d11] p-5">
            <div className="text-sm font-medium text-slate-200">{isZh ? '下一步挂接点' : 'Next integration points'}</div>
            <div className="mt-2 text-xs text-slate-500">{filterSummaryLabel(draftFilters, isZh, filterSummaryContext)}</div>
            <div className="mt-2 text-xs text-slate-500">{collapsedSummaryLabel(collapsedStates, isZh)}</div>
            <div className="mt-2 text-xs text-slate-500">{sortSummaryLabel(sort, isZh)}</div>
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
    </AppLayout>
  );
}

function DisplayMenu({
  isZh,
  collapsedStates,
  onToggleGroup,
}: {
  isZh: boolean;
  collapsedStates: Set<string>;
  onToggleGroup: (state: (typeof GROUP_ORDER)[number]) => void;
}) {
  return (
    <div className="rounded-full border border-slate-800 bg-slate-900 px-1 py-1 text-sm text-slate-200">
      <div className="flex items-center gap-1">
        <span className="px-2 text-sm text-slate-200">{isZh ? DISPLAY_LABEL.zh : DISPLAY_LABEL.en}</span>
        {GROUP_ORDER.map((state) => {
          const collapsed = collapsedStates.has(state);
          return (
            <Button
              key={state}
              type="button"
              variant="ghost"
              onClick={() => onToggleGroup(state)}
              className={`h-8 rounded-full px-2.5 text-[12px] ${
                collapsed
                  ? 'text-slate-500 hover:bg-slate-800 hover:text-slate-200'
                  : 'bg-slate-100 text-slate-950 hover:bg-white'
              }`}
            >
              {labelForState(state, isZh)}
            </Button>
          );
        })}
      </div>
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
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Issues</div>
              <SheetTitle className="mt-2 text-xl text-white">{isZh ? '高级筛选' : 'Advanced filter'}</SheetTitle>
            </div>
            <SheetDismissButton className="rounded-full border border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-200" aria-label={isZh ? '关闭' : 'Close'} />
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
