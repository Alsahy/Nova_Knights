import { CONTENT } from '../../src/content';
import { createEngine } from '../../src/engine';
import type { GameState } from '../../src/engine/types';

export const E = createEngine(CONTENT);

/** A fresh M1 Cadet game at sol 1 (D-026: no setup choice; the greenhouse starts with lettuce). */
export function atSol1(seed = 7): GameState {
  return E.newGame({ mission: 'M1', tier: 'cadet', seed });
}
