import { expect, test } from '@playwright/test';
import {
  bootstrapIssueDetail,
  findProseMirrorNodes,
  getCurrentIssueContentJson,
  updateCurrentIssueViaApi,
  waitForAutosave,
  getEditor,
} from './support/app';

const formattedMarkdown = [
  '**Bold target**',
  '_Italic target_',
  '~~Strike target~~',
  '# Heading one target',
  '## Heading two target',
  '- Bullet item target',
  '1. Ordered item target',
  '- [ ] Task item target',
  '> Quote target',
  '```',
  'Code block target',
  '```',
  '[Link target](https://example.com/docs)',
  '',
  '* * *',
].join('\n\n');

const formattedContentJson = {
  type: 'doc',
  content: [
    paragraphWithMarkedText('Bold target', 'bold'),
    paragraphWithMarkedText('Italic target', 'italic'),
    paragraphWithMarkedText('Strike target', 'strike'),
    headingNode(1, 'Heading one target'),
    headingNode(2, 'Heading two target'),
    bulletListNode(['Bullet item target']),
    orderedListNode(['Ordered item target']),
    taskListNode([{ text: 'Task item target', checked: false }]),
    blockquoteNode('Quote target'),
    codeBlockNode('Code block target'),
    paragraphNode([{ type: 'text', text: 'Link target', marks: [{ type: 'link', attrs: { href: 'https://example.com/docs' } }] }]),
    { type: 'horizontalRule' },
  ],
};

test('renders persisted markdown and keeps round-trip structure after editing', async ({ page, request }) => {
  await bootstrapIssueDetail(page, request);

  await updateCurrentIssueViaApi(page, request, {
    contentJson: formattedContentJson,
    expectedRevision: 0,
    descriptionExport: formattedMarkdown,
  });
  await page.reload();

  const contentJson = await pollIssueContentJson(page, request);
  expect(findProseMirrorNodes(contentJson, (node) => node.type === 'text' && Array.isArray(node.marks) && node.marks.some((mark) => (mark as { type?: string }).type === 'bold') && node.text === 'Bold target')).toHaveLength(1);
  expect(findProseMirrorNodes(contentJson, (node) => node.type === 'text' && Array.isArray(node.marks) && node.marks.some((mark) => (mark as { type?: string }).type === 'italic') && node.text === 'Italic target')).toHaveLength(1);
  expect(findProseMirrorNodes(contentJson, (node) => node.type === 'text' && Array.isArray(node.marks) && node.marks.some((mark) => (mark as { type?: string }).type === 'strike') && node.text === 'Strike target')).toHaveLength(1);
  expect(findProseMirrorNodes(contentJson, (node) => node.type === 'heading' && (node.attrs as { level?: number } | undefined)?.level === 1 && getNodeText(node) === 'Heading one target')).toHaveLength(1);
  expect(findProseMirrorNodes(contentJson, (node) => node.type === 'heading' && (node.attrs as { level?: number } | undefined)?.level === 2 && getNodeText(node) === 'Heading two target')).toHaveLength(1);
  expect(findProseMirrorNodes(contentJson, (node) => node.type === 'bulletList')).toHaveLength(1);
  expect(findProseMirrorNodes(contentJson, (node) => node.type === 'orderedList')).toHaveLength(1);
  expect(findProseMirrorNodes(contentJson, (node) => node.type === 'taskList')).toHaveLength(1);
  expect(findProseMirrorNodes(contentJson, (node) => node.type === 'blockquote' && getNodeText(node).includes('Quote target'))).toHaveLength(1);
  expect(findProseMirrorNodes(contentJson, (node) => node.type === 'codeBlock' && getNodeText(node).includes('Code block target'))).toHaveLength(1);
  expect(findProseMirrorNodes(contentJson, (node) => node.type === 'text' && Array.isArray(node.marks) && node.marks.some((mark) => {
    const typedMark = mark as { type?: string; attrs?: { href?: string } };
    return typedMark.type === 'link' && typedMark.attrs?.href === 'https://example.com/docs';
  }) && node.text === 'Link target')).toHaveLength(1);
  expect(findProseMirrorNodes(contentJson, (node) => node.type === 'horizontalRule')).toHaveLength(1);

  await expect(page.getByText('Bold target').first()).toBeVisible();
  await expect(page.getByText('Italic target').first()).toBeVisible();
  await expect(page.getByText('Strike target').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Heading one target', level: 1 }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Heading two target', level: 2 }).first()).toBeVisible();
  await expect(page.locator('li').filter({ hasText: 'Bullet item target' }).first()).toBeVisible();
  await expect(page.locator('li').filter({ hasText: 'Ordered item target' }).first()).toBeVisible();
  await expect(page.locator('li').filter({ hasText: 'Task item target' }).first()).toBeVisible();
  await expect(page.locator('blockquote').filter({ hasText: 'Quote target' }).first()).toBeVisible();
  await expect(page.locator('pre code').first()).toContainText('Code block target');
  await expect(page.locator('a[href="https://example.com/docs"]').first()).toContainText('Link target');
  await expect(page.locator('hr').first()).toBeVisible();

  const editor = getEditor(page);
  await editor.click();
  await page.keyboard.press('End');
  await page.keyboard.type('\n\nRound trip tail');
  await waitForAutosave(page, request, 'Round trip tail');
  await page.reload();

  const roundTripped = await pollIssueContentJson(page, request);
  expect(getNodeText(roundTripped)).toContain('Round trip tail');
  await expect(page.getByText('Round trip tail').first()).toBeVisible();
});

test('renders empty, long, and mixed multi-block content without losing structure', async ({ page, request }) => {
  await bootstrapIssueDetail(page, request);

  await updateCurrentIssueViaApi(page, request, { description: '' });
  await page.reload();
  await expect(getEditor(page)).toBeVisible();

  const longMarkdown = [
    '# Long document',
    '',
    ...Array.from({ length: 24 }, (_, index) => `Paragraph line ${index + 1} with **formatting** and [link ${index + 1}](https://example.com/${index + 1}).`),
    '',
    '- List item A',
    '- List item B',
    '',
    '> Mixed quote',
    '',
    '```',
    'const multi = true;',
    '```',
  ].join('\n');

  await updateCurrentIssueViaApi(page, request, { description: longMarkdown });
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Long document', level: 1 })).toBeVisible();
  await expect(page.getByText('Paragraph line 24 with').first()).toBeVisible();
  await expect(page.locator('blockquote').filter({ hasText: 'Mixed quote' }).first()).toBeVisible();
  await expect(page.locator('pre code').first()).toContainText('const multi = true;');
});

async function pollIssueContentJson(page: Parameters<typeof getEditor>[0], request: Parameters<typeof getCurrentIssueContentJson>[1]) {
  await expect.poll(async () => await getCurrentIssueContentJson(page, request), { timeout: 8_000 }).not.toBeNull();
  return (await getCurrentIssueContentJson(page, request)) as Record<string, unknown>;
}

function getNodeText(node: Record<string, unknown>): string {
  const text = typeof node.text === 'string' ? node.text : '';
  const content = Array.isArray(node.content)
    ? node.content.map((child) => (child && typeof child === 'object' ? getNodeText(child as Record<string, unknown>) : '')).join('')
    : '';
  return `${text}${content}`;
}

function paragraphNode(content: Array<Record<string, unknown>>) {
  return { type: 'paragraph', content };
}

function paragraphWithMarkedText(text: string, markType: string) {
  return paragraphNode([{ type: 'text', text, marks: [{ type: markType }] }]);
}

function headingNode(level: number, text: string) {
  return { type: 'heading', attrs: { level }, content: [{ type: 'text', text }] };
}

function bulletListNode(items: string[]) {
  return {
    type: 'bulletList',
    content: items.map((item) => ({
      type: 'listItem',
      content: [paragraphNode([{ type: 'text', text: item }])],
    })),
  };
}

function orderedListNode(items: string[]) {
  return {
    type: 'orderedList',
    attrs: { start: 1 },
    content: items.map((item) => ({
      type: 'listItem',
      content: [paragraphNode([{ type: 'text', text: item }])],
    })),
  };
}

function taskListNode(items: Array<{ text: string; checked: boolean }>) {
  return {
    type: 'taskList',
    content: items.map((item) => ({
      type: 'taskItem',
      attrs: { checked: item.checked },
      content: [paragraphNode([{ type: 'text', text: item.text }])],
    })),
  };
}

function blockquoteNode(text: string) {
  return {
    type: 'blockquote',
    content: [paragraphNode([{ type: 'text', text }])],
  };
}

function codeBlockNode(text: string) {
  return {
    type: 'codeBlock',
    content: [{ type: 'text', text }],
  };
}
