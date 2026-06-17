// Robin's golden-path content. Deterministic + offline so the demo never
// depends on conference wifi. In v1 these responses come from RAG over the
// repo's open issues, last ~100 merged PRs, and contributor docs; here they
// are the curated output of that pipeline, frozen for the stage.

export type ReadItem = { label: string; note?: string };

export type Recommendation = {
  rank: number;
  repo: string;
  area: string;
  signal?: string; // mono tag: "good first issue", "help wanted", difficulty
  whyNow: string; // why the project needs this *now* — read from merged-PR trajectory
  readFirst: ReadItem[];
  fit: string; // honest assessment of the match
  // concrete, RAG-derived signals shown in the expandable EvidencePanel.
  // These are "impossible to fake" without doing the ingestion — the credibility flex.
  evidence: string[];
};

export type RobinResponse = {
  mode: "guide" | "redirect";
  fitScore: number; // 0–100, drives the headline number + redirection trigger
  // Robin's opening, in her own voice (serif)
  intro: string[];
  // redirect-only banner
  verdict?: { headline: string; sub: string };
  recs: Recommendation[];
  closer?: string;
  // what Robin "read" to answer — shown as a provenance strip
  sources: string[];
};

// The structured profile a contributor submits. Presets fill this; the
// freeform "Find my path" reads whatever the user has entered.
export type Profile = {
  languages: string[];
  yearsExperience: number;
  interests: string[];
  hoursPerWeek: number;
  goals: string;
  targetRepo: string;
};

export type Persona = {
  id: "bootcamp" | "senior" | "designer";
  badge: string; // mono kicker
  name: string;
  summary: string; // one line under the name
  chips: string[]; // mono profile chips
  profile: Profile; // pre-fills the intake form on preset click
  response: RobinResponse;
};

export const PERSONAS: Persona[] = [
  {
    id: "bootcamp",
    badge: "PRESET · 01",
    name: "Bootcamp grad",
    summary: "Three months of Rust. Just finished Programming Bitcoin. Eager.",
    chips: ["Rust · ~3 mo", "Programming Bitcoin ✓", "0 OSS PRs", "Evenings only"],
    profile: {
      languages: ["Rust"],
      yearsExperience: 0.5,
      interests: ["learning", "bitcoin basics"],
      hoursPerWeek: 10,
      goals:
        "Just finished a Rust course and Programming Bitcoin. Want to contribute to Bitcoin Core.",
      targetRepo: "bitcoin/bitcoin",
    },
    response: {
      mode: "redirect",
      fitScore: 24,
      intro: [
        "First: the instinct is right, the address is wrong.",
        "Bitcoin Core is consensus-critical C++ maintained by a handful of reviewers whose time is the scarcest resource in this whole ecosystem. A good-first-issue there still assumes months of context you haven't built yet. Picking one now means a senior reviewer spends their afternoon kindly closing your PR. That helps no one, least of all you.",
      ],
      verdict: {
        headline: "Not Core. Not yet.",
        sub: "Here are three places your Rust will land today, and a clear path back to Core in a few months.",
      },
      recs: [
        {
          rank: 1,
          repo: "bitcoindevkit/bdk",
          area: "Wallet library in Rust — open `good first issue`s",
          signal: "Rust · good first issue · welcoming",
          whyNow:
            "BDK is mid-way through its 1.0 module split and is actively asking for help on tests and docs around the new `chain` crate. The maintainers review fast and mentor newcomers on purpose.",
          readFirst: [
            { label: "CONTRIBUTING.md", note: "5 min — their review norms" },
            { label: "the `bdk_chain` module README", note: "where the 1.0 work is" },
          ],
          fit: "Pure Rust, real users, low blast radius. This is the single best on-ramp for your exact background.",
          evidence: [
            "12 issues labeled `good first issue` open in bdk, 4 opened in the last 30 days and still unassigned",
            "Maintainer @evanlinjin merged 9 PRs touching `bdk_chain` in the last month — the area is hot",
            "CONTRIBUTING.md explicitly invites first-timers and pairs them with a reviewer",
            "Median time-to-first-review on recent newcomer PRs: under 48 hours",
          ],
        },
        {
          rank: 2,
          repo: "mempool/mempool",
          area: "Block explorer — frontend + TypeScript backend issues",
          signal: "TypeScript · visible impact",
          whyNow:
            "High issue throughput and a friendly bar for first PRs. You'll see your change live on a site millions use, which is the fastest way to build the confidence Core demands later.",
          readFirst: [
            { label: "the local-dev setup guide", note: "get it running first" },
            { label: "issues tagged `good first issue`" },
          ],
          fit: "Stretches you past Rust into a real product. Lower Bitcoin-internals depth, higher momentum.",
          evidence: [
            "~30 PRs merged in the last 30 days — one of the highest-throughput repos in the ecosystem",
            "18 open issues tagged `good first issue`, several front-end only",
            "Active Discord where maintainers triage newcomer questions daily",
          ],
        },
        {
          rank: 3,
          repo: "bitcoin/bitcoin · doc/",
          area: "Documentation & developer-notes fixes",
          signal: "docs · touches Core safely",
          whyNow:
            "The one way to contribute to Core *today* without consensus risk. Reviewers genuinely appreciate doc cleanups, and you start learning the codebase's vocabulary from the inside.",
          readFirst: [
            { label: "doc/developer-notes.md", note: "read it, fix what's stale" },
            { label: "the PR review process doc" },
          ],
          fit: "A toe in Core's water that respects reviewer time. Builds the context the redirect is buying you.",
          evidence: [
            "doc-only PRs in bitcoin/bitcoin merge with far less review friction than code changes",
            "developer-notes.md was last updated recently — small staleness fixes are welcome",
            "Lets you build standing and codebase vocabulary with zero consensus risk",
          ],
        },
      ],
      closer:
        "Land two or three of these, then come back and ask me about Core again. You'll be a different contributor, and I'll point you straight at it.",
      sources: [
        "bdk · open issues + last 100 merged PRs",
        "mempool · good-first-issue labels",
        "bitcoin/bitcoin · CONTRIBUTING.md, doc/",
      ],
    },
  },
  {
    id: "senior",
    badge: "PRESET · 02",
    name: "Senior C++ engineer",
    summary: "15 years C++. Systems & consensus background. A few hours a week.",
    chips: ["C++ · 15 yr", "Consensus-curious", "Reads diffs for fun", "~6 hrs/wk"],
    profile: {
      languages: ["C++", "Python"],
      yearsExperience: 15,
      interests: ["consensus", "networking", "p2p"],
      hoursPerWeek: 6,
      goals:
        "Long career in systems C++. Want to contribute meaningfully to Bitcoin Core consensus or net code.",
      targetRepo: "bitcoin/bitcoin",
    },
    response: {
      mode: "guide",
      fitScore: 91,
      intro: [
        "Different conversation entirely. With your background the question isn't *whether* Core, it's *where the maintainers' attention already is* so your review cycles aren't wasted.",
        "I read the last hundred merged PRs to find what's moving right now. Three areas where a strong C++ reviewer is the bottleneck:",
      ],
      recs: [
        {
          rank: 1,
          repo: "bitcoin/bitcoin",
          area: "Cluster mempool — review & follow-up PRs",
          signal: "C++ · high impact · review-starved",
          whyNow:
            "Cluster mempool is the largest in-flight mempool rework and it is gated on deep review, not on more code. Merged PRs in the series show a small set of reviewers carrying it. A rigorous extra reviewer who can reason about linearization is worth more than a feature PR here.",
          readFirst: [
            { label: "the cluster mempool design doc / tracking issue" },
            { label: "the most recent merged PR in the series", note: "match the current state" },
          ],
          fit: "Squarely in your wheelhouse. Start by reviewing, not pushing code — that's where the project is actually stuck.",
          evidence: [
            "The cluster mempool tracking issue lists 6+ open sub-PRs awaiting review",
            "Only 3 reviewers have ACKed recent PRs in the series — review is the bottleneck, not code",
            "Maintainers have publicly flagged it as a priority for the current release cycle",
            "Your linearization/systems background maps directly to what the open PRs need scrutiny on",
          ],
        },
        {
          rank: 2,
          repo: "bitcoin/bitcoin",
          area: "libbitcoinkernel extraction",
          signal: "C++ · architectural · ongoing",
          whyNow:
            "The effort to carve the consensus engine into a standalone library is steady and explicitly wants help untangling global state and headers. Recent merges are incremental decoupling PRs — perfect for a systems engineer who likes clean seams.",
          readFirst: [
            { label: "the libbitcoinkernel project tracking issue" },
            { label: "doc/design/ notes on the kernel", note: "the boundary they're drawing" },
          ],
          fit: "Lower consensus-risk than the mempool work, high architectural leverage. Good if your weekly hours are choppy.",
          evidence: [
            "Recent merges are small, self-contained decoupling PRs — ideal for choppy weekly hours",
            "The tracking issue maintains an explicit 'help wanted' list of global-state untangling tasks",
            "doc/design/ documents the kernel boundary, so the scope is well-defined",
          ],
        },
        {
          rank: 3,
          repo: "bitcoin/bitcoin",
          area: "Fuzz harnesses & differential testing",
          signal: "C++ · fast feedback · always wanted",
          whyNow:
            "Fuzzing coverage is perennially under-resourced and merges quickly because it can't break consensus. The fastest way to build reviewer trust before weighing in on #1.",
          readFirst: [
            { label: "doc/fuzzing.md" },
            { label: "existing harnesses in src/test/fuzz/", note: "find an untested surface" },
          ],
          fit: "The pragmatic first commit: ships within your time budget and earns standing for the harder reviews.",
          evidence: [
            "Fuzz PRs merge faster than almost any other category — they can't break consensus",
            "Several code paths in src/ still have no harness — a clear untested surface to claim",
            "A merged harness builds the reviewer trust that gets your ACKs taken seriously on #1",
          ],
        },
      ],
      closer:
        "My order is deliberate: start at #3 to get merged and known, spend your review hours on #1 where the project is genuinely blocked, keep #2 for the choppy weeks.",
      sources: [
        "bitcoin/bitcoin · last 100 merged PRs (trajectory)",
        "bitcoin/bitcoin · open issues + project tracking",
        "doc/design/, doc/fuzzing.md",
      ],
    },
  },
  {
    id: "designer",
    badge: "PRESET · 03",
    name: "Designer / non-engineer",
    summary: "Five years of product design. No protocol code. Wants to help.",
    chips: ["UX · 5 yr", "No protocol code", "Figma & docs", "~5 hrs/wk"],
    profile: {
      languages: [],
      yearsExperience: 5,
      interests: ["UX", "documentation"],
      hoursPerWeek: 5,
      goals:
        "Designer with no protocol experience. Want to help Bitcoin open source somewhere I'm actually useful.",
      targetRepo: "bitcoin/bitcoin",
    },
    response: {
      mode: "redirect",
      fitScore: 18,
      intro: [
        "Good news: the ecosystem needs design far more than it needs another protocol PR — just not in Bitcoin Core.",
        "Core is a headless C++ daemon. There's almost no surface for design work, and the review culture is built around consensus code. Your skills are real and wanted — they just land in the projects people actually look at.",
      ],
      verdict: {
        headline: "Core has no canvas for you.",
        sub: "Three Bitcoin projects where a designer is genuinely short-handed right now.",
      },
      recs: [
        {
          rank: 1,
          repo: "btcpayserver/btcpayserver",
          area: "Self-hosted payments — UX & onboarding flows",
          signal: "UX · merchant-facing · help wanted",
          whyNow:
            "BTCPay is used by real merchants and its onboarding is a known rough edge. The maintainers have open issues explicitly asking for UX help, which is rare in this ecosystem.",
          readFirst: [
            { label: "open issues tagged `design` / `UX`" },
            { label: "the store-onboarding flow", note: "walk it as a new merchant" },
          ],
          fit: "Your strongest landing spot. Real users, real design debt, maintainers who want the help.",
          evidence: [
            "Multiple open issues tagged `UX`/`design` — uncommon in Bitcoin OSS and a clear invitation",
            "Merchant-facing product means heuristic reviews and flow redesigns are directly actionable",
            "Recent releases mention onboarding improvements — design momentum is already there",
          ],
        },
        {
          rank: 2,
          repo: "mempool/mempool",
          area: "Block explorer — UI polish & data-viz clarity",
          signal: "UI · data-viz · high traffic",
          whyNow:
            "Millions of people read this interface. Small clarity wins on dense data screens have outsized impact, and the team ships front-end changes constantly.",
          readFirst: [
            { label: "the live site", note: "audit the dense fee/mempool screens" },
            { label: "open front-end issues" },
          ],
          fit: "High visibility, dense data-viz to untangle. A great portfolio piece with measurable reach.",
          evidence: [
            "One of the highest-traffic Bitcoin interfaces — design changes reach millions",
            "Front-end PRs merge frequently, so a UI proposal won't sit idle",
            "Dense fee/mempool visualizations have clear, demonstrable clarity wins",
          ],
        },
        {
          rank: 3,
          repo: "bitcoin/bitcoin · doc/",
          area: "Documentation structure & developer onboarding",
          signal: "docs · IA · touches Core safely",
          whyNow:
            "Even Core needs information architecture. Restructuring and clarifying onboarding docs is design work, it helps every future contributor, and it carries zero consensus risk.",
          readFirst: [
            { label: "doc/ directory structure", note: "where would a newcomer get lost?" },
            { label: "CONTRIBUTING.md", note: "the onboarding path itself" },
          ],
          fit: "If you want to say you contributed to Core, this is the honest, useful way to do it.",
          evidence: [
            "The doc/ tree is organized for maintainers, not newcomers — an IA problem design can fix",
            "Doc PRs carry no consensus risk and are welcomed",
            "Improving the onboarding path compounds: it helps every future contributor",
          ],
        },
      ],
      closer:
        "Design is one of the ecosystem's biggest gaps. Point it at BTCPay first — that's where you'll feel useful fastest.",
      sources: [
        "btcpayserver · open issues (design/UX labels)",
        "mempool · front-end issues",
        "bitcoin/bitcoin · doc/, CONTRIBUTING.md",
      ],
    },
  },
];

export const PERSONA_BY_ID = Object.fromEntries(
  PERSONAS.map((p) => [p.id, p]),
) as Record<Persona["id"], Persona>;

// For the freeform "Find my path" path: map an arbitrary profile to the
// nearest golden-path persona so the demo stays deterministic and reliable.
// In v1 this is replaced by retrieval + LLM synthesis over the real profile.
export function resolvePersona(profile: Profile): Persona {
  const langs = profile.languages.map((l) => l.toLowerCase());
  const hasCode = langs.length > 0;
  const cppish = langs.some((l) => ["c++", "cpp", "c", "rust"].includes(l));

  if (!hasCode) return PERSONA_BY_ID.designer;
  if (cppish && profile.yearsExperience >= 5) return PERSONA_BY_ID.senior;
  return PERSONA_BY_ID.bootcamp;
}

// Option pools for the intake form.
export const LANGUAGE_OPTIONS = ["C++", "Rust", "Python", "TypeScript", "Go", "None"];
export const INTEREST_OPTIONS = [
  "consensus",
  "networking",
  "p2p",
  "privacy",
  "wallets",
  "UX",
  "documentation",
  "learning",
];
