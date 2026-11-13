/**
 * Overrides (lane S): clean notation for spec cells written in prose (spec §7 + §4).
 * Grammar: src/engine/notation.ts. Hooks: src/engine/hooks.ts.
 *
 * Each entry replaces ONLY the cells it names; other cells are auto-parsed from the spec.
 * Covers every card of the 37 MVP events (PLAN §3.2) and all MVP tasks. Shared crew stats (D-017):
 * "ME.EN-1" style costs hit the crew pool.
 */

export interface CardOverride {
  who?: string;
  cost?: string;
  effect?: string;
  later?: string;
  tags?: ('repair' | 'hiddenUnlessLS10')[];
}

export interface EventOverride {
  onStart?: string;
  cards?: Record<string, CardOverride>; // key = letter
}

const REPAIR = { tags: ['repair' as const] }; // P-003 (PENDING): repair tag list

export const EVENT_OVERRIDES: Record<string, EventOverride> = {
  // ── Space weather ──
  'SW-01': {
    cards: {
      a: { cost: "LOST: today's EVA tasks; @cancelEvaTasks", effect: '', later: '' },
      b: { cost: 'EVA.EN-1', effect: '', later: '@evaRace' },
      c: { cost: 'ENG.EN-1; PWR-1', effect: '+FLAG:shelterReady', later: '' },
    },
  },
  'SW-02': {
    cards: {
      a: {
        cost: 'LOST: all tasks today; @cancelAllTasks; @storm(sheltered)',
        effect: '',
        later: '',
      },
      b: {
        cost: 'ENG.EN-2; PICK.EN-1; @storm(wall)',
        effect: '@cancelEvaTasks',
        later: '⏳1: ENG.EN-1',
      },
      c: { cost: '@storm(inside)', effect: '@cancelEvaTasks', later: '' },
    },
  },
  'SW-03': {
    cards: {
      a: { cost: 'ENG.EN-2; PICK.EN-2; EVA_DOSE', effect: 'SH+2', later: '' },
      b: { cost: 'RES.EN-2', effect: 'SP+3', later: '' },
      c: { cost: '@greenhouseOff(warn)', effect: 'BAT+3', later: '@cropDelay(1)' },
    },
  },
  'SW-04': {
    cards: {
      a: { cost: 'LOST: Ask Earth & data today; @commsOff(1)', effect: '', later: '' },
      b: { cost: 'PWR-1', effect: '', later: 'p=0.3: → CM-02' },
      c: { cost: 'RES.EN-1; PWR-1', effect: 'SP+2', later: 'p=0.3: LAB-1' },
    },
  },
  'SW-05': {
    cards: {
      a: { cost: 'EVA.EN-2; EVA.AIR-2; EVA_DOSE', effect: 'SP+4', later: '' },
      b: { cost: 'ENG.EN-2; PARTS-1; EVA_DOSE', effect: 'LS+1; SH+1; @dustClear', later: '' },
      c: { cost: 'LOST: all tasks today; @cancelAllTasks', effect: 'ALL.EN+2', later: '' },
    },
  },
  'SW-07': {
    cards: {
      a: { cost: '@noEva(3)', effect: '', later: '' },
      b: { cost: 'MED.EN-1', effect: '+FLAG:medWatch', later: '' },
      c: { who: 'PICK (EVA)', cost: '', effect: 'SP+3', later: 'DOSE+1' },
    },
  },
  // ── Power ──
  'PW-01': {
    cards: {
      a: { cost: '', effect: '', later: 'p=0.4: ⏳1: @batMax(7)' },
      b: { cost: 'ENG.EN-1; H2O-2', effect: '', later: '' },
      c: { cost: '@batteryUnusable', effect: '', later: '' },
    },
  },
  'PW-02': {
    cards: {
      a: { cost: 'ME.EN-2; ME.AIR-1; EVA_DOSE', effect: '@dustClear', later: '' },
      b: { cost: '@waitWind', effect: '', later: '' },
      c: { cost: 'ENG.EN-1; PWR-1', effect: '@dustHalf', later: '' },
    },
  },
  'PW-03': {
    onStart: '@dustClear',
    cards: {
      a: { cost: 'LOST: bonus science', effect: 'BAT+3', later: '' },
      b: { cost: 'RES.EN-2', effect: 'SP+3', later: '' },
      c: { cost: 'ME.EN-1', effect: '@cropFaster(1)', later: '' },
    },
  },
  'PW-07': {
    cards: {
      a: { cost: 'PWR-2', effect: '', later: '' },
      b: { cost: 'PWR-1; @labOff(1, 1)', effect: '', later: 'p=0.3: @cropDelay(1)' },
      c: { cost: 'ENG.EN-1; PARTS-1; PWR-1', effect: '', later: '' },
    },
  },
  'PW-08': {
    cards: {
      a: { cost: 'LOST: lab science today; @labOff(1)', effect: '@needDelta(-1)', later: '' },
      b: { cost: '@greenhouseOff(1)', effect: '', later: '' },
      c: { cost: '@unplug(LS)', effect: '', later: '' },
    },
  },
  // ── Life support ──
  'LS-01': {
    cards: {
      a: { cost: 'ENG.EN-2; PARTS-1', effect: 'LS+3', later: '', ...REPAIR },
      b: { cost: 'PARTS-1', effect: 'LS+1', later: '⏳2: LS-1; → LS-01' },
      c: { cost: 'LOST: all tasks today; @cancelAllTasks', effect: 'ALL.EN+1', later: 'LS-1' },
    },
  },
  'LS-02': {
    cards: {
      a: { cost: 'ENG.EN-2; MGR.EN-2', effect: 'LS+3', later: '', ...REPAIR },
      b: { cost: 'PWR-1', effect: '', later: 'LS-1 | ⏳1: LS+3; ENG.EN-1' },
      c: { cost: 'O2T-2', effect: 'LS+1', later: '' },
    },
  },
  'LS-03': {
    onStart: '+FLAG:broken:o2maker',
    cards: {
      a: { cost: 'ENG.EN-2; PARTS-1', effect: '-FLAG:broken:o2maker', later: '', ...REPAIR },
      b: { cost: 'O2T-1', effect: '+FLAG:o2Covered@1', later: 'p=0.15: → LS-04' },
      c: { cost: 'O2T-2', effect: '+FLAG:o2Covered@1', later: '' },
    },
  },
  'LS-04': {
    cards: {
      a: { cost: 'ALL.EN-1; LS-2', effect: '', later: '' },
      b: { cost: '@roomClosed(3); LS-1', effect: '', later: '' },
    },
  },
  'LS-05': {
    onStart: '+FLAG:broken:recycler@1',
    cards: {
      a: { cost: 'ENG.EN-1; PARTS-1', effect: '-FLAG:broken:recycler', later: '', ...REPAIR },
      b: { cost: 'H2O-4', effect: '+FLAG:drinkCovered@1', later: '+FLAG:broken:recycler@2' },
      c: { cost: 'ALL.HYD-1', effect: '+FLAG:drinkCovered@1', later: '⏳1: ALL.EN-1' },
    },
  },
  'LS-07': {
    cards: {
      a: { cost: 'ENG.EN-2; PICK.EN-1; PARTS-1', effect: '', later: '', ...REPAIR },
      b: { cost: '@roomClosed(3)', effect: '', later: '' },
      c: { cost: '@leak', effect: '', later: '' },
    },
  },
  'LS-09': {
    cards: {
      a: { cost: 'LOST: drinking water runs out sooner', effect: '', later: '' },
      b: { cost: '@o2Pause', effect: '', later: '' },
      c: {
        cost: 'ME.EN-3; ME.AIR-2; EVA_DOSE',
        effect: '',
        later: '⏳1: H2O+6',
        tags: ['hiddenUnlessLS10'],
      },
    },
  },
  // ── Food ──
  'FD-01': {
    cards: {
      a: { cost: 'ME.EN-1', effect: '@plant(lettuce)', later: '' },
      b: { cost: 'RES.EN-1', effect: '@plant(pepper)', later: '' },
      c: { cost: 'ME.EN-1', effect: '@plant(radish)', later: '' },
    },
  },
  'FD-04': {
    cards: {
      a: { cost: 'LOST: parts & science kit', effect: 'FOOD+15', later: '' },
      b: { cost: 'LOST: food & science kit', effect: 'PARTS+4; MEDKIT+1', later: '' },
      c: { cost: 'LOST: food & parts', effect: '@scienceKit(2)', later: '' },
    },
  },
  'FD-05': {
    cards: {
      a: { cost: 'LOST: stored food', effect: 'ALL.EN+2', later: '' },
      b: { cost: 'LOST: party', effect: 'FOOD+8', later: '' },
      c: { cost: 'LOST: half the food', effect: 'FOOD+4; SP+3', later: '' },
    },
  },
  'FD-06': {
    cards: {
      a: { cost: 'ALL.FUL-1; @rationing(3)', effect: '', later: '' },
      b: { cost: '@extraLights(2)', effect: '@cropFaster(1)', later: '' },
      c: { cost: '@useReserve', effect: 'FOOD+6', later: '' },
    },
  },
  // ── Crew ──
  'CR-01': {
    cards: {
      a: { cost: 'ALL.EN-1; LOST: 1 task; @cancelTasks(1)', effect: '', later: '' },
      b: { cost: '', effect: 'SP+2', later: '⏳3: ALL.ENMAX-1' },
      c: { cost: 'MED.EN-1', effect: '', later: '' },
    },
  },
  'CR-02': {
    cards: {
      a: { cost: '@nameBusy(1, 1)', effect: '[Name].EN+3', later: '' },
      b: { cost: 'MED.EN-1', effect: '[Name].EN+2; +FLAG:sleepRoutine', later: '' },
      c: { cost: '[Name].EN-2', effect: '', later: 'p=0.2: @randomRepairEvent' },
    },
  },
  'CR-03': {
    cards: {
      a: { cost: 'PWR-1', effect: '[Name].EN+1', later: '⏳1: [Name].EN+1' },
      b: { cost: 'LOST: 1 task; @cancelTasks(1)', effect: 'ALL.EN+1', later: '' },
      c: { cost: '', effect: 'SP+1', later: 'p=0.3: ⏳1: [Name].EN-2' },
    },
  },
  'CR-04': {
    cards: {
      a: { cost: 'EVA.EN-1', effect: '', later: '' },
      b: { cost: 'PWR-1', effect: '', later: '' },
      c: { cost: '', effect: '', later: '⏳1: ALL.EN-1' },
    },
  },
  'CR-05': {
    cards: {
      a: { cost: 'LOST: EVA task; @cancelNameTask', effect: '', later: '' },
      b: { cost: 'PICK.EN-1; LOST: EVA task; @cancelNameTask', effect: '', later: '' },
      c: { cost: '', effect: '', later: 'p=0.5: @nameSickBay(2)' },
    },
  },
  'CR-06': {
    cards: {
      a: { cost: 'MED.EN-1; MEDKIT-1', effect: '', later: '' },
      b: { cost: '@nameBusy(2)', effect: '', later: '' },
      c: { cost: '', effect: '', later: 'p=0.4: ⏳1: @nameSickBay(2)' },
    },
  },
  'CR-07': {
    // D-017 adaptation: the crew pool is shared, so "others cover" = the named astronaut rests a bit
    // while someone else does the job (net +1 EN, the task still happens).
    cards: {
      a: { cost: '@nameBusy(1)', effect: 'EN+3', later: '' },
      b: { cost: 'PICK.EN-1', effect: 'EN+2', later: '' },
      c: { cost: 'FOOD-1', effect: 'EN+1', later: '' },
    },
  },
  // ── Research ──
  'RS-01': {
    cards: {
      a: { cost: 'EVA.EN-3; EVA.AIR-3; EVA_DOSE', effect: 'SP+5', later: 'p=0.2: @evaMishap' },
      b: { cost: 'RES.EN-2; RES.AIR-1; EVA_DOSE', effect: 'SP+2', later: '' },
      c: { cost: 'PWR-2; ENG.EN-1', effect: '', later: 'p=0.7: SP+3' },
    },
  },
  'RS-03': {
    onStart: '+FLAG:broken:lab',
    cards: {
      a: { cost: 'ENG.EN-2; PARTS-1', effect: 'LAB+4; -FLAG:broken:lab', later: '', ...REPAIR },
      b: { cost: 'RES.EN-3', effect: '', later: 'p=0.5: LAB+2; -FLAG:broken:lab', ...REPAIR },
      c: { cost: '@labHalf', effect: '-FLAG:broken:lab', later: '' },
    },
  },
  'RS-04': {
    cards: {
      a: { cost: 'PWR-2; @needComms', effect: '@bankSP(all)', later: '' },
      b: { cost: 'PWR-1; @needComms', effect: '@bankSP(half)', later: '' },
      c: { cost: 'LOST: sending today', effect: '', later: '' },
    },
  },
  'RS-05': {
    cards: {
      a: { cost: 'PWR-1', effect: 'SP+3', later: '' },
      b: { cost: 'MED.EN-1', effect: 'SP+1; +FLAG:cr01Free', later: '' },
      c: { cost: 'RES.EN-2; LAB-1; PWR-1', effect: '', later: '⏳2: SP+5' },
    },
  },
  'RS-06': {
    cards: {
      a: { cost: 'LOST: maintenance; LS-1', effect: 'SP+3', later: '' },
      b: { cost: 'PWR-1; LOST: extra science', effect: '+FLAG:askEarthFree', later: '' },
      c: { cost: 'ALL.EN-1', effect: 'SP+3', later: 'p=0.5: → CR-02' },
    },
  },
  // ── Comms ──
  'CM-02': {
    onStart: '+FLAG:broken:antenna',
    cards: {
      a: { cost: 'ENG.EN-2; EVA_DOSE', effect: '-FLAG:broken:antenna', later: '', ...REPAIR },
      b: { cost: '@backupAntenna', effect: '-FLAG:broken:antenna', later: '' },
      c: { cost: 'LOST: no Ask Earth or data until fixed', effect: '', later: '⏳2: → CM-02' },
    },
  },
  // ── Mission ──
  'MG-02': {
    cards: {
      a: { cost: '@endMission', effect: '', later: '' },
      b: { cost: '', effect: '@repairsDouble', later: '@mg02Limit' },
      c: { cost: '', effect: '', later: '@pushOn' },
    },
  },
  'MG-03': {
    cards: {
      a: {
        cost: 'LOST: Researcher task; @cancelRoleTask(RES)',
        effect: '@solarBonus(1)',
        later: '',
      },
      b: { cost: '@dustAdd(1)', effect: 'SP+2', later: '' },
      c: { cost: 'MGR.EN-1', effect: '@mg03Vote; ALL.EN+1', later: '' },
    },
  },
};

export interface TaskOverride {
  who?: string;
  cost: string;
  effect: string;
  eva?: boolean;
  res2x?: boolean;
  needs?: { lab?: number; sickBay?: boolean; unlock?: string };
}

/** Daily tasks (spec §4) in clean notation. Costs hit the shared crew pool (D-017). */
export const TASK_OVERRIDES: Record<string, TaskOverride> = {
  'T-REST': { cost: "LOST: today's task", effect: 'EN+3' },
  'T-EXER': { cost: 'EN-1', effect: '@exercise' },
  'T-MAINT-LS': { who: 'ENG', cost: 'EN-1', effect: 'LS+1; @maintLS' },
  'T-MAINT-LAB': { who: 'ENG or RES', cost: 'EN-1', effect: 'LAB+1; @maintLab' },
  'T-GARDEN': { who: 'ANY', cost: 'EN-1', effect: '@tend' },
  'T-LAB': {
    who: 'ANY',
    cost: 'EN-2; PWR-1',
    effect: 'SP+1; @labTask',
    res2x: true,
    needs: { lab: 3 },
  },
  'T-EVA-SCI': {
    who: 'ANY (EVA)',
    cost: 'EN-2; AIR-1; EVA_DOSE',
    effect: 'SP+1',
    eva: true,
    res2x: true,
  },
  'T-SHIELD': { who: 'ANY (EVA)', cost: 'EN-2; EVA_DOSE', effect: 'SH+1', eva: true },
  'T-WATERWALL': { cost: 'EN-1', effect: '@waterWall' },
  'T-PANELS': { who: 'ANY (EVA)', cost: 'EN-2; AIR-1; EVA_DOSE', effect: '@dustClear', eva: true },
  'T-ICE': {
    who: 'ANY (EVA)',
    cost: 'EN-3; PWR-2; EVA_DOSE',
    effect: 'H2O+6',
    eva: true,
    needs: { unlock: 'LS-10' },
  },
  'T-MOXIE': { cost: 'PWR-2', effect: 'O2T+1', needs: { unlock: 'LS-11' } },
  'T-MED': { cost: 'EN-1', effect: '@checkup' },
  'T-TREAT': { cost: 'EN-1; MEDKIT-1', effect: '@treat', needs: { sickBay: true } },
  'T-PLAN': { cost: 'EN-1', effect: '@peek' },
  'T-PEP': { cost: 'EN-1', effect: 'EN+2' },
  'T-CALL': { cost: 'PWR-1; @needComms', effect: 'EN+1; @callReply' },
  'T-SEND': { cost: 'PWR-2; @needComms', effect: '@bankSP(all)' },
};

/** Kit experiment (D-013, FD-04.c): a one-time task, not in spec §4. */
export const KIT_TASK = {
  id: 'T-KIT',
  title: 'Kit experiment',
  who: 'ANY',
  cost: 'EN-1',
  effect: 'SP+2; @useKit',
  lesson: 'Science needs supplies too', // spec FD-04.c lesson
};
