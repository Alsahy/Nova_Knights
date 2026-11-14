/**
 * The end-of-mission dashboard (D-068): the report as pictures, not paragraphs.
 * Ring gauges show how the base ended; a bar chart shows each day (stars sent up, radiation taken down).
 * Tap a day to see its problem and the tool you picked. Never colour alone: every mark has an icon and a number.
 */
import { useState } from 'preact/hooks';
import { copy } from '../../content/copy';
import type { GameState, LogEntry } from '../../engine/types';
import { actionTitle, eventTitle, fill, logLine, ui } from '../text';
import { Icon, systemIcon, type UiIcon } from './Icon';

const R = 26;
const LEN = 2 * Math.PI * R;

function Ring(props: {
  icon: UiIcon;
  label: string;
  value: number;
  max: number;
  color: string;
  word?: string;
  /** For radiation a full ring is bad; for everything else an empty ring is bad. */
  badWhenHigh?: boolean;
  noMax?: boolean;
}) {
  const part = Math.max(0, Math.min(1, props.max > 0 ? props.value / props.max : 0));
  const bad = props.badWhenHigh ? part >= 0.7 : part <= 0.3;
  const text = props.noMax ? `${props.value}` : `${props.value}/${props.max}`;
  return (
    <li
      class={`ring ${bad ? 'bad' : ''}`}
      role="img"
      aria-label={`${props.label}: ${text}${props.word ? `, ${props.word}` : ''}`}
      style={{ '--c': props.color } as Record<string, string>}
    >
      <span class="ring-dial">
        <svg viewBox="0 0 64 64" width="72" height="72" aria-hidden="true">
          <circle class="ring-track" cx="32" cy="32" r={R} />
          <circle
            class="ring-fill"
            cx="32"
            cy="32"
            r={R}
            stroke-dasharray={`${LEN * part} ${LEN}`}
            transform="rotate(-90 32 32)"
          />
        </svg>
        <Icon name={props.icon} size={26} />
        {bad && <b class="ring-flag">!</b>}
      </span>
      <b class="num">{text}</b>
      <span class="ring-label">{props.word ?? props.label}</span>
    </li>
  );
}

const DETAIL = new Set([
  'log.harvest',
  'log.stormDose',
  'log.evaDose',
  'log.backgroundDose',
  'log.toSickBay',
  'log.broken',
  'log.lsUnpowered',
  'log.hungry',
  'log.thirsty',
  'log.batteryPop',
  'log.timeout',
]);

interface Day {
  sol: number;
  event?: string;
  choice?: string;
  stars: number;
  dose: number;
  hungry: boolean;
  thirsty: boolean;
  lines: LogEntry[];
}

function days(s: GameState): Day[] {
  const out: Day[] = [];
  for (let sol = 1; sol <= s.sol; sol++) {
    const entries = s.log.filter((e) => e.sol === sol);
    const ev = entries.find((e) => e.key === 'log.event' || e.key === 'log.briefing');
    const ch = [...s.choices].reverse().find((c) => c.sol === sol && !c.actionId.endsWith('.wait'));
    const num = (e: LogEntry, k: string, d: number) =>
      typeof e.params?.[k] === 'number' ? (e.params[k] as number) : d;
    const day: Day = {
      sol,
      stars: entries
        .filter((e) => e.key === 'log.spBanked')
        .reduce((n, e) => n + num(e, 'sp', 0), 0),
      dose: entries.filter((e) => e.kind === 'dose').reduce((n, e) => n + num(e, 'dose', 1), 0),
      hungry: entries.some((e) => e.key === 'log.hungry'),
      thirsty: entries.some((e) => e.key === 'log.thirsty'),
      lines: entries.filter((e) => DETAIL.has(e.key)).slice(0, 3),
    };
    if (ev && typeof ev.params?.['id'] === 'string') day.event = ev.params['id'];
    if (ch) day.choice = ch.actionId;
    out.push(day);
  }
  return out;
}

export function MissionBoard({ s }: { s: GameState }) {
  const survival = s.mission === 'M9';
  const list = days(s);
  const [open, setOpen] = useState(list.length);
  const maxStars = Math.max(4, ...list.map((d) => d.stars));
  const maxDose = Math.max(3, ...list.map((d) => d.dose));
  const dose = s.crew.DOSE;
  const sel = list.find((d) => d.sol === open);
  const b = copy.board;
  return (
    <div class="board">
      <ul class="rings">
        <Ring
          icon="SP"
          label={ui.stars}
          value={s.sp.banked}
          max={survival ? Math.max(1, s.sp.banked) : s.sp.goal}
          color="var(--star)"
          noMax={survival}
        />
        <Ring
          icon="DOSE"
          label={ui.badge}
          value={dose}
          max={10}
          color={dose >= 7 ? 'var(--red)' : dose >= 4 ? 'var(--amber)' : 'var(--green)'}
          word={`${b.radiation}: ${dose >= 7 ? ui.badgeRed : dose >= 4 ? ui.badgeYellow : ui.badgeGreen}`}
          badWhenHigh
        />
        <Ring icon="LS" label={ui.lifeSupport} value={s.systems.LS} max={10} color="var(--blue)" />
        <Ring
          icon="BAT"
          label={ui.battery}
          value={s.systems.BAT}
          max={s.systems.BATMAX}
          color="var(--amber)"
        />
        <Ring icon="SH" label={ui.shield} value={s.systems.SH} max={10} color="var(--green)" />
        <Ring
          icon="FOOD"
          label={ui.food}
          value={s.supplies.FOOD}
          max={Math.max(s.supplies.FOOD, survival ? 44 : 24)}
          color="#f08bd0"
        />
        <Ring
          icon="H2O"
          label={ui.water}
          value={s.supplies.H2O}
          max={Math.max(s.supplies.H2O, survival ? 14 : 10)}
          color="#4fd8e8"
        />
      </ul>

      <div class="daychart glass">
        <p class="daychart-key">
          <span>
            <i class="key-star" /> {b.starsSent}
          </span>
          <span>
            <i class="key-dose" /> {b.radGained}
          </span>
        </p>
        <div class="daychart-cols" role="group" aria-label={b.days}>
          {list.map((d) => (
            <button
              key={d.sol}
              class={`daycol ${d.sol === open ? 'on' : ''}`}
              aria-pressed={d.sol === open}
              aria-label={`${fill(b.day, { n: d.sol })}: ${d.stars} ${b.starsSent}, ${d.dose} ${b.radGained}`}
              onClick={() => setOpen(d.sol)}
            >
              <span class="daycol-icon">
                <Icon name={d.event ? systemIcon(d.event) : 'COMPASS'} size={22} />
              </span>
              <span class="daycol-up">
                {d.stars > 0 && (
                  <i style={{ height: `${(100 * d.stars) / maxStars}%` }}>
                    <b class="num">{d.stars}</b>
                  </i>
                )}
              </span>
              <span class="daycol-sol num">{d.sol}</span>
              <span class="daycol-down">
                {d.dose > 0 && (
                  <i style={{ height: `${(100 * d.dose) / maxDose}%` }}>
                    <b class="num">{d.dose}</b>
                  </i>
                )}
              </span>
              <span class="daycol-flags">
                {d.hungry && <Icon name="FOOD" size={16} />}
                {d.thirsty && <Icon name="H2O" size={16} />}
              </span>
            </button>
          ))}
        </div>
        {sel && (
          <div class="daydetail" role="status">
            <p>
              <b class="num">{fill(b.day, { n: sel.sol })}</b>{' '}
              {sel.event ? (
                <>
                  <Icon name={systemIcon(sel.event)} size={20} /> <b>{eventTitle(sel.event)}</b>
                  {sel.choice ? ` → ${actionTitle(sel.choice)}` : ''}
                </>
              ) : (
                b.quiet
              )}
            </p>
            {sel.lines.map((l, i) => (
              <p key={i} class="small muted">
                {logLine(l)}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
