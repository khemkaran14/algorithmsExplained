import { expect, it } from 'vitest';
import { lsm } from '@/server/simulations/database/lsm';
function run(raw: unknown) {
  return [...lsm.generate(lsm.validateInput(raw))].at(-1)!.state.result as {
    reads: { key: number; value: number | null; deleted: boolean }[];
    runs: { entries: { key: number; value: number | null }[] }[];
    bloomSkips: number;
    tombstonesDropped: number;
  };
}
it('reads the newest value and does not resurrect a deleted older key', () => {
  const r = run(lsm.presets.average);
  expect(r.reads.map((r) => r.value)).toEqual([null, 30, 30]);
  expect(r.reads[0].deleted).toBe(true);
});
it('partial compaction retains a tombstone while full coverage may purge it', () => {
  const p = lsm.presets.worst,
    partial = run(p),
    full = run({ ...p, fullCompaction: true });
  expect(partial.reads.at(-1)?.value).toBeNull();
  expect(full.reads.at(-1)?.value).toBeNull();
  expect(partial.tombstonesDropped).toBe(0);
  expect(full.tombstonesDropped).toBe(1);
});
it('Bloom filters never change query results compared with unconditional sorted-run probes', () => {
  for (let n = 1; n <= 24; n++) {
    const p = lsm.presets.random(n, 42);
    expect(run({ ...p, bloom: true }).reads).toEqual(
      run({ ...p, bloom: false }).reads,
    );
  }
});
it('compaction results match an independent last-write map for mixed updates/deletes', () => {
  const operations: unknown[] = [],
    expected = new Map<number, number | null>();
  for (let i = 0; i < 20; i++) {
    const key = i % 5;
    if (i % 4 === 0) {
      operations.push({ kind: 'delete', key });
      expected.set(key, null);
    } else {
      operations.push({ kind: 'put', key, value: i });
      expected.set(key, i);
    }
  }
  operations.push({ kind: 'flush' }, { kind: 'compact' });
  for (let key = 0; key < 5; key++) operations.push({ kind: 'get', key });
  const r = run({ memLimit: 2, fullCompaction: true, operations });
  expect(r.reads.map((r) => r.value)).toEqual(
    [...Array(5)].map((_, k) => expected.get(k) ?? null),
  );
});
