import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import type { Issue } from '@/lib/api';
import { IssueDetailRouteEmptyState, IssueDetailRouteEmptyStateCard, IssueDetailRouteSkeleton, buildIssueDetailRouteBackLink, buildIssueDetailRouteEmptyCopy, buildIssueDetailRouteEmptyStateBackLinkModel, buildIssueDetailRouteEmptyStateCardModel, buildIssueDetailRouteEmptyStateCardTestIds, buildIssueDetailRouteEmptyStateLinkHref, buildIssueDetailRouteEmptyStateModel, buildIssueDetailRouteShellModel } from '@/app/[workspaceSlug]/issue/[identifier]/[titleSlug]/page';
import { buildIssueDetailRouteBackLinkProps, loadIssueDetailRouteLookup } from '@/app/issues/[id]/page';
import { issueDetailPath, issueViewFromTeamRoute, parseTeamRoute, parseWorkspaceSlug, replaceTeamKeyInPath, teamActivePath, teamIssuesPath } from '@/lib/routes';

const issueDetailPageSpy = vi.fn();

vi.mock('@/components/issues/IssueDetailPage', () => ({
  __esModule: true,
  default: (props: { issueId: number; href?: string | null; label?: string | null }) => {
    issueDetailPageSpy(props);
    return <div data-testid="issue-detail-page-mock" data-issue-id={String(props.issueId)} data-back-href={props.href ?? ''} data-back-label={props.label ?? ''} />;
  },
}));

const appLayoutSpy = vi.fn();

vi.mock('@/components/AppLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => {
    appLayoutSpy(children);
    return <div data-testid="app-layout-mock">{children}</div>;
  },
}));

const useParamsMock = vi.fn();

vi.mock('next/navigation', async () => {
  const actual = await vi.importActual<typeof import('next/navigation')>('next/navigation');
  return {
    ...actual,
    useParams: () => useParamsMock(),
  };
});

const getQueriesDataMock = vi.fn();
const setQueryDataMock = vi.fn();

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-query')>('@tanstack/react-query');
  return {
    ...actual,
    useQueryClient: () => ({
      getQueriesData: getQueriesDataMock,
      setQueryData: setQueryDataMock,
    }),
  };
});

const useCurrentWorkspaceMock = vi.fn();

vi.mock('@/components/providers/WorkspaceProvider', () => ({
  useCurrentWorkspace: () => useCurrentWorkspaceMock(),
}));

const useI18nMock = vi.fn();

vi.mock('@/i18n/useI18n', () => ({
  useI18n: () => useI18nMock(),
}));

const useIssueByIdentifierMock = vi.fn();

vi.mock('@/lib/query/issues', () => ({
  useIssueByIdentifier: (...args: unknown[]) => useIssueByIdentifierMock(...args),
}));

import IssueDetailWorkspaceRoute from '@/app/[workspaceSlug]/issue/[identifier]/[titleSlug]/page';
import IssueDetailRoute from '@/app/issues/[id]/page';

const getIssueMock = vi.fn();
const getOrganizationsMock = vi.fn();

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api');
  return {
    ...actual,
    getIssue: (...args: Parameters<typeof actual.getIssue>) => getIssueMock(...args),
    getOrganizations: (...args: Parameters<typeof actual.getOrganizations>) => getOrganizationsMock(...args),
  };
});

describe('routes helpers for active issues workspace routing', () => {
  const baseIssue = {
    id: 42,
    identifier: 'ENG-42',
    title: 'Issue detail shell polish',
    organizationId: 7,
  } as Issue;

  beforeEach(() => {
    issueDetailPageSpy.mockClear();
    appLayoutSpy.mockClear();
    useParamsMock.mockReset();
    getQueriesDataMock.mockReset();
    setQueryDataMock.mockReset();
    useCurrentWorkspaceMock.mockReset();
    useI18nMock.mockReset();
    useIssueByIdentifierMock.mockReset();
    getIssueMock.mockReset();
    getOrganizationsMock.mockReset();

    useParamsMock.mockReturnValue({ identifier: 'ENG-42' });
    getQueriesDataMock.mockReturnValue([]);
    useCurrentWorkspaceMock.mockReturnValue({
      organizationId: 7,
      currentOrganizationSlug: 'acme',
      currentTeamKey: 'eng',
    });
    useI18nMock.mockReturnValue({
      t: (key: string) => key,
    });
    useIssueByIdentifierMock.mockReturnValue({
      isLoading: false,
      isFetching: false,
      isError: false,
      data: null,
    });
    getIssueMock.mockResolvedValue(baseIssue);
    getOrganizationsMock.mockResolvedValue([
      { id: 7, slug: 'acme' },
      { id: 8, slug: 'design' },
    ]);
  });

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

  it('builds issue detail paths with a slug fallback when the title is blank', () => {
    expect(issueDetailPath('acme', { identifier: 'ENG-42', title: 'Issue detail shell polish' })).toBe('/acme/issue/ENG-42/issue-detail-shell-polish');
    expect(issueDetailPath('acme', { identifier: 'ENG-99', title: '   ' })).toBe('/acme/issue/ENG-99/eng-99');
  });

  it('normalizes whitespace and punctuation before slugifying issue detail titles', () => {
    expect(issueDetailPath('acme', { identifier: 'ENG-43', title: '  Refine   issue---detail   shell!!  ' })).toBe(
      '/acme/issue/ENG-43/refine-issue-detail-shell'
    );
  });

  it('preserves unicode letters while slugifying issue detail titles', () => {
    expect(issueDetailPath('acme', { identifier: 'ENG-108', title: '修复 登录 回调' } as Pick<Issue, 'identifier' | 'title'>)).toBe(
      '/acme/issue/ENG-108/修复-登录-回调'
    );
  });

  it('falls back to the identifier casing for punctuation-only titles', () => {
    expect(issueDetailPath('acme', { identifier: 'Eng-777', title: '!!! ???' } as Pick<Issue, 'identifier' | 'title'>)).toBe(
      '/acme/issue/Eng-777/eng-777'
    );
  });

  it('keeps mixed-case identifiers in issue detail paths while normalizing the title slug', () => {
    expect(issueDetailPath('acme', { identifier: 'Eng-42', title: 'Refine Issue Detail Hero' } as Pick<Issue, 'identifier' | 'title'>)).toBe(
      '/acme/issue/Eng-42/refine-issue-detail-hero'
    );
  });

  it('keeps the detail route stable while a cached issue refetches in the background', () => {
    const cachedPath = issueDetailPath('acme', { identifier: 'ENG-42', title: 'Issue detail shell polish' } as Pick<Issue, 'identifier' | 'title'>);
    const refetchedPath = issueDetailPath('acme', { identifier: 'ENG-42', title: 'Issue detail shell polish   ' } as Pick<Issue, 'identifier' | 'title'>);
    expect(cachedPath).toBe('/acme/issue/ENG-42/issue-detail-shell-polish');
    expect(refetchedPath).toBe(cachedPath);
  });

  it('keeps the title slug stable when issue detail titles gain wrapping whitespace and punctuation noise', () => {
    const cachedPath = issueDetailPath('acme', { identifier: 'ENG-57', title: 'Issue detail skeleton actions' } as Pick<Issue, 'identifier' | 'title'>);
    const refetchedPath = issueDetailPath('acme', { identifier: 'ENG-57', title: '  Issue detail skeleton actions!!!  ' } as Pick<Issue, 'identifier' | 'title'>);
    expect(refetchedPath).toBe(cachedPath);
  });

  it('hides skeleton actions for subtle issue detail route loading states', () => {
    render(<IssueDetailRouteSkeleton subtle showActions={false} />);
    const skeleton = screen.getByTestId('issue-detail-route-skeleton');
    expect(skeleton).toHaveAttribute('data-subtle', 'true');
    expect(skeleton).toHaveAttribute('data-show-actions', 'false');
    expect(screen.queryByTestId('issue-detail-route-skeleton-actions')).not.toBeInTheDocument();
  });

  it('keeps skeleton actions visible for the default route loading state', () => {
    render(<IssueDetailRouteSkeleton />);
    const skeleton = screen.getByTestId('issue-detail-route-skeleton');
    expect(skeleton).toHaveAttribute('data-subtle', 'false');
    expect(skeleton).toHaveAttribute('data-show-actions', 'true');
    expect(screen.getByTestId('issue-detail-route-skeleton-actions')).toBeInTheDocument();
  });

  it('keeps skeleton actions visible for subtle route loading when actions are not explicitly disabled', () => {
    render(<IssueDetailRouteSkeleton subtle />);
    const skeleton = screen.getByTestId('issue-detail-route-skeleton');
    expect(skeleton).toHaveAttribute('data-subtle', 'true');
    expect(skeleton).toHaveAttribute('data-show-actions', 'true');
    expect(screen.getByTestId('issue-detail-route-skeleton-actions')).toBeInTheDocument();
  });

  it('builds a shared issue detail back link from the available workspace context', () => {
    expect(buildIssueDetailRouteBackLink('/acme/team/eng/active', 'issues.detailPage.backToActiveIssues', 'issues.detailPage.backToIssues')).toEqual({
      href: '/acme/team/eng/active',
      label: 'issues.detailPage.backToActiveIssues',
    });
    expect(buildIssueDetailRouteBackLink(null, 'issues.detailPage.backToActiveIssues', 'issues.detailPage.backToIssues')).toEqual({
      href: null,
      label: 'issues.detailPage.backToIssues',
    });
  });

  it('builds shared issue detail empty copy from the i18n translator', () => {
    const translator = vi.fn((key: string) => `copy:${key}`);

    expect(buildIssueDetailRouteEmptyCopy(translator)).toEqual({
      badgeLabel: 'copy:issues.detailPage.issueNotFoundBadge',
      title: 'copy:issues.detailPage.issueNotFoundTitle',
      description: 'copy:issues.detailPage.issueNotFoundDescription',
    });
    expect(translator.mock.calls).toEqual([
      ['issues.detailPage.issueNotFoundBadge'],
      ['issues.detailPage.issueNotFoundTitle'],
      ['issues.detailPage.issueNotFoundDescription'],
    ]);
  });

  it('builds a shared issue detail empty state model from identifier, back link model, and copy', () => {
    expect(
      buildIssueDetailRouteEmptyStateModel(
        'ENG-42',
        buildIssueDetailRouteEmptyStateBackLinkModel({
          href: '/acme/team/eng/active',
          label: 'issues.detailPage.backToActiveIssues',
        }),
        {
          badgeLabel: 'issues.detailPage.issueNotFoundBadge',
          title: 'issues.detailPage.issueNotFoundTitle',
          description: 'issues.detailPage.issueNotFoundDescription',
        }
      )
    ).toEqual({
      identifier: 'ENG-42',
      backLinkModel: buildIssueDetailRouteEmptyStateBackLinkModel({
        href: '/acme/team/eng/active',
        label: 'issues.detailPage.backToActiveIssues',
      }),
      copy: {
        badgeLabel: 'issues.detailPage.issueNotFoundBadge',
        title: 'issues.detailPage.issueNotFoundTitle',
        description: 'issues.detailPage.issueNotFoundDescription',
      },
    });
  });

  it('builds a shared empty-state card model with identifier-first badge fallback', () => {
    expect(
      buildIssueDetailRouteEmptyStateCardModel('ENG-42', {
        badgeLabel: 'issues.detailPage.issueNotFoundBadge',
        title: 'issues.detailPage.issueNotFoundTitle',
        description: 'issues.detailPage.issueNotFoundDescription',
      })
    ).toEqual({
      badgeLabel: 'ENG-42',
      title: 'issues.detailPage.issueNotFoundTitle',
      description: 'issues.detailPage.issueNotFoundDescription',
    });
  });

  it('falls back to the shared empty-copy badge when the card model has no identifier', () => {
    expect(
      buildIssueDetailRouteEmptyStateCardModel(undefined, {
        badgeLabel: 'issues.detailPage.issueNotFoundBadge',
        title: 'issues.detailPage.issueNotFoundTitle',
        description: 'issues.detailPage.issueNotFoundDescription',
      })
    ).toEqual({
      badgeLabel: 'issues.detailPage.issueNotFoundBadge',
      title: 'issues.detailPage.issueNotFoundTitle',
      description: 'issues.detailPage.issueNotFoundDescription',
    });
  });

  it('builds stable test ids for the shared empty-state card seam', () => {
    expect(buildIssueDetailRouteEmptyStateCardTestIds()).toEqual({
      card: 'issue-detail-route-empty-card',
      badge: 'issue-detail-route-empty-badge',
      title: 'issue-detail-route-empty-title',
      description: 'issue-detail-route-empty-description',
    });
  });

  it('builds a shared empty-state back-link model from the route back-link contract', () => {
    expect(buildIssueDetailRouteEmptyStateBackLinkModel({ href: '/acme/team/eng/active', label: 'issues.detailPage.backToActiveIssues' })).toEqual({
      href: '/acme/team/eng/active',
      label: 'issues.detailPage.backToActiveIssues',
      shouldRender: true,
    });
    expect(buildIssueDetailRouteEmptyStateBackLinkModel({ href: null, label: 'issues.detailPage.backToIssues' })).toEqual({
      href: null,
      label: 'issues.detailPage.backToIssues',
      shouldRender: false,
    });
  });

  it('builds a shared empty-state link href from the route back-link model', () => {
    expect(
      buildIssueDetailRouteEmptyStateLinkHref({
        href: '/acme/team/eng/active',
        label: 'issues.detailPage.backToActiveIssues',
        shouldRender: true,
      })
    ).toBe('/acme/team/eng/active');
    expect(
      buildIssueDetailRouteEmptyStateLinkHref({
        href: null,
        label: 'issues.detailPage.backToIssues',
        shouldRender: false,
      })
    ).toBe('#');
  });

  it('renders a shared empty-state card seam from the derived card model and shared test ids', () => {
    const testIds = buildIssueDetailRouteEmptyStateCardTestIds();

    render(
      <IssueDetailRouteEmptyStateCard
        {...buildIssueDetailRouteEmptyStateCardModel('ENG-42', {
          badgeLabel: 'issues.detailPage.issueNotFoundBadge',
          title: 'issues.detailPage.issueNotFoundTitle',
          description: 'issues.detailPage.issueNotFoundDescription',
        })}
      />
    );

    expect(screen.getByTestId(testIds.card)).toBeInTheDocument();
    expect(screen.getByTestId(testIds.badge)).toHaveTextContent('ENG-42');
    expect(screen.getByTestId(testIds.title)).toHaveTextContent('issues.detailPage.issueNotFoundTitle');
    expect(screen.getByTestId(testIds.description)).toHaveTextContent('issues.detailPage.issueNotFoundDescription');
  });

  it('reuses the shared empty state shell for issue detail route fallbacks', () => {
    const testIds = buildIssueDetailRouteEmptyStateCardTestIds();

    render(
      <IssueDetailRouteEmptyState
        identifier="ENG-42"
        backLinkModel={buildIssueDetailRouteEmptyStateBackLinkModel({
          href: '/acme/team/eng/active',
          label: 'issues.detailPage.backToActiveIssues',
        })}
        copy={{
          badgeLabel: 'issues.detailPage.issueNotFoundBadge',
          title: 'issues.detailPage.issueNotFoundTitle',
          description: 'issues.detailPage.issueNotFoundDescription',
        }}
      />
    );

    const layout = screen.getByTestId('app-layout-mock');
    expect(within(layout).getByTestId(testIds.card)).toBeInTheDocument();
    expect(within(layout).getByTestId(testIds.badge)).toHaveTextContent('ENG-42');
    expect(within(layout).getByTestId(testIds.title)).toHaveTextContent('issues.detailPage.issueNotFoundTitle');
    expect(within(layout).getByTestId(testIds.description)).toHaveTextContent('issues.detailPage.issueNotFoundDescription');
    expect(within(layout).getByText('issues.detailPage.backToActiveIssues')).toBeInTheDocument();
    expect(screen.queryByTestId('issue-detail-route-skeleton')).not.toBeInTheDocument();
    expect(screen.queryByTestId('issue-detail-page-mock')).not.toBeInTheDocument();
  });

  it('omits the back CTA when the shared issue detail back link has no href', () => {
    render(
      <IssueDetailRouteEmptyState
        identifier="ENG-42"
        backLinkModel={buildIssueDetailRouteEmptyStateBackLinkModel({
          href: null,
          label: 'issues.detailPage.backToIssues',
        })}
        copy={{
          badgeLabel: 'issues.detailPage.issueNotFoundBadge',
          title: 'issues.detailPage.issueNotFoundTitle',
          description: 'issues.detailPage.issueNotFoundDescription',
        }}
      />
    );

    const layout = screen.getByTestId('app-layout-mock');
    expect(within(layout).queryByText('issues.detailPage.backToIssues')).not.toBeInTheDocument();
    expect(within(layout).getByTestId('issue-detail-route-empty-card')).toBeInTheDocument();
    expect(within(layout).getByTestId('issue-detail-route-empty-title')).toHaveTextContent('issues.detailPage.issueNotFoundTitle');
  });

  function expectRouteSkeletonInLayout(options: { subtle: boolean; showActions: boolean }) {
    const layout = screen.getByTestId('app-layout-mock');
    const skeleton = within(layout).getByTestId('issue-detail-route-skeleton');
    expect(skeleton).toHaveAttribute('data-subtle', options.subtle ? 'true' : 'false');
    expect(skeleton).toHaveAttribute('data-show-actions', options.showActions ? 'true' : 'false');

    if (options.showActions) {
      expect(within(layout).getByTestId('issue-detail-route-skeleton-actions')).toBeInTheDocument();
    } else {
      expect(within(layout).queryByTestId('issue-detail-route-skeleton-actions')).not.toBeInTheDocument();
    }

    expect(screen.queryByTestId('issue-detail-page-mock')).not.toBeInTheDocument();
    return skeleton;
  }

  it('renders the default loading route skeleton inside AppLayout before the issue detail query resolves', () => {
    useIssueByIdentifierMock.mockReturnValue({
      isLoading: true,
      isFetching: false,
      isError: false,
      data: null,
    });

    render(<IssueDetailWorkspaceRoute />);

    expectRouteSkeletonInLayout({ subtle: false, showActions: true });
  });

  it('renders a subtle route skeleton inside AppLayout while refetching without a cached issue', () => {
    useIssueByIdentifierMock.mockReturnValue({
      isLoading: false,
      isFetching: true,
      isError: false,
      data: null,
    });

    render(<IssueDetailWorkspaceRoute />);

    expectRouteSkeletonInLayout({ subtle: true, showActions: false });
  });

  function expectRouteEmptyStateInLayout(options: {
    identifier?: string;
    badgeLabel?: string;
    title?: string;
    description?: string;
    backLink?: ReturnType<typeof buildIssueDetailRouteEmptyStateBackLinkModel>;
  }) {
    const testIds = buildIssueDetailRouteEmptyStateCardTestIds();
    const layout = screen.getByTestId('app-layout-mock');
    const card = within(layout).getByTestId(testIds.card);
    const badge = within(card).getByTestId(testIds.badge);
    const title = within(card).getByTestId(testIds.title);
    const description = within(card).getByTestId(testIds.description);

    expect(title).toHaveTextContent(options.title ?? 'issues.detailPage.issueNotFoundTitle');
    expect(description).toHaveTextContent(options.description ?? 'issues.detailPage.issueNotFoundDescription');

    if (options.identifier) {
      expect(badge).toHaveTextContent(options.identifier);
    } else {
      expect(badge).toHaveTextContent(options.badgeLabel ?? 'issues.detailPage.issueNotFoundBadge');
    }

    expectSharedRouteEmptyStateBackLink(options.backLink ?? buildSharedIssueDetailHiddenBackLink());

    expect(screen.queryByTestId('issue-detail-route-skeleton')).not.toBeInTheDocument();
    expect(screen.queryByTestId('issue-detail-page-mock')).not.toBeInTheDocument();
    return { card, badge, title, description };
  }

  const sharedRouteEmptyStateCopyKeys = {
    badgeLabel: 'issues.detailPage.issueNotFoundBadge',
    title: 'issues.detailPage.issueNotFoundTitle',
    description: 'issues.detailPage.issueNotFoundDescription',
  } as const;

  function expectSharedRouteEmptyStateCopyKeys() {
    return sharedRouteEmptyStateCopyKeys;
  }

  function expectSharedRouteEmptyStateBackLink(backLink: ReturnType<typeof buildIssueDetailRouteEmptyStateBackLinkModel>) {
    if (backLink.shouldRender) {
      const link = screen.getByRole('link', { name: backLink.label });
      const visibleBackLink = buildSharedIssueDetailVisibleBackLink({
        ...backLink,
        shouldRender: true,
      });
      const expectedHref = expectSharedIssueDetailVisibleBackLinkConsistency(backLink, visibleBackLink);
      expect(link).toHaveAttribute('href', expectedHref);
      return link;
    }

    expect(buildIssueDetailRouteEmptyStateLinkHref(backLink)).toBe('#');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    return null;
  }

  function buildSharedIssueDetailActiveBackLink(overrides?: Partial<ReturnType<typeof buildIssueDetailRouteEmptyStateBackLinkModel>>) {
    return {
      ...buildIssueDetailRouteEmptyStateBackLinkModel({
        href: '/acme/team/eng/active',
        label: 'issues.detailPage.backToActiveIssues',
      }),
      ...overrides,
    };
  }

  function buildSharedIssueDetailHiddenBackLink(overrides?: Partial<ReturnType<typeof buildIssueDetailRouteEmptyStateBackLinkModel>>) {
    return buildSharedIssueDetailActiveBackLink({
      ...buildIssueDetailRouteEmptyStateBackLinkModel({
        href: null,
        label: 'issues.detailPage.backToIssues',
      }),
      ...overrides,
    });
  }

  function buildSharedIssueDetailVisibleBackLink(overrides?: Partial<ReturnType<typeof buildIssueDetailRouteEmptyStateBackLinkModel>>) {
    return buildSharedIssueDetailActiveBackLink(overrides);
  }

  function buildSharedIssueDetailVisibleBackLinkHref(overrides?: Partial<ReturnType<typeof buildIssueDetailRouteEmptyStateBackLinkModel>>) {
    return buildIssueDetailRouteEmptyStateLinkHref(buildSharedIssueDetailVisibleBackLink(overrides));
  }

  function expectSharedIssueDetailVisibleBackLinkConsistency(
    backLink: ReturnType<typeof buildIssueDetailRouteEmptyStateBackLinkModel>,
    visibleBackLink = buildSharedIssueDetailVisibleBackLink({
      ...backLink,
      shouldRender: true,
    })
  ) {
    const expectedHref = buildSharedIssueDetailVisibleBackLinkHref(visibleBackLink);
    expect(visibleBackLink.shouldRender).toBe(true);
    expect(buildIssueDetailRouteEmptyStateLinkHref(visibleBackLink)).toBe(expectedHref);
    expect(buildIssueDetailRouteEmptyStateLinkHref(backLink)).toBe(expectedHref);
    return expectedHref;
  }

  function expectSharedRouteEmptyStateMatrix(options: {
    identifier?: string;
    backLink?: ReturnType<typeof buildIssueDetailRouteEmptyStateBackLinkModel>;
  }) {
    const sharedBackLinkModel = options.backLink ?? buildSharedIssueDetailHiddenBackLink();

    return expectRouteEmptyStateInLayout({
      identifier: options.identifier,
      ...expectSharedRouteEmptyStateCopyKeys(),
      backLink: sharedBackLinkModel,
    });
  }

  it('reuses one shared copy-key helper for the route empty-state matrix contract', () => {
    expect(expectSharedRouteEmptyStateCopyKeys()).toBe(sharedRouteEmptyStateCopyKeys);
    expect(expectSharedRouteEmptyStateCopyKeys()).toEqual({
      badgeLabel: 'issues.detailPage.issueNotFoundBadge',
      title: 'issues.detailPage.issueNotFoundTitle',
      description: 'issues.detailPage.issueNotFoundDescription',
    });
  });

  it('builds a shared route shell model from identifier, back-link model, copy, and optional loading state overrides', () => {
    expect(
      buildIssueDetailRouteShellModel(
        'ENG-42',
        buildSharedIssueDetailActiveBackLink(),
        expectSharedRouteEmptyStateCopyKeys(),
        { subtle: true, showActions: false }
      )
    ).toEqual({
      emptyState: buildIssueDetailRouteEmptyStateModel(
        'ENG-42',
        buildSharedIssueDetailActiveBackLink(),
        expectSharedRouteEmptyStateCopyKeys()
      ),
      loadingState: {
        subtle: true,
        showActions: false,
      },
      pageBackLink: {
        href: '/acme/team/eng/active',
        label: 'issues.detailPage.backToActiveIssues',
      },
    });
    expect(
      buildIssueDetailRouteShellModel(
        undefined,
        buildSharedIssueDetailHiddenBackLink(),
        expectSharedRouteEmptyStateCopyKeys()
      )
    ).toEqual({
      emptyState: buildIssueDetailRouteEmptyStateModel(
        undefined,
        buildSharedIssueDetailHiddenBackLink(),
        expectSharedRouteEmptyStateCopyKeys()
      ),
      loadingState: {
        subtle: false,
        showActions: true,
      },
      pageBackLink: {
        href: null,
        label: 'issues.detailPage.backToIssues',
      },
    });
  });

  it('reuses the shared shell pageBackLink when rendering IssueDetailPage during steady and cached-refetch branches', () => {
    getQueriesDataMock.mockReturnValue([[['issues'], { items: [baseIssue] }]]);

    useIssueByIdentifierMock.mockReturnValue({
      isLoading: false,
      isFetching: true,
      isError: false,
      data: null,
    });

    render(<IssueDetailWorkspaceRoute />);

    expect(screen.getByTestId('issue-detail-page-mock')).toHaveAttribute('data-issue-id', '42');
    expect(issueDetailPageSpy).toHaveBeenLastCalledWith({
      issueId: 42,
      href: '/acme/team/eng/active',
      label: 'issues.detailPage.backToActiveIssues',
    });

    issueDetailPageSpy.mockClear();

    useIssueByIdentifierMock.mockReturnValue({
      isLoading: false,
      isFetching: false,
      isError: false,
      data: baseIssue,
    });

    render(<IssueDetailWorkspaceRoute />);

    expect(issueDetailPageSpy).toHaveBeenLastCalledWith({
      issueId: 42,
      href: '/acme/team/eng/active',
      label: 'issues.detailPage.backToActiveIssues',
    });
  });

  it('reuses one shared back-link helper for the route empty-state matrix contract', () => {
    render(
      <IssueDetailRouteEmptyState
        identifier="ENG-42"
        backLinkModel={buildSharedIssueDetailActiveBackLink()}
        copy={expectSharedRouteEmptyStateCopyKeys()}
      />
    );

    const backLink = expectSharedRouteEmptyStateBackLink(buildSharedIssueDetailActiveBackLink());

    expect(backLink).toHaveAttribute('href', '/acme/team/eng/active');
  });

  it('lets the shared back-link helpers reuse the explicit hidden CTA contract helper model', () => {
    const hiddenBackLink = buildSharedIssueDetailHiddenBackLink();

    expect(hiddenBackLink).toEqual(
      buildIssueDetailRouteEmptyStateBackLinkModel({
        href: null,
        label: 'issues.detailPage.backToIssues',
      })
    );
  });

  it('keeps the not-found empty state inside AppLayout with the shared empty-state card copy and back CTA when the issue lookup resolves without a match', () => {
    render(<IssueDetailWorkspaceRoute />);

    expectSharedRouteEmptyStateMatrix({
      identifier: 'ENG-42',
      backLink: buildSharedIssueDetailActiveBackLink(),
    });
  });

  it('keeps the error empty state inside AppLayout with the same shared empty-state card copy and back CTA when the issue lookup fails', () => {
    useIssueByIdentifierMock.mockReturnValue({
      isLoading: false,
      isFetching: false,
      isError: true,
      data: null,
    });

    render(<IssueDetailWorkspaceRoute />);

    expectSharedRouteEmptyStateMatrix({
      identifier: 'ENG-42',
      backLink: buildSharedIssueDetailActiveBackLink(),
    });
  });

  it('falls back to the same shared empty-state card copy keys for the no-id route branch and hides the back CTA without team context', () => {
    useParamsMock.mockReturnValue({});
    useCurrentWorkspaceMock.mockReturnValue({
      organizationId: 7,
      currentOrganizationSlug: 'acme',
      currentTeamKey: null,
    });

    render(<IssueDetailWorkspaceRoute />);

    expectSharedRouteEmptyStateMatrix({
      identifier: undefined,
      backLink: buildSharedIssueDetailHiddenBackLink(),
    });
  });

  it('reuses the cached issue detail page while the route refetches in the background', () => {
    const cachedIssue = { ...baseIssue };
    getQueriesDataMock.mockReturnValue([
      [
        ['issues', 'list'],
        {
          items: [cachedIssue],
        },
      ],
    ]);
    useIssueByIdentifierMock.mockReturnValue({
      isLoading: false,
      isFetching: true,
      isError: false,
      data: null,
    });

    render(<IssueDetailWorkspaceRoute />);

    expect(issueDetailPageSpy).toHaveBeenCalledWith({
      issueId: cachedIssue.id,
      href: '/acme/team/eng/active',
      label: 'issues.detailPage.backToActiveIssues',
    });
    expect(screen.getByTestId('issue-detail-page-mock')).toHaveAttribute('data-issue-id', String(cachedIssue.id));
    expect(screen.queryByTestId('issue-detail-route-skeleton')).not.toBeInTheDocument();
    expect(screen.queryByTestId('app-layout-mock')).not.toBeInTheDocument();
  });

  it('builds the explicit workspace issue detail back-link contract from the shared legacy lookup seam', async () => {
    const lookup = await loadIssueDetailRouteLookup(42);

    expect(lookup).toEqual({
      issue: baseIssue,
      organizations: [
        { id: 7, slug: 'acme' },
        { id: 8, slug: 'design' },
      ],
    });
    expect(getIssueMock).toHaveBeenCalledWith(42);
    expect(getOrganizationsMock).toHaveBeenCalledTimes(1);
    expect(buildIssueDetailRouteBackLinkProps(lookup)).toEqual({
      href: '/acme/issue/ENG-42/issue-detail-shell-polish',
      label: null,
    });
  });

  it('passes the explicit workspace issue detail back-link contract through the legacy /issues/[id] route', async () => {
    const element = await IssueDetailRoute({ params: Promise.resolve({ id: '42' }) });
    render(element);

    expect(issueDetailPageSpy).toHaveBeenLastCalledWith({
      issueId: 42,
      href: '/acme/issue/ENG-42/issue-detail-shell-polish',
      label: null,
    });
  });

  function expectLegacyIssueDetailRouteEmptyProps() {
    expect(
      buildIssueDetailRouteBackLinkProps({
        issue: baseIssue,
        organizations: [{ id: 99, slug: 'other-workspace' }],
      })
    ).toEqual({});
  }

  function expectLegacyIssueRouteEmptyPropsContract() {
    expectLegacyIssueDetailRouteEmptyProps();
    expect(issueDetailPageSpy).toHaveBeenLastCalledWith({
      issueId: 42,
      href: undefined,
      label: undefined,
    });
  }

  it('returns the empty props contract when the helper workspace slug lookup misses', () => {
    expectLegacyIssueDetailRouteEmptyProps();
  });

  it('renders the empty props contract when the workspace slug lookup misses', async () => {
    getOrganizationsMock.mockResolvedValue([{ id: 99, slug: 'other-workspace' }]);

    const element = await IssueDetailRoute({ params: Promise.resolve({ id: '42' }) });
    render(element);

    expectLegacyIssueRouteEmptyPropsContract();
  });


  it('getIssue rejects', async () => {
    getIssueMock.mockRejectedValue(new Error('issue lookup failed'));

    const element = await IssueDetailRoute({ params: Promise.resolve({ id: '42' }) });
    render(element);

    expect(getIssueMock).toHaveBeenCalledWith(42);
    expect(getOrganizationsMock).toHaveBeenCalledTimes(1);
    expectLegacyIssueRouteEmptyPropsContract();
  });

  it('getOrganizations rejects', async () => {
    getOrganizationsMock.mockRejectedValue(new Error('organization lookup failed'));

    const element = await IssueDetailRoute({ params: Promise.resolve({ id: '42' }) });
    render(element);

    expect(getIssueMock).toHaveBeenCalledWith(42);
    expect(getOrganizationsMock).toHaveBeenCalledTimes(1);
    expectLegacyIssueRouteEmptyPropsContract();
  });
});
