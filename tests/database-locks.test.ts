import { expect, it } from 'vitest';
import { locking } from '@/server/simulations/database/locks';
function result(raw: unknown) {
  return [...locking.generate(locking.validateInput(raw))].at(-1)!.state
    .result as {
    states: Record<string, string>;
    pending: unknown[];
    victims: string[];
    cycle: string[];
    locks: Record<string, Record<string, string>>;
  };
}
it('shared holders coexist and release on commit', () => {
  const r = result(locking.presets.best);
  expect(r.states.A).toBe('committed');
  expect(r.states.B).toBe('committed');
  expect(r.victims).toEqual([]);
});
it('detects an actual wait cycle and rolls back a deterministic victim', () => {
  const r = result(locking.presets.average);
  expect(r.victims).toEqual(['B']);
  expect(r.states.A).toBe('committed');
  expect(r.pending).toEqual([]);
  expect(r.cycle).toEqual([]);
});
it('keeps a lock-upgrade deadlock pending when detection is disabled', () => {
  const r = result(locking.presets.worst);
  expect(r.victims).toEqual([]);
  expect(r.pending).toHaveLength(2);
  expect(new Set(r.cycle)).toEqual(new Set(['A', 'B']));
});
it('a repeated already-held shared lock does not create a false fairness deadlock', () => {
  const r = result({
    operations: [
      { kind: 'lock', tx: 'A', key: 'x', mode: 'S' },
      { kind: 'lock', tx: 'B', key: 'x', mode: 'X' },
      { kind: 'lock', tx: 'A', key: 'x', mode: 'S' },
      { kind: 'commit', tx: 'A' },
      { kind: 'commit', tx: 'B' },
    ],
  });
  expect(r.victims).toEqual([]);
  expect(r.pending).toEqual([]);
  expect(r.states.B).toBe('committed');
});
