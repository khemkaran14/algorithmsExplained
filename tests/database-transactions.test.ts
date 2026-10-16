import { expect, it } from 'vitest';
import { transactions } from '@/server/simulations/database/transactions';
function run(raw: unknown) {
  const v = transactions();
  return [...v.generate(v.validateInput(raw))].at(-1)!.state.result as {
    values: { x: number; y: number };
    aborts: number;
    history: { kind: string; status: string; value: number | null }[];
    transactions: Record<string, { state: string }>;
  };
}
it('snapshot isolation permits the disjoint-write skew but serializable aborts its cycle', () => {
  const v = transactions(),
    p = v.presets.average,
    rr = run(p),
    serial = run({ ...p, isolation: 'serializable' });
  expect(rr.values).toEqual({ x: 0, y: 0 });
  expect(rr.aborts).toBe(0);
  expect(serial.values).toEqual({ x: 0, y: 1 });
  expect(serial.aborts).toBe(1);
  expect(serial.transactions.B.state).toBe('aborted');
});
it('read committed observes a nonrepeatable read while snapshot reads retain the first version', () => {
  const p = transactions().presets.worst;
  expect(
    run(p)
      .history.filter((e) => e.kind === 'read')
      .map((e) => e.value),
  ).toEqual([1, 5]);
  expect(
    run({ ...p, isolation: 'repeatable-read' })
      .history.filter((e) => e.kind === 'read')
      .map((e) => e.value),
  ).toEqual([1, 1]);
});
it('takes the repeatable-read snapshot at first data access, not BEGIN', () => {
  const r = run({
    operations: [
      { kind: 'begin', tx: 'A' },
      { kind: 'begin', tx: 'B' },
      { kind: 'write', tx: 'B', key: 'x', value: 7 },
      { kind: 'commit', tx: 'B' },
      { kind: 'read', tx: 'A', key: 'x' },
      { kind: 'commit', tx: 'A' },
    ],
  });
  expect(r.history.find((e) => e.kind === 'read')?.value).toBe(7);
});
it('rollback publishes none of a transaction’s buffered writes', () => {
  const r = run({
    operations: [
      { kind: 'begin', tx: 'A' },
      { kind: 'write', tx: 'A', key: 'x', value: 99 },
      { kind: 'write', tx: 'A', key: 'y', value: 99 },
      { kind: 'rollback', tx: 'A' },
      { kind: 'begin', tx: 'B' },
      { kind: 'read', tx: 'B', key: 'x' },
    ],
  });
  expect(r.values).toEqual({ x: 1, y: 1 });
  expect(r.history.find((e) => e.kind === 'read')?.value).toBe(1);
});
it('rejects concurrent snapshot writers on the same key', () => {
  const r = run({
    operations: [
      { kind: 'begin', tx: 'A' },
      { kind: 'begin', tx: 'B' },
      { kind: 'write', tx: 'A', key: 'x', value: 2 },
      { kind: 'write', tx: 'B', key: 'x', value: 3 },
      { kind: 'commit', tx: 'A' },
      { kind: 'commit', tx: 'B' },
    ],
  });
  expect(r.values.x).toBe(2);
  expect(r.aborts).toBe(1);
});
it('PostgreSQL read-uncommitted never sees another transaction’s buffered value', () => {
  const r = run({
    isolation: 'read-uncommitted',
    operations: [
      { kind: 'begin', tx: 'A' },
      { kind: 'write', tx: 'A', key: 'x', value: 99 },
      { kind: 'begin', tx: 'B' },
      { kind: 'read', tx: 'B', key: 'x' },
    ],
  });
  expect(r.history.find((e) => e.kind === 'read')?.value).toBe(1);
});
