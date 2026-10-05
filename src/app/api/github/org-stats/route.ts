import type { NextRequest } from "next/server";
import { requireSession } from "@/server/auth/session";
import { OrgGitHubService } from "@/server/integrations/github-org.service";
import { isAdminUser } from "@/server/auth/roles";
import { badRequest, forbidden, json, withApiErrorHandling } from "@/server/http/api";
import { enforceRateLimit } from "@/server/security/rate-limit";

export const GET = withApiErrorHandling(async (request: NextRequest) => {
  const session = await requireSession(request);
  // This fans out to GitHub once per member, using the caller's own token and rate limit, so it is for admins and not for everyone.
  if (!(await isAdminUser(session.userId))) throw forbidden("Only an admin can read organisation stats.");
  await enforceRateLimit(`org-stats:${session.userId}`, 6, 60);
  const org = process.env.GITHUB_ORG;

  if (!org) {
    throw badRequest("GITHUB_ORG must be configured");
  }

  const service = new OrgGitHubService(session.githubAccessToken, org);
  const scope = new URL(request.url).searchParams.get("scope") || "members";

  if (scope === "repos") {
    return json({ org, repos: await service.getOrgRepos(), lastUpdated: new Date().toISOString() });
  }

  if (scope === "members") {
    return json({ org, members: await service.getAllMemberStats(), lastUpdated: new Date().toISOString() });
  }

  const [repos, members] = await Promise.all([service.getOrgRepos(), service.getAllMemberStats()]);
  return json({ org, repos, members, lastUpdated: new Date().toISOString() });
});
