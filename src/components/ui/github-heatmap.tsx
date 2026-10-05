"use client";

import { GithubIcon } from "@/components/ui/social-icons";
import { ActivityCalendar, CalendarCard, plural, type ApiDay } from "@/components/ui/activity-calendar";
import { SkeletonCalendar } from "@/components/dashboard/skeleton";
import { useApi } from "@/components/dashboard/use-api";

interface Props {
  username: string;
}

// Empty, then four greens. Ink borders on the lit ones give the sticker feel.
const GREENS = ["#ebe6d3", "#c9f6df", "#80efb6", "#2ee58f", "#0b874f"] as const;

export default function GitHubHeatmap({ username }: Props) {
  const {
    data: body,
    error,
    loading,
    reload,
  } = useApi<{ contributions?: ApiDay[]; lastSynced?: string | null }>(
    username ? `/api/github/contributions?username=${encodeURIComponent(username)}` : null,
    { errorMessage: "We couldn't load your contribution calendar just now." },
  );
  const days = body?.contributions ?? [];
  const synced = body?.lastSynced ?? null;
  const total = days.reduce((n, d) => n + d.count, 0);

  const syncedLabel = synced
    ? new Date(synced).toLocaleDateString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <CalendarCard
      label="GitHub contribution calendar"
      title="Your contribution"
      accent="calendar."
      icon={<GithubIcon />}
      count={days.length ? plural(total, "contribution") : undefined}
      shadow="#0b874f"
    >
      {error ? (
        <div className="mt-8 rounded-2xl border-2 border-[var(--ink)] bg-[var(--pink)] p-5">
          <p className="font-semibold">{error}</p>
          <button onClick={reload} className="btn btn-sm btn-ink mt-4">
            Try again
          </button>
        </div>
      ) : loading ? (
        <SkeletonCalendar />
      ) : (
        <ActivityCalendar
          days={days}
          unit="contribution"
          palette={GREENS}
          tipShadow="var(--signal)"
          footerNote={syncedLabel ? `last updated ${syncedLabel}` : "updated in the background"}
          emptyNote={
            <>
              <p className="hand text-[1.8rem] leading-none">nothing on the calendar yet</p>
              <p className="mx-auto mt-3 max-w-md text-[0.98rem] text-[var(--ink)]/70">
                Your GitHub activity syncs in the background after you sign in. Give it a little while, then check back.
              </p>
            </>
          }
        />
      )}
    </CalendarCard>
  );
}
