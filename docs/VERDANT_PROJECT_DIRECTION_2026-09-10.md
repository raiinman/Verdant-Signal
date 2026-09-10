# Verdant Signal — Project Direction

**Date:** 2026-09-10  
**Branch:** `feature/zenom-reverse-engineering`

## Purpose of this document

This file captures the design and engineering decisions reached before implementation so the project does not lose them to chat history.

Verdant Signal is **not** just a visual clone of Zenom Alpha. Zenom Alpha is being studied as a reference for product presentation, workflows, data presentation, and user experience. Verdant Signal should ultimately be a real quantitative market-observation and signal platform with transparent, testable logic underneath the interface.

The central idea is the **Verdant Perception Engine**: the system that acts as the platform's mathematical "eyes + brain" by turning live and historical market data into measurable observations, interpreting those observations, and producing explainable decisions such as BUY, WAIT, or EXIT.

---

# 1. Core project distinction

There are two separate problems:

1. **Frontend / product reverse engineering**
   - Understand how Zenom Alpha presents its terminal, active signals, historical results, access flow, and status information.
   - Reproduce useful interaction patterns and data presentation in an original Verdant Signal interface.
   - Apply the already-defined Verdant visual direction inspired by the atmosphere and hierarchy of Ocarina of Time without copying Nintendo artwork or proprietary assets.

2. **Actual market intelligence**
   - Build a real signal engine that can observe markets mathematically.
   - Generate decisions from measurable evidence.
   - Record every decision and outcome.
   - Test whether the system actually has positive expectancy.

The frontend is only the dashboard. The real product is the engine underneath it.

---

# 2. Execution venue authority

Verdant Signal is being designed around **Webot US**, not Binance.

Reference:

- Webot US: `https://www.webot.com/us/en`
- API base: `https://api.webot.com`
- Official API repository: `Webot-Official/webot-us-open-api`

## Current venue constraint

Webot US currently exposes **spot-market behavior** in its public API documentation.

Therefore Verdant Signal must not assume Binance USD-M/futures semantics.

### Do not assume

- perpetual futures
- margin leverage
- leveraged ROE as the main performance measure
- executable short positions
- derivative liquidation mechanics

### Real executable semantics for Webot US

The platform should primarily reason in terms of:

- BUY
- HOLD / WAIT
- EXIT / SELL
- entry price
- current mark / last price
- target
- stop
- position return
- account return
- realized P&L
- fees

Bearish analysis may exist as a research signal, but it must not be represented as an executable short position unless Webot US later exposes documented support for that behavior.

Exchange access must be placed behind an adapter so another venue can later be added without rewriting the signal engine.

---

# 3. Phase authority

## Phase 1 — research and paper trading only

No live money.

Verdant Signal should first:

- ingest real historical market data
- ingest live public market data
- generate signals
- paper-execute those signals
- model realistic fees and slippage
- record every result
- evaluate whether the strategy has genuine positive expectancy

Live order placement is a later phase and requires separate explicit authorization.

---

# 4. Verdant Perception Engine

The Verdant Perception Engine is the missing core system.

Its purpose is to answer:

> What is the market doing right now, what evidence supports that conclusion, and is there enough evidence to justify an action?

It should not be treated as a magical AI predictor.

It is a quantitative observation and decision system.

## Conceptual pipeline

```text
RAW MARKET DATA
      |
      v
PERCEPTION / FEATURE EXTRACTION
      |
      v
INTERPRETATION
      |
      v
REGIME CONTEXT
      |
      v
SIGNAL SYNTHESIS
      |
      v
RISK MODEL
      |
      v
BUY / WAIT / EXIT
      |
      v
PAPER EXECUTION
      |
      v
TRADE JOURNAL
      |
      v
PERFORMANCE ANALYSIS
      |
      v
MODEL / RULE EVALUATION
```

---

# 5. What the "eyes" observe

Initial perception should use transparent, measurable inputs before introducing machine learning.

Potential observations include:

- price candles / OHLCV
- trade volume
- recent trades
- bid/ask spread
- order-book depth
- bid/ask imbalance
- volatility
- momentum
- moving averages
- trend strength
- support / resistance
- breakouts
- recent market structure
- liquidity
- distance from local highs/lows
- volume confirmation
- trend alignment across multiple timeframes

Not every feature should survive. Each feature must prove that it adds predictive value.

---

# 6. Normalized perception output

Raw data should be converted into normalized observations that can be compared and combined.

Example:

```text
BTC/USDT

Trend strength        +0.74
Momentum              +0.61
Volume confirmation   +0.83
Order-book pressure   +0.42
Volatility risk       -0.27
Breakout quality      +0.76
Liquidity             +0.91
```

The exact normalization scheme remains to be designed and tested.

---

# 7. Explainable scoring

The first useful implementation should be transparent.

Avoid black-box logic where the platform outputs a confidence number with no explanation.

Example:

```text
Signal #00421

BUY triggered because:

+18 trend
+14 volume
+13 structure
+11 momentum
+9 order-book support
-8 volatility
-5 nearby resistance

TOTAL = 52
THRESHOLD = 45
```

The engine should be able to show both evidence **for** and evidence **against** a decision.

Example output:

```text
VERDANT ANALYSIS

BTC/USDT

ACTION       BUY
CONFIDENCE   72%
ENTRY        112,400–112,550
TARGET       114,900
STOP         111,620

SUPPORTING EVIDENCE
+ trend aligned
+ volume confirmation
+ bullish structure
+ acceptable liquidity

CONFLICTING EVIDENCE
- elevated volatility
- nearby resistance
```

All values above are illustrative only.

---

# 8. Avoid simplistic indicator logic

Do not reduce the system to rules such as:

```text
RSI < 30 = BUY
```

Single-indicator rules are too weak to serve as the whole perception system.

The goal is to combine multiple forms of evidence and measure whether the combination improves outcomes.

---

# 9. Market regime detection

A strategy may behave differently in different environments.

The engine should eventually classify market regimes such as:

- trending
- ranging / sideways
- high volatility
- low volatility
- breakout / expansion
- mean-reverting
- illiquid / unstable

A signal that performs well in one regime may fail badly in another.

Regime detection should therefore become a first-class part of the Perception Engine rather than an afterthought.

---

# 10. Specialist / ensemble architecture

A long-term architecture may use several specialized models or scoring systems rather than one giant model.

Example:

```text
                 VERDANT PERCEPTION
                         |
        +----------------+----------------+
        |                |                |
        v                v                v
    TREND EYE       STRUCTURE EYE    LIQUIDITY EYE
        |                |                |
        +----------------+----------------+
                         |
                         v
                    REGIME MODEL
                         |
                         v
                  SIGNAL SYNTHESIS
                         |
                         v
                     RISK MODEL
                         |
                         v
                 BUY / WAIT / EXIT
```

A useful future behavior is explicit model disagreement.

Example:

```text
Trend model      BUY    82%
Momentum model   BUY    73%
Structure model  BUY    77%
Mean reversion   SELL   58%
Liquidity model  BUY    69%

Consensus: BUY 74%
Conflict: mean-reversion model sees overextension
```

The point is not to create impressive-looking percentages. The point is to expose disagreement and evidence honestly.

---

# 11. Development path

The engine should evolve in three levels.

## Level 1 — rules / scoring engine

- transparent indicators and features
- explicit scoring
- fully explainable decisions
- deterministic backtesting

**Feasibility:** high

## Level 2 — statistical engine

- determine which combinations of observations historically added value
- calibrate probabilities
- identify feature usefulness
- identify regime dependence

**Feasibility:** high to moderate

## Level 3 — machine-learning perception

- nonlinear relationships
- richer regime classification
- possibly learned feature interactions
- ensemble models

**Feasibility:** achievable but harder

Machine learning should not be the starting point.

A sophisticated black box that cannot be validated would only produce more convincing nonsense.

---

# 12. Evaluation requirements

Every historical and paper signal should be stored, including losing trades.

The engine must not cherry-pick successful calls.

At minimum evaluate:

- number of signals
- wins
- losses
- win rate
- average winner
- average loser
- profit factor
- expectancy
- cumulative account return
- maximum drawdown
- volatility of returns
- consecutive losses
- fees
- slippage
- spread impact
- liquidity failures
- rejected / skipped signals
- regime-specific performance
- performance by asset
- performance by timeframe

Potential later metrics:

- Sharpe ratio
- Sortino ratio
- calibration error for confidence scores

A large displayed position return is not the same thing as account return. The UI and performance system must keep those concepts separate.

---

# 13. Backtest integrity

Backtests must be designed to avoid self-deception.

The project must account for:

- look-ahead bias
- survivorship bias
- data leakage
- using future candle information accidentally
- unrealistic fills
- ignored spread
- ignored fees
- ignored slippage
- overfitting parameters to one dataset
- repeated tuning against the same test set

Research should use separate training / tuning / validation periods where appropriate.

A strategy is not considered credible merely because it looks profitable on one historical dataset.

---

# 14. Forward paper trading

Historical backtesting is not enough.

After a strategy looks promising historically, Verdant should run it against live market data in paper mode.

Paper trading should record decisions **before** subsequent price movement occurs.

This creates a forward record that is harder to accidentally overfit or rewrite after the fact.

The goal is to accumulate enough real-time observations to determine whether historical performance survives contact with live markets.

---

# 15. Webot data adapter

Create a venue adapter boundary.

Conceptually:

```text
MarketDataProvider
  getSymbols()
  getTicker()
  getCandles()
  getRecentTrades()
  getOrderBook()

ExecutionProvider (later)
  getBalances()
  placeOrder()
  cancelOrder()
  getOrder()
  getFills()
```

The signal engine must not contain Webot-specific networking code directly.

This allows future support for additional venues without rewriting the research system.

---

# 16. Realistic transaction modeling

Paper execution should model the real-world cost of trading.

At minimum:

- maker/taker fees where known
- bid/ask spread
- slippage assumptions
- partial-fill considerations where relevant
- minimum order sizes
- minimum notional rules
- asset precision
- liquidity constraints

A strategy that only works when transaction costs are ignored does not work.

---

# 17. Signal confidence

Confidence should not initially be treated as an arbitrary decorative percentage.

Early versions may expose:

- raw score
- threshold
- evidence count
- agreement / conflict between submodels

Later statistical calibration may map model outputs to empirical probabilities.

Example question to answer empirically:

> Of all historical signals labeled 70% confidence, how often did the defined target outcome actually occur?

If the answer is nowhere near 70%, the confidence system is not calibrated.

---

# 18. Feature usefulness must be measured

Features should be removable.

Example research questions:

- Does order-book imbalance add predictive value after accounting for price and volume?
- Does breakout quality matter only during high-volume regimes?
- Does multi-timeframe trend agreement improve expectancy?
- Does a feature increase win rate but reduce profit factor?
- Is a feature useful only on certain assets?

Verdant should prefer evidence over indicator folklore.

---

# 19. UI implications

The UI must show **why** the system reached a conclusion.

The terminal should eventually present things such as:

- action
- confidence / score
- entry zone
- target
- stop
- current return
- account impact
- market regime
- supporting evidence
- conflicting evidence
- signal age
- model agreement
- historical performance of similar signals

The interface must distinguish:

- live market data
- model interpretation
- hypothetical / paper positions
- actual historical outcomes
- later, real exchange executions

Do not blur those categories.

---

# 20. Relationship to Zenom Alpha

Zenom Alpha is useful as a reference for:

- dashboard information architecture
- active-signal presentation
- status hierarchy
- recent exit presentation
- historical performance views
- access / subscription workflow
- product pacing

It is **not** evidence that its displayed profitability can be reproduced.

Reproducing a dashboard is straightforward.

Reproducing consistently profitable signals is a research problem that must be demonstrated with data.

Verdant Signal should therefore aim to build the actual machine the dashboard implies exists, rather than merely imitating green numbers.

---

# 21. Current project thesis

The project can be summarized as:

> Zenom teaches us the product concept.  
> Ocarina-inspired design gives Verdant its visual language.  
> Webot US defines the currently executable market constraints.  
> The Verdant Perception Engine provides the mathematical observation and decision layer.

---

# 22. Immediate next engineering work

Before spending substantial time polishing the terminal UI, define the Perception Engine research architecture.

Recommended next sequence:

1. Confirm Webot public API capabilities and symbol universe.
2. Define `MarketDataProvider` interface.
3. Implement Webot public-data adapter.
4. Define canonical candle, trade, order-book, ticker, and symbol data structures.
5. Build historical data collection / caching.
6. Build deterministic feature extraction.
7. Define an initial transparent scoring model.
8. Build backtest harness.
9. Build realistic fee/spread/slippage model.
10. Create immutable signal/trade journal.
11. Evaluate the initial model honestly.
12. Add regime detection.
13. Add forward paper-trading runner.
14. Only then decide which advanced statistical or ML methods are justified.
15. Connect the research engine to the Verdant terminal UI.

---

# 23. Non-negotiable principles

- Paper first.
- No live-money execution without a later explicit decision.
- No cherry-picked results.
- Record losses.
- Separate position return from account return.
- Model fees and realistic execution costs.
- Prefer explainability before machine learning.
- Measure whether every feature actually helps.
- Treat market regime as important context.
- Preserve model disagreement instead of hiding it.
- Avoid fake confidence percentages.
- Do not invent Webot capabilities.
- Keep exchange-specific code behind adapters.
- A beautiful dashboard is not evidence of a profitable system.
- The engine must earn credibility through testing.

---

# 24. Open research questions

These remain unresolved and should not be silently assumed:

- Which Webot symbols have sufficient liquidity for useful research?
- What historical depth is available directly through the API?
- What rate limits apply to market-data collection?
- Which timeframes should the first model use?
- What should the first feature set be?
- How should features be normalized?
- How should the first scoring threshold be established?
- What constitutes a successful trade outcome for evaluation?
- What target/stop methodology should be used?
- What position-sizing methodology should be used in paper mode?
- How should confidence be statistically calibrated?
- How much forward-paper history is enough before considering live execution?
- Does order-book data provide stable predictive value at the time horizons Verdant targets?
- Which regime classifier provides useful separation without excessive complexity?

These questions are research work, not reasons to stop implementation.

---

# 25. Status at time of capture

Repository baseline exists on `main`.

Current working branch:

`feature/zenom-reverse-engineering`

The project had been preparing to begin a Zenom Alpha reverse-engineering / visual-redesign pass when the underlying product question was reconsidered.

The current priority is now to preserve the frontend research while explicitly adding the real quantitative Perception Engine as core project architecture.
