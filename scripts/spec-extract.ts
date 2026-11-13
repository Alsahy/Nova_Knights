/**
 * spec-extract v0 (lane S): events-and-actions.md → src/content/generated/spec.json
 *
 * Parses: §6 index → events[] · §7 details → details{} (raw card cells) · §4 → tasks[] (raw)
 *             §11 sources          → sources[] (id, title, url, urls)
 * Raw cells become EventDef/TaskDef in src/content/index.ts (engine notation.ts + content overrides.ts).
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

export interface SpecCard {
  id: string; // 'SW-01.a'
  letter: string;
  star: boolean; // ★ = shown in Cadet
  title: string;
  who: string;
  cost: string;
  effect: string;
  later: string;
  lesson: string;
}

export interface SpecEventDetail {
  id: string;
  title: string;
  icon: string;
  deckLine: string;
  kidText: string;
  realScience: { text: string; sources: string[] };
  notes: { label: string; text: string }[]; // Engine / Rule / Effect / Dose rule / Slot rule …
  extra: string[]; // free lines after the table, e.g. "*If PARTS = 0 → LS-02.*"
  cards: SpecCard[];
}

export interface SpecTask {
  id: string;
  title: string;
  who: string;
  cost: string;
  effect: string;
  lesson: string;
}

export interface SpecJson {
  specVersion: string;
  events: SpecEventIndex[];
  details: Record<string, SpecEventDetail>;
  tasks: SpecTask[];
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

const sourceIds = (text: string): string[] => [...text.matchAll(/\[(S\d+b?)\]/g)].map((m) => m[1]!);

export function parseEventDetails(md: string): Record<string, SpecEventDetail> {
  const out: Record<string, SpecEventDetail> = {};
  const blocks = section(md, 7)
    .split(/^#### /m)
    .slice(1);
  for (const block of blocks) {
    const lines = block.split('\n');
    const head = /^([A-Z]{2}-\d{2}) · (.+)$/.exec(lines[0]!.trim());
    if (!head) continue;
    const id = head[1]!;
    const headText = head[2]!.replace(/\*\(.*?\)\*/g, '').trim();
    // Title = text up to the trailing emoji run.
    const iconRun = /[\s\p{Extended_Pictographic}\u{FE0F}\u{200D}\u{20E3}]+$/u.exec(headText);
    const title = (iconRun ? headText.slice(0, iconRun.index) : headText).trim();
    const icon = (iconRun?.[0] ?? '').replace(/\s+/g, '');
    let deckLine = '';
    let kidText = '';
    let realScience = { text: '', sources: [] as string[] };
    const notes: { label: string; text: string }[] = [];
    const extra: string[] = [];
    const cards: SpecCard[] = [];
    let afterTable = false;
    for (const raw of lines.slice(1)) {
      const line = raw.trim();
      if (!line || line === '---' || line.startsWith('### ')) continue;
      if (line.startsWith('`deck:')) {
        deckLine = line.slice(1, line.indexOf('`', 1)).replace(/^deck:\s*/, '');
        continue;
      }
      const bullet = /^- \*\*(.+?):\*\*\s*(.*)$/.exec(line);
      if (bullet) {
        const label = bullet[1]!;
        const text = bullet[2]!;
        if (label === 'Kid text') kidText = text.replace(/^"|"$/g, '');
        else if (label === 'Real science')
          realScience = { text, sources: [...new Set(sourceIds(text))] };
        else notes.push({ label, text });
        continue;
      }
      if (line.startsWith('|')) {
        const c = cells(line);
        if (c[0] === 'Card' || /^-+$/.test(c[0] ?? '')) continue;
        const m = /^(★\s*)?([a-c])\.\s*(.+)$/.exec(c[0] ?? '');
        if (!m || c.length !== 6) throw new Error(`spec §7 ${id}: bad card row: ${line}`);
        cards.push({
          id: `${id}.${m[2]}`,
          letter: m[2]!,
          star: Boolean(m[1]),
          title: m[3]!.trim(),
          who: c[1]!,
          cost: c[2]!,
          effect: c[3]!,
          later: c[4]!,
          lesson: c[5]!,
        });
        afterTable = true;
        continue;
      }
      if (afterTable || line.startsWith('*')) extra.push(line);
    }
    if (cards.length < 2)
      throw new Error(`spec §7 ${id}: expected ≥ 2 cards, found ${cards.length}`);
    out[id] = { id, title, icon, deckLine, kidText, realScience, notes, extra, cards };
  }
  return out;
}

export function parseTasks(md: string): SpecTask[] {
  const out: SpecTask[] = [];
  for (const line of section(md, 4).split('\n')) {
    if (!/^\|\s*T-[A-Z-]+\s*\|/.test(line)) continue;
    const c = cells(line);
    if (c.length !== 6) throw new Error(`spec §4: bad task row: ${line}`);
    out.push({
      id: c[0]!,
      title: c[1]!,
      who: c[2]!,
      cost: c[3]!,
      effect: c[4]!,
      lesson: c[5]!,
    });
  }
  return out;
}

export function parseSpec(md: string): SpecJson {
  const v = /\*\*Version (\d+\.\d+)/.exec(md);
  return {
    specVersion: v?.[1] ?? 'unknown',
    events: parseEventIndex(md),
    details: parseEventDetails(md),
    tasks: parseTasks(md),
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
    `spec v${spec.specVersion}: ${spec.events.length} events, ${Object.keys(spec.details).length} details, ${spec.tasks.length} tasks, ${spec.sources.length} sources`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
