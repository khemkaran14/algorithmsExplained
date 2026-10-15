import { notFound } from 'next/navigation';
import { catalog } from '@/content/catalog';
import { CatalogGrid } from '@/components/lesson/catalog-grid';
const paths: Record<
  string,
  { title: string; track: string; description: string }
> = {
  'dsa-interviews': {
    title: 'DSA for interviews · 8 weeks',
    track: 'dsa',
    description:
      'Build the foundations, then practice arrays, sorting, search, trees, graphs and dynamic programming.',
  },
  'system-design-interviews': {
    title: 'System design for interviews',
    track: 'system-design',
    description:
      'Start with fundamentals, explore building blocks, then design real systems.',
  },
  'database-fundamentals': {
    title: 'Database fundamentals',
    track: 'databases',
    description:
      'Move from data modelling to query plans and transaction isolation.',
  },
  'cloud-practitioner': {
    title: 'Cloud practitioner',
    track: 'cloud',
    description: 'Learn portable cloud concepts and compare AWS with GCP.',
  },
};
export default async function Path({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params,
    p = paths[path];
  if (!p) notFound();
  return (
    <section className="mx-auto max-w-6xl px-5 py-12">
      <p className="font-mono text-xs text-[var(--muted)]">YOUR GUIDED PATH</p>
      <h1 className="my-4 text-4xl font-semibold">{p.title}</h1>
      <p className="mb-8 max-w-2xl text-[var(--muted)]">{p.description}</p>
      <CatalogGrid lessons={catalog.filter((l) => l.track === p.track)} />
    </section>
  );
}
