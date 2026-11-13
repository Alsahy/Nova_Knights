/** Top HUD, crew panel (shared crew card, D-017) and the mission board. */
import type { Hud as HudT, GameState, Role } from '../../engine/types';
import { Avatar } from './Avatar';
import { Icon, type UiIcon } from './Icon';
import { fill, signed, taskTitle, ui } from '../text';

export type Preview = Record<string, number>;

function Delta({ k, preview }: { k: string; preview: Preview }) {
  const d = preview[k];
  if (!d) return null;
  return <span class={`delta ${d > 0 ? 'up' : 'down'}`}>{signed(d)}</span>;
}

export function Meter(props: {
  icon: UiIcon;
  label: string;
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
    <div class={`meter glass ${hl ? (hl > 0 ? 'hl-up' : 'hl-down') : ''}`}>
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
      </div>
    </div>
  );
}

export function Hud({ h, preview }: { h: HudT; preview: Preview }) {
  return (
    <header class="hud">
      <div class="sol-pill num">
        <span class="accent">{ui.sol}</span> {Math.max(h.sol, 0)} / {h.lastSol}
      </div>
      <div class="hud-meters">
        <Meter
          icon="LS"
          label={ui.lifeSupport}
          value={h.core.LS}
          max={10}
          color="var(--blue)"
          k="LS"
          preview={preview}
        />
        <Meter
          icon="PWR"
          label={ui.battery}
          value={h.core.BAT}
          max={h.systems.BATMAX}
          color="var(--amber)"
          k="BAT"
          preview={preview}
          sub={`${ui.power}: +${h.core.PWR}/sol`}
        />
        <Meter
          icon="SH"
          label={ui.shield}
          value={h.core.SH}
          max={10}
          color="var(--green)"
          k="SH"
          preview={preview}
          sub={fill(ui.shieldTier, { t: h.core.shieldTier })}
        />
        <Meter
          icon="SP"
          label={ui.stars}
          value={h.sp.banked}
          max={Math.max(h.sp.goal, h.sp.banked)}
          color="var(--star)"
          k="SP"
          preview={preview}
          sub={fill(ui.starsSent, { banked: h.sp.banked, pending: h.sp.pending })}
        />
      </div>
    </header>
  );
}

const ROLES: Role[] = ['MGR', 'ENG', 'MED', 'RES'];

export function CrewPanel({ h, preview }: { h: HudT; preview: Preview }) {
  const badgeWord = { green: ui.badgeGreen, yellow: ui.badgeYellow, red: ui.badgeRed }[
    h.crew.badge
  ];
  return (
    <aside class="panel glass crew-panel" aria-label={ui.crew}>
      <h2 class="panel-title">{ui.crew}</h2>
      <ul class="crew-list">
        {ROLES.map((r) => {
          const a = h.astronauts.find((x) => x.id === r)!;
          return (
            <li key={r} class="crew-row">
              <Avatar role={r} size={40} dim={a.sickBaySols > 0} />
              <div>
                <div class="crew-name">
                  {a.callSign} <span class="muted">· {ui.roleNames[r]}</span>
                </div>
                <div class="muted small">
                  {a.sickBaySols > 0
                    ? fill(ui.inSickBay, { n: a.sickBaySols })
                    : a.busy
                      ? ui.busy
                      : a.plannedTask
                        ? taskTitle(a.plannedTask)
                        : ui.noTask}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <h3 class="panel-sub">{ui.wholeCrew}</h3>
      <div class="crew-bars">
        <Meter
          icon="EN"
          label={ui.energy}
          value={h.crew.EN}
          max={h.crew.ENMAX}
          color="var(--amber)"
          k="EN"
          preview={preview}
        />
        <Meter
          icon="FUL"
          label={ui.food}
          value={h.crew.FUL}
          max={20}
          color="var(--orange)"
          k="FUL"
          preview={preview}
        />
        <Meter
          icon="HYD"
          label={ui.water}
          value={h.crew.HYD}
          max={20}
          color="var(--blue)"
          k="HYD"
          preview={preview}
        />
        <Meter
          icon="AIR"
          label={ui.air}
          value={h.crew.AIR}
          max={20}
          color="var(--sky)"
          k="AIR"
          preview={preview}
        />
      </div>
      <div class={`badge badge-${h.crew.badge} ${preview['DOSE'] ? 'hl-down' : ''}`}>
        <Icon name="DOSE" size={18} />
        <span>
          {ui.badge}: <b class="num">{h.crew.DOSE}/10</b> ({badgeWord})
        </span>
        <Delta k="DOSE" preview={preview} />
      </div>
      <details class="supplies">
        <summary>{ui.supplies}</summary>
        <ul>
          {(Object.keys(h.supplies) as (keyof typeof h.supplies)[]).map((k) => (
            <li key={k}>
              <Icon name={k} size={16} /> {ui.supplyNames[k]}: <b class="num">{h.supplies[k]}</b>
              <Delta k={k} preview={preview} />
            </li>
          ))}
          <li>
            <Icon name="LAB" size={16} /> Lab: <b class="num">{h.systems.LAB}/10</b>
            <Delta k="LAB" preview={preview} />
          </li>
        </ul>
      </details>
    </aside>
  );
}

export function MissionBoard({ s, h }: { s: GameState; h: HudT }) {
  const items: { icon: UiIcon; text: string; warn?: boolean }[] = [];
  if (h.crop)
    items.push({
      icon: 'SPROUT',
      text: fill(ui.cropGrowing, { crop: h.crop.kind, n: Math.max(0, h.crop.readySol - h.sol) }),
    });
  else if (h.sol > 0) items.push({ icon: 'SPROUT', text: ui.cropNone, warn: true });
  if (h.dustStacks > 0)
    items.push({ icon: 'SUN', text: fill(ui.dustLayers, { n: h.dustStacks }), warn: true });
  const nextSend = Math.min(Math.ceil((Math.max(h.sol, 1) + 0.5) / 4) * 4, h.lastSol);
  if (h.sol < h.lastSol)
    items.push({ icon: 'ANTENNA', text: fill(ui.nextSend, { sol: nextSend }) });
  for (const f of h.flags) {
    if (f.startsWith('broken:'))
      items.push({ icon: 'PARTS', text: fill(ui.brokenThing, { what: f.slice(7) }), warn: true });
    if (f === 'shelterReady') items.push({ icon: 'SH', text: ui.shelterReady });
  }
  if (h.crew.indoorOnly) items.push({ icon: 'DOSE', text: ui.indoorOnly, warn: true });
  void s;
  return (
    <aside class="panel glass board" aria-label={ui.events}>
      <h2 class="panel-title">{ui.events}</h2>
      {items.length === 0 && <p class="muted">{ui.nothingYet}</p>}
      <ul class="board-list">
        {items.map((it, i) => (
          <li key={i} class={it.warn ? 'warn' : ''}>
            <span class="board-icon">
              <Icon name={it.icon} size={18} />
            </span>
            <span>{it.text}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
