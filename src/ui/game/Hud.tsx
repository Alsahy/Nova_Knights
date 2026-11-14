/**
 * The top bar (inspired by the "Crew Status" strip of the concept art): sol, stars, the 3 core base meters,
 * the radiation badge, the crew's faces and their 4 shared bars. Supplies are one tap away (CLAUDE.md §9).
 * Never colour alone: every bar has an icon, a number and a spoken label.
 */
import { copy } from '../../content/copy';
import type { Hud, Role } from '../../engine/types';
import { Avatar, type Mood } from '../components/Avatar';
import { Icon, type UiIcon } from '../components/Icon';
import { signed, ui } from '../text';

export type Deltas = Record<string, number>;

function Meter(props: {
  k: string;
  icon: UiIcon;
  label: string;
  value: number;
  max: number;
  color: string;
  d: Deltas;
}) {
  const delta = props.d[props.k] ?? 0;
  const low = props.value / props.max <= 0.3;
  return (
    <div
      class={`m ${delta > 0 ? 'hl-up' : delta < 0 ? 'hl-down' : ''} ${low ? 'low' : ''}`}
      role="img"
      aria-label={`${props.label}: ${props.value} / ${props.max}`}
      title={props.label}
      style={{ '--c': props.color } as Record<string, string>}
    >
      <Icon name={props.icon} size={20} />
      <span class="m-label">{props.label}</span>
      <span class="m-bar">
        <i style={{ width: `${Math.max(0, Math.min(100, (100 * props.value) / props.max))}%` }} />
      </span>
      <b class="num">{props.value}</b>
      {delta !== 0 && <em class="m-delta num">{signed(delta)}</em>}
    </div>
  );
}

const ROLES: Role[] = ['MGR', 'ENG', 'MED', 'RES'];

export function HudBar(props: {
  h: Hud;
  d: Deltas;
  moods: Record<Role, Mood>;
  suit: string;
  sound: boolean;
  onSound: () => void;
  onHelp: () => void;
  onMenu: () => void;
  survival?: boolean; // D-050: no last day and no star goal, just a day counter
}) {
  const { h, d } = props;
  const badgeWord =
    h.crew.badge === 'green'
      ? ui.badgeGreen
      : h.crew.badge === 'yellow'
        ? ui.badgeYellow
        : ui.badgeRed;
  const dDose = d['DOSE'] ?? 0;
  const dStar = d['SP'] ?? 0;
  return (
    <header class="hud">
      <div class="hud-sol" aria-label={`${ui.sol} ${h.sol} / ${h.lastSol}`}>
        <span>{props.survival ? copy.mode.day : ui.sol}</span>
        <b class="num">{h.sol}</b>
        {!props.survival && <small class="num">/{h.lastSol}</small>}
      </div>
      <div
        class={`hud-stars ${dStar > 0 ? 'hl-up' : ''}`}
        role="img"
        aria-label={`${ui.stars}: ${h.sp.banked} ${ui.sent}, ${ui.goal} ${h.sp.goal}. ${h.sp.pending} waiting.`}
      >
        <Icon name="SP" size={22} color="var(--star)" />
        <b class="num">
          {h.sp.banked}
          {!props.survival && <small>/{h.sp.goal}</small>}
        </b>
        {h.sp.pending > 0 && <span class="wait num">+{h.sp.pending}</span>}
      </div>
      <div class="hud-group base">
        <Meter
          k="LS"
          icon="LS"
          label={ui.lifeSupport}
          value={h.core.LS}
          max={10}
          color="var(--blue)"
          d={d}
        />
        <Meter
          k="BAT"
          icon="BAT"
          label={ui.battery}
          value={h.core.BAT}
          max={h.systems.BATMAX}
          color="var(--amber)"
          d={d}
        />
        <Meter
          k="SH"
          icon="SH"
          label={ui.shield}
          value={h.core.SH}
          max={10}
          color="var(--green)"
          d={d}
        />
        <div
          class={`m badge-m badge-${h.crew.badge} ${dDose > 0 ? 'hl-down' : dDose < 0 ? 'hl-up' : ''}`}
          role="img"
          aria-label={`${ui.badge}: ${h.crew.DOSE} / 10, ${badgeWord}`}
          title={ui.badge}
        >
          <Icon name="DOSE" size={18} />
          <b class="num">{h.crew.DOSE}</b>
          <span class="word">{badgeWord}</span>
          {dDose !== 0 && <em class="m-delta num">{signed(dDose)}</em>}
        </div>
      </div>
      <div class="hud-group crew">
        <span class="faces">
          {ROLES.map((r) => {
            const a = h.astronauts.find((x) => x.id === r)!;
            return (
              <span
                key={r}
                class="face"
                role="img"
                aria-label={`${a.callSign}: ${copy.play.moods[props.moods[r]] ?? ''}`}
                title={`${a.callSign} · ${ui.roleNames[r]}`}
              >
                <Avatar role={r} size={34} mood={props.moods[r]} suit={props.suit} />
              </span>
            );
          })}
        </span>
        <Meter
          k="EN"
          icon="EN"
          label={ui.energy}
          value={h.crew.EN}
          max={h.crew.ENMAX}
          color="#f2cf5b"
          d={d}
        />
        <Meter
          k="FOOD"
          icon="FOOD"
          label={ui.food}
          value={h.supplies.FOOD}
          max={props.survival ? 44 : 24}
          color="#f08bd0"
          d={d}
        />
        <Meter
          k="H2O"
          icon="H2O"
          label={ui.water}
          value={h.supplies.H2O}
          max={props.survival ? 14 : 10}
          color="#4fd8e8"
          d={d}
        />
      </div>
      <div class="hud-btns">
        <button
          class="hud-btn"
          onClick={props.onSound}
          aria-label={props.sound ? copy.play.soundOn : copy.play.soundOff}
          aria-pressed={props.sound}
        >
          <Icon name={props.sound ? 'SOUND' : 'MUTE'} />
        </button>
        <button class="hud-btn help" onClick={props.onHelp} aria-label={ui.howToPlay}>
          <Icon name="HELP" />
        </button>
        <button class="hud-btn" onClick={props.onMenu} aria-label={ui.menu}>
          <Icon name="MENU" />
        </button>
      </div>
    </header>
  );
}
