'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { z } from 'zod';
import AppLayout from '@/components/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDismissButton, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { useI18n } from '@/i18n/useI18n';
import { addExternalSkill, createSkill, deleteSkill, getSkillAnalytics, getSkills, updateSkill } from '@/lib/api';

interface Skill {
  id: number;
  name: string;
  description: string;
  category: string;
  status: string;
  intentPatterns?: string;
  parameters?: string;
  outputSchema?: string;
  executionCount: number;
  successRate: number;
  avgExecutionTimeMs: number;
  version?: string;
}

const categories = ['ANALYSIS', 'TASK_MANAGEMENT', 'RISK_MANAGEMENT', 'TEAM_MANAGEMENT', 'EVOLUTION', 'VISUALIZATION', 'HELPER', 'GENERAL', 'EXTERNAL'] as const;
const skillSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(categories),
  intentPatterns: z.string().optional(),
  parameters: z.string().optional(),
  outputSchema: z.string().optional(),
  externalUrl: z.string().optional(),
  apiKey: z.string().optional(),
});
type SkillValues = z.infer<typeof skillSchema>;

export default function SkillsPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [showModal, setShowModal] = useState<'create' | 'edit' | 'external' | null>(null);
  const [search, setSearch] = useState('');

  const skillsQuery = useQuery({ queryKey: ['skills'], queryFn: () => getSkills() });
  const analyticsQuery = useQuery({
    queryKey: ['skills', selectedSkill?.name, 'analytics'],
    queryFn: () => getSkillAnalytics(selectedSkill!.name),
    enabled: !!selectedSkill,
  });

  const skills = useMemo(() => {
    const list = Array.isArray(skillsQuery.data) ? (skillsQuery.data as Skill[]) : [];
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter((skill) => skill.name.toLowerCase().includes(q) || skill.description.toLowerCase().includes(q));
  }, [search, skillsQuery.data]);

  const form = useForm<SkillValues>({
    resolver: zodResolver(skillSchema),
    values: showModal === 'edit' && selectedSkill
      ? {
          name: selectedSkill.name,
          description: selectedSkill.description,
          category: selectedSkill.category as SkillValues['category'],
          intentPatterns: selectedSkill.intentPatterns ?? '',
          parameters: selectedSkill.parameters ?? '',
          outputSchema: selectedSkill.outputSchema ?? '',
          externalUrl: '',
          apiKey: '',
        }
      : {
          name: '',
          description: '',
          category: showModal === 'external' ? 'EXTERNAL' : 'GENERAL',
          intentPatterns: '',
          parameters: '',
          outputSchema: '',
          externalUrl: '',
          apiKey: '',
        },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: SkillValues) => {
      if (showModal === 'external') {
        return addExternalSkill({
          name: values.name,
          description: values.description,
          category: values.category,
          externalUrl: values.externalUrl || '',
          apiKey: values.apiKey || undefined,
        });
      }
      if (showModal === 'edit' && selectedSkill) {
        return updateSkill(selectedSkill.name, {
          description: values.description,
          category: values.category,
          intentPatterns: values.intentPatterns || '',
          parameters: values.parameters || undefined,
          outputSchema: values.outputSchema || undefined,
        });
      }
      return createSkill({
        name: values.name,
        description: values.description,
        category: values.category,
        intentPatterns: values.intentPatterns || '',
        parameters: values.parameters || undefined,
        outputSchema: values.outputSchema || undefined,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['skills'] });
      if (selectedSkill) {
        await queryClient.invalidateQueries({ queryKey: ['skills', selectedSkill.name, 'analytics'] });
      }
      setShowModal(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (name: string) => deleteSkill(name),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['skills'] });
      setSelectedSkill(null);
    },
  });

  const submit = form.handleSubmit(async (values) => {
    await saveMutation.mutateAsync(values);
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <h1 className="text-3xl font-semibold text-ink-900">{t('skills.title')}</h1>
          <div className="flex gap-3">
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('common.search')} className="w-72" />
            <Button variant="secondary" onClick={() => setShowModal('external')}>{t('skills.addExternal')}</Button>
            <Button className="gap-2" onClick={() => setShowModal('create')}><Plus className="h-4 w-4" />{t('skills.addCustom')}</Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <Card className="section-panel">
            <CardHeader className="p-0 pb-4"><CardTitle>{t('skills.available', { count: skills.length })}</CardTitle></CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[620px] pr-3">
                <div className="space-y-3">
                  {skills.map((skill) => (
                    <button
                      key={skill.id}
                      onClick={() => setSelectedSkill(skill)}
                      className={`w-full rounded-card border p-4 text-left transition ${selectedSkill?.id === skill.id ? 'border-brand-600 bg-brand-600/5' : 'border-border-soft bg-white hover:bg-slate-50'}`}
                    >
                      <div className="font-medium text-ink-900">{skill.name}</div>
                      <div className="mt-1 text-sm text-ink-700">{skill.description}</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge>{t(`skills.categories.${skill.category}`)}</Badge>
                        <Badge variant={skill.status === 'ACTIVE' ? 'success' : 'neutral'}>{t(`skills.statuses.${skill.status}`)}</Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="section-panel">
            {selectedSkill ? (
              <>
                <CardHeader className="flex flex-row items-start justify-between gap-4 p-0 pb-4">
                  <div>
                    <CardTitle>{selectedSkill.name}</CardTitle>
                    <div className="mt-2 text-sm text-ink-700">{selectedSkill.description}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setShowModal('edit')}>{t('common.edit')}</Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(selectedSkill.name)}>{t('common.delete')}</Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 p-0">
                  <div className="grid gap-4 md:grid-cols-4">
                    <Metric label={t('skills.fields.category')} value={t(`skills.categories.${selectedSkill.category}`)} />
                    <Metric label={t('skills.fields.status')} value={t(`skills.statuses.${selectedSkill.status}`)} />
                    <Metric label={t('skills.fields.version')} value={selectedSkill.version || '1.0.0'} />
                    <Metric label={t('skills.fields.executions')} value={String(selectedSkill.executionCount)} />
                  </div>
                  <FieldBlock label={t('skills.fields.intentPatterns')} value={selectedSkill.intentPatterns || '-'} />
                  {selectedSkill.parameters && <FieldBlock label={t('skills.fields.parameters')} value={selectedSkill.parameters} />}
                  {selectedSkill.outputSchema && <FieldBlock label={t('skills.fields.outputSchema')} value={selectedSkill.outputSchema} />}
                  {analyticsQuery.data && (
                    <div className="grid gap-4 md:grid-cols-4">
                      <Metric label={t('skills.analytics.totalExecutions')} value={String(analyticsQuery.data.executionCount)} />
                      <Metric label={t('skills.analytics.successRate')} value={`${(analyticsQuery.data.successRate * 100).toFixed(0)}%`} />
                      <Metric label={t('skills.analytics.avgExecutionTime')} value={`${analyticsQuery.data.avgExecutionTimeMs}ms`} />
                      <Metric label={t('skills.analytics.successCount')} value={String(analyticsQuery.data.successCount)} />
                    </div>
                  )}
                </CardContent>
              </>
            ) : (
              <CardContent className="p-10 text-center text-ink-400">{t('skills.emptySelection')}</CardContent>
            )}
          </Card>
        </div>
      </div>

      <Sheet open={showModal !== null} onOpenChange={(open) => !open && setShowModal(null)}>
        <SheetContent className="max-w-xl">
          <SheetHeader>
            <div className="flex items-start justify-between gap-4">
              <div><SheetTitle>{showModal ? t(`skills.modal.${showModal}`) : ''}</SheetTitle></div>
              <SheetDismissButton aria-label={t('common.cancel')} />
            </div>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-120px)]">
            <form className="space-y-4 px-6 py-6" onSubmit={submit}>
              {showModal !== 'edit' && <Field label={t('skills.fields.name')}><Input {...form.register('name')} /></Field>}
              <Field label={t('skills.fields.description')}><Textarea {...form.register('description')} /></Field>
              <Field label={t('skills.fields.category')}>
                <Select value={form.watch('category')} onValueChange={(value) => form.setValue('category', value as SkillValues['category'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map((category) => <SelectItem key={category} value={category}>{t(`skills.categories.${category}`)}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              {showModal === 'external' ? (
                <>
                  <Field label={t('skills.fields.externalUrl')}><Input {...form.register('externalUrl')} /></Field>
                  <Field label={t('skills.fields.apiKey')}><Input type="password" {...form.register('apiKey')} placeholder={t('skills.fields.apiKeyPlaceholder')} /></Field>
                </>
              ) : (
                <>
                  <Field label={t('skills.fields.intentPatterns')}><Input {...form.register('intentPatterns')} placeholder={t('skills.fields.intentPatternsPlaceholder')} /></Field>
                  <Field label={t('skills.fields.parameters')}><Textarea {...form.register('parameters')} /></Field>
                  <Field label={t('skills.fields.outputSchema')}><Textarea {...form.register('outputSchema')} /></Field>
                </>
              )}
              <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setShowModal(null)}>{t('common.cancel')}</Button>
                <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? t('skills.modal.submitting') : t('common.submit')}</Button>
              </div>
            </form>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><div className="mb-1.5 text-sm font-medium text-ink-700">{label}</div>{children}</label>;
}
function Metric({ label, value }: { label: string; value: string }) {
  return <Card className="drawer-panel"><div className="meta-label">{label}</div><div className="mt-2 text-sm font-medium text-ink-900">{value}</div></Card>;
}
function FieldBlock({ label, value }: { label: string; value: string }) {
  return <div><div className="text-sm font-medium text-ink-700">{label}</div><pre className="mt-2 whitespace-pre-wrap rounded-card border border-border-soft bg-surface-soft p-4 text-sm text-ink-700">{value}</pre></div>;
}
