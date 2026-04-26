'use client';

import ViewsDirectory from '@/components/views/ViewsDirectory';

export default function WorkspaceViewsRootPage() {
  return <ViewsDirectory resourceType="ISSUE" scopeType="WORKSPACE" scopeId={null} />;
}
