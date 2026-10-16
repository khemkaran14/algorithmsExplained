import { it, expect, describe } from 'vitest';
import {
  leaderElection,
  serviceBoundaries,
} from '@/server/simulations/coordination';
import type { Visualizer } from '@/engine/types';
describe.each([leaderElection, serviceBoundaries] as Visualizer<unknown>[])(
  '$id',
  (v) =>
    it('has deterministic immutable serializable preset traces', () => {
      for (const raw of [
        v.presets.best,
        v.presets.average,
        v.presets.worst,
        v.presets.random(8, 42),
      ]) {
        const input = v.validateInput(raw),
          before = structuredClone(input),
          frames = [...v.generate(input)];
        expect(frames).toEqual([...v.generate(input)]);
        expect(input).toEqual(before);
        expect(JSON.parse(JSON.stringify(frames))).toEqual(frames);
      }
    }),
);
it('a minority old leader cannot commit and majority election terms fence it after healing', () => {
  const r = [
    ...leaderElection.generate(
      leaderElection.validateInput({
        groups: [0, 1, 1],
        fault: 'partition',
        faultAt: 2,
        recoverAt: 7,
        ticks: 10,
        timeout: 2,
      }),
    ),
  ].at(-1)!.state.result as {
    quorum: number;
    elections: { leader: number; term: number; voters: number[] }[];
    history: {
      tick: number;
      leaders: { node: number; term: number }[];
      committedBy: { node: number; term: number; votes: number }[];
    }[];
    atMostOneQuorumWriter: boolean;
  };
  expect(r.quorum).toBe(2);
  expect(r.atMostOneQuorumWriter).toBe(true);
  expect(r.elections).toEqual([
    { tick: 4, leader: 1, term: 2, voters: [1, 2] },
  ]);
  for (const h of r.history) {
    expect(h.committedBy.length).toBeLessThanOrEqual(1);
    for (const w of h.committedBy) expect(w.votes).toBeGreaterThanOrEqual(2);
    if (h.tick >= 2 && h.tick < 7)
      expect(h.committedBy.some((w) => w.node === 0)).toBe(false);
    if (h.tick >= 7) expect(h.leaders.some((l) => l.node === 0)).toBe(false);
  }
});
it('fully split nodes cannot shrink the configured quorum to elect themselves', () => {
  const r = [
    ...leaderElection.generate(
      leaderElection.validateInput({
        groups: [0, 1, 2],
        fault: 'partition',
        faultAt: 0,
        recoverAt: 0,
        ticks: 8,
      }),
    ),
  ].at(-1)!.state.result;
  expect(r).toMatchObject({
    quorum: 2,
    commits: 0,
    rejected: 8,
    atMostOneQuorumWriter: true,
  });
});
it('payment failure isolates catalog traffic only when the modeled service boundary permits it', () => {
  const requests = ['catalog', 'checkout', 'catalog', 'checkout'];
  const monolith = [
      ...serviceBoundaries.generate(
        serviceBoundaries.validateInput({
          requests,
          mode: 'monolith',
          fault: 'payments',
        }),
      ),
    ].at(-1)!.state.result as {
      completed: number[];
      failed: number[];
      conserved: boolean;
    },
    services = [
      ...serviceBoundaries.generate(
        serviceBoundaries.validateInput({
          requests,
          mode: 'services',
          fault: 'payments',
        }),
      ),
    ].at(-1)!.state.result as {
      completed: number[];
      failed: number[];
      conserved: boolean;
    };
  expect(monolith).toMatchObject({
    completed: [],
    failed: [0, 1, 2, 3],
    conserved: true,
  });
  expect(services.completed).toEqual([0, 2]);
  expect(services.failed).toEqual([1, 3]);
  expect(services.conserved).toBe(true);
});
