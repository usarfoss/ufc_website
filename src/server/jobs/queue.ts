import "server-only";
import { Client } from "@upstash/qstash";

/** The QStash client, or null when QSTASH_TOKEN is not set (the app still runs, it just skips background work). */
// QSTASH_URL is the region the account lives in (for example https://qstash-eu-central-1.upstash.io). It has to be passed on: a token
// from one region does not work against another region's address.
export const queue = process.env.QSTASH_TOKEN
  ? new Client({ token: process.env.QSTASH_TOKEN, ...(process.env.QSTASH_URL ? { baseUrl: process.env.QSTASH_URL } : {}) })
  : null;

/** The address QStash should call for a job, or null when this deployment is not reachable from QStash (plain localhost). */
export function jobUrl(path: string) {
  const baseUrl = process.env.NEXTAUTH_URL;
  const localQStash = process.env.QSTASH_URL?.includes("localhost") || process.env.QSTASH_URL?.includes("127.0.0.1");

  if (!baseUrl || (baseUrl.includes("localhost") && !localQStash)) {
    return null;
  }

  return new URL(path, baseUrl).toString();
}
