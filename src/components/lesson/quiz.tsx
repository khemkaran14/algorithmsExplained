'use client';
import { useState } from 'react';
import type { QuizQuestion } from '@/content/load';
import { Button } from '@/components/ui/button';
import {
  updateProgress,
  syncLearning,
  useLearning,
  updateLibrary,
} from '@/learning/local';
export function Quiz({
  slug,
  questions,
}: {
  slug: string;
  questions: QuizQuestion[];
}) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState(() => crypto.randomUUID());
  const learning = useLearning();
  const score = Math.round(
    (questions.filter((q) => answers[q.id] === q.answer).length /
      questions.length) *
      100,
  );
  const passed = score >= 80;
  async function submit() {
    setSubmitted(true);
    if (passed)
      updateProgress(slug, {
        status: 'completed',
        quizScore: score,
        completedAt: new Date().toISOString(),
      });
    else updateProgress(slug, { quizScore: score });
    try {
      await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, answers, submissionId }),
      });
    } catch {}
    await syncLearning();
  }
  return (
    <section
      aria-labelledby="quiz-title"
      className="my-10 rounded-2xl border border-[var(--border)] p-5 sm:p-8"
    >
      <p className="mb-2 font-mono text-xs text-[var(--muted)]">
        MAKE IT STICK
      </p>
      <h2 id="quiz-title" className="mb-6 text-2xl font-semibold">
        Quick knowledge check
      </h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        className="space-y-6"
      >
        {questions.map((q, i) => (
          <fieldset key={q.id} disabled={submitted}>
            <legend className="mb-3 font-medium">
              {i + 1}. {q.question}
            </legend>
            <div className="grid gap-2">
              {q.choices.map((choice, j) => (
                <label
                  key={j}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border)] p-3 text-sm"
                >
                  <input
                    type="radio"
                    name={q.id}
                    required
                    value={j}
                    checked={answers[q.id] === j}
                    onChange={() => setAnswers((a) => ({ ...a, [q.id]: j }))}
                    className="mt-1 accent-lime-600"
                  />
                  <span>{choice}</span>
                </label>
              ))}
            </div>
            {submitted && (
              <p className="mt-3 text-sm" role="status">
                {answers[q.id] === q.answer ? '✓ Correct.' : '↺ Try again.'}{' '}
                {q.explanation}
              </p>
            )}
          </fieldset>
        ))}
        {submitted ? (
          <div role="status">
            <p className="mb-4 font-semibold">
              {score}% ·{' '}
              {passed
                ? 'Lesson completed! +' + (100 + Math.floor(score / 5)) + ' XP'
                : 'Reach 80% to complete this lesson.'}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSubmitted(false);
                setAnswers({});
                setSubmissionId(crypto.randomUUID());
              }}
            >
              Try quiz again
            </Button>
          </div>
        ) : (
          <Button disabled={Object.keys(answers).length < questions.length}>
            Check answers
          </Button>
        )}
      </form>
      <p className="mt-4 text-xs text-[var(--muted)]">
        Progress saves on this device and merges with your account after
        sign-in.{' '}
        {learning.progress[slug]?.status === 'completed' ? '✓ Completed' : ''}
      </p>
    </section>
  );
}
export function LessonNotebook({ slug }: { slug: string }) {
  const learning = useLearning(),
    entry = learning.library[slug];
  return (
    <section className="my-6 rounded-2xl border border-[var(--border)] p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Your notebook</h2>
        <Button
          variant="outline"
          onClick={() => {
            updateLibrary(slug, { bookmarked: !entry?.bookmarked });
            void syncLearning();
          }}
        >
          {entry?.bookmarked ? '★ Bookmarked' : '☆ Bookmark'}
        </Button>
      </div>
      <label className="text-sm" htmlFor={`note-${slug}`}>
        Private lesson notes
      </label>
      <textarea
        id={`note-${slug}`}
        maxLength={5000}
        value={entry?.note ?? ''}
        onChange={(e) => updateLibrary(slug, { note: e.target.value })}
        onBlur={() => void syncLearning()}
        placeholder="Write the idea you want to remember…"
        className="mt-2 min-h-32 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 text-sm"
      />
      <p className="mt-2 text-xs text-[var(--muted)]">
        {entry?.note.length ?? 0} / 5000 · Saved on this device; synced when
        signed in.
      </p>
    </section>
  );
}
