import { expect, it } from 'vitest';
import type { Visualizer } from '@/engine/types';
import { spanner } from '@/server/simulations/cloud/spanner';
import { events } from '@/server/simulations/cloud/events';
import { observability } from '@/server/simulations/cloud/observability';
import { iac } from '@/server/simulations/cloud/iac';
import { cicd } from '@/server/simulations/cloud/cicd';
import { cost, calculateCost } from '@/server/simulations/cloud/cost';
import { wellArchitected } from '@/server/simulations/cloud/well-architected';
import { threeTier } from '@/server/simulations/cloud/three-tier';
function result<I>(v: Visualizer<I>, raw: unknown) {
  return [...v.generate(v.validateInput(raw))].at(-1)!.state.result as Record<
    string,
    unknown
  >;
}
it('minority writes and strong reads fail while stale local reads remain explicitly stale', () => {
  const r = result(spanner, spanner.presets.average);
  const h = r.history as {
    status: string;
    value: number;
    timingConditionEstablished: boolean;
    wait: number;
  }[];
  expect(h.map((x) => x.status)).toEqual([
    'acknowledged',
    'local-stale-read',
    'majority-unavailable',
    'strong-read',
  ]);
  expect(h[1].value).toBe(0);
  expect(h[3].value).toBe(5);
  expect(h[0].timingConditionEstablished).toBe(true);
  expect(h[0].wait).toBe(5);
});
it('healing converges copies and disabling wait does not claim its timing condition', () => {
  const r = result(spanner, {
    ...spanner.presets.average,
    healAt: 1,
    commitWait: false,
  });
  const h = r.history as {
    value: number;
    timingConditionEstablished: boolean;
  }[];
  expect(h[0].timingConditionEstablished).toBe(false);
  expect(h[1].value).toBe(5);
  expect(h[2].value).toBe(5);
});
it('routes before fan-out, keeps inboxes target-local and conserves matched tasks', () => {
  const r = result(events, events.presets.average);
  expect(r.matched).toBe(4);
  expect(r.delivered).toBe(4);
  expect(r.suppressed).toBe(1);
  expect(r.effects).toEqual({ audit: 2, email: 1 });
  const fail = result(events, events.presets.worst);
  expect(fail.dead as unknown[]).toHaveLength(1);
  expect(fail.history as unknown[]).toHaveLength(3);
  expect(fail.delivered).toBe(0);
});
it('overlapping routes do not duplicate one occurrence-target delivery and unmatched events stay unmatched', () => {
  const r = result(events, {
    events: [
      { id: 'x', source: 'orders', type: 'created' },
      { id: 'y', source: 'users', type: 'cancelled' },
    ],
    rules: [
      { target: 'audit', source: 'orders' },
      { target: 'audit', source: 'orders', type: 'created' },
    ],
  });
  expect(r.matched).toBe(1);
  expect(r.unmatched).toBe(1);
});
it('SLO windows weight errors by request count rather than bucket percentages', () => {
  const r = result(observability, {
    window: 2,
    consecutive: 1,
    burnThreshold: 2,
    samples: [
      { requests: 1, errors: 1, latencyMs: 50 },
      { requests: 999, errors: 0, latencyMs: 50 },
    ],
  });
  const h = r.history as { burn: number; alert: boolean }[];
  expect(h[1].burn).toBeCloseTo(0.1);
  expect(h[1].alert).toBe(false);
  expect(r.remainingErrorBudget as number).toBeCloseTo(9);
});
it('missing samples and zero traffic are not success, with explicit policy behavior', () => {
  const raw = { samples: [null, null], consecutive: 2 };
  expect(
    (result(observability, raw).history as { alert: boolean }[])[1].alert,
  ).toBe(false);
  expect(
    (
      result(observability, { ...raw, missing: 'breaching' }).history as {
        alert: boolean;
      }[]
    )[1].alert,
  ).toBe(true);
  expect(
    result(observability, {
      samples: [{ requests: 0, errors: 0, latencyMs: 0 }],
    }).budgetConsumed,
  ).toBeNull();
});
it('IaC refresh finds drift; successful apply has an empty next plan', () => {
  const r = result(iac, iac.presets.average);
  expect((r.plan as { kind: string }[]).map((x) => x.kind)).toEqual([
    'update',
    'create',
  ]);
  expect(r.nextPlan).toEqual([]);
  const stale = result(iac, { ...iac.presets.average, refresh: false });
  expect(stale.nextPlan as unknown[]).toHaveLength(1);
});
it('preventDestroy blocks all actions and partial failure retains prior successes for the next plan', () => {
  expect(result(iac, iac.presets.worst).blocked).toBe(true);
  const r = result(iac, { ...iac.presets.average, failAt: 1 });
  expect(r.applied as unknown[]).toHaveLength(1);
  expect((r.nextPlan as { kind: string }[]).map((x) => x.kind)).toEqual([
    'create',
  ]);
});
it('pipeline refuses invalid artifacts, rolls back bad canaries, holds low samples and promotes a healthy candidate', () => {
  expect(
    result(cicd, { ...cicd.presets.best, signatureValid: false })
      .candidateTraffic,
  ).toBe(0);
  expect(
    result(cicd, { ...cicd.presets.best, candidateErrorPercent: 100 }).state,
  ).toBe('rollback');
  expect(
    result(cicd, { ...cicd.presets.best, requestsPerStage: 1 }).state,
  ).toBe('hold');
  expect(result(cicd, cicd.presets.best).state).toBe('promoted');
});
it('cache reduces origin-request compute but not client egress, and idle instances still cost money', () => {
  const p = cost.validateInput({ mode: 'per-request', cacheHitPercent: 0 }),
    a = calculateCost(p),
    b = calculateCost({ ...p, cacheHitPercent: 100 });
  expect(b.compute).toBe(0);
  expect(b.egress).toBe(a.egress);
  expect(
    calculateCost(cost.validateInput({ requests: 0, cacheHitPercent: 0 }))
      .compute,
  ).toBeGreaterThan(0);
  expect(
    calculateCost(cost.validateInput({ hours: 0, requests: 0 })).total,
  ).toBe(0);
});
it('three-tier failure paths conserve every request and public exposure never grants DB identity', () => {
  for (const raw of [
    threeTier.presets.best,
    threeTier.presets.average,
    threeTier.presets.worst,
    { ...threeTier.presets.average, queueLimit: 0, failReplica: true },
    { ...threeTier.presets.average, publicIngress: false },
  ]) {
    const r = result(threeTier, raw);
    expect(r.offered).toBe(
      (r.completed as number) +
        (r.failed as number) +
        (r.rejected as number) +
        (r.pending as number),
    );
  }
  const denied = result(threeTier, threeTier.presets.worst);
  expect(denied.completed).toBe(0);
  expect(denied.failed).toBeGreaterThan(0);
  expect(denied.risks).toEqual(['Unnecessary database public exposure']);
});
it('well-architected review does not let budget success hide security or recovery failures', () => {
  const r = result(wellArchitected, wellArchitected.presets.worst);
  expect(r.survivingZoneCapacity).toBe(0);
  expect(r.actions).toContain(
    'Database exposure avoided and identity scope reviewed',
  );
  expect(r.actions).toContain('A backup restore has been tested');
  expect(result(wellArchitected, wellArchitected.presets.best).actions).toEqual(
    [],
  );
});
it('all new models have deterministic immutable serializable bounded traces for every preset', () => {
  for (const v of [
    spanner,
    events,
    observability,
    iac,
    cicd,
    cost,
    wellArchitected,
    threeTier,
  ] as unknown as Visualizer<unknown>[]) {
    for (const raw of [
      v.presets.best,
      v.presets.average,
      v.presets.worst,
      v.presets.random(8, 42),
    ]) {
      const input = v.validateInput(raw),
        before = JSON.stringify(input),
        frames = [...v.generate(input)];
      expect(JSON.stringify(input), v.id).toBe(before);
      expect(frames, v.id).toEqual([...v.generate(v.validateInput(raw))]);
      expect(JSON.parse(JSON.stringify(frames)), v.id).toEqual(frames);
      expect(frames.length).toBeLessThan(1000);
      expect(frames.some((f) => f.action)).toBe(true);
    }
  }
});
