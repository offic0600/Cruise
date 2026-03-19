'use client';

import AppLayout from '@/components/AppLayout';
import TemplateSettingsView from '@/components/settings/TemplateSettingsView';
import TeamSettingsShell from '@/components/settings/TeamSettingsShell';

export default function TeamSettingsTemplatesPage() {
  return (
    <AppLayout>
      <TeamSettingsShell>
        <TemplateSettingsView />
      </TeamSettingsShell>
    </AppLayout>
  );
}
