/**
 * Bots for the balance simulator (PLAN Phase 5): random · maxShield · maxScience (never repairs) ·
 * balanced (danger thresholds) · bestMove (1-step lookahead on a state value).
 * Bots use their OWN seeded RNG, so the game's RNG stream is the same for a given game seed.
 */
import { createRng, int, next } from '../engine/rng';
import type { Engine } from '../engine';
import type {
  AstronautId,
  CardView,
  Command,
  GameState,
  RngState,
  TaskOption,
} from '../engine/types';

export interface Bot {
  name: string;
  choose(s: GameState, cards: CardView[], e: Engine): string;
  plan(s: GameState, a: AstronautId, options: TaskOption[], e: Engine): string | null;
}

const ok = (cards: CardView[]) => {
  const a = cards.filter((c) => c.affordable);
  return a.length ? a : cards;
};

/** Sum of a card's chip amounts for some icons (costs and gains). */
function score(c: CardView, weights: Partial<Record<string, number>>, riskWeight = 0.5): number {
  let v = 0;
  for (const ch of [...c.costs, ...c.effects, ...c.later]) {
    const w = weights[ch.icon] ?? 0;
    const amt = ch.amount ?? (ch.icon === 'DOSE' ? 1 : 0);
    const sign = ch.icon === 'DOSE' && ch.amount === undefined ? 1 : 1;
    v += w * amt * sign * (ch.tone === 'risk' ? riskWeight : 1);
  }
  return v;
}

const pick = (options: TaskOption[], order: string[]): string | null => {
  const allowed = new Set(options.filter((o) => o.allowed).map((o) => o.taskId));
  return order.find((t) => allowed.has(t)) ?? null;
};

export function randomBot(seed: number): Bot {
  const r: RngState = createRng(seed ^ 0x9e3779b9);
  return {
    name: 'random',
    choose: (_s, cards) => {
      const c = ok(cards);
      return c[int(r, c.length)]!.id;
    },
    plan: (_s, _a, options) => {
      const allowed = options.filter((o) => o.allowed);
      if (!allowed.length || next(r) < 0.05) return null;
      return allowed[int(r, allowed.length)]!.taskId;
    },
  };
}

export function maxShieldBot(): Bot {
  const w = { SH: 3, DOSE: -4, LS: 1, EN: 0.1, SP: 0.2, LOST: 0 };
  return {
    name: 'maxShield',
    choose: (_s, cards) => ok(cards).reduce((b, c) => (score(c, w) > score(b, w) ? c : b)).id,
    plan: (s, a, options) => {
      if (s.crew.EN <= 6) return pick(options, ['T-REST']);
      const order: Record<AstronautId, string[]> = {
        MGR: ['T-SEND', 'T-GARDEN', 'T-REST'],
        ENG: s.crew.DOSE < 5 ? ['T-SHIELD', 'T-MAINT-LS', 'T-REST'] : ['T-MAINT-LS', 'T-REST'],
        MED: ['T-TREAT', 'T-LAB', 'T-GARDEN', 'T-REST'],
        RES: ['T-LAB', 'T-GARDEN', 'T-REST'],
      };
      return pick(options, order[a]);
    },
  };
}

export function maxScienceBot(): Bot {
  const w = { SP: 3, EN: 0.05, DOSE: 0, LS: 0, PARTS: 0 };
  return {
    name: 'maxScience',
    choose: (_s, cards) => ok(cards).reduce((b, c) => (score(c, w) > score(b, w) ? c : b)).id,
    plan: (s, a, options) => {
      const order: Record<AstronautId, string[]> = {
        MGR: [s.sp.pending > 0 ? 'T-SEND' : 'T-PEP', 'T-PEP', 'T-REST'],
        ENG: ['T-PANELS', 'T-REST'], // never repairs
        MED: ['T-LAB', 'T-REST'],
        RES: ['T-EVA-SCI', 'T-LAB', 'T-REST'],
      };
      return pick(options, order[a]);
    },
  };
}

export function balancedBot(): Bot {
  return {
    name: 'balanced',
    choose: (s, cards) => {
      const danger = {
        LS: s.systems.LS <= 4 ? 3 : 1.5,
        DOSE: s.crew.DOSE >= 3 ? -6 : -3,
        SP: 1.5,
        EN: s.crew.EN <= 6 ? 0.6 : 0.25,
      };
      const w = {
        ...danger,
        SH: 1,
        BAT: 0.5,
        PWR: 0.4,
        FOOD: 0.2,
        H2O: 0.3,
        O2T: 0.8,
        PARTS: 0.6,
        AIR: 0.2,
        LOST: -0.3,
      };
      return ok(cards).reduce((b, c) => (score(c, w, 0.4) > score(b, w, 0.4) ? c : b)).id;
    },
    plan: (s, a, options) => {
      if (s.crew.EN <= 6) return pick(options, ['T-REST']);
      const lastSols = s.sol >= s.lastSol - 1;
      const order: Record<AstronautId, string[]> = {
        MGR: [
          s.sp.pending >= 2 || (lastSols && s.sp.pending > 0) ? 'T-SEND' : 'T-GARDEN',
          'T-GARDEN',
          'T-PEP',
          'T-REST',
        ],
        ENG: [
          s.systems.LS <= 5
            ? 'T-MAINT-LS'
            : s.systems.SH < 6 && s.crew.DOSE < 3
              ? 'T-SHIELD'
              : s.dust.stacks > 0
                ? 'T-PANELS'
                : 'T-MAINT-LS',
          'T-MAINT-LS',
          'T-REST',
        ],
        MED: ['T-TREAT', 'T-LAB', 'T-GARDEN', 'T-REST'],
        RES: [s.crew.DOSE >= 3 ? 'T-LAB' : 'T-EVA-SCI', 'T-LAB', 'T-REST'],
      };
      return pick(options, order[a]);
    },
  };
}

/** State value for the 1-step lookahead (higher is better). */
export function value(s: GameState): number {
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
    Object.keys(s.flags).filter((f) => f.startsWith('broken:')).length * 3
  );
}

export function bestMoveBot(): Bot {
  const fallback = balancedBot();
  return {
    name: 'bestMove',
    choose: (s, cards, e) => {
      let best = ok(cards)[0]!;
      let bestV = -Infinity;
      for (const c of ok(cards)) {
        const v = value(e.reduce(s, { type: 'CHOOSE', actionId: c.id }));
        if (v > bestV) {
          bestV = v;
          best = c;
        }
      }
      return best.id;
    },
    plan: fallback.plan,
  };
}

export function makeBot(name: string, seed: number): Bot {
  switch (name) {
    case 'maxShield':
      return maxShieldBot();
    case 'maxScience':
      return maxScienceBot();
    case 'balanced':
      return balancedBot();
    case 'bestMove':
      return bestMoveBot();
    default:
      return randomBot(seed);
  }
}
export const ALL_BOTS = ['random', 'maxShield', 'maxScience', 'balanced', 'bestMove'] as const;

/** Play until the game ends. `onChoose` sees every card choice (for coverage). */
export function playGame(
  e: Engine,
  s0: GameState,
  bot: Bot,
  onChoose?: (s: GameState, id: string) => void,
  maxSteps = 3000,
): GameState {
  let s = s0;
  for (let i = 0; i < maxSteps && s.phase !== 'ended'; i++) {
    let cmd: Command;
    if (s.pending) {
      const id = bot.choose(s, e.shownCards(s), e);
      onChoose?.(s, id);
      cmd = { type: 'CHOOSE', actionId: id };
    } else if (s.phase === 'morning' || s.phase === 'night') cmd = { type: 'CONTINUE' };
    else if (s.phase === 'power') cmd = { type: 'CONFIRM_POWER' };
    else if (s.phase === 'tasks') {
      for (const a of s.astronauts) {
        if (a.plannedTask) continue;
        const t = bot.plan(s, a.id, e.availableTasks(s, a.id), e);
        if (t) s = e.reduce(s, { type: 'PLAN_TASK', astronaut: a.id, taskId: t });
      }
      cmd = { type: 'CONFIRM_TASKS' };
    } else throw new Error(`bot stuck in phase ${s.phase}`);
    const nxt = e.reduce(s, cmd);
    if (JSON.stringify(nxt) === JSON.stringify(s))
      throw new Error(`no progress at sol ${s.sol} phase ${s.phase} cmd ${JSON.stringify(cmd)}`);
    s = nxt;
  }
  if (s.phase !== 'ended') throw new Error('game did not end');
  return s;
}
