'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PageHeader } from '@/design-system/patterns/PageHeader';
import { useCurrentWorkspace } from '@/components/providers/WorkspaceProvider';
import { useI18n } from '@/i18n/useI18n';
import { teamSettingsPath, workspaceSectionPath } from '@/lib/routes';

const tabs = [
  { href: '/teams/current/settings/templates', label: 'Templates' },
  { href: '/teams/current/settings/recurring', label: 'Recurring issues' },
  { href: '/teams/current/settings/email-intake', label: 'Email intake' },
  { href: '/teams/current/settings/auth', label: 'Authentication' },
];

export default function TeamSettingsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const { currentOrganizationSlug, currentTeamKey } = useCurrentWorkspace();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t('settings.team.eyebrow')}
        title={t('settings.team.title')}
        description={t('settings.team.subtitle')}
        actions={
          <Link
            href={currentOrganizationSlug ? workspaceSectionPath(currentOrganizationSlug, 'team-members') : '#'}
            className="inline-flex h-[var(--button-height-md)] items-center justify-center rounded-full border border-border-soft bg-surface-elevated px-4 text-sm font-medium text-ink-700 transition hover:bg-surface-soft"
          >
            {t('settings.team.teamMembers')}
          </Link>
        }
      />

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const section = tab.href.split('/').pop();
          const href =
            currentOrganizationSlug && currentTeamKey && section
              ? teamSettingsPath(currentOrganizationSlug, currentTeamKey, section)
              : '#';
          const active = pathname === href;
          const label =
            tab.href.endsWith('/templates')
              ? t('settings.team.templates')
              : tab.href.endsWith('/recurring')
                ? t('settings.team.recurring')
                : tab.href.endsWith('/email-intake')
                  ? t('settings.team.emailIntake')
                  : t('settings.team.authProviders');
          return (
            <Link
              key={tab.href}
              href={href}
              className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition ${
                active ? 'bg-[color:var(--bg-inverse)] text-[color:var(--fg-inverse)] shadow-card' : 'border border-border-soft bg-surface-elevated text-ink-700 hover:bg-surface-soft'
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
