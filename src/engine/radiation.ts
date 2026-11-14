/** Radiation rules (spec §2.6, D-007, D-008, D-010, D-017: one shared crew badge). */
import {
  BACKGROUND_DOSE_EVERY_SOLS,
  BACKGROUND_DOSE_EVERY_SOLS_SHIELDED,
  BACKGROUND_SHIELDED_MIN_TIER,
  BADGE,
  EVA_DOSE_CHANCE,
  SHELTER_BONUS,
  SHIELD_TIER_DIVISOR,
  CHECKUP_DOSE_CUT,
  STORM_SHIELD_WEAR,
} from './config';
import { chance } from './rng';
import { changeStat, changeSystem, clearFlag, hasFlag, log } from './state';
import type { BadgeColour, GameState } from './types';

/** D-007: tier = floor(SH / 3). */
export function shieldTier(sh: number): number {
  return Math.floor(Math.max(0, sh) / SHIELD_TIER_DIVISOR);
}

/** D-010: green 0–3 · yellow 4–6 · red 7–10. */
export function doseBadge(dose: number): BadgeColour {
  if (dose >= BADGE.redFrom) return 'red';
  if (dose >= BADGE.yellowFrom) return 'yellow';
  return 'green';
}

export type StormMode = 'sheltered' | 'wall' | 'inside';

/** Storm dose for S (spec §2.6): inside = S − tier · sheltered = S − tier − 2 · wall = SH+2 for this storm. */
export function stormDoseFor(s: GameState, S: number, mode: StormMode): number {
  const sh = s.systems.SH + (mode === 'wall' ? 2 : 0);
  const tier = shieldTier(sh);
  const sheltered = mode === 'sheltered' || hasFlag(s, 'shelterReady');
  let dose = S - tier - (sheltered ? SHELTER_BONUS : 0);
  if (hasFlag(s, 'prepared')) dose -= 1; // SW-09.a
  return Math.max(0, dose);
}

/** D-052: after a health check the next radiation hit is 1 weaker (then the effect is used up). */
function checkupCut(s: GameState): number {
  if (!hasFlag(s, 'medChecked')) return 0;
  clearFlag(s, 'medChecked');
  return CHECKUP_DOSE_CUT;
}

export function applyStorm(s: GameState, S: number, mode: StormMode): number {
  const dose = Math.max(0, stormDoseFor(s, S, mode) - checkupCut(s));
  if (hasFlag(s, 'shelterReady')) clearFlag(s, 'shelterReady');
  if (hasFlag(s, 'prepared')) clearFlag(s, 'prepared');
  const real = changeStat(s, 'DOSE', dose);
  log(s, 'dose', 'log.stormDose', { dose: real, S, mode });
  if (s.systems.SH > 0) {
    changeSystem(s, 'SH', -STORM_SHIELD_WEAR); // D-051: the storm uses up some of the shield
    log(s, 'warning', 'log.shieldWorn');
  }
  return real;
}

/** EVA dose: +1 with 50 % for each astronaut outside (spec §2.6), on the shared badge (D-017). */
export function applyEvaDose(s: GameState, people: number): number {
  let total = 0;
  for (let i = 0; i < people; i++) if (chance(s.rng, EVA_DOSE_CHANCE)) total += 1;
  if (total === 0) return 0;
  const real = changeStat(s, 'DOSE', total);
  if (real > 0) log(s, 'dose', 'log.evaDose', { dose: real }); // D-025: show why the badge went up
  return real;
}

/** Background dose timer (spec §2.6 + D-007). Called at night. */
export function backgroundDose(s: GameState): void {
  if (s.sol < s.timers.bgDoseSol) return;
  const real = changeStat(s, 'DOSE', 1);
  if (real > 0) log(s, 'dose', 'log.backgroundDose');
  const every =
    shieldTier(s.systems.SH) >= BACKGROUND_SHIELDED_MIN_TIER
      ? BACKGROUND_DOSE_EVERY_SOLS_SHIELDED
      : BACKGROUND_DOSE_EVERY_SOLS;
  s.timers.bgDoseSol = s.sol + every;
}
