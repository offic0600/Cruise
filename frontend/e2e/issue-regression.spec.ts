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
  const nextStatePattern = /待开始|Todo/i.test(initialStateLabel) ? /进行中|In progress/i : /待开始|Todo/i;
  const stateActivityPattern = /待开始|Todo/i.test(initialStateLabel) ? /将状态从.*改为.*进行中|moved from.*to.*In progress/i : /将状态从.*改为.*待开始|moved from.*to.*Todo/i;

  await statePill.click();
  await selectMenuItem(page, nextStatePattern);
  await expect(statePill).toContainText(nextStatePattern);

  const activitySection = page.getByTestId('issue-detail-activity-section');
  await expect(activitySection).toContainText(stateActivityPattern);

  await page.getByTestId('issue-detail-sidebar-priority-pill').click();
  await selectMenuItem(page, /高|High/i);
  await expect(page.getByTestId('issue-detail-sidebar-priority-pill')).toContainText(/高|High/i);
  await expect(activitySection).toContainText(/将优先级从|changed priority/i);

  await page.getByTestId('issue-detail-add-subissue-button').click();
  await page.getByTestId('issue-detail-subissue-title-input').fill(issue.subIssueTitle);
  await page.getByTestId('issue-detail-subissue-description-input').fill('Sub-issue created by Playwright regression flow.');
  await expect(page.getByTestId('issue-detail-subissue-create-button')).toBeEnabled();
  await page.getByTestId('issue-detail-subissue-create-button').click();
  await expect(page.getByText(issue.subIssueTitle, { exact: true })).toBeVisible();

  await page.getByTestId('issue-detail-comment-input').fill(issue.commentBody);
  await page.getByTestId('issue-detail-comment-submit-button').click();
  await expect(page.getByText(issue.commentBody, { exact: true })).toBeVisible();

  await expect(activitySection).toContainText(/创建了该事项|created the issue/i);
});
