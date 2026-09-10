# REDESIGN DECISIONS

Architectural and visual decisions for Verdant Signal, with the reasoning that produced them.
Each decision is traceable to the directive or to an observed reference constraint.

---

## D-01 — Stack: Vite + React 18 + TypeScript, plain CSS with custom-property tokens

**Chosen after reconnaissance, not before.** The reference is a single hand-written HTML
document with no framework. What the observed system actually requires:

| Observed requirement | Implication |
|---|---|
| One route, no SSR, no SEO surface, `no-store` caching | A static SPA is sufficient. Next.js would add SSR machinery for zero benefit |
| Three orthogonal session axes × 6 slot states × 4 deposit states | A component model with typed state beats 1,266 lines of imperative DOM mutation |
| A 16-field position record with masking rules per field | TypeScript encodes the API contract so a masking rule cannot silently leak a field |
| Four concurrent polling timers | Hooks with cleanup; the reference leaks all four for the page lifetime |
| Bespoke bevel/clip/bracket geometry, centralized tokens | Plain CSS with custom properties. Tailwind's utility model actively fights a token-first brief and scatters values into markup, which the directive forbids |

**React over Svelte/Vue:** no technical necessity, but the state machine is the whole app and
React's model is the most widely legible for a codebase meant to be handed on. **Vite over
CRA/webpack:** current, fast, first-class TS. **npm:** the only package manager installed.

Rejected: Next.js (SSR unused), Tailwind (conflicts with the token mandate), CSS-in-JS (runtime
cost for a telemetry surface repainting every 3 s), component libraries (nothing in MUI or
shadcn looks like carved equipment panels; every component here is bespoke).

## D-02 — Persistent top bar (new)

The reference has **no** persistent navigation — the masthead scrolls away and 3,189 px of
desktop content has no way back. The directive mandates a slim persistent bar:
`ZENOM ALPHA` left, `TERMINAL | EXITS | PERFORMANCE | ACCESS` centre, Telegram state and
`GET VIP` right. Framed as the upper edge of an equipment interface — a hairline gold rule and
clipped corners — not a SaaS navbar.

## D-03 — Command deck replaces the marketing masthead

The reference opens with a large brand card plus a paragraph of group-marketing copy, consuming
most of the first viewport. The directive forbids spending the opening viewport on marketing.
Replaced with a compact operational header: wordmark, `SYSTEMATIC PREDICTION TERMINAL`, and
live indicators `● STREAM LIVE` / `BINANCE USD-M` / `N SIGNAL SLOTS` / `LAST SYNC Ns`.

The free-group copy is **not deleted** — it moves into access stage 02 and a compact deck
action, preserving F-07.

## D-04 — 70 / 30 split

Reference measures 57.5 / 42.5 (`1.15fr 0.85fr` above 900px) — the sales card claims nearly as
much space as the product. The directive mandates ~70 / 30 and states the terminal is the hero.
Adopted: `--layout-terminal: 70fr` / `--layout-rail: 30fr` at ≥1024px.

## D-05 — Cards become a table

The reference renders every signal as a large stacked card, ~180 px tall, so nine signals
require ~1,600 px of scroll. The directive mandates the eight-column table
(`PAIR · SIDE · ENTRY · MARK · TP · SL · ROE · STATUS`) with rows behaving as selectable
inventory objects. Nine slots now fit one screen — Bloomberg density, equipment-menu grammar.

Below 1024px the table becomes summary cards, because shipping an eight-column table to a phone
is explicitly forbidden.

## D-06 — Masking shows structure, hides values

Directive: *"Locked positions remain structurally visible. Obscure only protected information.
Do not replace the interface with huge lock symbols."* This matches the reference's own
zero-leakage comment. Masked cells render as `▓▓▓▓` glyph blocks in muted stone; the row keeps
its geometry, ROE, status and slot identity. One small lock glyph sits in the row's side cell —
never an overlay.

## D-07 — Silent failure becomes an explicit state

The reference wraps every fetch in `catch (e) {}`. A dead API leaves stale numbers on screen
labelled `REAL-TIME` forever. Treated as a defect: the redesign adds `UNAVAILABLE` and `STALE`
states with honest labelling and a retry. Recorded in `PRESERVATION_MATRIX.md` as an
authorized, additive change.

## D-08 — Access flow: drawer on desktop, `/access` on mobile

The reference renders all four purchase stages simultaneously, inline, beneath the terminal —
**and again** in a modal, as a full duplicate kept in sync by paired element IDs. The directive
forbids simultaneous stages and offers drawer or route.

Chosen: **drawer on desktop** (preserves terminal context, so live signals stay visible while
buying), **full-screen `/access` on mobile** (a 480px drawer on a 375px phone is not a drawer).
Both mount the same stage machine, eliminating the duplication.

## D-09 — Four-corner bracket selection

Selection is expressed by four gold corner brackets that translate into place over 160 ms —
original geometry evoking console inventory selection without copying any Nintendo asset. Used
for tier options, network slots, and the selected signal row. Chosen over a border because a
border reads as a generic neon outline, which the directive bans.

## D-10 — Semantic color discipline

| Color | Reserved for | Never used for |
|---|---|---|
| Navi Cyan `#55DDE0` | Live/streaming, pending, telemetry activity, hover/focus | Success, verification |
| Temple Gold `#D5A943` / `#F0C85A` | Verification, milestones, selection, completed stages | Ordinary actions |
| Rupee Emerald `#59D36B` | Positive actions, confirmation, available, healthy | Verification badges |
| Heart Red `#B93A3A` / `#E45A4F` | Danger, failure, destructive, negative performance | Emphasis |

Verified exits use **gold, not green** — the directive is explicit that verification is a
milestone, not a positive action. This is the sharpest departure from the reference, which
floods everything in `#00E599`.

## D-11 — Typography

- **Data / telemetry:** JetBrains Mono, retained from the reference. Tabular figures so digits do not jitter on a 3 s repaint.
- **Display:** a restrained serif in small caps with wide tracking for `ALPHA TERMINAL`, `VERIFIED EXITS`, `SIGNAL ARCHIVE`, `SYSTEM ACTIVITY`. System serif stack — no novelty face, no web-font payload.
- **Body / UI:** a humanist sans.

Type scale is 9 fixed steps, minimum 11px. The reference's 8px and 8.5px labels and its
half-pixel sizes are dropped as unreadable.

## D-12 — Material without texture

Depth comes from layered surfaces (`#08110C` → `#101C14` → `#17241A` → `#233524`), 1px
engraved separators (dark line + light line), inset shadows, and a single ~2% noise overlay on
the page ground only. No tiled textures, no image assets. Directive: suggest material through
color, depth, geometry and subtle noise — do not plaster textures.

## D-13 — Motion budget

All transitions 100–220 ms. Allowed: bracket translation (160 ms), data-change illumination
(220 ms fade), drawer (200 ms), tab indicator (160 ms), status-dot pulse (2 s, low amplitude),
stage transitions (180 ms). Everything is wrapped in a `prefers-reduced-motion` guard that
reduces duration to 0.01 ms and disables the pulse. No shimmer, parallax, float, or particles.

## D-14 — Fixture-driven data

`src/fixtures/telemetry.json` is a verbatim `/api/status` capture. The app reads live
`/api/status` when `VITE_API_BASE` is configured, and otherwise serves the fixture through the
same typed adapter, with simulated drift on equity/mark/ROE so live-state presentation is
exercisable offline. Drift perturbs only values the real feed also moves, within the range
observed live (equity moved 92.33 → 93.19 in four minutes). **No new instruments, tickers,
exits, or users are generated.**

## D-15 — Accessibility floor

Not negotiable against theme. Real semantic controls (`button`, `role="radiogroup"`,
`role="tablist"`); visible `:focus-visible` on every interactive element; dialogs with
`aria-modal`, focus trap, `Esc`, focus restore; `aria-live` for toast, deposit progression and
feed health; ≥44px touch targets; no color-only state encoding; zoom unblocked (the reference's
`user-scalable=no` is removed); body text ≥ 4.5:1, large/secondary ≥ 3:1 against its own
surface.
