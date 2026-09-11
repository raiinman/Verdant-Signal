# Verdant Signal — Research Contract V0.3 Amendment

**Date:** 2026-09-11  
**Branch:** `feature/zenom-reverse-engineering`  
**Status:** ACTIVE ADDITIVE AUTHORITY  
**Parent:** `docs/VERDANT_RESEARCH_CONTRACT_V0.md`  
**Previous amendments:** `V0.1`, `V0.2`

## Purpose

This amendment incorporates the useful research-process lessons extracted from:

`https://www.reddit.com/r/ai_trading/comments/1wcxwe8/more_or_less_everything_you_need_to_know_about/`

The thread is not authority because of the author's claimed experience, screenshots, or conclusions. Its ideas are adopted only where they strengthen Verdant's existing research contract.

V0.3 adds four major requirements:

1. a **Research Trial Ledger** so Verdant remembers how many hypotheses/variants were tried before a winner was selected;
2. **selection-bias / multiple-testing controls** so a lucky survivor among hundreds of experiments is not mistaken for discovery;
3. an **Edge Health / Model Lifecycle** so validated models must continue earning trust after deployment to forward paper;
4. **return attribution** so Verdant can explain where an apparent edge actually came from and under what conditions it disappears.

This amendment does not authorize live-money execution and does not change the spot-first / paper-only authority.

---

# 1. Research Trial Ledger is mandatory

Verdant must not preserve only successful experiments.

Every serious research variation that can influence model selection must receive a durable trial record before its result is known or immediately when the experiment specification is created.

Conceptual schema:

```text
ResearchGenerationId
HypothesisId
TrialId
ParentTrialId
CreatedAt
Researcher / Agent
DatasetVersion
AvailableDataCutoff
FeatureSet
FeatureInteractions
ModelFamily
Hyperparameters
Thresholds
RegimeDefinitions
OutcomeDefinition
TradeGeometryPolicy
RiskPolicy
CostModelId
BenchmarkSetId
ValidationPlanId
ResultSummary
Decision = ACCEPTED | PROVISIONAL | REJECTED
DecisionReason
```

A rejected experiment remains part of the ledger.

A new threshold, window, interaction, feature combination, normalization choice, regime definition, geometry rule, or model architecture that is inspected for performance counts as a research trial when it could influence the selected system.

Locked rule:

> **Verdant remembers the search path, not just the winner.**

---

# 2. Multiple-testing / selection bias must be measured

If many candidate models, feature combinations, thresholds, windows, or policies are tested, the best observed result becomes increasingly likely to contain luck.

Therefore model evidence must be interpreted in the context of the number and dependence structure of experiments that preceded selection.

At minimum, the research report for a selected model must expose:

```text
TotalSeriousTrialsInGeneration
TrialsInSameModelFamily
TrialsUsingSameHoldoutBoundary
TrialsUsingSameOutcomeDefinition
TrialsUsingSameAssetUniverse
SelectedTrialRank
```

Verdant must not claim that an apparently excellent Sharpe ratio, expectancy, profit factor, or return is strong evidence while hiding that hundreds or thousands of alternatives were searched.

Candidate statistical tools for later implementation include:

- Deflated Sharpe Ratio;
- Probability of Backtest Overfitting;
- bootstrap / permutation null distributions that reproduce the actual selection procedure;
- false-discovery controls where appropriate.

These methods are **research candidates**, not blindly mandatory formulas. Their implementation must match the assumptions and structure of Verdant's experiment process.

The simpler immediate requirement is mandatory now:

> **Count the trials and expose the selection history.**

---

# 3. Holdout discipline extends across research generations

A final holdout is not protected merely because one individual model touched it once.

If researchers repeatedly inspect the same holdout while trying new models, features, thresholds, or geometry policies, the holdout has become part of the research process and is burned.

Therefore every trial record must include:

```text
DataBoundaryId
ValidationEraId
HoldoutId
HoldoutInspectionStatus
```

Rules:

1. a holdout may be inspected only under the predeclared generation policy;
2. any change motivated by holdout performance creates a new research generation;
3. the old holdout becomes historical evaluation data and may not be called untouched again;
4. a new genuinely future or otherwise protected boundary is required for a new final claim;
5. agent parallelism does not create independent holdouts if the agents inspect the same protected era.

Locked rule:

> **A holdout can be overfit by the research organization, not only by an algorithm.**

---

# 4. No single king metric

Verdant must not select models solely by return, win rate, Sharpe ratio, or profit factor.

The existing model tournament metrics remain active and are extended so an accepted research report should include, where meaningful:

```text
NetExpectancy
ExcessReturnVsBenchmark
MaximumDrawdown
DrawdownDuration
ProfitFactor
SharpeRatio
Exposure
Turnover
DecisionCount
ClosedTradeCount
CostBurden
Calibration
ParameterStability
AssetStability
RegimeStability
ForwardPaperPerformance
ResearchTrialCount
```

Probabilistic or deflated Sharpe measures may be added when the research-trial structure supports them.

A metric must always be interpreted with sample size, exposure, dependence, costs, and selection history.

Example:

```text
ProfitFactor = 2.8
ClosedTrades = 12
```

is not equivalent evidence to the same profit factor over a much larger and more diverse set of genuinely eligible opportunities.

Locked principle:

> **Metrics are evidence vectors, not trophies.**

---

# 5. Return attribution is mandatory for accepted models

A model that makes money must explain **where the return came from**.

Verdant's evaluation layer must be able to decompose performance by relevant dimensions, including at least:

- asset;
- market regime;
- volatility regime;
- setup / signal family;
- time period;
- holding horizon;
- cost component;
- exposure / concentration;
- decision type where relevant.

Conceptual report:

```text
TOTAL NET RETURN

By asset:
BTC
SOL
ETH
...

By market regime:
TRENDING
RANGING
EXPANDING
QUIET
UNSTABLE

By setup family:
...

Cost attribution:
GrossEdge
Fees
Spread
Slippage
OtherVerifiedFriction
NetEdge
```

If one narrow subset produces most or all of the apparent edge, Verdant must say so explicitly.

Example interpretation:

> The model is not broadly successful. Most validated expectancy comes from SOL continuation setups in moderate-volatility trending regimes.

That is valuable discovery, not an embarrassment to hide.

Locked rule:

> **Do not call an edge universal when attribution shows it is conditional.**

---

# 6. Operating envelope must be discoverable

Return attribution should feed a formal **validated operating envelope**.

Conceptually:

```text
ValidatedAssets
ValidatedTimeframes
ValidatedRegimes
ValidatedVolatilityRange
ValidatedLiquidityRange
ValidatedSetupFamilies
ValidatedCostRange
```

Verdant may operate only inside the envelope supported by evidence for the current model generation.

Performance outside the envelope may be recorded as research/counterfactual evidence but must not silently inherit validation from another condition.

The operating envelope can expand only through new controlled validation.

---

# 7. Edge Health is a first-class system

A model that passed historical and forward validation is not assumed to retain edge indefinitely.

Market behavior, liquidity, costs, participant behavior, venue characteristics, or the true underlying effectiveness of the model may change.

Verdant therefore needs a separate model-health state in addition to market regime.

Initial conceptual lifecycle:

```text
CANDIDATE
VALIDATED
FORWARD_TESTING
HEALTHY
WATCH
DEGRADING
SUSPENDED
RETIRED
```

This state describes **the health of the model's observed edge**, not the current market regime.

A model can therefore encounter:

```text
MarketRegime = TRENDING
ModelEdgeHealth = DEGRADING
```

These are different facts.

---

# 8. Edge-health measurements

The exact V0.3 health thresholds are not fixed yet. They must be researched and versioned before automatic suspension logic is implemented.

Candidate evidence includes:

- rolling forward-paper net expectancy;
- rolling excess return versus benchmark;
- realized drawdown versus the model's expected drawdown distribution;
- probability-calibration drift;
- win/loss and payoff-ratio drift;
- cost drift;
- spread/slippage drift;
- regime-conditional performance drift;
- asset-conditional performance drift;
- signal frequency drift;
- feature-distribution / covariate drift;
- model disagreement drift;
- change-point / sequential statistical tests where justified.

No single bad week should automatically kill a model, and no long historical backtest should protect a model from sustained forward deterioration.

Locked principle:

> **A validated model does not receive tenure.**

---

# 9. Edge-health actions

Future health-policy research must define deterministic transitions and actions.

Conceptually:

```text
HEALTHY
  -> normal paper operation

WATCH
  -> continue under heightened evidence tracking

DEGRADING
  -> restrict new risk / require stronger qualification / investigate

SUSPENDED
  -> no actionable BUYs; continue observation and counterfactual recording

RETIRED
  -> no production use; preserve full historical evidence
```

The exact actions above are conceptual until a later versioned policy establishes thresholds.

Verdant must not automatically retune a degrading model on recent losses and continue as if nothing happened. Retuning creates a new research generation with new evidence requirements.

---

# 10. Production execution does not invent edge

The thread's claim that a trading robot automates an existing strategy is directionally useful but too narrow for Verdant.

Verdant distinguishes two roles:

## Research system

May generate candidate hypotheses, interactions, models, or explanations.

Those ideas have no authority until tested through the research contract.

## Frozen decision system

May only execute the rules belonging to its validated research generation.

It may not spontaneously change features, thresholds, equations, geometry, or risk policy because recent outcomes look bad or because an AI model proposes a clever adjustment.

Locked principle:

> **Research may discover candidate edge. Production may execute only validated edge.**

---

# 11. Smooth equity does not imply safe risk

Strategies with averaging-down, grid, martingale, pyramiding, or other path-dependent exposure can produce deceptively smooth historical returns while carrying severe tail risk.

V0.3 does **not** add grid or martingale strategies to Verdant.

Instead it establishes a future-scope rule:

Any strategy that mechanically increases exposure after adverse movement, losses, or repeated entries requires separate analysis of:

- maximum capital exposure;
- path dependence;
- loss clustering;
- tail outcomes;
- ruin probability / catastrophic drawdown;
- liquidity during stress;
- gap behavior;
- concentration;
- execution under extreme volatility.

Such strategies may not inherit validation from Verdant's existing bounded-risk spot-long baseline.

---

# 12. Research memory hierarchy

Verdant now has three distinct durable memories:

## Feature Graveyard

Answers:

> Which features/equations/ideas were accepted, provisional, or rejected, and why?

## Research Trial Ledger

Answers:

> What exact experiments did we run while searching for the winner?

## Model Lifecycle / Edge Health

Answers:

> Is an accepted model still behaving like the model we originally validated?

These must remain separate because they answer different questions.

---

# 13. Required implementation additions

The research implementation roadmap should now include:

1. versioned `ResearchGeneration` schema;
2. immutable `ResearchTrial` schema;
3. experiment-count / selection-history reporting;
4. explicit `HoldoutId` and holdout-inspection tracking;
5. return-attribution engine;
6. validated operating-envelope representation;
7. model lifecycle / edge-health state representation;
8. rolling forward evidence aggregation;
9. candidate drift/change-detection research harness;
10. model-suspension policy only after thresholds are explicitly researched and versioned.

Do not block current deterministic feature extraction or market-data work merely because all V0.3 lifecycle machinery is not yet implemented. Add these in the appropriate research/evaluation layers before Verdant is allowed to claim durable edge.

---

# 14. Explicit non-adoptions from the source thread

V0.3 does **not** adopt:

- the author's claimed experience as evidence;
- screenshots/equity curves as proof of edge;
- MT5/VPS-specific architecture as a Verdant requirement;
- any universal Sharpe or profit-factor threshold;
- grid trading as a Verdant strategy;
- martingale sizing as a Verdant strategy;
- the claim that one metric can establish robustness;
- the idea that a model remains valid indefinitely after one successful validation;
- seller/business arguments as relevant evidence for Verdant.

---

# 15. Authority rule

V0.3 strengthens the existing Verdant research philosophy:

> **Verdant must prove not only that a chosen model performed well, but that the process which chose that model was honest, that the edge can be attributed to identifiable conditions, and that the edge continues to exist after selection.**

All V0, V0.1, and V0.2 clauses remain active unless V0.3 explicitly adds to them.
