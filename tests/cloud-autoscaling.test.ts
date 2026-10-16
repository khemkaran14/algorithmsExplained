import { expect, it } from 'vitest';
import { autoscaling } from '@/server/simulations/cloud/autoscaling';
function run(raw: unknown) {
  return [...autoscaling.generate(autoscaling.validateInput(raw))].at(-1)!.state
    .result as {
    conserved: boolean;
    offered: number;
    completed: number;
    rejected: number;
    pending: number;
    started: number;
    history: {
      desired: number;
      ready: number;
      starting: number;
      pending: number;
    }[];
  };
}
it('stable work below target does not invent scale events or queue losses', () => {
  const r = run(autoscaling.presets.best);
  expect(r.completed).toBe(r.offered);
  expect(r.rejected).toBe(0);
  expect(r.started).toBe(1);
  expect(r.conserved).toBe(true);
});
it('startup and delayed metrics allow queueing before new desired instances become ready', () => {
  const r = run(autoscaling.presets.average);
  expect(r.history.some((h) => h.starting > 0)).toBe(true);
  expect(r.history.some((h) => h.pending > 0)).toBe(true);
  expect(r.history.every((h) => h.ready <= 6)).toBe(true);
  expect(r.conserved).toBe(true);
});
it('a zero-length waiting queue still serves immediately available capacity', () => {
  const r = run({ load: [5, 20], min: 1, max: 1, capacity: 10, queueLimit: 0 });
  expect(r.completed).toBe(15);
  expect(r.rejected).toBe(10);
  expect(r.pending).toBe(0);
});
it('reconciles lost instances while preserving capped desired capacity and accounting', () => {
  const r = run({ ...autoscaling.presets.best, failAt: 2 });
  expect(r.started).toBeGreaterThan(1);
  expect(r.history.every((h) => h.desired >= 1 && h.desired <= 6)).toBe(true);
  expect(r.conserved).toBe(true);
});
