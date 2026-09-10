# CLAUDE.md — Verdant Signal

Repository authority for the `feature/zenom-reverse-engineering` branch. Derived from the
Zenom Alpha Reverse-Engineering + Visual/UX Redesign Directive. Read this before changing code.

## 1. What this project is

A **frontend redesign of an existing, live system** — `https://www.zenomalpha.com/` — that
preserves that system's publicly observable functional contract while applying an original
visual direction.

It is **not** a generic crypto dashboard. Zenom Alpha is a read-only public telemetry window
onto one live Binance USD-M futures account, wrapped in a paywalled signal-copying funnel:
position rows stay structurally visible while actionable fields are masked behind a free
Telegram gate (first two slots) and a paid VIP gate (the rest). That is the product. Preserve it.

Reconnaissance is complete and recorded in `reference/`. **Do not re-derive it from scratch;
read it.**

| Document | Contents |
|---|---|
| `reference/SITE_INVENTORY.md` | Routes, sections, API surface, pricing, networks, assets |
| `reference/FUNCTIONAL_CONTRACT.md` | F-01…F-17 — everything a visitor can do |
| `reference/STATE_MATRIX.md` | Session axes, feed states, slot states, access states |
| `reference/DESIGN_TOKENS_ORIGINAL.md` | The reference's own tokens, for fidelity comparison |
| `reference/INTERACTION_MAP.md` | Every trigger → handler → effect, plus reference a11y gaps |
| `reference/RESPONSIVE_MAP.md` | Measured reference behavior at 6 viewports + redesign targets |
| `reference/PRESERVATION_MATRIX.md` | **The contract.** Every behavior's disposition |
| `reference/REDESIGN_DECISIONS.md` | D-01…D-15 with reasoning |
| `reference/VISUAL_QA.md` | Running defect log |
| `reference/UNKNOWNS.md` | U-01…U-13 — what the reference does not reveal, and what was chosen |

## 2. Non-negotiable constraints

### 2.1 Preservation

- Every behavior in `PRESERVATION_MATRIX.md` keeps its disposition. **Nothing disappears silently.**
- Changing behavior without authorization recorded in that file is a **defect**, not a refactor.
- Adding a feature requires a matrix row. Removing one requires explicit user authorization.

### 2.2 Data integrity — the hard line

**Never invent performance figures, verification claims, financial results, users,
transactions, prices, addresses, or backend capabilities.**

Every rendered number traces to `src/fixtures/telemetry.json` (a verbatim `/api/status`
capture) or to a reference source constant. Pricing is $9 / $19 / $39 / $99 with strike-throughs
$19 / $49 / $99 / $299 — verbatim. Payment networks are exactly the four reachable ones. Legal
text is copied verbatim and never paraphrased, shortened, or "improved".

Simulated drift for offline development may perturb only values the live feed also moves
(equity, mark price, ROE, uPnL), within observed ranges. It may never invent an instrument,
an exit, or a user.

### 2.3 Safety

- No attacking servers, no auth bypass, no exploitation.
- **No real payments. No wallet interaction.** The four mutating endpoints
  (`/api/telegram-auth`, `/api/auth-start`, `/api/auth-poll`, `/api/check-deposit-status`) have
  never been called and must not be. Use fixtures and the dev mock resolver.
- Reference capture is read-only: GET the two public endpoints, screenshot, inspect.

### 2.4 Original design

Inherit the design *grammar* of Ocarina of Time — Kokiri Forest, Temple of Time stonework,
N64 equipment hierarchy, fairy-like cyan. **Never** reproduce Nintendo artwork, logos,
Triforce graphics, characters, textures, screenshots, game UI assets, or lifted iconography.
Everything ships as original CSS geometry and inline SVG.

### 2.5 Accessibility floor

Theme never wins over usability. Required: keyboard operation of every control, visible
`:focus-visible`, real semantic elements (never `<div onclick>`), accessible tabs and dialogs
(`aria-modal`, focus trap, `Esc`, focus restore), `aria-live` for status changes, descriptive
labels on copy buttons, no color-only state encoding, ≥44px touch targets, `prefers-reduced-motion`
support, working 200% zoom. The reference's `user-scalable=no` is **removed and stays removed**.

### 2.6 Information priority

1. **Level 1 — what is happening now:** active signals, terminal connectivity, live state.
2. **Level 2 — how it performed:** equity, realized, verified exits, journal.
3. **Level 3 — how to get access:** Telegram, plans, payment, activation.

**Level 3 must never visually overpower Level 1. The terminal is the hero.**

## 3. Design system rules

### 3.1 Palette — use these tokens, never raw hex in components

`--vs-bg-deep #08110C` · `--vs-surface #101C14` · `--vs-panel #17241A` · `--vs-moss #233524`
`--vs-kokiri #3E8F47` · `--vs-emerald #59D36B` · `--vs-navi #55DDE0` · `--vs-hylian #315C8C`
`--vs-gold #D5A943` · `--vs-gold-bright #F0C85A` · `--vs-parchment #E8E1C8` · `--vs-stone #9BA796`
`--vs-danger #B93A3A` · `--vs-critical #E45A4F`

Banned: pure black, pure white, electric-purple crypto gradients, rainbow gradients, excessive
glassmorphism, generic cyberpunk, glowing borders everywhere.

### 3.2 Semantic color — colors have one job each

| Color | Only for |
|---|---|
| Navi Cyan | streaming/live, network activity, pending, telemetry, hover/focus illumination |
| Temple Gold | verification, milestones, selected premium, achievement, completed stages |
| Emerald | positive actions, confirmation, available interactions, healthy states |
| Red | danger, failure, destructive, negative performance |

Verified exits are **gold, not green**. Never use every accent at once.

### 3.3 Typography

Data/telemetry in JetBrains Mono with tabular figures. Display headings in a restrained serif,
small caps, wide tracking. Body in a humanist sans. **No novelty medieval fonts for body copy —
readability outranks theme.** Minimum size 11px; no fractional sizes.

### 3.4 Component language

Beveled/clipped corners, nested rectangular frames, engraved separators, inset panels, gold
selection brackets, layered dark-green surfaces, mild noise, deliberate depth. **Do not border
everything.** Hierarchy comes from spacing → depth → typography → scale → selective accent.
Decoration comes last.

**The decoration test:** does this make the information hierarchy clearer? If no, do not add it.

### 3.5 Motion

100–220 ms. Allowed: bracket movement, small status pulses, data-change illumination, drawer,
tab indicator, progress transitions, focus illumination. Banned: bouncing, floating cards,
perpetual shimmer, particles, animated backgrounds, parallax. Always honour
`prefers-reduced-motion`.

### 3.6 Tokens

All colors, type, spacing, radii, bevel geometry, borders, depth, shadow, glow, duration, focus
and selection treatments live in `src/styles/tokens.css`. **No arbitrary one-off values in
component CSS.**

## 4. Architecture

```
src/
  components/    shell, terminal, rail, exits, access, primitives
  hooks/         useTelemetry, useSession, useToast, useReducedMotion
  lib/           masking rules, formatters, derived stats
  types/         API contract types mirroring /api/status
  fixtures/      telemetry.json — verbatim capture, do not hand-edit
  styles/        tokens.css, base.css
reference/       documentation + screenshots (reference/ and implementation/)
scripts/         capture-reference.mjs, capture.mjs, viewports.mjs
```

**Masking rules live in exactly one place** — `src/lib/masking.ts`. The predicate is
`isVipUser || (isFreeCall && isFreeUnlocked)`, ported verbatim, including the rule that a losing
locked VIP slot shows `ACTIVE RANGE` / `SL Guarded` / `ACCUMULATION` instead of a negative
number. Never duplicate this logic into a component.

## 5. Validation commands

```bash
npm run dev          # Vite dev server, http://localhost:5173
npm run build        # tsc -b && vite build — must pass with zero errors
npm run typecheck    # tsc -b --noEmit
npm run lint         # eslint .
npm run shots        # implementation screenshots, all 6 viewports
npm run shots:ref    # re-capture the live reference (read-only)
```

Before any commit: **build, typecheck, and lint must pass.** Then capture screenshots and
compare against `reference/screens/reference/` at the same viewport.

### QA viewports — all six, every pass

`375×812` · `430×932` · `768×1024` · `1024×768` · `1440×900` · `1920×1080`

### Visual QA loop

Run → capture → inspect hierarchy, spacing, clipping/overflow, typography, data density,
interactive states, mobile transformation → fix → record in `reference/VISUAL_QA.md` as
Issue / Viewport / Expected / Observed / Fix / Status.

**The work is not finished when the page compiles.**

## 6. State completeness

Before calling a component complete, verify every state that can actually occur:
`DEFAULT HOVER FOCUS ACTIVE SELECTED DISABLED LOCKED LOADING EMPTY SUCCESS WARNING ERROR
DISCONNECTED STALE LIVE`. Not every component needs every state — but every state that can
occur needs an intentional presentation. Coverage table: `reference/STATE_MATRIX.md` §6.

## 7. Git

- Work on `feature/zenom-reverse-engineering`. **Never commit to `main`.**
- Do not open or merge a pull request until asked.
- Commit coherent working checkpoints; push to the existing upstream branch.

## 8. When something is unknown

Record it in `reference/UNKNOWNS.md`, choose the **least destructive reasonable
reconstruction**, and continue. Do not stall on ordinary implementation decisions already
covered by this file. Do not substitute design advice for working code.

## 9. Target feel

*"What if the Ocarina of Time pause/inventory interface evolved for 25 years and became a
serious quantitative workstation?"* — Kokiri Forest atmosphere + Temple of Time seriousness +
classic equipment-menu hierarchy + modern Bloomberg-grade information density.

Mysterious, old-world, slightly arcane, technologically sophisticated, readable, precise,
tactile, disciplined, original.

Not: generic Web3 purple, rainbow gradients, glassmorphism, enormous marketing heroes,
wall-to-wall cards, unnecessary glow, fantasy clutter, or direct game imitation.
