/** Ending + debrief, kid-short (spec §1.1 rule 10): what happened → which choice → what NASA does (one tap). */
import { CONTENT } from '../../content';
import { copy } from '../../content/copy';
import { formatLog } from '../../content/format';
import { sourceById } from '../../content/sources';
import { STORIES } from '../../content/stories';
import type { GameState } from '../../engine/types';
import { Icon } from '../components/Icon';
import { engine } from '../engine';
import { fill, ui } from '../text';

export function Debrief({
  s,
  onAgain,
  onNew,
}: {
  s: GameState;
  onAgain: () => void;
  onNew: () => void;
}) {
  const d = engine.debrief(s)!;
  const title =
    d.ending.kind === 'success'
      ? ui.success
      : d.ending.kind === 'safe-return'
        ? ui.safeReturn
        : ui.broughtHome;
  return (
    <section class="center-screen" aria-labelledby="db-title">
      <div class={`debrief glass end-${d.ending.kind}`}>
        <h1 id="db-title" tabIndex={-1} class="screen-title">
          <Icon
            name={d.ending.kind === 'success' ? 'SP' : 'COMPASS'}
            size={36}
            color={d.ending.kind === 'success' ? 'var(--star)' : undefined}
          />{' '}
          {title}
        </h1>
        <p class="kid-text">
          {formatLog({ sol: d.ending.sol, kind: 'ending', key: d.ending.reason })}
        </p>
        <p class="stars-big num">
          <Icon name="SP" size={28} color="var(--star)" /> {d.stats.spBanked} / {d.stats.spGoal}
        </p>
        {ui.endTips[d.ending.reason] && (
          <p class="lesson">
            <Icon name="SP" color="var(--star)" />{' '}
            <b>{d.ending.kind === 'success' ? ui.youLearned : ui.nextTime}:</b>{' '}
            {ui.endTips[d.ending.reason]}
          </p>
        )}
        <h2>{ui.debriefChoices}</h2>
        <ol class="big-choices">
          {d.top3.map((t, i) => {
            const story = STORIES[t.choice.eventId];
            const ev = CONTENT.events[t.choice.eventId];
            return (
              <li key={i} class="glass">
                <p>
                  <b>
                    {ui.sol} {t.choice.sol}: {t.eventTitle}
                  </b>{' '}
                  → {t.actionTitle}
                </p>
                {t.lesson && (
                  <p class="lesson-line">
                    <Icon name="SP" size={18} color="var(--star)" /> {t.lesson}
                  </p>
                )}
                <details>
                  <summary>{ui.nasaToo}</summary>
                  <p class="small">
                    {story?.trueStory ?? ev?.realScience.text.replace(/\s*\[S\d+b?\]/g, '')}{' '}
                    {t.sources.map((id) => (
                      <a
                        key={id}
                        href={sourceById(id)?.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        [{id}]
                      </a>
                    ))}
                  </p>
                </details>
              </li>
            );
          })}
        </ol>
        <p class="muted small">{fill(copy.ui.missionCode + ': {seed}', { seed: s.seed })}</p>
        <div class="briefing-actions">
          <button class="btn" onClick={onNew}>
            {ui.newGame}
          </button>
          <button class="btn btn-go" onClick={onAgain}>
            {ui.playAgain} <Icon name="ARROW" size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
