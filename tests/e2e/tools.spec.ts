import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('search filters curriculum and returns focus after closing', async ({
  page,
}) => {
  await page.goto('/learn');
  await page
    .getByRole('button', { name: 'Search lessons (Ctrl or Command K)' })
    .click();
  const dialog = page.getByRole('dialog', { name: 'Find a lesson' });
  await expect(dialog).toBeVisible();
  await page
    .getByLabel('Search title, concept or tag')
    .fill('track:dsa bubble');
  await expect(
    dialog.getByRole('link', { name: /Bubble sort/i }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Search lessons (Ctrl or Command K)' }),
  ).toBeFocused();
});
test('playground validates input and runs without recording lesson progress', async ({
  page,
}) => {
  await page.goto('/playground');
  await page.getByRole('radio', { name: 'Bubble Sort' }).check();
  await page.getByLabel('Shared JSON input').fill('[3,1,2]');
  await page.getByRole('button', { name: 'Run algorithms' }).click();
  await expect(page.getByLabel('Interactive lesson player')).toBeVisible();
  await page.getByRole('button', { name: 'Step forward', exact: true }).click();
  const progress = await page.evaluate(
    () =>
      JSON.parse(
        localStorage.getItem('algoverse.learning.v1') ?? '{"progress":{}}',
      ).progress,
  );
  expect(progress['bubble-sort']).toBeUndefined();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
test('comparison shares input, scrubs both traces and refuses paid selection', async ({
  page,
}) => {
  await page.goto('/compare');
  await page.getByLabel('Shared JSON input').fill('[3,1,2]');
  await page.getByRole('button', { name: 'Run algorithms' }).click();
  const section = page.getByLabel('Synchronized comparison');
  await expect(section).toBeVisible();
  await expect(
    section.getByRole('heading', { name: 'Bubble Sort' }),
  ).toBeVisible();
  await expect(
    section.getByRole('heading', { name: 'Insertion Sort' }),
  ).toBeVisible();
  await section.getByRole('slider', { name: 'Comparison step' }).fill('4');
  await expect(section.getByText('5/', { exact: false })).toBeVisible();
  await page.getByRole('checkbox', { name: 'Merge Sort · All Access' }).check();
  await page.getByRole('button', { name: 'Run algorithms' }).click();
  await expect(
    page.getByText('Unlock all selected algorithms before comparing them.', {
      exact: true,
    }),
  ).toHaveText('Unlock all selected algorithms before comparing them.');
});

test('visual graph builder loads BFS input and the free cheat sheet filters algorithms', async ({
  page,
}) => {
  await page.goto('/playground');
  await page.getByText('Build a graph visually', { exact: true }).click();
  await page.getByLabel('Graph vertex count').fill('4');
  await page
    .getByRole('button', { name: 'Use graph in BFS', exact: true })
    .click();
  await expect(page.getByLabel('Shared JSON input')).toHaveValue(/"n":4/);
  await page
    .getByRole('button', { name: 'Run algorithms', exact: true })
    .click();
  await expect(page.getByLabel('Interactive lesson player')).toBeVisible();
  await page
    .getByLabel('Animation timeline')
    .fill((await page.getByLabel('Animation timeline').getAttribute('max'))!);
  await expect(page.getByLabel('Algorithm result data')).toContainText(
    'distance',
  );
  await page.goto('/cheatsheet');
  await page.getByLabel('Search algorithms').fill('bubble');
  await expect(
    page.getByRole('link', { name: 'Bubble sort', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('status')).toHaveText('1 algorithms');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
