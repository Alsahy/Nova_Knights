import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  citedSourceIds,
  GUIDE_PATH,
  OUT_PATH,
  parseSpec,
  render,
  SPEC_PATH,
} from '../../scripts/spec-extract';

const md = readFileSync(SPEC_PATH, 'utf8');
const spec = parseSpec(md, readFileSync(GUIDE_PATH, 'utf8'));

describe('spec-extract v0', () => {
  it('finds exactly 60 events with unique IDs', () => {
    expect(spec.events).toHaveLength(60);
    expect(new Set(spec.events.map((e) => e.id)).size).toBe(60);
  });

  it('has the expected count per system prefix', () => {
    const count = (p: string) => spec.events.filter((e) => e.id.startsWith(p)).length;
    expect([
      count('SW'),
      count('PW'),
      count('LS'),
      count('FD'),
      count('CR'),
      count('RS'),
      count('CM'),
      count('MG'),
    ]).toEqual([10, 10, 11, 7, 8, 7, 3, 4]);
  });

  it('every event has a deck type and a tier', () => {
    for (const e of spec.events) {
      expect(e.deck.length, e.id).toBeGreaterThan(0);
      expect(['cadet', 'commander']).toContain(e.tier);
    }
  });

  it('applies approved decisions (D-015: LS-02 is Cadet)', () => {
    expect(spec.events.find((e) => e.id === 'LS-02')?.tier).toBe('cadet');
    expect(spec.specVersion).toBe('0.4');
  });

  it('every [S#] cited in the spec exists in §11', () => {
    const ids = new Set(spec.sources.map((s) => s.id));
    const missing = citedSourceIds(md).filter((id) => !ids.has(id));
    expect(missing).toEqual([]);
  });

  it('every source has a title and an https URL', () => {
    expect(spec.sources.length).toBeGreaterThanOrEqual(60);
    for (const s of spec.sources) {
      expect(s.title.length, s.id).toBeGreaterThan(3);
      expect(s.url, s.id).toMatch(/^https:\/\//);
    }
  });

  it('generated spec.json is up to date (run `npm run spec:extract`)', () => {
    expect(readFileSync(OUT_PATH, 'utf8')).toBe(render(spec));
  });

  it('maps the kids guide: 60 stories in spec order, glossary words', () => {
    expect(spec.guide.stories.map((x) => x.id)).toEqual(
      spec.events.map((e) => e.id).sort((a, b) => order(a) - order(b)),
    );
    expect(spec.guide.glossary.length).toBeGreaterThanOrEqual(20);
  });
});

const PREFIX = ['SW', 'PW', 'LS', 'FD', 'CR', 'RS', 'CM', 'MG'];
function order(id: string): number {
  return PREFIX.indexOf(id.slice(0, 2)) * 100 + Number(id.slice(3));
}
