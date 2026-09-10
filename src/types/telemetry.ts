/**
 * Types mirroring the reference's public /api/status and /api/visitor-stats
 * contracts exactly as observed on 2026-09-10. See reference/SITE_INVENTORY.md §4.
 *
 * Do not add fields the reference does not serve — a field invented here would
 * become an invented figure on screen.
 */

/** `positions[]` — one open signal slot. */
export interface Position {
  symbol: string;
  /** Observed only as 'ALGO_10X'. The reference derives B/S by testing for 'BUY'. */
  side: string;
  amount: number;
  entry_price: number;
  mark_price: number;
  upnl_usd: number;
  roe_pct: number;
  leverage: number;
  stop_loss_px: number;
  take_profit_px: number;
  profit_locked: boolean;
  /** Observed: 'ACTIVE' | 'LOCKED_PROFIT'. 'EXIT_WARNING' exists in client code only (U-01). */
  signal_status: SignalStatus;
  /** Server-rendered label including an emoji, e.g. '🎯 LOCKED WIN'. */
  status_tag: string;
  /** Pre-formatted Telegram broadcast text. */
  signal_copy: string;
  /** Server-assigned free-tier flag. Absent → the reference falls back to index < 2. */
  is_free_stream?: boolean;
  free_slot?: number | null;
}

export type SignalStatus = 'ACTIVE' | 'LOCKED_PROFIT' | 'EXIT_WARNING';

/** `audited_exits[]` — the verified closed-trade ledger. */
export interface AuditedExit {
  sym: string;
  clean_symbol: string;
  is_win: boolean;
  exitType: string;
  pnl_usd: number;
  roe: number;
  date: string;
  /** Null for older rows; the reference then prints 'Market Fill' / 'Trailing Market'. */
  entry: number | null;
  exit: number | null;
}

/** `recent_closed_calls[]` — the two most recent closes, always unmasked. */
export interface ClosedCall {
  symbol: string;
  clean_symbol: string;
  realized_pnl: number;
  exit_type: string;
  closed_time: string;
  is_win: boolean;
  roe_pct: number;
  entry_price: number;
  exit_price: number;
}

/** Full `/api/status` payload. */
export interface Telemetry {
  updated_utc: string;
  total_usdt_balance: number;
  wallet_usdt_balance: number;
  total_unrealized_profit: number;
  available_usdt_balance: number;
  net_profit_usdt: number;
  net_gain_pct: number;
  target_goal_usdt: number;
  goal_progress_pct: number;
  active_positions_count: number;
  max_slots: number;
  target_margin_per_slot: number;
  recent_closed_calls: ClosedCall[];
  audited_exits: AuditedExit[];
  positions: Position[];
}

/** `/api/visitor-stats` payload. */
export interface VisitorStats {
  live_online: number;
  total_views: number;
  unique_visitors: number;
  mobile_count: number;
  desktop_count: number;
}

/** Feed health. STALE and UNAVAILABLE are additions — the reference has neither (D-07). */
export type FeedState = 'LOADING' | 'LIVE' | 'STALE' | 'UNAVAILABLE';

/** Entitlement axis. See reference/STATE_MATRIX.md §1. */
export type Entitlement = 'GUEST' | 'FREE_UNLOCKED' | 'VIP';

/** Telegram binding axis. */
export type BindingState = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED';

export interface Session {
  binding: BindingState;
  entitlement: Entitlement;
  handle: string;
}
