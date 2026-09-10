# Verdant Signal — Next Chat Handoff

**Date:** 2026-09-10  
**Current branch:** `feature/zenom-reverse-engineering`

## Read first

Primary authority captured in:

`docs/VERDANT_PROJECT_DIRECTION_2026-09-10.md`

Do not proceed from chat memory alone. Read that file before making architectural decisions.

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

Its job:

1. ingest market data;
2. convert raw data into measurable features;
3. identify market regime/context;
4. combine multiple forms of evidence;
5. produce explainable BUY / WAIT / EXIT decisions;
6. apply risk rules;
7. paper-execute;
8. journal every signal and result;
9. evaluate whether the approach actually has positive expectancy.

## Important design philosophy

Do not begin with opaque machine learning.

Start with a transparent rules/scoring engine whose decisions can be inspected and audited. Statistical calibration and ML are later layers if the data justifies them.

The engine should eventually support specialist models such as trend, momentum, structure, liquidity, mean-reversion, and regime detection, with visible disagreement rather than hiding conflict behind one arbitrary confidence number.

## Evaluation authority

Every signal must be recorded, including losses.

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

Keep position return and account return separate.

Avoid look-ahead bias, leakage, unrealistic fills, cherry-picking, and overfitting.

Backtesting must be followed by forward paper trading on live data before any future live-money decision.

## Immediate next task

Before heavy UI work, design and implement the Perception Engine research foundation:

1. verify Webot public API capabilities and limits;
2. define the venue-neutral market-data interface;
3. implement the Webot public-data adapter;
4. define canonical market-data models;
5. build historical collection/cache;
6. build deterministic feature extraction;
7. define an initial explainable scoring model;
8. build the backtest harness;
9. model fees/spread/slippage;
10. create an immutable signal/trade journal;
11. evaluate honestly;
12. add regime detection;
13. add forward paper trading;
14. then connect the engine to the Verdant terminal UI.

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

**Zenom teaches the product concept; Ocarina-inspired design gives Verdant its visual language; Webot US defines executable constraints; the Verdant Perception Engine supplies the actual mathematical observation and decision layer.**
