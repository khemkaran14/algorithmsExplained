import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
test('account export and confirmed deletion are authenticated, same-origin and owner scoped', async ({
  page,
  context,
  request,
}) => {
  test.skip(!process.env.DATABASE_URL, 'Requires PostgreSQL.');
  const db = new PrismaClient({
      adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    }),
    id = randomUUID(),
    token = randomUUID();
  expect((await request.get('/api/account/export')).status()).toBe(401);
  try {
    await db.user.create({
      data: {
        id,
        email: `privacy-${id}@example.com`,
        sessions: {
          create: {
            sessionToken: token,
            expires: new Date(Date.now() + 3600000),
          },
        },
        notes: {
          create: {
            lessonSlug: 'bubble-sort',
            text: 'private owned fixture note',
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
    const exportResponse = await context.request.get('/api/account/export');
    expect(exportResponse.status()).toBe(200);
    expect(await exportResponse.text()).toContain('private owned fixture note');
    expect(exportResponse.headers()['content-disposition']).toContain(
      'attachment',
    );
    const wrong = await context.request.delete('/api/account', {
      data: { confirmation: 'DELETE MY ACCOUNT' },
      headers: { Origin: 'https://wrong.example' },
    });
    expect(wrong.status()).toBe(403);
    expect(await db.user.count({ where: { id } })).toBe(1);
    await page.goto('/account');
    await expect(
      page.getByRole('button', { name: 'Permanently delete account' }),
    ).toBeDisabled();
    await page
      .getByLabel('Type DELETE MY ACCOUNT', { exact: true })
      .fill('DELETE MY ACCOUNT');
    await page
      .getByRole('button', { name: 'Permanently delete account' })
      .click();
    await expect(page).toHaveURL('/');
    expect(await db.user.count({ where: { id } })).toBe(0);
    expect((await context.request.get('/api/account/export')).status()).toBe(
      401,
    );
  } finally {
    await db.user.deleteMany({ where: { id } });
    await db.$disconnect();
  }
});
