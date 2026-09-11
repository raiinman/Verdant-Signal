#!/usr/bin/env node

import { writeFile } from 'node:fs/promises';

const API_BASE = 'https://api.webot.com';
const MIN_REQUEST_INTERVAL_MS = 125; // 8 req/s: intentionally below documented 10 req/s ceiling.
const RATE_LIMIT_SLEEP_MS = 61_000;

const INTERVAL_MS = {
  '1M': 60_000,
  '5M': 5 * 60_000,
  '15M': 15 * 60_000,
  '30M': 30 * 60_000,
  '60M': 60 * 60_000,
  '4H': 4 * 60 * 60_000,
  '8H': 8 * 60 * 60_000,
  '12H': 12 * 60 * 60_000,
  '1D': 24 * 60 * 60_000,
};

let lastRequestStartedAt = 0;

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function parseArgs(argv) {
  const options = {
    symbol: 'SOL_USDT',
    interval: '15M',
    maxPages: 25,
    out: undefined,
  };

  for (const arg of argv) {
    if (arg.startsWith('--symbol=')) options.symbol = arg.slice('--symbol='.length).toUpperCase();
    else if (arg.startsWith('--interval=')) options.interval = arg.slice('--interval='.length).toUpperCase();
    else if (arg.startsWith('--max-pages=')) options.maxPages = Number(arg.slice('--max-pages='.length));
    else if (arg.startsWith('--out=')) options.out = arg.slice('--out='.length);
    else if (arg === '--help') {
      console.log(`Usage: node scripts/probe-webot.mjs [options]\n\nOptions:\n  --symbol=SOL_USDT    Symbol to probe (default SOL_USDT)\n  --interval=15M       Kline interval (default 15M)\n  --max-pages=25       Maximum 500-candle pages (default 25)\n  --out=path.json      Write the JSON report to a file\n`);
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!(options.interval in INTERVAL_MS)) {
    throw new Error(`Unsupported interval: ${options.interval}`);
  }
  if (!Number.isInteger(options.maxPages) || options.maxPages < 1) {
    throw new Error('--max-pages must be a positive integer');
  }

  return options;
}

async function pace() {
  const now = Date.now();
  const waitMs = lastRequestStartedAt + MIN_REQUEST_INTERVAL_MS - now;
  if (waitMs > 0) await sleep(waitMs);
  lastRequestStartedAt = Date.now();
}

async function get(path, params = {}, retry429 = true) {
  await pace();
  const url = new URL(path, `${API_BASE}/`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (response.status === 429 && retry429) {
    console.error('Webot returned HTTP 429; honoring documented ban window before one retry.');
    await sleep(RATE_LIMIT_SLEEP_MS);
    return get(path, params, false);
  }
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url.pathname}`);

  const body = await response.json();
  if (typeof body !== 'object' || body === null || typeof body.result !== 'boolean') {
    throw new Error(`Malformed Webot response for ${url.pathname}`);
  }
  if (!body.result) {
    throw new Error(`Webot ${body.code ?? 'UNKNOWN'}: ${body.message ?? 'result=false'}`);
  }
  return body;
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function calculateSpread(depth) {
  const bestBid = depth?.bids?.[0]?.[0];
  const bestAsk = depth?.asks?.[0]?.[0];
  const bid = toNumber(bestBid);
  const ask = toNumber(bestAsk);
  if (bid === undefined || ask === undefined || bid <= 0 || ask <= 0 || ask < bid) return undefined;
  const mid = (bid + ask) / 2;
  return {
    bestBid,
    bestAsk,
    spreadBps: ((ask - bid) / mid) * 10_000,
  };
}

function summarizeGaps(openTimes, stepMs) {
  const gaps = [];
  for (let index = 1; index < openTimes.length; index += 1) {
    const previous = openTimes[index - 1];
    const current = openTimes[index];
    const delta = current - previous;
    if (delta > stepMs) {
      gaps.push({
        previousOpenTime: previous,
        nextOpenTime: current,
        missingIntervals: Math.max(0, Math.round(delta / stepMs) - 1),
      });
    }
  }
  return gaps;
}

async function collectKlines(symbol, interval, maxPages) {
  const stepMs = INTERVAL_MS[interval];
  const candles = new Map();
  let endTime;
  let pages = 0;
  let duplicates = 0;
  let exhausted = false;
  let latestPageServerTime;
  let incompleteOnLatestPage = 0;

  while (pages < maxPages) {
    const body = await get('/api/v1/market/klines', {
      symbol,
      interval,
      endTime,
      limit: 500,
    });
    pages += 1;
    const page = Array.isArray(body.data?.klines) ? body.data.klines : [];
    const serverTime = body.timestamp;
    if (pages === 1) latestPageServerTime = serverTime;

    if (page.length === 0) {
      exhausted = true;
      break;
    }

    let oldest = Number.POSITIVE_INFINITY;
    for (const item of page) {
      const openTime = Number(item.time);
      if (!Number.isFinite(openTime)) throw new Error('Kline returned invalid time');
      oldest = Math.min(oldest, openTime);
      const complete = openTime + stepMs <= serverTime;
      if (pages === 1 && !complete) incompleteOnLatestPage += 1;
      if (!complete) continue;

      const existing = candles.get(openTime);
      const normalized = {
        time: openTime,
        open: item.open,
        close: item.close,
        high: item.high,
        low: item.low,
        volume: item.volume,
      };
      if (existing !== undefined) {
        if (JSON.stringify(existing) !== JSON.stringify(normalized)) {
          throw new Error(`Conflicting candle payload at ${openTime}`);
        }
        duplicates += 1;
      } else {
        candles.set(openTime, normalized);
      }
    }

    if (!Number.isFinite(oldest)) {
      exhausted = true;
      break;
    }

    const nextEndTime = oldest - 1;
    if (endTime !== undefined && nextEndTime >= endTime) {
      throw new Error(`Pagination failed to move backward: ${endTime} -> ${nextEndTime}`);
    }
    endTime = nextEndTime;

    if (page.length < 500) {
      exhausted = true;
      break;
    }
  }

  const ordered = [...candles.values()].sort((a, b) => a.time - b.time);
  const openTimes = ordered.map((item) => item.time);
  return {
    pages,
    completedCandles: ordered.length,
    duplicates,
    exhausted,
    stoppedByMaxPages: !exhausted && pages >= maxPages,
    latestPageServerTime,
    incompleteOnLatestPage,
    oldestOpenTime: openTimes[0],
    oldestOpenIso: openTimes[0] === undefined ? undefined : new Date(openTimes[0]).toISOString(),
    newestOpenTime: openTimes.at(-1),
    newestOpenIso: openTimes.at(-1) === undefined ? undefined : new Date(openTimes.at(-1)).toISOString(),
    gaps: summarizeGaps(openTimes, stepMs),
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const symbolsBody = await get('/api/v1/common/symbols');
  const symbols = Array.isArray(symbolsBody.data?.symbols) ? symbolsBody.data.symbols : [];
  const enabledSpot = symbols.filter((item) => item.type === 'SPOT' && item.enable === true);
  const solSymbols = enabledSpot.filter((item) => item.baseCurrency === 'SOL').map((item) => item.symbol);
  const selected = enabledSpot.find((item) => item.symbol === options.symbol);

  if (selected === undefined) {
    throw new Error(
      `${options.symbol} is not an enabled SPOT symbol in the live symbols response. SOL candidates: ${solSymbols.join(', ') || 'none'}`,
    );
  }

  const [tickerBody, depthBody] = await Promise.all([
    get('/api/v1/market/tickers', { symbol: options.symbol }),
    get('/api/v1/market/depth', { symbol: options.symbol, limit: 20 }),
  ]);

  const history = await collectKlines(options.symbol, options.interval, options.maxPages);
  const report = {
    probeVersion: 1,
    observedAt: new Date().toISOString(),
    apiBase: API_BASE,
    documentedClientPacingRequestsPerSecond: 1000 / MIN_REQUEST_INTERVAL_MS,
    universe: {
      totalSymbolsReturned: symbols.length,
      enabledSpotSymbols: enabledSpot.length,
      solSymbols,
    },
    selectedSymbol: {
      symbol: selected.symbol,
      type: selected.type,
      baseCurrency: selected.baseCurrency,
      quoteCurrency: selected.quoteCurrency,
      basePrecision: selected.basePrecision,
      quotePrecision: selected.quotePrecision,
      amountPrecision: selected.amountPrecision,
      minAmount: selected.minAmount,
      minTradeSize: selected.minTradeSize,
      maxTradeSize: selected.maxTradeSize,
      minTradeDumping: selected.minTradeDumping,
      maxTradeDumping: selected.maxTradeDumping,
      buyCeiling: selected.buyCeiling,
      sellFloor: selected.sellFloor,
    },
    ticker: tickerBody.data?.tickers?.[0],
    depth: {
      updateTime: depthBody.data?.updateTime,
      ...calculateSpread(depthBody.data),
      bidLevels: depthBody.data?.bids?.length ?? 0,
      askLevels: depthBody.data?.asks?.length ?? 0,
    },
    history: {
      symbol: options.symbol,
      interval: options.interval,
      maxPages: options.maxPages,
      ...history,
    },
  };

  const output = `${JSON.stringify(report, null, 2)}\n`;
  if (options.out !== undefined) {
    await writeFile(options.out, output, 'utf8');
    console.error(`Wrote ${options.out}`);
  }
  process.stdout.write(output);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
