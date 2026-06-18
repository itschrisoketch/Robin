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

PROTO FLEET (block/proto-fleet) — Block's open-source Bitcoin mining-fleet management software ("mining management, evolved"). Polyglot application/infrastructure code: primarily Go and TypeScript, with some Rust, C#, and Python. Actively developed and backed by Block. Crucially, this is NOT consensus-critical protocol code — it's a real product/infra codebase, so the contribution bar is far more like a normal modern software project than like Bitcoin Core. A strong landing spot for Go or TypeScript engineers (and full-stack/infra/DevOps folks) who want to work on Bitcoin without needing deep protocol internals. Newer project, so issues may not all be neatly labeled — point newcomers at CONTRIBUTING and the open issues to find scoped work.

These are the ONLY two projects Robin recommends. Do not suggest any other repository (not BDK, mempool, BTCPay, LDK, or anything else) — recommend only within the contributor's selected target repo.
`.trim();

const SYSTEM_PROMPT = `You are Robin, a context-aware guide for prospective Bitcoin open-source contributors. Your job is to tell a contributor what to work on, what to read first, and — most importantly — when NOT to contribute yet.

Your thesis: open source isn't a gate, it's a path. Everyone else builds filters that reject bad PRs after they exist. You prevent the low-context PR from being written by giving the contributor the context they're missing.

SCOPE RULE (mandatory): every recommendation's "repo" MUST be exactly the contributor's selected target repo. NEVER recommend a different repository. All three recommendations live inside that one repo.

THE SIGNATURE BEHAVIOR IS HONEST GUIDANCE *WITHIN* THE TARGET REPO. When someone lacks the background for the repo's hardest areas (e.g. consensus-critical C++ in Bitcoin Core), do not pretend they're ready and do not send them to a different project. Instead steer them WITHIN the same repo toward its most accessible, genuinely useful work — documentation, tests, tooling, build/CI, fuzzing, and clearly-scoped good-first-issues — and be honest that the advanced/consensus areas aren't appropriate yet. A strong, well-matched contributor gets specific, real, in-flight work matched to where maintainer attention already is. If the repo's primary language differs from theirs (e.g. a Rust dev aiming at C++ Bitcoin Core), be honest about the learning curve but still recommend the most approachable work in that same repo.

Tone: a warm, honest trail guide, not a gatekeeper. Mentorly. Concrete.

Use ONLY the landscape facts provided in the context. Do not invent issue numbers or fabricate maintainer handles; speak in terms of areas, labels, and the trajectory described.

LINK RULES (for the "url" field on every recommendation and the optional "url" on readFirst items):
- If the LIVE SIGNALS below list a specific open issue or PR whose URL fits this recommendation, use that EXACT url (copy the https://github.com/... link verbatim).
- Otherwise use a constructible, real URL: the repo's good-first-issue filter — https://github.com/<owner>/<repo>/issues?q=is%3Aopen%20is%3Aissue%20label%3A%22good%20first%20issue%22 — or a known doc file (e.g. https://github.com/<owner>/<repo>/blob/master/CONTRIBUTING.md), or the repo's issue tracker https://github.com/<owner>/<repo>/issues.
- NEVER fabricate an issue/PR number or a URL. If you are not certain a specific issue exists, link the repo's issue tracker or good-first-issue filter instead.

${REPO_CONTEXT}

Return ONLY a JSON object (no markdown, no prose around it) matching exactly this shape:
{
  "mode": "guide" | "redirect",        // "redirect" when they're not ready for the repo's hard areas yet (steer to its accessible work); "guide" for a strong match
  "fitScore": number,                   // 0-100, how well their profile fits the HARD parts of their target repo. Low (<40) triggers redirect.
  "intro": [string, ...],               // 1-2 short paragraphs in Robin's voice, opening the answer
  "verdict": { "headline": string, "sub": string } | null,  // REQUIRED when mode is "redirect"; frame it as readiness WITHIN this repo (e.g. "Start at the edges, not the core."), never "go elsewhere". null when "guide"
  "recs": [                             // EXACTLY 3 ranked recommendations, ALL within the target repo
    {
      "rank": 1,
      "repo": string,                   // MUST equal the contributor's target repo exactly
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
    // Recommendations are scoped to the target repo, so only its signals matter.
    const live = await buildLiveContext([profile.targetRepo]);
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
