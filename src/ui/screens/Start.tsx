/** Mission select + the mission briefing ("Message from Mission Control"). */
import { MISSION_LENGTH, MISSION_SP_GOAL } from '../../engine/config';
import type { MissionId } from '../../engine/types';
import { Avatar } from '../components/Avatar';
import { Icon } from '../components/Icon';
import { fill, ui } from '../text';

const MISSIONS: { id: MissionId; name: string; desc: string }[] = [
  { id: 'M1', name: ui.missionM1, desc: ui.missionM1Desc },
  { id: 'M3', name: ui.missionM3, desc: ui.missionM3Desc },
];

export function MissionSelect({
  onPick,
  back,
}: {
  onPick: (m: MissionId) => void;
  back: () => void;
}) {
  return (
    <section class="center-screen" aria-labelledby="ms-title">
      <button class="btn btn-ghost" onClick={back}>
        ← {ui.quit}
      </button>
      <h1 id="ms-title" tabIndex={-1} class="screen-title">
        {ui.chooseMission}
      </h1>
      <div class="mission-grid">
        {MISSIONS.map((m) => (
          <button key={m.id} class="mission-card glass" onClick={() => onPick(m.id)}>
            <span class="mission-icon">
              <Icon name={m.id === 'M3' ? 'SUN' : 'COMPASS'} size={34} />
            </span>
            <span class="mission-name">{m.name}</span>
            <span class="mission-desc">{m.desc}</span>
            <span class="mission-meta">
              {ui.cadet} · {fill(ui.sols, { n: MISSION_LENGTH[m.id].cadet ?? 0 })}
            </span>
            <span class="mission-meta">
              {fill(ui.goalStars, { n: MISSION_SP_GOAL[m.id].cadet ?? 0 })}
              {m.id === 'M3' ? ` ${ui.goalDose}` : ''}
            </span>
          </button>
        ))}
      </div>
      <p class="muted">{ui.commanderSoon}</p>
    </section>
  );
}

export function Briefing(props: {
  mission: MissionId;
  seed: number;
  onStart: () => void;
  back?: () => void;
  inGame?: boolean;
}) {
  const sols = MISSION_LENGTH[props.mission].cadet ?? 8;
  const goal = MISSION_SP_GOAL[props.mission].cadet ?? 6;
  return (
    <section class="center-screen" aria-labelledby="br-title">
      <div class="briefing glass">
        <div class="briefing-head">
          <span class="live-dot" aria-hidden="true" />
          <span id="br-title">{ui.briefingFrom}</span>
          <span class="muted">{ui.briefingChannel}</span>
        </div>
        <div class="briefing-body">
          <div class="briefing-who">
            <Avatar role="MGR" size={110} />
          </div>
          <div class="briefing-text">
            <p>{fill(ui.briefingText, { sols, goal })}</p>
            <p>{ui.briefingText2}</p>
            {props.mission === 'M3' && <p class="warn-text">{ui.briefingDose}</p>}
            <p class="muted small">
              {ui.missionCode}: <b class="num">{props.seed}</b>
            </p>
          </div>
        </div>
        <div class="briefing-actions">
          {props.back && (
            <button class="btn btn-ghost" onClick={props.back}>
              ← {ui.quit}
            </button>
          )}
          <button class="btn btn-go" onClick={props.onStart} autoFocus>
            {props.inGame ? ui.close : ui.start} <Icon name="ARROW" size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
