import 'server-only';
import { z } from 'zod';
import type { Visualizer, Frame, VisualState } from '@/engine/types';
import {
  arrayPresets,
  counters,
  frame,
  randomNumbers,
  validateNumbers,
} from '@/engine/helpers';
export const timeSpace: Visualizer = {
  id: 'time-vs-space-complexity',
  presets: {
    ...arrayPresets(),
    best: [1, 1, 2, 3, 4, 5],
    worst: [1, 2, 3, 4, 5, 6],
  },
  validateInput: validateNumbers,
  complexity: {
    best: 'O(1) early duplicate',
    average: 'Naive O(n²); hash expected O(n)',
    worst: 'Naive O(n²); hash expected O(n)',
    space: 'Naive O(1); hash O(n)',
    why: 'Extra memory remembers previously seen keys, trading a nested pair scan for expected constant-time set membership checks.',
  },
  *generate(input) {
    const c = counters(),
      seen = new Set<number>();
    let duplicate = false;
    c.pairChecks = 0;
    c.setLookups = 0;
    yield frame(
      { kind: 'boxes', values: input },
      'Compare duplicate detection with and without extra memory.',
      c,
      1,
    );
    outer: for (let i = 0; i < input.length; i++)
      for (let j = i + 1; j < input.length; j++) {
        c.comparisons++;
        c.pairChecks++;
        c.reads += 2;
        yield frame(
          { kind: 'boxes', values: input },
          'The constant-space method compares another pair.',
          c,
          3,
          { i, j, method: 'pair scan' },
          [
            { id: String(i), kind: 'comparing' },
            { id: String(j), kind: 'comparing' },
          ],
          {
            prompt: 'Do these keys prove a duplicate?',
            choices: ['Duplicate', 'Different'],
            answer: input[i] === input[j] ? 'Duplicate' : 'Different',
            hint: 'Compare the two highlighted keys.',
          },
        );
        if (input[i] === input[j]) {
          duplicate = true;
          break outer;
        }
      }
    let hashDuplicate = false;
    for (let i = 0; i < input.length; i++) {
      c.setLookups++;
      c.reads++;
      yield frame(
        {
          kind: 'grid',
          values: input,
          rows: [[...input], [...seen]],
          labels: ['input', 'seen'],
        },
        'The memory-using method asks whether this key was seen.',
        c,
        4,
        { i, value: input[i], method: 'hash set' },
      );
      if (seen.has(input[i])) {
        hashDuplicate = true;
        break;
      }
      seen.add(input[i]);
      c.writes++;
    }
    yield frame(
      {
        kind: 'grid',
        values: input,
        rows: [[...input], [...seen]],
        labels: ['input', 'seen'],
        result: {
          duplicate,
          hashDuplicate,
          pairChecks: c.pairChecks,
          setLookups: c.setLookups,
          storedKeys: seen.size,
        },
      },
      'Both methods agree while using different work and memory budgets.',
      c,
      6,
      { duplicate, hashDuplicate, storedKeys: seen.size },
    );
  },
};
export const recursionBasics: Visualizer<number> = {
  id: 'recursion-basics',
  maxSize: 12,
  presets: {
    best: 1,
    average: 5,
    worst: 12,
    random: (n) => Math.min(12, Math.max(1, n)),
  },
  validateInput(raw) {
    if (!Number.isInteger(raw) || Number(raw) < 1 || Number(raw) > 12)
      throw new Error('Enter an integer between 1 and 12.');
    return Number(raw);
  },
  complexity: {
    metric: { label: 'Recursive calls', keys: ['calls'] },
    best: 'O(n)',
    average: 'O(n)',
    worst: 'O(n)',
    space: 'O(n) call stack',
    why: 'Factorial makes one smaller recursive call at each level until it reaches its base case.',
  },
  *generate(n) {
    const c = counters(),
      stack: string[] = [];
    c.calls = 0;
    c.multiplications = 0;
    function* factorial(value: number): Generator<Frame, number> {
      stack.push(`factorial(${value})`);
      c.calls = (c.calls ?? 0) + 1;
      yield {
        ...frame(
          { kind: 'stack', values: stack.map((_, i) => n - i) },
          'Push this call before solving the smaller subproblem.',
          c,
          2,
          { value },
          [],
          {
            prompt: 'Is this the base case?',
            choices: ['Base case', 'Recurse'],
            answer: value <= 1 ? 'Base case' : 'Recurse',
            hint: 'Factorial stops at one, whose value is one.',
          },
        ),
        callStack: [...stack],
      };
      let result = 1;
      if (value > 1) {
        const smaller = yield* factorial(value - 1);
        result = value * smaller;
        c.multiplications = (c.multiplications ?? 0) + 1;
      }
      yield {
        ...frame(
          { kind: 'stack', values: stack.map((_, i) => n - i) },
          `Return ${result} to the waiting caller.`,
          c,
          value <= 1 ? 3 : 5,
          { value, result },
        ),
        callStack: [...stack],
      };
      stack.pop();
      return result;
    }
    yield frame(
      { kind: 'stack', values: [] },
      'Each call waits for a smaller factorial.',
      c,
      1,
      { n },
    );
    const result = yield* factorial(n);
    yield {
      ...frame(
        { kind: 'stack', values: [], result },
        'Every call returned and the call stack is empty.',
        c,
        6,
        { n, result },
      ),
      callStack: [],
    };
  },
};
export const recursionTree: Visualizer<number> = {
  id: 'recursion-tree-call-stack',
  maxSize: 8,
  presets: {
    best: 1,
    average: 5,
    worst: 8,
    random: (n) => Math.min(8, Math.max(1, n)),
  },
  validateInput(raw) {
    if (!Number.isInteger(raw) || Number(raw) < 1 || Number(raw) > 8)
      throw new Error('Enter an integer between 1 and 8.');
    return Number(raw);
  },
  complexity: {
    metric: { label: 'Naive Fibonacci calls', keys: ['calls'] },
    best: 'O(φⁿ) naive recurrence',
    average: 'O(φⁿ)',
    worst: 'O(φⁿ)',
    space: 'O(n) active call stack',
    why: 'Naive Fibonacci repeats overlapping subproblems. The active call stack is only linear in depth, even though the complete call tree is exponential.',
  },
  *generate(n) {
    type Call = {
      id: string;
      n: number;
      result: number | null;
      children: Call[];
    };
    const root: Call = { id: '0', n, result: null, children: [] },
      stack: string[] = [],
      c = counters();
    let serial = 1;
    c.calls = 0;
    c.additions = 0;
    function emit(
      text: string,
      line: number,
      vars: Frame['variables'] = {},
      action?: Frame['action'],
    ) {
      const nodes: NonNullable<VisualState['nodes']> = [],
        edges: NonNullable<VisualState['edges']> = [];
      let leaf = 0;
      function layout(node: Call, depth: number): number {
        const xs = node.children.map((child) => {
          edges.push({ from: node.id, to: child.id });
          return layout(child, depth + 1);
        });
        const x = xs.length
          ? xs.reduce((n, v) => n + v, 0) / xs.length
          : 35 + leaf++ * 65;
        nodes.push({
          id: node.id,
          label: `F${node.n}${node.result === null ? '' : `=${node.result}`}`,
          x,
          y: 35 + depth * 70,
        });
        return x;
      }
      layout(root, 0);
      return {
        ...frame(
          { kind: 'recursion-tree', values: [], nodes, edges },
          text,
          c,
          line,
          vars,
          [],
          action,
        ),
        callStack: [...stack],
      };
    }
    function* fib(call: Call): Generator<Frame, number> {
      stack.push(`fib(${call.n})`);
      c.calls++;
      yield emit(
        'Create this call without assuming its subproblems are cached.',
        2,
        { n: call.n },
        {
          prompt: 'Does this call need children?',
          choices: ['Base case', 'Two calls'],
          answer: call.n < 2 ? 'Base case' : 'Two calls',
          hint: 'Fibonacci stops at zero or one.',
        },
      );
      if (call.n < 2) call.result = call.n;
      else {
        const left: Call = {
          id: String(serial++),
          n: call.n - 1,
          result: null,
          children: [],
        };
        call.children.push(left);
        const a = yield* fib(left);
        const right: Call = {
          id: String(serial++),
          n: call.n - 2,
          result: null,
          children: [],
        };
        call.children.push(right);
        const b = yield* fib(right);
        call.result = a + b;
        c.additions = (c.additions ?? 0) + 1;
      }
      yield emit('Return the computed value and pop this active call.', 5, {
        n: call.n,
        result: call.result,
      });
      stack.pop();
      return call.result;
    }
    yield emit(
      'The tree stores every call; the stack stores only the active path.',
      1,
      { n },
    );
    const result = yield* fib(root);
    const f = emit('Repeated labels reveal overlapping subproblems.', 6, {
      n,
      result,
    });
    f.state.result = result;
    yield f;
  },
};
const recurrenceSchema = z.object({
  a: z.number().int().min(1).max(4),
  b: z.number().int().min(2).max(4),
  k: z.number().int().min(0).max(3),
  n: z.number().int().min(1).max(64),
});
export const masterTheorem: Visualizer<z.infer<typeof recurrenceSchema>> = {
  id: 'master-theorem',
  maxSize: 64,
  presetLabels: { best: 'Case 1', average: 'Case 2', worst: 'Case 3' },
  inputHint:
    'Enter {"a":2,"b":2,"k":1,"n":16} for T(n)=aT(n/b)+n^k. n must be a power of b.',
  presets: {
    best: { a: 4, b: 2, k: 0, n: 16 },
    average: { a: 2, b: 2, k: 1, n: 16 },
    worst: { a: 2, b: 2, k: 2, n: 16 },
    random: (n) => ({
      a: 2,
      b: 2,
      k: 1,
      n: 2 ** Math.floor(Math.log2(Math.max(1, n))),
    }),
  },
  validateInput(raw) {
    const p = recurrenceSchema.safeParse(raw);
    if (!p.success)
      throw new Error(
        'Use bounded integer a, b, k and n as shown in the example.',
      );
    let n = p.data.n;
    while (n > 1 && n % p.data.b === 0) n /= p.data.b;
    if (n !== 1) throw new Error('n must be an exact power of b.');
    return p.data;
  },
  complexity: {
    metric: { label: 'Modeled recurrence-tree work', keys: ['work'] },
    best: 'Θ(n^log_b a) in case 1',
    average: 'Θ(n^k log n) in case 2',
    worst: 'Θ(n^k) in case 3',
    space: 'Depends on the algorithm',
    why: 'Compare the polynomial exponent k with log_b(a). These presets represent theorem cases, not best/average/worst inputs to one fixed algorithm.',
  },
  *generate(input) {
    const { a, b, k, n } = input,
      c = counters(),
      rows: number[][] = [];
    c.work = 0;
    let size = n,
      nodes = 1,
      level = 0,
      total = 0;
    const exponent = Math.log(a) / Math.log(b),
      caseNumber = Math.abs(k - exponent) < 1e-10 ? 2 : k < exponent ? 1 : 3;
    const emit = (text: string, line: number, action?: Frame['action']) =>
      frame(
        {
          kind: 'grid',
          values: rows.map((r) => r[3]),
          rows: rows.map((r) => [...r]),
          labels: rows.map((_, i) => `L${i}`),
        },
        text,
        c,
        line,
        { a, b, k, n, level, case: caseNumber, total },
        [],
        action,
      );
    yield emit('Compare leaf growth with the nonrecursive work per node.', 1, {
      prompt: 'Which quantities decide the master-theorem case?',
      choices: ['k and log_b(a)', 'Only the programming language'],
      answer: 'k and log_b(a)',
      hint: 'Compare n^k with the leaf-growth exponent log_b(a).',
    });
    for (;;) {
      const work = nodes * size ** k;
      total += work;
      c.work = total;
      rows.push([level, nodes, size, work]);
      yield emit(
        'Level columns show depth, node count, subproblem size and work.',
        3,
      );
      if (size === 1) break;
      size /= b;
      nodes *= a;
      level++;
    }
    const bound =
      caseNumber === 1
        ? `Θ(n^${exponent.toFixed(3)})`
        : caseNumber === 2
          ? `Θ(n^${k} log n)`
          : `Θ(n^${k})`;
    const f = emit(
      `The level sums match master-theorem case ${caseNumber}.`,
      6,
    );
    f.state.result = { case: caseNumber, bound, totalWork: total };
    yield f;
  },
};
const bitSchema = z.object({
  value: z.number().int().min(0).max(255),
  bit: z.number().int().min(0).max(7),
});
export const bits: Visualizer<z.infer<typeof bitSchema>> = {
  id: 'bit-manipulation-basics',
  inputHint:
    'Enter {"value":13,"bit":2}. This view uses unsigned eight-bit values.',
  presets: {
    best: { value: 0, bit: 0 },
    average: { value: 13, bit: 2 },
    worst: { value: 255, bit: 7 },
    random: (n, s) => ({ value: randomNumbers(1, s)[0] * 2, bit: n % 8 }),
  },
  validateInput(raw) {
    const p = bitSchema.safeParse(raw);
    if (!p.success)
      throw new Error(
        'Use an unsigned byte and a bit index from zero to seven.',
      );
    return p.data;
  },
  complexity: {
    best: 'O(1) fixed-width operation',
    average: 'O(1)',
    worst: 'O(1)',
    space: 'O(1)',
    why: 'A machine-word mask changes or tests a fixed number of bits. Arbitrary-precision integers require a different cost model.',
  },
  *generate({ value, bit }) {
    const c = counters(),
      mask = 1 << bit,
      operations = [
        ['Original', value],
        ['Mask', mask],
        ['Set', value | mask],
        ['Clear', value & ~mask],
        ['Toggle', value ^ mask],
      ] as const;
    for (let i = 0; i < operations.length; i++) {
      c.reads += 2;
      if (i > 1) c.writes++;
      const [operation, result] = operations[i];
      yield frame(
        {
          kind: 'bits',
          values: Array.from({ length: 8 }, (_, j) => (result >> (7 - j)) & 1),
        },
        `${operation}: inspect bit ${bit} from the right.`,
        c,
        i === 0 ? 1 : 3,
        { operation, value, bit, mask, result },
        [{ id: String(7 - bit), kind: 'comparing' }],
        i === 0
          ? {
              prompt: 'Which operation forces the selected bit to one?',
              choices: [
                'OR with the mask',
                'AND with the inverse mask',
                'XOR with the mask',
              ],
              answer: 'OR with the mask',
              hint: 'OR keeps a one wherever either input has a one.',
            }
          : undefined,
      );
    }
    let popcount = 0;
    for (let x = value; x; x &= x - 1) popcount++;
    yield frame(
      {
        kind: 'bits',
        values: Array.from({ length: 8 }, (_, j) => (value >> (7 - j)) & 1),
        result: {
          original: value,
          isSet: Boolean(value & mask),
          set: value | mask,
          cleared: value & ~mask,
          toggled: value ^ mask,
          popcount,
        },
      },
      'A mask tests, sets, clears or toggles exactly the selected bit.',
      c,
      6,
      { popcount },
    );
  },
};
const pairSchema = z.object({
  values: z.array(z.number().int().min(-999).max(999)).min(2).max(64),
  target: z.number().int().min(-1998).max(1998),
});
export const twoPointers: Visualizer<z.infer<typeof pairSchema>> = {
  id: 'two-pointers',
  inputHint:
    'Enter a sorted array and a target sum: {"values":[1,2,4,7,11],"target":9}.',
  presets: {
    best: { values: [1, 2, 3, 4], target: 5 },
    average: { values: [1, 2, 4, 7, 11], target: 9 },
    worst: { values: [1, 2, 3, 4, 5, 6], target: 99 },
    random: (n, s) => {
      const a = randomNumbers(Math.max(2, n), s).sort((a, b) => a - b);
      return { values: a, target: a[0] + a.at(-1)! };
    },
  },
  validateInput(raw) {
    const p = pairSchema.safeParse(raw);
    if (
      !p.success ||
      p.data.values.some((v, i) => i > 0 && v < p.data.values[i - 1])
    )
      throw new Error('Use 2–64 sorted integers and a bounded target sum.');
    return p.data;
  },
  complexity: {
    best: 'O(1)',
    average: 'O(n)',
    worst: 'O(n)',
    space: 'O(1)',
    why: 'Each comparison moves one endpoint inward; no pointer can cross the array more than once.',
  },
  *generate({ values, target }) {
    const c = counters();
    let left = 0,
      right = values.length - 1;
    yield frame(
      { kind: 'boxes', values },
      'Sorted order lets the endpoint sum guide one pointer.',
      c,
      1,
      { left, right, target },
    );
    while (left < right) {
      const sum = values[left] + values[right];
      c.reads += 2;
      c.comparisons++;
      yield frame(
        { kind: 'boxes', values },
        `Compare endpoint sum ${sum} with target ${target}.`,
        c,
        3,
        { left, right, sum, target },
        [
          { id: String(left), kind: 'comparing' },
          { id: String(right), kind: 'comparing' },
        ],
        {
          prompt: 'Which pointer move can help?',
          choices: ['Move left rightward', 'Move right leftward', 'Found'],
          answer:
            sum === target
              ? 'Found'
              : sum < target
                ? 'Move left rightward'
                : 'Move right leftward',
          hint: 'Increasing the left value increases the sum; decreasing the right value decreases it.',
        },
      );
      if (sum === target) {
        yield frame(
          { kind: 'boxes', values, result: [left, right] },
          'These two distinct positions produce the target sum.',
          c,
          6,
          { left, right, target },
        );
        return;
      }
      if (sum < target) left++;
      else right--;
      yield frame(
        { kind: 'boxes', values },
        'Discard pairs that the sorted-order argument has ruled out.',
        c,
        5,
        { left, right },
      );
    }
    yield frame(
      { kind: 'boxes', values, result: [] },
      'No pair of distinct positions has this sum.',
      c,
      6,
      { target },
    );
  },
};
const windowSchema = z.object({
  values: z.array(z.number().int().min(-999).max(999)).min(1).max(64),
  window: z.number().int().min(1).max(64),
});
export const slidingWindow: Visualizer<z.infer<typeof windowSchema>> = {
  id: 'sliding-window',
  inputHint:
    'Enter {"values":[2,-1,3,4,-2],"window":3}. This lesson finds the largest fixed-window sum.',
  presets: {
    best: { values: [4], window: 1 },
    average: { values: [2, -1, 3, 4, -2], window: 3 },
    worst: { values: [-8, -7, -6, -5, -4, -3], window: 4 },
    random: (n, s) => ({
      values: randomNumbers(n, s).map((v) => v - 40),
      window: Math.min(n, 3),
    }),
  },
  validateInput(raw) {
    const p = windowSchema.safeParse(raw);
    if (!p.success || p.data.window > p.data.values.length)
      throw new Error(
        'Window length must be between one and the number of values.',
      );
    return p.data;
  },
  complexity: {
    best: 'O(n)',
    average: 'O(n)',
    worst: 'O(n)',
    space: 'O(1) auxiliary',
    why: 'Add the arriving value and subtract the leaving value instead of resumming every window.',
  },
  *generate({ values, window }) {
    const c = counters();
    let sum = 0,
      best: number | null = null,
      start = 0;
    const sums: number[] = [];
    yield frame(
      { kind: 'boxes', values },
      'Maintain the sum while the fixed-width window moves.',
      c,
      1,
      { window, sum },
    );
    for (let i = 0; i < values.length; i++) {
      sum += values[i];
      c.reads++;
      yield frame(
        { kind: 'boxes', values },
        'Add the value entering the right side.',
        c,
        3,
        { i, sum, window },
        [{ id: String(i), kind: 'moving' }],
      );
      if (i >= window) {
        yield frame(
          { kind: 'boxes', values },
          'Identify the value that must leave the left side.',
          c,
          4,
          { i, sum, window },
          [],
          {
            prompt: 'Which index leaves this window?',
            choices: [String(i - window), String(i)],
            answer: String(i - window),
            hint: 'The leaving index is exactly window positions behind the arrival.',
          },
        );
        sum -= values[i - window];
        c.reads++;
      }
      if (i >= window - 1) {
        c.comparisons++;
        sums.push(sum);
        c.writes++;
        if (best === null || sum > best) {
          best = sum;
          start = i - window + 1;
        }
        yield frame(
          {
            kind: 'grid',
            values,
            rows: [[...values], [...sums]],
            labels: ['input', 'sums'],
          },
          'Compare this completed window with the best seen so far.',
          c,
          5,
          { sum, best, start },
        );
      }
    }
    yield frame(
      { kind: 'boxes', values, result: best },
      'The maximum fixed-window sum is known without repeated rescans.',
      c,
      6,
      { best, start, end: start + window },
    );
  },
};
const prefixSchema = z.object({
  values: z.array(z.number().int().min(-999).max(999)).min(1).max(64),
  left: z.number().int().min(0).max(64),
  right: z.number().int().min(0).max(64),
});
export const prefixSums: Visualizer<z.infer<typeof prefixSchema>> = {
  id: 'prefix-sums',
  inputHint:
    'Enter {"values":[2,-1,3,4],"left":1,"right":4}. The query is the half-open range [left,right).',
  presets: {
    best: { values: [4], left: 0, right: 1 },
    average: { values: [2, -1, 3, 4], left: 1, right: 4 },
    worst: { values: [1, 2, 3, 4, 5, 6], left: 0, right: 6 },
    random: (n, s) => ({ values: randomNumbers(n, s), left: 0, right: n }),
  },
  validateInput(raw) {
    const p = prefixSchema.safeParse(raw);
    if (
      !p.success ||
      p.data.left > p.data.right ||
      p.data.right > p.data.values.length
    )
      throw new Error('Use a valid half-open range: 0 ≤ left ≤ right ≤ n.');
    return p.data;
  },
  complexity: {
    best: 'O(1) range query after preprocessing',
    average: 'O(1) query',
    worst: 'O(1) query; O(n) build',
    space: 'O(n)',
    why: 'A range sum is prefix[right]−prefix[left]; a zero sentinel makes ranges starting at zero use the same formula.',
  },
  *generate({ values, left, right }) {
    const prefix = [0],
      c = counters();
    c.writes++;
    const emit = (
      text: string,
      line: number,
      vars: Frame['variables'] = {},
      action?: Frame['action'],
    ) =>
      frame(
        {
          kind: 'grid',
          values,
          rows: [[...values], [...prefix]],
          labels: ['input', 'prefix'],
        },
        text,
        c,
        line,
        { left, right, ...vars },
        [],
        action,
      );
    yield emit('Start with a zero prefix before the first value.', 1);
    for (let i = 0; i < values.length; i++) {
      yield emit(
        'The next prefix adds the next input value.',
        3,
        { i, lastPrefix: prefix[i], value: values[i] },
        {
          prompt: 'Which value belongs in the next prefix slot?',
          choices: [
            String(prefix[i] + values[i]),
            String(prefix[i] + values[i] + 1),
          ],
          answer: String(prefix[i] + values[i]),
          hint: 'Add the current value to the previous prefix.',
        },
      );
      prefix.push(prefix[i] + values[i]);
      c.reads += 2;
      c.writes++;
      yield emit('Store the cumulative sum after this value.', 5, { i });
    }
    const result = prefix[right] - prefix[left];
    c.reads += 2;
    const f = emit(
      'Subtract the prefix before the range from the prefix after it.',
      6,
      { result },
    );
    f.state.result = result;
    yield f;
  },
};
