import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { buildGithubSummary } from "@/app/lib/githubProfile";
import {
  COOKIE_STATE,
  COOKIE_SUMMARY,
  encodeSummary,
} from "@/app/lib/githubOAuth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const cookieStore = await cookies();
  const expected = cookieStore.get(COOKIE_STATE)?.value;

  const fail = (reason: string) => {
    const r = NextResponse.redirect(new URL(`/?gh=${reason}`, origin));
    r.cookies.delete(COOKIE_STATE);
    return r;
  };

  // CSRF: the state we set must round-trip exactly.
  if (!code || !state || !expected || state !== expected) {
    return fail("error");
  }

  try {
    const tokenRes = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          client_id: process.env.GITHUB_OAUTH_CLIENT_ID,
          client_secret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
          code,
          redirect_uri: `${origin}/api/auth/github/callback`,
        }),
        signal: AbortSignal.timeout(8000),
      },
    );
    const tokenJson = await tokenRes.json();
    const token: string | undefined = tokenJson?.access_token;
    if (!token) return fail("error");

    // Scan, summarize, then discard the token (never persisted).
    const summary = await buildGithubSummary(token);
    if (!summary) return fail("error");

    const res = NextResponse.redirect(new URL("/?gh=connected", origin));
    res.cookies.delete(COOKIE_STATE);
    // SameSite=None (https) so the cookie is also sent on the browser
    // extension's cross-site credentialed fetches; falls back to Lax on http
    // (local dev) where Secure cookies can't be set.
    const secure = origin.startsWith("https");
    res.cookies.set(COOKIE_SUMMARY, encodeSummary(summary), {
      httpOnly: true,
      sameSite: secure ? "none" : "lax",
      secure,
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day — derived data only, re-connect to refresh
    });
    return res;
  } catch {
    return fail("error");
  }
}
