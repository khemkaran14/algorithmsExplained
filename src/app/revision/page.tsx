import { catalog } from '@/content/catalog';
import { loadLesson } from '@/content/load';
import { Revision } from '@/components/revision';
export const metadata = { title: 'Spaced repetition' };
export default async function RevisionPage() {
  const cards = [];
  for (const meta of catalog.filter((l) => l.isFree)) {
    const { quiz } = await loadLesson(meta);
    cards.push(
      ...quiz.map((q) => ({
        id: `${meta.slug}:${q.id}`,
        slug: meta.slug,
        question: q.question,
        answer: q.choices[q.answer],
        explanation: q.explanation,
      })),
    );
  }
  return (
    <section className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="mb-4 text-4xl font-semibold">
        Keep your knowledge fresh.
      </h1>
      <p className="mb-8 text-[var(--muted)]">
        Short reviews, spaced over time. Cards come from the free lesson
        quizzes.
      </p>
      <Revision cards={cards} />
    </section>
  );
}
