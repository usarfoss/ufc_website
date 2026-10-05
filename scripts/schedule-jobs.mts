/**
 * Creates (or updates) the repeating background jobs in QStash. Safe to run again: each schedule has a fixed id, so running it twice
 * changes nothing the second time.
 *
 *   npm run jobs:schedule              uses NEXTAUTH_URL (your deployed address) and QSTASH_TOKEN from .env
 *   npm run jobs:schedule -- --list    only shows what is scheduled
 *
 * It points the jobs at NEXTAUTH_URL, so run it with the production address set (a plain localhost address is refused, because QStash in the
 * cloud cannot reach your laptop). With a local QStash (QSTASH_URL on 127.0.0.1) it works against that instead, which is how to try it.
 */
import "dotenv/config";
import { Client } from "@upstash/qstash";

/** Fixed ids and times. Edit the cron here and run the script again to change how often a job runs. */
const JOBS = [
  {
    id: "github-reconcile",
    path: "/api/jobs/github-reconcile",
    cron: "0 */3 * * *",
    what: "refresh GitHub numbers for active members, every 3 hours",
  },
  {
    id: "leetcode-reconcile",
    path: "/api/jobs/leetcode-reconcile",
    cron: "30 */3 * * *",
    what: "refresh LeetCode numbers for linked members, every 3 hours",
  },
  {
    id: "activity-cleanup",
    path: "/api/jobs/activity-cleanup",
    cron: "15 * * * *",
    what: "delete activity older than 36 hours, every hour",
  },
] as const;

const token = process.env.QSTASH_TOKEN;
const base = process.env.NEXTAUTH_URL;
if (!token) throw new Error("QSTASH_TOKEN is not set.");

const local = /127\.0\.0\.1|localhost/.test(process.env.QSTASH_URL ?? "");
if (!local && (!base || /localhost|127\.0\.0\.1/.test(base))) {
  throw new Error("NEXTAUTH_URL must be your deployed address (https://fossclub.tech) so QStash in the cloud can reach it.");
}
if (!base) throw new Error("NEXTAUTH_URL is not set.");

const client = new Client({ token, ...(process.env.QSTASH_URL ? { baseUrl: process.env.QSTASH_URL } : {}) });

if (process.argv.includes("--list")) {
  for (const s of await client.schedules.list())
    console.log(`${s.scheduleId}  ${s.cron}  ${s.destination}${s.isPaused ? "  (paused)" : ""}`);
} else {
  for (const job of JOBS) {
    const destination = new URL(job.path, base).toString();
    await client.schedules.create({ scheduleId: job.id, destination, cron: job.cron, method: "POST", retries: 3 });
    console.log(`scheduled ${job.id}  ${job.cron}  ${destination}\n  ${job.what}`);
  }
}
