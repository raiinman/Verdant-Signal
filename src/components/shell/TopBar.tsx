/**
 * Global top bar (D-02) — new in the redesign; the reference has no persistent
 * navigation at all. Framed as the upper edge of an equipment interface.
 *
 * Left: wordmark. Centre: section nav. Right: Telegram state + GET VIP.
 */

import type { Session } from '../../types/telemetry';
import './TopBar.css';

export type Section = 'TERMINAL' | 'EXITS' | 'PERFORMANCE' | 'ACCESS';

const SECTIONS: Section[] = ['TERMINAL', 'EXITS', 'PERFORMANCE', 'ACCESS'];

interface Props {
  session: Session;
  active: Section;
  onNavigate: (section: Section) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  onGetVip: () => void;
}

export function TopBar({
  session,
  active,
  onNavigate,
  onConnect,
  onDisconnect,
  onGetVip,
}: Props) {
  const connected = session.binding === 'CONNECTED' || session.entitlement !== 'GUEST';
  const tierLabel = session.entitlement === 'VIP' ? 'VIP' : 'FREE';

  return (
    <header className="vs-topbar">
      <div className="vs-topbar__inner">
        <div className="vs-topbar__brand">
          <span className="vs-topbar__sigil" aria-hidden="true" />
          <span className="vs-display vs-topbar__wordmark">Zenom Alpha</span>
        </div>

        <nav className="vs-topbar__nav" aria-label="Sections">
          <ul className="vs-topbar__navlist">
            {SECTIONS.map((section) => (
              <li key={section}>
                <button
                  type="button"
                  className="vs-topbar__navitem"
                  data-active={section === active}
                  aria-current={section === active ? 'page' : undefined}
                  onClick={() => onNavigate(section)}
                >
                  {section}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="vs-topbar__actions">
          {connected ? (
            <button
              type="button"
              className="vs-topbar__conn"
              data-tier={tierLabel}
              onClick={onDisconnect}
              title="Disconnect this Telegram handle"
            >
              <span className="vs-dot" data-pulse="true" aria-hidden="true" />
              <span className="vs-topbar__connlabel">
                CONNECTED {session.handle || `(${tierLabel})`}
              </span>
              {/* Narrow phones drop the handle but keep a word — a lone dot
                  communicates nothing on its own (V-04). */}
              <span className="vs-topbar__conncompact" aria-hidden="true">
                {tierLabel}
              </span>
              <span className="vs-visually-hidden">
                — activate to disconnect and re-lock protected signal data
              </span>
            </button>
          ) : (
            <button type="button" className="vs-topbar__conn" data-tier="NONE" onClick={onConnect}>
              <span className="vs-dot" aria-hidden="true" />
              <span className="vs-topbar__connlabel">CONNECT TELEGRAM</span>
              <span className="vs-topbar__conncompact" aria-hidden="true">
                CONNECT
              </span>
            </button>
          )}

          <button type="button" className="vs-topbar__vip" onClick={onGetVip}>
            GET VIP
          </button>
        </div>
      </div>
      <hr className="vs-rule vs-topbar__rule" />
    </header>
  );
}
