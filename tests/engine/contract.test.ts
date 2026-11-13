import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  badgeColour,
  newGame,
  reduce,
  riskWords,
  selectCards,
  selectMeters,
  selectTaskOptions,
  shieldTier,
} from '../../src/engine';
import { START } from '../../src/engine/config';

describe('contract v1', () => {
  it('newGame is deterministic and JSON-serialisable', () => {
    const a = newGame({ mission: 'M1', tier: 'cadet', seed: 42 });
    const b = newGame({ mission: 'M1', tier: 'cadet', seed: 42 });
    expect(a).toEqual(b);
    expect(JSON.parse(JSON.stringify(a))).toEqual(a);
  });

  it('starts with spec §1.3 Cadet values', () => {
    const s = newGame({ mission: 'M1', tier: 'cadet', seed: 1 });
    expect(s.systems.LS).toBe(START.cadet.systems.LS);
    expect(s.supplies.FOOD).toBe(40);
    expect(s.astronauts).toHaveLength(4);
    expect(s.lastSol).toBe(8);
    expect(s.sp.goal).toBe(6);
  });

  it('reduce never mutates its input', () => {
    const s = newGame({ mission: 'M1', tier: 'cadet', seed: 1 });
    const before = JSON.stringify(s);
    const s2 = reduce(s, { type: 'CONTINUE' });
    expect(JSON.stringify(s)).toBe(before);
    expect(s2).not.toBe(s);
  });

  it('the stub loop walks morning → power → tasks → event → night → next sol', () => {
    let s = newGame({ mission: 'M1', tier: 'cadet', seed: 1 });
    expect(s.phase).toBe('morning');
    s = reduce(s, { type: 'CONTINUE' });
    expect(s.phase).toBe('power');
    s = reduce(s, { type: 'CONFIRM_POWER' });
    expect(s.phase).toBe('tasks');
    s = reduce(s, { type: 'CONFIRM_TASKS' });
    expect(s.phase).toBe('event');
    const cards = selectCards(s);
    expect(cards).toHaveLength(2); // Cadet sees 2 (spec §1.1)
    s = reduce(s, { type: 'CHOOSE', actionId: cards[0]!.id });
    expect(s.phase).toBe('night');
    s = reduce(s, { type: 'CONTINUE' });
    expect(s.sol).toBe(2);
    expect(selectTaskOptions(s).length).toBeGreaterThan(0);
    expect(selectMeters(s).sp.goal).toBe(6);
  });

  it('every card view lists at least one cost (no free lunch)', () => {
    let s = newGame({ mission: 'M1', tier: 'commander', seed: 1 });
    s = reduce(reduce(reduce(s, { type: 'CONTINUE' }), { type: 'CONFIRM_POWER' }), {
      type: 'CONFIRM_TASKS',
    });
    for (const c of selectCards(s)) expect(c.costs.length + c.later.length).toBeGreaterThan(0);
  });
});

describe('approved rules already in v1', () => {
  it('D-007 shield tier = floor(SH/3)', () => {
    expect([0, 2, 3, 5, 6, 8, 9, 10].map(shieldTier)).toEqual([0, 0, 1, 1, 2, 2, 3, 3]);
  });
  it('D-010 badge colours', () => {
    expect([0, 3, 4, 6, 7, 10].map(badgeColour)).toEqual([
      'green',
      'green',
      'yellow',
      'yellow',
      'red',
      'red',
    ]);
  });
  it('D-013 risk words', () => {
    expect(riskWords(0.3)).toBe('1 in 3');
    expect(riskWords(0.15)).toBe('small chance');
    expect(riskWords(0.7)).toBe('very likely');
  });
});

describe('engine purity (CLAUDE.md §7)', () => {
  const dir = join(__dirname, '../../src/engine');
  const files = readdirSync(dir).filter((f) => f.endsWith('.ts'));
  it.each(files)('%s uses no Math.random / Date / fetch / DOM', (f) => {
    const src = readFileSync(join(dir, f), 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
    expect(src).not.toMatch(/Math\.random|\bDate\b|\bfetch\(|\bdocument\.|\bwindow\.|localStorage/);
  });
});
