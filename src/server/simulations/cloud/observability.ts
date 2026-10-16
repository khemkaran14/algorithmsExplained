import 'server-only';
import { z } from 'zod';
import { frame, counters } from '@/engine/helpers';
import type { Visualizer, VisualState, JsonValue } from '@/engine/types';
const sample = z
  .object({
    requests: z.number().int().min(0).max(100000),
    errors: z.number().int().min(0).max(100000),
    latencyMs: z.number().min(0).max(60000),
  })
  .refine((p) => p.errors <= p.requests, 'Errors cannot exceed requests');
const schema = z
  .object({
    samples: z.array(sample.nullable()).min(1).max(24),
    sloPercent: z.number().min(90).max(99.99).default(99),
    window: z.number().int().min(1).max(12).default(3),
    consecutive: z.number().int().min(1).max(5).default(2),
    burnThreshold: z.number().min(1).max(100).default(2),
    missing: z.enum(['unknown', 'breaching', 'ignore']).default('unknown'),
  })
  .strict();
export const observability: Visualizer<z.infer<typeof schema>> = {
  id: 'cloudwatch-cloud-monitoring',
  maxSize: 24,
  measureSize: (p) => p.samples.length,
  inputHint:
    'Traffic-weighted error-rate windows, a declared request-based SLO, and consecutive evaluations. Missing samples are distinct from zero traffic. Ignore omits them; unknown resets a pending alert; breaching treats the whole window as breaching when any sample is missing. Latency is a displayed per-bucket mean, not a percentile distribution. No telemetry is sent to a provider.',
  controls: [
    {
      key: 'sloPercent',
      label: 'Success SLO percent',
      type: 'number',
      min: 90,
      max: 99.99,
    },
    {
      key: 'window',
      label: 'Rolling sample window',
      type: 'number',
      min: 1,
      max: 12,
    },
    {
      key: 'consecutive',
      label: 'Consecutive breaches to alert',
      type: 'number',
      min: 1,
      max: 5,
    },
    {
      key: 'missing',
      label: 'Missing-data policy',
      type: 'select',
      options: ['unknown', 'breaching', 'ignore'].map((value) => ({
        value,
        label: value,
      })),
    },
  ],
  presets: {
    best: schema.parse({
      samples: [
        { requests: 1000, errors: 0, latencyMs: 50 },
        { requests: 1000, errors: 0, latencyMs: 60 },
      ],
    }),
    average: schema.parse({
      samples: [
        { requests: 1000, errors: 0, latencyMs: 50 },
        { requests: 1000, errors: 50, latencyMs: 200 },
        { requests: 1000, errors: 80, latencyMs: 500 },
        { requests: 1000, errors: 0, latencyMs: 70 },
      ],
    }),
    worst: schema.parse({
      missing: 'breaching',
      samples: [null, null, { requests: 100, errors: 30, latencyMs: 1000 }],
    }),
    random: (n) =>
      schema.parse({
        samples: Array.from(
          { length: Math.min(24, Math.max(1, n)) },
          (_, i) => ({
            requests: 100,
            errors: i % 5 === 3 ? 8 : 0,
            latencyMs: 50 + i * 5,
          }),
        ),
      }),
  },
  validateInput: (raw) => schema.parse(raw),
  complexity: {
    best: 'O(samples)',
    average: 'O(samples × rolling window)',
    worst: 'O(samples × rolling window)',
    space: 'O(samples)',
    why: 'The bounded simulator rescans a window; a streaming implementation can maintain running totals. Request-based SLO math does not replace multi-window production alert design.',
    metric: { label: 'Window samples inspected', keys: ['reads'] },
  },
  *generate(p) {
    const c = counters(),
      history: Record<string, JsonValue>[] = [];
    let streak = 0,
      requests = 0,
      errors = 0;
    const scene = (): VisualState => ({
      kind: 'architecture',
      values: [],
      nodes: [
        { id: 'metrics', label: 'Request/error buckets', x: 0, y: 0 },
        { id: 'slo', label: `Success target ${p.sloPercent}%`, x: 250, y: 0 },
        {
          id: 'alert',
          label: `Consecutive breaches ${streak}/${p.consecutive}`,
          x: 500,
          y: 0,
        },
      ],
      edges: [
        { from: 'metrics', to: 'slo' },
        { from: 'slo', to: 'alert' },
      ],
    });
    yield frame(
      scene(),
      'Compute error fractions from traffic totals; do not average per-bucket percentages.',
      c,
      1,
    );
    for (let i = 0; i < p.samples.length; i++) {
      const current = p.samples[i];
      if (current) {
        requests += current.requests;
        errors += current.errors;
      }
      const window = p.samples.slice(Math.max(0, i - p.window + 1), i + 1),
        valid = window.filter((x) => x !== null),
        missing = valid.length !== window.length;
      c.reads += window.length;
      const count = valid.reduce((s, x) => s + x.requests, 0),
        fail = valid.reduce((s, x) => s + x.errors, 0),
        allowed = 1 - p.sloPercent / 100,
        burn = count ? fail / count / allowed : null;
      const evaluation =
        missing && p.missing === 'breaching'
          ? 'breaching'
          : missing && p.missing === 'unknown'
            ? 'unknown'
            : burn === null
              ? 'unknown'
              : burn >= p.burnThreshold
                ? 'breaching'
                : 'healthy';
      yield frame(
        scene(),
        'Evaluate the declared missing-data policy before updating the alert state.',
        c,
        3,
        { evaluation, burn },
        [],
        {
          prompt: 'What happens to the consecutive-breach counter?',
          choices: ['Increase by one', 'Reset to zero'],
          answer:
            evaluation === 'breaching' ? 'Increase by one' : 'Reset to zero',
          hint: 'Only a breaching evaluation extends this model’s pending alert.',
        },
      );
      streak = evaluation === 'breaching' ? streak + 1 : 0;
      const alert = streak >= p.consecutive;
      history.push({
        index: i,
        requests: count,
        errors: fail,
        burn,
        evaluation,
        streak,
        alert,
      });
      yield frame(
        scene(),
        alert ? 'The declared consecutive condition is firing.' : evaluation,
        c,
        5,
        { alert, streak, burn },
      );
    }
    const budget = requests * (1 - p.sloPercent / 100);
    yield frame(
      {
        ...scene(),
        result: {
          requests,
          errors,
          allowedErrors: budget,
          remainingErrorBudget: budget - errors,
          budgetConsumed: budget ? errors / budget : null,
          history,
          missingSamples: p.samples.filter((s) => s === null).length,
        },
      },
      'Negative remaining budget means observed errors exceeded this request-based allowance; missing traffic is not silently counted as success.',
      c,
      6,
    );
  },
};
