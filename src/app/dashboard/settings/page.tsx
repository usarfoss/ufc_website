"use client";

import { useState } from "react";
import { LogOut, RefreshCw } from "lucide-react";
import { useAuth } from "@/features/auth/auth-provider";
import { useApi } from "@/components/dashboard/use-api";
import { GithubIcon } from "@/components/ui/social-icons";
import { Pin, Tape } from "@/components/home/scrap";
import { Avatar, PageHeader, Panel } from "@/components/dashboard/ui";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b-2 border-dashed border-[var(--ink)]/20 py-3 last:border-0">
      <dt className="code text-[0.72rem] font-bold uppercase tracking-widest text-[var(--ink)]/55">{label}</dt>
      <dd className="font-semibold">{children}</dd>
    </div>
  );
}

interface LinkState {
  username: string | null;
  stats: { totalSolved: number; easySolved: number; mediumSolved: number; hardSolved: number; lastSynced: string } | null;
}

const ago = (iso: string) => {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  if (minutes < 1_440) return `${Math.floor(minutes / 60)} hours ago`;
  return `${Math.floor(minutes / 1_440)} days ago`;
};

/** Link or unlink a LeetCode account. We check it exists, and numbers are stored at once and then kept fresh in the background. */
function LeetCodeCard() {
  const { refresh } = useAuth();
  const link = useApi<LinkState>("/api/leetcode/link", { errorMessage: "We couldn't load your LeetCode link." });
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const call = async (method: "POST" | "DELETE", body?: object) => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/leetcode/link", {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setMessage(data.error ?? "That didn't work. Please try again.");
        return;
      }
      setName("");
      await refresh();
      link.reload();
    } catch {
      setMessage("We couldn't reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const linked = link.data?.username ?? null;
  const stats = link.data?.stats ?? null;

  return (
    <Pin r={-0.8} drag={false} delay={0.2}>
      <div className="paper relative px-6 pb-7 pt-9 sm:px-8">
        <Tape tone="butter" className="-top-3 left-10" rotate={-4} />
        <h2 className="flex items-center gap-3 text-[1.5rem] leading-none">
          <svg className="size-6 text-[#ffa116]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
          </svg>
          LeetCode
        </h2>

        {linked ? (
          <>
            <p className="mt-5 text-[1.12rem] font-semibold leading-snug">
              Linked as{" "}
              <span className="marker rounded-sm px-1" style={{ ["--mark" as string]: "#ffe36e" }}>
                @{linked}
              </span>
              .
            </p>
            {stats && (
              <p className="code mt-3 text-[0.85rem]">
                {stats.totalSolved} solved · {stats.easySolved} easy · {stats.mediumSolved} medium · {stats.hardSolved} hard
              </p>
            )}
            <p className="mt-4 flex items-start gap-3 text-[0.95rem] leading-relaxed text-[var(--ink)]/70">
              <RefreshCw size={18} strokeWidth={2.4} className="mt-0.5 shrink-0" />
              <span>Your numbers refresh on their own, in the background{stats ? `. Last updated ${ago(stats.lastSynced)}.` : "."}</span>
            </p>
            <button onClick={() => void call("DELETE")} disabled={busy} className="btn btn-sm btn-paper mt-5">
              {busy ? "Unlinking…" : "Unlink LeetCode"}
            </button>
          </>
        ) : (
          <form
            className="mt-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim()) void call("POST", { username: name });
            }}
          >
            <p className="text-[0.98rem] leading-relaxed text-[var(--ink)]/75">
              Link your LeetCode account to count your solved problems on the leaderboard. Your profile has to be public.
            </p>
            <label
              htmlFor="leetcode-username"
              className="code mt-4 block text-[0.72rem] font-bold uppercase tracking-widest text-[var(--ink)]/55"
            >
              LeetCode username
            </label>
            <div className="mt-2 flex flex-wrap gap-3">
              <input
                id="leetcode-username"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="your-leetcode-name"
                maxLength={41}
                className="code min-w-0 flex-1 rounded-xl border-[2.5px] border-[var(--ink)] bg-white px-4 py-2.5 text-[0.95rem] outline-none focus-visible:ring-4 focus-visible:ring-[var(--butter)]"
              />
              <button type="submit" disabled={busy || !name.trim()} className="btn btn-sm btn-butter">
                {busy ? "Checking…" : "Link account"}
              </button>
            </div>
          </form>
        )}

        {message && (
          <p role="alert" className="mt-4 rounded-lg border-2 border-[var(--ink)] bg-[#ffd6d0] px-3 py-2 text-[0.92rem] font-semibold">
            {message}
          </p>
        )}
        {link.error && !message && <p className="mt-4 text-[0.92rem] font-semibold text-[#a52a1d]">{link.error}</p>}
      </div>
    </Pin>
  );
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const avatar = user?.image || (user?.githubUsername ? `https://github.com/${user.githubUsername}.png` : null);

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="§ settings · your account"
        title="Your"
        accent="settings."
        tone="sky"
        art="sun"
        sub="Your account and integration status, nothing hidden."
      />

      <div className="grid items-start gap-8 lg:grid-cols-2">
        <Pin r={-1} drag={false}>
          <Panel tone="pink">
            <div className="flex items-center gap-5">
              <Avatar src={avatar} name={user?.name} size={72} />
              <div className="min-w-0">
                <h2 className="truncate text-[1.7rem] leading-tight">{user?.name ?? "Member"}</h2>
                <p className="code text-[0.78rem] font-bold uppercase tracking-widest text-[var(--ink)]/55">{user?.role}</p>
              </div>
            </div>
            <dl className="mt-6">
              <Row label="Email">{user?.email ?? "Not shared"}</Row>
              <Row label="GitHub">{user?.githubUsername ? `@${user.githubUsername}` : "Not connected"}</Row>
              <Row label="LeetCode">{user?.leetcodeUsername ? `@${user.leetcodeUsername}` : "Not linked"}</Row>
            </dl>
            <button onClick={() => void logout()} className="btn btn-pink mt-6">
              Sign out
              <span className="disc">
                <LogOut size={15} strokeWidth={2.6} />
              </span>
            </button>
          </Panel>
        </Pin>

        <div className="space-y-8">
          <Pin r={1} drag={false} delay={0.1}>
            <div className="paper relative px-6 pb-7 pt-9 sm:px-8">
              <Tape tone="signal" className="-top-3 right-10" rotate={4} />
              <h2 className="flex items-center gap-3 text-[1.5rem] leading-none">
                <GithubIcon className="size-6" />
                GitHub integration
              </h2>
              <p className="mt-5 text-[1.12rem] font-semibold leading-snug">
                {user?.githubUsername ? (
                  <>
                    Connected as{" "}
                    <span className="marker rounded-sm px-1" style={{ ["--mark" as string]: "#9af2c6" }}>
                      @{user.githubUsername}
                    </span>
                    .
                  </>
                ) : (
                  "No GitHub account is connected right now."
                )}
              </p>
              <p className="mt-4 flex items-start gap-3 text-[0.95rem] leading-relaxed text-[var(--ink)]/70">
                <RefreshCw size={18} strokeWidth={2.4} className="mt-0.5 shrink-0" />
                Your GitHub data is checked in the background every couple of minutes (every minute while your dashboard is open) and
                updated the moment something changes, so there is nothing to press.
              </p>
            </div>
          </Pin>
          <LeetCodeCard />
        </div>
      </div>
    </div>
  );
}
