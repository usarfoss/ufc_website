import type { NextRequest } from "next/server";
import { getCacheVersions, type CacheNamespace } from "@/server/cache/cache";
import { getSession } from "@/server/auth/session";
import { markWatching, touchSiteActive } from "@/server/features/live/poll-state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const encoder = new TextEncoder();
/**
 * How often this server looks at the cache versions while anyone is connected. Every look is a Redis request, a server that always has a
 * viewer makes 8,600 of them a day at this pace, and the live poll only runs once a minute anyway, so a change shows up within about ten
 * seconds of being made, which is as quick as it needs to be.
 */
const CHECK_EVERY_MS = 10_000;
/** How often the members with a dashboard open on this server are reported, all in one write (the note lasts 150 seconds). */
const REPORT_EVERY_MS = 30_000;

/**
 * One check on behalf of every open stream on this server. Each stream used to ask Redis for the versions on its own timer, so ten open tabs
 * meant ten times the requests for the same answer. Now a single timer runs while anyone is connected and tells them all.
 */
type Versions = Record<CacheNamespace, number>;
type Listener = (versions: Versions) => void;
const listeners = new Set<Listener>();
/** Who has a dashboard open on this server (a member with two tabs counts once). */
const watchers = new Map<string, number>();
let timer: ReturnType<typeof setInterval> | null = null;
let latest: Versions | null = null;
let checking: Promise<void> | null = null;
let reportedAt = 0;

/**
 * While anyone has a dashboard open, this server runs the live poll itself once a minute, so the people looking get changes within about a
 * minute without a QStash message for each one. (QStash still runs its own poll every few minutes for when nobody is looking, and a poll
 * that has just run makes the next one stand aside.) Only in production, so a dashboard open on a laptop never polls the real members.
 */
const POLL_EVERY_MS = 60_000;
let lastPollAt = 0;
let polling = false;

function pollWhileWatched() {
  if (polling || listeners.size === 0 || Date.now() - lastPollAt < POLL_EVERY_MS) return;
  if (process.env.NODE_ENV !== "production" && process.env.POLL_WHILE_WATCHED !== "on") return;
  lastPollAt = Date.now();
  polling = true;
  import("@/server/features/live/live-poll")
    .then(({ runGatedLivePoll }) => runGatedLivePoll({ budgetMs: 40_000, watching: [...watchers.keys()] }))
    .catch((error) => console.error("Poll while watching failed:", error))
    .finally(() => {
      polling = false;
    });
}

/**
 * "These members have a dashboard open," said once for everyone on this server instead of once per member (a write per viewer every half
 * minute adds up quickly with a few hundred people). It also says the site is in use, which is what keeps the scheduled poll running.
 */
function report() {
  if (watchers.size === 0 || Date.now() - reportedAt < REPORT_EVERY_MS - 1_000) return;
  reportedAt = Date.now();
  void markWatching([...watchers.keys()]);
  void touchSiteActive();
}

function check() {
  checking ??= getCacheVersions()
    .then((versions) => {
      latest = versions;
      for (const listener of listeners) listener(versions);
    })
    .catch((error) => console.error("Dashboard stream version check failed:", error))
    .finally(() => {
      checking = null;
    });
  return checking;
}

async function subscribe(listener: Listener, userId: string) {
  listeners.add(listener);
  watchers.set(userId, (watchers.get(userId) ?? 0) + 1);
  timer ??= setInterval(() => {
    void check();
    report();
    pollWhileWatched();
  }, CHECK_EVERY_MS);
  void touchSiteActive();
  report();
  pollWhileWatched();
  // Someone joining mid-way is told where things stand from the last check, or from a fresh one if there has not been one yet.
  if (latest) listener(latest);
  else await check();
}

function unsubscribe(listener: Listener, userId: string) {
  listeners.delete(listener);
  const left = (watchers.get(userId) ?? 1) - 1;
  if (left > 0) watchers.set(userId, left);
  else watchers.delete(userId);
  if (listeners.size === 0 && timer) {
    clearInterval(timer);
    timer = null;
    latest = null;
    reportedAt = 0;
  }
}

export async function GET(request: NextRequest) {
  const session = await getSession(request);

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let cleanup = () => {};

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      let previous = "";

      const send = (event: string, data: unknown) => {
        if (!closed) {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        }
      };

      const onVersions: Listener = (versions) => {
        const serialized = JSON.stringify(versions);
        if (serialized !== previous) {
          previous = serialized;
          send("versions", { versions, updatedAt: new Date().toISOString() });
        }
      };

      // The first message tells the page where things stand, and then each message follows an actual change.
      const heartbeatTimer = setInterval(() => send("heartbeat", { at: Date.now() }), 25_000);
      void subscribe(onVersions, session.userId);

      cleanup = () => {
        if (closed) return;
        closed = true;
        clearInterval(heartbeatTimer);
        unsubscribe(onVersions, session.userId);
        try {
          controller.close();
        } catch {
          // Already closed by the browser leaving.
        }
      };
    },
    cancel() {
      cleanup();
    },
  });

  request.signal.addEventListener("abort", () => cleanup());

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
