export interface WebotEnvelope<T> {
  result: boolean;
  data?: T;
  code?: string;
  message?: string;
  timestamp: number;
}

export interface WebotSymbol {
  symbol: string;
  type: string;
  baseCurrency: string;
  quoteCurrency: string;
  basePrecision: number;
  quotePrecision: number;
  amountPrecision: number;
  minAmount: string;
  minTradeSize: string;
  maxTradeSize: string;
  minTradeDumping: string;
  maxTradeDumping: string;
  enable: boolean;
  buyCeiling: string;
  sellFloor: string;
}

export interface WebotTrade {
  symbol: string;
  tradeId: string;
  price: string;
  size: string;
  side: 'BUY' | 'SELL';
  timestamp: number;
}

export type WebotBookLevel = readonly [string, string];

export interface WebotDepth {
  bids: readonly WebotBookLevel[];
  asks: readonly WebotBookLevel[];
  updateTime: number;
}

export interface WebotTicker {
  symbol: string;
  time: number;
  open: string;
  close: string;
  low: string;
  high: string;
  volume: string;
  amount: string;
  count: number;
}

export interface WebotKline {
  time: number;
  open: string;
  close: string;
  high: string;
  low: string;
  volume: string;
}

export interface WebotSymbolsData {
  symbols: readonly WebotSymbol[];
}

export interface WebotTradesData {
  trades: readonly WebotTrade[];
}

export interface WebotTickersData {
  tickers: readonly WebotTicker[];
}

export interface WebotKlinesData {
  klines: readonly WebotKline[];
}

export type WebotInterval =
  | '1M'
  | '5M'
  | '15M'
  | '30M'
  | '60M'
  | '4H'
  | '8H'
  | '12H'
  | '1D';
