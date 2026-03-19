'use client';

import AppLayout from '@/components/AppLayout';
import EmailIntakeSettingsView from '@/components/settings/EmailIntakeSettingsView';
import TeamSettingsShell from '@/components/settings/TeamSettingsShell';

export default function TeamSettingsEmailIntakePage() {
  return (
    <AppLayout>
      <TeamSettingsShell>
        <EmailIntakeSettingsView />
      </TeamSettingsShell>
    </AppLayout>
  );
}
