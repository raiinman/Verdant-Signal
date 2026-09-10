# PRESERVATION MATRIX

Every publicly observable behavior in the reference, mapped to its place in the redesign.
Dispositions: `PRESERVE` · `REORGANIZE` · `RESTYLE` · `REPLACE PRESENTATION ONLY` · `UNKNOWN`.

**Rule: nothing disappears silently.** Any row whose *Behavior changed?* is YES without explicit
authorization is a defect. At the time of writing, no row changes behavior without authorization
from the directive itself.

Status legend for the vertical slice: **✅ built** · **◻ planned** (documented, not yet in code).

---

## F-01 — Live account telemetry · `REORGANIZE` + `RESTYLE` · ✅ built

- **Existing behavior:** Four KPI tiles in a full-width strip below the masthead, refreshing every 3 s.
- **Existing data:** `total_usdt_balance`, `net_profit_usdt`, `net_gain_pct`, `wallet_usdt_balance`, `goal_progress_pct`, `target_goal_usdt`.
- **Existing states:** LOADING (stale localStorage paint), LIVE.
- **Existing interaction:** None; display only.
- **New location:** Right-side status rail (desktop 30%); horizontally scrollable strip on mobile.
- **New presentation:** Equipment/status tiles with inset panels and engraved separators. Margin Equity is the dominant tile. Roadmap `$100 → $200 → $1K` progression indicator replaces the bare percentage bar, driven by the same `goal_progress_pct`.
- **Behavior changed?** NO — same fields, same source, same cadence.
- **Reason:** Directive §3 assigns telemetry to the right rail; §"INFORMATION PRIORITY" makes performance Level 2, subordinate to the terminal.

## F-02 — Active signal stream and masking · `PRESERVE` + `REPLACE PRESENTATION ONLY` · ✅ built

- **Existing behavior:** Up to 10 slots; every slot structurally visible; six data fields masked per gate; ROE/PNL real for free slots and for winning VIP slots; losing VIP slots show `ACTIVE RANGE` / `SL Guarded` / `ACCUMULATION`.
- **Existing data:** All 16 `positions[]` fields.
- **Existing states:** LOCKED_FREE, LOCKED_VIP_WINNING, LOCKED_VIP_LOSING, UNLOCKED_ACTIVE, UNLOCKED_LOCKED_PROFIT, EXIT_WARNING (code-only).
- **Existing interaction:** Per-card unlock or copy button. Rows are **not** selectable.
- **New location:** Left terminal, the hero of the page.
- **New presentation:** Eight-column table on desktop (`PAIR · SIDE · ENTRY · MARK · TP · SL · ROE · STATUS`), rows reading as selectable inventory objects; compact summary cards on mobile. Masked cells render as `▓▓▓▓` glyph blocks with a lock affordance in the row, **not** as a giant lock overlay.
- **Behavior changed?** NO — the masking predicate is ported verbatim: `isVipUser || (isFreeCall && isFreeUnlocked)`, including the losing-VIP-slot suppression rule.
- **Reason:** This is the functional core. Directive mandates the table and forbids replacing the interface with lock symbols.

## F-03 — Live Trades / Audited Exits tabs · `REORGANIZE` · ◻ planned

- **Existing behavior:** Two exclusive tabs swapping one region; proof view computes win rate and net yield client-side.
- **Existing data:** `audited_exits[]`; derived `WIN RATE: 83.3%`, `NET YIELD: +$15.46 USDT`.
- **Existing states:** ACTIVE tab, PROOF tab.
- **Existing interaction:** Click. Not keyboard-operable.
- **New location:** Performance/Journal workspace under the `PERFORMANCE` nav item, tabs `PERFORMANCE · CLOSED TRADES · SYSTEM ACTIVITY · METHODOLOGY`.
- **New presentation:** Proper `role="tablist"` with arrow-key roving and visible focus.
- **Behavior changed?** NO to data and computation; YES to *location* — historical data leaves the live terminal.
- **Reason:** Directive §5 explicitly requires historical information to get its own workspace and forbids mixing it into the live terminal. Authorized.

## F-04 — Last two closed community calls · `REORGANIZE` + `RESTYLE` · ✅ built

- **Existing behavior:** Strip of two most recent closed calls above the stream; always unmasked.
- **Existing data:** `recent_closed_calls[]` — realized PnL, ROE, exit outcome, execution time, audit verification.
- **Existing states:** WIN, LOSS (capital guarded).
- **Existing interaction:** None.
- **New location:** `RECENT VERIFIED EXITS` strip directly below the primary terminal.
- **New presentation:** 2–5 horizontal entries on desktop from `audited_exits`, Temple Gold verification emphasis (not fluorescent green), plus `VIEW ALL VERIFIED EXITS →`.
- **Behavior changed?** NO.
- **Reason:** Directive §4.

## F-05 — Copy an unlocked signal · `PRESERVE` · ✅ built

- **Existing behavior / data / states / interaction:** `Copy Setup` on unmasked cards writes a formatted block; toast confirms.
- **New location:** Row action in the terminal and in the signal detail pane.
- **New presentation:** Tactile button with pressed state; `aria-label`; `aria-live` confirmation.
- **Behavior changed?** NO — identical clipboard payload format.

## F-06 — Telegram binding, three paths · `PRESERVE` · ◻ planned (stage 02)

- **Existing behavior:** One-tap bot token + 2 s poll; official widget; manual `@handle`.
- **Existing data:** handle, telegram id, `ag_tg_user`, `ag_free_unlocked`.
- **Existing states:** DISCONNECTED, AWAITING_TAP, POLLING, TIMEOUT, CONNECTED, VALIDATION_ERROR.
- **Existing interaction:** Modal with three affordances.
- **New location:** Access flow stage `02 TELEGRAM`; also reachable from the top bar.
- **New presentation:** Stage panel; connection state mirrored in the top bar as `● CONNECTED @username`.
- **Behavior changed?** NO — all three paths retained, same endpoints, same persistence keys.

## F-07 — Join free Telegram group · `PRESERVE` · ✅ built

- Link to `t.me/+gVBFLwyprvk2NGRk`, new tab. Present in the command deck and access stage 02.
- **Behavior changed?** NO.

## F-08 — Disconnect / log out · `PRESERVE` · ◻ planned

- Clears `ag_tg_user`, `ag_free_unlocked`, `ag_vip_token`, `ag_vip_handle`; re-masks all slots; confirm prompt retained.
- **New location:** Top-bar connection badge menu.
- **Behavior changed?** NO.

## F-09 — Select an access tier · `PRESERVE` + `RESTYLE` · ◻ planned (stage 01)

- **Existing data:** Exact reference pricing — $9 / $19 / $39 / $99, strike-throughs $19/$49/$99/$299, ribbons, default `1_MONTH`.
- **New presentation:** Four-corner gold bracket selection, original geometry. Monthly plan visually dominant.
- **Behavior changed?** NO — values preserved verbatim; directive's example pricing matches the reference exactly.

## F-10 — Select a payment network · `PRESERVE` + `RESTYLE` · ◻ planned (stage 03)

- **Existing data:** Exactly four reachable networks — `USDC_BASE` (default), `USDT_BSC`, `USDC_SOL`, `SOL`, with verbatim addresses, labels and fee copy.
- **New presentation:** Substantial equipment-slot chips; only the selected network's deposit block renders.
- **Behavior changed?** NO. No network is invented; `BTC` and `USDT_TRON` remain unreachable exactly as in the reference (see U-04).

## F-11 — Copy deposit address · `PRESERVE` · ◻ planned (stage 03)

- Clipboard write; label → "Copied!" for 1500 ms; toast. Adds descriptive `aria-label` and a live region.
- **Behavior changed?** NO.

## F-12 — Deposit detection and VIP grant · `PRESERVE` + `REORGANIZE` · ◻ planned (stage 04)

- **Existing behavior:** Handle guard → POST `/api/check-deposit-status` → 4 s poll → three branches (`pending`, `success && is_vip`, fallthrough) → on grant: persist token, unmask everything, success card with plan/handle/expiry/invite link.
- **New presentation:** Explicit `WAITING → DETECTED → CONFIRMING → ACCESS GRANTED` progression; cyan pending, gold granted, restrained red on failure.
- **Behavior changed?** NO to the transitions and endpoint. YES, additively: an **ERROR** state is added where the reference silently swallowed failures.
- **Reason:** Directive mandates the four-state progression and an intentional presentation for every state that can occur. Silent failure is a defect, not a contract.

## F-13 — VIP purchase modal · `REORGANIZE` · ◻ planned

- **Existing behavior:** A full duplicate of the inline access card, ID-paired for synchronisation.
- **New location:** One access surface — right-side drawer on desktop, `/access` full-screen on mobile.
- **New presentation:** Single source of truth; the duplication and the paired-ID sync layer are removed.
- **Behavior changed?** NO to user-facing capability — every control survives, reachable from the same triggers. YES to internal structure.
- **Reason:** Directive forbids rendering all stages simultaneously beneath the terminal and requires a drawer or `/access`. Authorized.

## F-14 — Legal overlays · `PRESERVE` · ◻ planned

- Risk Disclaimer, Privacy Policy, Terms of Execution; verbatim text, including the
  "strictly simulated informational outputs for educational purposes" disclosure.
- **New presentation:** Accessible dialogs — `role="dialog"`, `aria-modal`, focus trap, `Esc`, focus restore.
- **Behavior changed?** NO to content. Legal text is never edited, shortened, or paraphrased.

## F-15 — Live visitor count · `PRESERVE` · ✅ built

- `/api/visitor-stats` every 15 s → `N TRADERS ONLINE`. Now in the command deck.
- **Behavior changed?** NO.

## F-16 — Slot occupancy · `PRESERVE` · ✅ built

- `{active_positions_count} SLOTS ACTIVE`, rendered as `10 SIGNAL SLOTS` / `9 ACTIVE` in the command deck.
- **Behavior changed?** NO.

## F-17 — Toast feedback · `PRESERVE` + `RESTYLE` · ✅ built

- Single shared transient message, 2600 ms. Now an `aria-live="polite"` region.
- **Behavior changed?** NO.

---

## Behaviors deliberately NOT preserved

Each is an accessibility or robustness defect in the reference. Fixing them is mandated by the
directive's ACCESSIBILITY and STATE COMPLETENESS sections.

| Reference behavior | Disposition | Reason |
|---|---|---|
| `user-scalable=no, maximum-scale=1` | **Removed** | WCAG 1.4.4 failure; directive requires sensible 200% zoom |
| `catch (e) {}` swallowing all telemetry and deposit errors | **Replaced** with explicit ERROR / UNAVAILABLE states | Directive: every state that can occur needs intentional presentation |
| `<div onclick>` for tier and network selection | **Replaced** with real semantic controls | Directive: proper semantic controls, keyboard navigation |
| Modals without role, focus trap, or `Esc` | **Replaced** with accessible dialogs | Directive: accessible dialogs/drawers, logical focus movement |
| No `:focus-visible` styling anywhere | **Added** | Directive: visible focus indication |
| `pulse-ring` animating unconditionally | **Guarded** by `prefers-reduced-motion` | Directive: respect reduced motion |
| Intervals never cleared | **Scoped** to hooks with cleanup | Correctness |
| Undeclared `var(--purple)` | **Dropped** | Reference bug (U-05); VIP is Temple Gold in the redesign |

## Data integrity commitment

Every number, ticker, price, percentage, address, and legal sentence rendered by the redesign
comes from `src/fixtures/telemetry.json` (a verbatim `/api/status` capture) or from the
reference's own source constants. **No performance figure, verification claim, transaction,
user count, or backend capability is invented.**
