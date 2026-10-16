import { it, expect, describe } from 'vitest';
import {
  hashing,
  symmetric,
  publicKey,
  diffieHellman,
  signatures,
  passwords,
  tls,
} from '@/server/visualizers/security';
import type { Visualizer } from '@/engine/types';
const all = [
  hashing,
  symmetric,
  publicKey,
  diffieHellman,
  signatures,
  passwords,
  tls,
] as Visualizer<unknown>[];
describe.each(all)('$id', (v) =>
  it('has deterministic immutable serializable preset traces', () => {
    for (const raw of [
      v.presets.best,
      v.presets.average,
      v.presets.worst,
      v.presets.random(8, 42),
    ]) {
      const input = v.validateInput(raw),
        copy = structuredClone(input),
        frames = [...v.generate(input)];
      expect(frames.length).toBeGreaterThan(1);
      expect(frames).toEqual([...v.generate(input)]);
      expect(input).toEqual(copy);
      expect(JSON.parse(JSON.stringify(frames))).toEqual(frames);
    }
  }),
);
it('SHA-256 matches a known vector and detects the changed input bit', () => {
  const r = [...hashing.generate({ text: 'hello', byte: 0 })].at(-1)!.state
    .result as { digest: string; changedDigest: string; differingBits: number };
  expect(r.digest).toBe(
    '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
  );
  expect(r.changedDigest).not.toBe(r.digest);
  expect(r.differingBits).toBeGreaterThan(0);
  expect(r.differingBits).toBeLessThanOrEqual(256);
  expect(() => hashing.validateInput({ text: 'a', byte: 1 })).toThrow();
});
it('GCM authenticates exact Unicode/empty plaintext and releases none after tag tampering', () => {
  for (const plaintext of ['', 'hello', 'नमस्ते 🙂'])
    for (const tamper of [false, true]) {
      expect(
        [...symmetric.generate({ plaintext, tamper, nonceCounter: 42 })].at(-1)!
          .state.result,
      ).toMatchObject({
        authenticated: !tamper,
        plaintext: tamper ? null : plaintext,
        teachingFixture: true,
      });
    }
});
it('toy RSA round-trips boundary and non-coprime message values', () => {
  for (const message of [0, 1, 53, 61, 65, 3232])
    expect([...publicKey.generate(message)].at(-1)!.state.result).toMatchObject(
      { message, decrypted: message, toy: true },
    );
});
it('honest DH agrees while the intermediary knows each separate attacked secret', () => {
  const honest = [
    ...diffieHellman.generate({ alice: 6, bob: 15, mitm: false }),
  ].at(-1)!.state.result as { aliceSecret: number; bobSecret: number };
  expect(honest.aliceSecret).toBe(honest.bobSecret);
  const attacked = [
    ...diffieHellman.generate({ alice: 6, bob: 15, mitm: true }),
  ].at(-1)!.state.result as {
    aliceSecret: number;
    bobSecret: number;
    attackerAlice: number;
    attackerBob: number;
  };
  expect(attacked.aliceSecret).toBe(attacked.attackerAlice);
  expect(attacked.bobSecret).toBe(attacked.attackerBob);
});
it('Ed25519 reproduces RFC 8032 empty-message signature and rejects changed message', () => {
  const expected =
    'e5564300c360ac729086e2cc806e828a84877f1eb8e5d974d873e065224901555fb8821590a33bacc61e39701cf9b46bd25bf5f0595bbe24655141438e7a100b';
  expect(
    [...signatures.generate({ message: '', tamper: false })].at(-1)!.state
      .result,
  ).toMatchObject({ signature: expected, valid: true });
  expect(
    [...signatures.generate({ message: '', tamper: true })].at(-1)!.state
      .result,
  ).toMatchObject({ valid: false });
});
it('scrypt salts change verifiers and expose explicit cost/memory parameters', () => {
  const r = [
    ...passwords.generate({
      password: 'example password',
      salt: 'public-demo-salt',
      cost: 1024,
    }),
  ].at(-1)!.state.result as {
    hash: string;
    otherSaltHash: string;
    estimatedMemoryBytes: number;
  };
  expect(r.hash).not.toBe(r.otherSaltHash);
  expect(r.hash).toHaveLength(64);
  expect(r.estimatedMemoryBytes).toBe(1048576);
});
it('certificate validation checks actual signatures, hostname, time and explicit trust', () => {
  const base = {
    hostname: 'learn.algoversedemo.test',
    time: '2027-01-01T00:00:00Z',
    trustRoot: true,
    tamper: false,
  };
  expect([...tls.generate(base)].at(-1)!.state.result).toMatchObject({
    valid: true,
    revocationChecked: false,
    handshakeSimulated: false,
  });
  for (const change of [
    { hostname: 'wrong.algoversedemo.test' },
    { time: '2040-01-01T00:00:00Z' },
    { trustRoot: false },
    { tamper: true },
  ])
    expect(
      [...tls.generate({ ...base, ...change })].at(-1)!.state.result,
    ).toMatchObject({ valid: false });
});
