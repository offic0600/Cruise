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

export default function TemplateSettingsView() {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const user = getStoredUser();
  const organizationId = user?.organizationId ?? 1;
  const templatesQuery = useQuery({ queryKey: queryKeys.issueTemplates({ organizationId }), queryFn: () => getIssueTemplates({ organizationId }) });
  const projectsQuery = useQuery({ queryKey: queryKeys.projects, queryFn: () => getProjects({ organizationId }) });
  const teamsQuery = useQuery({ queryKey: queryKeys.teams, queryFn: () => getTeams({ organizationId }) });
  const [form, setForm] = useState({ name: '', title: '', description: '', projectId: '', teamId: '' });

  const createMutation = useMutation({
    mutationFn: createIssueTemplate,
    onSuccess: async () => {
      setForm({ name: '', title: '', description: '', projectId: '', teamId: '' });
      await queryClient.invalidateQueries({ queryKey: queryKeys.issueTemplates({ organizationId }) });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteIssueTemplate,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.issueTemplates({ organizationId }) });
    },
  });

  return (
    <div className="space-y-6">
      <section className="space-y-3 rounded-3xl border border-border-soft bg-white p-5">
        <div>
          <div className="text-sm font-semibold text-ink-900">{t('settings.templates.title')}</div>
          <p className="mt-1 text-sm text-ink-500">{t('settings.templates.subtitle')}</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Input placeholder="Template name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
          <Input placeholder="Default issue title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
          <select className="h-10 rounded-xl border border-border-soft px-3" value={form.projectId} onChange={(event) => setForm((current) => ({ ...current, projectId: event.target.value }))}>
            <option value="">Select project</option>
            {(projectsQuery.data ?? []).map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
          </select>
          <select className="h-10 rounded-xl border border-border-soft px-3" value={form.teamId} onChange={(event) => setForm((current) => ({ ...current, teamId: event.target.value }))}>
            <option value="">Select team</option>
            {(teamsQuery.data ?? []).map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
          </select>
          <div className="md:col-span-2">
            <Textarea placeholder="Template description" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="min-h-[120px]" />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button onClick={() => createMutation.mutate({
              organizationId,
              name: form.name,
              title: form.title || null,
              description: form.description || null,
              projectId: form.projectId ? Number(form.projectId) : null,
              teamId: form.teamId ? Number(form.teamId) : null,
            })} disabled={!form.name.trim()}>
              {t('settings.templates.create')}
            </Button>
          </div>
        </div>
      </section>

      <div className="space-y-3">
        {(templatesQuery.data ?? []).map((template: IssueTemplate) => (
          <div key={template.id} className="rounded-3xl border border-border-soft bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-semibold text-ink-900">{template.name}</div>
                <div className="mt-1 text-sm text-ink-500">{template.title || 'Untitled template'}</div>
                <div className="mt-2 text-sm text-ink-600">{template.description || 'No description'}</div>
              </div>
              <Button variant="secondary" onClick={() => deleteMutation.mutate(template.id)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
