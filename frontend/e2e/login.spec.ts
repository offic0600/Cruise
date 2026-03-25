import { expect, test } from '@playwright/test';
import { loginViaPassword, registerUser } from './support/app';

test('password login sends a first-time user to create workspace', async ({ page, request }) => {
  const user = await registerUser(request);

  await loginViaPassword(page, user);

  await expect(page).toHaveURL(/\/create-workspace$/);
  await expect(page.getByTestId('create-workspace-name-input')).toBeVisible();
});
