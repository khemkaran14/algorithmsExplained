import { expect, it } from 'vitest';
import { normalization } from '@/server/simulations/database/normalization';
function run(raw: unknown) {
  return [...normalization.generate(normalization.validateInput(raw))].at(-1)!
    .state.result as {
    candidateKeys: string[][];
    normalForms: {
      first: boolean;
      second: boolean;
      third: boolean;
      bcnf: boolean;
    };
    firstLosslessSplit: { lossless: boolean } | null;
  };
}
it('distinguishes 3NF from BCNF when every attribute is prime', () => {
  const r = run({
    attributes: ['A', 'B', 'C'],
    dependencies: [
      { left: ['A', 'B'], right: ['C'] },
      { left: ['C'], right: ['B'] },
    ],
  });
  expect(r.candidateKeys).toEqual([
    ['A', 'B'],
    ['A', 'C'],
  ]);
  expect(r.normalForms).toEqual({
    first: true,
    second: true,
    third: true,
    bcnf: false,
  });
  expect(r.firstLosslessSplit?.lossless).toBe(true);
});
it('detects partial dependencies on a composite candidate key', () => {
  const r = run({
    attributes: ['A', 'B', 'C'],
    dependencies: [
      { left: ['A', 'B'], right: ['C'] },
      { left: ['A'], right: ['C'] },
    ],
  });
  expect(r.candidateKeys).toEqual([['A', 'B']]);
  expect(r.normalForms.second).toBe(false);
  expect(r.normalForms.third).toBe(false);
});
it('computes transitive closure instead of treating a determinant as a key by inspection', () => {
  const r = run(normalization.presets.average);
  expect(r.candidateKeys).toEqual([['A']]);
  expect(r.normalForms.second).toBe(true);
  expect(r.normalForms.third).toBe(false);
});
it('requires atomic cells before asserting higher normal forms', () => {
  const r = run({ ...normalization.presets.best, atomicCells: false });
  expect(Object.values(r.normalForms)).toEqual([false, false, false, false]);
});
it('keeps every preset trace deterministic, immutable and JSON safe', () => {
  for (const raw of [
    normalization.presets.best,
    normalization.presets.average,
    normalization.presets.worst,
    normalization.presets.random(8, 1),
  ]) {
    const input = normalization.validateInput(raw),
      before = structuredClone(input),
      frames = [...normalization.generate(input)];
    expect(input).toEqual(before);
    expect(JSON.parse(JSON.stringify(frames))).toEqual(frames);
    expect([...normalization.generate(input)]).toEqual(frames);
  }
});
