'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useI18n } from '@/i18n/useI18n';
import { createRecurringIssue, deleteRecurringIssue, getProjects, getRecurringIssues, triggerRecurringIssue, type RecurringIssueDefinition } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import { queryKeys } from '@/lib/query/keys';

export default function RecurringSettingsView() {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const user = getStoredUser();
  const organizationId = user?.organizationId ?? 1;
  const recurringQuery = useQuery({ queryKey: queryKeys.recurringIssues, queryFn: () => getRecurringIssues() });
  const projectsQuery = useQuery({ queryKey: queryKeys.projects, queryFn: () => getProjects({ organizationId }), select: (response) => response.items });
  const [form, setForm] = useState({ name: '', title: '', description: '', projectId: '', nextRunAt: '' });

  const refresh = async () => queryClient.invalidateQueries({ queryKey: queryKeys.recurringIssues });

  const createMutation = useMutation({ mutationFn: createRecurringIssue, onSuccess: refresh });
  const triggerMutation = useMutation({ mutationFn: triggerRecurringIssue, onSuccess: refresh });
  const deleteMutation = useMutation({ mutationFn: deleteRecurringIssue, onSuccess: refresh });

  const recurring = recurringQuery.data ?? [];

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-3xl border border-border-soft bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-ink-900">{t('settings.recurring.title')}</div>
            <p className="mt-1 text-sm text-ink-500">{t('settings.recurring.subtitle')}</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-ink-600">
            {t('settings.recurring.count', { count: recurring.length })}
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Input placeholder={t('settings.recurring.fields.name')} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
          <Input placeholder={t('settings.recurring.fields.title')} value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
          <select className="h-10 rounded-xl border border-border-soft px-3" value={form.projectId} onChange={(event) => setForm((current) => ({ ...current, projectId: event.target.value }))}>
            <option value="">{t('settings.recurring.fields.project')}</option>
            {(projectsQuery.data ?? []).map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
          </select>
          <Input type="datetime-local" placeholder={t('settings.recurring.fields.nextRun')} value={form.nextRunAt} onChange={(event) => setForm((current) => ({ ...current, nextRunAt: event.target.value }))} />
          <div className="md:col-span-2">
            <Textarea placeholder={t('settings.recurring.fields.description')} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="min-h-[120px]" />
          </div>
          <div className="md:col-span-2 flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-ink-500">
            <span>{t('settings.recurring.helper')}</span>
            <Button
              onClick={() =>
                createMutation.mutate({
                  organizationId,
                  projectId: Number(form.projectId),
                  name: form.name,
                  title: form.title || null,
                  description: form.description || null,
                  nextRunAt: new Date(form.nextRunAt).toISOString(),
                })
              }
              disabled={!form.name.trim() || !form.projectId || !form.nextRunAt || createMutation.isPending}
            >
              {createMutation.isPending ? t('settings.shared.saving') : t('settings.recurring.create')}
            </Button>
          </div>
        </div>
      </section>

      {recurringQuery.isLoading ? (
        <section className="rounded-3xl border border-dashed border-border-soft bg-slate-50 p-8 text-sm text-ink-500">
          {t('settings.shared.loading')}
        </section>
      ) : recurring.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-border-soft bg-slate-50 p-8 text-sm text-ink-500">
          {t('settings.recurring.empty')}
        </section>
      ) : (
        <div className="space-y-3">
          {recurring.map((item: RecurringIssueDefinition) => (
            <div key={item.id} className="rounded-3xl border border-border-soft bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <div>
                    <div className="text-lg font-semibold text-ink-900">{item.name}</div>
                    <div className="mt-1 text-sm text-ink-500">{item.title || t('settings.recurring.untitled')}</div>
                  </div>
                  <div className="text-sm text-ink-600">{item.description || t('settings.recurring.noDescription')}</div>
                  <div className="flex flex-wrap gap-2 text-xs text-ink-500">
                    <span className="rounded-full bg-slate-100 px-3 py-1">{t('settings.recurring.nextRun', { value: item.nextRunAt })}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">{item.active ? t('settings.shared.active') : t('settings.shared.inactive')}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => triggerMutation.mutate(item.id)} disabled={triggerMutation.isPending}>
                    {t('settings.recurring.runNow')}
                  </Button>
                  <Button variant="secondary" onClick={() => deleteMutation.mutate(item.id)} disabled={deleteMutation.isPending}>
                    {t('settings.shared.delete')}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
