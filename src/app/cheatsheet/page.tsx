import { ComplexityCheatsheet } from '@/components/complexity-cheatsheet';
export const metadata = {
  title: 'Algorithm complexity cheat sheet',
  description:
    'A free, searchable guide to best, average, worst time and space complexity across the DSA curriculum.',
};
export default function Cheatsheet() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-4xl font-semibold">
        Algorithm complexity cheat sheet
      </h1>
      <p className="mt-4 max-w-3xl text-[var(--muted)]">
        Compare the costs of the implemented algorithms. This reference is free;
        linked All Access lessons retain their purchase requirements.
      </p>
      <ComplexityCheatsheet />
    </section>
  );
}
