'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import WorkspaceHeader from '@/components/WorkspaceHeader';
import { useCurrentWorkspace } from '@/components/providers/WorkspaceProvider';
import IssueComposer from '@/components/issues/IssueComposer';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n/useI18n';
import { clearSession, getStoredSession, type StoredUser } from '@/lib/auth';
import { publicPath, teamActivePath, teamSettingsPath, teamViewsPath, workspaceRootPath, workspaceSectionPath, workspaceViewsPath } from '@/lib/routes';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const SHORTCUT_TIMEOUT_MS = 1000;
const WORKSPACE_NAV_STORAGE_PREFIX = 'workspaceNavItems';
const DEFAULT_WORKSPACE_NAV_ITEMS = ['/projects', '/views/issues', '/team-members'];

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || target.isContentEditable;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();
  const {
    organizations,
    currentOrganization,
    currentOrganizationSlug,
    currentOrganizationId,
    setCurrentOrganizationId,
    currentTeamKey,
    currentTeamId,
    isLoading: workspaceLoading,
  } = useCurrentWorkspace();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [workspaceSectionOpen, setWorkspaceSectionOpen] = useState(true);
  const [workspaceMoreOpen, setWorkspaceMoreOpen] = useState(false);
  const [workspaceNavItemKeys, setWorkspaceNavItemKeys] = useState<string[]>(DEFAULT_WORKSPACE_NAV_ITEMS);
  const [focusSwitchWorkspace, setFocusSwitchWorkspace] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const shortcutBuffer = useRef('');
  const shortcutTimerRef = useRef<number | null>(null);

  const navItems = useMemo<NavItem[]>(
    () => [
      { href: 'team-active', label: t('nav.issues'), icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 7h6m-6 4h6m-7-8h.01M9 16h.01' },
      { href: '/projects', label: t('nav.projects'), icon: 'M4 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v2H4V7zm0 4h16v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6z' },
      { href: '/views/issues', label: t('nav.views'), icon: 'M4 6h16M4 12h10M4 18h7' },
      { href: '/teams', label: t('nav.teams'), icon: 'M3 7h18M6 3h12a2 2 0 012 2v14l-4-2-4 2-4-2-4 2V5a2 2 0 012-2z' },
      { href: '/team-members', label: t('nav.members'), icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
      { href: '/agent', label: t('nav.more'), icon: 'M6 12a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm4.5 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm4.5 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z' },
    ],
    [t]
  );

  const primaryNavItems = useMemo(() => navItems.filter((item) => item.href === 'team-active'), [navItems]);
  const workspaceNavItems = useMemo(
    () => workspaceNavItemKeys
      .map((key) => navItems.find((item) => item.href === key))
      .filter((item): item is NavItem => Boolean(item)),
    [navItems, workspaceNavItemKeys]
  );
  const workspaceMoreItems = useMemo(
    () =>
      navItems.filter(
        (item) =>
          ['/teams', '/team-members'].includes(item.href)
          && !workspaceNavItemKeys.includes(item.href)
      ),
    [navItems, workspaceNavItemKeys]
  );

  useEffect(() => {
    const session = getStoredSession();
    if (!session?.user) {
      router.replace(publicPath('/login'));
      return;
    }
    setUser(session.user);
  }, [router]);

  useEffect(() => {
    if (!user) return;
    if (pathname === publicPath('/create-workspace')) return;
    if (!workspaceLoading && !currentOrganizationId && organizations.length === 0) {
      router.replace(publicPath('/create-workspace'));
    }
  }, [user, pathname, router, currentOrganizationId, organizations.length, workspaceLoading]);

  useEffect(() => {
    if (!currentOrganizationSlug || typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(`${WORKSPACE_NAV_STORAGE_PREFIX}:${currentOrganizationSlug}`);
    if (!stored) {
      setWorkspaceNavItemKeys(DEFAULT_WORKSPACE_NAV_ITEMS);
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
        setWorkspaceNavItemKeys(parsed);
        return;
      }
    } catch {}
    setWorkspaceNavItemKeys(DEFAULT_WORKSPACE_NAV_ITEMS);
  }, [currentOrganizationSlug]);

  const handleLogout = () => {
    clearSession();
    router.push(publicPath('/login'));
  };

  useEffect(() => {
    const resetShortcutBuffer = () => {
      shortcutBuffer.current = '';
      if (shortcutTimerRef.current != null) {
        window.clearTimeout(shortcutTimerRef.current);
        shortcutTimerRef.current = null;
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;

      const key = event.key.toLowerCase();

      if ((event.metaKey || event.ctrlKey) && key === 'k') {
        event.preventDefault();
        if (currentOrganizationSlug) {
          router.push(workspaceSectionPath(currentOrganizationSlug, 'search'));
        }
        resetShortcutBuffer();
        return;
      }

      if (event.altKey && event.shiftKey && key === 'q') {
        event.preventDefault();
        handleLogout();
        resetShortcutBuffer();
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;

      shortcutBuffer.current = `${shortcutBuffer.current}${key}`.slice(-2);
      if (shortcutTimerRef.current != null) {
        window.clearTimeout(shortcutTimerRef.current);
      }
      shortcutTimerRef.current = window.setTimeout(resetShortcutBuffer, SHORTCUT_TIMEOUT_MS);

      if (shortcutBuffer.current === 'gs') {
        event.preventDefault();
        if (currentOrganizationSlug && currentTeamKey) {
          router.push(teamSettingsPath(currentOrganizationSlug, currentTeamKey, 'templates'));
        }
        resetShortcutBuffer();
      } else if (shortcutBuffer.current === 'ow') {
        event.preventDefault();
        setFocusSwitchWorkspace(true);
        setWorkspaceMenuOpen(true);
        resetShortcutBuffer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      resetShortcutBuffer();
    };
  }, [currentOrganizationSlug, currentTeamKey, router]);

  if (!user) return null;

  const searchHref = currentOrganizationSlug ? workspaceSectionPath(currentOrganizationSlug, 'search') : publicPath('/login');
  const settingsHref =
    currentOrganizationSlug && currentTeamKey
      ? teamSettingsPath(currentOrganizationSlug, currentTeamKey, 'templates')
      : publicPath('/create-workspace');
  const membersHref = currentOrganizationSlug ? workspaceSectionPath(currentOrganizationSlug, 'team-members') : publicPath('/create-workspace');
  const createWorkspaceHref = publicPath('/create-workspace');

  const persistWorkspaceNavItems = (next: string[]) => {
    setWorkspaceNavItemKeys(next);
    if (currentOrganizationSlug && typeof window !== 'undefined') {
      window.localStorage.setItem(`${WORKSPACE_NAV_STORAGE_PREFIX}:${currentOrganizationSlug}`, JSON.stringify(next));
    }
  };

  const pinWorkspaceNavItem = (href: string) => {
    if (workspaceNavItemKeys.includes(href)) {
      setWorkspaceMoreOpen(false);
      return;
    }
    const next = href === '/teams'
      ? ['/projects', '/views/issues', '/teams', ...workspaceNavItemKeys.filter((item) => item !== '/teams')]
      : [...workspaceNavItemKeys, href];
    persistWorkspaceNavItems(Array.from(new Set(next)));
    setWorkspaceMoreOpen(false);
  };

  const resolveNavHref = (item: NavItem) =>
    item.href === 'team-active'
      ? (currentOrganizationSlug && currentTeamKey ? teamActivePath(currentOrganizationSlug, currentTeamKey) : '#')
      : item.href === '/teams'
        ? (currentOrganizationSlug && currentTeamKey ? teamSettingsPath(currentOrganizationSlug, currentTeamKey) : '#')
      : item.href === '/views/issues'
        ? (
            currentOrganizationSlug
              ? workspaceViewsPath(currentOrganizationSlug, 'issues')
              : '#'
          )
        : currentOrganizationSlug
          ? workspaceSectionPath(currentOrganizationSlug, item.href.replace(/^\//, ''))
          : '#';

  const isNavActive = (item: NavItem, href: string) =>
    href !== '#'
      && (
        pathname === href
        || (item.href !== 'team-active' && pathname.startsWith(`${href}/`))
        || (item.href === '/views/issues' && currentOrganizationSlug != null && pathname.startsWith(`/${currentOrganizationSlug}/view/`))
      );

  return (
    <div className="app-shell">
      <aside className={`glass-sidebar fixed inset-y-0 left-0 z-30 w-72 transition-transform xl:translate-x-0 ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'} xl:block`}>
        <div className="flex h-full flex-col">
          <WorkspaceHeader
            organization={currentOrganization}
            organizations={organizations}
            menuOpen={workspaceMenuOpen}
            onMenuOpenChange={setWorkspaceMenuOpen}
            onSearch={() => router.push(searchHref)}
            onNewIssue={() => setQuickCreateOpen(true)}
            onLogout={handleLogout}
            onSelectOrganization={(organizationId) => {
              setCurrentOrganizationId(organizationId);
              const nextOrganization = organizations.find((organization) => organization.id === organizationId);
              if (nextOrganization) {
                router.push(workspaceRootPath(nextOrganization.slug));
              }
            }}
            settingsHref={settingsHref}
            membersHref={membersHref}
            createWorkspaceHref={createWorkspaceHref}
            currentWorkspaceLabel={t('workspaceMenu.currentWorkspace')}
            settingsLabel={t('workspaceMenu.settings')}
            inviteMembersLabel={t('workspaceMenu.inviteMembers')}
            switchWorkspaceLabel={t('workspaceMenu.switchWorkspace')}
            createWorkspaceLabel={t('workspaceMenu.createWorkspace')}
            logoutLabel={t('workspaceMenu.logout')}
            noWorkspacesLabel={t('workspaceMenu.noWorkspaces')}
            shortcuts={{
              settings: t('workspaceMenu.shortcuts.settings'),
              switchWorkspace: t('workspaceMenu.shortcuts.switchWorkspace'),
              logout: t('workspaceMenu.shortcuts.logout'),
            }}
            focusSwitchWorkspace={focusSwitchWorkspace}
            onSwitchWorkspaceFocused={() => setFocusSwitchWorkspace(false)}
          />

          <nav className="flex-1 space-y-6 px-4 py-5">
            <div className="space-y-1">
              {primaryNavItems.map((item) => {
                const href = resolveNavHref(item);
                const isActive = isNavActive(item, href);
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
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setWorkspaceSectionOpen((current) => !current)}
                className="flex w-full items-center gap-1 px-3 text-left text-sm font-medium text-ink-500 transition hover:text-ink-700"
                aria-expanded={workspaceSectionOpen}
              >
                <span>{t('common.workspace')}</span>
                <svg
                  className={`h-4 w-4 transition-transform ${workspaceSectionOpen ? 'rotate-0' : '-rotate-90'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 9 6 6 6-6" />
                </svg>
              </button>
              <div className={`space-y-1 ${workspaceSectionOpen ? 'block' : 'hidden'}`}>
                  {workspaceNavItems.map((item) => {
                    const href = resolveNavHref(item);
                    const isActive = isNavActive(item, href);
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
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setWorkspaceMoreOpen((current) => !current)}
                    className={`nav-item w-full ${workspaceMoreOpen ? 'nav-item-active' : ''}`}
                    aria-expanded={workspaceMoreOpen}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm4.5 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm4.5 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
                    </svg>
                    <span>{t('nav.more')}</span>
                  </button>
                  {workspaceMoreOpen ? (
                    <div className="ml-3 space-y-1 rounded-2xl border border-border-soft bg-white p-2">
                      {workspaceMoreItems.length > 0 ? (
                        workspaceMoreItems.map((item) => (
                          <button
                            key={item.href}
                            type="button"
                            onClick={() => pinWorkspaceNavItem(item.href)}
                            className="nav-item w-full"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                            </svg>
                            <span>{item.label}</span>
                          </button>
                        ))
                      ) : null}
                      <button
                        type="button"
                        onClick={() => window.alert(t('nav.customizeSidebarComingSoon'))}
                        className="nav-item w-full"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487a2.1 2.1 0 113.03 2.91L9.61 18.144 5 19l.856-4.61 11.006-9.903z" />
                        </svg>
                        <span>{t('nav.customizeSidebar')}</span>
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </nav>

          <div className="border-t border-border-subtle px-4 py-4">
            <div className="subtle-card p-4">
              <div className="text-sm font-medium text-ink-900">{user.username}</div>
              <div className="mt-1 text-xs text-ink-700">{user.role}</div>
              <div className="mt-4">
                <LocaleSwitcher />
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

      <IssueComposer
        mode="modal"
        open={quickCreateOpen}
        onClose={() => setQuickCreateOpen(false)}
        initialParams={new URLSearchParams(currentTeamId ? `teamId=${currentTeamId}` : '')}
        localeScope="issues-list-modal"
      />
    </div>
  );
}
