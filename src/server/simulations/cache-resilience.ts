import 'server-only';
import { z } from 'zod';
import { frame, counters } from '@/engine/helpers';
import type { Visualizer, Frame, VisualState } from '@/engine/types';
const cacheSchema = z
  .object({
    strategy: z
      .enum(['cache-aside', 'write-through', 'write-back'])
      .default('cache-aside'),
    capacity: z.number().int().min(1).max(8).default(2),
    ttl: z.number().int().min(1).max(32).default(8),
    loseInvalidation: z.boolean().default(false),
    operations: z
      .array(
        z
          .object({
            kind: z.enum(['read', 'write', 'invalidate', 'tick', 'crash']),
            key: z.string().min(1).max(16).default('a'),
            value: z.number().int().min(-999).max(999).optional(),
          })
          .refine(
            (op) => op.kind !== 'write' || op.value !== undefined,
            'Writes require a value.',
          ),
      )
      .min(1)
      .max(32),
  })
  .strict();
export type CacheInput = z.infer<typeof cacheSchema>;
export function cacheModel(slug = 'caching'): Visualizer<CacheInput> {
  const discovery = slug === 'service-discovery';
  const parse = (raw: unknown) =>
    cacheSchema.parse(
      raw && typeof raw === 'object' && !Array.isArray(raw)
        ? { loseInvalidation: discovery, ttl: discovery ? 5 : 8, ...raw }
        : raw,
    );
  const operations = discovery
    ? [
        { kind: 'read', key: 'a' },
        { kind: 'write', key: 'a', value: 7 },
        { kind: 'read', key: 'a' },
        { kind: 'tick' },
        { kind: 'tick' },
        { kind: 'read', key: 'a' },
      ]
    : [
        { kind: 'read', key: 'a' },
        { kind: 'read', key: 'a' },
        { kind: 'write', key: 'a', value: 7 },
        { kind: 'read', key: 'a' },
        { kind: 'read', key: 'b' },
      ];
  return {
    id: slug,
    maxSize: 32,
    measureSize: (input) => input.operations.length,
    inputHint:
      'The durable store starts with a=1,b=2. Each operation advances one tick. Compare cache-aside, write-through and write-back; loseInvalidation demonstrates stale reads, and crash drops unflushed dirty entries.',
    controls: [
      {
        key: 'strategy',
        label: 'Write policy',
        type: 'select',
        options: ['cache-aside', 'write-through', 'write-back'].map(
          (value) => ({ value, label: value }),
        ),
      },
      {
        key: 'capacity',
        label: 'LRU cache entries',
        type: 'number',
        min: 1,
        max: 8,
      },
      {
        key: 'ttl',
        label: 'TTL in operation ticks',
        type: 'number',
        min: 1,
        max: 32,
      },
      {
        key: 'loseInvalidation',
        label: 'Lose cache-aside invalidation',
        type: 'boolean',
      },
    ],
    presets: {
      best: parse({
        operations: [
          { kind: 'read', key: 'a' },
          { kind: 'read', key: 'a' },
        ],
      }),
      average: parse({ operations }),
      worst: discovery
        ? parse({ operations, ttl: 32, loseInvalidation: true })
        : parse({
            strategy: 'write-back',
            operations: [
              { kind: 'write', key: 'a', value: 99 },
              { kind: 'crash' },
              { kind: 'read', key: 'a' },
            ],
          }),
      random: (n) =>
        parse({
          operations: Array.from(
            { length: Math.min(32, Math.max(1, n)) },
            (_, i) => ({
              kind: 'read',
              key: String.fromCharCode(97 + (i % 4)),
            }),
          ),
        }),
    },
    validateInput: (raw) => parse(raw),
    complexity: {
      metric: { label: 'Durable store reads', keys: ['databaseReads'] },
      best: 'Cache hit avoids a durable-store read',
      average:
        'Expected O(1) map lookup; this small TTL trace scans O(capacity)',
      worst:
        'Invalidation loss permits stale reads; dirty cache loss can lose acknowledged writes',
      space: 'O(capacity) cache plus example durable keys',
      why: 'Cache-aside reads populate a cache and writes invalidate it. Write-through updates both stores in this abstract serial operation model; a real implementation must handle partial failures. Write-back acknowledges dirty cached values before persistence, so crash durability differs. TTL and LRU policy are explicit, and an expired dirty entry is flushed before removal in this model.',
    },
    *generate(input) {
      type Value = { value: number; version: number };
      type Entry = Value & { expires: number; dirty: boolean };
      const db = new Map<string, Value>([
          ['a', { value: 1, version: 0 }],
          ['b', { value: 2, version: 0 }],
        ]),
        cache = new Map<string, Entry>(),
        c = counters(),
        reads: {
          tick: number;
          key: string;
          value: number | null;
          hit: boolean;
          stale: boolean;
          durable: boolean;
        }[] = [];
      c.cacheHits = 0;
      c.cacheMisses = 0;
      c.databaseReads = 0;
      c.databaseWrites = 0;
      c.dirtyWritesLost = 0;
      function scene(): VisualState {
        return {
          kind: 'architecture',
          values: [],
          nodes: [
            { id: 'client', label: 'Client', x: 0, y: 80 },
            { id: 'app', label: input.strategy, x: 210, y: 80 },
            {
              id: 'cache',
              label: `${discovery ? 'Resolver TTL cache' : 'LRU cache'} ${cache.size}/${input.capacity}`,
              x: 430,
              y: 0,
            },
            {
              id: 'db',
              label: discovery ? 'Endpoint registry' : 'Durable store',
              x: 650,
              y: 140,
            },
          ],
          edges: [
            { from: 'client', to: 'app' },
            { from: 'app', to: 'cache' },
            { from: 'app', to: 'db' },
            { from: 'cache', to: 'db', label: 'dirty flush' },
          ],
        };
      }
      function emit(
        text: string,
        line: number,
        tick: number,
        vars: Frame['variables'] = {},
        action?: Frame['action'],
      ) {
        return frame(
          scene(),
          text,
          c,
          line,
          {
            tick,
            cache: JSON.stringify(Object.fromEntries(cache)),
            database: JSON.stringify(Object.fromEntries(db)),
            ...vars,
          },
          [],
          action,
        );
      }
      function flush(key: string, entry: Entry) {
        if (entry.dirty) {
          db.set(key, { value: entry.value, version: entry.version });
          entry.dirty = false;
          c.databaseWrites++;
          c.writes++;
        }
      }
      function put(key: string, entry: Entry) {
        cache.delete(key);
        if (cache.size >= input.capacity) {
          const oldest = cache.entries().next().value!;
          flush(oldest[0], oldest[1]);
          cache.delete(oldest[0]);
        }
        cache.set(key, entry);
        c.writes++;
      }
      yield emit(
        'Define which store owns the latest value and when it becomes durable.',
        1,
        0,
      );
      for (let tick = 0; tick < input.operations.length; tick++) {
        for (const [key, entry] of cache)
          if (entry.expires <= tick) {
            flush(key, entry);
            cache.delete(key);
            c.writes++;
          }
        const op = input.operations[tick];
        yield emit(
          'Evaluate this operation under the selected cache and persistence policy.',
          3,
          tick,
          { operation: op.kind, key: op.key },
          {
            prompt: 'Does a cached value automatically prove it is durable?',
            choices: ['No', 'Yes'],
            answer: 'No',
            hint: 'Write-back may acknowledge a dirty cache entry before the durable store contains it.',
          },
        );
        if (op.kind === 'read') {
          let entry = cache.get(op.key);
          const hit = entry !== undefined;
          if (hit) {
            c.cacheHits++;
            cache.delete(op.key);
            cache.set(op.key, entry!);
          } else {
            c.cacheMisses++;
            c.databaseReads++;
            const persisted = db.get(op.key);
            if (persisted) {
              entry = { ...persisted, expires: tick + input.ttl, dirty: false };
              put(op.key, entry);
            }
          }
          const persisted = db.get(op.key),
            stale =
              entry !== undefined &&
              persisted !== undefined &&
              entry.version < persisted.version;
          reads.push({
            tick,
            key: op.key,
            value: entry?.value ?? null,
            hit,
            stale,
            durable: entry !== undefined && !entry.dirty,
          });
          c.reads++;
          yield emit(
            stale
              ? 'The returned cache version is older than the durable version.'
              : hit
                ? 'Serve the cached value under its TTL.'
                : 'Read the durable store and populate an LRU entry.',
            5,
            tick,
            { hit, stale, value: entry?.value ?? null },
          );
        } else if (op.kind === 'write') {
          const version =
            Math.max(
              db.get(op.key)?.version ?? 0,
              cache.get(op.key)?.version ?? 0,
            ) + 1;
          if (input.strategy === 'write-back')
            put(op.key, {
              value: op.value!,
              version,
              expires: tick + input.ttl,
              dirty: true,
            });
          else {
            db.set(op.key, { value: op.value!, version });
            c.databaseWrites++;
            c.writes++;
            if (input.strategy === 'write-through')
              put(op.key, {
                value: op.value!,
                version,
                expires: tick + input.ttl,
                dirty: false,
              });
            else if (!input.loseInvalidation) cache.delete(op.key);
          }
          yield emit(
            'Apply the write using the declared persistence boundary.',
            5,
            tick,
            { value: op.value!, version },
          );
        } else if (op.kind === 'invalidate') {
          const entry = cache.get(op.key);
          if (entry) flush(op.key, entry);
          cache.delete(op.key);
          c.writes++;
        } else if (op.kind === 'crash') {
          c.dirtyWritesLost += [...cache.values()].filter(
            (e) => e.dirty,
          ).length;
          cache.clear();
          yield emit(
            'A cache crash loses every unflushed dirty value in this model.',
            5,
            tick,
          );
        }
      }
      const f = emit(
        'Compare observed reads, durable versions and lost dirty writes.',
        6,
        input.operations.length - 1,
      );
      f.state.result = {
        reads,
        database: Object.fromEntries(db),
        cache: Object.fromEntries(cache),
        dirtyWritesLost: c.dirtyWritesLost,
      };
      yield f;
    },
  };
}
const breakerSchema = z
  .object({
    threshold: z.number().int().min(1).max(8).default(2),
    cooldown: z.number().int().min(1).max(10000).default(1000),
    events: z
      .array(
        z.object({
          at: z.number().int().min(0).max(100000),
          success: z.boolean(),
        }),
      )
      .min(1)
      .max(32),
  })
  .strict()
  .refine(
    (p) => p.events.every((e, i) => i === 0 || e.at >= p.events[i - 1].at),
    'Events must be ordered by time.',
  );
export const circuitBreaker: Visualizer<z.infer<typeof breakerSchema>> = {
  id: 'circuit-breaker',
  maxSize: 32,
  measureSize: (p) => p.events.length,
  inputHint:
    'Serial calls have millisecond timestamps and a predetermined dependency outcome. threshold counts consecutive failures; cooldown controls when one half-open probe can run. This serial model does not simulate concurrent probe races.',
  controls: [
    {
      key: 'threshold',
      label: 'Consecutive failures to open',
      type: 'number',
      min: 1,
      max: 8,
    },
    {
      key: 'cooldown',
      label: 'Cooldown milliseconds',
      type: 'number',
      min: 1,
      max: 10000,
    },
  ],
  presets: {
    best: breakerSchema.parse({
      events: [
        { at: 0, success: true },
        { at: 100, success: true },
      ],
    }),
    average: breakerSchema.parse({
      events: [
        { at: 0, success: false },
        { at: 10, success: false },
        { at: 20, success: true },
        { at: 1200, success: true },
        { at: 1300, success: true },
      ],
    }),
    worst: breakerSchema.parse({
      events: Array.from({ length: 12 }, (_, i) => ({
        at: i * 250,
        success: false,
      })),
    }),
    random: (n) =>
      breakerSchema.parse({
        events: Array.from(
          { length: Math.min(32, Math.max(1, n)) },
          (_, i) => ({ at: i * 250, success: i % 4 === 0 }),
        ),
      }),
  },
  validateInput: (raw) => breakerSchema.parse(raw),
  complexity: {
    metric: { label: 'Actual dependency calls', keys: ['dependencyCalls'] },
    best: 'Closed successful calls pass through',
    average: 'Open circuits shed load without calling the failing dependency',
    worst: 'Repeated failed probes reopen the circuit',
    space: 'O(1) breaker state plus trace history',
    why: 'A circuit breaker differs from a retry loop: it stops calls after repeated failure, waits, then tests recovery. Timeouts, bulkheads, retry budgets and idempotency remain separate concerns. Only consecutive failures and serial probes are modeled here.',
  },
  *generate(input) {
    const c = counters();
    c.dependencyCalls = 0;
    c.shortCircuits = 0;
    let state: 'closed' | 'open' | 'half-open' = 'closed',
      failures = 0,
      retryAt = 0;
    const history: {
      at: number;
      called: boolean;
      state: string;
      success: boolean | null;
    }[] = [];
    const scene = (status: string): VisualState => ({
      kind: 'architecture',
      values: [],
      nodes: [
        { id: 'client', label: 'Client', x: 0, y: 70 },
        { id: 'breaker', label: `Breaker: ${status}`, x: 220, y: 70 },
        { id: 'dependency', label: 'Dependency', x: 440, y: 70 },
      ],
      edges: [
        { from: 'client', to: 'breaker' },
        { from: 'breaker', to: 'dependency' },
      ],
    });
    yield frame(
      scene(state),
      'Start closed and count only actual dependency failures.',
      c,
      1,
      { state, failures },
    );
    for (const event of input.events) {
      if (state === 'open' && event.at >= retryAt) state = 'half-open';
      const called = state !== 'open';
      yield frame(
        scene(state),
        'Decide whether this request may call the dependency.',
        c,
        3,
        { at: event.at, state, failures, retryAt },
        [{ id: 'breaker', kind: called ? 'comparing' : 'error' }],
        {
          prompt: 'May this request call the dependency now?',
          choices: ['Call', 'Short-circuit'],
          answer: called ? 'Call' : 'Short-circuit',
          hint: 'Open circuits reject until cooldown. A half-open probe tests whether to close or reopen.',
        },
      );
      if (!called) c.shortCircuits++;
      else {
        c.dependencyCalls++;
        if (event.success) {
          state = 'closed';
          failures = 0;
        } else {
          failures++;
          if (state === 'half-open' || failures >= input.threshold) {
            state = 'open';
            retryAt = event.at + input.cooldown;
          }
        }
      }
      history.push({
        at: event.at,
        called,
        state,
        success: called ? event.success : null,
      });
      yield frame(
        scene(state),
        'Update the breaker from the real call outcome, not from a short-circuited request.',
        c,
        5,
        { state, failures, retryAt },
      );
    }
    yield frame(
      { ...scene(state), result: { state, failures, retryAt, history } },
      'A successful probe restores calls; failed probes preserve protection.',
      c,
      6,
      { state },
    );
  },
};
const idempotencySchema = z
  .object({
    atomic: z.boolean().default(true),
    requests: z
      .array(
        z.object({
          key: z.string().min(1).max(32),
          amount: z.number().int().min(0).max(1000),
          outcome: z
            .enum(['ok', 'response-lost', 'crash-between'])
            .default('ok'),
        }),
      )
      .min(1)
      .max(32),
  })
  .strict();
export function idempotency(
  slug = 'idempotency-retries',
): Visualizer<z.infer<typeof idempotencySchema>> {
  return {
    id: slug,
    maxSize: 32,
    measureSize: (p) => p.requests.length,
    inputHint:
      'Example ledger requests have a caller-scoped key, amount and failure point. atomic commits the local idempotency record and ledger effect together. crash-between demonstrates why split writes can duplicate effects; no real payment occurs.',
    controls: [
      {
        key: 'atomic',
        label: 'Atomic inbox + local ledger transaction',
        type: 'boolean',
      },
    ],
    presets: {
      best: idempotencySchema.parse({
        requests: [
          { key: 'user:1', amount: 10 },
          { key: 'user:1', amount: 10 },
        ],
      }),
      average: idempotencySchema.parse({
        requests: [
          { key: 'user:1', amount: 10, outcome: 'response-lost' },
          { key: 'user:1', amount: 10 },
          { key: 'user:1', amount: 11 },
        ],
      }),
      worst: idempotencySchema.parse({
        atomic: false,
        requests: [
          { key: 'user:1', amount: 10, outcome: 'crash-between' },
          { key: 'user:1', amount: 10 },
        ],
      }),
      random: (n) =>
        idempotencySchema.parse({
          requests: Array.from(
            { length: Math.min(32, Math.max(1, n)) },
            (_, i) => ({ key: `user:${Math.floor(i / 2)}`, amount: 10 }),
          ),
        }),
    },
    validateInput: (raw) => idempotencySchema.parse(raw),
    complexity: {
      metric: { label: 'Committed local ledger effects', keys: ['effects'] },
      best: 'A matching retry reuses the saved result',
      average: 'Expected O(1) key lookup per local request',
      worst: 'Split persistence can duplicate effects after a crash',
      space: 'O(retained idempotency keys) plus ledger history',
      why: 'Idempotency requires a stable request identity, matching payload and an atomic boundary around the effect being protected. A local transaction can join an inbox record and a local ledger effect. External provider calls need their own idempotency and reconciliation; a local database transaction cannot atomically commit an unrelated payment network.',
    },
    *generate(input) {
      const c = counters(),
        records = new Map<string, { amount: number; receipt: number }>(),
        ledger: { key: string; amount: number; receipt: number }[] = [],
        responses: { key: string; status: string; receipt: number | null }[] =
          [];
      c.effects = 0;
      c.reused = 0;
      c.conflicts = 0;
      let total = 0;
      const scene: VisualState = {
        kind: 'architecture',
        values: [],
        nodes: [
          { id: 'client', label: 'Client retries', x: 0, y: 80 },
          {
            id: 'handler',
            label: input.atomic
              ? 'Atomic local transaction'
              : 'Split persistence',
            x: 220,
            y: 80,
          },
          { id: 'keys', label: 'Idempotency records', x: 450, y: 0 },
          { id: 'ledger', label: 'Local example ledger', x: 450, y: 160 },
        ],
        edges: [
          { from: 'client', to: 'handler' },
          { from: 'handler', to: 'keys' },
          { from: 'handler', to: 'ledger' },
        ],
      };
      yield frame(
        scene,
        'Scope each key to its caller and bind it to one request payload.',
        c,
        1,
        { atomic: input.atomic },
      );
      for (const request of input.requests) {
        const saved = records.get(request.key);
        c.reads++;
        yield frame(
          scene,
          'Check the stored identity and payload before applying another effect.',
          c,
          3,
          {
            key: request.key,
            amount: request.amount,
            saved: saved !== undefined,
          },
          [{ id: 'keys', kind: 'comparing' }],
          {
            prompt: 'May the same key identify a different amount?',
            choices: ['No; reject conflict', 'Yes; silently reuse it'],
            answer: 'No; reject conflict',
            hint: 'An idempotency key identifies one operation, not every future operation from that caller.',
          },
        );
        if (saved) {
          if (saved.amount !== request.amount) {
            c.conflicts++;
            responses.push({
              key: request.key,
              status: 'conflict',
              receipt: null,
            });
          } else {
            c.reused++;
            responses.push({
              key: request.key,
              status: 'replayed',
              receipt: saved.receipt,
            });
          }
          continue;
        }
        if (input.atomic && request.outcome === 'crash-between') {
          responses.push({
            key: request.key,
            status: 'rolled-back',
            receipt: null,
          });
          yield frame(
            scene,
            'The local transaction rolls back both the record and effect.',
            c,
            5,
            { key: request.key },
          );
          continue;
        }
        const receipt = ledger.length + 1;
        ledger.push({ key: request.key, amount: request.amount, receipt });
        total += request.amount;
        c.effects++;
        c.writes++;
        if (request.outcome === 'crash-between') {
          responses.push({
            key: request.key,
            status: 'effect-without-record',
            receipt: null,
          });
          yield frame(
            scene,
            'The split effect committed before its deduplication record; retry can duplicate it.',
            c,
            5,
            { key: request.key },
            [{ id: 'ledger', kind: 'error' }],
          );
          continue;
        }
        records.set(request.key, { amount: request.amount, receipt });
        c.writes++;
        responses.push({
          key: request.key,
          status:
            request.outcome === 'response-lost'
              ? 'committed-response-lost'
              : 'ok',
          receipt: request.outcome === 'response-lost' ? null : receipt,
        });
        yield frame(
          scene,
          'The saved result makes a later matching retry reuse this committed effect.',
          c,
          5,
          { key: request.key, receipt, total },
        );
      }
      yield frame(
        {
          ...scene,
          result: {
            ledger,
            total,
            responses,
            effects: c.effects,
            reused: c.reused,
            conflicts: c.conflicts,
          },
        },
        'Distinguish a lost response from an uncommitted effect, and a local transaction from an external network.',
        c,
        6,
        { total },
      );
    },
  };
}
