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
  'graph-representations': () =>
    import('../../content/dsa/graphs/graph-representations/quiz'),
  bfs: () => import('../../content/dsa/graphs/bfs/quiz'),
  dfs: () => import('../../content/dsa/graphs/dfs/quiz'),
  'topological-sort': () =>
    import('../../content/dsa/graphs/topological-sort/quiz'),
  'cycle-detection': () =>
    import('../../content/dsa/graphs/cycle-detection/quiz'),
  'connected-components': () =>
    import('../../content/dsa/graphs/connected-components/quiz'),
  'union-find': () => import('../../content/dsa/graphs/union-find/quiz'),
  dijkstra: () => import('../../content/dsa/graphs/dijkstra/quiz'),
  'bellman-ford': () => import('../../content/dsa/graphs/bellman-ford/quiz'),
  'floyd-warshall': () =>
    import('../../content/dsa/graphs/floyd-warshall/quiz'),
  'a-star-search': () => import('../../content/dsa/graphs/a-star-search/quiz'),
  'prim-mst': () => import('../../content/dsa/graphs/prim-mst/quiz'),
  'kruskal-mst': () => import('../../content/dsa/graphs/kruskal-mst/quiz'),
  'strongly-connected-components': () =>
    import('../../content/dsa/graphs/strongly-connected-components/quiz'),
  'bipartite-check': () =>
    import('../../content/dsa/graphs/bipartite-check/quiz'),
  'bridges-articulation-points': () =>
    import('../../content/dsa/graphs/bridges-articulation-points/quiz'),
  'max-flow': () => import('../../content/dsa/graphs/max-flow/quiz'),
  'greedy-algorithms': () =>
    import('../../content/dsa/paradigms/greedy-algorithms/quiz'),
  'divide-conquer': () =>
    import('../../content/dsa/paradigms/divide-conquer/quiz'),
  backtracking: () => import('../../content/dsa/paradigms/backtracking/quiz'),
  'dynamic-programming-intro': () =>
    import('../../content/dsa/paradigms/dynamic-programming-intro/quiz'),
  'fibonacci-dp': () => import('../../content/dsa/paradigms/fibonacci-dp/quiz'),
  '0-1-knapsack': () => import('../../content/dsa/paradigms/0-1-knapsack/quiz'),
  'longest-common-subsequence': () =>
    import('../../content/dsa/paradigms/longest-common-subsequence/quiz'),
  'longest-increasing-subsequence': () =>
    import('../../content/dsa/paradigms/longest-increasing-subsequence/quiz'),
  'edit-distance': () =>
    import('../../content/dsa/paradigms/edit-distance/quiz'),
  'coin-change': () => import('../../content/dsa/paradigms/coin-change/quiz'),
  'matrix-chain-multiplication': () =>
    import('../../content/dsa/paradigms/matrix-chain-multiplication/quiz'),
  'dp-on-grids': () => import('../../content/dsa/paradigms/dp-on-grids/quiz'),
  'dp-on-trees': () => import('../../content/dsa/paradigms/dp-on-trees/quiz'),
  'naive-string-matching': () =>
    import('../../content/dsa/strings/naive-string-matching/quiz'),
  kmp: () => import('../../content/dsa/strings/kmp/quiz'),
  'rabin-karp': () => import('../../content/dsa/strings/rabin-karp/quiz'),
  'z-algorithm': () => import('../../content/dsa/strings/z-algorithm/quiz'),
  'manacher-overview': () =>
    import('../../content/dsa/strings/manacher-overview/quiz'),
  'huffman-coding': () =>
    import('../../content/dsa/strings/huffman-coding/quiz'),
  'run-length-encoding': () =>
    import('../../content/dsa/strings/run-length-encoding/quiz'),
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
  'cryptographic-hash-functions': () =>
    import('../../content/dsa/security/cryptographic-hash-functions/quiz'),
  'symmetric-encryption': () =>
    import('../../content/dsa/security/symmetric-encryption/quiz'),
  'public-key-cryptography': () =>
    import('../../content/dsa/security/public-key-cryptography/quiz'),
  'diffie-hellman-key-exchange': () =>
    import('../../content/dsa/security/diffie-hellman-key-exchange/quiz'),
  'digital-signatures': () =>
    import('../../content/dsa/security/digital-signatures/quiz'),
  'digital-certificates-tls': () =>
    import('../../content/dsa/security/digital-certificates-tls/quiz'),
  'password-hashing-salting': () =>
    import('../../content/dsa/security/password-hashing-salting/quiz'),
  'how-a-request-travels': () =>
    import('../../content/system-design/fundamentals/how-a-request-travels/quiz'),
  'latency-vs-throughput': () =>
    import('../../content/system-design/fundamentals/latency-vs-throughput/quiz'),
  'vertical-vs-horizontal-scaling': () =>
    import('../../content/system-design/fundamentals/vertical-vs-horizontal-scaling/quiz'),
  'availability-the-nines': () =>
    import('../../content/system-design/fundamentals/availability-the-nines/quiz'),
  'cap-theorem': () =>
    import('../../content/system-design/fundamentals/cap-theorem/quiz'),
  pacelc: () => import('../../content/system-design/fundamentals/pacelc/quiz'),
  'consistency-models': () =>
    import('../../content/system-design/fundamentals/consistency-models/quiz'),
  'load-balancers': () =>
    import('../../content/system-design/building-blocks/load-balancers/quiz'),
  caching: () =>
    import('../../content/system-design/building-blocks/caching/quiz'),
  cdn: () => import('../../content/system-design/building-blocks/cdn/quiz'),
  'reverse-proxy-api-gateway': () =>
    import('../../content/system-design/building-blocks/reverse-proxy-api-gateway/quiz'),
  'rate-limiting': () =>
    import('../../content/system-design/building-blocks/rate-limiting/quiz'),
  'message-queues-pub-sub': () =>
    import('../../content/system-design/building-blocks/message-queues-pub-sub/quiz'),
  'event-driven-architecture': () =>
    import('../../content/system-design/building-blocks/event-driven-architecture/quiz'),
  'system-design-consistent-hashing': () =>
    import('../../content/system-design/building-blocks/system-design-consistent-hashing/quiz'),
  'database-replication': () =>
    import('../../content/system-design/building-blocks/database-replication/quiz'),
  'sharding-partitioning': () =>
    import('../../content/system-design/building-blocks/sharding-partitioning/quiz'),
  'service-discovery': () =>
    import('../../content/system-design/building-blocks/service-discovery/quiz'),
  'circuit-breaker': () =>
    import('../../content/system-design/building-blocks/circuit-breaker/quiz'),
  'idempotency-retries': () =>
    import('../../content/system-design/building-blocks/idempotency-retries/quiz'),
  'distributed-ids': () =>
    import('../../content/system-design/building-blocks/distributed-ids/quiz'),
  'heartbeats-leader-election': () =>
    import('../../content/system-design/building-blocks/heartbeats-leader-election/quiz'),
  'monolith-vs-microservices': () =>
    import('../../content/system-design/building-blocks/monolith-vs-microservices/quiz'),
  'url-shortener': () =>
    import('../../content/system-design/case-studies/url-shortener/quiz'),
  'rate-limiter-design': () =>
    import('../../content/system-design/case-studies/rate-limiter-design/quiz'),
  'chat-app-design': () =>
    import('../../content/system-design/case-studies/chat-app-design/quiz'),
  'news-feed-design': () =>
    import('../../content/system-design/case-studies/news-feed-design/quiz'),
  'video-streaming-design': () =>
    import('../../content/system-design/case-studies/video-streaming-design/quiz'),
  'ride-sharing-design': () =>
    import('../../content/system-design/case-studies/ride-sharing-design/quiz'),
  'notification-system': () =>
    import('../../content/system-design/case-studies/notification-system/quiz'),
  'web-crawler': () =>
    import('../../content/system-design/case-studies/web-crawler/quiz'),
  'search-autocomplete': () =>
    import('../../content/system-design/case-studies/search-autocomplete/quiz'),
  'distributed-cache-design': () =>
    import('../../content/system-design/case-studies/distributed-cache-design/quiz'),
  'payment-system-design': () =>
    import('../../content/system-design/case-studies/payment-system-design/quiz'),
  'food-delivery-design': () =>
    import('../../content/system-design/case-studies/food-delivery-design/quiz'),
  'relational-model-keys': () =>
    import('../../content/databases/principles/relational-model-keys/quiz'),
  'er-modelling': () =>
    import('../../content/databases/principles/er-modelling/quiz'),
  'normalization-1nf-to-bcnf': () =>
    import('../../content/databases/principles/normalization-1nf-to-bcnf/quiz'),
  'denormalization-trade-offs': () =>
    import('../../content/databases/principles/denormalization-trade-offs/quiz'),
  'sql-query-execution-order': () =>
    import('../../content/databases/principles/sql-query-execution-order/quiz'),
  'sql-joins': () =>
    import('../../content/databases/principles/sql-joins/quiz'),
  'indexes-b-tree-lookups': () =>
    import('../../content/databases/principles/indexes-b-tree-lookups/quiz'),
  'composite-covering-indexes': () =>
    import('../../content/databases/principles/composite-covering-indexes/quiz'),
  'query-plans-explain': () =>
    import('../../content/databases/principles/query-plans-explain/quiz'),
  acid: () => import('../../content/databases/principles/acid/quiz'),
  transactions: () =>
    import('../../content/databases/principles/transactions/quiz'),
  'isolation-levels-anomalies': () =>
    import('../../content/databases/principles/isolation-levels-anomalies/quiz'),
  'locking-deadlocks': () =>
    import('../../content/databases/principles/locking-deadlocks/quiz'),
  mvcc: () => import('../../content/databases/principles/mvcc/quiz'),
  'write-ahead-log-recovery': () =>
    import('../../content/databases/principles/write-ahead-log-recovery/quiz'),
  'sql-vs-nosql': () =>
    import('../../content/databases/principles/sql-vs-nosql/quiz'),
  'nosql-data-models': () =>
    import('../../content/databases/principles/nosql-data-models/quiz'),
  'lsm-trees-sstables': () =>
    import('../../content/databases/principles/lsm-trees-sstables/quiz'),
  'replication-sharding': () =>
    import('../../content/databases/principles/replication-sharding/quiz'),
  'connection-pooling': () =>
    import('../../content/databases/principles/connection-pooling/quiz'),
  'database-caching': () =>
    import('../../content/databases/principles/database-caching/quiz'),
};
