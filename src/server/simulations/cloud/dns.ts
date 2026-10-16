import 'server-only';
import { z } from 'zod';
import { frame, counters } from '@/engine/helpers';
import type { Visualizer, VisualState } from '@/engine/types';
const ip = z.ipv4();
const schema = z
  .object({
    ttl: z.number().int().min(0).max(12).default(4),
    negativeTTL: z.number().int().min(0).max(12).default(3),
    healthRouting: z.boolean().default(false),
    initial: z.array(ip).min(1).max(4).default(['10.0.0.1']),
    operations: z
      .array(
        z.discriminatedUnion('kind', [
          z.object({ kind: z.literal('query'), client: z.enum(['a', 'b']) }),
          z.object({
            kind: z.literal('update'),
            addresses: z.array(ip).min(1).max(4),
            ttl: z.number().int().min(0).max(12).optional(),
          }),
          z.object({ kind: z.literal('delete') }),
          z.object({
            kind: z.literal('health'),
            address: ip,
            healthy: z.boolean(),
          }),
          z.object({ kind: z.literal('tick') }),
        ]),
      )
      .min(1)
      .max(24),
  })
  .strict()
  .superRefine((p, ctx) => {
    if (
      new Set(p.initial).size !== p.initial.length ||
      p.operations.some(
        (o) =>
          o.kind === 'update' &&
          new Set(o.addresses).size !== o.addresses.length,
      )
    )
      ctx.addIssue({
        code: 'custom',
        message: 'Record addresses must be distinct.',
      });
  });
export const dns: Visualizer<z.infer<typeof schema>> = {
  id: 'route-53-cloud-dns',
  maxSize: 24,
  measureSize: (p) => p.operations.length,
  inputHint:
    'Two independent resolvers query one modeled A-record name. Positive and NXDOMAIN responses have explicit TTLs; cached answers retain the TTL assigned when fetched. A record update does not push an invalidation to resolver caches. Optional health routing filters newly authoritative answers; already cached addresses can remain unhealthy. No real DNS request, complete resolver algorithm or vendor routing API is implemented.',
  controls: [
    {
      key: 'ttl',
      label: 'Initial authoritative TTL ticks',
      type: 'number',
      min: 0,
      max: 12,
    },
    {
      key: 'negativeTTL',
      label: 'Modeled NXDOMAIN cache TTL',
      type: 'number',
      min: 0,
      max: 12,
    },
    {
      key: 'healthRouting',
      label: 'Filter new authoritative answers by modeled health',
      type: 'boolean',
    },
  ],
  presets: {
    best: schema.parse({
      operations: [
        { kind: 'query', client: 'a' },
        { kind: 'query', client: 'a' },
      ],
    }),
    average: schema.parse({
      operations: [
        { kind: 'query', client: 'a' },
        { kind: 'update', addresses: ['10.0.0.2'], ttl: 1 },
        { kind: 'query', client: 'a' },
        { kind: 'query', client: 'b' },
        { kind: 'query', client: 'a' },
      ],
    }),
    worst: schema.parse({
      healthRouting: true,
      operations: [
        { kind: 'query', client: 'a' },
        { kind: 'health', address: '10.0.0.1', healthy: false },
        { kind: 'query', client: 'a' },
        { kind: 'query', client: 'b' },
        { kind: 'delete' },
        { kind: 'query', client: 'a' },
        { kind: 'update', addresses: ['10.0.0.2'] },
        { kind: 'query', client: 'a' },
      ],
    }),
    random: (n) =>
      schema.parse({
        operations: Array.from(
          { length: Math.min(24, Math.max(1, n)) },
          (_, i) =>
            i === 2
              ? { kind: 'update', addresses: ['10.0.0.2'] }
              : { kind: 'query', client: i % 2 ? 'a' : 'b' },
        ),
      }),
  },
  validateInput: (raw) => schema.parse(raw),
  complexity: {
    best: 'Resolver cache hit avoids an authoritative lookup',
    average: 'O(events × addresses) bounded response/health comparison',
    worst:
      'Old positive or negative cache entries remain until their original expiration',
    space: 'O(resolvers × cached addresses + history)',
    why: 'Real DNS includes delegation, recursive caches, multiple record types, DNSSEC and SOA-derived negative caching. TTL is a cache lifetime, not an instant provider failover guarantee.',
    metric: { label: 'Authoritative lookups', keys: ['authoritativeLookups'] },
  },
  *generate(p) {
    type Cache = { addresses: string[]; nxdomain: boolean; expires: number };
    let addresses = [...p.initial],
      exists = true,
      ttl = p.ttl;
    const health = new Map<string, boolean>(),
      caches = new Map<string, Cache>(),
      history: {
        tick: number;
        kind: string;
        client: string | null;
        status: string;
        addresses: string[];
        stale: boolean;
        unhealthyTargets: string[];
      }[] = [],
      c = counters();
    c.authoritativeLookups = 0;
    c.cacheHits = 0;
    c.staleResponses = 0;
    const fresh = () =>
      addresses.filter(
        (address) => !p.healthRouting || health.get(address) !== false,
      );
    const scene: VisualState = {
      kind: 'architecture',
      values: [],
      nodes: [
        {
          id: 'clients',
          label: 'Independent resolver caches A / B',
          x: 0,
          y: 100,
        },
        { id: 'auth', label: 'Authoritative A-record name', x: 280, y: 100 },
        {
          id: 'targets',
          label: 'Address targets + external health',
          x: 560,
          y: 100,
        },
      ],
      edges: [
        { from: 'clients', to: 'auth', label: 'query only on miss/expiry' },
        { from: 'auth', to: 'targets', label: 'new answer policy' },
      ],
    };
    yield frame(
      scene,
      'An authoritative DNS change does not erase already cached answers elsewhere.',
      c,
      1,
    );
    for (let tick = 0; tick < p.operations.length; tick++) {
      const op = p.operations[tick];
      let status = '',
        answer: string[] = [],
        stale = false,
        unhealthyTargets: string[] = [];
      if (op.kind === 'update') {
        addresses = [...op.addresses];
        exists = true;
        ttl = op.ttl ?? ttl;
        status = 'authoritative-record-updated';
      } else if (op.kind === 'delete') {
        exists = false;
        status = 'authoritative-name-deleted';
      } else if (op.kind === 'health') {
        health.set(op.address, op.healthy);
        status = 'health-assumption-updated';
      } else if (op.kind === 'tick') status = 'time-advanced';
      else {
        const cached = caches.get(op.client),
          hit = cached !== undefined && cached.expires > tick;
        yield frame(
          scene,
          'Use a resolver entry only before its stored expiration; a new authoritative TTL does not rewrite that expiration.',
          c,
          3,
          { tick, resolver: op.client, expires: cached?.expires ?? null },
          [],
          {
            prompt: 'Where does this resolver obtain its answer?',
            choices: ['Use its cached response', 'Query the authority'],
            answer: hit ? 'Use its cached response' : 'Query the authority',
            hint: 'Each resolver has its own cache. Expiration was fixed when that response was fetched.',
          },
        );
        if (hit) {
          answer = [...cached.addresses];
          status = cached.nxdomain ? 'cached-NXDOMAIN' : 'cached-positive';
          c.cacheHits++;
          stale =
            cached.nxdomain !== !exists ||
            JSON.stringify([...answer].sort()) !==
              JSON.stringify((exists ? fresh() : []).sort());
        } else {
          c.authoritativeLookups++;
          if (!exists) {
            status = 'authoritative-NXDOMAIN';
            caches.set(op.client, {
              addresses: [],
              nxdomain: true,
              expires: tick + p.negativeTTL,
            });
          } else {
            answer = fresh();
            if (!answer.length) status = 'modeled-no-healthy-answer';
            else {
              status = 'authoritative-positive';
              caches.set(op.client, {
                addresses: [...answer],
                nxdomain: false,
                expires: tick + ttl,
              });
            }
          }
        }
        unhealthyTargets = answer.filter(
          (address) => health.get(address) === false,
        );
        if (stale) c.staleResponses++;
      }
      history.push({
        tick,
        kind: op.kind,
        client: op.kind === 'query' ? op.client : null,
        status,
        addresses: answer,
        stale,
        unhealthyTargets,
      });
      yield frame(
        scene,
        'Inspect stale cached data and current health separately from the authority’s latest record.',
        c,
        5,
        { tick, status, stale, unhealthy: unhealthyTargets.length },
        [
          {
            id: 'clients',
            kind: stale || unhealthyTargets.length ? 'error' : 'visited',
          },
        ],
      );
    }
    yield frame(
      {
        ...scene,
        result: {
          exists,
          authoritativeAddresses: addresses,
          ttl,
          caches: Object.fromEntries(caches),
          history,
          authoritativeLookups: c.authoritativeLookups,
          cacheHits: c.cacheHits,
          staleResponses: c.staleResponses,
          scope:
            'One A-record name, explicit TTL/health assumptions; not a complete DNS resolver or vendor failover protocol.',
        },
      },
      'Plan DNS changes around existing cache lifetimes, negative answers and client behavior; validate the selected provider’s exact routing and health-check rules.',
      c,
      6,
    );
  },
};
