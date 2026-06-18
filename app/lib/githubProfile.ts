// Given a GitHub OAuth access token, scan the user's public activity and derive
// a compact "observed history" — languages they actually write (by code volume),
// notable repos, account age. We summarize and then DISCARD the token; only this
// small derived object is kept (in an httpOnly cookie). Privacy by design.

export type GithubSummary = {
  login: string;
  name?: string;
  avatarUrl?: string;
  publicRepos: number;
  accountYear?: number;
  totalStars: number;
  topLanguages: { name: string; percent: number }[];
  topRepos: { name: string; language: string | null; stars: number; description?: string }[];
};

const GH = "https://api.github.com";

async function gh(token: string, path: string): Promise<unknown | null> {
  try {
    const res = await fetch(`${GH}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "robin-contributor-guide",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

type Repo = {
  name: string;
  full_name: string;
  fork: boolean;
  language: string | null;
  stargazers_count: number;
  description: string | null;
  pushed_at: string;
};

export async function buildGithubSummary(
  token: string,
): Promise<GithubSummary | null> {
  const user = (await gh(token, "/user")) as {
    login?: string;
    name?: string;
    avatar_url?: string;
    public_repos?: number;
    created_at?: string;
  } | null;
  if (!user || !user.login) return null;

  const reposRaw =
    ((await gh(
      token,
      "/user/repos?per_page=100&sort=pushed&affiliation=owner",
    )) as Repo[] | null) ?? [];
  const repos = reposRaw.filter((r) => r && !r.fork);

  // Aggregate languages by bytes across the most recently active repos.
  const recent = repos.slice(0, 12);
  const byteTotals: Record<string, number> = {};
  await Promise.all(
    recent.map(async (r) => {
      const langs = (await gh(token, `/repos/${r.full_name}/languages`)) as
        | Record<string, number>
        | null;
      if (langs) {
        for (const [name, bytes] of Object.entries(langs)) {
          byteTotals[name] = (byteTotals[name] || 0) + (bytes || 0);
        }
      }
    }),
  );
  const totalBytes = Object.values(byteTotals).reduce((a, b) => a + b, 0) || 1;
  const topLanguages = Object.entries(byteTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, bytes]) => ({
      name,
      percent: Math.round((bytes / totalBytes) * 100),
    }));

  const topRepos = [...repos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 5)
    .map((r) => ({
      name: r.full_name,
      language: r.language,
      stars: r.stargazers_count,
      description: r.description ? r.description.slice(0, 120) : undefined,
    }));

  return {
    login: user.login,
    name: user.name || undefined,
    avatarUrl: user.avatar_url || undefined,
    publicRepos: user.public_repos ?? repos.length,
    accountYear: user.created_at
      ? Number(user.created_at.slice(0, 4))
      : undefined,
    totalStars: repos.reduce((a, r) => a + (r.stargazers_count || 0), 0),
    topLanguages,
    topRepos,
  };
}

// Render the summary as a prompt block the model can ground its fit read in.
export function formatGithubSummary(s: GithubSummary): string {
  const langs = s.topLanguages.length
    ? s.topLanguages.map((l) => `${l.name} ${l.percent}%`).join(", ")
    : "none detected";
  const repos = s.topRepos.length
    ? s.topRepos
        .map(
          (r) =>
            `${r.name} (${r.language || "—"}, ${r.stars}★)${
              r.description ? ` — ${r.description}` : ""
            }`,
        )
        .join("; ")
    : "none";
  return [
    `@${s.login}${s.name ? ` (${s.name})` : ""} — connected their GitHub.`,
    s.accountYear ? `account since ${s.accountYear};` : "",
    `${s.publicRepos} public repos, ${s.totalStars} total stars.`,
    `Languages they actually write (by code volume): ${langs}.`,
    `Notable repos: ${repos}.`,
  ]
    .filter(Boolean)
    .join(" ");
}
