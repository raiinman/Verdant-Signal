/**
 * ACTIVE ALPHA SIGNALS — the hero (D-05).
 *
 * Desktop (>=1024px): an eight-column table whose rows behave as selectable
 * equipment objects. Below that: compact summary cards that expand on tap,
 * because an eight-column table must never reach a phone.
 *
 * Locked rows keep their full structure; only protected values are obscured,
 * and there is no lock overlay (D-06).
 */

import { useId, useState } from 'react';
import { buildCopyText, buildSlotView, type SlotView } from '../../lib/masking';
import { caret } from '../../lib/format';
import type { Entitlement, FeedState, Position } from '../../types/telemetry';
import './SignalTerminal.css';

interface Props {
  positions: Position[];
  maxSlots: number;
  entitlement: Entitlement;
  feedState: FeedState;
  onUnlockFree: () => void;
  onUnlockVip: () => void;
  onCopy: (text: string) => void;
}

const COLUMNS = ['PAIR', 'SIDE', 'ENTRY', 'MARK', 'TP', 'SL', 'ROE', 'STATUS'] as const;

export function SignalTerminal({
  positions,
  maxSlots,
  entitlement,
  feedState,
  onUnlockFree,
  onUnlockVip,
  onCopy,
}: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const headingId = useId();

  const views = positions.map((p, i) => buildSlotView(p, i, entitlement));
  const emptySlots = Math.max(0, maxSlots - views.length);

  const handleAction = (view: SlotView) => {
    if (view.action.kind === 'COPY') onCopy(buildCopyText(view));
    else if (view.action.kind === 'UNLOCK_FREE') onUnlockFree();
    else onUnlockVip();
  };

  return (
    <section className="vs-terminal vs-panel" aria-labelledby={headingId}>
      <header className="vs-terminal__head">
        <h2 id={headingId} className="vs-display vs-terminal__title">
          Active Alpha Signals
        </h2>
        <span className="vs-terminal__count vs-data">
          {views.length} ACTIVE · {emptySlots} OPEN
        </span>
      </header>
      <hr className="vs-rule" />

      {feedState === 'LOADING' && views.length === 0 ? (
        <SkeletonRows count={6} />
      ) : views.length === 0 ? (
        <p className="vs-terminal__empty vs-data">
          NO ACTIVE SIGNALS · 0 / {maxSlots} SLOTS
        </p>
      ) : (
        <>
          {/* ---------------------------------------------- desktop table */}
          <div className="vs-terminal__tablewrap">
            <table className="vs-terminal__table">
              <caption className="vs-visually-hidden">
                Active algorithmic signal slots. Protected values are masked until the
                corresponding tier is unlocked.
              </caption>
              <colgroup>
                <col className="vs-col-pair" />
                <col className="vs-col-side" />
                <col className="vs-col-num" />
                <col className="vs-col-num" />
                <col className="vs-col-num" />
                <col className="vs-col-num" />
                <col className="vs-col-roe" />
                <col className="vs-col-status" />
                <col className="vs-col-action" />
              </colgroup>
              <thead>
                <tr>
                  {COLUMNS.map((col) => (
                    <th key={col} scope="col" className="vs-label">
                      {col}
                    </th>
                  ))}
                  <th scope="col" className="vs-label">
                    <span className="vs-visually-hidden">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {views.map((view) => (
                  <Row
                    key={`${view.title}-${view.index}`}
                    view={view}
                    selected={selected === view.index}
                    onSelect={() =>
                      setSelected((prev) => (prev === view.index ? null : view.index))
                    }
                    onAction={() => handleAction(view)}
                  />
                ))}
                {Array.from({ length: emptySlots }, (_, i) => (
                  <tr key={`empty-${i}`} className="vs-terminal__row" data-empty="true">
                    <td colSpan={9} className="vs-terminal__emptyslot vs-data">
                      SLOT AVAILABLE
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ------------------------------------------------ mobile cards */}
          <ul className="vs-terminal__cards">
            {views.map((view) => (
              <SlotCard
                key={`c-${view.title}-${view.index}`}
                view={view}
                expanded={selected === view.index}
                onToggle={() =>
                  setSelected((prev) => (prev === view.index ? null : view.index))
                }
                onAction={() => handleAction(view)}
              />
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ row -- */

function Row({
  view,
  selected,
  onSelect,
  onAction,
}: {
  view: SlotView;
  selected: boolean;
  onSelect: () => void;
  onAction: () => void;
}) {
  const polarity = view.hasNumericValue ? (view.isWin ? 'vs-pos' : 'vs-neg') : '';

  return (
    <>
      <tr
        className="vs-terminal__row vs-brackets"
        data-selected={selected}
        data-locked={!view.isUnmasked}
        aria-selected={selected}
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect();
          }
        }}
      >
        <td className="vs-terminal__pair">
          <span className="vs-brackets-b" aria-hidden="true" />
          {!view.isUnmasked && (
            <span className="vs-terminal__lock" aria-hidden="true">
              ⯀
            </span>
          )}
          <span className="vs-data vs-terminal__symbol">{view.title}</span>
          <span className="vs-terminal__lev">{view.leverageLabel}</span>
        </td>

        <td className="vs-data">
          {view.sideLetter ? (
            <span className="vs-terminal__side" data-side={view.sideLetter}>
              {view.sideLetter}
            </span>
          ) : (
            <span className="vs-masked" aria-label="Side hidden until unlocked">
              ——
            </span>
          )}
        </td>

        <MaskedCell text={view.entryText} masked={!view.isUnmasked} />
        <MaskedCell text={view.markText} masked={!view.isUnmasked} live />
        <MaskedCell text={view.tpText} masked={!view.isUnmasked} tone="pos" />
        <MaskedCell text={view.slText} masked={!view.isUnmasked} tone="neg" />

        <td
          className={`vs-data vs-terminal__roe ${polarity}`}
          data-suppressed={!view.hasNumericValue}
        >
          {view.hasNumericValue && (
            <span aria-hidden="true" className="vs-terminal__caret">
              {caret(view.isWin ? 1 : -1)}
            </span>
          )}
          {view.roeText}
        </td>

        <td>
          <span className="vs-terminal__badge" data-kind={view.badge.kind}>
            {view.badge.label}
          </span>
        </td>

        <td className="vs-terminal__actioncell">
          <button
            type="button"
            className="vs-terminal__action"
            data-kind={view.action.kind}
            onClick={(e) => {
              e.stopPropagation();
              onAction();
            }}
          >
            {view.action.kind === 'COPY'
              ? 'COPY'
              : view.action.kind === 'UNLOCK_FREE'
                ? 'UNLOCK'
                : 'GET VIP'}
            <span className="vs-visually-hidden"> {view.title}</span>
          </button>
        </td>
      </tr>

      {selected && (
        <tr className="vs-terminal__detailrow">
          <td colSpan={9}>
            <DetailPane view={view} />
          </td>
        </tr>
      )}
    </>
  );
}

function MaskedCell({
  text,
  masked,
  tone,
  live,
}: {
  text: string;
  masked: boolean;
  tone?: 'pos' | 'neg';
  live?: boolean;
}) {
  const toneClass = tone === 'pos' ? 'vs-pos' : tone === 'neg' ? 'vs-neg' : '';
  return (
    <td className={`vs-data ${masked ? '' : toneClass} ${live ? 'vs-terminal__mark' : ''}`}>
      {masked ? (
        <span className="vs-masked" aria-label="Locked value">
          {text}
        </span>
      ) : (
        text
      )}
    </td>
  );
}

/* ---------------------------------------------------------- detail pane -- */

/**
 * Fields shown here already exist in the reference's card grid. Nothing is
 * invented to fill space (directive: SIGNAL DETAILS).
 */
function DetailPane({ view }: { view: SlotView }) {
  const p = view.position;
  return (
    <div className="vs-detail">
      <dl className="vs-detail__grid">
        <Field label="Size (USDT)" value={view.sizeText} masked={!view.isUnmasked} />
        <Field label="Margin (USDT)" value={view.marginText} masked={!view.isUnmasked} />
        <Field label="Leverage" value={`${p.leverage}×`} />
        <Field label="uPnL (USDT)" value={view.pnlText} />
        <Field label="Lifecycle" value={view.badge.label} />
        <Field
          label="Tier"
          value={view.isFreeCall ? 'FREE COMMUNITY CALL' : 'VIP ALPHA PASS'}
        />
      </dl>
      {!view.isUnmasked && (
        <p className="vs-detail__note vs-data">
          {view.isFreeCall
            ? 'CONNECT TELEGRAM TO REVEAL ENTRY, MARK, TP AND SL FOR THIS SLOT.'
            : 'VIP ACCESS REVEALS ENTRY, MARK, TP AND SL FOR THIS SLOT.'}
        </p>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  masked,
}: {
  label: string;
  value: string;
  masked?: boolean;
}) {
  return (
    <div className="vs-detail__field">
      <dt className="vs-label">{label}</dt>
      <dd className={`vs-data vs-detail__value ${masked ? 'vs-masked' : ''}`}>{value}</dd>
    </div>
  );
}

/* --------------------------------------------------------- mobile card --- */

function SlotCard({
  view,
  expanded,
  onToggle,
  onAction,
}: {
  view: SlotView;
  expanded: boolean;
  onToggle: () => void;
  onAction: () => void;
}) {
  const polarity = view.hasNumericValue ? (view.isWin ? 'vs-pos' : 'vs-neg') : '';
  const panelId = `slot-panel-${view.index}`;

  return (
    <li className="vs-slotcard vs-brackets" data-selected={expanded}>
      <span className="vs-brackets-b" aria-hidden="true" />
      <button
        type="button"
        className="vs-slotcard__head"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span className="vs-slotcard__ident">
          {!view.isUnmasked && (
            <span className="vs-terminal__lock" aria-hidden="true">
              ⯀
            </span>
          )}
          <span className="vs-data vs-slotcard__symbol">{view.title}</span>
          <span className="vs-terminal__lev">{view.leverageLabel}</span>
        </span>
        <span
          className={`vs-data vs-slotcard__roe ${polarity}`}
          data-suppressed={!view.hasNumericValue}
        >
          {view.hasNumericValue && <span aria-hidden="true">{caret(view.isWin ? 1 : -1)}</span>}
          {view.roeText}
        </span>
      </button>

      <div className="vs-slotcard__meta">
        <span className="vs-terminal__badge" data-kind={view.badge.kind}>
          {view.badge.label}
        </span>
        <span
          className={`vs-data vs-slotcard__pnl ${polarity}`}
          data-suppressed={!view.hasNumericValue}
        >
          {view.pnlText}
        </span>
      </div>

      <div id={panelId} className="vs-slotcard__panel" hidden={!expanded}>
        <dl className="vs-detail__grid">
          <Field label="Entry" value={view.entryText} masked={!view.isUnmasked} />
          <Field label="Mark" value={view.markText} masked={!view.isUnmasked} />
          <Field label="TP" value={view.tpText} masked={!view.isUnmasked} />
          <Field label="SL" value={view.slText} masked={!view.isUnmasked} />
          <Field label="Size" value={view.sizeText} masked={!view.isUnmasked} />
          <Field label="Margin" value={view.marginText} masked={!view.isUnmasked} />
        </dl>
        <button type="button" className="vs-slotcard__action" onClick={onAction}>
          {view.action.kind === 'COPY'
            ? 'COPY SETUP'
            : view.action.kind === 'UNLOCK_FREE'
              ? `UNLOCK FREE SETUP #${view.index}`
              : `UNLOCK VIP SETUP #${view.index}`}
        </button>
      </div>
    </li>
  );
}

/* --------------------------------------------------------------- states -- */

function SkeletonRows({ count }: { count: number }) {
  return (
    <ul className="vs-terminal__skeleton" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="vs-terminal__skeletonrow" />
      ))}
    </ul>
  );
}
