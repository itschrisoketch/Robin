// CORS for cross-origin callers (the browser extension). When a request carries
// credentials (the GitHub cookie), the spec forbids "*" — we must echo the exact
// Origin and set Allow-Credentials. We reflect any origin here for simplicity;
// the only credentialed data is the user's own public GitHub summary, so the
// blast radius is low. Tighten to an allowlist if that changes.
export function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("origin");
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
  if (origin) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Credentials"] = "true";
  } else {
    headers["Access-Control-Allow-Origin"] = "*";
  }
  return headers;
}
