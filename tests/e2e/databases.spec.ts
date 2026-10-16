import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('free relational model reports real primary and foreign-key violations', async ({
  page,
}) => {
  await page.goto('/learn/databases/principles/relational-model-keys');
  await page.getByLabel('Custom input', { exact: true }).fill(
    JSON.stringify({
      customers: [
        { id: 1, name: 'Asha' },
        { id: 1, name: 'Duplicate' },
      ],
      orders: [{ id: 1, customerId: 9, amount: 2 }],
      enforceConstraints: true,
    }),
  );
  await page.getByRole('button', { name: 'Load input', exact: true }).click();
  await expect(page.getByLabel('Custom input', { exact: true })).toHaveValue(
    /"join":"left"/,
  );
  const timeline = page.getByLabel('Animation timeline');
  await timeline.fill((await timeline.getAttribute('max'))!);
  const result = page.getByLabel('Algorithm result data');
  await expect(result).toContainText('"accepted": false');
  await expect(result).toContainText('Duplicate Customer.id 1');
  await expect(result).toContainText('Orphan Order.customerId 9');
});
test('free normalization distinguishes 3NF from BCNF and remains accessible', async ({
  page,
}) => {
  await page.goto('/learn/databases/principles/normalization-1nf-to-bcnf');
  await page.getByLabel('Custom input', { exact: true }).fill(
    JSON.stringify({
      attributes: ['A', 'B', 'C'],
      dependencies: [
        { left: ['A', 'B'], right: ['C'] },
        { left: ['C'], right: ['B'] },
      ],
      atomicCells: true,
    }),
  );
  await page.getByRole('button', { name: 'Load input', exact: true }).click();
  await expect(page.getByLabel('Custom input', { exact: true })).toHaveValue(
    /"atomicCells":true/,
  );
  const timeline = page.getByLabel('Animation timeline');
  await timeline.fill((await timeline.getAttribute('max'))!);
  const result = page.getByLabel('Algorithm result data');
  await expect(result).toContainText('"third": true');
  await expect(result).toContainText('"bcnf": false');
  await expect(result).toContainText('candidateKeys');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
