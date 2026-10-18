import { pageMetadata } from '@/config/site';
import { ComplexityCheatsheet } from '@/components/complexity-cheatsheet';
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

export const metadata = pageMetadata(
  'Computer science cheat sheet',
  'Review algorithm complexity and core computer science concepts.',
  '/cheatsheet',
);
