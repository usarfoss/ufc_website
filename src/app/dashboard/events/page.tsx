"use client";

import { useState } from "react";
import { Calendar, CheckCircle, Clock, History, MapPin, Plus, Users, X } from "lucide-react";
import { useAuth } from "@/features/auth/auth-provider";
import { Pin, Tape } from "@/components/home/scrap";
import { useApi, useVersionStream } from "@/components/dashboard/use-api";
import { Avatar, Empty, ErrorPanel, Field, isAdmin, Modal, PageHeader, useToast } from "@/components/dashboard/ui";
import { TONE_BG, type Tone } from "@/data/tones";
import { EventDetailsView } from "@/components/dashboard/event-details";
import { ProposalFormView } from "@/components/dashboard/proposal-form";
import type { buildProposal } from "@/features/events/form-codec";
import type { EventDetails } from "@/types/events";
import { SkeletonCards, SkeletonRows, SkeletonShell } from "@/components/dashboard/skeleton";

interface DashEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  maxAttendees: number;
  currentAttendees: number;
  type: string;
  subtitle?: string;
  tags: string[];
  status: string;
  approvalStatus: string;
  rejectionReason?: string;
  creator: { name: string; githubUsername?: string };
  reviewedBy?: { name: string; githubUsername?: string };
  isRegistered: boolean;
  isMine: boolean;
}

interface Quota {
  limit: number;
  used: number;
  remaining: number;
  resetsAt: string | null;
}

type View = "upcoming" | "past" | "pending" | "rejected" | "all";

const VIEWS: { key: View; label: string; icon: typeof Calendar }[] = [
  { key: "upcoming", label: "Upcoming", icon: CheckCircle },
  { key: "past", label: "Past", icon: History },
  { key: "pending", label: "Pending", icon: Clock },
  { key: "rejected", label: "Rejected", icon: X },
  { key: "all", label: "All", icon: Calendar },
];

const until = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

const TYPE_TONE: Record<string, Tone> = { workshop: "mint", hackathon: "pink", meetup: "butter", conference: "lilac" };
const APPROVAL_TONE: Record<string, string> = { approved: "#9af2c6", pending: "#ffe36e", rejected: "#ffb3cf" };
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

/** Pulls the server's own explanation out of a failed response, so people read "you have used all five" and not "failed". */
const errorOf = async (res: Response, fallback: string) => ((await res.json().catch(() => ({}))) as { error?: string }).error ?? fallback;

export default function DashboardEventsPage() {
  const { user } = useAuth();
  const admin = isAdmin(user?.role);
  const { show, node } = useToast();

  const [view, setView] = useState<View>("upcoming");
  const { data, error, loading, reload, refresh } = useApi<{ events?: DashEvent[]; quota?: Quota | null }>(
    `/api/dashboard/events?view=${view}`,
    { errorMessage: "We couldn't load events just now." },
  );
  useVersionStream("events", refresh); // someone proposed, decided or registered: pick it up without a reload
  const events = data?.events ?? [];
  const quota = data?.quota ?? null;
  const outOfProposals = !!quota && quota.remaining === 0;
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectFor, setRejectFor] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const createEvent = async (body: ReturnType<typeof buildProposal>) => {
    try {
      setCreating(true);
      const res = await fetch("/api/dashboard/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await errorOf(res, "Failed to create event"));
      setCreateOpen(false);
      refresh();
      show(admin ? "Event published." : "Proposal sent. An admin will review it.");
    } catch (err) {
      console.error("Error creating event:", err);
      show(err instanceof Error ? err.message : "Failed to create event", false);
      refresh(); // the daily count may have changed
    } finally {
      setCreating(false);
    }
  };

  const register = async (id: string) => {
    try {
      const res = await fetch(`/api/dashboard/events/${id}/register`, { method: "POST" });
      if (!res.ok) throw new Error(await errorOf(res, "Couldn't register you for that event."));
      refresh();
      show("You're registered. See you there!");
    } catch (err) {
      console.error("Error registering for event:", err);
      show(err instanceof Error ? err.message : "Couldn't register you for that event.", false);
      refresh();
    }
  };

  const approve = async (id: string) => {
    try {
      setApprovingId(id);
      const res = await fetch(`/api/dashboard/events/${id}/approve`, { method: "POST" });
      if (!res.ok) throw new Error(await errorOf(res, "Failed to approve event"));
      refresh();
      show("Event approved.");
    } catch (err) {
      console.error("Error approving event:", err);
      show(err instanceof Error ? err.message : "Failed to approve event", false);
      refresh(); // most often someone else decided it first
    } finally {
      setApprovingId(null);
    }
  };

  const reject = async () => {
    if (!rejectFor || !reason.trim()) {
      show("Please give a reason, so the organiser knows what to change.", false);
      return;
    }
    try {
      setRejectingId(rejectFor);
      const res = await fetch(`/api/dashboard/events/${rejectFor}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error(await errorOf(res, "Failed to reject event"));
      setRejectFor(null);
      setReason("");
      refresh();
      show("Event rejected.");
    } catch (err) {
      console.error("Error rejecting event:", err);
      show(err instanceof Error ? err.message : "Failed to reject event", false);
    } finally {
      setRejectingId(null);
    }
  };

  const withdraw = async (id: string) => {
    try {
      setWithdrawingId(id);
      const res = await fetch(`/api/dashboard/events/${id}/withdraw`, { method: "POST" });
      if (!res.ok) throw new Error(await errorOf(res, "Couldn't withdraw that proposal."));
      refresh();
      show("Proposal withdrawn. It still counts toward today's five.");
    } catch (err) {
      show(err instanceof Error ? err.message : "Couldn't withdraw that proposal.", false);
      refresh();
    } finally {
      setWithdrawingId(null);
    }
  };

  const proposeLabel = admin ? "Create event" : "Propose event";

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="§ events · workshops, hackathons, meetups"
        title="Club"
        accent="events."
        tone="sky"
        art="play"
        sub="Join something, or propose your own. Every proposal is read by an admin before it goes up."
      >
        <button onClick={() => setCreateOpen(true)} disabled={outOfProposals} className="btn btn-ink">
          <Plus size={16} strokeWidth={3} />
          {proposeLabel}
        </button>
        {quota && (
          <span className="code text-[0.78rem] font-bold" aria-live="polite">
            {outOfProposals
              ? `No proposals left today${quota.resetsAt ? `, back at ${until(quota.resetsAt)}` : ""}`
              : `${quota.remaining} of ${quota.limit} proposals left today`}
          </span>
        )}
        <span className="hidden h-8 w-0.5 bg-[var(--ink)]/25 sm:block" />
        {VIEWS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setView(key)}
            aria-pressed={view === key}
            className={`btn btn-sm ${view === key ? "btn-ink" : "btn-paper"}`}
          >
            <Icon size={15} strokeWidth={2.6} />
            {label}
          </button>
        ))}
      </PageHeader>

      {loading ? (
        <SkeletonShell label="Loading events" caption="pinning up the events">
          <SkeletonCards count={4} />
        </SkeletonShell>
      ) : error ? (
        <ErrorPanel title="Couldn't load events" message={error} onRetry={reload} />
      ) : events.length === 0 ? (
        <Empty art="rocket" title="Nothing here" body="Check back soon for workshops and meetups, or propose one yourself.">
          <button onClick={() => setCreateOpen(true)} disabled={outOfProposals} className="btn btn-signal">
            <Plus size={16} strokeWidth={3} />
            {proposeLabel}
          </button>
        </Empty>
      ) : (
        <ul className="grid gap-x-8 gap-y-10 md:grid-cols-2">
          {events.map((e, i) => {
            const when = new Date(e.date);
            const spots = e.maxAttendees - e.currentAttendees;
            const tone = TYPE_TONE[e.type.toLowerCase()] ?? "sky";
            const upcoming = e.status.toLowerCase() === "upcoming";
            return (
              <li key={e.id}>
                <Pin r={i % 2 ? 0.6 : -0.6} drag={false} delay={(i % 2) * 0.07} className="h-full">
                  <article className="paper relative flex h-full flex-col px-6 pb-6 pt-9 sm:px-7">
                    <Tape tone={(["butter", "pink", "sky", "lilac"] as const)[i % 4]} className="-top-3 left-8" rotate={-4} />

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="code rounded-full border-2 border-[var(--ink)] px-3 py-0.5 text-[0.7rem] font-bold uppercase tracking-wider"
                        style={{ background: TONE_BG[tone] }}
                      >
                        {cap(e.type)}
                      </span>
                      <span className="code rounded-full border-2 border-[var(--ink)] bg-white px-3 py-0.5 text-[0.7rem] font-bold uppercase tracking-wider">
                        {cap(e.status)}
                      </span>
                    </div>
                    <h2 className="mt-4 text-[1.7rem] leading-[1.05]">{e.title}</h2>
                    {e.subtitle && <p className="serif mt-1 text-[1.1rem] leading-tight text-[var(--ink)]/70">{e.subtitle}</p>}
                    <p className="mt-3 line-clamp-3 text-[0.98rem] leading-[1.6] text-[var(--ink)]/75">{e.description}</p>

                    {e.tags.length > 0 && (
                      <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Tags">
                        {e.tags.map((t) => (
                          <li key={t} className="code rounded-full border border-[var(--ink)]/30 bg-white/70 px-2 py-px text-[0.68rem]">
                            {t}
                          </li>
                        ))}
                      </ul>
                    )}

                    <ul className="mt-5 space-y-2 text-[0.93rem] font-semibold text-[var(--ink)]/75">
                      <li className="flex items-center gap-2.5">
                        <Calendar size={16} strokeWidth={2.4} />
                        {when.toLocaleDateString()}
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Clock size={16} strokeWidth={2.4} />
                        {when.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </li>
                      <li className="flex items-center gap-2.5">
                        <MapPin size={16} strokeWidth={2.4} />
                        {e.location}
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Users size={16} strokeWidth={2.4} />
                        {e.currentAttendees} of {e.maxAttendees} going
                        {spots > 0 && (
                          <span className="code rounded-md bg-[var(--signal)] px-1.5 text-[0.68rem] font-bold uppercase">{spots} left</span>
                        )}
                      </li>
                    </ul>

                    <div className="mt-5 flex items-center gap-2.5 border-t-2 border-dashed border-[var(--ink)]/25 pt-4 text-[0.9rem]">
                      <Avatar
                        src={e.creator.githubUsername ? `https://github.com/${e.creator.githubUsername}.png` : null}
                        name={e.creator.name}
                        size={30}
                      />
                      <span className="text-[var(--ink)]/65">
                        by <span className="font-extrabold text-[var(--ink)]">{e.creator.name}</span>
                        {e.creator.githubUsername && <span className="text-[var(--ink)]/50"> @{e.creator.githubUsername}</span>}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span
                        className="code rounded-full border-2 border-[var(--ink)] px-3 py-0.5 text-[0.7rem] font-bold uppercase tracking-wider"
                        style={{ background: APPROVAL_TONE[e.approvalStatus] ?? "#fff" }}
                      >
                        {e.approvalStatus}
                      </span>
                      {e.reviewedBy && e.approvalStatus !== "pending" && (
                        <span className="text-[0.82rem] text-[var(--ink)]/55">by {e.reviewedBy.name}</span>
                      )}
                    </div>

                    {e.rejectionReason && (
                      <p className="mt-3 rounded-xl border-2 border-[var(--ink)] bg-[var(--pink)] p-3 text-[0.88rem] leading-snug">
                        <strong>Reason:</strong> {e.rejectionReason}
                      </p>
                    )}

                    <div className="mt-5 flex flex-col gap-2.5">
                      <button onClick={() => setOpenId(e.id)} className="btn btn-paper btn-sm justify-center !pr-4">
                        Read the full details
                      </button>
                      {e.approvalStatus === "pending" && admin && e.status !== "cancelled" && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => void approve(e.id)}
                            disabled={approvingId === e.id}
                            className="btn btn-signal btn-sm flex-1 justify-center !pr-4"
                          >
                            {approvingId === e.id ? "Approving…" : "Approve"}
                          </button>
                          <button
                            onClick={() => setRejectFor(e.id)}
                            disabled={rejectingId === e.id}
                            className="btn btn-pink btn-sm flex-1 justify-center !pr-4"
                          >
                            {rejectingId === e.id ? "Rejecting…" : "Reject"}
                          </button>
                        </div>
                      )}
                      {e.approvalStatus === "approved" && upcoming && (
                        <button
                          onClick={() => void register(e.id)}
                          disabled={e.isRegistered || spots <= 0}
                          className="btn btn-signal justify-center !pr-5"
                        >
                          {e.isRegistered ? "You're registered" : spots <= 0 ? "Event full" : "Register now"}
                        </button>
                      )}
                      {e.approvalStatus === "approved" && !upcoming && (
                        <span className="code text-center text-[0.78rem] font-bold uppercase tracking-widest text-[var(--ink)]/50">
                          {e.status}
                        </span>
                      )}
                      {e.approvalStatus === "rejected" && (
                        <span className="code text-center text-[0.78rem] font-bold uppercase tracking-widest text-[var(--ink)]/50">
                          Rejected
                        </span>
                      )}
                      {e.approvalStatus === "pending" && e.status === "cancelled" && (
                        <span className="code text-center text-[0.78rem] font-bold uppercase tracking-widest text-[var(--ink)]/50">
                          Withdrawn
                        </span>
                      )}
                      {e.approvalStatus === "pending" && e.status !== "cancelled" && !admin && (
                        <span className="code text-center text-[0.78rem] font-bold uppercase tracking-widest text-[var(--ink)]/50">
                          Waiting for an admin
                        </span>
                      )}
                      {e.approvalStatus === "pending" && e.status !== "cancelled" && e.isMine && (
                        <button
                          onClick={() => void withdraw(e.id)}
                          disabled={withdrawingId === e.id}
                          className="btn btn-paper btn-sm justify-center !pr-4"
                        >
                          {withdrawingId === e.id ? "Withdrawing…" : "Withdraw proposal"}
                        </button>
                      )}
                    </div>
                  </article>
                </Pin>
              </li>
            );
          })}
        </ul>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title={admin ? "Create an event" : "Propose an event"}
        tone="sky"
        size="lg"
      >
        {quota && !admin && (
          <p className="code mb-6 rounded-lg border-2 border-[var(--ink)] bg-[var(--butter)] px-3 py-2 text-[0.78rem] font-bold">
            {quota.remaining} of {quota.limit} proposals left today. Withdrawn and rejected ones still count.
          </p>
        )}
        <ProposalFormView admin={admin} busy={creating} onSubmit={(body) => void createEvent(body)} onCancel={() => setCreateOpen(false)} />
      </Modal>

      <EventDetailModal id={openId} onClose={() => setOpenId(null)} />

      <Modal
        open={!!rejectFor}
        onClose={() => {
          setRejectFor(null);
          setReason("");
        }}
        title="Reject this event"
        tone="pink"
      >
        <Field label="Reason *">
          <textarea
            className="field"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Say what would need to change, kindly."
          />
        </Field>
        <div className="mt-7 flex gap-3">
          <button onClick={() => void reject()} disabled={!!rejectingId || !reason.trim()} className="btn btn-pink">
            {rejectingId ? "Rejecting…" : "Reject event"}
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

/** Opens one event and loads its full write-up. The list only carries the card, so this is fetched when someone asks. */
function EventDetailModal({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { data, error, loading } = useApi<{ event?: DashEvent & { details?: EventDetails } }>(id ? `/api/dashboard/events/${id}` : null, {
    errorMessage: "We couldn't load that event.",
  });
  const event = data?.event;
  return (
    <Modal open={!!id} onClose={onClose} title={event?.title ?? "Event details"} tone="butter" size="lg">
      {loading ? (
        <SkeletonShell label="Loading the details">
          <SkeletonRows count={3} />
        </SkeletonShell>
      ) : error ? (
        <p className="font-semibold text-[#a52a1d]">{error}</p>
      ) : event?.details ? (
        <EventDetailsView details={event.details} />
      ) : (
        <p className="text-[var(--ink)]/70">This event doesn&apos;t have a longer write-up.</p>
      )}
    </Modal>
  );
}
