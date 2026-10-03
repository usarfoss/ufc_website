"use client";

import { ClotheslineLog } from "./clothesline-log";

/** The history, as a clothesline you scroll along. The same pinned scene works at every screen size. */
export function GitLog() {
  return (
    <div id="history">
      <ClotheslineLog />
    </div>
  );
}
