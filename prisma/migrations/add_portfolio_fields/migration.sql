-- AlterTable
ALTER TABLE "users" ADD COLUMN "portfolioSlug" TEXT,
ADD COLUMN "portfolioPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "tagline" TEXT,
ADD COLUMN "techStack" JSONB,
ADD COLUMN "resumeUrl" TEXT,
ADD COLUMN "websiteUrl" TEXT,
ADD COLUMN "linkedinUrl" TEXT,
ADD COLUMN "twitterUrl" TEXT,
ADD COLUMN "portfolioTheme" TEXT DEFAULT 'default';

-- CreateIndex
CREATE UNIQUE INDEX "users_portfolioSlug_key" ON "users"("portfolioSlug");
