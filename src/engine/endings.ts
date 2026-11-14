/** How a mission ends (spec §2.5, D-005, D-010, MG-02). Night step 9. */
import { BADGE, END, MG02_LOW_SYSTEM, MG02_SICKBAY_COUNT } from './config';
import { log } from './state';
import type { Ending, GameState, Mission } from './types';

function critical(s: GameState): boolean {
  return (
    [s.systems.LS, s.systems.LAB, s.systems.BAT].filter((v) => v <= MG02_LOW_SYSTEM).length >= 2 ||
    s.astronauts.filter((a) => a.sickBaySols > 0).length >= MG02_SICKBAY_COUNT
  );
}

export function goalMet(s: GameState, mission: Mission): boolean {
  if (s.sp.banked < s.sp.goal) return false; // only banked SP counts (D-005)
  if (mission.goal.maxDose !== undefined && s.crew.DOSE > mission.goal.maxDose) return false; // D-010
  return true;
}

export function checkEndings(s: GameState, mission: Mission): void {
  if (s.ending) return;
  s.counters.lsZeroSols = s.systems.LS === 0 ? s.counters.lsZeroSols + 1 : 0;
  let e: Ending | null = null;
  // D-060: Survival ends the moment food, water or oxygen is gone, or the radiation badge turns red
  if (mission.endless && s.supplies.FOOD <= 0)
    e = { kind: 'brought-home', sol: s.sol, reason: 'end.noFood' };
  else if (mission.endless && s.supplies.H2O <= 0)
    e = { kind: 'brought-home', sol: s.sol, reason: 'end.noWater' };
  else if (mission.endless && s.systems.LS <= 0)
    e = { kind: 'brought-home', sol: s.sol, reason: 'end.lsZero' };
  else if (mission.endless && s.crew.DOSE >= BADGE.redFrom)
    e = { kind: 'brought-home', sol: s.sol, reason: 'end.highDose' };
  else if (s.counters.lsZeroSols >= END.lsZeroSols)
    e = { kind: 'brought-home', sol: s.sol, reason: 'end.lsZero' };
  else if (s.astronauts.filter((a) => a.sickBaySols > 0).length >= END.sickBayCount)
    e = { kind: 'brought-home', sol: s.sol, reason: 'end.sickBay' };
  else if (s.counters.lsUnpoweredSols >= END.unpoweredSols)
    e = { kind: 'brought-home', sol: s.sol, reason: 'end.noPower' };
  else if (s.flags['mg02Limit'] === s.sol && critical(s))
    e = { kind: 'safe-return', sol: s.sol, reason: 'end.mg02Limit' };
  else if (s.sol >= s.lastSol)
    e = goalMet(s, mission)
      ? { kind: 'success', sol: s.sol, reason: 'end.success' }
      : {
          kind: 'safe-return',
          sol: s.sol,
          reason: s.sp.banked < s.sp.goal ? 'end.lowScience' : 'end.highDose',
        };
  if (e) {
    s.ending = e;
    log(s, 'ending', e.reason, { kind: e.kind });
  }
}
