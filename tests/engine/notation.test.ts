import { describe, expect, it } from 'vitest';
import { parseEffects, parseLater, parseRawCell } from '../../src/engine/notation';
import { parseWho, headcount } from '../../src/engine/who';

// Real strings copied from spec §4 / §7 (inside the backticks).
const REAL = [
  'ENG.EN-2; PARTS-1',
  'EVA.EN-1',
  'ENG.EN-1; PWR-1',
  '+FLAG:shelterReady',
  'ENG.EN-2; PICK.EN-1',
  'ENG.EN-1',
  'ENG.EN-2; PICK.EN-2',
  'RES.EN-2',
  'SP+3',
  'BAT+3',
  'PWR-1',
  'p=0.3: → CM-02',
  'RES.EN-1; PWR-1',
  'SP+2',
  'p=0.3: LAB-1',
  'EVA.EN-2; EVA.AIR-2',
  'SP+4',
  'LS+1; SH+1',
  'ALL.EN+2',
  'SH+2',
  'MED.EN-1',
  'DOSE+1',
  'ENG.EN-1; H2O-2',
  'ME.EN-2; ME.AIR-1',
  'ME.EN-1',
  'PWR-2',
  'ENG.EN-1; PARTS-1',
  'LS-2',
  'LS+3',
  'PARTS-1',
  'ALL.EN+1',
  'LS-1',
  'ENG.EN-2; MGR.EN-2',
  'O2T-2',
  'O2T-1',
  'p=0.15: → LS-04',
  'ALL.EN-1; LS-2',
  'H2O-4',
  'ALL.HYD-1',
  'ALL.EN-1',
  'ENG.EN-3; PARTS-1; PWR-1',
  'ENG.EN-2; PICK.EN-1; PARTS-1',
  'ME.EN-3; ME.AIR-2',
  'H2O+8',
  'FOOD+15',
  'PARTS+4; MEDKIT+1',
  'ALL.FUL-1',
  '-FLAG:reserve',
  'FOOD+6',
  '[Name].EN+3',
  '[Name].EN+2',
  '[Name].EN-2',
  'EN+1',
  'EVA.EN-3; EVA.AIR-3',
  'p=0.2: → CR-05',
  'RES.EN-2; RES.AIR-1',
  'PWR-2; ENG.EN-1',
  'RES.EN-3',
  'p=0.5: LAB+2',
  'LAB+4',
  'RES.EN-2; LAB-1; PWR-1',
  'SP+5',
  'EN-2 each',
  'EN-3 each; PWR-2',
  'ALL.ENMAX-1',
  'MGR.EN-1',
  'O2T+1',
  'ALL.DOSE+1',
  'PICK.EN+2',
  'PICK.EN-1',
];

describe('notation (spec §3)', () => {
  it(`parses ${REAL.length} real spec strings without error`, () => {
    expect(REAL.length).toBeGreaterThanOrEqual(40);
    for (const t of REAL) expect(() => parseEffects(t), t).not.toThrow();
  });

  it('parses targets, stats and supplies', () => {
    expect(parseEffects('ENG.EN-2; PARTS-1')).toEqual([
      { kind: 'stat', target: 'ENG', stat: 'EN', delta: -2 },
      { kind: 'supply', key: 'PARTS', delta: -1 },
    ]);
    expect(parseEffects('[Name].EN+3')).toEqual([
      { kind: 'stat', target: 'NAME', stat: 'EN', delta: 3 },
    ]);
    expect(parseEffects('EN-3 each; PWR-2')).toEqual([
      { kind: 'stat', target: 'EACH', stat: 'EN', delta: -3 },
      { kind: 'power', delta: -2 },
    ]);
    expect(parseEffects('ALL.ENMAX-1')).toEqual([
      { kind: 'stat', target: 'ALL', stat: 'ENMAX', delta: -1 },
    ]);
    expect(parseEffects('SP+3; LS+1')).toEqual([
      { kind: 'sp', delta: 3 },
      { kind: 'system', key: 'LS', delta: 1 },
    ]);
  });

  it('parses chances, triggers, flags, LOST and hooks', () => {
    expect(parseEffects('p=0.3: → CM-02')).toEqual([
      { kind: 'chance', p: 0.3, effects: [{ kind: 'trigger', event: 'CM-02' }] },
    ]);
    expect(parseEffects('+FLAG:o2Covered@1; -FLAG:reserve')).toEqual([
      { kind: 'flag', op: 'set', flag: 'o2Covered', sols: 1 },
      { kind: 'flag', op: 'clear', flag: 'reserve' },
    ]);
    expect(parseEffects("LOST: today's EVA tasks")).toEqual([
      { kind: 'lost', what: "today's EVA tasks" },
    ]);
    expect(parseEffects('@labOff(1, 1); EVA_DOSE')).toEqual([
      { kind: 'hook', hook: 'labOff', args: [1, 1] },
      { kind: 'evaDose' },
    ]);
    expect(parseEffects('—')).toEqual([]);
  });

  it('parses later cells (⏳N, chances, ⏳ without N = ⏳1)', () => {
    expect(parseLater('⏳1: ENG.EN-1')).toEqual([
      { inSols: 1, effects: [{ kind: 'stat', target: 'ENG', stat: 'EN', delta: -1 }] },
    ]);
    expect(parseLater('p=0.4: ⏳1: @batMax(7)')).toEqual([
      { inSols: 1, chance: 0.4, effects: [{ kind: 'hook', hook: 'batMax', args: [7] }] },
    ]);
    expect(parseLater('⏳: LS-1')[0]!.inSols).toBe(1); // D-012
    expect(parseLater('LS-1 | ⏳1: LS+3; ENG.EN-1')).toHaveLength(2);
  });

  it('flags prose in raw spec cells', () => {
    expect(parseRawCell('`ENG.EN-2; PICK.EN-2`; EVA dose')).toEqual({
      ok: true,
      prose: '',
      effects: [
        { kind: 'stat', target: 'ENG', stat: 'EN', delta: -2 },
        { kind: 'stat', target: 'PICK', stat: 'EN', delta: -2 },
        { kind: 'evaDose' },
      ],
    });
    expect(parseRawCell('`ENG.EN-1` (put the bags back)').ok).toBe(true);
    expect(parseRawCell('Nobody outside if particles come').ok).toBe(false);
    expect(() => parseEffects('nonsense words')).toThrow();
  });
});

describe('who parsing', () => {
  it.each([
    ['MGR', { roles: ['MGR'], any: 0 }],
    ['ENG + ANY', { roles: ['ENG'], any: 1 }],
    ['RES + ANY (EVA)', { roles: ['RES'], any: 1, eva: true }],
    ['2× ANY (EVA)', { roles: [], any: 2, eva: true }],
    ['ANY + MED', { roles: ['MED'], any: 1 }],
    ['ENG + MGR', { roles: ['ENG', 'MGR'] }],
    ['MGR + RES', { roles: ['MGR', 'RES'] }],
    ['[Name]', { name: true }],
    ['ANY + [Name]', { any: 1, name: true }],
    ['PICK', { pick: true }],
    ['EVA crew', { evaCrew: true }],
    ['ENG or RES', { alt: ['ENG', 'RES'] }],
  ])('%s', (raw, expected) => {
    expect(parseWho(raw)).toMatchObject(expected);
  });
  it('headcount', () => {
    expect(headcount(parseWho('ENG + ANY'))).toBe(2);
    expect(headcount(parseWho('2× ANY (EVA)'))).toBe(2);
  });
});
