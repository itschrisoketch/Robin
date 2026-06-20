# Publishing the Robin extension to the Chrome Web Store

Everything needed to get Robin listed publicly. Copy is ready to paste.

## 0. Prerequisites

- A **Chrome Web Store developer account** — register once at
  <https://chrome.google.com/webstore/devconsole> ($5 one-time fee).
- The **packaged extension** — `robin-extension.zip` (see §4).
- At least one **screenshot** at **1280×800** (or 640×400) — see §5.
- The **privacy policy URL**: <https://www.buildwithrobin.xyz/privacy> (live).

## 1. Listing copy (paste into the dashboard)

**Name**
```
Robin — a path into Bitcoin open source
```

**Summary** (short description, ≤132 chars)
```
Find where to actually help in Bitcoin open source — what to work on, what to read first, and when not to contribute yet.
```

**Category:** Developer Tools  ·  **Language:** English

**Detailed description**
```
Bitcoin open source is flooded with well-meaning but low-context pull requests, and the cost lands on a tiny number of senior maintainers. Robin is the tour guide, not the bouncer: it helps you find where you'll genuinely help — and is honest when you're not ready for a project's hardest parts yet.

Open the popup, or click "Ask Robin" right on any GitHub repository page, and Robin reads that repo's live activity — its recent merged pull requests, open good-first-issues, and latest release — then gives you three ranked, honest recommendations. Each one tells you why the project needs it now, what to read first, and links straight to the real issue.

• Works on the GitHub page itself, where contributions actually start
• Grounded in real-time GitHub data — not generic advice
• Honest redirection: steers you to the accessible, useful work first
• Optional: connect GitHub (read-only) so Robin weighs your real skills
• No accounts, no tracking; your keys never live in the extension

Robin currently guides Bitcoin Core and Block's Proto Fleet, and generalizes to any Bitcoin OSS repository.
```

**Single-purpose statement**
```
Robin recommends where a prospective contributor should start in a Bitcoin open-source project — shown on the project's GitHub pages and in a popup.
```

## 2. Permission justifications (paste each)

- **storage** — "Save the user's most recent recommendation and the configured backend URL so the popup and on-page panel restore when reopened."
- **activeTab** — "When the user opens the popup, read the current tab's GitHub repository name to pre-select the target. Only used in response to the user opening the action."
- **Host `https://github.com/*`** — "Inject the 'Ask Robin' panel onto GitHub repository pages, where the guidance is shown."
- **Host `https://www.buildwithrobin.xyz/*`** — "Call Robin's backend API to generate recommendations and, optionally, to connect the user's GitHub account."
- **Remote code:** No. All code is bundled in the package; nothing is fetched and executed at runtime.

## 3. Data-usage disclosures (Privacy practices tab)

- **What it collects:** the profile the user types (languages, experience, interests, goal, target repo) and, only if they connect GitHub, their public GitHub username and a derived summary of public repos/languages.
- **How it's used:** solely to generate the user's recommendation (sent to Robin's backend and to the OpenRouter model). The GitHub OAuth token is discarded after deriving the summary and is never stored.
- **Certifications:** not sold or transferred to third parties; used only for the single purpose above; not used to determine creditworthiness or for lending.
- **Privacy policy URL:** `https://www.buildwithrobin.xyz/privacy`

## 4. Package the ZIP

From the repo root:
```bash
pnpm run package:ext      # writes robin-extension.zip (manifest at the zip root)
```
Upload `robin-extension.zip` in the dashboard. Bump `version` in
`extension/manifest.json` for every resubmission.

## 5. Screenshots (need ≥1)

Capture at **1280×800**:
1. The popup showing a result (presets + recommendation cards), ideally with GitHub connected so the language pills show.
2. The "Ask Robin" panel open on a real GitHub repo page (e.g. github.com/bitcoin/bitcoin).

## 6. Submit & review

Upload the ZIP → fill §1–§3 → add screenshots → submit. Review typically takes a
few hours to a few days. Because Robin uses no remote code and minimal,
clearly-justified permissions, it should pass smoothly.

> Note: the published build omits `localhost` from `host_permissions`. To test
> the extension against a local backend, temporarily re-add
> `"http://localhost:3000/*"` to `manifest.json` and reload it unpacked.
