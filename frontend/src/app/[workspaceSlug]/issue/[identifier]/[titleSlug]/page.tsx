'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import IssueDetailPage from '@/components/issues/IssueDetailPage';
import { useCurrentWorkspace } from '@/components/providers/WorkspaceProvider';
import { useI18n } from '@/i18n/useI18n';
import { getIssues } from '@/lib/api';

export default function IssueDetailWorkspaceRoute() {
  const params = useParams<{ identifier: string }>();
  const identifier = Array.isArray(params.identifier) ? params.identifier[0] : params.identifier;
  const { t } = useI18n();
  const { organizationId, currentTeamId } = useCurrentWorkspace();

  const issueLookupQuery = useQuery({
    queryKey: ['issues', 'identifier', organizationId ?? 'none', currentTeamId ?? 'all', identifier],
    queryFn: () =>
      getIssues({
        organizationId: organizationId ?? 1,
        teamId: currentTeamId ?? undefined,
        q: identifier,
        size: 100,
      }),
    select: (response) => response.items.find((issue) => issue.identifier === identifier) ?? null,
    enabled: organizationId != null && Boolean(identifier),
  });

  const issueId = useMemo(() => issueLookupQuery.data?.id ?? null, [issueLookupQuery.data?.id]);

  if (issueLookupQuery.isLoading) {
    return (
      <AppLayout>
        <div className="py-16 text-center text-ink-400">{t('common.loading')}</div>
      </AppLayout>
    );
  }

  if (!issueId) {
    return (
      <AppLayout>
        <div className="py-16 text-center text-ink-400">{t('common.empty')}</div>
      </AppLayout>
    );
  }

  return <IssueDetailPage issueId={issueId} />;
}
