'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Edit3, Plus, Trash2 } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDismissButton, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { localizePath } from '@/i18n/config';
import { useI18n } from '@/i18n/useI18n';
import type { CustomFieldDefinition, Issue } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import { commentFormSchema, docFormSchema, issueFormSchema, relationFormSchema, type CommentFormValues, type DocFormValues, type IssueFormValues, type RelationFormValues } from '@/lib/forms/issue';
import { useIssueDetails, useIssueMutations, useIssueWorkspace } from '@/lib/query/issues';

const EMPTY = '__empty__';
const CUSTOM_FILTER_PREFIX = 'cf_';

export default function IssuesPage() {
  const { locale, t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user = getStoredUser();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, unknown>>({});

  const filters = useMemo(() => ({
    q: searchParams.get('q') ?? '',
    type: searchParams.get('type') ?? 'ALL',
    projectId: searchParams.get('projectId') ?? '',
    epicId: searchParams.get('epicId') ?? '',
    sprintId: searchParams.get('sprintId') ?? '',
    state: searchParams.get('state') ?? '',
    priority: searchParams.get('priority') ?? '',
  }), [searchParams]);

  const customFieldFilters = useMemo(
    () =>
      Object.fromEntries(
        Array.from(searchParams.entries())
          .filter(([key, value]) => key.startsWith(CUSTOM_FILTER_PREFIX) && value)
          .map(([key, value]) => [key.replace(CUSTOM_FILTER_PREFIX, ''), parseSearchValue(value)])
      ),
    [searchParams]
  );

  const apiFilters = {
    q: filters.q || undefined,
    type: filters.type === 'ALL' ? undefined : filters.type,
    projectId: filters.projectId ? Number(filters.projectId) : undefined,
    epicId: filters.epicId ? Number(filters.epicId) : undefined,
    sprintId: filters.sprintId ? Number(filters.sprintId) : undefined,
    state: filters.state || undefined,
    priority: filters.priority || undefined,
    customFieldFilters,
  };

  const { issuesQuery, customFieldDefinitionsQuery, projectsQuery, epicsQuery, sprintsQuery, teamsQuery } = useIssueWorkspace(apiFilters);
  const { createIssueMutation, updateIssueMutation, updateIssueStateMutation, createCommentMutation, createDocMutation, createRelationMutation, deleteRelationMutation } = useIssueMutations(apiFilters);
  const issues = issuesQuery.data ?? [];
  const customFieldDefinitions = ((customFieldDefinitionsQuery.data ?? []) as CustomFieldDefinition[]).filter((field) => field.isVisible);
  const createFieldDefinitions = customFieldDefinitions.filter((field) => field.showOnCreate);
  const listFieldDefinitions = customFieldDefinitions.filter((field) => field.showOnList);
  const filterFieldDefinitions = customFieldDefinitions.filter((field) => field.isFilterable);
  const projects = projectsQuery.data ?? [];
  const epics = epicsQuery.data ?? [];
  const sprints = sprintsQuery.data ?? [];
  const teams = teamsQuery.data ?? [];
  const selectedIssue = issues.find((issue) => issue.id === selectedIssueId) ?? null;
  const issueDetails = useIssueDetails(selectedIssueId);
  const detailIssue = issueDetails.issueQuery.data ?? selectedIssue;
  const detailCustomFieldDefinitions = detailIssue?.customFieldDefinitions ?? customFieldDefinitions;

  const issueForm = useForm<IssueFormValues>({
    resolver: zodResolver(issueFormSchema),
    values: editingIssue ? {
      type: editingIssue.type, title: editingIssue.title, description: editingIssue.description ?? '', projectId: editingIssue.projectId,
      teamId: editingIssue.teamId, epicId: editingIssue.epicId, sprintId: editingIssue.sprintId, parentIssueId: editingIssue.parentIssueId,
      state: editingIssue.state, priority: editingIssue.priority, severity: editingIssue.severity, estimatePoints: editingIssue.estimatePoints,
      progress: editingIssue.progress, plannedStartDate: editingIssue.plannedStartDate, plannedEndDate: editingIssue.plannedEndDate,
      estimatedHours: editingIssue.estimatedHours, actualHours: editingIssue.actualHours,
    } : {
      type: 'FEATURE', title: '', description: '', projectId: projects[0]?.id ?? 1, teamId: teams[0]?.id ?? null, epicId: null,
      sprintId: null, parentIssueId: null, state: 'BACKLOG', priority: 'MEDIUM', severity: null, estimatePoints: null,
      progress: 0, plannedStartDate: null, plannedEndDate: null, estimatedHours: 0, actualHours: 0,
    },
  });
  const commentForm = useForm<CommentFormValues>({ resolver: zodResolver(commentFormSchema), defaultValues: { body: '' } });
  const relationForm = useForm<RelationFormValues>({ resolver: zodResolver(relationFormSchema), defaultValues: { relationType: 'RELATES_TO', toIssueId: 0 } });
  const docForm = useForm<DocFormValues>({ resolver: zodResolver(docFormSchema), defaultValues: { title: '', slug: '', content: '' } });

  useEffect(() => {
    if (!editorOpen) return;
    setCustomFieldValues(buildInitialCustomFieldValues(createFieldDefinitions, editingIssue?.customFields));
  }, [createFieldDefinitions, editingIssue, editorOpen]);

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (!value || (key === 'type' && value === 'ALL')) next.delete(key); else next.set(key, value);
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const setCustomFieldFilter = (key: string, value: string) => {
    setFilter(`${CUSTOM_FILTER_PREFIX}${key}`, value);
  };

  const getName = (collection: Array<{ id: number; name?: string; title?: string }>, id: number | null) =>
    id ? collection.find((item) => item.id === id)?.name ?? collection.find((item) => item.id === id)?.title ?? `#${id}` : t('common.notSet');

  const onSaveIssue = issueForm.handleSubmit(async (values) => {
    const payload = {
      ...values,
      description: values.description || '',
      teamId: values.teamId ?? null, epicId: values.epicId ?? null, sprintId: values.sprintId ?? null, parentIssueId: values.parentIssueId ?? null,
      plannedStartDate: values.plannedStartDate || null, plannedEndDate: values.plannedEndDate || null,
      severity: values.type === 'BUG' ? values.severity ?? 'MEDIUM' : null,
      customFields: sanitizeCustomFields(customFieldValues),
    };
    if (editingIssue) {
      await updateIssueMutation.mutateAsync({ id: editingIssue.id, data: payload });
    } else {
      await createIssueMutation.mutateAsync({ ...payload, organizationId: projects.find((p) => p.id === values.projectId)?.organizationId ?? 1, reporterId: user?.id ?? 1 });
    }
    setEditorOpen(false);
    setEditingIssue(null);
  });

  const onComment = commentForm.handleSubmit(async (values) => {
    if (!selectedIssueId) return;
    await createCommentMutation.mutateAsync({ issueId: selectedIssueId, authorId: user?.id ?? 1, body: values.body });
    commentForm.reset();
  });

  const onRelation = relationForm.handleSubmit(async (values) => {
    if (!selectedIssueId) return;
    await createRelationMutation.mutateAsync({ issueId: selectedIssueId, toIssueId: values.toIssueId, relationType: values.relationType });
    relationForm.reset();
  });

  const onDoc = docForm.handleSubmit(async (values) => {
    if (!detailIssue) return;
    await createDocMutation.mutateAsync({
      organizationId: detailIssue.organizationId, teamId: detailIssue.teamId, projectId: detailIssue.projectId, epicId: detailIssue.epicId,
      issueId: detailIssue.id, authorId: user?.id ?? 1, title: values.title, slug: values.slug, content: values.content,
    });
    docForm.reset();
  });

  const bulkUpdate = async (state: Issue['state']) => {
    await Promise.all(selectedIds.map((id) => updateIssueStateMutation.mutateAsync({ id, state })));
    setSelectedIds([]);
  };

  const metrics = [
    { label: t('issues.metrics.total'), value: issues.length },
    { label: t('issues.metrics.inProgress'), value: issues.filter((issue) => issue.state === 'IN_PROGRESS').length },
    { label: t('issues.metrics.inReview'), value: issues.filter((issue) => issue.state === 'IN_REVIEW').length },
    { label: t('issues.metrics.done'), value: issues.filter((issue) => issue.state === 'DONE').length },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div><h1 className="text-3xl font-semibold text-ink-900">{t('issues.title')}</h1><p className="mt-2 text-sm text-ink-700">{t('issues.subtitle')}</p></div>
          <div className="flex gap-3"><Button variant="secondary" onClick={() => router.replace(pathname)}>{t('issues.filters.reset')}</Button><Button className="gap-2" onClick={() => { setEditingIssue(null); setEditorOpen(true); }}><Plus className="h-4 w-4" />{t('issues.actions.new')}</Button></div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">{metrics.map((metric) => <Card key={metric.label} className="metric-card"><CardContent className="p-0"><div className="text-sm text-ink-700">{metric.label}</div><div className="mt-3 text-3xl font-semibold text-ink-900">{metric.value}</div></CardContent></Card>)}</div>
        <Card className="filter-bar"><CardContent className="grid gap-3 p-0 lg:grid-cols-[2fr_repeat(6,minmax(0,1fr))]">
          <Field label={t('common.search')}><Input value={filters.q} onChange={(e) => setFilter('q', e.target.value)} placeholder={t('issues.filters.searchPlaceholder')} /></Field>
          <Filter label={t('issues.filters.type')} value={filters.type} onChange={(v) => setFilter('type', v)} options={[['ALL', t('issues.filters.allTypes')], ['FEATURE', t('issues.type.FEATURE')], ['TASK', t('issues.type.TASK')], ['BUG', t('issues.type.BUG')], ['TECH_DEBT', t('issues.type.TECH_DEBT')]]} />
          <Filter label={t('issues.filters.project')} value={filters.projectId} onChange={(v) => setFilter('projectId', v)} options={[['', t('issues.filters.allProjects')], ...projects.map((p) => [String(p.id), p.name])]} />
          <Filter label={t('issues.filters.epic')} value={filters.epicId} onChange={(v) => setFilter('epicId', v)} options={[['', t('issues.filters.allEpics')], ...epics.map((p) => [String(p.id), p.title])]} />
          <Filter label={t('issues.filters.sprint')} value={filters.sprintId} onChange={(v) => setFilter('sprintId', v)} options={[['', t('issues.filters.allSprints')], ...sprints.map((p) => [String(p.id), p.name])]} />
          <Filter label={t('issues.filters.state')} value={filters.state} onChange={(v) => setFilter('state', v)} options={[['', t('issues.filters.allStates')], ...(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELED'] as const).map((v) => [v, t(`common.status.${v}`)])]} />
          <Filter label={t('issues.filters.priority')} value={filters.priority} onChange={(v) => setFilter('priority', v)} options={[['', t('issues.filters.allPriorities')], ...(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const).map((v) => [v, t(`common.priority.${v}`)])]} />
        </CardContent></Card>
        {filterFieldDefinitions.length > 0 && <Card className="section-panel"><CardHeader className="p-0 pb-4"><CardTitle>{t('issues.customFields.filtersTitle')}</CardTitle></CardHeader><CardContent className="grid gap-3 p-0 md:grid-cols-2 xl:grid-cols-3">{filterFieldDefinitions.map((field) => <Field key={field.id} label={field.name}><CustomFieldFilter definition={field} teams={teams} value={searchParams.get(`${CUSTOM_FILTER_PREFIX}${field.key}`) ?? ''} onChange={(v) => setCustomFieldFilter(field.key, v)} /></Field>)}</CardContent></Card>}
        {selectedIds.length > 0 && <div className="flex flex-wrap items-center gap-2 rounded-card border border-border-soft bg-surface-soft px-4 py-3 text-sm text-ink-700"><span>{t('issues.bulk.selected', { count: selectedIds.length })}</span><Button variant="secondary" size="sm" onClick={() => bulkUpdate('TODO')}>{t('common.status.TODO')}</Button><Button variant="secondary" size="sm" onClick={() => bulkUpdate('IN_PROGRESS')}>{t('common.status.IN_PROGRESS')}</Button><Button variant="secondary" size="sm" onClick={() => bulkUpdate('DONE')}>{t('common.status.DONE')}</Button></div>}
        <Card className="overflow-hidden"><CardContent className="p-0"><div className="overflow-x-auto"><table className="data-table"><thead><tr><th className="w-12"><input type="checkbox" checked={issues.length > 0 && selectedIds.length === issues.length} onChange={(e) => setSelectedIds(e.target.checked ? issues.map((i) => i.id) : [])} /></th><th>{t('issues.columns.title')}</th><th>{t('issues.columns.type')}</th><th>{t('issues.columns.project')}</th><th>{t('issues.columns.epic')}</th><th>{t('issues.columns.sprint')}</th><th>{t('issues.columns.state')}</th><th>{t('issues.columns.priority')}</th><th>{t('issues.columns.team')}</th>{listFieldDefinitions.map((field) => <th key={field.id}>{field.name}</th>)}<th>{t('common.actions')}</th></tr></thead><tbody className="divide-y divide-slate-100">
          {issuesQuery.isLoading ? <tr><td colSpan={10 + listFieldDefinitions.length} className="px-5 py-14 text-center text-ink-400">{t('common.loading')}</td></tr> : issues.length === 0 ? <tr><td colSpan={10 + listFieldDefinitions.length} className="px-5 py-14 text-center text-ink-400">{t('issues.empty')}</td></tr> : issues.map((issue) => <tr key={issue.id} className="hover:bg-slate-50/70"><td><input type="checkbox" checked={selectedIds.includes(issue.id)} onChange={(e) => setSelectedIds(e.target.checked ? [...selectedIds, issue.id] : selectedIds.filter((id) => id !== issue.id))} /></td><td><button className="text-left" onClick={() => router.push(localizePath(locale, `/issues/${issue.id}`))}><div className="font-medium text-ink-900">{issue.title}</div><div className="mt-1 text-xs text-ink-400">{issue.identifier}</div></button></td><td><Badge>{t(`issues.type.${issue.type}`)}</Badge></td><td>{getName(projects, issue.projectId)}</td><td>{getName(epics, issue.epicId)}</td><td>{getName(sprints, issue.sprintId)}</td><td><Badge variant={issue.state === 'DONE' ? 'success' : issue.state === 'IN_PROGRESS' ? 'brand' : 'neutral'}>{t(`common.status.${issue.state}`)}</Badge></td><td><Badge variant={issue.priority === 'URGENT' ? 'danger' : issue.priority === 'HIGH' ? 'warning' : 'neutral'}>{t(`common.priority.${issue.priority}`)}</Badge></td><td>{getName(teams, issue.teamId)}</td>{listFieldDefinitions.map((field) => <td key={`${issue.id}-${field.id}`}>{formatCustomFieldValue(field, issue.customFields?.[field.key], teams, t)}</td>)}<td><div className="flex gap-2"><Button variant="ghost" size="icon" onClick={() => router.push(localizePath(locale, `/issues/${issue.id}`))}><Edit3 className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => { setEditingIssue(issue); setEditorOpen(true); }}><Plus className="h-4 w-4" /></Button></div></td></tr>)}
        </tbody></table></div></CardContent></Card>
      </div>

      <Sheet open={editorOpen} onOpenChange={(open) => { setEditorOpen(open); if (!open) { setEditingIssue(null); setCustomFieldValues({}); } }}><SheetContent className="max-w-xl"><SheetHeader><div className="flex items-start justify-between gap-4"><div><div className="text-xs uppercase tracking-[0.18em] text-ink-400">{editingIssue ? editingIssue.identifier : t('issues.actions.new')}</div><SheetTitle className="mt-2">{editingIssue ? t('issues.actions.edit') : t('issues.actions.new')}</SheetTitle></div><SheetDismissButton aria-label={t('common.cancel')} /></div></SheetHeader><ScrollArea className="h-[calc(100vh-120px)]"><form className="space-y-4 px-6 py-6" onSubmit={onSaveIssue}>
        <Field label={t('requirements.fields.title')}><Input {...issueForm.register('title')} /></Field>
        <Field label={t('requirements.fields.description')}><Textarea {...issueForm.register('description')} /></Field>
        <div className="grid gap-4 md:grid-cols-2"><FilterSelect value={issueForm.watch('type')} onChange={(v) => issueForm.setValue('type', v as IssueFormValues['type'])} options={[['FEATURE', t('issues.type.FEATURE')], ['TASK', t('issues.type.TASK')], ['BUG', t('issues.type.BUG')], ['TECH_DEBT', t('issues.type.TECH_DEBT')]]} /><FilterSelect value={String(issueForm.watch('projectId'))} onChange={(v) => issueForm.setValue('projectId', Number(v))} options={projects.map((p) => [String(p.id), p.name])} /></div>
        <div className="grid gap-4 md:grid-cols-2"><FilterSelect value={issueForm.watch('state')} onChange={(v) => issueForm.setValue('state', v as IssueFormValues['state'])} options={(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELED'] as const).map((v) => [v, t(`common.status.${v}`)])} /><FilterSelect value={issueForm.watch('priority')} onChange={(v) => issueForm.setValue('priority', v as IssueFormValues['priority'])} options={(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const).map((v) => [v, t(`common.priority.${v}`)])} /></div>
        <div className="grid gap-4 md:grid-cols-3"><Field label={t('requirements.fields.progress')}><Input type="number" min={0} max={100} {...issueForm.register('progress', { valueAsNumber: true })} /></Field><Field label={t('issues.detail.estimate')}><Input type="number" min={0} {...issueForm.register('estimatedHours', { valueAsNumber: true })} /></Field><Field label={t('issues.detail.actual')}><Input type="number" min={0} {...issueForm.register('actualHours', { valueAsNumber: true })} /></Field></div>
        {createFieldDefinitions.length > 0 && <Card className="section-panel"><CardHeader className="p-0 pb-4"><CardTitle>{t('issues.customFields.sectionTitle')}</CardTitle></CardHeader><CardContent className="grid gap-4 p-0">{createFieldDefinitions.map((field) => <Field key={field.id} label={field.name}><CustomFieldEditor definition={field} teams={teams} value={customFieldValues[field.key]} onChange={(value) => setCustomFieldValues((current) => ({ ...current, [field.key]: value }))} /></Field>)}</CardContent></Card>}
        <div className="flex justify-end gap-3"><Button type="button" variant="secondary" onClick={() => setEditorOpen(false)}>{t('common.cancel')}</Button><Button type="submit">{editingIssue ? t('common.save') : t('common.create')}</Button></div>
      </form></ScrollArea></SheetContent></Sheet>

      <Sheet open={!!selectedIssue} onOpenChange={(open) => !open && setSelectedIssueId(null)}><SheetContent className="max-w-3xl">{detailIssue && <><SheetHeader><div className="flex items-start justify-between gap-4"><div><div className="text-xs uppercase tracking-[0.18em] text-ink-400">{detailIssue.identifier}</div><SheetTitle className="mt-2">{detailIssue.title}</SheetTitle><div className="mt-3 flex flex-wrap gap-2"><Badge>{t(`issues.type.${detailIssue.type}`)}</Badge><Badge>{t(`common.status.${detailIssue.state}`)}</Badge><Badge>{t(`common.priority.${detailIssue.priority}`)}</Badge></div></div><div className="flex gap-2"><Button variant="secondary" size="sm" onClick={() => { setEditingIssue(detailIssue); setEditorOpen(true); }}>{t('common.edit')}</Button><SheetDismissButton aria-label={t('common.cancel')} /></div></div></SheetHeader><div className="px-6 py-6"><Tabs defaultValue="overview"><TabsList><TabsTrigger value="overview">{t('issues.tabs.overview')}</TabsTrigger><TabsTrigger value="comments">{t('issues.tabs.comments')}</TabsTrigger><TabsTrigger value="activity">{t('issues.tabs.activity')}</TabsTrigger><TabsTrigger value="docs">{t('issues.tabs.docs')}</TabsTrigger><TabsTrigger value="relations">{t('issues.tabs.relations')}</TabsTrigger></TabsList>
        <TabsContent value="overview"><ScrollArea className="h-[calc(100vh-260px)] pr-3"><div className="grid gap-4 md:grid-cols-2"><Meta label={t('issues.columns.project')} value={getName(projects, detailIssue.projectId)} /><Meta label={t('issues.columns.epic')} value={getName(epics, detailIssue.epicId)} /><Meta label={t('issues.columns.sprint')} value={getName(sprints, detailIssue.sprintId)} /><Meta label={t('issues.columns.team')} value={getName(teams, detailIssue.teamId)} /><Meta label={t('issues.detail.progress')} value={`${detailIssue.progress}%`} /><Meta label={t('issues.detail.plannedRange')} value={detailIssue.plannedStartDate || detailIssue.plannedEndDate ? `${detailIssue.plannedStartDate ?? '-'} - ${detailIssue.plannedEndDate ?? '-'}` : t('common.notSet')} /></div>{detailIssue.description && <Card className="section-panel mt-4"><CardHeader className="p-0 pb-4"><CardTitle>{t('requirements.fields.description')}</CardTitle></CardHeader><CardContent className="p-0 text-sm text-ink-700">{detailIssue.description}</CardContent></Card>}{detailCustomFieldDefinitions.filter((field) => field.showOnDetail).length > 0 && <Card className="section-panel mt-4"><CardHeader className="p-0 pb-4"><CardTitle>{t('issues.customFields.detailTitle')}</CardTitle></CardHeader><CardContent className="grid gap-4 p-0 md:grid-cols-2">{detailCustomFieldDefinitions.filter((field) => field.showOnDetail).map((field) => <Meta key={field.id} label={field.name} value={formatCustomFieldValue(field, detailIssue.customFields?.[field.key], teams, t)} />)}</CardContent></Card>}</ScrollArea></TabsContent>
        <TabsContent value="comments"><ScrollArea className="h-[calc(100vh-260px)] pr-3"><Card className="section-panel"><CardHeader className="p-0 pb-4"><CardTitle>{t('issues.detail.addComment')}</CardTitle></CardHeader><CardContent className="space-y-3 p-0"><Textarea {...commentForm.register('body')} placeholder={t('issues.detail.commentPlaceholder')} /><div className="flex justify-end"><Button onClick={onComment}>{t('common.submit')}</Button></div></CardContent></Card><div className="mt-4 space-y-3">{issueDetails.commentsQuery.data?.length ? issueDetails.commentsQuery.data.map((comment) => <Card key={comment.id} className="drawer-panel"><div className="text-sm text-ink-700">{comment.body}</div><div className="mt-2 text-xs text-ink-400">#{comment.authorId} · {new Date(comment.createdAt).toLocaleString(locale === 'en' ? 'en-US' : 'zh-CN')}</div></Card>) : <Empty label={t('issues.emptyStates.comments')} />}</div></ScrollArea></TabsContent>
        <TabsContent value="activity"><ScrollArea className="h-[calc(100vh-260px)] pr-3"><div className="space-y-3">{issueDetails.activityQuery.data?.length ? issueDetails.activityQuery.data.map((event) => <Card key={event.id} className="drawer-panel"><div className="text-sm font-medium text-ink-900">{event.summary}</div><div className="mt-1 text-xs text-ink-400">{event.actionType} · {new Date(event.createdAt).toLocaleString(locale === 'en' ? 'en-US' : 'zh-CN')}</div></Card>) : <Empty label={t('issues.emptyStates.activity')} />}</div></ScrollArea></TabsContent>
        <TabsContent value="docs"><ScrollArea className="h-[calc(100vh-260px)] pr-3"><Card className="section-panel"><CardHeader className="p-0 pb-4"><CardTitle>{t('issues.detail.linkDoc')}</CardTitle></CardHeader><CardContent className="space-y-3 p-0"><div className="grid gap-3 md:grid-cols-2"><Input {...docForm.register('title')} placeholder={t('issues.detail.docTitle')} /><Input {...docForm.register('slug')} placeholder={t('issues.detail.docSlug')} /></div><Textarea {...docForm.register('content')} placeholder={t('issues.detail.docContent')} /><div className="flex justify-end"><Button onClick={onDoc}>{t('common.create')}</Button></div></CardContent></Card><div className="mt-4 space-y-3">{issueDetails.docsQuery.data?.length ? issueDetails.docsQuery.data.map((doc) => <Card key={doc.id} className="drawer-panel"><div className="text-sm font-medium text-ink-900">{doc.title}</div><div className="mt-1 text-xs text-ink-400">{doc.slug}</div>{doc.currentRevision?.content && <div className="mt-3 text-sm text-ink-700">{doc.currentRevision.content}</div>}</Card>) : <Empty label={t('issues.emptyStates.docs')} />}</div></ScrollArea></TabsContent>
        <TabsContent value="relations"><ScrollArea className="h-[calc(100vh-260px)] pr-3"><Card className="section-panel"><CardHeader className="p-0 pb-4"><CardTitle>{t('issues.detail.addRelation')}</CardTitle></CardHeader><CardContent className="space-y-3 p-0"><div className="grid gap-3 md:grid-cols-2"><Input type="number" min={1} {...relationForm.register('toIssueId', { valueAsNumber: true })} placeholder={t('issues.detail.relationTarget')} /><FilterSelect value={relationForm.watch('relationType')} onChange={(v) => relationForm.setValue('relationType', v as RelationFormValues['relationType'])} options={(['BLOCKS', 'BLOCKED_BY', 'RELATES_TO', 'DUPLICATES', 'CAUSED_BY', 'SPLIT_FROM'] as const).map((v) => [v, t(`issues.relationType.${v}`)])} /></div><div className="flex justify-end"><Button onClick={onRelation}>{t('common.create')}</Button></div></CardContent></Card><div className="mt-4 space-y-3">{issueDetails.relationsQuery.data?.length ? issueDetails.relationsQuery.data.map((relation) => <Card key={relation.id} className="drawer-panel"><div className="flex items-start justify-between gap-3"><div><div className="text-sm font-medium text-ink-900">{t(`issues.relationType.${relation.relationType}`)}</div><div className="mt-1 text-xs text-ink-400">{relation.fromIssueId} → {relation.toIssueId}</div></div><Button variant="ghost" size="icon" onClick={() => deleteRelationMutation.mutate({ issueId: detailIssue.id, relationId: relation.id })}><Trash2 className="h-4 w-4" /></Button></div></Card>) : <Empty label={t('issues.emptyStates.relations')} />}</div></ScrollArea></TabsContent>
      </Tabs></div></>}</SheetContent></Sheet>
    </AppLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><div className="mb-1.5 text-sm font-medium text-ink-700">{label}</div>{children}</label>; }
function Empty({ label }: { label: string }) { return <div className="rounded-card border border-dashed border-border-soft px-4 py-6 text-center text-sm text-ink-400">{label}</div>; }
function Meta({ label, value }: { label: string; value: string }) { return <Card className="drawer-panel"><div className="meta-label">{label}</div><div className="mt-2 text-sm font-medium text-ink-900">{value}</div></Card>; }
function Filter({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[][] }) { return <Field label={label}><FilterSelect value={value} onChange={onChange} options={options} /></Field>; }
function FilterSelect({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[][] }) {
  return <Select value={value === '' ? EMPTY : value} onValueChange={(next) => onChange(next === EMPTY ? '' : next)}><SelectTrigger><SelectValue placeholder={options[0]?.[1]} /></SelectTrigger><SelectContent>{options.map(([optionValue, optionLabel]) => <SelectItem key={`${optionValue || EMPTY}-${optionLabel}`} value={optionValue === '' ? EMPTY : optionValue}>{optionLabel}</SelectItem>)}</SelectContent></Select>;
}

function CustomFieldFilter({ definition, teams, value, onChange }: { definition: CustomFieldDefinition; teams: Array<{ id: number; name?: string }>; value: string; onChange: (value: string) => void }) {
  switch (definition.dataType) {
    case 'SINGLE_SELECT':
    case 'BOOLEAN':
    case 'TEAM':
      return <FilterSelect value={value} onChange={onChange} options={buildFilterOptions(definition, teams)} />;
    case 'DATE':
      return <Input type="date" value={value} onChange={(event) => onChange(event.target.value)} />;
    default:
      return <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={String(definition.config.placeholder ?? definition.name)} />;
  }
}

function CustomFieldEditor({ definition, teams, value, onChange }: { definition: CustomFieldDefinition; teams: Array<{ id: number; name?: string }>; value: unknown; onChange: (value: unknown) => void }) {
  switch (definition.dataType) {
    case 'TEXTAREA':
      return <Textarea value={String(value ?? '')} onChange={(event) => onChange(event.target.value)} placeholder={String(definition.config.placeholder ?? '')} />;
    case 'NUMBER':
      return <Input type="number" value={typeof value === 'number' ? value : value ? Number(value) : ''} onChange={(event) => onChange(event.target.value)} />;
    case 'DATE':
      return <Input type="date" value={String(value ?? '')} onChange={(event) => onChange(event.target.value)} />;
    case 'DATETIME':
      return <Input type="datetime-local" value={String(value ?? '')} onChange={(event) => onChange(event.target.value)} />;
    case 'SINGLE_SELECT':
    case 'BOOLEAN':
    case 'TEAM':
      return <FilterSelect value={value == null ? '' : String(value)} onChange={(next) => onChange(next)} options={buildFilterOptions(definition, teams)} />;
    case 'MULTI_SELECT':
      return <Input value={Array.isArray(value) ? value.join(', ') : String(value ?? '')} onChange={(event) => onChange(event.target.value)} placeholder={String(definition.config.placeholder ?? 'a, b, c')} />;
    case 'USER':
      return <Input type="number" min={1} value={String(value ?? '')} onChange={(event) => onChange(event.target.value)} placeholder={String(definition.config.placeholder ?? 'User ID')} />;
    default:
      return <Input value={String(value ?? '')} onChange={(event) => onChange(event.target.value)} placeholder={String(definition.config.placeholder ?? '')} />;
  }
}

function buildFilterOptions(definition: CustomFieldDefinition, teams: Array<{ id: number; name?: string }>): string[][] {
  if (definition.dataType === 'BOOLEAN') return [['', 'All'], ['true', 'True'], ['false', 'False']];
  if (definition.dataType === 'TEAM') return [['', 'All'], ...teams.map((team) => [String(team.id), team.name ?? `#${team.id}`])];
  return [['', 'All'], ...definition.options.filter((option) => option.isActive).map((option) => [option.value, option.label])];
}

function buildInitialCustomFieldValues(definitions: CustomFieldDefinition[], current?: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    definitions.map((definition) => {
      const existing = current?.[definition.key];
      if (existing !== undefined) return [definition.key, existing];
      if (definition.config.defaultValue !== undefined) return [definition.key, definition.config.defaultValue];
      if (definition.dataType === 'MULTI_SELECT') return [definition.key, []];
      return [definition.key, ''];
    })
  );
}

function sanitizeCustomFields(values: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(values)
      .map(([key, value]) => [key, normalizeCustomFieldValue(value)] as const)
      .filter(([, value]) => value !== '' && value != null && !(Array.isArray(value) && value.length === 0))
  );
}

function normalizeCustomFieldValue(value: unknown): unknown {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed.includes(',') && !Number.isFinite(Number(trimmed))) {
    return trimmed.split(',').map((item) => item.trim()).filter(Boolean);
  }
  if (trimmed === 'true' || trimmed === 'false') return trimmed === 'true';
  return trimmed;
}

function formatCustomFieldValue(definition: CustomFieldDefinition, value: unknown, teams: Array<{ id: number; name?: string }>, t: (key: string, vars?: Record<string, string | number>) => string): string {
  if (value == null || value === '') return t('common.notSet');
  if (Array.isArray(value)) return value.join(', ');
  if (definition.dataType === 'BOOLEAN') return value ? 'True' : 'False';
  if (definition.dataType === 'TEAM') return teams.find((team) => String(team.id) === String(value))?.name ?? String(value);
  if (definition.options.length > 0) return definition.options.find((option) => option.value === value)?.label ?? String(value);
  return String(value);
}

function parseSearchValue(raw: string): unknown {
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  if (/^\d+$/.test(raw)) return Number(raw);
  return raw;
}
