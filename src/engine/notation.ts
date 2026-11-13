/**
 * Effect notation parser (spec §3), used by src/content to turn spec cells into Effect[].
 *
 * Clean notation (used by overrides and by simple spec cells), items separated by ';':
 *   ENG.EN-2 · ALL.ENMAX-1 · [Name].EN+3 · EN-2 each · LS+3 · PWR-1 · SP+2 · FOOD+15 · DOSE+1
 *   +FLAG:shelterReady · +FLAG:o2Covered@1 (lasts 1 sol) · -FLAG:reserve · → CM-02 · LOST: text
 *   EVA_DOSE (or "EVA dose") · @hook(arg, arg) · p=0.3: items…  (the chance covers the rest of the cell)
 * Later cells: clauses separated by '|', each optionally starting with ⏳N: and/or p=X:
 *   "⏳1: ENG.EN-1" · "p=0.3: → CM-02" · "⏳2: LS-1 | p=0.4: ⏳1: @batMax(7)"
 * Raw spec cells: backtick segments are parsed; leftover prose makes the cell "not ok" → it needs an override.
 */
import type { Delayed, Effect, StatKey, SupplyKey, SystemKey, Target } from './types';

const TARGETS = 'ALL|ME|EVA|PICK|NAME|EACH|CREW|MGR|ENG|MED|RES';
const STATS = 'FUL|HYD|AIR|EN|DOSE|ENMAX';
const RE_TARGET_STAT = new RegExp(`^(${TARGETS})\\.(${STATS})\\s*([+-]\\d+)(\\s+each)?$`);
const RE_NAME_STAT = new RegExp(`^\\[Name\\]\\.(${STATS})\\s*([+-]\\d+)$`);
const RE_BARE_STAT = new RegExp(`^(${STATS})\\s*([+-]\\d+)(\\s+each)?$`);
const RE_SYSTEM = /^(LS|SH|LAB|BAT)\s*([+-]\d+)$/;
const RE_SUPPLY = /^(FOOD|H2O|O2T|PARTS|MEDKIT)\s*([+-]\d+)$/;
const RE_PWR = /^PWR\s*([+-]\d+)$/;
const RE_SP = /^SP\s*([+-]\d+)$/;
const RE_FLAG = /^([+-])FLAG:([\w:]+?)(?:@(\d+))?$/;
const RE_TRIGGER = /^→\s*([A-Z]{2}-\d{2})$/;
const RE_LOST = /^LOST:\s*(.+)$/;
const RE_HOOK = /^@(\w+)(?:\((.*)\))?$/;
const RE_CHANCE = /^p=(0?\.\d+|1(?:\.0+)?):\s*(.*)$/;
const RE_DELAY = /^⏳(\d*)\s*:?\s*(.*)$/;

export class NotationError extends Error {}

/** Parse one item (no ';'). Throws NotationError if it isn't notation. */
export function parseItem(raw: string): Effect {
  const t = raw.trim();
  let m: RegExpExecArray | null;
  if ((m = RE_TARGET_STAT.exec(t))) {
    const target = (m[4] ? 'EACH' : m[1]) as Target;
    return { kind: 'stat', target, stat: m[2] as StatKey, delta: Number(m[3]) };
  }
  if ((m = RE_NAME_STAT.exec(t)))
    return { kind: 'stat', target: 'NAME', stat: m[1] as StatKey, delta: Number(m[2]) };
  if ((m = RE_BARE_STAT.exec(t)))
    return {
      kind: 'stat',
      target: m[3] ? 'EACH' : 'CREW',
      stat: m[1] as StatKey,
      delta: Number(m[2]),
    };
  if ((m = RE_SYSTEM.exec(t)))
    return { kind: 'system', key: m[1] as SystemKey, delta: Number(m[2]) };
  if ((m = RE_SUPPLY.exec(t)))
    return { kind: 'supply', key: m[1] as SupplyKey, delta: Number(m[2]) };
  if ((m = RE_PWR.exec(t))) return { kind: 'power', delta: Number(m[1]) };
  if ((m = RE_SP.exec(t))) return { kind: 'sp', delta: Number(m[1]) };
  if ((m = RE_FLAG.exec(t))) {
    const e: Effect = { kind: 'flag', op: m[1] === '+' ? 'set' : 'clear', flag: m[2]! };
    if (m[3]) e.sols = Number(m[3]);
    return e;
  }
  if ((m = RE_TRIGGER.exec(t))) return { kind: 'trigger', event: m[1]! };
  if ((m = RE_LOST.exec(t))) return { kind: 'lost', what: m[1]!.trim() };
  if (t === 'EVA_DOSE' || /^EVA dose$/i.test(t)) return { kind: 'evaDose' };
  if ((m = RE_HOOK.exec(t))) {
    const args = (m[2] ?? '')
      .split(',')
      .map((a) => a.trim())
      .filter((a) => a !== '')
      .map((a) => (/^-?\d+(\.\d+)?$/.test(a) ? Number(a) : a));
    return { kind: 'hook', hook: m[1]!, args };
  }
  throw new NotationError(`not notation: "${t}"`);
}

/** Parse a clean effect list ("a; b; p=0.3: c; d"). Empty / "—" → []. */
export function parseEffects(text: string): Effect[] {
  const t = text.trim();
  if (t === '' || t === '—' || t === '-') return [];
  const out: Effect[] = [];
  const parts = splitTop(t, ';');
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]!.trim();
    if (!part) continue;
    const c = RE_CHANCE.exec(part);
    if (c) {
      // The chance covers this item and every item after it.
      const rest = [c[2]!, ...parts.slice(i + 1)].join(';');
      out.push({ kind: 'chance', p: Number(c[1]), effects: parseEffects(rest) });
      return out;
    }
    out.push(parseItem(part));
  }
  return out;
}

/** Parse a clean "later" cell into Delayed[] (inSols 0 = rolled right away when the card is played). */
export function parseLater(text: string): Delayed[] {
  const t = text.trim();
  if (t === '' || t === '—') return [];
  return splitTop(t, '|').map((clause) => {
    let rest = clause.trim();
    let inSols = 0;
    let chance: number | undefined;
    for (;;) {
      const d = RE_DELAY.exec(rest);
      if (d && rest.startsWith('⏳')) {
        inSols = d[1] ? Number(d[1]) : 1; // D-012: ⏳ with no N = ⏳1
        rest = d[2]!.trim();
        continue;
      }
      const c = RE_CHANCE.exec(rest);
      if (c) {
        chance = Number(c[1]);
        rest = c[2]!.trim();
        continue;
      }
      break;
    }
    const out: Delayed = { inSols, effects: parseEffects(rest) };
    if (chance !== undefined) out.chance = chance;
    return out;
  });
}

function splitTop(text: string, sep: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = '';
  for (const ch of text) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === sep && depth === 0) {
      out.push(cur);
      cur = '';
    } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim()).filter((s) => s !== '');
}

export interface RawParse {
  ok: boolean;
  effects: Effect[];
  prose: string; // leftover words that are not notation
}

/**
 * Best-effort parse of a RAW spec cell such as "`ENG.EN-2; PARTS-1`; EVA dose" or "⏳1: `ENG.EN-1` (put the bags back)".
 * ok = false when prose is left over; the content layer then needs an override.
 */
export function parseRawCell(cell: string): RawParse {
  const t = cell.trim();
  if (t === '' || t === '—') return { ok: true, effects: [], prose: '' };
  const effects: Effect[] = [];
  const segs = [...t.matchAll(/`([^`]+)`/g)].map((m) => m[1]!);
  let prose = t.replace(/`[^`]+`/g, ' ');
  try {
    for (const seg of segs) effects.push(...parseEffects(seg));
  } catch {
    return { ok: false, effects: [], prose: t };
  }
  if (/EVA dose/i.test(prose)) {
    effects.push({ kind: 'evaDose' });
    prose = prose.replace(/EVA dose/gi, ' ');
  }
  prose = prose
    .replace(/\([^)]*\)/g, ' ') // parenthetical remarks are explanations
    .replace(/[;:,.·+]/g, ' ')
    .trim();
  return { ok: prose === '', effects, prose };
}
