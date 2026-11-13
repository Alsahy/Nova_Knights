/** Pure selectors for the UI (PLAN Phase 2 API). Costs first, then effects, then ⏳ / risk (CLAUDE.md §9). */
import { RISK_WORDS } from './config';
import { checkCard, resolveActors, waitId } from './events';
import { multiplier } from './effects';
import { computePower } from './power';
import { doseBadge, shieldTier, stormDoseFor, type StormMode } from './radiation';
import { hasFlag } from './state';
import { checkTask, visibleTasks } from './tasks';
import type {
  ActionDef,
  AstronautId,
  CardView,
  Chip,
  Content,
  Delayed,
  Effect,
  GameState,
  Hud,
  IconName,
  LogEntry,
  PowerBudget,
  TaskOption,
} from './types';

const clone = (s: GameState): GameState => JSON.parse(JSON.stringify(s)) as GameState;

export function riskWords(p: number): string {
  const pct = Math.round(p * 100);
  let best = RISK_WORDS[0]!;
  for (const r of RISK_WORDS) if (Math.abs(r.pct - pct) < Math.abs(best.pct - pct)) best = r;
  return best.words;
}

const HOOK_ICON: Record<string, IconName> = {
  cancelEvaTasks: 'LOST',
  cancelAllTasks: 'LOST',
  cancelTasks: 'LOST',
  cancelNameTask: 'LOST',
  cancelRoleTask: 'LOST',
  labOff: 'LAB',
  labHalf: 'LAB',
  greenhouseOff: 'FOOD',
  cropDelay: 'FOOD',
  cropFaster: 'FOOD',
  plant: 'FOOD',
  batteryUnusable: 'BAT',
  batMax: 'BAT',
  needDelta: 'PWR',
  unplug: 'PWR',
  backupAntenna: 'PWR',
  extraLights: 'PWR',
  dustClear: 'PWR',
  dustHalf: 'PWR',
  dustAdd: 'PWR',
  waitWind: 'PWR',
  solarBonus: 'PWR',
  noEva: 'DOSE',
  evaRace: 'DOSE',
  storm: 'DOSE',
  roomClosed: 'LOST',
  nameBusy: 'EN',
  nameSickBay: 'EN',
  commsOff: 'RULE',
  leak: 'O2T',
  o2Pause: 'O2T',
  scienceKit: 'SP',
  bankSP: 'SP',
  rationing: 'FOOD',
  useReserve: 'FOOD',
  endMission: 'RULE',
  repairsDouble: 'RULE',
  pushOn: 'RISK',
  mg02Limit: 'RULE',
  mg03Vote: 'RULE',
  evaMishap: 'EVENT',
  randomRepairEvent: 'EVENT',
  exercise: 'EN',
  maintLS: 'LS',
  maintLab: 'LAB',
  tend: 'FOOD',
  labTask: 'LAB',
  waterWall: 'SH',
  checkup: 'EN',
  treat: 'MEDKIT',
  peek: 'EVENT',
  callReply: 'EN',
  useKit: 'SP',
  prose: 'RULE',
};
const HIDDEN_HOOKS = new Set(['needComms', 'labTask', 'useKit']);

interface ChipCtx {
  s: GameState;
  evaCount: number;
  headcount: number;
  severity?: number;
  risk: { p: number } | null;
}

function chips(effects: Effect[], tone: Chip['tone'], c: ChipCtx, inSols?: number): Chip[] {
  const out: Chip[] = [];
  const push = (ch: Chip): void => {
    if (inSols) ch.inSols = inSols;
    out.push(ch);
  };
  for (const e of effects) {
    switch (e.kind) {
      case 'system':
        push({ icon: e.key, tone, amount: e.delta });
        break;
      case 'power':
        push({ icon: 'PWR', tone, amount: e.delta });
        break;
      case 'sp':
        push({ icon: 'SP', tone, amount: e.delta });
        break;
      case 'supply':
        push({ icon: e.key, tone, amount: e.delta });
        break;
      case 'stat': {
        const amount = e.delta * multiplier(c.s, e.target, e.stat, c);
        if (amount === 0) break;
        if (e.stat === 'ENMAX') push({ icon: 'EN', tone, amount, label: 'chip.enmax' });
        else push({ icon: e.stat, tone, amount });
        break;
      }
      case 'flag':
        push({ icon: 'RULE', tone, label: `chip.flag.${e.op}.${e.flag.replace(/:/g, '.')}` });
        break;
      case 'trigger':
        push({ icon: 'EVENT', tone, label: 'chip.trigger', params: { id: e.event } });
        break;
      case 'lost':
        push({ icon: 'LOST', tone: tone === 'effect' ? 'cost' : tone, label: e.what });
        break;
      case 'evaDose':
        push({ icon: 'DOSE', tone, label: 'chip.evaDose', params: { n: Math.max(1, c.evaCount) } });
        break;
      case 'chance':
        c.risk = c.risk ?? { p: e.p };
        out.push(...chips(e.effects, 'risk', c, inSols));
        break;
      case 'hook': {
        if (HIDDEN_HOOKS.has(e.hook)) break;
        if (e.hook === 'storm') {
          const dose = stormDoseFor(c.s, c.severity ?? 2, String(e.args[0]) as StormMode);
          push({
            icon: 'DOSE',
            tone,
            amount: dose,
            label: 'chip.storm',
            params: { mode: String(e.args[0]) },
          });
          break;
        }
        const params: Record<string, string | number> = {};
        e.args.forEach((a, i) => (params[`a${i}`] = a));
        push({ icon: HOOK_ICON[e.hook] ?? 'RULE', tone, label: `chip.${e.hook}`, params });
        break;
      }
    }
  }
  return out;
}

function laterChips(later: Delayed[], c: ChipCtx): Chip[] {
  const out: Chip[] = [];
  for (const d of later) {
    if (d.chance !== undefined) c.risk = c.risk ?? { p: d.chance };
    out.push(
      ...chips(d.effects, d.chance !== undefined ? 'risk' : 'later', c, d.inSols || undefined),
    );
  }
  return out;
}

function whoTokens(a: ActionDef): string[] {
  const t: string[] = [...a.who.roles];
  if (a.who.alt.length) t.push(a.who.alt.join('|'));
  for (let i = 0; i < a.who.any; i++) t.push('ANY');
  if (a.who.name) t.push('NAME');
  if (a.who.pick) t.push('PICK');
  if (a.who.evaCrew) t.push('EVA');
  return t;
}

export function cardView(s: GameState, content: Content, a: ActionDef): CardView {
  const p = s.pending;
  const actors = resolveActors(s, a, p, content);
  const c: ChipCtx = { s, evaCount: actors.evaCount, headcount: actors.headcount, risk: null };
  if (p?.severity !== undefined) c.severity = p.severity;
  const costs = chips(a.costNow, 'cost', c);
  const effects = chips(a.effects, 'effect', c);
  const later = laterChips(a.later, c);
  const check = checkCard(s, content, a, p);
  const view: CardView = {
    id: a.id,
    title: a.title,
    who: whoTokens(a),
    star: a.cadet,
    costs,
    effects,
    later,
    lesson: a.lesson,
    affordable: check.ok,
    fallback: check.fallback,
  };
  if (c.risk) view.risk = { pct: Math.round(c.risk.p * 100), words: riskWords(c.risk.p) };
  if (check.reason) view.reason = check.reason;
  return view;
}

/** The cards for state.pending (plus the "We can't fix it today" card when stuck, D-012). */
export function shownCards(s: GameState, content: Content): CardView[] {
  const p = s.pending;
  if (!p) return [];
  const ev = content.events[p.eventId]!;
  const views = p.offered.map((id) =>
    cardView(
      s,
      content,
      ev.actions.find((a) => a.id === id)!,
    ),
  );
  if (p.stuck)
    views.push({
      id: waitId(p.eventId),
      title: 'chip.cantFixToday',
      who: [],
      star: true,
      costs: [{ icon: 'LOST', tone: 'cost', label: 'chip.cantFixToday' }],
      effects: [],
      later: [
        {
          icon: 'EVENT',
          tone: 'later',
          label: 'chip.trigger',
          params: { id: p.eventId },
          inSols: 1,
        },
      ],
      lesson: '',
      affordable: true,
      fallback: false,
    });
  return views;
}

export function availableTasks(
  s: GameState,
  content: Content,
  astronaut: AstronautId,
): TaskOption[] {
  return visibleTasks(s, content).map((t) => {
    const chk = checkTask(s, content, astronaut, t.id);
    const c: ChipCtx = { s, evaCount: t.eva ? 1 : 0, headcount: 1, risk: null };
    const res = t.res2x && astronaut === 'RES';
    const effects = chips(t.effects, 'effect', c).map((ch) =>
      res && ch.icon === 'SP' && ch.amount ? { ...ch, amount: ch.amount * 2 } : ch,
    );
    const opt: TaskOption = {
      taskId: t.id,
      title: t.title,
      astronaut,
      allowed: chk.allowed,
      fallback: chk.fallback,
      costs: chips(t.cost, 'cost', c),
      effects,
      lesson: t.lesson,
    };
    if (chk.reason) opt.reason = chk.reason;
    return opt;
  });
}

export function powerBudget(s: GameState, content: Content): PowerBudget {
  return computePower(clone(s), content);
}

export function hud(s: GameState, content: Content): Hud {
  const b = powerBudget(s, content);
  return {
    sol: s.sol,
    lastSol: s.lastSol,
    phase: s.phase,
    core: {
      LS: s.systems.LS,
      PWR: b.supply,
      BAT: s.systems.BAT,
      SH: s.systems.SH,
      shieldTier: shieldTier(s.systems.SH),
    },
    sp: { ...s.sp },
    crew: { ...s.crew, badge: doseBadge(s.crew.DOSE) },
    systems: { ...s.systems },
    supplies: { ...s.supplies },
    astronauts: s.astronauts.map((a) => ({
      id: a.id,
      callSign: a.callSign,
      sickBaySols: a.sickBaySols,
      busy: s.sol > 0 && a.busyUntilSol >= s.sol,
      plannedTask: a.plannedTask,
    })),
    crop: s.crop ? { ...s.crop } : null,
    dustStacks: s.dust.stacks,
    flags: Object.keys(s.flags).filter((f) => hasFlag(s, f)),
  };
}

/** The log of the current sol ("What happened today"). */
export function nightLog(s: GameState): LogEntry[] {
  return s.log.filter((e) => e.sol === s.sol);
}

/** T-PLAN: peek at the next deck card. */
export function peek(s: GameState): string | null {
  return hasFlag(s, 'peek') ? (s.deck[0] ?? null) : null;
}
