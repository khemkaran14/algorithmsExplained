import { it, expect, describe } from 'vitest';
import { rateLimiter, messageQueue } from '@/server/simulations/rate-queue';
import {
  cacheModel,
  circuitBreaker,
  idempotency,
} from '@/server/simulations/cache-resilience';
import { sharding, distributedIds } from '@/server/simulations/ids-sharding';
import type { Visualizer } from '@/engine/types';
function result<I>(v: Visualizer<I>, raw: unknown) {
  return [...v.generate(v.validateInput(raw))].at(-1)!.state.result;
}
const all = [
  rateLimiter(),
  messageQueue(),
  cacheModel(),
  circuitBreaker,
  idempotency(),
  sharding(),
  distributedIds,
] as Visualizer<unknown>[];
describe.each(all)('$id', (v) =>
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
      expect(frames.length).toBeGreaterThan(1);
      expect(frames).toEqual([...v.generate(input)]);
      expect(input).toEqual(before);
      expect(JSON.parse(JSON.stringify(frames))).toEqual(frames);
    }
  }),
);
it('fixed-window boundary bursts differ from exact sliding-window and token policies', () => {
  const events = Array.from({ length: 10 }, (_, i) => ({
    at: i < 5 ? 999 : 1000,
  }));
  for (const [algorithm, allowed] of [
    ['fixed-window', 10],
    ['sliding-log', 5],
    ['sliding-counter', 5],
    ['token-bucket', 5],
  ] as const)
    expect(
      result(rateLimiter(), {
        algorithm,
        limit: 5,
        events,
        refillPerSecond: 2,
      }),
    ).toMatchObject({ allowed });
});
it('token credit refills with time and independent client keys do not share quota', () => {
  expect(
    result(rateLimiter(), {
      limit: 2,
      refillPerSecond: 2,
      events: [{ at: 0 }, { at: 0 }, { at: 0 }, { at: 1000 }, { at: 1000 }],
    }),
  ).toMatchObject({ allowed: 4, rejected: 1 });
  expect(
    result(rateLimiter(), {
      limit: 1,
      events: [
        { at: 0, key: 'a' },
        { at: 0, key: 'b' },
        { at: 0, key: 'a' },
      ],
    }),
  ).toMatchObject({ allowed: 2, rejected: 1 });
  expect(() =>
    rateLimiter().validateInput({ events: [{ at: 10 }, { at: 0 }] }),
  ).toThrow();
});
it('weighted sliding logs consume the request cost rather than just counting entries', () => {
  expect(
    result(rateLimiter(), {
      algorithm: 'sliding-log',
      limit: 5,
      events: [
        { at: 0, cost: 3 },
        { at: 0, cost: 3 },
        { at: 10, cost: 2 },
      ],
    }),
  ).toMatchObject({ allowed: 2, rejected: 1 });
});
it('lost acknowledgment redelivers, while the atomic consumer inbox suppresses a duplicate effect', () => {
  for (const deduplicate of [false, true])
    expect(
      result(messageQueue(), {
        messages: [{ id: 'one', value: 4 }],
        loseFirstAck: true,
        deduplicate,
        ticks: 6,
        visibility: 2,
      }),
    ).toMatchObject({
      effects: [deduplicate ? 4 : 8],
      effectCount: deduplicate ? 1 : 2,
      deliveries: 2,
      done: 1,
      conserved: true,
    });
});
it('pub-sub produces independent subscription effects and poison work reaches the DLQ', () => {
  expect(
    result(messageQueue(), {
      mode: 'pubsub',
      subscribers: 3,
      messages: [{ id: 'one', value: 4 }],
    }),
  ).toMatchObject({ effects: [4, 4, 4], totalTasks: 3, done: 3 });
  expect(
    result(messageQueue(), {
      messages: [{ id: 'poison', value: 4 }],
      failMessage: 'poison',
      maxRetries: 1,
      visibility: 1,
      ticks: 4,
    }),
  ).toMatchObject({
    dead: 1,
    pending: 0,
    deliveries: 2,
    effectCount: 0,
    conserved: true,
  });
  expect(
    result(messageQueue(), {
      messages: [{ id: 'one', value: 4 }],
      loseFirstAck: true,
      ticks: 1,
    }),
  ).toMatchObject({ pending: 1, done: 0, effectCount: 1, conserved: true });
});
it('lost cache invalidation exposes a stale version until TTL removes it', () => {
  const operations = [
    { kind: 'read', key: 'a' },
    { kind: 'write', key: 'a', value: 7 },
    { kind: 'read', key: 'a' },
  ];
  const stale = result(cacheModel(), {
      operations,
      loseInvalidation: true,
      ttl: 8,
    }) as { reads: { value: number; stale: boolean }[] },
    fresh = result(cacheModel(), {
      operations,
      loseInvalidation: false,
      ttl: 8,
    }) as { reads: { value: number; stale: boolean }[] };
  expect(stale.reads.at(-1)).toMatchObject({ value: 1, stale: true });
  expect(fresh.reads.at(-1)).toMatchObject({ value: 7, stale: false });
});
it('write-back crash loses dirty values while orderly LRU eviction flushes them', () => {
  expect(
    result(cacheModel(), {
      strategy: 'write-back',
      operations: [
        { kind: 'write', key: 'a', value: 99 },
        { kind: 'crash' },
        { kind: 'read', key: 'a' },
      ],
    }),
  ).toMatchObject({ dirtyWritesLost: 1, reads: [{ value: 1 }] });
  expect(
    result(cacheModel(), {
      strategy: 'write-back',
      capacity: 1,
      operations: [
        { kind: 'write', key: 'a', value: 7 },
        { kind: 'read', key: 'b' },
        { kind: 'crash' },
        { kind: 'read', key: 'a' },
      ],
    }),
  ).toMatchObject({ dirtyWritesLost: 0, database: { a: { value: 7 } } });
});
it('circuit breaker short-circuits until cooldown and only a successful probe closes it', () => {
  const events = [
    { at: 0, success: false },
    { at: 10, success: false },
    { at: 20, success: true },
    { at: 1010, success: true },
  ];
  const r = result(circuitBreaker, {
    events,
    threshold: 2,
    cooldown: 1000,
  }) as { state: string; history: { called: boolean; state: string }[] };
  expect(r.state).toBe('closed');
  expect(r.history.map((h) => h.called)).toEqual([true, true, false, true]);
  expect(r.history[1].state).toBe('open');
});
it('atomic idempotency distinguishes lost responses, conflicting payloads and split-effect crashes', () => {
  expect(
    result(idempotency(), {
      requests: [
        { key: 'user:one', amount: 10, outcome: 'response-lost' },
        { key: 'user:one', amount: 10 },
        { key: 'user:one', amount: 11 },
      ],
    }),
  ).toMatchObject({ total: 10, effects: 1, reused: 1, conflicts: 1 });
  const requests = [
    { key: 'user:one', amount: 10, outcome: 'crash-between' },
    { key: 'user:one', amount: 10 },
  ];
  expect(result(idempotency(), { atomic: true, requests })).toMatchObject({
    total: 10,
    effects: 1,
  });
  expect(result(idempotency(), { atomic: false, requests })).toMatchObject({
    total: 20,
    effects: 2,
  });
});
it('consistent placement moves keys only to the new shard and load accounting preserves every distinct key', () => {
  const raw = {
      strategy: 'consistent',
      nodes: [0, 1, 2],
      keys: Array.from({ length: 64 }, (_, i) => (i * 13) % 1000),
      newNode: 3,
      replicas: 4,
    },
    r = result(sharding(), raw) as {
      moved: { to: number }[];
      nodeLoads: Record<string, number>;
    };
  expect(r.moved.length).toBeGreaterThan(0);
  for (const move of r.moved) expect(move.to).toBe(3);
  expect(Object.values(r.nodeLoads).reduce((a, b) => a + b, 0)).toBe(64);
});
it('ID generation rejects rollback/overflow or advances logical time without wrapping', () => {
  const events = [
    ...Array.from({ length: 20 }, () => ({ worker: 0, time: 5 })),
    { worker: 0, time: 4 },
  ];
  expect(
    result(distributedIds, { workers: [0], events, clockPolicy: 'reject' }),
  ).toMatchObject({ issued: 16, rejected: 5, collisions: 0 });
  expect(
    result(distributedIds, {
      workers: [0],
      events,
      clockPolicy: 'logical-wait',
    }),
  ).toMatchObject({ issued: 21, rejected: 0, collisions: 0, unique: 21 });
});
it('duplicate worker assignments collide only in the explicitly unsafe demonstration', () => {
  const raw = {
    workers: [1, 1],
    events: [
      { worker: 0, time: 1 },
      { worker: 1, time: 1 },
    ],
  };
  expect(() => distributedIds.validateInput(raw)).toThrow();
  expect(
    result(distributedIds, { ...raw, demonstrateDuplicateWorkers: true }),
  ).toMatchObject({ issued: 2, unique: 1, collisions: 1 });
});
