'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EditorContent, type Editor as TiptapEditor } from '@tiptap/react';
import { useI18n } from '@/i18n/useI18n';
import { buildEditorCommands } from './editor/commands';
import { EditorShell } from './editor/EditorShell';
import type { EditorCommand, LinkMode, MarkdownEditorProps, SlashMenuState, ToolbarState } from './editor/types';
import { useCruiseEditorPersistence } from './editor/useCruiseEditorPersistence';
import { useEditorKernel } from './editor/useEditorKernel';
import {
  createClosedLinkState,
  createClosedSlashState,
  getEditorDomSelection,
  getSlashMenuState,
  getToolbarPosition,
  normalizeHref,
  normalizeMarkdown,
  serializeContentJson,
  SLASH_MENU_GROUPS,
  TEXT_STYLE_COMMAND_IDS,
} from './editor/utils';

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
  const pointerSelectingRef = useRef(false);
  const suppressBlurCommitRef = useRef(false);
  const editorRef = useRef<TiptapEditor | null>(null);
  const lastToolbarPositionRef = useRef<ToolbarState['position']>({ top: 0, left: 0 });
  const slashStateRef = useRef(createClosedSlashState());
  const [allowBubbleMenu, setAllowBubbleMenu] = useState(true);
  const [toolbarState, setToolbarState] = useState<ToolbarState>({ open: false, position: { top: 0, left: 0 } });
  const [textStyleMenuOpen, setTextStyleMenuOpen] = useState(false);
  const [listMenuOpen, setListMenuOpen] = useState(false);
  const [slashMenuMounted, setSlashMenuMounted] = useState(false);
  const [slashState, setSlashState] = useState(createClosedSlashState());
  const [linkState, setLinkState] = useState(createClosedLinkState());
  const {
    saveState,
    setSaveState,
    committedJsonRef,
    latestJsonRef,
    markDirty,
    serializeEditor,
    scheduleCommit,
    commitNow,
    resetPersistedState,
  } = useCruiseEditorPersistence({ onCommit, onDirtyChange });

  const commands = useMemo(() => buildEditorCommands(t), [t]);
  const commandsRef = useRef<EditorCommand[]>(commands);
  commandsRef.current = commands;

  const filteredCommands = useMemo(() => {
    const query = slashState.query.trim().toLowerCase();
    const visible = commands.filter((command) => command.visibility?.slash);
    if (!query) return visible;
    return visible.filter((command) => [command.label, ...command.keywords].join(' ').toLowerCase().includes(query));
  }, [commands, slashState.query]);

  const filteredCommandsRef = useRef(filteredCommands);
  filteredCommandsRef.current = filteredCommands;

  const filteredCommandGroups = useMemo(
    () =>
      SLASH_MENU_GROUPS.map((group) => ({
        group,
        commands: filteredCommands.filter((command) => command.group === group),
      })).filter((entry) => entry.commands.length > 0),
    [filteredCommands],
  );

  const closeSlashMenu = useCallback(() => {
    const closed = createClosedSlashState();
    slashStateRef.current = closed;
    setSlashState(closed);
  }, []);

  const navigateSlashSelection = useCallback((direction: 1 | -1) => {
    setSlashState((current) => {
      if (!current.open) return current;
      const nextIndex = Math.max(0, Math.min(current.selectedIndex + direction, filteredCommandsRef.current.length - 1));
      const next = { ...current, selectedIndex: nextIndex };
      slashStateRef.current = next;
      return next;
    });
  }, []);

  const updateSlashMenu = useCallback((editor: TiptapEditor) => {
    const next = getSlashMenuState(editor, pointerSelectingRef.current);
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
  }, []);

  const updateToolbar = useCallback((editor: TiptapEditor) => {
    if (pointerSelectingRef.current) {
      setToolbarState({ open: false, position: { top: 0, left: 0 } });
      return;
    }
    if (textStyleMenuOpen || listMenuOpen) {
      setToolbarState({ open: true, position: lastToolbarPositionRef.current });
      return;
    }
    const domSelection = getEditorDomSelection(containerRef.current);
    const hasPmSelection = !editor.state.selection.empty;
    const hasEditorSelection = Boolean(domSelection && domSelection.text.trim().length > 0);
    if (!allowBubbleMenu || linkState.open || (!hasPmSelection && !hasEditorSelection)) {
      setToolbarState({ open: false, position: { top: 0, left: 0 } });
      return;
    }
    const position = getToolbarPosition();
    if (!position) {
      setToolbarState({ open: false, position: { top: 0, left: 0 } });
      return;
    }
    lastToolbarPositionRef.current = position;
    setToolbarState({ open: true, position });
  }, [allowBubbleMenu, linkState.open, listMenuOpen, textStyleMenuOpen]);

  const clearSlashQuery = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const range = slashStateRef.current.range;
    if (range) editor.chain().focus().deleteRange(range).run();
    closeSlashMenu();
  }, [closeSlashMenu]);

  const openLinkPopover = useCallback((mode: LinkMode = 'selection') => {
    const editor = editorRef.current;
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
  }, []);

  const dispatchBusinessAction = useCallback((action: Parameters<NonNullable<typeof onCommandAction>>[0]) => {
    onCommandAction?.(action);
  }, [onCommandAction]);

  const runCommand = useCallback(async (command: EditorCommand) => {
    const editor = editorRef.current;
    if (!editor) return;
    if (command.isEnabled && !command.isEnabled(editor)) return;
    clearSlashQuery();
    await command.run({ editor, openLinkPopover, dispatchBusinessAction, clearSlashQuery });
    editor.commands.focus();
  }, [clearSlashQuery, dispatchBusinessAction, openLinkPopover]);

  const runCommandRef = useRef(runCommand);
  runCommandRef.current = runCommand;

  const editor = useEditorKernel({
    initialMarkdown,
    initialContentJson,
    t,
    pointerSelectingRef,
    editorRef,
    commandsRef,
    runCommandRef,
    getSlashState: () => slashStateRef.current,
    getFilteredCommands: () => filteredCommandsRef.current,
    closeSlashMenu,
    onSlashNavigate: navigateSlashSelection,
    onSelectionChange,
    onPointerSelectionStart: () => {
      pointerSelectingRef.current = true;
      setAllowBubbleMenu(false);
      setToolbarState({ open: false, position: { top: 0, left: 0 } });
    },
    onPointerSelectionEnd: () => {
      pointerSelectingRef.current = false;
      setAllowBubbleMenu(true);
      if (editorRef.current) {
        updateSlashMenu(editorRef.current);
        updateToolbar(editorRef.current);
      }
    },
    onSelectionOrFocusUpdate: (instance) => {
      if (!pointerSelectingRef.current) setAllowBubbleMenu(true);
      updateSlashMenu(instance);
      updateToolbar(instance);
    },
    onEditorUpdate: (instance) => {
      const next = serializeEditor(instance);
      latestJsonRef.current = next.serializedJson;
      const dirty = next.serializedJson !== committedJsonRef.current;
      markDirty(dirty);
      setSaveState(dirty ? 'dirty' : 'idle');
      scheduleCommit(() => editorRef.current);
    },
    onEditorBlur: () => {
      if (!textStyleMenuOpen && !listMenuOpen) {
        setToolbarState({ open: false, position: { top: 0, left: 0 } });
      }
      if (!suppressBlurCommitRef.current) {
        void commitNow(() => editorRef.current);
      }
    },
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    const nextRevision = initialRevision ?? 0;
    const normalizedMarkdown = normalizeMarkdown(initialMarkdown);
    const normalizedJson = serializeContentJson(initialContentJson);
    const nextContent = initialContentJson ?? normalizedMarkdown;
    if (normalizedJson === committedJsonRef.current || normalizedJson === latestJsonRef.current) {
      resetPersistedState(normalizedJson, nextRevision);
      return;
    }
    resetPersistedState(normalizedJson, nextRevision);
    (editor.commands.setContent as (content: typeof nextContent, emitUpdate?: boolean) => boolean)(nextContent, false);
  }, [committedJsonRef, editor, initialContentJson, initialMarkdown, initialRevision, issueId, latestJsonRef, resetPersistedState]);

  useEffect(() => {
    setSlashState((current) => {
      if (!current.open) return current;
      const nextIndex = Math.min(current.selectedIndex, Math.max(filteredCommands.length - 1, 0));
      if (nextIndex === current.selectedIndex) return current;
      const next: SlashMenuState = { ...current, selectedIndex: nextIndex };
      slashStateRef.current = next;
      return next;
    });
  }, [filteredCommands.length]);

  useEffect(() => {
    const handlePointerUp = () => {
      pointerSelectingRef.current = false;
      setAllowBubbleMenu(true);
      if (editorRef.current) {
        updateSlashMenu(editorRef.current);
        updateToolbar(editorRef.current);
      }
    };
    const handleSelectionChange = () => {
      const editorInstance = editorRef.current;
      if (!editorInstance) return;
      const domSelection = getEditorDomSelection(containerRef.current);
      if (domSelection && domSelection.text.trim().length > 0) {
        pointerSelectingRef.current = false;
        setAllowBubbleMenu(true);
      }
      updateToolbar(editorInstance);
    };
    window.addEventListener('mouseup', handlePointerUp);
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      window.removeEventListener('mouseup', handlePointerUp);
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [updateSlashMenu, updateToolbar]);

  useEffect(() => {
    setSlashMenuMounted(true);
  }, []);

  const applyLink = useCallback(() => {
    const editorInstance = editorRef.current;
    if (!editorInstance || !linkState.range) return;
    const href = normalizeHref(linkState.url);
    suppressBlurCommitRef.current = true;
    if (!href) {
      editorInstance.chain().focus().setTextSelection(linkState.range).extendMarkRange('link').unsetLink().run();
    } else {
      editorInstance.chain().focus().setTextSelection(linkState.range).extendMarkRange('link').unsetLink().setLink({ href }).run();
    }
    markDirty(true);
    setSaveState('dirty');
    scheduleCommit(() => editorRef.current);
    setLinkState(createClosedLinkState());
    window.setTimeout(() => {
      suppressBlurCommitRef.current = false;
      editorInstance.commands.focus();
    }, 0);
  }, [linkState, markDirty, scheduleCommit, setSaveState]);

  const removeLink = useCallback(() => {
    const editorInstance = editorRef.current;
    if (!editorInstance || !linkState.range) return;
    suppressBlurCommitRef.current = true;
    editorInstance.chain().focus().setTextSelection(linkState.range).extendMarkRange('link').unsetLink().run();
    markDirty(true);
    setSaveState('dirty');
    scheduleCommit(() => editorRef.current);
    setLinkState(createClosedLinkState());
    window.setTimeout(() => {
      suppressBlurCommitRef.current = false;
      editorInstance.commands.focus();
    }, 0);
  }, [linkState.range, markDirty, scheduleCommit, setSaveState]);

  const closeLinkPopover = useCallback(() => {
    setLinkState(createClosedLinkState());
    suppressBlurCommitRef.current = false;
    editorRef.current?.commands.focus();
  }, []);

  if (!editor) {
    return <div className="min-h-[16rem]" />;
  }

  const textStyleCommands = TEXT_STYLE_COMMAND_IDS
    .map((id) => commands.find((command) => command.id === id))
    .filter(Boolean) as EditorCommand[];
  const toolbarCommands = commands.filter((command) => command.visibility?.toolbar);
  const toolbarOrder = ['bold', 'italic', 'strike', 'underline', 'link', 'blockquote', 'codeBlock', 'attachment'] as const;
  const orderedToolbarCommands = toolbarOrder
    .map((id) => toolbarCommands.find((command) => command.id === id))
    .filter(Boolean) as EditorCommand[];
  const listCommands = ['bulletList', 'orderedList', 'taskList']
    .map((id) => commands.find((command) => command.id === id))
    .filter(Boolean) as EditorCommand[];
  const activeListCommand = listCommands.find((command) => command.isActive?.(editor)) ?? listCommands[0];

  return (
    <div ref={containerRef} className="relative" data-testid="markdown-editor-root">
      <EditorShell
        editor={editor}
        mounted={slashMenuMounted}
        saveState={saveState}
        slashState={slashState}
        filteredCommands={filteredCommands}
        filteredCommandGroups={filteredCommandGroups}
        toolbarState={toolbarState}
        textStyleMenuOpen={textStyleMenuOpen}
        setTextStyleMenuOpen={setTextStyleMenuOpen}
        listMenuOpen={listMenuOpen}
        setListMenuOpen={setListMenuOpen}
        linkState={linkState}
        setLinkState={setLinkState}
        textStyleCommands={textStyleCommands}
        orderedToolbarCommands={orderedToolbarCommands}
        listCommands={listCommands}
        activeListCommand={activeListCommand}
        runCommand={runCommand}
        onToolbarMenuOpenChange={(_menu, open, position) => {
          suppressBlurCommitRef.current = open;
          if (open) {
            lastToolbarPositionRef.current = position;
            setToolbarState({ open: true, position });
          }
        }}
        onToolbarMenuClose={() => {
          suppressBlurCommitRef.current = false;
          updateToolbar(editor);
        }}
        applyLink={applyLink}
        removeLink={removeLink}
        closeLinkPopover={closeLinkPopover}
        t={t}
      >
        <EditorContent editor={editor} />
      </EditorShell>
    </div>
  );
}
