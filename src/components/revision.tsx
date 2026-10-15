'use client';
import { useEffect, useState } from 'react';
import { scheduleReview, type ReviewState } from '@/learning/sm2';
import { Button } from './ui/button';
type Card = {
  id: string;
  slug: string;
  question: string;
  answer: string;
  explanation: string;
};
export function Revision({ cards }: { cards: Card[] }) {
  const [reviews, setReviews] = useState<Record<string, ReviewState>>({});
  const [ready, setReady] = useState(false);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    try {
      const raw = JSON.parse(
        localStorage.getItem('algoverse.reviews.v1') ?? '{}',
      ) as Record<string, ReviewState>;
      const safe: Record<string, ReviewState> = {};
      for (const [key, value] of Object.entries(raw))
        if (
          value &&
          Number.isFinite(value.ease) &&
          Number.isFinite(value.interval) &&
          Number.isFinite(value.repetitions) &&
          typeof value.due === 'string' &&
          Number.isFinite(Date.parse(value.due))
        )
          safe[key] = value;
      setReviews(safe);
    } catch {}
    setReady(true);
  }, []);
  const now = new Date(),
    due = cards.filter(
      (c) => !reviews[c.id] || reviews[c.id].due <= now.toISOString(),
    );
  const card = due[0];
  function rate(quality: 0 | 3 | 4 | 5) {
    if (!card) return;
    const next = {
      ...reviews,
      [card.id]: scheduleReview(reviews[card.id], quality),
    };
    setReviews(next);
    try {
      localStorage.setItem('algoverse.reviews.v1', JSON.stringify(next));
    } catch {}
    setRevealed(false);
  }
  if (!ready) return <p role="status">Loading review schedule…</p>;
  return (
    <section className="rounded-2xl border border-[var(--border)] p-6">
      <p className="mb-6 font-mono text-xs text-[var(--muted)]">
        {due.length} CARDS DUE
      </p>
      {card ? (
        <>
          <h2 className="text-2xl font-medium">{card.question}</h2>
          {revealed ? (
            <>
              <p className="mt-6 font-semibold">{card.answer}</p>
              <p className="my-4 text-sm text-[var(--muted)]">
                {card.explanation}
              </p>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    [0, 'Again'],
                    [3, 'Hard'],
                    [4, 'Good'],
                    [5, 'Easy'],
                  ] as const
                ).map(([q, label]) => (
                  <Button key={q} variant="outline" onClick={() => rate(q)}>
                    {label}
                  </Button>
                ))}
              </div>
            </>
          ) : (
            <Button className="mt-8" onClick={() => setRevealed(true)}>
              Reveal answer
            </Button>
          )}
        </>
      ) : (
        <p>All caught up. Your next review will appear when it is due.</p>
      )}
    </section>
  );
}
