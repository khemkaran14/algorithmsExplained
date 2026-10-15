import 'server-only';
import type { QuizQuestion } from './load';
export const quizLoaders: Record<
  string,
  () => Promise<{ default: QuizQuestion[] }>
> = {
  'big-o': () => import('../../content/dsa/foundations/big-o/quiz'),
  'time-vs-space-complexity': () =>
    import('../../content/dsa/foundations/time-vs-space-complexity/quiz'),
  'recursion-basics': () =>
    import('../../content/dsa/foundations/recursion-basics/quiz'),
  'recursion-tree-call-stack': () =>
    import('../../content/dsa/foundations/recursion-tree-call-stack/quiz'),
  'master-theorem': () =>
    import('../../content/dsa/foundations/master-theorem/quiz'),
  'bit-manipulation-basics': () =>
    import('../../content/dsa/foundations/bit-manipulation-basics/quiz'),
  'two-pointers': () =>
    import('../../content/dsa/foundations/two-pointers/quiz'),
  'sliding-window': () =>
    import('../../content/dsa/foundations/sliding-window/quiz'),
  'prefix-sums': () => import('../../content/dsa/foundations/prefix-sums/quiz'),
  'arrays-dynamic-arrays': () =>
    import('../../content/dsa/linear/arrays-dynamic-arrays/quiz'),
  strings: () => import('../../content/dsa/linear/strings/quiz'),
  'singly-linked-list': () =>
    import('../../content/dsa/linear/singly-linked-list/quiz'),
  'doubly-linked-list': () =>
    import('../../content/dsa/linear/doubly-linked-list/quiz'),
  'circular-linked-list': () =>
    import('../../content/dsa/linear/circular-linked-list/quiz'),
  stack: () => import('../../content/dsa/linear/stack/quiz'),
  queue: () => import('../../content/dsa/linear/queue/quiz'),
  'circular-queue': () =>
    import('../../content/dsa/linear/circular-queue/quiz'),
  deque: () => import('../../content/dsa/linear/deque/quiz'),
  'monotonic-stack': () =>
    import('../../content/dsa/linear/monotonic-stack/quiz'),
  'monotonic-queue': () =>
    import('../../content/dsa/linear/monotonic-queue/quiz'),
  'hash-functions': () =>
    import('../../content/dsa/hashing/hash-functions/quiz'),
  'hash-table-with-chaining': () =>
    import('../../content/dsa/hashing/hash-table-with-chaining/quiz'),
  'open-addressing': () =>
    import('../../content/dsa/hashing/open-addressing/quiz'),
  'load-factor-rehashing': () =>
    import('../../content/dsa/hashing/load-factor-rehashing/quiz'),
  'bloom-filter': () => import('../../content/dsa/hashing/bloom-filter/quiz'),
  'consistent-hashing': () =>
    import('../../content/dsa/hashing/consistent-hashing/quiz'),
  'binary-tree-traversals': () =>
    import('../../content/dsa/trees/binary-tree-traversals/quiz'),
  'binary-search-tree': () =>
    import('../../content/dsa/trees/binary-search-tree/quiz'),
  'avl-tree': () => import('../../content/dsa/trees/avl-tree/quiz'),
  'red-black-tree': () => import('../../content/dsa/trees/red-black-tree/quiz'),
  'b-tree-b-tree': () => import('../../content/dsa/trees/b-tree-b-tree/quiz'),
  'heap-priority-queue': () =>
    import('../../content/dsa/trees/heap-priority-queue/quiz'),
  heapify: () => import('../../content/dsa/trees/heapify/quiz'),
  trie: () => import('../../content/dsa/trees/trie/quiz'),
  'segment-tree': () => import('../../content/dsa/trees/segment-tree/quiz'),
  'fenwick-tree': () => import('../../content/dsa/trees/fenwick-tree/quiz'),
  'lowest-common-ancestor': () =>
    import('../../content/dsa/trees/lowest-common-ancestor/quiz'),
  'tree-diameter': () => import('../../content/dsa/trees/tree-diameter/quiz'),
  'bubble-sort': () => import('../../content/dsa/sorting/bubble-sort/quiz'),
  'selection-sort': () =>
    import('../../content/dsa/sorting/selection-sort/quiz'),
  'insertion-sort': () =>
    import('../../content/dsa/sorting/insertion-sort/quiz'),
  'shell-sort': () => import('../../content/dsa/sorting/shell-sort/quiz'),
  'merge-sort': () => import('../../content/dsa/sorting/merge-sort/quiz'),
  'quick-sort': () => import('../../content/dsa/sorting/quick-sort/quiz'),
  'heap-sort': () => import('../../content/dsa/sorting/heap-sort/quiz'),
  'counting-sort': () => import('../../content/dsa/sorting/counting-sort/quiz'),
  'radix-sort': () => import('../../content/dsa/sorting/radix-sort/quiz'),
  'bucket-sort': () => import('../../content/dsa/sorting/bucket-sort/quiz'),
  'tim-sort-overview': () =>
    import('../../content/dsa/sorting/tim-sort-overview/quiz'),
  'stability-explained': () =>
    import('../../content/dsa/sorting/stability-explained/quiz'),
  'sorting-algorithm-race': () =>
    import('../../content/dsa/sorting/sorting-algorithm-race/quiz'),
  'linear-search': () =>
    import('../../content/dsa/searching/linear-search/quiz'),
  'binary-search': () =>
    import('../../content/dsa/searching/binary-search/quiz'),
  'binary-search-on-answer': () =>
    import('../../content/dsa/searching/binary-search-on-answer/quiz'),
  'lower-upper-bound': () =>
    import('../../content/dsa/searching/lower-upper-bound/quiz'),
  'ternary-search': () =>
    import('../../content/dsa/searching/ternary-search/quiz'),
  'exponential-search': () =>
    import('../../content/dsa/searching/exponential-search/quiz'),
  'interpolation-search': () =>
    import('../../content/dsa/searching/interpolation-search/quiz'),
  bfs: () => import('../../content/dsa/graphs/bfs/quiz'),
  'euclidean-gcd': () => import('../../content/dsa/math/euclidean-gcd/quiz'),
  'sieve-of-eratosthenes': () =>
    import('../../content/dsa/math/sieve-of-eratosthenes/quiz'),
  'primality-test': () => import('../../content/dsa/math/primality-test/quiz'),
  'fast-exponentiation': () =>
    import('../../content/dsa/math/fast-exponentiation/quiz'),
  'tower-of-hanoi': () => import('../../content/dsa/math/tower-of-hanoi/quiz'),
  'reservoir-sampling': () =>
    import('../../content/dsa/math/reservoir-sampling/quiz'),
  'k-means-clustering': () =>
    import('../../content/dsa/math/k-means-clustering/quiz'),
  pagerank: () => import('../../content/dsa/math/pagerank/quiz'),
  'lru-cache': () => import('../../content/dsa/math/lru-cache/quiz'),
  'lfu-cache': () => import('../../content/dsa/math/lfu-cache/quiz'),
};
