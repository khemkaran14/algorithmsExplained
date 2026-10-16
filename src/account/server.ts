import 'server-only';
import { db } from '@/lib/db';
/** Explicit export allowlist excludes OAuth credentials, sessions and verification tokens. */
export async function exportAccount(userId: string) {
  const profile = await db.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      progress: true,
      quizAttempts: {
        select: {
          lessonSlug: true,
          answers: true,
          score: true,
          createdAt: true,
        },
      },
      bookmarks: { select: { lessonSlug: true } },
      notes: { select: { lessonSlug: true, text: true, updatedAt: true } },
      streak: { select: { current: true, longest: true, lastDay: true } },
      xpEvents: { select: { source: true, amount: true, createdAt: true } },
      badges: {
        select: {
          grantedAt: true,
          badge: { select: { code: true, name: true } },
        },
      },
      certificates: {
        select: { id: true, track: true, issuedAt: true, revokedAt: true },
      },
      flashcards: {
        select: {
          lessonSlug: true,
          questionId: true,
          interval: true,
          repetitions: true,
          ease: true,
          due: true,
        },
      },
      entitlements: {
        select: { type: true, source: true, grantedAt: true, revokedAt: true },
      },
      payments: {
        select: {
          receipt: true,
          amount: true,
          currency: true,
          status: true,
          createdAt: true,
          paidAt: true,
          refundedAt: true,
        },
      },
    },
  });
  return {
    format: 'algoverse-account-v1',
    exportedAt: new Date().toISOString(),
    profile,
  };
}
export async function deleteAccount(userId: string) {
  await db.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${userId}))`;
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    if (user?.email)
      await tx.verificationToken.deleteMany({
        where: { identifier: user.email },
      });
    // Schema cascades private learning/auth data; payment.userId becomes NULL for reconciliation.
    await tx.user.delete({ where: { id: userId } });
  });
}
