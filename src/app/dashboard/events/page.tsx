"use client";

import { useState } from "react";
import { Calendar, CheckCircle, Clock, MapPin, Plus, Users, X } from "lucide-react";
import { useAuth } from "@/features/auth/auth-provider";
import { Pin, Tape } from "@/components/home/scrap";
import { useApi } from "@/components/dashboard/use-api";
import { Avatar, Empty, ErrorPanel, Field, isStaff, Loading, Modal, PageHeader, useToast } from "@/components/dashboard/ui";
import { TONE_BG, type Tone } from "@/data/tones";

interface DashEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  maxAttendees: number;
  currentAttendees: number;
  type: string;
  status: string;
  approvalStatus: string;
  rejectionReason?: string;
  approvedAt?: string;
  creator: { name: string; githubUsername?: string };
  approvedBy?: { name: string; githubUsername?: string };
  isRegistered: boolean;
}

type View = "approved" | "pending" | "rejected" | "all";

const VIEWS: { key: View; label: string; icon: typeof Calendar }[] = [
  { key: "approved", label: "Approved", icon: CheckCircle },
  { key: "pending", label: "Pending", icon: Clock },
  { key: "rejected", label: "Rejected", icon: X },
  { key: "all", label: "All", icon: Calendar },
];

const TYPE_TONE: Record<string, Tone> = { workshop: "mint", hackathon: "pink", meetup: "butter", conference: "lilac" };
const APPROVAL_TONE: Record<string, string> = { approved: "#9af2c6", pending: "#ffe36e", rejected: "#ffb3cf" };
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

const EMPTY_FORM = { title: "", description: "", date: "", location: "", maxAttendees: 50, type: "WORKSHOP" };

export default function DashboardEventsPage() {
  const { user } = useAuth();
  const staff = isStaff(user?.role);
  const { show, node } = useToast();

  const [view, setView] = useState<View>("approved");
  const { data, error, loading, reload, refresh } = useApi<{ events?: DashEvent[] }>(`/api/dashboard/events?view=${view}`, {
    errorMessage: "We couldn't load events just now.",
  });
  const events = data?.events ?? [];

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);

  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectFor, setRejectFor] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const createEvent = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.date || !form.location.trim()) {
      show("Please fill in every field marked with a star.", false);
      return;
    }
    try {
      setCreating(true);
      const res = await fetch("/api/dashboard/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to create event");
      setForm(EMPTY_FORM);
      setCreateOpen(false);
      refresh();
      show(staff ? "Event created." : "Event proposed. A maintainer will take a look.");
    } catch (err) {
      console.error("Error creating event:", err);
      show(err instanceof Error ? err.message : "Failed to create event", false);
    } finally {
      setCreating(false);
    }
  };

  const register = async (id: string) => {
    try {
      const res = await fetch(`/api/dashboard/events/${id}/register`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to register for event");
      refresh();
      show("You're registered. See you there!");
    } catch (err) {
      console.error("Error registering for event:", err);
      show("Couldn't register you for that event.", false);
    }
  };

  const approve = async (id: string) => {
    try {
      setApprovingId(id);
      const res = await fetch(`/api/dashboard/events/${id}/approve`, { method: "POST" });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to approve event");
      refresh();
      show("Event approved.");
    } catch (err) {
      console.error("Error approving event:", err);
      show(err instanceof Error ? err.message : "Failed to approve event", false);
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
      if (!res.ok) throw new Error((await res.json()).error || "Failed to reject event");
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

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="§ events · workshops, hackathons, meetups"
        title="Club"
        accent="events."
        tone="sky"
        art="play"
        sub="Join something, or propose your own. Every event is read by a maintainer before it goes up."
      >
        <button onClick={() => setCreateOpen(true)} className="btn btn-ink">
          <Plus size={16} strokeWidth={3} />
          {staff ? "Create event" : "Propose event"}
        </button>
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
        <Loading label="loading events" />
      ) : error ? (
        <ErrorPanel title="Couldn't load events" message={error} onRetry={reload} />
      ) : events.length === 0 ? (
        <Empty art="rocket" title="Nothing scheduled" body="Check back soon for workshops and meetups, or propose one yourself.">
          <button onClick={() => setCreateOpen(true)} className="btn btn-signal">
            <Plus size={16} strokeWidth={3} />
            {staff ? "Create event" : "Propose event"}
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
                    <p className="mt-3 line-clamp-3 text-[0.98rem] leading-[1.6] text-[var(--ink)]/75">{e.description}</p>

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
                      {e.approvedBy && <span className="text-[0.82rem] text-[var(--ink)]/55">by {e.approvedBy.name}</span>}
                    </div>

                    {e.rejectionReason && (
                      <p className="mt-3 rounded-xl border-2 border-[var(--ink)] bg-[var(--pink)] p-3 text-[0.88rem] leading-snug">
                        <strong>Reason:</strong> {e.rejectionReason}
                      </p>
                    )}

                    <div className="mt-5 flex flex-col gap-2.5">
                      {e.approvalStatus === "pending" && staff && (
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
                      {e.approvalStatus === "pending" && !staff && (
                        <span className="code text-center text-[0.78rem] font-bold uppercase tracking-widest text-[var(--ink)]/50">
                          Waiting for a maintainer
                        </span>
                      )}
                    </div>
                  </article>
                </Pin>
              </li>
            );
          })}
        </ul>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title={staff ? "Create an event" : "Propose an event"} tone="sky">
        <div className="space-y-4">
          <Field label="Title *">
            <input
              className="field"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="React workshop"
            />
          </Field>
          <Field label="Description *">
            <textarea
              className="field"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What will people learn or do?"
            />
          </Field>
          <Field label="Date and time *">
            <input className="field" type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          <Field label="Location *">
            <input
              className="field"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Online or a room number"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Max attendees">
              <input
                className="field"
                type="number"
                min={1}
                value={form.maxAttendees}
                onChange={(e) => setForm({ ...form, maxAttendees: parseInt(e.target.value) || 50 })}
              />
            </Field>
            <Field label="Type">
              <select className="field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="WORKSHOP">Workshop</option>
                <option value="HACKATHON">Hackathon</option>
                <option value="MEETUP">Meetup</option>
                <option value="CONFERENCE">Conference</option>
              </select>
            </Field>
          </div>
        </div>
        <div className="mt-7 flex gap-3">
          <button onClick={() => void createEvent()} disabled={creating} className="btn btn-signal">
            {creating ? "Saving…" : staff ? "Create event" : "Send for approval"}
          </button>
          <button onClick={() => setCreateOpen(false)} className="btn btn-paper">
            Cancel
          </button>
        </div>
      </Modal>

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
