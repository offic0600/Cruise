'use client';

import {
  type MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import StarterKit from '@tiptap/starter-kit';
import { EditorContent, useEditor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import type { Editor as TiptapEditor } from '@tiptap/react';
import { Markdown } from 'tiptap-markdown';
import {
  Bold,
  Code2,
  Heading1,
  Heading2,
  Italic,
  Link2,
  List,
  ListTodo,
  Quote,
  SeparatorHorizontal,
  Strikethrough,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const editorContentClassName =
  'min-h-[16rem] cursor-text px-0 py-0 text-[15px] leading-7 text-ink-900 outline-none prose prose-slate max-w-none prose-p:my-3 prose-headings:mb-3 prose-headings:mt-5 prose-ul:my-3 prose-ol:my-3 prose-code:rounded prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:text-[0.92em]';

type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

interface MarkdownEditorProps {
  issueId: number | string;
  initialValue: string;
  onCommit: (markdown: string) => Promise<void> | void;
  onDirtyChange?: (dirty: boolean) => void;
  onSelectionChange?: (hasSelection: boolean) => void;
}

type ToolbarButton = {
  key: string;
  testId: string;
  icon: typeof Bold;
  isActive: (editor: TiptapEditor) => boolean;
  run: (editor: TiptapEditor) => void;
};

export default function MarkdownEditor({
  issueId,
  initialValue,
  onCommit,
  onDirtyChange,
  onSelectionChange,
}: MarkdownEditorProps) {
  const commitTimeoutRef = useRef<number | null>(null);
  const resetSavedStateTimeoutRef = useRef<number | null>(null);
  const pointerSelectingRef = useRef(false);
  const committedMarkdownRef = useRef(normalizeMarkdown(initialValue));
  const latestMarkdownRef = useRef(normalizeMarkdown(initialValue));
  const dirtyRef = useRef(false);
  const onCommitRef = useRef(onCommit);
  const onDirtyChangeRef = useRef(onDirtyChange);
  const onSelectionChangeRef = useRef(onSelectionChange);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [allowBubbleMenu, setAllowBubbleMenu] = useState(true);

  onCommitRef.current = onCommit;
  onDirtyChangeRef.current = onDirtyChange;
  onSelectionChangeRef.current = onSelectionChange;

  const markDirty = useCallback((nextDirty: boolean) => {
    if (dirtyRef.current === nextDirty) return;
    dirtyRef.current = nextDirty;
    onDirtyChangeRef.current?.(nextDirty);
  }, []);

  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions: [
        StarterKit,
        Link.configure({
          openOnClick: false,
          autolink: true,
          linkOnPaste: true,
          protocols: ['http', 'https', 'mailto'],
        }),
        TaskList,
        TaskItem.configure({ nested: true }),
        Placeholder.configure({
          placeholder: 'Add description…',
          emptyEditorClass:
            'before:pointer-events-none before:absolute before:left-0 before:top-0 before:text-ink-400/70 before:content-[attr(data-placeholder)]',
        }),
        Markdown.configure({
          html: false,
          tightLists: true,
          bulletListMarker: '-',
          linkify: true,
          breaks: false,
          transformPastedText: true,
          transformCopiedText: true,
        }),
      ],
      content: normalizeMarkdown(initialValue),
      editorProps: {
        attributes: {
          class: editorContentClassName,
          'data-testid': 'markdown-editor-editable',
          'aria-label': 'Issue description',
        },
      },
      onCreate: ({ editor }) => {
        const markdown = getMarkdown(editor);
        committedMarkdownRef.current = markdown;
        latestMarkdownRef.current = markdown;
      },
      onUpdate: ({ editor }) => {
        const markdown = getMarkdown(editor);
        latestMarkdownRef.current = markdown;
        const dirty = markdown !== committedMarkdownRef.current;
        markDirty(dirty);
        setSaveState(dirty ? 'dirty' : 'idle');
        scheduleCommit();
      },
      onSelectionUpdate: ({ editor }) => {
        onSelectionChangeRef.current?.(!editor.state.selection.empty);
      },
      onBlur: () => {
        window.setTimeout(() => {
          void flushCommit();
        }, 0);
      },
    },
    [issueId],
  );

  const clearPendingTimers = useCallback(() => {
    if (commitTimeoutRef.current != null) {
      window.clearTimeout(commitTimeoutRef.current);
      commitTimeoutRef.current = null;
    }
    if (resetSavedStateTimeoutRef.current != null) {
      window.clearTimeout(resetSavedStateTimeoutRef.current);
      resetSavedStateTimeoutRef.current = null;
    }
  }, []);

  const flushCommit = useCallback(async () => {
    if (!editor) return;

    const nextMarkdown = getMarkdown(editor);
    latestMarkdownRef.current = nextMarkdown;

    if (nextMarkdown === committedMarkdownRef.current) {
      markDirty(false);
      setSaveState('idle');
      return;
    }

    clearPendingTimers();
    setSaveState('saving');

    try {
      await onCommitRef.current(nextMarkdown);
      committedMarkdownRef.current = nextMarkdown;
      markDirty(false);
      setSaveState('saved');
      resetSavedStateTimeoutRef.current = window.setTimeout(() => {
        setSaveState((current) => (current === 'saved' ? 'idle' : current));
      }, 1200);
    } catch {
      setSaveState('error');
    }
  }, [clearPendingTimers, editor, markDirty]);

  const scheduleCommit = useCallback(() => {
    if (commitTimeoutRef.current != null) {
      window.clearTimeout(commitTimeoutRef.current);
    }

    commitTimeoutRef.current = window.setTimeout(() => {
      void flushCommit();
    }, 700);
  }, [flushCommit]);

  useEffect(() => {
    committedMarkdownRef.current = normalizeMarkdown(initialValue);
    latestMarkdownRef.current = normalizeMarkdown(initialValue);
    dirtyRef.current = false;
    setSaveState('idle');
  }, [initialValue, issueId]);

  useEffect(() => {
    return () => {
      clearPendingTimers();
    };
  }, [clearPendingTimers]);

  useEffect(() => {
    const finishPointerSelection = () => {
      if (!pointerSelectingRef.current) return;
      pointerSelectingRef.current = false;
      requestAnimationFrame(() => {
        setAllowBubbleMenu(true);
      });
    };

    window.addEventListener('mouseup', finishPointerSelection);
    window.addEventListener('dragend', finishPointerSelection);

    return () => {
      window.removeEventListener('mouseup', finishPointerSelection);
      window.removeEventListener('dragend', finishPointerSelection);
    };
  }, []);

  const handleEditorMouseDown = useCallback(() => {
    pointerSelectingRef.current = true;
    setAllowBubbleMenu(false);
  }, []);

  const toolbarButtons = useMemo<ToolbarButton[]>(
    () => [
      {
        key: 'bold',
        testId: 'markdown-toolbar-bold',
        icon: Bold,
        isActive: (instance) => instance.isActive('bold'),
        run: (instance) => instance.chain().focus().toggleBold().run(),
      },
      {
        key: 'italic',
        testId: 'markdown-toolbar-italic',
        icon: Italic,
        isActive: (instance) => instance.isActive('italic'),
        run: (instance) => instance.chain().focus().toggleItalic().run(),
      },
      {
        key: 'strike',
        testId: 'markdown-toolbar-strike',
        icon: Strikethrough,
        isActive: (instance) => instance.isActive('strike'),
        run: (instance) => instance.chain().focus().toggleStrike().run(),
      },
      {
        key: 'heading1',
        testId: 'markdown-toolbar-heading-1',
        icon: Heading1,
        isActive: (instance) => instance.isActive('heading', { level: 1 }),
        run: (instance) => instance.chain().focus().toggleHeading({ level: 1 }).run(),
      },
      {
        key: 'heading2',
        testId: 'markdown-toolbar-heading-2',
        icon: Heading2,
        isActive: (instance) => instance.isActive('heading', { level: 2 }),
        run: (instance) => instance.chain().focus().toggleHeading({ level: 2 }).run(),
      },
      {
        key: 'bulletList',
        testId: 'markdown-toolbar-bullet-list',
        icon: List,
        isActive: (instance) => instance.isActive('bulletList'),
        run: (instance) => instance.chain().focus().toggleBulletList().run(),
      },
      {
        key: 'taskList',
        testId: 'markdown-toolbar-task-list',
        icon: ListTodo,
        isActive: (instance) => instance.isActive('taskList'),
        run: (instance) => instance.chain().focus().toggleTaskList().run(),
      },
      {
        key: 'blockquote',
        testId: 'markdown-toolbar-blockquote',
        icon: Quote,
        isActive: (instance) => instance.isActive('blockquote'),
        run: (instance) => instance.chain().focus().toggleBlockquote().run(),
      },
      {
        key: 'codeBlock',
        testId: 'markdown-toolbar-code-block',
        icon: Code2,
        isActive: (instance) => instance.isActive('codeBlock'),
        run: (instance) => instance.chain().focus().toggleCodeBlock().run(),
      },
      {
        key: 'link',
        testId: 'markdown-toolbar-link',
        icon: Link2,
        isActive: (instance) => instance.isActive('link'),
        run: (instance) => {
          const currentHref = instance.getAttributes('link').href as string | undefined;
          const href = window.prompt('Link URL', currentHref ?? 'https://');
          if (href == null) return;
          if (!href.trim()) {
            instance.chain().focus().unsetLink().run();
            return;
          }
          instance.chain().focus().extendMarkRange('link').setLink({ href: href.trim() }).run();
        },
      },
      {
        key: 'horizontalRule',
        testId: 'markdown-toolbar-horizontal-rule',
        icon: SeparatorHorizontal,
        isActive: () => false,
        run: (instance) => instance.chain().focus().setHorizontalRule().run(),
      },
    ],
    [],
  );

  return (
    <div className="relative px-0 py-0">
      {editor ? (
        <BubbleMenu
          editor={editor}
          className="z-[80]"
          style={{ zIndex: 80 }}
          shouldShow={({ editor: instance }: { editor: TiptapEditor }) =>
            allowBubbleMenu && instance.isEditable && instance.view.hasFocus() && !instance.state.selection.empty
          }
          options={{
            placement: 'top',
            offset: { mainAxis: 12 },
          }}
        >
          <div
            data-testid="markdown-editor-toolbar"
            className="relative z-[80] flex items-center gap-1 rounded-[18px] border border-slate-200/90 bg-white px-2 py-1.5 shadow-[0_12px_32px_rgba(15,23,42,0.12)]"
          >
            {toolbarButtons.map((button) => {
              const Icon = button.icon;
              const active = button.isActive(editor);
              return (
                <Button
                  key={button.key}
                  type="button"
                  variant="ghost"
                  size="icon"
                  data-testid={button.testId}
                  onMouseDown={preventToolbarFocusSteal}
                  onClick={() => button.run(editor)}
                  className={cn(
                    'h-8 w-8 rounded-full text-ink-500 transition hover:bg-slate-100 hover:text-ink-900',
                    active && 'bg-slate-100 text-ink-900',
                  )}
                >
                  <Icon className="h-4 w-4 stroke-[1.9]" />
                </Button>
              );
            })}
          </div>
        </BubbleMenu>
      ) : null}

      <div className="relative" onMouseDown={handleEditorMouseDown}>
        <EditorContent editor={editor} />
      </div>

      <div className="mt-2 text-[12px] leading-none text-ink-400" data-testid="markdown-editor-save-state">
        {renderSaveState(saveState)}
      </div>
    </div>
  );
}

function getMarkdown(editor: TiptapEditor) {
  return normalizeMarkdown(
    ((editor.storage as unknown as { markdown: { getMarkdown: () => string } }).markdown.getMarkdown()),
  );
}

function preventToolbarFocusSteal(event: ReactMouseEvent<HTMLButtonElement>) {
  event.preventDefault();
}

function renderSaveState(saveState: SaveState) {
  switch (saveState) {
    case 'dirty':
      return 'Editing...';
    case 'saving':
      return 'Saving...';
    case 'saved':
      return 'Saved';
    case 'error':
      return 'Save failed';
    default:
      return 'Autosave on idle or blur';
  }
}

function normalizeMarkdown(value: string | null | undefined) {
  return (value ?? '').replace(/\r\n/g, '\n').trim();
}
