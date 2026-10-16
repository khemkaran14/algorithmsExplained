import 'server-only';
import { z } from 'zod';
import { frame, counters } from '@/engine/helpers';
import type { Visualizer, Frame, VisualState } from '@/engine/types';
const rateSchema = z
  .object({
    algorithm: z
      .enum(['token-bucket', 'fixed-window', 'sliding-log', 'sliding-counter'])
      .default('token-bucket'),
    events: z
      .array(
        z.object({
          at: z.number().int().min(0).max(100000),
          key: z.string().min(1).max(16).default('client'),
          cost: z.number().int().min(1).max(8).default(1),
        }),
      )
      .min(1)
      .max(64),
    limit: z.number().int().min(1).max(32).default(5),
    windowMs: z.number().int().min(1).max(10000).default(1000),
    refillPerSecond: z.number().min(0).max(100).default(2),
  })
  .strict()
  .refine(
    (v) =>
      v.events.every((event, i) => i === 0 || event.at >= v.events[i - 1].at),
    'Events must be in nondecreasing time order.',
  );
export type RateInput = z.infer<typeof rateSchema>;
export function rateLimiter(slug = 'rate-limiting'): Visualizer<RateInput> {
  return {
    id: slug,
    maxSize: 64,
    measureSize: (input) => input.events.length,
    inputHint:
      'Events have millisecond timestamps, client keys and integer costs. Compare token bucket, fixed window, exact sliding log and approximate sliding counter. limit is the burst/window quota; token bucket refill is separate.',
    controls: [
      {
        key: 'algorithm',
        label: 'Rate policy',
        type: 'select',
        options: [
          'token-bucket',
          'fixed-window',
          'sliding-log',
          'sliding-counter',
        ].map((value) => ({ value, label: value })),
      },
      {
        key: 'limit',
        label: 'Burst/window quota',
        type: 'number',
        min: 1,
        max: 32,
      },
      {
        key: 'windowMs',
        label: 'Window milliseconds',
        type: 'number',
        min: 1,
        max: 10000,
      },
      {
        key: 'refillPerSecond',
        label: 'Tokens refilled per second',
        type: 'number',
        min: 0,
        max: 100,
        step: 0.1,
      },
    ],
    presets: {
      best: rateSchema.parse({
        events: [{ at: 0 }, { at: 1000 }, { at: 2000 }],
      }),
      average: rateSchema.parse({
        events: Array.from({ length: 12 }, (_, i) => ({
          at: i * 150,
          key: 'client',
        })),
      }),
      worst: rateSchema.parse({
        algorithm: 'fixed-window',
        limit: 5,
        events: Array.from({ length: 10 }, (_, i) => ({
          at: i < 5 ? 999 : 1000,
        })),
      }),
      random: (n) =>
        rateSchema.parse({
          events: Array.from(
            { length: Math.min(64, Math.max(1, n)) },
            (_, i) => ({ at: i * 100, key: i % 3 ? 'client-a' : 'client-b' }),
          ),
        }),
    },
    validateInput: (raw) => rateSchema.parse(raw),
    complexity: {
      metric: { label: 'Requests evaluated', keys: ['requests'] },
      best: 'O(1) token/fixed/counter state per client',
      average: 'Sliding log keeps admitted requests in the active window',
      worst: 'Exact log uses O(window admissions) state per client',
      space: 'O(clients) counters or O(active admissions) log',
      why: 'Fixed windows permit boundary bursts. Token buckets cap accumulated burst credit and refill with elapsed time. Sliding logs enforce an exact weighted window; sliding counters estimate the previous window’s surviving share and can differ from exact admission. A distributed deployment additionally needs atomic shared-state updates and a trustworthy time model.',
    },
    *generate(input) {
      type State = {
        tokens: number;
        last: number;
        window: number;
        current: number;
        previous: number;
        log: { at: number; cost: number }[];
      };
      const states = new Map<string, State>(),
        c = counters(),
        history: {
          at: number;
          key: string;
          cost: number;
          allowed: boolean;
          availableBefore: number;
          used: number;
        }[] = [];
      let allowedCount = 0;
      const scene: VisualState = {
        kind: 'architecture',
        values: [],
        nodes: [
          { id: 'clients', label: 'Client keys', x: 0, y: 60 },
          { id: 'limiter', label: input.algorithm, x: 220, y: 60 },
          { id: 'state', label: 'Atomic shared-state model', x: 440, y: 60 },
          { id: 'service', label: 'Protected service', x: 660, y: 60 },
        ],
        edges: [
          { from: 'clients', to: 'limiter' },
          { from: 'limiter', to: 'state' },
          { from: 'limiter', to: 'service' },
        ],
      };
      yield frame(
        scene,
        'A rate policy defines both its time window and burst behavior.',
        c,
        1,
        { algorithm: input.algorithm, limit: input.limit },
      );
      for (const event of input.events) {
        let state = states.get(event.key);
        if (!state) {
          state = {
            tokens: input.limit,
            last: event.at,
            window: Math.floor(event.at / input.windowMs),
            current: 0,
            previous: 0,
            log: [],
          };
          states.set(event.key, state);
        }
        let available = 0,
          used = 0;
        if (input.algorithm === 'token-bucket') {
          state.tokens = Math.min(
            input.limit,
            state.tokens +
              ((event.at - state.last) * input.refillPerSecond) / 1000,
          );
          state.last = event.at;
          available = state.tokens;
        } else if (input.algorithm === 'sliding-log') {
          state.log = state.log.filter(
            (item) => item.at > event.at - input.windowMs,
          );
          used = state.log.reduce((sum, item) => sum + item.cost, 0);
          available = input.limit - used;
        } else {
          const bucket = Math.floor(event.at / input.windowMs);
          if (bucket !== state.window) {
            state.previous = bucket === state.window + 1 ? state.current : 0;
            state.current = 0;
            state.window = bucket;
          }
          used =
            state.current +
            (input.algorithm === 'sliding-counter'
              ? state.previous *
                (1 - (event.at % input.windowMs) / input.windowMs)
              : 0);
          available = input.limit - used;
        }
        const allowed = event.cost <= available + 1e-12;
        c.requests = (c.requests ?? 0) + 1;
        c.reads++;
        yield frame(
          scene,
          'Compare this request’s cost with the policy’s remaining credit.',
          c,
          3,
          {
            at: event.at,
            key: event.key,
            cost: event.cost,
            availableBefore: available,
          },
          [{ id: 'limiter', kind: 'comparing' }],
          {
            prompt: 'Can this request be admitted under the selected policy?',
            choices: ['Admit', 'Reject'],
            answer: allowed ? 'Admit' : 'Reject',
            hint: 'The request consumes its full cost; remaining credit must be at least that cost.',
          },
        );
        if (allowed) {
          allowedCount++;
          if (input.algorithm === 'token-bucket')
            state.tokens = Math.max(0, state.tokens - event.cost);
          else if (input.algorithm === 'sliding-log')
            state.log.push({ at: event.at, cost: event.cost });
          else state.current += event.cost;
          c.writes++;
        }
        history.push({
          at: event.at,
          key: event.key,
          cost: event.cost,
          allowed,
          availableBefore: available,
          used,
        });
        yield frame(
          scene,
          allowed
            ? 'Consume credit atomically and forward the admitted request.'
            : 'Reject without consuming additional quota.',
          c,
          5,
          { allowed, key: event.key },
          [
            {
              id: allowed ? 'limiter->service' : 'limiter',
              kind: allowed ? 'moving' : 'error',
            },
          ],
        );
      }
      yield frame(
        {
          ...scene,
          result: {
            allowed: allowedCount,
            rejected: input.events.length - allowedCount,
            history,
          },
        },
        'Compare exact policy outcomes rather than treating every limiter as equivalent.',
        c,
        6,
        { allowed: allowedCount, rejected: input.events.length - allowedCount },
      );
    },
  };
}
const queueSchema = z
  .object({
    mode: z.enum(['queue', 'pubsub']).default('queue'),
    messages: z
      .array(
        z.object({
          id: z.string().min(1).max(20),
          value: z.number().int().min(-99).max(99),
        }),
      )
      .min(1)
      .max(32),
    workers: z.number().int().min(1).max(4).default(2),
    subscribers: z.number().int().min(1).max(4).default(2),
    perWorker: z.number().int().min(1).max(8).default(1),
    ticks: z.number().int().min(1).max(20).default(8),
    visibility: z.number().int().min(1).max(8).default(2),
    maxRetries: z.number().int().min(0).max(4).default(2),
    loseFirstAck: z.boolean().default(false),
    failMessage: z.string().max(20).default(''),
    deduplicate: z.boolean().default(true),
  })
  .strict();
export type QueueInput = z.infer<typeof queueSchema>;
export function messageQueue(
  slug = 'message-queues-pub-sub',
): Visualizer<QueueInput> {
  return {
    id: slug,
    maxSize: 32,
    measureSize: (input) => input.messages.length,
    inputHint:
      'Queue mode shares one consumer group; pubsub makes one task per subscriber. Lost acknowledgment can redeliver an already-applied effect. Deduplication uses message ID plus subscriber. Exhausted retries go to a dead-letter queue.',
    controls: [
      {
        key: 'mode',
        label: 'Delivery model',
        type: 'select',
        options: [
          { value: 'queue', label: 'Work queue' },
          { value: 'pubsub', label: 'Fan-out subscriptions' },
        ],
      },
      {
        key: 'workers',
        label: 'Workers per group',
        type: 'number',
        min: 1,
        max: 4,
      },
      {
        key: 'subscribers',
        label: 'Pub-sub subscribers',
        type: 'number',
        min: 1,
        max: 4,
      },
      {
        key: 'loseFirstAck',
        label: 'Lose first acknowledgment',
        type: 'boolean',
      },
      {
        key: 'deduplicate',
        label: 'Idempotent consumer inbox',
        type: 'boolean',
      },
      {
        key: 'visibility',
        label: 'Visibility timeout ticks',
        type: 'number',
        min: 1,
        max: 8,
      },
      {
        key: 'maxRetries',
        label: 'Retries before DLQ',
        type: 'number',
        min: 0,
        max: 4,
      },
    ],
    presets: {
      best: queueSchema.parse({ messages: [{ id: 'm1', value: 1 }] }),
      average: queueSchema.parse({
        messages: Array.from({ length: 8 }, (_, i) => ({
          id: `m${i}`,
          value: i + 1,
        })),
        loseFirstAck: true,
      }),
      worst: queueSchema.parse({
        messages: [
          { id: 'poison', value: 5 },
          { id: 'ok', value: 2 },
        ],
        failMessage: 'poison',
        loseFirstAck: true,
        deduplicate: false,
        maxRetries: 1,
      }),
      random: (n) =>
        queueSchema.parse({
          messages: Array.from(
            { length: Math.min(32, Math.max(1, n)) },
            (_, i) => ({ id: `m${i}`, value: 1 }),
          ),
        }),
    },
    validateInput(raw) {
      const p = queueSchema.parse(raw),
        values = new Map<string, number>();
      for (const m of p.messages) {
        if (values.has(m.id) && values.get(m.id) !== m.value)
          throw new Error(
            'Duplicate message IDs must describe the same example payload.',
          );
        values.set(m.id, m.value);
      }
      return p;
    },
    complexity: {
      metric: { label: 'Delivery attempts', keys: ['deliveries'] },
      best: 'One delivery per task with a successful acknowledgment',
      average:
        'At-least-once delivery may redeliver after a lost acknowledgment',
      worst: 'Bounded retries end in DLQ or remain in flight at trace end',
      space: 'O(messages × subscriptions) broker tasks and inbox keys',
      why: 'Broker delivery and application side effects are separate state changes. An acknowledgment can be lost after an effect commits. An atomic application inbox/effect transaction can make repeated handling idempotent; this model represents that boundary, not a claim that the broker provides magical exactly-once effects.',
    },
    *generate(input) {
      type Task = {
        id: string;
        value: number;
        subscriber: number;
        status: 'ready' | 'inflight' | 'done' | 'dead';
        attempts: number;
        visibleAt: number;
      };
      const groups = input.mode === 'pubsub' ? input.subscribers : 1,
        tasks: Task[] = input.messages.flatMap((m) =>
          Array.from({ length: groups }, (_, subscriber) => ({
            ...m,
            subscriber,
            status: 'ready' as const,
            attempts: 0,
            visibleAt: 0,
          })),
        ),
        inbox = new Set<string>(),
        effects = Array(groups).fill(0) as number[],
        c = counters();
      c.deliveries = 0;
      c.effects = 0;
      c.duplicatesBlocked = 0;
      let ackLost = false;
      const scene: VisualState = {
        kind: 'architecture',
        values: [],
        nodes: [
          { id: 'producer', label: 'Producer', x: 0, y: 80 },
          {
            id: 'broker',
            label:
              input.mode === 'pubsub' ? 'Topic + subscriptions' : 'Work queue',
            x: 210,
            y: 80,
          },
          ...effects.map((_, i) => ({
            id: `group${i}`,
            label: `Consumer group ${i + 1}`,
            x: 440,
            y: i * 110,
          })),
          { id: 'inbox', label: 'Atomic inbox + side effect', x: 690, y: 70 },
          { id: 'dlq', label: 'Dead-letter queue', x: 440, y: groups * 110 },
        ],
        edges: [
          { from: 'producer', to: 'broker' },
          ...effects.flatMap((_, i) => [
            { from: 'broker', to: `group${i}` },
            { from: `group${i}`, to: 'inbox' },
          ]),
          { from: 'broker', to: 'dlq' },
        ],
      };
      function emit(
        text: string,
        line: number,
        tick: number,
        task?: Task,
        action?: Frame['action'],
      ) {
        return frame(
          scene,
          text,
          c,
          line,
          {
            tick,
            task: task?.id ?? null,
            attempt: task?.attempts ?? 0,
            done: tasks.filter((t) => t.status === 'done').length,
            pending: tasks.filter(
              (t) => t.status === 'ready' || t.status === 'inflight',
            ).length,
            dead: tasks.filter((t) => t.status === 'dead').length,
            effects: effects.join(','),
          },
          task
            ? [
                {
                  id: `group${task.subscriber}`,
                  kind: task.status === 'dead' ? 'error' : 'visited',
                },
              ]
            : [],
          action,
        );
      }
      yield emit(
        'A published message creates one work task or one task per subscription.',
        1,
        0,
      );
      for (let tick = 0; tick < input.ticks; tick++) {
        for (const task of tasks)
          if (task.status === 'inflight' && task.visibleAt <= tick) {
            if (task.attempts >= input.maxRetries + 1) {
              task.status = 'dead';
              yield emit(
                'The delivery budget is exhausted; route the task to the DLQ.',
                4,
                tick,
                task,
              );
            } else task.status = 'ready';
          }
        for (let group = 0; group < groups; group++) {
          let budget = input.workers * input.perWorker;
          for (const task of tasks) {
            if (budget <= 0) break;
            if (task.subscriber !== group || task.status !== 'ready') continue;
            budget--;
            task.status = 'inflight';
            task.visibleAt = tick + input.visibility;
            task.attempts++;
            c.deliveries++;
            yield emit(
              'Deliver a visible task and start its acknowledgment timeout.',
              3,
              tick,
              task,
              {
                prompt:
                  'Can this delivery attempt repeat an earlier application effect?',
                choices: ['Yes', 'No'],
                answer: 'Yes',
                hint: 'A previous worker may have committed the effect before its acknowledgment was lost.',
              },
            );
            const key = `${task.subscriber}:${task.id}`,
              poison = task.id === input.failMessage;
            if (!poison) {
              if (input.deduplicate && inbox.has(key)) c.duplicatesBlocked++;
              else {
                effects[group] += task.value;
                inbox.add(key);
                c.effects++;
                c.writes++;
              }
              if (input.loseFirstAck && !ackLost) {
                ackLost = true;
                yield emit(
                  'The effect committed, but the acknowledgment was lost.',
                  5,
                  tick,
                  task,
                );
              } else {
                task.status = 'done';
                yield emit(
                  'Acknowledge the task after the application effect boundary.',
                  5,
                  tick,
                  task,
                );
              }
            } else
              yield emit(
                'The poison task fails before its effect and remains in flight until timeout.',
                5,
                tick,
                task,
              );
          }
        }
      }
      const done = tasks.filter((t) => t.status === 'done').length,
        dead = tasks.filter((t) => t.status === 'dead').length,
        pending = tasks.length - done - dead,
        f = emit(
          'A bounded trace preserves pending work and reports DLQ tasks explicitly.',
          6,
          input.ticks - 1,
        );
      f.state.result = {
        tasks: tasks.map(({ id, subscriber, status, attempts }) => ({
          id,
          subscriber,
          status,
          attempts,
        })),
        totalTasks: tasks.length,
        done,
        dead,
        pending,
        effects,
        effectCount: c.effects,
        deliveries: c.deliveries,
        duplicatesBlocked: c.duplicatesBlocked,
        conserved: tasks.length === done + dead + pending,
      };
      yield f;
    },
  };
}
