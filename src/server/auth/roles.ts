import "server-only";
import { prisma } from "@/server/db/prisma";

/**
 * Who is an admin. The answer comes from the environment, read fresh on every check, so removing someone from the list takes
 * effect on their very next request (not whenever they next sign in).
 *
 * ADMIN_GITHUB_IDS is the safe way: GitHub's numeric account ids never change and are never reused. ADMIN_GITHUB_USERNAME still works
 * for now, but a username can be changed and then taken by somebody else, so it is only used when no ids are configured.
 */
const list = (value: string | undefined) =>
  (value ?? "")
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);

let warned = false;

export function isAdminAccount(account: { githubId?: string | null; githubUsername?: string | null }) {
  const ids = list(process.env.ADMIN_GITHUB_IDS);
  if (ids.length > 0) return !!account.githubId && ids.includes(account.githubId.toLowerCase());

  const names = list(process.env.ADMIN_GITHUB_USERNAME);
  if (names.length > 0 && !warned) {
    warned = true;
    console.warn(
      "Admins are matched by GitHub username. Set ADMIN_GITHUB_IDS (numeric ids) instead: a username can be renamed and taken over.",
    );
  }
  return !!account.githubUsername && names.includes(account.githubUsername.toLowerCase());
}

/** Looks the person up and applies the rule above. This is what every admin-only action should call. */
export async function isAdminUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { githubId: true, githubUsername: true } });
  return !!user && isAdminAccount(user);
}
