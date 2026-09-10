/**
 * Telemetry feed.
 *
 * Preserves the reference's 3s /api/status poll and 15s /api/visitor-stats poll,
 * with two corrections (D-07):
 *   - Errors surface as UNAVAILABLE instead of being swallowed by `catch (e) {}`.
 *   - localStorage rehydration is labelled STALE instead of masquerading as LIVE.
 *
 * Intervals are cleaned up on unmount; the reference leaks all of its timers.
 *
 * With no VITE_API_BASE configured the committed fixture is served through the
 * same adapter, with drift applied only to values the live feed also moves
 * (D-14). No instrument, exit, or user is ever generated.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import fixture from '../fixtures/telemetry.json';
import type { FeedState, Telemetry, VisitorStats } from '../types/telemetry';

const STATUS_INTERVAL_MS = 3000;
const VISITOR_INTERVAL_MS = 15000;
const STALE_AFTER_MS = 12000;

const API_BASE = import.meta.env.VITE_API_BASE ?? '';
const USE_FIXTURE = API_BASE === '';

const LS_EQUITY = 'vs_last_equity';
const LS_BANKED = 'vs_last_banked';

const BASE: Telemetry = fixture as Telemetry;

/** Fixture drift: perturbs only mark price, uPnL, RoE and equity. */
function driftedFixture(tick: number): Telemetry {
  const wobble = (seed: number, amp: number) =>
    Math.sin((tick + seed * 17) / 6.5) * amp;

  const positions = BASE.positions.map((p, i) => {
    const markDelta = 1 + wobble(i, 0.0016);
    const mark = p.mark_price * markDelta;
    const direction = p.entry_price >= p.mark_price ? 1 : -1;
    const roe = p.roe_pct + wobble(i + 3, 0.42) * direction;
    const upnl = p.upnl_usd * (1 + wobble(i + 5, 0.03));
    return { ...p, mark_price: mark, roe_pct: roe, upnl_usd: upnl };
  });

  const unrealized = positions.reduce((s, p) => s + p.upnl_usd, 0);
  const equity = BASE.wallet_usdt_balance + unrealized;

  return {
    ...BASE,
    positions,
    updated_utc: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
    total_unrealized_profit: Number(unrealized.toFixed(2)),
    total_usdt_balance: Number(equity.toFixed(2)),
    goal_progress_pct: Number(((equity / BASE.target_goal_usdt) * 100).toFixed(1)),
  };
}

function readCached(key: string): number | null {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? null : Number(raw);
  } catch {
    return null;
  }
}

function writeCached(key: string, value: number): void {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    /* private mode or blocked storage — a cache miss is not an error */
  }
}

export interface TelemetryFeed {
  telemetry: Telemetry | null;
  visitors: VisitorStats | null;
  feedState: FeedState;
  /** Seconds since the last successful poll; drives LAST SYNC. */
  syncAge: number;
  /** Values rehydrated from localStorage before the first poll (STALE). */
  cachedEquity: number | null;
  cachedBanked: number | null;
  retry: () => void;
}

export function useTelemetry(): TelemetryFeed {
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
  const [visitors, setVisitors] = useState<VisitorStats | null>(null);
  const [feedState, setFeedState] = useState<FeedState>('LOADING');
  const [syncAge, setSyncAge] = useState(0);

  const cachedEquity = useRef(readCached(LS_EQUITY)).current;
  const cachedBanked = useRef(readCached(LS_BANKED)).current;

  const lastOkRef = useRef<number>(0);
  const tickRef = useRef(0);

  const pullStatus = useCallback(async () => {
    tickRef.current += 1;

    if (USE_FIXTURE) {
      const next = driftedFixture(tickRef.current);
      setTelemetry(next);
      setFeedState('LIVE');
      lastOkRef.current = Date.now();
      writeCached(LS_EQUITY, next.total_usdt_balance);
      writeCached(LS_BANKED, next.wallet_usdt_balance);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/status`, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = (await res.json()) as Telemetry;
      setTelemetry(data);
      setFeedState('LIVE');
      lastOkRef.current = Date.now();
      writeCached(LS_EQUITY, data.total_usdt_balance);
      writeCached(LS_BANKED, data.wallet_usdt_balance);
    } catch {
      // The reference swallows this. We surface it.
      setFeedState((prev) => (prev === 'LOADING' ? 'UNAVAILABLE' : 'STALE'));
    }
  }, []);

  const pullVisitors = useCallback(async () => {
    if (USE_FIXTURE) {
      // Held at the observed value; drifting a user count would invent users.
      setVisitors({
        live_online: 22,
        total_views: 1554,
        unique_visitors: 966,
        mobile_count: 846,
        desktop_count: 708,
      });
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/visitor-stats`, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) return;
      setVisitors((await res.json()) as VisitorStats);
    } catch {
      /* non-critical: the count simply stops updating */
    }
  }, []);

  useEffect(() => {
    void pullStatus();
    const id = setInterval(() => void pullStatus(), STATUS_INTERVAL_MS);
    return () => clearInterval(id);
  }, [pullStatus]);

  useEffect(() => {
    void pullVisitors();
    const id = setInterval(() => void pullVisitors(), VISITOR_INTERVAL_MS);
    return () => clearInterval(id);
  }, [pullVisitors]);

  // Age ticker: promotes LIVE to STALE when polls stop landing.
  useEffect(() => {
    const id = setInterval(() => {
      if (lastOkRef.current === 0) return;
      const age = Math.round((Date.now() - lastOkRef.current) / 1000);
      setSyncAge(age);
      if (age * 1000 > STALE_AFTER_MS) {
        setFeedState((prev) => (prev === 'LIVE' ? 'STALE' : prev));
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return {
    telemetry,
    visitors,
    feedState,
    syncAge,
    cachedEquity,
    cachedBanked,
    retry: () => void pullStatus(),
  };
}
