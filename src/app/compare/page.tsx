import { pageMetadata } from '@/config/site';
import { catalog } from '@/content/catalog';
import { AlgorithmTools } from '@/components/algorithm-tools';
export default function Compare() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-4xl font-semibold">Compare sorting algorithms</h1>
      <p className="my-5 text-[var(--muted)]">
        Use the same data to explore different decisions. All Access algorithms
        require an active purchase.
      </p>
      <AlgorithmTools
        mode="compare"
        lessons={catalog.filter(
          (l) =>
            l.track === 'dsa' &&
            l.module === 'sorting' &&
            l.status !== 'planned' &&
            !['stability-explained', 'sorting-algorithm-race'].includes(l.slug),
        )}
      />
    </section>
  );
}

export const metadata = pageMetadata(
  'Compare algorithms',
  'Compare algorithm steps and performance with interactive examples.',
  '/compare',
);
