import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { balancedBot, playGame, randomBot } from '../../src/sim/bots';
import { E } from './helpers';

describe('whole games', () => {
  it('50 seeds of M1 Cadet each reach an ending without throwing', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const end = playGame(E, E.newGame({ mission: 'M1', tier: 'cadet', seed }), randomBot(seed));
      expect(end.ending, `seed ${seed}`).not.toBeNull();
      expect(end.sol).toBeLessThanOrEqual(end.lastSol);
    }
  });

  it('20 seeds of M3 Cadet (draft) reach an ending', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const end = playGame(E, E.newGame({ mission: 'M3', tier: 'cadet', seed }), randomBot(seed));
      expect(end.ending).not.toBeNull();
    }
  });

  it('same seed → byte-identical log and state', () => {
    const a = playGame(E, E.newGame({ mission: 'M1', tier: 'cadet', seed: 42 }), randomBot(42));
    const b = playGame(E, E.newGame({ mission: 'M1', tier: 'cadet', seed: 42 }), randomBot(42));
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('different seeds → different event lists (replayability)', () => {
    const lists = new Set<string>();
    for (let seed = 1; seed <= 20; seed++)
      lists.add(
        playGame(E, E.newGame({ mission: 'M1', tier: 'cadet', seed }), balancedBot()).played.join(
          ',',
        ),
      );
    expect(lists.size).toBeGreaterThan(15);
  });

  it('the state stays JSON-serialisable and the debrief has up to 3 big choices', () => {
    const end = playGame(E, E.newGame({ mission: 'M1', tier: 'cadet', seed: 9 }), balancedBot());
    expect(JSON.parse(JSON.stringify(end))).toEqual(end);
    const d = E.debrief(end)!;
    expect(d.top3.length).toBeGreaterThan(0);
    expect(d.top3.length).toBeLessThanOrEqual(3);
    for (const t of d.top3) expect(t.sources.length).toBeGreaterThan(0);
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
