/** Power budget (spec §2.1, D-002, D-003). */
import { LS_UNPOWERED_LOSS, NEED, REACTOR_DEFAULT, SOLAR_CLEAR } from './config';
import { changeSystem, hasFlag, hasMod, log, modSum } from './state';
import type { Content, GameState, PowerBudget, TaskDef } from './types';

export function taskPower(t: TaskDef | undefined): number {
  if (!t) return 0;
  return t.cost.reduce((a, e) => a + (e.kind === 'power' && e.delta < 0 ? -e.delta : 0), 0);
}

/** PWR reserved by tasks that are planned but not yet resolved (D-001). */
export function reservedTaskPower(s: GameState, content: Content): number {
  return s.astronauts.reduce(
    (a, x) => a + (x.plannedTask ? taskPower(content.tasks[x.plannedTask]) : 0),
    0,
  );
}

export function greenhouseRunning(s: GameState): boolean {
  return s.crop !== null && s.power.plugged.greenhouse && !hasMod(s, 'greenhouseOff');
}

export function recyclerRunning(s: GameState): boolean {
  return s.power.plugged.recycler && !hasFlag(s, 'broken:recycler');
}

/** Recompute today's budget from state (pure apart from writing s.power). */
export function computePower(s: GameState, content: Content): PowerBudget {
  const p = s.power;
  const solar =
    Math.max(0, Math.floor(SOLAR_CLEAR * s.dust.multiplier) - s.dust.stacks) +
    modSum(s, 'solarBonus'); // D-002
  const reactor = REACTOR_DEFAULT;
  const supply = solar + reactor + p.bonus;
  const batteryUsable = !hasFlag(s, 'batteryUnusable');
  const battery = s.systems.BAT;
  const need = {
    LS: p.plugged.LS ? NEED.LS : 0,
    recycler: recyclerRunning(s) ? NEED.recycler : 0,
    greenhouse: greenhouseRunning(s) ? NEED.greenhouse : 0,
    extra: modSum(s, 'needDelta'),
  };
  const totalNeed = Math.max(0, need.LS + need.recycler + need.greenhouse + need.extra);
  const spent = p.spent + reservedTaskPower(s, content);
  const usableBattery = batteryUsable ? battery : 0;
  const budget: PowerBudget = {
    solar,
    reactor,
    bonus: p.bonus,
    supply,
    battery,
    batteryUsable,
    need,
    totalNeed,
    spent,
    available: supply + usableBattery - totalNeed - spent,
    shortfall: Math.max(0, totalNeed - (supply + usableBattery)),
    plugged: { ...p.plugged },
  };
  s.power = { ...budget, spent: p.spent };
  return budget;
}

/** Night step 2: settle power (D-002/D-003). Leftover → battery; deficit → battery → LS unpowered. */
export function settlePower(s: GameState, content: Content): void {
  const b = computePower(s, content);
  const net = b.supply - b.totalNeed - s.power.spent;
  let lsPowered = s.power.plugged.LS;
  if (net >= 0) {
    changeSystem(s, 'BAT', net);
  } else {
    const deficit = -net;
    const fromBattery = b.batteryUsable ? Math.min(deficit, s.systems.BAT) : 0;
    changeSystem(s, 'BAT', -fromBattery);
    if (deficit > fromBattery) {
      lsPowered = false;
      log(s, 'power', 'log.powerShort', { short: deficit - fromBattery });
    }
  }
  if (!lsPowered) {
    changeSystem(s, 'LS', -LS_UNPOWERED_LOSS);
    log(s, 'power', 'log.lsUnpowered', { loss: LS_UNPOWERED_LOSS });
    s.counters.lsUnpoweredSols = s.systems.BAT === 0 ? s.counters.lsUnpoweredSols + 1 : 0;
  } else {
    s.counters.lsUnpoweredSols = 0;
  }
}
