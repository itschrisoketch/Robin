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
    // Persist so reopening the popup restores this result (no auth/server).
    robinStoreSet({ "robin:last": { profile, response: data } });
    showReset();
  } catch (e) {
    robinError(outEl, e && e.message ? e.message : String(e));
  } finally {
    busy = false;
  }
}

// A small "New search" affordance once a result is showing.
function showReset() {
  if (document.getElementById("robin-reset")) return;
  const link = document.createElement("a");
  link.id = "robin-reset";
  link.href = "#";
  link.className = "robin-foot-link";
  link.innerHTML = `${robinIcon("add", 14)} New session`;
  link.addEventListener("click", (e) => {
    e.preventDefault();
    robinStoreRemove("robin:last");
    outEl.innerHTML = "";
    goalsEl.value = "";
    link.remove();
  });
  document.querySelector(".robin-foot").prepend(link);
}

document.getElementById("robin-go").addEventListener("click", run);
document.getElementById("robin-options").addEventListener("click", (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

// On open: restore the last result if we have one; otherwise pre-select the
// dropdown from the active GitHub tab.
function prefillFromTab() {
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
}

(async () => {
  const { "robin:last": last } = await robinStoreGet("robin:last");
  if (last && last.response && last.profile) {
    profile = { ...profile, ...last.profile };
    repoEl.value = profile.targetRepo;
    goalsEl.value = profile.goals || "";
    robinResults(outEl, last.response);
    showReset();
  } else {
    prefillFromTab();
  }
})();
