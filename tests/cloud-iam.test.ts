import { expect, it } from 'vitest';
import { iam, globMatch } from '@/server/simulations/cloud/iam';
function run(raw: unknown) {
  return [...iam.generate(iam.validateInput(raw))].at(-1)!.state.result as {
    allowedCalls: number;
    deniedCalls: number;
    issuedSessions: number;
    history: { allowed: boolean; reason: string }[];
  };
}
it('bounded glob matching handles stars, single characters and literal punctuation', () => {
  expect(globMatch('bucket/course/*', 'bucket/course/a')).toBe(true);
  expect(globMatch('storage:r?ad', 'storage:read')).toBe(true);
  expect(globMatch('bucket/course/*', 'bucket/private/a')).toBe(false);
  expect(globMatch('a.b', 'axb')).toBe(false);
});
it('role trust, explicit deny and session expiry remain distinct decisions', () => {
  const r = run(iam.presets.average);
  expect(r.history.map((h) => h.reason)).toEqual([
    'temporary-session-issued',
    'matching-allow',
    'explicit-deny',
    'expired-session',
  ]);
  expect(r.allowedCalls).toBe(1);
  expect(r.deniedCalls).toBe(2);
});
it('rejects untrusted role assumption and missing MFA without issuing a session', () => {
  const r = run(iam.presets.worst);
  expect(r.issuedSessions).toBe(0);
  expect(r.history[0].reason).toBe('role-trust-rejected');
  expect(r.history[1].reason).toBe('role-MFA-required');
});
it('matching explicit deny overrides an otherwise matching allow', () => {
  const p = iam.presets.best,
    r = run({
      ...p,
      policies: [
        ...p.policies,
        {
          id: 'restrict',
          effect: 'deny',
          principal: 'role:reader',
          actions: ['storage:read'],
          resources: ['bucket/course/*'],
        },
      ],
    });
  expect(r.allowedCalls).toBe(0);
  expect(r.history.at(-1)?.reason).toBe('explicit-deny');
});
it('a role-session identifier cannot be borrowed by another caller', () => {
  const p = iam.presets.best,
    r = run({
      ...p,
      operations: [
        p.operations[0],
        {
          kind: 'call',
          principal: 'mallory',
          session: 's1',
          action: 'storage:read',
          resource: 'bucket/course/a',
        },
      ],
    });
  expect(r.history.at(-1)?.reason).toBe('session-owner-mismatch');
});
it('callers cannot bypass role trust by naming the reserved effective role principal directly', () => {
  expect(() =>
    iam.validateInput({
      operations: [
        {
          kind: 'call',
          principal: 'role:reader',
          action: 'storage:read',
          resource: 'bucket/course/a',
        },
      ],
    }),
  ).toThrow();
});
it('conditional policy checks use trusted environment and source range', () => {
  const p = iam.presets.best,
    r = run({
      ...p,
      policies: [
        {
          id: 'prod-private-only',
          effect: 'allow',
          principal: 'role:reader',
          actions: ['storage:read'],
          resources: ['bucket/course/*'],
          environment: 'prod',
          source: '10.0.0.0/8',
          requireMfa: true,
        },
      ],
    });
  expect(r.allowedCalls).toBe(0);
  expect(r.history.at(-1)?.reason).toBe('default-deny');
});
