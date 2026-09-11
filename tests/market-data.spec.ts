import { expect, test } from '@playwright/test';
import { collectCandleHistory } from '../src/market/history';
import type { MarketDataProvider } from '../src/market/provider';
import type { MarketCandle } from '../src/market/types';
import {
  WebotApiError,
  WebotHttpClient,
  WebotRateLimitError,
} from '../src/market/webot/client';
import { WebotMarketDataProvider } from '../src/market/webot/provider';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

test('Webot provider excludes incomplete candles and returns chronological order', async () => {
  const barMs = 15 * 60_000;
  const base = 1_800_000_000_000;
  const serverTime = base + 40 * 60_000;
  const fetchImpl: typeof fetch = async () =>
    jsonResponse({
      result: true,
      timestamp: serverTime,
      data: {
        klines: [
          {
            time: base + 2 * barMs,
            open: '102.00',
            close: '103.00',
            high: '104.00',
            low: '101.00',
            volume: '30.0',
          },
          {
            time: base + barMs,
            open: '101.00',
            close: '102.00',
            high: '103.00',
            low: '100.00',
            volume: '20.0',
          },
          {
            time: base,
            open: '100.00',
            close: '101.00',
            high: '102.00',
            low: '99.00',
            volume: '10.0',
          },
        ],
      },
    });

  const provider = new WebotMarketDataProvider(
    new WebotHttpClient({ fetchImpl, minIntervalMs: 0 }),
  );
  const page = await provider.getCandles({ symbol: 'SOL_USDT', interval: '15m' });

  expect(page.candles).toHaveLength(2);
  expect(page.candles.map((candle) => candle.openTime)).toEqual([base, base + barMs]);
  expect(page.candles.every((candle) => candle.complete)).toBe(true);
});

test('Webot API result=false remains a typed stable-code failure', async () => {
  const fetchImpl: typeof fetch = async () =>
    jsonResponse({
      result: false,
      code: 'MARKET_INVALID_SYMBOL',
      message: 'human text can change',
      timestamp: 1_800_000_000_000,
    });
  const client = new WebotHttpClient({ fetchImpl, minIntervalMs: 0 });

  await expect(client.get('/api/v1/market/tickers')).rejects.toMatchObject({
    name: 'WebotApiError',
    code: 'MARKET_INVALID_SYMBOL',
  } satisfies Partial<WebotApiError>);
});

test('HTTP 429 blocks later requests for the documented ban window', async () => {
  let clock = 0;
  let calls = 0;
  const sleeps: number[] = [];
  const fetchImpl: typeof fetch = async () => {
    calls += 1;
    if (calls === 1) return jsonResponse({}, 429);
    return jsonResponse({ result: true, data: { ok: true }, timestamp: clock });
  };

  const client = new WebotHttpClient({
    fetchImpl,
    now: () => clock,
    sleep: async (milliseconds) => {
      sleeps.push(milliseconds);
      clock += milliseconds;
    },
    minIntervalMs: 110,
    rateLimitBanMs: 60_000,
  });

  await expect(client.get('/first')).rejects.toBeInstanceOf(WebotRateLimitError);
  await expect(client.get<{ ok: boolean }>('/second')).resolves.toMatchObject({
    data: { ok: true },
  });

  expect(sleeps).toContain(60_000);
  expect(clock).toBe(60_000);
});

function candle(openTime: number): MarketCandle {
  const intervalMs = 15 * 60_000;
  return {
    provider: 'webot-us',
    sourceTime: openTime,
    receivedAt: 1_900_000_000_000,
    symbol: 'SOL_USDT',
    interval: '15m',
    openTime,
    closeTime: openTime + intervalMs,
    open: '100',
    close: '101',
    high: '102',
    low: '99',
    volume: '10',
    complete: true,
  };
}

test('history collector deduplicates page boundaries and exposes candle gaps', async () => {
  const barMs = 15 * 60_000;
  const base = 1_800_000_000_000;
  const pages: readonly (readonly MarketCandle[])[] = [
    [candle(base + barMs), candle(base + 3 * barMs)],
    [candle(base), candle(base + barMs)],
    [],
  ];
  let pageIndex = 0;

  const provider: MarketDataProvider = {
    id: 'webot-us',
    getSymbols: async () => [],
    getTickers: async () => [],
    getRecentTrades: async () => [],
    getOrderBook: async () => ({
      provider: 'webot-us',
      receivedAt: base,
      sourceTime: base,
      symbol: 'SOL_USDT',
      bids: [],
      asks: [],
    }),
    getCandles: async (request) => {
      const candles = pages[pageIndex] ?? [];
      pageIndex += 1;
      return {
        symbol: request.symbol,
        interval: request.interval,
        serverTime: base + 10 * barMs,
        receivedAt: base + 10 * barMs,
        requestedEndTime: request.endTime,
        candles,
      };
    },
  };

  const result = await collectCandleHistory(provider, {
    symbol: 'SOL_USDT',
    interval: '15m',
    pageSize: 2,
    maxPages: 5,
  });

  expect(result.exhausted).toBe(true);
  expect(result.pagesRequested).toBe(3);
  expect(result.duplicatesDropped).toBe(1);
  expect(result.candles.map((item) => item.openTime)).toEqual([
    base,
    base + barMs,
    base + 3 * barMs,
  ]);
  expect(result.gaps).toEqual([
    {
      previousOpenTime: base + barMs,
      nextOpenTime: base + 3 * barMs,
      missingIntervals: 1,
    },
  ]);
});
