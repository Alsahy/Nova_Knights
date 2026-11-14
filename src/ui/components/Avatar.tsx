/**
 * Cartoon astronaut in a helmet (adapted from the design canvas). Fictional crew, not real people.
 * The face changes with the crew's mood (D-033): a kid reads the face before any number.
 */
import type { Role } from '../../engine/types';

export type Mood =
  | 'happy'
  | 'cheer'
  | 'worried'
  | 'hungry'
  | 'thirsty'
  | 'sleepy'
  | 'dizzy'
  | 'cold'
  | 'hot'
  | 'sick'
  | 'sneeze'
  | 'angry';

export const LOOK: Record<Role, { skin: string; hair: string; accent: string }> = {
  MGR: { skin: '#f1c9a5', hair: '#3b2314', accent: '#5cb4e4' },
  ENG: { skin: '#8d5a3b', hair: '#1c1410', accent: '#e2b046' },
  MED: { skin: '#e8b48f', hair: '#6b3a1e', accent: '#e07a72' },
  RES: { skin: '#c48a62', hair: '#2a1a12', accent: '#6cc08b' },
};

type Eyes = 'dot' | 'arc' | 'closed' | 'x' | 'shades' | 'squint' | 'angry';
type Mouth = 'smile' | 'grin' | 'frown' | 'wavy' | 'o' | 'zig' | 'flat';
const FACE: Record<Mood, { eyes: Eyes; mouth: Mouth; sweat?: boolean; tint?: string }> = {
  happy: { eyes: 'dot', mouth: 'smile' },
  cheer: { eyes: 'arc', mouth: 'grin' },
  worried: { eyes: 'dot', mouth: 'frown', sweat: true },
  hungry: { eyes: 'dot', mouth: 'wavy' },
  thirsty: { eyes: 'dot', mouth: 'flat', sweat: true },
  sleepy: { eyes: 'closed', mouth: 'o' },
  dizzy: { eyes: 'x', mouth: 'wavy', tint: '#7bd88f' },
  cold: { eyes: 'dot', mouth: 'zig', tint: '#9ad3f2' },
  hot: { eyes: 'shades', mouth: 'flat', sweat: true },
  sick: { eyes: 'closed', mouth: 'frown' },
  sneeze: { eyes: 'squint', mouth: 'o' },
  angry: { eyes: 'angry', mouth: 'frown' },
};

/** The face inside the visor, drawn around (90, 81) with radius 32. The scene reuses it at a tiny scale. */
export function Face({ role, mood = 'happy' }: { role: Role; mood?: Mood }) {
  const l = LOOK[role];
  const f = FACE[mood];
  const ink = {
    fill: 'none',
    stroke: '#0f172a',
    'stroke-width': 3.2,
    'stroke-linecap': 'round' as const,
  };
  return (
    <g>
      <circle cx="90" cy="81" r="32" fill={l.skin} />
      {f.tint && <circle cx="90" cy="81" r="32" fill={f.tint} opacity="0.35" />}
      <path d="M59 73C61 46 119 46 121 73 110 60 70 60 59 73z" fill={l.hair} />
      {f.eyes === 'dot' && (
        <g fill="#0f172a">
          <circle cx="78" cy="80" r="3.4" />
          <circle cx="102" cy="80" r="3.4" />
        </g>
      )}
      {f.eyes === 'angry' && (
        <g>
          <circle cx="78" cy="81" r="3.4" fill="#0f172a" />
          <circle cx="102" cy="81" r="3.4" fill="#0f172a" />
          <path d="M71 72l12 4M109 72l-12 4" {...ink} />
        </g>
      )}
      {f.eyes === 'arc' && <path d="M73 82q5-7 10 0M97 82q5-7 10 0" {...ink} />}
      {f.eyes === 'closed' && <path d="M73 81h10M97 81h10" {...ink} />}
      {f.eyes === 'x' && <path d="M74 76l8 8m0-8-8 8M98 76l8 8m0-8-8 8" {...ink} />}
      {f.eyes === 'squint' && <path d="M73 77l8 3-8 3M107 77l-8 3 8 3" {...ink} />}
      {f.eyes === 'shades' && (
        <g fill="#0f172a">
          <rect x="66" y="73" width="21" height="13" rx="5" />
          <rect x="93" y="73" width="21" height="13" rx="5" />
          <rect x="86" y="77" width="8" height="3" />
        </g>
      )}
      {f.mouth === 'smile' && (
        <path class="mouth" d="M80 94Q90 103 100 94" {...ink} stroke="#7c2d12" />
      )}
      {f.mouth === 'grin' && <path class="mouth" d="M78 92Q90 110 102 92z" fill="#7c2d12" />}
      {f.mouth === 'frown' && (
        <path class="mouth" d="M80 100Q90 91 100 100" {...ink} stroke="#7c2d12" />
      )}
      {f.mouth === 'wavy' && (
        <path class="mouth" d="M78 97q4-5 8 0t8 0 8 0" {...ink} stroke="#7c2d12" />
      )}
      {f.mouth === 'o' && <circle class="mouth" cx="90" cy="98" r="4.500" fill="#7c2d12" />}
      {f.mouth === 'zig' && (
        <path class="mouth" d="M78 98l4-4 4 4 4-4 4 4 4-4 4 4" {...ink} stroke="#7c2d12" />
      )}
      {f.mouth === 'flat' && <path class="mouth" d="M82 97h16" {...ink} stroke="#7c2d12" />}
      {f.sweat && <path d="M113 60q5 8 0 11-5-3 0-11z" fill="#7dd3fc" />}
    </g>
  );
}

export function Avatar({
  role,
  size = 56,
  dim = false,
  mood = 'happy',
  suit = '#e2e8f0',
  talking = false,
}: {
  role: Role;
  size?: number;
  dim?: boolean;
  mood?: Mood;
  suit?: string;
  talking?: boolean;
}) {
  const l = LOOK[role];
  const id = `v-${role}`;
  return (
    <svg
      viewBox="0 0 180 195"
      width={size}
      height={size * 1.08}
      aria-hidden="true"
      class={`avatar mood-${mood} ${talking ? 'talking' : ''}`}
      style={{ opacity: dim ? 0.5 : 1, flexShrink: 0 }}
    >
      <defs>
        <radialGradient id={id} cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color={l.accent} stop-opacity="0.25" />
          <stop offset="100%" stop-color="#0f172a" stop-opacity="0.85" />
        </radialGradient>
      </defs>
      <path
        d="M20 190C20 144 50 132 90 132S160 144 160 190z"
        fill={suit}
        stroke="#334155"
        stroke-width="3"
      />
      <rect
        x="66"
        y="148"
        width="48"
        height="30"
        rx="6"
        fill="#1e293b"
        stroke={l.accent}
        stroke-width="2"
      />
      <circle cx="80" cy="163" r="4.5" fill={l.accent} />
      <ellipse cx="90" cy="132" rx="46" ry="10" fill="#334155" stroke={l.accent} stroke-width="2" />
      <circle cx="90" cy="75" r="60" fill={suit} stroke="#475569" stroke-width="3" />
      <rect
        x="24"
        y="62"
        width="11"
        height="28"
        rx="4"
        fill={l.accent}
        stroke="#0f172a"
        stroke-width="2"
      />
      <rect
        x="145"
        y="62"
        width="11"
        height="28"
        rx="4"
        fill={l.accent}
        stroke="#0f172a"
        stroke-width="2"
      />
      <ellipse
        cx="90"
        cy="77"
        rx="46"
        ry="42"
        fill={`url(#${id})`}
        stroke={l.accent}
        stroke-width="2.5"
      />
      <Face role={role} mood={mood} />
      <path
        d="M56 58Q74 42 104 46"
        fill="none"
        stroke="#fff"
        stroke-width="3.5"
        stroke-linecap="round"
        opacity="0.45"
      />
    </svg>
  );
}
