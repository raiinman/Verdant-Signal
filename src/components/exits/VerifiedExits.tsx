/**
 * RECENT VERIFIED EXITS (F-04) — the strip directly below the terminal.
 *
 * Verification is Temple Gold, not fluorescent green: it marks a milestone, not
 * a positive action (D-10). Losing rows keep their real negative value and are
 * labelled CAPITAL GUARDED, exactly as the reference does.
 *
 * Win rate and net yield are computed over the rows actually returned and are
 * labelled as scoped to that ledger, never as an all-time claim (U-09).
 */

import { caret, ledgerStats, signedPct, signedUsd } from '../../lib/format';
import type { AuditedExit } from '../../types/telemetry';
import './VerifiedExits.css';

interface Props {
  exits: AuditedExit[];
  onViewAll: () => void;
}

/** Desktop shows 2–5 entries where space permits; the rest live in the journal. */
const MAX_VISIBLE = 5;

export function VerifiedExits({ exits, onViewAll }: Props) {
  const visible = exits.slice(0, MAX_VISIBLE);
  const stats = ledgerStats(exits);

  if (visible.length === 0) {
    return (
      <section className="vs-exits vs-panel" aria-labelledby="exits-h">
        <h2 id="exits-h" className="vs-display vs-exits__title">
          Recent Verified Exits
        </h2>
        <p className="vs-exits__empty vs-data">NO CLOSED TRADES IN THE RETURNED LEDGER</p>
      </section>
    );
  }

  return (
    <section className="vs-exits vs-panel" aria-labelledby="exits-h">
      <header className="vs-exits__head">
        <h2 id="exits-h" className="vs-display vs-exits__title">
          Recent Verified Exits
        </h2>
        <p className="vs-exits__stats vs-data">
          <span>
            {stats.wins}/{stats.total} WINS · {stats.winRate.toFixed(1)}%
          </span>
          <span className="vs-exits__sep" aria-hidden="true">
            ·
          </span>
          <span className={stats.netYield >= 0 ? 'vs-pos' : 'vs-neg'}>
            {signedUsd(stats.netYield)} NET
          </span>
        </p>
      </header>
      <hr className="vs-rule" />

      <ul className="vs-exits__list">
        {visible.map((exit, i) => (
          <li key={`${exit.clean_symbol}-${i}`} className="vs-exitcard">
            <div className="vs-exitcard__top">
              <span className="vs-data vs-exitcard__sym">{exit.sym}</span>
              <span className="vs-exitcard__verify" title="Verified on Binance USD-M">
                <span aria-hidden="true">✦</span> VERIFIED
              </span>
            </div>

            <p className="vs-exitcard__meta vs-data">LONG · 10×</p>

            <p className={`vs-data vs-exitcard__roe ${exit.is_win ? 'vs-pos' : 'vs-neg'}`}>
              <span aria-hidden="true">{caret(exit.is_win ? 1 : -1)}</span>
              {signedPct(exit.is_win ? exit.roe : -exit.roe)} ROE
            </p>

            <p className={`vs-data vs-exitcard__pnl ${exit.pnl_usd >= 0 ? 'vs-pos' : 'vs-neg'}`}>
              {signedUsd(exit.pnl_usd)} BANKED
            </p>

            <p className="vs-exitcard__outcome" data-win={exit.is_win}>
              {exit.is_win ? 'TAKE PROFIT' : 'CAPITAL GUARDED'}
            </p>
            <p className="vs-exitcard__time vs-data">{exit.date}</p>
          </li>
        ))}
      </ul>

      <footer className="vs-exits__foot">
        <button type="button" className="vs-exits__viewall" onClick={onViewAll}>
          View all verified exits →
        </button>
      </footer>
    </section>
  );
}
