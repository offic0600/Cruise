'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Edit3, Plus } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDismissButton, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { localizePath } from '@/i18n/config';
import { useI18n } from '@/i18n/useI18n';
import type { Project } from '@/lib/api';
import { useProjectMutations, useProjectsWorkspace } from '@/lib/query/projects';
import { projectFormSchema, type ProjectFormValues } from '@/lib/forms/project';

const statuses = ['PLANNED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED'] as const;

export default function ProjectsPage() {
  const { locale, t } = useI18n();
  const [q, setQ] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const { projectsQuery, issuesQuery, epicsQuery, sprintsQuery, docsQuery, activityQuery } = useProjectsWorkspace();
  const { createProjectMutation, updateProjectMutation } = useProjectMutations();

  const projects = useMemo(
    () => ((projectsQuery.data ?? []) as Project[]).filter((project) => !q || project.name.toLowerCase().includes(q.toLowerCase())),
    [projectsQuery.data, q]
  );

  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? projects[0] ?? null;
  const projectIssues = ((issuesQuery.data ?? []) as any[]).filter((issue) => issue.projectId === selectedProject?.id);
  const projectSprints = ((sprintsQuery.data ?? []) as any[]).filter((sprint) => sprint.projectId === selectedProject?.id);
  const projectDocs = ((docsQuery.data ?? []) as any[]).filter((doc) => doc.projectId === selectedProject?.id);
  const projectEpics = ((epicsQuery.data ?? []) as any[]).filter((epic) => epic.projectId === selectedProject?.id);
  const projectActivity = ((activityQuery.data ?? []) as any[]).filter((event) => projectIssues.some((issue) => issue.id === event.entityId)).slice(0, 8);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    values: editingProject
      ? {
          organizationId: editingProject.organizationId,
          teamId: editingProject.teamId,
          key: editingProject.key ?? '',
          name: editingProject.name,
          description: editingProject.description ?? '',
          status: editingProject.status as ProjectFormValues['status'],
          ownerId: editingProject.ownerId,
          startDate: editingProject.startDate,
          targetDate: editingProject.targetDate,
        }
      : {
          organizationId: projects[0]?.organizationId ?? 1,
          teamId: projects[0]?.teamId ?? null,
          key: '',
          name: '',
          description: '',
          status: 'ACTIVE',
          ownerId: null,
          startDate: null,
          targetDate: null,
        },
  });

  const submit = form.handleSubmit(async (values) => {
    if (editingProject) {
      await updateProjectMutation.mutateAsync({
        id: editingProject.id,
        data: {
          teamId: values.teamId ?? null,
          key: values.key,
          name: values.name,
          description: values.description || null,
          status: values.status,
          ownerId: values.ownerId ?? null,
          startDate: values.startDate || null,
          targetDate: values.targetDate || null,
        },
      });
    } else {
      await createProjectMutation.mutateAsync({
        organizationId: values.organizationId,
        teamId: values.teamId ?? null,
        key: values.key,
        name: values.name,
        description: values.description || null,
        status: values.status,
        ownerId: values.ownerId ?? null,
        startDate: values.startDate || null,
        targetDate: values.targetDate || null,
      });
    }
    setEditorOpen(false);
    setEditingProject(null);
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-ink-900">{t('projects.title')}</h1>
            <p className="mt-2 text-sm text-ink-700">{t('projects.subtitle')}</p>
          </div>
          <div className="flex gap-3">
            <Input value={q} onChange={(event) => setQ(event.target.value)} placeholder={t('projects.searchPlaceholder')} className="w-72" />
            <Button className="gap-2" onClick={() => { setEditingProject(null); setEditorOpen(true); }}>
              <Plus className="h-4 w-4" />
              {t('projects.actions.new')}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <section className="space-y-3">
            {projects.map((project) => (
              <div
                key={project.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedProjectId(project.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedProjectId(project.id);
                  }
                }}
                className={`w-full rounded-panel border p-5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${selectedProject?.id === project.id ? 'border-ink-900 bg-ink-900 text-white shadow-nav' : 'border-border-subtle bg-surface-raised text-ink-900 shadow-card hover:bg-slate-50'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] opacity-70">{project.key ?? `#${project.id}`}</div>
                    <div className="mt-2 text-lg font-semibold">{project.name}</div>
                    <div className={`mt-2 text-sm ${selectedProject?.id === project.id ? 'text-slate-300' : 'text-ink-700'}`}>{project.description ?? t('common.empty')}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={selectedProject?.id === project.id ? 'text-white hover:bg-white/10 hover:text-white' : ''}
                    onClick={(event) => {
                      event.stopPropagation();
                      setEditingProject(project);
                      setEditorOpen(true);
                    }}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
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

      <Sheet open={editorOpen} onOpenChange={(open) => { setEditorOpen(open); if (!open) setEditingProject(null); }}>
        <SheetContent className="max-w-xl">
          <SheetHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-ink-400">{editingProject?.key ?? t('projects.actions.new')}</div>
                <SheetTitle className="mt-2">{editingProject ? t('projects.actions.edit') : t('projects.actions.new')}</SheetTitle>
              </div>
              <SheetDismissButton aria-label={t('common.cancel')} />
            </div>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-120px)]">
            <form className="space-y-4 px-6 py-6" onSubmit={submit}>
              <Field label={t('projects.fields.key')}><Input {...form.register('key')} /></Field>
              <Field label={t('projects.fields.name')}><Input {...form.register('name')} /></Field>
              <Field label={t('projects.fields.description')}><Textarea {...form.register('description')} /></Field>
              <Field label={t('projects.fields.status')}>
                <Select value={form.watch('status')} onValueChange={(value) => form.setValue('status', value as ProjectFormValues['status'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{statuses.map((status) => <SelectItem key={status} value={status}>{t(`projects.status.${status}`)}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label={t('projects.fields.startDate')}><Input type="date" {...form.register('startDate')} /></Field>
                <Field label={t('projects.fields.targetDate')}><Input type="date" {...form.register('targetDate')} /></Field>
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setEditorOpen(false)}>{t('common.cancel')}</Button>
                <Button type="submit" disabled={createProjectMutation.isPending || updateProjectMutation.isPending}>{t('common.save')}</Button>
              </div>
            </form>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}

function Metric({ label, value }: { label: string; value: number }) { return <Card className="metric-card"><CardContent className="p-0"><div className="text-sm text-ink-700">{label}</div><div className="mt-3 text-3xl font-semibold text-ink-900">{value}</div></CardContent></Card>; }
function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <Card className="section-panel"><CardHeader className="p-0 pb-4"><CardTitle>{title}</CardTitle></CardHeader><CardContent className="space-y-3 p-0">{children}</CardContent></Card>; }
function Empty({ label }: { label: string }) { return <div className="text-sm text-ink-400">{label}</div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><div className="mb-1.5 text-sm font-medium text-ink-700">{label}</div>{children}</label>; }
