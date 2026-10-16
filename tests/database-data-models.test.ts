import { expect, it } from 'vitest';
import { dataModels } from '@/server/simulations/database/data-models';
function run(raw: unknown) {
  const v = dataModels();
  return [...v.generate(v.validateInput(raw))].at(-1)!.state.result as {
    owners: number[];
    output: { id: number }[];
    recordVisits: number;
    edgeVisits: number;
  };
}
it('all five explicit layouts return the same query results', () => {
  const v = dataModels(),
    p = { ...v.presets.worst, minCreated: 2, maxCreated: 14 };
  const expected = run({ ...p, model: 'relational', ownerIndex: false });
  for (const model of [
    'relational',
    'document',
    'key-value',
    'wide-column',
    'graph',
  ])
    for (const ownerIndex of [true, false]) {
      const r = run({ ...p, model, ownerIndex });
      expect(r.owners).toEqual(expected.owners);
      expect(r.output).toEqual(expected.output);
    }
});
it('a clustering-time bound narrows actual candidate visits without changing results', () => {
  const p = dataModels().presets.average,
    wide = run(p),
    doc = run({ ...p, model: 'document' });
  expect(wide.output).toEqual(doc.output);
  expect(wide.recordVisits).toBeLessThan(doc.recordVisits);
});
it('graph adjacency avoids scanning unrelated edge rows for every frontier vertex', () => {
  const p = dataModels().presets.worst,
    graph = run({ ...p, model: 'graph' }),
    rows = run({ ...p, model: 'relational' });
  expect(graph.output).toEqual(rows.output);
  expect(graph.edgeVisits).toBeLessThan(rows.edgeVisits);
  expect(graph.owners).toEqual([0, 1, 2, 3]);
});
it('depth zero never expands the owner even when the graph has a cycle', () => {
  const p = dataModels().presets.worst,
    r = run({ ...p, depth: 0 });
  expect(r.owners).toEqual([0]);
  expect(r.edgeVisits).toBe(0);
});
