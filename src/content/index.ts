/**
 * Content builder (lane S): generated/spec.json + overrides.ts → engine Content.
 * Cells that are prose and have no override become a no-op `prose` hook and are listed in UNPARSED
 * (the content checker fails if an MVP event has one).
 */
import spec from './generated/spec.json';
import { EVENT_OVERRIDES, KIT_TASK, TASK_OVERRIDES, type CardOverride } from './overrides';
import { MISSIONS } from './missions';
import { parseEffects, parseLater, parseRawCell } from '../engine/notation';
import { parseWho } from '../engine/who';
import type {
  ActionDef,
  Content,
  DeckType,
  Delayed,
  Effect,
  EventDef,
  MissionId,
  TaskDef,
  Tier,
} from '../engine/types';

export interface Unparsed {
  id: string;
  cell: 'cost' | 'effect' | 'later' | 'who';
  text: string;
}
export const UNPARSED: Unparsed[] = [];

/** The 37 Must events (PLAN §3.2): M1 + M3 Cadet. */
export const MVP_EVENTS = [
  'FD-04',
  'FD-01',
  'SW-01',
  'SW-02',
  'SW-03',
  'SW-04',
  'SW-05',
  'SW-07',
  'PW-01',
  'PW-02',
  'PW-03',
  'PW-07',
  'PW-08',
  'LS-01',
  'LS-02',
  'LS-03',
  'LS-04',
  'LS-05',
  'LS-07',
  'LS-09',
  'FD-05',
  'FD-06',
  'CR-01',
  'CR-02',
  'CR-03',
  'CR-04',
  'CR-05',
  'CR-06',
  'CR-07',
  'RS-01',
  'RS-03',
  'RS-04',
  'RS-05',
  'RS-06',
  'CM-02',
  'MG-02',
  'MG-03',
] as const;

function prose(text: string): Effect[] {
  return [{ kind: 'hook', hook: 'prose', args: [text] }];
}

function cellEffects(
  id: string,
  cell: 'cost' | 'effect',
  clean: string | undefined,
  raw: string,
): Effect[] {
  if (clean !== undefined) return parseEffects(clean);
  const r = parseRawCell(raw);
  if (r.ok) return r.effects;
  UNPARSED.push({ id, cell, text: raw });
  return [...r.effects, ...prose(raw)];
}

function cellLater(id: string, clean: string | undefined, raw: string): Delayed[] {
  if (clean !== undefined) return parseLater(clean);
  const t = raw.trim();
  if (t === '' || t === '—') return [];
  // Simple raw forms: "`p=0.3: → CM-02`", "⏳1: `ENG.EN-1` (…)".
  const delay = /^⏳(\d*)\s*:?\s*/.exec(t);
  const r = parseRawCell(delay ? t.slice(delay[0].length) : t);
  if (r.ok) {
    const effects = r.effects;
    const inSols = delay ? (delay[1] ? Number(delay[1]) : 1) : 0;
    if (effects.length === 1 && effects[0]!.kind === 'chance') {
      const c = effects[0]!;
      return [{ inSols, chance: c.p, effects: c.effects }];
    }
    return [{ inSols, effects }];
  }
  UNPARSED.push({ id, cell: 'later', text: raw });
  return [{ inSols: 0, effects: prose(raw) }];
}

function whoOf(id: string, text: string) {
  try {
    return parseWho(text);
  } catch {
    UNPARSED.push({ id, cell: 'who', text });
    return parseWho('ANY');
  }
}

function buildEvents(): Record<string, EventDef> {
  const out: Record<string, EventDef> = {};
  for (const idx of spec.events) {
    const d = (spec.details as Record<string, (typeof spec.details)[keyof typeof spec.details]>)[
      idx.id
    ];
    if (!d) throw new Error(`content: no §7 details for ${idx.id}`);
    const ov = EVENT_OVERRIDES[idx.id] ?? {};
    const actions: ActionDef[] = d.cards.map((c) => {
      const o: CardOverride = ov.cards?.[c.letter] ?? {};
      return {
        id: c.id,
        eventId: idx.id,
        letter: c.letter,
        title: c.title,
        who: whoOf(c.id, o.who ?? c.who),
        cadet: c.star,
        costNow: cellEffects(c.id, 'cost', o.cost, c.cost),
        effects: cellEffects(c.id, 'effect', o.effect, c.effect),
        later: cellLater(c.id, o.later, c.later),
        lesson: c.lesson,
        tags: o.tags ?? [],
        raw: { who: c.who, cost: c.cost, effect: c.effect, later: c.later },
      };
    });
    const deck = idx.deck as DeckType[];
    out[idx.id] = {
      id: idx.id,
      title: d.title,
      icon: d.icon,
      system: idx.system,
      tier: idx.tier as Tier,
      deck,
      missions: idx.missions === 'all' ? 'all' : (idx.missions as MissionId[]),
      repeatable: !deck.includes('core') && !deck.includes('mission') && !deck.includes('setup'),
      kidText: d.kidText,
      realScience: d.realScience,
      onStart: ov.onStart ? parseEffects(ov.onStart) : [],
      actions,
    };
  }
  return out;
}

function buildTasks(): Record<string, TaskDef> {
  const out: Record<string, TaskDef> = {};
  for (const t of spec.tasks) {
    const o = TASK_OVERRIDES[t.id];
    if (!o) {
      UNPARSED.push({ id: t.id, cell: 'effect', text: t.effect });
      continue;
    }
    const who = whoOf(t.id, o.who ?? t.who.replace(/\s*\((?!EVA).*?\)/g, ''));
    const def: TaskDef = {
      id: t.id,
      title: t.title,
      who,
      cost: parseEffects(o.cost),
      effects: parseEffects(o.effect),
      eva: o.eva ?? false,
      res2x: o.res2x ?? false,
      lesson: t.lesson,
    };
    if (o.needs) def.needs = o.needs;
    out[t.id] = def;
  }
  out[KIT_TASK.id] = {
    id: KIT_TASK.id,
    title: KIT_TASK.title,
    who: parseWho(KIT_TASK.who),
    cost: parseEffects(KIT_TASK.cost),
    effects: parseEffects(KIT_TASK.effect),
    eva: false,
    res2x: false,
    lesson: KIT_TASK.lesson,
  };
  return out;
}

export const CONTENT: Content = {
  specVersion: spec.specVersion,
  events: buildEvents(),
  tasks: buildTasks(),
  missions: MISSIONS,
};
