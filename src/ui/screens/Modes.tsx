/** Casual or Survival (D-050), and the high-score board. */
import { copy } from '../../content/copy';
import { MISSION_LENGTH, MISSION_SP_GOAL } from '../../engine/config';
import type { MissionId } from '../../engine/types';
import { Icon } from '../components/Icon';
import { topScores, type Score } from '../meta';
import { fill } from '../text';

const M = copy.mode;
const S = copy.scores;

export function ModePick(props: {
  scores: Score[];
  onPick: (m: MissionId) => void;
  back: () => void;
}) {
  const best = topScores(props.scores, 'survival', 1)[0];
  return (
    <section class="center-screen" aria-labelledby="mode-title">
      <button class="btn btn-back" onClick={props.back}>
        ← {copy.back}
      </button>
      <h1 id="mode-title" tabIndex={-1}>
        {M.pick}
      </h1>
      <div class="mode-grid">
        <button class="mode-card casual" onClick={() => props.onPick('M3')}>
          <span class="mode-icon">
            <Icon name="SP" size={54} />
          </span>
          <b>{M.casual}</b>
          <span>
            {fill(M.casualText, {
              sols: MISSION_LENGTH.M3.cadet ?? 7,
              goal: MISSION_SP_GOAL.M3.cadet ?? 14,
            })}
          </span>
        </button>
        <button class="mode-card survival" onClick={() => props.onPick('M9')}>
          <span class="mode-icon">
            <Icon name="CLOCK" size={54} />
          </span>
          <b>{M.survival}</b>
          <span>{M.survivalText}</span>
          {best && <em>{fill(M.best, { days: best.days, stars: best.stars })}</em>}
        </button>
      </div>
    </section>
  );
}

export function Scores(props: { scores: Score[]; back: () => void }) {
  const surv = topScores(props.scores, 'survival');
  const cas = topScores(props.scores, 'casual');
  return (
    <section class="center-screen text-screen" aria-labelledby="scores-title">
      <button class="btn btn-back" onClick={props.back}>
        ← {copy.back}
      </button>
      <h1 id="scores-title" tabIndex={-1}>
        <Icon name="MEDAL" size={34} color="var(--star)" /> {S.title}
      </h1>
      {!surv.length && !cas.length && <p class="lead">{S.none}</p>}
      {surv.length > 0 && (
        <>
          <h2>{S.survival}</h2>
          <ol class="score-list">
            {surv.map((x, i) => (
              <li key={i} class={`glass ${i === 0 ? 'top' : ''}`}>
                <span class="rank num">{i + 1}</span>
                <b class="num">{x.score}</b>
                <span>
                  {x.days} {S.days} · <Icon name="SP" size={16} color="var(--star)" /> {x.stars}
                </span>
              </li>
            ))}
          </ol>
          <p class="muted small">{M.scoreHow}</p>
        </>
      )}
      {cas.length > 0 && (
        <>
          <h2>{S.casual}</h2>
          <ol class="score-list">
            {cas.map((x, i) => (
              <li key={i} class={`glass ${i === 0 ? 'top' : ''}`}>
                <span class="rank num">{i + 1}</span>
                <b class="num">
                  <Icon name="SP" size={18} color="var(--star)" /> {x.stars}
                </b>
                <span>{x.won ? S.won : S.notWon}</span>
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}
