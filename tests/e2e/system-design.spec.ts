import { loadEnvFile } from 'node:process';
try {
  loadEnvFile('.env');
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
}
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

test('entitled gateway variant changes its real policy model and anonymous variant access stays blocked', async ({
  page,
  context,
  request,
}) => {
  test.skip(!process.env.DATABASE_URL, 'Requires PostgreSQL.');
  const { PrismaClient } = await import('@prisma/client'),
    { PrismaPg } = await import('@prisma/adapter-pg'),
    { randomUUID } = await import('node:crypto');
  const db = new PrismaClient({
      adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    }),
    id = randomUUID(),
    token = randomUUID();
  const url = '/api/lessons/reverse-proxy-api-gateway/frames';
  expect(
    (
      await request.post(url, {
        data: { variant: 'admission' },
        headers: { Origin: 'http://127.0.0.1:3000' },
      })
    ).status(),
  ).toBe(403);
  try {
    await db.user.create({
      data: {
        id,
        email: `gateway-${id}@example.com`,
        sessions: {
          create: {
            sessionToken: token,
            expires: new Date(Date.now() + 3600000),
          },
        },
        entitlements: { create: { source: 'e2e-only', type: 'ALL_ACCESS' } },
      },
    });
    await context.addCookies([
      {
        name: 'authjs.session-token',
        value: token,
        url: 'http://127.0.0.1:3000',
        httpOnly: true,
        sameSite: 'Lax',
      },
    ]);
    await page.goto(
      '/learn/system-design/building-blocks/reverse-proxy-api-gateway',
    );
    await page
      .getByLabel('Algorithm variant', { exact: true })
      .selectOption('admission');
    await expect(page.getByLabel('Rate policy', { exact: true })).toBeVisible();
    await page
      .getByLabel('Rate policy', { exact: true })
      .selectOption('sliding-log');
    await page.getByRole('button', { name: 'Load input', exact: true }).click();
    await page
      .getByLabel('Animation timeline')
      .fill((await page.getByLabel('Animation timeline').getAttribute('max'))!);
    await expect(page.getByLabel('Algorithm result data')).toContainText(
      '"allowed"',
    );
    await page
      .getByLabel('Algorithm variant', { exact: true })
      .selectOption('default');
    await expect(
      page.getByLabel('Requests per second', { exact: true }),
    ).toBeVisible();
  } finally {
    await db.user.deleteMany({ where: { id } });
    await db.$disconnect();
  }
});

test('case study exposes editable estimates, progressive architecture and URL failure controls', async ({
  page,
}) => {
  await page.goto('/learn/system-design/case-studies/url-shortener');
  const overview = page.getByRole('region', { name: 'System design exercise' });
  await expect(overview).toBeVisible();
  await page.getByLabel('Daily actors', { exact: true }).fill('86400');
  await page.getByLabel('Requests per actor/day', { exact: true }).fill('1');
  await expect(overview).toContainText('86,400');
  await expect(overview).toContainText('1.00');
  await expect(
    page.getByText('Create / redirect client', { exact: true }),
  ).toBeVisible();
  await page.getByLabel('Lose delete invalidation', { exact: true }).check();
  await page.getByRole('button', { name: 'Load input', exact: true }).click();
  const timeline = page.getByLabel('Animation timeline');
  await timeline.fill((await timeline.getAttribute('max'))!);
  await expect(page.getByLabel('Algorithm result data')).toContainText(
    'history',
  );
  const violations = await new AxeBuilder({ page }).analyze();
  expect(violations.violations).toEqual([]);
});
