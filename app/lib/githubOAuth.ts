// Shared GitHub OAuth config + cookie codec. The access token is never stored —
// only the derived GithubSummary, base64url-encoded in an httpOnly cookie.

import type { GithubSummary } from "@/app/lib/githubProfile";

export const COOKIE_SUMMARY = "robin_gh";
export const COOKIE_STATE = "robin_gh_state";

export function oauthConfigured(): boolean {
  return Boolean(
    process.env.GITHUB_OAUTH_CLIENT_ID && process.env.GITHUB_OAUTH_CLIENT_SECRET,
  );
}

export function encodeSummary(s: GithubSummary): string {
  return Buffer.from(JSON.stringify(s)).toString("base64url");
}

export function decodeSummary(raw: string | undefined): GithubSummary | null {
  if (!raw) return null;
  try {
    return JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}
