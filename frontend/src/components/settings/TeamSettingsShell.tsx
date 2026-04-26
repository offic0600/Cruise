'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCurrentWorkspace } from '@/components/providers/WorkspaceProvider';
import { useI18n } from '@/i18n/useI18n';
import { teamSettingsPath, workspaceSectionPath } from '@/lib/routes';

const tabs = [
  { href: '/teams/current/settings/templates', label: 'Templates' },
  { href: '/teams/current/settings/recurring', label: 'Recurring issues' },
  { href: '/teams/current/settings/email-intake', label: 'Email intake' },
];

const settingsGroups = [
  {
    titleKey: 'settings.navigation.account',
    disabled: true,
    links: [
      { href: '/settings/account/preferences', labelKey: 'settings.navigation.preferences' },
      { href: '/settings/account/profile', labelKey: 'settings.navigation.profile' },
      { href: '/settings/account/notifications', labelKey: 'settings.navigation.notifications' },
      { href: '/settings/account/security', labelKey: 'settings.navigation.security' },
      { href: '/settings/account/connections', labelKey: 'settings.navigation.connections' },
      { href: '/settings/account/agents', labelKey: 'settings.navigation.agents' },
    ],
  },
  {
    titleKey: 'settings.navigation.workspace',
    disabled: true,
    links: [
      { href: '/settings/issue-labels', labelKey: 'settings.navigation.labels' },
      { href: '/settings/issue-templates', labelKey: 'settings.navigation.issueTemplates' },
    ],
  },
  {
    titleKey: 'settings.navigation.team',
    links: [
      { href: '/teams/current/settings/templates', labelKey: 'settings.team.templates' },
      { href: '/teams/current/settings/recurring', labelKey: 'settings.team.recurring' },
      { href: '/teams/current/settings/email-intake', labelKey: 'settings.team.emailIntake' },
    ],
  },
];

export default function TeamSettingsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const { currentOrganizationSlug, currentTeamKey } = useCurrentWorkspace();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-sm uppercase tracking-[0.18em] text-ink-400">{t('settings.team.eyebrow')}</div>
          <h1 className="text-3xl font-semibold text-ink-900">{t('settings.team.title')}</h1>
          <p className="mt-2 max-w-3xl text-sm text-ink-600">
            {t('settings.team.subtitle')}
          </p>
        </div>
        <Link
          href={currentOrganizationSlug ? workspaceSectionPath(currentOrganizationSlug, 'team-members') : '#'}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-border-soft bg-white px-4 text-sm font-medium text-ink-700 transition hover:bg-slate-50"
        >
          {t('settings.team.teamMembers')}
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="space-y-5 rounded-3xl border border-border-soft bg-white p-4">
          <div className="flex flex-wrap gap-2 xl:hidden">
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
                    : t('settings.team.emailIntake');
              return (
                <Link
                  key={tab.href}
                  href={href}
                  className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition ${
                    active ? 'bg-slate-900 text-white' : 'border border-border-soft bg-white text-ink-700 hover:bg-slate-50'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          <div className="hidden space-y-5 xl:block">
            {settingsGroups.map((group) => (
              <div key={group.titleKey} className="space-y-2">
                <div className="px-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink-400">
                  {t(group.titleKey)}
                </div>
                <div className="space-y-1">
                  {group.links.map((link) => {
                    const href =
                      !group.disabled && link.href.startsWith('/teams/current/settings/') && currentOrganizationSlug && currentTeamKey
                        ? teamSettingsPath(currentOrganizationSlug, currentTeamKey, link.href.split('/').pop())
                        : !group.disabled && currentOrganizationSlug
                          ? workspaceSectionPath(currentOrganizationSlug, link.href.replace(/^\//, ''))
                          : '#';
                    const active = pathname === href;
                    return group.disabled ? (
                      <span
                        key={link.href}
                        className="flex cursor-not-allowed items-center justify-between rounded-2xl px-3 py-2 text-sm text-ink-400"
                      >
                        {t(link.labelKey)}
                        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-300">
                          {t('settings.shared.soon')}
                        </span>
                      </span>
                    ) : (
                      <Link
                        key={link.href}
                        href={href}
                        className={`flex items-center rounded-2xl px-3 py-2 text-sm transition ${
                          active ? 'bg-slate-900 text-white' : 'text-ink-700 hover:bg-slate-50'
                        }`}
                      >
                        {t(link.labelKey)}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <div>{children}</div>
      </div>
    </div>
  );
}
