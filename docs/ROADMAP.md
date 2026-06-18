# Robin — Roadmap

Where Robin is today and where it's headed. Today Robin works in one direction:
a contributor describes themselves (or connects nothing), and Robin infers
**demand** by reading each repo's live GitHub activity, then recommends where to
help. The items below deepen both sides of that match.

> Status legend: **Planned** = agreed direction, not yet built.

---

## 1. Project Needs Portal — the supply side **(Planned)**

**Problem.** Robin currently infers what a project needs from public signals
(open issues, merged PRs, labels). That misses the things maintainers *know* but
haven't filed cleanly: "we need a reviewer who understands linearization", "our
docs onboarding is the real bottleneck", "we want a designer, not another
protocol PR". The richest signal lives in the maintainer's head.

**What it adds.** A second portal on the site where maintainers and projects
**publish their needs directly** — short posts describing the help they want,
the skills it requires, and how urgent it is. Robin then matches contributors
against *posted needs* as well as inferred activity. This turns Robin from a
one-way recommender into a **two-sided marketplace**: contributors looking for
where to help, projects broadcasting where they're stuck.

**Sketch.**
- A `/projects` (or `/needs`) route: authenticated maintainers create/edit need
  posts (repo, area, required skills, time commitment, urgency, a link).
- Needs are stored (DB) and surfaced two ways: a browsable board, and as an
  additional retrieval source in `/api/recommend` so the model can match a
  contributor to a real, human-written need and link straight to it.
- Verification that a poster actually maintains the repo they post for (GitHub
  org/repo permission check) to keep the board trustworthy.

**Considerations.** Auth + identity (who can post for a repo), moderation/spam,
keeping posts fresh (stale needs decay), and ranking posted-needs vs.
inferred-activity in the same result set. For enterprise, the same portal scopes
to an org's internal/inner-source repos.

---

## 2. Connect GitHub — infer expertise from history **(Shipped)**

> Built: OAuth (`read:user`) → scan public repos/languages → derive a skill
> summary → fed into the recommendation; the token is discarded, only the
> derived summary is kept (httpOnly cookie, 1-day). Set `GITHUB_OAUTH_CLIENT_ID`
> / `GITHUB_OAUTH_CLIENT_SECRET` to enable the "Connect GitHub" button.

**Problem.** Today a newcomer self-describes (languages, years, interests) or
types free text. That's a guess, and beginners are the worst at estimating their
own level — the exact group Robin most needs to read accurately to redirect well.

**What it adds.** Let a contributor **connect their GitHub account** so Robin
reads their public history — languages by bytes, repos contributed to, PR/review
activity, recency, the shape of past contributions — and infers their real
expertise instead of relying on self-report. This makes the profile honest
("you say beginner, but you've merged 30 Rust PRs — let's aim higher") and the
recommendations far more precise. It's especially strong for the redirect case:
a profile grounded in actual history is much harder to over- or under-state.

**Sketch.**
- GitHub OAuth (read-only public scope) → on connect, fetch the user's repos,
  language stats, and contribution activity via the GitHub API.
- Summarize that into the same `Profile` shape Robin already uses (languages,
  approximate experience, interest areas), pre-filling the intake so the form
  becomes optional.
- Feed a short "observed history" block into the model prompt alongside the
  live repo signals, so recommendations cite *the contributor's* trajectory too.

**Considerations.** Privacy and consent are central — be explicit about what's
read, store as little as possible (ideally derive-and-discard), and offer a
disconnect/delete path. OAuth token custody stays server-side (never in the
browser extension). For enterprise, connect via the org's GitHub App so it can
also read permitted internal repos. Read-only, public scope by default.

---

## Already shipped (for context)

- Live GitHub signals feeding the model (recent merged PRs, open
  good-first-issues, latest release) — real-time demand inference.
- Honest-redirection guidance with real, clickable issue/repo links.
- Chrome extension that surfaces Robin on the GitHub page itself.
