import { describe, expect, it } from 'vitest';
import { CONTENT } from '../../src/content';
import { growCrops } from '../../src/engine/greenhouse';
import { applyEvaDose } from '../../src/engine/radiation';
import { upkeep, sickBayCheck } from '../../src/engine/crew';
import { buildDeck, selectBriefing, selectEvent } from '../../src/engine/deck';
import { checkEndings } from '../../src/engine/endings';
import { offerEvent, resolveChoice, waitId } from '../../src/engine/events';
import { computePower, settlePower } from '../../src/engine/power';
import {
  applyStorm,
  backgroundDose,
  doseBadge,
  shieldTier,
  stormDoseFor,
} from '../../src/engine/radiation';
import { changeStat, evaAllowed, setFlag } from '../../src/engine/state';
import { checkTask } from '../../src/engine/tasks';
import type { GameState } from '../../src/engine/types';
import { atSol1, E } from './helpers';
import { playGame, randomBot } from '../../src/sim/bots';
import { stateValue, timeoutId } from '../../src/engine';

const M1 = CONTENT.missions.M1!;
const M3 = CONTENT.missions.M3!;
/** The full rule set (all 60 events) for engine-rule tests; the kid game uses the D-018 scope. */
const FULL_M1 = { ...M1, events: Object.keys(CONTENT.events) };
const fresh = (): GameState => JSON.parse(JSON.stringify(atSol1())) as GameState;

describe('setup and the sol loop', () => {
  it('no setup choice (D-026): sol 1 morning, lettuce already planted', () => {
    const s = E.newGame({ mission: 'M3', tier: 'cadet', seed: 3 });
    expect(s.pending).toBeNull();
    expect(s.sol).toBe(1);
    expect(s.phase).toBe('morning');
    expect(s.crop?.kind).toBe('lettuce');
  });

  it('shared crew card starts at 4 × spec values (D-017)', () => {
    const s = fresh();
    expect(s.crew).toMatchObject({ FUL: 16, HYD: 16, AIR: 20, EN: 16, ENMAX: 20, DOSE: 0 });
  });

  it('illegal commands leave the state unchanged', () => {
    const s = fresh();
    expect(E.reduce(s, { type: 'CONFIRM_TASKS' })).toEqual(s);
    expect(E.reduce(s, { type: 'CHOOSE', actionId: 'LS-01.a' })).toEqual(s);
  });

  it('D-027: the day starts with its surprise, then jobs, then night', () => {
    let s = fresh();
    s = E.reduce(s, { type: 'CONTINUE' });
    s = E.reduce(s, { type: 'CONFIRM_POWER' });
    expect(s.phase).toBe('event');
    expect(s.pending?.slot).toBe('event');
    s = E.reduce(s, { type: 'CHOOSE', actionId: E.shownCards(s).find((c) => c.affordable)!.id });
    expect(s.phase === 'tasks' || s.phase === 'ended').toBe(true);
    s = E.reduce(s, { type: 'CONFIRM_TASKS' });
    expect(s.phase === 'night' || s.phase === 'ended').toBe(true);
    expect(s.pending).toBeNull();
  });
});

describe('power (D-002, D-003)', () => {
  it('clear sol: solar 4 + reactor 2; base need LS 2 + recycler 1 + greenhouse 1', () => {
    const s = fresh();
    const b = computePower(s, CONTENT);
    expect([b.solar, b.reactor, b.supply, b.totalNeed]).toEqual([4, 2, 6, 4]);
  });
  it.each([
    [1, 0, 4],
    [0.6, 0, 2],
    [0.3, 0, 1],
    [0.05, 0, 0],
    [1, 1, 3],
    [1, 3, 1],
    [0.6, 3, 0],
  ])('solar = floor(4 × %s) − %s stacks = %s', (mult, stacks, solar) => {
    const s = fresh();
    s.dust.multiplier = mult;
    s.dust.stacks = stacks;
    expect(computePower(s, CONTENT).solar).toBe(solar);
  });
  it('leftover charges the battery up to BATMAX', () => {
    const s = fresh();
    s.systems.BAT = 9;
    settlePower(s, CONTENT);
    expect(s.systems.BAT).toBe(10);
  });
  it('deficit beyond the battery → LS unpowered (LS −2)', () => {
    const s = fresh();
    s.dust.multiplier = 0.05;
    s.systems.BAT = 0;
    s.power.spent = 1;
    const ls = s.systems.LS;
    settlePower(s, CONTENT);
    expect(s.systems.LS).toBe(ls - 2);
  });
  it('shortage puts PW-08 on the Power Plan, not in the event slot (D-003)', () => {
    let s = fresh();
    s.dust.multiplier = 0.05;
    s.systems.BAT = 0;
    s = E.reduce(s, { type: 'CONTINUE' });
    expect(s.pending).toMatchObject({ slot: 'shortage', eventId: 'PW-08' });
    s = E.reduce(s, { type: 'CHOOSE', actionId: 'PW-08.b' }); // greenhouse off: need 4 → 3, supply 2
    expect(s.pending).toMatchObject({ slot: 'shortage', eventId: 'PW-08' }); // still short → shown again
    s = E.reduce(s, { type: 'CHOOSE', actionId: 'PW-08.a' }); // lab off: need −1
    expect(computePower(s, CONTENT).shortfall).toBe(0);
    expect(s.pending).toBeNull();
    expect(s.phase).toBe('power');
  });
});

describe('radiation (D-007, D-008, D-010, D-017)', () => {
  it('tiers', () =>
    expect([0, 2, 3, 5, 6, 8, 9, 10].map(shieldTier)).toEqual([0, 0, 1, 1, 2, 2, 3, 3]));
  it('badge colours', () =>
    expect([0, 3, 4, 6, 7, 10].map(doseBadge)).toEqual([
      'green',
      'green',
      'yellow',
      'yellow',
      'red',
      'red',
    ]));
  it('storm dose inside / sheltered / wall', () => {
    const s = fresh(); // SH 4 → tier 1
    expect(stormDoseFor(s, 3, 'inside')).toBe(2);
    expect(stormDoseFor(s, 3, 'sheltered')).toBe(0);
    expect(stormDoseFor(s, 3, 'wall')).toBe(1); // SH 6 → tier 2
    setFlag(s, 'shelterReady');
    expect(applyStorm(s, 4, 'inside')).toBe(1); // counts as sheltered: 4 − 1 − 2
    expect(s.flags['shelterReady']).toBeUndefined();
  });
  it('background dose every 6 sols, every 12 at tier ≥ 2', () => {
    const s = fresh();
    s.sol = 6;
    backgroundDose(s);
    expect(s.crew.DOSE).toBe(1);
    expect(s.timers.bgDoseSol).toBe(12);
    s.systems.SH = 6;
    s.sol = 12;
    backgroundDose(s);
    expect(s.timers.bgDoseSol).toBe(24);
  });
  it('a full badge makes the whole crew Indoor only', () => {
    const s = fresh();
    changeStat(s, 'DOSE', 10);
    expect(s.crew.indoorOnly).toBe(true);
    expect(evaAllowed(s)).toBe(false);
    s.phase = 'tasks';
    expect(checkTask(s, CONTENT, 'RES', 'T-EVA-SCI')).toMatchObject({
      allowed: false,
      reason: 'reason.indoor',
    });
  });
});

describe('upkeep and Sick Bay (spec §2.2 + D-017)', () => {
  it('eat 1 FOOD each; recycler ON drinks free; oxygen maker uses 1 H2O; sleep +4', () => {
    const s = fresh();
    const { FOOD, H2O } = s.supplies;
    s.crew.EN = 10;
    upkeep(s);
    expect(s.supplies.FOOD).toBe(FOOD - 4);
    expect(s.supplies.H2O).toBe(H2O - 1);
    expect(s.crew.EN).toBe(14);
  });
  it('no food → FUL −1 per hungry astronaut', () => {
    const s = fresh();
    s.supplies.FOOD = 1;
    upkeep(s);
    expect(s.crew.FUL).toBe(13);
  });
  it('recycler off → 1 H2O each', () => {
    const s = fresh();
    s.power.plugged.recycler = false;
    const h = s.supplies.H2O;
    upkeep(s);
    expect(s.supplies.H2O).toBe(h - 4 - 1);
  });
  it('AIR by LS: ≥ 4 refill · 1–3 → −4 · 0 → −8', () => {
    const s = fresh();
    s.crew.AIR = 12;
    s.systems.LS = 3;
    upkeep(s);
    expect(s.crew.AIR).toBe(8);
    s.systems.LS = 0;
    upkeep(s);
    expect(s.crew.AIR).toBe(0);
    s.systems.LS = 5;
    upkeep(s);
    expect(s.crew.AIR).toBe(20);
  });
  it('a pool at 0 sends one astronaut to Sick Bay and resets to 4; they return after 2 nights', () => {
    const s = fresh();
    s.crew.EN = 0;
    sickBayCheck(s);
    const sick = s.astronauts.filter((a) => a.sickBaySols > 0);
    expect(sick).toHaveLength(1);
    expect(s.crew.EN).toBe(4);
    sickBayCheck(s);
    sickBayCheck(s);
    expect(s.astronauts.every((a) => a.sickBaySols === 0)).toBe(true);
  });
});

describe('endings (spec §2.5)', () => {
  it('LS 0 for 2 sols → brought home', () => {
    const s = fresh();
    s.systems.LS = 0;
    checkEndings(s, M1);
    expect(s.ending).toBeNull();
    checkEndings(s, M1);
    expect(s.ending).toMatchObject({ kind: 'brought-home', reason: 'end.lsZero' });
  });
  it('3 astronauts in Sick Bay → brought home', () => {
    const s = fresh();
    for (const a of s.astronauts.slice(0, 3)) a.sickBaySols = 2;
    checkEndings(s, M1);
    expect(s.ending?.reason).toBe('end.sickBay');
  });
  it('last sol: success needs BANKED SP (D-005)', () => {
    const s = fresh();
    s.sol = s.lastSol;
    s.sp.pending = 10;
    checkEndings(s, M1);
    expect(s.ending).toMatchObject({ kind: 'safe-return', reason: 'end.lowScience' });
    const t = fresh();
    t.sol = t.lastSol;
    t.sp.banked = 6;
    checkEndings(t, M1);
    expect(t.ending?.kind).toBe('success');
  });
  it('M3 also needs DOSE ≤ 6 (D-010)', () => {
    const s = fresh();
    s.sol = s.lastSol;
    s.sp.banked = 99;
    s.crew.DOSE = 7;
    checkEndings(s, M3);
    expect(s.ending?.reason).toBe('end.highDose');
  });
});

describe('deck and draw order (spec §8.3, D-004)', () => {
  it('M1 Cadet deck: Cadet core + PW-03, no Commander or DONKI events', () => {
    const s = fresh();
    const deck = buildDeck(s, CONTENT, M1);
    expect(deck).toContain('PW-03');
    expect(deck).toContain('LS-03');
    for (const id of deck) expect(CONTENT.events[id]!.tier).toBe('cadet');
    expect(deck).not.toContain('SW-01');
    expect(deck).toContain('SW-05'); // D-026: a challenge every day, so Quiet Sun Day is a deck card
    expect(deck).not.toContain('LS-08');
  });
  it('a condition fires, then cools down for 3 sols', () => {
    const s = fresh();
    s.supplies.H2O = 5;
    const p = selectEvent(s, CONTENT, FULL_M1, []);
    expect(p?.eventId).toBe('LS-09');
    offerEvent(s, CONTENT, 'LS-09', 'event');
    expect(s.cooldowns['LS-09']).toBe(s.sol + 3);
    s.pending = null;
    expect(selectEvent(s, CONTENT, FULL_M1, [])?.eventId).not.toBe('LS-09');
  });
  it('MG-02 beats other conditions', () => {
    const s = fresh();
    s.systems.LS = 2;
    s.systems.LAB = 2;
    expect(selectEvent(s, CONTENT, FULL_M1, [])?.eventId).toBe('MG-02');
  });
  it('Morning Briefing: RS-04 wins; a bumped FD-01 replants automatically (D-004, P-002)', () => {
    const s = fresh();
    s.sol = 4;
    s.crop = null;
    s.lastCrop = 'lettuce';
    const b = selectBriefing(s, CONTENT, FULL_M1);
    expect(b?.eventId).toBe('RS-04');
    expect((s.crop as GameState['crop'])?.kind).toBe('lettuce'); // mutated by selectBriefing
  });
  it('RS-04 also comes on the last sol (D-005)', () => {
    const s = fresh();
    s.sol = 7;
    s.lastSol = 7;
    expect(selectBriefing(s, CONTENT, M1)?.eventId).toBe('RS-04');
  });
  it('scripted beats come first (M3)', () => {
    const s = fresh();
    s.mission = 'M3';
    s.sol = 2;
    expect(selectEvent(s, CONTENT, M3, [])).toMatchObject({
      eventId: 'SW-01',
      opts: { severity: 3 },
    });
  });
});

describe('affordability and the stuck rule (D-012)', () => {
  it('nothing affordable → reveal card c → "We can\'t fix it today" → event returns next sol', () => {
    const s = fresh();
    s.phase = 'event';
    s.supplies.PARTS = 0;
    s.supplies.O2T = 0;
    offerEvent(s, CONTENT, 'LS-03', 'event');
    expect(s.pending?.offered).toEqual(['LS-03.a', 'LS-03.b', 'LS-03.c']);
    expect(s.pending?.stuck).toBe(true);
    expect(E.shownCards(s).at(-1)?.id).toBe(waitId('LS-03'));
    expect(resolveChoice(s, CONTENT, 'LS-03.a')).toBe(false);
    expect(resolveChoice(s, CONTENT, waitId('LS-03'))).toBe(true);
    expect(s.queue.some((q) => q.eventId === 'LS-03' && q.dueSol === s.sol + 1)).toBe(true);
    expect(s.flags['broken:o2maker']).toBeDefined(); // stays broken
  });
  it('costs come first on every MVP card view (no free lunch)', () => {
    const s = fresh();
    offerEvent(s, CONTENT, 'LS-01', 'event');
    const cards = E.shownCards(s);
    expect(cards[0]!.costs.map((c) => [c.icon, c.amount])).toEqual([
      ['EN', -2],
      ['PARTS', -1],
    ]);
    expect(cards[0]!.effects[0]).toMatchObject({ icon: 'LS', amount: 3 });
  });
  it('ALL.EN-1 costs the shared pool once per astronaut (D-017)', () => {
    const s = fresh();
    offerEvent(s, CONTENT, 'LS-04', 'event');
    const en = s.crew.EN;
    expect(resolveChoice(s, CONTENT, 'LS-04.a')).toBe(true);
    expect(s.crew.EN).toBe(en - 4);
  });
});

describe('kid scope (D-018, D-019)', () => {
  it('the M1 deck only holds kid-scope events', () => {
    const s = fresh();
    for (const id of buildDeck(s, CONTENT, M1)) expect(M1.events).toContain(id);
  });
  it('conditions outside the scope never fire', () => {
    const s = fresh();
    s.supplies.H2O = 5;
    s.systems.LS = 2;
    s.systems.LAB = 2;
    const p = selectEvent(s, CONTENT, M1, []);
    expect(p === null || M1.events.includes(p.eventId)).toBe(true);
  });
  it('every astronaut sees exactly 3 jobs, all their own (D-028, no stand-in)', () => {
    let s = fresh();
    s = E.reduce(E.reduce(s, { type: 'CONTINUE' }), { type: 'CONFIRM_POWER' });
    s = E.reduce(s, { type: 'CHOOSE', actionId: E.shownCards(s).find((c) => c.affordable)!.id });
    for (const a of s.astronauts.filter((x) => x.busyUntilSol < s.sol)) {
      const jobs = E.availableTasks(s, a.id);
      expect(jobs, a.id).toHaveLength(3);
      expect(
        jobs.some((j) => j.fallback),
        a.id,
      ).toBe(false);
    }
    expect(
      E.reduce(s, { type: 'PLAN_TASK', astronaut: 'MGR', taskId: 'T-LAB' }).astronauts[0]!
        .plannedTask,
    ).toBeNull();
  });
  it('out-of-scope chains never happen and are not shown (LS-03.b → LS-04)', () => {
    const s = fresh();
    offerEvent(s, CONTENT, 'LS-03', 'event');
    const b = E.shownCards(s).find((c) => c.id === 'LS-03.b')!;
    expect(b.later.some((ch) => ch.label === 'chip.trigger')).toBe(false);
    expect(b.risk).toBeUndefined();
  });
});

describe('kid critique fixes (D-025)', () => {
  it('missions of 10 sols plant lettuce vs radishes (peppers could not pay off)', () => {
    const s = E.newGame({ mission: 'M3', tier: 'cadet', seed: 5 });
    offerEvent(s, CONTENT, 'FD-01', 'setup');
    expect(s.pending?.offered).toEqual(['FD-01.a', 'FD-01.c']);
  });
  it('peppers give food when Taco Night is outside the scope', () => {
    const s = fresh();
    s.crop = {
      kind: 'pepper',
      plantedSol: 0,
      readySol: s.sol,
      tended: true,
      tendedByRes: false,
      delayedUntended: false,
    };
    const food = s.supplies.FOOD;
    growCrops(s, CONTENT);
    expect(s.supplies.FOOD).toBe(food + 8);
    expect(s.queue.some((q) => q.eventId === 'FD-05')).toBe(false);
  });
  it('trips outside say why the badge went up', () => {
    const s = fresh();
    let real = 0;
    for (let i = 0; i < 20 && real === 0; i++) real = applyEvaDose(s, 1);
    expect(s.log.some((l) => l.key === 'log.evaDose')).toBe(true);
  });
});

describe('challenge rules (D-026, D-027, D-030)', () => {
  it('every day has a challenge in the kid game', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const end = playGame(E, E.newGame({ mission: 'M3', tier: 'cadet', seed }), randomBot(seed));
      expect(end.log.some((l) => l.key === 'log.quietSol')).toBe(false);
    }
  });
  it('if the timer runs out, the crew does the worst card and it is logged', () => {
    let s = E.newGame({ mission: 'M3', tier: 'cadet', seed: 11 });
    s = E.reduce(E.reduce(s, { type: 'CONTINUE' }), { type: 'CONFIRM_POWER' });
    const worst = E.timeoutChoice(s);
    expect(worst).toBeTruthy();
    const t = E.reduce(s, { type: 'CHOOSE', actionId: timeoutId(s.pending!.eventId) });
    expect(t.choices.at(-1)!.actionId).toBe(worst);
    expect(t.log.some((l) => l.key === 'log.timeout')).toBe(true);
    // the worst card is never better than any card the player could pick
    for (const c of E.shownCards(s).filter((x) => x.affordable)) {
      expect(stateValue(t)).toBeLessThanOrEqual(
        stateValue(E.reduce(s, { type: 'CHOOSE', actionId: c.id })) + 1e-9,
      );
    }
  });
  it('"everyone to the shelter" before jobs leaves the crew without jobs today', () => {
    const s = fresh();
    s.phase = 'event';
    offerEvent(s, CONTENT, 'SW-02', 'event', { severity: 2 });
    expect(resolveChoice(s, CONTENT, 'SW-02.a')).toBe(true);
    expect(s.astronauts.every((a) => a.busyUntilSol >= s.sol)).toBe(true);
  });
  it('the M3 science goal is 14 stars (D-030)', () => {
    expect(E.newGame({ mission: 'M3', tier: 'cadet', seed: 1 }).sp.goal).toBe(14);
  });
});
