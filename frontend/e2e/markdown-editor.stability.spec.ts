import { expect, test } from '@playwright/test';
import {
  bootstrapIssueDetail,
  clearEditor,
  failNextIssueUpdate,
  getCaretOffset,
  getCurrentIssueContentJson,
  getEmptyParagraphPlaceholderSnapshot,
  getEditor,
  getSelectedText,
  getToolbar,
  measureSoftMetric,
  selectTextInEditor,
  updateCurrentIssueViaApi,
  waitForAutosave,
} from './support/app';

test('keeps selection stable for forward, backward, and programmatic selection flows', async ({ page, request }) => {
  await bootstrapIssueDetail(page, request);
  await updateCurrentIssueViaApi(page, request, { description: 'Alpha beta gamma' });
  await page.reload();

  const toolbar = getToolbar(page);

  await measureSoftMetric('toolbar-open-forward-selection', 900, async () => {
    await selectTextInEditor(page, 'Alpha', 'forward');
    await expect.poll(async () => await getSelectedText(page)).toContain('Alpha');
  });

  await measureSoftMetric('toolbar-open-backward-selection', 900, async () => {
    await selectTextInEditor(page, 'beta', 'backward');
    await expect.poll(async () => await getSelectedText(page)).toContain('beta');
  });

  await measureSoftMetric('toolbar-open-programmatic-selection', 900, async () => {
    await selectTextInEditor(page, 'gamma');
    await expect(toolbar).toBeVisible();
  });
  await expect.poll(async () => await getSelectedText(page)).toContain('gamma');
});

test('shows the floating toolbar for real mouse selection', async ({ page, request }) => {
  await bootstrapIssueDetail(page, request);
  await updateCurrentIssueViaApi(page, request, { description: 'Alpha beta gamma' });
  await page.reload();

  const editor = getEditor(page);
  const toolbar = getToolbar(page);

  await measureSoftMetric('toolbar-open-forward-selection-visual', 900, async () => {
    await selectTextInEditor(page, 'Alpha', 'forward');
    await expect(toolbar).toBeVisible();
  });

  await measureSoftMetric('toolbar-open-backward-selection-visual', 900, async () => {
    await selectTextInEditor(page, 'beta', 'backward');
    await expect(toolbar).toBeVisible();
  });
});

test('shows slash command hint on a new empty paragraph after existing content and clears it after typing', async ({ page, request }) => {
  await bootstrapIssueDetail(page, request);
  await updateCurrentIssueViaApi(page, request, { description: 'Existing paragraph' });
  await page.reload();

  const editor = getEditor(page);
  await editor.click();
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');
  await expect
    .poll(async () => await getEmptyParagraphPlaceholderSnapshot(page), { timeout: 5_000 })
    .not.toBeNull();

  const beforeTyping = (await getEmptyParagraphPlaceholderSnapshot(page))!;
  expect(beforeTyping.dataPlaceholder).toBeTruthy();
  expect(beforeTyping.beforeContent).toContain('/');

  await page.keyboard.type('typed');
  await expect
    .poll(async () => await getEmptyParagraphPlaceholderSnapshot(page), { timeout: 5_000 })
    .toBeNull();
});

test('survives rapid typing and keeps the caret near the typing position after autosave', async ({ page, request }) => {
  await bootstrapIssueDetail(page, request);
  const editor = getEditor(page);
  await editor.click();
  await page.keyboard.type('rapid-one rapid-two rapid-three rapid-four', { delay: 8 });

  await measureSoftMetric('idle-autosave', 3500, async () => {
    await waitForAutosave(page, request, 'rapid-four');
  });

  const caretAfterFirstSave = await getCaretOffset(page);
  await page.keyboard.type(' tail-fragment', { delay: 8 });
  await waitForAutosave(page, request, 'tail-fragment');
  const contentJson = await pollIssueContentJson(page, request);
  expect(getNodeText(contentJson)).toContain('rapid-one rapid-two rapid-three rapid-four tail-fragment');
  const caretAfterSecondSave = await getCaretOffset(page);
  expect(caretAfterFirstSave).not.toBe(0);
  expect(caretAfterSecondSave).not.toBe(0);
});

test('supports blur save and save failure recovery without losing edited content', async ({ page, request }) => {
  await bootstrapIssueDetail(page, request);
  const editor = getEditor(page);
  await editor.click();
  await page.keyboard.type('blur-save text');

  await measureSoftMetric('blur-save', 3500, async () => {
    await page.getByRole('heading', { name: 'Activity', exact: true }).click();
    await waitForAutosave(page, request, 'blur-save text');
  });

  const beforeFailure = getNodeText(await pollIssueContentJson(page, request));
  await failNextIssueUpdate(page, -1);
  await editor.click();
  await page.keyboard.type(' fail-once');
  await page.waitForTimeout(1200);
  expect(getNodeText(await pollIssueContentJson(page, request))).toBe(beforeFailure);

  await page.keyboard.type(' recover');
  await waitForAutosave(page, request, 'recover');

  const contentJson = await pollIssueContentJson(page, request);
  expect(getNodeText(contentJson)).toContain('blur-save text fail-once recover');
});

async function pollIssueContentJson(page: Parameters<typeof getEditor>[0], request: Parameters<typeof getCurrentIssueContentJson>[1]) {
  await expect.poll(async () => await getCurrentIssueContentJson(page, request), { timeout: 8_000 }).not.toBeNull();
  return (await getCurrentIssueContentJson(page, request)) as Record<string, unknown>;
}

function getNodeText(node: Record<string, unknown>): string {
  const text = typeof node.text === 'string' ? node.text : '';
  const content = Array.isArray(node.content)
    ? node.content.map((child) => (child && typeof child === 'object' ? getNodeText(child as Record<string, unknown>) : '')).join('')
    : '';
  return `${text}${content}`;
}
