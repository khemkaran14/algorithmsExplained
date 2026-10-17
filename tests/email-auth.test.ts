// @vitest-environment node
import { createHash, randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

describe.skipIf(!process.env.DATABASE_URL)(
  'email callback token lifecycle (no email is sent)',
  () => {
    const secret = 'test-only-email-token-lifecycle-not-a-production-secret';
    let handlers: (typeof import('@/auth'))['handlers'];
    let db: PrismaClient;

    beforeAll(async () => {
      vi.stubEnv('AUTH_SECRET', secret);
      vi.stubEnv('AUTH_URL', 'http://127.0.0.1:3000');
      vi.stubEnv('AUTH_TRUST_HOST', 'true');
      vi.stubEnv('AUTH_RESEND_KEY', 'test-only-no-delivery');
      vi.stubEnv('AUTH_EMAIL_FROM', 'Test <test@example.invalid>');
      db = new PrismaClient({
        adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
      });
      handlers = (await import('@/auth')).handlers;
    });

    afterAll(async () => {
      await db?.$disconnect();
      vi.unstubAllEnvs();
    });

    it.each([false, true])(
      'rejects expired=%s tokens or consumes a valid token exactly once',
      async (expired) => {
        const id = randomUUID();
        const email = `email-auth-${id}@example.invalid`;
        const token = randomUUID();
        const hash = createHash('sha256')
          .update(`${token}${secret}`)
          .digest('hex');
        try {
          await db.user.create({ data: { id, email } });
          await db.verificationToken.create({
            data: {
              identifier: email,
              token: hash,
              expires: new Date(Date.now() + (expired ? -60000 : 60000)),
            },
          });
          const callback = () =>
            handlers.GET(
              new NextRequest(
                `http://127.0.0.1:3000/api/auth/callback/resend?${new URLSearchParams({ email, token, callbackUrl: '/learn' })}`,
              ),
            );
          const result = await callback();
          expect(result.status).toBe(302);
          expect(await db.session.count({ where: { userId: id } })).toBe(
            expired ? 0 : 1,
          );
          if (expired) {
            expect(result.headers.get('location')).toContain(
              'error=Verification',
            );
          } else {
            expect(result.headers.get('set-cookie')).toContain(
              'authjs.session-token=',
            );
            const replay = await callback();
            expect(replay.headers.get('location')).toContain(
              'error=Verification',
            );
            expect(await db.session.count({ where: { userId: id } })).toBe(1);
          }
        } finally {
          await db.verificationToken.deleteMany({
            where: { identifier: email },
          });
          await db.user.deleteMany({ where: { id } });
        }
      },
    );
  },
);
