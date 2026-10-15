import { describe, it, expect } from 'vitest';
import {
  mergeProgress,
  learningStats,
  localSchema,
  type Progress,
} from '@/learning/progress';
import { scheduleReview } from '@/learning/sm2';
const first: Progress = {
  slug: 'bubble-sort',
  status: 'completed',
  lastFrame: 20,
  timeSpentSec: 90,
  quizScore: 100,
  completedAt: '2026-10-10T12:00:00.000Z',
  updatedAt: '2026-10-10T12:00:00.000Z',
};
describe('progress merging', () => {
  it('is idempotent and preserves completion and best scores across devices', () => {
    const older = {
      ...first,
      status: 'in-progress' as const,
      lastFrame: 2,
      timeSpentSec: 12,
      quizScore: 30,
      completedAt: null,
    };
    const merged = mergeProgress(
      { [first.slug]: first },
      { [first.slug]: older },
    );
    expect(merged[first.slug]).toMatchObject({
      status: 'completed',
      lastFrame: 20,
      timeSpentSec: 90,
      quizScore: 100,
      completedAt: first.completedAt,
    });
    expect(mergeProgress(merged, merged)).toEqual(merged);
  });
  it('rejects invalid persisted data rather than granting invented XP', () => {
    expect(
      localSchema.safeParse({
        version: 1,
        progress: { x: { ...first, quizScore: 999 } },
        library: {},
      }).success,
    ).toBe(false);
  });
  it('counts unique completed lessons and consecutive UTC dates', () => {
    const second = {
      ...first,
      slug: 'stack',
      completedAt: '2026-10-11T12:00:00.000Z',
    };
    const stats = learningStats(
      { a: first, b: second },
      new Date('2026-10-12T03:00:00Z'),
    );
    expect(stats).toMatchObject({
      completed: 2,
      xp: 240,
      streak: 2,
      minutes: 3,
    });
    expect(
      learningStats({ a: first, b: second }, new Date('2026-10-13T03:00:00Z'))
        .streak,
    ).toBe(0);
  });
});
it('SM-2 schedules successful recall and resets failed recall', () => {
  const now = new Date('2026-10-10T12:00:00Z');
  const first = scheduleReview(undefined, 4, now);
  expect(first.interval).toBe(1);
  const second = scheduleReview(first, 4, now);
  expect(second.interval).toBe(6);
  expect(scheduleReview(second, 0, now)).toMatchObject({
    repetitions: 0,
    interval: 1,
  });
  expect(scheduleReview({ ...second, ease: 1.3 }, 0, now).ease).toBe(1.3);
});
