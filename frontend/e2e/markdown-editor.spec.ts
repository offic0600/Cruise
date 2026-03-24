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

test('issue detail markdown editor keeps selection stable and saves on idle or blur', async ({ page, request }) => {
  const user = await registerUser(request);
  const workspace = buildWorkspaceFixture();
  const issue = buildIssueFixture();

  await loginViaPassword(page, user);
  await createWorkspaceViaUi(page, workspace);
  await createIssueViaUi(page, issue.title);
  await openIssueDetail(page, issue.title, workspace.slug);

  await updateCurrentIssueViaApi(page, request, {
    description: 'Alpha beta gamma',
  });
  await page.reload();

  const editable = page.getByTestId('markdown-editor-editable');
  const toolbar = page.getByTestId('markdown-editor-toolbar');

  await expect(editable).toBeVisible();

  await dragSelectText(page, 'Alpha', 'forward');
  await expect(toolbar).toHaveCount(0);
  await page.mouse.up();
  await expect(toolbar).toBeVisible();
  await page.getByTestId('markdown-toolbar-bold').click();

  await expect
    .poll(async () => (await getIssueFromCurrentDetailRoute(page, request)).description, {
      timeout: 5000,
    })
    .toContain('**Alpha**');

  await dragSelectText(page, 'beta', 'backward');
  await expect(toolbar).toHaveCount(0);
  await page.mouse.up();
  await expect(toolbar).toBeVisible();
  await page.getByTestId('markdown-toolbar-italic').click();
  await expect
    .poll(async () => (await getIssueFromCurrentDetailRoute(page, request)).description, {
      timeout: 5000,
    })
    .toContain('*beta*');

  await dragSelectText(page, 'gamma', 'forward');
  await page.mouse.up();
  await expect(toolbar).toBeVisible();
  await page.getByTestId('markdown-toolbar-italic').click();
  await page.getByRole('heading', { name: 'Activity', exact: true }).click();

  await expect
    .poll(async () => (await getIssueFromCurrentDetailRoute(page, request)).description, {
      timeout: 5000,
    })
    .toContain('*gamma*');

  await page.reload();
  await expect(page.locator('strong').filter({ hasText: 'Alpha' }).first()).toBeVisible();
  await expect(page.locator('em').filter({ hasText: 'gamma' }).first()).toBeVisible();
  await expect(page.locator('em').filter({ hasText: 'beta' }).first()).toBeVisible();
});

async function dragSelectText(page: Page, text: string, direction: 'forward' | 'backward') {
  const range = await getTextRange(page, text);
  const startX = direction === 'forward' ? range.left + 2 : range.right - 2;
  const endX = direction === 'forward' ? range.right - 2 : range.left + 2;

  await page.mouse.move(startX, range.middleY);
  await page.mouse.down();
  await page.mouse.move(endX, range.middleY, { steps: 12 });
}

async function getTextRange(page: Page, text: string) {
  const range = await page.getByTestId('markdown-editor-editable').evaluate(
    (element, targetText) => {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      let current: Node | null = walker.nextNode();
      while (current) {
        const value = current.textContent ?? '';
        const index = value.indexOf(targetText);
        if (index >= 0) {
          const range = document.createRange();
          range.setStart(current, index);
          range.setEnd(current, index + targetText.length);
          const rect = range.getBoundingClientRect();
          return {
            left: rect.left,
            right: rect.right,
            middleY: rect.top + rect.height / 2,
          };
        }
        current = walker.nextNode();
      }

      return null;
    },
    text,
  );

  expect(range, `unable to find text range for ${text}`).toBeTruthy();
  return range as { left: number; right: number; middleY: number };
}
