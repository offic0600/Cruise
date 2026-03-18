'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import AppLayout from '@/components/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useViewsWorkspace } from '@/lib/query/views';
import { useI18n } from '@/i18n/useI18n';
import { localizePath } from '@/i18n/config';

type ViewId = 'my-work' | 'current-sprint' | 'high-priority' | 'done-recently';

export default function ViewsPage() {
  const { locale, t } = useI18n();
  const [q, setQ] = useState('');
  const [activeView, setActiveView] = useState<ViewId>('my-work');
  const { issuesQuery, projectsQuery, sprintsQuery } = useViewsWorkspace();

  const issues = issuesQuery.data ?? [];
  const projects = projectsQuery.data ?? [];
  const activeSprintIds = (sprintsQuery.data ?? []).filter((sprint) => sprint.status === 'ACTIVE').map((sprint) => sprint.id);

  const viewItems = useMemo(() => {
    const scoped = issues.filter((issue) => !q || issue.title.toLowerCase().includes(q.toLowerCase()) || issue.identifier.toLowerCase().includes(q.toLowerCase()));
    switch (activeView) {
      case 'current-sprint': return scoped.filter((issue) => issue.sprintId && activeSprintIds.includes(issue.sprintId));
      case 'high-priority': return scoped.filter((issue) => issue.priority === 'HIGH' || issue.priority === 'URGENT');
      case 'done-recently': return scoped.filter((issue) => issue.state === 'DONE').slice(0, 12);
      default: return scoped.filter((issue) => issue.assigneeId != null || issue.reporterId != null);
    }
  }, [activeSprintIds, activeView, issues, q]);

  const presets: Array<{ id: ViewId; title: string; description: string }> = [
    { id: 'my-work', title: t('views.presets.myWork.title'), description: t('views.presets.myWork.description') },
    { id: 'current-sprint', title: t('views.presets.currentSprint.title'), description: t('views.presets.currentSprint.description') },
    { id: 'high-priority', title: t('views.presets.highPriority.title'), description: t('views.presets.highPriority.description') },
    { id: 'done-recently', title: t('views.presets.doneRecently.title'), description: t('views.presets.doneRecently.description') },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-ink-900">{t('views.title')}</h1>
          <p className="mt-2 text-sm text-ink-700">{t('views.subtitle')}</p>
        </div>

        <Card className="filter-bar">
          <CardContent className="p-0">
            <Input value={q} onChange={(event) => setQ(event.target.value)} placeholder={t('views.searchPlaceholder')} />
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <section className="space-y-3">
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => setActiveView(preset.id)}
                className={`w-full rounded-panel border p-5 text-left transition ${activeView === preset.id ? 'border-brand-600 bg-brand-600 text-white shadow-brand' : 'border-border-subtle bg-surface-raised text-ink-900 shadow-card hover:bg-slate-50'}`}
              >
                <div className="text-base font-semibold">{preset.title}</div>
                <div className={`mt-2 text-sm ${activeView === preset.id ? 'text-blue-100' : 'text-ink-700'}`}>{preset.description}</div>
              </button>
            ))}
          </section>

          <Card className="section-panel">
            <CardHeader className="border-b border-border-subtle p-0 pb-4">
              <CardTitle>{presets.find((preset) => preset.id === activeView)?.title}</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-slate-100 p-0">
              {viewItems.length ? viewItems.map((item) => (
                <Link key={item.id} href={`${localizePath(locale, '/issues')}?type=${item.type}`} className="grid gap-3 px-1 py-4 md:grid-cols-[minmax(0,1.6fr)_repeat(4,minmax(0,1fr))]">
                  <div><div className="font-medium text-ink-900">{item.title}</div><div className="mt-1 text-xs text-ink-400">{item.identifier}</div></div>
                  <div className="text-sm text-ink-700">{t(`issues.type.${item.type}`)}</div>
                  <div className="text-sm text-ink-700">{projects.find((project) => project.id === item.projectId)?.name ?? `#${item.projectId}`}</div>
                  <div><Badge>{t(`common.status.${item.state}`)}</Badge></div>
                  <div><Badge variant={item.priority === 'URGENT' ? 'danger' : item.priority === 'HIGH' ? 'warning' : 'neutral'}>{t(`common.priority.${item.priority}`)}</Badge></div>
                  <div className="text-sm text-ink-700">{item.progress}%</div>
                </Link>
              )) : <div className="px-1 py-14 text-center text-ink-400">{t('views.empty')}</div>}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
