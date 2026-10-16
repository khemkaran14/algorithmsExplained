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

test('Cloud capstone couples identity, cache and capacity while paid Cloud access stays gated', async ({
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
  expect(
    (
      await request.post('/api/lessons/kms-cloud-kms/frames', {
        data: {},
        headers: { Origin: 'http://127.0.0.1:3000' },
      })
    ).status(),
  ).toBe(403);
  try {
    await db.user.create({
      data: {
        id,
        email: `cloud-${id}@example.com`,
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
    await page.goto('/learn/cloud/capstone/deploy-a-three-tier-app');
    await page.getByLabel('Cloud mapping', { exact: true }).selectOption('gcp');
    await page
      .getByLabel('App DB identity authorized', { exact: true })
      .uncheck();
    await page
      .getByLabel('Public catalog cache hit percent', { exact: true })
      .fill('0');
    await page.getByRole('button', { name: 'Load input', exact: true }).click();
    const timeline = page.getByLabel('Animation timeline');
    await timeline.fill((await timeline.getAttribute('max'))!);
    await expect(page.getByLabel('Algorithm result data')).toContainText(
      '"completed": 0',
    );
    await expect(page.getByLabel('Algorithm result data')).toContainText(
      '"provider": "gcp"',
    );
    await page
      .getByLabel('Public catalog cache hit percent', { exact: true })
      .fill('100');
    await page.getByRole('button', { name: 'Load input', exact: true }).click();
    await expect(timeline).toHaveValue('0');
    await timeline.fill((await timeline.getAttribute('max'))!);
    await expect(page.getByLabel('Algorithm result data')).toContainText(
      '"failed": 0',
    );
    await expect(page.getByLabel('Algorithm result data')).toContainText(
      '"completed": 96',
    );
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  } finally {
    await db.user.deleteMany({ where: { id } });
    await db.$disconnect();
  }
});
