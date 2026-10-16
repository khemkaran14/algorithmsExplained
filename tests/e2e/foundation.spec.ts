import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('landing, theme, accessible navigation and honest auth state', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Big ideas. Made visible.',
  );
  await expect(page.locator('#tracks').getByRole('link')).toHaveCount(4);
  await expect(page.getByText(/coming soon|arrives in phase/i)).toHaveCount(0);
  await page
    .getByRole('link', { name: 'Start your first free lesson' })
    .click();
  await expect(page).toHaveURL(/\/learn\/dsa\/sorting\/bubble-sort$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Bubble');
  await page.goto('/');
  await page.getByRole('button', { name: 'Toggle color theme' }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole('link', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('status')).toContainText(
    'Sign-in is not configured',
  );
});
test('private account redirects anonymous visitors', async ({ page }) => {
  await page.goto('/account');
  await expect(page).toHaveURL(/sign-in/);
});
test('320px layout has no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 667 });
  await page.goto('/');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
