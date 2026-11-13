/**
 * simulate (lane E). Phase 2: random + balanced bots. Phase 5 adds the full bot set + docs/balance-report.md.
 * Usage: npm run sim -- --mission M1 --tier cadet --seed 42 --games 1 --bot random --verbose
 */
import { runSim } from '../src/sim/run';
import type { MissionId, Tier } from '../src/engine/types';

const args = process.argv.slice(2);
const get = (k: string, d: string): string => {
  const i = args.indexOf(`--${k}`);
  return i >= 0 && args[i + 1] && !args[i + 1]!.startsWith('--') ? args[i + 1]! : d;
};
const lines = runSim({
  mission: get('mission', 'M1') as MissionId,
  tier: get('tier', 'cadet') as Tier,
  seed: Number(get('seed', '42')),
  games: Number(get('games', '1')),
  bot: get('bot', 'random'),
  verbose: args.includes('--verbose'),
});
console.log(lines.join('\n'));
