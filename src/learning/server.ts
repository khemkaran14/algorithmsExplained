import 'server-only';
import { db } from '@/lib/db';
import { catalog } from '@/content/catalog';
import {
  mergeProgress,
  learningStats,
  type LocalLearning,
  type ProgressMap,
} from './progress';
export async function getLearning(userId: string): Promise<LocalLearning> {
  const [rows, notes, bookmarks] = await Promise.all([
    db.lessonProgress.findMany({ where: { userId } }),
    db.note.findMany({ where: { userId } }),
    db.bookmark.findMany({ where: { userId } }),
  ]);
  const progress: ProgressMap = {};
  for (const row of rows)
    progress[row.lessonSlug] = {
      slug: row.lessonSlug,
      status: row.status === 'completed' ? 'completed' : 'in-progress',
      lastFrame: row.lastFrame,
      timeSpentSec: row.timeSpentSec,
      quizScore: row.quizScore,
      completedAt: row.completedAt?.toISOString() ?? null,
      updatedAt: row.updatedAt.toISOString(),
    };
  const library: LocalLearning['library'] = {};
  for (const note of notes)
    library[note.lessonSlug] = {
      slug: note.lessonSlug,
      bookmarked: bookmarks.some((b) => b.lessonSlug === note.lessonSlug),
      note: note.text,
      updatedAt: note.updatedAt.toISOString(),
    };
  return { version: 1, progress, library, owner: userId };
}
export async function mergeLearning(userId: string, incoming: LocalLearning) {
  await db.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${userId}))`;
    const entitlement = await tx.entitlement.findFirst({
      where: { userId, type: 'ALL_ACCESS', revokedAt: null },
    });
    const allowed = new Set(
      catalog.filter((l) => l.isFree || entitlement).map((l) => l.slug),
    );
    const savedRows = await tx.lessonProgress.findMany({ where: { userId } });
    const old: ProgressMap = {};
    for (const row of savedRows)
      old[row.lessonSlug] = {
        slug: row.lessonSlug,
        status: row.status === 'completed' ? 'completed' : 'in-progress',
        lastFrame: row.lastFrame,
        timeSpentSec: row.timeSpentSec,
        quizScore: row.quizScore,
        completedAt: row.completedAt?.toISOString() ?? null,
        updatedAt: row.updatedAt.toISOString(),
      };
    const filtered: ProgressMap = {};
    const now = new Date().toISOString();
    for (const [slug, p] of Object.entries(incoming.progress))
      if (allowed.has(slug) && p.slug === slug)
        filtered[slug] = {
          ...p,
          completedAt:
            p.completedAt && p.completedAt <= now
              ? p.completedAt
              : p.status === 'completed'
                ? now
                : null,
          updatedAt: p.updatedAt <= now ? p.updatedAt : now,
        };
    const merged = mergeProgress(old, filtered);
    for (const slug of Object.keys(filtered)) {
      const value = merged[slug];
      await tx.lessonProgress.upsert({
        where: { userId_lessonSlug: { userId, lessonSlug: slug } },
        create: { userId, lessonSlug: slug, ...withoutSlug(value) },
        update: withoutSlug(value),
      });
      if (value.status === 'completed')
        await tx.xpEvent.upsert({
          where: { userId_source: { userId, source: `lesson:${slug}` } },
          create: {
            userId,
            source: `lesson:${slug}`,
            amount: 100 + Math.floor(value.quizScore / 5),
          },
          update: { amount: 100 + Math.floor(value.quizScore / 5) },
        });
    }
    for (const [slug, entry] of Object.entries(incoming.library)) {
      if (!allowed.has(slug) || entry.slug !== slug) continue;
      const existing = await tx.note.findUnique({
        where: { userId_lessonSlug: { userId, lessonSlug: slug } },
      });
      const updatedAt = new Date(
        entry.updatedAt <= now ? entry.updatedAt : now,
      );
      if (existing && existing.updatedAt > updatedAt) continue;
      await tx.note.upsert({
        where: { userId_lessonSlug: { userId, lessonSlug: slug } },
        create: { userId, lessonSlug: slug, text: entry.note, updatedAt },
        update: { text: entry.note, updatedAt },
      });
      if (entry.bookmarked)
        await tx.bookmark.upsert({
          where: { userId_lessonSlug: { userId, lessonSlug: slug } },
          create: { userId, lessonSlug: slug },
          update: {},
        });
      else
        await tx.bookmark.deleteMany({ where: { userId, lessonSlug: slug } });
    }
    const stats = learningStats(merged);
    const prior = await tx.streak.findUnique({ where: { userId } });
    await tx.streak.upsert({
      where: { userId },
      create: {
        userId,
        current: stats.streak,
        longest: stats.streak,
        lastDay: now.slice(0, 10),
      },
      update: {
        current: stats.streak,
        longest: Math.max(prior?.longest ?? 0, stats.streak),
        lastDay: now.slice(0, 10),
      },
    });
    for (const name of stats.badges) {
      const badge = await tx.badge.upsert({
        where: { code: name },
        create: { code: name, name },
        update: {},
      });
      await tx.userBadge.upsert({
        where: { userId_badgeId: { userId, badgeId: badge.id } },
        create: { userId, badgeId: badge.id },
        update: {},
      });
    }
  });
  return getLearning(userId);
}
function withoutSlug(p: import('./progress').Progress) {
  return {
    status: p.status,
    lastFrame: p.lastFrame,
    timeSpentSec: p.timeSpentSec,
    quizScore: p.quizScore,
    completedAt: p.completedAt ? new Date(p.completedAt) : null,
  };
}
