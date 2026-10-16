import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('free service-model exercise applies real responsibility boundaries and a GCP mapping', async ({
  page,
}) => {
  await page.goto('/learn/cloud/basics/cloud-service-models');
  await page.getByLabel('Cloud mapping', { exact: true }).selectOption('gcp');
  await page
    .getByLabel('Cloud service model', { exact: true })
    .selectOption('saas');
  await page
    .getByLabel('Customer data-access policy configured', { exact: true })
    .check();
  await page.getByRole('button', { name: 'Load input', exact: true }).click();
  await expect(page.getByLabel('Custom input', { exact: true })).toHaveValue(
    /"provider":"gcp"/,
  );
  const timeline = page.getByLabel('Animation timeline');
  await timeline.fill((await timeline.getAttribute('max'))!);
  const result = page.getByLabel('Algorithm result data');
  await expect(result).toContainText('"service": "saas"');
  await expect(result).toContainText('"gaps": []');
  await expect(result).toContainText('"provider": "gcp"');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
