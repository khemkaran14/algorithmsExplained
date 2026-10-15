# Decisions

- Implement Phase 1 first; do not claim the eight-phase product is complete. Four tracks are honest roadmap cards rather than dead lesson links. The landing sorting graphic is an illustrative CSS preview, not the Phase 2 engine.
- Use PostgreSQL 17 and Redis 7 via Compose. Redis is provisioned for later phases; Phase 1 does not depend on it. Prisma 6 avoids adopting Prisma 7 configuration changes during foundation work.
- Auth.js uses database sessions, Prisma adapter, Google and Resend. Enable each provider only when its required settings exist. No dummy login, paid entitlement or auth bypass. External sign-in validation requires user-managed provider credentials.
- Follow shadcn's source-owned component convention; Button uses Radix Slot and class-variance-authority. System fonts avoid external font network dependencies and layout shifts.
- English via next-intl; Hindi translation will ship in a later phase.
- CI runs foundation checks now. Lighthouse smoke reports run now; score thresholds, audit enforcement and production hardening are Phase 7 work. Hosted CI status must be observed separately from local checks.

- Pin next-intl 4.3.12: later releases eagerly load an SWC native extractor whose trusted-cache requirements are incompatible with this cloud filesystem. No artifact verification is disabled.
- Sign-in is dynamically rendered so provider settings are read at runtime. Standalone startup binds all container interfaces and includes static assets.

- The user authorized finishing all phases autonomously. Continue independent implementation while external credential/network checks remain pending; never replace those checks with fake success or call a phase accepted before its acceptance evidence exists.
- Frame history uses a bounded LRU snapshot cache and deterministic recomputation for old frames; large traces are capped at 30,000 frames. Flagship graph input is a labeled binary tree so BFS has a deterministic editable topology; general graph editing follows in the playground.

- Prisma uses the stable Rust-free query client (`engineType = "client"`) with @prisma/adapter-pg 6.19.3. Its opt-in JavaScript schema engine avoids blocked binary downloads. A build-time-only alias pins the migration adapter to 7.10.1 to fix PostgreSQL catalog NAME type handling; the application runtime remains on matching Prisma 6.19.3 packages. Migration and real adapter session/token tests pass. No downloaded artifact was used without verification. Reevaluate the experimental schema-engine flag before production migration operations.

- Streak dates use UTC consistently. Progress merging preserves completion, the best score, maximum frame/time, and the earliest completion date. Repeated merges do not duplicate lesson XP. Notes use timestamp conflict resolution and browser learning data records its account owner.
- Provider credentials remain external acceptance prerequisites. Browser merge tests seed actual Auth.js database sessions, exercise protected session reads and persistence, and are reported separately from real Google/email sign-in.
- The learning migration also prepares the remaining payment, coupon, certificate and flashcard tables so later routes can use a single coherent model; no payment feature was enabled by schema creation alone.

- Payment amount, coupon eligibility and entitlement changes are server decisions. Razorpay signatures use the exact raw webhook body or order/payment ID pair; refunds are terminal, event IDs are deduplicated transactionally, and late failure/capture events cannot undo a refund. Browser verification also fetches captured payment details from Razorpay.
- Coupon usage is reserved at order creation and is never silently recycled: this prevents an abandoned but still payable Razorpay order from overspending a usage limit. Retries reuse the same order/receipt via a user-bound idempotency key.
- Receipts use a durable outbox and authenticated retry job. PDF invoices remain accessible to their owner after refund. Uncertain refund responses stay pending until provider reconciliation, preventing an unsafe automatic retry.
- The supplied curriculum contains 201 lesson entries. Per-module 20% ceiling allocations exceed the global free budget when summed. Use the specification's permitted, commented manual overrides to reconcile rounding to 41/201 (20.40%), preserving every module's free sample and all flagship free lessons. `content:generate-catalog` reproduces this decision, and `content:free-ratio` enforces the 18–22% total.
- During curriculum authoring, metadata marks unavailable lessons `planned`. `content:check:ready` explicitly reports and skips these planned lessons for early-phase CI; strict `content:check` fails until every lesson is complete and becomes the release gate in Phase 6. A planned lesson never displays a fake visualizer or a completion claim.
