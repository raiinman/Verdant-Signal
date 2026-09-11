# Verdant Signal — Research Contract V0

**Date:** 2026-09-11  
**Branch:** `feature/zenom-reverse-engineering`  
**Status:** ACTIVE V0 RESEARCH AUTHORITY  
**Execution mode:** PAPER ONLY

## Purpose

This contract converts the Verdant Perception Engine design into a falsifiable research protocol.

It is subordinate to, and must be read with:

1. `docs/VERDANT_PROJECT_DIRECTION_2026-09-10.md`
2. `docs/VERDANT_PERCEPTION_ENGINE_FOUNDATION_2026-09-10.md`
3. `docs/VERDANT_TRADE_GEOMETRY_AND_MODEL_RESEARCH_2026-09-10.md`

This file freezes the first research rules before substantial engine implementation. Values in this contract are **V0 research policy**, not claims that they are optimal or that Webot exposes a particular fee, liquidity, or execution characteristic.

If later evidence justifies a change, create a versioned contract amendment. Never silently rewrite a rule after inspecting final holdout results.

---

# 0. Non-negotiable research laws

1. **Past only.** At decision timestamp `t`, every model input must have `data_timestamp <= t`.
2. **Decision before outcome.** Historical and forward decisions are stored before outcome attachment.
3. **Paper only.** No live-money execution is authorized by this contract.
4. **Spot first.** The executable state machine is `FLAT -> BUY -> LONG -> EXIT -> FLAT`.
5. **Costs count.** Fees, spread, slippage, and liquidity constraints are part of expectancy.
6. **WAIT is a valid answer.** Uncertainty, disagreement, inadequate history, or bad execution quality can force WAIT.
7. **No decorative confidence.** Probability means empirically calibrated outcome frequency or it is not displayed as probability.
8. **Holdout means untouched.** Once inspected, a holdout is burned.
9. **Negative results are retained.** Failed features, equations, thresholds, and geometry belong in durable research memory.
10. **Simple answer, deep proof.** The default UI remains cognitively cheap; the complete derivation remains available.

---

# 1. Decision cadence / primary timeframe

## V0 lock

- Primary decision timeframe: **15-minute completed candles**.
- Decision cadence: **once per completed 15-minute candle**.
- A decision is evaluated immediately after the 15-minute candle is final.
- No decision may use the high, low, close, or volume of a candle that was incomplete at the decision timestamp.

## Why V0 starts here

A 15-minute cadence provides substantially more observations than hourly-only research while avoiding the extreme microstructure sensitivity and execution-noise dependence of a 1-minute system. This is a research choice and must later compete with alternatives rather than become folklore.

Secondary timeframe experiments may be added only through a versioned amendment.

---

# 2. Higher-timeframe context

V0 uses two completed-candle context frames:

- **1-hour** context
- **4-hour** context

A 15-minute decision at `t` may use only the most recently **completed** 1h and 4h candles as of `t`.

Higher-timeframe values are context features. They do not authorize a separate execution state machine.

---

# 3. Exact information allowed at each decision timestamp

A V0 `MarketFrame` may contain only information observable no later than the decision timestamp:

- completed 15m OHLCV candles;
- completed 1h OHLCV candles;
- completed 4h OHLCV candles;
- ticker / last trade snapshot timestamped at or before the decision;
- best bid / best ask snapshot when available;
- order-book depth snapshot when available and historically reproducible;
- recent trades when available and historically reproducible;
- symbol metadata known at the time;
- venue minimums / precision known at the time;
- portfolio state known at the time;
- previously generated Verdant records.

Forbidden:

- future candles;
- the final values of an incomplete candle;
- future order-book or trade information;
- full-dataset normalization;
- outcome-derived feature repair;
- revised labels written back into an earlier observation;
- any field whose historical timestamp cannot be established.

When a data source is unavailable historically, it may not be included in a historical model merely because it exists live.

---

# 4. Canonical initial feature families

V0 begins with six canonical evidence families plus regime context:

1. **Trend**
2. **Momentum**
3. **Structure**
4. **Participation**
5. **Liquidity / execution quality**
6. **Volatility / overextension risk**
7. **Regime context**

These are families, not independent votes. Multiple measurements inside one family must be collapsed or otherwise controlled so correlated indicators cannot manufacture fake consensus.

No feature is sacred.

---

# 5. Candidate baseline measurement equations

All price-return calculations use natural log unless otherwise stated.

Let `C_t` be the 15m close at decision candle `t`, `H_t` the high, `L_t` the low, and `V_t` volume.

## 5.1 One-bar log return

```text
r_t = ln(C_t / C_(t-1))
```

## 5.2 Trend slope

Fit ordinary least squares to log close over the last 32 completed 15m bars:

```text
ln(C_i) = a + b*i
```

Baseline trend measurement:

```text
TrendRaw_t = b / max(RV_32, epsilon)
```

where `RV_32` is the standard deviation of one-bar log returns over the same completed window.

## 5.3 Momentum

Eight-bar volatility-scaled return:

```text
MomentumRaw_t = ln(C_t / C_(t-8)) / max(RV_32 * sqrt(8), epsilon)
```

## 5.4 Structure location

Using the prior 20 completed bars **excluding the current decision bar**:

```text
PriorHigh20 = max(H_(t-20) ... H_(t-1))
PriorLow20  = min(L_(t-20) ... L_(t-1))

StructureRaw_t = 2 * (C_t - PriorLow20) / max(PriorHigh20 - PriorLow20, epsilon) - 1
```

Values above `+1` or below `-1` are allowed before normalization and represent closes outside the prior range.

## 5.5 Participation / relative volume

```text
ParticipationRaw_t = ln(V_t / max(median(V_(t-32) ... V_(t-1)), epsilon))
```

## 5.6 Liquidity / spread

When best bid `B_t` and best ask `A_t` exist:

```text
Mid_t = (A_t + B_t) / 2
SpreadBps_t = 10000 * (A_t - B_t) / Mid_t
```

Spread is a risk / execution-quality measurement, not bullish evidence.

Order-book imbalance is **PROVISIONAL** until Webot historical/live availability is verified and reproducible:

```text
Imbalance_t = (BidDepth - AskDepth) / max(BidDepth + AskDepth, epsilon)
```

It may not enter the canonical historical tournament until data-quality requirements are met.

## 5.7 Realized volatility

```text
RV_n = sqrt(sum((r_i - mean(r))^2) / (n - 1))
```

V0 baseline uses `n = 32` completed 15m bars.

## 5.8 True range and ATR

```text
TR_t = max(
  H_t - L_t,
  abs(H_t - C_(t-1)),
  abs(L_t - C_(t-1))
)

ATR_14 = mean(TR over last 14 completed bars)
```

The simple arithmetic ATR is the V0 baseline so its behavior is explicit and reproducible.

## 5.9 Overextension

Let `EMA_32` be a past-only 32-bar exponential moving average.

```text
OverextensionRaw_t = (C_t - EMA_32_t) / max(ATR_14_t, epsilon)
```

Overextension is not automatically bearish; it is supplied to the risk/geometry layer and must prove how it should affect decisions.

---

# 6. Exact normalization method

V0 uses past-only robust rolling normalization for scalar measurements.

For each raw scalar feature `x_t`, reference the **previous 2,880 completed 15m observations** (30 calendar days in a 24/7 market), excluding `x_t` itself.

Minimum normalization history: **960 completed 15m observations**.

```text
m_t   = median(history)
mad_t = median(abs(history - m_t))
scale = 1.4826 * mad_t
```

If `scale > epsilon`:

```text
z_t = (x_t - m_t) / scale
N_t = clip(z_t, -3, +3) / 3
```

If `scale <= epsilon`, the normalized feature is `0` and the degeneracy is logged.

Rules:

- the current observation is excluded from its own normalizer;
- no full-dataset statistics;
- no future re-normalization of stored feature vectors;
- the raw value, median, MAD, clipped z-score, and normalized value are all journaled;
- risk-oriented features retain their semantic direction; the model must not quietly flip signs without recording the transform.

---

# 7. Initial regime definitions

V0 regime is intentionally transparent and split into dimensions rather than one magical label.

## 7.1 Directional efficiency

Over 32 completed 15m bars:

```text
ER_32 = abs(C_t - C_(t-32)) /
        max(sum(abs(C_i - C_(i-1))) for i=t-31..t, epsilon)
```

Using the sign of the 32-bar log-price slope:

- `TREND_UP` if `ER_32 >= 0.35` and slope > 0
- `TREND_DOWN` if `ER_32 >= 0.35` and slope < 0
- `RANGE` if `ER_32 <= 0.20`
- `MIXED` otherwise

These thresholds are V0 regime-definition constants and may be challenged before the final holdout, not optimized against it afterward.

## 7.2 Volatility regime

Compute the past-only percentile rank of `RV_32` against the prior 2,880 15m observations:

- `QUIET`: percentile < 20
- `NORMAL`: 20 <= percentile < 80
- `EXPANDING`: 80 <= percentile < 97
- `UNSTABLE`: percentile >= 97

## 7.3 Liquidity regime

When spread history is available:

- `LIQUIDITY_OK`: SpreadBps below the historical 90th percentile
- `THIN`: SpreadBps at or above the historical 90th percentile

Missing or stale book data is a separate data-quality state, not `LIQUIDITY_OK`.

---

# 8. Exact successful-outcome labels

Verdant stores continuous outcomes first and derives labels from them.

## 8.1 Primary prediction horizon

Primary horizon: **16 completed 15m bars = 4 hours** after the earliest legal simulated entry.

## 8.2 Primary continuous outcome

```text
ForwardNetReturn_4h = simulated_net_return(
  entry = first legal post-decision fill,
  exit = 16th completed 15m close,
  including V0 costs
)
```

## 8.3 Primary binary label

```text
Y_primary = 1 if ForwardNetReturn_4h > 0
            0 otherwise
```

Exactly zero is labeled `0`.

This label exists for comparable model research. Profitability is still judged by expectancy and drawdown, not classification accuracy alone.

## 8.4 Secondary diagnostic horizons

Always record but do not optimize the V0 primary model against:

- 1h = 4 bars
- 8h = 32 bars
- 24h = 96 bars

## 8.5 Geometry outcome labels

For each frozen geometry candidate, separately record:

- target-before-stop;
- stop-before-target;
- neither before maximum hold;
- maximum-hold exit;
- thesis exit;
- emergency/data exit.

Prediction labels and geometry labels must not be conflated.

---

# 9. Candidate-model tournament

The first tournament contains exactly these three baseline candidates:

1. **Equal-family transparent weighted score**
2. **L2-regularized logistic regression**
3. **Historical nearest-neighbor / analogue model**

All candidates use the same frozen state records, primary label, chronology, and cost model.

## 9.1 Transparent-score baseline

The first baseline uses equal family contribution rather than hand-tuned indicator weights.

Directional evidence families:

```text
DirectionalBase = mean(
  TrendNormalized,
  MomentumNormalized,
  StructureNormalized,
  ParticipationNormalized
)
```

Liquidity and volatility remain explicit penalties/veto context rather than being disguised as extra bullish votes.

Any later unequal weights must be learned/tuned under the chronology rules and versioned.

## 9.2 Logistic baseline

- L2 regularization only in V0.
- Regularization strength is selected on the tuning period only.
- Inputs are the same canonical normalized feature-family outputs plus frozen regime encodings.
- No interaction term enters V0 unless separately admitted by the feature protocol.

## 9.3 Analogue baseline

Uses the protocol in Section 10.

## 9.4 Tournament metrics

Primary economic metrics:

- out-of-sample net expectancy per trade;
- cumulative net return;
- maximum drawdown;
- profit factor;
- average winner / average loser;
- signal count and trade count.

Probability / model-quality metrics when applicable:

- Brier score;
- calibration curve / expected calibration error;
- log loss;
- ROC-AUC as a diagnostic only, never the economic objective.

Stability metrics:

- performance by chronological fold;
- performance by asset;
- performance by directional regime;
- performance by volatility regime;
- sensitivity to nearby parameter values;
- degradation from tune to validation;
- forward-paper behavior.

Complexity and explainability are explicit tie-breakers.

## 9.5 Tournament preference rule

A candidate is not eligible to win unless:

- its walk-forward net expectancy is positive;
- at least 60% of completed validation folds have non-negative net expectancy;
- it does not depend on a single asset or single regime for the majority of its edge;
- parameter-neighborhood tests do not show a sharp isolated optimum;
- its complete decision can be reproduced from stored inputs.

Among eligible candidates, prefer the simpler model unless the more complex model demonstrates a material and stable improvement in validation evidence.

The untouched final holdout is not used to pick the winner.

---

# 10. Historical analogue distance / neighbor protocol

## 10.1 State used for distance

V0 analogue distance uses normalized family-level values, not a pile of correlated raw indicators:

```text
A_t = [
  Trend,
  Momentum,
  Structure,
  Participation,
  Volatility,
  Overextension
]
```

Liquidity joins the vector only after historical reproducibility is verified.

## 10.2 Distance

Initial equal-weight Euclidean distance:

```text
d(X, X_i) = sqrt(sum_j((X_j - X_ij)^2))
```

No learned distance weights in the V0 baseline.

## 10.3 Eligibility

An analogue must:

- be strictly earlier than the query decision;
- have a complete outcome window;
- use the same primary timeframe;
- use the same asset for the initial baseline;
- match the same directional regime class;
- not come from a time block already represented by a closer neighbour when its 4h outcome window overlaps that neighbour.

The last rule reduces fake sample size from highly overlapping adjacent states.

## 10.4 Neighbor count

From the eligible non-overlapping pool:

```text
K_target = 200
K_used   = min(200, eligible_count)
```

Minimum for any analogue-based claim: **100** usable neighbours.

Minimum for a `Strong` analogue evidence contribution: **200** usable neighbours.

If fewer than 100 usable neighbours exist:

- analogue evidence is reported as `INSUFFICIENT HISTORY`;
- it may not be converted into a probability claim;
- it may not be used to upgrade a call to BUY.

No recency weighting in V0.

---

# 11. MAE / MFE measurement protocol

For every simulated or forward-paper long trade:

```text
MAE_price = min(low while trade open) - EntryFill
MFE_price = max(high while trade open) - EntryFill
```

Store additionally:

```text
MAE_pct = MAE_price / EntryFill
MFE_pct = MFE_price / EntryFill
MAE_ATR = MAE_price / ATR_14_at_entry
MFE_ATR = MFE_price / ATR_14_at_entry
```

For long trades, MAE is normally <= 0 and MFE >= 0.

The measurement window begins only after the simulated entry is legally available and ends at the actual simulated exit or maximum-hold boundary.

MAE/MFE records are segmented by:

- asset;
- regime;
- model/setup class;
- geometry policy;
- timeframe.

Quantiles may only be surfaced when the relevant cohort meets the minimum sample requirement.

---

# 12. Baseline stop-policy candidates

Stop policies compete independently from prediction models.

V0 candidate families:

## S0 — fixed ATR

Test only this frozen set:

```text
1.0 * ATR_14
1.5 * ATR_14
2.0 * ATR_14
```

For a long:

```text
Stop = Entry - k_stop * ATR_14_entry
```

## S1 — structure stop

```text
Stop = PriorLow20 - 0.25 * ATR_14_entry
```

where `PriorLow20` is known before the decision.

## S2 — empirical MAE stop

When at least 200 comparable historical winning setups exist, test stops derived from the absolute MAE distribution of winners at these frozen candidate quantiles:

```text
75th percentile
85th percentile
90th percentile
```

No stop may be widened after entry merely to avoid recording a loss.

---

# 13. Baseline target-policy candidates

## T0 — R-multiple targets

Given planned risk per unit `R = Entry - Stop`, test:

```text
1.5R
2.0R
3.0R
```

## T1 — ATR targets

Test:

```text
1.5 * ATR_14
2.0 * ATR_14
3.0 * ATR_14
```

above entry.

## T2 — empirical MFE targets

When at least 200 comparable setups exist, test favorable-excursion targets at:

```text
50th percentile MFE
65th percentile MFE
80th percentile MFE
```

Target 2 is displayed only if the chosen geometry policy explicitly contains a second target and its evidence survives validation.

---

# 14. Entry zone / maximum acceptable entry methodology

Verdant does not pretend one exact entry price is sacred.

## 14.1 Reference price

Live paper mode:

```text
ReferenceEntry = first valid best ask observed after the decision record is frozen
```

Historical mode with reliable bid/ask:

- use the first valid post-decision ask.

Historical OHLCV-only fallback:

- use the next 15m bar open as the pre-cost reference;
- then apply the V0 synthetic crossing/slippage model.

## 14.2 EV-by-price curve

For an otherwise valid BUY setup, recalculate historical net expectancy over candidate worse entry prices:

```text
p_n = ReferenceEntry + n * 0.05 * ATR_14_entry
```

for `n = 0..10`.

At each price, recompute:

- stop distance;
- target distance;
- fill costs;
- net expectancy;
- target-before-stop rate;
- risk/reward.

## 14.3 Maximum acceptable entry

`MaxAcceptableEntry` is the highest tested price for which:

1. net expectancy remains > 0 after V0 costs; and
2. the 95% block-bootstrap lower confidence bound of net expectancy is >= 0 when the sample requirement is met; and
3. no risk/liquidity veto fires.

If the confidence-bound requirement cannot be evaluated because of insufficient samples, the output must state that limitation and may not label the entry edge `Strong`.

If `ReferenceEntry > MaxAcceptableEntry`, the call becomes `WAIT — DO NOT CHASE`.

V0 entry zone:

```text
[ReferenceEntry, MaxAcceptableEntry]
```

This simple initial band may later compete with limit/retracement entry policies.

---

# 15. Position-sizing policy for paper mode

Signal quality and account-risk policy remain separate.

V0 paper policy:

```text
RiskFraction = 0.005   # 0.50% of paper account equity
AccountRisk  = AccountEquity * RiskFraction
RiskPerUnit  = abs(Entry - Stop)
RawUnits     = AccountRisk / RiskPerUnit
```

Then cap the resulting spot position:

- maximum single-position notional: **10% of paper account equity**;
- maximum aggregate open notional: **30% of paper account equity**;
- no leverage;
- no short notional;
- respect verified venue minimum notional, quantity step, and precision;
- if minimum executable size would exceed the risk or concentration cap, `WAIT`.

Sizing uses the simulated fill/entry actually available, not the ideal signal price.

The 0.50% risk fraction is a V0 paper research policy, not a recommendation for real-money trading.

---

# 16. Thesis-deterioration EXIT candidates

A long position may exit before stop/target if the thesis disappears.

V0 evaluates these candidate families:

## E0 — no early thesis exit

Geometry resolves only by stop, target, emergency exit, or maximum hold.

## E1 — model edge loss

Exit if the active model's estimated **net expectancy <= 0** for **two consecutive completed decision observations**.

## E2 — state reversal

Exit if both occur:

- primary directional regime becomes `TREND_DOWN`; and
- directional model output no longer qualifies for BUY for two consecutive completed decisions.

Hard data-quality or liquidity emergency rules may override immediately.

Every exit record stores an explicit reason code.

---

# 17. Trailing-stop candidates

V0 compares:

## TR0 — no trailing stop

This is a required baseline.

## TR1 — ATR trailing stop after profit activation

Activation only after the position reaches at least `+1.0R` intratrade.

Thereafter:

```text
CandidateTrail_t = HighestCloseSinceEntry - 1.5 * ATR_14_t
TrailingStop_t   = max(TrailingStop_(t-1), CandidateTrail_t)
```

For a long, the trailing stop never moves downward.

No other trailing variants enter V0 without amendment.

---

# 18. Maximum-hold policy

Primary V0 maximum hold:

```text
16 completed 15m bars = 4 hours after legal entry
```

If no stop, target, thesis exit, or emergency exit occurs first, exit at the first legally available price after the 16th bar completes, including costs.

Secondary 1h/8h/24h horizons remain diagnostics; they do not silently change the V0 trading hold.

---

# 19. Realistic fill assumptions

V0 deliberately separates **verified venue facts** from **research stress assumptions**.

## 19.1 Live paper mode

When valid bid/ask is available:

- marketable BUY starts from ask;
- marketable EXIT starts from bid;
- then apply the slippage model;
- timestamp the quote and fill assumptions.

## 19.2 OHLCV-only historical fallback

- BUY reference: next 15m bar open;
- EXIT reference: first legal later bar price under the event rules;
- add synthetic spread and slippage rather than filling at an impossible frictionless price.

## 19.3 V0 unverified stress assumptions

Until Webot US fee and market-data behavior is formally verified and versioned:

```text
SyntheticTakerFeePerSide = 10 bps
SyntheticSlippagePerSide = 5 bps
SyntheticHalfSpread      = max(measured_half_spread, 2.5 bps)
```

If measured spread exists, measured spread replaces the synthetic minimum whenever it is worse.

These values are **not claims about Webot fees**. They are conservative V0 research assumptions used so the first backtest cannot pretend trading is free.

When official venue facts are verified, preserve both:

- `COST_MODEL_V0_STRESS`
- the later versioned venue-calibrated cost model

so results remain reproducible.

---

# 20. Fee / spread / slippage accounting

Every simulated trade stores cost components separately:

```text
entry_fee
entry_spread_cost
entry_slippage
exit_fee
exit_spread_cost
exit_slippage
other_verified_cost
```

Report both:

- gross return;
- net return after all modeled costs.

Expectancy always uses net outcomes.

---

# 21. Intrabar event ordering / tie-breaking

OHLC candles do not reveal event order inside the bar.

For a **long** trade, if the same unresolved historical candle touches both stop and target and finer data is unavailable:

> **Assume the stop occurred first.**

If an entry and an adverse boundary can both occur in the same unresolved bar, use the adverse legal ordering rather than the optimistic one.

If finer timestamped data exists and is valid for that historical period, use the actual event order instead and store the source resolution.

Never choose the favorable ordering merely because it improves backtest results.

---

# 22. Minimum analogue sample requirements

Locked V0 requirements:

- `< 100` usable non-overlapping analogues: `INSUFFICIENT HISTORY`; no probability claim.
- `100–199`: probability/expectancy may be shown with an explicit limited-sample warning; cannot support `Strong` analogue evidence.
- `>= 200`: eligible for normal analogue evidence and MAE/MFE quantile research.

Cohort-specific MAE/MFE policies also require at least **200** matching historical setups.

Sample count is always displayed in `SHOW THE MATH`.

---

# 23. Train / tune / validation / holdout chronology

For each asset with sufficient history, sort observations chronologically and freeze four non-overlapping eras:

- **0%–45%:** exploration / feature development
- **45%–60%:** tuning / hyperparameter selection
- **60%–80%:** walk-forward validation
- **80%–100%:** final untouched holdout

Rules:

1. Normalizers remain rolling past-only even inside each era.
2. Feature ideas may be generated only from exploration evidence.
3. Hyperparameters and thresholds are selected only with exploration+tuning history available.
4. The 60–80% era is used for honest walk-forward validation and robustness checks.
5. After model/feature/geometry freeze, the 80–100% holdout is run once.
6. Inspecting the holdout burns it. Any subsequent change creates a new research generation and requires a new future holdout boundary; the old one can only be called historical evaluation data.

## Walk-forward fold rule

Within the 60–80% validation era:

- split it into **four chronological equal-duration folds**;
- at each fold, fit only on history preceding that fold;
- evaluate on the fold without future leakage;
- preserve each fold result independently before aggregating.

If an asset does not have enough history to satisfy warmup, sample, and four-fold requirements, it is not eligible for V0 model-selection claims.

---

# 24. Threshold-selection protocol

Thresholds are research parameters, not vibes.

For each model on the tuning period:

1. compute the model's native output for every eligible state;
2. form candidate BUY thresholds at output percentiles:

```text
50, 55, 60, 65, 70, 75, 80, 85, 90, 95
```

3. paper-simulate every threshold under the same frozen cost/geometry baseline;
4. reject thresholds producing fewer than **75 closed tuning trades**;
5. calculate net expectancy, drawdown, profit factor, trade count, and parameter-neighborhood behavior;
6. identify the best eligible region, not a single magic point;
7. choose the **least aggressive threshold** whose tuning expectancy is at least 90% of the best eligible tuning expectancy and whose drawdown is not worse than the best threshold by more than 10% relative.

The selected threshold is then frozen before validation.

No threshold may be retuned using validation or final holdout outcomes.

---

# 25. Feature acceptance / rejection / ablation protocol

Every proposed feature or interaction receives one status:

```text
ACCEPTED
PROVISIONAL
REJECTED
```

## Required test

Compare the current frozen model against an otherwise identical model with the candidate feature added or removed.

Use the same chronology, costs, thresholds protocol, and folds.

## ACCEPTED

A feature may be accepted only if:

- median walk-forward change in net expectancy is positive; and
- a block-bootstrap 90% confidence interval for the expectancy delta has lower bound >= 0; and
- the feature does not worsen maximum drawdown by more than 10% relative unless it delivers a separately documented material expectancy benefit; and
- the effect is not positive only in one isolated fold/asset/regime; and
- its information was genuinely available at decision time.

## PROVISIONAL

Use when the point estimate is useful but sample size, stability, or uncertainty is insufficient for ACCEPTED.

## REJECTED

Reject when:

- incremental expectancy is <= 0 in validation;
- the effect is unstable/reverses across most folds;
- it is redundant and adds no meaningful incremental value;
- it relies on leakage or unreproducible data;
- its complexity is not earned.

Rejected ideas remain documented in the future Feature Graveyard.

---

# 26. Model-disagreement handling

Disagreement is preserved, not averaged away.

For all models that have passed the eligibility gates:

- if all eligible models agree on `WAIT`, output `WAIT`;
- if at least two qualified models exist and they disagree between `BUY` and `WAIT`, default to `WAIT`;
- if any hard risk/data veto fires, output `WAIT` regardless of BUY votes;
- no `BUY` may be upgraded merely by averaging incompatible scores;
- a future dominant-model override requires a versioned amendment supported by validation evidence.

When LONG, disagreement may contribute to thesis-deterioration research but does not automatically force an immediate exit unless the active exit policy says so.

---

# 27. Raw score vs probability vs expectancy vs strength vs risk

These terms are permanently distinct.

## Raw score

A model-native uncalibrated output, e.g. weighted score or logistic logit.

It is **not** a probability unless explicitly calibrated.

## Empirical probability

Observed/calibrated frequency of the frozen primary outcome among comparable predictions.

It must include sample count and calibration evidence.

## Expectancy

Expected **net** return after modeled execution costs:

```text
E = P(win)*AvgWin - P(loss)*AvgLoss - Costs
```

When calculated directly from simulated net outcomes, report the sample mean/median and uncertainty.

## Strength

Strength is an ordinal description of validated edge, not another probability.

For V0, among historically accepted BUY-eligible decisions from the frozen validation model:

- `Weak`: positive net expectancy but below the 50th percentile of accepted-signal expectancy
- `Moderate`: 50th to <80th percentile
- `Strong`: >=80th percentile **and** all applicable sample/calibration gates are met

If insufficient history exists, display `Strength: Unproven`.

## Risk

Risk is separate from strength.

V0 pre-trade market/execution risk uses the worst percentile among:

- realized-volatility percentile;
- spread percentile when available;
- absolute stop distance / price percentile within the historical candidate set.

Classification:

- `Low`: worst percentile < 60
- `Medium`: 60 to < 85
- `High`: >= 85

Hard veto conditions remain separate and can block a trade regardless of the ordinal risk label.

A strong signal can be high risk. A weak signal can be low risk.

---

# 28. Forward-paper validation requirements

A model that passes the final historical holdout is still not authorized for live money.

Before even considering a separate live-execution decision, the frozen research generation must accumulate all of:

- at least **90 calendar days** of forward paper operation;
- at least **1,000 timestamped eligible decisions**, including WAITs;
- at least **100 closed paper trades** across the validated universe, unless the strategy is intentionally lower-frequency and a later contract amendment predeclares a different requirement before observing outcomes;
- at least **three observed regime classes** represented in forward data;
- positive net forward-paper expectancy;
- 95% block-bootstrap lower bound of forward-paper expectancy >= 0;
- no unresolved data-integrity failures;
- no evidence that realistic costs erase the edge;
- drawdown inside the predeclared research tolerance for the frozen generation;
- probability calibration, if displayed, remains acceptably aligned with observed frequency;
- full immutable journal availability for audit.

Even after these gates, live money requires a separate explicit project decision and authorization.

---

# 29. Simple-output schema

The default call must be readable in seconds and keep information in fixed positions.

```text
{ASSET}

CALL: {BUY | WAIT | HOLD | EXIT}
Strength: {Unproven | Weak | Moderate | Strong}
Risk: {Low | Medium | High}
Market: {regime summary}

Entry:
{entry zone or N/A}

Do not chase above:
{max acceptable entry or N/A}

Stop:
{stop or N/A}

Target 1:
{target or N/A}

Target 2:
{target or N/A}

Risk / Reward:
{value or N/A}

History:
{analogue outcome summary + sample count, or INSUFFICIENT HISTORY}

Expected value after costs:
{net expectancy or UNPROVEN}

Main warning:
{single highest-priority risk/conflict/data warning}

Next action:
{one explicit action}

[ SHOW THE MATH ]
```

Rules:

- no unexplained abbreviations in the default view;
- no decorative probability;
- one main warning, not a wall of warnings;
- WAIT must explain what specifically prevents BUY;
- every price must identify whether it is a signal reference, simulated fill, entry limit, stop, or target;
- paper status must be visually explicit.

---

# 30. `SHOW THE MATH` derivation schema

Every decision should be reproducible from a stored derivation record containing at least:

## Identity and time

- decision ID;
- asset/symbol;
- venue adapter/version;
- decision timestamp;
- source-data timestamps;
- model version;
- research-contract version;
- cost-model version;
- geometry-policy version.

## Raw market measurements

- OHLCV references;
- spread / bid / ask when available;
- feature raw values;
- ATR / realized volatility;
- higher-timeframe references.

## Normalization

For every normalized scalar:

- rolling history window;
- median;
- MAD;
- z-score;
- clipped normalized value;
- degeneracy/missing flags.

## Specialist / family evidence

- trend;
- momentum;
- structure;
- participation;
- liquidity;
- volatility/overextension;
- regime.

## Model outputs

For every qualified model:

- native/raw output;
- selected threshold;
- BUY/WAIT vote;
- empirical probability if valid;
- calibration evidence/sample count;
- model disagreement.

## Historical analogue proof

- exact distance definition/version;
- candidate pool size;
- usable non-overlapping neighbor count;
- K used;
- positive/negative outcome frequency;
- forward net-return distribution;
- MAE distribution;
- MFE distribution;
- target-before-stop frequency when geometry exists;
- uncertainty interval.

## Expectancy

- gross expectancy;
- each modeled cost component;
- net expectancy;
- uncertainty / bootstrap interval;
- relevant sample count.

## Trade geometry

- reference entry;
- entry-zone derivation;
- EV-by-price curve;
- maximum acceptable entry;
- stop policy and formula;
- target policy and formula;
- R multiple / risk-reward;
- maximum hold;
- trailing policy;
- thesis-exit policy.

## Position sizing

- paper account equity;
- risk fraction;
- account risk amount;
- entry;
- stop;
- risk per unit;
- raw units;
- concentration cap;
- venue precision/minimum adjustment;
- final paper units/notional.

## Vetoes and warnings

- stale/missing data;
- insufficient history;
- spread/liquidity veto;
- unstable-volatility veto;
- unsupported symbol/universe;
- model disagreement;
- any other deterministic rejection reason.

## Final result

- `BUY | WAIT | HOLD | EXIT`;
- strength;
- risk;
- main warning;
- next action.

---

# 31. V0 hard vetoes

A V0 BUY is forbidden when any of the following is true:

- source market data is stale under the adapter's verified freshness rule;
- required candle history is incomplete;
- normalization warmup is incomplete for a required feature;
- the symbol is outside the validated research universe;
- the cost model cannot be applied;
- the simulated order violates verified venue minimum/precision rules;
- required position size exceeds concentration/risk limits after minimum-size adjustment;
- volatility regime is `UNSTABLE` until that regime has separately demonstrated validated positive expectancy;
- liquidity is `THIN` until thin-liquidity execution has separately demonstrated validated positive expectancy;
- qualified models materially disagree under Section 26;
- the entry is above `MaxAcceptableEntry`;
- the final selected model has not passed the required validation stage for the mode in which it is being used.

Forward paper may still record what a rejected setup would have done as counterfactual research, but the decision remains WAIT.

---

# 32. Immutable record sequence

V0 research records follow this order:

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

Every object receives:

- stable ID;
- creation timestamp;
- parent/source IDs;
- schema version;
- contract/model version.

`Outcome` is appended later and may never mutate the prior objects.

---

# 33. Feature / model research memory

Create durable project memory for every researched item with:

```text
name
version
status: ACCEPTED | PROVISIONAL | REJECTED
hypothesis
formula / implementation reference
data period
assets
regimes
metrics
ablation result
reason
replacement / follow-up if any
```

A rejected idea is not deleted merely because it failed.

---

# 34. What V0 deliberately does NOT claim

V0 does not claim:

- that 15m is the best timeframe;
- that the baseline features are predictive;
- that equal weights are optimal;
- that logistic regression or nearest neighbors will work;
- that ATR stops are good;
- that a 4h horizon is ideal;
- that 0.50% risk is appropriate for live capital;
- that the synthetic cost assumptions match Webot;
- that order-book imbalance is available/reliable;
- that any displayed example win rate or price from prior discussion is real;
- that Verdant currently has positive expectancy.

The purpose of V0 is to make those questions testable without moving the goalposts.

---

# 35. Immediate next work after this contract

With V0 explicit, proceed in this order:

1. verify current Webot US public API capabilities from official sources;
2. document symbol universe, candle intervals/history depth, trades, order book, ticker, timestamps, rate limits, precision/minimums, authentication boundaries, and actual fee information if officially available;
3. create the `MarketDataProvider` interface;
4. create canonical market-data schemas;
5. implement the Webot public-data adapter;
6. build deterministic V0 feature extraction;
7. build immutable research-record schemas;
8. build the historical dataset/cache path;
9. implement the three-model tournament harness;
10. implement the frozen cost/fill engine;
11. implement geometry candidates separately from prediction;
12. run the first honest research generation.

Do not skip directly to a pretty BUY button.

---

# 36. V0 one-sentence contract

> **Every 15 minutes, using only information that actually existed by that timestamp, Verdant freezes a normalized multi-timeframe market state, compares three transparent model families under the same historical and execution rules, defaults to WAIT when evidence is weak/conflicted, mathematically derives paper trade geometry only for eligible BUYs, records the complete derivation before the future occurs, and judges itself by out-of-sample net expectancy, risk, stability, and forward-paper evidence rather than by attractive backtest screenshots.**
