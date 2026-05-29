'use client';

import type { JSONContent, Range } from '@tiptap/core';
import type { Editor as TiptapEditor } from '@tiptap/react';
import type { LucideIcon } from 'lucide-react';

export type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

export type CommandActionType =
  | 'attachment'
  | 'media'
  | 'gif'
  | 'diagram'
  | 'collapsibleSection'
  | 'subIssue'
  | 'relatedIssue'
  | 'projectRelation'
  | 'documentRelation';

export type CommandGroup = 'text' | 'headings' | 'lists' | 'structure' | 'insert' | 'relations';

export type ShortcutDescriptor = {
  key: string;
  code?: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  display: string[];
};

export type LinkMode = 'selection' | 'insert';

export type FloatingPosition = { top: number; left: number };

export type ToolbarState = { open: boolean; position: FloatingPosition };

export type LinkState = {
  open: boolean;
  url: string;
  mode: LinkMode;
  range: Range | null;
  position: FloatingPosition;
};

export type SlashMenuState = {
  open: boolean;
  query: string;
  selectedIndex: number;
  position: FloatingPosition;
  range: Range | null;
};

export type Translator = (key: string) => string;

export interface MarkdownEditorProps {
  issueId: number | string;
  initialMarkdown?: string | null;
  initialContentJson?: JSONContent | null;
  initialRevision?: number | null;
  onCommit: (payload: {
    contentJson: JSONContent;
    revision: number;
    markdownExport?: string;
  }) => Promise<number | void> | number | void;
  onDirtyChange?: (dirty: boolean) => void;
  onSelectionChange?: (hasSelection: boolean) => void;
  onCommandAction?: (action: CommandActionType, payload?: unknown) => void;
}

export type EditorCommandVisibility = {
  toolbar?: boolean;
  textStyleMenu?: boolean;
  slash?: boolean;
  placeholder?: boolean;
  menuOnly?: boolean;
};

export type EditorCommandContext = {
  editor: TiptapEditor;
  openLinkPopover: (mode?: LinkMode) => void;
  dispatchBusinessAction: (action: CommandActionType) => void;
  clearSlashQuery: () => void;
};

export type EditorCommand = {
  id: string;
  group: CommandGroup;
  label: string;
  keywords: string[];
  icon: LucideIcon;
  visibility?: EditorCommandVisibility;
  shortcut?: ShortcutDescriptor;
  isActive?: (editor: TiptapEditor) => boolean;
  isEnabled?: (editor: TiptapEditor) => boolean;
  run: (context: EditorCommandContext) => void | Promise<void>;
};

export type EditorSerializationResult = {
  contentJson: JSONContent;
  markdownExport: string;
  serializedJson: string;
};
