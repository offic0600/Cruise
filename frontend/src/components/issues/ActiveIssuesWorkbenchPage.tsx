'use client';

import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  CircleDashed,
  CircleEllipsis,
  FilterX,
  LayoutList,
  LoaderCircle,
  Plus,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import IssueComposer from '@/components/issues/IssueComposer';
import { useCurrentWorkspace } from '@/components/providers/WorkspaceProvider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDismissButton, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useI18n } from '@/i18n/useI18n';
import type { CustomFieldDefinition, Issue, Team } from '@/lib/api';
import { issueDetailPath, issueViewFromTeamRoute, teamIssuesPath } from '@/lib/routes';
import { useIssueWorkspace } from '@/lib/query/issues';
import {
  activeFilterSummary,
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

type RowDensity = 'comfortable' | 'compact';

type ActiveTab = {
  id: IssueView;
  label: string;
  count: number;
};

type IssueGroup = {
  state: (typeof GROUP_ORDER)[number];
  label: string;
  items: Issue[];
};

const EMPTY = '__empty__';
const GROUP_ORDER = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELED'] as const;
const TYPE_OPTIONS = ['FEATURE', 'TASK', 'BUG', 'TECH_DEBT'] as const;
const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
const LIST_GRID_COLUMNS = 'grid-cols-[28px_34px_78px_34px_minmax(0,1fr)_76px]';

const VIEW_LABELS = {
  all: { en: 'All issues', zh: 'All issues' },
  active: { en: 'Active', zh: 'Active' },
  backlog: { en: 'Backlog', zh: 'Backlog' },
  done: { en: 'Completed', zh: 'Completed' },
} as const;

const COLUMN_LABELS = {
  identifier: { en: 'ID', zh: 'ID' },
  issue: { en: 'Issue', zh: 'Issue' },
  updated: { en: 'Created', zh: 'Created' },
} as const;

function viewLabel(view: IssueView, isZh: boolean) {
  return isZh ? VIEW_LABELS[view].zh : VIEW_LABELS[view].en;
}

function columnLabel(column: keyof typeof COLUMN_LABELS, isZh: boolean) {
  return isZh ? COLUMN_LABELS[column].zh : COLUMN_LABELS[column].en;
}

function teamFallback(isZh: boolean) {
  return 'Team';
}

function searchPlaceholder(isZh: boolean) {
  return 'Search title or identifier…';
}

function filterSheetTitle(isZh: boolean) {
  return 'Advanced filter';
}

function closeLabel(isZh: boolean) {
  return 'Close';
}

function densityLabel(density: RowDensity, isZh: boolean) {
  return density === 'compact' ? 'Compact' : 'Comfortable';
}

function sortLabel(sort: ActiveWorkbenchSort, isZh: boolean) {
  return sort === 'manual' ? 'Manual' : 'Last updated';
}

function isFilterActive(filters: FilterDraft) {
  return activeFilterSummary(filters, false).length > 0;
}

function formatRelativeDate(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'zh-CN', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function priorityTone(priority: Issue['priority']) {
  switch (priority) {
    case 'URGENT':
      return 'text-rose-600';
    case 'HIGH':
      return 'text-orange-600';
    case 'MEDIUM':
      return 'text-amber-600';
    case 'LOW':
      return 'text-slate-500';
    default:
      return 'text-slate-400';
  }
}

function issueTypeDotColor(type: Issue['type']) {
  switch (type) {
    case 'FEATURE':
      return '#bb87fc';
    case 'BUG':
      return '#eb5757';
    case 'TECH_DEBT':
      return '#4ea7fc';
    default:
      return '#6b7280';
  }
}

function groupHeaderTitle(state: (typeof GROUP_ORDER)[number], count: number, isZh: boolean) {
  return `${labelForState(state, isZh)}`;
}

function groupHeaderMeta(count: number, isZh: boolean) {
  return `${count} issues`;
}

function assigneeInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((token) => token[0]?.toUpperCase() ?? '')
    .join('');
}

function assigneeTone(name: string) {
  const palette = [
    'bg-[#e8f0ff] text-[#4263eb]',
    'bg-[#eef8f1] text-[#228b5a]',
    'bg-[#fff2e8] text-[#c96a1a]',
    'bg-[#f4ecff] text-[#7c4dff]',
  ];
  const seed = name.split('').reduce((total, char) => total + char.charCodeAt(0), 0);
  return palette[seed % palette.length] ?? palette[0];
}

export function searchStatusText(searchQuery: string, filters: FilterDraft, isZh: boolean) {
  const filterText = filterSummaryLabel(filters, isZh);
  if (!searchQuery) {
    return `Search and filter state is preserved in the URL. ${filterText}`;
  }
  return `Current query: ${searchQuery}. ${filterText}`;
}

export function noResultsText(searchQuery: string, filters: FilterDraft, isZh: boolean) {
  const tokens = activeFilterSummary(filters, isZh);
  if (searchQuery && tokens.length > 0) {
    return `No issues match "${searchQuery}" with the active filters.`;
  }
  if (searchQuery) {
    return `No issues match "${searchQuery}".`;
  }
  if (tokens.length > 0) {
    return 'No issues match the active filters.';
  }
  return 'No issues found for this view yet.';
}

export function pageTitle(view: IssueView, isZh: boolean) {
  if (view === 'active') return 'Active issues';
  return viewLabel(view, isZh);
}

export function loadingText(view: IssueView, isZh: boolean) {
  if (view === 'all') return 'Loading all issues…';
  if (view === 'backlog') return 'Loading backlog…';
  if (view === 'done') return 'Loading completed issues…';
  return 'Loading active issues…';
}

export function noteText(filters: FilterDraft, isZh: boolean) {
  const summary = filterSummaryLabel(filters, isZh);
  if (activeFilterSummary(filters, false).length === 0) {
    return 'The page shell, primary view switching, and key feedback states now match the capture; next, wire more real toolbar actions.';
  }
  return `Active filters: ${summary} The shell and key feedback states are closed out; next, wire more real toolbar actions.`;
}

export function sortSummaryLabel(sort: ActiveWorkbenchSort, isZh: boolean) {
  return `Current sort: ${sortLabel(sort, false)}`;
}

function readSortValue(searchParams: URLSearchParams): ActiveWorkbenchSort {
  return searchParams.get('sort') === 'manual' ? 'manual' : 'updatedAt';
}

function updateQuery(
  router: ReturnType<typeof useRouter>,
  pathname: string,
  searchParams: URLSearchParams,
  updates: Record<string, string | null>
) {
  router.replace(updateHref(pathname, searchParams, updates), { scroll: false });
}

function toggleSort(
  router: ReturnType<typeof useRouter>,
  pathname: string,
  searchParams: URLSearchParams,
  sort: ActiveWorkbenchSort
) {
  updateQuery(router, pathname, searchParams, { sort: sort === 'updatedAt' ? 'manual' : null });
}

function setSort(
  router: ReturnType<typeof useRouter>,
  pathname: string,
  searchParams: URLSearchParams,
  sort: ActiveWorkbenchSort
) {
  updateQuery(router, pathname, searchParams, { sort: sort === 'manual' ? 'manual' : null });
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
  const isZh = false;
  const { currentTeam, currentOrganization, currentOrganizationSlug, organizationId, currentTeamId } = useCurrentWorkspace();
  const currentView = normalizeIssueView(issueViewFromTeamRoute(pathname) ?? searchParams.get('view'), DEFAULT_TEAM_ISSUES_VIEW);
  const [searchDraft, setSearchDraft] = useState(() => createSearchDraft(searchParams));
  const apiFilters = useMemo(
    () => buildIssueFilters(searchParams, organizationId ?? 1, currentTeamId),
    [currentTeamId, organizationId, searchParams]
  );
  const { issuesQuery, customFieldDefinitionsQuery, projectsQuery, teamsQuery, membersQuery, labelsQuery } = useIssueWorkspace(apiFilters);

  const issues = useMemo(() => issuesQuery.data ?? [], [issuesQuery.data]);
  const projects = useMemo(() => projectsQuery.data ?? [], [projectsQuery.data]);
  const teams = useMemo(() => (teamsQuery.data ?? []) as Team[], [teamsQuery.data]);
  const customFieldDefinitions = useMemo(
    () => (customFieldDefinitionsQuery.data ?? []).filter((field) => field.isActive),
    [customFieldDefinitionsQuery.data]
  );
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
        name: member.name?.trim() || 'Unassigned',
      })),
    [membersQuery.data]
  );

  const sort = readSortValue(searchParams);
  const collapsedStates = useMemo(() => readCollapsedStates(searchParams), [searchParams]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [createIssueOpen, setCreateIssueOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<FilterDraft>(() => readFilterDraft(searchParams, []));
  const [rowDensity, setRowDensity] = useState<RowDensity>(() => readRowDensity(searchParams));
  const [showRowMetadata, setShowRowMetadata] = useState(() => readShowRowMetadata(searchParams));

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
    setRowDensity(readRowDensity(searchParams));
    setShowRowMetadata(readShowRowMetadata(searchParams));
  }, [customFieldDefinitions, searchParams]);

  const visibleIssues = useMemo(() => {
    const scoped = issues.filter((issue) => groupBelongsToView(issue.state, currentView));
    if (sort === 'manual') return scoped;
    return [...scoped].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt) || b.id - a.id);
  }, [currentView, issues, sort]);

  const groupedIssues = useMemo<IssueGroup[]>(
    () =>
      GROUP_ORDER.map((state) => ({
        state,
        label: labelForState(state, isZh),
        items: visibleIssues.filter((issue) => issue.state === state),
      })),
    [isZh, visibleIssues]
  );

  const memberNameById = useMemo(() => new Map(members.map((member) => [member.id, member.name])), [members]);
  const projectNameById = useMemo(() => new Map(projects.map((project) => [project.id, project.name])), [projects]);

  const issueCounts = useMemo(
    () =>
      ({
        all: issues.length,
        active: issues.filter((issue) => issue.stateCategory === 'ACTIVE' || issue.stateCategory === 'REVIEW').length,
        backlog: issues.filter((issue) => issue.stateCategory === 'BACKLOG').length,
        done: issues.filter((issue) => issue.stateCategory === 'COMPLETED').length,
      }) satisfies Record<IssueView, number>,
    [issues]
  );

  const activeTabs = useMemo<ActiveTab[]>(
    () => [
      { id: 'all', label: viewLabel('all', isZh), count: issueCounts.all },
      { id: 'active', label: viewLabel('active', isZh), count: issueCounts.active },
      { id: 'backlog', label: viewLabel('backlog', isZh), count: issueCounts.backlog },
      { id: 'done', label: viewLabel('done', isZh), count: issueCounts.done },
    ],
    [isZh, issueCounts]
  );

  const createIssueParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set('type', 'TASK');
    params.set('state', currentView === 'backlog' ? 'BACKLOG' : currentView === 'done' ? 'DONE' : 'TODO');
    if (currentTeamId) params.set('teamId', String(currentTeamId));
    return params;
  }, [currentTeamId, currentView]);

  const activeListCount = groupedIssues.reduce(
    (total, group) => total + (collapsedStates.has(group.state) ? 0 : group.items.length),
    0
  );

  const openIssue = (issueId: number) => {
    const issue = issues.find((item) => item.id === issueId);
    if (!issue || !currentOrganizationSlug) return;
    router.push(issueDetailPath(currentOrganizationSlug, issue));
  };

  const shellName = currentTeam?.name ?? currentOrganization?.name ?? teamFallback(isZh);

  return (
    <AppLayout>
      <div className="px-3 py-3 sm:px-4 lg:px-5">
        <section className="overflow-hidden rounded-[12px] border border-[#e0e0e0] bg-[#fcfcfd] shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
          <div className="border-b border-[#e7e7e9] px-4 py-3 sm:px-5">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-[#8f95a3]">
                  <span>{shellName}</span>
                  <span className="text-[#c2c6d0]">/</span>
                  <span className="text-[#23252a]">{pageTitle(currentView, isZh)}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {activeTabs.map((tab) => {
                    const active = currentView === tab.id;
                    const tabHref =
                      currentOrganizationSlug && currentTeam?.key
                        ? updateHref(teamIssuesPath(currentOrganizationSlug, currentTeam.key, tab.id), searchParams, {})
                        : updateHref(pathname, searchParams, { view: tab.id });
                    return (
                      <Link
                        key={tab.id}
                        href={tabHref}
                        scroll={false}
                        aria-current={active ? 'page' : undefined}
                        className={[
                          'inline-flex h-8 items-center gap-2 rounded-[8px] border px-3 text-[13px] transition',
                          active
                            ? 'border-[#d7dafd] bg-[#eef0ff] font-medium text-[#3949ab]'
                            : 'border-transparent text-[#5b5b5d] hover:border-[#e0e0e0] hover:bg-white hover:text-[#23252a]',
                        ].join(' ')}
                      >
                        <span>{tab.label}</span>
                        <span className="rounded-full bg-black/5 px-1.5 py-0.5 text-[11px] text-inherit">{tab.count}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    updateQuery(router, pathname, searchParams, { q: searchDraft.trim() || null });
                  }}
                  className="relative w-full min-w-[220px] sm:w-[280px]"
                >
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa1ad]" />
                  <Input
                    value={searchDraft}
                    onChange={(event) => setSearchDraft(event.target.value)}
                    placeholder={searchPlaceholder(isZh)}
                    className="h-9 rounded-[10px] border-[#e0e0e0] bg-white pl-9 pr-3 text-[13px] text-[#23252a] shadow-none placeholder:text-[#b0b5c0] focus:border-[#cfd4ff] focus:ring-0"
                  />
                </form>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setFilterOpen(true)}
                  className={[
                    'h-9 rounded-[10px] border px-3 text-[13px] shadow-none',
                    isFilterActive(draftFilters)
                      ? 'border-[#d7dafd] bg-[#eef0ff] text-[#3949ab] hover:bg-[#e7eaff]'
                      : 'border-[#e0e0e0] bg-white text-[#3f3f3f] hover:bg-[#f7f7f8]',
                  ].join(' ')}
                >
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  {isFilterActive(draftFilters) ? filterButtonLabel(draftFilters, isZh, filterSummaryContext) : 'Filter'}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => toggleSort(router, pathname, searchParams, sort)}
                  className="h-9 rounded-[10px] border border-[#e0e0e0] bg-white px-3 text-[13px] text-[#3f3f3f] shadow-none hover:bg-[#f7f7f8]"
                >
                  <ChevronDown className="mr-2 h-4 w-4" />
                  {sortLabel(sort, isZh)}
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
                  onClick={() => setCreateIssueOpen(true)}
                  className="h-9 rounded-[10px] bg-[#23252a] px-3 text-[13px] font-medium text-white shadow-none hover:bg-[#111214]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {isZh ? '鏂板缓浜嬮」' : 'New issue'}
                </Button>
              </div>
            </div>
          </div>

          {activeFilterTokens.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2 border-b border-[#ececef] px-4 py-2.5 sm:px-5">
              {activeFilterTokens.map((token) => (
                <span key={token} className="inline-flex items-center rounded-full border border-[#e3e5ea] bg-white px-2.5 py-1 text-[12px] text-[#5b5b5d]">
                  {token}
                </span>
              ))}
            </div>
          ) : null}

          <div>
            <div className={`grid h-10 ${LIST_GRID_COLUMNS} items-center border-b border-[#ececef] bg-[#fcfcfd] px-4 text-[11px] uppercase tracking-[0.16em] text-[#9aa1ad] sm:px-5`}>
              <span />
              <span />
              <span>{columnLabel('identifier', isZh)}</span>
              <span />
              <span>{columnLabel('issue', isZh)}</span>
              <span className="text-right">{columnLabel('updated', isZh)}</span>
            </div>

            {issuesQuery.isLoading ? (
              <div className="px-4 py-8 text-sm text-[#5b5b5d] sm:px-5">{loadingText(currentView, isZh)}</div>
            ) : visibleIssues.length === 0 ? (
              <div className="px-4 py-8 text-sm text-[#5b5b5d] sm:px-5">{noResultsText(searchParams.get('q') ?? '', draftFilters, isZh)}</div>
            ) : activeListCount === 0 ? (
              <div className="px-4 py-8 text-sm text-[#5b5b5d] sm:px-5">All groups are collapsed. Re-open them from Display.</div>
            ) : (
              <div>
                {groupedIssues.map((group) => {
                  if (group.items.length === 0 || collapsedStates.has(group.state)) return null;
                  return (
                    <section key={group.state} className="border-b border-[#f0f0f2] last:border-b-0">
                      <div className="flex h-9 items-center justify-between border-y border-[#f2f2f4] bg-[#fafafb] px-4 text-[12px] font-medium text-[#5b5b5d] sm:px-5">
                        <div className="flex items-center gap-2.5">
                          <IssueStateIcon state={group.state} />
                          <span>{groupHeaderTitle(group.state, group.items.length, isZh)}</span>
                          <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] font-medium text-[#8f95a3] shadow-[inset_0_0_0_1px_rgba(224,224,224,0.9)]">
                            {groupHeaderMeta(group.items.length, isZh)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleGroupCollapsed(router, pathname, searchParams, collapsedStates, group.state)}
                          className="rounded-[8px] px-2 py-1 text-[11px] text-[#8f95a3] transition hover:bg-white hover:text-[#23252a]"
                        >
                          {isZh ? '鎶樺彔' : 'Collapse'}
                        </button>
                      </div>

                      <div>
                        {group.items.map((issue) => (
                          <IssueListRow
                            key={issue.id}
                            issue={issue}
                            isZh={isZh}
                            locale={locale}
                            rowDensity={rowDensity}
                            showRowMetadata={showRowMetadata}
                            assigneeLabel={issue.assigneeId ? memberNameById.get(issue.assigneeId) : null}
                            projectName={issue.projectId ? projectNameById.get(issue.projectId) : null}
                            onClick={() => openIssue(issue.id)}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </div>
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

function IssueListRow({
  issue,
  isZh,
  locale,
  rowDensity,
  showRowMetadata,
  assigneeLabel,
  projectName,
  onClick,
}: {
  issue: Issue;
  isZh: boolean;
  locale: string;
  rowDensity: RowDensity;
  showRowMetadata: boolean;
  assigneeLabel: string | null | undefined;
  projectName: string | null | undefined;
  onClick: () => void;
}) {
  const labelColor = issue.labels[0]?.color || issueTypeDotColor(issue.type);
  const denseClass = rowDensity === 'compact' ? 'min-h-[40px] py-1.5' : 'min-h-[44px] py-2';
  const accentClass = priorityTone(issue.priority);
  const assigneeToneClass = assigneeLabel ? assigneeTone(assigneeLabel) : '';

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        `group grid w-full ${LIST_GRID_COLUMNS} items-center gap-3 border-t border-[#f4f4f5] px-4 text-left transition first:border-t-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[#7180ff] sm:px-5`,
        denseClass,
        "bg-white hover:bg-[rgba(17,24,39,0.018)]",
      ].join(' ')}
    >
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-[4px] border border-[rgba(0,0,0,0.12)] bg-white transition group-hover:border-[#c7ccd6] group-hover:bg-[#fbfbfc]">
        <Check className="h-3 w-3 text-[#c0c4cd] transition group-hover:text-[#97a0af]" />
      </span>
      <span className={`inline-flex h-4 w-4 items-center justify-center ${accentClass}`}>
        <IssuePriorityIcon priority={issue.priority} />
      </span>
      <span className="font-mono text-[12px] text-[#8f95a3]">{issue.identifier}</span>
      <span className="inline-flex h-4 w-4 items-center justify-center text-[#7a808c]">
        <IssueStateIcon state={issue.state} />
      </span>
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2 text-[13px] text-[#23252a]">
          <span className="truncate font-medium transition group-hover:text-[#111214]">{issue.title}</span>
        </div>
        {showRowMetadata ? (
          <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] text-[#70757f]">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: issueTypeDotColor(issue.type) }} />
              <span>{labelForType(issue.type, isZh)}</span>
            </span>
            {projectName ? (
              <span className="inline-flex items-center gap-1.5 truncate">
                <ProjectMetaIcon />
                <span className="truncate">{projectName}</span>
              </span>
            ) : null}
            {assigneeLabel ? (
              <span className="inline-flex items-center gap-1.5 truncate">
                <span className={`inline-flex h-[18px] w-[18px] items-center justify-center rounded-full text-[10px] font-semibold ${assigneeToneClass}`}>
                  {assigneeInitials(assigneeLabel)}
                </span>
                <span className="truncate">{assigneeLabel}</span>
              </span>
            ) : null}
            {issue.labels.slice(0, 2).map((label) => (
              <span key={label.id} className="inline-flex items-center gap-1 text-[11px] text-[#5b5b5d]">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: label.color || labelColor }} />
                <span>{label.name}</span>
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <span className="text-right text-[12px] text-[#8f95a3]">{formatRelativeDate(issue.createdAt, locale)}</span>
    </button>
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
          className="h-9 rounded-[10px] border border-[#e0e0e0] bg-white px-3 text-[13px] text-[#3f3f3f] shadow-none hover:bg-[#f7f7f8]"
        >
          <LayoutList className="mr-2 h-4 w-4" />
          Display
          <ChevronDown className="ml-2 h-4 w-4 text-[#9aa1ad]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 rounded-[12px] border border-[#e0e0e0] bg-white p-2 text-[#23252a] shadow-[0_18px_55px_rgba(0,0,0,0.08)]">
        <DropdownMenuLabel className="text-[#8f95a3]">Display</DropdownMenuLabel>
        <DropdownMenuCheckboxItem checked={sort === 'updatedAt'} onCheckedChange={(checked) => checked && onSetSort('updatedAt')} className="rounded-[8px] text-[#23252a] focus:bg-[#f5f6f8]">
          {sortLabel('updatedAt', isZh)}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={sort === 'manual'} onCheckedChange={(checked) => checked && onSetSort('manual')} className="rounded-[8px] text-[#23252a] focus:bg-[#f5f6f8]">
          {sortLabel('manual', isZh)}
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator className="bg-[#efeff2]" />
        <DropdownMenuCheckboxItem checked={rowDensity === 'comfortable'} onCheckedChange={(checked) => checked && onSetRowDensity('comfortable')} className="rounded-[8px] text-[#23252a] focus:bg-[#f5f6f8]">
          Comfortable rows
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={rowDensity === 'compact'} onCheckedChange={(checked) => checked && onSetRowDensity('compact')} className="rounded-[8px] text-[#23252a] focus:bg-[#f5f6f8]">
          Compact rows
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={showRowMetadata} onCheckedChange={(checked) => onSetShowRowMetadata(Boolean(checked))} className="rounded-[8px] text-[#23252a] focus:bg-[#f5f6f8]">
          Show project and labels
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator className="bg-[#efeff2]" />
        {GROUP_ORDER.map((state) => (
          <DropdownMenuCheckboxItem key={state} checked={!collapsedStates.has(state)} onCheckedChange={() => onToggleGroup(state)} className="rounded-[8px] text-[#23252a] focus:bg-[#f5f6f8]">
            {labelForState(state, isZh)}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
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
  setDraftFilters: Dispatch<SetStateAction<FilterDraft>>;
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
      <SheetContent className="w-full max-w-[520px] border-l border-[#e0e0e0] bg-[#fcfcfd] p-0 text-[#23252a]">
        <SheetHeader className="border-b border-[#ececef] bg-[#fcfcfd] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.16em] text-[#9aa1ad]">{isZh ? '浜嬮」' : 'Issues'}</div>
              <SheetTitle className="mt-2 text-[22px] text-[#23252a]">{filterSheetTitle(isZh)}</SheetTitle>
            </div>
            <SheetDismissButton className="rounded-[10px] border border-[#e0e0e0] p-2 text-[#5b5b5d] hover:bg-white hover:text-[#23252a]" aria-label={closeLabel(isZh)} />
          </div>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-92px)]">
          <div className="space-y-5 px-6 py-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FilterField label="Search">
                <Input value={draftFilters.q} onChange={(event) => setDraftFilters((current) => ({ ...current, q: event.target.value }))} className="h-10 rounded-[10px] border-[#e0e0e0] bg-white text-[#23252a] shadow-none placeholder:text-[#b0b5c0]" />
              </FilterField>
              <FilterField label="Type">
                <SimpleSelect value={draftFilters.type || EMPTY} onValueChange={(value) => setDraftFilters((current) => ({ ...current, type: value === EMPTY ? '' : value }))}>
                  <SelectItem value={EMPTY}>All types</SelectItem>
                  {TYPE_OPTIONS.map((value) => (
                    <SelectItem key={value} value={value}>
                      {labelForType(value, isZh)}
                    </SelectItem>
                  ))}
                </SimpleSelect>
              </FilterField>
              <FilterField label="State">
                <SimpleSelect value={draftFilters.state || EMPTY} onValueChange={(value) => setDraftFilters((current) => ({ ...current, state: value === EMPTY ? '' : value }))}>
                  <SelectItem value={EMPTY}>All states</SelectItem>
                  {GROUP_ORDER.map((value) => (
                    <SelectItem key={value} value={value}>
                      {labelForState(value, isZh)}
                    </SelectItem>
                  ))}
                </SimpleSelect>
              </FilterField>
              <FilterField label="Priority">
                <SimpleSelect value={draftFilters.priority || EMPTY} onValueChange={(value) => setDraftFilters((current) => ({ ...current, priority: value === EMPTY ? '' : value }))}>
                  <SelectItem value={EMPTY}>All priorities</SelectItem>
                  {PRIORITY_OPTIONS.map((value) => (
                    <SelectItem key={value} value={value}>
                      {labelForPriority(value, isZh)}
                    </SelectItem>
                  ))}
                </SimpleSelect>
              </FilterField>
              <LookupField label="Assignee" items={members} value={draftFilters.assigneeId} emptyLabel="All members" onChange={(value) => setDraftFilters((current) => ({ ...current, assigneeId: value }))} />
              <LookupField label="Project" items={projects} value={draftFilters.projectId} emptyLabel="All projects" onChange={(value) => setDraftFilters((current) => ({ ...current, projectId: value }))} />
              <LookupField label="Team" items={teams} value={draftFilters.teamId} emptyLabel="All teams" onChange={(value) => setDraftFilters((current) => ({ ...current, teamId: value }))} />
              <LabelMultiSelectField isZh={isZh} labels={labels} value={draftFilters.labelIds} onChange={(labelIds) => setDraftFilters((current) => ({ ...current, labelIds }))} />
            </div>

            {customFieldDefinitions.filter((field) => field.isFilterable).length ? (
              <div className="space-y-4 rounded-[12px] border border-[#ececef] bg-white p-4">
                <div className="text-sm font-medium text-[#23252a]">Custom fields</div>
                <div className="grid gap-4 md:grid-cols-2">
                  {customFieldDefinitions
                    .filter((field) => field.isFilterable)
                    .map((field) => (
                      <CustomFieldFilterControl
                        key={field.id}
                        field={field}
                        isZh={isZh}
                        members={members}
                        teams={teams}
                        value={draftFilters.customFieldFilters[field.key] ?? ''}
                        onChange={(value) =>
                          setDraftFilters((current) => ({
                            ...current,
                            customFieldFilters: { ...current.customFieldFilters, [field.key]: value },
                          }))
                        }
                      />
                    ))}
                </div>
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-3 border-t border-[#ececef] pt-4">
              <Button variant="secondary" onClick={onClear} className="h-9 rounded-[10px] border border-[#e0e0e0] bg-white px-3 text-[13px] text-[#3f3f3f] shadow-none hover:bg-[#f7f7f8]">
                <FilterX className="mr-2 h-4 w-4" />
                Clear filters
              </Button>
              <Button onClick={onApply} className="h-9 rounded-[10px] bg-[#23252a] px-3 text-[13px] text-white shadow-none hover:bg-[#111214]">
                Apply filters
              </Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="space-y-2 text-sm text-[#5b5b5d]">
      <span className="block text-[11px] uppercase tracking-[0.16em] text-[#9aa1ad]">{label}</span>
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
          <SelectItem key={item.id} value={String(item.id)}>
            {item.name?.trim() || `#${item.id}`}
          </SelectItem>
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
  const triggerLabel =
    selectedCount === 0
      ? isZh
        ? '全部标签'
        : 'All labels'
      : selectedCount === 1
        ? labels.find((label) => String(label.id) === selectedIds[0])?.name ?? `#${selectedIds[0]}`
        : isZh
          ? `已选 ${selectedCount} 个标签`
          : `${selectedCount} labels selected`;

  return (
    <FilterField label={isZh ? '标签' : 'Labels'}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="secondary" className="h-10 w-full justify-between rounded-[10px] border border-[#e0e0e0] bg-white px-3 text-[13px] text-[#23252a] shadow-none hover:bg-[#f7f7f8]">
            <span className="truncate">{triggerLabel}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-[#9aa1ad]" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-[12px] border border-[#e0e0e0] bg-white text-[#23252a] shadow-[0_18px_55px_rgba(0,0,0,0.08)]">
          <DropdownMenuLabel>Labels</DropdownMenuLabel>
          <DropdownMenuCheckboxItem checked={selectedCount === 0} onCheckedChange={(checked) => checked && onChange([])} className="rounded-[8px] text-[#23252a] focus:bg-[#f5f6f8]">
            All labels
          </DropdownMenuCheckboxItem>
          {labels.length > 0 ? <DropdownMenuSeparator className="bg-[#efeff2]" /> : null}
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
                className="rounded-[8px] text-[#23252a] focus:bg-[#f5f6f8]"
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
  children: ReactNode;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-10 rounded-[10px] border-[#e0e0e0] bg-white px-3 text-[13px] text-[#23252a] shadow-none">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="rounded-[12px] border border-[#e0e0e0] bg-white text-[#23252a]">{children}</SelectContent>
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
            <SelectItem key={option.id} value={option.value}>
              {option.label}
            </SelectItem>
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
          <SelectItem value="true">True</SelectItem>
          <SelectItem value="false">False</SelectItem>
        </SimpleSelect>
      </FilterField>
    );
  }

  if (field.dataType === 'USER') {
    return <LookupField label={field.name} items={members} value={value} emptyLabel={field.name} onChange={onChange} />;
  }

  if (field.dataType === 'TEAM') {
    return <LookupField label={field.name} items={teams} value={value} emptyLabel={field.name} onChange={onChange} />;
  }

  return (
    <FilterField label={field.name}>
      <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder="Enter filter value" className="h-10 rounded-[10px] border-[#e0e0e0] bg-white text-[#23252a] shadow-none placeholder:text-[#b0b5c0]" />
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
  setDraftFilters: Dispatch<SetStateAction<FilterDraft>>,
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
  return (rawValue ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
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
  if (!value) params.delete(key);
  else params.set(key, value);
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

function IssuePriorityIcon({ priority }: { priority: Issue['priority'] }) {
  if (priority === 'URGENT') {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
        <rect x="1.5" y="9" width="3" height="5" rx="1" fill="currentColor" />
        <rect x="6.5" y="6" width="3" height="8" rx="1" fill="currentColor" />
        <rect x="11.5" y="2" width="3" height="12" rx="1" fill="currentColor" />
      </svg>
    );
  }
  if (priority === 'HIGH') {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
        <rect x="1.5" y="9" width="3" height="5" rx="1" fill="currentColor" />
        <rect x="6.5" y="6" width="3" height="8" rx="1" fill="currentColor" />
        <rect x="11.5" y="3.5" width="3" height="10.5" rx="1" fillOpacity="0.5" fill="currentColor" />
      </svg>
    );
  }
  if (priority === 'MEDIUM') {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
        <rect x="1.5" y="9" width="3" height="5" rx="1" fill="currentColor" />
        <rect x="6.5" y="6" width="3" height="8" rx="1" fill="currentColor" />
        <rect x="11.5" y="3.5" width="3" height="10.5" rx="1" fillOpacity="0.2" fill="currentColor" />
      </svg>
    );
  }
  if (priority === 'LOW') {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
        <rect x="1.5" y="9" width="3" height="5" rx="1" fill="currentColor" />
        <rect x="6.5" y="6" width="3" height="8" rx="1" fillOpacity="0.4" fill="currentColor" />
        <rect x="11.5" y="3.5" width="3" height="10.5" rx="1" fillOpacity="0.15" fill="currentColor" />
      </svg>
    );
  }
  return <span className="h-2 w-2 rounded-full bg-current opacity-30" />;
}

function ProjectMetaIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" className="text-[#8f95a3]">
      <path
        d="M3.5 2.5h3.25L8 3.75h4.5v8.75h-9z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IssueStateIcon({ state }: { state: string }) {
  if (state === 'IN_PROGRESS') return <LoaderCircle className="h-4 w-4 text-[#6c78e6]" />;
  if (state === 'IN_REVIEW') return <CircleEllipsis className="h-4 w-4 text-[#f2994a]" />;
  if (state === 'DONE') return <CheckCircle2 className="h-4 w-4 text-[#3fb950]" />;
  return state === 'BACKLOG' || state === 'TODO'
    ? <Circle className="h-4 w-4 text-[#8f95a3]" />
    : <CircleDashed className="h-4 w-4 text-[#8f95a3]" />;
}
