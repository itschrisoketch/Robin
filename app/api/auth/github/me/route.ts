import { cookies } from "next/headers";
import {
  COOKIE_SUMMARY,
  decodeSummary,
  oauthConfigured,
} from "@/app/lib/githubOAuth";

// Lets the UI show connect state + the derived skill summary.
export async function GET() {
  const cookieStore = await cookies();
  const summary = decodeSummary(cookieStore.get(COOKIE_SUMMARY)?.value);
  return Response.json({
    configured: oauthConfigured(),
    connected: !!summary,
    summary,
  });
}
