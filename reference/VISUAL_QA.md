# VISUAL QA

Running defect log. Format per the directive: Issue / Viewport / Expected / Observed / Fix / Status.

Artifacts:
- Reference — `reference/screens/reference/<viewport>-{viewport,full}.png` + `manifest.json`
- Implementation — `reference/screens/implementation/<viewport>-{viewport,full}.png` + `manifest.json`

Regenerate: `npm run shots:ref` (live reference, read-only) and `npm run shots` (local build).

---

## Pass 0 — reference audit (2026-09-10)

Findings about the **reference system**, recorded as the baseline the redesign must beat. These
are not defects in our code; they are the conditions being redesigned away.

### R-01 · Desktop opening viewport spent on marketing
- **Viewport:** 1440×900, 1920×1080
- **Expected:** The product visible immediately.
- **Observed:** Brand card + tagline + group-marketing paragraph occupy the first ~380px; the signal stream begins at ~625px, so only one signal card is above the fold.
- **Fix:** Command deck (D-03) — compact operational header; terminal starts immediately.
- **Status:** ✅ Fixed in slice 1.

### R-02 · Sales surface nearly equals the product in width
- **Viewport:** ≥900px
- **Expected:** Terminal dominant (Level 1 over Level 3).
- **Observed:** `1.15fr 0.85fr` = 57.5 / 42.5. The VIP purchase card claims 42.5% of the workstation.
- **Fix:** 70/30 split (D-04); access moves to a drawer (D-08).
- **Status:** ✅ Fixed in slice 1.

### R-03 · Tablet gets a phone layout
- **Viewport:** 768×1024
- **Expected:** A layout designed for the width.
- **Observed:** Single stacked column with large in-card whitespace — the 900px breakpoint leaves 768 on the mobile branch. Document height 4,225px.
- **Fix:** `--bp-md 768` relocates the rail below the terminal as a 2-column tile grid.
- **Status:** ◻ Slice 1 stacks correctly; tile-grid refinement pending.

### R-04 · Nine signals require ~1,600px of scroll
- **Viewport:** all
- **Expected:** Bloomberg-grade density; the slot table legible at a glance.
- **Observed:** Each signal is a ~180px stacked card. Total document 3,189px desktop / 4,733px at 375px.
- **Fix:** Eight-column table (D-05); nine slots fit one screen at ≥1024px.
- **Status:** ✅ Fixed in slice 1.

### R-05 · Pinch-zoom disabled
- **Viewport:** 375×812, 430×932
- **Expected:** Zoom available (WCAG 1.4.4).
- **Observed:** `maximum-scale=1, user-scalable=no` in the viewport meta.
- **Fix:** Meta rewritten to `width=device-width, initial-scale=1, viewport-fit=cover`.
- **Status:** ✅ Fixed in slice 1.

### R-06 · No visible focus indication anywhere
- **Viewport:** all
- **Expected:** Every interactive control shows focus.
- **Observed:** No `:focus-visible` rule in 1,836 lines of CSS. Tier and network selectors are `<div onclick>` and cannot receive focus at all.
- **Fix:** Global focus treatment token; all controls are real elements.
- **Status:** ✅ Fixed in slice 1 for shipped components.

### R-07 · Telemetry failure is invisible
- **Viewport:** all
- **Expected:** A dead feed is announced.
- **Observed:** `catch (e) {}` — values freeze while still labelled `REAL-TIME`.
- **Fix:** Explicit `STALE` and `UNAVAILABLE` states (D-07).
- **Status:** ✅ Fixed in slice 1.

### R-08 · Type below the readable floor
- **Viewport:** all, worst at 375×812
- **Expected:** ≥11px for data labels.
- **Observed:** `8px` (3×), `8.5px` (2×), `9px` (10×), `9.5px` (9×) — 24 declarations under 10px, on a dark ground at low contrast (`--text-muted #64748b` on `#0c1018` ≈ 4.1:1 at 9px).
- **Fix:** 9-step scale, floor 11px, no fractional sizes (D-11).
- **Status:** ✅ Fixed in slice 1.

---

## Pass 1 — implementation, slice 1 (2026-09-10)

Captured after building the global shell, command deck, terminal, status rail, verified-exit
strip and responsive transformation. Compared against the reference captures at identical sizes.

### I-01 · Horizontal overflow — none
- **Viewport:** all six
- **Expected:** `scrollWidth <= clientWidth` at every size.
- **Observed:** No overflow at 375, 430, 768, 1024, 1440, 1920. Confirmed by `manifest.json`.
- **Fix:** n/a.
- **Status:** ✅ Pass.

### I-02 · Document height vs reference
- **Viewport:** all six
- **Expected:** Substantially shorter than the reference; terminal above the fold.
- **Observed:** See `reference/screens/implementation/manifest.json` for measured heights against the reference's 3,189 / 4,733.
- **Fix:** n/a — density is the intended gain.
- **Status:** ✅ Pass.

### I-03 · Table → card transformation at the 1024 boundary
- **Viewport:** 768×1024, 1024×768
- **Expected:** Eight-column table at ≥1024; summary cards below.
- **Observed:** Correct on both sides of the boundary; no eight-column table reaches a phone.
- **Fix:** n/a.
- **Status:** ✅ Pass.

### I-04 · Status rail relocation
- **Viewport:** 768×1024
- **Expected:** Rail below the terminal, not a squeezed sidebar.
- **Observed:** Rail stacks below at `--bp-md`; tiles become a horizontally scrollable strip below `--bp-md`.
- **Fix:** n/a.
- **Status:** ✅ Pass.

### I-05 · Masked cells keep row geometry
- **Viewport:** 1440×900
- **Expected:** Locked rows structurally identical to unlocked; only values obscured; no giant lock overlay.
- **Observed:** `▓▓▓▓` glyph blocks in muted stone; row height, columns and ROE/status unchanged; one small lock glyph in the side cell.
- **Fix:** n/a.
- **Status:** ✅ Pass.

---

## Open items carried into the next pass

| ID | Item | Blocking? |
|---|---|---|
| R-03 | Tablet tile-grid refinement at 768 | No |
| — | Performance/Journal workspace (F-03) not yet built | No — slice 2 |
| — | Access flow stages 01–04 (F-06, F-09…F-13) not yet built | No — slice 2 |
| — | Legal overlays (F-14) not yet built | No — slice 2 |
| — | Contrast audit of every token pair at 200% zoom | No — slice 2 |
