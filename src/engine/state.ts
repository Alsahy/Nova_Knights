/** Small pure helpers over GameState (they mutate the working copy that reduce() owns). */
import { FOREVER, POOL_MAX, SYSTEM_MAX, DOSE_MAX } from './config';
import type {
  Astronaut,
  AstronautId,
  GameState,
  LogEntry,
  Modifier,
  PoolKey,
  StatKey,
  SystemKey,
} from './types';

export const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v));

export function log(
  s: GameState,
  kind: LogEntry['kind'],
  key: string,
  params?: LogEntry['params'],
): void {
  const e: LogEntry = { sol: s.sol, kind, key };
  if (params) e.params = params;
  s.log.push(e);
}

// ── flags: value = last sol the flag applies (inclusive) ──
export function setFlag(s: GameState, flag: string, sols?: number): void {
  s.flags[flag] = sols === undefined ? FOREVER : s.sol + Math.max(1, sols) - 1;
}
export function hasFlag(s: GameState, flag: string): boolean {
  const v = s.flags[flag];
  return v !== undefined && v >= s.sol;
}
export function clearFlag(s: GameState, flag: string): void {
  delete s.flags[flag];
}
export function brokenFlags(s: GameState): string[] {
  return Object.keys(s.flags).filter((f) => f.startsWith('broken:') && hasFlag(s, f));
}

// ── modifiers ──
export function addModifier(
  s: GameState,
  kind: string,
  value: number,
  source: string,
  fromSol: number,
  sols: number | null,
): void {
  const m: Modifier = {
    id: s.nextId++,
    source,
    kind,
    value,
    fromSol,
    untilSol: sols === null ? null : fromSol + sols - 1,
  };
  s.modifiers.push(m);
}
export function activeMods(s: GameState, kind: string, sol = s.sol): Modifier[] {
  return s.modifiers.filter(
    (m) => m.kind === kind && m.fromSol <= sol && (m.untilSol === null || m.untilSol >= sol),
  );
}
export function modSum(s: GameState, kind: string, sol = s.sol): number {
  return activeMods(s, kind, sol).reduce((a, m) => a + m.value, 0);
}
export function hasMod(s: GameState, kind: string, sol = s.sol): boolean {
  return activeMods(s, kind, sol).length > 0;
}

// ── crew ──
export function availableAstronauts(s: GameState, sol = s.sol): Astronaut[] {
  return s.astronauts.filter((a) => a.sickBaySols === 0 && a.busyUntilSol < sol);
}
export function notInSickBay(s: GameState): Astronaut[] {
  return s.astronauts.filter((a) => a.sickBaySols === 0);
}
export function astro(s: GameState, id: AstronautId): Astronaut {
  const a = s.astronauts.find((x) => x.id === id);
  if (!a) throw new Error(`no astronaut ${id}`);
  return a;
}
export function evaAllowed(s: GameState): boolean {
  return !s.crew.indoorOnly && !hasMod(s, 'noEva');
}

/** Change a shared crew stat (D-017). Returns the real change. */
export function changeStat(s: GameState, stat: StatKey, delta: number): number {
  const c = s.crew;
  if (stat === 'DOSE') {
    const before = c.DOSE;
    c.DOSE = clamp(c.DOSE + delta, 0, DOSE_MAX);
    if (c.DOSE >= DOSE_MAX && !c.indoorOnly) {
      c.indoorOnly = true;
      log(s, 'dose', 'log.indoorOnly');
    }
    return c.DOSE - before;
  }
  if (stat === 'ENMAX') {
    const before = c.ENMAX;
    c.ENMAX = clamp(c.ENMAX + delta, 0, POOL_MAX);
    c.EN = Math.min(c.EN, c.ENMAX);
    return c.ENMAX - before;
  }
  const k = stat as PoolKey;
  const max = k === 'EN' ? c.ENMAX : POOL_MAX;
  const before = c[k];
  c[k] = clamp(c[k] + delta, 0, max);
  return c[k] - before;
}

export function changeSystem(s: GameState, key: SystemKey, delta: number): number {
  const before = s.systems[key];
  const max = key === 'BAT' ? s.systems.BATMAX : SYSTEM_MAX;
  s.systems[key] = clamp(before + delta, 0, max);
  return s.systems[key] - before;
}

export function plannedEva(s: GameState, evaTaskIds: Set<string>): Astronaut[] {
  return s.astronauts.filter((a) => a.plannedTask !== null && evaTaskIds.has(a.plannedTask));
}
