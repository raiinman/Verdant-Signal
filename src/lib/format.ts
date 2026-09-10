/** Shared formatters. Presentation only — no value is ever recomputed here. */

import type { AuditedExit } from '../types/telemetry';

export function usd(value: number, decimals = 2): string {
  return `$${value.toFixed(decimals)}`;
}

export function signedUsd(value: number): string {
  return `${value >= 0 ? '+' : '-'}$${Math.abs(value).toFixed(2)}`;
}

export function signedPct(value: number, decimals = 1): string {
  return `${value >= 0 ? '+' : '-'}${Math.abs(value).toFixed(decimals)}%`;
}

/** Directional caret so polarity survives monochrome rendering (CLAUDE.md §2.5). */
export function caret(value: number): string {
  return value >= 0 ? '▲' : '▼';
}

/**
 * Seconds since a `YYYY-MM-DD HH:MM:SS UTC` stamp. Drives LAST SYNC, which
 * reports a measured age rather than implying a socket (U-12).
 */
export function secondsSince(updatedUtc: string): number | null {
  const parsed = Date.parse(updatedUtc.replace(' UTC', 'Z').replace(' ', 'T'));
  if (Number.isNaN(parsed)) return null;
  return Math.max(0, Math.round((Date.now() - parsed) / 1000));
}

/**
 * Win rate and net yield over the returned ledger.
 * Computed exactly as the reference computes it, but scoped honestly to the
 * rows actually received rather than presented as all-time (U-09).
 */
export function ledgerStats(exits: AuditedExit[]): {
  winRate: number;
  netYield: number;
  wins: number;
  total: number;
} {
  const total = exits.length;
  const wins = exits.filter((e) => e.is_win).length;
  const netYield = exits.reduce((sum, e) => sum + (e.pnl_usd ?? 0), 0);
  return {
    winRate: total > 0 ? (wins / total) * 100 : 0,
    netYield,
    wins,
    total,
  };
}
