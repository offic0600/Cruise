'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Ban, CheckCircle2, ChevronDown, ChevronRight, Circle, CircleDashed, CircleEllipsis, FilterX, LoaderCircle, Maximize2, Paperclip, Plus, Search, SlidersHorizontal, X } from 'lucide-react';
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
import type { CustomFieldDefinition, Issue, Project, Team } from '@/lib/api';
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
  customFields: Record<string, unknown>;
};

const EMPTY = '__empty__';
const GROUP_ORDER = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELED'] as const;
const STATE_CATEGORIES = ['BACKLOG', 'ACTIVE', 'REVIEW', 'COMPLETED', 'CANCELED'] as const;
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
  const collapsedStates = useMemo(() => readCollapsedStates(searchParams), [searchParamsKey]);
  const collapseInitRef = useRef(new Set<string>());

  const apiFilters = useMemo(
    () => buildIssueFilters(searchParams, organizationId),
    [organizationId, searchParamsKey]
  );
  const {
    issuesQuery,
    customFieldDefinitionsQuery,
    projectsQuery,
    teamsQuery,
    membersQuery,
  } = useIssueWorkspace(apiFilters);
  const { createIssueMutation } = useIssueMutations(apiFilters);

  const issues = useMemo(() => issuesQuery.data ?? [], [issuesQuery.data]);
  const customFieldDefinitions = useMemo(
    () => (customFieldDefinitionsQuery.data ?? []).filter((field) => field.isActive),
    [customFieldDefinitionsQuery.data]
  );
  const projects = useMemo(() => projectsQuery.data ?? [], [projectsQuery.data]);
  const teams = useMemo(() => (teamsQuery.data ?? []) as Team[], [teamsQuery.data]);
  const members = useMemo(() => (membersQuery.data ?? []) as TeamMember[], [membersQuery.data]);

  const [searchValue, setSearchValue] = useState(searchParams.get('q') ?? '');
  const [filterOpen, setFilterOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [quickCreateState, setQuickCreateState] = useState<string | null>(null);
  const [createMore, setCreateMore] = useState(false);
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
        isZh ? 'Unable to load issues. Confirm the backend on port 8080 is reachable.' : 'Unable to load issues. Confirm the backend on port 8080 is reachable.'
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
      active: issues.filter((issue) => issue.stateCategory === 'ACTIVE' || issue.stateCategory === 'REVIEW').length,
      backlog: issues.filter((issue) => issue.stateCategory === 'BACKLOG').length,
      done: issues.filter((issue) => issue.stateCategory === 'COMPLETED').length,
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
  useEffect(() => {
    const initKey = collapseInitializationKey(searchParams);
    if (collapseInitRef.current.has(initKey)) return;
    const missingEmptyStates = groupedIssues.filter((group) => group.issues.length === 0 && !collapsedStates.has(group.state)).map((group) => group.state);
    collapseInitRef.current.add(initKey);
    if (!missingEmptyStates.length) return;
    updateQuery({ collapsed: serializeCollapsedStates(new Set([...collapsedStates, ...missingEmptyStates])) });
  }, [collapsedStates, groupedIssues, searchParams]);
  const effectiveCollapsedStates = useMemo(() => {
    const next = new Set(collapsedStates);
    for (const group of groupedIssues) {
      if (group.issues.length === 0) next.add(group.state);
    }
    return next;
  }, [collapsedStates, groupedIssues]);

  const filterSummary = useMemo(
    () => buildFilterSummary(draftFilters, projects, teams, members, customFieldDefinitions, isZh),
    [customFieldDefinitions, draftFilters, isZh, members, projects, teams]
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
    writeValue(params, 'teamId', normalizeEmpty(draftFilters.teamId));
    Object.entries(draftFilters.customFieldFilters).forEach(([key, value]) => writeValue(params, `cf_${key}`, value));
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    setFilterOpen(false);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    ['q', 'type', 'state', 'priority', 'assigneeId', 'projectId', 'teamId'].forEach((key) => params.delete(key));
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
        customFields: serializeCreateCustomFields(createDraft.customFields, createDefinitions),
      });
      if (createMore) {
        setCreateDraft(buildCreateDraft(projects, quickCreateState, customFieldDefinitions));
      } else {
        setCreateOpen(false);
        setQuickCreateState(null);
      }
    } catch {
      setWorkspaceError(isZh ? 'Failed to create issue. Please try again.' : 'Failed to create issue. Please try again.');
    }
  };

  const toggleGroupCollapsed = (state: string) => {
    const nextCollapsed = new Set(collapsedStates);
    if (nextCollapsed.has(state)) {
      nextCollapsed.delete(state);
    } else {
      nextCollapsed.add(state);
    }
    updateQuery({ collapsed: serializeCollapsedStates(nextCollapsed) });
  };

  return (
    <AppLayout>
      <div className="space-y-4 px-8 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {([
              ['all', isZh ? 'All issues' : 'All issues'],
              ['active', isZh ? 'Active' : 'Active'],
              ['backlog', isZh ? 'Backlog' : 'Backlog'],
              ['done', isZh ? 'Done' : 'Done'],
            ] as const).map(([view, label]) => (
              <button
                key={view}
                onClick={() => updateQuery({ view })}
                className={`rounded-full px-3 py-1.5 text-[13px] transition ${
                  currentView === view ? 'bg-slate-900 text-white' : 'bg-white text-ink-700 hover:bg-slate-100'
                }`}
              >
                {view === 'done' ? (isZh ? 'Completed' : 'Completed') : label}
                <span className="ml-2 text-xs opacity-70">{viewCounts[view]}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <form onSubmit={handleSearchSubmit} className="relative min-w-[240px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <Input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder={isZh ? 'Search title or identifier' : 'Search title or identifier'}
                className="h-9 rounded-full pl-9 pr-3 text-[13px]"
              />
            </form>
            <Button variant="secondary" size="sm" className="h-9 rounded-full px-3 text-[13px]" onClick={() => setFilterOpen(true)}>
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              {isZh ? 'Advanced filter' : 'Advanced filter'}
            </Button>
            <Button size="sm" className="h-9 rounded-full px-3 text-[13px]" onClick={() => openCreateSheet()}>
              <Plus className="mr-2 h-4 w-4" />
              {isZh ? 'New issue' : 'New issue'}
            </Button>
          </div>
        </div>

        {filterSummary.length ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {filterSummary.map((item) => (
              <Badge key={item} variant="neutral" className="gap-1 px-2.5 py-1 text-[11px] font-medium text-ink-500">
                {item}
              </Badge>
            ))}
            <button onClick={clearFilters} className="inline-flex items-center gap-1 text-[11px] text-ink-400 transition hover:text-ink-700">
              <FilterX className="h-3.5 w-3.5" />
              {isZh ? 'Clear filters' : 'Clear filters'}
            </button>
          </div>
        ) : null}

        {workspaceError ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{workspaceError}</div>
        ) : null}

        <div className="space-y-1">
          {groupedIssues.map((group) => (
            <section key={group.state} className="border-b border-border-soft last:border-b-0">
              <button
                type="button"
                onClick={() => toggleGroupCollapsed(group.state)}
                aria-expanded={!effectiveCollapsedStates.has(group.state)}
                className="flex w-full items-center px-3 py-2.5 text-left transition hover:bg-slate-50/40"
              >
                <div className="flex items-center gap-2 text-sm font-medium text-ink-900">
                  {effectiveCollapsedStates.has(group.state) ? (
                    <ChevronRight className="h-4 w-4 text-ink-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-ink-400" />
                  )}
                  <StateIcon state={group.state} />
                  <span>{labelForState(group.state, isZh)}</span>
                  <span className="text-ink-400">{group.issues.length}</span>
                </div>
              </button>

              {!effectiveCollapsedStates.has(group.state) ? group.issues.length ? (
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
                      onOpen={() => router.push(`/${locale}/issues/${issue.id}`)}
                    />
                  ))}
                </div>
              ) : (
                <div className="px-9 py-2 text-[11px] text-ink-300">{isZh ? 'No issues in this group.' : 'No issues in this group.'}</div>
              ) : null}
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
        teams={teams}
        onClear={clearFilters}
        onApply={applyFilterDraft}
      />

      <CreateIssueDialog
        open={createOpen}
        setOpen={setCreateOpen}
        isZh={isZh}
        draft={createDraft}
        setDraft={setCreateDraft}
        projects={projects}
        teams={teams}
        members={members}
        createDefinitions={createDefinitions}
        createPending={createIssueMutation.isPending}
        createMore={createMore}
        setCreateMore={setCreateMore}
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
              <SheetTitle className="mt-2">{isZh ? 'Advanced filter' : 'Advanced filter'}</SheetTitle>
            </div>
            <SheetDismissButton aria-label={isZh ? 'Cancel' : 'Cancel'} />
          </div>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="space-y-5 px-6 py-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FilterField label={isZh ? 'Search' : 'Search'}>
                <Input value={draftFilters.q} onChange={(event) => setDraftFilters((current) => ({ ...current, q: event.target.value }))} />
              </FilterField>
              <FilterField label={isZh ? 'Type' : 'Type'}>
                <SimpleSelect value={draftFilters.type || EMPTY} onValueChange={(value) => setDraftFilters((current) => ({ ...current, type: value === EMPTY ? '' : value }))}>
                  <SelectItem value={EMPTY}>{isZh ? 'All types' : 'All types'}</SelectItem>
                  {TYPE_OPTIONS.map((value) => <SelectItem key={value} value={value}>{labelForType(value, isZh)}</SelectItem>)}
                </SimpleSelect>
              </FilterField>
              <FilterField label={isZh ? 'State' : 'State'}>
                <SimpleSelect value={draftFilters.state || EMPTY} onValueChange={(value) => setDraftFilters((current) => ({ ...current, state: value === EMPTY ? '' : value }))}>
                  <SelectItem value={EMPTY}>{isZh ? 'All states' : 'All states'}</SelectItem>
                  {GROUP_ORDER.map((value) => <SelectItem key={value} value={value}>{labelForState(value, isZh)}</SelectItem>)}
                </SimpleSelect>
              </FilterField>
              <FilterField label={isZh ? 'Priority' : 'Priority'}>
                <SimpleSelect value={draftFilters.priority || EMPTY} onValueChange={(value) => setDraftFilters((current) => ({ ...current, priority: value === EMPTY ? '' : value }))}>
                  <SelectItem value={EMPTY}>{isZh ? 'All priorities' : 'All priorities'}</SelectItem>
                  {PRIORITY_OPTIONS.map((value) => <SelectItem key={value} value={value}>{labelForPriority(value, isZh)}</SelectItem>)}
                </SimpleSelect>
              </FilterField>
              <LookupField label={isZh ? 'Assignee' : 'Assignee'} items={members} value={draftFilters.assigneeId} emptyLabel={isZh ? 'All members' : 'All members'} onChange={(value) => setDraftFilters((current) => ({ ...current, assigneeId: value }))} />
        <LookupField label={isZh ? 'Project' : 'Project'} items={projects} value={draftFilters.projectId} emptyLabel={isZh ? 'All projects' : 'All projects'} onChange={(value) => setDraftFilters((current) => ({ ...current, projectId: value }))} />
        <LookupField label={isZh ? 'Team' : 'Team'} items={teams} value={draftFilters.teamId} emptyLabel={isZh ? 'All teams' : 'All teams'} onChange={(value) => setDraftFilters((current) => ({ ...current, teamId: value }))} />
            </div>

            {customFieldDefinitions.filter((field) => field.isFilterable).length ? (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="text-sm font-medium text-ink-900">{isZh ? 'Custom fields' : 'Custom fields'}</div>
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
              <Button variant="secondary" onClick={onClear}>{isZh ? 'Clear filters' : 'Clear filters'}</Button>
              <Button onClick={onApply}>{isZh ? 'Apply filters' : 'Apply filters'}</Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function CreateIssueDialog({
  open,
  setOpen,
  isZh,
  draft,
  setDraft,
  projects,
  teams,
  members,
  createDefinitions,
  createPending,
  createMore,
  setCreateMore,
  onSubmit,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  isZh: boolean;
  draft: CreateDraft;
  setDraft: React.Dispatch<React.SetStateAction<CreateDraft>>;
  projects: Project[];
  teams: Team[];
  members: TeamMember[];
  createDefinitions: CustomFieldDefinition[];
  createPending: boolean;
  createMore: boolean;
  setCreateMore: (value: boolean) => void;
  onSubmit: () => Promise<void>;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/16 px-6 py-10 backdrop-blur-[2px]" onClick={() => setOpen(false)}>
      <div
        className="flex w-full max-w-[760px] flex-col overflow-hidden rounded-[28px] border border-black/6 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5">
          <div className="flex items-center gap-2 text-sm text-ink-400">
            <div className="flex h-5 items-center rounded-md border border-border-soft px-1.5 text-[12px] font-medium text-brand-600">
              {projects.find((project) => String(project.id) === draft.projectId)?.key ?? 'ISS'}
            </div>
            <span>{'>'}</span>
            <span>{isZh ? 'New issue' : 'New issue'}</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-full p-2 text-ink-400 transition hover:bg-slate-100 hover:text-ink-700" type="button">
              <Maximize2 className="h-4 w-4" />
            </button>
            <button className="rounded-full p-2 text-ink-400 transition hover:bg-slate-100 hover:text-ink-700" type="button" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-5 px-5 pb-5 pt-4">
          <input
            value={draft.title}
            onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
            placeholder={isZh ? 'Issue title' : 'Issue title'}
            className="w-full border-0 bg-transparent p-0 text-[34px] font-semibold tracking-[-0.03em] text-ink-900 outline-none placeholder:text-ink-300"
          />

          <textarea
            value={draft.description}
            onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
            placeholder={isZh ? 'Add description...' : 'Add description...'}
            className="min-h-[72px] w-full resize-none border-0 bg-transparent p-0 text-[17px] leading-7 text-ink-700 outline-none placeholder:text-ink-300"
          />

          <div className="flex flex-wrap items-center gap-2">
            <ModalPillSelect value={draft.state} onValueChange={(value) => setDraft((current) => ({ ...current, state: value }))}>
              {GROUP_ORDER.filter((value) => value !== 'CANCELED').map((value) => <SelectItem key={value} value={value}>{labelForState(value, isZh)}</SelectItem>)}
            </ModalPillSelect>
            <ModalPillSelect value={draft.priority} onValueChange={(value) => setDraft((current) => ({ ...current, priority: value }))}>
              {PRIORITY_OPTIONS.map((value) => <SelectItem key={value} value={value}>{labelForPriority(value, isZh)}</SelectItem>)}
            </ModalPillSelect>
            <ModalPillSelect value={draft.teamId || EMPTY} onValueChange={(value) => setDraft((current) => ({ ...current, teamId: value === EMPTY ? '' : value }))}>
              <SelectItem value={EMPTY}>{isZh ? 'Team' : 'Team'}</SelectItem>
              {teams.map((team) => <SelectItem key={team.id} value={String(team.id)}>{team.name}</SelectItem>)}
            </ModalPillSelect>
            <ModalPillSelect value={draft.projectId || EMPTY} onValueChange={(value) => setDraft((current) => ({ ...current, projectId: value === EMPTY ? '' : value }))}>
              <SelectItem value={EMPTY}>{isZh ? 'Project' : 'Project'}</SelectItem>
              {projects.map((project) => <SelectItem key={project.id} value={String(project.id)}>{project.name}</SelectItem>)}
            </ModalPillSelect>
            {createDefinitions.slice(0, 2).map((field) => (
              <ModalCustomFieldPill
                key={field.id}
                field={field}
                isZh={isZh}
                value={draft.customFields[field.key]}
                members={members}
                teams={teams}
                onChange={(value) => setDraft((current) => ({
                  ...current,
                  customFields: { ...current.customFields, [field.key]: value },
                }))}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border-soft px-5 py-4">
          <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-soft text-ink-500 transition hover:bg-slate-50 hover:text-ink-900">
            <Paperclip className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2 text-sm text-ink-500">
              <button
                type="button"
                aria-pressed={createMore}
                onClick={() => setCreateMore(!createMore)}
                className={`relative h-5 w-9 rounded-full transition ${createMore ? 'bg-brand-600' : 'bg-slate-200'}`}
              >
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${createMore ? 'left-[18px]' : 'left-0.5'}`} />
              </button>
              <span>{isZh ? 'Create more' : 'Create more'}</span>
            </label>
            <Button onClick={onSubmit} disabled={!draft.title.trim() || !draft.projectId || createPending} className="rounded-full px-5">
              {createPending ? (isZh ? 'Creating...' : 'Creating...') : (isZh ? 'Create issue' : 'Create issue')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function IssueRow({
  issue,
  locale,
  isZh,
  members,
  projects,
  isLast,
  onOpen,
}: {
  issue: Issue;
  locale: string;
  isZh: boolean;
  members: TeamMember[];
  projects: Project[];
  isLast: boolean;
  onOpen: () => void;
}) {
  const assignee = members.find((member) => member.id === issue.assigneeId);
  const project = projects.find((item) => item.id === issue.projectId);
  const assigneeLabel = assignee?.name ?? (isZh ? 'Not set' : 'Not set');
  const priorityLabel = labelForPriority(issue.priority, isZh);
  const resolutionLabel =
    issue.state === 'CANCELED' && issue.resolution && issue.resolution !== 'CANCELED'
      ? `${labelForState(issue.state, isZh)} · ${labelForResolution(issue.resolution, isZh)}`
      : null;

  return (
    <div
      onClick={onOpen}
      className={`grid cursor-pointer grid-cols-[minmax(0,1fr)_170px_110px_72px] items-center gap-4 px-3 py-2.5 transition hover:bg-slate-50/40 ${isLast ? '' : 'border-b border-border-soft'}`}
    >
      <div className="min-w-0 space-y-1">
        <div className="flex items-center gap-3 text-sm">
          <span className="inline-flex h-5 w-5 items-center justify-center text-ink-500">
            <StateIcon state={issue.state} />
          </span>
          <span className="font-medium text-ink-400">{issue.identifier}</span>
          <span className="truncate text-[15px] text-ink-900">{issue.title}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 pl-8 text-[12px] text-ink-400">
          <span>{labelForType(issue.type, isZh)}</span>
          {project ? <span>{project.name}</span> : null}
          {resolutionLabel ? <span>{resolutionLabel}</span> : null}
        </div>
      </div>

      <div className="truncate text-[13px] text-ink-500">
        <span>{assigneeLabel}</span>
      </div>

      <div className="text-[13px] text-ink-500">
        <span>{priorityLabel}</span>
      </div>

      <div className="text-right text-[12px] text-ink-400">
        <span>{formatDate(issue.updatedAt, locale)}</span>
      </div>
    </div>
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
          <SelectItem value={EMPTY}>{isZh ? 'Any' : 'Any'}</SelectItem>
          <SelectItem value="true">{isZh ? 'True' : 'True'}</SelectItem>
          <SelectItem value="false">{isZh ? 'False' : 'False'}</SelectItem>
        </SimpleSelect>
      </FilterField>
    );
  }

  if (field.dataType === 'SINGLE_SELECT' || field.dataType === 'MULTI_SELECT') {
    return (
      <FilterField label={field.name}>
        <SimpleSelect value={value || EMPTY} onValueChange={(next) => onChange(next === EMPTY ? '' : next)}>
          <SelectItem value={EMPTY}>{isZh ? 'Any' : 'Any'}</SelectItem>
          {field.options.map((option) => <SelectItem key={option.id} value={option.value}>{option.label}</SelectItem>)}
        </SimpleSelect>
      </FilterField>
    );
  }

  if (field.dataType === 'USER') {
    return <LookupField label={field.name} items={members} value={value} emptyLabel={isZh ? 'Any' : 'Any'} onChange={onChange} />;
  }

  if (field.dataType === 'TEAM') {
    return <LookupField label={field.name} items={teams} value={value} emptyLabel={isZh ? 'Any' : 'Any'} onChange={onChange} />;
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
          <SelectItem value={EMPTY}>{isZh ? 'Not set' : 'Not set'}</SelectItem>
          <SelectItem value="true">{isZh ? 'True' : 'True'}</SelectItem>
          <SelectItem value="false">{isZh ? 'False' : 'False'}</SelectItem>
        </SimpleSelect>
      </FilterField>
    );
  }

  if (field.dataType === 'SINGLE_SELECT' || field.dataType === 'MULTI_SELECT') {
    return (
      <FilterField label={field.name}>
        <SimpleSelect value={String(value ?? EMPTY)} onValueChange={(next) => onChange(next === EMPTY ? undefined : next)}>
          <SelectItem value={EMPTY}>{isZh ? 'Not set' : 'Not set'}</SelectItem>
          {field.options.map((option) => <SelectItem key={option.id} value={option.value}>{option.label}</SelectItem>)}
        </SimpleSelect>
      </FilterField>
    );
  }

  if (field.dataType === 'USER') {
    return <LookupField label={field.name} items={members} value={String(value ?? '')} emptyLabel={isZh ? 'Not set' : 'Not set'} onChange={(next) => onChange(next ? Number(next) : undefined)} />;
  }

  if (field.dataType === 'TEAM') {
    return <LookupField label={field.name} items={teams} value={String(value ?? '')} emptyLabel={isZh ? 'Not set' : 'Not set'} onChange={(next) => onChange(next ? Number(next) : undefined)} />;
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

function ModalPillSelect({
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
      <SelectTrigger className="h-10 w-auto min-w-0 rounded-full border-border-soft bg-white px-3 py-0 text-sm text-ink-700 shadow-none">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  );
}

function ModalCustomFieldPill({
  field,
  isZh,
  value,
  members,
  teams,
  onChange,
}: {
  field: CustomFieldDefinition;
  isZh: boolean;
  value: unknown;
  members: TeamMember[];
  teams: Team[];
  onChange: (value: unknown) => void;
}) {
  if (field.dataType === 'SINGLE_SELECT' || field.dataType === 'MULTI_SELECT') {
    return (
      <ModalPillSelect value={String(value ?? EMPTY)} onValueChange={(next) => onChange(next === EMPTY ? undefined : next)}>
        <SelectItem value={EMPTY}>{field.name}</SelectItem>
        {field.options.map((option) => <SelectItem key={option.id} value={option.value}>{option.label}</SelectItem>)}
      </ModalPillSelect>
    );
  }

  if (field.dataType === 'BOOLEAN') {
    return (
      <ModalPillSelect value={String(value ?? EMPTY)} onValueChange={(next) => onChange(next === EMPTY ? undefined : next === 'true')}>
        <SelectItem value={EMPTY}>{field.name}</SelectItem>
        <SelectItem value="true">{isZh ? 'True' : 'True'}</SelectItem>
        <SelectItem value="false">{isZh ? 'False' : 'False'}</SelectItem>
      </ModalPillSelect>
    );
  }

  if (field.dataType === 'USER') {
    return (
      <ModalPillSelect value={String(value ?? EMPTY)} onValueChange={(next) => onChange(next === EMPTY ? undefined : Number(next))}>
        <SelectItem value={EMPTY}>{field.name}</SelectItem>
        {members.map((member) => <SelectItem key={member.id} value={String(member.id)}>{member.name}</SelectItem>)}
      </ModalPillSelect>
    );
  }

  if (field.dataType === 'TEAM') {
    return (
      <ModalPillSelect value={String(value ?? EMPTY)} onValueChange={(next) => onChange(next === EMPTY ? undefined : Number(next))}>
        <SelectItem value={EMPTY}>{field.name}</SelectItem>
        {teams.map((team) => <SelectItem key={team.id} value={String(team.id)}>{team.name}</SelectItem>)}
      </ModalPillSelect>
    );
  }

  return (
    <div className="inline-flex h-10 items-center rounded-full border border-border-soft px-3 text-sm text-ink-400">
      {field.name}
    </div>
  );
}

function StateIcon({ state }: { state: string }) {
  if (state === 'BACKLOG') return <CircleDashed className="h-4 w-4 text-slate-300" />;
  if (state === 'TODO') return <Circle className="h-4 w-4 text-slate-500" />;
  if (state === 'IN_PROGRESS') return <LoaderCircle className="h-4 w-4 text-sky-600" />;
  if (state === 'IN_REVIEW') return <CircleEllipsis className="h-4 w-4 text-amber-600" />;
  if (state === 'DONE') return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
  if (state === 'CANCELED') return <Ban className="h-4 w-4 text-slate-400" />;
  return <Circle className="h-4 w-4 text-slate-400" />;
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
    customFields: Object.fromEntries(customFieldDefinitions.filter((field) => field.showOnCreate).map((field) => [field.key, undefined])),
  };
}

function buildFilterSummary(
  filters: FilterDraft,
  projects: Project[],
  teams: Team[],
  members: TeamMember[],
  definitions: CustomFieldDefinition[],
  isZh: boolean
) {
  const items: string[] = [];
  if (filters.q) items.push(`${isZh ? 'Search' : 'Search'}: ${filters.q}`);
  if (filters.type) items.push(labelForType(filters.type, isZh));
  if (filters.state) items.push(labelForState(filters.state, isZh));
  if (filters.priority) items.push(labelForPriority(filters.priority, isZh));
  if (filters.assigneeId) items.push(members.find((member) => String(member.id) === filters.assigneeId)?.name ?? `#${filters.assigneeId}`);
  if (filters.projectId) items.push(projects.find((item) => String(item.id) === filters.projectId)?.name ?? `#${filters.projectId}`);
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

function readCollapsedStates(searchParams: URLSearchParams) {
  const raw = searchParams.get('collapsed');
  if (!raw) return new Set<string>();

  return new Set(
    raw
      .split(',')
      .map((value) => value.trim())
      .filter((value): value is string => Boolean(value) && GROUP_ORDER.includes(value as (typeof GROUP_ORDER)[number]))
  );
}

function serializeCollapsedStates(states: Set<string>) {
  const values = GROUP_ORDER.filter((state) => states.has(state));
  return values.length ? values.join(',') : null;
}

function collapseInitializationKey(searchParams: URLSearchParams) {
  const params = new URLSearchParams(searchParams.toString());
  params.delete('collapsed');
  return params.toString();
}

function groupBelongsToView(state: string, view: IssueView) {
  if (view === 'all') return true;
  const category = stateCategoryFor(state);
  if (view === 'backlog') return category === 'BACKLOG';
  if (view === 'done') return category === 'COMPLETED';
  return category === 'ACTIVE' || category === 'REVIEW';
}

function stateCategoryFor(state: string) {
  const map: Record<string, (typeof STATE_CATEGORIES)[number]> = {
    BACKLOG: 'BACKLOG',
    TODO: 'ACTIVE',
    IN_PROGRESS: 'ACTIVE',
    IN_REVIEW: 'REVIEW',
    DONE: 'COMPLETED',
    CANCELED: 'CANCELED',
  };
  return map[state] ?? 'ACTIVE';
}

function labelForState(state: string, isZh: boolean) {
  const map: Record<string, [string, string]> = {
    BACKLOG: ['Backlog', '待规划'],
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

function labelForResolution(resolution: string, isZh: boolean) {
  const map: Record<string, [string, string]> = {
    COMPLETED: ['Completed', '已完成'],
    CANCELED: ['Canceled', '已取消'],
    DUPLICATE: ['Duplicate', '重复'],
    OBSOLETE: ['Obsolete', '已过时'],
    WONT_DO: ["Won't do", '不处理'],
  };
  const pair = map[resolution] ?? [resolution, resolution];
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

