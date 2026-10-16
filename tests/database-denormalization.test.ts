import { expect, it } from 'vitest';
import { denormalization } from '@/server/simulations/database/denormalization';
function run(raw: unknown) {
  return [...denormalization.generate(denormalization.validateInput(raw))].at(
    -1,
  )!.state.result as {
    reads: { stale: boolean; address: string }[];
    pending: number;
    staleReads: number;
    rollbacks: number;
    customers: Record<string, string>;
  };
}
it('partial split writes expose a stale copy until an explicit repair', () => {
  const r = run(denormalization.presets.average);
  expect(r.reads.map((x) => x.stale)).toEqual([false, true, false]);
  expect(r.staleReads).toBe(1);
});
it('atomic fan-out rolls back the profile as well as every duplicate copy', () => {
  const r = run({ ...denormalization.presets.average, atomicFanout: true });
  expect(r.rollbacks).toBe(1);
  expect(r.customers['1']).toBe('Old Street');
  expect(r.staleReads).toBe(0);
});
it('normalized reads see current profile data without fan-out even when a copy failure is configured', () => {
  const r = run({ ...denormalization.presets.average, mode: 'normalized' });
  expect(r.customers['1']).toBe('New Road');
  expect(r.staleReads).toBe(0);
});
it('asynchronous worker failure retains pending tasks and labels stale reads honestly', () => {
  const r = run(denormalization.presets.worst);
  expect(r.pending).toBe(3);
  expect(r.staleReads).toBe(1);
});
it('repair clears obsolete pending work so it cannot overwrite the rebuilt copies later', () => {
  const p = denormalization.presets.worst,
    r = run({
      ...p,
      operations: [
        ...p.operations,
        { kind: 'repair' },
        { kind: 'read', orderId: 2 },
      ],
    });
  expect(r.pending).toBe(0);
  expect(r.reads.at(-1)?.stale).toBe(false);
});
