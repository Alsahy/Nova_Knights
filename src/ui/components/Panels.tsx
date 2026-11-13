/**
 * Top bar · "Our base" (resources, LEFT) · "Our crew" (astronauts + the bars they share, RIGHT) — D-023.
 */
import type { AstronautId, GameState, Hud as HudT, Role } from '../../engine/types';
import { Avatar } from './Avatar';
import { Icon, type UiIcon } from './Icon';
import { fill, signed, ui } from '../text';

export type Preview = Record<string, number>;
const ROLES: Role[] = ['MGR', 'ENG', 'MED', 'RES'];

function Delta({ k, preview }: { k: string; preview: Preview }) {
  const d = preview[k];
  if (!d) return null;
  return <span class={`delta ${d > 0 ? 'up' : 'down'}`}>{signed(d)}</span>;
}

export function Meter(props: {
  icon: UiIcon;
  label: string;
  short?: string;
  value: number;
  max: number;
  color: string;
  k: string;
  preview: Preview;
  sub?: string;
}) {
  const pct = Math.max(0, Math.min(100, (100 * props.value) / props.max));
  const hl = props.preview[props.k];
  return (
    <div class={`meter ${hl ? (hl > 0 ? 'hl-up' : 'hl-down') : ''}`}>
      <Delta k={props.k} preview={props.preview} />
      <span class="meter-icon" style={{ borderColor: props.color, color: props.color }}>
        <Icon name={props.icon} size={18} />
      </span>
      <div class="meter-body">
        <div class="meter-top">
          <span class="meter-label">{props.label}</span>
          <span class="num">
            {props.value}/{props.max}
          </span>
        </div>
        <div
          class="bar"
          role="meter"
          aria-label={props.label}
          aria-valuemin={0}
          aria-valuemax={props.max}
          aria-valuenow={props.value}
        >
          <div style={{ width: `${pct}%`, background: props.color }} />
        </div>
        {props.sub && <div class="meter-sub">{props.sub}</div>}
        {props.short && (
          <div class="meter-short" aria-hidden="true">
            {props.short}
          </div>
        )}
      </div>
    </div>
  );
}

export function TopBar({ h, missionName }: { h: HudT; missionName: string }) {
  return (
    <header class="topbar">
      <span class="sol-pill num">
        <span class="accent">{ui.sol}</span> {Math.max(h.sol, 0)} / {h.lastSol}
      </span>
      <span class="mission-pill">{missionName}</span>
    </header>
  );
}

export function BasePanel({ s, h, preview }: { s: GameState; h: HudT; preview: Preview }) {
  const badgeWord = { green: ui.badgeGreen, yellow: ui.badgeYellow, red: ui.badgeRed }[
    h.crew.badge
  ];
  return (
    <aside class="panel glass base-panel" aria-label={ui.ourBase}>
      <h2 class="panel-title">{ui.ourBase}</h2>
      <div class={`stars ${preview['SP'] ? 'hl-up' : ''}`}>
        <Icon name="SP" size={26} color="var(--star)" />
        <div>
          <div class="stars-big num">
            {h.sp.banked} / {h.sp.goal}
          </div>
          <div class="small muted">
            {ui.stars} {ui.sent}
            {h.sp.pending > 0 ? ` · ${fill(ui.waiting, { n: h.sp.pending })}` : ''}
          </div>
        </div>
        <Delta k="SP" preview={preview} />
      </div>
      <div class="base-meters">
        <Meter
          icon="LS"
          label={ui.lifeSupport}
          short={ui.lifeShort}
          value={h.core.LS}
          max={10}
          color="var(--blue)"
          k="LS"
          preview={preview}
        />
        <Meter
          icon="PWR"
          label={ui.power}
          short={ui.power}
          value={h.core.BAT}
          max={h.systems.BATMAX}
          color="var(--amber)"
          k="BAT"
          preview={preview}
          sub={fill(ui.perSol, { n: h.core.PWR })}
        />
        <Meter
          icon="SH"
          label={ui.shield}
          short={ui.shield}
          value={h.core.SH}
          max={10}
          color="var(--green)"
          k="SH"
          preview={preview}
        />
      </div>
      <div class={`badge badge-${h.crew.badge} ${preview['DOSE'] ? 'hl-down' : ''}`}>
        <Icon name="DOSE" size={20} />
        <span>
          {ui.badge}: <b>{badgeWord}</b> <span class="num small">({h.crew.DOSE}/10)</span>
          <span class="small muted badge-hint">{ui.badgeRedAt}</span>
        </span>
        <Delta k="DOSE" preview={preview} />
      </div>
      <details class="supplies">
        <summary>{ui.more}</summary>
        <ul>
          {(Object.keys(h.supplies) as (keyof typeof h.supplies)[]).map((k) => (
            <li key={k}>
              <Icon name={k} size={16} /> {ui.supplyNames[k]}: <b class="num">{h.supplies[k]}</b>
              <Delta k={k} preview={preview} />
            </li>
          ))}
          <li>
            <Icon name="SPROUT" size={16} /> {ui.greenhouse}:{' '}
            {h.crop
              ? fill(ui.greenhouseIn, {
                  crop: h.crop.kind,
                  n: Math.max(0, h.crop.readySol - h.sol),
                })
              : ui.greenhouseEmpty}
          </li>
          {s.dust.stacks > 0 && (
            <li>
              <Icon name="SUN" size={16} /> {ui.dust}: <b class="num">{s.dust.stacks}</b>
            </li>
          )}
        </ul>
      </details>
    </aside>
  );
}

/** The crew on the RIGHT: who they are, what they do today, and the 4 bars they share (D-017). */
export function CrewPanel({
  s,
  h,
  preview,
  current,
}: {
  s: GameState;
  h: HudT;
  preview: Preview;
  current?: AstronautId | null;
}) {
  return (
    <aside class="panel glass crew-panel" aria-label={ui.crew}>
      <h2 class="panel-title">{ui.crew}</h2>
      <ul class="crew-list">
        {ROLES.map((r) => {
          const a = h.astronauts.find((x) => x.id === r)!;
          const away = a.sickBaySols > 0;
          return (
            <li key={r} class={`crew-row ${current === r ? 'current' : ''}`}>
              <Avatar role={r} size={42} dim={away} />
              <div class="crew-id">
                <b>{a.callSign}</b>
                <span class="small muted">
                  {away
                    ? fill(ui.inSickBay, { n: a.sickBaySols })
                    : a.plannedTask
                      ? (ui.jobNames[a.plannedTask] ?? a.plannedTask)
                      : ui.roleNames[r]}
                </span>
              </div>
              {a.plannedTask && !away && (
                <Icon name="CHECK" size={18} color="var(--green)" label={ui.chosen} />
              )}
            </li>
          );
        })}
      </ul>
      <h3 class="panel-sub">{ui.sharedBars}</h3>
      <div class="crew-bars">
        <Meter
          icon="EN"
          label={ui.energy}
          short={ui.energy}
          value={h.crew.EN}
          max={h.crew.ENMAX}
          color="var(--orange)"
          k="EN"
          preview={preview}
        />
        <Meter
          icon="FUL"
          label={ui.food}
          short={ui.food}
          value={h.crew.FUL}
          max={20}
          color="var(--amber)"
          k="FUL"
          preview={preview}
        />
        <Meter
          icon="HYD"
          label={ui.water}
          short={ui.water}
          value={h.crew.HYD}
          max={20}
          color="var(--blue)"
          k="HYD"
          preview={preview}
        />
        <Meter
          icon="AIR"
          label={ui.air}
          short={ui.air}
          value={h.crew.AIR}
          max={20}
          color="var(--sky)"
          k="AIR"
          preview={preview}
        />
      </div>
    </aside>
  );
}
