/**
 * Mars Base Adventure: engine contract v2 (owned by lane E).
 *
 * This file + the API in `index.ts` are the contract between engine, content and UI.
 * Any change must be logged in PROGRESS.md → Contract changes (what, why, who must adapt).
 *
 * Rules: pure data, JSON-serialisable (no classes, functions, Date, Map/Set).
 * Based on spec §10 (events-and-actions.md v0.4) + decisions D-001…D-017.
 * v2: shared crew stats (D-017), richer Effect kinds, content passed to createEngine().
 */

// ───────────────────────── basic vocab ─────────────────────────

export type Tier = 'cadet' | 'commander';
export type Role = 'MGR' | 'ENG' | 'MED' | 'RES';
/** One astronaut per role, so the role doubles as the astronaut id. */
export type AstronautId = Role;
export type MissionId = 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7' | 'M8' | 'M9';
export type DeckType = 'core' | 'mission' | 'chain' | 'condition' | 'timer' | 'donki' | 'setup';

/** Base systems (0–10; BAT max is BATMAX). */
export type SystemKey = 'LS' | 'SH' | 'LAB' | 'BAT';
/** Supplies (spec §2.1). */
export type SupplyKey = 'FOOD' | 'H2O' | 'O2T' | 'PARTS' | 'MEDKIT';
/** Shared crew pools (D-017): 0–20 each; ENMAX caps EN. */
export type PoolKey = 'FUL' | 'HYD' | 'AIR' | 'EN';
/** Crew stats incl. the shared DOSE badge (0–10) and the EN cap. */
export type StatKey = PoolKey | 'DOSE' | 'ENMAX';

/** Effect targets (spec §3). With shared stats they only decide the multiplier (spec §2.2, D-017). */
export type Target = 'ALL' | 'ME' | 'EVA' | 'PICK' | 'NAME' | 'EACH' | 'CREW' | Role;

// ───────────────────────── effects ─────────────────────────

/** One parsed effect token (src/engine/notation.ts). */
export type Effect =
  | { kind: 'system'; key: SystemKey; delta: number }
  | { kind: 'power'; delta: number } // PWR±N: spend (−) or bonus (+) today's power
  | { kind: 'sp'; delta: number } // SP±N → pending (D-005)
  | { kind: 'supply'; key: SupplyKey; delta: number }
  | { kind: 'stat'; target: Target; stat: StatKey; delta: number }
  | { kind: 'flag'; op: 'set' | 'clear'; flag: string; sols?: number }
  | { kind: 'trigger'; event: string } // → EVT-ID (chain, next sol)
  | { kind: 'lost'; what: string } // LOST: … (a lost chance counts as a cost)
  | { kind: 'evaDose' } // "EVA dose": +1 with 50 % per astronaut outside (spec §2.6)
  | { kind: 'chance'; p: number; effects: Effect[] } // p=0.3: …
  | { kind: 'hook'; hook: string; args: (string | number)[] }; // named rule in hooks.ts

/** ⏳N: effects, optionally with p= chance. A ⏳ with no N means ⏳1 (D-012). */
export interface Delayed {
  inSols: number;
  chance?: number;
  effects: Effect[];
}

export interface ScheduledEffect {
  id: number;
  dueSol: number;
  chance?: number;
  effects: Effect[];
  source: string; // card / task id
  nameTarget?: AstronautId;
}

export interface Modifier {
  id: number;
  source: string;
  kind: string; // 'labOff' | 'greenhouseOff' | 'noEva' | 'needDelta' | 'solarBonus' | 'rationing' | …
  value: number;
  fromSol: number; // first sol it applies
  untilSol: number | null; // last sol it applies (inclusive); null = until cleared
}

// ───────────────────────── content definitions ─────────────────────────

/** Parsed "Who" cell (src/engine/who.ts). */
export interface WhoSpec {
  roles: Role[]; // specific specialists needed
  alt: Role[]; // "ENG or RES": any of these counts as the specialist
  any: number; // extra helpers (anyone available)
  name: boolean; // the astronaut the event is about
  pick: boolean; // player picks one (Cadet: auto)
  eva: boolean; // the card sends people outside
  evaCrew: boolean; // "EVA crew": whoever is outside today
  raw: string;
}

export interface ActionDef {
  id: string; // 'SW-02.a'
  eventId: string;
  letter: string;
  title: string;
  who: WhoSpec;
  cadet: boolean; // ★
  costNow: Effect[];
  effects: Effect[];
  later: Delayed[];
  lesson: string;
  tags: ('repair' | 'hiddenUnlessLS10')[];
  raw: { who: string; cost: string; effect: string; later: string };
}

export interface EventDef {
  id: string;
  title: string;
  icon: string;
  system: string;
  tier: Tier;
  deck: DeckType[];
  missions: MissionId[] | 'all';
  repeatable: boolean;
  kidText: string;
  realScience: { text: string; sources: string[] };
  /** Effects applied when the event appears (before the choice), e.g. "machine stopped". */
  onStart: Effect[];
  actions: ActionDef[];
}

export interface TaskDef {
  id: string; // 'T-LAB'
  title: string;
  who: WhoSpec;
  cost: Effect[];
  effects: Effect[];
  eva: boolean;
  res2x: boolean;
  lesson: string;
  needs?: { lab?: number; sickBay?: boolean; unlock?: string };
}

export interface Mission {
  id: MissionId;
  name: string;
  site: string;
  goal: { maxDose?: number };
  missionEvents: string[];
  scripted: {
    sol: number;
    event: string;
    severity?: number;
    warningSols?: number;
    donki?: DonkiRef;
  }[];
  donki: 'quiet' | 'scripted' | 'live';
  dustEverySols?: number;
  specialRules: string[];
}

export interface Content {
  specVersion: string;
  events: Record<string, EventDef>;
  tasks: Record<string, TaskDef>;
  missions: Partial<Record<MissionId, Mission>>;
}

// ───────────────────────── game state ─────────────────────────

export interface RngState {
  s: number;
}

/** Each astronaut keeps only role-level state; all stats are on the shared crew card (D-017). */
export interface Astronaut {
  id: AstronautId;
  role: Role;
  callSign: string;
  sickBaySols: number; // 0 = available
  busyUntilSol: number; // no tasks up to and including this sol (CR-02.a, CR-06.b, CR-07.a)
  plannedTask: string | null; // planned in step 3, resolved at night (D-001)
}

/** The shared crew card (D-017). */
export interface Crew {
  FUL: number;
  HYD: number;
  AIR: number;
  EN: number;
  ENMAX: number;
  DOSE: number;
  indoorOnly: boolean; // DOSE reached 10
}

export type CropKind = 'lettuce' | 'radish' | 'pepper';
export interface Crop {
  kind: CropKind;
  plantedSol: number;
  readySol: number;
  tended: boolean;
  tendedByRes: boolean;
  delayedUntended: boolean;
}

export type PoweredSystem = 'LS' | 'recycler' | 'greenhouse';

export interface PowerBudget {
  solar: number;
  reactor: number;
  bonus: number;
  supply: number; // solar + reactor + bonus
  battery: number;
  batteryUsable: boolean;
  need: { LS: number; recycler: number; greenhouse: number; extra: number };
  totalNeed: number;
  spent: number; // PWR already spent/reserved today (cards + planned tasks)
  available: number; // supply + battery − totalNeed − spent
  shortfall: number; // > 0 → PW-08 shortage mode (D-003)
  plugged: Record<PoweredSystem, boolean>;
}

export type Phase = 'setup' | 'morning' | 'power' | 'tasks' | 'event' | 'night' | 'ended';

export interface Pending {
  slot: 'setup' | 'briefing' | 'shortage' | 'event';
  eventId: string;
  offered: string[]; // action ids shown (Cadet: 2 ★, Commander: 3; + c revealed when stuck)
  stuck: boolean; // nothing affordable → "We can't fix it today" (D-012)
  nameTarget?: AstronautId;
  severity?: number;
  warningSols?: number;
  donki?: DonkiRef;
}

export interface DonkiRef {
  type: string;
  id: string;
  date: string; // real date of the record (D-009)
  label: string; // honesty label text (spec §5)
  sourceUrl?: string; // DONKI page of the record
  fetchedAt?: string; // snapshot date: shown as "ARCHIVED – fetched on <date>"
}

export interface QueuedEvent {
  eventId: string;
  dueSol: number;
  sinceSol: number;
  severity?: number;
  nameTarget?: AstronautId;
  source: string;
}

export interface LogEntry {
  sol: number;
  kind:
    | 'event'
    | 'choice'
    | 'task'
    | 'power'
    | 'upkeep'
    | 'dose'
    | 'harvest'
    | 'warning'
    | 'info'
    | 'ending';
  /** Key into src/content/copy.ts → log templates. */
  key: string;
  params?: Record<string, string | number>;
}

export interface ChoiceRecord {
  sol: number;
  eventId: string;
  actionId: string;
  deltas: Record<string, number>; // resource changes caused right away
  causedEvents: string[];
  score: number;
}

export type EndingKind = 'success' | 'safe-return' | 'brought-home';
export interface Ending {
  kind: EndingKind;
  sol: number;
  reason: string; // copy key, e.g. 'end.lsZero'
}

export interface Debrief {
  ending: Ending;
  top3: {
    choice: ChoiceRecord;
    eventTitle: string;
    actionTitle: string;
    lesson: string;
    nasa: string;
    sources: string[];
  }[];
  stats: { spBanked: number; spPending: number; spGoal: number; dose: number; sols: number };
}

export interface GameState {
  version: 2;
  seed: number;
  rng: RngState;
  mission: MissionId;
  tier: Tier;
  sol: number; // 0 during setup
  lastSol: number;
  phase: Phase;
  systems: Record<SystemKey, number> & { BATMAX: number };
  supplies: Record<SupplyKey, number>;
  crew: Crew;
  sp: { pending: number; banked: number; goal: number };
  astronauts: Astronaut[];
  dust: { stacks: number; multiplier: number; nextStackSol: number; addedToday: boolean };
  power: PowerBudget;
  crop: Crop | null;
  lastCrop: CropKind | null;
  flags: Record<string, number>; // value = last sol it applies (Infinity is not JSON → 9999)
  modifiers: Modifier[];
  scheduled: ScheduledEffect[];
  queue: QueuedEvent[]; // chains waiting for the event slot (D-004)
  setupQueue: string[];
  deck: string[];
  played: string[];
  cooldowns: Record<string, number>; // event id → first sol it may fire again
  timers: {
    lsWearSol: number;
    labWearSol: number;
    bgDoseSol: number;
    recyclerLossSol: number;
    rs04Pending: boolean;
  };
  counters: {
    labTasks: number;
    lsZeroSols: number;
    lsUnpoweredSols: number;
    evaToday: number;
    evaYesterday: number;
    waterWalls: number;
    kitLeft: number;
  };
  pending: Pending | null;
  eventsToday: number;
  nextId: number;
  log: LogEntry[];
  choices: ChoiceRecord[];
  ending: Ending | null;
}

// ───────────────────────── commands (UI → engine) ─────────────────────────

export interface NewGameOptions {
  mission: MissionId;
  tier: Tier;
  seed: number;
}

export type Command =
  | { type: 'CHOOSE'; actionId: string; pick?: AstronautId } // answers state.pending
  | { type: 'CONTINUE' } // morning → power · night → next sol
  | { type: 'SET_POWER'; system: PoweredSystem; on: boolean }
  | { type: 'CONFIRM_POWER' }
  | { type: 'PLAN_TASK'; astronaut: AstronautId; taskId: string | null }
  | { type: 'CONFIRM_TASKS' };

// ───────────────────────── view models (engine → UI) ─────────────────────────

export type IconName =
  | 'LS'
  | 'SH'
  | 'PWR'
  | 'BAT'
  | 'LAB'
  | 'SP'
  | 'DOSE'
  | 'FOOD'
  | 'H2O'
  | 'O2T'
  | 'PARTS'
  | 'MEDKIT'
  | 'FUL'
  | 'HYD'
  | 'AIR'
  | 'EN'
  | 'TIME'
  | 'RISK'
  | 'LOST'
  | 'EVENT'
  | 'RULE';

export interface Chip {
  icon: IconName;
  tone: 'cost' | 'effect' | 'later' | 'risk';
  amount?: number; // signed number, e.g. −2
  label?: string; // plain text from the spec (LOST: …) or a copy key prefixed with 'chip.'
  params?: Record<string, string | number>;
  inSols?: number;
}

export interface CardView {
  id: string;
  title: string;
  who: string[]; // tokens: astronaut ids, 'ANY', 'NAME', 'PICK', 'EVA' (the UI turns them into words)
  star: boolean;
  costs: Chip[];
  effects: Chip[];
  later: Chip[];
  risk?: { pct: number; words: string };
  lesson: string;
  affordable: boolean;
  fallback: boolean; // specialist unavailable: +1 EN, 50 % (spec §2.3)
  reason?: string; // copy key when not affordable
}

export interface TaskOption {
  taskId: string;
  title: string;
  astronaut: AstronautId;
  allowed: boolean;
  fallback: boolean;
  reason?: string; // copy key
  costs: Chip[];
  effects: Chip[];
  lesson: string;
}

export type BadgeColour = 'green' | 'yellow' | 'red';

export interface Hud {
  sol: number;
  lastSol: number;
  phase: Phase;
  core: { LS: number; PWR: number; BAT: number; SH: number; shieldTier: number };
  sp: { pending: number; banked: number; goal: number };
  crew: Crew & { badge: BadgeColour };
  systems: Record<SystemKey, number> & { BATMAX: number };
  supplies: Record<SupplyKey, number>;
  astronauts: {
    id: AstronautId;
    callSign: string;
    sickBaySols: number;
    busy: boolean;
    plannedTask: string | null;
  }[];
  crop: Crop | null;
  dustStacks: number;
  flags: string[];
}
