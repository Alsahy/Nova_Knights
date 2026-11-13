/**
 * Inline stroke icons (N-06: no system emoji; older Android shows 🫁 as a box).
 * Decorative by default (aria-hidden): every icon sits next to a text label.
 */
import type { IconName } from '../../engine/types';

export type UiIcon =
  | IconName
  | 'SUN'
  | 'ANTENNA'
  | 'COMPASS'
  | 'CREW'
  | 'FLASK'
  | 'SPROUT'
  | 'HELP'
  | 'MENU'
  | 'ARROW'
  | 'CHECK'
  | 'BRIEF'
  | 'DATA'
  | 'GEAR'
  | 'PLAY';

const P: Record<UiIcon, string> = {
  LS: 'M12 3v7m0 0c-2 0-6 2-6 7 0 2 1 3 2.5 3S11 18 11 16v-6m1 0c2 0 6 2 6 7 0 2-1 3-2.5 3S13 18 13 16v-6',
  SH: 'M12 3 20 6v6c0 5-3.5 8-8 9.2C7.5 20 4 17 4 12V6z',
  PWR: 'M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12z',
  BAT: 'M3 8h15v8H3zM18 11h2.5v2H18M6 10.5v3M9 10.5v3',
  LAB: 'M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3M7.5 15h9',
  SP: 'm12 3 2.6 5.6 6 .6-4.5 4.1 1.3 6L12 16.3 6.6 19.3l1.3-6L3.4 9.2l6-.6z',
  DOSE: 'M12 12m-2 0a2 2 0 1 0 4 0 2 2 0 1 0-4 0M12 10 8.5 4a9 9 0 0 1 7 0zM10.3 13 3.4 13a9 9 0 0 0 3.5 6.1zM13.7 13l6.9 0a9 9 0 0 1-3.5 6.1z',
  FOOD: 'M4 11h16a8 8 0 0 1-16 0zM8 7c0-1.5 1-2 1-3.5M12 7c0-1.5 1-2 1-3.5M16 7c0-1.5 1-2 1-3.5',
  H2O: 'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z',
  O2T: 'M9 7h6v13a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1zM10 7V4h4v3M8 4h8',
  PARTS:
    'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 1 0 0-7M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1',
  MEDKIT: 'M4 7h16v13H4zM9 7V4h6v3M12 10.5v6M9 13.5h6',
  FUL: 'M4 11h16a8 8 0 0 1-16 0zM8 7c0-1.5 1-2 1-3.5M12 7c0-1.5 1-2 1-3.5M16 7c0-1.5 1-2 1-3.5',
  HYD: 'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z',
  AIR: 'M3 9h11a3 3 0 1 0-3-3M3 13h15a3 3 0 1 1-3 3M3 17h7',
  EN: 'M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12z',
  TIME: 'M7 3h10M7 21h10M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9s8 4 8 9',
  RISK: 'M4 4h16v16H4zM8.5 8.5h.01M15.5 15.5h.01M15.5 8.5h.01M8.5 15.5h.01M12 12h.01',
  LOST: 'M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18M8.5 8.5l7 7M15.5 8.5l-7 7',
  EVENT: 'M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0',
  RULE: 'M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18M12 11v6M12 7.5h.01',
  SUN: 'M12 7.8a4.2 4.2 0 1 0 0 8.4 4.2 4.2 0 1 0 0-8.4M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6',
  ANTENNA:
    'M4.5 4.5a15 15 0 0 1 15 15M4.5 9.5a10 10 0 0 1 10 10M4.5 14.5a5 5 0 0 1 5 5M5.5 17a1.5 1.5 0 1 0 0 3 1.5 1.5 0 1 0 0-3',
  COMPASS: 'M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18M15.5 8.5l-2 5-5 2 2-5z',
  CREW: 'M12 4a4 4 0 1 0 0 8 4 4 0 1 0 0-8M4 21a8 8 0 0 1 16 0',
  FLASK: 'M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3',
  SPROUT: 'M12 21v-9M12 12C12 8 9 6 5 6c0 4 3 6 7 6zM12 14c0-4 3-6 7-6 0 4-3 6-7 6z',
  HELP: 'M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01',
  MENU: 'M4 7h16M4 12h16M4 17h16',
  ARROW: 'M5 12h13M13 6.5l5.5 5.5-5.5 5.5',
  CHECK: 'M5 12.5l4.5 4.5L19 7.5',
  BRIEF: 'M4.5 4.5a15 15 0 0 1 15 15M4.5 9.5a10 10 0 0 1 10 10M4.5 14.5a5 5 0 0 1 5 5',
  DATA: 'M4 19V5M4 19h16M8 15v-4M12 15V8M16 15v-6',
  GEAR: 'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 1 0 0-7M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1',
  PLAY: 'M7 4.5v15l12-7.5z',
};

export function Icon({
  name,
  size = 22,
  color = 'currentColor',
  label,
}: {
  name: UiIcon;
  size?: number;
  color?: string;
  label?: string;
}) {
  return (
    <svg
      class="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      stroke-width="2.1"
      stroke-linecap="round"
      stroke-linejoin="round"
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': 'true' })}
    >
      <path d={P[name]} />
    </svg>
  );
}

/** Icon for an event's system (spec §6 prefixes). */
export function systemIcon(eventId: string): UiIcon {
  const p = eventId.slice(0, 2);
  return (
    (
      {
        SW: 'SUN',
        PW: 'PWR',
        LS: 'AIR',
        FD: 'SPROUT',
        CR: 'CREW',
        RS: 'FLASK',
        CM: 'ANTENNA',
        MG: 'COMPASS',
      } as Record<string, UiIcon>
    )[p] ?? 'EVENT'
  );
}
