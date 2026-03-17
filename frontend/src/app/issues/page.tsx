'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowUpRight, CheckCircle2, CircleDot, FilterX, Plus, Search, SlidersHorizontal } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDismissButton, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { useI18n } from '@/i18n/useI18n';
import type { CustomFieldDefinition, Epic, Issue, Project, Sprint, Team } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import { useIssueMutations, useIssueWorkspace } from '@/lib/query/issues';

type IssueView = 'all' | 'active' | 'backlog' | 'done';

type TeamMember = {
  id: number;
  name: string;
  email?: string;
  role?: string;
  teamId?: number | null;
};

type FilterDraft = {
  q: string;
  type: string;
  state: string;
  priority: string;
  assigneeId: string;
  projectId: string;
  epicId: string;
  sprintId: string;
  teamId: string;
  customFieldFilters: Record<string, string>;
};

type CreateDraft = {
  title: string;
  description: string;
  type: string;
  projectId: string;
  state: string;
  priority: string;
  teamId: string;
  epicId: string;
  sprintId: string;
  customFields: Record<string, unknown>;
};

const EMPTY = '__empty__';
const ACTIVE_STATES = ['TODO', 'IN_PROGRESS', 'IN_REVIEW'] as const;
const GROUP_ORDER = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELED'] as const;
const TYPE_OPTIONS = ['FEATURE', 'TASK', 'BUG', 'TECH_DEBT'] as const;
const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;

export default function IssuesPage() {
  const { locale } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const storedUser = getStoredUser();
  const organizationId = storedUser?.organizationId ?? 1;
  const isZh = locale.startsWith('zh');
  const currentView = normalizeView(searchParams.get('view'));
  const searchParamsKey = searchParams.toString();

  const apiFilters = useMemo(
    () => buildIssueFilters(searchParams, organizationId),
    [organizationId, searchParamsKey]
  );
  const {
    issuesQuery,
    customFieldDefinitionsQuery,
    projectsQuery,
    epicsQuery,
    sprintsQuery,
    teamsQuery,
    membersQuery,
  } = useIssueWorkspace(apiFilters);
  const { createIssueMutation, updateIssueMutation } = useIssueMutations(apiFilters);

  const issues = useMemo(() => issuesQuery.data ?? [], [issuesQuery.data]);
  const customFieldDefinitions = useMemo(
    () => (customFieldDefinitionsQuery.data ?? []).filter((field) => field.isActive),
    [customFieldDefinitionsQuery.data]
  );
  const projects = useMemo(() => projectsQuery.data ?? [], [projectsQuery.data]);
  const epics = useMemo(() => epicsQuery.data ?? [], [epicsQuery.data]);
  const sprints = useMemo(() => sprintsQuery.data ?? [], [sprintsQuery.data]);
  const teams = useMemo(() => (teamsQuery.data ?? []) as Team[], [teamsQuery.data]);
  const members = useMemo(() => (membersQuery.data ?? []) as TeamMember[], [membersQuery.data]);

  const [searchValue, setSearchValue] = useState(searchParams.get('q') ?? '');
  const [filterOpen, setFilterOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [quickCreateState, setQuickCreateState] = useState<string | null>(null);
  const [updatingCell, setUpdatingCell] = useState<string | null>(null);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const [draftFilters, setDraftFilters] = useState<FilterDraft>(() => readFilterDraft(searchParams, []));
  const [createDraft, setCreateDraft] = useState<CreateDraft>(() => buildCreateDraft([], null, []));

  useEffect(() => {
    setSearchValue(searchParams.get('q') ?? '');
    setDraftFilters(readFilterDraft(searchParams, customFieldDefinitions));
  }, [customFieldDefinitions, searchParamsKey]);

  useEffect(() => {
    if (issuesQuery.isError) {
      setWorkspaceError(
        isZh ? '无法加载事项数据，请确认 8080 端口上的后端服务可访问。' : 'Unable to load issues. Confirm the backend on port 8080 is reachable.'
      );
    } else {
      setWorkspaceError(null);
    }
  }, [isZh, issuesQuery.isError]);

  useEffect(() => {
    if (!createOpen) return;
    setCreateDraft(buildCreateDraft(projects, quickCreateState, customFieldDefinitions));
  }, [createOpen, projects, quickCreateState, customFieldDefinitions]);

  const viewCounts = useMemo(
    () => ({
      all: issues.length,
      active: issues.filter((issue) => ACTIVE_STATES.includes(issue.state as (typeof ACTIVE_STATES)[number])).length,
      backlog: issues.filter((issue) => issue.state === 'BACKLOG').length,
      done: issues.filter((issue) => issue.state === 'DONE').length,
    }),
    [issues]
  );

  const groupedIssues = useMemo(() => {
    const map = new Map<string, Issue[]>();
    for (const state of GROUP_ORDER) {
      map.set(state, []);
    }
    for (const issue of issues) {
      const bucket = map.get(issue.state) ?? [];
      bucket.push(issue);
      map.set(issue.state, bucket);
    }
    return GROUP_ORDER
      .filter((state) => groupBelongsToView(state, currentView))
      .map((state) => ({
        state,
        issues: (map.get(state) ?? []).sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)),
      }));
  }, [currentView, issues]);

  const filterSummary = useMemo(
    () => buildFilterSummary(draftFilters, projects, epics, sprints, teams, members, customFieldDefinitions, isZh),
    [customFieldDefinitions, draftFilters, epics, isZh, members, projects, sprints, teams]
  );
  const createDefinitions = useMemo(
    () => customFieldDefinitions.filter((field) => field.showOnCreate).sort((a, b) => a.sortOrder - b.sortOrder),
    [customFieldDefinitions]
  );

  const updateQuery = (updates: Record<string, string | null | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => writeValue(params, key, value));
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  };

  const applyFilterDraft = () => {
    const params = new URLSearchParams(searchParams.toString());
    clearCustomFieldParams(params);
    writeValue(params, 'q', draftFilters.q.trim());
    writeValue(params, 'type', normalizeEmpty(draftFilters.type));
    writeValue(params, 'state', normalizeEmpty(draftFilters.state));
    writeValue(params, 'priority', normalizeEmpty(draftFilters.priority));
    writeValue(params, 'assigneeId', normalizeEmpty(draftFilters.assigneeId));
    writeValue(params, 'projectId', normalizeEmpty(draftFilters.projectId));
    writeValue(params, 'epicId', normalizeEmpty(draftFilters.epicId));
    writeValue(params, 'sprintId', normalizeEmpty(draftFilters.sprintId));
    writeValue(params, 'teamId', normalizeEmpty(draftFilters.teamId));
    Object.entries(draftFilters.customFieldFilters).forEach(([key, value]) => writeValue(params, `cf_${key}`, value));
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    setFilterOpen(false);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    ['q', 'type', 'state', 'priority', 'assigneeId', 'projectId', 'epicId', 'sprintId', 'teamId'].forEach((key) => params.delete(key));
    clearCustomFieldParams(params);
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    setDraftFilters(readFilterDraft(new URLSearchParams(), customFieldDefinitions));
    setFilterOpen(false);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateQuery({ q: searchValue.trim() || null });
  };

  const openCreateSheet = (state?: string) => {
    setQuickCreateState(state ?? null);
    setCreateDraft(buildCreateDraft(projects, state ?? null, customFieldDefinitions));
    setCreateOpen(true);
  };

  const handleCreateIssue = async () => {
    const title = createDraft.title.trim();
    const projectId = Number(createDraft.projectId || 0);
    if (!title || !projectId) return;

    try {
      await createIssueMutation.mutateAsync({
        organizationId,
        title,
        description: createDraft.description.trim() || undefined,
        type: createDraft.type,
        projectId,
        state: createDraft.state,
        priority: createDraft.priority,
        teamId: toNullableNumber(createDraft.teamId),
        epicId: toNullableNumber(createDraft.epicId),
        sprintId: toNullableNumber(createDraft.sprintId),
        customFields: serializeCreateCustomFields(createDraft.customFields, createDefinitions),
      });
      setCreateOpen(false);
      setQuickCreateState(null);
    } catch {
      setWorkspaceError(isZh ? '创建事项失败，请稍后重试。' : 'Failed to create issue. Please try again.');
    }
  };

  const handleQuickUpdate = async (issueId: number, data: { state?: string; priority?: string; assigneeId?: number | null }) => {
    try {
      setUpdatingCell(`${issueId}:${Object.keys(data)[0]}`);
      await updateIssueMutation.mutateAsync({ id: issueId, data });
    } catch {
      setWorkspaceError(isZh ? '更新事项失败，请稍后重试。' : 'Failed to update issue. Please try again.');
    } finally {
      setUpdatingCell(null);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-5 px-8 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {([
              ['all', isZh ? '全部事项' : 'All issues'],
              ['active', isZh ? '进行中' : 'Active'],
              ['backlog', 'Backlog'],
              ['done', isZh ? '已完成' : 'Done'],
            ] as const).map(([view, label]) => (
              <button
                key={view}
                onClick={() => updateQuery({ view })}
                className={`rounded-full px-3 py-1.5 text-sm transition ${
                  currentView === view ? 'bg-slate-900 text-white' : 'bg-white text-ink-700 hover:bg-slate-100'
                }`}
              >
                {label}
                <span className="ml-2 text-xs opacity-70">{viewCounts[view]}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <form onSubmit={handleSearchSubmit} className="relative min-w-[260px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <Input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder={isZh ? '搜索标题或编号' : 'Search title or identifier'}
                className="h-10 rounded-full pl-9 pr-3"
              />
            </form>
            <Button variant="secondary" size="sm" className="rounded-full" onClick={() => setFilterOpen(true)}>
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              {isZh ? '高级筛选' : 'Advanced filter'}
            </Button>
            <Button size="sm" className="rounded-full" onClick={() => openCreateSheet()}>
              <Plus className="mr-2 h-4 w-4" />
              {isZh ? '新建事项' : 'New issue'}
            </Button>
          </div>
        </div>

        {filterSummary.length ? (
          <div className="flex flex-wrap items-center gap-2">
            {filterSummary.map((item) => (
              <Badge key={item} variant="neutral" className="gap-1.5 px-3 py-1.5">
                {item}
              </Badge>
            ))}
            <button onClick={clearFilters} className="inline-flex items-center gap-1 text-xs text-ink-400 transition hover:text-ink-700">
              <FilterX className="h-3.5 w-3.5" />
              {isZh ? '清空筛选' : 'Clear filters'}
            </button>
          </div>
        ) : null}

        {workspaceError ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{workspaceError}</div>
        ) : null}

        <div className="space-y-4">
          {groupedIssues.map((group) => (
            <section key={group.state} className="overflow-hidden rounded-3xl border border-border-subtle bg-white/85">
              <div className="flex items-center justify-between border-b border-border-soft px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-medium text-ink-900">
                  <StateIcon state={group.state} />
                  <span>{labelForState(group.state, isZh)}</span>
                  <span className="text-ink-400">{group.issues.length}</span>
                </div>
                <button onClick={() => openCreateSheet(group.state)} className="inline-flex items-center gap-1 text-sm text-ink-400 transition hover:text-ink-900">
                  <Plus className="h-4 w-4" />
                  {isZh ? '新增' : 'Add'}
                </button>
              </div>

              {group.issues.length ? (
                <div>
                  {group.issues.map((issue, index) => (
                    <IssueRow
                      key={issue.id}
                      issue={issue}
                      isLast={index === group.issues.length - 1}
                      locale={locale}
                      isZh={isZh}
                      members={members}
                      projects={projects}
                      epics={epics}
                      updatingCell={updatingCell}
                      onOpen={() => router.push(`/${locale}/issues/${issue.id}`)}
                      onQuickUpdate={handleQuickUpdate}
                    />
                  ))}
                </div>
              ) : (
                <div className="px-4 py-6 text-sm text-ink-400">{isZh ? '当前分组没有事项。' : 'No issues in this group.'}</div>
              )}
            </section>
          ))}
        </div>
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
        epics={epics}
        sprints={sprints}
        teams={teams}
        onClear={clearFilters}
        onApply={applyFilterDraft}
      />

      <CreateIssueSheet
        open={createOpen}
        setOpen={setCreateOpen}
        isZh={isZh}
        draft={createDraft}
        setDraft={setCreateDraft}
        projects={projects}
        epics={epics}
        sprints={sprints}
        teams={teams}
        members={members}
        createDefinitions={createDefinitions}
        createPending={createIssueMutation.isPending}
        onSubmit={handleCreateIssue}
      />
    </AppLayout>
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
  epics,
  sprints,
  teams,
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
  projects: Project[];
  epics: Epic[];
  sprints: Sprint[];
  teams: Team[];
  onClear: () => void;
  onApply: () => void;
}) {
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="max-w-xl">
        <SheetHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-ink-400">Issues</div>
              <SheetTitle className="mt-2">{isZh ? '高级筛选' : 'Advanced filter'}</SheetTitle>
            </div>
            <SheetDismissButton aria-label={isZh ? '取消' : 'Cancel'} />
          </div>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="space-y-5 px-6 py-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FilterField label={isZh ? '搜索词' : 'Search'}>
                <Input value={draftFilters.q} onChange={(event) => setDraftFilters((current) => ({ ...current, q: event.target.value }))} />
              </FilterField>
              <FilterField label={isZh ? '类型' : 'Type'}>
                <SimpleSelect value={draftFilters.type || EMPTY} onValueChange={(value) => setDraftFilters((current) => ({ ...current, type: value === EMPTY ? '' : value }))}>
                  <SelectItem value={EMPTY}>{isZh ? '全部类型' : 'All types'}</SelectItem>
                  {TYPE_OPTIONS.map((value) => <SelectItem key={value} value={value}>{labelForType(value, isZh)}</SelectItem>)}
                </SimpleSelect>
              </FilterField>
              <FilterField label={isZh ? '状态' : 'State'}>
                <SimpleSelect value={draftFilters.state || EMPTY} onValueChange={(value) => setDraftFilters((current) => ({ ...current, state: value === EMPTY ? '' : value }))}>
                  <SelectItem value={EMPTY}>{isZh ? '全部状态' : 'All states'}</SelectItem>
                  {GROUP_ORDER.map((value) => <SelectItem key={value} value={value}>{labelForState(value, isZh)}</SelectItem>)}
                </SimpleSelect>
              </FilterField>
              <FilterField label={isZh ? '优先级' : 'Priority'}>
                <SimpleSelect value={draftFilters.priority || EMPTY} onValueChange={(value) => setDraftFilters((current) => ({ ...current, priority: value === EMPTY ? '' : value }))}>
                  <SelectItem value={EMPTY}>{isZh ? '全部优先级' : 'All priorities'}</SelectItem>
                  {PRIORITY_OPTIONS.map((value) => <SelectItem key={value} value={value}>{labelForPriority(value, isZh)}</SelectItem>)}
                </SimpleSelect>
              </FilterField>
              <LookupField label={isZh ? '负责人' : 'Assignee'} items={members} value={draftFilters.assigneeId} emptyLabel={isZh ? '全部成员' : 'All members'} onChange={(value) => setDraftFilters((current) => ({ ...current, assigneeId: value }))} />
              <LookupField label={isZh ? '项目' : 'Project'} items={projects} value={draftFilters.projectId} emptyLabel={isZh ? '全部项目' : 'All projects'} onChange={(value) => setDraftFilters((current) => ({ ...current, projectId: value }))} />
              <LookupField label="Epic" items={epics} value={draftFilters.epicId} emptyLabel={isZh ? '全部 Epic' : 'All epics'} onChange={(value) => setDraftFilters((current) => ({ ...current, epicId: value }))} />
              <LookupField label="Sprint" items={sprints} value={draftFilters.sprintId} emptyLabel={isZh ? '全部 Sprint' : 'All sprints'} onChange={(value) => setDraftFilters((current) => ({ ...current, sprintId: value }))} />
              <LookupField label={isZh ? '团队' : 'Team'} items={teams} value={draftFilters.teamId} emptyLabel={isZh ? '全部团队' : 'All teams'} onChange={(value) => setDraftFilters((current) => ({ ...current, teamId: value }))} />
            </div>

            {customFieldDefinitions.filter((field) => field.isFilterable).length ? (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="text-sm font-medium text-ink-900">{isZh ? '自定义字段' : 'Custom fields'}</div>
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
              </>
            ) : null}

            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={onClear}>{isZh ? '清空筛选' : 'Clear filters'}</Button>
              <Button onClick={onApply}>{isZh ? '应用筛选' : 'Apply filters'}</Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function CreateIssueSheet({
  open,
  setOpen,
  isZh,
  draft,
  setDraft,
  projects,
  epics,
  sprints,
  teams,
  members,
  createDefinitions,
  createPending,
  onSubmit,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  isZh: boolean;
  draft: CreateDraft;
  setDraft: React.Dispatch<React.SetStateAction<CreateDraft>>;
  projects: Project[];
  epics: Epic[];
  sprints: Sprint[];
  teams: Team[];
  members: TeamMember[];
  createDefinitions: CustomFieldDefinition[];
  createPending: boolean;
  onSubmit: () => Promise<void>;
}) {
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="max-w-2xl">
        <SheetHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-ink-400">Issues</div>
              <SheetTitle className="mt-2">{isZh ? '新建事项' : 'Create issue'}</SheetTitle>
            </div>
            <SheetDismissButton aria-label={isZh ? '取消' : 'Cancel'} />
          </div>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="space-y-5 px-6 py-6">
            <FilterField label={isZh ? '标题' : 'Title'}>
              <Input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} placeholder={isZh ? '输入事项标题' : 'Write an issue title'} />
            </FilterField>
            <FilterField label={isZh ? '描述' : 'Description'}>
              <Textarea value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} className="min-h-32" />
            </FilterField>
            <div className="grid gap-4 md:grid-cols-2">
              <FilterField label={isZh ? '类型' : 'Type'}>
                <SimpleSelect value={draft.type} onValueChange={(value) => setDraft((current) => ({ ...current, type: value }))}>
                  {TYPE_OPTIONS.map((value) => <SelectItem key={value} value={value}>{labelForType(value, isZh)}</SelectItem>)}
                </SimpleSelect>
              </FilterField>
              <LookupField label={isZh ? '项目' : 'Project'} items={projects} value={draft.projectId} emptyLabel={isZh ? '选择项目' : 'Select project'} onChange={(value) => setDraft((current) => ({ ...current, projectId: value }))} />
              <FilterField label={isZh ? '状态' : 'State'}>
                <SimpleSelect value={draft.state} onValueChange={(value) => setDraft((current) => ({ ...current, state: value }))}>
                  {GROUP_ORDER.filter((value) => value !== 'CANCELED').map((value) => <SelectItem key={value} value={value}>{labelForState(value, isZh)}</SelectItem>)}
                </SimpleSelect>
              </FilterField>
              <FilterField label={isZh ? '优先级' : 'Priority'}>
                <SimpleSelect value={draft.priority} onValueChange={(value) => setDraft((current) => ({ ...current, priority: value }))}>
                  {PRIORITY_OPTIONS.map((value) => <SelectItem key={value} value={value}>{labelForPriority(value, isZh)}</SelectItem>)}
                </SimpleSelect>
              </FilterField>
              <LookupField label={isZh ? '团队' : 'Team'} items={teams} value={draft.teamId} emptyLabel={isZh ? '未设置' : 'Not set'} onChange={(value) => setDraft((current) => ({ ...current, teamId: value }))} />
              <LookupField label="Epic" items={epics} value={draft.epicId} emptyLabel={isZh ? '未设置' : 'Not set'} onChange={(value) => setDraft((current) => ({ ...current, epicId: value }))} />
              <LookupField label="Sprint" items={sprints} value={draft.sprintId} emptyLabel={isZh ? '未设置' : 'Not set'} onChange={(value) => setDraft((current) => ({ ...current, sprintId: value }))} />
            </div>

            {createDefinitions.length ? (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="text-sm font-medium text-ink-900">{isZh ? '创建时字段' : 'Create fields'}</div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {createDefinitions.map((field) => (
                      <CustomFieldCreateControl
                        key={field.id}
                        field={field}
                        isZh={isZh}
                        members={members}
                        teams={teams}
                        value={draft.customFields[field.key]}
                        onChange={(value) => setDraft((current) => ({
                          ...current,
                          customFields: { ...current.customFields, [field.key]: value },
                        }))}
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : null}

            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setOpen(false)}>{isZh ? '取消' : 'Cancel'}</Button>
              <Button onClick={onSubmit} disabled={!draft.title.trim() || !draft.projectId || createPending}>
                {createPending ? (isZh ? '创建中...' : 'Creating...') : (isZh ? '创建事项' : 'Create issue')}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function IssueRow({
  issue,
  locale,
  isZh,
  members,
  projects,
  epics,
  updatingCell,
  isLast,
  onOpen,
  onQuickUpdate,
}: {
  issue: Issue;
  locale: string;
  isZh: boolean;
  members: TeamMember[];
  projects: Project[];
  epics: Epic[];
  updatingCell: string | null;
  isLast: boolean;
  onOpen: () => void;
  onQuickUpdate: (issueId: number, data: { state?: string; priority?: string; assigneeId?: number | null }) => Promise<void>;
}) {
  const assignee = members.find((member) => member.id === issue.assigneeId);
  const project = projects.find((item) => item.id === issue.projectId);
  const epic = epics.find((item) => item.id === issue.epicId);

  return (
    <div
      onClick={onOpen}
      className={`grid cursor-pointer grid-cols-[minmax(0,1fr)_180px_140px_128px] items-center gap-4 px-4 py-3 transition hover:bg-slate-50 ${isLast ? '' : 'border-b border-border-soft'}`}
    >
      <div className="min-w-0 space-y-1">
        <div className="flex items-center gap-3 text-sm">
          <StateIcon state={issue.state} />
          <span className="font-medium text-ink-400">{issue.identifier}</span>
          <span className="truncate text-ink-900">{issue.title}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 pl-6 text-xs text-ink-400">
          <span>{labelForType(issue.type, isZh)}</span>
          {project ? <span>{project.name}</span> : null}
          {epic ? <span>{epic.title}</span> : null}
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-ink-700" onClick={(event) => event.stopPropagation()}>
        <InlineSelect value={issue.assigneeId == null ? EMPTY : String(issue.assigneeId)} onValueChange={(value) => onQuickUpdate(issue.id, { assigneeId: value === EMPTY ? 0 : Number(value) })}>
          <SelectItem value={EMPTY}>{isZh ? '未设置' : 'Not set'}</SelectItem>
          {members.map((member) => <SelectItem key={member.id} value={String(member.id)}>{member.name}</SelectItem>)}
        </InlineSelect>
        {updatingCell === `${issue.id}:assigneeId` ? (
          <span className="truncate text-xs text-ink-400">{isZh ? '更新中...' : 'Updating...'}</span>
        ) : null}
      </div>

      <div onClick={(event) => event.stopPropagation()}>
        <InlineSelect value={issue.priority} onValueChange={(value) => onQuickUpdate(issue.id, { priority: value })}>
          {PRIORITY_OPTIONS.map((value) => <SelectItem key={value} value={value}>{labelForPriority(value, isZh)}</SelectItem>)}
        </InlineSelect>
      </div>

      <div className="flex items-center justify-between gap-3 text-xs text-ink-400" onClick={(event) => event.stopPropagation()}>
        <InlineSelect value={issue.state} onValueChange={(value) => onQuickUpdate(issue.id, { state: value })}>
          {GROUP_ORDER.map((value) => <SelectItem key={value} value={value}>{labelForState(value, isZh)}</SelectItem>)}
        </InlineSelect>
        <span>{formatDate(issue.updatedAt, locale)}</span>
      </div>
    </div>
  );
}

function InlineSelect({
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
      <SelectTrigger className="h-auto min-h-0 w-auto border-0 bg-transparent px-0 py-0 text-xs text-ink-400 shadow-none hover:text-ink-700 focus:ring-0">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
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
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  );
}

function LookupField<T extends { id: number; name?: string; title?: string }>({
  label,
  items,
  value,
  emptyLabel,
  onChange,
}: {
  label: string;
  items: T[];
  value: string;
  emptyLabel: string;
  onChange: (value: string) => void;
}) {
  return (
    <FilterField label={label}>
      <SimpleSelect value={value || EMPTY} onValueChange={(next) => onChange(next === EMPTY ? '' : next)}>
        <SelectItem value={EMPTY}>{emptyLabel}</SelectItem>
        {items.map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.name ?? item.title ?? `#${item.id}`}</SelectItem>)}
      </SimpleSelect>
    </FilterField>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-sm font-medium text-ink-700">{label}</div>
      {children}
    </label>
  );
}

function CustomFieldFilterControl({
  field,
  isZh,
  members,
  teams,
  value,
  onChange,
}: {
  field: CustomFieldDefinition;
  isZh: boolean;
  members: TeamMember[];
  teams: Team[];
  value: string;
  onChange: (value: string) => void;
}) {
  if (field.dataType === 'BOOLEAN') {
    return (
      <FilterField label={field.name}>
        <SimpleSelect value={value || EMPTY} onValueChange={(next) => onChange(next === EMPTY ? '' : next)}>
          <SelectItem value={EMPTY}>{isZh ? '不限' : 'Any'}</SelectItem>
          <SelectItem value="true">{isZh ? '是' : 'True'}</SelectItem>
          <SelectItem value="false">{isZh ? '否' : 'False'}</SelectItem>
        </SimpleSelect>
      </FilterField>
    );
  }

  if (field.dataType === 'SINGLE_SELECT' || field.dataType === 'MULTI_SELECT') {
    return (
      <FilterField label={field.name}>
        <SimpleSelect value={value || EMPTY} onValueChange={(next) => onChange(next === EMPTY ? '' : next)}>
          <SelectItem value={EMPTY}>{isZh ? '不限' : 'Any'}</SelectItem>
          {field.options.map((option) => <SelectItem key={option.id} value={option.value}>{option.label}</SelectItem>)}
        </SimpleSelect>
      </FilterField>
    );
  }

  if (field.dataType === 'USER') {
    return <LookupField label={field.name} items={members} value={value} emptyLabel={isZh ? '不限' : 'Any'} onChange={onChange} />;
  }

  if (field.dataType === 'TEAM') {
    return <LookupField label={field.name} items={teams} value={value} emptyLabel={isZh ? '不限' : 'Any'} onChange={onChange} />;
  }

  return (
    <FilterField label={field.name}>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </FilterField>
  );
}

function CustomFieldCreateControl({
  field,
  isZh,
  members,
  teams,
  value,
  onChange,
}: {
  field: CustomFieldDefinition;
  isZh: boolean;
  members: TeamMember[];
  teams: Team[];
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  if (field.dataType === 'TEXTAREA') {
    return (
      <FilterField label={field.name}>
        <Textarea value={String(value ?? '')} onChange={(event) => onChange(event.target.value)} className="min-h-24" />
      </FilterField>
    );
  }

  if (field.dataType === 'BOOLEAN') {
    return (
      <FilterField label={field.name}>
        <SimpleSelect value={String(value ?? EMPTY)} onValueChange={(next) => onChange(next === EMPTY ? undefined : next === 'true')}>
          <SelectItem value={EMPTY}>{isZh ? '未设置' : 'Not set'}</SelectItem>
          <SelectItem value="true">{isZh ? '是' : 'True'}</SelectItem>
          <SelectItem value="false">{isZh ? '否' : 'False'}</SelectItem>
        </SimpleSelect>
      </FilterField>
    );
  }

  if (field.dataType === 'SINGLE_SELECT' || field.dataType === 'MULTI_SELECT') {
    return (
      <FilterField label={field.name}>
        <SimpleSelect value={String(value ?? EMPTY)} onValueChange={(next) => onChange(next === EMPTY ? undefined : next)}>
          <SelectItem value={EMPTY}>{isZh ? '未设置' : 'Not set'}</SelectItem>
          {field.options.map((option) => <SelectItem key={option.id} value={option.value}>{option.label}</SelectItem>)}
        </SimpleSelect>
      </FilterField>
    );
  }

  if (field.dataType === 'USER') {
    return <LookupField label={field.name} items={members} value={String(value ?? '')} emptyLabel={isZh ? '未设置' : 'Not set'} onChange={(next) => onChange(next ? Number(next) : undefined)} />;
  }

  if (field.dataType === 'TEAM') {
    return <LookupField label={field.name} items={teams} value={String(value ?? '')} emptyLabel={isZh ? '未设置' : 'Not set'} onChange={(next) => onChange(next ? Number(next) : undefined)} />;
  }

  if (field.dataType === 'DATE') {
    return (
      <FilterField label={field.name}>
        <Input type="date" value={String(value ?? '')} onChange={(event) => onChange(event.target.value || undefined)} />
      </FilterField>
    );
  }

  if (field.dataType === 'DATETIME') {
    return (
      <FilterField label={field.name}>
        <Input type="datetime-local" value={String(value ?? '')} onChange={(event) => onChange(event.target.value || undefined)} />
      </FilterField>
    );
  }

  if (field.dataType === 'NUMBER') {
    return (
      <FilterField label={field.name}>
        <Input type="number" value={String(value ?? '')} onChange={(event) => onChange(event.target.value === '' ? undefined : Number(event.target.value))} />
      </FilterField>
    );
  }

  return (
    <FilterField label={field.name}>
      <Input value={String(value ?? '')} onChange={(event) => onChange(event.target.value)} />
    </FilterField>
  );
}

function StateIcon({ state }: { state: string }) {
  if (state === 'DONE') return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
  if (state === 'IN_PROGRESS' || state === 'IN_REVIEW') return <ArrowUpRight className="h-4 w-4 text-brand-600" />;
  if (state === 'BACKLOG') return <CircleDot className="h-4 w-4 text-ink-300" />;
  return <CircleDot className="h-4 w-4 text-ink-500" />;
}

function buildIssueFilters(searchParams: URLSearchParams, organizationId: number) {
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
    epicId: searchParams.get('epicId') ? Number(searchParams.get('epicId')) : undefined,
    sprintId: searchParams.get('sprintId') ? Number(searchParams.get('sprintId')) : undefined,
    teamId: searchParams.get('teamId') ? Number(searchParams.get('teamId')) : undefined,
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
    epicId: searchParams.get('epicId') ?? '',
    sprintId: searchParams.get('sprintId') ?? '',
    teamId: searchParams.get('teamId') ?? '',
    customFieldFilters,
  };
}

function buildCreateDraft(projects: Project[], presetState: string | null, customFieldDefinitions: CustomFieldDefinition[]): CreateDraft {
  return {
    title: '',
    description: '',
    type: 'TASK',
    projectId: projects[0] ? String(projects[0].id) : '',
    state: presetState ?? 'TODO',
    priority: 'MEDIUM',
    teamId: '',
    epicId: '',
    sprintId: '',
    customFields: Object.fromEntries(customFieldDefinitions.filter((field) => field.showOnCreate).map((field) => [field.key, undefined])),
  };
}

function buildFilterSummary(
  filters: FilterDraft,
  projects: Project[],
  epics: Epic[],
  sprints: Sprint[],
  teams: Team[],
  members: TeamMember[],
  definitions: CustomFieldDefinition[],
  isZh: boolean
) {
  const items: string[] = [];
  if (filters.q) items.push(`${isZh ? '搜索' : 'Search'}: ${filters.q}`);
  if (filters.type) items.push(labelForType(filters.type, isZh));
  if (filters.state) items.push(labelForState(filters.state, isZh));
  if (filters.priority) items.push(labelForPriority(filters.priority, isZh));
  if (filters.assigneeId) items.push(members.find((member) => String(member.id) === filters.assigneeId)?.name ?? `#${filters.assigneeId}`);
  if (filters.projectId) items.push(projects.find((item) => String(item.id) === filters.projectId)?.name ?? `#${filters.projectId}`);
  if (filters.epicId) items.push(epics.find((item) => String(item.id) === filters.epicId)?.title ?? `#${filters.epicId}`);
  if (filters.sprintId) items.push(sprints.find((item) => String(item.id) === filters.sprintId)?.name ?? `#${filters.sprintId}`);
  if (filters.teamId) items.push(teams.find((item) => String(item.id) === filters.teamId)?.name ?? `#${filters.teamId}`);
  Object.entries(filters.customFieldFilters).forEach(([key, value]) => {
    if (!value) return;
    const field = definitions.find((item) => item.key === key);
    items.push(`${field?.name ?? key}: ${value}`);
  });
  return items;
}

function serializeCreateCustomFields(values: Record<string, unknown>, definitions: CustomFieldDefinition[]) {
  const payload: Record<string, unknown> = {};
  for (const field of definitions) {
    const rawValue = values[field.key];
    if (rawValue == null || rawValue === '') continue;
    payload[field.key] = rawValue;
  }
  return payload;
}

function clearCustomFieldParams(params: URLSearchParams) {
  [...params.keys()].forEach((key) => {
    if (key.startsWith('cf_')) params.delete(key);
  });
}

function toNullableNumber(value: string) {
  return value ? Number(value) : null;
}

function normalizeEmpty(value: string) {
  return value || null;
}

function normalizeView(value: string | null): IssueView {
  if (value === 'active' || value === 'backlog' || value === 'done') return value;
  return 'all';
}

function groupBelongsToView(state: string, view: IssueView) {
  if (view === 'all') return true;
  if (view === 'backlog') return state === 'BACKLOG';
  if (view === 'done') return state === 'DONE';
  return ACTIVE_STATES.includes(state as (typeof ACTIVE_STATES)[number]);
}

function labelForState(state: string, isZh: boolean) {
  const map: Record<string, [string, string]> = {
    BACKLOG: ['Backlog', 'Backlog'],
    TODO: ['Todo', '待开始'],
    IN_PROGRESS: ['In progress', '进行中'],
    IN_REVIEW: ['In review', '待评审'],
    DONE: ['Done', '已完成'],
    CANCELED: ['Canceled', '已取消'],
  };
  const pair = map[state] ?? [state, state];
  return isZh ? pair[1] : pair[0];
}

function labelForPriority(priority: string, isZh: boolean) {
  const map: Record<string, [string, string]> = {
    LOW: ['Low', '低'],
    MEDIUM: ['Medium', '中'],
    HIGH: ['High', '高'],
    URGENT: ['Urgent', '紧急'],
  };
  const pair = map[priority] ?? [priority, priority];
  return isZh ? pair[1] : pair[0];
}

function labelForType(type: string, isZh: boolean) {
  const map: Record<string, [string, string]> = {
    FEATURE: ['Feature', '需求'],
    TASK: ['Task', '任务'],
    BUG: ['Bug', '缺陷'],
    TECH_DEBT: ['Tech debt', '技术债'],
  };
  const pair = map[type] ?? [type, type];
  return isZh ? pair[1] : pair[0];
}

function formatDate(value: string, locale: string) {
  try {
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'zh-CN', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function writeValue(params: URLSearchParams, key: string, value: string | null | undefined) {
  if (!value) {
    params.delete(key);
  } else {
    params.set(key, value);
  }
}
