import { Calendar, Check, ExternalLink, Mic, Package, Target, Users } from "lucide-react";
import type { EventDetails } from "@/types/events";

const MODE: Record<string, string> = { "in-person": "In person", online: "Online", hybrid: "In person and online" };

const Heading = ({ children }: { children: React.ReactNode }) => (
  <h3 className="code mb-2 mt-7 text-[0.72rem] font-bold uppercase tracking-widest text-[var(--signal-deep)]">{children}</h3>
);

const Bullets = ({ items }: { items: string[] }) => (
  <ul className="space-y-1.5">
    {items.map((item) => (
      <li key={item} className="flex gap-2.5 leading-snug">
        <Check size={16} strokeWidth={3} className="mt-1 shrink-0 text-[var(--signal-deep)]" />
        {item}
      </li>
    ))}
  </ul>
);

/** The whole write-up of an event, laid out the way the public event pages lay it out. Used when opening an event and when reviewing a proposal. */
export function EventDetailsView({ details, endsAt }: { details: EventDetails; endsAt?: string }) {
  const end = details.endsAt ?? endsAt;
  return (
    <div className="text-[0.98rem] leading-[1.6] text-[var(--ink)]/85">
      {details.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- an address a member typed in, so it can't go through the image optimiser's allow list
        <img
          src={details.imageUrl}
          alt=""
          referrerPolicy="no-referrer"
          loading="lazy"
          className="mb-5 max-h-72 w-full rounded-xl border-2 border-[var(--ink)] bg-white object-contain"
        />
      )}

      <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.88rem] font-semibold">
        {details.subtitle && <span className="serif text-[1.1rem]">{details.subtitle}</span>}
        {details.mode && (
          <span className="code rounded-full border-2 border-[var(--ink)] bg-white px-2.5 py-0.5 text-[0.68rem] uppercase">
            {MODE[details.mode]}
          </span>
        )}
        {end && (
          <span className="flex items-center gap-1.5 text-[var(--ink)]/65">
            <Calendar size={14} strokeWidth={2.4} />
            ends {new Date(end).toLocaleString()}
          </span>
        )}
      </p>

      <Heading>The story</Heading>
      <div className="space-y-3">
        {details.overview.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {details.highlights && (
        <>
          <Heading>Highlights</Heading>
          <Bullets items={details.highlights} />
        </>
      )}

      {details.whoFor && (
        <>
          <Heading>
            <Users size={13} className="mr-1.5 inline" strokeWidth={3} />
            Who it&apos;s for
          </Heading>
          <p>{details.whoFor}</p>
        </>
      )}

      {details.bring && (
        <>
          <Heading>
            <Package size={13} className="mr-1.5 inline" strokeWidth={3} />
            What to bring
          </Heading>
          <Bullets items={details.bring} />
        </>
      )}

      {details.schedule && (
        <>
          <Heading>Schedule</Heading>
          <div className="space-y-4">
            {details.schedule.map((day, i) => (
              <div key={i}>
                {day.day && <p className="font-extrabold">{day.day}</p>}
                <ul className="mt-1 divide-y-2 divide-dashed divide-[var(--ink)]/15 rounded-xl border-2 border-[var(--ink)] bg-white/70">
                  {day.items.map((item, j) => (
                    <li key={j} className="flex gap-4 px-3 py-2 text-[0.92rem]">
                      <span className="code w-24 shrink-0 font-bold">{item.time}</span>
                      <span>{item.activity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </>
      )}

      {details.rounds && (
        <>
          <Heading>
            <Target size={13} className="mr-1.5 inline" strokeWidth={3} />
            Rounds
          </Heading>
          <div className="space-y-3">
            {details.rounds.map((r, i) => (
              <div key={i} className="rounded-xl border-2 border-[var(--ink)] bg-white/70 p-4">
                <p className="font-extrabold">
                  {r.name} <span className="code ml-1 text-[0.72rem] font-bold text-[var(--ink)]/55">{r.when}</span>
                </p>
                <p className="serif text-[1.05rem]">{r.tagline}</p>
                <p className="mt-1.5 text-[0.93rem]">{r.body}</p>
                {r.scoring.length > 0 && (
                  <div className="mt-2.5">
                    <p className="code text-[0.68rem] font-bold uppercase tracking-widest text-[var(--ink)]/55">Scoring</p>
                    <Bullets items={r.scoring} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {details.speaker && (
        <>
          <Heading>
            <Mic size={13} className="mr-1.5 inline" strokeWidth={3} />
            Speaker
          </Heading>
          <div className="rounded-xl border-2 border-[var(--ink)] bg-white/70 p-4">
            <p className="font-extrabold">{details.speaker.name}</p>
            <p className="serif text-[1.05rem]">{details.speaker.topic}</p>
            <p className="mt-1.5 text-[0.93rem]">{details.speaker.bio}</p>
            {details.speaker.links.length > 0 && (
              <p className="mt-2 flex flex-wrap gap-3 text-[0.88rem] font-bold">
                {details.speaker.links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-1 underline"
                  >
                    {l.label}
                    <ExternalLink size={12} strokeWidth={2.6} />
                  </a>
                ))}
              </p>
            )}
          </div>
        </>
      )}

      {details.registration && (
        <p className="mt-7">
          <a
            href={details.registration.href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="btn btn-sm btn-butter inline-flex items-center gap-2"
          >
            {details.registration.label}
            <ExternalLink size={14} strokeWidth={2.6} />
          </a>
        </p>
      )}

      {details.tags && details.tags.length > 0 && (
        <ul className="mt-6 flex flex-wrap gap-2" aria-label="Tags">
          {details.tags.map((t) => (
            <li key={t} className="code rounded-full border border-[var(--ink)]/30 bg-white/70 px-2.5 py-0.5 text-[0.72rem]">
              {t}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
