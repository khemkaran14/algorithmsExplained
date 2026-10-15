import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { randomUUID } from 'node:crypto';
import { loadEnvFile } from 'node:process';
try {
  loadEnvFile('.env');
} catch {}
test('anonymous completion merges into an authenticated database session without duplicate XP', async ({
  page,
  context,
}) => {
  test.skip(
    !process.env.DATABASE_URL,
    'Requires the local PostgreSQL service.',
  );
  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  const id = randomUUID(),
    token = randomUUID();
  try {
    await page.goto('/learn/dsa/sorting/bubble-sort');
    await page.getByRole('radio', { name: 'O(n²)', exact: true }).check();
    await page
      .getByRole('radio', { name: 'Compare neighboring values.', exact: true })
      .check();
    await page
      .getByRole('radio', {
        name: 'Do not use it for large random arrays; quadratic comparisons dominate.',
        exact: true,
      })
      .check();
    await page.getByRole('button', { name: 'Check answers' }).click();
    await expect(page.getByText(/100% · Lesson completed/)).toBeVisible();
    await page
      .getByLabel('Private lesson notes')
      .fill('Compare neighbors and stop after a clean pass.');
    await page.getByLabel('Private lesson notes').blur();
    await db.user.create({
      data: {
        id,
        email: `learning-${id}@example.com`,
        sessions: {
          create: {
            sessionToken: token,
            expires: new Date(Date.now() + 3600000),
          },
        },
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
    await page.goto('/account');
    await expect(page.getByText('Account progress is synced.')).toBeVisible();
    await expect
      .poll(
        async () =>
          await db.lessonProgress.count({
            where: {
              userId: id,
              status: 'completed',
              lessonSlug: 'bubble-sort',
            },
          }),
      )
      .toBe(1);
    await page.reload();
    await expect(page.getByText('Account progress is synced.')).toBeVisible();
    expect(
      await db.xpEvent.count({
        where: { userId: id, source: 'lesson:bubble-sort' },
      }),
    ).toBe(1);
    expect(
      (
        await db.note.findFirst({
          where: { userId: id, lessonSlug: 'bubble-sort' },
        })
      )?.text,
    ).toContain('Compare neighbors');
  } finally {
    await db.user.deleteMany({ where: { id } });
    await db.$disconnect();
  }
});
test('Try mode validates the actual next move and gives a hint', async ({
  page,
}) => {
  await page.goto('/learn/dsa/sorting/bubble-sort');
  await page.getByRole('button', { name: 'Try it yourself' }).click();
  await page.getByRole('button', { name: 'Find next challenge' }).click();
  await page.getByRole('button', { name: 'Keep', exact: true }).click();
  await expect(page.getByText(/Not yet. Swap only/)).toBeVisible();
  await page.getByRole('button', { name: 'Swap', exact: true }).click();
  await expect(
    page.getByText('✓ Correct. Watch what happens next.'),
  ).toBeVisible();
});
