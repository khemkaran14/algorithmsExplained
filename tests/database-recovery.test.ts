import { expect, it } from 'vitest';
import { recovery } from '@/server/simulations/database/recovery';
function run(raw: unknown) {
  return [...recovery.generate(recovery.validateInput(raw))].at(-1)!.state
    .result as {
    disk: { x: { value: number }; y: { value: number } };
    unsafeFlushes: number;
    redone: number;
    undone: number;
    lostAcknowledgedCommits: string[];
  };
}
it('redos committed no-force pages and undoes stolen uncommitted pages', () => {
  const r = run(recovery.presets.average);
  expect(r.disk.x.value).toBe(7);
  expect(r.disk.y.value).toBe(0);
  expect(r.redone).toBe(1);
  expect(r.undone).toBe(1);
  expect(r.unsafeFlushes).toBe(0);
});
it('shows why missing WAL cannot guarantee undo of an uncommitted disk update', () => {
  const r = run(recovery.presets.worst);
  expect(r.disk.x.value).toBe(7);
  expect(r.unsafeFlushes).toBe(1);
  expect(r.undone).toBe(0);
});
it('an asynchronous acknowledgment can be lost with its unflushed commit record', () => {
  const r = run({ ...recovery.presets.best, synchronousCommit: false });
  expect(r.lostAcknowledgedCommits).toEqual(['A']);
  expect(r.disk.x.value).toBe(0);
});
it('undo restores the prior committed version after repeated loser writes', () => {
  const r = run({
    operations: [
      { kind: 'write', tx: 'A', key: 'x', value: 3 },
      { kind: 'commit', tx: 'A' },
      { kind: 'write', tx: 'B', key: 'x', value: 7 },
      { kind: 'write', tx: 'B', key: 'x', value: 9 },
      { kind: 'flush-page', key: 'x' },
      { kind: 'crash-recover' },
    ],
  });
  expect(r.disk.x.value).toBe(3);
  expect(r.undone).toBe(2);
});
