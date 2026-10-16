import { expect, it } from 'vitest';
import { databaseIndex } from '@/server/simulations/database/indexes';
function run(raw: unknown) {
  const v = databaseIndex();
  return [...v.generate(v.validateInput(raw))].at(-1)!.state.result as {
    leftmostPrefix: string[];
    covered: boolean;
    candidateRows: number;
    heapFetches: number;
    output: Record<string, number>[];
    plan: string;
  };
}
it('uses a leading equality range and avoids heap reads when covered', () => {
  const v = databaseIndex(),
    r = run({ ...v.presets.best, plan: 'index' });
  expect(r.leftmostPrefix).toEqual(['tenant']);
  expect(r.candidateRows).toBe(4);
  expect(r.covered).toBe(true);
  expect(r.heapFetches).toBe(0);
});
it('cannot seek using only a nonleading composite column in the baseline', () => {
  const v = databaseIndex(),
    r = run(v.presets.worst);
  expect(r.leftmostPrefix).toEqual([]);
  expect(r.candidateRows).toBe(16);
  expect(r.output).toEqual([{ amount: 70 }]);
});
it('index and sequential plans produce the same bag of matching projections', () => {
  const v = databaseIndex();
  for (let n = 1; n <= 24; n++) {
    const p = v.presets.random(n, 42),
      scan = run({ ...p, plan: 'sequential' }),
      index = run({ ...p, plan: 'index' });
    const bag = (rows: Record<string, number>[]) =>
      rows.map((r) => JSON.stringify(r)).sort();
    expect(bag(scan.output)).toEqual(bag(index.output));
  }
});
it('non-covered predicates require heap access even when projections are indexed', () => {
  const v = databaseIndex(),
    p = {
      ...v.presets.best,
      predicates: [
        { column: 'tenant', value: 1 },
        { column: 'amount', value: 10 },
      ],
      plan: 'index',
    };
  const r = run(p);
  expect(r.covered).toBe(false);
  expect(r.heapFetches).toBe(4);
  expect(r.output).toEqual([{ tenant: 1, created: 1 }]);
});
