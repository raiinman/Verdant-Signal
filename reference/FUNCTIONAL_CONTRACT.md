# FUNCTIONAL CONTRACT — what the reference lets a visitor do

Everything a visitor can accomplish on `zenomalpha.com` without an account, derived from the
rendered DOM and the public inline JavaScript. Each capability carries an ID used by
`PRESERVATION_MATRIX.md`.

## What Zenom Alpha actually is

A **read-only public telemetry window onto one live Binance USD-M futures account**, wrapped in
a **paywalled signal-copying funnel**.

The account runs an automated 10× cross-margin strategy across up to 10 concurrent slots. The
site continuously publishes that account's equity, open positions, and closed-trade history.
Position rows are always structurally visible — count, ROE, PnL and status are never hidden —
but the *actionable* fields (ticker, entry, mark, TP, SL, size, margin) are masked behind two
gates:

- **Free gate** — the first two slots (`is_free_stream: true`) unmask by binding a Telegram handle.
- **VIP gate** — the remaining slots unmask by purchasing a time-boxed pass with on-chain USDC/USDT/SOL.

The product being sold is *early, actionable knowledge of a trade the operator has already
entered*. The public telemetry is the proof-of-performance that motivates the purchase. This is
the functional core; the redesign preserves it exactly.

The site's own footer states all signals are **simulated informational outputs for educational
purposes**. That framing is part of the contract and is preserved verbatim.

---

## F-01 — Observe live account telemetry

Four KPI tiles refresh every 3 s from `/api/status`.

| Tile | Source | Sub-line |
|---|---|---|
| Margin Equity | `total_usdt_balance` | "Binance Futures Net" |
| Today's 24H Yield | `net_profit_usdt` | `+{net_gain_pct}% Today` |
| Banked Realized | `wallet_usdt_balance` | "Locked Principal (+103%)" |
| Target: $100 | `goal_progress_pct` | `${bal} / ${goal}`, bar, "$x to $100 Tier" |

Last equity and banked values persist to `localStorage` and repaint instantly on next boot.

## F-02 — Observe the active signal stream

Up to `max_slots` (10) slots; 9 observed. Every slot always shows: slot identity, tier badge
(FREE COMMUNITY CALL / VIP ALPHA PASS), status badge, PNL (USDT), ROE, and the six-field grid
(Size, Margin, Entry, Mark, Target TP, Stop Loss) — masked or unmasked per gate.

**Masking rule, verbatim from source** (`isUnmasked = isVipUser || (isFreeCall && isFreeUnlocked)`):

| Field | Unmasked | Masked (free slot) | Masked (VIP slot) |
|---|---|---|---|
| Title | `{SYMBOL} Perpetual` | `FREE COMMUNITY SETUP #{n}` | `VIP QUANT ALPHA #{n}` |
| Side badge | `B` / `S` derived from `side` | Telegram glyph | Padlock glyph |
| Leverage | `Cross 10X` | `10X ALGO` | `VIP LOCKED` |
| Depth bars | shown | hidden | hidden |
| ROE / PNL | real values | **real values** | real if positive; else `ACTIVE RANGE` / `SL Guarded` |
| Size, Margin, Entry, Mark, TP, SL | real | `*** USDT` / `$*.****` | `*** USDT` / `$*.****` |
| Action | Copy Setup | Unlock Free Setup #n | Unlock VIP Setup #n |

A losing VIP slot additionally swaps its status badge to `ACCUMULATION` and suppresses the
negative number — the reference never shows a negative ROE on a locked VIP slot. This is a
deliberate presentation rule, recorded and preserved.

Size is computed client-side as `|amount × mark_price|`; margin as `size / 10`.

## F-03 — Switch between Live Trades and Audited Exits

Two mutually exclusive tabs over the same region. `Audited Exits (Proof)` renders
`audited_exits` with a computed header: win rate = wins/total, net yield = Σ `pnl_usd`.
Observed: `WIN RATE: 83.3%`, `NET YIELD: +$15.46 USDT`. Losing rows render as
`CAPITAL GUARDED [✓]`, keeping the negative value visible.

## F-04 — Review the last two closed community calls

A dedicated strip above the stream showing the two most recent `recent_closed_calls`: realized
PnL, realized ROE, exit outcome, execution time, audit verification. Always unmasked.

## F-05 — Copy an unlocked signal to clipboard

Unmasked cards expose **Copy Setup**, writing a formatted block (pair, entry, TP target, stop
loss, status) via `navigator.clipboard`, confirmed by a toast.

## F-06 — Bind a Telegram handle (three paths)

1. **One-tap bot** — mints `tg_<random>`, opens `t.me/ZenomAlphaBot?start=<token>`, polls
   `/api/auth-poll` every 2 s up to a cap.
2. **Official widget** — injects `telegram-widget.js`, posts the payload to `/api/telegram-auth`.
3. **Manual handle** — free-text `@handle`, normalised to prefix `@`, id derived from a local
   `hashCode`, posted to `/api/telegram-auth`.

Success sets `isFreeUnlocked`, persists `ag_tg_user` + `ag_free_unlocked`, unmasks the two free
slots, and swaps the masthead into a connected badge.

## F-07 — Join the free Telegram group

Direct link to `t.me/+gVBFLwyprvk2NGRk` from the lead banner and the free-unlock modal.

## F-08 — Disconnect / log out

Clears the four `ag_*` keys, resets `isVipUser`, `isFreeUnlocked`, `telegramHandle`, and
re-masks every slot.

## F-09 — Select an access tier

Four options; selection is exclusive and mirrored between the inline card and the modal via
paired element IDs. Selecting updates `selectedTier` and `selectedTierPrice`, and rewrites the
deposit amount (`Send $39 USDC`) and confirm-button label.

## F-10 — Select a payment network

Four chips. Selecting rewrites label, address, fee notice, required amount, and QR image in
both the inline card and the modal simultaneously. Default `USDC_BASE`.

## F-11 — Copy the deposit address

`navigator.clipboard.writeText(address)`; the button label swaps to "Copied!" for 1500 ms and a
toast fires.

## F-12 — Trigger deposit detection and receive VIP

Guarded: requires a bound handle, else it warns, opens the Telegram modal, and aborts. Once
bound it POSTs `{telegram_id, username, plan, tx_hash}` to `/api/check-deposit-status`, then
polls every 4 s. Three response branches:

| Branch | Effect |
|---|---|
| `pending` | "⏳ Incoming Deposit Detected on Binance!" + confirming sub-message |
| `success && is_vip` | Stops poll, sets `isVipUser`, persists token+handle, hides listener, reveals success card (plan, handle, expiry, invite link), re-renders every slot unmasked, toast |
| neither | "Monitoring Binance Vault for your deposit..." bound-handle sub-message |

An optional transaction-hash field is sent when filled.

## F-13 — Enter VIP purchase via modal

`Unlock VIP Setup #n` on any locked card opens a modal containing the *entire* four-step flow —
a second, complete copy of the inline card. Both are kept in sync by ID pairing.

## F-14 — Read legal documents

Three overlays: Risk Disclaimer & Liability Waiver, Privacy Policy, Terms of Execution.
Dismissed by close button or backdrop click.

## F-15 — Observe live visitor count

`/api/visitor-stats` every 15 s drives `N TRADERS ONLINE` in the masthead and footer badge.

## F-16 — Observe slot occupancy

`{active_positions_count} SLOTS ACTIVE` pill, refreshed on every telemetry poll.

## F-17 — Receive transient feedback

A single shared toast element, auto-dismissed after 2600 ms, used for copy confirmations,
validation warnings, and the VIP-granted celebration.

---

## Explicitly out of scope

Not present in the reference and therefore not built: user accounts or passwords, in-browser
wallet connection, order placement or any exchange write action, historical charting, search or
filtering of signals, pagination, notification preferences, internationalisation, dark/light
theme switching (dark only), and any second route.
