/** Ending + debrief (spec §1.1 rule 10): what happened → which choice caused it → what real NASA does. */
import { copy } from '../../content/copy';
import { sourceById } from '../../content/sources';
import { formatLog } from '../../content/format';
import { doseBadge } from '../../engine';
import type { GameState } from '../../engine/types';
import { Icon } from '../components/Icon';
import { engine } from '../engine';
import { fill, signed, ui } from '../text';

const KEY_NAMES: Record<string, string> = {
  LS: ui.lifeSupport,
  SH: ui.shield,
  BAT: ui.battery,
  LAB: 'Lab',
  SP: ui.stars,
  SPbanked: 'stars sent',
  DOSE: ui.badge,
  FOOD: 'food packs',
  H2O: 'water',
  O2T: 'oxygen tanks',
  PARTS: 'spare parts',
  MEDKIT: 'med kits',
  EN: 'crew energy',
  FUL: 'crew food',
  HYD: 'crew water',
  AIR: 'crew air',
  ENMAX: 'max energy',
  PWR: 'power',
};

export function Debrief({
  s,
  onAgain,
  onNew,
}: {
  s: GameState;
  onAgain: () => void;
  onNew: () => void;
  onSources?: () => void;
}) {
  const d = engine.debrief(s)!;
  const title =
    d.ending.kind === 'success'
      ? ui.success
      : d.ending.kind === 'safe-return'
        ? ui.safeReturn
        : ui.broughtHome;
  const badge = { green: ui.badgeGreen, yellow: ui.badgeYellow, red: ui.badgeRed }[
    doseBadge(d.stats.dose)
  ];
  return (
    <section class="center-screen" aria-labelledby="db-title">
      <div class={`debrief glass end-${d.ending.kind}`}>
        <p class="holo-tag">{copy.gameName}</p>
        <h1 id="db-title" tabIndex={-1} class="screen-title">
          <Icon name={d.ending.kind === 'success' ? 'SP' : 'COMPASS'} size={34} /> {title}
        </h1>
        <p class="kid-text">
          {formatLog({ sol: d.ending.sol, kind: 'ending', key: d.ending.reason })}
        </p>
        <p class="muted">
          {fill(ui.debriefStats, {
            banked: d.stats.spBanked,
            goal: d.stats.spGoal,
            dose: d.stats.dose,
            badge,
            sols: d.stats.sols,
          })}
        </p>
        <h2>{ui.debriefBig}</h2>
        <ol class="big-choices">
          {d.top3.map((t, i) => (
            <li key={i} class="glass">
              <p>
                <b>
                  {ui.sol} {t.choice.sol} · {t.eventTitle}
                </b>{' '}
                → “{t.actionTitle}”
              </p>
              <p class="small">
                <b>{ui.debriefCaused}:</b>{' '}
                {Object.entries(t.choice.deltas)
                  .filter(([, v]) => v !== 0)
                  .map(([k, v]) => `${KEY_NAMES[k] ?? k} ${signed(v)}`)
                  .join(' · ') || '—'}
                {t.choice.causedEvents.length > 0 && ` · led to a new event`}
              </p>
              {t.lesson && <p class="small">“{t.lesson}”</p>}
              <p class="small">
                <b>{ui.debriefNasa}:</b> {t.nasa.replace(/\s*\[S\d+b?\]/g, '')}{' '}
                {t.sources.map((sId) => (
                  <a
                    key={sId}
                    href={sourceById(sId)?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    [{sId}]
                  </a>
                ))}
              </p>
            </li>
          ))}
        </ol>
        <div class="briefing-actions">
          <button class="btn" onClick={onNew}>
            {ui.newMission}
          </button>
          <button class="btn btn-go" onClick={onAgain}>
            {ui.playAgain} <Icon name="ARROW" size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
