'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Link2, Paperclip, Plus, Save, Trash2 } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import MarkdownEditor from '@/components/issues/MarkdownEditor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { localizePath } from '@/i18n/config';
import { useI18n } from '@/i18n/useI18n';
import { downloadIssueAttachment, type CustomFieldDefinition, type Issue } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import { useIssueDetailWorkspace, useIssueMutations } from '@/lib/query/issues';

const EMPTY = '__empty__';
const ISSUE_STATES: Issue['state'][] = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELED'];
const ISSUE_PRIORITIES: Issue['priority'][] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const RELATION_TYPES = ['BLOCKS', 'BLOCKED_BY', 'RELATES_TO', 'DUPLICATES', 'CAUSED_BY', 'SPLIT_FROM'] as const;

interface IssueDetailPageProps {
  issueId: number;
}

interface DraftIssue {
  title: string;
  description: string;
  state: Issue['state'];
  priority: Issue['priority'];
  assigneeId: number | null;
  projectId: number;
  epicId: number | null;
  sprintId: number | null;
  teamId: number | null;
  parentIssueId: number | null;
  estimatedHours: number;
  actualHours: number;
  plannedStartDate: string | null;
  plannedEndDate: string | null;
  customFields: Record<string, unknown>;
}

export default function IssueDetailPage({ issueId }: IssueDetailPageProps) {
  const { locale, t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const user = getStoredUser();
  const organizationId = user?.organizationId ?? 1;
  const {
    issueQuery,
    commentsQuery,
    activityQuery,
    relationsQuery,
    attachmentsQuery,
    childIssuesQuery,
    docsQuery,
    customFieldDefinitionsQuery,
    projectsQuery,
    epicsQuery,
    sprintsQuery,
    teamsQuery,
    membersQuery,
  } = useIssueDetailWorkspace(issueId, organizationId);
  const {
    updateIssueMutation,
    createIssueMutation,
    createCommentMutation,
    createDocMutation,
    uploadAttachmentMutation,
    deleteAttachmentMutation,
    createRelationMutation,
    deleteRelationMutation,
  } = useIssueMutations();

  const issue = issueQuery.data;
  const comments = commentsQuery.data ?? [];
  const activity = activityQuery.data ?? [];
  const relations = relationsQuery.data ?? [];
  const attachments = attachmentsQuery.data ?? [];
  const childIssues = childIssuesQuery.data ?? [];
  const docs = docsQuery.data ?? [];
  const projects = projectsQuery.data ?? [];
  const epics = epicsQuery.data ?? [];
  const sprints = sprintsQuery.data ?? [];
  const teams = teamsQuery.data ?? [];
  const members = (membersQuery.data as Array<{ id: number; name: string }> | undefined) ?? [];
  const customFieldDefinitions = (issue?.customFieldDefinitions ?? customFieldDefinitionsQuery.data ?? []) as CustomFieldDefinition[];

  const [draftIssue, setDraftIssue] = useState<DraftIssue | null>(null);
  const [commentBody, setCommentBody] = useState('');
  const [childTitle, setChildTitle] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [relationTargetId, setRelationTargetId] = useState('');
  const [relationType, setRelationType] = useState<(typeof RELATION_TYPES)[number]>('RELATES_TO');

  useEffect(() => {
    if (!issue) return;
    setDraftIssue(createDraft(issue));
  }, [issue]);

  const initialSnapshot = useMemo(() => (issue ? normalizeDraft(createDraft(issue)) : ''), [issue]);
  const currentSnapshot = useMemo(() => (draftIssue ? normalizeDraft(draftIssue) : ''), [draftIssue]);
  const isDirty = !!issue && !!draftIssue && initialSnapshot !== currentSnapshot;

  const save = async () => {
    if (!issue || !draftIssue) return;
    await updateIssueMutation.mutateAsync({
      id: issue.id,
      data: {
        title: draftIssue.title,
        description: draftIssue.description,
        state: draftIssue.state,
        priority: draftIssue.priority,
        assigneeId: draftIssue.assigneeId,
        projectId: draftIssue.projectId,
        epicId: draftIssue.epicId,
        sprintId: draftIssue.sprintId,
        teamId: draftIssue.teamId,
        parentIssueId: draftIssue.parentIssueId,
        estimatedHours: draftIssue.estimatedHours,
        actualHours: draftIssue.actualHours,
        plannedStartDate: draftIssue.plannedStartDate,
        plannedEndDate: draftIssue.plannedEndDate,
        customFields: sanitizeCustomFields(draftIssue.customFields),
      },
    });
  };

  const reset = () => {
    if (!issue) return;
    setDraftIssue(createDraft(issue));
  };

  const createChildIssue = async () => {
    if (!issue || !childTitle.trim()) return;
    await createIssueMutation.mutateAsync({
      organizationId: issue.organizationId,
      type: 'TASK',
      title: childTitle.trim(),
      description: '',
      projectId: issue.projectId,
      teamId: issue.teamId,
      parentIssueId: issue.id,
      reporterId: user?.id ?? 1,
      state: 'TODO',
      priority: 'MEDIUM',
    });
    setChildTitle('');
  };

  const addComment = async () => {
    if (!issue || !commentBody.trim()) return;
    await createCommentMutation.mutateAsync({ issueId: issue.id, authorId: user?.id ?? 1, body: commentBody.trim() });
    setCommentBody('');
  };

  const createLinkedDoc = async () => {
    if (!issue || !docTitle.trim()) return;
    await createDocMutation.mutateAsync({
      organizationId: issue.organizationId,
      teamId: issue.teamId,
      projectId: issue.projectId,
      epicId: issue.epicId,
      issueId: issue.id,
      authorId: user?.id ?? 1,
      title: docTitle.trim(),
      slug: docTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      content: docContent.trim(),
    });
    setDocTitle('');
    setDocContent('');
  };

  const addRelation = async () => {
    if (!issue || !relationTargetId) return;
    await createRelationMutation.mutateAsync({ issueId: issue.id, toIssueId: Number(relationTargetId), relationType });
    setRelationTargetId('');
  };

  const uploadAttachment = async (file: File | null) => {
    if (!issue || !file) return;
    await uploadAttachmentMutation.mutateAsync({ issueId: issue.id, file, uploadedBy: user?.id ?? undefined });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (issueQuery.isLoading || !draftIssue) {
    return <AppLayout><Card className="section-panel"><CardContent className="p-10 text-center text-ink-400">{t('common.loading')}</CardContent></Card></AppLayout>;
  }

  if (!issue) {
    return <AppLayout><Card className="section-panel"><CardContent className="p-10 text-center text-ink-400">{t('common.empty')}</CardContent></Card></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 border-b border-border-subtle pb-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-3">
            <Link href={localizePath(locale, '/issues')} className="inline-flex items-center gap-2 text-sm text-ink-700">
              <ArrowLeft className="h-4 w-4" />
              {t('issues.detailPage.backToIssues')}
            </Link>
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-[0.18em] text-ink-400">{issue.identifier}</div>
              <Input value={draftIssue.title} onChange={(event) => setDraftIssue((current) => current ? { ...current, title: event.target.value } : current)} className="h-auto border-0 bg-transparent px-0 text-4xl font-semibold shadow-none focus-visible:ring-0" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={reset} disabled={!isDirty}>{t('common.cancel')}</Button>
            <Button onClick={save} disabled={!isDirty || updateIssueMutation.isPending}><Save className="mr-2 h-4 w-4" />{t('common.save')}</Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <Card className="section-panel">
              <CardHeader className="p-0 pb-4"><CardTitle>{t('issues.detailPage.description')}</CardTitle></CardHeader>
              <CardContent className="p-0"><MarkdownEditor value={draftIssue.description} onChange={(value) => setDraftIssue((current) => current ? { ...current, description: value } : current)} /></CardContent>
            </Card>

            <Card className="section-panel">
              <CardHeader className="flex-row items-center justify-between p-0 pb-4"><CardTitle>{t('issues.detailPage.subIssues')}</CardTitle><Badge variant="neutral">{childIssues.length}</Badge></CardHeader>
              <CardContent className="space-y-4 p-0">
                <div className="flex gap-3"><Input value={childTitle} onChange={(event) => setChildTitle(event.target.value)} placeholder={t('issues.detailPage.newSubIssue')} /><Button onClick={createChildIssue}><Plus className="mr-2 h-4 w-4" />{t('common.create')}</Button></div>
                {childIssues.length ? childIssues.map((child) => <Link key={child.id} href={localizePath(locale, `/issues/${child.id}`)} className="drawer-panel block"><div className="flex items-center justify-between gap-3"><div><div className="text-sm font-medium text-ink-900">{child.title}</div><div className="mt-1 text-xs text-ink-400">{child.identifier}</div></div><Badge variant={child.state === 'DONE' ? 'success' : child.state === 'IN_PROGRESS' ? 'brand' : 'neutral'}>{t(`common.status.${child.state}`)}</Badge></div></Link>) : <EmptyState label={t('issues.emptyStates.subIssues')} />}
              </CardContent>
            </Card>

            <Card id="resources" className="section-panel">
              <CardHeader className="flex-row items-center justify-between p-0 pb-4"><CardTitle>{t('issues.detailPage.resources')}</CardTitle><div className="flex items-center gap-2"><input ref={fileInputRef} type="file" className="hidden" onChange={(event) => uploadAttachment(event.target.files?.[0] ?? null)} /><Button variant="secondary" onClick={() => fileInputRef.current?.click()}><Paperclip className="mr-2 h-4 w-4" />{t('issues.detailPage.uploadAttachment')}</Button></div></CardHeader>
              <CardContent className="space-y-3 p-0">
                {attachments.length ? attachments.map((attachment) => <div key={attachment.id} className="drawer-panel flex items-center justify-between gap-4"><div><div className="text-sm font-medium text-ink-900">{attachment.filename}</div><div className="mt-1 text-xs text-ink-400">{formatSize(attachment.size)} · {formatDate(attachment.createdAt, locale)}</div></div><div className="flex items-center gap-2"><Button variant="ghost" size="icon" onClick={() => downloadIssueAttachment(issue.id, attachment.id, attachment.filename)}><Download className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => deleteAttachmentMutation.mutate({ issueId: issue.id, attachmentId: attachment.id })}><Trash2 className="h-4 w-4" /></Button></div></div>) : <EmptyState label={t('issues.emptyStates.attachments')} />}
              </CardContent>
            </Card>

            <Card className="section-panel">
              <CardHeader className="p-0 pb-4"><CardTitle>{t('issues.detailPage.linkedDocs')}</CardTitle></CardHeader>
              <CardContent className="space-y-4 p-0">
                <div className="grid gap-3"><Input value={docTitle} onChange={(event) => setDocTitle(event.target.value)} placeholder={t('issues.detail.docTitle')} /><Textarea value={docContent} onChange={(event) => setDocContent(event.target.value)} placeholder={t('issues.detail.docContent')} /><div className="flex justify-end"><Button onClick={createLinkedDoc}>{t('common.create')}</Button></div></div>
                {docs.length ? docs.map((doc) => <div key={doc.id} className="drawer-panel"><div className="text-sm font-medium text-ink-900">{doc.title}</div><div className="mt-1 text-xs text-ink-400">{doc.slug}</div></div>) : <EmptyState label={t('issues.emptyStates.docs')} />}
              </CardContent>
            </Card>

            <Card id="comments" className="section-panel">
              <CardHeader className="p-0 pb-4"><CardTitle>{t('issues.tabs.comments')}</CardTitle></CardHeader>
              <CardContent className="space-y-4 p-0">
                <Textarea value={commentBody} onChange={(event) => setCommentBody(event.target.value)} placeholder={t('issues.detail.commentPlaceholder')} />
                <div className="flex justify-end"><Button onClick={addComment}>{t('issues.detail.addComment')}</Button></div>
                <Separator />
                {comments.length ? comments.map((comment) => <div key={comment.id} className="drawer-panel"><div className="text-sm text-ink-900">{comment.body}</div><div className="mt-2 text-xs text-ink-400">#{comment.authorId} · {formatDate(comment.createdAt, locale)}</div></div>) : <EmptyState label={t('issues.emptyStates.comments')} />}
              </CardContent>
            </Card>

            <Card id="relations" className="section-panel">
              <CardHeader className="p-0 pb-4"><CardTitle>{t('issues.tabs.relations')}</CardTitle></CardHeader>
              <CardContent className="space-y-4 p-0">
                <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]"><Input value={relationTargetId} onChange={(event) => setRelationTargetId(event.target.value)} placeholder={t('issues.detail.relationTarget')} /><Select value={relationType} onValueChange={(value) => setRelationType(value as (typeof RELATION_TYPES)[number])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{RELATION_TYPES.map((option) => <SelectItem key={option} value={option}>{t(`issues.relationType.${option}`)}</SelectItem>)}</SelectContent></Select><Button onClick={addRelation}><Link2 className="mr-2 h-4 w-4" />{t('common.create')}</Button></div>
                {relations.length ? relations.map((relation) => <div key={relation.id} className="drawer-panel flex items-center justify-between gap-4"><div><div className="text-sm font-medium text-ink-900">{t(`issues.relationType.${relation.relationType}`)}</div><div className="mt-1 text-xs text-ink-400">{relation.fromIssueId} → {relation.toIssueId}</div></div><Button variant="ghost" size="icon" onClick={() => deleteRelationMutation.mutate({ issueId: issue.id, relationId: relation.id })}><Trash2 className="h-4 w-4" /></Button></div>) : <EmptyState label={t('issues.emptyStates.relations')} />}
              </CardContent>
            </Card>

            <Card id="activity" className="section-panel">
              <CardHeader className="p-0 pb-4"><CardTitle>{t('issues.tabs.activity')}</CardTitle></CardHeader>
              <CardContent className="space-y-3 p-0">{activity.length ? activity.map((event) => <div key={event.id} className="drawer-panel"><div className="text-sm font-medium text-ink-900">{event.summary}</div><div className="mt-1 text-xs text-ink-400">{event.actionType} · {formatDate(event.createdAt, locale)}</div></div>) : <EmptyState label={t('issues.emptyStates.activity')} />}</CardContent>
            </Card>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
            <Card className="section-panel">
              <CardHeader className="p-0 pb-4"><CardTitle>{t('issues.detailPage.properties')}</CardTitle></CardHeader>
              <CardContent className="space-y-4 p-0">
                <PropertySelect label={t('issues.columns.state')} value={draftIssue.state} onChange={(value) => setDraftIssue((current) => current ? { ...current, state: value as Issue['state'] } : current)} options={ISSUE_STATES.map((value) => [value, t(`common.status.${value}`)])} />
                <PropertySelect label={t('issues.columns.priority')} value={draftIssue.priority} onChange={(value) => setDraftIssue((current) => current ? { ...current, priority: value as Issue['priority'] } : current)} options={ISSUE_PRIORITIES.map((value) => [value, t(`common.priority.${value}`)])} />
                <PropertySelect label={t('issues.detailPage.assignee')} value={stringValue(draftIssue.assigneeId)} onChange={(value) => setDraftIssue((current) => current ? { ...current, assigneeId: parseNullableNumber(value) } : current)} options={[[EMPTY, t('common.notSet')], ...members.map((member) => [String(member.id), member.name])]} />
                <PropertySelect label={t('issues.columns.project')} value={String(draftIssue.projectId)} onChange={(value) => setDraftIssue((current) => current ? { ...current, projectId: Number(value) } : current)} options={projects.map((project) => [String(project.id), project.name])} />
                <PropertySelect label={t('issues.columns.epic')} value={stringValue(draftIssue.epicId)} onChange={(value) => setDraftIssue((current) => current ? { ...current, epicId: parseNullableNumber(value) } : current)} options={[[EMPTY, t('common.notSet')], ...epics.map((epic) => [String(epic.id), epic.title])]} />
                <PropertySelect label={t('issues.columns.sprint')} value={stringValue(draftIssue.sprintId)} onChange={(value) => setDraftIssue((current) => current ? { ...current, sprintId: parseNullableNumber(value) } : current)} options={[[EMPTY, t('common.notSet')], ...sprints.map((sprint) => [String(sprint.id), sprint.name])]} />
                <PropertySelect label={t('issues.columns.team')} value={stringValue(draftIssue.teamId)} onChange={(value) => setDraftIssue((current) => current ? { ...current, teamId: parseNullableNumber(value) } : current)} options={[[EMPTY, t('common.notSet')], ...teams.map((team) => [String(team.id), team.name])]} />
                <PropertySelect label={t('issues.detailPage.parentIssue')} value={stringValue(draftIssue.parentIssueId)} onChange={(value) => setDraftIssue((current) => current ? { ...current, parentIssueId: parseNullableNumber(value) } : current)} options={[[EMPTY, t('common.notSet')], ...childIssues.map((child) => [String(child.id), child.title])]} />
                <PropertyInput label={t('issues.detail.estimate')} value={String(draftIssue.estimatedHours)} onChange={(value) => setDraftIssue((current) => current ? { ...current, estimatedHours: Number(value) || 0 } : current)} type="number" />
                <PropertyInput label={t('issues.detail.actual')} value={String(draftIssue.actualHours)} onChange={(value) => setDraftIssue((current) => current ? { ...current, actualHours: Number(value) || 0 } : current)} type="number" />
                <PropertyInput label={t('issues.detailPage.plannedStart')} value={draftIssue.plannedStartDate ?? ''} onChange={(value) => setDraftIssue((current) => current ? { ...current, plannedStartDate: value || null } : current)} type="date" />
                <PropertyInput label={t('issues.detailPage.plannedEnd')} value={draftIssue.plannedEndDate ?? ''} onChange={(value) => setDraftIssue((current) => current ? { ...current, plannedEndDate: value || null } : current)} type="date" />
              </CardContent>
            </Card>

            <Card className="section-panel">
              <CardHeader className="p-0 pb-4"><CardTitle>{t('issues.customFields.detailTitle')}</CardTitle></CardHeader>
              <CardContent className="space-y-4 p-0">
                {customFieldDefinitions.filter((field) => field.showOnDetail).length ? customFieldDefinitions.filter((field) => field.showOnDetail).map((field) => <PropertyField key={field.id} label={field.name}><CustomFieldInput definition={field} teams={teams} members={members} value={draftIssue.customFields[field.key]} onChange={(value) => setDraftIssue((current) => current ? { ...current, customFields: { ...current.customFields, [field.key]: value } } : current)} /></PropertyField>) : <EmptyState label={t('common.empty')} compact />}
              </CardContent>
            </Card>

            <Card className="section-panel">
              <CardHeader className="p-0 pb-4"><CardTitle>{t('issues.detailPage.summary')}</CardTitle></CardHeader>
              <CardContent className="space-y-3 p-0 text-sm text-ink-700">
                <SummaryRow label={t('issues.tabs.relations')} value={String(relations.length)} action="#relations" />
                <SummaryRow label={t('issues.detailPage.resources')} value={String(attachments.length)} action="#resources" />
                <SummaryRow label={t('issues.tabs.comments')} value={String(comments.length)} action="#comments" />
                <SummaryRow label={t('issues.tabs.activity')} value={String(activity.length)} action="#activity" />
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}

function createDraft(issue: Issue): DraftIssue {
  return { title: issue.title, description: issue.description ?? '', state: issue.state, priority: issue.priority, assigneeId: issue.assigneeId, projectId: issue.projectId, epicId: issue.epicId, sprintId: issue.sprintId, teamId: issue.teamId, parentIssueId: issue.parentIssueId, estimatedHours: issue.estimatedHours, actualHours: issue.actualHours, plannedStartDate: issue.plannedStartDate, plannedEndDate: issue.plannedEndDate, customFields: { ...(issue.customFields ?? {}) } };
}

function normalizeDraft(draft: DraftIssue) { return JSON.stringify({ ...draft, customFields: sanitizeCustomFields(draft.customFields) }); }

function sanitizeCustomFields(values: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, normalizeCustomFieldValue(value)] as const).filter(([, value]) => value !== '' && value != null && !(Array.isArray(value) && value.length === 0)));
}

function normalizeCustomFieldValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed === 'true' || trimmed === 'false') return trimmed === 'true';
  if (trimmed.includes(',') && !Number.isFinite(Number(trimmed))) return trimmed.split(',').map((item) => item.trim()).filter(Boolean);
  return trimmed;
}

function CustomFieldInput({ definition, value, onChange, teams, members }: { definition: CustomFieldDefinition; value: unknown; onChange: (value: unknown) => void; teams: Array<{ id: number; name?: string }>; members: Array<{ id: number; name: string }> }) {
  switch (definition.dataType) {
    case 'TEXTAREA': return <Textarea value={String(value ?? '')} onChange={(event) => onChange(event.target.value)} />;
    case 'NUMBER': return <Input type="number" value={String(value ?? '')} onChange={(event) => onChange(event.target.value)} />;
    case 'DATE': return <Input type="date" value={String(value ?? '')} onChange={(event) => onChange(event.target.value)} />;
    case 'DATETIME': return <Input type="datetime-local" value={String(value ?? '')} onChange={(event) => onChange(event.target.value)} />;
    case 'BOOLEAN': return <PropertySelect value={stringValue(typeof value === 'boolean' ? String(value) : value)} onChange={(next) => onChange(next === EMPTY ? '' : next)} options={[[EMPTY, ''], ['true', 'True'], ['false', 'False']]} compact />;
    case 'SINGLE_SELECT': return <PropertySelect value={stringValue(value)} onChange={(next) => onChange(next === EMPTY ? '' : next)} options={[[EMPTY, ''], ...definition.options.filter((option) => option.isActive).map((option) => [option.value, option.label])]} compact />;
    case 'MULTI_SELECT': return <Input value={Array.isArray(value) ? value.join(', ') : String(value ?? '')} onChange={(event) => onChange(event.target.value)} placeholder="a, b, c" />;
    case 'TEAM': return <PropertySelect value={stringValue(value)} onChange={(next) => onChange(parseNullableNumber(next))} options={[[EMPTY, ''], ...teams.map((team) => [String(team.id), team.name ?? `#${team.id}`])]} compact />;
    case 'USER': return <PropertySelect value={stringValue(value)} onChange={(next) => onChange(parseNullableNumber(next))} options={[[EMPTY, ''], ...members.map((member) => [String(member.id), member.name])]} compact />;
    default: return <Input value={String(value ?? '')} onChange={(event) => onChange(event.target.value)} />;
  }
}

function SummaryRow({ label, value, action }: { label: string; value: string; action: string }) { return <a href={action} className="drawer-panel flex items-center justify-between gap-3"><span>{label}</span><span className="font-medium text-ink-900">{value}</span></a>; }
function PropertyField({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><div className="mb-1.5 text-xs uppercase tracking-[0.16em] text-ink-400">{label}</div>{children}</label>; }
function PropertySelect({ label, value, onChange, options, compact = false }: { label?: string; value: string; onChange: (value: string) => void; options: string[][]; compact?: boolean }) {
  const content = <Select value={value} onValueChange={onChange}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{options.map(([optionValue, optionLabel]) => <SelectItem key={`${optionValue}-${optionLabel}`} value={optionValue}>{optionLabel || ' '}</SelectItem>)}</SelectContent></Select>;
  return compact || !label ? content : <PropertyField label={label}>{content}</PropertyField>;
}
function PropertyInput({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) { return <PropertyField label={label}><Input type={type} value={value} onChange={(event) => onChange(event.target.value)} /></PropertyField>; }
function EmptyState({ label, compact = false }: { label: string; compact?: boolean }) { return <div className={`${compact ? 'text-sm' : 'rounded-card border border-dashed border-border-soft px-4 py-6 text-sm'} text-ink-400`}>{label}</div>; }
function stringValue(value: unknown): string { return value == null || value === '' ? EMPTY : String(value); }
function parseNullableNumber(value: string): number | null { return value === EMPTY ? null : Number(value); }
function formatSize(size: number): string { if (size < 1024) return `${size} B`; if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`; return `${(size / (1024 * 1024)).toFixed(1)} MB`; }
function formatDate(value: string, locale: string): string { return new Date(value).toLocaleString(locale === 'en' ? 'en-US' : 'zh-CN'); }
