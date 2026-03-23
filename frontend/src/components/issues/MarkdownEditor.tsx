'use client';

import { type CSSProperties, type MouseEvent, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Editor, defaultValueCtx, editorViewCtx, remarkStringifyOptionsCtx, rootCtx } from '@milkdown/kit/core';
import { commonmark, createCodeBlockCommand, insertHrCommand, toggleEmphasisCommand, toggleLinkCommand, toggleStrongCommand, wrapInBlockquoteCommand, wrapInBulletListCommand, wrapInHeadingCommand } from '@milkdown/kit/preset/commonmark';
import { gfm, toggleStrikethroughCommand } from '@milkdown/kit/preset/gfm';
import { TextSelection } from '@milkdown/kit/prose/state';
import { listener, listenerCtx } from '@milkdown/kit/plugin/listener';
import { callCommand, replaceRange } from '@milkdown/kit/utils';
import { Milkdown, MilkdownProvider, useEditor, useInstance } from '@milkdown/react';
import { Bold, Code2, Heading1, Heading2, Italic, Link2, List, ListTodo, Quote, SeparatorHorizontal, Strikethrough } from 'lucide-react';
import { Button } from '@/components/ui/button';

const editorContentClassName =
  'min-h-[16rem] cursor-text px-0 py-0 text-[15px] leading-7 text-ink-900 focus:outline-none prose prose-slate max-w-none prose-p:my-3 prose-headings:mb-3 prose-headings:mt-5 prose-ul:my-3 prose-ol:my-3 prose-code:rounded prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:text-[0.92em]';

type ToolbarState = {
  visible: boolean;
  position: CSSProperties;
  active: {
    bold: boolean;
    italic: boolean;
    strike: boolean;
    heading1: boolean;
    heading2: boolean;
    bulletList: boolean;
    taskList: boolean;
    blockquote: boolean;
    codeBlock: boolean;
    link: boolean;
  };
};

const defaultToolbarState: ToolbarState = {
  visible: false,
  position: {},
  active: {
    bold: false,
    italic: false,
    strike: false,
    heading1: false,
    heading2: false,
    bulletList: false,
    taskList: false,
    blockquote: false,
    codeBlock: false,
    link: false,
  },
};

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  mode?: 'read' | 'edit';
  onEnterEdit?: () => void;
  onCancelEdit?: () => void;
}

export default function MarkdownEditor(props: MarkdownEditorProps) {
  return (
    <MilkdownProvider>
      <MarkdownEditorInner {...props} />
    </MilkdownProvider>
  );
}

function MarkdownEditorInner({ value, onChange, onEnterEdit }: MarkdownEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const lastSelectionRef = useRef<{ from: number; to: number } | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastToolbarSignatureRef = useRef<string>('');
  const isPointerSelectingRef = useRef(false);
  const latestValueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const [toolbarState, setToolbarState] = useState<ToolbarState>(defaultToolbarState);
  const [loading, getEditor] = useInstance();

  onChangeRef.current = onChange;

  const updateToolbarState = useMemo(
    () => (ctx: any) => {
      if (frameRef.current != null) {
        window.cancelAnimationFrame(frameRef.current);
      }

      frameRef.current = window.requestAnimationFrame(() => {
        const view = ctx.get(editorViewCtx);
        if (!view?.state?.selection || !containerRef.current) {
          lastToolbarSignatureRef.current = '';
          setToolbarState((current) => (current.visible ? defaultToolbarState : current));
          return;
        }

        const { selection, schema } = view.state;
        if (selection.empty || isPointerSelectingRef.current) {
          lastToolbarSignatureRef.current = '';
          setToolbarState((current) => (current.visible ? defaultToolbarState : current));
          return;
        }

        const { from, to, $from } = selection;
        lastSelectionRef.current = { from, to };
        const wrapperRect = containerRef.current.getBoundingClientRect();
        const start = view.coordsAtPos(from);
        const end = view.coordsAtPos(to);
        const toolbarWidth = 360;
        const toolbarHeight = 52;
        const preferredLeft = (start.left + end.right) / 2;
        const minLeft = wrapperRect.left + toolbarWidth / 2;
        const maxLeft = wrapperRect.right - toolbarWidth / 2;
        const left = Math.min(Math.max(preferredLeft, minLeft), Math.max(maxLeft, minLeft));
        const aboveTop = Math.min(start.top, end.top) - toolbarHeight - 12;
        const belowTop = Math.max(start.bottom, end.bottom) + 12;
        const top = aboveTop >= wrapperRect.top + 8 ? aboveTop : belowTop;

        const ancestorNames = Array.from({ length: $from.depth + 1 }, (_, index) => $from.node(index).type.name);
        const bold = hasMark(schema.marks.strong, view.state, from, to);
        const italic = hasMark(schema.marks.emphasis, view.state, from, to);
        const strike = hasMark(schema.marks.strike_through, view.state, from, to);
        const link = hasMark(schema.marks.link, view.state, from, to);
        const headingLevel = ancestorNames.includes('heading') ? Number($from.parent.attrs.level ?? 0) : 0;
        const listItemNode = findAncestorNode($from, 'list_item');
        const taskList = listItemNode?.attrs.checked != null;

        const nextState: ToolbarState = {
          visible: true,
          position: {
            left,
            top,
            transform: 'translateX(-50%)',
          },
          active: {
            bold,
            italic,
            strike,
            heading1: headingLevel === 1,
            heading2: headingLevel === 2,
            bulletList: ancestorNames.includes('bullet_list') && !taskList,
            taskList,
            blockquote: ancestorNames.includes('blockquote'),
            codeBlock: ancestorNames.includes('code_block'),
            link,
          },
        };

        const signature = JSON.stringify(nextState);
        if (signature === lastToolbarSignatureRef.current) return;
        lastToolbarSignatureRef.current = signature;
        setToolbarState(nextState);
      });
    },
    [],
  );

  useEffect(() => {
    const handlePointerUp = () => {
      if (!isPointerSelectingRef.current) return;
      isPointerSelectingRef.current = false;
      const editor = getEditor();
      if (!editor) return;
      editor.action((ctx) => {
        updateToolbarState(ctx);
      });
    };

    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('dragend', handlePointerUp);

    return () => {
      if (frameRef.current != null) {
        window.cancelAnimationFrame(frameRef.current);
      }
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('dragend', handlePointerUp);
    };
  }, [getEditor, updateToolbarState]);

  useEditor(
    (root) => {
      return Editor.make()
        .config((ctx) => {
          ctx.set(rootCtx, root);
          ctx.set(defaultValueCtx, value || '');
          ctx.update(remarkStringifyOptionsCtx, (prev) => ({
            ...prev,
            bullet: '-' as const,
            bulletOther: '*' as const,
            emphasis: '_' as const,
            strong: '*' as const,
            rule: '*' as const,
            ruleSpaces: true,
          }));

          ctx.get(listenerCtx)
            .mounted((currentCtx) => {
              const view = currentCtx.get(editorViewCtx);
              view.dom.setAttribute('class', editorContentClassName);
              view.dom.setAttribute('data-testid', 'markdown-editor-editable');
              view.dom.setAttribute('tabindex', '0');
              view.dom.addEventListener('mousedown', () => {
                isPointerSelectingRef.current = true;
                setToolbarState((current) => (current.visible ? defaultToolbarState : current));
                window.requestAnimationFrame(() => view.focus());
              });
              shellRef.current?.setAttribute('data-testid', 'markdown-editor-content');
              updateToolbarState(currentCtx);
            })
            .markdownUpdated((currentCtx, markdown) => {
              const normalizedMarkdown = normalizeMarkdown(markdown);
              latestValueRef.current = normalizedMarkdown;
              onChangeRef.current(normalizedMarkdown);
              updateToolbarState(currentCtx);
            })
            .selectionUpdated((currentCtx) => {
              updateToolbarState(currentCtx);
            })
            .focus((currentCtx) => {
              onEnterEdit?.();
              updateToolbarState(currentCtx);
            })
            .blur(() => {
              setToolbarState(defaultToolbarState);
            });
        })
        .use(listener)
        .use(commonmark)
        .use(gfm);
    },
    [onEnterEdit, updateToolbarState],
  );

  useEffect(() => {
    latestValueRef.current = value;
  }, [value]);

  const restoreSelection = (ctx: any) => {
    const view = ctx.get(editorViewCtx);
    const range = lastSelectionRef.current;
    if (!range || !view.state.selection.empty) return;
    const selection = TextSelection.create(view.state.doc, range.from, range.to);
    view.dispatch(view.state.tr.setSelection(selection));
  };

  const runCommand = (command: (ctx: any) => void) => {
    const editor = getEditor();
    if (!editor) return;
    editor.action((ctx) => {
      restoreSelection(ctx);
      command(ctx);
      updateToolbarState(ctx);
    });
  };

  const promptForLink = () => {
    const editor = getEditor();
    if (!editor) return;

    editor.action((ctx) => {
      restoreSelection(ctx);
      const previousUrl = getSelectedLinkHref(ctx);
      const url = window.prompt('Link URL', previousUrl ?? 'https://');
      if (url == null) return;
      if (url === '') {
        callCommand(toggleLinkCommand.key, { href: '' })(ctx);
        updateToolbarState(ctx);
        return;
      }

      callCommand(toggleLinkCommand.key, { href: url })(ctx);
      updateToolbarState(ctx);
    });
  };

  const toggleTaskList = () => {
    const editor = getEditor();
    if (!editor) return;

    editor.action((ctx) => {
      restoreSelection(ctx);
      const view = ctx.get(editorViewCtx);
      const { from, to } = view.state.selection;
      const selectedText = view.state.doc.textBetween(from, to, '\n').replace(/\s+/g, ' ').trim();
      replaceRange(`- [ ] ${selectedText || 'Task item'}`, { from, to })(ctx);
      updateToolbarState(ctx);
    });
  };

  const toolbarVisible = toolbarState.visible && !loading;

  const focusEditor = () => {
    const editor = getEditor();
    if (!editor) return;
    editor.action((ctx) => {
      ctx.get(editorViewCtx).focus();
    });
  };

  return (
    <div ref={containerRef} className="relative">
      {toolbarVisible ? (
        <div
          data-testid="markdown-editor-toolbar"
          style={toolbarState.position}
          className="fixed z-30 flex flex-wrap items-center gap-1 rounded-2xl border border-border-soft bg-white px-2 py-2 shadow-[0_14px_36px_rgba(15,23,42,0.10)]"
        >
          <ToolbarButton
            testId="markdown-toolbar-bold"
            label="Bold"
            active={toolbarState.active.bold}
            onClick={() => runCommand((ctx) => callCommand(toggleStrongCommand.key)(ctx))}
            icon={<Bold className="h-4 w-4" />}
          />
          <ToolbarButton
            testId="markdown-toolbar-italic"
            label="Italic"
            active={toolbarState.active.italic}
            onClick={() => runCommand((ctx) => callCommand(toggleEmphasisCommand.key)(ctx))}
            icon={<Italic className="h-4 w-4" />}
          />
          <ToolbarButton
            testId="markdown-toolbar-strike"
            label="Strikethrough"
            active={toolbarState.active.strike}
            onClick={() => runCommand((ctx) => callCommand(toggleStrikethroughCommand.key)(ctx))}
            icon={<Strikethrough className="h-4 w-4" />}
          />
          <div className="mx-1 h-5 w-px bg-border-soft" />
          <ToolbarButton
            testId="markdown-toolbar-heading-1"
            label="Heading 1"
            active={toolbarState.active.heading1}
            onClick={() => runCommand((ctx) => callCommand(wrapInHeadingCommand.key, 1)(ctx))}
            icon={<Heading1 className="h-4 w-4" />}
          />
          <ToolbarButton
            testId="markdown-toolbar-heading-2"
            label="Heading 2"
            active={toolbarState.active.heading2}
            onClick={() => runCommand((ctx) => callCommand(wrapInHeadingCommand.key, 2)(ctx))}
            icon={<Heading2 className="h-4 w-4" />}
          />
          <ToolbarButton
            testId="markdown-toolbar-bullet-list"
            label="Bullet list"
            active={toolbarState.active.bulletList}
            onClick={() => runCommand((ctx) => callCommand(wrapInBulletListCommand.key)(ctx))}
            icon={<List className="h-4 w-4" />}
          />
          <ToolbarButton
            testId="markdown-toolbar-task-list"
            label="Task list"
            active={toolbarState.active.taskList}
            onClick={toggleTaskList}
            icon={<ListTodo className="h-4 w-4" />}
          />
          <ToolbarButton
            testId="markdown-toolbar-blockquote"
            label="Block quote"
            active={toolbarState.active.blockquote}
            onClick={() => runCommand((ctx) => callCommand(wrapInBlockquoteCommand.key)(ctx))}
            icon={<Quote className="h-4 w-4" />}
          />
          <ToolbarButton
            testId="markdown-toolbar-code-block"
            label="Code block"
            active={toolbarState.active.codeBlock}
            onClick={() => runCommand((ctx) => callCommand(createCodeBlockCommand.key)(ctx))}
            icon={<Code2 className="h-4 w-4" />}
          />
          <ToolbarButton
            testId="markdown-toolbar-link"
            label="Link"
            active={toolbarState.active.link}
            onClick={promptForLink}
            icon={<Link2 className="h-4 w-4" />}
          />
          <ToolbarButton
            testId="markdown-toolbar-horizontal-rule"
            label="Horizontal rule"
            active={false}
            onClick={() => runCommand((ctx) => callCommand(insertHrCommand.key)(ctx))}
            icon={<SeparatorHorizontal className="h-4 w-4" />}
          />
        </div>
      ) : null}
      <div
        ref={shellRef}
        data-markdown-editor-shell
        className="px-0 py-0"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            event.preventDefault();
            focusEditor();
          }
        }}
      >
        <Milkdown />
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
  const handleMouseDown = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <Button
      type="button"
      data-testid={testId}
      aria-label={label}
      variant="ghost"
      size="icon"
      onMouseDown={handleMouseDown}
      onClick={onClick}
      className={`h-8 w-8 rounded-xl ${active ? 'bg-slate-100 text-ink-900' : 'text-ink-500 hover:bg-slate-50 hover:text-ink-900'}`}
    >
      {icon}
    </Button>
  );
}

function hasMark(markType: { isInSet: (marks: readonly unknown[]) => unknown } | undefined, state: { doc: { rangeHasMark: (from: number, to: number, mark: unknown) => boolean } }, from: number, to: number) {
  if (!markType) return false;
  return state.doc.rangeHasMark(from, to, markType);
}

function findAncestorNode($from: { depth: number; node: (depth: number) => { type: { name: string }; attrs: Record<string, unknown> } }, typeName: string) {
  for (let depth = $from.depth; depth >= 0; depth -= 1) {
    const node = $from.node(depth);
    if (node.type.name === typeName) return node;
  }

  return null;
}

function getSelectedLinkHref(ctx: any) {
  const view = ctx.get(editorViewCtx);
  const { from, to } = view.state.selection;
  let href: string | undefined;

  view.state.doc.nodesBetween(from, to, (node: { marks: ReadonlyArray<{ type: { name: string }; attrs: { href?: string } }> }) => {
    const linkMark = node.marks.find((mark: { type: { name: string }; attrs: { href?: string } }) => mark.type.name === 'link');
    if (linkMark?.attrs.href) {
      href = linkMark.attrs.href;
    }
  });

  return href;
}

function normalizeMarkdown(value: string) {
  return value.replace(/\r\n/g, '\n').trim();
}
