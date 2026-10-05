-- The rich part of an event proposal (overview, schedule, rounds, speaker, ...), the same fields the public event pages show.
-- One nullable JSONB column, so existing rows are untouched.
ALTER TABLE "events" ADD COLUMN "details" JSONB;
