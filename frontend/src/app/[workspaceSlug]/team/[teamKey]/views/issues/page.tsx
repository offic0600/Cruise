'use client';

import { useParams } from 'next/navigation';
import ViewsDirectory from '@/components/views/ViewsDirectory';

export default function TeamIssueViewsPage() {
  const params = useParams<{ workspaceSlug: string; teamKey: string }>();
  const teamKey = Array.isArray(params.teamKey) ? params.teamKey[0] : params.teamKey;

  return <ViewsDirectory resourceType="ISSUE" scopeType="TEAM" scopeId={null} teamKey={teamKey ?? null} />;
}
