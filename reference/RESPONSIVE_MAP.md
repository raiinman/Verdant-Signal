# RESPONSIVE MAP

Measured from the reference with Playwright at the six mandated QA viewports, then the
redesign's intended transformation at each.

## 1. Reference measurements

Captured 2026-09-10. Artifacts: `reference/screens/reference/<size>-viewport.png`,
`<size>-full.png`, `manifest.json`.

| Viewport | Label | Document height | Horizontal overflow |
|---|---|---:|:-:|
| 375 × 812 | mobile-small | 4,733 px | none |
| 430 × 932 | mobile-large | 4,582 px | none |
| 768 × 1024 | tablet-portrait | 4,225 px | none |
| 1024 × 768 | tablet-landscape | 3,189 px | none |
| 1440 × 900 | desktop | 3,189 px | none |
| 1920 × 1080 | desktop-wide | 3,189 px | none |

The reference is clean on horizontal overflow at every size. Its weakness is **vertical**: 3,189
px of continuous scroll on desktop with no navigation, and 4,733 px on a phone — the access
flow sits below roughly 2,000 px of terminal content with no way back up.

Layout stops changing above 900px: 1024, 1440 and 1920 render identically at 3,189 px, so the
extra 896 px of width at 1920 buys nothing but wider cards. The content column is capped and
centered.

## 2. Reference breakpoints

| Breakpoint | Effect |
|---|---|
| `≥ 600px` | KPI strip 1 → 2 columns |
| `≥ 900px` | `.workstation` becomes `1.15fr 0.85fr` (57.5 / 42.5); KPI strip → 4 columns; top bar → row; lead banner → row |
| `≤ 768px` | Card padding reductions |
| `≤ 600px` | Top-bar padding, brand mark 40px, heading 16px |
| `≤ 360px` | Final type/padding reductions |

Below 900px everything is a single stacked column: masthead → KPIs → banner → closed calls →
signal stream → VIP card → footer.

## 3. Reference behavior per viewport

**375 × 812** — Full stack. KPI tiles 2×2. Brand block wraps to two lines. Both banner buttons
go full-width. Signal cards keep their three-column internal grid, which compresses the
six data fields into ~110px columns — the densest point in the layout.

**430 × 932** — Same structure, 55px more width; 151px shorter document.

**768 × 1024** — Still single column (below the 900px threshold), so a tablet gets a phone
layout at double the width. Large horizontal whitespace inside cards. This is the reference's
weakest viewport.

**1024 × 768** — Two-column workstation engages. Signal stream left, VIP card right.

**1440 × 900** — Content capped and centered; the layout of record.

**1920 × 1080** — Identical to 1440 apart from card width.

## 4. Redesign transformation targets

| Viewport | Shell | Terminal | Status rail | Access |
|---|---|---|---|---|
| 375 / 430 | Top bar collapses to brand + connection dot + `GET VIP`; nav becomes a bottom-anchored segmented control | Signal slots become compact summary cards; tap expands detail | Status tiles become a horizontally scrollable strip with snap points | Full-screen stepped flow |
| 768 | Top bar full; nav inline | Single-column terminal, table → summary cards | Rail moves below the terminal as a 2-column tile grid | Full-screen route |
| 1024 | Top bar full | Table view, reduced column padding | Rail narrows; roadmap compacts | Drawer, 420px |
| 1440 | Top bar full | **70%** table, all 8 columns | **30%** rail | Drawer, 480px |
| 1920 | Top bar full, content capped at 1600px | 70% table with generous cell padding | 30% rail | Drawer, 520px |

### Redesign breakpoints

| Token | Value | Purpose |
|---|---|---|
| `--bp-sm` | 480px | Small-phone type/padding step-down |
| `--bp-md` | 768px | Tablet: rail relocates below terminal |
| `--bp-lg` | 1024px | Two-column workstation engages; table view replaces cards |
| `--bp-xl` | 1440px | Full 70/30 with maximum column padding |

Chosen so the tablet gap at 768px — the reference's worst viewport — gets a real layout rather
than a stretched phone.

## 5. Mobile rules (from the directive, adopted verbatim)

- Collapse navigation.
- Active signals first, above everything else.
- Dense rows become compact signal summaries; details expand on tap.
- Statistics horizontally scrollable.
- Verified exits become vertical/swipe cards.
- VIP access is a full-screen stepped workflow.
- Connection/status information stays prominent.
- Touch targets ≥ 44px.
- The eight-column desktop table is **never** shipped to a phone.

## 6. Zoom

The reference sets `maximum-scale=1, user-scalable=no`, blocking pinch-zoom (WCAG 1.4.4
failure). The redesign drops both, and 200% zoom at 1280px logical width is a QA gate in
`VISUAL_QA.md`.
