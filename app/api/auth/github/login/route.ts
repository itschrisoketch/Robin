import { NextResponse } from "next/server";
import { COOKIE_STATE } from "@/app/lib/githubOAuth";

// Kick off GitHub OAuth. read:user scope only — Robin reads public activity to
// infer skills; it does not need write or private-repo access.
export async function GET(request: Request) {
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  const origin = new URL(request.url).origin;
  if (!clientId) {
    return NextResponse.redirect(new URL("/?gh=not_configured", origin));
  }

  const state = crypto.randomUUID();
  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("redirect_uri", `${origin}/api/auth/github/callback`);
  authorize.searchParams.set("scope", "read:user");
  authorize.searchParams.set("state", state);

  const res = NextResponse.redirect(authorize);
  res.cookies.set(COOKIE_STATE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: origin.startsWith("https"),
    path: "/",
    maxAge: 600,
  });
  return res;
}
