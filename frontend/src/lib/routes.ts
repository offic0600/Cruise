import type { Issue } from '@/lib/api';
import type { ViewResourceType } from '@/lib/api/types';

const PUBLIC_PATHS = ['/login', '/login/callback', '/create-workspace'];

function normalizePath(pathname: string) {
  if (!pathname) return '/';
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return normalized.replace(/\/{2,}/g, '/').replace(/\/$/, '') || '/';
}

export function publicPath(pathname: string) {
  return normalizePath(pathname);
}

export function isPublicPath(pathname: string) {
  const normalized = normalizePath(pathname);
  return PUBLIC_PATHS.some((path) => normalized === path || normalized.startsWith(`${path}/`));
}

export function workspaceRootPath(workspaceSlug: string) {
  return normalizePath(`/${workspaceSlug}`);
}

export function workspaceSectionPath(workspaceSlug: string, section: string) {
  return normalizePath(`/${workspaceSlug}/${section}`);
}

export function workspaceMyIssuesPath(workspaceSlug: string) {
  return normalizePath(`/${workspaceSlug}/my-issues`);
}

export function workspaceInboxPath(workspaceSlug: string) {
  return normalizePath(`/${workspaceSlug}/inbox`);
}

export function workspaceProjectsAllPath(workspaceSlug: string) {
  return normalizePath(`/${workspaceSlug}/projects/all`);
}

export function workspaceProjectViewPath(
  workspaceSlug: string,
  view: number | string | { id: number | string; name?: string | null }
) {
  if (typeof view === 'object' && view !== null) {
    const id = String(view.id);
    const nameSegment = slugifyPathSegment(view.name ?? '');
    return normalizePath(`/${workspaceSlug}/projects/view/${nameSegment ? `${nameSegment}-${id}` : id}`);
  }
  return normalizePath(`/${workspaceSlug}/projects/view/${String(view)}`);
}

export type WorkspaceViewResourceSegment = 'issues' | 'projects' | 'initiatives';

export function resourceTypeToViewSegment(resourceType: ViewResourceType): WorkspaceViewResourceSegment {
  switch (resourceType) {
    case 'PROJECT':
      return 'projects';
    case 'INITIATIVE':
      return 'initiatives';
    default:
      return 'issues';
  }
}

export function workspaceViewsPath(workspaceSlug: string, resourceType: WorkspaceViewResourceSegment) {
  return normalizePath(`/${workspaceSlug}/views/${resourceType}`);
}

export function workspaceNewViewPath(workspaceSlug: string, resourceType: WorkspaceViewResourceSegment) {
  return normalizePath(`/${workspaceSlug}/views/${resourceType}/new`);
}

export function teamViewsPath(workspaceSlug: string, teamKey: string, resourceType: 'issues') {
  return normalizePath(`/${workspaceSlug}/team/${teamKey}/views/${resourceType}`);
}

export function workspaceViewPath(
  workspaceSlug: string,
  view: number | string | { id: number | string; name?: string | null }
) {
  if (typeof view === 'object' && view !== null) {
    const id = String(view.id);
    const nameSegment = slugifyPathSegment(view.name ?? '');
    return normalizePath(`/${workspaceSlug}/view/${nameSegment ? `${nameSegment}-${id}` : id}`);
  }

  const id = String(view);
  return normalizePath(`/${workspaceSlug}/view/${id}`);
}

export function teamActivePath(workspaceSlug: string, teamKey: string) {
  return normalizePath(`/${workspaceSlug}/team/${teamKey}/active`);
}

export function teamSettingsPath(workspaceSlug: string, teamKey: string, section?: string) {
  return normalizePath(
    section
      ? `/${workspaceSlug}/team/${teamKey}/settings/${section}`
      : `/${workspaceSlug}/team/${teamKey}/settings`
  );
}

export function slugifyPathSegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}-]+/gu, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function issueDetailPath(
  workspaceSlug: string,
  issue: Pick<Issue, 'identifier' | 'title'>
) {
  const titleSlug = slugifyPathSegment(issue.title) || issue.identifier.toLowerCase();
  return normalizePath(`/${workspaceSlug}/issue/${issue.identifier}/${titleSlug}`);
}

export function parseWorkspaceSlug(pathname: string) {
  const normalized = normalizePath(pathname);
  if (isPublicPath(normalized)) return null;
  const [workspaceSlug] = normalized.split('/').filter(Boolean);
  return workspaceSlug ?? null;
}

export function parseTeamRoute(pathname: string) {
  const segments = normalizePath(pathname).split('/').filter(Boolean);
  if (segments.length < 3 || segments[1] !== 'team') return null;

  return {
    workspaceSlug: segments[0] ?? null,
    teamKey: segments[2] ?? null,
    suffix: segments.slice(3),
  };
}

export function replaceTeamKeyInPath(pathname: string, nextTeamKey: string) {
  const parsed = parseTeamRoute(pathname);
  if (!parsed?.workspaceSlug) return pathname;
  return normalizePath(`/${parsed.workspaceSlug}/team/${nextTeamKey}/${parsed.suffix.join('/')}`);
}
