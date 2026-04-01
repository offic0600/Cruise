'use client';

import { notFound, useParams } from 'next/navigation';
import WorkspaceProjectsPage from '@/components/projects/WorkspaceProjectsPage';

export default function WorkspaceProjectViewPage() {
  const params = useParams<{ viewId: string }>();
  const rawViewId = Array.isArray(params.viewId) ? params.viewId[0] : params.viewId;
  const parsedViewId = rawViewId?.match(/-(\d+)$/)?.[1] ?? rawViewId;
  const viewId = Number(parsedViewId);

  if (!Number.isFinite(viewId)) {
    notFound();
  }

  return <WorkspaceProjectsPage activeViewId={viewId} />;
}
