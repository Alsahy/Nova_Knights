/**
 * spec-extract v0 (lane S): events-and-actions.md → src/content/generated/spec.json
 *
 * v0 parses:  §6 event index table → events[] (id, name, system, deck, missions, tier)
 *             §11 sources          → sources[] (id, title, url, urls)
 * Phase 3 extends it to the §7 card tables and §4 tasks.
 *
 * Run: npm run spec:extract   (never hand-edit the generated file)
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export type DeckType = 'core' | 'mission' | 'chain' | 'condition' | 'timer' | 'donki' | 'setup';

export interface SpecEventIndex {
  id: string;
  name: string;
  system: string;
  deck: DeckType[];
  deckRaw: string;
  missions: string[] | 'all';
  missionsRaw: string;
  tier: 'cadet' | 'commander';
  tierRaw: string;
}

export interface SpecSource {
  id: string; // 'S1', 'S31b'
  title: string;
  url: string; // first URL
  urls: string[];
}

export interface SpecJson {
  specVersion: string;
  events: SpecEventIndex[];
  sources: SpecSource[];
}

const DECK_EMOJI: [string, DeckType][] = [
  ['🟢', 'core'],
  ['🎯', 'mission'],
  ['🔗', 'chain'],
  ['⚠️', 'condition'],
  ['📅', 'timer'],
  ['☀️', 'donki'],
  ['🚀', 'setup'],
];

/** Return the text of a `## N. Title` section (up to the next `## `). */
export function section(md: string, num: number): string {
  const re = new RegExp(`^## ${num}\\. .*$`, 'm');
  const m = re.exec(md);
  if (!m) throw new Error(`spec: section §${num} not found`);
  const rest = md.slice(m.index + m[0].length);
  const end = rest.search(/^## /m);
  return end === -1 ? rest : rest.slice(0, end);
}

function cells(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim());
}

export function parseEventIndex(md: string): SpecEventIndex[] {
  const lines = section(md, 6).split('\n');
  const out: SpecEventIndex[] = [];
  for (const line of lines) {
    if (!/^\|\s*[A-Z]{2}-\d{2}\s*\|/.test(line)) continue;
    const c = cells(line);
    if (c.length !== 6) throw new Error(`spec §6: expected 6 cells, got ${c.length}: ${line}`);
    const [id, name, system, deckRaw, missionsRaw, tierRaw] = c as [
      string,
      string,
      string,
      string,
      string,
      string,
    ];
    const deck = DECK_EMOJI.filter(([e]) => deckRaw.includes(e)).map(([, t]) => t);
    if (deck.length === 0) throw new Error(`spec §6: no deck tag for ${id}`);
    const missionIds = missionsRaw.match(/M\d/g) ?? [];
    const missions: string[] | 'all' = /^all\b/i.test(missionsRaw)
      ? 'all'
      : [...new Set(missionIds)];
    const tier = /^cadet/i.test(tierRaw) ? 'cadet' : 'commander';
    out.push({ id, name, system, deck, deckRaw, missions, missionsRaw, tier, tierRaw });
  }
  return out;
}

export function parseSources(md: string): SpecSource[] {
  const out: SpecSource[] = [];
  for (const line of section(md, 11).split('\n')) {
    const m = /^- \[(S\d+b?)\]\s+(.*)$/.exec(line.trim());
    if (!m) continue;
    const [, id, rest] = m as unknown as [string, string, string];
    const urls = rest.match(/https?:\/\/[^\s)]+/g) ?? [];
    if (urls.length === 0) throw new Error(`spec §11: no URL for ${id}`);
    const firstUrl = urls[0]!;
    const title = rest
      .slice(0, rest.indexOf(firstUrl))
      .replace(/\s*[–-]\s*$/, '')
      .trim();
    out.push({ id, title, url: firstUrl, urls });
  }
  return out;
}

export function parseSpec(md: string): SpecJson {
  const v = /\*\*Version (\d+\.\d+)/.exec(md);
  return {
    specVersion: v?.[1] ?? 'unknown',
    events: parseEventIndex(md),
    sources: parseSources(md),
  };
}

/** Every `[S#]` id cited anywhere in the spec (including grouped ones like [S54][S44]). */
export function citedSourceIds(md: string): string[] {
  return [...new Set([...md.matchAll(/\[(S\d+b?)\]/g)].map((m) => m[1]!))];
}

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const SPEC_PATH = resolve(ROOT, 'events-and-actions.md');
export const OUT_PATH = resolve(ROOT, 'src/content/generated/spec.json');

export function render(spec: SpecJson): string {
  return JSON.stringify(spec, null, 2) + '\n';
}

function main(): void {
  const spec = parseSpec(readFileSync(SPEC_PATH, 'utf8'));
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, render(spec));
  console.log(
    `spec v${spec.specVersion}: ${spec.events.length} events, ${spec.sources.length} sources → ${OUT_PATH}`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
