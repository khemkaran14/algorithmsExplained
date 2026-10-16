import '@/lib/validation';
import { z } from 'zod';
export const progressSchema = z.object({
  slug: z.string().min(1).max(120),
  status: z.enum(['in-progress', 'completed']),
  lastFrame: z.number().int().min(0).max(30000),
  timeSpentSec: z.number().int().min(0).max(86400),
  quizScore: z.number().min(0).max(100),
  completedAt: z.string().datetime().nullable(),
  updatedAt: z.string().datetime(),
});
export type Progress = z.infer<typeof progressSchema>;
export type ProgressMap = Record<string, Progress>;
export const librarySchema = z.object({
  slug: z.string().min(1).max(120),
  bookmarked: z.boolean(),
  note: z.string().max(5000),
  updatedAt: z.string().datetime(),
});
export type LibraryEntry = z.infer<typeof librarySchema>;
export type LocalLearning = {
  version: 1;
  owner?: string | null;
  progress: ProgressMap;
  library: Record<string, LibraryEntry>;
};
export const localSchema = z.object({
  version: z.literal(1),
  owner: z.string().max(128).nullable().optional(),
  progress: z.record(z.string(), progressSchema),
  library: z.record(z.string(), librarySchema),
});
export const EMPTY: LocalLearning = { version: 1, progress: {}, library: {} };
export function mergeProgress(a: ProgressMap, b: ProgressMap): ProgressMap {
  const out = { ...a };
  for (const [key, next] of Object.entries(b)) {
    const old = out[key];
    if (!old) {
      out[key] = { ...next };
      continue;
    }
    const dates = [old.completedAt, next.completedAt]
      .filter((v): v is string => v !== null)
      .sort();
    out[key] = {
      ...old,
      ...next,
      status:
        old.status === 'completed' || next.status === 'completed'
          ? 'completed'
          : 'in-progress',
      lastFrame: Math.max(old.lastFrame, next.lastFrame),
      timeSpentSec: Math.max(old.timeSpentSec, next.timeSpentSec),
      quizScore: Math.max(old.quizScore, next.quizScore),
      completedAt: dates[0] ?? null,
      updatedAt: [old.updatedAt, next.updatedAt].sort().at(-1)!,
    };
  }
  return out;
}
export function mergeLibrary(
  a: LocalLearning['library'],
  b: LocalLearning['library'],
) {
  const out = { ...a };
  for (const [slug, next] of Object.entries(b))
    if (!out[slug] || next.updatedAt >= out[slug].updatedAt) out[slug] = next;
  return out;
}
export function learningStats(progress: ProgressMap, now = new Date()) {
  const completed = Object.values(progress).filter(
    (p) => p.status === 'completed',
  );
  const dates = new Set(
    completed.flatMap((p) =>
      p.completedAt ? [p.completedAt.slice(0, 10)] : [],
    ),
  );
  let streak = 0;
  const day = new Date(now);
  day.setUTCHours(0, 0, 0, 0);
  if (!dates.has(day.toISOString().slice(0, 10)))
    day.setUTCDate(day.getUTCDate() - 1);
  while (dates.has(day.toISOString().slice(0, 10))) {
    streak++;
    day.setUTCDate(day.getUTCDate() - 1);
  }
  const xp = completed.reduce(
    (n, p) => n + 100 + Math.floor(p.quizScore / 5),
    0,
  );
  return {
    completed: completed.length,
    xp,
    streak,
    minutes: Math.floor(
      Object.values(progress).reduce((n, p) => n + p.timeSpentSec, 0) / 60,
    ),
    badges: [
      ...(completed.length >= 1 ? ['First steps'] : []),
      ...(completed.length >= 5 ? ['Five for five'] : []),
      ...(streak >= 7 ? ['Seven-day spark'] : []),
    ],
  };
}
