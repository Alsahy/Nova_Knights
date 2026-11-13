/**
 * Public engine API: contract v1 (owned by lane E). Log any change in PROGRESS.md → Contract changes.
 *
 *   newGame(opts)        → GameState
 *   reduce(state, cmd)   → new GameState (never mutates its input)
 *   select*(state)       → view data for the UI
 *
 * v1 status: newGame / reduce / selectCards / selectTaskOptions are STUBS over a fixture state
 * (src/engine/fixture.ts) so the UI can integrate now. Phase 2 replaces them; signatures stay.
 * The small pure helpers (shieldTier, badgeColour, riskWords, selectMeters) are already real.
 */
import { BADGE, MAX_EVENTS_PER_SOL, RISK_WORDS, SHIELD_TIER_DIVISOR } from './config';
import { fixtureState } from './fixture';
import type {
  BadgeColour,
  CardView,
  Command,
  GameState,
  NewGameOptions,
  PowerBudget,
  TaskOption,
  LogEntry,
} from './types';

export type * from './types';
export { createRng, seedFromString } from './rng';

/** Start a new game. Same options + seed → same game. (STUB: returns the fixture.) */
export function newGame(opts: NewGameOptions): GameState {
  const s = fixtureState(opts);
  return { ...s, phase: 'morning', pending: null };
}

function clone(state: GameState): GameState {
  return JSON.parse(JSON.stringify(state)) as GameState;
}

/**
 * Apply one command. (STUB: only walks the phase loop so the UI can click through;
 * no rules are applied yet.)
 */
export function reduce(state: GameState, cmd: Command): GameState {
  const s = clone(state);
  if (s.phase === 'ended') return s;
  switch (cmd.type) {
    case 'CONTINUE':
      if (s.phase === 'morning') s.phase = 'power';
      else if (s.phase === 'night') {
        if (s.sol >= s.lastSol) {
          s.phase = 'ended';
          s.ending = { kind: 'safe-return', sol: s.sol, reason: 'end.stub' };
        } else {
          s.sol += 1;
          s.phase = 'morning';
        }
      }
      return s;
    case 'SET_POWER':
      s.power.plugged[cmd.system] = cmd.on;
      return s;
    case 'CONFIRM_POWER':
      if (s.phase === 'power') s.phase = 'tasks';
      return s;
    case 'PLAN_TASK': {
      const a = s.astronauts.find((x) => x.id === cmd.astronaut);
      if (a) a.plannedTask = cmd.taskId;
      return s;
    }
    case 'CONFIRM_TASKS':
      if (s.phase === 'tasks') {
        s.phase = 'event';
        s.pending = fixtureState({ mission: s.mission, tier: s.tier, seed: s.seed }).pending;
      }
      return s;
    case 'CHOOSE':
      if (s.pending) {
        s.choices.push({
          sol: s.sol,
          eventId: s.pending.eventId,
          actionId: cmd.actionId,
          consequences: [],
          weight: 1,
        });
        s.log.push({ sol: s.sol, kind: 'choice', key: 'log.choice', params: { id: cmd.actionId } });
        s.pending = null;
        s.phase = 'night';
      }
      return s;
    case 'END_MISSION':
      s.phase = 'ended';
      s.ending = { kind: 'safe-return', sol: s.sol, reason: 'end.chose-home' };
      return s;
  }
}

// ───────────────────────── selectors ─────────────────────────

/** D-007: tier = floor(SH / 3). */
export function shieldTier(sh: number): number {
  return Math.floor(Math.max(0, sh) / SHIELD_TIER_DIVISOR);
}

/** D-010: green 0–3 · yellow 4–6 · red 7–10. */
export function badgeColour(dose: number): BadgeColour {
  if (dose >= BADGE.redFrom) return 'red';
  if (dose >= BADGE.yellowFrom) return 'yellow';
  return 'green';
}

/** D-013: Cadet risk words for a probability (0–1); nearest listed value. */
export function riskWords(p: number): string {
  const pct = Math.round(p * 100);
  let best = RISK_WORDS[0]!;
  for (const r of RISK_WORDS) if (Math.abs(r.pct - pct) < Math.abs(best.pct - pct)) best = r;
  return best.words;
}

export interface Meters {
  LS: number;
  SH: number;
  shieldTier: number;
  PWR: number; // today's supply
  BAT: number;
  LAB: number;
  sp: { pending: number; banked: number; goal: number };
  sol: number;
  lastSol: number;
}

export function selectMeters(s: GameState): Meters {
  return {
    LS: s.systems.LS,
    SH: s.systems.SH,
    shieldTier: shieldTier(s.systems.SH),
    PWR: s.power.supply,
    BAT: s.systems.BAT,
    LAB: s.systems.LAB,
    sp: { ...s.sp },
    sol: s.sol,
    lastSol: s.lastSol,
  };
}

export function selectPowerBudget(s: GameState): PowerBudget {
  return s.power;
}

export function selectLog(s: GameState, sol = s.sol): LogEntry[] {
  return s.log.filter((e) => e.sol === sol);
}

export function maxEventsPerSol(s: GameState): number {
  return MAX_EVENTS_PER_SOL[s.tier];
}

/** Cards for state.pending, costs first. (STUB: fixed LS-01 cards from the spec.) */
export function selectCards(s: GameState): CardView[] {
  if (!s.pending) return [];
  const all: CardView[] = [
    {
      id: 'LS-01.a',
      title: 'Fix the CO₂ scrubber',
      whoLabel: 'Engineer',
      star: true,
      costs: [
        { icon: 'EN', text: '−2', tone: 'cost' },
        { icon: 'PARTS', text: '−1', tone: 'cost' },
      ],
      effects: [{ icon: 'LS', text: '+3', tone: 'effect' }],
      later: [],
      lesson: 'Fix the cause, not the symptom',
      affordable: true,
    },
    {
      id: 'LS-01.b',
      title: 'Use spare filter cans',
      whoLabel: 'Anyone',
      star: true,
      costs: [{ icon: 'PARTS', text: '−1', tone: 'cost' }],
      effects: [{ icon: 'LS', text: '+1 for 2 sols', tone: 'effect' }],
      later: [{ icon: 'TIME', text: 'in 2 sols: problem returns if not fixed', tone: 'later' }],
      lesson: 'Spares buy time',
      affordable: true,
    },
    {
      id: 'LS-01.c',
      title: 'Everyone rests, breathes less',
      whoLabel: 'Manager',
      star: false,
      costs: [{ icon: 'LOST', text: 'all tasks today', tone: 'cost' }],
      effects: [{ icon: 'EN', text: '+1 everyone', tone: 'effect' }],
      later: [{ icon: 'LS', text: '−1 anyway', tone: 'later' }],
      lesson: 'Less activity = less CO₂',
      affordable: true,
    },
  ];
  return all.filter((c) => s.pending!.offered.includes(c.id));
}

/** Task choices per astronaut. (STUB: two tasks each.) */
export function selectTaskOptions(s: GameState): TaskOption[] {
  return s.astronauts.flatMap((a) => [
    {
      taskId: 'T-REST',
      title: 'Rest',
      astronaut: a.id,
      allowed: a.sickBaySols === 0,
      fallback: false,
      costs: [{ icon: 'LOST', text: "today's task", tone: 'cost' }],
      effects: [{ icon: 'EN', text: '+3', tone: 'effect' }],
    },
    {
      taskId: 'T-LAB',
      title: 'Lab experiment',
      astronaut: a.id,
      allowed: a.sickBaySols === 0 && s.systems.LAB >= 3,
      fallback: false,
      costs: [
        { icon: 'EN', text: '−2', tone: 'cost' },
        { icon: 'PWR', text: '−1', tone: 'cost' },
      ],
      effects: [{ icon: 'SP', text: a.role === 'RES' ? '+2' : '+1', tone: 'effect' }],
    },
  ]);
}
