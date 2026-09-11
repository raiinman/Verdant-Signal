# Verdant Signal — Perception Engine Foundation

**Date:** 2026-09-10  
**Branch:** `feature/zenom-reverse-engineering`

## Purpose

This document captures the architectural and product decisions reached after the project direction pivot so they do not get lost to chat history.

It is additive authority alongside:

- `docs/VERDANT_PROJECT_DIRECTION_2026-09-10.md`
- `docs/NEXT_CHAT_HANDOFF.md`

If older notes imply that Verdant is primarily a Zenom clone or a decorative signal dashboard, this document overrides that interpretation.

---

# 1. Core thesis

The real product is the **Verdant Perception Engine**.

Verdant should not guess markets, imitate Zenom's profitability claims, or hide behind decorative AI confidence numbers.

Verdant should:

> **Observe -> Compare -> Calculate -> Decide -> Verify**

The engine is a mathematical market-observation and decision system.

The user should eventually be able to say:

> **"Verdant, look at Solana."**

Verdant then:

1. gathers the current market state;
2. converts raw observations into normalized measurements;
3. calculates specialist evidence scores;
4. identifies the current regime/context;
5. compares the present state with mathematically similar historical states;
6. estimates expected outcomes and uncertainty;
7. applies deterministic decision and risk rules;
8. returns a simple `BUY`, `WAIT`, or `EXIT` call;
9. preserves the full math underneath the simple answer;
10. records the call before the future outcome exists so it can later be verified honestly.

The design goal is not mystical prediction. It is measurable evidence and positive expectancy.

---

# 2. Mathematical decision model

The initial Verdant model should be transparent and reproducible with a calculator.

At time `t`, Verdant creates a feature/state vector:

```text
X_t = [T_t, M_t, S_t, P_t, L_t, V_t, R_t, ...]
```

Where initial evidence families may include:

- `T` — trend
- `M` — momentum
- `S` — market structure
- `P` — participation / volume
- `L` — liquidity
- `V` — volatility risk
- `R` — resistance / overextension risk

A first transparent score may take the form:

```text
V_t = w_T*T_t + w_M*M_t + w_S*S_t + w_P*P_t + w_L*L_t
      - w_V*V_t - w_R*R_t
```

The precise weights are **not authority yet**. They must be determined and validated empirically.

The important architectural decision is that:

- every input has a formal mathematical definition;
- every input is normalized to a comparable scale;
- every weight is explicit;
- every penalty is explicit;
- every threshold is explicit;
- every risk veto is explicit;
- every final call can be reproduced from stored inputs.

No hidden model should be allowed to output an unexplained number and call it confidence.

---

# 3. Normalization authority

Raw measurements such as price slope, spread, ATR, volume, order-book imbalance, and distance from resistance live on incompatible scales.

Verdant must normalize observations before combining them.

A candidate robust scheme is:

```text
z = (x - median(x)) / (1.4826 * MAD(x))
N(x) = clip(z, -3, 3) / 3
```

This maps observations conceptually to:

```text
-1.00 = strongly negative / opposing evidence
 0.00 = neutral
+1.00 = strongly positive / supporting evidence
```

The exact normalization scheme remains research work, but two rules are locked:

1. normalization must use **past-only information** at the decision timestamp;
2. normalization must not leak information from future observations or the full dataset.

---

# 4. Specialist "eyes"

Verdant should not treat every indicator as an independent vote.

Related measurements should feed specialist evidence families so correlated indicators do not create fake consensus.

Initial conceptual specialists:

## Trend Eye

May include:

- trend slope
- moving-average relationships
- multi-timeframe alignment
- distance from trend references

## Momentum Eye

May include:

- rate of change
- acceleration / deceleration
- directional persistence

## Structure Eye

May include:

- swing highs/lows
- breakout quality
- support/resistance structure
- compression / expansion
- distance from meaningful levels

## Participation Eye

May include:

- relative volume
- volume expansion / contraction
- confirmation of price movement

## Liquidity Eye

May include, when reliable data exists:

- spread
- depth
- bid/ask imbalance
- recent trade flow

## Volatility / Risk Eye

May include:

- realized volatility
- ATR/range expansion
- overextension
- instability

Each specialist should return its own score and evidence, not disappear inside one opaque total.

Model disagreement is useful information and must be preserved.

---

# 5. Regime matters

The same mathematical observation can behave differently under different market conditions.

Verdant should treat regime as first-class context.

Candidate initial regimes:

- `TRENDING`
- `RANGING`
- `EXPANDING`
- `QUIET`
- `UNSTABLE`

The long-term score is therefore better thought of as:

```text
VerdantScore = f(X_t, Regime_t)
```

rather than one universal formula that assumes all markets behave alike.

For example, momentum evidence may deserve more weight during a clean trend and less weight during a range.

The initial implementation should remain simple enough to audit; regime-specific complexity must be earned by validation.

---

# 6. Historical pattern comparison

A major Verdant capability should be comparing the current market state against mathematically similar historical states.

For historical state `X_i` and current state `X_t`, a simple starting distance measure may be:

```text
d_i = sqrt(sum_j(w_j * (X_tj - X_ij)^2))
```

Smaller distance means the historical state more closely resembles the current normalized market state.

Verdant can then examine what happened after comparable historical states.

The key research question becomes:

```text
P(Y_t | X_t)
```

In plain English:

> Given what the market looks like right now, what historically tended to happen next?

This allows Verdant to surface measures such as:

- number of comparable historical states;
- positive-outcome frequency;
- median subsequent return;
- target-before-stop frequency;
- expected return after costs;
- typical adverse excursion;
- uncertainty / outcome distribution.

Historical similarity is not proof that the future must repeat. It is evidence that can be measured.

---

# 7. Expectancy is a core truth metric

Verdant does not need to predict every trade correctly.

The central question is whether acting on a class of signals produces positive expectancy after realistic costs.

Conceptually:

```text
E = P(W) * AvgWin - P(L) * AvgLoss - Costs
```

Where:

- `P(W)` = probability/frequency of winning outcomes;
- `AvgWin` = average winner;
- `P(L)` = probability/frequency of losing outcomes;
- `AvgLoss` = average loser;
- `Costs` = spread, fees, slippage, and other execution costs.

A lower win-rate system can still be valuable if winners outweigh losers sufficiently.

Verdant must therefore not optimize for win rate alone.

---

# 8. Decision state machine

Because current execution authority is Webot US spot-oriented, Verdant should not casually model executable short positions.

The first strategy state machine should be position-aware:

## When FLAT

Allowed decisions:

- `BUY`
- `WAIT`

## When LONG

Allowed decisions:

- `HOLD / WAIT`
- `EXIT`

A deterministic threshold model may conceptually look like:

```text
if Score >= BuyThreshold and RiskVeto == CLEAR:
    BUY
elif holding_position and ExitCondition == TRUE:
    EXIT
else:
    WAIT
```

The exact thresholds and exit rules remain research questions and must be validated.

---

# 9. Risk vetoes

Some conditions should not merely subtract a few points.

Certain failures should be allowed to veto a trade entirely.

Potential examples:

- spread too wide;
- liquidity too thin;
- market data stale or incomplete;
- execution assumptions invalid;
- volatility beyond the tested operating range;
- symbol outside validated research universe.

This prevents a strong trend score from overpowering an obvious execution or data-quality problem.

---

# 10. Separate Perception from Strategy

This separation is locked conceptually:

```text
PerceptionEngine(MarketFrame) -> MarketAssessment
StrategyEngine(MarketAssessment, PortfolioState) -> BUY | WAIT | EXIT
PaperExecution(Decision, MarketState) -> SimulatedFills
Evaluation(Signals, Fills, Outcomes) -> PerformanceEvidence
```

Why this matters:

If a paper strategy loses money, Verdant must be able to distinguish among:

- poor market perception;
- poor signal threshold;
- bad target/stop policy;
- bad position sizing;
- execution costs;
- liquidity failures;
- regime misclassification.

Combining all of those into one giant black box makes diagnosis nearly impossible.

---

# 11. Immutable observation and outcome records

Verdant must never rewrite what it "saw" after learning what happened next.

Conceptual records:

```text
MarketFrame
FeatureVector
MarketAssessment
Decision
PaperOrder / Fill
Outcome
```

Each record should have timestamps and stable IDs.

The future `Outcome` is appended later. It must not alter the earlier perception or decision record.

This is essential for honest forward validation.

---

# 12. How Verdant prevents mathematical self-deception

The project position is:

> Bad modeling is fought with more rigorous mathematics and stronger experimental controls.

Failure modes and mathematical defenses:

## Bad equations

- compare competing models;
- evaluate out-of-sample;
- reject equations whose apparent edge disappears outside development data.

## Cherry-picked periods

- use chronological windows;
- include different market conditions;
- use walk-forward evaluation;
- report performance by regime and period.

## Misleading thresholds

- evaluate the full threshold/performance curve;
- report signal count, expectancy, and drawdown across thresholds;
- do not select a threshold because one point looks pretty.

## Duplicated indicators

- calculate correlations/covariance;
- test incremental predictive value;
- prevent multiple measurements of the same phenomenon from becoming fake independent votes.

## Future information / leakage

- enforce `data_timestamp <= decision_timestamp`;
- calculate features from past-only data;
- avoid full-dataset normalization;
- enter trades only at a realistically available later price.

## Unrealistic fills

- model bid/ask spread;
- fees;
- slippage;
- depth / liquidity when relevant;
- minimum order rules;
- conservative ordering when a historical candle cannot reveal which intrabar event occurred first.

## Over-optimized weights

- separate development/tuning from evaluation;
- use walk-forward testing;
- test parameter neighborhoods, not just one optimal point;
- penalize unnecessary complexity;
- reject fragile models whose performance collapses under small changes.

---

# 13. Backtest and forward-test authority

Backtesting alone is not sufficient.

The intended research sequence is:

1. historical exploration and feature research;
2. development/tuning on past data;
3. chronological out-of-sample testing;
4. walk-forward validation;
5. final untouched holdout;
6. live forward paper trading;
7. only after sufficient evidence, a separate future decision about live execution.

Once the final holdout has been inspected, it is no longer untouched and must never be represented that way again.

Forward paper signals must be timestamped **before** subsequent market movement occurs.

---

# 14. Feature usefulness must be earned

Verdant starts with hypotheses, not sacred indicators.

Every feature should be removable.

Research should ask questions such as:

- Does trend information add incremental predictive value?
- Does multi-timeframe agreement help after accounting for trend alone?
- Does volume confirmation help only in certain regimes?
- Does order-book imbalance add value beyond price and volume?
- Does a feature improve win rate while worsening expectancy or drawdown?
- Is a feature useful only for certain assets or timeframes?

## Ablation testing

If the model contains:

```text
Trend
Momentum
Structure
Participation
Liquidity
```

remove one family at a time and rerun evaluation.

If removing a feature does not degrade out-of-sample performance, that feature may not be earning its complexity.

---

# 15. Feature Graveyard

Verdant should maintain a durable **Feature Graveyard**.

Every researched feature or indicator should eventually have a status such as:

```text
RSI oversold
REJECTED
Reason: no stable incremental value.

Raw MACD crossover
REJECTED
Reason: redundant with trend/momentum family.

Multi-timeframe alignment
ACCEPTED
Reason: improved out-of-sample expectancy.

Order-book imbalance
PROVISIONAL
Reason: useful on some liquid assets, unstable elsewhere.
```

The purpose is to prevent repeated rediscovery of already-tested weak ideas and to preserve negative research results.

---

# 16. Confidence must be earned, not decorated

Early Verdant should expose:

- raw score;
- threshold;
- evidence strength;
- model agreement/disagreement;
- historical comparable count;
- observed outcome frequency;
- expectancy;
- uncertainty.

It should **not** display something like `93% confidence` unless that percentage has been empirically calibrated.

A future calibrated confidence value should answer:

> Among historical and forward signals assigned approximately this probability, how often did the defined outcome actually occur?

If a displayed 70% class only succeeds 52% of the time, it is not calibrated.

---

# 17. The user's command should stay simple

The ultimate interaction should be as simple as:

> `Look at SOL.`

Verdant handles the complexity underneath.

Conceptual pipeline:

```text
SOL
  |
  v
Collect market state
  |
  v
Normalize observations
  |
  v
Calculate specialist eyes
  |
  v
Determine regime
  |
  v
Compare historical analogues
  |
  v
Calculate score / expectancy / uncertainty
  |
  v
Apply risk vetoes
  |
  v
BUY / WAIT / EXIT
  |
  v
Record before outcome
  |
  v
Verify later
```

---

# 18. Average-Joe output authority

The underlying engine may be mathematically sophisticated. The default output must not be.

Verdant should provide two layers:

## Layer 1 — default simple view

The user should understand the call in seconds.

Example:

```text
SOLANA

CALL: BUY

Strength: Strong
Risk: Medium
Market: Trending Up

Why:
✓ Trend is healthy
✓ Buyers are active
✓ Volume supports the move
✓ Similar historical setups performed well

Watch out:
⚠ Volatility is elevated
⚠ Resistance is nearby

Historical edge:
62% of similar setups were profitable
Expected move: +1.4%
Typical downside: -0.8%

Verdant Score: 68 / 100

[ SHOW THE MATH ]
```

## Layer 2 — Show the Math

Example:

```text
Trend .............. +0.73
Momentum ........... +0.61
Structure .......... +0.82
Participation ...... +0.69
Liquidity .......... +0.87
Volatility penalty . -0.31
Resistance penalty . -0.24

Raw score .......... 0.681
Buy threshold ...... 0.600

Historical matches . 3,912
Observed win rate .. 62.4%
Net expectancy ..... +0.39%
```

The simple view is the product default. The detailed view is always available as proof.

Design principle:

> **Simple answer. Deep proof.**

---

# 19. ADHD-first UX authority

Verdant should be intentionally designed for an ADHD brain.

This is a product requirement, not merely styling.

The first screen should answer immediately:

1. **What is the call?** — BUY / WAIT / EXIT
2. **How strong is it?** — Weak / Moderate / Strong
3. **Why?** — one concise primary reason, with a few supporting bullets at most
4. **What is the danger?** — one concise risk statement
5. **What do I do next?** — one obvious next action

Hard UX principles:

- one dominant decision per screen;
- immediate visual hierarchy;
- no giant text walls by default;
- fixed placement for recurring information;
- plain-language labels first, technical language second;
- progressive disclosure;
- immediate feedback;
- visible progress/state cues;
- no decorative clutter competing with the signal;
- Ocarina-of-Time-inspired atmosphere may guide attention but must not reduce readability;
- mobile should be intentionally redesigned, not merely shrunk;
- the user should not need to remember where critical information lives.

Locked product principle:

> **Verdant should be understandable at a glance, explorable in depth, and never require the user to remember where the important information lives.**

---

# 20. Plain-English translation layer

Verdant should translate technical evidence into ordinary language without changing the underlying math.

Examples:

Instead of:

```text
Bullish market structure with positive order-flow imbalance.
```

Prefer:

```text
Buyers are controlling the move.
```

Instead of:

```text
Multi-timeframe momentum divergence is deteriorating.
```

Prefer:

```text
The upward move is losing strength.
```

The technical definition and source values remain available in `SHOW THE MATH`.

The translation layer must explain the model, not invent a second decision system.

---

# 21. What "numbers don't lie" means for Verdant

Verdant embraces the principle that markets should be approached quantitatively, while recognizing that poor modeling can misuse accurate numbers.

Therefore Verdant's job is not merely to calculate numbers. It must also mathematically test whether the calculations deserve trust.

The project should favor:

- reproducibility;
- calibration;
- uncertainty measurement;
- out-of-sample evidence;
- historical breadth;
- explicit costs;
- transparent equations;
- negative results;
- forward verification.

Verdant should never defend an equation because the team likes it.

If the historical and forward evidence says it does not work, remove or revise it.

---

# 22. Immediate unresolved research contract

Before substantial implementation of the Perception Engine, formalize `VERDANT_RESEARCH_CONTRACT_V0`.

That contract must lock at least:

1. decision cadence / primary timeframe;
2. higher-timeframe context windows;
3. exact market data available at decision time;
4. initial canonical feature families;
5. normalization method;
6. initial regime definitions;
7. exact definition of a successful outcome;
8. target / stop / maximum-hold methodology for research;
9. realistic fill assumptions;
10. fee/spread/slippage assumptions;
11. train/tune/validation/holdout chronology;
12. minimum historical sample requirements;
13. historical-analogue similarity metric;
14. threshold-selection protocol;
15. feature acceptance/rejection protocol;
16. forward-paper validation requirements;
17. reporting schema for both simple and mathematical output.

Until this contract exists, feature weights and thresholds should not be treated as authoritative.

---

# 23. Current north star

Verdant's core workflow is:

```text
MARKET HISTORY + LIVE MARKET STATE
                |
                v
       MATHEMATICAL PERCEPTION
                |
                v
       HISTORICAL COMPARISON
                |
                v
     EXPECTANCY + UNCERTAINTY
                |
                v
        BUY / WAIT / EXIT
                |
                v
        SIMPLE HUMAN OUTPUT
                |
         [SHOW THE MATH]
                |
                v
      IMMUTABLE PAPER RECORD
                |
                v
          FUTURE OUTCOME
                |
                v
       HONEST VERIFICATION
```

The external experience should be simple.

The internal evidence should be rigorous.

The machine should earn trust by being reproducible, inspectable, and willing to prove itself wrong.
