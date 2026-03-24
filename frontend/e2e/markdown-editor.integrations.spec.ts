import { expect, test } from '@playwright/test';
import {
  bootstrapIssueDetail,
  clearEditor,
  getEditor,
  measureSoftMetric,
} from './support/app';

test('bridges slash sub-issue actions', async ({ page, request }) => {
  await bootstrapIssueDetail(page, request);
  await clearEditor(page);

  const editor = getEditor(page);
  await editor.click();

  await editor.type('/sub');
  await expect(page.getByTestId('markdown-slash-subIssue')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('issue-detail-subissue-title-input')).toBeVisible();
});

test('bridges slash related issue actions', async ({ page, request }) => {
  const { issue } = await bootstrapIssueDetail(page, request);
  await clearEditor(page);
  const editor = getEditor(page);
  page.once('dialog', async (dialog) => {
    await dialog.accept(`${issue.title} related via slash`);
  });
  await editor.click();
  await editor.type('/rel');
  await expect(page.getByTestId('markdown-slash-relatedIssue')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/issue\/[A-Z]+-\d+\//);
});

test('bridges slash document and project relation actions', async ({ page, request }) => {
  await bootstrapIssueDetail(page, request);
  await clearEditor(page);
  const editor = getEditor(page);
  let documentPromptTriggered = false;
  page.once('dialog', async (dialog) => {
    documentPromptTriggered = true;
    await dialog.accept('Document via slash');
  });
  await editor.click();
  await editor.type('/doc');
  await expect(page.getByTestId('markdown-slash-documentRelation')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect.poll(() => documentPromptTriggered).toBeTruthy();

  await editor.click();
  await editor.type('/pro');
  await expect(page.getByTestId('markdown-slash-projectRelation')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.getByText(/placeholder|占位/).first()).toBeVisible();
});

test('bridges slash attachment into the existing file upload flow', async ({ page, request }) => {
  await bootstrapIssueDetail(page, request);
  await clearEditor(page);

  const editor = getEditor(page);
  await editor.click();
  await editor.type('/att');
  await expect(page.getByTestId('markdown-slash-attachment')).toBeVisible();
  await page.keyboard.press('Enter');

  const attachmentInput = page.locator('input[type="file"]').first();
  await measureSoftMetric('attachment-bridge-upload', 2500, async () => {
    await attachmentInput.setInputFiles({
      name: 'slash-attachment.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('slash attachment'),
    });
    await expect(page.getByText('slash-attachment.txt').first()).toBeVisible();
  });
});
