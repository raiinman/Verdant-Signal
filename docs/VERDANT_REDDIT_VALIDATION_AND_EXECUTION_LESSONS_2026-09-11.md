# Verdant Signal — Reddit Validation and Execution Lessons

**Date:** 2026-09-11  
**Branch:** `feature/zenom-reverse-engineering`

## Purpose

This document records the useful engineering and research lessons extracted from the Reddit discussion:

`https://www.reddit.com/r/ai_trading/comments/1wceoq0/after_months_of_testing_its_finnaly_done_33_to_85/`

The thread is **not authority for profitability claims, indicator choices, thresholds, or constants**. It is being used as adversarial research: useful criticisms and implementation lessons are retained only where they align with Verdant's existing mathematical and validation architecture.

This document is additive authority alongside:

- `docs/VERDANT_PROJECT_DIRECTION_2026-09-10.md`
- `docs/VERDANT_PERCEPTION_ENGINE_FOUNDATION_2026-09-10.md`
- `docs/VERDANT_TRADE_GEOMETRY_AND_MODEL_RESEARCH_2026-09-10.md`
- `docs/NEXT_CHAT_HANDOFF.md`

---

# 1. Bottom line

The Reddit discussion **does not invalidate the Verdant Perception Engine thesis**.

It strengthens several controls Verdant already needs:

1. benchmark-relative evaluation;
2. execution-friction modeling;
3. stale-signal / validity rechecking;
4. immutable forward evidence;
5. staged historical -> forward-paper -> future-live validation;
6. separation of signal quality from risk sizing;
7. provenance for every important constant and threshold;
8. explicit handling of API / data-feed / order-state failures.

The thread does **not** provide evidence that Zenom's specific indicator set, claimed return, or numerical thresholds should be copied.

Locked interpretation:

> **Useful criticism may change Verdant's research controls. Unsupported Reddit numbers do not become Verdant mathematics.**

---

# 2. The claimed account result is not proof of edge

A short-period account increase such as `$33 -> $85` is an observation, not statistical validation.

Without at least the following, the result cannot establish durable edge:

- trade count;
- holding periods;
- capital exposure;
- leverage, if any;
- maximum drawdown;
- benchmark return over the same interval;
- spread / fees / slippage;
- position-sizing policy;
- market regime;
- number of independent decision opportunities;
- whether parameters were changed during the observation period.

Verdant must never use raw account growth alone as a success metric.

---

# 3. Benchmark-relative truth is mandatory

A profitable Verdant strategy can still be inferior to a simpler alternative.

Example:

```text
Verdant strategy return: +14%
Buy-and-hold return:      +27%
```

The strategy made money but underperformed the obvious passive alternative.

Therefore every meaningful evaluation should include suitable baselines.

Candidate benchmark set:

1. **Cash / no-trade baseline** — did the strategy create positive value at all?
2. **Buy-and-hold** — did active decisions outperform simply holding the asset?
3. **Risk-adjusted buy-and-hold** — did apparent outperformance come only from taking more risk?
4. **Simple transparent momentum/trend baseline** — does Verdant outperform a deliberately dumb rule?
5. **Randomized / null strategy** — are results distinguishable from luck under comparable opportunity constraints?
6. **Previous accepted Verdant model** — did a model change actually improve the engine?

Verdant evaluation should therefore distinguish:

```text
AbsoluteReturn
BenchmarkReturn
ExcessReturn = AbsoluteReturn - BenchmarkReturn
```

and should also compare drawdown, volatility, exposure, turnover, and execution cost where relevant.

Locked principle:

> **A strategy does not earn complexity merely by making money. It must justify itself against simpler alternatives.**

---

# 4. Feature families: useful architecture, not copied indicators

The discussion referenced ideas such as:

- multi-timeframe exhaustion;
- volume behavior;
- open-interest divergence;
- volatility compression.

Verdant should **not** adopt those as proven signals merely because another system claims to use them.

The useful architectural lesson is that market observations should remain grouped into independent evidence families rather than becoming a pile of correlated indicator votes.

This aligns with Verdant's existing specialist-eye architecture:

```text
Structure
Participation
Volatility
Liquidity
Trend
Momentum
Regime / Time Context
```

Additional venue-specific data families may be researched only when the required data actually exists and is reliable.

For example, positioning data such as open interest is not a universal requirement. If the current venue / instrument does not provide a trustworthy field, Verdant must continue operating without pretending the field exists.

Locked principle:

> **Missing optional evidence reduces available information; it must not cause Verdant to fabricate or infer unavailable market data.**

---

# 5. Add a validity gate before execution

A signal may have been valid when calculated and invalid by the time an order could be placed.

Verdant therefore needs an explicit distinction between:

```text
SignalAtDecisionTime
CurrentExecutableState
```

Before a simulated or future live order is accepted, Verdant should re-check whether the original mathematical thesis still holds.

Candidate validity questions:

- Is the market data still fresh?
- Is price still inside the acceptable entry zone?
- Has the do-not-chase level been crossed?
- Has spread widened beyond the tested range?
- Has volatility moved outside the setup's validated operating range?
- Has the feature state changed enough to invalidate the original assessment?
- Has the regime changed?
- Is the original expectancy still positive after the current executable price and costs are substituted?

Conceptually:

```text
Assessment_t0 -> Decision_t0

Before fill at t1:
Revalidate(Assessment_t0, MarketState_t1)

if invalid:
    REJECT / WAIT
else:
    continue to execution gate
```

This allows Verdant to issue:

> **GOOD SETUP — DO NOT ENTER NOW**

when a previously valid setup has become mathematically stale.

---

# 6. Execution friction is part of the decision mathematics

Paper profitability that disappears after realistic friction is not an edge.

Verdant should reason in terms of net executable edge:

```text
NetEdge = PredictedGrossEdge
          - Fees
          - SpreadCost
          - ExpectedSlippage
          - OtherExecutionFriction
```

Latency is not always a fixed direct monetary cost, but it can change the executable state and therefore destroy expected edge indirectly.

A more complete execution check can be represented as:

```text
ExecutableEV = EV(CurrentExecutablePrice)
               - Fees
               - SpreadCost
               - ExpectedSlippage

Execute only if:
ExecutableEV >= RequiredMinimumEV
and ValidityGate == PASS
and RiskGate == PASS
```

The exact formulas, required minimum edge, and slippage model remain research-contract decisions.

No Reddit percentage or fixed cost estimate is authority.

---

# 7. Execution failures are first-class system states

The thread correctly highlights a class of failures that backtests often ignore:

- API request failure;
- rate limiting;
- data-stream disconnect;
- stale subscriptions;
- partial market data;
- delayed acknowledgement;
- order rejection;
- unknown order state;
- stop-loss state divergence;
- duplicate request / retry hazards.

Verdant must not treat infrastructure as an invisible perfect pipe.

Future execution architecture should distinguish at least:

```text
MARKET_DATA_HEALTH
SIGNAL_VALIDITY
ORDER_INTENT
ORDER_SUBMISSION_STATE
BROKER_ACKNOWLEDGEMENT
FILL_STATE
PROTECTIVE_ORDER_STATE
```

A failure in any of these must be journaled and should be allowed to veto further action when truth is uncertain.

Paper mode should simulate relevant failures where practical before future live execution is considered.

Locked principle:

> **When Verdant cannot prove the current execution state, uncertainty is a risk condition, not permission to guess.**

---

# 8. Signal confidence and risk sizing stay separate

The discussion reinforces the existing Verdant rule that model confidence must not directly become permission for larger risk.

These remain separate systems:

```text
Signal qualification:
Does the setup deserve action?

Risk policy:
How much account exposure is allowed if the setup qualifies?
```

Early Verdant should not say:

```text
"The model is 90% confident, therefore size up aggressively."
```

Any future confidence-dependent sizing must first prove that probability estimates are calibrated and that the sizing policy remains robust under estimation error.

Until then, account-risk limits remain independently bounded.

---

# 9. Do not adopt blanket anti-Kelly or pro-Kelly rules

The Reddit discussion contains categorical claims about Kelly-style sizing.

Verdant should adopt neither side as authority.

Kelly-based sizing is highly sensitive to edge and probability estimates. Bad estimates can produce dangerous position sizes. That makes it unsuitable as an automatic early default, but it does not mathematically prove that Kelly methods are universally invalid.

Research status:

```text
Kelly / fractional-Kelly sizing: PROVISIONAL / FUTURE RESEARCH
Flat or bounded risk policy:     BASELINE CANDIDATE
```

Position-sizing approaches must compete under the same drawdown, ruin-risk, calibration, and out-of-sample criteria as other model choices.

---

# 10. Live execution is necessary evidence but not sufficient proof

A useful distinction from the thread:

**Live execution can reveal implementation realities that historical and paper testing miss.**

Examples:

- real latency;
- real spread behavior;
- rejection patterns;
- broker/API failure behavior;
- reconnect behavior;
- practical order-state races;
- real slippage.

But a short live run does not by itself establish statistical edge.

Verdant's staged validation authority remains:

```text
Historical exploration
    -> Development / tuning
    -> Chronological OOS
    -> Walk-forward
    -> Untouched holdout
    -> Live forward paper
    -> Small future live-execution validation if separately approved
    -> Broader production only after evidence survives
```

No stage may retroactively turn an earlier tuned period into untouched evidence.

---

# 11. Immutable evidence ledger is mandatory

The thread reinforces Verdant's existing requirement that every forward decision be frozen before its outcome is known.

A conceptual signal record should preserve:

```text
SignalID
ModelVersion
Asset
DecisionTimestamp
MarketDataTimestamp
FeatureVector
Regime
RawModelOutputs
Decision
EntryZone
DoNotChasePrice
Stop
Targets
ExpectedValueBeforeCosts
ExpectedCosts
ExpectedValueAfterCosts
RiskVetoState
ValidityState
PortfolioState
```

Later records append rather than rewrite:

```text
ExecutionAttempt
Fill / Rejection
ObservedCosts
Outcome
BenchmarkOutcome
ErrorAnalysis
```

Losses, WAITs, rejected entries, stale signals, execution failures, and missed opportunities remain evidence.

Locked principle:

> **Verdant never edits yesterday's prediction to make today's outcome look smarter.**

---

# 12. Parameter and constant provenance

A legitimate equation with an unjustified constant can still produce authoritative-looking nonsense.

Therefore every meaningful threshold, coefficient, cost assumption, timeout, sample minimum, risk fraction, or execution limit should eventually carry provenance conceptually equivalent to:

```text
ParameterName
Value
Units
AppliesTo
Source / Derivation
CalibrationWindow
ValidationWindow
Status: ACCEPTED | PROVISIONAL | REJECTED
LastValidatedAt
ModelVersion
```

Examples include:

- spread limit;
- slippage assumption;
- minimum expected-value threshold;
- analogue neighbor count;
- minimum analogue sample size;
- ATR multiplier;
- position risk fraction;
- signal-staleness window;
- model-disagreement threshold.

Reddit constants and example percentages enter the project only as research hypotheses, never defaults.

---

# 13. Updated conceptual decision pipeline

The Reddit lessons refine Verdant's existing architecture into the following conceptual sequence:

```text
Market Data
    |
    v
Perception Engine
    |
    v
Market Assessment
    |
    v
Strategy Engine
    |
    v
Candidate Decision + Trade Geometry
    |
    v
Validity Gate
    |
    v
Execution-Friction Gate
    |
    v
Risk Gate
    |
    v
Paper Execution / Future Live Execution
    |
    v
Outcome + Benchmark Evaluation
    |
    v
Immutable Evidence Ledger
```

The gates do not replace the Perception Engine. They prevent a mathematically interesting observation from becoming a bad executable action.

---

# 14. Research-contract additions

`docs/VERDANT_RESEARCH_CONTRACT_V0.md` should explicitly define the following in addition to existing handoff requirements:

1. benchmark set for every strategy/model evaluation;
2. definition of excess return and risk-adjusted benchmark comparison;
3. simple/null baseline strategy protocol;
4. randomized/null comparison protocol where statistically appropriate;
5. pre-execution signal-validity / staleness rules;
6. revalidation logic when executable price changes;
7. execution-friction equation and cost components;
8. minimum required net expectancy / edge policy;
9. spread and slippage estimation protocol;
10. API/data-health veto conditions;
11. order-state uncertainty policy;
12. execution-failure journaling schema;
13. parameter/constant provenance schema;
14. model-version freezing for forward signals;
15. benchmark-outcome attachment to every completed forward observation;
16. rule that live execution exposes plumbing reality but does not independently prove statistical edge;
17. explicit separation of signal confidence and account-risk sizing;
18. criteria required before any confidence-dependent position sizing may be researched for production.

---

# 15. What Verdant explicitly rejects from this thread

The following are **not adopted**:

- treating `$33 -> $85` as proof of durable profitability;
- copying Zenom's claimed feature combination as a proven formula;
- assuming open interest or any other venue-specific field is universally available;
- adopting a Reddit user's exact thresholds, latency windows, fee percentages, or execution limits as authority;
- assuming a fixed transaction-cost percentage applies across venues or instruments;
- claiming paper success guarantees live success;
- claiming a short live run proves edge;
- treating Kelly sizing as universally good or universally bad;
- increasing account risk simply because an uncalibrated model reports high confidence.

---

# 16. What this means for the project thesis

Verdant's idea survives intact.

The thread does not reveal a fatal flaw in the core proposition:

> mathematically observe current market state, compare it against historical evidence, estimate outcomes and expectancy, derive trade geometry, present the answer simply, and verify every prediction honestly.

What it does reveal is that a perception model alone is not enough for a trustworthy trading system.

A useful market call must also survive:

```text
benchmark comparison
execution friction
signal staleness
risk policy
infrastructure uncertainty
forward evidence
```

That is not a retreat from the Verdant idea. It is the machinery required to find out whether the idea genuinely works.

---

# 17. Locked takeaway

> **Verdant is not trying to prove that math always wins. Verdant is building a system in which every mathematical claim must survive simpler benchmarks, realistic execution, forward evidence, and immutable records before it earns trust.**
