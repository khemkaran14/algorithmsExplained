import { expect, it } from 'vitest';
import { containers } from '@/server/simulations/cloud/containers';
function run(raw: unknown) {
  const v = containers();
  return [...v.generate(v.validateInput(raw))].at(-1)!.state.result as {
    complete: boolean;
    stalled: boolean;
    withinSurge: boolean;
    withinNodeSlots: boolean;
    readyEndpoints: { version: string; node: number }[];
    history: { available: number }[];
  };
}
it('healthy rollout transitions all ready endpoints while respecting surge and deletion budgets', () => {
  const p = containers().presets.average,
    r = run(p);
  expect(r.complete).toBe(true);
  expect(r.readyEndpoints.every((p) => p.version === 'v2')).toBe(true);
  expect(r.withinSurge).toBe(true);
  expect(r.withinNodeSlots).toBe(true);
  expect(
    r.history.every((h) => h.available >= p.desired - p.maxUnavailable),
  ).toBe(true);
});
it('bad new readiness stalls safely instead of discarding the old service', () => {
  const p = containers().presets.worst,
    r = run(p);
  expect(r.complete).toBe(false);
  expect(r.stalled).toBe(true);
  expect(r.readyEndpoints).toHaveLength(p.desired);
  expect(r.readyEndpoints.every((p) => p.version === 'v1')).toBe(true);
});
it('rollback removes unhealthy new pods and retains the previous ready version', () => {
  const r = run({ ...containers().presets.worst, rollbackAt: 5 });
  expect(r.complete).toBe(true);
  expect(r.readyEndpoints.every((p) => p.version === 'v1')).toBe(true);
});
it('failed nodes are excluded from scheduling and their lost pods are replaced within remaining slots', () => {
  const r = run({
    ...containers().presets.average,
    nodes: 3,
    slotsPerNode: 3,
    failNodeAt: 2,
    ticks: 20,
  });
  expect(r.complete).toBe(true);
  expect(r.readyEndpoints.every((p) => p.node !== 0)).toBe(true);
  expect(r.withinNodeSlots).toBe(true);
});
