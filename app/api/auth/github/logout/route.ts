import { NextResponse } from "next/server";
import { COOKIE_SUMMARY } from "@/app/lib/githubOAuth";
import { corsHeaders } from "@/app/lib/cors";

export function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

export async function POST(request: Request) {
  const res = NextResponse.json({ ok: true }, { headers: corsHeaders(request) });
  res.cookies.delete(COOKIE_SUMMARY);
  return res;
}
