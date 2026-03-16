'use client';

import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { useI18n } from '@/i18n/useI18n';
import { Issue, Project, Sprint, getIssues, getProjects, getSprints } from '@/lib/api';

type ViewId = 'my-work' | 'current-sprint' | 'high-priority' | 'done-recently';

export default function ViewsPage() {
  const { t } = useI18n();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [activeView, setActiveView] = useState<ViewId>('my-work');

  useEffect(() => {
    void Promise.all([getIssues(), getProjects(), getSprints()]).then(([issueList, projectList, sprintList]) => {
      setIssues(issueList);
      setProjects(projectList);
      setSprints(sprintList);
    });
  }, []);

  const currentSprintIds = useMemo(
    () => sprints.filter((item) => item.status === 'ACTIVE').map((item) => item.id),
    [sprints]
  );

  const viewItems = useMemo(() => {
    switch (activeView) {
      case 'current-sprint':
        return issues.filter((item) => item.sprintId && currentSprintIds.includes(item.sprintId));
      case 'high-priority':
        return issues.filter((item) => item.priority === 'HIGH' || item.priority === 'URGENT');
      case 'done-recently':
        return issues.filter((item) => item.state === 'DONE').slice(0, 12);
      case 'my-work':
      default:
        return issues.filter((item) => item.assigneeId != null || item.reporterId != null);
    }
  }, [activeView, currentSprintIds, issues]);

  const presets: Array<{ id: ViewId; title: string; description: string }> = [
    { id: 'my-work', title: t('views.presets.myWork.title'), description: t('views.presets.myWork.description') },
    { id: 'current-sprint', title: t('views.presets.currentSprint.title'), description: t('views.presets.currentSprint.description') },
    { id: 'high-priority', title: t('views.presets.highPriority.title'), description: t('views.presets.highPriority.description') },
    { id: 'done-recently', title: t('views.presets.doneRecently.title'), description: t('views.presets.doneRecently.description') },
  ];

  const getProjectName = (projectId: number) => projects.find((item) => item.id === projectId)?.name ?? `#${projectId}`;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-ink-900">{t('views.title')}</h1>
          <p className="mt-2 text-sm text-ink-700">{t('views.subtitle')}</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <section className="space-y-3">
            {presets.map((preset) => {
              const active = preset.id === activeView;
              return (
                <button
                  key={preset.id}
                  onClick={() => setActiveView(preset.id)}
                  className={`w-full rounded-panel border p-5 text-left transition ${
                    active
                      ? 'border-brand-600 bg-brand-600 text-white shadow-brand'
                      : 'border-border-subtle bg-surface-raised text-ink-900 shadow-card hover:bg-slate-50'
                  }`}
                >
                  <div className="text-base font-semibold">{preset.title}</div>
                  <div className={`mt-2 text-sm ${active ? 'text-blue-100' : 'text-ink-700'}`}>{preset.description}</div>
                </button>
              );
            })}
          </section>

          <section className="panel-card">
            <div className="border-b border-border-subtle px-5 py-4">
              <div className="text-sm font-medium text-ink-900">
                {presets.find((preset) => preset.id === activeView)?.title}
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {viewItems.map((item) => (
                <div key={item.id} className="grid gap-3 px-5 py-4 md:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))]">
                  <div>
                    <div className="font-medium text-ink-900">{item.title}</div>
                    <div className="mt-1 text-xs text-ink-400">{item.identifier}</div>
                  </div>
                  <div className="text-sm text-ink-700">{t(`issues.type.${item.type}`)}</div>
                  <div className="text-sm text-ink-700">{getProjectName(item.projectId)}</div>
                  <div className="text-sm text-ink-700">{t(`common.status.${item.state}`)}</div>
                  <div className="text-sm text-ink-700">{t(`common.priority.${item.priority}`)}</div>
                  <div className="text-sm text-ink-700">{item.progress}%</div>
                </div>
              ))}
              {viewItems.length === 0 && (
                <div className="px-5 py-14 text-center text-ink-400">{t('views.empty')}</div>
              )}
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
