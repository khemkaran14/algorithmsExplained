import 'server-only';
import {
  createHash,
  createCipheriv,
  createDecipheriv,
  scryptSync,
  createPrivateKey,
  createPublicKey,
  sign,
  verify,
  X509Certificate,
} from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { frame, counters } from '@/engine/helpers';
import type { Visualizer, Frame } from '@/engine/types';
const hashSchema = z.object({
  text: z.string().min(1).max(128),
  byte: z.number().int().min(0).max(511).default(0),
});
export const hashing: Visualizer<z.infer<typeof hashSchema>> = {
  id: 'cryptographic-hash-functions',
  measureSize: (input) => Buffer.byteLength(input.text),
  maxSize: 128,
  inputHint:
    'Use {"text":"hello","byte":0}. Flip one low bit of one UTF-8 input byte and compare actual SHA-256 outputs. This demonstrates avalanche, not a proof of security.',
  presets: {
    best: { text: 'a', byte: 0 },
    average: { text: 'hello', byte: 0 },
    worst: { text: 'a'.repeat(128), byte: 127 },
    random: (n) => ({
      text: 'a'.repeat(Math.min(128, Math.max(1, n))),
      byte: 0,
    }),
  },
  validateInput(raw) {
    const p = hashSchema.parse(raw);
    if (p.byte >= Buffer.byteLength(p.text))
      throw new Error('The selected UTF-8 byte must exist in the text.');
    return p;
  },
  complexity: {
    metric: {
      label: 'Input bytes hashed by two digests',
      keys: ['hashInputBytes'],
    },
    best: 'O(n) input hashing',
    average: 'O(n)',
    worst: 'O(n)',
    space: 'O(1) digest/state, excluding input buffers',
    why: 'SHA-256 processes fixed-size blocks and emits 256 bits. A fixed-length digest cannot uniquely encode every input; collision resistance is a computational property, not an absence of possible collisions.',
  },
  *generate({ text, byte }) {
    const c = counters(),
      input = Buffer.from(text),
      changed = Buffer.from(input);
    changed[byte] ^= 1;
    const a = createHash('sha256').update(input).digest(),
      b = createHash('sha256').update(changed).digest();
    c.hashes = 2;
    c.hashInputBytes = 2 * input.length;
    const rows = [...Array(2)].map(() => Array(32).fill(0) as number[]);
    let differences = 0;
    yield frame(
      { kind: 'boxes', values: [...input] },
      'One input bit changes before two real SHA-256 computations.',
      c,
      1,
      { inputBytes: input.length, changedByte: byte },
    );
    for (let i = 0; i < 32; i++) {
      rows[0][i] = a[i];
      rows[1][i] = b[i];
      let xor = a[i] ^ b[i],
        bits = 0;
      while (xor) {
        bits += xor & 1;
        xor >>>= 1;
      }
      differences += bits;
      c.reads += 2;
      c.comparisons++;
      c.writes += 2;
      yield frame(
        {
          kind: 'matrix',
          values: [],
          rows,
          cellLabels: rows.map((r) =>
            r.map((v) => v.toString(16).padStart(2, '0')),
          ),
        },
        'Compare corresponding digest bytes after changing one input bit.',
        c,
        3,
        { byte: i, differingBits: differences },
        [
          { id: `0,${i}`, kind: 'comparing' },
          { id: `1,${i}`, kind: 'comparing' },
        ],
        {
          prompt: 'Does a similar input guarantee a similar digest?',
          choices: ['No', 'Yes'],
          answer: 'No',
          hint: 'A cryptographic digest is designed so small input changes do not preserve local output similarity.',
        },
      );
    }
    yield frame(
      {
        kind: 'boxes',
        values: [differences],
        result: {
          digest: a.toString('hex'),
          changedDigest: b.toString('hex'),
          differingBits: differences,
        },
      },
      'The example illustrates avalanche; it cannot establish collision or preimage resistance.',
      c,
      6,
      { differingBits: differences, outputBits: 256 },
    );
  },
};
const aesSchema = z.object({
  plaintext: z.string().max(96),
  tamper: z.boolean().default(false),
  nonceCounter: z.number().int().min(0).max(1000000).default(0),
});
export const symmetric: Visualizer<z.infer<typeof aesSchema>> = {
  id: 'symmetric-encryption',
  measureSize: (input) => Buffer.byteLength(input.plaintext),
  maxSize: 96,
  inputHint:
    'Use {"plaintext":"hello","tamper":false,"nonceCounter":0}. Deterministic public teaching fixtures only; never enter secrets. Real code must generate a fresh nonce under each key.',
  presets: {
    best: { plaintext: '', tamper: false, nonceCounter: 0 },
    average: { plaintext: 'hello world', tamper: false, nonceCounter: 1 },
    worst: {
      plaintext: 'authenticated message',
      tamper: true,
      nonceCounter: 2,
    },
    random: (n) => ({
      plaintext: 'x'.repeat(Math.min(96, n)),
      tamper: false,
      nonceCounter: n,
    }),
  },
  validateInput: (raw) => aesSchema.parse(raw),
  complexity: {
    best: 'O(n) encryption/decryption',
    average: 'O(n)',
    worst: 'O(n)',
    space: 'O(n) returned ciphertext/plaintext',
    why: 'AES-GCM combines confidentiality and an authentication tag. Authentication failure must reject the entire plaintext. Nonce reuse under a key breaks security; the interactive trace uses an explicitly public fixed fixture for reproducibility, not a deployable encryption scheme.',
  },
  *generate({ plaintext, tamper, nonceCounter }) {
    const c = counters(),
      key = createHash('sha256')
        .update('PUBLIC AlgoVerse AES teaching fixture')
        .digest(),
      nonce = createHash('sha256')
        .update(`PUBLIC nonce ${nonceCounter}`)
        .digest()
        .subarray(0, 12),
      cipher = createCipheriv('aes-256-gcm', key, nonce),
      encrypted = Buffer.concat([
        cipher.update(plaintext, 'utf8'),
        cipher.final(),
      ]),
      tag = cipher.getAuthTag();
    c.encryptions = 1;
    yield frame(
      { kind: 'boxes', values: [...Buffer.from(plaintext)] },
      'The shared key is public teaching data; production code uses a protected key and fresh nonce.',
      c,
      1,
      { nonceBytes: 12, tagBytes: 16 },
    );
    yield frame(
      { kind: 'boxes', values: [...encrypted] },
      'AES-GCM produces ciphertext plus an authentication tag.',
      c,
      3,
      { ciphertextBytes: encrypted.length },
      [],
      {
        prompt: 'Can ciphertext be accepted without verifying the tag?',
        choices: ['No', 'Yes'],
        answer: 'No',
        hint: 'Confidentiality alone does not establish integrity or authenticity.',
      },
    );
    const receivedTag = Buffer.from(tag);
    if (tamper) receivedTag[0] ^= 1;
    let decrypted: string | null = null,
      authenticated = false;
    try {
      const decipher = createDecipheriv('aes-256-gcm', key, nonce);
      decipher.setAuthTag(receivedTag);
      const candidate = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]);
      decrypted = candidate.toString('utf8');
      authenticated = true;
    } catch {
      /* Authentication failure deliberately yields no candidate plaintext. */
    }
    c.decryptions = 1;
    c.reads = Buffer.byteLength(plaintext) + encrypted.length;
    c.writes = encrypted.length;
    yield frame(
      {
        kind: 'boxes',
        values: authenticated ? [...Buffer.from(decrypted!)] : [],
        result: {
          ciphertext: encrypted.toString('hex'),
          tag: receivedTag.toString('hex'),
          authenticated,
          plaintext: decrypted,
          teachingFixture: true,
        },
      },
      authenticated
        ? 'Tag verification succeeded before plaintext was released.'
        : 'Tag verification failed; reject the entire message.',
      c,
      6,
      { authenticated, tamper },
    );
  },
};
function power(
  base: bigint,
  exponent: bigint,
  modulus: bigint,
  count: () => void = () => {},
) {
  let out = 1n;
  while (exponent) {
    if (exponent & 1n) {
      out = (out * base) % modulus;
      count();
    }
    exponent >>= 1n;
    if (exponent) {
      base = (base * base) % modulus;
      count();
    }
  }
  return out;
}
const rsaSchema = z.number().int().min(0).max(3232);
export const publicKey: Visualizer<number> = {
  id: 'public-key-cryptography',
  maxSize: 64,
  inputHint:
    'Enter a toy message integer from 0 to 3232. Fixed p=61,q=53,e=17,d=2753 demonstrate textbook RSA arithmetic only; use RSA-OAEP libraries for real encryption.',
  presets: {
    best: 0,
    average: 65,
    worst: 3232,
    random: (n) => Math.min(3232, n * 17),
  },
  validateInput: (raw) => rsaSchema.parse(raw),
  complexity: {
    metric: { label: 'Modular multiplications', keys: ['multiplications'] },
    best: 'O(log exponent) modular multiplications',
    average: 'O(log exponent) multiplications',
    worst: 'O(log exponent) multiplications',
    space: 'O(1) arithmetic words in this bounded toy',
    why: 'RSA arithmetic raises a message modulo n with a public exponent and recovers it with a corresponding private exponent. The tiny keys and missing randomized padding make textbook RSA unsuitable for real security; big-integer multiplication has its own bit cost.',
  },
  *generate(message) {
    const c = counters(),
      modulus = 3233n;
    yield frame(
      { kind: 'boxes', values: [61, 53, 3233] },
      'Tiny published primes make the arithmetic visible and provide no real security.',
      c,
      1,
      { publicExponent: 17, privateExponent: 2753, message },
    );
    function* exp(
      base: bigint,
      e: bigint,
      stage: string,
    ): Generator<Frame, bigint> {
      let result = 1n;
      while (e) {
        const use = (e & 1n) !== 0n;
        yield frame(
          { kind: 'boxes', values: [Number(result), Number(base)] },
          'Use the exponent’s low bit before squaring the modular power.',
          c,
          3,
          {
            stage,
            exponent: e.toString(),
            result: result.toString(),
            power: base.toString(),
          },
          [],
          {
            prompt: 'Should this exponent bit multiply the accumulator?',
            choices: ['Multiply', 'Skip'],
            answer: use ? 'Multiply' : 'Skip',
            hint: 'An odd remaining exponent has a set low bit.',
          },
        );
        if (use) {
          result = (result * base) % modulus;
          c.multiplications = (c.multiplications ?? 0) + 1;
        }
        e >>= 1n;
        if (e) {
          base = (base * base) % modulus;
          c.multiplications = (c.multiplications ?? 0) + 1;
        }
      }
      return result;
    }
    const encrypted = yield* exp(BigInt(message), 17n, 'public encryption'),
      decrypted = yield* exp(encrypted, 2753n, 'private decryption');
    yield frame(
      {
        kind: 'boxes',
        values: [message, Number(encrypted), Number(decrypted)],
        result: {
          message,
          ciphertext: Number(encrypted),
          decrypted: Number(decrypted),
          toy: true,
        },
      },
      'The mathematical round trip works, but real RSA encryption also requires large keys and OAEP.',
      c,
      6,
      { roundTrip: decrypted === BigInt(message) },
    );
  },
};
const dhSchema = z.object({
  alice: z.number().int().min(1).max(21),
  bob: z.number().int().min(1).max(21),
  mitm: z.boolean().default(false),
});
export const diffieHellman: Visualizer<z.infer<typeof dhSchema>> = {
  id: 'diffie-hellman-key-exchange',
  measureSize: (input) => Math.max(input.alice, input.bob),
  inputHint:
    'Use {"alice":6,"bob":15,"mitm":false}. The public toy group p=23,g=5 is insecure; turn mitm on to demonstrate unauthenticated key exchange.',
  presets: {
    best: { alice: 1, bob: 1, mitm: false },
    average: { alice: 6, bob: 15, mitm: false },
    worst: { alice: 6, bob: 15, mitm: true },
    random: (n) => ({
      alice: (n % 21) + 1,
      bob: ((n * 3) % 21) + 1,
      mitm: false,
    }),
  },
  validateInput: (raw) => dhSchema.parse(raw),
  complexity: {
    metric: { label: 'Modular multiplications', keys: ['multiplications'] },
    best: 'O(log private exponent) modular multiplications',
    average: 'O(log exponent)',
    worst: 'O(log exponent)',
    space: 'O(1) bounded toy arithmetic',
    why: 'Both honest peers compute g^(ab) mod p from exchanged public powers. Without authentication, an intermediary can negotiate a separate secret with each peer. Production protocols use validated large groups or modern curves, authentication and a key derivation function.',
  },
  *generate({ alice, bob, mitm }) {
    const c = counters();
    const exp = (base: bigint, exponent: bigint) =>
      power(base, exponent, 23n, () => {
        c.multiplications = (c.multiplications ?? 0) + 1;
      });
    const a = exp(5n, BigInt(alice)),
      b = exp(5n, BigInt(bob)),
      attackerPublic = mitm ? exp(5n, 7n) : 0n;
    yield frame(
      { kind: 'boxes', values: [23, 5] },
      'The prime and generator are public; this tiny group is only for arithmetic teaching.',
      c,
      1,
      { alice, bob, mitm },
    );
    yield frame(
      { kind: 'boxes', values: [Number(a), Number(b)] },
      'Exchange public powers rather than private exponents.',
      c,
      3,
      { alicePublic: a.toString(), bobPublic: b.toString() },
      [],
      {
        prompt: 'Does bare Diffie–Hellman authenticate the sender?',
        choices: ['No', 'Yes'],
        answer: 'No',
        hint: 'A public power does not identify who sent it; an active intermediary can substitute its own.',
      },
    );
    const aliceSecret = exp(mitm ? attackerPublic : b, BigInt(alice)),
      bobSecret = exp(mitm ? attackerPublic : a, BigInt(bob)),
      attackerAlice = mitm ? exp(a, 7n) : null,
      attackerBob = mitm ? exp(b, 7n) : null;
    c.exponentiations = mitm ? 7 : 4;
    yield frame(
      {
        kind: 'boxes',
        values: [Number(aliceSecret), Number(bobSecret)],
        result: {
          aliceSecret: Number(aliceSecret),
          bobSecret: Number(bobSecret),
          attackerAlice: attackerAlice === null ? null : Number(attackerAlice),
          attackerBob: attackerBob === null ? null : Number(attackerBob),
          authenticated: false,
          toy: true,
        },
      },
      mitm
        ? 'The intermediary knows the separate secret used with each peer.'
        : 'Honest peers derived the same toy secret; identity still needs authentication.',
      c,
      6,
      { mitm, shared: aliceSecret === bobSecret },
    );
  },
};
const signatureSchema = z.object({
  message: z.string().max(128),
  tamper: z.boolean().default(false),
});
// RFC 8032 test seed: deliberately public teaching material, never a production secret.
const signingSeed =
  '9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60';
export const signatures: Visualizer<z.infer<typeof signatureSchema>> = {
  id: 'digital-signatures',
  measureSize: (input) => Buffer.byteLength(input.message),
  maxSize: 128,
  inputHint:
    'Use {"message":"approve example","tamper":false}. A public RFC 8032 fixture key produces real Ed25519 signatures for reproducible teaching; never use that key outside examples.',
  presets: {
    best: { message: '', tamper: false },
    average: { message: 'approve example', tamper: false },
    worst: { message: 'approve example', tamper: true },
    random: (n) => ({ message: 'x'.repeat(Math.min(n, 128)), tamper: false }),
  },
  validateInput: (raw) => signatureSchema.parse(raw),
  complexity: {
    metric: { label: 'Message bytes verified', keys: ['reads'] },
    best: 'O(n) message processing plus fixed-parameter curve operations',
    average: 'O(n) message processing',
    worst: 'O(n) message processing',
    space: 'O(n) message buffers plus fixed-size signature/key data',
    why: 'Ed25519 signs with a private key and verifies with a public key. A valid signature establishes integrity relative to that key; identity depends on how the public key is trusted. It does not encrypt the message.',
  },
  *generate({ message, tamper }) {
    const c = counters(),
      key = createPrivateKey({
        key: Buffer.from(
          '302e020100300506032b657004220420' + signingSeed,
          'hex',
        ),
        format: 'der',
        type: 'pkcs8',
      }),
      publicKey = createPublicKey(key),
      signature = sign(null, Buffer.from(message), key),
      received = Buffer.from(tamper ? message + '!' : message);
    c.signatures = 1;
    yield frame(
      { kind: 'boxes', values: [...Buffer.from(message)] },
      'Sign the message using a deliberately public example private key.',
      c,
      1,
      { messageBytes: Buffer.byteLength(message) },
    );
    yield frame(
      { kind: 'boxes', values: [...signature] },
      'The signature is separate from the visible message.',
      c,
      3,
      { signatureBytes: signature.length },
      [],
      {
        prompt: 'Does a digital signature hide the message?',
        choices: ['No', 'Yes'],
        answer: 'No',
        hint: 'Signing proves integrity relative to a trusted key; encryption supplies confidentiality.',
      },
    );
    const valid = verify(null, received, publicKey, signature);
    c.verifications = 1;
    c.reads = received.length;
    yield frame(
      {
        kind: 'boxes',
        values: [valid ? 1 : 0],
        result: {
          signature: signature.toString('hex'),
          valid,
          tamper,
          publicKey: publicKey
            .export({ format: 'der', type: 'spki' })
            .toString('hex'),
          teachingFixture: true,
        },
      },
      valid
        ? 'Verification succeeds for the exact signed bytes.'
        : 'Changing the message makes signature verification fail.',
      c,
      6,
      { valid, tamper },
    );
  },
};
const passwordSchema = z.object({
  password: z.string().max(32),
  salt: z.string().min(8).max(32),
  cost: z
    .union([
      z.literal(1024),
      z.literal(2048),
      z.literal(4096),
      z.literal(8192),
      z.literal(16384),
    ])
    .default(1024),
});
export const passwords: Visualizer<z.infer<typeof passwordSchema>> = {
  id: 'password-hashing-salting',
  measureSize: (input) => Buffer.byteLength(input.password),
  maxSize: 32,
  inputHint:
    'Use example data only: {"password":"example password","salt":"public-demo-salt","cost":1024}. These deliberately small teaching costs are not production recommendations.',
  presets: {
    best: { password: 'example', salt: 'public-demo-salt', cost: 1024 },
    average: {
      password: 'example password',
      salt: 'public-demo-salt',
      cost: 2048,
    },
    worst: {
      password: 'example password',
      salt: 'public-demo-salt',
      cost: 16384,
    },
    random: (n) => ({
      password: 'x'.repeat(Math.min(n, 32)),
      salt: 'public-demo-salt',
      cost: 1024,
    }),
  },
  validateInput: (raw) => passwordSchema.parse(raw),
  complexity: {
    metric: {
      label: 'Modeled scrypt memory bytes',
      keys: ['modeledMemoryBytes'],
    },
    best: 'O(Nrp) KDF work',
    average: 'O(Nrp)',
    worst: 'O(Nrp)',
    space: 'O(Nr) memory',
    why: 'A password KDF deliberately spends work and memory to slow guessing. A unique random salt prevents shared precomputation and equal-password hash equality across accounts; salt is stored openly with algorithm parameters. Production costs must be calibrated and updated.',
  },
  *generate({ password, salt, cost }) {
    const c = counters(),
      first = scryptSync(password, salt, 32, {
        N: cost,
        r: 8,
        p: 1,
        maxmem: 64 * 1024 * 1024,
      }),
      second = scryptSync(password, salt + ':other', 32, {
        N: cost,
        r: 8,
        p: 1,
        maxmem: 64 * 1024 * 1024,
      });
    c.derivations = 2;
    c.modeledMemoryBytes = 128 * cost * 8;
    yield frame(
      { kind: 'boxes', values: [cost, 8, 1] },
      'Use a password KDF rather than a fast general-purpose digest.',
      c,
      1,
      { N: cost, r: 8, p: 1, estimatedMemoryBytes: 128 * cost * 8 },
    );
    yield frame(
      {
        kind: 'matrix',
        values: [],
        rows: [[...first], [...second]],
        cellLabels: [[...first], [...second]].map((row) =>
          row.map((v) => v.toString(16).padStart(2, '0')),
        ),
      },
      'The same example password produces different derived bytes with a different salt.',
      c,
      3,
      { samePassword: true, sameSalt: false },
      [],
      {
        prompt: 'Must a password salt remain secret?',
        choices: [
          'No; store it with the hash',
          'Yes; it replaces the password',
        ],
        answer: 'No; store it with the hash',
        hint: 'Salt provides uniqueness. The password remains secret, and the stored verifier includes salt plus KDF parameters.',
      },
    );
    yield frame(
      {
        kind: 'boxes',
        values: [128 * cost * 8],
        result: {
          hash: first.toString('hex'),
          otherSaltHash: second.toString('hex'),
          same: first.equals(second),
          estimatedMemoryBytes: 128 * cost * 8,
          teachingCost: true,
        },
      },
      'Production code uses random per-password salts and calibrated costs; these fixtures are for comparison.',
      c,
      6,
      { estimatedMemoryBytes: 128 * cost * 8 },
    );
  },
};
const tlsSchema = z.object({
  hostname: z
    .string()
    .min(1)
    .max(253)
    .regex(/^[a-zA-Z0-9.-]+$/),
  time: z.iso.datetime(),
  trustRoot: z.boolean().default(true),
  tamper: z.boolean().default(false),
});
export const tls: Visualizer<z.infer<typeof tlsSchema>> = {
  id: 'digital-certificates-tls',
  measureSize: () => 3,
  inputHint:
    'Use {"hostname":"learn.algoversedemo.test","time":"2027-01-01T00:00:00Z","trustRoot":true,"tamper":false}. Public offline certificates illustrate selected chain checks, not a complete TLS handshake or revocation system.',
  presets: {
    best: {
      hostname: 'learn.algoversedemo.test',
      time: '2027-01-01T00:00:00Z',
      trustRoot: true,
      tamper: false,
    },
    average: {
      hostname: 'learn.algoversedemo.test',
      time: '2027-01-01T00:00:00Z',
      trustRoot: true,
      tamper: false,
    },
    worst: {
      hostname: 'wrong.algoversedemo.test',
      time: '2040-01-01T00:00:00Z',
      trustRoot: false,
      tamper: true,
    },
    random: () => ({
      hostname: 'learn.algoversedemo.test',
      time: '2027-01-01T00:00:00Z',
      trustRoot: true,
      tamper: false,
    }),
  },
  validateInput: (raw) => tlsSchema.parse(raw),
  complexity: {
    metric: { label: 'Certificate checks', keys: ['checks'] },
    best: 'O(k) chain checks plus signature verification',
    average: 'O(k) chain length checks',
    worst: 'O(k) checks in this fixed-chain model',
    space: 'O(k) parsed certificates',
    why: 'A trusted certificate chain binds a public key to a hostname only after signature, issuer, validity, CA and name checks. A complete TLS stack additionally negotiates authenticated encryption, proves possession, validates protocol constraints and handles revocation policy; use established HTTPS clients in real applications.',
  },
  *generate(input) {
    const c = counters(),
      base = path.join(
        process.cwd(),
        'content/dsa/security/digital-certificates-tls/fixtures',
      ),
      root = new X509Certificate(readFileSync(path.join(base, 'root.pem'))),
      intermediate = new X509Certificate(
        readFileSync(path.join(base, 'intermediate.pem')),
      );
    let leaf = new X509Certificate(readFileSync(path.join(base, 'leaf.pem')));
    if (input.tamper) {
      const der = Buffer.from(leaf.raw);
      der[der.length - 1] ^= 1;
      leaf = new X509Certificate(der);
    }
    const time = Date.parse(input.time),
      validTime = (certificate: X509Certificate) =>
        time >= Date.parse(certificate.validFrom) &&
        time <= Date.parse(certificate.validTo),
      checks = [
        {
          name: 'Explicit trust anchor',
          passed: input.trustRoot && root.verify(root.publicKey),
          node: 'trust',
        },
        {
          name: 'CA constraints',
          passed: root.ca && intermediate.ca && !leaf.ca,
          node: 'intermediate',
        },
        {
          name: 'Intermediate issuer and signature',
          passed:
            intermediate.checkIssued(root) &&
            intermediate.verify(root.publicKey),
          node: 'intermediate',
        },
        {
          name: 'Leaf issuer and signature',
          passed:
            leaf.checkIssued(intermediate) &&
            leaf.verify(intermediate.publicKey),
          node: 'leaf',
        },
        {
          name: 'Validity period',
          passed: [root, intermediate, leaf].every(validTime),
          node: 'leaf',
        },
        {
          name: 'Server authentication usage',
          passed: leaf.keyUsage?.includes('1.3.6.1.5.5.7.3.1') ?? false,
          node: 'leaf',
        },
        {
          name: 'Requested hostname',
          passed: leaf.checkHost(input.hostname) !== undefined,
          node: 'browser',
        },
      ];
    const state = {
      kind: 'architecture' as const,
      values: [],
      nodes: [
        { id: 'browser', label: 'Browser hostname', x: 0, y: 0 },
        { id: 'leaf', label: 'Leaf certificate', x: 220, y: 0 },
        { id: 'intermediate', label: 'Intermediate CA', x: 440, y: 0 },
        { id: 'trust', label: 'Trusted root', x: 660, y: 0 },
      ],
      edges: [
        { from: 'browser', to: 'leaf' },
        { from: 'leaf', to: 'intermediate' },
        { from: 'intermediate', to: 'trust' },
      ],
    };
    yield frame(
      state,
      'Certificate data is public; trust requires explicit verification against an accepted root.',
      c,
      1,
      { hostname: input.hostname, time: input.time },
    );
    for (const check of checks) {
      c.checks = (c.checks ?? 0) + 1;
      yield frame(
        state,
        'Evaluate ' + check.name.toLowerCase() + '.',
        c,
        3,
        { check: check.name, passed: check.passed },
        [{ id: check.node, kind: check.passed ? 'done' : 'error' }],
        {
          prompt: 'Did this verification check pass?',
          choices: ['Pass', 'Fail'],
          answer: check.passed ? 'Pass' : 'Fail',
          hint: 'Inspect the requested hostname, selected time, trust setting and certificate verification result.',
        },
      );
    }
    const valid = checks.every((check) => check.passed),
      f = frame(
        state,
        valid
          ? 'The modelled certificate checks pass; a real TLS stack still performs additional protocol checks.'
          : 'Reject the connection when any required certificate check fails.',
        c,
        6,
        { valid },
      );
    f.state.result = {
      valid,
      checks: checks.map(({ name, passed }) => ({ name, passed })),
      revocationChecked: false,
      handshakeSimulated: false,
    };
    yield f;
  },
};
