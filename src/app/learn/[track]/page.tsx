import { notFound } from 'next/navigation';
import { catalog } from '@/content/catalog';
import { CatalogGrid } from '@/components/lesson/catalog-grid';
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
