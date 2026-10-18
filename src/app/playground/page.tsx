import { pageMetadata } from '@/config/site';
import { catalog } from '@/content/catalog';
import { AlgorithmTools } from '@/components/algorithm-tools';
export default function Playground() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl font-semibold">Algorithm playground</h1>
      <p className="my-5 text-[var(--muted)]">
        Change the input, predict the result and inspect every step.
      </p>
      <AlgorithmTools
        mode="playground"
        lessons={catalog.filter(
          (l) => l.track === 'dsa' && l.isFree && l.status !== 'planned',
        )}
      />
    </section>
  );
}

export const metadata = pageMetadata(
  'Algorithm playground',
  'Experiment with visual algorithm examples and compare their behavior.',
  '/playground',
);
