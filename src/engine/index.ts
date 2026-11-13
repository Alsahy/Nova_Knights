/**
 * Public engine API: contract v2 (owned by lane E). Log any change in PROGRESS.md → Contract changes.
 *
 *   const engine = createEngine(CONTENT);          // content from src/content
 *   let s = engine.newGame({ mission: 'M1', tier: 'cadet', seed: 42 });
 *   s = engine.reduce(s, { type: 'CHOOSE', actionId: 'FD-04.a' });   // pure: returns a new state
 *   engine.shownCards(s) · engine.availableTasks(s, 'ENG') · engine.hud(s) · engine.powerBudget(s)
 *   engine.nightLog(s) · engine.debrief(s) · engine.peek(s)
 *   doseBadge(dose) · shieldTier(sh) · riskWords(p)
 */
import { debrief } from './debrief';
import { timeoutChoice, timeoutId } from './events';
import { newGame, reduce } from './reduce';
import { availableTasks, hud, nightLog, peek, powerBudget, shownCards } from './selectors';
import type { AstronautId, Command, Content, GameState, NewGameOptions } from './types';

export type * from './types';
export { createRng, seedFromString } from './rng';
export { doseBadge, shieldTier } from './radiation';
export { riskWords } from './selectors';
export { CALL_SIGNS } from './reduce';
export { timeoutId };
export { stateValue } from './value';

export function createEngine(content: Content) {
  return {
    content,
    newGame: (opts: NewGameOptions): GameState => newGame(content, opts),
    reduce: (s: GameState, cmd: Command): GameState => reduce(content, s, cmd),
    shownCards: (s: GameState) => shownCards(s, content),
    availableTasks: (s: GameState, astronaut: AstronautId) => availableTasks(s, content, astronaut),
    hud: (s: GameState) => hud(s, content),
    powerBudget: (s: GameState) => powerBudget(s, content),
    nightLog,
    debrief: (s: GameState) => debrief(s, content),
    peek,
    /** D-027: the card the crew does on its own if the timer runs out. */
    timeoutChoice: (s: GameState) => timeoutChoice(s, content),
  };
}

export type Engine = ReturnType<typeof createEngine>;
