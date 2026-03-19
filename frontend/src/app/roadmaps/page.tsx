'use client';

import { useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useI18n } from '@/i18n/useI18n';
import type { Project, Roadmap } from '@/lib/api';
import { usePlanningHubMutations, useRoadmapProjects, useRoadmapsWorkspace } from '@/lib/query/planning-hub';

export default function RoadmapsPage() {
  const { t } = useI18n();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const { roadmapsQuery, projectsQuery } = useRoadmapsWorkspace();
  const { createRoadmapMutation, attachRoadmapProjectMutation, deleteRoadmapProjectMutation } = usePlanningHubMutations();

  const roadmaps = (roadmapsQuery.data ?? []) as Roadmap[];
  const projects = (projectsQuery.data ?? []) as Project[];
  const selected = roadmaps.find((item) => item.id === selectedId) ?? roadmaps[0] ?? null;
  const roadmapProjectsQuery = useRoadmapProjects(selected?.id ?? null);
  const roadmapProjects = roadmapProjectsQuery.data ?? [];

  const attachedProjects = useMemo(
    () => roadmapProjects.map((relation) => ({ relation, project: projects.find((item) => item.id === relation.projectId) })).filter((item) => item.project),
    [roadmapProjects, projects]
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-ink-900">{t('roadmaps.title')}</h1>
          <p className="mt-2 text-sm text-ink-700">{t('roadmaps.subtitle')}</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <section className="space-y-3">
            <Card className="section-panel">
              <CardHeader className="p-0 pb-4"><CardTitle>{t('roadmaps.panels.newRoadmap')}</CardTitle></CardHeader>
              <CardContent className="space-y-3 p-0">
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('roadmaps.fields.name')} />
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('roadmaps.fields.description')} />
                <Button
                  className="w-full"
                  onClick={async () => {
                    if (!name.trim()) return;
                    await createRoadmapMutation.mutateAsync({ name: name.trim(), description: description || null });
                    setName('');
                    setDescription('');
                  }}
                >
                  {t('roadmaps.actions.create')}
                </Button>
              </CardContent>
            </Card>

            {roadmaps.map((roadmap) => (
              <button
                key={roadmap.id}
                type="button"
                onClick={() => setSelectedId(roadmap.id)}
                className={`w-full rounded-panel border p-5 text-left transition ${selected?.id === roadmap.id ? 'border-ink-900 bg-ink-900 text-white shadow-nav' : 'border-border-subtle bg-surface-raised text-ink-900 shadow-card hover:bg-slate-50'}`}
              >
                <div className="text-sm font-semibold">{roadmap.name}</div>
                <div className={`mt-2 text-xs ${selected?.id === roadmap.id ? 'text-slate-300' : 'text-ink-400'}`}>{roadmap.slugId ?? `#${roadmap.id}`}</div>
                <div className={`mt-3 text-sm ${selected?.id === roadmap.id ? 'text-slate-300' : 'text-ink-700'}`}>{roadmap.description ?? t('roadmaps.empty.noDescription')}</div>
              </button>
            ))}
          </section>

          <section className="space-y-6">
            {selected ? (
              <>
                <div className="grid gap-4 md:grid-cols-4">
                  <Metric label={t('roadmaps.metrics.owner')} value={selected.ownerId ? `#${selected.ownerId}` : t('roadmaps.empty.notSet')} />
                  <Metric label={t('roadmaps.metrics.color')} value={selected.color ?? t('roadmaps.empty.notSet')} />
                  <Metric label={t('roadmaps.metrics.sortOrder')} value={String(selected.sortOrder)} />
                  <Metric label={t('roadmaps.metrics.projects')} value={String(attachedProjects.length)} />
                </div>

                <Card className="section-panel">
                  <CardHeader className="p-0 pb-4"><CardTitle>{t('roadmaps.panels.attachProjects')}</CardTitle></CardHeader>
                  <CardContent className="space-y-3 p-0">
                    <Input value={projectId} onChange={(e) => setProjectId(e.target.value)} placeholder={t('roadmaps.fields.projectId')} />
                    <Button
                      onClick={async () => {
                        if (!selected || !projectId) return;
                        await attachRoadmapProjectMutation.mutateAsync({ roadmapId: selected.id, data: { projectId: Number(projectId) } });
                        setProjectId('');
                      }}
                    >
                      {t('roadmaps.actions.attachProject')}
                    </Button>
                    <div className="text-xs text-ink-400">{t('roadmaps.hints.availableProjects', { value: projects.map((item) => `${item.id}:${item.name}`).join(' | ') })}</div>
                  </CardContent>
                </Card>

                <Panel title={t('roadmaps.panels.roadmapProjects')}>
                  {attachedProjects.length ? attachedProjects.map(({ relation, project }) => (
                    <div key={relation.id} className="drawer-panel flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-ink-900">{project?.name}</div>
                        <div className="mt-1 text-xs text-ink-400">#{project?.id} / {t('roadmaps.hints.relationSortOrder', { value: relation.sortOrder })}</div>
                      </div>
                      <Button variant="secondary" onClick={() => selected && deleteRoadmapProjectMutation.mutate({ roadmapId: selected.id, relationId: relation.id })}>{t('roadmaps.actions.detachProject')}</Button>
                    </div>
                  )) : <Empty label={t('roadmaps.empty.projects')} />}
                </Panel>
              </>
            ) : <Card className="section-panel p-10 text-center text-ink-400">{t('roadmaps.empty.roadmaps')}</Card>}
          </section>
        </div>
      </div>
    </AppLayout>
  );
}

function Metric({ label, value }: { label: string; value: string }) { return <Card className="metric-card"><CardContent className="p-0"><div className="text-sm text-ink-700">{label}</div><div className="mt-3 text-xl font-semibold text-ink-900">{value}</div></CardContent></Card>; }
function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <Card className="section-panel"><CardHeader className="p-0 pb-4"><CardTitle>{title}</CardTitle></CardHeader><CardContent className="space-y-3 p-0">{children}</CardContent></Card>; }
function Empty({ label }: { label: string }) { return <div className="text-sm text-ink-400">{label}</div>; }
