'use client';

import { ChevronDown, LogOut, Plus, Search, Settings, UsersRound } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import type { Organization } from '@/lib/api';

type WorkspaceHeaderProps = {
  organization: Organization | null;
  organizations: Organization[];
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
  onSearch: () => void;
  onNewIssue: () => void;
  onLogout: () => void;
  onSelectOrganization: (organizationId: number) => void;
  settingsHref: string;
  membersHref: string;
  createWorkspaceHref: string;
  currentWorkspaceLabel: string;
  settingsLabel: string;
  inviteMembersLabel: string;
  switchWorkspaceLabel: string;
  createWorkspaceLabel: string;
  logoutLabel: string;
  noWorkspacesLabel: string;
  shortcuts: {
    settings: string;
    switchWorkspace: string;
    logout: string;
  };
  focusSwitchWorkspace: boolean;
  onSwitchWorkspaceFocused: () => void;
};

export default function WorkspaceHeader({
  organization,
  organizations,
  menuOpen,
  onMenuOpenChange,
  onSearch,
  onNewIssue,
  onLogout,
  onSelectOrganization,
  settingsHref,
  membersHref,
  createWorkspaceHref,
  currentWorkspaceLabel,
  settingsLabel,
  inviteMembersLabel,
  switchWorkspaceLabel,
  createWorkspaceLabel,
  logoutLabel,
  noWorkspacesLabel,
  shortcuts,
  focusSwitchWorkspace,
  onSwitchWorkspaceFocused,
}: WorkspaceHeaderProps) {
  const initials = (organization?.name || currentWorkspaceLabel)
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="border-b border-border-subtle px-4 py-4">
      <div className="flex items-center gap-2">
        <DropdownMenu open={menuOpen} onOpenChange={onMenuOpenChange}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-3 rounded-full bg-slate-100 px-3 py-2 text-left transition hover:bg-slate-200"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-700 text-sm font-semibold text-white">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-lg font-semibold text-ink-900">{organization?.name ?? currentWorkspaceLabel}</div>
              </div>
              <ChevronDown className="h-4 w-4 shrink-0 text-ink-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[21rem] p-2">
            <DropdownMenuItem asChild>
              <Link href={settingsHref} className="grid grid-cols-[1fr_auto] items-center gap-4">
                <div className="flex items-center gap-3">
                  <Settings className="h-4 w-4" />
                  <span>{settingsLabel}</span>
                </div>
                <span className="text-xs text-ink-400">{shortcuts.settings}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={membersHref} className="flex items-center gap-3">
                <UsersRound className="h-4 w-4" />
                <span>{inviteMembersLabel}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger
                className="gap-3"
                ref={(node) => {
                  if (node && focusSwitchWorkspace) {
                    queueMicrotask(() => {
                      node.focus();
                      onSwitchWorkspaceFocused();
                    });
                  }
                }}
              >
                <span className="min-w-0 flex-1 truncate">{switchWorkspaceLabel}</span>
                <span className="text-xs text-ink-400">{shortcuts.switchWorkspace}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-64 p-2">
                <DropdownMenuLabel className="px-3 pb-1 pt-2 normal-case tracking-normal text-ink-400">
                  {currentWorkspaceLabel}
                </DropdownMenuLabel>
                {organizations.length ? (
                  organizations.map((item) => (
                    <DropdownMenuItem
                      key={item.id}
                      onSelect={() => onSelectOrganization(item.id)}
                      className={`flex items-center justify-between gap-3 ${item.id === organization?.id ? 'bg-slate-100' : ''}`}
                    >
                      <span>{item.name}</span>
                      {item.id === organization?.id ? <span className="text-xs text-ink-400">{currentWorkspaceLabel}</span> : null}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>{noWorkspacesLabel}</DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="px-3 pb-1 pt-2 normal-case tracking-normal text-ink-400">
                  Account
                </DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href={createWorkspaceHref} className="flex items-center gap-3">
                    <Plus className="h-4 w-4" />
                    <span>{createWorkspaceLabel}</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onLogout} className="grid grid-cols-[1fr_auto] items-center gap-4">
              <div className="flex items-center gap-3">
                <LogOut className="h-4 w-4" />
                <span>{logoutLabel}</span>
              </div>
              <span className="text-xs text-ink-400">{shortcuts.logout}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="secondary" size="icon" className="h-11 w-11 rounded-full" onClick={onSearch} aria-label="Search">
          <Search className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="icon" className="h-11 w-11 rounded-full" onClick={onNewIssue} aria-label="New issue">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
