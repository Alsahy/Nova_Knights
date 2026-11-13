/** Top bar + the "Our base" resources board on the LEFT (lead feedback, D-020). Few words, big bars. */
import type { GameState, Hud as HudT } from '../../engine/types';
import { Icon, type UiIcon } from './Icon';
import { fill, signed, ui } from '../text';

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
  short?: string;
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
          short={ui.air}
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
      </div>
      <div class={`badge badge-${h.crew.badge} ${preview['DOSE'] ? 'hl-down' : ''}`}>
        <Icon name="DOSE" size={20} />
        <span>
          {ui.badge}: <b>{badgeWord}</b> <span class="num small">({h.crew.DOSE}/10)</span>
        </span>
        <Delta k="DOSE" preview={preview} />
      </div>
      <details class="supplies">
        <summary>{ui.more}</summary>
        <ul>
          <li>
            <Icon name="FUL" size={16} /> {ui.food}: <b class="num">{h.crew.FUL}/20</b>
            <Delta k="FUL" preview={preview} />
          </li>
          <li>
            <Icon name="HYD" size={16} /> {ui.water}: <b class="num">{h.crew.HYD}/20</b>
            <Delta k="HYD" preview={preview} />
          </li>
          <li>
            <Icon name="AIR" size={16} /> {ui.air}: <b class="num">{h.crew.AIR}/20</b>
            <Delta k="AIR" preview={preview} />
          </li>
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
