import { expect, test } from '@playwright/test';
import {
  buildIssueFixture,
  buildWorkspaceFixture,
  createIssueViaUi,
  createWorkspaceViaUi,
  getIssueFromCurrentDetailRoute,
  loginViaPassword,
  openIssueDetail,
  registerUser,
  updateCurrentIssueViaApi,
} from './support/app';

const formattedMarkdown = [
  '**Bold target**',
  '_Italic target_',
  '~~Strike target~~',
  '# Heading one target',
  '## Heading two target',
  '- Bullet item target',
  '> Quote target',
  '```',
  'Code block target',
  '```',
  '[Link target](https://example.com/docs)',
  'Rule target',
  '',
  '* * *',
].join('\n\n');

test('issue detail markdown editor renders persisted markdown formatting', async ({ page, request }) => {
  const user = await registerUser(request);
  const workspace = buildWorkspaceFixture();
  const issue = buildIssueFixture();

  await loginViaPassword(page, user);
  await createWorkspaceViaUi(page, workspace);
  await createIssueViaUi(page, issue.title);
  await openIssueDetail(page, issue.title, workspace.slug);

  await updateCurrentIssueViaApi(page, request, { description: formattedMarkdown });
  await page.reload();

  const savedIssue = await getIssueFromCurrentDetailRoute(page, request);
  expect(savedIssue.description).toContain('**Bold target**');
  expect(savedIssue.description).toContain('_Italic target_');
  expect(savedIssue.description).toContain('~~Strike target~~');
  expect(savedIssue.description).toContain('# Heading one target');
  expect(savedIssue.description).toContain('## Heading two target');
  expect(savedIssue.description).toContain('- Bullet item target');
  expect(savedIssue.description).toContain('> Quote target');
  expect(savedIssue.description).toContain('```');
  expect(savedIssue.description).toContain('[Link target](https://example.com/docs)');
  expect(savedIssue.description).toContain('* * *');

  await expect(page.getByText('Bold target').first()).toBeVisible();
  await expect(page.getByText('Italic target').first()).toBeVisible();
  await expect(page.getByText('Strike target').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Heading one target', level: 1 }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Heading two target', level: 2 }).first()).toBeVisible();
  await expect(page.locator('li').filter({ hasText: 'Bullet item target' }).first()).toBeVisible();
  await expect(page.locator('blockquote').first()).toContainText('Quote target');
  await expect(page.locator('pre code').first()).toContainText('Code block target');
  await expect(page.locator('a[href=\"https://example.com/docs\"]').first()).toContainText('Link target');
  await expect(page.locator('hr').first()).toBeVisible();
});

test('issue detail markdown editor renders persisted task list markdown', async ({ page, request }) => {
  const user = await registerUser(request);
  const workspace = buildWorkspaceFixture();
  const issue = buildIssueFixture();

  await loginViaPassword(page, user);
  await createWorkspaceViaUi(page, workspace);
  await createIssueViaUi(page, issue.title);
  await openIssueDetail(page, issue.title, workspace.slug);

  await updateCurrentIssueViaApi(page, request, {
    description: '- [ ] Task item target',
  });
  await page.reload();

  const savedIssue = await getIssueFromCurrentDetailRoute(page, request);
  expect(savedIssue.description).toContain('- [ ] Task item target');

  await expect(page.locator('li').filter({ hasText: 'Task item target' }).first()).toBeVisible();
  await expect(page.getByText('[ ]')).toHaveCount(0);
});
