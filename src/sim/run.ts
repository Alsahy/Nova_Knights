/** Simulation runs + metrics for the balance report (PLAN Phase 5). Pure apart from the engine. */
import { createEngine } from '../engine';
import { CONTENT } from '../content';
import { hasCost } from '../content/check';
import { formatLog } from '../content/format';
import { makeBot, playGame } from './bots';
import type { MissionId, Tier } from '../engine/types';

export interface SimOptions {
  mission: MissionId;
  tier: Tier;
  seed: number;
  games: number;
  bot: string;
  verbose: boolean;
}

export interface BotStats {
  bot: string;
  games: number;
  success: number;
  safeReturn: number;
  broughtHome: number;
  reasons: Record<string, number>;
  avgSpBanked: number;
  avgDose: number;
  avgEvents: number;
  minEvents: number;
  maxEvents: number;
  redBadgeRate: number;
}

export interface MissionReport {
  mission: MissionId;
  tier: Tier;
  bots: BotStats[];
  variety: {
    deckEvents: number;
    seenEvents: number;
    pct: number;
    uniqueLists: number;
    games: number;
  };
  coverage: { cards: number; chosen: number; missing: string[] };
  noFreeLunch: { cards: number; withCost: number; missing: string[] };
}

const e = createEngine(CONTENT);
const SETUP = new Set(['FD-01', 'FD-04', 'MG-04']);

export function runBot(
  mission: MissionId,
  tier: Tier,
  bot: string,
  games: number,
  seedStart: number,
  coverage?: Set<string>,
): BotStats {
  const st: BotStats = {
    bot,
    games,
    success: 0,
    safeReturn: 0,
    broughtHome: 0,
    reasons: {},
    avgSpBanked: 0,
    avgDose: 0,
    avgEvents: 0,
    minEvents: Infinity,
    maxEvents: 0,
    redBadgeRate: 0,
  };
  for (let g = 0; g < games; g++) {
    const seed = seedStart + g;
    const end = playGame(
      e,
      e.newGame({ mission, tier, seed }),
      makeBot(bot, seed),
      coverage ? (_s, id) => coverage.add(id) : undefined,
    );
    const k = end.ending!.kind;
    if (k === 'success') st.success++;
    else if (k === 'safe-return') st.safeReturn++;
    else st.broughtHome++;
    st.reasons[end.ending!.reason] = (st.reasons[end.ending!.reason] ?? 0) + 1;
    st.avgSpBanked += end.sp.banked;
    st.avgDose += end.crew.DOSE;
    if (end.crew.DOSE >= 7) st.redBadgeRate++;
    const events = end.played.filter((id) => !SETUP.has(id)).length;
    st.avgEvents += events;
    st.minEvents = Math.min(st.minEvents, events);
    st.maxEvents = Math.max(st.maxEvents, events);
  }
  st.avgSpBanked /= games;
  st.avgDose /= games;
  st.avgEvents /= games;
  st.redBadgeRate /= games;
  return st;
}

export function missionReport(
  mission: MissionId,
  tier: Tier,
  games: number,
  seedStart: number,
  bots: readonly string[],
): MissionReport {
  const m = CONTENT.missions[mission]!;
  const coverage = new Set<string>();
  const stats = bots.map((b) =>
    runBot(mission, tier, b, games, seedStart, b === 'bestMove' ? coverage : undefined),
  );
  // Variety: 100 games of the random bot.
  const lists = new Set<string>();
  const seen = new Set<string>();
  for (let g = 0; g < 100; g++) {
    const end = playGame(
      e,
      e.newGame({ mission, tier, seed: seedStart + 50_000 + g }),
      makeBot('random', g),
    );
    lists.add(end.played.join(','));
    end.played.forEach((id) => seen.add(id));
  }
  const scope = m.events.filter((id) => CONTENT.events[id]);
  // Card coverage: the cards a Cadet can be shown in this mission's scope.
  const shownCards = scope.flatMap((id) => {
    const ev = CONTENT.events[id]!;
    const cadet = ev.actions.filter((a) => a.cadet);
    if (id === 'FD-01')
      return ev.actions.filter((a) => a.letter === 'a' || a.letter === 'c').map((a) => a.id);
    return (tier === 'cadet' ? cadet : ev.actions).map((a) => a.id);
  });
  const allScopeCards = scope.flatMap((id) => CONTENT.events[id]!.actions);
  const withCost = allScopeCards.filter(hasCost);
  return {
    mission,
    tier,
    bots: stats,
    variety: {
      deckEvents: scope.length,
      seenEvents: scope.filter((id) => seen.has(id)).length,
      pct: Math.round((100 * scope.filter((id) => seen.has(id)).length) / scope.length),
      uniqueLists: lists.size,
      games: 100,
    },
    coverage: {
      cards: shownCards.length,
      chosen: shownCards.filter((id) => coverage.has(id)).length,
      missing: shownCards.filter((id) => !coverage.has(id)),
    },
    noFreeLunch: {
      cards: allScopeCards.length,
      withCost: withCost.length,
      missing: allScopeCards.filter((a) => !hasCost(a)).map((a) => a.id),
    },
  };
}

/** Classic one-bot run (npm run sim -- --verbose). */
export function runSim(o: SimOptions): string[] {
  const out: string[] = [];
  const tally: Record<string, number> = {};
  for (let g = 0; g < o.games; g++) {
    const seed = o.seed + g;
    const end = playGame(
      e,
      e.newGame({ mission: o.mission, tier: o.tier, seed }),
      makeBot(o.bot, seed),
    );
    const key = `${end.ending!.kind} (${end.ending!.reason})`;
    tally[key] = (tally[key] ?? 0) + 1;
    if (o.verbose) {
      let sol = -1;
      for (const l of end.log) {
        if (l.sol !== sol) {
          sol = l.sol;
          out.push(`── sol ${sol} ──`);
        }
        out.push(`  [${l.kind}] ${formatLog(l)}`);
      }
      const d = e.debrief(end)!;
      out.push(
        `ENDING: ${d.ending.kind} · ${formatLog({ sol: end.sol, kind: 'ending', key: d.ending.reason })}`,
      );
      out.push(
        `  SP sent ${d.stats.spBanked}/${d.stats.spGoal} (pending ${d.stats.spPending}) · badge ${d.stats.dose} · sols ${d.stats.sols}`,
      );
      for (const t of d.top3)
        out.push(
          `  big choice: sol ${t.choice.sol} ${t.eventTitle} → "${t.actionTitle}" · ${t.lesson} [${t.sources.join(', ')}]`,
        );
    }
  }
  out.push(`${o.mission} ${o.tier} · bot ${o.bot} · ${o.games} game(s) from seed ${o.seed}:`);
  for (const [k, v] of Object.entries(tally).sort())
    out.push(`  ${k}: ${v} (${Math.round((100 * v) / o.games)}%)`);
  return out;
}
