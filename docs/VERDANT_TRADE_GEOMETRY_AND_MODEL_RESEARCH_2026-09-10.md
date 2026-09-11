# Verdant Signal — Trade Geometry and Model Research Authority

**Date:** 2026-09-10  
**Branch:** `feature/zenom-reverse-engineering`

## Purpose

This document captures the continuation of the Verdant Perception Engine design discussion after `VERDANT_PERCEPTION_ENGINE_FOUNDATION_2026-09-10.md`.

It preserves the decisions about:

- how Verdant chooses mathematical tools;
- how candidate mathematical models compete;
- how history is used to discover useful relationships;
- how BUY / WAIT / EXIT is separated from trade geometry;
- how entry ranges, stop-loss, profit targets, trailing logic, and position sizing are derived mathematically;
- how the final output stays simple for an average user and an ADHD-first interface.

This document is additive authority. Illustrative coefficients, prices, probabilities, and thresholds are examples only until validated by the research contract and evidence.

---

# 1. Core principle: the question determines the math

Verdant should not begin by declaring one indicator, equation, or ML model to be correct.

Different mathematical tools answer different questions:

- **Measurement** -> returns, slopes, volatility, range, volume, spread, liquidity, distance from structure;
- **Normalization** -> robust rolling statistics such as median / MAD, percentiles, or other past-only transforms;
- **Similarity** -> explicit distance metrics between normalized market-state vectors;
- **Prediction** -> transparent probability/statistical models;
- **Profitability** -> expectancy after realistic costs;
- **Uncertainty** -> outcome distributions, resampling, calibration, confidence intervals where justified;
- **Redundancy** -> correlation, covariance, incremental-value and ablation tests;
- **Feature selection** -> regularization or explicit removal tests;
- **Regime detection** -> transparent classification or clustering if it proves useful;
- **Validation** -> chronological out-of-sample, walk-forward, untouched holdout, and forward paper trading;
- **Decision** -> deterministic rules around validated model outputs.

The mathematical toolbox is selected from the problem structure. Historical and forward evidence decide which candidate deserves to remain.

---

# 2. Market state representation

At every decision timestamp `t`, Verdant should freeze a state vector containing only information available at or before `t`:

```text
X_t = [Trend, Momentum, Structure, Participation, Liquidity,
       Volatility, Overextension, RegimeContext, ...]
```

Raw measurements are converted into normalized, comparable values using past-only information.

Every state vector must be timestamped and immutable so its later outcome cannot contaminate what Verdant originally saw.

---

# 3. Initial transparent mathematics

The first useful baseline should remain reproducible with ordinary mathematics.

Candidate measurements include:

## Log return

```text
r_t = ln(P_t / P_(t-1))
```

## Trend slope

Estimate a local linear relationship:

```text
P_t = a + b*t
```

The slope `b`, once normalized, contributes evidence about direction and persistence.

## Realized volatility

```text
sigma = sqrt( sum((r_i - mean(r))^2) / (n - 1) )
```

## Robust normalization candidate

```text
z = (x - median(x)) / (1.4826 * MAD(x))
normalized = clamp(z, -3, 3) / 3
```

The exact formulas and windows remain research questions. The locked rule is that all transforms use information available at the decision time only.

---

# 4. History becomes Verdant's laboratory

For each historical timestamp, preserve:

```text
X_t -> Y_t
```

Where `X_t` is the market state and `Y_t` is a later defined outcome.

The central statistical question is:

```text
P(Y | X)
```

Plain English:

> Given what the market looks like now, what historically tended to happen next?

This does not imply deterministic repetition. It creates a measurable empirical distribution that can be tested.

---

# 5. Historical analogue model

Verdant should test a transparent nearest-history approach.

For current state `X` and historical state `X_i`, a candidate weighted distance is:

```text
d(X, X_i) = sqrt( sum_j( w_j * (X_j - X_ij)^2 ) )
```

Closer states are more mathematically similar.

Verdant can then report for the closest valid analogues:

- sample count;
- positive / negative outcome frequency;
- median forward return;
- target-before-stop frequency;
- MAE and MFE distributions;
- expected value after costs;
- dispersion / uncertainty;
- performance by regime, asset, and timeframe.

The similarity metric, feature weights, neighbor count, and minimum sample size must be validated rather than chosen because they look good.

---

# 6. Candidate model tournament

Verdant should not assume one prediction model is best.

The first research tournament should compare several interpretable candidates on the same data, outcomes, and execution assumptions:

1. **Fixed transparent weighted score**
2. **Logistic regression**
3. **Historical nearest-neighbor / analogue model**

Later candidates may include regularized linear models, trees, ensembles, or ML only if simpler models leave useful predictive structure unexplained.

Selection should not be based on the largest backtest return alone.

Compare at least:

- out-of-sample expectancy;
- drawdown;
- calibration;
- stability across time;
- stability across assets / regimes;
- sensitivity to parameter changes;
- complexity;
- explainability;
- forward-paper behavior.

A simpler model with slightly lower peak performance but much better stability may be preferred.

---

# 7. Model disagreement is evidence

Verdant should preserve disagreement among independently useful models.

Example:

```text
Trend specialist ........ BUY
Structure specialist .... BUY
Historical analogues .... BUY
Statistical model ....... BUY
Mean-reversion view ..... WAIT
Liquidity ............... BUY

Consensus: BUY
Conflict: mean-reversion sees overextension
```

If strong models materially disagree, `WAIT` may be the correct action.

Verdant should never hide genuine conflict behind an impressive-looking confidence percentage.

---

# 8. Feature interactions can be discovered from history

The long-term equation may include interactions that are not obvious from individual features.

Illustrative form only:

```text
Score = b0
      + b1*Trend
      + b2*Structure
      + b3*Participation
      - b4*Volatility
      + b5*(Trend * Participation)
      - b6*(Momentum * Volatility)
```

An interaction such as `Trend * Participation` can represent the hypothesis that trend evidence matters more when participation confirms it.

An interaction such as `Momentum * Volatility` can represent the hypothesis that momentum becomes less reliable during extreme volatility.

Such terms must be discovered and retained only through out-of-sample evidence.

---

# 9. Asset- and regime-specific behavior

Verdant should test whether different assets or regimes require materially different relationships.

Examples to investigate:

- SOL may respond differently to momentum than BTC;
- trend evidence may be useful during trending regimes but weak during ranges;
- breakout evidence may fail during extreme volatility;
- liquidity signals may matter more for thinner assets.

Long-term conceptual model:

```text
P(Y | X, Asset, Regime)
```

Do not create asset-specific complexity unless the data proves a stable difference.

---

# 10. Verdant learns from its mistakes

Every false BUY, bad EXIT, missed opportunity, liquidity failure, and veto should remain research evidence.

Research loop:

```text
Prediction
  -> Outcome
  -> Error analysis
  -> New hypothesis
  -> Controlled test
  -> Accept / Reject / Provisional
```

The Feature Graveyard should preserve failed ideas and failed interactions so the project does not repeatedly rediscover them.

---

# 11. Expectancy remains the core trade-value equation

A directional prediction is not enough. Verdant must determine whether acting on that prediction has positive expected value after costs.

```text
E = P(W) * AvgWin - P(L) * AvgLoss - Costs
```

Where costs include realistic spread, fees, slippage, and other relevant execution friction.

Positive win rate alone is not sufficient.

---

# 12. A complete Verdant call includes trade geometry

A useful call is not merely `BUY`.

Verdant should eventually calculate:

- entry zone;
- maximum acceptable entry / do-not-chase level;
- stop-loss;
- one or more profit targets;
- expected upside;
- expected downside;
- risk/reward;
- position size under a defined account-risk policy;
- thesis-invalidation / early-exit rules;
- trailing-stop behavior when justified;
- maximum hold time where relevant.

Every one of these outputs must have an explicit formula, historical rationale, or validated policy.

---

# 13. Volatility-based stop and target baseline

A simple research baseline may use volatility-scaled distances.

Illustrative only:

```text
Stop = Entry - k_stop * ATR
Target = Entry + k_target * ATR
```

This is not final authority. ATR multiples are only a baseline against which stronger historically derived geometry can compete.

The parameters `k_stop` and `k_target` must be chosen through the research protocol rather than intuition or backtest cherry-picking.

---

# 14. MAE and MFE should drive trade geometry research

Verdant should record two important historical quantities for every simulated / paper trade:

## MAE — Maximum Adverse Excursion

The worst movement against the trade while it was open.

## MFE — Maximum Favorable Excursion

The best movement in favor of the trade while it was open.

These distributions help answer:

- how much ordinary adverse movement winning trades usually survive;
- where a stop would merely sit inside normal market noise;
- what profit distance comparable setups usually achieve;
- whether a target is unrealistically ambitious;
- how stop/target geometry changes by asset, regime, or setup class.

A future stop might be based on a chosen historical adverse-excursion quantile, while targets may be informed by favorable-excursion quantiles.

The exact quantiles are research decisions, not fixed authority.

---

# 15. Entry zone and do-not-chase price

Verdant should prefer an **acceptable entry band** over a fake-precision single price.

Conceptually:

```text
EntryZone = [LowerAcceptablePrice, UpperAcceptablePrice]
```

The range may depend on:

- current spread;
- volatility;
- support / structure;
- execution quality;
- expected value deterioration as entry price worsens.

Important research concept:

```text
EV(price) = expected value if the trade is entered at that price
```

The maximum acceptable entry can be defined as the highest price at which the validated setup still clears required expectancy / risk criteria.

This creates a mathematically defensible:

> **Do not chase above X.**

---

# 16. Position sizing is a separate mathematical policy

Verdant should separate signal quality from account-risk policy.

A transparent risk-based baseline is:

```text
AccountRisk = AccountValue * RiskFraction
PositionSize = AccountRisk / abs(Entry - Stop)
```

This means wider-risk trades receive smaller size and narrower-risk trades may receive larger size while keeping maximum planned account loss controlled.

Position sizing must still respect venue minimums, precision, liquidity, and concentration rules.

The initial `RiskFraction` is not yet authority and must be explicitly set in the research contract / paper policy.

---

# 17. EXIT is mathematical, not merely stop-or-target

A long position may need to exit before either fixed boundary if the original evidence materially deteriorates.

Candidate concepts to test:

```text
Exit if VerdantScore < ExitThreshold
```

or a persistence rule:

```text
Exit if VerdantScore < ExitThreshold for N consecutive observations
```

This allows Verdant to distinguish:

- stop-loss exit;
- target / take-profit exit;
- thesis-invalidated exit;
- maximum-hold exit;
- data-quality / emergency exit.

The reason for every exit must be journaled explicitly.

---

# 18. Trailing stop research

A transparent baseline trailing stop may take the form:

```text
TrailingStop_t = max(TrailingStop_(t-1), Price_t - k * ATR_t)
```

For spot-long logic, the trailing stop may move upward as price advances but should not move backward under that policy.

This is only a candidate baseline. It must compete against fixed stops, structure-based stops, and historically derived MAE/MFE policies.

---

# 19. Spot-first state machine remains authority

Under the current Webot US constraint, the research system should remain spot-first:

```text
WAIT / FLAT
    -> BUY
    -> HOLD
    -> TAKE PROFIT / EXIT / STOP-LOSS
    -> WAIT / FLAT
```

Do not silently introduce futures leverage, liquidation, or executable short semantics.

Bearish analysis may inform `WAIT`, `EXIT`, or future research, but not a live short position unless venue support is separately established later.

---

# 20. Average-Joe output now includes trade geometry

The default output must remain simple enough to understand in seconds.

Illustrative structure:

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

All numerical values above are illustrative only.

The default interface should not expose formulas unless requested.

---

# 21. Show-the-Math output

The expanded view should reveal exactly where the recommendation came from, including when available:

- raw market measurements;
- normalization values;
- specialist scores;
- regime classification;
- model outputs;
- historical analogue count;
- win / loss outcome distribution;
- expected value;
- MAE / MFE statistics;
- entry-zone derivation;
- stop derivation;
- target derivation;
- position-size calculation;
- risk vetoes;
- model disagreement;
- data timestamp and decision timestamp.

Locked principle remains:

> **Simple answer. Deep proof.**

---

# 22. ADHD-first implication

The math can become sophisticated underneath, but the user interface must remain cognitively cheap.

The first view should answer, in fixed positions:

1. What is the call?
2. Where can I enter?
3. Where am I wrong / where is the stop?
4. Where are the target(s)?
5. How risky is this?
6. What does history say?
7. What is the one main warning?
8. What should I do next?

Technical evidence stays one action away under `SHOW THE MATH`.

No dense dashboard should be allowed to bury these answers.

---

# 23. Research-contract additions

`docs/VERDANT_RESEARCH_CONTRACT_V0.md` must now explicitly define, in addition to the earlier requirements:

1. candidate baseline measurement equations;
2. candidate model tournament and comparison metrics;
3. exact historical outcome label(s);
4. historical analogue distance / neighbor protocol;
5. MAE / MFE measurement protocol;
6. baseline stop-policy candidates;
7. baseline target-policy candidates;
8. entry-zone and maximum-acceptable-entry methodology;
9. position-sizing policy for paper trading;
10. thesis-deterioration exit candidate(s);
11. trailing-stop candidate(s);
12. maximum-hold policy;
13. tie-breaking when stop and target both occur inside an unresolved historical candle;
14. minimum sample sizes for analogue-based claims;
15. model-disagreement handling;
16. exact distinction among model score, empirical probability, expectancy, strength, and risk;
17. simple-output trade-geometry schema;
18. Show-the-Math derivation schema.

None of these should be silently optimized after seeing final holdout results.

---

# 24. Current mathematical north star

The long-term user interaction remains:

> **"Verdant, look at Solana."**

Internally:

```text
LIVE + HISTORICAL MARKET DATA
            |
            v
      MARKET STATE X_t
            |
            v
  MATHEMATICAL MEASUREMENT
            |
            v
 HISTORICAL + MODEL COMPARISON
            |
            v
 P(OUTCOME) + EXPECTANCY + RISK
            |
            v
      BUY / WAIT / EXIT
            |
            v
       TRADE GEOMETRY
 ENTRY / STOP / TARGET / SIZE
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

The goal is not to make mathematics look impressive.

The goal is to make every consequential number explainable, reproducible, falsifiable, and useful.