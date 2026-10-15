# Phase 1 validation checkpoint

Validated in the cloud workspace on 2026-10-16 (Asia/Kolkata). Phase 1 acceptance is **still open**; Phase 2 has not started.

## Passed

- Frozen pnpm 10.28.2 install, formatting, ESLint with zero warnings, TypeScript strict checks.
- Two Vitest Button component tests.
- `next build` and standalone asset preparation; production pages render successfully. This validates the frontend/server bundle, not Prisma generation.
- Six Playwright tests across desktop and mobile: navigation, theme, axe accessibility, unconfigured sign-in state, anonymous dashboard redirect, and 320px overflow.
- Lighthouse mobile landing report: Performance 97, Accessibility 100, Best Practices 96, SEO 100. Scores vary by host; Phase 7 will enforce thresholds and cover lesson pages.
- PostgreSQL 17 and Redis 7 are healthy. Migration SQL was executed in a rolled-back transaction, including user/session insertion and cascading session deletion. Redis returned PONG.
- Local environment initializer preserves existing files; local secrets are ignored by Git.

## Blocked or unverified

- `prisma generate` and `prisma migrate deploy`: the environment proxy denies binaries.prisma.sh with HTTP 403. The full `pnpm build` intentionally retains Prisma generation and therefore remains blocked here. Verification was never bypassed.
- The Auth.js PostgreSQL adapter integration test has not run; it needs the generated client and deployed migration. The SQL smoke check is not a substitute for this test.
- Google OAuth and Resend magic-link sign-in/out: no provider credentials are injected. Configure the fields in .env.example or environment settings, register the Google callback, use a verified Resend sender, and then verify a real sign-in → /learn → sign-out flow.
- Hosted GitHub Actions results have not been observed. The committed workflow runs installation, migrations, formatting, lint, types, all unit/integration tests, build, Playwright and Lighthouse.
- Docker services ran successfully; the full application Docker image has not been built because its Prisma preparation has the same external prerequisite.

## Resume

1. Review and save the environment network additions and provider requirements. Publishing is a separate product action; saving a draft does not change runtime policy by itself.
2. Run `pnpm db:generate`, `pnpm db:migrate`, `pnpm test`, `pnpm build`, `pnpm test:e2e`, and `pnpm test:lighthouse`.
3. Confirm the adapter test executes and real provider sign-in/out works. Observe hosted CI before declaring the phase complete.
4. Update this report with actual outcomes. Continue to Phase 2 only after the Phase 1 acceptance gate passes.

This is a foundation checkpoint, not a production-ready completion of the full product specification.
