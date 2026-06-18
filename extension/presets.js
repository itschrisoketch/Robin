// Shared across popup + content script (classic scripts, shared global scope).
// Mirrors app/lib/personas.ts presets so the extension can pre-fill profiles.

const DEFAULT_BACKEND = "https://buildwithrobin.vercel.app";

// Selectable target repos — mirrors TARGET_REPOS in app/lib/personas.ts.
const ROBIN_TARGET_REPOS = [
  { label: "Bitcoin Core", repo: "bitcoin/bitcoin" },
  { label: "Proto Fleet", repo: "block/proto-fleet" },
];

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

// The Robin mark (bird logo) as inline SVG — mirrors app/components/icons.tsx.
// Path fills come from CSS (.rl-*) so it themes per context (wordmark vs FAB).
function robinLogo(size) {
  return (
    `<svg class="robin-logo" width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" aria-hidden="true">` +
    `<path class="rl-body" d="M7 14 L2 9 L10 16 Z"/>` +
    `<path class="rl-body" d="M27 11c-7-2-15 2-17 9-1 4 1 8 6 9 6 1 13-1 16-6 3-5 2-10-5-12Z"/>` +
    `<path class="rl-breast" d="M16 19c-2 3-2 6 0 8 3 1.6 7 1.2 10-0.6-2.6-3-6.4-5.6-10-7.4Z"/>` +
    `<path class="rl-beak" d="M27 11l7-1-6 4Z"/>` +
    `<circle class="rl-eye" cx="26.5" cy="14.5" r="1.4"/>` +
    `</svg>`
  );
}

// Lightweight local persistence (no auth, no server). chrome.storage.local
// survives the popup/panel closing and browser restarts; swap to
// chrome.storage.session if you'd rather it clear when the browser quits.
function robinStoreSet(obj) {
  try {
    chrome.storage.local.set(obj);
  } catch {
    /* storage unavailable — non-fatal */
  }
}
function robinStoreGet(keys) {
  return new Promise((resolve) => {
    try {
      chrome.storage.local.get(keys, (v) => resolve(v || {}));
    } catch {
      resolve({});
    }
  });
}
function robinStoreRemove(keys) {
  try {
    chrome.storage.local.remove(keys);
  } catch {
    /* non-fatal */
  }
}

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
