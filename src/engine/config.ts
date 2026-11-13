/**
 * Every tunable number in the engine. Each one cites its source:
 *   spec §x.y = events-and-actions.md v0.3 · D-### = approved decision · PENDING P-### = proposal default.
 * These are STARTER values: the simulator (Phase 5) tunes them, via a proposal.
 */
import type { MissionId, SupplyKey, SystemKey, Tier } from './types';

// ── Starting values (spec §1.3) ──
export const START: Record<
  Tier,
  { systems: Record<SystemKey, number>; supplies: Record<SupplyKey, number>; startDose: number }
> = {
  cadet: {
    systems: { LS: 8, SH: 4, LAB: 8, BAT: 6 },
    supplies: { FOOD: 40, H2O: 18, O2T: 3, PARTS: 4, MEDKIT: 3 },
    startDose: 0,
  },
  commander: {
    systems: { LS: 7, SH: 3, LAB: 7, BAT: 5 },
    supplies: { FOOD: 70, H2O: 25, O2T: 2, PARTS: 3, MEDKIT: 2 },
    startDose: 0, // MG-04 sets 2–3 (spec §1.3, MG-04)
  },
};
/** Shared crew card (D-017): pools = 4 astronauts × spec §1.3 per-person values (FUL 4, HYD 4, AIR 5, EN 4). */
export const CREW_SIZE = 4; // spec §2.3
export const START_CREW = { FUL: 16, HYD: 16, AIR: 20, EN: 16, ENMAX: 20, DOSE: 0 } as const; // D-017
export const POOL_MAX = 20; // D-017: 4 × 5
export const POOL_ZERO_RESET = 4; // D-017: a pool that hits 0 sends one astronaut to Sick Bay and resets to 4
export const SYSTEM_MAX = 10; // spec §1.3 (0–10)
export const BAT_MAX = 10; // spec §1.3 (PW-01 can lower it to 7)
export const DOSE_MAX = 10; // spec §1.3 / §2.2 (10 → Indoor only)

// ── Power (spec §2.1, D-002, D-003) ──
export const SOLAR_CLEAR = 4; // spec §2.1
export const DUST_MULTIPLIER = { clear: 1, tau1to2: 0.6, tau2to5: 0.3, tauOver5: 0.05 } as const; // spec §2.1
export const DUST_STACK_PENALTY = 1; // spec §2.1: −1 PWR per stack
export const DUST_STACK_EVERY_SOLS = 4; // spec §2.1 / PW-02 (M2: 3, spec §8.2)
export const REACTOR_DEFAULT = 2; // spec §2.1
export const NEED = { LS: 2, recycler: 1, greenhouse: 1, heaterPerEvent: 1 } as const; // D-002
export const LS_UNPOWERED_LOSS = 2; // spec §2.1 + D-003

// ── Wear (spec §2.1) ──
export const LS_WEAR_EVERY_SOLS = 3; // spec §2.1: −1 every 3 sols unless maintained
export const LAB_WEAR_EVERY_SOLS = 4; // spec §2.1: −1 every 4 sols
export const O2_MAKER_H2O_PER_SOL = 1; // spec §2.1 (game-simplified, §2.6)
export const BROKEN_O2MAKER_LS_PER_NIGHT = 1; // D-012

// ── Water recycling (spec §2.6, LS-06) ──
export const RECYCLER_LOSS_EVERY_SOLS = 4; // spec §2.6: 4 crew lose 1 H2O every 4 sols
export const RECYCLER_LOSS_EVERY_SOLS_BRINE = 12; // spec §2.6 / LS-06

// ── Astronaut upkeep (spec §2.2, D-011) ──
export const SLEEP_EN = 1; // spec §2.2 (per astronaut → +4 on the shared pool, D-017)
export const REST_EN = 3; // spec §4 T-REST
export const AIR_REFILL_LS_MIN = 4; // spec §2.2: LS ≥ 4 → AIR refills to 5
export const AIR_LOSS_LOW_LS = 1; // spec §2.2: LS 1–3 → AIR −1 per astronaut (D-017)
export const AIR_LOSS_ZERO_LS = 2; // spec §2.2: LS 0 → AIR −2 per astronaut (D-017)
export const SICK_BAY_SOLS = 2; // spec §2.2
export const CR07_EN_TRIGGER = 4; // D-011 + D-017: crew EN ≤ 4 (≈ 1 per astronaut)

// ── Roles (spec §2.3, D-006) ──
export const FALLBACK_EXTRA_EN = 1; // spec §2.3
export const FALLBACK_SUCCESS = 0.5; // spec §2.3 (costs paid even on failure, D-006)
export const RES_SP_MULTIPLIER = 2; // spec §4, only tasks marked RES ×2 (D-006)

// ── Radiation (spec §2.6, D-007, D-008, D-010) ──
export const TIME_SCALE = 15; // spec §2.6
export const SHIELD_TIER_DIVISOR = 3; // D-007: tier = floor(SH / 3)
export const SHELTER_BONUS = 2; // spec §2.6: sheltered = S − tier − 2
export const BACKGROUND_DOSE_EVERY_SOLS = 6; // spec §2.6
export const BACKGROUND_DOSE_EVERY_SOLS_SHIELDED = 12; // spec §2.6 + D-007 (tier ≥ 2)
export const BACKGROUND_SHIELDED_MIN_TIER = 2; // D-007
export const EVA_DOSE_CHANCE = 0.5; // spec §2.6: +1 with 50 %
export const BADGE = { yellowFrom: 4, redFrom: 7 } as const; // D-010: 0–3 / 4–6 / 7–10
export const SEP_CHANCE_BY_S: Record<number, number> = { 1: 0.2, 2: 0.3, 3: 0.5, 4: 0.7 }; // spec SW-01
export const SW04_SEP_CHANCE_TIER0 = 0.3; // spec SW-04
export const MSV_PER_DOSE_PIP = 60; // spec §2.6 (for the honesty screen, game value)

// ── DONKI → severity (spec §5) ──
/** Flare class → storm strength S. C-class = fun fact only (S 0). */
export function flareSeverity(classType: string): number {
  const letter = classType.charAt(0).toUpperCase();
  const mag = Number.parseFloat(classType.slice(1)) || 0;
  if (letter === 'X') return mag >= 5 ? 4 : 3; // spec §5: X1–X4 → 3, ≥X5 → 4
  if (letter === 'M') return mag >= 5 ? 2 : 1; // spec §5: M1–M4 → 1, M5–M9 → 2
  return 0;
}
export const SEP_MIN_S = 2; // spec §5
export const CME_FAST_KMS = 1000; // spec §5: ≥ 1000 km/s → S+1
export const DONKI_MAX_DAYS_PER_REQUEST = 60; // spec §5, confirmed in Phase 0 (HTTP 400 above)

// ── Sol loop & deck (spec §1.2, §8.3, D-004) ──
export const QUIET_SOL_CHANCE: Record<Tier, number> = { cadet: 0.3, commander: 0.15 }; // spec §1.2
export const MAX_EVENTS_PER_SOL: Record<Tier, number> = { cadet: 1, commander: 2 }; // spec §8.3
export const CARDS_SHOWN: Record<Tier, number> = { cadet: 2, commander: 3 }; // spec §1.1
export const TIMER_EVERY_SOLS = { 'CR-01': 3, 'RS-04': 4 } as const; // spec CR-01, RS-04
export const FOREVER = 9999; // flag/modifier "until cleared" (JSON has no Infinity)
export const RS04_ON_LAST_SOL = true; // D-005
export const CONDITION_COOLDOWN_SOLS = 3; // D-004
export const DISPLACED_WAIT_SOLS = 1; // D-004
/** Morning Briefing priority when several are due. PENDING P-002 */
export const BRIEFING_PRIORITY = ['RS-04', 'FD-01', 'CR-01'] as const; // PENDING P-002
/** Event-slot priority (D-004). */
export const SLOT_PRIORITY = [
  'scripted',
  'donki',
  'MG-02',
  'SW-02',
  'ls-air',
  'chain-condition',
  'quiet',
  'deck',
] as const; // D-004

// ── Missing numbers (D-013) ──
export const EVA_MISHAP_CHANCE = 0.15; // D-013 → CR-05 / CR-06 (50/50)
export const CR04_AFTER_EVA_CHANCE = 0.2; // D-013
export const KIT_EXPERIMENTS = 2; // D-013 (FD-04.c): ME.EN-1 → SP+2, no power
export const KIT_EXPERIMENT_SP = 2; // D-013
export const MG02_LOW_SYSTEM = 2; // D-013: 2+ of {LS, LAB, BAT} ≤ 2
export const MG02_SICKBAY_COUNT = 2; // D-013
export const MG02_COOLDOWN_SOLS = 3; // D-013
export const UNTENDED_CROP_DELAY = 1; // D-013
export const WATERWALL_MAX_SH = 2; // D-013
export const WATERWALL_MIN_H2O = 10; // spec §4 T-WATERWALL
/** Cadet risk words (D-013). Commander sees percentages. */
export const RISK_WORDS: { pct: number; words: string }[] = [
  { pct: 15, words: 'small chance' },
  { pct: 20, words: '1 in 5' },
  { pct: 30, words: '1 in 3' },
  { pct: 40, words: '2 in 5' },
  { pct: 50, words: '1 in 2' },
  { pct: 70, words: 'very likely' },
];

// ── Greenhouse (spec FD-01, §2.6, D-014) ──
export const CROPS = {
  lettuce: { growSols: 2, food: 3 }, // spec FD-01.a
  radish: { growSols: 4, food: 4 }, // spec FD-01.c
  pepper: { growSols: 9, food: 8 }, // spec FD-01.b (Cadet pollination automatic, D-014)
} as const;
export const SHORT_MISSION_SOLS = 10; // D-014 + D-025: missions ≤ 10 sols plant lettuce vs radishes (peppers can't pay off)
export const RES_HARVEST_BONUS = 1; // spec §2.3 / T-GARDEN

// ── Conditions (spec §6) ──
export const COND = {
  LS01_LS_MAX: 4, // LS-01 ⚠️ LS ≤ 4
  LS09_H2O_MAX: 6, // LS-09 ⚠️ H2O ≤ 6
  RS03_LAB_MAX: 3, // RS-03 ⚠️ LAB ≤ 3
  FD06_FOOD_PER_CREW: 3, // FD-06 ⚠️ FOOD ≤ crew × 3
  SW06_DOSE: 4, // SW-06 ⚠️ DOSE ≥ 4
  SW07_DOSE: 7, // SW-07 ⚠️ DOSE ≥ 7
  RS05_LAB_TASKS: 3, // RS-05 after 3 lab tasks
  TLAB_MIN_LAB: 3, // T-LAB needs LAB ≥ 3
} as const;

// ── Endings (spec §2.5) ──
export const END = {
  lsZeroSols: 2, // LS = 0 for 2 sols in a row
  sickBayCount: 3, // 3 astronauts in Sick Bay at once
  unpoweredSols: 2, // battery empty and LS unpowered for 2 sols
} as const;

// ── Missions: lengths and SP goals (spec §8.2, D-010) ──
export const MISSION_LENGTH: Record<MissionId, { cadet?: number; commander?: number }> = {
  M1: { cadet: 8 },
  M2: { cadet: 10, commander: 20 },
  M3: { cadet: 10, commander: 20 },
  M4: { cadet: 10, commander: 20 },
  M5: { cadet: 10, commander: 20 },
  M6: { cadet: 10, commander: 20 },
  M7: { cadet: 10, commander: 20 },
  M8: { commander: 20 },
  M9: { cadet: 10, commander: 20 },
};
export const MISSION_SP_GOAL: Record<MissionId, { cadet?: number; commander?: number }> = {
  M1: { cadet: 6 },
  M2: { cadet: 8, commander: 16 },
  M3: { cadet: 8, commander: 16 },
  M4: { cadet: 6, commander: 14 },
  M5: { cadet: 8, commander: 18 },
  M6: { cadet: 6, commander: 14 },
  M7: { cadet: 6, commander: 14 },
  M8: { commander: 16 },
  M9: { cadet: 8, commander: 18 },
};
export const M3_MAX_DOSE = 6; // D-010

// ── Card / hook values the spec states in prose (spec §7 card cells) ──
export const SW07_NO_EVA_SOLS = 3; // D-017 (SW-07.a "inside jobs only")
export const ROOM_CLOSED_SOLS = 3; // spec LS-04.b, LS-07.b
export const PW02_WIND_CHANCE = 0.2; // spec PW-02.b (20 % per sol)
export const LS03_CANDLE_FIRE = 0.15; // spec LS-03.b
export const FD06_RATION_SOLS = 3; // ASSUMPTION (Phase 2): FD-06.a "while rationing" lasts 3 sols
export const FD06_EXTRA_LIGHT_SOLS = 2; // ASSUMPTION (Phase 2): FD-06.b extra lights for 2 sols
export const CM02_RETRY_SOLS = 2; // ASSUMPTION (Phase 2): CM-02.c antenna problem comes back after 2 sols
export const CR02_MISTAKE_EVENTS = ['LS-03', 'LS-05', 'RS-03'] as const; // ASSUMPTION: CR-02.c "random repair event"
export const MG02_PUSH_SICK_CHANCE = 0.3; // spec MG-02.c
export const SW04_CM02_CHANCE = 0.3; // spec SW-04.b
export const T_SEND_PWR = 2; // ASSUMPTION (Phase 2): T-SEND banks all pending SP for PWR-2 (spec §4 "all = PWR-2")
