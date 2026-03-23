'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentWorkspace } from '@/components/providers/WorkspaceProvider';
import { getStoredSession } from '@/lib/auth';
import { publicPath, teamActivePath, workspaceRootPath } from '@/lib/routes';

export default function Home() {
  const router = useRouter();
  const {
    organizations,
    currentOrganizationSlug,
    currentTeamKey,
    isLoading,
    error,
  } = useCurrentWorkspace();

  useEffect(() => {
    const replace = (target: string) => {
      if (typeof window !== 'undefined' && window.location.pathname !== target) {
        window.location.replace(target);
        return;
      }
      router.replace(target);
    };
    const session = getStoredSession();
    if (!session?.user) {
      replace(publicPath('/login'));
      return;
    }
    if (error) return;
    if (isLoading) return;
    if (!organizations.length) {
      replace(publicPath('/create-workspace'));
      return;
    }
    if (currentOrganizationSlug && currentTeamKey) {
      replace(teamActivePath(currentOrganizationSlug, currentTeamKey));
      return;
    }
    if (currentOrganizationSlug) {
      replace(workspaceRootPath(currentOrganizationSlug));
    }
  }, [currentOrganizationSlug, currentTeamKey, error, isLoading, organizations.length, router]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-page-glow text-ink-700">
        <div>Failed to load workspace.</div>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-full border border-border-soft bg-white px-4 py-2 text-sm transition hover:bg-slate-50"
        >
          Retry
        </button>
      </div>
    );
  }

  return <div className="flex min-h-screen items-center justify-center bg-page-glow text-ink-700">Loading workspace...</div>;
}
