import { expect, test } from '@playwright/test';
import {
  bootstrapIssueDetail,
  clearEditor,
  getCurrentIssueDescription,
  getEditor,
  waitForAutosave,
} from './support/app';

test('converts heading, quote, divider, ordered list, bullet list, and task list input rules', async ({ page, request }) => {
  await bootstrapIssueDetail(page, request);

  await clearEditor(page);
  const editor = getEditor(page);
  await editor.type('# Heading one');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await editor.type('## Heading two');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await editor.type('> Quoted line');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await editor.type('- Bullet item');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await editor.type('1. Ordered item');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await editor.type('[ ] Task item');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await editor.type('---');
  await page.keyboard.press('Enter');

  await waitForAutosave(page, request);
  const markdown = await getCurrentIssueDescription(page, request);
  expect(markdown).toContain('# Heading one');
  expect(markdown).toContain('## Heading two');
  expect(markdown).toContain('> Quoted line');
  expect(markdown).toContain('- Bullet item');
  expect(markdown).toContain('1. Ordered item');
  expect(markdown).toContain('- [ ] Task item');
  expect(markdown).toContain('---');

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Heading one', level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Heading two', level: 2 })).toBeVisible();
  await expect(page.locator('blockquote').filter({ hasText: 'Quoted line' }).first()).toBeVisible();
  await expect(page.locator('li').filter({ hasText: 'Bullet item' }).first()).toBeVisible();
  await expect(page.locator('li').filter({ hasText: 'Ordered item' }).first()).toBeVisible();
  await expect(page.locator('li').filter({ hasText: 'Task item' }).first()).toBeVisible();
  await expect(page.locator('hr').first()).toBeVisible();
});

test('converts fenced code blocks and structures pasted markdown', async ({ page, request, browserName }) => {
  test.skip(browserName !== 'chromium', 'Clipboard-based markdown paste is only covered on Chromium.');
  await bootstrapIssueDetail(page, request);
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

  await clearEditor(page);
  const editor = getEditor(page);
  await editor.type('```');
  await page.keyboard.press('Enter');
  await editor.type('const pasted = true;');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');

  await editor.click();
  await editor.evaluate((element, markdown) => {
    const data = new DataTransfer();
    data.setData('text/plain', markdown);
    const event = new ClipboardEvent('paste', {
      clipboardData: data,
      bubbles: true,
      cancelable: true,
    });
    element.dispatchEvent(event);
  }, '# Pasted heading\n\n- Pasted bullet\n\n> Pasted quote');

  await waitForAutosave(page, request);
  const markdown = await getCurrentIssueDescription(page, request);
  expect(markdown).toContain('```');
  expect(markdown).toContain('const pasted = true;');
  expect(markdown).toContain('# Pasted heading');
  expect(markdown).toContain('- Pasted bullet');
  expect(markdown).toContain('> Pasted quote');

  await page.reload();
  await expect(page.locator('pre code').first()).toContainText('const pasted = true;');
  await expect(page.getByRole('heading', { name: 'Pasted heading', level: 1 })).toBeVisible();
  await expect(page.locator('li').filter({ hasText: 'Pasted bullet' }).first()).toBeVisible();
  await expect(page.locator('blockquote').filter({ hasText: 'Pasted quote' }).first()).toBeVisible();
});

test('converts heading, quote, and task-list triggers through real character-by-character input', async ({ page, request }) => {
  await bootstrapIssueDetail(page, request);
  await clearEditor(page);

  const editor = getEditor(page);
  await editor.click();

  await page.keyboard.type('#');
  expect(await getEditorText(page)).toContain('#');
  await page.keyboard.type(' ');
  expect(await getEditorHtml(page)).toContain('<h1');

  await page.keyboard.type('Heading boundary');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');

  await page.keyboard.type('>');
  expect(await getEditorText(page)).toContain('>');
  await page.keyboard.type(' ');
  expect(await getEditorHtml(page)).toContain('<blockquote');
  await page.keyboard.type('Quote boundary');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');

  await page.keyboard.type('[');
  await page.keyboard.type(']');
  await page.keyboard.type(' ');
  expect(await getEditorHtml(page)).toContain('data-type="taskList"');
  await page.keyboard.type('Task boundary');

  await waitForAutosave(page, request);
  const markdown = await getCurrentIssueDescription(page, request);
  expect(markdown).toContain('# Heading boundary');
  expect(markdown).toContain('> Quote boundary');
  expect(markdown).toContain('- [ ] Task boundary');
});

test.fail('keeps bullet-list trigger stable when typing dash then space at block start', async ({ page, request }) => {
  await bootstrapIssueDetail(page, request);
  await clearEditor(page);

  const editor = getEditor(page);
  await editor.click();

  await page.keyboard.type('-');
  expect(await getEditorText(page)).toContain('-');

  await page.keyboard.type(' ');

  const html = await getEditorHtml(page);
  expect(html).toContain('<ul');
  expect(html).not.toContain('<p><br');
});

test('pressing escape on an empty bullet item clears the current bullet and keeps typing on the new line', async ({ page, request }) => {
  await bootstrapIssueDetail(page, request);
  await clearEditor(page);

  const editor = getEditor(page);
  await editor.click();
  await page.keyboard.type('- First bullet');
  await page.keyboard.press('Enter');

  let html = await getEditorHtml(page);
  expect(html).toContain('<ul');

  await page.keyboard.press('Escape');
  await page.keyboard.type('Paragraph after escape');

  await waitForAutosave(page, request);
  const markdown = await getCurrentIssueDescription(page, request);
  expect(markdown).toContain('- First bullet');
  expect(markdown).toContain('Paragraph after escape');
  expect(markdown).not.toContain('- Paragraph after escape');

  await page.reload();
  await expect(page.locator('li').filter({ hasText: 'First bullet' }).first()).toBeVisible();
  await expect(page.locator('p').filter({ hasText: 'Paragraph after escape' }).first()).toBeVisible();
});

async function getEditorText(page: Parameters<typeof getEditor>[0]) {
  return getEditor(page).evaluate((element) => (element.textContent ?? '').trim());
}

async function getEditorHtml(page: Parameters<typeof getEditor>[0]) {
  return getEditor(page).evaluate((element) => element.innerHTML);
}
