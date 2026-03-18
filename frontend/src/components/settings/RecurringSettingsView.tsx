'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/i18n/useI18n';
import { createRecurringIssue, deleteRecurringIssue, getIssueTemplates, getProjects, getRecurringIssues, triggerRecurringIssue } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import { queryKeys } from '@/lib/query/keys';

export default function RecurringSettingsView() {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const user = getStoredUser();
  const organizationId = user?.organizationId ?? 1;
  const recurringQuery = useQuery({ queryKey: queryKeys.recurringIssues, queryFn: getRecurringIssues });
  const templatesQuery = useQuery({ queryKey: queryKeys.issueTemplates({ organizationId }), queryFn: () => getIssueTemplates({ organizationId }) });
  const projectsQuery = useQuery({ queryKey: queryKeys.projects, queryFn: () => getProjects({ organizationId }) });
  const [form, setForm] = useState({ name: '', projectId: '', templateId: '', nextRunAt: '' });

  const createMutation = useMutation({
    mutationFn: createRecurringIssue,
    onSuccess: async () => {
      setForm({ name: '', projectId: '', templateId: '', nextRunAt: '' });
      await queryClient.invalidateQueries({ queryKey: queryKeys.recurringIssues });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteRecurringIssue,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.recurringIssues });
    },
  });
  const triggerMutation = useMutation({
    mutationFn: triggerRecurringIssue,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
  });

  return (
    <div className="space-y-6">
      <section className="space-y-3 rounded-3xl border border-border-soft bg-white p-5">
        <div>
          <div className="text-sm font-semibold text-ink-900">{t('settings.recurring.title')}</div>
          <p className="mt-1 text-sm text-ink-500">{t('settings.recurring.subtitle')}</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Input placeholder="Name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
          <Input type="datetime-local" value={form.nextRunAt} onChange={(event) => setForm((current) => ({ ...current, nextRunAt: event.target.value }))} />
          <select className="h-10 rounded-xl border border-border-soft px-3" value={form.projectId} onChange={(event) => setForm((current) => ({ ...current, projectId: event.target.value }))}>
            <option value="">Select project</option>
            {(projectsQuery.data ?? []).map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
          </select>
          <select className="h-10 rounded-xl border border-border-soft px-3" value={form.templateId} onChange={(event) => setForm((current) => ({ ...current, templateId: event.target.value }))}>
            <option value="">Optional template</option>
            {(templatesQuery.data ?? []).map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
          </select>
          <div className="md:col-span-2 flex justify-end">
            <Button onClick={() => createMutation.mutate({
              organizationId,
              name: form.name,
              projectId: Number(form.projectId),
              templateId: form.templateId ? Number(form.templateId) : null,
              nextRunAt: new Date(form.nextRunAt).toISOString().slice(0, 19),
            })} disabled={!form.name.trim() || !form.projectId || !form.nextRunAt}>
              {t('settings.recurring.create')}
            </Button>
          </div>
        </div>
      </section>

      <div className="space-y-3">
        {(recurringQuery.data ?? []).map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-3xl border border-border-soft bg-white p-5">
            <div>
              <div className="font-semibold text-ink-900">{item.name}</div>
              <div className="mt-1 text-sm text-ink-500">{t('settings.recurring.nextRun', { value: item.nextRunAt })}</div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => triggerMutation.mutate(item.id)}>{t('settings.recurring.runNow')}</Button>
              <Button variant="secondary" onClick={() => deleteMutation.mutate(item.id)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
