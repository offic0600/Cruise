import { expect, test } from '@playwright/test';
import {
  bootstrapIssueDetail,
  getCurrentIssueDescription,
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

  await expect
    .poll(async () => await getCurrentIssueDescription(page, request), { timeout: 8_000 })
    .toContain('**Alpha**');
  await expect
    .poll(async () => await getCurrentIssueDescription(page, request), { timeout: 8_000 })
    .toContain('*beta*');
  await expect
    .poll(async () => await getCurrentIssueDescription(page, request), { timeout: 8_000 })
    .toContain('~~gamma~~');
  await expect
    .poll(async () => await getCurrentIssueDescription(page, request), { timeout: 8_000 })
    .toContain('# delta');
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
  await expect
    .poll(async () => await getCurrentIssueDescription(page, request), { timeout: 8_000 })
    .toContain('[Link target](https://example.com/docs)');

  await page.reload();
  await expect(page.locator('a[href="https://example.com/docs"]').first()).toContainText('Link target');

  await selectTextInEditor(page, 'Link target');
  await page.getByTestId('markdown-toolbar-link').click({ force: true });
  await expect(page.getByTestId('markdown-link-input')).toHaveValue('https://example.com/docs');
  await page.getByTestId('markdown-link-input').fill('https://example.com/updated');
  await page.getByTestId('markdown-link-apply').click();
  await expect
    .poll(async () => await getCurrentIssueDescription(page, request), { timeout: 8_000 })
    .toContain('[Link target](https://example.com/updated)');

  await selectTextInEditor(page, 'Link target');
  await page.getByTestId('markdown-toolbar-link').click({ force: true });
  await page.getByTestId('markdown-link-remove').click();
  await expect
    .poll(async () => await getCurrentIssueDescription(page, request), { timeout: 8_000 })
    .not.toContain('https://example.com/updated');
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

  await expect
    .poll(async () => await getCurrentIssueDescription(page, request), { timeout: 8_000 })
    .toContain('## Heading two target');
  await expect
    .poll(async () => await getCurrentIssueDescription(page, request), { timeout: 8_000 })
    .toContain('- Bullet target');
  await expect
    .poll(async () => await getCurrentIssueDescription(page, request), { timeout: 8_000 })
    .toContain('- [ ] Task target');
  await expect
    .poll(async () => await getCurrentIssueDescription(page, request), { timeout: 8_000 })
    .toContain('> Quote target');
  await expect
    .poll(async () => await getCurrentIssueDescription(page, request), { timeout: 8_000 })
    .toContain('```');
  await expect(page.locator('hr').first()).toBeVisible();
});
