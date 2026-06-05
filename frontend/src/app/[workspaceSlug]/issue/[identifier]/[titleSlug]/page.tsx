'use client';

import { useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import AppLayout from '@/components/AppLayout';
import IssueDetailPage from '@/components/issues/IssueDetailPage';
import { useCurrentWorkspace } from '@/components/providers/WorkspaceProvider';
import { useI18n } from '@/i18n/useI18n';
import type { Issue, RestPageResponse } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';
import { useIssueByIdentifier } from '@/lib/query/issues';

export default function IssueDetailWorkspaceRoute() {
  const params = useParams<{ identifier: string }>();
  const identifier = Array.isArray(params.identifier) ? params.identifier[0] : params.identifier;
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { organizationId } = useCurrentWorkspace();
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

  useEffect(() => {
    if (!issueLookupQuery.data) return;
    queryClient.setQueryData(queryKeys.issueDetail(issueLookupQuery.data.id), issueLookupQuery.data);
  }, [issueLookupQuery.data, queryClient]);

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
