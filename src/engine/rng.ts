/**
 * Seeded PRNG (mulberry32). The state lives in GameState.rng, so the same seed gives the same game.
 * Functions mutate the RngState they are given: `reduce` always works on a fresh copy of the state.
 */
import type { RngState } from './types';

export function createRng(seed: number): RngState {
  return { s: seed >>> 0 };
}

/** Float in [0, 1). */
export function next(r: RngState): number {
  r.s = (r.s + 0x6d2b79f5) >>> 0;
  let t = r.s;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Integer in [0, n). */
export function int(r: RngState, n: number): number {
  if (!Number.isInteger(n) || n <= 0)
    throw new RangeError(`int(n) needs a positive integer, got ${n}`);
  return Math.floor(next(r) * n);
}

/** True with probability p (0–1). */
export function chance(r: RngState, p: number): boolean {
  if (p <= 0) return false;
  if (p >= 1) return true;
  return next(r) < p;
}

/** Fisher–Yates; returns a new array. */
export function shuffle<T>(r: RngState, arr: readonly T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = int(r, i + 1);
    const a = out[i] as T;
    out[i] = out[j] as T;
    out[j] = a;
  }
  return out;
}

/** Turn a typed seed code (e.g. "MARS-4821") into a uint32 seed (cyrb53-style hash, low 32 bits). */
export function seedFromString(text: string): number {
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c6ce57 ^ 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  return h1 >>> 0;
}
