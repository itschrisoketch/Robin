import { cookies } from "next/headers";
import {
  COOKIE_SUMMARY,
  decodeSummary,
  oauthConfigured,
} from "@/app/lib/githubOAuth";
import { corsHeaders } from "@/app/lib/cors";

export function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

// Lets the web UI and the extension show connect state + the derived summary.
export async function GET(request: Request) {
  const cookieStore = await cookies();
  const summary = decodeSummary(cookieStore.get(COOKIE_SUMMARY)?.value);
  return Response.json(
    {
      configured: oauthConfigured(),
      connected: !!summary,
      summary,
    },
    { headers: corsHeaders(request) },
  );
}
