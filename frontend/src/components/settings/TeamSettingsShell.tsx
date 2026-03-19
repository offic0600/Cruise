'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { localizePath } from '@/i18n/config';
import { useI18n } from '@/i18n/useI18n';

const tabs = [
  { href: '/teams/current/settings/templates', label: 'Templates' },
  { href: '/teams/current/settings/recurring', label: 'Recurring issues' },
  { href: '/teams/current/settings/email-intake', label: 'Email intake' },
];

export default function TeamSettingsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { locale, t } = useI18n();

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
          href={localizePath(locale, '/team-members')}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-border-soft bg-white px-4 text-sm font-medium text-ink-700 transition hover:bg-slate-50"
        >
          {t('settings.team.teamMembers')}
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const href = localizePath(locale, tab.href);
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

      {children}
    </div>
  );
}
