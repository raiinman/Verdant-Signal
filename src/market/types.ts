export type DecimalString = string;

export type MarketDataProviderId = 'webot-us';

export type MarketInterval =
  | '1m'
  | '5m'
  | '15m'
  | '30m'
  | '1h'
  | '4h'
  | '8h'
  | '12h'
  | '1d';

export const MARKET_INTERVAL_MS: Readonly<Record<MarketInterval, number>> = {
  '1m': 60_000,
  '5m': 5 * 60_000,
  '15m': 15 * 60_000,
  '30m': 30 * 60_000,
  '1h': 60 * 60_000,
  '4h': 4 * 60 * 60_000,
  '8h': 8 * 60 * 60_000,
  '12h': 12 * 60 * 60_000,
  '1d': 24 * 60 * 60_000,
};

export interface SourceStamp {
  provider: MarketDataProviderId;
  receivedAt: number;
  sourceTime?: number;
}

export interface MarketSymbol extends SourceStamp {
  symbol: string;
  venueSymbol: string;
  marketType: 'spot';
  baseAsset: string;
  quoteAsset: string;
  basePrecision: number;
  quotePrecision: number;
  amountPrecision: number;
  minAmount: DecimalString;
  minTradeSize: DecimalString;
  maxTradeSize: DecimalString;
  minMarketSellSize: DecimalString;
  maxMarketSellSize: DecimalString;
  enabled: boolean;
  buyCeilingRatio: DecimalString;
  sellFloorRatio: DecimalString;
}

export interface MarketTrade extends SourceStamp {
  symbol: string;
  tradeId: string;
  price: DecimalString;
  size: DecimalString;
  takerSide: 'buy' | 'sell';
  tradeTime: number;
}

export interface OrderBookLevel {
  price: DecimalString;
  size: DecimalString;
}

export interface OrderBookSnapshot extends SourceStamp {
  symbol: string;
  bids: readonly OrderBookLevel[];
  asks: readonly OrderBookLevel[];
}

export interface MarketTicker extends SourceStamp {
  symbol: string;
  snapshotTime: number;
  open: DecimalString;
  close: DecimalString;
  low: DecimalString;
  high: DecimalString;
  volume: DecimalString;
  quoteVolume: DecimalString;
  tradeCount: number;
}

export interface MarketCandle extends SourceStamp {
  symbol: string;
  interval: MarketInterval;
  openTime: number;
  closeTime: number;
  open: DecimalString;
  close: DecimalString;
  high: DecimalString;
  low: DecimalString;
  volume: DecimalString;
  complete: boolean;
}

export interface CandlePage {
  symbol: string;
  interval: MarketInterval;
  serverTime: number;
  receivedAt: number;
  requestedEndTime?: number;
  candles: readonly MarketCandle[];
}
