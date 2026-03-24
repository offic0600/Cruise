'use client';

import { type MouseEvent as ReactMouseEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Extension, InputRule, type Range } from '@tiptap/core';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import StarterKit from '@tiptap/starter-kit';
import { EditorContent, useEditor, type Editor as TiptapEditor } from '@tiptap/react';
import { Markdown } from 'tiptap-markdown';
import {
  Bold,
  ChevronRight,
  Code2,
  FilePlus2,
  FileText,
  FolderKanban,
  GitBranchPlus,
  Heading1,
  Heading2,
  Italic,
  Link2,
  List,
  ListOrdered,
  ListTodo,
  Minus,
  Paperclip,
  Pilcrow,
  Quote,
  Strikethrough,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/i18n/useI18n';
import { cn } from '@/lib/utils';

type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';
type CommandActionType = 'attachment' | 'subIssue' | 'relatedIssue' | 'projectRelation' | 'documentRelation';
type CommandGroup = 'text' | 'headings' | 'lists' | 'structure' | 'insert' | 'relations';
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
  isActive?: (editor: TiptapEditor) => boolean;
  isEnabled?: (editor: TiptapEditor) => boolean;
  run: (context: CommandContext) => void | Promise<void>;
};

interface MarkdownEditorProps {
  issueId: number | string;
  initialValue: string;
  onCommit: (markdown: string) => Promise<void> | void;
  onDirtyChange?: (dirty: boolean) => void;
  onSelectionChange?: (hasSelection: boolean) => void;
  onCommandAction?: (action: CommandActionType, payload?: unknown) => void;
}

const TOOLBAR_GROUPS: CommandGroup[] = ['text', 'headings', 'lists', 'structure'];
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
  initialValue,
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
  const committedMarkdownRef = useRef(normalizeMarkdown(initialValue));
  const latestMarkdownRef = useRef(normalizeMarkdown(initialValue));
  const dirtyRef = useRef(false);
  const onCommitRef = useRef(onCommit);
  const onDirtyChangeRef = useRef(onDirtyChange);
  const onSelectionChangeRef = useRef(onSelectionChange);
  const onCommandActionRef = useRef(onCommandAction);
  const slashStateRef = useRef<SlashMenuState>({ open: false, query: '', selectedIndex: 0, position: { top: 0, left: 0 }, range: null });
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [allowBubbleMenu, setAllowBubbleMenu] = useState(true);
  const [toolbarState, setToolbarState] = useState<ToolbarState>({ open: false, position: { top: 0, left: 0 } });
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

  const scheduleCommit = useCallback(() => {
    if (commitTimeoutRef.current) window.clearTimeout(commitTimeoutRef.current);
    commitTimeoutRef.current = window.setTimeout(async () => {
      const instance = editorRef.current;
      if (!instance) return;
      const markdown = getMarkdown(instance);
      if (markdown === committedMarkdownRef.current) {
        markDirty(false);
        setSaveState('idle');
        return;
      }
      setSaveState('saving');
      try {
        await onCommitRef.current(markdown);
        committedMarkdownRef.current = markdown;
        latestMarkdownRef.current = markdown;
        markDirty(false);
        setSaveState('saved');
        if (savedTimeoutRef.current) window.clearTimeout(savedTimeoutRef.current);
        savedTimeoutRef.current = window.setTimeout(() => setSaveState('idle'), 1000);
      } catch {
        setSaveState('error');
      }
    }, 500);
  }, [getMarkdown, markDirty]);

  const commitNow = useCallback(async () => {
    if (commitTimeoutRef.current) {
      window.clearTimeout(commitTimeoutRef.current);
      commitTimeoutRef.current = null;
    }
    const instance = editorRef.current;
    if (!instance) return;
    const markdown = getMarkdown(instance);
    if (markdown === committedMarkdownRef.current) {
      markDirty(false);
      setSaveState('idle');
      return;
    }
    setSaveState('saving');
    try {
      await onCommitRef.current(markdown);
      committedMarkdownRef.current = markdown;
      latestMarkdownRef.current = markdown;
      markDirty(false);
      setSaveState('saved');
      if (savedTimeoutRef.current) window.clearTimeout(savedTimeoutRef.current);
      savedTimeoutRef.current = window.setTimeout(() => setSaveState('idle'), 1000);
    } catch {
      setSaveState('error');
    }
  }, [getMarkdown, markDirty]);

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
    const domSelection = typeof window !== 'undefined' ? window.getSelection() : null;
    const hasDomSelection = Boolean(domSelection && !domSelection.isCollapsed && domSelection.toString().trim().length > 0);
    if (!allowBubbleMenu || pointerSelectingRef.current || linkState.open || !hasDomSelection) {
      setToolbarState({ open: false, position: { top: 0, left: 0 } });
      return;
    }
    const position = getToolbarPosition(instance);
    if (!position) {
      setToolbarState({ open: false, position: { top: 0, left: 0 } });
      return;
    }
    setToolbarState({ open: true, position });
  }, [allowBubbleMenu, linkState.open]);

  const editor = useEditor({
    immediatelyRender: false,
    autofocus: false,
    content: committedMarkdownRef.current,
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
        heading: { levels: [1, 2] },
      }),
      Placeholder.configure({ placeholder: t('issues.editor.placeholder') }),
      Link.configure({ autolink: true, openOnClick: false, linkOnPaste: true }),
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
    onUpdate: ({ editor: instance }) => {
      const markdown = getMarkdown(instance);
      latestMarkdownRef.current = markdown;
      const dirty = markdown !== committedMarkdownRef.current;
      markDirty(dirty);
      setSaveState(dirty ? 'dirty' : 'idle');
      scheduleCommit();
      updateSlashMenu(instance);
      updateToolbar(instance);
    },
    onBlur: () => {
      setToolbarState({ open: false, position: { top: 0, left: 0 } });
      if (!suppressBlurCommitRef.current) {
        void commitNow();
      }
    },
  });

  const commands = useMemo<CommandDescriptor[]>(() => {
    if (!editor) return [];
    return [
      { id: 'bold', group: 'text', label: t('issues.editor.commands.bold'), keywords: ['strong', '**'], icon: Bold, isActive: (i) => i.isActive('bold'), run: ({ editor: i }) => { i.chain().focus().toggleBold().run(); } },
      { id: 'italic', group: 'text', label: t('issues.editor.commands.italic'), keywords: ['emphasis', '*'], icon: Italic, isActive: (i) => i.isActive('italic'), run: ({ editor: i }) => { i.chain().focus().toggleItalic().run(); } },
      { id: 'strike', group: 'text', label: t('issues.editor.commands.strike'), keywords: ['~~'], icon: Strikethrough, isActive: (i) => i.isActive('strike'), run: ({ editor: i }) => { i.chain().focus().toggleStrike().run(); } },
      { id: 'heading1', group: 'headings', label: t('issues.editor.commands.heading1'), keywords: ['h1', '#'], icon: Heading1, isActive: (i) => i.isActive('heading', { level: 1 }), run: ({ editor: i }) => { i.chain().focus().toggleHeading({ level: 1 }).run(); } },
      { id: 'heading2', group: 'headings', label: t('issues.editor.commands.heading2'), keywords: ['h2', '##'], icon: Heading2, isActive: (i) => i.isActive('heading', { level: 2 }), run: ({ editor: i }) => { i.chain().focus().toggleHeading({ level: 2 }).run(); } },
      { id: 'paragraph', group: 'headings', label: t('issues.editor.commands.paragraph'), keywords: ['text'], icon: Pilcrow, hideInToolbar: true, isActive: (i) => i.isActive('paragraph'), run: ({ editor: i }) => { i.chain().focus().setParagraph().run(); } },
      { id: 'bulletList', group: 'lists', label: t('issues.editor.commands.bulletList'), keywords: ['-', '*'], icon: List, isActive: (i) => i.isActive('bulletList'), run: ({ editor: i }) => { i.chain().focus().toggleBulletList().run(); } },
      { id: 'orderedList', group: 'lists', label: t('issues.editor.commands.orderedList'), keywords: ['1.'], icon: ListOrdered, hideInToolbar: true, isActive: (i) => i.isActive('orderedList'), run: ({ editor: i }) => { i.chain().focus().toggleOrderedList().run(); } },
      { id: 'taskList', group: 'lists', label: t('issues.editor.commands.taskList'), keywords: ['todo', '[ ]'], icon: ListTodo, isActive: (i) => i.isActive('taskList'), run: ({ editor: i }) => { i.chain().focus().toggleTaskList().run(); } },
      { id: 'blockquote', group: 'structure', label: t('issues.editor.commands.quote'), keywords: ['>'], icon: Quote, isActive: (i) => i.isActive('blockquote'), run: ({ editor: i }) => { i.chain().focus().toggleBlockquote().run(); } },
      { id: 'codeBlock', group: 'structure', label: t('issues.editor.commands.codeBlock'), keywords: ['```', 'code'], icon: Code2, isActive: (i) => i.isActive('codeBlock'), run: ({ editor: i }) => { i.chain().focus().toggleCodeBlock().run(); } },
      { id: 'divider', group: 'structure', label: t('issues.editor.commands.divider'), keywords: ['---', 'separator'], icon: Minus, run: ({ editor: i }) => { i.chain().focus().setHorizontalRule().run(); } },
      { id: 'link', group: 'structure', label: t('issues.editor.commands.link'), keywords: ['url', 'hyperlink'], icon: Link2, isActive: (i) => i.isActive('link'), run: ({ openLinkPopover }) => openLinkPopover('selection') },
      { id: 'attachment', group: 'insert', label: t('issues.editor.commands.attachment'), keywords: ['file', 'upload'], icon: Paperclip, hideInToolbar: true, run: ({ triggerAction }) => triggerAction('attachment') },
      { id: 'documentRelation', group: 'insert', label: t('issues.editor.commands.documentRelation'), keywords: ['document', 'doc'], icon: FileText, hideInToolbar: true, run: ({ triggerAction }) => triggerAction('documentRelation') },
      { id: 'subIssue', group: 'relations', label: t('issues.editor.commands.subIssue'), keywords: ['child issue'], icon: FilePlus2, hideInToolbar: true, run: ({ triggerAction }) => triggerAction('subIssue') },
      { id: 'relatedIssue', group: 'relations', label: t('issues.editor.commands.relatedIssue'), keywords: ['issue mention', 'relation'], icon: GitBranchPlus, hideInToolbar: true, run: ({ triggerAction }) => triggerAction('relatedIssue') },
      { id: 'projectRelation', group: 'relations', label: t('issues.editor.commands.projectRelation'), keywords: ['project'], icon: FolderKanban, hideInToolbar: true, run: ({ triggerAction }) => triggerAction('projectRelation') },
    ];
  }, [editor, t]);

  const filteredCommands = useMemo(() => {
    const query = slashState.query.trim().toLowerCase();
    const visible = commands.filter((command) => !command.hideInToolbar || command.group === 'insert' || command.group === 'relations' || command.id === 'paragraph' || command.id === 'orderedList');
    if (!query) return visible;
    return visible.filter((command) => [command.label, ...command.keywords].join(' ').toLowerCase().includes(query));
  }, [commands, slashState.query]);

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

  useEffect(() => {
    if (!editor) return;
    const normalized = normalizeMarkdown(initialValue);
    if (normalized === committedMarkdownRef.current || normalized === latestMarkdownRef.current) return;
    committedMarkdownRef.current = normalized;
    latestMarkdownRef.current = normalized;
    markDirty(false);
    setSaveState('idle');
    (editor.commands.setContent as (content: string, emitUpdate?: boolean) => boolean)(normalized, false);
  }, [editor, initialValue, issueId, markDirty]);

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
    editor.chain().focus().setTextSelection(linkState.range).extendMarkRange('link').run();
    if (!href) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href }).run();
    }
    setLinkState({ open: false, url: 'https://', mode: 'selection', range: null, position: { top: 0, left: 0 } });
    window.setTimeout(() => {
      suppressBlurCommitRef.current = false;
      editor.commands.focus();
    }, 0);
  }, [editor, linkState]);

  const removeLink = useCallback(() => {
    if (!editor || !linkState.range) return;
    suppressBlurCommitRef.current = true;
    editor.chain().focus().setTextSelection(linkState.range).unsetLink().run();
    setLinkState({ open: false, url: 'https://', mode: 'selection', range: null, position: { top: 0, left: 0 } });
    window.setTimeout(() => {
      suppressBlurCommitRef.current = false;
      editor.commands.focus();
    }, 0);
  }, [editor, linkState.range]);

  if (!editor) {
    return <div className="min-h-[16rem]" />;
  }

  const toolbarCommands = commands.filter((command) => !command.hideInToolbar);
  const toolbarGrouped = TOOLBAR_GROUPS.map((group) => toolbarCommands.filter((command) => command.group === group)).filter((group) => group.length > 0);

  return (
    <div ref={containerRef} className="relative" data-testid="markdown-editor-root">
      <EditorContent editor={editor} />

      {slashMenuMounted && slashState.open && filteredCommands.length
        ? createPortal(
            <div
              data-testid="markdown-slash-menu"
              className="fixed z-[85] w-[300px] overflow-hidden rounded-[20px] border border-slate-200/90 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.15)]"
              style={{ top: slashState.position.top, left: slashState.position.left }}
            >
              <div className="max-h-[360px] overflow-y-auto p-2">
                {filteredCommands.map((command, index) => (
                  <button
                    key={command.id}
                    type="button"
                    data-testid={`markdown-slash-${command.id}`}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition',
                      index === slashState.selectedIndex ? 'bg-slate-100 text-ink-900' : 'text-ink-700 hover:bg-slate-50',
                    )}
                    onMouseDown={(event: ReactMouseEvent<HTMLButtonElement>) => event.preventDefault()}
                    onClick={() => void runCommand(command)}
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-ink-700">
                      <command.icon className="h-4 w-4 stroke-[1.9]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">{command.label}</span>
                      <span className="block truncate text-xs text-ink-400">{command.keywords.join(' · ')}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 text-ink-300" />
                  </button>
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
              className="fixed z-[88] flex items-center gap-1 rounded-full border border-slate-200/90 bg-white/95 px-2 py-1.5 shadow-[0_16px_42px_rgba(15,23,42,0.12)] backdrop-blur"
              style={{ top: toolbarState.position.top, left: toolbarState.position.left }}
              onMouseDown={(event) => event.preventDefault()}
            >
              {toolbarGrouped.map((group, groupIndex) => (
                <div key={group[0]?.group} className="flex items-center gap-1">
                  {group.map((command) => (
                    <button
                      key={command.id}
                      type="button"
                      data-testid={`markdown-toolbar-${command.id}`}
                      onClick={() => void runCommand(command)}
                      className={cn(
                        'inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-transparent px-2 text-ink-700 transition hover:border-slate-200 hover:bg-slate-50',
                        command.isActive?.(editor) ? 'border-slate-200 bg-slate-100 text-ink-900' : '',
                      )}
                      aria-label={command.label}
                    >
                      <command.icon className="h-4 w-4 stroke-[1.9]" />
                    </button>
                  ))}
                  {groupIndex < toolbarGrouped.length - 1 ? <div className="mx-0.5 h-5 w-px bg-slate-200" /> : null}
                </div>
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

function normalizeHref(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
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
