import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

test('expired sessions cannot read private account or learning data', async ({
  page,
  context,
}) => {
  test.skip(!process.env.DATABASE_URL, 'Requires PostgreSQL.');
  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  const id = randomUUID(),
    token = randomUUID();
  try {
    await db.user.create({
      data: {
        id,
        email: `expired-${id}@example.com`,
        sessions: {
          create: {
            sessionToken: token,
            expires: new Date(Date.now() - 60000),
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
    const identity = await context.request.get('/api/session-state');
    expect(await identity.json()).toEqual({ owner: null });
    expect(identity.headers()['cache-control']).toContain('no-store');
    expect((await context.request.get('/api/progress')).status()).toBe(401);
    await page.goto('/account');
    await expect(page).toHaveURL(/\/sign-in$/);
  } finally {
    await db.user.deleteMany({ where: { id } });
    await db.$disconnect();
  }
});

test('sign-out revokes the database session and clears browser learning', async ({
  page,
  context,
}) => {
  test.skip(!process.env.DATABASE_URL, 'Requires PostgreSQL.');
  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  const id = randomUUID(),
    token = randomUUID();
  try {
    await db.user.create({
      data: {
        id,
        email: `logout-${id}@example.com`,
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
    await expect(
      page.getByRole('link', { name: 'My account', exact: true }),
    ).toBeVisible();
    await page.evaluate(() =>
      localStorage.setItem('algoverse.reviews.v1', '{}'),
    );
    await page.getByRole('button', { name: 'Sign out', exact: true }).click();
    await expect(page).toHaveURL('http://127.0.0.1:3000/');
    expect(
      await db.session.findUnique({ where: { sessionToken: token } }),
    ).toBeNull();
    expect(
      await page.evaluate(() => localStorage.getItem('algoverse.reviews.v1')),
    ).toBeNull();
    expect(
      await (await context.request.get('/api/session-state')).json(),
    ).toEqual({ owner: null });
    await page.goto('/account');
    await expect(page).toHaveURL(/\/sign-in$/);
  } finally {
    await db.user.deleteMany({ where: { id } });
    await db.$disconnect();
  }
});

test('switching accounts does not display or upload the previous account notebook', async ({
  page,
  context,
}) => {
  test.skip(!process.env.DATABASE_URL, 'Requires PostgreSQL.');
  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  const a = randomUUID(),
    b = randomUUID(),
    token = randomUUID();
  try {
    await db.user.create({
      data: { id: a, email: `switch-a-${a}@example.com` },
    });
    await db.user.create({
      data: {
        id: b,
        email: `switch-b-${b}@example.com`,
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
    await page.addInitScript((owner) => {
      localStorage.setItem(
        'algoverse.learning.v1',
        JSON.stringify({
          version: 1,
          owner,
          progress: {},
          library: {
            'bubble-sort': {
              slug: 'bubble-sort',
              bookmarked: true,
              note: 'previous-account-private-note',
              updatedAt: new Date().toISOString(),
            },
          },
        }),
      );
    }, a);
    await page.goto('/learn');
    await expect
      .poll(async () =>
        page.evaluate(
          () =>
            JSON.parse(localStorage.getItem('algoverse.learning.v1') ?? 'null')
              ?.owner,
        ),
      )
      .toBe(b);
    await expect(
      page.getByText('previous-account-private-note', { exact: true }),
    ).toHaveCount(0);
    expect(await db.note.count({ where: { userId: b } })).toBe(0);
    const state = await page.evaluate(() =>
      localStorage.getItem('algoverse.learning.v1'),
    );
    expect(state).not.toContain('previous-account-private-note');
  } finally {
    await db.user.deleteMany({ where: { id: { in: [a, b] } } });
    await db.$disconnect();
  }
});
