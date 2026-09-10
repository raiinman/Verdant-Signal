# INTERACTION MAP

Every publicly reachable interaction in the reference: trigger, handler, effect, and the
redesign's disposition. Handler names are the reference's own function names.

## 1. Masthead

| Trigger | Handler | Effect | Redesign |
|---|---|---|---|
| `Connect Telegram` | `openTelegramFreeModal()` | Opens free-unlock modal, focuses handle input | Top bar, opens same dialog |
| Handle badge click (connected) | `promptTgLogout()` | Confirm → clears 4 `ag_*` keys, re-masks all | Preserved, in top bar |
| `N SLOTS ACTIVE` pill | — | Display only | Moves to command deck |
| `N TRADERS ONLINE` pill | — | Display only | Moves to command deck |

## 2. Lead banner

| Trigger | Handler | Effect | Redesign |
|---|---|---|---|
| `Join Free Group →` | anchor | Opens `t.me/+gVBFLwyprvk2NGRk` in new tab | Preserved |
| `Unlock Free Calls` | `handleFreeBannerAction()` | Opens free modal, or scrolls to VIP if already unlocked | Preserved |

## 3. Signal stream

| Trigger | Handler | Effect | Redesign |
|---|---|---|---|
| `Live Trades` tab | `switchTab('ACTIVE')` | Shows `#signals-container`, hides `#proof-container` | Preserved; keyboard-operable roving tablist |
| `Audited Exits (Proof)` tab | `switchTab('PROOF')` | Inverse; renders proof cards + computed win rate | Preserved |
| `Copy Setup` (unmasked) | `copySignal(text)` | Clipboard write + toast | Preserved |
| `Unlock Free Setup #n` | `openTelegramFreeModal()` | Opens free modal | Preserved |
| `Unlock VIP Setup #n` | `openVipUpgradeModal()` | Opens VIP modal (full flow copy) | Opens access drawer at stage 01 |
| Row click | **none** | Rows are not selectable in the reference | **NEW** — selects row, opens detail pane |

## 4. VIP access card (inline) and modal — duplicated controls

Every control exists twice, once inline and once in the modal, kept in sync by an ID pair map
(`tier-opt-1day` / `modal-tier-opt-1day`, etc.). The redesign collapses this duplication to a
single source of truth.

| Trigger | Handler | Effect | Redesign |
|---|---|---|---|
| Tier option ×4 | `selectUpgradeTier(tier, price)` | Exclusive `.selected`; rewrites deposit amount + button label | Preserved; four-corner gold brackets; `radiogroup` |
| Network chip ×4 | `setAsset(key)` | Rewrites label, address, fee, amount, QR in both copies | Preserved; equipment-slot treatment |
| `Copy` (address) | `copyAddress()` | Clipboard + label→"Copied!" 1500 ms + toast | Preserved; adds `aria-label` and live region |
| Handle input + submit | `submitQuickHandleFromCard()` / `handleDirectTgLogin()` | Normalises `@`, POSTs `/api/telegram-auth` | Preserved |
| `Connect Telegram (1-Click)` | `startOneTapTgConnect()` | Mints token, opens bot, polls `/api/auth-poll` 2 s | Preserved |
| Telegram widget | `renderTelegramWidget()` | Injects official widget script | Preserved |
| `I Have Sent Deposit · Check Binance Vault` | `triggerDepositCheck(isModal)` | Guard → listener → POST → 4 s poll | Preserved as stage 04 |
| Tx-hash input | read by `checkDepositOnce()` | Sent as `tx_hash` | Preserved |
| `scrollToVipUpgrade()` | — | Smooth-scrolls to the VIP card | Replaced by drawer open |

## 5. Overlays

| Trigger | Handler | Effect | Redesign |
|---|---|---|---|
| Footer legal links ×3 | `openModal(id)` | `display:flex` | Preserved as accessible dialogs |
| Close button / backdrop | `closeModal(id)` | `display:none` | Preserved + `Esc`, focus trap, focus restore |

## 6. Timers

| Timer | Interval | Purpose |
|---|---|---|
| `fetchTelemetry` | 3000 ms | `/api/status` |
| `updateVisitorStats` | 15000 ms | `/api/visitor-stats` |
| `depositPoller` | 4000 ms | `/api/check-deposit-status`, cleared on grant |
| `oneTapPollInterval` | 2000 ms | `/api/auth-poll`, capped by attempts |
| Toast dismiss | 2600 ms | `setTimeout` |
| Copy-label revert | 1500 ms | `setTimeout` |

All intervals are preserved. In the redesign every timer is owned by a hook with cleanup on
unmount — the reference leaks its intervals for the page lifetime.

## 7. Keyboard and focus — reference gaps

Audited against the live DOM. These are **defects the redesign fixes**, not behaviors to
preserve:

| Gap | Detail |
|---|---|
| Tabs are `<button>` but not a tablist | No `role="tablist"`, no `aria-selected`, no arrow-key roving |
| Tier and network selectors are `<div onclick>` | Not focusable, not keyboard-operable, no role, invisible to AT |
| Modals are plain divs | No `role="dialog"`, no `aria-modal`, no focus trap, no `Esc`, no focus restore |
| No visible focus styling | No `:focus-visible` rules anywhere in 1,836 lines |
| Copy buttons unlabelled | Icon-only in places; no `aria-label` |
| Status changes silent | No `aria-live` on toast, listener, or telemetry |
| `user-scalable=no, maximum-scale=1` | Blocks pinch-zoom — a WCAG 1.4.4 failure |
| No reduced-motion support | `pulse-ring` animates unconditionally |

The redesign adopts none of these. The viewport meta is rewritten to permit zoom.
