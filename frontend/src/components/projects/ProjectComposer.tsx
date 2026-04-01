'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, ChevronDown, Link2, Plus, Tag, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { getStoredUser } from '@/lib/auth';
import { createProject, createProjectMilestone, getLabels, getTeamMembers, getTeams } from '@/lib/api';
import type { Project } from '@/lib/api/types';
import { queryKeys } from '@/lib/query/keys';
import { useI18n } from '@/i18n/useI18n';
import { ProjectDatePickerPill } from './ProjectDatePickerPill';
import { ProjectLabelsSelectMenu } from './ProjectLabelsSelectMenu';
import { ProjectLeadSelectMenu } from './ProjectLeadSelectMenu';
import { ProjectPrioritySelectMenu } from './ProjectPrioritySelectMenu';
import { ProjectStatusSelectMenu } from './ProjectStatusSelectMenu';
import { ProjectTeamPill } from './ProjectTeamPill';
import {
  PROJECT_ICON_SWATCHES,
  type ProjectComposerPriority,
  type ProjectComposerStatus,
  type ProjectIconTone,
  ProjectIconPreview,
  getProjectInitials,
  projectLeadIcon,
  projectPriorityIcon,
  projectPriorityLabelKey,
  projectStatusIcon,
  projectStatusLabelKey,
} from './project-composer-utils';

type TeamMemberOption = {
  id: number;
  name: string;
  teamId?: number | null;
};

type ProjectMilestoneDraft = {
  id: string;
  name: string;
  targetDate: string | null;
};

export type ProjectComposerDraft = {
  teamId: string | null;
  name: string;
  summary: string;
  description: string;
  status: ProjectComposerStatus;
  priority: ProjectComposerPriority;
  ownerId: string | null;
  memberIds: string[];
  labelIds: string[];
  startDate: string | null;
  targetDate: string | null;
  icon: ProjectIconTone | null;
};

const emptyDraft = (teamId: number | null): ProjectComposerDraft => ({
  teamId: teamId ? String(teamId) : null,
  name: '',
  summary: '',
  description: '',
  status: 'PLANNED',
  priority: null,
  ownerId: null,
  memberIds: [],
  labelIds: [],
  startDate: null,
  targetDate: null,
  icon: 'slate',
});

function memberAvatar(name: string) {
  return (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-rose-100 bg-rose-100 text-[9px] font-semibold uppercase text-rose-600">
      {getProjectInitials(name)}
    </span>
  );
}

export function ProjectComposer({
  open,
  onOpenChange,
  organizationId,
  initialTeamId,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: number | null;
  initialTeamId: number | null;
  onCreated?: (project: Project) => void;
}) {
  const queryClient = useQueryClient();
  const { locale, t } = useI18n();
  const storedUser = getStoredUser();
  const [draft, setDraft] = useState<ProjectComposerDraft>(() => emptyDraft(initialTeamId));
  const [milestones, setMilestones] = useState<ProjectMilestoneDraft[]>([]);
  const [statusQuery, setStatusQuery] = useState('');
  const [priorityQuery, setPriorityQuery] = useState('');
  const [leadQuery, setLeadQuery] = useState('');
  const [teamQuery, setTeamQuery] = useState('');
  const [membersQuery, setMembersQuery] = useState('');
  const [iconOpen, setIconOpen] = useState(false);

  const teamsQuery = useQuery({
    queryKey: [queryKeys.teams, 'projects-composer', organizationId ?? 0],
    queryFn: () => getTeams({ organizationId: organizationId ?? undefined }),
    enabled: open && organizationId != null,
  });
  const membersQueryResult = useQuery({
    queryKey: ['project-composer-members', organizationId ?? 0, draft.teamId ?? 'none'],
    queryFn: () =>
      getTeamMembers({
        organizationId: organizationId ?? undefined,
        teamId: draft.teamId ? Number(draft.teamId) : undefined,
      }) as Promise<TeamMemberOption[]>,
    enabled: open && organizationId != null,
  });
  const labelsQuery = useQuery({
    queryKey: ['project-composer-labels', organizationId ?? 0, draft.teamId ?? 'none'],
    queryFn: () => getLabels({ organizationId: organizationId ?? undefined, teamId: draft.teamId ? Number(draft.teamId) : undefined }),
    enabled: open && organizationId != null,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const combinedDescription = [draft.summary.trim(), draft.description.trim()].filter(Boolean).join('\n\n') || null;
      const project = await createProject({
        organizationId: organizationId ?? undefined,
        teamId: draft.teamId ? Number(draft.teamId) : null,
        name: draft.name.trim(),
        description: combinedDescription,
        status: draft.status,
        priority: draft.priority,
        ownerId: draft.ownerId ? Number(draft.ownerId) : null,
        startDate: draft.startDate,
        targetDate: draft.targetDate,
      });

      for (const milestone of milestones) {
        if (!milestone.name.trim()) continue;
        await createProjectMilestone(project.id, {
          name: milestone.name.trim(),
          targetDate: milestone.targetDate,
          status: 'PLANNED',
        });
      }

      return project;
    },
    onSuccess: async (project) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.projects });
      onCreated?.(project);
      onOpenChange(false);
    },
  });

  useEffect(() => {
    if (!open) return;
    setDraft(emptyDraft(initialTeamId));
    setMilestones([]);
    setStatusQuery('');
    setPriorityQuery('');
    setLeadQuery('');
    setTeamQuery('');
    setMembersQuery('');
    setIconOpen(false);
  }, [initialTeamId, open]);

  const teams = teamsQuery.data ?? [];
  const members = useMemo(() => {
    const allMembers = membersQueryResult.data ?? [];
    if (!draft.teamId) return allMembers;
    return allMembers.filter((member) => member.teamId == null || member.teamId === Number(draft.teamId));
  }, [draft.teamId, membersQueryResult.data]);
  const labels = useMemo(
    () => [...(labelsQuery.data?.workspaceLabels ?? []), ...(labelsQuery.data?.teamLabels ?? [])],
    [labelsQuery.data]
  );
  const currentUser = useMemo(() => {
    if (!storedUser?.id) return null;
    return members.find((member) => member.id === storedUser.id) ?? null;
  }, [members, storedUser?.id]);
  const selectedLead = useMemo(
    () => members.find((member) => String(member.id) === String(draft.ownerId ?? '')) ?? null,
    [draft.ownerId, members]
  );
  const selectedMemberNames = useMemo(
    () => members.filter((member) => draft.memberIds.includes(String(member.id))).map((member) => member.name),
    [draft.memberIds, members]
  );
  const selectedLabels = useMemo(
    () => labels.filter((label) => draft.labelIds.includes(String(label.id))),
    [draft.labelIds, labels]
  );

  const canSubmit = organizationId != null && draft.name.trim().length > 0 && !createMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="inset-y-auto left-1/2 right-auto top-[4vh] bottom-[4vh] h-auto max-h-[92vh] w-[min(1080px,calc(100vw-48px))] max-w-none -translate-x-1/2 rounded-[28px] border border-border-subtle bg-white p-0 shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
        <div className="flex h-full flex-col overflow-hidden rounded-[28px]">
          <div className="flex items-center justify-between gap-4 border-b border-border-soft px-6 py-5">
            <div className="flex items-center gap-3 text-sm text-ink-500">
              <ProjectTeamPill
                value={draft.teamId ? Number(draft.teamId) : null}
                teams={teams}
                query={teamQuery}
                onQueryChange={setTeamQuery}
                onSelect={(teamId) => setDraft((current) => ({ ...current, teamId: teamId ? String(teamId) : null, ownerId: null, memberIds: [] }))}
                t={t}
              />
              <span>›</span>
              <span className="font-medium text-ink-700">{t('projects.composer.newProject')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                {t('projects.composer.discard')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full border border-border-soft"
                onClick={() => onOpenChange(false)}
                aria-label={t('common.close')}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-8 pt-6">
            <div className="mx-auto flex max-w-[920px] flex-col gap-8">
              <div className="flex items-start gap-4">
                <Popover open={iconOpen} onOpenChange={setIconOpen}>
                  <PopoverTrigger asChild>
                    <button type="button" className="rounded-[22px] transition hover:scale-[1.02]" aria-label={t('projects.composer.chooseIcon')}>
                      <ProjectIconPreview tone={draft.icon ?? 'slate'} className="h-14 w-14 rounded-[22px]" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-[250px] rounded-[20px] border-border-subtle p-3">
                    <div className="grid grid-cols-5 gap-2">
                      {PROJECT_ICON_SWATCHES.map((tone) => (
                        <button
                          key={tone}
                          type="button"
                          onClick={() => {
                            setDraft((current) => ({ ...current, icon: tone }));
                            setIconOpen(false);
                          }}
                          className={`rounded-2xl p-2 transition hover:bg-slate-50 ${draft.icon === tone ? 'bg-slate-100' : ''}`}
                        >
                          <ProjectIconPreview tone={tone} />
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                <div className="min-w-0 flex-1 space-y-3">
                  <Input
                    value={draft.name}
                    onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                    placeholder={t('projects.composer.namePlaceholder')}
                    className="h-auto border-0 bg-transparent px-0 py-0 text-[42px] font-semibold tracking-[-0.04em] text-ink-900 shadow-none placeholder:text-slate-300 focus-visible:ring-0"
                  />
                  <Input
                    value={draft.summary}
                    onChange={(event) => setDraft((current) => ({ ...current, summary: event.target.value }))}
                    placeholder={t('projects.composer.summaryPlaceholder')}
                    className="h-auto border-0 bg-transparent px-0 py-0 text-[20px] text-ink-500 shadow-none placeholder:text-slate-300 focus-visible:ring-0"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="ghost" className="h-11 rounded-full border border-border-soft bg-white px-4 text-[15px] font-medium text-ink-700 shadow-none hover:bg-slate-50">
                      {projectStatusIcon(draft.status)}
                      <span className="ml-2">{t(projectStatusLabelKey(draft.status))}</span>
                      <ChevronDown className="ml-2 h-4 w-4 text-ink-400" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-[300px] rounded-[20px] border-border-subtle p-0">
                    <ProjectStatusSelectMenu
                      value={draft.status}
                      query={statusQuery}
                      onQueryChange={setStatusQuery}
                      onSelect={(status) => setDraft((current) => ({ ...current, status }))}
                      placeholder={t('projects.composer.searchStatus')}
                      shortcut="S"
                      t={t}
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="ghost" className="h-11 rounded-full border border-border-soft bg-white px-4 text-[15px] font-medium text-ink-700 shadow-none hover:bg-slate-50">
                      {projectPriorityIcon(draft.priority)}
                      <span className="ml-2">
                        {draft.priority == null ? t('projects.composer.nonePriority') : t(projectPriorityLabelKey(draft.priority) ?? 'projects.composer.nonePriority')}
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 text-ink-400" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-[300px] rounded-[20px] border-border-subtle p-0">
                    <ProjectPrioritySelectMenu
                      value={draft.priority}
                      query={priorityQuery}
                      onQueryChange={setPriorityQuery}
                      onSelect={(priority) => setDraft((current) => ({ ...current, priority }))}
                      placeholder={t('projects.composer.searchPriority')}
                      shortcut="P"
                      t={t}
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="ghost" className="h-11 rounded-full border border-border-soft bg-white px-4 text-[15px] font-medium text-ink-700 shadow-none hover:bg-slate-50">
                      {selectedLead ? memberAvatar(selectedLead.name) : projectLeadIcon()}
                      <span className="ml-2">{selectedLead?.name ?? t('projects.composer.lead')}</span>
                      <ChevronDown className="ml-2 h-4 w-4 text-ink-400" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-[320px] rounded-[20px] border-border-subtle p-0">
                    <ProjectLeadSelectMenu
                      value={draft.ownerId ? Number(draft.ownerId) : null}
                      members={members}
                      currentUser={currentUser}
                      query={leadQuery}
                      onQueryChange={setLeadQuery}
                      onSelect={(leadId) => setDraft((current) => ({ ...current, ownerId: leadId ? String(leadId) : null }))}
                      placeholder={t('projects.composer.searchLead')}
                      shortcut="L"
                      t={t}
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="ghost" className="h-11 rounded-full border border-border-soft bg-white px-4 text-[15px] font-medium text-ink-700 shadow-none hover:bg-slate-50">
                      <Users className="mr-2 h-4 w-4 text-ink-400" />
                      <span>{selectedMemberNames.length ? t('projects.composer.membersCount', { count: selectedMemberNames.length }) : t('projects.composer.members')}</span>
                      <ChevronDown className="ml-2 h-4 w-4 text-ink-400" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-[320px] rounded-[20px] border-border-subtle p-0">
                    <div className="border-b border-border-soft px-4 py-3">
                      <Input
                        value={membersQuery}
                        onChange={(event) => setMembersQuery(event.target.value)}
                        placeholder={t('projects.composer.searchMembers')}
                        className="h-auto border-0 bg-transparent px-0 py-0 text-[16px] shadow-none focus-visible:ring-0"
                      />
                    </div>
                    <div className="max-h-80 overflow-y-auto px-1 py-1.5">
                      {members
                        .filter((member) => !membersQuery.trim() || member.name.toLowerCase().includes(membersQuery.trim().toLowerCase()))
                        .map((member) => {
                          const active = draft.memberIds.includes(String(member.id));
                          return (
                            <button
                              key={member.id}
                              type="button"
                              onClick={() =>
                                setDraft((current) => ({
                                  ...current,
                                  memberIds: active
                                    ? current.memberIds.filter((value) => value !== String(member.id))
                                    : [...current.memberIds, String(member.id)],
                                }))
                              }
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[15px] text-ink-700 transition hover:bg-slate-100"
                            >
                              {memberAvatar(member.name)}
                              <span className="truncate">{member.name}</span>
                              <span className="ml-auto inline-flex w-4 justify-center">{active ? <Check className="h-4 w-4 text-ink-700" /> : null}</span>
                            </button>
                          );
                        })}
                    </div>
                  </PopoverContent>
                </Popover>

                <ProjectDatePickerPill
                  value={draft.startDate}
                  onChange={(value) => setDraft((current) => ({ ...current, startDate: value }))}
                  label={t('projects.composer.start')}
                  clearLabel={t('common.clear')}
                  locale={locale}
                />

                <ProjectDatePickerPill
                  value={draft.targetDate}
                  onChange={(value) => setDraft((current) => ({ ...current, targetDate: value }))}
                  label={t('projects.composer.target')}
                  clearLabel={t('common.clear')}
                  locale={locale}
                />

                <Popover>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="ghost" className="h-11 rounded-full border border-border-soft bg-white px-4 text-[15px] font-medium text-ink-700 shadow-none hover:bg-slate-50">
                      <Tag className="mr-2 h-4 w-4 text-ink-400" />
                      <span>{selectedLabels.length ? t('projects.composer.labelsCount', { count: selectedLabels.length }) : t('projects.composer.labels')}</span>
                      <ChevronDown className="ml-2 h-4 w-4 text-ink-400" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-[320px] rounded-[20px] border-border-subtle p-0">
                    <ProjectLabelsSelectMenu
                      labels={labels}
                      selectedLabelIds={draft.labelIds}
                      onToggle={(labelId) =>
                        setDraft((current) => ({
                          ...current,
                          labelIds: current.labelIds.includes(String(labelId))
                            ? current.labelIds.filter((value) => value !== String(labelId))
                            : [...current.labelIds, String(labelId)],
                        }))
                      }
                      t={t}
                    />
                  </PopoverContent>
                </Popover>

                <Button type="button" variant="ghost" disabled className="h-11 rounded-full border border-border-soft bg-white px-4 text-[15px] font-medium text-ink-400 shadow-none disabled:opacity-100">
                  <Link2 className="mr-2 h-4 w-4" />
                  <span>{t('projects.composer.dependencies')}</span>
                </Button>
              </div>

              <div className="rounded-[24px] border border-border-soft bg-white px-5 py-4">
                <Textarea
                  value={draft.description}
                  onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                  placeholder={t('projects.composer.descriptionPlaceholder')}
                  className="min-h-[220px] resize-none border-0 bg-transparent px-0 py-0 text-[16px] leading-7 text-ink-700 shadow-none placeholder:text-slate-300 focus-visible:ring-0"
                />
              </div>

              <div className="rounded-[24px] border border-border-soft bg-white">
                <div className="flex items-center justify-between border-b border-border-soft px-5 py-4">
                  <div className="text-[18px] font-semibold text-ink-900">{t('projects.composer.milestones')}</div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-full border border-border-soft"
                    onClick={() => setMilestones((current) => [...current, { id: crypto.randomUUID(), name: '', targetDate: null }])}
                    aria-label={t('common.add')}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {milestones.length ? (
                  <div className="space-y-3 px-5 py-4">
                    {milestones.map((milestone) => (
                      <div key={milestone.id} className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
                        <Input
                          value={milestone.name}
                          onChange={(event) =>
                            setMilestones((current) =>
                              current.map((item) => (item.id === milestone.id ? { ...item, name: event.target.value } : item))
                            )
                          }
                          placeholder={t('projects.composer.milestoneName')}
                        />
                        <Input
                          type="date"
                          value={milestone.targetDate ?? ''}
                          onChange={(event) =>
                            setMilestones((current) =>
                              current.map((item) => (item.id === milestone.id ? { ...item, targetDate: event.target.value || null } : item))
                            )
                          }
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-10 rounded-full border border-border-soft"
                          onClick={() => setMilestones((current) => current.filter((item) => item.id !== milestone.id))}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-5 py-8 text-sm text-ink-400">{t('projects.composer.noMilestones')}</div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-border-soft px-6 py-4">
            <div className="mx-auto flex max-w-[920px] items-center justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="button" disabled={!canSubmit} onClick={() => void createMutation.mutateAsync()}>
                {createMutation.isPending ? t('projects.composer.creating') : t('projects.composer.createProject')}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
