'use client';

import { useEffect } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import AgentPage from '@/app/agent/page';
import CustomFieldsPage from '@/app/custom-fields/page';
import CustomersPage from '@/app/customers/page';
import DashboardPage from '@/app/dashboard/page';
import DefectsPage from '@/app/defects/page';
import DraftsPage from '@/app/drafts/page';
import InitiativesPage from '@/app/initiatives/page';
import ProjectsPage from '@/app/projects/page';
import RequirementsPage from '@/app/requirements/page';
import RoadmapsPage from '@/app/roadmaps/page';
import SearchPage from '@/app/search/page';
import SkillsPage from '@/app/skills/page';
import TasksPage from '@/app/tasks/page';
import TeamMembersPage from '@/app/team-members/page';
import ViewsPage from '@/app/views/page';
import { useCurrentWorkspace } from '@/components/providers/WorkspaceProvider';
import { teamSettingsPath } from '@/lib/routes';

const SECTION_COMPONENTS = {
  agent: AgentPage,
  'custom-fields': CustomFieldsPage,
  customers: CustomersPage,
  dashboard: DashboardPage,
  defects: DefectsPage,
  drafts: DraftsPage,
  initiatives: InitiativesPage,
  projects: ProjectsPage,
  requirements: RequirementsPage,
  roadmaps: RoadmapsPage,
  search: SearchPage,
  skills: SkillsPage,
  tasks: TasksPage,
  'team-members': TeamMembersPage,
  views: ViewsPage,
} as const;

const TEAM_SETTINGS_SECTIONS = new Set(['email-intake', 'recurring', 'templates']);

export default function WorkspaceSectionPage() {
  const params = useParams<{ section: string }>();
  const router = useRouter();
  const { currentOrganizationSlug, currentTeamKey } = useCurrentWorkspace();
  const section = Array.isArray(params.section) ? params.section[0] : params.section;

  useEffect(() => {
    if (!section || !TEAM_SETTINGS_SECTIONS.has(section)) return;
    if (!currentOrganizationSlug || !currentTeamKey) return;
    router.replace(teamSettingsPath(currentOrganizationSlug, currentTeamKey, section));
  }, [currentOrganizationSlug, currentTeamKey, router, section]);

  if (!section) {
    notFound();
  }

  if (TEAM_SETTINGS_SECTIONS.has(section)) {
    return <div className="flex min-h-screen items-center justify-center bg-page-glow text-ink-700">Loading settings...</div>;
  }

  const Component = SECTION_COMPONENTS[section as keyof typeof SECTION_COMPONENTS];
  if (!Component) {
    notFound();
  }

  return <Component />;
}
