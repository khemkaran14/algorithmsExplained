import 'server-only';
import { z } from 'zod';
import { frame, counters } from '@/engine/helpers';
import type { Visualizer, VisualState } from '@/engine/types';
const schema = z
  .object({
    requests: z.number().int().min(0).max(100000000).default(1000000),
    cacheHitPercent: z.number().min(0).max(100).default(60),
    replicas: z.number().int().min(1).max(100).default(3),
    hours: z.number().min(0).max(744).default(730),
    storageGB: z.number().min(0).max(100000).default(100),
    responseKB: z.number().min(0).max(10000).default(20),
    publicEgressPercent: z.number().min(0).max(100).default(100),
    instanceHourly: z.number().min(0).max(1000).default(0.05),
    storageGBMonth: z.number().min(0).max(100).default(0.02),
    egressGB: z.number().min(0).max(100).default(0.09),
    perMillionOriginRequests: z.number().min(0).max(1000).default(1),
    cacheMonthly: z.number().min(0).max(10000).default(30),
    mode: z.enum(['instances', 'per-request']).default('instances'),
  })
  .strict();
export function calculateCost(p: z.infer<typeof schema>) {
  const originRequests = p.requests * (1 - p.cacheHitPercent / 100),
    compute =
      p.mode === 'instances'
        ? p.replicas * p.hours * p.instanceHourly
        : (originRequests / 1000000) * p.perMillionOriginRequests,
    storage = p.storageGB * p.storageGBMonth * (p.hours / 730),
    egress =
      ((p.requests * p.responseKB) / 1000000) *
      (p.publicEgressPercent / 100) *
      p.egressGB,
    cache = p.cacheHitPercent > 0 ? p.cacheMonthly * (p.hours / 730) : 0;
  return {
    originRequests,
    compute,
    storage,
    egress,
    cache,
    total: compute + storage + egress + cache,
  };
}
export const cost: Visualizer<z.infer<typeof schema>> = {
  id: 'cloud-cost-optimization',
  maxSize: 100,
  measureSize: (p) => p.replicas,
  inputHint:
    'User-editable assumed USD rates; not current provider pricing, a quote or total cloud bill. Decimal GB/KB, a 730-hour month, linear prorating, cache flat cost and either provisioned instance-hours or origin request charges. Client egress is paid for all delivered bytes even with origin-cache hits. Taxes, CPU duration, minimums, regional transfers, tiering and commitments are excluded.',
  controls: [
    {
      key: 'mode',
      label: 'Assumed compute charging model',
      type: 'select',
      options: ['instances', 'per-request'].map((value) => ({
        value,
        label: value,
      })),
    },
    {
      key: 'requests',
      label: 'Requests during modeled period',
      type: 'number',
      min: 0,
      max: 100000000,
    },
    {
      key: 'cacheHitPercent',
      label: 'Origin-cache hit percent',
      type: 'number',
      min: 0,
      max: 100,
    },
    {
      key: 'replicas',
      label: 'Provisioned instances',
      type: 'number',
      min: 1,
      max: 100,
    },
    {
      key: 'instanceHourly',
      label: 'Assumed USD per instance-hour',
      type: 'number',
      min: 0,
      max: 1000,
    },
    {
      key: 'egressGB',
      label: 'Assumed USD per decimal GB egress',
      type: 'number',
      min: 0,
      max: 100,
    },
  ],
  presets: {
    best: schema.parse({
      mode: 'per-request',
      requests: 10000,
      cacheHitPercent: 0,
    }),
    average: schema.parse({}),
    worst: schema.parse({ replicas: 20, requests: 10000, cacheHitPercent: 80 }),
    random: (n) => schema.parse({ replicas: Math.min(100, Math.max(1, n)) }),
  },
  validateInput: (raw) => schema.parse(raw),
  complexity: {
    best: 'O(1) arithmetic',
    average: 'O(1) arithmetic',
    worst: 'O(1), with uncertainty in unmodeled billing dimensions',
    space: 'O(1)',
    why: 'This is a transparent scenario estimate from declared unit rates, not a cloud pricing API.',
    metric: { label: 'Cost components evaluated', keys: ['reads'] },
  },
  *generate(p) {
    const c = counters(),
      result = calculateCost(p),
      scene = (): VisualState => ({
        kind: 'architecture',
        values: [],
        nodes: [
          { id: 'clients', label: `${p.requests} client requests`, x: 0, y: 0 },
          {
            id: 'cache',
            label: `${p.cacheHitPercent}% origin hits`,
            x: 240,
            y: 0,
          },
          {
            id: 'origin',
            label: `${result.originRequests} origin requests`,
            x: 480,
            y: 0,
          },
        ],
        edges: [
          { from: 'clients', to: 'cache', label: 'all client bytes' },
          { from: 'cache', to: 'origin', label: 'misses only' },
        ],
      });
    yield frame(
      scene(),
      'Keep provisioned capacity, origin work and client egress as separate cost drivers.',
      c,
      1,
    );
    yield frame(
      scene(),
      'A cache changes origin request volume, not the bytes clients still receive.',
      c,
      3,
      {},
      [],
      {
        prompt:
          'Does a higher origin-cache hit ratio automatically reduce modeled client egress?',
        choices: ['Yes', 'No'],
        answer: 'No',
        hint: 'The client still downloads the same response; only the origin path changes.',
      },
    );
    for (const key of ['compute', 'storage', 'egress', 'cache'] as const) {
      c.reads++;
      yield frame(
        scene(),
        `${key}: assumed USD ${result[key].toFixed(4)}.`,
        c,
        5,
        { component: key, assumedUSD: result[key] },
      );
    }
    yield frame(
      {
        ...scene(),
        result: {
          ...result,
          units: 'Assumed USD for the configured hours; decimal GB/KB',
          assumptions: p,
        },
      },
      'Compare estimates against workload constraints, then validate actual provider dimensions and invoices.',
      c,
      6,
    );
  },
};
