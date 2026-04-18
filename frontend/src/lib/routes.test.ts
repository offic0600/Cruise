import { describe, expect, it } from 'vitest';
import { issueViewFromTeamRoute, parseTeamRoute, parseWorkspaceSlug, replaceTeamKeyInPath, teamActivePath, teamIssuesPath } from '@/lib/routes';

describe('routes helpers for active issues workspace routing', () => {
  it('builds the active issues path under a workspace team route', () => {
    expect(teamActivePath('acme', 'eng')).toBe('/acme/team/eng/active');
  });

  it('parses workspace and team metadata from the active issues pathname', () => {
    expect(parseWorkspaceSlug('/acme/team/eng/active')).toBe('acme');
    expect(parseTeamRoute('/acme/team/eng/active')).toEqual({
      workspaceSlug: 'acme',
      teamKey: 'eng',
      suffix: ['active'],
    });
  });

  it('replaces only the team key while preserving the active suffix', () => {
    expect(replaceTeamKeyInPath('/acme/team/eng/active', 'design')).toBe('/acme/team/design/active');
  });

  it('normalizes duplicated and trailing slashes in active team routes', () => {
    expect(teamActivePath('acme', 'eng/')).toBe('/acme/team/eng/active');
  });

  it('builds semantic backlog and done team routes', () => {
    expect(teamIssuesPath('acme', 'eng', 'active')).toBe('/acme/team/eng/active');
    expect(teamIssuesPath('acme', 'eng', 'backlog')).toBe('/acme/team/eng/backlog');
    expect(teamIssuesPath('acme', 'eng', 'done')).toBe('/acme/team/eng/done');
  });

  it('preserves backlog and done suffixes when replacing the team key', () => {
    expect(replaceTeamKeyInPath('/acme/team/eng/backlog', 'design')).toBe('/acme/team/design/backlog');
    expect(replaceTeamKeyInPath('/acme/team/eng/done', 'design')).toBe('/acme/team/design/done');
  });

  it('derives the issue view directly from semantic team routes', () => {
    expect(issueViewFromTeamRoute('/acme/team/eng/active')).toBe('active');
    expect(issueViewFromTeamRoute('/acme/team/eng/backlog')).toBe('backlog');
    expect(issueViewFromTeamRoute('/acme/team/eng/done')).toBe('done');
    expect(issueViewFromTeamRoute('/acme/team/eng/settings')).toBeNull();
    expect(issueViewFromTeamRoute('/acme/issues')).toBeNull();
  });
});
