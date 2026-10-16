# AlgoVerse contributor guide

Phase 1 foundation: Next.js 15 App Router, React 19, strict TypeScript, Tailwind v4, shadcn-compatible Radix UI components, Auth.js v5, Prisma/Postgres. UI messages live in messages/en.json through next-intl; theme uses next-themes.

Use the existing isolated checkout; do not create worktrees unless requested.

## Commands

`pnpm install --frozen-lockfile`, `pnpm db:generate`, `docker compose up -d postgres redis`, `pnpm db:migrate`, `pnpm dev`. Run `pnpm setup:local` first to generate a local .env without overwriting existing settings; see .env.example for provider variables. Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm test:e2e`, `pnpm format:check` before committing.

## Conventions

Keep components small, use strict types, no unjustified any. Never log secrets. Auth stays on the server. Never ship paid lesson content to unauthorized clients. Product name and price live in src/config. Use semantic HTML, labelled controls, reduced motion, 320px layouts, and translated UI strings. Use migrations for schema changes.

## Adding lessons (Phase 2 onward)

Use content/<track>/<module>/<slug>/{lesson.mdx,visualizer.ts,quiz.ts,meta.ts,code/}. Generator frames must be deterministic serializable snapshots; unit-test each generator. Provide four language snippets, complexity, presets and input validation. Do not mark content complete until the planned content validator and all lesson sections exist. Five flagship lessons now exist; see src/engine for the pure generators.

## Phase gate

Validate and commit each implementation phase; externally blocked acceptance checks stay pending while independent work continues under the user’s latest instruction; update docs/DECISIONS.md, CHANGELOG.md and this file. Real provider sign-in requires external credentials and must not be replaced by a production auth bypass.

## Learning data

`src/learning` contains validated local progress, monotonic account merging and SM-2 scheduling. Anonymous `/learn` is public; `/account` requires a real Auth.js session. Progress writes require same-origin requests. Keep browser data scoped to its account owner and clear it on sign-out. Quizzes are graded server-side when authenticated; never use XP as an entitlement. End-to-end session fixtures live only in test code and create real database sessions; production has no test-login route.

## Content and billing boundaries

Public catalog metadata lives separately from server-only lesson MDX, quizzes and visualizer loaders. Check access before calling `loadLesson`, `loadQuiz` or `serverLessonData`; never import paid generators in client code. Public flagship engines are explicitly always free. Paid players receive authorized snapshots and request new inputs through the protected frames route.

`pnpm content:generate-catalog` applies module ordering and documented free-budget overrides. `pnpm content:free-ratio` enforces the global budget and a free sample in every module. During Phases 4–6 authoring, `pnpm content:check:ready` reports implemented and planned counts. Strict `pnpm content:check` must pass for every lesson before curriculum completion; it intentionally fails planned entries. Do not describe metadata stubs as completed lessons.

Billing lives in `src/payments`. Never trust client prices, claim payment success from Checkout.js alone, reactivate refunded access, recycle payable coupon reservations, or log secrets/signatures. Test fixtures use synthetic provider messages and real test database sessions; they do not establish external provider validation. Legal templates and business details require operator review before launch.

## Phase 5 authoring checkpoint

All 112 DSA lessons currently have content and generators. Shared server-only lesson families live in `src/server/visualizers`. Structured inputs are validated per lesson; never coerce arbitrary JSON into numeric arrays. `scripts/check-snippets.py` syntax-checks all four reference languages. Keep snippet directories excluded from automated formatting so code-line mappings remain stable. All 12 tree generators have invariant tests and complete lesson references. Playground runs do not write learning progress; comparisons authorize every selected lesson before loading any protected content.

Use `pnpm content:check:dsa` as the strict DSA gate while other tracks are authored. Variant references are checked too. `pnpm content:generate-complexity` emits explicitly public complexity fields only, never narration, code or quizzes. Security lesson keys/salts are labelled public teaching fixtures; TLS fixtures contain certificates only, not private keys. C++ cryptography references need OpenSSL development headers. Fine-grained physical source-line synchronization needs its final release audit.

## Phase 6 simulation checkpoint

119 total lessons are authored: all 112 DSA plus seven System Design foundations. Shared state models live in `src/server/simulations`; parameter controls are serialized explicitly in `RemoteLessonData`. Models must state their scope and assumptions, preserve request/task accounting, use deterministic inputs, and never pretend to implement an entire production distributed protocol. Player input requests cancel older requests to prevent stale responses. Model correctness tests cover capacity, partitions/session tokens, retries, cache persistence, IDs, sharding and quorum fencing. Other building-block models await complete references before catalog registration.

## System Design curriculum checkpoint

All 35 System Design lessons are authored, including 12 case studies; 147 of 201 total lessons are ready. `pnpm content:check:system-design` is now a strict gate. Case studies require explicit requirements, editable estimate assumptions, API/entity exercises, progressive architecture and failure instructions. Keep these descriptions server-only until access is authorized. Pure case simulations perform no real crawling, delivery, charging or cloud provisioning. Independent tests cover retry identity, room replay, feed materialization, adaptive playback, crawl accounting, exact prefix ranking, nearest-driver reservation, cache recovery, balanced payment ledgers and saga resource ownership. Database/Cloud authoring and final production/source-sync audits remain open.

## Database curriculum checkpoint

All 21 Database lessons are authored; `pnpm content:check:databases` is a strict gate. Database models live in `src/server/simulations/database`. Their declared scope is part of correctness: PostgreSQL READ UNCOMMITTED acts as READ COMMITTED; a repeatable-read snapshot is acquired at first data access; the teaching serialization graph is not full SSI; WAL recovery is a bounded single-recovery pass, not complete ARIES. B+ page splitting/search reuses the tested tree engine. Pool models respect local ownership and a shared physical cap. LSM partial compaction retains tombstones. Independent PostgreSQL tests use random isolated schemas or JSON recordsets and never mutate application tables. Cloud authoring and the final release audits remain open.

## Cloud and dependency-security checkpoint

Ten Cloud lessons are authored; the catalog has 178 ready and 23 planned entries. Remaining Cloud models are tested drafts, not complete lessons until their prose, quizzes and four-language references exist. The dependency graph has zero reported advisories at this checkpoint; see docs/DEPENDENCIES.md for compatibility overrides and the LHCI YAML patch. Both mobile Lighthouse pages pass accessibility/best-practices/SEO targets, but lesson performance remains below 90 (83 in the latest run); keep performance acceptance open. Exact source synchronization and production features remain pending.

## Complete curriculum authoring checkpoint

All 201 lessons are authored: DSA 112, System Design 35, Databases 21, Cloud 33. All four track validators and the strict global validator must pass in CI; no planned-content exception remains. Cloud models live in `src/server/simulations/cloud`; native provider differences are implemented explicitly where relevant (serverless concurrency and object versions), while generic wrappers identify conceptual mappings without claiming identical APIs. Four-language references declare their exact core scope in each lesson. The three-tier capstone is a local teaching model and never deploys real resources. Code-line synchronization and production acceptance remain separate open release gates.

## Request protection

Middleware supplies fresh CSP nonces to both Next's request renderer and response headers; pass the nonce to any explicit inline script. Browser Zod schemas use `src/lib/validation.ts` so parsing never probes eval. Do not weaken production CSP to work around a library probe. Rate limits use atomic shared Redis windows in production; only explicit local-preview memory mode may run without Upstash. Never trust arbitrary forwarded IP headers. Body limits count raw bytes while streaming; webhooks retain their signature check and larger explicit cap. `/api/health` reveals only coarse readiness. Logging helpers accept fixed events/coarse error categories, never requests or Error objects.

## Account and admin features

Account export/deletion use authenticated, same-origin routes with an explicit deletion phrase. Exports whitelist profile/learning/purchase fields and exclude sign-in tokens. User deletion cascades private data and leaves payment reconciliation records with a null user link. Never run destructive tests against real accounts; fixtures have generated IDs. `pnpm seed:admin` promotes one existing account selected by ADMIN_EMAIL, never creates an account or bypass route. Admin pages recheck the stored role, validate filters, paginate stably, and report the global free ratio. Coupon disable does not alter existing payable orders.

Production lessons stream their header before model/code preparation. Static lesson results have a bounded server-only cache; access checks precede the loader. Search loads public catalog data and result links only when opened. Mobile code token DOM mounts when its tab is opened. Lighthouse uses three mobile runs with median category thresholds of 90 for landing and the free Bubble Sort lesson; do not weaken these checks or use optimistic aggregation to hide failures.

## First-time learner navigation

The homepage primary action opens the free Bubble Sort lesson. Keep the shared getting-started guide on both the homepage and learning dashboard, preserve working links for every authored track, and distinguish paid access from unfinished content. Do not reintroduce development-phase announcements in the public learning journey.
