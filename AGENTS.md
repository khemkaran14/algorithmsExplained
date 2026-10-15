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
