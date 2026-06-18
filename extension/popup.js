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

function syncFormToProfile() {
  profile.targetRepo = repoEl.value.trim() || "bitcoin/bitcoin";
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

// Pre-fill the target repo from the active GitHub tab, if any.
try {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs && tabs[0] && tabs[0].url;
    if (!url) return;
    const m = url.match(/^https:\/\/github\.com\/([^/]+)\/([^/?#]+)/);
    if (m && !["orgs", "settings", "marketplace"].includes(m[1])) {
      repoEl.value = `${m[1]}/${m[2]}`;
    } else {
      repoEl.value = "bitcoin/bitcoin";
    }
  });
} catch {
  repoEl.value = "bitcoin/bitcoin";
}
