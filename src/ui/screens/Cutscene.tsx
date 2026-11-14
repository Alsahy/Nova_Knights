/**
 * Short animated scenes (D-062): the trip to Mars before a mission, and one of three endings after it.
 * Drawn in code like the rest of the game (no video files, nothing to download). Tap or press a key to skip.
 * Captions are story lines; they state no science facts.
 */
import { useEffect, useState } from 'preact/hooks';
import { copy } from '../../content/copy';
import type { Role } from '../../engine/types';
import { Avatar } from '../components/Avatar';
import { fill } from '../text';
import { sfx } from '../game/sfx';

export type SceneKind = 'intro' | 'win' | 'home' | 'survival';
const ROLES: Role[] = ['MGR', 'ENG', 'MED', 'RES'];
const BEAT_MS = 3000;

function Rocket({ flame = true }: { flame?: boolean }) {
  return (
    <g class="cs-rocket">
      {flame && <path d="M-4 14Q0 30 4 14z" class="cs-flame" />}
      <path
        d="M0-18C7-10 7 6 5 14H-5C-7 6-7-10 0-18z"
        fill="#e2e8f0"
        stroke="#334155"
        stroke-width="1"
      />
      <circle cy="-4" r="3" fill="#5cb4e4" stroke="#334155" stroke-width="0.8" />
      <path d="M-5 8l-6 8h6zM5 8l6 8H5z" fill="#f0625a" stroke="#334155" stroke-width="0.8" />
    </g>
  );
}

function Stars() {
  return (
    <g fill="#fff">
      {[
        [12, 10],
        [40, 22],
        [70, 8],
        [104, 18],
        [132, 6],
        [150, 28],
        [24, 40],
        [88, 44],
        [120, 52],
        [56, 60],
      ].map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i % 3 ? 0.5 : 0.9}
          class="cs-twinkle"
          style={{ animationDelay: `${i * 0.3}s` }}
        />
      ))}
    </g>
  );
}

function Ground() {
  return (
    <g>
      <rect width="160" height="100" fill="url(#cs-sky)" />
      <path d="M0 70Q40 62 80 68T160 64V100H0z" fill="#6b2b18" />
      <path d="M0 82Q60 74 160 80V100H0z" fill="#3a1710" />
    </g>
  );
}

export function Cutscene(props: {
  kind: SceneKind;
  site: string;
  days: number;
  suit: string;
  onDone: () => void;
}) {
  const lines = copy.scenes[props.kind];
  const [beat, setBeat] = useState(0);
  useEffect(() => {
    sfx(props.kind === 'win' ? 'win' : beat === 0 ? 'fly' : 'wind');
    const t = window.setTimeout(
      () => (beat + 1 < lines.length ? setBeat(beat + 1) : props.onDone()),
      BEAT_MS,
    );
    return () => window.clearTimeout(t);
  }, [beat]);
  useEffect(() => {
    const key = (e: KeyboardEvent) =>
      (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') && props.onDone();
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);
  const k = props.kind;
  return (
    <section class={`cutscene cs-${k} beat-${beat}`} onClick={props.onDone} aria-live="polite">
      <svg key={beat} viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="cs-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#1a0b0d" />
            <stop offset="1" stop-color="#b9532c" />
          </linearGradient>
        </defs>
        {k === 'intro' && beat === 0 && (
          <g>
            <rect width="160" height="100" fill="#05060f" />
            <Stars />
            <circle cx="22" cy="72" r="10" fill="#3b82f6" />
            <path d="M15 68q5-4 9 0t-3 7-6-2z" fill="#6cc08b" />
            <circle cx="128" cy="30" r="16" fill="#b9532c" />
            <path
              d="M118 26q8-4 16 2M120 36q8 3 14-2"
              stroke="#7a321c"
              stroke-width="1.5"
              fill="none"
            />
            <path d="M30 66Q70 20 112 34" class="cs-path" />
            <g class="cs-fly">
              <g transform="rotate(62)">
                <Rocket />
              </g>
            </g>
          </g>
        )}
        {k === 'intro' && beat === 1 && (
          <g>
            <Ground />
            <Stars />
            <g class="cs-land">
              <Rocket />
            </g>
            <g class="cs-dust">
              <circle cx="66" cy="74" r="6" />
              <circle cx="94" cy="74" r="6" />
              <circle cx="80" cy="76" r="8" />
            </g>
          </g>
        )}
        {(k === 'intro' && beat === 2) || (k === 'win' && beat === 1) ? (
          <g>
            <Ground />
            <path
              d="M58 70V60q0-12 22-12t22 12v10z"
              fill="#94a3b8"
              stroke="#e2e8f0"
              stroke-width="0.8"
            />
            <rect
              x="74"
              y="58"
              width="12"
              height="12"
              rx="2"
              fill="#1e293b"
              stroke="#5cb4e4"
              stroke-width="0.7"
            />
            <circle cx="66" cy="58" r="2" fill="#5cb4e4" class="cs-twinkle" />
            {k === 'win' && (
              <g class="cs-fireworks">
                {[30, 80, 130].map((x, i) => (
                  <path
                    key={x}
                    transform={`translate(${x} ${22 + (i % 2) * 10})`}
                    d="M0-10 2.6-3.200 10-2.600 4.300 2.200 6.200 9.400 0 5.400-6.200 9.400-4.300 2.200-10-2.600-2.600-3.200z"
                    style={{ animationDelay: `${i * 0.35}s` }}
                  />
                ))}
              </g>
            )}
          </g>
        ) : null}
        {k === 'win' && beat === 0 && (
          <g>
            <rect width="160" height="100" fill="#05060f" />
            <Stars />
            <circle cx="132" cy="24" r="10" fill="#3b82f6" />
            <path d="M126 20q5-4 9 0t-3 7-6-2z" fill="#6cc08b" />
            <path d="M0 84Q60 74 160 82V100H0z" fill="#6b2b18" />
            <path d="M24 82V66" stroke="#94a3b8" stroke-width="2" />
            <path d="M14 62q10 12 20-2z" fill="#cbd5e1" transform="rotate(-30 24 62)" />
            {[0, 1, 2, 3, 4].map((i) => (
              <path
                key={i}
                class="cs-star-fly"
                style={{ animationDelay: `${i * 0.4}s` }}
                d="M0-5 1.300-1.600 5-1.300 2.100 1.100 3.100 4.700 0 2.700-3.100 4.700-2.100 1.100-5-1.300-1.300-1.600z"
              />
            ))}
          </g>
        )}
        {(k === 'home' || k === 'survival') && (
          <g>
            <Ground />
            <Stars />
            <path d="M22 70V62q0-9 16-9t16 9v8z" fill="#94a3b8" opacity="0.8" />
            <g class={beat === 0 ? 'cs-wait' : 'cs-lift'}>
              <Rocket flame={beat === 1} />
            </g>
            {beat === 1 && (
              <g class="cs-dust">
                <circle cx="88" cy="74" r="6" />
                <circle cx="112" cy="74" r="6" />
                <circle cx="100" cy="76" r="8" />
              </g>
            )}
          </g>
        )}
      </svg>
      {((k === 'intro' && beat === 2) || (k === 'win' && beat === 1)) && (
        <div class="cs-crew" aria-hidden="true">
          {ROLES.map((r, i) => (
            <span key={r} style={{ animationDelay: `${i * 0.12}s` }}>
              <Avatar role={r} size={84} mood="cheer" suit={props.suit} />
            </span>
          ))}
        </div>
      )}
      <p class="cs-caption" key={`c${beat}`}>
        {fill(lines[beat]!, { site: props.site, days: props.days })}
      </p>
      <button class="btn btn-small cs-skip" onClick={props.onDone}>
        {copy.scenes.skip} →
      </button>
    </section>
  );
}
