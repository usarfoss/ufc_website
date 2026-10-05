"use client";

import { useEffect, useState } from "react";
import { Calendar, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/auth-provider";
import { Pin, Tape } from "@/components/home/scrap";
import { useApi, useVersionStream } from "@/components/dashboard/use-api";
import { Empty, ErrorPanel, Field, isAdmin, Loading, Modal, PageHeader, useToast } from "@/components/dashboard/ui";
import { EventDetailsView } from "@/components/dashboard/event-details";
import type { EventDetails } from "@/types/events";

interface PendingEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  type: string;
  maxAttendees: number;
  createdAt: string;
  details?: EventDetails;
  creator: { name: string | null; githubUsername: string | null };
}

const waited = (iso: string) => {
  const hours = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
};

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const admin = !!user && isAdmin(user.role);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectFor, setRejectFor] = useState<PendingEvent | null>(null);
  const [reason, setReason] = useState("");
  const [reading, setReading] = useState<PendingEvent | null>(null);
  const { show, node } = useToast();
  const { data, error, loading, reload, refresh } = useApi<{ events?: PendingEvent[] }>(
    admin ? "/api/dashboard/admin/pending-events" : null,
    {
      errorMessage: "We couldn't load the review queue just now.",
    },
  );
  useVersionStream("events", refresh); // a new proposal shows up in the queue as it arrives
  const events = data?.events ?? [];

  useEffect(() => {
    if (user && !admin) router.replace("/dashboard");
  }, [user, admin, router]);

  /** One decision. A 409 means somebody else got there first, which is fine: we just refresh the queue. */
  const decide = async (event: PendingEvent, action: "approve" | "reject") => {
    setProcessingId(event.id);
    try {
      const res = await fetch(`/api/dashboard/events/${event.id}/${action}`, {
        method: "POST",
        headers: action === "reject" ? { "Content-Type": "application/json" } : undefined,
        body: action === "reject" ? JSON.stringify({ reason }) : undefined,
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        show(body.error ?? "That didn't go through. Please try again.", false);
        if (res.status === 409) refresh();
        return;
      }
      show(action === "approve" ? "Approved. It's open for registration." : "Rejected. The proposer can see why.");
      setRejectFor(null);
      setReason("");
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
        eyebrow="§ admin · admins only"
        title="Event"
        accent="review."
        tone="butter"
        art="lgtm"
        sub="Events members propose wait here, oldest first, for a yes or a no. A no always comes with a reason."
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
                    <p className="mt-2 whitespace-pre-line leading-[1.6] text-[var(--ink)]/80">{e.description}</p>
                    <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.9rem] font-semibold text-[var(--ink)]/65">
                      <span className="flex items-center gap-2">
                        <Calendar size={15} strokeWidth={2.4} />
                        {new Date(e.date).toLocaleString()}
                      </span>
                      <span>{e.location}</span>
                      <span>up to {e.maxAttendees}</span>
                      <span className="code rounded-full border-2 border-[var(--ink)] bg-[var(--butter)] px-2.5 py-0.5 text-[0.7rem] font-bold uppercase">
                        {e.type}
                      </span>
                    </p>
                    <p className="mt-2 text-[0.88rem] text-[var(--ink)]/55">
                      Proposed by {e.creator.name || e.creator.githubUsername || "someone"} · waiting {waited(e.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      disabled={processingId === e.id}
                      onClick={() => void decide(e, "approve")}
                      className="btn btn-signal btn-sm"
                    >
                      <Check size={15} strokeWidth={3} /> {processingId === e.id ? "Working…" : "Approve"}
                    </button>
                    <button type="button" disabled={processingId === e.id} onClick={() => setRejectFor(e)} className="btn btn-pink btn-sm">
                      <X size={15} strokeWidth={3} /> Reject
                    </button>
                  </div>
                </article>
              </Pin>
            </li>
          ))}
        </ul>
      )}

      <Modal open={!!reading} onClose={() => setReading(null)} title={reading?.title ?? "Proposal"} tone="butter" size="lg">
        {reading?.details ? <EventDetailsView details={reading.details} /> : <p>This proposal has no longer write-up.</p>}
      </Modal>

      <Modal
        open={!!rejectFor}
        onClose={() => {
          setRejectFor(null);
          setReason("");
        }}
        title={rejectFor ? `Reject "${rejectFor.title}"` : "Reject"}
        tone="pink"
      >
        <Field label="Reason *">
          <textarea
            className="field"
            rows={4}
            maxLength={500}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Say what would need to change, kindly. The proposer will read this."
          />
        </Field>
        <div className="mt-7 flex gap-3">
          <button
            onClick={() => rejectFor && void decide(rejectFor, "reject")}
            disabled={!!processingId || reason.trim().length < 5}
            className="btn btn-pink"
          >
            {processingId ? "Rejecting…" : "Reject event"}
          </button>
          <button
            onClick={() => {
              setRejectFor(null);
              setReason("");
            }}
            className="btn btn-paper"
          >
            Cancel
          </button>
        </div>
      </Modal>
      {node}
    </div>
  );
}
