import type { Domain, Stage } from "@/data/projects";
import type { ArtId } from "./sticker-art";

/** The sticker that stands for each kind of project, and the tape colour that goes with it. */
export const DOMAIN_ART: Record<Domain, ArtId> = {
  web: "bubble",
  ai: "sparkle",
  mobile: "rocket",
  game: "floppy",
  security: "magnifier",
  chain: "seal",
  systems: "floppy",
  tools: "fork",
  other: "burst",
};

export const DOMAIN_TONE = {
  web: "signal",
  ai: "lilac",
  mobile: "sky",
  game: "pink",
  security: "butter",
  chain: "pink",
  systems: "signal",
  tools: "butter",
  other: "butter",
} as const;

export const STAGE_TONE: Record<Stage, "signal" | "butter" | "pink"> = { live: "signal", built: "butter", bench: "pink" };
