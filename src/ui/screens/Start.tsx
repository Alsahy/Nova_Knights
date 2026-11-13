/** Mission select + the mission briefing ("Message from Mission Control"). */
import { MISSION_LENGTH, MISSION_SP_GOAL } from '../../engine/config';
import type { MissionId } from '../../engine/types';
import { Avatar } from '../components/Avatar';
import { Icon } from '../components/Icon';
import { InfoTip } from './Phases';
import { fill, ui } from '../text';

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
            <p>
              {fill(ui.briefingText, { sols, goal })}{' '}
              <InfoTip label={ui.realData}>
                {ui.solIs} {ui.stormReplay}
              </InfoTip>
            </p>
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
