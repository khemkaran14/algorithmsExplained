# Changelog

## 0.1.0 — Phase 1 foundation

- Next.js 15, React 19, strict TypeScript, Tailwind v4, Radix-based Button, theme toggle and next-intl foundation.
- Responsive landing roadmap, sign-in, protected learning account shell and error/loading states.
- Auth.js Google/Resend providers with Prisma database sessions; PostgreSQL/Redis Compose and standalone Docker image.
- Vitest component tests, Playwright desktop/mobile/axe checks, formatting/lint/type/build CI.
- External credential-based sign-in and hosted CI require separate verification. No later phase started.

## 0.2.0 — Animation foundation

- Deterministic, immutable frame engine; bounded reversible timeline, per-player Zustand state, mobile controls and reduced-motion SVG rendering.
- Big-O, Bubble Sort, Binary Search, Stack and BFS lessons with MDX, presets, four-language highlighted code, counters and measured complexity charts.
- Twenty unit/integration tests pass, including real PostgreSQL session/token persistence; mobile player browser tests pass.
- Prisma generation and foundation migration are now verified. Real OAuth/email sign-in and hosted CI remain external checks.

## 0.3.0 — Learning and progress

- Try mode checks actual generator moves, explains mistakes and offers hints; quizzes grade on device and on the server for signed-in users.
- Guest progress merges idempotently into database-backed accounts; scores, notes, bookmarks, XP, streaks and badges persist.
- Public dashboard, learning paths and SM-2 revision cards; account isolation protects notes across sign-ins and clears local account data on sign-out.
- Full Prisma platform schema and migration; standalone packaging includes the generated WASM compiler.
- Validation: 24 unit/integration tests, 12 desktop/mobile browser tests and all five current lesson content checks pass. Browser account tests use actual database sessions; real Google/Resend delivery remains unverified.

## 0.4.0 — Payments and protected content

- Server-priced Razorpay orders, captured-payment verification, constant-time HMAC signatures, transactional webhook deduplication, terminal refunds and lifetime entitlements.
- Usage-limited server coupons, authenticated admin controls, PDF invoices, durable email receipt retries, pricing/checkout and legal templates.
- Paid Merge Sort lesson is delivered only after entitlement checks; public JavaScript contains no paid generator or narration.
- Complete 201-entry curriculum metadata and reproducible free allocation: 41 free lessons (20.40%). Six lessons are implemented at this checkpoint; 195 remain explicitly planned for Phases 5/6.
- Validation: 31 unit/integration tests and 16 desktop/mobile browser tests pass, including signatures, refunds, repeated events, coupon reservations, protected content and invoice downloads. Real Razorpay test-mode checkout remains credential-dependent.

## 2026-10-16 — Phase 5 curriculum checkpoint

- Expanded implemented curriculum from 6 to 69 lessons across foundations, sequences, sorting, searching, math, hashing and trees, with authored explanations, quizzes and four-language reference code.
- Added validated structured inputs, server-generated random presets, custom operation metrics, graph/matrix/list/heap/hash/Hanoi renderers and the protected variant-loading foundation.
- Added deterministic correctness and invariant coverage: 190 unit/integration tests pass. Production build passes. Four-language syntax checking passes for all 69 implemented lessons. Desktop/mobile browser checks pass (22 tests), including playground progress isolation, protected comparison and keyboard-accessible search.
- Added the free-input playground, synchronized two/three-sort comparison, and Ctrl/Command-K curriculum search. Graph generators have correctness coverage and are awaiting lesson authoring before registration.
- Full Phase 5/6 acceptance remains pending: 132 catalog entries are still planned. External Google/Resend/Razorpay acceptance checks require operator test credentials.

## 2026-10-16 — Complete DSA authoring checkpoint

- All 112 DSA catalog entries now have generators, nine-section explanations, quizzes and JavaScript/Python/Java/C++ references. Added general graph BFS, weighted paths, forests, SCC/max-flow variants, Hoare Quick Sort, string matching/compression, dynamic programming, greedy/backtracking and security demonstrations.
- Added a visual graph input builder, free searchable complexity cheat sheet, result inspection, bounded sample sizing and stronger content checks for MDX, variants, deterministic input preservation, counters and challenges.
- Local validation: 247 unit/integration/content-serving tests, 24 desktop/mobile browser checks, strict 112-lesson DSA validation and production build pass. All 116 reference sets (including variants) pass four-language syntax checks.
- System Design/Databases/Cloud still account for 89 planned entries. Final source-line synchronization audit, broader production hardening and external provider acceptance remain before release.

## 2026-10-16 — System Design foundations checkpoint

- Added seven foundation lessons: request paths, latency/throughput, vertical/horizontal scaling, availability equations, CAP, PACELC and consistency models. Their diagrams and outcomes derive from traffic, probability and versioned-register state.
- Added validated simulation controls, request cancellation and failure colors, plus underlying tested models for rate admission, delivery/consumer effects, cache persistence, circuit breaking, idempotency, sharding, IDs and quorum/service boundaries. These additional models are not catalog lessons until their complete authoring is registered.
- 286 unit/integration tests and the production build pass. Existing 24 browser checks passed; both new desktop/mobile traffic/control/accessibility checks pass after correcting select label associations. Content validation passes for 119 lessons (82 planned remain); 123 four-language main/variant reference sets compile.

## 2026-10-16 — System Design curriculum checkpoint

- Authored all 35 System Design lessons, including 16 building blocks and 12 case studies; catalog now has 147 authored lessons and 54 planned Database/Cloud entries.
- Added guarded case-study requirements, editable demand/storage estimates, API/entity exercises, progressive architectures and deterministic failure models.
- Added independent correctness tests for retries, ranking, routing, replica freshness, balanced payment events and saga resource ownership.
- Fixed variant-only player requests, code-comment contrast and mobile playback controls covering configuration inputs.
- Local validation: production build, 338 unit/integration/model checks, all 30 desktop/mobile browser checks and four-language reference compilation pass. Production hardening, final source synchronization and external-provider acceptance remain open.

## 2026-10-16 — Database curriculum checkpoint

- Authored all 21 Database lessons: relational integrity, normalization, SQL semantics, real B+ page operations, composite access/cost plans, transactions/isolation/MVCC, locks, bounded WAL recovery, data layouts, LSM, replication/sharding, pooling and caching.
- Added deterministic correctness tests and independent PostgreSQL join/query and two-session write-skew checks.
- Local content validation passes for 168 lessons; only 33 Cloud entries remain planned. All 174 main/variant reference sets compile; 368 tests and production build pass. The four new desktop/mobile Database browser checks pass alongside the previously validated 30 browser scenarios.
- Production hardening, final source synchronization, complete Cloud curriculum and external-provider acceptance remain open.
