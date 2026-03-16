'use client';

import { useMemo, useState } from 'react';
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
import { useI18n } from '@/i18n/useI18n';
import type { Issue } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import { commentFormSchema, docFormSchema, issueFormSchema, relationFormSchema, type CommentFormValues, type DocFormValues, type IssueFormValues, type RelationFormValues } from '@/lib/forms/issue';
import { useIssueDetails, useIssueMutations, useIssueWorkspace } from '@/lib/query/issues';

const EMPTY = '__empty__';

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

  const filters = useMemo(() => ({
    q: searchParams.get('q') ?? '',
    type: searchParams.get('type') ?? 'ALL',
    projectId: searchParams.get('projectId') ?? '',
    epicId: searchParams.get('epicId') ?? '',
    sprintId: searchParams.get('sprintId') ?? '',
    state: searchParams.get('state') ?? '',
    priority: searchParams.get('priority') ?? '',
  }), [searchParams]);

  const apiFilters = {
    q: filters.q || undefined,
    type: filters.type === 'ALL' ? undefined : filters.type,
    projectId: filters.projectId ? Number(filters.projectId) : undefined,
    epicId: filters.epicId ? Number(filters.epicId) : undefined,
    sprintId: filters.sprintId ? Number(filters.sprintId) : undefined,
    state: filters.state || undefined,
    priority: filters.priority || undefined,
  };

  const { issuesQuery, projectsQuery, epicsQuery, sprintsQuery, teamsQuery } = useIssueWorkspace(apiFilters);
  const { createIssueMutation, updateIssueMutation, updateIssueStateMutation, createCommentMutation, createDocMutation, createRelationMutation, deleteRelationMutation } = useIssueMutations(apiFilters);
  const issues = issuesQuery.data ?? [];
  const projects = projectsQuery.data ?? [];
  const epics = epicsQuery.data ?? [];
  const sprints = sprintsQuery.data ?? [];
  const teams = teamsQuery.data ?? [];
  const selectedIssue = issues.find((issue) => issue.id === selectedIssueId) ?? null;
  const issueDetails = useIssueDetails(selectedIssueId);

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

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (!value || (key === 'type' && value === 'ALL')) next.delete(key); else next.set(key, value);
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
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
    if (!selectedIssue) return;
    await createDocMutation.mutateAsync({
      organizationId: selectedIssue.organizationId, teamId: selectedIssue.teamId, projectId: selectedIssue.projectId, epicId: selectedIssue.epicId,
      issueId: selectedIssue.id, authorId: user?.id ?? 1, title: values.title, slug: values.slug, content: values.content,
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
        {selectedIds.length > 0 && <div className="flex flex-wrap items-center gap-2 rounded-card border border-border-soft bg-surface-soft px-4 py-3 text-sm text-ink-700"><span>{t('issues.bulk.selected', { count: selectedIds.length })}</span><Button variant="secondary" size="sm" onClick={() => bulkUpdate('TODO')}>{t('common.status.TODO')}</Button><Button variant="secondary" size="sm" onClick={() => bulkUpdate('IN_PROGRESS')}>{t('common.status.IN_PROGRESS')}</Button><Button variant="secondary" size="sm" onClick={() => bulkUpdate('DONE')}>{t('common.status.DONE')}</Button></div>}
        <Card className="overflow-hidden"><CardContent className="p-0"><div className="overflow-x-auto"><table className="data-table"><thead><tr><th className="w-12"><input type="checkbox" checked={issues.length > 0 && selectedIds.length === issues.length} onChange={(e) => setSelectedIds(e.target.checked ? issues.map((i) => i.id) : [])} /></th><th>{t('issues.columns.title')}</th><th>{t('issues.columns.type')}</th><th>{t('issues.columns.project')}</th><th>{t('issues.columns.epic')}</th><th>{t('issues.columns.sprint')}</th><th>{t('issues.columns.state')}</th><th>{t('issues.columns.priority')}</th><th>{t('issues.columns.team')}</th><th>{t('common.actions')}</th></tr></thead><tbody className="divide-y divide-slate-100">
          {issuesQuery.isLoading ? <tr><td colSpan={10} className="px-5 py-14 text-center text-ink-400">{t('common.loading')}</td></tr> : issues.length === 0 ? <tr><td colSpan={10} className="px-5 py-14 text-center text-ink-400">{t('issues.empty')}</td></tr> : issues.map((issue) => <tr key={issue.id} className="hover:bg-slate-50/70"><td><input type="checkbox" checked={selectedIds.includes(issue.id)} onChange={(e) => setSelectedIds(e.target.checked ? [...selectedIds, issue.id] : selectedIds.filter((id) => id !== issue.id))} /></td><td><button className="text-left" onClick={() => setSelectedIssueId(issue.id)}><div className="font-medium text-ink-900">{issue.title}</div><div className="mt-1 text-xs text-ink-400">{issue.identifier}</div></button></td><td><Badge>{t(`issues.type.${issue.type}`)}</Badge></td><td>{getName(projects, issue.projectId)}</td><td>{getName(epics, issue.epicId)}</td><td>{getName(sprints, issue.sprintId)}</td><td><Badge variant={issue.state === 'DONE' ? 'success' : issue.state === 'IN_PROGRESS' ? 'brand' : 'neutral'}>{t(`common.status.${issue.state}`)}</Badge></td><td><Badge variant={issue.priority === 'URGENT' ? 'danger' : issue.priority === 'HIGH' ? 'warning' : 'neutral'}>{t(`common.priority.${issue.priority}`)}</Badge></td><td>{getName(teams, issue.teamId)}</td><td><div className="flex gap-2"><Button variant="ghost" size="icon" onClick={() => setSelectedIssueId(issue.id)}><Edit3 className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => { setEditingIssue(issue); setEditorOpen(true); }}><Plus className="h-4 w-4" /></Button></div></td></tr>)}
        </tbody></table></div></CardContent></Card>
      </div>

      <Sheet open={editorOpen} onOpenChange={(open) => { setEditorOpen(open); if (!open) setEditingIssue(null); }}><SheetContent className="max-w-xl"><SheetHeader><div className="flex items-start justify-between gap-4"><div><div className="text-xs uppercase tracking-[0.18em] text-ink-400">{editingIssue ? editingIssue.identifier : t('issues.actions.new')}</div><SheetTitle className="mt-2">{editingIssue ? t('issues.actions.edit') : t('issues.actions.new')}</SheetTitle></div><SheetDismissButton aria-label={t('common.cancel')} /></div></SheetHeader><ScrollArea className="h-[calc(100vh-120px)]"><form className="space-y-4 px-6 py-6" onSubmit={onSaveIssue}>
        <Field label={t('requirements.fields.title')}><Input {...issueForm.register('title')} /></Field>
        <Field label={t('requirements.fields.description')}><Textarea {...issueForm.register('description')} /></Field>
        <div className="grid gap-4 md:grid-cols-2"><FilterSelect value={issueForm.watch('type')} onChange={(v) => issueForm.setValue('type', v as IssueFormValues['type'])} options={[['FEATURE', t('issues.type.FEATURE')], ['TASK', t('issues.type.TASK')], ['BUG', t('issues.type.BUG')], ['TECH_DEBT', t('issues.type.TECH_DEBT')]]} label={t('issues.columns.type')} /><FilterSelect value={String(issueForm.watch('projectId'))} onChange={(v) => issueForm.setValue('projectId', Number(v))} options={projects.map((p) => [String(p.id), p.name])} label={t('issues.columns.project')} /></div>
        <div className="grid gap-4 md:grid-cols-2"><FilterSelect value={issueForm.watch('state')} onChange={(v) => issueForm.setValue('state', v as IssueFormValues['state'])} options={(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELED'] as const).map((v) => [v, t(`common.status.${v}`)])} label={t('issues.filters.state')} /><FilterSelect value={issueForm.watch('priority')} onChange={(v) => issueForm.setValue('priority', v as IssueFormValues['priority'])} options={(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const).map((v) => [v, t(`common.priority.${v}`)])} label={t('issues.filters.priority')} /></div>
        <div className="grid gap-4 md:grid-cols-3"><Field label={t('requirements.fields.progress')}><Input type="number" min={0} max={100} {...issueForm.register('progress', { valueAsNumber: true })} /></Field><Field label={t('issues.detail.estimate')}><Input type="number" min={0} {...issueForm.register('estimatedHours', { valueAsNumber: true })} /></Field><Field label={t('issues.detail.actual')}><Input type="number" min={0} {...issueForm.register('actualHours', { valueAsNumber: true })} /></Field></div>
        <div className="flex justify-end gap-3"><Button type="button" variant="secondary" onClick={() => setEditorOpen(false)}>{t('common.cancel')}</Button><Button type="submit">{editingIssue ? t('common.save') : t('common.create')}</Button></div>
      </form></ScrollArea></SheetContent></Sheet>

      <Sheet open={!!selectedIssue} onOpenChange={(open) => !open && setSelectedIssueId(null)}><SheetContent className="max-w-3xl">{selectedIssue && <><SheetHeader><div className="flex items-start justify-between gap-4"><div><div className="text-xs uppercase tracking-[0.18em] text-ink-400">{selectedIssue.identifier}</div><SheetTitle className="mt-2">{selectedIssue.title}</SheetTitle><div className="mt-3 flex flex-wrap gap-2"><Badge>{t(`issues.type.${selectedIssue.type}`)}</Badge><Badge>{t(`common.status.${selectedIssue.state}`)}</Badge><Badge>{t(`common.priority.${selectedIssue.priority}`)}</Badge></div></div><div className="flex gap-2"><Button variant="secondary" size="sm" onClick={() => { setEditingIssue(selectedIssue); setEditorOpen(true); }}>{t('common.edit')}</Button><SheetDismissButton aria-label={t('common.cancel')} /></div></div></SheetHeader><div className="px-6 py-6"><Tabs defaultValue="overview"><TabsList><TabsTrigger value="overview">{t('issues.tabs.overview')}</TabsTrigger><TabsTrigger value="comments">{t('issues.tabs.comments')}</TabsTrigger><TabsTrigger value="activity">{t('issues.tabs.activity')}</TabsTrigger><TabsTrigger value="docs">{t('issues.tabs.docs')}</TabsTrigger><TabsTrigger value="relations">{t('issues.tabs.relations')}</TabsTrigger></TabsList>
        <TabsContent value="overview"><ScrollArea className="h-[calc(100vh-260px)] pr-3"><div className="grid gap-4 md:grid-cols-2"><Meta label={t('issues.columns.project')} value={getName(projects, selectedIssue.projectId)} /><Meta label={t('issues.columns.epic')} value={getName(epics, selectedIssue.epicId)} /><Meta label={t('issues.columns.sprint')} value={getName(sprints, selectedIssue.sprintId)} /><Meta label={t('issues.columns.team')} value={getName(teams, selectedIssue.teamId)} /><Meta label={t('issues.detail.progress')} value={`${selectedIssue.progress}%`} /><Meta label={t('issues.detail.plannedRange')} value={selectedIssue.plannedStartDate || selectedIssue.plannedEndDate ? `${selectedIssue.plannedStartDate ?? '-'} - ${selectedIssue.plannedEndDate ?? '-'}` : t('common.notSet')} /></div>{selectedIssue.description && <Card className="section-panel mt-4"><CardHeader className="p-0 pb-4"><CardTitle>{t('requirements.fields.description')}</CardTitle></CardHeader><CardContent className="p-0 text-sm text-ink-700">{selectedIssue.description}</CardContent></Card>}</ScrollArea></TabsContent>
        <TabsContent value="comments"><ScrollArea className="h-[calc(100vh-260px)] pr-3"><Card className="section-panel"><CardHeader className="p-0 pb-4"><CardTitle>{t('issues.detail.addComment')}</CardTitle></CardHeader><CardContent className="space-y-3 p-0"><Textarea {...commentForm.register('body')} placeholder={t('issues.detail.commentPlaceholder')} /><div className="flex justify-end"><Button onClick={onComment}>{t('common.submit')}</Button></div></CardContent></Card><div className="mt-4 space-y-3">{issueDetails.commentsQuery.data?.length ? issueDetails.commentsQuery.data.map((comment) => <Card key={comment.id} className="drawer-panel"><div className="text-sm text-ink-700">{comment.body}</div><div className="mt-2 text-xs text-ink-400">#{comment.authorId} · {new Date(comment.createdAt).toLocaleString(locale === 'en' ? 'en-US' : 'zh-CN')}</div></Card>) : <Empty label={t('issues.emptyStates.comments')} />}</div></ScrollArea></TabsContent>
        <TabsContent value="activity"><ScrollArea className="h-[calc(100vh-260px)] pr-3"><div className="space-y-3">{issueDetails.activityQuery.data?.length ? issueDetails.activityQuery.data.map((event) => <Card key={event.id} className="drawer-panel"><div className="text-sm font-medium text-ink-900">{event.summary}</div><div className="mt-1 text-xs text-ink-400">{event.actionType} · {new Date(event.createdAt).toLocaleString(locale === 'en' ? 'en-US' : 'zh-CN')}</div></Card>) : <Empty label={t('issues.emptyStates.activity')} />}</div></ScrollArea></TabsContent>
        <TabsContent value="docs"><ScrollArea className="h-[calc(100vh-260px)] pr-3"><Card className="section-panel"><CardHeader className="p-0 pb-4"><CardTitle>{t('issues.detail.linkDoc')}</CardTitle></CardHeader><CardContent className="space-y-3 p-0"><div className="grid gap-3 md:grid-cols-2"><Input {...docForm.register('title')} placeholder={t('issues.detail.docTitle')} /><Input {...docForm.register('slug')} placeholder={t('issues.detail.docSlug')} /></div><Textarea {...docForm.register('content')} placeholder={t('issues.detail.docContent')} /><div className="flex justify-end"><Button onClick={onDoc}>{t('common.create')}</Button></div></CardContent></Card><div className="mt-4 space-y-3">{issueDetails.docsQuery.data?.length ? issueDetails.docsQuery.data.map((doc) => <Card key={doc.id} className="drawer-panel"><div className="text-sm font-medium text-ink-900">{doc.title}</div><div className="mt-1 text-xs text-ink-400">{doc.slug}</div>{doc.currentRevision?.content && <div className="mt-3 text-sm text-ink-700">{doc.currentRevision.content}</div>}</Card>) : <Empty label={t('issues.emptyStates.docs')} />}</div></ScrollArea></TabsContent>
        <TabsContent value="relations"><ScrollArea className="h-[calc(100vh-260px)] pr-3"><Card className="section-panel"><CardHeader className="p-0 pb-4"><CardTitle>{t('issues.detail.addRelation')}</CardTitle></CardHeader><CardContent className="space-y-3 p-0"><div className="grid gap-3 md:grid-cols-2"><Input type="number" min={1} {...relationForm.register('toIssueId', { valueAsNumber: true })} placeholder={t('issues.detail.relationTarget')} /><FilterSelect value={relationForm.watch('relationType')} onChange={(v) => relationForm.setValue('relationType', v as RelationFormValues['relationType'])} options={(['BLOCKS', 'BLOCKED_BY', 'RELATES_TO', 'DUPLICATES', 'CAUSED_BY', 'SPLIT_FROM'] as const).map((v) => [v, t(`issues.relationType.${v}`)])} label={t('issues.detail.relationType')} /></div><div className="flex justify-end"><Button onClick={onRelation}>{t('common.create')}</Button></div></CardContent></Card><div className="mt-4 space-y-3">{issueDetails.relationsQuery.data?.length ? issueDetails.relationsQuery.data.map((relation) => <Card key={relation.id} className="drawer-panel"><div className="flex items-start justify-between gap-3"><div><div className="text-sm font-medium text-ink-900">{t(`issues.relationType.${relation.relationType}`)}</div><div className="mt-1 text-xs text-ink-400">{relation.fromIssueId} → {relation.toIssueId}</div></div><Button variant="ghost" size="icon" onClick={() => deleteRelationMutation.mutate({ issueId: selectedIssue.id, relationId: relation.id })}><Trash2 className="h-4 w-4" /></Button></div></Card>) : <Empty label={t('issues.emptyStates.relations')} />}</div></ScrollArea></TabsContent>
      </Tabs></div></>}</SheetContent></Sheet>
    </AppLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><div className="mb-1.5 text-sm font-medium text-ink-700">{label}</div>{children}</label>; }
function Empty({ label }: { label: string }) { return <div className="rounded-card border border-dashed border-border-soft px-4 py-6 text-center text-sm text-ink-400">{label}</div>; }
function Meta({ label, value }: { label: string; value: string }) { return <Card className="drawer-panel"><div className="meta-label">{label}</div><div className="mt-2 text-sm font-medium text-ink-900">{value}</div></Card>; }
function Filter({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[][] }) { return <Field label={label}><FilterSelect value={value} onChange={onChange} options={options} label={label} /></Field>; }
function FilterSelect({ value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[][] }) {
  return <Select value={value === '' ? EMPTY : value} onValueChange={(next) => onChange(next === EMPTY ? '' : next)}><SelectTrigger><SelectValue placeholder={options[0]?.[1]} /></SelectTrigger><SelectContent>{options.map(([optionValue, optionLabel]) => <SelectItem key={`${optionValue || EMPTY}-${optionLabel}`} value={optionValue === '' ? EMPTY : optionValue}>{optionLabel}</SelectItem>)}</SelectContent></Select>;
}
