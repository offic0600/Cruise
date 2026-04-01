'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentWorkspace } from '@/components/providers/WorkspaceProvider';
import { workspaceProjectsAllPath } from '@/lib/routes';

export default function ProjectsPage() {
  const router = useRouter();
  const { currentOrganizationSlug, isLoading } = useCurrentWorkspace();

  useEffect(() => {
    if (isLoading || !currentOrganizationSlug) return;
    router.replace(workspaceProjectsAllPath(currentOrganizationSlug));
  }, [currentOrganizationSlug, isLoading, router]);

  return null;
}
