/**
 * Content checks (PLAN Phase 3 task 8). Pure: used by scripts/check-content.ts and tests/content.
 * Errors fail the build; warnings are listed in PROGRESS.
 */
import { CONTENT, MVP_EVENTS } from './index';
import { buildContentData, UNPARSED } from './build';
import { M3_TIMELINE } from './missions';
import { SOURCES } from './sources';
import { STORIES } from './stories';
import type { ActionDef, Delayed, Effect } from '../engine/types';

export const MVP_TASKS = [
  'T-REST',
  'T-EXER',
  'T-MAINT-LS',
  'T-MAINT-LAB',
  'T-GARDEN',
  'T-LAB',
  'T-EVA-SCI',
  'T-SHIELD',
  'T-WATERWALL',
  'T-PANELS',
  'T-MED',
  'T-TREAT',
  'T-PLAN',
  'T-PEP',
  'T-CALL',
  'T-SEND',
] as const;

export interface Report {
  errors: string[];
  warnings: string[];
}

const words = (t: string): number => t.trim().split(/\s+/).filter(Boolean).length;

function negative(e: Effect): boolean {
  switch (e.kind) {
    case 'system':
    case 'power':
    case 'sp':
    case 'supply':
    case 'stat':
      return e.kind === 'stat' && e.stat === 'DOSE' ? e.delta > 0 : e.delta < 0;
    case 'lost':
    case 'hook':
    case 'evaDose':
    case 'trigger':
      return true;
    case 'flag':
      return e.op === 'clear' && !e.flag.startsWith('broken');
    case 'chance':
      return e.effects.some(negative);
  }
}

/** No free lunch (spec §1.1 rule 2): a cost now, a negative later, a risk or a lost chance. */
export function hasCost(a: ActionDef): boolean {
  return (
    a.costNow.length > 0 ||
    a.later.some((d: Delayed) => d.chance !== undefined || d.effects.some(negative))
  );
}

function triggers(effects: Effect[]): string[] {
  return effects.flatMap((e) =>
    e.kind === 'trigger' ? [e.event] : e.kind === 'chance' ? triggers(e.effects) : [],
  );
}

export function checkContent(): Report {
  buildContentData(); // fills UNPARSED
  const errors: string[] = [];
  const warnings: string[] = [];
  const mvp = new Set<string>(MVP_EVENTS);
  const sourceIds = new Set(SOURCES.map((s) => s.id));
  const actionIds = new Set<string>();

  for (const id of MVP_EVENTS) if (!CONTENT.events[id]) errors.push(`Must event ${id} is missing`);
  for (const id of MVP_TASKS) if (!CONTENT.tasks[id]) errors.push(`Must task ${id} is missing`);

  for (const ev of Object.values(CONTENT.events)) {
    const must = mvp.has(ev.id);
    const fail = (m: string) => (must ? errors : warnings).push(`${ev.id}: ${m}`);
    if (ev.actions.length < 2 || ev.actions.length > 3)
      fail(`has ${ev.actions.length} cards (needs 2–3)`);
    const stars = ev.actions.filter((a) => a.cadet).length;
    if (stars !== 2) fail(`has ${stars} ★ cards (needs 2)`);
    if (ev.realScience.sources.length === 0) fail('Real science has no [S#]');
    for (const s of ev.realScience.sources)
      if (!sourceIds.has(s)) errors.push(`${ev.id}: [${s}] is not in §11`);
    if (!STORIES[ev.id]) fail('no kid True story in the guide');
    if (words(ev.kidText) > 20)
      warnings.push(`${ev.id}: kid text is ${words(ev.kidText)} words (> 20, N-02)`);
    for (const a of ev.actions) {
      if (actionIds.has(a.id)) errors.push(`duplicate card id ${a.id}`);
      actionIds.add(a.id);
      if (!hasCost(a)) fail(`${a.id} has no cost (no free lunch)`);
      if (words(a.title) > 12) warnings.push(`${a.id}: title is ${words(a.title)} words (> 12)`);
      if (words(a.lesson) > 12) warnings.push(`${a.id}: lesson is ${words(a.lesson)} words (> 12)`);
      const all = [...a.costNow, ...a.effects, ...a.later.flatMap((d) => d.effects)];
      for (const t of triggers(all))
        if (!CONTENT.events[t]) errors.push(`${a.id}: chain target ${t} does not exist`);
    }
  }

  for (const u of UNPARSED) {
    const must = mvp.has(u.id.slice(0, 5)) || u.id.startsWith('T-');
    (must ? errors : warnings).push(
      `${u.id} ${u.cell}: prose without an override: "${u.text.slice(0, 60)}"`,
    );
  }

  for (const s of SOURCES) {
    if (s.audit === 'problem') warnings.push(`[${s.id}] audit problem: ${s.note ?? ''}`);
    if (s.audit === 'unverified')
      warnings.push(`[${s.id}] not verified automatically: ${s.note ?? ''}`);
  }
  const mustSources = new Set(
    MVP_EVENTS.flatMap((id) => CONTENT.events[id]?.realScience.sources ?? []),
  );
  for (const id of mustSources) {
    const s = SOURCES.find((x) => x.id === id);
    if (s && s.audit === 'not-audited')
      warnings.push(`[${id}] used by a Must event but not audited`);
  }

  for (const b of M3_TIMELINE.beats) {
    if (!CONTENT.events[b.eventId]) errors.push(`M3 timeline: unknown event ${b.eventId}`);
    if (!b.recordId || !b.realDate || !b.label)
      errors.push(`M3 timeline: beat on sol ${b.sol} has no real record`);
  }
  return { errors, warnings };
}
