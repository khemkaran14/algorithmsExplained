import 'server-only';
import { z } from 'zod';
import { frame, counters } from '@/engine/helpers';
import type { Visualizer, VisualState } from '@/engine/types';
const schema = z
  .object({
    service: z.enum(['iaas', 'paas', 'saas']).default('iaas'),
    patchOS: z.boolean().default(false),
    patchRuntime: z.boolean().default(true),
    patchApp: z.boolean().default(true),
    dataPolicyDone: z.boolean().default(false),
    credentialsProtected: z.boolean().default(true),
    providerBaselineAvailable: z.boolean().default(true),
  })
  .strict();
type Input = z.infer<typeof schema>;
type Task = {
  id: string;
  label: string;
  customer: (p: Input) => boolean;
  done: (p: Input) => boolean;
};
const tasks: Task[] = [
  {
    id: 'physical',
    label: 'Physical facilities and hardware',
    customer: () => false,
    done: (p) => p.providerBaselineAvailable,
  },
  {
    id: 'hypervisor',
    label: 'Underlying virtualization platform',
    customer: () => false,
    done: (p) => p.providerBaselineAvailable,
  },
  {
    id: 'os',
    label: 'Guest operating-system patching',
    customer: (p) => p.service === 'iaas',
    done: (p) => p.patchOS,
  },
  {
    id: 'runtime',
    label: 'Managed language runtime patching',
    customer: (p) => p.service === 'iaas',
    done: (p) => p.patchRuntime,
  },
  {
    id: 'app',
    label: 'Application source maintenance',
    customer: (p) => p.service !== 'saas',
    done: (p) => p.patchApp,
  },
  {
    id: 'data',
    label: 'Tenant data-access policy',
    customer: () => true,
    done: (p) => p.dataPolicyDone,
  },
  {
    id: 'credentials',
    label: 'Customer accounts and API credentials',
    customer: () => true,
    done: (p) => p.credentialsProtected,
  },
];
export function responsibility(
  slug = 'cloud-service-models',
): Visualizer<Input> {
  return {
    id: slug,
    maxSize: 7,
    measureSize: () => tasks.length,
    inputHint:
      'Choose IaaS, PaaS or SaaS and evaluate a declared baseline responsibility matrix. Provider-managed tasks are outside the customer patch checklist; data-access configuration and customer credentials remain customer obligations. Actual service contracts refine this model. The result is an exercise, not a scan or compliance assessment of your accounts.',
    controls: [
      {
        key: 'service',
        label: 'Cloud service model',
        type: 'select',
        options: ['iaas', 'paas', 'saas'].map((value) => ({
          value,
          label: value.toUpperCase(),
        })),
      },
      { key: 'patchOS', label: 'Customer guest OS patched', type: 'boolean' },
      {
        key: 'patchRuntime',
        label: 'Customer runtime patched',
        type: 'boolean',
      },
      { key: 'patchApp', label: 'Customer app maintained', type: 'boolean' },
      {
        key: 'dataPolicyDone',
        label: 'Customer data-access policy configured',
        type: 'boolean',
      },
      {
        key: 'credentialsProtected',
        label: 'Customer credentials protected',
        type: 'boolean',
      },
      {
        key: 'providerBaselineAvailable',
        label: 'Provider baseline available',
        type: 'boolean',
      },
    ],
    presets: {
      best: schema.parse({ service: 'saas', dataPolicyDone: true }),
      average: schema.parse({ service: 'paas', dataPolicyDone: false }),
      worst: schema.parse({
        service: 'iaas',
        patchOS: false,
        patchRuntime: false,
        patchApp: false,
        dataPolicyDone: false,
        credentialsProtected: false,
      }),
      random: (n) =>
        schema.parse({
          service: ['iaas', 'paas', 'saas'][n % 3],
          dataPolicyDone: n % 2 === 0,
          patchOS: n % 2 === 1,
        }),
    },
    validateInput: (raw) => schema.parse(raw),
    complexity: {
      best: 'One ownership decision per declared task',
      average: 'O(T) matrix evaluation for T tasks',
      worst:
        'A service-model change shifts ownership but does not remove customer configuration duties',
      space: 'O(T) reported responsibilities',
      why: 'A conceptual ownership exercise with seven explicit tasks, not a model of every provider product, contract or security control.',
      metric: { label: 'Responsibilities evaluated', keys: ['evaluated'] },
    },
    *generate(p) {
      const c = counters();
      c.evaluated = 0;
      const rows: { task: string; owner: string; status: string }[] = [],
        gaps: string[] = [];
      const scene: VisualState = {
        kind: 'architecture',
        values: [],
        nodes: [
          { id: 'customer', label: 'Customer obligations', x: 0, y: 100 },
          {
            id: 'contract',
            label: `${p.service.toUpperCase()} service contract`,
            x: 250,
            y: 100,
          },
          { id: 'provider', label: 'Provider obligations', x: 500, y: 100 },
        ],
        edges: [
          { from: 'customer', to: 'contract' },
          { from: 'provider', to: 'contract' },
        ],
      };
      yield frame(
        scene,
        'Managed service boundaries shift operational ownership; they do not make customer data or identity choices disappear.',
        c,
        1,
        { service: p.service },
      );
      for (const task of tasks) {
        const customer = task.customer(p),
          done = customer ? task.done(p) : p.providerBaselineAvailable;
        yield frame(
          scene,
          'Classify this task using the selected service-model boundary.',
          c,
          3,
          { task: task.label, service: p.service },
          [{ id: customer ? 'customer' : 'provider', kind: 'comparing' }],
          {
            prompt: `Who owns ${task.label.toLowerCase()} in this baseline?`,
            choices: ['Customer', 'Provider'],
            answer: customer ? 'Customer' : 'Provider',
            hint: 'IaaS exposes the guest OS; PaaS manages the runtime; SaaS also manages application source. Tenant data/credentials still need customer governance.',
          },
        );
        c.evaluated++;
        c.reads++;
        rows.push({
          task: task.label,
          owner: customer ? 'customer' : 'provider',
          status: done ? 'baseline-satisfied' : 'exercise-gap',
        });
        if (!done) gaps.push(task.label);
        yield frame(
          scene,
          'Record an exercise gap only against the party that owns this responsibility.',
          c,
          5,
          {
            task: task.label,
            owner: customer ? 'customer' : 'provider',
            satisfied: done,
          },
          [
            {
              id: customer ? 'customer' : 'provider',
              kind: done ? 'visited' : 'error',
            },
          ],
        );
      }
      yield frame(
        {
          ...scene,
          result: {
            service: p.service,
            responsibilities: rows,
            gaps,
            assessment:
              'Declared teaching checklist only; no external account was inspected.',
          },
        },
        'Select concrete services and review their actual shared-responsibility terms before designing operational controls.',
        c,
        6,
        { gaps: gaps.length },
      );
    },
  };
}
