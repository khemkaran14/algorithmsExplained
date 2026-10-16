import 'server-only';
/** Amortized O(1) FIFO removal; compaction bounds retained array storage. */
export class Fifo<T> {
  private items: T[] = [];
  private head = 0;
  get length() {
    return this.items.length - this.head;
  }
  push(value: T) {
    this.items.push(value);
  }
  shift(): T | undefined {
    if (!this.length) return undefined;
    const value = this.items[this.head++];
    if (this.head >= 64 && this.head * 2 >= this.items.length) {
      this.items = this.items.slice(this.head);
      this.head = 0;
    }
    return value;
  }
}
