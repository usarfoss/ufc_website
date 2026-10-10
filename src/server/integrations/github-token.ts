import "server-only";
import { getStateRedis } from "@/server/cache/redis";
import { prisma } from "@/server/db/prisma";
import { clearNeedsSignIn, markNeedsSignIn } from "@/server/auth/reauth";
import { decryptToken, encryptToken } from "@/server/security/token-encryption";

/**
 * A member's GitHub access token, renewed when it has run out.
 *
 * GitHub gives this app's sign in tokens a life of 8 hours, and a refresh token that can be swapped for a new pair. So the token stored at
 * sign in is only good for the rest of the day, and everything that talks to GitHub for a member (the live poll, the syncs) asks here instead
 * of reading the stored token directly:
 *  - a token with time left is returned as it is,
 *  - one that has run out, or nearly, is renewed first (one renewal at a time per member, because the refresh token can only be used once),
 *  - if it cannot be renewed (no refresh token, or GitHub says it is no good) the member is put on the "has to sign in again" list.
 */

/** How long this app's tokens live, for members whose row predates storing the real expiry. */
export const TOKEN_LIFETIME_MS = 8 * 60 * 60 * 1000;
/** A token this close to its end is renewed first, so a request never starts with one that dies halfway through. */
const RENEW_BEFORE_MS = 5 * 60 * 1000;
/** Stored when GitHub reports no expiry at sign in: that token does not run out. Null is kept for rows from before expiry was recorded. */
export const NEVER_EXPIRES = new Date("9999-12-31T00:00:00Z");

export const TOKEN_FIELDS = {
  id: true,
  githubTokenCiphertext: true,
  githubRefreshTokenCiphertext: true,
  githubTokenExpiresAt: true,
  githubTokenUpdatedAt: true,
} as const;

export interface TokenRow {
  id: string;
  githubTokenCiphertext: string | null;
  githubRefreshTokenCiphertext: string | null;
  githubTokenExpiresAt: Date | null;
  githubTokenUpdatedAt: Date | null;
}

export type TokenResult =
  | { token: string }
  | {
      token: null;
      /**
       * missing: this member never connected GitHub.
       * needs-sign-in: the token has run out and cannot be renewed. They have been put on the sign in list.
       * busy: another request is renewing it right now. Try again shortly.
       * retry: GitHub could not be reached or would not answer. Nothing is wrong with the member, try again later.
       */
      reason: "missing" | "needs-sign-in" | "busy" | "retry";
    };

type Renewed =
  { kind: "ok"; accessToken: string; refreshToken: string | null; expiresInSeconds: number | null } | { kind: "dead" } | { kind: "retry" };

/** Everything that touches the outside world, so it can be swapped for fakes when testing. */
export interface TokenDeps {
  now(): number;
  load(userId: string): Promise<TokenRow | null>;
  /** Saves the new pair, but only if the refresh token on file is still the one that was used. Returns whether it saved. */
  saveRenewed(userId: string, usedRefreshCiphertext: string, data: Omit<TokenRow, "id">): Promise<boolean>;
  renew(refreshToken: string): Promise<Renewed>;
  /** One renewal at a time per member. Returns a function that gives the lock back, or null if someone else holds it. */
  lock(userId: string): Promise<(() => Promise<void>) | null>;
  wait(ms: number): Promise<void>;
}

const expiryOf = (row: TokenRow) =>
  row.githubTokenExpiresAt ?? (row.githubTokenUpdatedAt ? new Date(row.githubTokenUpdatedAt.getTime() + TOKEN_LIFETIME_MS) : null);

export function createTokenService(deps: TokenDeps) {
  const hasTimeLeft = (row: TokenRow) => {
    const expiry = expiryOf(row);
    // With nothing to go on (no expiry and no sign in time) the token is tried, and a 401 from GitHub is what puts the member on the list.
    return !expiry || expiry.getTime() - RENEW_BEFORE_MS > deps.now();
  };

  const open = async (row: TokenRow): Promise<TokenResult> => {
    try {
      return { token: decryptToken(row.githubTokenCiphertext!) };
    } catch (error) {
      // The stored copy cannot be read (for example the encryption key changed). Only a fresh sign in can replace it.
      console.error("A stored GitHub token could not be decrypted:", error);
      await markNeedsSignIn(row.id);
      return { token: null, reason: "needs-sign-in" };
    }
  };

  async function renewing(row: TokenRow): Promise<TokenResult> {
    const release = await deps.lock(row.id);

    if (!release) {
      // Someone else is renewing this member's token. Wait for them rather than spending the refresh token a second time.
      for (let i = 0; i < 10; i++) {
        await deps.wait(400);
        const latest = await deps.load(row.id);
        if (latest?.githubTokenCiphertext && hasTimeLeft(latest)) return open(latest);
      }
      return { token: null, reason: "busy" };
    }

    try {
      // It may have been renewed in the moments before we got the lock.
      const latest = await deps.load(row.id);
      if (!latest?.githubTokenCiphertext) return { token: null, reason: "missing" };
      if (hasTimeLeft(latest)) return open(latest);

      if (!latest.githubRefreshTokenCiphertext) {
        await markNeedsSignIn(latest.id);
        return { token: null, reason: "needs-sign-in" };
      }

      let refreshToken: string;
      try {
        refreshToken = decryptToken(latest.githubRefreshTokenCiphertext);
      } catch (error) {
        console.error("A stored GitHub refresh token could not be decrypted:", error);
        await markNeedsSignIn(latest.id);
        return { token: null, reason: "needs-sign-in" };
      }

      const renewed = await deps.renew(refreshToken);

      if (renewed.kind === "ok") {
        const now = deps.now();
        const saved = await deps.saveRenewed(latest.id, latest.githubRefreshTokenCiphertext, {
          githubTokenCiphertext: encryptToken(renewed.accessToken),
          githubRefreshTokenCiphertext: renewed.refreshToken ? encryptToken(renewed.refreshToken) : latest.githubRefreshTokenCiphertext,
          githubTokenExpiresAt: renewed.expiresInSeconds ? new Date(now + renewed.expiresInSeconds * 1000) : NEVER_EXPIRES,
          githubTokenUpdatedAt: new Date(now),
        });
        if (!saved) {
          // The member signed in while we were renewing, which stored a newer pair. That one is the one to use.
          const again = await deps.load(latest.id);
          return again?.githubTokenCiphertext ? open(again) : { token: null, reason: "missing" };
        }
        await clearNeedsSignIn(latest.id);
        return { token: renewed.accessToken };
      }

      if (renewed.kind === "dead") {
        // GitHub says the refresh token is no good. Before believing it, check nobody replaced it meanwhile (a sign in, or another server's
        // renewal that got in first): a refresh token only works once, so losing that race looks exactly like a dead one.
        const after = await deps.load(latest.id);
        if (
          after?.githubTokenCiphertext &&
          after.githubRefreshTokenCiphertext !== latest.githubRefreshTokenCiphertext &&
          hasTimeLeft(after)
        ) {
          return open(after);
        }
        await markNeedsSignIn(latest.id);
        return { token: null, reason: "needs-sign-in" };
      }

      return { token: null, reason: "retry" };
    } finally {
      await release();
    }
  }

  return {
    /** The token to use for this member, renewing it if it has run out. `row` is what the caller already loaded, to save a query. */
    async usable(row: TokenRow): Promise<TokenResult> {
      if (!row.githubTokenCiphertext) return { token: null, reason: "missing" };
      if (hasTimeLeft(row)) return open(row);

      if (!row.githubRefreshTokenCiphertext) {
        await markNeedsSignIn(row.id);
        return { token: null, reason: "needs-sign-in" };
      }
      return renewing(row);
    },
  };
}

/* ------------------------------------------------------------------------------------------------ the real thing */

const memoryLocks = new Set<string>();

const realDeps: TokenDeps = {
  now: () => Date.now(),

  load: (userId) => prisma.user.findUnique({ where: { id: userId }, select: TOKEN_FIELDS }),

  async saveRenewed(userId, usedRefreshCiphertext, data) {
    const { count } = await prisma.user.updateMany({ where: { id: userId, githubRefreshTokenCiphertext: usedRefreshCiphertext }, data });
    return count > 0;
  },

  async renew(refreshToken) {
    const clientId = process.env.GITHUB_ID;
    const clientSecret = process.env.GITHUB_SECRET;
    if (!clientId || !clientSecret) {
      console.error("GITHUB_ID and GITHUB_SECRET are needed to renew GitHub tokens.");
      return { kind: "retry" };
    }

    try {
      const response = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
        signal: AbortSignal.timeout(8_000),
      });
      // GitHub answers 200 even when it says no: the answer is in the body.
      const body = (await response.json().catch(() => null)) as {
        access_token?: string;
        refresh_token?: string;
        expires_in?: number | string;
        error?: string;
      } | null;

      if (body?.access_token) {
        const expires = Number(body.expires_in);
        return {
          kind: "ok",
          accessToken: body.access_token,
          refreshToken: body.refresh_token ?? null,
          expiresInSeconds: Number.isFinite(expires) && expires > 0 ? expires : null,
        };
      }
      // Only this answer means the member's refresh token is really finished. Anything else (our own credentials wrong, GitHub having a bad
      // moment) is not the member's fault and must not sign them out.
      if (body?.error === "bad_refresh_token") return { kind: "dead" };
      console.error("GitHub would not renew a token:", body?.error ?? response.status);
      return { kind: "retry" };
    } catch (error) {
      console.error("Could not reach GitHub to renew a token:", error);
      return { kind: "retry" };
    }
  },

  async lock(userId) {
    const redis = getStateRedis();
    const key = `auth:renew:${userId}`;
    if (!redis) {
      if (memoryLocks.has(key)) return null;
      memoryLocks.add(key);
      return async () => void memoryLocks.delete(key);
    }
    try {
      if ((await redis.set(key, "1", { nx: true, ex: 30 })) !== "OK") return null;
      return async () => void (await redis.del(key).catch(() => 0));
    } catch (error) {
      // Without the lock we cannot be sure two servers will not renew at once, so back off and let the next try sort it out.
      console.error("Could not take the token renewal lock:", error);
      return null;
    }
  },

  wait: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
};

const service = createTokenService(realDeps);

/** The token to use for this member (renewed if it had run out). Pass the row you already have, to save a query. */
export const usableGitHubToken = (row: TokenRow) => service.usable(row);

/** The same, for callers that only have the member's id. */
export async function githubTokenFor(userId: string): Promise<TokenResult> {
  const row = await prisma.user.findUnique({ where: { id: userId }, select: TOKEN_FIELDS });
  return row ? service.usable(row) : { token: null, reason: "missing" };
}
