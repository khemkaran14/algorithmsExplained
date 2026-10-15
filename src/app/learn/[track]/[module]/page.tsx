import { notFound } from 'next/navigation';
import { catalog } from '@/content/catalog';
import { CatalogGrid } from '@/components/lesson/catalog-grid';
export default async function Module({
  params,
}: {
  params: Promise<{ track: string; module: string }>;
}) {
  const p = await params,
    lessons = catalog.filter(
      (l) => l.track === p.track && l.module === p.module,
    );
  if (!lessons.length) notFound();
  return (
    <section className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="mb-8 text-4xl font-semibold capitalize">
        {p.module.replaceAll('-', ' ')}
      </h1>
      <CatalogGrid lessons={lessons} />
    </section>
  );
}
