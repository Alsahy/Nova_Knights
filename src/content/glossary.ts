/** Word helper (kids guide) + aliases so science words get a tap-to-explain tooltip (spec §1.1 rule 5). */
import spec from './generated/spec.json';

export interface Term {
  word: string;
  meaning: string;
}

export const GLOSSARY: Term[] = spec.guide.glossary;

/** Words that appear in card text → the guide entry that explains them. */
const ALIASES: Record<string, string> = {
  sol: 'Sol',
  sols: 'Sol',
  rover: 'Rover',
  lander: 'Lander',
  radiation: 'Radiation',
  'radiation badge': 'Radiation badge',
  'solar flare': 'Solar flare',
  flare: 'Solar flare',
  cme: 'Sun cloud (CME)',
  'giant cloud': 'Sun cloud (CME)',
  'dust storm': 'Dust storm',
  'co₂': 'CO₂',
  oxygen: 'Oxygen',
  'splitting water': 'Splitting water',
  recycler: 'Recycler',
  perchlorate: 'Perchlorate',
  marsquake: 'Marsquake',
  crater: 'Crater',
  spacewalk: 'Spacewalk',
  'sick bay': 'Sick Bay',
  'mission control': 'Mission Control',
  moxie: 'MOXIE',
  pollinate: 'Pollinate',
};

export function termFor(phrase: string): Term | undefined {
  const w = ALIASES[phrase.toLowerCase()];
  return w ? GLOSSARY.find((t) => t.word === w) : undefined;
}

/** Split text into plain parts and glossary terms (first match of each term only). */
export function markTerms(text: string): (string | (Term & { shown: string }))[] {
  const keys = Object.keys(ALIASES).sort((a, b) => b.length - a.length);
  const re = new RegExp(
    `\\b(${keys.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`,
    'gi',
  );
  const out: (string | (Term & { shown: string }))[] = [];
  const used = new Set<string>();
  let last = 0;
  for (const m of text.matchAll(re)) {
    const t = termFor(m[0]);
    if (!t || used.has(t.word)) continue;
    used.add(t.word);
    out.push(text.slice(last, m.index), { ...t, shown: m[0] });
    last = (m.index ?? 0) + m[0].length;
  }
  out.push(text.slice(last));
  return out.filter((p) => p !== '');
}
