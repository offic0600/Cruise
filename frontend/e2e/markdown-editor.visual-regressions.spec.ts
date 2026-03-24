import { expect, test } from '@playwright/test';
import { bootstrapIssueDetail, clearEditor, getEditor } from './support/app';

type BulletSnapshot = {
  label: string;
  html: string;
  text: string;
  hasUl: boolean;
  hasLi: boolean;
  liCount: number;
  liText: string[];
  emptyParagraphCount: number;
  markerContent: string | null;
  listStyleType: string | null;
  paddingLeft: string | null;
  ulListStyleType: string | null;
  ulPaddingLeft: string | null;
  liRect: { width: number; height: number } | null;
};

test('diagnoses visual bullet-list trigger behavior after typing dash and space', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'This visual diagnosis is only pinned for Chromium.');

  await bootstrapIssueDetail(page, page.request);
  const editor = getEditor(page);
  const activityHeading = page.getByRole('heading', { name: 'Activity', exact: true });

  const snapshots: BulletSnapshot[] = [];

  await test.step('keyboard-only path', async () => {
    await clearEditor(page);
    await editor.click();
    await page.keyboard.type('-');
    await page.keyboard.type(' ');
    snapshots.push(await captureBulletSnapshot(page, 'keyboard-only'));
  });

  await test.step('real mouse focus path', async () => {
    await clearEditor(page);
    const box = await editor.boundingBox();
    expect(box).toBeTruthy();
    await page.mouse.click((box?.x ?? 0) + 24, (box?.y ?? 0) + 18);
    await page.keyboard.type('-');
    await page.keyboard.type(' ');
    snapshots.push(await captureBulletSnapshot(page, 'mouse-focus'));
  });

  await test.step('mouse blur and refocus path', async () => {
    await clearEditor(page);
    await page.mouse.click((await activityHeading.boundingBox())!.x + 10, (await activityHeading.boundingBox())!.y + 10);
    const box = await editor.boundingBox();
    expect(box).toBeTruthy();
    await page.mouse.click((box?.x ?? 0) + 24, (box?.y ?? 0) + 18);
    await page.keyboard.type('-');
    await page.keyboard.type(' ');
    snapshots.push(await captureBulletSnapshot(page, 'mouse-blur-refocus'));
  });

  for (const snapshot of snapshots) {
    test.info().annotations.push({
      type: 'bullet-visual',
      description: `${snapshot.label}: ${JSON.stringify(snapshot)}`,
    });
  }

  for (const snapshot of snapshots) {
    expect.soft(snapshot.hasUl, `${snapshot.label} should create a <ul>`).toBe(true);
    expect.soft(snapshot.hasLi, `${snapshot.label} should create a <li>`).toBe(true);
    expect.soft(snapshot.liRect?.height ?? 0, `${snapshot.label} list item should have visible height`).toBeGreaterThan(0);
    expect.soft(snapshot.listStyleType, `${snapshot.label} list item should restore bullet styling`).not.toBe('none');
    expect.soft(snapshot.ulListStyleType, `${snapshot.label} list should restore bullet styling`).not.toBe('none');
    expect.soft(snapshot.ulPaddingLeft, `${snapshot.label} list should restore left padding`).not.toBe('0px');
  }
});

async function captureBulletSnapshot(page: Parameters<typeof getEditor>[0], label: string): Promise<BulletSnapshot> {
  return getEditor(page).evaluate((element, currentLabel) => {
    const root = element as HTMLElement;
    const list = root.querySelector('ul');
    const items = Array.from(root.querySelectorAll('li'));
    const firstLi = items[0] as HTMLElement | undefined;
    const listElement = list as HTMLElement | null;
    const markerStyle = firstLi ? window.getComputedStyle(firstLi, '::marker') : null;
    const liStyle = firstLi ? window.getComputedStyle(firstLi) : null;
    const ulStyle = listElement ? window.getComputedStyle(listElement) : null;
    const emptyParagraphCount = Array.from(root.querySelectorAll('p')).filter((paragraph) => {
      const text = paragraph.textContent?.replace(/\u200b/g, '').trim() ?? '';
      return text.length === 0;
    }).length;

    return {
      label: currentLabel,
      html: root.innerHTML,
      text: (root.textContent ?? '').replace(/\u200b/g, '').trim(),
      hasUl: Boolean(list),
      hasLi: items.length > 0,
      liCount: items.length,
      liText: items.map((item) => (item.textContent ?? '').replace(/\u200b/g, '').trim()),
      emptyParagraphCount,
      markerContent: markerStyle?.content ?? null,
      listStyleType: liStyle?.listStyleType ?? null,
      paddingLeft: liStyle?.paddingLeft ?? null,
      ulListStyleType: ulStyle?.listStyleType ?? null,
      ulPaddingLeft: ulStyle?.paddingLeft ?? null,
      liRect: firstLi ? { width: firstLi.getBoundingClientRect().width, height: firstLi.getBoundingClientRect().height } : null,
    } satisfies BulletSnapshot;
  }, label);
}
