// @vitest-environment node
import { expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
import { db } from '@/lib/db';
import { adminFilters, adminOverview } from '@/admin/overview';
it('rejects unbounded or unsupported admin filters', () => {
  expect(adminFilters.safeParse({ usersPage: -1 }).success).toBe(false);
  expect(adminFilters.safeParse({ usersPage: '1000000000' }).success).toBe(
    false,
  );
  expect(adminFilters.safeParse({ status: 'anything' }).success).toBe(false);
  expect(adminFilters.safeParse({ q: 'a'.repeat(101) }).success).toBe(false);
});
it.skipIf(!process.env.DATABASE_URL)(
  'paginates matching records stably and seeds only an existing explicitly selected account',
  async () => {
    const prefix = 'adm-' + randomUUID(),
      ids = Array.from({ length: 26 }, () => randomUUID());
    try {
      await db.user.createMany({
        data: ids.map((id, i) => ({ id, email: `${prefix}-${i}@example.com` })),
      });
      const first = await adminOverview(adminFilters.parse({ q: prefix })),
        second = await adminOverview(
          adminFilters.parse({ q: prefix, usersPage: 2 }),
        );
      expect(first.userCount).toBe(26);
      expect(first.users).toHaveLength(25);
      expect(second.users).toHaveLength(1);
      expect(
        new Set([...first.users, ...second.users].map((u) => u.id)).size,
      ).toBe(26);
      expect(first.content.ratio).toBeGreaterThanOrEqual(18);
      expect(first.content.ratio).toBeLessThanOrEqual(22);
      await promisify(execFile)(
        process.execPath,
        ['--import', 'tsx', 'scripts/seed-admin.ts'],
        {
          env: {
            ...process.env,
            ADMIN_EMAIL: `${prefix.toUpperCase()}-0@EXAMPLE.COM`,
          },
          timeout: 20000,
        },
      );
      expect(
        await db.user.findUnique({
          where: { id: ids[0] },
          select: { role: true },
        }),
      ).toEqual({ role: 'admin' });
      await expect(
        promisify(execFile)(
          process.execPath,
          ['--import', 'tsx', 'scripts/seed-admin.ts'],
          {
            env: {
              ...process.env,
              ADMIN_EMAIL: `missing-${prefix}@example.com`,
            },
            timeout: 20000,
          },
        ),
      ).rejects.toThrow();
      expect(
        await db.user.count({
          where: { email: `missing-${prefix}@example.com` },
        }),
      ).toBe(0);
    } finally {
      await db.user.deleteMany({ where: { id: { in: ids } } });
    }
  },
  60000,
);
