# Decisions

- Implement Phase 1 first; do not claim the eight-phase product is complete. Four tracks are honest roadmap cards rather than dead lesson links. The landing sorting graphic is an illustrative CSS preview, not the Phase 2 engine.
- Use PostgreSQL 17 and Redis 7 via Compose. Redis is provisioned for later phases; Phase 1 does not depend on it. Prisma 6 avoids adopting Prisma 7 configuration changes during foundation work.
- Auth.js uses database sessions, Prisma adapter, Google and Resend. Enable each provider only when its required settings exist. No dummy login, paid entitlement or auth bypass. External sign-in validation requires user-managed provider credentials.
- Follow shadcn's source-owned component convention; Button uses Radix Slot and class-variance-authority. System fonts avoid external font network dependencies and layout shifts.
- English via next-intl; Hindi translation will ship in a later phase.
- CI runs foundation checks now. Lighthouse smoke reports run now; score thresholds, audit enforcement and production hardening are Phase 7 work. Hosted CI status must be observed separately from local checks.

- The initial next-intl 4.3.12 pin avoided an incompatible eager native extractor. The security checkpoint moves to patched next-intl 4.9.2 with a compatible pinned SWC compiler and its upstream WASM fallback available; no artifact verification is disabled. See DEPENDENCIES.md for the validated dependency overrides.
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

### Expanded lesson inputs and checkpoints (2026-10-16)

Server-authorized players accept validated per-lesson JSON rather than requiring every concept to look like an integer array. Counters identify the operation being plotted. Exact exponentiation returns decimal strings, unreachable states use JSON null, and randomness is seeded for repeatable teaching traces. TimSort overview explicitly demonstrates natural-run merging, not a claim of complete CPython TimSort. Continue curriculum authoring in reviewable checkpoints; planned metadata does not satisfy the strict full-catalog content gate.

Reference snippets stay outside automatic formatting because physical line locations are part of code synchronization. C++ exact powers use a dependency-free decimal magnitude helper. Scrollable visualizations are keyboard focusable.

### Stateful design cases (2026-10-16)

System Design cases keep requirements, estimates, service contracts and entity exercises in server-only modules. The authorized player progressively introduces the architecture before running the bounded model. Every model declares its limitations: the crawler is offline; the player does not contact cloud providers, deliver notifications, dispatch cars or charge money. Core reference implementations may deliberately use a full-scan correctness baseline or fully drained workers; these differences are stated in the lesson. Case outcomes include pending and uncertain states rather than pretending all failures are recoverable in a fixed trace.

Payment-event teaching models use integer minor units and balanced ledger effects. Food-order sagas retain resources after uncertain capture until reconciliation. These exercises are separate from the application's actual Razorpay billing implementation.

Database query models are checked against independent PostgreSQL JSON recordsets, avoiding writes to application tables. Functional-dependency analysis computes every minimal candidate key within an eight-attribute bound and distinguishes 3NF from BCNF; it does not infer domain rules from sample rows. Index planning uses explicit illustrative work units, not actual PostgreSQL EXPLAIN costs.

## Cloud and dependency-security checkpoint

Ten Cloud lessons are authored; the catalog has 178 ready and 23 planned entries. Remaining Cloud models are tested drafts, not complete lessons until their prose, quizzes and four-language references exist. The dependency graph has zero reported advisories at this checkpoint; see docs/DEPENDENCIES.md for compatibility overrides and the LHCI YAML patch. Both mobile Lighthouse pages pass accessibility/best-practices/SEO targets, but lesson performance remains below 90 (83 in the latest run); keep performance acceptance open. Exact source synchronization and production features remain pending.

Complexity chart samples are cached server-side by visualizer identity. Only standard deterministic sample counts enter this cache, never learner inputs; access checks remain before lesson loading. Local flagship players receive sample counts rather than computing four reference traces during hydration.

## Cloud curriculum scope

All 33 Cloud lessons are now authored. Reference snippets isolate documented local decision cores where a complete provider API/control plane would be misleading. Real differences (object delete markers versus live generations; serverless per-environment concurrency) affect outcomes, not merely labels. The Spanner overview separates a fixed-majority register from a declared uncertainty wait and does not claim to implement Paxos or demonstrate a true external-consistency anomaly when waiting is disabled. Cloud costs use user-supplied assumed rates, never fabricated live quotes. The capstone couples private reachability, identity and finite processing queues without provisioning resources.
