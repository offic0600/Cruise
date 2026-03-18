'use client';

import { useSearchParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import IssueComposer from '@/components/issues/IssueComposer';

export default function NewIssuePage() {
  const searchParams = useSearchParams();
  const draftId = searchParams.get('draftId');

  return (
    <AppLayout>
      <IssueComposer
        mode="page"
        initialParams={new URLSearchParams(searchParams.toString())}
        initialDraftId={draftId ? Number(draftId) : null}
        localeScope="issues-new-page"
      />
    </AppLayout>
  );
}
