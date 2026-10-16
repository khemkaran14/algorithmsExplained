import 'server-only';
import { z } from 'zod';
import type { Visualizer, Frame, VisualState } from '@/engine/types';
import { frame, counters, randomNumbers } from '@/engine/helpers';
const ascii = z.string().regex(/^[\x20-\x7e]*$/);
const matchSchema = z.object({
  text: ascii.max(64),
  pattern: ascii.min(1).max(24),
});
type MatchInput = z.infer<typeof matchSchema>;
const presets = {
  best: { text: 'abcdefgh', pattern: 'xyz' },
  average: { text: 'ababcabcabababd', pattern: 'ababd' },
  worst: { text: 'aaaaaaaaaaaaaaaaab', pattern: 'aaaaab' },
  random: (n: number, s = 42) => ({
    text: randomNumbers(n, s)
      .map((v) => String.fromCharCode(97 + (v % 4)))
      .join(''),
    pattern: 'aba',
  }),
};
export function matcher(
  kind: 'naive' | 'kmp' | 'rabin-karp' | 'z',
): Visualizer<MatchInput> {
  const id = {
    naive: 'naive-string-matching',
    kmp: 'kmp',
    'rabin-karp': 'rabin-karp',
    z: 'z-algorithm',
  }[kind];
  return {
    id,
    inputHint:
      'Enter {"text":"ababcabcabababd","pattern":"ababd"}. These matching models use printable ASCII; matches are zero-based and may overlap.',
    presets,
    validateInput(raw) {
      return matchSchema.parse(raw);
    },
    complexity: {
      best:
        kind === 'naive'
          ? 'O(n)'
          : kind === 'rabin-karp'
            ? 'O(n+m) expected'
            : 'O(n+m)',
      average:
        kind === 'naive'
          ? 'O(nm)'
          : kind === 'rabin-karp'
            ? 'O(n+m) expected'
            : 'O(n+m)',
      worst: kind === 'naive' || kind === 'rabin-karp' ? 'O(nm)' : 'O(n+m)',
      space:
        kind === 'kmp'
          ? 'O(m)'
          : kind === 'z'
            ? 'O(n+m)'
            : 'O(1) auxiliary, excluding output',
      why:
        kind === 'naive'
          ? 'Compare from each possible alignment; repeated near-matches can redo m comparisons at almost every text position.'
          : kind === 'kmp'
            ? 'The prefix function reuses the longest matching proper prefix after a mismatch; text and fallback pointers advance only linearly in aggregate.'
            : kind === 'z'
              ? 'A maintained [left,right] matching box reuses previous prefix matches and expands only beyond the known right boundary.'
              : 'Rolling hashes update in constant time per alignment, but equal hashes are verified character by character to reject collisions; adversarial collisions can cost O(nm).',
    },
    *generate({ text, pattern }) {
      const c = counters(),
        matches: number[] = [],
        prefix = Array(pattern.length).fill(0) as number[];
      function emit(
        narration: string,
        line: number,
        vars: Frame['variables'] = {},
        at = -1,
        action?: Frame['action'],
      ) {
        return frame(
          {
            kind: 'string',
            values: Array.from(text).map((ch) => ch.charCodeAt(0)),
            labels: Array.from(text),
          },
          narration,
          c,
          line,
          { pattern, matches: matches.join(', '), ...vars },
          at >= 0 ? [{ id: String(at), kind: 'comparing' }] : [],
          action,
        );
      }
      function compare(i: number, j: number) {
        c.comparisons++;
        c.reads += 2;
        return emit(
          'Compare the aligned text and pattern characters.',
          3,
          {
            textIndex: i,
            patternIndex: j,
            textCharacter: text[i],
            patternCharacter: pattern[j],
          },
          i,
          {
            prompt: 'Do these aligned characters match?',
            choices: ['Match', 'Mismatch'],
            answer: text[i] === pattern[j] ? 'Match' : 'Mismatch',
            hint: 'Compare the exact characters at the current alignment, not the entire remaining suffix.',
          },
        );
      }
      yield emit(
        'Find every complete pattern occurrence, including overlaps.',
        1,
      );
      if (kind === 'naive') {
        for (let start = 0; start + pattern.length <= text.length; start++) {
          let j = 0;
          for (; j < pattern.length; j++) {
            yield compare(start + j, j);
            if (text[start + j] !== pattern[j]) break;
          }
          if (j === pattern.length) {
            matches.push(start);
            c.writes++;
            yield emit(
              'Every pattern character matched at this alignment.',
              5,
              { start },
              start,
            );
          }
        }
      }
      if (kind === 'kmp') {
        for (let i = 1, j = 0; i < pattern.length;) {
          c.comparisons++;
          c.reads += 2;
          if (pattern[i] === pattern[j]) {
            prefix[i++] = ++j;
            c.writes++;
          } else if (j > 0) j = prefix[j - 1];
          else prefix[i++] = 0;
          yield emit(
            'Build the longest matching proper-prefix length for this pattern prefix.',
            2,
            { prefix: prefix.join(', '), patternIndex: i - 1 },
          );
        }
        for (let i = 0, j = 0; i < text.length;) {
          yield compare(i, j);
          if (text[i] === pattern[j]) {
            i++;
            j++;
            if (j === pattern.length) {
              matches.push(i - j);
              c.writes++;
              yield emit(
                'Record the occurrence, then preserve the longest overlapping prefix.',
                5,
                { start: i - j },
                i - j,
              );
              j = prefix[j - 1];
            }
          } else if (j > 0) {
            j = prefix[j - 1];
            yield emit(
              'Fallback through the prefix function without moving the text pointer backward.',
              4,
              { textIndex: i, patternIndex: j },
              i,
            );
          } else i++;
        }
      }
      if (kind === 'rabin-karp' && pattern.length <= text.length) {
        const base = 257,
          modulus = 1000000007,
          m = pattern.length;
        let high = 1,
          patternHash = 0,
          windowHash = 0;
        for (let i = 0; i < m; i++) {
          patternHash = (patternHash * base + pattern.charCodeAt(i)) % modulus;
          windowHash = (windowHash * base + text.charCodeAt(i)) % modulus;
          c.reads += 2;
          if (i < m - 1) high = (high * base) % modulus;
        }
        for (let start = 0; start + m <= text.length; start++) {
          c.hashes = (c.hashes ?? 0) + 1;
          yield emit(
            'A hash mismatch rejects this alignment; equality still needs exact verification.',
            3,
            { start, patternHash, windowHash },
            start,
            {
              prompt: 'Must we verify this window character by character?',
              choices: ['Verify characters', 'Skip window'],
              answer:
                windowHash === patternHash
                  ? 'Verify characters'
                  : 'Skip window',
              hint: 'Only equal hashes are candidates; collisions must never be accepted as matches.',
            },
          );
          if (windowHash === patternHash) {
            let j = 0;
            for (; j < m; j++) {
              yield compare(start + j, j);
              if (text[start + j] !== pattern[j]) break;
            }
            if (j === m) {
              matches.push(start);
              c.writes++;
              yield emit(
                'Exact comparison confirmed this hash candidate.',
                5,
                { start },
                start,
              );
            }
          }
          if (start + m < text.length) {
            windowHash =
              (((windowHash - text.charCodeAt(start) * high) % modulus) +
                modulus) %
              modulus;
            windowHash =
              (windowHash * base + text.charCodeAt(start + m)) % modulus;
            c.reads += 2;
          }
        }
      }
      if (kind === 'z') {
        const joined = pattern + '\0' + text,
          z = Array(joined.length).fill(0) as number[];
        let left = 0,
          right = -1;
        for (let i = 1; i < joined.length; i++) {
          if (i <= right) z[i] = Math.min(right - i + 1, z[i - left]);
          while (i + z[i] < joined.length) {
            c.comparisons++;
            c.reads += 2;
            if (joined[z[i]] !== joined[i + z[i]]) break;
            z[i]++;
          }
          if (i + z[i] - 1 > right) {
            left = i;
            right = i + z[i] - 1;
          }
          c.writes++;
          yield emit(
            'Reuse the current Z box, then extend only unknown prefix comparisons.',
            3,
            { combinedIndex: i, z: z[i], left, right },
            i - pattern.length - 1,
          );
          if (i > pattern.length && z[i] >= pattern.length) {
            matches.push(i - pattern.length - 1);
            yield emit(
              'A full pattern prefix starts at this text index.',
              5,
              { start: i - pattern.length - 1 },
              i - pattern.length - 1,
            );
          }
        }
      }
      const f = emit(
        'All returned positions are exact full-pattern matches.',
        6,
      );
      f.state.result = { matches, ...(kind === 'kmp' ? { prefix } : {}) };
      yield f;
    },
  };
}
const textSchema = ascii.min(1).max(64);
const textPresets = {
  best: 'abcdef',
  average: 'aaabbccccdaa',
  worst: 'aaaaaaaaaaaaaaaa',
  random: (n: number, s = 42) =>
    randomNumbers(n, s)
      .map((v) => String.fromCharCode(97 + (v % 5)))
      .join(''),
};
export const rle: Visualizer<string> = {
  id: 'run-length-encoding',
  inputHint:
    'Enter a JSON string such as "aaabbccccdaa". Runs are stored as [character,count] pairs, not an ambiguous digit-concatenated format.',
  presets: textPresets,
  validateInput: (raw) => textSchema.parse(raw),
  complexity: {
    best: 'O(n)',
    average: 'O(n)',
    worst: 'O(n)',
    space: 'O(r) output runs; O(1) working state',
    why: 'Every input character extends the current run or starts one new run. Alternating input may expand under an encoded representation; compression is not guaranteed.',
  },
  *generate(text) {
    const c = counters(),
      runs: [string, number][] = [];
    const emit = (
      narration: string,
      line: number,
      i = -1,
      action?: Frame['action'],
    ) =>
      frame(
        {
          kind: 'string',
          values: Array.from(text).map((ch) => ch.charCodeAt(0)),
          labels: Array.from(text),
        },
        narration,
        c,
        line,
        { runs: JSON.stringify(runs) },
        i >= 0 ? [{ id: String(i), kind: 'comparing' }] : [],
        action,
      );
    yield emit(
      'Represent consecutive equal characters as explicit counted runs.',
      1,
    );
    for (let i = 0; i < text.length; i++) {
      const last = runs.at(-1),
        same = last?.[0] === text[i];
      c.reads++;
      c.comparisons++;
      yield emit(
        'Compare this character with the current run character.',
        3,
        i,
        {
          prompt: 'Does this character extend the current run?',
          choices: ['Extend run', 'Start new run'],
          answer: same ? 'Extend run' : 'Start new run',
          hint: 'Only adjacent equal characters belong to the same run.',
        },
      );
      if (same) last[1]++;
      else runs.push([text[i], 1]);
      c.writes++;
      yield emit('Store the updated run count.', 5, i);
    }
    const f = emit(
      'Decoding each counted pair reconstructs the original string.',
      6,
    );
    f.state.result = {
      runs,
      decoded: runs.map(([ch, count]) => ch.repeat(count)).join(''),
    };
    yield f;
  },
};
export const manacher: Visualizer<string> = {
  id: 'manacher-overview',
  inputHint:
    'Enter a printable ASCII JSON string. The odd/even radii include all palindromes; the final result is one longest substring.',
  presets: { ...textPresets, average: 'abacabba', worst: 'aaaaaaaaaaaaaaaa' },
  validateInput: (raw) => textSchema.parse(raw),
  complexity: {
    best: 'O(n)',
    average: 'O(n)',
    worst: 'O(n)',
    space: 'O(n)',
    why: 'Mirror radii inside the current rightmost palindrome avoid repeating known comparisons. Successful expansions beyond its right boundary can advance that boundary only linearly.',
  },
  *generate(text) {
    const c = counters(),
      odd = Array(text.length).fill(0) as number[],
      even = [...odd];
    let bestStart = 0,
      bestLength = 1;
    function emit(
      narration: string,
      line: number,
      center = -1,
      parity = 0,
      vars: Frame['variables'] = {},
      action?: Frame['action'],
    ) {
      return frame(
        {
          kind: 'matrix',
          values: [],
          rows: [odd, even],
          labels: ['odd', 'even'],
          cellLabels: [odd.map(String), even.map(String)],
        },
        narration,
        c,
        line,
        { text, bestStart, bestLength, ...vars },
        center >= 0 ? [{ id: `${parity},${center}`, kind: 'comparing' }] : [],
        action,
      );
    }
    yield emit(
      'Odd centers lie on a character; even centers lie between characters.',
      1,
    );
    for (let parity = 0; parity < 2; parity++) {
      const radii = parity === 0 ? odd : even;
      let left = 0,
        right = -1;
      for (let i = 0; i < text.length; i++) {
        let k =
          i > right
            ? parity === 0
              ? 1
              : 0
            : Math.min(
                radii[left + right - i + (parity === 0 ? 0 : 1)],
                right - i + 1,
              );
        while (i + k < text.length && i - k - (parity === 0 ? 0 : 1) >= 0) {
          const a = i - k - (parity === 0 ? 0 : 1),
            b = i + k;
          c.comparisons++;
          c.reads += 2;
          yield emit(
            'Compare the next pair beyond the known mirrored radius.',
            3,
            i,
            parity,
            { leftIndex: a, rightIndex: b, radius: k },
            {
              prompt: 'Can this palindrome expand?',
              choices: ['Expand', 'Stop expansion'],
              answer: text[a] === text[b] ? 'Expand' : 'Stop expansion',
              hint: 'Both next characters must be equal and inside the string.',
            },
          );
          if (text[a] !== text[b]) break;
          k++;
        }
        radii[i] = k;
        c.writes++;
        const length = 2 * k - (parity === 0 ? 1 : 0),
          start = i - k + (parity === 0 ? 1 : 0);
        if (length > bestLength) {
          bestLength = length;
          bestStart = start;
        }
        if (i + k - 1 > right) {
          left = start;
          right = i + k - 1;
        }
        yield emit(
          'Save the radius and update the rightmost palindrome box.',
          5,
          i,
          parity,
          { radius: k, left, right },
        );
      }
    }
    const f = emit(
      'The largest odd or even radius identifies a longest palindrome.',
      6,
    );
    f.state.result = {
      start: bestStart,
      length: bestLength,
      substring: text.slice(bestStart, bestStart + bestLength),
      odd,
      even,
    };
    yield f;
  },
};
type HuffNode = {
  id: number;
  frequency: number;
  character: string | null;
  left: HuffNode | null;
  right: HuffNode | null;
};
class HuffHeap {
  constructor(private countComparison: () => void) {}
  a: HuffNode[] = [];
  less(a: HuffNode, b: HuffNode) {
    this.countComparison();
    return (
      a.frequency < b.frequency || (a.frequency === b.frequency && a.id < b.id)
    );
  }
  push(n: HuffNode) {
    this.a.push(n);
    let i = this.a.length - 1;
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (!this.less(this.a[i], this.a[p])) break;
      [this.a[i], this.a[p]] = [this.a[p], this.a[i]];
      i = p;
    }
  }
  pop() {
    const result = this.a[0],
      last = this.a.pop()!;
    if (this.a.length) {
      this.a[0] = last;
      let i = 0;
      while (2 * i + 1 < this.a.length) {
        let child = 2 * i + 1;
        if (
          child + 1 < this.a.length &&
          this.less(this.a[child + 1], this.a[child])
        )
          child++;
        if (!this.less(this.a[child], this.a[i])) break;
        [this.a[i], this.a[child]] = [this.a[child], this.a[i]];
        i = child;
      }
    }
    return result;
  }
}
export const huffman: Visualizer<string> = {
  id: 'huffman-coding',
  inputHint:
    'Enter a printable ASCII JSON string. Frequencies build a deterministic prefix tree; codebook/storage overhead is excluded from payload bit counts.',
  presets: {
    ...textPresets,
    average: 'abracadabra',
    worst: 'abcdefghijklmnop',
  },
  validateInput: (raw) => textSchema.parse(raw),
  complexity: {
    best: 'O(n+σ log σ)',
    average: 'O(n+σ log σ)',
    worst: 'O(n+σ log σ)',
    space: 'O(σ) tree/codebook plus encoded output',
    why: 'Count frequencies, then repeatedly merge the two least frequent subtrees in a min heap. Greedy merging minimizes weighted prefix-code length for the given symbol frequencies; codebook overhead still matters.',
  },
  *generate(text) {
    const c = counters(),
      frequency = new Map<string, number>(),
      heap = new HuffHeap(() => c.comparisons++);
    let serial = 0;
    for (const ch of text) {
      frequency.set(ch, (frequency.get(ch) ?? 0) + 1);
      c.reads++;
      c.writes++;
    }
    for (const [character, count] of [...frequency].sort(([a], [b]) =>
      a < b ? -1 : a > b ? 1 : 0,
    ))
      heap.push({
        id: serial++,
        frequency: count,
        character,
        left: null,
        right: null,
      });
    let roots = [...heap.a];
    function emit(
      narration: string,
      line: number,
      vars: Frame['variables'] = {},
      action?: Frame['action'],
    ) {
      const nodes: NonNullable<VisualState['nodes']> = [],
        edges: NonNullable<VisualState['edges']> = [];
      let cursor = 0;
      function walk(n: HuffNode, d: number): number {
        let x;
        if (n.character !== null) x = 35 + cursor++ * 55;
        else {
          const a = walk(n.left!, d + 1),
            b = walk(n.right!, d + 1);
          x = (a + b) / 2;
          edges.push(
            { from: String(n.id), to: String(n.left!.id), label: '0' },
            { from: String(n.id), to: String(n.right!.id), label: '1' },
          );
        }
        nodes.push({
          id: String(n.id),
          label:
            n.character === null
              ? String(n.frequency)
              : `${n.character === ' ' ? '␠' : n.character}:${n.frequency}`,
          x,
          y: 35 + d * 60,
        });
        return x;
      }
      for (const n of roots) {
        walk(n, 0);
        cursor++;
      }
      return frame(
        { kind: 'tree', values: [], nodes, edges },
        narration,
        c,
        line,
        vars,
        [],
        action,
      );
    }
    yield emit('Start with one weighted leaf for each distinct character.', 1);
    while (heap.a.length > 1) {
      const a = heap.pop(),
        b = heap.pop();
      c.reads += 2;
      yield emit(
        'Merge the two minimum-frequency subtrees.',
        3,
        { first: a.frequency, second: b.frequency },
        {
          prompt: 'What frequency belongs on their new parent?',
          choices: [
            String(a.frequency + b.frequency),
            String(a.frequency + b.frequency + 1),
          ],
          answer: String(a.frequency + b.frequency),
          hint: 'A parent represents every occurrence covered by either child.',
        },
      );
      heap.push({
        id: serial++,
        frequency: a.frequency + b.frequency,
        character: null,
        left: a,
        right: b,
      });
      c.writes++;
      roots = [...heap.a];
      yield emit('Reinsert the combined subtree and repeat.', 5);
    }
    const root = heap.pop(),
      codes: Record<string, string> = {};
    function assign(n: HuffNode, prefix: string) {
      if (n.character !== null) codes[n.character] = prefix || '0';
      else {
        assign(n.left!, prefix + '0');
        assign(n.right!, prefix + '1');
      }
    }
    assign(root, '');
    const encoded = Array.from(text)
        .map((ch) => codes[ch])
        .join(''),
      f = emit(
        'Leaf paths form a prefix-free codebook; tree and codebook overhead are separate.',
        6,
        { payloadBits: encoded.length, fixedAsciiBits: 8 * text.length },
      );
    f.state.result = {
      codes,
      encoded,
      payloadBits: encoded.length,
      frequencies: Object.fromEntries(frequency),
    };
    yield f;
  },
};
