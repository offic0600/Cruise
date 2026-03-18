'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
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
import { localizePath } from '@/i18n/config';
import { useI18n } from '@/i18n/useI18n';
import { createTeamMember, deleteTeamMember, getTeamMembers, updateTeamMember } from '@/lib/api';

interface TeamMember {
  id: number;
  name: string;
  email: string | null;
  role: string;
  skills: string | null;
  teamId: number | null;
  createdAt: string;
}

const roleOptions = ['DEVELOPER', 'TESTER', 'PM', 'LEAD', 'ARCHITECT'] as const;
const memberSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().or(z.literal('')),
  role: z.enum(roleOptions),
  skills: z.string().optional(),
  teamId: z.number().nullable(),
});

type MemberValues = z.infer<typeof memberSchema>;

export default function TeamMembersPage() {
  const { locale, t } = useI18n();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TeamMember | null>(null);

  const membersQuery = useQuery({
    queryKey: ['team-members'],
    queryFn: () => getTeamMembers(),
  });

  const members = useMemo(() => {
    const data = Array.isArray(membersQuery.data) ? (membersQuery.data as TeamMember[]) : [];
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter((item) =>
      item.name.toLowerCase().includes(q) ||
      item.email?.toLowerCase().includes(q) ||
      item.role.toLowerCase().includes(q) ||
      item.skills?.toLowerCase().includes(q)
    );
  }, [membersQuery.data, search]);

  const form = useForm<MemberValues>({
    resolver: zodResolver(memberSchema),
    values: editingItem
      ? {
          name: editingItem.name,
          email: editingItem.email ?? '',
          role: editingItem.role as MemberValues['role'],
          skills: editingItem.skills ?? '',
          teamId: editingItem.teamId,
        }
      : {
          name: '',
          email: '',
          role: 'DEVELOPER',
          skills: '',
          teamId: null,
        },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: MemberValues) => {
      const payload = {
        name: values.name,
        email: values.email || undefined,
        role: values.role,
        skills: values.skills || undefined,
        teamId: values.teamId ?? undefined,
      };
      return editingItem ? updateTeamMember(editingItem.id, payload) : createTeamMember(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['team-members'] });
      setEditorOpen(false);
      setEditingItem(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTeamMember(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['team-members'] });
    },
  });

  const submit = form.handleSubmit(async (values) => {
    await saveMutation.mutateAsync(values);
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-ink-900">{t('teamMembers.title')}</h1>
            <p className="mt-2 text-sm text-ink-700">{t('teamMembers.subtitle')}</p>
          </div>
          <div className="flex gap-3">
            <Link
              href={localizePath(locale, '/teams/current/settings/templates')}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-border-soft bg-white px-4 text-sm font-medium text-ink-700 transition hover:bg-slate-50"
            >
              {t('teamMembers.issueSettings')}
            </Link>
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('common.search')} className="w-72" />
            <Button onClick={() => { setEditingItem(null); setEditorOpen(true); }} className="gap-2">
              <Plus className="h-4 w-4" />
              {t('teamMembers.newItem')}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {membersQuery.isLoading ? (
            <Card className="section-panel md:col-span-2 xl:col-span-3"><CardContent className="p-10 text-center text-ink-400">{t('common.loading')}</CardContent></Card>
          ) : members.length ? (
            members.map((item) => (
              <Card key={item.id} className="section-panel">
                <CardContent className="p-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="brand-badge flex h-12 w-12 items-center justify-center rounded-card text-lg font-semibold">
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-base font-semibold text-ink-900">{item.name}</div>
                        <div className="mt-1 text-sm text-ink-700">{item.email ?? t('common.notSet')}</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge>{t(`teamMembers.roleLabel.${item.role}`)}</Badge>
                          {item.teamId != null && <Badge variant="brand">#{item.teamId}</Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setEditingItem(item); setEditorOpen(true); }}>
                        {t('common.edit')}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(item.id)}>
                        {t('common.delete')}
                      </Button>
                    </div>
                  </div>
                  {item.skills && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.skills.split(',').map((skill, index) => (
                        <Badge key={`${skill}-${index}`} variant="neutral">{skill.trim()}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="section-panel md:col-span-2 xl:col-span-3">
              <CardContent className="p-10 text-center">
                <div className="text-lg text-ink-700">{t('teamMembers.empty')}</div>
                <div className="mt-2 text-sm text-ink-400">{t('teamMembers.emptyHint')}</div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Sheet open={editorOpen} onOpenChange={(open) => { setEditorOpen(open); if (!open) setEditingItem(null); }}>
        <SheetContent className="max-w-xl">
          <SheetHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-ink-400">{editingItem?.name ?? t('teamMembers.newItem')}</div>
                <SheetTitle className="mt-2">{editingItem ? t('teamMembers.editItem') : t('teamMembers.newItem')}</SheetTitle>
              </div>
              <SheetDismissButton aria-label={t('common.cancel')} />
            </div>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-120px)]">
            <form className="space-y-4 px-6 py-6" onSubmit={submit}>
              <Field label={t('teamMembers.fields.name')}>
                <Input {...form.register('name')} />
              </Field>
              <Field label={t('teamMembers.fields.email')}>
                <Input type="email" {...form.register('email')} />
              </Field>
              <Field label={t('teamMembers.fields.role')}>
                <Select value={form.watch('role')} onValueChange={(value) => form.setValue('role', value as MemberValues['role'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => <SelectItem key={role} value={role}>{t(`teamMembers.roleLabel.${role}`)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label={t('teamMembers.fields.skills')}>
                <Textarea {...form.register('skills')} placeholder={t('teamMembers.fields.skillsPlaceholder')} />
              </Field>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setEditorOpen(false)}>{t('common.cancel')}</Button>
                <Button type="submit" disabled={saveMutation.isPending}>{t('common.save')}</Button>
              </div>
            </form>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-sm font-medium text-ink-700">{label}</div>
      {children}
    </label>
  );
}
