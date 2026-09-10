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

## Pass 1 — implementation defects found and fixed (2026-09-10)

Eight defects found by inspecting the first implementation capture against the reference at
identical viewports. All eight were fixed and re-captured before commit.

### V-01 · Roadmap rendered browser list markers
- **Viewport:** 1024–1920
- **Expected:** Stage sequence carried by the ◆ / ◇ glyph alone.
- **Observed:** `1.` `2.` `3.` from the `<ol>` default list-style — the base reset covered `ul` but not `ol`.
- **Fix:** `list-style: none` + margin/padding reset on `.vs-rail__stages`.
- **Status:** ✅ Fixed.

### V-02 · Identity column absorbed the row
- **Viewport:** 1440×900, 1920×1080
- **Expected:** Numeric columns evenly spaced and aligned down the grid.
- **Observed:** `PAIR` consumed the free space, stranding ENTRY…STATUS against the right edge with a wide dead gap.
- **Fix:** `table-layout: fixed` plus an explicit `<colgroup>`.
- **Status:** ✅ Fixed.

### V-03 · Suppressed placeholders out-shouted real values
- **Viewport:** all
- **Expected:** `ACTIVE RANGE` / `SL GUARDED` read as absent data, not as figures.
- **Observed:** Rendered in bold parchment at full RoE size, drawing *more* attention than the real percentages beside them — the opposite of the intent, since these mark a value the reference deliberately withholds.
- **Fix:** `data-suppressed` styling — normal weight, smaller, muted stone.
- **Status:** ✅ Fixed.

### V-04 · Connection state collapsed to a bare dot
- **Viewport:** 375×812
- **Expected:** Connection state legible on a phone.
- **Observed:** Below 480px the label was hidden entirely, leaving an unlabelled dot beside `GET VIP` that communicated nothing.
- **Fix:** A compact label (`CONNECT` / `FREE` / `VIP`) replaces the full one instead of hiding it.
- **Status:** ✅ Fixed.

### V-05 · Terminal heading and slot count collided
- **Viewport:** 375×812
- **Expected:** One line each.
- **Observed:** "ACTIVE ALPHA SIGNALS" wrapped to two lines and "9 ACTIVE · 1 OPEN" broke mid-phrase.
- **Fix:** Step the title down one scale rung below 480px; `white-space: nowrap` on the count.
- **Status:** ✅ Fixed.

### V-06 · Locked placeholder names truncated on mobile
- **Viewport:** 375×812
- **Expected:** Slot identity fully readable.
- **Observed:** "FREE COMMUNITY SETUP…" ellipsised and "10X ALGO" wrapped mid-tag.
- **Fix:** Identity wraps below 480px; the leverage tag takes its own line.
- **Status:** ✅ Fixed.

### V-07 · Leverage tag clipped in the table
- **Viewport:** 1440×900
- **Expected:** `10X ALGO` intact.
- **Observed:** Rendered `10X ALGO__` — the colgroup widths summed to 102%, squeezing the identity cell.
- **Fix:** Widths corrected to sum to exactly 100; the symbol ellipsises before the tag does.
- **Status:** ✅ Fixed.

### V-08 · Lock glyph orphaned onto its own line
- **Viewport:** 375×812
- **Expected:** Lock inline with the symbol it qualifies.
- **Observed:** The V-06 fix stacked the identity as a column, pushing the glyph onto a line by itself.
- **Fix:** Wrap instead of stack; only the leverage tag gets `flex-basis: 100%`.
- **Status:** ✅ Fixed.

---

## Pass 1 — verification (2026-09-10)

Re-captured after the eight fixes. Compared against the reference captures at identical sizes.
Automated coverage: `npm test` — 10 Playwright checks, all passing.

### I-01 · Horizontal overflow — none
- **Viewport:** all six
- **Expected:** `scrollWidth <= clientWidth` at every size.
- **Observed:** No overflow at 375, 430, 768, 1024, 1440, 1920. Confirmed by `manifest.json`.
- **Fix:** n/a.
- **Status:** ✅ Pass.

### I-02 · Document height vs reference
- **Viewport:** all six
- **Expected:** Substantially shorter than the reference; terminal above the fold.
- **Observed:**

| Viewport | Reference | Implementation | Change |
|---|---:|---:|---:|
| 375 × 812 | 4,733 px | 2,165 px | **−54%** |
| 430 × 932 | 4,582 px | 2,073 px | **−55%** |
| 768 × 1024 | 4,225 px | 2,133 px | **−50%** |
| 1024 × 768 | 3,189 px | 1,333 px | **−58%** |
| 1440 × 900 | 3,189 px | 1,290 px | **−60%** |
| 1920 × 1080 | 3,189 px | 1,290 px | **−60%** |

  At 1440 and above, the command deck, all nine slots, the open-slot remainder, the full status
  rail with roadmap, and the five verified exits all sit within the first viewport. The reference
  showed one signal card in the same space.
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
