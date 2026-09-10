# SITE INVENTORY — Zenom Alpha (reference system)

Captured: 2026-09-10, from `https://www.zenomalpha.com/` (resolves to `https://zenomalpha.com`).
Method: rendered DOM, computed CSS, public inline JavaScript, public read-only JSON endpoints,
Playwright screenshots at the six mandated QA viewports.

## 1. Delivery and technology

| Property | Observed value |
|---|---|
| Document | Single HTML document, 156,836 bytes, 3,935 lines |
| Framework | **None.** Hand-written vanilla HTML + CSS + JS |
| CSS | One inline `<style>` block, lines 19–1854 (1,836 lines) |
| JS | One inline `<script>` block, lines 2668–3933 (1,266 lines) |
| Routing | **None.** Exactly one route: `/`. No history API, no hash routes, no internal links |
| Server | Cloudflare; `Cache-Control: no-store, no-cache, must-revalidate` |
| Analytics | Google Tag Manager `G-6QDBND4Q16`; Cloudflare Insights beacon |
| Fonts | Google Fonts: Plus Jakarta Sans (400–800), Space Grotesk (600–800), JetBrains Mono (400–800) |
| Viewport meta | `width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover` |
| Icons | Inline SVG only. No icon font, no sprite sheet, no raster assets except a remote QR generator |

## 2. Routes

There is one route. Everything is a section of one continuously scrolling page, plus six
`display:none` overlays toggled in place.

| Route | Status |
|---|---|
| `/` | The entire application |

## 3. Page sections, in document order

| # | Section | DOM anchor | Purpose |
|---|---|---|---|
| 1 | Masthead card | header block | Brand, tagline, Connect Telegram, slot/visitor pills |
| 2 | Telemetry stat row | `#val-equity`, `#val-24h-profit`, `#val-banked`, `#val-goal-*` | Four KPI tiles |
| 3 | Free-group lead banner | `#free-signals-lead-box` | Telegram funnel |
| 4 | Last 2 closed community calls | `#closed-calls-list` | Two most recent verified exits |
| 5 | Active signal stream | `#signals-container` | Up to 10 signal slots (9 observed) |
| 5b | Audited exits (proof) | `#proof-container` | Tab-alternate to section 5 |
| 6 | Institutional VIP activation | `#vip-upgrade-card` | 4-step purchase flow, inline in the right column |
| 7 | Footer | `.site-footer` | Legal links, live badge, risk disclaimer |

Overlays (`display:none` until invoked): `#telegram-free-modal`, `#vip-upgrade-modal`,
`#risk-disclaimer-modal`, `#privacy-modal`, `#terms-modal`, `#toast-msg`.

**There is no persistent top navigation bar.** The masthead is a static card that scrolls away.
The redesign introduces one; see `REDESIGN_DECISIONS.md` D-01.

## 4. Public API surface

| Endpoint | Method | Purpose | Polled |
|---|---|---|---|
| `/api/status` | GET | Full telemetry: balances, positions, closed calls, audited exits | every 3000 ms |
| `/api/visitor-stats` | GET | `live_online`, `total_views`, `unique_visitors`, `mobile_count`, `desktop_count` | every 15000 ms |
| `/api/telegram-auth` | POST | Binds a Telegram handle/id to the session | on demand |
| `/api/auth-start?token=` | GET | Begins one-tap bot auth | on demand |
| `/api/auth-poll?token=` | GET | Polls for one-tap completion | every 2 s while pending |
| `/api/check-deposit-status` | POST | Deposit detection and VIP grant | every 4000 ms while listening |

`/api/status` and `/api/visitor-stats` were read (GET, unauthenticated, public). The four
mutating/auth endpoints were **not** exercised — no payment, no wallet interaction, and no auth
was submitted. Their contracts below are read from the client source, not from live calls.

### `/api/status` response shape (observed)

```
updated_utc: string             total_usdt_balance: number
wallet_usdt_balance: number     total_unrealized_profit: number
available_usdt_balance: number  net_profit_usdt: number
net_gain_pct: number            target_goal_usdt: number
goal_progress_pct: number       active_positions_count: number
max_slots: number               target_margin_per_slot: number
recent_closed_calls: [...]      audited_exits: [...]      positions: [...]
```

`positions[]` — `symbol, side, amount, entry_price, mark_price, upnl_usd, roe_pct, leverage,
stop_loss_px, take_profit_px, profit_locked, signal_status, status_tag, signal_copy,
is_free_stream, free_slot`

`audited_exits[]` — `sym, clean_symbol, is_win, exitType, pnl_usd, roe, date, entry, exit`

`recent_closed_calls[]` — `symbol, clean_symbol, realized_pnl, exit_type, closed_time, is_win,
roe_pct, entry_price, exit_price`

A verbatim capture is committed at `src/fixtures/telemetry.json` and is the only data the
redesign renders. No figure in the redesign is invented.

### Observed values at capture time

`total_usdt_balance 93.07` · `wallet_usdt_balance 87.84` · `total_unrealized_profit 5.23`
`net_profit_usdt 60.52` · `net_gain_pct 185.9` · `target_goal_usdt 100.0` · `goal_progress_pct 93.1`
`active_positions_count 9` · `max_slots 10` · `target_margin_per_slot 6.0`

9 positions, 6 audited exits, 2 recent closed calls. All 9 positions are `ALGO_10X` at leverage
10. `signal_status` is `ACTIVE` (7) or `LOCKED_PROFIT` (2). `is_free_stream` is true for exactly
the first two, with `free_slot` 1 and 2.

Live equity drifted 92.33 → 93.19 across roughly four minutes of observation, confirming the
3-second poll mutates displayed values continuously.

## 5. Visible data inventory

**Telemetry tiles** — Margin Equity (`REAL-TIME`, sub "Binance Futures Net"); Today's 24H Yield
(`TODAY`, sub "+N% Today"); Banked Realized (`SECURE`, sub "Locked Principal (+103%)"); Target
$100 (percentage, `$x / $100` bar, "$x to $100 Tier").

**Masthead pills** — `9 SLOTS ACTIVE` (from `active_positions_count`), `22 TRADERS ONLINE`
(from `visitor-stats.live_online`; observed drifting 19–24 between polls).

**Signal card fields** — PNL (USDT), ROE, Size (USDT), Margin (USDT), Entry Price, Mark Price,
Target TP (+80%), Stop Loss, tier badge, status badge, action button.

**Audited exits adds** — Entry Price, Exit Price, Exit Outcome, Execution Time, Audit
Verification, Net Realized, plus a computed header reading `WIN RATE: 83.3%` and
`NET YIELD: +$15.46 USDT`. Both are derived client-side from `audited_exits`, not served.

## 6. Pricing (verbatim from reference — preserved exactly)

| Tier | Key | Was | Now | Unit | Sub-label | Ribbon |
|---|---|---|---|---|---|---|
| 1-Day Trial | `1_DAY` | $19 | **$9** | / 24h | 24h Instant Pass | Save 52% |
| 1-Week VIP | `1_WEEK` | $49 | **$19** | / 7 days | 7 Days · $2.70/d | Save 61% |
| 1-Month VIP | `1_MONTH` | $99 | **$39** | / 30 days | 30 Days · $1.30/day | BEST VALUE · 60% OFF |
| Lifetime Pass | `LIFETIME` | $299 | **$99** | / one-time | Permanent · Rate locks | WHALE PASS · SAVE $200 |

Default selection is `1_MONTH` at $39. Banner text: "⚡ EARLY-BIRD BETA PRICING — Save up to
67% · Rate locked upon activation".

The directive's example pricing ($9 / $19 / $39 / $99) matches the reference exactly, so no
conflict arises.

## 7. Payment networks (verbatim — preserved exactly)

| Key | Coin | Network | Address | Fee copy |
|---|---|---|---|---|
| `USDC_BASE` *(default)* | USDC | Base Network (ERC-20) | `0xcd96689d383664398579a121b7870f5cd7a28c9c` | Gas fee: < $0.01 · Direct to Binance & sweeps to Futures |
| `USDT_BSC` | USDT | BNB Smart Chain (BEP-20) | `0xcd96689d383664398579a121b7870f5cd7a28c9c` | Gas fee: ~$0.05 · Direct to Binance |
| `USDC_SOL` | USDC | Solana SPL | `6u4U9Vev5jUv5tQ1rS58Uq7h91EcvCskF6KjXwJ8kC8e` | Gas fee: < $0.005 · Direct to Binance |
| `SOL` | SOL | Solana Native | `6u4U9Vev5jUv5tQ1rS58Uq7h91EcvCskF6KjXwJ8kC8e` | Gas fee: < $0.005 · Direct to Binance |

`ASSET_REGISTRY` also defines `BTC` and `USDT_TRON`, but **no UI chip renders them** — they are
unreachable in the reference interface. See `UNKNOWNS.md` U-04. Deposit QR codes are generated
remotely by `api.qrserver.com/v1/create-qr-code`.

## 8. External destinations

| Target | Purpose |
|---|---|
| `t.me/+gVBFLwyprvk2NGRk` | Free prediction group invite |
| `t.me/ZenomAlphaBot?start=<token>` | One-tap auth bot |
| `telegram.org/js/telegram-widget.js?22` | Official Telegram login widget |
| `basescan.org`, `bscscan.com`, `solscan.io`, `blockchain.com`, `tronscan.org` | Address explorers |
| `api.qrserver.com` | Deposit QR image |

## 9. Client-side persistence

`localStorage` keys: `ag_tg_user`, `ag_free_unlocked`, `ag_vip_token`, `ag_vip_handle`,
`za_last_equity`, `za_last_banked`. The last two paint stale KPI values instantly on boot,
before the first poll returns — an intentional perceived-performance trick that the redesign
preserves as an explicit `STALE` state.

## 10. Legal and disclosure

Footer links open three overlays: Risk Disclaimer & Liability Waiver, Privacy Policy, Terms of
Execution. A permanent footer block states the signals are **"strictly simulated informational
outputs for educational purposes"** and disclaims all liability. This text is load-bearing and
is preserved verbatim in the redesign.
