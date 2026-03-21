import type { ComponentType } from 'react';
import TeamSettingsEmailIntakePage from '@/app/teams/current/settings/email-intake/page';
import TeamSettingsRecurringPage from '@/app/teams/current/settings/recurring/page';
import TeamSettingsTemplatesPage from '@/app/teams/current/settings/templates/page';
import { redirect } from 'next/navigation';

const SECTION_COMPONENTS = {
  'email-intake': TeamSettingsEmailIntakePage,
  recurring: TeamSettingsRecurringPage,
  templates: TeamSettingsTemplatesPage,
} satisfies Record<string, ComponentType>;

export default async function TeamSettingsRoutePage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; teamKey: string; section?: string[] }>;
}) {
  const { workspaceSlug, teamKey, section } = await params;
  const currentSection = section?.[0];

  if (!currentSection) {
    redirect(`/${workspaceSlug}/team/${teamKey}/settings/templates`);
  }

  const Component = SECTION_COMPONENTS[currentSection as keyof typeof SECTION_COMPONENTS];
  if (!Component) {
    redirect(`/${workspaceSlug}/team/${teamKey}/settings/templates`);
  }

  return <Component />;
}
