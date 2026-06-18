import { NextResponse } from "next/server";
import { COOKIE_SUMMARY } from "@/app/lib/githubOAuth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE_SUMMARY);
  return res;
}
