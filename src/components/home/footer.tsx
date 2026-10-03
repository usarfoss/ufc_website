import Link from "next/link";
import { CREDITS, LINKS, NAV_LINKS } from "./data";
import { Logo } from "./logo";
import { FooterArt } from "./footer-art";

const COMMUNITY = [
  { label: "GitHub", href: LINKS.github },
  { label: "Discord", href: LINKS.discord },
  { label: "WhatsApp", href: LINKS.whatsapp },
  { label: "Instagram", href: LINKS.instagram },
];

export function Footer() {
  const year = new Date().getFullYear();
  const col = "space-y-3 text-sm text-[var(--text-dim)]";
  const link = "lnk hover:!text-[var(--ink)]";

  return (
    <footer className="relative bg-[var(--ink)]">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-10 pt-20 sm:px-8 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="flex items-center gap-3">
            <Logo size={40} className="rounded-xl" />
            <span className="text-lg font-semibold tracking-tight">USAR FOSS Club</span>
          </div>
          <p className="serif mt-6 max-w-sm text-3xl leading-[1.1] text-[var(--text)]">
            Open source, <span className="text-[var(--signal)]">open minds.</span>
          </p>
        </div>

        <nav aria-label="Site" className="md:col-span-3 md:col-start-7">
          <p className="eyebrow mb-4 text-[var(--text)]/50">Club</p>
          <ul className={col}>
            <li><Link href="/" className={link}>Home</Link></li>
            {NAV_LINKS.map((l) => (
              <li key={l.href}><Link href={l.href} className={link}>{l.label}</Link></li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Community" className="md:col-span-3">
          <p className="eyebrow mb-4 text-[var(--text)]/50">Community</p>
          <ul className={col}>
            {COMMUNITY.map(({ label, href }) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noopener noreferrer" className={link}>{label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <FooterArt />

      <div className="relative border-t border-[var(--line)] bg-[var(--ink)]">
        <div className="mx-auto max-w-7xl px-5 pt-6 sm:px-8">
          <p className="code text-[0.66rem] leading-relaxed text-[var(--text-dim)]/80">
            <span className="uppercase tracking-widest text-[var(--text-dim)]">image credits (all via Wikimedia Commons) — </span>
            {CREDITS.map((c, i) => (
              <span key={c.what}>
                <a href={c.href} target="_blank" rel="noopener noreferrer" className="underline decoration-[var(--line)] underline-offset-2 transition-colors hover:text-[var(--signal)]">
                  {c.what}
                </a>{" "}
                · {c.who} · {c.license}
                {i < CREDITS.length - 1 ? "  /  " : ""}
              </span>
            ))}
          </p>
        </div>
        <div className="code mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-5 text-[0.7rem] text-[var(--text-dim)] sm:px-8">
          <span>© {year} UFC · University School of Automation &amp; Robotics, GGSIPU</span>
          <span>built in the open, by students ♥</span>
        </div>
      </div>
    </footer>
  );
}
