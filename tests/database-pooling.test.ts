import { expect, it } from 'vitest';
import { pooling } from '@/server/simulations/database/pooling';
function run(raw: unknown) {
  return [...pooling.generate(pooling.validateInput(raw))].at(-1)!.state
    .result as {
    completed: number;
    rejected: number;
    timedOut: number;
    pending: number;
    conserved: boolean;
    withinDatabaseLimit: boolean;
    withinLocalLimits: boolean;
    connections: { replica: number; leaked: boolean }[];
    requests: { id: number; start: number | null; state: string }[];
  };
}
it('reuses idle physical connections instead of opening one for every query', () => {
  const r = run(pooling.presets.best);
  expect(r.completed).toBe(2);
  expect(r.connections).toHaveLength(1);
});
it('leaked checked-out slots exhaust capacity even though their queries completed', () => {
  const r = run(pooling.presets.worst);
  expect(r.completed).toBe(2);
  expect(r.timedOut).toBe(2);
  expect(r.connections.filter((c) => c.leaked)).toHaveLength(2);
});
it('preserves per-replica ownership instead of lending an idle connection across pools', () => {
  const r = run({
    poolSize: 1,
    replicas: 2,
    databaseLimit: 1,
    requests: [
      { at: 0, replica: 0, duration: 1 },
      { at: 2, replica: 1, duration: 1 },
    ],
  });
  expect(r.completed).toBe(1);
  expect(r.timedOut).toBe(1);
});
it('conserves requests and respects both physical and replica-local caps for every preset', () => {
  for (const p of [
    pooling.presets.best,
    pooling.presets.average,
    pooling.presets.worst,
    pooling.presets.random(32, 42),
  ]) {
    const r = run(p);
    expect(r.conserved).toBe(true);
    expect(r.withinDatabaseLimit).toBe(true);
    expect(r.withinLocalLimits).toBe(true);
  }
});
it('serves existing FIFO waiters before a new arrival on the same replica', () => {
  const r = run({
    poolSize: 1,
    replicas: 1,
    databaseLimit: 1,
    requests: [
      { at: 0, replica: 0, duration: 2 },
      { at: 1, replica: 0, duration: 1 },
      { at: 2, replica: 0, duration: 1 },
    ],
  });
  expect(r.requests.map((r) => r.start)).toEqual([0, 2, 3]);
});
