"use client";

import { ActivityCalendar, CalendarCard, plural, type ApiDay } from "@/components/ui/activity-calendar";
import { SkeletonCalendar } from "@/components/dashboard/skeleton";
import { useApi } from "@/components/dashboard/use-api";

interface Props {
  username: string;
}

// Empty, then four oranges, in LeetCode's own colour.
const ORANGES = ["#ebe6d3", "#ffe2b8", "#ffc875", "#ffa116", "#c26a00"] as const;

const LeetCodeMark = () => (
  <svg className="text-[#ffa116]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
  </svg>
);

/** A member's LeetCode submissions over the last year, drawn the same way as the GitHub calendar. */
export default function LeetCodeHeatmap({ username }: Props) {
  const { data, error, loading, reload } = useApi<{ submissions?: ApiDay[]; fetchedAt?: string }>(
    username ? "/api/leetcode/submissions" : null,
    {
      errorMessage: "We couldn't load your LeetCode submissions just now.",
    },
  );
  const days = data?.submissions ?? [];
  const total = days.reduce((n, d) => n + d.count, 0);

  return (
    <CalendarCard
      label="LeetCode submissions calendar"
      title="Your LeetCode"
      accent="submissions."
      icon={<LeetCodeMark />}
      count={days.length ? plural(total, "submission") : undefined}
      shadow="#c26a00"
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
          unit="submission"
          palette={ORANGES}
          tipShadow="#ffa116"
          footerNote={
            data?.fetchedAt
              ? `updated ${new Date(data.fetchedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}, refreshed every few minutes`
              : "read from LeetCode"
          }
          emptyNote={
            <>
              <p className="hand text-[1.8rem] leading-none">no submissions in the last year yet</p>
              <p className="mx-auto mt-3 max-w-md text-[0.98rem] text-[var(--ink)]/70">
                Solve a problem on LeetCode and it shows up here within a few minutes. If you have solved some already, check that your
                LeetCode profile is public.
              </p>
            </>
          }
        />
      )}
    </CalendarCard>
  );
}
