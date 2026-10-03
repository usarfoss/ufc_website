"use client";

import { useEffect, useState } from "react";
import { Calendar, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/auth-provider";
import { Pin, Tape } from "@/components/home/scrap";
import { useApi } from "@/components/dashboard/use-api";
import { Empty, ErrorPanel, isStaff, Loading, PageHeader, useToast } from "@/components/dashboard/ui";

interface PendingEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  type: string;
  creator: { name: string | null; githubUsername: string | null };
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const staff = !!user && isStaff(user.role);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { show, node } = useToast();
  const { data, error, loading, reload, refresh } = useApi<{ events?: PendingEvent[] }>(
    staff ? "/api/dashboard/admin/pending-events" : null,
    {
      errorMessage: "We couldn't load the review queue just now.",
    },
  );
  const events = data?.events ?? [];

  useEffect(() => {
    if (!staff) router.replace("/dashboard");
  }, [staff, router]);

  const review = async (eventId: string, action: "approve" | "reject") => {
    setProcessingId(eventId);
    try {
      const res = await fetch("/api/dashboard/admin/approve-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, action }),
      });
      if (!res.ok) throw new Error("Unable to review event");
      show(action === "approve" ? "Event approved." : "Event rejected.");
      refresh();
    } catch (error) {
      console.error("Event review failed:", error);
      show("That didn't go through. Please try again.", false);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="§ admin · staff only"
        title="Event"
        accent="review."
        tone="butter"
        art="lgtm"
        sub="Events proposed by maintainers wait here for a yes or a no."
      />

      {loading ? (
        <Loading label="loading the queue" />
      ) : error ? (
        <ErrorPanel title="Couldn't load the queue" message={error} onRetry={reload} />
      ) : events.length === 0 ? (
        <Empty art="heart" title="All caught up" body="No events are waiting for review." />
      ) : (
        <ul className="grid gap-7">
          {events.map((e, i) => (
            <li key={e.id}>
              <Pin r={i % 2 ? 0.6 : -0.6} drag={false}>
                <article className="paper relative flex flex-wrap items-start justify-between gap-6 px-6 pb-6 pt-9 sm:px-8">
                  <Tape tone="butter" className="-top-3 left-8" rotate={-4} />
                  <div className="min-w-0 max-w-3xl">
                    <h2 className="text-[1.7rem] leading-tight">{e.title}</h2>
                    <p className="mt-2 leading-[1.6] text-[var(--ink)]/80">{e.description}</p>
                    <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.9rem] font-semibold text-[var(--ink)]/65">
                      <span className="flex items-center gap-2">
                        <Calendar size={15} strokeWidth={2.4} />
                        {new Date(e.date).toLocaleString()}
                      </span>
                      <span>{e.location}</span>
                      <span className="code rounded-full border-2 border-[var(--ink)] bg-[var(--butter)] px-2.5 py-0.5 text-[0.7rem] font-bold uppercase">
                        {e.type}
                      </span>
                    </p>
                    <p className="mt-2 text-[0.88rem] text-[var(--ink)]/55">
                      Proposed by {e.creator.name || e.creator.githubUsername || "someone"}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      disabled={processingId === e.id}
                      onClick={() => void review(e.id, "approve")}
                      className="btn btn-signal btn-sm"
                    >
                      <Check size={15} strokeWidth={3} /> Approve
                    </button>
                    <button
                      type="button"
                      disabled={processingId === e.id}
                      onClick={() => void review(e.id, "reject")}
                      className="btn btn-pink btn-sm"
                    >
                      <X size={15} strokeWidth={3} /> Reject
                    </button>
                  </div>
                </article>
              </Pin>
            </li>
          ))}
        </ul>
      )}
      {node}
    </div>
  );
}
