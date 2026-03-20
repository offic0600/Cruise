'use client';

import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  CalendarPlus,
  Clock3,
  Copy,
  CopyPlus,
  FileText,
  Flag,
  FolderKanban,
  ArrowLeft,
  ArrowUp,
  ChevronRight,
  Download,
  Link2,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Plus,
  Repeat,
  SmilePlus,
  Star,
  Trash2,
} from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { IssueDetailActionBar } from '@/components/issues/issue-detail/IssueDetailActionBar';
import { IssueDetailSidebar } from '@/components/issues/issue-detail/IssueDetailSidebar';
import MarkdownEditor from '@/components/issues/MarkdownEditor';
import { useCurrentWorkspace } from '@/components/providers/WorkspaceProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useI18n } from '@/i18n/useI18n';
import {
  createIssue,
  createIssueLinkAttachments,
  createIssueTemplate,
  createRecurringIssue,
  deleteIssue,
  downloadIssueAttachment,
  type CustomFieldDefinition,
  type Issue,
  type Project,
} from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import { useIssueDetailWorkspace, useIssueMutations } from '@/lib/query/issues';
import { queryKeys } from '@/lib/query/keys';
import { issueDetailPath, teamActivePath } from '@/lib/routes';

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
  labelIds: number[];
  customFields: Record<string, unknown>;
}

export default function IssueDetailPage({ issueId }: IssueDetailPageProps) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { pushToast } = useToast();
  const { currentOrganizationSlug, currentTeamId, currentTeamKey } = useCurrentWorkspace();
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
    labelsQuery,
  } = useIssueDetailWorkspace(issueId, organizationId);
  const {
    updateIssueMutation,
    updateIssueStateMutation,
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
  const labels = labelsQuery.data ?? [];
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
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!issue) return;
    setDraftIssue(createDraft(issue));
    setBodyMode('read');
    setActiveProperty(null);
  }, [issue]);

  useEffect(() => {
    if (typeof window === 'undefined' || !issue) return;
    const key = `issue-favorites:${user?.id ?? 'anonymous'}`;
    const saved = window.localStorage.getItem(key);
    const favorites = saved ? JSON.parse(saved) as number[] : [];
    setIsFavorite(favorites.includes(issue.id));
  }, [issue, user?.id]);

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
          labelIds: draftIssue.labelIds,
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
  const [isSubscribed, setIsSubscribed] = useState(true);

  const actorNameMap = useMemo(() => {
    const map = new Map(memberMap);
    if (user?.id) {
      map.set(user.id, user.username || user.email || `User ${user.id}`);
    }
    if (issue?.reporterId && !map.has(issue.reporterId)) {
      map.set(issue.reporterId, `User ${issue.reporterId}`);
    }
    return map;
  }, [issue?.reporterId, memberMap, user?.email, user?.id, user?.username]);

  const feedItems = useMemo(() => {
    const activityItems = activity.map((event) => ({
      id: `activity-${event.id}`,
      kind: 'activity' as const,
      createdAt: event.createdAt,
      authorId: event.actorId,
      summary: event.summary,
      body: null as string | null,
    }));
    const commentItems = comments.map((comment) => ({
      id: `comment-${comment.id}`,
      kind: 'comment' as const,
      createdAt: comment.createdAt,
      authorId: comment.authorId,
      summary: '',
      body: comment.body,
    }));
    return [...activityItems, ...commentItems].sort(
      (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
    );
  }, [activity, comments]);

  const visibleCustomFields = useMemo(
    () =>
      customFieldDefinitions
        .filter((field) => field.showOnDetail && field.isVisible && field.isActive)
        .sort((left, right) => left.sortOrder - right.sortOrder),
    [customFieldDefinitions]
  );

  const showActionToast = (title: string, description: string) => {
    pushToast({
      type: 'success',
      title,
      description,
      dismissLabel: t('issueCreatedToast.dismiss'),
      durationMs: 3200,
    });
  };

  const copyText = async (value: string, description: string) => {
    if (!navigator.clipboard?.writeText) return;
    try {
      await navigator.clipboard.writeText(value);
      showActionToast(t('issues.more.actions.copied'), description);
    } catch {
      // no-op
    }
  };

  const setDueDate = async (value: string | null) => {
    if (!issue) return;
    await updateIssueMutation.mutateAsync({
      id: issue.id,
      data: {
        plannedEndDate: value,
      },
    });
  };

  const addLinkAttachment = async () => {
    if (!issue) return;
    const url = window.prompt(t('issues.more.prompts.link'));
    if (!url?.trim()) return;
    await createIssueLinkAttachments(issue.id, [{ url: url.trim(), uploadedBy: user?.id ?? undefined }]);
    await queryClient.invalidateQueries({ queryKey: queryKeys.attachments(issue.id) });
    showActionToast(t('issues.more.actions.linkAdded'), url.trim());
  };

  const copyIssuePrompt = async () => {
    if (!issue) return;
    const labelMap = new Map(labels.map((label) => [label.id, label.name]));
    issue.labels.forEach((label) => {
      if (!labelMap.has(label.id)) {
        labelMap.set(label.id, label.name);
      }
    });
    const currentIssue = draftIssue
      ? {
          ...issue,
          state: draftIssue.state,
          priority: draftIssue.priority,
          assigneeId: draftIssue.assigneeId,
          projectId: draftIssue.projectId,
        }
      : issue;
    const prompt = buildIssuePrompt({
      issue: currentIssue,
      projectName: projectMap.get(currentIssue.projectId ?? -1) ?? null,
      assigneeName: memberMap.get(currentIssue.assigneeId ?? -1) ?? null,
      stateLabel: translateIssueValue(t, `common.status.${currentIssue.state}`, currentIssue.state),
      priorityLabel: translateIssueValue(t, `common.priority.${currentIssue.priority}`, currentIssue.priority),
      labelNames: draftIssue?.labelIds.map((labelId) => labelMap.get(labelId)).filter(Boolean) as string[] | undefined,
    });
    await copyText(prompt, issue.identifier);
  };

  const showCodingToolsHint = () => {
    showActionToast(
      'Configure coding tools',
      locale.startsWith('zh') ? '该入口暂时为占位交互。' : 'This entry is currently a placeholder.'
    );
  };

  const quickCreateDoc = async () => {
    if (!issue) return;
    const title = window.prompt(t('issues.more.prompts.document'));
    if (!title?.trim()) return;
    await createDocMutation.mutateAsync({
      organizationId: issue.organizationId,
      teamId: issue.teamId,
      projectId: issue.projectId,
      issueId: issue.id,
      authorId: user?.id ?? 1,
      title: title.trim(),
      slug: title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      content: '',
    });
    showActionToast(t('issues.more.actions.documentAdded'), title.trim());
  };

  const convertToTemplate = async () => {
    if (!issue) return;
    await createIssueTemplate({
      organizationId: issue.organizationId,
      teamId: issue.teamId,
      projectId: issue.projectId,
      name: `${issue.identifier} template`,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      state: issue.state,
      priority: issue.priority,
      assigneeId: issue.assigneeId,
      plannedStartDate: issue.plannedStartDate,
      plannedEndDate: issue.plannedEndDate,
      customFields: issue.customFields,
    });
    showActionToast(t('issues.more.actions.templateCreated'), issue.identifier);
  };

  const convertToRecurring = async () => {
    if (!issue) return;
    const fallbackProjectId = issue.projectId ?? projects[0]?.id ?? null;
    if (fallbackProjectId == null) {
      showActionToast(t('issues.more.actions.projectRequired'), t('issues.more.descriptions.projectRequired'));
      return;
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    await createRecurringIssue({
      organizationId: issue.organizationId,
      teamId: issue.teamId,
      projectId: fallbackProjectId,
      name: issue.title,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      state: issue.state,
      priority: issue.priority,
      assigneeId: issue.assigneeId,
      nextRunAt: tomorrow.toISOString().slice(0, 19),
      customFields: issue.customFields,
    });
    showActionToast(t('issues.more.actions.recurringCreated'), issue.identifier);
  };

  const duplicateIssue = async () => {
    if (!issue) return;
    const duplicated = await createIssue({
      organizationId: issue.organizationId,
      type: issue.type,
      title: `${issue.title} (${t('issues.more.copySuffix')})`,
      description: issue.description ?? '',
      state: 'TODO',
      priority: issue.priority,
      projectId: issue.projectId,
      teamId: issue.teamId,
      assigneeId: issue.assigneeId,
      plannedStartDate: issue.plannedStartDate,
      plannedEndDate: issue.plannedEndDate,
      customFields: issue.customFields,
    });
    await queryClient.invalidateQueries({ queryKey: ['issues'] });
    if (currentOrganizationSlug) {
      router.push(issueDetailPath(currentOrganizationSlug, duplicated));
    }
  };

  const markIssueState = async (state: Issue['state']) => {
    if (!issue) return;
    await updateIssueStateMutation.mutateAsync({
      id: issue.id,
      state,
      resolution: state === 'DONE' ? 'COMPLETED' : state === 'CANCELED' ? 'CANCELED' : null,
    });
  };

  const createRelatedIssue = async (relation: 'subIssue' | 'related') => {
    if (!issue) return;
    const title = window.prompt(
      relation === 'subIssue' ? t('issues.more.prompts.subIssue') : t('issues.more.prompts.relatedIssue')
    );
    if (!title?.trim()) return;
    const created = await createIssueMutation.mutateAsync({
      organizationId: issue.organizationId,
      type: 'TASK',
      title: title.trim(),
      description: '',
      projectId: issue.projectId,
      teamId: issue.teamId,
      parentIssueId: relation === 'subIssue' ? issue.id : null,
      reporterId: user?.id ?? 1,
      state: 'TODO',
      priority: 'MEDIUM',
    });
    if (relation === 'related') {
      await createRelationMutation.mutateAsync({ issueId: issue.id, toIssueId: created.id, relationType: 'RELATES_TO' });
    }
    if (currentOrganizationSlug) {
      router.push(issueDetailPath(currentOrganizationSlug, created));
    }
  };

  const toggleFavorite = () => {
    if (!issue || typeof window === 'undefined') return;
    const key = `issue-favorites:${user?.id ?? 'anonymous'}`;
    const saved = window.localStorage.getItem(key);
    const favorites = new Set(saved ? (JSON.parse(saved) as number[]) : []);
    if (favorites.has(issue.id)) {
      favorites.delete(issue.id);
      setIsFavorite(false);
    } else {
      favorites.add(issue.id);
      setIsFavorite(true);
    }
    window.localStorage.setItem(key, JSON.stringify([...favorites]));
  };

  const setReminder = (label: string, hoursFromNow: number) => {
    if (!issue || typeof window === 'undefined') return;
    const key = `issue-reminders:${user?.id ?? 'anonymous'}`;
    const saved = window.localStorage.getItem(key);
    const reminders = saved ? (JSON.parse(saved) as Array<Record<string, unknown>>) : [];
    reminders.push({
      issueId: issue.id,
      remindAt: new Date(Date.now() + hoursFromNow * 60 * 60 * 1000).toISOString(),
      label,
    });
    window.localStorage.setItem(key, JSON.stringify(reminders));
    showActionToast(t('issues.more.actions.reminderSaved'), label);
  };

  const showVersionHistory = () => {
    window.location.hash = 'activity';
  };

  const deleteCurrentIssue = async () => {
    if (!issue) return;
    if (!window.confirm(t('issues.more.prompts.delete'))) return;
    await deleteIssue(issue.id);
    await queryClient.invalidateQueries({ queryKey: ['issues'] });
    if (currentOrganizationSlug && currentTeamKey) {
      router.push(teamActivePath(currentOrganizationSlug, currentTeamKey));
    }
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
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0 space-y-4">
                <div className="flex items-center gap-2 text-sm text-ink-500">
                  <Link
                    href={currentOrganizationSlug && currentTeamKey ? teamActivePath(currentOrganizationSlug, currentTeamKey) : '#'}
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
              <IssueDetailActionBar
                issue={issue}
                onCopyLink={() => copyText(`${window.location.origin}${currentOrganizationSlug ? issueDetailPath(currentOrganizationSlug, issue) : ''}`, issue.identifier)}
                onCopyIdentifier={() => copyText(issue.identifier, issue.identifier)}
                onCopyTitle={() => copyText(issue.title, issue.title)}
                onCreateRelated={createRelatedIssue}
                onAddLink={addLinkAttachment}
                onCopyPrompt={copyIssuePrompt}
                onConfigureCodingTools={showCodingToolsHint}
                moreMenu={
                  <IssueMoreMenu
                    issue={issue}
                    projects={projects}
                    isFavorite={isFavorite}
                    t={t}
                    onSetDueDate={setDueDate}
                    onAddLink={addLinkAttachment}
                    onAddDocument={quickCreateDoc}
                    onAssignProject={(projectId) =>
                      updateIssueMutation.mutateAsync({
                        id: issue.id,
                        data: {
                          projectId,
                        },
                      })
                    }
                    onConvertTemplate={convertToTemplate}
                    onConvertRecurring={convertToRecurring}
                    onMakeCopy={duplicateIssue}
                    onMarkState={markIssueState}
                    onCreateRelated={createRelatedIssue}
                    onToggleFavorite={toggleFavorite}
                    onCopyLink={() => copyText(`${window.location.origin}${currentOrganizationSlug ? issueDetailPath(currentOrganizationSlug, issue) : ''}`, issue.identifier)}
                    onCopyIdentifier={() => copyText(issue.identifier, issue.identifier)}
                    onCopyTitle={() => copyText(issue.title, issue.title)}
                      onRemindLater={() => setReminder(t('issues.more.reminders.laterToday'), 4)}
                      onRemindTomorrow={() => setReminder(t('issues.more.reminders.tomorrowMorning'), 18)}
                      onShowVersionHistory={showVersionHistory}
                      onDelete={deleteCurrentIssue}
                      contentOnly
                    />
                  }
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

              <section className="space-y-4 pt-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(event) => uploadAttachment(event.target.files?.[0] ?? null)}
                />
                <div className="flex items-center gap-2.5 text-ink-400">
                  <button
                    type="button"
                    onClick={() =>
                      showActionToast('Reactions', locale.startsWith('zh') ? '表情反馈即将支持。' : 'Reactions are coming soon.')
                    }
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-transparent transition hover:border-slate-200 hover:bg-white hover:text-ink-900"
                    aria-label="Add reaction"
                  >
                    <SmilePlus className="h-4 w-4 stroke-[1.8]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-transparent transition hover:border-slate-200 hover:bg-white hover:text-ink-900"
                    aria-label={t('issues.detailPage.uploadAttachment')}
                  >
                    <Paperclip className="h-4 w-4 stroke-[1.8]" />
                  </button>
                </div>
                <div className="space-y-2.5">
                  <Link
                    href={
                      currentOrganizationSlug && currentTeamKey
                        ? `${teamActivePath(currentOrganizationSlug, currentTeamKey)}?create=true&parentIssueId=${issue.id}${issue.projectId != null ? `&projectId=${issue.projectId}` : ''}&teamId=${issue.teamId ?? ''}&title=`
                        : '#'
                    }
                      className="inline-flex items-center gap-2 text-[20px] leading-none text-ink-700 transition hover:text-ink-900"
                    >
                      <Plus className="h-3.5 w-3.5 stroke-[2.2]" />
                      <span className="text-[15px]">{t('issues.detailPage.newSubIssue')}</span>
                    </Link>
                  {childIssues.length ? (
                    <div className="space-y-1 pl-6">
                      {childIssues.map((child) => (
                        <Link
                          key={child.id}
                          href={currentOrganizationSlug ? issueDetailPath(currentOrganizationSlug, child) : '#'}
                          className="flex items-center justify-between gap-4 rounded-xl px-3 py-2 transition hover:bg-slate-50"
                        >
                          <div className="min-w-0">
                            <div className="truncate text-sm text-ink-900">{child.title}</div>
                            <div className="mt-1 text-xs text-ink-400">{child.identifier}</div>
                          </div>
                          <IssueStateBadge state={child.state} t={t} />
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              </section>
              <section id="activity" className="space-y-6 border-t border-border-soft/80 pt-7">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-[18px] font-semibold tracking-tight text-ink-900">{t('issues.tabs.activity')}</h2>
                  <div className="flex items-center gap-3 text-sm text-ink-400">
                    <button
                      type="button"
                      onClick={() => setIsSubscribed((current) => !current)}
                      className="transition hover:text-ink-700"
                    >
                      {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
                    </button>
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ff8a80] text-[9px] font-semibold uppercase text-white">
                        {initialsForName(valueFromMap(actorNameMap, user?.id ?? issue.reporterId ?? null, issue.identifier))}
                      </div>
                    </div>
                  </div>

                <div className="space-y-0.5">
                  {feedItems.length ? (
                    feedItems.map((item, index) => {
                      const actorName = valueFromMap(
                        actorNameMap,
                        item.authorId ?? null,
                        item.kind === 'comment' ? `User ${item.authorId ?? ''}`.trim() : 'System'
                      );
                      return (
                        <div key={item.id} className="grid grid-cols-[28px_minmax(0,1fr)] gap-3">
                          <div className="relative flex justify-center">
                            {index < feedItems.length - 1 ? (
                              <span className="absolute top-7 h-[calc(100%-1rem)] w-px bg-border-soft" />
                            ) : null}
                            {item.kind === 'comment' ? (
                              <div className="mt-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#ff8a80] text-[8px] font-semibold uppercase text-white">
                                {initialsForName(actorName)}
                              </div>
                            ) : (
                              <div className="mt-1 h-4.5 w-4.5 rounded-full border border-slate-300 bg-white" />
                            )}
                          </div>
                          <div className="min-w-0 pb-3">
                            {item.kind === 'comment' ? (
                              <div className="space-y-1.5">
                                <div className="text-[14px] leading-6 text-ink-700">
                                  <span className="font-medium text-ink-900">{actorName}</span>
                                  <span className="ml-2 text-[13px] text-ink-400">{formatRelativeTime(item.createdAt, locale)}</span>
                                </div>
                                <div className="whitespace-pre-wrap text-[14px] leading-6 text-ink-900">{item.body}</div>
                              </div>
                            ) : (
                              <div className="text-[14px] leading-6 text-ink-700">
                                <span className="font-medium text-ink-900">{item.summary}</span>
                                <span className="ml-2 text-[13px] text-ink-400">{formatRelativeTime(item.createdAt, locale)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <EmptyState label={t('issues.emptyStates.activity')} />
                  )}
                </div>

                {attachments.length ? (
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="inline-flex items-center gap-2 rounded-full border border-border-soft bg-white px-3 py-1.5 text-sm text-ink-700"
                      >
                        <Paperclip className="h-3.5 w-3.5 text-ink-400" />
                        <button
                          type="button"
                          onClick={() => downloadIssueAttachment(issue.id, attachment.id, attachment.filename)}
                          className="max-w-[220px] truncate transition hover:text-ink-900"
                        >
                          {attachment.filename}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteAttachmentMutation.mutate({ issueId: issue.id, attachmentId: attachment.id })}
                          className="text-ink-300 transition hover:text-rose-500"
                          aria-label={`Delete ${attachment.filename}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="rounded-[18px] border border-border-soft bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                  <Textarea
                    value={commentBody}
                    onChange={(event) => setCommentBody(event.target.value)}
                    placeholder={t('issues.detail.commentPlaceholder')}
                    className="min-h-[104px] resize-none border-0 px-0 py-0 text-[15px] leading-7 text-ink-900 placeholder:text-ink-300 focus-visible:ring-0"
                  />
                  <div className="mt-3 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-transparent text-ink-400 transition hover:border-slate-200 hover:bg-slate-50 hover:text-ink-700"
                      aria-label={t('issues.detailPage.uploadAttachment')}
                    >
                      <Paperclip className="h-4 w-4 stroke-[1.8]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void addComment()}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-ink-500 transition hover:bg-slate-50 hover:text-ink-900"
                      aria-label={t('issues.detail.addComment')}
                    >
                      <ArrowUp className="h-3.5 w-3.5 stroke-[2.2]" />
                    </button>
                  </div>
                </div>
              </section>
            </main>

            <IssueDetailSidebar
              draftIssue={draftIssue}
              issue={issue}
              members={members}
              projects={projects}
              labels={labels}
              visibleCustomFields={visibleCustomFields}
              activeProperty={activeProperty}
              locale={locale}
              t={t}
              onSetDraftIssue={(updater) =>
                setDraftIssue((current) => (current ? ({ ...current, ...updater(current) } as DraftIssue) : current))
              }
              onSetActiveProperty={setActiveProperty}
              renderCustomFieldInput={(field, value, onChange, onDone) => (
                <CustomFieldInput field={field} value={value} onChange={onChange} onDone={onDone} />
              )}
              formatCustomFieldValue={formatCustomFieldValue}
            />

            <aside className="hidden">
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
                      label={locale.startsWith('zh') ? '鍏抽棴鍘熷洜' : 'Resolution'}
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

function IssueMoreMenu({
  issue,
  projects,
  isFavorite,
  t,
  onSetDueDate,
  onAddLink,
  onAddDocument,
  onAssignProject,
  onConvertTemplate,
  onConvertRecurring,
  onMakeCopy,
  onMarkState,
  onCreateRelated,
  onToggleFavorite,
  onCopyLink,
  onCopyIdentifier,
  onCopyTitle,
  onRemindLater,
  onRemindTomorrow,
  onShowVersionHistory,
  onDelete,
  trigger,
  contentOnly = false,
}: {
  issue: Issue;
  projects: Project[];
  isFavorite: boolean;
  t: (key: string, vars?: Record<string, string | number>) => string;
  onSetDueDate: (value: string | null) => Promise<void>;
  onAddLink: () => Promise<void>;
  onAddDocument: () => Promise<void>;
  onAssignProject: (projectId: number | null) => Promise<unknown>;
  onConvertTemplate: () => Promise<void>;
  onConvertRecurring: () => Promise<void>;
  onMakeCopy: () => Promise<void>;
  onMarkState: (state: Issue['state']) => Promise<void>;
  onCreateRelated: (relation: 'subIssue' | 'related') => Promise<void>;
  onToggleFavorite: () => void;
  onCopyLink: () => Promise<void>;
  onCopyIdentifier: () => Promise<void>;
  onCopyTitle: () => Promise<void>;
  onRemindLater: () => void;
  onRemindTomorrow: () => void;
  onShowVersionHistory: () => void;
  onDelete: () => Promise<void>;
  trigger?: ReactNode;
  contentOnly?: boolean;
}) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowValue = tomorrow.toISOString().slice(0, 10);
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekValue = nextWeek.toISOString().slice(0, 10);

  const content = (
    <>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-3 rounded-2xl px-4 py-3 text-[15px]">
            <CalendarPlus className="h-4.5 w-4.5 text-ink-500" />
            <span>{t('issues.more.setDueDate')}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="min-w-[220px] rounded-[20px] p-2">
              <DropdownMenuItem onSelect={() => void onSetDueDate(new Date().toISOString().slice(0, 10))} className="rounded-2xl px-4 py-3 text-[15px]">
                {t('issues.more.dueDates.today')}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => void onSetDueDate(tomorrowValue)} className="rounded-2xl px-4 py-3 text-[15px]">
                {t('issues.more.dueDates.tomorrow')}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => void onSetDueDate(nextWeekValue)} className="rounded-2xl px-4 py-3 text-[15px]">
                {t('issues.more.dueDates.nextWeek')}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => void onSetDueDate(null)} className="rounded-2xl px-4 py-3 text-[15px]">
                {t('issues.more.dueDates.clear')}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuItem onSelect={() => void onAddLink()} className="gap-3 rounded-2xl px-4 py-3 text-[15px]">
          <Link2 className="h-4.5 w-4.5 text-ink-500" />
          <span>{t('issues.more.addLink')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void onAddDocument()} className="gap-3 rounded-2xl px-4 py-3 text-[15px]">
          <FileText className="h-4.5 w-4.5 text-ink-500" />
          <span>{t('issues.more.addDocument')}</span>
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-3 rounded-2xl px-4 py-3 text-[15px]">
            <FolderKanban className="h-4.5 w-4.5 text-ink-500" />
            <span>{t('issues.more.convertInto')}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="min-w-[240px] rounded-[20px] p-2">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-3 rounded-2xl px-4 py-3 text-[15px]">
                  <FolderKanban className="h-4.5 w-4.5 text-ink-500" />
                  <span>{t('issues.more.project')}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="min-w-[220px] rounded-[20px] p-2">
                    <DropdownMenuItem onSelect={() => void onAssignProject(null)} className="rounded-2xl px-4 py-3 text-[15px]">
                      {t('common.notSet')}
                    </DropdownMenuItem>
                    {projects.map((project) => (
                      <DropdownMenuItem key={project.id} onSelect={() => void onAssignProject(project.id)} className="rounded-2xl px-4 py-3 text-[15px]">
                        {project.name}{project.id === issue.projectId ? ` 路 ${t('issues.more.current')}` : ''}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuItem onSelect={() => void onConvertTemplate()} className="rounded-2xl px-4 py-3 text-[15px]">
                {t('issues.more.template')}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => void onConvertRecurring()} className="rounded-2xl px-4 py-3 text-[15px]">
                {t('issues.more.recurringIssue')}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuItem onSelect={() => void onMakeCopy()} className="gap-3 rounded-2xl px-4 py-3 text-[15px]">
          <CopyPlus className="h-4.5 w-4.5 text-ink-500" />
          <span>{t('issues.more.makeCopy')}</span>
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-3 rounded-2xl px-4 py-3 text-[15px]">
            <Flag className="h-4.5 w-4.5 text-ink-500" />
            <span>{t('issues.more.markAs')}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="min-w-[220px] rounded-[20px] p-2">
              {ISSUE_STATES.map((state) => (
                <DropdownMenuItem key={state} onSelect={() => void onMarkState(state)} className="rounded-2xl px-4 py-3 text-[15px]">
                  {t(`common.status.${state}`)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-3 rounded-2xl px-4 py-3 text-[15px]">
            <Plus className="h-4.5 w-4.5 text-ink-500" />
            <span>{t('issues.more.createRelated')}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="min-w-[220px] rounded-[20px] p-2">
              <DropdownMenuItem onSelect={() => void onCreateRelated('subIssue')} className="rounded-2xl px-4 py-3 text-[15px]">
                {t('issues.more.subIssue')}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => void onCreateRelated('related')} className="rounded-2xl px-4 py-3 text-[15px]">
                {t('issues.more.relatedIssue')}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onToggleFavorite} className="gap-3 rounded-2xl px-4 py-3 text-[15px]">
          <Star className={isFavorite ? 'h-4.5 w-4.5 fill-amber-400 text-amber-400' : 'h-4.5 w-4.5 text-ink-500'} />
          <span>{isFavorite ? t('issues.more.unfavorite') : t('issues.more.favorite')}</span>
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-3 rounded-2xl px-4 py-3 text-[15px]">
            <Copy className="h-4.5 w-4.5 text-ink-500" />
            <span>{t('issues.more.copy')}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="min-w-[220px] rounded-[20px] p-2">
              <DropdownMenuItem onSelect={() => void onCopyLink()} className="rounded-2xl px-4 py-3 text-[15px]">
                {t('issues.more.copyLink')}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => void onCopyIdentifier()} className="rounded-2xl px-4 py-3 text-[15px]">
                {t('issues.more.copyIdentifier')}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => void onCopyTitle()} className="rounded-2xl px-4 py-3 text-[15px]">
                {t('issues.more.copyTitle')}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-3 rounded-2xl px-4 py-3 text-[15px]">
            <Clock3 className="h-4.5 w-4.5 text-ink-500" />
            <span>{t('issues.more.remindMe')}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="min-w-[220px] rounded-[20px] p-2">
              <DropdownMenuItem onSelect={onRemindLater} className="rounded-2xl px-4 py-3 text-[15px]">
                {t('issues.more.reminders.laterToday')}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onRemindTomorrow} className="rounded-2xl px-4 py-3 text-[15px]">
                {t('issues.more.reminders.tomorrowMorning')}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onShowVersionHistory} className="gap-3 rounded-2xl px-4 py-3 text-[15px]">
          <MessageSquare className="h-4.5 w-4.5 text-ink-500" />
          <span>{t('issues.more.showVersionHistory')}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void onDelete()} className="gap-3 rounded-2xl px-4 py-3 text-[15px] text-rose-600 focus:text-rose-700">
          <Trash2 className="h-4.5 w-4.5" />
          <span>{t('issues.more.delete')}</span>
        </DropdownMenuItem>
    </>
  );

  if (contentOnly) {
    return content;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger ?? (
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-soft bg-white text-ink-500 transition hover:bg-slate-50 hover:text-ink-900"
            aria-label={t('issues.more.menu')}
          >
            <MoreHorizontal className="h-4.5 w-4.5" />
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px] rounded-[22px] p-2">
        {content}
      </DropdownMenuContent>
    </DropdownMenu>
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
    return <Badge variant="success">{resolution && resolution !== 'COMPLETED' ? `${t(`common.status.${state}`)} 路 ${t(`common.resolution.${resolution}`)}` : t(`common.status.${state}`)}</Badge>;
  }
  if (state === 'IN_PROGRESS' || state === 'IN_REVIEW') return <Badge variant="brand">{t(`common.status.${state}`)}</Badge>;
  if (state === 'CANCELED') {
    return <Badge variant="danger">{resolution && resolution !== 'CANCELED' ? `${t(`common.status.${state}`)} 路 ${t(`common.resolution.${resolution}`)}` : t(`common.status.${state}`)}</Badge>;
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
    labelIds: issue.labels.map((label) => label.id),
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

function buildIssuePrompt({
  issue,
  projectName,
  assigneeName,
  stateLabel,
  priorityLabel,
  labelNames,
}: {
  issue: Issue;
  projectName: string | null;
  assigneeName: string | null;
  stateLabel: string;
  priorityLabel: string;
  labelNames?: string[];
}) {
  const lines = [
    `Issue: ${issue.identifier} ${issue.title}`,
    `State: ${stateLabel}`,
    `Priority: ${priorityLabel}`,
    `Assignee: ${assigneeName ?? 'Not set'}`,
    `Project: ${projectName ?? 'Not set'}`,
    `Labels: ${labelNames?.length ? labelNames.join(', ') : 'None'}`,
  ];

  if (issue.description?.trim()) {
    lines.push('', 'Description:', issue.description.trim());
  }

  lines.push('', 'Please help me work on this issue with the context above.');
  return lines.join('\n');
}

function translateIssueValue(t: (key: string) => string, key: string, fallback: string) {
  const value = t(key);
  return value === key ? fallback : value;
}

function valueFromMap(map: Map<number, string>, key: number | null, fallback: string) {
  return key == null ? fallback : map.get(key) ?? fallback;
}

function initialsForName(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'U';
}

function formatRelativeTime(value: string, locale: string) {
  const diffMs = new Date(value).getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60000);
  const formatter = new Intl.RelativeTimeFormat(locale.startsWith('zh') ? 'zh-CN' : 'en', { numeric: 'auto' });

  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, 'minute');
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, 'hour');
  }

  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 7) {
    return formatter.format(diffDays, 'day');
  }

  const diffWeeks = Math.round(diffDays / 7);
  if (Math.abs(diffWeeks) < 5) {
    return formatter.format(diffWeeks, 'week');
  }

  return formatDate(value, locale);
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


