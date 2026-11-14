/** Offer an event, check card affordability (D-012), resolve a choice (spec §3, §2.3 fallback, D-006). */
import {
  CARDS_SHOWN,
  CONDITION_COOLDOWN_SOLS,
  FALLBACK_EXTRA_EN,
  FALLBACK_SUCCESS,
  SEP_CHANCE_BY_S,
  SEP_MIN_S,
  SHORT_MISSION_SOLS,
  SW04_SEP_CHANCE_TIER0,
} from './config';
import { applyEffects, multiplier, newCtx, queueEvent, type Ctx } from './effects';
import { hookBlocked } from './hooks';
import { computePower } from './power';
import { shieldTier } from './radiation';
import { chance } from './rng';
import { addModifier, changeStat, evaAllowed, hasFlag, log, notInSickBay } from './state';
import { stateValue } from './value';
import type {
  ActionDef,
  AstronautId,
  Content,
  DonkiRef,
  Effect,
  GameState,
  Pending,
  Role,
} from './types';

export interface CardCheck {
  ok: boolean;
  fallback: boolean;
  reason?: string;
  evaCount: number;
  headcount: number;
  actor?: AstronautId;
}

/** Who plays the card and how many people it uses (spec §2.3; D-017 only the roles matter). */
export function resolveActors(
  s: GameState,
  a: ActionDef,
  p: Pending | null,
  content: Content,
): CardCheck {
  const who = a.who;
  const free = notInSickBay(s).map((x) => x.id);
  const used = new Set<AstronautId>();
  let fallback = false;
  let extra = 0;
  const take = (r: Role): boolean => {
    if (free.includes(r) && !used.has(r)) {
      used.add(r);
      return true;
    }
    return false;
  };
  for (const r of who.roles)
    if (!take(r)) {
      fallback = true;
      extra += 1;
    }
  if (who.alt.length && !who.alt.some((r) => take(r))) {
    fallback = true;
    extra += 1;
  }
  if (who.name && p?.nameTarget) used.add(p.nameTarget);
  const needAny = who.any + (who.pick ? 1 : 0) + extra;
  const rest = free.filter((x) => !used.has(x));
  if (rest.length < needAny)
    return { ok: false, fallback, reason: 'reason.noCrew', evaCount: 0, headcount: 0 };
  for (let i = 0; i < needAny; i++) used.add(rest[i]!);
  const headcount = Math.max(1, used.size);
  let evaCount = 0;
  if (who.eva) {
    if (!evaAllowed(s))
      return { ok: false, fallback, reason: 'reason.indoor', evaCount: 0, headcount };
    evaCount = headcount;
  } else if (who.evaCrew) {
    const evaIds = new Set(
      Object.values(content.tasks)
        .filter((t) => t.eva)
        .map((t) => t.id),
    );
    evaCount =
      a.eventId === 'CR-04'
        ? s.counters.evaYesterday
        : s.astronauts.filter((x) => x.plannedTask && evaIds.has(x.plannedTask)).length;
  }
  const check: CardCheck = { ok: true, fallback, evaCount, headcount };
  const first = [...used][0];
  if (first) check.actor = first;
  return check;
}

function poolNeed(s: GameState, effects: Effect[], stat: 'EN' | 'AIR', c: CardCheck): number {
  return effects.reduce(
    (sum, e) =>
      sum +
      (e.kind === 'stat' && e.stat === stat && e.delta < 0
        ? -e.delta * multiplier(s, e.target, e.stat, c)
        : 0),
    0,
  );
}

export function checkCard(
  s: GameState,
  content: Content,
  a: ActionDef,
  p: Pending | null,
): CardCheck {
  const c = resolveActors(s, a, p, content);
  if (!c.ok) return c;
  const fail = (reason: string): CardCheck => ({ ...c, ok: false, reason });
  if (poolNeed(s, a.costNow, 'EN', c) + (c.fallback ? FALLBACK_EXTRA_EN : 0) > s.crew.EN)
    return fail('reason.noEnergy');
  if (poolNeed(s, a.costNow, 'AIR', c) > s.crew.AIR) return fail('reason.noAir');
  let pwr = 0;
  for (const e of a.costNow) {
    if (e.kind === 'supply' && e.delta < 0 && s.supplies[e.key] < -e.delta)
      return fail('reason.noSupply');
    if (e.kind === 'power' && e.delta < 0) pwr += -e.delta;
    if (e.kind === 'hook') {
      const r = hookBlocked(s, e.hook, e.args);
      if (r) return fail(r);
    }
  }
  if (pwr > 0 && (s.systems.BAT === 0 || pwr > computePower(s, content).available))
    return fail('reason.noPower'); // D-059: an empty battery blocks every card that uses power
  return c;
}

export interface OfferOptions {
  severity?: number;
  warningSols?: number;
  nameTarget?: AstronautId;
  donki?: DonkiRef;
}

export function offerEvent(
  s: GameState,
  content: Content,
  eventId: string,
  slot: Pending['slot'],
  o: OfferOptions = {},
): void {
  const ev = content.events[eventId];
  if (!ev) throw new Error(`unknown event ${eventId}`);
  const p: Pending = { slot, eventId, offered: [], stuck: false };
  if (o.nameTarget) p.nameTarget = o.nameTarget;
  if (o.severity !== undefined) p.severity = o.severity;
  if (o.warningSols !== undefined) p.warningSols = o.warningSols;
  if (o.donki) p.donki = o.donki;
  s.pending = p;

  const ctx = newCtx(content, eventId, { eventId, ...pickCtx(p) });
  applyEffects(s, ev.onStart, ctx);
  onStartRules(s, eventId, p, ctx);

  const visible = ev.actions.filter(
    (a) => !a.tags.includes('hiddenUnlessLS10') || hasFlag(s, 'unlock:LS-10'),
  ); // N-07
  let shown: ActionDef[];
  if (eventId === 'FD-01' && s.lastSol <= SHORT_MISSION_SOLS) {
    shown = visible.filter((a) => a.letter === 'a' || a.letter === 'c'); // D-014
  } else if (s.tier === 'cadet') {
    shown = visible.filter((a) => a.cadet).slice(0, CARDS_SHOWN.cadet);
  } else {
    shown = visible.slice(0, CARDS_SHOWN.commander);
  }
  if (!shown.some((a) => checkCard(s, content, a, p).ok)) {
    shown = [...shown, ...visible.filter((a) => !shown.includes(a))]; // D-012: reveal card c
    if (!shown.some((a) => checkCard(s, content, a, p).ok)) p.stuck = true;
  }
  p.offered = shown.map((a) => a.id);
  s.played.push(eventId);
  if (ev.deck.includes('condition')) s.cooldowns[eventId] = s.sol + CONDITION_COOLDOWN_SOLS; // D-004
  const params: Record<string, string | number> = { id: eventId };
  if (p.nameTarget) params['name'] = s.astronauts.find((x) => x.id === p.nameTarget)!.callSign;
  if (p.severity !== undefined) params['S'] = p.severity;
  log(s, 'event', slot === 'briefing' ? 'log.briefing' : 'log.event', params);
}

function pickCtx(p: Pending): Partial<Ctx> {
  const c: Partial<Ctx> = {};
  if (p.nameTarget) c.nameTarget = p.nameTarget;
  if (p.severity !== undefined) c.severity = p.severity;
  if (p.warningSols !== undefined) c.warningSols = p.warningSols;
  return c;
}

/** Event-level rules that happen when the event appears (spec "Engine" / "Auto effects" lines). */
function onStartRules(s: GameState, eventId: string, p: Pending, ctx: Ctx): void {
  if (eventId === 'SW-03') {
    // The cloud arrives in N sols (≥ 1, N-07) → SW-04.
    queueEvent(s, 'SW-04', ctx, Math.max(1, p.warningSols ?? 2), p.severity);
  }
  if (
    eventId === 'SW-04' &&
    shieldTier(s.systems.SH) === 0 &&
    chance(s.rng, SW04_SEP_CHANCE_TIER0)
  ) {
    queueEvent(s, 'SW-02', ctx, 1, p.severity); // spec SW-04 auto effect
  }
}

export function waitId(eventId: string): string {
  return `${eventId}.wait`;
}

export function timeoutId(eventId: string): string {
  return `${eventId}.timeout`;
}

/** D-027: if the 10-second timer runs out, the crew does the WORST card it could afford (all cards, not just the shown ones). */
export function timeoutChoice(s: GameState, content: Content): string | null {
  const p = s.pending;
  if (!p || p.slot !== 'event') return null;
  const ev = content.events[p.eventId]!;
  const scope = content.missions[s.mission]?.events;
  const candidates = ev.actions.filter(
    (a) =>
      (!a.tags.includes('hiddenUnlessLS10') || hasFlag(s, 'unlock:LS-10')) &&
      checkCard(s, content, a, p).ok,
  );
  let worst: string | null = null;
  let worstV = Infinity;
  for (const a of candidates) {
    const t = JSON.parse(JSON.stringify(s)) as GameState;
    t.pending!.offered = ev.actions.map((x) => x.id);
    if (!resolveChoice(t, content, a.id)) continue;
    const v = stateValue(t);
    if (v < worstV) {
      worstV = v;
      worst = a.id;
    }
  }
  void scope;
  return worst;
}

/** Resolve the player's choice for s.pending. Returns false if the choice is not allowed (state unchanged). */
export function resolveChoice(s: GameState, content: Content, actionId: string): boolean {
  const p = s.pending;
  if (!p) return false;
  const ev = content.events[p.eventId]!;
  if (actionId === waitId(p.eventId)) {
    if (!p.stuck) return false;
    s.queue.push({ eventId: p.eventId, dueSol: s.sol + 1, sinceSol: s.sol + 1, source: 'stuck' }); // D-012
    log(s, 'warning', 'log.cantFix', { id: p.eventId });
    s.choices.push({
      sol: s.sol,
      eventId: p.eventId,
      actionId,
      deltas: {},
      causedEvents: [p.eventId],
      score: 3,
    });
    s.pending = null;
    return true;
  }
  if (actionId === timeoutId(p.eventId)) {
    const worst = timeoutChoice(s, content);
    if (!worst) return false;
    p.offered = ev.actions.map((x) => x.id); // the crew may do any card on its own
    log(s, 'warning', 'log.timeout', { id: worst });
    return resolveChoice(s, content, worst);
  }
  if (!p.offered.includes(actionId)) return false;
  const a = ev.actions.find((x) => x.id === actionId);
  if (!a) return false;
  const c = checkCard(s, content, a, p);
  if (!c.ok) return false;

  const ctx = newCtx(content, actionId, {
    eventId: p.eventId,
    evaCount: c.evaCount,
    headcount: c.headcount,
    ...pickCtx(p),
  });
  if (c.actor) ctx.actor = c.actor;
  applyEffects(s, a.costNow, ctx);
  let works = true;
  if (c.fallback) {
    changeStat(s, 'EN', -FALLBACK_EXTRA_EN);
    works = chance(s.rng, FALLBACK_SUCCESS); // spec §2.3: costs are paid even if it fails (D-006)
    if (!works) log(s, 'warning', 'log.fallbackFailed', { id: actionId });
  }
  if (works) {
    applyEffects(s, a.effects, ctx);
    if (a.tags.includes('repair') && hasFlag(s, 'repairsDouble')) {
      applyEffects(
        s,
        a.effects.filter((e) => e.kind === 'system' && e.delta > 0),
        ctx,
      ); // MG-02.b
    }
    for (const d of a.later) {
      if (d.inSols <= 0) {
        if (d.chance === undefined || chance(s.rng, d.chance)) applyEffects(s, d.effects, ctx);
      } else {
        const item: GameState['scheduled'][number] = {
          id: s.nextId++,
          dueSol: s.sol + d.inSols,
          effects: d.effects,
          source: actionId,
        };
        if (d.chance !== undefined) item.chance = d.chance;
        if (p.nameTarget) item.nameTarget = p.nameTarget;
        s.scheduled.push(item);
      }
    }
  }
  afterChoiceRules(s, p, actionId, ctx);
  const score =
    Object.entries(ctx.deltas).reduce(
      (sum, [k, v]) =>
        sum +
        Math.abs(v) * (k === 'DOSE' ? 3 : k === 'FOOD' || k === 'EN' || k === 'AIR' ? 0.5 : 1),
      0,
    ) +
    3 * ctx.caused.length;
  s.choices.push({
    sol: s.sol,
    eventId: p.eventId,
    actionId,
    deltas: ctx.deltas,
    causedEvents: ctx.caused,
    score,
  });
  log(s, 'choice', 'log.choice', { id: actionId });
  s.pending = null;
  return true;
}

/** Event-level rules that happen after the choice (spec SW-01 "Engine" line). */
function afterChoiceRules(s: GameState, p: Pending, actionId: string, ctx: Ctx): void {
  if (p.eventId === 'SW-01') {
    const S = p.severity ?? 1;
    if (chance(s.rng, SEP_CHANCE_BY_S[S] ?? 0)) {
      log(s, 'warning', 'log.sepFollows', { S });
      if (hasFlag(s, 'evaRace') && s.counters.evaToday > 0) changeStat(s, 'DOSE', S); // SW-01.b
      addModifier(s, 'sepToday', S, 'SW-01', s.sol, 1); // D-027: crews that go outside later today get hit
      queueEvent(s, 'SW-02', ctx, 1, Math.max(SEP_MIN_S, S));
    }
  }
  void actionId;
}
