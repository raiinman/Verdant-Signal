import type {
  CandlePage,
  MarketInterval,
  MarketSymbol,
  MarketTicker,
  MarketTrade,
  OrderBookSnapshot,
} from './types';

export interface CandleRequest {
  symbol: string;
  interval: MarketInterval;
  endTime?: number;
  limit?: number;
  completedOnly?: boolean;
}

export interface RecentTradesRequest {
  symbol: string;
  limit?: number;
}

export interface OrderBookRequest {
  symbol: string;
  limit?: number;
}

export interface MarketDataProvider {
  readonly id: 'webot-us';
  getSymbols(symbols?: readonly string[]): Promise<readonly MarketSymbol[]>;
  getTickers(symbol?: string): Promise<readonly MarketTicker[]>;
  getCandles(request: CandleRequest): Promise<CandlePage>;
  getRecentTrades(request: RecentTradesRequest): Promise<readonly MarketTrade[]>;
  getOrderBook(request: OrderBookRequest): Promise<OrderBookSnapshot>;
}
