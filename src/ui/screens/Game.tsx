/**
 * The live-action base (D-031…D-033). One day:
 *   alarm  → the camera zooms to the room, the trouble shows, a timer runs, tools appear
 *   mini   → the tool the kid dragged in opens a skill mini-game
 *   result → the crew cheers (or the crew had to choose on its own), numbers fly, a lesson shows
 *   jobs   → send each astronaut to a spot in the base
 *   night  → the day plays out; next morning a new alarm
 * The rules never moved: every tool is one spec card, sent to the same engine as before.
 */
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { CONTENT } from '../../content';
import { copy } from '../../content/copy';
import { reasonText } from '../../content/format';
import { sourceById } from '../../content/sources';
import { STORIES } from '../../content/stories';
import { timeoutId } from '../../engine';
import type {
  AstronautId,
  CardView,
  Chip,
  Command,
  GameState,
  Hud,
  LogEntry,
  Role,
} from '../../engine/types';
import { Avatar, type Mood } from '../components/Avatar';
import { ChipRow } from '../components/Chips';
import { Icon, type UiIcon } from '../components/Icon';
import { InfoTip } from '../components/InfoTip';
import { engine, saveGame } from '../engine';
import { HudBar, type Deltas } from '../game/Hud';
import { MINIS, OWN_KEYS } from '../game/minis';
import { Coach } from '../components/Coach';
import { HOME, Scene, type CrewSprite, type Marker } from '../game/Scene';
import { hush, sfx, type Sfx } from '../game/sfx';
import {
  howTo,
  JOBS,
  pickPlay,
  stageFor,
  toolFor,
  toolName,
  AFTER,
  FX_AMB,
  type Amb,
  type Fx,
  type Play,
  type ToolDef,
} from '../game/tools';
import {
  award,
  BADGE_DEFS,
  domeColor,
  lightColors,
  roverColor,
  newBadges,
  suitColor,
  type BadgeId,
  type Profile,
} from '../meta';
import { actionTitle, fill, kidDate, kidText, logLine, signed, ui } from '../text';

const P = copy.play;
const ROLES: Role[] = ['MGR', 'ENG', 'MED', 'RES'];
type Mode = 'dawn' | 'alarm' | 'mini' | 'result' | 'jobs' | 'night';

const PREVIEW_KEYS = new Set(['LS', 'SH', 'BAT', 'SP', 'DOSE', 'FOOD', 'H2O', 'EN']);
/** One food bar and one water bar (D-043): crew hunger and thirst show on the same bars as the stores. */
const BAR: Record<string, string> = { PWR: 'BAT', FUL: 'FOOD', HYD: 'H2O' };
/** Chips → which bars change and by how much (hover a tool: the bars light up). */
export function previewOfChips(chips: Chip[]): Deltas {
  const p: Deltas = {};
  for (const ch of chips) {
    if (ch.label === 'chip.enmax') continue;
    const k = BAR[ch.icon] ?? ch.icon;
    if (!PREVIEW_KEYS.has(k)) continue;
    const amt = ch.amount ?? (ch.icon === 'DOSE' ? 1 : 0);
    if (amt) p[k] = (p[k] ?? 0) + amt;
  }
  return p;
}

function snapshot(h: Hud): Deltas {
  return {
    LS: h.core.LS,
    BAT: h.core.BAT,
    SH: h.core.SH,
    SP: h.sp.banked,
    WAIT: h.sp.pending,
    DOSE: h.crew.DOSE,
    EN: h.crew.EN,
    FOOD: h.supplies.FOOD,
    H2O: h.supplies.H2O,
  };
}
function diff(a: Deltas, b: Deltas): Deltas {
  const d: Deltas = {};
  for (const k of Object.keys(b)) if (b[k] !== a[k]) d[k] = b[k]! - (a[k] ?? 0);
  return d;
}

/** Skip the steps a kid doesn't need to press through (D-020, D-029). */
export function autoAdvance(s0: GameState): GameState {
  let s = s0;
  for (let i = 0; i < 8 && !s.pending; i++) {
    if (s.phase === 'morning') s = engine.reduce(s, { type: 'CONTINUE' });
    else if (s.phase === 'power') s = engine.reduce(s, { type: 'CONFIRM_POWER' });
    else if (s.phase === 'night') s = engine.reduce(s, { type: 'CONTINUE' });
    else break;
  }
  return s;
}

const freeCrew = (s: GameState) =>
  ROLES.filter((r) => {
    const a = s.astronauts.find((x) => x.id === r)!;
    return a.sickBaySols === 0 && a.busyUntilSol < s.sol;
  });
const planOf = (s: GameState, r: Role) => s.astronauts.find((x) => x.id === r)!.plannedTask;

/** What the crew feels when nothing special is going on: the lowest bars show on their faces. */
function needs(h: Hud): Mood[] {
  const out: Mood[] = [];
  if (h.supplies.FOOD <= 6 || h.crew.FUL <= 8) out.push('hungry');
  if (h.supplies.H2O <= 3 || h.crew.HYD <= 8) out.push('thirsty');
  if (h.core.LS <= 3) out.push('dizzy');
  if (h.crew.EN <= 5) out.push('sleepy');
  if (h.crew.DOSE >= 7) out.push('hot');
  if (!out.length && h.crew.DOSE >= 4) out.push('worried');
  return out;
}

const NEWS = new Set([
  'log.harvest',
  'log.stormDose',
  'log.evaDose',
  'log.backgroundDose',
  'log.spBanked',
  'log.toSickBay',
  'log.broken',
  'log.lsUnpowered',
  'log.hungry',
  'log.thirsty',
  'log.batteryPop',
  'log.indoorOnly',
  'log.taskFailed',
  'log.backFromSickBay',
  'log.fixed',
]);

interface Floater {
  id: number;
  k: string;
  n: number;
  good: boolean;
}
const FLOAT_ICON: Record<string, string> = {
  BAT: 'BAT',
  WAIT: 'FLASK',
  SP: 'SP',
  FUL: 'FOOD',
  HYD: 'H2O',
};

/** The sound each kind of trouble makes while its alarm is on (D-041). */
const FX_SOUND: Partial<Record<Fx, Sfx>> = {
  flare: 'sun',
  rays: 'geiger',
  cloud: 'wind',
  crackle: 'radio',
  battHot: 'hiss',
  dust: 'wind',
  wind: 'wind',
  frost: 'freeze',
  flicker: 'zap',
  fog: 'cough',
  o2stop: 'zap',
  pipe: 'drip',
  shelves: 'growl',
  sneeze: 'sneeze',
  helmet: 'drip',
  rock: 'star',
  labBroken: 'zap',
  antenna: 'radio',
  fight: 'buzz',
};

/** Bars that are in the danger zone right now: shown as red pills on the stage, with a warning sound (D-035). */
function warnings(h: Hud): string[] {
  const w: string[] = [];
  if (h.core.LS <= 3) w.push('LS');
  if (h.core.BAT <= 1) w.push('BAT');
  if (h.supplies.FOOD <= 6 || h.crew.FUL <= 8) w.push('FOOD');
  if (h.supplies.H2O <= 3 || h.crew.HYD <= 8) w.push('H2O');
  if (h.crew.EN <= 5) w.push('EN');
  if (h.crew.DOSE >= 5) w.push('DOSE'); // D-065: warn two steps before the badge turns red
  return w;
}
const WARN_ICON: Record<string, string> = {};

/** The guided first day: `sel` = what Nova points at, `info` = wait for "Next", `mode` = when the step shows. */
const COACH: { key: string; sel: string; info: boolean; mode: Mode; place?: string }[] = [
  { key: 'welcome', sel: '.hud-stars', info: true, mode: 'alarm' },
  { key: 'base', sel: '.hud-group.base', info: true, mode: 'alarm' },
  { key: 'badge', sel: '.badge-m', info: true, mode: 'alarm' },
  { key: 'crew', sel: '.hud-group.crew', info: true, mode: 'alarm' },
  { key: 'tools', sel: '.tray', info: false, mode: 'alarm', place: '.stage' },
  { key: 'mini', sel: '.mini-head', info: false, mode: 'mini' },
  { key: 'jobs', sel: '.tray', info: false, mode: 'jobs', place: '.stage' },
  { key: 'start', sel: '.btn.start', info: false, mode: 'jobs', place: '.stage' },
  { key: 'night', sel: '.stage', info: true, mode: 'alarm' },
];

export function Game(props: {
  initial: GameState;
  tutorial: boolean;
  timerSeconds: number; // 0 = off (Settings)
  skill: boolean; // mini-games on
  sound: boolean;
  voice: boolean; // Nova reads the tutorial out loud
  onSound: () => void;
  paused: boolean; // a menu or help window is open
  profile: Profile;
  onProfile: (p: Profile) => void;
  onTutorialEnd: () => void;
  onEnd: (s: GameState, miniWins: number, fastWins: number) => void;
  onMenu: () => void;
  onHelp: () => void;
}) {
  const [s, setS] = useState<GameState>(() => autoAdvance(props.initial));
  const [mode, setMode] = useState<Mode>('dawn');
  const [tool, setTool] = useState<{ card: CardView; def: ToolDef; play: Play } | null>(null);
  const [outcome, setOutcome] = useState<{
    win: boolean;
    title: string;
    lesson: string;
    icon: UiIcon;
    costs: Chip[];
    gives: Chip[];
    later: Chip[]; // what may still happen because of this choice
  } | null>(null);
  const [left, setLeft] = useState(props.timerSeconds);
  const [miniLeft, setMiniLeft] = useState(0);
  const [hover, setHover] = useState<Deltas | null>(null);
  const [flash, setFlash] = useState<Deltas>({});
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [stars, setStars] = useState<{ id: number; dx: number; dy: number }[]>([]);
  const [current, setCurrent] = useState<AstronautId | null>(null);
  const [news, setNews] = useState<LogEntry[]>([]);
  const [fly, setFly] = useState<{
    x: number;
    y: number;
    dx: number;
    dy: number;
    def: ToolDef;
  } | null>(null);
  const [assist, setAssist] = useState(0);
  const [shake, setShake] = useState(false);
  const [coach, setCoach] = useState<number | null>(props.tutorial ? 0 : null);
  const [toasts, setToasts] = useState<{ id: number; badge: BadgeId }[]>([]);

  const timers = useRef<number[]>([]);
  const miniWins = useRef(0);
  const fastWins = useRef(0);
  const lastPlan = useRef<Partial<Record<Role, string>>>({});
  const nextId = useRef(1);
  const busy = useRef(false); // one result at a time (a tap and the timer can race)
  const stageRef = useRef<HTMLDivElement>(null);
  const profile = useRef(props.profile);
  profile.current = props.profile;
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const hud = useMemo(() => engine.hud(s), [s]);
  const cards = useMemo(() => (s.pending ? engine.shownCards(s) : []), [s]);
  const pending = s.pending;
  const ev = pending ? CONTENT.events[pending.eventId]! : null;
  const stage = pending ? stageFor(pending.eventId) : null;
  const guide = coach !== null;
  const survival = s.mission === 'M9';
  /** Seconds for today's alarm and mini-game. Survival: a little less every day, down to 4 s on day 16. */
  const clock =
    survival && props.timerSeconds > 4
      ? Math.max(4, props.timerSeconds - ((s.sol - 1) * (props.timerSeconds - 4)) / 15)
      : props.timerSeconds;
  const timed = !!pending && pending.slot === 'event' && props.timerSeconds > 0 && !guide;
  const miniTotal = clock;

  const baseMode = (x: GameState): Mode =>
    x.pending ? 'alarm' : x.phase === 'tasks' ? 'jobs' : 'alarm';
  const firstFree = (x: GameState): AstronautId | null =>
    freeCrew(x).find((r) => !planOf(x, r) && engine.availableTasks(x, r).some((o) => o.allowed)) ??
    null;

  /** Badges pop the moment they are earned, with a bell, and pay stars into the bank (D-038). */
  const checkBadges = (x: GameState, base: Profile = profile.current) => {
    const got = newBadges(
      { s: x, miniWins: miniWins.current, fastWins: fastWins.current, ended: false },
      base,
    );
    if (got.length || base !== profile.current) {
      const next = award(base, got);
      profile.current = next;
      props.onProfile(next);
    }
    if (!got.length) return;
    const batch = got.map((badge) => ({ id: nextId.current++, badge }));
    setToasts((t) => [...t, ...batch]);
    batch.forEach((_, i) => later(() => sfx('ting'), i * 500));
    later(() => setToasts((t) => t.filter((x2) => !batch.includes(x2))), 4500 + got.length * 500);
  };

  /** Show what a step changed: numbers fly, bars flash, stars travel to the counter. */
  const celebrate = (before: Deltas, after: GameState) => {
    const d = diff(before, snapshot(engine.hud(after)));
    const keys = Object.keys(d).filter((k) => k !== 'WAIT' || d[k]! > 0);
    if (!keys.length) return;
    setFlash(d);
    later(() => setFlash({}), 2600);
    const fs = keys.slice(0, 7).map((k) => ({
      id: nextId.current++,
      k,
      n: d[k]!,
      good: k === 'DOSE' ? d[k]! < 0 : d[k]! > 0,
    }));
    setFloaters((f) => [...f, ...fs]);
    later(() => setFloaters((f) => f.filter((x) => !fs.includes(x))), 2400);
    if (fs.some((f) => !f.good)) {
      setShake(true);
      later(() => setShake(false), 450);
    }
    const sent = d['SP'] ?? 0;
    if (sent > 0) {
      const from = stageRef.current?.getBoundingClientRect();
      const to = document.querySelector('.hud-stars')?.getBoundingClientRect();
      if (from && to) {
        const batch = Array.from({ length: Math.min(8, sent) }, () => ({
          id: nextId.current++,
          dx: to.left + to.width / 2 - (from.left + from.width / 2),
          dy: to.top + to.height / 2 - (from.top + from.height / 2),
        }));
        setStars(batch);
        batch.forEach((_, i) => later(() => sfx('star'), 500 + i * 110));
        later(() => setStars([]), 2200);
      }
    }
  };

  const enter = (x: GameState) => {
    busy.current = false;
    const m = baseMode(x);
    setMode(m);
    setTool(null);
    setOutcome(null);
    setAssist(0);
    if (m === 'alarm') {
      setLeft(
        x.mission === 'M9' && props.timerSeconds > 4
          ? Math.max(4, props.timerSeconds - ((x.sol - 1) * (props.timerSeconds - 4)) / 15)
          : props.timerSeconds,
      );
      sfx('alarm');
    } else setCurrent(firstFree(x));
  };

  // first frame: a short "good morning", then the day's alarm
  useEffect(() => {
    sfx('morning');
    later(() => enter(s), 1000);
  }, []);

  // the trouble makes its own noise while the alarm is on
  useEffect(() => {
    const name = stage?.fx.map((f) => FX_SOUND[f]).find(Boolean);
    if (mode !== 'alarm' || !name || props.paused) return;
    const first = window.setTimeout(() => sfx(name), 550);
    const loop = window.setInterval(() => !document.hidden && sfx(name), 2600);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(loop);
    };
  }, [mode, pending?.eventId, s.sol, props.paused]);

  // bars in the danger zone: a warning sound when a new one joins
  const warn = warnings(hud);
  const warnKey = warn.join(',');
  const warnCount = useRef(0);
  useEffect(() => {
    if (warn.length > warnCount.current)
      later(() => sfx(warn.includes('FOOD') ? 'growl' : 'warn'), 700);
    warnCount.current = warn.length;
  }, [warnKey]);

  /** Send one card to the engine, then show the result. */
  const resolve = (actionId: string, viaTimeout: boolean) => {
    if (!pending || busy.current) return;
    const before = snapshot(hud);
    let next = engine.reduce(s, { type: 'CHOOSE', actionId });
    if (next.choices.length === s.choices.length) {
      // the engine said no (nothing affordable): wait a day, or take any card that works
      const alt = cards.find((c) => c.affordable)?.id ?? `${pending.eventId}.wait`;
      next = engine.reduce(s, { type: 'CHOOSE', actionId: alt });
      if (next.choices.length === s.choices.length) return;
    }
    busy.current = true;
    const done = next.choices[next.choices.length - 1]!.actionId;
    const def = CONTENT.events[pending.eventId]?.actions.find((a) => a.id === done);
    setOutcome({
      win: !viaTimeout,
      title: viaTimeout
        ? fill(P.crewChose, { card: actionTitle(done) })
        : toolName(done, actionTitle(done)),
      lesson: def?.lesson ?? '',
      // D-061: the scene after a choice shows, big, what it cost and what it gave
      icon: toolFor(done).icon,
      costs: cards.find((c) => c.id === done)?.costs ?? [],
      gives: cards.find((c) => c.id === done)?.effects ?? [],
      later: cards.find((c) => c.id === done)?.later ?? [],
    });
    setS(next);
    saveGame(next.phase === 'ended' ? null : next);
    setMode('result');
    setTool(null);
    setHover(null);
    sfx(viaTimeout ? 'boom' : 'win');
    if (viaTimeout) {
      setShake(true);
      later(() => setShake(false), 600);
    }
    later(() => celebrate(before, next), 250);
    later(() => checkBadges(next), 900);
    later(
      () => {
        if (next.phase === 'ended') return props.onEnd(next, miniWins.current, fastWins.current);
        const after = autoAdvance(next);
        setS(after);
        saveGame(after);
        enter(after);
      },
      viaTimeout ? 3000 : 2400,
    );
  };

  /** A tool was picked: it flies to the trouble spot, then its mini-game opens. */
  const pick = (card: CardView, from?: Element) => {
    if (mode !== 'alarm' || !card.affordable || fly) return;
    const def = toolFor(card.id);
    const play = props.skill ? pickPlay(def, !guide) : null;
    const go = () => {
      setFly(null);
      if (!play) return resolve(card.id, false);
      setTool({ card, def, play });
      setMiniLeft(miniTotal);
      setAssist(0);
      setMode('mini');
    };
    const a = from?.getBoundingClientRect();
    const b = stageRef.current?.getBoundingClientRect();
    sfx('fly');
    if (!a || !b) return go();
    const x = a.left + a.width / 2;
    const y = a.top + 30;
    setFly({ x, y, dx: b.left + b.width / 2 - x, dy: b.top + b.height / 2 - y, def });
    later(go, 430);
  };

  // the alarm timer and the mini-game timer (paused in menus and hidden tabs)
  useEffect(() => {
    if (props.paused || !timed || fly || (mode !== 'alarm' && mode !== 'mini')) return;
    const t = window.setInterval(() => {
      if (document.hidden) return;
      if (mode === 'alarm') setLeft((x) => x - 0.1);
      else setMiniLeft((x) => x - 0.1);
    }, 100);
    return () => window.clearInterval(t);
  }, [mode, timed, props.paused, !!fly]);
  const secs = Math.max(0, Math.ceil(mode === 'mini' ? miniLeft : left));
  useEffect(() => {
    if (timed && (mode === 'alarm' || mode === 'mini') && secs <= 3 && secs > 0) sfx('tick');
  }, [secs]);
  useEffect(() => {
    if (!timed || !pending) return;
    if ((mode === 'alarm' && left <= 0) || (mode === 'mini' && miniLeft <= 0))
      resolve(timeoutId(pending.eventId), true);
  }, [left, miniLeft]);

  // keyboard help for the mini-games that need a pointer
  useEffect(() => {
    if (mode !== 'mini' || !tool || OWN_KEYS.has(tool.play.mech)) return;
    const h = (e: KeyboardEvent) => {
      if (e.key !== ' ' && e.key !== 'Enter') return;
      e.preventDefault();
      if (!e.repeat) setAssist((n) => n + 1);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [mode, tool]);
  const winMini = () => {
    if (!tool) return;
    miniWins.current += 1;
    if (timed && miniLeft > miniTotal / 2) fastWins.current += 1;
    profile.current = { ...profile.current, fixes: profile.current.fixes + 1 };
    props.onProfile(profile.current);
    resolve(tool.card.id, false);
  };
  useEffect(() => {
    if (assist >= 10) winMini();
  }, [assist]);

  // ── jobs ──
  const free = freeCrew(s);
  const who = mode === 'jobs' && current && free.includes(current) ? current : null;
  const options = useMemo(() => (who ? engine.availableTasks(s, who) : []), [s, who]);
  const canStart = free.every(
    (r) => planOf(s, r) || !engine.availableTasks(s, r).some((o) => o.allowed),
  );
  const plan = (taskId: string) => {
    if (!who) return;
    const next = engine.reduce(s, { type: 'PLAN_TASK', astronaut: who, taskId });
    if (planOf(next, who) !== taskId) return;
    sfx('steps');
    setS(next);
    saveGame(next);
    setHover(null);
    setCurrent(firstFree(next));
  };
  const startDay = () => {
    const before = snapshot(hud);
    lastPlan.current = Object.fromEntries(ROLES.map((r) => [r, planOf(s, r) ?? '']));
    const next = engine.reduce(s, { type: 'CONFIRM_TASKS' } as Command);
    setS(next);
    setMode('night');
    setHover(null);
    sfx('night');
    setNews(
      next.log
        .filter(
          (e) =>
            e.sol === s.sol &&
            NEWS.has(e.key) &&
            !(e.key === 'log.spBanked' && e.params?.['sp'] === 0),
        )
        .slice(-4),
    );
    later(() => celebrate(before, next), 700);
    later(() => checkBadges(next), 1300);
    later(() => {
      if (next.phase === 'ended') return props.onEnd(next, miniWins.current, fastWins.current);
      const after = autoAdvance(next);
      saveGame(after);
      setS(after);
      setMode('dawn');
      sfx('morning');
      later(() => {
        setNews([]);
        enter(after);
      }, 1100);
    }, 2900);
  };

  // ── the guided first day (D-039) ──
  const endCoach = () => {
    setCoach(null);
    hush();
    setLeft(clock);
    props.onTutorialEnd();
  };
  useEffect(() => {
    if (coach === null) return;
    const key = COACH[coach]!.key;
    if (key === 'tools' && mode !== 'alarm' && mode !== 'dawn') setCoach(coach + 1);
    if (key === 'mini' && (mode === 'result' || mode === 'jobs')) setCoach(coach + 1);
    if (key === 'tools' && mode === 'jobs') setCoach(coach + 2); // no mini-game was played
    if (key === 'jobs' && mode === 'jobs' && canStart) setCoach(coach + 1);
    if (key === 'start' && (mode === 'night' || mode === 'dawn')) setCoach(coach + 1);
    if (key === 'night' && s.sol < 2 && mode === 'alarm') return;
  }, [coach, mode, canStart, s.sol]);
  const step = coach !== null ? COACH[coach]! : null;
  const stepShown =
    !!step &&
    step.mode === mode &&
    !fly &&
    !(step.key === 'night' && s.sol < 2) &&
    !(step.key === 'welcome' && s.sol > 1);

  // ── what the scene shows ──
  const showTrouble = !!stage && (mode === 'alarm' || mode === 'mini');
  const need = needs(hud);
  const moods = {} as Record<Role, Mood>;
  const sprites: CrewSprite[] = ROLES.map((r, i) => {
    const a = s.astronauts.find((x) => x.id === r)!;
    let pos = HOME[r];
    let mood: Mood = need.length ? need[i % need.length]! : 'happy';
    const job = mode === 'night' ? lastPlan.current[r] : mode === 'jobs' ? a.plannedTask : null;
    if (job && JOBS[job]) pos = { x: JOBS[job].x + (i - 1.5) * 5, y: JOBS[job].y };
    if (showTrouble && pending) {
      const named = pending.nameTarget === r;
      if (stage?.mood && (!pending.nameTarget || named)) mood = stage.mood as Mood;
      if (pending.eventId === 'MG-03' && (r === 'ENG' || r === 'RES')) {
        pos = { x: r === 'ENG' ? 182 : 220, y: 134 };
        mood = 'angry';
      }
      if (pending.eventId === 'CR-02' && named) {
        pos = { x: 104, y: 190 };
        mood = 'sleepy';
      }
      if (pending.eventId === 'CR-05' && named) pos = { x: 238, y: 66 };
    }
    if (mode === 'result' && outcome) mood = outcome.win ? 'cheer' : 'worried';
    if (mode === 'night') mood = job === 'T-REST' ? 'sleepy' : mood;
    const sick = a.sickBaySols > 0;
    if (sick) {
      pos = { x: 110, y: i % 2 ? 176 : 160 };
      mood = 'sick';
    }
    moods[r] = mood;
    return { id: r, x: pos.x, y: pos.y, mood, lying: sick, selected: who === r };
  });
  const markers: Marker[] = who
    ? options
        .filter((o) => o.allowed && JOBS[o.taskId])
        .map((o) => ({
          id: o.taskId,
          x: JOBS[o.taskId]!.x,
          y: JOBS[o.taskId]!.y,
          icon: JOBS[o.taskId]!.icon,
          chosen: planOf(s, who) === o.taskId,
          label: ui.jobNames[o.taskId] ?? o.title,
        }))
    : [];
  // D-046: the whole screen takes the mood of the trouble, and of what the last choice left behind
  const today = [...s.choices].reverse().find((c) => c.sol === s.sol);
  const amb: Amb | null =
    showTrouble && stage
      ? (stage.fx.map((f) => FX_AMB[f]).find(Boolean) ?? null)
      : mode === 'dawn'
        ? null
        : today && AFTER[today.actionId]
          ? AFTER[today.actionId]!
          : hud.crew.DOSE >= 7
            ? 'rad'
            : hud.core.LS <= 3
              ? 'fog'
              : hud.dustStacks >= 2
                ? 'dust'
                : null;
  const grow = s.crop ? Math.max(0.2, Math.min(1, 1 - (s.crop.readySol - s.sol) / 2)) : 0.1;
  const preview = hover ?? flash;
  const hoverOn = (chips: Chip[]) => ({
    onMouseEnter: () => setHover(previewOfChips(chips)),
    onMouseLeave: () => setHover(null),
    onFocus: () => setHover(previewOfChips(chips)),
    onBlur: () => setHover(null),
  });

  const story = ev ? STORIES[ev.id] : undefined;
  const Mini = tool ? MINIS[tool.play.mech] : null;
  const danger = timed && (mode === 'alarm' || mode === 'mini') && secs <= 3;

  return (
    <div
      class={`play mode-${mode} ${danger ? 'danger' : ''} ${shake ? 'shake' : ''} ${warn.length ? 'critical' : ''}`}
    >
      <HudBar
        h={hud}
        d={preview}
        moods={moods}
        suit={suitColor(props.profile)}
        sound={props.sound}
        onSound={props.onSound}
        onHelp={props.onHelp}
        onMenu={props.onMenu}
        survival={survival}
      />
      <main class="play-main">
        <div
          ref={stageRef}
          class={`stage ${mode === 'result' ? (outcome?.win ? 'win' : 'fail') : ''} ${showTrouble && mode === 'alarm' ? 'alarmed' : ''}`}
        >
          <Scene
            hud={hud}
            focus={showTrouble && stage ? stage.room : null}
            fx={showTrouble && stage ? stage.fx : []}
            spot={showTrouble && stage?.at ? stage.at : null}
            night={mode === 'night'}
            crew={sprites}
            markers={markers}
            onMarker={plan}
            suit={suitColor(props.profile)}
            lights={lightColors(props.profile)}
            extras={props.profile.extras}
            dome={domeColor(props.profile)}
            rover={roverColor(props.profile)}
            scorched={s.systems.BATMAX < 10}
            grow={grow}
            food={s.supplies.FOOD}
            water={s.supplies.H2O}
            amb={amb}
            flags={hud.flags}
          />
          {pending && ev && stage && (mode === 'alarm' || mode === 'mini') && (
            <div class="alert">
              <span class="alert-tag">
                {pending.slot === 'event' ? P.alert : `${ui.sol} ${s.sol}`} · {P.rooms[stage.room]}
              </span>
              <h2 class="alert-title" tabIndex={-1}>
                {ev.title}
              </h2>
              {story && (
                <InfoTip label={ui.realStory}>
                  {story.trueStory}{' '}
                  {story.sources.map((id) => (
                    <a
                      key={id}
                      href={sourceById(id)?.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="src-link"
                    >
                      [{id}]
                    </a>
                  ))}
                </InfoTip>
              )}
              {pending.donki && (
                <span class="data-badge">
                  <Icon name="DATA" size={16} /> {ui.realData} · {kidDate(pending.donki.date)}
                  <InfoTip label={ui.realData}>
                    {pending.donki.label} {ui.replay}.
                    {pending.donki.fetchedAt
                      ? ` ${fill(ui.archived, { date: pending.donki.fetchedAt.slice(0, 10) })}.`
                      : ''}{' '}
                    {ui.honestyStorm}{' '}
                    {pending.donki.sourceUrl && (
                      <a href={pending.donki.sourceUrl} target="_blank" rel="noopener noreferrer">
                        {ui.seeRecord}
                      </a>
                    )}
                  </InfoTip>
                </span>
              )}
            </div>
          )}
          {timed && (mode === 'alarm' || mode === 'mini') && (
            <span
              class="timer"
              role="timer"
              aria-label={fill(ui.secondsLeft, { n: secs })}
              style={
                {
                  '--p': `${(100 * (mode === 'mini' ? miniLeft / miniTotal : left / clock)).toFixed(1)}%`,
                } as Record<string, string>
              }
            >
              <span class="num">{secs}</span>
            </span>
          )}
          {mode === 'dawn' && (
            <div class="banner" role="status">
              <Icon name="SUN" size={30} color="var(--star)" /> {fill(P.morning, { sol: s.sol })}
              {s.sol === s.lastSol && <small>{P.lastSol}</small>}
            </div>
          )}
          {mode === 'night' && (
            <div class="banner" role="status">
              <Icon name="MOON" size={30} color="var(--sky)" /> {P.night}
            </div>
          )}
          {mode === 'result' && outcome && (
            <div class={`verdict ${outcome.win ? 'good' : 'bad'}`} role="status">
              <b class="verdict-title">{outcome.win ? P.great : P.tooSlow}</b>
              <span class="verdict-tool">
                <span class="tool-icon">
                  <Icon name={outcome.icon} size={40} />
                </span>
                {outcome.title}
              </span>
              {outcome.costs.length > 0 && (
                <div class="verdict-row cost">
                  <em>{P.costs}</em>
                  <ChipRow chips={outcome.costs} />
                </div>
              )}
              {outcome.gives.length > 0 && (
                <div class="verdict-row give">
                  <em>{P.gives}</em>
                  <ChipRow chips={outcome.gives} />
                </div>
              )}
              {outcome.later.length > 0 && (
                <div class="verdict-row later">
                  <em>{P.later}</em>
                  <ChipRow chips={outcome.later} />
                </div>
              )}
            </div>
          )}
          {warn.length > 0 && mode !== 'mini' && (
            <ul class="warn-strip" role="alert">
              {warn.map((k) => (
                <li key={k}>
                  <Icon name={(WARN_ICON[k] ?? k) as 'LS'} size={20} />
                  {k === 'DOSE' && hud.crew.DOSE < 7 ? (
                    copy.warn.rising
                  ) : (
                    <>
                      <b>{k === 'DOSE' ? copy.warn.high : copy.warn.low}</b> {copy.warn.names[k]}
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
          {amb && <div class={`amb amb-${amb}`} aria-hidden="true" />}
          <div class="floaters" aria-live="polite">
            {floaters.map((f, i) => (
              <span
                key={f.id}
                class={`floater ${f.good ? 'up' : 'down'}`}
                style={{ '--i': i } as Record<string, number>}
              >
                <Icon name={(FLOAT_ICON[f.k] ?? f.k) as 'SP'} size={20} /> {signed(f.n)}
              </span>
            ))}
            {stars.map((st, i) => (
              <span
                key={st.id}
                class="fly-star"
                style={
                  { '--dx': `${st.dx}px`, '--dy': `${st.dy}px`, '--i': i } as Record<
                    string,
                    string | number
                  >
                }
              >
                <Icon name="SP" size={26} color="var(--star)" />
              </span>
            ))}
          </div>
        </div>

        <section class="tray" aria-live="polite">
          {mode === 'alarm' && pending && ev && (
            <>
              <p class="tray-text">
                {kidText(s, ev.kidText)}{' '}
                <span class="hint-inline">{guide ? P.firstHint : P.dragHint}</span>
              </p>
              <div class={`tools n${cards.length}`} role="group" aria-label={P.dragHint}>
                {cards.map((c) => {
                  const def = toolFor(c.id);
                  const name = toolName(c.id, c.title);
                  const ruleLost = c.costs.some(
                    (x) => x.icon === 'LOST' && x.label?.startsWith('chip.'),
                  );
                  const costs = ruleLost
                    ? c.costs.filter((x) => !(x.icon === 'LOST' && !x.label?.startsWith('chip.')))
                    : c.costs;
                  const risk = c.risk
                    ? s.tier === 'cadet'
                      ? c.risk.words
                      : `${c.risk.pct}%`
                    : undefined;
                  return (
                    <button
                      key={c.id}
                      class="tool"
                      disabled={!c.affordable}
                      title={c.id.endsWith('.wait') ? name : c.title}
                      onClick={(e) => pick(c, e.currentTarget as Element)}
                      {...hoverOn([...c.costs, ...c.effects])}
                    >
                      <span class="tool-icon">
                        <Icon name={def.icon} size={34} />
                      </span>
                      <span class="tool-name">{name}</span>
                      <span class="trade cost">
                        <em>{P.costs}</em>
                        <ChipRow compact chips={costs} />
                      </span>
                      <span class="trade give">
                        <em>{P.gives}</em>
                        <ChipRow compact chips={c.effects} />
                      </span>
                      <span class="trade later">
                        <em>{P.later}</em>
                        <ChipRow compact chips={c.later} {...(risk ? { risk } : {})} />
                      </span>
                      {!c.affordable && c.reason && (
                        <span class="choice-reason">{reasonText(c.reason)}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
          {mode === 'result' && outcome && (
            <div class="lesson-box">
              <p class="tray-text">
                <b>{outcome.title}</b>
              </p>
              {outcome.lesson && (
                <p class="lesson">
                  <Icon name="SP" color="var(--star)" /> <b>{ui.youLearned}:</b> {outcome.lesson}
                </p>
              )}
            </div>
          )}
          {mode === 'jobs' && (
            <>
              <div class="jobs-head">
                <ol class="turns" aria-label={ui.jobsTitle}>
                  {free.map((r) => {
                    const x = s.astronauts.find((y) => y.id === r)!;
                    return (
                      <li key={r}>
                        <button
                          class={`turn ${who === r ? 'now' : ''} ${x.plannedTask ? 'done' : ''}`}
                          aria-current={who === r ? 'step' : undefined}
                          aria-label={`${x.callSign}${x.plannedTask ? `: ${ui.jobNames[x.plannedTask] ?? ''}` : ''}`}
                          onClick={() => setCurrent(r)}
                        >
                          <Avatar
                            role={r}
                            size={32}
                            mood={moods[r]}
                            suit={suitColor(props.profile)}
                          />
                          {x.plannedTask && <Icon name="CHECK" size={14} />}
                        </button>
                      </li>
                    );
                  })}
                </ol>
                <p class="tray-text">
                  {who
                    ? fill(P.jobFor, { name: s.astronauts.find((x) => x.id === who)!.callSign })
                    : free.length
                      ? ui.allSet
                      : P.noJobs}
                </p>
                <button
                  class={`btn btn-go start ${canStart ? 'ready' : ''}`}
                  disabled={!canStart}
                  onClick={startDay}
                >
                  {P.startDay} <Icon name="ARROW" />
                </button>
              </div>
              {who && (
                <div class="tools n3" role="group" aria-label={ui.jobsTitle}>
                  {options.map((o) => {
                    const gain = o.effects.find((c) => c.tone === 'effect');
                    const chips = [
                      ...o.costs.filter((c) => c.amount !== undefined || c.icon === 'DOSE'),
                      ...(gain ? [gain] : []),
                    ];
                    const chosen = planOf(s, who) === o.taskId;
                    return (
                      <button
                        key={o.taskId}
                        class={`tool job ${chosen ? 'chosen' : ''}`}
                        aria-pressed={chosen}
                        disabled={!o.allowed && !chosen}
                        onClick={() => plan(o.taskId)}
                        {...hoverOn(chips)}
                      >
                        <span class="tool-icon">
                          <Icon name={JOBS[o.taskId]?.icon ?? 'RULE'} size={30} />
                        </span>
                        <span class="tool-name">{ui.jobNames[o.taskId] ?? o.title}</span>
                        <ChipRow compact chips={chips} />
                        {!o.allowed && o.reason && (
                          <span class="choice-reason">{reasonText(o.reason)}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
          {(mode === 'night' || mode === 'dawn') && (
            <ul class="news">
              {news.map((l, i) => (
                <li key={i} style={{ '--i': i } as Record<string, number>}>
                  <Icon
                    name={
                      l.key === 'log.spBanked'
                        ? 'SP'
                        : l.kind === 'harvest'
                          ? 'SPROUT'
                          : l.kind === 'dose'
                            ? 'DOSE'
                            : 'EVENT'
                    }
                    size={18}
                  />{' '}
                  {logLine(l)}
                </li>
              ))}
            </ul>
          )}
        </section>

        {mode === 'mini' && tool && Mini && (
          <div class="mini" role="dialog" aria-label={toolName(tool.card.id, tool.card.title)}>
            <div class="mini-head">
              <span class="tool-icon">
                <Icon name={tool.def.icon} size={28} />
              </span>
              <div>
                <b>{toolName(tool.card.id, tool.card.title)}</b>
                <p>{howTo(tool.play)}</p>
              </div>
              {!timed && (
                <button class="btn btn-small" onClick={() => setMode('alarm')}>
                  ← {copy.back}
                </button>
              )}
            </div>
            {timed && (
              <div class="mini-time" aria-hidden="true">
                <i style={{ width: `${Math.max(0, (100 * miniLeft) / miniTotal)}%` }} />
              </div>
            )}
            <div class="mini-field">
              <Mini key={tool.card.id} p={tool.play.p ?? {}} onWin={winMini} />
            </div>
            {!OWN_KEYS.has(tool.play.mech) && (
              <p class="mini-keys">
                {P.keyHelp}
                {assist > 0 ? ` (${assist}/10)` : ''}
              </p>
            )}
          </div>
        )}
      </main>
      {fly && (
        <span
          class="tool-fly"
          style={
            {
              left: `${fly.x}px`,
              top: `${fly.y}px`,
              '--dx': `${fly.dx}px`,
              '--dy': `${fly.dy}px`,
            } as Record<string, string>
          }
          aria-hidden="true"
        >
          <Icon name={fly.def.icon} size={40} />
        </span>
      )}
      <ul class="toasts" aria-live="polite">
        {toasts.map((t) => (
          <li key={t.id} class="toast-badge">
            <span class="medal">
              <Icon name="MEDAL" size={26} />
            </span>
            <span>
              <small>{copy.badges.newBadge}</small>
              <b>{copy.badges.names[t.badge]}</b>
            </span>
            <span class="toast-stars num">
              <Icon name="SP" size={18} color="var(--star)" /> +{BADGE_DEFS[t.badge].stars}
            </span>
          </li>
        ))}
      </ul>
      {step && stepShown && (
        <Coach
          text={fill(
            copy.coach.steps[survival && step.key === 'welcome' ? 'welcomeSurvival' : step.key]!,
            { goal: s.sp.goal, sols: s.lastSol },
          )}
          voice={props.voice}
          target={step.sel}
          place={step.place ?? null}
          onNext={
            step.info
              ? () => (coach! + 1 >= COACH.length ? endCoach() : setCoach(coach! + 1))
              : null
          }
          onSkip={endCoach}
          n={coach! + 1}
          total={COACH.length}
        />
      )}
    </div>
  );
}
