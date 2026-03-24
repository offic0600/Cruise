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

  await editor.type('/div');
  await expect(page.getByTestId('markdown-slash-divider')).toBeVisible();
  await page.keyboard.press('Enter');

  await waitForAutosave(page, request);
  const contentJson = await getCurrentIssueContentJson(page, request);
  expect(findProseMirrorNodes(contentJson, (node) => node.type === 'heading' && (node.attrs as { level?: number } | undefined)?.level === 1 && getNodeText(node) === 'Heading from slash')).toHaveLength(1);
  expect(findProseMirrorNodes(contentJson, (node) => node.type === 'taskList')).toHaveLength(1);
  expect(findProseMirrorNodes(contentJson, (node) => node.type === 'codeBlock' && getNodeText(node).includes('const slash = true;'))).toHaveLength(1);
  expect(findProseMirrorNodes(contentJson, (node) => node.type === 'horizontalRule')).toHaveLength(1);
});

test('supports slash menu filtering, navigation, and escape dismissal', async ({ page, request }) => {
  await bootstrapIssueDetail(page, request);
  await clearEditor(page);

  const editor = getEditor(page);
  await editor.click();
  await editor.type('/rel');
  await expect(page.getByTestId('markdown-slash-menu')).toBeVisible();
  await expect(page.getByTestId('markdown-slash-relatedIssue')).toBeVisible();
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

function getNodeText(node: Record<string, unknown>): string {
  const text = typeof node.text === 'string' ? node.text : '';
  const content = Array.isArray(node.content)
    ? node.content.map((child) => (child && typeof child === 'object' ? getNodeText(child as Record<string, unknown>) : '')).join('')
    : '';
  return `${text}${content}`;
}
