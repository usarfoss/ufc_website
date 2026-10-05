-- When the live poll last saw new GitHub or LeetCode activity from this member. Members with activity in the last 36 hours are polled every
-- minute; the rest every 6 hours. Only written when something changes.
ALTER TABLE "users" ADD COLUMN "liveActiveAt" TIMESTAMP(3);
