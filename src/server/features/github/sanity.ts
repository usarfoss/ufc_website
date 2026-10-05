/**
 * A total that is meant to only ever grow, or shrink slowly as old days leave the one-year window, does not suddenly fall by a third or go
 * to zero. When it does, it is far more likely that GitHub (or our request to it) hiccuped than that a member lost their work.
 * This is the test for "that fall looks wrong".
 */
export const fellSharply = (before: number, after: number) => {
  if (after >= before) return false;
  if (before >= 10) return after < before * 0.7;
  return before > 0 && after === 0;
};

export const looksWrong = (
  before: { commits: number; pullRequests: number; issues: number },
  after: { commits: number; pullRequests: number; issues: number },
) =>
  fellSharply(before.commits, after.commits) ||
  fellSharply(before.pullRequests, after.pullRequests) ||
  fellSharply(before.issues, after.issues);
