"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Field } from "@/components/dashboard/ui";
import { buildProposal, EMPTY_FORM, EMPTY_ROUND, type ProposalForm } from "@/features/events/form-codec";
import { LIMITS } from "@/types/events";

const Section = ({ n, title, hint, children }: { n: number; title: string; hint?: string; children: React.ReactNode }) => (
  <fieldset className="space-y-4 border-t-2 border-dashed border-[var(--ink)]/25 pt-6 first:border-0 first:pt-0">
    <legend className="mb-1 flex items-baseline gap-3">
      <span className="serif text-[1.6rem] leading-none text-[var(--signal-deep)]">{n}</span>
      <span className="text-[1.15rem] font-extrabold leading-tight">{title}</span>
    </legend>
    {hint && <p className="-mt-2 text-[0.88rem] leading-snug text-[var(--ink)]/60">{hint}</p>}
    {children}
  </fieldset>
);

const Count = ({ value, max }: { value: string; max: number }) => (
  <span className={`code ml-2 text-[0.68rem] ${value.length > max ? "text-[#a52a1d]" : "text-[var(--ink)]/45"}`}>
    {value.length}/{max}
  </span>
);

/**
 * The proposal form. It asks for everything an event page shows: the basics, the story, the schedule, the rounds of a
 * competition, the speaker and the links. Only the basics and the story are required, so a small meetup is not a chore.
 */
export function ProposalFormView({
  admin,
  busy,
  onSubmit,
  onCancel,
  initial,
  lockedBasics = false,
  submitLabel,
}: {
  admin: boolean;
  busy: boolean;
  onSubmit: (body: ReturnType<typeof buildProposal>) => void;
  onCancel: () => void;
  /** Fill the form with an existing event, to edit it. */
  initial?: ProposalForm;
  /** The title, dates, place and kind cannot be changed (an approved event, edited by someone who is not an admin). */
  lockedBasics?: boolean;
  submitLabel?: string;
}) {
  const [f, setF] = useState<ProposalForm>(initial ?? EMPTY_FORM);
  const set = <K extends keyof ProposalForm>(key: K, value: ProposalForm[K]) => setF((prev) => ({ ...prev, [key]: value }));
  const [showRounds, setShowRounds] = useState(false);
  const [showSpeaker, setShowSpeaker] = useState(false);

  const rounds = showRounds || f.rounds.length > 0;
  const setRound = (i: number, key: keyof ProposalForm["rounds"][number], value: string) =>
    setF((prev) => ({ ...prev, rounds: prev.rounds.map((r, j) => (j === i ? { ...r, [key]: value } : r)) }));

  return (
    <form
      className="space-y-7"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(buildProposal(f));
      }}
    >
      {lockedBasics && (
        <p className="code rounded-lg border-2 border-[var(--ink)] bg-[var(--butter)] px-3 py-2 text-[0.78rem] font-bold">
          This event is approved and people may have registered, so only an admin can change its title, date, place or kind. Everything else
          you can edit.
        </p>
      )}
      <Section n={1} title="The basics">
        <Field label="Title *">
          <input
            className="field"
            disabled={lockedBasics}
            value={f.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Git Gud"
            maxLength={LIMITS.title[1]}
            required
          />
        </Field>
        <Field label="Subtitle">
          <input
            className="field"
            value={f.subtitle}
            onChange={(e) => set("subtitle", e.target.value)}
            placeholder="Introduction to open source"
            maxLength={LIMITS.subtitle[1]}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Kind of event">
            <select className="field" disabled={lockedBasics} value={f.type} onChange={(e) => set("type", e.target.value)}>
              <option value="WORKSHOP">Workshop</option>
              <option value="HACKATHON">Hackathon or competition</option>
              <option value="MEETUP">Meetup or open talk</option>
              <option value="CONFERENCE">Conference</option>
            </select>
          </Field>
          <Field label="How people take part">
            <select className="field" disabled={lockedBasics} value={f.mode} onChange={(e) => set("mode", e.target.value)}>
              <option value="in-person">In person</option>
              <option value="online">Online</option>
              <option value="hybrid">In person and online</option>
            </select>
          </Field>
        </div>
        <Field label="Summary *">
          <textarea
            className="field"
            rows={2}
            value={f.summary}
            onChange={(e) => set("summary", e.target.value)}
            placeholder="One or two sentences, shown on the event card."
            maxLength={LIMITS.summary[1] + 40}
            required
          />
          <Count value={f.summary} max={LIMITS.summary[1]} />
        </Field>
      </Section>

      <Section n={2} title="When and where">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Starts *">
            <input
              className="field"
              type="datetime-local"
              disabled={lockedBasics}
              value={f.start}
              onChange={(e) => set("start", e.target.value)}
              required
            />
          </Field>
          <Field label="Ends">
            <input
              className="field"
              type="datetime-local"
              disabled={lockedBasics}
              value={f.end}
              onChange={(e) => set("end", e.target.value)}
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
          <Field label="Location *">
            <input
              className="field"
              disabled={lockedBasics}
              value={f.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="USAR Campus, GGSIPU EDC, or Online"
              maxLength={LIMITS.location[1]}
              required
            />
          </Field>
          <Field label="Seats">
            <input
              className="field"
              type="number"
              min={1}
              max={1000}
              value={f.maxAttendees}
              onChange={(e) => set("maxAttendees", e.target.value)}
            />
          </Field>
        </div>
      </Section>

      <Section n={3} title="The story" hint="This is what people read on the event page. Write it the way you would tell a friend.">
        <Field label="Overview *">
          <textarea
            className="field"
            rows={6}
            value={f.overview}
            onChange={(e) => set("overview", e.target.value)}
            placeholder={"What is it, and why now?\n\nLeave a blank line between paragraphs."}
            required
          />
        </Field>
        <Field label="Highlights">
          <textarea
            className="field"
            rows={3}
            value={f.highlights}
            onChange={(e) => set("highlights", e.target.value)}
            placeholder={"One per line.\nA live demo of git rebase\nA first pull request, merged"}
          />
        </Field>
        <Field label="Who it's for">
          <input
            className="field"
            value={f.whoFor}
            onChange={(e) => set("whoFor", e.target.value)}
            placeholder="Anyone who has never opened a pull request."
            maxLength={LIMITS.whoFor}
          />
        </Field>
        <Field label="What to bring">
          <textarea
            className="field"
            rows={2}
            value={f.bring}
            onChange={(e) => set("bring", e.target.value)}
            placeholder={"One per line.\nA laptop\nA GitHub account"}
          />
        </Field>
      </Section>

      <Section
        n={4}
        title="Schedule"
        hint="One line per slot, as time | what happens. Start a line with # to name a day, for events that run longer than one."
      >
        <textarea
          className="field code"
          rows={6}
          value={f.schedule}
          onChange={(e) => set("schedule", e.target.value)}
          placeholder={"# Day 1\n11:00 AM | Registration and team formation\n12:00 PM | Opening ceremony\n# Day 2\n11:00 AM | Final round"}
          aria-label="Schedule"
        />
      </Section>

      <Section n={5} title="Rounds" hint="For a hackathon or competition. Skip this for anything else.">
        {!rounds ? (
          <button type="button" className="btn btn-sm btn-paper" onClick={() => setShowRounds(true)}>
            <Plus size={15} strokeWidth={3} /> Add rounds
          </button>
        ) : (
          <div className="space-y-4">
            {f.rounds.map((r, i) => (
              <div key={i} className="space-y-3 rounded-xl border-2 border-[var(--ink)] bg-white/60 p-4">
                <div className="flex items-center justify-between">
                  <p className="code text-[0.72rem] font-bold uppercase tracking-widest">Round {i + 1}</p>
                  <button
                    type="button"
                    className="btn btn-xs btn-paper"
                    aria-label={`Remove round ${i + 1}`}
                    onClick={() => setF((prev) => ({ ...prev, rounds: prev.rounds.filter((_, j) => j !== i) }))}
                  >
                    <Trash2 size={14} strokeWidth={2.6} />
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Name">
                    <input className="field" value={r.name} onChange={(e) => setRound(i, "name", e.target.value)} placeholder="Git Clash" />
                  </Field>
                  <Field label="When">
                    <input
                      className="field"
                      value={r.when}
                      onChange={(e) => setRound(i, "when", e.target.value)}
                      placeholder="Day 1, 12:00 PM"
                    />
                  </Field>
                </div>
                <Field label="One-line summary">
                  <input
                    className="field"
                    value={r.tagline}
                    onChange={(e) => setRound(i, "tagline", e.target.value)}
                    placeholder="Resolve the merge conflict before the other team does."
                  />
                </Field>
                <Field label="Description">
                  <textarea className="field" rows={3} value={r.body} onChange={(e) => setRound(i, "body", e.target.value)} />
                </Field>
                <Field label="Scoring (one per line)">
                  <textarea
                    className="field"
                    rows={2}
                    value={r.scoring}
                    onChange={(e) => setRound(i, "scoring", e.target.value)}
                    placeholder="10 points per conflict resolved"
                  />
                </Field>
              </div>
            ))}
            {f.rounds.length < LIMITS.rounds && (
              <button
                type="button"
                className="btn btn-sm btn-paper"
                onClick={() => setF((prev) => ({ ...prev, rounds: [...prev.rounds, { ...EMPTY_ROUND }] }))}
              >
                <Plus size={15} strokeWidth={3} /> Add a round
              </button>
            )}
          </div>
        )}
      </Section>

      <Section n={6} title="Speaker" hint="For a talk or a guest session.">
        {!showSpeaker && !f.speakerName ? (
          <button type="button" className="btn btn-sm btn-paper" onClick={() => setShowSpeaker(true)}>
            <Plus size={15} strokeWidth={3} /> Add a speaker
          </button>
        ) : (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name">
                <input className="field" value={f.speakerName} onChange={(e) => set("speakerName", e.target.value)} />
              </Field>
              <Field label="Topic">
                <input
                  className="field"
                  value={f.speakerTopic}
                  onChange={(e) => set("speakerTopic", e.target.value)}
                  placeholder="Open threat modeling"
                />
              </Field>
            </div>
            <Field label="Bio">
              <textarea
                className="field"
                rows={3}
                value={f.speakerBio}
                onChange={(e) => set("speakerBio", e.target.value)}
                maxLength={LIMITS.speakerBio}
              />
            </Field>
            <Field label="Links (label | address, one per line)">
              <textarea
                className="field code"
                rows={2}
                value={f.speakerLinks}
                onChange={(e) => set("speakerLinks", e.target.value)}
                placeholder="LinkedIn | https://www.linkedin.com/in/someone"
              />
            </Field>
          </div>
        )}
      </Section>

      <Section n={7} title="Links and look">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Registration link text">
            <input
              className="field"
              value={f.registrationLabel}
              onChange={(e) => set("registrationLabel", e.target.value)}
              placeholder="Register here"
            />
          </Field>
          <Field label="Registration address">
            <input
              className="field"
              type="url"
              value={f.registrationUrl}
              onChange={(e) => set("registrationUrl", e.target.value)}
              placeholder="https://…"
            />
          </Field>
        </div>
        <Field label="Poster or photo address">
          <input
            className="field"
            type="url"
            value={f.imageUrl}
            onChange={(e) => set("imageUrl", e.target.value)}
            placeholder="https://… (an image people can open without signing in)"
          />
        </Field>
        <Field label="Tags (separate with commas)">
          <input className="field" value={f.tags} onChange={(e) => set("tags", e.target.value)} placeholder="git, github, beginners" />
        </Field>
      </Section>

      <div className="flex gap-3 border-t-2 border-dashed border-[var(--ink)]/25 pt-6">
        <button type="submit" disabled={busy} className="btn btn-signal">
          {busy ? "Saving…" : (submitLabel ?? (admin ? "Publish event" : "Send for approval"))}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-paper">
          Cancel
        </button>
      </div>
    </form>
  );
}
