'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/i18n/useI18n';
import { createEmailIntakeConfig, deleteEmailIntakeConfig, getEmailIntakeConfigs, getIssueTemplates, getProjects, getTeams } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import { queryKeys } from '@/lib/query/keys';

export default function EmailIntakeSettingsView() {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const user = getStoredUser();
  const organizationId = user?.organizationId ?? 1;
  const configsQuery = useQuery({ queryKey: queryKeys.emailIntakeConfigs, queryFn: getEmailIntakeConfigs });
  const projectsQuery = useQuery({ queryKey: queryKeys.projects, queryFn: () => getProjects({ organizationId }), select: (response) => response.items });
  const teamsQuery = useQuery({ queryKey: queryKeys.teams, queryFn: () => getTeams({ organizationId }) });
  const templatesQuery = useQuery({ queryKey: queryKeys.issueTemplates({ organizationId }), queryFn: () => getIssueTemplates({ organizationId }) });
  const [form, setForm] = useState({ name: '', emailAddress: '', projectId: '', teamId: '', templateId: '' });
  const [feedback, setFeedback] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: createEmailIntakeConfig,
    onSuccess: async () => {
      setForm({ name: '', emailAddress: '', projectId: '', teamId: '', templateId: '' });
      setFeedback('Email intake route saved.');
      await queryClient.invalidateQueries({ queryKey: queryKeys.emailIntakeConfigs });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteEmailIntakeConfig,
    onSuccess: async () => {
      setFeedback('Email intake route deleted.');
      await queryClient.invalidateQueries({ queryKey: queryKeys.emailIntakeConfigs });
    },
  });
  const configs = configsQuery.data ?? [];
  const isSaving = createMutation.isPending || deleteMutation.isPending;
  const formReady = Boolean(form.name.trim() && form.emailAddress.trim());
  const targetPreview = [
    form.projectId ? `Project #${form.projectId}` : null,
    form.teamId ? `Team #${form.teamId}` : null,
    form.templateId ? `Template #${form.templateId}` : null,
  ].filter(Boolean).join(' / ') || 'Workspace fallback';

  return (
    <div className="space-y-6">
      <section className="space-y-5 rounded-3xl border border-border-soft bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-ink-900">{t('settings.emailIntake.title')}</div>
            <p className="mt-1 text-sm text-ink-500">{t('settings.emailIntake.subtitle')}</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-ink-600">
            {configs.length} routes
          </span>
        </div>
        <div className="rounded-2xl border border-border-soft">
          <div className="border-b border-border-soft px-4 py-3">
            <div className="text-sm font-medium text-ink-900">Routing rule</div>
            <div className="text-xs text-ink-500">Convert incoming email into issues with optional template defaults.</div>
          </div>
          <div className="grid gap-3 p-4 md:grid-cols-2">
            <Input disabled={isSaving} placeholder="Config name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
            <Input disabled={isSaving} placeholder="team@example.com" value={form.emailAddress} onChange={(event) => setForm((current) => ({ ...current, emailAddress: event.target.value }))} />
            <select disabled={isSaving} className="h-10 rounded-xl border border-border-soft px-3 disabled:opacity-60" value={form.projectId} onChange={(event) => setForm((current) => ({ ...current, projectId: event.target.value }))}>
              <option value="">Project</option>
              {(projectsQuery.data ?? []).map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
            </select>
            <select disabled={isSaving} className="h-10 rounded-xl border border-border-soft px-3 disabled:opacity-60" value={form.teamId} onChange={(event) => setForm((current) => ({ ...current, teamId: event.target.value }))}>
              <option value="">Team</option>
              {(teamsQuery.data ?? []).map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
            </select>
            <div className="md:col-span-2">
              <select disabled={isSaving} className="h-10 w-full rounded-xl border border-border-soft px-3 disabled:opacity-60" value={form.templateId} onChange={(event) => setForm((current) => ({ ...current, templateId: event.target.value }))}>
                <option value="">Optional template</option>
                {(templatesQuery.data ?? []).map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <SettingsSignalCard label="Route state" value={formReady ? 'Ready to save' : 'Needs name and email'} />
          <SettingsSignalCard label="Target" value={targetPreview} />
          <SettingsSignalCard label="Routes" value={String(configs.length)} />
        </div>
        <div className="flex flex-col gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div>Email intake routes are team-scoped and can target a project, team, and template.</div>
            {feedback ? <div className="mt-1 font-medium text-emerald-700">{feedback}</div> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setFeedback(`Preview: ${form.emailAddress || 'email'} -> ${targetPreview}`)}>
              Preview
            </Button>
            <Button onClick={() => createMutation.mutate({
              organizationId,
              name: form.name,
              emailAddress: form.emailAddress,
              projectId: form.projectId ? Number(form.projectId) : null,
              teamId: form.teamId ? Number(form.teamId) : null,
              templateId: form.templateId ? Number(form.templateId) : null,
            })} disabled={!form.name.trim() || !form.emailAddress.trim() || createMutation.isPending}>
              {createMutation.isPending ? t('settings.shared.saving') : t('settings.emailIntake.create')}
            </Button>
          </div>
        </div>
      </section>

      {configsQuery.isLoading ? (
        <section className="rounded-3xl border border-dashed border-border-soft bg-slate-50 p-8 text-sm text-ink-500">
          {t('settings.shared.loading')}
        </section>
      ) : configs.length === 0 ? (
        <section className="flex items-center justify-between gap-4 rounded-3xl border border-border-soft bg-white p-5 text-sm">
          <div>
            <div className="font-medium text-ink-900">No email intake routes</div>
            <div className="mt-1 text-ink-500">Create a route to turn incoming email into issues.</div>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-ink-500">New route</span>
        </section>
      ) : (
        <div className="space-y-3">
        {configs.map((config) => (
          <div key={config.id} className="flex items-center justify-between rounded-3xl border border-border-soft bg-white p-5">
            <div>
              <div className="font-semibold text-ink-900">{config.name}</div>
              <div className="mt-1 text-sm text-ink-500">{config.emailAddress}</div>
            </div>
            <Button variant="secondary" onClick={() => deleteMutation.mutate(config.id)} disabled={deleteMutation.isPending}>{t('settings.shared.delete')}</Button>
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
