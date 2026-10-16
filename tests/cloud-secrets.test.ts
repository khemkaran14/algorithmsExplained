import { expect, it } from 'vitest';
import { secrets } from '@/server/simulations/cloud/secrets';
function run(raw: unknown) {
  return [...secrets.generate(secrets.validateInput(raw))].at(-1)!.state
    .result as {
    active: number;
    authenticated: number;
    authenticationFailures: number;
    history: { status: string; authenticated: boolean | null }[];
  };
}
it('validates before promotion and can refresh clients before retiring old credentials', () => {
  const r = run(secrets.presets.best);
  expect(r.active).toBe(2);
  expect(r.authenticationFailures).toBe(0);
  expect(r.authenticated).toBe(2);
});
it('premature old-credential retirement rejects a still-fresh cached credential until refresh', () => {
  const r = run(secrets.presets.average);
  expect(r.history[6].status).toBe('cached-credential-no-longer-accepted');
  expect(r.history[8].authenticated).toBe(true);
});
it('failed configuration/validation cannot promote the pending version', () => {
  const r = run(secrets.presets.worst);
  expect(r.active).toBe(1);
  expect(r.history[3].status).toBe('promotion-rejected-unvalidated');
  expect(r.history[4].authenticated).toBe(true);
});
it('reader revocation affects future fetches but does not erase an already cached valid credential', () => {
  const r = run({
    cacheTTL: 4,
    operations: [
      { kind: 'use', client: 'a' },
      { kind: 'revoke-reader', client: 'a' },
      { kind: 'use', client: 'a' },
      { kind: 'tick' },
      { kind: 'use', client: 'a' },
    ],
  });
  expect(r.history[2].authenticated).toBe(true);
  expect(r.history[4].status).toBe('refresh-denied-client-fails-closed');
});
it('reconfiguring a pending credential requires fresh validation before promotion', () => {
  const r = run({
    operations: [
      { kind: 'create-pending' },
      { kind: 'configure-target', success: true },
      { kind: 'validate-pending', success: true },
      { kind: 'configure-target', success: false },
      { kind: 'promote' },
    ],
  });
  expect(r.active).toBe(1);
  expect(r.history[4].status).toBe('promotion-rejected-unvalidated');
});
