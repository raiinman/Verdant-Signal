/**
 * THE MASKING CONTRACT — the functional core of Zenom Alpha.
 *
 * Ported verbatim from the reference's renderTelemetry(). This is the only place
 * masking is decided; never duplicate it into a component (CLAUDE.md §4).
 *
 * Reference predicate, unchanged:
 *   isUnmasked = isVipUser || (isFreeCall && isFreeUnlocked)
 *
 * Reference presentation rules, unchanged:
 *   - Every slot stays structurally visible. Only protected values are obscured.
 *   - Free slots show REAL RoE and PnL even while locked.
 *   - Locked VIP slots show real RoE/PnL only when positive; when negative the
 *     reference substitutes 'ACTIVE RANGE' / 'SL Guarded' and swaps the badge to
 *     'ACCUMULATION'. It never shows a negative number on a locked VIP slot.
 */

import type { Entitlement, Position } from '../types/telemetry';

/** The glyph block standing in for a protected value (D-06). */
export const MASK_GLYPH = '▓▓▓▓';

export interface SlotView {
  /** Slot ordinal, 1-based. */
  index: number;
  position: Position;
  isFreeCall: boolean;
  isUnmasked: boolean;
  /** Title: real symbol, or the reference's locked placeholder. */
  title: string;
  /** 'B' | 'S' when unmasked; null when the side must stay hidden. */
  sideLetter: 'B' | 'S' | null;
  leverageLabel: string;
  /** Formatted RoE, or the reference's 'ACTIVE RANGE' substitution. */
  roeText: string;
  /** Formatted uPnL, or the reference's 'SL Guarded' substitution. */
  pnlText: string;
  /** True when roeText/pnlText hold a real number (drives colour + caret). */
  hasNumericValue: boolean;
  isWin: boolean;
  entryText: string;
  markText: string;
  tpText: string;
  slText: string;
  sizeText: string;
  marginText: string;
  badge: SlotBadge;
  action: SlotAction;
}

export type SlotBadge =
  | { kind: 'LOCKED_WIN'; label: 'LOCKED WIN' }
  | { kind: 'NEAR_STOP'; label: 'NEAR STOP' }
  | { kind: 'ACCUMULATION'; label: 'ACCUMULATION' }
  | { kind: 'SL_PROTECTED'; label: 'SL PROTECTED' };

export type SlotAction =
  | { kind: 'COPY' }
  | { kind: 'UNLOCK_FREE'; slot: number }
  | { kind: 'UNLOCK_VIP'; slot: number };

/**
 * Reference fmtPrice: 5 significant decimals for sub-dollar prices, 4 otherwise.
 * Matches the reference's on-screen output.
 */
export function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const abs = Math.abs(value);
  if (abs === 0) return '0.00';
  if (abs < 0.001) return value.toFixed(7);
  if (abs < 1) return value.toFixed(5);
  if (abs < 100) return value.toFixed(4);
  return value.toFixed(2);
}

/** Reference: size = |amount x mark_price|, margin = size / 10. */
export function deriveSize(p: Position): { size: number; margin: number } {
  const size = p.amount && p.mark_price ? Math.abs(p.amount * p.mark_price) : 70;
  return { size, margin: size / 10 };
}

/**
 * Reference fallback: when the server omits is_free_stream, the first two
 * positions are treated as the free tier.
 */
export function isFreeCall(p: Position, index: number): boolean {
  return p.is_free_stream !== undefined ? p.is_free_stream : index < 2;
}

function badgeFor(p: Position, locked: boolean, isWin: boolean): SlotBadge {
  // A locked VIP slot that is losing is presented as ACCUMULATION (reference rule).
  if (locked && !isWin) return { kind: 'ACCUMULATION', label: 'ACCUMULATION' };
  if (p.signal_status === 'LOCKED_PROFIT' || p.profit_locked) {
    return { kind: 'LOCKED_WIN', label: 'LOCKED WIN' };
  }
  if (p.signal_status === 'EXIT_WARNING') return { kind: 'NEAR_STOP', label: 'NEAR STOP' };
  return { kind: 'SL_PROTECTED', label: 'SL PROTECTED' };
}

/** Builds the presentation view for one slot under the current entitlement. */
export function buildSlotView(
  p: Position,
  index: number,
  entitlement: Entitlement,
): SlotView {
  const free = isFreeCall(p, index);
  const isVip = entitlement === 'VIP';
  const isFreeUnlocked = entitlement === 'FREE_UNLOCKED' || isVip;

  // The reference predicate, verbatim.
  const isUnmasked = isVip || (free && isFreeUnlocked);

  const roe = p.roe_pct ?? 0;
  const upnl = p.upnl_usd ?? 0;
  const isWin = roe >= 0;
  const sign = isWin ? '+' : '-';
  const { size, margin } = deriveSize(p);

  if (isUnmasked) {
    const symbol = (p.symbol ?? 'ALPHA').toUpperCase();
    return {
      index: index + 1,
      position: p,
      isFreeCall: free,
      isUnmasked: true,
      title: symbol,
      sideLetter: p.side?.toUpperCase().includes('BUY') ? 'B' : 'S',
      leverageLabel: `CROSS ${p.leverage ?? 10}X`,
      roeText: `${sign}${Math.abs(roe).toFixed(2)}%`,
      pnlText: `${sign}$${Math.abs(upnl).toFixed(2)}`,
      hasNumericValue: true,
      isWin,
      entryText: formatPrice(p.entry_price),
      markText: formatPrice(p.mark_price),
      tpText: formatPrice(p.take_profit_px),
      slText: formatPrice(p.stop_loss_px),
      sizeText: size.toFixed(2),
      marginText: margin.toFixed(2),
      badge: badgeFor(p, false, isWin),
      action: { kind: 'COPY' },
    };
  }

  // Locked. Six protected fields are always obscured; identity depends on tier.
  const masked = {
    entryText: MASK_GLYPH,
    markText: MASK_GLYPH,
    tpText: MASK_GLYPH,
    slText: MASK_GLYPH,
    sizeText: MASK_GLYPH,
    marginText: MASK_GLYPH,
  };

  if (free) {
    // Free tier locked: real RoE and PnL are still shown (reference behaviour).
    return {
      index: index + 1,
      position: p,
      isFreeCall: true,
      isUnmasked: false,
      title: `FREE COMMUNITY SETUP #${index + 1}`,
      sideLetter: null,
      leverageLabel: '10X ALGO',
      roeText: `${sign}${Math.abs(roe).toFixed(2)}%`,
      pnlText: `${sign}$${Math.abs(upnl).toFixed(2)}`,
      hasNumericValue: true,
      isWin,
      ...masked,
      badge: badgeFor(p, false, isWin),
      action: { kind: 'UNLOCK_FREE', slot: index + 1 },
    };
  }

  // VIP tier locked: positive values shown, negative values suppressed.
  return {
    index: index + 1,
    position: p,
    isFreeCall: false,
    isUnmasked: false,
    title: `VIP QUANT ALPHA #${index + 1}`,
    sideLetter: null,
    leverageLabel: 'VIP LOCKED',
    roeText: isWin ? `+${roe.toFixed(2)}%` : 'ACTIVE RANGE',
    pnlText: isWin ? `+$${Math.abs(upnl).toFixed(2)}` : 'SL GUARDED',
    hasNumericValue: isWin,
    isWin,
    ...masked,
    badge: badgeFor(p, true, isWin),
    action: { kind: 'UNLOCK_VIP', slot: index + 1 },
  };
}

/** Clipboard payload for an unlocked signal — the reference's exact format. */
export function buildCopyText(view: SlotView): string {
  return [
    'Zenom Alpha Signal',
    `PAIR: ${view.title} (Cross ${view.position.leverage ?? 10}X)`,
    `Entry: ${view.entryText}`,
    `TP Target: ${view.tpText} (+80% ROE)`,
    `Stop Loss: ${view.slText}`,
    'Status: Active',
  ].join('\n');
}
