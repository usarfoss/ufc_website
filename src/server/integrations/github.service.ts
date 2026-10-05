import "server-only";
import { Octokit } from "@octokit/rest";

export interface GitHubUserStats {
  username: string;
  name: string;
  avatar_url: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  bio: string | null;
  location: string | null;
  blog: string | null;
  company: string | null;
}

export interface GitHubRepoStats {
  name: string;
  full_name: string;
  owner: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

export interface GitHubContributionStats {
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  totalReviews: number;
  languages: Record<string, number>;
  contributionCalendar: ContributionDay[];
  recentActivity: GitHubActivity[];
}

export interface GitHubActivity {
  /** What identifies this item. Commits are identified by their sha, so the same commit is one item however we learned about it. */
  sourceId: string;
  /** An older id this item used to be stored under (the id of the push event), so the old copy can be replaced. */
  legacySourceId?: string;
  type: string;
  repo: string;
  date: string;
  message: string;
}

export interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

interface ContributionCalendar {
  totalContributions: number;
  contributions: ContributionDay[];
}

type PublicEventPayload = {
  commits?: Array<{ message?: string }>;
  pull_request?: { title?: string; number?: number };
  issue?: { title?: string; number?: number };
  number?: number;
  head?: string;
};

const firstLine = (value?: string) => value?.split(/\r?\n/, 1)[0]?.trim();

const fallbackActivityMessage = (type: string, repo: string) => {
  switch (type.toLowerCase()) {
    case "push":
      return `Push in ${repo}`;
    case "pullrequest":
      return `Pull request in ${repo}`;
    case "issues":
      return `Issue in ${repo}`;
    default:
      return `${type} in ${repo}`;
  }
};

const messageInEventPayload = (type: string, payload?: PublicEventPayload) => {
  switch (type.toLowerCase()) {
    case "push":
      return firstLine(payload?.commits?.[0]?.message);
    case "pullrequest":
      return firstLine(payload?.pull_request?.title);
    case "issues":
      return firstLine(payload?.issue?.title);
    default:
      return undefined;
  }
};

type GitHubActivityCandidate = GitHubActivity & { payload?: PublicEventPayload };

const runWithConcurrency = async <T, R>(values: T[], limit: number, task: (value: T) => Promise<R>) => {
  const results = new Array<R>(values.length);
  let nextIndex = 0;

  const worker = async () => {
    while (nextIndex < values.length) {
      const index = nextIndex++;
      results[index] = await task(values[index]);
    }
  };

  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, worker));
  return results;
};

const contributionLevel = (count: number) => {
  if (count === 0) return 0;
  if (count < 3) return 1;
  if (count < 6) return 2;
  if (count < 10) return 3;
  return 4;
};

/**
 * Request-scoped GitHub API client. Each instance is bound to the OAuth token
 * of the user whose request initiated it; no shared credentials or caches exist.
 */
export class GitHubService {
  private readonly octokit: Octokit;

  constructor(accessToken: string) {
    if (!accessToken) {
      throw new Error("A GitHub OAuth access token is required.");
    }

    // Octokit logs every request, and a 304 ("nothing new", which is how the live poll's conditional request says "no change") as a warning.
    // That would fill the logs with several lines per member per minute, so request logging is off. Real errors are still logged.
    this.octokit = new Octokit({
      auth: accessToken,
      log: {
        debug: () => undefined,
        info: () => undefined,
        warn: (message: string) => (/ - 304 /.test(message) ? undefined : console.warn(message)),
        error: console.error,
      },
    });
  }

  async getUserProfile(username: string): Promise<GitHubUserStats | null> {
    try {
      const { data } = await this.octokit.rest.users.getByUsername({ username });

      return {
        username: data.login,
        name: data.name || data.login,
        avatar_url: data.avatar_url,
        public_repos: data.public_repos,
        followers: data.followers,
        following: data.following,
        created_at: data.created_at,
        updated_at: data.updated_at,
        bio: data.bio,
        location: data.location,
        blog: data.blog,
        company: data.company,
      };
    } catch (error) {
      console.error(`Error fetching GitHub profile for ${username}:`, error);
      return null;
    }
  }

  async getUserRepositories(username: string): Promise<GitHubRepoStats[]> {
    try {
      const repositories = (await this.octokit.paginate(this.octokit.rest.repos.listForUser, {
        username,
        type: "all",
        sort: "updated",
        per_page: 100,
      })) as Array<{
        name: string;
        full_name: string;
        description: string | null;
        language: string | null;
        stargazers_count: number | null;
        forks_count: number | null;
        open_issues_count: number | null;
        created_at: string | null;
        updated_at: string | null;
        pushed_at: string | null;
        owner: { login: string } | null;
      }>;

      return repositories.map((repository) => ({
        name: repository.name,
        full_name: repository.full_name,
        owner: repository.owner?.login || username,
        description: repository.description,
        language: repository.language || null,
        stargazers_count: repository.stargazers_count || 0,
        forks_count: repository.forks_count || 0,
        open_issues_count: repository.open_issues_count || 0,
        created_at: repository.created_at || new Date().toISOString(),
        updated_at: repository.updated_at || new Date().toISOString(),
        pushed_at: repository.pushed_at || new Date().toISOString(),
      }));
    } catch (error) {
      // Not an empty list: an empty list would be saved as "no languages", and then corrected on the next look, so the chart would flicker.
      console.error(`Error fetching GitHub repositories for ${username}:`, error);
      throw error;
    }
  }

  async getContributionCalendar(username: string): Promise<ContributionCalendar> {
    const query = `
      query($username: String!) {
        user(login: $username) {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                }
              }
            }
          }
        }
      }
    `;

    try {
      const data = await this.octokit.graphql<{
        user?: {
          contributionsCollection?: {
            contributionCalendar?: {
              totalContributions?: number;
              weeks?: Array<{ contributionDays?: Array<{ date: string; contributionCount: number }> }>;
            };
          };
        };
      }>(query, { username });
      const calendar = data.user?.contributionsCollection?.contributionCalendar;
      const contributions =
        calendar?.weeks
          ?.flatMap((week) => week.contributionDays || [])
          .map((day) => ({
            date: day.date,
            count: day.contributionCount,
            level: contributionLevel(day.contributionCount),
          })) || [];

      return {
        totalContributions: calendar?.totalContributions || 0,
        contributions,
      };
    } catch (error) {
      // Not zero: a failed request must never be saved as "no contributions", which dropped the member down the leaderboard until the next sync.
      console.error(`Error fetching GitHub contribution calendar for ${username}:`, error);
      throw error;
    }
  }

  async getTopLanguages(username: string, repositories?: GitHubRepoStats[]): Promise<Record<string, number>> {
    const languages: Record<string, number> = {};
    let totalBytes = 0;
    const repos = repositories ?? (await this.getUserRepositories(username));

    const results = await Promise.allSettled(
      repos.slice(0, 20).map(async (repository) => {
        const { data } = await this.octokit.rest.repos.listLanguages({
          owner: repository.owner,
          repo: repository.name,
        });
        return data as Record<string, number>;
      }),
    );

    for (const result of results) {
      if (result.status !== "fulfilled") {
        continue;
      }

      for (const [language, bytes] of Object.entries(result.value)) {
        languages[language] = (languages[language] || 0) + bytes;
        totalBytes += bytes;
      }
    }

    if (totalBytes === 0) {
      return {};
    }

    return Object.fromEntries(Object.entries(languages).map(([language, bytes]) => [language, Math.round((bytes / totalBytes) * 100)]));
  }

  async getRecentActivity(username: string): Promise<GitHubActivity[]> {
    try {
      const { data } = await this.octokit.rest.activity.listPublicEventsForUser({
        username,
        per_page: 50,
      });
      const cutoff = Date.now() - 36 * 60 * 60 * 1000;

      const candidates = data.flatMap<GitHubActivityCandidate>((event) => {
        const date = event.created_at || new Date().toISOString();

        if (new Date(date).getTime() < cutoff) {
          return [];
        }

        const repo = event.repo?.name || "Unknown repository";
        const type = event.type?.replace("Event", "") || "Activity";
        const payload = event.payload as PublicEventPayload | undefined;

        // The dashboard stores only these GitHub activity kinds. Ignoring the
        // rest also prevents unnecessary detail requests for branch/tag events.
        if (!["Push", "PullRequest", "Issues"].includes(type)) {
          return [];
        }

        return [
          {
            sourceId: event.id,
            type,
            repo,
            date,
            message: messageInEventPayload(type, payload) || fallbackActivityMessage(type, repo),
            payload,
          },
        ];
      });

      const messageLookups = new Map<string, Promise<string>>();
      const enriched = await runWithConcurrency(candidates, 6, async (activity) => {
        const lookupKey = this.activityLookupKey(activity);
        let message = messageLookups.get(lookupKey);

        if (!message) {
          message = this.resolveActivityMessage(activity);
          messageLookups.set(lookupKey, message);
        }

        const result = { ...activity } as Omit<typeof activity, "payload"> & { payload?: unknown };
        delete result.payload; // the raw GitHub payload is large and the client only needs the message
        return { ...result, message: await message };
      });

      // GitHub's events feed can run a long way behind (half an hour or more), but the commits themselves are available at once. So the commits
      // made in the window are read directly, and the two views are merged. A push and its newest commit are the same item (same sha).
      const sinceIso = new Date(cutoff).toISOString();
      const commits = await this.getRecentCommits(username, [...new Set(candidates.map((c) => c.repo))], sinceIso);

      const merged = new Map<string, GitHubActivity>();
      for (const activity of enriched) {
        const original = candidates.find((c) => c.sourceId === activity.sourceId);
        const head = original?.type === "Push" ? original.payload?.head : undefined;
        const item: GitHubActivity = head ? { ...activity, sourceId: `commit:${head}`, legacySourceId: activity.sourceId } : activity;
        merged.set(item.sourceId, item);
      }
      for (const commit of commits) if (!merged.has(commit.sourceId)) merged.set(commit.sourceId, commit);

      return [...merged.values()].sort((a, b) => b.date.localeCompare(a.date));
    } catch (error) {
      console.error(`Error fetching GitHub activity for ${username}:`, error);
      return [];
    }
  }

  /**
   * The member's own commits since `sinceIso`, read straight from the repositories. Which repositories: the ones GitHub says they committed
   * to in the window (this includes organisation repos), plus any the events feed already mentioned. Commits to branches other than the
   * default one are not listed here, so the events feed still covers those.
   */
  private async getRecentCommits(username: string, knownRepos: string[], sinceIso: string): Promise<GitHubActivity[]> {
    try {
      let fromContributions: string[] = [];
      try {
        const data = await this.octokit.graphql<{
          user?: {
            contributionsCollection?: { commitContributionsByRepository?: Array<{ repository: { nameWithOwner: string } }> };
          } | null;
        }>(
          `query($login: String!, $from: DateTime!) {
            user(login: $login) {
              contributionsCollection(from: $from) {
                commitContributionsByRepository(maxRepositories: 25) { repository { nameWithOwner } }
              }
            }
          }`,
          { login: username, from: sinceIso },
        );
        fromContributions =
          data.user?.contributionsCollection?.commitContributionsByRepository?.map((r) => r.repository.nameWithOwner) ?? [];
      } catch (error) {
        console.warn(`Could not list recent commit repositories for ${username}:`, error);
      }

      const repos = [...new Set([...fromContributions, ...knownRepos])].filter((name) => name.includes("/")).slice(0, 12);
      const perRepo = await runWithConcurrency(repos, 5, async (full) => {
        const [owner, repo] = full.split("/", 2);
        try {
          const { data } = await this.octokit.rest.repos.listCommits({ owner, repo, author: username, since: sinceIso, per_page: 30 });
          return data.map<GitHubActivity>((c) => ({
            sourceId: `commit:${c.sha}`,
            type: "Commit",
            repo: full,
            date: c.commit.author?.date ?? c.commit.committer?.date ?? new Date().toISOString(),
            message: firstLine(c.commit.message) || fallbackActivityMessage("push", full),
          }));
        } catch (error) {
          // An empty repository or one we cannot read: nothing to add from it.
          console.warn(`Could not read recent commits in ${full}:`, (error as { status?: number }).status ?? error);
          return [];
        }
      });
      return perRepo.flat();
    } catch (error) {
      console.error(`Error fetching recent commits for ${username}:`, error);
      return [];
    }
  }

  private activityLookupKey(activity: GitHubActivityCandidate) {
    const payload = activity.payload;
    const type = activity.type.toLowerCase();

    if (type === "push" && payload?.head) {
      return `commit:${activity.repo}:${payload.head}`;
    }

    const number = payload?.number ?? payload?.pull_request?.number ?? payload?.issue?.number;
    if ((type === "pullrequest" || type === "issues") && number) {
      return `${type}:${activity.repo}:${number}`;
    }

    return `event:${activity.sourceId}`;
  }

  private async resolveActivityMessage(activity: GitHubActivityCandidate) {
    const fromEvent = messageInEventPayload(activity.type, activity.payload);
    if (fromEvent) {
      return fromEvent;
    }

    const [owner, repo] = activity.repo.split("/", 2);
    if (!owner || !repo) {
      return fallbackActivityMessage(activity.type, activity.repo);
    }

    try {
      const type = activity.type.toLowerCase();

      if (type === "push" && activity.payload?.head) {
        const { data } = await this.octokit.rest.repos.getCommit({
          owner,
          repo,
          ref: activity.payload.head,
        });
        return firstLine(data.commit.message) || fallbackActivityMessage(activity.type, activity.repo);
      }

      const number = activity.payload?.number ?? activity.payload?.pull_request?.number ?? activity.payload?.issue?.number;

      if (type === "pullrequest" && number) {
        const { data } = await this.octokit.rest.pulls.get({ owner, repo, pull_number: number });
        return firstLine(data.title) || fallbackActivityMessage(activity.type, activity.repo);
      }

      if (type === "issues" && number) {
        const { data } = await this.octokit.rest.issues.get({ owner, repo, issue_number: number });
        return firstLine(data.title) || fallbackActivityMessage(activity.type, activity.repo);
      }
    } catch (error) {
      console.warn(`Unable to hydrate ${activity.type} activity ${activity.sourceId}:`, error);
    }

    return fallbackActivityMessage(activity.type, activity.repo);
  }

  async getUserContributions(username: string): Promise<GitHubContributionStats> {
    const [repositories, calendar, recentActivity] = await Promise.all([
      this.getUserRepositories(username),
      this.getContributionCalendar(username),
      this.getRecentActivity(username),
    ]);
    const languages = await this.getTopLanguages(username, repositories);
    const countIssues = async (searchQuery: string) => {
      try {
        const data = await this.octokit.graphql<{ search?: { issueCount?: number } }>(
          `
          query($searchQuery: String!) {
            search(type: ISSUE, query: $searchQuery, first: 1) {
              issueCount
            }
          }
        `,
          { searchQuery },
        );
        return data.search?.issueCount || 0;
      } catch (error) {
        // Not zero: a failed search is not "no pull requests", and saving it as one dropped the member down the leaderboard until the next sync.
        console.error(`Error fetching GitHub search count for ${username}:`, error);
        throw error;
      }
    };
    const [totalPRs, totalIssues] = await Promise.all([
      countIssues(`author:${username} is:pr`),
      countIssues(`author:${username} is:issue`),
    ]);

    return {
      totalCommits: calendar.totalContributions,
      totalPRs,
      totalIssues,
      totalReviews: 0,
      languages,
      contributionCalendar: calendar.contributions,
      recentActivity,
    };
  }

  async getBatchUserActivities(
    users: Array<{
      id: string;
      name: string | null;
      githubUsername: string | null;
      avatar?: string | null;
    }>,
  ) {
    const result = await Promise.all(
      users.map(async (user) => {
        if (!user.githubUsername) {
          return [];
        }

        const activities = await this.getRecentActivity(user.githubUsername);

        return activities.map((activity, index) => ({
          id: `github-${user.id}-${activity.date}-${activity.type}-${activity.repo}-${index}`,
          type: activity.type.toLowerCase(),
          message: activity.message,
          repo: activity.repo,
          target: activity.repo,
          time: this.timeAgo(activity.date),
          timestamp: activity.date,
          user: {
            name: user.name || "Anonymous",
            githubUsername: user.githubUsername || undefined,
            avatar: user.avatar || undefined,
          },
          metadata: {
            source: "github",
            repo: activity.repo,
            type: activity.type,
          },
        }));
      }),
    );

    return result.flat();
  }

  /**
   * A cheap "has anything changed?" check, used by the live poll. It costs about two API points and returns only the numbers that matter:
   * the same three totals a full sync stores (so they can be compared directly), and the id of the newest public event.
   *
   * The events request is conditional. When nothing has happened since `etag`, GitHub answers 304 and does not count it against the rate limit.
   * Unlike the numbers, a failure here is not fatal: the totals alone are enough to notice most changes.
   */
  async probe(username: string, etag?: string) {
    const totals = this.octokit.graphql<{
      user?: { contributionsCollection?: { contributionCalendar?: { totalContributions?: number } } } | null;
      prs?: { issueCount?: number };
      issues?: { issueCount?: number };
    }>(
      `query($login: String!, $prs: String!, $issues: String!) {
        user(login: $login) { contributionsCollection { contributionCalendar { totalContributions } } }
        prs: search(type: ISSUE, query: $prs, first: 1) { issueCount }
        issues: search(type: ISSUE, query: $issues, first: 1) { issueCount }
      }`,
      { login: username, prs: `author:${username} is:pr`, issues: `author:${username} is:issue` },
    );

    const events = this.octokit
      .request("GET /users/{username}/events/public", { username, per_page: 1, headers: etag ? { "if-none-match": etag } : {} })
      .then((res) => ({ modified: true as const, etag: res.headers.etag ?? undefined, latestEventId: res.data[0]?.id ?? null }))
      .catch((error: { status?: number }) => {
        if (error.status === 304) return { modified: false as const };
        console.warn(`GitHub events probe failed for ${username}:`, error);
        return { modified: false as const };
      });

    const [data, latest] = await Promise.all([totals, events]);
    const contributions = data.user?.contributionsCollection?.contributionCalendar?.totalContributions;
    if (contributions === undefined || data.prs?.issueCount === undefined || data.issues?.issueCount === undefined) {
      throw new Error(`GitHub returned no totals for ${username}`);
    }

    return { commits: contributions, pullRequests: data.prs.issueCount, issues: data.issues.issueCount, events: latest };
  }

  async fetchUserSnapshot(githubUsername: string) {
    const [profile, contributions] = await Promise.all([this.getUserProfile(githubUsername), this.getUserContributions(githubUsername)]);

    if (!profile) {
      throw new Error(`GitHub profile not found for ${githubUsername}`);
    }

    return { profile, contributions };
  }

  private timeAgo(date: string) {
    const diff = Math.max(0, Date.now() - new Date(date).getTime());
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minutes ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} hours ago`;
    return `${Math.floor(minutes / 1440)} days ago`;
  }
}

export const createGitHubService = (accessToken: string) => new GitHubService(accessToken);
