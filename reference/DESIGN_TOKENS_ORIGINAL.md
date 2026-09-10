# DESIGN TOKENS — original (reference) system

Extracted from the reference's `:root` custom properties and computed CSS. This documents what
the reference *is*, for fidelity comparison. The redesign's own tokens live in
`src/styles/tokens.css` and are catalogued in `REDESIGN_DECISIONS.md`.

## 1. Declared custom properties (verbatim)

### Surfaces

| Token | Value | Role |
|---|---|---|
| `--bg` | `#07090e` | Page ground — near-black, faint blue cast |
| `--card` | `#0c1018` | Section card |
| `--card-inner` | `#101622` | Nested panel |
| `--card-hover` | `#151e2e` | Card hover |
| `--border` | `#182232` | Standard 1px border |
| `--border-subtle` | `rgba(255,255,255,0.06)` | Hairline |
| `--border-accent` | `rgba(36,161,222,0.28)` | Telegram-tinted border |

### Text

| Token | Value | Role |
|---|---|---|
| `--text` | `#f1f5f9` | Primary — near-white |
| `--text-dim` | `#94a3b8` | Secondary |
| `--text-muted` | `#64748b` | Tertiary / labels |

### Semantic

| Token | Value | Role |
|---|---|---|
| `--green` / `--green-bg` / `--green-border` | `#00E599` / 10% / 25% | Profit, locked win, healthy |
| `--red` / `--red-bg` | `#FF4757` / 10% | Loss |
| `--blue` / `--blue-bg` | `#38bdf8` / 10% | SL protected, live/neutral status |
| `--gold` / `--gold-bg` | `#f59e0b` / 10% | Goal progress, NEAR STOP |
| `--tg-blue` + hover/bg/border/glow | `#24A1DE`, `#1E96D1`, 10%, 35%, 40% | Telegram brand |
| `--vip-gold` + dark/bg/border/glow | `#F5A623`, `#D48806`, 10%, 35%, 35% | VIP tier |

`var(--purple)` is referenced twice in JS (VIP tier dot) but **is never declared** — a live bug
in the reference; the dot silently keeps its previous color. Recorded in `UNKNOWNS.md` U-05.

### Typography

| Token | Value |
|---|---|
| `--font-sans` | `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif` |
| `--font-display` | `'Space Grotesk', -apple-system, sans-serif` |
| `--font-mono` | `'JetBrains Mono', monospace` |

## 2. Undeclared but consistent values

The reference has **no spacing, radius, shadow, or duration tokens** — these are hard-coded
inline throughout. Frequency analysis of the 1,836-line stylesheet:

**Radii** — `6px` (13×), `4px` (9×), `8px` (8×), `7px` (7×), `5px` (6×), `12px` (5×), `10px`
(5×), `3px` (4×), plus one-offs at 1, 2, 9, 14px. Twelve distinct radii with no system.

**Font sizes** — `11px` (23×), `10px` (19×), `9px` (10×), `9.5px` (9×), `11.5px` (8×), `10.5px`
(6×), `13px` (4×), `8px`/`16px`/`14px`/`12px` (3× each), `8.5px` (2×), `22px`, `19px`.
Sixteen sizes including half-pixel steps. The interface is **extremely small-type dense** —
the modal ratio is dominated by 9–11px text.

**Transitions** — `all 0.15s ease` (9×) is the house default; `all 0.2s cubic-bezier(0.16,1,0.3,1)`
(2×); `width 0.4s ease` for the goal bar; one `all 0.18s cubic-bezier(...)`.

**Animation** — exactly one keyframe, `pulse-ring`, on live-status dots. No
`prefers-reduced-motion` guard anywhere.

## 3. Layout

| Property | Value |
|---|---|
| Breakpoints | `360px`, `600px`, `768px`, `900px` |
| Desktop split | `.workstation { grid-template-columns: 1.15fr 0.85fr }` at ≥900px → **57.5% / 42.5%** |
| KPI strip | 1 col → 2 col (600px) → 4 col (900px) |
| Max page height | 3,189px desktop / 4,733px at 375px |

The observed 57.5/42.5 split is materially different from the directive's mandated 70/30. The
redesign follows the directive; the reference proportion is recorded here only as the measured
baseline.

## 4. Assessment against the redesign brief

| Reference trait | Redesign disposition |
|---|---|
| Near-black `#07090e` ground | Replaced — `#08110C` deep forest |
| Near-white `#f1f5f9` text | Replaced — `#E8E1C8` parchment |
| Fluorescent `#00E599` green | Replaced — `#59D36B` rupee emerald |
| Telegram blue as structural accent | Demoted to brand-only; `#55DDE0` Navi cyan takes live/telemetry duty |
| Amber `#f59e0b` gold | Replaced — `#D5A943` / `#F0C85A` temple gold, reserved for verification |
| 12 unsystematised radii | Replaced — 4-step radius scale + bevel/clip geometry |
| 16 font sizes incl. half-pixels | Replaced — 9-step type scale, no fractional sizes |
| No spacing system | Replaced — 4px-based spacing scale |
| No reduced-motion support | Added |
| Silent error swallowing | Fixed — explicit states |
