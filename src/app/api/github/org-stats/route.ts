import type { NextRequest } from "next/server";
import { requireSession } from "@/server/auth/session";
import { OrgGitHubService } from "@/server/integrations/github-org.service";
import { badRequest, json, withApiErrorHandling } from "@/server/http/api";

export const GET = withApiErrorHandling(async (request: NextRequest) => {
  const session = await requireSession(request);
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
