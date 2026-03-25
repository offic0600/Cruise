'use client';

import { Fragment, type MouseEvent as ReactMouseEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Extension, InputRule, type JSONContent, type Range } from '@tiptap/core';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import Underline from '@tiptap/extension-underline';
import CodeBlock from '@tiptap/extension-code-block';
import StarterKit from '@tiptap/starter-kit';
import { EditorContent, useEditor, type Editor as TiptapEditor } from '@tiptap/react';
import { Markdown } from 'tiptap-markdown';
import {
  Bold,
  Clapperboard,
  Code2,
  FilePlus2,
  FileText,
  FolderKanban,
  GitBranchPlus,
  Heading1,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  ListTodo,
  Minus,
  PanelTop,
  Paperclip,
  Pilcrow,
  Quote,
  Strikethrough,
  Underline as UnderlineIcon,
  Workflow,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/i18n/useI18n';
import { cn } from '@/lib/utils';

type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';
type CommandActionType =
  | 'attachment'
  | 'media'
  | 'gif'
  | 'diagram'
  | 'collapsibleSection'
  | 'subIssue'
  | 'relatedIssue'
  | 'projectRelation'
  | 'documentRelation';
type CommandGroup = 'text' | 'headings' | 'lists' | 'structure' | 'insert' | 'relations';
type ShortcutDescriptor = {
  key: string;
  code?: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  display: string[];
};
type LinkMode = 'selection' | 'insert';
type ToolbarState = { open: boolean; position: { top: number; left: number } };

type LinkState = {
  open: boolean;
  url: string;
  mode: LinkMode;
  range: Range | null;
  position: { top: number; left: number };
};

type SlashMenuState = {
  open: boolean;
  query: string;
  selectedIndex: number;
  position: { top: number; left: number };
  range: Range | null;
};

type CommandContext = {
  editor: TiptapEditor;
  openLinkPopover: (mode?: LinkMode) => void;
  triggerAction: (action: CommandActionType) => void;
  clearSlashQuery: () => void;
};

type CommandDescriptor = {
  id: string;
  group: CommandGroup;
  label: string;
  keywords: string[];
  icon: typeof Bold;
  hideInToolbar?: boolean;
  menuOnly?: boolean;
  placeholder?: boolean;
  shortcut?: ShortcutDescriptor;
  showInSlash?: boolean;
  showInToolbar?: boolean;
  showInTextStyleMenu?: boolean;
  isActive?: (editor: TiptapEditor) => boolean;
  isEnabled?: (editor: TiptapEditor) => boolean;
  run: (context: CommandContext) => void | Promise<void>;
};

interface MarkdownEditorProps {
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

const SLASH_MENU_GROUPS: CommandGroup[] = ['headings', 'lists', 'insert', 'structure', 'relations'];
const TEXT_STYLE_COMMAND_IDS = ['paragraph', 'heading1', 'heading2', 'heading3', 'heading4'] as const;
const editorClassName =
  'markdown-editor-content min-h-[16rem] cursor-text px-0 py-0 text-[15px] leading-7 text-ink-900 outline-none';

const LinearMarkdownInputRules = Extension.create({
  name: 'linearMarkdownInputRules',
  addInputRules() {
    return [
      new InputRule({
        find: /^\[( |x|X)\]\s$/,
        handler: ({ chain, range, match }) => {
          const checked = String(match[1]).toLowerCase() === 'x';
          chain().deleteRange(range).toggleTaskList().run();
          if (checked) this.editor.commands.updateAttributes('taskItem', { checked: true });
        },
      }),
      new InputRule({
        find: /^(---|\*\*\*)$/,
        handler: ({ chain, range }) => {
          chain().deleteRange(range).setHorizontalRule().run();
        },
      }),
    ];
  },
});

export default function MarkdownEditor({
  issueId,
  initialMarkdown,
  initialContentJson,
  initialRevision,
  onCommit,
  onDirtyChange,
  onSelectionChange,
  onCommandAction,
}: MarkdownEditorProps) {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const commitTimeoutRef = useRef<number | null>(null);
  const savedTimeoutRef = useRef<number | null>(null);
  const pointerSelectingRef = useRef(false);
  const suppressBlurCommitRef = useRef(false);
  const editorRef = useRef<TiptapEditor | null>(null);
  const lastToolbarPositionRef = useRef<{ top: number; left: number }>({ top: 0, left: 0 });
  const initialSerializedJson = useMemo(() => serializeContentJson(initialContentJson), [initialContentJson]);
  const committedJsonRef = useRef(initialSerializedJson);
  const latestJsonRef = useRef(initialSerializedJson);
  const currentRevisionRef = useRef(initialRevision ?? 0);
  const dirtyRef = useRef(false);
  const onCommitRef = useRef(onCommit);
  const onDirtyChangeRef = useRef(onDirtyChange);
  const onSelectionChangeRef = useRef(onSelectionChange);
  const onCommandActionRef = useRef(onCommandAction);
  const slashStateRef = useRef<SlashMenuState>({ open: false, query: '', selectedIndex: 0, position: { top: 0, left: 0 }, range: null });
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [allowBubbleMenu, setAllowBubbleMenu] = useState(true);
  const [toolbarState, setToolbarState] = useState<ToolbarState>({ open: false, position: { top: 0, left: 0 } });
  const [textStyleMenuOpen, setTextStyleMenuOpen] = useState(false);
  const [listMenuOpen, setListMenuOpen] = useState(false);
  const [slashMenuMounted, setSlashMenuMounted] = useState(false);
  const [slashState, setSlashState] = useState<SlashMenuState>({ open: false, query: '', selectedIndex: 0, position: { top: 0, left: 0 }, range: null });
  const [linkState, setLinkState] = useState<LinkState>({
    open: false,
    url: 'https://',
    mode: 'selection',
    range: null,
    position: { top: 0, left: 0 },
  });

  onCommitRef.current = onCommit;
  onDirtyChangeRef.current = onDirtyChange;
  onSelectionChangeRef.current = onSelectionChange;
  onCommandActionRef.current = onCommandAction;

  const markDirty = useCallback((nextDirty: boolean) => {
    if (dirtyRef.current === nextDirty) return;
    dirtyRef.current = nextDirty;
    onDirtyChangeRef.current?.(nextDirty);
  }, []);

  const getMarkdown = useCallback(
    (editor: TiptapEditor) =>
      normalizeMarkdown(((editor.storage as unknown) as { markdown: { getMarkdown: () => string } }).markdown.getMarkdown()),
    [],
  );
  const getJson = useCallback((editor: TiptapEditor) => editor.getJSON(), []);

  const scheduleCommit = useCallback(() => {
    if (commitTimeoutRef.current) window.clearTimeout(commitTimeoutRef.current);
    commitTimeoutRef.current = window.setTimeout(async () => {
      const instance = editorRef.current;
      if (!instance) return;
      const contentJson = getJson(instance);
      const serializedContent = serializeContentJson(contentJson);
      if (serializedContent === committedJsonRef.current) {
        markDirty(false);
        setSaveState('idle');
        return;
      }
      setSaveState('saving');
      try {
        const nextRevision =
          (await onCommitRef.current({
            contentJson,
            revision: currentRevisionRef.current,
            markdownExport: getMarkdown(instance),
          })) ?? currentRevisionRef.current + 1;
        currentRevisionRef.current = nextRevision;
        committedJsonRef.current = serializedContent;
        latestJsonRef.current = serializedContent;
        markDirty(false);
        setSaveState('saved');
        if (savedTimeoutRef.current) window.clearTimeout(savedTimeoutRef.current);
        savedTimeoutRef.current = window.setTimeout(() => setSaveState('idle'), 1000);
      } catch {
        markDirty(true);
        setSaveState('error');
        window.setTimeout(() => {
          editorRef.current?.commands.focus();
        }, 0);
      }
    }, 500);
  }, [getJson, getMarkdown, markDirty]);

  const commitNow = useCallback(async () => {
    if (commitTimeoutRef.current) {
      window.clearTimeout(commitTimeoutRef.current);
      commitTimeoutRef.current = null;
    }
    const instance = editorRef.current;
    if (!instance) return;
    const contentJson = getJson(instance);
    const serializedContent = serializeContentJson(contentJson);
    if (serializedContent === committedJsonRef.current) {
      markDirty(false);
      setSaveState('idle');
      return;
    }
    setSaveState('saving');
    try {
      const nextRevision =
        (await onCommitRef.current({
          contentJson,
          revision: currentRevisionRef.current,
          markdownExport: getMarkdown(instance),
        })) ?? currentRevisionRef.current + 1;
      currentRevisionRef.current = nextRevision;
      committedJsonRef.current = serializedContent;
      latestJsonRef.current = serializedContent;
      markDirty(false);
      setSaveState('saved');
      if (savedTimeoutRef.current) window.clearTimeout(savedTimeoutRef.current);
      savedTimeoutRef.current = window.setTimeout(() => setSaveState('idle'), 1000);
    } catch {
      markDirty(true);
      setSaveState('error');
      window.setTimeout(() => {
        editorRef.current?.commands.focus();
      }, 0);
    }
  }, [getJson, getMarkdown, markDirty]);

  const updateSlashMenu = useCallback(
    (instance: TiptapEditor) => {
      const next = getSlashMenuState(instance, pointerSelectingRef.current);
      const previous = slashStateRef.current;
      const changed =
        previous.open !== next.open ||
        previous.query !== next.query ||
        previous.selectedIndex !== next.selectedIndex ||
        previous.position.top !== next.position.top ||
        previous.position.left !== next.position.left ||
        previous.range?.from !== next.range?.from ||
        previous.range?.to !== next.range?.to;
      if (!changed) return;
      slashStateRef.current = next;
      setSlashState(next);
    },
    [],
  );

  const updateToolbar = useCallback((instance: TiptapEditor) => {
    if (pointerSelectingRef.current) {
      setToolbarState({ open: false, position: { top: 0, left: 0 } });
      return;
    }
    if (textStyleMenuOpen || listMenuOpen) {
      setToolbarState({ open: true, position: lastToolbarPositionRef.current });
      return;
    }
    const domSelection = getEditorDomSelection(containerRef.current);
    const hasPmSelection = !instance.state.selection.empty;
    const hasEditorSelection = Boolean(domSelection && domSelection.text.trim().length > 0);
    if (!allowBubbleMenu || linkState.open || (!hasPmSelection && !hasEditorSelection)) {
      setToolbarState({ open: false, position: { top: 0, left: 0 } });
      return;
    }
    const position = getToolbarPosition(instance);
    if (!position) {
      setToolbarState({ open: false, position: { top: 0, left: 0 } });
      return;
    }
    lastToolbarPositionRef.current = position;
    setToolbarState({ open: true, position });
  }, [allowBubbleMenu, linkState.open, listMenuOpen, textStyleMenuOpen]);

  const editor = useEditor({
    immediatelyRender: false,
    autofocus: false,
    content: initialContentJson ?? normalizeMarkdown(initialMarkdown),
    editorProps: {
      attributes: {
        class: editorClassName,
        'data-testid': 'markdown-editor-editable',
        'aria-label': 'Issue description',
      },
      handleDOMEvents: {
        mousedown: () => {
          pointerSelectingRef.current = true;
          setAllowBubbleMenu(false);
          setToolbarState({ open: false, position: { top: 0, left: 0 } });
          return false;
        },
        mouseup: () => {
          window.requestAnimationFrame(() => {
            pointerSelectingRef.current = false;
            setAllowBubbleMenu(true);
            if (editorRef.current) {
              updateSlashMenu(editorRef.current);
              updateToolbar(editorRef.current);
            }
          });
          return false;
        },
      },
      handleKeyDown: (_view, event) => {
        const state = slashStateRef.current;
        const shortcutCommand = findShortcutCommand(commandsRef.current, event);
        if (shortcutCommand) {
          event.preventDefault();
          void runCommandRef.current(shortcutCommand);
          return true;
        }
        if (event.key === 'Escape') {
          if (state.open) {
            event.preventDefault();
            closeSlashMenu();
            return true;
          }
          return false;
        }
        if (event.key === 'Backspace') {
          const handled = exitEmptyListItem(editorRef.current);
          if (handled) {
            event.preventDefault();
            return true;
          }
        }
        if (!state.open) return false;
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setSlashState((current) => ({ ...current, selectedIndex: Math.min(current.selectedIndex + 1, filteredCommands.length - 1) }));
          return true;
        }
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          setSlashState((current) => ({ ...current, selectedIndex: Math.max(current.selectedIndex - 1, 0) }));
          return true;
        }
        if (event.key === 'Enter') {
          const command = filteredCommands[state.selectedIndex];
          if (!command) return false;
          event.preventDefault();
          runCommand(command);
          return true;
        }
        return false;
      },
    },
      extensions: [
        StarterKit.configure({
          codeBlock: false,
          heading: { levels: [1, 2, 3, 4] },
        }),
        CodeBlock.extend({
          renderHTML({ HTMLAttributes }) {
            return ['pre', { ...HTMLAttributes, spellcheck: 'false' }, ['code', 0]];
          },
        }),
        Placeholder.configure({
        includeChildren: true,
        showOnlyCurrent: true,
        placeholder: ({ node, editor: instance }) =>
          node.type.name === 'paragraph'
            ? (instance.isEmpty ? t('issues.editor.placeholder') : t('issues.editor.commandHint'))
            : t('issues.editor.placeholder'),
      }),
      Link.configure({ autolink: true, openOnClick: false, linkOnPaste: true }),
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      Markdown.configure({ transformCopiedText: true, transformPastedText: true }),
      LinearMarkdownInputRules,
    ],
    onSelectionUpdate: ({ editor: instance }) => {
      const hasSelection = !instance.state.selection.empty;
      onSelectionChangeRef.current?.(hasSelection);
      if (!pointerSelectingRef.current) setAllowBubbleMenu(true);
      updateSlashMenu(instance);
      updateToolbar(instance);
    },
    onFocus: ({ editor: instance }) => {
      updateSlashMenu(instance);
      updateToolbar(instance);
    },
    onUpdate: ({ editor: instance }) => {
      const serializedContent = serializeContentJson(getJson(instance));
      latestJsonRef.current = serializedContent;
      const dirty = serializedContent !== committedJsonRef.current;
      markDirty(dirty);
      setSaveState(dirty ? 'dirty' : 'idle');
      scheduleCommit();
      updateSlashMenu(instance);
      updateToolbar(instance);
    },
    onBlur: () => {
      if (!textStyleMenuOpen && !listMenuOpen) {
        setToolbarState({ open: false, position: { top: 0, left: 0 } });
      }
      if (!suppressBlurCommitRef.current) {
        void commitNow();
      }
    },
  });

  const commands = useMemo<CommandDescriptor[]>(() => {
    if (!editor) return [];
    return [
      { id: 'bold', group: 'text', label: t('issues.editor.commands.bold'), keywords: ['strong', '**'], icon: Bold, showInToolbar: true, isActive: (i) => i.isActive('bold'), run: ({ editor: i }) => { i.chain().focus().toggleBold().run(); } },
      { id: 'italic', group: 'text', label: t('issues.editor.commands.italic'), keywords: ['emphasis', '*'], icon: Italic, showInToolbar: true, isActive: (i) => i.isActive('italic'), run: ({ editor: i }) => { i.chain().focus().toggleItalic().run(); } },
      { id: 'strike', group: 'text', label: t('issues.editor.commands.strike'), keywords: ['~~'], icon: Strikethrough, showInToolbar: true, isActive: (i) => i.isActive('strike'), run: ({ editor: i }) => { i.chain().focus().toggleStrike().run(); } },
      { id: 'underline', group: 'text', label: t('issues.editor.commands.underline'), keywords: ['underline'], icon: UnderlineIcon, showInToolbar: true, isActive: (i) => i.isActive('underline'), run: ({ editor: i }) => { i.chain().focus().toggleUnderline().run(); } },
      { id: 'heading1', group: 'headings', label: t('issues.editor.commands.heading1'), keywords: ['h1', '#', 'heading 1'], icon: Heading1, showInSlash: true, showInTextStyleMenu: true, shortcut: { key: '1', code: 'Digit1', ctrl: true, alt: true, display: ['Ctrl', 'Alt', '1'] }, isActive: (i) => i.isActive('heading', { level: 1 }), run: ({ editor: i }) => { i.chain().focus().toggleHeading({ level: 1 }).run(); } },
      { id: 'heading2', group: 'headings', label: t('issues.editor.commands.heading2'), keywords: ['h2', '##', 'heading 2'], icon: Heading2, showInSlash: true, showInTextStyleMenu: true, shortcut: { key: '2', code: 'Digit2', ctrl: true, alt: true, display: ['Ctrl', 'Alt', '2'] }, isActive: (i) => i.isActive('heading', { level: 2 }), run: ({ editor: i }) => { i.chain().focus().toggleHeading({ level: 2 }).run(); } },
      { id: 'heading3', group: 'headings', label: t('issues.editor.commands.heading3'), keywords: ['h3', '###', 'heading 3'], icon: Heading3, hideInToolbar: true, showInSlash: true, showInTextStyleMenu: true, shortcut: { key: '3', code: 'Digit3', ctrl: true, alt: true, display: ['Ctrl', 'Alt', '3'] }, isActive: (i) => i.isActive('heading', { level: 3 }), run: ({ editor: i }) => { i.chain().focus().toggleHeading({ level: 3 }).run(); } },
      { id: 'heading4', group: 'headings', label: t('issues.editor.commands.heading4'), keywords: ['h4', '####', 'heading 4'], icon: Heading3, hideInToolbar: true, showInTextStyleMenu: true, shortcut: { key: '4', code: 'Digit4', ctrl: true, alt: true, display: ['Ctrl', 'Alt', '4'] }, isActive: (i) => i.isActive('heading', { level: 4 }), run: ({ editor: i }) => { i.chain().focus().toggleHeading({ level: 4 }).run(); } },
      { id: 'paragraph', group: 'headings', label: t('issues.editor.commands.paragraph'), keywords: ['text', 'regular text'], icon: Pilcrow, hideInToolbar: true, showInTextStyleMenu: true, shortcut: { key: '0', code: 'Digit0', ctrl: true, alt: true, display: ['Ctrl', 'Alt', '0'] }, isActive: (i) => i.isActive('paragraph'), run: ({ editor: i }) => { i.chain().focus().setParagraph().run(); } },
      { id: 'bulletList', group: 'lists', label: t('issues.editor.commands.bulletList'), keywords: ['-', '*', 'bulleted list'], icon: List, showInSlash: true, shortcut: { key: '8', code: 'Digit8', ctrl: true, shift: true, display: ['Ctrl', 'Shift', '8'] }, isActive: (i) => i.isActive('bulletList'), run: ({ editor: i }) => { i.chain().focus().toggleBulletList().run(); } },
      { id: 'orderedList', group: 'lists', label: t('issues.editor.commands.orderedList'), keywords: ['1.', 'numbered list'], icon: ListOrdered, showInSlash: true, shortcut: { key: '9', code: 'Digit9', ctrl: true, shift: true, display: ['Ctrl', 'Shift', '9'] }, isActive: (i) => i.isActive('orderedList'), run: ({ editor: i }) => { i.chain().focus().toggleOrderedList().run(); } },
      { id: 'taskList', group: 'lists', label: t('issues.editor.commands.taskList'), keywords: ['todo', '[ ]', 'checklist', 'task'], icon: ListTodo, showInSlash: true, shortcut: { key: '7', code: 'Digit7', ctrl: true, shift: true, display: ['Ctrl', 'Shift', '7'] }, isActive: (i) => i.isActive('taskList'), run: ({ editor: i }) => { i.chain().focus().toggleTaskList().run(); } },
      { id: 'media', group: 'insert', label: t('issues.editor.commands.media'), keywords: ['insert media', 'media', 'image'], icon: ImagePlus, hideInToolbar: true, showInSlash: true, placeholder: true, run: ({ triggerAction }) => triggerAction('media') },
      { id: 'gif', group: 'insert', label: t('issues.editor.commands.gif'), keywords: ['gif', 'insert gif'], icon: Clapperboard, hideInToolbar: true, showInSlash: true, placeholder: true, run: ({ triggerAction }) => triggerAction('gif') },
      { id: 'attachment', group: 'insert', label: t('issues.editor.commands.attachment'), keywords: ['attach file', 'file', 'upload'], icon: Paperclip, hideInToolbar: true, showInSlash: true, shortcut: { key: 'u', code: 'KeyU', ctrl: true, shift: true, display: ['Ctrl', 'Shift', 'U'] }, run: ({ triggerAction }) => triggerAction('attachment') },
      { id: 'blockquote', group: 'structure', label: t('issues.editor.commands.quote'), keywords: ['>'], icon: Quote, menuOnly: true, showInToolbar: true, isActive: (i) => i.isActive('blockquote'), run: ({ editor: i }) => { i.chain().focus().toggleBlockquote().run(); } },
      { id: 'codeBlock', group: 'structure', label: t('issues.editor.commands.codeBlock'), keywords: ['```', 'code'], icon: Code2, showInSlash: true, showInToolbar: true, shortcut: { key: '\\', code: 'Backslash', ctrl: true, shift: true, display: ['Ctrl', 'Shift', '\\'] }, isActive: (i) => i.isActive('codeBlock'), run: ({ editor: i }) => { i.chain().focus().toggleCodeBlock().run(); } },
      { id: 'diagram', group: 'structure', label: t('issues.editor.commands.diagram'), keywords: ['diagram', 'flowchart'], icon: Workflow, hideInToolbar: true, showInSlash: true, placeholder: true, run: ({ triggerAction }) => triggerAction('diagram') },
      { id: 'collapsibleSection', group: 'structure', label: t('issues.editor.commands.collapsibleSection'), keywords: ['collapse', 'collapsible', 'details'], icon: PanelTop, hideInToolbar: true, showInSlash: true, placeholder: true, run: ({ triggerAction }) => triggerAction('collapsibleSection') },
      { id: 'divider', group: 'structure', label: t('issues.editor.commands.divider'), keywords: ['---', 'separator'], icon: Minus, menuOnly: true, run: ({ editor: i }) => { i.chain().focus().setHorizontalRule().run(); } },
      { id: 'link', group: 'structure', label: t('issues.editor.commands.link'), keywords: ['url', 'hyperlink'], icon: Link2, showInToolbar: true, isActive: (i) => i.isActive('link'), run: ({ openLinkPopover }) => openLinkPopover('selection') },
      { id: 'documentRelation', group: 'insert', label: t('issues.editor.commands.documentRelation'), keywords: ['document', 'doc'], icon: FileText, hideInToolbar: true, run: ({ triggerAction }) => triggerAction('documentRelation') },
      { id: 'subIssue', group: 'relations', label: t('issues.editor.commands.subIssue'), keywords: ['child issue'], icon: FilePlus2, hideInToolbar: true, run: ({ triggerAction }) => triggerAction('subIssue') },
      { id: 'relatedIssue', group: 'relations', label: t('issues.editor.commands.relatedIssue'), keywords: ['issue mention', 'relation'], icon: GitBranchPlus, hideInToolbar: true, run: ({ triggerAction }) => triggerAction('relatedIssue') },
      { id: 'projectRelation', group: 'relations', label: t('issues.editor.commands.projectRelation'), keywords: ['project'], icon: FolderKanban, hideInToolbar: true, run: ({ triggerAction }) => triggerAction('projectRelation') },
    ];
  }, [editor, t]);

  const commandsRef = useRef<CommandDescriptor[]>(commands);
  commandsRef.current = commands;

  const filteredCommands = useMemo(() => {
    const query = slashState.query.trim().toLowerCase();
    const visible = commands.filter((command) => command.showInSlash);
    if (!query) return visible;
    return visible.filter((command) => [command.label, ...command.keywords].join(' ').toLowerCase().includes(query));
  }, [commands, slashState.query]);

  const filteredCommandGroups = useMemo(
    () =>
      SLASH_MENU_GROUPS.map((group) => ({
        group,
        commands: filteredCommands.filter((command) => command.group === group),
      })).filter((entry) => entry.commands.length > 0),
    [filteredCommands],
  );

  useEffect(() => {
    setSlashState((current) => {
      if (!current.open) return current;
      const nextIndex = Math.min(current.selectedIndex, Math.max(filteredCommands.length - 1, 0));
      if (nextIndex === current.selectedIndex) return current;
      const next = { ...current, selectedIndex: nextIndex };
      slashStateRef.current = next;
      return next;
    });
  }, [filteredCommands.length]);

  const closeSlashMenu = useCallback(() => {
    const closed = { open: false, query: '', selectedIndex: 0, position: { top: 0, left: 0 }, range: null };
    slashStateRef.current = closed;
    setSlashState(closed);
  }, []);

  const clearSlashQuery = useCallback(() => {
    if (!editor) return;
    const range = slashStateRef.current.range;
    if (range) editor.chain().focus().deleteRange(range).run();
    closeSlashMenu();
  }, [closeSlashMenu, editor]);

  const openLinkPopover = useCallback(
    (mode: LinkMode = 'selection') => {
      if (!editor) return;
      const attrs = editor.getAttributes('link');
      const { from, to, empty } = editor.state.selection;
      if (mode === 'selection' && empty && !attrs.href) return;
      const coords = editor.view.coordsAtPos(to);
      suppressBlurCommitRef.current = true;
      setLinkState({
        open: true,
        url: attrs.href || 'https://',
        mode,
        range: { from, to },
        position: {
          top: Math.max(coords.top - 84, 16),
          left: Math.max(coords.left - 120, 16),
        },
      });
    },
    [editor],
  );

  const triggerAction = useCallback((action: CommandActionType) => onCommandActionRef.current?.(action), []);

  const runCommand = useCallback(
    async (command: CommandDescriptor) => {
      if (!editor) return;
      if (command.isEnabled && !command.isEnabled(editor)) return;
      clearSlashQuery();
      await command.run({ editor, openLinkPopover, triggerAction, clearSlashQuery });
      editor.commands.focus();
    },
    [clearSlashQuery, editor, openLinkPopover, triggerAction],
  );

  const runCommandRef = useRef(runCommand);
  runCommandRef.current = runCommand;

  useEffect(() => {
    if (!editor) return;
    const nextRevision = initialRevision ?? 0;
    currentRevisionRef.current = nextRevision;
    const normalizedMarkdown = normalizeMarkdown(initialMarkdown);
    const normalizedJson = serializeContentJson(initialContentJson);
    const nextContent = initialContentJson ?? normalizedMarkdown;
    if (normalizedJson === committedJsonRef.current || normalizedJson === latestJsonRef.current) return;
    committedJsonRef.current = normalizedJson;
    latestJsonRef.current = normalizedJson;
    markDirty(false);
    setSaveState('idle');
    (editor.commands.setContent as (content: JSONContent | string, emitUpdate?: boolean) => boolean)(nextContent, false);
  }, [editor, initialContentJson, initialMarkdown, initialRevision, issueId, markDirty]);

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  useEffect(() => {
    const handlePointerUp = () => {
      pointerSelectingRef.current = false;
      setAllowBubbleMenu(true);
      if (editor) {
        updateSlashMenu(editor);
        updateToolbar(editor);
      }
    };
    const handleSelectionChange = () => {
      if (editorRef.current) {
        const domSelection = getEditorDomSelection(containerRef.current);
        if (domSelection && domSelection.text.trim().length > 0) {
          pointerSelectingRef.current = false;
          setAllowBubbleMenu(true);
        }
        updateToolbar(editorRef.current);
      }
    };
    window.addEventListener('mouseup', handlePointerUp);
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      window.removeEventListener('mouseup', handlePointerUp);
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [editor, updateSlashMenu, updateToolbar]);

  useEffect(() => {
    setSlashMenuMounted(true);
    return () => {
      if (commitTimeoutRef.current) window.clearTimeout(commitTimeoutRef.current);
      if (savedTimeoutRef.current) window.clearTimeout(savedTimeoutRef.current);
    };
  }, []);

  const applyLink = useCallback(() => {
    if (!editor || !linkState.range) return;
    const href = normalizeHref(linkState.url);
    suppressBlurCommitRef.current = true;
    if (!href) {
      editor.chain().focus().setTextSelection(linkState.range).extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().setTextSelection(linkState.range).extendMarkRange('link').unsetLink().setLink({ href }).run();
    }
    markDirty(true);
    setSaveState('dirty');
    scheduleCommit();
    setLinkState({ open: false, url: 'https://', mode: 'selection', range: null, position: { top: 0, left: 0 } });
    window.setTimeout(() => {
      suppressBlurCommitRef.current = false;
      editor.commands.focus();
    }, 0);
  }, [editor, linkState, markDirty, scheduleCommit]);

  const removeLink = useCallback(() => {
    if (!editor || !linkState.range) return;
    suppressBlurCommitRef.current = true;
    editor.chain().focus().setTextSelection(linkState.range).extendMarkRange('link').unsetLink().run();
    markDirty(true);
    setSaveState('dirty');
    scheduleCommit();
    setLinkState({ open: false, url: 'https://', mode: 'selection', range: null, position: { top: 0, left: 0 } });
    window.setTimeout(() => {
      suppressBlurCommitRef.current = false;
      editor.commands.focus();
    }, 0);
  }, [editor, linkState.range, markDirty, scheduleCommit]);

  if (!editor) {
    return <div className="min-h-[16rem]" />;
  }

  const textStyleCommands = TEXT_STYLE_COMMAND_IDS.map((id) => commands.find((command) => command.id === id)).filter(Boolean) as CommandDescriptor[];
  const toolbarCommands = commands.filter((command) => command.showInToolbar);
  const toolbarOrder = ['bold', 'italic', 'strike', 'underline', 'link', 'blockquote', 'codeBlock', 'attachment'] as const;
  const orderedToolbarCommands = toolbarOrder
    .map((id) => toolbarCommands.find((command) => command.id === id))
    .filter(Boolean) as CommandDescriptor[];
  const listCommands = ['bulletList', 'orderedList', 'taskList']
    .map((id) => commands.find((command) => command.id === id))
    .filter(Boolean) as CommandDescriptor[];
  const activeListCommand = listCommands.find((command) => command.isActive?.(editor)) ?? listCommands[0];
  const textStyleActiveCommand =
    textStyleCommands.find((command) => command.isActive?.(editor)) ??
    textStyleCommands.find((command) => command.id === 'paragraph');

  return (
    <div ref={containerRef} className="relative" data-testid="markdown-editor-root">
      <EditorContent editor={editor} />

      {slashMenuMounted && slashState.open && filteredCommands.length
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
      {slashMenuMounted && toolbarState.open
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
                  suppressBlurCommitRef.current = open;
                  setTextStyleMenuOpen(open);
                  if (open) {
                    lastToolbarPositionRef.current = toolbarState.position;
                    setToolbarState({ open: true, position: toolbarState.position });
                    return;
                  }
                  window.setTimeout(() => {
                    suppressBlurCommitRef.current = false;
                    editor.commands.focus();
                    updateToolbar(editor);
                  }, 0);
                }}
              >
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    data-testid="markdown-toolbar-text-style-trigger"
                    className="inline-flex h-9 items-center gap-1 rounded-[10px] bg-slate-100 px-3 text-[15px] text-ink-700 outline-none transition hover:bg-slate-100/90"
                    aria-label={t('issues.editor.commands.textStyle')}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      suppressBlurCommitRef.current = true;
                    }}
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
                          command.isActive?.(editor) ? 'bg-slate-100 text-ink-900' : ''
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
                      command.isActive?.(editor) ? 'bg-slate-100 text-ink-900' : ''
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
                  suppressBlurCommitRef.current = open;
                  setListMenuOpen(open);
                  if (open) {
                    lastToolbarPositionRef.current = toolbarState.position;
                    setToolbarState({ open: true, position: toolbarState.position });
                    return;
                  }
                  window.setTimeout(() => {
                    suppressBlurCommitRef.current = false;
                    editor.commands.focus();
                    updateToolbar(editor);
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
                    onMouseDown={(event) => {
                      event.preventDefault();
                      suppressBlurCommitRef.current = true;
                    }}
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
                    command.isActive?.(editor) ? 'bg-slate-100 text-ink-900' : ''
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
      {slashMenuMounted && linkState.open
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
                      setLinkState({ open: false, url: 'https://', mode: 'selection', range: null, position: { top: 0, left: 0 } });
                      suppressBlurCommitRef.current = false;
                      editor.commands.focus();
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
    </div>
  );
}

function normalizeMarkdown(value: string | null | undefined) {
  return (value ?? '').replace(/\r\n/g, '\n');
}

function serializeContentJson(value?: JSONContent | null) {
  return JSON.stringify(value ?? null);
}

function normalizeHref(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function findShortcutCommand(commands: CommandDescriptor[], event: KeyboardEvent) {
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

function getToolbarPosition(editor: TiptapEditor) {
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

function getEditorDomSelection(container: HTMLDivElement | null) {
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

function getSlashMenuState(editor: TiptapEditor, pointerSelecting: boolean): SlashMenuState {
  if (pointerSelecting || !editor.isFocused) {
    return { open: false, query: '', selectedIndex: 0, position: { top: 0, left: 0 }, range: null };
  }
  const { $from, empty, from } = editor.state.selection;
  if (!empty) {
    return { open: false, query: '', selectedIndex: 0, position: { top: 0, left: 0 }, range: null };
  }
  const textBefore = $from.parent.textBetween(0, $from.parentOffset, '\0', '\0');
  const slashMatch = textBefore.match(/(?:^|\s)\/([^\s]*)$/);
  if (!slashMatch) {
    return { open: false, query: '', selectedIndex: 0, position: { top: 0, left: 0 }, range: null };
  }
  const commandText = slashMatch[0].trimStart();
  const start = from - commandText.length;
  const coords = editor.view.coordsAtPos(from);
  return {
    open: true,
    query: slashMatch[1] ?? '',
    selectedIndex: 0,
    position: { top: coords.bottom + 10, left: coords.left - 8 },
    range: { from: start, to: from },
  };
}

function exitEmptyListItem(editor: TiptapEditor | null) {
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
