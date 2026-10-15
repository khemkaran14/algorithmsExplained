# Codex Prompt — Interactive DSA, System Design, Database & Cloud Learning Platform

> Paste everything below this line into ChatGPT Codex. It is written so Codex can build the product phase by phase, from an empty repo to production.

---

## 0. Your role and how to work

You are a senior full-stack engineer and an interaction designer. Build a **production-ready web app** (responsive, installable as a PWA, works great on mobile and desktop) that teaches **Data Structures & Algorithms, System Design, Database principles, and Cloud (AWS + GCP)** through **interactive, animated, step-by-step visual tutorials**.

Working rules:

- Work in the **phases** listed in section 12. Finish each phase completely (code + tests + passing CI) before starting the next. Commit after each phase with a clear message.
- Create an `AGENTS.md` at the repo root describing the architecture, commands, conventions and how to add a new lesson. Keep it updated.
- Use **TypeScript strict mode** everywhere. No `any` unless justified in a comment.
- Never put paid lesson content in the client bundle or in public API responses for users who haven't paid (see section 8).
- If something in this spec is ambiguous, choose the most reasonable option, write the decision in `docs/DECISIONS.md`, and continue.
- Prefer small, composable components and pure functions. Every algorithm visualizer must be unit-tested.

Working product name: **AlgoVerse** (keep it in one config constant so it can be renamed).

---

## 1. Product reference and what we do better

Reference: the Android app "Algorithms: Explained and Animated" (wiki.algorithm.algorithms). What it does well and we must match:

- Short, clear explanations driven by **animations**, not long text.
- A **"Watch" mode** (narrated animation) and a **"Sim/Try" mode** where the learner interacts with the data themselves.
- Categories: Sort, Search, Graph search, Clustering, Math, Compression, Security/Crypto, Data structures, Web (PageRank), Recursion.
- Freemium: part free, one purchase unlocks everything. No ads.

What its users complain about, which we must fix:

- **No Big-O.** Every lesson must show time & space complexity (best / average / worst) and _explain why_ with an animated operation counter.
- **No best/worst-case exploration.** Let users load best-case, worst-case and random inputs and see the operation count difference live.
- **Buttons cut off on small screens.** Controls must be fully visible from 320px width up, respecting safe areas.
- **No code.** Show synchronized code in JavaScript, Python, Java and C++, with the current line highlighted as the animation runs.

We also go far beyond DSA by adding System Design, Databases and Cloud tracks, all taught the same interactive way.

---

## 2. Tech stack (use exactly this unless blocked)

- **Framework:** Next.js 15 (App Router, React Server Components, Server Actions), React 19, TypeScript.
- **Styling:** Tailwind CSS v4 + shadcn/ui (Radix primitives). Light and dark theme.
- **Animation:** Framer Motion for UI and node/element movement; SVG for data-structure rendering; HTML Canvas only where SVG would be too slow (e.g. 500+ particles in a traffic simulation). React Flow for system-design / cloud architecture diagrams.
- **Code display:** Shiki for syntax highlighting (server-rendered), with line-highlight driven by the animation engine.
- **Content:** Lessons authored as MDX + TypeScript visualizer modules (see section 4).
- **Database:** PostgreSQL with Prisma ORM.
- **Auth:** Auth.js (NextAuth v5) with Google OAuth + email magic link (Resend for email).
- **Payments:** Razorpay (India, INR, UPI/cards/netbanking/wallets) — see section 8.
- **State:** Zustand for the animation player state; TanStack Query only where client fetching is needed.
- **Testing:** Vitest + React Testing Library (unit), Playwright (E2E, including mobile viewport), axe-core for accessibility.
- **Observability:** Sentry (errors), PostHog (product analytics, self-host-friendly), structured logging with pino.
- **Rate limiting / cache:** Upstash Redis.
- **Deploy:** Vercel (app) + Neon or Supabase (Postgres). Also provide a `Dockerfile` and `docker-compose.yml` (app + Postgres + Redis) so it can be self-hosted.
- **CI:** GitHub Actions — lint, typecheck, unit tests, E2E, build, Lighthouse CI.

Provide `.env.example` with every variable documented.

---

## 3. The animation engine (the heart of the product — build it first and build it well)

Build a reusable, framework-agnostic **step-based visualization engine** in `src/engine/`.

### 3.1 Core idea

Every algorithm is written as a **generator that yields frames**. A frame is a full, serializable snapshot of the visual state plus metadata. The player just renders frame N. This makes step-back, scrubbing, and testing trivial.

```ts
type Frame<S> = {
  state: S; // full visual state (array values, node positions, pointers, colors...)
  highlights: Highlight[]; // which elements are active/compared/swapped/visited/sorted
  codeLine: Record<Lang, number>; // line to highlight in each language
  narration: string; // one short sentence explaining THIS step
  counters: {
    comparisons: number;
    swaps: number;
    reads: number;
    writes: number;
    [k: string]: number;
  };
  variables: Record<string, string | number | boolean | null>; // live variable watch panel (i, j, pivot, low, high...)
  callStack?: string[]; // for recursion lessons
};

interface Visualizer<Input, S> {
  id: string;
  generate(input: Input): Generator<Frame<S>>;
  presets: {
    best: Input;
    average: Input;
    worst: Input;
    random: (n: number) => Input;
  };
  validateInput(raw: unknown): Input; // for user-entered custom input
  complexity: ComplexityInfo; // best/avg/worst time, space, stable?, in-place?
}
```

### 3.2 Player (`<LessonPlayer />`)

- Controls: Play / Pause, Step forward, **Step back**, Restart, scrubber timeline, speed (0.25x–4x), keyboard shortcuts (Space, ←, →, R, 1–5 for speed).
- Panels (collapsible, rearranged into tabs on mobile): Visual canvas · Narration · Code (language switcher) · Variables watch · Counters · Call stack (when relevant).
- Input panel: Best / Average / Worst / Random presets, size slider, and "Enter your own" custom input with validation messages.
- **Complexity race:** run the same input through 2–3 algorithms side by side (e.g. Bubble vs Merge vs Quick) with synchronized playback and live counters.
- Must respect `prefers-reduced-motion` (instant transitions, still step-by-step).
- 60fps on a mid-range Android phone for inputs up to 64 elements. Precompute frames lazily (cap memory; for long runs keep every Kth frame as a checkpoint and recompute between).

### 3.3 Interaction modes (every lesson has all three)

1. **Watch** — narrated auto-play animation.
2. **Try (Sim mode)** — the user performs the algorithm: e.g. clicks which two bars to swap next, picks the next node in BFS, chooses where to insert in a BST. The engine checks each move against the real generator, gives instant feedback ("Not yet — 7 > 3, compare these first"), and offers a hint button.
3. **Quiz** — 3–6 questions: predict the next step, choose complexity, spot the bug in code, order the steps. Questions can embed a frozen frame of the visualizer.

### 3.4 Reusable renderers

Build generic SVG renderers so most lessons need only a generator:
`ArrayBars`, `ArrayBoxes`, `LinkedListView`, `StackView`, `QueueView`, `TreeView` (auto-layout, rotations animated), `HeapView` (tree + backing array linked), `HashTableView` (buckets + chaining/probing), `GraphView` (force or fixed layout, weighted/directed), `GridView` (pathfinding, DP tables), `MatrixView` (DP), `StringView` (pattern matching), `BitView`, `RecursionTreeView`, plus `ArchitectureView` (React Flow) for system design and cloud.

---

## 4. Lesson content model

Each lesson lives in `content/<track>/<module>/<lesson-slug>/`:

- `lesson.mdx` — short explanation sections, interleaved with embedded interactive widgets.
- `visualizer.ts` — generator + presets + complexity (if applicable).
- `code/` — `js.ts`, `py.py`, `java.java`, `cpp.cpp` with line markers matching `codeLine`.
- `quiz.ts` — questions.
- `meta.ts`:

```ts
export default {
  slug, title, track, module, order,
  level: 'beginner' | 'intermediate' | 'advanced',
  estimatedMinutes,
  isFree: boolean,           // see section 7
  prerequisites: string[],
  tags: string[],
  interviewFrequency?: 'high' | 'medium' | 'low',
  relatedProblems?: { title: string; url: string }[]  // LeetCode-style practice links
}
```

Every lesson page follows this structure:

1. **Hook** — one real-world analogy, animated (e.g. a stack of plates).
2. **Watch** the animation.
3. **How it works** — 3–6 short steps, each linked to a frame you can jump to.
4. **Try it** (Sim mode).
5. **Complexity** — best/avg/worst + space, with an animated chart of operations vs n (plot real counters from the engine for n = 8, 16, 32, 64) and a plain-English "why".
6. **Code** in 4 languages, synced to the animation.
7. **When to use / when not to**, common interview pitfalls.
8. **Quiz**.
9. Next lesson / related lessons.

A **build-time validator** (`pnpm content:check`) must fail CI if any lesson is missing required files, has mismatched code line markers, a visualizer that throws on its presets, or a quiz with no correct answer.

---

## 5. Full curriculum

Build the full catalog below. In early phases you may ship lessons as "Coming soon" stubs with real meta, but by the end of Phase 6 every lesson must be complete.

### Track A — Data Structures & Algorithms

**A1. Foundations**
Big-O notation (interactive growth-curve comparer) · Time vs space complexity · Recursion basics · Recursion tree & call stack · Master theorem (visual) · Bit manipulation basics · Two pointers · Sliding window · Prefix sums

**A2. Linear data structures**
Arrays & dynamic arrays (amortized resizing animated) · Strings · Singly linked list · Doubly linked list · Circular linked list · Stack · Queue · Circular queue · Deque · Monotonic stack · Monotonic queue

**A3. Hashing**
Hash functions · Hash table with chaining · Open addressing (linear/quadratic probing, double hashing) · Load factor & rehashing · Bloom filter · Consistent hashing (also reused in System Design)

**A4. Trees**
Binary tree & traversals (pre/in/post/level order) · Binary search tree (insert/delete/search) · AVL tree (rotations) · Red-black tree · B-tree & B+ tree (also reused in Databases) · Heap / priority queue · Heapify · Trie · Segment tree · Fenwick tree (BIT) · Lowest common ancestor · Tree diameter

**A5. Sorting**
Bubble · Selection · Insertion · Shell · Merge · Quick (Lomuto & Hoare, pivot strategies) · Heap · Counting · Radix · Bucket · Tim sort (overview) · Stability explained · Sorting algorithm race

**A6. Searching**
Linear search · Binary search · Binary search on answer · Lower/upper bound · Ternary search · Exponential search · Interpolation search

**A7. Graphs**
Graph representations (matrix vs list) · BFS · DFS · Topological sort (Kahn & DFS) · Cycle detection · Connected components · Union-Find (with path compression & union by rank) · Dijkstra · Bellman-Ford · Floyd-Warshall · A* search · Prim's MST · Kruskal's MST · Strongly connected components (Kosaraju/Tarjan) · Bipartite check · Bridges & articulation points · Max flow (Ford-Fulkerson / Edmonds-Karp)

**A8. Algorithm paradigms**
Greedy (activity selection, fractional knapsack) · Divide & conquer · Backtracking (N-Queens, Sudoku, subsets, permutations) · Dynamic programming intro (memoization vs tabulation) · Fibonacci DP · 0/1 Knapsack · Longest common subsequence · Longest increasing subsequence · Edit distance · Coin change · Matrix chain multiplication · DP on grids · DP on trees

**A9. Strings**
Naive matching · KMP · Rabin-Karp · Z-algorithm · Manacher's (overview) · Huffman coding · Run-length encoding

**A10. Math & other classics**
Euclidean GCD · Sieve of Eratosthenes · Primality test · Fast exponentiation · Tower of Hanoi · Reservoir sampling · k-means clustering · PageRank · LRU cache · LFU cache

**A11. Security algorithms**
Hash functions (SHA overview) · Symmetric encryption · Public-key cryptography (RSA intuition) · Diffie-Hellman key exchange · Digital signatures · Digital certificates & TLS handshake · Password hashing & salting

### Track B — System Design

**B1. Fundamentals**
Client-server & how a request travels (DNS → CDN → LB → app → DB, animated packet) · Latency vs throughput · Vertical vs horizontal scaling · Availability & the "nines" (calculator) · CAP theorem (interactive partition simulator) · PACELC · Consistency models (strong, eventual, read-your-writes)

**B2. Building blocks**
Load balancers (round robin, least connections, IP hash — live traffic simulation where users add servers and kill nodes) · Caching (cache-aside, write-through, write-back, eviction LRU/LFU, cache hit-rate simulator) · CDN · Reverse proxy & API gateway · Rate limiting (token bucket, leaky bucket, sliding window — animated) · Message queues & pub/sub · Event-driven architecture · Consistent hashing (add/remove nodes, watch key migration) · Database replication (leader-follower, multi-leader, replication lag simulation) · Sharding & partitioning (hot-key visualization) · Service discovery · Circuit breaker · Idempotency & retries with backoff · Distributed IDs (Snowflake) · Heartbeats & leader election (Raft visualized) · Monolith vs microservices

**B3. Case studies (interactive architecture diagrams you can build step by step)**
URL shortener · Rate limiter · Chat app (WhatsApp) · News feed (Instagram/Twitter) · Video streaming (YouTube) · Ride sharing (Uber) · Notification system · Web crawler · Search autocomplete · Distributed cache · Payment system · Food delivery (Zomato/Swiggy-style)
Each case study has: requirements → back-of-envelope estimation calculator → API design → data model → high-level diagram built incrementally (each click adds a component with an explanation) → bottlenecks & trade-offs → "break it" mode (inject failures and watch impact).

### Track C — Database Principles

Relational model & keys · ER modelling · Normalization 1NF→BCNF (interactive table-splitting) · Denormalization trade-offs · SQL query execution order (animated) · Joins (inner/left/right/full/cross — animated row matching) · Indexes & B+ tree lookups (watch the tree being searched) · Composite & covering indexes · Query plans (EXPLAIN visualized) · ACID · Transactions · Isolation levels with anomaly simulator (dirty read, non-repeatable read, phantom, write skew — two side-by-side sessions on a timeline) · Locking (shared/exclusive, deadlock detection animated) · MVCC · Write-ahead log & crash recovery · SQL vs NoSQL · NoSQL types (key-value, document, wide-column, graph) · LSM trees & SSTables · Replication & sharding (links to Track B) · Connection pooling · Database caching

### Track D — Cloud Principles (AWS & GCP side by side)

Every lesson shows an **AWS ↔ GCP mapping toggle** and an interactive architecture diagram.
Cloud basics: IaaS/PaaS/SaaS/serverless · Regions, availability zones, edge locations (interactive world map) · Shared responsibility model
Compute: EC2 ↔ Compute Engine · Auto Scaling Groups ↔ Managed Instance Groups (traffic spike simulator) · Lambda ↔ Cloud Functions / Cloud Run · ECS/EKS ↔ GKE / Cloud Run · Containers & Kubernetes basics (pods, services, deployments animated)
Storage: S3 ↔ Cloud Storage (storage classes & lifecycle) · EBS ↔ Persistent Disk · EFS ↔ Filestore
Databases: RDS/Aurora ↔ Cloud SQL/AlloyDB · DynamoDB ↔ Firestore/Bigtable · ElastiCache ↔ Memorystore · Spanner overview
Networking: VPC ↔ VPC (subnets, route tables, NAT — build-a-VPC interactive) · Security groups & NACLs ↔ firewall rules · ELB/ALB ↔ Cloud Load Balancing · Route 53 ↔ Cloud DNS · CloudFront ↔ Cloud CDN
Messaging & integration: SQS/SNS ↔ Pub/Sub · EventBridge ↔ Eventarc · Step Functions ↔ Workflows
Security & identity: IAM (users, roles, policies — interactive policy evaluator) ↔ GCP IAM · KMS ↔ Cloud KMS · Secrets Manager ↔ Secret Manager
Operations: CloudWatch ↔ Cloud Monitoring/Logging · Infrastructure as code (CloudFormation/Terraform) · CI/CD on cloud · Cost optimization (interactive cost estimator) · Well-Architected Framework pillars · Disaster recovery strategies (backup/restore, pilot light, warm standby, multi-site — RTO/RPO slider)
Capstone: deploy a 3-tier web app on AWS and on GCP (interactive diagram + step checklist)

---

## 6. Learning & engagement features

- **Home / dashboard:** continue where you left off, progress per track, daily streak, XP, recommended next lesson.
- **Learning paths:** "DSA for interviews (8 weeks)", "System design for interviews", "Database fundamentals", "Cloud practitioner". Each path is an ordered list of lessons with a progress bar.
- **Progress tracking:** lesson states (not started / in progress / completed), quiz scores, time spent. Anonymous users store progress in localStorage and it **merges into the account on sign-in**.
- **Gamification:** XP per lesson and quiz, streaks, badges (e.g. "Sorted!" for finishing all sorts), weekly goal.
- **Search:** command palette (Ctrl/Cmd+K) across lessons, tags and concepts.
- **Bookmarks & notes** per lesson.
- **Revision mode:** spaced-repetition flashcards auto-generated from quiz questions.
- **Cheat sheets:** one-page complexity table for all algorithms (free, SEO-friendly).
- **Certificates:** shareable completion certificate per track (paid users), verifiable via public URL.
- **Playground:** "Bring your own array/graph" — free-form visualizer for any built-in algorithm.
- **Accessibility:** full keyboard control, screen-reader narration of each step (aria-live), colour-blind-safe palette with shape/pattern cues in addition to colour, WCAG 2.2 AA.
- **i18n-ready:** all UI strings via next-intl; ship English first, Hindi second.

---

## 7. Free vs paid (20% free)

- Exactly **~20% of all lessons are free**, the rest are paid.
- Rule: in **each module**, the first lessons by `order` are free until that module reaches 20% (round up, minimum 1 free lesson per module). This guarantees every topic area has something free to try.
- Additionally always free: Big-O foundations lesson, the complexity cheat sheet, the playground limited to free algorithms, and the first case study in System Design.
- Implement `pnpm content:free-ratio` that prints the free percentage per track and overall, and **fails CI if overall is outside 18–22%**.
- Store the free/paid decision in `meta.ts` (`isFree`) but generate it from the rule via a script so it stays consistent; allow manual override with a comment.
- Locked lessons show: title, description, a 5-second silent preview loop of the animation (pre-rendered, non-interactive), the topics covered, and an **Unlock everything for ₹199** button.

---

## 8. Payments — ₹199 one-time "Unlock All" (Razorpay)

Default model: **one-time payment of ₹199 for lifetime access** to all current and future lessons. Keep price and model in a config (`src/config/pricing.ts`) so it can later change to a subscription without code rewrites.

Implementation requirements:

1. **Create order server-side** (`POST /api/payments/order`): requires login, creates a Razorpay order for 19900 paise INR with a `receipt` tied to the user ID, stores a `Payment` row with status `created`. Reject if the user already owns access.
2. **Checkout** with Razorpay Checkout.js (UPI, cards, netbanking, wallets), prefilled with user name/email.
3. **Verify on the server** (`POST /api/payments/verify`): verify `razorpay_signature` with HMAC SHA256 using the key secret. Only then mark payment `paid` and create an `Entitlement` (`ALL_ACCESS`, lifetime).
4. **Webhook** (`POST /api/webhooks/razorpay`): verify webhook signature, handle `payment.captured`, `payment.failed`, `refund.processed`. Must be **idempotent** (store processed event IDs). The webhook is the source of truth if the browser closes before verify.
5. **Refunds** revoke the entitlement.
6. Email receipt via Resend; downloadable invoice PDF with GST fields configurable (business name, GSTIN optional).
7. Coupons: admin can create coupon codes (percentage or flat, expiry, usage limit) — applied server-side only.
8. **Never trust the client** for price, coupon or entitlement.

**Content protection (critical):**

- Paid lesson MDX, code, quizzes and full visualizer frames are only rendered/served on the server **after checking entitlement**. Free users must never receive paid content in HTML, JSON, RSC payloads or JS chunks.
- Load paid visualizer modules via server-checked dynamic imports from a route that verifies entitlement; do not statically import them in client components that ship to everyone.
- Add an E2E test that fetches a paid lesson as a free user and asserts that none of its narration text or code appears in the response.

Legal pages required by Razorpay and Indian law: Terms, Privacy Policy, Refund & Cancellation Policy, Contact Us, Shipping/Delivery (digital delivery statement), About. Generate sensible templates and clearly mark them "review with a lawyer".

---

## 9. Data model (Prisma, minimum)

`User`, `Account`, `Session`, `VerificationToken` (Auth.js) · `Entitlement` (userId, type, source, grantedAt, revokedAt) · `Payment` (razorpayOrderId, razorpayPaymentId, amount, currency, status, couponId) · `WebhookEvent` (id, type, processedAt) · `Coupon` · `LessonProgress` (userId, lessonSlug, status, lastFrame, timeSpentSec, completedAt) · `QuizAttempt` · `Bookmark` · `Note` · `Streak` · `XpEvent` · `Badge`/`UserBadge` · `Certificate` · `Flashcard` review state (SM-2 fields).

Lessons themselves stay in the repo (content-as-code), not the DB.

---

## 10. Pages & routes

`/` landing (hero with a live mini sorting animation, track overview, free sample lesson embedded, pricing, FAQ, testimonials placeholder) · `/learn` dashboard · `/learn/[track]` · `/learn/[track]/[module]` · `/learn/[track]/[module]/[lesson]` · `/paths/[path]` · `/playground` · `/cheatsheet` · `/compare` (algorithm race) · `/pricing` · `/checkout/success` · `/account` (profile, purchases, invoices, certificates, delete account, export data) · `/certificate/[id]` (public verify) · `/admin` (role-protected: users, payments, coupons, refunds, analytics summary, content free-ratio report) · legal pages · custom 404/500.

---

## 11. Design direction

- Distinctive, friendly, "playful-technical" look — not a generic template. Pick a bold primary colour, a mono font for code and data values, and a clean sans for body text.
- Consistent semantic colour language across ALL visualizers (documented in a legend): default · comparing · swapping/moving · visited · in-queue/stack · sorted/done · error. Each state also has a shape/pattern for colour-blind users.
- Micro-interactions: satisfying swap arcs, nodes that bounce in on insert, edges that draw on, a small confetti on lesson completion (disabled with reduced motion).
- Mobile-first layout: visual on top, controls pinned to bottom within safe-area insets (never cut off), panels as swipeable tabs.
- Dark mode by default respects system setting.

---

## 12. Build phases (do them in order, each with acceptance criteria)

**Phase 1 — Foundation**
Repo, Next.js, TS strict, Tailwind, shadcn/ui, ESLint/Prettier, Vitest, Playwright, GitHub Actions CI, Prisma + Postgres via docker-compose, Auth.js (Google + magic link), base layout, theme, landing page skeleton, `AGENTS.md`, `.env.example`.
✅ CI green; can sign in/out locally.

**Phase 2 — Animation engine + 5 flagship lessons**
Engine, player, all controls, step back, speed, code sync in 4 languages, variable watch, counters, presets, custom input, reduced-motion support. Lessons: Big-O, Bubble Sort, Binary Search, Stack, BFS.
✅ Unit tests for each generator (final state correct, counters match expected for presets). Playwright test: play, pause, step back, change speed on mobile viewport (375×667) with all controls visible.

**Phase 3 — Try mode, quizzes, progress**
Sim mode with move validation and hints, quiz engine, progress tracking (anon localStorage + merge on login), XP, streaks, dashboard.
✅ E2E: complete a lesson anonymously → sign in → progress preserved.

**Phase 4 — Payments & gating**
Razorpay order/verify/webhook, entitlements, coupons, invoices, locked-lesson previews, pricing page, legal pages, free-ratio script.
✅ E2E with Razorpay test mode; paid-content-leak test passes; webhook idempotency test; free ratio 18–22%.

**Phase 5 — Full DSA track**
All Track A lessons complete with all 9 lesson sections; algorithm race; playground; cheat sheet; command-palette search.
✅ `content:check` passes for every lesson.

**Phase 6 — System Design, Databases, Cloud**
ArchitectureView with React Flow, traffic/failure simulators, isolation-level simulator, B+ tree index lookup, AWS↔GCP toggle, cost estimator, all Track B/C/D lessons, case studies.
✅ `content:check` passes; each simulator has at least one unit test on its state logic.

**Phase 7 — Production hardening**

- SEO: metadata, OpenGraph images generated per lesson, sitemap, robots, JSON-LD (Course / LearningResource). Free lessons fully indexable; paid lessons index only the public summary.
- Performance: Lighthouse ≥ 90 on Performance, Accessibility, Best Practices, SEO for landing and a free lesson (mobile). Code-split visualizers per lesson. Image optimization. Edge caching for public pages.
- Security: CSP headers, rate limits on auth/payment/API routes, CSRF protection, input validation with Zod on every server action/route, secrets only on server, dependency audit in CI.
- PWA: manifest, icons, offline support for already-opened free lessons.
- Sentry + PostHog wired with a funnel: landing → lesson start → paywall view → checkout → paid.
- Admin panel complete.
- Account deletion & data export.
- Backups note for Postgres; health-check endpoint `/api/health`.
  ✅ Lighthouse CI thresholds enforced; axe tests pass on key pages; zero high-severity audit issues.

**Phase 8 — Launch prep**
Production deploy guide in `docs/DEPLOY.md` (Vercel + Neon + Upstash + Razorpay live keys + domain + webhook URL setup), seed script for admin user, smoke-test checklist, `CHANGELOG.md`.
✅ A fresh clone can go to production by following `docs/DEPLOY.md` alone.

---

## 13. Quality bar (applies to every phase)

- Every visualizer is deterministic for a given input and seed.
- Narration is one short, plain-English sentence per step; no wall of text anywhere.
- No layout shift when panels open/close; no control ever hidden on 320px width.
- All interactive elements reachable by keyboard and labelled for screen readers.
- Error, empty and loading states designed for every page.
- After each phase, update `AGENTS.md`, `docs/DECISIONS.md`, and `CHANGELOG.md`, then summarize what was built, what tests cover it, and what's next.

Start with Phase 1 now.
