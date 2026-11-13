/** Crew upkeep and Sick Bay (spec §2.2 with shared stats, D-011, D-017). */
import {
  AIR_LOSS_LOW_LS,
  AIR_LOSS_ZERO_LS,
  AIR_REFILL_LS_MIN,
  CREW_SIZE,
  MG02_PUSH_SICK_CHANCE,
  O2_MAKER_H2O_PER_SOL,
  POOL_MAX,
  POOL_ZERO_RESET,
  RECYCLER_LOSS_EVERY_SOLS,
  RECYCLER_LOSS_EVERY_SOLS_BRINE,
  SICK_BAY_SOLS,
  SLEEP_EN,
  BROKEN_O2MAKER_LS_PER_NIGHT,
} from './config';
import { recyclerRunning } from './power';
import { chance, int } from './rng';
import { changeStat, changeSystem, clearFlag, hasFlag, hasMod, log, notInSickBay } from './state';
import type { GameState, PoolKey } from './types';

/** Night step 3: eat, drink, oxygen maker H2O, AIR, sleep (spec §2.2). */
export function upkeep(s: GameState): void {
  // Eat: every astronaut eats 1 FOOD (rationing halves it, FD-06.a).
  const want = hasMod(s, 'rationing') ? Math.ceil(CREW_SIZE / 2) : CREW_SIZE;
  const eaten = Math.min(s.supplies.FOOD, want);
  s.supplies.FOOD -= eaten;
  if (eaten < want) {
    changeStat(s, 'FUL', -(want - eaten));
    log(s, 'upkeep', 'log.hungry', { n: want - eaten });
  }

  // Drink: recycler ON → free (loss every 4 / 12 sols); OFF or broken → 1 H2O each.
  if (hasFlag(s, 'drinkCovered')) {
    // LS-05.b / LS-05.c already covered today's water.
  } else if (recyclerRunning(s)) {
    if (s.sol >= s.timers.recyclerLossSol) {
      if (s.supplies.H2O > 0) s.supplies.H2O -= 1;
      const every = hasFlag(s, 'brine') ? RECYCLER_LOSS_EVERY_SOLS_BRINE : RECYCLER_LOSS_EVERY_SOLS;
      s.timers.recyclerLossSol = s.sol + every;
    }
  } else {
    const drunk = Math.min(s.supplies.H2O, CREW_SIZE);
    s.supplies.H2O -= drunk;
    if (drunk < CREW_SIZE) {
      changeStat(s, 'HYD', -(CREW_SIZE - drunk));
      log(s, 'upkeep', 'log.thirsty', { n: CREW_SIZE - drunk });
    }
  }

  // Oxygen maker (spec §2.1): uses H2O 1 per sol; broken → LS −1 (D-012); paused → O2T −1 (LS-09.b).
  if (hasFlag(s, 'broken:o2maker')) {
    if (!hasFlag(s, 'o2Covered')) {
      changeSystem(s, 'LS', -BROKEN_O2MAKER_LS_PER_NIGHT);
      log(s, 'upkeep', 'log.o2makerBroken');
    }
  } else if (hasFlag(s, 'o2Paused')) {
    if (s.supplies.O2T > 0) s.supplies.O2T -= 1;
    else {
      clearFlag(s, 'o2Paused');
      changeSystem(s, 'LS', -1);
      log(s, 'upkeep', 'log.o2TanksEmpty');
    }
  } else if (s.supplies.H2O >= O2_MAKER_H2O_PER_SOL) {
    s.supplies.H2O -= O2_MAKER_H2O_PER_SOL;
  } else {
    changeSystem(s, 'LS', -1);
    log(s, 'upkeep', 'log.noWaterForAir');
  }

  // Leak (LS-07.c): O2T −1 and LS −1 each sol until fixed.
  if (hasFlag(s, 'broken:leak')) {
    if (s.supplies.O2T > 0) s.supplies.O2T -= 1;
    changeSystem(s, 'LS', -1);
  }

  // Air from LS (spec §2.2, ×4 astronauts on the shared pool).
  const ls = s.systems.LS;
  if (ls >= AIR_REFILL_LS_MIN) s.crew.AIR = POOL_MAX;
  else if (ls >= 1) changeStat(s, 'AIR', -AIR_LOSS_LOW_LS * CREW_SIZE);
  else changeStat(s, 'AIR', -AIR_LOSS_ZERO_LS * CREW_SIZE);

  // Sleep: +1 EN per astronaut.
  changeStat(s, 'EN', SLEEP_EN * CREW_SIZE);
}

/** Night step 8: Sick Bay exits/entries (D-017: a pool at 0 sends one astronaut in, pool → 4). */
export function sickBayCheck(s: GameState): void {
  for (const a of s.astronauts) {
    if (a.sickBaySols > 0) {
      a.sickBaySols -= 1;
      if (a.sickBaySols === 0) log(s, 'info', 'log.backFromSickBay', { who: a.callSign });
    }
  }
  if (hasMod(s, 'pushOn') && chance(s.rng, MG02_PUSH_SICK_CHANCE)) sendToSickBay(s, 'pushOn');
  for (const k of ['FUL', 'HYD', 'AIR', 'EN'] as PoolKey[]) {
    if (s.crew[k] <= 0) {
      sendToSickBay(s, k);
      s.crew[k] = POOL_ZERO_RESET;
    }
  }
}

function sendToSickBay(s: GameState, why: string): void {
  const candidates = notInSickBay(s);
  if (candidates.length === 0) return;
  const a = candidates[int(s.rng, candidates.length)]!;
  a.sickBaySols = SICK_BAY_SOLS;
  a.plannedTask = null;
  log(s, 'warning', 'log.toSickBay', { who: a.callSign, why });
}
