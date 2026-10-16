import { describe, expect, it } from 'vitest';
import type { Visualizer } from '@/engine/types';
import {
  urlShortener,
  videoStreaming,
} from '@/server/simulations/cases/content-delivery';
import { chatApp, newsFeed } from '@/server/simulations/cases/social';
import {
  webCrawler,
  autocomplete,
  rideSharing,
} from '@/server/simulations/cases/search-dispatch';
import { distributedCache } from '@/server/simulations/cases/distributed-cache';
import { paymentLedger } from '@/server/simulations/cases/payment-ledger';
import { foodSaga } from '@/server/simulations/cases/food-saga';
import { notifications } from '@/server/simulations/cases/notifications';
function result<I>(v: Visualizer<I>, raw: unknown) {
  return [...v.generate(v.validateInput(raw))].at(-1)!.state.result as Record<
    string,
    unknown
  >;
}
const cases = [
  notifications,
  distributedCache,
  paymentLedger,
  foodSaga,
  urlShortener,
  videoStreaming,
  chatApp,
  newsFeed,
  webCrawler,
  autocomplete,
  rideSharing,
] as Visualizer<unknown>[];
describe.each(cases)('$id', (v) => {
  it('produces deterministic, immutable, JSON-safe bounded traces for every preset', () => {
    for (const raw of [
      v.presets.best,
      v.presets.average,
      v.presets.worst,
      v.presets.random(8, 42),
    ]) {
      const input = v.validateInput(raw),
        original = structuredClone(input);
      const frames = [...v.generate(input)];
      expect(frames.length).toBeGreaterThan(1);
      expect(frames.length).toBeLessThan(10000);
      expect(input).toEqual(original);
      expect(frames).toEqual([...v.generate(input)]);
      expect(JSON.parse(JSON.stringify(frames))).toEqual(frames);
      expect(frames.at(-1)!.state.result).toBeDefined();
    }
  });
});
it('binds URL idempotency keys to payloads and never allocates a second link on retry', () => {
  const r = result(urlShortener, {
    operations: [
      { kind: 'create', key: 'one', url: 'https://example.test/a' },
      { kind: 'create', key: 'one', url: 'https://example.test/a' },
      { kind: 'create', key: 'one', url: 'https://example.test/b' },
      { kind: 'resolve', code: '001' },
    ],
  });
  expect(Object.keys(r.links as object)).toEqual(['001']);
  expect(
    (r.history as { status: string }[]).slice(0, 3).map((x) => x.status),
  ).toEqual(['created', 'replayed', 'conflict']);
});
it('keeps the same video segment pending during zero bandwidth', () => {
  const r = result(videoStreaming, { bandwidth: [0, 0, 4] });
  expect(r.downloadedSegments).toBe(1);
  expect(r.pendingSegments).toBe(2);
  expect(r.stallSeconds).toBeGreaterThan(0);
});
it('commits an acknowledged-lost chat message once and replays offline recipients', () => {
  const r = result(chatApp, chatApp.presets.average);
  expect(r.commits).toBe(1);
  expect((r.logs as Record<string, unknown[]>).general).toHaveLength(1);
});
it('conserves offline crawl frontier identities and respects canonical fragments and robots', () => {
  const r = result(webCrawler, webCrawler.presets.average);
  expect(r.conserved).toBe(true);
  expect(r.robotsViolations).toBe(0);
  expect(r.blocked).toEqual(['https://a.test/private']);
  expect(r.visited).toHaveLength(3);
  expect(r.discovered).toBe(4);
});
it('ranks trie candidates like an independent prefix filter and frequency sort', () => {
  const input = autocomplete.presets.average;
  const r = result(autocomplete, input);
  const expected = input.dictionary
    .filter((x) => x.word.startsWith(input.prefix))
    .sort((a, b) => b.frequency - a.frequency || a.word.localeCompare(b.word))
    .slice(0, input.k);
  expect((r.final as { suggestions: unknown }).suggestions).toEqual(expected);
});
it('atomic reservation prevents double booking while the explicit unsafe mode demonstrates it', () => {
  const unsafe = rideSharing.presets.worst;
  expect(result(rideSharing, unsafe).doubleBookings).toBe(1);
  const safe = result(rideSharing, { ...unsafe, atomicReservation: true });
  expect(safe.doubleBookings).toBe(0);
  expect(safe.reservationRetries).toBe(1);
});
it('keeps monetary ledgers balanced and cannot resurrect access after a refund', () => {
  const r = result(paymentLedger, paymentLedger.presets.average);
  expect(r.ledgerBalance).toBe(0);
  expect(r.state).toBe('partially-refunded');
  expect(r.entitled).toBe(false);
  expect(r.captured).toBe(19900);
  expect(r.refunded).toBe(5000);
});
it('defers refund-before-capture and accepts its retry after capture', () => {
  const r = result(paymentLedger, {
    amount: 10,
    events: [
      { id: 'r', kind: 'refund', amount: 10 },
      { id: 'c', kind: 'capture', amount: 10 },
      { id: 'r', kind: 'refund', amount: 10 },
      { id: 'late', kind: 'capture', amount: 10 },
    ],
  });
  expect(r.state).toBe('refunded');
  expect(r.ledgerBalance).toBe(0);
  expect(r.entitled).toBe(false);
});
it('does not allow cumulative over-refunds or altered replay identities', () => {
  const r = result(paymentLedger, {
    amount: 10,
    events: [
      { id: 'c', kind: 'capture', amount: 10 },
      { id: 'c', kind: 'refund', amount: 10 },
      { id: 'r', kind: 'refund', amount: 6 },
      { id: 'r2', kind: 'refund', amount: 6 },
    ],
  });
  expect(r.refunded).toBe(6);
  expect((r.history as { status: string }[]).map((x) => x.status)).toContain(
    'event-conflict',
  );
  expect((r.history as { status: string }[]).map((x) => x.status)).toContain(
    'exceeds-refundable',
  );
});
it('keeps unknown captures pending and conserves inventory and courier reservations', () => {
  const r = result(foodSaga, {
    inventory: 2,
    couriers: 2,
    orders: [{ id: 'one', fault: 'capture-uncertain' }, { id: 'two' }],
  });
  expect(r.pendingReconciliation).toBe(1);
  expect(r.reserved).toBe(1);
  expect(r.fulfilled).toBe(1);
  expect(r.inventoryConserved).toBe(true);
  expect(r.couriersConserved).toBe(true);
});
it.each(['authorization', 'courier', 'capture-failed'] as const)(
  'compensates known %s failures without leaking resources',
  (fault) => {
    const r = result(foodSaga, {
      inventory: 1,
      couriers: 1,
      orders: [{ id: 'one', fault }],
    });
    expect(r.inventory).toBe(1);
    expect(r.freeCouriers).toBe(1);
    expect(r.reserved).toBe(0);
    expect(r.inventoryConserved).toBe(true);
    expect(r.couriersConserved).toBe(true);
  },
);
it('serves cached hits during origin failure and refuses uncached reads', () => {
  const r = result(distributedCache, {
    originDown: true,
    operations: [{ kind: 'get', key: 1 }],
  });
  expect(r.hits).toBe(0);
  expect(r.misses).toBe(1);
  expect((r.history as { status: string }[])[0].status).toBe(
    'origin-unavailable',
  );
});
it('expires entries at TTL and reloads misses from the origin', () => {
  const r = result(distributedCache, {
    ttl: 2,
    operations: [
      { kind: 'get', key: 1 },
      { kind: 'get', key: 1 },
      { kind: 'get', key: 1 },
    ],
  });
  expect(r.hits).toBe(1);
  expect(r.misses).toBe(2);
});
it('isolates a failed notification channel without blocking healthy channels', () => {
  const p = notifications.validateInput({
    ...notifications.presets.best,
    mode: 'pubsub',
    subscribers: 3,
    failSubscriber: 1,
    ticks: 20,
  });
  const r = result(notifications, p);
  expect(r.conserved).toBe(true);
  expect(r.done).toBe(p.messages.length * 2);
  expect(r.dead).toBe(p.messages.length);
});
it('nearest-driver pruning matches a full independent scan and stable ID tie-break', () => {
  for (let n = 1; n <= 12; n++) {
    const p = rideSharing.validateInput({
      ...rideSharing.presets.random(n, 42),
      batchSize: 1,
    });
    const remaining = [...p.drivers],
      expected: number[] = [];
    for (const rider of p.riders) {
      remaining.sort(
        (a, b) =>
          (a.x - rider.x) ** 2 +
            (a.y - rider.y) ** 2 -
            ((b.x - rider.x) ** 2 + (b.y - rider.y) ** 2) || a.id - b.id,
      );
      if (remaining.length) expected.push(remaining.shift()!.id);
    }
    const r = result(rideSharing, p);
    expect(
      (r.assignments as { driver: number }[]).map((x) => x.driver),
    ).toEqual(expected);
  }
});
it('a recovered stale owner is an explicit read-freshness failure until TTL expiry', () => {
  let witnessed = false;
  for (let failedNode = 0; failedNode < 3; failedNode++) {
    const r = result(distributedCache, {
      failedNode,
      failAt: 1,
      restoreAt: 2,
      ttl: 10,
      operations: [
        { kind: 'get', key: 1 },
        { kind: 'put', key: 1, value: 99 },
        { kind: 'get', key: 1 },
      ],
    });
    if ((r.staleReads as number) > 0) witnessed = true;
  }
  expect(witnessed).toBe(true);
});
