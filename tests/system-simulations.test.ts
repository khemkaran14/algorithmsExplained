import { it, expect, describe } from 'vitest';
import { trafficVisualizer, trafficSchema } from '@/server/simulations/traffic';
import {
  consistencyVisualizer,
  consistencySchema,
  availability,
} from '@/server/simulations/consistency';
import { Fifo } from '@/server/simulations/collections';
import type { Visualizer } from '@/engine/types';
const app = trafficVisualizer({
    slug: 'traffic-test',
    title: 'Traffic',
    databaseCapacity: 8,
    why: 'Model capacity independently at each tier.',
  }),
  cdn = trafficVisualizer({
    slug: 'cdn-test',
    title: 'CDN',
    databaseCapacity: 8,
    edgeCache: true,
    why: 'Global cached hits can bypass an unavailable origin.',
  }),
  consistency = consistencyVisualizer('consistency-test');
describe.each([app, cdn, consistency, availability] as Visualizer<unknown>[])(
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
          copy = structuredClone(input),
          frames = [...v.generate(input)];
        expect(frames.length).toBeGreaterThan(1);
        expect(frames).toEqual([...v.generate(input)]);
        expect(input).toEqual(copy);
        expect(JSON.parse(JSON.stringify(frames))).toEqual(frames);
      }
    }),
);
it('FIFO preserves order across compaction and re-use', () => {
  const q = new Fifo<number>();
  for (let i = 0; i < 500; i++) q.push(i);
  for (let i = 0; i < 400; i++) expect(q.shift()).toBe(i);
  for (let i = 500; i < 700; i++) q.push(i);
  for (let i = 400; i < 700; i++) expect(q.shift()).toBe(i);
  expect(q.length).toBe(0);
  expect(q.shift()).toBeUndefined();
});
type TrafficResult = {
  offered: number;
  completed: number;
  pending: number;
  rejected: number;
  conserved: boolean;
  modeledP95Ms: number | null;
};
it('traffic accounts for every request across overload and every fault mode', () => {
  for (const fault of [
    'none',
    'service',
    'database',
    'cache',
    'region',
  ] as const) {
    const input = trafficSchema.parse({
      requests: 100,
      ticks: 12,
      capacity: 3,
      replicas: 1,
      cacheHit: 0,
      queueLimit: 10,
      fault,
      failAt: 3,
      restoreAt: 8,
    });
    const r = [...app.generate(input)].at(-1)!.state.result as TrafficResult;
    expect(r.offered).toBe(1200);
    expect(r.conserved).toBe(true);
    expect(r.completed + r.pending + r.rejected).toBe(r.offered);
    expect(r.pending).toBeLessThanOrEqual(20);
  }
});
it('database capacity remains a bottleneck after adding app replicas', () => {
  const a = [
      ...app.generate(
        trafficSchema.parse({
          requests: 32,
          ticks: 8,
          replicas: 2,
          capacity: 32,
          cacheHit: 0,
          queueLimit: 512,
        }),
      ),
    ].at(-1)!.state.result as TrafficResult,
    b = [
      ...app.generate(
        trafficSchema.parse({
          requests: 32,
          ticks: 8,
          replicas: 8,
          capacity: 32,
          cacheHit: 0,
          queueLimit: 512,
        }),
      ),
    ].at(-1)!.state.result as TrafficResult;
  expect(a.completed).toBe(64);
  expect(b.completed).toBe(a.completed);
});
it('a global cached hit can survive origin-region failure while uncached traffic rejects', () => {
  const input = trafficSchema.parse({
    requests: 10,
    ticks: 4,
    cacheHit: 100,
    fault: 'region',
    failAt: 0,
  });
  const a = [...cdn.generate(input)].at(-1)!.state.result as TrafficResult,
    b = [...app.generate(input)].at(-1)!.state.result as TrafficResult;
  expect(a).toMatchObject({ completed: 40, rejected: 0, conserved: true });
  expect(b).toMatchObject({ completed: 0, rejected: 40, conserved: true });
});
it('increasing a healthy app bottleneck can increase modeled throughput', () => {
  const profile = trafficVisualizer({
    slug: 'cpu-test',
    title: 'CPU',
    databaseCapacity: 100,
    why: 'Independent resource budgets.',
  });
  const a = [
      ...profile.generate(
        trafficSchema.parse({
          requests: 30,
          ticks: 4,
          replicas: 1,
          cpu: 1,
          capacity: 5,
          cacheHit: 0,
          queueLimit: 512,
        }),
      ),
    ].at(-1)!.state.result as TrafficResult,
    b = [
      ...profile.generate(
        trafficSchema.parse({
          requests: 30,
          ticks: 4,
          replicas: 1,
          cpu: 4,
          capacity: 5,
          cacheHit: 0,
          queueLimit: 512,
        }),
      ),
    ].at(-1)!.state.result as TrafficResult;
  expect(a.completed).toBe(20);
  expect(b.completed).toBe(80);
});
type History = {
  history: {
    available: boolean;
    value: number | null;
    version: string | null;
  }[];
  converged: boolean;
};
it('eventual reads can be stale before replication, while strong reads see acknowledged writes', () => {
  const operations = [
    { kind: 'write', node: 'A', client: 'a', value: 7 },
    { kind: 'read', node: 'B', client: 'b' },
    { kind: 'read', node: 'B', client: 'b' },
  ];
  const eventual = [
      ...consistency.generate(
        consistencySchema.parse({ operations, mode: 'eventual', delay: 2 }),
      ),
    ].at(-1)!.state.result as History,
    strong = [
      ...consistency.generate(
        consistencySchema.parse({ operations, mode: 'strong', delay: 2 }),
      ),
    ].at(-1)!.state.result as History;
  expect(eventual.history.map((h) => h.value)).toEqual([7, 0, 7]);
  expect(strong.history.map((h) => h.value)).toEqual([7, 7, 7]);
});
it('CAP policy makes strong partitioned operations unavailable and eventual operations available', () => {
  const operations = [
    { kind: 'write', node: 'A', value: 1 },
    { kind: 'write', node: 'B', value: 2 },
    { kind: 'read', node: 'A' },
  ];
  for (const mode of ['strong', 'eventual'] as const) {
    const r = [
      ...consistency.generate(
        consistencySchema.parse({ operations, mode, partitionAt: 0 }),
      ),
    ].at(-1)!.state.result as History;
    expect(r.history.every((h) => h.available === (mode === 'eventual'))).toBe(
      true,
    );
    if (mode === 'eventual') expect(r.converged).toBe(false);
  }
});
it('session tokens prevent stale failover reads and writes from lowering a client version', () => {
  const operations = [
    { kind: 'write', node: 'A', client: 'same', value: 7 },
    { kind: 'read', node: 'B', client: 'same' },
    { kind: 'write', node: 'B', client: 'same', value: 8 },
    { kind: 'read', node: 'A', client: 'same' },
  ];
  const r = [
    ...consistency.generate(
      consistencySchema.parse({ operations, mode: 'session', delay: 8 }),
    ),
  ].at(-1)!.state.result as History;
  expect(r.history.map((h) => h.available)).toEqual([true, false, false, true]);
  expect(r.history[3].value).toBe(7);
});
it('healing conflicting eventual writes converges under the explicit logical-version tie rule', () => {
  const operations = [
    { kind: 'write', node: 'A', value: 1 },
    { kind: 'write', node: 'B', value: 2 },
    { kind: 'read', node: 'A' },
    { kind: 'read', node: 'B' },
  ];
  const r = [
    ...consistency.generate(
      consistencySchema.parse({
        operations,
        mode: 'eventual',
        partitionAt: 0,
        healAt: 2,
      }),
    ),
  ].at(-1)!.state.result as History;
  expect(r.converged).toBe(true);
  expect(r.history.slice(2).map((h) => h.value)).toEqual([2, 2]);
});
it('zero delivery delay propagates a connected eventual write before the next operation', () => {
  const operations = [
    { kind: 'write', node: 'A', value: 9 },
    { kind: 'read', node: 'B' },
  ];
  const r = [
    ...consistency.generate(
      consistencySchema.parse({ operations, mode: 'eventual', delay: 0 }),
    ),
  ].at(-1)!.state.result as History;
  expect(r.history[1].value).toBe(9);
});
it('availability equations distinguish series, redundancy and common-cause limits', () => {
  const run = (topology: 'series' | 'parallel', commonAvailability = 1) =>
    [
      ...availability.generate({
        components: [0.999, 0.999],
        topology,
        commonAvailability,
        days: 30,
      }),
    ].at(-1)!.state.result as {
      availability: number;
      expectedDowntimeSeconds: number;
    };
  expect(run('series').availability).toBeCloseTo(0.998001, 12);
  expect(run('parallel').availability).toBeCloseTo(0.999999, 12);
  expect(run('parallel', 0.99).availability).toBeLessThan(0.99);
  expect(run('series').expectedDowntimeSeconds).toBeGreaterThan(
    run('parallel').expectedDowntimeSeconds,
  );
  for (const value of [0, 1]) {
    const frames = [
      ...availability.generate({
        components: [value],
        topology: 'series',
        commonAvailability: 1,
        days: 30,
      }),
    ];
    expect(JSON.parse(JSON.stringify(frames))).toEqual(frames);
  }
});
