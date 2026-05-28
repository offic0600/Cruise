'use client';

import AppLayout from '@/components/AppLayout';
import AuthProvidersSettingsView from '@/components/settings/AuthProvidersSettingsView';
import TeamSettingsShell from '@/components/settings/TeamSettingsShell';

export default function TeamSettingsAuthPage() {
  return (
    <AppLayout>
      <TeamSettingsShell>
        <AuthProvidersSettingsView />
      </TeamSettingsShell>
    </AppLayout>
  );
}
