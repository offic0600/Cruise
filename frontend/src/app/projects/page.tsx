'use client';

import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { useI18n } from '@/i18n/useI18n';
import { ActivityEvent, Doc, Epic, Issue, Project, Sprint, getActivityEvents, getDocs, getEpics, getIssues, getProjects, getSprints } from '@/lib/api';

export default function ProjectsPage() {
  const { locale, t } = useI18n();
  const [projects, setProjects] = useState<Project[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  useEffect(() => {
    void Promise.all([getProjects(), getIssues(), getEpics(), getSprints(), getDocs(), getActivityEvents()])
      .then(([projectList, issueList, epicList, sprintList, docList, activityList]) => {
        setProjects(projectList);
        setIssues(issueList);
        setEpics(epicList);
        setSprints(sprintList);
        setDocs(docList);
        setActivity(activityList);
        setSelectedProjectId(projectList[0]?.id ?? null);
      });
  }, []);

  const selectedProject = projects.find((item) => item.id === selectedProjectId) ?? null;
  const projectIssues = useMemo(() => issues.filter((item) => item.projectId === selectedProjectId), [issues, selectedProjectId]);
  const projectEpics = useMemo(() => epics.filter((item) => item.projectId === selectedProjectId), [epics, selectedProjectId]);
  const projectSprints = useMemo(() => sprints.filter((item) => item.projectId === selectedProjectId), [sprints, selectedProjectId]);
  const projectDocs = useMemo(() => docs.filter((item) => item.projectId === selectedProjectId), [docs, selectedProjectId]);
  const projectActivity = useMemo(
    () =>
      activity.filter(
        (item) =>
          item.entityType === 'ISSUE' &&
          projectIssues.some((issue) => issue.id === item.entityId)
      ),
    [activity, projectIssues]
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-ink-900">{t('projects.title')}</h1>
          <p className="mt-2 text-sm text-ink-700">{t('projects.subtitle')}</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <section className="space-y-3">
            {projects.map((project) => {
              const active = project.id === selectedProjectId;
              return (
                <button
                  key={project.id}
                  onClick={() => setSelectedProjectId(project.id)}
                  className={`w-full rounded-panel border p-5 text-left transition ${
                    active
                      ? 'border-ink-900 bg-ink-900 text-white shadow-nav'
                      : 'border-border-subtle bg-surface-raised text-ink-900 shadow-card hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs uppercase tracking-[0.2em] opacity-60">{project.key ?? `#${project.id}`}</div>
                  <div className="mt-2 text-lg font-semibold">{project.name}</div>
                  <div className={`mt-2 text-sm ${active ? 'text-slate-300' : 'text-ink-700'}`}>{project.description ?? t('common.empty')}</div>
                </button>
              );
            })}
          </section>

          <section className="space-y-6">
            {selectedProject ? (
              <>
                <div className="grid gap-4 md:grid-cols-4">
                  <MetricCard label={t('projects.metrics.issues')} value={projectIssues.length} />
                  <MetricCard label={t('projects.metrics.epics')} value={projectEpics.length} />
                  <MetricCard label={t('projects.metrics.sprints')} value={projectSprints.length} />
                  <MetricCard label={t('projects.metrics.docs')} value={projectDocs.length} />
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                  <Panel title={t('projects.panels.workItems')}>
                    <SimpleList
                      emptyLabel={t('projects.empty.workItems')}
                      items={projectIssues.map((item) => ({
                        title: item.title,
                        subtitle: `${item.identifier} · ${t(`common.status.${item.state}`)}`,
                      }))}
                    />
                  </Panel>
                  <Panel title={t('projects.panels.sprints')}>
                    <SimpleList
                      emptyLabel={t('projects.empty.sprints')}
                      items={projectSprints.map((item) => ({
                        title: item.name,
                        subtitle: `${item.startDate} - ${item.endDate}`,
                      }))}
                    />
                  </Panel>
                  <Panel title={t('projects.panels.docs')}>
                    <SimpleList
                      emptyLabel={t('projects.empty.docs')}
                      items={projectDocs.map((item) => ({
                        title: item.title,
                        subtitle: item.slug,
                      }))}
                    />
                  </Panel>
                  <Panel title={t('projects.panels.activity')}>
                    <SimpleList
                      emptyLabel={t('projects.empty.activity')}
                      items={projectActivity.slice(0, 8).map((item) => ({
                        title: item.summary,
                        subtitle: new Date(item.createdAt).toLocaleString(locale === 'en' ? 'en-US' : 'zh-CN'),
                      }))}
                    />
                  </Panel>
                </div>
              </>
            ) : (
              <div className="panel-card p-10 text-center text-ink-400">
                {t('projects.empty.projects')}
              </div>
            )}
          </section>
        </div>
      </div>
    </AppLayout>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="panel-card p-5">
      <div className="text-sm text-ink-700">{label}</div>
      <div className="mt-3 text-3xl font-semibold text-ink-900">{value}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="panel-card p-5">
      <h2 className="text-base font-semibold text-ink-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SimpleList({
  items,
  emptyLabel,
}: {
  items: Array<{ title: string; subtitle: string }>;
  emptyLabel: string;
}) {
  if (items.length === 0) {
    return <div className="text-sm text-ink-400">{emptyLabel}</div>;
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={`${item.title}-${index}`} className="subtle-card px-4 py-3">
          <div className="text-sm font-medium text-ink-900">{item.title}</div>
          <div className="mt-1 text-xs text-ink-700">{item.subtitle}</div>
        </div>
      ))}
    </div>
  );
}
