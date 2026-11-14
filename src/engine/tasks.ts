/** Daily tasks (spec §4): planned in step 3, resolved at night (D-001). Shared crew stats (D-017). */
import { COND, FALLBACK_EXTRA_EN, FALLBACK_SUCCESS } from './config';
import { applyEffects, newCtx } from './effects';
import { hookBlocked } from './hooks';
import { applyEvaDose } from './radiation';
import { computePower, taskPower } from './power';
import { chance } from './rng';
import { astro, changeStat, evaAllowed, hasFlag, hasMod, log, modSum } from './state';
import type { Astronaut, AstronautId, Content, Effect, GameState, TaskDef } from './types';

export interface TaskCheck {
  allowed: boolean;
  fallback: boolean;
  reason?: string; // copy key
}

const ORDER: AstronautId[] = ['MGR', 'ENG', 'MED', 'RES'];

function poolCost(effects: Effect[], stat: 'EN' | 'AIR'): number {
  return effects.reduce(
    (a, e) => a + (e.kind === 'stat' && e.stat === stat && e.delta < 0 ? -e.delta : 0),
    0,
  );
}

export function isSpecialist(t: TaskDef, a: Astronaut): boolean {
  if (t.who.alt.length) return t.who.alt.includes(a.role);
  if (t.who.roles.length) return t.who.roles.includes(a.role);
  return true;
}

/** Tasks shown in the plan screen (locked ones are hidden, not just disabled). */
export function visibleTasks(s: GameState, content: Content): TaskDef[] {
  return Object.values(content.tasks).filter((t) => {
    if (t.needs?.unlock && !hasFlag(s, `unlock:${t.needs.unlock}`)) return false;
    if (t.id === 'T-KIT' && s.counters.kitLeft <= 0) return false;
    return true;
  });
}

/** D-019: the role's job slots (≤ 4); 'A|B' resolves to the first allowed alternative. */
export function jobsFor(s: GameState, content: Content, id: AstronautId): string[] {
  const role = astro(s, id).role;
  const slots = content.missions[s.mission]?.jobs?.[role];
  if (!slots) return visibleTasks(s, content).map((t) => t.id);
  return slots.map((slot) => {
    const alts = slot.split('|').filter((t) => content.tasks[t]);
    return alts.find((t) => checkTaskBase(s, content, id, t).allowed) ?? alts[alts.length - 1]!;
  });
}

export function checkTask(
  s: GameState,
  content: Content,
  id: AstronautId,
  taskId: string,
): TaskCheck {
  const slots = content.missions[s.mission]?.jobs?.[astro(s, id).role];
  if (slots && !slots.some((slot) => slot.split('|').includes(taskId)))
    return { allowed: false, fallback: false, reason: 'reason.notTheirJob' };
  return checkTaskBase(s, content, id, taskId);
}

function checkTaskBase(s: GameState, content: Content, id: AstronautId, taskId: string): TaskCheck {
  const t = content.tasks[taskId];
  const a = astro(s, id);
  if (!t) return { allowed: false, fallback: false, reason: 'reason.unknown' };
  if (a.sickBaySols > 0) return { allowed: false, fallback: false, reason: 'reason.sickBay' };
  if (a.busyUntilSol >= s.sol) return { allowed: false, fallback: false, reason: 'reason.busy' };
  if (t.needs?.unlock && !hasFlag(s, `unlock:${t.needs.unlock}`))
    return { allowed: false, fallback: false, reason: 'reason.locked' };
  const fallback = !isSpecialist(t, a);
  const others = s.astronauts.filter((x) => x.id !== id && x.plannedTask);
  if (
    taskId === 'T-KIT' &&
    s.counters.kitLeft - others.filter((x) => x.plannedTask === 'T-KIT').length <= 0
  )
    return { allowed: false, fallback, reason: 'reason.noKit' };
  if (t.needs?.sickBay && !s.astronauts.some((x) => x.sickBaySols > 0))
    return { allowed: false, fallback, reason: 'reason.nobodySick' };
  if (taskId === 'T-LAB') {
    if (s.systems.LAB < (t.needs?.lab ?? COND.TLAB_MIN_LAB))
      return { allowed: false, fallback, reason: 'reason.labLow' };
    if (hasFlag(s, 'broken:lab') || hasMod(s, 'labOff'))
      return { allowed: false, fallback, reason: 'reason.labOff' };
  }
  if (taskId === 'T-GARDEN' && !s.crop)
    return { allowed: false, fallback, reason: 'reason.noCrop' };
  if (taskId === 'T-WATERWALL' && (s.supplies.H2O < 10 || s.counters.waterWalls >= 2))
    return { allowed: false, fallback, reason: 'reason.waterWall' };
  if (taskId === 'T-SEND' && s.sp.pending <= 0)
    return { allowed: false, fallback, reason: 'reason.nothingToSend' };
  if (t.eva && !evaAllowed(s)) return { allowed: false, fallback, reason: 'reason.indoor' };
  for (const e of t.cost)
    if (e.kind === 'hook') {
      const r = hookBlocked(s, e.hook, e.args);
      if (r) return { allowed: false, fallback, reason: r };
    }
  // D-059: with an empty battery, nothing that runs on electricity can be done
  if (s.systems.BAT === 0 && t.cost.some((e) => e.kind === 'power' && e.delta < 0))
    return { allowed: false, fallback, reason: 'reason.noPower' };
  // Resources: shared EN / AIR pools must cover every planned task (D-017).
  const plannedEN = others.reduce((sum, x) => {
    const ot = content.tasks[x.plannedTask!];
    return sum + (ot ? poolCost(ot.cost, 'EN') + (isSpecialist(ot, x) ? 0 : FALLBACK_EXTRA_EN) : 0);
  }, 0);
  const myEN = poolCost(t.cost, 'EN') + (fallback ? FALLBACK_EXTRA_EN : 0);
  if (plannedEN + myEN > s.crew.EN) return { allowed: false, fallback, reason: 'reason.noEnergy' };
  const plannedAIR = others.reduce(
    (sum, x) => sum + poolCost(content.tasks[x.plannedTask!]?.cost ?? [], 'AIR'),
    0,
  );
  if (plannedAIR + poolCost(t.cost, 'AIR') > s.crew.AIR)
    return { allowed: false, fallback, reason: 'reason.noAir' };
  for (const e of t.cost)
    if (e.kind === 'supply' && e.delta < 0 && s.supplies[e.key] < -e.delta)
      return { allowed: false, fallback, reason: 'reason.noSupply' };
  // Power: what's left today after base need, card spending and the OTHER planned tasks.
  const saved = a.plannedTask;
  a.plannedTask = null;
  const budget = computePower(s, content);
  a.plannedTask = saved;
  const extraSend = taskId === 'T-SEND' && hasFlag(s, 'backupAntenna') ? 1 : 0; // CM-02.b
  if (taskPower(t) + extraSend > budget.available)
    return { allowed: false, fallback, reason: 'reason.noPower' };
  return { allowed: true, fallback };
}

/** Night step 1: resolve the planned tasks still allowed (D-001). */
export function resolveTasks(s: GameState, content: Content): void {
  const evaIds = new Set(
    Object.values(content.tasks)
      .filter((t) => t.eva)
      .map((t) => t.id),
  );
  s.counters.evaToday = 0;
  for (const id of ORDER) {
    const a = astro(s, id);
    const taskId = a.plannedTask;
    if (!taskId) continue;
    const t = content.tasks[taskId];
    a.plannedTask = null;
    if (!t) continue;
    if (t.eva && !evaAllowed(s)) {
      log(s, 'task', 'log.taskCancelled', { who: a.callSign, task: taskId, why: 'indoor' });
      continue;
    }
    if (taskId === 'T-LAB' && (hasMod(s, 'labOff') || hasFlag(s, 'broken:lab'))) {
      log(s, 'task', 'log.taskCancelled', { who: a.callSign, task: taskId, why: 'labOff' });
      continue;
    }
    const fallback = !isSpecialist(t, a);
    const isEva = evaIds.has(taskId);
    if (isEva) s.counters.evaToday += 1;
    const ctx = newCtx(content, taskId, {
      actor: id,
      evaCount: isEva ? 1 : 0,
      res2x: t.res2x && a.role === 'RES' && !hasFlag(s, 'labHalf'),
    });
    if (taskId === 'T-SEND' && hasFlag(s, 'backupAntenna')) s.power.spent += 1;
    applyEffects(s, t.cost, ctx);
    if (fallback) {
      changeStat(s, 'EN', -FALLBACK_EXTRA_EN);
      if (!chance(s.rng, FALLBACK_SUCCESS)) {
        log(s, 'task', 'log.taskFailed', { who: a.callSign, task: taskId });
        continue;
      }
    }
    let effects = t.effects;
    if (taskId === 'T-LAB' && hasFlag(s, 'labHalf')) {
      // RS-03.c backup tools: half of lab SP (rounded down, min 0) until fixed.
      effects = effects.map((e) =>
        e.kind === 'sp' ? { ...e, delta: Math.floor(e.delta / 2) } : e,
      );
    }
    applyEffects(s, effects, ctx);
    if (isEva && !t.cost.some((e) => e.kind === 'evaDose')) applyEvaDose(s, 1);
    log(s, 'task', 'log.taskDone', { who: a.callSign, task: taskId });
  }
  // D-027: a flare's particles arrived today; anyone who went outside gets the full dose (spec SW-01.b, §2.6 on EVA = S).
  const S = modSum(s, 'sepToday');
  if (S > 0 && s.counters.evaToday > 0) {
    const real = changeStat(s, 'DOSE', S);
    log(s, 'dose', 'log.stormDose', { dose: real, S, mode: 'outside' });
  }
}
