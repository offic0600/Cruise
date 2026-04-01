import { Archive, CheckCircle2, CircleDashed, LoaderCircle, Pause, UserCircle2 } from 'lucide-react';
import { FolderKanban } from 'lucide-react';
import type { Project } from '@/lib/api/types';
import { issuePriorityIcon } from '@/components/issues/issues-list-utils';

export const PROJECT_STATUS_OPTIONS = ['PLANNED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED'] as const;
export const PROJECT_PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
export const PROJECT_ICON_SWATCHES = ['slate', 'sky', 'emerald', 'amber', 'rose'] as const;

export type ProjectComposerStatus = (typeof PROJECT_STATUS_OPTIONS)[number];
export type ProjectComposerPriority = Project['priority'];
export type ProjectIconTone = (typeof PROJECT_ICON_SWATCHES)[number];

export function projectStatusLabelKey(status: ProjectComposerStatus) {
  return `projects.status.${status}` as const;
}

export function projectStatusIcon(status: ProjectComposerStatus) {
  switch (status) {
    case 'PLANNED':
      return <CircleDashed className="h-4 w-4 text-slate-400" />;
    case 'ACTIVE':
      return <LoaderCircle className="h-4 w-4 text-amber-500" />;
    case 'PAUSED':
      return <Pause className="h-4 w-4 text-slate-500" />;
    case 'COMPLETED':
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    case 'ARCHIVED':
      return <Archive className="h-4 w-4 text-slate-400" />;
  }
}

export function projectPriorityIcon(priority: ProjectComposerPriority) {
  return issuePriorityIcon(priority);
}

export function projectPriorityLabelKey(priority: ProjectComposerPriority) {
  return priority == null ? null : (`common.priority.${priority}` as const);
}

export function projectLeadIcon() {
  return <UserCircle2 className="h-4 w-4 text-slate-400" />;
}

export function getProjectInitials(name: string | null | undefined) {
  if (!name) return 'NA';
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.length ? parts.map((part) => part[0]).join('').toUpperCase() : 'NA';
}

export function projectIconToneClasses(tone: ProjectIconTone) {
  switch (tone) {
    case 'sky':
      return 'bg-sky-100 text-sky-600 border-sky-200';
    case 'emerald':
      return 'bg-emerald-100 text-emerald-600 border-emerald-200';
    case 'amber':
      return 'bg-amber-100 text-amber-600 border-amber-200';
    case 'rose':
      return 'bg-rose-100 text-rose-600 border-rose-200';
    case 'slate':
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

export function ProjectIconPreview({ tone, className = '' }: { tone: ProjectIconTone; className?: string }) {
  return (
    <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border ${projectIconToneClasses(tone)} ${className}`}>
      <FolderKanban className="h-5 w-5" />
    </span>
  );
}
