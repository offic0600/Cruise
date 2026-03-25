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
import { publicPath, teamActivePath, teamSettingsPath, workspaceRootPath, workspaceSectionPath } from '@/lib/routes';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const SHORTCUT_TIMEOUT_MS = 1000;

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
  const [focusSwitchWorkspace, setFocusSwitchWorkspace] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const shortcutBuffer = useRef('');
  const shortcutTimerRef = useRef<number | null>(null);

  const navItems = useMemo<NavItem[]>(
    () => [
      { href: 'team-active', label: t('nav.issues'), icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 7h6m-6 4h6m-7-8h.01M9 16h.01' },
      { href: '/projects', label: t('nav.projects'), icon: 'M4 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v2H4V7zm0 4h16v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6z' },
      { href: '/views', label: t('nav.views'), icon: 'M4 6h16M4 12h10M4 18h7' },
      { href: '/agent', label: t('nav.agent'), icon: 'M12 3a4 4 0 00-4 4v2H7a2 2 0 00-2 2v6a4 4 0 004 4h6a4 4 0 004-4v-6a2 2 0 00-2-2h-1V7a4 4 0 00-4-4zm-2 8V7a2 2 0 114 0v4h-4z' },
      { href: '/team-members', label: t('nav.teamMembers'), icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    ],
    [t]
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

          <nav className="flex-1 space-y-1 px-4 py-5">
            {navItems.map((item) => {
              const href =
                item.href === 'team-active'
                  ? (currentOrganizationSlug && currentTeamKey ? teamActivePath(currentOrganizationSlug, currentTeamKey) : '#')
                  : currentOrganizationSlug
                    ? workspaceSectionPath(currentOrganizationSlug, item.href.replace(/^\//, ''))
                    : '#';
              const isActive =
                href !== '#'
                  && (pathname === href || (item.href !== 'team-active' && pathname.startsWith(`${href}/`)));
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
