'use client';

import { useEditor, type Editor as TiptapEditor } from '@tiptap/react';
import { Extension, InputRule, type JSONContent } from '@tiptap/core';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import Underline from '@tiptap/extension-underline';
import CodeBlock from '@tiptap/extension-code-block';
import StarterKit from '@tiptap/starter-kit';
import type { MutableRefObject } from 'react';
import type { EditorCommand, SlashMenuState, Translator } from './types';
import { EDITOR_CLASS_NAME, exitEmptyListItem, findShortcutCommand, normalizeMarkdown } from './utils';
import { Markdown } from 'tiptap-markdown';

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

type UseEditorKernelArgs = {
  initialMarkdown?: string | null;
  initialContentJson?: JSONContent | null;
  t: Translator;
  pointerSelectingRef: MutableRefObject<boolean>;
  editorRef: MutableRefObject<TiptapEditor | null>;
  commandsRef: MutableRefObject<EditorCommand[]>;
  runCommandRef: MutableRefObject<(command: EditorCommand) => Promise<void>>;
  getSlashState: () => SlashMenuState;
  getFilteredCommands: () => EditorCommand[];
  closeSlashMenu: () => void;
  onSlashNavigate: (direction: 1 | -1) => void;
  onSelectionChange?: (hasSelection: boolean) => void;
  onPointerSelectionStart: () => void;
  onPointerSelectionEnd: () => void;
  onSelectionOrFocusUpdate: (editor: TiptapEditor) => void;
  onEditorUpdate: (editor: TiptapEditor) => void;
  onEditorBlur: () => void;
};

export function useEditorKernel({
  initialMarkdown,
  initialContentJson,
  t,
  pointerSelectingRef,
  editorRef,
  commandsRef,
  runCommandRef,
  getSlashState,
  getFilteredCommands,
  closeSlashMenu,
  onSlashNavigate,
  onSelectionChange,
  onPointerSelectionStart,
  onPointerSelectionEnd,
  onSelectionOrFocusUpdate,
  onEditorUpdate,
  onEditorBlur,
}: UseEditorKernelArgs) {
  return useEditor({
    immediatelyRender: false,
    autofocus: false,
    content: initialContentJson ?? normalizeMarkdown(initialMarkdown),
    editorProps: {
      attributes: {
        class: EDITOR_CLASS_NAME,
        'data-testid': 'markdown-editor-editable',
        'aria-label': 'Issue description',
      },
      handleDOMEvents: {
        mousedown: () => {
          onPointerSelectionStart();
          return false;
        },
        mouseup: () => {
          window.requestAnimationFrame(onPointerSelectionEnd);
          return false;
        },
      },
      handleKeyDown: (_view, event) => {
        const shortcutCommand = findShortcutCommand(commandsRef.current, event);
        if (shortcutCommand) {
          event.preventDefault();
          void runCommandRef.current(shortcutCommand);
          return true;
        }

        const slashState = getSlashState();
        if (event.key === 'Escape') {
          if (slashState.open) {
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

        if (!slashState.open) return false;
        const filteredCommands = getFilteredCommands();
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          if (filteredCommands.length > 0) onSlashNavigate(1);
          return true;
        }

        if (event.key === 'ArrowUp') {
          event.preventDefault();
          if (filteredCommands.length > 0) onSlashNavigate(-1);
          return true;
        }

        if (event.key === 'Enter') {
          const command = filteredCommands[slashState.selectedIndex];
          if (!command) return false;
          event.preventDefault();
          void runCommandRef.current(command);
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
        placeholder: ({ node, editor }) =>
          node.type.name === 'paragraph'
            ? (editor.isEmpty ? t('issues.editor.placeholder') : t('issues.editor.commandHint'))
            : t('issues.editor.placeholder'),
      }),
      Link.configure({ autolink: true, openOnClick: false, linkOnPaste: true }),
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      Markdown.configure({ transformCopiedText: true, transformPastedText: true }),
      LinearMarkdownInputRules,
    ],
    onSelectionUpdate: ({ editor }) => {
      onSelectionChange?.(!editor.state.selection.empty);
      onSelectionOrFocusUpdate(editor);
    },
    onFocus: ({ editor }) => {
      onSelectionOrFocusUpdate(editor);
    },
    onUpdate: ({ editor }) => {
      onEditorUpdate(editor);
      onSelectionOrFocusUpdate(editor);
    },
    onBlur: () => {
      onEditorBlur();
    },
  });
}
