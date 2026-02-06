-- CreateEnum
CREATE TYPE "public"."ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
ALTER TYPE "public"."AchievementCategory" ADD VALUE 'LEETCODE';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."ActivityType" ADD VALUE 'PROJECT_PROPOSAL';
ALTER TYPE "public"."ActivityType" ADD VALUE 'EVENT_PROPOSAL';
ALTER TYPE "public"."ActivityType" ADD VALUE 'PROJECT_APPROVED';
ALTER TYPE "public"."ActivityType" ADD VALUE 'PROJECT_REJECTED';
ALTER TYPE "public"."ActivityType" ADD VALUE 'EVENT_APPROVED';
ALTER TYPE "public"."ActivityType" ADD VALUE 'EVENT_REJECTED';
ALTER TYPE "public"."ActivityType" ADD VALUE 'LEETCODE_EASY';
ALTER TYPE "public"."ActivityType" ADD VALUE 'LEETCODE_MEDIUM';
ALTER TYPE "public"."ActivityType" ADD VALUE 'LEETCODE_HARD';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."LeaderboardType" ADD VALUE 'LEETCODE_PROBLEMS';
ALTER TYPE "public"."LeaderboardType" ADD VALUE 'TOTAL_POINTS';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."Role" ADD VALUE 'MAINTAINER';
ALTER TYPE "public"."Role" ADD VALUE 'VOLUNTEER';

-- AlterTable
ALTER TABLE "public"."events" ADD COLUMN     "approvalStatus" "public"."ApprovalStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedById" TEXT,
ADD COLUMN     "rejectionReason" TEXT;

-- AlterTable
ALTER TABLE "public"."projects" ADD COLUMN     "approvalStatus" "public"."ApprovalStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedById" TEXT,
ADD COLUMN     "rejectionReason" TEXT;

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "leetcodeUsername" TEXT,
ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpiry" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."leetcode_stats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "leetcodeUsername" TEXT NOT NULL,
    "totalSolved" INTEGER NOT NULL DEFAULT 0,
    "easySolved" INTEGER NOT NULL DEFAULT 0,
    "mediumSolved" INTEGER NOT NULL DEFAULT 0,
    "hardSolved" INTEGER NOT NULL DEFAULT 0,
    "ranking" INTEGER,
    "reputation" INTEGER NOT NULL DEFAULT 0,
    "acceptanceRate" DOUBLE PRECISION,
    "lastSynced" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leetcode_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "leetcode_stats_userId_key" ON "public"."leetcode_stats"("userId");

-- CreateIndex
CREATE INDEX "leetcode_stats_lastSynced_idx" ON "public"."leetcode_stats"("lastSynced");

-- CreateIndex
CREATE INDEX "activities_userId_createdAt_idx" ON "public"."activities"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "activities_createdAt_idx" ON "public"."activities"("createdAt");

-- CreateIndex
CREATE INDEX "event_attendees_userId_idx" ON "public"."event_attendees"("userId");

-- CreateIndex
CREATE INDEX "event_attendees_eventId_idx" ON "public"."event_attendees"("eventId");

-- CreateIndex
CREATE INDEX "github_stats_lastSynced_idx" ON "public"."github_stats"("lastSynced");

-- CreateIndex
CREATE INDEX "notifications_userId_createdAt_idx" ON "public"."notifications"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "project_members_userId_idx" ON "public"."project_members"("userId");

-- CreateIndex
CREATE INDEX "project_members_projectId_idx" ON "public"."project_members"("projectId");

-- CreateIndex
CREATE INDEX "users_joinedAt_idx" ON "public"."users"("joinedAt");

-- CreateIndex
CREATE INDEX "users_lastActive_idx" ON "public"."users"("lastActive");

-- AddForeignKey
ALTER TABLE "public"."projects" ADD CONSTRAINT "projects_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."events" ADD CONSTRAINT "events_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leetcode_stats" ADD CONSTRAINT "leetcode_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
