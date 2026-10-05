import "server-only";
import { Client } from "@upstash/qstash";

/** The QStash client, or null when QSTASH_TOKEN is not set (the app still runs, it just skips background work). */
export const queue = process.env.QSTASH_TOKEN ? new Client({ token: process.env.QSTASH_TOKEN }) : null;

/** The address QStash should call for a job, or null when this deployment is not reachable from QStash (plain localhost). */
export function jobUrl(path: string) {
  const baseUrl = process.env.NEXTAUTH_URL;
  const localQStash = process.env.QSTASH_URL?.includes("localhost") || process.env.QSTASH_URL?.includes("127.0.0.1");

  if (!baseUrl || (baseUrl.includes("localhost") && !localQStash)) {
    return null;
  }

  return new URL(path, baseUrl).toString();
}
