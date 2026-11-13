/** Deck building and the draw order (spec §8.3 + D-004 + D-013). */
import {
  BRIEFING_PRIORITY,
  COND,
  CR04_AFTER_EVA_CHANCE,
  CR07_EN_TRIGGER,
  CREW_SIZE,
  DISPLACED_WAIT_SOLS,
  EVA_MISHAP_CHANCE,
  MG02_LOW_SYSTEM,
  MG02_SICKBAY_COUNT,
  QUIET_SOL_CHANCE,
  TIMER_EVERY_SOLS,
} from './config';
import type { OfferOptions } from './events';
import { plantCrop } from './hooks';
import { chance, int, shuffle } from './rng';
import { clearFlag, hasFlag, log, notInSickBay } from './state';
import type { AstronautId, Content, EventDef, GameState, Mission, QueuedEvent } from './types';

export function tierOk(ev: EventDef, s: GameState): boolean {
  return s.tier === 'commander' || ev.tier === 'cadet';
}
function missionOk(ev: EventDef, mission: Mission): boolean {
  return ev.missions === 'all' || ev.missions.includes(mission.id);
}
function allowed(s: GameState, content: Content, mission: Mission, id: string): boolean {
  const ev = content.events[id];
  return !!ev && tierOk(ev, s) && missionOk(ev, mission);
}

/** Core events of this tier + this mission's 🎯 events, shuffled with the seed (spec §8.3). */
export function buildDeck(s: GameState, content: Content, mission: Mission): string[] {
  const ids = Object.values(content.events)
    .filter((ev) => tierOk(ev, s) && ev.id !== 'SW-05') // SW-05 only on quiet sols
    .filter(
      (ev) =>
        (ev.deck.includes('core') && missionOk(ev, mission)) ||
        (ev.deck.includes('mission') && mission.missionEvents.includes(ev.id)) ||
        (ev.deck.includes('mission') &&
          Array.isArray(ev.missions) &&
          ev.missions.includes(mission.id) &&
          !ev.deck.includes('donki')),
    )
    .map((ev) => ev.id);
  return shuffle(s.rng, [...new Set(ids)].sort());
}

// ── conditions (spec §6 + D-011/D-013/D-017) ──
const CONDITIONS: Record<string, (s: GameState) => boolean> = {
  'MG-02': (s) =>
    [s.systems.LS, s.systems.LAB, s.systems.BAT].filter((v) => v <= MG02_LOW_SYSTEM).length >= 2 ||
    s.astronauts.filter((a) => a.sickBaySols > 0).length >= MG02_SICKBAY_COUNT,
  'LS-01': (s) => s.systems.LS <= COND.LS01_LS_MAX,
  'LS-09': (s) => s.supplies.H2O <= COND.LS09_H2O_MAX,
  'RS-03': (s) => s.systems.LAB <= COND.RS03_LAB_MAX,
  'FD-06': (s) => s.supplies.FOOD <= CREW_SIZE * COND.FD06_FOOD_PER_CREW,
  'CR-07': (s) => s.crew.EN <= CR07_EN_TRIGGER,
  'SW-07': (s) => s.crew.DOSE >= COND.SW07_DOSE,
  'SW-06': (s) => s.crew.DOSE >= COND.SW06_DOSE,
};

function conditionDue(s: GameState, content: Content, mission: Mission, id: string): boolean {
  if (!allowed(s, content, mission, id)) return false;
  if ((s.cooldowns[id] ?? 0) > s.sol) return false; // D-004 cooldown
  return CONDITIONS[id]!(s);
}

const NAME_EVENTS = new Set(['CR-02', 'CR-03', 'CR-05', 'CR-06', 'CR-07']);

function randomName(s: GameState): AstronautId | undefined {
  const pool = notInSickBay(s);
  return pool.length ? pool[int(s.rng, pool.length)]!.id : undefined;
}

export interface Pick {
  eventId: string;
  opts: OfferOptions;
}

/** Morning Briefing (D-004): at most one of RS-04 / FD-01 re-plant / CR-01 per sol. Priority PENDING P-002. */
export function selectBriefing(s: GameState, content: Content, mission: Mission): Pick | null {
  const due: string[] = [];
  const rs04 =
    s.timers.rs04Pending || s.sol % TIMER_EVERY_SOLS['RS-04'] === 0 || s.sol === s.lastSol; // D-005
  if (rs04 && allowed(s, content, mission, 'RS-04')) due.push('RS-04');
  if (!s.crop && s.lastCrop && allowed(s, content, mission, 'FD-01')) due.push('FD-01');
  if (s.sol % TIMER_EVERY_SOLS['CR-01'] === 0 && allowed(s, content, mission, 'CR-01')) {
    if (hasFlag(s, 'exercised')) {
      clearFlag(s, 'exercised'); // ASSUMPTION: T-EXER since the last CR-01 counts for it (spec §4 "Counts for CR-01")
      log(s, 'info', 'log.exerciseCounted');
    } else due.push('CR-01');
  }
  if (due.length === 0) {
    s.timers.rs04Pending = false;
    return null;
  }
  const ordered = BRIEFING_PRIORITY.filter((id) => due.includes(id));
  const chosen = ordered[0]!;
  s.timers.rs04Pending = false;
  for (const bumped of ordered.slice(1)) {
    if (bumped === 'RS-04') s.timers.rs04Pending = true; // P-002: moves to tomorrow
    if (bumped === 'FD-01' && s.lastCrop) plantCrop(s, s.lastCrop); // D-004: same crop replanted
    if (bumped === 'CR-01') log(s, 'info', 'log.briefingSkipped', { id: 'CR-01' });
  }
  return { eventId: chosen, opts: {} };
}

/** The event slot (spec §8.3 + D-004 priorities). Returns null on a quiet sol. */
export function selectEvent(
  s: GameState,
  content: Content,
  mission: Mission,
  evaPlanned: AstronautId[],
): Pick | null {
  const dueQueue = s.queue.filter(
    (q) => q.dueSol <= s.sol && allowed(s, content, mission, q.eventId),
  );
  const fromQueue = (q: QueuedEvent): Pick => {
    s.queue.splice(s.queue.indexOf(q), 1);
    const opts: OfferOptions = {};
    if (q.severity !== undefined) opts.severity = q.severity;
    const name = q.nameTarget ?? (NAME_EVENTS.has(q.eventId) ? randomName(s) : undefined);
    if (name) opts.nameTarget = name;
    return { eventId: q.eventId, opts };
  };
  const cond = (id: string): Pick | null => {
    if (!conditionDue(s, content, mission, id)) return null;
    const opts: OfferOptions = {};
    if (NAME_EVENTS.has(id)) {
      const n = randomName(s);
      if (n) opts.nameTarget = n;
    }
    return { eventId: id, opts };
  };
  const pick = (): Pick | null => {
    // 1. scripted beat
    const beat = mission.scripted.find((b) => b.sol === s.sol);
    if (beat && allowed(s, content, mission, beat.event)) {
      const opts: OfferOptions = {};
      if (beat.severity !== undefined) opts.severity = beat.severity;
      if (beat.warningSols !== undefined) opts.warningSols = beat.warningSols;
      if (beat.donki) opts.donki = beat.donki;
      return { eventId: beat.event, opts };
    }
    // 2. DONKI events: live/archived timeline arrives in Phase 5 (D-009).
    // 3. MG-02
    const mg = cond('MG-02');
    if (mg) return mg;
    // 4. SW-02
    const sw02 = dueQueue.find((q) => q.eventId === 'SW-02');
    if (sw02) return fromQueue(sw02);
    // 5. LS / air chains and conditions
    const lsq = dueQueue.find((q) => q.eventId.startsWith('LS-'));
    if (lsq) return fromQueue(lsq);
    for (const id of ['LS-01', 'LS-09']) {
      const c = cond(id);
      if (c) return c;
    }
    // 6. other chains and conditions
    const other = dueQueue.find((q) => q.eventId !== 'SW-02' && !q.eventId.startsWith('LS-'));
    if (other) return fromQueue(other);
    if (evaPlanned.length && chance(s.rng, EVA_MISHAP_CHANCE)) {
      const id = chance(s.rng, 0.5) ? 'CR-05' : 'CR-06'; // D-013
      return { eventId: id, opts: { nameTarget: evaPlanned[int(s.rng, evaPlanned.length)]! } };
    }
    if (s.counters.evaYesterday > 0 && chance(s.rng, CR04_AFTER_EVA_CHANCE))
      return { eventId: 'CR-04', opts: {} }; // D-013
    if (s.counters.labTasks >= COND.RS05_LAB_TASKS && !s.played.includes('RS-05'))
      return { eventId: 'RS-05', opts: {} };
    for (const id of ['FD-06', 'RS-03', 'CR-07', 'SW-07', 'SW-06']) {
      const c = cond(id);
      if (c) return c;
    }
    if (s.dust.addedToday) return { eventId: 'PW-02', opts: {} }; // D-004
    // 7. quiet sol
    if (chance(s.rng, QUIET_SOL_CHANCE[s.tier])) {
      const calm =
        mission.donki === 'quiet' || !s.played.slice(-3).some((id) => id.startsWith('SW-0'));
      if (calm && !s.played.includes('SW-05') && allowed(s, content, mission, 'SW-05'))
        return { eventId: 'SW-05', opts: {} };
      return null;
    }
    // 8. deck
    const top = s.deck.shift();
    if (!top) return null;
    let id = top;
    if (id === 'LS-01' && s.supplies.PARTS === 0) id = 'LS-02'; // spec LS-01: "If PARTS = 0 → LS-02"
    const opts: OfferOptions = {};
    if (NAME_EVENTS.has(id)) {
      const n = randomName(s);
      if (n) opts.nameTarget = n;
    }
    return { eventId: id, opts };
  };
  const chosen = pick();
  if (chosen && chosen.eventId === 'LS-01' && s.supplies.PARTS === 0) chosen.eventId = 'LS-02';
  // D-004: a displaced chain waits 1 sol, then is dropped and logged.
  for (const q of [...s.queue]) {
    if (q.dueSol <= s.sol - DISPLACED_WAIT_SOLS) {
      s.queue.splice(s.queue.indexOf(q), 1);
      log(s, 'info', 'log.dropped', { id: q.eventId });
    }
  }
  return chosen;
}
