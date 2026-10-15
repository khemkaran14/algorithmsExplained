# Decisions

- Implement Phase 1 first; do not claim the eight-phase product is complete. Four tracks are honest roadmap cards rather than dead lesson links. The landing sorting graphic is an illustrative CSS preview, not the Phase 2 engine.
- Use PostgreSQL 17 and Redis 7 via Compose. Redis is provisioned for later phases; Phase 1 does not depend on it. Prisma 6 avoids adopting Prisma 7 configuration changes during foundation work.
- Auth.js uses database sessions, Prisma adapter, Google and Resend. Enable each provider only when its required settings exist. No dummy login, paid entitlement or auth bypass. External sign-in validation requires user-managed provider credentials.
- Follow shadcn's source-owned component convention; Button uses Radix Slot and class-variance-authority. System fonts avoid external font network dependencies and layout shifts.
- English via next-intl; Hindi translation will ship in a later phase.
- CI runs foundation checks now. Lighthouse smoke reports run now; score thresholds, audit enforcement and production hardening are Phase 7 work. Hosted CI status must be observed separately from local checks.

- Pin next-intl 4.3.12: later releases eagerly load an SWC native extractor whose trusted-cache requirements are incompatible with this cloud filesystem. No artifact verification is disabled.
- Sign-in is dynamically rendered so provider settings are read at runtime. Standalone startup binds all container interfaces and includes static assets.
