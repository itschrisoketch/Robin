// Content script on github.com. Detects the repo you're viewing, injects a
// floating "Ask Robin" button, and shows Robin's verdict for THAT repo in a
// side panel — the thesis made literal: guidance at the moment of contribution.
//
// Network goes through the background worker (page-origin can't fetch the
// backend directly). Shares globals with presets.js + render.js.

(function () {
  function detectRepo() {
    const m = location.pathname.match(/^\/([^/]+)\/([^/?#]+)/);
    if (!m) return null;
    const reserved = [
      "orgs",
      "settings",
      "marketplace",
      "notifications",
      "explore",
      "topics",
      "sponsors",
      "about",
      "features",
      "pricing",
      "search",
    ];
    if (reserved.includes(m[1])) return null;
    return `${m[1]}/${m[2]}`;
  }

  let panel = null;

  function recommend(profile) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { type: "robin:recommend", profile },
        (resp) => {
          if (chrome.runtime.lastError)
            return reject(new Error(chrome.runtime.lastError.message));
          if (!resp || !resp.ok)
            return reject(new Error((resp && resp.error) || "no response"));
          resolve(resp.data);
        },
      );
    });
  }

  function openPanel(repo) {
    if (panel) {
      panel.remove();
      panel = null;
    }
    panel = document.createElement("div");
    panel.className = "robin-panel robin-scope";
    panel.innerHTML = `
      <div class="robin-panel-head">
        <div class="robin-wordmark"><span class="robin-dot"></span><span class="robin-name">Robin</span></div>
        <button class="robin-x" title="Close">&times;</button>
      </div>
      <p class="robin-panel-repo">Should you contribute to <span class="robin-mono">${robinEsc(
        repo,
      )}</span>?</p>
      <p class="robin-panel-q">Pick the profile that fits you:</p>
      <div class="robin-panel-presets"></div>
      <section class="robin-out"></section>`;
    document.body.appendChild(panel);

    const out = panel.querySelector(".robin-out");
    const presetsWrap = panel.querySelector(".robin-panel-presets");
    panel.querySelector(".robin-x").addEventListener("click", () => {
      panel.remove();
      panel = null;
    });

    ROBIN_PRESETS.forEach((p) => {
      const b = document.createElement("button");
      b.className = "robin-preset";
      b.innerHTML = `<span class="robin-preset-name">${p.name}</span><span class="robin-preset-sum">${p.summary}</span>`;
      b.addEventListener("click", async () => {
        const profile = { ...p.profile, targetRepo: repo };
        robinLoading(out);
        try {
          const data = await recommend(profile);
          robinResults(out, data);
        } catch (e) {
          robinError(out, e && e.message ? e.message : String(e));
        }
      });
      presetsWrap.appendChild(b);
    });
  }

  function mountButton() {
    const repo = detectRepo();
    if (!repo) return;
    if (document.getElementById("robin-fab")) return;
    const fab = document.createElement("button");
    fab.id = "robin-fab";
    fab.className = "robin-fab robin-scope";
    fab.innerHTML = `<span class="robin-dot"></span> Ask Robin`;
    fab.title = `Should you contribute to ${repo}?`;
    fab.addEventListener("click", () => openPanel(repo));
    document.body.appendChild(fab);
  }

  mountButton();

  // GitHub is a SPA (pjax/turbo) — re-mount on client-side navigations.
  let last = location.pathname;
  setInterval(() => {
    if (location.pathname !== last) {
      last = location.pathname;
      const existing = document.getElementById("robin-fab");
      if (existing) existing.remove();
      if (panel) {
        panel.remove();
        panel = null;
      }
      mountButton();
    }
  }, 1000);
})();
