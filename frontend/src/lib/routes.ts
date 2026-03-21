import type { Issue } from '@/lib/api';

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
    .replace(/[^a-z0-9-]+/g, '-')
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
