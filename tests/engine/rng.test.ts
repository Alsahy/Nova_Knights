import { describe, expect, it } from 'vitest';
import { chance, createRng, int, next, seedFromString, shuffle } from '../../src/engine/rng';

describe('rng (mulberry32)', () => {
  it('same seed → same sequence', () => {
    const a = createRng(4821);
    const b = createRng(4821);
    const sa = Array.from({ length: 50 }, () => next(a));
    const sb = Array.from({ length: 50 }, () => next(b));
    expect(sa).toEqual(sb);
  });

  it('different seeds → different sequences', () => {
    const a = createRng(1);
    const b = createRng(2);
    expect(next(a)).not.toEqual(next(b));
  });

  it('next() stays in [0, 1) and int(n) in [0, n)', () => {
    const r = createRng(7);
    for (let i = 0; i < 5000; i++) {
      const x = next(r);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
      const k = int(r, 6);
      expect(Number.isInteger(k) && k >= 0 && k < 6).toBe(true);
    }
  });

  it('chance(p) is roughly p over many draws', () => {
    const r = createRng(99);
    let hits = 0;
    for (let i = 0; i < 20000; i++) if (chance(r, 0.3)) hits++;
    expect(hits / 20000).toBeGreaterThan(0.28);
    expect(hits / 20000).toBeLessThan(0.32);
    expect(chance(r, 0)).toBe(false);
    expect(chance(r, 1)).toBe(true);
  });

  it('shuffle returns a permutation and does not touch the input', () => {
    const r = createRng(5);
    const input = Object.freeze([1, 2, 3, 4, 5, 6, 7, 8]);
    const out = shuffle(r, input);
    expect([...out].sort()).toEqual([...input]);
    expect(out).not.toBe(input);
  });

  it('state is JSON-serialisable and resumes identically', () => {
    const a = createRng(123);
    next(a);
    const b = JSON.parse(JSON.stringify(a));
    expect(next(a)).toEqual(next(b));
  });

  it('seedFromString is stable and uint32', () => {
    expect(seedFromString('MARS-4821')).toBe(seedFromString('MARS-4821'));
    expect(seedFromString('MARS-4821')).not.toBe(seedFromString('MARS-4822'));
    const s = seedFromString('hello');
    expect(s).toBeGreaterThanOrEqual(0);
    expect(s).toBeLessThan(2 ** 32);
  });

  it('int rejects bad input', () => {
    expect(() => int(createRng(1), 0)).toThrow();
  });
});
