'use client';

import { useSearchParams } from 'next/navigation';
import IssueComposer from '@/components/issues/IssueComposer';

export default function NewIssuePage() {
  const searchParams = useSearchParams();

  return (
    <IssueComposer
      mode="page"
      initialParams={new URLSearchParams(searchParams.toString())}
      localeScope="issues-new-page"
    />
  );
}
