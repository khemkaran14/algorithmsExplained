import { catalog } from '@/content/catalog';
import { AlgorithmTools } from '@/components/algorithm-tools';
export const metadata = {
  title: 'Algorithm playground',
  description:
    'Explore free algorithms with editable, validated inputs and reversible visual steps.',
};
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
