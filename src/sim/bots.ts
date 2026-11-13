/** Bots for the simulator (Phase 2: random + a simple balanced bot; Phase 5 adds max-shield / max-science). */
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

export function randomBot(seed: number): Bot {
  const r: RngState = createRng(seed ^ 0x9e3779b9);
  return {
    name: 'random',
    choose: (_s, cards) => {
      const ok = cards.filter((c) => c.affordable);
      return (ok.length ? ok : cards)[int(r, (ok.length ? ok : cards).length)]!.id;
    },
    plan: (_s, _a, options) => {
      const ok = options.filter((o) => o.allowed);
      if (!ok.length || next(r) < 0.1) return null;
      return ok[int(r, ok.length)]!.taskId;
    },
  };
}

const value = (c: CardView): number => {
  let v = 0;
  for (const ch of [...c.costs, ...c.later]) {
    const w =
      ch.icon === 'DOSE'
        ? 3
        : ch.icon === 'LS'
          ? 2
          : ch.icon === 'EN' || ch.icon === 'AIR'
            ? 0.25
            : ch.icon === 'LOST'
              ? 0.8
              : 1;
    v -= Math.abs(ch.amount ?? 1) * w * (ch.tone === 'risk' ? (c.risk?.pct ?? 50) / 100 : 1);
  }
  for (const ch of c.effects) {
    const w = ch.icon === 'SP' ? 1.5 : ch.icon === 'LS' ? 1.5 : ch.icon === 'EN' ? 0.25 : 1;
    v += Math.abs(ch.amount ?? 1) * w;
  }
  return v;
};

export function balancedBot(): Bot {
  return {
    name: 'balanced',
    choose: (_s, cards) => {
      const ok = cards.filter((c) => c.affordable);
      const pool = ok.length ? ok : cards;
      return pool.reduce((best, c) => (value(c) > value(best) ? c : best)).id;
    },
    plan: (s, a, options) => {
      const ok = new Set(options.filter((o) => o.allowed && !o.fallback).map((o) => o.taskId));
      const want: string[] = [];
      if (s.crew.EN <= 8) want.push('T-REST');
      if (a === 'MED') want.push('T-TREAT');
      if (s.sp.pending >= 3 || (s.sol >= s.lastSol - 1 && s.sp.pending > 0)) want.push('T-SEND');
      if (a === 'ENG' && s.systems.LS <= 6) want.push('T-MAINT-LS');
      if (a === 'ENG' && s.systems.LAB <= 4) want.push('T-MAINT-LAB');
      if (a === 'RES') want.push('T-LAB', 'T-KIT');
      if (a === 'MGR') want.push('T-GARDEN', 'T-KIT', 'T-LAB');
      if (a === 'ENG') want.push('T-PANELS', 'T-LAB');
      if (a === 'MED') want.push('T-KIT', 'T-LAB', 'T-REST');
      want.push('T-REST');
      return want.find((t) => ok.has(t)) ?? null;
    },
  };
}

/** Play until the game ends. Returns the final state. */
export function playGame(e: Engine, s0: GameState, bot: Bot, maxSteps = 2000): GameState {
  let s = s0;
  for (let i = 0; i < maxSteps && s.phase !== 'ended'; i++) {
    let cmd: Command;
    if (s.pending) cmd = { type: 'CHOOSE', actionId: bot.choose(s, e.shownCards(s), e) };
    else if (s.phase === 'morning' || s.phase === 'night') cmd = { type: 'CONTINUE' };
    else if (s.phase === 'power') cmd = { type: 'CONFIRM_POWER' };
    else if (s.phase === 'tasks') {
      for (const a of s.astronauts) {
        if (a.plannedTask) continue;
        const t = bot.plan(s, a.id, e.availableTasks(s, a.id), e);
        if (t) s = e.reduce(s, { type: 'PLAN_TASK', astronaut: a.id, taskId: t });
      }
      cmd = { type: 'CONFIRM_TASKS' };
    } else throw new Error(`bot stuck in phase ${s.phase}`);
    const next = e.reduce(s, cmd);
    if (JSON.stringify(next) === JSON.stringify(s))
      throw new Error(`no progress at sol ${s.sol} phase ${s.phase} cmd ${JSON.stringify(cmd)}`);
    s = next;
  }
  if (s.phase !== 'ended') throw new Error('game did not end');
  return s;
}
