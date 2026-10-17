# AlgoVerse

Interactive visual lessons for algorithms, with reversible playback, Try challenges, quizzes, progress, and purchase-gated content. **This is an implementation checkpoint, not a production-ready release.** All 201 catalog lessons are authored (112 DSA, 35 System Design, 21 Databases and 33 Cloud). Final production features, source synchronization and release audits remain open. See [testing instructions](docs/TESTING.md), [validation](docs/VALIDATION.md) and the [original specification](docs/PRODUCT_SPEC.md).

## Run locally

Install Node.js 22 LTS (22.12 or newer patch), pnpm 10.28.2, Git and Docker with Compose. Start Docker, then:

```bash
git clone https://github.com/khemkaran14/algorithmsExplained.git
cd algorithmsExplained
corepack enable
corepack prepare pnpm@10.28.2 --activate
pnpm install --frozen-lockfile
pnpm setup:local
docker compose up -d postgres redis
pnpm db:generate
pnpm db:migrate
pnpm dev
```

Open **http://localhost:3000**. If already cloned, run `git pull origin main` first. `pnpm setup:local` creates a private `.env` with random local database/session secrets and preserves an existing file. Do not commit `.env`.

You can browse and test free lessons without external credentials. Start at `/learn`, `/playground` or `/compare`. `/learn` is public; `/account` requires sign-in. Paid lessons remain locked until a captured payment grants access. All 201 curriculum entries are authored.

## Optional provider configuration

Add settings from `.env.example` to `.env`, then restart the server:

- Google OAuth: `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`; register `http://localhost:3000/api/auth/callback/google` as the redirect URI.
- Email magic links: `AUTH_RESEND_KEY`, `AUTH_EMAIL_FROM` using a verified Resend sender.
- Payments: Razorpay **test-mode** `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`. The webhook path is `/api/webhooks/razorpay`; Razorpay needs a reachable HTTPS endpoint for webhook delivery. Keep `AUTH_URL` consistent with the origin used in your browser.

For the existing Hostinger deployment, follow [Razorpay setup and acceptance](docs/RAZORPAY_SETUP.md). `pnpm payments:check` checks required settings without network requests; append `--provider` for a read-only API authentication check. The runtime image includes the same checker and a separate receipt-retry command.

Provider credentials are not included. Real Google/email login and Razorpay Checkout are operator acceptance tests; the automated webhook suite uses signed fixtures and a real test database. No production authentication bypass exists.

## Validate

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm content:check
pnpm content:free-ratio
pnpm build
pnpm exec playwright install --with-deps chromium
pnpm test:e2e
```

Use a disposable local test database for tests: integration/browser suites create and remove fixture users and payments. Close any development server on port 3000 before running browser checks, so Playwright starts the intended production build. `pnpm content:check` is the strict catalog gate and must pass for all 201 lessons. Four-language references can additionally be syntax-checked with `python3 scripts/check-snippets.py` (requires Python 3, JDK 17+ and g++ with C++17).

For a production-build preview, run `pnpm build`, then `RATE_LIMIT_MODE=memory pnpm start`. Deployment is a later step.

## Container preview

After local migrations and filling `.env`, run `RATE_LIMIT_MODE=memory docker compose --profile app up --build -d`. Run migrations from the host/build environment; the application image contains runtime dependencies only. Production domains, database backups, business/legal details and live payment configuration still require the deployment and launch review.

### Production request protection

Development uses a bounded in-process rate limiter. For a local production-build preview run `RATE_LIMIT_MODE=memory pnpm start`. This mode is per instance and is only for local/preview use. A production launch requires `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`; a missing or unavailable shared store returns 503 on protected APIs rather than silently dropping protection. Requests use fixed-window budgets; exceeding one returns 429 and Retry-After.

Vercel uses its platform-owned client address header. Self-hosted operators may set `TRUSTED_PROXY_IP_HEADER` only when the ingress proxy overwrites that header and direct app ingress is blocked. Raw `x-forwarded-for` is ignored. Without a trusted address, requests share a conservative anonymous bucket. `/api/health` reports database readiness and shared versus local-preview request protection without connection details.
