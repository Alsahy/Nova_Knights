/** The UI's single engine instance + save/resume in localStorage (try/catch: works without storage). */
import { CONTENT } from '../content';
import { createEngine } from '../engine';
import type { GameState } from '../engine/types';

export const engine = createEngine(CONTENT);
const KEY = 'mba.game.v2';

export function saveGame(s: GameState | null): void {
  try {
    if (s) localStorage.setItem(KEY, JSON.stringify(s));
    else localStorage.removeItem(KEY);
  } catch {
    /* storage blocked: no resume, the game still works */
  }
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as GameState;
    return s.version === 2 && s.phase !== 'ended' ? s : null;
  } catch {
    return null;
  }
}

/** UI-side seed (the engine never uses Math.random). A short code a teacher can read out. */
export function newSeed(): number {
  return Math.floor(Math.random() * 9000) + 1000;
}
