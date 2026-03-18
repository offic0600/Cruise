'use client';

import { type ReactNode, useEffect } from 'react';
import Link from '@tiptap/extension-link';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import StarterKit from '@tiptap/starter-kit';
import { BubbleMenu, EditorContent, useEditor } from '@tiptap/react';
import MarkdownIt from 'markdown-it';
import markdownItTaskLists from 'markdown-it-task-lists';
import TurndownService from 'turndown';
import { Bold, Code2, Heading1, Heading2, Italic, Link2, List, ListTodo, Quote, SeparatorHorizontal, Strikethrough } from 'lucide-react';
import { Button } from '@/components/ui/button';

const markdownParser = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
}).use(markdownItTaskLists, { enabled: true, label: true });

const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-' });

turndown.addRule('taskListItems', {
  filter(node) {
    return node.nodeName === 'LI' && (node as HTMLElement).dataset.checked != null;
  },
  replacement(content, node) {
    const checked = (node as HTMLElement).dataset.checked === 'true';
    return `\n- [${checked ? 'x' : ' '}] ${content.trim()}`;
  },
});

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  mode?: 'read' | 'edit';
  onEnterEdit?: () => void;
  onCancelEdit?: () => void;
}

export default function MarkdownEditor({
  value,
  onChange,
  mode = 'read',
  onEnterEdit,
}: MarkdownEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Link.configure({ openOnClick: false, autolink: true }),
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: value ? markdownParser.render(value) : '<p></p>',
    editorProps: {
      attributes: {
        class:
          'min-h-[2lh] cursor-text px-0 py-0 text-[15px] leading-7 text-ink-900 focus:outline-none prose prose-slate max-w-none prose-p:my-3 prose-headings:mb-3 prose-headings:mt-5 prose-ul:my-3 prose-ol:my-3 prose-code:rounded prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:text-[0.92em]',
      },
    },
    onFocus() {
      onEnterEdit?.();
    },
    onUpdate({ editor: currentEditor }) {
      onChange(turndown.turndown(currentEditor.getHTML()).trim());
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(true);
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    const nextHtml = value ? markdownParser.render(value) : '<p></p>';
    if (turndown.turndown(editor.getHTML()).trim() !== value.trim()) {
      editor.commands.setContent(nextHtml, false);
    }
  }, [editor, value]);

  if (!editor) return null;

  const promptForLink = () => {
    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link URL', previousUrl ?? 'https://');
    if (url == null) return;
    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="relative">
      <BubbleMenu
        editor={editor}
        tippyOptions={{ duration: 100, placement: 'top', offset: [0, 10] }}
        shouldShow={({ editor: currentEditor }) => currentEditor.isFocused && !currentEditor.state.selection.empty}
      >
        <div className="flex flex-wrap items-center gap-1 rounded-2xl border border-border-soft bg-white px-2 py-2 shadow-[0_14px_36px_rgba(15,23,42,0.10)]">
          <ToolbarButton active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} icon={<Bold className="h-4 w-4" />} />
          <ToolbarButton active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} icon={<Italic className="h-4 w-4" />} />
          <ToolbarButton active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} icon={<Strikethrough className="h-4 w-4" />} />
          <div className="mx-1 h-5 w-px bg-border-soft" />
          <ToolbarButton active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} icon={<Heading1 className="h-4 w-4" />} />
          <ToolbarButton active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} icon={<Heading2 className="h-4 w-4" />} />
          <ToolbarButton active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} icon={<List className="h-4 w-4" />} />
          <ToolbarButton active={editor.isActive('taskList')} onClick={() => editor.chain().focus().toggleTaskList().run()} icon={<ListTodo className="h-4 w-4" />} />
          <ToolbarButton active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} icon={<Quote className="h-4 w-4" />} />
          <ToolbarButton active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()} icon={<Code2 className="h-4 w-4" />} />
          <ToolbarButton active={editor.isActive('link')} onClick={promptForLink} icon={<Link2 className="h-4 w-4" />} />
          <ToolbarButton active={false} onClick={() => editor.chain().focus().setHorizontalRule().run()} icon={<SeparatorHorizontal className="h-4 w-4" />} />
        </div>
      </BubbleMenu>
      <div className="px-0 py-0">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function ToolbarButton({
  active,
  onClick,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={`h-8 w-8 rounded-xl ${active ? 'bg-slate-100 text-ink-900' : 'text-ink-500 hover:bg-slate-50 hover:text-ink-900'}`}
    >
      {icon}
    </Button>
  );
}
