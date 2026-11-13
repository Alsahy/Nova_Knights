/**
 * Contract v1 fixture: a plausible M1 Cadet state on sol 1, waiting at the event slot (LS-01 Stuffy Air).
 * Used by the index.ts stubs so the UI can integrate before the real engine lands (Phase 2).
 * Values follow spec §1.3 (Cadet start) and D-002 (power).
 */
import { CARDS_SHOWN, MISSION_LENGTH, MISSION_SP_GOAL, START, START_STATS } from './config';
import { createRng } from './rng';
import type { Astronaut, GameState, NewGameOptions, Role } from './types';

// Call-signs are placeholders until lane P picks the final 4 gender-neutral call-signs (task 0.8).
const CALL_SIGNS: Record<Role, string> = { MGR: 'Nova', ENG: 'Bolt', MED: 'Echo', RES: 'Sky' };

function astronaut(role: Role, startDose: number): Astronaut {
  return {
    id: role,
    role,
    callSign: CALL_SIGNS[role],
    FUL: START_STATS.FUL,
    HYD: START_STATS.HYD,
    AIR: START_STATS.AIR,
    EN: START_STATS.EN,
    ENMAX: 5,
    DOSE: startDose,
    sickBaySols: 0,
    indoorOnly: false,
    plannedTask: null,
  };
}

export function fixtureState(
  opts: NewGameOptions = { mission: 'M1', tier: 'cadet', seed: 4821 },
): GameState {
  const tier = opts.tier;
  const start = START[tier];
  const seed = (opts.seed ?? 4821) >>> 0;
  const lastSol = MISSION_LENGTH[opts.mission][tier] ?? MISSION_LENGTH[opts.mission].cadet ?? 10;
  const goal = MISSION_SP_GOAL[opts.mission][tier] ?? 6;
  const roles: Role[] = ['MGR', 'ENG', 'MED', 'RES'];
  return {
    version: 1,
    seed,
    rng: createRng(seed),
    mission: opts.mission,
    tier,
    sol: 1,
    lastSol,
    phase: 'event',
    systems: { ...start.systems, BATMAX: 10 },
    supplies: { ...start.supplies },
    sp: { pending: 1, banked: 0, goal },
    astronauts: roles.map((r) => astronaut(r, start.startDose)),
    dust: { stacks: 0, multiplier: 1, nextStackSol: 5 },
    power: {
      solar: 4,
      reactor: 2,
      battery: start.systems.BAT,
      supply: 6,
      budget: 6 + start.systems.BAT,
      need: { LS: 2, recycler: 1, greenhouse: 1, heaters: 0, tasks: 1 },
      totalNeed: 5,
      shortfall: 0,
      plugged: { LS: true, recycler: true, greenhouse: true },
    },
    crop: { kind: 'lettuce', plantedSol: 0, readySol: 2, tended: false, tendedByRes: false },
    flags: {},
    modifiers: [],
    scheduled: [],
    deck: ['CR-02', 'RS-01', 'PW-01', 'LS-05', 'MG-03', 'RS-06', 'PW-07', 'LS-03'],
    played: ['FD-04', 'FD-01'],
    cooldowns: {},
    waiting: [],
    pending: {
      slot: 'event',
      eventId: 'LS-01',
      offered: ['LS-01.a', 'LS-01.b', 'LS-01.c'].slice(0, CARDS_SHOWN[tier]),
    },
    log: [
      { sol: 0, kind: 'choice', key: 'log.setup.cargo', params: { crate: 'food' } },
      { sol: 0, kind: 'choice', key: 'log.setup.plant', params: { crop: 'lettuce' } },
      { sol: 1, kind: 'event', key: 'log.event', params: { id: 'LS-01' } },
    ],
    choices: [],
    counters: { lsZeroSols: 0, lsUnpoweredSols: 0, labTasks: 0 },
    ending: null,
  };
}
