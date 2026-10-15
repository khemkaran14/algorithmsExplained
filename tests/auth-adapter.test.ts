// @vitest-environment node
import { randomUUID } from 'node:crypto';
import { describe, it, expect } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { PrismaAdapter } from '@auth/prisma-adapter';

describe.skipIf(!process.env.DATABASE_URL)('Auth.js PostgreSQL adapter', () => {
  it('persists and revokes sessions and consumes magic-link tokens once', async () => {
    const db = new PrismaClient();
    const adapter = PrismaAdapter(db);
    const email = `test-${randomUUID()}@example.com`;
    let userId: string | undefined;
    try {
      const user = await adapter.createUser!({
        id: randomUUID(),
        email,
        emailVerified: null,
      });
      userId = user.id;
      const sessionToken = randomUUID();
      await adapter.createSession!({
        userId: user.id,
        sessionToken,
        expires: new Date(Date.now() + 60000),
      });
      const saved = await adapter.getSessionAndUser!(sessionToken);
      expect(saved?.user.email).toBe(email);
      await adapter.deleteSession!(sessionToken);
      expect(await adapter.getSessionAndUser!(sessionToken)).toBeNull();
      const token = {
        identifier: email,
        token: randomUUID(),
        expires: new Date(Date.now() + 60000),
      };
      await adapter.createVerificationToken!(token);
      expect(
        await adapter.useVerificationToken!({
          identifier: email,
          token: token.token,
        }),
      ).toMatchObject(token);
      expect(
        await adapter.useVerificationToken!({
          identifier: email,
          token: token.token,
        }),
      ).toBeNull();
    } finally {
      await db.verificationToken.deleteMany({ where: { identifier: email } });
      if (userId) await db.user.delete({ where: { id: userId } });
      await db.$disconnect();
    }
  });
});
