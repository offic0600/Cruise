import { expect, test } from '@playwright/test';
import {
  bootstrapIssueDetail,
  clearEditor,
  getCurrentIssueDescription,
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
  const markdown = await getCurrentIssueDescription(page, request);
  expect(markdown).toContain('# Heading from slash');
  expect(markdown).toContain('- [ ] Task from slash');
  expect(markdown).toContain('```');
  expect(markdown).toContain('const slash = true;');
  expect(markdown).toContain('---');
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
  await expect
    .poll(async () => await getCurrentIssueDescription(page, request), { timeout: 8_000 })
    .toContain('- [ ] Task from navigation');
});
