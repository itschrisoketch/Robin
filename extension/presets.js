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

// Material Symbols paths (inlined — the extension CSP blocks icon fonts/CDNs).
const ROBIN_ICONS = {
  add: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
  close:
    "M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
  openInNew:
    "M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z",
  settings:
    "M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z",
};
function robinIcon(name, size = 16) {
  return `<svg class="robin-ico" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><path d="${ROBIN_ICONS[name] || ""}"/></svg>`;
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
    credentials: "include", // carry the GitHub cookie if connected
  });
  if (!res.ok) throw new Error(`Backend returned ${res.status}`);
  return res.json();
}

// GitHub mark for the connect control.
function robinGithubMark(size = 15) {
  return `<svg class="robin-ico" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.486 2 12.02c0 4.428 2.865 8.184 6.839 9.51.5.092.682-.218.682-.483 0-.237-.009-.866-.013-1.7-2.782.606-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.467-1.11-1.467-.908-.622.069-.61.069-.61 1.004.071 1.532 1.034 1.532 1.034.892 1.532 2.341 1.09 2.91.833.092-.648.35-1.09.636-1.341-2.22-.253-4.555-1.114-4.555-4.957 0-1.095.39-1.99 1.029-2.69-.103-.254-.446-1.274.098-2.655 0 0 .84-.27 2.75 1.027a9.546 9.546 0 0 1 2.504-.338c.85.004 1.705.115 2.504.338 1.909-1.297 2.748-1.027 2.748-1.027.546 1.381.203 2.401.1 2.655.64.7 1.028 1.595 1.028 2.69 0 3.853-2.339 4.701-4.566 4.949.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .267.18.579.688.481A10.02 10.02 0 0 0 22 12.02C22 6.486 17.523 2 12 2Z"/></svg>`;
}
