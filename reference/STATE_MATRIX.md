# STATE MATRIX

Every interface state identified in the reference, plus the states the redesign must add to
satisfy the directive's state-completeness rule. States marked **NEW** do not exist in the
reference; they are additive and never remove reference behavior.

## 1. Global session axes

Three orthogonal axes multiply into the session state.

| Axis | Values | Source of truth |
|---|---|---|
| Telegram binding | `DISCONNECTED` / `CONNECTING` / `CONNECTED` | `telegramHandle`, `ag_tg_user` |
| Entitlement | `GUEST` / `FREE_UNLOCKED` / `VIP` | `isFreeUnlocked`, `isVipUser`, `ag_vip_token` |
| Feed health | `LOADING` / `LIVE` / `STALE` / `UNAVAILABLE` | poll outcome + `updated_utc` age |

### Reachable session combinations

| # | Binding | Entitlement | Free slots | VIP slots | Notes |
|---|---|---|---|---|---|
| 1 | DISCONNECTED | GUEST | masked | masked | Cold first visit |
| 2 | CONNECTING | GUEST | masked | masked | One-tap poll in flight |
| 3 | CONNECTED | FREE_UNLOCKED | **unmasked** | masked | Handle bound |
| 4 | CONNECTED | VIP | unmasked | **unmasked** | Paid and confirmed |
| 5 | DISCONNECTED | VIP | unmasked | unmasked | `ag_vip_token` restored without `ag_tg_user`; reference explicitly supports this on boot |
| 6 | DISCONNECTED | FREE_UNLOCKED | unmasked | masked | `ag_free_unlocked` restored alone |

Combination 5 is a genuine reference behavior (boot branch checks `ag_vip_token` before
`ag_free_unlocked`), not an accident. Preserved.

## 2. Feed / telemetry states

| State | Trigger | Reference presentation | Redesign presentation |
|---|---|---|---|
| `LOADING` | Before first `/api/status` resolves | "Synchronizing Binance live feeds..." centered in the stream | Skeleton slot rows + `SYNCING` deck indicator |
| `STALE` | localStorage values painted pre-poll | Silently shows old numbers with no marker | **NEW** — explicit `STALE` chip, muted stone text, `aria-live` polite |
| `LIVE` | Poll succeeded | Values swap with no transition | Navi-cyan tick illumination, ≤220 ms, respects reduced-motion |
| `UNAVAILABLE` | `fetch` throws | **Silently swallowed** (`catch (e) {}`); last values freeze forever with no signal | **NEW** — `FEED UNAVAILABLE` state, retained last-known values explicitly labelled, retry affordance |
| `EMPTY` | `positions.length === 0` | Falls through to the loading string | **NEW** — honest empty state: "NO ACTIVE SIGNALS · 0 / 10 SLOTS" |

The reference's silent-failure behavior is the single largest robustness gap found. Treated as
a defect to fix rather than a contract to preserve — see `REDESIGN_DECISIONS.md` D-07.

## 3. Signal slot states

| State | Condition | Presentation rule |
|---|---|---|
| `LOCKED_FREE` | `is_free_stream && !isFreeUnlocked` | Structure visible; ROE/PNL **real**; six fields masked; Telegram unlock CTA |
| `LOCKED_VIP_WINNING` | `!is_free_stream && !isVipUser && roe >= 0` | Real positive ROE/PNL shown; six fields masked; padlock; VIP CTA |
| `LOCKED_VIP_LOSING` | `!is_free_stream && !isVipUser && roe < 0` | ROE → `ACTIVE RANGE`, PNL → `SL Guarded`, badge → `ACCUMULATION` |
| `UNLOCKED_ACTIVE` | unmasked, `signal_status === 'ACTIVE'` | Full data; badge `SL PROTECTED` (blue) |
| `UNLOCKED_LOCKED_PROFIT` | unmasked, `LOCKED_PROFIT` or `profit_locked` | Full data; badge `LOCKED WIN [✓]` (green) |
| `EXIT_WARNING` | `signal_status === 'EXIT_WARNING'` | Badge `NEAR STOP` (gold). **Code path exists; never observed in live data** — see `UNKNOWNS.md` U-01 |
| `SELECTED` | **NEW** — row chosen | Four-corner gold bracket + detail pane |
| `HOVER` / `FOCUS` | **NEW** | Cyan edge illumination; focus ring is non-color-redundant |

## 4. Telegram binding states

| State | Presentation |
|---|---|
| `DISCONNECTED` | "Connect Telegram" button; masthead shows no handle badge |
| `AWAITING_TAP` | Listener box visible, "Waiting for you to tap Start in Telegram…", retry link |
| `POLLING` | Poll attempts counting toward cap |
| `TIMEOUT` | Retry link surfaces. **NEW** — explicit copy; reference silently stops |
| `CONNECTED` | Green dot + `@handle (FREE)` or `(VIP)`; disconnect available |
| `VALIDATION_ERROR` | Inline feedback block in the modal; empty-handle guard |

## 5. Access flow (purchase) states

Reference renders all four stages simultaneously. The redesign gates them; both preserve the
same underlying transitions.

| Stage | State | Presentation |
|---|---|---|
| 01 ACCESS | `UNSELECTED` / `SELECTED` | Selection is exclusive; default `1_MONTH` |
| 02 TELEGRAM | `UNBOUND` / `BOUND` | Bound shows the handle; unbound shows a warning if step 4 is attempted |
| 03 PAYMENT | `NETWORK_UNSELECTED` (unreachable — always defaults) / `NETWORK_SELECTED` | Only the chosen network's address, fee, QR and amount are shown |
| 03 PAYMENT | `ADDRESS_COPIED` | Button label → "Copied!" for 1500 ms + toast |
| 04 ACTIVATE | `IDLE` | Confirm button; listener hidden |
| 04 ACTIVATE | `BLOCKED_NO_HANDLE` | Warning block + toast + modal opens; poll never starts |
| 04 ACTIVATE | `WAITING` | "Monitoring Binance Vault for your deposit..." — cyan |
| 04 ACTIVATE | `DETECTED` / `CONFIRMING` | "⏳ Incoming Deposit Detected on Binance!" — cyan pulse |
| 04 ACTIVATE | `ACCESS_GRANTED` | Success card: plan, handle, expiry, invite link — gold |
| 04 ACTIVATE | `ERROR` | **Reference swallows all errors.** **NEW** — restrained red failure state with retry |

`WAITING → DETECTED → CONFIRMING → ACCESS GRANTED` is the directive's mandated progression and
maps cleanly onto the reference's `pending` / `success && is_vip` / fallthrough branches.

## 6. Component state coverage

Required before any component is called complete. `—` means the state cannot occur.

| Component | DEFAULT | HOVER | FOCUS | ACTIVE | SELECTED | DISABLED | LOCKED | LOADING | EMPTY | SUCCESS | WARNING | ERROR |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Signal row | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Tier option | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | — | — | — | — | — |
| Network chip | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | — | — | — | — | — |
| Copy button | ✓ | ✓ | ✓ | ✓ | — | — | — | — | — | ✓ | — | ✓ |
| Tab | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | — | — | — | — | — |
| Status tile | ✓ | — | — | — | — | — | — | ✓ | ✓ | — | ✓ | ✓ |
| Deposit listener | — | — | — | — | — | — | — | ✓ | — | ✓ | ✓ | ✓ |
| Drawer | ✓ | — | ✓ | — | — | — | — | — | — | — | — | — |

## 7. Non-color-redundant encoding

Every state above is distinguished by at least one non-color channel — glyph, label text,
border weight, or bracket geometry — so the interface survives monochrome rendering and the
common color-vision deficiencies. The reference relies on color alone in several places
(green/red PnL with no sign glyph beyond `+`/`-`); the redesign keeps the sign and adds a
directional caret.
