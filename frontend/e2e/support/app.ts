import { expect, type APIRequestContext, type Page } from '@playwright/test';

const apiBaseURL = process.env.PLAYWRIGHT_API_BASE_URL ?? 'http://localhost:8080/api';

export type E2eUser = {
  username: string;
  password: string;
  email: string;
};

export type E2eWorkspace = {
  name: string;
  slug: string;
};

export type E2eIssue = {
  title: string;
  subIssueTitle: string;
  commentBody: string;
};

export type StoredSessionSnapshot = {
  token: string;
  user: {
    organizationId?: number | null;
  };
};

export function uniqueSuffix() {
  const time = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `${time}-${random}`;
}

export function buildWorkspaceFixture(): E2eWorkspace {
  const suffix = uniqueSuffix();
  return {
    name: `E2E Workspace ${suffix}`,
    slug: `e2e-${suffix}`.toLowerCase(),
  };
}

export function buildIssueFixture(): E2eIssue {
  const suffix = uniqueSuffix();
  return {
    title: `Regression issue ${suffix}`,
    subIssueTitle: `Regression sub-issue ${suffix}`,
    commentBody: `Regression comment ${suffix}`,
  };
}

export async function registerUser(request: APIRequestContext): Promise<E2eUser> {
  const suffix = uniqueSuffix();
  const user = {
    username: `e2e_${suffix}`.replace(/-/g, '_'),
    password: `Pass_${suffix}!`,
    email: `e2e_${suffix}@cruise.local`,
  };

  const response = await request.post(`${apiBaseURL}/auth/register`, {
    data: {
      username: user.username,
      password: user.password,
      email: user.email,
      role: 'USER',
    },
  });

  expect(response.ok(), `register user failed: ${response.status()} ${await response.text()}`).toBeTruthy();
  return user;
}

export async function loginViaPassword(page: Page, user: E2eUser) {
  await page.goto('/login');
  await page.getByTestId('login-password-method-button').click();
  await page.getByTestId('login-username-input').fill(user.username);
  await page.getByTestId('login-password-input').fill(user.password);
  await page.getByTestId('login-submit-button').click();
}

export async function createWorkspaceViaUi(page: Page, workspace: E2eWorkspace) {
  await expect(page).toHaveURL(/\/create-workspace$/);
  await page.getByTestId('create-workspace-name-input').fill(workspace.name);
  await page.getByTestId('create-workspace-slug-input').fill(workspace.slug);
  await expect(page.getByTestId('create-workspace-submit-button')).toBeEnabled();
  await page.getByTestId('create-workspace-submit-button').click();
  await expect(page).toHaveURL(new RegExp(`/${workspace.slug}/team/[^/]+/active`));
}

export async function openIssueComposer(page: Page) {
  await page.getByRole('button', { name: 'New issue' }).click();
  await expect(page.getByTestId('issue-composer-title-input')).toBeVisible();
}

export async function createIssueViaUi(page: Page, title: string) {
  await openIssueComposer(page);
  await page.getByTestId('issue-composer-title-input').fill(title);
  await expect(page.getByTestId('issue-composer-submit-button')).toBeEnabled();
  await page.getByTestId('issue-composer-submit-button').click();
  await expect(page.getByText(title, { exact: true })).toBeVisible();
}

export async function openIssueDetail(page: Page, issueTitle: string, workspaceSlug: string) {
  await page.getByText(issueTitle, { exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/${workspaceSlug}/issue/[A-Z]+-\\d+/`));
}

export async function selectMenuItem(page: Page, label: RegExp) {
  await page.getByRole('menuitemradio', { name: label }).click();
}

export async function getStoredSessionSnapshot(page: Page): Promise<StoredSessionSnapshot> {
  return page.evaluate(() => {
    const token = window.localStorage.getItem('token');
    const rawUser = window.localStorage.getItem('user');

    if (!token || !rawUser) {
      throw new Error('Missing stored auth session');
    }

    return {
      token,
      user: JSON.parse(rawUser) as { organizationId?: number | null },
    };
  });
}

export async function getIssueFromCurrentDetailRoute(page: Page, request: APIRequestContext) {
  const session = await getStoredSessionSnapshot(page);
  const url = new URL(page.url());
  const match = url.pathname.match(/\/issue\/([^/]+)\//);

  if (!match) {
    throw new Error(`Unable to extract issue identifier from URL: ${url.pathname}`);
  }

  const identifier = decodeURIComponent(match[1]);
  const organizationId = session.user.organizationId;
  if (!organizationId) {
    throw new Error('Missing organizationId in stored session');
  }

  const response = await request.get(`${apiBaseURL}/issues/by-identifier`, {
    headers: {
      Authorization: `Bearer ${session.token}`,
    },
    params: {
      organizationId,
      identifier,
    },
  });

  expect(response.ok(), `issue by identifier failed: ${response.status()} ${await response.text()}`).toBeTruthy();
  return response.json();
}

export async function updateCurrentIssueViaApi(
  page: Page,
  request: APIRequestContext,
  data: Record<string, unknown>,
) {
  const session = await getStoredSessionSnapshot(page);
  const issue = await getIssueFromCurrentDetailRoute(page, request);

  const response = await request.put(`${apiBaseURL}/issues/${issue.id}`, {
    headers: {
      Authorization: `Bearer ${session.token}`,
    },
    data,
  });

  expect(response.ok(), `update issue failed: ${response.status()} ${await response.text()}`).toBeTruthy();
  return response.json();
}
