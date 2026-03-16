'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import AppLayout from '@/components/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/i18n/useI18n';
import { localizePath } from '@/i18n/config';
import { getActivityEvents, getDocs, getEpics, getIssues, getProjects, getSprints } from '@/lib/api';

export default function ProjectsPage() {
  const { locale, t } = useI18n();
  const [q, setQ] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const projectsQuery = useQuery({ queryKey: ['projects'], queryFn: () => getProjects() });
  const issuesQuery = useQuery({ queryKey: ['projects', 'issues'], queryFn: () => getIssues() });
  const epicsQuery = useQuery({ queryKey: ['projects', 'epics'], queryFn: () => getEpics() });
  const sprintsQuery = useQuery({ queryKey: ['projects', 'sprints'], queryFn: () => getSprints() });
  const docsQuery = useQuery({ queryKey: ['projects', 'docs'], queryFn: () => getDocs() });
  const activityQuery = useQuery({ queryKey: ['projects', 'activity'], queryFn: () => getActivityEvents() });

  const projects = useMemo(
    () => (projectsQuery.data ?? []).filter((project) => !q || project.name.toLowerCase().includes(q.toLowerCase())),
    [projectsQuery.data, q]
  );

  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? projects[0] ?? null;
  const projectIssues = (issuesQuery.data ?? []).filter((issue) => issue.projectId === selectedProject?.id);
  const projectSprints = (sprintsQuery.data ?? []).filter((sprint) => sprint.projectId === selectedProject?.id);
  const projectDocs = (docsQuery.data ?? []).filter((doc) => doc.projectId === selectedProject?.id);
  const projectEpics = (epicsQuery.data ?? []).filter((epic) => epic.projectId === selectedProject?.id);
  const projectActivity = (activityQuery.data ?? []).filter((event) => projectIssues.some((issue) => issue.id === event.entityId)).slice(0, 8);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-ink-900">{t('projects.title')}</h1>
          <p className="mt-2 text-sm text-ink-700">{t('projects.subtitle')}</p>
        </div>

        <Card className="filter-bar">
          <CardContent className="p-0">
            <Input value={q} onChange={(event) => setQ(event.target.value)} placeholder={t('projects.searchPlaceholder')} />
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <section className="space-y-3">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => setSelectedProjectId(project.id)}
                className={`w-full rounded-panel border p-5 text-left transition ${selectedProject?.id === project.id ? 'border-ink-900 bg-ink-900 text-white shadow-nav' : 'border-border-subtle bg-surface-raised text-ink-900 shadow-card hover:bg-slate-50'}`}
              >
                <div className="text-xs uppercase tracking-[0.18em] opacity-70">{project.key ?? `#${project.id}`}</div>
                <div className="mt-2 text-lg font-semibold">{project.name}</div>
                <div className={`mt-2 text-sm ${selectedProject?.id === project.id ? 'text-slate-300' : 'text-ink-700'}`}>{project.description ?? t('common.empty')}</div>
              </button>
            ))}
          </section>

          <section className="space-y-6">
            {selectedProject ? (
              <>
                <div className="grid gap-4 md:grid-cols-4">
                  <Metric label={t('projects.metrics.issues')} value={projectIssues.length} />
                  <Metric label={t('projects.metrics.epics')} value={projectEpics.length} />
                  <Metric label={t('projects.metrics.sprints')} value={projectSprints.length} />
                  <Metric label={t('projects.metrics.docs')} value={projectDocs.length} />
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                  <Panel title={t('projects.panels.workItems')}>
                    {projectIssues.length ? projectIssues.map((issue) => (
                      <Link key={issue.id} href={`${localizePath(locale, '/issues')}?projectId=${selectedProject.id}`} className="drawer-panel block">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-sm font-medium text-ink-900">{issue.title}</div>
                            <div className="mt-1 text-xs text-ink-400">{issue.identifier}</div>
                          </div>
                          <Badge>{t(`common.status.${issue.state}`)}</Badge>
                        </div>
                      </Link>
                    )) : <Empty label={t('projects.empty.workItems')} />}
                  </Panel>
                  <Panel title={t('projects.panels.sprints')}>
                    {projectSprints.length ? projectSprints.map((sprint) => <div key={sprint.id} className="drawer-panel"><div className="text-sm font-medium text-ink-900">{sprint.name}</div><div className="mt-1 text-xs text-ink-400">{sprint.startDate} - {sprint.endDate}</div></div>) : <Empty label={t('projects.empty.sprints')} />}
                  </Panel>
                  <Panel title={t('projects.panels.docs')}>
                    {projectDocs.length ? projectDocs.map((doc) => <div key={doc.id} className="drawer-panel"><div className="text-sm font-medium text-ink-900">{doc.title}</div><div className="mt-1 text-xs text-ink-400">{doc.slug}</div></div>) : <Empty label={t('projects.empty.docs')} />}
                  </Panel>
                  <Panel title={t('projects.panels.activity')}>
                    {projectActivity.length ? projectActivity.map((event) => <div key={event.id} className="drawer-panel"><div className="text-sm font-medium text-ink-900">{event.summary}</div><div className="mt-1 text-xs text-ink-400">{new Date(event.createdAt).toLocaleString(locale === 'en' ? 'en-US' : 'zh-CN')}</div></div>) : <Empty label={t('projects.empty.activity')} />}
                  </Panel>
                </div>
              </>
            ) : (
              <Card className="section-panel p-10 text-center text-ink-400">{t('projects.empty.projects')}</Card>
            )}
          </section>
        </div>
      </div>
    </AppLayout>
  );
}

function Metric({ label, value }: { label: string; value: number }) { return <Card className="metric-card"><CardContent className="p-0"><div className="text-sm text-ink-700">{label}</div><div className="mt-3 text-3xl font-semibold text-ink-900">{value}</div></CardContent></Card>; }
function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <Card className="section-panel"><CardHeader className="p-0 pb-4"><CardTitle>{title}</CardTitle></CardHeader><CardContent className="space-y-3 p-0">{children}</CardContent></Card>; }
function Empty({ label }: { label: string }) { return <div className="text-sm text-ink-400">{label}</div>; }
