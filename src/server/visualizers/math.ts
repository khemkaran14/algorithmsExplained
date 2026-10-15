import 'server-only';
import { z } from 'zod';
import type { Visualizer, Frame } from '@/engine/types';
import { counters, frame, randomNumbers } from '@/engine/helpers';
import {
  graphSchema,
  parseGraph,
  adjacency,
  graphState,
  graphPresets,
} from './graph-input';
const gcdSchema = z.object({
  a: z.number().int().min(0).max(1000000),
  b: z.number().int().min(0).max(1000000),
});
export const gcd: Visualizer<z.infer<typeof gcdSchema>> = {
  id: 'euclidean-gcd',
  inputHint: 'Enter {"a":48,"b":18}. Inputs are nonnegative integers.',
  complexity: {
    metric: { label: 'Remainder operations', keys: ['remainders'] },
    best: 'O(1)',
    average: 'O(log min(a,b))',
    worst: 'O(log min(a,b))',
    space: 'O(1)',
    why: 'Replacing (a,b) by (b,a mod b) keeps the common divisors and decreases the smaller positive operand.',
  },
  presets: {
    best: { a: 42, b: 0 },
    average: { a: 48, b: 18 },
    worst: { a: 987, b: 610 },
    random: (n, s) => {
      const a = randomNumbers(2, s);
      return { a: a[0] * n, b: a[1] * Math.max(1, n - 1) };
    },
  },
  validateInput(raw) {
    const p = gcdSchema.safeParse(raw);
    if (!p.success)
      throw new Error(
        'Use two nonnegative integers no larger than one million.',
      );
    return p.data;
  },
  *generate({ a, b }) {
    const c = counters();
    c.remainders = 0;
    yield frame(
      { kind: 'boxes', values: [a, b] },
      'Common divisors survive a Euclidean remainder step.',
      c,
      1,
      { a, b },
    );
    while (b !== 0) {
      const remainder = a % b;
      yield frame(
        { kind: 'boxes', values: [a, b] },
        'Predict the remainder before replacing the operands.',
        c,
        3,
        { a, b },
        [],
        {
          prompt: 'What is a mod b?',
          choices: [String(remainder), String(remainder + 1)],
          answer: String(remainder),
          hint: 'Subtract whole multiples of b from a.',
        },
      );
      c.remainders++;
      c.reads += 2;
      [a, b] = [b, remainder];
      c.writes += 2;
      yield frame(
        { kind: 'boxes', values: [a, b] },
        'The smaller subproblem has the same greatest common divisor.',
        c,
        5,
        { a, b },
      );
    }
    yield frame(
      { kind: 'boxes', values: [a, b], result: a },
      'When the second operand reaches zero, the first is the GCD.',
      c,
      6,
      { gcd: a },
    );
  },
};
export const sieve: Visualizer<number> = {
  id: 'sieve-of-eratosthenes',
  maxSize: 128,
  inputHint: 'Enter an integer from 2 to 128.',
  complexity: {
    metric: { label: 'Composite marks', keys: ['marks'] },
    best: 'O(n log log n)',
    average: 'O(n log log n)',
    worst: 'O(n log log n)',
    space: 'O(n)',
    why: 'Each prime marks its multiples starting at its square; repeated composite marks sum to the prime harmonic series.',
  },
  presets: {
    best: 8,
    average: 30,
    worst: 128,
    random: (n) => Math.min(128, Math.max(2, n)),
  },
  validateInput(raw) {
    if (!Number.isInteger(raw) || Number(raw) < 2 || Number(raw) > 128)
      throw new Error('Use an integer from 2 to 128.');
    return Number(raw);
  },
  *generate(n) {
    const composite = Array(n + 1).fill(false) as boolean[],
      c = counters();
    composite[0] = composite[1] = true;
    c.marks = 0;
    function emit(
      text: string,
      line: number,
      vars: Frame['variables'] = {},
      active = -1,
      action?: Frame['action'],
    ) {
      const rows: number[][] = [],
        labels: string[][] = [];
      for (let start = 0; start <= n; start += 12) {
        rows.push(
          Array.from({ length: Math.min(12, n - start + 1) }, (_, j) =>
            composite[start + j] ? 0 : 1,
          ),
        );
        labels.push(
          Array.from(
            { length: Math.min(12, n - start + 1) },
            (_, j) => `${start + j}${composite[start + j] ? '×' : ''}`,
          ),
        );
      }
      return frame(
        { kind: 'grid', values: [], rows, cellLabels: labels },
        text,
        c,
        line,
        { n, ...vars },
        active >= 0
          ? [
              {
                id: `${Math.floor(active / 12)},${active % 12}`,
                kind: 'comparing',
              },
            ]
          : [],
        action,
      );
    }
    yield emit(
      'Zero and one are not prime; all larger keys are candidates.',
      1,
    );
    for (let p = 2; p * p <= n; p++) {
      c.reads++;
      c.comparisons++;
      if (composite[p]) continue;
      yield emit(
        'An unmarked candidate is the next sieving prime.',
        2,
        { p },
        p,
        {
          prompt: 'Where can this prime start marking new composites?',
          choices: [String(p * p), String(p)],
          answer: String(p * p),
          hint: 'Smaller multiples were already handled by smaller prime factors.',
        },
      );
      for (let multiple = p * p; multiple <= n; multiple += p) {
        composite[multiple] = true;
        c.marks++;
        c.writes++;
        yield emit(
          `Mark ${multiple} as a multiple of ${p}.`,
          4,
          { p, multiple },
          multiple,
        );
      }
    }
    const primes = Array.from({ length: n - 1 }, (_, i) => i + 2).filter(
      (i) => !composite[i],
    );
    const f = emit('Every remaining unmarked candidate is prime.', 6, {
      count: primes.length,
    });
    f.state.result = primes;
    yield f;
  },
};
export const primality: Visualizer<number> = {
  id: 'primality-test',
  inputHint: 'Enter a nonnegative integer no larger than one million.',
  complexity: {
    metric: { label: 'Trial divisions', keys: ['divisions'] },
    best: 'O(1)',
    average: 'O(√n) upper bound',
    worst: 'O(√n)',
    space: 'O(1)',
    why: 'A composite number has a factor at most its square root. After testing two, only odd trial factors are needed.',
  },
  presets: {
    best: 2,
    average: 91,
    worst: 999983,
    random: (n, s) => randomNumbers(1, s)[0] * n + 1,
  },
  validateInput(raw) {
    if (!Number.isInteger(raw) || Number(raw) < 0 || Number(raw) > 1000000)
      throw new Error('Use a nonnegative integer no larger than one million.');
    return Number(raw);
  },
  *generate(n) {
    const c = counters();
    c.divisions = 0;
    yield frame(
      { kind: 'boxes', values: [n] },
      'A prime must be greater than one.',
      c,
      1,
      { n },
      [],
      {
        prompt: 'Can a number below two be prime?',
        choices: ['No', 'Yes'],
        answer: 'No',
        hint: 'A prime has exactly two positive divisors.',
      },
    );
    let prime = n >= 2;
    if (prime) {
      for (
        let divisor = 2;
        divisor * divisor <= n;
        divisor = divisor === 2 ? 3 : divisor + 2
      ) {
        const remainder = n % divisor;
        c.divisions++;
        c.comparisons++;
        yield frame(
          { kind: 'boxes', values: [n, divisor, remainder] },
          'Test a candidate factor no greater than the square root.',
          c,
          3,
          { n, divisor, remainder },
          [],
          {
            prompt: 'Does this divisor prove compositeness?',
            choices: ['Composite', 'Continue'],
            answer: remainder === 0 ? 'Composite' : 'Continue',
            hint: 'A zero remainder means a nontrivial factor exists.',
          },
        );
        if (remainder === 0) {
          prime = false;
          break;
        }
      }
    }
    yield frame(
      { kind: 'boxes', values: [n], result: prime },
      prime
        ? 'No possible small factor divides this number.'
        : 'The number is not prime.',
      c,
      6,
      { prime },
    );
  },
};
const exponentSchema = z.object({
  base: z.number().int().min(-99).max(99),
  exponent: z.number().int().min(0).max(31),
});
export const fastExponentiation: Visualizer<z.infer<typeof exponentSchema>> = {
  id: 'fast-exponentiation',
  inputHint:
    'Enter {"base":2,"exponent":13}. Exact integers are returned as decimal strings.',
  complexity: {
    metric: { label: 'Big-integer multiplications', keys: ['multiplications'] },
    best: 'O(1) for exponent zero',
    average: 'O(log exponent) multiplications',
    worst: 'O(log exponent) multiplications',
    space: 'O(1) integer variables; output-sized bits',
    why: 'Consume one exponent bit per iteration, squaring the power and multiplying the accumulator only for set bits. Big-integer multiplication itself is not constant-time.',
  },
  presets: {
    best: { base: 2, exponent: 0 },
    average: { base: 2, exponent: 13 },
    worst: { base: 99, exponent: 31 },
    random: (n) => ({ base: 2, exponent: Math.min(31, n) }),
  },
  validateInput(raw) {
    const p = exponentSchema.safeParse(raw);
    if (!p.success)
      throw new Error(
        'Use a base between −99 and 99 and an exponent from zero to 31.',
      );
    return p.data;
  },
  *generate({ base, exponent }) {
    let power = BigInt(base),
      result = 1n,
      remaining = exponent;
    const c = counters();
    c.multiplications = 0;
    const emit = (text: string, line: number, action?: Frame['action']) =>
      frame(
        {
          kind: 'bits',
          values: Array.from(
            { length: 5 },
            (_, j) => (remaining >> (4 - j)) & 1,
          ),
        },
        text,
        c,
        line,
        {
          base,
          exponent,
          remaining,
          power: String(power),
          result: String(result),
        },
        [],
        action,
      );
    yield emit(
      'Start with the multiplicative identity and inspect exponent bits.',
      1,
    );
    while (remaining > 0) {
      yield emit(
        'The least significant bit decides whether to use this power.',
        3,
        {
          prompt: 'Should this power multiply the accumulator?',
          choices: ['Multiply', 'Skip'],
          answer: remaining % 2 ? 'Multiply' : 'Skip',
          hint: 'A set bit contributes the current squared power.',
        },
      );
      if (remaining % 2) {
        result *= power;
        c.multiplications++;
      }
      remaining = Math.floor(remaining / 2);
      if (remaining > 0) {
        power *= power;
        c.multiplications++;
      }
      yield emit(
        'Square for the next bit and halve the remaining exponent.',
        5,
      );
    }
    const f = emit('All exponent bits have been consumed.', 6);
    f.state.result = String(result);
    yield f;
  },
};
export const hanoi: Visualizer<number> = {
  id: 'tower-of-hanoi',
  maxSize: 8,
  inputHint: 'Enter 1–8 disks. The canonical plan moves the tower from A to C.',
  complexity: {
    metric: { label: 'Disk moves', keys: ['moves'] },
    best: 'Θ(2ⁿ) for n disks',
    average: 'Θ(2ⁿ)',
    worst: 'Θ(2ⁿ)',
    space: 'O(n) recursion stack',
    why: 'Move n−1 disks away, move the largest disk once, then move n−1 disks onto it: M(n)=2M(n−1)+1.',
  },
  presets: {
    best: 1,
    average: 3,
    worst: 8,
    random: (n) => Math.min(8, Math.max(1, n)),
  },
  validateInput(raw) {
    if (!Number.isInteger(raw) || Number(raw) < 1 || Number(raw) > 8)
      throw new Error('Use between one and eight disks.');
    return Number(raw);
  },
  *generate(n) {
    const pegs = [
        Array.from({ length: n }, (_, i) => n - i),
        [] as number[],
        [] as number[],
      ],
      c = counters(),
      calls: string[] = [];
    c.moves = 0;
    const emit = (
      text: string,
      line: number,
      vars: Frame['variables'] = {},
      action?: Frame['action'],
    ): Frame => ({
      ...frame(
        {
          kind: 'hanoi',
          values: [],
          rows: pegs.map((p) => [...p]),
          labels: ['A', 'B', 'C'],
        },
        text,
        c,
        line,
        vars,
        [],
        action,
      ),
      callStack: [...calls],
    });
    function* move(
      count: number,
      from: number,
      to: number,
      other: number,
    ): Generator<Frame> {
      if (count === 0) return;
      calls.push(`move(${count}, ${'ABC'[from]} → ${'ABC'[to]})`);
      yield* move(count - 1, from, other, to);
      yield emit(
        'The smaller subproblem is complete; choose the next move.',
        3,
        { count },
        {
          prompt: 'Which move comes next in this canonical plan?',
          choices: ['A→B', 'A→C', 'B→A', 'B→C', 'C→A', 'C→B'],
          answer: `${'ABC'[from]}→${'ABC'[to]}`,
          hint: 'The current call moves its largest remaining disk to its target after the smaller tower is out of the way.',
        },
      );
      const disk = pegs[from].pop()!;
      if (pegs[to].length && pegs[to].at(-1)! < disk)
        throw new Error('Illegal Hanoi move');
      pegs[to].push(disk);
      c.moves++;
      c.reads++;
      c.writes += 2;
      yield emit(`Move disk ${disk} from ${'ABC'[from]} to ${'ABC'[to]}.`, 4, {
        disk,
        from: 'ABC'[from],
        to: 'ABC'[to],
      });
      yield* move(count - 1, other, to, from);
      calls.pop();
    }
    yield emit('Only one top disk may move at a time.', 1, { n });
    yield* move(n, 0, 2, 1);
    const f = emit(
      'Every disk reached C without a larger disk covering a smaller one.',
      6,
      { moves: c.moves },
    );
    f.state.result = { moves: c.moves, pegs: pegs.map((p) => [...p]) };
    yield f;
  },
};
const reservoirSchema = z.object({
  values: z.array(z.number().int().min(-999).max(999)).min(1).max(64),
  k: z.number().int().min(1).max(64),
  seed: z.number().int().min(0).max(4294967295).default(42),
});
export const reservoir: Visualizer<z.infer<typeof reservoirSchema>> = {
  id: 'reservoir-sampling',
  inputHint:
    'Enter {"values":[1,2,3,4,5],"k":2,"seed":42}. The seed makes the teaching trace reproducible.',
  complexity: {
    metric: { label: 'Stream items read', keys: ['reads'] },
    best: 'O(n)',
    average: 'O(n)',
    worst: 'O(n)',
    space: 'O(k)',
    why: 'A new stream item at position i enters a k-slot reservoir with probability k/(i+1), preserving equal inclusion probability for every earlier item.',
  },
  presets: {
    best: { values: [1], k: 1, seed: 42 },
    average: { values: [1, 2, 3, 4, 5, 6, 7, 8], k: 3, seed: 42 },
    worst: { values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], k: 1, seed: 17 },
    random: (n, s = 42) => ({
      values: randomNumbers(n, s),
      k: Math.min(n, 3),
      seed: s >>> 0,
    }),
  },
  validateInput(raw) {
    const p = reservoirSchema.safeParse(raw);
    if (!p.success || p.data.k > p.data.values.length)
      throw new Error(
        'Use k between one and the stream length and an unsigned 32-bit seed.',
      );
    return p.data;
  },
  *generate({ values, k, seed }) {
    const c = counters(),
      sample = values.slice(0, k);
    c.reads = k;
    c.writes = k;
    c.randomDraws = 0;
    let state = seed >>> 0;
    function draw(bound: number) {
      const limit = 4294967296 - (4294967296 % bound);
      do {
        state = (Math.imul(1664525, state) + 1013904223) >>> 0;
        c.randomDraws++;
      } while (state >= limit);
      return state % bound;
    }
    yield frame(
      { kind: 'boxes', values: sample },
      'The first k items fill the reservoir.',
      c,
      1,
      { k, seed },
    );
    for (let i = k; i < values.length; i++) {
      const j = draw(i + 1);
      c.reads++;
      c.comparisons++;
      yield frame(
        { kind: 'boxes', values: sample },
        'Draw uniformly from all positions seen so far.',
        c,
        3,
        { i, j, incoming: values[i], inclusionProbability: k / (i + 1) },
        [],
        {
          prompt: 'Does this draw replace a reservoir slot?',
          choices: ['Replace', 'Keep sample'],
          answer: j < k ? 'Replace' : 'Keep sample',
          hint: 'Replace slot j only when j is smaller than k.',
        },
      );
      if (j < k) {
        sample[j] = values[i];
        c.writes++;
        yield frame(
          { kind: 'boxes', values: sample },
          'Replace the selected slot with the arriving item.',
          c,
          5,
          { i, j },
          [{ id: String(j), kind: 'moving' }],
        );
      }
    }
    yield frame(
      { kind: 'boxes', values: sample, result: sample },
      'The sample uses fixed memory without knowing the stream length in advance.',
      c,
      6,
      { k, items: values.length },
    );
  },
};
const clusterSchema = z.object({
  points: z
    .array(
      z.tuple([
        z.number().finite().min(-100).max(100),
        z.number().finite().min(-100).max(100),
      ]),
    )
    .min(1)
    .max(64),
  k: z.number().int().min(1).max(4),
  iterations: z.number().int().min(1).max(10).default(6),
  seed: z.number().int().min(0).max(4294967295).default(42),
});
export const kmeans: Visualizer<z.infer<typeof clusterSchema>> = {
  id: 'k-means-clustering',
  maxSize: 32,
  inputHint:
    'Enter {"points":[[-8,-7],[-7,-8],[7,8],[8,7]],"k":2,"iterations":6,"seed":42}.',
  complexity: {
    metric: { label: 'Squared-distance checks', keys: ['distanceChecks'] },
    best: 'O(I·n·k·d)',
    average: 'O(I·n·k·d)',
    worst: 'O(I·n·k·d) for I capped iterations',
    space: 'O(n+k) in two dimensions',
    why: 'Lloyd iterations assign each point to its nearest centroid and recompute means. Squared error does not increase, but convergence can reach a local optimum.',
  },
  presets: {
    best: {
      points: [
        [-8, -8],
        [-7, -7],
        [7, 7],
        [8, 8],
      ],
      k: 2,
      iterations: 6,
      seed: 42,
    },
    average: {
      points: [
        [-8, -7],
        [-6, -9],
        [-3, 1],
        [2, -1],
        [6, 8],
        [9, 6],
      ],
      k: 2,
      iterations: 6,
      seed: 42,
    },
    worst: {
      points: [
        [-9, -1],
        [-5, 2],
        [-2, 0],
        [0, 3],
        [3, 0],
        [6, 2],
        [9, -1],
      ],
      k: 3,
      iterations: 10,
      seed: 1,
    },
    random: (n, s = 42) => ({
      points: randomNumbers(Math.min(32, n) * 2, s)
        .slice(0, Math.min(32, n) * 2)
        .reduce<[number, number][]>((out, v, i, array) => {
          if (i % 2 === 0)
            out.push([v - 50 + out.length * 0.01, (array[i + 1] ?? 0) - 50]);
          return out;
        }, []),
      k: Math.min(3, n),
      iterations: 6,
      seed: s >>> 0,
    }),
  },
  validateInput(raw) {
    const p = clusterSchema.safeParse(raw);
    if (
      !p.success ||
      p.data.k > new Set(p.data.points.map((p) => p.join(','))).size
    )
      throw new Error(
        'Use up to 64 points, 1–4 clusters no greater than the distinct point count, and 1–10 iterations.',
      );
    return {
      ...p.data,
      points: p.data.points.map(
        ([x, y]) => [x || 0, y || 0] as [number, number],
      ),
    };
  },
  *generate({ points, k, iterations, seed }) {
    const c = counters();
    c.distanceChecks = 0;
    const distance = (a: number[], b: number[]) => {
      c.distanceChecks++;
      c.reads += 4;
      return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
    };
    const centers: number[][] = [[...points[seed % points.length]]];
    while (centers.length < k) {
      let chosen = 0,
        best = -1;
      points.forEach((p, i) => {
        const d = Math.min(...centers.map((center) => distance(p, center)));
        if (d > best) {
          best = d;
          chosen = i;
        }
      });
      centers.push([...points[chosen]]);
    }
    let groups = Array(points.length).fill(-1) as number[];
    let completed = 0;
    const xs = points.map((p) => p[0]),
      ys = points.map((p) => p[1]),
      minX = Math.min(...xs),
      maxX = Math.max(...xs),
      minY = Math.min(...ys),
      maxY = Math.max(...ys);
    const pos = (p: number[]) => ({
      x: 35 + ((p[0] - minX) / Math.max(1, maxX - minX)) * 290,
      y: 35 + ((p[1] - minY) / Math.max(1, maxY - minY)) * 250,
    });
    function emit(
      text: string,
      line: number,
      vars: Frame['variables'] = {},
      action?: Frame['action'],
    ) {
      const nodes = [
        ...points.map((p, i) => ({
          id: `p${i}`,
          label: `${i}${groups[i] < 0 ? '' : `·C${groups[i]}`}`,
          ...pos(p),
        })),
        ...centers.map((p, i) => ({ id: `c${i}`, label: `C${i}`, ...pos(p) })),
      ];
      const edges = groups.flatMap((group, i) =>
        group < 0 ? [] : [{ from: `p${i}`, to: `c${group}` }],
      );
      return frame(
        { kind: 'graph', values: [], nodes, edges, directed: false },
        text,
        c,
        line,
        vars,
        centers.map((_, i) => ({ id: `c${i}`, kind: 'queued' as const })),
        action,
      );
    }
    yield emit(
      'Initialize reproducibly with farthest-first example centers.',
      1,
      { k },
    );
    for (let iteration = 0; iteration < iterations; iteration++) {
      const next: number[] = [];
      for (let i = 0; i < points.length; i++) {
        const distances = centers.map((center) => distance(points[i], center));
        const group = distances.indexOf(Math.min(...distances));
        yield emit(
          'Choose the nearest current centroid for this point.',
          3,
          { iteration, point: i },
          {
            prompt: 'Which centroid is closest?',
            choices: centers.map((_, j) => `C${j}`),
            answer: `C${group}`,
            hint: 'Compare squared Euclidean distances; ties use the lowest centroid index.',
          },
        );
        next.push(group);
        c.writes++;
      }
      const unchanged = next.every((g, i) => g === groups[i]);
      groups = next;
      for (let group = 0; group < k; group++) {
        const members = points.filter((_, i) => groups[i] === group);
        if (members.length) {
          centers[group] = [0, 1].map(
            (d) => members.reduce((sum, p) => sum + p[d], 0) / members.length,
          );
          c.writes += 2;
        }
      }
      completed++;
      const sse = points.reduce(
        (sum, p, i) =>
          sum +
          (p[0] - centers[groups[i]][0]) ** 2 +
          (p[1] - centers[groups[i]][1]) ** 2,
        0,
      );
      yield emit(
        'Move each nonempty cluster center to the mean of its members.',
        5,
        { iteration, sse },
      );
      if (unchanged) break;
    }
    const f = emit(
      'This run reached a stable assignment or its iteration limit.',
      6,
      { iterations: completed },
    );
    f.state.result = {
      centroids: centers,
      assignments: groups,
      sse: points.reduce(
        (sum, p, i) =>
          sum +
          (p[0] - centers[groups[i]][0]) ** 2 +
          (p[1] - centers[groups[i]][1]) ** 2,
        0,
      ),
      iterations: completed,
    };
    yield f;
  },
};
const rankSchema = graphSchema.extend({
  damping: z.number().min(0).max(0.99).default(0.85),
  iterations: z.number().int().min(1).max(30).default(12),
});
export const pageRank: Visualizer<z.infer<typeof rankSchema>> = {
  id: 'pagerank',
  maxSize: 16,
  inputHint:
    'Enter a directed graph plus optional damping and iterations. Dangling vertices distribute their rank uniformly.',
  complexity: {
    metric: { label: 'Rank contributions', keys: ['contributions'] },
    best: 'O(I(V+E))',
    average: 'O(I(V+E))',
    worst: 'O(I(V+E))',
    space: 'O(V+E)',
    why: 'Each power iteration adds teleportation, redistributes dangling rank and follows every directed link once. Damping below one stabilizes the random-surfer model.',
  },
  presets: {
    best: {
      n: 1,
      edges: [],
      directed: true,
      start: 0,
      damping: 0.85,
      iterations: 5,
    },
    average: {
      n: 4,
      edges: [
        [0, 1, 1],
        [0, 2, 1],
        [1, 2, 1],
        [2, 0, 1],
        [3, 2, 1],
      ],
      directed: true,
      start: 0,
      damping: 0.85,
      iterations: 12,
    },
    worst: {
      n: 6,
      edges: [
        [0, 1, 1],
        [1, 2, 1],
        [2, 3, 1],
        [3, 4, 1],
        [4, 5, 1],
      ],
      directed: true,
      start: 0,
      damping: 0.99,
      iterations: 30,
    },
    random: (n, s) => ({
      ...graphPresets(true).random(n, s),
      damping: 0.85,
      iterations: 12,
    }),
  },
  validateInput(raw) {
    const g = parseGraph(raw, { directed: true }),
      p = rankSchema.safeParse({
        ...g,
        ...(raw && typeof raw === 'object' ? raw : {}),
      });
    if (!p.success || !p.data.directed)
      throw new Error(
        'Use a directed graph, damping from zero to 0.99 and 1–30 iterations.',
      );
    return p.data;
  },
  *generate(input) {
    const g = input,
      a = adjacency(g),
      c = counters();
    c.contributions = 0;
    let ranks = Array(g.n).fill(1 / g.n) as number[];
    const emit = (
      text: string,
      line: number,
      vars: Frame['variables'] = {},
      action?: Frame['action'],
    ) =>
      frame(
        {
          ...graphState(g),
          nodes: graphState(g).nodes?.map((node, i) => ({
            ...node,
            label: `${i}: ${ranks[i].toFixed(3)}`,
          })),
        },
        text,
        c,
        line,
        vars,
        [],
        action,
      );
    yield emit(
      'Start every vertex with an equal share of probability.',
      1,
      { damping: g.damping },
      {
        prompt: 'What must happen to a dangling vertex’s rank?',
        choices: ['Redistribute it', 'Delete it'],
        answer: 'Redistribute it',
        hint: 'Probability must not disappear when a page has no outgoing links.',
      },
    );
    for (let iteration = 0; iteration < g.iterations; iteration++) {
      const next = Array(g.n).fill((1 - g.damping) / g.n) as number[];
      let dangling = 0;
      for (let u = 0; u < g.n; u++) {
        c.reads++;
        if (!a[u].length) dangling += ranks[u];
      }
      for (let v = 0; v < g.n; v++) {
        next[v] += (g.damping * dangling) / g.n;
        c.writes++;
      }
      for (let u = 0; u < g.n; u++)
        for (const edge of a[u]) {
          next[edge.to] += (g.damping * ranks[u]) / a[u].length;
          c.contributions++;
          c.reads++;
          c.writes++;
        }
      const difference = Math.max(
        ...next.map((r, i) => Math.abs(r - ranks[i])),
      );
      ranks = next;
      yield emit(
        'Apply teleportation, dangling redistribution and link contributions.',
        5,
        {
          iteration: iteration + 1,
          difference,
          total: ranks.reduce((s, v) => s + v, 0),
        },
      );
    }
    const f = emit(
      'Rank measures random-surfer weight, not factual authority or truth.',
      6,
    );
    f.state.result = ranks;
    yield f;
  },
};
const cacheSchema = z.object({
  accesses: z.array(z.number().int().min(-999).max(999)).min(1).max(64),
  capacity: z.number().int().min(1).max(8),
});
export function cacheVisualizer(
  policy: 'lru' | 'lfu',
): Visualizer<z.infer<typeof cacheSchema>> {
  return {
    id: `${policy}-cache`,
    inputHint:
      'Enter {"accesses":[1,2,3,1,4,2,5],"capacity":3}. Missing keys load automatically for this policy demonstration.',
    complexity: {
      metric: { label: 'Cache accesses', keys: ['lookups'] },
      best: 'O(1) expected access',
      average: 'O(1) expected access',
      worst: 'O(1) policy-link updates; hash-dependent lookup',
      space: 'O(k) cache capacity',
      why:
        policy === 'lru'
          ? 'An insertion-ordered hash map moves hits to the most-recent end and evicts the oldest key in constant expected time.'
          : 'Frequency buckets hold keys in recency order. The minimum-frequency bucket supplies the oldest tie, avoiding a full cache scan.',
    },
    presets: {
      best: { accesses: [1, 1, 1, 1], capacity: 3 },
      average: { accesses: [1, 2, 3, 1, 4, 2, 5], capacity: 3 },
      worst: { accesses: [1, 2, 3, 4, 5, 1, 2, 3, 4, 5], capacity: 2 },
      random: (n, s) => ({
        accesses: randomNumbers(n, s).map((v) => v % 8),
        capacity: 3,
      }),
    },
    validateInput(raw) {
      const p = cacheSchema.safeParse(raw);
      if (!p.success)
        throw new Error(
          'Use up to 64 bounded keys and a cache capacity from one to eight.',
        );
      return p.data;
    },
    *generate({ accesses, capacity }) {
      const c = counters(),
        entries = new Map<number, { frequency: number }>(),
        buckets = new Map<number, Map<number, true>>(),
        evicted: number[] = [];
      let minFrequency = 0;
      c.lookups = 0;
      c.hits = 0;
      c.misses = 0;
      c.evictions = 0;
      function emit(
        text: string,
        line: number,
        vars: Frame['variables'] = {},
        action?: Frame['action'],
      ) {
        const frequencies = [...buckets.keys()].sort((a, b) => a - b);
        return frame(
          policy === 'lru'
            ? { kind: 'queue', values: [...entries.keys()] }
            : {
                kind: 'grid',
                values: [...entries.keys()],
                rows: frequencies.map((f) => [...buckets.get(f)!.keys()]),
                labels: frequencies.map((f) => `f${f}`),
              },
          text,
          c,
          line,
          { capacity, minFrequency, ...vars },
          [],
          action,
        );
      }
      const addBucket = (frequency: number, key: number) => {
        if (!buckets.has(frequency)) buckets.set(frequency, new Map());
        buckets.get(frequency)!.set(key, true);
      };
      yield emit(
        policy === 'lru'
          ? 'Oldest keys are at the front; hits move to the back.'
          : 'The smallest frequency wins eviction, with oldest access breaking ties.',
        1,
      );
      for (const key of accesses) {
        const exists = entries.has(key);
        c.lookups++;
        c.reads++;
        yield emit(
          'Check whether this requested key is already cached.',
          3,
          { key },
          {
            prompt: 'Is this access a hit or miss?',
            choices: ['Hit', 'Miss'],
            answer: exists ? 'Hit' : 'Miss',
            hint: 'Inspect the currently stored keys.',
          },
        );
        if (exists) {
          c.hits++;
          const entry = entries.get(key)!;
          if (policy === 'lru') {
            entries.delete(key);
            entries.set(key, entry);
          } else {
            buckets.get(entry.frequency)!.delete(key);
            if (!buckets.get(entry.frequency)!.size) {
              buckets.delete(entry.frequency);
              if (minFrequency === entry.frequency) minFrequency++;
            }
            entry.frequency++;
            addBucket(entry.frequency, key);
          }
          c.writes++;
          yield emit(
            'Update the hit’s policy position without reloading it.',
            5,
            { key },
          );
          continue;
        }
        c.misses++;
        if (entries.size === capacity) {
          const victim =
            policy === 'lru'
              ? entries.keys().next().value!
              : buckets.get(minFrequency)!.keys().next().value!;
          yield emit(
            'A miss in a full cache needs a policy victim.',
            4,
            { key },
            {
              prompt: 'Which key should be evicted?',
              choices: [...entries.keys()].map(String),
              answer: String(victim),
              hint:
                policy === 'lru'
                  ? 'Choose the least recently used key.'
                  : 'Choose the lowest frequency, then the oldest key within that frequency.',
            },
          );
          entries.delete(victim);
          if (policy === 'lfu') {
            buckets.get(minFrequency)!.delete(victim);
            if (!buckets.get(minFrequency)!.size) buckets.delete(minFrequency);
          }
          evicted.push(victim);
          c.evictions++;
          c.writes++;
        }
        entries.set(key, { frequency: 1 });
        if (policy === 'lfu') {
          minFrequency = 1;
          addBucket(1, key);
        }
        c.writes++;
        yield emit('Load the missed key and register its first access.', 5, {
          key,
        });
      }
      const f = emit(
        'The final cache reflects the chosen access-history policy.',
        6,
      );
      f.state.result = {
        hits: c.hits,
        misses: c.misses,
        cache: [...entries.entries()].map(([key, e]) => ({
          key,
          frequency: e.frequency,
        })),
        evicted,
      };
      yield f;
    },
  };
}
