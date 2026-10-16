import { expect, it } from 'vitest';
import { objectStorage } from '@/server/simulations/cloud/object-storage';
function run(raw: unknown) {
  return [...objectStorage.generate(objectStorage.validateInput(raw))].at(-1)!
    .state.result as {
    history: { kind: string; status: string; value: string | null }[];
    objects: Record<string, { value: string | null; marker: boolean }[]>;
    preconditionFailures: number;
    expiredVersions: number;
  };
}
it('S3-style marker deletion can reveal a retained older current version', () => {
  const r = run(objectStorage.presets.average);
  expect(r.history[3].status).toBe('not-found');
  expect(r.history[4].value).toBe('one');
  expect(r.history.at(-1)?.value).toBe('two');
});
it('Cloud Storage-style archived generations do not automatically become live after delete', () => {
  const r = run({ ...objectStorage.presets.average, provider: 'gcp' });
  expect(r.history[3].status).toBe('not-found');
  expect(r.history[4].value).toBe('one');
  expect(r.history.at(-1)?.status).toBe('not-found');
  expect(r.objects.photo.some((v) => v.marker)).toBe(false);
});
it('rejects a stale compare token without replacing current content', () => {
  const r = run(objectStorage.presets.worst);
  expect(r.preconditionFailures).toBe(1);
  expect(r.history[2].status).toBe('precondition-failed');
});
it('disabled versioning overwrites old data instead of promising a recoverable archive', () => {
  const r = run({
    versioning: false,
    operations: [
      { kind: 'put', key: 'a', value: 'old' },
      { kind: 'put', key: 'a', value: 'new' },
      { kind: 'get', key: 'a', version: 'v1' },
    ],
  });
  expect(r.objects.a).toHaveLength(1);
  expect(r.history.at(-1)?.status).toBe('not-found');
});
it('archive expiry counts time since becoming noncurrent and preserves the current object', () => {
  const r = run({
    archiveRetention: 2,
    operations: [
      { kind: 'put', key: 'a', value: 'old' },
      { kind: 'tick' },
      { kind: 'tick' },
      { kind: 'put', key: 'a', value: 'new' },
      { kind: 'get', key: 'a', version: 'v1' },
      { kind: 'get', key: 'a', version: 'v1' },
      { kind: 'get', key: 'a' },
    ],
  });
  expect(r.history[4].value).toBe('old');
  expect(r.history[5].status).toBe('not-found');
  expect(r.history[6].value).toBe('new');
});
