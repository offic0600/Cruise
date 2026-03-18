'use client';

import { useEffect, useMemo, useState } from 'react';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import { Button } from '@/components/ui/button';
import { localizePath } from '@/i18n/config';
import { useI18n } from '@/i18n/useI18n';
import { clearSession, getStoredUser, type StoredUser } from '@/lib/auth';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, t } = useI18n();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navItems = useMemo<NavItem[]>(
    () => [
      { href: '/issues', label: t('nav.issues'), icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 7h6m-6 4h6m-7-8h.01M9 16h.01' },
      { href: '/projects', label: t('nav.projects'), icon: 'M4 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v2H4V7zm0 4h16v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6z' },
      { href: '/views', label: t('nav.views'), icon: 'M4 6h16M4 12h10M4 18h7' },
      { href: '/team-members', label: t('nav.teamMembers'), icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    ],
    [t]
  );

  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser) {
      router.replace(localizePath(locale, '/login'));
      return;
    }
    setUser(storedUser);
  }, [locale, router]);

  const handleLogout = () => {
    clearSession();
    router.push(localizePath(locale, '/login'));
  };

  if (!user) return null;

  return (
    <div className="app-shell">
      <aside className={`glass-sidebar fixed inset-y-0 left-0 z-30 w-72 transition-transform xl:translate-x-0 ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'} xl:block`}>
        <div className="flex h-full flex-col">
          <div className="border-b border-border-subtle px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="brand-badge flex h-11 w-11 items-center justify-center rounded-card">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <div className="text-lg font-semibold">Cruise</div>
                <div className="text-sm text-ink-700">{t('common.workspace')}</div>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-4 py-5">
            {navItems.map((item) => {
              const href = localizePath(locale, item.href);
              const isActive = pathname === href;
              return (
                <Link
                  key={item.href}
                  href={href}
                  className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-border-subtle px-4 py-4">
            <div className="subtle-card p-4">
              <div className="text-sm font-medium text-ink-900">{user.username}</div>
              <div className="mt-1 text-xs text-ink-700">{user.role}</div>
              <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <div className="min-w-0">
                  <LocaleSwitcher />
                </div>
                <Button onClick={handleLogout} variant="secondary" size="sm" className="shrink-0 whitespace-nowrap">
                  {t('nav.logout')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="xl:ml-72">
        <main className="px-5 py-6 sm:px-8">
          <div className="mb-4 xl:hidden">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setMobileNavOpen((current) => !current)}
              aria-label="Toggle navigation"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
