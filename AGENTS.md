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
