/** Night: the fixed order from D-001. */
import { LAB_WEAR_EVERY_SOLS, LS_WEAR_EVERY_SOLS, WATERWALL_MIN_H2O } from './config';
import { sickBayCheck, upkeep } from './crew';
import { applyEffects, newCtx } from './effects';
import { checkEndings } from './endings';
import { growCrops } from './greenhouse';
import { settlePower } from './power';
import { backgroundDose } from './radiation';
import { chance } from './rng';
import { changeSystem, log } from './state';
import { resolveTasks } from './tasks';
import type { Content, GameState, Mission } from './types';

export function runNight(s: GameState, content: Content, mission: Mission): void {
  // 1. resolve planned tasks that are still allowed
  resolveTasks(s, content);
  // 2. settle power
  settlePower(s, content);
  // 3. upkeep: eat, drink, oxygen maker H2O, AIR, sleep
  upkeep(s);
  // 4. ⏳ delayed effects that are due
  const due = s.scheduled.filter((d) => d.dueSol <= s.sol);
  s.scheduled = s.scheduled.filter((d) => d.dueSol > s.sol);
  for (const d of due) {
    if (d.chance !== undefined && !chance(s.rng, d.chance)) continue;
    const extra = d.nameTarget ? { nameTarget: d.nameTarget } : {};
    applyEffects(s, d.effects, newCtx(content, d.source, { ...extra, headcount: 1 }));
    log(s, 'info', 'log.later', { source: d.source });
  }
  // 5. greenhouse
  growCrops(s);
  // 6. wear, dust and background-dose timers (dust stacks are added in the morning, D-004)
  if (s.sol >= s.timers.lsWearSol) {
    changeSystem(s, 'LS', -1);
    s.timers.lsWearSol = s.sol + LS_WEAR_EVERY_SOLS;
    log(s, 'info', 'log.lsWear');
  }
  if (s.sol >= s.timers.labWearSol) {
    changeSystem(s, 'LAB', -1);
    s.timers.labWearSol = s.sol + LAB_WEAR_EVERY_SOLS;
    log(s, 'info', 'log.labWear');
  }
  backgroundDose(s);
  if (s.counters.waterWalls > 0 && s.supplies.H2O < WATERWALL_MIN_H2O) {
    changeSystem(s, 'SH', -s.counters.waterWalls); // spec T-WATERWALL: the bonus disappears below 10
    s.counters.waterWalls = 0;
    log(s, 'warning', 'log.waterWallGone');
  }
  // 8. Sick Bay / Indoor-only checks (Indoor-only is set the moment DOSE hits 10)
  sickBayCheck(s);
  // 9. ending checks
  checkEndings(s, mission);
  // 7. tick down modifiers and flags (after the ending check so MG-02.b's one-sol limit is still visible)
  s.modifiers = s.modifiers.filter((m) => m.untilSol === null || m.untilSol > s.sol);
  for (const [f, last] of Object.entries(s.flags)) if (last <= s.sol) delete s.flags[f];
  s.counters.evaYesterday = s.counters.evaToday;
  // 10. "What happened today"
  log(s, 'info', 'log.nightDone');
}
