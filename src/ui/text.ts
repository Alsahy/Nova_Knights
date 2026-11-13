/** UI text helpers: copy lookups with ids → titles from the spec content. */
import { CONTENT } from '../content';
import { copy } from '../content/copy';
import { fill, formatLog } from '../content/format';
import type { AstronautId, Chip, GameState, LogEntry } from '../engine/types';

export { fill };
export const ui = copy.ui;

export function eventTitle(id: string): string {
  return CONTENT.events[id]?.title ?? id;
}
export function actionTitle(id: string): string {
  const ev = CONTENT.events[id.slice(0, 5)];
  return (
    ev?.actions.find((a) => a.id === id)?.title ??
    (id.endsWith('.wait') ? copy.chip['chip.cantFixToday']! : id)
  );
}
export function taskTitle(id: string): string {
  return CONTENT.tasks[id]?.title ?? id;
}
export function callSign(s: GameState, id: AstronautId): string {
  return s.astronauts.find((a) => a.id === id)?.callSign ?? id;
}

/** Replace [Name] and [N] in spec kid text. */
export function kidText(s: GameState, text: string): string {
  const p = s.pending;
  let t = text;
  if (p?.nameTarget) t = t.replace(/\[Name\]/g, callSign(s, p.nameTarget));
  if (p?.warningSols !== undefined) t = t.replace(/\[N\]/g, String(p.warningSols));
  return t;
}

/** Log line with ids turned into titles. */
export function logLine(e: LogEntry): string {
  const params = { ...(e.params ?? {}) };
  const id = params['id'];
  if (typeof id === 'string')
    params['id'] =
      /^[A-Z]{2}-\d{2}\.[a-z]+$/.test(id) || id.endsWith('.wait')
        ? actionTitle(id)
        : eventTitle(id);
  if (typeof params['task'] === 'string')
    params['task'] = copy.ui.jobNames[params['task']] ?? taskTitle(params['task']);
  if (typeof params['what'] === 'string')
    params['what'] = copy.ui.thingNames[params['what']] ?? params['what'];
  if (typeof params['source'] === 'string') {
    const src = params['source'];
    params['source'] = src.startsWith('T-') ? taskTitle(src) : actionTitle(src);
  }
  return formatLog({ ...e, params });
}

const STAT_NAME: Record<string, string> = {
  LS: copy.ui.lifeSupport,
  SH: copy.ui.shield,
  PWR: copy.ui.power,
  BAT: copy.ui.battery,
  LAB: 'Lab',
  SP: copy.ui.stars,
  DOSE: copy.ui.badge,
  FOOD: 'Food packs',
  H2O: 'Water',
  O2T: 'Oxygen tanks',
  PARTS: 'Spare parts',
  MEDKIT: 'Med kits',
  FUL: 'Crew food',
  HYD: 'Crew water',
  AIR: 'Crew air',
  EN: 'Crew energy',
  TIME: '',
  RISK: '',
  LOST: '',
  EVENT: '',
  RULE: '',
};

/** Words for a chip (amount shown separately). */
export function chipLabel(c: Chip): string {
  if (c.label) {
    if (c.label.startsWith('chip.flag.')) {
      const flag = c.label.split('.').slice(3).join(' ');
      return c.label.includes('.clear.') && flag.startsWith('broken')
        ? `fixes ${flag.replace('broken ', '')}`
        : flagWords(flag);
    }
    if (c.label.startsWith('chip.trigger'))
      return fill(copy.chip['chip.trigger']!, { id: eventTitle(String(c.params?.['id'] ?? '')) });
    if (c.label.startsWith('chip.')) {
      const params = { ...(c.params ?? {}) };
      return fill(copy.chip[c.label] ?? c.label, params);
    }
    return c.label;
  }
  return STAT_NAME[c.icon] ?? c.icon;
}

function flagWords(flag: string): string {
  const map: Record<string, string> = {
    shelterReady: 'storm shelter ready',
    medWatch: 'doctor watches the badge',
    'broken o2maker': 'oxygen maker broken',
    'broken recycler': 'recycler broken',
    'broken lab': 'lab broken',
    'broken antenna': 'antenna broken',
    o2Covered: 'air safe tonight',
    drinkCovered: 'drinks covered today',
    sleepRoutine: 'better sleep',
    cr01Free: 'exercise costs no science',
    askEarthFree: 'next Ask Earth is free',
    reserve: 'emergency food box',
  };
  return map[flag] ?? flag;
}

export function signed(n: number): string {
  return n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0';
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
/** '2024-05-10' → '10 May 2024' (kid-friendly). */
export function kidDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return y && m && d ? `${d} ${MONTHS[m - 1]} ${y}` : iso;
}
