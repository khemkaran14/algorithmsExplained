import { pageMetadata } from '@/config/site';
import { notFound } from 'next/navigation';
import { catalog } from '@/content/catalog';
import { AuthorizedCatalogGrid as CatalogGrid } from '@/components/lesson/authorized-catalog-grid';
export default async function Track({
  params,
}: {
  params: Promise<{ track: string }>;
}) {
  const { track } = await params;
  const lessons = catalog.filter((l) => l.track === track);
  if (!lessons.length) notFound();
  return (
    <section className="mx-auto max-w-6xl px-5 py-12">
      <p className="font-mono text-xs text-[var(--muted)]">YOUR LEARNING MAP</p>
      <h1 className="mb-8 mt-3 text-4xl font-semibold">
        {track === 'dsa'
          ? 'Data structures & algorithms'
          : track.replaceAll('-', ' ')}
      </h1>
      <CatalogGrid lessons={lessons} />
    </section>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ track: string }>;
}) {
  const p = await params;
  if (!catalog.some((l) => l.track === p.track))
    return { title: 'Not found', robots: { index: false } };
  return pageMetadata(
    p.track === 'dsa'
      ? 'Data structures & algorithms'
      : p.track.replaceAll('-', ' '),
    `Explore visual lessons and quizzes in ${p.track.replaceAll('-', ' ')}.`,
    `/learn/${p.track}`,
  );
}
