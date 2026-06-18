// Live repo signals from the GitHub REST API. This is what keeps Robin's advice
// current instead of frozen at training time: at query time we fetch each repo's
// recent merged PRs, open good-first-issues, and latest release, and feed them
// into the model prompt. Best-effort — if GitHub is slow or rate-limits us, we
// skip silently and Robin falls back to its (curated, kept-current) static brief.
//
// Unauthenticated REST is rate-limited to 60 req/hr per IP. Set GITHUB_TOKEN
// (a fine-grained read-only PAT) to lift that to 5000/hr — recommended for the
// live demo so concurrent clicks don't get throttled.

type RepoSignals = {
  repo: string;
  latestRelease?: string;
  mergedPRs: string[];
  goodFirstIssues: string[];
};

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const cache = new Map<string, { at: number; signals: RepoSignals | null }>();

function ghHeaders(): Record<string, string> {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "robin-contributor-guide",
  };
  if (process.env.GITHUB_TOKEN) {
    h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return h;
}

async function ghJson(url: string): Promise<unknown | null> {
  try {
    const res = await fetch(url, {
      headers: ghHeaders(),
      signal: AbortSignal.timeout(7000),
    });
    if (!res.ok) return null; // rate limit, 404, etc. — skip silently
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchRepoSignals(repo: string): Promise<RepoSignals | null> {
  const cached = cache.get(repo);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.signals;

  const enc = encodeURIComponent;
  const [merged, gfi, release] = await Promise.all([
    ghJson(
      `https://api.github.com/search/issues?q=repo:${repo}+is:pr+is:merged&sort=updated&order=desc&per_page=8`,
    ),
    ghJson(
      `https://api.github.com/search/issues?q=${enc(
        `repo:${repo} is:issue is:open label:"good first issue"`,
      )}&sort=created&order=desc&per_page=5`,
    ),
    ghJson(`https://api.github.com/repos/${repo}/releases/latest`),
  ]);

  // If even the merged-PR query failed, treat the whole repo as unavailable.
  if (!merged || !Array.isArray((merged as { items?: unknown[] }).items)) {
    cache.set(repo, { at: Date.now(), signals: null });
    return null;
  }

  const items = (merged as { items: { number: number; title: string }[] })
    .items;
  const gfiItems = Array.isArray((gfi as { items?: unknown[] })?.items)
    ? (gfi as { items: { number: number; title: string }[] }).items
    : [];

  const signals: RepoSignals = {
    repo,
    latestRelease:
      release && typeof (release as { tag_name?: string }).tag_name === "string"
        ? (release as { tag_name: string }).tag_name
        : undefined,
    mergedPRs: items.map((i) => `#${i.number} ${i.title}`),
    goodFirstIssues: gfiItems.map((i) => `#${i.number} ${i.title}`),
  };

  cache.set(repo, { at: Date.now(), signals });
  return signals;
}

function formatSignals(s: RepoSignals): string {
  const lines = [`${s.repo}:`];
  if (s.latestRelease) lines.push(`  latest release: ${s.latestRelease}`);
  if (s.mergedPRs.length) {
    lines.push("  recently merged PRs (newest first):");
    s.mergedPRs.forEach((p) => lines.push(`    - ${p}`));
  }
  if (s.goodFirstIssues.length) {
    lines.push("  open 'good first issue's:");
    s.goodFirstIssues.forEach((i) => lines.push(`    - ${i}`));
  }
  return lines.join("\n");
}

// Fetch live signals for a set of repos and format them as a prompt block.
// Returns "" if nothing could be fetched (Robin then relies on the static brief).
export async function buildLiveContext(repos: string[]): Promise<string> {
  const unique = [...new Set(repos.filter(Boolean))].slice(0, 4);
  const results = await Promise.all(unique.map(fetchRepoSignals));
  const ok = results.filter((s): s is RepoSignals => s !== null);
  if (!ok.length) return "";
  return ok.map(formatSignals).join("\n\n");
}
