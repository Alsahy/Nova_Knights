/** Turn engine copy keys + params into kid-facing text (used by the UI and the simulator). */
import { copy } from './copy';
import type { Chip, LogEntry } from '../engine/types';

/** Fill {key} and optional {key? text with {key}} (shown only when key is present; nesting allowed). */
export function fill(template: string, params: Record<string, string | number> = {}): string {
  let out = '';
  let i = 0;
  while (i < template.length) {
    const ch = template[i]!;
    if (ch !== '{') {
      out += ch;
      i++;
      continue;
    }
    let depth = 1;
    let j = i + 1;
    while (j < template.length && depth > 0) {
      if (template[j] === '{') depth++;
      if (template[j] === '}') depth--;
      j++;
    }
    const body = template.slice(i + 1, j - 1);
    const opt = /^(\w+)\?([\s\S]*)$/.exec(body);
    if (opt) out += params[opt[1]!] !== undefined ? fill(opt[2]!, params) : '';
    else out += params[body] !== undefined ? String(params[body]) : `{${body}}`;
    i = j;
  }
  return out;
}

export function formatLog(e: LogEntry): string {
  const t = copy.log[e.key] ?? e.key;
  return fill(t, e.params);
}

export function reasonText(key: string | undefined): string {
  return key ? (copy.reason[key] ?? key) : '';
}

/** A flag chip key looks like chip.flag.set.broken.o2maker → readable fallback. */
export function chipText(c: Chip): string {
  const sign = (n: number) => (n > 0 ? `+${n}` : `${n}`.replace('-', '−'));
  const amount = c.amount !== undefined ? sign(c.amount) : '';
  let label = '';
  if (c.label) {
    if (c.label.startsWith('chip.flag.')) {
      const [, , op, ...rest] = c.label.split('.');
      label = `${op === 'set' ? '' : 'clear '}${rest.join(' ')}`.trim();
    } else
      label = c.label.startsWith('chip.') ? fill(copy.chip[c.label] ?? c.label, c.params) : c.label;
  }
  const when = c.inSols ? ` (in ${c.inSols} sol${c.inSols > 1 ? 's' : ''})` : '';
  return [c.icon, amount, label].filter(Boolean).join(' ') + when;
}
