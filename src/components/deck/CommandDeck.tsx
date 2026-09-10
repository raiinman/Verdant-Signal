/**
 * Terminal header / command deck (D-03).
 *
 * Replaces the reference's marketing masthead, which spent the first ~380px of
 * the desktop viewport on brand copy. Compact and operational: identity plus
 * live indicators. The free-group link (F-07) survives here as a deck action.
 */

import type { FeedState, VisitorStats } from '../../types/telemetry';
import './CommandDeck.css';

const FREE_GROUP_URL = 'https://t.me/+gVBFLwyprvk2NGRk';

interface Props {
  feedState: FeedState;
  syncAge: number;
  activeSlots: number;
  maxSlots: number;
  visitors: VisitorStats | null;
  onRetry: () => void;
}

const FEED_COPY: Record<FeedState, { label: string; tone: string }> = {
  LOADING: { label: 'SYNCING', tone: 'loading' },
  LIVE: { label: 'STREAM LIVE', tone: 'live' },
  STALE: { label: 'STREAM STALE', tone: 'stale' },
  UNAVAILABLE: { label: 'FEED UNAVAILABLE', tone: 'down' },
};

export function CommandDeck({
  feedState,
  syncAge,
  activeSlots,
  maxSlots,
  visitors,
  onRetry,
}: Props) {
  const feed = FEED_COPY[feedState];

  return (
    <section className="vs-deck" aria-label="Terminal status">
      <div className="vs-deck__identity">
        <h1 className="vs-display vs-deck__title">Zenom Alpha</h1>
        <p className="vs-label vs-deck__subtitle">Systematic Prediction Terminal</p>
      </div>

      <div className="vs-deck__indicators">
        {/* Feed health. Label text carries the state, not colour alone. */}
        <span className="vs-deck__chip" data-tone={feed.tone}>
          <span
            className="vs-dot"
            data-pulse={feedState === 'LIVE'}
            aria-hidden="true"
          />
          <span className="vs-data">{feed.label}</span>
        </span>

        <span className="vs-deck__chip" data-tone="neutral">
          <span className="vs-data">BINANCE USD-M</span>
        </span>

        <span className="vs-deck__chip" data-tone="neutral">
          <span className="vs-data">
            {activeSlots} / {maxSlots} SIGNAL SLOTS
          </span>
        </span>

        {/*
          LAST SYNC reports a measured age. The transport is 3s polling, not a
          socket, so the number is the honest claim (U-12).
        */}
        <span className="vs-deck__chip" data-tone="neutral">
          <span className="vs-data">LAST SYNC {syncAge}s</span>
        </span>

        {visitors && (
          <span className="vs-deck__chip" data-tone="neutral">
            <span className="vs-data">{visitors.live_online} TRADERS ONLINE</span>
          </span>
        )}

        {feedState === 'UNAVAILABLE' && (
          <button type="button" className="vs-deck__retry" onClick={onRetry}>
            RETRY
          </button>
        )}

        <a
          className="vs-deck__link"
          href={FREE_GROUP_URL}
          target="_blank"
          rel="noreferrer noopener"
        >
          FREE GROUP →
        </a>
      </div>

      {/* Feed health is announced, not just coloured. */}
      <p className="vs-visually-hidden" role="status" aria-live="polite">
        Telemetry {feed.label.toLowerCase()}, last synchronised {syncAge} seconds ago.
      </p>
    </section>
  );
}
