/**
 * Application shell — vertical slice 1.
 *
 * Composition: global top bar, command deck, 70/30 workstation (terminal +
 * status rail), verified-exit strip, footer disclosure.
 *
 * Not yet built (slice 2): performance/journal workspace, the four-stage access
 * flow, and the legal overlays. Their triggers already route here and surface an
 * honest "not yet built" acknowledgement rather than failing silently.
 */

import { useCallback, useState } from 'react';
import { CommandDeck } from './components/deck/CommandDeck';
import { VerifiedExits } from './components/exits/VerifiedExits';
import { Toast } from './components/primitives/Toast';
import { StatusRail } from './components/rail/StatusRail';
import { TopBar, type Section } from './components/shell/TopBar';
import { SignalTerminal } from './components/terminal/SignalTerminal';
import { useSession } from './hooks/useSession';
import { useTelemetry } from './hooks/useTelemetry';
import { useToast } from './hooks/useToast';
import './App.css';

/** Verbatim from the reference footer. Legal text is never paraphrased. */
const RISK_NOTICE =
  'HIGH-RISK TRADING WARNING & ZERO ACCOUNTABILITY NOTICE: Trading digital assets, ' +
  'perpetual futures contracts, and leveraged derivatives involves substantial risk of ' +
  'financial loss and is not appropriate for all persons. All quantitative trading signals, ' +
  'algorithmic setups, and automated telemetry displayed on Zenom Alpha and associated ' +
  'channels are strictly simulated informational outputs for educational purposes. Nothing ' +
  'herein constitutes investment, financial, legal, or tax advice. All trading decisions you ' +
  'execute are solely and exclusively at your own personal risk. Zenom Alpha, its developers, ' +
  'operators, and contributors assume zero liability, accountability, or legal responsibility ' +
  'for any trading losses, liquidations, slippage, system delays, or exchange execution outcomes.';

export function App() {
  const { telemetry, visitors, feedState, syncAge, cachedEquity, cachedBanked, retry } =
    useTelemetry();
  const { session, disconnect } = useSession();
  const { message, show } = useToast();
  const [section, setSection] = useState<Section>('TERMINAL');

  const handleCopy = useCallback(
    (text: string) => {
      navigator.clipboard
        .writeText(text)
        .then(() => show('✓ Signal setup copied to clipboard'))
        .catch(() => show('Clipboard unavailable — copy blocked by the browser'));
    },
    [show],
  );

  // Slice-2 surfaces. Acknowledged explicitly rather than dead-ending.
  const pending = useCallback(
    (what: string) => show(`${what} arrives in the next implementation pass`),
    [show],
  );

  return (
    <>
      <a className="vs-skip-link" href="#terminal">
        Skip to the signal terminal
      </a>

      <TopBar
        session={session}
        active={section}
        onNavigate={(next) => {
          setSection(next);
          if (next === 'PERFORMANCE') pending('The performance journal');
          if (next === 'ACCESS') pending('The VIP access flow');
        }}
        onConnect={() => pending('Telegram connection')}
        onDisconnect={disconnect}
        onGetVip={() => pending('The VIP access flow')}
      />

      <main className="vs-shell" id="main">
        <CommandDeck
          feedState={feedState}
          syncAge={syncAge}
          activeSlots={telemetry?.active_positions_count ?? 0}
          maxSlots={telemetry?.max_slots ?? 10}
          visitors={visitors}
          onRetry={retry}
        />

        {/* 70 / 30 — the terminal is the hero (D-04). */}
        <div className="vs-shell__workstation" id="terminal">
          <SignalTerminal
            positions={telemetry?.positions ?? []}
            maxSlots={telemetry?.max_slots ?? 10}
            entitlement={session.entitlement}
            feedState={feedState}
            onUnlockFree={() => pending('Telegram connection')}
            onUnlockVip={() => pending('The VIP access flow')}
            onCopy={handleCopy}
          />

          <StatusRail
            telemetry={telemetry}
            feedState={feedState}
            cachedEquity={cachedEquity}
            cachedBanked={cachedBanked}
          />
        </div>

        <VerifiedExits
          exits={telemetry?.audited_exits ?? []}
          onViewAll={() => pending('The verified-exit archive')}
        />

        <footer className="vs-footer">
          <hr className="vs-rule" />
          <nav className="vs-footer__links" aria-label="Legal">
            <button type="button" onClick={() => pending('The risk disclaimer')}>
              Risk Disclaimer &amp; Liability Waiver
            </button>
            <button type="button" onClick={() => pending('The privacy policy')}>
              Privacy Policy
            </button>
            <button type="button" onClick={() => pending('The terms of execution')}>
              Terms of Execution
            </button>
          </nav>
          <p className="vs-footer__notice">{RISK_NOTICE}</p>
        </footer>
      </main>

      <Toast message={message} />
    </>
  );
}
