import { CONTENT } from '../../src/content';
import { createEngine } from '../../src/engine';
import type { GameState } from '../../src/engine/types';

export const E = createEngine(CONTENT);

/** A fresh M1 Cadet game at sol 1, after the setup choices (food crate, lettuce). */
export function atSol1(seed = 7): GameState {
  let s = E.newGame({ mission: 'M1', tier: 'cadet', seed });
  s = E.reduce(s, { type: 'CHOOSE', actionId: 'FD-04.a' });
  s = E.reduce(s, { type: 'CHOOSE', actionId: 'FD-01.a' });
  return s;
}
