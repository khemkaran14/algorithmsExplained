import 'server-only';
import { z } from 'zod';
import { createCipheriv, createDecipheriv, createHash } from 'node:crypto';
import { frame, counters } from '@/engine/helpers';
import type { Visualizer, VisualState } from '@/engine/types';
const actor = z.enum(['app', 'operator', 'attacker']),
  id = z.string().regex(/^[a-z0-9-]{1,20}$/);
const schema = z
  .object({
    appCanEncrypt: z.boolean().default(true),
    appCanDecrypt: z.boolean().default(true),
    operatorCanDecrypt: z.boolean().default(false),
    attackerCanDecrypt: z.boolean().default(false),
    retireOldOnRotate: z.boolean().default(false),
    operations: z
      .array(
        z.discriminatedUnion('kind', [
          z.object({
            kind: z.literal('store'),
            id,
            plaintext: z.string().max(128),
            actor: actor.default('app'),
          }),
          z.object({
            kind: z.literal('read'),
            id,
            actor: actor.default('app'),
          }),
          z.object({
            kind: z.literal('rewrap'),
            id,
            actor: actor.default('app'),
          }),
          z.object({
            kind: z.literal('rotate'),
            actor: actor.default('operator'),
          }),
          z.object({
            kind: z.literal('disable'),
            version: z.number().int().min(1).max(24),
            actor: actor.default('operator'),
          }),
          z.object({
            kind: z.literal('enable'),
            version: z.number().int().min(1).max(24),
            actor: actor.default('operator'),
          }),
          z.object({
            kind: z.literal('tamper'),
            id,
            target: z.enum(['data', 'wrapped-key']),
          }),
        ]),
      )
      .min(1)
      .max(24),
  })
  .strict();
export const kms: Visualizer<z.infer<typeof schema>> = {
  id: 'kms-cloud-kms',
  maxSize: 24,
  measureSize: (p) => p.operations.length,
  inputHint:
    'Real local AES-256-GCM envelope operations with PUBLIC deterministic teaching keys/nonces. Never use these fixtures to protect real data. Each record has a data key; a versioned KEK wraps it, with record/version AAD binding. Rotation does not rewrite old payloads; rewrap changes the KEK wrapper while retaining payload encryption. Key administration is distinct from decrypt permission. Explicit version disable models separate KEKs/GCP-style versions, not identical AWS automatic-rotation controls. No real KMS call occurs.',
  controls: [
    { key: 'appCanEncrypt', label: 'App can wrap/encrypt', type: 'boolean' },
    { key: 'appCanDecrypt', label: 'App can unwrap/decrypt', type: 'boolean' },
    {
      key: 'operatorCanDecrypt',
      label: 'Grant key administrator data decryption',
      type: 'boolean',
    },
    {
      key: 'attackerCanDecrypt',
      label: 'Demonstrate an overbroad decrypt grant',
      type: 'boolean',
    },
    {
      key: 'retireOldOnRotate',
      label: 'Disable old KEKs immediately on rotation',
      type: 'boolean',
    },
  ],
  presets: {
    best: schema.parse({
      operations: [
        { kind: 'store', id: 'a', plaintext: 'public teaching data' },
        { kind: 'read', id: 'a' },
      ],
    }),
    average: schema.parse({
      operations: [
        { kind: 'store', id: 'a', plaintext: 'public teaching data' },
        { kind: 'rotate' },
        { kind: 'read', id: 'a' },
        { kind: 'rewrap', id: 'a' },
        { kind: 'disable', version: 1 },
        { kind: 'read', id: 'a' },
      ],
    }),
    worst: schema.parse({
      operations: [
        { kind: 'store', id: 'a', plaintext: 'example' },
        { kind: 'read', id: 'a', actor: 'attacker' },
        { kind: 'tamper', id: 'a', target: 'data' },
        { kind: 'read', id: 'a' },
        { kind: 'disable', version: 1 },
        { kind: 'read', id: 'a' },
      ],
    }),
    random: (n) =>
      schema.parse({
        operations: [
          { kind: 'store', id: 'a', plaintext: 'public fixture' },
          ...Array.from({ length: Math.min(23, Math.max(0, n - 1)) }, (_, i) =>
            i % 3 === 0 ? { kind: 'rotate' } : { kind: 'read', id: 'a' },
          ),
        ],
      }),
  },
  validateInput: (raw) => schema.parse(raw),
  complexity: {
    best: 'Envelope rewrap changes a small wrapped data key without re-encrypting payload bytes',
    average:
      'Payload encryption/decryption is linear in plaintext/ciphertext size',
    worst:
      'Disabling needed KEKs prevents unwrap even when ciphertext survives',
    space: 'O(ciphertext + wrapped-key metadata + retained key versions)',
    why: 'The local fixture is not a cloud HSM, provider key lifecycle, identity service or production key-management design. Real data keys/nonces require CSPRNG uniqueness, protected key custody and native provider policy checks.',
    metric: {
      label: 'Local authenticated-crypto attempts',
      keys: ['cryptoAttempts'],
    },
  },
  *generate(p) {
    type Actor = z.infer<typeof actor>;
    type Envelope = { nonce: string; ciphertext: string; tag: string };
    type Stored = { version: number; wrappedKey: Envelope; data: Envelope };
    const c = counters();
    c.cryptoAttempts = 0;
    c.authorizedReads = 0;
    c.rewraps = 0;
    let active = 1,
      nonceCounter = 0;
    const material = (label: string) =>
        createHash('sha256')
          .update(`PUBLIC-ALGO-VERSE-FIXTURE:${label}`)
          .digest(),
      keys = new Map<number, { enabled: boolean; key: Buffer }>([
        [1, { enabled: true, key: material('KEK:1') }],
      ]),
      records = new Map<string, Stored>(),
      history: {
        operation: number;
        kind: string;
        actor: string | null;
        status: string;
        plaintext: string | null;
        version: number | null;
      }[] = [];
    function encrypt(key: Buffer, plaintext: Buffer, aad: string): Envelope {
      c.cryptoAttempts++;
      const nonce = Buffer.alloc(12);
      nonce.writeUInt32BE(++nonceCounter, 8);
      const cipher = createCipheriv('aes-256-gcm', key, nonce);
      cipher.setAAD(Buffer.from(aad));
      const ciphertext = Buffer.concat([
        cipher.update(plaintext),
        cipher.final(),
      ]);
      return {
        nonce: nonce.toString('base64'),
        ciphertext: ciphertext.toString('base64'),
        tag: cipher.getAuthTag().toString('base64'),
      };
    }
    function decrypt(key: Buffer, envelope: Envelope, aad: string) {
      c.cryptoAttempts++;
      const decipher = createDecipheriv(
        'aes-256-gcm',
        key,
        Buffer.from(envelope.nonce, 'base64'),
      );
      decipher.setAAD(Buffer.from(aad));
      decipher.setAuthTag(Buffer.from(envelope.tag, 'base64'));
      return Buffer.concat([
        decipher.update(Buffer.from(envelope.ciphertext, 'base64')),
        decipher.final(),
      ]);
    }
    const canDecrypt = (actor: Actor) =>
      actor === 'app'
        ? p.appCanDecrypt
        : actor === 'operator'
          ? p.operatorCanDecrypt
          : p.attackerCanDecrypt;
    const scene: VisualState = {
      kind: 'architecture',
      values: [],
      nodes: [
        { id: 'app', label: 'App data-use permissions', x: 0, y: 100 },
        {
          id: 'payload',
          label: 'Payload encrypted with a DEK',
          x: 270,
          y: 200,
        },
        {
          id: 'wrapped',
          label: 'DEK wrapped by a versioned KEK',
          x: 270,
          y: 0,
        },
        { id: 'kms', label: 'Enabled KEKs + use policy', x: 540, y: 0 },
        {
          id: 'admin',
          label: 'Administration ≠ decrypt rights',
          x: 540,
          y: 200,
        },
      ],
      edges: [
        { from: 'app', to: 'payload' },
        { from: 'app', to: 'wrapped' },
        { from: 'wrapped', to: 'kms' },
        { from: 'admin', to: 'kms' },
      ],
    };
    yield frame(
      scene,
      'PUBLIC FIXTURE: trace actual envelope cryptography without treating teaching keys as confidential or contacting a cloud account.',
      c,
      1,
    );
    for (let i = 0; i < p.operations.length; i++) {
      const op = p.operations[i];
      let status = '',
        plaintext: string | null = null,
        version: number | null = null;
      try {
        if (op.kind === 'store') {
          if (op.actor !== 'app' || !p.appCanEncrypt)
            status = 'encrypt-permission-denied';
          else if (records.has(op.id)) status = 'record-ID-already-used';
          else if (!keys.get(active)!.enabled) status = 'active-KEK-disabled';
          else {
            const dek = material(`DEK:${op.id}`),
              data = encrypt(
                dek,
                Buffer.from(op.plaintext),
                `payload:${op.id}`,
              ),
              wrappedKey = encrypt(
                keys.get(active)!.key,
                dek,
                `dek:${op.id}:${active}`,
              );
            records.set(op.id, { version: active, data, wrappedKey });
            version = active;
            status = 'envelope-stored';
            c.writes++;
          }
        } else if (op.kind === 'rotate') {
          if (op.actor !== 'operator') status = 'key-admin-permission-denied';
          else {
            if (p.retireOldOnRotate)
              for (const key of keys.values()) key.enabled = false;
            active++;
            keys.set(active, { enabled: true, key: material(`KEK:${active}`) });
            status = 'new-KEK-active-old-records-unchanged';
            version = active;
          }
        } else if (op.kind === 'disable' || op.kind === 'enable') {
          if (op.actor !== 'operator') status = 'key-admin-permission-denied';
          else if (!keys.has(op.version)) status = 'unknown-KEK-version';
          else {
            keys.get(op.version)!.enabled = op.kind === 'enable';
            status = op.kind === 'enable' ? 'KEK-enabled' : 'KEK-disabled';
            version = op.version;
          }
        } else if (op.kind === 'tamper') {
          const record = records.get(op.id);
          if (!record) status = 'record-not-found';
          else {
            const envelope =
                op.target === 'data' ? record.data : record.wrappedKey,
              tag = Buffer.from(envelope.tag, 'base64');
            tag[0] ^= 1;
            envelope.tag = tag.toString('base64');
            status = 'stored-authentication-tag-corrupted';
          }
        } else {
          const record = records.get(op.id),
            permitted =
              canDecrypt(op.actor) &&
              (op.kind !== 'rewrap' || (op.actor === 'app' && p.appCanEncrypt)),
            enabled =
              record !== undefined &&
              keys.get(record.version)?.enabled === true;
          yield frame(
            scene,
            'Check data-use authorization and needed key availability before an authenticated unwrap attempt.',
            c,
            3,
            {
              actor: op.actor,
              record: op.id,
              keyVersion: record?.version ?? null,
              enabled,
            },
            [],
            {
              prompt: 'Can the model attempt this authorized unwrap?',
              choices: [
                'Attempt authenticated unwrap',
                'Reject before cryptography',
              ],
              answer:
                permitted && enabled
                  ? 'Attempt authenticated unwrap'
                  : 'Reject before cryptography',
              hint: 'A surviving ciphertext is not enough: the actor needs data-use permission and the wrapping key must remain enabled. A corrupted tag will still fail authentication during the attempt.',
            },
          );
          if (!permitted) status = 'data-use-permission-denied';
          else if (!record) status = 'record-not-found';
          else if (!enabled) status = 'wrapping-KEK-disabled';
          else {
            version = record.version;
            const dek = decrypt(
              keys.get(record.version)!.key,
              record.wrappedKey,
              `dek:${op.id}:${record.version}`,
            );
            if (op.kind === 'read') {
              plaintext = decrypt(
                dek,
                record.data,
                `payload:${op.id}`,
              ).toString('utf8');
              c.authorizedReads++;
              status = 'authenticated-plaintext-read';
            } else if (!keys.get(active)!.enabled)
              status = 'active-KEK-disabled';
            else {
              record.wrappedKey = encrypt(
                keys.get(active)!.key,
                dek,
                `dek:${op.id}:${active}`,
              );
              record.version = active;
              version = active;
              c.rewraps++;
              status = 'DEK-rewrapped-payload-unchanged';
            }
          }
        }
      } catch {
        status = 'authenticated-decryption-failed';
        plaintext = null;
      }
      history.push({
        operation: i,
        kind: op.kind,
        actor: 'actor' in op ? op.actor : null,
        status,
        plaintext,
        version,
      });
      yield frame(
        scene,
        'Keep access-denial, disabled-key availability and ciphertext authentication outcomes distinct.',
        c,
        5,
        { operation: i, status, activeKEK: active },
        [
          {
            id:
              status.includes('denied') ||
              status.includes('failed') ||
              status.includes('disabled')
                ? 'kms'
                : 'wrapped',
            kind:
              status.includes('denied') ||
              status.includes('failed') ||
              status.includes('disabled')
                ? 'error'
                : 'visited',
          },
        ],
      );
    }
    yield frame(
      {
        ...scene,
        result: {
          records: Object.fromEntries(records),
          activeVersion: active,
          keyVersions: [...keys].map(([version, key]) => ({
            version,
            enabled: key.enabled,
          })),
          history,
          cryptoAttempts: c.cryptoAttempts,
          authorizedReads: c.authorizedReads,
          rewraps: c.rewraps,
          fixtureWarning:
            'All keys and deterministic nonces are public teaching fixtures. No cloud KMS call, HSM custody or production confidentiality guarantee.',
        },
      },
      'Retain needed decryption capability while rotating wrappers, separate administration from data use, and authenticate ciphertext/context before accepting plaintext.',
      c,
      6,
    );
  },
};
