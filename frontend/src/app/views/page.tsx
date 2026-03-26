'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentWorkspace } from '@/components/providers/WorkspaceProvider';
import { workspaceViewsPath } from '@/lib/routes';

export default function ViewsPage() {
  const router = useRouter();
  const { currentOrganizationSlug } = useCurrentWorkspace();

  useEffect(() => {
    if (!currentOrganizationSlug) return;
    router.replace(workspaceViewsPath(currentOrganizationSlug, 'issues'));
  }, [currentOrganizationSlug, router]);

  return <div className="flex min-h-screen items-center justify-center bg-page-glow text-ink-700">Loading views...</div>;
}
