/**
 * "Who" cell parser (spec §3, §4, §7): MGR · ENG + ANY · RES + ANY (EVA) · 2× ANY (EVA) · ANY + MED · ENG + MGR ·
 * [Name] · ANY + [Name] · PICK · EVA crew · ENG or RES · ENG (others +1 EN) · ANY (RES ×2) …
 */
import type { Role, WhoSpec } from './types';

const ROLES: Role[] = ['MGR', 'ENG', 'MED', 'RES'];

export function parseWho(raw: string): WhoSpec {
  const text = raw.trim();
  const eva = /\(EVA\)/.test(text) || /^EVA crew$/i.test(text);
  const who: WhoSpec = {
    roles: [],
    alt: [],
    any: 0,
    name: false,
    pick: false,
    eva,
    evaCrew: /^EVA/.test(text),
    raw: text,
  };
  const core = text.replace(/\([^)]*\)/g, ' ').trim();
  if (/\bor\b/.test(core)) {
    who.alt = core
      .split(/\s+or\s+/)
      .map((r) => r.trim())
      .filter((r): r is Role => (ROLES as string[]).includes(r));
    return who;
  }
  for (const partRaw of core.split('+')) {
    const part = partRaw.trim();
    if (!part) continue;
    const n = /^(\d+)\s*×\s*(.+)$/.exec(part);
    const count = n ? Number(n[1]) : 1;
    const token = (n ? n[2]! : part).trim();
    if ((ROLES as string[]).includes(token))
      for (let i = 0; i < count; i++) who.roles.push(token as Role);
    else if (token === 'ANY') who.any += count;
    else if (token === '[Name]') who.name = true;
    else if (token === 'PICK') who.pick = true;
    else if (/^EVA crew$/i.test(token)) who.evaCrew = true;
    else throw new Error(`who: cannot parse "${raw}"`);
  }
  return who;
}

/** How many astronauts the card uses (for "EN-2 each" and EVA counts). */
export function headcount(w: WhoSpec): number {
  return Math.max(
    1,
    w.roles.length + w.any + (w.name ? 1 : 0) + (w.pick ? 1 : 0) + (w.alt.length ? 1 : 0),
  );
}
