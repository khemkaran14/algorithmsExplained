import 'server-only';
import type { Visualizer } from '@/engine/types';
export const visualizerLoaders: Record<
  string,
  () => Promise<{ default: Visualizer<unknown> }>
> = {
  'big-o': () => import('../../content/dsa/foundations/big-o/visualizer'),
  'time-vs-space-complexity': () =>
    import('../../content/dsa/foundations/time-vs-space-complexity/visualizer'),
  'recursion-basics': () =>
    import('../../content/dsa/foundations/recursion-basics/visualizer'),
  'recursion-tree-call-stack': () =>
    import('../../content/dsa/foundations/recursion-tree-call-stack/visualizer'),
  'master-theorem': () =>
    import('../../content/dsa/foundations/master-theorem/visualizer'),
  'bit-manipulation-basics': () =>
    import('../../content/dsa/foundations/bit-manipulation-basics/visualizer'),
  'two-pointers': () =>
    import('../../content/dsa/foundations/two-pointers/visualizer'),
  'sliding-window': () =>
    import('../../content/dsa/foundations/sliding-window/visualizer'),
  'prefix-sums': () =>
    import('../../content/dsa/foundations/prefix-sums/visualizer'),
  'arrays-dynamic-arrays': () =>
    import('../../content/dsa/linear/arrays-dynamic-arrays/visualizer'),
  strings: () => import('../../content/dsa/linear/strings/visualizer'),
  'singly-linked-list': () =>
    import('../../content/dsa/linear/singly-linked-list/visualizer'),
  'doubly-linked-list': () =>
    import('../../content/dsa/linear/doubly-linked-list/visualizer'),
  'circular-linked-list': () =>
    import('../../content/dsa/linear/circular-linked-list/visualizer'),
  stack: () => import('../../content/dsa/linear/stack/visualizer'),
  queue: () => import('../../content/dsa/linear/queue/visualizer'),
  'circular-queue': () =>
    import('../../content/dsa/linear/circular-queue/visualizer'),
  deque: () => import('../../content/dsa/linear/deque/visualizer'),
  'monotonic-stack': () =>
    import('../../content/dsa/linear/monotonic-stack/visualizer'),
  'monotonic-queue': () =>
    import('../../content/dsa/linear/monotonic-queue/visualizer'),
  'hash-functions': () =>
    import('../../content/dsa/hashing/hash-functions/visualizer'),
  'hash-table-with-chaining': () =>
    import('../../content/dsa/hashing/hash-table-with-chaining/visualizer'),
  'open-addressing': () =>
    import('../../content/dsa/hashing/open-addressing/visualizer'),
  'load-factor-rehashing': () =>
    import('../../content/dsa/hashing/load-factor-rehashing/visualizer'),
  'bloom-filter': () =>
    import('../../content/dsa/hashing/bloom-filter/visualizer'),
  'consistent-hashing': () =>
    import('../../content/dsa/hashing/consistent-hashing/visualizer'),
  'binary-tree-traversals': () =>
    import('../../content/dsa/trees/binary-tree-traversals/visualizer'),
  'binary-search-tree': () =>
    import('../../content/dsa/trees/binary-search-tree/visualizer'),
  'avl-tree': () => import('../../content/dsa/trees/avl-tree/visualizer'),
  'red-black-tree': () =>
    import('../../content/dsa/trees/red-black-tree/visualizer'),
  'b-tree-b-tree': () =>
    import('../../content/dsa/trees/b-tree-b-tree/visualizer'),
  'heap-priority-queue': () =>
    import('../../content/dsa/trees/heap-priority-queue/visualizer'),
  heapify: () => import('../../content/dsa/trees/heapify/visualizer'),
  trie: () => import('../../content/dsa/trees/trie/visualizer'),
  'segment-tree': () =>
    import('../../content/dsa/trees/segment-tree/visualizer'),
  'fenwick-tree': () =>
    import('../../content/dsa/trees/fenwick-tree/visualizer'),
  'lowest-common-ancestor': () =>
    import('../../content/dsa/trees/lowest-common-ancestor/visualizer'),
  'tree-diameter': () =>
    import('../../content/dsa/trees/tree-diameter/visualizer'),
  'bubble-sort': () =>
    import('../../content/dsa/sorting/bubble-sort/visualizer'),
  'selection-sort': () =>
    import('../../content/dsa/sorting/selection-sort/visualizer'),
  'insertion-sort': () =>
    import('../../content/dsa/sorting/insertion-sort/visualizer'),
  'shell-sort': () => import('../../content/dsa/sorting/shell-sort/visualizer'),
  'merge-sort': () => import('../../content/dsa/sorting/merge-sort/visualizer'),
  'quick-sort': () => import('../../content/dsa/sorting/quick-sort/visualizer'),
  'heap-sort': () => import('../../content/dsa/sorting/heap-sort/visualizer'),
  'counting-sort': () =>
    import('../../content/dsa/sorting/counting-sort/visualizer'),
  'radix-sort': () => import('../../content/dsa/sorting/radix-sort/visualizer'),
  'bucket-sort': () =>
    import('../../content/dsa/sorting/bucket-sort/visualizer'),
  'tim-sort-overview': () =>
    import('../../content/dsa/sorting/tim-sort-overview/visualizer'),
  'stability-explained': () =>
    import('../../content/dsa/sorting/stability-explained/visualizer'),
  'sorting-algorithm-race': () =>
    import('../../content/dsa/sorting/sorting-algorithm-race/visualizer'),
  'linear-search': () =>
    import('../../content/dsa/searching/linear-search/visualizer'),
  'binary-search': () =>
    import('../../content/dsa/searching/binary-search/visualizer'),
  'binary-search-on-answer': () =>
    import('../../content/dsa/searching/binary-search-on-answer/visualizer'),
  'lower-upper-bound': () =>
    import('../../content/dsa/searching/lower-upper-bound/visualizer'),
  'ternary-search': () =>
    import('../../content/dsa/searching/ternary-search/visualizer'),
  'exponential-search': () =>
    import('../../content/dsa/searching/exponential-search/visualizer'),
  'interpolation-search': () =>
    import('../../content/dsa/searching/interpolation-search/visualizer'),
  'graph-representations': () =>
    import('../../content/dsa/graphs/graph-representations/visualizer'),
  bfs: () => import('../../content/dsa/graphs/bfs/visualizer'),
  dfs: () => import('../../content/dsa/graphs/dfs/visualizer'),
  'topological-sort': () =>
    import('../../content/dsa/graphs/topological-sort/visualizer'),
  'cycle-detection': () =>
    import('../../content/dsa/graphs/cycle-detection/visualizer'),
  'connected-components': () =>
    import('../../content/dsa/graphs/connected-components/visualizer'),
  'union-find': () => import('../../content/dsa/graphs/union-find/visualizer'),
  dijkstra: () => import('../../content/dsa/graphs/dijkstra/visualizer'),
  'bellman-ford': () =>
    import('../../content/dsa/graphs/bellman-ford/visualizer'),
  'floyd-warshall': () =>
    import('../../content/dsa/graphs/floyd-warshall/visualizer'),
  'a-star-search': () =>
    import('../../content/dsa/graphs/a-star-search/visualizer'),
  'prim-mst': () => import('../../content/dsa/graphs/prim-mst/visualizer'),
  'kruskal-mst': () =>
    import('../../content/dsa/graphs/kruskal-mst/visualizer'),
  'strongly-connected-components': () =>
    import('../../content/dsa/graphs/strongly-connected-components/visualizer'),
  'bipartite-check': () =>
    import('../../content/dsa/graphs/bipartite-check/visualizer'),
  'bridges-articulation-points': () =>
    import('../../content/dsa/graphs/bridges-articulation-points/visualizer'),
  'max-flow': () => import('../../content/dsa/graphs/max-flow/visualizer'),
  'greedy-algorithms': () =>
    import('../../content/dsa/paradigms/greedy-algorithms/visualizer'),
  'divide-conquer': () =>
    import('../../content/dsa/paradigms/divide-conquer/visualizer'),
  backtracking: () =>
    import('../../content/dsa/paradigms/backtracking/visualizer'),
  'dynamic-programming-intro': () =>
    import('../../content/dsa/paradigms/dynamic-programming-intro/visualizer'),
  'fibonacci-dp': () =>
    import('../../content/dsa/paradigms/fibonacci-dp/visualizer'),
  '0-1-knapsack': () =>
    import('../../content/dsa/paradigms/0-1-knapsack/visualizer'),
  'longest-common-subsequence': () =>
    import('../../content/dsa/paradigms/longest-common-subsequence/visualizer'),
  'longest-increasing-subsequence': () =>
    import('../../content/dsa/paradigms/longest-increasing-subsequence/visualizer'),
  'edit-distance': () =>
    import('../../content/dsa/paradigms/edit-distance/visualizer'),
  'coin-change': () =>
    import('../../content/dsa/paradigms/coin-change/visualizer'),
  'matrix-chain-multiplication': () =>
    import('../../content/dsa/paradigms/matrix-chain-multiplication/visualizer'),
  'dp-on-grids': () =>
    import('../../content/dsa/paradigms/dp-on-grids/visualizer'),
  'dp-on-trees': () =>
    import('../../content/dsa/paradigms/dp-on-trees/visualizer'),
  'naive-string-matching': () =>
    import('../../content/dsa/strings/naive-string-matching/visualizer'),
  kmp: () => import('../../content/dsa/strings/kmp/visualizer'),
  'rabin-karp': () => import('../../content/dsa/strings/rabin-karp/visualizer'),
  'z-algorithm': () =>
    import('../../content/dsa/strings/z-algorithm/visualizer'),
  'manacher-overview': () =>
    import('../../content/dsa/strings/manacher-overview/visualizer'),
  'huffman-coding': () =>
    import('../../content/dsa/strings/huffman-coding/visualizer'),
  'run-length-encoding': () =>
    import('../../content/dsa/strings/run-length-encoding/visualizer'),
  'euclidean-gcd': () =>
    import('../../content/dsa/math/euclidean-gcd/visualizer'),
  'sieve-of-eratosthenes': () =>
    import('../../content/dsa/math/sieve-of-eratosthenes/visualizer'),
  'primality-test': () =>
    import('../../content/dsa/math/primality-test/visualizer'),
  'fast-exponentiation': () =>
    import('../../content/dsa/math/fast-exponentiation/visualizer'),
  'tower-of-hanoi': () =>
    import('../../content/dsa/math/tower-of-hanoi/visualizer'),
  'reservoir-sampling': () =>
    import('../../content/dsa/math/reservoir-sampling/visualizer'),
  'k-means-clustering': () =>
    import('../../content/dsa/math/k-means-clustering/visualizer'),
  pagerank: () => import('../../content/dsa/math/pagerank/visualizer'),
  'lru-cache': () => import('../../content/dsa/math/lru-cache/visualizer'),
  'lfu-cache': () => import('../../content/dsa/math/lfu-cache/visualizer'),
  'cryptographic-hash-functions': () =>
    import('../../content/dsa/security/cryptographic-hash-functions/visualizer'),
  'symmetric-encryption': () =>
    import('../../content/dsa/security/symmetric-encryption/visualizer'),
  'public-key-cryptography': () =>
    import('../../content/dsa/security/public-key-cryptography/visualizer'),
  'diffie-hellman-key-exchange': () =>
    import('../../content/dsa/security/diffie-hellman-key-exchange/visualizer'),
  'digital-signatures': () =>
    import('../../content/dsa/security/digital-signatures/visualizer'),
  'digital-certificates-tls': () =>
    import('../../content/dsa/security/digital-certificates-tls/visualizer'),
  'password-hashing-salting': () =>
    import('../../content/dsa/security/password-hashing-salting/visualizer'),
};
