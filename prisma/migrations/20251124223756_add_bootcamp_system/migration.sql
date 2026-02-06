-- CreateEnum
CREATE TYPE "public"."BootcampType" AS ENUM ('LEETCODE', 'GITHUB');

-- CreateEnum
CREATE TYPE "public"."BootcampStatus" AS ENUM ('UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."bootcamps" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "public"."BootcampType" NOT NULL,
    "status" "public"."BootcampStatus" NOT NULL DEFAULT 'UPCOMING',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "bootcamps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bootcamp_participants" (
    "id" TEXT NOT NULL,
    "bootcampId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "baselineStats" JSONB NOT NULL,
    "currentStats" JSONB,
    "progressStats" JSONB,
    "finalRank" INTEGER,
    "finalPoints" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "bootcamp_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bootcamp_snapshots" (
    "id" TEXT NOT NULL,
    "bootcampId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "stats" JSONB NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bootcamp_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bootcamps_status_startDate_idx" ON "public"."bootcamps"("status", "startDate");

-- CreateIndex
CREATE INDEX "bootcamps_endDate_idx" ON "public"."bootcamps"("endDate");

-- CreateIndex
CREATE INDEX "bootcamp_participants_bootcampId_finalPoints_idx" ON "public"."bootcamp_participants"("bootcampId", "finalPoints");

-- CreateIndex
CREATE UNIQUE INDEX "bootcamp_participants_bootcampId_userId_key" ON "public"."bootcamp_participants"("bootcampId", "userId");

-- CreateIndex
CREATE INDEX "bootcamp_snapshots_bootcampId_capturedAt_idx" ON "public"."bootcamp_snapshots"("bootcampId", "capturedAt");

-- CreateIndex
CREATE INDEX "bootcamp_snapshots_participantId_capturedAt_idx" ON "public"."bootcamp_snapshots"("participantId", "capturedAt");

-- AddForeignKey
ALTER TABLE "public"."bootcamps" ADD CONSTRAINT "bootcamps_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bootcamp_participants" ADD CONSTRAINT "bootcamp_participants_bootcampId_fkey" FOREIGN KEY ("bootcampId") REFERENCES "public"."bootcamps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bootcamp_participants" ADD CONSTRAINT "bootcamp_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bootcamp_snapshots" ADD CONSTRAINT "bootcamp_snapshots_bootcampId_fkey" FOREIGN KEY ("bootcampId") REFERENCES "public"."bootcamps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
