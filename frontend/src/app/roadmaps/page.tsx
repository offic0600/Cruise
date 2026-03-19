'use client';

import { useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Project, Roadmap } from '@/lib/api';
import { usePlanningHubMutations, useRoadmapProjects, useRoadmapsWorkspace } from '@/lib/query/planning-hub';

export default function RoadmapsPage() {
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
          <h1 className="text-3xl font-semibold text-ink-900">Roadmaps</h1>
          <p className="mt-2 text-sm text-ink-700">Roadmaps organize project sequencing and presentation.</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <section className="space-y-3">
            <Card className="section-panel">
              <CardHeader className="p-0 pb-4"><CardTitle>New roadmap</CardTitle></CardHeader>
              <CardContent className="space-y-3 p-0">
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Roadmap name" />
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
                <Button
                  className="w-full"
                  onClick={async () => {
                    if (!name.trim()) return;
                    await createRoadmapMutation.mutateAsync({ name: name.trim(), description: description || null });
                    setName('');
                    setDescription('');
                  }}
                >
                  Create roadmap
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
                <div className={`mt-3 text-sm ${selected?.id === roadmap.id ? 'text-slate-300' : 'text-ink-700'}`}>{roadmap.description ?? 'No description'}</div>
              </button>
            ))}
          </section>

          <section className="space-y-6">
            {selected ? (
              <>
                <div className="grid gap-4 md:grid-cols-4">
                  <Metric label="Owner" value={selected.ownerId ? `#${selected.ownerId}` : 'Not set'} />
                  <Metric label="Color" value={selected.color ?? 'Not set'} />
                  <Metric label="Sort order" value={String(selected.sortOrder)} />
                  <Metric label="Projects" value={String(attachedProjects.length)} />
                </div>

                <Card className="section-panel">
                  <CardHeader className="p-0 pb-4"><CardTitle>Attach projects</CardTitle></CardHeader>
                  <CardContent className="space-y-3 p-0">
                    <Input value={projectId} onChange={(e) => setProjectId(e.target.value)} placeholder="Project ID" />
                    <Button
                      onClick={async () => {
                        if (!selected || !projectId) return;
                        await attachRoadmapProjectMutation.mutateAsync({ roadmapId: selected.id, data: { projectId: Number(projectId) } });
                        setProjectId('');
                      }}
                    >
                      Attach project
                    </Button>
                    <div className="text-xs text-ink-400">Available: {projects.map((item) => `${item.id}:${item.name}`).join(' | ')}</div>
                  </CardContent>
                </Card>

                <Panel title="Roadmap projects">
                  {attachedProjects.length ? attachedProjects.map(({ relation, project }) => (
                    <div key={relation.id} className="drawer-panel flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-ink-900">{project?.name}</div>
                        <div className="mt-1 text-xs text-ink-400">#{project?.id} · sort {relation.sortOrder}</div>
                      </div>
                      <Button variant="secondary" onClick={() => selected && deleteRoadmapProjectMutation.mutate({ roadmapId: selected.id, relationId: relation.id })}>Detach</Button>
                    </div>
                  )) : <Empty label="No attached projects" />}
                </Panel>
              </>
            ) : <Card className="section-panel p-10 text-center text-ink-400">No roadmaps</Card>}
          </section>
        </div>
      </div>
    </AppLayout>
  );
}

function Metric({ label, value }: { label: string; value: string }) { return <Card className="metric-card"><CardContent className="p-0"><div className="text-sm text-ink-700">{label}</div><div className="mt-3 text-xl font-semibold text-ink-900">{value}</div></CardContent></Card>; }
function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <Card className="section-panel"><CardHeader className="p-0 pb-4"><CardTitle>{title}</CardTitle></CardHeader><CardContent className="space-y-3 p-0">{children}</CardContent></Card>; }
function Empty({ label }: { label: string }) { return <div className="text-sm text-ink-400">{label}</div>; }
