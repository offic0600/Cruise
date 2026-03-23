import { expect, test, type Page } from '@playwright/test';
import {
  buildIssueFixture,
  buildWorkspaceFixture,
  createIssueViaUi,
  createWorkspaceViaUi,
  getIssueFromCurrentDetailRoute,
  loginViaPassword,
  openIssueDetail,
  registerUser,
} from './support/app';

const editorParagraphs = [
  'Bold target',
  'Italic target',
  'Strike target',
  'Heading one target',
  'Heading two target',
  'Bullet item target',
  'Quote target',
  'Code block target',
  'Link target',
  'Rule target',
];

test('issue detail markdown editor toolbar renders persisted markdown for formatting tools', async ({ page, request }) => {
  test.slow();

  const user = await registerUser(request);
  const workspace = buildWorkspaceFixture();
  const issue = buildIssueFixture();

  await loginViaPassword(page, user);
  await createWorkspaceViaUi(page, workspace);
  await createIssueViaUi(page, issue.title);
  await openIssueDetail(page, issue.title, workspace.slug);

  await replaceEditorContent(page, editorParagraphs);

  await applyInlineToolbarAction(page, 'Bold target', 'markdown-toolbar-bold');
  await applyInlineToolbarAction(page, 'Italic target', 'markdown-toolbar-italic');
  await applyInlineToolbarAction(page, 'Strike target', 'markdown-toolbar-strike');
  await applyInlineToolbarAction(page, 'Heading one target', 'markdown-toolbar-heading-1');
  await applyInlineToolbarAction(page, 'Heading two target', 'markdown-toolbar-heading-2');
  await applyInlineToolbarAction(page, 'Bullet item target', 'markdown-toolbar-bullet-list');
  await applyInlineToolbarAction(page, 'Quote target', 'markdown-toolbar-blockquote');
  await applyInlineToolbarAction(page, 'Code block target', 'markdown-toolbar-code-block');

  page.once('dialog', (dialog) => dialog.accept('https://example.com/docs'));
  await applyInlineToolbarAction(page, 'Link target', 'markdown-toolbar-link');
  await applyInlineToolbarAction(page, 'Rule target', 'markdown-toolbar-horizontal-rule');

  await page.waitForTimeout(1200);
  await page.reload();
  await expect(page.getByText(issue.title, { exact: true })).toBeVisible();

  const savedIssue = await getIssueFromCurrentDetailRoute(page, request);
  expect(savedIssue.description).toContain('**Bold target**');
  expect(savedIssue.description).toContain('_Italic target_');
  expect(savedIssue.description).toContain('~~Strike target~~');
  expect(savedIssue.description).toContain('# Heading one target');
  expect(savedIssue.description).toContain('## Heading two target');
  expect(savedIssue.description).toContain('Bullet item target');
  expect(savedIssue.description).toContain('> Quote target');
  expect(savedIssue.description).toContain('```');
  expect(savedIssue.description).toContain('Code block target');
  expect(savedIssue.description).toContain('[Link target](https://example.com/docs)');
  expect(savedIssue.description).toContain('* * *');

  const editor = page.getByTestId('markdown-editor-content');
  await expect(editor.locator('strong')).toContainText('Bold target');
  await expect(editor.locator('em')).toContainText('Italic target');
  await expect(editor.locator('s')).toContainText('Strike target');
  await expect(editor.locator('h1')).toContainText('Heading one target');
  await expect(editor.locator('h2')).toContainText('Heading two target');
  await expect(editor.locator('ul li').filter({ hasText: 'Bullet item target' })).toHaveCount(1);
  await expect(editor.locator('blockquote')).toContainText('Quote target');
  await expect(editor.locator('pre code')).toContainText('Code block target');
  await expect(editor.locator('a[href=\"https://example.com/docs\"]')).toContainText('Link target');
  await expect(editor.locator('hr')).toHaveCount(1);
});

test('issue detail markdown editor task list toolbar persists checkbox markdown', async ({ page, request }) => {
  const user = await registerUser(request);
  const workspace = buildWorkspaceFixture();
  const issue = buildIssueFixture();

  await loginViaPassword(page, user);
  await createWorkspaceViaUi(page, workspace);
  await createIssueViaUi(page, issue.title);
  await openIssueDetail(page, issue.title, workspace.slug);

  await replaceEditorContent(page, ['Task item target']);
  await applyInlineToolbarAction(page, 'Task item target', 'markdown-toolbar-task-list');
  await page.waitForTimeout(1200);
  await page.reload();

  const savedIssue = await getIssueFromCurrentDetailRoute(page, request);
  expect(savedIssue.description).toContain('- [ ] Task item target');

  const editor = page.getByTestId('markdown-editor-content');
  await expect(editor.locator('input[type=\"checkbox\"]')).toHaveCount(1);
  await expect(editor.locator('li').filter({ hasText: 'Task item target' })).toHaveCount(1);
});

async function replaceEditorContent(page: Page, paragraphs: string[]) {
  const editor = page.getByTestId('markdown-editor-content');
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');

  for (let index = 0; index < paragraphs.length; index += 1) {
    await page.keyboard.insertText(paragraphs[index]);
    if (index < paragraphs.length - 1) {
      await page.keyboard.press('Enter');
      await page.keyboard.press('Enter');
    }
  }

  await page.waitForTimeout(700);
}

async function applyInlineToolbarAction(page: Page, text: string, toolbarTestId: string) {
  await selectEditorText(page, text);
  await expect(page.getByTestId('markdown-editor-toolbar')).toBeVisible();

  await page.getByTestId(toolbarTestId).click();
  await page.waitForTimeout(500);
}

async function selectEditorText(page: Page, text: string) {
  const target = page.getByTestId('markdown-editor-content').getByText(text, { exact: true });
  await expect(target).toBeVisible();
  await target.click({ clickCount: 3 });
}
