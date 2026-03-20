'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentWorkspace } from '@/components/providers/WorkspaceProvider';
import { getStoredSession } from '@/lib/auth';
import { publicPath, teamActivePath } from '@/lib/routes';

export default function Home() {
  const router = useRouter();
  const {
    organizations,
    currentOrganizationSlug,
    currentTeamKey,
    isLoading,
  } = useCurrentWorkspace();

  useEffect(() => {
    const session = getStoredSession();
    if (!session?.user) {
      router.replace(publicPath('/login'));
      return;
    }
    if (isLoading) return;
    if (!organizations.length) {
      router.replace(publicPath('/create-workspace'));
      return;
    }
    if (currentOrganizationSlug && currentTeamKey) {
      router.replace(teamActivePath(currentOrganizationSlug, currentTeamKey));
    }
  }, [currentOrganizationSlug, currentTeamKey, isLoading, organizations.length, router]);

  return <div className="flex min-h-screen items-center justify-center bg-page-glow text-ink-700">Loading workspace...</div>;
}
