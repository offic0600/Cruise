'use client';

import NewViewWorkbench from '@/components/views/NewViewWorkbench';

export default function NewTeamIssueViewPage() {
  return <NewViewWorkbench resourceType="ISSUE" initialSaveTarget="TEAM" />;
}
