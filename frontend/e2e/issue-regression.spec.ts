import { expect, test } from '@playwright/test';
import {
  buildIssueFixture,
  buildWorkspaceFixture,
  createIssueViaUi,
  createWorkspaceViaUi,
  loginViaPassword,
  openIssueDetail,
  registerUser,
  selectMenuItem,
} from './support/app';

test('workspace -> create issue -> edit -> sub-issue -> activity -> comment regression flow', async ({ page, request }) => {
  test.slow();

  const user = await registerUser(request);
  const workspace = buildWorkspaceFixture();
  const issue = buildIssueFixture();

  await loginViaPassword(page, user);
  await createWorkspaceViaUi(page, workspace);

  await createIssueViaUi(page, issue.title);
  await openIssueDetail(page, issue.title, workspace.slug);

  const statePill = page.getByTestId('issue-detail-sidebar-state-pill');
  const initialStateLabel = (await statePill.textContent())?.trim() ?? '';
  const nextStatePattern = /寰呭紑濮媩Todo/i.test(initialStateLabel) ? /杩涜涓瓅In progress/i : /寰呭紑濮媩Todo/i;
  const stateActivityPattern = /寰呭紑濮媩Todo/i.test(initialStateLabel)
    ? /灏嗙姸鎬佷粠.*鏀逛负.*杩涜涓瓅moved from.*to.*In progress/i
    : /灏嗙姸鎬佷粠.*鏀逛负.*寰呭紑濮媩moved from.*to.*Todo/i;

  await statePill.click();
  await selectMenuItem(page, nextStatePattern);
  await expect(statePill).toContainText(nextStatePattern);

  const activitySection = page.getByTestId('issue-detail-activity-section');
  await expect(activitySection).toContainText(stateActivityPattern);

  await page.getByTestId('issue-detail-sidebar-priority-pill').click();
  await selectMenuItem(page, /楂榺High/i);
  await expect(page.getByTestId('issue-detail-sidebar-priority-pill')).toContainText(/楂榺High/i);
  await expect(activitySection).toContainText(/灏嗕紭鍏堢骇浠巪changed priority/i);

  await page.getByTestId('issue-detail-add-subissue-button').click();
  await page.getByTestId('issue-detail-subissue-title-input').fill(issue.subIssueTitle);
  await page.getByTestId('issue-detail-subissue-description-input').fill('Sub-issue created by Playwright regression flow.');
  await expect(page.getByTestId('issue-detail-subissue-create-button')).toBeEnabled();
  await page.getByTestId('issue-detail-subissue-create-button').click();
  await expect(page.getByText(issue.subIssueTitle, { exact: true })).toBeVisible();

  await page.getByTestId('issue-detail-comment-input').fill(issue.commentBody);
  await page.getByTestId('issue-detail-comment-submit-button').click();
  await expect(page.getByText(issue.commentBody, { exact: true })).toBeVisible();

  await expect(activitySection).toContainText(/鍒涘缓浜嗚浜嬮」|created the issue/i);
});

test('shared issues list renders in new view preview and issues page', async ({ page, request }) => {
  const user = await registerUser(request);
  const workspace = buildWorkspaceFixture();
  const issue = buildIssueFixture();

  await loginViaPassword(page, user);
  await createWorkspaceViaUi(page, workspace);
  await createIssueViaUi(page, issue.title);

  const teamMatch = page.url().match(/\/team\/([^/]+)\//);
  expect(teamMatch, 'expected current team key in URL').toBeTruthy();
  const teamKey = teamMatch?.[1];

  await page.goto(`/${workspace.slug}/views/issues/new`);
  await expect(page.getByText(issue.title, { exact: true })).toBeVisible();

  await page.goto(`/${workspace.slug}/team/${teamKey}/active`);
  await expect(page.getByText(issue.title, { exact: true })).toBeVisible();
});
