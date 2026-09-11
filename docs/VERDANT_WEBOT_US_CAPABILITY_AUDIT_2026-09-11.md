# Verdant Signal — Webot US Capability Audit

**Date:** 2026-09-11  
**Branch:** `feature/zenom-reverse-engineering`  
**Status:** CURRENT VENUE RESEARCH  
**Scope:** Official Webot US public/trading API documentation plus official fee schedule

## Purpose

Verdant is constrained by what the current venue actually exposes, not by Binance assumptions, Zenom screenshots, or remembered exchange behavior.

This audit records what is currently documented by official Webot sources and separates verified facts from unresolved items that must be probed through the adapter.

Official sources checked:

- Webot US Open API repository: `https://github.com/Webot-Official/webot-us-open-api`
- Main API reference: `https://github.com/Webot-Official/webot-us-open-api/blob/main/webot-openapi.md`
- Webot US fees: `https://www.webot.com/us/en/fees`

The API repository was actively updated on 2026-09-10, one day before this audit.

---

# 1. Verified transport / API facts

## Base API

```text
https://api.webot.com
```

Documented protocol/data format:

- HTTPS
- JSON

Price, quantity, and amount fields are returned as **strings** to preserve precision.

Timestamps are Unix milliseconds.

## Rate limits

Official main API reference currently states:

- all endpoints: **10 requests/second per IP**;
- private endpoints: additionally **10 requests/second per account**;
- exceeding the limit: HTTP `429` and a **60-second ban**.

Verdant's adapter must therefore own throttling/backoff. Research code must not scatter uncontrolled Webot requests throughout the Perception Engine.

---

# 2. Verified public market-data endpoints

Public Common/Market endpoints do not require HMAC signing.

## Symbols / trading-pair configuration

```text
GET /api/v1/common/symbols
```

Can return all symbols or a comma-separated requested list.

Documented fields include:

```text
symbol
type
baseCurrency
quoteCurrency
basePrecision
quotePrecision
amountPrecision
minAmount
minTradeSize
maxTradeSize
minTradeDumping
maxTradeDumping
enable
buyCeiling
sellFloor
```

The API reference says the market `type` currently supports only:

```text
SPOT
```

This reinforces Verdant's current spot-first authority.

The live symbols endpoint—not a static markdown table—is the canonical source for the currently enabled research universe.

## Recent trades

```text
GET /api/v1/market/trades
```

Parameters:

```text
symbol: required
limit: 10–500, default 100
```

Documented output includes:

```text
symbol
tradeId
price
size
side        # taker side BUY or SELL
timestamp
```

Results are documented as descending by time.

## Order-book depth

```text
GET /api/v1/market/depth
```

Parameters:

```text
symbol: required
limit: 1–1000 price levels per side, default 20
```

Output includes:

```text
bids: [price, quantity]
asks: [price, quantity]
updateTime
```

Bids are descending; asks ascending.

This is sufficient for live spread/depth measurements. It does **not** by itself provide historical order-book snapshots, so order-book features remain provisional for the historical tournament until Verdant begins collecting its own immutable snapshots or finds an authoritative historical source.

## 24-hour ticker

```text
GET /api/v1/market/tickers
```

`symbol` is optional. Omitted returns all pairs.

Documented output:

```text
symbol
time
open
close
low
high
volume
amount
count
```

This is a rolling 24-hour market snapshot, not a replacement for candle history.

## Klines / candles

```text
GET /api/v1/market/klines
```

Parameters:

```text
symbol: required
interval: required
endTime: optional millisecond timestamp
limit: 1–500, default 100
```

Documented intervals:

```text
1M
5M
15M
30M
60M
4H
8H
12H
1D
```

Documented candle fields:

```text
time      # candle open timestamp
open
close
high
low
volume
```

Results are documented as descending by time.

### Important Verdant implication

Research Contract V0's primary `15M` timeframe and `60M`/`4H` higher-timeframe context are directly represented by Webot's documented candle intervals.

---

# 3. Historical-depth status

**UNRESOLVED.**

The official reference documents:

- `endTime` pagination/control;
- maximum 500 candles per request.

It does **not** specify the oldest retained candle timestamp or maximum historical depth by symbol.

Therefore Verdant must not state that Webot provides N months/years of history until the adapter probes the endpoint.

Required probe:

1. fetch latest 500 `15M` candles for an enabled symbol;
2. page backward using the oldest returned timestamp;
3. deduplicate by `(symbol, interval, openTime)`;
4. continue conservatively under the rate limit;
5. record the oldest reachable candle and any discontinuities;
6. repeat for the initial candidate universe;
7. compare availability for `15M`, `60M`, and `4H`.

If Webot history is insufficient for model research, Verdant may add a separate historical-data provider later, but that provider must preserve venue/execution separation and provenance.

---

# 4. Current symbol-universe status

**Must be resolved from the live `/api/v1/common/symbols` endpoint.**

The API markdown contains examples/static pair references, but those must not be treated as the live universe.

Verdant's research-universe bootstrap should therefore:

1. fetch all symbols;
2. retain only `type == SPOT`;
3. retain only `enable == true`;
4. record quote currency, precision, min/max constraints;
5. join current ticker statistics;
6. rank/filter by data availability and liquidity evidence;
7. explicitly verify candidate assets such as SOL before any model assumes them.

A third-party market listing can corroborate that a pair appears to exist, but only official live Webot data can admit it into Verdant's executable research universe.

---

# 5. WebSocket / streaming status

The current main `webot-openapi.md` reference does not document a WebSocket market-data endpoint.

Therefore V0 must **not invent one**.

Initial adapter authority:

```text
REST polling only
```

If Webot later publishes an official streaming interface, it can be added as another adapter capability.

This is deliberately phrased as "not documented in the current reference," not as a claim that no streaming system could exist anywhere in Webot's infrastructure.

---

# 6. Verified private/trading API facts relevant to later phases

Private endpoints require HMAC SHA-256 authentication using:

```text
PIONEX-KEY
PIONEX-SIGNATURE
```

and a request `timestamp` valid within +/-20 seconds.

Documented API-key permissions distinguish:

- reading;
- trading.

The main trading reference documents:

```text
POST /api/v1/trade/order
```

with:

```text
side: BUY | SELL
type: LIMIT | MARKET
```

Important order semantics:

- LIMIT uses `size` + `price`;
- MARKET SELL uses `size`;
- MARKET BUY uses quote `amount`;
- IOC is optional.

This is consistent with spot semantics. Nothing in the main reference authorizes Verdant to assume perpetual futures, leverage, liquidation, or executable short positions.

**No private/execution implementation is authorized during the current paper-only phase.** These facts are recorded now only so the paper model does not invent impossible order semantics.

---

# 7. Verified venue trading fees

Official Webot US fee schedule observed 2026-09-11:

```text
Taker: 0.5% = 50 bps per side
Maker: 0.1% = 10 bps per side
```

Webot explicitly reserves the right to change transaction fees.

Verdant consequence:

- fee schedules must be timestamped/versioned;
- canonical marketable V0.1 paper fills use 50-bps taker fee per side;
- a marketable round trip pays ~100 bps in fees before spread/slippage;
- maker economics may be researched only with a defensible passive-fill model.

Authority amendment:

- `docs/VERDANT_RESEARCH_CONTRACT_V0_1_AMENDMENT.md`

---

# 8. Capability matrix

| Capability | Current status | V0 use |
|---|---|---|
| Spot symbol metadata | VERIFIED | YES |
| 15m candles | VERIFIED | YES |
| 1h candles (`60M`) | VERIFIED | YES |
| 4h candles | VERIFIED | YES |
| Candle backward `endTime` parameter | VERIFIED | YES |
| Maximum candle batch 500 | VERIFIED | YES |
| Exact oldest historical depth | UNRESOLVED | PROBE |
| Recent trades | VERIFIED | LIVE/PROVISIONAL HISTORY |
| Current depth/order book | VERIFIED | LIVE/PROVISIONAL HISTORY |
| Historical order-book snapshots | NOT DOCUMENTED | NO until collected/sourced |
| All-market ticker | VERIFIED | YES |
| Live current symbol universe | ENDPOINT VERIFIED, CONTENT MUST BE QUERIED | PROBE |
| WebSocket in main API reference | NOT DOCUMENTED | NO |
| LIMIT orders | VERIFIED | PAPER SEMANTICS ONLY |
| MARKET orders | VERIFIED | PAPER SEMANTICS ONLY |
| Spot only in symbol type | VERIFIED | YES |
| Futures/perpetual API | NOT ESTABLISHED | NO |
| Leverage/liquidation semantics | NOT ESTABLISHED | NO |
| Taker fee 0.5% | VERIFIED 2026-09-11 | YES, versioned |
| Maker fee 0.1% | VERIFIED 2026-09-11 | ONLY with maker fill model |

---

# 9. Adapter requirements resulting from this audit

The first `WebotMarketDataProvider` must:

- use `https://api.webot.com` behind one adapter boundary;
- implement client-side request pacing below the documented ceiling;
- recognize HTTP 429 and back off rather than hammering during the 60-second ban;
- preserve original decimal strings at the transport boundary;
- expose normalized canonical records without losing the raw source value;
- preserve source timestamp and local received timestamp;
- reject malformed/unsuccessful `{ result: false }` payloads using stable `code` values rather than parsing human `message` text;
- expose symbol precision/minimums as venue constraints;
- expose candle pagination explicitly;
- never return an incomplete current candle as a completed decision candle;
- flag stale depth/ticker/trade snapshots;
- avoid private API credentials entirely during public-data research;
- carry adapter/schema versions into immutable Verdant records.

---

# 10. Highest-priority unresolved venue probes

Before the historical research harness is considered data-ready:

1. query live `/common/symbols` and freeze the actual enabled spot universe snapshot;
2. verify SOL pairs explicitly;
3. determine reachable 15m history depth by backward paging;
4. check for gaps/duplicates and candle timestamp semantics;
5. verify whether the latest returned kline may still be incomplete and define the completion filter empirically;
6. measure current spreads and depth on candidate symbols;
7. determine whether `endTime` is inclusive or exclusive at the boundary;
8. verify response/error behavior under invalid symbol/interval inputs without approaching the rate ceiling;
9. verify live server timestamp skew behavior;
10. record all results as adapter conformance fixtures.

---

# 11. Decision

Webot US is sufficiently documented to begin a **public-data adapter and venue probe** without inventing Binance semantics.

It is **not yet sufficiently characterized** to claim a usable historical research depth, a final symbol universe, or historically reproducible order-book features.

The immediate implementation target is therefore:

> **MarketDataProvider + canonical market schemas + Webot public REST adapter + conformance/history probe.**

Private/live execution remains out of scope.
