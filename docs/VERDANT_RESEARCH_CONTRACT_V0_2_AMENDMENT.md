# Verdant Signal — Research Contract V0.2 Amendment

**Date:** 2026-09-11  
**Branch:** `feature/zenom-reverse-engineering`  
**Status:** ACTIVE ADDITIVE AUTHORITY  
**Parent:** `docs/VERDANT_RESEARCH_CONTRACT_V0.md`  
**Previous amendment:** `docs/VERDANT_RESEARCH_CONTRACT_V0_1_AMENDMENT.md`

## Purpose

This amendment incorporates adversarial validation and execution lessons extracted from the Reddit discussion documented in:

`docs/VERDANT_REDDIT_VALIDATION_AND_EXECUTION_LESSONS_2026-09-11.md`

The discussion is not treated as evidence for Zenom profitability, indicator choices, thresholds, or numerical constants. This amendment adopts only controls that reinforce Verdant's existing research architecture.

Where this amendment adds requirements to V0/V0.1, V0.2 is active authority. It does not authorize live-money execution.

---

# 1. Benchmark-relative evaluation is mandatory

Verdant must judge every candidate strategy/model against simpler alternatives, not merely against zero return.

For every evaluation window where the comparison is meaningful, record at least:

```text
StrategyReturn
CashNoTradeReturn
BuyHoldReturn
ExcessVsBuyHold = StrategyReturn - BuyHoldReturn
```

The research harness must also include, where methodologically valid:

- a risk-adjusted buy-and-hold comparison;
- a deliberately simple transparent trend/momentum baseline;
- a randomized/null strategy comparison under comparable opportunity constraints;
- the previously accepted Verdant generation when evaluating a replacement.

Comparison must include more than return. At minimum report:

- net return after modeled costs;
- maximum drawdown;
- realized volatility or equivalent risk measure;
- exposure / time in market;
- turnover / trade count;
- cost burden;
- net expectancy.

Locked rule:

> **A complicated Verdant model does not earn acceptance merely by making money. It must justify its complexity against simpler alternatives.**

---

# 2. Pre-execution validity gate

A mathematically valid decision can become stale before execution.

Before every actionable paper fill, Verdant must revalidate the candidate decision against the most recent executable state.

At minimum the gate checks:

1. required market data is still fresh;
2. current executable price remains inside the accepted entry geometry;
3. `MaxAcceptableEntry` / do-not-chase policy is not violated;
4. spread/liquidity remains inside the validated operating range;
5. volatility has not moved into a vetoed regime;
6. the original thesis has not materially changed under the latest available features;
7. expected value recalculated at the current executable price remains eligible after current modeled costs.

Conceptually:

```text
Decision_t0
    -> Revalidate at t1
    -> PASS: continue
    -> FAIL: WAIT / REJECT
```

A valid research outcome is therefore:

```text
GOOD SETUP — DO NOT ENTER NOW
```

when the original signal survives conceptually but current execution geometry no longer does.

---

# 3. Net executable edge is the operative quantity

The candidate signal's predicted gross edge is not enough.

Verdant must reason from executable expectancy after friction:

```text
ExecutableEV = EV(CurrentExecutablePrice)
               - Fees
               - SpreadCost
               - ExpectedSlippage
               - OtherVerifiedExecutionFriction
```

Latency is not forced into a fake fixed-dollar term. Instead, latency matters when it changes the executable state, causes staleness, worsens price, invalidates the setup, or contributes to execution uncertainty.

The exact minimum required executable edge remains controlled by the active research generation and may not be borrowed from external claims.

---

# 4. Execution-health uncertainty is a veto state

Future paper/live execution architecture must represent infrastructure truth explicitly rather than assume a perfect transport layer.

Track at least these conceptual states:

```text
MarketDataHealth
SignalValidity
OrderIntent
OrderSubmissionState
BrokerAcknowledgementState
FillState
ProtectiveOrderState
```

Relevant failures include:

- request failure;
- rate limiting;
- data-stream disconnect;
- stale or partial data;
- delayed/unknown acknowledgement;
- order rejection;
- duplicate retry hazards;
- uncertain fill state;
- stop/protective-order state divergence.

If Verdant cannot prove the relevant current state, uncertainty is a risk condition and may force `WAIT`, `REJECT`, or emergency handling according to mode.

Every such failure must be journaled as research evidence.

---

# 5. Parameter and constant provenance

Every important numeric policy must have durable provenance rather than exist as an unexplained magic number.

Conceptually store:

```text
ParameterName
Value
Units
AppliesTo
SourceOrDerivation
CalibrationWindow
ValidationWindow
Status = ACCEPTED | PROVISIONAL | REJECTED
LastValidatedAt
ModelVersion
```

This applies to at least:

- fees;
- spread/slippage assumptions;
- signal-staleness limits;
- minimum executable expectancy;
- analogue neighbor/sample thresholds;
- ATR or geometry multipliers;
- risk fractions;
- model-disagreement thresholds;
- execution timeouts or retry limits that affect research outcomes.

External examples, Reddit numbers, marketing values, and conversation examples may enter only as hypotheses until independently justified.

---

# 6. Signal confidence and account-risk sizing remain separate

No position-size increase is authorized merely because a model reports stronger evidence or a high uncalibrated confidence value.

These are independent questions:

```text
Signal qualification: Should this setup be acted on?
Risk policy:          How much exposure is allowed if it qualifies?
```

Any future confidence-dependent sizing policy requires a separate versioned research decision showing that:

- displayed probabilities are empirically calibrated;
- sizing remains robust under probability-estimation error;
- drawdown and ruin-risk behavior remain acceptable out of sample;
- the policy beats a simpler bounded-risk baseline after costs.

Kelly and fractional-Kelly methods remain future research candidates, not defaults and not categorically rejected.

---

# 7. Live execution is operational evidence, not standalone proof of edge

The current contract remains **PAPER ONLY**.

A future live phase, if separately authorized, may reveal realities that historical simulation cannot fully reproduce, including:

- real spread/slippage behavior;
- latency effects;
- rejection patterns;
- reconnect behavior;
- order-state races;
- practical protective-order behavior.

However, a short live run does not independently prove durable statistical edge.

The accepted evidence chain remains:

```text
Historical exploration
-> development/tuning
-> chronological out-of-sample
-> walk-forward
-> untouched holdout
-> frozen forward paper
-> separately authorized small live validation, if ever approved
-> broader production only after evidence survives
```

No live observation may retroactively convert tuned or inspected historical data into untouched evidence.

---

# 8. Immutable evidence must include benchmark and execution context

The existing immutable record sequence remains active and is extended conceptually so completed forward records can attach:

```text
ModelVersion
ValidityGateState
CostModelId
FeeScheduleId
ExecutablePriceAtRevalidation
ExpectedValueBeforeCosts
ExpectedValueAfterCosts
ExecutionHealthState
BenchmarkOutcome
ExcessReturnVsBenchmark
```

Later outcomes append to the frozen decision. They do not rewrite it.

Rejected entries, stale signals, execution failures, WAITs, and counterfactual outcomes remain part of research memory.

---

# 9. Explicit non-adoptions from the Reddit thread

V0.2 does **not** adopt:

- `$33 -> $85` as proof of durable edge;
- Zenom's claimed indicator combination as a proven Verdant formula;
- open interest as a required universal feature;
- any Reddit user's exact thresholds, latency windows, fee percentages, or execution limits;
- a universal transaction-cost percentage across venues/instruments;
- the claim that paper success guarantees live success;
- the claim that a short live run proves statistical edge;
- the claim that Kelly sizing is universally good or universally bad;
- confidence-driven risk expansion without calibrated evidence.

---

# 10. Authority rule

This amendment strengthens the existing Verdant thesis rather than replacing it.

The active interpretation is:

> **Verdant observes, compares, calculates, decides, and verifies — but a candidate call must also survive benchmark comparison, current execution validity, realistic friction, bounded risk policy, infrastructure uncertainty, and immutable forward evidence before it earns trust.**

All V0 and V0.1 clauses remain active unless this amendment explicitly adds to or supersedes them.
