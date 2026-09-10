/**
 * Right-side system status rail (F-01).
 *
 * Same four telemetry values the reference shows, re-presented as equipment
 * tiles rather than fintech KPI cards, plus the roadmap progression.
 *
 * Roadmap honesty (U-10): only the $100 tier has telemetry behind it. The $200
 * and $1K tiers render as explicitly unreached future milestones with no
 * fabricated progress.
 */

import { signedPct, signedUsd, usd } from '../../lib/format';
import type { FeedState, Telemetry } from '../../types/telemetry';
import './StatusRail.css';

interface Props {
  telemetry: Telemetry | null;
  feedState: FeedState;
  cachedEquity: number | null;
  cachedBanked: number | null;
}

/** Static label from the reference; not derived from telemetry (U-06). */
const BANKED_SUBLABEL = 'Locked Principal (+103%)';

export function StatusRail({ telemetry, feedState, cachedEquity, cachedBanked }: Props) {
  const stale = feedState === 'STALE' || feedState === 'UNAVAILABLE';

  // Before the first poll lands we show cached values, labelled STALE — the
  // reference shows the same numbers but calls them REAL-TIME (D-07).
  const equity = telemetry?.total_usdt_balance ?? cachedEquity;
  const banked = telemetry?.wallet_usdt_balance ?? cachedBanked;
  const showingCache = telemetry === null && equity !== null;

  return (
    <aside className="vs-rail" aria-label="System status">
      <div className="vs-rail__tiles">
        <Tile
          label="Margin Equity"
          value={equity === null ? '—' : usd(equity)}
          sub="Binance Futures Net"
          tone={stale || showingCache ? 'stale' : 'live'}
          badge={stale || showingCache ? 'STALE' : 'REAL-TIME'}
          dominant
        />

        <Tile
          label="24H Performance"
          value={telemetry ? signedPct(telemetry.net_gain_pct) : '—'}
          sub={telemetry ? `${signedUsd(telemetry.net_profit_usdt)} today` : '—'}
          tone={telemetry && telemetry.net_gain_pct >= 0 ? 'positive' : 'negative'}
          badge="TODAY"
        />

        <Tile
          label="Realized"
          value={banked === null ? '—' : usd(banked)}
          sub={BANKED_SUBLABEL}
          tone="verified"
          badge="SECURE"
        />

        <Tile
          label="Principal"
          value={telemetry ? usd(telemetry.available_usdt_balance) : '—'}
          sub="Available margin"
          tone="neutral"
          badge="FREE"
        />
      </div>

      <section className="vs-rail__roadmap vs-tile" aria-labelledby="roadmap-h">
        <h2 id="roadmap-h" className="vs-display vs-rail__roadmaptitle">
          Roadmap
        </h2>

        <ol className="vs-rail__stages">
          <Stage
            label="$100"
            state={
              telemetry && telemetry.goal_progress_pct >= 100 ? 'complete' : 'active'
            }
            pct={telemetry?.goal_progress_pct ?? 0}
            detail={
              telemetry
                ? `${usd(telemetry.total_usdt_balance)} / ${usd(telemetry.target_goal_usdt, 0)}`
                : '—'
            }
          />
          {/* No telemetry exists for these tiers. Shown as future, never as progress. */}
          <Stage label="$200" state="future" detail="Not yet reached" />
          <Stage label="$1K" state="future" detail="Not yet reached" />
        </ol>
      </section>
    </aside>
  );
}

function Tile({
  label,
  value,
  sub,
  tone,
  badge,
  dominant,
}: {
  label: string;
  value: string;
  sub: string;
  tone: string;
  badge: string;
  dominant?: boolean;
}) {
  return (
    <article className="vs-tile vs-railtile" data-tone={tone} data-dominant={dominant}>
      <header className="vs-railtile__head">
        <h3 className="vs-label vs-railtile__label">{label}</h3>
        <span className="vs-railtile__badge vs-data">{badge}</span>
      </header>
      <p className="vs-data vs-railtile__value">{value}</p>
      <p className="vs-railtile__sub">{sub}</p>
    </article>
  );
}

function Stage({
  label,
  state,
  pct,
  detail,
}: {
  label: string;
  state: 'complete' | 'active' | 'future';
  pct?: number;
  detail: string;
}) {
  return (
    <li className="vs-stage" data-state={state}>
      <div className="vs-stage__row">
        <span className="vs-stage__marker" aria-hidden="true">
          {state === 'complete' ? '✦' : state === 'active' ? '◆' : '◇'}
        </span>
        <span className="vs-data vs-stage__label">{label}</span>
        <span className="vs-stage__detail vs-data">{detail}</span>
      </div>
      {state === 'active' && (
        <div
          className="vs-stage__track"
          role="progressbar"
          aria-valuenow={Math.round(pct ?? 0)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progress toward the $100 tier"
        >
          <div className="vs-stage__fill" style={{ width: `${Math.min(100, pct ?? 0)}%` }} />
        </div>
      )}
    </li>
  );
}
