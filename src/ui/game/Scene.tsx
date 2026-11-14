/**
 * The stage (D-031): a cut-away "dollhouse" view of the Mars base, drawn in SVG (320 × 200 units).
 * Surface on top (Sun, solar panels, airlock, rover, antenna), seven rooms underground.
 * The picture IS the dashboard: dust shows on the panels, the battery shows its charge, plants grow,
 * and trouble (the `fx` list) appears inside the room it happens in. The camera zooms to `focus`.
 */
import type { AstronautId, Hud, Role } from '../../engine/types';
import { Face, LOOK, type Mood } from '../components/Avatar';
import { ICON_PATHS, type UiIcon } from '../components/Icon';
import { copy } from '../../content/copy';
import type { Fx, RoomId } from './tools';

export const ROOMS: Record<RoomId, [number, number, number, number]> = {
  sky: [0, 0, 320, 84],
  panels: [4, 28, 116, 48],
  hub: [100, 28, 104, 48],
  far: [188, 26, 130, 50],
  ls: [8, 88, 72, 50],
  power: [8, 144, 72, 50],
  lab: [86, 88, 72, 50],
  living: [86, 144, 72, 50],
  command: [164, 88, 72, 50],
  shelter: [164, 144, 72, 50],
  green: [242, 88, 70, 106],
};

export const HOME: Record<Role, { x: number; y: number }> = {
  MGR: { x: 190, y: 134 },
  ENG: { x: 60, y: 190 },
  MED: { x: 132, y: 190 },
  RES: { x: 128, y: 134 },
};

export interface CrewSprite {
  id: AstronautId;
  x: number;
  y: number;
  mood: Mood;
  lying?: boolean;
  selected?: boolean;
}
export interface Marker {
  id: string;
  x: number;
  y: number;
  icon: UiIcon;
  chosen: boolean;
  label: string;
}

const EMOTE: Partial<Record<Mood, { icon: UiIcon; color: string }>> = {
  cheer: { icon: 'SP', color: '#f2cf5b' },
  worried: { icon: 'EVENT', color: '#e39a55' },
  hungry: { icon: 'FOOD', color: '#e39a55' },
  thirsty: { icon: 'H2O', color: '#5cb4e4' },
  sleepy: { icon: 'MOON', color: '#9ad3f2' },
  dizzy: { icon: 'AIR', color: '#6cc08b' },
  cold: { icon: 'DIAL', color: '#9ad3f2' },
  hot: { icon: 'SUN', color: '#e2b046' },
  sick: { icon: 'MEDKIT', color: '#e07a72' },
  sneeze: { icon: 'AIR', color: '#e07a72' },
  angry: { icon: 'PWR', color: '#e07a72' },
};

function Astro({ c, suit }: { c: CrewSprite; suit: string }) {
  const l = LOOK[c.id];
  const em = EMOTE[c.mood];
  return (
    <g
      class={`astro mood-${c.mood} ${c.selected ? 'sel' : ''}`}
      style={{ transform: `translate(${c.x}px, ${c.y}px)` }}
    >
      {c.selected && <ellipse cy="0.500" rx="9" ry="2.6" class="astro-ring" />}
      <g class="astro-body" transform={c.lying ? 'translate(-9 -3) rotate(-90)' : undefined}>
        <rect x="-4.6" y="-6" width="3.8" height="6" rx="1.4" fill={suit} class="suit" />
        <rect x="0.800" y="-6" width="3.8" height="6" rx="1.4" fill={suit} class="suit" />
        <rect x="-8" y="-14" width="3" height="7" rx="1.500" fill={suit} class="suit" />
        <rect x="5" y="-14" width="3" height="7" rx="1.500" fill={suit} class="suit" />
        <rect x="-6" y="-15" width="12" height="10.500" rx="3.500" fill={suit} class="suit" />
        <rect
          x="-2.6"
          y="-12.500"
          width="5.2"
          height="3.6"
          rx="1"
          fill="#1e293b"
          stroke={l.accent}
          stroke-width="0.500"
        />
        <circle cy="-20.500" r="6.800" fill={suit} class="suit" />
        <ellipse
          cy="-20.300"
          rx="5.200"
          ry="4.800"
          fill="#13233a"
          stroke={l.accent}
          stroke-width="0.800"
        />
        <g transform="translate(0 -20.300) scale(0.118) translate(-90 -81)">
          <Face role={c.id} mood={c.mood} />
        </g>
      </g>
      {em && !c.lying && (
        <g transform="translate(0 -34)">
          <g class="emote">
            <circle r="4.600" fill="#0f1a2a" stroke={em.color} stroke-width="0.700" />
            <path
              d={ICON_PATHS[em.icon]}
              transform="translate(-3.100 -3.100) scale(0.260)"
              fill="none"
              stroke={em.color}
              stroke-width="2.400"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </g>
        </g>
      )}
    </g>
  );
}

function Room({
  id,
  color,
  alarm,
  children,
}: {
  id: RoomId;
  color: string;
  alarm: boolean;
  children?: preact.ComponentChildren;
}) {
  const [x, y, w, h] = ROOMS[id];
  return (
    <g class={`room room-${id} ${alarm ? 'alarm' : ''}`}>
      <title>{copy.play.rooms[id]}</title>
      <rect x={x} y={y} width={w} height={h} rx="5" fill="#0a1422" />
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="5"
        fill={color}
        opacity="0.100"
        class="room-light"
      />
      {children}
      <rect x={x + 2} y={y + h - 4} width={w - 4} height="3" rx="1" fill="#1b2a40" />
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="5"
        fill="none"
        stroke={color}
        stroke-width="3"
        opacity="0.250"
      />
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="5"
        fill="none"
        stroke={color}
        stroke-width="1.100"
      />
      {alarm && (
        <g class="beacon">
          <rect x={x} y={y} width={w} height={h} rx="5" class="alarm-wash" />
          <circle cx={x + w - 7} cy={y + 7} r="3" class="alarm-lamp" />
        </g>
      )}
    </g>
  );
}

export function Scene(props: {
  hud: Hud | null;
  focus: RoomId | null;
  fx: Fx[];
  night: boolean;
  crew: CrewSprite[];
  markers?: Marker[];
  onMarker?: (id: string) => void;
  suit: string;
  lights: string[];
  extras: string[];
  /** Shop paint (D-066). */
  dome?: string;
  rover?: string;
  scorched?: boolean;
  /** 0–1: how far the crop has grown. */
  grow?: number;
  outcome?: 'win' | 'fail' | null;
  /** The exact trouble spot: everything else dims and a bouncing "!" points at it (D-036). */
  spot?: [number, number] | null;
  /** Stores, shown in the rooms: water in the tubes, food crates on the shelf. */
  food?: number;
  water?: number;
  /** The mood of the whole base right now (ice, flames, radiation, dust, bad air). */
  amb?: string | null;
  /** Engine flags, e.g. 'broken:lab': broken things stay visibly broken until fixed. */
  flags?: string[];
}) {
  const { hud, fx } = props;
  // what the base's state adds on top of the alarm's own effects (D-046)
  const all = new Set<Fx>(fx);
  if (props.amb === 'cold') all.add('frost');
  if (props.amb === 'rad') all.add('rays');
  if (props.amb === 'dust') all.add('dust');
  if (props.amb === 'fog') all.add('fog');
  const flags = props.flags ?? [];
  if (flags.includes('broken:lab')) all.add('labBroken');
  if (flags.includes('broken:o2maker')) all.add('o2stop');
  if (flags.includes('broken:recycler')) all.add('pipe');
  const has = (f: Fx) => all.has(f);
  const water = Math.max(0, Math.min(1, (props.water ?? 10) / 10));
  const crates = Math.max(0, Math.min(6, Math.ceil((props.food ?? 24) / 4)));
  const [c0, c1, c2, c3] = [
    props.lights[0] ?? '#4fd8e8',
    props.lights[1] ?? '#4fe0b0',
    props.lights[2] ?? '#f0625a',
    props.lights[3] ?? '#b072f5',
  ];
  const dust = Math.min(3, (hud?.dustStacks ?? 0) + (has('dust') ? 1 : 0));
  const bat = hud ? hud.systems.BAT / 10 : 0.6;
  const lowPower = !!hud && hud.systems.BAT <= 1;
  const tier = hud?.core.shieldTier ?? 1;
  const grow = props.grow ?? 0.7;
  const alarmRoom = fx.length ? props.focus : null;

  // camera
  let s = 1;
  let tx = 0;
  let ty = 0;
  if (props.focus) {
    const [x, y, w, h] = ROOMS[props.focus];
    s = Math.max(1, Math.min(2.3, 320 / (w * 1.5), 200 / (h * 1.35)));
    tx = Math.max(320 - 320 * s, Math.min(0, 160 - (x + w / 2) * s));
    ty = Math.max(200 - 200 * s, Math.min(0, 100 - (y + h / 2) * s));
  }

  return (
    <svg
      class={`scene ${props.night ? 'night' : ''} ${lowPower || has('flicker') ? 'low-power' : ''} ${props.outcome ?? ''} ${props.extras.includes('extra.lights') ? 'party' : ''}`}
      viewBox="0 0 320 200"
      preserveAspectRatio="xMidYMax meet"
      role="img"
      aria-label={copy.ui.ourBase}
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#2a0f0c" />
          <stop offset="1" stop-color="#b9532c" />
        </linearGradient>
        <linearGradient id="soil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#7a321c" />
          <stop offset="0.150" stop-color="#3b1a12" />
          <stop offset="1" stop-color="#1a0c0a" />
        </linearGradient>
        <radialGradient id="sunglow">
          <stop offset="0" stop-color="#fff3c4" stop-opacity="0.900" />
          <stop offset="1" stop-color="#fff3c4" stop-opacity="0" />
        </radialGradient>
      </defs>
      <g class="cam" style={{ transform: `translate(${tx}px, ${ty}px) scale(${s})` }}>
        {/* ── sky and far hills ── */}
        <rect x="-500" y="-200" width="1320" height="284" fill="url(#sky)" />
        <g class="stars">
          {[
            [20, 8],
            [70, 14],
            [112, 6],
            [150, 18],
            [196, 9],
            [240, 16],
            [284, 7],
            [305, 22],
            [92, 28],
            [222, 30],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 3 ? 0.6 : 0.9} fill="#fff" />
          ))}
        </g>
        <circle cx="206" cy="16" r="16" fill="url(#sunglow)" class="sun-glow" />
        <circle cx="206" cy="16" r="5.500" fill="#fff3c4" class="sun" />
        {[-360, 0, 360].map((dx) => (
          <path
            key={dx}
            transform={`translate(${dx} 0)`}
            d="M-40 62 0 56l26-8 30 6 34-10 36 12 40-6 38-9 44 8 36-7 36 10 40-4v40h-360z"
            fill="#8a3a1f"
            opacity="0.700"
          />
        ))}
        <rect x="-500" y="-200" width="1320" height="284" class="night-wash" />
        {(has('dust') || dust >= 2) && (
          <rect x="-500" y="-200" width="1320" height="284" class="haze" />
        )}

        {/* ── sky trouble ── */}
        {has('flare') && (
          <g class="fx-flare">
            <circle cx="206" cy="16" r="34" fill="url(#sunglow)" />
            <path d="M206 16 256 2M206 16 264 26M206 16 246 50M206 16 172 46M206 16 166 4" />
          </g>
        )}
        {has('cloud') && (
          <g class={`fx-cloud ${has('crackle') ? 'near' : ''}`}>
            <circle cx="250" cy="14" r="12" />
            <circle cx="266" cy="10" r="15" />
            <circle cx="284" cy="15" r="11" />
            <circle cx="268" cy="22" r="12" />
          </g>
        )}
        {has('rays') && (
          <g class="fx-rays">
            {[110, 140, 170, 200, 230].map((x) => (
              <path key={x} d={`M${x + 40} -10 ${x} 66`} />
            ))}
          </g>
        )}

        {/* ── little details in the sky ── */}
        <path
          d="M118 12q2-2.500 5-1.500 3 0.500 3 3-1 2.500-4.500 2-3.500-0.500-3.500-3.500z"
          fill="#c9b8a8"
          opacity="0.850"
        >
          <title>Phobos</title>
        </path>
        <circle cx="121" cy="13" r="0.700" fill="#8c7b6c" />
        <path d="M60 4l10 3" class="shooting-star" />
        <g class="far-devil">
          <path d="M0 0q3-6 0-12q-3-6 1-12" />
        </g>

        {/* ── ground ── */}
        <path d="M-500 66H-40Q40 61 120 66t200 -1 40 1H820V600H-500z" fill="url(#soil)" />
        <g fill="none" stroke="#5b2716" stroke-width="0.700" opacity="0.700">
          <ellipse cx="110" cy="71" rx="6" ry="1.600" />
          <ellipse cx="196" cy="73" rx="4" ry="1.200" />
          <ellipse cx="300" cy="72" rx="7" ry="1.800" />
          <path d="M224 67.500h34M224 69.500h34" stroke-dasharray="1.500 1.500" />
        </g>
        <circle cx="292" cy="49" r="1.100" fill="#ff5a4d" class="blink-slow" />
        <g fill="#5b2716" opacity="0.800">
          <ellipse cx="96" cy="78" rx="5" ry="2" />
          <ellipse cx="238" cy="80" rx="7" ry="2.500" />
          <ellipse cx="316" cy="140" rx="3" ry="6" />
          <ellipse cx="3" cy="170" rx="3" ry="7" />
        </g>

        {/* ── cables from the airlock to the rooms ── */}
        <g fill="none" stroke-width="1.600" opacity="0.850">
          <path d="M146 66C146 78 44 72 44 88" stroke="#c2513a" />
          <path d="M150 66C150 80 122 76 122 88" stroke="#d0a83e" />
          <path d="M156 66C156 80 200 76 200 88" stroke="#3f8f5a" />
          <path d="M160 66C160 76 277 72 277 88" stroke="#58c46f" />
        </g>

        {/* ── solar panels ── */}
        <g class="panels-art">
          {[18, 48, 78].map((x) => (
            <g key={x} transform={`translate(${x} 0)`}>
              <path d="M12 66V58" stroke="#64748b" stroke-width="1.600" />
              <path
                d="M0 58 24 50v-10L0 48z"
                fill="#27518f"
                stroke="#9ad3f2"
                stroke-width="0.700"
              />
              <path
                d="M8 55.300v-10M16 52.700v-10M0 53l24-8"
                stroke="#9ad3f2"
                stroke-width="0.400"
                fill="none"
              />
              {dust > 0 && <path d="M0 58 24 50v-10L0 48z" fill="#b5582f" opacity={0.28 * dust} />}
            </g>
          ))}
        </g>
        {has('wind') && (
          <g class="fx-wind">
            <path d="M0 0c6-4 12 4 6 8s-10-2-6-6 12-2 10 6-12 8-14 2" />
            <path d="M-4 14c8-2 16 2 22 0" />
          </g>
        )}

        {/* ── airlock dome ── */}
        <g>
          <path
            d="M132 66V56q0-13 20-13t20 13v10z"
            fill={props.dome ?? '#94a3b8'}
            stroke="#e2e8f0"
            stroke-width="0.800"
          />
          <rect
            x="146"
            y="54"
            width="12"
            height="12"
            rx="2"
            fill="#1e293b"
            stroke="#5cb4e4"
            stroke-width="0.700"
          />
          <circle cx="139" cy="54" r="2.200" fill="#5cb4e4" class="blink-slow" />
          {Array.from({ length: Math.min(3, tier) }, (_, i) => (
            <ellipse
              key={i}
              cx={142 + i * 10}
              cy={45 + Math.abs(i - 1) * 3}
              rx="6"
              ry="3"
              fill="#7a3a22"
              stroke="#4a2114"
              stroke-width="0.500"
            />
          ))}
          {props.extras.includes('extra.flag') && (
            <g>
              <path d="M178 66V46" stroke="#e2e8f0" stroke-width="1" />
              <path d="M178 46l11 3.500-11 3.500z" fill="#f2cf5b" class="flag" />
            </g>
          )}
        </g>

        {/* ── rover, rocks, antenna ── */}
        <g>
          <rect x="206" y="57" width="16" height="6" rx="1.500" fill={props.rover ?? '#cbd5e1'} />
          <path d="M218 57v-5h4" stroke="#cbd5e1" stroke-width="1" fill="none" />
          <circle cx="209" cy="64.500" r="2.300" fill="#334155" />
          <circle cx="219" cy="64.500" r="2.300" fill="#334155" />
          <path d="M240 66l3-5 5 1 2 4zM262 66l2-3 4 1 1 2z" fill="#5b2716" />
          <path d="M292 66V50" stroke="#94a3b8" stroke-width="1.800" />
          <path
            d="M281 46q11 13 22-2z"
            fill="#cbd5e1"
            stroke="#64748b"
            stroke-width="0.600"
            transform="rotate(-24 292 46)"
          />
          {(has('antenna') || has('crackle')) && (
            <g class={has('crackle') ? 'fx-crackle' : 'fx-signal'}>
              <path d="M296 38q5-2 6-7M299 42q9-3 11-13M302 46q13-4 16-19" />
            </g>
          )}
        </g>
        {has('sparkle') && (
          <g class="fx-sparkle">
            <path d="M236 44l1.500 4 4 1.500-4 1.500-1.500 4-1.500-4-4-1.500 4-1.500z" />
            <path d="M266 34l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" />
            <path d="M200 38l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" />
          </g>
        )}
        {has('rock') && (
          <g class="fx-rock">
            <circle cx="268" cy="58" r="10" />
            <path d="M260 64l3-9 6-3 6 5 1 7z" />
          </g>
        )}
        {has('helmet') && (
          <g transform="translate(250 42)">
            <g class="fx-helmet">
              <circle r="9" fill="#13233a" stroke="#e2e8f0" stroke-width="1.500" />
              <path d="M-8.500 2q4-3 8.500 0t8.500 0A8.500 8.500 0 0 1-8.500 2z" class="water" />
              <circle cx="-3" cy="-2" r="1" fill="#fff" />
              <circle cx="3" cy="-2" r="1" fill="#fff" />
            </g>
          </g>
        )}

        {/* ── rooms ── */}
        <g class="rooms">
          <g fill="#17263b">
            <rect x="78" y="106" width="10" height="12" />
            <rect x="156" y="106" width="10" height="12" />
            <rect x="234" y="106" width="10" height="12" />
            <rect x="78" y="162" width="10" height="12" />
            <rect x="156" y="162" width="10" height="12" />
            <rect x="234" y="162" width="10" height="12" />
            <rect x="38" y="136" width="12" height="10" />
            <rect x="116" y="136" width="12" height="10" />
            <rect x="194" y="136" width="12" height="10" />
          </g>

          <Room id="ls" color={c0} alarm={alarmRoom === 'ls'}>
            <path
              d="M19 97v-4h40v14"
              fill="none"
              stroke="#64748b"
              stroke-width="2.200"
              class={has('pipe') ? 'pipe-bad' : ''}
            />
            {has('pipe') && (
              <g class="fx-pipe">
                <ellipse cx="40" cy="93" rx="7" ry="4.500" />
                <circle cx="38" cy="100" r="1.300" class="drip" />
                <circle cx="43" cy="100" r="1.300" class="drip d2" />
              </g>
            )}
            {[14, 28].map((x) => (
              <g key={x}>
                <rect
                  x={x}
                  y="97"
                  width="10"
                  height="36"
                  rx="5"
                  fill="#0e3a5c"
                  stroke="#5cb4e4"
                  stroke-width="0.700"
                />
                <rect
                  x={x + 1.5}
                  y={131.5 - 23.5 * water}
                  width="7"
                  height={23.5 * water}
                  rx="3.500"
                  fill="#38bdf8"
                  opacity="0.750"
                />
                <circle cx={x + 5} cy="124" r="1" fill="#e0f2fe" class="bubble" />
                <circle cx={x + 4} cy="116" r="0.700" fill="#e0f2fe" class="bubble b2" />
              </g>
            ))}
            <rect
              x="48"
              y="108"
              width="24"
              height="25"
              rx="2"
              fill="#1e293b"
              stroke="#64748b"
              stroke-width="0.700"
            />
            <rect x="51" y="111" width="18" height="8" rx="1" fill="#0e7490" />
            <path d="M53 116l3-2 3 2 3-3 3 2" stroke="#a5f3fc" stroke-width="0.700" fill="none" />
            <circle
              cx="54"
              cy="126"
              r="2"
              fill={hud && hud.core.LS <= 4 ? '#e07a72' : '#6cc08b'}
              class="blink-slow"
            />
          </Room>

          <Room id="power" color={c1} alarm={alarmRoom === 'power'}>
            <g class={has('battHot') ? 'fx-shake' : ''}>
              <rect x="24" y="155" width="10" height="4" rx="1" fill="#94a3b8" />
              <rect
                x="14"
                y="158"
                width="30"
                height="31"
                rx="3"
                fill={props.scorched ? '#1c1917' : '#1e293b'}
                stroke={has('battHot') ? '#f0625a' : '#6cc08b'}
                stroke-width="0.900"
              />
              {[0, 1, 2, 3].map((i) => (
                <rect
                  key={i}
                  x="17"
                  y={181.5 - i * 6.5}
                  width="24"
                  height="5"
                  rx="1"
                  fill={has('battHot') ? '#f0625a' : bat > 0.25 ? '#6cc08b' : '#e2b046'}
                  opacity={bat * 4 > i ? 1 : 0.15}
                />
              ))}
              {props.scorched && (
                <path d="M16 160l8 6-5 5 9 6-6 8" stroke="#57534e" stroke-width="1" fill="none" />
              )}
            </g>
            {has('battHot') && (
              <g class="fx-smoke">
                <circle cx="24" cy="152" r="3" />
                <circle cx="32" cy="150" r="4" class="s2" />
                <path d="M46 160l5-3-2 5 6-2M12 164l-4-2 2 4-5 0" class="spark" />
              </g>
            )}
            <rect
              x="52"
              y="156"
              width="22"
              height="33"
              rx="2"
              fill="#1e293b"
              stroke="#64748b"
              stroke-width="0.700"
            />
            <circle
              cx="63"
              cy="166"
              r="6"
              fill="#0f172a"
              stroke={has('o2stop') ? '#f0625a' : '#5cb4e4'}
              stroke-width="0.800"
            />
            <path
              d="M63 161v10M58 166h10"
              stroke={has('o2stop') ? '#f0625a' : '#5cb4e4'}
              stroke-width="1.200"
              class={has('o2stop') ? '' : 'spin'}
              style={{ transformOrigin: '63px 166px' }}
            />
            <text x="63" y="184" class="s-label">
              O₂
            </text>
            {has('o2stop') && (
              <path
                d="M56 159l14 14M70 159l-14 14"
                stroke="#f0625a"
                stroke-width="1.600"
                class="blink"
              />
            )}
          </Room>

          <Room id="lab" color={c0} alarm={alarmRoom === 'lab'}>
            <rect
              x="92"
              y="95"
              width="28"
              height="18"
              rx="1.500"
              fill={has('labBroken') ? '#111827' : '#0e3a5c'}
              stroke="#5cb4e4"
              stroke-width="0.700"
            />
            {has('labBroken') ? (
              <g class="fx-broken">
                <path d="M106 104l-8-6M106 104l10-4M106 104l-4 8M106 104l9 6" />
                <path d="M120 96l4-3-1 4 4-1M92 112l-4 2 3 2" class="spark" />
              </g>
            ) : (
              <path
                d="M95 109l5-6 4 3 5-8 4 5 5-3"
                stroke="#a5f3fc"
                stroke-width="0.900"
                fill="none"
              />
            )}
            <rect
              x="126"
              y="100"
              width="12"
              height="9"
              rx="1"
              fill="#0e3a5c"
              stroke="#5cb4e4"
              stroke-width="0.500"
            />
            <rect x="124" y="124" width="30" height="3" rx="1" fill="#64748b" />
            <path d="M129 127v7M149 127v7" stroke="#64748b" stroke-width="1.400" />
            <path d="M132 124l2-5 5-1 3 3 1 3z" fill="#9a6b4f" />
            <path
              d="M146 124v-6h-1.500h5h-1.500v6l2 0z"
              fill="none"
              stroke="#a5f3fc"
              stroke-width="0.700"
            />
            <circle cx="148" cy="122" r="1.500" fill="#6cc08b" />
            {hud && hud.sp.pending > 0 && (
              <g class="lab-stars">
                <path d={ICON_PATHS.SP} transform="translate(141 93) scale(0.420)" fill="#f2cf5b" />
                <text x="152" y="102" class="s-label star">
                  {hud.sp.pending}
                </text>
              </g>
            )}
          </Room>

          <Room id="living" color={c1} alarm={alarmRoom === 'living'}>
            <rect x="90" y="161" width="26" height="4" rx="1" fill="#475569" />
            <rect x="90" y="177" width="26" height="4" rx="1" fill="#475569" />
            <path d="M90 152v38M116 152v38" stroke="#475569" stroke-width="1.200" />
            <rect x="92" y="157" width="7" height="4" rx="1.500" fill="#e2e8f0" />
            <rect x="92" y="173" width="7" height="4" rx="1.500" fill="#e2e8f0" />
            <rect x="124" y="181" width="24" height="8" rx="3" fill="#7c5a3a" />
            <rect x="122" y="177" width="5" height="12" rx="2" fill="#8b6844" />
            <rect x="145" y="177" width="5" height="12" rx="2" fill="#8b6844" />
            <path d="M120 163h18" stroke="#475569" stroke-width="1" />
            {Array.from({ length: crates }, (_, i) => (
              <rect
                key={i}
                x={120.5 + (i % 3) * 6}
                y={157.5 - Math.floor(i / 3) * 5.5}
                width="5"
                height="5"
                rx="0.800"
                fill="#f08bd0"
                stroke="#7a2f5e"
                stroke-width="0.400"
              />
            ))}
            <rect x="140" y="150" width="12" height="11" rx="1.500" fill="#e2e8f0" />
            <path d="M146 152.500v6M143 155.500h6" stroke="#e07a72" stroke-width="1.600" />
            {has('sneeze') && (
              <g class="fx-sneeze">
                <ellipse cx="104" cy="188" rx="2.200" ry="1.100" />
                <ellipse cx="112" cy="187" rx="2.200" ry="1.100" />
                <ellipse cx="120" cy="188" rx="2.200" ry="1.100" />
                <text x="134" y="158" class="s-shout">
                  ACHOO!
                </text>
              </g>
            )}
            {has('nosleep') && (
              <g class="fx-zzz">
                <text x="100" y="156" class="s-shout z">
                  Z
                </text>
                <text x="107" y="150" class="s-shout z z2">
                  z
                </text>
              </g>
            )}
            {props.extras.includes('extra.dog') && (
              <g class="dog">
                <rect x="-5" y="-6" width="10" height="5" rx="1.500" fill="#cbd5e1" />
                <rect x="3" y="-10" width="5" height="5" rx="1.200" fill="#e2e8f0" />
                <circle cx="6.500" cy="-7.500" r="0.800" fill="#0ea5e9" />
                <path d="M-5-5l-3-3" stroke="#cbd5e1" stroke-width="1.200" class="tail" />
                <path d="M-3-1v1.500M3-1v1.500" stroke="#64748b" stroke-width="1.400" />
              </g>
            )}
          </Room>

          <Room id="command" color={c2} alarm={alarmRoom === 'command'}>
            <rect
              x="172"
              y="94"
              width="36"
              height="20"
              rx="1.500"
              fill="#0b2a22"
              stroke="#4fe0b0"
              stroke-width="0.700"
            />
            <circle cx="190" cy="104" r="7" fill="#b9532c" />
            <path
              d="M184 102q6-3 12 1M185 107q5 2 10-1"
              stroke="#7a321c"
              stroke-width="0.800"
              fill="none"
            />
            <rect
              x="214"
              y="96"
              width="16"
              height="10"
              rx="1"
              fill="#2a1215"
              stroke={c2}
              stroke-width="0.500"
            />
            <path d="M216 103l3-3 3 2 4-4" stroke="#fca5a5" stroke-width="0.700" fill="none" />
            <rect
              x="170"
              y="124"
              width="24"
              height="9"
              rx="1.500"
              fill="#1e293b"
              stroke="#64748b"
              stroke-width="0.600"
            />
            <rect
              x="206"
              y="124"
              width="24"
              height="9"
              rx="1.500"
              fill="#1e293b"
              stroke="#64748b"
              stroke-width="0.600"
            />
            <circle cx="175" cy="128" r="1" fill="#6cc08b" class="blink-slow" />
            <circle cx="179" cy="128" r="1" fill="#e2b046" />
            <circle cx="211" cy="128" r="1" fill="#5cb4e4" class="blink-slow" />
            {has('fight') && (
              <g class="fx-fight">
                <circle cx="186" cy="100" r="6" />
                <circle cx="214" cy="100" r="6" />
                <path d="M194 100l5-3-2 4 6-2-4 5" class="bolt" />
              </g>
            )}
          </Room>

          <Room id="shelter" color={c2} alarm={alarmRoom === 'shelter'}>
            <rect
              x="170"
              y="150"
              width="22"
              height="39"
              rx="2"
              fill="#475569"
              stroke="#94a3b8"
              stroke-width="0.800"
            />
            <circle cx="181" cy="169" r="5.500" fill="none" stroke="#cbd5e1" stroke-width="1.400" />
            <path d="M181 163.500v11M175.500 169h11" stroke="#cbd5e1" stroke-width="1" />
            {[0, 1, 2].map((i) => (
              <rect
                key={i}
                x={200 + (i % 2) * 14}
                y={181 - Math.floor(i / 2) * 8 - (i === 2 ? 0 : 0)}
                width="13"
                height="7.500"
                rx="3"
                fill="#38bdf8"
                opacity="0.800"
                stroke="#e0f2fe"
                stroke-width="0.400"
              />
            ))}
            <path
              d={ICON_PATHS.SH}
              transform="translate(210 150) scale(0.600)"
              fill="none"
              stroke={tier >= 2 ? '#6cc08b' : tier === 1 ? '#e2b046' : '#e07a72'}
              stroke-width="2"
            />
          </Room>

          <Room id="green" color={c3} alarm={alarmRoom === 'green'}>
            <rect
              x="250"
              y="94"
              width="54"
              height="3"
              rx="1.500"
              fill="#e9d5ff"
              class="grow-lamp"
            />
            {[120, 152, 184].map((y, row) => (
              <g key={y}>
                <rect x="248" y={y} width="58" height="4" rx="1" fill="#3b2a55" />
                {!has('shelves') &&
                  [256, 268, 280, 292].slice(0, 1 + Math.round(grow * 3)).map((x, i) => (
                    <g key={x} transform={`translate(${x} ${y}) scale(${0.35 + 0.65 * grow})`}>
                      <ellipse
                        cx="0"
                        cy="-4"
                        rx="5"
                        ry="4"
                        fill={row === 1 && i % 2 ? '#84cc16' : '#4ade80'}
                      />
                      <ellipse cx="-3" cy="-6" rx="3" ry="2.500" fill="#86efac" />
                      {grow > 0.9 && row === 0 && (
                        <circle cx="2" cy="-4" r="1.200" fill="#f0625a" />
                      )}
                    </g>
                  ))}
                {has('shelves') && row < 2 && (
                  <path
                    d={`M262 ${y - 2}h6M282 ${y - 2}h6`}
                    stroke="#6b5a86"
                    stroke-width="1"
                    stroke-dasharray="1.500 1.500"
                  />
                )}
              </g>
            ))}
          </Room>
          {props.extras.includes('extra.lights') && (
            <g class="party-lights">
              {Array.from({ length: 16 }, (_, i) => (
                <circle
                  key={i}
                  cx={14 + i * 19.5}
                  cy={86 + (i % 2)}
                  r="1.300"
                  fill={['#f2cf5b', '#f0625a', '#4fd8e8', '#b072f5'][i % 4]}
                />
              ))}
            </g>
          )}
        </g>

        {/* ── things bought in the shop (decorations only) ── */}
        <g class="decor">
          {props.extras.includes('extra.rug') && (
            <ellipse
              cx="136"
              cy="190.500"
              rx="13"
              ry="1.800"
              fill="#c2513a"
              stroke="#f6a15b"
              stroke-width="0.400"
            />
          )}
          {props.extras.includes('extra.plant') && (
            <g transform="translate(153 134)">
              <path d="M-2.500 0h5l-0.800-4h-3.400z" fill="#b45309" />
              <path d="M0-4q-4-3-3-7q4 1 3 7zM0-4q4-3 3-8q-4 2-3 8z" fill="#4ade80" />
            </g>
          )}
          {props.extras.includes('extra.poster') && (
            <g transform="translate(222 112)">
              <rect
                x="-5"
                y="-6"
                width="10"
                height="12"
                rx="0.800"
                fill="#1e1b4b"
                stroke="#e2e8f0"
                stroke-width="0.500"
              />
              <path
                d="M0-3.500 1-1 3.500-0.800 1.600 0.800 2.200 3.300 0 2-2.200 3.300-1.600 0.800-3.500-0.800-1-1z"
                fill="#f2cf5b"
              />
            </g>
          )}
          {props.extras.includes('extra.telescope') && (
            <g transform="translate(190 66)">
              <path d="M0 0l-3-8M0 0l3-8M0-8v8" stroke="#94a3b8" stroke-width="0.800" />
              <rect
                x="-7"
                y="-13"
                width="14"
                height="4"
                rx="1.500"
                fill="#e2e8f0"
                stroke="#334155"
                stroke-width="0.500"
                transform="rotate(-28 0 -10)"
              />
            </g>
          )}
          {props.extras.includes('extra.trophy') && (
            <g transform="translate(182 124)">
              <path
                d="M-3-7h6v2.500a3 3 0 0 1-6 0zM0-1.500v1.500M-2 0h4"
                fill="#f2cf5b"
                stroke="#a16207"
                stroke-width="0.500"
              />
              <path
                d="M-3-6h-1.500v1.500l1.500 1M3-6h1.500v1.500l-1.500 1"
                fill="none"
                stroke="#f2cf5b"
                stroke-width="0.700"
              />
            </g>
          )}
          {props.extras.includes('extra.cat') && (
            <g class="cat">
              <rect x="-4.500" y="-5" width="9" height="5" rx="2" fill="#cbd5e1" />
              <path d="M2-5l0.500-3 2 2.500 2-2.500 0.500 3v3h-5z" fill="#e2e8f0" />
              <circle cx="3.800" cy="-4" r="0.600" fill="#22c55e" />
              <circle cx="5.800" cy="-4" r="0.600" fill="#22c55e" />
              <path
                d="M-4.500-3q-3-1-2.500-5"
                stroke="#cbd5e1"
                stroke-width="1.100"
                fill="none"
                class="tail"
              />
            </g>
          )}
          {props.extras.includes('extra.drone') && (
            <g class="drone">
              <rect
                x="-4"
                y="-1.500"
                width="8"
                height="3"
                rx="1.500"
                fill="#e2e8f0"
                stroke="#334155"
                stroke-width="0.400"
              />
              <path d="M-7-2.500h6M1-2.500h6" stroke="#9ad3f2" stroke-width="0.900" class="blink" />
              <circle cy="1.800" r="0.900" fill="#4fd8e8" />
            </g>
          )}
        </g>

        {/* ── whole-base trouble ── */}
        {has('fog') && (
          <g class="fx-fog">
            <rect x="4" y="84" width="312" height="114" rx="8" />
            <circle cx="60" cy="110" r="14" />
            <circle cx="150" cy="160" r="18" />
            <circle cx="230" cy="112" r="15" />
          </g>
        )}
        {has('frost') && (
          <g class="fx-frost">
            <rect x="4" y="84" width="312" height="114" rx="8" class="chill" />
            {(['ls', 'power', 'lab', 'living', 'command', 'shelter', 'green'] as const).map(
              (id) => {
                const [x, y, w, h] = ROOMS[id];
                return (
                  <path
                    key={id}
                    d={`M${x} ${y}l11 2-5 3 6 3-7 1 1 6-4-4-2 9zM${x + w} ${y}l-11 2 5 3-6 3 7 1-1 6 4-4 2 9zM${x} ${y + h}l11-2-5-3 6-3-7-1 1-6-4 4-2-9zM${x + w} ${y + h}l-11-2 5-3-6-3 7-1-1-6 4 4 2-9z`}
                  />
                );
              },
            )}
          </g>
        )}

        {/* ── look here! ── */}
        {props.spot && (
          <g class="spot">
            <mask id="spot-mask">
              <rect x="-500" y="-200" width="1320" height="800" fill="#fff" />
              {props.focus && !['sky', 'panels', 'hub', 'far'].includes(props.focus) ? (
                <rect
                  x={ROOMS[props.focus][0] - 2}
                  y={ROOMS[props.focus][1] - 2}
                  width={ROOMS[props.focus][2] + 4}
                  height={ROOMS[props.focus][3] + 4}
                  rx="7"
                  fill="#000"
                />
              ) : (
                <circle cx={props.spot[0]} cy={props.spot[1]} r="40" fill="#000" />
              )}
            </mask>
            <rect
              x="-500"
              y="-200"
              width="1320"
              height="800"
              class="spot-dim"
              mask="url(#spot-mask)"
            />
            <g transform={`translate(${props.spot[0]} ${props.spot[1]})`}>
              <circle r="9" class="spot-ring" />
              <circle r="9" class="spot-ring r2" />
              <g class="spot-arrow">
                <path d="M0-12-9-27H9z" />
                <text y="-17.500">!</text>
              </g>
            </g>
          </g>
        )}

        {/* ── job spots ── */}
        {props.markers?.map((m) => (
          <g
            key={m.id}
            transform={`translate(${m.x} ${m.y - 44})`}
            onClick={() => props.onMarker?.(m.id)}
          >
            <g class={`marker ${m.chosen ? 'chosen' : ''}`}>
              <title>{m.label}</title>
              <circle r="9" />
              <path d={ICON_PATHS[m.icon]} transform="translate(-6 -6) scale(0.500)" />
              <path d="M-3 9l3 5 3-5z" class="tip" />
            </g>
          </g>
        ))}

        {/* ── crew ── */}
        {props.crew.map((c) => (
          <Astro key={c.id} c={c} suit={props.suit} />
        ))}
      </g>
    </svg>
  );
}
