/** Apply parsed effects to the working state (spec §3 + D-017 target rules). */
import { CREW_SIZE } from './config';
import { runHook } from './hooks';
import { applyEvaDose } from './radiation';
import { chance } from './rng';
import { changeStat, changeSystem, clearFlag, log, notInSickBay, setFlag } from './state';
import type { AstronautId, Content, Effect, GameState, StatKey, Target } from './types';

export interface Ctx {
  content: Content;
  source: string; // card / task id
  eventId?: string;
  nameTarget?: AstronautId;
  actor?: AstronautId;
  severity?: number;
  warningSols?: number;
  evaCount: number; // astronauts outside for this card / task
  headcount: number; // for "EN-2 each"
  res2x: boolean; // RES ×2 applies (D-006)
  deltas: Record<string, number>;
  caused: string[];
}

export function newCtx(content: Content, source: string, extra: Partial<Ctx> = {}): Ctx {
  return {
    content,
    source,
    evaCount: 0,
    headcount: 1,
    res2x: false,
    deltas: {},
    caused: [],
    ...extra,
  };
}

/** How many times a stat change applies on the shared pool (D-017). DOSE always once. */
export function multiplier(
  s: GameState,
  target: Target,
  stat: StatKey,
  ctx: Pick<Ctx, 'evaCount' | 'headcount'>,
): number {
  if (stat === 'DOSE') return 1;
  if (target === 'ALL') return stat === 'ENMAX' ? CREW_SIZE : notInSickBay(s).length;
  if (target === 'EVA') return ctx.evaCount;
  if (target === 'EACH') return ctx.headcount;
  return 1;
}

const add = (ctx: Ctx, key: string, v: number): void => {
  if (v !== 0) ctx.deltas[key] = (ctx.deltas[key] ?? 0) + v;
};

export function queueEvent(
  s: GameState,
  eventId: string,
  ctx: Ctx,
  inSols = 1,
  severity?: number,
): void {
  const mission = ctx.content.missions[s.mission];
  if (mission && !mission.events.includes(eventId)) return; // D-018: out-of-scope chains never happen
  const q = {
    eventId,
    dueSol: s.sol + inSols,
    sinceSol: s.sol + inSols,
    source: ctx.source,
  } as GameState['queue'][number];
  if (ctx.nameTarget) q.nameTarget = ctx.nameTarget;
  const sev = severity ?? ctx.severity;
  if (sev !== undefined) q.severity = sev;
  s.queue.push(q);
  ctx.caused.push(eventId);
}

export function applyEffects(s: GameState, effects: Effect[], ctx: Ctx): void {
  for (const e of effects) applyEffect(s, e, ctx);
}

export function applyEffect(s: GameState, e: Effect, ctx: Ctx): void {
  switch (e.kind) {
    case 'system':
      add(ctx, e.key, changeSystem(s, e.key, e.delta));
      return;
    case 'power':
      if (e.delta < 0) s.power.spent += -e.delta;
      else s.power.bonus += e.delta;
      add(ctx, 'PWR', e.delta);
      return;
    case 'sp': {
      const d = e.delta > 0 && ctx.res2x ? e.delta * 2 : e.delta;
      const before = s.sp.pending;
      s.sp.pending = Math.max(0, s.sp.pending + d);
      add(ctx, 'SP', s.sp.pending - before);
      return;
    }
    case 'supply': {
      const before = s.supplies[e.key];
      s.supplies[e.key] = Math.max(0, before + e.delta);
      add(ctx, e.key, s.supplies[e.key] - before);
      return;
    }
    case 'stat': {
      const m = multiplier(s, e.target, e.stat, ctx);
      add(ctx, e.stat, changeStat(s, e.stat, e.delta * m));
      return;
    }
    case 'flag':
      if (e.op === 'set') setFlag(s, e.flag, e.sols);
      else clearFlag(s, e.flag);
      if (e.flag.startsWith('broken:'))
        log(s, 'info', e.op === 'set' ? 'log.broken' : 'log.fixed', { what: e.flag.slice(7) });
      return;
    case 'trigger':
      queueEvent(s, e.event, ctx);
      return;
    case 'lost':
      return;
    case 'evaDose':
      add(ctx, 'DOSE', applyEvaDose(s, ctx.evaCount));
      return;
    case 'chance':
      if (chance(s.rng, e.p)) applyEffects(s, e.effects, ctx);
      return;
    case 'hook':
      runHook(s, e.hook, e.args, ctx);
      return;
  }
}
