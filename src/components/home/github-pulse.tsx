import Image from "next/image";
import { LINKS } from "./data";
import { MaskLine, Reveal } from "./motion-primitives";
import { Badge, Pin, Tape } from "./scrap";
import { StickerArt, type ArtId } from "./sticker-art";
import { ArrowLink } from "./arrow-link";

const OWNER = "usarfoss";

type Repo = { name: string; language: string | null; pushed_at: string; html_url: string; fork: boolean };

async function loadPulse() {
  try {
    const headers: HeadersInit = { Accept: "application/vnd.github+json", "User-Agent": "ufc-website" };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    const init = { headers, next: { revalidate: 3600 } };
    const [userRes, repoRes] = await Promise.all([
      fetch(`https://api.github.com/users/${OWNER}`, init),
      fetch(`https://api.github.com/users/${OWNER}/repos?per_page=100&sort=pushed`, init),
    ]);
    if (!userRes.ok || !repoRes.ok) return null;
    const user = (await userRes.json()) as { created_at: string; public_repos: number };
    const repos = (await repoRes.json()) as Repo[];
    if (!Array.isArray(repos) || !repos.length) return null;

    const counts = new Map<string, number>();
    for (const r of repos) if (r.language) counts.set(r.language, (counts.get(r.language) ?? 0) + 1);
    const languages = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    const lastPush = repos.reduce((max, r) => (r.pushed_at > max ? r.pushed_at : max), "");
    return { user, repos, languages, lastPush };
  } catch {
    return null; // the section quietly disappears rather than showing stale or fake numbers
  }
}

/** Splits an age into a big number and a small unit so "1 month ago" never reads like "Imo ago" in serif. */
function age(iso: string) {
  const days = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
  const plural = (n: number, unit: string) => ({ big: String(n), unit: `${unit}${n === 1 ? "" : "s"} ago` });
  if (days < 1) return { big: "today", unit: "" };
  if (days < 30) return plural(days, "day");
  if (days < 365) return plural(Math.floor(days / 30), "month");
  return plural(Math.floor(days / 365), "year");
}

const SWATCH = ["#2ee58f", "#ffe36e", "#ffb3cf", "#9bd7ff", "#c7b3ff", "#ff9d7a", "#9af2c6", "#f7f2e4"];
const TABS = ["#ffe36e", "#ffb3cf", "#9bd7ff", "#9af2c6", "#c7b3ff", "#ff9d7a"];

type Card = {
  k: string;
  big: string;
  unit: string;
  tag: string;
  tone: "signal" | "lilac" | "butter" | "pink";
  r: number;
  sticker: React.ReactNode;
};

/** Live numbers from the club's public GitHub, cached for an hour. Renders nothing if GitHub is unreachable. */
export async function GithubPulse() {
  const data = await loadPulse();
  if (!data) return null;
  const { user, repos, languages, lastPush } = data;
  const total = languages.reduce((n, [, c]) => n + c, 0);
  const created = new Date(user.created_at);
  const last = age(lastPush);

  const art = (id: ArtId) => <StickerArt id={id} className="die-cut size-full" />;
  const cards: Card[] = [
    {
      k: "public repos",
      big: String(user.public_repos),
      unit: "",
      tag: "all open",
      tone: "signal",
      r: -3,
      sticker: <Image src="/collage/git.webp" alt="" width={110} height={46} className="die-cut h-auto w-full" draggable={false} />,
    },
    {
      k: "languages in the wild",
      big: String(languages.length),
      unit: "",
      tag: "polyglots",
      tone: "lilac",
      r: 2.5,
      sticker: (
        <div className="flex -space-x-2">
          <Image src="/collage/ferris.webp" alt="" width={62} height={42} className="die-cut -rotate-6" draggable={false} />
          <Image src="/collage/gopher.webp" alt="" width={32} height={44} className="die-cut rotate-6" draggable={false} />
        </div>
      ),
    },
    { k: "since the last push", big: last.big, unit: last.unit, tag: "still shipping", tone: "butter", r: -2, sticker: art("coffee") },
    {
      k: `building in public since ${created.toLocaleDateString("en-US", { month: "long" })}`,
      big: String(created.getFullYear()),
      unit: "",
      tag: "day one",
      tone: "pink",
      r: 3,
      sticker: art("sun"),
    },
  ];

  const row = (offset: number) => (
    <ul className="flex shrink-0 items-end" aria-hidden="true">
      {repos.map((r, i) => (
        <li key={r.name} className="mr-3">
          <a
            href={r.html_url}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={-1}
            className="code block rounded-t-xl border-2 border-b-0 border-[#14140f] px-4 pb-2 pt-1.5 text-[0.82rem] text-[#14140f] transition-transform hover:-translate-y-2"
            style={{ background: TABS[(i + offset) % TABS.length] }}
          >
            {r.name}
            {r.language && <span className="ml-2 text-[0.65rem] opacity-60">{r.language}</span>}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <section aria-label="Live from GitHub" className="dotgrid relative overflow-hidden bg-[var(--ink)] pt-28 sm:pt-40">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <p className="eyebrow flex items-center gap-3 text-[var(--signal)]">
              <span className="ping relative inline-block size-1.5 rounded-full bg-[var(--signal)]" />
              live from github.com/{OWNER}
            </p>
            <ArrowLink href={LINKS.github} className="btn btn-ghost btn-sm" size={13}>
              view all repositories
            </ArrowLink>
          </div>
        </Reveal>

        <h2 className="mb-14 text-[clamp(2.4rem,6vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.055em] lg:mb-20">
          <MaskLine inView>What we&apos;ve built,</MaskLine>
          <MaskLine inView delay={0.1}>
            <span className="serif text-[var(--signal)]">in public.</span>
          </MaskLine>
        </h2>

        <dl className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c, i) => (
            <Pin key={c.k} r={c.r} delay={i * 0.08} className="relative" hint="drag me">
              <div className="paper relative px-5 pb-6 pt-8">
                <Tape tone={i % 2 ? "butter" : "pink"} className="-top-3 left-1/2 -translate-x-1/2" rotate={i % 2 ? 3 : -3} />
                <div className="absolute -right-3 -top-7 w-[5.4rem] rotate-[8deg]" aria-hidden="true">
                  {c.sticker}
                </div>
                <dd className="serif flex items-baseline gap-2 text-[clamp(3.6rem,6vw,5.5rem)] leading-[0.9] text-[var(--ink)]">
                  {c.big}
                  {c.unit && <span className="text-[0.3em] text-black/55">{c.unit}</span>}
                </dd>
                <dt className="code mt-3 text-[0.7rem] uppercase leading-snug tracking-widest text-black/60">{c.k}</dt>
                <Badge tone={c.tone} className="mt-4 !px-2.5 !py-0.5 !text-[0.7rem]">
                  {c.tag}
                </Badge>
              </div>
            </Pin>
          ))}
        </dl>

        <Reveal delay={0.1}>
          <div className="mt-20">
            <p className="hand mb-3 text-2xl text-[var(--butter)]">the language mix →</p>
            <div
              className="flex h-7 gap-1 rounded-full border-2 border-[var(--text)] p-1"
              role="img"
              aria-label={`Language mix: ${languages.map(([l, c]) => `${l} ${c}`).join(", ")}`}
            >
              {languages.map(([lang, count], i) => (
                <span
                  key={lang}
                  title={`${lang} · ${count}`}
                  className="h-full first:rounded-l-full last:rounded-r-full"
                  style={{ width: `${(count / total) * 100}%`, background: SWATCH[i % SWATCH.length] }}
                />
              ))}
            </div>
            <ul className="mt-4 flex flex-wrap gap-2">
              {languages.slice(0, 8).map(([lang, count], i) => (
                <li key={lang} className="code flex items-center gap-2 rounded-full border border-[var(--line)] px-3 py-1 text-xs">
                  <span className="size-2.5 rounded-full" style={{ background: SWATCH[i % SWATCH.length] }} />
                  <span className="text-[var(--text)]">{lang}</span>
                  <span className="text-[var(--text-dim)]">{count}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>

      {/* repos as folder tabs, drifting along a shelf */}
      <div className="mt-20 space-y-0 border-b-[3px] border-[#14140f] bg-[var(--ink-2)] pt-10">
        <div className="marquee" style={{ ["--marquee-duration" as string]: "110s" }} role="presentation">
          <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
            <div className="marquee-track">
              {row(0)}
              {row(0)}
            </div>
          </div>
        </div>
        <div
          className="marquee marquee-reverse mt-3 border-t-[3px] border-[#14140f] bg-[var(--ink-3)] pt-8"
          style={{ ["--marquee-duration" as string]: "130s" }}
          role="presentation"
        >
          <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
            <div className="marquee-track">
              {row(3)}
              {row(3)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
