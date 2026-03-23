'use client';

import { type ReactNode, useEffect } from 'react';
import type { JSONContent } from '@tiptap/core';
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
    return node.nodeName === 'UL' && (
      (node as HTMLElement).dataset.type === 'taskList' ||
      Boolean((node as HTMLElement).querySelector('li[data-type="taskItem"], input[type="checkbox"]'))
    );
  },
  replacement(content, node) {
    const items = Array.from((node as HTMLUListElement).children)
      .filter((child): child is HTMLLIElement => child instanceof HTMLLIElement)
      .map((item) => {
        const checkbox = item.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
        const checked = item.dataset.checked === 'true' || checkbox?.checked === true;
        const text = (item.textContent ?? '').replace(/\s+/g, ' ').trim();
        return `- [${checked ? 'x' : ' '}] ${text}`;
      });

    return `\n${items.join('\n')}\n`;
  },
});

turndown.addRule('strikethrough', {
  filter: ['del', 's', 'strike'],
  replacement(content) {
    return `~~${content}~~`;
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
    content: renderMarkdownToEditorHtml(value),
    editorProps: {
      attributes: {
        'data-testid': 'markdown-editor-content',
        class:
          'min-h-[16rem] cursor-text px-0 py-0 text-[15px] leading-7 text-ink-900 focus:outline-none prose prose-slate max-w-none prose-p:my-3 prose-headings:mb-3 prose-headings:mt-5 prose-ul:my-3 prose-ol:my-3 prose-code:rounded prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:text-[0.92em]',
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
    const nextHtml = renderMarkdownToEditorHtml(value);
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

  const toggleTaskListForSelection = () => {
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, '\n').replace(/\s+/g, ' ').trim();
    const taskContent: JSONContent = {
      type: 'taskList',
      content: [
        {
          type: 'taskItem',
          attrs: { checked: false },
          content: [
            {
              type: 'paragraph',
              content: selectedText ? [{ type: 'text', text: selectedText }] : undefined,
            },
          ],
        },
      ],
    };

    editor.chain().focus().insertContentAt({ from, to }, taskContent).run();
  };

  return (
    <div className="relative">
      <BubbleMenu
        editor={editor}
        tippyOptions={{ duration: 100, placement: 'top', offset: [0, 10] }}
        shouldShow={({ editor: currentEditor }) => currentEditor.isFocused && !currentEditor.state.selection.empty}
      >
        <div data-testid="markdown-editor-toolbar" className="flex flex-wrap items-center gap-1 rounded-2xl border border-border-soft bg-white px-2 py-2 shadow-[0_14px_36px_rgba(15,23,42,0.10)]">
          <ToolbarButton
            testId="markdown-toolbar-bold"
            label="Bold"
            active={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
            icon={<Bold className="h-4 w-4" />}
          />
          <ToolbarButton
            testId="markdown-toolbar-italic"
            label="Italic"
            active={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            icon={<Italic className="h-4 w-4" />}
          />
          <ToolbarButton
            testId="markdown-toolbar-strike"
            label="Strikethrough"
            active={editor.isActive('strike')}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            icon={<Strikethrough className="h-4 w-4" />}
          />
          <div className="mx-1 h-5 w-px bg-border-soft" />
          <ToolbarButton
            testId="markdown-toolbar-heading-1"
            label="Heading 1"
            active={editor.isActive('heading', { level: 1 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            icon={<Heading1 className="h-4 w-4" />}
          />
          <ToolbarButton
            testId="markdown-toolbar-heading-2"
            label="Heading 2"
            active={editor.isActive('heading', { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            icon={<Heading2 className="h-4 w-4" />}
          />
          <ToolbarButton
            testId="markdown-toolbar-bullet-list"
            label="Bullet list"
            active={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            icon={<List className="h-4 w-4" />}
          />
          <ToolbarButton
            testId="markdown-toolbar-task-list"
            label="Task list"
            active={editor.isActive('taskList')}
            onClick={toggleTaskListForSelection}
            icon={<ListTodo className="h-4 w-4" />}
          />
          <ToolbarButton
            testId="markdown-toolbar-blockquote"
            label="Block quote"
            active={editor.isActive('blockquote')}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            icon={<Quote className="h-4 w-4" />}
          />
          <ToolbarButton
            testId="markdown-toolbar-code-block"
            label="Code block"
            active={editor.isActive('codeBlock')}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            icon={<Code2 className="h-4 w-4" />}
          />
          <ToolbarButton
            testId="markdown-toolbar-link"
            label="Link"
            active={editor.isActive('link')}
            onClick={promptForLink}
            icon={<Link2 className="h-4 w-4" />}
          />
          <ToolbarButton
            testId="markdown-toolbar-horizontal-rule"
            label="Horizontal rule"
            active={false}
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            icon={<SeparatorHorizontal className="h-4 w-4" />}
          />
        </div>
      </BubbleMenu>
      <div className="px-0 py-0">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function ToolbarButton({
  testId,
  label,
  active,
  onClick,
  icon,
}: {
  testId: string;
  label: string;
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
}) {
  return (
    <Button
      type="button"
      data-testid={testId}
      aria-label={label}
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={`h-8 w-8 rounded-xl ${active ? 'bg-slate-100 text-ink-900' : 'text-ink-500 hover:bg-slate-50 hover:text-ink-900'}`}
    >
      {icon}
    </Button>
  );
}

function renderMarkdownToEditorHtml(value: string) {
  if (!value.trim()) {
    return '<p></p>';
  }

  return upgradeTaskListHtml(markdownParser.render(value));
}

function upgradeTaskListHtml(html: string) {
  if (typeof window === 'undefined' || !html.includes('task-list-item')) {
    return html;
  }

  const parser = new window.DOMParser();
  const document = parser.parseFromString(html, 'text/html');

  document.querySelectorAll('ul').forEach((list) => {
    const taskItems = Array.from(list.children).filter(
      (child): child is HTMLLIElement =>
        child instanceof HTMLLIElement &&
        (child.classList.contains('task-list-item') || Boolean(child.querySelector('input[type="checkbox"]')))
    );

    if (!taskItems.length) return;

    list.setAttribute('data-type', 'taskList');

    taskItems.forEach((item) => {
      const checkbox = item.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
      const checked = checkbox?.checked === true;
      item.setAttribute('data-type', 'taskItem');
      item.setAttribute('data-checked', checked ? 'true' : 'false');

      const content = document.createElement('div');
      const children = Array.from(item.childNodes).filter((child) => child !== checkbox && child.parentNode === item);
      children.forEach((child) => {
        if (child === checkbox) return;
        if (child.nodeType === Node.TEXT_NODE && !child.textContent?.trim()) return;
        content.appendChild(child);
      });

      if (!content.childNodes.length) {
        const paragraph = document.createElement('p');
        paragraph.textContent = item.textContent?.trim() ?? '';
        content.appendChild(paragraph);
      }

      const label = document.createElement('label');
      label.setAttribute('contenteditable', 'false');
      const input = document.createElement('input');
      input.setAttribute('type', 'checkbox');
      if (checked) {
        input.setAttribute('checked', 'checked');
      }
      const span = document.createElement('span');
      label.append(input, span);

      item.replaceChildren(label, content);
    });
  });

  return document.body.innerHTML;
}
