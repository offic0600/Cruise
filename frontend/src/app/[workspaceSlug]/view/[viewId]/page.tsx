'use client';

import { useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import ViewsWorkbench from '@/components/views/ViewsWorkbench';
import { useViewDetail } from '@/lib/query/views';

const LAST_ACTIVE_VIEW_KEY_PREFIX = 'lastActiveView';

export default function WorkspaceViewDetailPage() {
  const params = useParams<{ workspaceSlug: string; viewId: string }>();
  const rawViewId = Array.isArray(params.viewId) ? params.viewId[0] : params.viewId;
  const workspaceSlug = Array.isArray(params.workspaceSlug) ? params.workspaceSlug[0] : params.workspaceSlug;
  const parsedViewId = rawViewId?.match(/-(\d+)$/)?.[1] ?? rawViewId;
  const viewId = Number(parsedViewId);
  const viewQuery = useViewDetail(Number.isFinite(viewId) ? viewId : null);

  useEffect(() => {
    if (typeof window === 'undefined' || !viewQuery.data || !workspaceSlug) return;
    const scopeSegment =
      viewQuery.data.scopeType === 'TEAM'
        ? `${viewQuery.data.scopeType}:${viewQuery.data.scopeId ?? 'unknown'}`
        : `${viewQuery.data.scopeType}:root`;
    window.localStorage.setItem(
      `${LAST_ACTIVE_VIEW_KEY_PREFIX}:${workspaceSlug}:${scopeSegment}:${viewQuery.data.resourceType}`,
      String(viewQuery.data.id)
    );
  }, [viewQuery.data, workspaceSlug]);

  if (!Number.isFinite(viewId)) {
    notFound();
  }

  return <ViewsWorkbench viewId={viewId} defaultResourceType={viewQuery.data?.resourceType} />;
}
