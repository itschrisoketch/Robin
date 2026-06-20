// MV3 service worker. The single network path for content scripts: GitHub pages
// can't fetch the backend directly (page-origin CORS), so the content script
// messages here, and the worker fetches (host_permissions grant cross-origin).

const DEFAULT_BACKEND = "https://www.buildwithrobin.xyz";

function getBackend() {
  return new Promise((resolve) => {
    chrome.storage.sync.get({ backend: DEFAULT_BACKEND }, (v) =>
      resolve((v && v.backend) || DEFAULT_BACKEND),
    );
  });
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg && msg.type === "robin:recommend") {
    (async () => {
      try {
        const backend = await getBackend();
        const res = await fetch(`${backend}/api/recommend`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(msg.profile),
          credentials: "include", // carry the GitHub cookie if connected
        });
        if (!res.ok) throw new Error(`Backend returned ${res.status}`);
        const data = await res.json();
        sendResponse({ ok: true, data });
      } catch (e) {
        sendResponse({ ok: false, error: String(e && e.message ? e.message : e) });
      }
    })();
    return true; // keep the message channel open for the async response
  }
});
