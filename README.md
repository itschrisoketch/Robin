# Robin

**A context-aware AI guide for prospective Bitcoin open-source contributors.**
It tells you _what_ to work on, _what_ to read first, and — when it matters most
— _when not to contribute yet._

> Built for the **bitcoin++ Nairobi Hackathon · Open Source Edition** (June 2026).

---

## The problem

Bitcoin open source is flooded with well-meaning but context-free pull requests.
A bootcamp grad finishes a Rust tutorial, opens Bitcoin Core, picks a random
`good first issue`, and submits something a maintainer has to politely close.
Multiply that by hundreds of contributors a week. The cost lands on the tiny
number of senior maintainers whose time is the scarcest resource in the whole
ecosystem.

Most tools attack this with **filters** — bouncers that activate _after_ the bad
PR already exists. Robin attacks it one layer upstream: it prevents the
low-context PR from being written in the first place, by giving contributors the
context they're missing.

## What makes Robin different — honest redirection

The signature behavior is **honest redirection**. When someone without the right
background asks _"what should I work on in Bitcoin Core?"_, Robin says
**"Not Core. Not yet."** and points them to smaller projects where they'll
genuinely help — warmly, never as a rejection.

> Everyone else is building bouncers. We built a tour guide.

A senior engineer with relevant depth gets the opposite: specific, real, in-flight
work matched to where maintainer attention already is.

---

## How it works

Robin is **structured intake → ranked output**, not a chatbot.

```
┌──────────────────────────┐        ┌─────────────────────────────┐
│  TELL ROBIN ABOUT YOU    │        │   RECOMMENDED FOR YOU       │
│                          │        │                             │
│  Presets:                │        │  ⚠  A fork in the trail     │
│   • Bootcamp grad        │  ───▶  │     "Not Core. Not yet."    │
│   • Senior C++ engineer  │        │                             │
│   • Designer             │        │  01  bitcoindevkit/bdk      │
│                          │        │  02  mempool/mempool        │
│  Languages, years,       │        │  03  bitcoin/bitcoin · doc/ │
│  interests, hours, goal  │        │                             │
│  [ Find my path → ]      │        │  Each card expands to show  │
│                          │        │  why-now · what-to-read ·   │
│                          │        │  honest fit · evidence      │
└──────────────────────────┘        └─────────────────────────────┘
            🍴 "We ate our own dogfood" — the PR Robin told us to open
```

1. A contributor picks a **persona preset** or fills the short profile form
   (languages, years of experience, interests, hours/week, goal, target repo).
2. The profile is sent to `/api/recommend`, which prompts a real model with
   context about the Bitcoin ecosystem's current trajectory and the
   honest-redirection behavior.
3. Robin returns **three ranked recommendation cards** — each with the specific
   area, _why the project needs it now_, what to read first, an honest fit
   assessment, and the concrete signals behind it. If fit is low, a prominent
   **redirection banner** appears.

### The model

Recommendations are generated **live** by a model served through
[OpenRouter](https://openrouter.ai). The model is fed a system prompt encoding
Robin's behavior plus a brief of the ecosystem's current state — it is **RAG-style
retrieval and synthesis, not a fine-tuned or "trained" model.**

If the model is unavailable (no key, network failure, timeout), Robin silently
falls back to a curated golden-path response so a live demo never breaks. The
response includes a `_source` field (`"model"` or `"fallback"`) so you can tell
which path ran.

> **Note:** reasoning models (e.g. Opus 4.8, GLM 5.1) take ~25–30s per answer.
> A skeleton loader covers the wait. Swap `OPENROUTER_MODEL` for a faster model
> if you need snappier responses.

---

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** — pure-black canvas with a Bitcoin-orange accent
- **One API route** (`/api/recommend`) calling OpenRouter — no separate backend
- Fonts: Fraunces (Robin's voice), Hanken Grotesk (UI), JetBrains Mono (metadata)

---

## Getting started

```bash
# 1. Install dependencies
pnpm install        # or: npm install

# 2. Configure your model key
cp .env.example .env.local
# then edit .env.local:
#   OPENROUTER_API_KEY=sk-or-v1-...        ← your OpenRouter key
#   OPENROUTER_MODEL=anthropic/claude-opus-4.8   ← any OpenRouter model slug

# 3. Run
pnpm dev            # or: npm run dev
```

Open <http://localhost:3000>.

Without a key, Robin still runs — it serves the curated fallback responses.

### Demo shortcuts

Deep-link a preset to auto-run it on load (handy for screenshots or a backup):

```
http://localhost:3000/?persona=bootcamp
http://localhost:3000/?persona=senior
http://localhost:3000/?persona=designer
```

---

## Project structure

```
app/
├── page.tsx                 # two-column structured-intake page
├── api/recommend/route.ts   # POST profile → ranked recommendations
├── lib/
│   ├── robin.ts             # system prompt + OpenRouter call + fallback
│   └── personas.ts          # presets, types, curated golden-path responses
└── components/
    ├── Intake.tsx           # persona presets + profile form
    ├── Results.tsx          # recommendation cards, redirection banner, dogfood
    └── icons.tsx            # hand-built marks
```

---

## Environment variables

| Variable               | Required | Description                                            |
| ---------------------- | -------- | ------------------------------------------------------ |
| `OPENROUTER_API_KEY`   | no\*     | OpenRouter key. Without it, Robin serves the fallback. |
| `OPENROUTER_MODEL`     | no       | Model slug. Default: `anthropic/claude-sonnet-4.6`.    |
| `OPENROUTER_BASE_URL`  | no       | Override the API base.                                 |
| `OPENROUTER_SITE_URL`  | no       | OpenRouter attribution header.                         |
| `OPENROUTER_SITE_NAME` | no       | OpenRouter attribution header.                         |

\* Required for live model output; optional for the curated demo fallback.

Secrets live in `.env.local`, which is gitignored. Never commit real keys.

---

## License

MIT
