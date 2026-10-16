import 'server-only';
import { z } from 'zod';
import { frame, counters } from '@/engine/helpers';
import type { Visualizer, VisualState } from '@/engine/types';
const resource = z.object({
  name: z.string().regex(/^[a-z][a-z0-9-]{0,19}$/),
  region: z.enum(['east', 'west']),
  size: z.number().int().min(1).max(8),
});
const list = z
  .array(resource)
  .max(8)
  .refine(
    (xs) => new Set(xs.map((x) => x.name)).size === xs.length,
    'Resource names must be unique',
  );
const schema = z
  .object({
    actual: list,
    recorded: list,
    desired: list,
    refresh: z.boolean().default(true),
    preventDestroy: z.boolean().default(true),
    failAt: z.number().int().min(-1).max(15).default(-1),
  })
  .strict();
type Resource = z.infer<typeof resource>;
function plan(observed: Resource[], desired: Resource[]) {
  const old = new Map(observed.map((x) => [x.name, x])),
    next = new Map(desired.map((x) => [x.name, x]));
  return [
    ...observed
      .filter((x) => !next.has(x.name))
      .map((x) => ({ name: x.name, kind: 'destroy', value: x })),
    ...desired.flatMap((x) => {
      const before = old.get(x.name);
      return !before
        ? [{ name: x.name, kind: 'create', value: x }]
        : before.region !== x.region
          ? [{ name: x.name, kind: 'replace', value: x }]
          : before.size !== x.size
            ? [{ name: x.name, kind: 'update', value: x }]
            : [];
    }),
  ];
}
export const iac: Visualizer<z.infer<typeof schema>> = {
  id: 'infrastructure-as-code',
  maxSize: 8,
  measureSize: (p) => p.desired.length,
  inputHint:
    'A tiny local desired-state planner. Region is an immutable field that requires replacement; size is mutable. Refresh compares real exercise state instead of an old state file. preventDestroy rejects the entire plan if destroy/replacement appears. Apply can fail between atomic resource operations; successful prior operations remain and a fresh plan resumes. No provider API, HCL parser, dependency graph or real infrastructure is involved.',
  controls: [
    {
      key: 'refresh',
      label: 'Refresh recorded state before plan',
      type: 'boolean',
    },
    {
      key: 'preventDestroy',
      label: 'Reject destructive plan',
      type: 'boolean',
    },
    {
      key: 'failAt',
      label: 'Fail before operation index (-1 none)',
      type: 'number',
      min: -1,
      max: 15,
    },
  ],
  presets: {
    best: schema.parse({
      actual: [{ name: 'app', region: 'east', size: 2 }],
      recorded: [{ name: 'app', region: 'east', size: 2 }],
      desired: [{ name: 'app', region: 'east', size: 2 }],
    }),
    average: schema.parse({
      actual: [{ name: 'app', region: 'east', size: 1 }],
      recorded: [{ name: 'app', region: 'east', size: 2 }],
      desired: [
        { name: 'app', region: 'east', size: 2 },
        { name: 'cache', region: 'east', size: 1 },
      ],
    }),
    worst: schema.parse({
      actual: [{ name: 'db', region: 'east', size: 2 }],
      recorded: [{ name: 'db', region: 'east', size: 2 }],
      desired: [{ name: 'db', region: 'west', size: 2 }],
    }),
    random: (n) =>
      schema.parse({
        actual: [],
        recorded: [],
        desired: Array.from(
          { length: Math.min(8, Math.max(1, n)) },
          (_, i) => ({ name: `app-${i}`, region: 'east', size: 1 }),
        ),
      }),
  },
  validateInput: (raw) => schema.parse(raw),
  complexity: {
    best: 'O(resources) refresh and diff',
    average: 'O(resources + actions)',
    worst:
      'Partial apply leaves a smaller follow-up plan, not an implicit rollback',
    space: 'O(resources + plan)',
    why: 'Maps identify resource identity; immutable-field changes differ from mutable updates. Real plans also require dependency ordering, state locks and provider-specific semantics.',
    metric: { label: 'Applied resource operations', keys: ['writes'] },
  },
  *generate(p) {
    const c = counters(),
      actual = new Map(p.actual.map((x) => [x.name, { ...x }])),
      recorded = new Map(p.recorded.map((x) => [x.name, { ...x }])),
      actions = plan(p.refresh ? p.actual : p.recorded, p.desired),
      blocked =
        p.preventDestroy &&
        actions.some((a) => a.kind === 'destroy' || a.kind === 'replace'),
      applied: typeof actions = [],
      scene = (): VisualState => ({
        kind: 'architecture',
        values: [],
        nodes: [
          {
            id: 'desired',
            label: `Desired ${p.desired.length} resources`,
            x: 0,
            y: 0,
          },
          { id: 'state', label: `Recorded ${recorded.size}`, x: 240, y: 0 },
          { id: 'actual', label: `Actual ${actual.size}`, x: 480, y: 0 },
        ],
        edges: [
          { from: 'desired', to: 'state', label: 'plan' },
          { from: 'state', to: 'actual', label: 'apply' },
        ],
      });
    if (p.refresh) {
      recorded.clear();
      for (const x of p.actual) recorded.set(x.name, { ...x });
    }
    yield frame(
      scene(),
      'Refresh distinguishes drift from the desired configuration.',
      c,
      1,
    );
    yield frame(
      scene(),
      'Check the complete plan before making any changes.',
      c,
      3,
      { actions: actions.length, blocked },
      [],
      {
        prompt: 'May this plan proceed under preventDestroy?',
        choices: ['Apply the plan', 'Reject the complete destructive plan'],
        answer: blocked
          ? 'Reject the complete destructive plan'
          : 'Apply the plan',
        hint: 'Destroy and replacement are both destructive operations in this exercise.',
      },
    );
    let failure: string | null = null;
    if (!blocked)
      for (let i = 0; i < actions.length; i++) {
        const a = actions[i];
        if (i === p.failAt) {
          failure = `injected-failure-before-${i}`;
          break;
        }
        const exists = actual.has(a.name);
        if (
          (a.kind === 'create' && exists) ||
          (a.kind !== 'create' && !exists)
        ) {
          failure = 'stale-plan-resource-identity-conflict';
          break;
        }
        if (a.kind === 'destroy') {
          actual.delete(a.name);
          recorded.delete(a.name);
        } else {
          actual.set(a.name, { ...a.value });
          recorded.set(a.name, { ...a.value });
        }
        applied.push(a);
        c.writes++;
        yield frame(scene(), `Applied ${a.kind} to ${a.name}.`, c, 5, {
          kind: a.kind,
          name: a.name,
        });
      }
    yield frame(
      {
        ...scene(),
        result: {
          plan: actions,
          blocked,
          applied,
          failure,
          actual: [...actual.values()],
          recorded: [...recorded.values()],
          nextPlan: plan([...actual.values()], p.desired),
        },
      },
      'Re-plan from refreshed actual state after a partial apply; resource updates are atomic only inside this bounded exercise.',
      c,
      6,
    );
  },
};
