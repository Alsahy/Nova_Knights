/**
 * Named hooks for spec cells written in prose (PLAN Phase 2). Mapped from src/content/overrides.ts.
 * Each hook mutates the working state; `hookBlocked` tells affordability when a hook needs something.
 */
import {
  CR02_MISTAKE_EVENTS,
  CREW_SIZE,
  CROPS,
  LS_WEAR_EVERY_SOLS,
  POOL_MAX,
  WATERWALL_MAX_SH,
  WATERWALL_MIN_H2O,
} from './config';
import type { Ctx } from './effects';
import { applyEffects, queueEvent } from './effects';
import { applyStorm, type StormMode } from './radiation';
import { chance, int } from './rng';
import {
  addModifier,
  astro,
  brokenFlags,
  changeStat,
  changeSystem,
  clearFlag,
  hasFlag,
  log,
  setFlag,
} from './state';
import type { CropKind, GameState, PoolKey, PoweredSystem, Role } from './types';

type Arg = string | number;
const num = (a: Arg | undefined, d: number): number => (typeof a === 'number' ? a : d);

function evaTaskIds(ctx: Ctx): Set<string> {
  return new Set(
    Object.values(ctx.content.tasks)
      .filter((t) => t.eva)
      .map((t) => t.id),
  );
}

function cancelTask(s: GameState, id: Role, why: string): void {
  const a = astro(s, id);
  if (a.plannedTask) {
    log(s, 'task', 'log.taskCancelled', { who: a.callSign, task: a.plannedTask, why });
    a.plannedTask = null;
  }
}

export function plantCrop(s: GameState, kind: CropKind): void {
  s.crop = {
    kind,
    plantedSol: s.sol,
    readySol: Math.max(s.sol, 1) + CROPS[kind].growSols,
    tended: false,
    tendedByRes: false,
    delayedUntended: false,
  };
  s.lastCrop = kind;
  s.power.plugged.greenhouse = true;
  log(s, 'info', 'log.planted', { crop: kind });
}

/** Why a hook makes a card unaffordable (copy key), or null. */
export function hookBlocked(s: GameState, hook: string, _args: Arg[]): string | null {
  switch (hook) {
    case 'needComms':
      return hasFlag(s, 'broken:antenna') || hasFlag(s, 'commsOff') ? 'reason.noComms' : null;
    case 'useReserve':
      return hasFlag(s, 'reserve') ? null : 'reason.noReserve';
    case 'o2Pause':
      return s.supplies.O2T < 1 ? 'reason.noO2T' : null;
    case 'leak':
      return s.supplies.O2T < 1 ? 'reason.noO2T' : null;
    case 'useKit':
      return s.counters.kitLeft > 0 ? null : 'reason.noKit';
    default:
      return null;
  }
}

export function runHook(s: GameState, hook: string, args: Arg[], ctx: Ctx): void {
  const evaIds = evaTaskIds(ctx);
  switch (hook) {
    case 'cancelEvaTasks':
      addModifier(s, 'noEva', 1, ctx.source, s.sol, 1); // D-027: also blocks outside jobs picked later today
      for (const a of s.astronauts)
        if (a.plannedTask && evaIds.has(a.plannedTask)) cancelTask(s, a.id, ctx.source);
      return;
    case 'cancelAllTasks':
      for (const a of s.astronauts) a.busyUntilSol = Math.max(a.busyUntilSol, s.sol); // D-027
      for (const a of s.astronauts) cancelTask(s, a.id, ctx.source);
      return;
    case 'cancelTasks': {
      if (ctx.eventId === 'CR-01' && hasFlag(s, 'cr01Free')) return; // RS-05.b
      for (let i = 0; i < num(args[0], 1); i++) {
        const planned = s.astronauts.filter((a) => a.plannedTask && a.plannedTask !== 'T-REST');
        if (planned.length === 0) {
          // D-027: jobs not picked yet → one free astronaut has no job today
          const free = s.astronauts.filter((a) => a.sickBaySols === 0 && a.busyUntilSol < s.sol);
          if (free.length) free[int(s.rng, free.length)]!.busyUntilSol = s.sol;
          continue;
        }
        cancelTask(s, planned[int(s.rng, planned.length)]!.id, ctx.source);
      }
      return;
    }
    case 'cancelNameTask':
      if (ctx.nameTarget) {
        cancelTask(s, ctx.nameTarget, ctx.source);
        astro(s, ctx.nameTarget).busyUntilSol = Math.max(
          astro(s, ctx.nameTarget).busyUntilSol,
          s.sol,
        );
      }
      return;
    case 'cancelRoleTask':
      cancelTask(s, String(args[0]) as Role, ctx.source);
      return;
    case 'labOff': {
      const offset = num(args[1], 0);
      addModifier(s, 'labOff', 1, ctx.source, s.sol + offset, num(args[0], 1));
      if (offset === 0)
        for (const a of s.astronauts)
          if (a.plannedTask === 'T-LAB') cancelTask(s, a.id, ctx.source);
      return;
    }
    case 'labHalf':
      setFlag(s, 'labHalf');
      return;
    case 'greenhouseOff': {
      const n = args[0] === 'warn' ? (ctx.warningSols ?? 1) : num(args[0], 1);
      addModifier(s, 'greenhouseOff', 1, ctx.source, s.sol, n);
      return;
    }
    case 'cropDelay':
      if (s.crop) s.crop.readySol += num(args[0], 1);
      return;
    case 'cropFaster':
      if (s.crop) s.crop.readySol = Math.max(s.sol + 1, s.crop.readySol - num(args[0], 1));
      return;
    case 'batteryUnusable':
      setFlag(s, 'batteryUnusable', 1);
      return;
    case 'batMax': {
      s.systems.BATMAX = num(args[0], 7);
      s.systems.BAT = Math.min(s.systems.BAT, s.systems.BATMAX);
      log(s, 'warning', 'log.batteryPop', { max: s.systems.BATMAX });
      return;
    }
    case 'needDelta':
      addModifier(s, 'needDelta', num(args[0], 0), ctx.source, s.sol, num(args[1], 1));
      return;
    case 'unplug':
      s.power.plugged[String(args[0]) as PoweredSystem] = false;
      return;
    case 'dustClear':
      s.dust.stacks = 0;
      clearFlag(s, 'waitWind');
      return;
    case 'dustHalf':
      s.dust.stacks = Math.floor(s.dust.stacks / 2);
      return;
    case 'dustAdd':
      s.dust.stacks += num(args[0], 1);
      return;
    case 'waitWind':
      setFlag(s, 'waitWind');
      return;
    case 'solarBonus':
      addModifier(s, 'solarBonus', num(args[0], 1), ctx.source, s.sol + 1, null);
      return;
    case 'noEva':
      addModifier(s, 'noEva', 1, ctx.source, s.sol, num(args[0], 1));
      for (const a of s.astronauts)
        if (a.plannedTask && evaIds.has(a.plannedTask)) cancelTask(s, a.id, ctx.source);
      return;
    case 'roomClosed': {
      const n = num(args[0], 3);
      const greenhouse = s.crop !== null && chance(s.rng, 0.5);
      runHook(s, greenhouse ? 'greenhouseOff' : 'labOff', [n], ctx);
      log(s, 'info', 'log.roomClosed', { room: greenhouse ? 'greenhouse' : 'lab', sols: n });
      return;
    }
    case 'nameBusy': {
      if (!ctx.nameTarget) return;
      const a = astro(s, ctx.nameTarget);
      const offset = num(args[1], 0);
      a.busyUntilSol = Math.max(a.busyUntilSol, s.sol + offset + num(args[0], 1) - 1);
      if (offset === 0) cancelTask(s, a.id, ctx.source);
      return;
    }
    case 'nameSickBay': {
      if (!ctx.nameTarget) return;
      const a = astro(s, ctx.nameTarget);
      cancelTask(s, a.id, ctx.source);
      a.sickBaySols = Math.max(a.sickBaySols, num(args[0], 2));
      log(s, 'warning', 'log.toSickBay', { who: a.callSign });
      return;
    }
    case 'evaMishap':
      queueEvent(s, chance(s.rng, 0.5) ? 'CR-05' : 'CR-06', ctx);
      return;
    case 'evaRace':
      setFlag(s, 'evaRace', 1);
      return;
    case 'storm':
      applyStorm(s, ctx.severity ?? 2, String(args[0]) as StormMode);
      return;
    case 'commsOff':
      setFlag(s, 'commsOff', num(args[0], 1));
      return;
    case 'backupAntenna':
      setFlag(s, 'backupAntenna');
      addModifier(s, 'needDelta', 1, ctx.source, s.sol, null); // spec CM-02.b: PWR-1 per sol
      return;
    case 'leak':
      setFlag(s, 'broken:leak');
      return;
    case 'o2Pause':
      setFlag(s, 'o2Paused');
      return;
    case 'plant':
      plantCrop(s, String(args[0]) as CropKind);
      return;
    case 'scienceKit':
      s.counters.kitLeft += num(args[0], 2);
      return;
    case 'useKit':
      s.counters.kitLeft = Math.max(0, s.counters.kitLeft - 1);
      return;
    case 'bankSP': {
      const amount = args[0] === 'half' ? Math.ceil(s.sp.pending / 2) : s.sp.pending;
      s.sp.pending -= amount;
      s.sp.banked += amount;
      ctx.deltas['SPbanked'] = (ctx.deltas['SPbanked'] ?? 0) + amount;
      log(s, 'info', 'log.spBanked', { sp: amount, total: s.sp.banked });
      return;
    }
    case 'rationing': {
      const n = num(args[0], 3);
      addModifier(s, 'rationing', 1, ctx.source, s.sol, n);
      changeStat(s, 'ENMAX', -CREW_SIZE); // spec FD-06.a: ALL.ENMAX-1 while rationing
      s.scheduled.push({
        id: s.nextId++,
        dueSol: s.sol + n - 1,
        effects: [{ kind: 'stat', target: 'CREW', stat: 'ENMAX', delta: CREW_SIZE }],
        source: ctx.source,
      });
      return;
    }
    case 'extraLights':
      addModifier(s, 'needDelta', 1, ctx.source, s.sol, num(args[0], 2));
      return;
    case 'useReserve':
      clearFlag(s, 'reserve');
      return;
    case 'randomRepairEvent':
      queueEvent(s, CR02_MISTAKE_EVENTS[int(s.rng, CR02_MISTAKE_EVENTS.length)]!, ctx);
      return;
    case 'endMission':
      s.ending = { kind: 'safe-return', sol: s.sol, reason: 'end.choseHome' };
      return;
    case 'repairsDouble':
      setFlag(s, 'repairsDouble', 2);
      return;
    case 'mg02Limit':
      s.flags['mg02Limit'] = s.sol + 1;
      return;
    case 'pushOn':
      addModifier(s, 'pushOn', 1, ctx.source, s.sol + 1, null);
      return;
    case 'mg03Vote': {
      const a = chance(s.rng, 0.5);
      if (a) {
        runHook(s, 'cancelRoleTask', ['RES'], ctx);
        runHook(s, 'solarBonus', [1], ctx);
      } else {
        runHook(s, 'dustAdd', [1], ctx);
        applyEffects(s, [{ kind: 'sp', delta: 2 }], ctx);
      }
      log(s, 'info', 'log.vote', { result: a ? 'panels' : 'explore' });
      return;
    }
    case 'exercise':
      setFlag(s, 'exercised');
      return;
    case 'maintLS': {
      s.timers.lsWearSol = s.sol + LS_WEAR_EVERY_SOLS;
      if (hasFlag(s, 'repairsDouble')) changeSystem(s, 'LS', 1);
      const broken = brokenFlags(s).filter((f) => f !== 'broken:lab' && f !== 'broken:antenna');
      if (broken.length && s.supplies.PARTS > 0) {
        s.supplies.PARTS -= 1; // D-012: T-MAINT-LS + PARTS-1 clears a broken flag
        clearFlag(s, broken[0]!);
        log(s, 'info', 'log.fixed', { what: broken[0]!.slice(7) });
      }
      return;
    }
    case 'maintLab':
      if ((hasFlag(s, 'broken:lab') || hasFlag(s, 'labHalf')) && s.supplies.PARTS > 0) {
        s.supplies.PARTS -= 1; // ASSUMPTION: T-MAINT-LAB + PARTS-1 fixes the lab (D-012 by analogy)
        clearFlag(s, 'broken:lab');
        clearFlag(s, 'labHalf');
        log(s, 'info', 'log.fixed', { what: 'lab' });
      }
      return;
    case 'tend':
      if (s.crop) {
        s.crop.tended = true;
        if (ctx.actor === 'RES') s.crop.tendedByRes = true;
      }
      return;
    case 'labTask':
      s.counters.labTasks += 1;
      return;
    case 'waterWall':
      if (s.supplies.H2O >= WATERWALL_MIN_H2O && s.counters.waterWalls < WATERWALL_MAX_SH) {
        s.counters.waterWalls += 1;
        changeSystem(s, 'SH', 1);
      }
      return;
    case 'checkup': {
      const pools: PoolKey[] = ['FUL', 'HYD', 'AIR', 'EN'];
      const lowest = pools.reduce((lo, k) => (s.crew[k] < s.crew[lo] ? k : lo), 'EN' as PoolKey);
      if (s.crew[lowest] < POOL_MAX) changeStat(s, lowest, 1);
      setFlag(s, 'medChecked', 1);
      return;
    }
    case 'treat': {
      const sick = s.astronauts
        .filter((a) => a.sickBaySols > 0)
        .sort((x, y) => y.sickBaySols - x.sickBaySols)[0];
      if (sick) {
        sick.sickBaySols = 1;
        log(s, 'info', 'log.treated', { who: sick.callSign });
      }
      return;
    }
    case 'peek':
      setFlag(s, 'peek', 2);
      return;
    case 'callReply':
      s.scheduled.push({
        id: s.nextId++,
        dueSol: s.sol + 1,
        effects: [{ kind: 'stat', target: 'CREW', stat: 'EN', delta: 1 }],
        source: ctx.source,
      });
      return;
    case 'needComms':
      return;
    case 'prose':
      log(s, 'warning', 'log.unparsed', { source: ctx.source });
      return;
    default:
      throw new Error(`unknown hook @${hook} (in ${ctx.source})`);
  }
}
