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

  const createMutation = useMutation({
    mutationFn: createEmailIntakeConfig,
    onSuccess: async () => {
      setForm({ name: '', emailAddress: '', projectId: '', teamId: '', templateId: '' });
      await queryClient.invalidateQueries({ queryKey: queryKeys.emailIntakeConfigs });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteEmailIntakeConfig,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.emailIntakeConfigs });
    },
  });

  return (
    <div className="space-y-6">
      <section className="space-y-3 rounded-3xl border border-border-soft bg-white p-5">
        <div>
          <div className="text-sm font-semibold text-ink-900">{t('settings.emailIntake.title')}</div>
          <p className="mt-1 text-sm text-ink-500">{t('settings.emailIntake.subtitle')}</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Input placeholder="Config name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
          <Input placeholder="team@example.com" value={form.emailAddress} onChange={(event) => setForm((current) => ({ ...current, emailAddress: event.target.value }))} />
          <select className="h-10 rounded-xl border border-border-soft px-3" value={form.projectId} onChange={(event) => setForm((current) => ({ ...current, projectId: event.target.value }))}>
            <option value="">Project</option>
            {(projectsQuery.data ?? []).map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
          </select>
          <select className="h-10 rounded-xl border border-border-soft px-3" value={form.teamId} onChange={(event) => setForm((current) => ({ ...current, teamId: event.target.value }))}>
            <option value="">Team</option>
            {(teamsQuery.data ?? []).map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
          </select>
          <div className="md:col-span-2">
            <select className="h-10 w-full rounded-xl border border-border-soft px-3" value={form.templateId} onChange={(event) => setForm((current) => ({ ...current, templateId: event.target.value }))}>
              <option value="">Optional template</option>
              {(templatesQuery.data ?? []).map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
            </select>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button onClick={() => createMutation.mutate({
              organizationId,
              name: form.name,
              emailAddress: form.emailAddress,
              projectId: form.projectId ? Number(form.projectId) : null,
              teamId: form.teamId ? Number(form.teamId) : null,
              templateId: form.templateId ? Number(form.templateId) : null,
            })} disabled={!form.name.trim() || !form.emailAddress.trim()}>
              {t('settings.emailIntake.create')}
            </Button>
          </div>
        </div>
      </section>

      <div className="space-y-3">
        {(configsQuery.data ?? []).map((config) => (
          <div key={config.id} className="flex items-center justify-between rounded-3xl border border-border-soft bg-white p-5">
            <div>
              <div className="font-semibold text-ink-900">{config.name}</div>
              <div className="mt-1 text-sm text-ink-500">{config.emailAddress}</div>
            </div>
            <Button variant="secondary" onClick={() => deleteMutation.mutate(config.id)}>Delete</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
