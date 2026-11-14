/**
 * Where each problem happens in the base and which tool (and mini-game) each card becomes (D-031, D-032).
 * This is presentation only: what a card costs and does still comes from the spec through the engine.
 */
import { copy } from '../../content/copy';
import type { UiIcon } from '../components/Icon';
import { systemIcon } from '../components/Icon';
import type { Mech, MiniParams } from './minis';

export type RoomId =
  | 'sky'
  | 'panels'
  | 'hub'
  | 'far'
  | 'ls'
  | 'power'
  | 'lab'
  | 'living'
  | 'command'
  | 'shelter'
  | 'green';

/** Visual trouble the scene can show. */
export type Fx =
  | 'flare'
  | 'rays'
  | 'cloud'
  | 'crackle'
  | 'sparkle'
  | 'battHot'
  | 'dust'
  | 'wind'
  | 'frost'
  | 'flicker'
  | 'fog'
  | 'o2stop'
  | 'pipe'
  | 'shelves'
  | 'nosleep'
  | 'sneeze'
  | 'helmet'
  | 'rock'
  | 'labBroken'
  | 'antenna'
  | 'fight';

export interface Stage {
  room: RoomId;
  fx: Fx[];
  /** Where exactly the trouble is (scene units): the spotlight and the bouncing "!" go here. */
  at?: [number, number];
  /** Crew mood while this alarm is on. */
  mood?: string;
}

export const STAGE: Record<string, Stage> = {
  'SW-01': { room: 'sky', fx: ['flare'], at: [206, 16], mood: 'hot' },
  'SW-02': { room: 'shelter', fx: ['rays'], at: [152, 50], mood: 'hot' },
  'SW-03': { room: 'sky', fx: ['cloud'], at: [268, 14], mood: 'worried' },
  'SW-04': { room: 'command', fx: ['cloud', 'crackle'], at: [190, 104], mood: 'worried' },
  'SW-05': { room: 'far', fx: ['sparkle'], at: [236, 50], mood: 'happy' },
  'PW-01': { room: 'power', fx: ['battHot'], at: [29, 172], mood: 'worried' },
  'PW-02': { room: 'panels', fx: ['dust'], at: [60, 50], mood: 'worried' },
  'PW-03': { room: 'panels', fx: ['wind'], at: [60, 48], mood: 'happy' },
  'PW-07': { room: 'living', fx: ['frost'], at: [122, 168], mood: 'cold' },
  'PW-08': { room: 'power', fx: ['flicker'], at: [29, 172], mood: 'worried' },
  'LS-01': { room: 'ls', fx: ['fog'], at: [60, 118], mood: 'dizzy' },
  'LS-02': { room: 'ls', fx: ['fog'], at: [60, 118], mood: 'dizzy' },
  'LS-03': { room: 'power', fx: ['o2stop'], at: [63, 166], mood: 'worried' },
  'LS-05': { room: 'ls', fx: ['pipe'], at: [40, 95], mood: 'thirsty' },
  'FD-06': { room: 'green', fx: ['shelves'], at: [277, 150], mood: 'hungry' },
  'CR-02': { room: 'living', fx: ['nosleep'], at: [104, 172] },
  'CR-04': { room: 'living', fx: ['sneeze'], at: [112, 184], mood: 'sneeze' },
  'CR-05': { room: 'far', fx: ['helmet'], at: [250, 42], mood: 'worried' },
  'RS-01': { room: 'far', fx: ['rock'], at: [268, 58], mood: 'happy' },
  'RS-03': { room: 'lab', fx: ['labBroken'], at: [106, 104], mood: 'worried' },
  'RS-04': { room: 'command', fx: ['antenna'], at: [190, 104], mood: 'happy' },
  'CR-03': { room: 'living', fx: ['antenna'], at: [132, 172], mood: 'worried' },
  'CR-01': { room: 'living', fx: ['sparkle'], at: [136, 184], mood: 'happy' },
  'RS-05': { room: 'lab', fx: ['sparkle'], at: [106, 104], mood: 'happy' },
  'CM-02': { room: 'command', fx: ['crackle'], at: [190, 104], mood: 'worried' },
  'MG-03': { room: 'command', fx: ['fight'], at: [200, 104] },
};

const PREFIX_ROOM: Record<string, RoomId> = {
  SW: 'sky',
  PW: 'power',
  LS: 'ls',
  FD: 'green',
  CR: 'living',
  RS: 'lab',
  CM: 'command',
  MG: 'command',
};

export function stageFor(eventId: string): Stage {
  return STAGE[eventId] ?? { room: PREFIX_ROOM[eventId.slice(0, 2)] ?? 'command', fx: [] };
}

/** One way to play a tool: a mini-game and its settings. */
export interface Play {
  mech: Mech;
  p?: MiniParams;
}
export interface ToolDef {
  icon: UiIcon;
  /** 'none' = no skill needed (waiting, resting, leaving it). */
  mech: Mech | 'none';
  p?: MiniParams;
  /** Other mini-games this tool can open, so a second mission feels different (D-037). */
  alt?: Play[];
}

const glass = { n: 3, heavy: true, look: 'glass' };

export const TOOLS: Record<string, ToolDef> = {
  'SW-01.a': {
    icon: 'CRANK',
    mech: 'crank',
    p: { turns: 2 },
    alt: [{ mech: 'pull', p: { n: 2 } }],
  },
  'SW-01.b': { icon: 'KEYS', mech: 'mash', p: { n: 10 }, alt: [{ mech: 'whack', p: { n: 4 } }] },
  'SW-01.c': {
    icon: 'PACK',
    mech: 'swap',
    alt: [{ mech: 'slots', p: { n: 3, one: true, look: 'box' } }],
  },
  'SW-02.a': {
    icon: 'LATCH',
    mech: 'pull',
    p: { n: 2 },
    alt: [{ mech: 'crank', p: { turns: 2 } }],
  },
  'SW-02.b': {
    icon: 'BAG',
    mech: 'slots',
    p: { n: 3, precise: true, look: 'bag' },
    alt: [{ mech: 'basket', p: { n: 3, look: 'bag' } }],
  },
  'SW-02.c': { icon: 'TIME', mech: 'none' },
  'SW-03.a': {
    icon: 'SHOVEL',
    mech: 'slots',
    p: { n: 3, one: true, look: 'soil' },
    alt: [{ mech: 'mash', p: { n: 10 } }],
  },
  'SW-03.b': { icon: 'FLASK', mech: 'memory', p: { n: 3 }, alt: [{ mech: 'odd' }] },
  'SW-03.c': { icon: 'BAT', mech: 'charge', p: { look: 'battery' } },
  'SW-04.a': { icon: 'SWITCH', mech: 'timing', alt: [{ mech: 'reflex' }] },
  'SW-04.b': { icon: 'ANTENNA', mech: 'balance', alt: [{ mech: 'track', p: { look: 'earth' } }] },
  'SW-04.c': { icon: 'DATA', mech: 'track', p: { look: 'cloud' } },
  'SW-05.a': {
    icon: 'COMPASS',
    mech: 'basket',
    p: { n: 4, look: 'rock' },
    alt: [{ mech: 'dodge', p: { n: 3, look: 'astro' } }],
  },
  'SW-05.b': { icon: 'WRENCH', mech: 'sequence', p: { n: 4 }, alt: [{ mech: 'wires' }] },
  'SW-05.c': { icon: 'BED', mech: 'none' },
  'PW-01.a': { icon: 'TIME', mech: 'none' },
  'PW-01.b': {
    icon: 'HOSE',
    mech: 'track',
    p: { look: 'hose' },
    alt: [{ mech: 'whack', p: { n: 5 } }],
  },
  'PW-01.c': { icon: 'SWITCH', mech: 'reflex', alt: [{ mech: 'timing' }] },
  'PW-02.a': { icon: 'WIPER', mech: 'scratch', alt: [{ mech: 'sweep', p: { n: 5 } }] },
  'PW-02.b': { icon: 'TIME', mech: 'none' },
  'PW-02.c': { icon: 'TILT', mech: 'balance' },
  'PW-03.a': { icon: 'BAT', mech: 'charge', p: { look: 'battery' }, alt: [{ mech: 'count' }] },
  'PW-03.b': { icon: 'FLASK', mech: 'pairs', alt: [{ mech: 'mash', p: { n: 10 } }] },
  'PW-03.c': { icon: 'LAMP', mech: 'track', p: { look: 'lamp' } },
  'PW-07.a': {
    icon: 'DIAL',
    mech: 'crank',
    p: { turns: 2, jam: true },
    alt: [{ mech: 'charge', p: { look: 'battery' } }],
  },
  'PW-07.b': {
    icon: 'COUCH',
    mech: 'slots',
    p: { n: 4, one: true, look: 'crew' },
    alt: [{ mech: 'pairs' }],
  },
  'PW-07.c': { icon: 'WRENCH', mech: 'trace', p: { look: 'wrap' } },
  'PW-08.a': { icon: 'PLUG', mech: 'pull', p: { n: 2 } },
  'PW-08.b': { icon: 'PLUG', mech: 'swap' },
  'PW-08.c': { icon: 'DIAL', mech: 'crank', p: { turns: 2 } },
  'LS-01.a': {
    icon: 'WRENCH',
    mech: 'sequence',
    p: { n: 4 },
    alt: [{ mech: 'whack', p: { n: 5 } }],
  },
  'LS-01.b': {
    icon: 'CAN',
    mech: 'sort',
    p: { n: 5 },
    alt: [{ mech: 'charge', p: { look: 'balloon' } }],
  },
  'LS-01.c': { icon: 'BED', mech: 'none' },
  'LS-02.a': { icon: 'WIRES', mech: 'rotate' },
  'LS-02.b': { icon: 'ANTENNA', mech: 'reflex' },
  'LS-02.c': { icon: 'O2T', mech: 'charge', p: { look: 'balloon' } },
  'LS-03.a': { icon: 'WRENCH', mech: 'whack', p: { n: 5 }, alt: [{ mech: 'wires' }] },
  'LS-03.b': {
    icon: 'TORCH',
    mech: 'timing',
    p: { look: 'ring' },
    alt: [{ mech: 'memory', p: { n: 3 } }],
  },
  'LS-03.c': { icon: 'O2T', mech: 'crank', p: { turns: 2 } },
  'LS-05.a': { icon: 'TORCH', mech: 'rotate', alt: [{ mech: 'trace', p: { look: 'weld' } }] },
  'LS-05.b': { icon: 'AXE', mech: 'mash', p: glass, alt: [{ mech: 'timing' }] },
  'LS-05.c': { icon: 'H2O', mech: 'none' },
  'FD-06.a': { icon: 'KNIFE', mech: 'slice', p: { n: 2 }, alt: [{ mech: 'swap' }] },
  'FD-06.b': {
    icon: 'LAMP',
    mech: 'track',
    p: { look: 'lamp' },
    alt: [{ mech: 'charge', p: { look: 'battery' } }],
  },
  'FD-06.c': { icon: 'AXE', mech: 'count', alt: [{ mech: 'mash', p: glass }] },
  'CR-02.a': { icon: 'CLOCK', mech: 'catch', alt: [{ mech: 'whack', p: { n: 4 } }] },
  'CR-02.b': {
    icon: 'MOON',
    mech: 'trace',
    p: { look: 'maze' },
    alt: [{ mech: 'memory', p: { n: 3 } }],
  },
  'CR-02.c': { icon: 'TIME', mech: 'none' },
  'CR-04.a': { icon: 'VACUUM', mech: 'sweep', p: { n: 5 }, alt: [{ mech: 'sort', p: { n: 5 } }] },
  'CR-04.b': {
    icon: 'FAN',
    mech: 'mash',
    p: { n: 10, decay: 2, look: 'fan' },
    alt: [{ mech: 'crank', p: { turns: 2 } }],
  },
  'CR-04.c': { icon: 'TIME', mech: 'none' },
  'CR-05.a': {
    icon: 'KEYPAD',
    mech: 'sequence',
    p: { look: 'keypad' },
    alt: [{ mech: 'memory', p: { n: 3 } }],
  },
  'CR-05.b': { icon: 'CREW', mech: 'dodge', p: { n: 3, look: 'buddy' } },
  'CR-05.c': { icon: 'ROCK', mech: 'slots', p: { n: 1, one: true, drunk: true, look: 'rock' } },
  'RS-01.a': {
    icon: 'JET',
    mech: 'charge',
    p: { look: 'jet' },
    alt: [{ mech: 'dodge', p: { n: 3, look: 'astro' } }],
  },
  'RS-01.b': { icon: 'WIPER', mech: 'odd', alt: [{ mech: 'scratch', p: { look: 'rock' } }] },
  'RS-01.c': { icon: 'ROBOT', mech: 'dodge', p: { n: 3, look: 'robot' } },
  'RS-03.a': { icon: 'WIRES', mech: 'wires', alt: [{ mech: 'memory', p: { n: 3 } }] },
  'RS-03.b': {
    icon: 'HAND',
    mech: 'timing',
    p: { look: 'ring' },
    alt: [{ mech: 'mash', p: { n: 8 } }],
  },
  'RS-03.c': { icon: 'PARTS', mech: 'none' },
  'RS-04.a': { icon: 'ANTENNA', mech: 'track', p: { look: 'earth' }, alt: [{ mech: 'timing' }] },
  'RS-04.b': { icon: 'SP', mech: 'odd', alt: [{ mech: 'pairs' }] },
  'RS-04.c': { icon: 'TIME', mech: 'none' },
  // waiting for the answer from Earth is the game: signals take minutes to cross space
  'CR-03.a': { icon: 'ANTENNA', mech: 'reflex', alt: [{ mech: 'timing' }] },
  'CR-03.b': { icon: 'CREW', mech: 'pairs', alt: [{ mech: 'memory', p: { n: 3 } }] },
  'CR-03.c': { icon: 'TIME', mech: 'none' },
  'CR-01.a': { icon: 'HAND', mech: 'mash', p: { n: 10 }, alt: [{ mech: 'whack', p: { n: 4 } }] },
  'CR-01.b': { icon: 'FLASK', mech: 'odd', alt: [{ mech: 'sequence', p: { n: 4 } }] },
  'CR-01.c': { icon: 'MEDKIT', mech: 'count' },
  'RS-05.a': { icon: 'ANTENNA', mech: 'track', p: { look: 'earth' }, alt: [{ mech: 'reflex' }] },
  'RS-05.b': { icon: 'MEDKIT', mech: 'sort', p: { n: 5 }, alt: [{ mech: 'pairs' }] },
  'RS-05.c': { icon: 'FLASK', mech: 'memory', p: { n: 3 } },
  'CM-02.a': { icon: 'WRENCH', mech: 'balance', alt: [{ mech: 'crank', p: { turns: 2 } }] },
  'CM-02.b': { icon: 'ANTENNA', mech: 'wires', alt: [{ mech: 'rotate' }] },
  'CM-02.c': { icon: 'TIME', mech: 'none' },
  'MG-03.a': { icon: 'SUN', mech: 'scratch', alt: [{ mech: 'sweep', p: { n: 4 } }] },
  'MG-03.b': {
    icon: 'COMPASS',
    mech: 'dodge',
    p: { n: 3, look: 'astro' },
    alt: [{ mech: 'basket', p: { n: 3, look: 'rock' } }],
  },
  'MG-03.c': { icon: 'HAND', mech: 'timing', p: { look: 'hands' }, alt: [{ mech: 'pairs' }] },
};

/** Any card the table doesn't know still gets a tool, so the engine can show any event. */
const FALLBACK: Mech[] = ['mash', 'timing', 'sequence', 'crank'];
export function toolFor(actionId: string): ToolDef {
  const known = TOOLS[actionId];
  if (known) return known;
  if (actionId.endsWith('.wait')) return { icon: 'TIME', mech: 'none' };
  const letter = actionId.charCodeAt(actionId.length - 1);
  return { icon: systemIcon(actionId), mech: FALLBACK[letter % FALLBACK.length]! };
}

export function toolName(actionId: string, cardTitle: string): string {
  if (actionId.endsWith('.wait')) return copy.chip['chip.cantFixToday']!;
  return copy.tools[actionId] ?? cardTitle;
}

/** The mini-game to open this time: the tool's own one, or one of its alternatives. */
export function pickPlay(tool: ToolDef, vary = true): Play | null {
  if (tool.mech === 'none') return null;
  const all: Play[] = [
    { mech: tool.mech, ...(tool.p ? { p: tool.p } : {}) },
    ...(vary ? (tool.alt ?? []) : []),
  ];
  return all[Math.floor(Math.random() * all.length)]!;
}

export function howTo(play: Play | null): string {
  if (!play) return '';
  if (play.mech === 'sequence' && play.p?.['look'] === 'keypad') return copy.mech['keypad']!;
  return copy.mech[play.mech] ?? '';
}

/** Where an astronaut stands for each job (scene units), and the icon the job shows. */
export const JOBS: Record<string, { x: number; y: number; icon: UiIcon; room: RoomId }> = {
  'T-REST': { x: 100, y: 190, icon: 'BED', room: 'living' },
  'T-SEND': { x: 212, y: 134, icon: 'ANTENNA', room: 'command' },
  'T-GARDEN': { x: 276, y: 190, icon: 'SPROUT', room: 'green' },
  'T-MAINT-LS': { x: 56, y: 134, icon: 'LS', room: 'ls' },
  'T-PANELS': { x: 62, y: 66, icon: 'SUN', room: 'panels' },
  'T-SHIELD': { x: 126, y: 66, icon: 'SH', room: 'hub' },
  'T-TREAT': { x: 144, y: 190, icon: 'MEDKIT', room: 'living' },
  'T-MED': { x: 144, y: 190, icon: 'MEDKIT', room: 'living' },
  'T-LAB': { x: 112, y: 134, icon: 'FLASK', room: 'lab' },
  'T-EVA-SCI': { x: 232, y: 66, icon: 'COMPASS', room: 'far' },
  'T-ICE': { x: 262, y: 66, icon: 'H2O', room: 'far' },
  'T-PEP': { x: 120, y: 190, icon: 'CREW', room: 'living' },
};

/** The mood a choice (or an alarm) leaves on the whole screen: ice, flames, radiation, dust, bad air (D-046). */
export type Amb = 'cold' | 'hot' | 'rad' | 'dust' | 'fog';
export const FX_AMB: Partial<Record<Fx, Amb>> = {
  frost: 'cold',
  flare: 'hot',
  battHot: 'hot',
  rays: 'rad',
  cloud: 'rad',
  dust: 'dust',
  wind: 'dust',
  fog: 'fog',
  sneeze: 'dust',
};
/** Cards that leave the trouble in the base for the rest of the sol. Cards not listed here clear it. */
export const AFTER: Record<string, Amb> = {
  'PW-07.b': 'cold', // one warm room: the others freeze
  'PW-01.a': 'hot', // left the hot battery running
  'SW-01.b': 'hot', // stayed out under the flare
  'SW-02.c': 'rad', // kept working in the storm
  'SW-04.b': 'rad',
  'SW-04.c': 'rad',
  'LS-01.c': 'fog', // rested instead of fixing the air
  'PW-02.b': 'dust', // waited for the wind
  'CR-04.c': 'dust', // ignored the dust
};

/** The 26 skills, each exactly once, for the Training room (D-056): no skill is ever shown twice. */
export const SKILLS: (Play & { icon: UiIcon })[] = [
  { mech: 'crank', p: { turns: 2 }, icon: 'CRANK' },
  { mech: 'mash', p: { n: 10 }, icon: 'KEYS' },
  { mech: 'slots', p: { n: 3, precise: true, look: 'bag' }, icon: 'BAG' },
  { mech: 'pull', p: { n: 2 }, icon: 'LATCH' },
  { mech: 'track', p: { look: 'hose' }, icon: 'HOSE' },
  { mech: 'timing', icon: 'SWITCH' },
  { mech: 'scratch', icon: 'WIPER' },
  { mech: 'balance', icon: 'TILT' },
  { mech: 'sequence', p: { n: 4 }, icon: 'WRENCH' },
  { mech: 'charge', p: { look: 'jet' }, icon: 'JET' },
  { mech: 'trace', p: { look: 'maze' }, icon: 'MOON' },
  { mech: 'slice', p: { n: 2 }, icon: 'KNIFE' },
  { mech: 'catch', icon: 'CLOCK' },
  { mech: 'dodge', p: { n: 3, look: 'robot' }, icon: 'ROBOT' },
  { mech: 'wires', icon: 'WIRES' },
  { mech: 'sweep', p: { n: 5 }, icon: 'VACUUM' },
  { mech: 'memory', p: { n: 3 }, icon: 'FLASK' },
  { mech: 'whack', p: { n: 5 }, icon: 'TORCH' },
  { mech: 'basket', p: { n: 4, look: 'rock' }, icon: 'ROCK' },
  { mech: 'pairs', icon: 'SP' },
  { mech: 'rotate', icon: 'H2O' },
  { mech: 'sort', p: { n: 5 }, icon: 'CAN' },
  { mech: 'odd', icon: 'COMPASS' },
  { mech: 'swap', icon: 'PACK' },
  { mech: 'count', icon: 'FOOD' },
  { mech: 'reflex', icon: 'HAND' },
];
