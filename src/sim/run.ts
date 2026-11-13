/** Run games headless and print a readable log (npm run sim). */
import { createEngine } from '../engine';
import { CONTENT } from '../content';
import { formatLog } from '../content/format';
import { balancedBot, playGame, randomBot, type Bot } from './bots';
import type { MissionId, Tier } from '../engine/types';

export interface SimOptions {
  mission: MissionId;
  tier: Tier;
  seed: number;
  games: number;
  bot: string;
  verbose: boolean;
}

export function makeBot(name: string, seed: number): Bot {
  return name === 'balanced' ? balancedBot() : randomBot(seed);
}

export function runSim(o: SimOptions): string[] {
  const e = createEngine(CONTENT);
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
