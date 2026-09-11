# Verdant Signal — Research Contract V0.1 Amendment

**Date:** 2026-09-11  
**Branch:** `feature/zenom-reverse-engineering`  
**Status:** ACTIVE ADDITIVE AUTHORITY  
**Parent:** `docs/VERDANT_RESEARCH_CONTRACT_V0.md`

## Purpose

This amendment corrects the temporary transaction-fee assumption in Research Contract V0 after checking the current official Webot US fee schedule.

The parent contract explicitly required venue facts to be verified and versioned rather than silently substituted. No historical model tournament or forward-paper generation has been run under the superseded placeholder.

## Official source checked

Webot US fee schedule:

- `https://www.webot.com/us/en/fees`
- observed 2026-09-11
- published spot transaction fees at time of observation:
  - **taker: 0.5% = 50 basis points per side**
  - **maker: 0.1% = 10 basis points per side**

Webot states that it reserves the right to change transaction fees. Therefore fee schedules are versioned research inputs and must be stored with an observation timestamp/source.

---

# 1. Superseded V0 clause

This amendment supersedes only the fee portion of Section 19.3 of `VERDANT_RESEARCH_CONTRACT_V0.md`:

```text
SyntheticTakerFeePerSide = 10 bps
```

That 10-bps value was explicitly an unverified stress placeholder. It must not be used as the Webot taker fee.

The V0 synthetic slippage and fallback-spread assumptions remain provisional baselines until execution evidence justifies a later amendment.

---

# 2. Active cost model — marketable/taker baseline

V0.1 marketable execution baseline:

```text
WebotTakerFeePerSide = 50 bps
SyntheticSlippagePerSide = 5 bps
SyntheticHalfSpread = max(measured_half_spread, 2.5 bps)
```

When an actual historical/live spread is measured, use it. The 2.5-bps half-spread value is only an OHLCV/no-book fallback floor and is not a claim about Webot's actual spread.

A marketable round trip therefore begins with **100 bps (1.00%) of published taker fees before spread and slippage**.

The research engine must not disguise this hurdle.

---

# 3. Maker execution is a separate candidate, not a free discount

Published maker fee:

```text
WebotMakerFeePerSide = 10 bps
```

However, Verdant may apply the maker rate in a simulation **only** when the simulated order has a defensible passive-fill model proving that the order rested and was actually fillable as maker liquidity.

Forbidden shortcuts:

- treating every limit order as a maker fill;
- filling a passive order merely because a candle touched the limit;
- assuming queue priority that cannot be supported;
- using the maker fee while modeling an immediately marketable limit order;
- switching a losing taker backtest to maker costs without rebuilding execution assumptions.

Until a maker-fill model exists, the canonical actionable paper baseline remains the taker model.

---

# 4. Required cost-model identity

Every paper fill / backtest trade must carry:

```text
cost_model_id
fee_schedule_id
fee_schedule_observed_at
fee_source
entry_liquidity_role
exit_liquidity_role
entry_fee_bps
exit_fee_bps
measured_or_synthetic_spread
slippage_model_id
```

Initial identifiers:

```text
fee_schedule_id = WEBOT_US_SPOT_2026-09-11
cost_model_id = COST_MODEL_V0_1_WEBOT_TAKER
```

A later fee change creates a new fee schedule ID. Old results remain reproducible under the schedule they actually used.

---

# 5. Research consequence

The fee correction materially raises the burden of proof for a 15-minute / 4-hour spot strategy.

Verdant must not respond by weakening the cost model or optimizing until a pretty result appears.

If the V0 cadence/horizon cannot produce positive out-of-sample expectancy after approximately 1% round-trip taker fees plus spread/slippage, the correct research outcomes include:

- reject the setup/model;
- test lower-turnover signals;
- test a longer holding horizon through a versioned research generation;
- research legitimate passive/maker execution with a real fill model;
- narrow the asset universe to sufficiently liquid/high-opportunity markets;
- or conclude that the venue economics do not support the strategy class.

**The venue does not owe Verdant an edge.**

---

# 6. Authority rule

Where this amendment conflicts with the temporary fee placeholder in `VERDANT_RESEARCH_CONTRACT_V0.md`, **V0.1 wins**.

All other V0 clauses remain active unless separately amended.
