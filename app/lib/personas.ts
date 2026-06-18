// Robin's golden-path content. Deterministic + offline so the demo never
// depends on conference wifi. In v1 these responses come from RAG over the
// repo's open issues, last ~100 merged PRs, and contributor docs; here they
// are the curated output of that pipeline, frozen for the stage.

export type ReadItem = { label: string; note?: string; url?: string };

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
  // A real, working link the contributor should open — a specific issue/PR when
  // one is surfaced in live signals, otherwise the repo's good-first-issue filter.
  url?: string;
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
        "The instinct is right — let's just aim it at the right part of Core.",
        "Bitcoin Core is consensus-critical C++ maintained by a handful of reviewers whose time is the scarcest resource here. Diving straight at a consensus or net good-first-issue now means a senior reviewer spends their afternoon kindly closing your PR. So start at the edges of Core, where your work genuinely helps today and you build the context the hard parts demand.",
      ],
      verdict: {
        headline: "Start at the edges, not the core.",
        sub: "Three ways to contribute to Bitcoin Core right now that don't need deep C++ — each one builds toward the rest.",
      },
      recs: [
        {
          rank: 1,
          repo: "bitcoin/bitcoin",
          area: "Documentation & developer-notes fixes (doc/)",
          signal: "docs · no C++ needed · low blast radius",
          whyNow:
            "Doc and developer-notes cleanups are the one way to contribute to Core today with zero consensus risk. Reviewers genuinely appreciate them, and you start learning the codebase's vocabulary from the inside.",
          readFirst: [
            {
              label: "doc/developer-notes.md",
              note: "read it, fix what's stale",
              url: "https://github.com/bitcoin/bitcoin/blob/master/doc/developer-notes.md",
            },
            {
              label: "CONTRIBUTING.md",
              note: "their review norms",
              url: "https://github.com/bitcoin/bitcoin/blob/master/CONTRIBUTING.md",
            },
          ],
          fit: "The safest real contribution for a newcomer. Builds standing and vocabulary before you touch code.",
          evidence: [
            "doc-only PRs in bitcoin/bitcoin merge with far less review friction than code changes",
            "developer-notes is large and evolves constantly — small staleness fixes are welcome",
            "Zero consensus risk, so reviewers can approve quickly",
          ],
          url: "https://github.com/bitcoin/bitcoin/tree/master/doc",
        },
        {
          rank: 2,
          repo: "bitcoin/bitcoin",
          area: "Test coverage & good-first-issues",
          signal: "tests · mentored entry · scoped",
          whyNow:
            "Functional and unit test gaps are a standing need, and the labelled good-first-issues are deliberately scoped for newcomers. It's where you start reading real Core code without the stakes of consensus changes.",
          readFirst: [
            {
              label: "open `good first issue`s",
              note: "pick one that's unassigned",
              url: 'https://github.com/bitcoin/bitcoin/issues?q=is%3Aopen%20is%3Aissue%20label%3A%22good%20first%20issue%22',
            },
            {
              label: "the functional test README",
              note: "test/functional",
              url: "https://github.com/bitcoin/bitcoin/blob/master/test/README.md",
            },
          ],
          fit: "A real first PR. You'll learn the build and the review process on a low-risk surface — Rust transfers more than you'd think once you're reading the tests.",
          evidence: [
            "good-first-issues are curated by maintainers specifically for first-time contributors",
            "test PRs can't break consensus, so they move faster than feature work",
            "Reading tests is the fastest way to learn how a Core subsystem actually behaves",
          ],
          url: 'https://github.com/bitcoin/bitcoin/issues?q=is%3Aopen%20is%3Aissue%20label%3A%22good%20first%20issue%22',
        },
        {
          rank: 3,
          repo: "bitcoin/bitcoin",
          area: "Build, CI & tooling",
          signal: "tooling · accessible · real impact",
          whyNow:
            "Build scripts, CI, and contributor tooling are perennially under-resourced and don't require consensus expertise. Improving them helps every other contributor and gets you fluent in how Core is built and tested.",
          readFirst: [
            {
              label: "doc/productivity.md",
              note: "how Core devs work day-to-day",
              url: "https://github.com/bitcoin/bitcoin/blob/master/doc/productivity.md",
            },
            {
              label: "the contrib/ directory",
              note: "scripts and tooling",
              url: "https://github.com/bitcoin/bitcoin/tree/master/contrib",
            },
          ],
          fit: "Pragmatic and visible. A good third step once docs and tests have you comfortable in the repo.",
          evidence: [
            "CI and tooling changes are reviewed by a broader set of contributors, not just consensus reviewers",
            "Improvements here compound — they speed up everyone's workflow",
            "No protocol knowledge required to start",
          ],
          url: "https://github.com/bitcoin/bitcoin/tree/master/contrib",
        },
      ],
      closer:
        "Land two or three of these and you'll know the build, the review culture, and the codebase's language. Then the consensus and net work stops being a wall and starts being the next step.",
      sources: [
        "bitcoin/bitcoin · CONTRIBUTING.md + doc/",
        "bitcoin/bitcoin · good-first-issue labels",
        "bitcoin/bitcoin · test/ and contrib/",
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
      fitScore: 22,
      intro: [
        "Let's be honest about the surface first: Bitcoin Core is a headless C++ daemon — there's no UI to design here.",
        "But design isn't only screens. Core's documentation and contributor onboarding are real information-architecture and UX problems, and they're genuinely under-served. That's where a designer helps inside Core today.",
      ],
      verdict: {
        headline: "Core's canvas is its docs.",
        sub: "No interface to design here — but its documentation and onboarding are real design work. Start there.",
      },
      recs: [
        {
          rank: 1,
          repo: "bitcoin/bitcoin",
          area: "Documentation information architecture (doc/)",
          signal: "IA · docs · no code needed",
          whyNow:
            "The doc/ tree is organized for maintainers, not newcomers — exactly the kind of structure-and-clarity problem design solves. Restructuring and clarifying it carries zero consensus risk and helps every future contributor.",
          readFirst: [
            {
              label: "doc/ directory structure",
              note: "where would a newcomer get lost?",
              url: "https://github.com/bitcoin/bitcoin/tree/master/doc",
            },
            {
              label: "doc/developer-notes.md",
              note: "dense — a clarity target",
              url: "https://github.com/bitcoin/bitcoin/blob/master/doc/developer-notes.md",
            },
          ],
          fit: "Your strongest landing spot in Core. Pure IA and clarity work, no C++ required.",
          evidence: [
            "doc/ is a flat pile of files organized by history, not by reader journey",
            "Doc PRs carry no consensus risk and are welcomed",
            "Clearer docs compound — they help every future contributor",
          ],
          url: "https://github.com/bitcoin/bitcoin/tree/master/doc",
        },
        {
          rank: 2,
          repo: "bitcoin/bitcoin",
          area: "Contributor onboarding experience (CONTRIBUTING)",
          signal: "UX · onboarding · high leverage",
          whyNow:
            "The first-PR journey is the funnel for every future Core contributor, and it's daunting. Mapping and smoothing that path is service design — and it's the single highest-leverage thing a designer can fix here.",
          readFirst: [
            {
              label: "CONTRIBUTING.md",
              note: "walk it as a first-timer",
              url: "https://github.com/bitcoin/bitcoin/blob/master/CONTRIBUTING.md",
            },
            {
              label: "doc/productivity.md",
              note: "the unwritten workflow",
              url: "https://github.com/bitcoin/bitcoin/blob/master/doc/productivity.md",
            },
          ],
          fit: "Design-thinking applied to a real funnel. You'll improve the experience of every contributor who comes after you.",
          evidence: [
            "Onboarding friction is a known, repeatedly-cited barrier to new Core contributors",
            "Improving the path is service/UX design, not engineering",
            "Changes here are reviewed by a broad set of contributors, not just consensus reviewers",
          ],
          url: "https://github.com/bitcoin/bitcoin/blob/master/CONTRIBUTING.md",
        },
        {
          rank: 3,
          repo: "bitcoin/bitcoin",
          area: "Diagrams & readability for the design docs (doc/design/)",
          signal: "visual · explanatory · welcomed",
          whyNow:
            "Core's architecture and design notes are text-heavy and hard to parse. Clear diagrams and structure for doc/design make complex systems legible — explanatory design that maintainers value.",
          readFirst: [
            {
              label: "doc/design/",
              note: "the architecture notes",
              url: "https://github.com/bitcoin/bitcoin/tree/master/doc/design",
            },
          ],
          fit: "A focused way to apply visual/explanatory design without touching code.",
          evidence: [
            "Architecture docs are dense prose that diagrams would make far more legible",
            "Explanatory visuals help reviewers and newcomers alike",
            "No protocol knowledge required to improve clarity and structure",
          ],
          url: "https://github.com/bitcoin/bitcoin/tree/master/doc/design",
        },
      ],
      closer:
        "Honest nudge: if you want real interface work, switch the target above to Proto Fleet — it has an actual front-end. But within Core, docs and onboarding are where your design eye genuinely lands.",
      sources: [
        "bitcoin/bitcoin · doc/ + doc/design/",
        "bitcoin/bitcoin · CONTRIBUTING.md, doc/productivity.md",
        "bitcoin/bitcoin · contributor onboarding path",
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

// The link a recommendation card opens. Prefer the model-supplied URL (a real
// issue/PR from live signals); otherwise derive the repo's issue tracker.
export function recUrl(rec: { url?: string; repo: string }): string {
  if (rec.url && /^https?:\/\//.test(rec.url)) return rec.url;
  const m = rec.repo.match(/([\w.-]+)\/([\w.-]+)/);
  return m
    ? `https://github.com/${m[1]}/${m[2]}/issues`
    : "https://github.com/bitcoin/bitcoin";
}

// Target repos a contributor can aim at (the intake dropdown).
export const TARGET_REPOS = [
  { label: "Bitcoin Core", repo: "bitcoin/bitcoin" },
  { label: "Proto Fleet", repo: "block/proto-fleet" },
];

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
