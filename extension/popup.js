// Popup: streamlined intake. Presets fill the form; "Find my path" calls the
// backend directly (extension context → host_permissions, no CORS issue).

const repoEl = document.getElementById("robin-repo");
const goalsEl = document.getElementById("robin-goals");
const outEl = document.getElementById("robin-out");
const presetsEl = document.getElementById("robin-presets");

// Working profile — defaults to a mid-level engineer until a preset overrides.
let profile = {
  languages: [],
  yearsExperience: 3,
  interests: [],
  hoursPerWeek: 5,
  goals: "",
  targetRepo: "bitcoin/bitcoin",
};

let busy = false;

// Populate the target-repo dropdown (Bitcoin Core / Proto Fleet).
ROBIN_TARGET_REPOS.forEach((r) => {
  const o = document.createElement("option");
  o.value = r.repo;
  o.textContent = `${r.label} — ${r.repo}`;
  repoEl.appendChild(o);
});

function syncFormToProfile() {
  profile.targetRepo = repoEl.value || "bitcoin/bitcoin";
  profile.goals = goalsEl.value.trim();
}

function applyPreset(p) {
  profile = { ...p.profile };
  repoEl.value = profile.targetRepo;
  goalsEl.value = profile.goals;
  run();
}

// Render preset buttons.
ROBIN_PRESETS.forEach((p) => {
  const b = document.createElement("button");
  b.className = "robin-preset";
  b.innerHTML = `<span class="robin-preset-name">${p.name}</span><span class="robin-preset-sum">${p.summary}</span>`;
  b.addEventListener("click", () => applyPreset(p));
  presetsEl.appendChild(b);
});

async function run() {
  if (busy) return;
  busy = true;
  syncFormToProfile();
  robinLoading(outEl);
  try {
    const data = await robinFetch(profile);
    robinResults(outEl, data);
  } catch (e) {
    robinError(outEl, e && e.message ? e.message : String(e));
  } finally {
    busy = false;
  }
}

document.getElementById("robin-go").addEventListener("click", run);
document.getElementById("robin-options").addEventListener("click", (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

// Pre-select the dropdown from the active GitHub tab when it's one of the
// supported targets; otherwise leave the default (Bitcoin Core).
try {
  const targets = ROBIN_TARGET_REPOS.map((r) => r.repo);
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs && tabs[0] && tabs[0].url;
    if (!url) return;
    const m = url.match(/^https:\/\/github\.com\/([^/]+)\/([^/?#]+)/);
    if (m) {
      const full = `${m[1]}/${m[2]}`;
      if (targets.includes(full)) {
        repoEl.value = full;
        profile.targetRepo = full;
      }
    }
  });
} catch {
  /* default option (Bitcoin Core) stays selected */
}
