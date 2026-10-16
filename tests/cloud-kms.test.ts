import { expect, it } from 'vitest';
import { kms } from '@/server/simulations/cloud/kms';
function run(raw: unknown) {
  return [...kms.generate(kms.validateInput(raw))].at(-1)!.state.result as {
    history: { status: string; plaintext: string | null }[];
    records: Record<
      string,
      { version: number; data: unknown; wrappedKey: unknown }
    >;
    authorizedReads: number;
    rewraps: number;
  };
}
it('rotates the wrapping key without rewriting payload ciphertext and safely rewraps the DEK', () => {
  const p = kms.presets.average,
    r = run(p),
    initial = run(kms.presets.best);
  expect(r.records.a.version).toBe(2);
  expect(r.records.a.data).toEqual(initial.records.a.data);
  expect(r.rewraps).toBe(1);
  expect(r.history.at(-1)?.plaintext).toBe('public teaching data');
});
it('retiring old KEKs before rewrap prevents old ciphertext access instead of inventing migration', () => {
  const r = run({ ...kms.presets.average, retireOldOnRotate: true });
  expect(r.history[2].status).toBe('wrapping-KEK-disabled');
  expect(r.rewraps).toBe(0);
});
it('ciphertext tampering fails GCM authentication while unauthorized actors never attempt a read', () => {
  const r = run(kms.presets.worst);
  expect(r.history[1].status).toBe('data-use-permission-denied');
  expect(r.history[3].status).toBe('authenticated-decryption-failed');
  expect(r.history[3].plaintext).toBeNull();
});
it('key administration does not automatically grant data decryption', () => {
  const p = kms.presets.best,
    r = run({
      ...p,
      operations: [
        p.operations[0],
        { kind: 'read', id: 'a', actor: 'operator' },
      ],
    });
  expect(r.authorizedReads).toBe(0);
  expect(r.history.at(-1)?.status).toBe('data-use-permission-denied');
});
it('re-enabling a retained disabled KEK restores access without changing ciphertext', () => {
  const p = kms.presets.best,
    r = run({
      operations: [
        p.operations[0],
        { kind: 'disable', version: 1 },
        { kind: 'read', id: 'a' },
        { kind: 'enable', version: 1 },
        { kind: 'read', id: 'a' },
      ],
    });
  expect(r.history[2].status).toBe('wrapping-KEK-disabled');
  expect(r.history[4].plaintext).toBe('public teaching data');
});
it('public deterministic fixtures produce reproducible immutable JSON-safe traces', () => {
  const input = kms.validateInput(kms.presets.average),
    before = structuredClone(input),
    frames = [...kms.generate(input)];
  expect(input).toEqual(before);
  expect(frames).toEqual([...kms.generate(input)]);
  expect(JSON.parse(JSON.stringify(frames))).toEqual(frames);
});
