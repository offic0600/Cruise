import { expect, test } from '@playwright/test';
import {
  bootstrapIssueDetail,
  clearEditor,
  findProseMirrorNodes,
  getCurrentIssueContentJson,
  getEditor,
  measureSoftMetric,
  waitForAutosave,
} from './support/app';

test('opens slash menu, filters commands, and executes structural commands with keyboard', async ({ page, request }) => {
  await bootstrapIssueDetail(page, request);
  await clearEditor(page);

  const editor = getEditor(page);
  await editor.click();

  await measureSoftMetric('slash-menu-open', 1000, async () => {
  await editor.type('/hea');
    await expect(page.getByTestId('markdown-slash-menu')).toBeVisible();
  });
  await expect(page.getByTestId('markdown-slash-heading1')).toBeVisible();
  await expect(page.getByTestId('markdown-slash-heading2')).toBeVisible();
  await expect(page.getByTestId('markdown-slash-heading3')).toBeVisible();
  await page.keyboard.press('Enter');
  await editor.type('Heading from slash');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');

  await editor.type('/task');
  await expect(page.getByTestId('markdown-slash-taskList')).toBeVisible();
  await page.keyboard.press('Enter');
  await editor.type('Task from slash');
  await page.keyboard.press('Enter');

  await editor.type('/code');
  await expect(page.getByTestId('markdown-slash-codeBlock')).toBeVisible();
  await page.keyboard.press('Enter');
  await editor.type('const slash = true;');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');

  await waitForAutosave(page, request);
  const contentJson = await getCurrentIssueContentJson(page, request);
  expect(findProseMirrorNodes(contentJson, (node) => node.type === 'heading' && (node.attrs as { level?: number } | undefined)?.level === 1 && getNodeText(node) === 'Heading from slash')).toHaveLength(1);
  expect(findProseMirrorNodes(contentJson, (node) => node.type === 'taskList')).toHaveLength(1);
  expect(findProseMirrorNodes(contentJson, (node) => node.type === 'codeBlock' && getNodeText(node).includes('const slash = true;'))).toHaveLength(1);
});

test('supports slash menu filtering, navigation, and escape dismissal', async ({ page, request }) => {
  await bootstrapIssueDetail(page, request);
  await clearEditor(page);

  const editor = getEditor(page);
  await editor.click();
  await editor.type('/gif');
  await expect(page.getByTestId('markdown-slash-menu')).toBeVisible();
  await expect(page.getByTestId('markdown-slash-gif')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('markdown-slash-menu')).toHaveCount(0);
  await clearEditor(page);
  await editor.click();

  await editor.type('/task');
  await expect(page.getByTestId('markdown-slash-taskList')).toBeVisible();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('Enter');
  await editor.type('Task from navigation');

  await waitForAutosave(page, request);
  const contentJson = await getCurrentIssueContentJson(page, request);
  expect(findProseMirrorNodes(contentJson, (node) => node.type === 'taskList')).toHaveLength(1);
  expect(findProseMirrorNodes(contentJson, (node) => node.type === 'taskItem' && getNodeText(node).includes('Task from navigation'))).toHaveLength(1);
});

test('renders linear-style first-screen slash items and placeholder actions', async ({ page, request }) => {
  await bootstrapIssueDetail(page, request);
  await clearEditor(page);

  const editor = getEditor(page);
  await editor.click();
  await editor.type('/');

  const menu = page.getByTestId('markdown-slash-menu');
  await expect(menu).toBeVisible();
  await expect(page.getByTestId('markdown-slash-heading1')).toContainText('Heading 1');
  await expect(page.getByTestId('markdown-slash-heading2')).toContainText('Heading 2');
  await expect(page.getByTestId('markdown-slash-heading3')).toContainText('Heading 3');
  await expect(page.getByTestId('markdown-slash-bulletList')).toContainText('Bulleted list');
  await expect(page.getByTestId('markdown-slash-orderedList')).toContainText('Numbered list');
  await expect(page.getByTestId('markdown-slash-taskList')).toContainText('Checklist');
  await expect(page.getByTestId('markdown-slash-media')).toContainText('Insert media...');
  await expect(page.getByTestId('markdown-slash-gif')).toContainText('Insert gif...');
  await expect(page.getByTestId('markdown-slash-attachment')).toContainText('Attach file...');
  await expect(page.getByTestId('markdown-slash-codeBlock')).toContainText('Code block');
  await expect(page.getByTestId('markdown-slash-diagram')).toContainText('Diagram');
  await expect(page.getByTestId('markdown-slash-collapsibleSection')).toContainText('Collapsible section');

  await clearEditor(page);
  await editor.click();
  await editor.type('/gif');
  await page.keyboard.press('Enter');
  await expect(page.getByText(/GIF insertion is coming soon\.|GIF 插入即将支持。/)).toBeVisible();

  await clearEditor(page);
  await editor.click();
  await editor.type('/diag');
  await page.keyboard.press('Enter');
  await expect(page.getByText(/Diagram blocks are coming soon\.|图表块即将支持。/)).toBeVisible();

  await clearEditor(page);
  await editor.click();
  await editor.type('/coll');
  await page.keyboard.press('Enter');
  await expect(page.getByText(/Collapsible sections are coming soon\.|折叠区块即将支持。/)).toBeVisible();
});

test('executes all displayed slash shortcuts', async ({ page, request }) => {
  await bootstrapIssueDetail(page, request);
  await clearEditor(page);

  const editor = getEditor(page);
  await editor.click();

  await page.keyboard.press('Control+Alt+1');
  await editor.type('Heading one');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Control+Alt+2');
  await editor.type('Heading two');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Control+Alt+3');
  await editor.type('Heading three');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Control+Shift+8');
  await editor.type('Bullet item');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Control+Shift+9');
  await editor.type('Ordered item');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Control+Shift+7');
  await editor.type('Checklist item');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Control+Shift+\\');
  await editor.type('const shortcut = true;');

  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.keyboard.press('Control+Shift+U');
  await fileChooserPromise;

  await waitForAutosave(page, request);
  const contentJson = await getCurrentIssueContentJson(page, request);
  expect(findProseMirrorNodes(contentJson, (node) => node.type === 'heading' && (node.attrs as { level?: number } | undefined)?.level === 1 && getNodeText(node).includes('Heading one'))).toHaveLength(1);
  expect(findProseMirrorNodes(contentJson, (node) => node.type === 'heading' && (node.attrs as { level?: number } | undefined)?.level === 2 && getNodeText(node).includes('Heading two'))).toHaveLength(1);
  expect(findProseMirrorNodes(contentJson, (node) => node.type === 'heading' && (node.attrs as { level?: number } | undefined)?.level === 3 && getNodeText(node).includes('Heading three'))).toHaveLength(1);
  expect(findProseMirrorNodes(contentJson, (node) => node.type === 'bulletList')).toHaveLength(1);
  expect(findProseMirrorNodes(contentJson, (node) => node.type === 'orderedList')).toHaveLength(1);
  expect(findProseMirrorNodes(contentJson, (node) => node.type === 'taskList')).toHaveLength(1);
  expect(findProseMirrorNodes(contentJson, (node) => node.type === 'codeBlock' && getNodeText(node).includes('const shortcut = true;'))).toHaveLength(1);
});

function getNodeText(node: Record<string, unknown>): string {
  const text = typeof node.text === 'string' ? node.text : '';
  const content = Array.isArray(node.content)
    ? node.content.map((child) => (child && typeof child === 'object' ? getNodeText(child as Record<string, unknown>) : '')).join('')
    : '';
  return `${text}${content}`;
}
