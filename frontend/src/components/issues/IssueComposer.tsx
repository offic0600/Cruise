'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, Expand, Paperclip, Save, Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { localizePath, type Locale } from '@/i18n/config';
import { useI18n } from '@/i18n/useI18n';
import {
  createIssue,
  createIssueDraft,
  createIssueLinkAttachments,
  createIssueTemplate,
  deleteIssueDraft,
  getIssueDraft,
  getIssueTags,
  getIssueTemplates,
  getProjects,
  getTeamMembers,
  getTeams,
  type CustomFieldDefinition,
  type Issue,
  type IssueTemplate,
  updateIssueDraft,
  uploadIssueAttachment,
} from '@/lib/api';
import { getCustomFieldDefinitions } from '@/lib/api/custom-fields';
import { getStoredUser } from '@/lib/auth';
import {
  applySavedDraftToComposer,
  applyTemplateToDraft,
  buildLegacyPayloadFromDraft,
  ISSUE_PRIORITIES,
  ISSUE_STATES,
  ISSUE_TYPES,
  type IssueComposerDraft,
  localDraftStorageKey,
  parseIssueCreateParams,
  serializeDraftToQuery,
} from '@/lib/issues/composer';
import { queryKeys } from '@/lib/query/keys';

type TeamMember = {
  id: number;
  name: string;
};

type IssueTagRecord = {
  id: number;
  name: string;
  color?: string | null;
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

  const projectsQuery = useQuery({
    queryKey: queryKeys.projects,
    queryFn: () => getProjects({ organizationId }),
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
  const tagsQuery = useQuery({
    queryKey: ['issue-tags'],
    queryFn: () => getIssueTags(),
    enabled: composerEnabled && mode === 'modal',
  });

  const projects = projectsQuery.data ?? [];
  const teams = teamsQuery.data ?? [];
  const members = (membersQuery.data ?? []) as TeamMember[];
  const templates = templatesQuery.data ?? [];
  const customFields = ((customFieldsQuery.data ?? []) as CustomFieldDefinition[]).filter((field) => field.showOnCreate);
  const tags = (tagsQuery.data ?? []) as IssueTagRecord[];

  useEffect(() => {
    if (!projects.length || draft) return;

    const params = initialParams ?? new URLSearchParams();
    let nextDraft = parseIssueCreateParams(params, projects, templates);
    const localDraftRaw =
      typeof window !== 'undefined' ? localStorage.getItem(localDraftStorageKey(storedUser?.id, localeScope)) : null;

    if (localDraftRaw && !params.toString() && initialDraftId == null) {
      nextDraft = { ...nextDraft, ...((JSON.parse(localDraftRaw) as IssueComposerDraft) ?? {}) };
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

  const dirty = useMemo(() => {
    if (!draft) return false;
    return JSON.stringify(draft) !== initialSnapshot || pendingFiles.length > 0;
  }, [draft, initialSnapshot, pendingFiles.length]);

  if (!open || !draft) return null;

  const pageHref = `${localizePath(locale, '/issues/new')}?${serializeDraftToQuery(draft)}`;
  const projectName = projects.find((project) => String(project.id) === draft.projectId)?.name ?? t('settings.composer.noProject');
  const selectedTags = draft.tags
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const resetComposer = () => {
    const nextDraft = parseIssueCreateParams(initialParams ?? new URLSearchParams(), projects, templates);
    setDraft(nextDraft);
    setInitialSnapshot(JSON.stringify(nextDraft));
    setPendingFiles([]);
    setSavingTemplate(false);
    setTemplateName('');
  };

  const handleClose = () => {
    if (dirty && !window.confirm(t('settings.composer.discardConfirm'))) return;
    onClose?.();
  };

  const handleCreate = async () => {
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
      legacyPayload: buildLegacyPayloadFromDraft(draft),
      customFields: draft.customFields,
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
        status: 'SAVED_DRAFT',
        legacyPayload: buildLegacyPayloadFromDraft(draft),
        customFields: draft.customFields,
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
      legacyPayload: buildLegacyPayloadFromDraft(draft),
      customFields: draft.customFields,
    });
    setSavingTemplate(false);
    setTemplateName('');
  };

  const quickBody = (
    <QuickCreateView
      draft={draft}
      tags={tags}
      members={members}
      projectName={projectName}
      pageHref={pageHref}
      dirty={dirty}
      pendingFiles={pendingFiles}
      createMore={createMore}
      createPending={createIssueMutation.isPending}
      selectedTags={selectedTags}
      templates={templates}
      t={t}
      locale={locale}
      onClose={onClose ? handleClose : undefined}
      onExpand={() => router.push(pageHref)}
      onSaveDraft={handleSaveServerDraft}
      onSaveLocalDraft={handleSaveLocalDraft}
      onPickFiles={() => fileInputRef.current?.click()}
      onCreate={handleCreate}
      onCreateMoreChange={setCreateMore}
      onDraftChange={setDraft}
    />
  );

  const fullBody = (
    <FullCreateView
      draft={draft}
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
  tags,
  members,
  projectName,
  pageHref,
  dirty,
  pendingFiles,
  createMore,
  createPending,
  selectedTags,
  templates,
  t,
  locale,
  onClose,
  onExpand,
  onSaveDraft,
  onSaveLocalDraft,
  onPickFiles,
  onCreate,
  onCreateMoreChange,
  onDraftChange,
}: {
  draft: IssueComposerDraft;
  tags: IssueTagRecord[];
  members: TeamMember[];
  projectName: string;
  pageHref: string;
  dirty: boolean;
  pendingFiles: File[];
  createMore: boolean;
  createPending: boolean;
  selectedTags: string[];
  templates: IssueTemplate[];
  t: (key: string, params?: Record<string, string | number>) => string;
  locale: Locale;
  onClose?: () => void;
  onExpand: () => void;
  onSaveDraft: () => Promise<void>;
  onSaveLocalDraft: () => void;
  onPickFiles: () => void;
  onCreate: () => Promise<void>;
  onCreateMoreChange: (value: boolean) => void;
  onDraftChange: React.Dispatch<React.SetStateAction<IssueComposerDraft | null>>;
}) {
  const labelsLabel = selectedTags.length
    ? `${selectedTags[0]}${selectedTags.length > 1 ? ` +${selectedTags.length - 1}` : ''}`
    : t('settings.composer.labels');

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
          options={ISSUE_STATES.map((value) => ({ value, label: issueStateLabel(value, t) }))}
          onChange={(value) => onDraftChange((current) => (current ? { ...current, state: value as Issue['state'] } : current))}
        />
        <SingleValuePill
          label={issuePriorityLabel(draft.priority, t)}
          value={draft.priority}
          options={ISSUE_PRIORITIES.map((value) => ({ value, label: issuePriorityLabel(value, t) }))}
          onChange={(value) => onDraftChange((current) => (current ? { ...current, priority: value as Issue['priority'] } : current))}
        />
        <SingleValuePill
          label={members.find((member) => String(member.id) === draft.assigneeId)?.name ?? t('common.notSet')}
          value={draft.assigneeId || '__empty__'}
          options={members.map((member) => ({ value: String(member.id), label: member.name }))}
          onChange={(value) => onDraftChange((current) => (current ? { ...current, assigneeId: value === '__empty__' ? '' : value } : current))}
          emptyLabel={t('common.notSet')}
        />
        <LabelsPill
          label={labelsLabel}
          tags={tags}
          selectedTags={selectedTags}
          onToggle={(name) =>
            onDraftChange((current) =>
              current
                ? {
                    ...current,
                    tags: toggleName(current.tags, name),
                  }
                : current
            )
          }
          t={t}
        />
        <QuickActionsPill
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
          t={t}
        />
      </div>

      <div className="mt-10 flex items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onPickFiles}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-border-soft text-ink-600 transition hover:bg-slate-50 hover:text-ink-900"
            aria-label={t('settings.composer.addFiles')}
          >
            <Paperclip className="h-5 w-5" />
          </button>
          {pendingFiles.length ? (
            <div className="text-sm text-ink-400">{t('settings.composer.filesSelected', { count: pendingFiles.length })}</div>
          ) : null}
        </div>

        <div className="flex items-center gap-6">
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
          <Button
            type="button"
            onClick={() => void onCreate()}
            disabled={!draft.title.trim() || !draft.projectId || createPending}
            className="h-14 rounded-full px-8 text-lg"
          >
            {createPending ? t('issues.actions.creating') : t('issues.actions.create')}
          </Button>
        </div>
      </div>
    </div>
  );
}

function FullCreateView({
  draft,
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
              value={draft.tags}
              onChange={(event) => onDraftChange((current) => (current ? { ...current, tags: event.target.value } : current))}
              placeholder={t('settings.composer.tagsPlaceholder')}
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
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  emptyLabel?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex h-11 items-center gap-2 rounded-full border border-border-soft bg-white px-4 text-[15px] font-medium text-ink-700 shadow-sm transition hover:bg-slate-50"
        >
          <span>{label || emptyLabel}</span>
          <ChevronDown className="h-4 w-4 text-ink-300" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-56">
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {emptyLabel ? <DropdownMenuRadioItem value="__empty__">{emptyLabel}</DropdownMenuRadioItem> : null}
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LabelsPill({
  label,
  tags,
  selectedTags,
  onToggle,
  t,
}: {
  label: string;
  tags: IssueTagRecord[];
  selectedTags: string[];
  onToggle: (name: string) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex h-11 items-center gap-2 rounded-full border border-border-soft bg-white px-4 text-[15px] font-medium text-ink-700 shadow-sm transition hover:bg-slate-50"
        >
          <Tag className="h-4 w-4 text-ink-400" />
          <span>{label}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-56">
        {tags.length ? (
          tags.map((tag) => (
            <DropdownMenuCheckboxItem key={tag.id} checked={selectedTags.includes(tag.name)} onCheckedChange={() => onToggle(tag.name)}>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tag.color ?? '#94a3b8' }} />
                {tag.name}
              </span>
            </DropdownMenuCheckboxItem>
          ))
        ) : (
          <DropdownMenuItem disabled>{t('settings.composer.noLabels')}</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function QuickActionsPill({
  templates,
  locale,
  pageHref,
  onApplyTemplate,
  onSaveLocalDraft,
  t,
}: {
  templates: IssueTemplate[];
  locale: Locale;
  pageHref: string;
  onApplyTemplate: (templateId: number) => void;
  onSaveLocalDraft: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border-soft bg-white text-ink-700 shadow-sm transition hover:bg-slate-50"
        >
          <span className="text-xl leading-none">...</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-56">
        <DropdownMenuItem asChild>
          <Link href={pageHref}>{t('settings.composer.openFullCreate')}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={localizePath(locale, '/drafts')}>{t('issues.actions.openDrafts')}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onSaveLocalDraft}>{t('settings.composer.saveLocalDraft')}</DropdownMenuItem>
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

function toggleName(raw: string, name: string) {
  const values = raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  const next = values.includes(name) ? values.filter((item) => item !== name) : [...values, name];
  return next.join(', ');
}
