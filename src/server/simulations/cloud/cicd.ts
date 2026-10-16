import 'server-only';
import { z } from 'zod';
import { frame, counters } from '@/engine/helpers';
import type { Visualizer, VisualState, JsonValue } from '@/engine/types';
const schema = z
  .object({
    testsPass: z.boolean().default(true),
    policyPass: z.boolean().default(true),
    signatureValid: z.boolean().default(true),
    candidateErrorPercent: z.number().int().min(0).max(100).default(10),
    baselineErrorPercent: z.number().int().min(0).max(100).default(1),
    maxErrorPercent: z.number().min(0).max(100).default(5),
    maxRegressionPoints: z.number().min(0).max(100).default(3),
    minCanarySamples: z.number().int().min(1).max(100).default(20),
    requestsPerStage: z.number().int().min(1).max(400).default(100),
    seed: z.number().int().min(0).max(2147483647).default(42),
  })
  .strict();
export const cicd: Visualizer<z.infer<typeof schema>> = {
  id: 'cloud-ci-cd',
  maxSize: 400,
  measureSize: (p) => p.requestsPerStage,
  inputHint:
    'A deterministic synthetic canary pipeline. Build/test/policy/signature gates precede rollout. Stages route 10%, 25%, then 50% to one immutable candidate. Measured absolute errors and regression against contemporaneous baseline control promotion; too few candidate samples hold instead. A failed gate rolls modeled traffic back to v1. These are assumed request outcomes, not a real CI or deployment service.',
  controls: [
    { key: 'testsPass', label: 'Tests pass', type: 'boolean' },
    { key: 'policyPass', label: 'Deployment policy passes', type: 'boolean' },
    {
      key: 'signatureValid',
      label: 'Artifact signature verifies',
      type: 'boolean',
    },
    {
      key: 'candidateErrorPercent',
      label: 'Synthetic candidate error percent',
      type: 'number',
      min: 0,
      max: 100,
    },
    {
      key: 'requestsPerStage',
      label: 'Requests observed per stage',
      type: 'number',
      min: 1,
      max: 400,
    },
  ],
  presets: {
    best: schema.parse({
      candidateErrorPercent: 0,
      baselineErrorPercent: 0,
      requestsPerStage: 400,
    }),
    average: schema.parse({ candidateErrorPercent: 10, requestsPerStage: 400 }),
    worst: schema.parse({ testsPass: false }),
    random: (n) =>
      schema.parse({ requestsPerStage: Math.min(400, Math.max(1, n)) }),
  },
  validateInput: (raw) => schema.parse(raw),
  complexity: {
    best: 'O(1) early gate rejection',
    average: 'O(stages × requests)',
    worst: 'O(stages × requests)',
    space: 'O(stages)',
    why: 'Synthetic request samples are independent seeded draws. Sample-size gating does not establish statistical significance or production safety.',
    metric: { label: 'Observed synthetic requests', keys: ['reads'] },
  },
  *generate(p) {
    const c = counters(),
      history: Record<string, JsonValue>[] = [];
    let state = 'building',
      candidateTraffic = 0,
      random = p.seed >>> 0;
    const draw = () => {
      random = (Math.imul(random, 1664525) + 1013904223) >>> 0;
      return random / 4294967296;
    };
    const scene = (): VisualState => ({
      kind: 'architecture',
      values: [],
      nodes: [
        { id: 'pipeline', label: `Pipeline: ${state}`, x: 0, y: 0 },
        {
          id: 'stable',
          label: `v1 stable ${100 - candidateTraffic}%`,
          x: 260,
          y: 0,
        },
        {
          id: 'candidate',
          label: `v2 immutable candidate ${candidateTraffic}%`,
          x: 260,
          y: 150,
        },
      ],
      edges: [
        { from: 'pipeline', to: 'stable' },
        { from: 'pipeline', to: 'candidate' },
      ],
    });
    yield frame(
      scene(),
      'An artifact is eligible only after every configured gate passes.',
      c,
      1,
    );
    const eligible = p.testsPass && p.policyPass && p.signatureValid;
    yield frame(
      scene(),
      'Check the artifact gates before routing any canary traffic.',
      c,
      2,
      {
        testsPass: p.testsPass,
        policyPass: p.policyPass,
        signatureValid: p.signatureValid,
      },
      [],
      {
        prompt: 'Is the candidate eligible for rollout?',
        choices: [
          'Yes, all configured gates pass',
          'No, reject before rollout',
        ],
        answer: eligible
          ? 'Yes, all configured gates pass'
          : 'No, reject before rollout',
        hint: 'Tests, policy and signature verification must all pass.',
      },
    );
    if (!p.testsPass || !p.policyPass || !p.signatureValid) {
      state = 'rejected-before-rollout';
      history.push({
        state,
        testsPass: p.testsPass,
        policyPass: p.policyPass,
        signatureValid: p.signatureValid,
      });
    } else {
      for (const weight of [10, 25, 50]) {
        candidateTraffic = weight;
        state = 'observing';
        let candidate = 0,
          candidateErrors = 0,
          baseline = 0,
          baselineErrors = 0;
        for (let i = 0; i < p.requestsPerStage; i++) {
          const useCandidate = draw() * 100 < weight,
            bad =
              draw() * 100 <
              (useCandidate ? p.candidateErrorPercent : p.baselineErrorPercent);
          if (useCandidate) {
            candidate++;
            if (bad) candidateErrors++;
          } else {
            baseline++;
            if (bad) baselineErrors++;
          }
          c.reads++;
        }
        const candidateRate = candidate
            ? (100 * candidateErrors) / candidate
            : null,
          baselineRate = baseline ? (100 * baselineErrors) / baseline : null,
          decision =
            candidate < p.minCanarySamples || baseline === 0
              ? 'hold'
              : candidateRate! > p.maxErrorPercent ||
                  candidateRate! - baselineRate! > p.maxRegressionPoints
                ? 'rollback'
                : 'advance';
        yield frame(
          scene(),
          'Use observed sample counts and both error guardrails before changing the traffic split.',
          c,
          3,
          { candidate, candidateErrors, baseline, baselineErrors },
          [],
          {
            prompt: 'What should this rollout do?',
            choices: [
              'Hold for more evidence',
              'Roll back to v1',
              'Advance to the next stage',
            ],
            answer:
              decision === 'hold'
                ? 'Hold for more evidence'
                : decision === 'rollback'
                  ? 'Roll back to v1'
                  : 'Advance to the next stage',
            hint: 'Insufficient samples hold. Otherwise either absolute error or regression guardrail can reject the candidate.',
          },
        );
        history.push({
          weight,
          candidate,
          candidateErrors,
          baseline,
          baselineErrors,
          candidateRate,
          baselineRate,
          decision,
        });
        state = decision;
        if (decision === 'rollback') {
          candidateTraffic = 0;
          break;
        }
        if (decision === 'hold') break;
        yield frame(
          scene(),
          'The current observed guardrails permit the next stage.',
          c,
          5,
          { candidateTraffic },
        );
      }
      if (state === 'advance') {
        state = 'promoted';
        candidateTraffic = 100;
      }
    }
    yield frame(
      {
        ...scene(),
        result: {
          state,
          candidateTraffic,
          history,
          artifact: 'immutable-v2',
          scope:
            'Synthetic local pipeline only; no real build, registry, deployment or user traffic.',
        },
      },
      'A hold preserves the current canary; rollback restores v1; promotion follows all configured observations.',
      c,
      6,
    );
  },
};
