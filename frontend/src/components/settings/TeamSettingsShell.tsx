'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCurrentWorkspace } from '@/components/providers/WorkspaceProvider';
import { useI18n } from '@/i18n/useI18n';
import { teamSettingsPath, workspaceSectionPath } from '@/lib/routes';

const tabs = [
  {
    href: '/teams/current/settings/templates',
    labelKey: 'settings.team.templates',
    description: 'Reusable issue defaults',
    sections: ['templates', 'issue-templates', 'project-templates'],
  },
  {
    href: '/teams/current/settings/recurring',
    labelKey: 'settings.team.recurring',
    description: 'Scheduled issue creation',
    sections: ['recurring'],
  },
  {
    href: '/teams/current/settings/email-intake',
    labelKey: 'settings.team.emailIntake',
    description: 'Mailbox-to-issue routing',
    sections: ['email-intake'],
  },
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
  const currentSection = pathname.split('/').filter(Boolean).at(-1);
  const currentTab =
    tabs.find((tab) => currentSection ? tab.sections.includes(currentSection) : false) ?? tabs[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-border-soft pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-ink-400">
            <Link
              href={currentOrganizationSlug ? workspaceSectionPath(currentOrganizationSlug, '') : '#'}
              className="font-medium text-ink-500 hover:text-ink-900"
            >
              Back to app
            </Link>
            <span>/</span>
            <span>{currentTeamKey ?? 'Team'}</span>
            <span>/</span>
            <span className="text-ink-700">{t(currentTab.labelKey)}</span>
          </div>
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
        <aside className="space-y-5 rounded-3xl border border-border-soft bg-white p-4 xl:sticky xl:top-4 xl:self-start">
          <div className="flex flex-wrap gap-2 xl:hidden">
            {tabs.map((tab) => {
              const href =
                currentOrganizationSlug && currentTeamKey
                  ? teamSettingsPath(currentOrganizationSlug, currentTeamKey, tab.sections[0])
                  : '#';
              const active = currentSection ? tab.sections.includes(currentSection) : false;
              return (
                <Link
                  key={tab.href}
                  href={href}
                  className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition ${
                    active ? 'bg-slate-900 text-white' : 'border border-border-soft bg-white text-ink-700 hover:bg-slate-50'
                  }`}
                >
                  {t(tab.labelKey)}
                </Link>
              );
            })}
          </div>

          <div className="hidden space-y-5 xl:block">
            <div className="rounded-2xl bg-slate-50 p-3">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-400">Current section</div>
              <div className="mt-2 text-sm font-semibold text-ink-900">{t(currentTab.labelKey)}</div>
              <div className="mt-1 text-xs text-ink-500">{currentTab.description}</div>
            </div>
            {settingsGroups.map((group) => (
              <div key={group.titleKey} className="space-y-2">
                <div className="px-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink-400">
                  {t(group.titleKey)}
                </div>
                <div className="space-y-1">
                  {group.links.map((link) => {
                    const section = link.href.split('/').pop();
                    const href =
                      !group.disabled && link.href.startsWith('/teams/current/settings/') && currentOrganizationSlug && currentTeamKey && section
                        ? teamSettingsPath(currentOrganizationSlug, currentTeamKey, section)
                        : !group.disabled && currentOrganizationSlug
                          ? workspaceSectionPath(currentOrganizationSlug, link.href.replace(/^\//, ''))
                          : '#';
                    const active = section ? currentSection === section || (section === 'templates' && currentTab.sections.includes(section)) : pathname === href;
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
                        className={`flex items-center justify-between rounded-2xl px-3 py-2 text-sm transition ${
                          active ? 'bg-slate-900 text-white shadow-sm' : 'text-ink-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{t(link.labelKey)}</span>
                        {active ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
