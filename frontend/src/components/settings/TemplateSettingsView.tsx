'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useI18n } from '@/i18n/useI18n';
import { createIssueTemplate, deleteIssueTemplate, getIssueTemplates, getProjects, getTeams, type IssueTemplate } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import { queryKeys } from '@/lib/query/keys';

function formatScope(projectId: number | null, teamId: number | null) {
  if (projectId) {
    return `Project #${projectId}`;
  }
  if (teamId) {
    return `Team #${teamId}`;
  }
  return 'Workspace';
}

export default function TemplateSettingsView() {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const user = getStoredUser();
  const organizationId = user?.organizationId ?? 1;
  const templatesQuery = useQuery({ queryKey: queryKeys.issueTemplates({ organizationId }), queryFn: () => getIssueTemplates({ organizationId }) });
  const projectsQuery = useQuery({ queryKey: queryKeys.projects, queryFn: () => getProjects({ organizationId }), select: (response) => response.items });
  const teamsQuery = useQuery({ queryKey: queryKeys.teams, queryFn: () => getTeams({ organizationId }) });
  const [form, setForm] = useState({ name: '', title: '', description: '', projectId: '', teamId: '' });
  const [feedback, setFeedback] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: createIssueTemplate,
    onSuccess: async () => {
      setForm({ name: '', title: '', description: '', projectId: '', teamId: '' });
      setFeedback('Template saved and available from issue create.');
      await queryClient.invalidateQueries({ queryKey: queryKeys.issueTemplates({ organizationId }) });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteIssueTemplate,
    onSuccess: async () => {
      setFeedback('Template removed.');
      await queryClient.invalidateQueries({ queryKey: queryKeys.issueTemplates({ organizationId }) });
    },
  });

  const templates = templatesQuery.data ?? [];
  const isSaving = createMutation.isPending || deleteMutation.isPending;
  const formReady = form.name.trim().length > 0;
  const scopePreview = formatScope(form.projectId ? Number(form.projectId) : null, form.teamId ? Number(form.teamId) : null);

  return (
    <div className="space-y-6">
      <section className="space-y-5 rounded-3xl border border-border-soft bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-ink-900">{t('settings.templates.title')}</div>
            <p className="mt-1 text-sm text-ink-500">{t('settings.templates.subtitle')}</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-ink-600">
            {t('settings.templates.count', { count: templates.length })}
          </span>
        </div>
        <div className="rounded-2xl border border-border-soft">
          <div className="border-b border-border-soft px-4 py-3">
            <div className="text-sm font-medium text-ink-900">Template details</div>
            <div className="text-xs text-ink-500">Define the default issue content and where it appears.</div>
          </div>
          <div className="grid gap-3 p-4 md:grid-cols-2">
            <Input disabled={isSaving} placeholder={t('settings.templates.fields.name')} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
            <Input disabled={isSaving} placeholder={t('settings.templates.fields.title')} value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
            <select disabled={isSaving} className="h-10 rounded-xl border border-border-soft px-3 disabled:opacity-60" value={form.projectId} onChange={(event) => setForm((current) => ({ ...current, projectId: event.target.value }))}>
              <option value="">{t('settings.templates.fields.project')}</option>
              {(projectsQuery.data ?? []).map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
            </select>
            <select disabled={isSaving} className="h-10 rounded-xl border border-border-soft px-3 disabled:opacity-60" value={form.teamId} onChange={(event) => setForm((current) => ({ ...current, teamId: event.target.value }))}>
              <option value="">{t('settings.templates.fields.team')}</option>
              {(teamsQuery.data ?? []).map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
            </select>
            <div className="md:col-span-2">
              <Textarea disabled={isSaving} placeholder={t('settings.templates.fields.description')} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="min-h-[120px]" />
            </div>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <SettingsSignalCard label="Scope" value={scopePreview} />
          <SettingsSignalCard label="Template state" value={formReady ? 'Ready to save' : 'Needs a name'} />
          <SettingsSignalCard label="Create menu" value={form.title.trim() ? 'Title preset' : 'Description only'} />
        </div>
        <div className="flex flex-col gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div>{t('settings.templates.helper')}</div>
            {feedback ? <div className="mt-1 font-medium text-emerald-700">{feedback}</div> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setFeedback(`Preview: ${form.name || 'Untitled template'} -> ${scopePreview}`)}>
              Preview
            </Button>
            <Button onClick={() => createMutation.mutate({
              organizationId,
              name: form.name,
              title: form.title || null,
              description: form.description || null,
              projectId: form.projectId ? Number(form.projectId) : null,
              teamId: form.teamId ? Number(form.teamId) : null,
            })} disabled={!form.name.trim() || createMutation.isPending}>
              {createMutation.isPending ? t('settings.shared.saving') : t('settings.templates.create')}
            </Button>
          </div>
        </div>
      </section>

      {templatesQuery.isLoading ? (
        <section className="rounded-3xl border border-dashed border-border-soft bg-slate-50 p-8 text-sm text-ink-500">
          {t('settings.shared.loading')}
        </section>
      ) : templates.length === 0 ? (
        <section className="flex items-center justify-between gap-4 rounded-3xl border border-border-soft bg-white p-5 text-sm">
          <div>
            <div className="font-medium text-ink-900">No issue templates</div>
            <div className="mt-1 text-ink-500">{t('settings.templates.empty')}</div>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-ink-500">New template</span>
        </section>
      ) : (
        <div className="space-y-3">
          {templates.map((template: IssueTemplate) => (
            <div key={template.id} className="rounded-3xl border border-border-soft bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <div>
                    <div className="text-lg font-semibold text-ink-900">{template.name}</div>
                    <div className="mt-1 text-sm text-ink-500">{template.title || t('settings.templates.untitled')}</div>
                  </div>
                  <div className="text-sm text-ink-600">{template.description || t('settings.templates.noDescription')}</div>
                  <div className="flex flex-wrap gap-2 text-xs text-ink-500">
                    <span className="rounded-full bg-slate-100 px-3 py-1">{formatScope(template.projectId, template.teamId)}</span>
                    {template.updatedAt ? (
                      <span className="rounded-full bg-slate-100 px-3 py-1">{t('settings.shared.updatedAt', { value: template.updatedAt })}</span>
                    ) : null}
                  </div>
                </div>
                <Button variant="secondary" onClick={() => deleteMutation.mutate(template.id)} disabled={deleteMutation.isPending}>
                  {t('settings.shared.delete')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsSignalCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border-soft bg-white px-4 py-3">
      <div className="text-[11px] uppercase tracking-[0.16em] text-ink-400">{label}</div>
      <div className="mt-1 truncate text-sm font-medium text-ink-800">{value}</div>
    </div>
  );
}
