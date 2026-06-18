// Robin's brain. The contributor profile goes in; a live model (via OpenRouter)
// returns ranked recommendations with honest redirection. If the model is
// unavailable — no key, network down, bad output — we fall back to the curated
// golden-path response so the demo never dies on stage.

import {
  type Profile,
  type RobinResponse,
  resolvePersona,
} from "@/app/lib/personas";
import { buildLiveContext } from "@/app/lib/github";

const OPENROUTER_BASE_URL =
  process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";
const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL ?? "anthropic/claude-sonnet-4.6";

// The static brief Robin reasons over when live signals aren't available — a
// curated baseline of the ecosystem's trajectory, kept current as of June 2026.
// Live GitHub signals (recent merged PRs, open issues, latest release) are
// fetched per request and take precedence over this where they conflict.
const REPO_CONTEXT = `
You guide prospective contributors to Bitcoin open source. Baseline landscape (as of mid-2026 — defer to any LIVE SIGNALS provided below, which are fresher):

BITCOIN CORE (bitcoin/bitcoin) — consensus-critical C++, maintained by a handful of reviewers whose time is the scarcest resource in the ecosystem. A "good first issue" here still assumes months of context. Current state: v31.0 is the latest release line (cluster mempool — the big multi-year mempool redesign into bounded clusters — has MERGED and shipped in v31, so it is no longer "in-flight"; the work now is hardening, follow-up edge cases, and the next round of mempool/relay improvements like package relay). v31 also added Tor/I2P-only ("private") transaction broadcasting. Still actively wanting help: libbitcoinkernel extraction (modularising the consensus engine into a standalone library — ongoing, wants help untangling global state), fuzzing/differential testing (perennially under-resourced, merges fast because it can't break consensus). Documentation (doc/) and developer-notes fixes remain the one safe way for a newcomer to touch Core today.

BDK (bitcoindevkit/bdk) — wallet library in Rust, post-1.0 module split, actively reviews and mentors newcomers on tests/docs around the chain crate. The single best on-ramp for a Rust beginner.

mempool (mempool/mempool) — block explorer, TypeScript front + back, very high issue throughput, friendly bar for first PRs, used by millions. Fastest way to build confidence and a portfolio.

BTCPay Server (btcpayserver/btcpayserver) — self-hosted payments, merchant-facing, has open issues tagged design/UX (rare in this ecosystem). Best landing spot for a designer.

LDK (lightningdevkit) — Lightning in Rust, deep protocol work, high bar.
`.trim();

const SYSTEM_PROMPT = `You are Robin, a context-aware guide for prospective Bitcoin open-source contributors. Your job is to tell a contributor what to work on, what to read first, and — most importantly — when NOT to contribute yet.

Your thesis: open source isn't a gate, it's a path. Everyone else builds filters that reject bad PRs after they exist. You prevent the low-context PR from being written by giving the contributor the context they're missing.

THE SIGNATURE BEHAVIOR IS HONEST REDIRECTION. When someone lacks the background for their target repo (especially Bitcoin Core), you say "Not Core. Not yet." and point them to smaller projects where they'll genuinely help — warmly, never as a rejection. A beginner aimed at Bitcoin Core, or a non-engineer aimed at a headless C++ daemon, should almost always be redirected. A senior engineer with relevant depth should get specific, real, in-flight work matched to where maintainer attention already is.

Tone: a warm, honest trail guide, not a gatekeeper. Mentorly. Concrete.

Use ONLY the landscape facts provided in the context. Do not invent issue numbers or fabricate maintainer handles; speak in terms of areas, labels, and the trajectory described.

LINK RULES (for the "url" field on every recommendation and the optional "url" on readFirst items):
- If the LIVE SIGNALS below list a specific open issue or PR whose URL fits this recommendation, use that EXACT url (copy the https://github.com/... link verbatim).
- Otherwise use a constructible, real URL: the repo's good-first-issue filter — https://github.com/<owner>/<repo>/issues?q=is%3Aopen%20is%3Aissue%20label%3A%22good%20first%20issue%22 — or a known doc file (e.g. https://github.com/<owner>/<repo>/blob/master/CONTRIBUTING.md), or the repo's issue tracker https://github.com/<owner>/<repo>/issues.
- NEVER fabricate an issue/PR number or a URL. If you are not certain a specific issue exists, link the repo's issue tracker or good-first-issue filter instead.

${REPO_CONTEXT}

Return ONLY a JSON object (no markdown, no prose around it) matching exactly this shape:
{
  "mode": "guide" | "redirect",        // "redirect" when the contributor should not target their repo yet
  "fitScore": number,                   // 0-100, how well their profile fits their stated target repo. Low (<40) triggers redirect.
  "intro": [string, ...],               // 1-2 short paragraphs in Robin's voice, opening the answer
  "verdict": { "headline": string, "sub": string } | null,  // REQUIRED when mode is "redirect" (the signpost); null when "guide"
  "recs": [                             // EXACTLY 3 ranked recommendations
    {
      "rank": 1,
      "repo": string,                   // e.g. "bitcoindevkit/bdk"
      "area": string,                   // the specific area/issue type
      "signal": string,                 // short tag, e.g. "Rust · good first issue · welcoming"
      "whyNow": string,                 // why the project needs this NOW, from its trajectory
      "readFirst": [ { "label": string, "note": string, "url": string } ],  // 1-2 docs; url = link to that file/page if known
      "fit": string,                    // honest one-line fit assessment
      "evidence": [string, ...],        // 2-4 concrete signals that justify this rec
      "url": string                     // REQUIRED — a real, working link the contributor opens (see LINK RULES)
    }
  ],
  "closer": string,                     // one closing line in Robin's voice
  "sources": [string, ...]              // 2-3 lines naming what you "read" to answer (provenance)
}`;

type ProfileWithRepo = Profile & { targetRepo: string };

function buildUserMessage(profile: ProfileWithRepo): string {
  const langs = profile.languages.length
    ? profile.languages.join(", ")
    : "none (not an engineer)";
  return `A contributor wants guidance. Their profile:
- Languages: ${langs}
- Years of experience: ${profile.yearsExperience}
- Interests: ${profile.interests.join(", ") || "unspecified"}
- Hours per week available: ${profile.hoursPerWeek}
- Their goal: ${profile.goals}
- Repo they're aiming at: ${profile.targetRepo}

Give them your honest recommendation as the JSON object.`;
}

// Light runtime validation — enough to trust the shape before rendering.
function isValidResponse(x: unknown): x is RobinResponse {
  if (!x || typeof x !== "object") return false;
  const r = x as Record<string, unknown>;
  if (r.mode !== "guide" && r.mode !== "redirect") return false;
  if (!Array.isArray(r.intro) || r.intro.length === 0) return false;
  if (!Array.isArray(r.recs) || r.recs.length === 0) return false;
  if (typeof r.fitScore !== "number") return false;
  if (!Array.isArray(r.sources)) return false;
  return r.recs.every((rec: unknown) => {
    const c = rec as Record<string, unknown>;
    return (
      typeof c.repo === "string" &&
      typeof c.area === "string" &&
      typeof c.whyNow === "string" &&
      typeof c.fit === "string" &&
      Array.isArray(c.readFirst) &&
      Array.isArray(c.evidence)
    );
  });
}

export type RecommendResult = {
  response: RobinResponse;
  source: "model" | "fallback";
};

export async function getRecommendation(
  profile: ProfileWithRepo,
): Promise<RecommendResult> {
  const fallback = resolvePersona(profile).response;
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    // No key configured — serve the curated golden path.
    return { response: fallback, source: "fallback" };
  }

  try {
    // Pull live signals for the target repo + the usual recommendation set, so
    // advice reflects what's actually happening on GitHub right now — not the
    // frozen brief. Best-effort: returns "" if GitHub is unavailable.
    const live = await buildLiveContext([
      profile.targetRepo,
      "bitcoindevkit/bdk",
      "mempool/mempool",
    ]);
    const systemContent = live
      ? `${SYSTEM_PROMPT}\n\nLIVE SIGNALS (fetched from GitHub moments ago — these are the freshest facts; prefer them over the baseline brief where they differ, and ground "why now" / evidence in them):\n${live}`
      : SYSTEM_PROMPT;

    const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.OPENROUTER_SITE_URL ?? "http://localhost:3000",
        "X-Title": process.env.OPENROUTER_SITE_NAME ?? "Robin",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: "system", content: systemContent },
          { role: "user", content: buildUserMessage(profile) },
        ],
        response_format: { type: "json_object" },
        // Note: no `temperature` — Opus 4.8 rejects sampling params (400).
        // Steer via the system prompt instead.
      }),
      // GLM 5.1 is a reasoning model (~30s on the full prompt). Give it room,
      // but still bail to the curated fallback if it truly hangs.
      signal: AbortSignal.timeout(60_000),
    });

    if (!res.ok) throw new Error(`OpenRouter ${res.status}`);

    const data = await res.json();
    const content: string | undefined = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error("empty completion");

    // Some models wrap JSON in ```json fences despite response_format — strip them.
    const cleaned = content
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "");

    const parsed = JSON.parse(cleaned);
    // Normalize ranks so the UI ordering is always 1,2,3.
    if (Array.isArray(parsed?.recs)) {
      parsed.recs = parsed.recs
        .slice(0, 3)
        .map((rec: Record<string, unknown>, i: number) => ({
          ...rec,
          rank: i + 1,
        }));
    }
    // Some models emit fitScore on a 0–1 scale; normalize to 0–100.
    if (typeof parsed?.fitScore === "number" && parsed.fitScore <= 1) {
      parsed.fitScore = Math.round(parsed.fitScore * 100);
    }
    if (!isValidResponse(parsed)) throw new Error("schema mismatch");

    return { response: parsed, source: "model" };
  } catch {
    // Any failure — silently serve the curated response. Demo never dies.
    return { response: fallback, source: "fallback" };
  }
}
