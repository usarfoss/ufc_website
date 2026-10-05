-- GitHub sign-in tokens last 8 hours. These two columns let the app renew a member's token by itself instead of asking them to sign in again.
-- Both are optional, so the app that is running now keeps working whether or not this has been applied yet.
ALTER TABLE "users" ADD COLUMN "githubRefreshTokenCiphertext" TEXT;
ALTER TABLE "users" ADD COLUMN "githubTokenExpiresAt" TIMESTAMP(3);
