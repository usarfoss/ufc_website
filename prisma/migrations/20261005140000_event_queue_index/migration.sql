-- The review queue reads waiting proposals oldest first, and the public lists read approved events by date.
CREATE INDEX "events_approvalStatus_createdAt_idx" ON "events"("approvalStatus", "createdAt");
