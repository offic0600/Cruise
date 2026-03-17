'use client';

import { useEffect } from 'react';
import Link from '@tiptap/extension-link';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import StarterKit from '@tiptap/starter-kit';
import { EditorContent, useEditor } from '@tiptap/react';
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
}

export default function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
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
          'min-h-[320px] rounded-b-panel border-x border-b border-border-subtle bg-white px-6 py-5 text-[15px] leading-7 text-ink-900 focus:outline-none prose prose-slate max-w-none',
      },
    },
    onUpdate({ editor: currentEditor }) {
      onChange(turndown.turndown(currentEditor.getHTML()).trim());
    },
  });

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
    <div className="overflow-hidden rounded-panel bg-surface-raised shadow-card">
      <div className="flex flex-wrap gap-2 border border-border-subtle border-b-0 bg-surface-soft px-4 py-3">
        <ToolbarButton active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} icon={<Bold className="h-4 w-4" />} />
        <ToolbarButton active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} icon={<Italic className="h-4 w-4" />} />
        <ToolbarButton active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} icon={<Strikethrough className="h-4 w-4" />} />
        <ToolbarButton active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} icon={<Heading1 className="h-4 w-4" />} />
        <ToolbarButton active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} icon={<Heading2 className="h-4 w-4" />} />
        <ToolbarButton active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} icon={<List className="h-4 w-4" />} />
        <ToolbarButton active={editor.isActive('taskList')} onClick={() => editor.chain().focus().toggleTaskList().run()} icon={<ListTodo className="h-4 w-4" />} />
        <ToolbarButton active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} icon={<Quote className="h-4 w-4" />} />
        <ToolbarButton active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()} icon={<Code2 className="h-4 w-4" />} />
        <ToolbarButton active={editor.isActive('link')} onClick={promptForLink} icon={<Link2 className="h-4 w-4" />} />
        <ToolbarButton active={false} onClick={() => editor.chain().focus().setHorizontalRule().run()} icon={<SeparatorHorizontal className="h-4 w-4" />} />
      </div>
      <EditorContent editor={editor} />
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
  icon: React.ReactNode;
}) {
  return (
    <Button type="button" variant={active ? 'default' : 'secondary'} size="icon" onClick={onClick} className="h-9 w-9">
      {icon}
    </Button>
  );
}
