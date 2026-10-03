import type { NextRequest } from "next/server";
import { getCacheVersions } from "@/server/cache/cache";
import { getSession } from "@/server/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const encoder = new TextEncoder();

export async function GET(request: NextRequest) {
  const session = await getSession(request);

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      let previous = "";

      const send = (event: string, data: unknown) => {
        if (!closed) {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        }
      };

      const checkVersions = async () => {
        try {
          const versions = await getCacheVersions();
          const serialized = JSON.stringify(versions);

          if (serialized !== previous) {
            previous = serialized;
            send("versions", { versions, updatedAt: new Date().toISOString() });
          }
        } catch (error) {
          console.error("Dashboard stream version check failed:", error);
        }
      };

      void checkVersions();
      const versionTimer = setInterval(() => void checkVersions(), 10_000);
      const heartbeatTimer = setInterval(() => send("heartbeat", { at: Date.now() }), 25_000);

      request.signal.addEventListener("abort", () => {
        closed = true;
        clearInterval(versionTimer);
        clearInterval(heartbeatTimer);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
