/**
 * Mars Base Adventure: engine contract v1 (owned by lane E).
 *
 * This file + the API in `index.ts` are the contract between engine, content and UI.
 * Any change must be logged in PROGRESS.md → Contract changes (what, why, who must adapt).
 *
 * Rules: pure data, JSON-serialisable (no classes, no functions, no Date, no Map/Set).
 * Based on spec §10 (events-and-actions.md v0.3) + decisions D-001…D-016.
 */

// ───────────────────────── basic vocab ─────────────────────────

export type Tier = 'cadet' | 'commander';
export type Role = 'MGR' | 'ENG' | 'MED' | 'RES';
/** One astronaut per role, so the role doubles as the astronaut id. */
export type AstronautId = Role;
export type MissionId = 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7' | 'M8' | 'M9';
export type DeckType = 'core' | 'mission' | 'chain' | 'condition' | 'timer' | 'donki' | 'setup';

/** Base systems (0–10, BAT max can drop, see PW-01). */
export type SystemKey = 'LS' | 'SH' | 'LAB' | 'BAT';
/** Supplies (spec §2.1). */
export type SupplyKey = 'FOOD' | 'H2O' | 'O2T' | 'PARTS' | 'MEDKIT';
/** Astronaut stats (spec §2.2). ENMAX = max energy cap. */
export type StatKey = 'FUL' | 'HYD' | 'AIR' | 'EN' | 'DOSE' | 'ENMAX';

/** Who can play a card / do a task (spec §3, §4). */
export type Who =
  | Role
  | 'ANY'
  | 'EVA' // astronauts outside today
  | 'NAME' // the astronaut the event is about ([Name])
  | Role[] // e.g. ['ENG', 'ANY'] = engineer + one helper
  | ['ANY', 'ANY'];

/** Effect targets for astronaut stats (spec §3). */
export type Target = 'ALL' | 'ME' | 'EVA' | 'PICK' | 'NAME' | Role;

// ───────────────────────── effects ─────────────────────────

/** One parsed effect token from the spec notation (parsed by notation.ts). */
export type Effect =
  | { kind: 'system'; key: SystemKey | 'PWR' | 'SP' | 'BATMAX'; delta: number }
  | { kind: 'supply'; key: SupplyKey; delta: number }
  | { kind: 'stat'; target: Target; stat: StatKey; delta: number }
  | { kind: 'flag'; op: 'set' | 'clear'; flag: string; sols?: number } // e.g. broken:o2maker (D-012)
  | { kind: 'trigger'; event: string } // → EVT-ID
  | { kind: 'lost'; what: string } // LOST: … (a lost chance counts as a cost)
  | { kind: 'hook'; hook: string; args?: Record<string, string | number | boolean> }; // prose cells → hooks.ts

/** ⏳N: effects, optionally with p= chance. A ⏳ with no N means ⏳1 (D-012). */
export interface Delayed {
  inSols: number;
  chance?: number; // 0–1
  effects: Effect[];
}

/** A Delayed effect that has been scheduled in a running game. */
export interface ScheduledEffect extends Delayed {
  id: string;
  dueSol: number;
  source: string; // card or task id that caused it
  actor?: AstronautId; // resolves ME / PICK / NAME later
}

/** A timed or permanent modifier (e.g. "lab off 2 sols", "solar ×0.3 for 3 sols"). */
export interface Modifier {
  id: string;
  source: string; // card id
  kind: string; // e.g. 'labOff', 'solarMult', 'greenhouseOff', 'enmax', 'rationing'
  value?: number;
  target?: AstronautId;
  solsLeft: number | null; // null = until cleared
}

// ───────────────────────── content definitions ─────────────────────────

export interface ActionDef {
  id: string; // 'SW-02.a'
  title: string;
  who: Who;
  cadet: boolean; // ★
  costNow: Effect[];
  lostChance?: string;
  effects: Effect[];
  later?: Delayed[];
  lesson: string; // ≤ 12 words (N-02)
  tags?: 'repair'[]; // D-006
  /** The original spec cells, kept for the content checker and debugging. */
  raw?: { who: string; cost: string; effect: string; later: string };
}

export type EventTrigger =
  | {
      kind: 'donki';
      type: 'FLR' | 'SEP' | 'CME' | 'WSAEnlilSimulations' | 'notifications' | 'quiet';
    }
  | { kind: 'condition'; expr: string } // e.g. 'H2O <= 6'
  | { kind: 'timer'; everySols: number }
  | { kind: 'scripted'; sol: number }
  | { kind: 'chain'; from: string }
  | { kind: 'setup' };

export interface EventDef {
  id: string; // 'SW-02'
  title: string;
  icon: string;
  systems: string[];
  tier: Tier; // lowest tier that sees it
  deck: DeckType[];
  missions: MissionId[] | 'all';
  repeatable?: boolean | number;
  weight?: number; // draw weight (default 1)
  triggers: EventTrigger[];
  warningSols: number;
  briefing?: boolean; // Morning Briefing card (D-004)
  cooldownSols?: number; // ⚠️ conditions: 3 (D-004)
  kidText: string;
  realScience: { text: string; sources: string[] }; // every fact keeps its [S#]
  actions: ActionDef[]; // 2–3
}

export interface TaskDef {
  id: string; // 'T-LAB'
  title: string;
  who: Who;
  cost: Effect[];
  effects: Effect[];
  eva: boolean; // outside: EVA dose applies
  res2x?: boolean; // "RES ×2" (D-006)
  needs?: string; // e.g. 'LAB >= 3'
  unlockedBy?: string; // e.g. 'LS-10'
  lesson: string;
}

export interface Mission {
  id: MissionId;
  name: string;
  site: string;
  sols: { cadet?: number; commander?: number };
  goal: { sp: { cadet?: number; commander?: number }; maxDose?: number; extra?: string };
  missionEvents: string[];
  scripted: { sol: number; event: string; donkiRecord?: string }[];
  startOverrides?: Partial<Record<SupplyKey, number>>;
  donkiWindow?: { start: string; end: string } | 'live-last-60-days' | 'quiet';
  specialRules: string[];
}

// ───────────────────────── game state ─────────────────────────

export interface RngState {
  s: number; // mulberry32 state (uint32)
}

export interface Astronaut {
  id: AstronautId;
  role: Role;
  callSign: string;
  FUL: number;
  HYD: number;
  AIR: number;
  EN: number;
  ENMAX: number;
  DOSE: number;
  sickBaySols: number; // 0 = not in Sick Bay
  sickStat?: Exclude<StatKey, 'DOSE' | 'ENMAX'>; // the stat that hit 0 (reset to 2 on leaving, D-011)
  indoorOnly: boolean; // DOSE reached 10
  plannedTask: string | null; // planned in step 3, resolved at night (D-001)
}

export type CropKind = 'lettuce' | 'radish' | 'pepper';
export interface Crop {
  kind: CropKind;
  plantedSol: number;
  readySol: number;
  tended: boolean; // T-GARDEN at least once (D-013)
  tendedByRes: boolean;
}

export type PoweredSystem = 'LS' | 'recycler' | 'greenhouse';

export interface PowerBudget {
  solar: number; // floor(4 × mult) − dust stacks, min 0 (D-002)
  reactor: number;
  battery: number;
  supply: number; // solar + reactor
  budget: number; // supply + battery
  need: { LS: number; recycler: number; greenhouse: number; heaters: number; tasks: number };
  totalNeed: number;
  shortfall: number; // > 0 → PW-08 shortage mode (D-003)
  plugged: Record<PoweredSystem, boolean>;
}

/** Where the sol loop is (spec §2.4 + D-001/D-003/D-004). */
export type Phase =
  | 'setup' // FD-04, FD-01, (Commander) MG-04, (M9) MG-01 + PW-10
  | 'morning' // report + optional Morning Briefing card
  | 'power' // power plan (PW-08 shortage mode when shortfall > 0)
  | 'tasks' // plan one task per astronaut
  | 'event' // the event slot
  | 'night' // resolved; showing "What happened today"
  | 'ended';

/** The card(s) currently waiting for a choice. */
export interface Pending {
  slot: 'setup' | 'briefing' | 'shortage' | 'event';
  eventId: string;
  offered: string[]; // action ids shown (Cadet: 2, Commander: 3)
  nameTarget?: AstronautId; // [Name] for crew events
  donkiRecord?: DonkiRef;
}

export interface DonkiRef {
  type: string; // 'FLR' | 'SEP' | 'CME' | 'WSAEnlilSimulations' | 'notifications'
  id: string; // e.g. '2024-05-20T05:36:00-CME-001'
  date: string; // real date (YYYY-MM-DD) shown on the card (D-009)
  label: string; // honesty label (spec §5)
  severity?: number; // S
}

export interface LogEntry {
  sol: number;
  kind: 'event' | 'choice' | 'task' | 'power' | 'upkeep' | 'dose' | 'harvest' | 'warning' | 'info';
  /** Key into src/content/copy.ts (all kid-facing strings live there). */
  key: string;
  params?: Record<string, string | number>;
}

export interface ChoiceRecord {
  sol: number;
  eventId: string;
  actionId: string;
  /** Short consequence keys collected later, for the debrief "what it caused". */
  consequences: string[];
  weight: number; // how big its impact was (for "your 3 biggest choices")
}

export type EndingKind = 'success' | 'safe-return' | 'brought-home';
export interface Ending {
  kind: EndingKind;
  sol: number;
  reason: string; // copy key, e.g. 'end.ls-zero-2-sols'
}

export interface Debrief {
  ending: Ending;
  bigChoices: { choice: ChoiceRecord; causedKey: string; nasaDoesKey: string }[]; // top 3
  totals: { spBanked: number; spGoal: number; maxDose: number; solsPlayed: number };
}

export interface GameState {
  version: 1;
  seed: number;
  rng: RngState;
  mission: MissionId;
  tier: Tier;
  sol: number; // 1-based; 0 during setup
  lastSol: number;
  phase: Phase;
  systems: Record<SystemKey, number> & { BATMAX: number };
  supplies: Record<SupplyKey, number>;
  sp: { pending: number; banked: number; goal: number }; // D-005
  astronauts: Astronaut[];
  dust: { stacks: number; multiplier: number; nextStackSol: number };
  power: PowerBudget;
  crop: Crop | null;
  flags: Record<string, number | true>; // number = sols left
  modifiers: Modifier[];
  scheduled: ScheduledEffect[];
  deck: string[]; // shuffled event ids still to draw
  played: string[]; // event ids played (in order)
  cooldowns: Record<string, number>; // event id → sol it is allowed again
  waiting: { eventId: string; sinceSol: number }[]; // displaced chains/conditions (D-004)
  pending: Pending | null;
  log: LogEntry[];
  choices: ChoiceRecord[];
  counters: { lsZeroSols: number; lsUnpoweredSols: number; labTasks: number };
  ending: Ending | null;
}

// ───────────────────────── commands (UI → engine) ─────────────────────────

export interface NewGameOptions {
  mission: MissionId;
  tier: Tier;
  seed?: number; // omitted → caller supplies one (the engine never uses Math.random)
}

export type Command =
  | { type: 'CHOOSE'; actionId: string; pick?: AstronautId } // answers state.pending
  | { type: 'CONTINUE' } // morning report → power, night log → next sol
  | { type: 'SET_POWER'; system: PoweredSystem; on: boolean }
  | { type: 'CONFIRM_POWER' }
  | { type: 'PLAN_TASK'; astronaut: AstronautId; taskId: string | null }
  | { type: 'CONFIRM_TASKS' }
  | { type: 'END_MISSION' }; // MG-02.a style safe return

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
  | 'LOST';

export interface Chip {
  icon: IconName;
  text: string; // e.g. '−2', '+3', '1 in 3', 'lab science today'
  tone: 'cost' | 'effect' | 'later' | 'risk';
}

/** A card ready to render: costs first, then effects, then ⏳ / risk (CLAUDE.md §9). */
export interface CardView {
  id: string;
  title: string;
  whoLabel: string;
  star: boolean;
  costs: Chip[];
  effects: Chip[];
  later: Chip[];
  risk?: { pct: number; words: string };
  lesson: string;
  affordable: boolean;
  reason?: string; // why not affordable
}

export interface TaskOption {
  taskId: string;
  title: string;
  astronaut: AstronautId;
  allowed: boolean;
  fallback: boolean; // not the specialist: +1 EN, 50 % (spec §2.3)
  reason?: string;
  costs: Chip[];
  effects: Chip[];
}

export type BadgeColour = 'green' | 'yellow' | 'red'; // D-010
