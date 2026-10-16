import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('traffic controls change capacity, failure and cloud mapping through the protected player API', async ({
  page,
}) => {
  await page.goto('/learn/system-design/fundamentals/how-a-request-travels');
  await expect(page.getByLabel('Interactive lesson player')).toBeVisible();
  await page.getByLabel('Requests per second', { exact: true }).fill('40');
  await page.getByLabel('Break mode', { exact: true }).selectOption('database');
  await page.getByLabel('Failure second', { exact: true }).fill('0');
  await page.getByLabel('Cloud mapping', { exact: true }).selectOption('gcp');
  await page.getByRole('button', { name: 'Load input', exact: true }).click();
  await expect(page.getByLabel('Custom input', { exact: true })).toHaveValue(
    /"provider":"gcp"/,
  );
  await expect(
    page.getByText('Cloud SQL database · down', { exact: true }),
  ).toBeVisible();
  await page
    .getByLabel('Animation timeline')
    .fill((await page.getByLabel('Animation timeline').getAttribute('max'))!);
  await expect(page.getByLabel('Algorithm result data')).toContainText(
    '"conserved": true',
  );
  await expect(page.getByLabel('Algorithm result data')).toContainText(
    '"pending"',
  );
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
