import { expect, test } from '@playwright/test';
import {
  bootstrapIssueDetail,
  getCurrentIssueDescription,
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

test('renders persisted markdown and keeps round-trip structure after editing', async ({ page, request }) => {
  await bootstrapIssueDetail(page, request);

  await updateCurrentIssueViaApi(page, request, { description: formattedMarkdown });
  await page.reload();

  const savedIssue = await getCurrentIssueDescription(page, request);
  expect(savedIssue).toContain('**Bold target**');
  expect(savedIssue).toContain('_Italic target_');
  expect(savedIssue).toContain('~~Strike target~~');
  expect(savedIssue).toContain('# Heading one target');
  expect(savedIssue).toContain('## Heading two target');
  expect(savedIssue).toContain('- Bullet item target');
  expect(savedIssue).toContain('1. Ordered item target');
  expect(savedIssue).toContain('- [ ] Task item target');
  expect(savedIssue).toContain('> Quote target');
  expect(savedIssue).toContain('[Link target](https://example.com/docs)');
  expect(savedIssue).toContain('* * *');

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

  const roundTripped = await getCurrentIssueDescription(page, request);
  expect(roundTripped).toContain('Round trip tail');
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
