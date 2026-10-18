-- Unknown historical signup dates remain null. New accounts get the real creation time.
ALTER TABLE "User" ADD COLUMN "createdAt" TIMESTAMP(3);
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Entitlement" ADD COLUMN "expiresAt" TIMESTAMP(3);
UPDATE "Entitlement" SET "expiresAt" = "grantedAt" + INTERVAL '5 years';
ALTER TABLE "Entitlement" ALTER COLUMN "expiresAt" SET NOT NULL;
ALTER TABLE "Entitlement" ALTER COLUMN "expiresAt" SET DEFAULT (CURRENT_TIMESTAMP + INTERVAL '5 years');
CREATE INDEX "Entitlement_userId_type_revokedAt_expiresAt_idx" ON "Entitlement"("userId", "type", "revokedAt", "expiresAt");
