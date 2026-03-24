import { expect, test } from '@playwright/test';
import {
  bootstrapIssueDetail,
  findProseMirrorNodes,
  getCurrentIssueContentJson,
  getEditor,
  getToolbar,
  measureSoftMetric,
  selectTextInEditor,
  updateCurrentIssueViaApi,
} from './support/app';

test('applies inline and block formatting from the floating toolbar', async ({ page, request }) => {
  await bootstrapIssueDetail(page, request);
  await updateCurrentIssueViaApi(page, request, { description: 'Alpha\n\nbeta\n\ngamma\n\ndelta' });
  await page.reload();

  const toolbar = getToolbar(page);

  await measureSoftMetric('toolbar-open-programmatic-selection', 900, async () => {
    await selectTextInEditor(page, 'Alpha');
    await expect(toolbar).toBeVisible();
  });
  await page.getByTestId('markdown-toolbar-bold').click({ force: true });

  await selectTextInEditor(page, 'beta');
  await expect(toolbar).toBeVisible();
  await page.getByTestId('markdown-toolbar-italic').click({ force: true });

  await selectTextInEditor(page, 'gamma');
  await expect(toolbar).toBeVisible();
  await page.getByTestId('markdown-toolbar-strike').click({ force: true });

  await selectTextInEditor(page, 'delta');
  await expect(toolbar).toBeVisible();
  await page.getByTestId('markdown-toolbar-heading1').click({ force: true });

  const contentJson = await pollIssueContentJson(page, request);
  expect(findProseMirrorNodes(contentJson, (node) => node.type === 'bold' || (node.type === 'text' && Array.isArray(node.marks) && node.marks.some((mark) => (mark as { type?: string }).type === 'bold') && node.text === 'Alpha'))).not.toHaveLength(0);
  expect(findProseMirrorNodes(contentJson, (node) => node.type === 'text' && Array.isArray(node.marks) && node.marks.some((mark) => (mark as { type?: string }).type === 'italic') && node.text === 'beta')).toHaveLength(1);
  expect(findProseMirrorNodes(contentJson, (node) => node.type === 'text' && Array.isArray(node.marks) && node.marks.some((mark) => (mark as { type?: string }).type === 'strike') && node.text === 'gamma')).toHaveLength(1);
  expect(findProseMirrorNodes(contentJson, (node) => node.type === 'heading' && (node.attrs as { level?: number } | undefined)?.level === 1 && getNodeText(node) === 'delta')).toHaveLength(1);
});

test('creates, updates, and removes links through the link popover without losing selection', async ({ page, request }) => {
  await bootstrapIssueDetail(page, request);
  await updateCurrentIssueViaApi(page, request, { description: 'Link target text' });
  await page.reload();

  await measureSoftMetric('link-popover-open', 1000, async () => {
    await selectTextInEditor(page, 'Link target');
    await expect(getToolbar(page)).toBeVisible();
    await page.getByTestId('markdown-toolbar-link').click({ force: true });
    await expect(page.getByTestId('markdown-link-input')).toBeVisible();
  });

  await page.getByTestId('markdown-link-input').fill('example.com/docs');
  await page.getByTestId('markdown-link-apply').click();
  let contentJson = await pollIssueContentJson(page, request, (content) => findLinkNodes(content, 'https://example.com/docs').length > 0);
  expect(findLinkNodes(contentJson, 'https://example.com/docs')).not.toHaveLength(0);

  await page.reload();
  await expect(page.locator('a[href="https://example.com/docs"]').first()).toContainText('Link target');

  await selectTextInEditor(page, 'Link target');
  await page.getByTestId('markdown-toolbar-link').click({ force: true });
  await expect(page.getByTestId('markdown-link-input')).toHaveValue('https://example.com/docs');
  await page.getByTestId('markdown-link-input').fill('https://example.com/updated');
  await page.getByTestId('markdown-link-apply').click();
  contentJson = await pollIssueContentJson(
    page,
    request,
    (content) =>
      findLinkNodes(content, 'https://example.com/updated').length > 0 &&
      findLinkNodes(content, 'https://example.com/docs').length === 0,
  );
  expect(findLinkNodes(contentJson, 'https://example.com/updated')).not.toHaveLength(0);
  await page.reload();
  await expect(page.locator('a[href="https://example.com/updated"]').first()).toContainText('Link target');

  await selectTextInEditor(page, 'Link target');
  await page.getByTestId('markdown-toolbar-link').click({ force: true });
  await page.getByTestId('markdown-link-remove').click();
  contentJson = await pollIssueContentJson(page, request, (content) => findLinkNodes(content, 'https://example.com/updated').length === 0);
  expect(findLinkNodes(contentJson, 'https://example.com/updated')).toHaveLength(0);
  await page.reload();
  await expect(page.locator('a[href="https://example.com/updated"]')).toHaveCount(0);
});

test('applies heading2, bullet list, task list, quote, code block, and divider from the toolbar', async ({ page, request }) => {
  await bootstrapIssueDetail(page, request);
  await updateCurrentIssueViaApi(page, request, {
    description: 'Heading two target\n\nBullet target\n\nTask target\n\nQuote target\n\nCode target\n\nDivider target',
  });
  await page.reload();

  await selectTextInEditor(page, 'Heading two target');
  await page.getByTestId('markdown-toolbar-heading2').click({ force: true });

  await selectTextInEditor(page, 'Bullet target');
  await page.getByTestId('markdown-toolbar-bulletList').click({ force: true });

  await selectTextInEditor(page, 'Task target');
  await page.getByTestId('markdown-toolbar-taskList').click({ force: true });

  await selectTextInEditor(page, 'Quote target');
  await page.getByTestId('markdown-toolbar-blockquote').click({ force: true });

  await selectTextInEditor(page, 'Code target');
  await page.getByTestId('markdown-toolbar-codeBlock').click({ force: true });

  await selectTextInEditor(page, 'Divider target');
  await page.getByTestId('markdown-toolbar-divider').click({ force: true });

  const contentJson = await pollIssueContentJson(page, request);
  expect(findProseMirrorNodes(contentJson, (node) => node.type === 'heading' && (node.attrs as { level?: number } | undefined)?.level === 2 && getNodeText(node) === 'Heading two target')).toHaveLength(1);
  expect(findProseMirrorNodes(contentJson, (node) => node.type === 'bulletList')).toHaveLength(1);
  expect(findProseMirrorNodes(contentJson, (node) => node.type === 'taskList')).toHaveLength(1);
  expect(findProseMirrorNodes(contentJson, (node) => node.type === 'blockquote' && getNodeText(node).includes('Quote target'))).toHaveLength(1);
  expect(findProseMirrorNodes(contentJson, (node) => node.type === 'codeBlock' && getNodeText(node).includes('Code target'))).toHaveLength(1);
  expect(findProseMirrorNodes(contentJson, (node) => node.type === 'horizontalRule')).not.toHaveLength(0);
  await expect(page.locator('hr').first()).toBeVisible();
});

async function pollIssueContentJson(
  page: Parameters<typeof getToolbar>[0],
  request: Parameters<typeof getCurrentIssueContentJson>[1],
  predicate?: (content: Record<string, unknown>) => boolean,
) {
  await expect
    .poll(async () => {
      const content = await getCurrentIssueContentJson(page, request);
      if (!content) return null;
      return predicate ? (predicate(content as Record<string, unknown>) ? content : null) : content;
    }, { timeout: 8_000 })
    .not.toBeNull();
  return (await getCurrentIssueContentJson(page, request)) as Record<string, unknown>;
}

function getNodeText(node: Record<string, unknown>): string {
  const text = typeof node.text === 'string' ? node.text : '';
  const content = Array.isArray(node.content)
    ? node.content.map((child) => (child && typeof child === 'object' ? getNodeText(child as Record<string, unknown>) : '')).join('')
    : '';
  return `${text}${content}`;
}

function findLinkNodes(contentJson: Record<string, unknown>, href?: string) {
  return findProseMirrorNodes(
    contentJson,
    (node) =>
      node.type === 'text' &&
      Array.isArray(node.marks) &&
      node.marks.some((mark) => {
        const typedMark = mark as { type?: string; attrs?: { href?: string } };
        return typedMark.type === 'link' && (href == null || typedMark.attrs?.href === href);
      }),
  );
}
