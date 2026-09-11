import type {
  CandleRequest,
  MarketDataProvider,
  OrderBookRequest,
  RecentTradesRequest,
} from '../provider';
import {
  MARKET_INTERVAL_MS,
  type CandlePage,
  type MarketCandle,
  type MarketInterval,
  type MarketSymbol,
  type MarketTicker,
  type MarketTrade,
  type OrderBookLevel,
  type OrderBookSnapshot,
} from '../types';
import { WebotHttpClient, WebotProtocolError } from './client';
import type { WebotInterval } from './types';

const WEBOT_INTERVAL_BY_CANONICAL: Readonly<Record<MarketInterval, WebotInterval>> = {
  '1m': '1M',
  '5m': '5M',
  '15m': '15M',
  '30m': '30M',
  '1h': '60M',
  '4h': '4H',
  '8h': '8H',
  '12h': '12H',
  '1d': '1D',
};

const DECIMAL_PATTERN = /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/;

function record(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new WebotProtocolError(`${label} must be an object`);
  }
  return value as Record<string, unknown>;
}

function array(value: unknown, label: string): readonly unknown[] {
  if (!Array.isArray(value)) {
    throw new WebotProtocolError(`${label} must be an array`);
  }
  return value;
}

function string(value: unknown, label: string): string {
  if (typeof value !== 'string') {
    throw new WebotProtocolError(`${label} must be a string`);
  }
  return value;
}

function decimal(value: unknown, label: string): string {
  const parsed = string(value, label);
  if (!DECIMAL_PATTERN.test(parsed)) {
    throw new WebotProtocolError(`${label} must be a plain decimal string`);
  }
  return parsed;
}

function number(value: unknown, label: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new WebotProtocolError(`${label} must be a finite number`);
  }
  return value;
}

function integer(value: unknown, label: string): number {
  const parsed = number(value, label);
  if (!Number.isInteger(parsed)) {
    throw new WebotProtocolError(`${label} must be an integer`);
  }
  return parsed;
}

function boolean(value: unknown, label: string): boolean {
  if (typeof value !== 'boolean') {
    throw new WebotProtocolError(`${label} must be a boolean`);
  }
  return value;
}

function requireLimit(value: number | undefined, min: number, max: number, label: string): number | undefined {
  if (value === undefined) return undefined;
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new RangeError(`${label} must be an integer between ${min} and ${max}`);
  }
  return value;
}

function mapSymbol(value: unknown, serverTime: number, receivedAt: number): MarketSymbol | null {
  const source = record(value, 'symbol');
  const marketType = string(source.type, 'symbol.type');
  if (marketType !== 'SPOT') return null;

  const venueSymbol = string(source.symbol, 'symbol.symbol');
  return {
    provider: 'webot-us',
    sourceTime: serverTime,
    receivedAt,
    symbol: venueSymbol,
    venueSymbol,
    marketType: 'spot',
    baseAsset: string(source.baseCurrency, 'symbol.baseCurrency'),
    quoteAsset: string(source.quoteCurrency, 'symbol.quoteCurrency'),
    basePrecision: integer(source.basePrecision, 'symbol.basePrecision'),
    quotePrecision: integer(source.quotePrecision, 'symbol.quotePrecision'),
    amountPrecision: integer(source.amountPrecision, 'symbol.amountPrecision'),
    minAmount: decimal(source.minAmount, 'symbol.minAmount'),
    minTradeSize: decimal(source.minTradeSize, 'symbol.minTradeSize'),
    maxTradeSize: decimal(source.maxTradeSize, 'symbol.maxTradeSize'),
    minMarketSellSize: decimal(source.minTradeDumping, 'symbol.minTradeDumping'),
    maxMarketSellSize: decimal(source.maxTradeDumping, 'symbol.maxTradeDumping'),
    enabled: boolean(source.enable, 'symbol.enable'),
    buyCeilingRatio: decimal(source.buyCeiling, 'symbol.buyCeiling'),
    sellFloorRatio: decimal(source.sellFloor, 'symbol.sellFloor'),
  };
}

function mapTrade(value: unknown, receivedAt: number): MarketTrade {
  const source = record(value, 'trade');
  const side = string(source.side, 'trade.side');
  if (side !== 'BUY' && side !== 'SELL') {
    throw new WebotProtocolError(`trade.side must be BUY or SELL, received ${side}`);
  }
  const tradeTime = integer(source.timestamp, 'trade.timestamp');

  return {
    provider: 'webot-us',
    sourceTime: tradeTime,
    receivedAt,
    symbol: string(source.symbol, 'trade.symbol'),
    tradeId: string(source.tradeId, 'trade.tradeId'),
    price: decimal(source.price, 'trade.price'),
    size: decimal(source.size, 'trade.size'),
    takerSide: side === 'BUY' ? 'buy' : 'sell',
    tradeTime,
  };
}

function mapBookLevel(value: unknown, label: string): OrderBookLevel {
  const level = array(value, label);
  if (level.length < 2) {
    throw new WebotProtocolError(`${label} must contain price and size`);
  }
  return {
    price: decimal(level[0], `${label}[0]`),
    size: decimal(level[1], `${label}[1]`),
  };
}

function mapTicker(value: unknown, receivedAt: number): MarketTicker {
  const source = record(value, 'ticker');
  const snapshotTime = integer(source.time, 'ticker.time');
  return {
    provider: 'webot-us',
    sourceTime: snapshotTime,
    receivedAt,
    symbol: string(source.symbol, 'ticker.symbol'),
    snapshotTime,
    open: decimal(source.open, 'ticker.open'),
    close: decimal(source.close, 'ticker.close'),
    low: decimal(source.low, 'ticker.low'),
    high: decimal(source.high, 'ticker.high'),
    volume: decimal(source.volume, 'ticker.volume'),
    quoteVolume: decimal(source.amount, 'ticker.amount'),
    tradeCount: integer(source.count, 'ticker.count'),
  };
}

function mapCandle(
  value: unknown,
  symbol: string,
  interval: MarketInterval,
  serverTime: number,
  receivedAt: number,
): MarketCandle {
  const source = record(value, 'kline');
  const openTime = integer(source.time, 'kline.time');
  const closeTime = openTime + MARKET_INTERVAL_MS[interval];

  return {
    provider: 'webot-us',
    sourceTime: openTime,
    receivedAt,
    symbol,
    interval,
    openTime,
    closeTime,
    open: decimal(source.open, 'kline.open'),
    close: decimal(source.close, 'kline.close'),
    high: decimal(source.high, 'kline.high'),
    low: decimal(source.low, 'kline.low'),
    volume: decimal(source.volume, 'kline.volume'),
    complete: closeTime <= serverTime,
  };
}

export class WebotMarketDataProvider implements MarketDataProvider {
  readonly id = 'webot-us' as const;

  constructor(private readonly client: WebotHttpClient = new WebotHttpClient()) {}

  async getSymbols(symbols?: readonly string[]): Promise<readonly MarketSymbol[]> {
    const response = await this.client.get<unknown>('/api/v1/common/symbols', {
      symbols: symbols?.join(','),
    });
    const data = record(response.data, 'symbols response data');
    return array(data.symbols, 'symbols').flatMap((value) => {
      const mapped = mapSymbol(value, response.serverTime, response.receivedAt);
      return mapped === null ? [] : [mapped];
    });
  }

  async getTickers(symbol?: string): Promise<readonly MarketTicker[]> {
    const response = await this.client.get<unknown>('/api/v1/market/tickers', { symbol });
    const data = record(response.data, 'tickers response data');
    return array(data.tickers, 'tickers').map((value) => mapTicker(value, response.receivedAt));
  }

  async getCandles(request: CandleRequest): Promise<CandlePage> {
    const limit = requireLimit(request.limit, 1, 500, 'candle limit');
    const response = await this.client.get<unknown>('/api/v1/market/klines', {
      symbol: request.symbol,
      interval: WEBOT_INTERVAL_BY_CANONICAL[request.interval],
      endTime: request.endTime,
      limit,
    });
    const data = record(response.data, 'klines response data');
    const completedOnly = request.completedOnly ?? true;
    const candles = array(data.klines, 'klines')
      .map((value) =>
        mapCandle(
          value,
          request.symbol,
          request.interval,
          response.serverTime,
          response.receivedAt,
        ),
      )
      .filter((candle) => !completedOnly || candle.complete)
      .sort((left, right) => left.openTime - right.openTime);

    return {
      symbol: request.symbol,
      interval: request.interval,
      serverTime: response.serverTime,
      receivedAt: response.receivedAt,
      requestedEndTime: request.endTime,
      candles,
    };
  }

  async getRecentTrades(request: RecentTradesRequest): Promise<readonly MarketTrade[]> {
    const limit = requireLimit(request.limit, 10, 500, 'recent-trades limit');
    const response = await this.client.get<unknown>('/api/v1/market/trades', {
      symbol: request.symbol,
      limit,
    });
    const data = record(response.data, 'trades response data');
    return array(data.trades, 'trades').map((value) => mapTrade(value, response.receivedAt));
  }

  async getOrderBook(request: OrderBookRequest): Promise<OrderBookSnapshot> {
    const limit = requireLimit(request.limit, 1, 1000, 'order-book limit');
    const response = await this.client.get<unknown>('/api/v1/market/depth', {
      symbol: request.symbol,
      limit,
    });
    const data = record(response.data, 'depth response data');
    const updateTime = integer(data.updateTime, 'depth.updateTime');

    return {
      provider: 'webot-us',
      sourceTime: updateTime,
      receivedAt: response.receivedAt,
      symbol: request.symbol,
      bids: array(data.bids, 'depth.bids').map((value, index) =>
        mapBookLevel(value, `depth.bids[${index}]`),
      ),
      asks: array(data.asks, 'depth.asks').map((value, index) =>
        mapBookLevel(value, `depth.asks[${index}]`),
      ),
    };
  }
}
