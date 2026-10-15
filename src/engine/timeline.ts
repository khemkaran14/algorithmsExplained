import type { Frame, Visualizer } from './types';
// Sample snapshots are bounded. Missing frames are deterministically recomputed,
// so backwards scrubbing never mutates algorithm state or keeps an unbounded log.
export class Timeline {
  readonly length: number;
  private cache = new Map<number, Frame>();
  constructor(
    private visualizer: Visualizer,
    private input: number[],
    private capacity = 256,
  ) {
    let count = 0;
    for (const f of visualizer.generate(input)) {
      if (count < capacity) this.cache.set(count, f);
      count++;
      if (count > 30000)
        throw new Error(
          'This input produces too many steps. Try a smaller size.',
        );
    }
    this.length = count;
    if (!count) throw new Error('The visualizer produced no frames.');
  }
  get(index: number): Frame {
    const target = Math.max(0, Math.min(this.length - 1, index));
    const cached = this.cache.get(target);
    if (cached) return structuredClone(cached);
    let i = 0;
    for (const f of this.visualizer.generate(this.input)) {
      if (i++ === target) {
        if (this.cache.size >= this.capacity)
          this.cache.delete(this.cache.keys().next().value!);
        this.cache.set(target, f);
        return structuredClone(f);
      }
    }
    throw new Error('Frame not found');
  }
}
