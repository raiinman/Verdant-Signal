# UNKNOWNS

Things the reference does not reveal. Each carries the least-destructive reconstruction chosen
and shipped, per the directive's instruction to record, decide, and continue.

Resolution rule: **never invent data**; prefer the interpretation that removes the least
functionality; when a server contract is unobservable, mirror the client's own expectations
exactly as written in the reference source.

---

## U-01 — `EXIT_WARNING` / `NEAR STOP` never observed live

- **Unknown:** `renderTelemetry` branches on `signal_status === 'EXIT_WARNING'` and renders a gold `NEAR STOP` badge, but across all observation the API only ever returned `ACTIVE` and `LOCKED_PROFIT`. The trigger threshold is server-side.
- **Impact:** A real signal state whose entry condition is unknowable from outside.
- **Decision:** Implement the state exactly as the reference renders it (gold badge, label `NEAR STOP`), driven by the same `signal_status` value. Do not invent a client-side threshold to synthesise it.
- **Risk:** None. Absent the value, the state simply never renders — identical to the reference.

## U-02 — `/api/check-deposit-status` response schema is partly unobservable

- **Unknown:** The client reads `pending`, `message`, `success`, `is_vip`, `plan`, `expires_str`, `invite_link`. Only these are knowable; error shapes, HTTP codes, and rate limits are not. The endpoint was **not** called — doing so would require submitting a payment claim.
- **Decision:** Type the response as exactly those seven optional fields and branch identically to the reference. Local development uses a mock resolver that walks `WAITING → DETECTED → CONFIRMING → ACCESS_GRANTED` on a timer so the UI states are reachable and testable without any payment.
- **Risk:** Low. The mock is dev-only and clearly labelled; the production shape is the reference's own.

## U-03 — Telegram auth server contract

- **Unknown:** `/api/telegram-auth`, `/api/auth-start`, `/api/auth-poll` were not exercised. The poll-attempt cap, token TTL, and failure payloads are unobservable.
- **Decision:** Preserve the client-side contract verbatim — `tg_` + 8 random base-36 chars, 2 s poll, handle normalised to a leading `@`, id from the reference's own `hashCode` for the manual path. Add an explicit TIMEOUT state where the reference silently stops.
- **Risk:** Low; additive only.

## U-04 — `BTC` and `USDT_TRON` are defined but unreachable

- **Unknown:** `ASSET_REGISTRY` defines six networks with full addresses and `setAsset`'s `pillMap` maps `BTC → pill-btc` and `USDT_TRON → pill-usdt-tron`, but **no such elements exist in the DOM**. Whether these are deprecated, staged for release, or hidden deliberately is unknowable.
- **Decision:** Ship exactly the four reachable networks. Carry the other two in the typed registry as `hidden: true` so the data is not lost, but render no chip. Adding them would invent a supported payment network, which the directive forbids.
- **Risk:** None. Matches observable behavior precisely.

## U-05 — `var(--purple)` is used but never declared

- **Unknown:** `checkDepositOnce` and `applyAuthenticatedUser` set the VIP tier dot to `var(--purple)`, which appears nowhere in `:root`. The dot silently retains its prior color — a live bug.
- **Decision:** Drop it. VIP is Temple Gold (`#D5A943`) in the redesign, per the directive's semantic rule that gold means verification and premium. The directive also bans Web3 purple outright.
- **Risk:** None; the reference's intended color is unknowable and the rule is explicit.

## U-06 — "Locked Principal (+103%)" is hard-coded

- **Unknown:** The Banked Realized sub-label reads `Locked Principal (+103%)` as **static markup**. It does not derive from any API field and did not change while `net_gain_pct` moved from 185.9 to 158.4.
- **Decision:** Preserve the string verbatim as a static label. Do not recompute it from telemetry — that would change a displayed figure and invent a derivation.
- **Risk:** None. Recorded so a future maintainer does not "fix" it into a computed value.

## U-07 — `max_slots` is 10 but only 9 positions ever appeared

- **Unknown:** Whether the 10th slot is reserved, or simply unfilled at observation time.
- **Decision:** Render `{active_positions_count} / {max_slots}` and show the remainder as genuine empty slots — structurally present, labelled `SLOT AVAILABLE`. The directive requires up to 10 slots and honest empty states.
- **Risk:** None; both numbers come from the API.

## U-08 — Free-slot assignment rule

- **Unknown:** `is_free_stream` is server-assigned and was true for exactly the first two positions (`free_slot` 1 and 2). Whether "always the two oldest", "always exactly two", or something else is unknowable.
- **Decision:** Trust the server field. The reference's own fallback — `i < 2` when the field is absent — is ported verbatim as the fallback.
- **Risk:** None.

## U-09 — Win rate and net yield are client-computed over a truncated list

- **Unknown:** `audited_exits` returned 6 entries. Whether that is the full history or a server-side truncation is unknowable. `WIN RATE: 83.3%` (5/6) and `NET YIELD: +$15.46` are computed over whatever arrives.
- **Decision:** Compute identically over the received array and label the figure as scoped to the returned ledger. Do not present it as an all-time statistic — that would be a verification claim beyond the evidence.
- **Risk:** Low; the computation is unchanged, only the label is honest about scope.

## U-10 — Roadmap `$100 → $200 → $1K` has no API backing

- **Unknown:** The directive specifies this roadmap. The API supplies only `target_goal_usdt: 100.0` and `goal_progress_pct`. The $200 and $1K tiers exist nowhere in the reference.
- **Decision:** Render the roadmap with the **$100 tier live and driven by real telemetry**, and the $200 / $1K tiers as explicitly **unreached future milestones** — visibly muted, no fabricated progress, no invented figures. The directive asked for the roadmap; honesty about which tier has data is preserved.
- **Risk:** Low, and the alternative — inventing progress toward $1K — is expressly forbidden.

## U-11 — No `/access` route exists to compare against

- **Unknown:** The reference is single-route, so there is no reference behavior for a dedicated access page.
- **Decision:** Desktop uses a right-side drawer (directive's first option, preserves terminal context). Mobile uses a full-screen flow at `/access`. Both render one shared stage machine.
- **Risk:** None; the directive explicitly authorizes either architecture.

## U-12 — Real-time transport is polling, not streaming

- **Unknown:** No WebSocket or SSE exists; `STREAM LIVE` in the directive's command deck describes 3 s polling.
- **Decision:** Keep 3 s polling. Label the indicator `● STREAM LIVE` with `LAST SYNC {n}s` computed from the actual last successful poll, so the claim is backed by a real measurement rather than implying a socket.
- **Risk:** None.

## U-13 — Fonts

- **Unknown:** The reference uses Plus Jakarta Sans / Space Grotesk / JetBrains Mono. The directive requires a condensed sans or restrained monospace for data and a restrained old-world serif or small-caps for display, and forbids novelty medieval faces.
- **Decision:** JetBrains Mono is **retained** for all numeric telemetry — it is already the reference's data face and satisfies "restrained monospace". Display headings use a restrained serif with a system fallback stack. Body copy stays a humanist sans. No decorative face is loaded.
- **Risk:** None.
