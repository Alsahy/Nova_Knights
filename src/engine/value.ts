/** How good a state is for the crew (used by the 10-second timeout (D-027) and the simulator's lookahead bot). */
import type { GameState } from './types';

export function stateValue(s: GameState): number {
  const dosePenalty = s.crew.DOSE * 2 + (s.crew.DOSE >= 7 ? 15 : 0);
  return (
    s.sp.banked * 3 +
    s.sp.pending * 1.5 +
    s.systems.LS * 2 +
    s.systems.SH +
    s.systems.BAT * 0.5 +
    s.crew.EN * 0.3 +
    s.supplies.PARTS * 0.6 +
    s.supplies.O2T * 0.8 +
    s.supplies.FOOD * 0.05 +
    s.supplies.H2O * 0.2 -
    dosePenalty -
    s.astronauts.filter((x) => x.sickBaySols > 0).length * 4 -
    Object.keys(s.flags).filter((f) => f.startsWith('broken:')).length * 3 -
    s.astronauts.filter((x) => x.busyUntilSol >= s.sol).length * 1.5
  );
}
