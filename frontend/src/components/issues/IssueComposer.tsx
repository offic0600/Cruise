'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, CalendarPlus, CheckCircle2, ChevronDown, ChevronRight, Circle, CircleDashed, CircleEllipsis, Equal, Expand, Flame, Link2, ListPlus, LoaderCircle, Minus, MoreHorizontal, Paperclip, Repeat, Save, Tag, X, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { localizePath, type Locale } from '@/i18n/config';
import { useI18n } from '@/i18n/useI18n';
import {
  createLabel,
  createRecurringIssue,
  createIssue,
  createIssueDraft,
  createIssueLinkAttachments,
  createIssueTemplate,
  deleteIssueDraft,
  getIssueDraft,
  getLabels,
  getIssueTemplates,
  getProjects,
  getTeamMembers,
  getTeams,
  type CustomFieldDefinition,
  type Issue,
  type Label,
  type IssueTemplate,
  updateIssueDraft,
  uploadIssueAttachment,
} from '@/lib/api';
import { getCustomFieldDefinitions } from '@/lib/api/custom-fields';
import { getStoredUser } from '@/lib/auth';
import {
  applySavedDraftToComposer,
  applyTemplateToDraft,
  buildIssueCustomFields,
  buildPersistedCustomFields,
  ISSUE_PRIORITIES,
  ISSUE_STATES,
  ISSUE_TYPES,
  type IssueComposerDraft,
  localDraftStorageKey,
  parseIssueCreateParams,
  serializeDraftToQuery,
} from '@/lib/issues/composer';
import { queryKeys } from '@/lib/query/keys';
import { cn } from '@/lib/utils';

type TeamMember = {
  id: number;
  name: string;
};

type SingleValueOptionDef = {
  value: string;
  label: string;
  icon?: React.ReactNode;
  iconClassName?: string;
  avatarText?: string;
  avatarClassName?: string;
};

type ComposerMode = 'modal' | 'page';

export default function IssueComposer({
  mode,
  open = true,
  onClose,
  initialParams,
  initialDraftId,
  localeScope = 'issues-new',
  onCreated,
}: {
  mode: ComposerMode;
  open?: boolean;
  onClose?: () => void;
  initialParams?: URLSearchParams;
  initialDraftId?: number | null;
  localeScope?: string;
  onCreated?: (issue: Issue) => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { locale, t } = useI18n();
  const isZh = locale.startsWith('zh');
  const storedUser = getStoredUser();
  const organizationId = storedUser?.organizationId ?? 1;
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const composerEnabled = mode === 'page' ? true : open;

  const [draft, setDraft] = useState<IssueComposerDraft | null>(null);
  const [initialSnapshot, setInitialSnapshot] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [createMore, setCreateMore] = useState(false);
  const [recurringEnabled, setRecurringEnabled] = useState(false);
  const [recurringInterval, setRecurringInterval] = useState('1');
  const [recurringUnit, setRecurringUnit] = useState<'day' | 'week' | 'month'>('week');

  const projectsQuery = useQuery({
    queryKey: queryKeys.projects,
    queryFn: () => getProjects({ organizationId }),
    select: (response) => response.items,
    enabled: composerEnabled,
  });
  const teamsQuery = useQuery({
    queryKey: queryKeys.teams,
    queryFn: () => getTeams({ organizationId }),
    enabled: composerEnabled,
  });
  const membersQuery = useQuery({
    queryKey: queryKeys.teamMembers,
    queryFn: () => getTeamMembers(),
    enabled: composerEnabled,
  });
  const templatesQuery = useQuery({
    queryKey: queryKeys.issueTemplates({ organizationId }),
    queryFn: () => getIssueTemplates({ organizationId }),
    enabled: composerEnabled,
  });
  const customFieldsQuery = useQuery({
    queryKey: queryKeys.customFields({ organizationId, entityType: 'ISSUE' }),
    queryFn: () => getCustomFieldDefinitions({ organizationId, entityType: 'ISSUE' }),
    enabled: composerEnabled && mode === 'page',
  });
  const savedDraftQuery = useQuery({
    queryKey: ['issue-draft', initialDraftId ?? 'new'],
    queryFn: () => getIssueDraft(initialDraftId!),
    enabled: composerEnabled && initialDraftId != null,
  });
  const labelsQuery = useQuery({
    queryKey: ['labels', organizationId, draft?.teamId ?? 'none'],
    queryFn: () => getLabels({ organizationId, teamId: draft?.teamId ? Number(draft.teamId) : undefined }),
    enabled: composerEnabled && !!draft,
  });

  const projects = projectsQuery.data ?? [];
  const teams = teamsQuery.data ?? [];
  const members = (membersQuery.data ?? []) as TeamMember[];
  const templates = templatesQuery.data ?? [];
  const customFields = ((customFieldsQuery.data ?? []) as CustomFieldDefinition[]).filter((field) => field.showOnCreate);
  const labelCatalog = labelsQuery.data;
  const labels = useMemo(() => [...(labelCatalog?.teamLabels ?? []), ...(labelCatalog?.workspaceLabels ?? [])], [labelCatalog]);

  useEffect(() => {
    if (!projects.length || draft) return;

    const params = initialParams ?? new URLSearchParams();
    let nextDraft = parseIssueCreateParams(params, projects, templates);
    const localDraftRaw =
      typeof window !== 'undefined' ? localStorage.getItem(localDraftStorageKey(storedUser?.id, localeScope)) : null;

    if (localDraftRaw && !params.toString() && initialDraftId == null) {
      nextDraft = { ...nextDraft, ...((JSON.parse(localDraftRaw) as IssueComposerDraft) ?? {}) };
    }

    if (!nextDraft.assigneeId && storedUser?.id) {
      nextDraft = { ...nextDraft, assigneeId: String(storedUser.id) };
    }

    setDraft(nextDraft);
    setInitialSnapshot(JSON.stringify(nextDraft));
  }, [draft, initialDraftId, initialParams, localeScope, projects, storedUser?.id, templates]);

  useEffect(() => {
    if (!draft || !savedDraftQuery.data) return;
    const nextDraft = applySavedDraftToComposer(draft, savedDraftQuery.data);
    setDraft(nextDraft);
    setInitialSnapshot(JSON.stringify(nextDraft));
  }, [draft, savedDraftQuery.data]);

  useEffect(() => {
    if (!draft || !recurringEnabled || draft.plannedEndDate) return;
    setDraft((current) => (current ? { ...current, plannedEndDate: toDateInputValue(addDays(new Date(), 7)) } : current));
  }, [draft, recurringEnabled]);

  const createIssueMutation = useMutation({ mutationFn: createIssue });
  const uploadAttachmentMutation = useMutation({
    mutationFn: ({ issueId, file }: { issueId: number; file: File }) =>
      uploadIssueAttachment(issueId, { file, uploadedBy: storedUser?.id ?? undefined }),
  });
  const createLinksMutation = useMutation({
    mutationFn: ({ issueId, links }: { issueId: number; links: string[] }) =>
      createIssueLinkAttachments(issueId, links.map((url) => ({ url, uploadedBy: storedUser?.id ?? undefined }))),
  });
  const saveDraftMutation = useMutation({
    mutationFn: (payload: { id?: number; data: Parameters<typeof createIssueDraft>[0] }) =>
      payload.id ? updateIssueDraft(payload.id, payload.data) : createIssueDraft(payload.data),
  });
  const saveTemplateMutation = useMutation({
    mutationFn: createIssueTemplate,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.issueTemplates({ organizationId }) });
    },
  });
  const createRecurringMutation = useMutation({ mutationFn: createRecurringIssue });
  const createLabelMutation = useMutation({
    mutationFn: createLabel,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['labels', organizationId, draft?.teamId ?? 'none'] });
    },
  });

  const dirty = useMemo(() => {
    if (!draft) return false;
    return JSON.stringify(draft) !== initialSnapshot || pendingFiles.length > 0;
  }, [draft, initialSnapshot, pendingFiles.length]);

  if (!open || !draft) return null;

  const pageHref = `${localizePath(locale, '/issues/new')}?${serializeDraftToQuery(draft)}`;
  const projectName = projects.find((project) => String(project.id) === draft.projectId)?.name ?? t('settings.composer.noProject');
  const selectedLabelIds = draft.labelIds;

  const resetComposer = () => {
    const nextDraft = parseIssueCreateParams(initialParams ?? new URLSearchParams(), projects, templates);
    const nextDraftWithAssignee = !nextDraft.assigneeId && storedUser?.id ? { ...nextDraft, assigneeId: String(storedUser.id) } : nextDraft;
    setDraft(nextDraftWithAssignee);
    setInitialSnapshot(JSON.stringify(nextDraftWithAssignee));
    setPendingFiles([]);
    setSavingTemplate(false);
    setTemplateName('');
    setRecurringEnabled(false);
    setRecurringInterval('1');
    setRecurringUnit('week');
  };

  const handleClose = () => {
    if (dirty && !window.confirm(t('settings.composer.discardConfirm'))) return;
    onClose?.();
  };

  const handleCreate = async () => {
    if (recurringEnabled) {
      await createRecurringMutation.mutateAsync({
        organizationId,
        teamId: draft.teamId ? Number(draft.teamId) : null,
        projectId: Number(draft.projectId),
        templateId: draft.templateId ? Number(draft.templateId) : null,
        name: draft.title.trim(),
        title: draft.title.trim() || null,
        description: draft.description.trim() || null,
        type: draft.type,
        state: draft.state,
        priority: draft.priority,
        assigneeId: draft.assigneeId ? Number(draft.assigneeId) : null,
        estimatePoints: draft.estimatePoints ? Number(draft.estimatePoints) : null,
        cadenceType: recurringUnit === 'day' ? 'DAILY' : recurringUnit === 'month' ? 'MONTHLY' : 'WEEKLY',
        cadenceInterval: Number(recurringInterval) || 1,
        weekdays: recurringUnit === 'week' && draft.plannedEndDate ? [weekdayCodeFromDate(draft.plannedEndDate)] : undefined,
        nextRunAt: buildRecurringNextRunAt(draft.plannedEndDate),
        labelIds: draft.labelIds.map(Number),
        customFields: buildPersistedCustomFields(draft),
      });

      if (initialDraftId) {
        await deleteIssueDraft(initialDraftId);
      }
      if (typeof window !== 'undefined') {
        localStorage.removeItem(localDraftStorageKey(storedUser?.id, localeScope));
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.recurringIssues }),
        queryClient.invalidateQueries({ queryKey: ['issues'] }),
      ]);

      if (mode === 'page') {
        router.push(localizePath(locale, '/recurring'));
        return;
      }

      onClose?.();
      return;
    }

    const issue = await createIssueMutation.mutateAsync({
      organizationId,
      type: draft.type,
      title: draft.title.trim(),
      description: draft.description.trim() || undefined,
      state: draft.state,
      priority: draft.priority,
      projectId: Number(draft.projectId),
      teamId: draft.teamId ? Number(draft.teamId) : null,
      assigneeId: draft.assigneeId ? Number(draft.assigneeId) : null,
      parentIssueId: draft.parentIssueId ? Number(draft.parentIssueId) : null,
      estimatePoints: draft.estimatePoints ? Number(draft.estimatePoints) : null,
      plannedStartDate: draft.plannedStartDate || null,
      plannedEndDate: draft.plannedEndDate || null,
      labelIds: draft.labelIds.map(Number),
      customFields: buildIssueCustomFields(draft),
    });

    if (pendingFiles.length) {
      for (const file of pendingFiles) {
        await uploadAttachmentMutation.mutateAsync({ issueId: issue.id, file });
      }
    }

    const links = draft.linksText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (links.length) {
      await createLinksMutation.mutateAsync({ issueId: issue.id, links });
    }

    if (initialDraftId) {
      await deleteIssueDraft(initialDraftId);
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem(localDraftStorageKey(storedUser?.id, localeScope));
    }

    await queryClient.invalidateQueries({ queryKey: ['issues'] });

    if (mode === 'page') {
      onCreated?.(issue);
      router.push(localizePath(locale, `/issues/${issue.id}`));
      return;
    }

    if (createMore) {
      resetComposer();
      return;
    }

    onCreated?.(issue);
    onClose?.();
  };

  const handleSaveServerDraft = async () => {
    await saveDraftMutation.mutateAsync({
      id: initialDraftId ?? undefined,
      data: {
        organizationId,
        teamId: draft.teamId ? Number(draft.teamId) : null,
        projectId: draft.projectId ? Number(draft.projectId) : null,
        templateId: draft.templateId ? Number(draft.templateId) : null,
        title: draft.title,
        description: draft.description,
        type: draft.type,
        state: draft.state,
        priority: draft.priority,
        assigneeId: draft.assigneeId ? Number(draft.assigneeId) : null,
        parentIssueId: draft.parentIssueId ? Number(draft.parentIssueId) : null,
        estimatePoints: draft.estimatePoints ? Number(draft.estimatePoints) : null,
        plannedStartDate: draft.plannedStartDate || null,
        plannedEndDate: draft.plannedEndDate || null,
        labelIds: draft.labelIds.map(Number),
        status: 'SAVED_DRAFT',
        customFields: buildPersistedCustomFields(draft),
        attachmentsPending: pendingFiles.map((file) => ({ name: file.name, size: file.size })),
      },
    });
    setInitialSnapshot(JSON.stringify(draft));
  };

  const handleSaveLocalDraft = () => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(localDraftStorageKey(storedUser?.id, localeScope), JSON.stringify(draft));
    setInitialSnapshot(JSON.stringify(draft));
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) return;
    await saveTemplateMutation.mutateAsync({
      organizationId,
      teamId: draft.teamId ? Number(draft.teamId) : null,
      projectId: draft.projectId ? Number(draft.projectId) : null,
      name: templateName.trim(),
      title: draft.title || null,
      description: draft.description || null,
      type: draft.type,
      state: draft.state,
      priority: draft.priority,
      assigneeId: draft.assigneeId ? Number(draft.assigneeId) : null,
      estimatePoints: draft.estimatePoints ? Number(draft.estimatePoints) : null,
      plannedStartDate: draft.plannedStartDate || null,
      plannedEndDate: draft.plannedEndDate || null,
      labelIds: draft.labelIds.map(Number),
      customFields: buildPersistedCustomFields(draft),
    });
    setSavingTemplate(false);
    setTemplateName('');
  };

  const quickBody = (
    <QuickCreateView
      draft={draft}
      labels={labels}
      labelCatalog={labelCatalog}
      members={members}
      projectName={projectName}
      pageHref={pageHref}
      dirty={dirty}
      pendingFiles={pendingFiles}
      createMore={createMore}
      recurringEnabled={recurringEnabled}
      recurringInterval={recurringInterval}
      recurringUnit={recurringUnit}
      createPending={createIssueMutation.isPending || createRecurringMutation.isPending}
      selectedLabelIds={selectedLabelIds}
      templates={templates}
      currentUserId={storedUser?.id != null ? String(storedUser.id) : null}
      currentUserName={storedUser?.username ?? null}
      t={t}
      locale={locale}
      onClose={onClose ? handleClose : undefined}
      onExpand={() => router.push(pageHref)}
      onSaveDraft={handleSaveServerDraft}
      onSaveLocalDraft={handleSaveLocalDraft}
      onPickFiles={() => fileInputRef.current?.click()}
      onCreate={handleCreate}
      onCreateMoreChange={setCreateMore}
      onRecurringEnabledChange={setRecurringEnabled}
      onRecurringIntervalChange={setRecurringInterval}
      onRecurringUnitChange={setRecurringUnit}
      onCreateLabel={async (scopeType, name) => {
        const created = await createLabelMutation.mutateAsync({
          organizationId,
          scopeType,
          scopeId: scopeType === 'TEAM' ? (draft.teamId ? Number(draft.teamId) : null) : null,
          name,
          createdBy: storedUser?.id ?? null,
        });
        setDraft((current) => (current ? { ...current, labelIds: Array.from(new Set([...current.labelIds, String(created.id)])) } : current));
      }}
      onDraftChange={setDraft}
    />
  );

  const fullBody = (
    <FullCreateView
      draft={draft}
      labels={labels}
      pendingFiles={pendingFiles}
      projects={projects}
      teams={teams}
      members={members}
      templates={templates}
      customFields={customFields}
      savingTemplate={savingTemplate}
      templateName={templateName}
      createPending={createIssueMutation.isPending}
      locale={locale}
      t={t}
      onDraftChange={setDraft}
      onSaveLocalDraft={handleSaveLocalDraft}
      onSaveDraft={handleSaveServerDraft}
      onToggleSaveTemplate={() => setSavingTemplate((current) => !current)}
      onTemplateNameChange={setTemplateName}
      onSaveTemplate={handleSaveTemplate}
      onPickFiles={() => fileInputRef.current?.click()}
      onCreate={handleCreate}
    />
  );

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(event) => setPendingFiles(Array.from(event.target.files ?? []))}
      />
      {mode === 'page' ? (
        <div className="mx-auto max-w-5xl px-8 py-8">{fullBody}</div>
      ) : (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/16 px-6 py-10 backdrop-blur-[2px]">
          <div className="w-full max-w-6xl rounded-[32px] border border-black/5 bg-white p-6 shadow-[0_28px_80px_rgba(15,23,42,0.18)]">
            {quickBody}
          </div>
        </div>
      )}
    </>
  );
}

function QuickCreateView({
  draft,
  labels,
  labelCatalog,
  members,
  projectName,
  pageHref,
  dirty,
  pendingFiles,
  createMore,
  recurringEnabled,
  recurringInterval,
  recurringUnit,
  createPending,
  selectedLabelIds,
  templates,
  currentUserId,
  currentUserName,
  t,
  locale,
  onClose,
  onExpand,
  onSaveDraft,
  onSaveLocalDraft,
  onPickFiles,
  onCreate,
  onCreateMoreChange,
  onRecurringEnabledChange,
  onRecurringIntervalChange,
  onRecurringUnitChange,
  onCreateLabel,
  onDraftChange,
}: {
  draft: IssueComposerDraft;
  labels: Label[];
  labelCatalog?: { teamLabels: Label[]; workspaceLabels: Label[] };
  members: TeamMember[];
  projectName: string;
  pageHref: string;
  dirty: boolean;
  pendingFiles: File[];
  createMore: boolean;
  recurringEnabled: boolean;
  recurringInterval: string;
  recurringUnit: 'day' | 'week' | 'month';
  createPending: boolean;
  selectedLabelIds: string[];
  templates: IssueTemplate[];
  currentUserId: string | null;
  currentUserName: string | null;
  t: (key: string, params?: Record<string, string | number>) => string;
  locale: Locale;
  onClose?: () => void;
  onExpand: () => void;
  onSaveDraft: () => Promise<void>;
  onSaveLocalDraft: () => void;
  onPickFiles: () => void;
  onCreate: () => Promise<void>;
  onCreateMoreChange: (value: boolean) => void;
  onRecurringEnabledChange: (value: boolean) => void;
  onRecurringIntervalChange: (value: string) => void;
  onRecurringUnitChange: (value: 'day' | 'week' | 'month') => void;
  onCreateLabel: (scopeType: 'TEAM' | 'WORKSPACE', name: string) => Promise<void>;
  onDraftChange: React.Dispatch<React.SetStateAction<IssueComposerDraft | null>>;
}) {
  const labelsLabel = t('settings.composer.labels');
  const stateOptions = ISSUE_STATES.map((value) => buildStateOption(value, t));
  const priorityOptions = ISSUE_PRIORITIES.map((value) => buildPriorityOption(value, t));
  const assigneeOptions = members.map((member) => ({
    value: String(member.id),
    label: member.name,
    avatarText: getInitials(member.name),
    avatarClassName: 'bg-rose-100 text-rose-600',
  } satisfies SingleValueOptionDef));
  const dueDateInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="flex min-h-[470px] flex-col">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 text-[15px] text-ink-700">
          <div className="inline-flex h-10 items-center rounded-full border border-border-soft px-3 text-sm font-medium text-ink-700">
            {projectName}
          </div>
          <span className="text-ink-300">&gt;</span>
          <span className="text-[18px] font-medium text-ink-900">{t('issues.actions.new')}</span>
        </div>
        <div className="flex items-center gap-2">
          {dirty ? (
            <button
              type="button"
              onClick={() => void onSaveDraft()}
              className="inline-flex h-10 items-center rounded-full border border-border-soft px-4 text-sm font-medium text-ink-700 transition hover:bg-slate-50"
            >
              {t('settings.composer.saveDraft')}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onExpand}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-soft text-ink-500 transition hover:bg-slate-50 hover:text-ink-900"
            aria-label={t('settings.composer.openFullCreate')}
          >
            <Expand className="h-4 w-4" />
          </button>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-soft text-ink-500 transition hover:bg-slate-50 hover:text-ink-900"
              aria-label={t('common.cancel')}
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-10 flex-1">
        <input
          value={draft.title}
          onChange={(event) => onDraftChange((current) => (current ? { ...current, title: event.target.value } : current))}
          placeholder={t('settings.composer.titlePlaceholder')}
          className="w-full border-0 bg-transparent px-0 text-[46px] font-semibold tracking-[-0.03em] text-ink-900 outline-none placeholder:text-ink-300"
        />
        <textarea
          value={draft.description}
          onChange={(event) => onDraftChange((current) => (current ? { ...current, description: event.target.value } : current))}
          placeholder={t('settings.composer.descriptionPlaceholder')}
          className="mt-5 min-h-[120px] w-full resize-none border-0 bg-transparent px-0 text-[20px] leading-8 text-ink-600 outline-none placeholder:text-ink-300"
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <SingleValuePill
          label={issueStateLabel(draft.state, t)}
          value={draft.state}
          options={stateOptions}
          onChange={(value) => onDraftChange((current) => (current ? { ...current, state: value as Issue['state'] } : current))}
        />
        <SingleValuePill
          label={issuePriorityLabel(draft.priority, t)}
          value={draft.priority}
          options={priorityOptions}
          onChange={(value) => onDraftChange((current) => (current ? { ...current, priority: value as Issue['priority'] } : current))}
        />
        <SingleValuePill
          label={members.find((member) => String(member.id) === draft.assigneeId)?.name ?? (draft.assigneeId === currentUserId ? currentUserName : undefined) ?? t('common.notSet')}
          value={draft.assigneeId || '__empty__'}
          options={assigneeOptions}
          onChange={(value) => onDraftChange((current) => (current ? { ...current, assigneeId: value === '__empty__' ? '' : value } : current))}
          emptyLabel={t('common.notSet')}
          searchable
          searchPlaceholder={t('settings.composer.searchAssignee')}
          noSearchResultsLabel={t('settings.composer.noAssigneeResults')}
        />
        <LabelsPill
          label={labelsLabel}
          labels={labels}
          labelCatalog={labelCatalog}
          selectedLabelIds={selectedLabelIds}
          teamId={draft.teamId ? Number(draft.teamId) : null}
          onToggle={(labelId) =>
            onDraftChange((current) =>
              current
                ? {
                    ...current,
                    labelIds: toggleSelection(current.labelIds, String(labelId)),
                  }
                : current
            )
          }
          onCreateLabel={onCreateLabel}
          t={t}
        />
        <QuickActionsPill
          draft={draft}
          templates={templates}
          locale={locale}
          pageHref={pageHref}
          onApplyTemplate={(templateId) =>
            onDraftChange((current) =>
              current
                ? applyTemplateToDraft(
                    { ...current, templateId: templateId ? String(templateId) : '' },
                    templates.find((template) => template.id === templateId)
                  )
                : current
            )
          }
          onSaveLocalDraft={onSaveLocalDraft}
          onDraftChange={onDraftChange}
          onExpand={onExpand}
          onToggleRecurring={() => onRecurringEnabledChange(true)}
          t={t}
        />
      </div>

      <div className="mt-10 flex items-end justify-between gap-4">
        <div className="flex min-h-12 flex-1 items-center gap-3">
          <button
            type="button"
            onClick={onPickFiles}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-border-soft text-ink-600 transition hover:bg-slate-50 hover:text-ink-900"
            aria-label={t('settings.composer.addFiles')}
          >
            <Paperclip className="h-5 w-5" />
          </button>
          {recurringEnabled ? (
            <div className="flex flex-wrap items-center gap-2.5 text-[15px] text-ink-800">
              <span className="font-semibold text-ink-700">{t('settings.composer.firstDue')}</span>
              <input
                ref={dueDateInputRef}
                type="date"
                value={draft.plannedEndDate}
                onChange={(event) => onDraftChange((current) => (current ? { ...current, plannedEndDate: event.target.value } : current))}
                className="sr-only"
              />
              <button
                type="button"
                onClick={() => {
                  const input = dueDateInputRef.current as any;
                  if (!input) return;
                  if ('showPicker' in input) {
                    input.showPicker();
                    return;
                  }
                  input.click();
                }}
                className="inline-flex h-12 min-w-[168px] items-center rounded-[16px] border border-slate-200 bg-white px-5 text-[15px] font-medium text-ink-800 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:bg-slate-50"
              >
                {formatRecurringDateDisplay(draft.plannedEndDate)}
              </button>
              <span className="font-semibold text-ink-700">{t('settings.composer.repeatsEvery')}</span>
              <MiniInlineSelect
                value={recurringInterval}
                onChange={onRecurringIntervalChange}
                options={[1, 2, 3, 4].map((value) => ({ value: String(value), label: String(value) }))}
                widthClassName="w-[78px]"
              />
              <MiniInlineSelect
                value={recurringUnit}
                onChange={(value) => onRecurringUnitChange(value as 'day' | 'week' | 'month')}
                options={[
                  { value: 'day', label: t('settings.composer.recurringDay') },
                  { value: 'week', label: t('settings.composer.recurringWeek') },
                  { value: 'month', label: t('settings.composer.recurringMonth') },
                ]}
                widthClassName="w-[92px]"
              />
              <button
                type="button"
                onClick={() => onRecurringEnabledChange(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-400 transition hover:bg-slate-50 hover:text-ink-700"
                aria-label={t('common.cancel')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : pendingFiles.length ? (
            <div className="text-sm text-ink-400">{t('settings.composer.filesSelected', { count: pendingFiles.length })}</div>
          ) : null}
        </div>

        <div className="flex items-center gap-6">
          {!recurringEnabled ? (
            <label className="flex items-center gap-3 text-sm text-ink-600">
              <button
                type="button"
                aria-pressed={createMore}
                onClick={() => onCreateMoreChange(!createMore)}
                className={`relative h-7 w-12 rounded-full transition ${createMore ? 'bg-slate-900' : 'bg-slate-200'}`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${createMore ? 'left-6' : 'left-1'}`}
                />
              </button>
              <span>{t('settings.composer.createMore')}</span>
            </label>
          ) : null}
          <Button
            type="button"
            onClick={() => void onCreate()}
            disabled={!draft.title.trim() || !draft.projectId || createPending}
            className={cn(
              'h-14 rounded-full px-8 text-base font-semibold shadow-none',
              recurringEnabled ? 'bg-[#5E6AD2] hover:bg-[#525DC2]' : undefined
            )}
          >
            {createPending ? t('issues.actions.creating') : recurringEnabled ? t('settings.composer.createRecurringIssue') : t('issues.actions.create')}
          </Button>
        </div>
      </div>
    </div>
  );
}

function FullCreateView({
  draft,
  labels,
  pendingFiles,
  projects,
  teams,
  members,
  templates,
  customFields,
  savingTemplate,
  templateName,
  createPending,
  locale,
  t,
  onDraftChange,
  onSaveLocalDraft,
  onSaveDraft,
  onToggleSaveTemplate,
  onTemplateNameChange,
  onSaveTemplate,
  onPickFiles,
  onCreate,
}: {
  draft: IssueComposerDraft;
  labels: Label[];
  pendingFiles: File[];
  projects: Array<{ id: number; name: string }>;
  teams: Array<{ id: number; name: string }>;
  members: TeamMember[];
  templates: IssueTemplate[];
  customFields: CustomFieldDefinition[];
  savingTemplate: boolean;
  templateName: string;
  createPending: boolean;
  locale: Locale;
  t: (key: string, params?: Record<string, string | number>) => string;
  onDraftChange: React.Dispatch<React.SetStateAction<IssueComposerDraft | null>>;
  onSaveLocalDraft: () => void;
  onSaveDraft: () => Promise<void>;
  onToggleSaveTemplate: () => void;
  onTemplateNameChange: (value: string) => void;
  onSaveTemplate: () => Promise<void>;
  onPickFiles: () => void;
  onCreate: () => Promise<void>;
}) {
  const selectedLabelNames = labels.filter((item) => draft.labelIds.includes(String(item.id))).map((item) => item.name).join(', ');

  return (
    <div className="rounded-[32px] border border-border-soft bg-white p-8 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-ink-400">{t('settings.composer.fullCreateEyebrow')}</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-900">{t('issues.actions.new')}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={localizePath(locale, '/drafts')}
            className="inline-flex h-10 items-center rounded-full border border-border-soft px-4 text-sm font-medium text-ink-700 transition hover:bg-slate-50"
          >
            {t('issues.actions.openDrafts')}
          </Link>
          <Button type="button" variant="secondary" onClick={onSaveLocalDraft}>
            <Save className="mr-2 h-4 w-4" />
            {t('settings.composer.saveLocalDraft')}
          </Button>
          <Button type="button" variant="secondary" onClick={() => void onSaveDraft()}>
            {t('settings.composer.saveDraft')}
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-6">
        <div className="grid gap-3">
          <label className="text-sm font-medium text-ink-700">{t('issues.columns.title')}</label>
          <Input
            value={draft.title}
            onChange={(event) => onDraftChange((current) => (current ? { ...current, title: event.target.value } : current))}
            placeholder={t('settings.composer.titlePlaceholder')}
            className="h-12 text-lg"
          />
        </div>

        <div className="grid gap-3">
          <label className="text-sm font-medium text-ink-700">{t('issues.detailPage.description')}</label>
          <Textarea
            value={draft.description}
            onChange={(event) => onDraftChange((current) => (current ? { ...current, description: event.target.value } : current))}
            placeholder={t('settings.composer.descriptionPlaceholder')}
            className="min-h-[180px]"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SelectField
            label={t('issues.columns.project')}
            value={draft.projectId}
            onChange={(value) => onDraftChange((current) => (current ? { ...current, projectId: value } : current))}
            options={projects.map((project) => ({ value: String(project.id), label: project.name }))}
          />
          <SelectField
            label={t('issues.filters.state')}
            value={draft.state}
            onChange={(value) => onDraftChange((current) => (current ? { ...current, state: value as Issue['state'] } : current))}
            options={ISSUE_STATES.map((value) => ({ value, label: issueStateLabel(value, t) }))}
          />
          <SelectField
            label={t('issues.filters.priority')}
            value={draft.priority}
            onChange={(value) => onDraftChange((current) => (current ? { ...current, priority: value as Issue['priority'] } : current))}
            options={ISSUE_PRIORITIES.map((value) => ({ value, label: issuePriorityLabel(value, t) }))}
          />
          <SelectField
            label={t('issues.detailPage.assignee')}
            value={draft.assigneeId || '__empty__'}
            onChange={(value) => onDraftChange((current) => (current ? { ...current, assigneeId: value === '__empty__' ? '' : value } : current))}
            options={members.map((member) => ({ value: String(member.id), label: member.name }))}
            allowEmpty
            emptyLabel={t('common.notSet')}
          />
          <SelectField
            label={t('settings.team.templates')}
            value={draft.templateId || '__empty__'}
            onChange={(value) => {
              const next = value === '__empty__' ? '' : value;
              onDraftChange((current) =>
                current ? applyTemplateToDraft({ ...current, templateId: next }, templates.find((template) => String(template.id) === next)) : current
              );
            }}
            options={templates.map((template) => ({ value: String(template.id), label: template.name }))}
            allowEmpty
            emptyLabel={t('settings.composer.noTemplate')}
          />
          <SelectField
            label={t('issues.filters.type')}
            value={draft.type}
            onChange={(value) => onDraftChange((current) => (current ? { ...current, type: value as Issue['type'] } : current))}
            options={ISSUE_TYPES.map((value) => ({ value, label: issueTypeLabel(value, t) }))}
          />
          <SelectField
            label={t('issues.detailPage.team')}
            value={draft.teamId || '__empty__'}
            onChange={(value) => onDraftChange((current) => (current ? { ...current, teamId: value === '__empty__' ? '' : value } : current))}
            options={teams.map((team) => ({ value: String(team.id), label: team.name }))}
            allowEmpty
            emptyLabel={t('common.notSet')}
          />
          <Field label={t('issues.detailPage.parentIssue')}>
            <Input
              value={draft.parentIssueId}
              onChange={(event) => onDraftChange((current) => (current ? { ...current, parentIssueId: event.target.value } : current))}
            />
          </Field>
          <Field label={t('settings.composer.estimatePoints')}>
            <Input
              value={draft.estimatePoints}
              onChange={(event) => onDraftChange((current) => (current ? { ...current, estimatePoints: event.target.value } : current))}
            />
          </Field>
          <Field label={t('issues.detailPage.plannedStart')}>
            <Input
              type="date"
              value={draft.plannedStartDate}
              onChange={(event) => onDraftChange((current) => (current ? { ...current, plannedStartDate: event.target.value } : current))}
            />
          </Field>
          <Field label={t('issues.detailPage.plannedEnd')}>
            <Input
              type="date"
              value={draft.plannedEndDate}
              onChange={(event) => onDraftChange((current) => (current ? { ...current, plannedEndDate: event.target.value } : current))}
            />
          </Field>
          <Field label={t('settings.composer.labels')} className="md:col-span-2 xl:col-span-1">
            <Input
              value={selectedLabelNames}
              readOnly
              placeholder={t('settings.composer.noLabels')}
            />
          </Field>
          <Field label={t('settings.composer.linksLabel')} className="md:col-span-2 xl:col-span-3">
            <Textarea
              value={draft.linksText}
              onChange={(event) => onDraftChange((current) => (current ? { ...current, linksText: event.target.value } : current))}
              placeholder={t('settings.composer.linksPlaceholder')}
              className="min-h-[96px]"
            />
          </Field>
        </div>

        {customFields.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {customFields.map((field) => (
              <Field key={field.id} label={field.name}>
                <CustomFieldInput
                  field={field}
                  members={members}
                  teams={teams}
                  value={draft.customFields[field.key]}
                  onChange={(value) =>
                    onDraftChange((current) =>
                      current ? { ...current, customFields: { ...current.customFields, [field.key]: value } } : current
                    )
                  }
                />
              </Field>
            ))}
          </div>
        ) : null}

        {savingTemplate ? (
          <div className="rounded-2xl border border-border-soft bg-slate-50 p-4">
            <div className="mb-3 text-sm font-medium text-ink-900">{t('settings.composer.saveAsTemplate')}</div>
            <div className="flex gap-3">
              <Input value={templateName} onChange={(event) => onTemplateNameChange(event.target.value)} placeholder={t('settings.composer.templateName')} />
              <Button type="button" onClick={() => void onSaveTemplate()}>
                {t('settings.composer.saveTemplate')}
              </Button>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-soft pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="secondary" onClick={onPickFiles}>
              <Paperclip className="mr-2 h-4 w-4" />
              {pendingFiles.length ? t('settings.composer.filesSelected', { count: pendingFiles.length }) : t('settings.composer.addFiles')}
            </Button>
            <Button type="button" variant="secondary" onClick={onToggleSaveTemplate}>
              {t('settings.composer.saveAsTemplate')}
            </Button>
            <Link
              href={localizePath(locale, '/teams/current/settings/templates')}
              className="inline-flex h-10 items-center rounded-full border border-border-soft px-4 text-sm font-medium text-ink-700 transition hover:bg-slate-50"
            >
              {t('issues.actions.manageTemplates')}
            </Link>
          </div>
          <Button type="button" onClick={() => void onCreate()} disabled={!draft.title.trim() || !draft.projectId || createPending}>
            {createPending ? t('issues.actions.creating') : t('issues.actions.create')}
          </Button>
        </div>

        {pendingFiles.length ? (
          <div className="rounded-2xl border border-border-soft bg-white p-4">
            <div className="text-sm font-medium text-ink-900">{t('settings.composer.selectedFiles')}</div>
            <div className="mt-2 space-y-1 text-sm text-ink-500">
              {pendingFiles.map((file) => (
                <div key={`${file.name}-${file.size}`}>{file.name}</div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SingleValuePill({
  label,
  value,
  options,
  onChange,
  emptyLabel,
  searchable = false,
  searchPlaceholder,
  noSearchResultsLabel,
}: {
  label: string;
  value: string;
  options: SingleValueOptionDef[];
  onChange: (value: string) => void;
  emptyLabel?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  noSearchResultsLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selectedOption = options.find((option) => option.value === value);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredOptions = searchable && normalizedQuery
    ? options.filter((option) => option.label.toLowerCase().includes(normalizedQuery))
    : options;

  const handleChange = (nextValue: string) => {
    onChange(nextValue);
    setOpen(false);
    setQuery('');
  };

  if (searchable) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-border-soft bg-white px-4 text-[15px] font-medium text-ink-700 shadow-sm transition hover:bg-slate-50"
          >
            <SingleValueDisplay option={selectedOption} fallbackLabel={label || emptyLabel || ''} />
            <ChevronDown className="h-4 w-4 text-ink-300" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[320px] overflow-hidden p-0">
          <div className="border-b border-border-soft px-4 py-3">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-auto border-0 bg-transparent px-0 py-0 text-[16px] shadow-none focus:ring-0"
            />
          </div>
          <div className="max-h-80 overflow-y-auto p-2">
            <div className="space-y-1">
              {emptyLabel ? (
                <SingleValueOption
                  label={emptyLabel}
                  selected={value === '__empty__'}
                  onSelect={() => handleChange('__empty__')}
                />
              ) : null}
              {filteredOptions.map((option) => (
                <SingleValueOption
                  key={option.value}
                  option={option}
                  selected={value === option.value}
                  onSelect={() => handleChange(option.value)}
                />
              ))}
            </div>
            {!filteredOptions.length ? <div className="px-3 py-4 text-sm text-ink-400">{noSearchResultsLabel}</div> : null}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex h-11 items-center gap-2 rounded-full border border-border-soft bg-white px-4 text-[15px] font-medium text-ink-700 shadow-sm transition hover:bg-slate-50"
        >
          <SingleValueDisplay option={selectedOption} fallbackLabel={label || emptyLabel || ''} />
          <ChevronDown className="h-4 w-4 text-ink-300" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-56">
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {emptyLabel ? <DropdownMenuRadioItem value="__empty__">{emptyLabel}</DropdownMenuRadioItem> : null}
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              <SingleValueDisplay option={option} fallbackLabel={option.label} />
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SingleValueOption({
  label,
  option,
  selected,
  onSelect,
}: {
  label?: string;
  option?: SingleValueOptionDef;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-ink-700 transition hover:bg-slate-50"
    >
      <span className="flex h-4 w-4 items-center justify-center text-brand-600">
        {selected ? (
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
            <path d="M6.4 11.2 3.6 8.4l-.8.8 3.6 3.6 6.8-6.8-.8-.8z" />
          </svg>
        ) : null}
      </span>
      <SingleValueDisplay option={option} fallbackLabel={label ?? ''} />
    </button>
  );
}

function SingleValueDisplay({ option, fallbackLabel }: { option?: SingleValueOptionDef; fallbackLabel: string }) {
  const label = option?.label ?? fallbackLabel;

  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      {option?.avatarText ? <AvatarChip text={option.avatarText} className={option.avatarClassName} /> : null}
      {option?.icon ? <span className={cn('inline-flex items-center justify-center', option.iconClassName)}>{option.icon}</span> : null}
      <span className="truncate">{label}</span>
    </span>
  );
}

function AvatarChip({ text, className }: { text: string; className?: string }) {
  return <span className={cn('inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold uppercase', className)}>{text}</span>;
}

function MiniInlineSelect({
  value,
  onChange,
  options,
  widthClassName,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  widthClassName?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={cn(
          'h-12 rounded-[16px] border-slate-200 bg-white px-4 text-[15px] font-medium text-ink-800 shadow-[0_1px_2px_rgba(15,23,42,0.04)] focus:ring-0',
          widthClassName
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function LabelsPill({
  label,
  labels,
  labelCatalog,
  selectedLabelIds,
  teamId,
  onToggle,
  onCreateLabel,
  t,
}: {
  label: string;
  labels: Label[];
  labelCatalog?: { teamLabels: Label[]; workspaceLabels: Label[] };
  selectedLabelIds: string[];
  teamId: number | null;
  onToggle: (labelId: number) => void;
  onCreateLabel: (scopeType: 'TEAM' | 'WORKSPACE', name: string) => Promise<void>;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState<'TEAM' | 'WORKSPACE' | null>(null);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredLabels = normalizedQuery ? labels.filter((item) => item.name.toLowerCase().includes(normalizedQuery)) : labels;
  const selectedSet = new Set(selectedLabelIds);
  const frequentLabels = filteredLabels.filter((item) => selectedSet.has(String(item.id)));
  const teamLabels = (labelCatalog?.teamLabels ?? filteredLabels)
    .filter((item) => (!normalizedQuery || item.name.toLowerCase().includes(normalizedQuery)) && !selectedSet.has(String(item.id)));
  const workspaceLabels = (labelCatalog?.workspaceLabels ?? filteredLabels)
    .filter((item) => (!normalizedQuery || item.name.toLowerCase().includes(normalizedQuery)) && !selectedSet.has(String(item.id)));
  const canCreate = Boolean(normalizedQuery) && !labels.some((item) => item.name.toLowerCase() === normalizedQuery);

  const handleCreate = async (scopeType: 'TEAM' | 'WORKSPACE') => {
    const name = query.trim();
    if (!name) return;
    setCreating(scopeType);
    try {
      await onCreateLabel(scopeType, name);
      setQuery('');
    } finally {
      setCreating(null);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex h-11 items-center gap-2 rounded-full border border-border-soft bg-white px-4 text-[15px] font-medium text-ink-700 shadow-sm transition hover:bg-slate-50"
        >
          <Tag className="h-4 w-4 text-ink-400" />
          <span>{label}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[360px] overflow-hidden p-0">
        <div className="flex items-center gap-3 border-b border-border-soft px-4 py-3">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('settings.composer.searchLabels')}
            className="h-auto border-0 bg-transparent px-0 py-0 text-[16px] shadow-none focus:ring-0"
          />
          <span className="rounded-lg border border-border-soft px-2 py-1 text-xs font-medium text-ink-400">L</span>
        </div>

        <div className="max-h-80 overflow-y-auto py-2">
          {canCreate ? (
            <div className="space-y-1 px-2 pb-3">
              {teamId ? (
                <button
                  type="button"
                  onClick={() => void handleCreate('TEAM')}
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[15px] text-ink-800 transition hover:bg-slate-50"
                  disabled={creating != null}
                >
                  <span className="text-xl leading-none text-ink-500">+</span>
                  <span>{t('settings.composer.createTeamLabel', { value: query.trim() })}</span>
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => void handleCreate('WORKSPACE')}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[15px] text-ink-800 transition hover:bg-slate-50"
                disabled={creating != null}
              >
                <span className="text-xl leading-none text-ink-500">+</span>
                <span>{t('settings.composer.createWorkspaceLabel', { value: query.trim() })}</span>
              </button>
            </div>
          ) : null}

          {labels.length ? (
            <>
              {frequentLabels.length ? (
              <>
                <div className="px-6 pb-2 text-sm font-medium text-ink-400">{t('settings.composer.frequentlyUsedLabels')}</div>
                <div className="space-y-1 px-2 pb-3">
                  {frequentLabels.map((tag) => (
                    <LabelOption key={tag.id} tag={tag} selected={true} onToggle={onToggle} />
                  ))}
                </div>
              </>
              ) : null}

              {teamLabels.length ? (
              <>
                <div className="px-6 pb-2 text-sm font-medium text-ink-400">{t('settings.composer.teamLabels')}</div>
                <div className="space-y-1 px-2 pb-3">
                  {teamLabels.map((tag) => (
                    <LabelOption key={tag.id} tag={tag} selected={false} onToggle={onToggle} />
                  ))}
                </div>
              </>
              ) : null}

              {workspaceLabels.length ? (
              <>
                <div className="px-6 pb-2 text-sm font-medium text-ink-400">{t('settings.composer.workspaceLabels')}</div>
                <div className="space-y-1 px-2">
                  {workspaceLabels.map((tag) => (
                    <LabelOption key={tag.id} tag={tag} selected={false} onToggle={onToggle} />
                  ))}
                </div>
              </>
              ) : normalizedQuery && !canCreate ? (
              <div className="px-4 py-6 text-center text-sm text-ink-400">{t('settings.composer.noLabels')}</div>
              ) : null}
            </>
          ) : !canCreate ? (
            <div className="px-4 py-6 text-center text-sm text-ink-400">{t('settings.composer.noLabels')}</div>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function LabelOption({
  tag,
  selected,
  onToggle,
}: {
  tag: Label;
  selected: boolean;
  onToggle: (labelId: number) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(tag.id)}
      className={`flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left text-[15px] text-ink-800 transition hover:bg-slate-50 ${selected ? 'bg-slate-100' : ''}`}
    >
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-md border ${selected ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-border-soft bg-white text-transparent'}`}
      >
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
          <path d="M6.4 11.2 3.6 8.4l-.8.8 3.6 3.6 6.8-6.8-.8-.8z" />
        </svg>
      </span>
      <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: tag.color ?? '#94a3b8' }} />
      <span className="truncate">{tag.name}</span>
    </button>
  );
}

function QuickActionsPill({
  draft,
  templates,
  locale,
  pageHref,
  onApplyTemplate,
  onSaveLocalDraft,
  onDraftChange,
  onExpand,
  onToggleRecurring,
  t,
}: {
  draft: IssueComposerDraft;
  templates: IssueTemplate[];
  locale: Locale;
  pageHref: string;
  onApplyTemplate: (templateId: number) => void;
  onSaveLocalDraft: () => void;
  onDraftChange: React.Dispatch<React.SetStateAction<IssueComposerDraft | null>>;
  onExpand: () => void;
  onToggleRecurring: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const [linkValue, setLinkValue] = useState('');
  const suggestedDueDates = buildSuggestedDueDates(locale);

  const applyDueDate = (value: string) => {
    onDraftChange((current) => (current ? { ...current, plannedEndDate: value } : current));
  };

  const addLink = () => {
    const nextLink = linkValue.trim();
    if (!nextLink) return;

    onDraftChange((current) => {
      if (!current) return current;
      const lines = current.linksText
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
      return {
        ...current,
        linksText: [...lines, nextLink].join('\n'),
      };
    });
    setLinkValue('');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border-soft bg-white text-ink-700 shadow-sm transition hover:bg-slate-50"
        >
          <MoreHorizontal className="h-4.5 w-4.5 text-ink-500" strokeWidth={2} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[320px] p-2">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-3 rounded-2xl px-4 py-3 text-[15px]">
            <CalendarPlus className="h-5 w-5 text-ink-500" />
            <span>{t('settings.composer.setDueDate')}</span>
            <span className="ml-auto text-xs text-ink-400">D</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="min-w-[380px] overflow-hidden p-0">
              <div className="border-b border-border-soft px-6 py-4 text-[15px] text-ink-400">{t('settings.composer.dueDateSuggestions')}</div>
              <div className="p-2">
                <button
                  type="button"
                  onClick={() => applyDueDate('')}
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[15px] text-ink-800 transition hover:bg-slate-50"
                >
                  <Calendar className="h-5 w-5 text-ink-500" />
                  <span>{t('settings.composer.customDueDate')}</span>
                </button>
                <div className="px-4 pb-3 pt-1">
                  <Input
                    type="date"
                    value={draft.plannedEndDate}
                    onChange={(event) => applyDueDate(event.target.value)}
                    className="h-10"
                  />
                </div>
                {suggestedDueDates.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => applyDueDate(option.value)}
                    className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[15px] text-ink-800 transition hover:bg-slate-50"
                  >
                    <Calendar className="h-5 w-5 text-ink-500" />
                    <span className="flex-1">{option.label}</span>
                    <span className="text-ink-400">{option.preview}</span>
                  </button>
                ))}
              </div>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuItem onSelect={onToggleRecurring} className="gap-3 rounded-2xl px-4 py-3 text-[15px]">
            <Repeat className="h-5 w-5 text-ink-500" />
            <span>{t('settings.composer.makeRecurring')}</span>
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-3 rounded-2xl px-4 py-3 text-[15px]">
            <Link2 className="h-5 w-5 text-ink-500" />
            <span>{t('settings.composer.addLink')}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="min-w-[340px] p-3">
              <div className="space-y-3">
                <Input
                  value={linkValue}
                  onChange={(event) => setLinkValue(event.target.value)}
                  placeholder={t('settings.composer.linkInputPlaceholder')}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      addLink();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addLink}
                  className="inline-flex h-10 items-center rounded-full border border-border-soft px-4 text-sm font-medium text-ink-700 transition hover:bg-slate-50"
                >
                  {t('settings.composer.confirmAddLink')}
                </button>
              </div>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onExpand} className="gap-3 rounded-2xl px-4 py-3 text-[15px]">
          <ListPlus className="h-5 w-5 text-ink-500" />
          <span>{t('issues.detailPage.newSubIssue')}</span>
          <ChevronRight className="ml-auto h-4 w-4 text-ink-300" />
        </DropdownMenuItem>
        {templates.length ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>{t('settings.team.templates')}</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  {templates.map((template) => (
                    <DropdownMenuItem key={template.id} onSelect={() => onApplyTemplate(template.id)}>
                      {template.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`grid gap-2 ${className ?? ''}`}>
      <span className="text-sm font-medium text-ink-800">{label}</span>
      {children}
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  allowEmpty = false,
  emptyLabel,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  allowEmpty?: boolean;
  emptyLabel?: string;
}) {
  return (
    <Field label={label}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {allowEmpty ? <SelectItem value="__empty__">{emptyLabel ?? 'Not set'}</SelectItem> : null}
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

function CustomFieldInput({
  field,
  members,
  teams,
  value,
  onChange,
}: {
  field: CustomFieldDefinition;
  members: TeamMember[];
  teams: Array<{ id: number; name: string }>;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const { t } = useI18n();
  const notSet = t('common.notSet');

  if (field.dataType === 'SINGLE_SELECT') {
    return (
      <Select value={String(value ?? '__empty__')} onValueChange={(next) => onChange(next === '__empty__' ? undefined : next)}>
        <SelectTrigger>
          <SelectValue placeholder={notSet} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__empty__">{notSet}</SelectItem>
          {field.options.map((option) => (
            <SelectItem key={option.id} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
  if (field.dataType === 'USER') {
    return (
      <Select value={String(value ?? '__empty__')} onValueChange={(next) => onChange(next === '__empty__' ? undefined : Number(next))}>
        <SelectTrigger>
          <SelectValue placeholder={notSet} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__empty__">{notSet}</SelectItem>
          {members.map((member) => (
            <SelectItem key={member.id} value={String(member.id)}>
              {member.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
  if (field.dataType === 'TEAM') {
    return (
      <Select value={String(value ?? '__empty__')} onValueChange={(next) => onChange(next === '__empty__' ? undefined : Number(next))}>
        <SelectTrigger>
          <SelectValue placeholder={notSet} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__empty__">{notSet}</SelectItem>
          {teams.map((team) => (
            <SelectItem key={team.id} value={String(team.id)}>
              {team.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
  if (field.dataType === 'BOOLEAN') {
    return (
      <Select value={String(value ?? '__empty__')} onValueChange={(next) => onChange(next === '__empty__' ? undefined : next === 'true')}>
        <SelectTrigger>
          <SelectValue placeholder={notSet} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__empty__">{notSet}</SelectItem>
          <SelectItem value="true">True</SelectItem>
          <SelectItem value="false">False</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  return (
    <Input
      type={field.dataType === 'NUMBER' ? 'number' : field.dataType === 'DATE' ? 'date' : 'text'}
      value={String(value ?? '')}
      onChange={(event) => onChange(field.dataType === 'NUMBER' ? Number(event.target.value) : event.target.value)}
    />
  );
}

function issueStateLabel(value: Issue['state'], t: (key: string, params?: Record<string, string | number>) => string) {
  return t(`common.status.${value}`);
}

function issuePriorityLabel(value: Issue['priority'], t: (key: string, params?: Record<string, string | number>) => string) {
  return t(`common.priority.${value}`);
}

function issueTypeLabel(value: Issue['type'], t: (key: string, params?: Record<string, string | number>) => string) {
  return t(`issues.type.${value}`);
}

function toggleSelection(values: string[], nextValue: string) {
  return values.includes(nextValue) ? values.filter((item) => item !== nextValue) : [...values, nextValue];
}

function buildStateOption(value: Issue['state'], t: (key: string, params?: Record<string, string | number>) => string): SingleValueOptionDef {
  const label = issueStateLabel(value, t);

  if (value === 'BACKLOG') {
    return { value, label, icon: <CircleDashed className="h-4 w-4" />, iconClassName: 'text-slate-400' };
  }
  if (value === 'TODO') {
    return { value, label, icon: <Circle className="h-4 w-4" />, iconClassName: 'text-slate-400' };
  }
  if (value === 'IN_PROGRESS') {
    return { value, label, icon: <LoaderCircle className="h-4 w-4" />, iconClassName: 'text-sky-500' };
  }
  if (value === 'IN_REVIEW') {
    return { value, label, icon: <CircleEllipsis className="h-4 w-4" />, iconClassName: 'text-amber-500' };
  }
  if (value === 'DONE') {
    return { value, label, icon: <CheckCircle2 className="h-4 w-4" />, iconClassName: 'text-emerald-500' };
  }
  return { value, label, icon: <XCircle className="h-4 w-4" />, iconClassName: 'text-rose-500' };
}

function buildPriorityOption(value: Issue['priority'], t: (key: string, params?: Record<string, string | number>) => string): SingleValueOptionDef {
  const label = issuePriorityLabel(value, t);

  if (value === 'LOW') {
    return { value, label, icon: <Minus className="h-4 w-4" />, iconClassName: 'text-slate-400' };
  }
  if (value === 'MEDIUM') {
    return { value, label, icon: <Equal className="h-4 w-4" />, iconClassName: 'text-sky-500' };
  }
  if (value === 'HIGH') {
    return { value, label, icon: <ChevronDown className="h-4 w-4 rotate-180" />, iconClassName: 'text-orange-500' };
  }
  return { value, label, icon: <Flame className="h-4 w-4" />, iconClassName: 'text-rose-500' };
}

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) return 'NA';
  return parts.map((part) => part[0]).join('').toUpperCase();
}

function buildSuggestedDueDates(locale: Locale) {
  const tomorrow = addDays(new Date(), 1);
  const nextWeek = addDays(new Date(), 7);
  const endOfWeek = getEndOfWeek(new Date());

  return [
    {
      label: locale.startsWith('zh') ? '明天' : 'Tomorrow',
      value: toDateInputValue(tomorrow),
      preview: formatQuickDate(tomorrow, locale),
    },
    {
      label: locale.startsWith('zh') ? '本周结束前' : 'End of this week',
      value: toDateInputValue(endOfWeek),
      preview: formatQuickDate(endOfWeek, locale),
    },
    {
      label: locale.startsWith('zh') ? '一周后' : 'In one week',
      value: toDateInputValue(nextWeek),
      preview: formatQuickDate(nextWeek, locale),
    },
  ];
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function getEndOfWeek(date: Date) {
  const next = new Date(date);
  const day = next.getDay();
  const delta = day === 0 ? 5 : 5 - day;
  next.setDate(next.getDate() + (delta >= 0 ? delta : delta + 7));
  return next;
}

function toDateInputValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatQuickDate(date: Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale.startsWith('zh') ? 'zh-CN' : 'en-US', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  }).format(date);
}

function formatRecurringDateDisplay(value: string) {
  if (!value) return 'YYYY/MM/DD';
  return value.replace(/-/g, '/');
}

function buildRecurringNextRunAt(value: string) {
  const safeDate = value || toDateInputValue(addDays(new Date(), 7));
  return `${safeDate}T09:00:00`;
}

function weekdayCodeFromDate(value: string) {
  const day = new Date(`${value}T00:00:00`).getDay();
  return ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][day] ?? 'MONDAY';
}
