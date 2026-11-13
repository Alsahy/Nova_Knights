/** Cartoon astronaut in a helmet (adapted from the design canvas). Fictional crew, not real people. */
import type { Role } from '../../engine/types';

const LOOK: Record<Role, { skin: string; hair: string; accent: string }> = {
  MGR: { skin: '#f1c9a5', hair: '#3b2314', accent: '#5cb4e4' },
  ENG: { skin: '#8d5a3b', hair: '#1c1410', accent: '#e2b046' },
  MED: { skin: '#e8b48f', hair: '#6b3a1e', accent: '#e07a72' },
  RES: { skin: '#c48a62', hair: '#2a1a12', accent: '#6cc08b' },
};

export function Avatar({ role, size = 56, dim = false }: { role: Role; size?: number; dim?: boolean }) {
  const l = LOOK[role];
  const id = `v-${role}`;
  return (
    <svg viewBox="0 0 180 195" width={size} height={size * 1.08} aria-hidden="true" style={{ opacity: dim ? 0.5 : 1, flexShrink: 0 }}>
      <defs>
        <radialGradient id={id} cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color={l.accent} stop-opacity="0.25" />
          <stop offset="100%" stop-color="#0f172a" stop-opacity="0.85" />
        </radialGradient>
      </defs>
      <path d="M20 190C20 144 50 132 90 132S160 144 160 190z" fill="#e2e8f0" stroke="#334155" stroke-width="3" />
      <rect x="66" y="148" width="48" height="30" rx="6" fill="#1e293b" stroke={l.accent} stroke-width="2" />
      <circle cx="80" cy="163" r="4.5" fill={l.accent} />
      <ellipse cx="90" cy="132" rx="46" ry="10" fill="#334155" stroke={l.accent} stroke-width="2" />
      <circle cx="90" cy="75" r="60" fill="#e2e8f0" stroke="#475569" stroke-width="3" />
      <rect x="24" y="62" width="11" height="28" rx="4" fill={l.accent} stroke="#0f172a" stroke-width="2" />
      <rect x="145" y="62" width="11" height="28" rx="4" fill={l.accent} stroke="#0f172a" stroke-width="2" />
      <ellipse cx="90" cy="77" rx="46" ry="42" fill={`url(#${id})`} stroke={l.accent} stroke-width="2.5" />
      <circle cx="90" cy="81" r="32" fill={l.skin} />
      <path d="M59 73C61 46 119 46 121 73 110 60 70 60 59 73z" fill={l.hair} />
      <circle cx="78" cy="80" r="3.4" fill="#0f172a" />
      <circle cx="102" cy="80" r="3.4" fill="#0f172a" />
      <path d="M80 94Q90 103 100 94" fill="none" stroke="#7c2d12" stroke-width="3" stroke-linecap="round" />
      <path d="M56 58Q74 42 104 46" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity="0.45" />
    </svg>
  );
}
