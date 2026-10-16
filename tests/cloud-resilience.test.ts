import { expect, it } from 'vitest';
import { resilience } from '@/server/simulations/cloud/resilience';
function run(raw: unknown) {
  const v = resilience();
  return [...v.generate(v.validateInput(raw))].at(-1)!.state.result as {
    active: string;
    rejected: number;
    rpoLostWrites: number;
    rtoTicks: number | null;
    lostAcknowledgedRecords: number[];
    storedRecords: number[];
    acknowledged: number;
    history: { accepted: number; rejected: number; available: boolean }[];
  };
}
it('separates zone-spread survival from colocated replicas sharing one failed zone', () => {
  const p = resilience().presets.best,
    spread = run(p),
    single = run({ ...p, strategy: 'single-zone' });
  expect(spread.rejected).toBe(0);
  expect(spread.rtoTicks).toBe(0);
  expect(single.rejected).toBeGreaterThan(0);
  expect(single.rtoTicks).toBeNull();
});
it('asynchronous regional promotion exposes lagged acknowledged records and a measured tick outage', () => {
  const r = run(resilience().presets.average);
  expect(r.active).toBe('secondary');
  expect(r.rpoLostWrites).toBeGreaterThan(0);
  expect(r.rtoTicks).toBe(3);
  expect(r.storedRecords.length + r.lostAcknowledgedRecords.length).toBe(
    r.acknowledged,
  );
});
it('zero-delay cross-region snapshots preserve acknowledged records at promotion', () => {
  const p = resilience().presets.average,
    r = run({ ...p, replicationDelay: 0 });
  expect(r.rpoLostWrites).toBe(0);
});
it('backup recovery uses a completed snapshot and includes restore delay', () => {
  const p = resilience().presets.worst,
    r = run(p);
  expect(r.active).toBe('restored');
  expect(r.rtoTicks).toBe(p.detection + p.restoreDuration);
  expect(r.rpoLostWrites).toBeGreaterThan(0);
});
it('primary recovery before promotion retains its committed records', () => {
  const p = resilience().presets.average,
    r = run({ ...p, restoreAt: p.failAt + 1 });
  expect(r.active).toBe('primary');
  expect(r.rpoLostWrites).toBe(0);
  expect(r.rtoTicks).toBe(1);
});
