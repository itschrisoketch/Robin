# DESIGN.md — Robin

## Aesthetic direction
**The Field Guide.** Warm editorial paper, wayfinding signage, naturalist's-journal restraint. Light theme. Generous margins, hairline rules, asymmetric masthead.

## Color (OKLCH, warm-tinted neutrals — never pure #000/#fff)
- `--paper`        oklch(0.972 0.012 75)  — warm cream background
- `--paper-raised` oklch(0.988 0.010 80)  — slightly lifted surface
- `--ink`          oklch(0.245 0.018 55)  — warm near-black text
- `--ink-soft`     oklch(0.46 0.014 55)   — secondary text
- `--ink-faint`    oklch(0.62 0.012 60)   — captions / metadata
- `--hairline`     oklch(0.88 0.014 70)   — borders / rules
- `--robin`        oklch(0.585 0.165 33)  — signature terracotta accent (the bird's breast)
- `--robin-deep`   oklch(0.48 0.15 32)    — accent text on light
- `--honey`        oklch(0.80 0.105 80)   — redirection signpost tone
- `--honey-surface`oklch(0.945 0.045 82)  — redirection block background
- `--honey-deep`   oklch(0.50 0.09 70)    — redirection text/icon

Strategy: Restrained-warm. Tinted paper + ink, one accent (robin) ≤10% of surface. Honey is a second role reserved exclusively for the redirection state, so the color itself signals "this is a redirect."

## Typography
- **Display / Robin's voice:** Fraunces (variable, opsz high, soft optical serif). Robin's messages render in Fraunces — reads like a handwritten note from a mentor.
- **UI + contributor voice:** Hanken Grotesk. Labels, buttons, persona passes, contributor messages.
- **Technical metadata:** JetBrains Mono. Repo names, issue labels, difficulty, the dogfood PR chain.
- Scale ratio ≥1.25. Body line length capped ~68ch.

## Components
- **Masthead (left rail):** Robin wordmark in Fraunces, a one-line creed, the two persona "trail passes," and a footnote listing what Robin reads (issues, merged PRs, docs).
- **Chat thread:** Robin = full-width serif passage, no bubble, a small robin-dot speaker mark. Contributor = right-aligned grotesque, subtle raised paper, mono profile chips.
- **Recommendation card:** numbered (01/02/03), area + why-now + read-first + fit. Robin accent on the rank number; full hairline border (NO side-stripe).
- **Redirection block (signature):** honey-surface panel, ↳ trail-marker glyph, header "Not here. Not yet.", three wayfinding cards for smaller projects. Warm, intentional, not an error.
- **Composer:** single input, mono placeholder, robin send affordance.

## Motion
- One orchestrated load: masthead + creed stagger in.
- Robin's replies stream in word-group reveals (mentor "writing" feel), ease-out-expo. Never animate layout props.
- Persona pass hover: subtle paper lift + accent edge.

## Bans honored
No side-stripe borders, no gradient text, no glassmorphism, no hero-metric template, no identical card grids, no em dashes in copy.
