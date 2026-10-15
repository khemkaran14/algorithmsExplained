import 'server-only';
import { z } from 'zod';
import type {
  Visualizer,
  Frame,
  VisualState,
  ComplexityInfo,
} from '@/engine/types';
import {
  arrayPresets,
  counters,
  frame,
  validateNumbers,
  randomNumbers,
} from '@/engine/helpers';
const profiles: Record<string, ComplexityInfo> = {
  'arrays-dynamic-arrays': {
    best: 'O(1) append',
    average: 'O(1) amortized append',
    worst: 'O(n) resize',
    space: 'O(n)',
    why: 'Doubling capacity copies old values only at geometric thresholds. The total copying across n appends is less than 2n.',
  },
  queue: {
    best: 'O(1) enqueue/dequeue',
    average: 'O(1) enqueue/dequeue',
    worst: 'O(1) enqueue/dequeue',
    space: 'O(n)',
    why: 'A linked queue changes only its head and tail links; values leave in their arrival order.',
  },
  deque: {
    best: 'O(1) end operation',
    average: 'O(1) end operation',
    worst: 'O(1) end operation',
    space: 'O(n)',
    why: 'A doubly linked deque has direct access to both ends and their neighboring links.',
  },
  'monotonic-stack': {
    best: 'O(n) whole pass',
    average: 'O(n) whole pass',
    worst: 'O(n) whole pass',
    space: 'O(n)',
    why: 'Each index enters the stack once and can leave it only once, even when one incoming value triggers many pops.',
  },
  'circular-queue': {
    best: 'O(1) enqueue/dequeue',
    average: 'O(1) enqueue/dequeue',
    worst: 'O(1) enqueue/dequeue',
    space: 'O(k) capacity',
    why: 'Head and tail wrap modulo a fixed capacity. A separate size distinguishes full from empty when indices coincide.',
  },
  'monotonic-queue': {
    best: 'O(n) whole pass',
    average: 'O(n) whole pass',
    worst: 'O(n) whole pass',
    space: 'O(k) window',
    why: 'Every index is inserted once and removed from at most one end. Expired indices leave the front.',
  },
};
export function sequenceVisualizer(id: string): Visualizer {
  const complexity = profiles[id];
  if (!complexity || ['circular-queue', 'monotonic-queue'].includes(id))
    throw new Error('Unknown sequence');
  return {
    id,
    complexity,
    presets: arrayPresets(),
    validateInput: validateNumbers,
    *generate(input) {
      const c = counters();
      if (id === 'arrays-dynamic-arrays') {
        let capacity = 1,
          length = 0,
          slots: (number | null)[] = [null];
        const emit = (
          text: string,
          line: number,
          vars: Frame['variables'] = {},
          marks: Frame['highlights'] = [],
          action?: Frame['action'],
        ) =>
          frame(
            {
              kind: 'boxes',
              values: slots.map((v) => v ?? 0),
              labels: slots.map((v) => (v === null ? '∅' : String(v))),
            },
            text,
            c,
            line,
            { capacity, length, ...vars },
            marks,
            action,
          );
        yield emit('The dynamic array starts with one empty slot.', 1);
        for (const value of input) {
          yield emit(
            'Check whether the next append fits in the current buffer.',
            2,
            { value },
            [],
            {
              prompt: 'What must happen before this append?',
              choices: ['Write into free space', 'Grow the buffer'],
              answer:
                length === capacity
                  ? 'Grow the buffer'
                  : 'Write into free space',
              hint: 'A full buffer must grow before a new value can be stored.',
            },
          );
          if (length === capacity) {
            const old = slots;
            capacity *= 2;
            slots = Array(capacity).fill(null) as (number | null)[];
            yield emit('Allocate a buffer with twice the capacity.', 3);
            for (let i = 0; i < length; i++) {
              slots[i] = old[i];
              c.reads++;
              c.writes++;
              yield emit(
                `Copy old value ${old[i]} into the larger buffer.`,
                4,
                { i },
                [{ id: String(i), kind: 'moving' }],
              );
            }
          }
          slots[length] = value;
          c.writes++;
          length++;
          yield emit(
            `Append ${value} without shifting earlier values.`,
            5,
            { value },
            [{ id: String(length - 1), kind: 'done' }],
          );
        }
        const final = emit(
          'All appends are complete; spare capacity is deliberate.',
          6,
        );
        final.state.result = [...input];
        yield final;
        return;
      }
      if (id === 'monotonic-stack') {
        const indices: number[] = [],
          result = Array(input.length).fill(null) as (number | null)[];
        const emit = (
          text: string,
          line: number,
          vars: Frame['variables'] = {},
          marks: Frame['highlights'] = [],
          action?: Frame['action'],
        ) =>
          frame(
            {
              kind: 'grid',
              values: indices.map((i) => input[i]),
              rows: [
                [...input],
                result.map((v) => v ?? 0),
                indices.map((i) => input[i]),
              ],
              cellLabels: [
                input.map(String),
                result.map((v) => (v === null ? '∅' : String(v))),
                indices.map((i) => String(input[i])),
              ],
              labels: ['input', 'next >', 'stack'],
            },
            text,
            c,
            line,
            vars,
            marks,
            action,
          );
        yield emit(
          'Keep indices whose next greater value is still unknown.',
          1,
        );
        for (let i = 0; i < input.length; i++) {
          while (indices.length) {
            const top = indices.at(-1)!;
            c.comparisons++;
            c.reads += 2;
            yield emit(
              'Compare the unresolved top with the incoming value.',
              3,
              { i, top, value: input[i] },
              [
                { id: `0,${i}`, kind: 'comparing' },
                { id: `0,${top}`, kind: 'comparing' },
              ],
              {
                prompt: 'Does this value resolve the top’s next-greater query?',
                choices: ['Pop', 'Keep'],
                answer: input[top] < input[i] ? 'Pop' : 'Keep',
                hint: 'Pop only when the incoming value is strictly greater.',
              },
            );
            if (input[top] >= input[i]) break;
            indices.pop();
            result[top] = input[i];
            c.reads++;
            c.writes += 2;
            yield emit(
              `The next greater value after ${input[top]} is ${input[i]}.`,
              4,
              { i, top },
              [{ id: `1,${top}`, kind: 'done' }],
            );
          }
          indices.push(i);
          c.writes++;
          yield emit('Push the incoming index as an unresolved candidate.', 5, {
            i,
          });
        }
        const f = emit(
          'Remaining candidates have no greater value to their right.',
          6,
        );
        f.state.result = result;
        yield f;
        return;
      }
      type Link = {
        value: number;
        id: string;
        next: Link | null;
        prev: Link | null;
      };
      let head: Link | null = null,
        tail: Link | null = null;
      const output: number[] = [];
      const emit = (
        text: string,
        line: number,
        vars: Frame['variables'] = {},
        marks: Frame['highlights'] = [],
        action?: Frame['action'],
      ) => {
        const values: number[] = [];
        for (let p = head; p; p = p.next) values.push(p.value);
        return frame(
          { kind: 'queue', values },
          text,
          c,
          line,
          { head: head?.value ?? null, tail: tail?.value ?? null, ...vars },
          marks,
          action,
        );
      };
      yield emit('Both ends begin empty.', 1);
      for (let i = 0; i < input.length; i++) {
        const front = id === 'deque' && i % 2 === 0,
          value = input[i];
        yield emit(
          front
            ? 'Push the next value at the front.'
            : 'Push the next value at the back.',
          2,
          { value },
          [],
          {
            prompt: 'Which end changes for this command?',
            choices: ['Front', 'Back'],
            answer: front ? 'Front' : 'Back',
            hint: front
              ? 'A front insertion becomes the new head.'
              : 'A back insertion becomes the new tail.',
          },
        );
        const node: Link = { id: String(i), value, next: null, prev: null };
        if (!head) {
          head = tail = node;
          c.writes += 2;
        } else if (front) {
          node.next = head;
          head.prev = node;
          head = node;
          c.writes += 3;
        } else {
          node.prev = tail;
          tail!.next = node;
          tail = node;
          c.writes += 3;
        }
        yield emit('Update only the neighboring links and end pointer.', 4);
      }
      let iteration = 0;
      while (head) {
        const front = id === 'queue' || iteration % 2 === 0;
        const value = front ? head.value : tail!.value;
        yield emit(
          front ? 'Remove the front value.' : 'Remove the back value.',
          3,
          { command: front ? 'popFront' : 'popBack' },
          [],
          {
            prompt: 'Which value leaves for this command?',
            choices: [...new Set([head.value, tail!.value])].map(String),
            answer: String(value),
            hint: 'Read the selected end, not the opposite end.',
          },
        );
        output.push(value);
        c.reads++;
        if (head === tail) {
          head = tail = null;
          c.writes += 2;
        } else if (front) {
          head = head.next;
          head!.prev = null;
          c.writes += 2;
        } else {
          tail = tail!.prev;
          tail!.next = null;
          c.writes += 2;
        }
        yield emit(`${value} left the structure.`, 5);
        iteration++;
      }
      const f = emit('The structure is empty after all removals.', 6);
      f.state.result = output;
      yield f;
    },
  };
}

type Node = { id: string; value: number; next: Node | null; prev: Node | null };
export function linkedListVisualizer(
  mode: 'singly' | 'doubly' | 'circular',
): Visualizer {
  const id = `${mode}-linked-list`;
  return {
    id,
    presets: arrayPresets(),
    validateInput: validateNumbers,
    complexity: {
      best: 'O(1) with a known link',
      average: 'O(n) search',
      worst: 'O(n) search',
      space: 'O(n)',
      why:
        mode === 'doubly'
          ? 'Each node stores both neighbors. Given a node, deletion updates a constant number of links; finding it can still take a linear scan.'
          : mode === 'circular'
            ? 'The last next link points to the head, so traversal must detect a completed cycle. Tail insertion is constant time; key lookup is linear.'
            : 'A next pointer links each node. Appending with a tail pointer is constant time; finding a value or its predecessor is linear.',
    },
    *generate(input) {
      const c = counters();
      let head: Node | null = null,
        tail: Node | null = null;
      function emit(
        text: string,
        line: number,
        vars: Frame['variables'] = {},
        marks: Frame['highlights'] = [],
        action?: Frame['action'],
      ) {
        const nodes: NonNullable<VisualState['nodes']> = [],
          edges: NonNullable<VisualState['edges']> = [],
          values: number[] = [];
        const seen = new Set<string>();
        for (let p = head; p && !seen.has(p.id); p = p.next) {
          seen.add(p.id);
          values.push(p.value);
          nodes.push({
            id: p.id,
            label: String(p.value),
            x: 40 + (nodes.length % 4) * 85,
            y: 40 + Math.floor(nodes.length / 4) * 75,
          });
          if (p.next) edges.push({ from: p.id, to: p.next.id, label: 'next' });
          if (mode === 'doubly' && p.prev)
            edges.push({ from: p.id, to: p.prev.id, label: 'prev' });
        }
        return frame(
          { kind: 'linked-list', values, nodes, edges },
          text,
          c,
          line,
          { head: head?.id ?? null, tail: tail?.id ?? null, ...vars },
          marks,
          action,
        );
      }
      yield emit('Head and tail are empty before the first insertion.', 1);
      for (let i = 0; i < input.length; i++) {
        const node: Node = {
          id: String(i),
          value: input[i],
          next: mode === 'circular' ? head : null,
          prev: mode === 'doubly' ? tail : null,
        };
        if (!head) {
          head = tail = node;
          if (mode === 'circular') node.next = node;
          c.writes += 2;
        } else {
          tail!.next = node;
          tail = node;
          c.writes += 2;
          if (mode === 'circular') tail.next = head;
        }
        yield emit(
          `Append node ${node.value} and update the tail link.`,
          2,
          { value: node.value },
          [{ id: node.id, kind: 'moving' }],
        );
      }
      const target = input[Math.floor(input.length / 2)];
      let current: Node | null = head,
        previous: Node | null = mode === 'circular' ? tail : null;
      const seen = new Set<string>();
      while (current && !seen.has(current.id)) {
        seen.add(current.id);
        c.reads++;
        c.comparisons++;
        yield emit(
          `Compare node ${current.value} with target ${target}.`,
          3,
          { target, current: current.id },
          [{ id: current.id, kind: 'comparing' }],
          {
            prompt: 'Is this the first matching node?',
            choices: ['Match', 'Continue'],
            answer: current.value === target ? 'Match' : 'Continue',
            hint: 'Compare keys; duplicate values do not share node identities.',
          },
        );
        if (current.value === target) break;
        previous = current;
        current = current.next;
      }
      if (current && current.value === target) {
        if (current === head && current === tail) {
          head = tail = null;
          c.writes += 2;
        } else {
          const prev = mode === 'doubly' ? current.prev : previous;
          if (prev) prev.next = current.next;
          if (current === head) head = current.next;
          if (current === tail) tail = prev;
          if (mode === 'doubly' && current.next) current.next.prev = prev;
          if (mode === 'circular' && tail) tail.next = head;
          c.writes += 3;
        }
        yield emit(
          'Bypass the matching node and repair any affected end links.',
          4,
          { target },
        );
        current.next = current.prev = null;
        yield emit('The removed node no longer belongs to the list.', 5, {
          target,
        });
      }
      const f = emit('Traversal follows only the remaining links.', 6, {
        target,
      });
      f.state.result = [...f.state.values];
      yield f;
    },
  };
}
const circularSchema = z.object({
  values: z.array(z.number().int().min(-999).max(999)).min(1).max(64),
  capacity: z.number().int().min(1).max(16),
});
export function circularQueueVisualizer(): Visualizer<
  z.infer<typeof circularSchema>
> {
  return {
    id: 'circular-queue',
    complexity: profiles['circular-queue'],
    maxSize: 16,
    inputHint:
      'Enter {"values":[1,2,3,4,5,6],"capacity":3}. A full buffer dequeues before accepting the next demo value.',
    presets: {
      best: { values: [1], capacity: 4 },
      average: { values: [1, 2, 3, 4, 5, 6], capacity: 3 },
      worst: { values: [1, 2, 3, 4, 5, 6, 7, 8], capacity: 2 },
      random: (n, s) => ({
        values: randomNumbers(n, s),
        capacity: Math.max(1, Math.min(4, n)),
      }),
    },
    validateInput(raw) {
      const p = circularSchema.safeParse(raw);
      if (!p.success)
        throw new Error(
          'Use up to 64 integers and a capacity between 1 and 16.',
        );
      return p.data;
    },
    *generate({ values, capacity }) {
      const c = counters(),
        buffer: (number | null)[] = Array(capacity).fill(null) as (
          number | null
        )[];
      let head = 0,
        tail = 0,
        size = 0;
      const emit = (text: string, line: number, action?: Frame['action']) =>
        frame(
          {
            kind: 'boxes',
            values: buffer.map((v) => v ?? 0),
            labels: buffer.map(
              (v, i) =>
                `${v === null ? '∅' : v}${i === head ? ' H' : ''}${i === tail ? ' T' : ''}`,
            ),
          },
          text,
          c,
          line,
          { head, tail, size, capacity },
          [],
          action,
        );
      yield emit('Size distinguishes an empty buffer from a full one.', 1);
      for (const value of values) {
        yield emit('Check capacity before enqueuing the next value.', 2, {
          prompt: 'What does this buffer need next?',
          choices: ['Enqueue', 'Dequeue first'],
          answer: size === capacity ? 'Dequeue first' : 'Enqueue',
          hint: 'Never overwrite an unread slot when size equals capacity.',
        });
        if (size === capacity) {
          const removed = buffer[head];
          buffer[head] = null;
          head = (head + 1) % capacity;
          size--;
          c.reads++;
          c.writes++;
          yield emit(
            `Dequeue ${removed} and wrap the head modulo capacity.`,
            3,
          );
        }
        buffer[tail] = value;
        tail = (tail + 1) % capacity;
        size++;
        c.writes++;
        yield emit(`Enqueue ${value} and wrap the tail modulo capacity.`, 5);
      }
      const f = emit(
        'The logical queue starts at head, even after wraparound.',
        6,
      );
      f.state.result = Array.from(
        { length: size },
        (_, i) => buffer[(head + i) % capacity]!,
      );
      yield f;
    },
  };
}
const windowSchema = z.object({
  values: z.array(z.number().int().min(-999).max(999)).min(1).max(64),
  window: z.number().int().min(1).max(64),
});
export function monotonicQueueVisualizer(): Visualizer<
  z.infer<typeof windowSchema>
> {
  return {
    id: 'monotonic-queue',
    complexity: profiles['monotonic-queue'],
    inputHint: 'Enter {"values":[1,3,-1,-3,5,3,6,7],"window":3}.',
    presets: {
      best: { values: [6, 5, 4, 3, 2, 1], window: 3 },
      average: { values: [1, 3, -1, -3, 5, 3, 6, 7], window: 3 },
      worst: { values: [6, 5, 4, 3, 2, 99], window: 5 },
      random: (n, s) => ({
        values: randomNumbers(n, s),
        window: Math.min(3, n),
      }),
    },
    validateInput(raw) {
      const p = windowSchema.safeParse(raw);
      if (!p.success || p.data.window > p.data.values.length)
        throw new Error(
          'The window must be between 1 and the number of values.',
        );
      return p.data;
    },
    *generate({ values, window }) {
      const q: number[] = [],
        result: number[] = [],
        c = counters();
      let head = 0;
      const emit = (
        text: string,
        line: number,
        vars: Frame['variables'] = {},
        action?: Frame['action'],
      ) =>
        frame(
          {
            kind: 'grid',
            values: q.slice(head).map((i) => values[i]),
            rows: [
              [...values],
              q.slice(head).map((i) => values[i]),
              [...result],
            ],
            labels: ['input', 'deque', 'max'],
          },
          text,
          c,
          line,
          { window, ...vars },
          [],
          action,
        );
      yield emit('Keep useful candidate indices in decreasing value order.', 1);
      for (let i = 0; i < values.length; i++) {
        while (head < q.length && q[head] <= i - window) {
          head++;
          c.reads++;
          c.writes++;
          yield emit('Expire an index that left the window.', 2, { i });
        }
        while (head < q.length) {
          const last = q.at(-1)!;
          c.reads += 2;
          c.comparisons++;
          yield emit(
            'Compare the incoming value with the back candidate.',
            3,
            { i, last },
            {
              prompt: 'Can the back candidate ever win a later window?',
              choices: ['Discard it', 'Keep it'],
              answer: values[last] <= values[i] ? 'Discard it' : 'Keep it',
              hint: 'A newer value at least as large dominates an older candidate.',
            },
          );
          if (values[last] > values[i]) break;
          q.pop();
          c.writes++;
          yield emit('Remove the dominated back candidate.', 4, { i });
        }
        if (head > 0 && head * 2 >= q.length) {
          const active = q.slice(head);
          c.reads += active.length;
          c.writes += active.length;
          q.splice(0, q.length, ...active);
          head = 0;
        }
        q.push(i);
        c.writes++;
        if (i >= window - 1) {
          result.push(values[q[head]]);
          c.reads++;
          c.writes++;
          yield emit('The front candidate is the current window maximum.', 5, {
            i,
            maximum: values[q[head]],
          });
        }
      }
      const f = emit('Each index entered once and left at most once.', 6);
      f.state.result = result;
      yield f;
    },
  };
}
export const stringVisualizer: Visualizer<string> = {
  id: 'strings',
  maxSize: 64,
  inputHint:
    'Enter a JSON string, for example "café😀". Labels are Unicode code points, not grapheme clusters.',
  presets: {
    best: 'A',
    average: 'café😀',
    worst: 'A😀e\u0301👩\u200d💻',
    random: (n, s) =>
      randomNumbers(n, s)
        .map((v) => String.fromCharCode(65 + (v % 26)))
        .join(''),
  },
  validateInput(raw) {
    if (
      typeof raw !== 'string' ||
      !raw.isWellFormed() ||
      Array.from(raw).length < 1 ||
      Array.from(raw).length > 64
    )
      throw new Error('Use a string containing 1–64 Unicode code points.');
    return raw;
  },
  complexity: {
    best: 'O(n) code-point traversal',
    average: 'O(n)',
    worst: 'O(n)',
    space: 'O(n) materialized code points',
    why: 'A full traversal reads each code point once. UTF-16 code-unit length and user-perceived grapheme count can differ.',
  },
  *generate(input) {
    const chars = Array.from(input),
      c = counters(),
      values = chars.map((ch) => ch.codePointAt(0)!);
    let prefix = '';
    yield frame(
      { kind: 'string', values, labels: chars },
      'Unicode code points do not always equal UTF-16 code units.',
      c,
      1,
      { utf16Units: input.length, codePoints: chars.length },
    );
    for (let i = 0; i < chars.length; i++) {
      c.reads++;
      yield frame(
        { kind: 'string', values, labels: chars },
        `Read Unicode code point U+${values[i].toString(16).toUpperCase()}.`,
        c,
        3,
        { i, utf16Units: chars[i].length, prefix },
        [{ id: String(i), kind: 'comparing' }],
        {
          prompt: 'Can a visible character use more than one code unit?',
          choices: ['Yes', 'No'],
          answer: 'Yes',
          hint: 'Emoji may use surrogate pairs, and a grapheme can contain multiple code points.',
        },
      );
      prefix += chars[i];
      c.writes++;
      yield frame(
        { kind: 'string', values, labels: chars },
        'Append the next code point to the demonstrated prefix.',
        c,
        5,
        { i, prefix },
      );
    }
    yield frame(
      { kind: 'string', values, labels: chars, result: prefix },
      'Code-point traversal preserves the original string.',
      c,
      6,
      { utf16Units: input.length, codePoints: chars.length },
    );
  },
};
