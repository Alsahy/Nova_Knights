/** The phase machine: setup → morning → power → tasks → event → night → (next sol | ended). */
import {
  BAT_MAX,
  DUST_STACK_EVERY_SOLS,
  LAB_WEAR_EVERY_SOLS,
  LS_WEAR_EVERY_SOLS,
  BACKGROUND_DOSE_EVERY_SOLS,
  MISSION_LENGTH,
  MISSION_SP_GOAL,
  PW02_WIND_CHANCE,
  RECYCLER_LOSS_EVERY_SOLS,
  START,
  START_CREW,
  SURVIVAL_START,
} from './config';
import { buildDeck, selectBriefing, selectEvent } from './deck';
import { plantCrop } from './hooks';
import { offerEvent, resolveChoice } from './events';
import { runNight } from './night';
import { computePower } from './power';
import { chance, createRng, shuffle } from './rng';
import { hasFlag, log, setFlag } from './state';
import { checkTask } from './tasks';
import type {
  Astronaut,
  Command,
  Content,
  GameState,
  Mission,
  NewGameOptions,
  Role,
} from './types';

/** Placeholder call-signs until lane P confirms them (PROGRESS → Requests). */
export const CALL_SIGNS: Record<Role, string> = {
  MGR: 'Nova',
  ENG: 'Bolt',
  MED: 'Echo',
  RES: 'Sky',
};

export function missionOf(content: Content, s: Pick<GameState, 'mission'>): Mission {
  const m = content.missions[s.mission];
  if (!m) throw new Error(`mission ${s.mission} is not available yet`);
  return m;
}

export function newGame(content: Content, opts: NewGameOptions): GameState {
  const start = START[opts.tier];
  const lastSol = MISSION_LENGTH[opts.mission][opts.tier];
  const goal = MISSION_SP_GOAL[opts.mission][opts.tier];
  if (lastSol === undefined || goal === undefined)
    throw new Error(`${opts.mission} has no ${opts.tier} version`);
  const mission = content.missions[opts.mission];
  if (!mission) throw new Error(`mission ${opts.mission} is not available yet`);
  const astronauts: Astronaut[] = (['MGR', 'ENG', 'MED', 'RES'] as Role[]).map((r) => ({
    id: r,
    role: r,
    callSign: CALL_SIGNS[r],
    sickBaySols: 0,
    busyUntilSol: 0,
    plannedTask: null,
  }));
  const s: GameState = {
    version: 2,
    seed: opts.seed >>> 0,
    rng: createRng(opts.seed),
    mission: opts.mission,
    tier: opts.tier,
    sol: 0,
    lastSol,
    phase: 'setup',
    systems: { ...start.systems, BATMAX: BAT_MAX },
    supplies: { ...start.supplies },
    crew: { ...START_CREW, DOSE: start.startDose, indoorOnly: false },
    sp: { pending: 0, banked: 0, goal },
    astronauts,
    dust: {
      stacks: 0,
      multiplier: 1,
      nextStackSol: mission.dustEverySols ?? DUST_STACK_EVERY_SOLS,
      addedToday: false,
    },
    power: {
      solar: 0,
      reactor: 0,
      bonus: 0,
      supply: 0,
      battery: 0,
      batteryUsable: true,
      need: { LS: 0, recycler: 0, greenhouse: 0, extra: 0 },
      totalNeed: 0,
      spent: 0,
      available: 0,
      shortfall: 0,
      plugged: { LS: true, recycler: true, greenhouse: true },
    },
    crop: null,
    lastCrop: null,
    flags: {},
    modifiers: [],
    scheduled: [],
    queue: [],
    setupQueue: [
      ...mission.setup,
      ...(opts.tier === 'commander' && mission.events.includes('MG-04') ? ['MG-04'] : []),
    ], // spec §8.3 + D-018
    deck: [],
    played: [],
    cooldowns: {},
    timers: {
      lsWearSol: LS_WEAR_EVERY_SOLS,
      labWearSol: LAB_WEAR_EVERY_SOLS,
      bgDoseSol: BACKGROUND_DOSE_EVERY_SOLS,
      recyclerLossSol: RECYCLER_LOSS_EVERY_SOLS,
      rs04Pending: false,
    },
    counters: {
      labTasks: 0,
      lsZeroSols: 0,
      lsUnpoweredSols: 0,
      evaToday: 0,
      evaYesterday: 0,
      waterWalls: 0,
      kitLeft: 0,
    },
    pending: null,
    eventsToday: 0,
    nextId: 1,
    log: [],
    choices: [],
    ending: null,
  };
  setFlag(s, 'reserve'); // FD-06.c: the emergency food box exists at the start
  for (const u of mission.unlocks ?? []) setFlag(s, `unlock:${u}`); // D-043
  if (mission.startCrop) plantCrop(s, mission.startCrop); // D-026
  s.deck = buildDeck(s, content, mission);
  if (mission.endless) Object.assign(s.supplies, SURVIVAL_START); // D-060
  if (mission.endless) s.deck = shuffle(s.rng, [...s.deck, ...mission.endless.extra]); // D-050: storms from day one
  log(s, 'info', 'log.newGame', { mission: opts.mission, tier: opts.tier, seed: s.seed });
  nextSetup(s, content);
  return s;
}

function nextSetup(s: GameState, content: Content): void {
  const id = s.setupQueue.shift();
  if (id && content.events[id]) offerEvent(s, content, id, 'setup');
  else startSol(s, content, 1);
}

function startSol(s: GameState, content: Content, sol: number): void {
  const mission = missionOf(content, s);
  s.sol = sol;
  s.phase = 'morning';
  s.eventsToday = 0;
  s.power.spent = 0;
  s.power.bonus = 0;
  s.power.plugged = { LS: true, recycler: true, greenhouse: true };
  log(s, 'info', 'log.solStart', { sol });
  // Dust stacks are added automatically and shown in the morning report (D-004).
  s.dust.addedToday = false;
  if (sol >= s.dust.nextStackSol) {
    s.dust.stacks += 1;
    s.dust.addedToday = true;
    s.dust.nextStackSol = sol + (mission.dustEverySols ?? DUST_STACK_EVERY_SOLS);
    log(s, 'power', 'log.dustStack', { stacks: s.dust.stacks });
  }
  if (hasFlag(s, 'waitWind') && chance(s.rng, PW02_WIND_CHANCE)) {
    s.queue.push({ eventId: 'PW-03', dueSol: sol, sinceSol: sol, source: 'PW-02.b' });
  }
  computePower(s, content);
  const briefing = selectBriefing(s, content, mission);
  if (briefing) offerEvent(s, content, briefing.eventId, 'briefing', briefing.opts);
}

function enterPower(s: GameState, content: Content): void {
  s.phase = 'power';
  const b = computePower(s, content);
  if (b.shortfall > 0 && !s.pending) offerEvent(s, content, 'PW-08', 'shortage'); // D-003
}

function finishSol(s: GameState, content: Content): void {
  if (s.ending) {
    s.phase = 'ended';
    return;
  }
  runNight(s, content, missionOf(content, s));
  s.phase = s.ending ? 'ended' : 'night';
}

/** Apply one command to a COPY of the state. Illegal commands return an unchanged copy. */
export function reduce(content: Content, state: GameState, cmd: Command): GameState {
  const s = JSON.parse(JSON.stringify(state)) as GameState;
  if (s.phase === 'ended') return s;
  switch (cmd.type) {
    case 'CHOOSE': {
      if (!s.pending) return s;
      const slot = s.pending.slot;
      if (!resolveChoice(s, content, cmd.actionId)) return s;
      if (s.ending) {
        s.phase = 'ended';
        log(s, 'ending', s.ending.reason, { kind: s.ending.kind });
        return s;
      }
      if (slot === 'setup') nextSetup(s, content);
      else if (slot === 'shortage') {
        const b = computePower(s, content);
        if (b.shortfall > 0) offerEvent(s, content, 'PW-08', 'shortage');
      } else if (slot === 'event') {
        s.eventsToday += 1;
        if (missionOf(content, s).eventFirst)
          s.phase = 'tasks'; // D-027: surprise → jobs → night
        else finishSol(s, content);
      }
      return s;
    }
    case 'CONTINUE':
      if (s.pending) return s;
      if (s.phase === 'morning') enterPower(s, content);
      else if (s.phase === 'night') startSol(s, content, s.sol + 1);
      return s;
    case 'SET_POWER':
      if (s.phase !== 'power' || s.pending) return s;
      if (cmd.system === 'greenhouse' && cmd.on && !s.crop) return s;
      s.power.plugged[cmd.system] = cmd.on;
      enterPower(s, content);
      return s;
    case 'CONFIRM_POWER':
      if (s.phase !== 'power' || s.pending) return s;
      if (computePower(s, content).shortfall > 0) {
        offerEvent(s, content, 'PW-08', 'shortage');
        return s;
      }
      if (missionOf(content, s).eventFirst) {
        s.phase = 'event'; // D-027: the day starts with its surprise
        const pick = selectEvent(s, content, missionOf(content, s), []);
        if (pick) offerEvent(s, content, pick.eventId, 'event', pick.opts);
        else {
          log(s, 'event', 'log.quietSol');
          s.phase = 'tasks';
        }
        return s;
      }
      s.phase = 'tasks';
      return s;
    case 'PLAN_TASK': {
      if (s.phase !== 'tasks') return s;
      const a = s.astronauts.find((x) => x.id === cmd.astronaut);
      if (!a) return s;
      if (cmd.taskId === null) {
        a.plannedTask = null;
        return s;
      }
      if (!checkTask(s, content, a.id, cmd.taskId).allowed) return s;
      a.plannedTask = cmd.taskId;
      return s;
    }
    case 'CONFIRM_TASKS': {
      if (s.phase !== 'tasks') return s;
      if (missionOf(content, s).eventFirst) {
        finishSol(s, content);
        return s;
      }
      s.phase = 'event';
      const evaIds = new Set(
        Object.values(content.tasks)
          .filter((t) => t.eva)
          .map((t) => t.id),
      );
      const evaPlanned = s.astronauts
        .filter((a) => a.plannedTask && evaIds.has(a.plannedTask))
        .map((a) => a.id);
      s.counters.evaToday = evaPlanned.length;
      const pick = selectEvent(s, content, missionOf(content, s), evaPlanned);
      if (pick) offerEvent(s, content, pick.eventId, 'event', pick.opts);
      else {
        log(s, 'event', 'log.quietSol');
        finishSol(s, content);
      }
      return s;
    }
  }
}
