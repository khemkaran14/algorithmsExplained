import { it, expect, describe } from 'vitest';
import {
  matcher,
  rle,
  manacher,
  huffman,
} from '@/server/visualizers/string-algorithms';
import type { Visualizer } from '@/engine/types';
const all = [
  matcher('naive'),
  matcher('kmp'),
  matcher('rabin-karp'),
  matcher('z'),
  rle,
  manacher,
  huffman,
] as Visualizer<unknown>[];
describe.each(all)('$id', (v) =>
  it('produces deterministic immutable serializable preset traces', () => {
    for (const raw of [
      v.presets.best,
      v.presets.average,
      v.presets.worst,
      v.presets.random(8, 42),
    ]) {
      const input = v.validateInput(raw),
        before = structuredClone(input),
        frames = [...v.generate(input)];
      expect(frames.length).toBeGreaterThan(1);
      expect(frames).toEqual([...v.generate(input)]);
      expect(input).toEqual(before);
      expect(JSON.parse(JSON.stringify(frames))).toEqual(frames);
    }
  }),
);
it.each(['naive', 'kmp', 'rabin-karp', 'z'] as const)(
  '%s finds all exact overlapping matches and boundary cases',
  (kind) => {
    for (const [text, pattern] of [
      ['aaaaa', 'aa'],
      ['', 'a'],
      ['a', 'aa'],
      ['ababa', 'aba'],
      ['hello', 'x'],
      ['a b a b', 'a b'],
      ['aaabaaaab', 'aaab'],
    ]) {
      const expected = Array.from(
        { length: Math.max(0, text.length - pattern.length + 1) },
        (_, i) => i,
      ).filter((i) => text.slice(i, i + pattern.length) === pattern);
      expect(
        [...matcher(kind).generate({ text, pattern })].at(-1)!.state.result,
      ).toMatchObject({ matches: expected });
    }
  },
);
it('all matching methods agree with exact substring comparison on seeded inputs', () => {
  for (let seed = 1; seed <= 40; seed++) {
    const text = matcher('naive').presets.random(32, seed).text,
      pattern = text.slice(seed % 25, (seed % 25) + 3),
      expected = Array.from({ length: 30 }, (_, i) => i).filter(
        (i) => text.slice(i, i + 3) === pattern,
      );
    for (const kind of ['naive', 'kmp', 'rabin-karp', 'z'] as const)
      expect(
        [...matcher(kind).generate({ text, pattern })].at(-1)!.state.result,
      ).toMatchObject({ matches: expected });
  }
});
it('KMP retains the correct failure function for repeated prefixes', () => {
  expect(
    [...matcher('kmp').generate({ text: 'abababaca', pattern: 'ababaca' })].at(
      -1,
    )!.state.result,
  ).toEqual({ matches: [2], prefix: [0, 0, 1, 2, 3, 0, 1] });
});
it('Manacher agrees with exhaustive palindromes for odd/even and repeated centers', () => {
  for (const text of [
    'a',
    'abba',
    'abacaba',
    'abcdef',
    'aaaaaa',
    ...Array.from({ length: 30 }, (_, i) => rle.presets.random(20, i)),
  ]) {
    let longest = 0;
    for (let i = 0; i < text.length; i++)
      for (let j = i + 1; j <= text.length; j++) {
        const sub = text.slice(i, j);
        if (sub === [...sub].reverse().join(''))
          longest = Math.max(longest, j - i);
      }
    const r = [...manacher.generate(text)].at(-1)!.state.result as {
      substring: string;
      start: number;
      length: number;
    };
    expect(r.length).toBe(longest);
    expect(r.substring).toBe(text.slice(r.start, r.start + r.length));
    expect(r.substring).toBe([...r.substring].reverse().join(''));
  }
});
it('RLE preserves adjacent run boundaries and round-trips digit characters', () => {
  expect([...rle.generate('111aa1')].at(-1)!.state.result).toEqual({
    runs: [
      ['1', 3],
      ['a', 2],
      ['1', 1],
    ],
    decoded: '111aa1',
  });
});
it('Huffman codes are prefix-free, decode exactly and have optimal weighted merge cost', () => {
  for (const text of ['a', 'aaaa', 'abracadabra', 'abcdef', 'hello world']) {
    const result = [...huffman.generate(text)].at(-1)!.state.result as {
      codes: Record<string, string>;
      encoded: string;
      payloadBits: number;
      frequencies: Record<string, number>;
    };
    const entries = Object.entries(result.codes);
    for (const [a, ac] of entries)
      for (const [b, bc] of entries)
        if (a !== b) expect(ac.startsWith(bc)).toBe(false);
    let buffer = '',
      decoded = '';
    for (const bit of result.encoded) {
      buffer += bit;
      const entry = entries.find(([, code]) => code === buffer);
      if (entry) {
        decoded += entry[0];
        buffer = '';
      }
    }
    expect(decoded).toBe(text);
    expect(buffer).toBe('');
    const weights = Object.values(result.frequencies);
    let optimal = weights.length === 1 ? text.length : 0;
    while (weights.length > 1) {
      weights.sort((a, b) => a - b);
      const sum = weights.shift()! + weights.shift()!;
      optimal += sum;
      weights.push(sum);
    }
    expect(result.payloadBits).toBe(optimal);
  }
});
it('rejects ambiguous empty patterns and out-of-model Unicode inputs', () => {
  expect(() =>
    matcher('kmp').validateInput({ text: 'a', pattern: '' }),
  ).toThrow();
  expect(() => rle.validateInput('🙂')).toThrow();
});
