import 'server-only';
import { z } from 'zod';
import { frame, counters } from '@/engine/helpers';
import type { Visualizer, VisualState } from '@/engine/types';
const schema = z
  .object({
    replicas: z.number().int().min(1).max(8).default(2),
    zones: z.number().int().min(1).max(3).default(2),
    replicaCapacity: z.number().int().min(1).max(1000).default(100),
    peakRequests: z.number().int().min(0).max(8000).default(150),
    assumedInstanceMonthly: z.number().min(0).max(10000).default(40),
    budget: z.number().min(0).max(80000).default(100),
    restoreTested: z.boolean().default(false),
    leastPrivilege: z.boolean().default(true),
    publicDatabase: z.boolean().default(false),
    alertsOwned: z.boolean().default(true),
    retentionReviewed: z.boolean().default(false),
  })
  .strict();
export const wellArchitected: Visualizer<z.infer<typeof schema>> = {
  id: 'well-architected-pillars',
  maxSize: 8,
  measureSize: (p) => p.replicas,
  inputHint:
    'A transparent review of declared assumptions, not a provider assessment, certification or numerical quality score. Availability checks one-zone loss using round-robin replica placement; capacity is fixed work units. Cost uses a user-supplied instance rate and excludes other services. Security, operational ownership and data retention are explicit checklist evidence, not audited facts. AWS and Google frameworks organize pillars differently.',
  controls: [
    { key: 'replicas', label: 'Replica count', type: 'number', min: 1, max: 8 },
    {
      key: 'zones',
      label: 'Replica placement zones',
      type: 'number',
      min: 1,
      max: 3,
    },
    {
      key: 'peakRequests',
      label: 'Peak work units per tick',
      type: 'number',
      min: 0,
      max: 8000,
    },
    {
      key: 'budget',
      label: 'Assumed monthly instance budget USD',
      type: 'number',
      min: 0,
      max: 80000,
    },
    { key: 'restoreTested', label: 'Restore drill completed', type: 'boolean' },
    {
      key: 'leastPrivilege',
      label: 'Identity scope reviewed',
      type: 'boolean',
    },
    {
      key: 'publicDatabase',
      label: 'Database publicly exposed',
      type: 'boolean',
    },
    {
      key: 'alertsOwned',
      label: 'Alert ownership documented',
      type: 'boolean',
    },
    {
      key: 'retentionReviewed',
      label: 'Data retention reviewed',
      type: 'boolean',
    },
  ],
  presets: {
    best: schema.parse({
      replicas: 3,
      zones: 3,
      peakRequests: 150,
      budget: 150,
      restoreTested: true,
      retentionReviewed: true,
    }),
    average: schema.parse({}),
    worst: schema.parse({
      replicas: 1,
      zones: 1,
      publicDatabase: true,
      leastPrivilege: false,
      alertsOwned: false,
    }),
    random: (n) => schema.parse({ replicas: Math.min(8, Math.max(1, n)) }),
  },
  validateInput: (raw) => schema.parse(raw),
  complexity: {
    best: 'O(replicas + explicit review checks)',
    average: 'O(replicas + explicit review checks)',
    worst: 'O(replicas + explicit review checks)',
    space: 'O(zones + checks)',
    why: 'The checks expose individual violated constraints, not a weighted score that can hide a critical security issue.',
    metric: { label: 'Review checks evaluated', keys: ['reads'] },
  },
  *generate(p) {
    const c = counters(),
      placement = Array.from({ length: p.zones }, () => 0);
    for (let i = 0; i < p.replicas; i++) placement[i % p.zones]++;
    const monthly = p.replicas * p.assumedInstanceMonthly,
      surviving = p.replicas - Math.max(...placement),
      checks = [
        {
          pillar: 'Reliability',
          check: 'One-zone loss leaves peak processing capacity',
          pass: surviving * p.replicaCapacity >= p.peakRequests,
        },
        {
          pillar: 'Reliability',
          check: 'A backup restore has been tested',
          pass: p.restoreTested,
        },
        {
          pillar: 'Performance',
          check: 'Healthy replicas meet declared peak demand',
          pass: p.replicas * p.replicaCapacity >= p.peakRequests,
        },
        {
          pillar: 'Security',
          check: 'Database exposure avoided and identity scope reviewed',
          pass: !p.publicDatabase && p.leastPrivilege,
        },
        {
          pillar: 'Operational excellence',
          check: 'Alert ownership documented',
          pass: p.alertsOwned,
        },
        {
          pillar: 'Cost',
          check: 'Assumed instance subtotal fits declared budget',
          pass: monthly <= p.budget,
        },
        {
          pillar: 'Sustainability / governance',
          check: 'Data retention policy reviewed',
          pass: p.retentionReviewed,
        },
      ];
    const scene = (): VisualState => ({
      kind: 'architecture',
      values: [],
      nodes: placement.map((n, i) => ({
        id: `zone${i}`,
        label: `Zone ${i}: ${n} replicas`,
        x: i * 230,
        y: 0,
      })),
      edges: [],
    });
    yield frame(
      scene(),
      'A design review evaluates explicit constraints with evidence, not an overall certification score.',
      c,
      1,
    );
    for (const check of checks) {
      yield frame(scene(), check.check, c, 3, { pillar: check.pillar }, [], {
        prompt: 'Does this declared check pass?',
        choices: ['Pass', 'Needs action'],
        answer: check.pass ? 'Pass' : 'Needs action',
        hint: 'Inspect the stated capacity, budget or checklist evidence; no single score cancels another failed constraint.',
      });
      c.reads++;
      yield frame(
        scene(),
        `${check.pillar}: ${check.pass ? 'declared evidence passes' : 'needs action'}.`,
        c,
        5,
        { pass: check.pass, pillar: check.pillar },
      );
    }
    yield frame(
      {
        ...scene(),
        result: {
          placement,
          healthyCapacity: p.replicas * p.replicaCapacity,
          survivingZoneCapacity: surviving * p.replicaCapacity,
          assumedMonthlyInstanceSubtotal: monthly,
          checks,
          actions: checks.filter((x) => !x.pass).map((x) => x.check),
          scope:
            'Declared evidence only, no real cloud audit, SLA, total bill or certification.',
        },
      },
      'Choose tradeoffs explicitly and close each failed constraint before using the design.',
      c,
      6,
    );
  },
};
