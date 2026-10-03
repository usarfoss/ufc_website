/** The pastel paper colours used across the site, as hex so they can go in inline styles. */
export type Tone = "butter" | "mint" | "pink" | "lilac" | "sky";

export const TONE_BG: Record<Tone, string> = { butter: "#ffe36e", mint: "#9af2c6", pink: "#ffb3cf", lilac: "#c7b3ff", sky: "#9bd7ff" };

/** The order tape colours repeat in when a list of cards each get a strip. */
export const TAPE_CYCLE = ["butter", "pink", "sky", "lilac", "signal"] as const;
