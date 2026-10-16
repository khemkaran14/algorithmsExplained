// @vitest-environment node
import { expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { db } from '@/lib/db';
import { exportAccount, deleteAccount } from '@/account/server';
it.skipIf(!process.env.DATABASE_URL)(
  'exports only owned learning/profile fields and deletion cascades private data while anonymizing retained payments',
  async () => {
    const id = randomUUID(),
      other = randomUUID(),
      payment = randomUUID(),
      email = `privacy-${id}@example.com`;
    try {
      await db.user.create({
        data: {
          id,
          email,
          name: 'Public test learner',
          accounts: {
            create: {
              type: 'oauth',
              provider: 'fixture',
              providerAccountId: id,
              access_token: 'private-oauth-fixture',
              refresh_token: 'private-refresh-fixture',
            },
          },
          sessions: {
            create: {
              sessionToken: 'private-session-' + id,
              expires: new Date(Date.now() + 3600000),
            },
          },
          notes: {
            create: { lessonSlug: 'bubble-sort', text: 'owned learning note' },
          },
          progress: { create: { lessonSlug: 'bubble-sort' } },
          bookmarks: { create: { lessonSlug: 'bubble-sort' } },
          flashcards: {
            create: { lessonSlug: 'bubble-sort', questionId: 'q1' },
          },
          certificates: { create: { track: 'dsa' } },
          entitlements: { create: { source: 'fixture' } },
        },
      });
      await db.user.create({
        data: {
          id: other,
          email: `other-${other}@example.com`,
          notes: {
            create: {
              lessonSlug: 'bubble-sort',
              text: 'other account private note',
            },
          },
        },
      });
      await db.verificationToken.create({
        data: {
          identifier: email,
          token: 'private-magic-token-' + id,
          expires: new Date(Date.now() + 3600000),
        },
      });
      await db.payment.create({
        data: {
          id: payment,
          userId: id,
          receipt: 'privacy_' + id,
          amount: 19900,
          status: 'paid',
        },
      });
      const output = JSON.stringify(await exportAccount(id));
      expect(output).toContain('owned learning note');
      expect(output).not.toMatch(
        /private-oauth|private-refresh|private-session|private-magic|other account private note/,
      );
      await deleteAccount(id);
      expect(await db.user.findUnique({ where: { id } })).toBeNull();
      expect(await db.session.count({ where: { userId: id } })).toBe(0);
      expect(await db.account.count({ where: { userId: id } })).toBe(0);
      expect(await db.note.count({ where: { userId: id } })).toBe(0);
      expect(await db.certificate.count({ where: { userId: id } })).toBe(0);
      expect(await db.entitlement.count({ where: { userId: id } })).toBe(0);
      expect(
        await db.verificationToken.count({ where: { identifier: email } }),
      ).toBe(0);
      expect(
        await db.payment.findUnique({
          where: { id: payment },
          select: { status: true, userId: true },
        }),
      ).toEqual({ status: 'paid', userId: null });
      expect(
        await db.note.findFirst({ where: { userId: other } }),
      ).toMatchObject({ text: 'other account private note' });
    } finally {
      await db.verificationToken.deleteMany({ where: { identifier: email } });
      await db.payment.deleteMany({ where: { id: payment } });
      await db.user.deleteMany({ where: { id: { in: [id, other] } } });
    }
  },
);
