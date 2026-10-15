import { catalog } from '@/content/catalog';
import { AlgorithmTools } from '@/components/algorithm-tools';
export const metadata = {
  title: 'Compare sorting algorithms',
  description:
    'Compare two or three sorting algorithms on the same input, with synchronized visual steps and operation counters.',
};
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
