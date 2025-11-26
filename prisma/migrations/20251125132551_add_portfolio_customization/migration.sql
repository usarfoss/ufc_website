-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "customSections" JSONB,
ADD COLUMN     "portfolioSubtitle" TEXT,
ADD COLUMN     "portfolioTitle" TEXT,
ADD COLUMN     "showAchievements" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showBootcamps" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showEmail" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showGithubStats" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showJoinDate" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showLeetcodeStats" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showLocation" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showProjects" BOOLEAN NOT NULL DEFAULT true;
