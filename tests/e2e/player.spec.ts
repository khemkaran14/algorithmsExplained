import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('reversible playback and custom input work on a small screen', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/learn/dsa/sorting/bubble-sort');
  const output = page.getByLabel('Current frame');
  await expect(output).toContainText('1 /');
  await page.getByRole('button', { name: 'Step forward', exact: true }).click();
  await expect(output).toContainText('2 /');
  await page.getByRole('button', { name: 'Step back', exact: true }).click();
  await expect(output).toContainText('1 /');
  await page.getByLabel('Playback speed').selectOption('4');
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Pause', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await page.getByRole('button', { name: 'Restart', exact: true }).click();
  await page.getByLabel('Custom input').fill('[3,2,1]');
  await page.getByRole('button', { name: 'Load input' }).click();
  await page
    .getByLabel('Animation timeline')
    .fill(
      (await page.getByLabel('Animation timeline').getAttribute('max')) ?? '0',
    );
  await expect(
    page.getByLabel('Current values: 1, 2, 3', { exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
