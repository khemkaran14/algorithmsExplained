import { expect, it } from 'vitest';
import { serverless } from '@/server/simulations/cloud/serverless';
function run(raw: unknown) {
  return [...serverless.generate(serverless.validateInput(raw))].at(-1)!.state
    .result as {
    completed: number;
    rejected: number;
    pending: number;
    conserved: boolean;
    coldStarts: number;
    effectiveConcurrency: number;
    history: { starting: number; warm: number }[];
    requests: {
      at: number;
      start: number | null;
      end: number | null;
      environment: number | null;
    }[];
    environments: { id: number; readyAt: number }[];
  };
}
it('cold requests cannot start until their environment is ready', () => {
  const r = run(serverless.presets.average);
  for (const request of r.requests)
    if (request.start !== null) {
      expect(request.start).toBeGreaterThanOrEqual(
        r.environments.find((e) => e.id === request.environment)!.readyAt,
      );
      expect(request.start).toBeGreaterThanOrEqual(request.at);
    }
  expect(r.conserved).toBe(true);
});
it('models Lambda-style one-request environments separately from configurable Cloud Run concurrency', () => {
  const p = { ...serverless.presets.average, maxInstances: 2, concurrency: 4 },
    aws = run({ ...p, provider: 'aws' }),
    gcp = run({ ...p, provider: 'gcp' });
  expect(aws.effectiveConcurrency).toBe(1);
  expect(gcp.effectiveConcurrency).toBe(4);
  expect(gcp.completed).toBeGreaterThanOrEqual(aws.completed);
});
it('caps live environments and accounts for rejected and unfinished requests', () => {
  for (const raw of [
    serverless.presets.best,
    serverless.presets.average,
    serverless.presets.worst,
  ]) {
    const p = serverless.validateInput(raw),
      r = run(p);
    expect(r.conserved).toBe(true);
    expect(r.history.every((h) => h.starting + h.warm <= p.maxInstances)).toBe(
      true,
    );
  }
});
it('warm reuse serves repeated requests without a cold start per invocation', () => {
  const r = run(serverless.presets.best);
  expect(r.completed).toBe(5);
  expect(r.coldStarts).toBeLessThan(r.completed);
});
