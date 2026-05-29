'use client';

import type { JSONContent, Range } from '@tiptap/core';
import type { Editor as TiptapEditor } from '@tiptap/react';
import type { EditorCommand, LinkState, SlashMenuState } from './types';

export const TEXT_STYLE_COMMAND_IDS = ['paragraph', 'heading1', 'heading2', 'heading3', 'heading4'] as const;
export const SLASH_MENU_GROUPS = ['text', 'headings', 'lists', 'insert', 'structure', 'relations'] as const;
export const EDITOR_CLASS_NAME =
  'markdown-editor-content min-h-[16rem] cursor-text px-0 py-0 text-[15px] leading-7 text-ink-900 outline-none';

export function createClosedSlashState(): SlashMenuState {
  return { open: false, query: '', selectedIndex: 0, position: { top: 0, left: 0 }, range: null };
}

export function createClosedLinkState(): LinkState {
  return {
    open: false,
    url: 'https://',
    mode: 'selection',
    range: null,
    position: { top: 0, left: 0 },
  };
}

export function normalizeMarkdown(value: string | null | undefined) {
  return (value ?? '').replace(/\r\n/g, '\n');
}

export function serializeContentJson(value?: JSONContent | null) {
  return JSON.stringify(value ?? null);
}

export function normalizeHref(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function findShortcutCommand(commands: EditorCommand[], event: KeyboardEvent) {
  return commands.find((command) => {
    if (!command.shortcut) return false;
    const shortcut = command.shortcut;
    const ctrlPressed = event.ctrlKey || event.metaKey;
    if (Boolean(shortcut.ctrl) !== ctrlPressed) return false;
    if (Boolean(shortcut.alt) !== event.altKey) return false;
    if (Boolean(shortcut.shift) !== event.shiftKey) return false;
    if (shortcut.code) return event.code === shortcut.code;
    return event.key.toLowerCase() === shortcut.key.toLowerCase();
  });
}

export function getToolbarPosition() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  const rect = selection.getRangeAt(0).getBoundingClientRect();
  if (!rect.width && !rect.height) return null;
  const toolbarWidth = 296;
  const toolbarHeight = 46;
  const viewportWidth = window.innerWidth;
  const preferredLeft = rect.left + rect.width / 2 - toolbarWidth / 2;
  const clampedLeft = Math.min(Math.max(preferredLeft, 16), Math.max(viewportWidth - toolbarWidth - 16, 16));
  const preferredTop = rect.top - toolbarHeight - 12;
  const top = preferredTop > 16 ? preferredTop : rect.bottom + 12;
  return { top, left: clampedLeft };
}

export function getEditorDomSelection(container: HTMLDivElement | null) {
  if (!container) return null;
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return null;
  const anchorNode = selection.anchorNode;
  const focusNode = selection.focusNode;
  if (!anchorNode || !focusNode || !container.contains(anchorNode) || !container.contains(focusNode)) {
    return null;
  }
  return { text: selection.toString() };
}

export function getSlashMenuState(editor: TiptapEditor, pointerSelecting: boolean): SlashMenuState {
  if (pointerSelecting || !editor.isFocused) {
    return createClosedSlashState();
  }
  const { $from, empty, from } = editor.state.selection;
  if (!empty) {
    return createClosedSlashState();
  }
  const textBefore = $from.parent.textBetween(0, $from.parentOffset, '\0', '\0');
  const slashMatch = textBefore.match(/(?:^|\s)\/([^\s]*)$/);
  if (!slashMatch) {
    return createClosedSlashState();
  }
  const commandText = slashMatch[0].trimStart();
  const start = from - commandText.length;
  const coords = editor.view.coordsAtPos(from);
  return {
    open: true,
    query: slashMatch[1] ?? '',
    selectedIndex: 0,
    position: { top: coords.bottom + 10, left: coords.left - 8 },
    range: { from: start, to: from } as Range,
  };
}

export function exitEmptyListItem(editor: TiptapEditor | null) {
  if (!editor) return false;
  const { selection } = editor.state;
  if (!selection.empty) return false;
  const { $from } = selection;
  if ($from.parent.textContent.length > 0) return false;

  if (editor.isActive('taskItem')) {
    return editor.chain().focus().liftListItem('taskItem').run();
  }

  if (editor.isActive('listItem')) {
    return editor.chain().focus().liftListItem('listItem').run();
  }

  return false;
}
