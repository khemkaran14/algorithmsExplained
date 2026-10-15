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
