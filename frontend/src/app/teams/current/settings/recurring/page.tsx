'use client';

import AppLayout from '@/components/AppLayout';
import RecurringSettingsView from '@/components/settings/RecurringSettingsView';
import TeamSettingsShell from '@/components/settings/TeamSettingsShell';

export default function TeamSettingsRecurringPage() {
  return (
    <AppLayout>
      <TeamSettingsShell>
        <RecurringSettingsView />
      </TeamSettingsShell>
    </AppLayout>
  );
}
