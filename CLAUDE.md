# CLAUDE.md — Verdant Signal Repository Authority

**Branch:** `feature/zenom-reverse-engineering`

Read this before changing code.

## 1. Authority order

Verdant Signal changed direction after the original Zenom reverse-engineering pass. The current product is **not** a Zenom Alpha clone and is not required to preserve Zenom's business model, paywall, Binance-futures semantics, or displayed profitability claims.

Read current authority in this order:

1. `docs/VERDANT_PROJECT_DIRECTION_2026-09-10.md`
2. `docs/VERDANT_PERCEPTION_ENGINE_FOUNDATION_2026-09-10.md`
3. `docs/VERDANT_TRADE_GEOMETRY_AND_MODEL_RESEARCH_2026-09-10.md`
4. `docs/VERDANT_RESEARCH_CONTRACT_V0.md`
5. `docs/VERDANT_RESEARCH_CONTRACT_V0_1_AMENDMENT.md`
6. `docs/VERDANT_WEBOT_US_CAPABILITY_AUDIT_2026-09-11.md`
7. `docs/NEXT_CHAT_HANDOFF.md`

If an older repository note conflicts with those documents, the newer authority above wins.

### Current one-sentence thesis

> Zenom teaches the product concept; Ocarina-inspired design gives Verdant its visual language; Webot US defines executable constraints; the Verdant Perception Engine mathematically observes the market, compares the present to history, calculates probability/expectancy/risk, produces BUY/WAIT/EXIT plus mathematically derived trade geometry, presents it simply, and then proves whether it deserved trust.

---

## 2. What the old Zenom work is now

The `reference/` directory remains valuable reverse-engineering research. It records publicly observable Zenom Alpha information architecture, interactions, responsive behavior, visual hierarchy, and earlier reconstruction decisions.

Use it as:

- product/UX reference;
- information-architecture research;
- visual-comparison history;
- evidence of patterns worth keeping or rejecting.

Do **not** treat it as current authority that Verdant must preserve:

- Zenom's Telegram/paywall funnel;
- Binance USD-M futures semantics;
- leverage/liquidation/short-position behavior;
- Zenom's performance numbers;
- Zenom's backend contract;
- Zenom's exact route or feature set.

A historical `PRESERVATION_MATRIX.md` row is not allowed to override the current Verdant project-direction or research-contract documents.

Do not delete the reference material merely because the project pivoted. Historical research remains useful.

---

## 3. Current product architecture

Keep these systems conceptually and technically separable:

```text
MarketDataProvider
        |
        v
PerceptionEngine(MarketFrame) -> MarketAssessment
        |
        v
StrategyEngine(MarketAssessment, PortfolioState) -> BUY | WAIT | EXIT
        |
        v
TradeGeometry(MarketAssessment, StrategyState) -> Entry / Stop / Targets / Size
        |
        v
PaperExecution(Decision, Geometry, MarketState) -> SimulatedFills
        |
        v
Evaluation(Signals, Fills, Outcomes) -> PerformanceEvidence
```

Exchange-specific networking belongs behind adapters. Webot-specific response shapes must not leak throughout the Perception Engine.

The immutable research sequence is:

```text
MarketFrame
  -> FeatureVector
  -> MarketAssessment
  -> Decision
  -> TradeGeometry
  -> PaperOrder
  -> PaperFill
  -> Outcome
  -> EvaluationRecord
```

Future outcomes append later; they never rewrite earlier observations or decisions.

---

## 4. Phase and financial boundaries

### Current phase: paper research only

Authorized:

- official public market-data ingestion;
- historical collection/caching;
- mathematical feature extraction;
- model research/backtesting;
- paper fills;
- immutable signal/outcome records;
- Webot public REST adapter;
- read-only venue capability probes.

Not authorized:

- live-money order placement;
- real wallet interaction;
- deposits/withdrawals;
- activating private trading credentials merely to advance implementation;
- leverage/futures/liquidation assumptions;
- executable short positions unless later venue support and project authority explicitly establish them.

Current executable research state machine is spot-first:

```text
FLAT / WAIT -> BUY -> LONG / HOLD -> EXIT -> FLAT / WAIT
```

Bearish evidence can cause WAIT or EXIT. It is not automatically a short trade.

---

## 5. Data integrity — the hard line

Never invent:

- exchange capabilities;
- symbols;
- prices;
- fee schedules;
- historical depth;
- market liquidity;
- fills;
- performance figures;
- probabilities;
- confidence percentages;
- users;
- verification claims.

Every research number must trace to:

- a stored raw market record;
- an explicit equation;
- a versioned policy;
- or a cited/recorded venue fact.

### Time integrity

At decision timestamp `t`:

```text
data_timestamp <= decision_timestamp
```

No future candle values. No full-dataset normalization. No outcome-aware repair. No backfilling an earlier decision after learning what happened.

### Precision

The Webot API documents price/quantity/amount fields as decimal strings. Preserve raw strings at the transport boundary. Do not casually round venue data just because JavaScript uses `number` internally elsewhere.

---

## 6. Current Webot US authority

From current official API documentation:

- base URL: `https://api.webot.com`;
- market type currently documented as `SPOT`;
- public REST endpoints include symbols, recent trades, depth, tickers, and klines;
- documented kline intervals include `15M`, `60M`, and `4H`;
- documented limit: 10 requests/second per IP;
- a current WebSocket endpoint is not documented in the main API reference;
- exact oldest historical candle depth is unresolved and must be probed;
- live `/api/v1/common/symbols` is the authority for the current enabled symbol universe.

Current official Webot US fee schedule observed 2026-09-11:

- taker 0.5% (50 bps) per side;
- maker 0.1% (10 bps) per side.

Fee schedules are versioned inputs because the venue reserves the right to change them.

Do not use maker fees in a simulation without a defensible passive-fill model.

---

## 7. Research-contract implementation rules

`docs/VERDANT_RESEARCH_CONTRACT_V0.md` and amendments define the exact initial protocol. Do not silently optimize or substitute values.

Key V0 locks include:

- 15-minute completed-candle decision cadence;
- completed 1h + 4h context;
- past-only robust rolling median/MAD normalization;
- 4-hour primary outcome horizon;
- transparent score + L2 logistic + historical analogue model tournament;
- conservative same-candle unresolved ordering;
- 0.50% paper-account risk fraction with concentration caps;
- explicit MAE/MFE collection;
- separate prediction vs trade-geometry research;
- chronological exploration/tune/validation/untouched-holdout workflow;
- forward paper before any future live-money consideration;
- default WAIT when qualified models materially disagree.

If evidence later warrants changing a research rule, create a versioned amendment **before** evaluating the new generation. Do not rewrite the old experiment to make history look cleaner.

---

## 8. Explainability and ADHD-first output

Locked product principle:

> **Simple answer. Deep proof.**

The default decision view should make these obvious in fixed positions:

1. What is the call?
2. How strong is it?
3. Where can I enter?
4. What is the do-not-chase price?
5. Where is the stop / where is the thesis wrong?
6. Where are the targets?
7. How risky is it?
8. What does history say?
9. What is the main warning?
10. What should I do next?

Technical derivation stays one action away under `SHOW THE MATH`.

No dense dashboard may bury the decision. No decorative confidence percentage is allowed.

---

## 9. Original visual direction

The original visual direction remains useful and active where it does not conflict with the product pivot.

Inherit the design *grammar* and atmosphere of Ocarina of Time — Kokiri Forest, Temple of Time stonework, classic equipment-menu hierarchy, fairy-like cyan — without copying Nintendo assets.

Never reproduce:

- Nintendo artwork;
- logos;
- Triforce graphics;
- characters;
- textures/screenshots;
- game UI assets;
- lifted iconography.

Everything ships as original CSS geometry, typography, and original/in-house SVG where appropriate.

### Decoration test

> Does this make the information hierarchy clearer?

If no, do not add it.

---

## 10. Design-system rules

### Palette — use tokens, not raw component hex values

`--vs-bg-deep #08110C` · `--vs-surface #101C14` · `--vs-panel #17241A` · `--vs-moss #233524`
`--vs-kokiri #3E8F47` · `--vs-emerald #59D36B` · `--vs-navi #55DDE0` · `--vs-hylian #315C8C`
`--vs-gold #D5A943` · `--vs-gold-bright #F0C85A` · `--vs-parchment #E8E1C8` · `--vs-stone #9BA796`
`--vs-danger #B93A3A` · `--vs-critical #E45A4F`

Banned: pure black, pure white, electric-purple crypto gradients, rainbow gradients, excessive glassmorphism, generic cyberpunk, glowing borders everywhere.

### Semantic color

| Color | Primary semantic job |
|---|---|
| Navi Cyan | streaming/live, network activity, pending, telemetry, hover/focus illumination |
| Temple Gold | verification, milestones, selected states, achievement/completion |
| Emerald | positive actions, confirmation, healthy/available states |
| Red | danger, failure, destructive action, negative performance |

Do not use every accent at once.

### Typography

- telemetry/data: JetBrains Mono with tabular figures;
- display headings: restrained serif, small caps/wide tracking where appropriate;
- body: humanist sans;
- no novelty medieval body fonts;
- minimum text size 11px;
- avoid fractional font sizes.

### Component language

Beveled/clipped corners, nested rectangular frames, engraved separators, inset panels, gold selection brackets, layered dark-green surfaces, mild noise, deliberate depth.

Do not border everything. Hierarchy should come from spacing -> depth -> typography -> scale -> selective accent -> decoration.

### Motion

100–220 ms. Allowed: small status/data-change illumination, bracket movement, drawers, tab indicators, progress/focus transitions.

Banned: bouncing, floating cards, perpetual shimmer, particles, animated backgrounds, parallax.

Always honor `prefers-reduced-motion`.

### Tokens

Colors, type, spacing, radii, bevel geometry, borders, depth, shadow, glow, duration, focus and selection treatments belong in `src/styles/tokens.css`. Avoid arbitrary one-off values in component CSS.

---

## 11. Accessibility floor

Theme never wins over usability.

Required where applicable:

- keyboard operation of every control;
- visible `:focus-visible`;
- semantic elements rather than clickable divs;
- correct accessible tabs/dialogs;
- focus trap, `Esc`, and focus restore for modal dialogs;
- `aria-live` for status changes that need announcement;
- descriptive control labels;
- no color-only state encoding;
- >=44px touch targets;
- `prefers-reduced-motion` support;
- working 200% zoom;
- no disabling user scaling.

---

## 12. Existing frontend architecture

Current legacy/frontend tree is approximately:

```text
src/
  components/
  hooks/
  lib/
  types/
  fixtures/
  styles/
reference/
scripts/
tests/
```

Do not force the quantitative engine into UI components.

Prefer creating clear new boundaries such as:

```text
src/
  market/
    providers/
    schemas/
  research/
    features/
    models/
    geometry/
    execution/
    evaluation/
    records/
```

Exact folder names may adapt to the actual codebase, but separation of concerns is authority.

Legacy masking/telemetry code may remain while the product transition is underway; do not let it become the new engine architecture.

---

## 13. Validation commands

Existing repository commands:

```bash
npm run dev
npm run build
npm run typecheck
npm run lint
npm run shots
npm run shots:ref
```

Before a code checkpoint, at minimum build, typecheck, and lint must pass when the environment permits.

Quantitative/research code must additionally gain deterministic unit tests for:

- timestamp eligibility;
- candle completion;
- decimal parsing/precision boundaries;
- feature equations;
- rolling normalization without future leakage;
- rate-limit/backoff behavior;
- pagination/deduplication;
- fill/cost accounting;
- intrabar tie rules;
- immutable-record linkage.

Do not claim a test passed unless it actually ran.

---

## 14. Git

- Work on `feature/zenom-reverse-engineering`.
- Never commit directly to `main` unless the user later changes branch authority.
- Do not open or merge a pull request until asked.
- Commit coherent working checkpoints to the existing branch.

---

## 15. Unknowns

Unknown is a legitimate state.

For ordinary implementation unknowns:

- record the uncertainty;
- choose the least destructive/reversible implementation;
- continue.

For research-critical unknowns such as fee schedules, historical depth, candle completeness, or execution semantics:

- do not guess silently;
- mark them unresolved;
- create a probe or versioned assumption;
- preserve the result as research evidence.

---

## 16. Target feel

> *What if the Ocarina of Time pause/inventory interface evolved for 25 years and became a serious quantitative workstation?*

Kokiri Forest atmosphere + Temple of Time seriousness + classic equipment-menu hierarchy + modern quantitative-workstation clarity.

Mysterious, old-world, slightly arcane, technologically sophisticated, readable, precise, tactile, disciplined, original.

Not generic Web3 purple, rainbow gradients, glassmorphism, enormous marketing heroes, wall-to-wall cards, unnecessary glow, fantasy clutter, or direct game imitation.
