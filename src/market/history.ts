import type { MarketDataProvider } from './provider';
import { MARKET_INTERVAL_MS, type MarketCandle, type MarketInterval } from './types';

export interface CandleGap {
  previousOpenTime: number;
  nextOpenTime: number;
  missingIntervals: number;
}

export interface CandleHistoryOptions {
  symbol: string;
  interval: MarketInterval;
  pageSize?: number;
  maxPages?: number;
  stopAtOpenTime?: number;
}

export interface CandleHistoryResult {
  symbol: string;
  interval: MarketInterval;
  candles: readonly MarketCandle[];
  pagesRequested: number;
  duplicatesDropped: number;
  exhausted: boolean;
  stoppedByMaxPages: boolean;
  oldestOpenTime?: number;
  newestOpenTime?: number;
  gaps: readonly CandleGap[];
}

export class CandleConflictError extends Error {
  readonly openTime: number;

  constructor(openTime: number) {
    super(`Conflicting candle values returned for openTime=${openTime}`);
    this.name = 'CandleConflictError';
    this.openTime = openTime;
  }
}

function candlePayloadEquals(left: MarketCandle, right: MarketCandle): boolean {
  return (
    left.symbol === right.symbol &&
    left.interval === right.interval &&
    left.openTime === right.openTime &&
    left.open === right.open &&
    left.close === right.close &&
    left.high === right.high &&
    left.low === right.low &&
    left.volume === right.volume &&
    left.complete === right.complete
  );
}

function findGaps(candles: readonly MarketCandle[], interval: MarketInterval): readonly CandleGap[] {
  const expectedStep = MARKET_INTERVAL_MS[interval];
  const gaps: CandleGap[] = [];

  for (let index = 1; index < candles.length; index += 1) {
    const previous = candles[index - 1];
    const current = candles[index];
    if (previous === undefined || current === undefined) continue;

    const delta = current.openTime - previous.openTime;
    if (delta > expectedStep) {
      gaps.push({
        previousOpenTime: previous.openTime,
        nextOpenTime: current.openTime,
        missingIntervals: Math.max(0, Math.round(delta / expectedStep) - 1),
      });
    }
  }

  return gaps;
}

export async function collectCandleHistory(
  provider: MarketDataProvider,
  options: CandleHistoryOptions,
): Promise<CandleHistoryResult> {
  const pageSize = options.pageSize ?? 500;
  const maxPages = options.maxPages ?? 100;

  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 500) {
    throw new RangeError('pageSize must be an integer between 1 and 500');
  }
  if (!Number.isInteger(maxPages) || maxPages < 1) {
    throw new RangeError('maxPages must be a positive integer');
  }

  const byOpenTime = new Map<number, MarketCandle>();
  let endTime: number | undefined;
  let pagesRequested = 0;
  let duplicatesDropped = 0;
  let exhausted = false;

  while (pagesRequested < maxPages) {
    const page = await provider.getCandles({
      symbol: options.symbol,
      interval: options.interval,
      endTime,
      limit: pageSize,
      completedOnly: true,
    });
    pagesRequested += 1;

    if (page.candles.length === 0) {
      exhausted = true;
      break;
    }

    let oldestOnPage = Number.POSITIVE_INFINITY;

    for (const candle of page.candles) {
      if (options.stopAtOpenTime !== undefined && candle.openTime < options.stopAtOpenTime) {
        continue;
      }

      oldestOnPage = Math.min(oldestOnPage, candle.openTime);
      const existing = byOpenTime.get(candle.openTime);
      if (existing !== undefined) {
        if (!candlePayloadEquals(existing, candle)) {
          throw new CandleConflictError(candle.openTime);
        }
        duplicatesDropped += 1;
        continue;
      }
      byOpenTime.set(candle.openTime, candle);
    }

    const pageOldest = page.candles.reduce(
      (minimum, candle) => Math.min(minimum, candle.openTime),
      Number.POSITIVE_INFINITY,
    );

    if (!Number.isFinite(pageOldest)) {
      exhausted = true;
      break;
    }

    if (options.stopAtOpenTime !== undefined && pageOldest <= options.stopAtOpenTime) {
      exhausted = true;
      break;
    }

    const nextEndTime = pageOldest - 1;
    if (endTime !== undefined && nextEndTime >= endTime) {
      throw new Error(
        `Candle pagination stopped making backward progress: endTime=${endTime}, next=${nextEndTime}`,
      );
    }
    endTime = nextEndTime;

    if (page.candles.length < pageSize) {
      exhausted = true;
      break;
    }

    if (!Number.isFinite(oldestOnPage) && options.stopAtOpenTime === undefined) {
      throw new Error('Candle page contained no usable completed candles');
    }
  }

  const candles = [...byOpenTime.values()].sort((left, right) => left.openTime - right.openTime);
  const oldestOpenTime = candles[0]?.openTime;
  const newestOpenTime = candles[candles.length - 1]?.openTime;

  return {
    symbol: options.symbol,
    interval: options.interval,
    candles,
    pagesRequested,
    duplicatesDropped,
    exhausted,
    stoppedByMaxPages: !exhausted && pagesRequested >= maxPages,
    oldestOpenTime,
    newestOpenTime,
    gaps: findGaps(candles, options.interval),
  };
}
