import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";

/** The wall's backdrop: a blackboard. Chalk flowers, scribbled notes and a few eraser smudges. Static on purpose, nothing here moves. */

const CHALK = {
  white: "rgba(243, 239, 227, 0.62)",
  pink: "rgba(255, 179, 207, 0.7)",
  yellow: "rgba(255, 227, 110, 0.68)",
  mint: "rgba(154, 242, 198, 0.62)",
  lilac: "rgba(199, 179, 255, 0.68)",
  sky: "rgba(155, 215, 255, 0.62)",
} as const;
type Tone = keyof typeof CHALK;

/** The 16 flowers in /public/flowers, cut out of flowers.jpg: [width, height] of each file, in order. */
const FLOWER_SIZE = [
  [231, 216],
  [227, 182],
  [178, 247],
  [198, 208],
  [142, 234],
  [215, 206],
  [172, 183],
  [196, 205],
  [202, 246],
  [205, 212],
  [192, 211],
  [200, 209],
  [174, 181],
  [205, 193],
  [190, 199],
  [176, 187],
] as const;

/** One of the sixteen flowers (1 to 16). The width, position and tilt come from `className`. */
function Flower({ id, className = "" }: { id: number; className?: string }) {
  const [w, h] = FLOWER_SIZE[id - 1];
  return (
    <Image
      src={`/flowers/flower-${String(id).padStart(2, "0")}.webp`}
      alt=""
      width={w}
      height={h}
      sizes="150px"
      draggable={false}
      className={`absolute h-auto ${className}`}
    />
  );
}

/** A line written on the board in chalk. */
function Note({
  children,
  tone = "white",
  className = "",
  style,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <p className={`hand absolute select-none whitespace-nowrap leading-none ${className}`} style={{ color: CHALK[tone], ...style }}>
      {children}
    </p>
  );
}

/** Small chalk doodles that fill the gaps: a star, a heart, a wavy underline. */
function Doodle({ kind, tone, className = "" }: { kind: "star" | "heart" | "squiggle" | "dots"; tone: Tone; className?: string }) {
  return (
    <svg
      viewBox={kind === "squiggle" ? "0 0 120 20" : kind === "dots" ? "0 0 60 30" : "0 0 40 40"}
      className={`absolute ${className}`}
      style={{ color: CHALK[tone] }}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {kind === "star" && <path d="M20 4 L24.5 15 L36 16 L27 23.5 L30 35 L20 28.5 L10 35 L13 23.5 L4 16 L15.5 15Z" />}
      {kind === "heart" && <path d="M20 34 C6 24 4 14 11 9 C16 6 20 10 20 13 C20 10 24 6 29 9 C36 14 34 24 20 34Z" />}
      {kind === "squiggle" && <path d="M4 12 C14 2 22 20 32 10 S50 2 60 12 S78 20 88 10 S108 4 116 10" />}
      {kind === "dots" && (
        <>
          <circle cx="8" cy="20" r="2.2" fill="currentColor" />
          <circle cx="22" cy="8" r="2.2" fill="currentColor" />
          <circle cx="36" cy="22" r="2.2" fill="currentColor" />
          <circle cx="50" cy="10" r="2.2" fill="currentColor" />
        </>
      )}
    </svg>
  );
}

export function ChalkBackdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
      style={{
        backgroundImage:
          "radial-gradient(60% 9% at 72% 6%, rgba(243,239,227,0.05), transparent 72%), radial-gradient(50% 7% at 18% 97%, rgba(243,239,227,0.045), transparent 72%), radial-gradient(36% 6% at 92% 52%, rgba(243,239,227,0.03), transparent 72%)",
      }}
    >
      {/* eraser swipes: a few wide, faint strokes, like the board was wiped and not quite cleaned */}
      <svg className="absolute inset-x-0 top-0 h-[40rem] w-full" viewBox="0 0 1440 640" preserveAspectRatio="none" fill="none">
        <path
          d="M-40 150 C 260 90, 520 210, 820 140 S 1260 70, 1500 150"
          stroke="rgba(243,239,227,0.035)"
          strokeWidth="64"
          strokeLinecap="round"
        />
        <path
          d="M-40 330 C 300 290, 560 400, 900 330 S 1300 280, 1500 340"
          stroke="rgba(243,239,227,0.028)"
          strokeWidth="54"
          strokeLinecap="round"
        />
        <path d="M200 520 C 480 480, 760 560, 1100 500" stroke="rgba(243,239,227,0.025)" strokeWidth="46" strokeLinecap="round" />
      </svg>

      {/* top: around the heading */}
      <div className="absolute inset-x-0 top-0 h-[40rem]">
        <Flower id={4} className="right-[4%] top-[1.5rem] w-24 rotate-6 sm:right-[5%] sm:top-[3rem] sm:w-32" />
        <Flower id={3} className="left-[4%] top-[1rem] w-12 -rotate-6 sm:left-auto sm:right-[22%] sm:top-[5rem] sm:w-20" />
        <Flower id={12} className="right-[13%] top-[15rem] hidden w-20 rotate-3 sm:block" />
        <Flower id={1} className="left-[36%] top-[2.5rem] hidden w-28 -rotate-3 md:block" />
        <Flower id={10} className="left-[3%] top-[3rem] hidden w-14 -rotate-12 sm:block" />
        <Flower id={5} className="left-[12%] top-[1.5rem] hidden w-12 rotate-6 lg:block" />
        <Flower id={13} className="left-[47%] top-[17rem] hidden w-14 rotate-12 lg:block" />
        <Flower id={8} className="right-[1.5%] top-[20rem] hidden w-14 -rotate-6 lg:block" />
        <Flower id={15} className="right-[44%] top-[2rem] hidden w-12 rotate-3 xl:block" />

        <Note className="left-[30%] top-[2.2rem] rotate-2 text-2xl sm:left-[20%] sm:top-[5.5rem] sm:text-3xl" tone="white">
          LGTM!
        </Note>
        <Note className="left-[43%] top-[10rem] hidden rotate-2 text-2xl md:block" tone="yellow">
          git commit -m &quot;bloom&quot;
        </Note>
        <Note className="right-[22%] top-[21rem] hidden -rotate-3 text-3xl md:block" tone="pink">
          {"// TODO: touch grass"}
        </Note>
        <Note className="right-[34%] top-[15rem] hidden -rotate-2 text-2xl lg:block" tone="sky">
          1 + 1 = 2 (usually)
        </Note>
        <Note className="right-[30%] top-[25.5rem] hidden rotate-1 text-2xl lg:block" tone="mint">
          be kind to maintainers ♥
        </Note>

        <Doodle kind="star" tone="yellow" className="left-[28%] top-[1.2rem] hidden w-6 rotate-12 sm:block" />
        <Doodle kind="heart" tone="pink" className="right-[36%] top-[6rem] hidden w-7 -rotate-6 md:block" />
        <Doodle kind="squiggle" tone="white" className="left-[43%] top-[12.4rem] hidden w-28 md:block" />
        <Doodle kind="star" tone="lilac" className="right-[7%] top-[16.5rem] hidden w-7 -rotate-12 lg:block" />
        <Doodle kind="dots" tone="mint" className="left-[58%] top-[9rem] hidden w-16 lg:block" />
        <Doodle kind="heart" tone="yellow" className="left-[8%] top-[0.8rem] w-5 rotate-6 sm:hidden" />
        <Doodle kind="star" tone="pink" className="right-[36%] top-[4.5rem] w-5 -rotate-12 sm:hidden" />
      </div>

      {/* bottom: under the board */}
      <div className="absolute inset-x-0 bottom-0 h-[16rem]">
        <Flower id={6} className="bottom-[1.2rem] left-[4%] w-20 -rotate-6 sm:w-24" />
        <Flower id={9} className="bottom-[0.6rem] left-[13%] hidden w-14 rotate-3 sm:block" />
        <Flower id={2} className="bottom-[1rem] right-[6%] w-20 rotate-6 sm:w-24" />
        <Flower id={14} className="bottom-[1.4rem] right-[20%] hidden w-24 rotate-2 md:block" />
        <Flower id={16} className="bottom-[0.8rem] right-[17%] w-12 -rotate-6 md:hidden" />
        <Flower id={11} className="bottom-[0.6rem] left-[41%] hidden w-14 -rotate-3 md:block" />
        <Flower id={7} className="bottom-[0.8rem] right-[13%] hidden w-14 rotate-6 lg:block" />

        <Note className="bottom-[2.2rem] left-[27%] -rotate-2 text-xl sm:bottom-[2.6rem] sm:left-[19%] sm:text-3xl" tone="white">
          see you in the PRs
        </Note>
        <Note className="bottom-[6rem] left-[19%] hidden -rotate-3 text-2xl lg:block" tone="yellow">
          merge small, merge often
        </Note>
        <Note className="bottom-[6rem] right-[27%] hidden rotate-2 text-2xl md:block" tone="lilac">
          git push origin bloom
        </Note>
        <Note className="bottom-[1.4rem] left-[49%] hidden -rotate-1 text-xl lg:block" tone="sky">
          read the docs first
        </Note>

        <Doodle kind="squiggle" tone="white" className="bottom-[1.1rem] left-[19%] hidden w-32 sm:block" />
        <Doodle kind="star" tone="yellow" className="bottom-[8.4rem] left-[12.5%] hidden w-6 rotate-6 sm:block" />
        <Doodle kind="heart" tone="pink" className="bottom-[5.5rem] right-[4%] hidden w-7 rotate-6 sm:block" />
        <Doodle kind="dots" tone="lilac" className="bottom-[7.5rem] left-[44%] hidden w-14 md:block" />
        <Doodle kind="star" tone="mint" className="bottom-[4.5rem] right-[36%] w-5 rotate-12 sm:hidden" />
      </div>

      {/* wide screens: a little garden down both sides, peeking out beside the board */}
      <div className="absolute inset-y-0 left-0 hidden w-[10%] 2xl:block">
        <Flower id={5} className="left-[10%] top-[8%] w-16 -rotate-6" />
        <Flower id={16} className="left-[30%] top-[25%] w-16 rotate-6" />
        <Flower id={4} className="left-[8%] top-[44%] w-20 -rotate-3" />
        <Flower id={9} className="left-[10%] top-[63%] w-16 rotate-3" />
        <Flower id={13} className="left-[34%] top-[80%] w-14 rotate-6" />
        <Doodle kind="star" tone="white" className="left-[40%] top-[15%] w-6 rotate-12" />
        <Doodle kind="heart" tone="pink" className="left-[16%] top-[35%] w-6 -rotate-6" />
        <Doodle kind="star" tone="yellow" className="left-[34%] top-[55%] w-5 rotate-6" />
      </div>
      <div className="absolute inset-y-0 right-0 hidden w-[10%] 2xl:block">
        <Flower id={11} className="right-[12%] top-[10%] w-20 rotate-6" />
        <Flower id={3} className="right-[32%] top-[27%] w-14 -rotate-6" />
        <Flower id={8} className="right-[8%] top-[46%] w-20 rotate-3" />
        <Flower id={6} className="right-[10%] top-[65%] w-20 -rotate-3" />
        <Flower id={10} className="right-[30%] top-[82%] w-16 -rotate-6" />
        <Doodle kind="heart" tone="yellow" className="right-[36%] top-[18%] w-6 rotate-6" />
        <Doodle kind="star" tone="pink" className="right-[18%] top-[37%] w-6 -rotate-12" />
        <Doodle kind="star" tone="mint" className="right-[36%] top-[58%] w-5 rotate-12" />
      </div>
    </div>
  );
}
