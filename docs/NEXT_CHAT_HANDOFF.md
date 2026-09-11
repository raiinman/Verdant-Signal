# Verdant Signal — Next Chat Handoff

**Date:** 2026-09-10  
**Current branch:** `feature/zenom-reverse-engineering`

## Read first

Current project authority is captured in:

1. `docs/VERDANT_PROJECT_DIRECTION_2026-09-10.md`
2. `docs/VERDANT_PERCEPTION_ENGINE_FOUNDATION_2026-09-10.md`

Do not proceed from chat memory alone. Read both files before making architectural decisions.

The Perception Engine Foundation is additive authority created after the project-direction document and captures the mathematical decision architecture, historical-pattern approach, validation philosophy, explainability requirements, and ADHD-first output rules reached in the subsequent design discussion.

## Current state

- Repository baseline exists on `main`.
- Feature branch exists and is the active development lane.
- Zenom Alpha was originally being treated mainly as a reverse-engineering/redesign target.
- The project direction has now been corrected: Verdant Signal should not merely reproduce a dashboard. It should build a real quantitative market-observation and signal engine underneath the UI.
- Webot US is the current exchange constraint, not Binance.
- Current assumption from official Webot US API material: spot-oriented execution semantics, so Verdant must not casually inherit futures/leverage/short assumptions from Zenom.
- Initial execution mode is PAPER ONLY.

## Core architecture now

The missing system is the **Verdant Perception Engine**.

Its north-star workflow is:

> **Observe -> Compare -> Calculate -> Decide -> Verify**

Its job:

1. ingest historical and live market data;
2. freeze the information actually available at decision time;
3. convert raw data into normalized mathematical observations;
4. calculate specialist evidence such as trend, momentum, structure, participation, liquidity, volatility, and risk;
5. identify market regime/context;
6. compare the current normalized state against mathematically similar historical states;
7. calculate score, expectancy, and uncertainty;
8. produce explainable BUY / WAIT / EXIT decisions;
9. apply hard risk/data-quality vetoes where appropriate;
10. paper-execute with realistic costs;
11. journal every signal and result immutably;
12. evaluate whether the approach actually has positive expectancy;
13. forward-paper-test promising models before any live-money consideration.

The intended eventual user interaction is as simple as:

> **"Verdant, look at Solana."**

Verdant should then perform the mathematics underneath and return a concise call plus an optional **Show the Math** breakdown.

## Important design philosophy

Do not begin with opaque machine learning.

Start with a transparent mathematical rules/scoring engine whose decisions can be reproduced and audited. Statistical calibration and ML are later layers if the accumulated data justifies them.

Every mathematical input must have an explicit definition. Every weight, threshold, penalty, veto, and output must be inspectable.

Related indicators must not create fake consensus merely because the same phenomenon was measured several ways. Group correlated evidence into specialist "eyes" and measure incremental value.

Features are hypotheses, not sacred indicators. Every feature must be removable and must earn its place through out-of-sample evidence.

Maintain a future **Feature Graveyard** recording rejected, provisional, and accepted features with reasons so failed ideas are not repeatedly rediscovered.

## Mathematical direction

Conceptually, Verdant observes a state vector:

```text
X_t = [Trend, Momentum, Structure, Participation, Liquidity,
       VolatilityRisk, ResistanceRisk, ...]
```

A first transparent model may take the general form:

```text
VerdantScore = sum(supporting weighted evidence)
               - sum(weighted penalties)
```

The exact weights and thresholds are NOT authority yet.

Raw observations must be normalized using past-only information before combination. A robust rolling median/MAD transform is one candidate, but the final normalization scheme is research work.

Longer term, the score should account for regime:

```text
VerdantScore = f(CurrentMarketState, CurrentRegime)
```

Historical analogue comparison should ask:

> Given what the market looks like right now, what historically tended to happen next?

Current and historical normalized states can be compared with an explicit distance/similarity function, then evaluated against the distribution of subsequent outcomes.

## Expectancy authority

Win rate alone is not the target.

Verdant ultimately cares about positive expectancy after costs:

```text
Expectancy = P(win) * AverageWin
             - P(loss) * AverageLoss
             - TradingCosts
```

The engine can be wrong on many individual calls and still be useful if the long-run expectancy is positive and drawdown/risk remain acceptable.

## Perception / strategy separation

Keep these conceptual systems separate:

```text
PerceptionEngine(MarketFrame) -> MarketAssessment
StrategyEngine(MarketAssessment, PortfolioState) -> BUY | WAIT | EXIT
PaperExecution(Decision, MarketState) -> SimulatedFills
Evaluation(Signals, Fills, Outcomes) -> PerformanceEvidence
```

This separation is important so failures can be diagnosed as perception, threshold, trade-policy, sizing, regime, or execution-cost failures instead of disappearing inside one black box.

## Evaluation authority

Every signal must be recorded, including losses, WAITs, rejected signals, and risk vetoes when useful for research.

Track realistic execution costs and performance metrics such as:

- fees
- spread
- slippage
- win rate
- average win/loss
- profit factor
- expectancy
- account return
- maximum drawdown
- consecutive losses
- performance by regime / asset / timeframe
- historical analogue count
- uncertainty / outcome distribution
- calibration quality once probability-like confidence exists

Keep position return and account return separate.

Avoid look-ahead bias, leakage, unrealistic fills, cherry-picking, and overfitting.

Use chronological development/tuning/validation, walk-forward testing, and a genuinely untouched final holdout. Once a holdout is inspected, it is burned and must not later be described as untouched.

Backtesting must be followed by forward paper trading on live data before any future live-money decision.

The project position is that poor modeling should be attacked with stronger mathematics and experimental controls, not hand-waving.

## Immutable research records

Verdant must never rewrite what it "saw" after learning the result.

Conceptual record sequence:

```text
MarketFrame
FeatureVector
MarketAssessment
Decision
PaperOrder / Fill
Outcome
```

The future outcome is appended later; it must never mutate the earlier perception or decision record.

## Output authority — average-Joe first

The mathematical engine may be sophisticated. The default answer must be readable in seconds.

Default output should consistently answer:

1. **What is the call?** — BUY / WAIT / EXIT
2. **How strong is it?** — Weak / Moderate / Strong
3. **Why?** — concise plain-English reasons
4. **What is the main risk?** — concise conflicting evidence
5. **What does history say?** — comparable setups, observed performance, expectancy/downside as justified
6. **What is the next action?** — one obvious action

Then expose:

> **[ SHOW THE MATH ]**

The expanded view shows specialist scores, penalties, threshold, historical matches, expectancy, and the exact mathematical evidence.

Locked principle:

> **Simple answer. Deep proof.**

## ADHD-first UX authority

Verdant is intentionally designed for an ADHD brain.

This is a product requirement, not merely a visual theme.

Hard rules:

- one dominant decision per screen;
- critical answer understandable at a glance;
- no giant text walls by default;
- fixed placement for recurring information;
- strong visual hierarchy;
- plain language first, technical detail second;
- progressive disclosure;
- immediate feedback and visible state/progress cues;
- one obvious next action;
- decorative styling must guide attention rather than compete with the signal;
- mobile intentionally redesigned rather than shrunk;
- users should not need to remember where important information lives.

Locked principle:

> **Verdant should be understandable at a glance, explorable in depth, and never require the user to remember where the important information lives.**

## Immediate next task — DO THIS BEFORE CODING THE ENGINE

Formalize `docs/VERDANT_RESEARCH_CONTRACT_V0.md`.

That contract must explicitly lock or define the research protocol for:

1. decision cadence / primary timeframe;
2. higher-timeframe context;
3. information allowed at each decision timestamp;
4. canonical initial feature families;
5. exact normalization method;
6. initial regime definitions;
7. exact definition of a successful future outcome;
8. target / stop / maximum-hold methodology;
9. realistic fill assumptions;
10. fee / spread / slippage assumptions;
11. train / tune / validation / holdout chronology;
12. minimum historical sample requirements;
13. historical-analogue similarity metric;
14. threshold-selection protocol;
15. feature acceptance / rejection / ablation protocol;
16. forward-paper validation requirements;
17. simple-output and Show-the-Math reporting schema.

Do not treat any illustrative equation weights, score thresholds, win rates, or confidence percentages from prior discussion as tested facts.

After the research contract is explicit, continue with:

1. verify Webot public API capabilities and limits;
2. define the venue-neutral market-data interface;
3. implement the Webot public-data adapter;
4. define canonical market-data models;
5. build historical collection/cache;
6. build deterministic feature extraction;
7. implement the first transparent mathematical scoring baseline;
8. build the backtest harness;
9. model fees/spread/slippage;
10. create the immutable signal/trade journal;
11. evaluate honestly;
12. add/validate regime detection;
13. add historical analogue comparison;
14. add forward paper trading;
15. then connect the engine to the Verdant terminal UI.

## Frontend direction still valid

The previously established visual direction remains useful:

- dark forest / aged stone / oxidized metal / restrained fantasy geometry;
- Ocarina-of-Time-inspired atmosphere and hierarchy without copying Nintendo assets;
- terminal-first information hierarchy;
- active market state > historical performance > access/sales;
- Navi-like cyan for live/pending data, Temple Gold for verification/milestones, emerald for positive/available states;
- mobile intentionally redesigned rather than shrinking desktop.

Zenom remains a reference for product/workflow ideas, not proof that its claimed profitability can be recreated.

## One-sentence thesis

**Zenom teaches the product concept; Ocarina-inspired design gives Verdant its visual language; Webot US defines executable constraints; the Verdant Perception Engine mathematically observes the market, compares the present to history, calculates expectancy and uncertainty, makes an explainable call, and then proves whether it deserved trust.**
