import { z } from 'zod';
import { api, json, readJson, requireSameOrigin, ApiError } from '@/lib/http';
import { requireUser } from '@/lib/user';
import { db } from '@/lib/db';
import { catalog } from '@/content/catalog';
import { loadQuiz } from '@/content/load';
import { mergeLearning } from '@/learning/server';
const schema = z.object({
  slug: z.string().min(1).max(120),
  answers: z.record(z.string().max(80), z.number().int().min(0).max(32)),
  submissionId: z.uuid(),
});
export async function POST(request: Request) {
  return api(async () => {
    requireSameOrigin(request);
    const user = await requireUser();
    const input = schema.parse(await readJson(request));
    const meta = catalog.find((l) => l.slug === input.slug);
    if (!meta || meta.status === 'planned')
      throw new ApiError(404, 'Lesson not found.');
    if (
      !meta.isFree &&
      !(await db.entitlement.findFirst({
        where: { userId: user.id, type: 'ALL_ACCESS', revokedAt: null },
      }))
    )
      throw new ApiError(403, 'Unlock this lesson to take its quiz.');
    const questions = await loadQuiz(meta);
    if (
      Object.keys(input.answers).some(
        (id) => !questions.some((q) => q.id === id),
      )
    )
      throw new ApiError(400, 'Unknown quiz question.');
    const score = Math.round(
      (questions.filter((q) => input.answers[q.id] === q.answer).length /
        questions.length) *
        100,
    );
    const attempt = await db.quizAttempt.upsert({
      where: {
        userId_submissionId: {
          userId: user.id,
          submissionId: input.submissionId,
        },
      },
      create: {
        userId: user.id,
        lessonSlug: meta.slug,
        submissionId: input.submissionId,
        answers: input.answers,
        score,
      },
      update: {},
    });
    if (attempt.lessonSlug !== meta.slug)
      throw new ApiError(
        409,
        'Submission identifier already belongs to another quiz.',
      );
    const now = new Date().toISOString();
    await mergeLearning(user.id, {
      version: 1,
      progress: {
        [meta.slug]: {
          slug: meta.slug,
          status: attempt.score >= 80 ? 'completed' : 'in-progress',
          lastFrame: 0,
          timeSpentSec: 0,
          quizScore: attempt.score,
          completedAt: attempt.score >= 80 ? now : null,
          updatedAt: now,
        },
      },
      library: {},
    });
    return json({ score: attempt.score, passed: attempt.score >= 80 });
  });
}
