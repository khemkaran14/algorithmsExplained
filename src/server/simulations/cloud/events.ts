import 'server-only';
import { z } from 'zod';
import { frame, counters } from '@/engine/helpers';
import type { Visualizer, VisualState, JsonValue } from '@/engine/types';
const schema = z
  .object({
    events: z
      .array(
        z.object({
          id: z.string().min(1).max(20),
          source: z.enum(['orders', 'users']),
          type: z.enum(['created', 'cancelled']),
        }),
      )
      .min(1)
      .max(20),
    rules: z
      .array(
        z.object({
          target: z.enum(['audit', 'fulfillment', 'email']),
          source: z.enum(['orders', 'users', '*']).default('*'),
          type: z.enum(['created', 'cancelled', '*']).default('*'),
        }),
      )
      .max(8),
    failedTarget: z
      .enum(['none', 'audit', 'fulfillment', 'email'])
      .default('none'),
    maxAttempts: z.number().int().min(1).max(5).default(3),
    deduplicate: z.boolean().default(true),
  })
  .strict();
export const events: Visualizer<z.infer<typeof schema>> = {
  id: 'eventbridge-eventarc',
  maxSize: 20,
  measureSize: (p) => p.events.length,
  inputHint:
    'Local event-attribute routing followed by independent target retries. Overlapping rules collapse to one event occurrence / target pair. Repeated event IDs are still delivered; an optional atomic local inbox suppresses repeated effects per target. Failed targets reach a bounded dead-letter list. This does not implement either provider filter language, retry schedule or connector catalog.',
  controls: [
    {
      key: 'failedTarget',
      label: 'Unavailable target',
      type: 'select',
      options: ['none', 'audit', 'fulfillment', 'email'].map((value) => ({
        value,
        label: value,
      })),
    },
    { key: 'deduplicate', label: 'Atomic target inbox', type: 'boolean' },
    {
      key: 'maxAttempts',
      label: 'Attempts before dead letter',
      type: 'number',
      min: 1,
      max: 5,
    },
  ],
  presets: {
    best: schema.parse({
      events: [{ id: 'o1', source: 'orders', type: 'created' }],
      rules: [
        { target: 'audit' },
        { target: 'fulfillment', source: 'orders', type: 'created' },
      ],
    }),
    average: schema.parse({
      events: [
        { id: 'o1', source: 'orders', type: 'created' },
        { id: 'o1', source: 'orders', type: 'created' },
        { id: 'u1', source: 'users', type: 'created' },
      ],
      rules: [{ target: 'audit' }, { target: 'email', source: 'users' }],
    }),
    worst: schema.parse({
      failedTarget: 'email',
      events: [{ id: 'u1', source: 'users', type: 'created' }],
      rules: [{ target: 'email' }],
    }),
    random: (n) =>
      schema.parse({
        events: Array.from(
          { length: Math.min(20, Math.max(1, n)) },
          (_, i) => ({
            id: `e${i}`,
            source: i % 2 ? 'users' : 'orders',
            type: 'created',
          }),
        ),
        rules: [
          { target: 'audit' },
          { target: 'fulfillment', source: 'orders' },
        ],
      }),
  },
  validateInput: (raw) => schema.parse(raw),
  complexity: {
    best: 'O(events × rules) matching',
    average: 'Matching plus independent target attempts',
    worst: 'O(events × rules + matched targets × attempts)',
    space: 'O(matched targets + inbox)',
    why: 'Delivery fan-out and target side effects are accounted separately. Inbox identity assumes immutable event IDs.',
    metric: { label: 'Target delivery attempts', keys: ['attempts'] },
  },
  *generate(p) {
    const c = counters();
    c.attempts = 0;
    const tasks: {
        event: number;
        id: string;
        target: string;
        attempt: number;
      }[] = [],
      inbox = new Set<string>(),
      effects: Record<string, number> = {},
      dead: Record<string, JsonValue>[] = [],
      history: Record<string, JsonValue>[] = [];
    let unmatched = 0,
      delivered = 0,
      suppressed = 0;
    const scene = (): VisualState => ({
      kind: 'architecture',
      values: [],
      nodes: [
        {
          id: 'bus',
          label: `Event router: ${tasks.length} queued`,
          x: 0,
          y: 0,
        },
        ...['audit', 'fulfillment', 'email'].map((target, i) => ({
          id: target,
          label: `${target}: ${effects[target] ?? 0} effects`,
          x: 260,
          y: i * 130,
        })),
      ],
      edges: ['audit', 'fulfillment', 'email'].map((target) => ({
        from: 'bus',
        to: target,
        label: 'independent delivery',
      })),
    });
    yield frame(
      scene(),
      'Match attributes before creating independent target deliveries.',
      c,
      1,
    );
    for (const [index, e] of p.events.entries()) {
      const targets = [
        ...new Set(
          p.rules
            .filter(
              (r) =>
                (r.source === '*' || r.source === e.source) &&
                (r.type === '*' || r.type === e.type),
            )
            .map((r) => r.target),
        ),
      ];
      c.comparisons += p.rules.length;
      if (!targets.length) unmatched++;
      for (const target of targets)
        tasks.push({ event: index, id: e.id, target, attempt: 0 });
      yield frame(
        scene(),
        `Matched ${targets.length} target(s) for ${e.id}.`,
        c,
        2,
        { id: e.id, matches: targets.join(',') },
      );
    }
    const matched = tasks.length;
    while (tasks.length) {
      const task = tasks.shift()!,
        key = JSON.stringify([task.target, task.id]),
        duplicate = p.deduplicate && inbox.has(key);
      yield frame(
        scene(),
        'A target-local inbox decides whether an already applied event creates another effect.',
        c,
        3,
        { id: task.id, target: task.target },
        [],
        {
          prompt: 'What happens on this attempt?',
          choices: [
            'Retry or dead-letter the unavailable target',
            'Suppress an already applied event',
            'Apply the target effect',
          ],
          answer:
            task.target === p.failedTarget
              ? 'Retry or dead-letter the unavailable target'
              : duplicate
                ? 'Suppress an already applied event'
                : 'Apply the target effect',
          hint: 'Target availability is checked first; inbox deduplication is local to this target and event ID.',
        },
      );
      task.attempt++;
      c.attempts++;
      let status;
      if (task.target === p.failedTarget) {
        if (task.attempt < p.maxAttempts) {
          tasks.push(task);
          status = 'retry';
        } else {
          dead.push({ ...task });
          status = 'dead-letter';
        }
      } else {
        delivered++;
        if (duplicate) {
          suppressed++;
          status = 'suppressed';
        } else {
          inbox.add(key);
          effects[task.target] = (effects[task.target] ?? 0) + 1;
          status = 'effect-applied';
        }
      }
      history.push({ ...task, status });
      yield frame(scene(), status, c, 5, {
        status,
        target: task.target,
        attempt: task.attempt,
      });
    }
    yield frame(
      {
        ...scene(),
        result: {
          inputEvents: p.events.length,
          unmatched,
          matched,
          delivered,
          dead,
          suppressed,
          effects,
          history,
        },
      },
      'Every matched target finishes as delivered or dead-lettered; repeated delivery need not repeat an effect.',
      c,
      6,
    );
  },
};
