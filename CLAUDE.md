# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

> The line above imports AGENTS.md, whose directive is load-bearing: this is **Next.js 16**, with breaking changes from older versions. Read the relevant guide in `node_modules/next/dist/docs/` before writing routing, API-route, or config code — do not assume APIs from training data.

## What Robin is

Robin is a context-aware guide for prospective Bitcoin open-source contributors. It tells them what to work on, what to read first, and — the thesis — **when not to contribute yet** ("honest redirection"). Built for the bitcoin++ Nairobi hackathon. Read `README.md` for the full pitch; `PRODUCT.md` and `DESIGN.md` are register/aesthetic briefs (note: parts of those two predate the current build — see "Settled decisions" below).

## Commands

Package manager is **pnpm**.

- `pnpm dev` — dev server (Turbopack) on :3000
- `pnpm build` — production build (also runs full TypeScript check)
- `pnpm lint` — eslint
- `npx tsc --noEmit` — typecheck without building (fast inner-loop check)

**There is no test framework.** Verify changes with `pnpm build` (or `tsc --noEmit`) plus a manual API smoke test — start the dev server and curl the recommendation endpoint:

```bash
curl -s -X POST http://localhost:3000/api/recommend -H 'Content-Type: application/json' \
  -d '{"languages":["Rust"],"yearsExperience":0.5,"interests":["learning"],"hoursPerWeek":10,"goals":"finished a Rust course, want Bitcoin Core","targetRepo":"bitcoin/bitcoin"}'
```

The response includes a `_source` field (`"model"` | `"fallback"`) telling you which path served it.

## Architecture: one request, three layers, never-fail

The whole app is a single page (`app/page.tsx`) + one API route (`app/api/recommend/route.ts`). There is no separate backend, no database, no auth. The recommendation flow is the thing to understand, and it spans three files:

1. **`app/lib/personas.ts`** — types (`Profile`, `RobinResponse`, `Recommendation`), the 3 demo presets, and **curated golden-path responses**. `resolvePersona(profile)` maps any profile to the nearest preset's response. This is the deterministic fallback and the source of preset content.
2. **`app/lib/github.ts`** — `buildLiveContext(repos)` fetches **live** signals (recent merged PRs, open `good first issue`s, latest release) from the GitHub REST API, cached 10 min in-memory. Best-effort: returns `""` on any failure. Uses `GITHUB_TOKEN` if set (avoids the 60 req/hr unauthenticated cap).
3. **`app/lib/robin.ts`** — `getRecommendation(profile)`. Builds the system prompt (Robin's behavior + a static ecosystem brief + the live GitHub signals), calls a model **via OpenRouter** (`/chat/completions`, OpenAI-shaped), validates the JSON against `RobinResponse`, and returns `{ response, source }`.

**The governing invariant: the demo must never break.** Every failure path — no API key, network error, timeout, or schema mismatch — silently falls back to the curated `resolvePersona` response. When editing `robin.ts`, preserve this: any throw inside the model path must land in the catch that returns the fallback.

### The model is OpenRouter, not the Anthropic SDK

Recommendations come from whatever model `OPENROUTER_MODEL` points at (e.g. `anthropic/claude-opus-4.8`, `z-ai/glm-5.1`), called over OpenRouter's OpenAI-compatible endpoint with raw `fetch`. Do **not** introduce the Anthropic SDK here. Provider gotcha already handled: **Opus 4.8 rejects `temperature`/sampling params (400)** — don't add them back. Reasoning models take **~25–31s per query**; the 60s `AbortSignal.timeout` and the UI skeleton (`ResultsSkeleton`) exist for this. It is RAG-style retrieval + synthesis — never call it "trained"/"fine-tuned" in copy.

### UI

`app/page.tsx` holds all state (`useState`, no state library) and orchestrates: preset click or form submit → POST `/api/recommend` → render. Two columns: intake (`app/components/Intake.tsx` — presets + profile form) on the left, ranked results (`app/components/Results.tsx` — expandable cards, the redirection banner, the dogfood callout) on the right. `?persona=bootcamp|senior|designer` deep-links auto-run a preset on load (screenshot/demo backup).

## Settled decisions (do not relitigate)

- **Structured intake, NOT chat.** The interaction is a form → ranked cards, rendered instantly. A chat UI was built once and deliberately removed. Do not reintroduce a conversation thread or composer. (DESIGN.md/PRODUCT.md still describe a chat tool — they are stale on this point; the structured-intake design is the source of truth.)
- **Honest redirection is the signature behavior.** `RobinResponse.mode` is `"guide"` or `"redirect"`; low `fitScore` triggers the redirect banner ("Not Core. Not yet."). Beginners/non-engineers aimed at Bitcoin Core should almost always be redirected; this is the demo's emotional peak, not a bug.
- **Theme: pure black + Bitcoin orange.** Color tokens live in `app/globals.css` (`--color-robin` is Bitcoin orange; amber `--color-honey*` is reserved exclusively for the redirection signpost). Fonts: Fraunces (Robin's voice, `.voice`), Hanken Grotesk (UI), JetBrains Mono (metadata).
- **Static ecosystem brief in `robin.ts` must be kept current.** It is the fallback when live signals fail, so a stale brief gives stale advice. (As of mid-2026: cluster mempool has shipped in Bitcoin Core v31 — it is no longer "in-flight.")

## Environment

Secrets go in `.env.local` (gitignored via `.env*`); `.env.example` documents every variable. Key ones: `OPENROUTER_API_KEY` (no key → fallback-only mode), `OPENROUTER_MODEL`, and the optional-but-recommended `GITHUB_TOKEN` for live signals.
