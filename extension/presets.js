// Shared across popup + content script (classic scripts, shared global scope).
// Mirrors app/lib/personas.ts presets so the extension can pre-fill profiles.

const DEFAULT_BACKEND = "https://buildwithrobin.vercel.app";

const ROBIN_PRESETS = [
  {
    id: "bootcamp",
    name: "Bootcamp grad",
    summary: "Rust beginner, just finished Programming Bitcoin.",
    profile: {
      languages: ["Rust"],
      yearsExperience: 0.5,
      interests: ["learning", "bitcoin basics"],
      hoursPerWeek: 10,
      goals:
        "Just finished a Rust course and Programming Bitcoin. Want to contribute to Bitcoin Core.",
      targetRepo: "bitcoin/bitcoin",
    },
  },
  {
    id: "senior",
    name: "Senior C++ engineer",
    summary: "15 years systems C++, consensus-curious.",
    profile: {
      languages: ["C++", "Python"],
      yearsExperience: 15,
      interests: ["consensus", "networking", "p2p"],
      hoursPerWeek: 6,
      goals:
        "Long career in systems C++. Want to contribute meaningfully to Bitcoin Core consensus or net code.",
      targetRepo: "bitcoin/bitcoin",
    },
  },
  {
    id: "designer",
    name: "Designer / non-engineer",
    summary: "Product designer, no protocol code.",
    profile: {
      languages: [],
      yearsExperience: 5,
      interests: ["UX", "documentation"],
      hoursPerWeek: 5,
      goals:
        "Designer with no protocol experience. Want to help Bitcoin open source somewhere I'm actually useful.",
      targetRepo: "bitcoin/bitcoin",
    },
  },
];

function robinGetBackend() {
  return new Promise((resolve) => {
    try {
      chrome.storage.sync.get({ backend: DEFAULT_BACKEND }, (v) =>
        resolve((v && v.backend) || DEFAULT_BACKEND),
      );
    } catch {
      resolve(DEFAULT_BACKEND);
    }
  });
}

// Direct fetch — safe from extension contexts (popup/options/service worker)
// because the backend origin is in host_permissions. Content scripts must NOT
// use this (page-origin CORS) — they message the background worker instead.
async function robinFetch(profile) {
  const backend = await robinGetBackend();
  const res = await fetch(`${backend}/api/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
  if (!res.ok) throw new Error(`Backend returned ${res.status}`);
  return res.json();
}
