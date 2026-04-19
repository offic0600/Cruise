'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import IssueDetailPage from '@/components/issues/IssueDetailPage';
import { cn } from '@/lib/utils';
import { useCurrentWorkspace } from '@/components/providers/WorkspaceProvider';
import { useI18n } from '@/i18n/useI18n';
import type { Issue, RestPageResponse } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';
import { useIssueByIdentifier } from '@/lib/query/issues';
import { teamActivePath } from '@/lib/routes';

type IssueDetailRouteSkeletonProps = {
  subtle?: boolean;
  showActions?: boolean;
};

function IssueDetailRouteSkeleton({ subtle = false, showActions = true }: IssueDetailRouteSkeletonProps) {
  const pulse = subtle ? 'bg-slate-100/85' : 'bg-slate-200/80';
  const pulseSoft = subtle ? 'bg-slate-100/70' : 'bg-slate-200/70';
  const surface = subtle ? 'bg-surface/80' : 'bg-surface-raised';
  const shadow = subtle ? 'shadow-[0_14px_38px_rgba(15,23,42,0.04)]' : 'shadow-[0_18px_48px_rgba(15,23,42,0.05)]';
  const contentCardTone = subtle ? 'bg-slate-100/80' : 'bg-slate-100';
  const contentCardToneAlt = subtle ? 'bg-slate-100/70' : 'bg-slate-100/90';
  const pillTone = subtle ? 'bg-slate-100/75' : 'bg-slate-100';

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-6 py-10" data-testid="issue-detail-route-skeleton" data-subtle={subtle ? 'true' : 'false'} data-show-actions={showActions ? 'true' : 'false'}>
      <div className="flex flex-col gap-6 border-b border-border-soft/80 pb-7">
        <div className={cn('h-5 w-40 animate-pulse rounded-full', pulse)} />
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0 flex-1 space-y-4">
            <div className={cn('h-12 w-full max-w-[520px] animate-pulse rounded-2xl', pulse)} />
            <div className={cn('h-5 w-32 animate-pulse rounded-full', pulseSoft)} />
          </div>
          {showActions ? (
            <div className="hidden shrink-0 items-center gap-2 xl:flex" data-testid="issue-detail-route-skeleton-actions">
              <div className={cn('h-9 w-9 animate-pulse rounded-full', pulse)} />
              <div className={cn('h-9 w-9 animate-pulse rounded-full', pulse)} />
              <div className={cn('h-9 w-9 animate-pulse rounded-full', pulse)} />
              <div className={cn('h-9 w-24 animate-pulse rounded-full', pulse)} />
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_292px]">
        <main className="min-w-0 space-y-8">
          <section className={cn('rounded-[28px] border border-border-subtle px-6 py-6', surface, shadow)}>
            <div className="space-y-4">
              <div className={cn('h-5 w-28 animate-pulse rounded-full', pulseSoft)} />
              <div className={cn('h-24 w-full animate-pulse rounded-[24px]', contentCardTone)} />
              <div className={cn('h-24 w-full animate-pulse rounded-[24px]', contentCardToneAlt)} />
            </div>
          </section>
          <section className="space-y-3">
            <div className={cn('h-5 w-24 animate-pulse rounded-full', pulseSoft)} />
            <div className={cn('h-14 w-full animate-pulse rounded-[22px]', contentCardTone)} />
          </section>
        </main>

        <aside className="space-y-3 xl:sticky xl:top-24 xl:self-start">
          <div className={cn('rounded-[24px] border border-border-subtle px-4 py-4', surface, subtle ? 'shadow-[0_14px_36px_rgba(15,23,42,0.04)]' : 'shadow-[0_18px_44px_rgba(15,23,42,0.05)]')}>
            <div className="space-y-3">
              <div className={cn('h-4 w-24 animate-pulse rounded-full', pulseSoft)} />
              <div className={cn('h-9 w-32 animate-pulse rounded-full', pillTone)} />
              <div className={cn('h-9 w-36 animate-pulse rounded-full', pillTone)} />
              <div className={cn('h-9 w-28 animate-pulse rounded-full', pillTone)} />
            </div>
          </div>
          <div className={cn('rounded-[24px] border border-border-subtle px-4 py-4', surface, subtle ? 'shadow-[0_14px_36px_rgba(15,23,42,0.04)]' : 'shadow-[0_18px_44px_rgba(15,23,42,0.05)]')}>
            <div className="space-y-3">
              <div className={cn('h-4 w-20 animate-pulse rounded-full', pulseSoft)} />
              <div className={cn('h-9 w-full animate-pulse rounded-full', pillTone)} />
              <div className={cn('h-9 w-5/6 animate-pulse rounded-full', pillTone)} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

type IssueDetailRouteBackLink = {
  href: string | null;
  label: string;
};

type IssueDetailRouteEmptyCopy = {
  badgeLabel: string;
  title: string;
  description: string;
};

type IssueDetailRouteEmptyStateCardModel = {
  badgeLabel: string;
  title: string;
  description: string;
};

type IssueDetailRouteEmptyStateBackLinkModel = {
  href: string | null;
  label: string;
  shouldRender: boolean;
};

type IssueDetailRouteEmptyStateModel = {
  identifier?: string;
  backLinkModel: IssueDetailRouteEmptyStateBackLinkModel;
  copy: IssueDetailRouteEmptyCopy;
};

type IssueDetailRouteShellState = {
  subtle?: boolean;
  showActions?: boolean;
};

type IssueDetailRouteShellModel = {
  emptyState: IssueDetailRouteEmptyStateModel;
  loadingState: Required<IssueDetailRouteShellState>;
  pageBackLink: IssueDetailRouteBackLink;
};

function buildIssueDetailRouteEmptyStateModel(
  identifier: string | undefined,
  backLinkModel: IssueDetailRouteEmptyStateBackLinkModel,
  copy: IssueDetailRouteEmptyCopy
): IssueDetailRouteEmptyStateModel {
  return {
    identifier,
    backLinkModel,
    copy,
  };
}

function buildIssueDetailRouteShellModel(
  identifier: string | undefined,
  backLinkModel: IssueDetailRouteEmptyStateBackLinkModel,
  copy: IssueDetailRouteEmptyCopy,
  loadingState?: IssueDetailRouteShellState
): IssueDetailRouteShellModel {
  return {
    emptyState: buildIssueDetailRouteEmptyStateModel(identifier, backLinkModel, copy),
    loadingState: {
      subtle: loadingState?.subtle ?? false,
      showActions: loadingState?.showActions ?? true,
    },
    pageBackLink: {
      href: backLinkModel.href,
      label: backLinkModel.label,
    },
  };
}

function buildIssueDetailRouteEmptyStateCardModel(identifier: string | undefined, copy: IssueDetailRouteEmptyCopy): IssueDetailRouteEmptyStateCardModel {
  return {
    badgeLabel: identifier ?? copy.badgeLabel,
    title: copy.title,
    description: copy.description,
  };
}

function buildIssueDetailRouteEmptyStateCardTestIds() {
  return {
    card: 'issue-detail-route-empty-card',
    badge: 'issue-detail-route-empty-badge',
    title: 'issue-detail-route-empty-title',
    description: 'issue-detail-route-empty-description',
  } as const;
}

function buildIssueDetailRouteEmptyStateBackLinkModel(backLink: IssueDetailRouteBackLink): IssueDetailRouteEmptyStateBackLinkModel {
  return {
    href: backLink.href,
    label: backLink.label,
    shouldRender: Boolean(backLink.href),
  };
}

function buildIssueDetailRouteEmptyStateLinkHref(backLinkModel: IssueDetailRouteEmptyStateBackLinkModel): string {
  return backLinkModel.href ?? '#';
}

function buildIssueDetailRouteBackLink(fallbackTeamRoute: string | null, activeIssuesLabel: string, fallbackIssuesLabel: string): IssueDetailRouteBackLink {
  return {
    href: fallbackTeamRoute,
    label: fallbackTeamRoute ? activeIssuesLabel : fallbackIssuesLabel,
  };
}

function buildIssueDetailRouteEmptyCopy(t: (key: string) => string): IssueDetailRouteEmptyCopy {
  return {
    badgeLabel: t('issues.detailPage.issueNotFoundBadge'),
    title: t('issues.detailPage.issueNotFoundTitle'),
    description: t('issues.detailPage.issueNotFoundDescription'),
  };
}


function IssueDetailRouteEmptyStateCard({ badgeLabel, title, description }: IssueDetailRouteEmptyStateCardModel) {
  const testIds = buildIssueDetailRouteEmptyStateCardTestIds();

  return (
    <div className="rounded-[28px] border border-border-subtle bg-surface-raised px-8 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)]" data-testid={testIds.card}>
      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-400" data-testid={testIds.badge}>
        {badgeLabel}
      </div>
      <h1 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-ink-900" data-testid={testIds.title}>
        {title}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-500" data-testid={testIds.description}>
        {description}
      </p>
    </div>
  );
}

function IssueDetailRouteEmptyState({ identifier, backLinkModel, copy }: IssueDetailRouteEmptyStateModel) {
  const cardModel = buildIssueDetailRouteEmptyStateCardModel(identifier, copy);

  return (
    <AppLayout>
      <div className="mx-auto flex w-full max-w-[960px] flex-col gap-4 px-6 py-16 text-ink-900">
        {backLinkModel.shouldRender ? (
          <div>
            <Link
              href={buildIssueDetailRouteEmptyStateLinkHref(backLinkModel)}
              className="inline-flex h-9 items-center gap-2 rounded-lg px-2 text-sm font-medium text-ink-500 transition-colors hover:bg-slate-100 hover:text-ink-900"
            >
              <ArrowLeft className="h-4 w-4" />
              {backLinkModel.label}
            </Link>
          </div>
        ) : null}
        <IssueDetailRouteEmptyStateCard {...cardModel} />
      </div>
    </AppLayout>
  );
}

export {
  IssueDetailRouteEmptyState,
  IssueDetailRouteEmptyStateCard,
  IssueDetailRouteSkeleton,
  buildIssueDetailRouteBackLink,
  buildIssueDetailRouteEmptyCopy,
  buildIssueDetailRouteEmptyStateBackLinkModel,
  buildIssueDetailRouteEmptyStateCardModel,
  buildIssueDetailRouteEmptyStateCardTestIds,
  buildIssueDetailRouteEmptyStateLinkHref,
  buildIssueDetailRouteEmptyStateModel,
  buildIssueDetailRouteShellModel,
};

export default function IssueDetailWorkspaceRoute() {
  const params = useParams<{ identifier: string }>();
  const identifier = Array.isArray(params.identifier) ? params.identifier[0] : params.identifier;
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { organizationId, currentOrganizationSlug, currentTeamKey } = useCurrentWorkspace();
  const fallbackTeamRoute = currentOrganizationSlug && currentTeamKey ? teamActivePath(currentOrganizationSlug, currentTeamKey) : null;
  const cachedIssue = useMemo(() => {
    if (organizationId == null || !identifier) return null;
    const issuePages = queryClient.getQueriesData<RestPageResponse<Issue>>({ queryKey: ['issues'] });
    for (const [, page] of issuePages) {
      const matched = page?.items?.find((issue) => issue.organizationId === organizationId && issue.identifier === identifier);
      if (matched) return matched;
    }
    return null;
  }, [identifier, organizationId, queryClient]);

  const issueLookupQuery = useIssueByIdentifier(organizationId, identifier, cachedIssue);
  const routeBackLink = buildIssueDetailRouteBackLink(
    fallbackTeamRoute,
    t('issues.detailPage.backToActiveIssues'),
    t('issues.detailPage.backToIssues')
  );
  const routeShellModel = buildIssueDetailRouteShellModel(
    identifier,
    buildIssueDetailRouteEmptyStateBackLinkModel(routeBackLink),
    buildIssueDetailRouteEmptyCopy(t)
  );
  const backgroundRefetchRouteShellModel = buildIssueDetailRouteShellModel(
    identifier,
    routeShellModel.emptyState.backLinkModel,
    routeShellModel.emptyState.copy,
    { subtle: true, showActions: false }
  );

  useEffect(() => {
    if (!issueLookupQuery.data) return;
    queryClient.setQueryData(queryKeys.issueDetail(issueLookupQuery.data.id), issueLookupQuery.data);
  }, [issueLookupQuery.data, queryClient]);

  const issueId = useMemo(() => issueLookupQuery.data?.id ?? null, [issueLookupQuery.data?.id]);

  if (issueLookupQuery.isLoading) {
    return (
      <AppLayout>
        <IssueDetailRouteSkeleton {...routeShellModel.loadingState} />
      </AppLayout>
    );
  }

  if (issueLookupQuery.isFetching && !cachedIssue && !issueLookupQuery.data) {
    return (
      <AppLayout>
        <IssueDetailRouteSkeleton {...backgroundRefetchRouteShellModel.loadingState} />
      </AppLayout>
    );
  }

  if (issueLookupQuery.isFetching && cachedIssue) {
    return <IssueDetailPage issueId={cachedIssue.id} {...backgroundRefetchRouteShellModel.pageBackLink} />;
  }

  if (issueLookupQuery.isError) {
    return <IssueDetailRouteEmptyState {...routeShellModel.emptyState} />;
  }

  if (!issueId) {
    return <IssueDetailRouteEmptyState {...routeShellModel.emptyState} />;
  }

  return <IssueDetailPage issueId={issueId} {...routeShellModel.pageBackLink} />;
}
