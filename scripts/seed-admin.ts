import { loadEnvFile } from 'node:process';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { z } from 'zod';
try {
  loadEnvFile('.env');
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
}
async function main() {
  const email = z.email().max(254).safeParse(process.env.ADMIN_EMAIL?.trim());
  if (!email.success)
    throw new Error(
      'Set ADMIN_EMAIL to an existing account address before running this command.',
    );
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  try {
    const users = await db.user.findMany({
      where: { email: { equals: email.data, mode: 'insensitive' } },
      select: { id: true },
      take: 2,
    });
    if (users.length !== 1)
      throw new Error(
        'Exactly one existing account must match ADMIN_EMAIL; sign in first and resolve ambiguous addresses.',
      );
    await db.user.update({
      where: { id: users[0].id },
      data: { role: 'admin' },
    });
    console.log('Administrator role assigned to one existing account.');
  } finally {
    await db.$disconnect();
  }
}
main().catch(() => {
  console.error(
    'Admin seed failed. Check ADMIN_EMAIL, the existing account and database configuration. No account was created.',
  );
  process.exitCode = 1;
});
