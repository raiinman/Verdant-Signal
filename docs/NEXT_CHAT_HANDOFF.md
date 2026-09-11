# Verdant Signal — Next Chat Handoff

**Date:** 2026-09-10  
**Current branch:** `feature/zenom-reverse-engineering`

## Read first — current authority

Before making architectural decisions, read these in order:

1. `docs/VERDANT_PROJECT_DIRECTION_2026-09-10.md`
2. `docs/VERDANT_PERCEPTION_ENGINE_FOUNDATION_2026-09-10.md`
3. `docs/VERDANT_TRADE_GEOMETRY_AND_MODEL_RESEARCH_2026-09-10.md`
4. `docs/VERDANT_RESEARCH_CONTRACT_V0.md`
5. `docs/VERDANT_RESEARCH_CONTRACT_V0_1_AMENDMENT.md`
6. `docs/VERDANT_RESEARCH_CONTRACT_V0_2_AMENDMENT.md`
7. `docs/VERDANT_RESEARCH_CONTRACT_V0_3_AMENDMENT.md`
8. `docs/VERDANT_WEBOT_US_CAPABILITY_AUDIT_2026-09-11.md`
9. `docs/VERDANT_REDDIT_VALIDATION_AND_EXECUTION_LESSONS_2026-09-11.md`

Do not proceed from chat memory alone.

The research contract and its amendments are active mathematical/research authority. The Webot audit defines verified venue capabilities. The Reddit lessons document is adversarial supporting research: its controls are useful where incorporated by V0.2, but Reddit claims, thresholds, and profitability screenshots are not evidence.
---

# Current project thesis

Verdant Signal is **not** a Zenom Alpha clone and must not treat Zenom marketing claims as evidence.

- Zenom Alpha is a product/workflow/UI reference.
- Ocarina-of-Time-inspired atmosphere remains the frontend design language without copying Nintendo assets.
- Webot US is the current venue constraint.
- Current venue assumptions are spot-first: do not silently introduce futures leverage, liquidation, or executable short semantics.
- Initial execution mode is **PAPER ONLY**.
- The real product is the **Verdant Perception Engine**.

North star:

> **Observe -> Compare -> Calculate -> Decide -> Verify**

The intended eventual interaction is:

> **"Verdant, look at Solana."**

Verdant should then perform the mathematics underneath and return a concise human-readable call plus an optional `SHOW THE MATH` derivation.

---

# Core system architecture

Keep these systems conceptually separate:

```text
PerceptionEngine(MarketFrame) -> MarketAssessment
StrategyEngine(MarketAssessment, PortfolioState) -> BUY | WAIT | EXIT
TradeGeometry(MarketAssessment, StrategyState) -> Entry / Stop / Targets / Size
PaperExecution(Decision, Geometry, MarketState) -> SimulatedFills
Evaluation(Signals, Fills, Outcomes) -> PerformanceEvidence
```

This separation is important so a failure can be diagnosed as:

- perception failure;
- threshold/model failure;
- regime failure;
- trade-geometry failure;
- position-sizing failure;
- execution-cost/liquidity failure;
- data-quality failure.

Do not combine all of those into one opaque model.

---

# Mathematical direction

At each decision timestamp, freeze an immutable past-only market state:

```text
X_t = [Trend, Momentum, Structure, Participation, Liquidity,
       Volatility, Overextension, RegimeContext, ...]
```

Every input must have an explicit mathematical definition.

Raw values must be normalized using past-only information before they can be combined.

Candidate mathematical tools depend on the question:

- measurement -> returns, slopes, volatility, range, volume, spread, liquidity, structure distances;
- normalization -> robust rolling statistics / percentiles / other past-only transforms;
- similarity -> explicit distance between normalized market states;
- prediction -> transparent probability/statistical models;
- profitability -> expectancy after realistic costs;
- uncertainty -> outcome distributions, calibration, resampling;
- redundancy -> correlation/covariance/incremental-value tests;
- feature selection -> ablation and regularization;
- regime detection -> transparent classification/clustering if justified;
- validation -> chronological OOS, walk-forward, untouched holdout, forward paper.

Locked principle:

> **The question determines the mathematical toolbox; history and forward evidence determine which candidate survives.**

---

# Historical pattern authority

History is Verdant's laboratory.

For each past state, preserve:

```text
X_t -> Y_t
```

The central question is:

```text
P(Y | X)
```

Plain English:

> Given what the market looks like right now, what historically tended to happen next?

A historical-analogue model should be tested using an explicit similarity/distance function between normalized market-state vectors.

Verdant should be able to report:

- comparable historical-state count;
- positive/negative outcome frequency;
- median forward return;
- target-before-stop frequency;
- MAE / MFE distributions;
- expected value after costs;
- uncertainty / dispersion;
- performance by asset / regime / timeframe.

Similarity is evidence, not proof that history must repeat.

---

# Candidate model tournament

Do not assume a single mathematical model is correct.

Initial candidates should include at least:

1. transparent weighted scoring;
2. logistic regression;
3. historical nearest-neighbor / analogue comparison.

Compare all candidates using the same underlying data, outcome definitions, and execution assumptions.

Evaluate more than peak return:

- out-of-sample expectancy;
- drawdown;
- calibration;
- stability across time;
- stability across assets/regimes;
- parameter sensitivity;
- complexity;
- explainability;
- forward-paper performance.

A simpler stable model may be preferred over a more profitable-looking but fragile one.

Preserve model disagreement. Strong disagreement may itself justify `WAIT`.

Do not use decorative confidence percentages.

---

# Expectancy authority

Win rate alone is not the goal.

Core value equation:

```text
Expectancy = P(win) * AverageWin
             - P(loss) * AverageLoss
             - TradingCosts
```

Trading costs include realistic fees, spread, slippage, and other relevant execution friction.

Verdant can be wrong on many individual calls and still be useful if expectancy remains positive and risk/drawdown are acceptable.

---

# Complete call authority — mathematical trade geometry

A useful Verdant call must eventually produce more than direction.

For a valid setup, calculate and explain:

- `BUY / WAIT / EXIT`;
- entry zone;
- maximum acceptable entry / do-not-chase price;
- stop-loss;
- target 1 / target 2 where justified;
- expected upside/downside;
- risk/reward;
- position size under a defined paper account-risk policy;
- early/thesis-invalidated exit conditions;
- trailing-stop behavior if validated;
- maximum holding period when relevant.

Every number must come from an explicit equation, historically justified policy, or validated rule.

No arbitrary `$145 looks about right` behavior.

---

# Stop / target research

A volatility-scaled baseline may be tested:

```text
Stop = Entry - k_stop * ATR
Target = Entry + k_target * ATR
```

This is a baseline only, not final authority.

More important, Verdant must record:

- **MAE — Maximum Adverse Excursion**
- **MFE — Maximum Favorable Excursion**

Use MAE/MFE distributions from comparable historical setups to research:

- how much adverse movement winning setups normally survive;
- where stops sit inside ordinary noise;
- realistic target distances;
- differences by setup / asset / regime.

Stop and target geometry should ultimately compete mathematically rather than be chosen by intuition.

---

# Entry-zone authority

Prefer an acceptable execution range to fake single-price precision.

Research:

```text
EV(price) = expected value if entered at that price
```

As entry gets worse, expectancy should be recalculated.

This creates a defensible maximum acceptable entry and a plain-English output such as:

> **Do not chase above X.**

---

# Position sizing authority

Signal quality and account-risk policy are separate.

Transparent paper baseline:

```text
AccountRisk = AccountValue * RiskFraction
PositionSize = AccountRisk / abs(Entry - Stop)
```

Wider stop -> smaller position.

Narrower stop -> potentially larger position.

Account risk remains bounded, subject to liquidity, venue minimums, precision, and concentration constraints.

The actual paper `RiskFraction` is unresolved and must be explicitly defined rather than assumed.

---

# EXIT authority

EXIT should not mean only target-hit or stop-hit.

Verdant should distinguish:

- stop-loss exit;
- take-profit exit;
- thesis-invalidated exit;
- maximum-hold exit;
- data-quality / emergency exit.

Candidate thesis-deterioration rules may include score falling below an exit threshold or remaining below that threshold for `N` consecutive observations.

Any trailing-stop policy must be explicit and validated.

---

# Spot-first strategy state machine

Under current Webot US authority:

```text
WAIT / FLAT
    -> BUY
    -> HOLD
    -> TAKE PROFIT / EXIT / STOP-LOSS
    -> WAIT / FLAT
```

Do not silently add leveraged short/futures semantics.

---

# Immutable research records

Verdant must never rewrite what it saw after learning the result.

Conceptual record sequence:

```text
MarketFrame
FeatureVector
MarketAssessment
Decision
TradeGeometry
PaperOrder / Fill
Outcome
```

Every record needs timestamps and stable IDs.

The future `Outcome` is appended later and must never mutate the earlier perception/decision/geometry record.

Every signal, loss, WAIT, rejection, veto, exit reason, and meaningful failure should remain research evidence.

---

# Validation authority

Fight bad modeling with stronger mathematics and experimental controls.

At minimum defend against:

- look-ahead bias;
- leakage;
- full-dataset normalization;
- cherry-picked periods;
- duplicated/correlated indicators creating fake consensus;
- unrealistic fills;
- ignored spread/fees/slippage;
- threshold cherry-picking;
- repeated tuning on the same evaluation data;
- fragile optimized weights;
- unresolved intrabar stop/target ordering;
- tiny analogue sample sizes;
- misleading probability/confidence labels.

Use:

1. historical exploration;
2. development/tuning;
3. chronological out-of-sample testing;
4. walk-forward validation;
5. final untouched holdout;
6. live forward paper trading;
7. only then a separate future live-execution decision.

Once a final holdout has been inspected, it is burned and may never again be described as untouched.

---

# Feature Graveyard / research memory

Maintain durable research status for features, equations, interactions, and policies:

```text
ACCEPTED
PROVISIONAL
REJECTED
```

Record why.

Verdant should learn from false BUYs, bad EXITs, bad stops, missed moves, liquidity failures, and rejected ideas.

Research loop:

```text
Prediction -> Outcome -> Error analysis -> Hypothesis -> Test -> Keep/Reject
```

Negative results are valuable project knowledge.

---

# Average-Joe + ADHD-first output authority

Locked principle:

> **Simple answer. Deep proof.**

Default view should be understandable in seconds and keep important information in fixed positions.

A complete call should answer:

1. What is the call?
2. How strong is it?
3. Where can I enter?
4. What is the do-not-chase price?
5. Where is the stop / where are we wrong?
6. Where are the targets?
7. How risky is it?
8. What does history say?
9. What is the one main warning?
10. What is the next action?

Example structure only:

```text
SOLANA

CALL: BUY
Strength: Strong
Risk: Medium

Entry:
$149.80 - $151.10

Do not chase above:
$152.20

Stop:
$146.40

Target 1:
$156.70

Target 2:
$161.30

Risk / Reward:
1 : 2.1

Historical setup:
63% positive
Expected value after costs: +0.48%

Main risk:
High volatility

[ SHOW THE MATH ]
```

All values above are illustrative, not tested facts.

`SHOW THE MATH` should reveal the raw measurements, normalized features, specialist evidence, regime, model outputs, historical analogue count, probability/outcome distribution, expectancy, MAE/MFE, entry derivation, stop/target derivation, size calculation, risk vetoes, model disagreement, and timestamps.

ADHD-first remains a product requirement:

- one dominant decision per screen;
- no dense text wall by default;
- plain language first;
- technical proof one action away;
- fixed information placement;
- strong visual hierarchy;
- immediate state/feedback cues;
- one obvious next action;
- decorative Ocarina-inspired styling must guide attention rather than compete with the decision.

---

# Current implementation status / next authority

`docs/VERDANT_RESEARCH_CONTRACT_V0.md` already exists and is ACTIVE. Do **not** recreate it.

Active amendments:

- `V0.1` replaces the temporary Webot transaction-fee placeholder with the verified fee schedule and versioned cost identity.
- `V0.2` adds benchmark-relative evaluation, pre-execution validity rechecking, execution-health veto states, parameter provenance, and stronger separation of signal confidence from risk sizing.
- `V0.3` adds the Research Trial Ledger, multiple-testing/selection-bias controls, holdout-organization discipline, return attribution, validated operating envelopes, and model Edge Health / lifecycle authority.

The public Webot market-data boundary and initial tests have already been implemented. Continue implementation from the active research contract, amendments, Webot capability audit, and repository state rather than from the older instruction to create the contract.

Before accepting any new feature, equation, threshold, venue assumption, or execution shortcut, check whether it conflicts with V0/V0.1/V0.2/V0.3. External claims remain hypotheses until Verdant validates them itself.

---
# One-sentence thesis

**Zenom teaches the product concept; Ocarina-inspired design gives Verdant its visual language; Webot US defines executable constraints; the Verdant Perception Engine mathematically observes the market, compares the present to history, calculates probability/expectancy/risk, produces BUY/WAIT/EXIT plus mathematically derived trade geometry, presents it simply, and then proves whether it deserved trust.**
