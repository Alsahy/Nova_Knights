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
  | 'PLAY'
  | 'CRANK'
  | 'KEYS'
  | 'BAG'
  | 'LATCH'
  | 'HOSE'
  | 'SWITCH'
  | 'WIPER'
  | 'TILT'
  | 'DIAL'
  | 'COUCH'
  | 'WRENCH'
  | 'CAN'
  | 'TORCH'
  | 'AXE'
  | 'KNIFE'
  | 'LAMP'
  | 'CLOCK'
  | 'MOON'
  | 'VACUUM'
  | 'FAN'
  | 'KEYPAD'
  | 'ROCK'
  | 'JET'
  | 'ROBOT'
  | 'PLUG'
  | 'HAND'
  | 'SHOVEL'
  | 'WIRES'
  | 'SOUND'
  | 'MUTE'
  | 'SHOP'
  | 'MEDAL'
  | 'PACK'
  | 'BED';

export const ICON_PATHS: Record<UiIcon, string> = {
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
  CRANK: 'M12 12m-7 0a7 7 0 1 0 14 0 7 7 0 1 0-14 0M12 12l5-5M16 5.5l3 3',
  KEYS: 'M3 7h18v10H3zM7 11h.01M11 11h.01M15 11h.01M8 14h8',
  BAG: 'M7 8h10l2 12H5zM9 8V5h6v3M12 12s2.5 2.5 2.5 4a2.5 2.5 0 0 1-5 0c0-1.5 2.5-4 2.5-4z',
  LATCH: 'M3 9h14v6H3zM17 12h4M7 9V6M7 18v-3M11 12h.01',
  HOSE: 'M4 19c0-7 5-4 5-10a3 3 0 0 1 6 0v2M13 11h4l3-2v6l-3-2M21 18v.01M18 19v.01M20 21v.01',
  SWITCH: 'M8 3h8v18H8zM12 7v6M12 17h.01',
  WIPER: 'M5 20 14 7M10 4l8 5-2 3-8-5zM16 16h4M14 19.5h4',
  TILT: 'M3 16 21 8M4 21h16M12 12v9',
  DIAL: 'M12 12m-8 0a8 8 0 1 0 16 0 8 8 0 1 0-16 0M12 12l3-5M12 2v2',
  COUCH: 'M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3M3 11h18v6H3zM5 17v2M19 17v2',
  WRENCH: 'M14.5 6a4 4 0 0 0-5 5L3 17.5 6.5 21l6.5-6.5a4 4 0 0 0 5-5l-2.5 2.5-2-2z',
  CAN: 'M7 6h10v14H7zM9 6V3h6v3M7 11h10M7 15h10',
  TORCH:
    'M4 20 13 11M11 9l4 4M15 7l2 2M18.5 2.5c1 2 2.5 2.5 2.5 4.5a2.5 2.5 0 0 1-5 0c0-1.5 1.5-2.500 2.5-4.5z',
  AXE: 'M5 21 15 7M13 4c3-1 6 1 7 5l-5 2-4-4z',
  KNIFE: 'M4 20l5-5M9 15 20 4c1 4-1 9-7 13z',
  LAMP: 'M8 3h8l3 8H5zM12 11v7M8 21h8',
  CLOCK: 'M12 13m-7 0a7 7 0 1 0 14 0 7 7 0 1 0-14 0M12 9v4l3 2M5 5 3 7M19 5l2 2',
  MOON: 'M20 14A8 8 0 1 1 10 4a6.5 6.5 0 0 0 10 10z',
  VACUUM: 'M6 21V8a4 4 0 0 1 8 0v2M4 21h6M14 10h6v5h-6zM17 15v6',
  FAN: 'M12 12m-1.5 0a1.5 1.5 0 1 0 3 0 1.5 1.5 0 1 0-3 0M12 10.5C12 6 9 4 7 6s1 5 5 4.500M13.5 12c4.5 0 6.5-3 4.5-5s-5 1-4.5 5M12 13.5c0 4.5 3 6.5 5 4.5s-1-5-5-4.500M10.5 12C6 12 4 15 6 17s5-1 4.500-5',
  KEYPAD:
    'M6 3h12v18H6zM9 7h6M9.5 11h.01M12 11h.01M14.5 11h.01M9.5 14h.01M12 14h.01M14.5 14h.01M9.5 17h.01M12 17h.01M14.5 17h.01',
  ROCK: 'M4 18 7 9l6-4 6 5 2 8zM7 9l5 4 7-3M12 13v5',
  JET: 'M8 4h8v10H8zM10 14l-1 6M14 14l1 6M8 7H5v5h3M16 7h3v5h-3',
  ROBOT: 'M6 8h12v9H6zM12 8V4M9.500 12h.01M14.5 12h.01M4 20h4M16 20h4M8 17v3M16 17v3',
  PLUG: 'M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4',
  HAND: 'M8 13V6a1.5 1.5 0 0 1 3 0v5V4.500a1.5 1.5 0 0 1 3 0V11V6a1.5 1.5 0 0 1 3 0v8a7 7 0 0 1-7 7c-3 0-4-2-6-6l-1-2.500a1.5 1.5 0 0 1 2.600-1.400z',
  SHOVEL: 'M5 3l4 4M7 5l9 9M13 13l5 1 2 4-3 3-4-2z',
  WIRES: 'M4 6h4c4 0 4 12 8 12h4M4 18h4c4 0 4-12 8-12h4',
  SOUND: 'M4 9v6h4l5 4V5L8 9zM16.5 8.500a5 5 0 0 1 0 7M19 6a8.500 8.500 0 0 1 0 12',
  MUTE: 'M4 9v6h4l5 4V5L8 9zM17 9.500l5 5M22 9.500l-5 5',
  SHOP: 'M4 9l2-5h12l2 5M4 9v11h16V9M10 20v-5h4v5M4 9h16',
  MEDAL: 'M12 15m-5 0a5 5 0 1 0 10 0 5 5 0 1 0-10 0M9 10.500 6 3h4l2 4 2-4h4l-3 7.500',
  PACK: 'M6 9a6 6 0 0 1 12 0v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2zM9 13h6v4H9zM10 3.500h4',
  BED: 'M3 18V8M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5M7 11.500h.01',
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
      <path d={ICON_PATHS[name]} />
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
