'use client';

import { Fragment, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { Editor as TiptapEditor } from '@tiptap/react';
import { List } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type {
  EditorCommand,
  LinkState,
  SaveState,
  SlashMenuState,
  ToolbarState,
  Translator,
} from './types';

type EditorShellProps = {
  children: ReactNode;
  editor: TiptapEditor;
  mounted: boolean;
  saveState: SaveState;
  slashState: SlashMenuState;
  filteredCommands: EditorCommand[];
  filteredCommandGroups: Array<{ group: string; commands: EditorCommand[] }>;
  toolbarState: ToolbarState;
  textStyleMenuOpen: boolean;
  setTextStyleMenuOpen: (open: boolean) => void;
  listMenuOpen: boolean;
  setListMenuOpen: (open: boolean) => void;
  linkState: LinkState;
  setLinkState: (updater: LinkState | ((current: LinkState) => LinkState)) => void;
  textStyleCommands: EditorCommand[];
  orderedToolbarCommands: EditorCommand[];
  listCommands: EditorCommand[];
  activeListCommand?: EditorCommand;
  runCommand: (command: EditorCommand) => Promise<void>;
  onToolbarMenuOpenChange: (menu: 'text' | 'list', open: boolean, position: ToolbarState['position']) => void;
  onToolbarMenuClose: () => void;
  applyLink: () => void;
  removeLink: () => void;
  closeLinkPopover: () => void;
  t: Translator;
};

function saveStateLabel(saveState: SaveState, t: Translator) {
  const normalizeLabel = (value: string) => value.replace(/鈥\?/g, '…');
  if (saveState === 'dirty') return normalizeLabel(t('issues.editor.status.pending'));
  if (saveState === 'saving') return normalizeLabel(t('issues.editor.status.saving'));
  if (saveState === 'saved') return normalizeLabel(t('issues.editor.status.saved'));
  if (saveState === 'error') return normalizeLabel(t('issues.editor.status.error'));
  return null;
}

export function EditorShell({
  children,
  editor,
  mounted,
  saveState,
  slashState,
  filteredCommands,
  filteredCommandGroups,
  toolbarState,
  textStyleMenuOpen,
  setTextStyleMenuOpen,
  listMenuOpen,
  setListMenuOpen,
  linkState,
  setLinkState,
  textStyleCommands,
  orderedToolbarCommands,
  listCommands,
  activeListCommand,
  runCommand,
  onToolbarMenuOpenChange,
  onToolbarMenuClose,
  applyLink,
  removeLink,
  closeLinkPopover,
  t,
}: EditorShellProps) {
  const statusLabel = saveStateLabel(saveState, t);

  return (
    <>
      {children}

      {statusLabel ? (
        <div className="pointer-events-none mt-2 text-xs text-ink-400" data-testid="markdown-editor-save-state">
          {statusLabel}
        </div>
      ) : null}

      {mounted && slashState.open && filteredCommands.length
        ? createPortal(
            <div
              data-testid="markdown-slash-menu"
              role="menu"
              className="fixed z-[85] min-w-56 w-[280px] overflow-hidden rounded-card border border-border-subtle bg-white p-1.5 shadow-elevated"
              style={{ top: slashState.position.top, left: slashState.position.left }}
            >
              <div className="max-h-[360px] overflow-y-auto">
                {filteredCommandGroups.map((entry, groupIndex) => (
                  <div key={entry.group}>
                    {entry.commands.map((command) => {
                      const index = filteredCommands.findIndex((item) => item.id === command.id);
                      return (
                        <button
                          key={command.id}
                          type="button"
                          role="menuitem"
                          data-testid={`markdown-slash-${command.id}`}
                          className={cn(
                            'relative flex w-full cursor-default select-none items-center gap-3 rounded-2xl px-4 py-3 text-left text-[15px] text-ink-700 outline-none transition-colors',
                            index === slashState.selectedIndex ? 'bg-slate-100 text-ink-900' : 'hover:bg-slate-50 focus:bg-slate-100',
                          )}
                          onMouseDown={(event: ReactMouseEvent<HTMLButtonElement>) => event.preventDefault()}
                          onClick={() => void runCommand(command)}
                        >
                          <command.icon className="h-4.5 w-4.5 shrink-0 text-ink-500" />
                          <span className="min-w-0 flex-1 truncate">{command.label}</span>
                          {command.shortcut ? (
                            <span className="ml-3 inline-flex shrink-0 items-center gap-1 text-xs text-ink-400">
                              {command.shortcut.display.map((token) => (
                                <span key={`${command.id}-${token}`} className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] leading-none">
                                  {token}
                                </span>
                              ))}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                    {groupIndex < filteredCommandGroups.length - 1 ? <div className="my-1 h-px bg-border-soft" /> : null}
                  </div>
                ))}
              </div>
            </div>,
            document.body,
          )
        : null}

      {mounted && toolbarState.open
        ? createPortal(
            <div
              data-testid="markdown-editor-toolbar"
              className="fixed z-[88] inline-flex max-w-full items-center gap-1 rounded-full border border-slate-200/90 bg-white/95 px-1.5 py-1 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur supports-[backdrop-filter]:bg-white/90"
              style={{ top: toolbarState.position.top, left: toolbarState.position.left }}
              onMouseDown={(event) => event.preventDefault()}
            >
              <DropdownMenu
                modal={false}
                open={textStyleMenuOpen}
                onOpenChange={(open) => {
                  setTextStyleMenuOpen(open);
                  if (open) {
                    onToolbarMenuOpenChange('text', open, toolbarState.position);
                    return;
                  }
                  window.setTimeout(() => {
                    editor.commands.focus();
                    onToolbarMenuClose();
                  }, 0);
                }}
              >
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    data-testid="markdown-toolbar-text-style-trigger"
                    className="inline-flex h-9 items-center gap-1 rounded-[10px] bg-slate-100 px-3 text-[15px] text-ink-700 outline-none transition hover:bg-slate-100/90"
                    aria-label={t('issues.editor.commands.textStyle')}
                    onMouseDown={(event) => event.preventDefault()}
                  >
                    <span className="text-[18px] leading-none">Aa</span>
                    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-ink-400" aria-hidden="true">
                      <path d="m6 8 4 4 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  sideOffset={8}
                  className="w-[212px] rounded-[18px] p-1.5"
                  onCloseAutoFocus={(event) => {
                    event.preventDefault();
                    editor.commands.focus();
                  }}
                >
                  <div data-testid="markdown-toolbar-text-style-menu">
                    {textStyleCommands.map((command) => (
                      <DropdownMenuItem
                        key={command.id}
                        data-testid={`markdown-toolbar-text-style-${command.id === 'paragraph' ? 'regular' : command.id}`}
                        onSelect={(event) => {
                          event.preventDefault();
                          void runCommand(command);
                          setTextStyleMenuOpen(false);
                        }}
                        className={cn(
                          'flex items-center justify-between rounded-xl px-3 py-2.5 text-[15px]',
                          command.isActive?.(editor) ? 'bg-slate-100 text-ink-900' : '',
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className={cn('min-w-0', command.id === 'paragraph' ? 'font-normal' : 'font-semibold')}>
                            {command.id === 'paragraph' ? t('issues.editor.commands.regularText') : command.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {command.shortcut?.display.map((token) => (
                            <span key={`${command.id}-${token}`} className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] leading-none text-ink-400">
                              {token}
                            </span>
                          ))}
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="mx-0.5 h-6 w-px bg-slate-200" />

              {orderedToolbarCommands.slice(0, 7).map((command, index) => (
                <Fragment key={command.id}>
                  <button
                    type="button"
                    data-testid={`markdown-toolbar-${command.id}`}
                    onClick={() => void runCommand(command)}
                    className={cn(
                      'inline-flex h-9 min-w-9 items-center justify-center rounded-[10px] border border-transparent px-2.5 text-ink-700 transition hover:bg-slate-50',
                      command.isActive?.(editor) ? 'bg-slate-100 text-ink-900' : '',
                    )}
                    aria-label={command.label}
                  >
                    <command.icon className="h-4.5 w-4.5 stroke-[1.9]" />
                  </button>
                  {index === 3 ? <div className="mx-0.5 h-6 w-px bg-slate-200" /> : null}
                </Fragment>
              ))}

              <DropdownMenu
                modal={false}
                open={listMenuOpen}
                onOpenChange={(open) => {
                  setListMenuOpen(open);
                  if (open) {
                    onToolbarMenuOpenChange('list', open, toolbarState.position);
                    return;
                  }
                  window.setTimeout(() => {
                    editor.commands.focus();
                    onToolbarMenuClose();
                  }, 0);
                }}
              >
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    data-testid="markdown-toolbar-list-trigger"
                    className={cn(
                      'inline-flex h-9 items-center gap-1 rounded-[10px] border border-transparent px-2.5 text-ink-700 outline-none transition hover:bg-slate-50',
                      activeListCommand?.isActive?.(editor) ? 'bg-slate-100 text-ink-900' : '',
                    )}
                    aria-label={activeListCommand?.label ?? t('issues.editor.commands.bulletList')}
                    onMouseDown={(event) => event.preventDefault()}
                  >
                    <List className="h-4.5 w-4.5 stroke-[1.9]" />
                    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-ink-400" aria-hidden="true">
                      <path d="m6 8 4 4 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  sideOffset={8}
                  className="w-[220px] rounded-[18px] p-1.5"
                  onCloseAutoFocus={(event) => {
                    event.preventDefault();
                    editor.commands.focus();
                  }}
                >
                  <div data-testid="markdown-toolbar-list-menu">
                    {listCommands.map((command) => (
                      <DropdownMenuItem
                        key={command.id}
                        data-testid={`markdown-toolbar-list-${command.id}`}
                        onSelect={(event) => {
                          event.preventDefault();
                          void runCommand(command);
                          setListMenuOpen(false);
                        }}
                        className={cn(
                          'flex items-center justify-between rounded-xl px-3 py-2.5 text-[15px]',
                          command.isActive?.(editor) ? 'bg-slate-100 text-ink-900' : 'text-ink-700',
                        )}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <command.icon className="h-4.5 w-4.5 shrink-0 text-ink-500" />
                          <span className="truncate">{command.label}</span>
                        </div>
                        {command.shortcut ? (
                          <div className="flex items-center gap-1 text-[12px] text-ink-400">
                            {command.shortcut.display.map((token) => (
                              <span key={`${command.id}-${token}`} className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 leading-none">
                                {token}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="mx-0.5 h-6 w-px bg-slate-200" />

              {orderedToolbarCommands.slice(7).map((command) => (
                <button
                  key={command.id}
                  type="button"
                  data-testid={`markdown-toolbar-${command.id}`}
                  onClick={() => void runCommand(command)}
                  className={cn(
                    'inline-flex h-9 min-w-9 items-center justify-center rounded-[10px] border border-transparent px-2.5 text-ink-700 transition hover:bg-slate-50',
                    command.isActive?.(editor) ? 'bg-slate-100 text-ink-900' : '',
                  )}
                  aria-label={command.label}
                >
                  <command.icon className="h-4.5 w-4.5 stroke-[1.9]" />
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}

      {mounted && linkState.open
        ? createPortal(
            <div
              className="fixed z-[90] w-[320px] rounded-[20px] border border-slate-200/90 bg-white p-3 shadow-[0_18px_44px_rgba(15,23,42,0.14)]"
              style={{ top: linkState.position.top, left: linkState.position.left }}
              onMouseDown={(event) => event.preventDefault()}
            >
              <div className="space-y-3">
                <Input
                  autoFocus
                  value={linkState.url}
                  onChange={(event) => setLinkState((current) => ({ ...current, url: event.target.value }))}
                  placeholder="https://"
                  data-testid="markdown-link-input"
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      applyLink();
                    }
                    if (event.key === 'Escape') {
                      event.preventDefault();
                      closeLinkPopover();
                    }
                  }}
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-full px-3 py-1.5 text-sm text-ink-500 transition hover:bg-slate-100 hover:text-ink-900"
                    onClick={removeLink}
                    data-testid="markdown-link-remove"
                  >
                    {t('issues.editor.link.remove')}
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-ink-900 transition hover:bg-slate-50"
                    onClick={applyLink}
                    data-testid="markdown-link-apply"
                  >
                    {t('issues.editor.link.apply')}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
