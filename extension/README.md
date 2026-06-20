# Robin — Chrome extension

Brings Robin to where contributions actually start: the GitHub page. On any
`github.com/owner/repo` page it injects an **Ask Robin** button that gives a
contributor an honest read on that repo — what to work on, what to read first,
or whether to start somewhere else entirely. A popup offers the same intake form
for ad-hoc use.

## How it works

The extension is a **thin client**. It never holds any secret — it calls Robin's
existing Next.js backend (`/api/recommend`), which holds the OpenRouter and
GitHub credentials. The recommendation logic is unchanged from the web app.

```
extension (popup + GitHub content script)  ──▶  Next.js /api/recommend  ──▶  model + live GitHub signals
        no secrets, thin client                   holds all credentials
```

- **Popup** fetches the backend directly (extension context, granted by
  `host_permissions`).
- **Content script** can't fetch cross-origin from the github.com page, so it
  messages the **background service worker**, which does the fetch.

## Run it (demo)

1. Start the backend: `pnpm dev` (serves `http://localhost:3000`).
2. Chrome → `chrome://extensions` → enable **Developer mode** →
   **Load unpacked** → select this `extension/` folder.
3. Click the Robin toolbar icon for the popup, **or** visit any GitHub repo
   (e.g. <https://github.com/bitcoin/bitcoin/issues>) and click the **Ask Robin**
   button bottom-right.
4. Pick a persona → Robin reads the repo's live trajectory and answers inline.

Backend URL is configurable in the extension's **Settings** (options page).
It defaults to the production deployment (`https://www.buildwithrobin.xyz`), so
the extension works out of the box without running anything locally. For local
development against `pnpm dev`, point Settings at `http://localhost:3000` **and**
temporarily add `"http://localhost:3000/*"` to `host_permissions` in
`manifest.json` (it's omitted from the published build to keep permissions
minimal), then reload the extension.

> First answer takes ~25–30s (reasoning model); the panel shows a skeleton while
> it works.

## Files

| File             | Role                                                       |
| ---------------- | ---------------------------------------------------------- |
| `manifest.json`  | MV3 manifest — permissions, content script, background     |
| `background.js`  | Service worker — the network path for the content script   |
| `content.js`     | Injects the Ask-Robin button + verdict panel on GitHub     |
| `popup.{html,js}`| Toolbar popup — streamlined intake form                    |
| `options.{html,js}` | Set the backend URL                                     |
| `presets.js`     | Shared personas + backend fetch helper                     |
| `render.js`      | Shared result rendering                                    |
| `robin.css`      | Black + Bitcoin-orange styles, namespaced                  |

## Path to enterprise-grade

This is the hackathon build. For an enterprise rollout:

- **Auth:** replace any PAT with a **GitHub App** (per-org install, fine-grained
  per-repo access incl. private repos, short-lived rotating tokens, auditable).
  Add **SSO** between the extension and backend; isolate tenants.
- **Backend:** deploy the Next.js app; lock CORS to known origins (currently `*`
  for the demo); add rate limiting + a provider circuit breaker.
- **Privacy:** document what leaves the browser (profile + repo identifiers only),
  retention, and a deletion path.
- **Distribution:** private Chrome Web Store listing → **force-install** via
  Google Workspace Admin / Windows GPO / MDM.
- **Supply chain:** pin deps, ship an SBOM, sign releases; add error tracking and
  audit logging.
- Minimize `host_permissions` to exactly the GitHub host(s) you support.
