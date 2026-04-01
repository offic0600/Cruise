'use client';

import { notFound, useParams } from 'next/navigation';
import ViewsDirectory from '@/components/views/ViewsDirectory';

export default function WorkspaceViewsResourcePage() {
  const params = useParams<{ resourceType: string }>();
  const resourceParam = Array.isArray(params.resourceType) ? params.resourceType[0] : params.resourceType;
  const resourceType =
    resourceParam === 'issues'
      ? 'ISSUE'
      : resourceParam === 'projects'
        ? 'PROJECT'
        : resourceParam === 'initiatives'
          ? 'INITIATIVE'
          : null;

  if (!resourceType) {
    notFound();
  }

  return <ViewsDirectory resourceType={resourceType} scopeType="WORKSPACE" scopeId={null} />;
}
