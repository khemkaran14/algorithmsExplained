import 'server-only';
import { z } from 'zod';
import { frame, counters } from '@/engine/helpers';
import type { Visualizer, VisualState } from '@/engine/types';
const schema = z
  .object({
    attributes: z
      .array(z.string().regex(/^[A-Z]$/))
      .min(1)
      .max(8),
    dependencies: z
      .array(
        z.object({
          left: z.array(z.string()).min(1).max(8),
          right: z.array(z.string()).min(1).max(8),
        }),
      )
      .max(16),
    atomicCells: z.boolean().default(true),
  })
  .strict()
  .superRefine((p, ctx) => {
    const a = new Set(p.attributes);
    if (a.size !== p.attributes.length)
      ctx.addIssue({ code: 'custom', message: 'Attributes must be distinct.' });
    for (const fd of p.dependencies)
      if (
        [...fd.left, ...fd.right].some((x) => !a.has(x)) ||
        new Set(fd.left).size !== fd.left.length ||
        new Set(fd.right).size !== fd.right.length
      )
        ctx.addIssue({
          code: 'custom',
          message: 'Dependencies use distinct attributes from the relation.',
        });
  });
export const normalization: Visualizer<z.infer<typeof schema>> = {
  id: 'normalization-1nf-to-bcnf',
  maxSize: 8,
  measureSize: (p) => p.attributes.length,
  inputHint:
    'Uppercase attribute symbols and asserted functional dependencies. The model computes closures, every minimal candidate key, prime attributes and normal-form violations. Dependencies are domain rules, not inferred from a tiny sample. atomicCells controls the explicit 1NF assumption. It demonstrates one lossless BCNF split, not a complete automatic schema designer.',
  controls: [
    {
      key: 'atomicCells',
      label: 'All cells satisfy the chosen atomic domains (1NF)',
      type: 'boolean',
    },
  ],
  presets: {
    best: schema.parse({
      attributes: ['A', 'B', 'C'],
      dependencies: [{ left: ['A'], right: ['B', 'C'] }],
    }),
    average: schema.parse({
      attributes: ['A', 'B', 'C'],
      dependencies: [
        { left: ['A'], right: ['B'] },
        { left: ['B'], right: ['C'] },
      ],
    }),
    worst: schema.parse({
      attributes: ['A', 'B', 'C', 'D'],
      dependencies: [
        { left: ['A', 'B'], right: ['C', 'D'] },
        { left: ['A'], right: ['C'] },
        { left: ['C'], right: ['D'] },
      ],
    }),
    random: (n) => {
      const count = Math.min(8, Math.max(1, n));
      return schema.parse({
        attributes: Array.from({ length: count }, (_, i) =>
          String.fromCharCode(65 + i),
        ),
        dependencies: Array.from({ length: count - 1 }, (_, i) => ({
          left: [String.fromCharCode(65 + i)],
          right: [String.fromCharCode(66 + i)],
        })),
      });
    },
  },
  validateInput: (raw) => schema.parse(raw),
  complexity: {
    best: 'Closure reaches a fixed point in one pass',
    average: 'Enumerates up to 2^A subsets to identify all candidate keys',
    worst: 'O(2^A × A × F × A) with simple set-based closure checks',
    space: 'O(2^A × A) reported closures/keys in the bounded teaching model',
    why: 'A ≤ 8 attributes, F ≤ 16 asserted functional dependencies. Candidate-key enumeration is exponential; this is not a large-schema optimizer.',
    metric: {
      label: 'Dependency applicability checks',
      keys: ['dependencyChecks'],
    },
  },
  *generate(p) {
    const c = counters();
    c.dependencyChecks = 0;
    const all = new Set(p.attributes);
    const subset = (a: Iterable<string>, b: Set<string>) =>
      [...a].every((x) => b.has(x));
    function closure(seed: Iterable<string>) {
      const out = new Set(seed);
      let changed = true;
      while (changed) {
        changed = false;
        for (const fd of p.dependencies) {
          c.dependencyChecks++;
          if (subset(fd.left, out))
            for (const attr of fd.right)
              if (!out.has(attr)) {
                out.add(attr);
                changed = true;
              }
        }
      }
      return out;
    }
    const scene: VisualState = {
      kind: 'architecture',
      values: [],
      nodes: p.attributes.map((a, i) => ({
        id: a,
        label: `Attribute ${a}`,
        x: (i % 4) * 180,
        y: Math.floor(i / 4) * 130,
      })),
      edges: p.dependencies.flatMap((fd) =>
        fd.left.flatMap((from) =>
          fd.right
            .filter((to) => to !== from)
            .map((to) => ({ from, to, label: 'FD' })),
        ),
      ),
    };
    yield frame(
      scene,
      'Functional dependencies are asserted domain invariants. Repeated sample values alone do not prove them.',
      c,
      1,
    );
    const keys: string[][] = [],
      closures: {
        attributes: string[];
        closure: string[];
        superkey: boolean;
      }[] = [];
    for (let mask = 0; mask < 2 ** p.attributes.length; mask++) {
      const attrs = p.attributes.filter((_, i) => mask & (1 << i)),
        closed = closure(attrs),
        superkey = subset(all, closed);
      closures.push({
        attributes: attrs,
        closure: [...closed].sort(),
        superkey,
      });
      if (superkey && !keys.some((key) => subset(key, new Set(attrs))))
        keys.push(attrs);
    }
    // Numeric mask order visits every proper subset before its superset, so minimality is valid.
    const prime = new Set(keys.flat()),
      second: string[] = [],
      third: string[] = [],
      bcnf: string[] = [];
    for (const key of keys)
      for (const row of closures)
        if (
          row.attributes.length < key.length &&
          subset(row.attributes, new Set(key))
        )
          for (const attr of row.closure)
            if (!prime.has(attr))
              second.push(
                `${row.attributes.join('') || '∅'} → ${attr} partially depends on key ${key.join('')}`,
              );
    for (const fd of p.dependencies) {
      const closed = closure(fd.left),
        superkey = subset(all, closed),
        nontrivial = fd.right.filter((a) => !fd.left.includes(a));
      yield frame(
        scene,
        'BCNF requires every nontrivial determinant to be a superkey. 3NF also permits prime right-side attributes.',
        c,
        3,
        {
          left: fd.left.join(''),
          closure: [...closed].sort().join(''),
          superkey,
        },
        fd.left.map((id) => ({ id, kind: 'comparing' as const })),
        {
          prompt: 'Does this dependency violate BCNF?',
          choices: ['Violates BCNF', 'Satisfies BCNF'],
          answer:
            nontrivial.length && !superkey ? 'Violates BCNF' : 'Satisfies BCNF',
          hint: 'Trivial dependencies are allowed; otherwise compute whether the determinant closure covers the entire relation.',
        },
      );
      if (nontrivial.length && !superkey)
        bcnf.push(`${fd.left.join('')} → ${nontrivial.join('')}`);
      for (const attr of nontrivial)
        if (!superkey && !prime.has(attr))
          third.push(`${fd.left.join('')} → ${attr}`);
    }
    let split: {
      left: string[];
      right: string[];
      intersection: string[];
      lossless: boolean;
      reason: string;
    } | null = null;
    const bad = p.dependencies.find(
      (fd) =>
        fd.right.some((a) => !fd.left.includes(a)) &&
        !subset(all, closure(fd.left)),
    );
    if (bad) {
      const left = new Set([...bad.left, ...bad.right]),
        right = new Set(
          p.attributes.filter(
            (a) => !bad.right.includes(a) || bad.left.includes(a),
          ),
        ),
        intersection = new Set([...left].filter((a) => right.has(a))),
        closed = closure(intersection);
      split = {
        left: [...left].sort(),
        right: [...right].sort(),
        intersection: [...intersection].sort(),
        lossless: subset(left, closed) || subset(right, closed),
        reason:
          'The shared determinant functionally determines the first projection. Further normalization and dependency preservation still require analysis.',
      };
    }
    yield frame(
      {
        ...scene,
        result: {
          candidateKeys: keys,
          primeAttributes: [...prime].sort(),
          closures,
          normalForms: {
            first: p.atomicCells,
            second: p.atomicCells && second.length === 0,
            third: p.atomicCells && second.length === 0 && third.length === 0,
            bcnf: p.atomicCells && bcnf.length === 0,
          },
          partialDependencies: [...new Set(second)],
          thirdViolations: third,
          bcnfViolations: bcnf,
          firstLosslessSplit: split,
        },
      },
      'Check dependency preservation separately: a lossless BCNF decomposition need not preserve every dependency locally.',
      c,
      6,
      { candidateKeys: keys.map((k) => k.join('')).join(',') },
    );
  },
};
