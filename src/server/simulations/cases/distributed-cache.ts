import 'server-only';
import { z } from 'zod';
import { frame, counters } from '@/engine/helpers';
import type { Visualizer, VisualState } from '@/engine/types';
import { hash32 } from '../ids-sharding';
const schema = z
  .object({
    nodes: z.number().int().min(2).max(5).default(3),
    replication: z.number().int().min(1).max(2).default(2),
    capacity: z.number().int().min(1).max(16).default(4),
    ttl: z.number().int().min(1).max(32).default(6),
    failedNode: z.number().int().min(-1).max(4).default(-1),
    failAt: z.number().int().min(0).max(31).default(2),
    restoreAt: z.number().int().min(-1).max(32).default(-1),
    originDown: z.boolean().default(false),
    operations: z
      .array(
        z.discriminatedUnion('kind', [
          z.object({
            kind: z.literal('get'),
            key: z.number().int().min(0).max(99),
          }),
          z.object({
            kind: z.literal('put'),
            key: z.number().int().min(0).max(99),
            value: z.number().int().min(-999).max(999),
          }),
        ]),
      )
      .min(1)
      .max(32),
  })
  .strict()
  .superRefine((p, ctx) => {
    if (p.failedNode >= p.nodes)
      ctx.addIssue({ code: 'custom', message: 'Failed node must exist.' });
    if (p.restoreAt !== -1 && p.restoreAt <= p.failAt)
      ctx.addIssue({
        code: 'custom',
        message: 'Restoration must follow failure.',
      });
  });
export const distributedCache: Visualizer<z.infer<typeof schema>> = {
  id: 'distributed-cache-design',
  maxSize: 32,
  measureSize: (p) => p.operations.length,
  inputHint:
    'Fixed membership consistent-hash ring, eight virtual tokens per node, distinct physical replica owners. Per-node LRU/TTL caches fill from a durable origin. Writes update healthy owners only; a recovered owner may serve an old version until TTL. originDown affects misses and writes, not cached hits. Tick = operation index.',
  controls: [
    {
      key: 'replication',
      label: 'Distinct cache replicas',
      type: 'number',
      min: 1,
      max: 2,
    },
    {
      key: 'capacity',
      label: 'Entries per cache node',
      type: 'number',
      min: 1,
      max: 16,
    },
    {
      key: 'ttl',
      label: 'Cache TTL operations',
      type: 'number',
      min: 1,
      max: 32,
    },
    {
      key: 'failedNode',
      label: 'Failed cache node (-1 = none)',
      type: 'number',
      min: -1,
      max: 4,
    },
    { key: 'originDown', label: 'Origin unavailable', type: 'boolean' },
  ],
  presets: {
    best: schema.parse({
      operations: [
        { kind: 'get', key: 1 },
        { kind: 'get', key: 1 },
      ],
    }),
    average: schema.parse({
      failedNode: 0,
      operations: [
        { kind: 'get', key: 1 },
        { kind: 'get', key: 2 },
        { kind: 'get', key: 1 },
        { kind: 'put', key: 1, value: 99 },
        { kind: 'get', key: 1 },
      ],
    }),
    worst: schema.parse({
      capacity: 1,
      ttl: 1,
      originDown: true,
      operations: [
        { kind: 'get', key: 1 },
        { kind: 'put', key: 1, value: 7 },
      ],
    }),
    random: (n) =>
      schema.parse({
        operations: Array.from(
          { length: Math.min(32, Math.max(1, n)) },
          (_, i) => ({ kind: 'get', key: i % 5 }),
        ),
      }),
  },
  validateInput: (raw) => schema.parse(raw),
  complexity: {
    best: 'O(V log V) ring construction; O(log V + R) owner lookup',
    average: 'Bounded replica probes plus origin fill on miss',
    worst:
      'Misses fail when all replicas lack data and the origin is unavailable',
    space: 'O(nodes × capacity + origin keys + V)',
    why: 'V = eight virtual tokens per node; R = distinct replica count. No membership migration or consensus is modeled.',
    metric: { label: 'Cache probes', keys: ['probes'] },
  },
  *generate(p) {
    type Entry = { value: number; version: number; expires: number };
    const stores = Array.from(
        { length: p.nodes },
        () => new Map<number, Entry>(),
      ),
      origin = new Map<number, { value: number; version: number }>(),
      history: {
        tick: number;
        kind: string;
        key: number;
        status: string;
        value: number | null;
        version: number | null;
        stale: boolean;
        owner: number | null;
      }[] = [],
      c = counters();
    c.probes = 0;
    c.hits = 0;
    c.misses = 0;
    c.evictions = 0;
    c.replicaHits = 0;
    c.staleReads = 0;
    const ring = Array.from({ length: p.nodes * 8 }, (_, i) => ({
      token: hash32(`node:${Math.floor(i / 8)}:${i % 8}`),
      node: Math.floor(i / 8),
    })).sort((a, b) => a.token - b.token || a.node - b.node);
    function owners(key: number) {
      const token = hash32(`key:${key}`);
      let lo = 0,
        hi = ring.length;
      while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (ring[mid].token < token) lo = mid + 1;
        else hi = mid;
      }
      const out: number[] = [];
      for (let i = 0; out.length < p.replication; i++) {
        const node = ring[(lo + i) % ring.length].node;
        if (!out.includes(node)) out.push(node);
      }
      return out;
    }
    const healthy = (node: number, tick: number) =>
      !(
        node === p.failedNode &&
        tick >= p.failAt &&
        (p.restoreAt < 0 || tick < p.restoreAt)
      );
    function fill(node: number, key: number, entry: Entry) {
      const store = stores[node];
      store.delete(key);
      store.set(key, { ...entry });
      if (store.size > p.capacity) {
        store.delete(store.keys().next().value!);
        c.evictions++;
      }
      c.writes++;
    }
    const scene: VisualState = {
      kind: 'architecture',
      values: [],
      nodes: [
        { id: 'client', label: 'Cache client + owner ring', x: 0, y: 100 },
        ...stores.map((_, i) => ({
          id: `cache${i}`,
          label: `Cache ${i}: LRU + TTL`,
          x: 240,
          y: i * 100,
        })),
        { id: 'origin', label: 'Durable origin versions', x: 500, y: 100 },
      ],
      edges: stores.flatMap((_, i) => [
        { from: 'client', to: `cache${i}` },
        { from: `cache${i}`, to: 'origin' },
      ]),
    };
    yield frame(
      scene,
      'Build virtual tokens and choose distinct physical owners; replication is separate from token count.',
      c,
      1,
    );
    for (let tick = 0; tick < p.operations.length; tick++) {
      const op = p.operations[tick],
        targets = owners(op.key),
        current = origin.get(op.key) ?? { value: op.key * 10, version: 0 };
      for (const store of stores)
        for (const [key, entry] of store)
          if (entry.expires <= tick) store.delete(key);
      yield frame(
        scene,
        'Choose the next operation from current cache health and durable origin availability.',
        c,
        2,
        { tick, key: op.key, owners: targets.join(',') },
        [],
        {
          prompt: `Can a cache hit satisfy this ${op.kind} operation?`,
          choices: ['Probe cached replicas', 'A write requires the origin'],
          answer:
            op.kind === 'get'
              ? 'Probe cached replicas'
              : 'A write requires the origin',
          hint: 'This model uses write-through durable updates; a cached value is sufficient only for reads.',
        },
      );
      if (op.kind === 'put') {
        if (p.originDown)
          history.push({
            tick,
            kind: op.kind,
            key: op.key,
            status: 'origin-unavailable',
            value: null,
            version: null,
            stale: false,
            owner: null,
          });
        else {
          const next = { value: op.value, version: current.version + 1 };
          origin.set(op.key, next);
          c.writes++;
          for (const node of targets)
            if (healthy(node, tick))
              fill(node, op.key, { ...next, expires: tick + p.ttl });
          history.push({
            tick,
            kind: op.kind,
            key: op.key,
            status: 'stored',
            ...next,
            stale: false,
            owner: null,
          });
        }
      } else {
        let found: Entry | undefined,
          owner: number | null = null;
        for (const node of targets) {
          if (!healthy(node, tick)) continue;
          c.probes++;
          const entry = stores[node].get(op.key);
          if (entry) {
            found = entry;
            owner = node;
            stores[node].delete(op.key);
            stores[node].set(op.key, entry);
            break;
          }
        }
        if (found) {
          c.hits++;
          if (owner !== targets[0]) c.replicaHits++;
          const stale = found.version !== current.version;
          if (stale) c.staleReads++;
          history.push({
            tick,
            kind: op.kind,
            key: op.key,
            status: 'hit',
            value: found.value,
            version: found.version,
            stale,
            owner,
          });
        } else {
          c.misses++;
          if (p.originDown)
            history.push({
              tick,
              kind: op.kind,
              key: op.key,
              status: 'origin-unavailable',
              value: null,
              version: null,
              stale: false,
              owner: null,
            });
          else {
            c.reads++;
            for (const node of targets)
              if (healthy(node, tick))
                fill(node, op.key, { ...current, expires: tick + p.ttl });
            history.push({
              tick,
              kind: op.kind,
              key: op.key,
              status: 'origin-fill',
              ...current,
              stale: false,
              owner: null,
            });
          }
        }
      }
      yield frame(
        {
          ...scene,
          nodes: scene.nodes!.map((n) => ({
            ...n,
            label: n.id.startsWith('cache')
              ? `${n.label}${healthy(Number(n.id.slice(5)), tick) ? '' : ' · down'}`
              : n.label,
          })),
        },
        'Record freshness against an audit oracle; serving a cache hit does not contact that oracle.',
        c,
        5,
        { tick, status: history.at(-1)!.status },
        targets
          .filter((n) => !healthy(n, tick))
          .map((n) => ({ id: `cache${n}`, kind: 'error' as const })),
      );
    }
    yield frame(
      {
        ...scene,
        result: {
          history,
          origin: Object.fromEntries(origin),
          stores: stores.map((s) => Object.fromEntries(s)),
          hits: c.hits,
          misses: c.misses,
          replicaHits: c.replicaHits,
          staleReads: c.staleReads,
          evictions: c.evictions,
        },
      },
      'Replication improves availability, while write propagation, TTL and recovery policy determine freshness.',
      c,
      6,
    );
  },
};
