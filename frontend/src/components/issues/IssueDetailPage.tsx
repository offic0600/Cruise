'use client';

import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronRight,
  Download,
  Link2,
  MessageSquare,
  Paperclip,
  Plus,
  Trash2,
} from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import MarkdownEditor from '@/components/issues/MarkdownEditor';
import { useCurrentWorkspace } from '@/components/providers/WorkspaceProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { localizePath } from '@/i18n/config';
import { useI18n } from '@/i18n/useI18n';
import { downloadIssueAttachment, type CustomFieldDefinition, type Issue } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import { useIssueDetailWorkspace, useIssueMutations } from '@/lib/query/issues';

const EMPTY = '__empty__';
const ISSUE_STATES: Issue['state'][] = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELED'];
const ISSUE_PRIORITIES: Issue['priority'][] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const ISSUE_RESOLUTIONS: NonNullable<Issue['resolution']>[] = ['COMPLETED', 'CANCELED', 'DUPLICATE', 'OBSOLETE', 'WONT_DO'];
const RELATION_TYPES = ['BLOCKS', 'BLOCKED_BY', 'RELATES_TO', 'DUPLICATES', 'CAUSED_BY', 'SPLIT_FROM'] as const;

interface IssueDetailPageProps {
  issueId: number;
}

interface DraftIssue {
  title: string;
  description: string;
  state: Issue['state'];
  resolution: Issue['resolution'];
  priority: Issue['priority'];
  assigneeId: number | null;
  projectId: number | null;
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
  const { currentTeamId } = useCurrentWorkspace();
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
  const teams = teamsQuery.data ?? [];
  const members = useMemo(() => {
    const allMembers = (membersQuery.data as Array<{ id: number; name: string; teamId?: number | null }> | undefined) ?? [];
    const scopedTeamId = issue?.teamId ?? currentTeamId ?? null;
    if (scopedTeamId == null) return allMembers;
    return allMembers.filter((member) => member.teamId == null || member.teamId === scopedTeamId);
  }, [currentTeamId, issue?.teamId, membersQuery.data]);
  const customFieldDefinitions = (issue?.customFieldDefinitions ?? customFieldDefinitionsQuery.data ?? []) as CustomFieldDefinition[];

  const [draftIssue, setDraftIssue] = useState<DraftIssue | null>(null);
  const [commentBody, setCommentBody] = useState('');
  const [childTitle, setChildTitle] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [relationTargetId, setRelationTargetId] = useState('');
  const [relationType, setRelationType] = useState<(typeof RELATION_TYPES)[number]>('RELATES_TO');
  const [bodyMode, setBodyMode] = useState<'read' | 'edit'>('read');
  const [activeProperty, setActiveProperty] = useState<string | null>(null);
  const [isAddingChild, setIsAddingChild] = useState(false);

  useEffect(() => {
    if (!issue) return;
    setDraftIssue(createDraft(issue));
    setBodyMode('read');
    setActiveProperty(null);
  }, [issue]);

  const initialSnapshot = useMemo(() => (issue ? normalizeDraft(createDraft(issue)) : ''), [issue]);
  const currentSnapshot = useMemo(() => (draftIssue ? normalizeDraft(draftIssue) : ''), [draftIssue]);

  useEffect(() => {
    if (!issue || !draftIssue) return;
    if (currentSnapshot === initialSnapshot) return;
    const handle = window.setTimeout(() => {
      void updateIssueMutation.mutateAsync({
        id: issue.id,
        data: {
          title: draftIssue.title,
          description: draftIssue.description,
          state: draftIssue.state,
          resolution: draftIssue.resolution,
          priority: draftIssue.priority,
          assigneeId: toNullableForeignKeyPayload(draftIssue.assigneeId),
          projectId: draftIssue.projectId,
          teamId: toNullableForeignKeyPayload(draftIssue.teamId),
          parentIssueId: toNullableForeignKeyPayload(draftIssue.parentIssueId),
          estimatedHours: draftIssue.estimatedHours,
          actualHours: draftIssue.actualHours,
          plannedStartDate: draftIssue.plannedStartDate,
          plannedEndDate: draftIssue.plannedEndDate,
          customFields: sanitizeCustomFields(draftIssue.customFields),
        },
      });
    }, 350);
    return () => window.clearTimeout(handle);
  }, [currentSnapshot, initialSnapshot, draftIssue, issue, updateIssueMutation]);

  const projectMap = useMemo(() => new Map(projects.map((project) => [project.id, project.name])), [projects]);
  const teamMap = useMemo(() => new Map(teams.map((team) => [team.id, team.name])), [teams]);
  const memberMap = useMemo(() => new Map(members.map((member) => [member.id, member.name])), [members]);
  const childMap = useMemo(() => new Map(childIssues.map((child) => [child.id, child.title])), [childIssues]);

  const visibleCustomFields = useMemo(
    () =>
      customFieldDefinitions
        .filter((field) => field.showOnDetail && field.isVisible && field.isActive)
        .sort((left, right) => left.sortOrder - right.sortOrder),
    [customFieldDefinitions]
  );

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
    setIsAddingChild(false);
  };

  const addComment = async () => {
    if (!issue || !commentBody.trim()) return;
    await createCommentMutation.mutateAsync({
      targetType: 'ISSUE',
      targetId: issue.id,
      authorId: user?.id ?? 1,
      body: commentBody.trim(),
    });
    setCommentBody('');
  };

  const createLinkedDoc = async () => {
    if (!issue || !docTitle.trim()) return;
    await createDocMutation.mutateAsync({
      organizationId: issue.organizationId,
      teamId: issue.teamId,
      projectId: issue.projectId,
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
    return (
      <AppLayout>
        <div className="py-16 text-center text-ink-400">{t('common.loading')}</div>
      </AppLayout>
    );
  }

  if (!issue) {
    return (
      <AppLayout>
        <div className="py-16 text-center text-ink-400">{t('common.empty')}</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-[1280px]">
        <div className="flex flex-col gap-8 pb-10">
          <header className="flex flex-col gap-6 border-b border-border-soft/80 pb-7">
            <div className="min-w-0 space-y-4">
              <div className="flex items-center gap-2 text-sm text-ink-500">
                <Link
                  href={localizePath(locale, '/issues')}
                  className="inline-flex items-center gap-1.5 transition hover:text-ink-900"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t('issues.detailPage.backToIssues')}
                </Link>
                <ChevronRight className="h-4 w-4 text-ink-300" />
                <span className="truncate text-ink-700">{issue.identifier}</span>
              </div>
              <EditableTitle
                value={draftIssue.title}
                onChange={(value) => setDraftIssue((current) => (current ? { ...current, title: value } : current))}
              />
            </div>
          </header>

          <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_292px]">
            <main className="min-w-0 space-y-8">
              <section className="pb-2">
                <MarkdownEditor
                  value={draftIssue.description}
                  onChange={(value) => setDraftIssue((current) => (current ? { ...current, description: value } : current))}
                  mode={bodyMode}
                  onEnterEdit={() => setBodyMode('edit')}
                  onCancelEdit={() => setBodyMode('read')}
                />
              </section>

              <DetailSection
                title={t('issues.detailPage.subIssues')}
                action={
                  <Link
                    href={localizePath(
                      locale,
                    `/issues/new?parentIssueId=${issue.id}${issue.projectId != null ? `&projectId=${issue.projectId}` : ''}&teamId=${issue.teamId ?? ''}&title=`
                    )}
                    className="flex items-center gap-2 text-sm text-ink-400 transition hover:text-ink-700"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{t('issues.detailPage.newSubIssue')}</span>
                  </Link>
                }
              >
                <div className="divide-y divide-border-soft">
                  {childIssues.length ? (
                    childIssues.map((child) => (
                      <Link
                        key={child.id}
                        href={localizePath(locale, `/issues/${child.id}`)}
                        className="flex items-center justify-between gap-4 py-3 transition hover:bg-slate-50/60"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-ink-900">{child.title}</div>
                          <div className="mt-1 text-xs tracking-[0.18em] text-ink-400">{child.identifier}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <IssueStateBadge state={child.state} t={t} />
                          <ChevronRight className="h-4 w-4 text-ink-300" />
                        </div>
                      </Link>
                    ))
                  ) : (
                    <EmptyState label={t('issues.emptyStates.subIssues')} />
                  )}
                </div>
              </DetailSection>

              <DetailSection
                id="resources"
                title={t('issues.detailPage.resources')}
                action={
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={(event) => uploadAttachment(event.target.files?.[0] ?? null)}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 py-1 text-sm text-ink-400 transition hover:text-ink-700"
                    >
                      <Paperclip className="h-4 w-4" />
                      <span>{t('issues.detailPage.uploadAttachment')}</span>
                    </button>
                  </div>
                }
              >
                <div className="divide-y divide-border-soft">
                  {attachments.length ? (
                    attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center justify-between gap-4 py-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-ink-900">{attachment.filename}</div>
                          <div className="mt-1 text-xs text-ink-400">
                            {formatSize(attachment.size)} · {formatDate(attachment.createdAt, locale)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => downloadIssueAttachment(issue.id, attachment.id, attachment.filename)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteAttachmentMutation.mutate({ issueId: issue.id, attachmentId: attachment.id })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState label={t('issues.emptyStates.attachments')} />
                  )}
                </div>
              </DetailSection>

              <DetailSection title={t('issues.detailPage.linkedDocs')}>
                <div className="grid gap-3">
                  <Input
                    value={docTitle}
                    onChange={(event) => setDocTitle(event.target.value)}
                    placeholder={t('issues.detail.docTitle')}
                    className="h-10 rounded-xl border-border-soft/70 bg-transparent"
                  />
                  <EditableSurface
                    value={docContent}
                    onChange={setDocContent}
                    placeholder={t('issues.detail.docContent')}
                    minHeight={92}
                  />
                  <div className="flex justify-end">
                    <Button variant="ghost" onClick={createLinkedDoc}>
                      {t('common.create')}
                    </Button>
                  </div>
                </div>
                <div className="divide-y divide-border-soft">
                  {docs.length ? (
                    docs.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between gap-4 py-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-ink-900">{doc.title}</div>
                          <div className="mt-1 text-xs text-ink-400">{doc.slug}</div>
                        </div>
                        <Badge variant="neutral">{doc.status}</Badge>
                      </div>
                    ))
                  ) : (
                    <EmptyState label={t('issues.emptyStates.docs')} />
                  )}
                </div>
              </DetailSection>

              <DetailSection id="relations" title={t('issues.tabs.relations')}>
                <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
                  <Input
                    value={relationTargetId}
                    onChange={(event) => setRelationTargetId(event.target.value)}
                    placeholder={t('issues.detail.relationTarget')}
                    className="h-11 rounded-2xl border-border-soft bg-transparent"
                  />
                  <Select value={relationType} onValueChange={(value) => setRelationType(value as (typeof RELATION_TYPES)[number])}>
                    <SelectTrigger className="h-11 rounded-2xl border-border-soft bg-transparent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RELATION_TYPES.map((option) => (
                        <SelectItem key={option} value={option}>
                          {t(`issues.relationType.${option}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" onClick={addRelation}>
                    <Link2 className="mr-2 h-4 w-4" />
                    {t('common.create')}
                  </Button>
                </div>
                <div className="divide-y divide-border-soft">
                  {relations.length ? (
                    relations.map((relation) => (
                      <div key={relation.id} className="flex items-center justify-between gap-4 py-3">
                        <div>
                          <div className="text-sm font-medium text-ink-900">{t(`issues.relationType.${relation.relationType}`)}</div>
                          <div className="mt-1 text-xs text-ink-400">
                            {relation.fromIssueId} → {relation.toIssueId}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteRelationMutation.mutate({ issueId: issue.id, relationId: relation.id })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <EmptyState label={t('issues.emptyStates.relations')} />
                  )}
                </div>
              </DetailSection>

              <DetailSection id="activity" title={t('issues.tabs.activity')}>
                <div className="space-y-6">
                  <div className="border-b border-border-soft pb-6">
                    <div className="mb-3 text-xs uppercase tracking-[0.18em] text-ink-400">{t('issues.tabs.comments')}</div>
                  <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-brand-600/12 text-brand-600">
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-3">
                        <EditableSurface
                          value={commentBody}
                          onChange={setCommentBody}
                          placeholder={t('issues.detail.commentPlaceholder')}
                          minHeight={96}
                        />
                        <div className="flex justify-end">
                          <Button variant="ghost" onClick={addComment}>
                            {t('issues.detail.addComment')}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 divide-y divide-border-soft">
                      {comments.length ? (
                        comments.map((comment) => (
                          <div key={comment.id} className="py-3">
                            <div className="text-sm leading-6 text-ink-900">{comment.body}</div>
                            <div className="mt-2 text-xs text-ink-400">
                              #{comment.authorId} · {formatDate(comment.createdAt, locale)}
                            </div>
                          </div>
                        ))
                      ) : (
                        <EmptyState label={t('issues.emptyStates.comments')} />
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="mb-3 text-xs uppercase tracking-[0.18em] text-ink-400">Changes</div>
                    <div className="divide-y divide-border-soft">
                      {activity.length ? (
                        activity.map((event) => (
                          <div key={event.id} className="py-3">
                            <div className="text-sm font-medium text-ink-900">{event.summary}</div>
                            <div className="mt-1 text-xs text-ink-400">
                              {event.actionType} · {formatDate(event.createdAt, locale)}
                            </div>
                          </div>
                        ))
                      ) : (
                        <EmptyState label={t('issues.emptyStates.activity')} />
                      )}
                    </div>
                  </div>
                </div>
              </DetailSection>
            </main>

            <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
              <PropertyPanel title={t('issues.detailPage.properties')}>
                <PropertyGroup title="Properties">
                  <InlineSelectRow
                    label={t('issues.columns.state')}
                    editor={
                        <Select
                          value={draftIssue.state}
                          onValueChange={(value) => {
                            setDraftIssue((current) =>
                              current
                                ? {
                                    ...current,
                                    state: value as Issue['state'],
                                    resolution: nextResolutionForState(value as Issue['state'], current.resolution),
                                  }
                                : current
                            );
                            setActiveProperty(null);
                          }}
                      >
                        <SelectTrigger className="h-auto min-h-0 rounded-none border-0 bg-transparent px-0 py-0 text-sm text-ink-900 shadow-none hover:bg-transparent focus:ring-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ISSUE_STATES.map((value) => (
                            <SelectItem key={value} value={value}>
                              {t(`common.status.${value}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    }
                  />
                  {draftIssue.state === 'DONE' || draftIssue.state === 'CANCELED' ? (
                    <InlineSelectRow
                      label={locale.startsWith('zh') ? '关闭原因' : 'Resolution'}
                      editor={
                        <Select
                          value={draftIssue.resolution ?? nextResolutionForState(draftIssue.state, draftIssue.resolution) ?? EMPTY}
                          onValueChange={(value) => {
                            setDraftIssue((current) =>
                              current
                                ? { ...current, resolution: value === EMPTY ? null : (value as Issue['resolution']) }
                                : current
                            );
                            setActiveProperty(null);
                          }}
                        >
                          <SelectTrigger className="h-auto min-h-0 rounded-none border-0 bg-transparent px-0 py-0 text-sm text-ink-900 shadow-none hover:bg-transparent focus:ring-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {draftIssue.state === 'CANCELED' ? (
                              ISSUE_RESOLUTIONS.filter((value) => value !== 'COMPLETED').map((value) => (
                                <SelectItem key={value} value={value}>
                                  {t(`common.resolution.${value}`)}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="COMPLETED">{t('common.resolution.COMPLETED')}</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      }
                    />
                  ) : null}
                  <InlineSelectRow
                    label={t('issues.columns.priority')}
                    editor={
                      <Select
                        value={draftIssue.priority}
                        onValueChange={(value) => {
                          setDraftIssue((current) => (current ? { ...current, priority: value as Issue['priority'] } : current));
                          setActiveProperty(null);
                        }}
                      >
                        <SelectTrigger className="h-auto min-h-0 rounded-none border-0 bg-transparent px-0 py-0 text-sm text-ink-900 shadow-none hover:bg-transparent focus:ring-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ISSUE_PRIORITIES.map((value) => (
                            <SelectItem key={value} value={value}>
                              {t(`common.priority.${value}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    }
                  />
                  <InlineSelectRow
                    label={t('issues.detailPage.assignee')}
                    editor={
                      <Select
                        value={stringValue(draftIssue.assigneeId)}
                        onValueChange={(value) => {
                          setDraftIssue((current) => (current ? { ...current, assigneeId: parseNullableNumber(value) } : current));
                          setActiveProperty(null);
                        }}
                      >
                        <SelectTrigger className="h-auto min-h-0 rounded-none border-0 bg-transparent px-0 py-0 text-sm text-ink-900 shadow-none hover:bg-transparent focus:ring-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={EMPTY}>{t('common.notSet')}</SelectItem>
                          {members.map((member) => (
                            <SelectItem key={member.id} value={String(member.id)}>
                              {member.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    }
                  />
                </PropertyGroup>

                <PropertyGroup title="Planning">
                  <InlineSelectRow
                    label={t('issues.columns.project')}
                    editor={
                      <Select
                        value={stringValue(draftIssue.projectId)}
                        onValueChange={(value) => {
                          setDraftIssue((current) => (current ? { ...current, projectId: Number(value) } : current));
                          setActiveProperty(null);
                        }}
                      >
                        <SelectTrigger className="h-auto min-h-0 rounded-none border-0 bg-transparent px-0 py-0 text-sm text-ink-900 shadow-none hover:bg-transparent focus:ring-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={String(project.id)}>
                              {project.name}
                            </SelectItem>
                          ))}
                          <SelectItem value={EMPTY}>{t('common.notSet')}</SelectItem>
                        </SelectContent>
                      </Select>
                    }
                  />
                  <InlineSelectRow
                    label={t('issues.detailPage.team')}
                    editor={
                      <Select
                        value={stringValue(draftIssue.teamId)}
                        onValueChange={(value) => {
                          setDraftIssue((current) => (current ? { ...current, teamId: parseNullableNumber(value) } : current));
                          setActiveProperty(null);
                        }}
                      >
                        <SelectTrigger className="h-auto min-h-0 rounded-none border-0 bg-transparent px-0 py-0 text-sm text-ink-900 shadow-none hover:bg-transparent focus:ring-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={EMPTY}>{t('common.notSet')}</SelectItem>
                          {teams.map((team) => (
                            <SelectItem key={team.id} value={String(team.id)}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    }
                  />
                  <InlineSelectRow
                    label={t('issues.detailPage.parentIssue')}
                    editor={
                      <Select
                        value={stringValue(draftIssue.parentIssueId)}
                        onValueChange={(value) => {
                          setDraftIssue((current) => (current ? { ...current, parentIssueId: parseNullableNumber(value) } : current));
                          setActiveProperty(null);
                        }}
                      >
                        <SelectTrigger className="h-auto min-h-0 rounded-none border-0 bg-transparent px-0 py-0 text-sm text-ink-900 shadow-none hover:bg-transparent focus:ring-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={EMPTY}>{t('common.notSet')}</SelectItem>
                          {childIssues.map((child) => (
                            <SelectItem key={child.id} value={String(child.id)}>
                              {child.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    }
                  />
                </PropertyGroup>

                <PropertyGroup title="Estimates">
                  <InlineInputRow
                    label={t('issues.detailPage.estimatedHours')}
                    valueLabel={draftIssue.estimatedHours ? `${draftIssue.estimatedHours}h` : t('common.notSet')}
                    isEditing={activeProperty === 'estimatedHours'}
                    onActivate={() => setActiveProperty('estimatedHours')}
                    editor={
                      <Input
                        type="number"
                        value={draftIssue.estimatedHours}
                        onChange={(event) =>
                          setDraftIssue((current) =>
                            current ? { ...current, estimatedHours: Number(event.target.value) || 0 } : current
                          )
                        }
                        onBlur={() => setActiveProperty(null)}
                        className="h-9 rounded-xl border-border-soft bg-transparent"
                      />
                    }
                  />
                  <InlineInputRow
                    label={t('issues.detailPage.actualHours')}
                    valueLabel={draftIssue.actualHours ? `${draftIssue.actualHours}h` : t('common.notSet')}
                    isEditing={activeProperty === 'actualHours'}
                    onActivate={() => setActiveProperty('actualHours')}
                    editor={
                      <Input
                        type="number"
                        value={draftIssue.actualHours}
                        onChange={(event) =>
                          setDraftIssue((current) =>
                            current ? { ...current, actualHours: Number(event.target.value) || 0 } : current
                          )
                        }
                        onBlur={() => setActiveProperty(null)}
                        className="h-9 rounded-xl border-border-soft bg-transparent"
                      />
                    }
                  />
                  <InlineInputRow
                    label={t('issues.detailPage.plannedStart')}
                    valueLabel={draftIssue.plannedStartDate || t('common.notSet')}
                    isEditing={activeProperty === 'plannedStart'}
                    onActivate={() => setActiveProperty('plannedStart')}
                    editor={
                      <Input
                        type="date"
                        value={draftIssue.plannedStartDate ?? ''}
                        onChange={(event) =>
                          setDraftIssue((current) =>
                            current ? { ...current, plannedStartDate: event.target.value || null } : current
                          )
                        }
                        onBlur={() => setActiveProperty(null)}
                        className="h-9 rounded-xl border-border-soft bg-transparent"
                      />
                    }
                  />
                  <InlineInputRow
                    label={t('issues.detailPage.plannedEnd')}
                    valueLabel={draftIssue.plannedEndDate || t('common.notSet')}
                    isEditing={activeProperty === 'plannedEnd'}
                    onActivate={() => setActiveProperty('plannedEnd')}
                    editor={
                      <Input
                        type="date"
                        value={draftIssue.plannedEndDate ?? ''}
                        onChange={(event) =>
                          setDraftIssue((current) =>
                            current ? { ...current, plannedEndDate: event.target.value || null } : current
                          )
                        }
                        onBlur={() => setActiveProperty(null)}
                        className="h-9 rounded-xl border-border-soft bg-transparent"
                      />
                    }
                  />
                </PropertyGroup>
              </PropertyPanel>

              <PropertyPanel title="Custom fields">
                {visibleCustomFields.length ? (
                  <div className="space-y-0">
                    {visibleCustomFields.map((field) => (
                      <InlineCustomFieldRow
                        key={field.id}
                        field={field}
                        value={draftIssue.customFields[field.key]}
                        isEditing={activeProperty === `custom:${field.key}`}
                        onActivate={() => setActiveProperty(`custom:${field.key}`)}
                        onDone={() => setActiveProperty(null)}
                        onChange={(value) =>
                          setDraftIssue((current) =>
                            current
                              ? {
                                  ...current,
                                  customFields: {
                                    ...current.customFields,
                                    [field.key]: value,
                                  },
                                }
                              : current
                          )
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState label={t('issues.emptyStates.customFields')} compact />
                )}
              </PropertyPanel>

              <PropertyPanel title="Links">
                <div className="space-y-1">
                  <QuickLink href="#relations" label={t('issues.tabs.relations')} count={relations.length} />
                  <QuickLink href="#resources" label={t('issues.detailPage.resources')} count={attachments.length} />
                  <QuickLink href="#activity" label={t('issues.tabs.activity')} count={activity.length + comments.length} />
                </div>
              </PropertyPanel>
            </aside>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function DetailSection({
  id,
  title,
  action,
  children,
}: {
  id?: string;
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="space-y-4 border-t border-border-soft/80 pt-6 first:border-t-0 first:pt-0">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[18px] font-semibold tracking-tight text-ink-900">{title}</h2>
        {action}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function PropertyPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-border-soft/70 px-1 pt-4 first:border-t-0 first:pt-0">
      <div className="mb-3 text-[12px] font-medium text-ink-700">{title}</div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function PropertyGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-ink-400">{title}</div>
      <div className="divide-y divide-border-soft/70">{children}</div>
    </div>
  );
}

function InlineSelectRow({
  label,
  editor,
}: {
  label: string;
  editor: ReactNode;
}) {
  return (
    <div className="py-2">
      <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-ink-400">{label}</div>
      <div className="rounded-xl bg-white/40 p-1">{editor}</div>
    </div>
  );
}

function InlineInputRow({
  label,
  valueLabel,
  isEditing,
  onActivate,
  editor,
}: {
  label: string;
  valueLabel: string;
  isEditing: boolean;
  onActivate: () => void;
  editor: ReactNode;
}) {
  return (
    <div className="py-2">
      <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-ink-400">{label}</div>
      {isEditing ? (
        <div className="space-y-2 rounded-xl bg-white/50 p-1.5">{editor}</div>
      ) : (
        <button
          type="button"
          onClick={onActivate}
          className="group flex w-full items-center justify-between py-1.5 text-left text-sm text-ink-900 transition hover:text-brand-600"
        >
          <span className="truncate">{valueLabel}</span>
          <ChevronRight className="h-4 w-4 text-ink-300 opacity-0 transition group-hover:opacity-100" />
        </button>
      )}
    </div>
  );
}

function InlineCustomFieldRow({
  field,
  value,
  isEditing,
  onActivate,
  onDone,
  onChange,
}: {
  field: CustomFieldDefinition;
  value: unknown;
  isEditing: boolean;
  onActivate: () => void;
  onDone?: () => void;
  onChange: (value: unknown) => void;
}) {
  return (
    <div className="border-t border-border-soft/70 first:border-t-0 py-2">
      <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-ink-400">{field.name}</div>
      {isEditing ? (
        <div className="space-y-2 rounded-xl bg-white/50 p-1.5">
          <CustomFieldInput field={field} value={value} onChange={onChange} onDone={onDone} />
        </div>
      ) : (
        <button
          type="button"
          onClick={onActivate}
          className="group flex w-full items-center justify-between py-1.5 text-left text-sm text-ink-900 transition hover:text-brand-600"
        >
          <span className="truncate">{formatCustomFieldValue(field, value)}</span>
          <ChevronRight className="h-4 w-4 text-ink-300 opacity-0 transition group-hover:opacity-100" />
        </button>
      )}
    </div>
  );
}

function QuickLink({ href, label, count }: { href: string; label: string; count: number }) {
  return (
    <a href={href} className="flex items-center justify-between py-1.5 text-sm text-ink-700 transition hover:text-ink-900">
      <span>{label}</span>
      <span className="text-ink-400">{count}</span>
    </a>
  );
}

function IssueStateBadge({
  state,
  resolution,
  t,
}: {
  state: Issue['state'];
  resolution?: Issue['resolution'];
  t: (key: string, vars?: Record<string, string | number>) => string;
}) {
  if (state === 'DONE') {
    return <Badge variant="success">{resolution && resolution !== 'COMPLETED' ? `${t(`common.status.${state}`)} · ${t(`common.resolution.${resolution}`)}` : t(`common.status.${state}`)}</Badge>;
  }
  if (state === 'IN_PROGRESS' || state === 'IN_REVIEW') return <Badge variant="brand">{t(`common.status.${state}`)}</Badge>;
  if (state === 'CANCELED') {
    return <Badge variant="danger">{resolution && resolution !== 'CANCELED' ? `${t(`common.status.${state}`)} · ${t(`common.resolution.${resolution}`)}` : t(`common.status.${state}`)}</Badge>;
  }
  return <Badge variant="neutral">{t(`common.status.${state}`)}</Badge>;
}

function EmptyState({ label, compact = false }: { label: string; compact?: boolean }) {
  return <div className={compact ? 'py-2 text-sm text-ink-400' : 'py-4 text-sm text-ink-400'}>{label}</div>;
}

function EditableTitle({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div
      contentEditable
      suppressContentEditableWarning
      onInput={(event) => onChange(event.currentTarget.textContent ?? '')}
      className="min-h-[1.2em] cursor-text text-[40px] font-semibold leading-[1.08] tracking-[-0.03em] text-ink-900 outline-none lg:text-[46px]"
    >
      {value}
    </div>
  );
}

function EditableSurface({
  value,
  onChange,
  placeholder,
  minHeight = 88,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  minHeight?: number;
}) {
  return (
    <div className="rounded-2xl border border-border-soft/70 bg-white/48 px-4 py-3 transition focus-within:border-border-soft focus-within:bg-white/70">
      <div
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={(event) => onChange(event.currentTarget.textContent ?? '')}
        className="editable-surface min-h-[var(--editable-min-height)] text-sm leading-7 text-ink-900 outline-none"
        style={{ ['--editable-min-height' as string]: `${minHeight}px` }}
      >
        {value}
      </div>
    </div>
  );
}

function createDraft(issue: Issue): DraftIssue {
  return {
    title: issue.title,
    description: issue.description ?? '',
    state: issue.state,
    resolution: issue.resolution,
    priority: issue.priority,
    assigneeId: issue.assigneeId,
    projectId: issue.projectId,
    teamId: issue.teamId,
    parentIssueId: issue.parentIssueId,
    estimatedHours: issue.estimatedHours,
    actualHours: issue.actualHours,
    plannedStartDate: issue.plannedStartDate,
    plannedEndDate: issue.plannedEndDate,
    customFields: issue.customFields ?? {},
  };
}

function normalizeDraft(draft: DraftIssue) {
  return JSON.stringify({
    ...draft,
    customFields: sanitizeCustomFields(draft.customFields),
  });
}

function sanitizeCustomFields(customFields: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(customFields).map(([key, value]) => [key, sanitizeCustomFieldValue(value)])
  );
}

function sanitizeCustomFieldValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => sanitizeCustomFieldValue(item));
  if (value === '') return null;
  if (value && typeof value === 'object') return value;
  return value;
}

function CustomFieldInput({
  field,
  value,
  onChange,
  onDone,
}: {
  field: CustomFieldDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
  onDone?: () => void;
}) {
  switch (field.dataType) {
    case 'TEXTAREA':
      return (
        <Textarea
          value={String(value ?? '')}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onDone}
          className="min-h-[92px] rounded-xl border-border-soft bg-transparent"
        />
      );
    case 'NUMBER':
      return (
        <Input
          type="number"
          value={String(value ?? '')}
          onChange={(event) => onChange(event.target.value === '' ? null : Number(event.target.value))}
          onBlur={onDone}
          className="h-9 rounded-xl border-border-soft bg-transparent"
        />
      );
    case 'DATE':
      return (
        <Input
          type="date"
          value={String(value ?? '')}
          onChange={(event) => onChange(event.target.value || null)}
          onBlur={onDone}
          className="h-9 rounded-xl border-border-soft bg-transparent"
        />
      );
    case 'DATETIME':
      return (
        <Input
          type="datetime-local"
          value={String(value ?? '')}
          onChange={(event) => onChange(event.target.value || null)}
          onBlur={onDone}
          className="h-9 rounded-xl border-border-soft bg-transparent"
        />
      );
    case 'BOOLEAN':
      return (
        <Select
          value={String(Boolean(value))}
          onValueChange={(next) => {
            onChange(next === 'true');
            onDone?.();
          }}
        >
          <SelectTrigger className="h-auto min-h-0 rounded-none border-0 bg-transparent px-0 py-0 text-sm text-ink-900 shadow-none hover:bg-transparent focus:ring-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">True</SelectItem>
            <SelectItem value="false">False</SelectItem>
          </SelectContent>
        </Select>
      );
    case 'SINGLE_SELECT':
      return (
        <Select
          value={String(value ?? EMPTY)}
          onValueChange={(next) => {
            onChange(next === EMPTY ? null : next);
            onDone?.();
          }}
        >
          <SelectTrigger className="h-auto min-h-0 rounded-none border-0 bg-transparent px-0 py-0 text-sm text-ink-900 shadow-none hover:bg-transparent focus:ring-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={EMPTY}>Not set</SelectItem>
            {field.options.map((option) => (
              <SelectItem key={option.id} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case 'MULTI_SELECT': {
      const current = Array.isArray(value) ? value.map(String) : [];
      return (
        <div
          className="flex flex-wrap gap-2 rounded-xl border border-border-soft px-3 py-3"
          tabIndex={0}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              onDone?.();
            }
          }}
        >
          {field.options.map((option) => {
            const selected = current.includes(option.value);
            return (
              <button
                type="button"
                key={option.id}
                onClick={() =>
                  onChange(
                    selected ? current.filter((item) => item !== option.value) : [...current, option.value]
                  )
                }
                className={
                  selected
                    ? 'rounded-full bg-brand-600/12 px-3 py-1 text-xs font-medium text-brand-600'
                    : 'rounded-full bg-surface-soft px-3 py-1 text-xs font-medium text-ink-700'
                }
              >
                {option.label}
              </button>
            );
          })}
        </div>
      );
    }
    case 'TEXT':
    case 'URL':
    case 'USER':
    case 'TEAM':
    default:
      return (
        <Input
          value={String(value ?? '')}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onDone}
          className="h-9 rounded-xl border-border-soft bg-transparent"
        />
      );
  }
}

function stringValue(value: number | null) {
  return value == null ? EMPTY : String(value);
}

function parseNullableNumber(value: string) {
  return value === EMPTY ? null : Number(value);
}

function toNullableForeignKeyPayload(value: number | null) {
  return value == null ? 0 : value;
}

function nextResolutionForState(state: Issue['state'], resolution: Issue['resolution']) {
  if (state === 'DONE') return 'COMPLETED';
  if (state === 'CANCELED') {
    return resolution && resolution !== 'COMPLETED' ? resolution : 'CANCELED';
  }
  return null;
}

function valueFromMap(map: Map<number, string>, key: number | null, fallback: string) {
  return key == null ? fallback : map.get(key) ?? fallback;
}

function formatCustomFieldValue(field: CustomFieldDefinition, value: unknown) {
  if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) return 'Not set';
  if (field.dataType === 'MULTI_SELECT' && Array.isArray(value)) {
    const labelMap = new Map(field.options.map((option) => [option.value, option.label]));
    return value.map((item) => labelMap.get(String(item)) ?? String(item)).join(', ');
  }
  if (field.dataType === 'SINGLE_SELECT') {
    return field.options.find((option) => option.value === value)?.label ?? String(value);
  }
  if (field.dataType === 'BOOLEAN') return value ? 'True' : 'False';
  return String(value);
}

function formatSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string | null, locale: string) {
  if (!value) return '';
  return new Intl.DateTimeFormat(locale === 'zh-CN' ? 'zh-CN' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
