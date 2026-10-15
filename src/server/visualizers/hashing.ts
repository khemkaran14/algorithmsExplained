import 'server-only';
import { z } from 'zod';
import type { Visualizer, Frame } from '@/engine/types';
import {
  counters,
  frame,
  validateNumbers,
  randomNumbers,
} from '@/engine/helpers';
const mod = (key: number, size: number) => ((key % size) + size) % size;
function mix32(value: number) {
  let x = value >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x85ebca6b);
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35);
  return (x ^ (x >>> 16)) >>> 0;
}
function textHash(text: string, seed = 42) {
  let h = (2166136261 ^ seed) >>> 0;
  for (const char of text) {
    h ^= char.charCodeAt(0);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return mix32(h);
}
const hashSchema = z.object({
  text: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[\x20-\x7e]+$/),
  modulus: z.number().int().min(2).max(997),
});
export const hashFunction: Visualizer<z.infer<typeof hashSchema>> = {
  id: 'hash-functions',
  maxSize: 64,
  inputHint:
    'Enter {"text":"hello","modulus":7}. This polynomial ASCII hash is not cryptographic.',
  complexity: {
    best: 'O(L) string hashing',
    average: 'O(L)',
    worst: 'O(L)',
    space: 'O(1)',
    why: 'Every character contributes once to a bounded rolling accumulator. Bucket reduction creates collisions and does not provide security.',
  },
  presets: {
    best: { text: 'A', modulus: 7 },
    average: { text: 'hello', modulus: 7 },
    worst: { text: 'collisions are normal', modulus: 2 },
    random: (n, s) => ({
      text: randomNumbers(n, s)
        .map((v) => String.fromCharCode(65 + (v % 26)))
        .join(''),
      modulus: 7,
    }),
  },
  validateInput(raw) {
    const p = hashSchema.safeParse(raw);
    if (!p.success)
      throw new Error(
        'Use 1–64 printable ASCII characters and a modulus from 2 to 997.',
      );
    return p.data;
  },
  *generate({ text, modulus }) {
    const c = counters();
    let hash = 0;
    yield frame(
      {
        kind: 'string',
        values: Array.from(text).map((ch) => ch.charCodeAt(0)),
        labels: Array.from(text),
      },
      'A hash compresses a key into a bounded bucket index.',
      c,
      1,
      { modulus, hash },
    );
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i),
        next = (hash * 31 + code) % modulus;
      yield frame(
        {
          kind: 'string',
          values: Array.from(text).map((ch) => ch.charCodeAt(0)),
          labels: Array.from(text),
        },
        'Mix the next character into the rolling accumulator.',
        c,
        3,
        { i, hash, code, modulus },
        [{ id: String(i), kind: 'comparing' }],
        {
          prompt: 'Which value becomes the next accumulator?',
          choices: [String(next), String((next + 1) % modulus)],
          answer: String(next),
          hint: 'Compute (31×previous + ASCII code) mod modulus.',
        },
      );
      hash = next;
      c.reads++;
      c.writes++;
      yield frame(
        { kind: 'boxes', values: [hash] },
        'Reduce the accumulator modulo the bucket count.',
        c,
        5,
        { hash, modulus },
      );
    }
    yield frame(
      { kind: 'boxes', values: [hash], result: hash },
      'Different keys can share this bucket; equality must still be checked.',
      c,
      6,
      { hash, modulus },
    );
  },
};
export function chainingVisualizer(rehash = false): Visualizer {
  return {
    id: rehash ? 'load-factor-rehashing' : 'hash-table-with-chaining',
    inputHint: rehash
      ? 'Enter an integer array. Capacity starts at three and grows before load exceeds 0.75.'
      : 'Enter an integer array. Keys use floor-modulo five; the final demo removes the first matching middle input key.',
    presets: {
      best: [0, 1, 2, 3, 4],
      average: [4, 1, 6, 2, 5, 3],
      worst: [5, 10, 15, 20, 25, 30],
      random: randomNumbers,
    },
    validateInput: validateNumbers,
    complexity: {
      metric: {
        label: 'Key comparisons and transfers',
        keys: ['comparisons', 'transfers'],
      },
      best: 'O(1) expected key operation',
      average: 'O(1+α) lookup; amortized O(1) growth',
      worst: 'O(n) collision chain or rehash',
      space: 'O(n+m) keys and buckets',
      why: rehash
        ? 'Geometric resizing keeps load factor α bounded. One rehash is linear, but transfers across many inserts form a geometric series.'
        : 'Bucket collisions form chains. Equality checks scan only the selected chain; worst-case collisions can still put every key together.',
    },
    *generate(input) {
      const c = counters();
      c.transfers = 0;
      c.rehashes = 0;
      let capacity = rehash ? 3 : 5,
        size = 0,
        buckets = Array.from({ length: capacity }, () => [] as number[]);
      const emit = (
        text: string,
        line: number,
        vars: Frame['variables'] = {},
        marks: Frame['highlights'] = [],
        action?: Frame['action'],
      ) =>
        frame(
          { kind: 'hash-table', values: [], rows: buckets.map((b) => [...b]) },
          text,
          c,
          line,
          { capacity, size, load: size / capacity, ...vars },
          marks,
          action,
        );
      yield emit('Each bucket stores keys that share a hash index.', 1);
      for (const key of input) {
        let bucket = mod(key, capacity),
          exists = false;
        for (const existing of buckets[bucket]) {
          c.reads++;
          c.comparisons++;
          yield emit(
            'Check key equality inside the selected chain.',
            3,
            { key, existing, bucket },
            [{ id: String(bucket), kind: 'comparing' }],
            {
              prompt: 'Does this existing key match?',
              choices: ['Same key', 'Continue chain'],
              answer: existing === key ? 'Same key' : 'Continue chain',
              hint: 'A hash collision is not the same thing as key equality.',
            },
          );
          if (existing === key) {
            exists = true;
            break;
          }
        }
        if (exists) continue;
        if (rehash && (size + 1) / capacity > 0.75) {
          const old = buckets;
          capacity = capacity * 2 + 1;
          buckets = Array.from({ length: capacity }, () => [] as number[]);
          c.rehashes++;
          yield emit(
            'Allocate a larger bucket array before crossing the load threshold.',
            2,
          );
          for (const chain of old)
            for (const existing of chain) {
              const destination = mod(existing, capacity);
              buckets[destination].push(existing);
              c.transfers++;
              c.reads++;
              c.writes++;
              yield emit(
                'Recompute an old key’s bucket using the new capacity.',
                4,
                { key: existing, bucket: destination },
                [{ id: String(destination), kind: 'moving' }],
              );
            }
          bucket = mod(key, capacity);
        }
        yield emit(
          'Select the bucket before storing this distinct key.',
          3,
          { key },
          [],
          {
            prompt: 'Which bucket receives this key?',
            choices: [String(bucket), String((bucket + 1) % capacity)],
            answer: String(bucket),
            hint: 'Normalize key mod capacity into a nonnegative index.',
          },
        );
        buckets[bucket].push(key);
        size++;
        c.writes++;
        yield emit(
          'Append the distinct key to its collision chain.',
          5,
          { key, bucket },
          [{ id: String(bucket), kind: 'done' }],
        );
      }
      if (!rehash) {
        const target = input[Math.floor(input.length / 2)],
          bucket = mod(target, capacity);
        for (let i = 0; i < buckets[bucket].length; i++) {
          c.reads++;
          c.comparisons++;
          if (buckets[bucket][i] === target) {
            buckets[bucket].splice(i, 1);
            size--;
            c.writes++;
            yield emit(
              'Remove only the matching key from its chain.',
              5,
              { target, bucket },
              [{ id: String(bucket), kind: 'moving' }],
            );
            break;
          }
        }
      }
      const f = emit(
        rehash
          ? 'All keys were reinserted under the current capacity.'
          : 'The remaining chains still preserve all other keys.',
        6,
      );
      f.state.result = {
        keys: buckets.flat().sort((a, b) => a - b),
        capacity,
        size,
        rehashes: c.rehashes,
      };
      yield f;
    },
  };
}
const addressSchema = z.object({
  keys: z.array(z.number().int().min(-999).max(999)).min(1).max(64),
  capacity: z
    .enum(['5', '7', '11', '13', '17', '19', '23', '29', '31'])
    .transform(Number),
  method: z.enum(['linear', 'quadratic', 'double']).default('linear'),
});
type AddressInput = {
  keys: number[];
  capacity: number;
  method: 'linear' | 'quadratic' | 'double';
};
export const openAddressing: Visualizer<AddressInput> = {
  id: 'open-addressing',
  inputHint:
    'Enter {"keys":[1,8,15,2],"capacity":7,"method":"linear"}. Methods: linear, quadratic, double. Capacity must be one of the supported primes.',
  complexity: {
    metric: { label: 'Table probes', keys: ['probes'] },
    best: 'O(1)',
    average: 'O(1) at suitable load',
    worst: 'O(m) probes',
    space: 'O(m)',
    why: 'A collision follows a deterministic probe sequence. Double hashing uses a nonzero step coprime to the prime capacity; quadratic probing needs a conservative load bound for a free-slot guarantee.',
  },
  presets: {
    best: { keys: [0, 1, 2], capacity: 7, method: 'linear' },
    average: { keys: [1, 8, 15, 2], capacity: 7, method: 'linear' },
    worst: { keys: [1, 6, 11, 16, 21, 26], capacity: 5, method: 'quadratic' },
    random: (n, s) => ({
      keys: randomNumbers(n, s),
      capacity: Math.min(n, 8) <= 4 ? 11 : 23,
      method: 'double',
    }),
  },
  validateInput(raw) {
    if (!raw || typeof raw !== 'object')
      throw new Error(
        'Enter keys, a supported prime capacity and a probing method.',
      );
    const record = raw as Record<string, unknown>,
      p = addressSchema.safeParse({
        ...record,
        capacity: String(record.capacity),
      });
    if (!p.success)
      throw new Error(
        'Use up to 64 integers, a supported prime capacity and linear/quadratic/double probing.',
      );
    return p.data;
  },
  *generate({ keys, capacity, method }) {
    const table: (number | null)[] = Array(capacity).fill(null) as (
        number | null
      )[],
      c = counters(),
      failed: number[] = [];
    c.probes = 0;
    const emit = (
      text: string,
      line: number,
      vars: Frame['variables'] = {},
      active = -1,
      action?: Frame['action'],
    ) =>
      frame(
        {
          kind: 'boxes',
          values: table.map((v) => v ?? 0),
          labels: table.map((v) => (v === null ? '∅' : String(v))),
        },
        text,
        c,
        line,
        { capacity, method, ...vars },
        active >= 0 ? [{ id: String(active), kind: 'comparing' }] : [],
        action,
      );
    yield emit('Open addressing stores keys directly in the bucket array.', 1);
    for (const key of keys) {
      const first = mod(key, capacity),
        step = 1 + mod(key, capacity - 1);
      let stored = false;
      for (let probe = 0; probe < capacity; probe++) {
        const index = mod(
          first +
            (method === 'linear'
              ? probe
              : method === 'quadratic'
                ? probe * probe
                : probe * step),
          capacity,
        );
        c.probes++;
        c.reads++;
        yield emit(
          'Follow this method’s next probe location.',
          3,
          { key, probe, step },
          index,
          {
            prompt: 'Can this probe finish the insertion?',
            choices: ['Use this slot', 'Keep probing'],
            answer:
              table[index] === null || table[index] === key
                ? 'Use this slot'
                : 'Keep probing',
            hint: 'An empty slot or the same key finishes the search; another key is a collision.',
          },
        );
        if (table[index] === null || table[index] === key) {
          if (table[index] === null) {
            table[index] = key;
            c.writes++;
          }
          stored = true;
          yield emit(
            'The key has a reachable slot in this probe sequence.',
            5,
            { key, index },
            index,
          );
          break;
        }
      }
      if (!stored) {
        failed.push(key);
        yield emit('No reachable free slot was found; never loop forever.', 5, {
          key,
          failed: true,
        });
      }
    }
    const f = emit(
      'Load factor and probe policy control collision behavior.',
      6,
      { load: table.filter((v) => v !== null).length / capacity },
    );
    f.state.result = { table, failed };
    yield f;
  },
};
const bloomSchema = z.object({
  insert: z.array(z.number().int().min(-1000000).max(1000000)).max(64),
  query: z.array(z.number().int().min(-1000000).max(1000000)).min(1).max(64),
  bits: z.union([
    z.literal(8),
    z.literal(16),
    z.literal(32),
    z.literal(64),
    z.literal(128),
  ]),
  hashes: z.number().int().min(1).max(4),
  seed: z.number().int().min(0).max(4294967295).default(42),
});
export const bloom: Visualizer<z.infer<typeof bloomSchema>> = {
  id: 'bloom-filter',
  maxSize: 64,
  inputHint:
    'Enter {"insert":[1,2,3],"query":[2,4],"bits":16,"hashes":3,"seed":42}. Positive results are only possible membership.',
  complexity: {
    metric: { label: 'Bit probes', keys: ['probes'] },
    best: 'O(1) early negative query',
    average: 'O(k) hash probes',
    worst: 'O(k)',
    space: 'O(m) filter bits',
    why: 'Every insertion sets k bit positions. A zero query bit proves absence; all-one query bits allow false positives but no false negatives unless bits are incorrectly cleared.',
  },
  presets: {
    best: { insert: [1], query: [2], bits: 128, hashes: 3, seed: 42 },
    average: {
      insert: [1, 2, 3],
      query: [2, 4, 9],
      bits: 16,
      hashes: 3,
      seed: 42,
    },
    worst: {
      insert: Array.from({ length: 20 }, (_, i) => i),
      query: [1000, 1001],
      bits: 8,
      hashes: 4,
      seed: 42,
    },
    random: (n, s = 42) => ({
      insert: randomNumbers(n, s),
      query: [1, 999],
      bits: 32,
      hashes: 3,
      seed: s >>> 0,
    }),
  },
  validateInput(raw) {
    const p = bloomSchema.safeParse(raw);
    if (!p.success)
      throw new Error(
        'Use the documented bounded key arrays, power-of-two bit capacity and 1–4 hashes.',
      );
    return p.data;
  },
  *generate(input) {
    const bits = Array(input.bits).fill(0) as number[],
      c = counters(),
      truth = new Set(input.insert),
      results: { key: number; maybePresent: boolean; actualMember: boolean }[] =
        [];
    c.probes = 0;
    function positions(key: number) {
      const first = mix32(key ^ input.seed),
        step = (mix32((key >>> 0) + 0x9e3779b9) | 1) >>> 0;
      return Array.from(
        { length: input.hashes },
        (_, i) => (first + i * step) % input.bits,
      );
    }
    function emit(
      text: string,
      line: number,
      vars: Frame['variables'] = {},
      active = -1,
      action?: Frame['action'],
    ) {
      const rows = Array.from({ length: Math.ceil(bits.length / 16) }, (_, r) =>
        bits.slice(r * 16, r * 16 + 16),
      );
      return frame(
        { kind: 'grid', values: bits, rows },
        text,
        c,
        line,
        { bits: input.bits, hashes: input.hashes, ...vars },
        active >= 0
          ? [
              {
                id: `${Math.floor(active / 16)},${active % 16}`,
                kind: 'comparing',
              },
            ]
          : [],
        action,
      );
    }
    yield emit('Start with every membership bit clear.', 1);
    for (const key of input.insert)
      for (const position of positions(key)) {
        bits[position] = 1;
        c.writes++;
        c.probes++;
        yield emit(
          'Insertion sets a bit without clearing any other key’s evidence.',
          3,
          { key, position },
          position,
        );
      }
    for (const key of input.query) {
      let maybePresent = true;
      for (const position of positions(key)) {
        c.probes++;
        c.reads++;
        yield emit(
          'Inspect one query bit before deciding membership.',
          4,
          { key, position },
          position,
          {
            prompt: 'What does this bit allow us to conclude?',
            choices: ['Definitely absent', 'Keep checking'],
            answer: bits[position] ? 'Keep checking' : 'Definitely absent',
            hint: 'A zero bit proves absence. A one bit may belong to another key.',
          },
        );
        if (!bits[position]) {
          maybePresent = false;
          break;
        }
      }
      results.push({ key, maybePresent, actualMember: truth.has(key) });
      yield emit(
        maybePresent
          ? 'All query bits are set: the key may be present.'
          : 'A zero bit proved this key absent.',
        5,
        { key, maybePresent, teachingOracle: truth.has(key) },
      );
    }
    const f = emit(
      'The exact-membership oracle is for teaching; the filter itself stores only bits.',
      6,
      { bitsSet: bits.reduce((a, b) => a + b, 0) },
    );
    f.state.result = {
      queries: results,
      bitsSet: bits.reduce((a, b) => a + b, 0),
    };
    yield f;
  },
};
const ringSchema = z.object({
  nodes: z.array(z.number().int().min(0).max(999)).min(1).max(8),
  keys: z.array(z.number().int().min(-999).max(999)).min(1).max(64),
  replicas: z.number().int().min(1).max(8).default(3),
  seed: z.number().int().min(0).max(4294967295).default(42),
  change: z.object({
    type: z.enum(['add', 'remove']),
    node: z.number().int().min(0).max(999),
  }),
});
export const consistentHashing: Visualizer<z.infer<typeof ringSchema>> = {
  id: 'consistent-hashing',
  maxSize: 32,
  inputHint:
    'Enter nodes, keys, replica count and a change: {"nodes":[1,2,3],"keys":[1,2,3,4,5,6],"replicas":3,"seed":42,"change":{"type":"remove","node":2}}.',
  complexity: {
    metric: { label: 'Ring lookup comparisons', keys: ['comparisons'] },
    best: 'O(log R) key lookup',
    average: 'O(log R) lookup; O(R log R) ring build',
    worst: 'O(log R) lookup; distribution-dependent load',
    space: 'O(R+K) ring and teaching assignments',
    why: 'A key belongs to its clockwise successor virtual node. Adding or removing tokens changes only the affected successor ranges; replicas spread ownership more evenly, not perfectly.',
  },
  presets: {
    best: {
      nodes: [1, 2],
      keys: [1, 2],
      replicas: 3,
      seed: 42,
      change: { type: 'add', node: 3 },
    },
    average: {
      nodes: [1, 2, 3],
      keys: [1, 2, 3, 4, 5, 6, 7, 8],
      replicas: 3,
      seed: 42,
      change: { type: 'remove', node: 2 },
    },
    worst: {
      nodes: [1, 2],
      keys: Array.from({ length: 16 }, (_, i) => i),
      replicas: 1,
      seed: 17,
      change: { type: 'remove', node: 1 },
    },
    random: (n, s = 42) => ({
      nodes: [1, 2, 3],
      keys: randomNumbers(n, s),
      replicas: 3,
      seed: s >>> 0,
      change: { type: 'add', node: 4 },
    }),
  },
  validateInput(raw) {
    const p = ringSchema.safeParse(raw);
    if (!p.success || new Set(p.data.nodes).size !== p.data.nodes.length)
      throw new Error(
        'Use distinct bounded node IDs, up to 64 keys, and 1–8 replicas.',
      );
    if (
      p.data.change.type === 'remove' &&
      (!p.data.nodes.includes(p.data.change.node) || p.data.nodes.length === 1)
    )
      throw new Error(
        'Remove an existing node while leaving at least one node.',
      );
    if (
      p.data.change.type === 'add' &&
      (p.data.nodes.includes(p.data.change.node) || p.data.nodes.length === 8)
    )
      throw new Error('Add a new node without exceeding eight total nodes.');
    return p.data;
  },
  *generate(input) {
    type Token = { owner: number; replica: number; hash: number; id: string };
    const c = counters();
    c.migrations = 0;
    const assignments = new Map<number, number>();
    let ring: Token[] = [];
    function make(nodes: number[]) {
      return nodes
        .flatMap((owner) =>
          Array.from({ length: input.replicas }, (_, replica) => ({
            owner,
            replica,
            hash: textHash(`node:${owner}:replica:${replica}`, input.seed),
            id: `v${owner}-${replica}`,
          })),
        )
        .sort(
          (a, b) =>
            a.hash - b.hash || a.owner - b.owner || a.replica - b.replica,
        );
    }
    ring = make(input.nodes);
    function owner(key: number) {
      const hash = textHash(`key:${key}`, input.seed);
      let low = 0,
        high = ring.length;
      while (low < high) {
        const mid = low + Math.floor((high - low) / 2);
        c.comparisons++;
        c.reads++;
        if (ring[mid].hash >= hash) high = mid;
        else low = mid + 1;
      }
      return ring[low % ring.length];
    }
    function emit(
      text: string,
      line: number,
      vars: Frame['variables'] = {},
      active?: number,
      action?: Frame['action'],
    ) {
      const point = (hash: number, r: number) => ({
        x: 180 + r * Math.cos((hash / 4294967296) * 2 * Math.PI),
        y: 180 + r * Math.sin((hash / 4294967296) * 2 * Math.PI),
      });
      const nodes = [
        ...ring.map((t) => ({
          id: t.id,
          label: `N${t.owner}`,
          ...point(t.hash, 140),
        })),
        ...input.keys.map((key, i) => ({
          id: `k${i}`,
          label: String(key),
          ...point(textHash(`key:${key}`, input.seed), 95),
        })),
      ];
      const edges = input.keys.flatMap((key, i) => {
        const target = assignments.get(key);
        if (target === undefined) return [];
        const token = ring.filter((t) => t.owner === target)[0];
        return token ? [{ from: `k${i}`, to: token.id }] : [];
      });
      return frame(
        { kind: 'ring', values: input.keys, nodes, edges },
        text,
        c,
        line,
        {
          replicas: input.replicas,
          owners: JSON.stringify(Object.fromEntries(assignments)),
          ...vars,
        },
        active === undefined
          ? []
          : [{ id: `k${input.keys.indexOf(active)}`, kind: 'moving' }],
        action,
      );
    }
    yield emit('Virtual-node tokens define clockwise ownership ranges.', 1);
    for (const key of input.keys) {
      const token = owner(key);
      yield emit(
        'Find the key’s clockwise successor token.',
        3,
        { key },
        undefined,
        {
          prompt: 'Which physical node owns this successor range?',
          choices: input.nodes.map((n) => `N${n}`),
          answer: `N${token.owner}`,
          hint: 'Walk clockwise from the key hash, wrapping around the ring if needed.',
        },
      );
      assignments.set(key, token.owner);
      c.writes++;
      yield emit(
        'Record the current owner without using modulo node count.',
        5,
        { key, owner: token.owner },
      );
    }
    const old = new Map(assignments),
      nodes =
        input.change.type === 'add'
          ? [...input.nodes, input.change.node]
          : input.nodes.filter((n) => n !== input.change.node);
    ring = make(nodes);
    yield emit(
      input.change.type === 'add'
        ? 'Add the new node’s virtual tokens.'
        : 'Remove every token belonging to the departing node.',
      2,
      { changedNode: input.change.node },
    );
    const migrated: { key: number; from: number; to: number }[] = [];
    for (const key of [...new Set(input.keys)]) {
      const next = owner(key).owner,
        previous = old.get(key)!;
      assignments.set(key, next);
      if (next !== previous) {
        migrated.push({ key, from: previous, to: next });
        c.migrations++;
        yield emit(
          'Only a key inside a changed successor range migrates.',
          4,
          { key, from: previous, to: next },
          key,
        );
      }
    }
    const f = emit('Unchanged successor ranges keep their owners.', 6, {
      migrations: c.migrations,
    });
    f.state.result = {
      before: Object.fromEntries(old),
      after: Object.fromEntries(assignments),
      migrated,
    };
    yield f;
  },
};
