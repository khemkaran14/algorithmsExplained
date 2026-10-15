# AlgoVerse

An interactive learning platform for algorithms, system design, databases and cloud. **Phase 1 foundation**; lessons, payments and progress are planned, not implemented.

## Local development

Use Node 22+ and pnpm 10.28.2. Run `pnpm install --frozen-lockfile`, run `pnpm setup:local` to create a private local `.env` with random database and session secrets (existing files are preserved). Use `.env.example` to add provider settings. Run `docker compose up -d postgres redis`, `pnpm db:generate`, `pnpm db:migrate`, then `pnpm dev`.

For Google, create an OAuth web client with redirect URI `http://localhost:3000/api/auth/callback/google`; set AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET. For email magic links set AUTH_RESEND_KEY and AUTH_EMAIL_FROM to a verified Resend sender. Restart after changing provider configuration. Sign in at `/sign-in`, confirm `/learn` works, sign out and verify `/learn` redirects. Without credentials the landing page works and sign-in displays a clear setup state. Real OAuth/email success is not covered by offline tests.

## Validation

`pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build`. Install Chromium using `pnpm exec playwright install --with-deps chromium`, then run `pnpm test:e2e` for desktop/mobile, axe accessibility, protected routing and 320px overflow checks.

## Container

After filling `.env`, run `docker compose --profile app up --build -d`. Run migrations first with the host setup above; the production image intentionally contains only runtime dependencies. Production migration should run from the build/CI environment with its DATABASE_URL. Set AUTH_URL to your real HTTPS origin and configure trusted proxy handling for your deployment per Auth.js documentation. Do not enable trust of arbitrary hosts on a public deployment.

See [decisions](docs/DECISIONS.md), [phase status](CHANGELOG.md), and [contributor guide](AGENTS.md). The complete product request is retained in docs/PRODUCT_SPEC.md.

## Current cloud validation limitations

See [validation status](docs/VALIDATION.md). Phase 1 acceptance remains open until Prisma generation/migration, database-adapter tests, hosted CI, and real provider sign-in/out have been verified.
