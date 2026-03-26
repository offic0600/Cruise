'use client';

import { useEffect, useMemo, useState } from 'react';
import { Copy, Eye, Filter, FolderKanban, LayoutList, Star, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { useCurrentWorkspace } from '@/components/providers/WorkspaceProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useI18n } from '@/i18n/useI18n';
import type {
  FilterCondition,
  FilterGroup,
  Issue,
  Project,
  View,
  ViewQueryState,
  ViewResourceType,
  ViewScopeType,
  ViewVisibility,
} from '@/lib/api/types';
import {
  useCreateView,
  useDeleteView,
  useDuplicateView,
  useFavoriteView,
  useUpdateView,
  useViewDetail,
  useViewResults,
  useViewsIndex,
} from '@/lib/query/views';
import { teamViewsPath, workspaceViewPath, workspaceViewsPath } from '@/lib/routes';

type ConditionDraft = {
  field: string;
  operator: string;
  value: string;
};

const ISSUE_FIELDS = [
  'state',
  'stateCategory',
  'priority',
  'assigneeId',
  'labelIds',
  'projectId',
  'createdAt',
  'updatedAt',
  'completedAt',
  'teamId',
] as const;

const ISSUE_COLUMNS = ['identifier', 'title', 'priority', 'state', 'assignee', 'project', 'labels', 'updatedAt', 'createdAt'] as const;
const PROJECT_COLUMNS = ['key', 'name', 'status', 'ownerId', 'teamId', 'updatedAt', 'createdAt'] as const;

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function defaultQueryState(resourceType: ViewResourceType): ViewQueryState {
  return {
    filters: { operator: 'AND', children: [] },
    display: {
      layout: 'LIST',
      visibleColumns: resourceType === 'ISSUE' ? [...ISSUE_COLUMNS] : [...PROJECT_COLUMNS],
      density: 'comfortable',
      showSubIssues: true,
      showEmptyGroups: true,
    },
    grouping: { field: null },
    sorting: [{ field: 'updatedAt', direction: 'desc', nulls: 'last' }],
  };
}

function queryStateEquals(left: ViewQueryState | null | undefined, right: ViewQueryState | null | undefined) {
  return JSON.stringify(left ?? null) === JSON.stringify(right ?? null);
}

function flattenConditions(filters: FilterGroup | null | undefined): ConditionDraft[] {
  if (!filters) return [];
  return filters.children.flatMap((child) => {
    if ('children' in child) return flattenConditions(child);
    return [{
      field: child.field,
      operator: child.operator,
      value: Array.isArray(child.value) ? child.value.join(', ') : String(child.value ?? ''),
    }];
  });
}

function inflateConditions(operator: 'AND' | 'OR', conditions: ConditionDraft[]): FilterGroup {
  return {
    operator,
    children: conditions
      .filter((condition) => condition.field.trim())
      .map((condition): FilterCondition => {
        const normalizedValue = condition.value.includes(',') && ['in', 'notIn', 'between'].includes(condition.operator)
          ? condition.value.split(',').map((part) => part.trim()).filter(Boolean)
          : condition.value.trim();
        return {
          field: condition.field,
          operator: condition.operator as FilterCondition['operator'],
          value: normalizedValue === '' ? undefined : normalizedValue,
        };
      }),
  };
}

function columnLabel(column: string) {
  return column.replace(/([A-Z])/g, ' $1').replace(/^./, (match) => match.toUpperCase());
}

export default function ViewsWorkbench({
  viewId,
  defaultResourceType,
  scopeType,
  scopeId,
  teamKey,
}: {
  viewId?: number;
  defaultResourceType?: ViewResourceType;
  scopeType?: ViewScopeType;
  scopeId?: number | null;
  teamKey?: string | null;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const { organizationId, currentOrganizationSlug, currentTeamKey } = useCurrentWorkspace();
  const viewQuery = useViewDetail(viewId ?? null);
  const activeView = viewQuery.data ?? null;
  const resourceType = activeView?.resourceType ?? defaultResourceType ?? 'ISSUE';
  const effectiveScopeType = activeView?.scopeType ?? scopeType ?? 'WORKSPACE';
  const effectiveScopeId = activeView?.scopeId ?? scopeId ?? null;
  const viewsIndexQuery = useViewsIndex({
    organizationId,
    resourceType,
    scopeType: effectiveScopeType,
    scopeId: effectiveScopeId,
    includeFavorites: true,
    includeSystem: true,
  });
  const indexViews = viewsIndexQuery.data ?? [];
  const [draftQueryState, setDraftQueryState] = useState<ViewQueryState>(() => defaultQueryState(resourceType));
  const [draftName, setDraftName] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [draftVisibility, setDraftVisibility] = useState<ViewVisibility>('PERSONAL');
  const [conditions, setConditions] = useState<ConditionDraft[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!activeView) return;
    const nextState = deepClone(activeView.queryState ?? defaultQueryState(activeView.resourceType));
    setDraftQueryState(nextState);
    setDraftName(activeView.name);
    setDraftDescription(activeView.description ?? '');
    setDraftVisibility(activeView.visibility);
    setConditions(flattenConditions(nextState.filters));
  }, [activeView]);

  useEffect(() => {
    if (activeView) return;
    setDraftVisibility(effectiveScopeType === 'TEAM' ? 'TEAM' : 'PERSONAL');
  }, [activeView, effectiveScopeType]);

  const resultsQuery = useViewResults<Issue | Project>(activeView?.id ?? null, {
    page: 0,
    size: 100,
    queryState: activeView ? draftQueryState : undefined,
  });

  const createViewMutation = useCreateView();
  const updateViewMutation = useUpdateView();
  const duplicateViewMutation = useDuplicateView();
  const favoriteViewMutation = useFavoriteView();
  const deleteViewMutation = useDeleteView();

  const dirty = useMemo(() => {
    if (!activeView) return false;
    return (
      draftName !== activeView.name ||
      draftDescription !== (activeView.description ?? '') ||
      draftVisibility !== activeView.visibility ||
      !queryStateEquals(draftQueryState, activeView.queryState)
    );
  }, [activeView, draftDescription, draftName, draftQueryState, draftVisibility]);

  const categorizedViews = useMemo(() => ({
    system: indexViews.filter((view) => view.isSystem),
    favorites: indexViews.filter((view) => view.isFavorite),
    custom: indexViews.filter((view) => !view.isSystem),
  }), [indexViews]);

  const visibleColumns = draftQueryState.display.visibleColumns;
  const conditionOperator = draftQueryState.filters.operator;
  const visibilityOptions = effectiveScopeType === 'TEAM'
    ? [
        { value: 'PERSONAL' as const, label: t('views.visibility.personal') },
        { value: 'TEAM' as const, label: t('views.visibility.team') },
      ]
    : [
        { value: 'PERSONAL' as const, label: t('views.visibility.personal') },
        { value: 'WORKSPACE' as const, label: t('views.visibility.workspace') },
      ];

  function updateDraft(updater: (draft: ViewQueryState) => void) {
    setDraftQueryState((current) => {
      const next = deepClone(current);
      updater(next);
      return next;
    });
  }

  async function handlePersist(target: 'save' | 'saveAsNew') {
    if (!organizationId) return;
    const nextQueryState = deepClone(draftQueryState);
    nextQueryState.filters = inflateConditions(conditionOperator, conditions);

    if (target === 'save' && activeView?.isEditable) {
      const updated = await updateViewMutation.mutateAsync({
        id: activeView.id,
        data: {
          name: draftName,
          description: draftDescription || null,
          visibility: draftVisibility,
          queryState: nextQueryState,
          layout: nextQueryState.display.layout,
        },
      });
      setStatusMessage(t('views.status.saved'));
      if (currentOrganizationSlug) router.replace(workspaceViewPath(currentOrganizationSlug, updated.id));
      return;
    }

    const created = await createViewMutation.mutateAsync({
      organizationId,
      resourceType,
      scopeType: effectiveScopeType,
      scopeId: effectiveScopeId,
      name: draftName || `${activeView?.name ?? t('views.newView')}`,
      description: draftDescription || null,
      visibility: draftVisibility,
      queryState: nextQueryState,
      layout: nextQueryState.display.layout,
    });
    setStatusMessage(t('views.status.created'));
    if (currentOrganizationSlug) router.push(workspaceViewPath(currentOrganizationSlug, created.id));
  }

  async function handleFavoriteToggle() {
    if (!activeView) return;
    await favoriteViewMutation.mutateAsync({ id: activeView.id, favorite: !activeView.isFavorite });
  }

  async function handleDuplicate() {
    if (!activeView || !currentOrganizationSlug) return;
    const duplicated = await duplicateViewMutation.mutateAsync(activeView.id);
    router.push(workspaceViewPath(currentOrganizationSlug, duplicated.id));
  }

  async function handleDelete() {
    if (!activeView?.isDeletable || !currentOrganizationSlug) return;
    await deleteViewMutation.mutateAsync(activeView.id);
    const nextTeamKey = teamKey ?? currentTeamKey;
    if (activeView.scopeType === 'TEAM' && nextTeamKey && activeView.resourceType === 'ISSUE') {
      router.push(teamViewsPath(currentOrganizationSlug, nextTeamKey, 'issues'));
      return;
    }
    router.push(workspaceViewsPath(currentOrganizationSlug, activeView.resourceType === 'ISSUE' ? 'issues' : 'projects'));
  }

  function renderValue(item: Issue | Project, column: string) {
    if ('identifier' in item) {
      const issue = item as Issue;
      switch (column) {
        case 'identifier': return issue.identifier;
        case 'title': return issue.title;
        case 'priority': return t(`common.priority.${issue.priority}`);
        case 'state': return t(`common.status.${issue.state}`);
        case 'assignee': return issue.assigneeId ? `#${issue.assigneeId}` : t('common.notSet');
        case 'project': return issue.projectId ? `#${issue.projectId}` : t('common.notSet');
        case 'labels': return issue.labels.map((label) => label.name).join(', ') || t('common.notSet');
        case 'updatedAt': return new Date(issue.updatedAt).toLocaleDateString();
        case 'createdAt': return new Date(issue.createdAt).toLocaleDateString();
        default: return '';
      }
    }
    const project = item as Project;
    switch (column) {
      case 'key': return project.key ?? t('common.notSet');
      case 'name': return project.name;
      case 'status': return project.status;
      case 'ownerId': return project.ownerId ? `#${project.ownerId}` : t('common.notSet');
      case 'teamId': return project.teamId ? `#${project.teamId}` : t('common.notSet');
      case 'updatedAt': return new Date(project.updatedAt).toLocaleDateString();
      case 'createdAt': return new Date(project.createdAt).toLocaleDateString();
      default: return '';
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-ink-900">{draftName || activeView?.name || t('views.title')}</h1>
            <p className="mt-2 text-sm text-ink-700">{draftDescription || activeView?.description || t('views.subtitle')}</p>
            {statusMessage ? <p className="mt-2 text-xs text-ink-500">{statusMessage}</p> : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {effectiveScopeType === 'WORKSPACE' ? (
              <Tabs value={resourceType} onValueChange={(value) => currentOrganizationSlug && router.push(workspaceViewsPath(currentOrganizationSlug, value === 'PROJECT' ? 'projects' : 'issues'))}>
                <TabsList>
                  <TabsTrigger value="ISSUE">{t('views.resources.issues')}</TabsTrigger>
                  <TabsTrigger value="PROJECT">{t('views.resources.projects')}</TabsTrigger>
                </TabsList>
              </Tabs>
            ) : (
              <Tabs value="ISSUE">
                <TabsList>
                  <TabsTrigger value="ISSUE">{t('views.resources.issues')}</TabsTrigger>
                </TabsList>
              </Tabs>
            )}
            <div className="flex items-center gap-2 rounded-card border border-border-soft bg-white px-3 py-2 text-sm text-ink-700">
              <span>{t('views.actions.saveTo')}</span>
              <Select value={draftVisibility} onValueChange={(value) => setDraftVisibility(value as ViewVisibility)}>
                <SelectTrigger className="h-8 min-w-[132px] border-0 bg-transparent px-0 shadow-none focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {visibilityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="secondary" onClick={() => handlePersist('saveAsNew')}>{t('views.actions.saveAsNew')}</Button>
            {activeView?.isEditable ? <Button onClick={() => handlePersist('save')} disabled={!dirty}>{t('common.save')}</Button> : null}
            <Button variant="secondary" onClick={handleDuplicate} disabled={!activeView}><Copy className="mr-2 h-4 w-4" />{t('views.actions.duplicate')}</Button>
            <Button variant="secondary" onClick={handleFavoriteToggle} disabled={!activeView}><Star className="mr-2 h-4 w-4" />{activeView?.isFavorite ? t('views.actions.unfavorite') : t('views.actions.favorite')}</Button>
            <Button variant="secondary" onClick={handleDelete} disabled={!activeView?.isDeletable}><Trash2 className="mr-2 h-4 w-4" />{t('common.delete')}</Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <Card className="rounded-panel border-border-subtle">
            <CardHeader>
              <CardTitle>{t('views.sidebar.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <ViewSection title={t('views.sidebar.system')} views={categorizedViews.system} activeId={activeView?.id} currentOrganizationSlug={currentOrganizationSlug} />
              <ViewSection title={t('views.sidebar.favorites')} views={categorizedViews.favorites} activeId={activeView?.id} currentOrganizationSlug={currentOrganizationSlug} />
              <ViewSection title={t('views.sidebar.custom')} views={categorizedViews.custom} activeId={activeView?.id} currentOrganizationSlug={currentOrganizationSlug} />
            </CardContent>
          </Card>

          <div className="space-y-6">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
              <Card className="rounded-panel border-border-subtle">
                <CardHeader>
                  <CardTitle>{t('views.toolbar.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <Input value={draftName} onChange={(event) => setDraftName(event.target.value)} placeholder={t('views.fields.name')} />
                    <Textarea value={draftDescription} onChange={(event) => setDraftDescription(event.target.value)} placeholder={t('views.fields.description')} className="min-h-[44px]" />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="secondary"><Eye className="mr-2 h-4 w-4" />{t('views.display.title')}</Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[340px] space-y-4">
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-ink-900">{t('views.display.layout')}</div>
                          <Select value={draftQueryState.display.layout} onValueChange={(value) => updateDraft((draft) => { draft.display.layout = value as 'LIST' | 'BOARD'; })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="LIST">List</SelectItem>
                              <SelectItem value="BOARD">Board</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-ink-900">{t('views.display.density')}</div>
                          <Select value={draftQueryState.display.density ?? 'comfortable'} onValueChange={(value) => updateDraft((draft) => { draft.display.density = value as 'comfortable' | 'compact'; })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="comfortable">{t('views.display.densityComfortable')}</SelectItem>
                              <SelectItem value="compact">{t('views.display.densityCompact')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-ink-900">{t('views.display.visibleColumns')}</div>
                          <div className="grid grid-cols-2 gap-2">
                            {(resourceType === 'ISSUE' ? ISSUE_COLUMNS : PROJECT_COLUMNS).map((column) => (
                              <label key={column} className="flex items-center gap-2 text-sm text-ink-700">
                                <input
                                  type="checkbox"
                                  checked={visibleColumns.includes(column)}
                                  onChange={(event) => updateDraft((draft) => {
                                    const set = new Set(draft.display.visibleColumns);
                                    if (event.target.checked) set.add(column);
                                    else set.delete(column);
                                    draft.display.visibleColumns = Array.from(set);
                                  })}
                                />
                                <span>{columnLabel(column)}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        {resourceType === 'ISSUE' ? (
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm text-ink-700">
                              <input
                                type="checkbox"
                                checked={draftQueryState.display.showSubIssues ?? true}
                                onChange={(event) => updateDraft((draft) => { draft.display.showSubIssues = event.target.checked; })}
                              />
                              <span>{t('views.display.showSubIssues')}</span>
                            </label>
                            <label className="flex items-center gap-2 text-sm text-ink-700">
                              <input
                                type="checkbox"
                                checked={draftQueryState.display.showEmptyGroups ?? true}
                                onChange={(event) => updateDraft((draft) => { draft.display.showEmptyGroups = event.target.checked; })}
                              />
                              <span>{t('views.display.showEmptyGroups')}</span>
                            </label>
                          </div>
                        ) : null}
                      </PopoverContent>
                    </Popover>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="secondary"><Filter className="mr-2 h-4 w-4" />{t('views.filters.title')}</Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[420px] space-y-4">
                        <div className="grid gap-3 md:grid-cols-[120px_minmax(0,1fr)]">
                          <Select value={conditionOperator} onValueChange={(value) => updateDraft((draft) => { draft.filters.operator = value as 'AND' | 'OR'; })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AND">AND</SelectItem>
                              <SelectItem value="OR">OR</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="secondary" onClick={() => setConditions((current) => [...current, { field: resourceType === 'ISSUE' ? 'state' : 'status', operator: 'is', value: '' }])}>
                            {t('views.filters.addCondition')}
                          </Button>
                        </div>
                        <div className="space-y-3">
                          {conditions.map((condition, index) => (
                            <div key={`${condition.field}-${index}`} className="grid gap-2 md:grid-cols-[1fr_1fr_1.4fr_auto]">
                              <Select value={condition.field} onValueChange={(value) => setConditions((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, field: value } : item))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {(resourceType === 'ISSUE' ? ISSUE_FIELDS : ['status', 'ownerId', 'teamId', 'createdAt', 'updatedAt', 'targetDate']).map((field) => (
                                    <SelectItem key={field} value={field}>{columnLabel(field)}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Select value={condition.operator} onValueChange={(value) => setConditions((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, operator: value } : item))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="is">is</SelectItem>
                                  <SelectItem value="in">in</SelectItem>
                                  <SelectItem value="contains">contains</SelectItem>
                                  <SelectItem value="isEmpty">is empty</SelectItem>
                                  <SelectItem value="isNotEmpty">is not empty</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input value={condition.value} onChange={(event) => setConditions((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, value: event.target.value } : item))} placeholder={t('views.filters.valuePlaceholder')} />
                              <Button variant="secondary" onClick={() => setConditions((current) => current.filter((_, itemIndex) => itemIndex !== index))}>{t('common.delete')}</Button>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="secondary"><LayoutList className="mr-2 h-4 w-4" />{t('views.sorting.title')}</Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[340px] space-y-4">
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-ink-900">{t('views.sorting.field')}</div>
                          <Select value={draftQueryState.sorting[0]?.field ?? 'updatedAt'} onValueChange={(value) => updateDraft((draft) => { draft.sorting = [{ ...(draft.sorting[0] ?? { direction: 'desc', nulls: 'last' }), field: value }]; })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {(resourceType === 'ISSUE' ? ISSUE_COLUMNS : PROJECT_COLUMNS).map((field) => (
                                <SelectItem key={field} value={field}>{columnLabel(field)}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-ink-900">{t('views.sorting.direction')}</div>
                          <Select value={draftQueryState.sorting[0]?.direction ?? 'desc'} onValueChange={(value) => updateDraft((draft) => { draft.sorting = [{ ...(draft.sorting[0] ?? { field: 'updatedAt', nulls: 'last' }), direction: value as 'asc' | 'desc' }]; })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="asc">{t('views.sorting.asc')}</SelectItem>
                              <SelectItem value="desc">{t('views.sorting.desc')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-ink-900">{t('views.grouping.title')}</div>
                          <Select value={draftQueryState.grouping.field ?? '__none__'} onValueChange={(value) => updateDraft((draft) => { draft.grouping.field = value === '__none__' ? null : value; })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">{t('views.grouping.none')}</SelectItem>
                              {(resourceType === 'ISSUE' ? ['state', 'priority', 'assigneeId', 'projectId', 'teamId'] : ['status', 'ownerId', 'teamId']).map((field) => (
                                <SelectItem key={field} value={field}>{columnLabel(field)}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-panel border-border-subtle">
                <CardHeader>
                  <CardTitle>{t('views.results.summary')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge>{t('views.results.total')}: {resultsQuery.data?.totalCount ?? 0}</Badge>
                    <Badge>{t('views.results.layout')}: {draftQueryState.display.layout}</Badge>
                    <Badge>{t('views.results.groupBy')}: {draftQueryState.grouping.field ?? t('views.grouping.none')}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(resultsQuery.data?.groups ?? []).slice(0, 6).map((group) => (
                      <Badge key={group.key}>{group.label} · {group.count}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-panel border-border-subtle">
              <CardHeader>
                <CardTitle>{t('views.results.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                {resultsQuery.isLoading ? (
                  <div className="py-16 text-center text-sm text-ink-500">{t('common.loading')}</div>
                ) : resultsQuery.data?.items.length ? (
                  <div className="overflow-auto">
                    <table className="min-w-full divide-y divide-border-soft text-sm">
                      <thead>
                        <tr>
                          {visibleColumns.map((column) => (
                            <th key={column} className="px-3 py-3 text-left font-medium text-ink-500">{columnLabel(column)}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-soft">
                        {resultsQuery.data.items.map((item) => (
                          <tr key={`identifier` in item ? `issue-${item.id}` : `project-${item.id}`}>
                            {visibleColumns.map((column) => (
                              <td key={column} className="px-3 py-3 text-ink-900">{renderValue(item as Issue | Project, column)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-16 text-center text-sm text-ink-500">{t('views.empty')}</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function ViewSection({
  title,
  views,
  activeId,
  currentOrganizationSlug,
}: {
  title: string;
  views: View[];
  activeId?: number | null;
  currentOrganizationSlug: string | null;
}) {
  if (!views.length) return null;
  return (
    <section className="space-y-2">
      <div className="text-xs font-medium uppercase tracking-[0.18em] text-ink-400">{title}</div>
      <div className="space-y-1">
        {views.map((view) => (
          <Link
            key={view.id}
            href={currentOrganizationSlug ? workspaceViewPath(currentOrganizationSlug, view.id) : '#'}
            className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm transition ${
              activeId === view.id ? 'bg-ink-900 text-white' : 'text-ink-700 hover:bg-slate-100'
            }`}
          >
            <span>{view.name}</span>
            <div className="flex items-center gap-1">
              {view.isFavorite ? <Star className="h-3.5 w-3.5" /> : null}
              {view.resourceType === 'PROJECT' ? <FolderKanban className="h-3.5 w-3.5" /> : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

